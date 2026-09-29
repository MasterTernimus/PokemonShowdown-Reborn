'use strict';

const assert = require('assert').strict;
const common = require('../../common');
let battle;

function setup(field, options = {}) {
	const user = {
		species: options.species || 'Mew', ability: options.ability || 'No Ability',
		moves: options.moves || ['splash'],
	};
	const opponent = { species: 'Mew', ability: options.targetAbility || 'No Ability', moves: ['splash'] };
	const teams = options.doubles ? [[user, { ...user }], [opponent, { ...opponent }]] : [[user], [opponent]];
	battle = common.createBattle({
		formatid: options.doubles ? 'gen9nofielddoublesbattle' : 'gen9nofieldsinglesgame',
	}, teams);
	battle.makeChoices(options.doubles ? 'team 12' : 'team 1', options.doubles ? 'team 12' : 'team 1');
	battle.field.startTerrain(field);
	return [battle.p1.active[0], battle.p2.active[0]];
}

describe('Field audit follow-up regressions', () => {
	afterEach(() => { battle?.destroy(); battle = null; });

	for (const move of ['helpinghand', 'coaching']) {
		it(`lets ${move} fail normally without an ally on Glitch Field`, () => {
			setup('glitchterrain', { moves: [move] });
			battle.makeChoices();
			assert.equal(battle.turn, 2);
			assert(battle.log.some(line => line === '|-fail|p1a: Mew'));
		});
	}

	for (const [ability, fraction] of [
		['Solid Rock', 1 / 3], ['Prism Armor', 1 / 3], ['Shell Armor', 1 / 2],
		['Battle Armor', 1 / 2], ['Warship', 1 / 3], ['Stalwart', 0],
	]) {
		it(`applies only the intended Cave collapse damage to ${ability}`, () => {
			battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [
				[{ species: 'Tyrantrum', level: 1, ability: 'Rock Head', moves: ['earthquake'] }],
				[{ species: 'Rhyperior', ability, moves: ['splash'] }],
			]);
			battle.makeChoices('team 1', 'team 1');
			battle.field.startTerrain('caveterrain');
			const target = battle.p2.active[0];
			const caveDamage = [];
			battle.onEvent('Damage', battle.format, (damage, pokemon, source, effect) => {
				if (pokemon === target && effect.id === 'caveterrain') caveDamage.push(damage);
			});
			battle.makeChoices();
			battle.makeChoices();
			assert(target.hp > 0);
			assert.deepEqual(caveDamage, fraction ? [Math.floor(target.baseMaxhp * fraction)] : []);
		});
	}

	for (const doubles of [false, true]) {
		for (const [field, turns] of [['snowyterrain', 2], ['swampterrain', 3]]) {
			it(`counts ${field} sun once per turn in ${doubles ? 'doubles' : 'singles'}`, () => {
				const [source] = setup(field, { doubles });
				battle.field.setWeather('sunnyday', source);
				for (let turn = 1; turn <= turns; turn++) {
					battle.makeChoices();
					assert.equal(battle.field.terrain, turn < turns ? field : '');
					if (field === 'swampterrain') {
						assert.deepEqual(battle.getAllActive().map(pokemon => pokemon.boosts.spe),
							Array(doubles ? 4 : 2).fill(-turn));
					}
				}
			});
		}
	}

	for (const field of ['snowyterrain', 'swampterrain']) {
		it(`retains ${field}'s accumulated sunlight across interruptions`, () => {
			const [source] = setup(field);
			battle.field.setWeather('sunnyday', source);
			battle.makeChoices();
			battle.field.clearWeather();
			battle.makeChoices();
			assert.equal(battle.field.terrain, field);
			battle.field.setWeather('sunnyday', source);
			battle.makeChoices();
			if (field === 'swampterrain') {
				assert.equal(battle.field.terrain, field);
				battle.makeChoices();
			}
			assert.equal(battle.field.terrain, '');
		});
	}

	const immunityCases = [
		['burningterrain', 'Flash Fire', 'Kindled Fury', 'flashfire'],
		['volcanicterrain', 'Flash Fire', 'Kindled Fury', 'flashfire'],
		['corrosiveterrain', 'Poison Heal', 'Venom Armor', 'poisonheal'],
		['murkwatersurfaceterrain', 'Poison Heal', 'Venom Armor', 'poisonheal'],
		['swampterrain', 'Quick Feet', 'Live Wire', 'quickfeet'],
		['underwaterterrain', 'Swift Swim', 'Noble Rider', 'swiftswim'],
	];
	for (const [field, standalone, composite, component] of immunityCases) {
		for (const suppressed of [false, true]) {
			it(`${field} respects ${suppressed ? 'suppression of' : 'the component in'} ${composite}`, () => {
				const [source, target] = setup(field, {
					ability: suppressed ? standalone : composite,
					species: field === 'underwaterterrain' ? 'Growlithe' : 'Mew',
				});
				if (suppressed) source.addVolatile('gastroacid', target, battle.dex.moves.get('gastroacid'));
				assert.equal(source.hasAbility(component), !suppressed);
				if (field === 'corrosiveterrain') source.setStatus('slp', target, battle.dex.moves.get('hypnosis'));
				const oldHP = source.hp;
				battle.makeChoices();
				if (field === 'swampterrain') {
					assert.equal(source.boosts.spe, suppressed ? -1 : 0);
				} else {
					assert.equal(source.hp < oldHP, suppressed);
				}
			});
		}
	}

	for (const suppressed of [false, true]) {
		it(`respects ${suppressed ? 'suppressed' : 'active'} Wonder Guard on Murkwater`, () => {
			const [source, target] = setup('murkwatersurfaceterrain', { ability: 'Wonder Guard' });
			if (suppressed) source.addVolatile('gastroacid', target, battle.dex.moves.get('gastroacid'));
			battle.makeChoices();
			assert.equal(source.hp < source.maxhp, suppressed);
		});
	}

	it('honors Venom Armor when switching onto Corrosive Field', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [
			[
				{ species: 'Mew', ability: 'No Ability', moves: ['splash'] },
				{ species: 'Mew', ability: 'Venom Armor', moves: ['splash'] },
			],
			[{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }],
		]);
		battle.makeChoices('team 12', 'team 1');
		battle.field.startTerrain('corrosiveterrain');
		battle.makeChoices('switch 2', 'move splash');
		assert.equal(battle.p1.active[0].hp, battle.p1.active[0].maxhp);
	});

	for (const [field, ability, species, multiplier] of [
		['burningterrain', 'Permafrost', 'Mew', 2],
		['volcanicterrain', 'Permafrost', 'Mew', 2],
		['underwaterterrain', 'Heat Coil', 'Growlithe', 4],
	]) {
		it(`recognizes ${ability}'s component vulnerability on ${field}`, () => {
			const [source] = setup(field, { ability, species });
			battle.makeChoices();
			assert.equal(source.maxhp - source.hp,
				Math.floor(Math.floor(source.baseMaxhp / 8 * (multiplier / 2)) * 2));
		});
	}

	it('recognizes Royal Scales Oblivious on Chessboard and stops when suppressed', () => {
		const [source, target] = setup('chessboardterrain', { targetAbility: 'Royal Scales' });
		const move = battle.dex.getActiveMove('psychic');
		assert.equal(battle.runEvent('BasePower', source, target, move, 100), 300);
		target.addVolatile('gastroacid', source, battle.dex.moves.get('gastroacid'));
		assert.equal(battle.runEvent('BasePower', source, target, move, 100), 150);
	});

	for (const ability of ['Own Tempo', 'Pure Power', 'Sand Veil', 'Steadfast']) {
		it(`gives ${ability} Ashen Beach's accuracy guarantee`, () => {
			const [source, target] = setup('ashenbeachterrain', { ability });
			assert.equal(battle.runEvent('Accuracy', target, source, battle.dex.getActiveMove('hypnosis'), 60), true);
		});
	}

	for (const counter of ['Unnerve', 'Gastro Acid']) {
		it(`retains the ${counter} exception to Ashen Beach accuracy`, () => {
			const [source, target] = setup('ashenbeachterrain', {
				ability: 'Own Tempo', targetAbility: counter === 'Unnerve' ? counter : 'No Ability',
			});
			if (counter === 'Gastro Acid') source.addVolatile('gastroacid', target, battle.dex.moves.get('gastroacid'));
			assert.equal(battle.runEvent('Accuracy', target, source, battle.dex.getActiveMove('hypnosis'), 60), 60);
		});
	}
});
