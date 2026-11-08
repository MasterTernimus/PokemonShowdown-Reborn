'use strict';const assert=require('assert').strict,common=require('../../common'),{Dex}=require('../../../dist/sim');let battle;
describe('Approved Rattled Shield Dust and selected replacements',()=>{afterEach(()=>{battle?.destroy();battle=null;});
	for (const species of ['Mightyena', 'Mightyena-Deso'])it(species + ' keeps Rivalry passive while copied Rattled can be suppressed', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[{ species, ability: 'Rattled', moves: ['splash'] }], [{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }]]);
		battle.field.terrain = 'hauntedterrain'; battle.makeChoices('team 1', 'team 1');
		const p = battle.p1.active[0], q = battle.p2.active[0]; assert.deepEqual(p.getPassives(), ['rivalry']); assert.equal(p.boosts.spe, 1);
		const hit = () => battle.actions.useMove(Object.assign(Dex.getActiveMove('bite'), { accuracy: true, damage: 1, secondaries: null }), q, { target: p });
		hit();
		assert.equal(p.boosts.spe, 2);
		p.addVolatile('gastroacid');
		hit();
		assert.equal(p.boosts.spe, 2);
	});
	it('keeps disabled Mightyena-Grim data but rejects battle entry', () => {
		assert(Dex.species.get('Mightyena-Grim').exists); assert.deepEqual(Dex.species.get('Mightyena-Grim').passives, ['rivalry']);
		assert.throws(() => common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[{ species: 'Mightyena-Grim', ability: 'Intimidate', moves: ['splash'] }], [{ species: 'Mew', moves: ['splash'] }]]), /Mightyena-Grim is disabled/);
	});
 for(const species of ['Cinccino','Cinccino-Deso'])it(species+' Shield Dust blocks target secondary but preserves attacker secondary',()=>{battle=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{species,ability:'Shield Dust',moves:['splash']}],[{species:'Mew',ability:'No Ability',moves:['splash']}]]);battle.makeChoices('team 1','team 1');const p=battle.p1.active[0],q=battle.p2.active[0];p.addVolatile('gastroacid');const m=Object.assign(Dex.getActiveMove('watergun'),{accuracy:true,secondaries:[{chance:100,status:'par'},{chance:100,self:{boosts:{spa:1}}}]});battle.actions.useMove(m,q,{target:p});assert.equal(p.status,'');assert.equal(q.boosts.spa,1);});
 it('preserves exact approved selected slots',()=>{assert.deepEqual(Dex.species.get('rapidashgalar').abilities,{0:'Psychic Surge',1:'Speed Boost',H:'Rapid Response'});assert.deepEqual(Dex.species.get('drifblim').abilities,{0:'Windy Surge',1:'Unburden',H:'Aftermath'});});
 it('adds approved Forretress and all six Rotom forms to Kaboom',()=>{const list=Dex.species.all().filter(s=>Dex.species.getLearnsetData(s.id).learnset?.kaboom).map(s=>s.id).sort();assert.deepEqual(list,['electrode','electrodehisui','golem','golemalola','bronzong','magnezone','forretress','rotom','rotomheat','rotomwash','rotomfrost','rotomfan','rotommow'].sort());for(const id of ['forretress','rotom','rotomheat','rotomwash','rotomfrost','rotomfan','rotommow'])assert.equal(require('../../../dist/sim/team-validator').TeamValidator.get('gen9nofieldsinglesgame').validateTeam([{species:id,ability:Dex.species.get(id).abilities[0],moves:['KABOOM!!']}]),null,id);});
});
