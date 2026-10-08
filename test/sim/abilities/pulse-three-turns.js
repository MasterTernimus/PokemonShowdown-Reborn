'use strict';
const assert = require('assert').strict, common = require('../../common');
let battle;
function setup(species, ability, item = '') {
	battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[{ species: 'Mew', ability: 'No Ability', item, moves: ['splash'] }, { species: 'Mew', ability: 'No Ability', moves: ['splash'] }], [{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }]]);
	battle.makeChoices('team 12', 'team 1');
	const p = battle.p1.active[0];
	p.formeChange(species);
	p.setAbility(ability);
	return p;
}
describe('PULSE fields last exactly three turns', () => {
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});
	const setters = [['Muk-Pulse', 'Pulse Waste', 'swampterrain'], ['Hypno-Pulse', 'Nightmare Pulse', 'hauntedterrain'], ['Mr. Mime-Pulse', 'Pulse Bulwark', 'shortcircuitterrain'], ['Swalot-Pulse', 'Pulse Filtration', 'murkwatersurfaceterrain'], ['Camerupt-Pulse', 'Pulse Eruption', 'superheatedterrain'], ['Magnezone-Pulse', 'Pulse Triad', 'factoryterrain'], ['Avalugg-Pulse', 'Pulse Blockade', 'snowymountainterrain']];
	for (const [species, ability, field] of setters)
		for (const item of ['', 'Amplifield Rock'])
			it(species + ' field expires after three turns with ' + (item || 'no item'), () => {
				const p = setup(species, ability, item);
				assert.equal(battle.field.terrain, field);
				assert.equal(battle.field.terrainState.duration, 3);
				assert(!battle.field.terrainState.permanent);
				// Fixed Pulse moves are irrelevant to the timer: use a neutral move via the engine's turn choices.
				p.moveSlots = [{ move: 'Splash', id: 'splash', pp: 40, maxpp: 40, target: 'self', disabled: false, used: false }];
				battle.makeRequest('move');
				for (let i = 0; i < 3; i++)
					battle.makeChoices('move splash', 'move splash');
				assert.notEqual(battle.field.terrain, field);
				battle.singleEvent('Start', p.getAbility(), p.abilityState, p);
				assert.notEqual(battle.field.terrain, field);
			});
	for (const [species, ability, field] of setters)
		it(species + ' refreshes an existing field to three without a second attempt', () => {
			const p = setup(species, 'No Ability', 'Amplifield Rock');
			battle.field.setTerrain(field, p);
			battle.field.setTerrainDuration(8);
			p.setAbility(ability);
			assert.equal(battle.field.terrainState.duration, 3);
			battle.field.setTerrainDuration(1);
			battle.singleEvent('Start', p.getAbility(), p.abilityState, p);
			assert.equal(battle.field.terrainState.duration, 1);
		});
	it('Swalot underwater conversion uses three turns independently of its spent entry attempt', () => {
		const p = setup('Swalot-Pulse', 'Pulse Filtration', 'Amplifield Rock');
		battle.field.setTerrain('underwaterterrain', p);
		assert.equal(battle.field.terrain, 'murkwatersurfaceterrain');
		assert.equal(battle.field.terrainState.duration, 3);
	});
	for (const [species, ability] of [['Torterra-Rift', 'Mountain Rift'], ['Torterra-Rift-Shatter', 'Desert Rift'], ['Hippowdon-Rift', 'Rift Eater'], ['Lilligant-Rift', 'Rift Dancer']])
		it(ability + ' retains its normal field duration', () => {
			setup(species, ability);
			assert.notEqual(battle.field.terrainState.duration, 3);
		});
	it('ordinary terrain moves by a Pulse holder retain normal five/eight turn rules', () => {
		const p = setup('Muk-Pulse', 'No Ability', 'Amplifield Rock');
		battle.field.clearTerrain();
		battle.actions.useMove('electricterrain', p);
		assert.equal(battle.field.terrainState.duration, 8);
	});
});
