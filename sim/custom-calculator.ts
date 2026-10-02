/** Isolated, bounded single-action scenarios using the real battle engine. */
import { Battle } from './battle';
import { Dex } from './dex';
import { Auras } from '../data/auras';
import { Terrains } from '../data/terrains';
import { AbilityComponents } from '../data/ability-components';

const STATS = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'] as const;
const BOOSTS = ['atk', 'def', 'spa', 'spd', 'spe', 'accuracy', 'evasion'] as const;
const ASSUMPTIONS = [
	'Sampled single-action outcomes, not guaranteed min/max damage or exact KO probabilities. Misses, critical hits and random redirects are included.',
	'Fresh battle entry effects run first. Requested HP and stages then replace entry HP/stages. Selected statuses are applied through the engine.',
	'No previous turns, hits, faints, consumed items, stored moves, copied abilities or field history. History-dependent abilities use fresh-entry state; this does not model a mid-battle snapshot.',
	'Only the selected attacker acts. No opponent move, speed-order contest, end-of-turn residuals, delayed-hit resolution or subsequent-turn KO prediction.',
	'Damage is actual HP removed during the action, capped by available HP, and includes immediate triggered damage. Net HP loss can differ because of healing.',
];

export interface CalcActor {
	set: PokemonSet;
	hpPercent: number;
	boosts: SparseBoostsTable;
	status: string;
	gimmick: string;
}
export interface CalcScenario {
	format: Format;
	field: string;
	actors: CalcActor[];
	move: string;
	weather: string;
	aura: string;
	screens: string[];
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
	keys(data, ['species', 'ability', 'item', 'nature', 'level', 'evs', 'ivs', 'boosts', 'hpPercent', 'status', 'gimmick', 'teraType', 'gender', 'moves']);
	const species = Dex.species.get(name(data.species));
	if (!species.exists) throw new Error('Unknown species or form.');
	const ability = Dex.abilities.get(name(data.ability) || species.abilities['0']);
	if (!ability.exists) throw new Error('Unknown ability.');
	const itemName = name(data.item);
	const item = Dex.items.get(itemName);
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
		set, boosts, hpPercent: integer(data.hpPercent, 100, 1, 100),
		status: choice(data.status, '', ['', 'brn', 'par', 'psn', 'tox', 'slp', 'frz']),
		gimmick: choice(data.gimmick, '', ['', 'mega', 'tera', 'gmax']),
	};
}

export function calculatorFormats() {
	return Dex.formats.all().filter(format => format.mod === 'gen9' &&
		['singles', 'doubles', 'freeforall'].includes(format.gameType) &&
		(format.terrain || ['gen9nofieldsinglesgame', 'gen9nofielddoublesbattle'].includes(format.id)) &&
		format.terrain !== 'randomterrain' && (format.gameType !== 'freeforall' || format.playerCount === 4));
}
export function calculatorMetadata() {
	return {
		formats: calculatorFormats().map(f => ({ id: f.id, name: f.name, mode: f.gameType, field: f.terrain || '' })),
		fields: [{id: '', name: 'No field'}, ...Object.entries(Terrains).map(([id, field]) => ({id, name: field.name || id}))],
		species: Dex.species.all().filter(s => s.exists && !s.isCosmeticForme).map(s => ({name: s.name, abilities: s.abilities})),
		abilityComponents: Object.fromEntries(Object.entries(AbilityComponents).map(([id, parts]) => [id, parts.map(p => Dex.abilities.get(p).name)])),
		auras: Object.values(Auras).map(a => ({ id: a.id, name: a.name })),
		assumptions: ASSUMPTIONS,
	};
}
export function validateScenario(input: unknown): CalcScenario {
	const data = record(input);
	keys(data, ['format', 'field', 'actors', 'move', 'weather', 'aura', 'screens', 'attackMode', 'samples', 'seed']);
	const format = calculatorFormats().find(f => f.id === data.format);
	if (!format) throw new Error('Unsupported calculator format. Select one from this server.');
	const move = Dex.moves.get(name(data.move));
	if (!move.exists) throw new Error('Unknown move.');
	if (!Array.isArray(data.actors) || data.actors.length !== 4) throw new Error('Provide four scenario slots.');
	const screens = data.screens ?? [];
	if (!Array.isArray(screens) || screens.length > 3 || screens.some(s => !['reflect', 'lightscreen', 'auroraveil'].includes(s))) {
		throw new Error('Unsupported screens.');
	}
	const aura = name(data.aura);
	if (aura && !Object.prototype.hasOwnProperty.call(Auras, aura)) throw new Error('Unknown aura.');
	return {
		format, field: choice(data.field, format.terrain || '', ['', ...Object.keys(Terrains)]), actors: data.actors.map((a, i) => actor(a, i ? '' : move.name)), move: move.id,
		weather: choice(data.weather, '', ['', 'raindance', 'sunnyday', 'sandstorm', 'hail']),
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
	try {
		const [a, d, extraA, extraD] = scenario.actors.map(spec => ({ ...spec, set: JSON.parse(JSON.stringify(spec.set)) as PokemonSet }));
		battle.setPlayer('p1', { name: 'Attacker', team: [a.set, ...(scenario.format.gameType === 'doubles' ? [extraA.set] : [])] });
		battle.setPlayer('p2', { name: 'Defender', team: [d.set, ...(scenario.format.gameType === 'doubles' ? [extraD.set] : [])] });
		if (scenario.format.gameType === 'freeforall') {
			battle.setPlayer('p3', { name: 'Other foe 1', team: [extraA.set] });
			battle.setPlayer('p4', { name: 'Other foe 2', team: [extraD.set] });
		}
		if (battle.requestState === 'teampreview') battle.makeChoices(...battle.sides.map(() => 'team'));
		const mons = [battle.p1.active[0], battle.p2.active[0]];
		if (scenario.format.gameType === 'doubles') mons.push(battle.p1.active[1], battle.p2.active[1]);
		if (scenario.format.gameType === 'freeforall') mons.push(battle.sides[2].active[0], battle.sides[3].active[0]);
		if (scenario.weather && battle.field.weather !== scenario.weather && !battle.field.setWeather(scenario.weather)) {
			throw new Error('The scenario field or abilities prevented the requested weather.');
		}
		if (scenario.aura && !battle.field.setAura(scenario.aura, 5)) {
			throw new Error('This base field cannot support the selected aura. Auras do not replace full fields.');
		}
		for (const [i, mon] of mons.entries()) {
			const spec = scenario.actors[i];
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
			Object.assign(mon.boosts, spec.boosts);
			if (spec.status && mon.status !== spec.status && !mon.setStatus(spec.status)) {
				throw new Error(`${mon.species.name} cannot receive the selected status in this position.`);
			}
			mon.updateSpeed();
		}
		for (const screen of scenario.screens) battle.p2.addSideCondition(screen, mons[1]);
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
	for (let sample = 0; sample < scenario.samples; sample++) {
		const { battle, mons } = buildCalculatorBattle(scenario, sample);
		try {
			const before = mons.map(mon => mon.hp);
			const maxhp = mons.map(mon => mon.maxhp);
			if (!sample) {
				resolved = {
					field: battle.field.terrain, aura: battle.field.auraField, weather: battle.field.weather,
					actors: mons.map(mon => ({
						species: mon.species.name, ability: mon.getAbility().name, item: mon.getItem().name,
						tera: mon.terastallized || '', hp: mon.hp, maxhp: mon.maxhp,
						status: mon.status, boosts: { ...mon.boosts },
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
		kind: 'sampled', samples: scenario.samples, seed: scenario.seed, format: scenario.format.name,
		move: Dex.moves.get(scenario.move).name, assumptions: ASSUMPTIONS, resolved, exampleLog,
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
