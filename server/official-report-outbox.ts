/** Durable official result delivery. Credentials remain operator-provisioned. */
import { promises as fs, constants as fsConstants } from 'fs';
import * as path from 'path';
import { createHmac, randomBytes } from 'crypto';

interface Report {
	body: string;
	attempts: number;
	nextAttempt: number;
	blocked?: string;
}
interface Options {
	directory: string;
	legacyDirectory?: string;
	url?: string;
	secret?: string;
	mode?: string;
	fetch?: typeof fetch;
	warn?: (message: string) => void;
	timeoutMs?: number;
}

export class OfficialReportOutbox {
	private timer?: NodeJS.Timeout;
	private draining = false;
	private stopped = false;
	private writes = new Map<string, Promise<void>>();
	private prepared?: Promise<void>;
	private options: Options;
	constructor(options: Options) { this.options = options; }
	private async prepareDirectory() {
		if (!this.prepared) {
			this.prepared = (async () => {
				await fs.mkdir(this.options.directory, { recursive: true });
				const legacy = this.options.legacyDirectory;
				if (!legacy || path.resolve(legacy) === path.resolve(this.options.directory)) return;
				let names: string[];
				try {
					names = await fs.readdir(legacy);
				} catch (error: any) {
					if (error.code === 'ENOENT') return;
					throw error;
				}
				for (const name of names) {
					if (!/^battle-[a-z0-9-]+\.json$/.test(name)) continue;
					const source = path.join(legacy, name);
					const target = path.join(this.options.directory, name);
					const temporary = `${target}.${randomBytes(6).toString('hex')}.tmp`;
					try {
						// Copy across mounts, then publish the complete destination file atomically.
						// Linking within the destination directory never overwrites an existing report.
						await fs.copyFile(source, temporary, fsConstants.COPYFILE_EXCL);
						try {
							await fs.link(temporary, target);
						} catch (error: any) {
							if (error.code !== 'EEXIST') throw error;
							if (!(await fs.readFile(temporary)).equals(await fs.readFile(target))) {
								this.warn(`Official report ${name}: conflicting legacy queue file retained at ${source}; operator review required.`);
								continue;
							}
						}
						// The complete copy exists; an interrupted migration can safely resume.
						await fs.unlink(source);
					} finally {
						await fs.unlink(temporary).catch(() => {});
					}
				}
			})().catch(error => {
				this.prepared = undefined;
				throw error;
			});
		}
		await this.prepared;
	}
	private file(roomid: string) {
		if (!/^battle-[a-z0-9-]+$/.test(roomid)) throw new Error('Invalid official battle room ID');
		return path.join(this.options.directory, `${roomid}.json`);
	}
	private async write(file: string, report: Report) {
		const temporary = `${file}.${randomBytes(6).toString('hex')}.tmp`;
		try {
			await fs.writeFile(temporary, JSON.stringify(report), { mode: 0o600 });
			await fs.rename(temporary, file);
		} finally {
			await fs.unlink(temporary).catch(() => {});
		}
	}
	async enqueue(payload: { roomid: string }) {
		const file = this.file(payload.roomid);
		const existing = this.writes.get(file);
		if (existing) return existing;
		const write = (async () => {
			await this.prepareDirectory();
			try {
				await fs.access(file);
				return;
			} catch (error: any) {
				if (error.code !== 'ENOENT') throw error;
			}
			await this.write(file, { body: JSON.stringify(payload), attempts: 0, nextAttempt: 0 });
		})();
		this.writes.set(file, write);
		try { await write; } finally { this.writes.delete(file); }
		this.start();
	}
	start() {
		this.stopped = false;
		if (this.timer || this.draining) return;
		this.timer = setTimeout(() => {
			this.timer = undefined;
			void this.drain().catch(error => this.warn(`Official report queue: ${error.message}`)).finally(() => {
				if (!this.stopped) this.start();
			});
		}, 1000);
		this.timer.unref();
	}
	stop() {
		this.stopped = true;
		if (this.timer) clearTimeout(this.timer);
		this.timer = undefined;
	}
	private warn(message: string) { this.options.warn?.(message); }
	async drain() {
		if (this.draining) return;
		this.draining = true;
		try {
			await this.prepareDirectory();
			for (const name of await fs.readdir(this.options.directory)) {
				if (!/^battle-[a-z0-9-]+\.json$/.test(name)) continue;
				const file = path.join(this.options.directory, name);
				let report: Report;
				try { report = JSON.parse(await fs.readFile(file, 'utf8')); } catch {
					this.warn(`Official report ${name}: invalid queue file; retained for recovery.`);
					continue;
				}
				if (!report || typeof report.body !== 'string' || !Number.isSafeInteger(report.attempts) ||
					report.attempts < 0 || !Number.isFinite(report.nextAttempt)) {
					this.warn(`Official report ${name}: invalid queue record; retained for recovery.`);
					continue;
				}
				if (report.blocked || report.nextAttempt > Date.now()) continue;
				const mode = this.options.mode || 'legacy';
				if (mode !== 'legacy' && mode !== 'authenticated') throw new Error('Invalid official report delivery mode');
				if (mode === 'authenticated' && !this.options.secret) throw new Error('Official report signing secret is missing');
				const url = this.options.url || 'https://leaf-bot-production.up.railway.app/officialLogs';
				if (new URL(url).protocol !== 'https:') throw new Error('Official report endpoint must use HTTPS');
				const headers: Record<string, string> = { 'Content-Type': 'application/json' };
				if (this.options.secret) {
					const timestamp = String(Math.floor(Date.now() / 1000));
					headers['x-leaf-timestamp'] = timestamp;
					headers['x-leaf-signature'] = createHmac('sha256', this.options.secret)
						.update(timestamp + '.').update(report.body).digest('hex');
				}
				const controller = new AbortController();
				const timeout = setTimeout(() => controller.abort(), this.options.timeoutMs || 10000);
				try {
					const response = await (this.options.fetch || fetch)(url, {
						method: 'POST', headers, body: report.body, signal: controller.signal, redirect: 'error',
					});
					if (response.ok && (await response.json() as { ok?: boolean }).ok === true) {
						await fs.unlink(file);
						continue;
					}
					if (response.status >= 400 && response.status < 500 && ![408, 429].includes(response.status)) {
						report.blocked = `HTTP ${response.status}; operator review required`;
					}
				} catch {
					// Timeout/network/invalid acknowledgement: retry the same room key safely.
				} finally {
					clearTimeout(timeout);
				}
				report.attempts++;
				report.nextAttempt = Date.now() + Math.min(3600000, 5000 * 2 ** Math.min(report.attempts, 10));
				await this.write(file, report);
				this.warn(`Official report ${name}: ${report.blocked || 'delivery pending; retry scheduled'}.`);
			}
		} finally {
			this.draining = false;
		}
	}
}

export const officialReports = new OfficialReportOutbox({
	// Config is loaded before room-battle imports this module. Match FS/Monitor.logPath's root.
	directory: path.resolve(__dirname, '../../', typeof Config === 'object' && Config.logsdir || 'logs', 'official-report-outbox'),
	legacyDirectory: path.resolve(__dirname, '../../logs/official-report-outbox'),
	url: process.env.OFFICIAL_LOGS_URL,
	secret: process.env.OFFICIAL_LOGS_SECRET,
	mode: process.env.OFFICIAL_LOGS_MODE,
	warn: message => Monitor.warn(message),
});
