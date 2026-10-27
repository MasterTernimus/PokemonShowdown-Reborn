import type {AbilityDataTable} from '../sim/dex-abilities';
import {composeSelectedAbility} from './selected-mega-simplifications';

export const MegaHydreigonDescriptions = {
	expiration: {
		shortDesc: 'Worldbreaker + Controlled Fury.',
		desc: 'Full local Worldbreaker and Controlled Fury. Berserk raises Attack and Sp. Atk by 1 after surviving a move crossing half HP, and by 2 on Dragon Den entry. Duskilate converts Normal moves to Dark with its normal power and field effects. Each damaging hit independently has a 30% chance to double base power; Fickle Beam uses only its own all-out roll. The first damaging hit received each entry raises Attack by 1; surviving a critical hit instead maximizes Attack. Outrage, Thrash, Petal Dance and Raging Fury cause no rampage lock or ending confusion. Existing confusion and other move locks remain unchanged.',
	},
	abyssalrebirth: {
		shortDesc: 'Hydra Bond + Levitate; once/battle, survive crossing half HP to heal 25%.',
		desc: 'Full local Hydra Bond and Levitate, including three-hit, Free-for-All, Gilded Helix and Dragon Den rules. Reawakening: once per battle, an opposing damaging move taking this Pokemon from above half HP to half HP or less restores 1/4 maximum HP after the entire move finishes, if it survives. All hits finish before recovery. Allies, recoil, hazards, weather and status damage cannot trigger it. Switching, form changes and ability restarts do not reset the use. Ability suppression prevents Reawakening without queuing a later heal; Hydra Bond and passive Levitate retain their normal passive rules, including Ground-immunity bypass. Berserk resolves independently before recovery.',
	},
};

function reawaken(battle: Battle, holder: Pokemon, source: Pokemon, move: ActiveMove) {
	if (!move) return;
	const hit = holder.getMoveHitData(move) as any;
	if (!hit.reawakening) return;
	delete hit.reawakening;
	if (!holder.hp || holder.m.abyssalRebirthSpent || holder.isAlly(source) || holder.ignoringAbility()) return;
	// Pokemon-owned state survives switches and passive/ability reinitialization.
	holder.m.abyssalRebirthSpent = true;
	battle.heal(holder.maxhp / 4, holder, holder, battle.effect);
}

export function installMegaHydreigon(abilities: AbilityDataTable) {
	abilities.expiration = {name: 'Expiration', num: 11980, rating: 5, flags: {}};
	composeSelectedAbility(abilities, 'expiration', ['worldbreaker', 'controlledfury'], true);
	abilities.abyssalrebirth = {
		...abilities.hydraflight, name: 'Abyssal Rebirth', num: 11981,
		onAfterDamageApplied(damage, target, source, effect) {
			if (!source || target.isAlly(source) || effect.effectType !== 'Move' || effect.category === 'Status' ||
				damage <= 0 || !target.hp || target.m.abyssalRebirthSpent || target.ignoringAbility()) return;
			// Record actual HP damage, not projected damage, on this target's move-local hit data.
			if (target.hp <= target.maxhp / 2 && target.hp + damage > target.maxhp / 2) {
				(target.getMoveHitData(effect) as any).reawakening = true;
			}
		},
		onAnyAfterAttackResolved(source, target, move) {
			// Includes called moves (e.g. Sleep Talk) and Sheer Force attacks.
			reawaken(this, this.effectState.target, source, move);
		},
		onAfterMoveSecondaryPriority: -1,
		onAfterMoveSecondary(target, source, move) {
			// Delayed attacks bypass useMove/AfterAttackResolved; let Berserk run first.
			if (move.flags.futuremove) reawaken(this, target, source, move);
		},
	};
	for (const [id, text] of Object.entries(MegaHydreigonDescriptions)) Object.assign(abilities[id as Lowercase<string>], text);
}
