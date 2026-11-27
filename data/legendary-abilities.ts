import type { AbilityDataTable } from '../sim/dex-abilities';

export const legendaryTexts = {
	firstdraft: ['First Draft', 'Once per entry, a successful Transform or Reflect Type restores 1/8 max HP.'],
	lunarwake: [
		'Lunar Wake',
		'Once per turn, curing status with Lunar Blessing heals the user by 1/16 max HP.',
	],
	dreamstalker: ['Dream Stalker', 'Once per entry, damaging a sleeping foe restores 1/8 max HP.'],
	seedcourier: [
		'Seed Courier',
		'Once per entry, damaging a foe with Seed Flare cures one active ally’s major status.',
	],
	coldreserve: [
		'Cold Reserve',
		'Once per entry, surviving a super-effective hit restores 1/16 max HP after the attack.',
	],
	signaturedrive: [
		'Signature Drive',
		'Techno Blast deals 15% more damage when its type matches the active held Drive.',
	],
	crystalfacet: [
		'Crystal Facet',
		'Once per entry, a Rock attack that damages its HP clears its negative Defense stages.',
	],
	ringtrick: [
		'Ring Trick',
		'Once per entry, a direct KO with Hyperspace Hole or Hyperspace Fury restores 1 PP to that move.',
	],
	boilervent: [
		'Boiler Vent',
		'Once per entry, damaging a foe with Steam Eruption clears the user’s negative Speed stages.',
	],
	islandwatch: [
		'Island Watch',
		'Once per entry, another teammate recovering from a major status heals the holder by 1/16 max HP.',
	],
	lightcache: ['Light Cache', 'Once per entry, a direct Photon Geyser KO restores 1 PP to Photon Geyser.'],
	shadowstep: [
		'Shadow Step',
		'Once per entry, Spectral Thief cures the user’s major status if it steals a boost and damages the foe.',
		'Once per entry, Spectral Thief cures status after stealing a boost and damaging its foe.',
	],
	bulwarkrelay: [
		'Bulwark Relay',
		'Once per entry, blocking an enemy spread attack with Wide Guard heals the other active ally with the lowest HP percentage by 1/8.',
		'Once per entry, Wide Guard blocking a spread move heals the lowest-HP ally by 1/8.',
	],
	vinerelay: [
		'Vine Relay',
		'Once per entry, curing another ally’s major status with Jungle Healing raises the user’s Defense by 1.',
		'Once per entry, curing an ally’s status with Jungle Healing raises Defense by 1.',
	],
	crowntending: [
		'Crown Tending',
		'Once per turn, healing an ally with Pollen Puff restores 1/16 of the user’s max HP.',
	],
	snowpassage: ['Snow Passage', 'Once per entry, cures paralysis at turn end in hail or snow.'],
	maskmender: [
		'Mask Mender',
		'Once per battle, damaging a foe with Ivy Cudgel while below half HP restores 1/16 max HP.',
	],
	bindingchain: [
		'Binding Chain',
		'Once per entry, damaging a poisoned foe with Malignant Chain disables its last successful move for two turns. Checks after poison is applied.',
		'Once per entry, Malignant Chain disables a poisoned foe’s last successful move for 2 turns.',
	],
};

function firstThisEntry(pokemon: Pokemon, id: string) {
	const entries = (pokemon.m.legendaryUses ||= {});
	const entry = pokemon.m.ultraRivalryEntryToken;
	if (entries[id] === entry) return false;
	entries[id] = entry;
	return true;
}

export function rewardFirstDraft(battle: Battle, source: Pokemon) {
	if (firstThisEntry(source, 'firstdraft'))
		battle.heal(source.baseMaxhp / 8, source, source, battle.dex.abilities.get('firstdraft'));
}

export function rewardTeamCure(battle: Battle, move: ActiveMove, source: Pokemon, cured: Pokemon) {
	if (
		move.id === 'lunarblessing' &&
		source.hasAbilityOrPassive('lunarwake') &&
		source.m.lunarWakeTurn !== battle.turn
	) {
		source.m.lunarWakeTurn = battle.turn;
		battle.heal(source.baseMaxhp / 16, source, source, battle.dex.abilities.get('lunarwake'));
	}
	if (
		move.id === 'junglehealing' &&
		source !== cured &&
		source.isAlly(cured) &&
		source.hasAbilityOrPassive('vinerelay') &&
		firstThisEntry(source, 'vinerelay')
	) {
		battle.boost({ def: 1 }, source, source, battle.dex.abilities.get('vinerelay'));
	}
}

export function rewardIslandWatch(cured: Pokemon) {
	for (const ally of cured.allies()) {
		if (ally.hp && ally.hasAbilityOrPassive('islandwatch') && firstThisEntry(ally, 'islandwatch'))
			ally.battle.heal(ally.baseMaxhp / 16, ally, ally, ally.battle.dex.abilities.get('islandwatch'));
	}
}

export function rewardWideGuard(battle: Battle, holder: Pokemon, attacker: Pokemon, move: ActiveMove) {
	if (
		!holder?.isActive ||
		!holder.hp ||
		holder.isAlly(attacker) ||
		move.category === 'Status' ||
		!holder.hasAbilityOrPassive('bulwarkrelay')
	)
		return;
	const allies = holder.allies().filter(ally => ally.hp && ally.hp < ally.maxhp);
	allies.sort((a, b) => a.hp / a.maxhp - b.hp / b.maxhp);
	if (allies.length && firstThisEntry(holder, 'bulwarkrelay'))
		battle.heal(allies[0].baseMaxhp / 8, allies[0], holder, battle.dex.abilities.get('bulwarkrelay'));
}

type Hit = NonNullable<AbilityDataTable[ID]['onSourceDamagingHit']>;
function damagingFoe(callback: Hit): Hit {
	return function (damage, target, source, move) {
		if (damage > 0 && source.hp && !source.isAlly(target))
			return callback.call(this, damage, target, source, move);
	};
}

function restoreSignaturePP(id: string, moves: string[]): AbilityDataTable[ID]['onSourceAfterFaint'] {
	return function (length, target, source, effect) {
		if (!source.hp || source.isAlly(target) || effect?.effectType !== 'Move' || !moves.includes(effect.id))
			return;
		const slot = source.getMoveData(effect.id);
		if (!slot || slot.pp >= slot.maxpp || !firstThisEntry(source, id)) return;
		slot.pp++;
		this.add('-activate', source, 'ability: ' + this.dex.abilities.get(id).name);
		this.add('-message', source.name + ' restored 1 PP to ' + effect.name + '!');
	};
}

const signatureDriveBoost = (source: Pokemon, move: ActiveMove) =>
	move.id === 'technoblast' && !source.ignoringItem() && source.getItem().onDrive === move.type;

export function installLegendaryAbilities(a: AbilityDataTable) {
	for (const [index, [id, [name, desc, shortDesc = desc]]] of Object.entries(legendaryTexts).entries()) {
		a[id as ID] = { name, desc, shortDesc, num: 33520 + index, flags: {}, rating: 2 };
	}
	a.dreamstalker.onSourceDamagingHit = damagingFoe(function (damage, target, source) {
		if (target.status === 'slp' && firstThisEntry(source, 'dreamstalker'))
			this.heal(source.baseMaxhp / 8, source, source, this.effect);
	});
	a.seedcourier.onSourceDamagingHit = damagingFoe((damage, target, source, move) => {
		const ally = move.id === 'seedflare' && source.allies().find(p => p.hp && p.status);
		if (ally && firstThisEntry(source, 'seedcourier')) ally.cureStatus();
	});
	a.coldreserve.onDamagingHit = function (damage, target, source, move) {
		if (damage > 0 && !target.isAlly(source) && target.getMoveHitData(move).typeMod > 0)
			target.getMoveHitData(this.activeMove || move).coldReserve = true;
	};
	a.coldreserve.onAnyAfterAttackResolved = function (source, target, move) {
		const holder: Pokemon = this.effectState.target;
		if (
			holder.hp &&
			move.moveHitData?.[holder.getSlot()]?.coldReserve &&
			firstThisEntry(holder, 'coldreserve')
		)
			this.heal(holder.baseMaxhp / 16, holder, holder, this.effect);
	};
	a.coldreserve.onAnyAfterTargetedMove = a.coldreserve.onAnyAfterAttackResolved;
	Object.assign(a.signaturedrive, {
		dualWieldDamageBoost: (source: Pokemon, target: Pokemon, move: ActiveMove) => signatureDriveBoost(source, move),
	});
	a.signaturedrive.onModifyDamage = function (damage, source, target, move) {
		if (signatureDriveBoost(source, move))
			return this.chainModify(1.15);
	};
	a.crystalfacet.onDamagingHit = function (damage, target, source, move) {
		if (
			damage > 0 &&
			target.hp &&
			!target.isAlly(source) &&
			this.movehasType(move, 'Rock') &&
			target.boosts.def < 0 &&
			firstThisEntry(target, 'crystalfacet')
		) {
			target.boosts.def = 0;
			this.add('-setboost', target, 'def', 0, '[from] ability: Crystal Facet');
		}
	};
	a.ringtrick.onSourceAfterFaint = restoreSignaturePP('ringtrick', ['hyperspacehole', 'hyperspacefury']);
	a.lightcache.onSourceAfterFaint = restoreSignaturePP('lightcache', ['photongeyser']);
	a.boilervent.onSourceDamagingHit = damagingFoe(function (damage, target, source, move) {
		if (move.id === 'steameruption' && source.boosts.spe < 0 && firstThisEntry(source, 'boilervent')) {
			source.boosts.spe = 0;
			this.add('-setboost', source, 'spe', 0, '[from] ability: Boiler Vent');
		}
	});
	a.shadowstep.onSourceDamagingHit = damagingFoe((damage, target, source, move) => {
		if (
			move.id === 'spectralthief' &&
			target.getMoveHitData(move).stoleBoosts &&
			source.status &&
			firstThisEntry(source, 'shadowstep')
		)
			source.cureStatus();
	});
	a.snowpassage.onResidualOrder = 28;
	a.snowpassage.onResidual = function (p) {
		if (
			p.status === 'par' &&
			['hail', 'snow'].includes(p.effectiveWeather()) &&
			firstThisEntry(p, 'snowpassage')
		)
			p.cureStatus();
	};
	a.maskmender.onSourceDamagingHit = damagingFoe(function (damage, target, source, move) {
		if (move.id !== 'ivycudgel' || source.hp * 2 >= source.maxhp || source.m.maskMenderSpent) return;
		source.m.maskMenderSpent = true;
		this.heal(source.baseMaxhp / 16, source, source, this.effect);
	});
	a.bindingchain.onSourceDamagingHit = damagingFoe((damage, target, source, move) => {
		if (move.id === 'malignantchain') target.getMoveHitData(move).chainHit = true;
	});
	a.bindingchain.onAfterMoveSecondarySelf = function (source, target, move) {
		if (
			move.id !== 'malignantchain' ||
			!target?.hp ||
			!target.getMoveHitData(move).chainHit ||
			!['psn', 'tox'].includes(target.status) ||
			!target.m.lastSuccessfulMove ||
			!target.getMoveData(target.m.lastSuccessfulMove)?.pp ||
			target.volatiles.disable ||
			source.m.legendaryUses?.bindingchain === source.m.ultraRivalryEntryToken
		)
			return;
		if (target.addVolatile('disable', source, this.effect)) firstThisEntry(source, 'bindingchain');
	};
}
