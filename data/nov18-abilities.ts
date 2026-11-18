import { towerAbilities } from './tower-and-forest';
import { skyAbilities } from './sky-sea-land';
import { lakeAbilities } from './lake-guardians';
import { alienGenome } from './alien-genome';
import type { AbilityData, AbilityDataTable } from '../sim/dex-abilities';

type Hooks = Partial<AbilityData>;
function power(types: string[], multiplier: number, category?: string): Hooks {
	return { onBasePower(bp, user, target, move) {
		if ((!category || move.category === category) && types.some(type => this.movehasType(move, type))) {
			return this.chainModify(multiplier);
		}
	} };
}

const designs: [string, number, string, Hooks][] = [
	['Alley Ambush', 32626, 'Dark attacks have 1.3× power against foes with a major status condition.', {
		onBasePower(bp, user, target, move) {
			if (!user.isAlly(target) && target.status && this.movehasType(move, 'Dark')) return this.chainModify(1.3);
		},
	}],
	['Basking Scales', 32627, 'Restores 1/8 max HP at the end of each turn in sunlight.', {
		onResidualOrder: 5,
		onResidual(pokemon) {
			if (['sunnyday', 'desolateland'].includes(pokemon.effectiveWeather())) this.heal(pokemon.baseMaxhp / 8, pokemon);
		},
	}],
	['Slipstream Dive', 32611, 'Physical Flying attacks have 1.2× power.', power(['Flying'], 1.2, 'Physical')],
];

const legendaryAbilities: AbilityDataTable = {
	...towerAbilities, ...skyAbilities, ...lakeAbilities, aliengenome: alienGenome,
};

export const rosterDescriptions: Record<string, { name: string, shortDesc: string, desc: string }> = {};
for (const [name, , desc] of designs) {
	rosterDescriptions[name.toLowerCase().replace(/ /g, '')] = { name, desc, shortDesc: desc };
}
for (const [id, ability] of Object.entries(legendaryAbilities)) {
	rosterDescriptions[id] = { name: ability.name, shortDesc: ability.shortDesc!, desc: ability.desc! };
}
rosterDescriptions.cruelshell = {
	name: 'Cruel Shell', shortDesc: 'The first opposing contact hit each turn raises Attack by 1.',
	desc: 'After surviving an opposing contact hit that damages its HP, raises Attack by one stage, once per turn.',
};
rosterDescriptions.blazingmane = {
	name: 'Plasma Awakening', shortDesc: 'Flash Fire. At 1/4 HP or less, Fire attacks gain +1 priority.',
	desc: 'Includes Flash Fire and its field effects. At 1/4 max HP or less, damaging Fire moves gain +1 priority.',
};

export function installRosterAbilities(abilities: AbilityDataTable) {
	Object.assign(abilities, legendaryAbilities);
	for (const [name, num, desc, hooks] of designs) {
		abilities[name.toLowerCase().replace(/ /g, '') as ID] = {
			name, num, desc, shortDesc: desc, rating: 3, flags: {}, ...hooks,
		};
	}
	abilities.cruelshell = {
		...rosterDescriptions.cruelshell, flags: {}, rating: 3, num: abilities.cruelshell.num,
		onDamagingHit(damage, target, source, move) {
			if (!damage || !target.hp || target.isAlly(source) || target.m.cruelShellTurn === this.turn ||
				!this.checkMoveMakesContact(move, source, target)) return;
			target.m.cruelShellTurn = this.turn;
			this.boost({ atk: 1 }, target, target, this.effect);
		},
	};
	abilities.blazingmane = {
		...abilities.flashfire, ...rosterDescriptions.blazingmane, id: 'blazingmane' as ID, num: abilities.blazingmane.num,
		onModifyPriority: abilities.blazingmane.onModifyPriority,
	};
}
