'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;

describe('Composite ability cleanup', function () {
	afterEach(function () {
		battle?.destroy();
	});

	it('should remove Invigorate hooks from Ancient Bloom', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'});
		const ability = battle.dex.abilities.get('ancientbloom');
		assert.equal(ability.onAnyTryHeal, undefined);
	});

	it('should add Pollen Bloom hooks to Ancient Bloom', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'});
		const ability = battle.dex.abilities.get('ancientbloom');
		assert(ability.onAnyModifyBoost);
		assert(ability.onSourceModifyAtk);
		assert(ability.onSourceModifySpA);
		assert(ability.onResidual);
		assert(ability.onImmunity);
	});

	it('should give Fortress Shell Water Barrage while retaining its hidden Friend Guard hook', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'});
		const ability = battle.dex.abilities.get('fortressshell');
		assert(ability.onModifyMove);
		assert(ability.onResidual);
		assert(ability.onAnyModifyDamage);
		assert(ability.onSourceModifyDamage);
	});

	it('should give Burning Crown Unbound Blaze while retaining its hidden Filter hook', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'});
		const ability = battle.dex.abilities.get('burningcrown');
		assert(ability.onUpdate);
		assert(ability.onModifyType);
		assert(ability.onModifySTAB);
		assert(ability.onAfterMove);
		assert(ability.onTryHit);
		assert(ability.onSourceModifyAtk);
		assert(ability.onSourceModifySpA);
		assert(ability.onSourceModifyDamage);
	});

	it('should replace Lunar Dread marks with Dishearten, Insomnia and Pressure', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'});
		const ability = battle.dex.abilities.get('lunardread');
		for (const hook of ['onStart', 'onSetStatus', 'onTryAddVolatile', 'onDeductPP']) assert(ability[hook]);
		for (const hook of ['onDamage', 'onAnyModifyBoost', 'onSourceDamagingHit', 'onModifyCritRatio', 'condition']) {
			assert.equal(ability[hook], undefined);
		}
	});

	it('should give Territorial Unnerve, Guard Dog and immediate Stamina hooks', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'});
		const ability = battle.dex.abilities.get('territorial');
		assert(ability.onStart);
		assert(ability.onDamagingHit);
		assert.equal(ability.onAnyAfterMove, undefined);
		assert.equal(ability.onDamagingHit, battle.dex.abilities.get('stamina').onDamagingHit);
		assert(ability.onFoeTryEatItem);
		assert(ability.onDragOut);
		assert(ability.onTryBoost);
		assert.equal(ability.onModifyMove, undefined);
		assert.equal(ability.onSourceDamagingHit, undefined);
	});

	it('should give Still Waters Cloud Nine, Magic Guard, and Unaware hooks', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'});
		const ability = battle.dex.abilities.get('stillwaters');
		assert(ability.onSwitchIn);
		assert(ability.onStart);
		assert(ability.onResidual);
		assert(ability.onEnd);
		assert(ability.onDamage);
		assert(ability.onAnyModifyBoost);
		assert.equal(ability.suppressWeather, true);
	});

	it('should not give Water Barrage Water Veil or Aqua Ring hooks', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Blastoise', ability: 'waterbarrage', moves: ['splash']},
		], [
			{species: 'Mew', ability: 'noguard', moves: ['willowisp']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const blastoise = battle.p1.active[0];
		assert.false(blastoise.volatiles['aquaring']);
		battle.makeChoices('move splash', 'move willowisp');
		assert.equal(blastoise.status, 'brn');
	});

	it('should make Wrath Shield only Bulletproof, Filter, and Self Repair', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'});
		const ability = battle.dex.abilities.get('wrathshield');
		assert.equal(ability.onDamagingHit, undefined);
		assert.equal(ability.onAfterEachBoost, undefined);
		assert.equal(ability.onCriticalHit, undefined);
		assert(ability.onTryHit);
		assert(ability.onSourceModifyDamage);
		assert(ability.onResidual);
		assert(ability.onSwitchOut);
	});

	it('should give Bulletproof and Mirror Armor their armor damage hooks', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'});
		assert(battle.dex.abilities.get('bulletproof').onSourceModifyDamage);
		assert(battle.dex.abilities.get('mirrorarmor').onSourceModifyDamage);
	});

	it('should keep Haxorus Battle Armor as a passive alongside Raging Storm', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Haxorus', ability: 'ragingstorm', moves: ['splash']},
		], [
			{species: 'Mew', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const haxorus = battle.p1.active[0];
		assert.false(haxorus.hasAbility('battlearmor'));
		assert(haxorus.hasAbilityOrPassive('battlearmor'));
		assert(haxorus.hasAbility('moldbreaker'));
	});

	it('should set Eclipse Vision from the first move slot and switch types later', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Gothitelle', ability: 'eclipsevision', moves: ['darkpulse', 'calmmind']},
		], [
			{species: 'Mew', ability: 'noguard', moves: ['counter']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const gothitelle = battle.p1.active[0];
		assert.deepEqual(gothitelle.getTypes(), ['Dark']);
		battle.directDamage(80, gothitelle);
		const hpBefore = gothitelle.hp;
		battle.makeChoices('move calmmind', 'move counter');
		assert.deepEqual(gothitelle.getTypes(), ['Psychic']);
		assert.equal(gothitelle.hp - hpBefore, Math.floor(gothitelle.baseMaxhp / 8));
	});

	it('should set Adaptive Cell from the first move slot and switch by category later', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Reuniclus', ability: 'adaptivecell', moves: ['drainpunch', 'psychic']},
		], [
			{species: 'Mew', ability: 'noguard', moves: ['counter']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const reuniclus = battle.p1.active[0];
		assert.deepEqual(reuniclus.getTypes(), ['Fighting']);
		battle.makeChoices('move psychic', 'move counter');
		assert.deepEqual(reuniclus.getTypes(), ['Psychic']);
	});

	it('should remove Pressure from Relic Armor and expose Abyss Sniper under its new ID', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'});
		assert.equal(battle.dex.abilities.get('relicarmor').onDeductPP, undefined);
		assert.equal(battle.dex.abilities.get('abysssniper').name, 'Abyss Sniper');
	});

	it('should give Defeatist every Relic Armor hook', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Archeops', ability: 'defeatist', moves: ['splash']},
		], [
			{species: 'Mew', ability: 'noability', moves: ['growl']},
		]]);
		const defeatist = battle.dex.abilities.get('defeatist');
		for (const hook of ['onStart', 'onCriticalHit', 'onEffectiveness', 'onImmunity', 'onType', 'onResidual', 'onAfterBoost', 'onSourceModifyDamage']) {
			assert(defeatist[hook], `Defeatist is missing ${hook}`);
		}
		battle.makeChoices('team 1', 'team 1');
		const archeops = battle.p1.active[0];
		battle.directDamage(80, archeops);
		const hpBefore = archeops.hp;
		battle.makeChoices('move splash', 'move growl');
		assert.equal(archeops.hp - hpBefore, Math.floor(archeops.baseMaxhp / 16));
		assert.statStage(archeops, 'def', 1);
		assert.statStage(archeops, 'spd', 1);
	});

	it('should remove Self Sufficient healing from Gooey and Steam Engine', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Goodra', ability: 'gooey', moves: ['splash']},
		], [
			{species: 'Coalossal', ability: 'steamengine', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const goodra = battle.p1.active[0];
		const coalossal = battle.p2.active[0];
		battle.directDamage(80, goodra);
		battle.directDamage(80, coalossal);
		const goodraHP = goodra.hp;
		const coalossalHP = coalossal.hp;
		battle.makeChoices('move splash', 'move splash');
		assert.equal(goodra.hp, goodraHP);
		assert.equal(coalossal.hp, coalossalHP);
	});

	it('should make Gooey lower only Speed after a damaging hit', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Goodra', ability: 'gooey', moves: ['splash']},
		], [
			{species: 'Mew', ability: 'noability', moves: ['tackle']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move splash', 'move tackle');
		assert.deepEqual(battle.p2.active[0].boosts, {
			atk: 0, def: 0, spa: 0, spd: 0, spe: -2, accuracy: 0, evasion: 0,
		});
	});

	it('should expose every requested Hisuian Path component', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Wyrdeer', ability: 'hisuianpath', moves: ['splash']},
		], [
			{species: 'Mew', ability: 'noguard', moves: ['leafage']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const wyrdeer = battle.p1.active[0];
		const hp = wyrdeer.hp;
		battle.makeChoices('move splash', 'move leafage');
		assert.equal(wyrdeer.hp, hp);
		assert.statStage(wyrdeer, 'atk', 1);
		assert(battle.dex.abilities.get('hisuianpath').onTryAddVolatile);
		assert(battle.dex.abilities.get('hisuianpath').onSourceModifyDamage);
	});

	it('should give Void Tyrant Hydra Bond, Berserk, and its Draco Meteor recovery', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'});
		const ability = battle.dex.abilities.get('voidtyrant');
		assert(ability.onModifyMove);
		assert(ability.onAfterMoveSecondary);
		assert.equal(ability.onResidual, undefined);
		assert.equal(ability.onImmunity, undefined);
		assert(ability.onAfterMove);
	});

	it('should give Toxic Evolution only its requested visible components and hidden reduction', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'});
		const ability = battle.dex.abilities.get('toxicevolution');
		assert.equal(ability.name, 'Toxic Evolution');
		assert(ability.onNegateImmunity);
		assert(ability.onModifyMove);
		assert(ability.onModifySecondaries);
		assert(ability.onSourceModifyDamage);
		assert.equal(ability.onAnyTryHeal, undefined);
		assert.equal(ability.onResidual, undefined);
		assert.equal(ability.onAnyModifyDamage, undefined);
		assert.equal(ability.onImmunity, undefined);
		assert.deepEqual(battle.dex.species.get('Weezing').passives, ['levitate']);
	});

	it('should give base Empoleon and its Mega their distinct abilities', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'});
		const base = {
			0: 'Competitive',
			1: 'Exalt',
			H: 'Royal Decree',
		};
		assert.deepEqual(battle.dex.species.get('Empoleon').abilities, base);
		assert.deepEqual(battle.dex.species.get('Empoleon-Mega').abilities, {0: "Emperor's Resolve"});
	});

	it('should give Empress and Imperial Princess native Fighting STAB and suppress only Fairy weakness components', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'});
		const source = battle.dex.species.get('Tsareena');
		const target = battle.dex.species.get('Mew');
		const fightingMove = battle.dex.moves.get('focusblast');
		const poisonMove = battle.dex.moves.get('sludgebomb');

		for (const id of ['empress', 'imperialprincess']) {
			const ability = battle.dex.abilities.get(id);
			assert.equal(ability.onModifySTAB.call(battle, 1, source, target, fightingMove), 1.5);
			assert.equal(ability.onModifySTAB.call(battle, 1.5, source, target, fightingMove), undefined);
			assert.equal(ability.onEffectiveness.call(battle, 1, target, 'Fairy', poisonMove), 0);
			assert.equal(ability.onEffectiveness.call(battle, 1, target, 'Grass', poisonMove), undefined);
		}
	});

	it('should replace Sandaconda\'s Sand Veil with Shed Skin', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'});
		assert.deepEqual(battle.dex.species.get('Sandaconda').abilities, {
			0: 'Buried Coil',
			1: 'Stamina',
			H: 'Shed Skin',
		});
	});

	it('should pair Apex Predator with innate Relic Armor', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Aerodactyl-Mega', ability: 'apexpredator', moves: ['splash']},
		], [
			{species: 'Mew', ability: 'noguard', moves: ['gust']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const aerodactyl = battle.p1.active[0];
		const mew = battle.p2.active[0];
		assert.statStage(mew, 'def', 0);
		assert.statStage(mew, 'spd', 0);
		const hp = aerodactyl.hp;
		battle.makeChoices('move splash', 'move gust');
		assert.equal(aerodactyl.hp, hp);
		assert.statStage(aerodactyl, 'atk', 1);
		const ability = battle.dex.abilities.get('apexpredator');
		assert.equal(ability.onModifyCritRatio, undefined);
		assert(ability.onModifyType);
		assert.equal(ability.onCriticalHit, undefined);
		assert(aerodactyl.hasAbilityOrPassive('relicarmor'));
	});

	it('should let Hisuian Oath Poison attacks damage and poison Steel targets', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Sneasler', ability: 'hisuianoath', moves: ['direclaw', 'toxic']},
		], [
			{species: 'Registeel', ability: 'clearbody', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const registeel = battle.p2.active[0];
		const hp = registeel.hp;
		battle.makeChoices('move direclaw', 'move splash');
		assert(registeel.hp < hp, 'Dire Claw should damage a Steel target');
		battle.makeChoices('move toxic', 'move splash');
		assert(['psn', 'tox'].includes(registeel.status));
	});

	it('should make Download boost only the offense targeting the foe\'s weaker defense', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Porygon2', ability: 'download', moves: ['tackle']},
		], [
			{species: 'Mew', ability: 'noguard', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const porygon = battle.p1.active[0];
		assert.statStage(porygon, 'atk', 0);
		assert.statStage(porygon, 'spa', 1);
		assert.equal(porygon.abilityState.downloadFirstHit, true);
		battle.makeChoices('move tackle', 'move splash');
		assert.equal(porygon.abilityState.downloadFirstHit, false);
		assert(battle.log.some(line => line.includes('|-crit|')), 'Download should make the first damaging move crit');
	});

	it('should make Download and Defragment mirror each other in Doubles', function () {
		battle = common.createBattle({formatid: 'gen9nofielddoublesbattle'}, [[
			{species: 'Porygon2', ability: 'download', moves: ['splash']},
			{species: 'Porygon-Z', ability: 'defragment', moves: ['zapcannon']},
		], [
			{species: 'Blissey', ability: 'naturalcure', moves: ['splash']},
			{species: 'Blissey', ability: 'naturalcure', moves: ['splash']},
		]]);
		battle.makeChoices('team 12', 'team 12');
		const download = battle.p1.active[0];
		const defragment = battle.p1.active[1];
		assert.statStage(download, 'atk', 1);
		assert.statStage(download, 'spa', 0);
		assert.statStage(defragment, 'def', 0);
		assert.statStage(defragment, 'spd', 1);

		const accuracy = battle.runEvent(
			'Accuracy', battle.p2.active[0], defragment, battle.dex.moves.get('zapcannon'), 50
		);
		assert.equal(accuracy, true, 'Defragment should make its moves unable to miss');
	});

	it('should keep Phalanx Form untrapped and grant Steel STAB', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Falinks-Mega', ability: 'phalanxform', moves: ['noretreat', 'ironhead']},
			{species: 'Mew', ability: 'noguard', moves: ['splash']},
		], [
			{species: 'Gothitelle', ability: 'shadowtag', moves: ['splash']},
		]]);
		battle.makeChoices('team 1, 2', 'team 1');
		const falinks = battle.p1.active[0];
		battle.makeChoices('move noretreat', 'move splash');
		const move = battle.dex.getActiveMove('ironhead');
		battle.singleEvent('ModifyMove', falinks.getAbility(), falinks.abilityState, move, falinks);
		assert.equal(move.forceSTAB, true);
		battle.makeChoices('switch 2', 'move splash');
		assert.species(battle.p1.active[0], 'Mew');
	});

	it('should remove the requested legacy composite hooks and expose Soul Strike', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'});
		assert(battle.dex.abilities.get('celestialheart').onModifyMove);
		assert.equal(battle.dex.abilities.get('draconicforce').onModifyAtk, undefined);
		assert.equal(typeof battle.dex.abilities.get('dreadmaw').onStart, 'function'); // Frisk
		assert.equal(battle.dex.abilities.get('freezerburn').onWeather, undefined);
		assert.equal(battle.dex.abilities.get('moonlitwings').onSetStatus, undefined);
		assert.equal(battle.dex.abilities.get('doomwarning').onAfterMove, undefined);
		assert.equal(battle.dex.abilities.get('soulstrike').name, 'Soul Strike');
		assert.equal(battle.dex.species.get('Gengar-Gmax').abilities[0], 'Soul Strike');
	});

	it('should expose every updated composite through normalized component IDs', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Mew', ability: 'synchronize', moves: ['splash']},
		], [
			{species: 'Mew', ability: 'synchronize', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const pokemon = battle.p1.active[0];
		const composites = {
			alchemistsurge: ['psychicsurge', 'competitive', 'hydrabond', 'prankster'],
			apexpredator: ['dragonize', 'windrider'],
			alloycore: ['magicguard', 'selfsufficient', 'stalwart'],
			ancientbloom: ['effectspore', 'selfsufficient'],
			astralcore: ['purepower', 'naturalcure', 'illuminate'],
			bloomingsun: ['megasol', 'invigorate', 'naturalcure'],
			celestialheart: ['soulheart', 'friendguard', 'serenegrace'],
			doomwarning: ['magicbounce', 'magicguard'],
			draconicforce: ['dragonize', 'strongjaw', 'moldbreaker'],
			tidaljaw: ['strongjaw', 'swiftswim', 'filter'],
			dreadmaw: ['hugepower', 'frisk', 'invigorate'],
			freezerburn: ['slushrush', 'refrigerate'],
			furnaceengine: ['steamengine', 'flamebody', 'selfsufficient'],
			hisuianoath: ['swornduty', 'toughclaws', 'corrosion'],
			moonlitwings: ['serenegrace'],
			phalanxform: ['hydrabond', 'friendguard', 'battlearmor'],
			windchime: ['armorize', 'punkrock', 'levitate'],
			hauntedchime: ['elevate', 'windpower', 'cursedbody'],
			auramaster: ['dualwield', 'innerfocus', 'technician'],
		lunarorbit: ['magicbounce', 'serenegrace', 'triage'],
		stillwaters: ['cloudnine', 'magicguard', 'unaware'],
		relentlesshunt: ['levitate'],
			omenedge: ['sharpness', 'dualwield', 'pressure'],
			ragingcurrent: ['swiftswim', 'damp', 'dryskin', 'stamina'],
			shadowcurrent: ['protean', 'technician', 'anticipation', 'infiltrator', 'moldbreaker'],
			calderacore: ['magmaarmor', 'sheerforce', 'drought'],
			doublestrike: ['ironfist', 'technician', 'skilllink'],
			ragingoverlord: ['ragingstorm', 'supremeoverlord', 'moldbreaker', 'battlearmor'],
			riotamp: ['galvanize', 'resonanceforce', 'voltabsorb'],
			perfectstriker: ['striker', 'noguard', 'libero'],
			mossarmor: ['stamina', 'naturalcure', 'levitate'],
		stormcalling: ['drizzle', 'liquidvoice', 'dissonantecho'],
		aevianglacier: ['snowwarning', 'icebody', 'refrigerate'],
			aevianbolt: ['stormpower', 'static', 'voltabsorb'],
			heatcoil: ['speedboost', 'magmaarmor', 'flamebody'],
			sweetsanctuary: ['friendguard', 'sweetveil', 'aromaveil', 'pastelveil'],
			treasuretitan: ['filter', 'eartheater', 'heavymetal'],
			wickedsnare: ['stakeout', 'tanglinghair', 'prankster'],
			waterbubble: ['waterveil'],
		};
		for (const [ability, components] of Object.entries(composites)) {
			pokemon.setAbility(ability, pokemon, battle.dex.abilities.get('noability'), true);
			for (const component of components) {
				assert(pokemon.hasAbility(component), `${ability} should expose ${component}`);
			}
		}
		const bloomingSun = battle.dex.abilities.get('bloomingsun');
		assert(bloomingSun.onCheckShow);
		assert(bloomingSun.onResidual);
		pokemon.setAbility('ragingcurrent', pokemon, battle.dex.abilities.get('noability'), true);
		assert.false(pokemon.hasAbility('regenerator'));
		assert.equal(battle.dex.abilities.get('ragingcurrent').onSwitchOut, undefined);
		pokemon.setAbility('calderacore', pokemon, battle.dex.abilities.get('noability'), true);
		const calderaMove = battle.dex.getActiveMove('flamethrower');
		battle.singleEvent('ModifyMove', pokemon.getAbility(), pokemon.abilityState, calderaMove, pokemon);
		assert.equal(calderaMove.hasSheerForce, true);
	});

	it('should keep active slots intact while Mega starters receive the Proficient passive', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'});
		assert.deepEqual(battle.dex.species.get('Swampert-Mega').passives, ['proficient']);
		assert.deepEqual(battle.dex.species.get('Chesnaught-Mega').passives, ['proficient']);
		assert.deepEqual(battle.dex.species.get('Greninja').passives, ['torrent']);
		assert.deepEqual(battle.dex.species.get('Delphox').passives, ['blaze']);
		assert.deepEqual(battle.dex.species.get('Swampert-Mega').abilities, {
			0: 'Raging Current',
		});
		assert.deepEqual(battle.dex.species.get('Chesnaught-Mega').abilities, {
			0: 'Wrath Shield',
		});
		assert.deepEqual(battle.dex.species.get('Greninja').abilities, {
			0: 'Liquid Arsenal', 1: 'Protean', H: 'Shadow Screen', S: 'Battle Bond',
		});
		assert.deepEqual(battle.dex.species.get('Delphox').abilities, {
			0: 'Sworn Duty', 1: 'Magic Guard', H: 'Void Guile', S: 'Pyrokinesis',
		});
	});

	it('should apply the requested species ability replacements and Altaria event slot', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'});
		assert.deepEqual(battle.dex.species.get('Scizor').abilities, {
			0: 'Pincer Crush', 1: 'Technician', H: 'Decoy Pincers',
		});
		assert.deepEqual(battle.dex.species.get('Swampert').abilities, {
			0: 'Dry Skin', 1: 'Regenerator', H: 'Damp',
		});
		assert.deepEqual(battle.dex.species.get('Crawdaunt').abilities, {
			0: 'Adaptability', 1: 'Swift Swim', H: 'Cruel Shell',
		});
		assert.deepEqual(battle.dex.species.get('Altaria').abilities, {
			0: 'Aroma Veil', 1: 'Fluffy', H: 'Cloud Nine', S: 'Echo Fiend',
		});
	});

	it('should use Armorize as the canonical name while resolving legacy Ironclad data', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Durant', ability: 'Ironclad', moves: ['splash']},
		], [
			{species: 'Magikarp', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const armorize = battle.dex.abilities.get('Armorize');
		assert.equal(armorize.id, 'armorize');
		assert.equal(armorize.name, 'Armorize');
		assert.equal(battle.dex.abilities.get('Ironclad').id, 'armorize');
		assert.equal(battle.p1.active[0].getAbility().id, 'armorize');
		assert(battle.p1.active[0].hasAbility('armorize'));
	});

	it('should expose Aura Master contact protection and requested components', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Mew', ability: 'aura master', moves: ['splash']},
		], [
			{species: 'Mew', moves: ['tackle']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const auraMaster = battle.dex.abilities.get('auramaster');
		assert(auraMaster.onSourceModifyDamage);
		assert(auraMaster.onModifyMove);
		assert(auraMaster.onTryAddVolatile);
		assert(auraMaster.onBasePower);
		const target = battle.p1.active[0];
		const source = battle.p2.active[0];
		const move = battle.dex.getActiveMove('tackle');
		assert.equal(battle.runEvent('SourceModifyDamage', target, source, move, 100), 50);
	});

	it('should give Copperajah-Gmax maximum power on weight-based moves', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Copperajah-Gmax', ability: 'treasuretitan', moves: ['heavyslam']},
		], [
			{species: 'Magikarp', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const source = battle.p1.active[0];
		const target = battle.p2.active[0];
		const move = battle.dex.getActiveMove('heavyslam');
		const basePower = move.basePowerCallback.call(battle, source, target, move);
		const modifiedPower = battle.runEvent('BasePower', source, target, move, basePower, true);
		assert.equal(modifiedPower, 120);
		assert(source.hasAbility('heavymetal'));
	});
});
