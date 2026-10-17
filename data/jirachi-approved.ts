import type {AbilityDataTable} from '../sim/dex-abilities';
import type {MoveDataTable} from '../sim/dex-moves';

export const JirachiComponents = {cometheart: ['levitate'], wishkeeper: ['magicbounce', 'triage'], yearningstar: []};
export const JirachiDescriptions = {
	cometheart: {name: 'Comet Heart', shortDesc: 'Levitate. Doom Desire has 1.5x power.', desc: 'Levitate. Its Doom Desire has 1.5x power.'},
	wishkeeper: {name: 'Wishkeeper', shortDesc: 'Magic Bounce + Triage. Its Wish also cures the receiver\'s status.', desc: 'Magic Bounce and Triage. When its Wish resolves, it cures the receiver\'s major status even at full HP.'},
	yearningstar: {name: 'Yearning Star', shortDesc: 'Charge moves, Wish, Future Sight and Doom Desire resolve immediately.', desc: 'Skips charge turns. Wish, Future Sight and Doom Desire resolve during their use, without leaving a delayed effect. Charge boosts, move costs and recharge turns remain.'},
	dreamsickness: {name: 'Dream Sickness', shortDesc: 'Telepathy; heals allies each turn; once per entry rescues an ally through one attack.', desc: 'Avoids allied damaging moves; Speed doubles on Psychic Terrain or Psychic Aura. At turn end, it and its active allies heal 1/16 max HP. Once per switch-in, an ally facing a lethal opposing move survives at 1 HP through that entire move, including later hits. It pays 1/4 max HP and must have more HP than the cost. Later attacks and indirect damage can still knock out the ally.'},
};
export function installJirachiAbilities(abilities: AbilityDataTable) {
	const a = abilities as any;
	a.cometheart = {...a.levitate, name: 'Comet Heart', num: 11741,
		onBasePower(this: Battle, power: number, source: Pokemon, target: Pokemon, move: ActiveMove) {
			if (move.id === 'doomdesire') return this.chainModify(1.5);
		},
	};
	a.wishkeeper = {...a.magicbounce, ...a.triage, flags: {...a.magicbounce.flags, ...a.triage.flags}, name: 'Wishkeeper', num: 11742};
	a.yearningstar = {name: 'Yearning Star', num: 11743, rating: 4, flags: {},
		onChargeMove(this: Battle, pokemon: Pokemon, target: Pokemon, move: ActiveMove) {
			this.add('-activate', pokemon, 'ability: Yearning Star');
			this.addMove('-anim', pokemon, move.name, target);
			return false;
		},
	};
}

export function installJirachiMoves(moves: MoveDataTable) {
	const m = moves as any;
	for (const id of ['futuresight', 'doomdesire']) {
		const original = m[id].onTry;
		m[id].onTry = function (this: Battle, source: Pokemon, target: Pokemon, move: ActiveMove) {
			const before = target.side.slotConditions[target.position].futuremove;
			const result = original.call(this, source, target, move);
			const queued = target.side.slotConditions[target.position].futuremove;
			if (source.hasAbility('yearningstar') && queued && queued !== before && queued.source === source) {
				this.add('-activate', source, 'ability: Yearning Star');
				target.side.removeSlotCondition(target, 'futuremove');
			}
			return result;
		};
	}
	const wishStart = m.wish.condition.onStart, wishEnd = m.wish.condition.onEnd;
	m.wish.condition.onStart = function (this: Battle, target: Pokemon, source: Pokemon, effect: Effect) {
		wishStart.call(this, target, source, effect);
		this.effectState.wishkeeper = source.hasAbility('wishkeeper');
	};
	m.wish.condition.onEnd = function (this: Battle, target: Pokemon) {
		if (target?.hp && this.effectState.wishkeeper) target.cureStatus();
		return wishEnd.call(this, target);
	};
	m.wish.onHit = function (this: Battle, target: Pokemon, source: Pokemon) {
		if (source.hasAbility('yearningstar')) {
			this.add('-activate', source, 'ability: Yearning Star');
			target.side.removeSlotCondition(target, 'wish');
		}
	};
	// Sky Drop has its own two-turn path rather than the shared ChargeMove event.
	const skyModify = m.skydrop.onModifyMove, skyHit = m.skydrop.onTryHit;
	m.skydrop.onModifyMove = function (this: Battle, move: ActiveMove, source: Pokemon) {
		if (!source.hasAbility('yearningstar')) return skyModify.call(this, move, source);
	};
	m.skydrop.onTryHit = function (this: Battle, target: Pokemon, source: Pokemon, move: ActiveMove) {
		if (!source.hasAbility('yearningstar')) return skyHit.call(this, target, source, move);
		if (target.volatiles.substitute || target.isAlly(source) || target.getWeight() >= 2000 || this.field.isTerrain('caveterrain')) return false;
		if (target.hasType('Flying')) { this.add('-immune', target); return null; }
		this.add('-activate', source, 'ability: Yearning Star');
	};
}
