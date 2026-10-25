'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Teams, TeamValidator, Dex } = require('../../../dist/sim');
let battle;
const mon = (species, ability, extra = {}) => ({ species, ability, moves: ['splash'], ...extra });
function start(ability, preview = '123') {
	battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[mon('Zorua', ability, { initialDisguise: 2 }), mon('Pikachu', 'Static', { name: 'Sparky' }), mon('Charizard', 'Blaze')], [mon('Mew', 'No Ability')]]);
	battle.makeChoices('team ' + preview, 'team 1');
	return battle.p1.pokemon.find(p => p.species.id === 'zorua');
}
describe('Initial teammate disguise and private identity', () => {
	afterEach(() => { battle?.destroy(); battle = null; });
	for (const ability of ['Illusion', 'Perfect Illusion']) {
		it(`${ability} selects the chosen original teammate, not the last slot`, () => {
			const p = start(ability);
			assert.equal(p.illusion.name, 'Sparky');
			assert.equal(p.m.perfectIllusion || false, ability === 'Perfect Illusion');
			const data = p.getSwitchRequestData();
			assert.deepEqual(data.disguise, { name: 'Sparky', species: 'Pikachu', mode: ability === 'Perfect Illusion' ? 'perfectillusion' : 'illusion' });
			assert(!p.getSwitchRequestData(true).disguise);
			assert(!battle.log.some(line => /initialDisguise|Initial Disguise|"disguise"/.test(line)));
			battle.singleEvent('End', Dex.abilities.get('illusion'), p.abilityState, p);
			assert(!p.getSwitchRequestData().disguise);
			assert.equal(p.species.id, 'zorua');
			assert.equal(p.ability, ability === 'Perfect Illusion' ? 'perfectillusion' : 'illusion');
		});
		it(`${ability} follows the selected teammate across preview reordering`, () => {
			const p = start(ability, '132');
			assert.equal(p.illusion.name, 'Sparky');
		});
		it(`${ability} uses normal automatic selection on real reentry`, () => {
			const p = start(ability);
			battle.makeChoices('switch 2', 'move splash');
			battle.makeChoices('switch 2', 'move splash');
			assert.equal(battle.p1.active[0], p);
			const automatic = p.illusion;
			delete p.set.initialDisguise;
			battle.dex.abilities.get(ability).onBeforeSwitchIn.call(battle, p);
			assert.equal(p.illusion, automatic);
			assert(!p.getSwitchRequestData(true).disguise);
		});
		it(`${ability} ignores invalid raw choices and safely uses Auto`, () => {
			battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[mon('Zorua', ability, { initialDisguise: 99 }), mon('Pikachu', 'Static')], [mon('Mew', 'No Ability')]]);
			battle.makeChoices('team 12', 'team 1');
			assert.equal(battle.p1.active[0].illusion.species.id, 'pikachu');
		});
	}
	it('preserves the choice across packed and text server round trips', () => {
		const team = [mon('Zorua', 'Illusion', { initialDisguise: 2 }), mon('Pikachu', 'Static')];
		const packed = Teams.pack(team);
		assert.equal(Teams.unpack(packed)[0].initialDisguise, 2);
		const exported = Teams.export(team);
		assert(exported.includes('Initial Disguise: 2'));
		assert.equal(Teams.import(exported)[0].initialDisguise, 2);
		assert(!Teams.pack([mon('Pikachu', 'Static')]).includes('undefined'));
	});
	it('validates bounds, self, non-integer, unsupported holder and a valid choice', () => {
		const validator = new TeamValidator('gen9nofieldsinglesgame');
		for (const slot of [0, 1, 3, 1.5, NaN]) {
			const problems = validator.validateTeam([mon('Zorua', 'Illusion', { initialDisguise: slot }), mon('Pikachu', 'Static')]);
			assert(problems?.some(p => p.includes('Initial Disguise')), String(slot));
		}
		assert(validator.validateTeam([mon('Mew', 'No Ability', { initialDisguise: 2 }), mon('Pikachu', 'Static')])?.some(p => p.includes('requires Illusion')));
		assert(!validator.validateTeam([mon('Zorua', 'Illusion', { initialDisguise: 2 }), mon('Pikachu', 'Static')])?.some(p => p.includes('Initial Disguise')));
	});
	for (const [species, ability] of [['Zoroark', 'Opportunist'], ['Zoroark-Hisui', 'Perfect Illusion'], ['Meowscarada', 'Perfect Illusion']]) it(species + '/' + ability + ' supports real passive/selected sources', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[mon(species, ability, { initialDisguise: 2 }), mon('Pikachu', 'Static', { name: 'Selected' }), mon('Mew', 'No Ability')], [mon('Mew', 'No Ability')]]);
		battle.makeChoices('team 123', 'team 1'); assert.equal(battle.p1.active[0].illusion.name, 'Selected');
	});
	it('falls back when the selected teammate is fainted and never retries the initial choice after an actual entry', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[mon('Zorua', 'Illusion', { initialDisguise: 2 }), mon('Pikachu', 'Static'), mon('Charizard', 'Blaze')], [mon('Mew', 'No Ability')]]);
		battle.p1.pokemon[1].hp = 0; battle.p1.pokemon[1].fainted = true;
		battle.makeChoices('team 123', 'team 1'); assert.equal(battle.p1.active[0].illusion.species.id, 'charizard');
	});
});
