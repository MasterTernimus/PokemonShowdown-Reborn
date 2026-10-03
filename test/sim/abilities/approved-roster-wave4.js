'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim/dex');
const { abilityIncludesComponent } = require('../../../dist/data/ability-components');

describe('Approved fourth roster pass', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });
	function make(ability, species = 'Mew', foeAbility = 'No Ability') {
		battle = common.createBattle({ formatid: 'gen9nofielddoublesbattle' }, [[
			{ species, ability, moves: ['splash', 'protect', 'dracometeor', 'courtchange'] },
			{ species: 'Mew', ability: 'No Ability', moves: ['splash'] },
			{ species: 'Mew', ability: 'No Ability', moves: ['splash'] },
		], [
			{ species: 'Blissey', ability: foeAbility, moves: ['splash', 'tackle', 'recover'] },
			{ species: 'Mew', ability: 'No Ability', moves: ['splash'] },
			{ species: 'Mew', ability: 'No Ability', moves: ['splash'] },
		]]);
		battle.makeChoices('team 1, 2, 3', 'team 1, 2, 3');
		battle.p2.active[0].storedStats.def = 250;
		return [battle.p1.active[0], battle.p1.active[1], battle.p2.active[0], battle.p2.active[1]];
	}
	function hit(id, source, target) {
		const move = typeof id === 'string' ? battle.dex.getActiveMove(id) : id;
		move.accuracy = true;
		battle.actions.useMove(move, source, { target });
		battle.runEvent('AfterMove', source, target, battle.activeMove);
		return battle.activeMove;
	}
	function modify(id, source, target) {
		const move = battle.dex.getActiveMove(id);
		return battle.runEvent('ModifyMove', source, target, move, move);
	}
	function start(pokemon) {
		battle.singleEvent('Start', pokemon.getAbility(), pokemon.abilityState, pokemon);
	}
	function leftovers(pokemon) {
		pokemon.setItem('leftovers');
		battle.singleEvent('Residual', pokemon.getItem(), pokemon.itemState, pokemon);
	}
	it('updates slots and searchable components while preserving Goodra and Levitate', () => {
		for (const [species, ability, component] of [
			['Seviper-Mega', 'Sirius', 'Black Viper'], ['Rhyperior', 'Quarry Cannon', 'Solid Rock'],
			['Mamoswine', 'Tundra March', 'Oblivious'], ['Jellicent', 'Undertow', 'Water Absorb'],
			['Incineroar', 'Ringmaster', 'Tough Claws'], ['Mudsdale', 'Unyielding', 'Stamina'],
		]) {
			assert(Object.values(Dex.species.get(species).abilities).includes(ability));
			assert(abilityIncludesComponent(ability, component));
		}
		assert(!abilityIncludesComponent('Hydra Tyrant', 'Self Sufficient'));
		for (const component of ['Magic Guard', 'Unaware']) {
			assert(!abilityIncludesComponent('Lunar Dread', component));
		}
		assert.equal(Dex.species.get('Hydreigon').abilities[0], 'Levitate');
		assert.equal(Dex.species.get('Hydreigon').abilities[1], 'Dark Dominion');
		assert.equal(Dex.species.get('Mienshao').abilities.H, 'Meridian Seal');
		assert.equal(Dex.species.get('Goodra').abilities[1], 'Gooey');
		assert.equal(Dex.species.get('Goodra-Hisui').abilities[1], 'Filter');
		assert.equal(Dex.species.get('Baxcalibur').abilities[1], 'Rimeplate');
		assert(abilityIncludesComponent('Dark Dominion', 'Dark Aura'));
	});
	it('Meridian Seal suppresses for two turns, restores the ability and activates only once per entry', () => {
		const [p, , foe, other] = make('Meridian Seal', 'Mienshao', 'Water Absorb');
		hit('lowkick', p, foe);
		assert(foe.ignoringAbility());
		assert.equal(foe.volatiles.meridianseal.duration, 2);
		hit('lowkick', p, other);
		assert(!other.volatiles.meridianseal);
		battle.fieldEvent('Residual');
		assert(foe.ignoringAbility());
		battle.fieldEvent('Residual');
		assert(!foe.ignoringAbility());
		const hp = foe.hp;
		hit('watergun', p, foe);
		assert(foe.hp >= hp);
		start(p);
		hit('lowkick', p, other);
		assert(other.volatiles.meridianseal);
	});
	it('Meridian Seal respects Protect, Substitute, Ability Shield and unsuppressible abilities', () => {
		const [p, , foe] = make('Meridian Seal');
		foe.addVolatile('protect', foe);
		hit('lowkick', p, foe);
		assert(!p.abilityState.used);
		foe.removeVolatile('protect');
		foe.addVolatile('substitute', foe);
		hit('lowkick', p, foe);
		assert(!p.abilityState.used);
		foe.removeVolatile('substitute');
		foe.setItem('abilityshield');
		hit('lowkick', p, foe);
		assert(!foe.ignoringAbility());
		foe.clearItem();
		foe.setAbility('Multitype', null, null, true);
		start(p);
		hit('lowkick', p, foe);
		assert(!foe.ignoringAbility());
	});
	it('Meridian Seal correctly stops and restores Neutralizing Gas', () => {
		const [p, ally, foe] = make('Meridian Seal');
		p.setItem('abilityshield');
		ally.setAbility('Levitate');
		foe.setAbility('Neutralizing Gas');
		battle.singleEvent('SwitchIn', foe.getAbility(), foe.abilityState, foe);
		assert(ally.ignoringAbility());
		hit('lowkick', p, foe);
		assert(!ally.ignoringAbility());
		foe.removeVolatile('meridianseal');
		assert(ally.ignoringAbility());
	});
	it('Rimeplate reduces only subsequent hits in the same multi-hit attack by 75%', () => {
		const [p, , foe] = make('Rimeplate', 'Baxcalibur');
		const move = battle.dex.getActiveMove('doublehit');
		move.hit = 1;
		assert.equal(battle.runEvent('ModifyDamage', foe, p, move, 100), 100);
		move.hit = 2;
		assert.equal(battle.runEvent('ModifyDamage', foe, p, move, 100), 25);
		const separate = battle.dex.getActiveMove('tackle');
		assert.equal(battle.runEvent('ModifyDamage', foe, p, separate, 100), 100);
	});
	it('Dark Dominion retains Dark Aura and applies two-turn Heal Block without shortening longer effects', () => {
		const [p, , foe] = make('Dark Dominion', 'Hydreigon');
		assert.equal(p.getAbility().onAnyBasePower, Dex.abilities.get('Dark Aura').onAnyBasePower);
		hit('bite', p, foe);
		assert.equal(foe.volatiles.healblock.duration, 2);
		assert.equal(battle.heal(20, foe, foe, battle.dex.moves.get('recover')), false);
		foe.volatiles.healblock.duration = 5;
		hit('bite', p, foe);
		assert.equal(foe.volatiles.healblock.duration, 5);
		foe.removeVolatile('healblock');
		foe.addVolatile('substitute', foe);
		hit('bite', p, foe);
		assert(!foe.volatiles.healblock);
		foe.removeVolatile('substitute');
		foe.addVolatile('protect', foe);
		hit('bite', p, foe);
		assert(!foe.volatiles.healblock);
	});
	it('Sirius gains Black Viper poison while keeping Apex Venom and entry accuracy', () => {
		const [p, , foe, other] = make('Sirius', 'Seviper-Mega');
		assert.equal(p.boosts.accuracy, 1);
		assert.equal(modify('poisonfang', p, foe).type, 'Dragon');
		hit('aquatail', p, foe);
		assert.equal(foe.status, 'tox');
		hit('aquatail', p, other);
		assert.equal(other.status, '');
	});
	it('Cold Open survives Protect, applies to a whole multi-hit move, then is consumed', () => {
		const [p, , foe] = make('Cold Open');
		foe.addVolatile('protect', foe);
		hit('tackle', p, foe);
		assert(!p.abilityState.used);
		foe.removeVolatile('protect');
		foe.boosts.def = 6;
		foe.side.addSideCondition('reflect', foe);
		const move = hit('doublehit', p, foe);
		assert(move.ignorePositiveDefensive && move.ignoreScreens);
		assert(p.abilityState.used);
		const next = modify('tackle', p, foe);
		assert(!next.ignorePositiveDefensive && !next.ignoreScreens);
		start(p);
		assert(modify('tackle', p, foe).ignoreScreens);
	});
	it('Cold Open does not bypass Substitute', () => {
		const [p, , foe] = make('Cold Open');
		foe.addVolatile('substitute', foe);
		const hp = foe.hp;
		hit('tackle', p, foe);
		assert.equal(foe.hp, hp);
	});
	it('Quarry Cannon makes Rock Blast five hits and preserves Solid Rock', () => {
		const [p, , foe] = make('Quarry Cannon', 'Rhyperior');
		assert.equal(modify('rockblast', p, foe).multihit, 5);
		assert.equal(p.getAbility().onSourceModifyDamage, Dex.abilities.get('Solid Rock').onSourceModifyDamage);
		hit('rockblast', p, foe);
		assert(battle.log.some(line => line.includes('|-hitcount|') && line.endsWith('|5')));
	});
	it('Tundra March clears only floor hazards after a landed opposing Ground hit', () => {
		const [p, , foe] = make('Tundra March');
		for (const id of ['spikes', 'toxicspikes', 'stickyweb', 'stealthrock']) p.side.addSideCondition(id, foe);
		foe.setType('Flying');
		hit('earthpower', p, foe);
		assert(p.side.sideConditions.spikes);
		foe.setType('Normal');
		hit('earthpower', p, foe);
		for (const id of ['spikes', 'toxicspikes', 'stickyweb']) assert(!p.side.sideConditions[id]);
		assert(p.side.sideConditions.stealthrock);
	});
	it('Undertow absorbs Water and grounds foes without trapping them', () => {
		const [p, , foe] = make('Undertow');
		p.hp -= 100;
		hit('watergun', foe, p);
		assert(p.hp > p.maxhp - 100);
		foe.setType('Flying');
		hit('watergun', p, foe);
		assert(foe.isGrounded());
		assert(!foe.trapped);
	});
	it('Undertow respects Substitute and Water Absorb', () => {
		const [p, , foe] = make('Undertow');
		foe.setType('Flying');
		foe.addVolatile('substitute', foe);
		hit('watergun', p, foe);
		assert(!foe.isGrounded());
		foe.removeVolatile('substitute');
		foe.setAbility('Water Absorb');
		hit('watergun', p, foe);
		assert(!foe.isGrounded());
	});
	it('Deadwater halves passive recovery and caps siphoning across foes at 1/8', () => {
		const [p, , foe, other] = make('Deadwater');
		p.hp -= 150;
		foe.hp -= 200;
		other.hp -= 100;
		const hp = p.hp, enemyHP = foe.hp;
		leftovers(foe);
		assert.equal(foe.hp - enemyHP, Math.floor(Math.floor(foe.maxhp / 16) / 2));
		for (let i = 0; i < 5; i++) { leftovers(foe); leftovers(other); }
		assert.equal(p.hp - hp, Math.floor(p.baseMaxhp / 8));
	});
	for (const [ability, weather] of [['Rain Dish', 'raindance'], ['Ice Body', 'hail'], ['Dry Skin', 'raindance']]) {
		it('Deadwater halves ' + ability + ' weather recovery and siphons the prevented HP', () => {
			const [p, , foe] = make('Deadwater', 'Mew', ability);
			p.setType('Ice');
			battle.field.setWeather(weather, p);
			p.hp -= 150;
			foe.hp -= 200;
			const hp = p.hp, enemyHP = foe.hp;
			battle.makeChoices('move splash, move splash', 'move splash, move splash');
			const recovery = Math.floor(foe.baseMaxhp / (ability === 'Dry Skin' ? 8 : 16));
			assert.equal(foe.hp - enemyHP, Math.floor(recovery / 2));
			assert.equal(p.hp - hp, Math.min(recovery - Math.floor(recovery / 2), Math.floor(p.baseMaxhp / 8)));
		});
	}
	it('Deadwater excludes normal healing, allies, full HP and blocked healing', () => {
		const [p, ally, foe] = make('Deadwater');
		p.hp -= 100;
		const hp = p.hp;
		leftovers(foe);
		assert.equal(p.hp, hp);
		ally.hp -= 100;
		const allyHP = ally.hp;
		leftovers(ally);
		assert.equal(ally.hp - allyHP, Math.floor(ally.maxhp / 16));
		foe.hp -= 200;
		assert.equal(battle.heal(80, foe, foe, battle.dex.moves.get('recover')), 80);
		assert.equal(p.hp, hp);
		foe.addVolatile('healblock', p);
		leftovers(foe);
		assert.equal(p.hp, hp);
	});
	it('Vital Circuit drains Electric damage, respects Big Root and shares one cap across targets', () => {
		const [p, , foe, other] = make('Vital Circuit');
		p.setItem('bigroot');
		p.hp -= 150;
		const hp = p.hp;
		hit('thunder', p, foe);
		hit('thunder', p, other);
		hit('thunder', p, foe);
		assert.equal(p.hp - hp, Math.floor(p.baseMaxhp / 8));
		assert.deepEqual(modify('paraboliccharge', p, foe).drain, [1, 2]);
		assert(!modify('paraboliccharge', p, foe).vitalCircuitDrain);
	});
	it('Vital Circuit respects Liquid Ooze and does not drain allies', () => {
		const [p, ally, foe] = make('Vital Circuit', 'Mew', 'Liquid Ooze');
		p.hp -= 100;
		const hp = p.hp;
		hit('thundershock', p, ally);
		assert.equal(p.hp, hp);
		hit('thundershock', p, foe);
		assert(p.hp < hp);
	});
	it('Ringmaster applies two-turn Taunt once per entry and respects Oblivious', () => {
		const [p, , foe, other] = make('Ringmaster');
		hit('snarl', p, foe);
		assert.equal(foe.volatiles.taunt.duration, 2);
		assert(!other.volatiles.taunt);
		start(p);
		other.setAbility('Oblivious');
		hit('bite', p, other);
		assert(!other.volatiles.taunt);
	});
	it('Unyielding blocks opposing phazing only with positive Defense and keeps Stamina', () => {
		const [p, , foe] = make('Unyielding');
		assert(battle.runEvent('DragOut', p, foe, battle.dex.moves.get('roar')));
		hit('tackle', foe, p);
		assert.equal(p.boosts.def, 1);
		assert.equal(battle.runEvent('DragOut', p, foe, battle.dex.moves.get('roar')), null);
		p.clearBoosts();
		assert(battle.runEvent('DragOut', p, foe, battle.dex.moves.get('roar')));
	});
	it('Primal Rhythm uses Attack, spares allies, and remains blocked by Soundproof', () => {
		const [p, ally, foe, other] = make('Primal Rhythm', 'Rillaboom', 'Soundproof');
		const move = modify('boomburst', p, foe);
		assert.equal(move.category, 'Physical');
		assert.equal(move.target, 'allAdjacentFoes');
		const allyHP = ally.hp, foeHP = foe.hp, otherHP = other.hp;
		hit('boomburst', p, foe);
		assert.equal(ally.hp, allyHP);
		assert.equal(foe.hp, foeHP);
		assert(other.hp < otherHP);
	});
	it('Set Piece grants priority and accuracy after Feint, and Protect consumes the attempt', () => {
		const [p, , foe] = make('Set Piece');
		hit('feint', p, foe);
		const move = battle.dex.getActiveMove('pyroball');
		assert.equal(battle.runEvent('ModifyPriority', p, foe, move, move.priority), 1);
		foe.addVolatile('protect', foe);
		assert.equal(hit(move, p, foe).accuracy, true);
		assert(!p.abilityState.charged);
	});
	it('Set Piece requires a successful Court Change and resets on entry', () => {
		const [p, , foe] = make('Set Piece');
		hit('courtchange', p, foe);
		assert(!p.abilityState.charged);
		foe.side.addSideCondition('reflect', foe);
		hit('courtchange', p, foe);
		assert(p.abilityState.charged);
		start(p);
		assert(!p.abilityState.charged);
	});
	it('Calculated Shot raises Water crit stages and removes only damage variance', () => {
		const [p, , foe] = make('Calculated Shot');
		const move = modify('snipeshot', p, foe);
		assert.equal(move.critRatio, 3);
		assert(move.noDamageVariance);
		assert(!modify('darkpulse', p, foe).noDamageVariance);
		move.willCrit = false;
		const values = Array.from({ length: 10 }, () => battle.actions.getDamage(p, foe, move));
		assert.equal(new Set(values).size, 1);
	});
	it('Territorial no longer ignores negative offense or positive evasion', () => {
		const [p, , foe] = make('Territorial');
		assert(!modify('earthpower', p, foe).ignoreNegativeOffensive);
		hit('tackle', foe, p);
		const move = modify('earthquake', p, foe);
		assert(!move.ignoreNegativeOffensive && !move.ignorePositiveEvasion);
		assert(!modify('tackle', p, foe).ignoreNegativeOffensive);
	});
	it('Lunar Dread has no former mark, damage reduction or Ground critical effects', () => {
		const [p, , foe] = make('Lunar Dread');
		hit('tackle', p, foe);
		assert(!foe.volatiles.lunardread);
		const tackle = battle.dex.getActiveMove('tackle'), earth = battle.dex.getActiveMove('earthpower');
		assert.equal(battle.runEvent('ModifyDamage', foe, p, tackle, 100), 100);
		assert.equal(battle.runEvent('ModifyCritRatio', p, foe, earth, 1), 1);
	});
	it('False Bouquet seeds once per entry, respecting Substitute and Grass immunity', () => {
		const [p, , foe, other] = make('False Bouquet');
		foe.addVolatile('substitute', foe);
		hit('flowertrick', p, foe);
		assert(!foe.volatiles.leechseed);
		assert(!p.abilityState.used);
		foe.removeVolatile('substitute');
		hit('flowertrick', p, foe);
		assert(foe.volatiles.leechseed);
		hit('flowertrick', p, other);
		assert(!other.volatiles.leechseed);
		start(p);
		other.setType('Grass');
		hit('flowertrick', p, other);
		assert(!other.volatiles.leechseed);
	});
	it('Funeral Choir makes Ghost damage sound only after a teammate faints', () => {
		const [p, ally, foe] = make('Funeral Choir');
		assert(!modify('shadowball', p, foe).flags.sound);
		ally.faint();
		battle.faintMessages();
		assert(modify('shadowball', p, foe).flags.sound);
		assert(!modify('curse', p, foe).flags.sound);
		foe.setType('Psychic');
		foe.setAbility('Soundproof');
		const hp = foe.hp;
		hit('shadowball', p, foe);
		assert.equal(foe.hp, hp);
	});
	it('Hydra Tyrant restores all negative stages after the complete Draco Meteor only once per battle', () => {
		const [p, , foe] = make('Hydra Tyrant', 'Hydreigon');
		p.boosts.atk = 2;
		p.boosts.def = -1;
		hit('dracometeor', p, foe);
		assert.equal(p.boosts.spa, 0);
		assert.equal(p.boosts.def, 0);
		assert.equal(p.boosts.atk, 2);
		assert(p.m.hydraTyrantRestoreUsed);
		start(p);
		foe.hp = foe.maxhp;
		hit('dracometeor', p, foe);
		assert(p.boosts.spa < 0);
		assert.equal(p.getAbility().onResidual, undefined);
	});
	it('Hydra Tyrant does not spend restoration when Draco Meteor is blocked', () => {
		const [p, , foe] = make('Hydra Tyrant', 'Hydreigon');
		foe.setType('Fairy');
		hit('dracometeor', p, foe);
		assert(!p.m.hydraTyrantRestoreUsed);
	});
	it('Hydra Tyrant also restores after a called Draco Meteor without an outer AfterMove event', () => {
		const [p, , foe] = make('Hydra Tyrant', 'Hydreigon');
		p.boosts.accuracy = 6;
		battle.actions.useMove('dracometeor', p, { target: foe });
		assert.equal(p.boosts.spa, 0);
		assert(p.m.hydraTyrantRestoreUsed);
	});
	it('Hydra Tyrant restoration works through the actual turn queue and survives switching', () => {
		const [p, , foe] = make('Hydra Tyrant', 'Hydreigon');
		p.boosts.accuracy = 6;
		battle.makeChoices('move dracometeor 1, move splash', 'move splash, move splash');
		assert.equal(p.boosts.spa, 0);
		assert(p.m.hydraTyrantRestoreUsed);
		battle.makeChoices('switch 3, move splash', 'move splash, move splash');
		battle.makeChoices(`switch ${p.position + 1}, move splash`, 'move splash, move splash');
		assert(p.m.hydraTyrantRestoreUsed);
		foe.hp = foe.maxhp;
		p.boosts.accuracy = 6;
		battle.makeChoices('move dracometeor 1, move splash', 'move splash, move splash');
		assert(p.boosts.spa < 0);
	});
	it('Funeral Choir Ghost attacks bypass Substitute and are stopped by Throat Chop', () => {
		const [p, ally, foe] = make('Funeral Choir');
		ally.faint();
		battle.faintMessages();
		foe.setType('Psychic');
		foe.addVolatile('substitute', foe);
		const hp = foe.hp;
		hit('shadowball', p, foe);
		assert(foe.hp < hp);
		assert(foe.volatiles.substitute);
		p.addVolatile('throatchop', foe);
		const choppedHP = foe.hp;
		hit('shadowball', p, foe);
		assert.equal(foe.hp, choppedHP);
	});
});
