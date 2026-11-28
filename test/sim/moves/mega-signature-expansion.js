'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');

describe('Mega signature move effects', () => {
	let battle;
	afterEach(() => battle.destroy());

	function start(form, move) {
		const mega = Dex.species.get(form);
		const set = (species, moves) => ({ species, ability: 'No Ability', moves });
		battle = common.createBattle({ formatid: 'gen9nofielddoublesbattle' }, [
			[set(mega.battleOnly || mega.baseSpecies, [move]), set('Mew', ['splash']), set('Slowbro', ['splash'])],
			[set('Mew', ['uturn', 'batonpass', 'splash']), set('Slowbro', ['splash']), set('Mewtwo', ['splash'])],
		]);
		battle.makeChoices('team 123', 'team 123');
		const [user, ally] = battle.p1.active;
		const [foe, other] = battle.p2.active;
		user.formeChange(mega.name, Dex.items.get(mega.requiredItem), true);
		for (const p of [user, ally, foe, other]) p.maxhp = p.baseMaxhp = p.hp = 4000;
		return { user, ally, foe, other };
	}

	function use(id, user, target) {
		battle.actions.useMove(id, user, { target });
		battle.clearActiveMove();
		return user.lastMoveUsed;
	}

	it('uses Dune Echo from Boomburst and applies Tremor, including its Desert bonus', () => {
		const { user, foe, other } = start('Flygon-Mega-Z', 'boomburst');
		foe.addVolatile('substitute', foe);
		const move = use('boomburst', user, foe);
		assert.equal(move.name, 'Dune Echo');
		assert.equal(move.basePower, 115);
		assert(foe.hp < 4000 && foe.volatiles.substitute);
		assert.equal(other.hp, 4000);
		const power = () => battle.runEvent('BasePower', user, foe, move, 1000);
		assert.equal(power(), 1500);
		battle.field.setTerrain('desertterrain', user);
		assert(power() > 1500);
	});
	it('targets one foe with Fault Cleave and keeps Earthquake’s Rocky typing and Dune Carver interaction', () => {
		const { user, ally, foe, other } = start('Garchomp-Mega', 'earthquake');
		assert.equal(battle.runEvent('BasePower', user, foe, Dex.getActiveMove('faultcleave'), 100), 150);
		battle.field.setTerrain('rockyterrain', user);
		user.side.addSideCondition('stealthrock', foe);
		const move = use('earthquake', user, other);
		assert.equal(move.name, 'Fault Cleave');
		assert.equal(move.basePower, 100);
		assert.equal(user.getMoves()[0].target, 'normal');
		assert(move.flags.slicing);
		assert.deepEqual(move.types, ['Ground', 'Rock']);
		assert.equal(foe.hp, 4000);
		assert.equal(ally.hp, 4000);
		assert(other.hp < 4000);
		assert(!user.side.sideConditions.stealthrock);
		const regular = use('earthquake', foe, user);
		assert.equal(regular.name, 'Earthquake');
		assert.equal(regular.target, 'allAdjacent');
		assert(!regular.flags.slicing);
	});

	it('passes through a Substitute with Sonic Lance and retains the Rocky Field pulse rebound', () => {
		const { user, foe } = start('Garchomp-Mega-Z', 'dragonpulse');
		foe.addVolatile('substitute', foe);
		const doll = foe.volatiles.substitute.hp;
		const move = use('dragonpulse', user, foe);
		assert.equal(move.name, 'Sonic Lance');
		assert.equal(move.basePower, 125);
		assert.equal(Dex.moves.get('soniclance').basePower, 125);
		assert.equal(Dex.moves.get('dragonpulse').basePower, 85);
		assert(move.flags.sound && move.flags.pulse);
		assert.equal(move.category, 'Special');
		assert.equal(move.secondaries, null);
		assert(foe.hp < 4000);
		assert.equal(foe.volatiles.substitute.hp, doll);
		battle.field.setTerrain('rockyterrain', user);
		const hp = foe.hp;
		use('dragonpulse', user, foe);
		assert.equal(foe.hp, hp);
		assert.equal(foe.volatiles.substitute.hp, doll);
	});

	for (const [species, base, stat, foeStat] of [
		['Latias', 'mistball', 'spd', 'spa'], ['Latios', 'lusterpurge', 'spa', 'spd'],
	]) {
		it(species + ' restores one lost stage per entry and keeps its Eon move interaction', () => {
			const { user, foe } = start(species + '-Mega', base);
			use(base, user, foe);
			assert.equal(user.boosts[stat], 0);
			assert.equal(foe.boosts[foeStat], -1);
			user.boosts[stat] = -2;
			foe.addVolatile('protect', foe);
			use(base, user, foe);
			assert.equal(user.boosts[stat], -2);
			foe.removeVolatile('protect');
			use(base, user, foe);
			assert.equal(user.boosts[stat], -1);
			use(base, user, foe);
			assert.equal(user.boosts[stat], -1);
			const bench = user.side.pokemon[2];
			battle.actions.switchIn(bench, 0);
			battle.actions.runSwitch(bench);
			battle.actions.switchIn(user, 0);
			battle.actions.runSwitch(user);
			user.boosts[stat] = -1;
			use(base, user, foe);
			assert.equal(user.boosts[stat], 0);
		});
	}

	it('changes Dragon’s Den to Fairy Tale with Mist Glide', () => {
		const { user, foe } = start('Latias-Mega', 'mistball');
		battle.field.startTerrain('dragonsdenterrain');
		battle.actions.runMove('mistball', user, user.getLocOf(foe));
		assert.equal(battle.field.terrain, 'fairytaleterrain');
	});

	it('replaces the freeze chance only for Polar Beacon and slows an opponent that moved in snow', () => {
		const { user, foe } = start('Ampharos-Aevian-Mega', 'icebeam');
		// Use the weather created by this Mega's own Absolute Zero on entry.
		assert.equal(battle.field.weather, 'hail');
		const move = use('icebeam', user, foe);
		assert.equal(move.name, 'Polar Beacon');
		assert.equal(foe.boosts.spe, 0);
		assert(!move.secondaries.some(s => s.status === 'frz'));
		foe.moveUsed(Dex.moves.get('splash'));
		use('icebeam', user, foe);
		assert.equal(foe.boosts.spe, -1);
		battle.field.clearWeather();
		battle.field.setWeather('snowscape', user);
		use('icebeam', user, foe);
		assert.equal(foe.boosts.spe, -2);
		battle.field.clearWeather();
		use('icebeam', user, foe);
		assert.equal(foe.boosts.spe, -2);
		assert.equal(Dex.moves.get('icebeam').secondaries[0].status, 'frz');
	});

	it('allows U-turn damage, blocks move-based switching and expires at the end of the turn', () => {
		const { user, foe } = start('Banette-Mega-Z', 'shadowsneak');
		foe.addVolatile('protect', foe);
		use('shadowsneak', user, foe);
		assert(!foe.volatiles.puppetsnare);
		foe.removeVolatile('protect');
		foe.addVolatile('substitute', foe);
		use('shadowsneak', user, foe);
		assert(!foe.volatiles.puppetsnare);
		foe.removeVolatile('substitute');
		const snare = use('shadowsneak', user, foe);
		assert.equal(snare.priority, 1);
		assert(foe.volatiles.puppetsnare);
		const hp = user.hp;
		use('uturn', foe, user);
		assert(user.hp < hp);
		assert(!foe.switchFlag);
		use('batonpass', foe, foe);
		assert(!foe.switchFlag);
		assert(!foe.trapped);
		battle.fieldEvent('Residual');
		assert(!foe.volatiles.puppetsnare);
		// A different pivot isolates the expired snare from Misaligned Stars’ repeat block.
		use('flipturn', foe, user);
		assert(foe.switchFlag);
	});

	it('also prevents Pivot Kick’s rebound, while allowing an Eject Button to work', () => {
		const { user, foe } = start('Banette-Mega-Z', 'shadowsneak');
		foe.formeChange('Lopunny-Mega', Dex.items.get('lopunnite'), true);
		// Shadow Sneak needs a damageable target; base Lopunny’s Normal typing is immune.
		foe.setType('Fighting');
		use('shadowsneak', user, foe);
		assert(foe.volatiles.puppetsnare);
		user.addVolatile('protect', user);
		use('jumpkick', foe, user);
		assert(!foe.switchFlag);
		foe.setItem('ejectbutton');
		use('shadowsneak', user, foe);
		assert(foe.switchFlag);
	});

	it('keeps priority on Torpedo Jet and uses Special Attack without contact', () => {
		const { user, foe } = start('Sharpedo-Mega-Y', 'aquajet');
		const move = use('aquajet', user, foe);
		assert.equal(move.category, 'Special');
		assert.equal(move.priority, 1);
		assert.equal(move.basePower, 40);
		assert(!move.flags.contact);
		assert(foe.hp < 4000);
		assert.equal(Dex.moves.get('aquajet').category, 'Physical');
	});

	it('removes one positive attacking stage with Crest Cannon, choosing Attack on a tie', () => {
		const { user, foe } = start('Empoleon-Mega-Y', 'flashcannon');
		foe.boosts.atk = foe.boosts.spa = 2;
		const move = use('flashcannon', user, foe);
		assert.equal(move.basePower, 85);
		assert.equal(Dex.moves.get('Crest Cannon').basePower, move.basePower);
		assert(move.flags.pulse);
		assert.equal(move.secondaries, null);
		assert.deepEqual([foe.boosts.atk, foe.boosts.spa], [1, 2]);
		use('flashcannon', user, foe);
		assert.deepEqual([foe.boosts.atk, foe.boosts.spa], [1, 1]);
		foe.boosts.atk = -1;
		foe.boosts.spa = 0;
		use('flashcannon', user, foe);
		assert.deepEqual([foe.boosts.atk, foe.boosts.spa], [-1, 0]);
		foe.addVolatile('substitute', foe);
		foe.boosts.spa = 2;
		use('flashcannon', user, foe);
		assert.equal(foe.boosts.spa, 2);
	});

	it('removes hazards and Leech Seed and poisons the target with special, non-contact Crystal Spin', () => {
		const { user, foe } = start('Glimmora-Mega', 'mortalspin');
		user.side.addSideCondition('spikes', foe);
		user.addVolatile('leechseed', foe);
		const move = use('mortalspin', user, foe);
		assert.equal(move.name, 'Crystal Spin');
		assert.equal(move.category, 'Special');
		assert.equal(move.basePower, 35);
		assert(!move.flags.contact);
		assert.equal(foe.status, 'psn');
		assert(!user.volatiles.leechseed && !user.side.sideConditions.spikes);
	});
});
