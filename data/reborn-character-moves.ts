import type {MoveData} from '../sim/dex-moves';
import type {EffectState} from '../sim/pokemon';
import {gildedType} from './rejuvenation-advanced-moves';
import {adaptiveFieldMultiplier} from '../sim/adaptive-cycle';

type CharacterMove = ActiveMove & {characterMessage?: boolean, characterSupport?: boolean, characterKO?: boolean, characterTargets?: Pokemon[]};
type Profile = {credit: string, users: string[], fields: string[], fieldEffect: string, message: string, short: string, details: string};
export const CharacterMoveProfiles: {[id: string]: Profile} = {
	heavenfall: {credit: 'Lin', users: ['hydreigon', 'gardevoir', 'mismagius', 'honchkrow'], fields: ['newworldterrain'], fieldEffect: '2× power, perfect accuracy, and only a one-stage Sp. Atk drop. The field’s usual Dark boost also applies.', message: 'The false heavens came crashing down!', short: '130 power; lowers the user’s Sp. Atk by 2.', details: 'A Dark special attack with 90% accuracy. A successful hit lowers the user’s Special Attack by two stages.'},
	blacktestament: {credit: 'Sirius', users: ['seviper', 'chandelure', 'honchkrow'], fields: ['wastelandterrain', 'corrosiveterrain'], fieldEffect: 'Healing prevention lasts 3 turns instead of 2.', message: 'Sirius left no promise of mercy!', short: 'User-type; adaptive; prevents healing for 2 turns.', details: 'Uses Gilded Helix’s type rule: the second current type, unless it is Fairy or Dark, then the first. Uses the higher staged attacking stat, Special on ties. HP damage prevents the target from healing for 2 turns.'},
	unboundrefrain: {credit: 'Taka', users: ['chatot'], fields: ['mountainterrain', 'snowymountainterrain'], fieldEffect: 'Power is 1.2×.', message: 'Taka’s song found a way out!', short: 'Sound attack; user switches out after hitting.', details: 'A Flying sound attack. After a successful hit, the user switches out.'},
	vanishingact: {credit: 'Ace', users: ['delphox', 'zoroark'], fields: ['mirrorarenaterrain', 'bigtopterrain'], fieldEffect: 'Power is 1.2×.', message: 'Ace vanished behind the final curtain!', short: 'Hits, breaks the user’s trapping effects, then switches out.', details: 'After dealing damage, removes the user’s binding and trapping conditions, then switches out. Does not remove Ingrain or other beneficial effects.'},
	nullpulse: {credit: 'Zero', users: ['umbreon', 'honchkrow'], fields: ['darkcrystalcavernterrain', 'rifteclipseterrain'], fieldEffect: 'Power is 1.2×.', message: 'Zero turned that power against its owner!', short: 'Uses the target’s Sp. Atk and its stages to attack.', details: 'A Dark pulse attack using the target’s Special Attack and stages instead of the user’s Special Attack, with ordinary Foul Play-style damage rules.'},
	logicpulse: {credit: 'Eve', users: ['espeon', 'alakazam', 'magnezone'], fields: ['factoryterrain', 'glitchterrain'], fieldEffect: 'Power is 1.2×.', message: 'Eve found the flaw in the defense!', short: 'Ignores the target’s positive defensive stages.', details: 'A Psychic pulse attack that ignores the target’s positive defensive stat stages.'},
	solacepulse: {credit: 'Lumi', users: ['glaceon'], fields: ['snowyterrain', 'icyterrain', 'snowymountainterrain'], fieldEffect: 'Healing increases from 1/8 to 1/6 maximum HP.', message: 'Lumi’s light offered a moment of comfort!', short: 'Hit heals the active ally with least % HP, or self, by 1/8.', details: 'After damaging a foe, heals the user or an adjacent active ally with the lowest HP percentage by 1/8 maximum HP. Heals one Pokemon once per use; the user wins ties.'},
	shockdoctrine: {credit: 'Sigmund', users: ['electivire', 'raichu', 'rotom', 'rotomheat', 'rotomwash', 'rotomfrost', 'rotomfan', 'rotommow'], fields: ['electricterrain', 'shortcircuitterrain'], fieldEffect: 'Torment lasts 3 turns instead of 2.', message: 'Sigmund imposed a punishing regimen!', short: 'Adaptive; HP damage Torments the target for 2 turns.', details: 'Uses the higher staged attacking stat, Special on ties. After damaging opposing HP, applies Torment for 2 turns.'},
	coldshoulder: {credit: 'Blake', users: ['sandslashalola', 'weavile', 'walrein'], fields: ['icyterrain', 'snowymountainterrain'], fieldEffect: 'Ignores positive Defense stages.', message: 'Blake struck where it already hurt!', short: 'Adaptive; 120 power if the target already took attack damage this turn.', details: 'Uses the higher staged attacking stat, Special on ties. Power rises from 85 to 120 if the target already took attack damage from any Pokemon this turn. Earlier hits of this use do not qualify.'},
	solarpledge: {credit: 'Aster', users: ['solrock', 'golurk', 'passimian', 'lycanrocmidnight', 'lycanrocdusk'], fields: ['rockyterrain', 'starlightarenaterrain'], fieldEffect: 'Stored attack bonus rises from 1.25× to 1.3×.', message: 'Aster pledged to see this through!', short: 'Adaptive; readies a 1.25× boost for the next attack.', details: 'After damaging a foe, stores one 1.25× power boost for the next damaging move, covering every hit and target. Uses the higher staged attacking stat, Special on ties. The charge is spent on an attack attempt, survives status moves, and clears on switching.'},
	lunarpledge: {credit: 'Eclipse', users: ['lunatone', 'oranguru', 'lycanroc', 'lycanrocdusk'], fields: ['rockyterrain', 'starlightarenaterrain'], fieldEffect: 'Stored protection rises from 25% to 30%.', message: 'Eclipse made a promise to protect!', short: 'Adaptive; next opposing attack deals 25% less damage.', details: 'After damaging a foe, stores protection against the next opposing damaging move, reducing all of its hits by 25%. Uses the higher staged attacking stat, Special on ties. One shield at a time; switching clears it.'},
	ancestralwrath: {credit: 'Solaris', users: ['garchomp', 'tyranitar', 'scizor'], fields: ['dragonsdenterrain', 'superheatedterrain'], fieldEffect: 'Power is 1.2×.', message: 'Solaris fought for a world that was lost!', short: '120 power while your team has fewer surviving Pokemon.', details: 'Power rises from 90 to 120 when the user’s team has fewer surviving Pokemon than the target’s team.'},
	steadfaststrike: {credit: 'Victoria', users: ['incineroar', 'gallade', 'lucario'], fields: ['ashenbeachterrain', 'holyterrain'], fieldEffect: 'Power is 1.2×.', message: 'Victoria stood firm for those beside her!', short: '120 power if a foe hurt the user or an active ally this turn.', details: 'Power rises from 80 to 120 if an opponent already dealt attack damage to the user or an active ally this turn. Earlier hits of this use do not qualify.'},
	rebelanthem: {credit: 'Cain', users: ['nidoking', 'primarina', 'mukalola'], fields: ['rainbowterrain', 'bigtopterrain'], fieldEffect: 'Also clears confusion from the user and active allies.', message: 'Cain’s anthem refused to be silenced!', short: 'Adaptive sound; clears allied Attract, Taunt and Torment after hitting.', details: 'Uses the higher staged attacking stat, Special on ties. After damaging a foe, removes Attract, Taunt and Torment from the user and its active allies, once per use.'},
	laurellash: {credit: 'Fern', users: ['decidueye', 'roserade', 'krookodile'], fields: ['grassyterrain', 'forestterrain'], fieldEffect: 'Power is 1.2×.', message: 'Fern claimed another victory for himself!', short: 'Adaptive; a KO raises the user’s stronger attacking stat by 1.', details: 'Uses the higher staged attacking stat, Special on ties. A direct KO raises the user’s higher staged attacking stat by one, Special Attack on ties, once per use.'},
};

const adaptive = ['blacktestament', 'shockdoctrine', 'coldshoulder', 'solarpledge', 'lunarpledge', 'rebelanthem', 'laurellash'];
const powerFields = ['unboundrefrain', 'vanishingact', 'nullpulse', 'logicpulse', 'ancestralwrath', 'steadfaststrike', 'laurellash'];
function boostedField(battle: Battle, move: ActiveMove) { return battle.field.isTerrain(CharacterMoveProfiles[move.id]?.fields || []); }
function timedCondition(battle: Battle, target: Pokemon, source: Pokemon, move: ActiveMove, id: string, turns: number) {
	// Preserve an existing condition instead of shortening it or restarting its timer.
	if (target.volatiles[id] || !target.hp) return;
	if (target.addVolatile(id, source, move)) {
		const state = target.volatiles[id] as EffectState | undefined;
		if (state) state.duration = turns;
	}
}
function afterDamage(battle: Battle, target: Pokemon, source: Pokemon, move: CharacterMove, substitute = false) {
	if (source.isAlly(target)) return;
	const active = (battle.activeMove || move) as CharacterMove;
	if (!substitute && !target.hp) active.characterKO = true;
	if (!active.characterMessage) {
		active.characterMessage = true;
		battle.add('-message', CharacterMoveProfiles[move.id].message);
		if (boostedField(battle, move)) battle.add('-message', `${battle.field.getTerrain().name} empowered ${move.name}!`);
	}
	if (!substitute && !(active.characterTargets ||= []).includes(target)) {
		active.characterTargets.push(target);
		if (move.id === 'blacktestament') timedCondition(battle, target, source, move, 'healblock', boostedField(battle, move) ? 3 : 2);
		if (move.id === 'shockdoctrine') timedCondition(battle, target, source, move, 'torment', boostedField(battle, move) ? 3 : 2);
	}
	if (!source.hp || active.characterSupport) return;
	active.characterSupport = true;
	if (move.id === 'vanishingact') {
		for (const id of ['partiallytrapped', 'trapped', 'octolock', 'jawlock', 'thousandwaves', 'apexflytraptrapped']) source.removeVolatile(id);
	}
	if (move.id === 'solacepulse') {
		const candidates = [source, ...source.adjacentAllies()].filter(p => p.hp && !p.fainted);
		candidates.sort((a, b) => a.hp / a.maxhp - b.hp / b.maxhp);
		const patient = candidates[0];
		if (patient) battle.heal(patient.baseMaxhp / (boostedField(battle, move) ? 6 : 8), patient, source, move);
	}
	if (move.id === 'rebelanthem') {
		for (const ally of source.alliesAndSelf()) {
			if (!ally.hp) continue;
			for (const id of ['attract', 'taunt', 'torment', ...(boostedField(battle, move) ? ['confusion'] : [])]) ally.removeVolatile(id);
		}
	}
}

export const CharacterMoves: {[id: string]: MoveData} = {};
const specs: [string, string, string, number][] = [
	['blacktestament', 'Black Testament', 'Normal', 85], ['unboundrefrain', 'Unbound Refrain', 'Flying', 70],
	['vanishingact', 'Vanishing Act', 'Psychic', 75], ['nullpulse', 'Null Pulse', 'Dark', 80],
	['logicpulse', 'Logic Pulse', 'Psychic', 85], ['solacepulse', 'Solace Pulse', 'Ice', 75],
	['shockdoctrine', 'Shock Doctrine', 'Electric', 80], ['coldshoulder', 'Cold Shoulder', 'Ice', 85],
	['solarpledge', 'Solar Pledge', 'Rock', 80], ['lunarpledge', 'Lunar Pledge', 'Rock', 80],
	['ancestralwrath', 'Ancestral Wrath', 'Dragon', 90], ['steadfaststrike', 'Steadfast Strike', 'Fighting', 80],
	['rebelanthem', 'Rebel Anthem', 'Poison', 80], ['laurellash', 'Laurel Lash', 'Grass', 85],
	['heavenfall', 'Heavenfall', 'Dark', 130],
];
for (const [index, [id, name, type, basePower]] of specs.entries()) {
	CharacterMoves[id] = {
		num: 12001 + index, name, type, category: ['ancestralwrath', 'steadfaststrike'].includes(id) ? 'Physical' : 'Special',
		basePower, accuracy: 100, pp: 10, priority: 0, target: 'normal', flags: {protect: 1, mirror: 1},
		zMove: {basePower: basePower >= 130 ? 195 : basePower >= 90 ? 175 : basePower >= 80 ? 160 : 140},
		onModifyMove(move, source, target) {
			if (adaptive.includes(move.id)) move.category = source.getStat('atk', false, true) > source.getStat('spa', false, true) ? 'Physical' : 'Special';
			if (move.id === 'coldshoulder') {
				if (target?.attackedBy.some(a => a.thisTurn && a.damage && a.source !== target)) move.basePower = 120;
				if (boostedField(this, move) && move.category === 'Physical') move.ignorePositiveDefensive = true;
			}
			if (move.id === 'steadfaststrike' && source.alliesAndSelf().some(p => p.attackedBy.some(a => a.thisTurn && a.damage && !source.isAlly(a.source)))) move.basePower = 120;
			if (move.id === 'ancestralwrath' && target && source.side.pokemon.filter(p => !p.fainted && p.hp).length < target.side.pokemon.filter(p => !p.fainted && p.hp).length) move.basePower = 120;
		},
		onBasePower(power, source, target, move) {
			if (powerFields.includes(move.id) && boostedField(this, move)) return this.chainModify(adaptiveFieldMultiplier(this, source, target, 1.2));
		},
		onHit(target, source, move) { if ((target.getMoveHitData(move).damage || 0) > 0) afterDamage(this, target, source, move); },
		onAfterSubDamage(damage, target, source, move) { if (damage > 0) afterDamage(this, target, source, move, true); },
	};
}
CharacterMoves.blacktestament.onModifyType = gildedType;
Object.assign(CharacterMoves.heavenfall, {
	accuracy: 90, pp: 5, self: {boosts: {spa: -2}},
	onModifyMove(this: Battle, move: ActiveMove) {
		if (this.field.isTerrain('newworldterrain')) {
			move.accuracy = true;
			move.self = {boosts: {spa: -1}};
		}
	},
});
for (const id of ['unboundrefrain', 'rebelanthem']) Object.assign(CharacterMoves[id].flags, {sound: 1, bypasssub: 1});
for (const id of ['unboundrefrain', 'vanishingact']) CharacterMoves[id].selfSwitch = true;
for (const id of ['nullpulse', 'logicpulse', 'solacepulse']) CharacterMoves[id].flags.pulse = 1;
CharacterMoves.nullpulse.overrideOffensivePokemon = 'target';
CharacterMoves.logicpulse.ignorePositiveDefensive = true;
CharacterMoves.laurellash.onAfterMoveSecondarySelf = function (source, target, move) {
	if (source.hp && (this.activeMove as CharacterMove)?.characterKO) {
		this.boost({[source.getStat('atk', false, true) > source.getStat('spa', false, true) ? 'atk' : 'spa']: 1}, source, source, move);
	}
};

for (const id of ['solarpledge', 'lunarpledge']) {
	CharacterMoves[id].onAfterMoveSecondarySelf = function (source, target, move: CharacterMove) {
		if (!source.hp || !(this.activeMove as CharacterMove)?.characterSupport) return;
		if (!source.volatiles[move.id]) source.addVolatile(move.id, source, move);
		const state = source.volatiles[move.id];
		if (state) { state.armedMove = move; state.factor = move.id === 'solarpledge' ? (boostedField(this, move) ? 1.3 : 1.25) : (boostedField(this, move) ? 0.7 : 0.75); }
	};
}
CharacterMoves.solarpledge.condition = {
	noCopy: true,
	onStart(pokemon) { this.add('-start', pokemon, 'move: Solar Pledge'); },
	onModifyMove(move) { if (move.category !== 'Status') this.effectState.boostedMove = move; },
	onBasePowerPriority: 9,
	onBasePower(power, source, target, move) { if (this.effectState.boostedMove === move) return this.chainModify(this.effectState.factor || 1.25); },
	onAfterMove(pokemon, target, move) { if (this.effectState.boostedMove === move && this.effectState.armedMove !== move) pokemon.removeVolatile('solarpledge'); },
	onMoveAborted(pokemon, target, move) { if (move.category !== 'Status') pokemon.removeVolatile('solarpledge'); },
	onEnd(pokemon) { this.add('-end', pokemon, 'move: Solar Pledge'); },
};
CharacterMoves.lunarpledge.condition = {
	noCopy: true,
	onStart(pokemon) { this.add('-start', pokemon, 'move: Lunar Pledge'); },
	onSourceModifyDamage(damage, source, target, move) {
		if (source.isAlly(target) || move.category === 'Status') return;
		if (this.effectState.guardedMove && this.effectState.guardedMove !== move) return;
		this.effectState.guardedMove = move;
		this.effectState.guardedSource = source;
		return this.chainModify(this.effectState.factor || 0.75);
	},
	onAnyAfterAttackResolved(source, target, move) {
		if (this.effectState.guardedMove === move && this.effectState.guardedSource === source) this.effectState.target.removeVolatile('lunarpledge');
	},
	onEnd(pokemon) { this.add('-end', pokemon, 'move: Lunar Pledge'); },
};
export const CharacterMoveDescriptions: {[id: string]: {shortDesc: string, desc: string}} = {};
const fieldNames: {[id: string]: string} = {
	newworldterrain: 'New World',
	wastelandterrain: 'Wasteland', corrosiveterrain: 'Corrosive', mountainterrain: 'Mountain',
	snowymountainterrain: 'Snowy Mountain', mirrorarenaterrain: 'Mirror Arena', bigtopterrain: 'Big Top',
	darkcrystalcavernterrain: 'Dark Crystal Cavern', rifteclipseterrain: 'Rift Eclipse', factoryterrain: 'Factory',
	glitchterrain: 'Glitch', snowyterrain: 'Snowy', icyterrain: 'Icy', electricterrain: 'Electric',
	shortcircuitterrain: 'Short-Circuit', rockyterrain: 'Rocky', starlightarenaterrain: 'Starlight Arena',
	dragonsdenterrain: "Dragon's Den", superheatedterrain: 'Superheated', ashenbeachterrain: 'Ashen Beach',
	holyterrain: 'Holy', rainbowterrain: 'Rainbow', grassyterrain: 'Grassy', forestterrain: 'Forest',
};
for (const [id, profile] of Object.entries(CharacterMoveProfiles)) {
	CharacterMoveDescriptions[id] = {shortDesc: `${profile.credit}'s move. ${profile.short}`, desc: `${profile.credit}'s move. ${profile.details} ${profile.fields.map(f => fieldNames[f]).join(' / ')}: ${profile.fieldEffect}`};
}
