import { Battle } from './battle';
import { State } from './state';
/** Isolated, deterministic damage comparison. No preview callbacks run on the live battle. */
export function expectedCategory(battle: Battle, source: Pokemon, target: Pokemon, move: ActiveMove) {
	if (move.category === 'Status' || move.isZ || move.isMax || move.damage !== undefined ||
		move.damageCallback || move.ohko || move.basePowerCallback || !move.basePower ||
		move.overrideOffensiveStat || move.overrideDefensiveStat || move.overrideOffensivePokemon ||
		move.overrideDefensivePokemon || !['normal', 'adjacentFoe', 'any'].includes(move.target) ||
		['terablast', 'photongeyser', 'shellsidearm'].includes(move.id))
		return;
	const sourceIndex = source.side.pokemon.indexOf(source);
	const targetIndex = target.side.pokemon.indexOf(target);
	try {
		const snapshot = JSON.stringify(battle.toJSON());
		const moveState = State.serializeActiveMove(move, battle);
		// State's compact replay serializer omits object fields inherited from the base move.
		// Damage previews must retain current flags and other modified object fields too.
		for (const [key, value] of Object.entries(move)) {
			if (value && typeof value === 'object') moveState[key] = State.serializeWithRefs(value, battle);
		}
		const moveSnapshot = JSON.stringify(moveState);
		const damage = (category: 'Physical' | 'Special') => {
			const preview = Battle.fromJSON(snapshot);
			try {
				const attacker = preview.sides[source.side.n].pokemon[sourceIndex];
				const defender = preview.sides[target.side.n].pokemon[targetIndex];
				const attack = State.deserializeActiveMove(JSON.parse(moveSnapshot), preview);
				Object.assign(attack, { category, willCrit: false, hit: 1, moveHitData: {} });
				preview.randomizer = value => value;
				const rejectRandom = () => {
					throw new Error('Nondeterministic damage preview');
				};
				preview.random = rejectRandom;
				preview.randomChance = rejectRandom;
				preview.sample = rejectRandom;
				preview.prng.random = rejectRandom;
				preview.setActiveMove(attack, attacker, defender);
				const calculated = preview.actions.getDamage(attacker, defender, attack, true);
				if (typeof calculated !== 'number') return calculated;
				const applied = preview.runEvent('Damage', defender, attacker, attack, calculated);
				return typeof applied === 'number' ? applied : 0;
			} finally {
				preview.destroy();
			}
		};
		const physical = damage('Physical');
		const special = damage('Special');
		if (typeof physical !== 'number' || typeof special !== 'number')
			return;
		return physical === special ? move.category : physical > special ? 'Physical' : 'Special';
	} catch {
		// Custom unsnapshotable or random damage callbacks retain the original move unchanged.
		return;
	}
}
