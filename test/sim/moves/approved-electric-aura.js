'use strict';
const assert = require('assert').strict;
const common = require('../../common');
let battle;
function setup(base = 'rockyterrain', item = '') {
	battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
		{ species: 'Mew', ability: 'No Ability', item, moves: ['iondeluge', 'plasmafists', 'gravity', 'splash'] },
	], [{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }]]);
	battle.makeChoices('team 1', 'team 1');
	if (base) battle.field.startTerrain(base); else battle.field.terrain = '';
	const [p, t] = [battle.p1.active[0], battle.p2.active[0]];
	p.hp = p.maxhp = t.hp = t.maxhp = 4000;
	battle.randomizer = x => x;
	return [p, t];
}
function use(id, p, t) { battle.clearActiveMove(); battle.actions.runMove(id, p, ['iondeluge', 'gravity'].includes(id) ? 0 : 1, { externalMove: true }); }
describe('Approved Ion Deluge and Plasma Fists Aura provenance', () => {
	afterEach(() => { battle?.destroy(); });
	for (const move of ['iondeluge', 'plasmafists']) {
		for (const [item, turns] of [['', 3], ['Amplifield Rock', 5]]) {
			for (const base of ['', 'rockyterrain']) it(move + ' creates only an Aura on ' + (base || 'empty field') + ' for ' + turns, () => {
				const [p, t] = setup(base, item), state = battle.field.terrainState;
				use(move, p, t);
				assert.equal(battle.field.terrain, base);
				assert.equal(battle.field.terrainState, state);
				assert.equal(battle.field.auraField, 'electricterrain');
				assert.equal(battle.field.auraTurns, turns);
				assert(battle.field.auraState.noTerrainPromotion);
				assert(battle.field.pseudoWeather.iondeluge, 'Normal conversion is retained');
				for (let i = 1; i < turns; i++) { battle.field.tickAura(); assert.equal(battle.field.auraField, 'electricterrain'); }
				battle.field.tickAura(); assert.equal(battle.field.auraField, '');
			});
		}
		for (const previous of ['grassyterrain', 'electricterrain']) it(move + ' replaces/refreshes ' + previous + ' without promotion', () => {
			const [p, t] = setup();
			battle.field.setAura(previous, 8, p, battle.dex.moves.get(previous));
			use(move, p, t);
			assert.equal(battle.field.terrain, 'rockyterrain');
			assert.equal(battle.field.auraField, 'electricterrain');
			assert.equal(battle.field.auraTurns, 3);
			assert.equal(battle.field.auraState.sourceEffect.id, move);
			assert.equal(battle.field.promoteAura(p, battle.dex.moves.get('gravity')), false);
		});
		it(move + ' remains non-promotable after same-Aura refresh from another source', () => {
			const [p, t] = setup(); use(move, p, t);
			assert(battle.field.setAura('electricterrain', 5, p, battle.dex.moves.get('electricterrain')));
			assert(battle.field.auraState.noTerrainPromotion);
			assert.equal(battle.field.terrain, 'rockyterrain');
			for (const trigger of ['gravity', 'lunarorbit', 'gmaxgravitas']) assert.equal(battle.field.promoteAura(p, battle.dex.moves.get(trigger)), false);
			use('gravity', p, t); assert.equal(battle.field.terrain, 'rockyterrain');
		});
		it(move + ' refreshes duration after the other approved move without promotion', () => {
			const [p, t] = setup(); use(move === 'iondeluge' ? 'plasmafists' : 'iondeluge', p, t);
			battle.field.tickAura(); p.setItem('Amplifield Rock'); use(move, p, t);
			assert.equal(battle.field.auraTurns, 5); assert.equal(battle.field.terrain, 'rockyterrain');
		});
		it(move + ' never falls back to Terrain when Auras are disabled', () => {
			const [p, t] = setup(''); battle.field.aurasEnabled = false; const hp = t.hp;
			use(move, p, t);
			assert.equal(battle.field.terrain, ''); assert.equal(battle.field.auraField, '');
			assert(battle.field.pseudoWeather.iondeluge);
			if (move === 'plasmafists') assert(t.hp < hp);
		});
		for (const field of ['newworldterrain', 'underwaterterrain', 'midnightzoneterrain', 'dragonsdenterrain', 'flowergarden2', 'electricterrain']) {
			it(move + ' preserves existing Aura restriction on ' + field, () => {
				const [p, t] = setup(field); use(move, p, t);
				assert.equal(battle.field.terrain, field); assert.equal(battle.field.auraField, '');
			});
		}
	}
	it('clears provenance on removal/replacement and preserves ordinary promotion and duration', () => {
		const [p, t] = setup(); use('iondeluge', p, t);
		battle.field.setAura('grassyterrain', 5, p, battle.dex.moves.get('grassyterrain'));
		assert(!battle.field.auraState.noTerrainPromotion);
		battle.field.setAura('electricterrain', 5, p, battle.dex.moves.get('electricterrain'));
		assert(battle.field.promoteAura(p, battle.dex.moves.get('gravity')));
		assert.equal(battle.field.terrain, 'electricterrain'); assert.equal(battle.field.terrainState.duration, 5);
	});
	it('preserves ordinary Electric Terrain generation on an empty field', () => {
		const [p] = setup('', 'Amplifield Rock');
		assert(battle.field.setTerrain('electricterrain', p, battle.dex.moves.get('electricterrain')));
		assert.equal(battle.field.terrain, 'electricterrain'); assert.equal(battle.field.terrainState.duration, 8);
	});
	it('retains existing Cold Eclipse timer pause without allowing promotion', () => {
		const [p, t] = setup('coldeclipseterrain'); use('iondeluge', p, t);
		for (let i = 0; i < 6; i++) battle.field.tickAura();
		assert.equal(battle.field.auraTurns, 3);
		battle.field.changeTerrain('rockyterrain', p); battle.field.tickAura();
		assert.equal(battle.field.auraTurns, 2); assert.equal(battle.field.promoteAura(p, battle.dex.moves.get('gravity')), false);
	});
	it('Plasma Fists does not create an Aura on Protect or immunity', () => {
		const [p, t] = setup(); t.addVolatile('protect'); use('plasmafists', p, t);
		assert.equal(battle.field.auraField, '');
		t.removeVolatile('protect'); t.setType('Ground'); use('plasmafists', p, t);
		assert.equal(battle.field.auraField, '');
	});
});
