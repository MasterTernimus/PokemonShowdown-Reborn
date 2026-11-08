'use strict';

const assert = require('../../assert');
const common = require('../../common');
let battle;

function setup(species = 'Mew', ability = 'No Ability', teraType = 'Dragon') {
	battle = common.createBattle([[
		{ species, ability, teraType, moves: ['splash', 'watergun', 'psychic', 'tackle'] },
		{ species: 'Mew', ability: 'No Ability', moves: ['splash'] },
	], [{ species: 'Mew', ability: 'No Ability', moves: ['splash', 'watergun', 'soak'] }]]);
	battle.randomizer = n => n;
	const p = battle.p1.active[0], q = battle.p2.active[0];
	for (const mon of [p, q]) {
		mon.hp = mon.maxhp = mon.baseMaxhp = 10000;
		for (const stat of ['atk', 'def', 'spa', 'spd', 'spe']) mon.storedStats[stat] = 200;
	}
	return [p, q];
}

function damage(p, q, id, extra = {}) {
	return battle.actions.getDamage(p, q, Object.assign(battle.dex.getActiveMove(id), { willCrit: false }, extra));
}

describe('Reborn Terastallization', () => {
	afterEach(() => { battle?.destroy(); battle = null; });

	it('forces Stellar for ordinary Pokemon and preserves their defensive types', () => {
		const [p] = setup('Ampharos', 'No Ability', 'Dragon');
		assert.equal(p.canTerastallize, 'Stellar');
		battle.makeChoices('move splash terastallize', 'move splash');
		assert.equal(p.terastallized, 'Stellar');
		assert.deepEqual(p.getTypes(), ['Electric']);
		assert(p.volatiles.stellarhealing);
	});

	it('preserves Stellar and its original typing through a real switch out and back', () => {
		const [p] = setup('Ampharos', 'No Ability', 'Dragon');
		battle.makeChoices('move splash terastallize', 'move splash');
		battle.makeChoices('switch 2', 'move splash');
		assert.equal(p.terastallized, 'Stellar');
		battle.makeChoices('switch 2', 'move splash');
		assert.equal(battle.p1.active[0], p);
		assert.deepEqual(p.getTypes(), ['Electric']);
		assert(p.volatiles.stellarhealing);
	});

	it('retains ordinary 1.5x STAB rather than giving same-type Stellar attacks 2x', () => {
		const [p, q] = setup();
		const ordinary = damage(p, q, 'psychic');
		battle.actions.terastallize(p);
		assert.equal(damage(p, q, 'psychic'), ordinary);
		p.stellarBoostedTypes.push('Psychic');
		assert.equal(damage(p, q, 'psychic'), ordinary);
		p.terastallized = '';
		p.setType('Normal');
		assert(ordinary > damage(p, q, 'psychic'));
	});

	it('uses the current underlying type after Soak, including after Stellar activates', () => {
		const [p, q] = setup();
		battle.actions.useMove('soak', q, { target: p });
		assert.deepEqual(p.getTypes(), ['Water']);
		const water = damage(p, q, 'surf');
		battle.actions.terastallize(p);
		assert.deepEqual(p.getTypes(), ['Water']);
		assert.equal(damage(p, q, 'surf'), water);
		// The former Psychic typing no longer grants STAB.
		const psychic = damage(p, q, 'psychic');
		p.stellarBoostedTypes.push('Psychic');
		assert(psychic > damage(p, q, 'psychic'));
	});

	it('uses restored species typing after Disguise changes its form while Stellar', () => {
		const [p, q] = setup('Mimikyu', 'Disguise', 'Water');
		battle.actions.useMove('soak', q, { target: p });
		assert.deepEqual(p.getTypes(), ['Water']);
		battle.actions.terastallize(p);
		battle.actions.useMove('watergun', q, { target: p });
		assert.equal(p.species.id, 'mimikyubusted');
		assert.equal(p.terastallized, 'Stellar');
		assert.deepEqual(p.getTypes(), ['Ghost', 'Fairy']);
		const stellarGhost = damage(p, q, 'shadowball');
		p.terastallized = '';
		assert.equal(damage(p, q, 'shadowball'), stellarGhost);
	});

	for (const id of ['nuzzle', 'peck', 'leafage']) {
		it(id + ' gets the 60 BP floor only while its Stellar type boost is available', () => {
			const [p, q] = setup();
			battle.actions.terastallize(p);
			const move = battle.dex.moves.get(id);
			assert.equal(damage(p, q, id), damage(p, q, id, { basePower: 60 }));
			p.stellarBoostedTypes.push(move.type);
			assert(damage(p, q, id) < damage(p, q, id, { basePower: 60 }));
		});
	}

	it('does not give priority moves a 60 BP floor, but retains Technician power', () => {
		const [p, q] = setup();
		battle.actions.terastallize(p);
		const plain = damage(p, q, 'bulletpunch');
		const power60 = damage(p, q, 'bulletpunch', { basePower: 60 });
		assert(plain < power60);
		p.setAbility('Technician');
		assert.equal(damage(p, q, 'bulletpunch'), power60);
	});

	it('does not give variable-power Water Spout a 60 BP floor', () => {
		const [p, q] = setup();
		p.hp = 2000;
		const base = damage(p, q, 'waterspout');
		battle.actions.terastallize(p);
		// 150 BP at full HP becomes 30 BP at one fifth HP.
		assert.bounded(damage(p, q, 'waterspout'), [Math.floor(base * 1.2) - 1, Math.floor(base * 1.2) + 1]);
		assert(damage(p, q, 'waterspout') < damage(p, q, 'waterspout', { basePower: 60, basePowerCallback: undefined }));
	});

	it('does not apply Adaptability to Stellar STAB or its coverage boost', () => {
		const [p, q] = setup();
		const ordinary = damage(p, q, 'psychic');
		p.setAbility('Adaptability');
		assert(damage(p, q, 'psychic') > ordinary);
		battle.actions.terastallize(p);
		assert.equal(damage(p, q, 'psychic'), ordinary);
		const coverage = damage(p, q, 'surf');
		p.setAbility('No Ability');
		assert.equal(damage(p, q, 'surf'), coverage);
		p.stellarBoostedTypes.push('Psychic', 'Water');
		const spent = damage(p, q, 'surf');
		p.setAbility('Adaptability');
		assert.equal(damage(p, q, 'surf'), spent);
		assert.equal(damage(p, q, 'psychic'), ordinary);
	});

	it('retains the Ogerpon mask-type exception', () => {
		const [p] = setup('Ogerpon', 'Defiant', 'Grass');
		assert.equal(p.canTerastallize, 'Grass');
		battle.actions.terastallize(p);
		assert.equal(p.terastallized, 'Grass');
		assert.equal(p.species.id, 'ogerpontealtera');
		assert.deepEqual(p.getTypes(), ['Grass']);
		assert(!p.volatiles.stellarhealing);
	});

	it('allows hacked Mega and Ultra forms to use Stellar while retaining their types', () => {
		battle = common.createBattle({formatid: 'gen9purehackmons@@@!teampreview'}, [[
			{ species: 'Mewtwo-Mega-X', moves: ['splash'], teraType: 'Fairy' },
		], [{ species: 'Necrozma-Ultra', moves: ['splash'], teraType: 'Normal' }]]);
		const p = battle.p1.active[0], q = battle.p2.active[0];
		const pTypes = p.getTypes(), qTypes = q.getTypes();
		battle.makeChoices('move splash terastallize', 'move splash terastallize');
		assert.equal(p.terastallized, 'Stellar'); assert.equal(q.terastallized, 'Stellar');
		assert.deepEqual(p.getTypes(), pTypes); assert.deepEqual(q.getTypes(), qTypes);
	});
});
