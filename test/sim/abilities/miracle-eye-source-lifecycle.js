'use strict';
const assert=require('assert').strict,common=require('../../common');
describe('Alakazam Miracle Eye source lifecycle',()=>{
 let b;afterEach(()=>{b?.destroy();b=null;});
 function setup(ability='Grandmaster',doubles=false){const p={species:'Alakazam',ability,item:'Alakazite',moves:['psychic','miracleeye','splash','protect']},q={species:'Mew',ability:'No Ability',moves:['splash']};b=common.createBattle({formatid:doubles?'gen9doublesrockyfield':'gen9nofieldsinglesgame'},[[p,{...p}],[q,{...q}]]);if(b.requestState==='teampreview')b.makeChoices('team 12','team 12');return[b.p1.active[0],b.p2.active[0]];}
 function casts(){return b.log.filter(x=>x.startsWith('|move|p1')&&x.includes('|Miracle Eye|')).length;}
 function manual(p,q){b.actions.runMove('miracleeye',p,p.getLocOf(q),{externalMove:true});}
 it('entry, selected restart, suppression ending and Mega evolution do not duplicate automatic casts',()=>{const[p,q]=setup();assert(q.volatiles.miracleeye);assert.equal(casts(),1);b.singleEvent('Start',p.getAbility(),p.abilityState,p);q.setAbility('Neutralizing Gas');q.setAbility('No Ability');assert.equal(casts(),1);b.actions.runMegaEvo(p);assert.equal(p.ability,'perfectforesight');assert.equal(casts(),1);});
 it('manual stacks remain repeatable despite an existing automatic mark',()=>{const[p,q]=setup();b.field.terrain='psychicterrain';b.field.terrainState=b.initEffectState({id:'psychicterrain',terrainChanges:new Map()});manual(p,q);assert.equal(p.boosts.spa,2);manual(p,q);assert.equal(p.boosts.spa,4);manual(p,q);assert.equal(p.boosts.spa,6);p.boosts.spa=0;manual(p,q);assert.equal(p.boosts.spa,2);assert(q.volatiles.miracleeye);assert.equal(Object.keys(q.volatiles).filter(x=>x==='miracleeye').length,1);});
 it('two allied sources apply one entry cast each to their own opposing targets',()=>{setup('Grandmaster',true);assert.equal(casts(),2);for(let i=0;i<2;i++){assert(b.p2.active[i].volatiles.miracleeye);assert.equal(b.p2.active[i].volatiles.miracleeye.source,b.p1.active[i]);}});
 it('selected/passive Revealing Gaze overlap still produces one automatic cast',()=>{setup('Revealing Gaze');assert.equal(casts(),1);});
 it('opposing entry clears its mark; Grandmaster prepares the new target without another utility cast',()=>{const[p,q]=setup();b.makeChoices('move protect','switch 2');const next=b.p2.active[0];assert.notEqual(next,q);assert(!next.volatiles.miracleeye);b.makeChoices('move psychic','move splash');assert(next.volatiles.miracleeye);assert.equal(casts(),1);assert.equal(p.boosts.spa,0);});
});
