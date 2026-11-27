import type { MoveData, MoveDataTable } from '../sim/dex-moves';
import { KalosRipostes } from './kalos-ripostes';
import { MegaSignatureExpansion } from './mega-signature-expansion';
import { MegaSignaturesWaveTwo } from './mega-signatures-wave-two';
import { MegaSignaturesWaveThree } from './mega-signatures-wave-three';
import { MegaSignaturesNov26A } from './mega-signatures-nov26-a';
import { MegaSignaturesNov26B } from './mega-signatures-nov26-b';
import { MegaSignaturesNov26C } from './mega-signatures-nov26-c';
import { clearEntryHazards, removeSpikesLayer } from './dune-carver';

export interface Signature {
	base: string; name: string; num: number; desc: string;
	shortDesc?: string;
	/** Neutral accuracy for signatures whose original move overrides accuracy in weather. */
	baseAccuracy?: number;
	/** Starting type for signatures whose original move changes type on a field. */
	baseType?: string;
	changes: Partial<MoveData>;
}

function damagedFoe(target: Pokemon, source: Pokemon, move: ActiveMove) {
	return !source.isAlly(target) && (target.getMoveHitData(move).damage || 0) > 0;
}

const cinderRush: Signature = {
	base: 'flareblitz', name: 'Cinder Rush', num: 32980,
	desc: '120 power. Recoil is reduced to 1/4 of damage dealt. Keeps Flare Blitz’s burn chance and thawing effect.',
	changes: { recoil: [1, 4] },
};

export const StoneSignatures: Record<string, Signature> = {
	charizardmegax: cinderRush,
	charizardmegaxalt: cinderRush,
	charizardmegay: {
		base: 'heatwave', name: 'Corona Flare', num: 32981,
		desc: 'A 95-power heat wave with 100% accuracy. Hits adjacent foes and has a 10% chance to burn each one.',
		changes: { accuracy: 100 },
	},
	venusaurmega: {
		base: 'sludgebomb', name: 'Blight Bloom', num: 32982,
		desc: 'Has a 30% chance to poison. Drains 1/4 of the damage dealt to an already poisoned foe.',
		changes: { onPrepareHit(target, source, move) {
			if (!source.isAlly(target) && (target.status === 'psn' || target.status === 'tox')) {
				move.drain = [1, 4];
			}
		} },
	},
	blastoisemega: {
		base: 'waterpulse', name: 'Broadside', num: 32983,
		shortDesc: 'Clears one layer of Spikes on hit. 20% confusion.',
		desc: 'Has a 20% chance to confuse. Damaging a foe clears one layer of Spikes from the user’s side per use.',
		changes: { basePower: 75,
			onAfterHit(target, source, move: ActiveMove & { broadsideCleared?: boolean }) {
				if (move.broadsideCleared || !damagedFoe(target, source, move)) return;
				move.broadsideCleared = true;
				removeSpikesLayer(this, source.side);
			},
		},
	},
	...KalosRipostes,
	...MegaSignatureExpansion,
	...MegaSignaturesWaveTwo,
	...MegaSignaturesWaveThree,
	...MegaSignaturesNov26A,
	...MegaSignaturesNov26B,
	...MegaSignaturesNov26C,
	miloticmega: {
		base: 'waterpulse', name: 'Soothing Tide', num: 32800,
		desc: 'Restores HP equal to 25% of damage dealt.',
		changes: { basePower: 75, drain: [1, 4], secondary: null },
	},
	lucariomega: {
		base: 'aurasphere', name: 'Aura Fist', num: 32802,
		desc: 'An aura punch that never misses. Retains pulse and bullet effects.',
		changes: {
			category: 'Physical',
			flags: { contact: 1, punch: 1, pulse: 1, bullet: 1, distance: 1, protect: 1, mirror: 1, metronome: 1 },
		},
	},
	lucariomegaz: {
		base: 'aurasphere', name: 'Aura Lance', num: 32803,
		desc: 'Never misses. Pierces the target’s Substitute.',
		changes: {
			infiltrates: true,
			flags: { bypasssub: 1, pulse: 1, bullet: 1, distance: 1, protect: 1, mirror: 1, metronome: 1 },
		},
	},
	abomasnowmega: {
		base: 'woodhammer', name: 'Frost Hammer', num: 32804,
		desc: 'The user takes 1/8 of damage dealt as recoil.',
		changes: { basePower: 105, recoil: [1, 8] },
	},
	tyranitarmega: {
		base: 'stoneedge', name: 'Ruin Edge', num: 32805,
		desc: 'High critical-hit rate. Never misses in a sandstorm.',
		changes: { accuracy: 90, onModifyMove(move, source) {
			if (source.effectiveWeather() === 'sandstorm') move.accuracy = true;
		} },
	},
	haxorusmega: {
		base: 'dualchop', name: 'Twin Cleaver', num: 32806,
		desc: 'Hits twice. Both hits ignore the target’s positive defensive stages.',
		changes: { basePower: 50, accuracy: 100, ignorePositiveDefensive: true },
	},
	excadrillmega: {
		base: 'drillrun', name: 'Claw Drill', num: 32807,
		desc: 'High critical-hit rate. Drills through Substitute.',
		changes: {
			basePower: 85, infiltrates: true,
			flags: { bypasssub: 1, contact: 1, drill: 1, protect: 1, mirror: 1, metronome: 1 },
		},
	},
	flygonmega: {
		base: 'bugbuzz', name: 'Wing Echo', num: 32808,
		desc: 'A sound attack that hits through Substitute. After a successful hit, the user switches out.',
		changes: { basePower: 75, secondary: null, selfSwitch: true },
	},
	flygonmegaz: {
		base: 'boomburst', name: 'Dune Echo', num: 32809,
		desc: 'A focused Ground-type sound attack. Hits one target through Substitute.',
		changes: { basePower: 90, type: 'Ground', target: 'normal' },
	},
	glimmoraaevianmega: {
		base: 'injection', name: 'Petal Spike', num: 32810,
		desc: 'Targets the lower of Defense and Sp. Def. Makes contact and heals 50% of damage dealt.',
		changes: {},
	},
	sceptilemega: {
		base: 'leafblade', name: 'Leaf Rush', num: 32811,
		desc: 'High critical-hit rate. Damaging a foe ends partial trapping and restores one lost Speed stage.',
		changes: {
			onAfterHit(target, source, move) {
				if (!damagedFoe(target, source, move)) return;
				source.removeVolatile('partiallytrapped');
				if (source.boosts.spe < 0) {
					source.setBoost({ spe: source.boosts.spe + 1 });
					this.add('-setboost', source, 'spe', source.boosts.spe, '[from] move: Leaf Rush');
				}
			},
		},
	},
	blazikenmega: {
		base: 'blazekick', name: 'Blaze Rush', num: 32812,
		desc: 'High critical-hit rate and a 10% chance to burn. Breaks Reflect after damaging a foe.',
		changes: {
			basePower: 90, accuracy: 100,
			onAfterHit(target, source, move) {
				if (damagedFoe(target, source, move)) target.side.removeSideCondition('reflect');
			},
		},
	},
	swampertmega: {
		base: 'muddywater', name: 'Tide Rush', num: 32813,
		desc: 'Hits both adjacent foes. Damaging a foe clears all entry hazards, including Sticky Web, from the user’s side.',
		changes: {
			basePower: 85, accuracy: 95, category: 'Physical', secondary: null,
			onAfterHit(target, source, move: ActiveMove & { tideRushCleared?: boolean }) {
				if (move.tideRushCleared || !damagedFoe(target, source, move)) return;
				move.tideRushCleared = true;
				clearEntryHazards(this, source, 'move: Tide Rush');
			},
		},
	},
};

// Drake Fang changes the actual slot and retains its own PP handling in the simulator.
export const MegaSignatureDisplayRoutes = {
	...StoneSignatures, sevipermega: { base: 'poisonfang', name: 'Drake Fang' },
};

// Historical standalone move data for saved replays.
export const RetiredStoneSignatures: Record<string, Signature> = {
	garlandburst: {
		base: 'magicalleaf', name: 'Garland Burst', num: 32920,
		desc: 'A 75-power Grass attack that never misses.', changes: { basePower: 75 },
	},
	emberbloom: {
		base: 'energyball', name: 'Ember Bloom', num: 32921,
		desc: 'A 95-power Fire orb with a 10% chance to lower the target’s Sp. Def.', changes: { type: 'Fire', basePower: 95 },
	},
	timbercrash: {
		base: 'woodhammer', name: 'Timber Crash', num: 32923,
		desc: 'The user takes recoil equal to 1/4 of the damage dealt.', changes: { recoil: [1, 4] },
	},
	blazeknuckle: {
		base: 'firepunch', name: 'Blaze Knuckle', num: 32925,
		desc: 'A 90-power punch that ignores evasion stages. Has a 20% chance to lower Defense.',
		changes: { basePower: 90, ignoreEvasion: true },
	},
	pouchpunch: {
		base: 'dizzypunch', name: 'Pouch Punch', num: 32801,
		desc: 'After damaging a foe, heals the adjacent ally with the lowest HP percentage by 1/8 max HP. Heals the user if alone.',
		changes: { secondary: null, onAfterMoveSecondarySelf(source, target, move) {
			if (!source.hp || !target || source.isAlly(target) || !move.totalDamage) return;
			const allies = source.adjacentAllies().filter(ally => ally.hp);
			const recipient = allies.sort((a, b) => a.hp / a.maxhp - b.hp / b.maxhp)[0] || source;
			this.heal(recipient.baseMaxhp / 8, recipient, source, move);
		} },
	},
	quadpress: {
		base: 'meteormash', name: 'Quad Press', num: 32814,
		desc: 'Uses the user’s Defense to attack. Has a 20% chance to raise its Defense by 1.',
		changes: {
			basePower: 85, accuracy: 100, overrideOffensiveStat: 'def',
			secondary: { chance: 20, self: { boosts: { def: 1 } } },
		},
	},
};

/** A wrapper in this set has no native onModifyMove behavior outside its matching Mega forms. */
export const signatureOnlyMoveModifiers = new WeakSet<NonNullable<MoveData['onModifyMove']>>();

export function installStoneSignatures(moves: MoveDataTable) {
	const adaptiveBonuses = new Set(Object.values({
		...MegaSignaturesNov26A, ...MegaSignaturesNov26B, ...MegaSignaturesNov26C,
	}));
	const originalModifiers = new Map<string, MoveData['onModifyMove']>();
	for (const [form, signature] of Object.entries({ ...StoneSignatures, ...RetiredStoneSignatures })) {
		const { base, name, num, changes, baseAccuracy, baseType } = signature;
		const original = moves[base as ID];
		const { onModifyMove, ...properties } = changes;
		const id = name.toLowerCase().replace(/[^a-z0-9]/g, '') as ID;
		moves[id] = { ...original, ...properties, name, num, isNonstandard: 'Custom', onModifyMove };
		if (baseAccuracy !== undefined) moves[id].accuracy = baseAccuracy;
		if (baseType) moves[id].type = baseType;
		if (form in RetiredStoneSignatures) continue;
		const prior = original.onModifyMove;
		if (!originalModifiers.has(base)) originalModifiers.set(base, prior);
		const baseModifier = originalModifiers.get(base);
		const applySignature: NonNullable<MoveData['onModifyMove']> = function (move, user, target) {
			if (adaptiveBonuses.has(signature) && original.category !== 'Status') {
				move.signatureLearnedPower = original.basePower;
			}
			// Later abilities can edit flags and secondaries on this use of the move.
			Object.assign(move, this.dex.deepClone(properties), { name });
			if ('secondary' in properties) move.secondaries = move.secondary ? [move.secondary] : null;
			onModifyMove?.call(this, move, user, target);
		};
		// Direct lookups (including calculator sets) run the learned move's native effects too.
		moves[id].onModifyMove = function (move, user, target) {
			if (StoneSignatures[user.species.id]?.name === name) (move as { id: ID }).id = base as ID;
			baseModifier?.call(this, move, user, target);
			applySignature.call(this, move, user, target);
		};
		original.onModifyMove = function (move, user, target) {
			if (baseAccuracy !== undefined && user.species.id === form) move.accuracy = baseAccuracy;
			if (baseType && user.species.id === form) move.type = baseType;
			prior?.call(this, move, user, target);
			if (user.species.id === form) applySignature.call(this, move, user, target);
		};
		// The field-guide exporter serializes the learned move's own hook without the form dispatch closure.
		Object.assign(original.onModifyMove, { nativeOnModifyMove: baseModifier });
		if (!baseModifier) signatureOnlyMoveModifiers.add(original.onModifyMove);
	}
}
