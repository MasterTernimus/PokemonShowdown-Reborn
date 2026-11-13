import type { AbilityDataTable } from '../sim/dex-abilities';
import type { ConditionDataTable } from '../sim/dex-conditions';
import { composeSelectedAbility } from './selected-mega-simplifications';

const jackpotAilments = [
	'attract', 'confusion', 'curse', 'voidcrossingcurse', 'disable', 'encore', 'embargo',
	'gastroacid', 'healblock', 'leechseed', 'nightmare', 'perishsong', 'taunt', 'torment',
	'yawn', 'partiallytrapped', 'trapped', 'octolock', 'powder', 'tarshot', 'saltcure', 'syrupbomb',
];

function cleanseJackpot(battle: Battle, pokemon: Pokemon) {
	if (pokemon.status) pokemon.cureStatus();
	for (const id of jackpotAilments) {
		if (!pokemon.volatiles[id]) continue;
		// Their natural expiry causes sleep/fainting, so cleansing must not call onEnd.
		if (id === 'yawn' || id === 'perishsong') {
			delete pokemon.volatiles[id];
			battle.add('-end', pokemon, `move: ${battle.dex.conditions.get(id).name}`, '[silent]');
		} else if (pokemon.removeVolatile(id) && !battle.dex.conditions.get(id).onEnd) {
			battle.add('-end', pokemon, `move: ${battle.dex.conditions.get(id).name}`, '[silent]');
		}
	}
}

export const JackpotConditions: ConditionDataTable = {
	jackpot: {
		name: 'Jackpot', noCopy: true,
		onStart(pokemon) {
			this.effectState.turns = 4;
			this.add('-start', pokemon, 'Jackpot');
			this.add('-message', 'The restless gambler hit the jackpot!');
			cleanseJackpot(this, pokemon);
		},
		onSourceModifyDamage(damage, source, target, move) {
			if (move.category !== 'Status') return this.chainModify(0.8);
		},
		onResidualOrder: 29,
		onResidual(pokemon) {
			if (!pokemon.hp) return;
			cleanseJackpot(this, pokemon);
			this.heal(pokemon.maxhp / 4, pokemon, pokemon, this.effect);
			// Count healing turns explicitly: duration expiry runs before residual callbacks.
			if (--this.effectState.turns === 0) pokemon.removeVolatile('jackpot');
		},
		onEnd(pokemon) { this.add('-end', pokemon, 'Jackpot'); },
	},
};

/** Replaces only eligible, unblocked self boosts, while preserving move success and drops. */
export function replaceFalseSalvationBoosts(
	battle: Battle, boost: SparseBoostsTable, target: Pokemon, source: Pokemon | null, effect: Effect | null
) {
	if (!boost || target !== source || effect?.effectType !== 'Move' || (effect).category !== 'Status' ||
		battle.activePokemon !== source || battle.activeMove?.id !== effect.id) return false;
	const positive = (Object.keys(boost) as BoostID[]).filter(stat => boost[stat]! > 0);
	if (!positive.length) return false;
	const hit = target.getMoveHitData(battle.activeMove) as ReturnType<Pokemon['getMoveHitData']> & {
		falseSalvationReplaced?: boolean,
	};
	if (hit.falseSalvationReplaced) {
		for (const stat of positive) delete boost[stat];
		return true;
	}
	for (const holder of battle.getAllActive()) {
		if (!holder.hp || holder.isAlly(target) || !holder.hasAbilityOrPassive('falsesalvation')) continue;
		const entry = holder.m.ultraRivalryEntryToken;
		if (holder.m.falseSalvationEntry !== entry) {
			holder.m.falseSalvationEntry = entry;
			holder.m.falseSalvationFoes = [];
		}
		const foes: Pokemon[] = holder.m.falseSalvationFoes ||= [];
		if (foes.includes(target)) continue;
		foes.push(target);
		hit.falseSalvationReplaced = true;
		for (const stat of positive) delete boost[stat];
		battle.add('-ability', holder, holder.getAbility().name);
		battle.add('-message', 'Its desire for power was replaced with comfort!');
		battle.heal(target.maxhp / 4, target, holder, battle.dex.abilities.get('falsesalvation'));
		return true;
	}
	return false;
}

export const JackpotSalvationDescriptions = {
	hotstreak: {
		shortDesc: 'Super Luck; damaging a foe can trigger four turns of Jackpot healing, cleansing and protection.',
		desc: 'Super Luck raises critical-hit rate by one stage. After damaging a foe, rolls a separate 20% Jackpot chance once per turn. Jackpot cures major status and harmful conditions on activation and at each turn end, and heals 1/4 max HP at each turn end. It reduces attack damage by 20% and lasts four turns including activation. It cannot refresh and ends on switching. Cleanses Attract, confusion, Curse, Void Crossing curse, Disable, Encore, Embargo, Gastro Acid, Heal Block, Leech Seed, Nightmare, Perish Song, Taunt, Torment, Yawn, trapping, Octolock, Powder, Tar Shot, Salt Cure and Syrup Bomb. Beneficial effects remain. It does not prevent fainting.',
	},
	falsesalvation: {
		shortDesc: 'Telepathy; once per foe each entry, replaces its status-move self boosts with 1/4 HP healing.',
		desc: 'Includes Telepathy: avoids allied damaging moves and doubles Speed on Psychic Terrain or Psychic Aura. Once per opposing Pokemon per entry, replaces the positive stat stages from its own successful status move with one heal of 1/4 max HP. At full HP the boosts are still removed. Preserves stat decreases and other move effects. The foe switching does not reset this; the holder switching does. Attacks, items, abilities and boosts from allies are unaffected.',
	},
};

export function installJackpotSalvation(abilities: AbilityDataTable) {
	abilities.hotstreak = {
		name: 'Hot Streak', num: 32591, rating: 4, flags: {}, ...JackpotSalvationDescriptions.hotstreak,
	};
	composeSelectedAbility(abilities, 'hotstreak', ['superluck'], true);
	abilities.hotstreak.onSourceAfterDamageApplied = function (damage, target, source, move) {
		if (move.effectType !== 'Move' || damage <= 0 || !source.hp || source.isAlly(target) || move.category === 'Status' ||
			source.volatiles.jackpot || source.m.hotStreakRollTurn === this.turn) return;
		source.m.hotStreakRollTurn = this.turn;
		if (this.randomChance(1, 5)) source.addVolatile('jackpot', source, this.effect);
	};
	abilities.falsesalvation = {
		name: 'False Salvation', num: 32592, rating: 4, flags: { breakable: 1 },
		...JackpotSalvationDescriptions.falsesalvation,
	};
	composeSelectedAbility(abilities, 'falsesalvation', ['telepathy'], true);
	// Vital Signs already owns Invigorate; False Salvation already owns Telepathy.
	composeSelectedAbility(abilities, 'divineintervention', ['vitalsigns', 'falsesalvation', 'regenerator'], true);
}
