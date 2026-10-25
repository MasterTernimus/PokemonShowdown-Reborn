import type {AbilityDataTable} from '../sim/dex-abilities';
import {skipPassiveComponent} from './passive-ability-cleanup';

export const SeasonalBirdComponents = {
	springpressure: ['static', 'pressure'], summerpressure: ['flamebody', 'pressure'], winterpressure: ['icebody', 'pressure'],
	springherald: ['drizzle'], springtempest: ['lightningrod', 'stormpower'],
	summerherald: ['drought'], summerrenewal: ['regenerator', 'solarpower'],
	winterherald: ['snowwarning'], winterrefuge: ['friendguard', 'icescales'],
};
export const SeasonalBirdPassives = {zapdos: 'springpressure', moltres: 'summerpressure', articuno: 'winterpressure'};
export const SeasonalBirdDescriptions = {
	springpressure: {name: 'Spring Pressure', shortDesc: 'Static + Pressure.', desc: "Full local Static and Pressure, including their field effects. Pressure has its once-per-opponent entry memory."},
	summerpressure: {name: 'Summer Pressure', shortDesc: 'Flame Body + Pressure.', desc: "Full local Flame Body and Pressure, including their field effects. Pressure has its once-per-opponent entry memory."},
	winterpressure: {name: 'Winter Pressure', shortDesc: 'Ice Body + Pressure.', desc: "Full local Ice Body and Pressure, including their field effects. Pressure has its once-per-opponent entry memory."},
	springherald: {name: 'Spring Herald', shortDesc: 'Drizzle. Its Electric attacks spare allies.', desc: 'Full local Drizzle. Its damaging Electric moves do not hit allies.'},
	springtempest: {name: 'Spring Tempest', shortDesc: 'Lightning Rod + Storm Power.', desc: 'Full local Lightning Rod and Storm Power: redirects and absorbs Electric moves; rain boosts Sp. Atk by 1.5x and costs 1/8 max HP each turn.'},
	summerherald: {name: 'Summer Herald', shortDesc: 'Drought. Fire immunity; opposing Fire heals 1/8 HP once per turn.', desc: 'Full local Drought. Immune to Fire moves. An opposing Fire move heals 1/8 max HP, at most once per turn; allied Fire moves do not heal it.'},
	summerrenewal: {name: 'Summer Renewal', shortDesc: 'Regenerator + Solar Power.', desc: 'Full local Regenerator and Solar Power, including their field effects and Solar Power HP cost.'},
	winterherald: {name: 'Winter Herald', shortDesc: 'Snow Warning. In hail/snow, foes cannot lower allied Speed.', desc: 'Full local Snow Warning. While hail or snow is effective, opponents cannot lower its or its active allies\' Speed.'},
	winterrefuge: {name: 'Winter Refuge', shortDesc: 'Friend Guard + Ice Scales.', desc: 'Full local Friend Guard and Ice Scales, including their field effects.'},
};

export function installSeasonalBirds(abilities: AbilityDataTable) {
	const a = abilities as any;
	for (const [id, body] of Object.entries({springpressure: 'static', summerpressure: 'flamebody', winterpressure: 'icebody'})) {
		a[id] = {...a[body], ...a.pressure, name: SeasonalBirdDescriptions[id as keyof typeof SeasonalBirdDescriptions].name,
			num: 11732 + Object.keys(SeasonalBirdPassives).indexOf(Object.keys(SeasonalBirdPassives).find(key => (SeasonalBirdPassives as any)[key] === id)!),
			onStart(this: Battle, pokemon: Pokemon) {
				a[body].onStart?.call(this, pokemon);
				a.pressure.onStart.call(this, pokemon);
			},
		};
		for (const [key, callback] of Object.entries(a[id])) {
			if (!key.startsWith('on') || typeof callback !== 'function') continue;
			a[id][key] = function (this: Battle, ...args: any[]) {
				if (skipPassiveComponent(this, this.effectState.target, id)) return;
				return callback.apply(this, args);
			};
		}
	}
	a.springherald = {...a.drizzle, name: 'Spring Herald', num: 11735,
		onAnyTryHit(this: Battle, target: Pokemon, source: Pokemon, move: ActiveMove) {
			const holder = this.effectState.target;
			if (source === holder && target !== source && target.isAlly(source) && move.category !== 'Status' && this.movehasType(move, 'Electric')) {
				this.add('-immune', target, '[from] ability: Spring Herald');
				return null;
			}
		},
	};
	a.springtempest = {...a.lightningrod, ...a.stormpower, flags: {...a.lightningrod.flags, ...a.stormpower.flags}, name: 'Spring Tempest', num: 11736};
	a.summerherald = {...a.drought, name: 'Summer Herald', num: 11737, flags: {breakable: 1},
		onTryHit(this: Battle, target: Pokemon, source: Pokemon, move: ActiveMove) {
			if (target === source || !this.movehasType(move, 'Fire')) return;
			if (!target.isAlly(source) && target.m.summerHeraldHealTurn !== this.turn) {
				target.m.summerHeraldHealTurn = this.turn;
				this.heal(target.baseMaxhp / 8, target, source, this.effect);
			}
			this.add('-immune', target, '[from] ability: Summer Herald');
			return null;
		},
	};
	a.summerrenewal = {...a.regenerator, ...a.solarpower, name: 'Summer Renewal', num: 11738};
	a.winterherald = {...a.snowwarning, name: 'Winter Herald', num: 11739,
		onAllyTryBoost(this: Battle, boosts: SparseBoostsTable, target: Pokemon, source: Pokemon) {
			const holder = this.effectState.target;
			if (source && !source.isAlly(target) && ['hail', 'snow'].includes(holder.effectiveWeather()) && (boosts.spe || 0) < 0) {
				delete boosts.spe;
				this.add('-block', target, 'ability: Winter Herald');
			}
		},
	};
	a.winterrefuge = {...a.friendguard, ...a.icescales, name: 'Winter Refuge', num: 11740};
}
