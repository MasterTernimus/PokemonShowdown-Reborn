'use strict';

const assert = require('node:assert/strict');
const common = require('../../common');
const { Dex } = require('../../../dist/sim');
const { FormSignatures } = require('../../../dist/data/form-signatures');
const { StoneSignatures } = require('../../../dist/data/stone-signatures');

const routes = {
	...Object.fromEntries(Object.entries(FormSignatures).filter(([form]) => form.includes('mega'))),
	...StoneSignatures,
	skarmorymega: { base: 'steelwing', name: 'Gilded Wing' },
	victreebelmega: { base: 'powerwhip', name: 'Snare Vine' },
	empoleonmegax: { base: 'wavecrash', name: 'Crown Crash' },
	golisopodmega: { base: 'firstimpression', name: 'F.M. Impression' },
	golisopodaevianmega: { base: 'firstimpression', name: 'F.M. Impression' },
};

describe('Adaptive Mega signatures', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });

	for (const [form, route] of Object.entries(routes)) {
		it(form + ' resolves ' + route.name + ' using current stats only after converting', () => {
			const mega = Dex.species.get(form);
			const signature = Dex.moves.get(route.name);
			const base = Dex.moves.get(route.base);
			assert(!base.flags.megasignature);
			if (signature.category === 'Status') {
				assert(!signature.flags.adaptivecategory);
				return;
			}
			assert.equal(signature.flags.adaptivecategory, 1);
			assert.equal(signature.flags.megasignature, 1);
			assert.match(signature.desc, /Uses the higher/);
			const origin = Dex.species.get(Array.isArray(mega.battleOnly) ? mega.battleOnly[0] : mega.battleOnly || mega.baseSpecies);
			battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [
				[{ species: origin.name, ability: origin.abilities[0], moves: [route.base] }],
				[{ species: 'Blissey', ability: 'No Ability', moves: ['splash'] }],
			]);
			battle.makeChoices('team 1', 'team 1');
			const user = battle.p1.active[0], foe = battle.p2.active[0];
			user.formeChange(mega.name, Dex.items.get(mega.requiredItem || origin.requiredItem || ''), true);
			user.maxhp = user.baseMaxhp = user.hp = 10000;
			foe.maxhp = foe.baseMaxhp = foe.hp = 10000;
			const physicalStat = signature.overrideOffensiveStat === 'def' ? 'def' : 'atk';
			user.storedStats[physicalStat] = user.storedStats.spa = 250;
			for (const [stage, expected] of [[0, signature.category], [2, 'Physical'], [-2, 'Special']]) {
				user.clearBoosts();
				user.boosts[physicalStat] = stage;
				battle.actions.useMove(route.base, user, { target: foe });
				const move = user.lastMoveUsed;
				assert.equal(move.name, signature.name);
				assert.equal(move.category, expected);
				assert.equal(move.overrideOffensiveStat, expected === 'Physical' ? physicalStat : 'spa');
				battle.clearActiveMove();
			}
		});
	}

	it('leaves base, retired and Battle Bond routes on their original category rules', () => {
		for (const id of ['dragonpulse', 'muddywater', 'steelwing', 'sacredrush', 'apexcleave', 'shadowshuriken', 'pouchpunch', 'quadpress']) {
			assert(!Dex.moves.get(id).flags.megasignature, id);
		}
	});

	for (const [form, targetType, bestType] of [
		['Golisopod-Mega', 'Fairy', 'Steel'], ['Golisopod-Aevian-Mega', 'Poison', 'Ground'],
	]) {
		for (const slot of ['firstimpression', 'fmimpression']) {
			it(form + ' selects the stronger type on ' + slot + ' with a special build', () => {
				const mega = Dex.species.get(form);
				battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [
					[{ species: mega.battleOnly, ability: 'No Ability', moves: [slot] }],
					[{ species: 'Blissey', ability: 'No Ability', moves: ['splash'] }],
				]);
				battle.makeChoices('team 1', 'team 1');
				const user = battle.p1.active[0], target = battle.p2.active[0];
				user.formeChange(mega.name, Dex.items.get(mega.requiredItem), true);
				user.storedStats.spa = user.storedStats.atk + 100;
				target.setType(targetType);
				battle.actions.useMove(slot, user, { target });
				assert.equal(user.lastMoveUsed.type, bestType);
				assert.equal(user.lastMoveUsed.category, 'Special');
				assert(target.hp < target.maxhp);
			});
		}
	}
});
