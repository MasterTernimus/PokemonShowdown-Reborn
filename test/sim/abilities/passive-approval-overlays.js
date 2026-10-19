'use strict';
exports.passives = expected => {
	for (const f of ['latest-passives-approved.json', 'settled-passives-approved.json'])
		for (const [p, ids] of Object.entries(require('./' + f).groups)) for (const id of ids) expected[id] = [p];
	Object.assign(expected, require('./passive-revision-approved.json').overrides);
	expected.grimer = ['liquidooze'];
	expected.muk = ['liquidooze'];
	Object.assign(expected, require('./mega-paused-explicit.json'));
	for (const [id, passive] of Object.entries(require('./mega-approved-choices.json'))) expected[id] = [passive];
	for (const [id, normal] of Object.entries(require('./mega-approved-variants.json'))) if (expected[normal]?.length) expected[id] = expected[normal];
	for (const [id, p] of Object.entries(require('./gmax-approved.json').passives)) expected[id] = [p];
	expected.lapras = ['liquidvoice'];
	expected.yanmega = ['levitate'];
	return expected;
};
exports.abilities = (id, expected) => {
 if(id==='seviper') expected.H="Venam's Kiss";
	if (require('./gmax-approved.json').abilities[id]) return {...require('./gmax-approved.json').abilities[id]};
	if (id === 'mismagiusmega') expected[0] = 'Void Craft';
	for (const [species, slot, , name] of require('./latest-passives-approved.json').slots) if (species === id) expected[slot] = name;
	if (id === 'venusaur') expected.S = 'Uproot';
	if (id === 'lucariomegaz') expected[0] = 'Aura Precision';
	const slots = {lucariomega: ['0', 'Aura Convergence'], kangaskhan: ['1', 'Healer'], froslass: ['0', 'Haunting Veil'], salamencemega: ['0', 'Crescent Rend'], gengarmega: ['0', 'Shadow Double'], scovillainmega: ['0', 'Crossfire']};
	if (slots[id]) expected[slots[id][0]] = slots[id][1];
	return expected;
};

const megaExpected = Object.fromEntries(require('./mega-approved-before.json').map(s => [s.id, s.passives]));
Object.assign(megaExpected, require('./mega-paused-explicit.json'));
for (const [id, passive] of Object.entries(require('./mega-approved-choices.json'))) megaExpected[id] = [passive];
for (const [id, normal] of Object.entries(require('./mega-approved-variants.json'))) if (megaExpected[normal]?.length) megaExpected[id] = megaExpected[normal];
for (const [id, p] of Object.entries(require('./gmax-approved.json').passives)) megaExpected[id] = [p];
megaExpected.lapras = ['liquidvoice'];
megaExpected.yanmega = ['levitate'];
exports.current = (id, fallback) => ({dragonitemega: ['multiscale'], corviknight: ['mirrorarmor']}[id] || megaExpected[id] || fallback);

const shortlist=require('./shortlist-approved.json');
const previousPassives=exports.passives;
exports.passives=expected=>Object.assign(previousPassives(expected),shortlist.passives);
Object.assign(megaExpected,shortlist.passives);
const previousAbilities=exports.abilities;
exports.abilities=(id,expected)=>Object.assign(previousAbilities(id,expected),shortlist.slots[id]||{});

const beforeSilvallyAbilities=exports.abilities;
exports.abilities=(id,expected)=>{const result=beforeSilvallyAbilities(id,expected);if(id==='silvally')delete result.S;return result;};

// Approved gym-signature migration removes only event slots with these exact old values.
const migratedEventAbilities = new Set(["Multipulse","Aquabatics","Fever Pitch","Thunder Raid","Desert's Mark","Super U.M.D. Move","Gale Strike","Spectral Scream","Barbed Web","Cold Truth","Bunraku Beatdown","Matrix Shot","Pyrokinesis","Venam's Kiss","Heavenly Wing","Uproot"]);
const beforeRejuvMoveAbilities = exports.abilities;
exports.abilities = (id, expected) => {
 const result = beforeRejuvMoveAbilities(id, expected);
 for (const slot of ['S', 'E']) if (migratedEventAbilities.has(result[slot])) delete result[slot];
 return result;
};

// Explicit Kingambit migration: replace Entrenched, do not append another passive.
const beforeKingambitPassives = exports.passives;
exports.passives = expected => Object.assign(beforeKingambitPassives(expected), {kingambit: ['supremeoverlord']});
megaExpected.kingambit = ['supremeoverlord'];

const beforeWrathPassives = exports.passives;
exports.passives = expected => Object.assign(beforeWrathPassives(expected), {gyarados: ['intimidate'], honchkrow: ['stakeout']});
megaExpected.gyarados = ['intimidate'];
megaExpected.honchkrow = ['stakeout'];
const beforeOverqwilPassives = exports.passives;
exports.passives = expected => Object.assign(beforeOverqwilPassives(expected), {overqwil: ['aftermath']});
megaExpected.overqwil = ['aftermath'];
const beforeWrathAbilities = exports.abilities;
exports.abilities = (id, expected) => Object.assign(beforeWrathAbilities(id, expected), id === 'gyarados' ? {0: 'Unbridled Wrath'} : {});

const beforeSwiftVenomAbilities = exports.abilities;
exports.abilities = (id, expected) => Object.assign(beforeSwiftVenomAbilities(id, expected), id === 'overqwil' ? {1: 'Swift Venom'} : {});

// Approved starter G-Max and Golisopod passive revisions.
const octoberPassives = {"charizardgmax":["blaze"],"blastoisegmax":["torrent"],"venusaurgmax":["overgrow"],"cinderacegmax":["blaze"],"feraligatrgmax":["torrent"],"rillaboomgmax":["overgrow"],"inteleongmax":["torrent"],"golisopod":["toughclaws"]};
Object.assign(megaExpected, octoberPassives);
const beforeOctoberPassives = exports.passives;
exports.passives = expected => Object.assign(beforeOctoberPassives(expected), octoberPassives);
// Approved Mudsdale and Rhydon ability/passive separation.
Object.assign(megaExpected, {mudsdale: ['stamina'], rhydon: ['powerdrill']});
const beforeMudsdalePassives = exports.passives;
exports.passives = expected => Object.assign(beforeMudsdalePassives(expected), {mudsdale: ['stamina'], rhydon: ['powerdrill']});
const beforeMudsdaleAbilities = exports.abilities;
exports.abilities = (id, expected) => Object.assign(beforeMudsdaleAbilities(id, expected), {mudsdale: {0: 'Unyielding', 1: 'Battle Armor', H: 'Surefoot'}, rhydon: {0: 'Brute Force', 1: 'War Path', H: 'Lightning Rod'}}[id] || {});
// Later approved signature slots and defensive passive corrections.
Object.assign(megaExpected, {beartic: ['thickfat'], archaludon: ['stalwart']});
const beforeSignaturePassives = exports.passives;
exports.passives = expected => Object.assign(beforeSignaturePassives(expected), {beartic: ['thickfat'], archaludon: ['stalwart']});
const beforeSignatureAbilities = exports.abilities;
const signatureSlots = {skarmory: {H: 'Burning Quake'}, kingdra: {H: 'Storm Drain'}, gallade: {S: 'Ruptured Heaven'}, dusknoir: {H: 'Soul Reaver'}, escavalier: {S: 'Ruined Sky'}, talonflame: {S: 'Burning Quake'}, corviknight: {H: 'Steelwing Escort', S: 'Burning Quake'}, sirfetchd: {S: 'Ruined Sky'}, tinkaton: {1: 'Apocalyptic Flame'}};
exports.abilities = (id, expected) => Object.assign(beforeSignatureAbilities(id, expected), signatureSlots[id] || {});

const beforeRoyalAegisAbilities=exports.abilities;
exports.abilities=(id,expected)=>Object.assign(beforeRoyalAegisAbilities(id,expected),id==='nidoqueen'?{H:'Royal Aegis'}:{});

const beforeSilentEchoAbilities=exports.abilities;
exports.abilities=(id,expected)=>Object.assign(beforeSilentEchoAbilities(id,expected),{gliscor:{1:'Silent Hunter'},gliscoralt:{1:'Silent Hunter'},froslassaevian:{1:'Dissonant Echo'}}[id]||{});

// Explicit approved revisions reconciled with their original evidence; no baseline regeneration.
const starterFinish=require('./starter-finish-reviewed.json');
Object.assign(megaExpected,starterFinish.passives);
const beforeStarterFinishAbilities=exports.abilities;
exports.abilities=(id,expected)=>Object.assign(beforeStarterFinishAbilities(id,expected),starterFinish.slots[id]||{});

// Recorded roster revisions, shared by historical scope snapshots. Values are
// fixed expectations from the approved roster, not read from the runtime Dex.
megaExpected.mightyenagrim = ['rattled'];
const reviewedStats = {
 mewtwomegax: [106,195,130,99,100,150],
 mewtwomegay: [106,90,100,199,130,155],
 probopass: [75,35,150,110,155,25],
 stunfisk:[109,66,99,95,109,32],stunfiskgalar:[109,95,109,66,99,32],
 kingdra: [85,105,90,105,90,95],
 mightyena: [90,115,80,60,80,125], mightyenadeso: [90,115,80,60,80,125], mightyenagrim: [90,115,80,60,80,125],
 mightyenamega: [90,140,105,85,100,130],
 cinccinodeso: [75,110,90,60,90,125], toxicroak: [83,121,70,111,70,95], toxicroakdeso: [83,121,70,111,70,95],
 sevipermega: [75,140,120,90,120,65], staraptor: [85,120,80,50,70,105], staraptormega: [85,140,110,60,100,115],
};
exports.stats = (id, fallback) => reviewedStats[id] ? Object.fromEntries(['hp','atk','def','spa','spd','spe'].map((key,i)=>[key,reviewedStats[id][i]])) : fallback;
exports.types = (id, fallback) => id === 'gorebyss' ? ['Water','Fairy'] : fallback;
exports.snapshot = old => ({id: old.id, abilities: exports.abilities(old.id, {...old.abilities}), passives: exports.current(old.id, old.passives), types: exports.types(old.id, old.types), stats: exports.stats(old.id, old.stats)});

// Approved Talonflame swap: one Gale Wings passive, selectable Flame Body.
megaExpected.talonflame = ['galewings'];
const beforeTalonflamePassives = exports.passives;
exports.passives = expected => Object.assign(beforeTalonflamePassives(expected), {talonflame: ['galewings']});
const beforeTalonflameAbilities = exports.abilities;
exports.abilities = (id, expected) => Object.assign(beforeTalonflameAbilities(id, expected), id === 'talonflame' ? {H: 'Flame Body'} : {});

const guardPassives = require('./guard-passives-approved.json');
Object.assign(megaExpected, guardPassives);
const beforeGuardPassives = exports.passives;
exports.passives = expected => Object.assign(beforeGuardPassives(expected), guardPassives);

// Recorded Sandslash revision: artifacts/sandslash-rework/verified-final.json.
const beforeClawAbilities=exports.abilities,beforeClawCurrent=exports.current,clawRevision=require('./sandslash-later-approval.json');
exports.abilities=(id,fallback)=>clawRevision[id]?.abilities||beforeClawAbilities(id,fallback);
exports.current=(id,fallback)=>clawRevision[id]?.passives||beforeClawCurrent(id,fallback);

// Recorded Eeveelution/Cloyster approval: artifacts/eeveelution-cloyster/verified-final.json.
const beforeEeveeCurrent=exports.current;const eeveeCurrent={"jolteon":["voltabsorb"],"flareon":["flashfire"],"vaporeon":["waterabsorb"],"glaceon":["icebody"],"leafeon":["chlorophyll"],"espeon":["magicbounce"],"umbreon":["innerfocus"],"sylveon":["pixilate"],"cloyster":["waterabsorb"]};exports.current=(id,fallback)=>eeveeCurrent[id]||beforeEeveeCurrent(id,fallback);

// Recorded Grand Strategy approval: artifacts/grand-strategy/verified-final.json.
const beforeGrandAbilities=exports.abilities,beforeGrandCurrent=exports.current;exports.abilities=(id,fallback)=>id==='rhydon'?{0:'Grand Strategy',1:'Lightning Rod',H:'Brute Force'}:beforeGrandAbilities(id,fallback);exports.current=(id,fallback)=>id==='rhydon'?['powerdrill']:beforeGrandCurrent(id,fallback);

// Exact later approvals: Mewtwo, Hydreigon, Meloetta, legendary and Primordial checkpoints.
const beforeLaterAbilities=exports.abilities,beforeLaterCurrent=exports.current,laterReviewed=require('./later-reviewed-rosters.json');exports.abilities=(id,fallback)=>laterReviewed[id]?.abilities||beforeLaterAbilities(id,fallback);exports.current=(id,fallback)=>laterReviewed[id]?.passives||beforeLaterCurrent(id,fallback);

const beforeMegaGyaradosRemoval=exports.current;exports.current=(id,original)=>id==='gyaradosmega'?['tempestfury']:beforeMegaGyaradosRemoval(id,original);

const beforeDrillAbilities=exports.abilities,beforeDrillCurrent=exports.current;exports.abilities=(id,fallback)=>{const slots=beforeDrillAbilities(id,fallback);return id==='fearow'?{...slots,0:'Power Drill'}:id==='beedrill'?{...slots,1:'Twin Drills'}:id==='rapidash'?{...slots,H:'Power Drill'}:slots;};exports.current=(id,fallback)=>['dudunsparce','dudunsparcethreesegment'].includes(id)?['powerdrill']:beforeDrillCurrent(id,fallback);

const beforePlainFilter=exports.abilities;exports.abilities=(id,original)=>id==='probopass'?{...beforePlainFilter(id,original),H:'Filter'}:beforePlainFilter(id,original);

const beforeOrdinarySlots=exports.abilities;exports.abilities=(id,original)=>({...beforeOrdinarySlots(id,original),...{"ferrothorn":{"H":"Stamina"},"seismitoad":{"H":"Water Absorb"},"klefki":{"0":"Prankster"}}[id]});

// October 19 review supersedes older slots and passive assignments.
const oct19=require('./oct19-reviewed-rosters.json');
const beforeOct19Abilities=exports.abilities,beforeOct19Current=exports.current;
exports.abilities=(id,fallback)=>({...beforeOct19Abilities(id,fallback),...oct19.abilities[id]});
exports.current=(id,fallback)=>oct19.passives[id]||beforeOct19Current(id,fallback);
