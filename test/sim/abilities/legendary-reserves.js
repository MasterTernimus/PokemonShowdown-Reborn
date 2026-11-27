'use strict';
const assert = require('node:assert/strict');
const common = require('../../common');
const { Dex } = require('../../../dist/sim');
const mon = (species, ability, ...moves) => ({ species, ability, moves });
const idle = () => mon('Mew', 'No Ability', 'splash', 'watergun');
describe('Legendary reserves', () => {
	let battle;
	afterEach(() => battle?.destroy());
	function start(team, foes = [idle()], doubles = false) {
		battle = common.createBattle({ formatid: doubles ? 'gen9nofielddoublesbattle' : 'gen9nofieldsinglesgame' }, [team, foes]);
		battle.makeChoices(...[team, foes].map(side => 'team ' + side.map((_, i) => i + 1).join('')));
		battle.randomizer = n => n;
		battle.randomChance = (n, d) => n >= d;
		return [battle.p1.active[0], battle.p2.active[0]];
	}
	for (const [species, ability, signature, foeType, chosen, guard] of [
		['Articuno-Galar', 'Rime Mantle', 'freezingglare', 'Dark', 'Ice', 'icebeam'],
		['Zapdos-Galar', 'Storm Mantle', 'thunderouskick', 'Ghost', 'Electric', 'psychic'],
		['Moltres-Galar', 'Cinder Mantle', 'fierywrath', 'Steel', 'Fire', 'ember'],
	]) {
		it(ability + ' chooses without being hit and spends its defense once per entry', () => {
			const [p, q] = start([mon(species, ability, signature)]);
			q.setType(foeType);
			const signatureHit = () => {
				battle.actions.useMove(signature, p, { target: q });
				assert.equal(q.getMoveHitData(p.lastMoveUsed).mantleType, chosen);
			};
			signatureHit();
			p.hp = p.maxhp = 5000;
			const hit = () => {
				const before = p.hp;
				battle.actions.useMove(guard, q, { target: p });
				return before - p.hp;
			};
			assert(Math.abs(hit() * 2 - hit()) <= 1);
			q.hp = q.maxhp;
			signatureHit();
		});
	}
	it('chooses Fire and Dark independently on one spread Fiery Wrath, including absorption', () => {
		const [p, q] = start([mon('Moltres-Galar', 'Cinder Mantle', 'fierywrath'), idle()], [mon('Mew', 'Flash Fire', 'splash'), idle()], true);
		const other = battle.p2.active[1];
		q.setType('Steel');
		other.setType('Ghost');
		battle.actions.useMove('fierywrath', p);
		assert.equal(q.hp, q.maxhp);
		assert(other.hp < other.maxhp);
		assert.equal(other.getMoveHitData(p.lastMoveUsed).mantleType, 'Dark');
	});
	for (const [species, ability, prep] of [['Cosmog', 'Unaware', 'shelter'], ['Cosmoem', 'Sturdy', 'cosmicpower']]) {
		it(species + ' heals and cures the Teleport recipient, once per battle for the cure', () => {
			const [p] = start([mon(species, ability, 'teleport', prep), idle()]);
			const incoming = battle.p1.pokemon[1];
			for (let i = 0; i < 2; i++) {
				incoming.hp = 3;
				incoming.status = 'par';
				battle.makeChoices('move ' + prep, 'move splash');
				battle.makeChoices('move teleport', 'move watergun');
				assert.equal(p.m.nebulaGuard, p.m.ultraRivalryEntryToken);
				battle.makeChoices('switch 2', '');
				assert.equal(battle.p1.active[0], incoming);
				assert.equal(incoming.hp, 3 + Math.floor(incoming.baseMaxhp / 3));
				assert.equal(incoming.status, i ? 'par' : '');
				battle.makeChoices('switch 2', 'move splash');
			}
		});
	}
	it('a lethal entry hazard consumes the jump without healing the next replacement', () => {
		const [guide] = start([mon('Cosmoem', 'Sturdy', 'teleport'), idle(), idle()]);
		const recipient = battle.p1.pokemon[1], spare = battle.p1.pokemon[2];
		recipient.hp = 1;
		spare.hp = 100;
		guide.side.addSideCondition('stealthrock', battle.p2.active[0]);
		battle.makeChoices('move teleport', 'move splash');
		battle.makeChoices('switch 2', '');
		assert.equal(recipient.hp, 0);
		battle.makeChoices('switch 3', '');
		assert(spare.hp < 100);
	});
	it('in doubles Nebula Drift heals only the teammate that takes its slot', () => {
		const [guide] = start([mon('Cosmoem', 'Sturdy', 'teleport'), idle(), idle()], [idle(), idle()], true);
		const partner = battle.p1.active[1], incoming = battle.p1.pokemon[2];
		partner.hp = incoming.hp = 10;
		battle.makeChoices('move teleport, move splash', 'move splash, move splash');
		battle.makeChoices('switch 3, pass', '');
		assert.equal(battle.p1.active[0], incoming);
		assert.equal(partner.hp, 10);
		assert.equal(incoming.hp, 10 + Math.floor(incoming.baseMaxhp / 3));
		assert.equal(guide.isActive, false);
	});
	it('Heart Current requires different stages and pays once per entry', () => {
		const [p, q] = start([mon('Manaphy', 'Heart Current', 'heartswap')]);
		p.hp = 10;
		battle.actions.useMove('heartswap', p, { target: q });
		assert.equal(p.hp, 10);
		q.boosts.atk = 2;
		battle.actions.useMove('heartswap', p, { target: q });
		assert.equal(p.hp, 10 + Math.round(p.baseMaxhp / 4));
		const after = p.hp;
		battle.actions.useMove('heartswap', p, { target: q });
		assert.equal(p.hp, after);
	});
	for (const [species, ability, move] of [['Keldeo', 'Rushing Blade', 'secretsword'], ['Keldeo-Resolute', 'Rushing Blade', 'secretsword'], ['Meltan', 'Scrap Collector', 'ironhead']]) {
		it(species + ' restores HP on its first qualifying damaging hit', () => {
			const [p, q] = start([mon(species, ability, move)]);
			p.hp = 10;
			battle.actions.useMove(move, p, { target: q });
			assert.equal(p.hp, 10 + Math.round(p.baseMaxhp / 8));
			const after = p.hp;
			battle.actions.useMove(move, p, { target: q });
			assert.equal(p.hp, after);
		});
	}
	it('Victory Lap only saves the first successful V-create Speed drop', () => {
		const [p, q] = start([mon('Victini', 'Victory Lap', 'vcreate')]);
		q.hp = q.maxhp = 5000;
		for (let i = 1; i <= 2; i++) {
			battle.actions.useMove('vcreate', p, { target: q });
			assert.equal(p.boosts.spe, 1 - i);
			assert.equal(p.boosts.def, -i);
			assert.equal(p.boosts.spd, -i);
		}
	});
	it('Living Rampart halves the first Earthquake, with the new 570 BST spread', () => {
		const [p, q] = start([mon('Stakataka', 'Living Rampart', 'splash')]);
		assert.equal(p.species.bst, 570);
		assert.equal(p.species.baseStats.hp, 76);
		assert.equal(Dex.species.get('Kartana').abilities[0], 'Steadfast');
		p.hp = p.maxhp = 5000;
		const hit = () => {
			const before = p.hp;
			battle.actions.useMove('earthquake', q, { target: p });
			return before - p.hp;
		};
		assert(Math.abs(hit() * 2 - hit()) <= 1);
	});
});
