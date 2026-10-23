/** The drain inventory includes disconnected/unrated battles and best-of parents between games. */
export interface DrainRoom {
	battle?: { ended: boolean } | null;
	bestOf?: { ended: boolean } | null;
	game?: { gameid: string, ended: boolean } | null;
}
export function unfinishedBattleRooms<T extends DrainRoom>(rooms: Iterable<T>): T[] {
	return [...rooms].filter(room => (room.battle && !room.battle.ended) ||
		(room.bestOf && !room.bestOf.ended) || (room.game?.gameid === 'bestof' && !room.game.ended));
}

interface DrainOptions {
	enabled(): boolean;
	drained(): boolean;
	updating(): boolean;
	notify(message: 'warning' | 'canceled'): void;
	exit(): void;
}
interface DrainClock {
	setTimeout: typeof setTimeout;
	clearTimeout: typeof clearTimeout;
}
/** One cancellable countdown; polling also observes parent-set completion without a battle callback. */
export class LockdownDrain {
	private timer: NodeJS.Timeout | null = null;
	private generation = 0;
	private exited = false;
	private countingDown = false;
	private readonly options: DrainOptions;
	private readonly clock: DrainClock;
	constructor(options: DrainOptions, clock: DrainClock = { setTimeout, clearTimeout }) {
		this.options = options;
		this.clock = clock;
	}
	cancel() {
		this.generation++;
		if (this.timer) this.clock.clearTimeout(this.timer);
		this.timer = null;
		this.exited = false;
		this.countingDown = false;
	}
	request() {
		if (!this.options.enabled()) { this.cancel(); return; }
		if (this.exited) return;
		const countdown = this.options.drained() && !this.options.updating();
		if (this.timer) {
			if (!this.countingDown || countdown) return;
			this.cancel();
			this.options.notify('canceled');
		}
		this.countingDown = countdown;
		if (countdown) this.options.notify('warning');
		const generation = this.generation;
		this.timer = this.clock.setTimeout(() => {
			// A cleared timer's callback must not clear or execute a newer session's timer.
			if (generation !== this.generation) return;
			this.timer = null;
			this.countingDown = false;
			if (!this.options.enabled()) {
				if (countdown) this.options.notify('canceled');
				this.cancel();
				return;
			}
			if (countdown && this.options.drained() && !this.options.updating()) {
				this.exited = true;
				this.options.exit();
				return;
			}
			if (countdown) this.options.notify('canceled');
			this.request();
		}, countdown ? 10000 : 1000);
		this.timer.unref?.();
	}
}
