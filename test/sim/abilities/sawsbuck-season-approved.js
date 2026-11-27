'use strict';
const assert = require('assert').strict,
	common = require('../../common'),
	{ Dex } = require('../../../dist/sim');
let battle;
const names = ['sawsbuck', 'sawsbuckspring', 'sawsbucksummer', 'sawsbuckautumn', 'sawsbuckwinter'];
function setup(ability = 'Swift Swim') {
	const s = (species, ability) => ({ species, ability, moves: ['tackle', 'splash'] });
	battle = common.createBattle({ gameType: 'singles' }, [
		[s('Sawsbuck', ability), s('Mew', 'No Ability')],
		[s('Mew', 'No Ability'), s('Mew', 'No Ability')],
	]);
	battle.field.terrain = '';
	return battle.p1.active[0];
}
function season(p, weather) {
	battle.field.weather = weather;
	battle.runEvent('Residual', p);
}
describe('Approved Sawsbuck seasonal slots', () => {
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});
	it('exact passive and winter corrected slots', () => {
		for (const id of names) {
			assert.deepEqual(Dex.species.get(id).passives, ['seasonalstride']);
			assert.equal(Dex.species.get(id).abilities[0], (Dex.species.get(id).forme || 'Spring') + ' Striker');
		}
		assert.deepEqual(Dex.species.get('sawsbuckwinter').abilities, {
			0: 'Winter Striker',
			1: 'Slush Rush',
			H: 'Ice Body',
		});
	});
	for (const [ability, expected] of [
		['Spring Striker', ['summerstriker', 'autumnstriker', 'winterstriker', 'springstriker']],
		['Swift Swim', ['chlorophyll', 'sandrush', 'slushrush', 'swiftswim']],
		['Sap Sipper', ['rockhead', 'stamina', 'icebody', 'sapsipper']],
	])
		it('keeps chosen slot ' + ability, () => {
			const p = setup(ability);
			for (const [i, w] of ['sunnyday', 'sandstorm', 'snow', 'raindance'].entries()) {
				season(p, w);
				assert.equal(p.ability, expected[i]);
				assert.equal(
					p.species.id,
					['sawsbucksummer', 'sawsbuckautumn', 'sawsbuckwinter', 'sawsbuckspring'][i]
				);
			}
			assert(battle.log.some(l => l.startsWith('|-formechange|')));
		});
	it('keeps passive Overcoat when its selectable ability is suppressed', () => {
		const p = setup('Sap Sipper'), foe = battle.p2.active[0];
		p.addVolatile('gastroacid');
		p.setType('Normal');
		assert(p.hasAbilityOrPassive('overcoat'));
		for (const type of ['powder', 'hail', 'sandstorm']) assert.equal(p.runStatusImmunity(type), false, type);
		battle.actions.useMove('spore', foe, { target: p });
		assert.equal(p.status, '');
		foe.setAbility('Mold Breaker');
		battle.actions.useMove('spore', foe, { target: p });
		assert.equal(p.status, 'slp');
	});
	it('changes its kick and absorption package with the season', () => {
		const p = setup('Spring Striker'), foe = battle.p2.active[0];
		for (const [weather, component, move] of [
			['raindance', 'waterabsorb', 'watergun'], ['sunnyday', 'flashfire', 'ember'],
			['sandstorm', 'eartheater', 'mudshot'], ['snow', 'iceabsorb', 'icebeam'],
		]) {
			season(p, weather);
			assert(p.hasAbility(component), component);
			assert(p.hasAbility('striker'));
			const kick = Dex.getActiveMove('doublekick');
			assert.equal(battle.runEvent('BasePower', p, foe, kick, 100), 140);
			const hp = p.hp = Math.floor(p.maxhp / 2);
			battle.actions.useMove(move, foe, { target: p });
			if (component === 'flashfire') {
				assert(p.volatiles.flashfire);
				assert.equal(p.hp, hp);
				assert.equal(battle.runEvent('ModifyAtk', p, foe, Dex.getActiveMove('flamewheel'), 100), 150);
			} else {
				assert(!p.volatiles.flashfire);
				assert.equal(p.hp, hp + Math.floor(p.baseMaxhp / 4));
			}
		}
	});
	it('no weather retains season; external ability survives cycling and restores mapped slot on entry', () => {
		const p = setup();
		season(p, 'sunnyday');
		p.setAbility('Intimidate');
		season(p, 'snow');
		assert.equal(p.ability, 'intimidate');
		assert.equal(p.baseAbility, 'slushrush');
		season(p, '');
		assert.equal(p.species.id, 'sawsbuckwinter');
		battle.actions.switchIn(p.side.pokemon[1], 0);
		battle.actions.switchIn(p, 0);
		battle.actions.runSwitch(p);
		assert.equal(p.ability, 'slushrush');
		assert.equal(p.species.id, 'sawsbuckwinter');
	});
	it('doubles Speed only once after the weather slot becomes Chlorophyll', () => {
		const p = setup();
		season(p, 'sunnyday');
		const speed = () => battle.runEvent('ModifySpe', p, null, null, 100);
		assert.equal(speed(), 200);
		battle.field.weather = '';
		assert.equal(speed(), 100);
		battle.field.terrain = 'flowergarden4';
		assert.equal(speed(), 200);
		p.addVolatile('gastroacid');
		assert.equal(speed(), 100);
	});
	it('suppression retains passive cycle but clears stale Flash Fire', () => {
		const p = setup();
		season(p, 'sunnyday');
		p.addVolatile('flashfire');
		p.addVolatile('gastroacid');
		season(p, 'snow');
		assert.equal(p.ability, 'slushrush');
		assert(!p.volatiles.flashfire);
		assert(p.volatiles.gastroacid);
	});
	it('Transform does not season-cycle', () => {
		const p = setup(),
			q = battle.p2.active[0];
		q.transformInto(p);
		season(q, 'sunnyday');
		assert.equal(q.species.id, 'sawsbuck');
	});
	it('conversion remains without a kicking bonus; sun does not grant passive Speed', () => {
		const p = setup('Spring Striker'),
			q = battle.p2.active[0];
		p.addVolatile('gastroacid');
		const m = Dex.getActiveMove('megakick');
		battle.runEvent('ModifyType', p, q, m, m);
		assert.equal(m.type, 'Water');
		assert.equal(battle.runEvent('BasePower', p, q, m, 100), 120);
		battle.field.weather = 'sunnyday';
		assert.equal(battle.runEvent('ModifySpe', p, null, null, 100), 100);
		assert.equal(p.hasAbilityOrPassive('chlorophyll'), false);
		battle.field.weather = '';
		battle.field.terrain = 'forestterrain';
		assert.equal(battle.runEvent('ModifySpe', p, null, null, 100), 100);
	});
});

describe('Sawsbuck seasonal coverage limits', () => {
	const { TeamValidator } = require('../../../dist/sim');
	const validator = TeamValidator.get('gen9nofieldsinglesgame');
	for (const id of names)
		it(id + ' cannot regain removed coverage through shared learnsets', () => {
			const species = Dex.species.get(id);
			for (const move of [
				'aquajet',
				'aquastep',
				'flipturn',
				'blazekick',
				'firelash',
				'heatcrash',
				'iceshard',
				'iciclespear',
				'tripleaxel',
				'earthquake',
			])
				assert(validator.checkCanLearn(Dex.moves.get(move), species), id + ': ' + move);
			for (const move of [
				'hornleech',
				'liquidation',
				'waterfall',
				'flareblitz',
				'highhorsepower',
				'icespinner',
				'iciclecrash',
			])
				assert.equal(validator.checkCanLearn(Dex.moves.get(move), species), null, id + ': ' + move);
		});
});

describe('Seasonal Stride no longer includes the kicking boost', () => {
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});
	for (const species of names)
		it(species + ' retains conversion without Striker', () => {
			battle = common.createBattle({ gameType: 'singles' }, [
				[{ species, ability: Dex.species.get(species).abilities[1], moves: ['splash'] }],
				[{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }],
			]);
			battle.field.terrain = '';
			const p = battle.p1.active[0],
				q = battle.p2.active[0];
			assert.equal(p.hasAbilityOrPassive('striker'), false);
			const kick = Dex.getActiveMove('megakick');
			battle.runEvent('ModifyType', p, q, kick, kick);
			assert.equal(battle.runEvent('BasePower', p, q, kick, 100), 120);
			assert.equal(battle.runEvent('BasePower', p, q, Dex.getActiveMove('doublekick'), 100), 100);
			assert(!/kicks|kicking|Striker/i.test(Dex.abilities.get('seasonalstride').desc));
		});
});
