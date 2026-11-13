import type { AbilityDataTable } from '../sim/dex-abilities';
import { composeSelectedAbility } from './selected-mega-simplifications';
import { SharedPassiveAbilityDescriptions } from './passive-ability-cleanup';

export const LightPinsirDescriptions = {
	malignantlight: {
		shortDesc: 'Illuminate + Relic Beam: uses Defense for Sp. Atk; beams, pulses and bullets gain 50% power.',
		desc: 'Illuminate + Relic Beam.',
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
	abilities.malignantlight = { name: 'Malignant Light', num: 32596, rating: 4, flags: {} };
	composeSelectedAbility(abilities, 'malignantlight', ['illuminate', 'relicbeam'], true);
	// Illuminate is supplied through Malignant Light, not separately a second time.
	composeSelectedAbility(abilities, 'astralcore', ['purepower', 'naturalcure', 'malignantlight'], true);

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
	for (const id of ['relicbeam', 'malignantlight', 'ironmaiden', 'siegegrip', 'astralcore'] as const) {
		Object.assign(abilities[id], descriptions[id]);
	}
	Object.assign(SharedPassiveAbilityDescriptions.astralcore, {
		shortDesc: 'Natural Cure + Malignant Light.',
		desc: descriptions.naturalcure.desc + ' ' + descriptions.malignantlight.desc,
	});
}
