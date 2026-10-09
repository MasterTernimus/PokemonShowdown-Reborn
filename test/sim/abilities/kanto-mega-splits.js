'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');
const approved = { arbokmegax: 'regenerator', arbokmegay: 'shedskin', raichumegax: 'electricsurge', raichumegay: 'noguard', parasectmega: 'dryskin', victreebelmega: 'innardsout', noctowlmega: 'insomnia', ledianmega: 'ironfist', ariadosmega: 'selfsufficient', sunfloramega: 'solarpower', skarmorymega: 'stalwart' };
let battle;
Object.assign(approved, {arbokmegax:'shedskin',sunfloramega:'solarbud'});
Object.assign(approved, require('./hoenn-mega-approved.json'), require('./sinnoh-unova-mega-approved.json'));
function setup(species, ability, doubles = false) {
	const set = (species = 'Mew', ability = 'No Ability') => ({ species, ability, moves: ['splash', 'protect', 'thunderbolt', 'sludgebomb'] });
	battle = common.createBattle({ formatid: doubles ? 'gen9nofielddoublesbattle' : 'gen9nofieldsinglesgame' }, [[set(species, ability || Dex.species.get(species).abilities[0]), set()], [set(), set()]]);
	battle.makeChoices('team 12', 'team 12');
	const p = battle.p1.active[0], q = battle.p2.active[0];
	if (p.species.id !== Dex.species.get(species).id) p.formeChange(species, null, true);
	battle.field.terrain = '';
	for (const side of battle.sides) for (const m of side.pokemon) m.hp = m.maxhp = m.baseMaxhp = 1200;
	return [p, q];
}
describe('Approved Kanto and Johto Mega splits', () => {
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});
	it('preserves the approved Kanto and Johto splits alongside later approved migrations', () => {
		for (const old of require('./kanto-mega-before.json')) {
			const now = Dex.species.get(old.id);
			assert.deepEqual(now.passives, require('./passive-approval-overlays').current(old.id, old.passives), old.id);
			assert.deepEqual(now.abilities, require('./passive-approval-overlays').abilities(old.id, {...old.abilities}), old.id);
		}
	});
	for (const [species, item, id] of [
		['Arbok', 'Arbokite', 'arbokmegax'], ['Arbok', 'Arbokite', 'arbokmegay'],
		['Raichu', 'Raichunite X', 'raichumegax'], ['Raichu', 'Raichunite Y', 'raichumegay'],
		['Parasect', 'Parasectite', 'parasectmega'], ['Victreebel', 'Victreebelite', 'victreebelmega'],
		['Noctowl', 'Noctowlite', 'noctowlmega'], ['Ledian', 'Ledianite', 'ledianmega'],
		['Ariados', 'Aridiate', 'ariadosmega'], ['Sunflora', 'Sunflorite', 'sunfloramega'], ['Skarmory', 'Skarmorite', 'skarmorymega'],
	]) it(id + ' obtains the passive through actual Mega evolution', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[{ species, item, ability: 'No Ability', moves: ['splash'] }], [{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move splash ' + (id === 'arbokmegay' ? 'megay' : 'mega'), 'move splash');
		const p = battle.p1.active[0];
		assert.equal(p.species.id, id);
		assert.deepEqual(p.getPassives(), [approved[id]]);
	});
	it('calculator publishes all six passives and matches live Dry Skin absorption', () => {
		const { calculateScenario, calculatorMetadata } = require('../../../dist/sim/custom-calculator');
		const metadata = calculatorMetadata();
		for (const [id, passive] of Object.entries(approved)) assert.deepEqual(metadata.species.find(s => s.name === Dex.species.get(id).name).passives, [passive]);
		const input = { format: 'gen9nofieldsinglesgame', move: 'Water Gun', samples: 16, seed: 42,
			actors: [{ species: 'Mew', ability: 'No Ability' }, { species: 'Parasect-Mega', ability: 'Complete Parasitism' }, { species: 'Mew', ability: 'No Ability' }, { species: 'Mew', ability: 'No Ability' }] };
		const result = calculateScenario(input);
		assert.equal(result.results[1].max, 0);
		assert.deepEqual(result.resolved.actors[1].passives, ['dryskin']);
	});
	for (const [id, passive] of Object.entries(approved)) it(id + ' keeps the passive through suppression, copying and Transform', () => {
		const [p, q] = setup(id);
		p.addVolatile('gastroacid');
		assert.deepEqual(p.getPassives(), [passive]);
		q.transformInto(p);
		assert.deepEqual(q.getPassives(), [passive]);
		p.setAbility('No Ability');
		assert.deepEqual(p.getPassives(), [passive]);
	});
	for (const ability of ['Neurotoxin', 'Regenerator', 'No Ability']) it('Arbok X heals once on switching with ' + ability, () => {
		const [p] = setup('Arbok-Mega-X', ability);
		p.hp = 100;
		battle.runEvent('SwitchOut', p);
		assert.equal(p.hp, ability === 'No Ability' ? 100 : 500);
	});
	for (const species of ['Arbok-Mega-X', 'Arbok-Mega-Y']) it(species + ' retains exactly one full Dragon Den Shed Skin activation', () => {
		const [p] = setup(species);
		battle.field.terrain = 'dragonsdenterrain';
		p.hp = 100;
		if (species.endsWith('Y')) p.addVolatile('gastroacid');
		battle.runEvent('Residual', p);
		assert.equal(p.hp, 400);
		assert.equal(p.boosts.atk + p.boosts.spa, 1);
		assert.equal(p.boosts.def, -1);
	});
	it('Shed Skin cleans status, negative stages and volatile effects once outside Dragon Den', () => {
		const [p] = setup('Arbok-Mega-Y');
		p.hp = 100;
		p.status = 'brn';
		p.boosts.atk = -2;
		p.addVolatile('confusion');
		let rolls = 0;
		battle.randomChance = () => {
			rolls++;
			return true;
		};
		battle.runEvent('Residual', p);
		assert.equal(rolls, 1);
		assert.equal(p.hp, 400);
		assert.equal(p.status, '');
		assert.equal(p.boosts.atk, 0);
		assert(!p.volatiles.confusion);
	});
	it('Electric Surge calls the field/Aura path once and preserves the underlying field', () => {
		const [p] = setup('Raichu-Mega-X');
		battle.field.startTerrain('rockyterrain');
		battle.field.clearAura();
		let calls = 0;
		const original = battle.field.setFieldOrAura;
		battle.field.setFieldOrAura = function (...args) {
			calls++;
			return original.apply(this, args);
		};
		battle.runEvent('SwitchIn', p);
		battle.singleEvent('Start', p.getAbility(), p.abilityState, p);
		assert.equal(calls, 1);
		assert.equal(battle.field.terrain, 'rockyterrain');
		assert(battle.field.isAura('electricterrain'));
	});
	it('Surge Conduit still redirects, absorbs, prevents recoil and reduces damage', () => {
		const [p, q] = setup('Raichu-Mega-X', undefined, true), ally = battle.p1.active[1];
		battle.actions.useMove('thunderbolt', q, { target: ally });
		assert.equal(p.hp, 1200);
		assert.equal(ally.hp, 1200);
		assert.equal(p.boosts.spa, 1);
		assert(!battle.damage(100, p, p, Dex.conditions.get('recoil')));
		const move = Dex.getActiveMove('tackle');
		assert.equal(battle.runEvent('ModifyDamage', q, p, move, 100), 100);
	});
	it('No Guard affects incoming and outgoing accuracy/invulnerability even while suppressed', () => {
		const [p, q] = setup('Raichu-Mega-Y');
		p.addVolatile('gastroacid');
		const move = Dex.getActiveMove('zapcannon');
		for (const [source, target] of [[p, q], [q, p]]) {
			assert.equal(battle.runEvent('Accuracy', target, source, move, 1), true);
			assert.equal(battle.runEvent('Invulnerability', target, source, move), 0);
		}
	});
	it('Railgun Circuit retains electrical boosts without permanently inflating raw stats', () => {
		const [p, q] = setup('Raichu-Mega-Y'), move = Dex.getActiveMove('thunderbolt');
		assert.equal(battle.runEvent('ModifySpA', p, q, move, 100), 130);
		assert.equal(battle.runEvent('ModifySpA', p, q, Dex.getActiveMove('psychic'), 100), 100);
		battle.field.terrain = 'factoryterrain';
		assert.equal(battle.runEvent('ModifySpA', p, q, move, 100), 200);
	});
	it('Dry Skin absorbs once and applies its Fire modifier once through nested Parasitism', () => {
		const [p, q] = setup('Parasect-Mega');
		p.hp = 100;
		battle.actions.useMove('watergun', q, { target: p });
		assert.equal(p.hp, 400);
		assert.equal(battle.runEvent('BasePower', q, p, Dex.getActiveMove('ember'), 100), 125);
	});
	it('Dry Skin retains rain, sun and local mist recovery without duplication', () => {
		const [p] = setup('Parasect-Mega');
		p.hp = 100;
		battle.field.setWeather('raindance', p);
		battle.runEvent('Weather', p, null, Dex.conditions.get('raindance'));
		assert.equal(p.hp, 250);
		battle.field.setWeather('sunnyday', p);
		battle.runEvent('Weather', p, null, Dex.conditions.get('sunnyday'));
		assert.equal(p.hp, 100);
		battle.field.clearWeather();
		battle.field.terrain = 'mistyterrain';
		// Complete Parasitism also retains Self Repair's independent 1/16 recovery.
		battle.runEvent('Residual', p);
		assert.equal(p.hp, 250);
	});
	it('revives into Parasect-Parasite with its own package and no retained Dry Skin', () => {
		const [p, q] = setup('Parasect-Mega');
		p.hp = 100;
		battle.damage(200, p, q, Dex.getActiveMove('tackle'));
		assert(p.volatiles.resuscitationpending);
		battle.singleEvent('Residual', Dex.conditions.get('resuscitationpending'), p.volatiles.resuscitationpending, p);
		assert.equal(p.species.id, 'parasectparasite');
		assert.equal(p.ability, 'resuscitation');
		assert.deepEqual(p.getPassives(), []);
		assert.equal(p.hp, p.maxhp);
		p.hp = 100;
		battle.actions.useMove('watergun', q, { target: p });
		assert(p.hp < 100);
	});
	it('Solar Trap loses only Digestive Sap; base Victreebel retains its healing', () => {
		const [p, q] = setup('Victreebel-Mega');
		p.hp = 100;
		battle.actions.useMove('sludgebomb', p, { target: q });
		assert.equal(p.hp, 100);
		assert(p.hasAbility('accumulation'));
		assert(p.hasAbility('liquidooze'));
		assert(!p.hasAbility('digestivesap'));
		q.setAbility('Digestive Sap');
		q.hp = 100;
		p.hp = 1200;
		p.setAbility('No Ability');
		battle.actions.useMove('sludgebomb', q, { target: p });
		assert(q.hp > 100);
	});
	it('Innards Out retaliates on a real lethal hit while Solar Trap remains separate', () => {
		const [p, q] = setup('Victreebel-Mega');
		p.hp = 100;
		battle.actions.useMove(Object.assign(Dex.getActiveMove('tackle'), { damage: 200 }), q, { target: p });
		assert.equal(p.hp, 0);
		assert.equal(q.hp, 1100);
	});
	it('copied nonrecipient Neurotoxin and Railgun Circuit retain their original components', () => {
		const [p, q] = setup('Mew', 'Neurotoxin');
		p.hp = 100;
		battle.runEvent('SwitchOut', p);
		assert.equal(p.hp, 500);
		p.setAbility('Railgun Circuit');
		const move = Dex.getActiveMove('zapcannon');
		assert.equal(battle.runEvent('Accuracy', q, p, move, 1), 1);
		assert.equal(battle.runEvent('Accuracy', p, q, move, 1), 1);
	});
	it('Noctowl keeps full Insomnia under suppression without doubling Dark/Ghost power', () => {
		const [p, q] = setup('Noctowl-Mega');
		for (const suppressed of [false, true]) {
			if (suppressed) p.addVolatile('gastroacid');
			assert.equal(battle.runEvent('BasePower', p, q, Dex.getActiveMove('shadowball'), 100), 130);
			assert(!p.setStatus('slp', q, Dex.moves.get('spore')));
			assert(!p.addVolatile('yawn', q));
			p.status = 'slp';
			battle.runEvent('Update', p);
			assert.equal(p.status, '');
		}
	});
	it('Sacred Power keeps Duskilate and Magic Guard after extracting Insomnia', () => {
		const [p, q] = setup('Noctowl-Mega'), move = Dex.getActiveMove('tackle');
		battle.runEvent('ModifyType', p, q, move, move);
		assert.equal(move.type, 'Dark');
		assert.equal(battle.runEvent('BasePower', p, q, move, 100), 169);
		assert(!battle.damage(100, p, q, Dex.conditions.get('brn')));
		assert.equal(p.hp, 1200);
	});
	it('passive Insomnia also prevents Rest healing on Glitch Terrain', () => {
		const [p] = setup('Noctowl-Mega');
		p.addVolatile('gastroacid');
		p.hp = 100;
		battle.field.terrain = 'glitchterrain';
		battle.actions.useMove('rest', p, { target: p });
		assert.equal(p.hp, 100);
		assert.equal(p.status, '');
	});
	it('Ledian gains 1.4x punch power and retains four contact hits at 40% each', () => {
		const [p, q] = setup('Ledian-Mega');
		q.setAbility('Rough Skin');
		const move = Dex.getActiveMove('machpunch');
		battle.runEvent('PrepareHit', p, q, move);
		assert.equal(move.multihit, 4);
		assert.equal(move.multihitType, 'starboxer');
		assert(move.flags.contact);
		assert.equal(battle.runEvent('BasePower', p, q, move, 100), 140);
		battle.actions.useMove(move, p, { target: q });
		assert(battle.log.some(line => line.includes('|-hitcount|') && line.endsWith('|4')));
		assert.equal(p.hp, 600);
		p.addVolatile('gastroacid');
		assert.equal(battle.runEvent('BasePower', p, q, Dex.getActiveMove('machpunch'), 100), 140);
	});
	it('Ariados heals once and stays immune to sand/hail even while suppressed', () => {
		const [p] = setup('Ariados-Mega');
		p.hp = 100;
		battle.runEvent('Residual', p);
		assert.equal(p.hp, 175);
		p.addVolatile('gastroacid');
		battle.runEvent('Residual', p);
		assert.equal(p.hp, 250);
		assert.equal(battle.runEvent('Immunity', p, null, null, 'sandstorm'), false);
		assert.equal(battle.runEvent('Immunity', p, null, null, 'hail'), false);
	});
	it('Silken Decoy still blocks a hit and renews its cocoon when another Pokemon faints', () => {
		const [p, q] = setup('Ariados-Mega');
		assert(p.m.silkenDecoyCocoon);
		battle.actions.useMove('tackle', q, { target: p });
		assert.equal(p.hp, 1200);
		assert(!p.m.silkenDecoyCocoon);
		battle.faint(q, p, Dex.moves.get('tackle'));
		battle.faintMessages();
		assert(p.m.silkenDecoyCocoon);
	});
	it('Solar Power applies its boost and HP cost once, both disabled on Cold Eclipse', () => {
		const [p, q] = setup('Sunflora-Mega');
		battle.field.setWeather('sunnyday', p);
		battle.field.terrain = '';
		assert.equal(battle.runEvent('ModifySpA', p, q, Dex.getActiveMove('flamethrower'), 100), 100);
		battle.runEvent('Residual', p);
		assert.equal(p.hp, 1200);
		assert(p.passiveStates.solarbud.solarBudReady);
		assert(!p.hasAbility('selfrepair'));
		battle.field.terrain = 'coldeclipseterrain';
		assert.equal(battle.runEvent('ModifySpA', p, q, Dex.getActiveMove('flamethrower'), 100), 100);
		battle.runEvent('Residual', p);
		assert.equal(p.hp, 1200);
		p.addVolatile('gastroacid');
		battle.field.terrain = '';
		battle.runEvent('Residual', p);
		assert.equal(p.hp, 1200);
	});
	it('Skarmory gets one Stalwart field entry boost and keeps Sharpness and Good as Gold', () => {
		const [p, q] = setup('Skarmory-Mega');
		battle.field.terrain = 'fairytaleterrain';
		battle.runEvent('SwitchIn', p);
		battle.singleEvent('Start', p.getAbility(), p.abilityState, p);
		assert.equal(p.boosts.spa, 1);
		battle.field.terrain = '';
		assert.equal(battle.runEvent('BasePower', p, q, Dex.getActiveMove('slash'), 100), 150);
		battle.actions.useMove('willowisp', q, { target: p });
		assert.equal(p.status, '');
	});
	it('passive Stalwart bypasses redirection after suppression', () => {
		const [p, q] = setup('Skarmory-Mega', undefined, true), target = battle.p2.active[1];
		q.setAbility('Lightning Rod');
		p.addVolatile('gastroacid');
		battle.actions.useMove('thunderbolt', p, { target });
		assert.equal(q.hp, 1200);
		assert.equal(q.boosts.spa, 0);
		assert(target.hp < 1200);
	});
	it('nonrecipient Solar Hydra and Sacred Power keep their original nested primitives', () => {
		const [p, q] = setup('Mew', 'Solar Hydra');
		battle.field.setWeather('sunnyday', p);
		battle.field.terrain = '';
		assert.equal(battle.runEvent('ModifySpA', p, q, Dex.getActiveMove('flamethrower'), 100), 100);
		battle.runEvent('Residual', p);
		assert.equal(p.hp, 1200);
		p.setAbility('Sacred Power');
		assert.equal(battle.runEvent('BasePower', p, q, Dex.getActiveMove('shadowball'), 100), 130);
	});
});
