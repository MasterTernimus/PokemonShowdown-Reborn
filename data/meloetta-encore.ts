export const MeloettaDescriptions={
 songstress:{name:'Songstress',shortDesc:'Copies another Pokemon’s sound move immediately after it succeeds.',desc:'Copies another Pokemon’s successful sound move without spending PP or its turn. Copies cannot trigger further copies.'},
 performer:{name:'Performer',shortDesc:'Dancer + Songstress.',desc:'Copies another Pokemon’s successful dance or sound move once, without spending PP or its turn. Copies cannot trigger further copies. Retains Dancer’s local dance bonuses.'},
};

export function prepareMeloettaMove(move:ActiveMove,source:Pokemon){
 if(!['relicsong','encorearia','pirouettedance'].includes(move.id)||(move as any).meloettaResolved)return;
 if(source.species.id==='meloettapirouette'){
  Object.assign(move,{name:'Pirouette Dance'});move.type='Fighting';move.flags={...move.flags,dance:1};delete move.flags.sound;
 }else if(source.species.id==='meloettaencore'){
  Object.assign(move,{name:'Encore Aria'});move.type='Fairy';
  move.category='Special';move.flags={...move.flags};delete move.flags.sound;delete move.flags.dance;
  (move as any).encoreAdaptive=true;
 }else return;
 (move as any).meloettaResolved=true;
}
