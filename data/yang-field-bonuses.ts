import type {MoveDataTable} from '../sim/dex-moves';
export const YangBonusFields: Record<string, string[]> = {"kaboom":["electric","factory","shortcircuit"],"cactibash":["desert","ashenbeach","forest","grassy"],"corrosivestrike":["corrosive","corrosivemist"],"toxicvial":["corrosive","corrosivemist"],"flutterscales":["forest","flowergarden"],"spiritmend":["shortcircuit","factory","haunted","darkcrystalcavern"],"chistrike":["ashenbeach","holy","bigtop","psychic","rocky"],"gunkrock":["wasteland","murkwatersurface"],"frozenrefractals":["mirrorarena","icy","snowy"],"nomoswish":["grassy","forest","starlightarena"],"queensgambit":["chessboard","psychic"],"darkclasp":["darkcrystalcavern"],"beatdown":["bigtop","rocky"],"infernalrage":["haunted","superheated","burning","volcanic","dragonsden"],"m3g4qu4k3":["glitch"],"winddance":["bigtop","mountain","snowymountain"],"timeblade":["misty","fairytale"],"crestcleave":["desert","fairytale"],"sirensveil":["watersurface","underwater","midnightzone","murkwatersurface","icy"],"sirenswrath":["watersurface","underwater","midnightzone","murkwatersurface","icy"],"rocknroll":["rocky","cave","mountain","crystalcavern","volcanic"],"dragonrend":["dragonsden","mountain","fairytale","volcanic","newworld"],"airstreamassault":["mountain","snowymountain"],"wisteriamaelstrom":["flowergarden"],"deiludicium":["holy"],"nostraswish":["starlightarena","newworld"],"swarmsnare":["forest","flowergarden"]};
export const YangBonusAuras: Record<string, string[]> = {"kaboom":["electricterrain"],"cactibash":["grassyterrain"],"flutterscales":["grassyterrain"],"nomoswish":["grassyterrain"],"chistrike":["psychicterrain"],"queensgambit":["psychicterrain"],"timeblade":["mistyterrain"],"deiludicium":["rainbowterrain"],"frozenrefractals":["frozenaura"],"sirenswrath":["frozenaura"],"infernalrage":["ashenaura"],"spiritmend":["riftaura"]};
export type YangMove = ActiveMove & {
	yang?: {
		field: string, aura: string, startingHP: number, stage: number, full: boolean, eligible: boolean,
		seen: Pokemon[], hits: { target: Pokemon, count: number }[], once: boolean, messages: string[],
	},
	yangPreserveField?: boolean,
};
export function yangField(id: string, field: string) {
 return (YangBonusFields[id] || []).some(name => name === 'flowergarden' ? /^flowergarden[1-5]$/.test(field) : field === name + 'terrain');
}
function message(battle: Battle, move: YangMove, text: string) {
	if (move.yang?.messages.includes(text)) return;
	move.yang?.messages.push(text);
 battle.add('-message', text);
}
function unbind(battle: Battle, source: Pokemon, move: YangMove) {
 if (source.removeVolatile('partiallytrapped')) message(battle, move, move.name + ' broke the binding!');
}
function resetOffense(battle: Battle, source: Pokemon, move: YangMove) {
 const boosts: SparseBoostsTable = {};
 for (const stat of ['atk','spa'] as const) if (source.boosts[stat] < 0) boosts[stat] = -source.boosts[stat];
 if (Object.keys(boosts).length && battle.boost(boosts, source, source, move)) message(battle, move, 'Elias’s judgment restored its conviction!');
}
export function installYangFieldBonuses(moves: MoveDataTable) {
 for (const id of Object.keys(YangBonusFields)) {
  const data = moves[id as keyof MoveDataTable];
  const modify = data.onModifyMove;
  data.onModifyMove = function (active, source, target) {
   const result = modify?.call(this, active, source, target);
   const move = active as YangMove;
   const field = this.field.terrain, aura = this.field.auraField;
   const full = yangField(id, field);
			move.yang = { field,
				aura,
				startingHP: source.hp,
				stage: this.field.flowerGardenStage(),
				full,
				eligible: full || (YangBonusAuras[id] || []).includes(aura),
				seen: [],
				hits: [],
				once: false,
				messages: [] };
   if (!move.yang.eligible) return result;
   switch (id) {
   case 'kaboom': delete move.recoil; break;
   case 'chistrike': move.ignoreNegativeOffensive = true; break;
   case 'gunkrock':
				(move as ActiveMove & { yangSecondaryTargets?: Pokemon[] }).yangSecondaryTargets = [];
    move.secondaries = move.secondaries?.map(s => ({...s, chance: 40}));
    if (move.secondary) move.secondary = {...move.secondary, chance: 40};
    break;
   case 'queensgambit': move.self = {boosts: move.category === 'Physical' ? {def: -1} : {spd: -1}}; break;
   case 'crestcleave': move.drain = [1, 2]; break;
   case 'rocknroll': move.boosts = {def: -2}; break;
   case 'dragonrend': move.ignoreScreens = true; break;
   case 'infernalrage':
				(move as ActiveMove & { yangSecondaryTargets?: Pokemon[] }).yangSecondaryTargets = [];
    move.yangPreserveField = full;
    move.secondaries = [...(move.secondaries || []), {chance: 30, onHit(target, source, effect) {
     const attack = effect as YangMove;
					if (target.isAlly(source) || (target.getMoveHitData(effect).damage || 0) <= 0 || attack.yang?.seen.includes(target)) return;
					attack.yang?.seen.push(target);
     if (target.trySetStatus('brn', source, effect)) message(this, attack, 'Charlotte’s inferno left a searing brand!');
    }}];
    break;
   }
   return result;
  };
  const after = data.onAfterHit;
  data.onAfterHit = function (target, source, active) {
   const move = active as YangMove, state = move.yang;
   const damage = target.getMoveHitData(move).damage || 0;
   const result = after?.call(this, target, source, move);
   if (!state?.eligible || damage <= 0 || target.isAlly(source) || !source.hp || data.category === 'Status') return result;
   if (id === 'cactibash') {
    if (this.heal(damage / 4, source, target, 'drain')) message(this, move, 'Florinia’s roots reclaimed the scattered strength!');
   }
   if (id === 'beatdown') {
				let counter = state.hits.find(entry => entry.target === target);
				if (!counter) { counter = { target, count: 0 }; state.hits.push(counter); }
				const hits = ++counter.count;
    if (hits === 3 && !state.once && this.boost({def: 1}, source, source, move)) message(this, move, 'Samson held firm after the final blow!');
    if (hits === 3) state.once = true;
    return result;
   }
   if (id === 'kaboom') {
    let removed = false;
    for (const screen of ['reflect','lightscreen','auroraveil']) if (target.side.removeSideCondition(screen)) removed = true;
    if (removed) message(this, move, 'Julia’s blast blew the barriers apart!');
   }
   if (state.once) return result;
   state.once = true;
   switch (id) {
   case 'chistrike': if (source.boosts.atk < 0) message(this, move, 'Kiki’s discipline carried the strike beyond weakness!'); if (source.removeVolatile('confusion')) message(this, move, 'Kiki’s focus cleared the confusion!'); break;
   case 'queensgambit': message(this, move, 'Radomus’s queen left only one opening!'); break;
   case 'crestcleave': if (source.hp > state.startingHP) message(this, move, 'Titania’s resolve returned with the blade!'); break;
   case 'dragonrend': if (!target.getMoveHitData(move).crit && ['reflect','lightscreen','auroraveil'].some(id => target.side.getSideCondition(id))) message(this, move, 'Saphira’s strike tore through the protective veil!'); break;
   case 'darkclasp': if (this.heal(source.baseMaxhp / 16, source, source, move)) message(this, move, 'Luna’s shadows drew strength from the cavern!'); break;
   case 'winddance': case 'airstreamassault': case 'sirenswrath': unbind(this, source, move); break;
   case 'wisteriamaelstrom': {
    let healed = false;
    for (const ally of source.alliesAndSelf()) if (ally.hp && ally.hasType(['Grass','Bug'])) {
     if (this.heal(ally.baseMaxhp / (state.stage === 5 ? 8 : 16), ally, source, move)) healed = true;
    }
    if (healed) message(this, move, 'Laura’s wisteria restored the garden’s allies!');
    break;
   }
   case 'deiludicium': resetOffense(this, source, move); if (state.full && this.heal(source.baseMaxhp / 8, source, source, move)) message(this, move, 'Elias’s judgment restored its strength!'); break;
   }
   return result;
  };
 }
 // Replace the random offensive drop only in the approved contexts.
 const flutter = moves.flutterscales.onHit!;
 moves.flutterscales.onHit = function (target, source, active) {
  const move = active as YangMove;
  if (!move.yang?.eligible) return (typeof flutter === 'function' ? flutter : () => undefined).call(this, target, source, move);
		if (target.isAlly(source) || (target.getMoveHitData(move).damage || 0) <= 0 || move.yang.seen.includes(target)) return;
		move.yang.seen.push(target);
  const stat = target.getStat('atk', false, true) > target.getStat('spa', false, true) ? 'atk' : 'spa';
  if (this.boost({[stat]: -1}, target, source, move)) message(this, move, 'Shelly’s scales softened the foe’s strongest blows!');
 };
 const quake = moves.m3g4qu4k3.onHit!;
 moves.m3g4qu4k3.onHit = function (target, source, active) {
  const move = active as YangMove;
  if (!move.yang?.eligible) return (typeof quake === 'function' ? quake : () => undefined).call(this, target, source, move);
		if (target.isAlly(source) || (target.getMoveHitData(move).damage || 0) <= 0 || move.yang.seen.includes(target)) return;
		move.yang.seen.push(target);
  const def = target.getStat('def', false, true) >= target.getStat('spd', false, true);
  if (this.boost({def: def ? -2 : -1, spd: def ? -1 : -2}, target, source, move)) message(this, move, 'Terra’s quake broke through the stronger defense!');
 };
 const vial = moves.toxicvial.onHit;
 moves.toxicvial.onHit = function (target, source, active) {
  const result = (typeof vial === 'function' ? vial : () => undefined).call(this, target, source, active);
  if ((active as YangMove).yang?.eligible && !target.isAlly(source) && this.boost({spe: -1}, target, source, active)) message(this, active as YangMove, 'Corey’s venom weighed down its limbs!');
  return result;
 };
 const rock = moves.rocknroll.onHit!;
 moves.rocknroll.onHit = function (target, source, active) {
  const had = !!target.side.getSideCondition('stealthrock');
  const result = (typeof rock === 'function' ? rock : () => undefined).call(this, target, source, active);
  if ((active as YangMove).yang?.eligible && !had && target.side.getSideCondition('stealthrock') && !target.isAlly(source) && this.boost({spe: -1}, target, source, active)) message(this, active as YangMove, 'Loose stone caught the foe’s footing!');
  return result;
 };
 const veil = moves.sirensveil.onHit!;
 moves.sirensveil.onHit = function (target, source, active) {
  const result = (typeof veil === 'function' ? veil : () => undefined).call(this, target, source, active);
  if ((active as YangMove).yang?.eligible) {
   if (source.addVolatile('aquaring', source, active)) message(this, active as YangMove, 'A sheltering current gathered around Amaria’s song!');
   if (['brn','psn','tox'].includes(source.status) && source.cureStatus()) message(this, active as YangMove, 'Amaria’s waters washed the wounds clean!');
  }
  return result;
 };
 const spiritTry = moves.spiritmend.onTry!;
 moves.spiritmend.onTry = function (source, target, active) {
  if (this.field.isTerrain('holyterrain')) {
   if (!this.field.changeTerrain('hauntedterrain', source, active)) return false;
   active.heal = [66,100];
   (active as YangMove).yang!.eligible = true;
   message(this, active as YangMove, 'Shade’s whisper turned sacred light into restless shadows!');
   // Field conversion itself is useful at full HP; skip the otherwise failing heal.
   if (source.hp === source.maxhp) delete active.heal;
   return;
  }
  return (typeof spiritTry === 'function' ? spiritTry : () => undefined).call(this, source, target, active);
 };
 const spiritModify = moves.spiritmend.onModifyMove!;
 moves.spiritmend.onModifyMove = function (move, source, target) {
  const result = spiritModify.call(this, move, source, target);
  if (this.field.isTerrain('hauntedterrain')) move.heal = [66,100];
  return result;
 };
 const spiritHit = moves.spiritmend.onHit!;
 moves.spiritmend.onHit = function (target, source, active) {
  const result = (typeof spiritHit === 'function' ? spiritHit : () => undefined).call(this, target, source, active);
  if ((active as YangMove).yang?.eligible && active.heal && ['brn','par'].includes(source.status) && source.cureStatus()) message(this, active as YangMove, 'Restless spirits mended the wounds!');
  return result;
 };
}
export function yangMessage(battle: Battle, move: ActiveMove, text: string) { message(battle, move as YangMove, text); }
