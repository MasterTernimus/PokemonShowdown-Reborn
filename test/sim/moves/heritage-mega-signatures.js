'use strict';
const assert = require('node:assert/strict');
const common = require('../../common');
const { Dex, TeamValidator } = require('../../../dist/sim');
const { MegaSignaturesWaveThree } = require('../../../dist/data/mega-signatures-wave-three');

describe('Johto, Sinnoh, and heritage Mega signatures', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });

	function hit(id, user, target) {
		battle.actions.useMove(id, user, { target });
		battle.clearActiveMove();
		return user.lastMoveUsed;
	}

	function start(form, foeSpecies = 'Mew') {
		const mega = Dex.species.get(form);
		const base = Dex.species.get(mega.battleOnly || mega.baseSpecies);
		const spec = MegaSignaturesWaveThree[form];
		const set = { species: base.name, ability: base.abilities[0], item: mega.requiredItems[0],
			moves: [spec.base], nature: 'Serious', evs: { hp: 252, spe: 252 } };
		assert.equal(new TeamValidator('gen9nofieldsinglesgame@@@Obtainable Abilities,Obtainable Moves').validateTeam([set]), null);
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [
			[set], [{ species: foeSpecies, ability: 'No Ability', moves: ['splash'] }],
		]);
		battle.makeChoices('team 1', 'team 1');
		const user = battle.p1.active[0], target = battle.p2.active[0];
		user.maxhp = user.baseMaxhp = user.hp = target.maxhp = target.baseMaxhp = target.hp = 10000;
		const branch = user.canMegaEvo === mega.name ? 'mega' : user.canMegaEvoX === mega.name ? 'megax' : 'megay';
		assert.equal(user.getMoves()[0].move, Dex.moves.get(spec.base).name);
		const pp = user.moveSlots[0].pp;
		battle.makeChoices('move 1 ' + branch, 'move 1');
		assert.equal(user.species.id, form, base.name + ' holding ' + set.item);
		assert.equal(user.moveSlots[0].pp, pp - 1);
		assert.equal(user.moveSlots[0].id, spec.base);
		assert.equal(user.getMoves()[0].move, spec.name);
		return { user, target };
	}

	for (const [form, spec] of Object.entries(MegaSignaturesWaveThree)) {
		it(form + ' supports its legal stone and original move, plus direct ' + spec.name + ' lookup', () => {
			const { user, target } = start(form);
			assert.equal(user.lastMoveUsed.name, spec.name);
			const direct = hit(spec.name, user, target);
			assert.equal(direct.id, spec.base);
			assert.equal(direct.name, spec.name);
			assert.equal(direct.flags.megasignature, 1);
			assert.equal(Dex.moves.get(spec.name).pp, Dex.moves.get(spec.base).pp);
		});
	}

	it('Flashpoint Burst preserves the full-health maximum and uses the 90-power floor', () => {
		const { user, target } = start('typhlosionmega');
		const move = hit('eruption', user, target);
		user.hp = user.maxhp;
		assert.equal(move.basePowerCallback.call(battle, user, target, move), 150);
		user.hp = 1;
		assert.equal(move.basePowerCallback.call(battle, user, target, move), 90);
		assert(Dex.moves.get('eruption').basePowerCallback.call(battle, user, target, move) < 1);
	});

	it('Furnace Crash keeps Heat Crash’s weight calculation above the 70-power minimum', () => {
		const { user, target } = start('emboarmega');
		const move = hit('heatcrash', user, target);
		const normal = Dex.moves.get('heatcrash').basePowerCallback;
		user.weighthg = 750;
		for (const weight of [650, 200, 120]) {
			target.weighthg = weight;
			const power = normal.call(battle, user, target, move);
			assert.equal(move.basePowerCallback.call(battle, user, target, move), Math.max(70, power));
		}
	});

	it('Glacier Glaive keeps guaranteed accuracy but grants opponents a smaller damage bonus until the next action', () => {
		const { user, target } = start('baxcaliburmega');
		const attack = Dex.getActiveMove('tackle');
		assert(user.volatiles.glaiverush);
		assert.equal(battle.runEvent('Accuracy', user, target, attack, 50), true);
		assert.equal(battle.runEvent('ModifyDamage', target, user, attack, 100), 150);
		hit('glaiverush', target, user);
		assert.equal(battle.runEvent('ModifyDamage', user, target, attack, 100), 200);
		battle.makeChoices('move 1', 'move 1');
		assert(!target.volatiles.glaiverush);
	});

	it('Voidfall bypasses a Substitute and preserves Heavenfall’s native New World effect', () => {
		const { user, target } = start('hydreigonmega');
		battle.field.startTerrain('newworldterrain');
		target.addVolatile('substitute', target);
		const doll = target.volatiles.substitute.hp, hp = target.hp;
		const move = hit('heavenfall', user, target);
		assert(target.hp < hp);
		assert.equal(target.volatiles.substitute.hp, doll);
		assert.equal(move.accuracy, true);
		assert.equal(move.self.boosts.spa, -1);
	});

	it('Rescue Gale retains perfect rain accuracy and the sun penalty', () => {
		const { user, target } = start('dragonitemega');
		assert.equal(Dex.moves.get('rescuegale').accuracy, 85);
		assert.equal(Dex.moves.get('hurricane').accuracy, 70);
		for (const [weather, expected] of [['', 85], ['sunnyday', 50], ['raindance', true]]) {
			if (weather) battle.field.setWeather(weather, user);
			assert.equal(hit('hurricane', user, target).accuracy, expected);
			assert.equal(hit('rescuegale', user, target).accuracy, expected);
		}
	});

	it('Rescue Gale heals an injured ally once per turn after an enemy loses HP', () => {
		const allySet = { species: 'Mew', ability: 'No Ability', moves: ['splash'] };
		battle = common.createBattle({ formatid: 'gen9nofielddoublesbattle' }, [
			[{ species: 'Dragonite', item: 'Dragoninite', moves: ['hurricane'] }, allySet],
			[allySet, { species: 'Snorlax', moves: ['splash'] }],
		]);
		battle.makeChoices('team 12', 'team 12');
		const [user, ally] = battle.p1.active, foe = battle.p2.active[0];
		user.formeChange('Dragonite-Mega', Dex.items.get('dragoninite'), true);
		battle.field.setWeather('raindance', user);
		foe.maxhp = foe.baseMaxhp = foe.hp = 10000;
		ally.maxhp = ally.baseMaxhp = 320;
		ally.hp = 100;
		const userHP = user.hp = 100;
		foe.addVolatile('substitute', foe);
		hit('hurricane', user, foe);
		assert.equal(ally.hp, 100);
		foe.removeVolatile('substitute');
		hit('hurricane', user, foe);
		assert.equal(ally.hp, 120);
		hit('rescuegale', user, foe);
		assert.equal(ally.hp, 120);
		assert.equal(user.hp, userHP);
		battle.makeChoices('move 1 1, move splash', 'move splash, move splash');
		assert.equal(ally.hp, 120);
		ally.hp = ally.maxhp;
		hit('hurricane', user, foe);
		assert.equal(user.hp, userHP + Math.floor(user.baseMaxhp / 16));
	});

	it('Rescue Gale heals Dragonite in singles and respects Heal Block', () => {
		const { user, target } = start('dragonitemega');
		battle.field.setWeather('raindance', user);
		user.hp = 100;
		user.addVolatile('healblock', target);
		hit('hurricane', user, target);
		assert.equal(user.hp, 100);
		user.removeVolatile('healblock');
		hit('hurricane', user, target);
		assert.equal(user.hp, 100 + Math.floor(user.baseMaxhp / 16));
	});

	for (const [form, type, power] of [['meganiummega', 'Grass', 140], ['meganiummegay', 'Fire', 130]]) {
		it(form + ' fires Solar Beam under personal sunlight and keeps the charge, PP and field mechanics', () => {
			const { user, target } = start(form);
			const signature = MegaSignaturesWaveThree[form].name;
			assert.equal(Dex.moves.get(signature).type, type);
			assert.equal(user.lastMoveUsed.type, type);
			assert.equal(user.lastMoveUsed.basePower, power);
			assert(target.hp < target.maxhp);
			assert(!battle.field.weather);
			assert(!user.volatiles.twoturnmove);
			if (type === 'Fire') assert.equal(user.boosts.spa, 1);
			assert.equal(Dex.moves.get('solarbeam').type, 'Grass');
			user.setAbility('No Ability');
			battle.field.setWeather('raindance', target);
			const beforeCharge = target.hp, pp = user.moveSlots[0].pp;
			battle.makeChoices('move 1', 'move 1');
			assert.equal(target.hp, beforeCharge);
			assert(user.volatiles.twoturnmove);
			assert.equal(user.getMoveRequestData().moves[0].move, signature);
			assert.equal(user.moveSlots[0].pp, pp - 1);
			battle.makeChoices('move 1', 'move 1');
			assert(target.hp < beforeCharge);
			assert(!user.volatiles.twoturnmove);
			assert.equal(user.moveSlots[0].pp, pp - 1);
			battle.field.startTerrain('starlightarenaterrain');
			battle.field.setWeather('sunnyday', target);
			assert.equal(hit('solarbeam', user, target).type, 'Fairy');
			assert.equal(hit(signature, user, target).type, 'Fairy');
		});
	}

	it('Fault Rush preserves Defense while Headlong Rush still drops both defenses outside Torterra X', () => {
		const { user } = start('torterramegax');
		assert.equal(user.lastMoveUsed.type, 'Ground');
		assert.equal(user.lastMoveUsed.basePower, 120);
		assert.equal(user.boosts.def, 0);
		assert.equal(user.boosts.spd, -1);
		assert.deepEqual(Dex.moves.get('headlongrush').self.boosts, { def: -1, spd: -1 });
	});

	for (const [field, confused] of [['', true], ['volcanicterrain', false]]) {
		it('Blazing Fury lasts two turns and retains the ' + (field || 'neutral') + ' field finish', () => {
			const { user } = start('infernapemega');
			if (field) battle.field.startTerrain(field);
			assert.equal(user.getLockedMove(), 'ragingfury');
			assert.equal(user.getMoveRequestData().moves[0].move, 'Blazing Fury');
			const atk = user.boosts.atk;
			battle.makeChoices('move 1', 'move 1');
			assert(!user.volatiles.lockedmove);
			assert.equal(!!user.volatiles.confusion, confused);
			if (field) assert(user.boosts.atk > atk);
		});
	}

	it('Surge Rail crosses Substitute without damaging the doll', () => {
		const { user, target } = start('raichumegay');
		target.addVolatile('substitute', target);
		const hp = target.hp, doll = target.volatiles.substitute.hp;
		assert.equal(hit('thunderbolt', user, target).basePower, 95);
		assert(target.hp < hp);
		assert.equal(target.volatiles.substitute.hp, doll);
	});

	it('Sky Rake gains a critical-hit stage against Flying types only', () => {
		const { user, target } = start('salamencemega');
		target.setType('Normal');
		const normal = hit('dragonclaw', user, target).critRatio;
		target.setType('Flying');
		assert.equal(hit('dragonclaw', user, target).critRatio, normal + 1);
	});

	for (const [species, learned, signature] of [
		['Salamence', 'dragonclaw', 'Sky Rake'], ['Gengar', 'hex', 'Witching Hex'],
	]) {
		it(signature + ' checks the foe that draws the attack with Follow Me', () => {
			const mega = Dex.species.get(species + '-Mega');
			const filler = { species: 'Mew', ability: 'No Ability', moves: ['splash'] };
			battle = common.createBattle({ formatid: 'gen9nofielddoublesbattle' }, [
				[{ species, item: mega.requiredItems[0], moves: [learned] }, filler],
				[filler, { ...filler, species: 'Slowbro' }],
			]);
			battle.makeChoices('team 12', 'team 12');
			const user = battle.p1.active[0], [chosen, redirector] = battle.p2.active;
			user.formeChange(mega, user.getItem(), true);
			redirector.addVolatile('followme', redirector);
			for (const redirectedBonus of [false, true]) {
				for (const foe of [chosen, redirector]) {
					const eligible = (foe === redirector) === redirectedBonus;
					foe.setType(eligible ? 'Flying' : 'Psychic');
					foe.cureStatus(true);
					if (eligible) foe.setStatus('psn', user);
					foe.hp = foe.maxhp = 10000;
				}
				const move = hit(learned, user, chosen);
				assert.equal(move.name, signature);
				assert.equal(chosen.hp, chosen.maxhp);
				assert(redirector.hp < redirector.maxhp);
				if (learned === 'dragonclaw') {
					assert.equal(move.critRatio, Dex.moves.get(learned).critRatio + Number(redirectedBonus));
				} else {
					assert.equal(!!move.ignorePositiveDefensive, redirectedBonus);
				}
			}
		});
	}

	it('Omen Pulse reveals an item only on HP damage while Dread Crescent stays exclusive to Absol Z', () => {
		const { user, target } = start('absolmega');
		target.setItem('Assault Vest');
		const reveals = () => battle.log.filter(line => line.includes('|Assault Vest|[from] move: Omen Pulse')).length;
		target.addVolatile('protect', target);
		hit('darkpulse', user, target);
		target.removeVolatile('protect');
		target.addVolatile('substitute', target);
		hit('darkpulse', user, target);
		assert.equal(reveals(), 0);
		target.removeVolatile('substitute');
		const move = hit('darkpulse', user, target);
		assert.equal(move.category, 'Special');
		assert.equal(move.basePower, 85);
		assert(move.flags.pulse);
		assert.equal(reveals(), 1);
		assert.equal(target.item, 'assaultvest');
		assert.equal(hit('nightslash', user, target).name, 'Night Slash');
	});

	it('Dread Crescent keeps Omen Edge’s slicing hits and clears only positive evasion on HP damage', () => {
		const { user, target } = start('absolmegaz');
		battle.randomChance = () => true;
		target.boosts.evasion = 3;
		target.boosts.def = 2;
		target.addVolatile('substitute', target);
		target.volatiles.substitute.hp = 10000;
		hit('nightslash', user, target);
		assert.equal(target.boosts.evasion, 3);
		target.removeVolatile('substitute');
		const move = hit('nightslash', user, target);
		assert.equal(move.category, 'Physical');
		assert.equal(move.hit, 2);
		assert(move.flags.slicing);
		assert.equal(move.critRatio, 2);
		assert.equal(target.boosts.evasion, 0);
		assert.equal(target.boosts.def, 2);
		target.boosts.evasion = -2;
		hit('nightslash', user, target);
		assert.equal(target.boosts.evasion, -2);
		assert.equal(hit('darkpulse', user, target).name, 'Dark Pulse');
	});

	it('Tide Mortar keeps Heavy Artillery’s spread and tracks its target when the ability is suppressed', () => {
		const filler = { species: 'Mew', ability: 'No Ability', moves: ['splash'] };
		battle = common.createBattle({ formatid: 'gen9nofielddoublesbattle' }, [
			[{ species: 'Clawitzer', item: 'Clawitzerite', moves: ['waterpulse'] }, filler],
			[filler, { ...filler, species: 'Snorlax' }],
		]);
		battle.makeChoices('team 12', 'team 12');
		const user = battle.p1.active[0], [foe, redirector] = battle.p2.active;
		foe.hp = foe.maxhp = redirector.hp = redirector.maxhp = 10000;
		redirector.addVolatile('followme', redirector);
		hit('waterpulse', user, foe);
		assert.equal(foe.hp, 10000);
		assert(redirector.hp < 10000);
		user.formeChange('Clawitzer-Mega', Dex.items.get('clawitzerite'), true);
		foe.hp = redirector.hp = 10000;
		const move = hit('waterpulse', user, foe);
		assert.equal(move.category, 'Special');
		assert(move.flags.pulse);
		assert.equal(move.basePower, 65);
		assert.equal(move.target, 'allAdjacentFoes');
		assert(foe.hp < 10000 && redirector.hp < 10000);
		user.addVolatile('gastroacid', foe);
		foe.hp = redirector.hp = 10000;
		assert.equal(hit('waterpulse', user, foe).target, Dex.moves.get('waterpulse').target);
		assert(foe.hp < 10000);
		assert.equal(redirector.hp, 10000);
	});

	it('Witching Hex keeps native Hex power and bypasses positive defenses against statused foes only', () => {
		const { user, target } = start('gengarmega');
		battle.randomizer = damage => damage;
		battle.randomChance = (numerator, denominator) => numerator >= denominator;
		const base = hit('hex', user, target);
		assert.equal(base.accuracy, 100);
		assert.equal(base.basePowerCallback.call(battle, user, target, base), 70);
		const damage = (defenses, id = 'hex') => {
			target.boosts.def = target.boosts.spd = defenses;
			target.hp = target.maxhp;
			hit(id, user, target);
			return target.maxhp - target.hp;
		};
		assert(damage(4) < damage(0));
		target.setStatus('psn', user);
		for (const stat of ['atk', 'spa']) {
			user.storedStats.atk = user.storedStats.spa = 100;
			user.storedStats[stat] = 300;
			const neutral = damage(0);
			assert.equal(damage(4, 'witchinghex'), neutral);
			assert(damage(-2) > neutral);
			const move = user.lastMoveUsed;
			assert.equal(move.accuracy, 100);
			assert.equal(move.basePowerCallback.call(battle, user, target, move), 140);
		}
		assert(!Dex.moves.get('hex').ignorePositiveDefensive);
	});

	it('Strata Cannon gains power only while the user has positive Defense', () => {
		const { user, target } = start('torterramegay');
		for (const stage of [-1, 0, 1]) {
			user.boosts.def = stage;
			assert.equal(hit('powergem', user, target).basePower, stage > 0 ? 100 : 80);
		}
	});

	it('Laurel Storm preserves the Contrary stat gain and removes Safeguard only after HP damage', () => {
		const { user, target } = start('serperiormega');
		user.clearBoosts();
		battle.randomChance = () => true;
		assert.equal(Dex.moves.get('laurelstorm').accuracy, 100);
		assert.equal(Dex.moves.get('leafstorm').accuracy, 90);
		target.side.addSideCondition('safeguard', target);
		target.addVolatile('substitute', target);
		hit('leafstorm', user, target);
		assert(target.side.sideConditions.safeguard);
		target.removeVolatile('substitute');
		hit('leafstorm', user, target);
		assert(!target.side.sideConditions.safeguard);
		assert.equal(user.boosts.spa, 4);
	});
});
