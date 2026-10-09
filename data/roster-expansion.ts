import type { AbilityData, AbilityDataTable } from '../sim/dex-abilities';

/** Approved roster additions. Component hooks come from this fork's actual abilities. */
function lowestAlly(pokemon: Pokemon) {
	return pokemon.adjacentAllies().filter(ally => ally.hp && !ally.fainted)
		.sort((a, b) => a.hp / a.maxhp - b.hp / b.maxhp)[0];
}

function screen(battle: Battle, pokemon: Pokemon, id: 'safeguard' | 'lightscreen' | 'tailwind', turns: number) {
	const prior = pokemon.side.sideConditions[id]?.duration || 0;
	pokemon.side.addSideCondition(id, pokemon, battle.dex.getActiveMove(id));
	const state = pokemon.side.sideConditions[id];
	if (state) {
		state.duration = Math.max(prior, turns);
		// Also announce refreshes: addSideCondition does not restart an existing screen.
		battle.add('-sidestart', pokemon.side, `move: ${battle.dex.moves.get(id).name}`,
			`[turns] ${state.duration}`, '[silent]');
	}
}

function breakScreen(pokemon: Pokemon) {
	for (const id of ['auroraveil', 'reflect', 'lightscreen', 'atlantiswall', 'arenitewall']) {
		if (pokemon.side.removeSideCondition(id)) return;
	}
}

function foeHit(damage: number, target: Pokemon, source: Pokemon) {
	return damage > 0 && !target.isAlly(source);
}

export function applyApprovedRosterAbilities(base: AbilityDataTable) {
	let number = 10437;
	const add = (id: string, name: string, data: Partial<AbilityData>) => {
		base[id as ID] = { flags: {}, rating: 4, ...data, name, num: number++ };
	};
	add('updraft', 'Updraft', {
		onStart() { this.effectState.used = false; },
		onModifyMove(move) { if (move.type === 'Flying') move.ignoreEvasion = true; },
		onSourceDamagingHit(damage, target, source, move) {
			if (!foeHit(damage, target, source) || move.type !== 'Flying' || this.effectState.used) return;
			const ally = lowestAlly(source);
			if (ally) { this.effectState.used = true; this.boost({ spe: 1 }, ally, source, this.effect); }
		},
	});
	add('corneredfang', 'Cornered Fang', {
		...base.guts,
		onStart() { this.effectState.used = false; },
		onModifyPriority(priority, pokemon, target, move) {
			if (!this.effectState.used && pokemon.hp <= pokemon.maxhp / 2 && move.flags['bite']) {
				this.effectState.priorityMove = move.id;
				return priority + 1;
			}
		},
		onAfterMove(pokemon, target, move) {
			if (move.id === this.effectState.priorityMove) this.effectState.used = true;
		},
	});
	add('nighthoard', 'Night Hoard', {
		onStart() { this.effectState.primed = false; },
		onEatItem(item, pokemon) {
			if (!item.isBerry) return;
			this.heal(pokemon.baseMaxhp / 8, pokemon, pokemon, this.effect);
			this.effectState.primed = true;
		},
		onSourceDamagingHit(damage, target, source, move) {
			if (!foeHit(damage, target, source) || !this.effectState.primed || move.type !== 'Dark' || !move.flags['bite']) return;
			this.effectState.primed = false;
			if (target.hp && target.addVolatile('taunt', source, this.effect)) target.volatiles['taunt'].duration = 2;
		},
	});
	add('dunerunner', 'Dune Runner', {
		...base.sandrush,
		onStart(pokemon) { this.effectState.cleared = false; clearSandHazards.call(this, pokemon); },
		onWeatherChange(pokemon) { clearSandHazards.call(this, pokemon); },
	});
	function clearSandHazards(this: Battle, pokemon: Pokemon) {
		if (this.effectState.cleared || !this.field.isWeather('sandstorm')) return;
		this.effectState.cleared = true;
		for (const id of ['spikes', 'toxicspikes', 'stealthrock', 'stickyweb', 'gmaxsteelsurge']) {
			pokemon.side.removeSideCondition(id);
		}
		this.add('-activate', pokemon, 'ability: Dune Runner');
	}
	add('frostrunner', 'Frost Runner', {
		...base.slushrush,
		onDamage(damage, target, source, effect) {
			if (this.field.isWeather(['snow', 'hail']) &&
				['spikes', 'stealthrock', 'gmaxsteelsurge'].includes(effect.id)) return false;
		},
		onSetStatus(status, target, source, effect) {
			if (this.field.isWeather(['snow', 'hail']) && effect?.id === 'toxicspikes') return false;
		},
		onTryBoost(boost, target, source, effect) {
			if (this.field.isWeather(['snow', 'hail']) && effect?.id === 'stickyweb') delete boost.spe;
		},
	});
	for (const [id, name, type] of [['bedrockclaw', 'Bedrock Claw', 'Ground'], ['rimeclaw', 'Rime Claw', 'Ice']]) {
		add(id, name, {
			...base.toughclaws,
			onStart() { this.effectState.used = false; },
			onSourceDamagingHit(damage, target, source, move) {
				if (!foeHit(damage, target, source) || move.type !== type || !move.flags['contact'] || this.effectState.used) return;
				this.effectState.used = true;
				breakScreen(target);
			},
		});
	}
	add('broodguard', 'Broodguard', { ...base.thickfat, ...base.friendguard });
	add('suncharm', 'Sun Charm', {
		...base.drought,
		onStart(pokemon) {
			base.drought.onStart!.call(this, pokemon);
			this.effectState.sun = this.field.weatherState;
			this.effectState.used = false;
		},
		onSourceDamagingHit(damage, target, source, move) {
			if (!foeHit(damage, target, source) || move.type !== 'Fire' || this.effectState.used ||
				!this.field.isWeather('sunnyday') || this.field.weatherState !== this.effectState.sun) return;
			this.effectState.used = true;
			const weather = this.field.weatherState;
			if (weather.duration && weather.duration < 8) {
				weather.duration++;
				this.add('-message', `${source.name}'s Sun Charm extended the sunlight by one turn!`);
			}
		},
	});
	add('causticscales', 'Caustic Scales', {
		onStart() { this.effectState.used = false; },
		onDamagingHit(damage, target, source, move) {
			if (this.effectState.used || source.isAlly(target) || !this.checkMoveMakesContact(move, source, target)) return;
			this.effectState.used = true;
			source.trySetStatus('psn', target, this.effect);
		},
	});
	add('prismwings', 'Prism Wings', {
		...base.tintedlens,
		onStart() { this.effectState.used = false; },
		onSourceDamagingHit(damage, target, source, move) {
			if (!foeHit(damage, target, source) || this.effectState.used || target.getMoveHitData(move).typeMod >= 0) return;
			this.effectState.used = true;
			this.boost({ spe: 1 }, source, source, this.effect);
		},
	});
	add('oneiricdust', 'Oneiric Dust', {
		...base.psychicsurge,
		onStart(pokemon) { this.effectState.used = false; base.psychicsurge.onStart!.call(this, pokemon); },
		onSourceAfterMoveSecondary(target, source, move) {
			if (this.effectState.used || target.isAlly(source) || !move.flags['powder'] || !target.hp) return;
			// AfterMoveSecondary runs only after a successful hit (not immunity, miss, or Protect).
			this.effectState.used = true;
			this.boost({ spd: -1 }, target, source, this.effect);
		},
	});
	add('pincercrush', 'Pincer Crush', {
		...base.toughclaws,
		onStart() { this.effectState.used = false; },
		onSourceDamagingHit(damage, target, source, move) {
			if (!foeHit(damage, target, source) || this.effectState.used || move.type !== 'Steel' || !move.flags['contact']) return;
			this.effectState.used = true;
			if (target.hp) this.boost({ def: -1 }, target, source, this.effect);
		},
	});
	add('decoypincers', 'Decoy Pincers', {
		onStart() { this.effectState.used = false; this.effectState.pending = false; },
		onSourceModifyDamage(damage, source, target) {
			if (!this.effectState.used && !source.isAlly(target)) return this.chainModify(0.75);
		},
		onDamagingHit(damage, target, source) {
			if (!damage || this.effectState.used || source.isAlly(target)) return;
			this.effectState.used = true;
			this.boost({ atk: -1 }, source, target, this.effect);
		},
	});
	add('toxiccocoon', 'Toxic Cocoon', {
		onStart() { this.effectState.used = false; this.effectState.poisonUsed = false; },
		onSourceModifyDamage(damage, source, target, move) {
			if (!this.effectState.used && move.category === 'Special' && !source.isAlly(target)) return this.chainModify(0.5);
		},
		onDamagingHit(damage, target, source, move) {
			if (!damage || source.isAlly(target)) return;
			if (move.category === 'Special') this.effectState.used = true;
			if (!this.effectState.poisonUsed && this.checkMoveMakesContact(move, source, target)) {
				this.effectState.poisonUsed = true;
				source.trySetStatus('psn', target, this.effect);
			}
		},
	});
	add('galebloom', 'Gale Bloom', {
		onStart() { this.effectState.used = false; },
		onSourceDamagingHit(damage, target, source, move) {
			if (!foeHit(damage, target, source) || move.type !== 'Flying' || this.effectState.used) return;
			const ally = lowestAlly(source);
			if (ally) { this.effectState.used = true; this.boost({ spa: 1 }, ally, source, this.effect); }
		},
	});
	add('gemeye', 'Gem Eye', {
		...base.keeneye,
		onStart(pokemon) { this.effectState.used = false; base.keeneye.onStart!.call(this, pokemon); },
		onTryHitPriority: 1,
		onTryHit(target, source, move) {
			if (this.effectState.used || target.isAlly(source) || move.category !== 'Status' ||
				!move.flags['reflectable'] || move.hasBounced) return;
			this.effectState.used = true;
			if (typeof base.magicbounce.onTryHit === 'function') return base.magicbounce.onTryHit.call(this, target, source, move);
		},
	});
	add('lastlaugh', 'Last Laugh', {
		onStart() { this.effectState.healTurn = -1; },
		onModifyMove(move, pokemon) {
			if (move.category !== 'Status' &&
				this.getAllActive().every(other => other === pokemon || !this.queue.willMove(other))) {
				move.flags['bypasssub'] = 1;
				this.effectState.lastMove = move;
			}
		},
		onSourceDamagingHit(damage, target, source, move) {
			if (!foeHit(damage, target, source) || move !== this.effectState.lastMove ||
				this.effectState.healTurn === this.turn) return;
			this.effectState.healTurn = this.turn;
			this.heal(source.baseMaxhp / 8, source, source, this.effect);
		},
	});
	add('openingoverture', 'Opening Overture', {
		onStart() { this.effectState.used = false; },
		onAfterMoveSecondarySelf(source, target, move) {
			if (!move.flags['sound'] || this.effectState.used) return;
			this.effectState.used = true;
			screen(this, source, 'tailwind', 3);
		},
	});
	add('resonantblade', 'Resonant Blade', {
		onModifyMove(move) { if (move.flags['slicing']) move.ignoreScreens = true; },
	});
	add('finalnote', 'Final Note', {
		onStart() { this.effectState.used = false; },
		onModifyPriority(priority, pokemon, target, move) {
			if (!this.effectState.used && pokemon.hp <= pokemon.maxhp / 2 && move.flags['sound']) {
				this.effectState.priorityMove = move.id;
				return priority + 1;
			}
		},
		onAfterMove(pokemon, target, move) {
			if (move.id === this.effectState.priorityMove) this.effectState.used = true;
		},
	});
	add('livingtangle', 'Living Tangle', {
		...base.stamina,
		onDamagingHit(damage, target, source, move) {
			base.stamina.onDamagingHit!.call(this, damage, target, source, move);
			base.tanglinghair.onDamagingHit!.call(this, damage, target, source, move);
		},
	});
	add('rootrenewal', 'Root Renewal', {
		...base.regenerator,
		onSwitchOut(pokemon) {
			base.regenerator.onSwitchOut!.call(this, pokemon);
			const ally = pokemon.adjacentAllies().find(candidate => candidate.hp && candidate.status);
			if (ally) { this.add('-activate', pokemon, 'ability: Root Renewal'); ally.cureStatus(); }
		},
	});
	const omen = base.voidomen;
	base.voidomen = {
		...omen,
		onStart(pokemon) {
			omen.onStart?.call(this, pokemon);
			this.effectState.used = false;
			this.effectState.ward = false;
		},
		onAfterSuccessfulSecondary(source) {
			if (!this.effectState.used) { this.effectState.used = true; this.effectState.ward = true; }
		},
		onAllyTryBoost(boost, target, source) {
			if (!this.effectState.ward || !source || source.isAlly(target)) return;
			let blocked = false;
			for (const stat of Object.keys(boost) as BoostID[]) {
				if (boost[stat]! < 0) { delete boost[stat]; blocked = true; }
			}
			if (blocked) {
				this.effectState.ward = false;
				this.add('-activate', this.effectState.target, 'ability: Void Omen');
			}
		},
	};
	add('fortunatewing', 'Fortunate Wing', {
		...base.superluck,
		onStart() { this.effectState.used = false; },
		onSourceDamagingHit(damage, target, source, move) {
			if (!foeHit(damage, target, source) || this.effectState.used || !target.getMoveHitData(move).crit) return;
			this.effectState.used = true;
			screen(this, source, 'safeguard', 5);
		},
	});
	add('snowpack', 'Snowpack', { ...base.thickfat, ...base.icebody, ...base.toughclaws });
	add('icemirror', 'Ice Mirror', {
		onStart() { this.effectState.used = false; },
		onSourceModifyDamage(damage, source, target) {
			if (!this.effectState.used && !source.isAlly(target)) return this.chainModify(0.75);
		},
		onDamagingHit(damage, target, source) {
			if (!damage || this.effectState.used || source.isAlly(target)) return;
			this.effectState.used = true;
			this.boost({ spe: -1 }, source, target, this.effect);
		},
	});
	add('wailingsnow', 'Wailing Snow', {
		onStart() { this.effectState.used = false; this.effectState.primed = false; },
		onSourceDamagingHit(damage, target, source, move) {
			if (foeHit(damage, target, source) && move.type === 'Ice' && !this.effectState.used) this.effectState.primed = true;
		},
		onModifyPriority(priority, pokemon, target, move) {
			if (this.effectState.primed && !this.effectState.used && move.type === 'Ghost' &&
				move.category !== 'Status') return priority + 1;
		},
		onAfterMove(pokemon, target, move) {
			if (this.effectState.primed && move.type === 'Ghost' && move.category !== 'Status') {
				this.effectState.used = true;
				this.effectState.primed = false;
			}
		},
	});
	for (const [id, name, sideCondition] of [
		['stonewall', 'Stonewall', 'spikes'],
		['saltbastion', 'Salt Bastion', 'safeguard'],
		['anchorbridge', 'Anchor Bridge', 'lightscreen'],
	]) {
		add(id, name, {
			...base.sturdy,
			onStart() { this.effectState.pending = false; },
			onDamage(damage, target, source, effect) {
				const result = base.sturdy.onDamage!.call(this, damage, target, source, effect);
				if (typeof result === 'number' && result < damage) this.effectState.pending = true;
				return result;
			},
			onDamagingHit(damage, target) {
				if (!target.hp || !this.effectState.pending) return;
				this.effectState.pending = false;
				if (sideCondition === 'spikes') {
					const foes = target.foes();
					for (const foe of foes.filter((candidate, i) => !foes.slice(0, i).some(other => other.side === candidate.side))) {
						foe.side.addSideCondition('spikes', target, this.effect);
					}
				} else {
					screen(this, target, sideCondition as 'safeguard' | 'lightscreen', sideCondition === 'safeguard' ? 5 : 3);
				}
			},
		});
	}
	add('layeredshell', 'Layered Shell', {
		...base.shellarmor,
		onStart(pokemon) { this.effectState.used = false; base.shellarmor.onStart!.call(this, pokemon); },
		onSourceModifyDamage(damage, source, target, move) {
			base.shellarmor.onSourceModifyDamage!.call(this, damage, source, target, move);
			if (!this.effectState.used && move.category === 'Special' && !source.isAlly(target)) this.chainModify(0.75);
		},
		onDamagingHit(damage, target, source, move) {
			if (damage && !source.isAlly(target) && move.category === 'Special') this.effectState.used = true;
		},
	});
	add('breakaway', 'Breakaway', {
		onStart() { this.effectState.used = false; },
		onDamagingHit(damage, target, source, move) {
			if (!damage || !target.hp || source.isAlly(target) || move.category !== 'Physical' || this.effectState.used) return;
			this.effectState.used = true;
			this.boost({ def: -1, spe: 2 }, target, target, this.effect);
		},
	});
	add('fossilram', 'Fossil Ram', {
		...base.rockhead,
		onStart() { this.effectState.lastTurn = -1; },
		onSourceDamagingHit(damage, target, source, move) {
			if (!foeHit(damage, target, source) || !move.recoil || this.effectState.lastTurn === this.turn || !target.hp) return;
			this.effectState.lastTurn = this.turn;
			this.boost({ spe: -1 }, target, source, this.effect);
		},
	});
	add('rootediron', 'Rooted Iron', {
		...base.stamina,
		onStart() { this.effectState.attackTurn = -1; },
		onBeforeMove(pokemon, target, move) { if (move.category !== 'Status') this.effectState.attackTurn = this.turn; },
		onResidualOrder: 5,
		onResidual(pokemon) {
			if (this.effectState.attackTurn !== this.turn) this.heal(pokemon.baseMaxhp / 16, pokemon, pokemon, this.effect);
		},
	});
	add('encorearia', 'Encore Aria', {
		...base.serenegrace,
		onStart() { this.effectState.used = false; },
		onAfterSuccessfulSecondary(source) {
			if (this.effectState.used) return;
			this.effectState.used = true;
			screen(this, source, 'safeguard', 5);
		},
	});
	add('peppersting', 'Pepper Sting', {
		...base.insomnia,
		onStart(pokemon) {
			this.effectState.used = false;
			this.effectState.fireUsed = false;
			base.insomnia.onStart?.call(this, pokemon);
		},
		onAfterMove(source, target, move) { if (move.type === 'Fire') this.effectState.fireUsed = true; },
		onSourceDamagingHit(damage, target, source, move) {
			if (!foeHit(damage, target, source) || this.effectState.used ||
				!this.effectState.fireUsed || move.type !== 'Grass') return;
			this.effectState.used = true;
			if (target.hp) this.boost({ spe: -1, spd: -1 }, target, source, this.effect);
		},
	});
	add('sushitrick', 'Sushi Trick', {
		onSwitchInPriority: -2,
		onStart(pokemon) {
			for (const ally of pokemon.adjacentAllies()) {
				const healed = this.heal(ally.baseMaxhp / 4, ally, pokemon, this.effect);
				const cleared = ally.removeVolatile('confusion');
				if (healed || cleared) this.add('-message',
					`${pokemon.name} served ${ally.name} a colorful sushi surprise! Fresh flavors restored its spirits!`);
			}
		},
	});
	add('mastercourse', 'Master Course', {
		...base.contrary,
		onStart() { this.effectState.lastTurn = -1; },
		onSourceDamagingHit(damage, target, source, move) {
			if (!foeHit(damage, target, source) || !['Water', 'Dragon'].includes(move.type) ||
				this.effectState.lastTurn === this.turn) return;
			this.effectState.lastTurn = this.turn;
			this.effectState.pendingMove = move;
		},
		// Spend the old charge before granting the next one, after all hits and targets.
		onAfterMovePriority: -1,
		onAfterMove(source, target, move) {
			const pending = this.effectState.pendingMove;
			delete this.effectState.pendingMove;
			if (pending !== move || !source.hp || source.fainted || !source.isActive) return;
			const recipient = lowestAlly(source) || source;
			recipient.addVolatile('mastercourse', source, this.effect);
		},
		condition: {
			onStart(pokemon) {
				this.add('-message', `${pokemon.name} is ready for the Master's Course! ` +
				`Its next attack has a higher critical-hit chance!`);
			},
			onModifyCritRatio(critRatio) { return critRatio + 1; },
			onAfterMove(pokemon, target, move) { if (move.category !== 'Status') pokemon.removeVolatile('mastercourse'); },
		},
	});
	add('secondbrew', 'Second Brew', {
		onStart() { this.effectState.lastTurn = -1; },
		onTryHeal(damage, target, source, effect) {
			if (effect?.id !== 'drain' || this.effectState.lastTurn === this.turn) return;
			this.effectState.lastTurn = this.turn;
			const ally = lowestAlly(target);
			if (ally) this.heal(ally.baseMaxhp / 8, ally, target, this.effect);
		},
	});
	add('railsight', 'Rail Sight', {
		...base.stalwart,
		onStart(pokemon) { this.effectState.used = false; base.stalwart.onStart!.call(this, pokemon); },
		onModifyMovePriority: 1,
		onModifyMove(move, source, target) {
			base.stalwart.onModifyMove!.call(this, move, source, target);
			if (!this.effectState.used && target && (target.volatiles['followme'] || target.volatiles['ragepowder'] ||
				target.hasAbility(['lightningrod', 'stormdrain']))) move.ignoreScreens = true;
		},
		onSourceDamagingHit(damage, target, source, move) {
			if (foeHit(damage, target, source) && move.ignoreScreens) this.effectState.used = true;
		},
	});
	const execution = base.execution;
	base.execution = {
		...execution,
		onStart(pokemon) {
			this.effectState.markUsed = false;
			this.effectState.mark = null;
			this.dex.abilities.get('moldbreaker').onStart?.call(this, pokemon);
		},
		onBasePower(basePower, pokemon, target, move) {
			let modifier = 1;
			if (move.typeChangerBoosted === this.effect) {
				modifier *= this.field.isTerrain(['darkcrystalcavernterrain', 'newworldterrain',
					'starlightarenaterrain', 'coldeclipseterrain',
					'shortcircuitterrain', 'hauntedterrain', 'bewitchedwoodsterrain', 'holyterrain', 'rainbowterrain']) ? 1.5 : 1.3;
			}
			if (target?.hp && target.hp <= target.maxhp / 2) modifier *= 1.3;
			if (modifier !== 1) return this.chainModify(modifier);
		},
		onModifyMove(move, source, target) {
			this.dex.abilities.get('moldbreaker').onModifyMove?.call(this, move, source, target);
			if (target === this.effectState.mark && ['Dark', 'Ghost'].includes(move.type)) move.ignorePositiveDefensive = true;
		},
		onSourceDamagingHit(damage, target, source, move) {
			if (!foeHit(damage, target, source)) return;
			if (this.effectState.mark === target && move.ignorePositiveDefensive) this.effectState.mark = null;
			if (!this.effectState.markUsed && target.hp > 0 && target.hp <= target.maxhp / 2 &&
				target.hp + damage > target.maxhp / 2) {
				this.effectState.markUsed = true;
				this.effectState.mark = target;
				this.add('-message', `${source.name}'s Execution marked ${target.name}!`);
			}
		},
		onAnySwitchOut(pokemon) { if (pokemon === this.effectState.mark) this.effectState.mark = null; },
	};
}
