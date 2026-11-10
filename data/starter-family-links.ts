import type { AbilityDataTable } from '../sim/dex-abilities';
import type { MoveDataTable } from '../sim/dex-moves';
import type { ConditionDataTable } from '../sim/dex-conditions';

const KalosElements: Record<string, string> = {
	knightsreprisal: 'Grass', guardianflame: 'Fire', liquidarsenal: 'Water',
	wrathshield: 'Grass', astralwitchcraft: 'Fire', shadowcurrent: 'Water',
};
export const StarterLinkConditions: ConditionDataTable = {
	guardiancounter: { name: 'guardiancounter', noCopy: true },
};
export function installStarterLinks(a: AbilityDataTable) {
	for (const [id, type] of Object.entries({ terragift: 'Ground', burningrage: 'Fire', imperialedge: 'Steel' })) {
		const before = a[id as ID].onSourceDamagingHit;
		a[id as ID].onSourceDamagingHit = function (damage, target, source, move) {
			before?.call(this, damage, target, source, move);
			if (damage <= 0 || !source.hp || source.isAlly(target) || !this.movehasType(move, type) || source.m.legacyHealTurn === this.turn) return;
			source.m.legacyHealTurn = this.turn;
			this.heal(source.baseMaxhp / 16, source, source, this.effect);
		};
	}
	for (const [id, moveID] of Object.entries({ canopyarcher: 'spiritshackle',
		ringmaster: 'darkestlariat',
		tidalvoice: 'sparklingaria' })) {
		const before = a[id as ID].onSourceDamagingHit;
		a[id as ID].onSourceDamagingHit = function (damage, target, source, move) {
			before?.call(this, damage, target, source, move);
			if (damage <= 0 || !source.hp || source.isAlly(target) || move.id !== moveID || source.m.performerAccuracySpent) return;
			source.m.performerAccuracySpent = true;
			this.boost(id === 'canopyarcher' ? {
				spe: 1,
			} : id === 'ringmaster' ? {
				def: 1,
			} : {
				accuracy: 1,
			}, source, source, this.effect);
		};
	}
	for (const [id, type] of Object.entries(KalosElements)) {
		const beforeMove = a[id as ID].onModifyMove;
		const beforePower = a[id as ID].onBasePower;
		a[id as ID].onModifyMove = function (move, source, target) {
			beforeMove?.call(this, move, source, target);
			if (move.category === 'Status' || !this.movehasType(move, type) || !source.volatiles.guardiancounter) return;
			(move as any).guardianCounterUser = source;
			source.removeVolatile('guardiancounter');
		};
		a[id as ID].onBasePower = function (power, source, target, move) {
			const previous = beforePower?.call(this, power, source, target, move);
			if ((move as any).guardianCounterUser === source) this.chainModify(1.2);
			return previous;
		};
	}
}
export function installStarterLinkMoves(moves: MoveDataTable) {
	for (const id of ['protect', 'spikyshield']) {
		const condition = moves[id as ID].condition!;
		const before = condition.onTryHit as (this: Battle, target: Pokemon, source: Pokemon, move: ActiveMove) => any;
		condition.onTryHit = function (target, source, move) {
			const result = before.call(this, target, source, move);
			if (result === this.NOT_FAIL && move.category !== 'Status' && !source.isAlly(target) &&
				target.hasAbility(Object.keys(KalosElements))) target.addVolatile('guardiancounter', target, target.getAbility());
			return result;
		};
	}
}

export function applyStarterLinkDescriptions(text: Record<string, { shortDesc: string, desc: string }>) {
 text.ringmaster.shortDesc = 'Tough Claws; first Dark attempt +1 priority; Dark hits Taunt; switch-out support.';
	for (const [id, type] of Object.entries({ terragift: 'Ground', burningrage: 'Fire', imperialedge: 'Steel' })) {
		text[id] = { ...text[id],
			shortDesc: text[id].shortDesc + ' ' + type + ' hits heal 1/16 HP once per turn.',
			desc: text[id].desc + ' ' + type + ' moves that damage a foe heal 1/16 max HP once per turn.' };
	}
	text.imperialedge.shortDesc = 'Mold Breaker + Defiant + Inner Focus; stronger blades; Steel hits heal 1/16 HP once per turn.';
	for (const id of Object.keys(KalosElements)) {
		text[id] = { ...text[id],
			desc: text[id].desc + ' Blocking a damaging move with Protect or Spiky Shield stores one 1.2x boost for the next damaging ' + KalosElements[id] + ' move. Attempting that move or switching spends the charge.' };
	}
	for (const [id, signature] of Object.entries({ canopyarcher: 'Spirit Shackle',
		ringmaster: 'Darkest Lariat',
		tidalvoice: 'Sparkling Aria' })) {
		text[id] = { ...text[id],
			desc: text[id].desc + ' Once per entry, damaging a foe with ' + signature + ' raises ' + (id === 'canopyarcher' ? 'Speed' : id === 'ringmaster' ? 'Defense' : 'accuracy') + ' by one stage.' };
	}
	for (const [id, signature] of Object.entries({ falsebouquet: 'Flower Trick',
		funeralchoir: 'Torch Song',
		festivalstep: 'Aqua Step' })) {
		const extra = ' Damaging a foe with ' + signature + ' heals 1/16 HP once per turn.';
		text[id] = { ...text[id],
			desc: text[id].desc + extra + (id === 'funeralchoir' ? ' This uses the same healing budget as its sound recovery; only the larger amount applies.' : '') };
	}
	text.bewitchingmajesty = { ...text.bewitchingmajesty,
		shortDesc: 'Queenly Majesty; creates Bewitched Aura. Smite can create Bewitched Woods.',
		desc: text.bewitchingmajesty.desc.replace('Reflects eligible status moves and protects', 'Protects') };
}
