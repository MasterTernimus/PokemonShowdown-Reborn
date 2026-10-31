'use strict';

const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');

describe('Toxic Armor Intimidate-only protection', () => {
	let battle;
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});

	function setup(status = '', species = 'Zangoose-Mega', ability = 'Toxic Armor', gameType = 'singles') {
		const helper = { species: 'Mew', ability: 'No Ability', moves: ['splash'] };
		battle = common.createBattle({ gameType }, [
			[{ species, ability, moves: ['metalclaw', 'superpower'] }, helper],
			[helper, helper],
		]);
		battle.field.terrain = '';
		for (const pokemon of battle.getAllActive()) pokemon.hp = pokemon.maxhp = pokemon.baseMaxhp = 10000;
		const holder = battle.p1.active[0];
		holder.status = status;
		return [holder, battle.p2.active[0]];
	}

	function useMove(source, target, id) {
		battle.actions.useMove(Object.assign(Dex.getActiveMove(id), { accuracy: true, willCrit: false }), source, { target });
	}

	for (const status of ['', 'psn', 'tox', 'brn']) {
		for (const ability of ['Intimidate', 'Hellfire Eclipse', 'Street Tyrant']) {
			it(`blocks actual ${ability} Intimidate activation with status ${status || 'healthy'}`, () => {
				const [holder, foe] = setup(status);
				foe.setAbility(ability, foe, null, true);
				assert(foe.abilityState.intimidateActivated, 'Intimidate actually activated');
				assert.equal(holder.boosts.atk, 0);
			});
		}
		for (const [move, drop] of [['growl', -1], ['charm', -2], ['featherdance', -2]]) {
			it(`allows ${move} from an Intimidate holder with status ${status || 'healthy'}`, () => {
				const [holder, foe] = setup(status);
				foe.setAbility('Intimidate', foe, null, true);
				assert.equal(holder.boosts.atk, 0);
				useMove(foe, holder, move);
				assert.equal(holder.boosts.atk, drop);
			});
		}
		it(`allows Deep Resonance's Attack drop with status ${status || 'healthy'}`, () => {
			const [holder, foe] = setup(status);
			foe.setAbility('Deep Resonance', foe, null, true);
			const hp = holder.hp;
			useMove(foe, holder, 'psychicnoise');
			assert(holder.hp < hp, 'Psychic Noise actually damaged the holder');
			assert.equal(holder.boosts.atk, -1);
		});
		it(`retains Superpower's self drops with status ${status || 'healthy'}`, () => {
			const [holder, foe] = setup(status);
			useMove(holder, foe, 'superpower');
			assert.equal(holder.boosts.atk, -1);
			assert.equal(holder.boosts.def, -1);
		});
		it(`allows allies' Attack drops and opponents' other stat drops with status ${status || 'healthy'}`, () => {
			const [holder, foe] = setup(status, 'Zangoose-Mega', 'Toxic Armor', 'doubles');
			battle.boost({ atk: -1 }, holder, battle.p1.active[1], Dex.moves.get('growl'));
			battle.boost({ def: -1, spa: -1, spd: -1, spe: -1, accuracy: -1, evasion: -1 }, holder, foe, Dex.moves.get('partingshot'));
			assert.deepEqual(holder.boosts, { atk: -1, def: -1, spa: -1, spd: -1, spe: -1, accuracy: -1, evasion: -1 });
		});
	}
	for (const sourceAbility of ['Intimidate', 'Hellfire Eclipse']) {
		for (const [ability, item, atk, spa, spe] of [
			['No Ability', '', -1, 0, 0],
			['Defiant', '', 1, 0, 0],
			['Competitive', '', -1, 2, 0],
			['Guard Dog', '', 1, 0, 0],
			['No Ability', 'Adrenaline Orb', -1, 0, 1],
		]) {
			it(`${sourceAbility} retains ${item || ability} responses on an unaffected target`, () => {
				const [holder, foe] = setup('', 'Mew', ability);
				if (item) holder.setItem(item);
				foe.setAbility(sourceAbility, foe, null, true);
				assert.equal(holder.boosts.atk, atk);
				assert.equal(holder.boosts.spa, spa);
				assert.equal(holder.boosts.spe, spe);
				if (item) assert.equal(holder.item, '');
			});
		}
	}

	it('preserves regular Zangoose and copied Venom Armor protection scopes', () => {
		const [holder, foe] = setup('psn', 'Zangoose', 'Venom Armor');
		foe.setAbility('Intimidate', foe, null, true);
		assert.equal(holder.boosts.atk, -1);
		assert(holder.hasAbility('runaway'));
		battle.destroy();
		const [copiedHolder, copiedFoe] = setup('psn', 'Mew', 'Venom Armor');
		useMove(copiedFoe, copiedHolder, 'charm');
		assert.equal(copiedHolder.boosts.atk, 0);
	});
	it('describes Intimidate immunity without a poison requirement or general Attack protection', () => {
		const ability = Dex.abilities.get('toxicarmor');
		assert(ability.desc.includes('Immune to Intimidate regardless of status'));
		assert(ability.desc.includes('Other opposing and self-inflicted Attack drops still apply'));
		assert(!ability.desc.includes('opposing Pokemon cannot lower its Attack'));
		assert(ability.shortDesc.includes('Intimidate'));
	});
});
