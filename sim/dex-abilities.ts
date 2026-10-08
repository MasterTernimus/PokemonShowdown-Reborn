import {adaptiveReductionCallback} from './adaptive-cycle';
import type { PokemonEventMethods, ConditionData, ModdedConditionData } from './dex-conditions';
import { assignMissingFields, BasicEffect, toID } from './dex-data';
import { Utils } from '../lib/utils';

interface AbilityEventMethods {
	fallen?: (this: Battle, pokemon: Pokemon) => number;
	getBestNoseMove?: (this: Battle, source: Pokemon, target: Pokemon) => ActiveMove | null;
	queueTemporalHex?: (this: Battle, pokemon: Pokemon, abilityName?: string, typePool?: string[] | null, basePower?: number, immediate?: boolean) => void;
	boostedField?: (this: Battle) => boolean;
	healUltraEgo?: (this: Battle, pokemon: Pokemon, source: string) => void;
	checkMode?: (this: Battle, pokemon: Pokemon) => void;
	markRequiem?: (this: Battle, target: Pokemon, source: Pokemon) => void;
	lowerOffense?: (this: Battle, target: Pokemon, source: Pokemon) => void;
	onAfterSwitchOut?: (this: Battle, target: Pokemon, replacement: Pokemon, effect: Effect | null) => void;
	onCheckShow?: (this: Battle, pokemon: Pokemon) => void;
	onEnd?: (this: Battle, target: Pokemon & Side & Field) => void;
	onStart?: (this: Battle, target: Pokemon) => void;
}

/* Possible Ability flags */
interface AbilityFlags {
	breakable?: 1; // Can be suppressed by Mold Breaker and related effects
	unbreakableDamage?: 1; // Preserve only incoming damage protection in an otherwise breakable composite
	cantsuppress?: 1; // Ability can't be suppressed by e.g. Gastro Acid or Neutralizing Gas
	failroleplay?: 1; // Role Play fails if target has this Ability
	failskillswap?: 1; // Skill Swap fails if either the user or target has this Ability
	noentrain?: 1; // Entrainment fails if user has this Ability
	noreceiver?: 1; // Receiver and Power of Alchemy will not activate if an ally faints with this Ability
	notrace?: 1; // Trace cannot copy this Ability
	notransform?: 1; // Disables the Ability if the user is Transformed
}

export interface AbilityData extends Partial<Ability>, AbilityEventMethods, PokemonEventMethods {
	name: string;
}

export type ModdedAbilityData = AbilityData | Partial<AbilityData> & {
	inherit: true,
	condition?: ModdedConditionData,
};
export interface AbilityDataTable { [abilityid: IDEntry]: AbilityData }
export interface ModdedAbilityDataTable { [abilityid: IDEntry]: ModdedAbilityData }

// Event callbacks are copied onto Dex abilities by assignMissingFields.
export interface Ability extends AbilityEventMethods, PokemonEventMethods {}

type AbilityHandler<K extends keyof Ability> = Extract<NonNullable<Ability[K]>, (...args: never[]) => unknown>;
type AbilityHandlerName = {[K in keyof Ability]-?: AbilityHandler<K> extends never ? never : K}[keyof Ability];

export class Ability extends BasicEffect implements Readonly<BasicEffect> {
	declare readonly effectType: 'Ability';

	/** Rating from -1 Detrimental to +5 Essential; see `data/abilities.ts` for details. */
	readonly rating: number;
	readonly suppressWeather: boolean;
	readonly flags: AbilityFlags;
	declare readonly condition?: ConditionData;

	constructor(data: AnyObject) {
		super(data);

		this.fullname = `ability: ${this.name}`;
		this.effectType = 'Ability';
		this.suppressWeather = !!data.suppressWeather;
		this.flags = data.flags || {};
		this.rating = data.rating || 0;

		if (!this.gen) {
			if (this.num >= 268) {
				this.gen = 9;
			} else if (this.num >= 234) {
				this.gen = 8;
			} else if (this.num >= 192) {
				this.gen = 7;
			} else if (this.num >= 165) {
				this.gen = 6;
			} else if (this.num >= 124) {
				this.gen = 5;
			} else if (this.num >= 77) {
				this.gen = 4;
			} else if (this.num >= 1) {
				this.gen = 3;
			}
		}
		assignMissingFields(this, data);
		for (const event of ['onDamage', 'onSourceModifyDamage', 'onSourceBasePower', 'onSourceModifyAtk', 'onSourceModifySpA', 'onModifyDef', 'onModifySpD']) {
			const callback = (this as any)[event];
			if (typeof callback === 'function') (this as any)[event] = adaptiveReductionCallback(this, callback);
		}
	}
}

const EMPTY_ABILITY = Utils.deepFreeze(new Ability({ id: '', name: '', exists: false }));

export class DexAbilities {
	readonly dex: ModdedDex;
	readonly abilityCache = new Map<ID, Ability>();
	allCache: readonly Ability[] | null = null;

	constructor(dex: ModdedDex) {
		this.dex = dex;
	}

	/** Composite abilities may delegate callbacks or constant event results. */
	getHandler<K extends AbilityHandlerName>(name: string, event: K): AbilityHandler<K> | undefined {
		const handler: unknown = this.get(name)[event];
		if (typeof handler === 'function') return handler as AbilityHandler<K>;
		if (typeof handler === 'boolean') return (() => handler) as AbilityHandler<K>;
		return undefined;
	}

	get(name: string | Ability = ''): Ability {
		if (name && typeof name !== 'string') return name;
		const id = toID(name.trim());
		return this.getByID(id);
	}

	getByID(id: ID): Ability {
		if (id === '' || id === 'constructor') return EMPTY_ABILITY;
		let ability = this.abilityCache.get(id);
		if (ability) return ability;

		if (this.dex.getAlias(id)) {
			ability = this.get(this.dex.getAlias(id));
		} else if (id && this.dex.data.Abilities.hasOwnProperty(id)) {
			const abilityData = this.dex.data.Abilities[id] as any;
			const abilityTextData = this.dex.getDescs('Abilities', id, abilityData);
			ability = new Ability({
				name: id,
				...abilityData,
				...abilityTextData,
			});
			if (ability.gen > this.dex.gen) {
				(ability as any).isNonstandard = 'Future';
			}
			if (this.dex.currentMod === 'gen7letsgo' && ability.id !== 'noability') {
				(ability as any).isNonstandard = 'Past';
			}
			if ((this.dex.currentMod === 'gen7letsgo' || this.dex.gen <= 2) && ability.id === 'noability') {
				(ability as any).isNonstandard = null;
			}
		} else {
			ability = new Ability({
				id, name: id, exists: false,
			});
		}

		if (ability.exists) this.abilityCache.set(id, this.dex.deepFreeze(ability));
		return ability;
	}

	all(): readonly Ability[] {
		if (this.allCache) return this.allCache;
		const abilities = [];
		for (const id in this.dex.data.Abilities) {
			abilities.push(this.getByID(id as ID));
		}
		this.allCache = abilities;
		return this.allCache;
	}
}
