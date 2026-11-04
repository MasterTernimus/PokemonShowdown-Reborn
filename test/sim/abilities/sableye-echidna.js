'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim');

describe('Sableye’s Echidna abilities', () => {
	let battle;
	afterEach(() => battle?.destroy());
	const mon = (species, ability, item = '') => ({species, ability, item, moves: ['splash', 'taunt', 'tackle', 'nightshade']});
	function start(mega = false) {
		const holder = mon(mega ? 'Sableye-Mega' : 'Sableye', mega ? 'Tome of Avarice' : "Acquired Taste");
		const ally = mon('Mew', 'No Ability', 'Oran Berry');
		const foe = mon('Mew', 'No Ability', 'Sitrus Berry');
		battle = common.createBattle({gameType:'doubles'}, [[holder, ally, mon('Mew','No Ability')], [foe, foe]]);
		battle.randomizer = n => n;
		return [battle.p1.active[0],battle.p1.active[1],...battle.p2.active];
	}
	it('reveals both items, gets Prankster priority, and heals once per opposing attacker each entry', () => {
		const [p,ally,q,r] = start();
		assert(p.hasAbilityOrPassive('prankster')); assert(p.hasAbility('frisk'));
		assert.equal(battle.log.filter(line=>line.includes('|-item|p2') && line.includes("ability: Acquired Taste")).length,2);
		assert.equal(battle.runEvent('ModifyPriority',p,q,Dex.getActiveMove('taunt'),0),1);
		p.maxhp = p.baseMaxhp = 800;
		p.hp = 400;
		const hit = (source, hits=1) => battle.actions.useMove(Object.assign(Dex.getActiveMove('watergun'),{damage:10,multihit:hits}),source,{target:p});
		hit(ally); assert.equal(p.hp,390);
		q.removeVolatile('embargo'); q.eatItem(true); assert.equal(p.hp,390);
		p.addVolatile('substitute'); const before=p.hp;
		hit(q); assert.equal(p.hp,before);
		p.removeVolatile('substitute');
		hit(q,3); assert.equal(p.hp,before+70);
		hit(q); assert.equal(p.hp,before+60);
		hit(r); assert.equal(p.hp,before+150);
		battle.makeChoices('switch 3, move splash','auto');
		battle.makeChoices('switch 3, move splash','auto');
		assert.equal(battle.p1.active[0],p);
		const returned=p.hp;hit(q);assert.equal(p.hp,returned+90);
	});
	it('learns an attack after HP damage, discounts subsequent uses from either foe, and forgets on switch', () => {
		const [p,,q,r] = start(true);
		p.hp = p.maxhp = p.baseMaxhp = 9000;
		const hit = (user,id,extra={}) => {
			const before = p.hp;
			battle.actions.useMove(Object.assign(Dex.getActiveMove(id),{accuracy:true,willCrit:false,secondaries:[],...extra}),user,{target:p});
			return before-p.hp;
		};
		const first = hit(q,'watergun',{multihit:2});
		const repeat = hit(r,'watergun');
		assert(Math.abs(repeat-first*0.35)<=1);
		assert.equal(battle.log.filter(line=>line.includes('recorded Water Gun')).length,1);
		assert(p.hasAbilityOrPassive('magicbounce'));
		battle.actions.useMove('taunt',q,{target:p});
		assert(!p.volatiles.taunt);assert(q.volatiles.taunt);
		battle.makeChoices('switch 3, move splash','auto');
		battle.makeChoices('switch 3, move splash','auto');
		assert.equal(battle.p1.active[0],p);
		assert.equal(hit(q,'watergun'),first/2);
	});
});
