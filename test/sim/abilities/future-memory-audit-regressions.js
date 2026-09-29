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

	function doubles(item, attack, foeAbility = 'No Ability') {
		battle = common.createBattle({ formatid: 'gen9nofielddoublesbattle' }, [[
			{ species: 'Silvally', ability: 'RKS System', item, moves: ['splash'] },
			{ species: 'Pelipper', ability: 'No Ability', moves: ['splash'] },
		], [
			{ species: 'Mew', ability: foeAbility, moves: [attack] },
			{ species: 'Mew', ability: 'No Ability', moves: ['splash'] },
		]]);
		battle.makeChoices('team 12', 'team 12');
		return battle.p1.active;
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
		it(`resolves every ${ability} retaliation in the queue`, () => {
			singles([{ species: 'Alakazam', ability, moves: ['splash'] }],
				[{ species: 'Blissey', ability: 'No Ability', moves: ['tackle', 'splash'] }]);
			const hits = watchFutureHits();
			battle.makeChoices('move splash', 'move tackle');
			battle.makeChoices('move splash', 'move tackle');
			assert.equal(battle.p2.slotConditions[0].futuremove.perfectForesightQueued, 2);
			for (let turn = 3; turn <= 8; turn++) battle.makeChoices('move splash', 'move splash');
			assert.equal(hits.length, 2);
			assert.equal(battle.p2.slotConditions[0].futuremove, undefined);
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
		Bug: ['tintedlens', 'shielddust'], Dark: ['pressure', 'intimidate'],
		Dragon: ['marvelscale', 'toughclaws'], Electric: ['transistor', 'lightningrod'],
		Fairy: ['invigorate', 'friendguard'], Fighting: ['innerfocus', 'sheerforce'],
		Fire: ['soulfire', 'flamebody'], Flying: ['galewings', 'airlock'],
		Ghost: ['soulfire', 'cursedbody'], Grass: ['hospitality', 'chlorophyll'],
		Ground: ['sandrush', 'stamina'], Ice: ['icebody', 'slushrush'],
		Poison: ['regenerator', 'corrosion'], Psychic: ['magicbounce', 'magicguard'],
		Rock: ['purifyingsalt', 'solidrock'], Steel: ['swornduty', 'mirrorarmor'],
		Water: ['swiftswim', 'waterveil'],
	};
	for (const [type, components] of Object.entries(memories)) {
		it(`exposes only the ${type} Memory components and forwards every component hook`, () => {
			const holder = memory(`${type} Memory`);
			for (const component of components) {
				assert(holder.hasAbility(component), component);
				for (const [event, handler] of Object.entries(battle.dex.abilities.get(component))) {
					if (event.startsWith('on') && typeof handler === 'function') {
						assert.equal(typeof holder.getAbility()[event], 'function', `${component}.${event}`);
					}
				}
			}
			for (const component of new Set(Object.values(memories).flat())) {
				assert.equal(holder.hasAbility(component), components.includes(component), component);
			}
			assert(!holder.hasAbility('scrappy'));
		});
	}

	it('applies Sheer Force once, keeps the flinch immunity, and preserves a non-Memory control', () => {
		const holder = memory('Fighting Memory', ['flamethrower'], { moves: ['fakeout'] });
		const target = battle.p2.active[0];
		const move = battle.dex.getActiveMove('flamethrower');
		battle.singleEvent('ModifyMove', holder.getAbility(), holder.abilityState, move, holder, target);
		assert(!move.secondaries);
		assert.equal(battle.runEvent('BasePower', holder, target, move, 100), 130);
		battle.makeChoices('move flamethrower', 'move fakeout');
		assert(!battle.log.some(line => line.startsWith('|cant|p1a:') && line.endsWith('|flinch')));
		holder.setItem('Normalium Z');
		const ordinary = battle.dex.getActiveMove('flamethrower');
		battle.singleEvent('ModifyMove', holder.getAbility(), holder.abilityState, ordinary, holder, target);
		assert(ordinary.secondaries);
		assert.equal(battle.runEvent('BasePower', holder, target, ordinary, 100), 100);
	});

	for (const [item, attack] of [['Electric Memory', 'thunderbolt'], ['Fire Memory', 'flamethrower'], ['Ghost Memory', 'shadowball']]) {
		it(`${item} redirects and absorbs ${attack} once`, () => {
			const [holder, ally] = doubles(item, attack);
			battle.makeChoices('move splash, move splash', `move ${attack} 2, move splash`);
			assert.equal(ally.hp, ally.maxhp);
			assert.equal(holder.boosts.spa, 1);
			assert.equal(holder.boosts.atk, 1);
		});
	}

	it('Bug Memory removes opposing secondaries but keeps self effects', () => {
		const holder = memory('Bug Memory');
		const secondaries = [{ chance: 100, status: 'par' }, { chance: 100, self: { boosts: { atk: 1 } } }];
		assert.deepEqual(battle.runEvent('ModifySecondaries', holder, battle.p2.active[0],
			battle.dex.getActiveMove('thunderbolt'), secondaries), [secondaries[1]]);
	});

	it('Dark Memory applies both entry components once with their own ability identity', () => {
		const holder = memory('Dark Memory', ['splash'], { ability: 'Inner Focus' });
		const foe = battle.p2.active[0];
		assert.equal(foe.boosts.atk, 0, 'Inner Focus recognizes Intimidate');
		assert.equal(foe.boosts.def, -1);
		assert.equal(foe.boosts.spd, -1);
		assert.equal(battle.runEvent('DeductPP', holder, foe), 1);
	});

	it('Dragon Memory supplies Tough Claws and Marvel Scale once', () => {
		const holder = memory('Dragon Memory');
		assert.equal(battle.runEvent('BasePower', holder, battle.p2.active[0], battle.dex.getActiveMove('tackle'), 100), 130);
		holder.status = 'brn';
		assert.equal(battle.runEvent('ModifyDef', holder, null, null, 100), 150);
	});

	it('Fairy Memory amplifies healing and protects allies once', () => {
		const [holder, ally] = doubles('Fairy Memory', 'splash');
		ally.hp = 1;
		assert.equal(battle.heal(100, ally, holder), 130);
		assert.equal(battle.runEvent('ModifyDamage', battle.p2.active[0], ally, battle.dex.getActiveMove('tackle'), 100), 75);
	});

	it('Flying Memory suppresses weather only while its holder is active', () => {
		const holder = singles([
			{ species: 'Silvally', ability: 'RKS System', item: 'Flying Memory', moves: ['splash'] },
			{ species: 'Mew', ability: 'No Ability', moves: ['splash'] },
		], [{ species: 'Mew', ability: 'No Ability', moves: ['raindance', 'splash'] }]);
		battle.makeChoices('move splash', 'move raindance');
		assert.equal(battle.field.weather, 'raindance');
		assert.equal(battle.field.effectiveWeather(), '');
		assert.equal(battle.runEvent('ModifyPriority', holder, battle.p2.active[0], battle.dex.getActiveMove('airslash'), 0), 1);
		battle.makeChoices('switch 2', 'move splash');
		assert.equal(battle.field.effectiveWeather(), 'raindance');
		battle.makeChoices('switch 2', 'move splash');
		assert.equal(battle.field.effectiveWeather(), '');
	});

	for (const [item, weather] of [['Grass Memory', 'sunnyday'], ['Ground Memory', 'sandstorm'], ['Ice Memory', 'hail'], ['Water Memory', 'raindance']]) {
		it(`${item} supplies its weather speed component once`, () => {
			const holder = memory(item);
			battle.field.setWeather(weather);
			assert.equal(battle.runEvent('ModifySpe', holder, null, null, 100), 200);
		});
	}

	it('Ground Memory applies Stamina once per turn while healing each hit', () => {
		const holder = memory('Ground Memory');
		holder.hp = 1;
		for (let hit = 0; hit < 2; hit++) {
			battle.runEvent('DamagingHit', holder, battle.p2.active[0], battle.dex.getActiveMove('tackle'), 1);
		}
		assert.equal(holder.boosts.def, 1);
		assert.equal(holder.hp, 1 + 2 * Math.floor(holder.baseMaxhp / 16));
	});

	it('Ice Memory adds Ice Body weather healing to the core RKS recovery once', () => {
		const holder = memory('Ice Memory');
		holder.hp = 1;
		battle.field.setWeather('hail', holder);
		battle.makeChoices('move splash', 'move splash');
		assert.equal(holder.hp, 1 + 2 * Math.floor(holder.baseMaxhp / 16));
	});

	it('Poison Memory can poison Steel through Corrosion and heals when switching out', () => {
		const holder = singles([
			{ species: 'Silvally', ability: 'RKS System', item: 'Poison Memory', moves: ['toxic'] },
			{ species: 'Mew', ability: 'No Ability', moves: ['splash'] },
		], [{ species: 'Registeel', ability: 'No Ability', moves: ['splash'] }]);
		battle.makeChoices('move toxic', 'move splash');
		assert.equal(battle.p2.active[0].status, 'tox');
		holder.hp = 1;
		battle.makeChoices('switch 2', 'move splash');
		assert.equal(holder.hp, 1 + Math.floor(holder.baseMaxhp / 3));
	});

	it('Psychic Memory bounces Toxic and blocks indirect damage', () => {
		const holder = memory('Psychic Memory', ['splash'], { moves: ['toxic'] });
		battle.makeChoices('move splash', 'move toxic');
		assert.equal(holder.status, '');
		assert.equal(battle.p2.active[0].status, 'tox');
		assert.equal(battle.damage(20, holder, holder, battle.dex.conditions.get('brn')), false);
	});

	it('Rock Memory blocks Yawn and direct status through Purifying Salt', () => {
		const holder = memory('Rock Memory', ['splash'], { moves: ['yawn', 'toxic'] });
		battle.makeChoices('move splash', 'move yawn');
		assert(!holder.volatiles.yawn);
		battle.makeChoices('move splash', 'move toxic');
		assert.equal(holder.status, '');
	});

	it('Steel Memory reflects a drop once and recognizes another Mirror Armor holder', () => {
		const holder = memory('Steel Memory', ['splash'], { ability: 'Mirror Armor', moves: ['growl'] });
		battle.makeChoices('move splash', 'move growl');
		assert.equal(holder.boosts.atk, 0);
		assert.equal(battle.p2.active[0].boosts.atk, -1);
	});

	it('Water Memory installs Aqua Ring and prevents burns', () => {
		const holder = memory('Water Memory', ['splash'], { moves: ['willowisp'] });
		assert(holder.volatiles.aquaring);
		battle.makeChoices('move splash', 'move willowisp');
		assert.equal(holder.status, '');
	});

	it('retains the held Memory through form changes, Magic Room, and intrinsic suppression immunity', () => {
		const holder = memory('Fighting Memory', ['splash'], { ability: 'Neutralizing Gas', moves: ['gastroacid'] });
		holder.formeChange('Silvally-Dark');
		battle.field.addPseudoWeather('magicroom', holder);
		assert(holder.ignoringItem());
		assert.equal(holder.species.id, 'silvallydark');
		assert(holder.hasAbility('sheerforce'));
		assert(!holder.hasAbility('pressure'));
		battle.makeChoices('move splash', 'move gastroacid');
		assert(!holder.volatiles.gastroacid);
		assert(!holder.ignoringAbility());
		assert.equal(holder.addVolatile('flinch'), null);
		holder.setItem('Bug Memory');
		assert(holder.hasAbility('shielddust'));
		assert(!holder.hasAbility('sheerforce'));
	});

	it('uses Scrappy without a Memory and grants no components to a non-Silvally', () => {
		const holder = memory('Normalium Z');
		assert(holder.hasAbility('scrappy'));
		assert(!holder.hasAbility('innerfocus'));
		const move = battle.dex.getActiveMove('tackle');
		battle.singleEvent('ModifyMove', holder.getAbility(), holder.abilityState, move, holder, battle.p2.active[0]);
		assert.equal(move.ignoreImmunity.Normal, true);
		const foe = battle.p2.active[0];
		foe.setAbility('RKS System');
		foe.setItem('Fighting Memory');
		assert(!foe.hasAbility('sheerforce'));
		assert(!foe.hasAbility('scrappy'));
	});
});
