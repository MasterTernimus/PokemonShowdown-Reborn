import type {AbilityDataTable} from '../sim/dex-abilities';
import {composeSelectedAbility} from './selected-mega-simplifications';

function attackToken(battle: Battle, source: Pokemon, move: ActiveMove) {
	return battle.activePokemon === source && battle.activeMove?.id === move.id ? battle.activeMove : move;
}
function opposingAttack(source: Pokemon | undefined, target: Pokemon, move: Effect | undefined) {
	return source && !source.isAlly(target) && move?.effectType === 'Move' && move.category !== 'Status';
}

export function installLycanrocQwilfishReworks(abilities: AbilityDataTable) {
	Object.assign(abilities.keenhunt, {
		shortDesc: 'Keen Eye; Rock moves gain 30% power (50% vs half-HP foes) and ignore Defense boosts.',
		desc: 'Full local Keen Eye. Rock moves gain 30% power, increased to 50% against foes at half HP or less, and ignore opposing positive Defense stages. Accuracy checks still apply.',
	});
	abilities.keenhunt.onBasePowerPriority = 21;
	abilities.keenhunt.onBasePower = function (power, source, target, move) {
		if (this.movehasType(move, 'Rock')) return this.chainModify(!source.isAlly(target) && target.hp <= target.maxhp / 2 ? 1.5 : 1.3);
	};
	delete abilities.bloodchallenge.onStart;
	delete abilities.bloodchallenge.onSourceModifyDamage;
	delete abilities.bloodchallenge.onDamagingHit;
	Object.assign(abilities.bloodchallenge, {flags: {breakable: 1}});
	abilities.bloodchallenge.onDamagePriority = -15;
	abilities.bloodchallenge.onDamage = function (damage, target, source, move) {
		if (!opposingAttack(source, target, move)) return;
		const token = attackToken(this, source, move as ActiveMove);
		if (target.m.bloodChallengeGuardTurn === this.turn && target.m.bloodChallengeGuardMove !== token) return;
		return this.chainModify(0.65);
	};
	abilities.bloodchallenge.onAfterDamageApplied = function (damage, target, source, move) {
		if (damage <= 0 || !opposingAttack(source, target, move) || target.m.bloodChallengeGuardTurn === this.turn) return;
		target.m.bloodChallengeGuardTurn = this.turn;
		target.m.bloodChallengeGuardMove = attackToken(this, source, move as ActiveMove);
	};
	abilities.bloodchallenge.onSourceDamagingHit = function (damage, target, source, move) {
		if (damage <= 0 || move.id !== 'counter' || source.isAlly(target) || !source.hp || source.m.bloodChallengeHealTurn === this.turn) return;
		source.m.bloodChallengeHealTurn = this.turn;
		this.heal(source.baseMaxhp / 4, source, source, this.effect);
	};
	abilities.bloodchallenge.onSourceAfterSubDamage = abilities.bloodchallenge.onSourceDamagingHit;
	Object.assign(abilities.bloodchallenge, {
		shortDesc: 'First foe attack each turn deals 35% less damage. Counter answers either category and heals 25% HP.',
		desc: 'The first opposing attack to damage its HP each turn deals 35% less damage across all hits. Counter answers physical or special attacks. Once per turn, Counter hitting a foe or its Substitute heals 25% max HP. Switching or ability changes do not reset either allowance; blocked healing spends that turn\'s heal.',
	});
	abilities.spinyhide = {
		name: 'Spiny Hide', num: 12067, rating: 4, flags: {},
		shortDesc: 'Defense and Sp. Def are 20% higher. Rough Skin + Poison Point.',
		desc: 'Defense and Sp. Def are 20% higher. Contact attackers lose 1/8 max HP and have a 30% chance to be poisoned, or 60% on Wasteland. Rough Skin\'s Thorn Tempered exception and normal contact protections apply.',
	};
	composeSelectedAbility(abilities, 'spinyhide', ['roughskin', 'poisonpoint']);
	abilities.spinyhide.onModifyDefPriority = 6;
	abilities.spinyhide.onModifySpDPriority = 6;
	abilities.spinyhide.onModifyDef = abilities.spinyhide.onModifySpD = function (stat, pokemon) {
		if ((!this.effectState.speciesPassive && pokemon.getPassives().includes('spinyhide')) ||
			this.suppressingAbility(pokemon, this.dex.abilities.get('spinyhide'))) return;
		return this.chainModify(1.2);
	};
}
