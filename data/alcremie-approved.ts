import type {AbilityDataTable} from '../sim/dex-abilities';
export const AlcremieDescriptions = {
 soothingcream:{name:'Soothing Cream',shortDesc:'Ripen; contact HP damage lowers attacker Attack once per move.',desc:"Full local Ripen. After an opposing contact move damages its HP, lowers the attacker's Attack by 1 once after the whole move."},
 masterpatissier:{name:'Master Pâtissier',shortDesc:'Aroma Veil; Decorate can also target itself.',desc:'Aroma Veil. Its Decorate can target itself or any normally eligible adjacent Pokémon, granting the usual +2 Attack and Sp. Atk.'},
 sweetsanctuary:{name:'Sweet Sanctuary',shortDesc:"Stamina; protects own and allies' Defense/Sp. Def from opposing drops.",desc:'Full local Stamina: opposing HP hits heal 1/16 max HP; the first each turn also raises Defense by 1. Protects itself and active allies from opposing Defense/Sp. Def drops. Stat resets and self-inflicted drops still apply.'},
};
export function installAlcremie(abilities:AbilityDataTable){
 abilities.soothingcream={...abilities.ripen,name:'Soothing Cream',num:11520,rating:4,
  onDamagingHit(damage,target,source,move){if(damage>0&&!source.isAlly(target)&&this.checkMoveMakesContact(move,source,target)){this.effectState.creamMove=move;this.effectState.creamSource=source;}},
  onAnyAfterAttackResolved(source,target,move){if(this.effectState.creamMove!==move||this.effectState.creamSource!==source)return;delete this.effectState.creamMove;delete this.effectState.creamSource;if(source.hp)this.boost({atk:-1},source,this.effectState.target,this.effect);},
 };
 abilities.masterpatissier={...abilities.aromaveil,id:'masterpatissier' as ID,name:'Master Pâtissier',num:11521,rating:4,
  onModifyMove(move){if(move.id==='decorate')move.target='normalOrSelf';},
 };
 abilities.sweetsanctuary={...abilities.stamina,name:'Sweet Sanctuary',num:11522,rating:4,
  onAllyTryBoost(boost,target,source){const holder=this.effectState.target as Pokemon;if(!source||source.isAlly(target))return;let blocked=false;for(const stat of ['def','spd'] as const)if(boost[stat]&&boost[stat]!<0){delete boost[stat];blocked=true;}if(blocked)this.add('-block',target,'ability: Sweet Sanctuary',`[of] ${holder}`);},
 };
}
