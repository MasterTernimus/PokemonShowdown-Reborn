'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');
describe('Evergreen and Scavenger reworks', () => {
	let battle;
	afterEach(() => battle?.destroy());
	function setup(ability, species = 'Mew') {
		const set = (ability, species = 'Mew') => ({ species, ability, moves: ['splash', 'tackle'] });
		battle = common.createBattle({ gameType: 'doubles' }, [[set(ability, species), set('No Ability'), set('No Ability')], [set('No Ability'), set('No Ability'), set('No Ability')]]);
		if (battle.requestState === 'teampreview')battle.makeChoices('team 123', 'team 123');
		battle.field.clearWeather();
		return [battle.p1.active[0], battle.p1.active[1], battle.p2.active[0], battle.p2.active[1]];
	}
	function residual(p) { battle.singleEvent('Residual', p.getAbility(), p.abilityState, p); }
	for (const weather of ['hail', 'snow'])it('Evergreen always restores consumed Berries in ' + weather, () => {
		const [p] = setup('Evergreen', 'Abomasnow');
		battle.field.setWeather(weather, p); battle.randomChance = () => false;
		p.lastItem = 'sitrusberry'; residual(p);
		assert.equal(p.item, 'sitrusberry'); assert.equal(p.lastItem, '');
		assert(battle.log.some(line => line.includes('[from] ability: Evergreen')));
	});
	it('uses a 50% roll outside cold weather, including sun and Grassy Field', () => {
		const [p] = setup('Evergreen'); battle.field.setWeather('sunnyday', p); battle.field.setTerrain('grassyterrain', p);
		let rolls = 0;
		battle.randomChance = (n, d) => {
			assert.equal(n, 1);
			assert.equal(d, 2);
			rolls++;
			return false;
		};
		p.lastItem = 'sitrusberry';
		residual(p);
		assert.equal(p.item, '');
		assert.equal(rolls, 1);
		battle.randomChance = () => true; residual(p); assert.equal(p.item, 'sitrusberry');
	});
	it('restores consumed field Seeds without replacing held items or inventing consumption', () => {
		const [p] = setup('Evergreen'); battle.randomChance = () => true;
		residual(p); assert.equal(p.item, '');
		p.lastItem = 'telluricseed'; residual(p); assert.equal(p.item, 'telluricseed');
		p.lastItem = 'sitrusberry'; residual(p); assert.equal(p.item, 'telluricseed');
		p.item = '';
		p.lastItem = 'leftovers';
		residual(p);
		assert.equal(p.item, '');
	});
	it('removes Ripen and Overcoat while leaving normal Harvest unchanged', () => {
		const [p] = setup('Evergreen');
		assert(!p.hasAbility('ripen'));
		assert(!p.hasAbility('overcoat'));
		assert(!p.hasAbility('harvest'));
		p.hp = Math.floor(p.maxhp / 2);
		p.setItem('Sitrus Berry');
		const hp = p.hp;
		p.eatItem();
		assert.equal(p.hp - hp, Math.floor(p.baseMaxhp / 4));
		p.setAbility('Harvest');
		p.lastItem = 'sitrusberry';
		battle.field.setWeather('sunnyday', p);
		battle.randomChance = () => false;
		residual(p);
		assert.equal(p.item, 'sitrusberry');
	});
	it('Scavenger heals only once when several active Pokemon faint in one turn', () => {
		const [p, ally, q, r] = setup('Scavenger', 'Mandibuzz'); p.baseMaxhp = p.maxhp = 400; p.hp = 100;
		q.faint(); battle.faintMessages(); assert.equal(p.hp, 200);
		ally.faint(); battle.faintMessages(); assert.equal(p.hp, 200);
		battle.turn++;
		r.faint();
		battle.faintMessages();
		assert.equal(p.hp, 300);
	});
	it('does not heal for a benched faint, while suppressed, or when the holder also has zero HP', () => {
		const [p, ally, q, r] = setup('Scavenger'); p.baseMaxhp = p.maxhp = 400; p.hp = 100;
		battle.p2.pokemon[2].faint(); battle.faintMessages(); assert.equal(p.hp, 100);
		p.addVolatile('gastroacid', q);
		q.faint();
		battle.faintMessages();
		assert.equal(p.hp, 100);
		p.removeVolatile('gastroacid');
		p.faint();
		r.faint();
		battle.faintMessages();
		assert.equal(p.hp, 0);
	});
	it('has no old components and no switch-out recovery or Defense-drop protection', () => {
		const [p,,q] = setup('Scavenger', 'Mandibuzz'); for (const id of ['overcoat', 'bigpecks', 'regenerator'])assert(!p.hasAbility(id));
		battle.boost({ def: -1 }, p, q); assert.equal(p.boosts.def, -1);
		p.hp = 100; battle.singleEvent('SwitchOut', p.getAbility(), p.abilityState, p); assert.equal(p.hp, 100);
		assert.deepEqual(Dex.species.get('mandibuzz').passives, ['rivalry']);
		assert.equal(Dex.species.get('mandibuzz').abilities.H, 'Carrion Watch');
	});
});
