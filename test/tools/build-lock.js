'use strict';
const assert = require('assert').strict;
const fs = require('fs');
const os = require('os');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');
const {spawn} = require('child_process');
const source = process.env.BUILD_LOCK_SOURCE || path.resolve(__dirname, '../../tools/build-cache.js');
const token = 'a'.repeat(32);
function fixture() {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'showdown-build-lock-test-'));
	const cache = path.join(root, 'node_modules/.cache/showdown-build', crypto.createHash('sha256').update(root).digest('hex').slice(0, 16));
	fs.mkdirSync(cache, {recursive: true});
	return {root, lock: path.join(cache, 'lock'), cleanup() { fs.rmSync(root, {recursive: true, force: true}); }};
}
function stale(file) { fs.utimesSync(file, new Date(0), new Date(0)); }
function load(f, options = {}) {
	let now = Date.now();
	const exports = {};
	vm.runInNewContext(fs.readFileSync(source, 'utf8'), {
		exports, require(name) { return name === 'fs' ? {...fs, ...options.fs} : name === 'path' ? {...path, resolve: (...args) => path.resolve(f.root, ...args)} : require(name); },
		process: {pid: process.pid, platform: process.platform, env: process.env, cwd: () => f.root, kill: options.kill || (() => {})},
		Date: {now: () => now}, Atomics: {wait() { now += 100; if (options.onWait) options.onWait(); }}, Int32Array, SharedArrayBuffer,
	});
	return exports;
}
function directoryOwner(f, pid, ownerToken = token) {
	fs.mkdirSync(f.lock);
	const name = 'owner-' + pid + '-' + ownerToken;
	fs.writeFileSync(path.join(f.lock, name), String(pid));
	return name;
}
function dead() { throw Object.assign(new Error('dead'), {code: 'ESRCH'}); }
describe('Build lock orphan recovery', () => {
	for (const value of ['', 'not-a-pid', '-1', '9999999999999999999999']) {
		it('recovers a stale legacy record ' + JSON.stringify(value), () => {
			const f = fixture();
			try {
				fs.writeFileSync(f.lock, value); stale(f.lock);
				let ran = false;
				load(f).withLock(() => { ran = true; assert(fs.statSync(f.lock).isDirectory()); });
				assert(ran); assert(!fs.existsSync(f.lock));
			} finally { f.cleanup(); }
		});
	}
	it('allows a fresh empty legacy owner its initialization grace', () => {
		const f = fixture();
		try {
			fs.writeFileSync(f.lock, '');
			let firstRecovery = 0, waits = 0;
			const begin = Date.now();
			load(f, {onWait() { waits++; }, fs: {unlinkSync(file) {
				if (file === f.lock) { firstRecovery++; assert(firstRecovery === 1); assert(waits >= 50); }
				return fs.unlinkSync(file);
			}}}).withLock(() => {});
			assert.equal(firstRecovery, 1);
			// Fake waits advance the module clock; recovery must not happen immediately.
			assert(Date.now() - begin < 5000);
		} finally { f.cleanup(); }
	});
	it('preserves a legacy PID initialized during the grace period', () => {
		const f = fixture();
		try {
			fs.writeFileSync(f.lock, '');
			let waits = 0;
			const api = load(f, {onWait() { if (++waits === 10) fs.writeFileSync(f.lock, String(process.pid)); }});
			assert.throws(() => api.withLock(() => assert.fail('initializing owner bypassed')), /120 seconds/);
			assert.equal(fs.readFileSync(f.lock, 'utf8'), String(process.pid));
		} finally { f.cleanup(); }
	});
	it('releases its owner after callback failure', () => {
		const f = fixture();
		try {
			assert.throws(() => load(f).withLock(() => { throw new Error('build failed'); }), /build failed/);
			assert(!fs.existsSync(f.lock));
			load(f).withLock(() => {});
		} finally { f.cleanup(); }
	});
	it('recovers a dead legacy PID and an empty orphan directory', () => {
		const f = fixture();
		try {
			fs.writeFileSync(f.lock, '12345');
			load(f, {kill: dead}).withLock(() => {});
			fs.mkdirSync(f.lock); stale(f.lock);
			load(f).withLock(() => {});
			assert(!fs.existsSync(f.lock));
		} finally { f.cleanup(); }
	});
	for (const directory of [false, true]) for (const permissionDenied of [false, true]) {
		it('protects a live or possibly reused PID' + (directory ? ' directory' : ' legacy file') + (permissionDenied ? ' on EPERM' : ''), () => {
			const f = fixture();
			try {
				if (directory) directoryOwner(f, process.pid); else fs.writeFileSync(f.lock, String(process.pid)); stale(f.lock);
				const kill = permissionDenied ? () => { throw Object.assign(new Error('denied'), {code: 'EPERM'}); } : () => {};
				assert.throws(() => load(f, {kill}).withLock(() => assert.fail('live owner bypassed')), /120 seconds/);
				assert.equal(fs.readFileSync(directory ? path.join(f.lock, 'owner-' + process.pid + '-' + token) : f.lock, 'utf8'), String(process.pid));
			} finally { f.cleanup(); }
		});
	}
	it('recovers a dead directory owner', () => {
		const f = fixture();
		try {
			directoryOwner(f, 12345);
			load(f, {kill: dead}).withLock(() => {});
			assert(!fs.existsSync(f.lock));
		} finally { f.cleanup(); }
	});
	it('does not remove a new directory owner during stale-owner reclamation', () => {
		const f = fixture();
		try {
			const old = directoryOwner(f, 12345);
			const replacement = 'owner-' + process.pid + '-' + 'b'.repeat(32);
			let swapped = false;
			const kill = pid => { if (pid === 12345) dead(); };
			const wrapped = {unlinkSync(file) {
				if (!swapped && file === path.join(f.lock, old)) {
					swapped = true; fs.unlinkSync(file); fs.rmdirSync(f.lock);
					fs.mkdirSync(f.lock); fs.writeFileSync(path.join(f.lock, replacement), String(process.pid));
				}
				return fs.unlinkSync(file);
			}};
			assert.throws(() => load(f, {kill, fs: wrapped}).withLock(() => assert.fail('replacement bypassed')), /120 seconds/);
			assert(fs.existsSync(path.join(f.lock, replacement)));
		} finally { f.cleanup(); }
	});
	it('does not unlink a directory replacing a malformed legacy lock', () => {
		const f = fixture();
		try {
			fs.writeFileSync(f.lock, ''); stale(f.lock);
			let reads = 0;
			const wrapped = {readFileSync(file, ...args) {
				const value = fs.readFileSync(file, ...args);
				if (file === f.lock && ++reads === 2) {
					fs.unlinkSync(f.lock); directoryOwner(f, process.pid);
				}
				return value;
			}};
			assert.throws(() => load(f, {fs: wrapped}).withLock(() => assert.fail('replacement bypassed')), /120 seconds/);
			assert(fs.existsSync(path.join(f.lock, 'owner-' + process.pid + '-' + token)));
		} finally { f.cleanup(); }
	});
	it('preserves a live legacy file appearing immediately before publication', () => {
		const f = fixture();
		try {
			let injected = false;
			const wrapped = {existsSync(file) {
				const exists = fs.existsSync(file);
				if (file === f.lock && !exists && !injected) {
					injected = true;
					fs.writeFileSync(f.lock, String(process.pid));
					return false;
				}
				return exists;
			}};
			assert.throws(() => load(f, {fs: wrapped}).withLock(() => assert.fail('racing legacy owner bypassed')), /120 seconds/);
			assert(injected);
			assert.equal(fs.readFileSync(f.lock, 'utf8'), String(process.pid));
		} finally { f.cleanup(); }
	});
	it('serializes native competing processes recovering the same stale lock', async function () {
		this.timeout(15000);
		const f = fixture();
		try {
			fs.writeFileSync(f.lock, ''); stale(f.lock);
			const script = `const fs=require('fs'),path=require('path'); require(process.argv[1]).withLock(()=>{ const guard=path.resolve('active'); const fd=fs.openSync(guard,'wx'); fs.appendFileSync('events','start\\n'); Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,150); fs.appendFileSync('events','end\\n'); fs.closeSync(fd);fs.unlinkSync(guard); });`;
			const results = await Promise.allSettled(Array.from({length: 4}, () => new Promise((resolve, reject) => {
				const child = spawn(process.execPath, ['-e', script, source], {cwd: f.root, windowsHide: true});
				let stderr = ''; child.stderr.on('data', data => { stderr += data; });
				child.on('error', reject); child.on('exit', code => code === 0 ? resolve() : reject(new Error(stderr || 'child exit ' + code)));
			})));
			for (const result of results) if (result.status === 'rejected') throw result.reason;
			assert.equal(fs.readFileSync(path.join(f.root, 'events'), 'utf8'), 'start\nend\n'.repeat(4));
			assert(!fs.existsSync(f.lock));
		} finally { f.cleanup(); }
	});
});
