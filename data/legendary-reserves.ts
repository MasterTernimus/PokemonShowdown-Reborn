import type { AbilityDataTable } from '../sim/dex-abilities';

export const reserveSlots = {
	articunogalar: { 0: 'Competitive', 1: 'Thick Fat', H: 'Rime Mantle' },
	zapdosgalar: { 0: 'Defiant', 1: 'Volt Absorb', H: 'Storm Mantle' },
	moltresgalar: { 0: 'Berserk', 1: 'Heatproof', H: 'Cinder Mantle' },
	cosmog: { 0: 'Unaware', 1: 'Healer' },
	manaphy: { 0: 'Healer', 1: 'Own Tempo', H: 'Heart Current' },
	keldeo: { 0: 'Sharpness', 1: 'Inner Focus', H: 'Rushing Blade' },
	keldeoresolute: { 0: 'Sharpness', 1: 'Inner Focus', H: 'Rushing Blade' },
	victini: { 0: 'Flame Body', 1: 'Own Tempo', H: 'Victory Lap' },
	meltan: { 0: 'Magnet Pull', 1: 'Sturdy', H: 'Scrap Collector' },
	phione: { 0: 'Sea Blessing', 1: 'Hydration' },
};
export const reservePassives = {
	articunogalar: 'keeneye', zapdosgalar: 'steadfast', moltresgalar: 'unnerve',
	cosmog: 'nebuladrift', cosmoem: 'nebuladrift', manaphy: 'hydration', phione: 'healer',
	keldeo: 'justified', keldeoresolute: 'justified', meltan: 'stickyhold', victini: 'victorystar',
};
const mantles = {
	freezingglare: { id: 'rimemantle', type: 'Ice', original: 'Psychic' },
	thunderouskick: { id: 'stormmantle', type: 'Electric', original: 'Fighting' },
	fierywrath: { id: 'cindermantle', type: 'Fire', original: 'Dark' },
};

export function mantleMoveView(move: ActiveMove, source: Pokemon, target: Pokemon) {
	const mantle = mantles[move.id as keyof typeof mantles];
	if (!mantle || !source || !target || !source.hasAbility(mantle.id) || move.isMax || move.isZ) return move;
	const hit = target.getMoveHitData(move) as { mantleType?: string };
	if (!hit.mantleType) {
		const dex = source.battle.dex;
		const types = target.getTypes();
		const score = (type: string) => dex.getImmunity(type, types) ? dex.getEffectiveness(type, types) : -Infinity;
		hit.mantleType = score(mantle.type) > score(mantle.original) ? mantle.type : mantle.original;
	}
	return { ...move, type: hit.mantleType, types: [hit.mantleType], forceSTAB: true };
}

function entryGuard(
	id: string, qualifies: (battle: Battle, defender: Pokemon, move: ActiveMove) => boolean
): Pick<AbilityDataTable[ID], 'onSourceModifyDamage' | 'onDamagingHit'> {
	return {
		onSourceModifyDamage(damage, source, target, move) {
			if (source.isAlly(target) || (target.volatiles.substitute && !move.infiltrates && !move.flags.bypasssub)) return;
			const hit = target.getMoveHitData(move) as any;
			if (!hit[id] && target.m[id] !== target.m.ultraRivalryEntryToken && qualifies(this, target, move)) hit[id] = true;
			if (hit[id]) return this.chainModify(0.5);
		},
		onDamagingHit(damage, target, source, move) {
			if (damage > 0 && (target.getMoveHitData(move) as any)[id]) target.m[id] = target.m.ultraRivalryEntryToken;
		},
	};
}

const mantleText = (move: string, types: string, guard: string) =>
	`${move} uses the better of ${types} against each target with STAB. Halves the first opposing ${guard} attack to damage its HP each entry.`;
export const reserveDescriptions = {
	rimemantle: mantleText('Freezing Glare', 'Psychic or Ice', 'Ice'),
	stormmantle: mantleText('Thunderous Kick', 'Fighting or Electric', 'Electric or Psychic'),
	cindermantle: mantleText('Fiery Wrath', 'Dark or Fire', 'Fire'),
	nebuladrift: 'Once per entry, halves the first opposing attack while waiting to Teleport. Teleport heals the incoming ally by 1/3 HP. After Shelter or Cosmic Power this entry, it also cures the ally’s status once per battle.',
	heartcurrent: 'Once per entry, Heart Swap heals 1/4 max HP if it exchanges different stat stages.',
	rushingblade: 'Once per entry, heals 1/8 max HP when Secret Sword damages a foe.',
	scrapcollector: 'Once per entry, heals 1/8 max HP when a Steel move damages a foe.',
	victorylap: 'The first V-create to damage a foe each battle skips its Speed drop. Defense and Sp. Def still fall.',
};
export const reserveSummaries: Record<string, string> = {
	...reserveDescriptions,
	rimemantle: 'Freezing Glare picks Psychic or Ice STAB. Halves the first Ice hit each entry.',
	stormmantle: 'Thunderous Kick picks Fighting or Electric STAB. Halves the first Electric/Psychic hit each entry.',
	cindermantle: 'Fiery Wrath picks Dark or Fire STAB. Halves the first Fire hit each entry.',
	nebuladrift: 'Guards before Teleport once per entry. Teleport heals the incoming ally; setup can also cure status.',
};
function firstHitRecovery(
	id: string, qualifies: (battle: Battle, move: ActiveMove) => boolean
): AbilityDataTable[ID]['onSourceDamagingHit'] {
	return function (damage, target, source, move) {
		if (damage <= 0 || !source.hp || source.isAlly(target) || !qualifies(this, move) ||
			source.m[id] === source.m.ultraRivalryEntryToken) return;
		source.m[id] = source.m.ultraRivalryEntryToken;
		this.heal(source.baseMaxhp / 8, source, source, this.effect);
	};
}
export function installReserveAbilities(a: AbilityDataTable) {
	const names = ['Rime Mantle', 'Storm Mantle', 'Cinder Mantle', 'Nebula Drift',
		'Heart Current', 'Rushing Blade', 'Scrap Collector', 'Victory Lap'];
	for (const [index, name] of names.entries()) {
		const id = name.toLowerCase().replace(/ /g, '') as keyof typeof reserveDescriptions;
		a[id] = { name, num: 33501 + index, rating: 3, flags: {},
			shortDesc: reserveSummaries[id], desc: reserveDescriptions[id] };
	}
	for (const { id, type } of Object.values(mantles)) {
		Object.assign(a[id as ID], entryGuard(id, (battle, target, move) =>
			battle.movehasType(move, type) || (id === 'stormmantle' && battle.movehasType(move, 'Psychic'))));
	}
	Object.assign(a.livingrampart, entryGuard('livingrampart', (battle, target, move) =>
		(battle.movehasType(move, 'Ground') || battle.movehasType(move, 'Fighting')) &&
		target.getMoveHitData(move).typeMod > 0));
	Object.assign(a.nebuladrift, entryGuard('nebulaGuard', (battle, target) =>
		battle.queue.willMove(target)?.move.id === 'teleport'));
	a.nebuladrift.onAfterMoveSecondarySelf = function (source, target, move) {
		if (move.id === 'shelter' || move.id === 'cosmicpower') source.m.nebulaPrepared = source.m.ultraRivalryEntryToken;
	};
	a.rushingblade.onSourceDamagingHit = firstHitRecovery('rushingBlade', (b, m) => m.id === 'secretsword');
	a.scrapcollector.onSourceDamagingHit = firstHitRecovery('scrapCollector', (b, m) => b.movehasType(m, 'Steel'));
	a.victorylap.onSourceAfterDamageApplied = function (damage, target, source, move) {
		if (damage > 0 && move?.id === 'vcreate' && move.effectType === 'Move' &&
			!source.isAlly(target) && !source.m.victoryLapUsed) {
			source.m.victoryLapUsed = true;
			const active = this.activeMove;
			if (active?.id === 'vcreate' && active.self?.boosts) {
				active.self = { ...active.self, boosts: { ...active.self.boosts } };
				delete active.self.boosts!.spe;
			}
		}
	};
	a.victorylap.onSourceAfterSubDamage = a.victorylap.onSourceAfterDamageApplied;
}
