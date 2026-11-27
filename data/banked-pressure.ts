import type { AbilityDataTable } from '../sim/dex-abilities';
import type { ConditionDataTable } from '../sim/dex-conditions';
import { AbilityDescriptionOverrides } from './ability-descriptions';
import { SelectedAbilityDescriptions } from './selected-mega-simplification-data';

const cycles = {
	razorcurrent: {
		charge: 'Undertow Charge', ready: 'Undertow Ready', power: 1.3,
		builds: (move: ActiveMove) => ['Water', 'Dark'].includes(move.type),
		releases: (move: ActiveMove) => !!move.flags.bite,
		detail: 'Each Water or Dark attack that damages a foe or its Substitute banks one charge. At two, its next damaging bite has 30% more power.',
	},
	heavenlychorus: {
		charge: 'Chorus Charge', ready: 'Chorus Ready', power: 1.25,
		builds: (move: ActiveMove) => !!move.flags.sound,
		releases: (move: ActiveMove) => !!move.flags.sound,
		detail: 'Each sound attack that damages a foe or its Substitute banks one charge. At two, its next sound attack has 25% more power. If it connects, the user and its active allies each recover 1/8 max HP.',
	},
};

type PressureMove = ActiveMove & { pressureRelease?: Pokemon, pressureHit?: Pokemon };
export const bankedPressureConditions: ConditionDataTable = {};
export const bankedPressureText: Record<string, { shortDesc: string, desc: string }> = {};
for (const [id, cycle] of Object.entries(cycles)) {
	const original = SelectedAbilityDescriptions[id] || AbilityDescriptionOverrides[id];
	bankedPressureText[id] = {
		shortDesc: original.shortDesc + (id === 'razorcurrent' ?
			' Banks stronger bites.' : ' Banks stronger, healing sound attacks.'),
		desc: original.desc + ' ' + cycle.detail +
			' Charges persist through switching. A charged attack spends both even if it misses or is blocked.',
	};
	for (const name of [cycle.charge, cycle.ready]) {
		bankedPressureConditions[name.toLowerCase().replace(/ /g, '') as ID] = {
			name, noCopy: true,
			onStart(pokemon) { this.add('-start', pokemon, name); },
			onEnd(pokemon) { this.add('-end', pokemon, name, '[silent]'); },
		};
	}
}

export function installBankedPressure(abilities: AbilityDataTable) {
	for (const [id, cycle] of Object.entries(cycles)) {
		const ability = abilities[id as ID];
		Object.assign(ability, bankedPressureText[id]);
		const charge = cycle.charge.toLowerCase().replace(/ /g, '');
		const ready = cycle.ready.toLowerCase().replace(/ /g, '');
		const bank = id + 'Banked';
		const originalStart = ability.onStart;
		const originalPower = ability.onBasePower;
		ability.onStart = function (holder) {
			originalStart?.call(this, holder);
			if (holder.m[bank]) holder.addVolatile(holder.m[bank]);
			delete holder.m[bank];
		};
		ability.onEnd = function (holder) {
			if (holder.beingCalledBack && holder.hp) {
				holder.m[bank] = holder.volatiles[ready] ? ready : holder.volatiles[charge] ? charge : undefined;
			}
			holder.removeVolatile(ready);
			holder.removeVolatile(charge);
		};
		ability.onTryMove = function (holder, target, move: PressureMove) {
			if (move.category === 'Status' || !cycle.releases(move) || !holder.removeVolatile(ready)) return;
			move.pressureRelease = holder;
			this.add('-activate', holder, 'ability: ' + ability.name);
		};
		ability.onBasePower = function (power, holder, target, move: PressureMove) {
			if (move.pressureRelease === holder) this.chainModify(cycle.power);
			return originalPower?.call(this, power, holder, target, move);
		};
		const record = (damage: number, target: Pokemon, holder: Pokemon, move: PressureMove) => {
			if (damage > 0 && move?.effectType === 'Move' && move.category !== 'Status' && !holder.isAlly(target)) {
				move.pressureHit = holder;
			}
		};
		ability.onSourceAfterSubDamage = record;
		ability.onSourceAfterDamageApplied = record;
		ability.onAnyAfterAttackResolved = function (holder, target, move: PressureMove) {
			if (holder !== this.effectState.target || move.pressureHit !== holder || !holder.hp || !holder.isActive) return;
			delete move.pressureHit;
			if (move.pressureRelease === holder) {
				if (id === 'heavenlychorus') {
					for (const ally of holder.alliesAndSelf()) {
						if (ally.hp) this.heal(ally.baseMaxhp / 8, ally, holder, this.effect);
					}
				}
			} else if (!holder.volatiles[ready] && cycle.builds(move)) {
				holder.addVolatile(holder.removeVolatile(charge) ? ready : charge);
			}
		};
	}
}
