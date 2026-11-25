'use strict';

const assert = require('node:assert/strict');
const common = require('../../common');
const { Dex, TeamValidator } = require('../../../dist/sim');
const { getAbilityDisplayComponents } = require('../../../dist/data/ability-display');

describe('Shogun Stance', () => {
	let battle;
	afterEach(() => { battle?.destroy(); });

	const variants = [
		['Samurott', 'Cresting Cut', 'Water'], ['Samurott-Alt', 'Cresting Cut', 'Water'],
		['Samurott-Hisui', 'Moonless Cut', 'Water'], ['Samurott-Hisui-Alt', 'Moonless Cut', 'Water'],
	];
	const set = (species, ability = 'Shogun Stance') => ({ species, ability, moves: ['Razor Shell'] });
	function start(species, ability) {
		battle = common.createBattle({ formatid: 'gen9fairytalefield' }, [
			[set(species, ability)], [{ species: 'Blissey', ability: 'No Ability', moves: ['Splash'] }],
		]);
		battle.makeChoices('team 1', 'team 1');
		const user = battle.p1.active[0], foe = battle.p2.active[0];
		foe.hp = foe.baseMaxhp = foe.maxhp = 5000;
		return [user, foe];
	}
	for (const [species, name, type] of variants) {
		it(species + ' can legally select the fourth ability and use its cut in the original slot', () => {
			const validator = TeamValidator.get('gen9fairytalefield');
			for (const ability of Object.values(Dex.species.get(species).abilities)) {
				assert.equal(validator.validateTeam([set(species, ability)]), null, ability);
			}
			assert.equal(Dex.species.get(species).abilities.S, 'Shogun Stance');
			const [user, foe] = start(species);
			const slot = user.getMoves()[0];
			assert.equal(slot.move, name);
			assert.equal(slot.id, 'razorshell');
			const pp = user.moveSlots[0].pp;
			user.boosts.spa = 4;
			battle.makeChoices('move razorshell', 'move splash');
			assert.equal(user.moveSlots[0].pp, pp - 1);
			const cut = user.lastMoveUsed;
			assert.equal(cut.id, 'razorshell');
			assert.equal(cut.name, name);
			assert.equal(cut.type, type);
			assert.equal(cut.category, 'Special');
			assert.equal(cut.basePower, 85);
			assert.equal(cut.critRatio, name === 'Moonless Cut' ? 2 : 1);
			assert.equal(cut.accuracy, 100);
			assert.deepEqual(cut.secondary, { chance: 50, boosts: { def: -1 } });
			assert(cut.flags.contact && cut.flags.slicing);
			assert(battle.log.some(line => line.includes('The move was strengthened by the terrain!')));
			user.clearBoosts();
			user.boosts.atk = 4;
			battle.actions.useMove(name, user, { target: foe });
			assert.equal(user.lastMoveUsed.id, 'razorshell');
			assert.equal(user.lastMoveUsed.category, 'Physical');
			assert.equal(user.lastMoveUsed.type, type);
			assert.equal(user.lastMoveUsed.critRatio, cut.critRatio);
			for (const event of ['ModifyAtk', 'ModifySpA', 'ModifySpe']) {
				assert.equal(battle.runEvent(event, user, foe, cut, 100), 120);
			}
			user.addVolatile('gastroacid');
			assert.equal(user.getMoves()[0].move, 'Razor Shell');
			battle.actions.useMove('razorshell', user, { target: foe });
			assert.equal(user.lastMoveUsed.name, 'Razor Shell');
			assert.equal(user.lastMoveUsed.type, 'Water');
			for (const event of ['ModifyAtk', 'ModifySpA', 'ModifySpe']) {
				assert.equal(battle.runEvent(event, user, foe, cut, 100), 100);
			}
		});
		it(species + ' gains Shell Armor from the stance only on the Hisuian form', () => {
			const [holder, foe] = start(species);
			const hisuian = species.includes('Hisui');
			assert.equal(holder.hasAbility('shellarmor'), hisuian);
			assert.deepEqual(getAbilityDisplayComponents('shogunstance', holder.getPassives(), species),
				hisuian ? ['shellarmor'] : []);
			assert.equal(holder.boosts.def, hisuian ? 1 : 0);
			const attack = Dex.getActiveMove('watergun');
			const crit = () => battle.runEvent('CriticalHit', holder, foe, attack);
			const damage = () => battle.runEvent('ModifyDamage', foe, holder, attack, 100);
			assert.equal(crit(), !hisuian);
			assert.equal(damage(), hisuian ? 80 : 100);
			battle.boost({ atk: -1 }, holder, foe, Dex.moves.get('growl'));
			assert.equal(holder.boosts.spd, hisuian ? 2 : 0);
			battle.field.startTerrain('dragonsdenterrain');
			assert.equal(damage(), 100);
			assert.equal(crit(), !hisuian);
			attack.ignoreAbility = true;
			battle.setActiveMove(attack, foe, holder);
			assert.equal(crit(), true);
			holder.setItem('Ability Shield');
			assert.equal(crit(), !hisuian);
			battle.clearActiveMove();
			holder.setItem('');
			holder.addVolatile('gastroacid');
			assert.equal(holder.hasAbility('shellarmor'), false);
			assert.equal(crit(), true);
		});
	}
	it('keeps Ceaseless Edge as its separate Dark attack that lays Spikes', () => {
		const [user, foe] = start('Samurott-Hisui');
		user.boosts.accuracy = 6;
		battle.actions.useMove('ceaselessedge', user, { target: foe });
		assert.equal(user.lastMoveUsed.name, 'Ceaseless Edge');
		assert.equal(user.lastMoveUsed.type, 'Dark');
		assert(foe.side.sideConditions.spikes);
	});
	for (const [species, ability] of [['Samurott', 'Shell Armor'], ['Mew', 'Shogun Stance']]) {
		it(species + ' with ' + ability + ' keeps ordinary Razor Shell', () => {
			const [user, foe] = start(species, ability);
			assert.equal(user.getMoves()[0].move, 'Razor Shell');
			user.boosts.spa = 4;
			battle.actions.useMove('razorshell', user, { target: foe });
			assert.equal(user.lastMoveUsed.category, 'Physical');
			assert.equal(user.lastMoveUsed.basePower, 75);
			assert.equal(battle.runEvent('ModifySpe', user, foe, user.lastMoveUsed, 100), 100);
		});
	}
	it('can hold Choice Scarf and keeps the speed from its item under ability suppression', () => {
		const [user, foe] = start('Samurott');
		user.setItem('Choice Scarf');
		assert.equal(battle.runEvent('ModifySpe', user, foe, null, 100), 180);
		battle.makeChoices('move razorshell', 'move splash');
		assert.equal(user.item, 'choicescarf');
		assert.equal(user.volatiles.choicelock.move, 'razorshell');
		user.addVolatile('gastroacid');
		assert.equal(battle.runEvent('ModifySpe', user, foe, null, 100), 150);
	});
});
