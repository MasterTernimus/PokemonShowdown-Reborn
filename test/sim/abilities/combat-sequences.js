'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');
const { AbilityComponents } = require('../../../dist/data/ability-components');

describe('Convergence, Misaligned Stars and Frame Perfect', () => {
	let battle;
	const mon = (ability = 'No Ability', species = 'Mew', item = '') => ({
		species,
		ability,
		item,
		moves: ['tackle', 'watergun', 'splash', 'protect'],
	});
	function start(ability, doubles = false, species = 'Mew', item = '') {
		battle = common.createBattle(
			{ formatid: doubles ? 'gen9nofielddoublesbattle' : 'gen9nofieldsinglesgame' },
			[
				[mon(ability, species, item), mon(), mon()],
				[mon(), mon(), mon()],
			]
		);
		battle.makeChoices('team 123', 'team 123');
		battle.randomizer = damage => damage;
		for (const p of battle.getAllActive()) p.hp = p.maxhp = p.baseMaxhp = 10000;
		return [battle.p1.active[0], battle.p2.active[0], battle.p1.active[1], battle.p2.active[1]];
	}
	function hit(source, target, id = 'tackle', extra = {}) {
		const move = Object.assign(
			Dex.getActiveMove(id),
			{ accuracy: true, willCrit: false, secondaries: null },
			extra
		);
		const hp = target.hp;
		battle.actions.runMove(move, source, source.getLocOf(target), { externalMove: true });
		return hp - target.hp;
	}
	for (const [species, slot] of [
		['Typhlosion-Hisui', 'H'], ['Gengar-Mega', '0'], ['Banette-Mega', '0'], ['Banette-Mega-Z', '0'],
		['Froslass-Mega', '0'], ['Dragapult', '1'], ['Wishiwashi-Sevii', '0'], ['Chandelure', '0'],
		['Spiritomb', 'H'], ['Aegislash', 'H'], ['Mimikyu', '1'],
	]) {
		it(species + ' announces the stars on entry and blocks repeated opposing moves', () => {
			const ability = Dex.species.get(species).abilities[slot];
			const [holder, foe] = start(ability, false, species);
			assert(holder.hasAbilityOrPassive('misalignedstars'));
			const announcements = () => battle.log.filter(line => line.includes('the stars traced an unfamiliar sky')).length;
			assert.equal(announcements(), 1);
			for (let i = 0; i < 4; i++) hit(foe, holder, 'growl');
			assert.equal(battle.log.filter(line => line.includes('The stars were bad for that outcome')).length, 2);
			assert.equal(announcements(), 1);
			battle.makeChoices('switch 2', 'move splash');
			battle.makeChoices('switch 2', 'move splash');
			assert.equal(announcements(), 2);
		});
	}
	it('keeps the new slots through stance, disguise and schooling changes', () => {
		for (const species of ['mimikyubusted', 'mimikyutotem', 'mimikyubustedtotem'])
			assert.equal(Dex.species.get(species).abilities[1], 'Misaligned Stars');
		assert.equal(Dex.species.get('aegislashblade').abilities.H, 'Misaligned Stars');
		assert.deepEqual(Dex.species.get('wishiwashiseviischooling').passives, ['misalignedstars']);
		assert.deepEqual(Dex.species.get('dragapultgmax').passives, ['levitate']);
	});
	it('Keystone Seal applies Pressure on entry and charges extra PP alongside Imprison', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [
			[{ species: 'Spiritomb', ability: 'Keystone Seal', moves: ['splash'] }],
			[{ species: 'Mew', ability: 'No Ability', moves: ['bubble', 'splash'] }],
		]);
		battle.makeChoices('team 1', 'team 1');
		const [holder, foe] = battle.getAllActive();
		assert(holder.volatiles.keystoneseal);
		assert(holder.hasAbility('pressure'));
		assert.equal(foe.boosts.def, -1);
		assert.equal(foe.boosts.spd, -1);
		const slot = foe.moveSlots[0];
		assert.equal(slot.id, 'bubble');
		const pp = slot.pp;
		battle.makeChoices('move splash', 'move bubble');
		assert.equal(slot.pp, pp - 2);
	});
	it('Black Fang allows sleep and keeps its bite and KO effects', () => {
		const [holder, foe] = start('Black Fang');
		assert(holder.trySetStatus('slp', foe));
		battle.runEvent('Update', holder);
		assert.equal(holder.status, 'slp');
		assert.equal(battle.runEvent('BasePower', holder, foe, Dex.getActiveMove('bite'), 100), 150);
		holder.cureStatus();
		foe.hp = 1;
		hit(holder, foe, 'bite');
		battle.faintMessages();
		assert.equal(holder.boosts.atk, 1);
	});
	it('reads Ultra Ego stages separately from ordinary setup in actual damage', () => {
		const [stars, ego] = start('Misaligned Stars');
		ego.setAbility('Ultra Ego');
		const damage = (from, to) => battle.actions.getDamage(from, to, Object.assign(Dex.getActiveMove('watergun'), { willCrit: false }));
		const base = damage(ego, stars);
		battle.boost({ spa: 2 }, ego, ego, Dex.moves.get('nastyplot'));
		const setup = damage(ego, stars);
		assert(setup > base);
		battle.makeChoices('move splash', 'move watergun');
		assert.equal(ego.boosts.spa, 3);
		assert.equal(damage(ego, stars), setup);
		const beforeDefense = damage(stars, ego);
		battle.field.terrain = 'fairytaleterrain';
		hit(stars, ego, 'watergun');
		assert.equal(ego.boosts.spd, 1);
		battle.field.terrain = '';
		assert.equal(damage(stars, ego), beforeDefense);
		ego.clearBoosts();
		battle.boost({ spa: 2 }, ego, ego, Dex.moves.get('nastyplot'));
		assert.equal(damage(ego, stars), setup);
	});
	it('Ultra Ego cannot bypass the Stars inside Mega Gengar’s breakable Shadow Double', () => {
		const [stars, ego] = start('Shadow Double', false, 'Gengar-Mega');
		ego.setAbility('Ultra Ego');
		const attack = () => hit(ego, stars, 'watergun', { damage: 10 });
		stars.hp = 1000;
		assert.equal(attack(), 10);
		assert.equal(attack(), -3333);
		assert.equal(attack(), 10);
		assert.equal(attack(), -3333);
	});
	it('Ultra Instinct’s first-hit guard remains available for another foe after a Stars attack', () => {
		const [stars, instinct, ally] = start('Misaligned Stars', true);
		instinct.setAbility('Ultra Instinct');
		assert.equal(hit(stars, instinct, 'watergun', { damage: 100 }), 100);
		assert.equal(hit(ally, instinct, 'watergun', { damage: 100 }), 70);
	});
	for (const [species, slot] of [['Marowak', 'H'], ['Marowak-Alola', '1']]) {
		it(species + ' uses Cursed Body through Bone Warrior alongside selectable Stars', () => {
			assert.equal(Dex.species.get(species).abilities[slot], 'Misaligned Stars');
			const [holder, foe] = start('Misaligned Stars', false, species);
			assert(holder.hasAbilityOrPassive('cursedbody'));
			battle.forceRandomChance = true;
			battle.makeChoices('move splash', 'move watergun');
			assert.equal(foe.volatiles.disable?.move, 'watergun');
			holder.faint(foe);
			battle.faintMessages();
			assert.equal(foe.volatiles.curse.faintCurseTicks, 2);
		});
	}
	it('offers Galarian Corsola three abilities', () => {
		assert.deepEqual(Dex.species.get('corsolagalar').abilities, { 0: 'Weak Armor', 1: 'Cursed Body', H: 'Misaligned Stars' });
	});
	function charged(p) {
		p.m.convergence = { entry: p.m.ultraRivalryEntryToken, Physical: true, Special: true };
	}
	it('Misaligned Stars reduces an unrecorded enemy attack by 10% and still blocks the repeat', () => {
		const [holder, foe, ally] = start('Misaligned Stars', true);
		const baseline = hit(foe, ally);
		assert.equal(hit(foe, holder), battle.modify(baseline, 0.9));
		holder.hp = holder.maxhp;
		assert.equal(hit(foe, holder), 0);
		assert.equal(hit(ally, holder), baseline);
		battle.makeChoices('switch 3, move splash', 'move splash, move splash');
		battle.makeChoices('switch 3, move splash', 'move splash, move splash');
		const reduced = battle.modify(baseline, 0.9);
		holder.hp = Math.floor(holder.maxhp / 2);
		assert.equal(hit(foe, holder), battle.modify(reduced, 0.5) - Math.floor(holder.baseMaxhp / 4));
		assert(holder.m.misalignedStars.spentEntry.tackle === holder.m.ultraRivalryEntryToken);
		holder.hp = Math.floor(holder.maxhp / 2);
		assert.equal(hit(foe, holder), -Math.floor(holder.baseMaxhp / 3));
		assert.equal(hit(foe, holder), reduced);
	});
	function prepare(p, id) {
		const move = Dex.getActiveMove(id);
		battle.runEvent('ModifyMove', p, battle.p2.active[0], move, move);
		return move;
	}
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});
	for (const ability of ['Convergence', 'Frame Perfect', 'Hot Streak'])
		it(ability + ' ignores indirect ability damage', () => {
			const [p, foe] = start(ability);
			let rolls = 0;
			battle.randomChance = () => {
				rolls++;
				return true;
			};
			battle.damage(10, foe, p, Dex.abilities.get('roughskin'));
			assert(!p.m.convergence);
			assert(!p.m.framePerfect?.hits?.length);
			assert(!p.volatiles.jackpot);
			assert.equal(rolls, 0);
		});
	it('publishes only the approved slots and passives', () => {
		for (const [id, slot, ability] of [
			['lucario', 1, 'Convergence'],
			['metagross', 0, 'Convergence'],
			['bronzong', 'H', 'Misaligned Stars'],
			['bronzong', 'S', 'Reflector'],
			['claydol', 0, 'Misaligned Stars'],
			['dusknoir', 1, 'Misaligned Stars'],
			['mienshao', 0, 'Frame Perfect'],
			['ninjask', 1, 'Frame Perfect'],
		]) {
			assert.equal(Dex.species.get(id).abilities[slot], ability, id);
		}
		assert.deepEqual(Dex.species.get('metagross').passives, ['clearbody']);
		assert.deepEqual(Dex.species.get('accelgor').passives, ['frameperfect']);
		assert.deepEqual(Dex.species.get('accelgor').abilities, {
			0: 'Silk Shuriken',
			1: 'Hidden Scroll',
			H: 'Unburden',
		});
		assert(Dex.abilities.get('riftherald').exists);
	});
	for (const order of [
		['tackle', 'watergun'],
		['watergun', 'tackle'],
	])
		it('charges in order ' + order.join('/'), () => {
			const [p, foe] = start('Convergence');
			hit(p, foe, order[0]);
			hit(p, foe, order[1]);
			assert(p.m.convergence.Physical);
			assert(p.m.convergence.Special);
			const move = prepare(p, 'tackle');
			assert(move.convergenceAttack);
			assert(move.ignoreScreens);
			assert(move.ignorePositiveDefensive);
			assert.equal(battle.runEvent('ModifyDamage', p, foe, move, 100), 150);
			assert(!p.m.convergence.Physical && !p.m.convergence.Special);
		});
	for (const result of ['miss', 'protect', 'immune'])
		it('spends charges on ' + result + ' and cannot recharge itself', () => {
			const [p, foe] = start('Convergence');
			charged(p);
			if (result === 'protect') foe.addVolatile('protect');
			if (result === 'immune') foe.setType('Ghost');
			assert.equal(hit(p, foe, 'tackle', result === 'miss' ? { accuracy: 0 } : {}), 0);
			assert(!p.m.convergence.Physical && !p.m.convergence.Special);
		});
	it('keeps weaknesses while removing individual type resistances', () => {
		const [p, foe] = start('Convergence');
		charged(p);
		const move = prepare(p, 'flamethrower');
		foe.setType(['Grass', 'Dragon']);
		assert.equal(foe.runEffectiveness(move), 1);
		foe.setType(['Grass', 'Steel']);
		assert.equal(foe.runEffectiveness(move), 2);
		foe.setType(['Water', 'Dragon']);
		assert.equal(foe.runEffectiveness(move), 0);
	});
	it('bypasses actual screens and grants one charge for a multihit spread move', () => {
		const [p, foe] = start('Convergence', true);
		const normal = hit(p, foe);
		foe.side.addSideCondition('reflect', foe);
		charged(p);
		const powered = hit(p, foe);
		assert(Math.abs(powered - normal * 1.5) <= 2);
		assert(!p.m.convergence.Physical && !p.m.convergence.Special);
		hit(p, foe, 'tackle', { multihit: 3, target: 'allAdjacentFoes' });
		assert(p.m.convergence.Physical);
		assert(!p.m.convergence.Special);
	});
	for (const ability of ['Insight', 'Cold Logic'])
		it('composes Convergence once in ' + ability, () => {
			const [p, foe] = start(ability);
			charged(p);
			const move = prepare(p, 'watergun');
			assert.equal(battle.runEvent('ModifyDamage', p, foe, move, 100), 150);
			assert(p.hasAbility('keeneye'));
			assert(p.hasAbility('convergence'));
			if (ability === 'Insight') {
				assert(p.hasAbility('ultrainstinct'));
				assert(p.hasAbility('innerfocus'));
				assert(!p.hasAbility('telepathy'));
			} else {
				assert(p.hasAbility('forewarn'));
				assert(p.hasAbility('aftermath'));
			}
		});
	it('preserves Keen Eye accuracy protection and Mirror Arena entry effects', () => {
		const [p, foe] = start('Convergence');
		battle.boost({ accuracy: -1 }, p, foe, Dex.moves.get('sandattack'));
		assert.equal(p.boosts.accuracy, 0);
		assert(prepare(p, 'tackle').ignoreEvasion);
		battle.field.terrain = 'mirrorarenaterrain';
		battle.singleEvent('Start', p.getAbility(), p.abilityState, p);
		assert.equal(p.boosts.accuracy, 1);
		assert(p.volatiles.laserfocus);
	});
	it('records a whole multihit attack, blocks its next use once, then takes it normally', () => {
		const [p, foe] = start('Misaligned Stars');
		assert.equal(hit(foe, p, 'tackle', { damage: 10, multihit: 3 }), 30);
		assert.equal(hit(foe, p, 'tackle', { damage: 10, multihit: 3 }), -30);
		assert.equal(hit(foe, p, 'tackle', { damage: 10 }), 10);
		assert.equal(battle.log.filter(l => l.includes('The stars were bad for that outcome')).length, 1);
	});
	it('records each move independently across attackers', () => {
		const [p, foe, , other] = start('Misaligned Stars', true);
		hit(foe, p, 'tackle', { damage: 10 });
		assert.equal(hit(other, p, 'watergun', { damage: 10 }), 10);
		assert.equal(hit(other, p, 'tackle', { damage: 10 }), -20);
		assert.equal(hit(foe, p, 'watergun', { damage: 10 }), 0);
	});
	it('continues blocking every other Water Gun from the same foe across battle turns', () => {
		const [holder] = start('Misaligned Stars');
		holder.hp = 500;
		for (let use = 1; use <= 6; use++) {
			const before = holder.hp;
			const logStart = battle.log.length;
			battle.makeChoices('move splash', 'move watergun');
			const blocks = battle.log.slice(logStart).filter(line => line.includes('The stars were bad for that outcome'));
			assert.equal(blocks.length, use % 2 === 0 ? 1 : 0, 'Water Gun use ' + use);
			if (use % 2 === 0) {
				assert.equal(holder.hp, Math.min(holder.maxhp, before + Math.floor(holder.baseMaxhp / 3)));
			} else {
				assert(holder.hp < before, 'Water Gun should deal damage on use ' + use);
			}
		}
	});
	it('repeatedly blocks every other five-hit Double Slap after Knock Off', () => {
		const [p, foe] = start('Misaligned Stars', false, 'Dusknoir');
		p.hp = p.maxhp / 4;
		assert(hit(foe, p, 'knockoff') > 0);
		const slap = () => hit(foe, p, 'doubleslap', { damage: 10, multihit: 5 });
		assert.equal(slap(), 50);
		assert.equal(slap(), -Math.floor(p.maxhp / 3));
		assert.equal(slap(), 50);
		assert.equal(hit(foe, p, 'knockoff'), -Math.floor(p.maxhp / 3));
		const missingHP = p.maxhp - p.hp;
		assert.equal(slap(), -Math.min(Math.floor(p.maxhp / 3), missingHP));
		assert.equal(slap(), 50);
		assert.equal(slap(), -50);
	});
	it('records successful targeted status moves and ignores misses', () => {
		const [p, foe] = start('Misaligned Stars');
		hit(foe, p, 'growl', { accuracy: 0 });
		for (const expected of [-1, -1, -2]) {
			hit(foe, p, 'growl');
			assert.equal(p.boosts.atk, expected);
		}
	});
	it('allows the first move to KO and does not record misses or fully protected attacks', () => {
		const [p, foe] = start('Misaligned Stars');
		hit(foe, p, 'tackle', { accuracy: 0 });
		assert(!p.m.misalignedStars?.recorded);
		p.addVolatile('protect');
		hit(foe, p);
		p.removeVolatile('protect');
		assert(!p.m.misalignedStars?.recorded);
		p.hp = 1;
		hit(foe, p, 'tackle', { damage: 10 });
		assert.equal(p.hp, 0);
	});
	it('retains the modded Anticipation warning effect', () => {
		const [p, foe] = start('Misaligned Stars');
		p.setType('Fire');
		foe.moveSlots[0] = { ...foe.moveSlots[0], id: 'watergun', move: 'Water Gun' };
		battle.singleEvent('Start', p.getAbility(), p.abilityState, p);
		assert(p.volatiles.warnedmoves);
		assert(p.hasAbility('anticipation'));
	});
	it('remembers each spread target independently and heals even from a Sheer Force attack', () => {
		const [holder, foe, ally] = start('Misaligned Stars', true);
		ally.setAbility('Misaligned Stars');
		foe.setAbility('Sheer Force');
		holder.hp = ally.hp = 2000;
		const volley = () => battle.actions.runMove(Object.assign(Dex.getActiveMove('rockslide'), {
			accuracy: true, damage: 40,
		}), foe, foe.getLocOf(holder), { externalMove: true });
		ally.addVolatile('protect');
		volley();
		ally.removeVolatile('protect');
		assert.equal(holder.hp, 1960);
		assert.equal(ally.hp, 2000);
		volley();
		assert.equal(holder.hp, 1960 + 3333);
		assert.equal(ally.hp, 1960);
		battle.makeChoices('switch 3, move splash', 'move splash, move splash');
		battle.makeChoices('switch 3, move splash', 'move splash, move splash');
		volley();
		assert(foe.lastMoveUsed.hasSheerForce);
		assert.equal(holder.hp, 1960 + 3333 - 20 + 2500);
		assert.equal(ally.hp, 1960 + 3333);
	});
	it('cushions a remembered delayed hit and heals when the attack lands', () => {
		const [holder, foe] = start('Misaligned Stars');
		holder.hp = 3000;
		const land = () => {
			const move = Object.assign(Dex.getActiveMove('futuresight'), {
				accuracy: true, damage: 40, onTry: undefined,
			});
			battle.actions.trySpreadMoveHit([holder], foe, move, true);
			battle.clearActiveMove();
		};
		land();
		assert.equal(holder.hp, 2960);
		land();
		assert.equal(holder.hp, 2960 + 3333);
		battle.makeChoices('switch 2', 'move splash');
		battle.makeChoices('switch 2', 'move splash');
		land();
		assert.equal(holder.hp, 2960 + 3333 - 20 + 2500);
	});
	it('keeps a full block from stealing boosts or consuming an attacking Gem', () => {
		const [holder, foe] = start('Misaligned Stars');
		holder.hp = 3000;
		hit(foe, holder, 'spectralthief', { damage: 20 });
		foe.setItem('Ghost Gem');
		holder.boosts.atk = 2;
		assert.equal(hit(foe, holder, 'spectralthief'), -3333);
		assert.equal(holder.boosts.atk, 2);
		assert.equal(foe.boosts.atk, 0);
		assert.equal(foe.item, 'ghostgem');
		hit(foe, holder, 'spectralthief');
		assert.equal(holder.boosts.atk, 0);
		assert.equal(foe.boosts.atk, 2);
		assert.equal(foe.item, '');
	});
	it('applies momentum only after the entire multihit move and caps at ten', () => {
		const [p, foe] = start('Frame Perfect');
		const first = hit(p, foe, 'tackle', { multihit: 5 });
		assert.equal(p.m.framePerfect.momentum, 5);
		const second = hit(p, foe, 'tackle', { multihit: 5 });
		assert(second > first * 1.12 && second < first * 1.18);
		assert.equal(p.m.framePerfect.momentum, 10);
		hit(p, foe);
		assert.equal(p.m.framePerfect.momentum, 10);
		assert.equal(battle.runEvent('ModifyDamage', foe, p, Dex.getActiveMove('tackle'), 100), 90);
	});
	it('counts one momentum per spread hit and maintains a partly blocked spread move', () => {
		const [p, foe, , other] = start('Frame Perfect', true);
		hit(p, foe, 'tackle', { multihit: 3, target: 'allAdjacentFoes' });
		assert.equal(p.m.framePerfect.momentum, 3);
		other.addVolatile('protect');
		hit(p, foe, 'tackle', { target: 'allAdjacentFoes' });
		assert.equal(p.m.framePerfect.momentum, 4);
	});
	it('keeps momentum through different attacks, misses and blocks; clears on status', () => {
		const [p, foe] = start('Frame Perfect');
		hit(p, foe, 'tackle', { multihit: 5 });
		hit(p, foe, 'watergun');
		assert.equal(p.m.framePerfect.momentum, 6);
		hit(p, foe, 'splash');
		assert.equal(p.m.framePerfect.momentum, 0);
		hit(p, foe);
		hit(p, foe, 'tackle', { accuracy: 0 });
		assert.equal(p.m.framePerfect.momentum, 1);
		hit(p, foe);
		foe.addVolatile('protect');
		hit(p, foe);
		assert.equal(p.m.framePerfect.momentum, 2);
	});
	it('clears when unable to act while retaining Inner Focus', () => {
		const [p, foe] = start('Frame Perfect');
		hit(p, foe);
		assert(!p.addVolatile('flinch', foe));
		battle.boost({ atk: -1 }, p, foe, Dex.abilities.get('intimidate'));
		assert.equal(p.boosts.atk, 0);
		p.setStatus('slp');
		hit(p, foe);
		assert.equal(p.m.framePerfect.momentum, 0);
	});
	it('defers Speed changes until next turn and stacks normally with Metronome', () => {
		const [p, foe] = start('Frame Perfect', false, 'Mew', 'Metronome');
		const speed = p.getStat('spe');
		hit(p, foe, 'tackle', { multihit: 5 });
		assert.equal(p.getStat('spe'), speed);
		battle.turn++;
		assert(Math.abs(p.getStat('spe') - speed * 1.25) <= 1);
		p.moveLastTurnResult = true;
		const first = foe.hp;
		hit(p, foe);
		const boosted = first - foe.hp;
		assert.equal(p.volatiles.metronome.numConsecutive, 1);
		assert(boosted > 0);
		assert.equal(p.m.framePerfect.momentum, 6);
		const move = prepare(p, 'tackle');
		assert.equal(battle.runEvent('ModifyDamage', p, foe, move, 100), 142);
	});
	it('clears Frame Perfect on switching', () => {
		const [p, foe] = start('Frame Perfect');
		hit(p, foe);
		battle.makeChoices('switch 2', 'move splash');
		assert(!p.m.framePerfect);
	});
	it('alternates each Stars record and cushions one previously blocked volley on re-entry', () => {
		const [p, foe] = start('Misaligned Stars');
		const reenter = () => {
			battle.makeChoices('switch 2', 'move splash');
			battle.makeChoices('switch 2', 'move splash');
		};
		const attack = extra => hit(foe, p, 'tackle', { damage: 20, multihit: 3, ...extra });
		const status = () => hit(foe, p, 'growl');
		p.hp = 2000;
		assert.equal(attack(), 60);
		status();
		reenter();
		assert.equal(attack({ accuracy: 0 }), 0);
		p.addVolatile('protect');
		assert.equal(attack(), 0);
		p.removeVolatile('protect');
		p.setType('Ghost');
		assert.equal(attack(), 0);
		p.setType('Normal');
		p.addVolatile('substitute');
		p.volatiles.substitute.hp = 500;
		assert.equal(attack(), 0);
		p.removeVolatile('substitute');
		assert.equal(attack(), -3333);
		assert.equal(status(), -3333);
		assert.equal(p.boosts.atk, 0);
		assert.equal(attack(), 60);
		reenter();
		assert.equal(attack({ accuracy: 0 }), 0);
		const before = p.hp;
		assert.equal(attack(), 30 - Math.min(2500, p.maxhp - (before - 30)));
		p.hp = 2000;
		assert.equal(attack(), -3333);
		assert.equal(attack(), 60);
		assert.equal(status(), 0);
		assert.equal(p.boosts.atk, -1);
		reenter();
		p.hp = 12;
		assert.equal(attack(), 12);
		assert.equal(p.hp, 0);
	});
	for (const ability of ['Convergence', 'Insight', 'Cold Logic'])
		it(ability + ' keeps partial and full charges through switches', () => {
			const [p, foe] = start(ability);
			hit(p, foe, 'tackle');
			battle.makeChoices('switch 2', 'move splash');
			battle.makeChoices('switch 2', 'move splash');
			assert(p.m.convergence.Physical);
			assert(!p.m.convergence.Special);
			hit(p, foe, 'watergun');
			battle.makeChoices('switch 2', 'move splash');
			battle.makeChoices('switch 2', 'move splash');
			const move = prepare(p, 'tackle');
			assert(move.convergenceAttack);
			assert(!p.m.convergence.Physical && !p.m.convergence.Special);
		});
	it('runs passive Frame Perfect once even when it is also selected', () => {
		const [p, foe] = start('Frame Perfect', false, 'Accelgor');
		hit(p, foe, 'tackle', { multihit: 3 });
		assert.equal(p.m.framePerfect.momentum, 3);
		const move = prepare(p, 'tackle');
		assert.equal(battle.runEvent('ModifyDamage', p, foe, move, 100), 109);
		assert.deepEqual(AbilityComponents.frameperfect, ['innerfocus']);
	});
	it('preserves recorded protection through battle serialization', () => {
		const [p, foe] = start('Misaligned Stars');
		hit(foe, p);
		const { State } = require('../../../dist/sim/state');
		const saved = JSON.stringify(State.serializeBattle(battle));
		battle.destroy();
		battle = State.deserializeBattle(saved);
		const holder = battle.p1.active[0];
		holder.hp = holder.maxhp / 2;
		assert.equal(hit(battle.p2.active[0], holder), -Math.floor(holder.maxhp / 3));
	});
	it('clears Frame Perfect on a no-PP attempt or a failed before-move callback', () => {
		const [p, foe] = start('Frame Perfect');
		hit(p, foe);
		p.moveSlots[0].pp = 0;
		battle.actions.runMove('tackle', p, 1);
		assert.equal(p.m.framePerfect.momentum, 0);
		hit(p, foe);
		hit(p, foe, 'tackle', {
			beforeMoveCallback() {
				return true;
			},
		});
		assert.equal(p.m.framePerfect.momentum, 0);
	});
	it('preserves Convergence charges when unable to act without an uncharged defensive-stage bypass', () => {
		const [p, foe] = start('Insight');
		charged(p);
		p.setStatus('slp');
		hit(p, foe);
		assert(p.m.convergence.Physical && p.m.convergence.Special);
		p.cureStatus();
		p.m.convergence.Physical = p.m.convergence.Special = false;
		hit(p, foe, 'tackle');
		assert(!p.abilityState.auraReads);
		assert(!p.hasAbility('telepathy'));
	});
});
