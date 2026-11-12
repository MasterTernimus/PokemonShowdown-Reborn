import type { AbilityDataTable } from '../sim/dex-abilities';
import { composeSelectedAbility } from './selected-mega-simplifications';

export const JohtoEruptionDescriptions = {
	bloomingsun: {
		shortDesc: 'Mega Sol + Flower Veil; Grass/Fairy hits heal itself and allies by 1/16 HP once per turn.',
		desc: 'Mega Sol + Flower Veil, including their field effects. After a Grass or Fairy attack damages a foe, restores 1/16 max HP to itself and adjacent allies, once per turn.',
	},
	solareruption: {
		shortDesc: 'Mega Sol + Flame Body; first Fire attack to damage a foe each entry grants +1 Sp. Atk.',
		desc: 'Mega Sol + Flame Body, including their field effects. Once per entry, a Fire attack that damages a foe raises Sp. Atk by 1 stage after the attack finishes.',
	},
};

export function installJohtoEruptions(abilities: AbilityDataTable) {
	// Keep the old IDs so saved references and component lookups still resolve.
	Object.assign(abilities.bloomingsun, { id: 'bloomingsun', name: 'Verdant Eruption' });
	Object.assign(abilities.draconicforce, { id: 'draconicforce', name: 'Tidal Eruption' });
	abilities.solareruption = { name: 'Solar Eruption', num: 32590, rating: 4, flags: {} };
	composeSelectedAbility(abilities, 'solareruption', ['megasol', 'flamebody'], true);
	for (const id of ['bloomingsun', 'solareruption'] as const) {
		Object.assign(abilities[id], JohtoEruptionDescriptions[id]);
		abilities[id].onSourceAfterDamageApplied = function (damage, target, source, move) {
			const types = id === 'bloomingsun' ? ['Grass', 'Fairy'] : ['Fire'];
			if (damage <= 0 || source.isAlly(target) || move.category === 'Status' || !this.movehasType(move, types)) return;
			this.effectState.eruptionAttack = move;
		};
		abilities[id].onAnyAfterAttackResolved = function (source, target, move) {
			if (source !== this.effectState.target || this.effectState.eruptionAttack !== move) return;
			delete this.effectState.eruptionAttack;
			if (!source.hp || !source.isActive) return;
			if (id === 'solareruption') {
				if (source.m.solarEruptionSpent) return;
				source.m.solarEruptionSpent = true;
				this.boost({ spa: 1 }, source, source, this.effect);
			} else {
				if (source.m.verdantEruptionHealTurn === this.turn) return;
				source.m.verdantEruptionHealTurn = this.turn;
				for (const recipient of [source, ...source.adjacentAllies()]) {
					this.heal(recipient.maxhp / 16, recipient, source, this.effect);
				}
			}
		};
	}
}
