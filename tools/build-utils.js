"use strict";

const fs = require("fs");
const child_process = require("child_process");
const path = require("path");
const esbuild = require('esbuild');

const copyOverDataJSON = (file = 'data') => {
	const files = fs.readdirSync(file);
	for (const f of files) {
		if (fs.statSync(`${file}/${f}`).isDirectory()) {
			copyOverDataJSON(`${file}/${f}`);
		} else if (f.endsWith('.json')) {
			fs.copyFileSync(`${file}/${f}`, require('path').resolve('dist', `${file}/${f}`));
		}
	}
};

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
	// esbuild always rebuilds all inputs; force must not enable declarations.
	const started = Date.now();
	const entryPoints = sourceRoots.filter(root => fs.existsSync(root)).flatMap(findFilesForPath);
	const scanned = Date.now();
	esbuild.buildSync({
		entryPoints,
		outdir: './dist',
		outbase: '.',
		format: 'cjs',
		tsconfig: './tsconfig.json',
		sourcemap: true,
	});
	const compiled = Date.now();
	fs.copyFileSync('./config/config-example.js', './dist/config/config-example.js');
	copyOverDataJSON();

	console.log(`Build: ${entryPoints.length} sources; scan ${scanned - started}ms, compile ${compiled - scanned}ms, assets ${Date.now() - compiled}ms.`);
	if (decl) {
		exports.buildDecls();
	}
};

exports.buildDecls = () => {
	const started = Date.now();
	child_process.execFileSync(process.execPath, ['./node_modules/typescript/bin/tsc', '-p', 'sim'], {stdio: 'inherit'});
	console.log(`Declarations: ${Date.now() - started}ms.`);
};
