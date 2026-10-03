'use strict';
const assert=require('assert').strict;
const {Dex}=require('../../dist/sim/dex');
const {getAbilityDisplayComponents}=require('../../dist/data/ability-display');
const {getAbilityMechanicsHTML}=require('../../dist/server/ability-lookup');
describe('Ability descriptions and full command lookup',function () {
 this.timeout(10000);
 it('names every registered/display component in all effective compact summaries',()=>{
  let count=0;
  for(const ability of Dex.abilities.all()) {
   const parts=getAbilityDisplayComponents(ability.id); if(!parts.length)continue; count++;
			if (ability.id === 'sushitrick') {
				assert.equal(ability.shortDesc, 'On entry, heals adjacent allies by 1/4 max HP and cures confusion.');
				assert.deepEqual(parts, ['hospitality']);
				continue;
			}
   for(const id of parts) assert(ability.shortDesc.toLowerCase().includes(Dex.abilities.get(id).name.toLowerCase()),`${ability.id}: ${id}`);
  }
  assert(count>330);
 });
 it('does not advertise stale Filter identity as Burning Crown mechanics',()=>{
  const a=Dex.abilities.get('burningcrown');
  assert(!a.shortDesc.includes('Filter'));assert(!a.desc.includes('Filter'));
		for (const id of getAbilityDisplayComponents('burningcrown'))assert(a.shortDesc.includes(Dex.abilities.get(id).name));
		for (const n of ['Intimidate', 'White Smoke', 'Mold Breaker', 'Unbound Blaze', 'Self Sufficient', 'Proficient'])assert(a.desc.includes(n));
  assert(a.desc.includes('20% less'));assert(a.desc.includes('1/16'));assert(a.desc.includes('1.3x'));
 });
 it('renders full Heavy Artillery mechanics, format conditions and component lookup buttons',()=>{
  const a=Dex.abilities.get('heavyartillery'),html=getAbilityMechanicsHTML(a,Dex);
  assert(html.includes('designated primary target'));assert(html.includes('Free-for-All'));assert(html.includes('protection or immunity'));
  assert(html.includes('value="/dt Unaware, gen9"'));assert(html.includes('value="/dt Shell Armor, gen9"'));
  assert(a.shortDesc.includes('Unaware + Shell Armor'));
 });
 it('keeps new signature full descriptions and renders safe plain text',()=>{
  const a=Dex.abilities.get('dreepyvanguard');assert(a.desc.includes('after both darts finish'));
  assert(getAbilityMechanicsHTML({...a,desc:'<script>alert("x")</script>'},Dex).includes('&lt;script&gt;'));
 });
 it('exposes Soul Cremation timing and separate caps plus the new component',()=>{
  const a=Dex.abilities.get('soulcremation'),html=getAbilityMechanicsHTML(a,Dex);
  for(const s of ['Soul Siphon','Flame Body','Soul Pyre','one-sixth','base maximum HP','separate','following turn','Volcanic','Cold Eclipse'])assert(html.includes(s),s);
 });
});
