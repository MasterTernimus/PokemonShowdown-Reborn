import type { AbilityDataTable } from '../sim/dex-abilities';

/** Add approved components without replacing weather, residual, or protection callbacks. */
export function installApprovedSovereigns(abilities: AbilityDataTable) {
	const sunStart = abilities.sunsovereign.onStart!;
	abilities.sunsovereign.onStart = function (pokemon) {
		sunStart.call(this, pokemon);
		this.singleEvent('Start', this.dex.abilities.get('intimidate'), pokemon.abilityState, pokemon);
	};
	// Updraft's allowance belongs to the Pokemon's entry, including base-to-Mega transitions.
	delete abilities.updraft.onStart;
	abilities.updraft.onSourceDamagingHit = function (damage, target, source, move) {
		if (damage <= 0 || target.isAlly(source) || move.type !== 'Flying' || source.m.updraftUsed) return;
		const ally = source.adjacentAllies().filter(pokemon => pokemon.hp && !pokemon.fainted)
			.sort((a, b) => a.hp / a.maxhp - b.hp / b.maxhp)[0];
		source.m.updraftUsed = true;
		this.boost({ spe: 1 }, ally || source, source, this.effect);
	};
	abilities.stormsovereign.onStart = function (pokemon) {
		this.field.setWeather('deltastream', pokemon, this.dex.abilities.get('stormsovereign'));
		if (this.field.isWeather('deltastream')) this.field.weatherState.duration = 8;
	};
	delete abilities.stormsovereign.onTryBoost;
	abilities.stormsovereign.onModifyMove = function (move, pokemon, target) {
		this.dex.abilities.get('updraft').onModifyMove?.call(this, move, pokemon, target);
		if (!pokemon.getPassives().includes('noguard')) move.accuracy = true;
	};
	abilities.stormsovereign.onSourceDamagingHit = function (damage, target, source, move) {
		return this.dex.abilities.get('updraft').onSourceDamagingHit?.call(this, damage, target, source, move);
	};
	abilities.sandsovereign.onModifyMove = function (move, pokemon, target) {
		return this.dex.abilities.get('mountainbreaker').onModifyMove?.call(this, move, pokemon, target);
	};
	abilities.frostsovereign.onTryHit = function (target, source, move) {
		const callback = this.dex.abilities.get('soundproof').onTryHit;
		if (typeof callback === 'function') return callback.call(this, target, source, move);
	};
	abilities.frostsovereign.onAllyTryHitSide = function (target, source, move) {
		const callback = this.dex.abilities.get('soundproof').onAllyTryHitSide;
		if (typeof callback === 'function') return callback.call(this, target, source, move);
	};
}
