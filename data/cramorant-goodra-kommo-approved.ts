import type {AbilityDataTable} from '../sim/dex-abilities';
export const CramorantGoodraKommoDescriptions = {
 bottomlessgullet: {name: 'Bottomless Gullet', shortDesc: 'Full Gluttony + Cheek Pouch.', desc: 'Full Gluttony and Cheek Pouch: qualifying pinch Berries activate at half HP, and eating a Berry heals 1/3 maximum HP under normal healing rules. Does not load a Gulp Missile projectile.'},
 divefisher: {name: 'Dive Fisher', shortDesc: 'Full Water Veil; ordinary Dive is one-turn Special.', desc: "Full local Water Veil: prevents/cures burns, grants Aqua Ring on entry, prevents hail/sandstorm damage, and cures status on Water Surface or Underwater at turn end. Ordinary Dive executes in one turn as Special using Sp. Atk against Sp. Def, with normal power, flags, accuracy and Gulp Missile loading."},
 scatterbrain: {name: 'Scatterbrain', shortDesc: 'Full Oblivious + Unaware.', desc: "Full local Oblivious and Unaware: prevents infatuation, Taunt and Intimidate drops, clears infatuation/Taunt, breaks opposing Illusion on entry, and ignores relevant opposing stat stages in damage/accuracy calculations. No Own Tempo, Encore or Disable immunity."},
 scalerhythm: {name: 'Scale Rhythm', shortDesc: '+1 Defense once after a damaging sound move deals opposing HP damage.', desc: 'After a damaging sound move deals opposing HP damage, the living active user gains 1 Defense stage once after the entire move, including spread or multiple hits. This occurs after the ordinary Clanging Scales Defense drop. No boost for misses, protection, immunity or Substitute-only damage; normal stat-change rules apply.'},
};
export function installCramorantGoodraKommo(abilities: AbilityDataTable) {
 abilities.bottomlessgullet = {...abilities.gluttony, ...abilities.cheekpouch, name: 'Bottomless Gullet', num: 11504, rating: 3};
 abilities.divefisher = {...abilities.waterveil, name: 'Dive Fisher', num: 11505, rating: 3,
  onModifyMove(move) { if (move.id === 'dive' && !move.isZ && !move.isMax) move.category = 'Special'; },
  onChargeMovePriority: 1,
  onChargeMove(source, target, move) { if (move.id === 'dive' && !move.isZ && !move.isMax) return false; },
 };
 abilities.scatterbrain = {...abilities.oblivious, ...abilities.unaware, name: 'Scatterbrain', num: 11506, rating: 4};
 abilities.scalerhythm = {name: 'Scale Rhythm', num: 11507, rating: 3, flags: {},
  onAnyAfterDamageApplied(damage, target, source, move) {
   if (source !== this.effectState.target || !move || move.effectType !== 'Move' || (move as ActiveMove).category === 'Status' || !(move as ActiveMove).flags.sound || target.isAlly(source) || damage <= 0) return;
   ((this.activeMove as any).scaleRhythmUsers ||= new Set()).add(source);
  },
  onAnyAfterAttackResolved(source, target, move) {
   if (source !== this.effectState.target || !source.hp || !source.isActive || !(move as any).scaleRhythmUsers?.delete(source)) return;
   this.boost({def: 1}, source, source, this.effect);
  },
 };
}
