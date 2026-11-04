import type {AbilityDataTable} from '../sim/dex-abilities';

function isBeastFangAttack(move: ActiveMove) {
 return move.category === 'Physical' && (move.flags.bite || move.flags.slicing);
}

export function installFireEmblemSignatures(abilities: AbilityDataTable) {
 abilities.beastfang = {
  name: 'Beast Fang', num: 12192, rating: 4, flags: {},
  shortDesc: 'Physical bites and slices target Sp. Def; 1.3x damage to Dragons.',
  desc: 'Physical biting and slicing moves use the target’s Sp. Def and deal 1.3x damage to Dragon types.',
  onModifyMove(move) {
   if (isBeastFangAttack(move)) move.overrideDefensiveStat = 'spd';
  },
  onModifyDamage(damage, source, target, move) {
   if (!isBeastFangAttack(move) || !target.hasType('Dragon')) return;
   if (source.m.beastFangAnnouncedEntry !== source.m.ultraRivalryEntryToken && this.activeMove?.id === move.id && this.activePokemon === source) {
    source.m.beastFangAnnouncedEntry = source.m.ultraRivalryEntryToken;
    this.add('-message', source.name + "'s horn gleamed with the Crest of the Beast!");
   }
   return this.chainModify([5325, 4096]);
  },
 };
 abilities.apocalypticflame = {
  flags: {},
  name: 'Apocalyptic Flame', num: 11454, rating: 3.5,
  onModifyDamage(damage, source, target, move) {
   if (this.movehasType(move, 'Steel') && target.hasType(['Flying', 'Dragon'])) return this.chainModify([5325, 4096]);
  },
  onSourceDamagingHit(damage, target, source, move) {
   if (!damage || !target.hp || target.isAlly(source) || move.category === 'Status' ||
    !['normal', 'any', 'adjacentFoe', 'randomNormal'].includes(move.target)) return;
   const state = target.volatiles['apocalypticflame'];
   if (state?.markingMove === move) return;
   if (!state && !target.addVolatile('apocalypticflame', source, this.effect)) return;
   const mark = target.volatiles['apocalypticflame'];
   mark.markingMove = move;
   mark.duration = 2;
   if (move.id === 'gigatonhammer') {
    this.add('-message', source.name + "'s Gigaton Hammer erupted with Apocalyptic Flame!");
    const drop = target.getStat('atk') >= target.getStat('spa') ? {atk: -1} : {spa: -1};
    this.boost(drop, target, source, this.effect);
   }
  },
  condition: {
   duration: 2, noCopy: true,
   onStart(target) { this.add('-start', target, 'Apocalyptic Flame'); },
   onModifyDamage(damage, source, target, move) {
    if (move.category !== 'Physical' || !['normal', 'any', 'adjacentFoe', 'randomNormal'].includes(move.target)) return;
    source.removeVolatile('apocalypticflame');
    return this.chainModify(0.75);
   },
   onEnd(target) { this.add('-end', target, 'Apocalyptic Flame'); },
  },
 };
 abilities.rupturedheaven = {
  ...abilities.sharpness,
  name: 'Ruptured Heaven', num: 11455, rating: 4,
  onModifyMove(move) { if (move.flags.slicing) delete move.flags.contact; },
 };
 abilities.burningquake = {
  ...abilities.superluck,
  name: 'Burning Quake', num: 11456, rating: 3.5,
  onModifyDamage(damage, source, target, move) {
   if (move.category === 'Physical' && target.hasType('Dragon')) return this.chainModify([5325, 4096]);
  },
  onSourceDamagingHit(damage, target, source, move) {
   if (damage > 0 && !target.isAlly(source) && target.getMoveHitData(move).crit && source.m.burningQuakeTurn !== this.turn) {
    this.effectState.criticalMove = move;
   }
  },
  onAfterMove(source, target, move) {
   if (this.effectState.criticalMove !== move) return;
   delete this.effectState.criticalMove;
   if (!source.hp || source.m.burningQuakeTurn === this.turn) return;
   source.m.burningQuakeTurn = this.turn;
   this.boost({spe: 1}, source, source, this.effect);
  },
 };
}
