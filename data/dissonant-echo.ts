import type {AbilityData, AbilityDataTable} from '../sim/dex-abilities';
export const DissonantEchoDescriptions = {
 dissonantecho: {shortDesc: 'Sound attacks: 1.2x power. Allied resisted sound hits mark a foe for shared resistance bypass.', desc: 'The holder\'s damaging sound moves have 1.2x power. Its or an adjacent ally\'s resisted sound attack dealing opposing HP damage can mark one foe for its side through the next turn. The next damaging sound attempt by the holder or an adjacent ally against that foe consumes the mark and ignores resistance, not immunity. Marks can be earned again, but not by the consuming attack. One shared mark per side; duplicate holders do not stack it. Provider suppression or departure, target departure and expiry clear the mark. Substitute-only hits and Soundproof do not qualify.'},
 stormcalling: {shortDesc: 'Drizzle + Liquid Voice + shared Dissonant Echo marks; sound power is 1.2x once.', desc: 'Drizzle summons rain. Liquid Voice changes sound moves to Water, or Ice on Icy Field, with 1.2x power. Dissonant Echo adds repeatable shared marks after the holder or an adjacent ally deals resisted sound HP damage to a foe. The next allied sound attempt against that foe through next turn consumes the mark and ignores resistance, not immunity. One mark per side; no same-attack rearming. Provider suppression/departure or target departure clears it. The two sound power components share a single 1.2x boost, not 1.44x.'},
};
export function installDissonantEcho(abilities: AbilityDataTable) {
 const key = 'dissonantechomark';
 const shared: Partial<AbilityData> = {
  onAnyTryMove(source, target, move) {
   const provider = this.effectState.target as Pokemon;
   if (source.side !== provider.side || (source !== provider && !source.isAdjacent(provider))) return;
   const state = provider.side.sideConditions[key];
   if (!state) return;
   if (!state.source?.hp || !state.source.isActive || !state.source.hasAbility('dissonantecho') ||
    !state.marked?.hp || !state.marked.isActive || this.turn > state.expires) {
    provider.side.removeSideCondition(key); return;
   }
   if (state.source !== provider || !move.flags.sound || move.category === 'Status') return;
   const spread = ['allAdjacent', 'allAdjacentFoes', 'all'].includes(move.target);
   if (target !== state.marked && !(spread && source.isAdjacent(state.marked))) return;
   (move as any).dissonantEchoTarget = state.marked;
   (move as any).dissonantEchoProvider = provider;
   provider.side.removeSideCondition(key);
  },
  onAnyDamagingHit(damage, target, source, move) {
   const provider = this.effectState.target as Pokemon;
   if (source.side !== provider.side || (source !== provider && !source.isAdjacent(provider)) ||
    (move as any).dissonantEchoProvider || provider.side.sideConditions[key] || damage <= 0 ||
    target.isAlly(source) || !move.flags.sound || move.category === 'Status' || target.getMoveHitData(move).typeMod >= 0) return;
   const pending = (move as any).dissonantEchoPending ||= {};
   const row = pending[provider.side.id] ||= {provider, targets: []};
   if (!row.targets.includes(target)) row.targets.push(target);
  },
  onAnyAfterMove(source, target, move) {
   const provider = this.effectState.target as Pokemon;
   const row = (move as any).dissonantEchoPending?.[provider.side.id];
   if (!row || row.provider !== provider) return;
   delete (move as any).dissonantEchoPending[provider.side.id];
   if (!provider.hp || !provider.isActive || provider.side.sideConditions[key]) return;
   const targets = row.targets as Pokemon[];
   const marked = targets.includes(target) ? target : targets.sort((a,b)=>a.side.n-b.side.n || a.position-b.position)[0];
   if (!marked?.hp || !marked.isActive) return;
   provider.side.addSideCondition(key, provider, this.effect);
   const state = provider.side.getSideConditionData(key)!;
   state.marked = marked; state.expires = this.turn + 1;
   this.add('-activate', provider, 'ability: Dissonant Echo', '[of] ' + marked);
  },
  onAnySwitchOut(pokemon) {
   const provider = this.effectState.target as Pokemon, state = provider.side.sideConditions[key];
   if (state && (state.source === pokemon || state.marked === pokemon)) provider.side.removeSideCondition(key);
  },
  onEnd(pokemon) {
   if (pokemon.side.sideConditions[key]?.source === pokemon) pokemon.side.removeSideCondition(key);
  },
 };
 abilities.dissonantecho = {name:'Dissonant Echo',num:11204,rating:3.5,flags:{},...shared,
  onBasePower(basePower, source, target, move) {
   if (move.category !== 'Status' && move.flags.sound) return this.chainModify(1.2);
  },
 };
 for (const hook of ['onTryMove','onSourceDamagingHit','onAfterMove','onAnySwitchOut','onResidual']) delete (abilities.stormcalling as any)[hook];
 Object.assign(abilities.stormcalling, shared);
}
