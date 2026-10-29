'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim/dex');
const { LoreDescriptions } = require('../../../dist/data/lore-pairs');
let battle;

function start(species, ability, mode = 'singles', foeAbility = 'No Ability', item = '') {
	const unit = { species: 'Mew', ability: foeAbility, moves: ['splash', 'tackle', 'calmmind', 'protect'] };
	const team = [{ species, ability, item, moves: ['hypervoice', 'extremespeed', 'thunderbolt', 'splash'] }, { ...unit, ability: 'No Ability' }, { ...unit, ability: 'No Ability' }];
	const foes = [unit, { ...unit }, { ...unit }];
	battle = common.createBattle({ formatid: mode === 'ffa' ? 'gen9freeforall4pmistyfieldadrienn' :
		mode === 'doubles' ? 'gen9nofielddoublesbattle' : 'gen9nofieldsinglesgame' },
	mode === 'ffa' ? [team, foes, foes, foes] : [team, foes]);
	battle.makeChoices(...battle.sides.map(() => 'team 123'));
	battle.field.terrain = '';
	battle.randomizer = damage => damage;
	battle.randomChance = (n, d) => n >= d;
	for (const side of battle.sides) for (const p of side.active) p.hp = p.maxhp = p.baseMaxhp = 4096;
	return [battle.p1.active[0], battle.p2.active[0]];
}

function hit(source, target, id, extra = {}) {
	battle.clearActiveMove();
	const move = battle.dex.getActiveMove(id);
	Object.assign(move, { accuracy: true, willCrit: false }, extra);
	const before = target.hp;
	battle.actions.useMove(move, source, { target });
	const used = battle.activeMove;
	battle.runEvent('AfterMove', source, target, used);
	battle.clearActiveMove();
	return { move: used, damage: before - target.hp };
}

function freshTurn() { battle.turn++; for (const p of battle.getAllActive()) p.moveThisTurnResult = undefined; }
function field(id, p) { battle.field.setTerrain(id, p); }

describe('Lore partnership reworks', () => {
	afterEach(() => { battle?.destroy(); battle = null; });
	it('publishes exact slots, leaves Gardevoir choices intact and preserves passives', () => {
		for (const [id, slot, ability, passive] of [
			['flygon', '0', 'Mirage Drift', 'levitate'], ['flygon', 'H', 'Dune Caller', 'levitate'],
			['krookodile', 'H', 'Dune Hunter', 'controlledfury'], ['dhelmise', '1', 'Blackwater Anchor', 'stickyhold'],
			['dragalge', '1', 'Blackwater Venom', 'liquidooze'], ['espeon', '1', 'Remembered Step', 'magicbounce'],
			['arcanine', '0', 'Remembered Flame', 'guarddog'], ['lapras', 'H', 'Storm Memory', 'liquidvoice'],
			['swanna', '0', 'Jetstream Ballet', 'bigpecks'],
		]) {
			assert.equal(Dex.species.get(id).abilities[slot], ability);
			assert(Dex.species.get(id).passives.includes(passive));
		}
		assert.deepEqual(Dex.species.get('gardevoir').abilities, { 0: 'Trace', 1: 'Dream Sickness', H: 'Void Veil' });
		assert.deepEqual(Dex.species.get('gardevoir').passives, ['breakingnews']);
		assert.equal(Dex.species.get('arcaninealt').abilities[0], 'Remembered Flame');
		assert.equal(Dex.species.get('laprasazzy').abilities.H, 'Storm Memory');
		assert.equal(Dex.species.get('dragalgemega').abilities[0], 'Toxic Renewal');
		for (const id of Object.keys(LoreDescriptions)) assert(Dex.abilities.get(id).shortDesc.length <= 100, id);
	});

	for (const [item, duration] of [['', 5], ['Smooth Rock', 8]]) it(`Dune Caller sets ${duration}-turn sand`, () => {
		const [p] = start('Flygon', 'Dune Caller', 'singles', 'No Ability', item);
		assert.equal(battle.field.weather, 'sandstorm');
		assert.equal(battle.field.weatherState.duration, duration);
		assert(p.hasAbility('sandstream')); assert(!p.isGrounded());
	});
	it('Dune Caller slows each opposing target once per turn across spread and multiple hits', () => {
		const [p, t] = start('Flygon', 'Dune Caller', 'doubles');
		const ally = p.allies()[0];
		hit(p, t, 'boomburst', { basePower: 1 });
		for (const foe of t.side.active) assert.equal(foe.boosts.spe, -1, battle.log.slice(-20).join('\n'));
		assert.equal(ally.boosts.spe, 0);
		hit(p, t, 'bugbuzz', { basePower: 1, multihit: 2 }); assert.equal(t.boosts.spe, -1);
		freshTurn(); hit(p, t, 'bugbuzz', { basePower: 1 }); assert.equal(t.boosts.spe, -2);
	});
	for (const cause of ['weather suppressed', 'ability suppressed', 'protect', 'soundproof']) it(`Dune Caller respects ${cause}`, () => {
		const [p, t] = start('Flygon', 'Dune Caller');
		if (cause === 'weather suppressed') t.setAbility('Cloud Nine');
		if (cause === 'ability suppressed') p.addVolatile('gastroacid', t);
		if (cause === 'protect') t.addVolatile('protect', t);
		if (cause === 'soundproof') t.setAbility('Soundproof');
		hit(p, t, 'bugbuzz'); assert.equal(t.boosts.spe, 0);
	});
	it('Mirage Drift has Overcoat, stronger sand recovery and all-field Ground recovery from Sp. Atk drops', () => {
		const [p, t] = start('Flygon', 'Mirage Drift');
		assert(p.hasAbility('overcoat')); hit(t, p, 'spore'); assert.equal(p.status, '');
		p.boosts.spa = -2;
		const weakened = hit(p, t, 'earthpower').damage;
		p.boosts.spa = 0;
		const normal = hit(p, t, 'earthpower').damage; assert.equal(weakened, normal);
		battle.field.setWeather('sandstorm', p);
		const sand = hit(p, t, 'earthpower').damage; assert(sand > normal * 1.25);
		p.hp = 2048; battle.fieldEvent('Residual'); assert.equal(p.hp, 2560);
		t.setAbility('Cloud Nine'); battle.fieldEvent('Residual'); assert.equal(p.hp, 2560);
	});
	it('Dune Hunter retains Inner Focus and only boosts attacks against negative Speed stages', () => {
		const [p, t] = start('Krookodile', 'Dune Hunter');
		assert(p.hasAbility('innerfocus')); assert(p.getPassives().includes('controlledfury'));
		const base = hit(p, t, 'bite').damage;
		t.setStatus('par', p); assert.equal(hit(p, t, 'bite').damage, base);
		t.boosts.spe = -1; assert(hit(p, t, 'bite').damage > base * 1.25);
	});
	it('Dune Hunter guards only before its action in effective sand', () => {
		const [p, t] = start('Krookodile', 'Dune Hunter');
		battle.field.setWeather('sandstorm', p); p.moveThisTurnResult = undefined;
		const guarded = hit(t, p, 'watergun').damage;
		p.moveThisTurnResult = false;
		const late = hit(t, p, 'watergun').damage; assert(guarded < late * 0.8);
		p.moveThisTurnResult = undefined; t.setAbility('Cloud Nine');
		assert.equal(hit(t, p, 'watergun').damage, late);
	});

	it('Breaking News retains Forewarn entry sensing and Gardevoir can still Trace', () => {
		const [p] = start('Gardevoir', 'Trace', 'singles', 'Pressure');
		assert.equal(p.ability, 'pressure'); assert(p.hasAbilityOrPassive('forewarn'));
		assert.equal(battle.log.filter(l => l.includes('|-activate|') && l.includes('ability: Forewarn')).length, 1);
		assert(battle.log.some(l => l.includes('Gossip Gardevoir reports:')));
		battle.makeChoices('move splash', 'switch 2');
		assert.equal(battle.log.filter(l => l.includes('|-activate|') && l.includes('ability: Forewarn')).length, 2);
		battle.makeChoices('move splash', 'switch 2');
		assert.equal(battle.log.filter(l => l.includes('|-activate|') && l.includes('ability: Forewarn')).length, 3);
	});
	for (const [mode, count] of [['doubles', 2], ['ffa', 3]]) it(`Breaking News passive checks every ${mode} foe once`, () => {
		const [p, t] = start('Gardevoir', 'Forewarn', mode);
		assert.equal(battle.log.filter(l => l.includes('|-activate|') && l.includes('ability: Forewarn')).length, count);
		p.addVolatile('gastroacid', t);
		assert.equal(battle.runEvent('Damage', p, t, battle.dex.getActiveMove('tackle'), 1000), 750);
		assert.equal(battle.runEvent('Damage', p, t, battle.dex.getActiveMove('surf'), 1000), 800);
	});
	it('Breaking News marks an opponent through the following turn using normal turn choices', () => {
		const [p, t] = start('Gardevoir', 'Trace', 'singles', 'Pressure');
		battle.makeChoices('move splash', 'move calmmind');
		assert(t.volatiles.gossipexposed); assert.equal(p.ability, 'pressure');
		battle.makeChoices('move splash', 'move tackle');
		assert(!t.volatiles.gossipexposed);
	});
	it('exposes successful status moves, gives the reporter power and allies defensive-stage bypass', () => {
		const [p, t] = start('Gardevoir', 'No Ability', 'doubles');
		const ally = p.allies()[0];
		const ownNormal = hit(p, t, 'psychic', { secondaries: [] }).damage;
		const allyNormal = hit(ally, t, 'psychic', { secondaries: [] }).damage;
		hit(t, t, 'calmmind');
		assert(t.volatiles.gossipexposed, JSON.stringify({ result: t.moveThisTurnResult, log: battle.log.slice(-12) }));
		assert(battle.log.some(l => l.includes('Gossip Gardevoir exposes')));
		assert(hit(p, t, 'psychic', { secondaries: [] }).damage > ownNormal * 1.2);
		assert.equal(hit(ally, t, 'psychic', { secondaries: [] }).damage, allyNormal);
		assert.equal(t.boosts.spd, 1);
		p.addVolatile('gastroacid', t);
		assert.equal(hit(ally, t, 'psychic', { secondaries: [] }).damage, allyNormal);
	});
	it('failed status moves and allied status moves do not expose; marks expire', () => {
		const [p, t] = start('Gardevoir', 'No Ability', 'doubles');
		t.boosts.spa = t.boosts.spd = 6; hit(t, t, 'calmmind'); assert(!t.volatiles.gossipexposed);
		hit(p.allies()[0], p.allies()[0], 'calmmind'); assert(!p.allies()[0].volatiles.gossipexposed);
		t.boosts.spa = t.boosts.spd = 0; hit(t, t, 'calmmind');
		battle.fieldEvent('Residual'); assert(t.volatiles.gossipexposed);
		battle.fieldEvent('Residual'); assert(!t.volatiles.gossipexposed);
	});
	it('Exposed does not grant an unrelated FFA opponent defensive bypass', () => {
		const [p, t] = start('Gardevoir', 'No Ability', 'ffa');
		const other = battle.p3.active[0];
		const base = hit(other, t, 'psychic', { secondaries: [] }).damage;
		hit(t, t, 'calmmind');
		assert(hit(other, t, 'psychic', { secondaries: [] }).damage < base * 0.8);
		assert(hit(p, t, 'psychic', { secondaries: [] }).damage > 0);
	});
	it('reporter switching out removes its marks', () => {
		const [p, t] = start('Gardevoir', 'No Ability');
		hit(t, t, 'calmmind'); assert(t.volatiles.gossipexposed);
		battle.makeChoices('switch 2', 'move splash'); assert(!t.volatiles.gossipexposed);
	});

	it('Blackwater Anchor keeps Steelworker, slows targets and creates the existing tether', () => {
		const [p, t] = start('Dhelmise', 'Blackwater Anchor');
		assert(p.hasAbility('steelworker')); assert.equal(hit(t, p, 'sludgebomb').damage, 0);
		hit(p, t, 'anchorshot', { basePower: 1 });
		assert.equal(t.boosts.spe, -1); assert(p.volatiles.soulanchortether);
		p.hp = 2048; t.hp = 4096; battle.fieldEvent('Residual');
		assert.equal(p.hp, 2304); assert.equal(t.hp, 3840);
	});
	it('Blackwater Anchor adds each Steel resistance once without adding weaknesses', () => {
		const [p, t] = start('Dhelmise', 'Blackwater Anchor');
		assert.equal(p.runEffectiveness(battle.dex.getActiveMove('icebeam')), 0);
		assert.equal(p.runEffectiveness(battle.dex.getActiveMove('ember')), 1);
		assert.equal(p.runEffectiveness(battle.dex.getActiveMove('darkpulse')), 1);
		hit(t, p, 'toxic'); assert.equal(p.status, '');
		p.addVolatile('gastroacid', t);
		assert.equal(p.runEffectiveness(battle.dex.getActiveMove('icebeam')), 1);
		assert(hit(t, p, 'sludgebomb', { secondaries: [] }).damage > 0);
	});
	it('Dhelmise and Dragalge complete their slow, poison and shared-healing sequence', () => {
		const [p, t] = start('Dhelmise', 'Blackwater Anchor', 'doubles');
		const ally = p.allies()[0];
		ally.setAbility('Blackwater Venom'); field('watersurfaceterrain', p);
		hit(p, t, 'anchorshot', { basePower: 1 });
		assert.equal(battle.field.terrain, 'underwaterterrain'); assert.equal(t.boosts.spe, -1);
		hit(ally, t, 'sludgebomb', { secondaries: [] }); assert.equal(t.status, 'psn');
		p.hp = ally.hp = 2048;
		battle.singleEvent('Residual', battle.dex.conditions.get('soulanchortether'), p.volatiles.soulanchortether, p);
		assert.equal(p.hp, 2304); assert.equal(ally.hp, 2304);
	});
	for (const terrain of ['watersurfaceterrain', 'underwaterterrain']) it(`shares actual poisoned tether drain on ${terrain}`, () => {
		const [p, t] = start('Dhelmise', 'Blackwater Anchor', 'doubles');
		const ally = p.allies()[0];
		hit(p, t, 'anchorshot', { basePower: 1 }); field(terrain, p);
		t.trySetStatus('psn', p); p.hp = ally.hp = 2048;
		const condition = battle.dex.conditions.get('soulanchortether');
		battle.singleEvent('Residual', condition, p.volatiles.soulanchortether, p);
		assert.equal(p.hp, 2304); assert.equal(ally.hp, 2304);
		ally.addVolatile('healblock', t); p.hp = ally.hp = 2048;
		battle.singleEvent('Residual', condition, p.volatiles.soulanchortether, p);
		assert.equal(p.hp, 2304); assert.equal(ally.hp, 2048);
	});
	it('water-field recovery needs poison and is capped by actual remaining HP', () => {
		const [p, t] = start('Dhelmise', 'Blackwater Anchor', 'doubles'); const ally = p.allies()[0];
		hit(p, t, 'anchorshot', { basePower: 1 }); field('underwaterterrain', p);
		p.hp = ally.hp = 2048; const condition = battle.dex.conditions.get('soulanchortether');
		battle.singleEvent('Residual', condition, p.volatiles.soulanchortether, p);
		assert.equal(ally.hp, 2048);
		t.setStatus('psn', p); t.hp = 7; p.hp = 2048;
		battle.singleEvent('Residual', condition, p.volatiles.soulanchortether, p);
		assert.equal(p.hp, 2055); assert.equal(ally.hp, 2055);
	});
	it('tethers respect suppression, immunity, escape and leaving', () => {
		const [p, t] = start('Dhelmise', 'Blackwater Anchor');
		t.setType('Ghost'); hit(p, t, 'anchorshot', { basePower: 1 }); assert(!p.volatiles.soulanchortether);
		t.setType('Normal'); t.setItem('shedshell');
		hit(p, t, 'anchorshot', { basePower: 1 }); assert(!p.volatiles.soulanchortether);
		t.takeItem(); t.removeVolatile('trapped');
		hit(p, t, 'anchorshot', { basePower: 1 }); assert(p.volatiles.soulanchortether);
		p.addVolatile('gastroacid', t); p.hp = 2048; const before = t.hp;
		battle.fieldEvent('Residual'); assert.equal(p.hp, 2048); assert.equal(t.hp, before);
		p.removeVolatile('gastroacid'); t.setAbility('Magic Guard');
		battle.fieldEvent('Residual'); assert.equal(p.hp, 2048);
		battle.makeChoices('switch 2', 'move splash'); assert(!t.volatiles.trapped);
	});
	it('Anchor Shot still sinks Water Surface and Steelworker avoids Underwater penalties', () => {
		const [p, t] = start('Dhelmise', 'Blackwater Anchor'); const speed = p.getStat('spe');
		field('watersurfaceterrain', p); hit(p, t, 'anchorshot', { basePower: 1 });
		assert.equal(battle.field.terrain, 'underwaterterrain'); assert.equal(p.getStat('spe'), speed);
	});
	it('Blackwater Venom needs Speed stages, poisons eligible foes and boosts Dragon against poison', () => {
		const [p, t] = start('Dragalge', 'Blackwater Venom');
		const base = hit(p, t, 'dragonpulse').damage;
		hit(p, t, 'sludgebomb', { secondaries: [] }); assert.equal(t.status, '');
		t.boosts.spe = -1; hit(p, t, 'sludgebomb', { secondaries: [] }); assert.equal(t.status, 'psn');
		assert(hit(p, t, 'dragonpulse').damage > base * 1.2);
		assert(p.getPassives().includes('liquidooze'));
	});
	for (const terrain of ['watersurfaceterrain', 'underwaterterrain']) it(`Blackwater Venom avoids only the ${terrain} Speed penalty while active`, () => {
		const [p, t] = start('Dragalge', 'Blackwater Venom'); const speed = p.getStat('spe');
		field(terrain, p); assert.equal(p.getStat('spe'), speed);
		p.addVolatile('gastroacid', t); assert(p.getStat('spe') < speed);
	});
	for (const mode of ['substitute', 'safeguard', 'immunity', 'suppressed']) it(`Blackwater Venom respects ${mode}`, () => {
		const [p, t] = start('Dragalge', 'Blackwater Venom'); t.boosts.spe = -1;
		if (mode === 'substitute') t.addVolatile('substitute', t);
		if (mode === 'safeguard') t.side.addSideCondition('safeguard', t);
		if (mode === 'immunity') t.setType('Poison');
		if (mode === 'suppressed') p.addVolatile('gastroacid', t);
		hit(p, t, 'sludgebomb', { secondaries: [] }); assert.equal(t.status, '');
	});

	it('Remembered Step converts Quick Attack and applies Reflect without changing priority', () => {
		const [p, t] = start('Espeon', 'Remembered Step');
		const first = hit(p, t, 'quickattack');
		assert.equal(first.move.type, 'Psychic'); assert.equal(first.move.category, 'Special'); assert.equal(first.move.priority, 1);
		p.side.addSideCondition('reflect', p);
		assert(hit(p, t, 'quickattack').damage > first.damage * 1.4);
		assert(p.getPassives().includes('magicbounce'));
		field('psychicterrain', p); assert.equal(hit(p, t, 'quickattack').damage, 0);
	});
	it('Remembered Flame retains Flash Fire/Download, charges from Extreme Speed and spends on a miss', () => {
		const [p, t] = start('Arcanine', 'Remembered Flame');
		assert(p.hasAbility('download') && p.hasAbility('flashfire'));
		assert.equal(hit(t, p, 'ember').damage, 0); assert(p.volatiles.flashfire);
		// The local Download makes the first attack a critical hit; compare later attacks.
		hit(p, t, 'ember');
		const base = hit(p, t, 'ember').damage;
		const extreme = hit(p, t, 'extremespeed');
		assert.equal(extreme.move.critRatio, Dex.moves.get('extremespeed').critRatio);
		assert(p.volatiles.rememberedflamecharge, battle.log.slice(-15).join('\n'));
		const boosted = hit(p, t, 'ember').damage;
		assert(boosted > base * 1.2, JSON.stringify({ base, boosted, log: battle.log.slice(-18) })); assert(!p.volatiles.rememberedflamecharge);
		hit(p, t, 'extremespeed'); hit(p, t, 'ember', { accuracy: 0 }); assert(!p.volatiles.rememberedflamecharge);
	});
	it('Remembered Flame expires, does not charge through Protect and clears on ability loss', () => {
		const [p, t] = start('Arcanine', 'Remembered Flame');
		t.addVolatile('protect', t); hit(p, t, 'extremespeed'); assert(!p.volatiles.rememberedflamecharge);
		t.removeVolatile('protect'); hit(p, t, 'extremespeed');
		battle.fieldEvent('Residual'); assert(p.volatiles.rememberedflamecharge);
		battle.fieldEvent('Residual'); assert(!p.volatiles.rememberedflamecharge);
		hit(p, t, 'extremespeed'); p.setAbility('No Ability'); assert(!p.volatiles.rememberedflamecharge);
	});

	it('Storm Memory guards the entire first super-effective multi-hit attack, then charges once', () => {
		const [p, t] = start('Lapras', 'Storm Memory');
		const guarded = hit(t, p, 'bulletseed', { multihit: 3 }).damage;
		assert(p.volatiles.stormcharge && p.volatiles.stormmemoryspent);
		const unguarded = hit(t, p, 'bulletseed', { multihit: 3 }).damage;
		assert(guarded < unguarded * 0.8);
		const before = p.hp, foeBefore = t.hp;
		hit(p, t, 'thunderbolt');
		assert.equal(p.hp - before, Math.floor((foeBefore - t.hp) / 4));
		assert(!p.volatiles.stormcharge);
		hit(t, p, 'bulletseed', { multihit: 1 }); assert(!p.volatiles.stormcharge);
	});
	it('Storm Memory does not spend on resisted hits, immunity, Substitute or allies', () => {
		const [p, t] = start('Lapras', 'Storm Memory', 'doubles');
		hit(t, p, 'watergun'); assert(!p.volatiles.stormmemoryspent);
		p.addVolatile('protect', p); hit(t, p, 'thunderbolt'); assert(!p.volatiles.stormmemoryspent);
		p.removeVolatile('protect'); p.addVolatile('substitute', p);
		hit(t, p, 'thunderbolt', { basePower: 1 }); assert(!p.volatiles.stormmemoryspent);
		p.removeVolatile('substitute'); hit(p.allies()[0], p, 'thunderbolt'); assert(!p.volatiles.stormmemoryspent);
	});
	it('Storm Charge is consumed on immunity and healing uses actual damage, including a nearly fainted foe', () => {
		const [p, t] = start('Lapras', 'Storm Memory');
		hit(t, p, 'thunderbolt'); t.setType('Ground');
		hit(p, t, 'thunderbolt'); assert(!p.volatiles.stormcharge);
		t.setType('Normal'); p.addVolatile('stormcharge');
		p.hp = 2000; t.hp = 7;
		hit(p, t, 'thunderbolt'); assert.equal(p.hp, 2001);
	});
	it('Storm guard survives ability changes as spent, but resets on a real switch', () => {
		const [p, t] = start('Lapras', 'Storm Memory');
		hit(t, p, 'thunderbolt'); p.setAbility('No Ability'); assert(!p.volatiles.stormcharge);
		p.setAbility('Storm Memory'); hit(t, p, 'thunderbolt'); assert(!p.volatiles.stormcharge);
		battle.makeChoices('switch 2', 'move splash'); battle.makeChoices('switch 2', 'move splash');
		assert.equal(battle.p1.active[0], p); assert(!p.volatiles.stormmemoryspent);
		hit(t, p, 'thunderbolt'); assert(p.volatiles.stormcharge);
	});
	for (const blocker of ['healblock', 'liquidooze']) it(`Storm Charge healing respects ${blocker}`, () => {
		const [p, t] = start('Lapras', 'Storm Memory');
		p.addVolatile('stormcharge'); p.hp = 2048;
		if (blocker === 'healblock') p.addVolatile('healblock', t); else t.setAbility('Liquid Ooze');
		const damage = hit(p, t, 'thunderbolt').damage;
		assert(damage > 0);
		if (blocker === 'healblock') assert.equal(p.hp, 2048); else assert(p.hp < 2048);
		assert(!p.volatiles.stormcharge);
	});
	for (const mode of ['gastroacid', 'moldbreaker']) it(`Storm Memory respects ${mode}`, () => {
		const [p, t] = start('Lapras', 'Storm Memory');
		if (mode === 'gastroacid') p.addVolatile('gastroacid', t); else t.setAbility('Mold Breaker');
		hit(t, p, 'thunderbolt'); assert(!p.volatiles.stormcharge && !p.volatiles.stormmemoryspent);
	});

	it('Jetstream Ballet keeps Wind Rider and boosts only physical Water moves in its own Tailwind', () => {
		const [p, t] = start('Swanna', 'Jetstream Ballet');
		assert(p.hasAbility('windrider')); assert.equal(hit(t, p, 'gust').damage, 0); assert.equal(p.boosts.atk, 1);
		p.boosts.atk = 0; const base = hit(p, t, 'liquidation', { secondaries: [] }).damage;
		p.side.addSideCondition('tailwind', p); assert.equal(p.boosts.atk, 1);
		p.boosts.atk = 0; const boosted = hit(p, t, 'liquidation', { secondaries: [] });
		assert(boosted.damage > base * 1.15); assert(!boosted.move.flags.contact);
		p.side.removeSideCondition('tailwind'); t.side.addSideCondition('tailwind', t);
		assert(hit(p, t, 'liquidation', { secondaries: [] }).move.flags.contact);
	});
	it('calculator fresh-entry scenarios use the same abilities, passives and entry effects', () => {
		const { buildCalculatorBattle, validateScenario } = require('../../../dist/sim/custom-calculator');
		for (const [species, ability] of [['Flygon', 'Dune Caller'], ['Gardevoir', 'Trace'], ['Dhelmise', 'Blackwater Anchor']]) {
			const input = { format: 'gen9nofieldsinglesgame', move: 'Tackle', samples: 16, seed: 42,
				actors: [{ species, ability }, ...Array.from({ length: 3 }, () => ({ species: 'Mew', ability: 'Pressure' }))] };
			const scenario = buildCalculatorBattle(validateScenario(input), 0);
			try {
				const p = scenario.mons[0];
				if (species === 'Flygon') assert.equal(scenario.battle.field.weather, 'sandstorm');
				if (species === 'Gardevoir') assert(p.hasAbilityOrPassive('forewarn'));
				if (species === 'Dhelmise') assert(p.hasAbility('steelworker'));
			} finally { scenario.battle.destroy(); }
		}
	});
});
