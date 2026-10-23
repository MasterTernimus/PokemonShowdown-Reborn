/** Server-only control framing; simulator bytes and ordinary human streams remain unchanged. */
import type { EngineSnapshot, EngineIdentity } from './battle-engine-snapshot';
export interface EngineGuardPacket {
	identity: EngineIdentity;
	command: string;
	slot?: string;
	requestToken?: string;
}
export class BattleEngineStreamControl {
	private delegate: any = null;
	private rejected = false;
	private requestTokens = new Map<string, string>();
	private requestSerial = 0;
	private snapshot: EngineSnapshot | null;
	private push: (value: string) => void;
	private setBattle: (battle: Battle) => void;
	private unavailable: () => void;
	constructor(
		snapshot: EngineSnapshot | null, push: (value: string) => void,
		setBattle: (battle: Battle) => void, unavailable: () => void
	) {
		this.snapshot = snapshot;
		this.push = push;
		this.setBattle = setBattle;
		this.unavailable = unavailable;
	}
	private reject(slot?: string) {
		if (slot && /^p[1-4]$/.test(slot))
			this.push(`sideupdate\n${slot}\n|error|[Invalid choice] Battle engine verification changed; command rejected.`);
		else {
			this.rejected = true;
			this.push('engineidentity\n' + JSON.stringify({ error: 'Guarded engine unavailable' }));
		}
	}
	handle(chunk: string): boolean {
		if (chunk.startsWith('>engineguard ')) {
			let packet: EngineGuardPacket | undefined;
			try {
				if (chunk.length > 8192 || chunk.includes('\n'))
					throw new Error('Invalid guarded command');
				packet = JSON.parse(chunk.slice(13));
				const snapshot = this.snapshot;
				if (!snapshot || !packet || typeof packet.command !== 'string' || packet.command.includes('\n'))
					throw new Error('Invalid guarded command');
				snapshot.assertValid();
				if (packet.identity?.algorithm !== snapshot.identity.algorithm ||
					packet.identity?.mechanicsSHA256 !== snapshot.identity.mechanicsSHA256 ||
					packet.identity?.generation !== snapshot.identity.generation) {
					this.reject(packet.slot);
					return true;
				}
				if (packet.command.startsWith('>start ')) {
					if (this.delegate || this.rejected)
						throw new Error('Guarded stream already initialized');
					const options = JSON.parse(packet.command.slice(7));
					snapshot.validateStart(options);
					this.delegate = snapshot.createStream();
					const push = this.delegate.push.bind(this.delegate);
					this.delegate.push = (value: string) => push(this.decorateRequest(value));
					void this.listen();
					this.push('engineidentity\n' + JSON.stringify(snapshot.identity));
				} else {
					if (!this.delegate || !packet.slot || !/^p[1-4]$/.test(packet.slot) ||
						!packet.command.startsWith('>' + packet.slot + ' ') || !packet.requestToken ||
						this.requestTokens.get(packet.slot) !== packet.requestToken) {
						this.reject(packet.slot);
						return true;
					}
				}
				snapshot.assertValid();
				void this.delegate.write(packet.command);
				this.setBattle(this.delegate.battle);
				snapshot.assertValid();
			} catch {
				this.reject(packet?.slot);
				try {
					this.snapshot?.assertValid();
				} catch {
					this.unavailable();
				}
			}
			return true;
		}
		if (this.rejected)
			return true;
		if (!this.delegate)
			return false;
		// Evaluation could mutate a shared Dex while leaving the attested input bytes unchanged.
		if (chunk.split('\n').some(line => /^>eval(?: |$)/.test(line) || /^>start(?: |$)/.test(line))) {
			this.reject();
			return true;
		}
		try {
			this.snapshot!.assertValid();
			void this.delegate.write(chunk);
			this.setBattle(this.delegate.battle);
			this.snapshot!.assertValid();
		} catch {
			this.unavailable();
			this.reject();
		}
		return true;
	}
	private decorateRequest(value: string) {
		if (typeof value !== 'string' || !value.startsWith('sideupdate\n'))
			return value;
		const lines = value.split('\n');
		if (lines[2]?.startsWith('|request|')) {
			const request = JSON.parse(lines[2].slice(9));
			if (request && typeof request === 'object') {
				const token = `${this.snapshot!.identity.generation}-${++this.requestSerial}`;
				this.requestTokens.set(lines[1], token);
				request.engineRequestToken = token;
				lines[2] = '|request|' + JSON.stringify(request);
			} else
				this.requestTokens.delete(lines[1]);
		}
		return lines.join('\n');
	}
	private async listen() {
		try {
			for await (const value of this.delegate) {
				this.snapshot!.assertValid();
				this.push(value);
			}
		} catch {
			this.unavailable();
			this.reject();
		}
	}
	destroy() {
		const delegate = this.delegate; this.delegate = null; if (delegate) {
			void delegate.destroy();
			return true;
		} return false;
	}
}
