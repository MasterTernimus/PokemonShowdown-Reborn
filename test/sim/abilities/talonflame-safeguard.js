'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const {Dex, TeamValidator} = require('../../../dist/sim');
const {abilityIncludesComponent} = require('../../../dist/data/ability-components');

describe('Talonflame passive swap and Safeguard support coverage', () => {
	let battle;
	afterEach(() => battle?.destroy());
	it('makes Safeguard legal for every Invigorate holder and the explicitly requested species', () => {
		const validator = TeamValidator.get('gen9nofieldsinglesgame@@@Obtainable Moves');
		const holders = Dex.species.all().filter(s => [...Object.values(s.abilities), ...(s.passives || [])]
			.some(a => abilityIncludesComponent(a, 'invigorate')));
		assert(holders.length >= 33);
		for (const species of [...holders, ...['mawile', 'mawilemega', 'floetteeternal', 'florges', 'florgesreborn'].map(id => Dex.species.get(id))]) {
			assert.equal(validator.checkCanLearn(Dex.moves.get('safeguard'), species), null, species.name);
		}
	});
	it('swaps exactly one selected slot and one passive', () => {
		const species = Dex.species.get('talonflame');
		assert.deepEqual(species.passives, ['galewings']);
		assert.deepEqual(species.abilities, {0: 'Open Sky', 1: 'Scorch Sweep', H: 'Flame Body', S: 'Burning Quake'});
	});
	for (const ability of ['Open Sky', 'Flame Body', 'Gale Wings']) it(`Gale Wings adds priority once with ${ability}, including suppression`, () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
			[{species: 'Talonflame', ability, moves: ['bravebird', 'flamethrower']}],
			[{species: 'Mew', ability: 'No Ability', moves: ['splash']}],
		]);
		battle.makeChoices();
		const p = battle.p1.active[0], q = battle.p2.active[0];
		const priority = id => battle.runEvent('ModifyPriority', p, q, Dex.getActiveMove(id), 0);
		assert.equal(priority('bravebird'), 1);
		assert.equal(priority('flamethrower'), 0);
		p.addVolatile('gastroacid');
		assert.equal(priority('bravebird'), 1);
		p.hp = Math.floor(p.maxhp / 2);
		assert.equal(priority('bravebird'), 0);
		assert.deepEqual(p.getPassives(), ['galewings']);
	});
});
