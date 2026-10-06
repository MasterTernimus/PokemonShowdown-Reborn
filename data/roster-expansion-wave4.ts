import type { AbilityData, AbilityDataTable } from '../sim/dex-abilities';

const foeHit = (damage: number, target: Pokemon, source: Pokemon) => damage > 0 && !target.isAlly(source);

export function applyRosterWave4(base: AbilityDataTable) {
	let num = 10580;
	const add = (id: string, name: string, data: Partial<AbilityData>) => {
		base[id as ID] = { flags: {}, rating: 4, ...data, name, num: num++ };
	};
	base.sirius.onStart = base.blackviper.onStart;
	base.sirius.onSourceDamagingHit = base.blackviper.onSourceDamagingHit;
	// Black Viper retains Whiplash's power hook; keep Sirius's existing Apex Venom combination.
	add('coldopen', 'Cold Open', {
		onStart() { this.effectState.used = false; },
		onModifyMove(move) {
			if (!this.effectState.used && move.category !== 'Status') {
				move.ignorePositiveDefensive = true;
				move.ignoreScreens = true;
			}
		},
		onAfterMoveSecondarySelf(source, target, move) {
			if (move.category !== 'Status' && move.totalDamage) this.effectState.used = true;
		},
	});
	add('quarrycannon', 'Quarry Cannon', {
		...base.solidrock,
		onModifyMove(move) { if (move.id === 'rockblast' && !move.isZ && !move.isMax) move.multihit = 5; },
	});
	add('tundramarch', 'Tundra March', {
		...base.oblivious,
		onSourceDamagingHit(damage, target, source, move) {
			if (!foeHit(damage, target, source) || move.type !== 'Ground') return;
			for (const id of ['spikes', 'toxicspikes', 'stickyweb']) source.side.removeSideCondition(id);
		},
	});
	add('undertow', 'Undertow', {
		...base.waterabsorb,
		onSourceDamagingHit(damage, target, source, move) {
			if (foeHit(damage, target, source) && target.hp && move.type === 'Water') {
				target.addVolatile('smackdown', source, this.effect);
			}
		},
	});
	add('deadwater', 'Deadwater', {
		onAnyResidualHeal(amount, target, source, effect) {
			const holder = this.effectState.target;
			if (typeof amount !== 'number' || target.isAlly(holder) || !holder.hp ||
				['drain', 'leechseed', 'wish', 'deadwater'].includes(effect?.id)) return;
			// Multiple holders do not repeatedly halve the same recovery.
			if (this.getAllActive().find(p => !p.isAlly(target) && p.hasAbility('deadwater')) !== holder) return;
			const reduced = Math.floor(amount / 2);
			const missing = target.maxhp - target.hp;
			const prevented = Math.min(amount, missing) - Math.min(reduced, missing);
			if (this.effectState.healTurn !== this.turn) {
				this.effectState.healTurn = this.turn;
				this.effectState.healed = 0;
			}
			const allowance = Math.max(0, Math.floor(holder.baseMaxhp / 8) - this.effectState.healed);
			if (prevented > 0 && allowance > 0) {
				const healed = this.heal(Math.min(prevented, allowance), holder, holder, this.effect);
				if (healed) this.effectState.healed += healed;
			}
			return reduced;
		},
	});
	add('vitalcircuit', 'Vital Circuit', {
		onModifyMove(move) {
			if (move.type === 'Electric' && move.category !== 'Status' && !move.drain) {
				move.drain = [1, 4];
				move.vitalCircuitDrain = true;
			}
		},
		onTryHealPriority: -100,
		onTryHeal(amount, target, source, effect) {
			if (effect.id !== 'drain' || !this.activeMove?.vitalCircuitDrain || this.activePokemon !== target) return;
			if (target.isAlly(source)) return false;
			if (this.effectState.healTurn !== this.turn) {
				this.effectState.healTurn = this.turn;
				this.effectState.healed = 0;
			}
			const allowance = Math.max(0, Math.floor(target.baseMaxhp / 8) - this.effectState.healed);
			return Math.min(this.finalModify(amount), allowance);
		},
		onHeal(amount, target, source, effect) {
			if (effect.id === 'drain' && this.activeMove?.vitalCircuitDrain && this.activePokemon === target) {
				this.effectState.healed += amount;
			}
		},
	});
	add('ringmaster', 'Ringmaster', {
		...base.toughclaws,
		onStart() { this.effectState.used = false; },
		onSourceDamagingHit(damage, target, source, move) {
			if (!foeHit(damage, target, source) || !target.hp || move.type !== 'Dark' || this.effectState.used) return;
			this.effectState.used = true;
			if (target.addVolatile('taunt', source, this.effect)) target.volatiles['taunt'].duration = 2;
		},
	});
	add('unyielding', 'Unyielding', {
		...base.stamina,
		onDragOutPriority: 1,
		onDragOut(pokemon, source) {
			if (pokemon.boosts.def > 0 && (!source?.isAlly(pokemon))) {
				this.add('-activate', pokemon, 'ability: Unyielding');
				return null;
			}
		},
	});
	add('primalrhythm', 'Primal Rhythm', {
		onModifyMove(move) {
			if (!move.flags['sound'] || move.category === 'Status') return;
			move.category = 'Physical';
			if (move.target === 'allAdjacent') move.target = 'allAdjacentFoes';
			const previous = move.onTryHit;
			move.onTryHit = function (target, source, activeMove) {
				if (target !== source && target.isAlly(source)) return null;
				return typeof previous === 'function' ? previous.call(this, target, source, activeMove) : previous;
			};
		},
	});
	add('setpiece', 'Set Piece', {
		onStart() { this.effectState.charged = false; },
		onModifyPriority(priority, source, target, move) {
			if (this.effectState.charged && move.type === 'Fire' && move.category !== 'Status') return priority + 1;
		},
		onModifyMove(move) {
			if (this.effectState.charged && move.type === 'Fire' && move.category !== 'Status') {
				move.accuracy = true;
				this.effectState.charged = false;
			}
		},
		onAfterMoveSecondarySelf(source, target, move) {
			if (move.id === 'courtchange' || (move.id === 'feint' && move.totalDamage)) this.effectState.charged = true;
		},
	});
	add('calculatedshot', 'Calculated Shot', {
		onModifyMove(move) {
			if (move.type === 'Water' && move.category !== 'Status') {
				move.critRatio = (move.critRatio || 0) + 1;
				move.noDamageVariance = true;
			}
		},
	});
	base.lunardread = {
		...base.insomnia,
		...base.pressure,
		flags: { breakable: 1 }, name: 'Lunar Dread', num: base.lunardread.num, rating: 4,
		onStart(pokemon) {
			base.dishearten.onStart?.call(this, pokemon);
			base.pressure.onStart?.call(this, pokemon);
		},
	};
	add('falsebouquet', 'False Bouquet', {
		onStart() { this.effectState.used = false; },
		onSourceDamagingHit(damage, target, source, move) {
			if (!foeHit(damage, target, source) || !target.hp || move.id !== 'flowertrick' || this.effectState.used) return;
			this.effectState.used = true;
			if (!target.hasType('Grass')) target.addVolatile('leechseed', source, this.effect);
		},
	});
	base.funeralchoir.onModifyMove = function (move, source) {
		if (move.type === 'Ghost' && move.category !== 'Status' && source.side.pokemon.some(p => p !== source && p.fainted)) {
			move.flags['sound'] = 1;
			move.flags['bypasssub'] = 1;
		}
	};
	base.funeralchoir.onModifyMovePriority = 1;
	base.funeralchoir.onDisableMove = function (pokemon) {
		if (!pokemon.volatiles['throatchop'] || !pokemon.side.pokemon.some(p => p !== pokemon && p.fainted)) return;
		for (const slot of pokemon.moveSlots) {
			const move = this.dex.moves.get(slot.id);
			if (move.type === 'Ghost' && move.category !== 'Status') pokemon.disableMove(slot.id);
		}
	};
	delete base.voidtyrant.onImmunity;
	delete base.voidtyrant.onResidual;
	base.voidtyrant.onAfterEachBoost = function (boost, target, source, effect) {
		if (source === target && effect.id === 'dracometeor' && boost.spa && boost.spa < 0) {
			this.effectState.dracoDropMove = this.activeMove;
		}
	};
	base.voidtyrant.onAfterMove = function (source, target, move) {
		if (source.m.hydraTyrantRestoreUsed || move.id !== 'dracometeor' ||
			this.effectState.dracoDropMove !== move || source.boosts.spa >= 0) return;
		source.m.hydraTyrantRestoreUsed = true;
		const boosts: SparseBoostsTable = {};
		for (const stat of Object.keys(source.boosts) as BoostID[]) if (source.boosts[stat] < 0) boosts[stat] = 0;
		source.setBoost(boosts);
		this.add('-clearnegativeboost', source, '[from] ability: Void Tyrant');
	};
	// Called moves also complete here, even when they do not run the outer turn's AfterMove event.
	base.voidtyrant.onAfterMoveSecondarySelf = base.voidtyrant.onAfterMove;
	add('meridianseal', 'Meridian Seal', {
		onStart() { this.effectState.used = false; },
		onSourceDamagingHit(damage, target, source, move) {
			if (!foeHit(damage, target, source) || !target.hp || move.type !== 'Fighting' || this.effectState.used) return;
			this.effectState.used = true;
			if (target.getAbility().flags['cantsuppress']) return;
			if (target.hasItem('Ability Shield')) {
				this.add('-block', target, 'item: Ability Shield');
				return;
			}
			target.addVolatile('meridianseal', source, this.effect);
		},
		condition: {
			duration: 2,
			noCopy: true,
			onStart(pokemon, source) {
				this.add('-start', pokemon, 'Meridian Seal', '[from] ability: Meridian Seal', `[of] ${source}`);
				this.add('-endability', pokemon);
				this.singleEvent('End', pokemon.getAbility(), pokemon.abilityState, pokemon);
				pokemon.revertSuppressedRegionalForm();
			},
			onResidualOrder: 28,
			onEnd(pokemon) {
				delete pokemon.volatiles['meridianseal'];
				this.add('-end', pokemon, 'Meridian Seal');
				if (!pokemon.hp || pokemon.ignoringAbility()) return;
				this.add('-ability', pokemon, pokemon.getAbility().name, '[silent]');
				const event = pokemon.ability === 'neutralizinggas' ? 'SwitchIn' : 'Start';
				this.singleEvent(event, pokemon.getAbility(), pokemon.abilityState, pokemon);
			},
		},
	});
	add('rimeplate', 'Rimeplate', {
		onSourceModifyDamage(damage, source, target, move) {
			if (move.multihit && move.hit > 1) return this.chainModify(0.25);
		},
	});
	add('darkdominion', 'Dark Dominion', {
		...base.darkaura,
		onSourceDamagingHit(damage, target, source, move) {
			if (!foeHit(damage, target, source) || !target.hp || move.type !== 'Dark') return;
			const existing = target.volatiles['healblock'];
			if (existing) {
				existing.duration = Math.max(existing.duration || 0, 2);
			} else if (target.addVolatile('healblock', source, this.effect)) {
				target.volatiles['healblock'].duration = 2;
			}
		},
	});
}
