import type { AbilityDataTable } from '../sim/dex-abilities';
import { composeSelectedAbility } from './selected-mega-simplifications';

export const GalarRisingDescriptions: Record<string, { shortDesc: string, desc: string }> = {
	risingstriker: {
		shortDesc: 'First Fire HP hit each entry: +1 Speed.',
		desc: 'Once per switch-in, damaging an opposing Pokemon with a Fire attack raises Speed by 1. Base and Gmax forms share this activation.',
	},
	risingrhythm: {
		shortDesc: 'First Grass HP hit each entry: +1 Defense and Sp. Def.',
		desc: 'Once per switch-in, damaging an opposing Pokemon with a Grass attack raises Defense and Sp. Def by 1. Base and Gmax forms share this activation.',
	},
	risingmarksman: {
		shortDesc: 'First Water HP hit each entry: +1 critical-hit stage until switching.',
		desc: 'Once per switch-in, damaging an opposing Pokemon with a Water attack raises the critical-hit ratio by 1 stage until switching out. Base and Gmax forms share this activation.',
	},
	grandstriker: {
		shortDesc: 'Striker + Defiant + Rising Striker; G-Max Fireball also gains 1.4x power.',
		desc: 'Striker boosts kicks and G-Max Fireball by 1.4x. Defiant grants +2 Attack when an opponent lowers its stats. Once per switch-in, damaging a foe with Fire grants +1 Speed; shared with Rising Striker.',
	},
	grandrhythm: {
		shortDesc: 'Forest Surge + Rising Rhythm.',
		desc: 'On entry, sets Forest Field and Grassy Aura for 5 turns, or 8 with Amplifield Rock, following field rules. Once per switch-in, damaging a foe with Grass grants +1 Defense and Sp. Def; shared with Rising Rhythm.',
	},
	grandmarksman: {
		shortDesc: 'Mega Launcher + Dual Wield + Rising Marksman; Water power 1.2x.',
		desc: 'Mega Launcher boosts pulse and bullet moves by 1.5x. Dual Wield grants its usual independent hits and power scaling. Water attacks gain 1.2x power. Once per switch-in, damaging a foe with Water grants +1 critical-hit stage until switching; shared with Rising Marksman.',
	},
};

export function installGalarRising(a: AbilityDataTable) {
	const names = ['Rising Striker', 'Rising Rhythm', 'Rising Marksman', 'Grand Striker', 'Grand Rhythm', 'Grand Marksman'];
	for (const [i, id] of Object.keys(GalarRisingDescriptions).entries()) a[id as ID] = {
		name: names[i],
		num: 32503 + i,
		rating: 4,
		flags: {},
	};
	for (const [id, type, role] of [
		[
			'risingstriker',
			'Fire',
			'striker',
		],
		[
			'risingrhythm',
			'Grass',
			'rhythm',
		],
		[
			'risingmarksman',
			'Water',
			'marksman',
		],
	]) {
		a[id as ID].onSourceDamagingHit = function (damage, target, source, move) {
			if (damage <= 0 || !source.hp || target.isAlly(source) || !this.movehasType(move, type)) return;
			if (!source.volatiles['risingmomentum']) source.addVolatile('risingmomentum', source, this.effect);
			const state = source.volatiles['risingmomentum'];
			if (!state || state[role]) return;
			state[role] = true;
			if (role === 'striker') this.boost({ spe: 1 }, source, source);
			else if (role === 'rhythm') this.boost({ def: 1, spd: 1 }, source, source);
			else this.add('-message', source.name + ' took aim!');
		};
	}
	composeSelectedAbility(a, 'grandstriker', ['striker', 'defiant', 'risingstriker']);
	a.grandstriker.onBasePower = function (power, source, target, move) {
		if (move.id === 'gmaxfireball') return this.chainModify(1.4);
		return this.dex.abilities.get('striker').onBasePower?.call(this, power, source, target, move);
	};
	composeSelectedAbility(a, 'grandrhythm', ['risingrhythm']);
	a.grandrhythm.onStart = a.forestsurge.onStart;
	composeSelectedAbility(a, 'grandmarksman', ['risingmarksman']);
	a.grandmarksman.onBasePowerPriority = a.highnoon.onBasePowerPriority;
	a.grandmarksman.onBasePower = a.highnoon.onBasePower;
	a.grandmarksman.onModifyMove = a.dualwield.onModifyMove;
}
