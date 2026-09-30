import type { AbilityData, AbilityDataTable } from '../sim/dex-abilities';

const foeHit = (damage: number, target: Pokemon, source: Pokemon) => damage > 0 && !target.isAlly(source);

export function applyRosterWave3(base: AbilityDataTable) {
	let num = 10540;
	const add = (id: string, name: string, data: Partial<AbilityData>) => {
		base[id as ID] = { flags: {}, rating: 4, ...data, name, num: num++ };
	};
	add('mountainbreaker', 'Mountainbreaker', {
		onModifyMove(move) {
			if (move.type !== 'Rock' || move.category === 'Status') return;
			const previous = move.onEffectiveness;
			move.onEffectiveness = function (modifier, target, type, activeMove) {
				if (target && this.dex.getImmunity('Ground', target) &&
					this.dex.getEffectiveness('Ground', target) > this.dex.getEffectiveness('Rock', target)) {
					return this.dex.getEffectiveness('Ground', type);
				}
				return previous?.call(this, modifier, target, type, activeMove);
			};
		},
	});
	add('dreadpresence', 'Dread Presence', {
		onAnyAfterMoveSecondarySelf(source, target, move) {
			const holder = this.effectState.target;
			if (source.isAlly(holder) || move.category !== 'Status' || source.m.dreadPresenceTurn === this.turn) return;
			source.m.dreadPresenceTurn = this.turn;
			this.damage(source.baseMaxhp / 8, source, holder, this.effect);
		},
	});
	add('palmmastery', 'Palm Mastery', {
		...base.thickfat,
		onModifyMove(move) {
			if (move.id !== 'forcepalm') return;
			// This is a primary move effect, like Nuzzle, rather than a secondary roll.
			move.status = 'par' as ID;
			move.secondaries = move.secondaries?.filter(effect => effect.status !== 'par');
		},
	});
	add('galvanicspirit', 'Galvanic Spirit', {
		...base.vitalspirit,
		onSourceDamagingHit(damage, target, source, move) {
			if (!foeHit(damage, target, source) || move.type !== 'Electric' || !target.hp ||
				!this.checkMoveMakesContact(move, source, target) || this.effectState.dropTurn === this.turn) return;
			this.effectState.dropTurn = this.turn;
			this.boost({ spd: -1 }, target, source, this.effect);
		},
	});
	add('blastchamber', 'Blast Chamber', {
		...base.vitalspirit,
		onStart() { this.effectState.nextType = ''; },
		onModifyMove(move) {
			if (move.category !== 'Status' && move.type === this.effectState.nextType) move.accuracy = true;
		},
		onAfterMoveSecondarySelf(source, target, move) {
			if (move.category === 'Status' || !move.totalDamage) return;
			if (move.type === 'Fire') this.effectState.nextType = 'Fighting';
			else if (move.type === 'Fighting') this.effectState.nextType = 'Fire';
		},
	});
	add('venomspurs', 'Venom Spurs', {
		onStart() { this.effectState.charged = false; },
		onSourceTryPrimaryHit(target, source, move) {
			if (!this.effectState.charged || target.isAlly(source) || move.type !== 'Bug' || move.category === 'Status' ||
				(target.volatiles['substitute'] && !move.infiltrates && !move.flags['bypasssub'])) return;
			this.effectState.charged = false;
			this.boost({ def: -1 }, target, source, this.effect);
		},
		onSourceDamagingHit(damage, target, source, move) {
			if (foeHit(damage, target, source) && move.type === 'Poison') this.effectState.charged = true;
		},
	});
	add('lastbrood', 'Last Brood', {
		...base.swarm,
		onDamagingHit(damage, target, source) {
			if (!foeHit(damage, target, source) || !target.hp || target.m.lastBroodUsed || target.getVolatile('substitute') ||
				target.hp > target.maxhp / 2 || target.hp + damage <= target.maxhp / 2) return;
			if (target.addVolatile('substitute', target, this.effect)) {
				target.m.lastBroodUsed = true;
				target.volatiles['substitute'].hp = Math.max(1, Math.floor(target.maxhp / 8));
				this.add('-activate', target, 'ability: Last Brood');
			}
		},
	});
	base.venombastion = {
		...base.stamina, name: 'Venom Bastion', num: base.venombastion.num, rating: 4,
		onDamagingHit(damage, target, source, move) {
			base.stamina.onDamagingHit!.call(this, damage, target, source, move);
			if (!foeHit(damage, target, source) || !['psn', 'tox'].includes(source.status) || !source.hp ||
				this.effectState.dropTurn === this.turn) return;
			this.effectState.dropTurn = this.turn;
			const stat = source.getStat('atk') >= source.getStat('spa') ? 'atk' : 'spa';
			this.boost({ [stat]: -1 }, source, target, this.effect);
		},
	};
	add('shadowfeint', 'Shadow Feint', {
		onHitProtect(source, target, move) {
			if (move.type !== 'Dark' || move.category === 'Status' || move.isZ || move.isMax) return;
			target.getMoveHitData(move).bypassProtect = this.effect;
			return false;
		},
		onSourceModifySecondaries(secondaries, target, source, move) {
			const bypass = target.getMoveHitData(move).bypassProtect;
			if (bypass && bypass !== true && bypass.id === 'shadowfeint') return [];
		},
	});
	add('silksights', 'Silk Sights', {
		...base.compoundeyes,
		onBasePower(power, source, target, move) {
			if (move.type === 'Electric' && target.boosts.spe < 0) move.ignorePositiveDefensive = true;
		},
	});
	add('livenet', 'Live Net', { ...base.unnerve });
	function harvest(this: Battle, pokemon: Pokemon) {
		if (pokemon.m.barbHarvestUsed || !pokemon.hp || pokemon.item || !pokemon.m.barbHarvestBerry ||
			(pokemon.m.barbHarvestHits || 0) < 3) return;
		if (pokemon.setItem(pokemon.m.barbHarvestBerry)) {
			pokemon.m.barbHarvestUsed = true;
			this.add('-item', pokemon, pokemon.getItem(), '[from] ability: Barb Harvest');
		}
	}
	add('barbharvest', 'Barb Harvest', {
		...base.ironbarbs,
		onEatItem(item, pokemon) { if (item.isBerry) pokemon.m.barbHarvestBerry = item.id; },
		onAfterUseItem(item, pokemon) { harvest.call(this, pokemon); },
		onDamagingHit(damage, target, source, move) {
			base.ironbarbs.onDamagingHit!.call(this, damage, target, source, move);
			if (!foeHit(damage, target, source) || !this.checkMoveMakesContact(move, source, target) ||
				this.effectState.lastMove === move) return;
			this.effectState.lastMove = move;
			target.m.barbHarvestHits = (target.m.barbHarvestHits || 0) + 1;
			harvest.call(this, target);
		},
	});
	add('currentcoil', 'Current Coil', {
		...base.swiftswim,
		onModifyMove(move) {
			if (move.id === 'coil') move.boosts = { ...move.boosts, spa: (move.boosts?.spa || 0) + 1 };
		},
	});
	base.stormcircuit = { ...base.stormcircuit,
		onModifySpe: base.currentcoil.onModifySpe,
		onModifyMove: base.currentcoil.onModifyMove,
	};
	add('soulpyre', 'Soul Pyre', {
		onAnyAfterDamageApplied(damage, target, source, effect) {
			const holder = this.effectState.target;
			if (effect?.id === 'brn' && !target.isAlly(holder) && damage > 0) this.effectState.burnTurn = this.turn;
		},
		onResidualOrder: 30,
		onResidual(pokemon) {
			if (this.effectState.burnTurn === this.turn) this.heal(pokemon.baseMaxhp / 8, pokemon, pokemon, this.effect);
		},
		onSourceDamagingHit(damage, target, source, move) {
			if (!foeHit(damage, target, source) || !target.hp || target.status !== 'brn' || move.type !== 'Ghost' ||
				this.effectState.dropTurn === this.turn) return;
			this.effectState.dropTurn = this.turn;
			this.boost({ spd: -1 }, target, source, this.effect);
		},
	});
	add('blackviper', 'Black Viper', {
		...base.whiplash,
		onStart(pokemon) { this.effectState.used = false; base.whiplash.onStart!.call(this, pokemon); },
		onSourceDamagingHit(damage, target, source, move) {
			if (!foeHit(damage, target, source) || this.effectState.used || !(move.flags['tail'] || move.flags['tailmove'])) return;
			this.effectState.used = true;
			if (target.hp) target.trySetStatus('tox', source, this.effect);
		},
	});
	add('silkshuriken', 'Silk Shuriken', {
		onModifyType(move) { if (move.id === 'watershuriken' && !move.isZ && !move.isMax) move.type = 'Bug'; },
		onModifyMove(move) {
			if (move.id === 'watershuriken' && !move.isZ && !move.isMax) { move.basePower = 20; move.multihit = 3; }
		},
	});
	add('hiddenscroll', 'Hidden Scroll', {
		onStart() { this.effectState.used = false; },
		onAfterMoveSecondarySelf(source, target, move) {
			if (this.effectState.used || this.gameType !== 'doubles' || !target || source.isAlly(target) ||
				move.category !== 'Status' || move.callsMove || move.hasBounced ||
				!['normal', 'adjacentFoe', 'any'].includes(move.target)) return;
			const other = source.foes().find(foe => foe !== target && foe.hp && source.isAdjacent(foe));
			if (!other) return;
			this.effectState.used = true;
			this.add('-activate', source, 'ability: Hidden Scroll');
			this.actions.useMove(this.dex.getActiveMove(move.id), source, { target: other, sourceEffect: this.effect });
		},
	});
	add('toxicserenity', 'Toxic Serenity', {
		...base.poisonheal,
		onModifyMove(move, source) {
			if (move.type === 'Dragon' && ['psn', 'tox'].includes(source.status)) move.accuracy = true;
		},
	});
	add('mudtemper', 'Mud Temper', {
		...base.battlearmor,
		onDamagingHit(damage, target, source, move) {
			if (!target.hp || !foeHit(damage, target, source) || !['Fire', 'Water'].includes(move.type) ||
				this.effectState.boostTurn === this.turn) return;
			this.effectState.boostTurn = this.turn;
			this.boost({ spd: 1 }, target, target, this.effect);
		},
	});
	add('skywarden', 'Skywarden', {
		onAfterMoveSecondarySelf(source, target, move) {
			if (move.id !== 'defog') return;
			const previous = source.side.sideConditions['mist']?.duration || 0;
			source.side.addSideCondition('mist', source, this.effect);
			const state = source.side.sideConditions['mist'];
			if (state) state.duration = Math.max(previous, 5);
		},
	});
	add('lockjaw', 'Lockjaw', {
		...base.strongjaw,
		onSourceDamagingHit(damage, target, source, move) {
			if (!foeHit(damage, target, source) || !target.hp || !move.flags['bite']) return;
			if (target.addVolatile('torment', source, this.effect)) target.volatiles['torment'].duration = 2;
		},
	});
	add('rivershell', 'River Shell', {
		...base.shellarmor,
		onTryBoost(boost, target, source, effect) {
			if (target === source && effect?.id === 'shellsmash' && boost.def && boost.def < 0) delete boost.def;
		},
	});
	base.territorial = {
		flags: {}, name: 'Territorial', num: base.territorial.num, rating: 4,
		onStart() { this.effectState.charged = false; },
		onDamagingHit(damage, target, source, move) {
			if (target.hp && foeHit(damage, target, source) && move.category === 'Physical') this.effectState.charged = true;
		},
		onSourceDamagingHit(damage, target, source, move) {
			if (!this.effectState.charged || !foeHit(damage, target, source) || move.type !== 'Ground') return;
			this.effectState.charged = false;
			this.heal(source.baseMaxhp / 8, source, source, this.effect);
		},
	};
	add('funeralchoir', 'Funeral Choir', {
		onSourceDamagingHit(damage, target, source, move) {
			if (!foeHit(damage, target, source) || !move.flags['sound'] || this.effectState.healTurn === this.turn) return;
			const fallen = source.side.pokemon.filter(pokemon => pokemon !== source && pokemon.fainted).length;
			if (!fallen) return;
			this.effectState.healTurn = this.turn;
			this.heal(source.baseMaxhp * Math.min(4, fallen) / 32, source, source, this.effect);
		},
	});
	add('festivalstep', 'Festival Step', {
		onSourceDamagingHit(damage, target, source, move) {
			if (!foeHit(damage, target, source) || !move.flags['dance']) return;
			const boosts: SparseBoostsTable = {};
			for (const stat of Object.keys(source.boosts) as BoostID[]) if (source.boosts[stat] < 0) boosts[stat] = 0;
			if (Object.keys(boosts).length) {
				source.setBoost(boosts);
				this.add('-clearnegativeboost', source, '[from] ability: Festival Step');
			}
		},
	});
	add('saltcrust', 'Salt Crust', {
		...base.clearbody,
		onTakeItem(item, pokemon, source) {
			if (pokemon.boosts.def > 0 && source && !source.isAlly(pokemon)) {
				this.add('-activate', pokemon, 'ability: Salt Crust');
				return false;
			}
		},
	});
	add('beyondfear', 'Beyond Fear', {
		...base.innerfocus,
		onStart() { this.effectState.used = false; },
		onFoeAfterBoost(boost, target) {
			if (this.effectState.used || (!(boost.atk && boost.atk > 0) && !(boost.spa && boost.spa > 0))) return;
			this.effectState.used = true;
			const gains: SparseBoostsTable = {};
			if (boost.atk && boost.atk > 0) gains.def = 1;
			if (boost.spa && boost.spa > 0) gains.spd = 1;
			this.boost(gains, this.effectState.target, this.effectState.target, this.effect);
		},
	});
	add('stillwater', 'Stillwater', {
		...base.waterabsorb,
		onTryHit(target, source, move) {
			const full = target.hp === target.maxhp;
			const handler = base.waterabsorb.onTryHit;
			const result = typeof handler === 'function' ? handler.call(this, target, source, move) : handler;
			if (result === null && full && this.effectState.boostTurn !== this.turn) {
				this.effectState.boostTurn = this.turn;
				this.boost({ spd: 1 }, target, target, this.effect);
			}
			return result;
		},
	});
	add('mudmeditation', 'Mud Meditation', {
		onSourceModifyDamage(damage, source, target, move) {
			const action = this.queue.willMove(target);
			if (move.category === 'Special' && action && action.move.category === 'Status') return this.chainModify(0.75);
		},
	});
}
