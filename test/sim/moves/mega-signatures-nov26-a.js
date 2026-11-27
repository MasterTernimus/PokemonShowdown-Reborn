'use strict';

const assert = require('node:assert/strict');
const common = require('../../common');
const { Dex, TeamValidator } = require('../../../dist/sim');
const { MegaSignaturesNov26A: signatures } = require('../../../dist/data/mega-signatures-nov26-a');

describe('November Mega signatures from Absol through Falinks', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });

	function setup(form) {
		const mega = Dex.species.get(form);
		const base = Dex.species.get(mega.changesFrom || mega.baseSpecies);
		const signature = signatures[form];
		const set = { species: base.name, ability: base.abilities[0], item: mega.requiredItems[0], moves: [signature.base] };
		assert.equal(new TeamValidator('gen9nofieldsinglesgame@@@Obtainable Abilities,Obtainable Moves').validateSet(set, {}), null);
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[set],
			[{ species: 'Mew', ability: 'No Ability', item: 'Leftovers', moves: ['splash', 'reflect', 'thunderwave'] }]]);
		battle.makeChoices('team 1', 'team 1');
		const [user, target] = battle.getAllActive();
		user.formeChange(mega, Dex.items.get(set.item), true);
		for (const p of [user, target]) p.maxhp = p.baseMaxhp = p.hp = 10000;
		return { user, target, signature };
	}
	function attack(move, source, target) {
		battle.actions.useMove(move, source, { target });
		battle.clearActiveMove();
		return source.lastMoveUsed;
	}
	for (const [form, signature] of Object.entries(signatures)) {
		it(form + ' resolves the learned slot and inherits its tags on both adaptive categories', () => {
			const { user, target } = setup(form);
			battle.randomChance = (n, d) => n >= d;
			const original = Dex.moves.get(signature.base);
			for (const physical of [true, false]) {
				user.storedStats.atk = physical ? 400 : 100;
				user.storedStats.spa = physical ? 100 : 400;
				user.boosts.atk = user.boosts.spa = 0;
				const move = attack(signature.base, user, target);
				assert.equal(move.name, signature.name);
				assert.equal(move.category, physical ? 'Physical' : 'Special');
				assert.equal(move.id, original.id);
				for (const [flag, on] of Object.entries(original.flags)) if (on) assert(move.flags[flag], flag);
			}
		});
	}
	it('Omen Pulse spends its reflected-move bonus even on protection', () => {
		const { user, target } = setup('absolmega');
		assert.equal(attack('darkpulse', user, target).basePower, 95);
		attack('thunderwave', target, user);
		target.addVolatile('protect', target);
		assert.equal(attack('darkpulse', user, target).basePower, 115);
		target.removeVolatile('protect');
		assert.equal(attack('darkpulse', user, target).basePower, 95);
	});
	it('Hood Flare drops Sp. Def only when the foe was already poisoned', () => {
		const { user, target } = setup('arbokmegay');
		battle.randomChance = (n, d) => n >= d || n === 30;
		attack('sludgebomb', user, target);
		assert.equal(target.status, 'psn');
		assert.equal(target.boosts.spd, 0);
		attack('sludgebomb', user, target);
		assert.equal(target.boosts.spd, -1);
	});
	it('Cross Stitch slows a faster target, then traps it through the following turn', () => {
		const { user, target } = setup('ariadosmega');
		user.getPassives = () => [];
		user.setAbility('No Ability');
		user.storedStats.spe = 180;
		target.storedStats.spe = 200;
		attack('crosspoison', user, target);
		assert.equal(target.boosts.spe, -1, battle.log.slice(-8).join('\n'));
		assert(!target.volatiles.trapped);
		attack('crosspoison', user, target);
		assert.equal(target.volatiles.trapped.duration, 2);
		assert.equal(target.boosts.spe, -1);
	});
	it('Volley Shot shatters Reflect without a previous kick, but Protect preserves it', () => {
		const { user, target } = setup('cinderacemega');
		target.side.addSideCondition('reflect', target);
		target.addVolatile('protect', target);
		attack('pyroball', user, target);
		assert(target.side.sideConditions.reflect);
		target.removeVolatile('protect');
		attack('pyroball', user, target);
		assert(!target.side.sideConditions.reflect);
	});
	it('Vigil Flame feeds on a burned foe once per turn', () => {
		const { user, target } = setup('chandeluremega');
		user.setAbility('No Ability');
		user.getPassives = () => [];
		user.hp = 5000;
		target.setStatus('brn', user);
		const move = attack('shadowball', user, target);
		assert.equal(move.basePowerCallback.call(battle, user, target, move), 120);
		assert.equal(user.hp, 6250, battle.log.slice(-8).join('\n'));
		attack('shadowball', user, target);
		assert.equal(user.hp, 6250);
	});
	it('Passing Bell has Ghost STAB, reaches through Substitute and gains power against Disable', () => {
		const { user, target } = setup('chimechomegay');
		target.addVolatile('substitute', target);
		const hp = target.hp;
		const move = attack('ominouswind', user, target);
		assert(user.hasType(move.type) && move.type === 'Ghost' && move.flags.sound && move.flags.bypasssub);
		assert(target.hp < hp);
		assert.equal(move.basePowerCallback.call(battle, user, target, move), 85);
		target.moveSlots[0].disabled = true;
		assert.equal(move.basePowerCallback.call(battle, user, target, move), 105);
	});
	it('Pack Ice Punch punishes a foe that already moved but keeps its Speed cost', () => {
		const { user, target } = setup('crabominablemega');
		attack('reflect', target, target);
		target.moveThisTurn = 'reflect';
		target.side.addSideCondition('auroraveil', target);
		const move = attack('icehammer', user, target);
		assert.equal(move.basePowerCallback.call(battle, user, target, move), 125);
		assert(!target.side.sideConditions.reflect && !target.side.sideConditions.auroraveil);
		assert.equal(user.boosts.spe, -1);
	});
	it('Dynamo Crash has reduced recoil and restores lost Speed on Electric Aura', () => {
		const { user, target } = setup('eelektrossmega');
		battle.field.setTerrain('forestterrain', user);
		assert(battle.field.setAura('electricterrain', 3, user));
		user.boosts.spe = -2;
		const move = attack('wildcharge', user, target);
		assert.deepEqual(move.recoil, [1, 8]);
		assert.equal(user.boosts.spe, 0, battle.log.slice(-8).join('\n'));
		assert(user.hp < 10000);
	});
});
