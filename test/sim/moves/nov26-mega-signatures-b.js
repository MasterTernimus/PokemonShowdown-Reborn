'use strict';
const assert = require('node:assert/strict');
const common = require('../../common');
const { Dex, TeamValidator } = require('../../../dist/sim');
const { MegaSignaturesNov26B: signatures } = require('../../../dist/data/mega-signatures-nov26-b');

describe('Mega signatures from Last Blossom to Echo Break', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });
	function setup(form, moves = [signatures[form].base], foe = 'Mew') {
		const mega = Dex.species.get(form), base = Dex.species.get(mega.battleOnly || mega.baseSpecies);
		const set = { species: base.name, item: mega.requiredItem || mega.requiredItems[0], ability: base.abilities[0], moves };
		const spare = { species: 'Mew', ability: 'No Ability', moves: ['splash'] };
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[set, spare], [{ ...spare, species: foe }, spare]]);
		battle.makeChoices('team 12', 'team 12');
		const user = battle.p1.active[0], target = battle.p2.active[0];
		user.formeChange(mega.name, Dex.items.get(set.item), true);
		user.hp = user.maxhp = user.baseMaxhp = target.hp = target.maxhp = target.baseMaxhp = 10000;
		battle.randomizer = x => x;
		battle.randomChance = (n, d) => n >= d;
		return { user, target, set };
	}
	function use(move, user, target) {
		battle.actions.useMove(move, user, { target });
		battle.clearActiveMove();
		return user.lastMoveUsed;
	}
	for (const [form, sig] of Object.entries(signatures)) {
		it(form + ' keeps a legal learned slot for ' + sig.name, () => {
			const { user, target, set } = setup(form);
			assert.equal(new TeamValidator('gen9nofieldsinglesgame').validateSet(set, {}), null);
			const learned = Dex.moves.get(sig.base);
			const signature = Dex.moves.get(sig.name);
			assert(signature.exists);
			assert.equal(signature.pp, learned.pp);
			const move = use(sig.base, user, target);
			assert.equal(move.name, sig.name);
			assert.equal(move.id, sig.base);
			for (const [tag, flag] of Object.entries(learned.flags)) {
				if (flag) assert(move.flags[tag], form + ': ' + tag);
			}
			assert.equal(user.moveSlots[0].id, sig.base);
		});
	}
	it('gives Thrash Water STAB and respects Raging Storm’s rampage exemption', () => {
		const { user, target } = setup('gyaradosmega');
		const move = use('thrash', user, target);
		assert.deepEqual([move.type, move.basePower], ['Water', 145]);
		assert(!user.volatiles.lockedmove);
		assert.equal(Dex.moves.get('riptiderampage').self.volatileStatus, 'lockedmove');
		assert(user.hasType('Water'));
	});
	it('sets a three-turn screen from Ward Pulse and only triggers once per entry', () => {
		const { user, target } = setup('meowsticmmega');
		battle.field.setTerrain('psychicterrain', user);
		const move = use('psychic', user, target);
		assert.equal(move.basePower, 115);
		assert(move.flags.pulse);
		assert.equal(user.side.sideConditions.lightscreen.duration, 3);
		use('psychic', user, target);
		assert.equal(user.side.sideConditions.lightscreen.duration, 3);
	});
	it('Fracture Pulse only breaks Reflect on a successful hit and can do so once per entry', () => {
		const { user, target } = setup('meowsticfmega');
		battle.field.setTerrain('psychicterrain', user);
		target.side.addSideCondition('reflect', target);
		target.addVolatile('protect', target);
		use('psyshock', user, target);
		assert(target.side.sideConditions.reflect);
		target.removeVolatile('protect');
		const move = use('psyshock', user, target);
		assert.equal(move.basePower, 120);
		assert(move.flags.pulse);
		assert.equal(move.overrideDefensiveStat, 'def');
		assert(!target.side.sideConditions.reflect);
		target.side.addSideCondition('reflect', target);
		use('psyshock', user, target);
		assert(target.side.sideConditions.reflect);
	});
	it('Mind Fracture shatters Light Screen once without spending its effect on blocked hits', () => {
		const { user, target } = setup('mewtwomegay');
		target.side.addSideCondition('lightscreen', target);
		target.addVolatile('protect', target);
		use('psystrike', user, target);
		assert(target.side.sideConditions.lightscreen);
		target.removeVolatile('protect');
		use('psystrike', user, target);
		assert(!target.side.sideConditions.lightscreen);
		target.side.addSideCondition('lightscreen', target);
		use('psystrike', user, target);
		assert(target.side.sideConditions.lightscreen);
	});
	it('Psi Knuckle ignores exactly one positive Defense stage', () => {
		const { user, target } = setup('mewtwomegax');
		const roll = stage => {
			target.boosts.def = stage;
			const before = target.hp;
			use('drainpunch', user, target);
			return before - target.hp;
		};
		const base = roll(0);
		assert.equal(roll(1), base);
		assert(roll(2) < base);
		assert(roll(-1) > base);
	});
	it('Witch Moon reads Future Sight in the target slot, including a queue placed by Temporal Shift', () => {
		const { user, target } = setup('mismagiusmega');
		const power = () => {
			const m = Dex.getActiveMove('witchmoon');
			return m.basePowerCallback.call(battle, user, target, m);
		};
		assert.equal(power(), 105);
		target.side.addSlotCondition(target, 'futuremove', user);
		const queued = target.side.slotConditions[target.position].futuremove;
		queued.move = 'doomdesire';
		assert.equal(power(), 105);
		queued.move = 'futuresight';
		queued.moveData = { temporalShiftHex: true };
		assert.equal(power(), 120);
		assert.equal(target.side.slotConditions[target.position].futuremove, queued);
	});
	it('Star Verdict actually charges the next instant Wish once', () => {
		const { user, target } = setup('jirachimega', ['doomdesire', 'wish']);
		assert(user.hasAbility('yearningstar'));
		use('doomdesire', user, target);
		assert(target.hp < target.maxhp);
		assert.equal(user.m.starVerdictWishEntry, user.previouslySwitchedIn);
		user.hp = 1;
		use('wish', user, user);
		assert.equal(user.hp, 6251);
		user.hp = 1;
		use('wish', user, user);
		assert.equal(user.hp, 5001);
	});
	it('Fleur Salvo only halves its normal two-stage self-drop on a knockout', () => {
		const { user, target } = setup('magearnamega');
		user.setAbility('No Ability');
		use('fleurcannon', user, target);
		assert.equal(user.boosts.spa, -2);
		user.boosts.spa = 0;
		target.hp = 1;
		use('fleurcannon', user, target);
		assert.equal(target.hp, 0);
		assert.equal(user.boosts.spa, -1);
	});
	it('Echo Break remembers other sound moves for exactly the next turn', () => {
		const { user, target } = setup('noivernmega', ['boomburst', 'hypervoice']);
		const power = () => {
			const m = Dex.getActiveMove('echobreak');
			return m.basePowerCallback.call(battle, user, target, m);
		};
		use('hypervoice', user, target);
		assert.equal(power(), 145);
		battle.turn++;
		assert.equal(power(), 150);
		battle.turn++;
		assert.equal(power(), 145);
	});
});
