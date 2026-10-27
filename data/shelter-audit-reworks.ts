import type { AbilityDataTable } from '../sim/dex-abilities';
import type { ConditionDataTable } from '../sim/dex-conditions';

export const ShelterDescriptions = {
	baitedbloom: {
		shortDesc: 'Gluttony and Regenerator: early pinch Berries, stronger Leftovers; heals 1/3 on switching.',
		desc: "Full local Gluttony makes pinch Berries activate at half HP and Leftovers heal 1/8 max HP each turn. Full local Regenerator restores 1/3 base max HP when switching out.",
	},
	scaleshelter: {
		shortDesc: 'Overcoat; first selected Quiver Dance each entry grants a 20% whole-attack HP ward.',
		desc: 'Full local Overcoat blocks powder moves and sandstorm/hail damage. The first successful directly selected Quiver Dance per switch-in grants one ward: opposing damaging attacks deal 20% less HP damage until the end of the first such attack to damage HP, including all its hits. Misses, protection, immunity, Substitute-only damage and zero HP damage preserve it. Called moves do not grant it; wards cannot stack.',
	},
	roughscale: {
		shortDesc: 'Tough Claws; first resisted opposing HP attack each entry grants +1 Defense after the move.',
		desc: 'Full local Tough Claws gives contact moves 1.3x power. Once per switch-in, after the first resisted opposing attack to damage HP finishes all its hits, raises Defense by 1 if the holder survives and remains active. Normal boost prevention applies. Misses, protection, immunity, Substitute-only damage and zero HP damage do not activate it.',
	},
};

function finishWard(this: Battle, source: Pokemon) {
	if (this.effectState.attacker === source) this.effectState.target.removeVolatile('scaleshelterward');
}
function finishScale(this: Battle, source: Pokemon) {
	if (this.effectState.attacker !== source) return;
	const pokemon: Pokemon = this.effectState.target;
	pokemon.removeVolatile('roughscalepending');
	if (pokemon.hp && pokemon.isActive && pokemon.hasAbility('roughscale')) {
		this.boost({ def: 1 }, pokemon, pokemon, this.dex.abilities.get('roughscale'));
	}
}
export const ShelterConditions: ConditionDataTable = {
	scaleshelterspent: { name: 'Scale Shelter spent', noCopy: true },
	scaleshelterward: {
		name: 'Scale Shelter ward', noCopy: true,
		onDamagePriority: -1,
		onDamage(damage, target, source, effect) {
			if (damage > 0 && source && !source.isAlly(target) && effect?.effectType === 'Move' &&
				(effect).category !== 'Status') return this.modify(damage, 0.8);
		},
		onAfterDamageApplied(damage, target, source, effect) {
			if (damage > 0 && source && !source.isAlly(target) && effect?.effectType === 'Move' &&
				(effect).category !== 'Status') this.effectState.attacker = source;
		},
		onAnyAfterMove: finishWard,
		onAnyAfterTargetedMove: finishWard,
	},
	roughscalespent: { name: 'Rough Scale spent', noCopy: true },
	roughscalepending: {
		name: 'Rough Scale pending', noCopy: true,
		onStart(target, source) { this.effectState.attacker = source; },
		onAnyAfterMove: finishScale,
		onAnyAfterTargetedMove: finishScale,
	},
};

export function installShelterAuditReworks(abilities: AbilityDataTable) {
	abilities.baitedbloom.onStart = abilities.gluttony.onStart;
	abilities.baitedbloom.onDamage = abilities.gluttony.onDamage;
	abilities.baitedbloom.onSwitchOut = abilities.regenerator.onSwitchOut;
	abilities.scaleshelter.onAfterBoost = function (boost, target, source, effect) {
		const move = this.activeMove;
		if (source !== target || effect?.id !== 'quiverdance' || move?.id !== 'quiverdance' ||
			move.sourceEffect || move.isExternal || move.callsMove || move.hasBounced ||
			!Object.values(boost).some(value => value > 0) || target.volatiles.scaleshelterspent) return;
		target.addVolatile('scaleshelterspent', target, this.effect);
		target.addVolatile('scaleshelterward', target, this.effect);
	};
	const roughHit = abilities.roughscale.onDamagingHit!;
	abilities.roughscale.onDamagingHit = function (damage, target, source, move) {
		roughHit.call(this, damage, target, source, move);
		if (damage <= 0 || source.isAlly(target) || target.volatiles.roughscalespent ||
			!(target.getMoveHitData(move).typeMod < 0)) return;
		target.addVolatile('roughscalespent', target, this.effect);
		target.addVolatile('roughscalepending', source, this.effect);
	};
	abilities.phantombarrage.onTryBoost = function (boost, target, source, effect) {
		const clearBody = this.dex.abilities.get('clearbody');
		if (this.suppressingAbility(target, clearBody)) return;
		return clearBody.onTryBoost?.call(this, boost, target, source, effect);
	};
	delete abilities.astralwatcher.onModifyMove;
	const sap = abilities.digestivesap;
	const damage = sap.onAnyAfterDamageApplied!;
	sap.onAnyAfterDamageApplied = function (amount, target, source, effect) {
		const holder: Pokemon = this.effectState.target;
		if (!this.effectState.speciesPassive && holder.getPassives().includes('digestivesap')) return;
		return damage.call(this, amount, target, source, effect);
	};
	const heal = sap.onTryHeal!;
	sap.onTryHeal = function (amount, target, source, effect) {
		if (!this.effectState.speciesPassive && target.getPassives().includes('digestivesap')) return;
		return heal.call(this, amount, target, source, effect);
	};
}
