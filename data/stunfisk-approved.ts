import type {AbilityDataTable} from '../sim/dex-abilities';
export const StunfiskDescriptions = {
 livewiretrap:{shortDesc:'Static; Electric attacks gain 1.3x power against statused foes.',desc:'Full local Static, including its doubled contact paralysis chance on Electric and Short-Circuit fields. Damaging Electric attacks have 1.3x power against opponents with a major status condition.'},
 mudflatdynamo:{shortDesc:'Battle Armor; surviving an opposing attack stores one 1.5x Electric attack.',desc:'Full local Battle Armor, including critical-hit immunity, 20% incoming damage reduction and field callbacks. After surviving an opposing direct HP-damaging move, stores one charge. The next attempted damaging Electric move uses 1.5x power across its whole move and spends the charge, even on a miss, protection or immunity. Electric status moves do not spend it. Charges cannot stack; switching clears them. Allied, recoil, residual and Substitute-only damage do not qualify.'},
 ironclamp:{shortDesc:'Battle Armor; opposing contact HP damage lowers attacker Speed once per move.',desc:'Full local Battle Armor. After an opposing contact move damages its HP, lowers the attacker’s Speed by 1 once after the whole move. Normal stat-drop protections apply.'},
 baitedcounter:{shortDesc:'Filter; physical attacks gain 1.3x after opposing attack HP damage that turn.',desc:'Full local Filter. Its physical attacks have 1.3x power if it has already taken opposing direct damaging-move HP damage during the current turn and entry. Allied, recoil, residual and Substitute-only damage do not qualify.'},
};
export function installStunfisk(abilities:AbilityDataTable) {
 abilities.livewiretrap={...abilities.static,name:'Livewire Trap',num:11529,rating:4,
  onBasePower(power,source,target,move){if(!source.isAlly(target)&&target.status&&move.category!=='Status'&&this.movehasType(move,'Electric'))return this.chainModify(1.3);},
 };
 abilities.mudflatdynamo={...abilities.battlearmor,name:'Mudflat Dynamo',num:11530,rating:4,
  onAnyAfterDamageApplied(damage,target,source,effect){if(target!==this.effectState.target||damage<=0||!source||source.isAlly(target)||effect?.effectType!=='Move'||effect.category==='Status')return;this.effectState.dynamoMove=effect;this.effectState.dynamoSource=source;},
  onAnyAfterAttackResolved(source,target,move){if(this.effectState.dynamoMove!==move||this.effectState.dynamoSource!==source)return;delete this.effectState.dynamoMove;delete this.effectState.dynamoSource;const holder=this.effectState.target as Pokemon;if(holder.hp&&holder.isActive)holder.m.mudflatCharge=true;},
  onTryMove(source,target,move){if(source.m.mudflatCharge&&move.category!=='Status'&&this.movehasType(move,'Electric')){delete source.m.mudflatCharge;(move as any).mudflatDynamo=true;}},
  onBasePower(power,source,target,move){if((move as any).mudflatDynamo&&move.category!=='Status'&&this.movehasType(move,'Electric'))return this.chainModify(1.5);},
 };
 abilities.ironclamp={...abilities.battlearmor,name:'Iron Clamp',num:11531,rating:4,
  onDamagingHit(damage,target,source,move){if(damage>0&&!source.isAlly(target)&&this.checkMoveMakesContact(move,source,target)){this.effectState.clampMove=move;this.effectState.clampSource=source;}},
  onAnyAfterAttackResolved(source,target,move){if(this.effectState.clampMove!==move||this.effectState.clampSource!==source)return;delete this.effectState.clampMove;delete this.effectState.clampSource;if(source.hp)this.boost({spe:-1},source,this.effectState.target,this.effect);},
 };
 abilities.baitedcounter={...abilities.filter,name:'Baited Counter',num:11532,rating:4,
  onAnyAfterDamageApplied(damage,target,source,effect){if(target!==this.effectState.target||damage<=0||!source||source.isAlly(target)||effect?.effectType!=='Move'||effect.category==='Status')return;target.m.baitedCounterTurn=this.turn;target.m.baitedCounterEntry=target.previouslySwitchedIn;},
  onBasePower(power,source,target,move){if(move.category==='Physical'&&source.m.baitedCounterTurn===this.turn&&source.m.baitedCounterEntry===source.previouslySwitchedIn)return this.chainModify(1.3);},
 };
}
