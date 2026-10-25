'use strict';
const assert = require('assert').strict;
const common = require('../../common');
let battle;
const mon = (species, ability, extra = {}) => ({ species, ability, moves: ['splash'], ...extra });
describe("Mind's Eye Illusion revelation", () => {
	afterEach(() => { battle?.destroy(); battle = null; });
	for (const disguise of ['Illusion', 'Perfect Illusion']) {
		for (const first of ['holder', 'disguise']) it(`${disguise}: reveals with ${first} entering first`, () => {
			const h = [mon('Mew', "Mind's Eye"), mon('Pikachu', 'No Ability')];
			const d = [mon('Zoroark', disguise), mon('Mew', 'No Ability'), mon('Pikachu', 'Static')];
			battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [h, d]);
			battle.makeChoices(first === 'holder' ? 'team 12' : 'team 21', first === 'holder' ? 'team 213' : 'team 123');
			if (first === 'holder') battle.makeChoices('move splash', 'switch 2');
			else battle.makeChoices('switch 2', 'move splash');
			const z = battle.p2.active[0];
			assert.equal(z.species.id, 'zoroark');
			assert.equal(z.illusion, null);
			assert(!z.volatiles.illusioncopy);
			assert.equal(z.ability, disguise === 'Illusion' ? 'illusion' : 'perfectillusion');
			const before = battle.log.filter(x => x.includes('|-end|') && x.endsWith('|Illusion')).length;
			battle.makeChoices('move splash', 'move splash');
			assert.equal(battle.log.filter(x => x.includes('|-end|') && x.endsWith('|Illusion')).length, before);
		});
	}
	it('reveals opposing disguises, not its own ally, in doubles', () => {
		battle = common.createBattle({ formatid: 'gen9doublesrockyfield' }, [[mon('Mew', "Mind's Eye"), mon('Zoroark', 'Illusion'), mon('Pikachu', 'Static')], [mon('Zoroark', 'Perfect Illusion'), mon('Zoroark-Hisui', 'Illusion'), mon('Mew', 'No Ability')]]);
		battle.makeChoices('team 123', 'team 123');
		assert(battle.p1.active[1].illusion);
		for (const p of battle.p2.active) { assert.equal(p.illusion, null); assert(!p.volatiles.illusioncopy); }
	});
	it('does not reveal while selected ability is suppressed, then reveals when restored', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[mon('Mew', "Mind's Eye")], [mon('Mew', 'No Ability'), mon('Zoroark', 'Perfect Illusion'), mon('Pikachu', 'Static')]]);
		battle.makeChoices('team 1', 'team 123');
		const h = battle.p1.active[0]; h.addVolatile('gastroacid');
		battle.makeChoices('move splash', 'switch 2');
		const z = battle.p2.active[0]; assert(z.illusion);
		h.removeVolatile('gastroacid'); battle.singleEvent('Start', h.getAbility(), h.abilityState, h);
		assert.equal(z.illusion, null); assert.equal(z.ability, 'perfectillusion');
	});
	it('inherits revelation through Aevian Ascendance', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[mon('Mew', 'Aevian Ascendance')], [mon('Zoroark', 'Perfect Illusion'), mon('Pikachu', 'Static')]]);
		battle.makeChoices('team 1', 'team 12');
		assert.equal(battle.p2.active[0].illusion, null);
	});
	it('supports a species passive provider', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[mon('Mew', 'No Ability')], [mon('Zoroark', 'Perfect Illusion'), mon('Pikachu', 'Static')]]);
		const holder = battle.p1.pokemon[0]; holder.species = { ...holder.species, passives: ['mindseye'] }; holder.baseSpecies = holder.species;
		battle.makeChoices('team 1', 'team 12'); assert.equal(battle.p2.active[0].illusion, null);
	});

	it('respects ongoing Neutralizing Gas and reveals when its holder leaves', () => {
		battle = common.createBattle({ formatid: 'gen9doublesrockyfield' }, [[mon('Mew', "Mind's Eye"), mon('Weezing', 'Neutralizing Gas'), mon('Pikachu', 'Static')], [mon('Mew', 'No Ability'), mon('Mew', 'No Ability'), mon('Zoroark', 'Opportunist'), mon('Pikachu', 'Static')]]);
		battle.makeChoices('team 123', 'team 1234');
		battle.makeChoices('move splash, move splash', 'switch 3, move splash');
		assert(battle.p1.active[0].ignoringAbility());
		assert(battle.p2.active[0].illusion);
		battle.makeChoices('move splash, switch 3', 'move splash, move splash');
		assert.equal(battle.p2.active[0].illusion, null);
	});
});
