'use strict';
const assert=require('assert').strict,common=require('../../common'),{Dex}=require('../../../dist/sim');let battle;
function setup(species='Conkeldurr',ability='Rocky Payload'){battle=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{species,ability,moves:['rockslide','splash']}],[{species:'Mew',ability:'No Ability',moves:['tackle']}]]);battle.makeChoices('team 1','team 1');battle.field.terrain='';const p=battle.p1.active[0],q=battle.p2.active[0];for(const x of [p,q])x.hp=x.maxhp=x.baseMaxhp=1600;return[p,q];}
describe('Conkeldurr Stamina and offensive-only Rocky Payload',()=>{afterEach(()=>{battle?.destroy();battle=null;});
 it('allows Apocalyptic Flame to compare stats after damaging a Rocky Payload holder', () => {
  const [holder, attacker] = setup();
  attacker.setAbility('Apocalyptic Flame');
  assert.equal(holder.getStat('atk'), holder.storedStats.atk);
  assert.equal(holder.getStat('spa'), holder.storedStats.spa);
  battle.actions.useMove('gigatonhammer', attacker, {target: holder});
  assert.equal(holder.boosts.atk, -1);
 });
	it('has exact selected slots and separate passive', () => {
		assert.deepEqual(Dex.species.get('conkeldurr').abilities, { 0: 'Guts', 1: 'Stamina', H: 'Wrecking Crew' });
		assert.deepEqual(Dex.species.get('conkeldurr').passives, ['rockypayload']);
		assert(!Dex.abilities.get('rockypayload').onEffectiveness);
		assert(!/resistan/i.test(Dex.abilities.get('rockypayload').desc));
	});
 for(const species of ['Conkeldurr','Mew','Charizard','Muk','Corviknight'])for(const move of ['tackle','flamethrower','airslash','poisonjab','watergun','rockslide'])it(species+' natural effectiveness of '+move,()=>{const[p,q]=setup(species);const m=Dex.getActiveMove(move);const actual=p.runEffectiveness(m);p.setAbility('No Ability');assert.equal(actual,p.runEffectiveness(m));});
 for(const field of ['','rockyterrain'])for(const move of ['rockslide','powergem'])it('retains offensive '+move+'/'+field,()=>{const[p,q]=setup('Mew');battle.field.terrain=field;const m=Dex.getActiveMove(move);battle.runEvent('ModifyMove',p,q,m,m);assert(!m.forceSTAB);assert.equal(battle.runEvent(move==='rockslide'?'ModifyAtk':'ModifySpA',p,q,m,100),150);});
	for (const ability of ['Guts', 'Wrecking Crew', 'Stamina']) for (const suppressed of [false, true]) {
		it(ability + ' selected Stamina effects with suppression=' + suppressed, () => {
			const [p, q] = setup('Conkeldurr', ability);
			if (suppressed)p.addVolatile('gastroacid', q);
			p.hp = 800;
			const attack = () => battle.actions.useMove(Object.assign(Dex.getActiveMove('tackle'), { damage: 100, accuracy: true, willCrit: false, secondaries: null, multihit: 2 }), q, { target: p });
			const stamina = ability === 'Stamina' && !suppressed;
			attack(); assert.equal(p.hp, stamina ? 700 : 600); assert.equal(p.boosts.def, stamina ? 1 : 0);
			attack(); assert.equal(p.hp, stamina ? 600 : 400); assert.equal(p.boosts.def, stamina ? 1 : 0);
			assert.equal(battle.runEvent('ModifyAtk', p, q, Dex.getActiveMove('rockslide'), 100), 150);
			assert.deepEqual(p.getPassives(), ['rockypayload']);
		});
	}
});
