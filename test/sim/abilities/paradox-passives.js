'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');

describe('Paradox passives and Farigiraf', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });
	function setup(species, ability, item = '', allyAbility = 'No Ability') {
		const set = (species, ability, item = '') => ({ species, ability, item, moves: ['splash', 'psychic', 'tackle', 'quickattack'] });
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [
			[set(species, ability, item), set('Mew', 'No Ability')],
			[set('Mew', allyAbility), set('Mew', 'No Ability')],
		]);
		if (battle.requestState === 'teampreview') battle.makeChoices('team 12', 'team 12');
		return [battle.p1.active[0], battle.p2.active[0]];
	}
	it('gives all 20 Paradox species exactly three real choices and one matching passive', () => {
		const ancient = ['greattusk', 'screamtail', 'brutebonnet', 'fluttermane', 'slitherwing', 'sandyshocks', 'roaringmoon', 'walkingwake', 'gougingfire', 'ragingbolt'];
		const future = ['irontreads', 'ironbundle', 'ironhands', 'ironjugulis', 'ironmoth', 'ironthorns', 'ironvaliant', 'ironleaves', 'ironboulder', 'ironcrown'];
		for (const [ids, passive] of [[ancient, 'protosynthesis'], [future, 'quarkdrive']]) {
			for (const id of ids) {
				const species = Dex.species.get(id);
				assert.deepEqual(species.passives, [passive], id);
				assert.deepEqual(Object.keys(species.abilities), ['0', '1', 'H'], id);
				assert.equal(new Set(Object.values(species.abilities)).size, 3, id);
				for (const ability of Object.values(species.abilities)) {
					assert(Dex.abilities.get(ability).exists, `${id}: ${ability}`);
					assert.notEqual(Dex.abilities.get(ability).id, passive);
				}
			}
		}
		assert.equal(Dex.species.get('koraidon').abilities[0], 'Orichalcum Pulse');
		assert.equal(Dex.species.get('miraidon').abilities[0], 'Hadron Engine');
	});
	for (const [species, ability, passive, field] of [
		['Scream Tail', 'Competitive', 'protosynthesis', 'sunnyday'],
		['Iron Bundle', 'Prankster', 'quarkdrive', 'electricterrain'],
	]) {
		it(`${species} activates from its field, survives ability suppression, and ends when the field ends`, () => {
			const [p, q] = setup(species, ability);
			assert(!p.volatiles[passive]);
			const stat = p.getBestStat(false, true);
			const original = p.getStat(stat);
			if (passive === 'protosynthesis') battle.field.setWeather(field, q);
			else battle.field.setTerrain(field, q);
			assert(p.volatiles[passive]);
			const boosted = p.getStat(stat);
			assert(boosted > original);
			p.addVolatile('gastroacid', q);
			assert.equal(p.getStat(stat), boosted);
			if (passive === 'protosynthesis') battle.field.clearWeather();
			else battle.field.clearTerrain();
			assert(!p.volatiles[passive]);
			assert.equal(p.getStat(stat), original);
		});
		it(`${species} consumes Booster Energy once and does not retain the boost after switching`, () => {
			const [p] = setup(species, ability, 'Booster Energy');
			assert.equal(p.item, '');
			assert(p.volatiles[passive]?.fromBooster);
			const stat = p.volatiles[passive].bestStat;
			const boosted = p.getStat(stat);
			battle.makeChoices('switch 2', 'move splash');
			battle.makeChoices('switch 2', 'move splash');
			assert(!p.volatiles[passive]);
			assert(p.getStat(stat) < boosted);
		});
		it(`${species} saves Booster Energy until its field ends`, () => {
			const [p, q] = setup(species, ability);
			if (passive === 'protosynthesis') battle.field.setWeather(field, q);
			else battle.field.setTerrain(field, q);
			p.setItem('Booster Energy');
			battle.runEvent('Update', p);
			assert.equal(p.item, 'boosterenergy');
			if (passive === 'protosynthesis') battle.field.clearWeather();
			else battle.field.clearTerrain();
			battle.runEvent('Update', p);
			assert.equal(p.item, '');
			assert(p.volatiles[passive]?.fromBooster);
		});
	}
	it('keeps ordinary selected Protosynthesis suppressible on a non-passive holder', () => {
		const [p, q] = setup('Mew', 'Protosynthesis');
		battle.field.setWeather('sunnyday', q);
		const stat = p.volatiles.protosynthesis.bestStat;
		const boosted = p.getStat(stat);
		p.addVolatile('gastroacid', q);
		assert(p.getStat(stat) < boosted);
	});
	it('Quark Drive follows Electric Aura without replacing the underlying field', () => {
		const [p] = setup('Iron Bundle', 'Prankster');
		battle.field.setTerrain('rockyterrain', p);
		battle.field.setAura('electricterrain', 5, p);
		assert(p.volatiles.quarkdrive);
		assert.equal(battle.field.terrain, 'rockyterrain');
		battle.field.clearAura();
		assert(!p.volatiles.quarkdrive);
	});
	it('Armor Tail does not multiply allied Friend Guard or Mist protection', () => {
		const set = ability => ({ species: 'Mew', ability, moves: ['splash', 'tackle'] });
		battle = common.createBattle({ gameType: 'doubles' }, [[{ ...set('Twin Focus'), species: 'Farigiraf' }, set('Friend Guard')], [set('No Ability'), set('No Ability')]]);
		if (battle.requestState === 'teampreview') battle.makeChoices('team 12', 'team 12');
		const p = battle.p1.active[0], q = battle.p2.active[0];
		for (const id of ['mist', 'safeguard', 'luckychant'])p.side.addSideCondition(id, p);
		assert.equal(battle.runEvent('ModifyDamage', q, p, Dex.getActiveMove('tackle'), 1000), 750);
	});
	it('Lunar Orbit exposes Serene Grace without multiplying an already doubled secondary', () => {
		const [p, q] = setup('Mew', 'Lunar Orbit');
		assert(p.hasAbility('serenegrace'));
		const move = Dex.getActiveMove('flamethrower');
		battle.runEvent('ModifyMove', p, q, move, move);
		assert.equal(move.secondaries[0].chance, 20);
	});
	it('Slowking-Galar replaces only Telepathy with Own Tempo', () => {
		assert.deepEqual(Object.values(Dex.species.get('slowkinggalar').abilities), ['Neutralization', 'Own Tempo', 'Regenerator']);
	});
	it('Volt Tackle has no special Electric Terrain multiplier and retains recoil removal', () => {
		const [p, q] = setup('Mew', 'No Ability');
		battle.field.setTerrain('electricterrain', p);
		const volt = Dex.getActiveMove('volttackle'), comparison = Dex.getActiveMove('thunderbolt');
		assert.equal(volt.basePower, 140);
		assert(!volt.onBasePower);
		assert.equal(battle.runEvent('BasePower', p, q, volt, 140, true), battle.runEvent('BasePower', p, q, comparison, 140, true));
		battle.singleEvent('ModifyMove', volt, {}, p, q, volt, volt);
		assert(!volt.recoil);
	});
	it('Farigiraf retains Royal Decree and replaces Gluttony with Armor Tail', () => {
		const species = Dex.species.get('Farigiraf');
		assert.deepEqual(species.passives, ['armortail']);
		assert.deepEqual(Object.values(species.abilities), ['Twin Appetite', 'Twin Focus', 'Royal Decree']);
	});
	it('uses the current counterpart signatures rather than generic substitutes', () => {
		const expected = {
			screamtail: ['Competitive', 'Friend Guard', 'Intimidate'],
			fluttermane: ['Infiltrator', 'Prankster', 'Levitate'],
			slitherwing: ['Cinder Scales', 'Overcoat', 'Tough Claws'],
			sandyshocks: ['Magnet Pull', 'Hydra Bond', 'Sand Force'],
			roaringmoon: ['Intimidate', 'Free Flight', 'Strong Jaw'],
			ironbundle: ['Prankster', 'Evil Santa', 'Slush Rush'],
			ironhands: ['Grit Grappler', 'Sheer Force', 'Iron Fist'],
			ironjugulis: ['Strings of Ruin', 'False Liberation', 'Mega Launcher'],
			ironmoth: ['Cinder Scales', 'Dawn Herald', 'Levitate'],
			ironthorns: ['Sand Stream', 'Mountain Hide', 'Analytic'],
			ironvaliant: ['Void Veil', 'Ruptured Heaven', 'Download'],
		};
		for (const [id, abilities] of Object.entries(expected))assert.deepEqual(Object.values(Dex.species.get(id).abilities), abilities, id);
	});
	it('Iron Thorns gets ordinary five-turn Sand Stream alongside its Quark Drive passive', () => {
		const [p] = setup('Iron Thorns', 'Sand Stream');
		assert.equal(battle.field.weather, 'sandstorm');
		assert.equal(battle.field.weatherState.duration, 5);
		assert(p.hasAbilityOrPassive('quarkdrive'));
		assert(!p.hasAbility('solidrock'));
	});
	it('Sandy Shocks gets Hydra Bond hits while retaining only Protosynthesis as its passive', () => {
		const [p, q] = setup('Sandy Shocks', 'Hydra Bond');
		q.hp = q.maxhp = q.baseMaxhp = 5000;
		battle.actions.useMove(Object.assign(Dex.getActiveMove('thunderbolt'), { willCrit: false, accuracy: true }), p, { target: q });
		assert(battle.log.some(line => line.startsWith('|-hitcount|') && line.endsWith('|3')));
		assert.deepEqual(p.getPassives(), ['protosynthesis']);
	});
	it('Armor Tail reduces damage, disables only its reduction on restricted fields, and blocks priority', () => {
		const [p, q] = setup('Farigiraf', 'Twin Focus');
		const move = Dex.getActiveMove('tackle');
		assert.equal(battle.runEvent('ModifyDamage', q, p, move, 1000), 800);
		battle.field.terrain = 'dragonsdenterrain';
		assert.equal(battle.runEvent('ModifyDamage', q, p, move, 1000), 1000);
		const hp = p.hp;
		battle.actions.useMove('quickattack', q, { target: p });
		assert.equal(p.hp, hp);
	});
	it('Twin Focus ignores only positive defensive stages and only for Psychic damage', () => {
		const [p, q] = setup('Farigiraf', 'Twin Focus');
		battle.randomizer = damage => damage;
		const damage = name => {
			const move = Object.assign(Dex.getActiveMove(name), { willCrit: false });
			battle.singleEvent('ModifyMove', p.getAbility(), p.abilityState, p, q, move, move);
			return battle.actions.getDamage(p, q, move);
		};
		const base = damage('psychic');
		q.boosts.spd = 6;
		assert.equal(damage('psychic'), base);
		const otherBoosted = damage('flamethrower');
		q.boosts.spd = 0;
		assert(damage('flamethrower') > otherBoosted);
		q.boosts.spd = -2;
		assert(damage('psychic') > base);
	});
});
