import type { AbilityDataTable } from '../sim/dex-abilities';

export const PassiveCleanupDescriptions = {
 rivalry: {shortDesc: '1.3x power vs same-gender or genderless targets; other allies take 0.75x attack damage. Stacks.', desc: 'Damaging moves have 1.3x power against targets of the same gender or genderless targets. All other matchups retain normal power with no penalty. Other allies take 25% less attack damage, including friendly fire, regardless of gender; the holder does not protect itself. Protection stacks with Friend Guard and with each other Rivalry holder. The same holder\'s active and passive Rivalry do not duplicate its effects.'},
	rockypayload: {
		shortDesc: 'Rock STAB; Rock attacks use 1.5x offense, or 2x on Rocky Field.',
		desc: 'Rock-type attacks receive STAB. The attacking stat used by a Rock-type attack is multiplied by 1.5, or by 2 on Rocky Field.',
	},

	unbridledwrath: {
		shortDesc: 'Sheer Force + Inner Focus; Intimidate is a separate species passive.',
		desc: 'Full local Sheer Force removes eligible secondary effects and gives those moves approximately 1.3x power, once. Rampage moves still lock the user and cause their normal ending confusion. Full local Inner Focus prevents flinching and Intimidate Attack drops. Intimidate is supplied separately by ordinary Gyarados\'s species passive.',
	},

	venompincer: {
		shortDesc: 'Poison Touch + Hyper Cutter; Poison moves receive 1.5x STAB.',
		desc: 'Full local Poison Touch gives contact attacks a 30% chance to poison the target; Shield Dust, Covert Cloak and normal poison immunities block it. Full local Hyper Cutter prevents opposing Attack drops. Poison moves receive 1.5x STAB, including when the user is already Poison-type; this is not an extra multiplier. Poison Heal is supplied separately by Gliscor\'s species passive.',
	},
	surgesurfer: {
		shortDesc: 'Doubles Speed on Electric, Water Surface, Underwater, Murkwater Surface and Short-Circuit fields.',
		desc: 'The Pokemon\'s Speed is doubled on Electric Terrain, Water Surface, Underwater, Murkwater Surface and Short-Circuit fields.',
	},
};

export function installPassiveCleanupApproved(abilities: AbilityDataTable) {
	const spinesHit = abilities.toxicspines.onDamagingHit!;
	abilities.toxicspines.onDamagingHitOrder = abilities.ironbarbs.onDamagingHitOrder;
	abilities.toxicspines.onDamagingHit = function (damage, target, source, move) {
		spinesHit.call(this, damage, target, source, move);
		if (!target.getPassives().includes('ironbarbs')) {
			abilities.ironbarbs.onDamagingHit!.call(this, damage, target, source, move);
		}
	};

	abilities.unbridledwrath = {
		...abilities.sheerforce, ...abilities.innerfocus, name: 'Unbridled Wrath', num: 11441, rating: 4, flags: {},
	};
	const stormMove = abilities.ragingstorm.onModifyMove!;
	abilities.ragingstorm.onModifyMove = function (move, pokemon, target) {
		stormMove.call(this, move, pokemon, target);
		if (['outrage', 'thrash', 'petaldance', 'ragingfury'].includes(move.id)) {
			if (move.self?.volatileStatus === 'lockedmove') delete move.self;
			// End an existing rampage without triggering its confusion; leave prior confusion alone.
			delete pokemon.volatiles.lockedmove;
		}
	};

	abilities.freezerburn.onModifyDamage = function (damage, source, target, move) {
		if (target.status === 'brn' && this.movehasType(move, 'Ice')) return this.chainModify(1.2);
	};

	abilities.venompincer = {
		name: 'Venom Pincer', num: 11440, rating: 4, flags: {},
		onSourceDamagingHit: abilities.poisontouch.onSourceDamagingHit,
		onTryBoost: abilities.hypercutter.onTryBoost,
		onModifySTAB: abilities.venomheal.onModifySTAB,
	};

}
