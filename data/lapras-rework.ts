import type {AbilityDataTable} from '../sim/dex-abilities';
import {composeSelectedAbility} from './selected-mega-simplifications';

type StormMove = ActiveMove & {stormChargeUser?: Pokemon};

function soothe(this: Battle, pokemon: Pokemon) {
	if (!pokemon.hp || !pokemon.isActive || pokemon.m.oceanLullabyTurn === this.turn) return;
	pokemon.m.oceanLullabyTurn = this.turn;
	for (const ally of [pokemon, ...pokemon.allies()]) {
		if (!ally.hp) continue;
		this.heal(ally.baseMaxhp / 16, ally, pokemon, this.effect);
		ally.removeVolatile('confusion');
	}
}

export function installLaprasRework(abilities: AbilityDataTable) {
	composeSelectedAbility(abilities, 'safeharbor', ['waterabsorb', 'hydration'], true);
	Object.assign(abilities.safeharbor, {
		flags: {},
		shortDesc: 'Water Absorb + Hydration. Switching out heals its replacement by 1/8 HP.',
		desc: 'Water Absorb + Hydration, including their water-field effects. Switching out heals its immediate replacement by 1/8 maximum HP after entry hazards, if it survives. Fainting does not trigger this healing.',
	});
	abilities.safeharbor.onSwitchOut = function (pokemon) {
		if (pokemon.hp) pokemon.side.addSlotCondition(pokemon, 'harborpassage', pokemon, this.effect);
	};
	composeSelectedAbility(abilities, 'oceanlullaby', ['shellarmor', 'icebody'], true);
	Object.assign(abilities.oceanlullaby, {
		flags: {},
		shortDesc: 'Shell Armor + Ice Body. Successful sound moves heal and soothe its side once per turn.',
		desc: 'Full local Shell Armor + Ice Body. Once per turn, damaging a foe with a sound move or successfully using a status sound move heals itself and active allies by 1/16 maximum HP and clears their confusion. Failed songs give no healing.',
	});
	// The primitive uses a boolean callback; preserve its own bypass rules in this composite.
	abilities.oceanlullaby.onCriticalHit = function (target) {
		if (!this.suppressingAbility(target, this.dex.abilities.get('shellarmor'))) return false;
	};
	abilities.oceanlullaby.onSourceDamagingHit = abilities.oceanlullaby.onSourceAfterSubDamage = function (damage, target, source, move) {
		if (damage > 0 && !source.isAlly(target) && move.flags.sound) soothe.call(this, source);
	};
	abilities.oceanlullaby.onAfterMove = function (source, target, move) {
		if (move.category === 'Status' && move.flags.sound &&
			(source.moveThisTurnResult === true || (move as any).restorativeChimeSuccess)) soothe.call(this, source);
	};
	// Keep the existing whole-attack guard and entry budget. Charge expenditure now needs damage.
	delete abilities.stormmemory.onTryMove;
	delete abilities.stormmemory.onAnyAfterDamageApplied;
	delete abilities.stormmemory.onAfterMove;
	abilities.stormmemory.onModifyMove = function (move: StormMove, source) {
		if (move.category === 'Status' || !this.movehasType(move, 'Electric') || !source.volatiles.stormcharge) return;
		move.stormChargeUser = source;
		if (move.id !== 'wildcharge' || move.isZ || move.isMax) return;
		const physical = source.getStat('atk', false, true) >= source.getStat('spa', false, true);
		move.category = physical ? 'Physical' : 'Special';
		move.overrideOffensiveStat = physical ? 'atk' : 'spa';
		move.overrideDefensiveStat = physical ? 'def' : 'spd';
		delete move.recoil;
	};
	abilities.stormmemory.onSourceDamagingHit = abilities.stormmemory.onSourceAfterSubDamage = function (damage, target, source, move: StormMove) {
		if (damage > 0 && !source.isAlly(target) && move.stormChargeUser === source) source.removeVolatile('stormcharge');
	};
	Object.assign(abilities.stormmemory, {
		shortDesc: 'First super-effective hit charges 1.5x Electric power; charged Wild Charge is adaptive, recoil-free.',
		desc: 'Once per entry, its first opposing super-effective attack that damages its HP deals 25% less damage. Surviving stores a charge for a 1.5x-power Electric attack. Charged Wild Charge uses the stronger staged attacking stat (physical on a tie) and causes no recoil. The charge is spent on damage to a foe or Substitute; misses, protection and immunity preserve it. Switching or losing the ability clears the charge.',
	});
	const {name, num, rating} = abilities.auroraresonance;
	abilities.auroraresonance = {
		name, num, rating, flags: {},
		shortDesc: 'Water/Ice hits cure its active side’s status. During Aurora Veil, those attacks gain 30% power.',
		desc: 'Water and Ice attacks have 1.3x power while its side has Aurora Veil. Once per turn, damaging a foe with either type cures major status on itself and active allies. Includes G-Max Resonance; its newly created Veil strengthens subsequent attacks.',
		onBasePower(power, source, target, move) {
			if (source.side.sideConditions.auroraveil && (this.movehasType(move, 'Water') || this.movehasType(move, 'Ice'))) return this.chainModify(1.3);
		},
		onSourceDamagingHit(damage, target, source, move) {
			if (damage <= 0 || !source.hp || source.isAlly(target) || source.m.auroraResonanceTurn === this.turn ||
				!(this.movehasType(move, 'Water') || this.movehasType(move, 'Ice'))) return;
			source.m.auroraResonanceTurn = this.turn;
			for (const ally of [source, ...source.allies()]) if (ally.hp && ally.status) ally.cureStatus();
		},
	};
	abilities.auroraresonance.onSourceAfterSubDamage = abilities.auroraresonance.onSourceDamagingHit;
}
