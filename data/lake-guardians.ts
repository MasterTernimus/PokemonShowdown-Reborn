import { categoryPower } from '../sim/signature-category-power';
import type { AbilityDataTable } from '../sim/dex-abilities';
import type { SpeciesData } from '../sim/dex-species';
import { skipPassiveComponent } from './passive-ability-cleanup';

export const lakeSlots: Record<string, SpeciesData['abilities']> = {
	uxie: { 0: 'Forewarn', 1: 'Analytic', H: 'Acuity Seal' },
	mesprit: { 0: 'Telepathy', 1: 'Healer', H: 'Verity Seal' },
	azelf: { 0: 'Mold Breaker', 1: 'Vital Spirit', H: 'Valor Seal' },
};

export const lakeAbilities: AbilityDataTable = {
	giftofknowledge: {
		name: 'Gift of Knowledge', num: 32623, flags: {}, rating: 3.5,
		shortDesc: 'Levitate. Psychic attacks ignore evasion and boosted defenses.',
		desc: 'Levitate keeps the user airborne. Its damaging Psychic moves ignore the target’s evasion stages and positive defensive stat stages.',
		onModifyMove(move) {
			if (move.category === 'Status' || !this.movehasType(move, 'Psychic')) return;
			move.ignoreEvasion = true;
			move.ignorePositiveDefensive = true;
		},
	},
	giftofemotion: {
		name: 'Gift of Emotion', num: 32624, flags: {}, rating: 4,
		shortDesc: 'Levitate. A Psychic hit heals its side’s active Pokémon by 1/8 HP once per turn.',
		desc: 'Levitate keeps the user airborne. Once per turn, when its Psychic attack damages a foe’s HP, the user and each active ally recover 1/8 of their own maximum HP.',
		onSourceDamagingHit(damage, target, source, move) {
			if (!damage || !source.hp || source.isAlly(target) || !this.movehasType(move, 'Psychic') ||
				source.m.giftOfEmotionTurn === this.turn) return;
			source.m.giftOfEmotionTurn = this.turn;
			for (const ally of source.alliesAndSelf()) {
				if (ally.hp) this.heal(ally.baseMaxhp / 8, ally, source, this.effect);
			}
		},
	},
	giftofwill: {
		name: 'Gift of Will', num: 32625, flags: {}, rating: 4,
		shortDesc: 'Levitate. Physical Psychic attacks gain 1.3× power. Foes cannot lower its Atk or Sp. Atk.',
		desc: 'Levitate keeps the user airborne. Its physical Psychic attacks have 1.3× power. Opposing Pokémon cannot lower its Attack or Special Attack stages.',
		onBasePower(basePower, source, target, move) {
			if (skipPassiveComponent(this, source, 'giftofwill')) return;
			if (this.movehasType(move, 'Psychic')) return this.chainModify(categoryPower(move, 'Physical', 1.3));
		},
		onTryBoost(boost, target, source) {
			if (!source || target.isAlly(source)) return;
			if ((boost.atk || 0) < 0) delete boost.atk;
			if ((boost.spa || 0) < 0) delete boost.spa;
		},
	},
	acuityseal: {
		name: 'Acuity Seal', num: 32730, flags: {}, rating: 3,
		shortDesc: 'Once per entry, surviving a foe’s damaging hit Disables that move through the next turn.',
		desc: 'Once per switch-in, after surviving a damaging attack from a foe, the user Disables that attack through the end of the following turn. The attack must be the foe’s last move and eligible for Disable.',
		onDamagingHit(damage, target, source, move) {
			if (!damage || !target.hp || !source.hp || target.isAlly(source) || target.volatiles.acuityseal ||
				move.isZ || move.isMax || move.flags.futuremove || move.id === 'struggle' ||
				source.lastMove?.id !== move.id || !source.addVolatile('disable', target, this.effect)) return;
			source.volatiles.disable.duration = 2;
			target.addVolatile('acuityseal', target, this.effect);
		},
		condition: { noCopy: true },
	},
	verityseal: {
		name: 'Verity Seal', num: 32731, flags: { breakable: 1 }, rating: 3,
		shortDesc: 'Protects the user and active allies from confusion, infatuation and Taunt.',
		desc: 'While the user is active, it and its allies are protected from new confusion, infatuation and Taunt.',
		onAllyTryAddVolatile(status, target) {
			if (!['confusion', 'attract', 'taunt'].includes(status.id)) return;
			this.add('-block', target, 'ability: Verity Seal', `[of] ${this.effectState.target}`);
			return null;
		},
	},
	valorseal: {
		name: 'Valor Seal', num: 32732, flags: {}, rating: 3,
		shortDesc: 'Damaging moves gain 1.2× power at half HP or less.',
		desc: 'When the user has half its maximum HP or less, its damaging moves have 1.2× power.',
		onBasePower(basePower, user) {
			if (user.hp * 2 <= user.maxhp) return this.chainModify(1.2);
		},
	},
};
