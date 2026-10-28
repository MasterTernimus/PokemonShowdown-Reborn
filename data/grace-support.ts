import type {AbilityData, AbilityDataTable} from '../sim/dex-abilities';
import {applySereneGrace} from './ally-serene-grace';

export const GraceSupportDescriptions = {
	serenegrace: {
		shortDesc: 'Doubles secondary-effect chances.',
		desc: 'Doubles the chance of moves\' extra effects, including effects on the user, up to 100%. Does not stack.',
	},
	fortunatewing: {
		shortDesc: '+1 crit rate; allies gain Serene Grace. First crit: Safeguard + confusion cure.',
		desc: 'Raises crit rate by 1 stage. Active allies gain Serene Grace. Once per switch-in, a crit that damages a foe\'s HP grants at least 5 turns of Safeguard and cures active allies\' confusion.',
	},
	voidomen: {
		shortDesc: 'Serene Grace; ally damage protection and team confusion immunity. Charge skip + wards.',
		desc: 'The user has Serene Grace. Allies take 25% less attack damage. The user and active allies cannot become confused. Each Pokemon skips one charge turn per switch-in, shared with Lunar Orbit. Once per user switch-in, a successful attack secondary or self-targeting status move grants at least 3 turns of Safeguard. The first applied secondary also blocks one enemy stat-drop event against the user or an adjacent ally, until used or the user leaves.',
	},
};

export function installGraceSupport(abilities: AbilityDataTable) {
	(abilities.fortunatewing as AbilityData & {onAllyModifyMovePriority: number}).onAllyModifyMovePriority = -2;
	abilities.fortunatewing.onAllyModifyMove = function (move, source) {
		const holder = this.effectState.target;
		if (source === holder || !holder.hp || !holder.isActive || !source.isAlly(holder)) return;
		applySereneGrace(move, 'fortunatewing');
	};
	const blockConfusion: NonNullable<AbilityData['onTryAddVolatile']> = function (status, target) {
		const holder = this.effectState.target;
		if (status.id !== 'confusion' || !holder.hp || !holder.isActive || !target.isAlly(holder)) return;
		this.add('-immune', target, '[from] ability: Void Omen', '[of] ' + holder);
		return null;
	};
	abilities.voidomen.onTryAddVolatile = blockConfusion;
	abilities.voidomen.onAllyTryAddVolatile = blockConfusion;
	for (const [id, description] of Object.entries(GraceSupportDescriptions)) {
		Object.assign(abilities[id as Lowercase<string>], description);
	}
}
