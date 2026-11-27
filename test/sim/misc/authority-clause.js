'use strict';

const assert = require('assert').strict;
const { Dex, TeamValidator, Teams } = require('../../../dist/sim');
const { authorityForms } = require('../../../dist/data/authority-clause');
const common = require('../../common');

describe('Authority Clause team-wide Ultra limits', () => {
	const format = 'gen9nofieldsinglesgame';
	const set = (species, ability, item = '', move = 'protect') => ({ species, ability, item, moves: [move] });
	const emboar = () => set('Emboar', 'Reckless', 'Emboarite');
	const hawlucha = () => set('Hawlucha', 'Unburden', 'Hawluchanite');
	const infernape = () => set('Infernape', 'Ultra Instinct', 'Infernite');
	const lucario = () => set('Lucario', Dex.species.get('Lucario').abilities[0], 'Lucarionite Z');
	const validate = team => new TeamValidator(format).validateTeam(JSON.parse(JSON.stringify(team)));
	const rule = Dex.formats.get('authorityclause');
	const check = (team, dex = Dex) => rule.onValidateTeam.call({ dex, toID: Dex.toID }, team);

	it('allows exactly one ordinary Ultra Ego user and one ordinary Ultra Instinct user', () => {
		assert.equal(validate([set('Hitmonchan', 'Ultra Ego'), set('Hitmonlee', 'Ultra Instinct')]), null);
	});
	it('counts Midday and Midnight passives with their new selectable abilities', () => {
		const day = set('Lycanroc', 'Daybreak Rush');
		const night = set('Lycanroc-Midnight', 'Moonlit Reprisal');
		assert.equal(check([day, night]), undefined);
		assert(check([day, set('Hitmonlee', 'Ultra Instinct')]).some(error => error.includes('Ultra Instinct')));
		assert(check([night, set('Throh', 'Ultra Ego')]).some(error => error.includes('Ultra Ego')));
	});
	it('rejects two ordinary Ultra Ego users', () => {
		assert(validate([set('Hitmonchan', 'Ultra Ego'), set('Throh', 'Ultra Ego')])
			.some(error => /only one Ultra Ego/.test(error)));
	});
	it('rejects two ordinary Ultra Instinct users', () => {
		assert(validate([set('Hitmonlee', 'Ultra Instinct'), set('Sawk', 'Ultra Instinct')])
			.some(error => /only one Ultra Instinct/.test(error)));
	});
	it('rejects Mega Emboar plus Mega Hawlucha through equipped stones', () => {
		assert(validate([emboar(), hawlucha()]).some(error => /only one Ultra Ego/.test(error)));
	});
	it('counts Infernite’s mandatory Ultra Instinct against an ordinary Ultra Instinct teammate', () => {
		assert(validate([set('Infernape', 'Opportunist', 'Infernite'), set('Sawk', 'Ultra Instinct')])
			.some(error => /only one Ultra Instinct/.test(error)));
	});
	it('allows one of each Mega family without double-counting Infernape before and after evolution', () => {
		assert.equal(validate([emboar(), infernape()]), null);
	});
	it('does not allow an ordinary Ultra Ego user alongside an Ultra Ego Mega', () => {
		assert(validate([emboar(), set('Throh', 'Ultra Ego')]).some(error => /only one Ultra Ego/.test(error)));
	});
	it('counts nested Ultra Ego composites outside the old Authority list', () => {
		const team = [set('Gyarados', 'Intimidate', 'Gyaradosite'),
			set('Torterra', Dex.species.get('Torterra').abilities[0], 'Torterranite')];
		assert(validate(team).some(error => /only one Ultra Ego/.test(error)));
	});
	for (const [stone, mega, forced] of [
		['Lucarionite', 'Lucario-Mega', 'Insight'], ['Lucarionite Z', 'Lucario-Mega-Z', 'Aura Precision'],
	]) {
		it('allows the Ultra Instinct from ' + stone + ' alongside Twilight Instinct', () => {
			const wolf = set('Lycanroc-Dusk', 'Twilight Instinct');
			for (const ability of ['Carry On', 'Convergence', 'Armorize', 'Ultra Ego']) {
				assert.equal(validate([set('Lucario', ability, stone), wolf]), null);
			}
			const text = mega + ' @ ' + stone + '\nAbility: ' + forced + '\n- Protect\n\n' +
				'Lycanroc-Dusk\nAbility: Twilight Instinct\n- Protect';
			assert.equal(validate(Teams.unpack(Teams.pack(Teams.import(text)))), null);
		});
		it('counts genuinely selected abilities even with ' + stone, () => {
			const wolf = set('Lycanroc-Dusk', 'Twilight Instinct');
			for (const ability of ['Ultra Instinct', forced]) {
				assert(validate([set('Lucario', ability, stone), wolf]).some(error => /only one Ultra Instinct/.test(error)));
			}
			assert(validate([set('Lucario', 'Ultra Ego', stone), wolf, set('Throh', 'Ultra Ego')])
				.some(error => /only one Ultra Ego/.test(error)));
			const errors = validate([set('Lucario', 'Convergence', stone), wolf, set('Sawk', 'Ultra Instinct')]);
			assert(errors.some(error => /only one Ultra Instinct/.test(error)));
			assert(!errors.join(' ').includes('Lucario'));
		});
	}
	it('counts a directly selected Insight and a Mega with an unrelated item', () => {
		const wolf = set('Lycanroc-Dusk', 'Twilight Instinct');
		assert(validate([set('Lucario', 'Insight'), wolf]).some(error => /only one Ultra Instinct/.test(error)));
		assert(check([set('Lucario-Mega', 'Insight', 'Leftovers'), wolf]).some(error => /only one Ultra Instinct/.test(error)));
	});
	it('counts Dusk Ego and Twilight Instinct on ordinary Lycanroc forms', () => {
		assert.equal(validate([set('Lycanroc-Dusk', 'Dusk Ego'), set('Hitmonlee', 'Ultra Instinct')]), null);
		assert(validate([set('Lycanroc-Dusk', 'Dusk Ego'), set('Throh', 'Ultra Ego')])
			.some(error => /only one Ultra Ego/.test(error)));
		assert(validate([set('Lycanroc-Dusk', 'Twilight Instinct'), set('Sawk', 'Ultra Instinct')])
			.some(error => /only one Ultra Instinct/.test(error)));
	});
	it('does not count an unrelated held Mega Stone as enabling a family form', () => {
		assert.equal(check([set('Emboar', 'Reckless', 'Hawluchanite'), hawlucha()]), undefined);
	});
	it('rejects pasted and packed Mega teams after validation normalizes their forms', () => {
		const text = 'Emboar-Mega @ Emboarite\nAbility: Burning Ego\n- Protect\n\n' +
			'Hawlucha-Mega @ Hawluchanite\nAbility: Perfect Ego\n- Protect';
		const team = Teams.unpack(Teams.pack(Teams.import(text)));
		assert(validate(team).some(error => /only one Ultra Ego/.test(error)));
	});
	it('retains the existing Authority group and counts each Pokemon only once', () => {
		assert(check([set('Pyroar', 'Royal Decree'), set('Nidoking', 'Royal Decree')])
			.some(error => /Neutralization, Royal Decree, Burning Ego, or Perfect Ego/.test(error)));
		assert.equal(check([set('Emboar', 'Burning Ego', 'Emboarite')]), undefined);
		assert.equal(check([set('Pyroar', 'Royal Decree', 'Pyroarite')]), undefined);
	});
	it('retains the unrelated Battle Fervor/Dusk Drive restriction', () => {
		const fighting = Dex.formats.get('fightingclause');
		const result = fighting.onValidateTeam.call({ dex: Dex, toID: Dex.toID },
			[set('Mew', 'Battle Fervor'), set('Lycanroc-Dusk', 'Dusk Drive')]);
		assert(result.some(error => /Fighting Clause/.test(error)));
	});

	// No current Gmax has either component. Model one explicitly to test the
	// rule's transformation/passive paths without changing live species data.
	function gmaxDex(ability, passives = []) {
		const dex = Object.create(Dex);
		dex.species = Object.create(Dex.species);
		dex.species.get = name => {
			const species = Dex.species.get(name);
			return species.id === 'charizardgmax' ? { ...species, abilities: { 0: ability }, passives } : species;
		};
		return dex;
	}
	for (const flag of [false, true]) {
		it(`counts reachable Gmax Ultra Ego with legacy gigantamax flag ${flag}`, () => {
			const team = [{ ...set('Charizard', 'Blaze'), gigantamax: flag }, emboar()];
			assert(check(team, gmaxDex('Ultra Ego')).some(error => /only one Ultra Ego/.test(error)));
		});
	}
	it('counts a Gmax Ultra Instinct passive and allows the opposite Ultra family', () => {
		const dex = gmaxDex('Blaze', ['ultrainstinct']);
		assert(check([set('Charizard', 'Blaze'), infernape()], dex).some(error => /only one Ultra Instinct/.test(error)));
		assert.equal(check([set('Charizard', 'Blaze'), emboar()], dex), undefined);
	});
	it('counts direct Gmax inputs too', () => {
		assert(check([set('Charizard-Gmax', 'Ultra Ego'), hawlucha()], gmaxDex('Ultra Ego'))
			.some(error => /only one Ultra Ego/.test(error)));
	});
	it('matches actual Mega options for all current Ultra Mega families', () => {
		for (const input of [emboar(), hawlucha(), infernape(), lucario(),
			set('Gyarados', 'Intimidate', 'Gyaradosite'), set('Torterra', 'Shell Armor', 'Torterranite'),
			set('Lucario', 'Inner Focus', 'Lucarionite')]) {
			const battle = common.createBattle({}, [[input], [set('Mew', 'Synchronize')]]);
			try {
				const pokemon = battle.p1.active[0];
				const forms = authorityForms(Dex, input).map(form => form.id);
				for (const name of [pokemon.canMegaEvo, pokemon.canMegaEvoX, pokemon.canMegaEvoY].filter(Boolean)) {
					assert(forms.includes(Dex.toID(name)), `${input.species}: missing reachable ${name}`);
				}
			} finally {
				battle.destroy();
			}
		}
	});
	it('retains actual transformation for every available Gmax candidate', () => {
		for (const species of Dex.species.all().filter(form => form.canGigantamax && !form.forme.includes('Gmax'))) {
			const battle = common.createBattle({ formatid: 'gen9mistyfieldadrienn' }, [
				[{ ...set(species.name, 'No Ability', '', 'splash'), gigantamax: true }],
				[set('Mew', 'No Ability', '', 'splash')],
			]);
			try {
				battle.makeChoices('team 1', 'team 1');
				const pokemon = battle.p1.active[0];
				const expected = pokemon.canDynamax;
				assert(Dex.species.get(expected).exists, `${species.name}: missing Gmax destination`);
				// Some custom species install a fixed moveset; use the actual first slot.
				battle.makeChoices('move 1 dynamax', 'move splash');
				assert.equal(pokemon.species.id, expected, species.name);
			} finally {
				battle.destroy();
			}
		}
	});
});
