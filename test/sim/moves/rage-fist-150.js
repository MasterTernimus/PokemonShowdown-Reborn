'use strict';
const assert=require('assert').strict,common=require('../../common'),{Dex}=require('../../../dist/sim');
describe('Rage Fist capped fractional progress',()=>{let battle;afterEach(()=>{battle?.destroy();battle=null;});
function setup(){const m=s=>({species:s,ability:'No Ability',moves:['splash','ragefist','batonpass']});battle=common.createBattle({gameType:'doubles'},[[m('Annihilape'),m('Mew'),m('Mew')],[m('Mew'),m('Mew'),m('Mew')]]);for(const p of battle.getAllActive())p.hp=p.maxhp=p.baseMaxhp=10000;battle.p1.active[0].setType('Normal');return[battle.p1.active[0],battle.p2.active[0],battle.p1.active[1]];}
function hit(p,q,extra={}){battle.clearActiveMove();battle.actions.useMove(Object.assign(Dex.getActiveMove('watergun'),{damage:10,accuracy:true,willCrit:false},extra),p,{target:q});battle.clearActiveMove();}
const power=p=>Dex.moves.get('ragefist').basePowerCallback(p);
function out(p){battle.actions.switchIn(battle.p1.pokemon[2],0);battle.actions.switchIn(p,0);}
	it('50/70/90/110/130/150, cap without hidden overflow credit, progress persists across repeated switches', () => {
		const [p, q] = setup();
		assert.equal(power(p), 50);
		for (const n of [70, 90, 110, 130, 150, 150, 150]) {
			hit(q, p);
			assert.equal(power(p), n);
		}assert.equal(p.timesAttacked, 7);
		out(p);
		assert.equal(power(p), 150);
		assert.equal(p.timesAttacked, 7);
		out(p);
		assert.equal(power(p), 150);
		out(p);
		assert.equal(power(p), 150);
		hit(q, p);
		assert.equal(power(p), 150);
		for (let i = 0;
			i < 10;
			i++)hit(q, p);
		assert.equal(power(p), 150);
		out(p);
		for (const n of [150, 150, 150]) {
			hit(q, p);
			assert.equal(power(p), n);
		}
	});
	it('forced switches preserve progress, failed switches and ability restarts do not', () => {
		const [p, q] = setup();
		hit(q, p, { multihit: 5 });
		p.setAbility('Pressure');
		p.setAbility('No Ability');
		assert.equal(power(p), 150);
		assert.equal(battle.actions.switchIn(p, 0), false);
		assert.equal(power(p), 150);
		assert(battle.actions.dragIn(p.side, 0));
		assert.equal(power(p), 150);
	});
	it('Baton Pass preserves progress without transferring progress to its recipient', () => {
		const [p, q] = setup();
		hit(q, p, { multihit: 5 });
		const next = p.side.pokemon[2];
		battle.actions.switchIn(next, 0, Dex.moves.get('batonpass'));
		assert.equal(power(p), 150);
		assert.equal(power(next), 50);
	});
it('retains native ally/generated/multihit/numeric-zero eligibility',()=>{const[p,q,ally]=setup();hit(ally,p);assert.equal(power(p),70);hit(q,p,{sourceEffect:'instruct',multihit:2});assert.equal(power(p),110);hit(q,p,{damage:0});assert.equal(p.timesAttacked,4);assert.equal(power(p),130);});
	it('publishes exact progress after a multi-hit attack breaks Substitute', () => {
		const [p, q] = setup();
		p.addVolatile('substitute');
		p.volatiles.substitute.hp = 15;
		hit(q, p, { multihit: 3 });
		assert.equal(power(p), 110);
		assert(battle.log.includes('|-ragefist|' + p + '|60'));
		out(p);
		assert.equal(power(p), 110);
		hit(q, p, { damage: 0 });
		assert.equal(power(p), 130);
		assert(battle.log.includes('|-ragefist|' + p + '|80'));
	});
it('Substitute-only, protection and immunity do not build progress',()=>{const[p,q]=setup();p.addVolatile('substitute');hit(q,p);assert.equal(power(p),50);p.removeVolatile('substitute');p.addVolatile('protect');hit(q,p);assert.equal(power(p),50);p.removeVolatile('protect');p.setAbility('Water Absorb');hit(q,p);assert.equal(power(p),50);});
	it('Transform copies numeric progress without sharing future mutations', () => {
		const [p, q, ally] = setup();
		hit(q, p, { multihit: 5 });
		out(p);
		assert(ally.transformInto(p));
		assert.equal(power(ally), 150);
		hit(q, ally);
		assert.equal(power(ally), 150);
		assert.equal(power(p), 150);
	});
it('fainting and revival preserve progress, owner request exposes exact bonus',()=>{const[p,q]=setup();hit(q,p,{multihit:5});p.faint();battle.faintMessages();assert.equal(power(p),150);assert.equal(p.getSwitchRequestData().rageFistBonus,100);p.fainted=false;p.hp=100;p.isActive=true;assert.equal(power(p),150);});
it('retains FFA targeting and full spread power',()=>{const[p]=setup();battle.gameType='freeforall';const m=Dex.getActiveMove('ragefist');m.onModifyMove.call(battle,m);assert.equal(m.target,'allAdjacentFoes');assert(m.fullDamageSpread);});
it('calculator accepts fractional bonus, rejects invalid bounds, and records it',()=>{const {validateScenario,buildCalculatorBattle}=require('../../../dist/sim/custom-calculator');const input={format:'gen9nofieldsinglesgame',move:'ragefist',actors:[{species:'Annihilape',ability:'Defiant',rageFistBonus:12.5},{species:'Mew',ability:'No Ability'},{species:'Mew',ability:'No Ability'},{species:'Mew',ability:'No Ability'}]};const scenario=validateScenario(input),r=buildCalculatorBattle(scenario,1);try{assert.equal(power(r.mons[0]),62.5);}finally{r.battle.destroy();}for(const bonus of[-1,101,NaN,Infinity,'50'])assert.throws(()=>validateScenario({...input,actors:[{...input.actors[0],rageFistBonus:bonus},...input.actors.slice(1)]}));});
});
