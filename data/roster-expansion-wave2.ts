import type { AbilityData, AbilityDataTable } from '../sim/dex-abilities';

const hazards = ['spikes', 'toxicspikes', 'stealthrock', 'stickyweb', 'gmaxsteelsurge'];
const foeHit = (damage: number, target: Pokemon, source: Pokemon) => damage > 0 && !target.isAlly(source);

/** Follow-up designs explicitly approved after the first roster expansion. */
export function applyRosterWave2(base: AbilityDataTable) {
	let num = 10500;
	const add = (id: string, name: string, data: Partial<AbilityData>) => {
		base[id as ID] = { flags: {}, rating: 4, ...data, name, num: num++ };
	};
	add('sovereignarsenal', 'Sovereign Arsenal', {
		onModifyMove(move, source, target) {
			if (!target || move.category === 'Status' || !['Poison', 'Ground'].includes(move.type)) return;
			// Shell Side Arm's stat-ratio comparison, without changing the move's contact flags.
			const physical = source.getStat('atk', false, true) / target.getStat('def', false, true);
			const special = source.getStat('spa', false, true) / target.getStat('spd', false, true);
			move.category = physical > special ? 'Physical' : 'Special';
		},
		onModifyCritRatio(ratio, source, target, move) {
			if (move.flags['horn'] || move.flags['tail'] || move.flags['tailmove']) return ratio + 1;
		},
	});
	const broodguard = base.broodguard;
	base.broodguard = { ...broodguard,
		onStart() { this.effectState.rallied = false; },
		onAllyDamagingHit(damage, target, source) {
			const holder = this.effectState.target;
			if (holder === target || !holder.isAdjacent(target) || this.effectState.rallied ||
				!foeHit(damage, target, source) || !target.hp || target.hp > target.maxhp / 2 ||
				target.hp + damage <= target.maxhp / 2) return;
			this.effectState.rallied = true;
			this.boost({ def: 1 }, holder, holder, this.effect);
		},
	};
	const sun = base.suncharm;
	base.suncharm = { ...sun,
		onStart(pokemon) { sun.onStart!.call(this, pokemon); this.effectState.cursed = false; },
		onSourceAfterSetStatus(status, target, source) {
			if (status.id !== 'brn' || target.isAlly(source) || this.effectState.cursed || !target.hp) return;
			if (target.addVolatile('curse', source, this.effect)) {
				this.effectState.cursed = true;
				this.add('-activate', source, 'ability: Sun Charm');
				this.add('-message', `${source.name}'s Sun Charm cursed the foe caught in its flames!`);
			}
		},
	};
	add('pollenengine', 'Pollen Engine', {
		...base.chlorophyll,
		onStart() { this.effectState.healTurn = -1; },
		onSourceAfterMoveSecondary(target, source, move) {
			if (source.isAlly(target) || this.effectState.healTurn === this.turn ||
				!(move.flags['powder'] || (move.type === 'Grass' && move.category !== 'Status'))) return;
			this.effectState.healTurn = this.turn;
			const divisor = ['sunnyday', 'desolateland'].includes(source.effectiveWeather()) ? 8 : 16;
			for (const ally of [source, ...source.adjacentAllies()]) {
				this.heal(ally.baseMaxhp / divisor, ally, source, this.effect);
			}
		},
	});
	add('titanpincer', 'Titan Pincer', {
		...base.hypercutter,
		onModifyMove(move, source) {
			if (move.id === 'crabhammer' && source.getStat('def') > source.getStat('atk')) move.overrideOffensiveStat = 'def';
		},
	});
	add('shellcracker', 'Shellcracker', {
		onModifyMove(move) { if (move.id === 'crabhammer') { move.accuracy = 100; move.willCrit = true; } },
	});
	add('tidaldominion', 'Tidal Dominion', {
		...base.swiftswim,
		onAllyTryHit(target, source, move) {
			const holder = this.effectState.target;
			if (holder.isAlly(source) || source.boosts.spe >= 0 || move.priority <= 0) return;
			this.add('-activate', holder, 'ability: Tidal Dominion');
			return null;
		},
	});
	add('tempestfury', 'Tempest Fury', {
		onStart() { this.effectState.charged = false; },
		onDamagingHit(damage, target, source) {
			if (target.hp && foeHit(damage, target, source)) this.effectState.charged = true;
		},
		onModifyMove(move) {
			if (this.effectState.charged && move.type === 'Water' && move.category !== 'Status') move.willCrit = true;
		},
		onSourceDamagingHit(damage, target, source, move) {
			if (foeHit(damage, target, source) && move.type === 'Water') this.effectState.charged = false;
		},
		onSourceAfterSubDamage(damage, target, source, move) {
			if (foeHit(damage, target, source) && move.type === 'Water') this.effectState.charged = false;
		},
	});
	add('ironlash', 'Iron Lash', {
		...base.whiplash,
		onSourceDamagingHit(damage, target, source, move) {
			if (!foeHit(damage, target, source) || !(move.flags['tail'] || move.flags['tailmove']) ||
				this.effectState.boostTurn === this.turn) return;
			this.effectState.boostTurn = this.turn;
			this.boost({ spd: 1 }, source, source, this.effect);
		},
	});
	add('trailbreaker', 'Trailbreaker', {
		onDamage(damage, target, source, effect) { if (hazards.includes(effect.id)) return false; },
		onSetStatus(status, target, source, effect) { if (effect?.id === 'toxicspikes') return false; },
		onTryBoost(boost, target, source, effect) { if (effect?.id === 'stickyweb') delete boost.spe; },
		onModifyMove(move) { if (move.id === 'rapidspin') move.ignoreImmunity = true; },
	});
	add('armoredadvance', 'Armored Advance', {
		onTryBoost(boost, target, source, effect) {
			if (target !== source || effect?.effectType !== 'Move' || (effect).category === 'Status') return;
			if (boost.def && boost.def < 0) delete boost.def;
			if (boost.spd && boost.spd < 0) delete boost.spd;
		},
		onModifyMove(move) { if (move.type === 'Ground') move.ignoreNegativeOffensive = true; },
	});
	add('gritgrappler', 'Grit Grappler', {
		...base.guts,
		onSourceDamagingHit(damage, target, source, move) {
			if (!foeHit(damage, target, source) || !source.status || move.type !== 'Fighting' ||
				this.effectState.healTurn === this.turn) return;
			this.effectState.healTurn = this.turn;
			this.heal(source.baseMaxhp / 16, source, source, this.effect);
		},
	});
	add('dreadjaw', 'Dread Jaw', {
		...base.moxie,
		onStart() { this.effectState.charged = false; },
		onSourceAfterFaint(length, target, source, effect) {
			base.moxie.onSourceAfterFaint!.call(this, length, target, source, effect);
			if (effect?.effectType === 'Move' && !source.isAlly(target)) this.effectState.charged = true;
		},
		onAnyAfterSwitchIn(pokemon) {
			const holder = this.effectState.target;
			if (!this.effectState.charged || holder.isAlly(pokemon)) return;
			this.effectState.charged = false;
			this.boost({ atk: -1 }, pokemon, holder, this.effect);
		},
	});
	add('floehunter', 'Floe Hunter', {
		...base.slushrush,
		onModifyMove(move, source, target) {
			if (target && move.flags['bite'] && ['snow', 'hail'].includes(source.effectiveWeather()) &&
				source.getStat('spe') > target.getStat('spe')) move.willCrit = true;
		},
	});
	add('lanceguard', 'Lanceguard', {
		...base.shellarmor,
		onTryHitPriority: 4,
		onTryHit(target, source, move) {
			if (target.volatiles['protect'] && !this.checkMoveBypassesProtect(move, source, target) &&
				this.checkMoveMakesContact(move, source, target)) this.boost({ def: -1 }, source, target, this.effect);
		},
	});
	add('headlongresolve', 'Headlong Resolve', {
		onModifyMove(move) { if (move.recoil) move.ignorePositiveDefensive = true; },
		onDamage(damage, target, source, effect) {
			if (effect.id !== 'recoil' || target.hp <= damage || this.effectState.boostTurn === this.turn) return;
			this.effectState.boostTurn = this.turn;
			this.boost({ def: 1 }, target, target, this.effect);
		},
	});
	add('herdshelter', 'Herd Shelter', {
		...base.soundproof,
		onAllyTryHit(target, source, move) {
			const holder = this.effectState.target;
			if (target === holder || !holder.isAdjacent(target) || source.isAlly(target) ||
				!move.flags['sound'] || move.category === 'Status') return;
			this.add('-immune', target, '[from] ability: Herd Shelter', `[of] ${holder}`);
			return null;
		},
	});
	add('scorchsweep', 'Scorch Sweep', {
		onStart() { this.effectState.used = false; },
		onSourceDamagingHit(damage, target, source, move) {
			if (!foeHit(damage, target, source) || !move.recoil || this.effectState.used) return;
			this.effectState.used = true;
			for (const id of hazards) source.side.removeSideCondition(id);
			this.add('-activate', source, 'ability: Scorch Sweep');
		},
	});
	add('opensky', 'Open Sky', {
		onDamage(damage, target, source, effect) { if (!target.item && hazards.includes(effect.id)) return false; },
		onSetStatus(status, target, source, effect) { if (!target.item && effect?.id === 'toxicspikes') return false; },
		onTryBoost(boost, target, source, effect) { if (!target.item && effect?.id === 'stickyweb') delete boost.spe; },
		onModifyMove(move, source) { if (!source.item && move.type === 'Flying') delete move.flags['contact']; },
	});
	add('tidalvoice', 'Tidal Voice', {
		...base.liquidvoice,
		onBasePower(power, source, target, move) { if (move.flags['sound']) return this.chainModify(1.3); },
		onStart() { this.effectState.used = false; },
		onModifyMove(move) {
			if (!move.flags['sound']) return;
			if (move.target === 'allAdjacent') move.target = 'allAdjacentFoes';
			const previous = move.onTryHit;
			move.onTryHit = function (target, source, activeMove) {
				if (target !== source && target.isAlly(source)) return null;
				return typeof previous === 'function' ? previous.call(this, target, source, activeMove) : previous;
			};
		},
		onSourceDamagingHit(damage, target, source, move) {
			if (!foeHit(damage, target, source) || !move.flags['sound'] || this.effectState.used) return;
			this.effectState.used = true;
			const boosts: SparseBoostsTable = {};
			for (const stat of Object.keys(source.boosts) as BoostID[]) if (source.boosts[stat] < 0) boosts[stat] = 0;
			source.setBoost(boosts);
			this.add('-clearnegativeboost', source, '[from] ability: Tidal Voice');
		},
	});
	add('rechargerelay', 'Recharge Relay', {
		...base.battery,
		onSwitchOut(pokemon) {
			if (pokemon.switchFlag === 'voltswitch') pokemon.side.addSlotCondition(pokemon, 'rechargerelay', pokemon, this.effect);
		},
		condition: {
			onSwitchIn(pokemon) {
				this.heal(pokemon.baseMaxhp / 8, pokemon, this.effectState.source, this.dex.abilities.get('rechargerelay'));
				pokemon.side.removeSlotCondition(pokemon, 'rechargerelay');
			},
		},
	});
	add('hovercannon', 'Hover Cannon', {
		onModifyMove(move, source) {
			if (source.hp > source.maxhp / 2 && move.type === 'Electric' && move.category !== 'Status') {
				move.accuracy = true;
				move.tracksTarget = move.target !== 'scripted';
			}
		},
	});
	add('keenhunt', 'Keen Hunt', {
		onTryBoost(boost, target, source) {
			if (source && !source.isAlly(target) && boost.spe && boost.spe < 0) delete boost.spe;
		},
		onModifyMove(move, source, target) {
			if (target && move.type === 'Rock' && target.hp <= target.maxhp / 2) move.accuracy = true;
		},
		onModifyCritRatio(ratio, source, target, move) {
			if (move.type === 'Rock' && target.hp <= target.maxhp / 2) return ratio + 1;
		},
	});
	add('bloodchallenge', 'Blood Challenge', {
		onStart() { this.effectState.used = false; },
		onSourceModifyDamage(damage, source, target) {
			if (!this.effectState.used && !source.isAlly(target)) return this.chainModify(0.75);
		},
		onDamagingHit(damage, target, source) { if (foeHit(damage, target, source)) this.effectState.used = true; },
	});
	add('twilightinstinct', 'Twilight Instinct', {
		onStart() { this.effectState.lastTarget = null; this.effectState.streak = 0; },
		onModifyCritRatio(ratio, source, target) {
			return ratio + (this.effectState.lastTarget === target ? Math.min(2, this.effectState.streak) : 0);
		},
		onAfterMove(source, target, move) {
			if (move.category === 'Status') return;
			if (!move.totalDamage || !target || source.isAlly(target)) {
				this.effectState.lastTarget = null; this.effectState.streak = 0; return;
			}
			this.effectState.streak = this.effectState.lastTarget === target ? Math.min(2, this.effectState.streak + 1) : 1;
			this.effectState.lastTarget = target;
		},
	});
	for (const [id, name] of [['twincannons', 'Twin Cannons'], ['twinblades', 'Twin Blades']]) {
		add(id, name, {
			onModifyMove(move) {
				if (move.category === 'Status' || move.multihit || move.isZ || move.isMax || move.damage || move.damageCallback ||
					!['normal', 'any', 'adjacentFoe'].includes(move.target)) return;
				const cannons = id === 'twincannons';
				if (cannons ? move.category !== 'Special' || !['Fire', 'Psychic'].includes(move.type) :
					!move.flags['slicing'] || !['Fire', 'Ghost'].includes(move.type)) return;
				move.multihit = 2;
				move.multihitType = cannons ? 'twincannons' : 'twinblades';
			},
			onBasePowerPriority: 25,
			onBasePower(power, source, target, move) {
				if (move.multihitType !== id) return;
				if (id === 'twincannons') move.overrideDefensiveStat = move.hit > 1 ? 'def' : 'spd';
				else move.ignorePositiveDefensive = move.hit > 1;
				return this.chainModify(this.gameType === 'freeforall' ? 1 : 0.5);
			},
			onSourceModifySecondaries(secondaries, target, source, move) {
				if (move.multihitType === id && move.hit > 1) return [];
			},
		});
	}
	add('heatreservoir', 'Heat Reservoir', {
		...base.flashfire,
		onTryBoost(boost, target, source, effect) {
			if (target !== source || effect?.id !== 'armorcannon' || !target.volatiles['flashfire']) return;
			if (boost.def && boost.def < 0) delete boost.def;
			if (boost.spd && boost.spd < 0) delete boost.spd;
			target.removeVolatile('flashfire');
			this.add('-activate', target, 'ability: Heat Reservoir');
		},
	});
	add('mourningcoat', 'Mourning Coat', {
		...base.fluffy,
		onSourceModifyDamage(damage, source, target, move) {
			let modifier = move.flags['contact'] ? 0.5 : 1;
			if (this.movehasType(move, 'Fire') && !target.side.pokemon.some(p => p !== target && p.previouslyFainted)) {
				modifier *= 2;
			}
			return this.chainModify(modifier);
		},
	});
	add('gravewind', 'Gravewind', {
		...base.sandrush,
		onStart(pokemon) {
			if (!pokemon.replacedFainted) return;
			if (this.field.setWeather('sandstorm', pokemon, this.effect)) this.field.weatherState.duration = 3;
		},
	});
	add('dozinggiant', 'Dozing Giant', {
		...base.oblivious,
		onSourceModifyDamage(damage, source, target, move) {
			if (target.status === 'slp' && move.category === 'Special') return this.chainModify(0.75);
		},
	});
	add('quillreservoir', 'Quill Reservoir', {
		...base.waterabsorb,
		onStart() { this.effectState.charged = false; },
		onTryHit(target, source, move) {
			const handler = base.waterabsorb.onTryHit;
			const result = typeof handler === 'function' ? handler.call(this, target, source, move) : handler;
			if (result === null) this.effectState.charged = true;
			return result;
		},
		onSourceDamagingHit(damage, target, source, move) {
			if (!foeHit(damage, target, source) || !this.effectState.charged || move.type !== 'Poison') return;
			this.effectState.charged = false;
			if (target.hp) target.trySetStatus('psn', source, this.effect);
		},
	});
	add('raisedquills', 'Raised Quills', {
		onStart() { this.effectState.charged = false; },
		onAfterMoveSecondarySelf(source, target, move) { if (move.category === 'Status') this.effectState.charged = true; },
		onDamagingHit(damage, target, source, move) {
			if (!this.effectState.charged || !foeHit(damage, target, source) ||
				!this.checkMoveMakesContact(move, source, target)) return;
			this.effectState.charged = false;
			source.trySetStatus('psn', target, this.effect);
		},
	});
}
