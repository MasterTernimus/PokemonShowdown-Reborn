'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim');

describe('Hitmon passive and signature rework', () => {
	let battle;
	afterEach(() => battle?.destroy());
	const set = (species = 'Mew', ability = 'No Ability', moves = ['splash', 'suckerpunch', 'tackle']) => ({species, ability, moves});
	function setup(species = 'Hitmonchan', ability = 'Check Hook', gameType = 'singles', foeAbility = 'No Ability') {
		const teams = [[set(species, ability), set()], [set('Mew', foeAbility), set()]];
		if (gameType === 'freeforall') teams.push([set()], [set()]);
		battle = common.createBattle({gameType}, teams);
		for (const side of battle.sides) for (const p of side.pokemon) {if (p.species.id === 'mew') p.getPassives = () => []; p.hp = p.maxhp = p.baseMaxhp = 10000;}
		battle.random = (m, n) => n === undefined ? m - 1 : n - 1;
		battle.randomizer = value => value;
		battle.randomChance = (n, d) => n >= d;
		return [battle.p1.active[0], battle.p2.active[0]];
	}
	function hit(p, q, id = 'tackle', extra = {}) {
		battle.actions.useMove(Object.assign(Dex.getActiveMove(id), {accuracy: true, willCrit: false}, extra), p, {target: q});
		return p.lastMoveUsed;
	}
	function counterRoll(result) {
		let rolls = 0;
		battle.randomChance = (n, d) => {if (n === 1 && d === 2) {rolls++; return result;} return n >= d;};
		return () => rolls;
	}
	it('assigns the new hidden abilities and complete Fiend passives', () => {
		for (const [id, ability, passive] of [['hitmonchan', 'Check Hook', 'punchfiend'], ['hitmonlee', 'Springheel', 'kickfiend'], ['hitmontop', 'Cyclone Rhythm', 'spinfiend']]) {
			assert.equal(Dex.species.get(id).abilities.H, ability); assert.deepEqual(Dex.species.get(id).passives, [passive]);
		}
	});
	it('Punch Fiend supplies Iron Fist once, Serene Grace and Keen Eye', () => {
		const [p, q] = setup(); const move = hit(p, q, 'firepunch');
		assert.equal(battle.runEvent('BasePower', p, q, move, 1000), 1400);
		assert.equal(move.secondaries[0].chance, 40); assert(move.ignoreEvasion);
		battle.boost({accuracy: -1}, p, q); assert.equal(p.boosts.accuracy, 0);
	});
	it('Kick Fiend supplies Striker, Limber and Serene Grace without first-turn stat multipliers', () => {
		const [p, q] = setup('Hitmonlee', 'Springheel'); const move = hit(p, q, 'axekick');
		assert.equal(battle.runEvent('BasePower', p, q, move, 1000), 1400);
		assert.equal(move.secondaries[0].chance, 60);
		assert(!p.trySetStatus('par', q)); battle.boost({spe: -1}, p, q); assert.equal(p.boosts.spe, 0);
		assert.equal(battle.runEvent('ModifySpe', p, null, null, 1000), 1000);
		assert.equal(battle.runEvent('ModifyAtk', p, q, move, 1000), 1000);
	});
	it('Spin Fiend supplies Technician, local Vital Spirit and Steadfast', () => {
		const [p, q] = setup('Hitmontop', 'Cyclone Rhythm');
		assert(!p.trySetStatus('slp', q)); assert(!p.addVolatile('yawn', q));
		assert.equal(battle.runEvent('ModifyAtk', p, q, Dex.getActiveMove('machpunch'), 1000), 1300);
		assert.equal(battle.runEvent('BasePower', p, q, Dex.getActiveMove('tackle'), 40), 60);
		battle.runEvent('Flinch', p); assert.equal(p.boosts.spe, 1);
	});
	it('selected copies of Fiend passives do not apply their components twice', () => {
		const [p, q] = setup('Hitmonchan', 'Punch Fiend'); const move = hit(p, q, 'firepunch');
		assert.equal(battle.runEvent('BasePower', p, q, move, 1000), 1400); assert.equal(move.secondaries[0].chance, 40);
	});
	it('an acquired Vital Spirit does not double the Spin Fiend Fighting modifier', () => {
		const [p, q] = setup('Hitmontop', 'Vital Spirit');
		assert.equal(battle.runEvent('ModifyAtk', p, q, Dex.getActiveMove('machpunch'), 1000), 1300);
	});
	it('Check Hook counters before damage for 2 PP without consuming its chosen action', () => {
		const [p, q] = setup(); const rolls = counterRoll(true), pp = p.moveSlots[1].pp;
		const start = battle.log.length; hit(q, p);
		const log = battle.log.slice(start); assert.equal(rolls(), 1); assert(q.hp < q.maxhp); assert(p.hp < p.maxhp);
		assert(log.findIndex(l => l.startsWith('|move|') && l.includes('|Sucker Punch|')) < log.findIndex(l => l.startsWith('|-damage|') && l.includes('p1a:')));
		assert.equal(p.moveSlots[1].pp, pp - 2); assert(battle.queue.willMove(p) === null || !p.moveThisTurn);
		assert.equal(battle.activePokemon, q); assert.equal(battle.activeMove.id, 'tackle');
	});
	it('the fixed 50% roll can fail despite Serene Grace and rolls only once for multiple hits', () => {
		const [p, q] = setup(); let rolls = counterRoll(false); hit(q, p, 'doublehit', {multihit: 3});
		assert.equal(rolls(), 1); assert.equal(q.hp, q.maxhp);
		rolls = counterRoll(true); hit(q, p, 'doublehit', {multihit: 3}); assert.equal(rolls(), 1);
	});
	it('retains the scheduled normal action after countering a faster foe', () => {
		const [p, q] = setup(); counterRoll(true); q.boosts.spe = 6;
		const counterPP = p.moveSlots[1].pp, tacklePP = p.moveSlots[2].pp, start = battle.log.length;
		battle.makeChoices('move tackle', 'move tackle');
		const moves = battle.log.slice(start).filter(l => l.startsWith('|move|') && l.includes('p1a:'));
		assert(moves.some(l => l.includes('|Sucker Punch|'))); assert(moves.some(l => l.includes('|Tackle|')));
		assert.equal(p.moveSlots[1].pp, counterPP - 2); assert.equal(p.moveSlots[2].pp, tacklePP - 1);
	});

 it('requires Sucker Punch in a current moveslot', () => {
  const [p,q]=setup();p.moveSlots=p.moveSlots.filter(s=>s.id!=='suckerpunch');const rolls=counterRoll(true);hit(q,p);
  assert.equal(rolls(),0);assert.equal(q.hp,q.maxhp);
 });
 for(const pp of [0,1]) it('does not counter with only '+pp+' PP',()=>{
  const [p,q]=setup();p.moveSlots[1].pp=pp;const rolls=counterRoll(true);hit(q,p);
  assert.equal(rolls(),0);assert.equal(p.moveSlots[1].pp,pp);assert.equal(q.hp,q.maxhp);
 });
 it('spends no PP when the counter roll fails',()=>{
  const [p,q]=setup();const pp=p.moveSlots[1].pp;counterRoll(false);hit(q,p);assert.equal(p.moveSlots[1].pp,pp);
 });
 it('spends exactly 2 PP once per multihit attack, including a blocked counter',()=>{
  const [p,q]=setup();p.moveSlots[1].pp=4;counterRoll(true);hit(q,p,'doublehit',{multihit:3});assert.equal(p.moveSlots[1].pp,2);
  battle.field.setTerrain('psychicterrain',p);const before=q.hp;hit(q,p);assert.equal(p.moveSlots[1].pp,0);assert.equal(q.hp,before);
 });
 it('doubles Pressure costs and refuses partial payment',()=>{
  const [p,q]=setup('Hitmonchan','Check Hook','singles','Pressure');p.moveSlots[1].pp=6;counterRoll(true);hit(q,p);
  assert.equal(p.moveSlots[1].pp,2);const before=q.hp;hit(q,p);assert.equal(p.moveSlots[1].pp,2);assert.equal(q.hp,before);
 });
 it('uses the redirected counter target for Pressure costs',()=>{
  const [p,q]=setup('Hitmonchan','Check Hook','doubles');const redirect=battle.p2.active[1];redirect.setAbility('Pressure');
  battle.actions.useMove('followme',redirect);p.moveSlots[1].pp=4;counterRoll(true);hit(q,p);
  assert.equal(p.moveSlots[1].pp,0);assert.equal(q.hp,q.maxhp);assert(redirect.hp<redirect.maxhp);
 });
	it('each opposing holder can counter a spread attack once, without chaining counters', () => {
		const [p, q] = setup('Hitmonchan', 'Check Hook', 'doubles');
		battle.p1.active[1].setAbility('Check Hook'); const rolls = counterRoll(true); hit(q, p, 'heatwave');
		assert.equal(rolls(), 2);
	});
	it('a free counter does not Choice-lock or consume the scheduled attack', () => {
		const [p, q] = setup(); counterRoll(true); p.setItem('choiceband'); q.boosts.spe = 6;
		const pp = p.moveSlots[2].pp;
		battle.makeChoices('move tackle', 'move tackle');
		assert.equal(p.moveSlots[2].pp, pp - 1); assert.equal(p.volatiles.choicelock.move, 'tackle');
	});
	it('a holder KO from counter contact damage cannot receive the incoming hit', () => {
		const [p, q] = setup('Hitmonchan', 'Check Hook', 'singles', 'Rough Skin'); counterRoll(true); p.hp = 1;
		const start = battle.log.length; hit(q, p);
		assert.equal(p.hp, 0);
		const damage = battle.log.slice(start).filter(line => line.startsWith('|-damage|p1a:'));
		// Exact-HP and public protocol lines both report the same contact damage.
		assert(damage.length > 0); assert(damage.every(line => line.includes('Rough Skin')));
	});
	it('Technician checks its threshold before Cyclone Rhythm boosts the spin', () => {
		const [p, q] = setup('Hitmontop', 'Cyclone Rhythm');
		assert.equal(battle.runEvent('BasePower', p, q, Dex.getActiveMove('gyroball'), 60), 108);
		assert.equal(battle.runEvent('BasePower', p, q, Dex.getActiveMove('gyroball'), 70), 84);
	});
	it('reacts only for the actual redirected target', () => {
		const [p, q] = setup('Hitmonchan', 'Check Hook', 'doubles'); const rolls = counterRoll(true);
		battle.actions.useMove('followme', p); hit(q, battle.p1.active[1]); assert.equal(rolls(), 1);
	});
	it('does not react to allies, status moves, or another Check Hook counter', () => {
		const [p, q] = setup('Hitmonchan', 'Check Hook', 'doubles', 'Check Hook'); const rolls = counterRoll(true);
		hit(battle.p1.active[1], p); hit(q, p, 'growl'); assert.equal(rolls(), 0);
		hit(q, p); assert.equal(rolls(), 1);
	});
	it('rechecks opposing attacks in doubles and free-for-all', () => {
		const [p, q] = setup('Hitmonchan', 'Check Hook', 'freeforall'); const rolls = counterRoll(true);
		for (const foe of [q, battle.p3.active[0], battle.p4.active[0]]) hit(foe, p);
		assert.equal(rolls(), 3);
	});
	it('a counter KO cancels all targets of an incoming spread move', () => {
		const [p, q] = setup('Hitmonchan', 'Check Hook', 'doubles'); counterRoll(true); q.hp = 1;
		const ally = battle.p1.active[1], before = ally.hp; hit(q, p, 'heatwave');
		assert.equal(q.hp, 0); assert.equal(p.hp, p.maxhp); assert.equal(ally.hp, before);
	});
	it('priority-blocking effects stop the free Sucker Punch without stopping the incoming attack', () => {
		const [p, q] = setup(); counterRoll(true); battle.field.setTerrain('psychicterrain', p);
		hit(q, p); assert.equal(q.hp, q.maxhp); assert(p.hp < p.maxhp);
	});
	it('Queenly Majesty also blocks the counter', () => {
		const [p, q] = setup('Hitmonchan', 'Check Hook', 'singles', 'Queenly Majesty'); counterRoll(true);
		hit(q, p); assert.equal(q.hp, q.maxhp); assert(p.hp < p.maxhp);
	});
	it('suppression disables Check Hook but leaves its species passive intact', () => {
		const [p, q] = setup(); const rolls = counterRoll(true); p.addVolatile('gastroacid'); hit(q, p);
		assert.equal(rolls(), 0); const move = hit(p, q, 'firepunch'); assert.equal(move.secondaries[0].chance, 40);
	});
	for (const id of ['highjumpkick', 'jumpkick', 'axekick']) {
		it('Springheel prevents ' + id + ' crash damage on a miss', () => {
			const [p, q] = setup('Hitmonlee', 'Springheel'); const before = p.hp; hit(p, q, id, {accuracy: 0});
			assert.equal(p.hp, before); assert.equal(q.hp, q.maxhp);
		});
	}
	it('Springheel prevents crash on type immunity and suppression restores ordinary crash damage', () => {
		const [p, q] = setup('Hitmonlee', 'Springheel'); q.setType('Ghost'); hit(p, q, 'highjumpkick'); assert.equal(p.hp, p.maxhp);
		p.addVolatile('gastroacid'); hit(p, q, 'highjumpkick'); assert.equal(p.hp, p.maxhp / 2);
	});
	it('Springheel ignores positive defensive stages for kicks but preserves negative stages and screens', () => {
		const [p, q] = setup('Hitmonlee', 'Springheel'); let before = q.hp; hit(p, q, 'lowkick'); const base = before - q.hp;
		q.boosts.def = 4; before = q.hp; hit(p, q, 'lowkick'); assert.equal(before - q.hp, base);
		q.boosts.def = -2; before = q.hp; hit(p, q, 'lowkick'); assert(before - q.hp > base);
		q.boosts.def = 0; q.side.addSideCondition('reflect', q); before = q.hp; hit(p, q, 'lowkick'); assert(before - q.hp < base);
	});
	for (const id of ['rapidspin', 'mortalspin', 'icespinner', 'gyroball', 'tripleaxel']) {
		it('Cyclone Rhythm boosts ' + id + ' and grants Defense only once', () => {
			const [p, q] = setup('Hitmontop', 'Cyclone Rhythm', 'doubles'); const move = hit(p, q, id);
			assert.equal(p.boosts.def, 1);
			// A large relay value excludes Technician so this isolates the spin bonus.
			assert.equal(battle.runEvent('BasePower', p, q, move, 1000), 1200);
		});
	}
	it('blocked spins do not grant Defense, while Substitute damage does', () => {
		const [p, q] = setup('Hitmontop', 'Cyclone Rhythm'); q.addVolatile('maxguard'); hit(p, q, 'mortalspin');
		assert.equal(p.boosts.def, 0); q.removeVolatile('maxguard'); q.addVolatile('substitute'); hit(p, q, 'rapidspin');
		assert.equal(p.boosts.def, 1);
	});
	it('spins do not grant Defense on misses, type immunity or allied damage', () => {
		const [p, q] = setup('Hitmontop', 'Cyclone Rhythm', 'doubles'); hit(p, q, 'rapidspin', {accuracy: 0});
		q.setType('Ghost'); hit(p, q, 'rapidspin'); hit(p, battle.p1.active[1], 'rapidspin');
		assert.equal(p.boosts.def, 0);
	});
	for (const [species, ability] of [['Hitmonchan', 'Check Hook'], ['Hitmonlee', 'Springheel'], ['Hitmontop', 'Cyclone Rhythm']]) {
		it(ability + ' preserves Unseen Fist protection behavior', () => {
			const [p, q] = setup(species, ability); q.addVolatile('protect'); hit(p, q, 'tackle');
			assert(q.hp < q.maxhp); q.removeVolatile('protect'); q.addVolatile('maxguard');
			const before = q.hp; hit(p, q, 'tackle'); assert.equal(q.hp, before);
		});
	}
});
