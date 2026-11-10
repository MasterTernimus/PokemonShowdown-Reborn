import type { AbilityDataTable } from '../sim/dex-abilities';
export const UltraBeastSlots: { [id: string]: { 0: string, 1: string, H: string } } = {
	nihilego: { 0: 'Levitate', 1: 'Liquid Ooze', H: 'Nerve Parasite' },
	buzzwole: { 0: 'Iron Fist', 1: 'Guts', H: 'Siphon Muscle' },
	pheromosa: { 0: 'Limber', 1: 'Quick Feet', H: 'Immaculate Form' },
	xurkitree: { 0: 'Motor Drive', 1: 'Illuminate', H: 'Live Circuit' },
	celesteela: { 0: 'Heavy Metal', 1: 'Heatproof', H: 'Launch Chamber' },
	kartana: { 0: 'Sharpness', 1: 'Hyper Cutter', H: 'Paper Aegis' },
	guzzlord: { 0: 'Gluttony', 1: 'Strong Jaw', H: 'Endless Gullet' },
	poipole: { 0: 'Prankster', 1: 'Poison Point', H: 'Toxic Canvas' },
	naganadel: { 0: 'Sniper', 1: 'Infiltrator', H: 'Queen Venom' },
	stakataka: { 0: 'Sturdy', 1: 'Clear Body', H: 'Living Rampart' },
	blacephalon: { 0: 'Aftermath', 1: 'Flash Fire', H: 'Last Firework' },
};
export const UltraBeastDescriptions: Record<string, { shortDesc: string, desc: string }> = {};
const effects: Record<string, string> = {
	nerveparasite: 'Poison moves gain 20% power against foes with a major status.',
	siphonmuscle: 'Draining moves gain 20% power.',
	immaculateform: 'Bug moves gain 20% power at full HP.',
	livecircuit: 'Damaging Electric hits heal 1/16 HP once per turn.',
	launchchamber: 'Fire moves gain 20% power.',
	paperaegis: 'The first special attack to damage its HP each entry deals 20% less damage.',
	endlessgullet: 'Knocking out a foe with a move heals 1/8 HP once per turn.',
	toxiccanvas: 'The first damaging Poison hit each entry lowers the foe’s accuracy by 1.',
	queenvenom: 'Dragon moves gain 20% power against poisoned foes.',
	livingrampart: 'Rock and Steel moves gain 20% power while its Defense is boosted.',
	lastfirework: 'Fire and Ghost moves gain 20% power at half HP or less.',
};
for (const [id, text] of Object.entries(effects)) UltraBeastDescriptions[id] = { shortDesc: text, desc: text };
export function installUltraBeasts(a: AbilityDataTable) {
	for (const [index, slots] of Object.values(UltraBeastSlots).entries()) {
		const id = slots.H.toLowerCase().replace(/[^a-z0-9]/g, '') as ID;
		a[id] = { name: slots.H,
			num: 12330 + index,
			rating: 3,
			flags: id === 'paperaegis' ? { breakable: 1 } : {},
			...UltraBeastDescriptions[id] };
	}
	const powerChecks: Record<string, (battle: Battle, source: Pokemon, target: Pokemon, move: ActiveMove) => boolean> = {
		nerveparasite: (b, s, t, m) => b.movehasType(m, 'Poison') && !!t.status && !s.isAlly(t),
		siphonmuscle: (b, s, t, m) => !!m.drain,
		immaculateform: (b, s, t, m) => s.hp === s.maxhp && b.movehasType(m, 'Bug'),
		launchchamber: (b, s, t, m) => b.movehasType(m, 'Fire'),
		queenvenom: (b, s, t, m) => b.movehasType(m, 'Dragon') && ['psn', 'tox'].includes(t.status) && !s.isAlly(t),
		livingrampart: (b, s, t, m) => s.boosts.def > 0 && (b.movehasType(m, 'Rock') || b.movehasType(m, 'Steel')),
		lastfirework: (b, s, t, m) => s.hp <= s.maxhp / 2 && (b.movehasType(m, 'Fire') || b.movehasType(m, 'Ghost')),
	};
	for (const [id, check] of Object.entries(powerChecks)) {
		a[id as ID].onBasePowerPriority = 21;
		a[id as ID].onBasePower = function (power, source, target, move) {
			if (check(this, source, target, move)) return this.chainModify(1.2);
		};
	}
	a.livecircuit.onSourceDamagingHit = function (damage, target, source, move) {
		if (damage <= 0 || !source.hp || source.isAlly(target) || !this.movehasType(move, 'Electric') || source.m.liveCircuitTurn === this.turn) return;
		source.m.liveCircuitTurn = this.turn;
		this.heal(source.baseMaxhp / 16, source, source, this.effect);
	};
	a.paperaegis.onSourceModifyDamage = function (damage, source, target, move) {
		if (source.isAlly(target) || move.category !== 'Special') return;
		const hit = target.getMoveHitData(move) as any;
		hit.paperAegis ??= !target.m.paperAegisSpent;
		if (hit.paperAegis) return this.chainModify(0.8);
	};
	a.paperaegis.onDamagingHit = function (damage, target, source, move) {
		if (damage > 0 && !source.isAlly(target) && move.category === 'Special') target.m.paperAegisSpent = true;
	};
	a.endlessgullet.onSourceAfterFaint = function (length, target, source, effect) {
		if (!source.hp || source.isAlly(target) || effect?.effectType !== 'Move' || source.m.endlessGulletTurn === this.turn) return;
		source.m.endlessGulletTurn = this.turn;
		this.heal(source.baseMaxhp / 8, source, source, this.effect);
	};
	a.toxiccanvas.onSourceDamagingHit = function (damage, target, source, move) {
		if (damage <= 0 || !target.hp || source.isAlly(target) || !this.movehasType(move, 'Poison') || source.m.toxicCanvasSpent) return;
		source.m.toxicCanvasSpent = true;
		this.boost({ accuracy: -1 }, target, source, this.effect);
	};
}
