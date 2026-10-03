'use strict';
const assert = require('assert').strict, common = require('../../common');
const { calculateScenario } = require('../../../dist/sim/custom-calculator');
describe('Tidal Voice Sparkling Aria ally healing', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });
	function setup(doubles = true) {
		const set = ability => ({ species: 'Mew', ability, moves: ['sparklingaria', 'hypervoice', 'splash'] });
		battle = common.createBattle({ formatid: doubles ? 'gen9nofielddoublesbattle' : 'gen9nofieldsinglesgame' }, [
			[set('Tidal Voice'), set('No Ability'), set('No Ability')], [set('No Ability'), set('No Ability')],
		]); battle.makeChoices('team 123', 'team 12'); battle.randomChance = () => false;
		for (const mon of battle.getAllActive()) mon.hp = Math.floor(mon.maxhp / 2);
		battle.p1.pokemon[2].hp = Math.floor(battle.p1.pokemon[2].maxhp / 2);
		return [battle.p1.active[0], battle.p1.active[1], battle.p2.active[0]];
	}
	function use(p, move = 'sparklingaria', extra = {}) {
		const m = battle.dex.getActiveMove(move); Object.assign(m, { basePower: 1, willCrit: false, accuracy: true }, extra);
		battle.actions.runMove(m, p, 1);
	}
	it('heals an adjacent ally once across multiple targets/hits without healing self or bench', () => {
		const [p, ally] = setup(), hp = ally.hp, own = p.hp, bench = battle.p1.pokemon[2].hp;
		use(p, 'sparklingaria', { multihit: 3 }); assert.equal(ally.hp - hp, Math.floor(ally.maxhp / 8));
		assert.equal(p.hp, own); assert.equal(battle.p1.pokemon[2].hp, bench);
		assert(battle.log.some(x => x.includes('|-heal|') && x.includes('Tidal Voice')));
	});
	for (const kind of ['miss', 'protect', 'immune']) it('heals when an executed Aria is avoided by ' + kind, () => {
		const [p, ally] = setup(), hp = ally.hp;
		for (const foe of p.foes()) { if (kind === 'protect') foe.addVolatile('protect'); if (kind === 'immune') foe.setAbility('Water Absorb'); }
		use(p, 'sparklingaria', kind === 'miss' ? { accuracy: 0 } : {}); assert.equal(ally.hp - hp, Math.floor(ally.maxhp / 8));
	});
	for (const kind of ['sleep', 'flinch', 'paralysis']) it('does not heal on prevention by ' + kind, () => {
		const [p, ally] = setup(), hp = ally.hp;
		if (kind === 'sleep') { p.setStatus('slp'); p.statusState.time = 3; }
		if (kind === 'flinch') p.addVolatile('flinch');
		if (kind === 'paralysis') { p.setStatus('par'); battle.randomChance = () => true; }
		use(p); assert.equal(ally.hp, hp);
	});
	it('obeys Heal Block and caps healing to missing HP', () => {
		const [p, ally, foe] = setup(), hp = ally.hp;
		ally.addVolatile('healblock', foe);
		use(p);
		assert.equal(ally.hp, hp);
		ally.removeVolatile('healblock');
		ally.hp = ally.maxhp - 1;
		use(p);
		assert.equal(ally.hp, ally.maxhp);
	});
	it('does not heal in singles, with other sounds, or while Tidal Voice is suppressed', () => {
		const [p, ally] = setup(), hp = ally.hp; use(p, 'hypervoice'); assert.equal(ally.hp, hp);
		p.addVolatile('gastroacid');
		ally.addVolatile('protect');
		use(p);
		assert.equal(ally.hp, hp);
		battle.destroy();
		battle = null;
		const [single] = setup(false), own = single.hp;
		use(single);
		assert.equal(single.hp, own);
	});
	it('retains Liquid Voice conversion, sound power, ally safety and first-hit stat restoration', () => {
		const [p, ally, foe] = setup(); p.boosts.spa = -1;
		const m = battle.dex.getActiveMove('hypervoice'); battle.runEvent('ModifyType', p, foe, m, m);
		assert.equal(m.type, 'Water'); assert.equal(battle.runEvent('BasePower', p, foe, m, 100), 130);
		const hp = ally.hp;
		use(p, 'hypervoice');
		assert.equal(ally.hp, hp);
		assert.equal(p.boosts.spa, 0);
		p.boosts.spa = -1; use(p, 'hypervoice'); assert.equal(p.boosts.spa, -1);
	});
	it('calculator reports ally healing from the real move execution', () => {
		const input = { format: 'gen9nofielddoublesbattle', move: 'Sparkling Aria', samples: 8, seed: 42,
			actors: [{ species: 'Mew', ability: 'Tidal Voice' }, { species: 'Mew', ability: 'No Ability' },
				{ species: 'Mew', ability: 'No Ability', hpPercent: 50 }, { species: 'Mew', ability: 'No Ability' }] };
		const result = calculateScenario(input); assert.equal(result.results[2].max, 0);
		assert(result.results[2].maxNetLoss < 0);
		assert(result.exampleLog.some(x => x.includes('|-heal|p1b:') && x.includes('Tidal Voice')));
	});
});
