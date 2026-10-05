'use strict';
const assert = require('assert').strict;
const common = require('../common');
const { Dex, TeamValidator } = require('../../dist/sim');
const { PULSE_FIXED_MOVES } = require('../../dist/data/pulse-fixed-moves');

describe('Pulse/Rift form rules', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });
	function start(species = 'Camerupt', ability = 'No Ability', formatid = 'gen9nofieldsinglesgame') {
		battle = common.createBattle({ formatid }, [[
			{ species, ability, item: 'Anomaly Core', moves: ['splash', 'substitute', 'batonpass'] },
			{ species: 'Mew', ability: 'No Ability', moves: ['splash', 'substitute', 'batonpass', 'shedtail'] },
		], [{ species: 'Blissey', ability: 'No Ability', moves: ['splash', 'stealthrock'] }, { species: 'Mew', moves: ['splash'] }]]);
		battle.makeChoices('team 12', 'team 12');
		return battle.p1.active[0];
	}
	function evolve(p, form) { return p.formeChange(form, battle.dex.items.get('anomalycore'), true); }
	for (const s of Dex.species.all().filter(s => s.forme.split('-').some(p => p === 'Pulse' || p === 'Rift'))) {
		it(`${s.name}: breaks Substitute on form change and rejects direct/called creation without HP cost`, () => {
			const p = start(s.baseSpecies), foe = battle.p2.active[0];
			assert(p.addVolatile('substitute'));
			assert(evolve(p, s.name));
			assert(!p.volatiles.substitute);
			p.setAbility('No Ability', null, null, true);
			p.addVolatile('gastroacid');
			const hp = p.hp;
			battle.actions.runMove('substitute', p, p.getLocOf(p), { externalMove: true });
			assert.equal(p.hp, hp);
			assert(!p.volatiles.substitute);
			assert.equal(p.addVolatile('substitute', foe, battle.dex.moves.get('shedtail')), false);
			assert.equal(battle.log.filter(l => l.includes('|-end|') && l.includes('|Substitute')).length, 1);
		});
	}
	it('does not restrict ordinary species with Pulse/Rift ability or move names', () => {
		const p = start('Mew', 'Pulse Waste');
		assert(p.addVolatile('substitute'));
		p.removeVolatile('substitute');
		p.setAbility('Mountain Rift', null, null, true);
		assert(p.addVolatile('substitute'));
	});
	for (const move of ['batonpass', 'shedtail']) {
		for (const form of ['Muk-Pulse', 'Lilligant-Hisui-Rift', 'Torterra-Rift-Shatter']) {
			it(`${move} cannot transfer Substitute to ${form}, including switch message ordering`, () => {
				const p = start(form);
				// Shatter is a valid direct form; the other forms require their Core, provided above.
				p.setAbility('No Ability', null, null, true);
				battle.makeChoices('switch 2', 'move splash');
				const donor = battle.p1.active[0];
				if (move === 'batonpass') donor.addVolatile('substitute');
				battle.makeChoices('move ' + move, 'move splash');
				battle.makeChoices('switch 2', '');
				assert.equal(battle.p1.active[0], p);
				assert(!p.volatiles.substitute);
				const lines = battle.log;
				const end = lines.findLastIndex(l => l.startsWith('|-end|p1a:') && l.endsWith('|Substitute'));
				const sw = lines.findLastIndex(l => l.startsWith('|switch|p1a:'));
				assert(end > sw, lines.slice(-15).join('\n'));
			});
		}
	}
	it('ordinary Baton Pass recipient keeps Substitute until transforming', () => {
		const p = start('Muk');
		battle.makeChoices('switch 2', 'move splash');
		battle.p1.active[0].addVolatile('substitute');
		battle.makeChoices('move batonpass', 'move splash');
		battle.makeChoices('switch 2', '');
		assert(p.volatiles.substitute);
		assert(battle.actions.runMegaEvo(p));
		assert(!p.volatiles.substitute);
	});
	it('Transform into a Pulse form removes Substitute and reverting restores ordinary eligibility', () => {
		const p = start('Mew'), target = battle.p2.active[0];
		evolve(target, 'Muk-Pulse');
		p.addVolatile('substitute');
		assert(p.transformInto(target));
		assert(!p.volatiles.substitute);
		assert(!p.addVolatile('substitute'));
		p.clearVolatile();
		assert(p.addVolatile('substitute'));
	});
	for (const ability of ['Sturdy', 'Pulse Eruption', 'Magic Guard']) {
		it(`injured Camerupt faints before normalization despite ${ability}`, () => {
			const p = start('Camerupt', ability), maxhp = p.maxhp;
			p.hp--;
			const left = p.side.pokemonLeft;
			assert.equal(battle.actions.runMegaEvo(p), false);
			assert.equal(p.hp, 0);
			assert.equal(p.maxhp, maxhp);
			assert.equal(p.species.id, 'camerupt');
			assert(p.faintQueued);
			battle.faintMessages();
			assert(p.fainted);
			assert.equal(p.side.pokemonLeft, left - 1);
			assert.equal(p.side.totalFainted, 1);
			assert.equal(battle.log.filter(l => l.startsWith('|faint|p1a:')).length, 1);
			assert(!battle.log.some(l => l.startsWith('|-mega|p1a:')));
		});
	}
	it('fully healed Camerupt evolves to exactly 1 actual HP and removes Substitute', () => {
		const p = start();
		p.hp--;
		battle.heal(1, p);
		p.addVolatile('substitute');
		assert(battle.actions.runMegaEvo(p));
		assert.equal(p.hp, 1); assert.equal(p.maxhp, 1); assert.equal(p.baseMaxhp, 1);
		assert(!p.volatiles.substitute);
	});
	it('direct equivalent form change also rejects injured Camerupt', () => {
		const p = start(); p.hp--;
		assert.equal(evolve(p, 'Camerupt-Pulse'), false);
		assert.equal(p.hp, 0); assert(p.faintQueued);
	});
	it('checks Dynamax HP before rounding away one missing HP', () => {
		const p = start();
		p.addVolatile('dynamax'); p.hp = p.maxhp - 1;
		assert.equal(battle.actions.runMegaEvo(p), false);
		assert.equal(p.hp, 0);
	});
	it('entry hazard injury is seen before the later evolution action', () => {
		const p = start();
		battle.makeChoices('switch 2', 'move stealthrock');
		battle.makeChoices('switch 2', 'move splash');
		assert(p.hp < p.maxhp);
		battle.makeChoices('move splash mega', 'move splash');
		assert(p.fainted);
		assert.equal(p.species.id, 'camerupt');
	});
	it('does not impose the full HP requirement on Mega Camerupt or another Pulse species', () => {
		const p = start(); p.hp--;
		assert(evolve(p, 'Camerupt-Mega')); assert(p.hp > 0);
		const foe = battle.p2.active[0]; foe.hp--;
		assert(evolve(foe, 'Muk-Pulse')); assert(foe.hp > 0);
	});
	for (const [species, ids] of Object.entries(PULSE_FIXED_MOVES)) {
		it(`${species}: fixed moves install without ability and retain PP through switches/retransformation`, () => {
			const s = Dex.species.get(species), p = start(s.baseSpecies);
			p.moveSlots[0].pp -= 2;
			assert(evolve(p, species));
			assert.deepEqual(p.moves, ids);
			assert.equal(p.moveSlots[0].pp, p.moveSlots[0].maxpp - 2);
			p.setAbility('No Ability', null, null, true);
			p.moveSlots[1].pp -= 3;
			const pp = p.moveSlots.map(m => m.pp);
			battle.makeChoices('switch 2', 'move splash');
			battle.makeChoices('switch 2', 'move splash');
			assert.deepEqual(p.moveSlots.map(m => m.pp), pp);
			assert(evolve(p, species));
			assert.deepEqual(p.moveSlots.map(m => m.pp), pp);
			const foe = battle.p2.active[0]; foe.hp = foe.maxhp;
			for (const id of ids) {
				p.hp = Math.max(1, Math.floor(p.maxhp / 2)); foe.hp = foe.maxhp;
				const m = battle.dex.getActiveMove(id); m.accuracy = true;
				const before = battle.log.length;
				battle.actions.runMove(m, p, p.getLocOf(foe), { externalMove: true });
				assert(battle.log.slice(before).some(l => l.startsWith('|move|') && l.includes('|' + m.name + '|')), id);
			}
		});
		it(`${species}: direct form validation accepts exactly the four moves and rejects replacements`, () => {
			const s = Dex.species.get(species), v = new TeamValidator('gen9nofieldsinglesgame');
			const set = { species: s.name, ability: s.abilities[0], item: 'Anomaly Core', moves: ids.slice(), nature: 'Serious', evs: { hp: 252 } };
			assert.equal(v.validateTeam([structuredClone(set)]), null);
			const bad = structuredClone(set); bad.moves[3] = 'recover';
			if (ids.includes('recover')) bad.moves[3] = 'substitute';
			assert(v.validateTeam([bad]).some(p => p.includes('must use exactly')));
			const p = start(s.name); assert.deepEqual(p.moves, ids);
		});
	}
	it('Hisui Avalugg also receives the fixed Pulse set without Recover', () => {
		const p = start('Avalugg-Hisui');
		assert(battle.actions.runMegaEvo(p));
		assert.deepEqual(p.moves, PULSE_FIXED_MOVES.avaluggpulse);
		assert(Dex.species.getLearnsetData('avalugg').learnset.recover);
	});
	it('Muk sets Swamp for five turns and preserves its existing components', () => {
		const p = start('Muk'); assert(battle.actions.runMegaEvo(p));
		assert.equal(battle.field.terrain, 'swampterrain'); assert.equal(battle.field.terrainState.duration, 5);
		for (const ability of ['protean', 'poisontouch', 'regenerator']) assert(p.hasAbility(ability));
	});
	it('Swalot converts existing and newly created Underwater immediately without refreshing Murkwater', () => {
		const p = start('Swalot');
		battle.field.setTerrain('underwaterterrain', p);
		assert(battle.actions.runMegaEvo(p));
		assert.equal(battle.field.terrain, 'murkwatersurfaceterrain'); assert.equal(battle.field.terrainState.duration, 5);
		assert.equal(p.status, ''); assert(!p.hasAbility('poisonheal'));
		assert(p.hasAbility('waterabsorb')); assert(p.hasAbility('liquidooze'));
		battle.field.setTerrainDuration(2);
		battle.eachEvent('TerrainChange');
		assert.equal(battle.field.terrainState.duration, 2);
		assert(battle.field.changeTerrain('underwaterterrain', p));
		assert.equal(battle.field.terrain, 'murkwatersurfaceterrain'); assert.equal(battle.field.terrainState.duration, 5);
	});
	it('Swalot conversion respects ability suppression and Neutralization', () => {
		const p = start('Swalot'); battle.actions.runMegaEvo(p);
		p.addVolatile('gastroacid');
		battle.field.changeTerrain('underwaterterrain', p);
		assert.equal(battle.field.terrain, 'underwaterterrain');
		p.removeVolatile('gastroacid');
		battle.eachEvent('TerrainChange');
		assert.equal(battle.field.terrain, 'murkwatersurfaceterrain');
		p.addVolatile('gastroacid'); battle.field.changeTerrain('underwaterterrain', p);
		battle.p2.active[0].setAbility('Neutralization', null, null, true);
		p.removeVolatile('gastroacid'); battle.eachEvent('TerrainChange');
		assert.equal(battle.field.terrain, 'underwaterterrain');
	});
	it('Swalot absorbs Water/Poison once and retains full local Water Absorb and Liquid Ooze', () => {
		const p = start('Swalot'), foe = battle.p2.active[0]; battle.actions.runMegaEvo(p);
		for (const id of ['watergun', 'sludgebomb']) {
			p.hp = 1;
			battle.actions.runMove(id, foe, foe.getLocOf(p), { externalMove: true });
			assert.equal(p.hp, 1 + Math.floor(p.baseMaxhp / 4));
		}
		p.hp = 1;
		battle.singleEvent('Residual', p.getAbility(), p.abilityState, p);
		assert.equal(p.hp, 1 + Math.floor(p.baseMaxhp / 16));
		foe.hp = foe.maxhp - 100; const before = foe.hp;
		battle.heal(20, foe, p, battle.dex.conditions.get('drain'));
		assert.equal(foe.hp, before - 40);
		p.addVolatile('healblock'); p.hp = 1;
		battle.actions.runMove('watergun', foe, foe.getLocOf(p), { externalMove: true });
		assert.equal(p.hp, 1);
	});
});
