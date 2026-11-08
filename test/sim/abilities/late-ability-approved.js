'use strict';
const assert=require('assert').strict,common=require('../../common'),{Dex}=require('../../../dist/sim');let battle;
const mon=(ability='No Ability',species='Mew')=>({species,ability,moves:['splash','tackle','poisonjab','solarbeam']});
function setup(ability = 'Fortunate Wing', gameType = 'doubles', allyAbility = 'No Ability', allySpecies = 'Mew') {
	battle = common.createBattle({ gameType }, [[mon(ability), mon(allyAbility, allySpecies), mon()], [mon(), mon(), mon()]]);
	if (battle.requestState === 'teampreview')battle.makeChoices();
	battle.field.terrain = '';
	return [battle.p1.active[0], battle.p1.active[1], battle.p2.active[0]];
}
function modify(source,target,id='scald'){const m=Dex.getActiveMove(id);battle.runEvent('ModifyMove',source,target,m,m);return m;}
function hit(p,q,id='poisonjab',extra={}){battle.actions.runMove(Object.assign(Dex.getActiveMove(id),{accuracy:true,willCrit:false,secondaries:null,damage:100},extra),p,p.getLocOf(q));}
describe('Latest field and allied ability approvals',()=>{afterEach(()=>{battle?.destroy();battle=null;});
	it('Void Omen no longer grants secondary boosts but still blocks confusion for its side', () => {
		const [p, a, q] = setup('Void Omen');
		assert.equal(modify(p, q).secondaries[0].chance, 30);
		assert.equal(modify(a, q).secondaries[0].chance, 30);
		assert(!p.addVolatile('confusion', q));
		assert(!a.addVolatile('confusion', q));
		assert(q.addVolatile('confusion', p));
	});
	for (const [field, power] of [['rockyterrain', 1500], ['coldeclipseterrain', 1500], ['desertterrain', 1300], ['', 1000]])it('Relentless Hunt once in ' + field, () => {
		const [p, a, q] = setup('Relentless Hunt');
		battle.field.terrain = field;
		assert.equal(battle.runEvent('BasePower', p, q, Dex.getActiveMove('tackle'), 1000), power);
		const move = Object.assign(Dex.getActiveMove('tackle'), { basePower: 80 });
		assert.equal(battle.runEvent('ModifyPriority', p, q, move, 0), field === 'coldeclipseterrain' ? 1 : 0);
	});
	for (const [ability, species] of [['No Ability', 'Mew'], ['Serene Grace', 'Mew'], ['Fortunate Wing', 'Mew'], ['No Ability', 'Togekiss'], ['Serene Grace', 'Togekiss']])it('Fortunate Wing grant deduplicates ' + ability + '/' + species, () => {
		const [p, a, q] = setup('Fortunate Wing', 'doubles', ability, species);
		assert.equal(modify(a, q).secondaries[0].chance, 60);
		assert.equal(!!modify(a, q, 'solarbeam').flags.charge, true);
		assert.equal(modify(q, a).secondaries[0].chance, 30);
	});
	it('multiple providers do not multiply the ally grant', () => {
		const [p, a, q] = setup('Fortunate Wing', 'triples', 'Fortunate Wing');
		const ally = battle.p1.active[2];
		assert.equal(modify(ally, q).secondaries[0].chance, 60);
		assert(modify(ally, q, 'solarbeam').flags.charge);
		/* Serene Grace does not remove charging turns. */ });
	for (const kind of ['suppression', 'switch', 'faint'])it('Fortunate Wing grant ends on ' + kind, () => {
		const [p, a, q] = setup();
		if (kind === 'suppression')p.addVolatile('gastroacid', q);
		if (kind === 'switch') {
			battle.makeChoices('switch 3, move splash', 'move splash, move splash');
		}
		if (kind === 'faint') {
			p.faint();
			battle.faintMessages();
		}
		assert.equal(modify(a, q).secondaries[0].chance, 30);
		assert(modify(a, q, 'solarbeam').flags.charge);
	});
	it('no allied grant in FFA', () => {
		battle = common.createBattle({ gameType: 'freeforall' }, [[mon('Fortunate Wing')], [mon()], [mon()], [mon()]]);
		if (battle.requestState === 'teampreview')battle.makeChoices();
		battle.field.terrain = '';
		assert.equal(modify(battle.p2.active[0], battle.p3.active[0]).secondaries[0].chance, 30);
	});
	it('Void Omen still skips an actual charge turn for an ally', () => {
		const [p, a, q] = setup('Void Omen');
		const hp = q.hp;
		hit(a, q, 'solarbeam');
		assert(q.hp < hp);
		assert(!a.volatiles.twoturnmove);
	});
 it('Venom Bastion applies one short seal after the whole attack, retaining budget across restarts',()=>{const[p,a,q]=setup('Venom Bastion');q.hp=q.maxhp=q.baseMaxhp=1000;q.status='psn';const during=[];hit(p,q,'poisonjab',{multihit:3,onAfterHit(){during.push(!!q.volatiles.healblock);}});assert.deepEqual(during,[false,false,false]);assert.equal(q.volatiles.healblock.duration,2);assert(p.m.venomBastionSealUsed);q.removeVolatile('healblock');p.setAbility('No Ability');p.setAbility('Venom Bastion');hit(p,q);assert(!q.volatiles.healblock);});
 for(const kind of ['healthy','substitute','ally','residual','faint','blocked','existing','suppressed','newPoison'])it('Venom Bastion excludes '+kind,()=>{const[p,a,q]=setup('Venom Bastion');q.hp=q.maxhp=q.baseMaxhp=1000;q.status=kind==='healthy'||kind==='newPoison'?'':'psn';if(kind==='substitute'){q.addVolatile('substitute');q.volatiles.substitute.hp=1000;}if(kind==='blocked')q.setAbility('Aroma Veil');if(kind==='existing'){q.addVolatile('healblock',p);q.volatiles.healblock.duration=4;}if(kind==='suppressed')p.addVolatile('gastroacid',q);if(kind==='residual')battle.damage(100,q,p,Dex.conditions.get('psn'));else hit(kind==='ally'?a:p,kind==='ally'?p:q,'poisonjab',kind==='faint'?{damage:1000}:kind==='newPoison'?{multihit:2,secondaries:[{chance:100,status:'psn'}]}:{});assert(!p.m.venomBastionSealUsed);assert.equal(q.volatiles.healblock?.duration,kind==='existing'?4:undefined);});
});
