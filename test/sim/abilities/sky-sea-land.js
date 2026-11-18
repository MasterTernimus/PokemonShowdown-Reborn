'use strict';
const assert = require('node:assert/strict');
const common = require('../../common');
const { Dex } = require('../../../dist/sim');

describe('Sea, land, sky and the Eon pair', () => {
	let battle;
	afterEach(() => battle?.destroy());
	const mon = (species = 'Mew', ability = 'No Ability') => ({ species, ability, moves: ['splash'] });
	function start(species, ability, doubles = false) {
		battle = common.createBattle({ gameType: doubles ? 'doubles' : 'singles' }, [
			[mon(species, ability), mon(), mon()], [mon(), mon(), mon()],
		]);
		for (const side of battle.sides) {
			for (const p of side.pokemon) p.hp = p.maxhp = p.baseMaxhp = 1600;
		}
		return [battle.p1.active[0], battle.p2.active[0]];
	}
	function hit(user, foe, id, overrides = {}) {
		const move = Object.assign(Dex.getActiveMove(id), { damage: 20, accuracy: true, willCrit: false }, overrides);
		battle.actions.useMove(move, user, { target: foe });
		battle.clearActiveMove();
	}
	it('Kyogre restores the two damaged allies only once even when Origin Pulse hits two opponents', () => {
		const [p, foe] = start('Kyogre', 'Trench Current', true);
		const ally = p.allies()[0];
		p.hp = ally.hp = 800;
		hit(p, foe, 'originpulse');
		assert.deepEqual([p.hp, ally.hp], [1000, 1000]);
		hit(p, foe, 'originpulse');
		assert.deepEqual([p.hp, ally.hp], [1000, 1000]);
	});
	it('Groudon reserves its Defense gift for a damaging enemy hit, and ability replacement cannot duplicate it', () => {
		const [p, foe] = start('Groudon', 'Mantle Fracture', true);
		const ally = p.allies()[0];
		hit(p, ally, 'mudshot');
		assert.equal(p.boosts.def, 0);
		foe.addVolatile('protect');
		hit(p, foe, 'mudshot');
		assert.equal(p.boosts.def, 0);
		foe.removeVolatile('protect');
		hit(p, foe, 'precipiceblades');
		assert.deepEqual([p.boosts.def, ally.boosts.def], [1, 1]);
		p.setAbility('No Ability');
		p.setAbility('Mantle Fracture');
		hit(p, foe, 'mudshot');
		assert.equal(p.boosts.def, 1);
		p.setAbility('Trench Current');
		p.hp = 600;
		hit(p, foe, 'waterpulse');
		assert.equal(p.hp, 800, 'acquiring the sea ability gives its own first Water hit');
	});
	it('Rayquaza clears only positive offensive stages, once per switch-in', () => {
		const [p, foe] = start('Rayquaza', 'Jetstream');
		hit(p, foe, 'airslash');
		foe.setBoost({ atk: 2, spa: -1, def: 2 });
		hit(p, foe, 'airslash');
		assert.deepEqual([foe.boosts.atk, foe.boosts.spa, foe.boosts.def], [0, -1, 2]);
		foe.setBoost({ spa: 3 });
		hit(p, foe, 'airslash');
		assert.equal(foe.boosts.spa, 3);
		battle.makeChoices('switch 2', 'move splash');
		battle.makeChoices('switch 2', 'move splash');
		hit(p, foe, 'airslash');
		assert.equal(foe.boosts.spa, 0);
	});
	for (const [ability, signature, coverage, other] of [
		['Abyssal Deluge', 'originpulse', 'icebeam', 'thunder'],
		['Continental Rupture', 'precipiceblades', 'firepunch', 'rockslide'],
		['Stratospheric Force', 'dragonascent', 'dragonclaw', 'extremespeed'],
	]) it(ability + ' gives its two types 1.2x power and only its signature pierces boosts', () => {
		const [p, foe] = start('Mew', ability);
		for (const id of [signature, coverage, other]) {
			const m = Dex.getActiveMove(id);
			battle.runEvent('ModifyMove', p, foe, m, m);
			assert.equal(!!m.ignorePositiveDefensive, id === signature, id);
			assert.equal(battle.runEvent('BasePower', p, foe, m, 100), id === other ? 100 : 120, id);
		}
	});
	it('Latias sets Light Screen on an opposing Psychic hit and shares its entry budget with Mega Latias', () => {
		const [p, foe] = start('Latias', 'Mistwing Veil');
		hit(p, foe, 'dragonpulse');
		assert(!p.side.getSideCondition('lightscreen'));
		hit(p, foe, 'mistball');
		assert(p.side.getSideCondition('lightscreen'));
		p.side.removeSideCondition('lightscreen');
		p.formeChange('Latias-Mega', Dex.items.get('Latiasite'), true);
		hit(p, foe, 'dragonpulse');
		assert(!p.side.getSideCondition('lightscreen'));
		const m = Dex.getActiveMove('mistball');
		battle.runEvent('ModifyMove', p, foe, m, m);
		assert.equal(m.secondaries.find(s => s.boosts?.spa === -1).chance, 100);
		assert.equal(Dex.moves.get('mistball').secondaries[0].chance, 50);
	});
	it('Latios breaks screens only after a successful hit; Mega Latios empowers Luster Purge', () => {
		const [p, foe] = start('Latios', 'Mistwing Lance');
		hit(p, foe, 'psychic');
		foe.side.addSideCondition('reflect', foe);
		foe.side.addSideCondition('lightscreen', foe);
		foe.addVolatile('protect');
		hit(p, foe, 'lusterpurge');
		assert(foe.side.getSideCondition('lightscreen'));
		foe.removeVolatile('protect');
		hit(p, foe, 'lusterpurge');
		assert(!foe.side.getSideCondition('reflect'));
		assert(!foe.side.getSideCondition('lightscreen'));
		foe.side.addSideCondition('reflect', foe);
		hit(p, foe, 'psychic');
		assert(foe.side.getSideCondition('reflect'));
		p.formeChange('Latios-Mega', Dex.items.get('Latiosite'), true);
		for (const id of ['lusterpurge', 'dragonpulse', 'surf']) {
			const m = Dex.getActiveMove(id);
			battle.runEvent('ModifyMove', p, foe, m, m);
			assert.equal(!!m.ignoreScreens, id !== 'surf');
			assert.equal(!!m.ignorePositiveDefensive, id === 'lusterpurge');
			if (id === 'lusterpurge') assert.equal(m.secondaries.find(s => s.boosts?.spd === -1).chance, 100);
		}
	});
});
