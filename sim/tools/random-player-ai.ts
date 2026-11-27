/**
 * Example random player AI.
 *
 * Pokemon Showdown - http://pokemonshowdown.com/
 *
 * @license MIT
 */

import type { ObjectReadWriteStream } from '../../lib/streams';
import { BattlePlayer } from '../battle-stream';
import { PRNG, type PRNGSeed } from '../prng';
import type { ChoiceRequest } from '../side';

export class RandomPlayerAI extends BattlePlayer {
	protected readonly move: number;
	protected readonly mega: number;
	protected readonly prng: PRNG;

	constructor(
		playerStream: ObjectReadWriteStream<string>,
		options: { move?: number, mega?: number, seed?: PRNG | PRNGSeed | null } = {},
		debug = false
	) {
		super(playerStream, debug);
		this.move = options.move || 1.0;
		this.mega = options.mega || 0;
		this.prng = PRNG.get(options.seed);
	}

	override receiveError(error: Error) {
		// If we made an unavailable choice we will receive a followup request to
		// allow us the opportunity to correct our decision.
		if (error.message.startsWith('[Unavailable choice]')) return;
		throw error;
	}

	override receiveRequest(request: ChoiceRequest) {
		if (request.wait) {
			// wait request
			// do nothing
		} else if (request.forceSwitch) {
			// switch request
			const pokemon = request.side.pokemon;
			const chosen: number[] = [];
			const choices = request.forceSwitch.map((mustSwitch, i) => {
				if (!mustSwitch) return `pass`;

				const canSwitch = range(1, 6).filter(j => (
					pokemon[j - 1] &&
					// not active
					(j > request.forceSwitch.length || pokemon[i].reviving) &&
					// not chosen for a simultaneous switch
					!chosen.includes(j) &&
					// not fainted or fainted and using Revival Blessing
					!pokemon[j - 1].condition.endsWith(` fnt`) === !pokemon[i].reviving
				));

				if (!canSwitch.length) return `pass`;
				const target = this.chooseSwitch(
					undefined,
					canSwitch.map(slot => ({ slot, pokemon: pokemon[slot - 1] }))
				);
				chosen.push(target);
				return `switch ${target}`;
			});

			this.choose(choices.join(`, `));
		} else if (request.teamPreview) {
			this.choose(this.chooseTeamPreview(request.side.pokemon));
		} else if (request.active) {
			// move request
			const spent = new Set<string>();
			const budget = request.side.gimmicks?.find(side => side.id === request.side.id);
			let remaining = budget ? budget.limit - budget.used : Infinity;
			const pokemon = request.side.pokemon;
			const chosen: number[] = [];
			const choices = request.active.map((active: AnyObject, i: number) => {
				if (pokemon[i].condition.endsWith(` fnt`) || pokemon[i].commanding) return `pass`;

				// Select the transformation before reading its move slots and target types.
				const mega = active.canMegaEvo ? 'mega' : active.canMegaEvoX ? 'megax' : active.canMegaEvoY ? 'megay' : '';
				const canMega = mega && !spent.has('mega');
				const canDynamax = active.canDynamax && !spent.has('dynamax');
				const canUltra = active.canUltraBurst && !spent.has('ultra');
				const canZMove = remaining > 0 && active.canZMove && !spent.has('zmove');
				let change = '';
				if (remaining > 0 && (canMega || canUltra || canDynamax) && this.prng.random() < this.mega) {
					change = active.canTerastallize && !spent.has('terastallize') ? 'terastallize' :
						canDynamax ? 'dynamax' : canMega ? mega : 'ultra';
				}
				const useMaxMoves = (!active.canDynamax && active.maxMoves) || change === 'dynamax';
				const possibleMoves = useMaxMoves ? active.maxMoves.maxMoves :
					change === 'mega' && active.pulseMoves ? active.pulseMoves : active.moves;
				const targetKey = change === 'mega' ? 'megaTarget' : change === 'megax' ? 'megaXTarget' :
					change === 'megay' ? 'megaYTarget' : '';

				let canMove = range(1, possibleMoves.length).filter(j => (
					// not disabled
					!possibleMoves[j - 1].disabled
					// NOTE: we don't actually check for whether we have PP or not because the
					// simulator will mark the move as disabled if there is zero PP and there are
					// situations where we actually need to use a move with 0 PP (Gen 1 Wrap).
				)).map(j => ({
					slot: j,
					move: possibleMoves[j - 1].move,
					target: possibleMoves[j - 1][targetKey] || possibleMoves[j - 1].target,
					zMove: false,
				}));
				if (canZMove) {
					canMove.push(...range(1, active.canZMove.length)
						.filter(j => active.canZMove[j - 1])
						.map(j => ({
							slot: j,
							move: active.canZMove[j - 1].move,
							target: active.canZMove[j - 1].target,
							zMove: true,
						})));
				}

				// Filter out adjacentAlly moves if we have no allies left, unless they're our
				// only possible move options.
				const hasAlly = pokemon.length > 1 && !pokemon[i ^ 1].condition.endsWith(` fnt`);
				const filtered = canMove.filter(m => m.target !== `adjacentAlly` || hasAlly);
				canMove = filtered.length ? filtered : canMove;

				const moves = canMove.map(m => {
					let move = `move ${m.slot}`;
					// NOTE: We don't generate all possible targeting combinations.
					if (request.active.length > 1) {
						if ([`normal`, `normalOrSelf`, `any`, `adjacentFoe`].includes(m.target)) {
							move += ` ${1 + this.prng.random(2)}`;
						}
						if (m.target === `adjacentAlly`) {
							move += ` -${(i ^ 1) + 1}`;
						}
						if (m.target === `adjacentAllyOrSelf`) {
							if (hasAlly) {
								move += ` -${1 + this.prng.random(2)}`;
							} else {
								move += ` -${i + 1}`;
							}
						}
					}
					if (m.zMove) move += ` zmove`;
					return { choice: move, move: m };
				});

				const canSwitch = range(1, 6).filter(j => (
					pokemon[j - 1] &&
					// not active
					!pokemon[j - 1].active &&
					// not chosen for a simultaneous switch
					!chosen.includes(j) &&
					// not fainted
					!pokemon[j - 1].condition.endsWith(` fnt`)
				));
				const switches = active.trapped ? [] : canSwitch;

				if (switches.length && (!moves.length || this.prng.random() > this.move)) {
					const target = this.chooseSwitch(
						active,
						canSwitch.map(slot => ({ slot, pokemon: pokemon[slot - 1] }))
					);
					chosen.push(target);
					return `switch ${target}`;
				} else if (moves.length) {
					const move = this.chooseMove(active, moves);
					if (move.endsWith(` zmove`)) {
						spent.add('zmove');
						remaining--;
						return move;
					} else if (change) {
						spent.add(change.startsWith('mega') ? 'mega' : change);
						remaining--;
						return `${move} ${change}`;
					} else {
						return move;
					}
				} else {
					throw new Error(`${this.constructor.name} unable to make choice ${i}. request='${typeof request}',` +
						` chosen='${chosen}', change='${change}'`);
				}
			});
			this.choose(choices.join(`, `));
		}
	}

	protected chooseTeamPreview(team: AnyObject[]): string {
		return `default`;
	}

	protected chooseMove(active: AnyObject, moves: { choice: string, move: AnyObject }[]): string {
		return this.prng.sample(moves).choice;
	}

	protected chooseSwitch(active: AnyObject | undefined, switches: { slot: number, pokemon: AnyObject }[]): number {
		return this.prng.sample(switches).slot;
	}
}

// Creates an array of numbers progressing from start up to and including end
function range(start: number, end?: number, step = 1) {
	if (end === undefined) {
		end = start;
		start = 0;
	}
	const result = [];
	for (; start <= end; start += step) {
		result.push(start);
	}
	return result;
}
