/** Adaptive Cycle's battle-long, individual memory. No state lives in abilityState or volatiles. */
import type {Pokemon} from './pokemon';
import type {Battle} from './battle';
import {Utils} from '../lib';
import {createHash} from 'crypto';

interface Progress { stage: number; turn: number }
interface OpponentMemory {
	label: string; points: number; observedTurn: number; complete: boolean; moves: string[];
	setup: Progress; bypass: string[]; pendingBypass: string[]; defenses: string[]; pendingDefenses: string[];
}
export interface AdaptiveMemory {
	types: Record<string, Progress>; activeTypes: string[]; pendingTypes: string[];
	opponents: Record<string, OpponentMemory>; statuses: Record<string, Progress>; chip: Record<string, Progress>;
	fields: Record<string, Progress>; weather: Record<string, Progress>; checkpoint: number; lastDisplay?: string;
}

export function adaptiveActive(p: Pokemon | null | undefined): p is Pokemon {
	return !!(p?.hp && p.isActive && p.ability === 'adaptivecycle' && !p.ignoringAbility());
}
export function adaptiveMemory(p: Pokemon): AdaptiveMemory {
	return p.m.adaptiveCycle ||= {
		types: {}, activeTypes: [], pendingTypes: [], opponents: {}, statuses: {}, chip: {}, fields: {}, weather: {}, checkpoint: -1,
	};
}
function identity(p: Pokemon): string {
	// Assigned on first public observation. Never derived from a mutable slot, species, or nickname.
	if (!p.m.adaptiveCycleIdentity) {
		p.m.adaptiveCycleIdentity = 1 + Math.max(0, ...p.battle.getAllPokemon().map(q => q.m.adaptiveCycleIdentity || 0));
	}
	return String(p.m.adaptiveCycleIdentity);
}
function opponent(p: Pokemon, foe: Pokemon): OpponentMemory {
	const records = adaptiveMemory(p).opponents;
	return records[identity(foe)] ||= {
		label: foe.toString(), points: 0, observedTurn: -1, complete: false, moves: [],
		setup: {stage: 0, turn: -1}, bypass: [], pendingBypass: [], defenses: [], pendingDefenses: [],
	};
}
function knownOpponent(p: Pokemon, foe: Pokemon | null | undefined) {
	return foe?.m.adaptiveCycleIdentity ? (p.m.adaptiveCycle as AdaptiveMemory | undefined)?.opponents[String(foe.m.adaptiveCycleIdentity)] : undefined;
}
function expose(records: Record<string, Progress>, key: string) {
	if (key) records[key] ||= {stage: 0, turn: -1};
}
function advance(record: Progress, turn: number, max: number) {
	if (record.turn === turn) return;
	record.stage = Math.min(max, record.stage + 1);
	record.turn = turn;
}
export function adaptiveFieldKey(id: string) { return /^flowergarden[1-5]$/.test(id) ? 'flowergarden' : id; }
export function adaptiveEnvironment(p: Pokemon | null | undefined, kind: 'fields' | 'weather', id?: string) {
	if (!adaptiveActive(p)) return false;
	const key = kind === 'fields' ? adaptiveFieldKey(id ?? p.battle.field.terrain) : (id ?? p.effectiveWeather());
	return !!key && (p.m.adaptiveCycle as AdaptiveMemory | undefined)?.[kind][key]?.stage === 3;
}
export function adaptiveFunctioningAgainst(p: Pokemon, foe?: Pokemon | null) {
	if (!adaptiveActive(p)) return false;
	if (foe && p.battle.activePokemon === foe && p.battle.activeMove?.ignoreAbility && !p.hasItem('abilityshield')) {
		return !!knownOpponent(p, foe)?.complete || !!knownOpponent(p, foe)?.bypass.includes(foe.ability);
	}
	return true;
}
export function adaptiveResistsBypass(p: Pokemon, source?: Pokemon | null) {
	return adaptiveActive(p) && !!source && (!!knownOpponent(p, source)?.complete || !!knownOpponent(p, source)?.bypass.includes(source.ability));
}
/** Used inside ignoringAbility itself: do not recurse through hasAbility/ignoringAbility here. */
export function adaptiveSuppressionException(p: Pokemon, source: Pokemon) {
	return !!(p.hp && p.isActive && p.ability === 'adaptivecycle' && !p.volatiles.gastroacid &&
		!p.volatiles.meridianseal && knownOpponent(p, source)?.complete);
}
export function adaptiveIgnoresAbility(p: Pokemon | null | undefined, owner: Pokemon | null | undefined) {
	return !!p && !!owner && p !== owner && !p.isAlly(owner) && adaptiveActive(p) && !!knownOpponent(p, owner)?.complete;
}
export function adaptiveSkipAbility(event: string, owner: Pokemon, target: unknown, source: unknown) {
	// Start/switch/residual effects are not inherently interactions. Their individual mutations are checked at the sink.
	if (['Start', 'End', 'SwitchIn', 'SwitchOut', 'Residual', 'Update', 'BeforeTurn', 'ModifyMove', 'ModifyType', 'PrepareHit'].includes(event)) return false;
	const isPokemon = (p: any): p is Pokemon => !!p?.side && !!p?.m;
	return (isPokemon(target) && adaptiveIgnoresAbility(target, owner)) ||
		(isPokemon(source) && adaptiveIgnoresAbility(source, owner));
}
export function adaptiveAnalyzed(p: Pokemon, foe?: Pokemon | null) {
	return !!foe && !p.isAlly(foe) && adaptiveFunctioningAgainst(p, foe) && !!knownOpponent(p, foe)?.complete;
}
export function adaptiveSetup(p: Pokemon, foe: Pokemon) {
	return adaptiveFunctioningAgainst(p, foe) && !!knownOpponent(p, foe) &&
		(!!knownOpponent(p, foe)!.complete || knownOpponent(p, foe)!.setup.stage === 2);
}
export function adaptiveKnownMove(p: Pokemon, foe: Pokemon | null | undefined, move: {id: string}) {
	return !!foe && adaptiveAnalyzed(p, foe) && !!knownOpponent(p, foe)?.moves.includes(move.id);
}
export function adaptiveHarmfulStatus(move: ActiveMove) {
	if (move.status || move.volatileStatus || move.forceSwitch) return true;
	if (move.boosts) return Object.values(move.boosts).some(n => n < 0);
	if (move.heal || move.flags.heal || ['helpinghand', 'holdhands', 'celebrate', 'happyhour', 'teatime', 'instruct', 'bestow'].includes(move.id)) return false;
	return true;
}
export function adaptiveDamageMultiplier(p: Pokemon, foe: Pokemon, move: ActiveMove) {
	if (!adaptiveFunctioningAgainst(p, foe) || p.isAlly(foe)) return 1;
	const m = p.m.adaptiveCycle as AdaptiveMemory | undefined;
	const stage = m?.activeTypes.includes(move.type) ? m.types[move.type].stage : 0;
	return Math.min([1, 0.8, 0.65, 0.5][stage || 0], adaptiveAnalyzed(p, foe) ? 0.5 : 1);
}
function chipCause(effect: Effect) {
	if (effect.effectType === 'Move' || ['recoil', 'strugglerecoil', 'struggle-recoil', 'crash', 'lifeorb', 'jumpkick', 'highjumpkick', 'axekick', 'supercellslam', 'confused'].includes(effect.id)) return '';
	return effect.id;
}
export function adaptivePreventDamage(p: Pokemon, source: Pokemon | null, effect: Effect) {
	if (!adaptiveFunctioningAgainst(p, source)) return false;
	if (effect.effectType === 'Terrain') return adaptiveEnvironment(p, 'fields', effect.id);
	if (effect.effectType === 'Weather' && adaptiveEnvironment(p, 'weather', effect.id)) return true;
	const cause = chipCause(effect);
	return !!cause && (p.m.adaptiveCycle as AdaptiveMemory | undefined)?.chip[cause]?.stage === 2;
}
export function adaptiveDamaged(p: Pokemon, source: Pokemon | null, effect: Effect, damage: number) {
	if (!damage || !adaptiveActive(p)) return;
	const m = adaptiveMemory(p);
	if (effect.effectType === 'Move') {
		const move = effect as ActiveMove;
		if (!source || p.isAlly(source) || move.category === 'Status') return;
		if (!m.pendingTypes.includes(move.type)) m.pendingTypes.push(move.type);
		if (move.ignoreAbility && !p.hasItem('abilityshield')) {
			const record = opponent(p, source);
			if (!record.pendingBypass.includes(source.ability)) record.pendingBypass.push(source.ability);
		}
	} else {
		expose(m.chip, chipCause(effect));
	}
}
export function adaptiveAfterMove(battle: Battle, source: Pokemon, move: ActiveMove, succeeded: boolean) {
	for (const p of battle.getAllPokemon()) {
		const queued = (p.m.adaptiveCycle as AdaptiveMemory | undefined)?.pendingTypes.length;
		if (!adaptiveActive(p) && !queued) continue;
		const m = adaptiveMemory(p);
		// Commit only survived exposure, including a holder forced onto the bench by that move.
		for (const type of p.hp && p.ability === 'adaptivecycle' ? m.pendingTypes : []) {
			expose(m.types, type);
			if (m.activeTypes.includes(type)) continue;
			if (m.activeTypes.length === 2) m.activeTypes.shift();
			m.activeTypes.push(type);
		}
		m.pendingTypes = [];
		if (!adaptiveActive(p)) { adaptiveDisplay(p); continue; }
		if (succeeded && source.isActive && !p.isAlly(source)) {
			const record = opponent(p, source);
			record.label = source.toString(); // respects Illusion; never serialize source.species or its team
			if (!record.moves.includes(move.id)) record.moves.push(move.id);
			if (record.observedTurn !== battle.turn) {
				record.points = Math.min(4, record.points + (p.getTypes().some(t => source.hasType(t)) ? 2 : 1));
				record.observedTurn = battle.turn;
			}
		}
		adaptiveDisplay(p);
	}
}
const removableChip = new Set(['leechseed', 'curse', 'partiallytrapped', 'saltcure', 'nightmare']);
function statusKey(id: string) { return id === 'tox' ? 'psn' : id; }
export function adaptiveStatus(p: Pokemon, id: string, effect?: Effect | null) {
	if (!adaptiveActive(p)) return;
	const m = adaptiveMemory(p);
	if (['brn', 'par', 'slp', 'frz', 'frostbite', 'psn', 'tox', 'confusion'].includes(id)) expose(m.statuses, statusKey(id));
	if (effect && ['toxicspikes', 'stickyweb'].includes(effect.id)) expose(m.chip, effect.id);
}
export function adaptiveBlocksCondition(p: Pokemon, id: string, source?: Pokemon | null, effect?: Effect | null) {
	if (p.ability === 'adaptivecycle' && ['gastroacid', 'meridianseal'].includes(id)) return true;
	if (effect?.effectType === 'Ability' && (adaptiveIgnoresAbility(p, source) ||
		(p.battle.effectState?.target?.m && adaptiveIgnoresAbility(p, p.battle.effectState.target)))) return true;
	if (!adaptiveFunctioningAgainst(p, source)) return false;
	const m = p.m.adaptiveCycle as AdaptiveMemory | undefined;
	if (m?.statuses[statusKey(id)]?.stage === 2 || m?.chip[id]?.stage === 2 || (effect && m?.chip[effect.id]?.stage === 2)) return true;
	if (effect?.effectType === 'Terrain' && adaptiveEnvironment(p, 'fields', effect.id)) return true;
	if (effect?.effectType === 'Weather' && adaptiveEnvironment(p, 'weather', effect.id)) return true;
	return !!effect && effect.effectType === 'Move' && source !== p && adaptiveKnownMove(p, source, effect);
}

// Only move properties changed by callbacks are captured; never clone a Pokemon or the battle graph.
const moveProperties = ['type', 'types', 'category', 'target', 'ignoreImmunity', 'basePower', 'damage', 'accuracy', 'ignoreAbility', 'ignoreDefensive',
	'ignoreOffensive', 'ignoreEvasion', 'ignoreAccuracy', 'infiltrates', 'secondaries', 'multihit', 'multihitType',
	'volatileStatus', 'status', 'forceSTAB', 'critRatio', 'willCrit', 'flags'];
interface MoveContribution { owner?: Pokemon; kind?: 'fields' | 'weather'; id: string; before: AnyObject; after: AnyObject }
export function adaptiveMoveSnapshot(move: ActiveMove) {
	const result: AnyObject = {};
	for (const key of moveProperties) result[key] = Utils.deepClone((move as any)[key]);
	for (const key of Object.keys(move)) {
		if (/^on[A-Z]/.test(key) && typeof (move as any)[key] === 'function') result[key] = (move as any)[key];
	}
	return result;
}
export function adaptiveCaptureMove(move: ActiveMove, before: AnyObject, effect: Effect, owner?: Pokemon) {
	if (!['Ability', 'Terrain', 'Weather'].includes(effect.effectType)) return;
	const after = adaptiveMoveSnapshot(move);
	// Ability-installed callbacks execute later as move callbacks. Keep their ownership
	// even when they wrap a native or field callback, rather than suppressing the whole move.
	if (effect.effectType === 'Ability' && owner) {
		for (const key of Object.keys(after)) {
			const added = after[key], original = before[key];
			if (!/^on[A-Z]/.test(key) || typeof added !== 'function' || added === original) continue;
			(move as any)[key] = function (this: Battle, ...args: any[]) {
				if (adaptiveSkipAbility(this.event.id, owner, this.event.target, this.event.source)) {
					return typeof original === 'function' ? original.apply(this, args) : original;
				}
				return added.apply(this, args);
			};
		}
	}
	const changed = moveProperties.filter(k => JSON.stringify(before[k]) !== JSON.stringify(after[k]));
	if (!changed.length) return;
	const contribution: MoveContribution = {id: effect.id, before: {}, after: {}};
	if (effect.effectType === 'Ability') contribution.owner = owner;
	else contribution.kind = effect.effectType === 'Terrain' ? 'fields' : 'weather';
	for (const key of changed) { contribution.before[key] = before[key]; contribution.after[key] = after[key]; }
	((move as any).adaptiveContributions ||= []).push(contribution);
}
export function adaptiveMoveView(move: ActiveMove, source: Pokemon, target: Pokemon): ActiveMove {
	if ((move as any).adaptiveViewFor === target) return move;
	const contributions = (move as any).adaptiveContributions as MoveContribution[] | undefined;
	let view: ActiveMove = move;
	for (const c of [...(contributions || [])].reverse()) {
		const ignoreAbility = c.owner && adaptiveIgnoresAbility(target, c.owner);
		const incoming = c.kind && adaptiveEnvironment(target, c.kind, c.id);
		const outgoing = c.kind && adaptiveEnvironment(source, c.kind, c.id);
		if (!ignoreAbility && !incoming && !outgoing) continue;
		if (view === move) view = {...move, ...(adaptiveMoveSnapshot(move))};
		for (const key of Object.keys(c.before)) {
			const before = c.before[key], after = c.after[key];
			if (!ignoreAbility && incoming && key === 'secondaries') {
				view.secondaries = view.secondaries?.flatMap((secondary, index) => {
					const original = before?.[index], changed = after?.[index];
					if (!changed || secondary.self) return [secondary];
					if (!original && secondary.status === changed.status && secondary.volatileStatus === changed.volatileStatus &&
						secondary.onHit === changed.onHit) return [];
					if (original?.chance && changed.chance > original.chance && secondary.chance) {
						return [{...secondary, chance: secondary.chance * original.chance / changed.chance}];
					}
					return [secondary];
				});
				continue;
			}
			if (!ignoreAbility && !(['basePower', 'damage', 'accuracy'].includes(key))) continue;
			if (typeof before === 'number' && typeof after === 'number' && typeof (view as any)[key] === 'number') {
				const beneficial = after > before;
				if (ignoreAbility || (key === 'accuracy' ? outgoing && !beneficial : (incoming && beneficial) || (outgoing && !beneficial))) {
					(view as any)[key] = before && after && key === 'basePower' ? (view as any)[key] * before / after : before;
				}
			} else if (ignoreAbility) {
				(view as any)[key] = Utils.deepClone(before);
			}
		}
	}
	if (move.category !== 'Status' && adaptiveAnalyzed(source, target)) {
		if (view === move) view = {...move, ...adaptiveMoveSnapshot(move)};
		view.ignoreImmunity = true;
	}
	if (view !== move) {
		// Damage and subsequent hit callbacks must see the same per-target results.
		view.moveHitData = move.moveHitData ||= {};
		(view as any).adaptiveViewFor = target;
	}
	return view;
}

/** Native moves with environmental effects outside Terrain handlers. Shared rewrites (e.g. Weather Ball) stay intact. */
export function adaptiveCaptureNativeMove(battle: Battle, move: ActiveMove, before: AnyObject) {
	if (['dragonrage', 'nightshade', 'sonicboom'].includes(move.id) && battle.field.terrain) {
		adaptiveCaptureMove(move, before, battle.field.getTerrain());
	}
}
export function adaptiveWeatherSecondaries(battle: Battle, source: Pokemon, target: Pokemon, move: ActiveMove) {
	if (!['chillingwater', 'snarl'].includes(move.id) || !adaptiveEnvironment(target, 'weather') ||
		!['hail', 'snow'].includes(target.effectiveWeather()) || battle.field.isTerrain('coldeclipseterrain')) return move.secondaries;
	// These moves strengthen the stage drop in hail/snow. Restore only the native harmful effect.
	return battle.dex.moves.get(move.id).secondaries;
}

export function adaptiveFieldMultiplier(battle: Battle, source: Pokemon, target: Pokemon | null, multiplier: number) {
	if (multiplier < 1 && adaptiveEnvironment(source, 'fields')) return 1;
	if (multiplier > 1 && adaptiveEnvironment(target, 'fields')) return 1;
	return multiplier;
}
export function adaptiveCheckpoint(battle: Battle) {
	for (const p of battle.getAllActive()) {
		if (!adaptiveActive(p)) { adaptiveDisplay(p); continue; }
		const m = adaptiveMemory(p);
		if (m.checkpoint === battle.turn) continue;
		m.checkpoint = battle.turn;
		adaptiveStatus(p, p.status);
		if (p.volatiles.confusion) adaptiveStatus(p, 'confusion');
		for (const type of m.activeTypes) advance(m.types[type], battle.turn, 3);
		for (const foe of p.foes(true)) {
			if (!foe?.isActive || !foe.hp) continue;
			if (Object.values(foe.boosts).some(n => n > 0)) advance(opponent(p, foe).setup, battle.turn, 2);
		}
		for (const record of Object.values(m.opponents)) {
			if (record.points === 4) { record.complete = true; record.setup.stage = 2; }
			for (const key of record.pendingBypass) if (!record.bypass.includes(key)) record.bypass.push(key);
			for (const key of record.pendingDefenses) if (!record.defenses.includes(key)) record.defenses.push(key);
			record.pendingBypass = []; record.pendingDefenses = [];
		}
		for (const [id, record] of Object.entries(m.statuses)) {
			advance(record, battle.turn, 2);
			if (record.stage === 2) {
				if (statusKey(p.status) === id) p.cureStatus();
				if (id === 'confusion' && p.removeVolatile(id)) battle.add('-end', p, 'confusion');
			}
		}
		for (const [id, record] of Object.entries(m.chip)) {
			advance(record, battle.turn, 2);
			if (record.stage === 2 && removableChip.has(id) && p.volatiles[id]) {
				p.removeVolatile(id);
				if (id !== 'partiallytrapped') battle.add('-end', p, id);
			}
		}
		const field = adaptiveFieldKey(battle.field.terrain);
		if (field) { expose(m.fields, field); advance(m.fields[field], battle.turn, 3); }
		const weather = p.effectiveWeather();
		if (weather) { expose(m.weather, weather); advance(m.weather[weather], battle.turn, 3); }
		adaptiveDisplay(p);
	}
}
export function adaptiveDisplay(p: Pokemon) {
	const m = p.m.adaptiveCycle as AdaptiveMemory | undefined;
	if (!m) return;
	const snapshot = JSON.stringify({
		active: adaptiveActive(p), types: m.types, activeTypes: m.activeTypes, opponents: Object.fromEntries(Object.entries(m.opponents).map(([id, r]) => [id, {...r,
			bypass: r.bypass.map(() => "Ability bypass"), pendingBypass: [], pendingDefenses: [],
			defenses: r.defenses.map(key => key.split(":")[1]),
		}])),
		statuses: m.statuses, chip: m.chip, fields: m.fields, weather: m.weather,
		field: adaptiveFieldKey(p.battle.field.terrain), currentWeather: p.effectiveWeather(),
	});
	if (snapshot !== m.lastDisplay) { p.battle.add('-adaptation', p, snapshot.replace(/\|/g, '\\u007c')); m.lastDisplay = snapshot; }
}

/** Current types first; otherwise National type-chart order. Only resistances, never a new immunity. */
export const ADAPTIVE_TYPE_ORDER = ['Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice', 'Fighting', 'Poison',
	'Ground', 'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy'];
export function adaptiveCountertype(p: Pokemon, source: Pokemon, move: ActiveMove) {
	if (move.category === 'Status' || !adaptiveAnalyzed(p, source) || !p.runImmunity(move) || p.runEffectiveness(move) < 0) return;
	const previous = p.types;
	const added = p.addedType;
	let selected = '';
	try {
		for (const type of [...p.getTypes(), ...ADAPTIVE_TYPE_ORDER]) {
			p.types = [type]; p.addedType = '';
			if (p.runImmunity(move) && p.runEffectiveness(move) < 0) { selected = type; break; }
		}
	} finally { p.types = previous; p.addedType = added; }
	// Silvally normally locks its species typing even without RKS System. This event ability explicitly changes it.
	if (selected && !p.terastallized && p.setType(selected, p.species.num === 773)) {
		p.battle.add('-start', p, 'typechange', selected, '[from] ability: Adaptive Cycle');
	}
}

/** Record and selectively discard a defensive callback's numeric contribution, including unbreakable composites. */
export function adaptiveAbilityContribution(
	battle: Battle, event: string, holder: Pokemon, target: Pokemon, source: Pokemon | null,
	effect: Effect, move: Effect | null, before: number, value: any, oldModifier: number
) {
	if (!source || move?.effectType !== 'Move' || (move as ActiveMove).category === 'Status') return value;
	const defensiveStat = event === 'ModifyDef' || event === 'ModifySpD';
	const defenderTarget = defensiveStat || event === 'Damage';
	const attacker = defenderTarget ? source : target;
	const defender = defenderTarget ? target : source;
	if (holder !== defender || !adaptiveActive(attacker) || attacker.isAlly(defender)) return value;
	const factor = battle.event.modifier / oldModifier;
	const decrease = ['BasePower', 'ModifyAtk', 'ModifySpA', 'ModifyDamage', 'Damage'].includes(event);
	const reduction = defensiveStat ? factor > 1 || (typeof value === 'number' && value > before) :
		decrease && (factor < 1 || (typeof value === 'number' && value < before));
	if (!reduction) return value;
	const record = opponent(attacker, defender);
	const key = `${effect.id}:${event}`;
	if (record.complete || record.defenses.includes(key)) {
		battle.event.modifier = oldModifier;
		return typeof value === 'number' ? before : undefined;
	}
	if (!record.pendingDefenses.includes(key)) record.pendingDefenses.push(key);
	return value;
}

const reductionCallbacks = new WeakMap<Function, Function>();

/** Delegated composite callbacks retain the component identity for early reduction learning. */
export function adaptiveReductionCallback(ability: Effect, callback: Function) {
	const cached = reductionCallbacks.get(callback);
	if (cached) return cached;
	// Shared callback aliases represent one mechanism. Stable across Dex lookup order and restores.
	const mechanism = {id: createHash('sha256').update(callback.toString()).digest('hex')} as Effect;
	const wrapped = function (this: Battle, ...args: any[]) {
		const target = this.event?.target as Pokemon;
		const source = this.event?.source as Pokemon | null;
		const owner = this.effectState?.target as Pokemon;
		if (!target?.m || !source?.m || !owner?.m ||
			(!adaptiveActive(target) && !adaptiveActive(source))) return callback.apply(this, args);
		const stack: {childFactor: number; childReturns: any[]}[] = (this as any).adaptiveReductionStack ||= [];
		const frame = {childFactor: 1, childReturns: [] as any[]};
		const before = this.event.modifier;
		stack.push(frame);
		let value: any;
		try {
			value = callback.apply(this, args);
			// Subtract delegated contributions before considering the composite's own extra reduction.
			const ownValue = frame.childReturns.includes(value) ? undefined : value;
			const filtered = adaptiveAbilityContribution(this, this.event.id, owner, target, source, mechanism,
				this.event.effect as Effect | null, args[0], ownValue, before * frame.childFactor);
			if (ownValue !== undefined) value = filtered;
		} finally {
			stack.pop();
			const parent = stack[stack.length - 1];
			if (parent) {
				parent.childFactor *= this.event.modifier / before;
				parent.childReturns.push(value);
			} else {
				delete (this as any).adaptiveReductionStack;
			}
		}
		return value;
	};
	reductionCallbacks.set(callback, wrapped);
	reductionCallbacks.set(wrapped, wrapped);
	return wrapped;
}

/** Filter this one environmental callback, never abilities or Auras. */
export function adaptiveEnvironmentalContribution(
	battle: Battle, event: string, effect: Effect, target: Pokemon, source: Pokemon | null,
	before: any, value: any, oldModifier: number
) {
	if (!['Terrain', 'Weather'].includes(effect.effectType)) return value;
	const kind = effect.effectType === 'Terrain' ? 'fields' : 'weather';
	let lower = false, upper = false;
	if (['BasePower', 'ModifyDamage', 'WeatherModifyDamage'].includes(event)) {
		lower = adaptiveEnvironment(target, kind, effect.id);
		upper = adaptiveEnvironment(source, kind, effect.id);
	} else if (/^Modify(Atk|Def|SpA|SpD|Spe|Priority)$/.test(event)) {
		lower = adaptiveEnvironment(target, kind, effect.id);
	} else if (['Accuracy', 'ModifyAccuracy'].includes(event)) {
		lower = adaptiveEnvironment(source, kind, effect.id);
	}
	const factor = battle.event.modifier / oldModifier;
	if ((lower && factor < 1) || (upper && factor > 1)) battle.event.modifier = oldModifier;
	if (typeof value === 'number' && typeof before === 'number' && ((lower && value < before) || (upper && value > before))) return before;
	return value;
}
