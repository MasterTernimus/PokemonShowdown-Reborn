'use strict';

const assert = require('assert').strict;

const common = require('../../common');

const { Dex } = require('../../../dist/sim/dex');

describe('Approved ability followups', () => {
	let b;

	afterEach(() => {
		b?.destroy();
	});

	function start(ability, foeAbility = 'No Ability', species = 'Mew', item = '') {
		b = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [
			[{ species, ability, item, moves: ['splash', 'tackle', 'protect', 'slackoff'] }, { species: 'Mew', ability: 'No Ability', moves: ['splash'] }],
			[{ species: 'Mew', ability: foeAbility, moves: ['splash', 'tackle', 'fakeout'] }],
		]);

		b.makeChoices('team 12', 'team 1');

		b.randomizer = x => x;

		b.randomChance = (n, d) => n >= d;

		return [b.p1.active[0], b.p2.active[0]];
	}

	function hit(source, target, id = 'tackle', extra = {}) {
		const move = b.dex.getActiveMove(id);

		Object.assign(move, { accuracy: true, willCrit: false, basePower: 10, secondaries: undefined }, extra);

		b.actions.runMove(move, source, source.getLocOf(target));

		return move;
	}

	for (const ability of ['Shadow Shield', 'Voidcraft', 'Cursed Doll', 'Phantom Fist', 'Surge Conduit']) {
		for (const hp of [1, 0.5])
			it(`${ability}: universal and super-effective reductions at ${hp} HP`, () => {
				const [p, t] = start(ability);
				p.hp = Math.floor(p.maxhp * hp);

				for (const mod of [-1, 0, 1, 2]) {
					const move = b.dex.getActiveMove('tackle');
					p.getMoveHitData(move).typeMod = mod;

					assert.equal(b.runEvent('ModifyDamage', t, p, move, 100), mod > 0 ? 60 : 80);
				}
			});
	}

	for (const field of ['darkcrystalcavernterrain', 'newworldterrain', 'starlightarenaterrain', 'coldeclipseterrain'])
		it(`Shadow Shield does not stack old ${field} reduction`, () => {
			const [p, t] = start('Shadow Shield');
			b.field.setTerrain(field, p, p.getAbility());
			const m = b.dex.getActiveMove('tackle');
			p.getMoveHitData(m).typeMod = 1;

			assert.equal(b.runEvent('ModifyDamage', t, p, m, 100), 60);
		});

	for (const ability of ['Shadow Shield', 'Voidcraft']) {
		for (const ignore of ['Mold Breaker', 'Teravolt', 'Turboblaze', 'move'])
			it(`${ability} damage persists against ${ignore}`, () => {
				const [p, t] = start(ability, ignore === 'move' ? 'No Ability' : ignore);
				const m = b.dex.getActiveMove('tackle');
				m.ignoreAbility = true;
				p.getMoveHitData(m).typeMod = 1;

				b.setActiveMove(m, t, p);
				assert.equal(b.runEvent('ModifyDamage', t, p, m, 100), 60);
			});

		for (const suppression of ['gastroacid', 'gas'])
			it(`${ability} is disabled by ${suppression}`, () => {
				const [p, t] = start(ability, suppression === 'gas' ? 'Neutralizing Gas' : 'No Ability');
				if (suppression === 'gastroacid')
					p.addVolatile('gastroacid');

				const m = b.dex.getActiveMove('tackle');
				p.getMoveHitData(m).typeMod = 1;
				assert.equal(b.runEvent('ModifyDamage', t, p, m, 100), 100);
			});

		it(`${ability} reduces every real critical/multi-hit attack and not residual damage`, () => {
			const [p, t] = start(ability);
			const hits = [];
			b.onEvent('DamagingHit', b.format, d => hits.push(d));

			hit(t, p, 'tackle', { multihit: 3, willCrit: true });
			assert.equal(hits.length, 3);
			assert(hits.every(d => d === hits[0]));

			const before = p.hp;
			b.damage(20, p, t, b.dex.conditions.get('sandstorm'));
			assert.equal(before - p.hp, 20);
		});
	}

	it('Voidcraft keeps bypassable sleep protection and its legacy name resolves', () => {
		const [p, t] = start('Voidcraft', 'Mold Breaker');
		assert.equal(Dex.abilities.get('Shadow Guard').id, 'voidcraft');

		const m = b.dex.getActiveMove('spore');
		m.ignoreAbility = true;
		b.setActiveMove(m, t, p);
		assert(b.runEvent('SetStatus', p, t, m, b.dex.conditions.get('slp')));

		assert.equal(Dex.species.get('Mismagius-Mega').abilities[0], 'Voidcraft');
	});

	it('Exalt exposes Defiant and Sharpness without full Inner Focus or old STAB', () => {
		const [p, t] = start('Exalt');
		assert(p.hasAbility('defiant'));
		assert(p.hasAbility('sharpness'));
		assert(!p.hasAbility('innerfocus'));

		assert(!p.getAbility().onModifyMove);
		assert(!p.hasAbility('slushrush'));
		assert(!p.hasAbility('swiftswim'));

		for (const [id, power] of [['slash', 150], ['steelwing', 150], ['icebeam', 100], ['airslash', 150], ['tackle', 100]]) {
			const m = b.dex.getActiveMove(id);
			assert.equal(b.runEvent('BasePower', p, t, m, 100), power, id);
		}

		const wing = b.dex.getActiveMove('steelwing');
		wing.flags.slicing = 1;
		assert.equal(b.runEvent('BasePower', p, t, wing, 100), 150);

		assert(!Dex.moves.get('steelwing').flags.slicing);

		b.field.setTerrain('coldeclipseterrain', p, p.getAbility());
		assert.equal(b.runEvent('BasePower', p, t, wing, 100), 100);
	});

	it('Exalt Intimidate lowers Attack then Defiant leaves net +1', () => {
		const [p] = start('Exalt', 'Intimidate');
		assert.equal(p.boosts.atk, 1);
	});

	it('Exalt Defiant handles each opposing drop, but not its own or ally drops', () => {
		const [p, t] = start('Exalt', 'Mold Breaker');
		const m = b.dex.getActiveMove('growl');
		b.setActiveMove(m, t, p);

		b.boost({ def: -1, spd: -1 }, p, t, m);
		assert.equal(p.boosts.atk, 4);

		b.boost({ def: -1 }, p, p, m);
		b.boost({ def: -1 }, p, p.side.pokemon[1], m);
		assert.equal(p.boosts.atk, 4);
	});

	for (const mode of ['normal', 'Mold Breaker', 'gastroacid', 'gas'])
		it(`Exalt Fake Out damage and flinch: ${mode}`, () => {
			const [p, t] = start('Exalt', mode === 'gas' ? 'Neutralizing Gas' : mode === 'Mold Breaker' ? mode : 'No Ability');
			if (mode === 'gastroacid')
				p.addVolatile('gastroacid');

			const hp = p.hp;
			hit(t, p, 'fakeout', { secondaries: [{ chance: 100, volatileStatus: 'flinch' }] });
			assert(p.hp < hp);
			assert.equal(!!p.volatiles.flinch, mode !== 'normal');

			if (mode === 'gastroacid' || mode === 'gas')
				assert.equal(b.runEvent('BasePower', p, t, b.dex.getActiveMove('slash'), 100), 100);
		});

	for (const species of ['Mr. Mime', 'Mr. Mime-Galar'])
		it(`${species} uses the same Pulse transformation`, () => {
			const [p] = start(Dex.species.get(species).abilities[0], 'No Ability', species, 'Anomaly Core');
			assert.equal(p.canMegaEvo, 'Mr. Mime-Pulse');

			b.makeChoices('move splash mega', 'move splash');
			assert.equal(p.species.id, 'mrmimepulse');
			assert.equal(p.ability, 'pulsebulwark');

			assert.deepEqual(Dex.species.get('Mr. Mime-Galar').evos, ['Mr. Rime']);
		});

	it('Core does not give Mr. Rime a Pulse evolution', () => {
		const [p] = start('No Ability', 'No Ability', 'Mr. Rime', 'Anomaly Core');
		assert(!p.canMegaEvo);
	});
});
