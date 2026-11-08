'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;

// Compare controlled battles, rather than upstream damage ranges tied to old stats.
function futureDamage(options = {}) {
	battle?.destroy();
	battle = common.createBattle([[
		{ species: options.species || (options.flying ? 'Xatu' : 'Mew'), ability: options.ability || 'No Ability', item: options.item || '', moves: ['futuresight', 'splash', 'kingsshield'] },
		{ species: 'Mew', ability: 'No Ability', moves: ['splash'] },
	], [{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }]]);
	battle.randomizer = n => n; battle.randomChance = (n, d) => n >= d;
	const source = battle.p1.active[0], target = battle.p2.active[0];
	source.setType(options.flying ? ['Psychic', 'Flying'] : ['Psychic']);
	for (const side of battle.sides) for (const p of side.pokemon) p.hp = p.maxhp = p.baseMaxhp = 5000;
	if (options.initialTerrain) battle.field.setTerrain('psychicterrain', source);
	battle.makeChoices('move futuresight', 'move splash');
	if (options.spa) source.storedStats.spa = options.spa;
	if (options.boost !== undefined) source.boosts.spa = options.boost;
	if (options.clearTerrain) battle.field.clearTerrain();
	if (options.finalTerrain) battle.field.setTerrain('psychicterrain', source);
	if (options.screen) target.side.addSideCondition('lightscreen', target);
	const waitMove = options.shield ? 'move kingsshield' : options.item === 'Choice Specs' && !options.switched ? 'move futuresight' : 'move splash';
	battle.makeChoices(options.switched ? 'switch 2' : waitMove, 'move splash');
	const before = target.hp;
	battle.makeChoices(waitMove, 'move splash');
	if (options.species === 'Aegislash') assert.equal(source.species.name, options.shield ? 'Aegislash' : 'Aegislash-Blade');
	return before - target.hp;
}

describe('Future Sight', function () {
	afterEach(function () {
		battle?.destroy();
		battle = null;
	});

	it(`should damage in two turns, ignoring Protect, affected by Dark immunities`, function () {
		battle = common.createBattle([[
			{species: 'Sneasel', moves: ['sleeptalk', 'futuresight']},
		], [
			{species: 'Girafarig', moves: ['sleeptalk', 'futuresight', 'protect']},
		]]);

		const sneasel = battle.p1.active[0];
		const girafarig = battle.p2.active[0];
		battle.makeChoices('move futuresight', 'move futuresight');
		assert.fullHP(girafarig);
		battle.makeChoices();
		assert.fullHP(girafarig);
		battle.makeChoices('auto', 'move protect');
		assert.fullHP(sneasel);
		assert.false.fullHP(girafarig);
	});

	it(`should fail when already active for the target's position`, function () {
		battle = common.createBattle([[
			{species: 'Sneasel', moves: ['sleeptalk']},
		], [
			{species: 'Girafarig', moves: ['futuresight']},
		]]);

		battle.makeChoices();
		battle.makeChoices();
		assert(battle.log[battle.lastMoveLine + 1].startsWith('|-fail|'));
	});

	common.itGen(2, `[Gen 2] should damage in two turns, ignoring Protect`, () => {
		battle = common.gen(2).createBattle([[
			{species: 'Sneasel', moves: ['sleeptalk', 'futuresight', 'sweetscent']},
		], [
			{species: 'Girafarig', moves: ['sleeptalk', 'futuresight', 'protect', 'sweetscent']},
		]]);

		const sneasel = battle.p1.active[0];
		const girafarig = battle.p2.active[0];
		battle.makeChoices('move sweetscent', 'move sweetscent'); // counteract imperfect accuracy
		battle.makeChoices('move futuresight', 'move futuresight');
		assert.fullHP(girafarig);
		battle.makeChoices('auto', 'auto');
		assert.fullHP(girafarig);
		battle.makeChoices('auto', 'move Protect');
		assert.false.fullHP(sneasel);
		assert.false.fullHP(girafarig);
	});

	it(`should not double Stomping Tantrum for exiting normally`, function () {
		const run = first => {
			battle?.destroy(); battle = common.createBattle([[{ species: 'Mew', ability: 'No Ability', moves: ['futuresight', 'splash', 'stompingtantrum'] }], [{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }]]);
			battle.randomizer = n => n; battle.randomChance = (n, d) => n >= d;
			battle.makeChoices('move ' + first, 'move splash'); const q = battle.p2.active[0], hp = q.hp;
			battle.makeChoices('move stompingtantrum', 'move splash'); return hp - q.hp;
		};
		const normal = run('splash'); assert(normal > 0); assert.equal(run('futuresight'), normal);
	});
	it(`should not trigger Eject Button`, function () {
		battle = common.createBattle([[
			{species: 'Wynaut', moves: ['futuresight']},
		], [
			{species: 'Scizor', item: 'ejectbutton', moves: ['sleeptalk']},
			{species: 'Roggenrola', moves: ['sleeptalk']},
		]]);

		for (let i = 0; i < 3; i++) battle.makeChoices();
		assert.equal(battle.requestState, 'move');
	});

	it(`should be able to set Future Sight against an empty target slot`, function () {
		battle = common.createBattle([[
			{species: 'Shedinja', moves: ['finalgambit']},
			{species: 'Roggenrola', moves: ['sleeptalk']},
		], [
			{species: 'Wynaut', moves: ['sleeptalk', 'futuresight']},
		]]);

		battle.makeChoices('auto', 'move future sight');
		battle.makeChoices('switch 2');
		battle.makeChoices();
		battle.makeChoices();
		const roggenrola = battle.p1.active[0];
		assert.false.fullHP(roggenrola);
	});

	it(`its damaging hit should not count as copyable for Copycat`, function () {
		battle = common.createBattle([[
			{species: 'Wynaut', moves: ['sleeptalk', 'futuresight']},
		], [
			{species: 'Liepard', moves: ['sleeptalk', 'copycat']},
		]]);

		battle.makeChoices('move futuresight', 'auto');
		battle.makeChoices();
		battle.makeChoices();
		battle.makeChoices('auto', 'move copycat'); // Should fail due to last move being Sleep Talk
		battle.makeChoices();
		battle.makeChoices();
		const wynaut = battle.p1.active[0];
		assert.fullHP(wynaut);
	});

	it(`should only cause the user to take Life Orb recoil on its damaging turn`, function () {
		battle = common.createBattle([[
			{species: 'wynaut', item: 'lifeorb', moves: ['futuresight']},
		], [
			{species: 'mew', moves: ['sleeptalk']},
		]]);

		battle.makeChoices();
		const wynaut = battle.p1.active[0];
		const mew = battle.p2.active[0];
		assert.fullHP(wynaut, `Wynaut should not take Life Orb recoil on Future Sight's starting turn`);
		battle.makeChoices();
		battle.makeChoices();
		assert.equal(wynaut.hp, wynaut.maxhp - Math.floor(wynaut.maxhp / 10), `Wynaut should take Life Orb recoil on Future Sight's damaging turn`);
		const damage = mew.maxhp - mew.hp;
		assert.bounded(damage, [30, 35]); // 22-27 if Life Orb was not applied
	});

	common.itGen(4, `[Gen 4] should not be affected by Life Orb`, () => {
		battle = common.gen(4).createBattle([[
			{species: 'wynaut', item: 'lifeorb', moves: ['futuresight']},
		], [
			{species: 'mew', ability: 'noguard', moves: ['sleeptalk']},
		]]);

		battle.makeChoices();
		const wynaut = battle.p1.active[0];
		const mew = battle.p2.active[0];
		battle.makeChoices();
		battle.makeChoices();
		assert.fullHP(wynaut, `Wynaut should not have taken any damage`);
		const damage = mew.maxhp - mew.hp;
		assert.bounded(damage, [21, 25]); // [27-32] if Life Orb was applied
	});

	it(`should not be affected by Life Orb if not the original user`, function () {
		battle = common.createBattle([[
			{species: 'wynaut', item: 'lifeorb', moves: ['futuresight']},
			{species: 'liepard', item: 'lifeorb', moves: ['sleeptalk']},
		], [
			{species: 'mew', moves: ['sleeptalk']},
		]]);

		battle.makeChoices();
		const liepard = battle.p1.pokemon[1];
		const mew = battle.p2.active[0];
		battle.makeChoices();
		battle.makeChoices('switch 2', 'move sleeptalk');
		assert.fullHP(liepard, `liepard should not have taken any damage`);
		const damage = mew.maxhp - mew.hp;
		assert.bounded(damage, [22, 27]); // 30, 35 if Life Orb was applied
	});

	it(`should not cause the user to change typing on either its starting or damaging turn`, function () {
		battle = common.createBattle([[
			{species: 'roggenrola', ability: 'protean', moves: ['futuresight', 'sleeptalk']},
		], [
			{species: 'mew', moves: ['sleeptalk']},
		]]);

		const roggenrola = battle.p1.active[0];
		battle.makeChoices();
		assert.false(roggenrola.hasType('Psychic'), `Protean Roggenrola should not change type on Future Sight's starting turn`);
		battle.makeChoices();
		battle.makeChoices();
		assert.false(roggenrola.hasType('Psychic'), `Protean Roggenrola should not change type on Future Sight's damaging turn`);
	});

	it(`should be boosted by Terrain only if Terrain is active on the damaging turn`, function () {
		const normal = futureDamage(); assert(normal > 0);
		assert.equal(futureDamage({ initialTerrain: true, clearTerrain: true }), normal);
		const boosted = futureDamage({ finalTerrain: true }); assert(boosted > normal);
		assert.equal(futureDamage({ initialTerrain: true }), boosted);
	});
	it(`should be boosted by Terrain even if the user is not on the field, as long as the user is not Flying-type`, function () {
		const grounded = futureDamage({ switched: true });
		assert(futureDamage({ switched: true, finalTerrain: true }) > grounded);
		const flying = futureDamage({ switched: true, flying: true }); assert(flying > 0);
		assert.equal(futureDamage({ switched: true, flying: true, finalTerrain: true }), flying);
	});
	it(`should not ignore the target's screens, even when the user is not active on the field`, function () {
		for (const switched of [false, true]) {
			const normal = futureDamage({ switched }), screen = futureDamage({ switched, screen: true });
			assert(screen > 0); assert(Math.abs(screen * 2 - normal) <= 2);
		}
	});
	it(`should not consider the user's item or Ability when the user is not active`, function () {
		const normal = futureDamage();
		assert(futureDamage({ item: 'Choice Specs' }) > normal);
		assert(futureDamage({ ability: 'Adaptability' }) > normal);
		const benched = futureDamage({ switched: true }); assert(benched > 0);
		assert.equal(futureDamage({ switched: true, item: 'Choice Specs', ability: 'Adaptability' }), benched);
	});
	it(`should not ignore the target's Unaware`, function () {
		battle = common.createBattle([[
			{species: 'Manaphy', ability: 'simple', moves: ['tailglow', 'futuresight']},
		], [
			{species: 'Ho-Oh', ability: 'unaware', moves: ['luckychant']},
		]]);

		battle.makeChoices();
		battle.makeChoices('move futuresight', 'auto');
		battle.makeChoices();
		battle.makeChoices();
		const hooh = battle.p2.active[0];
		const damage = hooh.maxhp - hooh.hp;
		assert.bounded(damage, [60, 71]); // Damage would be 236-278 if Unaware was being ignored
	});

	it(`should use the user's most recent Special Attack stat if the user is on the field`, function () {
		const low = futureDamage({ spa: 100 }), high = futureDamage({ spa: 300 });
		assert(low > 0); assert(high > low * 2, 'Special Attack changed after setup must affect the delayed hit');
		const blade = futureDamage({ species: 'Aegislash', ability: 'Stance Change' });
		const shield = futureDamage({ species: 'Aegislash', ability: 'Stance Change', shield: true });
		assert(shield > 0); assert(blade > shield, 'King’s Shield before impact must use the current Shield form stats');
	});
	it.skip(`should use the user's most recent Special Attack stat, even if the user is not on the field`, function () {
		battle = common.createBattle([[
			{species: 'Aegislash', ability: 'stancechange', moves: ['futuresight', 'kingsshield']},
			{species: 'Wynaut', moves: ['sleeptalk']},
		], [
			{species: 'Ho-Oh', ability: 'shellarmor', moves: ['recover', 'flareblitz']},
		]]);

		battle.makeChoices();
		battle.makeChoices('switch wynaut', 'auto');
		battle.makeChoices();
		const hooh = battle.p2.active[0];
		let damage = hooh.maxhp - hooh.hp;
		assert.bounded(damage, [79, 94], `Future Sight should deal Blade Forme damage, even though Aegislash switched out in Blade Forme`);

		battle.makeChoices('switch aegislash', 'auto');
		battle.makeChoices();
		battle.makeChoices('auto', 'move flareblitz');
		battle.makeChoices(); // switch in Wynaut
		battle.makeChoices();
		damage = hooh.maxhp - hooh.hp;
		assert.bounded(damage, [79, 94], `Future Sight should deal Blade Forme damage, even though Aegislash was KOed in Blade Forme.`);
	});

	it(`should only use Sp. Atk stat boosts/drops if the user is on the field`, function () {
		const normal = futureDamage(), boosted = futureDamage({ boost: 2 }), reduced = futureDamage({ boost: -2 });
		assert(boosted > normal); assert(reduced < normal);
		const benched = futureDamage({ switched: true }); assert(benched > 0);
		assert.equal(futureDamage({ switched: true, boost: 2 }), benched);
		assert.equal(futureDamage({ switched: true, boost: -2 }), benched);
	});
});
