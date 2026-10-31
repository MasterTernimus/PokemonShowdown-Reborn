import type {AbilityDataTable} from '../sim/dex-abilities';

export const ArmorTwinDescriptions = {
	twincannons: {
		shortDesc: 'Special Fire/Psychic attacks hit twice at 60%/40%; second hit uses Defense.',
		desc: 'Single-target special Fire and Psychic attacks hit twice at 60% then 40% power. The second hit uses Defense instead of Sp. Def. Both hits stay on the same target. Secondary and self effects occur only on the first hit; native draining applies to damage dealt. Excludes existing multi-hit, charging, delayed, fixed-damage, OHKO, Z and Max moves. The same power applies in every format.',
	},
	twinblades: {
		shortDesc: 'Physical Fire/Ghost slicing attacks hit twice at 60%/40%; second ignores Defense boosts.',
		desc: 'Single-target physical Fire and Ghost slicing attacks hit twice at 60% then 40% power. The second hit ignores positive Defense stages. Both hits stay on the same target. Secondary and self effects occur only on the first hit; native draining applies to damage dealt. Excludes existing multi-hit, charging, delayed, fixed-damage, OHKO, Z and Max moves. The same power applies in every format.',
	},
};

export function installGoodraArmorReworks(abilities: AbilityDataTable) {
	abilities.gentleembrace = {
		name: 'Gentle Embrace', num: 12087, rating: 3, flags: {breakable: 1},
		shortDesc: 'Takes 20% less contact damage. Hydration.',
		desc: 'Contact attacks deal 20% less damage. Cures major status at turn end in effective rain or on Water Surface, Underwater and Midnight Zone.',
		onSourceModifyDamage(damage, source, target, move) {
			if (move.flags.contact) return this.chainModify(0.8);
		},
		onResidualOrder: abilities.hydration.onResidualOrder,
		onResidualSubOrder: abilities.hydration.onResidualSubOrder,
		onResidual(pokemon) {
			return this.dex.abilities.get('hydration').onResidual?.call(this, pokemon);
		},
	};
	abilities.shellboundfury = {
		name: 'Shellbound Fury', num: 12063, rating: 3, flags: {},
		shortDesc: 'Surviving a foe physical hit grants +1 Sp. Atk, once per turn.',
		desc: 'After surviving a physical attack that damages its HP, gains +1 Sp. Atk, once per turn. Allied attacks do not trigger this effect.',
		onDamagingHit(damage, target, source, move) {
			if (damage <= 0 || !target.hp || !source || source.isAlly(target) || move.category !== 'Physical' ||
				target.m.shellboundFuryTurn === this.turn) return;
			target.m.shellboundFuryTurn = this.turn;
			this.boost({spa: 1}, target, target, this.effect);
		},
	};
	abilities.soulforgedarmor = {
		name: 'Soulforged Armor', num: 12064, rating: 3, flags: {breakable: 1},
		shortDesc: 'Takes 20% less damage from super-effective attacks.',
		desc: 'Super-effective attacks deal 20% less damage.',
		onSourceModifyDamage(damage, source, target, move) {
			if (target.getMoveHitData(move).typeMod > 0) return this.chainModify(0.8);
		},
	};
	for (const [id, text] of Object.entries(ArmorTwinDescriptions)) Object.assign(abilities[id as ID], text);
}
