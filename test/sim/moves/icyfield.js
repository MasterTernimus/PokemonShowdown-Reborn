'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;

describe('Icy Field interactions', () => {
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});

	function createBattle(teams) {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, teams || [[
			{ species: 'Mew', moves: ['splash'] },
		], [
			{ species: 'Mew', moves: ['splash'] },
		]]);
		battle.makeChoices('team 1', 'team 1');
		return [battle.p1.active[0], battle.p2.active[0]];
	}

	function setIcyField(source) {
		battle.field.changeTerrain('icyterrain', source);
		assert(battle.field.isTerrain('icyterrain'));
	}

	function applyTerrainMove(moveID, source, target) {
		const terrain = battle.dex.conditions.get('icyterrain');
		const move = battle.dex.getActiveMove(moveID);
		move.onModifyMove?.call(battle, move, source, target);
		battle.singleEvent('ModifyMove', terrain, battle.field.terrainState, move, source, target);
		terrain.onAfterMove?.call(battle, source, target, move);
		return move;
	}

	function applySnowscape(source, target) {
		const move = battle.dex.getActiveMove('snowscape');
		assert(battle.singleEvent('TryMove', move, null, source, target, move));
		assert.equal(move.terrain, 'icyterrain');
		if (!battle.field.isTerrain('icyterrain')) {
			assert(battle.field.setTerrain(move.terrain, source, move));
		}
		return move;
	}

	it('announces the Icy Field start text and preserves its internal id', () => {
		const [source] = createBattle();
		setIcyField(source);
		assert(battle.log.includes('|-fieldstart|Icy Field'));
		assert(battle.log.includes('|-message|The field is covered in ice.'));
	});

	it('remembers Water Surface under Icy Field and reveals it with a quake', () => {
		const [source, target] = createBattle();
		battle.field.changeTerrain('watersurfaceterrain', source);
		setIcyField(source);
		assert.equal(battle.field.terrainState.underlyingTerrain, 'watersurfaceterrain');
		applyTerrainMove('earthquake', source, target);
		assert(battle.field.isTerrain('watersurfaceterrain'));
		assert(battle.log.includes('|-message|The quake broke up the ice and revealed the water beneath!'));
	});

	it('keeps Icy Field and creates Spikes when no water is underneath', () => {
		const [source, target] = createBattle();
		setIcyField(source);
		applyTerrainMove('earthquake', source, target);
		assert(battle.field.isTerrain('icyterrain'));
		assert.equal(battle.p1.sideConditions.spikes.layers, 1);
		assert.equal(battle.p2.sideConditions.spikes.layers, 1);
	});

	it('melts back to Water Surface after two hot-water moves', () => {
		const [source, target] = createBattle();
		setIcyField(source);
		applyTerrainMove('scald', source, target);
		assert(battle.field.isTerrain('icyterrain'));
		applyTerrainMove('scald', source, target);
		assert(battle.field.isTerrain('watersurfaceterrain'));
		assert(battle.log.includes('|-message|The hot water melted the ice!'));
	});

	it('restores Murkwater when hot water melts ice formed over it', () => {
		const [source, target] = createBattle();
		battle.field.changeTerrain('murkwatersurfaceterrain', source);
		setIcyField(source);
		applyTerrainMove('scald', source, target);
		applyTerrainMove('scald', source, target);
		assert(battle.field.isTerrain('murkwatersurfaceterrain'));
	});

	it('turns Snowscape into Icy Field over the requested terrains', () => {
		for (const underlyingTerrain of [
			'watersurfaceterrain', 'murkwatersurfaceterrain', 'caveterrain', 'volcanicterrain',
			'crystalcavernterrain', 'darkcrystalcavernterrain', 'mistyterrain',
		]) {
			const [source, target] = createBattle();
			battle.field.changeTerrain(underlyingTerrain, source);
			applySnowscape(source, target);
			assert(battle.field.isTerrain('icyterrain'));
			assert.equal(battle.field.terrainStack[1]?.id, underlyingTerrain);
			battle.destroy();
			battle = null;
		}
	});

	it('uses the Icy Field override through the full Snowscape move pipeline', () => {
		const [source] = createBattle([
			[{ species: 'Mew', moves: ['snowscape'] }],
			[{ species: 'Mew', moves: ['splash'] }],
		]);
		battle.field.changeTerrain('volcanicterrain', source);
		battle.makeChoices('move snowscape', 'move splash');
		assert(battle.field.isTerrain('icyterrain'));
		assert.equal(battle.field.terrainStack[1]?.id, 'volcanicterrain');
	});

	it('restores Misty Terrain and carries Icy Field Spikes through a break', () => {
		const [source, target] = createBattle();
		battle.field.changeTerrain('mistyterrain', source);
		applySnowscape(source, target);
		applyTerrainMove('earthquake', source, target);
		assert(battle.field.isTerrain('mistyterrain'));
		assert.equal(battle.p1.sideConditions.spikes.layers, 1);
		assert.equal(battle.p2.sideConditions.spikes.layers, 1);
		assert(battle.log.includes('|-message|The quake broke up the ice and revealed Misty Terrain!'));
	});

	it('restores the field beneath Icy Field after a melt', () => {
		for (const underlyingTerrain of [
			'mistyterrain', 'caveterrain', 'volcanicterrain', 'crystalcavernterrain', 'darkcrystalcavernterrain',
		]) {
			const [source, target] = createBattle();
			battle.field.changeTerrain(underlyingTerrain, source);
			applySnowscape(source, target);
			applyTerrainMove('heatwave', source, target);
			assert(battle.field.isTerrain(underlyingTerrain));
			if (underlyingTerrain === 'mistyterrain') {
				assert.equal(battle.p1.sideConditions.spikes.layers, 1);
				assert.equal(battle.p2.sideConditions.spikes.layers, 1);
			}
			battle.destroy();
			battle = null;
		}
	});

	it('melts to Cave with fire moves when no water is underneath', () => {
		const [source, target] = createBattle();
		setIcyField(source);
		applyTerrainMove('burningjealousy', source, target);
		assert(battle.field.isTerrain('caveterrain'));
		assert(battle.log.includes('|-message|The ice melted away!'));
	});

	it('applies Icy Field speed reduction and Slush Rush correctly', () => {
		const [source, slushRush] = createBattle([
			[{ species: 'Mew', ability: 'pressure', moves: ['splash'] }],
			[{ species: 'Mew', ability: 'slushrush', moves: ['splash'] }],
		]);
		const baseSpeed = source.getStat('spe');
		setIcyField(source);
		assert.equal(source.getStat('spe'), battle.modify(baseSpeed, 0.75));
		assert.equal(slushRush.getStat('spe'), battle.modify(baseSpeed, 2));
	});

	it('prevents weather moves from changing the weather underwater', () => {
		const [source, target] = createBattle();
		battle.field.changeTerrain('underwaterterrain', source);
		const move = battle.dex.getActiveMove('rain dance');
		const result = battle.runEvent('TryMove', source, target, move);
		assert.equal(result, false);
		assert.equal(battle.field.weather, '');
		assert(battle.log.includes("|-message|You're too deep to notice the weather!"));
	});

	it('applies the cold power changes and Chilling Water message', () => {
		const [source, target] = createBattle();
		setIcyField(source);
		const move = battle.dex.getActiveMove('chillingwater');
		assert.equal(
			battle.runEvent('BasePower', source, target, move, move.basePower, true),
			battle.modify(move.basePower, 2)
		);
		assert(battle.log.includes('|-message|The freezing air boosted the attack!'));
	});

	it('gives Bitter Malice its field boost and additional frostbite chance', () => {
		const [source, target] = createBattle();
		setIcyField(source);
		const move = applyTerrainMove('bittermalice', source, target);
		assert.equal(
			battle.runEvent('BasePower', source, target, move, move.basePower, true),
			battle.modify(move.basePower, 1.5)
		);
		assert(battle.log.includes('|-message|The cold strengthened the attack!'));
		assert(move.secondaries.some(secondary => secondary.status === 'frz' && secondary.chance >= 10));
	});

	it('converts Secret Power to Ice Shard and keeps the frostbite field effect', () => {
		const [source, target] = createBattle();
		setIcyField(source);
		const move = applyTerrainMove('secretpower', source, target);
		assert.equal(move.name, 'Ice Shard');
		assert.equal(move.type, 'Ice');
		assert.equal(move.basePower, 40);
		assert.equal(move.priority, 1);
		assert.deepEqual(move.secondaries, [{ chance: 30, status: 'frz' }]);
	});

	it('adds Ice to Rock moves without discarding existing move types', () => {
		const [source, target] = createBattle();
		setIcyField(source);
		const move = applyTerrainMove('stoneedge', source, target);
		assert.deepEqual(move.types, ['Rock', 'Ice']);
	});

	it('applies icy Spikes damage to grounded non-Magic Guard entrants', () => {
		const [source, magicGuard] = createBattle([
			[{ species: 'Mew', ability: 'pressure', moves: ['splash'] }],
			[{ species: 'Clefable', ability: 'magicguard', moves: ['splash'] }],
		]);
		setIcyField(source);
		const terrain = battle.dex.conditions.get('icyterrain');
		const sourceHP = source.hp;
		const magicGuardHP = magicGuard.hp;
		terrain.onSwitchIn?.call(battle, source);
		terrain.onSwitchIn?.call(battle, magicGuard);
		assert(source.hp < sourceHP);
		assert.equal(magicGuard.hp, magicGuardHP);
		assert(battle.log.includes('|-message|Mew was hurt by icy Spikes!'));
	});

	it('announces momentum gained from an eligible sliding move', () => {
		const [source, target] = createBattle();
		setIcyField(source);
		applyTerrainMove('defensecurl', source, target);
		assert(battle.log.includes('|-message|Mew gained momentum on the ice!'));
	});

	it('uses the hot-tea heal and restores the stored field with Matcha Gotcha', () => {
		const [source, target] = createBattle();
		battle.field.changeTerrain('watersurfaceterrain', source);
		setIcyField(source);
		battle.damage(source.maxhp / 2, source, source);
		const hpBefore = source.hp;
		applyTerrainMove('matchagotcha', source, target);
		assert(source.hp > hpBefore);
		assert(battle.field.isTerrain('watersurfaceterrain'));
		assert(battle.log.includes('|-message|The hot tea melted the ice!'));
	});

	it('breaks Icy Field from underneath with Dive after its charge turn', () => {
		for (const underlyingTerrain of ['watersurfaceterrain', 'murkwatersurfaceterrain']) {
			const [source] = createBattle([
				[{ species: 'Mew', moves: ['dive'] }],
				[{ species: 'Mew', moves: ['splash'] }],
			]);
			battle.field.changeTerrain(underlyingTerrain, source);
			setIcyField(source);

			battle.makeChoices('move dive', 'move splash');
			assert(battle.field.isTerrain('icyterrain'));
			assert(battle.log.includes('|-prepare|p1a: Mew|Dive'));

			battle.makeChoices('move dive', 'move splash');
			assert(battle.field.isTerrain(underlyingTerrain));
			assert(battle.log.includes('|-message|Mew made a hole in the ice!'));
			assert(battle.log.includes('|-message|The ice was broken from underneath!'));
			battle.destroy();
			battle = null;
		}
	});
});
