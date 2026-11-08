'use strict';
const assert=require('assert').strict;
const {Dex}=require('../../dist/sim');
const common = require('../common');
describe('Power Drill command discovery',()=>{
 it('both aliases list every drill and horn move, including Horn Attack, without Lunge',()=>{
  const {commands}=require('../../dist/server/chat-plugins/datasearch');
  assert.equal(commands.horn,'drill');let html='';
  commands.drill.call({checkBroadcast(){},sendReplyBox(value){html=value;}},'',null,null);
  for(const move of Dex.moves.all().filter(m=>m.exists&&(m.flags.drill||m.flags.horn)))assert(html.includes('/moves/'+move.id+'"'),move.name);
  assert(html.includes('Horn Attack'));assert(!html.includes('/moves/lunge"'));
 });
 it('Horn Attack already gets the existing horn multiplier without a drill flag',()=>{
  const move=Dex.moves.get('hornattack');assert(move.flags.horn);assert(!move.flags.drill);
		const battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[{ species: 'Mew', ability: 'Power Drill', moves: ['hornattack'] }], [{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }]]);
		try {
			battle.makeChoices('team 1', 'team 1');
			const [source, target] = [battle.p1.active[0], battle.p2.active[0]];
			assert.equal(battle.runEvent('BasePower', source, target, battle.dex.getActiveMove('hornattack'), 100), 150);
			battle.field.startTerrain('rockyterrain');
			const boosted = battle.runEvent('BasePower', source, target, battle.dex.getActiveMove('hornattack'), 100);
			source.setAbility('No Ability');
			const fieldOnly = battle.runEvent('BasePower', source, target, battle.dex.getActiveMove('hornattack'), 100);
			assert.equal(boosted, fieldOnly * 2); // Rocky's own horn bonus still applies independently.
		} finally { battle.destroy(); }
 });
});
