import type { AbilityDataTable } from '../sim/dex-abilities';
import { composeSelectedAbility } from './selected-mega-simplifications';
import { SharedPassiveAbilityDescriptions } from './passive-ability-cleanup';

export const LightPinsirDescriptions = {
	keenlight: {
		shortDesc: 'Illuminate; special beams, pulses, bullets, Photon Geyser and Lumina Crash target the lower defense.',
		desc: 'Lumina Crash, special Photon Geyser and special moves in the /relicbeam list use the target’s lower Defense or Sp. Def. They still use the holder’s Sp. Atk and retain their type, category and other effects. This effect adds no power multiplier.',
	},
	ironmaiden: {
		shortDesc: 'Moxie; opposing contact attackers lose 1/8 max HP once per move.',
		desc: 'Includes Moxie. When an opposing contact move hits the holder, the attacker loses 1/8 of its maximum HP, once per attacking move. Multihits trigger one retaliation. Works on the hit that knocks the holder out. Normal contact and indirect-damage protection apply.',
	},
	siegegrip: {
		shortDesc: 'Mold Breaker; landed physical contact attacks break the target side’s screens before damage.',
		desc: 'Includes Mold Breaker. A physical contact hit removes Reflect, Light Screen and Aurora Veil from that opponent’s side before damage. Misses, immunities and protection that stops the hit leave screens intact. Spread attacks check each opposing side separately.',
	},
};

export function installLightPinsir(
	abilities: AbilityDataTable, descriptions: { [id: string]: { shortDesc: string, desc: string } }
) {
	abilities.keenlight = { name: 'Keen Light', num: 32596, rating: 4, flags: {} };
	composeSelectedAbility(abilities, 'keenlight', ['illuminate'], true);
	composeSelectedAbility(abilities, 'woolyconductor', ['fluffy', 'keenlight'], true);
	// Illuminate is supplied through Keen Light, not separately a second time.
	composeSelectedAbility(abilities, 'astralcore', ['purepower', 'naturalcure', 'keenlight'], true);

	abilities.ironmaiden = { name: 'Iron Maiden', num: 32597, rating: 3.5, flags: {} };
	composeSelectedAbility(abilities, 'ironmaiden', ['moxie'], true);
	abilities.ironmaiden.onDamagingHitOrder = 1;
	abilities.ironmaiden.onDamagingHit = function (damage, target, source, move) {
		if (source.isAlly(target) || !source.hp || !this.checkMoveMakesContact(move, source, target, true)) return;
		const attack = this.activeMove || move;
		if (this.effectState.retaliatedMove === attack && this.effectState.retaliatedSource === source) return;
		this.effectState.retaliatedMove = attack;
		this.effectState.retaliatedSource = source;
		this.damage(source.maxhp / 8, source, target, this.effect);
	};

	abilities.siegegrip = { name: 'Siege Grip', num: 32598, rating: 4, flags: {} };
	composeSelectedAbility(abilities, 'siegegrip', ['moldbreaker'], true);
	// Per-target, after accuracy/immunity/protection; before Substitute or HP damage calculation.
	abilities.siegegrip.onSourceTryPrimaryHitPriority = 100;
	abilities.siegegrip.onSourceTryPrimaryHit = function (target, source, move) {
		if (source.isAlly(target) || move.category !== 'Physical' || !move.flags.contact) return;
		for (const screen of ['reflect', 'lightscreen', 'auroraveil']) target.side.removeSideCondition(screen);
	};
	for (const id of ['relicbeam', 'keenlight', 'ironmaiden', 'siegegrip', 'astralcore', 'woolyconductor'] as const) {
		Object.assign(abilities[id], descriptions[id]);
	}
	Object.assign(SharedPassiveAbilityDescriptions.astralcore, {
		shortDesc: 'Natural Cure + Keen Light.',
		desc: descriptions.naturalcure.desc + ' ' + descriptions.keenlight.desc,
	});
}
