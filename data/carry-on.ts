import type { AbilityDataTable } from '../sim/dex-abilities';

export function installCarryOn(abilities: AbilityDataTable) {
	abilities.carryon = {
		name: 'Carry On', num: 11978, rating: 4,
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1 },
		onTryAddVolatile(status, target, source, effect) {
			return this.dex.abilities.get('innerfocus').onTryAddVolatile?.call(this, status, target, source, effect);
		},
		onTryBoost(boost, target, source, effect) {
			return this.dex.abilities.get('innerfocus').onTryBoost?.call(this, boost, target, source, effect);
		},
		onResidualOrder: abilities.healer.onResidualOrder,
		onResidual(pokemon) {
			return this.dex.abilities.get('healer').onResidual?.call(this, pokemon);
		},
		onStart(pokemon) {
			if (pokemon.m.carryOnAbility && !pokemon.transformed) {
				const ability = this.dex.abilities.get(pokemon.m.carryOnAbility);
				pokemon.m.carryOnAbilityState = this.initEffectState({ id: ability.id, target: pokemon });
				this.singleEvent('Start', ability, pokemon.m.carryOnAbilityState, pokemon);
			}
		},
		onEnd(pokemon) {
			if (pokemon.m.carryOnAbility && pokemon.m.carryOnAbilityState) {
				this.singleEvent('End', this.dex.abilities.get(pokemon.m.carryOnAbility), pokemon.m.carryOnAbilityState, pokemon);
			}
		},
		onAllyFaint(target) {
			const pokemon = this.effectState.target as Pokemon;
			if (!pokemon.hp || pokemon.transformed || pokemon.m.carryOnSpent || target === pokemon) return;
			const ability = target.getAbility();
			if (ability.flags.noreceiver || ['noability', 'carryon'].includes(ability.id)) return;
			pokemon.m.carryOnSpent = true;
			pokemon.m.carryOnAbility = ability.id;
			pokemon.m.carryOnAbilityState = this.initEffectState({ id: ability.id, target: pokemon });
			this.add('-ability', pokemon, ability.name, '[from] ability: Carry On', `[of] ${target}`);
			this.singleEvent('Start', ability, pokemon.m.carryOnAbilityState, pokemon, target);
		},
	};
}
