'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Battle } = require('../../../dist/sim');
let battle;
function start(a, b) {
	battle = common.createBattle({}, [[{ moves: ['sleeptalk'], ...a }], [{ species: 'Mew', ability: 'No Ability', moves: ['sleeptalk'], ...b }]]);
	return battle;
}
describe('November audit battle regressions', () => {
	afterEach(() => battle?.destroy());
	it('keeps renamed Mega components after switching back in', () => {
		battle = common.createBattle({}, [[{ species: 'Delphox', ability: 'Guardian Flame', moves: ['sleeptalk'] }, { species: 'Mew', moves: ['sleeptalk'] }], [{ species: 'Mew', moves: ['sleeptalk'] }]]);
		const p = battle.p1.active[0];
		p.formeChange('Delphox-Mega', battle.dex.conditions.get('dynamax'), true);
		assert.equal(p.baseAbility, 'astralwitchcraft');
		battle.makeChoices('switch 2', 'move sleeptalk');
		battle.makeChoices('switch 2', 'move sleeptalk');
		assert.equal(p.ability, 'astralwitchcraft');
		assert.equal(p.isGrounded(), null);
		assert.equal(p.runImmunity('Ground'), false);
	});
	it('starts a renamed Gmax ability only once', () => {
		battle = common.gen(8).createBattle({ gameType: 'doubles' }, [[{ species: 'Weedle', ability: 'sapsipper', moves: ['sleeptalk'] }, { species: 'Wynaut', moves: ['sleeptalk'] }], [{ species: 'Venusaur', moves: ['grasspledge'] }, { species: 'Charizard', level: 1, moves: ['firepledge'], gigantamax: true }]]);
		battle.makeChoices('auto', 'move grasspledge +1, move firepledge +1 dynamax');
		assert.equal(battle.log.filter(line => line.includes('|Blazing Crown|boost')).length, 1);
		assert.equal(battle.p1.active[0].boosts.atk, 0);
	});
	it('ignores Rowap Berry damage in Venom Pincer contact handling', () => {
		start({ species: 'Gliscor', ability: 'Venom Pincer', item: 'Rowap Berry' }, { moves: ['swift'] });
		battle.makeChoices('move sleeptalk', 'move swift');
		assert.equal(battle.p1.active[0].item, '');
		assert.equal(battle.p2.active[0].boosts.spe, 0);
	});
	it('does not treat confusion damage as a sound move', () => {
		start({ species: 'Kommo-o', ability: 'Scale Rhythm' });
		const p = battle.p1.active[0], hp = p.hp;
		battle.damage(10, p, p, { id: 'confused', name: 'confusion', effectType: 'Move' });
		assert.equal(p.hp, hp - 10); assert.equal(p.boosts.def, 0);
	});
	it('can calculate Joyride stats without an attacking move', () => {
		start({ species: 'Pinsir-Mega', ability: 'Joyride' });
		assert(Number.isFinite(battle.p1.active[0].getStat('spa')));
	});
	it('ends reflection between Mirror Armor and Iron Dominion', () => {
		start({ species: 'Corviknight', ability: 'Mirror Armor' }, { species: 'Corviknight-Gmax', ability: 'Iron Dominion' });
		assert.equal(battle.p1.active[0].boosts.def, 0); assert.equal(battle.p2.active[0].boosts.def, -1);
	});
	it('allows Nose Formation to snapshot a Prism Skimmer hit', () => {
		start({ species: 'Probopass', ability: 'Nose Formation', moves: ['tackle'] }, { species: 'Masquerain', ability: 'Intimidate' });
		battle.makeChoices('move tackle', 'move sleeptalk');
		assert(battle.log.some(line => line.includes('Mini-Nose')));
	});
	it('round trips move-tracking Sets with references to the copied Pokemon', () => {
		start({ species: 'Kommo-o', ability: 'Scale Rhythm' });
		battle.activeMove = battle.dex.getActiveMove('tackle');
		battle.activeMove.scaleRhythmUsers = new Set([battle.p1.active[0]]);
		const copy = Battle.fromJSON(JSON.parse(JSON.stringify(battle.toJSON())));
		try {
			assert(copy.activeMove.scaleRhythmUsers instanceof Set);
			assert(copy.activeMove.scaleRhythmUsers.has(copy.p1.active[0]));
			assert(!copy.activeMove.scaleRhythmUsers.has(battle.p1.active[0]));
		} finally { copy.destroy(); }
	});
	for (const ability of ['Perfect Foresight', 'Psyche Force']) it(ability + ' ignores confusion damage as an attack', () => {
		start({ species: 'Mew', ability });
		const p = battle.p1.active[0], hp = p.hp;
		battle.damage(10, p, p, { id: 'confused', name: 'confusion', effectType: 'Move' });
		assert.equal(p.hp, hp - 10);
	});
	it('preserves Gmax move indices around typeless attacks in doubles', () => {
		battle = common.createBattle({ gameType: 'doubles' }, [[
			{ species: 'Appletun', moves: ['belch', 'recycle', 'radiantassault', 'prismaticlaser'] },
			{ species: 'Mew', ability: 'No Ability', moves: ['splash'] },
		], [{ species: 'Blissey', moves: ['splash'] }, { species: 'Blissey', moves: ['splash'] }]]);
		const request = battle.p1.active[0].getDynamaxRequest();
		assert.equal(request.maxMoves.length, 4);
		assert.equal(request.maxMoves[2].move, 'radiantassault');
		assert.equal(request.maxMoves[2].target, 'allAdjacentFoes');
		assert.equal(request.maxMoves[3].move, 'prismaticlaser');
		battle.makeChoices('move 4 1 dynamax, move 1', 'move 1, move 1');
		assert(battle.log.some(line => line.includes('|Prismatic Laser|')));
	});
	it('Strange Steam priority uses its queued target without a previous active move', () => {
		start({ species: 'Mew', moves: ['strangesteam'] }, { species: 'Hydreigon' });
		battle.clearActiveMove();
		const move = battle.dex.getActiveMove('strangesteam');
		assert.equal(battle.singleEvent('ModifyPriority', move, null, battle.p1.active[0], battle.p2.active[0], null, 0), 1);
	});
	for (const [ability, stat] of [['Vessel of Ruin', 'SpA'], ['Tablets of Ruin', 'Atk'], ['Beads of Ruin', 'SpD'], ['Sword of Ruin', 'Def']]) {
		it(ability + ' modifies a move-free stat read once with two holders', () => {
			battle = common.createBattle({ gameType: 'doubles' }, [[{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }, { species: 'Mew', ability: 'No Ability', moves: ['splash'] }], [{ species: 'Mew', ability, moves: ['splash'] }, { species: 'Mew', ability, moves: ['splash'] }]]);
			const p = battle.p1.active[0], q = battle.p2.active[0];
			assert.equal(battle.runEvent('Modify' + stat, p, q, null, 100), 75);
			assert.equal(battle.runEvent('Modify' + stat, p, q, battle.dex.getActiveMove('tackle'), 100), 75);
		});
	}
});
