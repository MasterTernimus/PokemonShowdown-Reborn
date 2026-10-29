/** Immutable, reviewed simulator input snapshot. Server control code is outside the mechanics digest. */
import * as fs from 'fs';
import * as path from 'path';
import * as vm from 'vm';
import { builtinModules } from 'module';
import { createHash, randomBytes } from 'crypto';
export const ENGINE_ALGORITHM = 'sha256-json-canonical-runtime-files-v1';
export interface EngineIdentity {
	algorithm: string;
	mechanicsSHA256: string;
	generation: string;
}
interface PinEntry {
	file: string;
	sha256: string;
}
interface EnginePin {
	schemaVersion: number;
	algorithm: string;
	mechanicsSHA256: string;
	files: PinEntry[];
	excludedNonmechanics?: PinEntry[];
}
export interface EngineSnapshot {
	readonly identity: Readonly<EngineIdentity>;
	createStream(): any;
	validateStart(options: {
		formatid: string,
	}): void;
	assertValid(): void;
}
const sha = (data: string | Buffer) => createHash('sha256').update(data).digest('hex');
const validFile = (id: string) => /^(?:dist|node_modules)\/[a-zA-Z0-9_./-]+$/.test(id) && !id.split('/').includes('..');
export function captureEngineSnapshot(root: string, pinFile: string): EngineSnapshot {
	const pinBytes = fs.readFileSync(pinFile);
	if (pinBytes.length > 256000)
		throw new Error('Engine input manifest exceeds limit');
	const pin: EnginePin = JSON.parse(pinBytes.toString());
	if (pin.schemaVersion !== 1 || pin.algorithm !== ENGINE_ALGORITHM || !Array.isArray(pin.files) ||
		!pin.files.length || pin.files.length > 512 || !/^[a-f0-9]{64}$/.test(pin.mechanicsSHA256))
		throw new Error('Invalid engine manifest');
	const inputs = pin.files.map(entry => ({ file: entry.file, sha256: entry.sha256 }));
	if (sha(JSON.stringify(inputs)) !== pin.mechanicsSHA256)
		throw new Error('Engine manifest digest differs');
	const reviewedDisplay: {
		[id: string]: string,
	} = {
		'dist/data/ability-descriptions.js': '323ec9d14106a0fb53418dea1aabb27f4e004e6b6f2f98fdb5fcd9c3f0294d89',
		'dist/data/ability-prose-audit.js': '2bc32552a91ed9afb568e2601df9ddb108f8d50ffd7e28af73094b73a8fe495e',
		'dist/data/short-description-audit.js': '959dad25de39892b3e72ad0ffe0f22f1b8b35b89f08e834a8624080c14f7d28a',
	};
	const display = (pin.excludedNonmechanics || []).filter(e => e.file.endsWith('.js'));
	if (display.length !== 3 || display.some(e => reviewedDisplay[e.file] !== e.sha256))
		throw new Error('Unreviewed display exclusion');
	const bytes = new Map<string, Buffer>();
	for (const entry of [...inputs, ...display]) {
		if (!validFile(entry.file) || !/^[a-f0-9]{64}$/.test(entry.sha256) || bytes.has(entry.file))
			throw new Error('Invalid engine input');
		const value = fs.readFileSync(path.join(root, ...entry.file.split('/')));
		if (sha(value) !== entry.sha256)
			throw new Error('Engine input bytes differ');
		bytes.set(entry.file, value);
	}
	const actual = inputs.map(entry => ({ file: entry.file, sha256: sha(bytes.get(entry.file)!) }));
	const mechanicsSHA256 = sha(JSON.stringify(actual));
	const identity = Object.freeze({
		algorithm: ENGINE_ALGORITHM, mechanicsSHA256, generation: randomBytes(16).toString('hex'),
	});
	let invalid = false;
	const knownMods = new Set([...bytes.keys()].map(id => /^dist\/data\/mods\/([^/]+)\//.exec(id)?.[1]).filter(Boolean));
	const inheritedTables = new Set([
		'scripts',
		'abilities',
		'aliases',
		'conditions',
		'formats-data',
		'items',
		'learnsets',
		'moves',
		'natures',
		'pokedex',
		'rulesets',
		'typechart',
		'terrains',
		'pokemongo',
	]);
	const cache = new Map<string, {
		exports: any,
	}>();
	const absoluteRoot = path.resolve(root);
	function relative(filename: string) {
		const id = path.relative(absoluteRoot, path.resolve(filename)).split(path.sep).join('/');
		if (id.startsWith('../') || path.isAbsolute(id)) {
			invalid = true;
			throw new Error('Input outside engine snapshot');
		}
		return id;
	}
	function absent(id: string): never {
		const error = new Error('Unreviewed or unavailable engine dependency: ' + id);
		// Only the reviewed optional custom-formats absence is an ordinary missing module.
		const inherited = /^dist\/data\/mods\/([^/]+)\/([^/]+)$/.exec(id);
		if (id === 'dist/config/custom-formats' ||
			(inherited && knownMods.has(inherited[1]) && inheritedTables.has(inherited[2])))
			Object.assign(error, { code: 'MODULE_NOT_FOUND' });
		else
			invalid = true;
		throw error;
	}
	function resolve(request: string, parent: string): string {
		let id: string;
		if (path.isAbsolute(request))
			id = relative(request);
		else if (request.startsWith('.'))
			id = path.posix.normalize(path.posix.join(path.posix.dirname(parent), request));
		else {
			const name = request.startsWith('@') ? request.split('/').slice(0, 2).join('/') : request.split('/')[0];
			const packageId = 'node_modules/' + name;
			if (request !== name)
				id = 'node_modules/' + request;
			else {
				const meta = bytes.get(packageId + '/package.json');
				if (!meta)
					return absent(packageId);
				const main = JSON.parse(meta.toString()).main || 'index.js';
				id = path.posix.normalize(packageId + '/' + main);
			}
		}
		for (const candidate of [id, id + '.js', id + '.json', id + '/index.js'])
			if (bytes.has(candidate))
				return candidate;
		return absent(id);
	}
	const immutableFs: any = {};
	immutableFs.readFileSync = (filename: string, encoding?: any) => {
		const data = bytes.get(relative(String(filename)));
		if (!data) {
			invalid = true;
			throw new Error('Read outside reviewed snapshot inputs');
		}
		return encoding === 'utf8' || encoding?.encoding === 'utf8' ? data.toString('utf8') : Buffer.from(data);
	};
	immutableFs.existsSync = (filename: string) => bytes.has(relative(String(filename)));
	immutableFs.readdirSync = (filename: string) => {
		const prefix = relative(String(filename)).replace(/\/$/, '') + '/';
		return [...new Set([...bytes.keys()]
			.filter(id => id.startsWith(prefix))
			.map(id => id.slice(prefix.length).split('/')[0]))].sort();
	};
	// The VM has its own Dex and mutable module exports. All executable inputs come from captured bytes.
	const context: any = vm.createContext({ Buffer, console, setTimeout, clearTimeout, setInterval, clearInterval,
		setImmediate, clearImmediate, process: Object.freeze({
			env: Object.freeze({}),
			versions: process.versions, version: process.version, platform: process.platform,
			nextTick: process.nextTick, hrtime: process.hrtime, cwd: () => absoluteRoot,
		}), URL, URLSearchParams, TextEncoder, TextDecoder });
	context.global = context;
	// Only display routes are inherited. Unpinned PotD/database-driven generated teams are not enabled.
	context.Config = Object.freeze({
		routes: { dex: 'dex.pokemonshowdown.com', client: 'play.pokemonshowdown.com' },
		nofswriting: true,
	});
	const sealedFs = new Proxy(immutableFs, { get(target, key) {
		if (key in target)
			return target[key];
		if (key === '__esModule' || key === 'default' || typeof key === 'symbol')
			return undefined;
		invalid = true;
		throw new Error('Unsupported engine filesystem operation');
	} });
	const builtins = new Set([
		'fs',
		'path',
		'crypto',
		'events',
		'stream',
		'util',
		'assert',
		'buffer',
		'http',
		'https',
		'net',
		'url',
		'child_process',
		'cluster',
		'os',
		'readline',
		'timers',
		'repl',
	]);
	function load(id: string): any {
		if (cache.has(id))
			return cache.get(id)!.exports;
		const data = bytes.get(id);
		if (!data)
			return absent(id);
		if (id.endsWith('.json')) {
			const result = JSON.parse(data.toString());
			cache.set(id, { exports: result });
			return result;
		}
		if (!id.endsWith('.js'))
			throw new Error('Unsupported engine module');
		const module = { exports: {} };
		cache.set(id, module);
		const localRequire: any = (request: string) => {
			const native = request.replace(/^node:/, '');
			if (builtins.has(native))
				return native === 'fs' ? sealedFs : require(request);
			if (builtinModules.includes(native))
				return absent('builtin:' + native);
			return load(resolve(request, id));
		};
		localRequire.resolve = (request: string) => path.join(absoluteRoot, ...resolve(request, id).split('/'));
		const filename = path.join(absoluteRoot, ...id.split('/'));
		try {
			const compiled = new vm.Script(
				'(function(exports, require, module, __filename, __dirname){\n' + data.toString() + '\n})',
				{ filename }
			);
			compiled.runInContext(context)(module.exports, localRequire, module, filename, path.dirname(filename));
		} catch (error) {
			invalid = true;
			cache.delete(id);
			throw error;
		}
		return module.exports;
	}
	context.Dex = load('dist/sim/dex.js').Dex;
	context.Dex.includeModData();
	const Simulator = load('dist/sim/battle-stream.js');
	if (typeof Simulator.BattleStream !== 'function')
		throw new Error('Engine stream missing');
	if (invalid)
		throw new Error('Engine dependency closure is not reviewed');
	return Object.freeze({ identity,
		createStream() {
			if (invalid)
				throw new Error('Engine dependency closure changed'); return new Simulator.BattleStream({ keepAlive: true });
		},
		validateStart(options: {
			formatid: string,
		}) {
			if (invalid || typeof options.formatid !== 'string' || options.formatid.length > 300)
				throw new Error('Unsupported guarded format');
			const format = context.Dex.formats.get(context.Dex.formats.validate(options.formatid));
			if (!format.exists || format.team || context.Dex.formats.getRuleTable(format).has('potd'))
				throw new Error('Unsupported guarded format');
			context.Dex.forFormat(format);
			if (invalid)
				throw new Error('Engine dependency closure changed');
		},
		assertValid() {
			if (invalid)
				throw new Error('Engine dependency closure changed');
		},
	});
}
