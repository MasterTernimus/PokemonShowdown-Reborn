'use strict';const assert=require('assert').strict,common=require('../../common'),{Dex}=require('../../../dist/sim');
describe('Palafin and Hydrapple approved migrations', () => {
	let b;
	afterEach(() => {
		b?.destroy();
		b = null;
	});
	function setup(species = 'Palafin', ability = 'Hydration', double = false) {
		const m = { species: 'Mew', ability: 'No Ability', moves: ['splash', 'tackle', 'transform'] };
		b = common.createBattle({ formatid: double ? 'gen9nofielddoublesbattle' : 'gen9nofieldsinglesgame' }, [[{ ...m, species, ability }, m], [m, m]]);
		b.makeChoices('team 12', 'team 12');
		return [b.p1.active[0], b.p2.active[0]];
	}
	for (const ability of ['Sworn Duty', 'Friend Guard', 'Hydration']) for (const water of [false, true])it('retains ' + ability + ' across ' + (water ? 'water entry' : 'switchout'), () => {
		const [p] = setup('Palafin', ability);
		p.hp = Math.floor(p.maxhp / 2);
		const hp = p.hp, state = p.abilityState;
		if (water) {
			b.field.terrain = 'watersurfaceterrain';
			b.runEvent('SwitchIn', p);
		} else b.runEvent('SwitchOut', p);
		assert.equal(p.species.id, 'palafinhero');
		assert.equal(p.ability, Dex.toID(ability));
		assert.equal(p.baseAbility, p.ability);
		assert.equal(p.abilityState, state);
		assert.equal(p.hp, hp);
		assert.deepEqual(p.getPassives(), ['zerotohero']);
	});
it('suppression leaves passive transformation and Fighting STAB',()=>{const[p,q]=setup();p.addVolatile('gastroacid');b.runEvent('SwitchOut',p);assert.equal(p.species.id,'palafinhero');assert.equal(b.runEvent('ModifySTAB',p,q,Dex.getActiveMove('closecombat'),1),1.5);assert.equal(Dex.abilities.get('zerotohero').onAnyModifyDamage,undefined);});
	it('one survival persists through form and entry', () => {
		const [p, q] = setup('Palafin', 'Hydration', true);
		p.hp = 100;
		const move = Dex.getActiveMove('tackle');
		assert.equal(b.runEvent('Damage', p, q, move, 100), 99);
		b.runEvent('SwitchOut', p);
		b.runEvent('SwitchIn', p);
		assert.equal(b.runEvent('Damage', p, q, move, 100), 100);
	});
it('Transform gets passive without permanent species or ability mutation',()=>{const[p,q]=setup();assert(q.transformInto(p));const base=q.baseSpecies,ability=q.ability;b.runEvent('SwitchOut',q);assert.equal(q.species.id,'palafinhero');assert.equal(q.baseSpecies,base);assert.equal(q.ability,ability);assert.deepEqual(q.getPassives(),['zerotohero']);});
it('Hydrapple keeps Hydra Heart slots and entry applies once, even selected Syrup',()=>{assert.deepEqual(Dex.species.get('hydrapple').abilities,{0:'Ripen',1:'Regenerator',H:'Hydra Heart'});const[p,q]=setup('Hydrapple','Supersweet Syrup');assert.deepEqual(p.getPassives(),['supersweetsyrup']);assert.equal(q.boosts.evasion,-1);b.runEvent('SwitchIn',p);assert.equal(q.boosts.evasion,-2);assert(!p.hasAbilityOrPassive('sweetveil'));});
it('shared Syrup removes item protection and Embargo, preserves Dipplin slot',()=>{const a=Dex.abilities.get('supersweetsyrup');assert.equal(a.onTakeItem,undefined);assert.equal(a.onDamagingHit,undefined);assert.equal(Dex.species.get('dipplin').abilities[0],'Supersweet Syrup');const[p,q]=setup('Dipplin','Supersweet Syrup');assert.equal(q.boosts.evasion,-1);p.setItem('Leftovers');assert(p.takeItem(q));});
it('Ripen retains berry healing and positive seed boosts only',()=>{const[p]=setup('Hydrapple','Ripen');p.hp=100;p.maxhp=p.baseMaxhp=1000;assert.equal(b.heal(100,p,p,Dex.items.get('sitrusberry')),200);b.boost({def:1,spe:-1},p,p,Dex.items.get('elementalseed'));assert.equal(p.boosts.def,2);assert.equal(p.boosts.spe,-1);});
it('Syrup Substitute and Misty interactions remain',()=>{const[p,q]=setup('Hydrapple','Ripen');q.boosts.evasion=0;q.addVolatile('substitute');b.runEvent('SwitchIn',p);assert.equal(q.boosts.evasion,0);q.removeVolatile('substitute');b.field.terrain='mistyterrain';b.runEvent('SwitchIn',p);assert.equal(q.boosts.evasion,-1);assert.equal(p.boosts.accuracy,-1);});
});
