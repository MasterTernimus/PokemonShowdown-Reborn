'use strict';
const assert=require('assert').strict,common=require('../../common'),{Dex}=require('../../../dist/sim/dex');let battle;
function start(ability,mode='singles',foeAbility='No Ability',item=''){
 const species={ 'Night Watch':'Noctowl','Fruitful Bough':'Tropius','Soul Anchor':'Dhelmise'}[ability];
	const p = { species, ability, item, moves: ['splash', 'anchorshot', 'protect', 'sleeptalk'] }; const t = { species: 'Mew', ability: foeAbility, moves: ['splash', 'swordsdance', 'growl', 'protect'] };
 const team=[p,{...t,ability:'No Ability'},{...t,ability:'No Ability'}],other=[t,{...t},{...t}];
 battle=common.createBattle({formatid:mode==='ffa'?'gen9freeforall4pmistyfieldadrienn':mode==='doubles'?'gen9nofielddoublesbattle':'gen9nofieldsinglesgame'},mode==='ffa'?[team,other,other,other]:[team,other]);battle.makeChoices(...battle.sides.map(()=>mode==='doubles'?'team 123':'team 123'));battle.field.terrain='';battle.randomizer=d=>d;
 for(const side of battle.sides)for(const p of side.active)p.hp=p.maxhp=p.baseMaxhp=1600;
 return[battle.p1.active[0],battle.p2.active[0]];
}
function turn(foe='move splash',own='move splash'){battle.makeChoices(own,foe,...battle.sides.slice(2).map(()=> 'move splash'));}
function hit(p,t,id,extra={}){const m=battle.dex.getActiveMove(id);Object.assign(m,{accuracy:true,willCrit:false},extra);battle.actions.useMove(m,p,{target:t});}
function residual(){battle.fieldEvent('Residual');}
describe('Approved Noctowl, Tropius and Dhelmise abilities',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 it('replaces only exact slots and leaves stats untouched',()=>{
		for (const [id, abilities, stats] of [['noctowl', { 0: 'Duskilate', 1: 'Night Watch', H: 'Lunar Spirit' }, [100, 50, 78, 96, 106, 80]], ['tropius', { 0: 'Fruitful Bough', 1: 'Hospitality', H: 'Windy Surge' }, [115, 90, 95, 75, 95, 70]], ['dhelmise', { 0: 'Water Bubble', 1: 'Blackwater Anchor', H: 'Rocky Payload' }, [85, 135, 110, 60, 100, 40]]]) { assert.deepEqual(Dex.species.get(id).abilities, abilities); assert.deepEqual(Object.values(Dex.species.get(id).baseStats), stats); }
	});
	it('Night Watch retains Insomnia alongside Noctowl’s independent Keen Eye passive', () => {
		const [p, t] = start('Night Watch');
		assert(!p.hasAbility('keeneye'));
		assert(p.hasAbilityOrPassive('keeneye'));
		assert(p.hasAbility('insomnia'));
		assert.equal(p.trySetStatus('slp', t), false);
		assert(!p.addVolatile('yawn', t));
		const m = battle.dex.getActiveMove('darkpulse');
		battle.runEvent('ModifyMove', p, t, m, m);
		assert(m.ignoreEvasion);
		assert.equal(battle.runEvent('BasePower', p, t, m, 1000), 1300);
		battle.boost({ accuracy: -1 }, p, t);
		assert.equal(p.boosts.accuracy, 0);
	});
	// Night Watch now responds to a successful opposing status hit, not repeated self-setup.
	it('Disables the first successful opposing status hit and can respond again', () => {
		const [p, t] = start('Night Watch'); turn('move growl'); assert.equal(t.volatiles.disable.move, 'growl');
		assert.equal(p.boosts.atk, -1);
		t.removeVolatile('disable');
		turn('move splash');
		turn('move growl');
		assert.equal(t.volatiles.disable.move, 'growl'); assert.equal(p.boosts.atk, -2);
	});
	it('ignores repeated self-setup rather than maintaining an observation counter', () => {
		const [p, t] = start('Night Watch'); turn('move swordsdance'); turn('move swordsdance');
		assert.equal(t.boosts.atk, 4); assert(!t.volatiles.disable); assert(!p.volatiles.nightwatchstate);
	});
	it('holder and foe switching do not impose an entry budget', () => {
		const [p, t] = start('Night Watch');
		turn('move growl');
		assert(t.volatiles.disable);
		t.removeVolatile('disable');
		turn('move splash', 'switch 2');
		turn('move splash', 'switch 2');
		turn('move growl');
		assert(t.volatiles.disable);
		turn('switch 2');
		turn('switch 2');
		turn('move growl');
		assert.equal(t.volatiles.disable.move, 'growl');
	});
	it('suppression prevents new responses and removal restores them', () => {
		const [p, t] = start('Night Watch');
		p.addVolatile('gastroacid', t);
		turn('move growl');
		assert(!t.volatiles.disable);
		p.removeVolatile('gastroacid'); turn('move growl'); assert.equal(t.volatiles.disable.move, 'growl');
	});
	it('Aroma Veil prevents Disable after a successful status hit', () => {
		const [p, t] = start('Night Watch', 'singles', 'Aroma Veil'); turn('move growl');
		assert.equal(p.boosts.atk, -1); assert(!t.volatiles.disable);
	});
	it('a protected status target cannot trigger Night Watch', () => {
		const [p, t] = start('Night Watch');
		turn('move growl', 'move protect');
		assert.equal(p.boosts.atk, 0);
		assert(!t.volatiles.disable);
	});
	it('responds separately to both doubles opponents and excludes allies', () => {
		const [p, t] = start('Night Watch', 'doubles'), u = battle.p2.active[1], ally = p.allies()[0];
		battle.makeChoices('move splash, move growl', 'move growl, move growl');
		assert.equal(t.volatiles.disable.move, 'growl'); assert.equal(u.volatiles.disable.move, 'growl'); assert(!ally.volatiles.disable);
	});
	it('responds to every FFA opponent whose status move hits the holder', () => {
		const [p] = start('Night Watch', 'ffa'); battle.makeChoices('move splash', 'move growl', 'move growl', 'move growl');
		for (const foe of p.foes())assert.equal(foe.volatiles.disable.move, 'growl');
	});
	it('Fruitful Bough heals allies on own Berry consumption alongside passive Ripen', () => {
		const [p] = start('Fruitful Bough', 'doubles', '', 'oranberry'), ally = p.allies()[0];
		p.hp = 1000;
		ally.hp = 800;
		assert(p.eatItem());
		assert.equal(p.hp, 1020);
		assert.equal(ally.hp, 1000);
		p.setItem('oranberry');
		assert(p.eatItem());
		assert.equal(ally.hp, 1000);
		battle.turn++;
		p.setItem('oranberry');
		assert(p.eatItem());
		assert.equal(ally.hp, 1200);
	});
	it('Fruitful Bough leaves holder healing to the Ripen-boosted Berry in FFA', () => {
		const [p] = start('Fruitful Bough', 'ffa', '', 'oranberry');
		p.hp = 800;
		for (const foe of p.foes())foe.hp = 800;
		p.eatItem();
		assert.equal(p.hp, 820);
		for (const foe of p.foes())assert.equal(foe.hp, 800);
 });
 it('removal, theft, seed use and foreign berry events do not reward allies',()=>{const[p,t]=start('Fruitful Bough','doubles','','oranberry'),ally=p.allies()[0];ally.hp=800;p.takeItem(t);assert.equal(ally.hp,800);p.setItem('telluricseed');p.useItem();assert.equal(ally.hp,800);battle.runEvent('EatItem',p,t,battle.dex.moves.get('pluck'),battle.dex.items.get('oranberry'));assert.equal(ally.hp,800);});
 it('Unnerve prevents Berry consumption and healing',()=>{const[p]=start('Fruitful Bough','doubles','Unnerve','oranberry');const ally=p.allies()[0];ally.hp=800;assert(!p.eatItem());assert.equal(ally.hp,800);});
 it('suppression and Heal Block prevent Fruitful Bough healing',()=>{const[p,t]=start('Fruitful Bough','doubles','','oranberry'),ally=p.allies()[0];ally.hp=800;p.addVolatile('gastroacid',t);p.eatItem();assert.equal(ally.hp,800);p.removeVolatile('gastroacid');p.setItem('oranberry');ally.addVolatile('healblock',t);p.eatItem();assert.equal(ally.hp,800);});
 it('retains Harvest seed and guaranteed field restoration without rewarding restoration',()=>{const[p]=start('Fruitful Bough','doubles'),ally=p.allies()[0];ally.hp=800;for(const item of ['oranberry','telluricseed']){p.item='';p.lastItem=item;battle.field.terrain='grassyterrain';battle.singleEvent('Residual',p.getAbility(),p.abilityState,p);assert.equal(p.item,item);assert.equal(ally.hp,800);}});
 it('Soul Anchor retains every Steelworker hook and identity',()=>{const[p,t]=start('Soul Anchor');assert(p.hasAbility('steelworker'));const a=p.getAbility(),base=battle.dex.abilities.get('steelworker');for(const key of Object.keys(base).filter(x=>x.startsWith('on')))assert.equal(a[key],base[key],key);});
 it('Anchor Shot creates one tether that drains and heals actual damage',()=>{const[p,t]=start('Soul Anchor');p.hp=800;hit(p,t,'anchorshot');assert(p.volatiles.soulanchortether);t.hp=50;residual();assert.equal(t.hp,0);assert.equal(p.hp,850);});
 it('another successfully trapped foe replaces only the draining tether',()=>{const[p,t]=start('Soul Anchor','doubles'),u=battle.p2.active[1];hit(p,t,'anchorshot');hit(p,u,'anchorshot');p.hp=800;t.hp=u.hp=800;residual();assert.equal(t.hp,800);assert.equal(u.hp,700);assert.equal(p.hp,900);});
 for(const defense of ['Magic Guard','Shield Dust'])it('respects '+defense,()=>{const[p,t]=start('Soul Anchor','singles',defense);hit(p,t,'anchorshot');p.hp=800;t.hp=800;residual();assert.equal(t.hp,800);assert.equal(p.hp,800);});
 for(const mode of ['protect','substitute','ghost','shedshell','miss'])it('does not tether through '+mode,()=>{const[p,t]=start('Soul Anchor');if(mode==='protect'||mode==='substitute')t.addVolatile(mode,t);if(mode==='ghost')t.setType('Ghost');if(mode==='shedshell')t.setItem('shedshell');hit(p,t,'anchorshot',mode==='miss'?{accuracy:0}:{});assert(!p.volatiles.soulanchortether);});
 it('other moves and allied Anchor Shot targets do not tether',()=>{const[p,t]=start('Soul Anchor','doubles');hit(p,t,'spiritshackle');assert(!p.volatiles.soulanchortether);hit(p,p.allies()[0],'anchorshot');assert(!p.volatiles.soulanchortether);});
 it('Soul Anchor suppression pauses damage and healing, Heal Block only stops healing',()=>{const[p,t]=start('Soul Anchor');hit(p,t,'anchorshot');p.hp=t.hp=800;p.addVolatile('gastroacid',t);residual();assert.equal(t.hp,800);p.removeVolatile('gastroacid');p.addVolatile('healblock',t);residual();assert.equal(t.hp,700);assert.equal(p.hp,800);});
 it('either Pokemon leaving ends the drain',()=>{const[p,t]=start('Soul Anchor');hit(p,t,'anchorshot');p.hp=800;turn('move splash','switch 2');assert(!p.volatiles.soulanchortether);assert(!t.volatiles.trapped);});
 it('FFA drains only the tethered foe',()=>{const[p,t]=start('Soul Anchor','ffa');hit(p,t,'anchorshot');p.hp=800;for(const foe of p.foes())foe.hp=800;residual();assert.equal(t.hp,700);assert.equal(p.hp,900);for(const foe of p.foes().filter(x=>x!==t))assert.equal(foe.hp,800);});
 it('Fruitful Bough cannot heal twice across residual restoration or same-turn reentry',()=>{const[p]=start('Fruitful Bough','doubles','','oranberry'),ally=p.allies()[0];ally.hp=800;p.eatItem();assert.equal(ally.hp,1000);battle.field.setWeather('sunnyday',p);battle.fieldEvent('Residual');assert.equal(p.item,'oranberry');p.eatItem();assert.equal(ally.hp,1000);p.clearVolatile();p.isActive=true;p.setItem('oranberry');p.eatItem();assert.equal(ally.hp,1000);});
 it('foreign consumption of the same Berry ID cannot reward Fruitful Bough',()=>{const[p,t]=start('Fruitful Bough','doubles','','oranberry'),ally=p.allies()[0];ally.hp=800;battle.runEvent('EatItem',p,t,battle.dex.moves.get('pluck'),battle.dex.items.get('oranberry'));assert.equal(ally.hp,800);});
 it('a tethered foe escaping ends Soul Anchor',()=>{const[p,t]=start('Soul Anchor');hit(p,t,'anchorshot');t.setItem('shedshell');turn('switch 2');assert(!p.volatiles.soulanchortether);});
 it('suppressed Anchor Shot still traps normally but cannot create a drain tether',()=>{const[p,t]=start('Soul Anchor');p.addVolatile('gastroacid',t);hit(p,t,'anchorshot');assert(t.volatiles.trapped);assert(!p.volatiles.soulanchortether);});

});
