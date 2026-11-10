'use strict';

const assert = require('assert').strict;
const common = require('../../common');
const { extractChannelMessages } = require('../../../dist/sim/battle');
const { Battle } = require('../../../dist/sim');

describe('Illusion health reporting', () => {
	let battle;
	afterEach(() => battle?.destroy());
	function setup(ability) {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Zoroark', ability, moves: ['recover', 'splash'] },
			{ species: 'Mew', ability: 'No Ability', moves: ['splash'] },
		], [{ species: 'Magikarp', ability: 'No Ability', moves: ['tackle'] }]]);
		battle.p1.pokemon[1].hp = Math.floor(battle.p1.pokemon[1].maxhp / 2);
		battle.p1.pokemon[1].status = 'brn';
		battle.makeChoices('team 12', 'team 1');
		return [battle.p1.active[0], battle.p2.active[0]];
	}
	for (const ability of ['Opportunist', 'Perfect Illusion']) {
		it(`${ability} preserves the disguise display through a battle snapshot`, () => {
			const [holder] = setup(ability);
			const copy = Battle.fromJSON(JSON.parse(JSON.stringify(battle.toJSON())));
			try {
				assert.deepEqual(copy.p1.active[0].getHealth(), holder.getHealth());
				assert.equal(copy.p1.active[0].getHealth().shared, '50/100 brn');
				assert.equal(copy.p1.active[0].status, '');
			} finally {
				copy.destroy();
			}
		});
		it(`${ability} disguises public HP/status while preserving real mechanics and owner data`, () => {
			const [holder, foe] = setup(ability);
			const disguise = holder.illusion;
			holder.setStatus('tox', foe);
			assert.equal(holder.getHealth().shared, '50/100 brn');
			assert.equal(holder.getSwitchRequestData().condition, '251/251 tox');
			battle.damage(20, holder, foe, battle.dex.conditions.get('tox'));
			assert.equal(holder.getHealth().shared, '42/100 brn');
			battle.heal(10, holder, holder, battle.dex.moves.get('recover'));
			assert.equal(holder.getHealth().shared, '46/100 brn');
			assert.equal(holder.illusion, disguise);
			disguise.hp = 1;
			disguise.status = 'brn';
			assert.equal(holder.getHealth().shared, '46/100 brn');
			disguise.hp = 0;
			disguise.fainted = true;
			assert.equal(holder.getHealth().shared, '46/100 brn');
			assert.equal(holder.hp, 241);
			assert.equal(holder.status, 'tox');
		});
		it(`${ability} hides status events from opponents and restores real status when revealed`, () => {
			const [holder, foe] = setup(ability);
			const start = battle.log.length;
			holder.setStatus('tox', foe);
			holder.cureStatus();
			const log = battle.log.slice(start).join('\n');
			const publicLog = extractChannelMessages(log, [0])[0];
			const ownerLog = extractChannelMessages(log, [1])[1];
			assert(!publicLog.some(line => /^\|-(?:status|curestatus)\|p1a:/.test(line)));
			assert(ownerLog.some(line => line.startsWith('|-status|') && line.includes('|tox')));
			assert.equal(holder.getHealth().shared, '50/100 brn');
			battle.singleEvent('End', battle.dex.abilities.get('illusion'), holder.abilityState, holder);
			assert.equal(holder.getHealth().shared, '100/100');
		});
		it(`${ability} never reports a false faint and handles exact HP display`, () => {
			const [holder] = setup(ability);
			battle.reportExactHP = true;
			assert.equal(holder.getHealth().shared, '170/341 brn');
			holder.hp = 1;
			assert.equal(holder.getHealth().shared, '1/341 brn');
			assert.equal(holder.getHealth().secret, '1/251');
			holder.hp = 0;
			assert.equal(holder.getHealth().shared, '0 fnt');
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
