import {RKSSystemMemoryAbilities} from '../data/rks-system-memory';
import {DisabledSpecies} from '../data/disabled-species';
import {AbilityComponentExclusions, SharedPassiveComponents, SharedPassiveComponentAdditions, SignaturePassiveComponents, SignaturePassiveRemovedComponents, SignaturePassiveDescriptions} from '../data/passive-ability-cleanup';
import { getAbilityDisplayComponents } from '../data/ability-display';
/** Isolated, bounded single-action scenarios using the real battle engine. */
import { Battle } from './battle';
import { Dex } from './dex';
import { Auras } from '../data/auras';
import { Terrains } from '../data/terrains';
import { AbilityComponents } from '../data/ability-components';
import { passiveEffect, passiveState } from './species-passives';

const STATS = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'] as const;
const BOOSTS = ['atk', 'def', 'spa', 'spd', 'spe', 'accuracy', 'evasion'] as const;
const CALC_SIDE_CONDITIONS = ['reflect', 'lightscreen', 'auroraveil', 'tailwind', 'safeguard', 'mist'];
const CALC_ROOMS = ['gravity', 'magicroom', 'wonderroom', 'trickroom'];
const CALC_WEATHER = ['', 'raindance', 'sunnyday', 'sandstorm', 'hail', 'desolateland', 'primordialsea', 'deltastream'];
const ASSUMPTIONS = [
	'Strong Winds boosts Fairy Wind, Gust, Icy Wind, Ominous Wind, Razor Wind, Silver Wind, Twister, Heavenly Wing and Airstream Assault by 1.5x on every field. Special Flying moves independently gain 1.5x (2.25x when both apply). Cold Eclipse retains its separate wind boost; Snowy Mountain retains its extra Storm-move bonuses.',
	'Multi-hit damage is reported separately for each affected actor. After a KO, remaining strikes may chain into another living opposing active Pokemon; they do not all necessarily hit the originally selected target. Native Hydra Bond variable hit counts are maximized in singles/doubles, but native accuracy checks and attacker-faint stopping remain.',
	'Field stages are separate registry entries. Short-Circuit and Crystal Cavern starting cycle positions are configurable; transition counters, previous-field stacks, field duration/provenance and pending field collapses use fresh-entry defaults.',
	'Screens and supported side conditions apply to the named side. Protect, remaining Substitute HP and consumed Decoy Pincers are explicit optional inputs. Entry hazards, Helping Hand and arbitrary mid-battle volatile states are not configurable. No repeated-hit KO estimates are made.',
	'Adaptive Cycle starts with empty memory in this fresh-entry calculator; completed adaptations require battle history and are not assumed.',
	'Sampled single-action outcomes, not guaranteed min/max damage or exact KO probabilities. Misses, critical hits and random redirects are included.',
	'Fresh battle entry effects run first. Requested HP and stages then replace entry HP/stages. Selected statuses are applied through the engine.',
	'No previous turns, hits, faints, consumed items, stored moves, copied abilities or field history except explicitly supplied Rage Fist bonus. History-dependent abilities use fresh-entry state; an actor may explicitly start with Void Crossing curse, but this does not model a full mid-battle snapshot.',
	'Only the selected attacker acts. No opponent move, speed-order contest, end-of-turn residuals, delayed-hit resolution or subsequent-turn KO prediction.',
	'Damage is actual HP removed during the action, capped by available HP, and includes immediate triggered damage. Net HP loss can differ because of healing.',
];

const PUBLIC_STATE_ABILITIES = ['noability', 'synchronize', 'healer', 'intimidate', 'drizzle', 'drought', 'sandstream', 'snowwarning', 'deltastream', 'roughskin', 'toughclaws', 'skilllink', 'hydrabond', 'galewings', 'windpower', 'windrider', 'decoypincers', 'ironvise', 'silentflight', 'overgrow', 'blaze', 'torrent', 'levitate', 'cloudnine', 'airlock', 'soundproof', 'waterabsorb', 'technician', 'sharpness', 'swarm'];
const PUBLIC_STATE_ITEMS = ['', 'leftovers', 'lifeorb', 'choicespecs', 'choiceband', 'choicescarf', 'heavydutyboots', 'rockyhelmet', 'loadeddice'];

export interface CalcActor {
	protect: boolean;
	substituteHP: number;
	decoyPincersSpent: boolean;
	set: PokemonSet;
	hpPercent: number;
	boosts: SparseBoostsTable;
	status: string;
	gimmick: string;
	voidCrossingCurse: boolean;
	rageFistBonus: number;
	threadShelterGuard: boolean;
	buriedTrioSpent: boolean;
	silentFlightSpent: boolean;
	elasticBellySpent: boolean;
	feedbackMarked: boolean;
}
export interface CalcScenario {
	evaluationMode: string;
	format: Format;
	field: string;
	actors: CalcActor[];
	move: string;
	weather: string;
	aura: string;
	screens: string[];
	sideConditions: string[][];
	rooms: string[];
	fieldState: { shortCircuit: number, crystalCavern: number };
	attackMode: string;
	samples: number;
	seed: number;
}

function record(value: unknown): Record<string, any> {
	if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Expected an object.');
	return value as Record<string, any>;
}
function keys(value: Record<string, any>, allowed: string[]) {
	for (const key of Object.keys(value)) if (!allowed.includes(key)) throw new Error(`Unsupported input: ${key}`);
}
function integer(value: unknown, fallback: number, min: number, max: number) {
	if (value === undefined) return fallback;
	if (typeof value !== 'number' || !Number.isInteger(value) || value < min || value > max) {
		throw new Error(`Expected an integer from ${min} to ${max}.`);
	}
	return value;
}
function name(value: unknown, fallback = ''): string {
	if (value === undefined) return fallback;
	if (typeof value !== 'string' || value.length > 100) throw new Error('Invalid name.');
	return value.trim();
}
function choice(value: unknown, fallback: string, allowed: string[]) {
	const result = name(value, fallback);
	if (!allowed.includes(result)) throw new Error(`Unsupported choice: ${result}`);
	return result;
}
function actor(input: unknown, move: string): CalcActor {
	const data = record(input);
	keys(data, [
		'species', 'ability', 'item', 'nature', 'level', 'evs', 'ivs', 'boosts', 'hpPercent', 'status', 'gimmick',
		'teraType', 'gender', 'moves', 'voidCrossingCurse', 'rageFistBonus',
		'threadShelterGuard', 'buriedTrioSpent', 'silentFlightSpent', 'elasticBellySpent', 'feedbackMarked', 'protect', 'substituteHP', 'decoyPincersSpent',
	]);
	if (data.voidCrossingCurse !== undefined && typeof data.voidCrossingCurse !== 'boolean') {
		throw new Error('Void Crossing curse must be a boolean.');
	}
	if (data.rageFistBonus !== undefined && (typeof data.rageFistBonus !== 'number' || !Number.isFinite(data.rageFistBonus) || data.rageFistBonus < 0 || data.rageFistBonus > 100)) throw new Error('Rage Fist bonus must be a finite number from 0 to 100.');
	const species = Dex.species.get(name(data.species));
	for (const key of ['threadShelterGuard', 'buriedTrioSpent', 'silentFlightSpent', 'elasticBellySpent', 'feedbackMarked', 'protect', 'decoyPincersSpent']) {
		if (data[key] !== undefined && typeof data[key] !== 'boolean') throw new Error(`${key} must be a boolean.`);
	}
	if (!species.exists) throw new Error('Unknown species or form.');
	const ability = Dex.abilities.get(name(data.ability) || species.abilities['0']);
	if (!ability.exists) throw new Error('Unknown ability.');
	const itemName = name(data.item);
	const item = Dex.items.get(itemName);
	if (item.id === 'mismagiusite') throw new Error('Mismagiusite is deferred. Mega Mismagius currently requires Dusk Stone.');
	if (itemName && !item.exists) throw new Error('Unknown item.');
	const nature = Dex.natures.get(name(data.nature) || 'Serious');
	if (!nature.exists) throw new Error('Unknown nature.');
	const moves = data.moves === undefined ? [move || 'Splash'] : Array.isArray(data.moves) ? data.moves.slice() : data.moves;
	if (!Array.isArray(moves) || !moves.length || moves.length > 4 || moves.some(m => typeof m !== 'string' || !Dex.moves.get(m).exists)) {
		throw new Error('Provide one to four recognized moves.');
	}
	if (move && !moves.some(m => Dex.moves.get(m).id === Dex.moves.get(move).id)) {
		if (moves.length === 4) throw new Error('The selected attack must be in the attacker moveset (maximum four moves).');
		moves.unshift(move);
	}
	const set: PokemonSet = {
		name: species.name, species: species.name, ability: ability.name, item: itemName, nature: nature.name,
		level: integer(data.level, 100, 1, 100), moves: moves.slice(), gender: '',
		evs: {} as StatsTable, ivs: {} as StatsTable,
		teraType: name(data.teraType, 'Stellar'),
	};
	if (!Dex.types.get(set.teraType || 'Stellar').exists) throw new Error('Unknown Tera type.');
	if (data.gender !== undefined) set.gender = choice(data.gender, '', ['', 'M', 'F', 'N']) as GenderName;
	if (set.gender && ((species.gender && set.gender !== species.gender) ||
		(set.gender === 'N' && species.gender !== 'N'))) {
		throw new Error('The selected gender is not supported by this species.');
	}
	for (const [kind, fallback, max] of [['evs', 0, 252], ['ivs', 31, 31]] as const) {
		const values = data[kind] === undefined ? {} : record(data[kind]);
		keys(values, [...STATS]);
		for (const stat of STATS) set[kind][stat] = integer(values[stat], fallback, 0, max);
	}
	if (Object.values(set.evs).reduce((a, b) => a + b, 0) > 510) throw new Error('EV total exceeds 510.');
	const rawBoosts = data.boosts === undefined ? {} : record(data.boosts);
	keys(rawBoosts, [...BOOSTS]);
	const boosts: SparseBoostsTable = {};
	for (const stat of BOOSTS) boosts[stat] = integer(rawBoosts[stat], 0, -6, 6);
	return {
		protect: data.protect === true, substituteHP: integer(data.substituteHP, 0, 0, 9999), decoyPincersSpent: data.decoyPincersSpent === true,
		set, boosts, hpPercent: integer(data.hpPercent, 100, 1, 100),
		status: choice(data.status, '', ['', 'brn', 'par', 'psn', 'tox', 'slp', 'frz']),
		gimmick: choice(data.gimmick, '', ['', 'mega', 'tera', 'gmax']),
		voidCrossingCurse: data.voidCrossingCurse === true,
		rageFistBonus: data.rageFistBonus ?? 0,
		threadShelterGuard: data.threadShelterGuard === true,
		buriedTrioSpent: data.buriedTrioSpent === true,
		silentFlightSpent: data.silentFlightSpent === true,
		elasticBellySpent: data.elasticBellySpent === true,
		feedbackMarked: data.feedbackMarked === true,
	};
}

export function calculatorFormats() {
	return Dex.formats.all().filter(format => format.mod === 'gen9' &&
		['singles', 'doubles', 'freeforall'].includes(format.gameType) &&
		(format.terrain || ['gen9nofieldsinglesgame', 'gen9nofielddoublesbattle'].includes(format.id)) &&
		format.terrain !== 'randomterrain' && (format.gameType !== 'freeforall' || format.playerCount === 4));
}
function calculatorFieldIDs() {
	return [...new Set([...Object.keys(Terrains), ...calculatorFormats().map(format => format.terrain).filter(Boolean)])] as string[];
}
export function calculatorMetadata() {
	return {
		moves: Dex.moves.all().filter(m => m.exists).map(m => ({ id: m.id, name: m.name })),
		formats: calculatorFormats().map(f => ({ id: f.id, name: f.name, mode: f.gameType, field: f.terrain || '' })),
		fields: [{id: '', name: 'No field'}, ...calculatorFieldIDs().map(id => ({id, name: Terrains[id]?.name || Dex.conditions.get(id).name || id}))],
		species: Dex.species.all().filter(s => s.exists && !DisabledSpecies.has(s.id) && (!s.isCosmeticForme || s.passives.length)).map(s => ({ name: s.name, abilities: s.abilities, passives: s.passives, baseStats: s.baseStats })),
		abilityComponentExclusions: AbilityComponentExclusions, sharedPassiveComponents: SharedPassiveComponents, sharedPassiveComponentAdditions: SharedPassiveComponentAdditions,
		signaturePassiveComponents: SignaturePassiveComponents,
		signaturePassiveRemovedComponents: SignaturePassiveRemovedComponents, signaturePassiveDescriptions: SignaturePassiveDescriptions,
		rksSystemMemoryAbilities: {...RKSSystemMemoryAbilities, '': ['scrappy']},
		abilityComponents: Object.fromEntries(Object.keys(AbilityComponents).map(id =>
			[id, getAbilityDisplayComponents(id).map(p => Dex.abilities.get(p).name)])),
		auras: Object.values(Auras).map(a => ({ id: a.id, name: a.name })),
		weather: CALC_WEATHER, sideConditions: CALC_SIDE_CONDITIONS, rooms: CALC_ROOMS,
		fieldStates: {
			shortcircuitterrain: { key: 'shortCircuit', label: 'Starting electric cycle', options: ['0.8x', '1.5x', '0.5x', '1.2x', '2x'] },
			crystalcavernterrain: { key: 'crystalCavern', label: 'Starting crystal type', options: ['Fire', 'Water', 'Grass', 'Psychic'] },
		},
		publicState: { abilities: PUBLIC_STATE_ABILITIES, items: PUBLIC_STATE_ITEMS, weatherClear: 'none', limitations: 'Bounded single-action state, not a complete battle snapshot. Unsupported abilities/items/passives and gimmick initialization are rejected. Historical move counters and field history remain unsupported unless explicitly supplied.' },
		assumptions: ASSUMPTIONS,
	};
}
export function validateScenario(input: unknown): CalcScenario {
	const data = record(input);
	keys(data, ['format', 'field', 'actors', 'move', 'weather', 'aura', 'screens', 'attackMode', 'samples', 'seed', 'sideConditions', 'rooms', 'fieldState', 'evaluationMode']);
	const format = calculatorFormats().find(f => f.id === data.format);
	if (!format) throw new Error('Unsupported calculator format. Select one from this server.');
	const move = Dex.moves.get(name(data.move));
	if (!move.exists) throw new Error('Unknown move.');
	if (!Array.isArray(data.actors) || data.actors.length !== 4) throw new Error('Provide four scenario slots.');
	const screens = data.screens ?? [];
	if (!Array.isArray(screens) || screens.length > 3 || screens.some(s => !['reflect', 'lightscreen', 'auroraveil'].includes(s))) {
		throw new Error('Unsupported screens.');
	}
	const sideConditions = data.sideConditions ?? [[], screens];
	if (!Array.isArray(sideConditions) || sideConditions.length !== 2 || sideConditions.some(side => !Array.isArray(side) || side.length > CALC_SIDE_CONDITIONS.length || side.some(c => !CALC_SIDE_CONDITIONS.includes(c)))) throw new Error('Unsupported side conditions.');
	const rooms = data.rooms ?? [];
	if (!Array.isArray(rooms) || rooms.length > CALC_ROOMS.length || rooms.some(c => !CALC_ROOMS.includes(c))) throw new Error('Unsupported room conditions.');
	const fieldState = data.fieldState === undefined ? {} : record(data.fieldState);
	keys(fieldState, ['shortCircuit', 'crystalCavern']);
	const aura = name(data.aura);
	if (aura && !Object.prototype.hasOwnProperty.call(Auras, aura)) throw new Error('Unknown aura.');
	return {
		evaluationMode: choice(data.evaluationMode, 'fresh-entry', ['fresh-entry', 'public-state']),
		format, field: choice(data.field, format.terrain || '', ['', ...calculatorFieldIDs()]), actors: data.actors.map((a, i) => actor(a, i ? '' : move.name)), move: move.id,
		weather: choice(data.weather, '', [...CALC_WEATHER, 'none']),
		sideConditions: sideConditions.map(side => [...new Set(side)] as string[]), rooms: [...new Set(rooms)] as string[],
		fieldState: { shortCircuit: integer(fieldState.shortCircuit, 0, 0, 4), crystalCavern: integer(fieldState.crystalCavern, 0, 0, 3) },
		aura, screens: [...new Set(screens)] as string[],
		attackMode: choice(data.attackMode, '', ['', 'z', 'max']),
		samples: integer(data.samples, 32, 8, 64), seed: integer(data.seed, 1, 1, 0x7fffffff),
	};
}

export function buildCalculatorBattle(scenario: CalcScenario, sample: number) {
	const seed = (scenario.seed + Math.imul(sample, 2654435761)) >>> 0;
	const battle = new Battle({
		formatid: scenario.format.id,
		format: Object.assign(Object.create(Object.getPrototypeOf(scenario.format)), scenario.format, {terrain: scenario.field}),
		seed: `gen5,${seed >>> 16},${seed & 65535},${(seed ^ 0xa5a5) & 65535},${(seed ^ 0x5a5a) >>> 16}`,
	});
	const normalRunSwitch = battle.actions.runSwitch;
	try {
		if (scenario.evaluationMode === 'public-state') {
			for (const spec of scenario.actors) {
				if (['slp', 'tox', 'frz'].includes(spec.status)) throw new Error('Public-state sleep, toxic and frostbite counters are not supported.');
				if (!PUBLIC_STATE_ABILITIES.includes(Dex.toID(spec.set.ability)) || !PUBLIC_STATE_ITEMS.includes(Dex.toID(spec.set.item)) || spec.gimmick) throw new Error('Unsupported public-state ability, item or gimmick; use a reviewed configuration.');
				const species = Dex.species.get(spec.set.species);
				if (species.passives.some(id => !PUBLIC_STATE_ABILITIES.includes(Dex.toID(id)))) throw new Error('Unsupported public-state species passive.');
			}
			// Isolated evaluator only: do not replay entry callbacks, seeds, weather setters or boosts.
			battle.actions.runSwitch = function (pokemon) {
				const entered = [pokemon];
				while (battle.queue.peek()?.choice === 'runSwitch') entered.push(battle.queue.shift()!.pokemon!);
				for (const mon of entered) { mon.isStarted = true; mon.draggedIn = null; }
				return true;
			};
		}
		const [a, d, extraA, extraD] = scenario.actors.map(spec => ({ ...spec, set: JSON.parse(JSON.stringify(spec.set)) as PokemonSet }));
		battle.setPlayer('p1', { name: 'Attacker', team: [a.set, ...(scenario.format.gameType === 'doubles' ? [extraA.set] : [])] });
		battle.setPlayer('p2', { name: 'Defender', team: [d.set, ...(scenario.format.gameType === 'doubles' ? [extraD.set] : [])] });
		if (scenario.format.gameType === 'freeforall') {
			battle.setPlayer('p3', { name: 'Other foe 1', team: [extraA.set] });
			battle.setPlayer('p4', { name: 'Other foe 2', team: [extraD.set] });
		}
		if (battle.requestState === 'teampreview') battle.makeChoices(...battle.sides.map(() => 'team'));
		battle.actions.runSwitch = normalRunSwitch;
		const mons = [battle.p1.active[0], battle.p2.active[0]];
		if (scenario.format.gameType === 'doubles') mons.push(battle.p1.active[1], battle.p2.active[1]);
		if (scenario.format.gameType === 'freeforall') mons.push(battle.sides[2].active[0], battle.sides[3].active[0]);
		if (scenario.weather === 'none') battle.field.clearWeather();
		if (scenario.weather && scenario.weather !== 'none' && battle.field.weather !== scenario.weather &&
			!battle.field.setWeather(scenario.weather, mons[0], battle.dex.conditions.get(scenario.weather))) {
			throw new Error('The scenario field or abilities prevented the requested weather.');
		}
		if (scenario.aura && !battle.field.setAura(scenario.aura, 5)) {
			throw new Error('This base field cannot support the selected aura. Auras do not replace full fields.');
		}
		for (const [i, mon] of mons.entries()) {
			const spec = scenario.actors[i];
			if (scenario.evaluationMode === 'public-state') { mon.newlySwitched = false; mon.activeTurns = 1; }
			if (!mon?.hp) throw new Error('An entry effect prevented this starting position.');
			if (spec.gimmick === 'mega' && !battle.actions.runMegaEvo(mon)) throw new Error('Mega/Ultra activation is unavailable for this set.');
			if (spec.gimmick === 'tera') {
				battle.actions.terastallize(mon);
				if (!mon.terastallized) throw new Error('Tera activation failed.');
			}
			if (spec.gimmick === 'gmax') {
				if (!mon.side.canDynamaxNow() || !mon.canDynamax) throw new Error('Gigantamax is unavailable for this set and mode.');
				battle.runAction({ choice: 'runDynamax', pokemon: mon, priority: 0, speed: mon.speed });
				if (!mon.volatiles['dynamax']) throw new Error('Gigantamax activation failed.');
			}
			mon.sethp(Math.max(1, Math.floor(mon.maxhp * spec.hpPercent / 100)));
			if (mon.getPassives().includes('shieldsdown')) {
				// Scenario HP describes the starting form; do not run healing residuals here.
				battle.singleEvent('SwitchIn', passiveEffect(battle, 'shieldsdown'), passiveState(mon, 'shieldsdown'), mon);
			}
			Object.assign(mon.boosts, spec.boosts);
			if (spec.status && mon.status !== spec.status && !mon.setStatus(spec.status)) {
				throw new Error(`${mon.species.name} cannot receive the selected status in this position.`);
			}
			mon.m.rageFistBonus = spec.rageFistBonus;
			mon.m.buriedTrioSpent = spec.buriedTrioSpent;
			if (spec.silentFlightSpent) {
				if (!mon.hasAbility('silentflight')) throw new Error('Silent Flight state requires Silent Flight.');
				mon.addVolatile('silentflight');
				mon.volatiles.silentflight.spent = true;
			}
			mon.m.elasticBellySpent = spec.elasticBellySpent;
			if (spec.threadShelterGuard) {
				if (!mon.hasAbilityOrPassive('threadshelter')) throw new Error('Thread Shelter guard requires Thread Shelter.');
				mon.addVolatile('threadshelter');
			}
			if (spec.feedbackMarked) {
				const providers = mons.filter(p => p?.hp && p.isActive && !p.isAlly(mon) && p.hasAbilityOrPassive('feedback'));
				if (!providers.length) throw new Error('Feedback mark requires an active opposing Feedback holder.');
				mon.addVolatile('feedback', providers[0]);
				mon.volatiles.feedback.sources = new Map(providers.map(p => [p, p.m.feedbackEntry || 0]));
			}
			if (spec.protect) mon.addVolatile('protect', mon, battle.dex.getActiveMove('protect'));
			if (spec.substituteHP) {
				if (spec.substituteHP > Math.floor(mon.maxhp / 4)) throw new Error('Substitute HP exceeds its supported maximum.');
				mon.addVolatile('substitute', mon, battle.dex.getActiveMove('substitute'));
				mon.volatiles.substitute.hp = spec.substituteHP;
			}
			if (spec.decoyPincersSpent) {
				if (!mon.hasAbility(['decoypincers', 'ironvise'])) throw new Error('Consumed Decoy Pincers requires Decoy Pincers or Iron Vise.');
				mon.abilityState.used = true;
			}
			mon.updateSpeed();
			if (spec.voidCrossingCurse &&
				!mon.addVolatile('voidcrossingcurse', mons[1], battle.dex.abilities.get('voidcrossing'))) {
				throw new Error(`${mon.species.name} cannot receive Void Crossing curse in this position.`);
			}
		}
		battle.ShortCircuitCounter = scenario.fieldState.shortCircuit;
		battle.CrystalCavernCounter = scenario.fieldState.crystalCavern;
		for (const room of scenario.rooms) battle.field.addPseudoWeather(room, mons[0]);
		for (const [i, conditions] of scenario.sideConditions.entries()) {
			const side = battle.sides[i];
			for (const id of conditions) {
				if (scenario.evaluationMode !== 'public-state') {
					side.addSideCondition(id, mons[i]);
					continue;
				}
				// These allowlisted conditions are already active; do not replay their start effects.
				const condition = battle.dex.conditions.get(id);
				side.sideConditions[condition.id] = battle.initEffectState({
					id: condition.id, target: side, source: mons[i], sourceSlot: mons[i].getSlot(),
					duration: condition.duration,
				});
			}
		}
		for (const mon of mons) mon.updateSpeed();
		return { battle, mons };
	} catch (error) {
		battle.destroy();
		throw error;
	}
}

export function calculateScenario(input: unknown) {
	const scenario = validateScenario(input);
	const outcomes: { damage: number[], loss: number[], ko: boolean[], maxhp: number[] }[] = [];
	let exampleLog: string[] = [];
	let resolved: unknown;
	const assumptions = scenario.evaluationMode === 'public-state' ? ASSUMPTIONS.filter(text => !text.startsWith('Fresh battle entry')).concat(['Bounded public-state mode skips switch-in callbacks, initializes reviewed current states, and treats actors as already active for one turn. Unsupported ability/item/passive initialization, gimmicks and sleep/toxic/frostbite counters are rejected. Field history and unlisted move-history state remain unsupported; this is not a full mid-battle snapshot.']) : ASSUMPTIONS;
	let incenseBranches = false;
	const actionOutcomes: unknown[] = [];
	const publicState = (battle: Battle, mons: Pokemon[]) => ({ field: battle.field.terrain, aura: battle.field.auraField, weather: battle.field.weather, actors: mons.map(mon => ({ hp: mon.hp, maxhp: mon.maxhp, status: mon.status, boosts: { ...mon.boosts }, substituteHP: mon.volatiles.substitute?.hp || 0, fainted: !mon.hp, abilitySuppressed: mon.ignoringAbility(), passives: mon.getPassives() })) });
	for (let sample = 0; sample < scenario.samples; sample++) {
		const { battle, mons } = buildCalculatorBattle(scenario, sample);
		try {
			const before = mons.map(mon => mon.hp);
			const beforeState = publicState(battle, mons);
			const maxhp = mons.map(mon => mon.maxhp);
			if (!sample) {
				resolved = {
					field: battle.field.terrain, aura: battle.field.auraField, weather: battle.field.weather,
					fieldState: { shortCircuit: battle.ShortCircuitCounter, crystalCavern: battle.CrystalCavernCounter },
					rooms: Object.keys(battle.field.pseudoWeather), sideConditions: battle.sides.map(side => Object.keys(side.sideConditions)),
					actors: mons.map(mon => ({
						species: mon.species.name, ability: mon.getAbility().name, passives: mon.getPassives(), item: mon.getItem().name,
						tera: mon.terastallized || '', hp: mon.hp, maxhp: mon.maxhp,
						status: mon.status, boosts: { ...mon.boosts }, rageFistBonus: mon.m.rageFistBonus || 0, voidCrossingCurse: !!mon.volatiles['voidcrossingcurse'],
					})),
				};
			}
			const damage = mons.map(() => 0);
			for (const [i, mon] of mons.entries()) {
				const original = mon.damage;
				mon.damage = function (amount, source, effect) {
					const result = original.call(this, amount, source, effect);
					damage[i] += result;
					return result;
				};
			}
			const attacker = mons[0];
			if (!sample && scenario.move === 'scentedgeyser' && scenario.attackMode === '' && attacker.hasItem('luckincense')) incenseBranches = true;
			const logStart = battle.log.length;
			const move = battle.dex.moves.get(scenario.move);
			const options: { zMove?: string, maxMove?: string } = {};
			if (scenario.attackMode === 'z') {
				options.zMove = battle.actions.getZMove(move, attacker);
				if (!options.zMove) throw new Error('This set cannot use the selected Z-move.');
			}
			if (scenario.attackMode === 'max') {
				if (!attacker.volatiles['dynamax']) throw new Error('Activate Gigantamax before using a Max move.');
				options.maxMove = battle.actions.getActiveMaxMove(move, attacker).id;
				if (battle.dex.moves.get(options.maxMove).name !== attacker.canGigantamax) {
					throw new Error('This engine only permits the matching signature G-Max move for this set.');
				}
			}
			battle.actions.runMove(move, attacker, attacker.getLocOf(mons[1]), options);
			battle.faintMessages();
			actionOutcomes.push({ before: beforeState, after: publicState(battle, mons), log: battle.log.slice(logStart).slice(0, 100) });
			outcomes.push({ damage, loss: mons.map((mon, i) => before[i] - mon.hp), ko: mons.map(mon => !mon.hp), maxhp });
			if (!sample) {
				exampleLog = battle.log.slice(logStart).slice(0, 100);
			}
		} finally {
			battle.destroy();
		}
	}
	const labels = scenario.format.gameType === 'freeforall' ? ['Attacker', 'Defender', 'Other foe 1', 'Other foe 2'] :
		['Attacker', 'Defender', 'Attacker ally', 'Defender ally'];
	return {
		kind: 'sampled', evaluationMode: scenario.evaluationMode, actionOutcomes, samples: scenario.samples, seed: scenario.seed, format: scenario.format.name,
		move: Dex.moves.get(scenario.move).name, assumptions: incenseBranches ? [...assumptions, 'Luck Incense Scented Geyser: 100 power with 60% probability, 160 power with 40%; each sampled execution rolls once. The displayed sampled range may omit either branch.'] : assumptions, powerDistribution: incenseBranches ? [{ power: 100, probability: 0.6 }, { power: 160, probability: 0.4 }] : undefined, resolved, exampleLog,
		results: outcomes[0].damage.map((_, i) => {
			const damage = outcomes.map(o => o.damage[i]);
			const percent = outcomes.map(o => 100 * o.damage[i] / o.maxhp[i]);
			const loss = outcomes.map(o => o.loss[i]);
			return {
				label: labels[i], min: Math.min(...damage), max: Math.max(...damage),
				minPercent: Math.min(...percent), maxPercent: Math.max(...percent),
				minNetLoss: Math.min(...loss), maxNetLoss: Math.max(...loss),
				kos: outcomes.filter(o => o.ko[i]).length,
			};
		}),
	};
}
