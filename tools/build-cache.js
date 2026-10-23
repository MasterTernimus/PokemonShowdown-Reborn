'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const cacheDir = path.resolve('node_modules/.cache/showdown-build', crypto.createHash('sha256').update(process.cwd()).digest('hex').slice(0, 16));
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const sleep = ms => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
// Windows rename replaces destination files; Directory.Move refuses every existing target.
const publishLock = (source, destination) => {
	if (process.platform !== 'win32') return fs.renameSync(source, destination);
	const command = '$ErrorActionPreference = "Stop"; try { [System.IO.Directory]::Move($env:SHOWDOWN_BUILD_LOCK_SOURCE, $env:SHOWDOWN_BUILD_LOCK_DESTINATION) } catch { if (($_.Exception.InnerException.HResult -band 65535) -in 80,183) { exit 17 }; throw }';
	try {
		require('child_process').execFileSync(
			path.join(process.env.SystemRoot, 'System32/WindowsPowerShell/v1.0/powershell.exe'),
			['-NoLogo', '-NoProfile', '-NonInteractive', '-Command', command],
			{windowsHide: true, stdio: 'pipe', env: {...process.env,
				SHOWDOWN_BUILD_LOCK_SOURCE: source, SHOWDOWN_BUILD_LOCK_DESTINATION: destination}},
		);
	} catch (error) {
		if (error.status === 17) error.code = 'EEXIST';
		throw error;
	}
};
const initializationGrace = 5000;
const isAlive = pid => {
	try { process.kill(pid, 0); return true; } catch (error) {
		// Permission failures and PID reuse cannot prove an owner is dead.
		return error.code !== 'ESRCH';
	}
};
const removeDirectoryOwner = (lock, owner) => {
	try { fs.unlinkSync(path.join(lock, owner)); } catch (error) {
		if (error.code !== 'ENOENT') throw error;
	}
	try { fs.rmdirSync(lock); } catch (error) {
		// Another builder may already own a new, nonempty directory here.
		if (!['ENOENT', 'ENOTEMPTY', 'EEXIST'].includes(error.code)) throw error;
	}
};
const recoverLock = lock => {
	try {
		const before = fs.lstatSync(lock);
		if (before.isDirectory()) {
			const owners = fs.readdirSync(lock);
			if (!owners.length) {
				if (Date.now() - before.mtimeMs >= initializationGrace) {
					try { fs.rmdirSync(lock); } catch (error) {
						if (!['ENOENT', 'ENOTEMPTY', 'EEXIST'].includes(error.code)) throw error;
					}
				}
				return;
			}
			if (owners.length !== 1) return;
			const match = /^owner-([1-9][0-9]*)-[a-f0-9]{32}$/.exec(owners[0]);
			if (match && !isAlive(Number(match[1]))) removeDirectoryOwner(lock, owners[0]);
			return;
		}
		if (!before.isFile()) return;
		// Migrate legacy file locks without unlinking a new directory owner.
		const contents = fs.readFileSync(lock, 'utf8');
		const pid = /^[1-9][0-9]*$/.test(contents) ? Number(contents) : 0;
		if (Number.isSafeInteger(pid) && pid <= 2147483647 && pid > 0) {
			if (isAlive(pid)) return;
		} else if (Date.now() - before.mtimeMs < initializationGrace) {
			return;
		}
		const after = fs.lstatSync(lock);
		if (!after.isFile() || before.dev !== after.dev || before.ino !== after.ino ||
			before.mtimeMs !== after.mtimeMs || before.size !== after.size ||
			fs.readFileSync(lock, 'utf8') !== contents) return;
		try { fs.unlinkSync(lock); } catch (error) {
			if (!['ENOENT', 'EISDIR', 'EPERM', 'EACCES'].includes(error.code)) throw error;
		}
	} catch (error) {
		if (!['ENOENT', 'EISDIR', 'ENOTDIR'].includes(error.code)) throw error;
	}
};
exports.withLock = callback => {
	fs.mkdirSync(cacheDir, { recursive: true });
	const lock = path.join(cacheDir, 'lock');
	const token = crypto.randomBytes(16).toString('hex');
	const owner = 'owner-' + process.pid + '-' + token;
	const staging = fs.mkdtempSync(path.join(cacheDir, 'lock-owner-'));
	const started = Date.now();
	let acquired = false;
	try {
		// Publish a complete nonempty directory: no visible half-written PID.
		fs.writeFileSync(path.join(staging, owner), String(process.pid));
		for (;;) {
			if (fs.existsSync(lock)) {
				recoverLock(lock);
				if (Date.now() - started > 120000) throw new Error('Another build still owns the build lock after 120 seconds. No output was changed.');
				sleep(100);
				continue;
			}
			try {
				publishLock(staging, lock);
				acquired = true;
				break;
			} catch (error) {
				if (!['EEXIST', 'ENOTEMPTY', 'EISDIR', 'ENOTDIR', 'EPERM', 'EACCES'].includes(error.code)) throw error;
				recoverLock(lock);
				if (Date.now() - started > 120000) throw new Error('Another build still owns the build lock after 120 seconds. No output was changed.');
				sleep(100);
			}
		}
		return callback();
	} finally {
		if (acquired) removeDirectoryOwner(lock, owner);
		else fs.rmSync(staging, { recursive: true, force: true });
	}
};
exports.run = (inputs, force, compile) => exports.withLock(() => {
	const cacheFile = path.join(cacheDir, 'receipt.json');
	const inputRows = inputs.sort().map(file => [file, hash(file)]);
	const fingerprint = crypto.createHash('sha256').update(JSON.stringify(inputRows)).digest('hex');
	let previous;
	try { previous = JSON.parse(fs.readFileSync(cacheFile, 'utf8')); } catch {}
	const outputsValid = previous?.outputs.every(row => fs.existsSync(row.path) && hash(row.path) === row.hash);
	if (!force && previous?.fingerprint === fingerprint && outputsValid) {
		console.log('Build: verified cache; source and output hashes match.'); return;
	}
	const stage = fs.mkdtempSync(path.join(cacheDir, 'stage-'));
	if (!path.resolve(stage).startsWith(cacheDir + path.sep)) throw new Error('Invalid build staging directory.');
	try {
		const oldInputs = new Map(previous?.inputs || []);
		const changed = inputRows.filter(([file, value]) => oldInputs.get(file) !== value).map(([file]) => file);
		const expected = compile(stage, force || !outputsValid || !previous?.inputs ? null : changed);
		const outputs = (previous?.outputs || []).filter(row => expected.includes(row.path));
		const publish = dir => {
			for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
				const source = path.join(dir, entry.name);
				if (entry.isDirectory()) { publish(source); continue; }
				const destination = path.join('dist', path.relative(stage, source));
				fs.mkdirSync(path.dirname(destination), { recursive: true });
				let bytes = fs.readFileSync(source);
				if (source.endsWith('.js.map')) {
					const map = JSON.parse(bytes.toString());
					map.sources = map.sources.map(name => path.relative(path.dirname(path.resolve(destination)), path.resolve(path.dirname(source), name)).split(path.sep).join('/'));
					bytes = Buffer.from(JSON.stringify(map));
				}
				const digest = crypto.createHash('sha256').update(bytes).digest('hex');
				if (!fs.existsSync(destination) || hash(destination) !== digest) {
					const temporary = destination + '.build-' + process.pid;
					fs.writeFileSync(temporary, bytes); fs.renameSync(temporary, destination);
				}
				const row = { path: destination, hash: digest };
				const index = outputs.findIndex(item => item.path === destination);
				if (index < 0) outputs.push(row); else outputs[index] = row;
			}
		};
		publish(stage);
		const current = new Set(outputs.map(row => row.path));
		for (const old of previous?.outputs || []) {
			const resolved = path.resolve(old.path), base = path.resolve('dist') + path.sep;
			if (!resolved.startsWith(base)) throw new Error('Invalid cached output path.');
			if (!current.has(old.path) && fs.existsSync(resolved)) fs.unlinkSync(resolved);
		}
		const tempReceipt = cacheFile + '.' + process.pid;
		fs.writeFileSync(tempReceipt, JSON.stringify({ fingerprint, inputs: inputRows, outputs })); fs.renameSync(tempReceipt, cacheFile);
	} finally {
		fs.rmSync(stage, { recursive: true, force: true });
	}
});
