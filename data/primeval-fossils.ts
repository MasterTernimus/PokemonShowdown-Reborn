import type {AbilityDataTable} from '../sim/dex-abilities';

export const PrimevalFossilDescriptions = {
	primevalskull: {
		shortDesc: 'Once per battle, survives a lethal hit at 1 HP from any HP; Rock Head.',
		desc: 'Once per battle, a damaging move that would knock this Pokemon out instead leaves it at 1 HP, even if it already has only 1 HP. No chance roll or full-HP requirement. Switching and ability changes do not reset the use. Later hits of a multi-hit move can still knock it out. Suppression prevents activation without consuming the use. Includes Rock Head: prevents ordinary recoil, including Primeval Shield recoil; does not prevent Struggle recoil, crash damage, self-KO costs, weather, status or other indirect damage.',
	},
	primevalshield: {
		shortDesc: 'Each hit: attacker takes 50% damage as recoil; holder heals the same amount.',
		desc: 'After each damaging hit from another Pokemon, that attacker takes recoil equal to half the actual HP damage dealt, rounded down with a minimum of 1. The holder recovers the same calculated amount if it survives. Applies to contact and noncontact hits, including allied hits, independently for each hit of multi-hit moves. Substitute-only damage, self-damage and indirect damage do not trigger it. A lethal hit can recoil onto the attacker but cannot revive the holder. Rock Head and Magic Guard can prevent the recoil; normal healing prevention and modifiers apply independently to recovery. Suppression disables both effects.',
	},
};

export function installPrimevalFossils(abilities: AbilityDataTable) {
	abilities.primevalskull = {
		name: 'Primeval Skull', num: 11982, rating: 4, flags: {},
		onDamage(damage, target, source, effect) {
			const recoil = this.dex.abilities.get('rockhead').onDamage?.call(this, damage, target, source, effect);
			if (recoil !== undefined) return recoil;
			if (effect?.effectType !== 'Move' || damage < target.hp || !target.hp || target.m.primevalSkullSpent) return;
			target.m.primevalSkullSpent = true;
			this.add('-ability', target, 'Primeval Skull');
			return target.hp - 1;
		},
	};
	abilities.primevalshield = {
		name: 'Primeval Shield', num: 11983, rating: 4, flags: {},
		onDamagingHit(damage, target, source, move) {
			if (!source || source === target || damage <= 0 || move.category === 'Status') return;
			const amount = Math.max(1, Math.floor(damage / 2));
			this.add('-activate', target, 'ability: Primeval Shield');
			this.damage(amount, source, target, 'recoil');
			if (target.hp) this.heal(amount, target, target, this.effect);
		},
	};
	for (const [id, text] of Object.entries(PrimevalFossilDescriptions)) {
		Object.assign(abilities[id as Lowercase<string>], text);
	}
}
