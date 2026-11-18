'use strict';
const assert = require('node:assert/strict');
const common = require('../../common');
const { Dex, TeamValidator } = require('../../../dist/sim');
const fixture = require('./current-roster-approved.json');

describe('November roster changes', () => {
	let battle;
	afterEach(() => battle?.destroy());
	function mon(species, ability, item = '', moves = ['splash']) {
		return { species, ability, item, moves };
	}
	function start(lead) {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [
			[lead, mon('Mew', 'No Ability')], [mon('Mew', 'No Ability')],
		]);
		battle.makeChoices('team 12', 'team 1');
		return battle.p1.active[0];
	}
	it('loads every reviewed lineup and resolves every selectable ability', () => {
		for (const [id, slots] of Object.entries(fixture.exactSlots)) {
			assert.deepEqual(Dex.species.get(id).abilities, slots, id);
			for (const ability of Object.values(slots)) assert(Dex.abilities.get(ability).exists, ability);
		}
	});
	it('accepts the replacement Froslass abilities and rejects the retired choices', () => {
		const validator = TeamValidator.get('gen9nofieldsinglesgame@@@Obtainable Abilities');
		for (const ability of ['Ice Body', 'Insomnia', 'Ice Mirror', 'Wailing Snow']) {
			const errors = validator.validateTeam([mon('Froslass', ability, '', ['Shadow Ball'])]);
			if (['Ice Body', 'Insomnia'].includes(ability)) assert.equal(errors, null, String(errors));
			else assert(errors?.some(msg => msg.includes(ability)), JSON.stringify(errors));
		}
	});
	for (const [species, ability, item, weather] of [
		['Kyogre', 'Trench Current', 'Blue Orb', 'primordialsea'],
		['Groudon', 'Mantle Fracture', 'Red Orb', 'desolateland'],
	]) it(species + ' gains its primal weather on reversion and ends it on switching', () => {
		const p = start(mon(species, ability, item));
		assert(p.species.isPrimal);
		assert.equal(battle.field.weather, weather);
		assert.equal(battle.field.weatherState.source, p);
		battle.makeChoices('switch 2', 'move splash');
		assert.equal(battle.field.weather, '');
		battle.makeChoices('switch 2', 'move splash');
		assert.equal(battle.field.weather, weather);
		p.faint();
		battle.faintMessages();
		assert.equal(battle.field.weather, '');
	});
	it('Rayquaza suppresses weather with its passive and starts strong winds on Mega Evolution', () => {
		const p = start(mon('Rayquaza', 'Jetstream', '', ['Dragon Ascent', 'Splash']));
		battle.field.setWeather('raindance', battle.p2.active[0]);
		assert.equal(battle.field.effectiveWeather(), '');
		battle.makeChoices('move splash mega', 'move splash');
		assert.equal(p.species.id, 'rayquazamega');
		assert.equal(battle.field.effectiveWeather(), 'deltastream');
		battle.makeChoices('switch 2', 'move splash');
		assert.equal(battle.field.weather, '');
	});
	it('Plasma Awakening absorbs Fire and charges Fire Boost without Fire Mane', () => {
		const p = start(mon('Typhlosion', 'Plasma Awakening'));
		const foe = battle.p2.active[0];
		const hp = p.hp;
		assert(p.hasAbility('flashfire'));
		assert(!p.hasAbility('firemane'));
		battle.actions.useMove('flamethrower', foe, { target: p });
		assert.equal(p.hp, hp);
		assert(p.volatiles.flashfire);
	});
	it('Liepard keeps Prankster with Alley Ambush and only powers Dark attacks against a statused foe', () => {
		const p = start(mon('Liepard', 'Alley Ambush'));
		const q = battle.p2.active[0];
		assert.equal(battle.runEvent('ModifyPriority', p, q, Dex.getActiveMove('taunt'), 0), 1);
		const power = move => battle.runEvent('BasePower', p, q, Dex.getActiveMove(move), 100);
		assert.equal(power('crunch'), 100);
		q.setStatus('par', p);
		assert.equal(power('crunch'), 130);
		assert.equal(power('tackle'), 100);
	});
	it('Basking Scales heals Druddigon in effective sun and preserves its Rejuv event slot', () => {
		const p = start(mon('Druddigon', 'Basking Scales'));
		p.hp = 1;
		battle.field.setWeather('sunnyday', p);
		battle.singleEvent('Residual', p.getAbility(), p.abilityState, p);
		assert.equal(p.hp, 1 + Math.floor(p.baseMaxhp / 8));
		const hp = p.hp;
		battle.field.setWeather('raindance', p);
		battle.singleEvent('Residual', p.getAbility(), p.abilityState, p);
		assert.equal(p.hp, hp);
		assert.deepEqual(p.getPassives(), ['roughskin']);
		assert.equal(Dex.species.get('Druddigon-Rejuv').requiredAbility, Dex.species.get('Druddigon').abilities.S);
	});
	it('Normal Deoxys changes its stats and announces all four shapes through ordinary move choices', () => {
		const p = start(mon('Deoxys', 'Alien Genome', '', ['Extreme Speed', 'Recover', 'Psycho Boost', 'Psychic']));
		const foe = battle.p2.active[0];
		foe.hp = foe.maxhp = foe.baseMaxhp = 10000;
		const maxHP = p.maxhp;
		for (const [id, form] of [['extremespeed', 'Deoxys-Speed'], ['recover', 'Deoxys-Defense'],
			['psychoboost', 'Deoxys-Attack'], ['psychic', 'Deoxys']]) {
			const logStart = battle.log.length;
			battle.makeChoices('move ' + id, 'move splash');
			assert.equal(p.species.name, form);
			assert.equal(p.storedStats.def, battle.spreadModify(Dex.species.get(form).baseStats, p.set).def);
			assert.equal(p.maxhp, maxHP);
			assert(battle.log.slice(logStart).some(line => line.includes('|-formechange|') && line.includes('|' + form + '|')));
		}
		battle.makeChoices('move extremespeed', 'move splash');
		battle.makeChoices('switch 2', 'move splash');
		battle.makeChoices('switch 2', 'move splash');
		assert.equal(p.species.name, 'Deoxys');
		assert.equal(p.ability, 'aliengenome');
	});
	it('Normal Deoxys can stay balanced with an ordinary ability; Agility selects Speed with Alien Genome', () => {
		const p = start(mon('Deoxys', 'Clear Body', '', ['Agility', 'Recover']));
		battle.makeChoices('move agility', 'move splash');
		assert.equal(p.species.name, 'Deoxys');
		p.setAbility('Alien Genome');
		battle.makeChoices('move agility', 'move splash');
		assert.equal(p.species.name, 'Deoxys-Speed');
		p.addVolatile('gastroacid');
		assert.equal(p.species.name, 'Deoxys');
		battle.makeChoices('move recover', 'move splash');
		assert.equal(p.species.name, 'Deoxys');
	});
	for (const forme of ['Attack', 'Defense', 'Speed']) {
		it('starting in ' + forme + ' keeps its specialized Psychic effect and visual form', () => {
			const p = start(mon('Deoxys-' + forme, 'Alien Genome', '', ['Psychic']));
			const q = battle.p2.active[0];
			p.hp = 1;
			const move = Dex.getActiveMove('psychic');
			battle.runEvent('ModifyMove', p, q, move, move);
			assert.equal(!!move.ignorePositiveDefensive, forme === 'Attack');
			assert.equal(move.accuracy === true, forme === 'Speed');
			battle.makeChoices('move psychic', 'move splash');
			assert.equal(p.species.name, 'Deoxys-' + forme);
			assert.equal(p.hp, forme === 'Defense' ? 1 + Math.floor(p.baseMaxhp / 8) : 1);
		});
	}
});
