/** Fresh worker per request: rebuilds become visible without reusing stale Dex caches. */
import { fork, type ForkOptions } from 'child_process';
import { createHash } from 'crypto';
import { readdirSync, readFileSync, statSync } from 'fs';
import * as path from 'path';
import { battleEngineGeneration } from './battle-engine-guard';

let active = 0;
let metadata: { key: string, value: unknown } | undefined;
let metadataPending: Promise<unknown> | undefined;
// Stat keys invalidate on normal build writes/removal/replacement; worker content
// hashes verify the actual bytes before/after the expensive metadata load.
function metadataKey() {
	const hash = createHash('sha256').update(battleEngineGeneration());
	const scan = (dir: string) => {
		for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
			const file = path.join(dir, entry.name);
			if (entry.isDirectory()) scan(file);
			else if (entry.name.endsWith('.js')) {
				const stat = statSync(file);
				hash.update(JSON.stringify([file, stat.size, stat.mtimeMs, stat.ctimeMs]));
			}
		}
	};
	for (const dir of ['sim', 'data', 'config']) scan(path.resolve(__dirname, '..', dir));
	return hash.digest('hex');
}
function buildVersion() {
	const hash = createHash('sha256');
	let latest = 0;
	const root = path.resolve(__dirname, '..');
	const scan = (dir: string) => {
		for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
			const file = path.join(dir, entry.name);
			if (entry.isDirectory()) scan(file);
			else if (entry.name.endsWith('.js')) {
				hash.update(path.relative(root, file));
				hash.update(readFileSync(file));
				latest = Math.max(latest, statSync(file).mtimeMs);
			}
		}
	};
	for (const dir of ['sim', 'data', 'config']) scan(path.join(root, dir));
	return { engine: hash.digest('hex').slice(0, 16), builtAt: new Date(latest).toISOString() };
}

export function queryCalculator(input: string): Promise<unknown> {
	if (input.length > 16000) return Promise.resolve({ error: 'Calculator request exceeds 16 KB.' });
	if (input) return queryWorker(input);
	let key: string;
	try { key = metadataKey(); } catch { return Promise.resolve({ error: 'Calculator engine build is unavailable.' }); }
	if (metadata?.key === key) return Promise.resolve(metadata.value);
	if (metadataPending) return metadataPending;
	metadataPending = queryWorker('').then(value => {
		try {
			if ((value as { version?: unknown })?.version && metadataKey() === key) metadata = { key, value };
			else if (metadataKey() !== key) return { error: 'The engine build changed. Please retry.' };
		} catch { return { error: 'Calculator engine build is unavailable.' }; }
		return value;
	}).finally(() => { metadataPending = undefined; });
	return metadataPending;
}

function queryWorker(input: string): Promise<unknown> {
	// One deduplicated metadata worker does not consume the two calculation slots.
	if (input && active >= 2) return Promise.resolve({ error: 'Calculator is busy. Please try again shortly.' });
	if (input) active++;
	return new Promise(resolve => {
		let settled = false;
		const forkOptions: ForkOptions & { windowsHide: boolean } = {
			execArgv: ['--max-old-space-size=512'], stdio: ['ignore', 'ignore', 'ignore', 'ipc'], windowsHide: true,
		};
		let child;
		try {
			child = fork(__filename, ['--custom-calculator-worker'], forkOptions);
		} catch {
			if (input) active--;
			resolve({ error: 'Calculator worker could not start.' });
			return;
		}
		const finish = (value: unknown) => {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			if (input) active--;
			child.kill();
			resolve(value);
		};
		const timer = setTimeout(() => finish({
			error: 'Calculation exceeded the 15-second limit. Reduce samples or simplify the scenario.',
		}), 15000);
		child.once('message', finish);
		child.once('error', () => finish({ error: 'Calculator worker could not start.' }));
		child.once('exit', () => finish({ error: 'Calculator worker stopped before completing the request.' }));
		try { child.send(input); } catch { finish({ error: 'Calculator worker disconnected.' }); }
	});
}

if (process.argv.includes('--custom-calculator-worker')) {
	process.once('message', (message: unknown) => {
		try {
			if (typeof message !== 'string' || message.length > 16000) throw new Error('Invalid calculator request.');
			const version = buildVersion();
			const calculator = require('../sim/custom-calculator') as typeof import('../sim/custom-calculator');
			const result = message ? calculator.calculateScenario(JSON.parse(message)) : calculator.calculatorMetadata();
			if (buildVersion().engine !== version.engine) {
				throw new Error('The engine build changed during calculation. Please retry.');
			}
			process.send?.({ ...result, version });
		} catch (error) {
			process.send?.({ error: (error as Error).message.slice(0, 300) });
		}
	});
}
