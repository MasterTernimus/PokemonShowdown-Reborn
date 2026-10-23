'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const mon = (ability = 'No Ability', move = 'shadowball', species = 'Mew') => ({ species, ability, moves: [move, 'splash'] });
describe('Anticipation and Forewarn opponent entry checks', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });
	function start(format, teams) {
		battle = common.createBattle({ formatid: format }, teams);
		battle.makeChoices(...teams.map(team => 'team ' + team.map((_, i) => i + 1).join('')));
		return battle.p1.active[0];
	}
	function warnings(name, from = 0) { return battle.log.slice(from).filter(line => (line.includes('ability: ' + name + '|') || line.includes('passive: ' + name + '|'))); }
	for (const [ability, name] of [['Anticipation', 'Anticipation'], ['Forewarn', 'Forewarn'], ['Shadow Current', 'Anticipation'], ['Cold Logic', 'Forewarn'], ['Silent Reprisal', 'Anticipation']]) {
		it(ability + ': singles checks every incoming opponent including repeat entries', () => {
			start('gen9nofieldsinglesgame', [[mon(ability)], [mon(), mon('No Ability', 'darkpulse')]]);
			assert.equal(warnings(name).length, 1);
			for (const slot of [2, 2, 2, 2]) {
				const mark = battle.log.length;
				battle.makeChoices('move splash', 'switch ' + slot);
				assert.equal(warnings(name, mark).length, 1);
				assert(warnings(name, mark)[0].includes('[of] p2a:'));
			}
		});
		it(ability + ': doubles checks both foes once, ignores allied switches, rechecks two incoming foes', () => {
			start('gen9nofielddoublesbattle', [[mon(ability), mon(), mon()], [mon(), mon('No Ability', 'darkpulse'), mon(), mon()]]);
			assert.equal(warnings(name).length, 2);
			assert(warnings(name).some(line => line.includes('[of] p2a:')));
			assert(warnings(name).some(line => line.includes('[of] p2b:')));
			let mark = battle.log.length;
			battle.makeChoices('move splash, switch 3', 'move splash, move splash');
			assert.equal(warnings(name, mark).length, 0);
			mark = battle.log.length;
			battle.makeChoices('move splash, move splash', 'switch 3, switch 4');
			assert.equal(warnings(name, mark).length, 2);
		});
		it(ability + ': FFA checks all three opponents and each returning opponent', () => {
			const p = start('gen9freeforall4pmistyfieldadrienn', [[mon(ability)], [mon(), mon()], [mon(), mon()], [mon(), mon()]]);
			assert.equal(warnings(name).length, 3);
			for (const slot of [2, 2]) {
				const mark = battle.log.length;
				battle.makeChoices('move splash', 'switch ' + slot, 'switch ' + slot, 'switch ' + slot);
				assert.equal(warnings(name, mark).length, 3);
			}
			assert.equal(p.hp, p.maxhp);
		});
		it(ability + ': suppression blocks incoming checks and removal permits later repeat entries', () => {
			const p = start('gen9nofieldsinglesgame', [[mon(ability)], [mon(), mon()]]);
			p.addVolatile('gastroacid');
			let mark = battle.log.length;
			battle.makeChoices('move splash', 'switch 2');
			assert.equal(warnings(name, mark).length, 0);
			p.removeVolatile('gastroacid'); mark = battle.log.length;
			battle.makeChoices('move splash', 'switch 2');
			assert.equal(warnings(name, mark).length, 1);
		});
	}
	for (const ability of ['Anticipation', 'Forewarn']) {
		it(ability + ': no duplicate initial checks regardless of holder speed', () => {
			for (const spe of [0, 252]) {
				start('gen9nofielddoublesbattle', [[{ ...mon(ability), evs: { spe } }, mon()], [mon(), mon()]]);
				assert.equal(warnings(ability).length, 2);
				battle.destroy(); battle = null;
			}
		});
		it(ability + ': Neutralizing Gas prevents selected ability checks', () => {
			start('gen9nofieldsinglesgame', [[mon(ability)], [mon('Neutralizing Gas'), mon()]]);
			assert.equal(warnings(ability).length, 0);
		});
		it(ability + ': psychic bonuses are per opponent and repeat on later entries', () => {
			const move = ability === 'Anticipation' ? 'tackle' : 'shadowball';
			const p = start('gen9nofielddoublesbattle', [[mon(ability), mon()], [mon('No Ability', move), mon('No Ability', move), mon('No Ability', move)]]);
			battle.field.terrain = 'psychicterrain'; p.boosts.spa = 0;
			battle.singleEvent('Start', p.getAbility(), p.abilityState, p);
			assert.equal(p.boosts.spa, 4);
			p.boosts.spa = 0;
			battle.makeChoices('move splash, move splash', 'switch 3, move splash');
			assert.equal(p.boosts.spa, 2);
		});
		it(ability + ': incoming Illusion is revealed on every entry', () => {
			start('gen9nofieldsinglesgame', [[mon(ability)], [mon(), mon('Illusion', 'shadowball', 'Zoroark'), mon('No Ability', 'splash', 'Snorlax')]]);
			for (const slot of [2, 2, 2]) {
				battle.makeChoices('move splash', 'switch ' + slot);
				assert.equal(battle.p2.active[0].illusion, null);
			}
			assert.equal(battle.log.filter(line => line.includes('|-end|') && line.includes('|Illusion')).length, 2);
		});
	}
	it('native Forewarn retains its existing immunity to ability suppression', () => {
		start('gen9nofieldsinglesgame', [[mon('No Ability', 'splash', 'Gardevoir')], [mon('Neutralizing Gas'), mon('Neutralizing Gas')]]);
		const mark = battle.log.length;
		battle.makeChoices('move splash', 'switch 2');
		assert.equal(warnings('Forewarn', mark).length, 1);
	});
	for (const [ability, species] of [['Forewarn', 'Gardevoir'], ['Anticipation', 'Sigilyph']]) {
		it(ability + ': selected ability plus native passive checks once per foe', () => {
			start('gen9nofielddoublesbattle', [[mon(ability, 'splash', species), mon()], [mon('No Ability', 'stoneedge'), mon('No Ability', 'shadowball'), mon('No Ability', 'darkpulse')]]);
			assert.equal(warnings(ability).length, 2);
			const mark = battle.log.length;
			battle.makeChoices('move splash, move splash', 'switch 3, move splash');
			assert.equal(warnings(ability, mark).length, 1);
		});
		it(ability + ': holder checks current foes and then checks a later incoming foe once', () => {
			start('gen9nofielddoublesbattle', [[mon(), mon(), mon(ability)], [mon(), mon(), mon()]]);
			const mark = battle.log.length;
			battle.makeChoices('switch 3, move splash', 'switch 3, move splash');
			assert.equal(warnings(ability, mark).length, 3);
		});
	}
	it('Anticipation applies the Psychic bonus only for the safe opponent', () => {
		const p = start('gen9nofielddoublesbattle', [[mon('Anticipation'), mon()], [mon(), mon('No Ability', 'tackle')]]);
		battle.field.terrain = 'psychicterrain'; p.boosts.spa = 0;
		const mark = battle.log.length;
		battle.singleEvent('Start', p.getAbility(), p.abilityState, p);
		assert.equal(warnings('Anticipation', mark).length, 1);
		assert.equal(p.boosts.spa, 2);
	});
	it('Forewarn selects a strongest move independently for each foe', () => {
		start('gen9nofielddoublesbattle', [[mon('Forewarn'), mon()], [{ ...mon(), moves: ['tackle', 'shadowball'] }, { ...mon(), moves: ['surf', 'pound'] }]]);
		const lines = warnings('Forewarn');
		assert.equal(lines.length, 2);
		assert(lines.some(line => line.includes('|Shadow Ball|') && line.includes('[of] p2a:')));
		assert(lines.some(line => line.includes('|Surf|') && line.includes('[of] p2b:')));
	});
	it('Forewarn gets no Psychic bonus for a status-only foe', () => {
		const p = start('gen9nofieldsinglesgame', [[mon('Forewarn')], [mon('No Ability', 'splash')]]);
		battle.field.terrain = 'psychicterrain'; p.boosts.spa = 0;
		battle.singleEvent('Start', p.getAbility(), p.abilityState, p);
		assert.equal(warnings('Forewarn').length, 0);
		assert.equal(p.boosts.spa, 0);
	});
	it('repeat warning updates existing protection without stacking or granting OHKO reduction', () => {
		const p = start('gen9nofieldsinglesgame', [[mon('Forewarn')], [mon(), mon('No Ability', 'surf'), mon('No Ability', 'fissure')]]);
		const damage = id => battle.runEvent('Damage', p, battle.p2.active[0], battle.dex.getActiveMove(id), 1000);
		assert.equal(damage('shadowball'), 750);
		battle.makeChoices('move splash', 'switch 2');
		assert.equal(damage('surf'), 750); assert.equal(damage('shadowball'), 800);
		const { rememberWarning, protectsWarnedMove } = require('../../../dist/data/warned-moves');
		const ohko = { ...battle.dex.getActiveMove('fissure'), ohko: true };
		rememberWarning(p, 'forewarn', ohko);
		assert.equal(protectsWarnedMove(p, battle.p2.active[0], ohko), false);
		assert.equal(damage('surf'), 750);
		assert(!p.volatiles.warnedmoves.forewarn.includes('fissure'));
	});
});
