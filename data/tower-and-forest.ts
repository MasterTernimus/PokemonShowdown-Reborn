import type { AbilityData, AbilityDataTable } from '../sim/dex-abilities';

export const towerSlots = {
	lugia: { 0: 'Silver Wing Canticle', 1: 'Tidal Bell Echo', H: 'Whirl Islands Oath' },
	hooh: { 0: 'Rainbow Wing Canticle', 1: 'Clear Bell Echo', H: 'Burned Tower Oath' },
	celebi: { 0: 'Ilex Shrine', 1: 'Voice of Tomorrow', H: 'Time Slip' },
};

function canticle(signature: string, defense: 'def' | 'spd'): Partial<AbilityData> {
	return {
		condition: { noCopy: true },
		onBasePower(basePower, source, target, move) {
			if (move.id === signature) return this.chainModify(1.2);
		},
		onSourceDamagingHit(damage, target, source, move) {
			if (!damage || !source.hp || source.isAlly(target) || move.id !== signature) return;
			if (source.volatiles[this.effect.id]) return;
			source.addVolatile(this.effect.id, source, this.effect);
			this.boost({ [defense]: 1 }, source, source, this.effect);
		},
	};
}

function bellEcho(type: string): Partial<AbilityData> {
	return {
		onSourceDamagingHit(damage, target, source, move) {
			if (!damage || !source.hp || source.isAlly(target) || source.m.bellEchoTurn === this.turn) return;
			if (!this.movehasType(move, ['Flying', type])) return;
			source.m.bellEchoTurn = this.turn;
			for (const recipient of [source, ...source.adjacentAllies()]) {
				if (recipient.hp) this.heal(recipient.baseMaxhp / 16, recipient, source, this.effect);
			}
		},
	};
}

function towerOath(screen: 'lightscreen' | 'reflect'): Partial<AbilityData> {
	return {
		onDamagingHit(damage, target, source) {
			if (!damage || !target.hp || target.hp * 2 > target.maxhp || target.isAlly(source) || target.m.towerOathUsed) return;
			if (target.side.getSideCondition(screen) || !target.side.addSideCondition(screen, target, this.effect)) return;
			target.side.sideConditions[screen].duration = 3;
			target.m.towerOathUsed = true;
		},
	};
}

export const towerAbilities: AbilityDataTable = {
	silverwingcanticle: {
		name: 'Silver Wing Canticle', num: 32700, rating: 4, flags: {},
		shortDesc: '1.2× Aeroblast power. Its first damaging hit each entry gives +1 Sp. Def.',
		desc: 'Aeroblast has 1.2× power. The first time each entry that Aeroblast damages a foe, the user gains one Special Defense stage.',
		...canticle('aeroblast', 'spd'),
	},
	tidalbellecho: {
		name: 'Tidal Bell Echo', num: 32701, rating: 4, flags: {},
		shortDesc: 'Water or Flying hits heal the user and adjacent allies by 1/16 HP once per turn.',
		desc: 'Once per turn, after a Water or Flying attack damages a foe, the user and each adjacent ally recover 1/16 of their own maximum HP.',
		...bellEcho('Water'),
	},
	whirlislandsoath: {
		name: 'Whirl Islands Oath', num: 32702, rating: 4, flags: {},
		shortDesc: 'Surviving a foe’s hit at half HP or less sets 3-turn Light Screen once per battle.',
		desc: 'Once per battle, after surviving an opposing attack at half HP or less, sets Light Screen for three turns. An existing Light Screen preserves this use.',
		...towerOath('lightscreen'),
	},
	rainbowwingcanticle: {
		name: 'Rainbow Wing Canticle', num: 32703, rating: 4, flags: {},
		shortDesc: '1.2× Sacred Fire power. Its first damaging hit each entry gives +1 Defense.',
		desc: 'Sacred Fire has 1.2× power. The first time each entry that Sacred Fire damages a foe, the user gains one Defense stage.',
		...canticle('sacredfire', 'def'),
	},
	clearbellecho: {
		name: 'Clear Bell Echo', num: 32704, rating: 4, flags: {},
		shortDesc: 'Fire or Flying hits heal the user and adjacent allies by 1/16 HP once per turn.',
		desc: 'Once per turn, after a Fire or Flying attack damages a foe, the user and each adjacent ally recover 1/16 of their own maximum HP.',
		...bellEcho('Fire'),
	},
	burnedtoweroath: {
		name: 'Burned Tower Oath', num: 32705, rating: 4, flags: {},
		shortDesc: 'Surviving a foe’s hit at half HP or less sets 3-turn Reflect once per battle.',
		desc: 'Once per battle, after surviving an opposing attack at half HP or less, sets Reflect for three turns. An existing Reflect preserves this use.',
		...towerOath('reflect'),
	},
	ilexshrine: {
		name: 'Ilex Shrine', num: 32706, rating: 4, flags: {},
		shortDesc: '1.2× Grass power. A Grass hit cures one adjacent ally or the user once per turn.',
		desc: 'Grass attacks have 1.2× power. Once per turn, a Grass attack that damages a foe cures a major status on the first afflicted adjacent ally, or on the user if it has no afflicted adjacent ally.',
		onBasePower(basePower, source, target, move) {
			if (this.movehasType(move, 'Grass')) return this.chainModify(1.2);
		},
		onSourceDamagingHit(damage, target, source, move) {
			if (!damage || !source.hp || source.isAlly(target) || !this.movehasType(move, 'Grass')) return;
			if (source.m.ilexShrineTurn === this.turn) return;
			const recipient = source.adjacentAllies().find(ally => ally.hp && ally.status) || source;
			if (recipient.status && recipient.cureStatus()) source.m.ilexShrineTurn = this.turn;
		},
	},
	voiceoftomorrow: {
		name: 'Voice of Tomorrow', num: 32707, rating: 4, flags: {},
		shortDesc: 'Future Sight has 1.25× power, even after the user switches out.',
		desc: 'A Future Sight set by the user has 1.25× its usual power when it strikes the targeted position, even if the user has switched out.',
		onModifyMove(move) {
			if (move.id !== 'futuresight' || typeof move.onTry !== 'function') return;
			const schedule = move.onTry;
			move.onTry = function (source, target, attack) {
				const slot = target.side.slotConditions[target.position];
				const previous = slot.futuremove;
				const result = schedule.call(this, source, target, attack);
				const future = slot.futuremove;
				if (future && previous !== future && future.source === source && future.move === 'futuresight') {
					future.moveData.basePower = this.modify(future.moveData.basePower, 1.25);
				}
				return result;
			};
		},
	},
	timeslip: {
		name: 'Time Slip', num: 32708, rating: 4, flags: {},
		shortDesc: 'Surviving a foe’s hit at half HP or less heals 1/4 HP and clears stat drops once per battle.',
		desc: 'Once per battle, after surviving an opposing attack at half HP or less, restores 1/4 max HP and clears all negative stat stages.',
		onDamagingHit(damage, target, source) {
			if (!damage || !target.hp || target.hp * 2 > target.maxhp || target.isAlly(source) || target.m.timeSlipUsed) return;
			target.m.timeSlipUsed = true;
			this.heal(target.baseMaxhp / 4, target, target, this.effect);
			const drops = (Object.keys(target.boosts) as BoostID[]).filter(stat => target.boosts[stat] < 0);
			if (drops.length) {
				for (const stat of drops) target.boosts[stat] = 0;
				this.add('-clearnegativeboost', target, '[from] ability: Time Slip');
			}
		},
	},
};
