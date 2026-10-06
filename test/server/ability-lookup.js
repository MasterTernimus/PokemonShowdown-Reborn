'use strict';
const assert=require('assert').strict;
const {Dex}=require('../../dist/sim/dex');
const {getAbilityDisplayComponents}=require('../../dist/data/ability-display');
const {getAbilityMechanicsHTML}=require('../../dist/server/ability-lookup');
describe('Ability descriptions and full command lookup',function () {
 this.timeout(10000);
 it('keeps all compact summaries separate from canonical component details',()=>{
  let count=0;for(const a of Dex.abilities.all()){const parts=getAbilityDisplayComponents(a.id);if(!parts.length)continue;count++;assert(a.shortDesc);assert(!/Proficient/i.test(a.shortDesc));const html=getAbilityMechanicsHTML(a,Dex);for(const id of parts)assert(html.includes('/dt '+Dex.abilities.get(id).name+', gen9'));}assert(count>450);
 });
 it('does not advertise stale Filter identity as Burning Crown mechanics',()=>{
  const a=Dex.abilities.get('burningcrown');
  assert(!a.shortDesc.includes('Filter'));assert(!a.desc.includes('Filter'));
		for (const id of getAbilityDisplayComponents('burningcrown'))assert(getAbilityMechanicsHTML(a,Dex).includes(Dex.abilities.get(id).name));
		assert(!getAbilityDisplayComponents('burningcrown').includes('proficient'));
  assert(a.desc.includes('20% less'));assert(a.desc.includes('1/16'));assert(a.desc.includes('1.3x'));
 });
 it('renders full Heavy Artillery mechanics, format conditions and component lookup buttons',()=>{
  const a=Dex.abilities.get('heavyartillery'),html=getAbilityMechanicsHTML(a,Dex);
  assert(html.includes('designated primary target'));assert(html.includes('Free-for-All'));assert(html.includes('protection or immunity'));
  assert(html.includes('value="/dt Unaware, gen9"'));assert(html.includes('value="/dt Shell Armor, gen9"'));
  assert(!a.shortDesc.includes('Unaware + Shell Armor'));
 });
 it('keeps new signature full descriptions and renders safe plain text',()=>{
  const a=Dex.abilities.get('dreepyvanguard');assert(a.desc.includes('after both darts finish'));
  assert(getAbilityMechanicsHTML({...a,desc:'<script>alert("x")</script>'},Dex).includes('&lt;script&gt;'));
 });
 it('exposes Soul Cremation timing and separate caps plus the new component',()=>{
  const a=Dex.abilities.get('soulcremation'),html=getAbilityMechanicsHTML(a,Dex);
  assert(a.desc.includes('1/6 max HP'));
  for(const s of ['Soul Siphon','Malice Well','Soul Pyre','separate','following turn','Volcanic','Cold Eclipse'])assert(html.includes(s),s);
 });
});
