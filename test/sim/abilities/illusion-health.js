'use strict';

const assert = require('assert').strict;
const common = require('../../common');
const { extractChannelMessages } = require('../../../dist/sim/battle');

describe('Illusion health reporting', () => {
	let battle;
	afterEach(() => battle?.destroy());
	function setup(ability) {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Zoroark', ability, moves: ['recover', 'splash'] },
			{ species: 'Mew', ability: 'No Ability', moves: ['splash'] },
		], [{ species: 'Magikarp', ability: 'No Ability', moves: ['tackle'] }]]);
		battle.makeChoices('team 12', 'team 1');
		return [battle.p1.active[0], battle.p2.active[0]];
	}
	for (const ability of ['Opportunist', 'Perfect Illusion']) {
		it(`${ability} reports its own HP and status through residual damage and healing`, () => {
			const [holder, foe] = setup(ability);
			const disguise = holder.illusion;
			holder.hp = 125;
			holder.setStatus('tox', foe);
			assert.equal(holder.getHealth().shared, '50/100 tox');
			assert.equal(holder.getSwitchRequestData().condition, '125/251 tox');
			battle.damage(20, holder, foe, battle.dex.conditions.get('tox'));
			assert.equal(holder.getHealth().shared, '42/100 tox');
			battle.heal(10, holder, holder, battle.dex.moves.get('recover'));
			assert.equal(holder.getHealth().shared, '46/100 tox');
			assert.equal(holder.illusion, disguise);
			disguise.hp = 1;
			disguise.status = 'brn';
			assert.equal(holder.getHealth().shared, '46/100 tox');
			disguise.hp = 0;
			disguise.fainted = true;
			assert.equal(holder.getHealth().shared, '46/100 tox');
		});
		for (const reveal of ['hit', 'forced']) {
			it(`${ability} sends one real-health refresh after ${reveal} reveal`, () => {
				const [holder, foe] = setup(ability);
				holder.hp = 125;
				holder.setStatus('tox', foe);
				const start = battle.log.length;
				if (reveal === 'hit') battle.actions.useMove('tackle', foe, { target: holder });
				else battle.singleEvent('End', battle.dex.abilities.get('illusion'), holder.abilityState, holder);
				assert.equal(holder.illusion, null);
				const log = extractChannelMessages(battle.log.slice(start).join('\n'), [0])[0];
				assert.equal(log.filter(line => line.startsWith('|replace|')).length, 1);
				const refresh = log.filter(line => line.startsWith('|-damage|') && line.endsWith('|[silent]'));
				assert.equal(refresh.length, 1);
				assert(refresh[0].includes('|' + holder.getHealth().shared + '|'));
				assert.equal(holder.ability, ability === 'Opportunist' ? 'opportunist' : 'perfectillusion');
			});
		}
	}
});
