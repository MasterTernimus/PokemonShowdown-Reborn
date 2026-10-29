/**
 * Typescript wrapper around the Python Artemis model.
 * By Mia.
 * @author mia-pi-git
 */

import * as child_process from 'child_process';
import { ProcessManager, Streams, Utils, FS } from '../../lib';
import * as ConfigLoader from '../config-loader';
import { toID } from '../../sim/dex-data';

export class ArtemisStream extends Streams.ObjectReadWriteStream<string> {
	tasks = new Map<string, NodeJS.Timeout>();
	private buffer = '';
	private process: child_process.ChildProcessWithoutNullStreams;
	constructor() {
		super();
		this.process = child_process.spawn('python3', [
			'-u', FS('server/artemis/model.py').path, Config.debugartemisprocesses ? "debug" : "",
		].filter(Boolean));
		this.listen();
	}
	listen() {
		this.process.stdout.setEncoding('utf8');
		this.process.stderr.setEncoding('utf8');
		this.process.stdout.on('data', data => this.receive(data));
		this.process.stderr.on('data', data => {
			if (/Downloading: ([0-9]+)%/i.test(data)) {
				// this prints to stderr fsr and it should not be throwing
				return;
			}
			Monitor.crashlog(new Error(data), "An Artemis process");
		});
		this.process.on('error', err => {
			Monitor.crashlog(err, "An Artemis process");
			this.destroy();
		});
		this.process.on('close', () => {
			this.destroy();
		});
	}
	receive(data: string) {
		this.buffer += data;
		if (this.buffer.length > 1024 * 1024) {
			Monitor.crashlog(new Error('Artemis response exceeds limit'), 'An Artemis process');
			this.destroy();
			return;
		}
		let end;
		while ((end = this.buffer.indexOf('\n')) !== -1) {
			const line = this.buffer.slice(0, end).trim();
			this.buffer = this.buffer.slice(end + 1);
			const [taskId, dataStr] = Utils.splitFirst(line, '|');
			if (!this.tasks.has(taskId) && taskId !== 'error') continue;
			let info;
			try {
				info = JSON.parse(dataStr);
				if (!info || typeof info !== 'object' || Array.isArray(info)) throw new Error('Invalid Artemis reply');
			} catch {
				// Keep the task pending for a valid reply or its bounded timeout.
				continue;
			}
			if (taskId === 'error') {
				Monitor.crashlog(new Error(info.error), 'An Artemis script', info);
				this.destroy();
				return;
			}
			clearTimeout(this.tasks.get(taskId));
			this.tasks.delete(taskId);
			this.push(`${taskId}\n${dataStr}`);
		}
	}
	override _write(chunk: string) {
		const [taskId, message] = Utils.splitFirst(chunk, '\n');
		this.tasks.set(taskId, setTimeout(() => this.tasks.delete(taskId), 30000));
		this.process.stdin.write(`${taskId}|${message}\n`);
	}
	override destroy() {
		for (const timer of this.tasks.values()) clearTimeout(timer);
		this.tasks.clear();
		this.buffer = '';
		try {
			this.process.kill();
		} catch {}
		this.pushEnd();
	}
}

export const PM = new ProcessManager.StreamProcessManager(
	'abusemonitor-local', module,
	() => new ArtemisStream(), message => {
		if (message.startsWith('SLOW\n')) {
			Monitor.slow(message.slice(5));
		}
	}
);

export class LocalClassifier {
	static readonly PM = PM;
	static readonly ATTRIBUTES: Record<string, unknown> = {
		sexual_explicit: {},
		severe_toxicity: {},
		toxicity: {},
		obscene: {},
		identity_attack: {},
		insult: {},
		threat: {},
	};
	static classifiers: LocalClassifier[] = [];
	static destroy() {
		for (const classifier of this.classifiers) void classifier.destroy();
		return this.PM.destroy();
	}
	/** If stream exists, model is usable */
	stream?: Streams.ObjectReadWriteStream<string>;
	enabled = false;
	requests = new Map<number, (data: any) => void>();
	lastTask = 0;
	readyPromise: Promise<boolean> | null = null;
	private destroyed = false;
	constructor() {
		LocalClassifier.classifiers.push(this);
		void this.setupProcesses();
	}
	async setupProcesses() {
		this.readyPromise = new Promise(resolve => {
			child_process.exec('python3 -c "import detoxify"', { timeout: 30000 }, (err, out, stderr) => {
				if (err || stderr) {
					resolve(false);
				} else {
					resolve(true);
				}
			});
		});
		const res = await this.readyPromise;
		if (this.destroyed) return;
		this.enabled = res;
		this.readyPromise = null;
		if (res) {
			this.stream = PM.createStream();
			void this.listen();
		}
	}
	async listen() {
		if (!this.stream) return null;
		try {
			for await (const chunk of this.stream) {
				const [rawTaskId, data] = Utils.splitFirst(chunk, '\n');
				const resolver = this.requests.get(Number(rawTaskId));
				if (!resolver) continue;
				try {
					const parsed = JSON.parse(data);
					resolver(parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null);
				} catch {
					resolver(null);
				}
			}
		} catch (error) {
			Monitor.crashlog(error as Error, 'Local Artemis classifier');
		} finally {
			this.enabled = false;
			this.stream = undefined;
			for (const resolve of this.requests.values()) resolve(null);
		}
	}
	destroy() {
		this.destroyed = true;
		const index = LocalClassifier.classifiers.indexOf(this);
		if (index !== -1) LocalClassifier.classifiers.splice(index, 1);
		this.enabled = false;
		for (const resolve of this.requests.values()) resolve(null);
		const stream = this.stream;
		this.stream = undefined;
		return stream?.destroy();
	}
	async classify(text: string) {
		if (this.readyPromise) await this.readyPromise;
		if (!this.stream) return null;
		const taskId = this.lastTask++;
		const data = await new Promise<any>(resolve => {
			const finish = (result: any) => {
				clearTimeout(timer);
				this.requests.delete(taskId);
				resolve(result);
			};
			const timer = setTimeout(() => finish(null), 30000);
			this.requests.set(taskId, finish);
			try {
				void Promise.resolve(this.stream!.write(`${taskId}\n${text}`)).catch(() => finish(null));
			} catch {
				finish(null);
			}
		});
		if (!data) return null;
		for (const k in data) {
			// floats have to be made into strings because python's json.dumps
			// doesn't like float32s
			data[k] = parseFloat(data[k]);
		}
		return data as Record<string, number>;
	}
	static start(processCount: ConfigLoader.SubProcessesConfig) {
		start(processCount);
	}
}

if (!PM.isParentProcess) {
	ConfigLoader.ensureLoaded();
	global.Monitor = {
		crashlog(error: Error, source = 'A local Artemis child process', details: AnyObject | null = null) {
			const repr = JSON.stringify([error.name, error.message, source, details]);
			process.send!(`THROW\n@!!@${repr}\n${error.stack}`);
		},
		slow(text: string) {
			process.send!(`CALLBACK\nSLOW\n${text}`);
		},
	};
	global.toID = toID;
	process.on('uncaughtException', err => {
		if (Config.crashguard) {
			Monitor.crashlog(err, 'A local Artemis child process');
		}
	});
	// eslint-disable-next-line no-eval
	PM.startRepl(cmd => eval(cmd));
}

export function start(processCount: ConfigLoader.SubProcessesConfig) {
	PM.spawn(processCount['localartemis'] ?? 1);
}
