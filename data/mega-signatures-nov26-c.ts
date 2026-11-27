import type { Signature } from './stone-signatures';

function damagedFoe(target: Pokemon, user: Pokemon, move: ActiveMove) {
	return !target.isAlly(user) && (target.getMoveHitData(move).damage || 0) > 0;
}

function oncePerEntry(user: Pokemon, key: string) {
	if (user.m[key] === user.m.ultraRivalryEntryToken) return false;
	user.m[key] = user.m.ultraRivalryEntryToken;
	return true;
}

const pikeCharge: Signature = {
	base: 'megahorn', name: 'Pike Charge', num: 33282,
	desc: '125 power, 100% accuracy. Ignores Reflect if Stamina raised the user’s Defense this turn.',
	changes: { basePower: 125, accuracy: 100 },
};

const sushiSurge: Signature = {
	base: 'muddywater', name: 'Sushi Surge', num: 33293,
	desc: '95 power, 95% accuracy. The first damaging use per entry clears the user’s accuracy drops.',
	changes: {
		basePower: 95, accuracy: 95,
		onAfterHit(target, user, move) {
			if (!damagedFoe(target, user, move) || !oncePerEntry(user, 'sushiSurgeEntry') || user.boosts.accuracy >= 0) return;
			user.setBoost({ accuracy: 0 });
			this.add('-setboost', user, 'accuracy', 0, '[from] move: Sushi Surge');
		},
	},
};

export const MegaSignaturesNov26C: Record<string, Signature> = {
	parasectmega: {
		base: 'leechlife', name: 'Spore Tap', num: 33275,
		desc: '95 power. Drains half the damage dealt, or two-thirds against a foe with a major status.',
		changes: { basePower: 95, onPrepareHit(target, user, move) {
			if (!target.isAlly(user) && target.status) move.drain = [2, 3];
		} },
	},
	pinsirmega: {
		base: 'xscissor', name: 'Horn Shears', num: 33276,
		desc: '95 power. Removes Reflect from the opposing side before damage on a successful hit. High critical-hit ratio.',
		changes: { basePower: 95, onTryHit(target, user) {
			if (!target.isAlly(user)) target.side.removeSideCondition('reflect');
		} },
	},
	pyroarmega: {
		base: 'hypervoice', name: 'Pride Roar', num: 33277,
		desc: '100 power. The first damaging use in sunlight each entry lowers each damaged foe’s Sp. Atk by one stage.',
		changes: { basePower: 100, onAfterHit(target, user, move) {
			if (!damagedFoe(target, user, move) || !['sunnyday', 'desolateland'].includes(user.effectiveWeather())) return;
			const attack = move as ActiveMove & { prideRoar?: boolean };
			attack.prideRoar ??= oncePerEntry(user, 'prideRoarEntry');
			const hit = target.getMoveHitData(move);
			if (!attack.prideRoar || hit.prideRoarApplied) return;
			hit.prideRoarApplied = true;
			this.boost({ spa: -1 }, target, user, move);
		} },
	},
	rayquazamega: {
		base: 'dragonascent', name: 'Skyfall Dive', num: 33278,
		desc: '125 power. Lowers Defense and Sp. Def one stage. On a direct KO only Sp. Def drops.',
		changes: { basePower: 125, onHit(target, user, move) {
			if (!target.hp && damagedFoe(target, user, move)) move.self = { boosts: { spd: -1 } };
		} },
	},
	reuniclusmega: {
		base: 'psychic', name: 'Cell Division', num: 33279,
		desc: '100 power. Ignores Light Screen while the user has raised Defense or Sp. Def.',
		changes: { basePower: 100 },
	},
	roserademega: {
		base: 'gigadrain', name: 'Briar Drain', num: 33280,
		desc: '85 power. Drains half the damage dealt, or three-quarters against a foe affected by Leech Seed.',
		changes: { basePower: 85, onPrepareHit(target, user, move) {
			if (!target.isAlly(user) && target.volatiles.leechseed) move.drain = [3, 4];
		} },
	},
	salazzlemega: {
		base: 'venoshock', name: 'Venom Flash', num: 33281,
		desc: '70 power, doubled by Venoshock’s usual conditions. Damaging a poisoned foe primes the next Fire attack this entry for 15% more power, once per turn.',
		changes: {
			basePower: 70,
			// Resolve the learned move's conditional doubling before Technician checks its power.
			onBasePowerPriority: 31,
			onAfterHit(target, user, move) {
				if (!damagedFoe(target, user, move) || !['tox', 'psn'].includes(target.status) ||
					user.m.venomFlashTurn === this.turn) return;
				user.m.venomFlashTurn = this.turn;
				user.addVolatile('venomflash', user, move);
			},
			condition: {
				noCopy: true,
				onModifyMovePriority: -101,
				onModifyMove(move, user) {
					if (move.category === 'Status' || move.type !== 'Fire') return;
					user.removeVolatile('venomflash');
					const previous = move.onBasePower;
					move.onBasePower = function (bp, source, target, attack) {
						const result = previous?.call(this, bp, source, target, attack);
						this.chainModify(1.15);
						return result;
					};
				},
			},
		},
	},
	scolipedemega: pikeCharge, scolipedemegaazzy: pikeCharge,
	scovillainmega: {
		base: 'seedbomb', name: 'Pepper Burst', num: 33283,
		desc: '95 power. A hit primed by Crossfire also has a 20% chance to burn.',
		changes: { basePower: 95, onPrepareHit(target, user, move) {
			if ((move as ActiveMove & { crossfireBoost?: boolean }).crossfireBoost) {
				move.secondaries = [...(move.secondaries || []), { chance: 20, status: 'brn' }];
			}
		} },
	},
	scraftymega: {
		base: 'drainpunch', name: 'Scrap Knuckle', num: 33284,
		desc: '90 power. Drains half the damage dealt, or two-thirds against a foe with lowered Attack.',
		changes: { basePower: 90, onPrepareHit(target, user, move) {
			if (!target.isAlly(user) && target.boosts.atk < 0) move.drain = [2, 3];
		} },
	},
	slowbromega: {
		base: 'scald', name: 'Shell Kettle', num: 33286,
		desc: '90 power. Reaches 100 after the user takes damage from an opposing attack this turn. Keeps Scald’s burn chance.',
		changes: { basePower: 90, onModifyMove(move, user) {
			if (user.attackedBy.some(hit => hit.thisTurn && typeof hit.damageValue === 'number' && hit.damageValue > 0 &&
				!user.isAlly(hit.source))) move.basePower = 100;
		} },
	},
	staraptormega: {
		base: 'bravebird', name: 'Raptor Dive', num: 33287,
		desc: '125 power. Recoil is one-quarter of damage dealt, or one-fifth on a direct KO.',
		changes: { basePower: 125, recoil: [1, 4], onAfterHit(target, user, move) {
			if (!target.hp && damagedFoe(target, user, move)) move.recoil = [1, 5];
		} },
	},
	starmiemega: {
		base: 'powergem', name: 'Orbit Shards', num: 33288,
		desc: '95 power. The first damaging hit each entry removes Light Screen from the foe’s side after damage.',
		changes: { basePower: 95, onAfterHit(target, user, move) {
			if (damagedFoe(target, user, move) && oncePerEntry(user, 'orbitShardsEntry')) {
				target.side.removeSideCondition('lightscreen');
			}
		} },
	},
	sunfloramega: {
		base: 'solarbeam', name: 'Sunwheel', num: 33289,
		desc: '130 power. Its first use on Grassy Terrain each entry fires immediately. Solar Beam’s weather and field effects apply.',
		changes: { basePower: 130, onTryMove(user, target, move) {
			if (!user.volatiles[move.id] && this.field.isTerrain('grassyterrain') && oncePerEntry(user, 'sunwheelEntry')) return;
			const charge = this.dex.moves.get('solarbeam').onTryMove;
			if (typeof charge === 'function') return charge.call(this, user, target, move);
			return charge;
		} },
	},
	tatsugiricurlymega: sushiSurge, tatsugiridroopymega: sushiSurge, tatsugiristretchymega: sushiSurge,
	weavilemega: {
		base: 'nightslash', name: 'Black Ice', num: 33290,
		desc: '90 power. Reaches 105 against a foe with lowered Speed that stayed in this turn. High critical-hit ratio.',
		changes: { basePower: 90, onPrepareHit(target, user, move) {
			if (!target.isAlly(user) && target.activeTurns && target.boosts.spe < 0) move.basePower = 105;
		} },
	},
	zangoosemega: {
		base: 'crushclaw', name: 'Scar Claw', num: 33291,
		desc: '90 power. Accuracy rises to 100% while the user is poisoned.',
		changes: { basePower: 90, onModifyMove(move, user) {
			if (['tox', 'psn'].includes(user.status)) move.accuracy = 100;
		} },
	},
	zeraoramega: {
		base: 'plasmafists', name: 'Overvolt Fist', num: 33292,
		desc: '110 power. If Electric Terrain or Electric Aura was already active, its first damaging use under that condition each entry clears the user’s Speed drops.',
		changes: { basePower: 110, onModifyMove(move) {
			(move as ActiveMove & { alreadyElectric?: boolean }).alreadyElectric = this.field.isTerrainOrAura('electricterrain');
		}, onAfterHit(target, user, move) {
			if (!(move as ActiveMove & { alreadyElectric?: boolean }).alreadyElectric || !damagedFoe(target, user, move) ||
				!oncePerEntry(user, 'overvoltEntry') || user.boosts.spe >= 0) return;
			user.setBoost({ spe: 0 });
			this.add('-setboost', user, 'spe', 0, '[from] move: Overvolt Fist');
		} },
	},
	zygardemega: {
		base: 'thousandarrows', name: 'Fault Arrows', num: 33294,
		desc: '95 power. Grounding an airborne foe also lowers its Speed by one stage.',
		changes: { basePower: 95, onBasePower(power, user, target, move) {
			target.getMoveHitData(move).faultArrowsAirborne = !target.isGrounded();
		}, onAfterHit(target, user, move) {
			if (damagedFoe(target, user, move) && target.getMoveHitData(move).faultArrowsAirborne && target.isGrounded()) {
				this.boost({ spe: -1 }, target, user, move);
			}
		} },
	},
};
