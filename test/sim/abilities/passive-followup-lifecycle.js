'use strict';
const assert = require('assert').strict, common = require('../../common'), { Dex } = require('../../../dist/sim');
const { getAbilityDisplayComponents } = require('../../../dist/data/ability-display');
let battle;
function setup(species, ability, disguise = 'Chansey') {
	const mon = (species, ability = 'No Ability') => ({ species, ability, moves: ['splash', 'tackle', 'earthquake', 'transform'], item: 'Leftovers' });
	battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[mon(species, ability), mon('Clefable'), mon(disguise)], [mon('Clefable'), mon('Chansey')]]);
	battle.makeChoices('team 123', 'team 12');
	battle.field.terrain = '';
	battle.randomChance = () => false;
	return [battle.p1.active[0], battle.p2.active[0]];
}
function use(id, source, target, extra = {}) {
	const m = Object.assign(Dex.getActiveMove(id), { accuracy: true, willCrit: false }, extra);
	battle.actions.useMove(m, source, { target });
	battle.clearActiveMove();
}
describe('Approved passive copy lifecycle and component replacements', () => {
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});
	it('Illusion copies disguise Levitate before damage and restores actual passives on reveal', () => {
		const [p, t] = setup('Raichu', 'Illusion', 'Rotom');
		assert.deepEqual(p.getPassives(), ['levitate']);
		assert.equal(p.ability, 'noability');
		const hp = p.hp;
		use('earthquake', t, p);
		assert.equal(p.hp, hp);
		assert(p.illusion);
		use('tackle', t, p);
		assert(!p.illusion);
		assert.deepEqual(p.getPassives(), ['static']);
		assert.equal(p.ability, 'illusion');
	});
	it('copied passives survive suppression and do not allow Transform while concealed', () => {
		const [p, t] = setup('Raichu', 'Illusion', 'Rotom');
		p.addVolatile('gastroacid');
		assert.deepEqual(p.getPassives(), ['levitate']);
		assert(!p.transformInto(t));
		assert(!t.transformInto(p));
		const hp = p.hp;
		use('earthquake', t, p);
		assert.equal(p.hp, hp);
	});
	it('switching and faint cleanup discard the disguise passive identity', () => {
		const [p, t] = setup('Raichu', 'Illusion', 'Rotom');
		battle.makeChoices('switch 2', 'move splash');
		assert(!p.illusion);
		assert.deepEqual(p.getPassives(), ['static']);
		battle.makeChoices('switch 2', 'move splash');
		assert(p.illusion);
		p.faint();
		battle.faintMessages();
		assert(!p.illusion);
		assert.deepEqual(p.getPassives(), ['static']);
	});
	it('disguise without passives masks the actual passive without public identity leakage', () => {
		const [p] = setup('Raichu', 'Illusion', 'Chansey');
		assert.deepEqual(p.getPassives(), []);
		assert(!battle.log.some(l => l.startsWith('|switch|p1') && /Raichu|Static/.test(l)));
	});
	it('Lanturn Illuminate has its full Mirror Arena effect once with Abyss Lure', () => {
		const [p, t] = setup('Lanturn', 'Abyss Lure');
		battle.field.setTerrain('mirrorarenaterrain', p);
		t.boosts.accuracy = 0;
		battle.runEvent('SwitchIn', p);
		assert.equal(t.boosts.accuracy, -1);
		assert(!p.hasAbility('illuminate'));
		assert(p.hasAbilityOrPassive('illuminate'));
	});
	it('ordinary and equivalent Alt Lanturn share the approved Suction Cups replacement', () => {
		const [p, t] = setup('Lanturn', 'Abyss Lure');
		assert(p.hasAbility('suctioncups'));
		use('roar', t, p);
		assert(!p.forceSwitchFlag);
		p.formeChange('Lanturn-Alt');
		assert(p.hasAbility('suctioncups'));
		assert(!p.hasAbility('illuminate'));
		assert(p.hasAbilityOrPassive('illuminate'));
	});
	it('Orchard Bond protects the approved holder item but preserves Alolan Harvest', () => {
		const [p, t] = setup('Exeggutor', 'Orchard Bond');
		assert(p.hasAbility('stickyhold'));
		use('knockoff', t, p, { basePower: 1 });
		assert.equal(p.item, 'leftovers');
		p.formeChange('Exeggutor-Alola');
		assert(!p.hasAbility('stickyhold'));
		assert(p.hasAbility('harvest'));
	});
	it('contextual Includes shows replacements only for the approved holders', () => {
		assert(getAbilityDisplayComponents('orchardbond', ['harvest']).includes('stickyhold'));
		assert(!getAbilityDisplayComponents('orchardbond', ['harvest']).includes('harvest'));
		assert(!getAbilityDisplayComponents('orchardbond').includes('stickyhold'));
		assert(getAbilityDisplayComponents('abysslure', ['illuminate']).includes('suctioncups'));
	});
	it('Wooly Conductor lowers opposing contact Speed once per turn without duplicate Static rolls', () => {
		const [p, t] = setup('Ampharos', 'No Ability');
		p.formeChange('Ampharos-Mega');
		p.setAbility('Wooly Conductor');
		let rolls = 0;
		battle.randomChance = (n, d) => {
			if (n === 3 && d === 10)
				rolls++;
			return false;
		};
		use('tackle', t, p, { basePower: 1 });
		use('tackle', t, p, { basePower: 1 });
		assert.equal(t.boosts.spe, -1);
		assert.equal(rolls, 0);
		battle.fieldEvent('Residual');
		use('tackle', t, p, { basePower: 1 });
		assert.equal(t.boosts.spe, -2);
	});
});
