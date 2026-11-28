import type { MoveData } from '../sim/dex-moves';
import type { Signature } from './stone-signatures';

function restoreGlideStage(stat: 'spa' | 'spd'): NonNullable<MoveData['onAfterHit']> {
	return function (target, source, move) {
		if (source.isAlly(target) || source.boosts[stat] >= 0) return;
		if (source.m.glideRestoredEntry === source.previouslySwitchedIn) return;
		source.m.glideRestoredEntry = source.previouslySwitchedIn;
		source.setBoost({ [stat]: source.boosts[stat] + 1 });
		this.add('-setboost', source, stat, source.boosts[stat], '[from] move: ' + move.name);
	};
}

export const MegaSignatureExpansion: Record<string, Signature> = {
	garchompmega: {
		base: 'earthquake', name: 'Fault Cleave', num: 32820,
		desc: 'A slicing Ground attack that hits one adjacent target.',
		changes: {
			basePower: 100, target: 'normal',
			flags: { slicing: 1, protect: 1, mirror: 1, nonsky: 1, metronome: 1 },
		},
	},
	garchompmegaz: {
		base: 'dragonpulse', name: 'Sonic Lance', num: 32821,
		desc: 'A sound and pulse attack that hits through Substitute.',
		changes: {
			basePower: 125, secondary: null, infiltrates: true,
			flags: { sound: 1, pulse: 1, bypasssub: 1, protect: 1, mirror: 1, distance: 1, metronome: 1 },
		},
	},
	latiasmega: {
		base: 'mistball', name: 'Mist Glide', num: 32822,
		shortDesc: 'May lower Sp. Atk. Restores one lost Sp. Def stage once per entry.',
		desc: '50% chance to lower Sp. Atk by one stage (100% with Eon Sanctuary). Once per entry, damaging a foe restores one lost Sp. Def stage.',
		changes: { onAfterHit: restoreGlideStage('spd') },
	},
	latiosmega: {
		base: 'lusterpurge', name: 'Luster Glide', num: 32823,
		shortDesc: 'May lower Sp. Def. Restores one lost Sp. Atk stage once per entry.',
		desc: '50% chance to lower Sp. Def by one stage (100% with Eon Onslaught). Once per entry, damaging a foe restores one lost Sp. Atk stage.',
		changes: { onAfterHit: restoreGlideStage('spa') },
	},
	ampharosaevianmega: {
		base: 'icebeam', name: 'Polar Beacon', num: 32824,
		desc: 'In hail or snow, lowers the target’s Speed by one stage if it already used a move this turn.',
		changes: { secondary: { chance: 100, onHit(target, source, move) {
			if (['hail', 'snowscape'].includes(source.effectiveWeather()) && target.moveThisTurn) {
				this.boost({ spe: -1 }, target, source, move);
			}
		} } },
	},
	banettemegaz: {
		base: 'shadowsneak', name: 'Puppet Snare', num: 32825,
		desc: 'Usually goes first. A damaged foe cannot switch out using its own moves for the rest of the turn.',
		changes: {
			onHit(target, source, move) {
				if (target.hp && !source.isAlly(target)) target.addVolatile('puppetsnare', source, move);
			},
			condition: {
				duration: 1, noCopy: true,
				onModifyMovePriority: -100,
				onModifyMove(move, pokemon) {
					if (!move.selfSwitch) return;
					delete move.selfSwitch;
					this.add('-activate', pokemon, 'move: Puppet Snare');
				},
			},
		},
	},
	sharpedomegay: {
		base: 'aquajet', name: 'Torpedo Jet', num: 32826,
		desc: 'A non-contact Water attack with +1 priority.',
		changes: { category: 'Special', flags: { protect: 1, mirror: 1, metronome: 1 } },
	},
	empoleonmegay: {
		base: 'flashcannon', name: 'Crest Cannon', num: 32827,
		desc: 'Removes one stage from the foe’s larger positive Attack or Sp. Atk boost. Ties favor Attack.',
		changes: {
			basePower: 85, secondary: null,
			onAfterHit(target, source, move) {
				if (source.isAlly(target)) return;
				const stat = target.boosts.atk >= target.boosts.spa ? 'atk' : 'spa';
				if (target.boosts[stat] <= 0) return;
				target.setBoost({ [stat]: target.boosts[stat] - 1 });
				this.add('-setboost', target, stat, target.boosts[stat], '[from] move: ' + move.name);
			},
		},
	},
	glimmoramega: {
		base: 'mortalspin', name: 'Crystal Spin', num: 32828,
		desc: 'Poisons the target and clears hazards from the user’s side, plus Leech Seed and binding effects on the user.',
		changes: { basePower: 35, category: 'Special', flags: { protect: 1, mirror: 1, metronome: 1 } },
	},
};
