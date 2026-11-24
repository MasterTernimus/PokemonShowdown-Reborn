import type { MoveData, MoveDataTable } from '../sim/dex-moves';

interface Signature {
	base: string; name: string; num: number; desc: string;
	changes: Partial<MoveData>;
}

export const StoneSignatures: Record<string, Signature> = {
	miloticmega: {
		base: 'waterpulse', name: 'Soothing Tide', num: 32800,
		desc: 'Restores HP equal to 25% of damage dealt.',
		changes: { basePower: 75, drain: [1, 4], secondary: null },
	},
	lucariomega: {
		base: 'aurasphere', name: 'Aura Fist', num: 32802,
		desc: 'A physical aura punch that never misses. Retains pulse and bullet effects.',
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
		desc: 'Hits twice. Both hits ignore the target’s positive Defense stages.',
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
		desc: 'Uses Sp. Atk against the lower of the target’s Defense and Sp. Def. Makes contact and heals 50% of damage dealt.',
		changes: {},
	},
	sceptilemega: {
		base: 'leafblade', name: 'Leaf Rush', num: 32811,
		desc: 'High critical-hit rate. Uses the user’s higher attacking stat; remains a slicing move.',
		changes: { onModifyMove(move, source) {
			move.category = source.getStat('spa', false, true) > source.getStat('atk', false, true) ? 'Special' : 'Physical';
		} },
	},
	blazikenmega: {
		base: 'blazekick', name: 'Blaze Rush', num: 32812,
		desc: 'High critical-hit rate. Has a 10% chance to burn.',
		changes: { basePower: 90, accuracy: 100 },
	},
	swampertmega: {
		base: 'muddywater', name: 'Tide Rush', num: 32813,
		desc: 'A physical Water attack that hits both adjacent foes.',
		changes: { basePower: 85, accuracy: 95, category: 'Physical', secondary: null },
	},
};

// Historical standalone move data for saved replays. These forms now use their ordinary moves.
export const RetiredStoneSignatures: Record<string, Signature> = {
	kangaskhanmega: {
		base: 'dizzypunch', name: 'Pouch Punch', num: 32801,
		desc: 'After damaging a foe, heals the adjacent ally with the lowest HP percentage by 1/8 max HP. Heals the user if alone.',
		changes: { secondary: null, onAfterMoveSecondarySelf(source, target, move) {
			if (!source.hp || !target || source.isAlly(target) || !move.totalDamage) return;
			const allies = source.adjacentAllies().filter(ally => ally.hp);
			const recipient = allies.sort((a, b) => a.hp / a.maxhp - b.hp / b.maxhp)[0] || source;
			this.heal(recipient.baseMaxhp / 8, recipient, source, move);
		} },
	},
	metagrossmega: {
		base: 'meteormash', name: 'Quad Press', num: 32814,
		desc: 'Uses the user’s Defense to attack. Has a 20% chance to raise its Defense by 1.',
		changes: {
			basePower: 85, accuracy: 100, overrideOffensiveStat: 'def',
			secondary: { chance: 20, self: { boosts: { def: 1 } } },
		},
	},
};

export function installStoneSignatures(moves: MoveDataTable) {
	for (const [form, { base, name, num, changes }] of Object.entries({ ...StoneSignatures, ...RetiredStoneSignatures })) {
		const original = moves[base as ID];
		const { onModifyMove, ...properties } = changes;
		const id = name.toLowerCase().replace(/[^a-z0-9]/g, '') as ID;
		moves[id] = { ...original, ...properties, name, num, isNonstandard: 'Custom', onModifyMove };
		if (form in RetiredStoneSignatures) continue;
		const prior = original.onModifyMove;
		original.onModifyMove = function (move, user, target) {
			prior?.call(this, move, user, target);
			if (user.species.id !== form) return;
			// Later abilities can edit flags and secondaries on this use of the move.
			Object.assign(move, this.dex.deepClone(properties), { name });
			if ('secondary' in properties) move.secondaries = move.secondary ? [move.secondary] : null;
			onModifyMove?.call(this, move, user, target);
		};
	}
}
