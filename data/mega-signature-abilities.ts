import type { AbilityDataTable } from '../sim/dex-abilities';

/** Explicitly approved selected replacements; passive primitives stay separate. */
export const MegaSignatureAbilities: AbilityDataTable = {
	auraprecision: {
		name: 'Aura Precision', num: 11426, rating: 4, flags: { breakable: 1 },
		onModifySecondaries(secondaries, target, source, move) {
			return this.dex.abilities.get('shielddust').onModifySecondaries?.call(this, secondaries, target, source, move);
		},
		onBasePowerPriority: 30,
		onBasePower(power, source, target, move) {
			return this.dex.abilities.get('technician').onBasePower?.call(this, power, source, target, move);
		},
	},
	auraguard: {
		name: 'Aura Guard', num: 11425, rating: 4, flags: { breakable: 1 },
		onSourceModifyDamage(damage, source, target, move) {
			if (move.flags.contact) return this.chainModify(0.5);
		},
	},
	shadowdouble: {
		name: 'Shadow Double', num: 11421, rating: 4, flags: { breakable: 1 },
		onSourceDamagingHit(damage, target, source, move) {
			if (damage <= 0 || target.isAlly(source) || move.category === 'Status' ||
				!this.movehasType(move, 'Ghost') || source.volatiles.shadowdoublespent) return;
			if (!source.addVolatile('shadowdoublespent', source, this.effect)) return;
			this.add('-activate', source, 'ability: Shadow Double');
		},
		onSourceModifyDamage(damage, source, target, move) {
			const state = target.volatiles.shadowdoublespent;
			if (!state || source.isAlly(target) || move.category === 'Status' || move.damage || move.damageCallback) return;
			// ActiveMove identity keeps the reduction across every hit of one execution.
			if (state.armed) {
				state.armed = false;
				state.guardedMove = this.activeMove || move;
				this.add('-activate', target, 'ability: Shadow Double', '[shield]');
			}
			if (state.guardedMove === (this.activeMove || move)) return this.chainModify(0.75);
		},
	},
	crossfire: {
		name: 'Crossfire', num: 11422, rating: 4, flags: {},
		onModifyMovePriority: -100,
		onModifyMove(move, pokemon) {
			if (move.category === 'Status') return;
			const attack = move as ActiveMove & { crossfireBoost?: boolean, crossfireType?: string };
			attack.crossfireType = move.type;
			const state = pokemon.volatiles.crossfirecharge;
			attack.crossfireBoost = !!state && state.primedType === move.type;
			// Spend before accuracy/protection checks, once for the entire attack.
			if (attack.crossfireBoost) state.primedType = '';
		},
		onBasePowerPriority: 23,
		onBasePower(power, source, target, move) {
			if ((move as ActiveMove & { crossfireBoost?: boolean }).crossfireBoost) return this.chainModify([4915, 4096]);
		},
		onSourceDamagingHit(damage, target, source, move) {
			const type = (move as ActiveMove & { crossfireType?: string }).crossfireType;
			if (damage <= 0 || target.isAlly(source) || move.category === 'Status' ||
				!['Grass', 'Fire'].includes(type || '')) return;
			if (!source.volatiles.crossfirecharge) source.addVolatile('crossfirecharge', source, this.effect);
			source.volatiles.crossfirecharge.primedType = type === 'Grass' ? 'Fire' : 'Grass';
		},
	},
};
