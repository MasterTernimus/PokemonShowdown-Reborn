const assert=require('assert').strict, common=require('../../common');
const mon=(species,ability,extra={})=>({species,ability,moves:['splash'],...extra});
describe('Disguise party order and incoming detection',()=>{
 for(const illusion of ['Illusion','Perfect Illusion'])for(const sensor of ['Illuminate','Forewarn','Anticipation']) {
  it(illusion+' gives its owner the preview-selected disguise and '+sensor+' reveals each entry',()=>{
   const b=common.createBattle({formatid:'gen9nofieldsinglesgame'},[
    [mon('Mew','No Ability'),mon('Zoroark',illusion),mon('Pikachu','Static',{name:'Sparky'})],
    [mon('Mew',sensor)],
   ]);
   const notices=[];const send=b.send.bind(b);
   b.send=(type,msg)=>{if(type==='sideupdate'&&typeof msg==='string'&&msg.includes('entered disguised as'))notices.push(msg);return send(type,msg);};
   try {
    b.makeChoices('team 213','team 1');
    const z=b.p1.active[0];assert(!z.illusion);assert(!z.volatiles.illusioncopy);
    assert(notices[0]?.includes('Sparky (Pikachu)'));
    b.makeChoices('switch 2','move splash');
    b.makeChoices('switch 2','move splash');
    assert.equal(b.p1.active[0],z);assert(!z.illusion);assert(!z.volatiles.illusioncopy);
    assert.equal(notices.length,2);assert(notices.every(msg=>msg.startsWith('p1\n')));
    assert(!b.log.some(line=>line.includes('entered disguised as')));
   }finally{b.destroy();}
  });
 }
});
