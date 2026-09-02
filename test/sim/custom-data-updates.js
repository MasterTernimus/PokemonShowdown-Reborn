'use strict';

const assert = require('./../assert');
const common = require('./../common');
const {Dex} = require('./../../dist/sim/dex');

let battle;

describe('Custom battle data updates', function () {
	afterEach(function () {
		if (battle) {
			battle.destroy();
			battle = null;
		}
	});

	it('should let Gardevoir shift between Mega forms while a gimmick remains', function () {
		const gardevoir = Dex.species.get('Gardevoir');
		assert.deepEqual(gardevoir.formeOrder, [
			'Gardevoir', 'Gardevoir-Mega', 'Gardevoir-Void-Mega', 'Gardevoir-Mega-Z',
		]);
		assert.false(Dex.species.get('Gardevoir-Void').exists);

		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Gardevoir', ability: 'trace', item: 'gardevoirite', moves: ['splash']},
		], [
			{species: 'Magikarp', ability: 'swiftswim', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');

		const activeGardevoir = battle.p1.active[0];
		assert.equal(activeGardevoir.canMegaEvoX, 'Gardevoir-Mega-Z');
		battle.makeChoices('move splash megax', 'move splash');
		assert.species(activeGardevoir, 'Gardevoir-Mega-Z');
		assert.equal(activeGardevoir.side.gimmickCount, 1);
		assert.equal(activeGardevoir.canMegaEvoY, 'Gardevoir-Void-Mega');

		battle.makeChoices('move splash megay', 'move splash');
		assert.species(activeGardevoir, 'Gardevoir-Void-Mega');
		assert.equal(activeGardevoir.side.gimmickCount, 2);
		assert.false(activeGardevoir.canMegaEvo);
		assert.false(activeGardevoir.canMegaEvoX);
		assert.false(activeGardevoir.canMegaEvoY);
	});

	it('should let Charizardite X and Y cross-evolve Charizard', function () {
		for (const [item, normal, alternate, choice] of [
			['Charizardite X', 'Charizard-Mega-X', 'Charizard-Mega-Y', 'megay'],
			['Charizardite Y', 'Charizard-Mega-Y', 'Charizard-Mega-X', 'megax'],
		]) {
			battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
				{species: 'Charizard', item, moves: ['splash']},
			], [
				{species: 'Magikarp', moves: ['splash']},
			]]);
			battle.makeChoices('team 1', 'team 1');

			const charizard = battle.p1.active[0];
			assert.equal(charizard.canMegaEvo, normal);
			assert.equal(choice === 'megax' ? charizard.canMegaEvoX : charizard.canMegaEvoY, alternate);
			assert.match(battle.dex.items.get(item).shortDesc, /either Mega Charizard X or Mega Charizard Y/);

			battle.makeChoices(`move splash ${choice}`, 'move splash');
			assert.species(charizard, alternate);
			battle.destroy();
			battle = null;
		}
	});

	it('should keep Rapid Response and Violent Rush for the entire first active turn only', function () {
		battle = common.createBattle({formatid: 'gen9nofielddoublesbattle'}, [[
			{species: 'Rapidash', ability: 'rapidresponse', moves: ['protect']},
			{species: 'Bouffalant', ability: 'violentrush', moves: ['protect']},
		], [
			{species: 'Magikarp', ability: 'swiftswim', moves: ['splash']},
			{species: 'Feebas', ability: 'swiftswim', moves: ['splash']},
		]]);
		battle.makeChoices('team 1, 2', 'team 1, 2');

		const rapidash = battle.p1.active[0];
		const bouffalant = battle.p1.active[1];
		const firstTurnSpA = rapidash.getStat('spa');
		const firstTurnAtk = bouffalant.getStat('atk');
		rapidash.activeTurns = 2;
		bouffalant.activeTurns = 2;
		assert(firstTurnSpA > rapidash.getStat('spa'));
		assert(firstTurnAtk > bouffalant.getStat('atk'));
	});

	it('should expose the requested stats, abilities, moves, and removed Splinter condition', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'});
		const dex = battle.dex;
		assert.deepEqual(dex.species.get('Kingler').baseStats, {hp: 80, atk: 125, def: 115, spa: 60, spd: 60, spe: 75});
		assert.deepEqual(dex.species.get('Kingler-Gmax').baseStats, {hp: 120, atk: 125, def: 115, spa: 60, spd: 60, spe: 75});
		assert.equal(dex.species.get('Yanmega').abilities.H, 'Compound Eyes');
		assert.equal(dex.species.get('Starmie-Mega').baseStats.atk, 100);
		assert.equal(dex.moves.get('Needle Arm').basePower, 100);
		assert.equal(dex.moves.get('Meteor Mash').basePower, 100);
		assert.equal(dex.moves.get('Meteor Mash').secondary.chance, 30);
		assert.false(dex.conditions.get('splinter').exists);

		const kinglerMoves = dex.species.getLearnsetData('kingler').learnset;
		for (const move of ['bodypress', 'clamp', 'flipturn', 'quickguard', 'tripledive']) {
			assert(kinglerMoves[move], `Kingler should learn ${move}`);
		}
		assert.false(dex.species.getLearnsetData('noivern').learnset.torchsong);
		assert.false(dex.species.getLearnsetData('decidueye').learnset.ceaselessedge);
		assert.false(dex.species.getLearnsetData('decidueyehisui').learnset.ceaselessedge);
	});

	it('should expose the requested Ariados and Mega Ariados stats', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'});
		const dex = battle.dex;
		const ariados = dex.species.get('Ariados');
		const megaAriados = dex.species.get('Ariados-Mega');
		assert.deepEqual(ariados.baseStats, {hp: 90, atk: 100, def: 80, spa: 50, spd: 80, spe: 40});
		assert.equal(ariados.bst, 440);
		assert.deepEqual(megaAriados.baseStats, {hp: 90, atk: 115, def: 110, spa: 110, spd: 110, spe: 50});
		assert.equal(megaAriados.bst, 585);
	});

	it('should expose Chimecho-Mega-Y with the shared Chimechite', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'});
		const dex = battle.dex;
		const chimecho = dex.species.get('Chimecho');
		const megaY = dex.species.get('Chimecho-Mega-Y');
		assert.deepEqual(chimecho.otherFormes, ['Chimecho-Mega', 'Chimecho-Mega-Y']);
		assert.deepEqual(megaY.types, ['Psychic', 'Ghost']);
		assert.deepEqual(megaY.baseStats, {hp: 75, atk: 50, def: 80, spa: 145, spd: 100, spe: 105});
		assert.equal(megaY.bst, 555);
		assert.deepEqual(megaY.abilities, {0: 'Haunted Chime'});
		assert.equal(megaY.requiredItem, 'Chimechite');
		assert.deepEqual(dex.items.get('Chimechite').megaStone, {Chimecho: 'Chimecho-Mega'});
		assert.false(dex.items.get('Chimechite Y').exists);
	});

	it('should expose Meganium-Mega-Y with the shared Meganiumite', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'});
		const dex = battle.dex;
		const meganium = dex.species.get('Meganium');
		const megaY = dex.species.get('Meganium-Mega-Y');
		assert.deepEqual(meganium.otherFormes, ['Meganium-Mega', 'Meganium-Mega-Y']);
		assert.deepEqual(megaY.types, ['Grass', 'Fire']);
		assert.deepEqual(megaY.baseStats, {hp: 80, atk: 82, def: 130, spa: 113, spd: 130, spe: 90});
		assert.equal(megaY.bst, 625);
		assert.deepEqual(megaY.abilities, {0: 'Blooming Sun'});
		assert.equal(megaY.requiredItem, 'Meganiumite');
		assert.deepEqual(dex.items.get('Meganiumite').megaStone, {Meganium: 'Meganium-Mega'});
		assert.false(dex.items.get('Meganiumite Y').exists);
	});

	it('should let regular shared stones select either Mega form in battle', function () {
		for (const [species, item, normal, alternate] of [
			['Meganium', 'Meganiumite', 'Meganium-Mega', 'Meganium-Mega-Y'],
			['Chimecho', 'Chimechite', 'Chimecho-Mega', 'Chimecho-Mega-Y'],
		]) {
			battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
				{species, item, moves: ['splash']},
			], [
				{species: 'Magikarp', moves: ['splash']},
			]]);
			battle.makeChoices('team 1', 'team 1');

			const pokemon = battle.p1.active[0];
			assert.equal(pokemon.canMegaEvo, normal);
			assert.equal(pokemon.canMegaEvoY, alternate);

			battle.makeChoices('move splash megay', 'move splash');
			assert.species(pokemon, alternate);
			assert.equal(pokemon.canMegaEvoY, normal);
			battle.destroy();
			battle = null;
		}
	});

	it('should split Haxorus-Mega from Haxorus and expose Raging Overlord', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'});
		const dex = battle.dex;
		const haxorus = dex.species.get('Haxorus');
		const megaHaxorus = dex.species.get('Haxorus-Mega');
		assert.deepEqual(haxorus.baseStats, {hp: 95, atk: 147, def: 90, spa: 50, spd: 91, spe: 97});
		assert.equal(haxorus.bst, 570);
		assert.deepEqual(haxorus.otherFormes, ['Haxorus-Mega']);
		assert.deepEqual(megaHaxorus.baseStats, {hp: 95, atk: 177, def: 131, spa: 60, spd: 110, spe: 97});
		assert.equal(megaHaxorus.bst, 670);
		assert.deepEqual(megaHaxorus.abilities, {0: 'Raging Overlord'});
		assert.equal(megaHaxorus.forme, 'Mega');
		assert.equal(megaHaxorus.battleOnly, 'Haxorus');
		assert.equal(megaHaxorus.requiredItem, 'Haxorite');
		assert.deepEqual(dex.items.get('Haxorite').megaStone, {Haxorus: 'Haxorus-Mega'});
		assert.equal(dex.abilities.get('Raging Overlord').name, 'Raging Overlord');
	});

	it('should let Perfect Foresight retain arbitrary copied ability effects', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Alakazam-Mega', ability: 'perfectforesight', moves: ['protect']},
		], [
			{species: 'Blaziken', ability: 'speedboost', moves: ['protect']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const alakazam = battle.p1.active[0];
		assert.equal(alakazam.m.perfectForesightAbility, 'speedboost');

		battle.makeChoices('move protect', 'move protect');
		assert.equal(alakazam.boosts.spe, 1);
		battle.destroy();

		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Alakazam-Mega', ability: 'perfectforesight', moves: ['splash']},
		], [
			{species: 'Lapras', ability: 'waterabsorb', moves: ['surf']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const absorber = battle.p1.active[0];
		const startingHP = absorber.hp;
		assert.equal(absorber.m.perfectForesightAbility, 'waterabsorb');

		battle.makeChoices('move splash', 'move surf');
		assert.equal(absorber.hp, startingHP);
		battle.destroy();

		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Alakazam-Mega', ability: 'perfectforesight', nature: 'Relaxed', ivs: {spe: 0}, moves: ['icywind']},
		], [
			{species: 'Garchomp-Mega-Z', ability: 'relentlesshunt', nature: 'Jolly', evs: {spe: 252}, moves: ['dragonpulse']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move icywind', 'move dragonpulse');
		const usedMoves = battle.log.filter(line => line.startsWith('|move|'));
		assert.match(usedMoves[0], /Alakazam.*Icy Wind/);
	});

	it('should use standard Gravity grounding and recovery behavior', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Blissey', ability: 'naturalcure', moves: ['recover']},
		], [
			{species: 'Magikarp', ability: 'swiftswim', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const blissey = battle.p1.active[0];
		blissey.hp = Math.floor(blissey.maxhp / 4);
		const startingHP = blissey.hp;
		const startingSpeed = blissey.getStat('spe');
		battle.field.addPseudoWeather('gravity', blissey, battle.dex.moves.get('gravity'));

		assert(blissey.isGrounded());
		assert.equal(blissey.getStat('spe'), startingSpeed);
		battle.makeChoices('move recover', 'move splash');
		assert.equal(blissey.hp - startingHP, Math.round(blissey.maxhp / 2));
	});

	it('should grant Ghost resistance after Foresight, Miracle Eye, or Odor Sleuth', function () {
		for (const [move, target] of [
			['foresight', 'Gengar'],
			['miracleeye', 'Umbreon'],
			['odorsleuth', 'Gengar'],
		]) {
			battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
				{species: 'Alakazam', ability: 'synchronize', moves: [move]},
			], [
				{species: target, ability: 'synchronize', moves: ['splash']},
			]]);
			battle.makeChoices('team 1', 'team 1');
			battle.makeChoices(`move ${move}`, 'move splash');
			const user = battle.p1.active[0];
			const foe = battle.p2.active[0];
			assert(user.volatiles.ghostresistance, `${move} should grant Ghost resistance`);

			const shadowBall = battle.dex.getActiveMove('shadowball');
			assert.equal(battle.runEvent('ModifyDamage', foe, user, shadowBall, 100), 50);
			battle.destroy();
			battle = null;
		}
	});

	it('should only add Mind Freeze frostbite to damaging Psychic moves', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Espeon', ability: 'mindfreeze', moves: ['calmmind', 'psychic']},
		], [
			{species: 'Magikarp', ability: 'swiftswim', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const espeon = battle.p1.active[0];
		const ability = battle.dex.abilities.get('mindfreeze');

		const calmMind = battle.dex.getActiveMove('calmmind');
		battle.singleEvent('ModifyMove', ability, espeon.abilityState, calmMind, espeon, espeon);
		assert.false(!!calmMind.secondaries?.some(secondary => secondary.status === 'frz'));

		const psychic = battle.dex.getActiveMove('psychic');
		battle.singleEvent('ModifyMove', ability, espeon.abilityState, psychic, espeon, battle.p2.active[0]);
		assert(psychic.secondaries?.some(secondary => secondary.status === 'frz'));
	});

	it('should not cure Palafin when it switches out or re-enters', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Palafin', ability: 'zerotohero', moves: ['splash']},
			{species: 'Magikarp', ability: 'swiftswim', moves: ['splash']},
		], [
			{species: 'Feebas', ability: 'swiftswim', moves: ['splash']},
			{species: 'Magikarp', ability: 'swiftswim', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const palafin = battle.p1.active[0];
		palafin.setStatus('brn');
		battle.makeChoices('switch 2', 'move splash');
		assert.equal(palafin.status, 'brn');

		battle.makeChoices('switch 2', 'move splash');
		assert.equal(palafin.status, 'brn');
	});

	it('should allow cosmetic starter forms to use their signature Z-Moves', function () {
		for (const [species, item, move, zMove] of [
			['Primarina-Alt', 'Primarium Z', 'Sparkling Aria', 'Oceanic Operetta'],
			['Decidueye-Alt', 'Decidium Z', 'Spirit Shackle', 'Sinister Arrow Raid'],
			['Decidueye-Hisui-Alt', 'Decidium Z', 'Spirit Shackle', 'Sinister Arrow Raid'],
			['Incineroar-Alt', 'Incinium Z', 'Darkest Lariat', 'Malicious Moonsault'],
		]) {
			battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
				{species, item, moves: [move]},
			], [
				{species: 'Magikarp', ability: 'swiftswim', moves: ['splash']},
			]]);
			battle.makeChoices('team 1', 'team 1');
			const zMoves = battle.actions.canZMove(battle.p1.active[0]);
			assert(zMoves?.some(option => option?.move === zMove), `${species} should be offered ${zMove}`);
			battle.destroy();
			battle = null;
		}
	});

	it("should evolve Eevee-Starter before Let's Go moves and reset it on switch", function () {
		const transformations = [
			['baddybad', 'Umbreon'],
			['bouncybubble', 'Vaporeon'],
			['buzzybuzz', 'Jolteon'],
			['freezyfrost', 'Glaceon'],
			['glitzyglow', 'Espeon'],
			['sappyseed', 'Leafeon'],
			['sizzlyslide', 'Flareon'],
			['sparklyswirl', 'Sylveon'],
		];
		for (const [move, forme] of transformations) {
			battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
				{species: 'Eevee-Starter', ability: 'unstableevo', moves: [move, 'splash']},
				{species: 'Magikarp', ability: 'swiftswim', moves: ['splash']},
			], [
				{species: 'Charizard', ability: 'blaze', moves: ['splash']},
			]]);
			battle.makeChoices('team 1', 'team 1');
			const eevee = battle.p1.active[0];
			battle.makeChoices(`move ${move}`, 'move splash');
			assert.species(eevee, forme);
			assert.equal(eevee.ability, 'unstableevo');

			battle.makeChoices('switch 2', 'move splash');
			assert.species(eevee, 'Eevee-Starter');
			battle.destroy();
			battle = null;
		}
	});

	it('should use the evolved Speed tier and built-in Ability effects from Unstable Evo', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Eevee-Starter-Alt', ability: 'unstableevo', item: 'firiumz', moves: ['buzzybuzz', 'bouncybubble', 'splash']},
		], [
			{species: 'Mew', ability: 'limber', moves: ['thunderbolt', 'surf']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const eevee = battle.p1.active[0];
		assert.false(eevee.canDynamax);
		assert.equal(eevee.canTerastallize, null);
		assert.false(battle.actions.canZMove(eevee));
		battle.makeChoices('move buzzybuzz', 'move thunderbolt');
		const moves = battle.log.filter(line => line.startsWith('|move|'));
		assert.match(moves[0], /Eevee.*Buzzy Buzz/);
		assert.species(eevee, 'Jolteon');
		assert.statStage(eevee, 'spa', 1);
		assert.fullHP(eevee);
		assert(battle.log.some(line => line.includes('ability: Volt Absorb')), 'Jolteon should activate Volt Absorb');

		battle.makeChoices('move bouncybubble', 'move surf');
		assert.species(eevee, 'Vaporeon');
		assert.statStage(eevee, 'spa', 2);
		assert.equal(eevee.hp, eevee.maxhp, 'Vaporeon should block Surf after the form change');
		assert(battle.log.some(line => line.includes('ability: Water Absorb')), 'Vaporeon should activate Water Absorb');
	});

	it('should activate both requested built-in Ability effects for each Unstable Evo form', function () {
		const forms = [
			['bouncybubble', 'Vaporeon', ['stormdrain', 'waterabsorb']],
			['buzzybuzz', 'Jolteon', ['lightningrod', 'voltabsorb']],
			['sizzlyslide', 'Flareon', ['soulfire', 'fluffy']],
			['baddybad', 'Umbreon', ['pressure', 'innerfocus']],
			['glitzyglow', 'Espeon', ['magicbounce', 'telepathy']],
			['freezyfrost', 'Glaceon', ['icescales', 'slushrush']],
		];
		for (const [move, forme, components] of forms) {
			battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
				{species: 'Eevee-Starter', ability: 'unstableevo', moves: [move, 'splash']},
			], [
				{species: 'Magikarp', ability: 'swiftswim', moves: ['splash']},
			]]);
			battle.makeChoices('team 1', 'team 1');
			const eevee = battle.p1.active[0];
			const activated = [];
			const originalGet = battle.dex.abilities.get.bind(battle.dex.abilities);
			battle.dex.abilities.get = id => {
				const ability = originalGet(id);
				if (!components.includes(id)) return ability;
				return {
					...ability,
					onStart(pokemon) {
						activated.push(id);
						return ability.onStart?.call(this, pokemon);
					},
				};
			};
			battle.makeChoices(`move ${move}`, 'move splash');
			battle.dex.abilities.get = originalGet;
			assert.species(eevee, forme);
			assert.equal(eevee.ability, 'unstableevo');
			assert.deepEqual(activated, components, `${forme} should activate both requested components`);
			battle.destroy();
			battle = null;
		}
	});

	it('should shift Starter Eevee to Abysseon and keep Searing Void off the user', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Eevee-Starter', ability: 'sinisterblaze', moves: ['Searing Void']},
		], [
			{species: 'Blissey', ability: 'naturalcure', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const abysseon = battle.p1.active[0];
		assert.species(abysseon, 'Abysseon');
		assert.equal(abysseon.status, 'brn');

		battle.destroy();
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Eevee-Starter', ability: 'protean', moves: ['Searing Void']},
		], [
			{species: 'Blissey', ability: 'naturalcure', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const eevee = battle.p1.active[0];
		const maxHP = eevee.hp;
		battle.makeChoices('move searingvoid', 'move splash');
		assert.equal(eevee.hp, maxHP, 'Searing Void should not damage its user');
		assert.equal(eevee.status, '', 'Searing Void should not burn its user');
		assert.equal(battle.p2.active[0].status, 'brn');
		assert.equal(battle.dex.moves.get('searingvoid').target, 'allAdjacent');
		battle.destroy();
		battle = null;
	});

	it('should activate Z Protean before the attack without changing move priority', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Eevee-Starter', ability: 'zprotean', moves: ['tackle']},
		], [
			{species: 'Crobat', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const eevee = battle.p1.active[0];

		battle.makeChoices('move tackle', 'move splash');
		const moves = battle.log.filter(line => line.startsWith('|move|'));
		assert.match(moves[0], /Crobat.*Splash/);
		assert.match(moves[1], /Eevee.*Tackle/);
		assert.species(eevee, 'Eevee-Starter');
		assert.equal(eevee.zProteanVisualSpecies, 'Eevee-Starter-Alt');
		assert(eevee.hasType('Normal'));
	});

	it('should send custom Z Protean sprite formes to the client', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Eevee-Starter', ability: 'zprotean', moves: ['poisonjab']},
		], [
			{species: 'Blissey', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const eevee = battle.p1.active[0];

		battle.makeChoices('move poisonjab', 'move splash');
		assert.equal(eevee.zProteanVisualSpecies, 'Toxeon');
		assert(eevee.hasType('Poison'));
		assert(battle.log.includes('|-formechange|p1a: Eevee|Toxeon|[from] ability: Z Protean'));
	});

	it('should preserve the Grimmsnarl-Azzy skin when Gigantamaxing', function () {
		battle = common.createBattle({formatid: 'gen9mistyfieldadrienn'}, [[
			{species: 'Grimmsnarl-Azzy', ability: 'prankster', gigantamax: true, moves: ['splash']},
			{species: 'Magikarp', moves: ['splash']},
		], [
			{species: 'Blissey', moves: ['splash']},
			{species: 'Magikarp', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const grimmsnarl = battle.p1.active[0];
		assert.equal(grimmsnarl.canDynamax, 'grimmsnarlgmaxazzy');

		battle.makeChoices('move splash dynamax', 'move splash');
		assert.species(grimmsnarl, 'Grimmsnarl-Gmax-Azzy');
	});

	it('should reject Eevium Z specifically when Eevee-Starter uses Unstable Evo', function () {
		const baseSet = {
			species: 'Eevee-Starter-Alt', ability: 'Unstable Evo', moves: ['Buzzy Buzz'],
		};
		assert.legalTeam([{...baseSet}], 'gen9nofieldsinglesgame');
		assert.false.legalTeam([{...baseSet, item: 'Eevium Z'}], 'gen9nofieldsinglesgame');
	});

	it('should give Starter Eevee the Eviolite boost from Eevium Z before and during G-Max', function () {
		battle = common.createBattle({formatid: 'gen9doublesmistyfieldadrienn'}, [[
			{species: 'Eevee-Starter', ability: 'protean', item: 'Eevium Z', gigantamax: true, moves: ['tackle']},
			{species: 'Magikarp', ability: 'swiftswim', moves: ['splash']},
		], [
			{species: 'Blissey', ability: 'naturalcure', moves: ['splash']},
			{species: 'Magikarp', ability: 'swiftswim', moves: ['splash']},
		]]);
		battle.makeChoices('team 1, 2', 'team 1, 2');
		const eevee = battle.p1.active[0];
		const assertEeviumBoost = () => {
			assert.equal(eevee.getStat('def'), battle.modify(eevee.getStat('def', true, true), 1.5));
			assert.equal(eevee.getStat('spd'), battle.modify(eevee.getStat('spd', true, true), 1.5));
		};

		assertEeviumBoost();
		battle.makeChoices('move tackle +1 dynamax, move splash', 'move splash, move splash');
		assert.species(eevee, 'Eevee-Gmax');
		assertEeviumBoost();
	});

	it('should let Eevee and Starter Eevee use Eevium Z with Last Resort', function () {
		for (const species of ['Eevee', 'Eevee-Starter', 'Eevee-Starter-Alt']) {
			const ability = species === 'Eevee' ? 'runaway' : 'protean';
			battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
				{species, ability, item: 'Eevium Z', moves: ['Last Resort']},
			], [
				{species: 'Blissey', ability: 'naturalcure', moves: ['splash']},
			]]);
			battle.makeChoices('team 1', 'team 1');
			const eevee = battle.p1.active[0];
			const zMoves = battle.actions.canZMove(eevee);

			assert.equal(eevee.getStat('def'), battle.modify(eevee.getStat('def', true, true), 1.5));
			assert.equal(eevee.getStat('spd'), battle.modify(eevee.getStat('spd', true, true), 1.5));
			assert(zMoves?.some(option => option?.move === 'Extreme Evoboost'));
			battle.makeChoices('move lastresort zmove', 'move splash');
			for (const stat of ['atk', 'def', 'spa', 'spd', 'spe']) {
				assert.equal(eevee.boosts[stat], 2, `${species} should receive the full Extreme Evoboost`);
			}
			battle.destroy();
			battle = null;
		}
	});

	it('should give Eevium Z and Light Ball owner-only Leftovers recovery', function () {
		for (const [species, ability, item] of [
			['Eevee-Starter', 'protean', 'Eevium Z'],
			['Pikachu-Starter', 'static', 'Light Ball'],
		]) {
			battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
				{species, ability, item, moves: ['Splash']},
			], [
				{species: 'Blissey', ability: 'naturalcure', moves: ['Splash']},
			]]);
			battle.makeChoices('team 1', 'team 1');
			const holder = battle.p1.active[0];
			holder.hp -= 100;
			const hpBefore = holder.hp;
			battle.makeChoices('move splash', 'move splash');
			assert.equal(holder.hp - hpBefore, Math.floor(holder.baseMaxhp / 16));
			battle.destroy();
			battle = null;
		}

		for (const item of ['Eevium Z', 'Light Ball']) {
			battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
				{species: 'Mew', ability: 'synchronize', item, moves: ['Splash']},
			], [
				{species: 'Blissey', ability: 'naturalcure', moves: ['Splash']},
			]]);
			battle.makeChoices('team 1', 'team 1');
			const holder = battle.p1.active[0];
			holder.hp -= 100;
			const hpBefore = holder.hp;
			battle.makeChoices('move splash', 'move splash');
			assert.equal(holder.hp, hpBefore, `${item} should not heal an unrelated holder`);
			battle.destroy();
			battle = null;
		}
	});

	it('should restore Banette-Mega-Z and Cursed Armament', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Banette', ability: 'Cursed Armament', item: 'Banettite', moves: ['curse', 'splash']},
		], [
			{species: 'Snorlax', ability: 'Thick Fat', moves: ['splash', 'nightshade']},
		]]);
		const dex = battle.dex;
		const banette = dex.species.get('Banette');
		const megaZ = dex.species.get('Banette-Mega-Z');
		assert.deepEqual(banette.otherFormes, ['Banette-Mega', 'Banette-Mega-Z']);
		assert.deepEqual(megaZ.types, ['Ghost', 'Steel']);
		assert.deepEqual(megaZ.baseStats, {hp: 84, atk: 105, def: 110, spa: 90, spd: 100, spe: 151});
		assert.equal(megaZ.bst, 640);
		assert.deepEqual(megaZ.abilities, {0: 'Cursed Armament'});
		assert.equal(megaZ.requiredItem, 'Banettite');
		const cursedArmament = dex.abilities.get('Cursed Armament');
		assert.equal(cursedArmament.name, 'Cursed Armament');
		assert(cursedArmament.onSourceModifyDamage, 'Cursed Armament should include Filter');
		const banetteMoves = dex.species.getLearnsetData('banette').learnset;
		for (const move of ['flashcannon', 'magnetbomb', 'mirrorshot', 'bittermalice', 'ancientpower', 'eeriespell']) {
			assert(banetteMoves[move]?.length, `Banette should learn ${move}`);
		}
		battle.makeChoices('team 1', 'team 1');
		const activeBanette = battle.p1.active[0];
		const foe = battle.p2.active[0];
		assert.equal(activeBanette.canMegaEvo, 'Banette-Mega');
		assert.equal(activeBanette.canMegaEvoX, 'Banette-Mega-Z');
		battle.makeChoices('move splash megax', 'move splash');
		assert.species(activeBanette, 'Banette-Mega-Z');
		assert.equal(activeBanette.ability, 'cursedarmament');
		assert(activeBanette.hasAbility('filter'), 'Cursed Armament should expose Filter');
		const curseMove = dex.getActiveMove('curse');
		battle.singleEvent('ModifyMove', cursedArmament, activeBanette.abilityState, curseMove, activeBanette);
		assert.equal(curseMove.category, 'Physical', 'Banette-Mega-Z should use its higher Attack for Curse');
		assert.equal(curseMove.overrideOffensiveStat, 'atk');
		const specialCurseMove = dex.getActiveMove('curse');
		const specialAttacker = {getStat(stat) { return stat === 'spa' ? 101 : 100; }};
		battle.singleEvent('ModifyMove', cursedArmament, {}, specialCurseMove, specialAttacker);
		assert.equal(specialCurseMove.category, 'Special', 'Cursed Armament should use Special Attack when it is higher');
		assert.equal(specialCurseMove.overrideOffensiveStat, 'spa');
		battle.makeChoices('move curse', 'move splash');
		assert(foe.volatiles.curse);
		battle.makeChoices('move splash', 'move nightshade');
		battle.makeChoices('move splash', 'move nightshade');
		assert.equal(battle.field.terrain, 'hauntedterrain', 'half HP should create Haunted Field');
		battle.field.clearTerrain();
		battle.makeChoices('move splash', 'move nightshade');
		battle.makeChoices('move splash', 'move nightshade');
		assert.equal(activeBanette.hp, 0, 'fourth Night Shade should faint Banette');
		assert.equal(battle.field.terrain, 'hauntedterrain', 'fainting should create Haunted Field');
	});

	it('should remove the stray Aura Wheel Plus entry from Morpeko', function () {
		const learnset = Dex.species.getLearnsetData('morpeko').learnset;
		assert(!learnset.aurawheelplus, 'Morpeko should not learn Aura Wheel Plus');
	});
});
