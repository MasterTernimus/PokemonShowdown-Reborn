'use strict';
const assert = require('assert').strict;
const { Battle, Dex } = require('../../dist/sim');
const { validateChallengeOptions, describeChallengeOptions } = require('../../dist/sim/challenge-options');
const team = () => [{ species: 'Mew', ability: 'No Ability', moves: ['splash', 'raindance'], teraType: 'Fire' }, { species: 'Ditto', ability: 'No Ability', moves: ['transform'] }];
function create(options, formatid = 'gen9nofieldsinglesgame') {
	const format = Dex.formats.get(formatid);
	const settings = { formatid, challengeOptions: options, seed: [1, 2, 3, 4] };
	for (let i = 1; i <= format.playerCount; i++) settings['p' + i] = { name: 'Trainer ' + i, team: team() };
	const b = new Battle(settings);
	if (b.requestState === 'teampreview') b.makeChoices(...b.sides.map(() => 'team 12'));
	return b;
}
describe('Challenge-local battle options', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });
	it('preserves defaults and does not change the format', () => {
		battle = create(undefined);
		assert.equal(battle.gimmickLimit, 2); assert.equal(battle.field.weather, '');
		assert.equal(battle.format.challengeOptions, undefined);
	});
	it('rejects malformed, unsupported and cap-bypassing settings', () => {
		const format = Dex.formats.get('gen9nofieldsinglesgame');
		for (const value of [null, [], false, { gimmicks: 3 }, { gimmicks: -1 }, { gimmicks: 0.5 }, { gimmicks: '1' }, { gimmicks: NaN }, { weather: 'primordialsea' }, { weather: '__proto__' }, { weather: 2 }, { pooled: 2 }]) {
			assert.throws(() => validateChallengeOptions(value, format));
		}
		assert.throws(() => validateChallengeOptions({ weather: 'rain' }, format));
		assert.throws(() => validateChallengeOptions({ weather: 'raindance' }, { ...format, mod: 'gen8' }));
		assert(Object.isFrozen(validateChallengeOptions({ gimmicks: 1 }, format)));
	});
	it('starts ordinary temporary weather and lets it expire', () => {
		battle = create({ weather: 'raindance' });
		assert.equal(battle.field.weather, 'raindance'); assert.equal(battle.field.weatherState.duration, 5);
		for (let i = 0; i < 5; i++) battle.makeChoices('move splash', 'move splash');
		assert.equal(battle.field.weather, '');
	});
	it('initializes every supported weather through ordinary weather state', () => {
		for (const weather of ['raindance', 'sunnyday', 'sandstorm', 'hail']) {
			battle = create({ weather }); assert.equal(battle.field.weather, weather);
			assert(battle.field.weatherState.duration > 0 && battle.field.weatherState.duration <= 8);
			battle.destroy(); battle = null;
		}
	});
	it('retains mechanic bans and rejects solo Multi allowances', () => {
		battle = create({ gimmicks: 2 }, 'gen9nofieldsinglesgame@@@Terastal Clause');
		assert(!battle.p1.active[0].canTerastallize);
		const format = Dex.formats.all().find(f => f.name.includes('Multi 1v2'));
		assert.throws(() => validateChallengeOptions({ gimmicks: 1 }, format), /solo Multi/);
	});
	it('allows normal weather changes', () => {
		battle = create({ weather: 'sunnyday' });
		battle.makeChoices('move raindance', 'move splash');
		assert.equal(battle.field.weather, 'raindance');
	});
	it('rejects a gimmick at zero allowance and suppresses its controls', () => {
		battle = create({ gimmicks: 0 });
		battle.sendUpdates();
		assert.equal(battle.p1.activeRequest.active[0].canTerastallize, undefined);
		assert.equal(battle.choose('p1', 'move splash terastallize'), false);
		assert.equal(battle.useGimmick(battle.p1.active[0], 'Terastal'), false);
		assert.equal(battle.p1.gimmickCount, 0);
	});
	it('counts uses per trainer and retains them after switching, transforming and serialization', () => {
		battle = create({ gimmicks: 1 });
		battle.makeChoices('move splash terastallize', 'move splash');
		assert.equal(battle.p1.gimmickCount, 1); assert.equal(battle.p2.gimmickCount, 0);
		battle.makeChoices('switch 2', 'move splash');
		battle.makeChoices('move transform', 'move splash');
		assert.equal(battle.p1.gimmickCount, 1);
		const counters = battle.p1.getRequestData().gimmicks;
		assert.deepEqual(counters.map(c => [c.used, c.limit]), [[1, 1], [0, 1]]);
		const restored = Battle.fromJSON(battle.toJSON());
		assert.deepEqual(restored.p1.getRequestData().gimmicks, counters);
		restored.destroy();
	});
	it('restores agreed options and counters when replaying the input log', async () => {
		battle = create({ weather: 'raindance', gimmicks: 1 });
		battle.makeChoices('move splash terastallize', 'move splash');
		const { BattleStream } = require('../../dist/sim/battle-stream');
		const stream = new BattleStream();
		await stream.write(battle.inputLog.join('\n'));
		assert.equal(stream.battle.gimmickLimit, 1);
		assert.equal(stream.battle.p1.gimmickCount, 1);
		assert.equal(stream.battle.field.weather, 'raindance');
		stream.destroy();
	});
	it('allocates independent FFA and Multi counters', () => {
		for (const gameType of ['freeforall', 'multi']) {
			const format = Dex.formats.all().find(f => f.gameType === gameType && f.mod === 'gen9' && f.playerCount === 4 && !f.name.includes('1v2'));
			battle = create({ gimmicks: 1 }, format.id);
			const first = battle.p1.active[0];
			first.canTerastallize = 'Fire';
			assert.equal(battle.useGimmick(first, 'Terastal'), true);
			assert.deepEqual(battle.p2.getRequestData().gimmicks.map(c => c.used), [1, 0, 0, 0]);
			battle.destroy(); battle = null;
		}
	});
	it('describes agreed settings without promising an unlocked mechanic', () => {
		assert.match(describeChallengeOptions({ gimmicks: 1, weather: 'hail' }), /per trainer: 1 shared uses/);
		assert.match(describeChallengeOptions({ weather: 'hail' }), /normal duration/);
		assert.equal(describeChallengeOptions(), '');
	});
});
