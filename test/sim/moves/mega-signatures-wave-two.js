'use strict';

const assert = require('node:assert/strict');
const common = require('../../common');
const { Dex, TeamValidator } = require('../../../dist/sim');
const { MegaSignaturesWaveTwo } = require('../../../dist/data/mega-signatures-wave-two');

describe('Mega signatures for Heatran through Breloom', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });

	function start(id) {
		const route = MegaSignaturesWaveTwo[id];
		const mega = Dex.species.get(id);
		const set = (species, moves = ['splash']) => ({ species, ability: 'No Ability', moves });
		battle = common.createBattle({ formatid: 'gen9nofielddoublesbattle' }, [
			[set(mega.baseSpecies, [route.base]), set('Mew'), set('Mewtwo')],
			[set('Mew', ['tackle', 'protect']), set('Slowbro')],
		]);
		battle.makeChoices('team 123', 'team 12');
		const [user, ally] = battle.p1.active;
		const [foe, other] = battle.p2.active;
		user.formeChange(mega.name, Dex.items.get(mega.requiredItem), true);
		user.setAbility('No Ability');
		for (const p of [user, ally, foe, other]) p.maxhp = p.baseMaxhp = p.hp = 4000;
		battle.randomizer = value => value;
		return { user, ally, foe, other };
	}

	function use(id, user, target) {
		battle.actions.useMove(id, user, { target });
		battle.clearActiveMove();
		return user.lastMoveUsed;
	}

	for (const [form, { base, name, num }] of Object.entries(MegaSignaturesWaveTwo)) {
		it(form + ' can legally convert ' + base + ' without changing ordinary move data or PP', () => {
			const mega = Dex.species.get(form);
			const validator = new TeamValidator('gen9nofieldsinglesgame@@@Obtainable Abilities,Obtainable Moves');
			for (const origin of [].concat(mega.battleOnly || mega.baseSpecies)) {
				const species = Dex.species.get(origin);
				assert.equal(validator.validateTeam([{ species: species.name, item: mega.requiredItem,
					ability: species.abilities[0], moves: [base], evs: { hp: 252, spe: 252 } }]), null, species.name);
			}
			const { user } = start(form);
			assert.equal(user.getMoves()[0].id, base);
			assert.equal(user.getMoves()[0].move, name);
			const m = Dex.moves.get(name), regular = Dex.moves.get(base);
			assert.equal(m.num, num);
			assert(m.flags.megasignature && m.flags.adaptivecategory);
			assert(!regular.flags.megasignature);
			assert.equal(m.pp, regular.pp);
		});
	}

	it('Breloom-Rejuv can Mega Evolve through its stone and use Spore Jab on the same turn', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [
			[{ species: 'Breloom-Rejuv', ability: 'Aevian Spark', item: 'Breloomite', moves: ['machpunch'] }],
			[{ species: 'Blissey', ability: 'No Ability', moves: ['splash'] }],
		]);
		battle.makeChoices('team 1', 'team 1');
		const user = battle.p1.active[0];
		assert.equal(user.species.id, 'breloomrejuv');
		battle.makeChoices('move 1 mega', 'move splash');
		assert.equal(user.species.id, 'breloommega');
		assert.equal(user.lastMoveUsed.name, 'Spore Jab');
	});

	it('Crucible Coil gains accuracy only at positive Defense and still traps', () => {
		const { user, foe } = start('heatranmega');
		battle.randomChance = () => true;
		assert.equal(use('magmastorm', user, foe).accuracy, 75);
		user.boosts.def = 1;
		assert.equal(use('magmastorm', user, foe).accuracy, 90);
		assert(foe.volatiles.partiallytrapped);
		user.boosts.def = -1;
		assert.equal(use('magmastorm', user, foe).accuracy, 75);
	});

	it('Temple Toll sounds through Substitute, blocks healing for two turns and cures team confusion', () => {
		const { user, ally, foe } = start('chimechomega');
		user.addVolatile('confusion', foe);
		ally.addVolatile('confusion', foe);
		foe.addVolatile('protect', foe);
		use('extrasensory', user, foe);
		assert(ally.volatiles.confusion && !foe.volatiles.healblock);
		foe.removeVolatile('protect');
		foe.addVolatile('substitute', foe);
		const doll = foe.volatiles.substitute.hp;
		const m = use('extrasensory', user, foe);
		assert(m.flags.sound && m.flags.bypasssub);
		assert.equal(foe.volatiles.substitute.hp, doll);
		assert(foe.hp < 4000);
		assert(!user.volatiles.confusion && !ally.volatiles.confusion);
		assert.equal(foe.volatiles.healblock.duration, 2);
	});

	it('Olive Press transfers exactly one drain, including Big Root and healing from a Substitute', () => {
		const { user, ally, foe } = start('arbolivamega');
		user.hp = ally.hp = 1000;
		const before = foe.hp;
		assert.deepEqual(use('gigadrain', user, foe).drain, [3, 4]);
		assert.equal(ally.hp - 1000, Math.round((before - foe.hp) * 3 / 4));
		assert.equal(user.hp, 1000);
		ally.hp = 2500;
		battle.field.clearTerrain();
		assert.deepEqual(use('gigadrain', user, foe).drain, [1, 2]);
		assert(user.hp > 1000);
		assert.equal(ally.hp, 2500);
		ally.hp = 1000;
		ally.setItem('bigroot');
		foe.addVolatile('substitute', foe);
		const hp = foe.hp, subHP = foe.volatiles.substitute.hp;
		use('gigadrain', user, foe);
		const subDamage = subHP - foe.volatiles.substitute.hp;
		assert(subDamage > 0);
		assert.equal(foe.hp, hp);
		assert(ally.hp - 1000 > subDamage / 2);
	});

	it('Olive Press respects Liquid Ooze and does not transfer the same drain twice', () => {
		const { user, ally, foe } = start('arbolivamega');
		user.hp = ally.hp = 2000;
		foe.setAbility('liquidooze');
		use('gigadrain', user, foe);
		assert.equal(user.hp, 2000);
		assert(ally.hp < 2000);
	});

	it('Seal Breaker grounds a Flying foe but cannot ground it through Protect or a Substitute', () => {
		const { user, foe } = start('golurkmega');
		foe.setType('Flying');
		foe.addVolatile('protect', foe);
		use('shadowpunch', user, foe);
		assert(!foe.isGrounded());
		foe.removeVolatile('protect');
		foe.addVolatile('substitute', foe);
		use('shadowpunch', user, foe);
		assert(!foe.isGrounded());
		foe.removeVolatile('substitute');
		const m = use('shadowpunch', user, foe);
		assert.equal(m.accuracy, true);
		assert(foe.isGrounded());
	});

	it('Pond Circuit spares the ally and drains both foes, keeping Electric Terrain’s drain', () => {
		const { user, ally, foe, other } = start('belliboltmega');
		user.hp = 1000;
		const m = use('paraboliccharge', user, foe);
		assert.equal(m.target, 'allAdjacentFoes');
		assert.equal(ally.hp, 4000);
		assert(foe.hp < 4000 && other.hp < 4000);
		assert.equal(user.hp - 1000, Math.round((4000 - foe.hp) / 4) + Math.round((4000 - other.hp) / 4));
		battle.field.setTerrain('electricterrain', user);
		assert.deepEqual(use('paraboliccharge', user, foe).drain, [3, 4]);
	});

	it('Rail Rush waives recoil on an already hit foe, excludes allied damage and resets next turn', () => {
		const { user, ally, foe, other } = start('luxraymega');
		use('tackle', other, foe);
		const m = use('wildcharge', user, foe);
		assert.deepEqual(m.recoil, [1, 4]);
		assert(user.hp < 4000);
		use('tackle', ally, foe);
		const hp = user.hp;
		assert(!use('wildcharge', user, foe).recoil);
		assert.equal(user.hp, hp);
		battle.makeChoices('auto', 'auto');
		foe.addVolatile('substitute', foe);
		use('tackle', ally, foe);
		foe.removeVolatile('substitute');
		assert.deepEqual(use('wildcharge', user, foe).recoil, [1, 4]);
		battle.field.setTerrain('electricterrain', user);
		assert(!use('wildcharge', user, other).recoil);
	});

	it('Polar Prism needs a hit on Water, uses a fixed three-turn Mist even in hail, and rearms on entry', () => {
		const { user, foe } = start('aurorusmega');
		battle.field.setWeather('hail', user);
		use('freezedry', user, foe);
		assert(!user.side.sideConditions.mist);
		foe.setType('Water');
		foe.addVolatile('substitute', foe);
		use('freezedry', user, foe);
		assert(!user.side.sideConditions.mist);
		foe.removeVolatile('substitute');
		use('freezedry', user, foe);
		assert.equal(user.side.sideConditions.mist.duration, 3);
		user.side.removeSideCondition('mist');
		use('freezedry', user, foe);
		assert(!user.side.sideConditions.mist);
		const bench = user.side.pokemon[2];
		battle.actions.switchIn(bench, 0);
		battle.actions.runSwitch(bench);
		battle.actions.switchIn(user, 0);
		battle.actions.runSwitch(user);
		use('freezedry', user, foe);
		assert.equal(user.side.sideConditions.mist.duration, 3);
	});

	it('Crown Rend is Dragon-type and increases power against positive Defense only', () => {
		const { user, foe } = start('tyrantrummega');
		const m = use('dragonclaw', user, foe);
		assert.equal(m.type, 'Dragon');
		assert(!m.secondaries?.length);
		assert.equal(m.basePowerCallback.call(battle, user, foe, m), 80);
		foe.boosts.spd = 2;
		assert.equal(m.basePowerCallback.call(battle, user, foe, m), 80);
		foe.boosts.def = 1;
		assert.equal(m.basePowerCallback.call(battle, user, foe, m), 100);
	});

	it('Horn Salvo needs three HP hits on the same foe and removes both screens after the volley', () => {
		const { user, foe } = start('heracrossmega');
		const side = foe.side;
		side.addSideCondition('reflect', foe);
		side.addSideCondition('lightscreen', foe);
		battle.randomChance = () => true;
		foe.addVolatile('substitute', foe);
		foe.volatiles.substitute.hp = 4000;
		use('pinmissile', user, foe);
		assert(side.sideConditions.reflect && side.sideConditions.lightscreen);
		foe.removeVolatile('substitute');
		use('pinmissile', user, foe);
		assert(!side.sideConditions.reflect && !side.sideConditions.lightscreen);
		const hp = battle.log.findLastIndex(line => line.startsWith('|-damage|p2a:'));
		const screen = battle.log.findIndex(line => line.startsWith('|-sideend|p2:') && line.includes('Reflect'));
		assert(hp >= 0 && screen > hp);
	});

	it('Spore Jab keeps +1 priority and ignores defensive boosts only against a poisoned foe', () => {
		const { user, foe } = start('breloommega');
		foe.boosts.def = foe.boosts.spd = 4;
		const base = use('machpunch', user, foe);
		assert.equal(base.priority, 1);
		assert(!base.ignorePositiveDefensive);
		for (const status of ['psn', 'tox']) {
			foe.setStatus(status);
			assert(use('machpunch', user, foe).ignorePositiveDefensive);
			foe.cureStatus();
		}
	});
});
