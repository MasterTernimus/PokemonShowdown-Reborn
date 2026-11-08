'use strict';
const assert = require('assert').strict;
const { TeamValidator, Dex } = require('../../../dist/sim');
const { Format } = require('../../../dist/sim/dex-formats');
// Test mechanics independently of the retired upstream ladder names. Unexpected
// format errors must fail, rather than masquerading as an illegal team result.
function validate(team, customRules = [], options = {}) {
	const format = new Format({ name: 'Custom rule regression', effectType: 'Format', mod: 'gen9', ruleset: ['Obtainable'], ...options, customRules });
	return new TeamValidator(format).validateTeam(structuredClone(team));
}
const mew = (extra = {}) => ({ species: 'Mew', ability: 'Natural Cure', moves: ['Psychic'], evs: { hp: 1 }, ...extra });
function rejected(errors, pattern) {
	assert(Array.isArray(errors) && errors.length, 'Expected explicit rejection');
	assert(errors.some(error => pattern.test(error)), errors.join('\n'));
}
describe('Custom Rules on the supported Reborn dex', () => {
	it('accepts the control team before banning it', () => {
		assert.equal(validate([mew()]), null); rejected(validate([mew()], ['-Mew']), /Mew.*banned/);
	});
	for (const [label, ban, set, pattern] of [
		['species', 'Mew', {}, /Mew.*banned/], ['move', 'Psychic', {}, /Psychic.*banned/],
		['item', 'Leftovers', { item: 'Leftovers' }, /Leftovers.*banned/], ['ability', 'Natural Cure', {}, /Natural Cure.*banned/],
	]) it(`adds and repeals a ${label} ban`, () => {
		const team = [mew(set)]; assert.equal(validate(team), null);
		rejected(validate(team, [], { banlist: [ban] }), pattern);
		assert.equal(validate(team, ['+' + ban], { banlist: [ban] }), null);
	});
	it('whitelists one species', () => {
		assert.equal(validate([mew()], ['-All Pokemon', '+Mew']), null);
		rejected(validate([mew({ species: 'Mewtwo', ability: 'Pressure' })], ['-All Pokemon', '+Mew']), /Mewtwo.*(banned|allowed)/);
	});
	it('bans no-item sets while allowing held items', () => {
		rejected(validate([mew()], ['-No Item']), /item/i);
		assert.equal(validate([mew({ item: 'Leftovers' })], ['-No Item']), null);
	});
	it('supports an item whitelist', () => {
		assert.equal(validate([mew({ item: 'Leftovers' })], ['-All Items', '+Leftovers']), null);
		rejected(validate([mew({ item: 'Life Orb' })], ['-All Items', '+Leftovers']), /Life Orb.*(banned|allowed)/);
	});
	it('removes ability legality without removing move legality', () => {
		const team = [mew({ ability: 'Air Lock' })]; rejected(validate(team), /Air Lock/);
		assert.equal(validate(team, ['!Obtainable Abilities']), null);
		rejected(validate([mew({ ability: 'Air Lock', moves: ['Spore'] })], ['!Obtainable Abilities']), /Spore/);
	});
	it('supports legality tags without admitting unknown species', () => {
		const team = [{ species: 'Kitsunoh', ability: 'Frisk', moves: ['Shadow Strike'], evs: { hp: 1 } }];
		rejected(validate(team), /Kitsunoh/); assert.equal(validate(team, ['+CAP']), null);
		rejected(validate([mew({ species: 'Not A Pokemon' })], ['+CAP']), /exist|recogniz|invalid/i);
	});
	it('supports tagged restrictions', () => {
		const rules = ['Limit One Restricted', '*Restricted Legendary'];
		const first = mew({ species: 'Yveltal', ability: 'No Ability' }), second = mew({ species: 'Xerneas', ability: 'No Ability' });
		assert.equal(validate([first], rules, { ruleset: [] }), null);
		rejected(validate([first, second], rules, { ruleset: [] }), /one restricted/);
	});
	it('applies a set combination ban only when both parts coexist', () => {
		rejected(validate([mew()], ['-Mew + Psychic']), /Mew.*Psychic|Psychic.*Mew/);
		assert.equal(validate([mew({ moves: ['Protect'] })], ['-Mew + Psychic']), null);
	});
	it('applies team combination bans across sets', () => {
		rejected(validate([mew(), mew({ moves: ['Protect'] })], ['-Psychic ++ Protect']), /Psychic.*Protect|Protect.*Psychic/);
		assert.equal(validate([mew()], ['-Psychic ++ Protect']), null);
	});
	it('alters a team combination limit', () => {
		const rules = ['-Psychic ++ Protect > 2'];
		assert.equal(validate([mew(), mew({ moves: ['Protect'] })], rules), null);
		rejected(validate([mew(), mew(), mew({ moves: ['Protect'] })], rules), /Psychic|Protect/);
	});
	it('removes a team combination ban', () => {
		const team = [mew(), mew({ moves: ['Protect'] })], ban = 'Psychic ++ Protect';
		rejected(validate(team, [], { banlist: [ban] }), /Psychic|Protect/);
		assert.equal(validate(team, ['+' + ban], { banlist: [ban] }), null);
	});
	it('adds and removes a validator rule', () => {
		const team = [mew(), mew()]; assert.equal(validate(team), null);
		rejected(validate(team, ['Species Clause']), /Species Clause/);
		assert.equal(validate(team, ['!Species Clause'], { ruleset: ['Obtainable', 'Species Clause'] }), null);
	});
	it('parses custom rules on a real public format', () => {
		const format = Dex.formats.get('gen9nofieldsinglesgame@@@-Mew', true); assert.equal(format.effectType, 'Format');
		rejected(new TeamValidator(format).validateTeam([mew()]), /Mew.*banned/);
	});
});
