import type {AbilityDataTable} from '../sim/dex-abilities';
export const AuditReworkDescriptions: Record<string, {shortDesc: string; desc: string}> = {
	cursedkeepsake: {
		shortDesc: 'Once per entry: curses an attacker. Cursed foes deal 20% less; own Curse heals.',
		desc: 'Once per entry, an opposing attack damaging its HP curses its surviving attacker if not already cursed. Its ability-applied Curse deals 1/8 max HP per turn. Cursed opponents deal 20% less attack damage. While active, heals half the actual damage its own Curse causes.',
	},
	cursedmarionette: {
		shortDesc: 'First successful status move per foe each entry curses it; 1.3x damage to cursed foes.',
		desc: 'Once per entry per foe, a successful status move curses that foe. This Curse deals 1/8 max HP each turn. Attacks deal 1.3x damage to cursed foes.',
	},
	reapersgrip: {
		shortDesc: 'Self-Sufficient; 5-turn Haunted Aura on entry; Ghost attacks drain 25%. Ghost KO can create Haunted.',
		desc: 'Heals 1/16 max HP each turn and ignores sandstorm/hail damage. Entry creates 5-turn Haunted Aura: all Ghost attacks gain 20% power. Its Ghost attacks heal 25% of opposing HP damage dealt. A direct Ghost KO while it survives and Haunted Aura remains attempts to convert the field to Haunted for 5 turns, consuming the Aura only on success. Respects field locks; cannot extend existing Haunted. Later entries can create the Aura again, but ability restarts cannot. Suppression stops new triggers and holder benefits; an existing Aura persists.',
	},
 bewitchingmajesty: {shortDesc:'Magic Bounce + Queenly Majesty; 5-turn Bewitched Aura. Smite can turn it into Bewitched Woods.',desc:'Reflects eligible status moves and protects its side from opposing priority moves. Entry creates 5-turn Bewitched Aura: Psychic/Fairy attacks gain 20% power, once even with both types. G-Max Smite damaging a foe already confused before the attack can convert the field into Bewitched Woods for 5 turns if the holder survives. Respects field locks; consumes the Aura only on success and cannot extend an existing matching field. Later entries can create the Aura again; ability restarts cannot. Suppression stops new triggers and protections; an existing Aura persists.'},
	relentlesshunt: { shortDesc: 'Rough Skin; weak attacks gain priority; field power 1.3x–2x.', desc: 'Rough Skin. Damaging moves up to 60 base power gain +1 priority, or up to 80 on Cold Eclipse. Attacks have 2x power on Dragon’s Den and Fairy Tale; 1.5x on Rocky, Big Top, Mountain, Snowy Mountain and Cold Eclipse; 1.3x on Desert, Forest, Burning, Superheated, Ashen Beach, Water Surface, Cave, Starlight Arena and New World. Each ability bonus applies once.' },
};
function entry(pokemon: Pokemon, id: string) {
 if (!pokemon.volatiles[id]) pokemon.addVolatile(id);
 return pokemon.volatiles[id];
}
function auraEntry(battle: Battle, pokemon: Pokemon, ability: string, aura: string, field: string) {
 if (pokemon.volatiles[ability]) return;
 pokemon.addVolatile(ability);
 if (battle.field.isTerrain(field)) return;
 if (battle.field.setAura(aura,5,pokemon,battle.dex.abilities.get(ability))) battle.add('-message', aura === 'hauntedaura' ? 'Reaper’s Grip opened a passage for wandering spirits!' : 'Bewitching Majesty filled the air with a strange hush!');
}
function convert(battle: Battle, source: Pokemon, ability: string, aura: string, field: string) {
 if (!source.hp || !source.isActive || !battle.field.isAura(aura) || battle.field.isTerrain(field)) return;
 // These custom Auras can only develop through the holder’s deliberate trigger.
 if (battle.field.changeTerrain(field, source, battle.dex.abilities.get(ability))) {
  battle.field.setTerrainDuration(5);
  if (battle.field.isAura(aura)) battle.field.clearAura(false);
  battle.add('-message', aura === 'hauntedaura' ? 'The claimed soul drew the battlefield into the beyond!' : 'The bewildered foe’s thoughts drew the woods into reality!');
 }
}
export function installAuditReworks(a: AbilityDataTable) {
 a.cursedkeepsake = {
  name:'Cursed Keepsake',num: a.cursedkeepsake.num,rating:3,flags:{},condition:{noCopy:true},
  onDamagingHit(damage,target,source,move) {
   if (!source?.hp || source.isAlly(target) || damage <= 0 || !target.hp || source.volatiles.curse) return;
   const state=entry(target,'cursedkeepsake'); if(state.spent)return;
   if(source.addVolatile('curse',target,this.dex.abilities.get('cursedkeepsake'))) {state.spent=true;this.add('-message','The discarded keepsake clung to its attacker!');}
  },
  onSourceModifyDamage(damage,source,target,move) {if(!source.isAlly(target)&&source.volatiles.curse&&move.category!=='Status')return this.chainModify(0.8);},
 };
 a.cursedmarionette = {
  name:'Cursed Marionette',num:a.cursedmarionette.num,rating:4,flags:{},condition:{noCopy:true},
  onAnyAfterSuccessfulStatusHit(target,source,move) {
   if (this.effectState.target !== source) return;
   if(!target?.hp||!source.hp||target.isAlly(source)||target.volatiles.curse||move.hasBounced)return;
   const state=entry(source,'cursedmarionette'); const targets: Pokemon[]=state.targets ||= [];
   if(targets.includes(target))return;
   if(target.addVolatile('curse',source,this.dex.abilities.get('cursedmarionette'))) {targets.push(target);this.add('-message','The marionette’s strings caught another soul!');}
  },
  onBasePower(basePower,source,target,move){if(!target.isAlly(source)&&target.volatiles.curse&&move.category!=='Status')return this.chainModify(1.3);},
 };
 a.reapersgrip = {
  name:"Reaper's Grip",num:a.reapersgrip.num,rating:5,flags:{},condition:{noCopy:true},
  onStart(pokemon){auraEntry(this,pokemon,'reapersgrip','hauntedaura','hauntedterrain');},
  onResidualOrder:28,onResidual(pokemon){this.heal(pokemon.baseMaxhp/16,pokemon);},
  onImmunity(type){if(type==='sandstorm'||type==='hail')return false;},
  onSourceDamagingHit(damage,target,source,move){if(damage>0&&source.hp&&!source.isAlly(target)&&this.movehasType(move,'Ghost'))this.heal(damage/4,source,target,'drain');},
  onSourceAfterFaint(length,target,source,effect){if(effect?.effectType==='Move'&&effect.category!=='Status'&&!source.isAlly(target)&&this.movehasType(effect,'Ghost'))convert(this,source,'reapersgrip','hauntedaura','hauntedterrain');},
 };
 const bounce=a.magicbounce, queen=a.queenlymajesty;
 a.bewitchingmajesty = {
  name:'Bewitching Majesty',num:a.bewitchingmajesty.num,rating:5,flags:{breakable:1},condition:{noCopy:true},
  onStart(pokemon){auraEntry(this,pokemon,'bewitchingmajesty','bewitchedaura','bewitchedwoodsterrain');},
  onTryHitPriority:bounce.onTryHitPriority,onTryHit:bounce.onTryHit,onAllyTryHitSide:bounce.onAllyTryHitSide,
  onFoeTryMove:queen.onFoeTryMove,
  onModifyMove(move,source){if(move.id==='gmaxsmite')(move as ActiveMove & {bewitchedTargets?: Pokemon[]}).bewitchedTargets=source.foes().filter(p=>!!p.volatiles.confusion);},
  onSourceDamagingHit(damage,target,source,move){if(damage>0&&!source.isAlly(target)&&(move as ActiveMove & {bewitchedTargets?: Pokemon[]}).bewitchedTargets?.includes(target))(move as ActiveMove & {bewitchedReady?: boolean}).bewitchedReady=true;},
  onAfterMove(source,target,move){if((move as ActiveMove & {bewitchedReady?:boolean}).bewitchedReady)convert(this,source,'bewitchingmajesty','bewitchedaura','bewitchedwoodsterrain');},
 };
 a.relentlesshunt.onModifyPriority=function(priority,source,target,move){if(move.category!=='Status'&&move.basePower<=(this.field.isTerrain('coldeclipseterrain')?80:60))return priority+1;};
	a.relentlesshunt.onBasePower = function (bp, source, target, move) {
		if (move.category === 'Status') return;
		if (this.field.isTerrain(['dragonsdenterrain', 'fairytaleterrain'])) return this.chainModify(2);
		if (this.field.isTerrain([
			'rockyterrain', 'bigtopterrain', 'mountainterrain', 'snowymountainterrain', 'coldeclipseterrain',
		])) return this.chainModify(1.5);
		if (this.field.isTerrain([
			'desertterrain', 'forestterrain', 'burningterrain', 'superheatedterrain', 'ashenbeachterrain',
			'watersurfaceterrain', 'caveterrain', 'starlightarenaterrain', 'newworldterrain',
		])) return this.chainModify(1.3);
	};
 for(const[id,text]of Object.entries(AuditReworkDescriptions))Object.assign(a[id as keyof AbilityDataTable],text);
}
