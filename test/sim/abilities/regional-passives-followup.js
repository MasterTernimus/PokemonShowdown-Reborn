'use strict';
const assert = require('assert').strict, common = require('../../common'), { Dex } = require('../../../dist/sim');
const approved = require('./regional-passives-approved.json');
let battle;
function setup(species, ability = 'No Ability', doubles = false) {
	const mon = (s = 'Chansey', a = 'No Ability') => ({ species: s, ability: a, moves: ['splash', 'tackle', 'watergun', 'gearup'] });
	battle = common.createBattle({ formatid: doubles ? 'gen9nofielddoublesbattle' : 'gen9nofieldsinglesgame' }, [[mon(species, ability), mon(), mon()], [mon(), mon(), mon()]]);
	battle.makeChoices('team 123', 'team 123');
	battle.field.terrain = '';
	battle.randomChance = () => false;
	return [battle.p1.active[0], battle.p2.active[0], battle.p1.active[1]];
}
function hit(source, target, id = 'tackle', extra = {}) {
	const m = Object.assign(Dex.getActiveMove(id), { accuracy: true, willCrit: false }, extra);
	battle.actions.useMove(m, source, { target });
	battle.clearActiveMove();
}
describe('Latest approved passive routing and scope preservation', () => {
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});
	it('leaves rejected choices and excluded new groups unassigned', () => {
		const held = ['castform', 'gardevoir', 'mawilemega', 'milotic', 'salamence', 'seviper', 'roserade', 'cherrim', 'probopass', 'bronzong', 'rhyperior', 'clawitzer', 'clawitzermega', 'meowstic', 'meowsticf', 'kommoo', 'golisopod', 'corviknight', 'armarouge', 'baxcalibur', 'tinkaton', 'kingambit', 'archaludon', 'glimmora', 'glimmoramega', 'bellibolt', 'scovillain', 'rabsca', 'dondozo', 'garchomp', 'garchompmegaz', 'garchompbattlebond', 'weavile', 'sigilyph', 'excadrill', 'krookodile', 'escavalier', 'conkeldurr'];
		for (const id of held.filter(id => ![...Object.values(require('./latest-passives-approved.json').groups).flat(), ...Object.values(require('./settled-passives-approved.json').groups).flat()].includes(id))) {
			const p = Dex.species.get(id);
			if (p.exists)
				assert.deepEqual(p.passives, approved.previousPassives[id] || [], id);
		}
		for (const ids of Object.values(approved.groups))
			for (const id of ids) {
				const p = Dex.species.get(id);
				assert(!/aevian|rejuv|reborn|azzy|pulse|rift|sevii/.test(id), id);
				assert(!p.tags.some(t => /Legendary|Mythical|Ultra Beast|Paradox/.test(t)), id);
			}
	});
	it('Rough Scale applies contact recoil once and retains Tough Claws', () => {
		const [p, t] = setup('Druddigon', 'Rough Scale');
		const hp = t.hp;
		hit(t, p);
		assert.equal(hp - t.hp, Math.floor(t.maxhp / 8));
		assert.equal(battle.runEvent('BasePower', p, t, Dex.getActiveMove('tackle'), 100), 130);
	});
	it('Freezer Burn retains selected Levitate, which suppression disables', () => {
		const [p, t] = setup('Glalie');
		p.formeChange('Glalie-Mega');
		p.setAbility('Freezer Burn');
		p.addVolatile('gastroacid');
		const hp = p.hp;
		hit(t, p, 'earthquake');
		assert(p.hp < hp);
		p.removeVolatile('gastroacid');
		assert.equal(p.isGrounded(), null);
		p.addVolatile('smackdown', t);
		hit(t, p, 'earthquake');
		assert(p.hp < hp);
	});
	it('Salt Bastion still grants Safeguard when passive Sturdy saves it', () => {
		const [p, t] = setup('Garganacl', 'Salt Bastion');
		hit(t, p, 'watergun', { basePower: 10000 });
		assert.equal(p.hp, 1);
		assert.equal(p.side.sideConditions.safeguard.duration, 5);
		assert(!battle.log.some(l => l.startsWith('|-ability|') && l.endsWith('|Sturdy')));
		assert(battle.log.some(l => l.includes('passive: Sturdy')));
	});
	it('Smoldering Shroud retains one blocked-drop reward and single Volcanic entry boost', () => {
		const [p, t] = setup('Torkoal', 'Smoldering Shroud');
		battle.field.setTerrain('volcanicterrain', p);
		p.boosts.atk = p.boosts.spa = 0;
		battle.runEvent('SwitchIn', p);
		assert.equal(p.boosts.atk, 1);
		assert.equal(p.boosts.spa, 1);
		battle.boost({ atk: -1 }, p, t, Dex.moves.get('growl'));
		assert.equal(p.boosts.atk, 1);
		assert.equal(p.boosts.spa, 2);
		battle.boost({ atk: -1 }, p, t, Dex.moves.get('growl'));
		assert.equal(p.boosts.spa, 2);
		p.addVolatile('gastroacid');
		battle.boost({ def: -1 }, p, t, Dex.moves.get('tailwhip'));
		assert.equal(p.boosts.def, 0);
	});
	it('Stamina keeps a separate once-turn boost budget through selected ability changes', () => {
		const [p, t] = setup('Mudsdale', 'Unyielding');
		p.hp = p.maxhp - 50;
		hit(t, p, undefined, { basePower: 1 });
		assert.equal(p.boosts.def, 1);
		assert.equal(p.passiveStates.stamina.staminaHitTurn, battle.turn);
		assert.equal(p.abilityState.staminaHitTurn, undefined);
		p.setAbility('Pressure');
		hit(t, p, undefined, { basePower: 1 });
		assert.equal(p.boosts.def, 1);
	});
	it('Silk Sights and passive Compound Eyes share their Mirror Arena reward', () => {
		const [p] = setup('Galvantula', 'Silk Sights');
		battle.field.setTerrain('mirrorarenaterrain', p);
		p.boosts.accuracy = 0;
		battle.runEvent('SwitchIn', p);
		assert.equal(p.boosts.accuracy, 1);
		assert(p.volatiles.laserfocus);
	});
	it('Raging Storm keeps priority protection without stacking Battle Armor mitigation', () => {
		const [p, t] = setup('Haxorus', 'Raging Storm');
		const m = Dex.getActiveMove('tackle');
		assert.equal(battle.runEvent('ModifyDamage', t, p, m, 100), 80);
		m.priority = 1;
		assert.equal(battle.runEvent('ModifyDamage', t, p, m, 100), 40);
	});
	it('Plus and Minus passives activate together and remain active through suppression', () => {
		const [p, t, ally] = setup('Plusle', 'No Ability', true);
		ally.formeChange('Minun');
		p.addVolatile('gastroacid');
		ally.addVolatile('gastroacid');
		const m = Dex.getActiveMove('thunderbolt');
		assert.equal(battle.runEvent('ModifySpA', p, t, m, 100), 130);
		assert.equal(battle.runEvent('ModifySpA', ally, t, m, 100), 130);
	});
	for (const [a, b, passive] of [['Aegislash', 'Aegislash-Blade', 'owntempo'], ['Eiscue', 'Eiscue-Noice', 'overcoat'], ['Morpeko', 'Morpeko-Hangry', 'owntempo'], ['Darmanitan', 'Darmanitan-Zen', 'owntempo'], ['Darmanitan-Galar', 'Darmanitan-Galar-Zen', 'owntempo'], ['Wishiwashi', 'Wishiwashi-School', 'friendguard'], ['Cramorant', 'Cramorant-Gulping', 'gluttony'], ['Cramorant', 'Cramorant-Gorging', 'gluttony'], ['Palafin', 'Palafin-Hero', 'friendguard'], ['Mimikyu', 'Mimikyu-Busted', 'cursedbody'], ['Minior', 'Minior-Meteor', 'clearbody']])
		it(a + ' retains its assigned passive through the approved ordinary transformation', () => {
			const [p] = setup(a);
			assert.deepEqual(p.getPassives(), [passive]);
			p.formeChange(b);
			assert.deepEqual(p.getPassives(), [passive]);
		});
});
