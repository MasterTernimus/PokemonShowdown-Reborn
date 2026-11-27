import type { AbilityData } from '../sim/dex-abilities';

export function removeSpikesLayer(battle: Battle, side: Side) {
	const spikes = side.getSideConditionData('spikes');
	if (!spikes) return;
	const remaining = spikes.layers - 1;
	if (remaining) spikes.layers = remaining;
	else side.removeSideCondition('spikes');
	// The battle protocol represents layers as consecutive side starts.
	battle.add('-sideend', side, 'Spikes');
	for (let i = 0; i < remaining; i++) battle.add('-sidestart', side, 'Spikes');
}

export function clearEntryHazards(battle: Battle, source: Pokemon, from: string) {
	for (const id of ['spikes', 'toxicspikes', 'stealthrock', 'stickyweb', 'gmaxsteelsurge', 'dragonrend']) {
		if (!source.side.removeSideCondition(id)) continue;
		battle.add('-sideend', source.side, battle.dex.conditions.get(id).name, '[from] ' + from, `[of] ${source}`);
	}
}

function clearHazards(this: Battle, damage: number, target: Pokemon, source: Pokemon, move: ActiveMove) {
	if (damage <= 0 || !source.hp || !move.flags.slicing || move.category === 'Status') return;
	clearEntryHazards(this, source, 'ability: Dune Carver');
}

export const DuneCarver: AbilityData = {
	name: 'Dune Carver', num: 12065, rating: 4, flags: { breakable: 1 },
	shortDesc: 'Takes 20% less physical damage. Slicing hits clear hazards from its side.',
	desc: 'Physical attacks deal 20% less damage. Successful slicing attacks clear entry hazards from its side, including hits against a Substitute.',
	onSourceModifyDamage(damage, source, target, move) {
		if (move.category === 'Physical') return this.chainModify(0.8);
	},
	onSourceDamagingHit: clearHazards,
	onSourceAfterSubDamage: clearHazards,
};
