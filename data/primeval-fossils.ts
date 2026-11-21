import type { AbilityDataTable } from '../sim/dex-abilities';

export const PrimevalFossilDescriptions = {
	primevalskull: {
		shortDesc: 'Rock Head; physical Rock moves ignore positive Defense stages.',
		desc: 'Includes Rock Head, preventing recoil damage. Its physical Rock moves ignore the target\'s positive Defense stages.',
	},
	primevalshield: {
		shortDesc: 'Each hit: attacker takes 50% damage as recoil; holder heals 30% of damage received.',
		desc: 'After each damaging hit from another Pokemon, that attacker takes recoil equal to half the actual HP damage dealt, rounded down with a minimum of 1. The holder recovers 30% of the actual HP damage received, rounded down with a minimum of 1, if it survives. Applies to contact and noncontact hits, including allied hits, independently for each hit of multi-hit moves. Substitute-only damage, self-damage and indirect damage do not trigger it. A lethal hit can recoil onto the attacker but cannot revive the holder. Rock Head and Magic Guard can prevent the recoil; normal healing prevention and modifiers apply independently to recovery. Suppression disables both effects.',
	},
};

export function installPrimevalFossils(abilities: AbilityDataTable) {
	abilities.primevalskull = {
		name: 'Primeval Skull', num: 11982, rating: 4, flags: {},
		onDamage(damage, target, source, effect) {
			return this.dex.abilities.get('rockhead').onDamage?.call(this, damage, target, source, effect);
		},
		onModifyMove(move) {
			if (move.category === 'Physical' && this.movehasType(move, 'Rock')) move.ignorePositiveDefensive = true;
		},
	};
	abilities.primevalshield = {
		name: 'Primeval Shield', num: 11983, rating: 4, flags: {},
		onDamagingHit(damage, target, source, move) {
			if (!source || source === target || damage <= 0 || move.category === 'Status') return;
			const amount = Math.max(1, Math.floor(damage / 2));
			this.add('-activate', target, 'ability: Primeval Shield');
			this.damage(amount, source, target, 'recoil');
			if (target.hp) this.heal(Math.max(1, Math.floor(damage * 0.3)), target, target, this.effect);
		},
	};
	for (const [id, text] of Object.entries(PrimevalFossilDescriptions)) {
		Object.assign(abilities[id as Lowercase<string>], text);
	}
}
