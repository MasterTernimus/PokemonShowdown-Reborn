'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex, TeamValidator } = require('../../../dist/sim');
const { November16MoveRemovals } = require('../../../dist/data/nov16-movepool-removals');

describe('November 16 approved balance changes', () => {
	let battle;
	it('keeps final loaded descriptions aligned after composite installers', () => {
		const {
			November16BalanceDescriptions,
		} = require('../../../dist/data/nov16-balance-descriptions');
		const before = structuredClone(November16BalanceDescriptions);
		require('../../../dist/data/text/abilities');
		assert.deepEqual(
			November16BalanceDescriptions,
			before,
			'loading battle text must not mutate shared descriptions'
		);
		for (const [id, text] of Object.entries(November16BalanceDescriptions)) {
			const a = Dex.abilities.get(id);
			assert.equal(a.desc, text.desc, id);
			assert.equal(a.shortDesc, text.shortDesc, id);
		}
	});
	it('summarizes inherited Filter and Solid Rock without retired damage values', () => {
		for (const id of ['warship', 'tidaljaw', 'absolutezero', 'requiem']) {
			const a = Dex.abilities.get(id);
			assert(!/20%|40%/.test(a.shortDesc), id);
			assert.match(a.desc, /32.5%/);
		}
		assert.match(Dex.abilities.get('requiem').shortDesc, /Filter/);
	});
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});
	function setup(
		ability = 'No Ability',
		species = 'Mew',
		foeAbility = 'No Ability',
		foeSpecies = 'Mew'
	) {
		const mon = (species, ability) => ({
			species,
			ability,
			moves: ['splash', 'tackle', 'wish', 'moonlight'],
		});
		battle = common.createBattle({ gameType: 'singles' }, [
			[mon(species, ability), mon('Mew', 'No Ability')],
			[mon(foeSpecies, foeAbility), mon('Mew', 'No Ability')],
		]);
		battle.field.terrain = '';
		battle.field.clearWeather();
		return [battle.p1.active[0], battle.p2.active[0]];
	}
	it('uses the approved species slots, typing and passive without changing Mega Garchomp', () => {
		assert.deepEqual(Dex.species.get('garchomp').passives, ['roughskin']);
		assert.deepEqual(Dex.species.get('garchompbattlebond').passives, ['serratedscales']);
		assert.deepEqual(Dex.species.get('garchompmega').passives, ['sharpness']);
		assert.deepEqual(Dex.species.get('garchompmegaz').passives, ['levitate']);
		assert.deepEqual(Dex.species.get('arbokmegay').types, ['Poison']);
		assert.equal(Dex.species.get('beedrill').abilities[0], 'Swarm');
		assert.deepEqual(Dex.species.get('clefable').abilities, {
			0: 'Void Promise',
			1: 'Friend Guard',
			H: 'Unaware',
		});
		assert.deepEqual(Dex.species.get('venomoth').abilities, {
			0: 'Prism Wings',
			1: 'Psychic Surge',
			H: 'Corrosion',
		});
		assert.equal(Dex.species.get('gengar').abilities.H, 'Bad Dreams');
		assert.equal(Dex.species.get('hydreigon').abilities.H, 'Mold Breaker');
	});
	it('Prism Scale keeps Friend Guard and Swift Swim but permits Taunt and Intimidate', () => {
		const [p, q] = setup('Prism Scale');
		assert(p.hasAbility('friendguard'));
		assert(p.hasAbility('swiftswim'));
		assert(!p.hasAbility('oblivious'));
		battle.actions.useMove('taunt', q, { target: p });
		assert(p.volatiles.taunt);
		q.setAbility('Intimidate');
		assert.equal(p.boosts.atk, -1);
	});
	it('Grounded Instinct has full Earth Eater and Limber without Keen Eye', () => {
		const [p, q] = setup('Grounded Instinct');
		assert(p.hasAbility('eartheater'));
		assert(p.hasAbility('limber'));
		assert(!p.hasAbility('keeneye'));
		p.hp -= 100;
		const hp = p.hp;
		battle.actions.useMove('earthquake', q, { target: p });
		assert(p.hp > hp);
		assert.equal(p.setStatus('par', q), false);
		battle.boost({ spe: -1, accuracy: -1 }, p, q);
		assert.equal(p.boosts.spe, 0);
		assert.equal(p.boosts.accuracy, -1);
		p.setAbility('No Ability');
		p.setStatus('par', q);
		p.setAbility('Grounded Instinct');
		battle.runEvent('Update', p);
		assert.equal(p.status, '');
	});
	it('Void Promise is the renamed Moon Veil without old Unaware or healing cleanup', () => {
		const [p] = setup('Void Promise');
		assert.equal(Dex.abilities.get('Moon Veil').id, 'voidpromise');
		assert.equal(Dex.abilities.all().filter(a => a.name === 'Void Promise').length, 1);
		assert(p.hasAbility('pastelveil'));
		assert(p.hasAbility('mistysurge'));
		assert(!p.hasAbility('unaware'));
		assert(!p.setStatus('psn'));
		p.boosts.atk = -1;
		p.hp -= 100;
		battle.makeChoices('move moonlight', 'move splash');
		assert.equal(p.boosts.atk, -1);
		battle.makeChoices('move wish', 'move splash');
		battle.makeChoices('move splash', 'move splash');
		assert.equal(p.boosts.atk, -1);
	});
	it('Infernal Dominion loses Fire Ward while keeping Intimidate and Molten Guard hooks', () => {
		const [p, q] = setup('Infernal Dominion');
		assert.equal(q.boosts.atk, -1);
		assert(!p.hasAbility('fireward'));
		for (const field of ['', 'dragonsdenterrain']) {
			battle.field.terrain = field;
			for (const event of ['ModifyDef', 'ModifySpD'])
				assert.equal(battle.runEvent(event, p, q, null, 100), 100);
		}
		assert(p.getAbility().onAnyAfterAttackResolved);
	});
	it('Hellfire Eclipse retains Dark Aura and Agony Flame without Intimidate', () => {
		const [p, q] = setup('Hellfire Eclipse');
		assert.equal(q.boosts.atk, 0);
		assert(p.hasAbility('darkaura'));
		assert(p.hasAbility('agonyflame'));
		assert(!p.hasAbility('intimidate'));
	});
	for (const id of ['Shadow Shield', 'Moonlit Hide', 'Voidcraft', 'Cursed Doll', 'Afterlife Gate']) {
		it(id + ' applies its Shadow Shield multiplier only at full HP', () => {
			const [p, q] = setup(id);
			const move = Dex.getActiveMove('tackle');
			p.getMoveHitData(move).typeMod = 1;
			const ordinaryDamage = id === 'Voidcraft' ? 90 : 100;
			assert.equal(battle.runEvent('ModifyDamage', q, p, move, 100), ordinaryDamage / 2);
			p.hp--;
			assert.equal(battle.runEvent('ModifyDamage', q, p, move, 100), ordinaryDamage);
		});
	}
	it('Shadow Shield keeps only its Cold Eclipse hail immunity', () => {
		const [p, q] = setup('Shadow Shield');
		battle.field.terrain = 'coldeclipseterrain';
		assert.equal(p.runStatusImmunity('hail'), false);
		battle.field.terrain = '';
		assert.equal(p.runStatusImmunity('hail'), true);
		p.addVolatile('gastroacid', q);
		assert.equal(battle.runEvent('ModifyDamage', q, p, Dex.getActiveMove('tackle'), 100), 100);
	});
	for (const ability of ['ultraego', 'burningego', 'perfectego']) {
		it(ability + ' grants field bonuses only in Ashen Beach and Fairy Tale', () => {
			setup();
			for (const field of [
				'ashenbeachterrain',
				'fairytaleterrain',
				'newworldterrain',
				'starlightarenaterrain',
				'coldeclipseterrain',
				'holyterrain',
				'rockyterrain',
			]) {
				battle.field.terrain = field;
				assert.equal(
					Dex.abilities.get(ability).boostedField.call(battle),
					['ashenbeachterrain', 'fairytaleterrain'].includes(field),
					field
				);
			}
		});
	}
	for (const [species, ability, grounded] of [
		['Charizard', 'No Ability', true],
		['Mew', 'Levitate', true],
		['Gardevoir', 'Void Veil', false],
	]) {
		it(
			'Lunar Orbit Gravity grounds/slows ' + species + '/' + ability + ' correctly in New World',
			() => {
				const [p, q] = setup('No Ability', 'Mew', ability, species);
				battle.field.startTerrain('newworldterrain', p);
				const speed = q.getStat('spe');
				p.setAbility('Lunar Orbit');
				assert.equal(battle.field.terrain, 'newworldterrain');
				assert.equal(!!q.isGrounded(), grounded);
				assert.equal(q.getStat('spe'), grounded ? Math.floor(speed * 0.75 + 0.0001) : speed);
				battle.field.removePseudoWeather('gravity');
				assert.equal(q.getStat('spe'), speed);
			}
		);
	}
	it('Ultra Ego no longer improves Big Top strong-hit rolls', () => {
		const [p] = setup();
		const move = Dex.getActiveMove('tackle');
		for (let roll = 0; roll < 13; roll++) {
			battle.random = () => roll;
			p.setAbility('No Ability');
			const normal = battle.StrikerBonus(p, move);
			p.setAbility('Ultra Ego');
			assert.equal(battle.StrikerBonus(p, move), normal);
		}
	});
	it('Terra Ascendant is Ultra Ego + Hospitality without Unaware', () => {
		const [p, q] = setup('Terra Ascendant');
		assert(p.hasAbility('ultraego'));
		assert(p.hasAbility('hospitality'));
		assert(!p.hasAbility('unaware'));
		const m = Dex.getActiveMove('tackle');
		battle.runEvent('ModifyMove', p, q, m, m);
		assert(m.ignoreAbility);
		battle.destroy();
		const set = ability => ({ species: 'Mew', ability, moves: ['splash'] });
		battle = common.createBattle({ gameType: 'doubles' }, [
			[set('No Ability'), set('No Ability')],
			[set('No Ability'), set('No Ability')],
		]);
		const holder = battle.p1.active[0],
			ally = battle.p1.active[1];
		ally.maxhp = ally.baseMaxhp = 800;
		ally.hp = 400;
		holder.setAbility('Terra Ascendant');
		assert.equal(ally.hp, 600);
	});
	it('Bloom Shelter has Friend Guard and full Natural Cure without the old healing/power package', () => {
		const [p, q] = setup('Bloom Shelter');
		assert.equal(p.ability, 'verdanthospitality');
		assert(p.hasAbility('friendguard'));
		assert(p.hasAbility('naturalcure'));
		assert(!p.hasAbility('proficient'));
		assert.equal(battle.runEvent('BasePower', p, q, Dex.getActiveMove('psychic'), 100), 100);
		p.hp = Math.floor(p.maxhp / 2);
		const hp = p.hp;
		p.setStatus('par');
		battle.makeChoices('switch 2', 'move splash');
		assert.equal(p.status, '');
		assert(p.hp > hp);
		assert.deepEqual(Dex.species.get('meganium').abilities, {
			0: 'Hospitality',
			1: 'Verdant Awakening',
			H: 'Invigorate',
		});
	});
	for (const ability of ['Solid Rock', 'Filter'])
		it(ability + ' grants 10% reduction and its extra super-effective protection', () => {
			const [p, q] = setup(ability);
			const m = Dex.getActiveMove('tackle');
			assert(Math.abs(battle.runEvent('ModifyDamage', q, p, m, 10000) - 9000) <= 2);
			p.getMoveHitData(m).typeMod = 1;
			assert(Math.abs(battle.runEvent('ModifyDamage', q, p, m, 10000) - 6750) <= 2);
			battle.field.terrain = 'dragonsdenterrain';
			assert.equal(battle.runEvent('ModifyDamage', q, p, m, 10000), 10000);
		});
	for (const ability of ['Tidal Monarch', 'Bombardment', 'Tidal Crown'])
		it(ability + ' has only its intended armor and redirection', () => {
			const [p, q] = setup(ability);
			const armor = ability === 'Tidal Monarch',
				m = Dex.getActiveMove('waterpulse');
			assert.equal(p.hasAbility('shellarmor'), armor);
			assert.equal(p.hasAbility('stalwart'), !armor);
			assert.equal(battle.runEvent('CriticalHit', p, q, m) !== false, !armor);
			assert.equal(battle.runEvent('ModifyDamage', q, p, m, 100), armor ? 80 : 100);
			battle.boost({ atk: -1 }, p, q);
			assert.equal(p.boosts.spd, armor ? 2 : 0);
			battle.field.terrain = 'dragonsdenterrain';
			p.boosts.def = 0;
			battle.singleEvent('Start', p.getAbility(), p.abilityState, p);
			assert.equal(p.boosts.def, armor ? 1 : 0);
		});
	it('all Tauros forms use Intimidate instead of Bull Rush', () => {
		for (const s of Dex.species.all().filter(s => s.id.startsWith('tauros'))) {
			assert(!Object.values(s.abilities).includes('Bull Rush'));
			assert.equal(s.abilities[0], 'Intimidate');
		}
	});
	for (const [id, moves] of Object.entries(November16MoveRemovals))
		for (const move of moves) {
			it(id + ' cannot use ' + move + ' through direct, inherited or pasted sources', () => {
				assert(!Dex.data.Learnsets[id]?.learnset?.[move]);
				for (const format of [
					'gen9dragonsden',
					'gen9doublesrockyfield',
					'gen9nofieldsinglesgame',
				]) {
					const validator = TeamValidator.get(format),
						data = Dex.moves.get(move);
					assert(validator.checkCanLearn(data, Dex.species.get(id)), format);
					const errors = validator.validateTeam([{ species: id, moves: [move] }]);
					assert(
						errors?.some(
							p => p.includes(data.name) || (id === 'chitwo' && p.includes('must use exactly'))
						),
						format
					);
				}
			});
		}
	it('keeps Endure legal for the unevolved Hisuian starter lines and other final evolutions', () => {
		const validator = TeamValidator.get('gen9dragonsden');
		for (const name of [
			'Cyndaquil',
			'Quilava',
			'Rowlet',
			'Dartrix',
			'Oshawott',
			'Dewott',
			'Meganium',
		]) {
			const species = Dex.species.get(name);
			assert(
				Dex.species.getFullLearnset(species.id).some(data => data.learnset.endure?.length),
				name
			);
			assert.equal(
				validator.validateTeam([
					{ species: name, ability: species.abilities[0], moves: ['Endure'] },
				]),
				null
			);
		}
	});
});
