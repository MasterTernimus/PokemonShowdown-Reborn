'use strict';

const assert = require('assert').strict;
const common = require('../../common');

describe('Future attack queue and RKS Memory audit regressions', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });

	function singles(p1, p2) {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [p1, p2]);
		battle.makeChoices('team 1', 'team 1');
		return battle.p1.active[0];
	}

	function memory(item, moves = ['splash'], foe = {}) {
		return singles([
			{ species: 'Silvally', ability: 'RKS System', item, moves },
		], [{ species: 'Mew', ability: 'No Ability', moves: ['splash'], ...foe }]);
	}

	function watchFutureHits() {
		const hits = [];
		battle.onEvent('Damage', battle.format, (damage, target, source, move) => {
			if (move.flags?.futuremove) hits.push({ turn: battle.turn, id: move.id, source, target });
		});
		return hits;
	}

	for (const attacks of [1, 2, 3]) {
		it(`resolves ${attacks} Temporal Shift casts exactly once each`, () => {
			singles([{ species: 'Xatu', level: 30, ability: 'Temporal Shift', moves: ['psyshock', 'splash'] }],
				[{ species: 'Blissey', ability: 'No Ability', moves: ['splash'] }]);
			const hits = watchFutureHits();
			for (let turn = 1; turn <= 10; turn++) {
				battle.makeChoices(turn <= attacks ? 'move psyshock' : 'move splash', 'move splash');
			}
			assert.equal(hits.length, attacks);
			assert.equal(battle.p2.slotConditions[0].futuremove, undefined);
		});
	}

	it('retains a failed Temporal Shift attack and hits the replacement target', () => {
		singles([{ species: 'Xatu', level: 30, ability: 'Temporal Shift', moves: ['psyshock', 'splash'] }], [
			{ species: 'Umbreon', ability: 'No Ability', moves: ['splash'] },
			{ species: 'Blissey', ability: 'No Ability', moves: ['splash'] },
		]);
		const hits = watchFutureHits();
		battle.makeChoices('move psyshock', 'move splash');
		for (let turn = 2; turn <= 4; turn++) battle.makeChoices('move splash', 'move splash');
		assert.equal(hits.length, 0);
		assert(battle.p2.slotConditions[0].futuremove);
		assert(battle.log.some(line => line.includes('failed to hit and was delayed')));
		battle.makeChoices('move splash', 'switch 2');
		for (let turn = 6; turn <= 8; turn++) battle.makeChoices('move splash', 'move splash');
		assert.equal(hits.length, 1);
		assert.equal(hits[0].target.species.name, 'Blissey');
		assert.equal(battle.p2.slotConditions[0].futuremove, undefined);
	});

	it('keeps queued Roar of Time strikes after another future attack', () => {
		singles([{ species: 'Dialga', level: 20, ability: 'No Ability', moves: ['futuresight', 'roaroftime', 'splash'] }],
			[{ species: 'Blissey', ability: 'No Ability', moves: ['splash'] }]);
		const hits = watchFutureHits();
		battle.makeChoices('move futuresight', 'move splash');
		battle.makeChoices('move roaroftime', 'move splash');
		battle.makeChoices('move 1', 'move splash');
		battle.makeChoices('move splash', 'move splash');
		battle.makeChoices('move roaroftime', 'move splash');
		battle.makeChoices('move 1', 'move splash');
		for (let turn = 7; turn <= 11; turn++) battle.makeChoices('move splash', 'move splash');
		assert.deepEqual(hits.map(hit => hit.id), ['futuresight', 'roaroftime', 'roaroftime']);
		assert.equal(battle.p2.slotConditions[0].futuremove, undefined);
	});

	for (const ability of ['Perfect Foresight', 'Grandmaster']) {
		it(`resolves one capped ${ability} special retaliation independently of Future Sight`, () => {
			singles([{ species: 'Alakazam', ability, moves: ['splash'] }],
				[{ species: 'Blissey', ability: 'No Ability', moves: ['flamethrower', 'splash'] }]);
			let hits = 0;
			battle.onEvent('AfterDamageApplied', battle.format, (damage, target, source, move) => {
				if (move.foresightStored) hits++;
			});
			battle.makeChoices('move splash', 'move flamethrower');
			assert.equal(battle.field.pseudoWeather.foresightmemory.entries.length, 1);
			assert.equal(battle.p2.slotConditions[0].futuremove, undefined);
			for (let turn = 2; turn <= 6; turn++) battle.makeChoices('move splash', 'move splash');
			assert.equal(hits, 1);
			assert.equal(battle.field.pseudoWeather.foresightmemory, undefined);
		});
	}

	it('still removes a completed ordinary Wish slot', () => {
		const holder = singles([{ species: 'Blissey', ability: 'No Ability', moves: ['wish', 'splash'] }],
			[{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }]);
		holder.hp = 1;
		battle.makeChoices('move wish', 'move splash');
		battle.makeChoices('move splash', 'move splash');
		assert.equal(holder.hp, 1 + Math.floor(holder.maxhp / 2));
		assert.equal(battle.p1.slotConditions[0].wish, undefined);
	});

	const memories = {
		Bug: ['tintedlens'], Dark: ['pressure'], Dragon: ['marvelscale'], Electric: ['lightningrod'],
		Fairy: ['mistysurge'], Fighting: ['innerfocus'], Fire: ['flashfire'], Flying: ['windrider'],
		Ghost: ['infiltrator'], Grass: ['hospitality'], Ground: ['eartheater'], Ice: ['thermalexchange'],
		Poison: ['regenerator'], Psychic: ['magicbounce'], Rock: ['purifyingsalt'], Steel: ['swornduty'], Water: ['swiftswim'],
	};
	for (const [type, components] of Object.entries(memories))it('exposes only the current ' + type + ' Memory component and forwards its hooks', () => {
		const holder = memory(type + ' Memory');
		for (const component of components) {
			assert(holder.hasAbility(component), component);
			for (const [event, handler] of Object.entries(battle.dex.abilities.get(component))) if (event.startsWith('on') && typeof handler === 'function')assert.equal(typeof holder.getAbility()[event], 'function', component + '.' + event);
		}
		for (const component of new Set(Object.values(memories).flat()))assert.equal(holder.hasAbility(component), components.includes(component), component);
		assert(!holder.hasAbility('scrappy'));
	});
	it('Fighting Memory blocks flinches without Sheer Force or secondary removal', () => {
		const holder = memory('Fighting Memory', ['flamethrower'], { moves: ['fakeout'] });
		const target = battle.p2.active[0], move = battle.dex.getActiveMove('flamethrower');
		battle.singleEvent('ModifyMove', holder.getAbility(), holder.abilityState, move, holder, target);
		assert(move.secondaries); assert.equal(battle.runEvent('BasePower', holder, target, move, 100), 100);
		battle.makeChoices('move flamethrower', 'move fakeout');
		assert(!battle.log.some(line => line.startsWith('|cant|p1a:') && line.endsWith('|flinch')));
	});
	it('Bug Memory permits ordinary opposing secondaries', () => {
		const holder = memory('Bug Memory'), secondaries = [{ chance: 100, status: 'par' }];
		assert.deepEqual(battle.runEvent('ModifySecondaries', holder, battle.p2.active[0], battle.dex.getActiveMove('thunderbolt'), secondaries), secondaries);
	});
	it('Dark Memory applies Pressure without Intimidate', () => {
		const holder = memory('Dark Memory'), foe = battle.p2.active[0];
		assert.equal(foe.boosts.atk, 0); assert.equal(foe.boosts.def, -1); assert.equal(foe.boosts.spd, -1);
		assert.equal(battle.runEvent('DeductPP', holder, foe), 1);
	});
	it('Dragon Memory supplies Marvel Scale without Tough Claws', () => {
		const holder = memory('Dragon Memory'); assert.equal(battle.runEvent('BasePower', holder, battle.p2.active[0], battle.dex.getActiveMove('tackle'), 100), 100);
		holder.status = 'brn'; assert.equal(battle.runEvent('ModifyDef', holder, null, null, 100), 150);
	});
	it('Water Memory doubles Speed in rain without Water Veil', () => {
		const holder = memory('Water Memory'); battle.field.setWeather('raindance', holder);
		assert.equal(battle.runEvent('ModifySpe', holder, null, null, 100), 200);
		assert(!holder.hasAbility('waterveil')); assert(holder.trySetStatus('brn', battle.p2.active[0]));
	});
	it('Poison Memory recovers on switching without Corrosion', () => {
		const holder = singles([{ species: 'Silvally', ability: 'RKS System', item: 'Poison Memory', moves: ['toxic'] }, { species: 'Mew', ability: 'No Ability', moves: ['splash'] }], [{ species: 'Registeel', ability: 'No Ability', moves: ['splash'] }]);
		battle.makeChoices('move toxic', 'move splash'); assert.equal(battle.p2.active[0].status, '');
		holder.hp = 1; battle.makeChoices('switch 2', 'move splash'); assert.equal(holder.hp, 1 + Math.floor(holder.baseMaxhp / 3));
	});
	it('Psychic Memory bounces Toxic but does not prevent indirect damage', () => {
		const holder = memory('Psychic Memory', ['splash'], { species: 'Chansey', moves: ['toxic'] });
		battle.makeChoices('move splash', 'move toxic'); assert.equal(holder.status, ''); assert.equal(battle.p2.active[0].status, 'tox');
		const hp = holder.hp; assert.equal(battle.damage(20, holder, holder, battle.dex.conditions.get('brn')), 20); assert.equal(holder.hp, hp - 20);
	});
	it('Rock Memory blocks Yawn and direct status', () => {
		const holder = memory('Rock Memory', ['splash'], { moves: ['yawn', 'toxic'] });
		battle.makeChoices('move splash', 'move yawn'); assert(!holder.volatiles.yawn);
		battle.makeChoices('move splash', 'move toxic'); assert.equal(holder.status, '');
	});
	it('held Memory follows form changes and ignores item suppression', () => {
		const holder = memory('Fighting Memory', ['splash'], { ability: 'Neutralizing Gas', moves: ['gastroacid'] });
		holder.formeChange('Silvally-Dark'); battle.field.addPseudoWeather('magicroom', holder);
		assert(holder.ignoringItem()); assert(holder.hasAbility('innerfocus')); assert(!holder.hasAbility('pressure'));
		battle.makeChoices('move splash', 'move gastroacid'); assert(!holder.volatiles.gastroacid); assert(!holder.ignoringAbility());
		assert.equal(holder.addVolatile('flinch'), null);
		holder.setItem('Bug Memory');
		assert(holder.hasAbility('tintedlens'));
		assert(!holder.hasAbility('innerfocus'));
	});
	it('uses Scrappy without a Memory and grants no components to a non-Silvally', () => {
		const holder = memory('Normalium Z'); assert(holder.hasAbility('scrappy')); assert(!holder.hasAbility('innerfocus'));
		const foe = battle.p2.active[0];
		foe.setAbility('RKS System');
		foe.setItem('Fighting Memory');
		assert(!foe.hasAbility('innerfocus'));
		assert(!foe.hasAbility('scrappy'));
	});
});
