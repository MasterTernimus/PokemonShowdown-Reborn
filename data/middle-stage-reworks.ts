import type {AbilityDataTable} from '../sim/dex-abilities';
import {composeSelectedAbility} from './selected-mega-simplifications';

/** Eviolite remains available; evolved forms are deliberately outside this table. */
export const MiddleStageReworks = {
	shelgon: {stats: [80, 100, 110, 65, 75, 50], slot: '1', ability: 'Dreaming Shell'},
	metang: {stats: [70, 85, 110, 80, 85, 50], slot: 'H', ability: 'Linked Minds'},
	dragonair: {stats: [75, 85, 80, 95, 95, 70], slot: '1', ability: 'Weather Weave'},
	pupitar: {stats: [80, 100, 90, 65, 85, 70], slot: '1', ability: 'Pressure Jet'},
	zweilous: {stats: [82, 105, 85, 65, 85, 68], slot: '1', ability: 'Rival Appetites'},
	sliggoo: {stats: [78, 75, 68, 93, 116, 60], slot: '1', ability: 'Caustic Mucus'},
	sliggoohisui: {stats: [68, 80, 98, 88, 116, 40], slot: '0', ability: 'Iron Solute'},
	gabite: {stats: [78, 100, 85, 60, 75, 92], slot: '0', ability: 'Medicinal Scales'},
	hakamoo: {stats: [70, 95, 100, 65, 85, 75], slot: 'H', ability: 'Castoff Scales'},
} as const;

function firstHitThisEntry(pokemon: Pokemon, key: string) {
	const entry = pokemon.m.ultraRivalryEntryCount || 0;
	if (pokemon.m[key] === entry) return false;
	pokemon.m[key] = entry;
	return true;
}

export function installMiddleStageReworks(abilities: AbilityDataTable) {
	composeSelectedAbility(abilities, 'triplethreat', ['innerfocus', 'keeneye', 'earlybird'], true);
	Object.assign(abilities.triplethreat, {
		flags: {}, shortDesc: 'Inner Focus + Keen Eye + Early Bird.',
		desc: 'Prevents flinching, Intimidate and accuracy drops from other Pokemon. Ignores evasion boosts and reveals opposing Illusions; on Mirror Arena, gains +1 accuracy and Laser Focus. Sleep lasts half as long, rounded down.',
	});
	abilities.longstride = {
		name: 'Long Stride', num: 12068, rating: 3, flags: {},
		shortDesc: 'Striker; foes cannot lower its Speed.',
		desc: 'Kicking moves have 1.4x power. Opposing effects cannot lower its Speed stages.',
		onBasePowerPriority: abilities.striker.onBasePowerPriority,
		onBasePower(power, source, target, move) {
			return this.dex.abilities.get('striker').onBasePower?.call(this, power, source, target, move);
		},
		onTryBoost(boost, target, source) {
			if (source && !source.isAlly(target) && boost.spe && boost.spe < 0 && !this.suppressingAbility(target)) {
				delete boost.spe;
				this.add('-fail', target, 'unboost', 'spe', '[from] ability: Long Stride');
			}
		},
	};
	abilities.dreamingshell = {
		name: 'Dreaming Shell', num: 12069, rating: 3, flags: {breakable: 1},
		shortDesc: 'While asleep, heals 1/16 HP each turn.',
		desc: 'While asleep, restores 1/16 of its maximum HP at turn end.',
		onResidualOrder: 28,
		onResidual(pokemon) {
			if (pokemon.status === 'slp') this.heal(pokemon.baseMaxhp / 16, pokemon);
		},
	};
	abilities.linkedminds = {
		name: 'Linked Minds', num: 12070, rating: 3, flags: {},
		shortDesc: 'Reflect/Light Screen gain +1 priority. Psychic moves gain 20% power.',
		desc: 'Reflect and Light Screen gain +1 priority. Psychic attacks have 1.2x power.',
		onModifyPriority(priority, pokemon, target, move) {
			if (['reflect', 'lightscreen'].includes(move.id)) return priority + 1;
		},
		onBasePower(power, source, target, move) {
			if (move.type === 'Psychic') return this.chainModify(1.2);
		},
	};
	abilities.weatherweave = {
		name: 'Weather Weave', num: 12071, rating: 3, flags: {},
		shortDesc: 'Weather moves gain +1 priority; Weather Ball gains 30% power. No weather damage.',
		desc: 'Rain Dance, Sunny Day, Sandstorm, Hail and Snowscape gain +1 priority. Weather Ball has 1.3x power. Prevents weather damage.',
		onModifyPriority(priority, pokemon, target, move) {
			if (['raindance', 'sunnyday', 'sandstorm', 'hail', 'snowscape'].includes(move.id)) return priority + 1;
		},
		onBasePower(power, source, target, move) {
			if (move.id === 'weatherball') return this.chainModify(1.3);
		},
		onDamage(damage, target, source, effect) {
			if (effect.effectType === 'Weather') return false;
		},
	};
	abilities.pressurejet = {
		name: 'Pressure Jet', num: 12072, rating: 3, flags: {},
		shortDesc: 'First surviving foe hit each entry grants +2 Speed.',
		desc: 'Once per entry, surviving a hit that damages its HP from an opposing attack grants +2 Speed.',
		onDamagingHit(damage, target, source) {
			if (damage > 0 && target.hp && !source.isAlly(target) && firstHitThisEntry(target, 'pressureJetEntry')) {
				this.boost({spe: 2}, target, target, this.effect);
			}
		},
	};
	abilities.rivalappetites = {
		name: 'Rival Appetites', num: 12073, rating: 3, flags: {},
		shortDesc: 'Biting attacks heal 25% of damage dealt.',
		desc: 'Biting attacks drain 25% of damage dealt. Existing draining effects use the higher fraction instead of stacking.',
		onModifyMove(move) {
			if (move.category !== 'Status' && move.flags.bite && (!move.drain || move.drain[0] / move.drain[1] < 0.25)) {
				move.drain = [1, 4];
			}
		},
	};
	abilities.causticmucus = {
		name: 'Caustic Mucus', num: 12074, rating: 3, flags: {},
		shortDesc: 'Contact attackers lose 1 Sp. Def, once per attack.',
		desc: 'An opposing contact attack that damages its HP lowers the attacker’s Sp. Def by 1, once per attack.',
		onDamagingHit(damage, target, source, move) {
			const token = this.activeMove || move;
			if (damage <= 0 || !source.hp || source.isAlly(target) || target.m.causticMucusMove === token ||
				!this.checkMoveMakesContact(move, source, target)) return;
			target.m.causticMucusMove = token;
			this.boost({spd: -1}, source, target, this.effect);
		},
	};
	abilities.ironsolute = {
		name: 'Iron Solute', num: 12075, rating: 3, flags: {breakable: 1},
		shortDesc: 'Takes half Water damage; surviving a foe Water attack grants +1 Defense.',
		desc: 'Water attacks deal half damage. Surviving a foe’s Water hit that damages its HP grants +1 Defense, once per attack.',
		onSourceModifyDamage(damage, source, target, move) {
			if (move.type === 'Water') return this.chainModify(0.5);
		},
		onDamagingHit(damage, target, source, move) {
			const token = this.activeMove || move;
			if (damage > 0 && target.hp && !source.isAlly(target) && move.type === 'Water' && target.m.ironSoluteMove !== token) {
				target.m.ironSoluteMove = token;
				this.boost({def: 1}, target, target, this.effect);
			}
		},
	};
	abilities.medicinalscales = {
		name: 'Medicinal Scales', num: 12076, rating: 3, flags: {},
		shortDesc: 'On entry, cures its own and active allies’ major status.',
		desc: 'On entry, cures major status on itself and its active allies.',
		onStart(pokemon) {
			for (const ally of [pokemon, ...pokemon.allies()]) {
				if (ally.hp && ally.status) ally.cureStatus();
			}
		},
	};
	abilities.castoffscales = {
		name: 'Castoff Scales', num: 12077, rating: 3, flags: {},
		shortDesc: 'First surviving foe physical hit each entry: +1 Attack/Speed, -1 Defense.',
		desc: 'Once per entry, surviving a physical hit that damages its HP from a foe grants +1 Attack and Speed, but lowers Defense by 1.',
		onDamagingHit(damage, target, source, move) {
			if (damage > 0 && target.hp && !source.isAlly(target) && move.category === 'Physical' &&
				firstHitThisEntry(target, 'castoffScalesEntry')) this.boost({atk: 1, spe: 1, def: -1}, target, target, this.effect);
		},
	};
}
