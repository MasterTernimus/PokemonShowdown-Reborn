import type { Signature } from './stone-signatures';

function damagedFoe(target: Pokemon, source: Pokemon, move: ActiveMove) {
	return !source.isAlly(target) && (target.getMoveHitData(move).damage || 0) > 0;
}

function takeEntryUse(source: Pokemon, key: string) {
	if (source.m[key] === source.previouslySwitchedIn) return false;
	source.m[key] = source.previouslySwitchedIn;
	return true;
}

function psychicField(battle: Battle, source: Pokemon) {
	return battle.field.isTerrain('psychicterrain') && source.canBenefitFromTerrain() ||
		battle.field.isAura('psychicterrain');
}

const fleurSalvo: Signature = {
	base: 'fleurcannon', name: 'Fleur Salvo', num: 33250,
	desc: '130 power and 100% accuracy. Lowers Sp. Atk by one stage on a knockout, otherwise by two.',
	changes: { accuracy: 100 },
};

export const MegaSignaturesNov26B: Record<string, Signature> = {
	floettemega: {
		base: 'lightofruin', name: 'Last Blossom', num: 33240,
		desc: '140 power and 100% accuracy. Recoil is one third of damage dealt, or one quarter on Bewitched Woods.',
		changes: { accuracy: 100, recoil: [1, 3], onModifyMove(move) {
			if (this.field.isTerrain('bewitchedwoodsterrain')) move.recoil = [1, 4];
		} },
	},
	froslassaevianmega: {
		base: 'waterpulse', name: 'Siren Chime', num: 33241,
		desc: 'An 80-power sound pulse that passes through Substitute and retains Water Pulse’s confusion chance.',
		changes: { basePower: 80, onModifyMove(move) { move.flags = { ...move.flags, sound: 1, bypasssub: 1 }; } },
	},
	froslassmega: {
		base: 'shadowball', name: 'Widow Wail', num: 33242,
		desc: '95 power. Once per entry, hitting a foe with a disabled move lowers its Speed one stage.',
		changes: { basePower: 95, onAfterHit(target, source, move) {
			const disabled = target.volatiles.disable || target.moveSlots.some(slot => slot.disabled);
			if (target.hp && damagedFoe(target, source, move) && disabled &&
				takeEntryUse(source, 'widowWailEntry')) this.boost({ spe: -1 }, target, source, move);
		} },
	},
	glalieaevianmega: {
		base: 'rockslide', name: 'Crag Slide', num: 33243,
		desc: '90 power. Reaches 100% accuracy while the user has a positive Defense stage.',
		changes: { basePower: 90, onModifyMove(move, source) { if (source.boosts.def > 0) move.accuracy = 100; } },
	},
	glaliemega: {
		base: 'icefang', name: 'Frost Splitter', num: 33244,
		desc: '90 power. A damaging bite lowers a burned foe’s Speed one stage, once per use.',
		changes: { basePower: 90, onAfterHit(target, source, move) {
			const hit = target.getMoveHitData(move) as { frostSplitterUsed?: boolean };
			if (target.hp && target.status === 'brn' && damagedFoe(target, source, move) && !hit.frostSplitterUsed) {
				hit.frostSplitterUsed = true;
				this.boost({ spe: -1 }, target, source, move);
			}
		} },
	},
	gyaradosaevianmega: {
		base: 'flamethrower', name: 'Solar Coil', num: 33245,
		desc: '100 power. In sun, the first damaging hit per entry traps its foe through the following turn.',
		changes: { basePower: 100, onAfterHit(target, source, move) {
			if (!target.hp || !damagedFoe(target, source, move) ||
				!['sunnyday', 'desolateland'].includes(source.effectiveWeather()) ||
				!takeEntryUse(source, 'solarCoilEntry') || target.getVolatile('trapped')) return;
			if (target.addVolatile('trapped', source, move, 'trapper')) target.volatiles.trapped.duration = 2;
		} },
	},
	gyaradosmega: {
		base: 'thrash', name: 'Riptide Rampage', num: 33246,
		desc: 'A 145-power Water Thrash with its Defense-drop chance. Unleashed Ego’s Raging Storm lets Mega Gyarados switch moves freely.',
		changes: { basePower: 145, type: 'Water' },
	},
	hawluchamega: {
		base: 'flyingpress', name: 'Atlas Press', num: 33247,
		desc: '115 power. Once per entry, damaging a heavier foe clears the user’s negative Defense stages.',
		changes: { basePower: 115, onAfterHit(target, source, move) {
			if (source.boosts.def < 0 && target.getWeight() > source.getWeight() && damagedFoe(target, source, move) &&
				takeEntryUse(source, 'atlasPressEntry')) {
				source.setBoost({ def: 0 });
				this.add('-setboost', source, 'def', 0, '[from] move: Atlas Press');
			}
		} },
	},
	jirachimega: {
		base: 'doomdesire', name: 'Star Verdict', num: 33248,
		desc: '145 power. A damaging hit empowers this entry’s next Wish to heal an additional 1/8 of Jirachi’s max HP. Holds one charge.',
		changes: { basePower: 145 },
	},
	magearnamega: fleurSalvo,
	magearnaoriginalmega: fleurSalvo,
	malamarmega: {
		base: 'superpower', name: 'Capsize', num: 33251,
		desc: '130 power. On Inverse Field, damaging a foe clears its positive evasion stages. Retains the user’s stat drops.',
		changes: { basePower: 130, onAfterHit(target, source, move) {
			if (target.boosts.evasion > 0 && this.field.isTerrain('inverseterrain') && damagedFoe(target, source, move)) {
				target.setBoost({ evasion: 0 });
				this.add('-setboost', target, 'evasion', 0, '[from] move: Capsize');
			}
		} },
	},
	medichammega: {
		base: 'forcepalm', name: 'Mantra Palm', num: 33252,
		desc: '60 power. Gains 10% power after the Technician check, or 20% if its target has moved this turn.',
		changes: { onBasePower(_, source, target) { return this.chainModify(target.moveThisTurn ? 1.2 : 1.1); } },
	},
	meowsticfmega: {
		base: 'psyshock', name: 'Fracture Pulse', num: 33253,
		desc: 'A 95-power Defense-targeting pulse. On Psychic Terrain or Aura, reaches 120 power and breaks Reflect before damage once per entry.',
		changes: { basePower: 95, onModifyMove(move, source) {
			move.flags = { ...move.flags, pulse: 1 };
			if (psychicField(this, source)) move.basePower = 120;
		}, onBasePower(_, source, target) {
			if (!source.isAlly(target) && psychicField(this, source) && target.side.getSideCondition('reflect') &&
				takeEntryUse(source, 'fracturePulseEntry')) target.side.removeSideCondition('reflect');
		} },
	},
	meowsticmmega: {
		base: 'psychic', name: 'Ward Pulse', num: 33254,
		desc: 'A 100-power pulse. On Psychic Terrain or Aura, reaches 115 power. Once per entry, a damaging hit sets a three-turn Light Screen or extends the shorter active screen by one turn.',
		changes: { basePower: 100, onModifyMove(move, source) {
			move.flags = { ...move.flags, pulse: 1 };
			if (psychicField(this, source)) move.basePower = 115;
		}, onAfterHit(target, source, move) {
			if (!damagedFoe(target, source, move) || !psychicField(this, source) || !takeEntryUse(source, 'wardPulseEntry')) return;
			const shields = source.side.sideConditions;
			const shorter = shields.reflect &&
				(!shields.lightscreen || shields.reflect.duration! <= shields.lightscreen.duration!) ?
				shields.reflect : shields.lightscreen;
			if (shorter?.duration) {
				shorter.duration++;
				this.add('-activate', source, 'move: Ward Pulse', '[of] ' + shorter.id);
			} else if (source.side.addSideCondition('lightscreen', source, move)) {
				shields.lightscreen.duration = 3;
			}
		} },
	},
	mewtwomegax: {
		base: 'drainpunch', name: 'Psi Knuckle', num: 33255,
		desc: '85 power. Ignores one positive Defense stage when calculating physical damage. Keeps Drain Punch’s recovery.',
		changes: { basePower: 85 },
	},
	mewtwomegay: {
		base: 'psystrike', name: 'Mind Fracture', num: 33256,
		desc: '105 power. Once per entry, breaks the target’s Light Screen before damage. Retains Psystrike’s defensive-stat interactions.',
		changes: { basePower: 105, onBasePower(_, source, target) {
			if (!source.isAlly(target) && target.side.getSideCondition('lightscreen') &&
				takeEntryUse(source, 'mindFractureEntry')) {
				target.side.removeSideCondition('lightscreen');
			}
		} },
	},
	mismagiusmega: {
		base: 'moonblast', name: 'Witch Moon', num: 33257,
		desc: '105 power, rising to 120 against a slot with a pending Future Sight, including Temporal Shift’s. Leaves the delayed attack in place.',
		changes: { basePower: 105, basePowerCallback(source, target, move) {
			return target.side.slotConditions[target.position]?.futuremove?.move === 'futuresight' ? 120 : move.basePower;
		} },
	},
	noctowlmega: {
		base: 'airslash', name: 'Hush Wing', num: 33258,
		desc: '90 power and 100% accuracy. The first damaging hit per entry reveals the foe’s held item.',
		changes: { basePower: 90, accuracy: 100, onAfterHit(target, source, move) {
			if (damagedFoe(target, source, move) && takeEntryUse(source, 'hushWingEntry') && target.item) {
				this.add('-item', target, target.getItem().name, '[from] move: Hush Wing', `[of] ${source}`);
			}
		} },
	},
	noivernmega: {
		base: 'boomburst', name: 'Echo Break', num: 33259,
		desc: '145 power. Against each foe damaged by this user’s sound move on the previous turn, reaches 150 power.',
		changes: { basePower: 145, basePowerCallback(source, target, move) {
			return target.attackedBy.some(hit => hit.source === source && hit.soundTurn === this.turn - 1) ? 150 : move.basePower;
		} },
	},
	metagrossmega: {
		base: 'meteormash', name: 'Meteor Ram', num: 33260,
		desc: '105 power and 100% accuracy. After dealing damage with a Convergence-charged hit, raises the user’s Defense one stage once per use. Keeps Meteor Mash’s Attack boost chance.',
		changes: { basePower: 105, accuracy: 100, onAfterHit(target, source, move) {
			const ram = move as ActiveMove & { convergenceAttack?: boolean, meteorRamUsed?: boolean };
			if (ram.convergenceAttack && !ram.meteorRamUsed && damagedFoe(target, source, move)) {
				ram.meteorRamUsed = true;
				this.boost({ def: 1 }, source, source, move);
			}
		} },
	},
	kangaskhanmega: {
		base: 'dizzypunch', name: 'Tandem Punch', num: 33261,
		desc: '85 power. Once per turn, damaging a foe heals the active ally with the lowest HP percentage by 1/12 max HP, or the user if no ally is hurt. Keeps Dizzy Punch’s confusion chance.',
		changes: { basePower: 85, onAfterHit(target, source, move) {
			if (!damagedFoe(target, source, move) || source.m.tandemPunchTurn === this.turn) return;
			const injured = source.adjacentAllies().filter(ally => ally.hp && ally.hp < ally.maxhp);
			const recipient = injured.sort((a, b) => a.hp / a.maxhp - b.hp / b.maxhp)[0] || source;
			if (this.heal(recipient.baseMaxhp / 12, recipient, source, move)) source.m.tandemPunchTurn = this.turn;
		} },
	},
};
