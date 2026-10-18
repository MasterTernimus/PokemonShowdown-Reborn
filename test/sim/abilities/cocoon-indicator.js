'use strict';
const assert = require('assert').strict;
const common = require('../../common');

describe('Silken Decoy Cocoon indicator', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });
	function setup() {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
			[{species: 'Ariados', ability: 'Insomnia', item: 'Aridiate', moves: ['splash']},
				{species: 'Mew', ability: 'No Ability', moves: ['splash']}],
			[{species: 'Mew', ability: 'No Ability', moves: ['splash', 'tackle', 'willowisp']},
				{species: 'Mew', ability: 'No Ability', moves: ['splash']}],
		]);
		battle.makeChoices('team 12', 'team 12');
		assert(!battle.p1.active[0].volatiles.cocoonactive);
		battle.makeChoices('move splash mega', 'move splash');
		return battle.p1.active[0];
	}
	it('appears on Mega evolution, stays through blocked status, and ends when spent', () => {
		const p = setup();
		assert(p.volatiles.cocoonactive);
		assert.equal(p.ability, 'silkendecoy');
		battle.eachEvent('Update'); battle.eachEvent('Update');
		assert.equal(battle.log.filter(l => l.includes('|-start|') && l.includes('|cocoonactive|')).length, 1);
		battle.makeChoices('move splash', 'move willowisp');
		assert(p.volatiles.cocoonactive);
		assert.equal(p.status, '');
		battle.makeChoices('move splash', 'move tackle');
		assert(!p.volatiles.cocoonactive);
		assert(!p.m.silkenDecoyCocoon);
		assert.equal(battle.log.filter(l => l.includes('|-end|') && l.includes('|cocoonactive|')).length, 1);
	});
	it('restores an intact marker after switching, without creating a new cocoon', () => {
		const p = setup();
		battle.makeChoices('switch 2', 'move splash');
		assert(!p.volatiles.cocoonactive);
		battle.makeChoices('switch 2', 'move splash');
		assert(p.volatiles.cocoonactive);
		assert.equal(battle.log.filter(l => l.includes('spun a protective cocoon')).length, 1);
	});
	it('keeps a spent marker off after switching and restores it on another faint', () => {
		const p = setup();
		battle.makeChoices('move splash', 'move tackle');
		battle.makeChoices('switch 2', 'move splash');
		battle.makeChoices('switch 2', 'move splash');
		assert(!p.volatiles.cocoonactive);
		battle.p2.active[0].faint(); battle.faintMessages();
		assert(p.m.silkenDecoyCocoon);
		assert(p.volatiles.cocoonactive);
	});
	it('hides during suppression and ability loss without consuming the cocoon', () => {
		const p = setup();
		p.addVolatile('gastroacid'); battle.eachEvent('Update');
		assert(!p.volatiles.cocoonactive);
		assert(p.m.silkenDecoyCocoon);
		p.removeVolatile('gastroacid'); battle.eachEvent('Update');
		assert(p.volatiles.cocoonactive);
		p.setAbility('No Ability'); battle.eachEvent('Update');
		assert(!p.volatiles.cocoonactive);
		assert(p.m.silkenDecoyCocoon);
		assert(battle.dex.conditions.get('cocoonactive').noCopy);
	});
});
