"use strict";

const fs = require("fs");
const child_process = require("child_process");
const path = require("path");
const esbuild = require('esbuild');

const shouldBeCompiled = file => {
	if (file.includes('node_modules/')) return false;
	if (file.endsWith('.tsx')) return true;
	if (file.endsWith('.ts')) return !(file.endsWith('.d.ts') || file.includes('global'));
	return false;
};

// Restrict discovery to source trees; generated output and saved patches are not inputs.
const sourceRoots = ['config', 'data', 'dev-tools', 'lib', 'server', 'sim', 'tools', 'translations'];
const excludedDirectories = new Set(['node_modules', 'dist', 'logs', 'databases', 'artifacts', 'backups']);
const findFilesForPath = directory => {
	const out = [];
	for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
		if (entry.name.startsWith('.') || excludedDirectories.has(entry.name)) continue;
		const file = path.join(directory, entry.name);
		// stat preserves support for private source trees linked into server/chat-plugins.
		if (entry.isDirectory() || (entry.isSymbolicLink() && fs.statSync(file).isDirectory())) {
			out.push(...findFilesForPath(file));
		} else if (shouldBeCompiled(file)) {
			out.push(file);
		}
	}
	return out;
};

exports.transpile = (force = false, decl = false) => {
	const started = Date.now();
	const entryPoints = sourceRoots.filter(root => fs.existsSync(root)).flatMap(findFilesForPath);
	const jsonFiles = [];
	const scanJSON = dir => {
		for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
			const file = path.join(dir, entry.name);
			if (entry.isDirectory()) scanJSON(file); else if (file.endsWith('.json')) jsonFiles.push(file);
		}
	};
	scanJSON('data');
	const inputs = [...entryPoints, ...jsonFiles, 'config/config-example.js', 'tsconfig.json', 'tools/build-utils.js', 'tools/build-cache.js', 'build', 'package-lock.json'];
	// Compiler upgrades and options invalidate cached output, even without source edits.
	inputs.push(require.resolve('esbuild/package.json'));
	require('./build-cache').run(inputs, force || decl, (stage, changed) => {
		const allInputs = [...entryPoints, ...jsonFiles];
		const full = changed === null || changed.some(file => !allInputs.includes(file));
		const compileEntries = full ? entryPoints : entryPoints.filter(file => changed.includes(file));
		const scanned = Date.now();
		if (compileEntries.length) esbuild.buildSync({ entryPoints: compileEntries, outdir: stage, outbase: '.', format: 'cjs', tsconfig: './tsconfig.json', sourcemap: true });
		const compiled = Date.now();
		for (const file of ['config/config-example.js', ...jsonFiles].filter(file => full || changed.includes(file))) {
			const destination = path.join(stage, file);
			fs.mkdirSync(path.dirname(destination), { recursive: true });
			if (file.endsWith('.json')) {
				// Git checkout line endings must not change the runtime engine identity.
				fs.writeFileSync(destination, fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n'));
			} else {
				fs.copyFileSync(file, destination);
			}
		}
		console.log(`Build: ${compileEntries.length}/${entryPoints.length} sources; scan/wait ${scanned - started}ms, compile ${compiled - scanned}ms, assets ${Date.now() - compiled}ms.`);
		return [...entryPoints.flatMap(file => [path.join('dist', file.replace(/\.tsx?$/, '.js')), path.join('dist', file.replace(/\.tsx?$/, '.js.map'))]), ...['config/config-example.js', ...jsonFiles].map(file => path.join('dist', file))];
	});
	if (decl) exports.buildDecls();
};

exports.buildDecls = () => {
	const started = Date.now();
	child_process.execFileSync(process.execPath, ['./node_modules/typescript/bin/tsc', '-p', 'sim'], {stdio: 'inherit'});
	console.log(`Declarations: ${Date.now() - started}ms.`);
};
