import { Battle } from './battle';
import { State } from './state';
/** Isolated, deterministic damage comparison. No preview callbacks run on the live battle. */
export function expectedCategory(battle: Battle, source: Pokemon, target: Pokemon, move: ActiveMove, encore = false) {
	if (move.category === 'Status' || move.isZ || move.isMax || move.damage !== undefined ||
		move.damageCallback || move.ohko || move.basePowerCallback || !move.basePower ||
		move.overrideOffensiveStat || move.overrideDefensiveStat || move.overrideOffensivePokemon ||
		move.overrideDefensivePokemon || !['normal', 'adjacentFoe', 'any'].includes(move.target) ||
		['terablast', 'photongeyser', 'shellsidearm'].includes(move.id))
		return;
	const sourceIndex = source.side.pokemon.indexOf(source);
	const targetIndex = target.side.pokemon.indexOf(target);
	let immunityFallback: (() => 'Physical' | undefined) | undefined;
	try {
		const snapshot = JSON.stringify(battle.toJSON());
		const moveState = State.serializeActiveMove(move, battle);
		// State's compact replay serializer omits object fields inherited from the base move.
		// Damage previews must retain current flags and other modified object fields too.
		for (const [key, value] of Object.entries(move)) {
			if (value && typeof value === 'object') moveState[key] = State.serializeWithRefs(value, battle);
		}
		const moveSnapshot = JSON.stringify(moveState);
        // Enumerate discrete random callback outcomes in isolated copies; never sample live RNG.
        class PreviewBranch { constructor(public options: {value: number; weight: number}[]) {} }
        let evaluations = 0;
        const damage = (category: 'Physical' | 'Special', tape: number[] = [], immunityOnly = false): number | undefined => {
            if (++evaluations > 512) throw new Error('Damage preview branch limit');
            let cursor = 0;
            const choose = (options: {value: number; weight: number}[]) => {
                if (cursor < tape.length) return tape[cursor++];
                throw new PreviewBranch(options.filter(option => option.weight > 0));
            };
			const preview = Battle.fromJSON(snapshot);
			try {
				const attacker = preview.sides[source.side.n].pokemon[sourceIndex];
				const defender = preview.sides[target.side.n].pokemon[targetIndex];
				const attack = State.deserializeActiveMove(JSON.parse(moveSnapshot), preview);
				Object.assign(attack, { category, willCrit: false, hit: 1, moveHitData: {} });
				if (encore) {
					attack.flags = {...attack.flags};
					delete attack.flags.sound;
					delete attack.flags.dance;
					attack.flags[category === 'Physical' ? 'dance' : 'sound'] = 1;
				}
				preview.randomizer = value => value;
				const rejectRandom = () => {
					throw new Error('Nondeterministic damage preview');
				};
				preview.random = rejectRandom;
				preview.randomChance = rejectRandom;
				preview.sample = rejectRandom;
                preview.prng.random = rejectRandom;
                if (encore) {
                    preview.randomChance = (numerator, denominator) => choose([{value: 1, weight: numerator / denominator}, {value: 0, weight: 1 - numerator / denominator}]) === 1;
                    preview.random = (from?: number, to?: number) => {
                        if (from === undefined) throw new Error('Continuous random preview is unsupported');
                        const lower = to === undefined ? 0 : from, upper = to === undefined ? from : to;
                        if (upper - lower > 256) throw new Error('Damage preview random range limit');
                        return choose(Array.from({length: upper - lower}, (_, i) => ({value: lower + i, weight: 1 / (upper - lower)})));
                    };
                    preview.sample = <T>(items: readonly T[]): T => items[preview.random(items.length)];
                }
				preview.setActiveMove(attack, attacker, defender);
				if (encore && ((!preview.runEvent('TryHit', defender, attacker, attack)) ||
					!defender.runImmunity(attack) || !preview.singleEvent('TryImmunity', attack, {}, defender, attacker, attack) ||
					(attack.flags.sound && attacker.volatiles.throatchop))) return 0;
				if (immunityOnly) return 1;
				const calculated = preview.actions.getDamage(attacker, defender, attack, true);
				if (typeof calculated !== 'number') return 0;
				const applied = preview.runEvent('Damage', defender, attacker, attack, calculated);
				return typeof applied === 'number' ? applied : 0;
            } catch (error) {
                if (!(error instanceof PreviewBranch)) throw error;
                return error.options.reduce((sum, option) => sum + option.weight * (damage(category, [...tape, option.value], immunityOnly) || 0), 0);
            } finally {
				preview.destroy();
			}
		};
		if (encore) immunityFallback = () => {
			// A bounded damage callback may be unsupported even when sound immunity is known.
			// Recheck only the real hit/immunity gates in fresh clones, never on live state.
			evaluations = 0;
			return damage('Special', [], true) === 0 && damage('Physical', [], true) === 1 ? 'Physical' : undefined;
		};
		const physical = damage('Physical');
		const special = damage('Special');
		if (typeof physical !== 'number' || typeof special !== 'number')
			return;
		return physical === special ? move.category : physical > special ? 'Physical' : 'Special';
	} catch {
		try { if (immunityFallback) return immunityFallback(); } catch {}
		// Unsupported snapshots or unbounded randomness retain the original category.
		return;
	}
}
