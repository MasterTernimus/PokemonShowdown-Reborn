import { Dex, toID } from './dex';

const CHOOSABLE_TARGETS = new Set(['normal', 'any', 'adjacentAlly', 'adjacentAllyOrSelf', 'adjacentFoe']);

export class BattleActions {
	battle: Battle;
	dex: ModdedDex;

	readonly MAX_MOVES: { readonly [k: string]: string } = {
		Flying: 'Max Airstream',
		Dark: 'Max Darkness',
		Fire: 'Max Flare',
		Bug: 'Max Flutterby',
		Water: 'Max Geyser',
		Status: 'Max Guard',
		Ice: 'Max Hailstorm',
		Fighting: 'Max Knuckle',
		Electric: 'Max Lightning',
		Psychic: 'Max Mindstorm',
		Poison: 'Max Ooze',
		Grass: 'Max Overgrowth',
		Ghost: 'Max Phantasm',
		Ground: 'Max Quake',
		Rock: 'Max Rockfall',
		Fairy: 'Max Starfall',
		Steel: 'Max Steelspike',
		Normal: 'Max Strike',
		Dragon: 'Max Wyrmwind',
	};

	readonly Z_MOVES: { readonly [k: string]: string } = {
		Poison: "Acid Downpour",
		Fighting: "All-Out Pummeling",
		Dark: "Black Hole Eclipse",
		Grass: "Bloom Doom",
		Normal: "Breakneck Blitz",
		Rock: "Continental Crush",
		Steel: "Corkscrew Crash",
		Dragon: "Devastating Drake",
		Electric: "Gigavolt Havoc",
		Water: "Hydro Vortex",
		Fire: "Inferno Overdrive",
		Ghost: "Never-Ending Nightmare",
		Bug: "Savage Spin-Out",
		Psychic: "Shattered Psyche",
		Ice: "Subzero Slammer",
		Flying: "Supersonic Skystrike",
		Ground: "Tectonic Rage",
		Fairy: "Twinkle Tackle",
	};

	constructor(battle: Battle) {
		this.battle = battle;
		this.dex = battle.dex;
		if (this.dex.data.Scripts.actions) Object.assign(this, this.dex.data.Scripts.actions);
		if (battle.format.actions) Object.assign(this, battle.format.actions);
	}

	getZMoveBasePower(move: Move) {
		if (move.zMove?.basePower) return move.zMove.basePower;
		let basePower = move.basePower;
		if (Array.isArray(move.multihit)) basePower *= 3;
		if (!basePower) return 100;
		if (basePower >= 140) return 200;
		if (basePower >= 130) return 195;
		if (basePower >= 120) return 190;
		if (basePower >= 110) return 185;
		if (basePower >= 100) return 180;
		if (basePower >= 90) return 175;
		if (basePower >= 80) return 160;
		if (basePower >= 70) return 140;
		if (basePower >= 60) return 120;
		return 100;
	}

	// #region SWITCH
	// ==================================================================

	switchIn(pokemon: Pokemon, pos: number, sourceEffect: Effect | null = null, isDrag?: boolean) {
		if (!pokemon || pokemon.isActive) {
			this.battle.hint("A switch failed because the Pokémon trying to switch in is already in.");
			return false;
		}

		const side = pokemon.side;
		if (pos >= side.active.length) {
			throw new Error(`Invalid switch position ${pos} / ${side.active.length}`);
		}
		const oldActive = side.active[pos];
		const unfaintedActive = oldActive?.hp ? oldActive : null;
		if (unfaintedActive) {
			oldActive.beingCalledBack = true;
			let switchCopyFlag: 'copyvolatile' | 'shedtail' | boolean = false;
			if (sourceEffect && typeof (sourceEffect as Move).selfSwitch === 'string') {
				switchCopyFlag = (sourceEffect as Move).selfSwitch!;
			}
			if (!oldActive.skipBeforeSwitchOutEventFlag && !isDrag) {
				this.battle.runEvent('BeforeSwitchOut', oldActive);
				if (this.battle.gen >= 5) {
					this.battle.eachEvent('Update');
				}
			}
			oldActive.skipBeforeSwitchOutEventFlag = false;
			if (!this.battle.runEvent('SwitchOut', oldActive)) {
				// Warning: DO NOT interrupt a switch-out if you just want to trap a pokemon.
				// To trap a pokemon and prevent it from switching out, (e.g. Mean Look, Magnet Pull)
				// use the 'trapped' flag instead.

				// Note: Nothing in the real games can interrupt a switch-out (except Pursuit KOing,
				// which is handled elsewhere); this is just for custom formats.
				return false;
			}
			if (!oldActive.hp) {
				// a pokemon fainted from Pursuit before it could switch
				return 'pursuitfaint';
			}

			// will definitely switch out at this point

			this.battle.singleEvent('End', oldActive.getAbility(), oldActive.abilityState, oldActive);
			this.battle.singleEvent('End', oldActive.getItem(), oldActive.itemState, oldActive);

			// if a pokemon is forced out by Whirlwind/etc or Eject Button/Pack, it can't use its chosen move
			this.battle.queue.cancelAction(oldActive);

			let newMove = null;
			if (this.battle.gen === 4 && sourceEffect) {
				newMove = oldActive.lastMove;
			}
			if (switchCopyFlag) {
				pokemon.copyVolatileFrom(oldActive, switchCopyFlag);
			}
			if (newMove) pokemon.lastMove = newMove;
			oldActive.clearVolatile();
		}
		if (oldActive) {
			oldActive.isActive = false;
			oldActive.isStarted = false;
			oldActive.usedItemThisTurn = false;
			oldActive.statsRaisedThisTurn = false;
			oldActive.statsLoweredThisTurn = false;
			oldActive.position = pokemon.position;
			if (oldActive.fainted) oldActive.status = '';
			if (this.battle.gen <= 4) {
				pokemon.lastItem = oldActive.lastItem;
				oldActive.lastItem = '';
			}
			pokemon.position = pos;
			side.pokemon[pokemon.position] = pokemon;
			side.pokemon[oldActive.position] = oldActive;
		}
		pokemon.isActive = true;
		side.active[pos] = pokemon;
		pokemon.activeTurns = 0;
		pokemon.activeMoveActions = 0;
		for (const moveSlot of pokemon.moveSlots) {
			moveSlot.used = false;
		}
		pokemon.abilityState = this.battle.initEffectState({ id: pokemon.ability, target: pokemon });
		pokemon.itemState = this.battle.initEffectState({ id: pokemon.item, target: pokemon });
		this.battle.runEvent('BeforeSwitchIn', pokemon);
		if (sourceEffect) {
			this.battle.add(isDrag ? 'drag' : 'switch', pokemon, pokemon.getFullDetails, `[from] ${sourceEffect}`);
		} else {
			this.battle.add(isDrag ? 'drag' : 'switch', pokemon, pokemon.getFullDetails);
		}
		if (isDrag && this.battle.gen === 2) pokemon.draggedIn = this.battle.turn;
		pokemon.previouslySwitchedIn++;

		if (isDrag && this.battle.gen >= 5) {
			// runSwitch happens immediately so that Mold Breaker can make hazards bypass Clear Body and Levitate
			this.runSwitch(pokemon);
		} else {
			this.battle.queue.insertChoice({ choice: 'runSwitch', pokemon });
		}
		if (pokemon.species.forme === 'Gmax') {
			pokemon.addVolatile('dynamax');
		}
		return true;
	}
	dragIn(side: Side, pos: number) {
		const pokemon = this.battle.getRandomSwitchable(side);
		if (!pokemon || pokemon.isActive) return false;
		const oldActive = side.active[pos];
		if (!oldActive) throw new Error(`nothing to drag out`);
		if (!oldActive.hp) return false;

		if (!this.battle.runEvent('DragOut', oldActive)) {
			return false;
		}
		if (!this.switchIn(pokemon, pos, null, true)) return false;
		return true;
	}
	runSwitch(pokemon: Pokemon) {
		const switchersIn = [pokemon];
		while (this.battle.queue.peek()?.choice === 'runSwitch') {
			const nextSwitch = this.battle.queue.shift();
			switchersIn.push(nextSwitch!.pokemon!);
		}
		const allActive = this.battle.getAllActive(true);
		this.battle.speedSort(allActive);
		this.battle.speedOrder = allActive.map(a => a.getFieldPositionValue());
		this.battle.fieldEvent('SwitchIn', switchersIn);

		for (const poke of switchersIn) {
			if (!poke.hp) continue;
			if (poke.terastallized === 'Stellar' && !poke.volatiles['stellarhealing']) {
				poke.addVolatile('stellarhealing');
			}
			poke.isStarted = true;
			poke.draggedIn = null;
		}
		return true;
	}

	// #endregion

	// #region MOVES
	// ==================================================================

	/**
	 * runMove is the "outside" move caller. It handles deducting PP,
	 * flinching, full paralysis, etc. All the stuff up to and including
	 * the "POKEMON used MOVE" message.
	 *
	 * For details of the difference between runMove and useMove, see
	 * useMove's info.
	 *
	 * externalMove skips LockMove and PP deduction, mostly for use by
	 * Dancer.
	 */
	runMove(
		moveOrMoveName: Move | string, pokemon: Pokemon, targetLoc: number,
		options?: {
			sourceEffect?: Effect | null, zMove?: string, externalMove?: boolean,
			maxMove?: string, originalTarget?: Pokemon,
		}
	) {
		pokemon.activeMoveActions++;
		const zMove = options?.zMove;
		const maxMove = options?.maxMove;
		const externalMove = options?.externalMove;
		const originalTarget = options?.originalTarget;
		let sourceEffect = options?.sourceEffect;
		let target = this.battle.getTarget(pokemon, maxMove || zMove || moveOrMoveName, targetLoc, originalTarget);
		let baseMove = this.dex.getActiveMove(moveOrMoveName);
		const priority = baseMove.priority;
		const pranksterBoosted = baseMove.pranksterBoosted;
		if (baseMove.id !== 'struggle' && !zMove && !maxMove && !externalMove) {
			const changedMove = this.battle.runEvent('OverrideAction', pokemon, target, baseMove);
			if (changedMove && changedMove !== true) {
				baseMove = this.dex.getActiveMove(changedMove);
				baseMove.priority = priority;
				if (pranksterBoosted) baseMove.pranksterBoosted = pranksterBoosted;
				target = this.battle.getRandomTarget(pokemon, baseMove);
			}
		}
		let move = baseMove;
		if (zMove) {
			move = this.getActiveZMove(baseMove, pokemon);
		} else if (maxMove) {
			move = this.getActiveMaxMove(baseMove, pokemon);
		}

		move.isExternal = externalMove;

		this.battle.setActiveMove(move, pokemon, target);

		/* if (pokemon.moveThisTurn) {
			// THIS IS PURELY A SANITY CHECK
			// DO NOT TAKE ADVANTAGE OF THIS TO PREVENT A POKEMON FROM MOVING;
			// USE this.queue.cancelMove INSTEAD
			this.battle.debug(`${pokemon.id} INCONSISTENT STATE, ALREADY MOVED: ${pokemon.moveThisTurn}`);
			this.battle.clearActiveMove(true);
			return;
		} */
		const willTryMove = this.battle.runEvent('BeforeMove', pokemon, target, move);
		if (!willTryMove) {
			this.battle.runEvent('MoveAborted', pokemon, target, move);
			this.battle.clearActiveMove(true);
			// The event 'BeforeMove' could have returned false or null
			// false indicates that this counts as a move failing for the purpose of calculating Stomping Tantrum's base power
			// null indicates the opposite, as the Pokemon didn't have an option to choose anything
			pokemon.moveThisTurnResult = willTryMove;
			return;
		}

		// Used exclusively for a hint later
		if (move.flags['cantusetwice'] && pokemon.lastMove?.id === move.id) {
			pokemon.addVolatile(move.id);
		}

		if (move.beforeMoveCallback) {
			if (move.beforeMoveCallback.call(this.battle, pokemon, target, move)) {
				this.battle.clearActiveMove(true);
				pokemon.moveThisTurnResult = false;
				return;
			}
		}
		pokemon.lastDamage = 0;
		if (!externalMove) {
			const lockedMove = pokemon.getLockedMove();
			if (!lockedMove) {
				if (!pokemon.deductPP(baseMove, null, target) && (move.id !== 'struggle')) {
					this.battle.add('cant', pokemon, 'nopp', move);
					this.battle.clearActiveMove(true);
					pokemon.moveThisTurnResult = false;
					return;
				}
			} else {
				sourceEffect = this.dex.conditions.get('lockedmove');
			}
			pokemon.moveUsed(move, targetLoc);
		}

		// Dancer Petal Dance hack
		// TODO: implement properly
		const noLock = externalMove && !pokemon.volatiles['lockedmove'];

		if (zMove) {
			if (pokemon.illusion) {
				this.battle.singleEvent('End', this.dex.abilities.get('Illusion'), pokemon.abilityState, pokemon);
			}
			this.battle.add('-zpower', pokemon);
		}

		const oldActiveMove = move;

		const moveDidSomething = this.useMove(baseMove, pokemon, { target, sourceEffect, zMove, maxMove });
		this.battle.lastSuccessfulMoveThisTurn = moveDidSomething ? this.battle.activeMove && this.battle.activeMove.id : null;
		if (this.battle.activeMove) move = this.battle.activeMove;
		if (
			moveDidSomething && pokemon.terastallized === 'Stellar' && move.category !== 'Status' &&
			move.type && move.type !== '???' && !pokemon.stellarBoostedTypes.includes(move.type)
		) {
			pokemon.stellarBoostedTypes.push(move.type);
		}
		const pendingZTerrain = (move as ActiveMove & { pendingZTerrain?: [string, number] }).pendingZTerrain ||
			(oldActiveMove as ActiveMove & { pendingZTerrain?: [string, number] }).pendingZTerrain;
		if (moveDidSomething && pendingZTerrain) {
			const [terrain, duration] = pendingZTerrain;
			const terrainSet = move.id === 'oceanicoperetta' && this.battle.field.terrain === 'underwaterterrain' ?
				(this.battle.field.changeTerrain(terrain, pokemon, move), this.battle.field.terrain === terrain) :
				this.battle.field.setTerrain(terrain, pokemon, move);
			if (terrainSet) {
				this.battle.field.terrainState.duration = duration;
				this.battle.field.terrainState.zMoveTerrain = true;
			}
		}
		this.battle.singleEvent('AfterMove', move, null, pokemon, target, move);
		this.battle.runEvent('AfterMove', pokemon, target, move);
		if (move.flags['cantusetwice'] && pokemon.removeVolatile(move.id)) {
			this.battle.add('-hint', `Some effects can force a Pokemon to use ${move.name} again in a row.`);
		}

		// TODO: Refactor to use BattleQueue#prioritizeAction in onAnyAfterMove handlers
		// Dancer's activation order is completely different from any other event, so it's handled separately
		if (move.flags['dance'] && moveDidSomething && !move.isExternal) {
			const dancers = [];
			for (const currentPoke of this.battle.getAllActive()) {
				if (pokemon === currentPoke) continue;
				if (currentPoke.hasAbility('dancer') && !currentPoke.isSemiInvulnerable()) {
					dancers.push(currentPoke);
				}
			}
			// Dancer activates in order of lowest speed stat to highest
			// Note that the speed stat used is after any volatile replacements like Speed Swap,
			// but before any multipliers like Agility or Choice Scarf
			// Ties go to whichever Pokemon has had the ability for the least amount of time
			dancers.sort(
				(a, b) => -(b.storedStats['spe'] - a.storedStats['spe']) || b.abilityState.effectOrder - a.abilityState.effectOrder
			);
			const targetOf1stDance = this.battle.activeTarget!;
			for (const dancer of dancers) {
				if (this.battle.faintMessages()) break;
				if (dancer.fainted) continue;
				this.battle.add('-activate', dancer, 'ability: Dancer');
				const dancersTarget = !targetOf1stDance.isAlly(dancer) && pokemon.isAlly(dancer) ?
					targetOf1stDance :
					pokemon;
				const dancersTargetLoc = dancer.getLocOf(dancersTarget);
				this.runMove(move.id, dancer, dancersTargetLoc, { sourceEffect: this.dex.abilities.get('dancer'), externalMove: true });
			}
		}
		if (noLock && pokemon.volatiles['lockedmove']) delete pokemon.volatiles['lockedmove'];
		this.battle.faintMessages();
		this.battle.checkWin();

		if (this.battle.gen <= 4) {
			// In gen 4, the outermost move is considered the last move for Copycat
			this.battle.activeMove = oldActiveMove;
		}
	}
	/**
	 * useMove is the "inside" move caller. It handles effects of the
	 * move itself, but not the idea of using the move.
	 *
	 * Most caller effects, like Sleep Talk, Nature Power, Magic Bounce,
	 * etc use useMove.
	 *
	 * The only ones that use runMove are Instruct, Pursuit, and
	 * Dancer.
	 */
	useMove(
		move: Move | string, pokemon: Pokemon, options?: {
			target?: Pokemon | null, sourceEffect?: Effect | null,
			zMove?: string, maxMove?: string,
		}
	) {
		pokemon.moveThisTurnResult = undefined;
		const oldMoveResult: boolean | null | undefined = pokemon.moveThisTurnResult;
		const moveResult = this.useMoveInner(move, pokemon, options);
		if (oldMoveResult === pokemon.moveThisTurnResult) pokemon.moveThisTurnResult = moveResult;
		return moveResult;
	}
	useMoveInner(
		moveOrMoveName: Move | string, pokemon: Pokemon, options?: {
			target?: Pokemon | null, sourceEffect?: Effect | null,
			zMove?: string, maxMove?: string,
		},
	) {
		let target = options?.target;
		let sourceEffect = options?.sourceEffect;
		const zMove = options?.zMove;
		const maxMove = options?.maxMove;
		if (!sourceEffect && this.battle.effect.id) sourceEffect = this.battle.effect;
		if (sourceEffect && ['instruct', 'custapberry'].includes(sourceEffect.id)) sourceEffect = null;

		let move = this.dex.getActiveMove(moveOrMoveName);
		pokemon.lastMoveUsed = move;
		if (move.id === 'weatherball' && zMove) {
			// Z-Weather Ball only changes types if it's used directly,
			// not if it's called by Z-Sleep Talk or something.
			this.battle.singleEvent('ModifyType', move, null, pokemon, target, move, move);
			if (move.type !== 'Normal') sourceEffect = move;
		}
		if (zMove || (move.category !== 'Status' && sourceEffect && (sourceEffect as ActiveMove).isZ)) {
			move = this.getActiveZMove(move, pokemon);
		}
		if (maxMove && move.category !== 'Status') {
			// Max move outcome is dependent on the move type after type modifications from ability and the move itself
			this.battle.singleEvent('ModifyType', move, null, pokemon, target, move, move);
			this.battle.runEvent('ModifyType', pokemon, target, move, move);
		}
		if (maxMove || (move.category !== 'Status' && sourceEffect && (sourceEffect as ActiveMove).isMax)) {
			move = this.getActiveMaxMove(move, pokemon);
		}

		if (this.battle.activeMove) {
			move.priority = this.battle.activeMove.priority;
			if (!move.hasBounced) move.pranksterBoosted = this.battle.activeMove.pranksterBoosted;
		}
		const baseTarget = move.target;
		let targetRelayVar = { target };
		targetRelayVar = this.battle.runEvent('ModifyTarget', pokemon, target, move, targetRelayVar, true);
		if (targetRelayVar.target !== undefined) target = targetRelayVar.target;
		if (target === undefined) target = this.battle.getRandomTarget(pokemon, move);
		if (move.target === 'self' || move.target === 'allies') {
			target = pokemon;
		}
		if (sourceEffect) {
			move.sourceEffect = sourceEffect.id;
			move.ignoreAbility = (sourceEffect as ActiveMove).ignoreAbility;
		}
		let moveResult = false;

		this.battle.setActiveMove(move, pokemon, target);

		this.battle.singleEvent('ModifyType', move, null, pokemon, target, move, move);
		this.battle.singleEvent('ModifyMove', move, null, pokemon, target, move, move);
		if (baseTarget !== move.target) {
			// Target changed in ModifyMove, so we must adjust it here
			// Adjust before the next event so the correct target is passed to the
			// event
			target = this.battle.getRandomTarget(pokemon, move);
		}
		move = this.battle.runEvent('ModifyType', pokemon, target, move, move);
		move = this.battle.runEvent('ModifyMove', pokemon, target, move, move);
		if (baseTarget !== move.target) {
			// Adjust again
			target = this.battle.getRandomTarget(pokemon, move);
		}
		if (!move || pokemon.fainted) {
			return false;
		}

		let attrs = '';

		let movename = move.name;
		if (move.id === 'hiddenpower') movename = 'Hidden Power';
		if (sourceEffect) attrs += `|[from] ${sourceEffect.fullname}`;
		if (zMove && move.isZ === true) {
			attrs = `|[anim]${movename}${attrs}`;
			movename = `Z-${movename}`;
		}
		this.battle.addMove('move', pokemon, movename, `${target}${attrs}`);

		if (zMove) this.runZPower(move, pokemon);

		if (!target) {
			this.battle.attrLastMove('[notarget]');
			this.battle.add(this.battle.gen >= 5 ? '-fail' : '-notarget', pokemon);
			return false;
		}

		const originalTarget = target;
		const { targets, pressureTargets } = pokemon.getMoveTargets(move, target);
		if (targets.length) {
			target = targets[targets.length - 1]; // in case of redirection
		}
		if (
			this.battle.gameType !== 'freeforall' && move.multihit && targets.length > 1 &&
			move.multihitType !== 'dualwield' && ['allAdjacent', 'allAdjacentFoes'].includes(move.target)
		) {
			const selectedTarget = targets.includes(originalTarget) ? originalTarget : target;
			targets.splice(0, targets.length, selectedTarget);
		}
		if (this.battle.gameType === 'freeforall' && move.multihitType === 'dualwield' && targets.length > 1) {
			const selectedTarget = targets.includes(originalTarget) ? originalTarget : target;
			targets.splice(0, targets.length, selectedTarget);
		}

		const callerMoveForPressure = sourceEffect && (sourceEffect as ActiveMove).pp ? sourceEffect as ActiveMove : null;
		if (!sourceEffect || callerMoveForPressure || sourceEffect.id === 'pursuit') {
			let extraPP = 0;
			for (const source of pressureTargets) {
				const ppDrop = this.battle.runEvent('DeductPP', source, pokemon, move);
				if (ppDrop !== true) {
					extraPP += ppDrop || 0;
				}
			}
			if (extraPP > 0) {
				pokemon.deductPP(callerMoveForPressure || moveOrMoveName, extraPP);
			}
		}

		let tryMoveResult = this.battle.singleEvent('TryMove', move, null, pokemon, target, move);
		if (tryMoveResult) {
			tryMoveResult = this.battle.runEvent('TryMove', pokemon, target, move);
		}
		if (!tryMoveResult) {
			move.mindBlownRecoil = false;
			return tryMoveResult;
		}

		this.battle.singleEvent('UseMoveMessage', move, null, pokemon, target, move);

		if (move.ignoreImmunity === undefined) {
			move.ignoreImmunity = (move.category === 'Status');
		}

		if (this.battle.gen !== 4 && move.selfdestruct === 'always') {
			this.battle.faint(pokemon, pokemon, move);
		}

		let damage: number | false | undefined | '' = false;
		if (move.target === 'all' || move.target === 'foeSide' || move.target === 'allySide' || move.target === 'allyTeam') {
			damage = this.tryMoveHit(targets, pokemon, move);
			if (damage === this.battle.NOT_FAIL) pokemon.moveThisTurnResult = null;
			if (damage || damage === 0 || damage === undefined) moveResult = true;
		} else {
			if (!targets.length) {
				this.battle.attrLastMove('[notarget]');
				this.battle.add(this.battle.gen >= 5 ? '-fail' : '-notarget', pokemon);
				return false;
			}
			if (this.battle.gen === 4 && move.selfdestruct === 'always') {
				this.battle.faint(pokemon, pokemon, move);
			}
			moveResult = this.trySpreadMoveHit(targets, pokemon, move);
		}
		if (move.selfBoost && moveResult) this.moveHit(pokemon, pokemon, move, move.selfBoost, false, true);
		if (!pokemon.hp) {
			this.battle.faint(pokemon, pokemon, move);
		}

		if (!moveResult) {
			this.battle.singleEvent('MoveFail', move, null, target, pokemon, move);
			return false;
		}

		if (!(move.hasSheerForce && pokemon.hasAbility('sheerforce')) && !move.flags['futuremove']) {
			const originalHp = pokemon.hp;
			this.battle.singleEvent('AfterMoveSecondarySelf', move, null, pokemon, target, move);
			this.battle.runEvent('AfterMoveSecondarySelf', pokemon, target, move);
			if (pokemon && pokemon !== target && move.category !== 'Status') {
				if (pokemon.hp <= pokemon.maxhp / 2 && originalHp > pokemon.maxhp / 2) {
					this.battle.runEvent('EmergencyExit', pokemon, pokemon);
				}
			}
		}

		return true;
	}
	/** NOTE: includes single-target moves */
	trySpreadMoveHit(targets: Pokemon[], pokemon: Pokemon, move: ActiveMove, notActive?: boolean) {
		if (targets.length > 1 && !move.smartTarget) move.spreadHit = true;

		const moveSteps: ((targets: Pokemon[], pokemon: Pokemon, move: ActiveMove) =>
		(number | boolean | "" | undefined)[] | undefined)[] = [
			// 0. check for semi invulnerability
			this.hitStepInvulnerabilityEvent,

			// 1. run the 'TryHit' event (Protect, Magic Bounce, Volt Absorb, etc.) (this is step 2 in gens 5 & 6, and step 4 in gen 4)
			this.hitStepTryHitEvent,

			// 2. check for type immunity (this is step 1 in gens 4-6)
			this.hitStepTypeImmunity,

			// 3. check for various move-specific immunities
			this.hitStepTryImmunity,

			// 4. check accuracy
			this.hitStepAccuracy,

			// 5. break protection effects
			this.hitStepBreakProtect,

			// 6. steal positive boosts (Spectral Thief)
			this.hitStepStealBoosts,

			// 7. loop that processes each hit of the move (has its own steps per iteration)
			this.hitStepMoveHitLoop,
		];
		if (this.battle.gen <= 6) {
			// Swap step 1 with step 2
			[moveSteps[1], moveSteps[2]] = [moveSteps[2], moveSteps[1]];
		}
		if (this.battle.gen === 4) {
			// Swap step 4 with new step 2 (old step 1)
			[moveSteps[2], moveSteps[4]] = [moveSteps[4], moveSteps[2]];
		}

		if (notActive) this.battle.setActiveMove(move, pokemon, targets[0]);

		const hitResult = this.battle.singleEvent('Try', move, null, pokemon, targets[0], move) &&
			this.battle.singleEvent('PrepareHit', move, {}, targets[0], pokemon, move) &&
			this.battle.runEvent('PrepareHit', pokemon, targets[0], move);
		if (!hitResult) {
			if (hitResult === false) {
				this.battle.add('-fail', pokemon);
				this.battle.attrLastMove('[still]');
			}
			return hitResult === this.battle.NOT_FAIL;
		}

		let atLeastOneFailure = false;
		for (const step of moveSteps) {
			const hitResults: (number | boolean | "" | undefined)[] | undefined = step.call(this, targets, pokemon, move);
			if (!hitResults) continue;
			targets = targets.filter((val, i) => hitResults[i] || hitResults[i] === 0);
			atLeastOneFailure = atLeastOneFailure || hitResults.some(val => val === false);
			if (move.smartTarget && atLeastOneFailure) move.smartTarget = false;
			if (!targets.length) {
				// console.log(step.name);
				break;
			}
		}

		move.hitTargets = targets;
		const moveResult = !!targets.length;
		if (!moveResult && !atLeastOneFailure) pokemon.moveThisTurnResult = null;
		const hitSlot = targets.map(p => p.getSlot());
		if (move.spreadHit) this.battle.attrLastMove('[spread] ' + hitSlot.join(','));
		return moveResult;
	}
	waterShurikenTargetHasWaterImmunity(target: Pokemon) {
		return target.hasAbility([
			'auroraresonance', 'dryskin', 'parasitism', 'safeharbor', 'stormdrain', 'waterabsorb',
		]);
	}
	redirectWaterShurikenFromProtect(targets: Pokemon[], pokemon: Pokemon, move: ActiveMove) {
		if (move.id !== 'watershuriken') return;
		for (const [i, target] of targets.entries()) {
			if (!target?.isProtected() || this.waterShurikenTargetHasWaterImmunity(target)) continue;
			const candidates = pokemon.foes().filter(foe =>
				foe && foe.hp && !foe.fainted && foe !== target && this.battle.validTarget(foe, pokemon, move.target)
			);
			if (!candidates.length) continue;
			const newTarget = this.battle.sample(candidates);
			this.battle.add('-message', `${move.name} slipped past Protect toward ${newTarget.name}!`);
			targets[i] = newTarget;
		}
	}
	focusSpiralEvolutionSpreadFromProtect(targets: Pokemon[], pokemon: Pokemon, move: ActiveMove) {
		if (!['twineedle', 'doublehit'].includes(move.id) || !pokemon.hasAbility('spiralevolution')) return;
		const unprotectedTargets = targets.filter(target => target?.hp && !target.fainted && !target.isProtected());
		if (!unprotectedTargets.length) return;
		for (const [i, target] of targets.entries()) {
			if (target?.isProtected()) targets[i] = this.battle.sample(unprotectedTargets);
		}
	}
	focusSmartTargetFromProtect(targets: Pokemon[], pokemon: Pokemon, move: ActiveMove) {
		if (!move.smartTarget || targets.length < 2) return;
		const unprotectedTargets = targets.filter(target =>
			target?.hp && !target.fainted && !target.isProtected() && !target.isSemiInvulnerable()
		);
		if (!unprotectedTargets.length) return;
		for (const [i, target] of targets.entries()) {
			if (target?.isProtected() || target?.isSemiInvulnerable()) {
				targets[i] = this.battle.sample(unprotectedTargets);
			}
		}
	}
	hitStepInvulnerabilityEvent(targets: Pokemon[], pokemon: Pokemon, move: ActiveMove) {
		this.focusSmartTargetFromProtect(targets, pokemon, move);
		if (move.id === 'helpinghand') return new Array(targets.length).fill(true);
		const hitResults: boolean[] = [];
		for (const [i, target] of targets.entries()) {
			if (target.volatiles['commanding']) {
				hitResults[i] = false;
			} else if (this.battle.gen >= 8 && move.id === 'toxic' && pokemon.hasType('Poison')) {
				hitResults[i] = true;
			} else {
				hitResults[i] = this.battle.runEvent('Invulnerability', target, pokemon, move);
			}
			if (hitResults[i] === false) {
				if (move.smartTarget) {
					move.smartTarget = false;
				} else {
					if (!move.spreadHit) this.battle.attrLastMove('[miss]');
					this.battle.add('-miss', pokemon, target);
				}
			}
			this.battle.runEvent('Miss', pokemon, target, move);
		}
		return hitResults;
	}
	hitStepTryHitEvent(targets: Pokemon[], pokemon: Pokemon, move: ActiveMove) {
		this.redirectWaterShurikenFromProtect(targets, pokemon, move);
		this.focusSpiralEvolutionSpreadFromProtect(targets, pokemon, move);
		const hitResults = this.battle.runEvent('TryHit', targets, pokemon, move);
		if (!hitResults.includes(true) && hitResults.includes(false)) {
			this.battle.add('-fail', pokemon);
			this.battle.attrLastMove('[still]');
		}
		for (const i of targets.keys()) {
			this.battle.runEvent('Miss', pokemon, targets[i], move);
			if (hitResults[i] !== this.battle.NOT_FAIL) hitResults[i] = hitResults[i] || false;
		}
		return hitResults;
	}
	hitStepTypeImmunity(targets: Pokemon[], pokemon: Pokemon, move: ActiveMove) {
		if (move.ignoreImmunity === undefined) {
			move.ignoreImmunity = (move.category === 'Status');
		}

		const hitResults = [];
		for (const i of targets.keys()) {
			hitResults[i] = targets[i].runImmunity(move, !move.smartTarget);
		}

		return hitResults;
	}
	hitStepTryImmunity(targets: Pokemon[], pokemon: Pokemon, move: ActiveMove) {
		const hitResults = [];
		for (const [i, target] of targets.entries()) {
			if (this.battle.gen >= 6 && move.flags['powder'] && target !== pokemon && !this.dex.getImmunity('powder', target)) {
				this.battle.debug('natural powder immunity');
				this.battle.add('-immune', target);
				hitResults[i] = false;
			} else if (!this.battle.singleEvent('TryImmunity', move, {}, target, pokemon, move)) {
				this.battle.add('-immune', target);
				hitResults[i] = false;
			} else if (this.battle.gen >= 7 && move.pranksterBoosted && pokemon.hasAbility('prankster') &&
				!targets[i].isAlly(pokemon) && !this.dex.getImmunity('prankster', target)) {
				this.battle.debug('natural prankster immunity');
				if (target.illusion || !(move.status && !this.dex.getImmunity(move.status, target))) {
					this.battle.hint("Since gen 7, Dark is immune to Prankster moves.");
				}
				this.battle.add('-immune', target);
				hitResults[i] = false;
			} else {
				hitResults[i] = true;
			}
		}
		return hitResults;
	}
	hitStepAccuracy(targets: Pokemon[], pokemon: Pokemon, move: ActiveMove) {
		const hitResults = [];
		for (const [i, target] of targets.entries()) {
			this.battle.activeTarget = target;
			// calculate true accuracy
			let accuracy = move.accuracy;
			if (move.ohko) { // bypasses accuracy modifiers
				if (!target.isSemiInvulnerable()) {
					accuracy = 30;
					if (move.ohko === 'Ice' && this.battle.gen >= 7 && !pokemon.hasType('Ice')) {
						accuracy = 20;
					}
					if (!target.volatiles['dynamax'] && pokemon.level >= target.level &&
						(move.ohko === true || !target.hasType(move.ohko))) {
						accuracy += (pokemon.level - target.level);
					} else {
						this.battle.add('-immune', target, '[ohko]');
						hitResults[i] = false;
						continue;
					}
				}
			} else {
				accuracy = this.battle.runEvent('ModifyAccuracy', target, pokemon, move, accuracy);
				if (accuracy !== true) {
					let boost = 0;
					if (!move.ignoreAccuracy) {
						const boosts = this.battle.runEvent('ModifyBoost', pokemon, null, null, { ...pokemon.boosts });
						boost = this.battle.clampIntRange(boosts['accuracy'], -6, 6);
					}
					if (!move.ignoreEvasion) {
						const boosts = this.battle.runEvent('ModifyBoost', target, null, null, { ...target.boosts });
						boost = this.battle.clampIntRange(boost - boosts['evasion'], -6, 6);
					}
					if (boost > 0) {
						accuracy = this.battle.trunc(accuracy * (3 + boost) / 3);
					} else if (boost < 0) {
						accuracy = this.battle.trunc(accuracy * 3 / (3 - boost));
					}
				}
			}
			if (
				move.alwaysHit || (move.id === 'toxic' && this.battle.gen >= 8 && pokemon.hasType('Poison')) ||
				(move.target === 'self' && move.category === 'Status' && !target.isSemiInvulnerable())
			) {
				accuracy = true; // bypasses ohko accuracy modifiers
			} else {
				accuracy = this.battle.runEvent('Accuracy', target, pokemon, move, accuracy);
			}
			if (accuracy !== true && !this.battle.randomChance(accuracy, 100)) {
				if (move.smartTarget) {
					move.smartTarget = false;
				} else {
					if (!move.spreadHit) this.battle.attrLastMove('[miss]');
					this.battle.add('-miss', pokemon, target);
				}
				if (!move.ohko && pokemon.hasItem('blunderpolicy') && pokemon.useItem()) {
					this.battle.boost({ spe: 2 }, pokemon);
				}
				this.battle.runEvent('Miss', pokemon, target, move);
				hitResults[i] = false;
				continue;
			}
			hitResults[i] = true;
		}
		return hitResults;
	}
	hitStepBreakProtect(targets: Pokemon[], pokemon: Pokemon, move: ActiveMove) {
		if (move.breaksProtect) {
			const spiralMove = move as ActiveMove & {
				spiralEvolutionBreaksProtect?: boolean,
				spiralEvolutionProtectedTargets?: Pokemon[],
				fallenStarBreaksProtect?: boolean,
				fallenStarProtectedTargets?: Pokemon[],
				spitUpBreaksProtect?: boolean,
				spitUpProtectedTargets?: Pokemon[],
			};
			for (const target of targets) {
				let broke = false;
				if (spiralMove.spiralEvolutionBreaksProtect && target.isProtected()) {
					if (!spiralMove.spiralEvolutionProtectedTargets) spiralMove.spiralEvolutionProtectedTargets = [];
					spiralMove.spiralEvolutionProtectedTargets.push(target);
				}
				if (spiralMove.fallenStarBreaksProtect && target.isProtected()) {
					if (!spiralMove.fallenStarProtectedTargets) spiralMove.fallenStarProtectedTargets = [];
					spiralMove.fallenStarProtectedTargets.push(target);
				}
				if (spiralMove.spitUpBreaksProtect && target.isProtected()) {
					if (!spiralMove.spitUpProtectedTargets) spiralMove.spitUpProtectedTargets = [];
					spiralMove.spitUpProtectedTargets.push(target);
				}
				for (const effectid of [
					'banefulbunker', 'burningbulwark', 'kingsshield', 'obstruct', 'protect', 'silktrap', 'spikyshield',
				]) {
					if (target.removeVolatile(effectid)) broke = true;
				}
				if (this.battle.gen >= 6 || !target.isAlly(pokemon)) {
					for (const effectid of ['craftyshield', 'matblock', 'quickguard', 'wideguard']) {
						if (target.side.removeSideCondition(effectid)) broke = true;
					}
				}
				if (broke) {
					if (move.id === 'feint') {
						this.battle.add('-activate', target, 'move: Feint');
					} else {
						this.battle.add('-activate', target, `move: ${move.name}`, '[broken]');
					}
					if (this.battle.gen >= 6) delete target.volatiles['stall'];
				}
			}
		}
		return undefined;
	}
	hitStepStealBoosts(targets: Pokemon[], pokemon: Pokemon, move: ActiveMove) {
		const target = targets[0]; // hardcoded
		if (move.stealsBoosts) {
			const boosts: SparseBoostsTable = {};
			let stolen = false;
			let statName: BoostID;
			for (statName in target.boosts) {
				const stage = target.boosts[statName];
				if (stage > 0) {
					boosts[statName] = stage;
					stolen = true;
				}
			}
			if (stolen) {
				this.battle.attrLastMove('[still]');
				this.battle.add('-clearpositiveboost', target, pokemon, 'move: ' + move.name);
				this.battle.boost(boosts, pokemon, pokemon);

				let statName2: BoostID;
				for (statName2 in boosts) {
					boosts[statName2] = 0;
				}
				target.setBoost(boosts);
				if (move.id === "spectralthief") {
					this.battle.addMove('-anim', pokemon, "Spectral Thief", target);
				}
			}
		}
		return undefined;
	}
	afterMoveSecondaryEvent(targets: Pokemon[], pokemon: Pokemon, move: ActiveMove) {
		// console.log(`${targets}, ${pokemon}, ${move}`)
		if (!(move.hasSheerForce && pokemon.hasAbility('sheerforce'))) {
			this.battle.singleEvent('AfterMoveSecondary', move, null, targets[0], pokemon, move);
			this.battle.runEvent('AfterMoveSecondary', targets, pokemon, move);
		}
		return undefined;
	}
	/** NOTE: used only for moves that target sides/fields rather than pokemon */
	tryMoveHit(targetOrTargets: Pokemon | Pokemon[], pokemon: Pokemon, move: ActiveMove): number | undefined | false | '' {
		const target = Array.isArray(targetOrTargets) ? targetOrTargets[0] : targetOrTargets;
		const targets = Array.isArray(targetOrTargets) ? targetOrTargets : [target];

		this.battle.setActiveMove(move, pokemon, targets[0]);

		let hitResult = this.battle.singleEvent('Try', move, null, pokemon, target, move) &&
			this.battle.singleEvent('PrepareHit', move, {}, target, pokemon, move) &&
			this.battle.runEvent('PrepareHit', pokemon, target, move);
		if (!hitResult) {
			if (hitResult === false) {
				this.battle.add('-fail', pokemon);
				this.battle.attrLastMove('[still]');
			}
			return false;
		}

		const isFFAHazard = move.target === 'foeSide' && this.battle.gameType === 'freeforall';
		if (move.target === 'all') {
			hitResult = this.battle.runEvent('TryHitField', target, pokemon, move);
		} else if (isFFAHazard) {
			const hitResults: any[] = this.battle.runEvent('TryHitSide', targets, pokemon, move);
			// if some side blocked the move, prevent the move from executing against any other sides
			if (hitResults.some(result => !result)) return false;
			hitResult = true;
		} else {
			hitResult = this.battle.runEvent('TryHitSide', target, pokemon, move);
		}
		if (!hitResult) {
			if (hitResult === false) {
				this.battle.add('-fail', pokemon);
				this.battle.attrLastMove('[still]');
			}
			return false;
		}
		return this.moveHit(isFFAHazard ? targets : target, pokemon, move);
	}
	hitStepMoveHitLoop(targets: Pokemon[], pokemon: Pokemon, move: ActiveMove) { // Temporary name
		let damage: (number | boolean | undefined)[] = [];
		for (const i of targets.keys()) {
			damage[i] = 0;
		}
		move.totalDamage = 0;
		pokemon.lastDamage = 0;
		let targetHits = move.multihit || 1;
		if (Array.isArray(targetHits)) {
			if (pokemon.hasItem('loadeddice')) {
				targetHits = 5 + this.battle.random(2);
			// yes, it's hardcoded... meh
			} else if (targetHits[0] === 2 && targetHits[1] === 5) {
				if (this.battle.gen >= 5) {
					// 35-35-15-15 out of 100 for 2-3-4-5 hits
					targetHits = this.battle.sample([2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 5, 5, 5]);
				} else {
					targetHits = this.battle.sample([2, 2, 2, 3, 3, 3, 4, 5]);
				}
			} else {
				targetHits = this.battle.random(targetHits[0], targetHits[1] + 1);
			}
		}
		if (targetHits === 10 && pokemon.hasItem('loadeddice')) targetHits = 5 + this.battle.random(2);
		targetHits = Math.floor(targetHits);
		let nullDamage = true;
		let successfulDualWieldHits = 0;
		let moveDamage: (number | boolean | undefined)[] = [];
		const originalMultihitTarget = targets.find(target => !!target) || null;
		// There is no need to recursively check the ´sleepUsable´ flag as Sleep Talk can only be used while asleep.
		const isSleepUsable = move.sleepUsable || this.dex.moves.get(move.sourceEffect).sleepUsable;

		let targetsCopy: (Pokemon | false | null)[] = targets.slice(0);
		let hit: number;
		for (hit = 1; hit <= targetHits; hit++) {
			if (damage.includes(false)) break;
			if (hit > 1 && pokemon.status === 'slp' && (!isSleepUsable || this.battle.gen === 4)) break;
			(move as any).spilloverDamageModifier = undefined;
			if (hit > 1 && move.dualWieldFullPower) {
				const livingFoes = pokemon.foes().filter(foe => foe?.hp && !foe.fainted);
				if (!livingFoes.length) break;
				const otherFoes = livingFoes.filter(foe => foe !== originalMultihitTarget);
				targets = [this.battle.sample(otherFoes.length ? otherFoes : livingFoes)];
				damage = [0];
				move.smartTarget = false;
			}
			if (targets.every(target => !target?.hp)) {
				const spilloverTarget = originalMultihitTarget && this.getMultihitSpilloverTarget(originalMultihitTarget, pokemon, move, hit, targetHits);
				if (!spilloverTarget) break;
				targets = [spilloverTarget];
				damage = [0];
				move.smartTarget = false;
			}
			move.hit = hit;
			move.lastHit = move.hit === targetHits;
			if (move.smartTarget && targets.length > 1) {
				targetsCopy = [targets[hit - 1]];
				damage = [damage[hit - 1]];
			} else {
				targetsCopy = targets.slice(0);
			}
			const targetsHadHP = targetsCopy.map(target => !!target && target.hp > 0);
			const target = targetsCopy[0]; // some relevant-to-single-target-moves-only things are hardcoded
			if (target && hit > 1 && move.dualWieldFullPower && target !== originalMultihitTarget) {
				if (this.battle.runEvent('Invulnerability', target, pokemon, move) === false) {
					this.battle.add('-miss', pokemon, target);
					this.battle.runEvent('Miss', pokemon, target, move);
					continue;
				}
				const tryHit = this.battle.runEvent('TryHit', [target], pokemon, move)[0];
				if (!tryHit || !target.runImmunity(move, true)) continue;
			}
			if (target && typeof move.smartTarget === 'boolean') {
				if (hit > 1) {
					this.battle.addMove('-anim', pokemon, move.name, target);
				} else {
					this.battle.retargetLastMove(target);
				}
			}

			// Triple Kick checks after its first hit; Dual Wield checks both hits independently.
			const dualWieldAccuracyCheck = move.multihitType === 'dualwield' && move.dualWieldAccuracy !== undefined;
			if (target && ((move.multiaccuracy && hit > 1) || dualWieldAccuracyCheck)) {
				let accuracy = dualWieldAccuracyCheck ? move.dualWieldAccuracy! : move.accuracy;
				const boostTable = [1, 4 / 3, 5 / 3, 2, 7 / 3, 8 / 3, 3];
				if (accuracy !== true) {
					if (!move.ignoreAccuracy) {
						const boosts = this.battle.runEvent('ModifyBoost', pokemon, null, null, { ...pokemon.boosts });
						const boost = this.battle.clampIntRange(boosts['accuracy'], -6, 6);
						if (boost > 0) {
							accuracy *= boostTable[boost];
						} else {
							accuracy /= boostTable[-boost];
						}
					}
					if (!move.ignoreEvasion) {
						const boosts = this.battle.runEvent('ModifyBoost', target, null, null, { ...target.boosts });
						const boost = this.battle.clampIntRange(boosts['evasion'], -6, 6);
						if (boost > 0) {
							accuracy /= boostTable[boost];
						} else if (boost < 0) {
							accuracy *= boostTable[-boost];
						}
					}
				}
				accuracy = this.battle.runEvent('ModifyAccuracy', target, pokemon, move, accuracy);
				if (!move.alwaysHit) {
					accuracy = this.battle.runEvent('Accuracy', target, pokemon, move, accuracy);
					if (accuracy !== true && !this.battle.randomChance(accuracy, 100)) {
						if (!dualWieldAccuracyCheck) break;
						this.battle.add('-miss', pokemon, target);
						if (pokemon.hasItem('blunderpolicy') && pokemon.useItem()) {
							this.battle.boost({ spe: 2 }, pokemon);
						}
						this.battle.runEvent('Miss', pokemon, target, move);
						continue;
					}
				}
			}

			const moveData = move;
			if (!moveData.flags) moveData.flags = {};

			let moveDamageThisHit;
			// Modifies targetsCopy (which is why it's a copy)
			[moveDamageThisHit, targetsCopy] = this.spreadMoveHit(targetsCopy, pokemon, move, moveData);
			// When Dragon Darts targets two different pokemon, targetsCopy is a length 1 array each hit
			// so spreadMoveHit returns a length 1 damage array
			if (move.smartTarget) {
				moveDamage.push(...moveDamageThisHit);
			} else {
				moveDamage = moveDamageThisHit;
			}

			if (!moveDamage.some(val => val !== false)) break;
			nullDamage = false;
			if (move.multihitType === 'dualwield') successfulDualWieldHits++;

			for (const [i, md] of moveDamage.entries()) {
				if (move.smartTarget && i !== hit - 1) continue;
				// Damage from each hit is individually counted for the
				// purposes of Counter, Metal Burst, and Mirror Coat.
				damage[i] = md === true || !md ? 0 : md;
				// Total damage dealt is accumulated for the purposes of recoil (Parental Bond).
				move.totalDamage += damage[i];
			}
			if (move.mindBlownRecoil) {
				const hpBeforeRecoil = pokemon.hp;
				this.battle.damage(Math.round(pokemon.maxhp / 2), pokemon, pokemon, this.dex.conditions.get(move.id), true);
				move.mindBlownRecoil = false;
				if (pokemon.hp <= pokemon.maxhp / 2 && hpBeforeRecoil > pokemon.maxhp / 2) {
					this.battle.runEvent('EmergencyExit', pokemon, pokemon);
				}
			}
			this.battle.eachEvent('Update');
			if (hit < targetHits && targets.every(target => !target?.hp)) {
				const spilloverTarget = originalMultihitTarget && this.getMultihitSpilloverTarget(originalMultihitTarget, pokemon, move, hit + 1, targetHits);
				if (spilloverTarget) {
					targets = [spilloverTarget];
					damage = [0];
					move.smartTarget = false;
				}
			}
			if ((move as any).shadowCurrentExtraHit && !(move as any).shadowCurrentExtraHitUsed) {
				const gotKO = targetsCopy.some((target, i) => targetsHadHP[i] && target && !target.hp);
				if (gotKO) {
					(move as any).shadowCurrentExtraHitUsed = true;
					targetHits++;
					move.lastHit = false;
				}
			}
			if (!pokemon.hp && targets.length === 1) {
				hit++; // report the correct number of hits for multihit moves
				break;
			}
		}
		// hit is 1 higher than the actual hit count
		if (hit === 1) return damage.fill(false);
		if (nullDamage) damage.fill(false);
		this.battle.faintMessages(false, false, !pokemon.hp);
		if (move.multihit && typeof move.smartTarget !== 'boolean' && !move.dualWieldFullPower) {
			const hitCount = move.multihitType === 'dualwield' ? successfulDualWieldHits : hit - 1;
			if (hitCount) this.battle.add('-hitcount', targets[0], hitCount);
		}

		if ((move.recoil || move.id === 'chloroblast') && move.totalDamage) {
			const hpBeforeRecoil = pokemon.hp;
			this.battle.damage(this.calcRecoilDamage(move.totalDamage, move, pokemon), pokemon, pokemon, 'recoil');
			if (pokemon.hp <= pokemon.maxhp / 2 && hpBeforeRecoil > pokemon.maxhp / 2) {
				this.battle.runEvent('EmergencyExit', pokemon, pokemon);
			}
		}

		if (move.struggleRecoil) {
			const hpBeforeRecoil = pokemon.hp;
			let recoilDamage;
			if (this.dex.gen >= 5) {
				recoilDamage = this.battle.clampIntRange(Math.round(pokemon.baseMaxhp / 4), 1);
			} else {
				recoilDamage = this.battle.clampIntRange(this.battle.trunc(pokemon.maxhp / 4), 1);
			}
			this.battle.directDamage(recoilDamage, pokemon, pokemon, { id: 'strugglerecoil' } as Condition);
			if (pokemon.hp <= pokemon.maxhp / 2 && hpBeforeRecoil > pokemon.maxhp / 2) {
				this.battle.runEvent('EmergencyExit', pokemon, pokemon);
			}
		}

		// smartTarget messes up targetsCopy, but smartTarget should in theory ensure that targets will never fail, anyway
		if (move.smartTarget) {
			targetsCopy = targets.slice(0);
		}

		for (const [i, target] of targetsCopy.entries()) {
			if (target && pokemon !== target) {
				target.gotAttacked(move, moveDamage[i] as number | false | undefined, pokemon);
				if (typeof moveDamage[i] === 'number') {
					target.timesAttacked += move.smartTarget ? 1 :
						(move.multihitType === 'dualwield' ? successfulDualWieldHits : hit - 1);
				}
			}
		}

		if (move.ohko && !targets[0].hp) this.battle.add('-ohko');

		if (!damage.some(val => !!val || val === 0)) return damage;

		this.battle.eachEvent('Update');

		this.afterMoveSecondaryEvent(targetsCopy.filter(val => !!val), pokemon, move);

		if (!(move.hasSheerForce && pokemon.hasAbility('sheerforce'))) {
			for (const [i, d] of damage.entries()) {
				// There are no multihit spread moves, so it's safe to use move.totalDamage for multihit moves
				// The previous check was for `move.multihit`, but that fails for Dragon Darts
				const curDamage = targets.length === 1 ? move.totalDamage : d;
				if (typeof curDamage === 'number' && targets[i].hp) {
					const targetHPBeforeDamage = (targets[i].hurtThisTurn || 0) + curDamage;
					if (targets[i].hp <= targets[i].maxhp / 2 && targetHPBeforeDamage > targets[i].maxhp / 2) {
						this.battle.runEvent('EmergencyExit', targets[i], pokemon);
					}
				}
			}
		}

		return damage;
	}

	getMultihitSpilloverTarget(originalTarget: Pokemon, pokemon: Pokemon, move: ActiveMove, hit: number, targetHits: number) {
		if (hit > targetHits) return null;
		const parentalLike = ['parentalbond', 'hydrabond'].includes(move.multihitType || '');
		if (!parentalLike && !move.multihit) return null;
		if (this.battle.gameType === 'freeforall') {
			const targets = pokemon.foes().filter(target =>
				target && target !== originalTarget && target.hp && !target.fainted && !target.isProtected() &&
				!target.isSemiInvulnerable()
			);
			if (!targets.length) return null;
			(move as any).spilloverDamageModifier = move.multihitType === 'parentalbond' ? 0.8 : 0.7;
			return this.battle.sample(targets);
		}
		const ally = originalTarget.side.active.find(target =>
			target && target !== originalTarget && target.hp && !target.fainted && !target.isProtected() &&
			!target.isSemiInvulnerable() && !target.isAlly(pokemon)
		);
		if (!ally) return null;
		(move as any).spilloverDamageModifier = parentalLike ? (move.multihitType === 'hydrabond' ? 0.3 : 0.8) : 0.7;
		return ally;
	}

	spreadMoveHit(
		targets: SpreadMoveTargets, pokemon: Pokemon, moveOrMoveName: ActiveMove,
		hitEffect?: Dex.HitEffect, isSecondary?: boolean, isSelf?: boolean
	): [SpreadMoveDamage, SpreadMoveTargets] {
		// Hardcoded for single-target purposes
		// (no spread moves have any kind of onTryHit handler)
		const target = targets[0];
		let damage: (number | boolean | undefined)[] = [];
		for (const i of targets.keys()) {
			damage[i] = true;
		}
		const move = this.dex.getActiveMove(moveOrMoveName);
		let hitResult: boolean | number | null = true;
		let moveData = hitEffect as ActiveMove;
		if (!moveData) moveData = move;
		if (!moveData.flags) moveData.flags = {};
		if (move.target === 'all' && !isSelf) {
			hitResult = this.battle.singleEvent('TryHitField', moveData, {}, target || null, pokemon, move);
		} else if ((move.target === 'foeSide' || move.target === 'allySide' || move.target === 'allyTeam') && !isSelf) {
			hitResult = this.battle.singleEvent('TryHitSide', moveData, {}, target || null, pokemon, move);
		} else if (target) {
			hitResult = this.battle.singleEvent('TryHit', moveData, {}, target, pokemon, move);
		}
		if (!hitResult) {
			if (hitResult === false) {
				this.battle.add('-fail', pokemon);
				this.battle.attrLastMove('[still]');
			}
			return [[false], targets]; // single-target only
		}

		// 0. check for substitute
		if (!isSecondary && !isSelf) {
			if (move.target !== 'all' && move.target !== 'allyTeam' && move.target !== 'allySide' && move.target !== 'foeSide') {
				damage = this.tryPrimaryHitEvent(damage, targets, pokemon, move, moveData, isSecondary);
			}
		}

		for (const i of targets.keys()) {
			if (damage[i] === this.battle.HIT_SUBSTITUTE) {
				damage[i] = true;
				targets[i] = null;
			}
			if (targets[i] && isSecondary && !moveData.self) {
				damage[i] = true;
			}
			if (!damage[i]) targets[i] = false;
		}
		// 1. call to this.battle.getDamage
		damage = this.getSpreadDamage(damage, targets, pokemon, move, moveData, isSecondary, isSelf);

		for (const i of targets.keys()) {
			if (damage[i] === false) targets[i] = false;
		}

		// 2. call to this.battle.spreadDamage
		const calculatedDamage = damage.slice();
		damage = this.battle.spreadDamage(damage, targets, pokemon, move);

		for (const i of targets.keys()) {
			if (damage[i] === false) targets[i] = false;
		}
		if (!isSecondary && !isSelf) {
			this.spreadKOSpillover(calculatedDamage, damage, targets, pokemon, move);
		}

		// 3. onHit event happens here
		damage = this.runMoveEffects(damage, targets, pokemon, move, moveData, isSecondary, isSelf);

		for (const i of targets.keys()) {
			if (!damage[i] && damage[i] !== 0) targets[i] = false;
		}

		// steps 4 and 5 can mess with this.battle.activeTarget, which needs to be preserved for Dancer
		const activeTarget = this.battle.activeTarget;

		// 4. self drops (start checking for targets[i] === false here)
		if (moveData.self && !move.selfDropped) this.selfDrops(targets, pokemon, move, moveData, isSecondary);

		// 5. secondary effects
		if (moveData.secondaries) this.secondaries(targets, pokemon, move, moveData, isSelf);

		this.battle.activeTarget = activeTarget;

		// 6. force switch
		if (moveData.forceSwitch) damage = this.forceSwitch(damage, targets, pokemon, move);

		for (const i of targets.keys()) {
			if (!damage[i] && damage[i] !== 0) targets[i] = false;
		}

		const damagedTargets: Pokemon[] = [];
		const damagedDamage = [];
		for (const [i, t] of targets.entries()) {
			if (typeof damage[i] === 'number' && t) {
				damagedTargets.push(t);
				damagedDamage.push(damage[i]);
			}
		}
		const pokemonOriginalHP = pokemon.hp;
		if (damagedDamage.length && !isSecondary && !isSelf) {
			if (this.battle.gen >= 5) {
				this.battle.runEvent('DamagingHit', damagedTargets, pokemon, move, damagedDamage);
			}
			if (moveData.onAfterHit && pokemon.hp) {
				for (const t of damagedTargets) {
					this.battle.singleEvent('AfterHit', moveData, {}, t, pokemon, move);
				}
			}
			if (this.battle.gen < 5) {
				this.battle.runEvent('DamagingHit', damagedTargets, pokemon, move, damagedDamage);
			}
			if (pokemon.hp && pokemon.hp <= pokemon.maxhp / 2 && pokemonOriginalHP > pokemon.maxhp / 2) {
				this.battle.runEvent('EmergencyExit', pokemon);
			}
		}

		return [damage, targets];
	}
	spreadKOSpillover(
		calculatedDamage: SpreadMoveDamage, appliedDamage: SpreadMoveDamage,
		targets: SpreadMoveTargets, source: Pokemon, move: ActiveMove
	) {
		if (!move.spreadHit || move.category === 'Status' || !(move as any).allowSpreadKOSpillover) return;
		let leftoverDamage = 0;
		const knockedOut = new Set<Pokemon>();
		for (const [i, target] of targets.entries()) {
			if (!target) continue;
			const calculated = calculatedDamage[i];
			const applied = appliedDamage[i];
			if (typeof calculated !== 'number' || typeof applied !== 'number') continue;
			if (target.hp) continue;
			const leftover = calculated - applied;
			if (leftover <= 0) continue;
			leftoverDamage += leftover;
			knockedOut.add(target);
		}
		if (!leftoverDamage) return;
		const spilloverTargets = targets.filter((target): target is Pokemon => (
			!!target && !knockedOut.has(target) &&
			!!target.hp && !target.fainted && !target.isAlly(source)
		));
		if (!spilloverTargets.length) return;
		const damage = Math.max(1, Math.floor(leftoverDamage / spilloverTargets.length));
		for (const target of spilloverTargets) {
			this.battle.damage(damage, target, source, move);
		}
	}
	tryPrimaryHitEvent(
		damage: SpreadMoveDamage, targets: SpreadMoveTargets, pokemon: Pokemon,
		move: ActiveMove, moveData: ActiveMove, isSecondary?: boolean
	): SpreadMoveDamage {
		for (const [i, target] of targets.entries()) {
			if (!target) continue;
			damage[i] = this.battle.runEvent('TryPrimaryHit', target, pokemon, moveData);
		}
		return damage;
	}
	getSpreadDamage(
		damage: SpreadMoveDamage, targets: SpreadMoveTargets, source: Pokemon,
		move: ActiveMove, moveData: ActiveMove, isSecondary?: boolean, isSelf?: boolean
	): SpreadMoveDamage {
		for (const [i, target] of targets.entries()) {
			if (!target) continue;
			this.battle.activeTarget = target;
			damage[i] = undefined;
			const curDamage = this.getDamage(source, target, moveData);
			// getDamage has several possible return values:
			//
			//   a number:
			//     means that much damage is dealt (0 damage still counts as dealing
			//     damage for the purposes of things like Static)
			//   false:
			//     gives error message: "But it failed!" and move ends
			//   null:
			//     the move ends, with no message (usually, a custom fail message
			//     was already output by an event handler)
			//   undefined:
			//     means no damage is dealt and the move continues
			//
			// basically, these values have the same meanings as they do for event
			// handlers.

			if (curDamage === false || curDamage === null) {
				if (damage[i] === false && !isSecondary && !isSelf) {
					this.battle.add('-fail', source);
					this.battle.attrLastMove('[still]');
				}
				this.battle.debug('damage calculation interrupted');
				damage[i] = false;
				continue;
			}
			damage[i] = curDamage;
		}
		return damage;
	}
	runMoveEffects(
		damage: SpreadMoveDamage, targets: SpreadMoveTargets, source: Pokemon,
		move: ActiveMove, moveData: ActiveMove, isSecondary?: boolean, isSelf?: boolean
	) {
		let didAnything: number | boolean | null | undefined = damage.reduce(this.combineResults);
		for (const [i, target] of targets.entries()) {
			if (target === false) continue;
			let hitResult;
			let didSomething: number | boolean | null | undefined = undefined;

			if (target) {
				if (moveData.boosts && !target.fainted) {
					hitResult = this.battle.boost(moveData.boosts, target, source, move, isSecondary, isSelf);
					didSomething = this.combineResults(didSomething, hitResult);
				}
				if (moveData.heal && !target.fainted) {
					if (target.hp >= target.maxhp) {
						this.battle.add('-fail', target, 'heal');
						this.battle.attrLastMove('[still]');
						damage[i] = this.combineResults(damage[i], false);
						didAnything = this.combineResults(didAnything, null);
						continue;
					}
					const amount = target.baseMaxhp * moveData.heal[0] / moveData.heal[1];
					const d = this.battle.heal((this.battle.gen < 5 ? Math.floor : Math.round)(amount), target, source, move);
					if (!d && d !== 0) {
						if (d !== null) {
							this.battle.add('-fail', source);
							this.battle.attrLastMove('[still]');
						}
						this.battle.debug('heal interrupted');
						damage[i] = this.combineResults(damage[i], false);
						didAnything = this.combineResults(didAnything, null);
						continue;
					}
					didSomething = true;
				}
				if (moveData.status) {
					hitResult = target.trySetStatus(moveData.status, source, moveData.ability ? moveData.ability : move);
					if (!hitResult && move.status) {
						damage[i] = this.combineResults(damage[i], false);
						didAnything = this.combineResults(didAnything, null);
						continue;
					}
					didSomething = this.combineResults(didSomething, hitResult);
				}
				if (moveData.forceStatus) {
					hitResult = target.setStatus(moveData.forceStatus, source, move);
					didSomething = this.combineResults(didSomething, hitResult);
				}
				if (moveData.volatileStatus) {
					hitResult = target.addVolatile(moveData.volatileStatus, source, move);
					didSomething = this.combineResults(didSomething, hitResult);
				}
				if (moveData.sideCondition) {
					hitResult = target.side.addSideCondition(moveData.sideCondition, source, move);
					didSomething = this.combineResults(didSomething, hitResult);
				}
				if (moveData.slotCondition) {
					hitResult = target.side.addSlotCondition(target, moveData.slotCondition, source, move);
					didSomething = this.combineResults(didSomething, hitResult);
				}
				if (moveData.weather) {
					hitResult = this.battle.field.setWeather(moveData.weather, source, move);
					didSomething = this.combineResults(didSomething, hitResult);
				}
				if (moveData.terrain) {
					hitResult = this.battle.field.setTerrain(moveData.terrain, source, move);
					didSomething = this.combineResults(didSomething, hitResult);
				}
				if (moveData.pseudoWeather) {
					hitResult = this.battle.field.addPseudoWeather(moveData.pseudoWeather, source, move);
					didSomething = this.combineResults(didSomething, hitResult);
				}
				if (moveData.forceSwitch) {
					hitResult = !!this.battle.canSwitch(target.side);
					didSomething = this.combineResults(didSomething, hitResult);
				}
				// Hit events
				//   These are like the TryHit events, except we don't need a FieldHit event.
				//   Scroll up for the TryHit event documentation, and just ignore the "Try" part. ;)
				if (move.target === 'all' && !isSelf) {
					if (moveData.onHitField) {
						hitResult = this.battle.singleEvent('HitField', moveData, {}, target, source, move);
						didSomething = this.combineResults(didSomething, hitResult);
					}
				} else if ((move.target === 'foeSide' || move.target === 'allySide') && !isSelf) {
					if (moveData.onHitSide) {
						hitResult = this.battle.singleEvent('HitSide', moveData, {}, target.side, source, move);
						didSomething = this.combineResults(didSomething, hitResult);
					}
				} else {
					if (moveData.onHit) {
						hitResult = this.battle.singleEvent('Hit', moveData, {}, target, source, move);
						didSomething = this.combineResults(didSomething, hitResult);
					}
					if (!isSelf && !isSecondary) {
						this.battle.runEvent('Hit', target, source, move);
					}
				}
			}
			if (moveData.selfdestruct === 'ifHit' && damage[i] !== false) {
				this.battle.faint(source, source, move);
			}
			if (moveData.selfSwitch) {
				if (this.battle.canSwitch(source.side) && !source.volatiles['commanded']) {
					didSomething = true;
				} else {
					didSomething = this.combineResults(didSomething, false);
				}
			}
			// Move didn't fail because it didn't try to do anything
			if (didSomething === undefined) didSomething = true;
			damage[i] = this.combineResults(damage[i], didSomething === null ? false : didSomething);
			didAnything = this.combineResults(didAnything, didSomething);
		}

		if (!didAnything && didAnything !== 0 && !moveData.self && !moveData.selfdestruct) {
			if (!isSelf && !isSecondary) {
				if (didAnything === false) {
					this.battle.add('-fail', source);
					this.battle.attrLastMove('[still]');
				}
			}
			this.battle.debug('move failed because it did nothing');
		} else if (move.selfSwitch && source.hp && !source.volatiles['commanded']) {
			source.switchFlag = move.id;
		}

		return damage;
	}
	selfDrops(
		targets: SpreadMoveTargets, source: Pokemon,
		move: ActiveMove, moveData: ActiveMove, isSecondary?: boolean
	) {
		for (const target of targets) {
			if (target === false) continue;
			if (moveData.self && !move.selfDropped) {
				if (!isSecondary && moveData.self.boosts) {
					const secondaryRoll = this.battle.random(100);
					if (typeof moveData.self.chance === 'undefined' || secondaryRoll < moveData.self.chance) {
						this.moveHit(source, source, move, moveData.self, isSecondary, true);
					}
					if (!move.multihit) move.selfDropped = true;
				} else {
					this.moveHit(source, source, move, moveData.self, isSecondary, true);
				}
			}
		}
	}
	secondaries(targets: SpreadMoveTargets, source: Pokemon, move: ActiveMove, moveData: ActiveMove, isSelf?: boolean) {
		if (!moveData.secondaries) return;
		const hydraBondFollowUp = move.multihitType === 'hydrabond' && move.hit > 1;
		for (const target of targets) {
			if (target === false) continue;
			const secondaries: Dex.SecondaryEffect[] =
				this.battle.runEvent('ModifySecondaries', target, source, moveData, moveData.secondaries.slice());
			for (const secondary of secondaries) {
				// Hydra Bond repeats stat-boost effects with their normal chance, but not other effects.
				const repeatsOnHydraFollowUp = secondary.boosts || secondary.self?.boosts;
				if (hydraBondFollowUp && !repeatsOnHydraFollowUp) continue;
				const secondaryRoll = this.battle.random(100);
				// User stat boosts or target stat drops can possibly overflow if it goes beyond 256 in Gen 8 or prior
				const secondaryOverflow = (secondary.boosts || secondary.self) && this.battle.gen <= 8;
				if (typeof secondary.chance === 'undefined' ||
					secondaryRoll < (secondaryOverflow ? secondary.chance % 256 : secondary.chance)) {
					this.moveHit(target, source, move, secondary, true, isSelf);
				}
			}
		}
	}
	forceSwitch(
		damage: SpreadMoveDamage, targets: SpreadMoveTargets, source: Pokemon, move: ActiveMove
	) {
		for (const [i, target] of targets.entries()) {
			if (target && target.hp > 0 && source.hp > 0 && this.battle.canSwitch(target.side)) {
				const hitResult = this.battle.runEvent('DragOut', target, source, move);
				if (hitResult) {
					target.forceSwitchFlag = true;
				} else if (hitResult === false && move.category === 'Status') {
					this.battle.add('-fail', source);
					this.battle.attrLastMove('[still]');
					damage[i] = false;
				}
			}
		}
		return damage;
	}
	moveHit(
		targets: Pokemon | null | (Pokemon | null)[], pokemon: Pokemon, moveOrMoveName: ActiveMove,
		moveData?: Dex.HitEffect, isSecondary?: boolean, isSelf?: boolean
	): number | undefined | false {
		if (!Array.isArray(targets)) targets = [targets];
		const retVal = this.spreadMoveHit(targets, pokemon, moveOrMoveName, moveData, isSecondary, isSelf)[0][0];
		return retVal === true ? undefined : retVal;
	}

	calcRecoilDamage(damageDealt: number, move: Move, pokemon: Pokemon): number {
		if (move.id === 'chloroblast') {
			if (this.battle.field.isTerrain('forestterrain')) {
				return Math.round(pokemon.maxhp / 4);
			} else {
				return Math.round(pokemon.maxhp / 2);
			}
		}
		return this.battle.clampIntRange(Math.round(damageDealt * move.recoil![0] / move.recoil![1]), 1);
	}

	getZMove(move: Move, pokemon: Pokemon, skipChecks?: boolean): string | undefined {
		const item = pokemon.getItem();
		if (!skipChecks) {
			if (pokemon.gigantamax && pokemon.species.id === 'eeveegmax') return;
			const maxGimmicks = 2;
			if (pokemon.side.gimmickCount >= maxGimmicks) return;
			if (!item.zMove) return;
			if (item.itemUser && !item.itemUser.includes(pokemon.species.name)) return;
			const moveData = pokemon.getMoveData(move);
			// Draining the PP of the base move prevents the corresponding Z-move from being used.
			if (!moveData?.pp) return;
		}

		if (item.zMoveFrom) {
			if (move.name === item.zMoveFrom) return item.zMove as string;
		} else if (item.zMove !== true && item.zMoveType) {
			if (move.type === item.zMoveType) {
				if (move.category === "Status") return move.name;
				if (this.getZMoveBasePower(move)) return item.zMove as string;
			}
		} else if (item.zMove === true) {
			if (move.type === item.zMoveType) {
				if (move.category === "Status") {
					return move.name;
				} else if (this.getZMoveBasePower(move)) {
					return this.Z_MOVES[move.type];
				}
			}
		}
	}

	getActiveZMove(move: Move, pokemon: Pokemon): ActiveMove {
		if (pokemon) {
			const item = pokemon.getItem();
			if (move.name === item.zMoveFrom) {
				const zMove = this.dex.getActiveMove(item.zMove as string);
				zMove.isZOrMaxPowered = true;
				return zMove;
			}
			if (item.zMove !== true && item.zMoveType && move.type === item.zMoveType) {
				const zMove = this.dex.getActiveMove(item.zMove as string);
				if (move.category === 'Status') {
					const statusZMove = this.dex.getActiveMove(move);
					statusZMove.isZ = true;
					statusZMove.isZOrMaxPowered = true;
					return statusZMove;
				}
				zMove.basePower = this.getZMoveBasePower(move);
				zMove.category = move.category;
				zMove.priority = move.priority;
				zMove.baseMove = move.id;
				zMove.baseMoveName = move.name;
				zMove.isZOrMaxPowered = true;
				return zMove;
			}
		}

		if (move.category === 'Status') {
			const zMove = this.dex.getActiveMove(move);
			zMove.isZ = true;
			zMove.isZOrMaxPowered = true;
			return zMove;
		}
		const zMove = this.dex.getActiveMove(this.Z_MOVES[move.type]);
		zMove.basePower = this.getZMoveBasePower(move);
		zMove.category = move.category;
		// copy the priority for Quick Guard
		zMove.priority = move.priority;
		zMove.baseMove = move.id;
		zMove.baseMoveName = move.name;
		zMove.isZOrMaxPowered = true;
		return zMove;
	}

	canZMove(pokemon: Pokemon) {
		const maxGimmicks = 2;
		if (pokemon.side.gimmickCount >= maxGimmicks ||
			(pokemon.transformed &&
				(pokemon.species.forme === 'Mega' || pokemon.species.isPrimal || pokemon.species.forme === "Ultra"))
		) return;
		const item = pokemon.getItem();
		if (!item.zMove) return;
		if (item.itemUser && !item.itemUser.includes(pokemon.species.name)) return;
		let atLeastOne = false;
		let mustStruggle = true;
		const zMoves: ZMoveOptions = [];
		for (const moveSlot of pokemon.moveSlots) {
			if (moveSlot.pp <= 0) {
				zMoves.push(null);
				continue;
			}
			if (!moveSlot.disabled) {
				mustStruggle = false;
			}
			const move = this.dex.moves.get(moveSlot.move);
			let zMoveName = this.getZMove(move, pokemon, true) || '';
			if (zMoveName) {
				const zMove = this.dex.moves.get(zMoveName);
				if (!zMove.isZ && zMove.category === 'Status') zMoveName = "Z-" + zMoveName;
				zMoves.push({ move: zMoveName, target: zMove.target });
			} else {
				zMoves.push(null);
			}
			if (zMoveName) atLeastOne = true;
		}
		if (atLeastOne && !mustStruggle) return zMoves;
	}

	getMaxMove(move: Move, pokemon: Pokemon) {
		if (typeof move === 'string') move = this.dex.moves.get(move);
		if (move.name === 'Struggle') return move;
		const isGigantamax = pokemon.gigantamax || pokemon.species.forme?.includes('Gmax');
		if (isGigantamax && pokemon.canGigantamax && move.category !== 'Status') {
			const gMaxMove = this.dex.moves.get(pokemon.canGigantamax);
			if (gMaxMove.exists && (gMaxMove.id === 'gmaxcuddle' ? move.type === 'Normal' : gMaxMove.type === move.type)) return gMaxMove;
		}
		const maxMove = this.dex.moves.get(this.MAX_MOVES[move.category === 'Status' ? move.category : move.type]);
		if (maxMove.exists) return maxMove;
	}

	getActiveMaxMove(move: Move, pokemon: Pokemon) {
		if (typeof move === 'string') move = this.dex.getActiveMove(move);
		if (move.name === 'Struggle') return this.dex.getActiveMove(move);
		let maxMove = this.dex.getActiveMove(this.MAX_MOVES[move.category === 'Status' ? move.category : move.type]);
		if (move.category !== 'Status') {
			const isGigantamax = pokemon.gigantamax || pokemon.species.forme?.includes('Gmax');
			if (isGigantamax && pokemon.canGigantamax) {
				const gMaxMove = this.dex.getActiveMove(pokemon.canGigantamax);
				if (gMaxMove.exists && (gMaxMove.id === 'gmaxcuddle' ? move.type === 'Normal' : gMaxMove.type === move.type)) maxMove = gMaxMove;
			}
			if (!move.maxMove?.basePower) throw new Error(`${move.name} doesn't have a maxMove basePower`);
			if (!['gmaxdrumsolo', 'gmaxfireball', 'gmaxhydrosnipe', 'gmaxfinalverdict', 'gmaxspiritvolley'].includes(maxMove.id)) {
				maxMove.basePower = move.maxMove.basePower;
			}
			maxMove.category = move.category;
		}
		maxMove.baseMove = move.id;
		// copy the priority for Psychic Terrain, Quick Guard
		maxMove.priority = move.priority;
		maxMove.isZOrMaxPowered = true;
		return maxMove;
	}

	runZPower(move: ActiveMove, pokemon: Pokemon) {
		if (!this.battle.useGimmick(pokemon, 'zMove')) this.battle.add('-message', 'Send this replay to Ternimus!');
		const zPower = this.dex.conditions.get('zpower');
		const zTerrains: { [moveid: string]: [string, number] } = {
			oceanicoperetta: ['watersurfaceterrain', 4],
			maliciousmoonsault: ['bigtopterrain', 4],
			sinisterarrowraid: ['hauntedterrain', 4],
			letssnuggleforever: ['bewitchedwoodsterrain', 4],
			splinteredstormshards: ['rockyterrain', 4],
			pulverizingpancake: ['holyterrain', 4],
			tectonicrage: ['desertterrain', 4],
			subzeroslammer: ['snowymountainterrain', 4],
			continentalcrush: ['mountainterrain', 4],
			infernooverdrive: ['burningterrain', 3],
		};
		let zTerrain: [string, number] | undefined = zTerrains[move.id];
		const caveTerrains = ['caveterrain', 'crystalcavernterrain', 'darkcrystalcavernterrain'];
		if (this.battle.field.isTerrain('coldeclipseterrain') && ['subzeroslammer', 'continentalcrush'].includes(move.id)) {
			zTerrain = undefined;
		} else if (this.battle.field.isTerrain(caveTerrains) && move.id === 'tectonicrage') {
			zTerrain = undefined;
		} else if (move.id === 'infernooverdrive') {
			if (this.battle.field.isTerrain('volcanicterrain')) {
				zTerrain = undefined;
			} else if (this.battle.field.isTerrain(caveTerrains)) {
				zTerrain = ['volcanicterrain', 3];
			}
		}
		if (zTerrain) (move as ActiveMove & { pendingZTerrain?: [string, number] }).pendingZTerrain = zTerrain;
		if (move.category !== 'Status') {
			this.battle.attrLastMove('[zeffect]');
		} else if (move.zMove?.boost) {
			this.battle.boost(move.zMove.boost, pokemon, pokemon, zPower);
		} else if (move.zMove?.effect) {
			switch (move.zMove.effect) {
			case 'heal':
				this.battle.heal(pokemon.maxhp, pokemon, pokemon, zPower);
				break;
			case 'healreplacement':
				pokemon.side.addSlotCondition(pokemon, 'healreplacement', pokemon, move);
				break;
			case 'clearnegativeboost':
				const boosts: SparseBoostsTable = {};
				let i: BoostID;
				for (i in pokemon.boosts) {
					if (pokemon.boosts[i] < 0) {
						boosts[i] = 0;
					}
				}
				pokemon.setBoost(boosts);
				this.battle.add('-clearnegativeboost', pokemon, '[zeffect]');
				break;
			case 'redirect':
				pokemon.addVolatile('followme', pokemon, zPower);
				break;
			case 'crit2':
				pokemon.addVolatile('focusenergy', pokemon, zPower);
				break;
			case 'curse':
				if (pokemon.hasType('Ghost')) {
					this.battle.heal(pokemon.maxhp, pokemon, pokemon, zPower);
				} else {
					this.battle.boost({ atk: 1 }, pokemon, pokemon, zPower);
				}
			}
		}
	}

	targetTypeChoices(targetType: string) {
		return CHOOSABLE_TARGETS.has(targetType);
	}

	combineResults<T extends number | boolean | null | '' | undefined,
		U extends number | boolean | null | '' | undefined>(
		left: T, right: U
	): T | U {
		const NOT_FAILURE = 'string';
		const NULL = 'object';
		const resultsPriorities = ['undefined', NOT_FAILURE, NULL, 'boolean', 'number'];
		if (resultsPriorities.indexOf(typeof left) > resultsPriorities.indexOf(typeof right)) {
			return left;
		} else if (left && !right && right !== 0) {
			return left;
		} else if (typeof left === 'number' && typeof right === 'number') {
			return (left + right) as T;
		} else {
			return right;
		}
	}

	/**
	 * 0 is a success dealing 0 damage, such as from False Swipe at 1 HP.
	 *
	 * Normal PS return value rules apply:
	 * undefined = success, null = silent failure, false = loud failure
	 */
	getDamage(
		source: Pokemon, target: Pokemon, move: string | number | ActiveMove,
		suppressMessages = false
	): number | undefined | null | false {
		if (typeof move === 'string') move = this.dex.getActiveMove(move);

		if (typeof move === 'number') {
			const basePower = move;
			move = new Dex.Move({
				basePower,
				type: '???',
				category: 'Physical',
				willCrit: false,
			}) as ActiveMove;
			move.hit = 0;
		}

		if (!target.runImmunity(move, !suppressMessages)) {
			return false;
		}

		if (move.ohko) return this.battle.gen === 3 ? target.hp : target.maxhp;
		if (move.damageCallback) return move.damageCallback.call(this.battle, source, target);
		if (move.damage === 'level') {
			return source.level;
		} else if (move.damage) {
			return move.damage;
		}

		const category = this.battle.getCategory(move);

		let basePower: number | false | null = move.basePower;
		if (move.basePowerCallback) {
			basePower = move.basePowerCallback.call(this.battle, source, target, move);
		}
		if (!basePower) return basePower === 0 ? undefined : basePower;
		basePower = this.battle.clampIntRange(basePower, 1);

		let critMult;
		let critRatio = this.battle.runEvent('ModifyCritRatio', source, target, move, move.critRatio || 0);
		if (this.battle.gen <= 5) {
			critRatio = this.battle.clampIntRange(critRatio, 0, 5);
			critMult = [0, 16, 8, 4, 3, 2];
		} else {
			critRatio = this.battle.clampIntRange(critRatio, 0, 4);
			if (this.battle.gen === 6) {
				critMult = [0, 16, 8, 2, 1];
			} else {
				critMult = [0, 24, 8, 2, 1];
			}
		}

		const moveHit = target.getMoveHitData(move);
		moveHit.crit = move.willCrit || false;
		if (move.willCrit === undefined) {
			if (critRatio) {
				moveHit.crit = this.battle.randomChance(1, critMult[critRatio]);
			}
		}

		if (moveHit.crit) {
			moveHit.crit = this.battle.runEvent('CriticalHit', target, null, move);
		}

		// happens after crit calculation
		basePower = this.battle.runEvent('BasePower', source, target, move, basePower, true);

		if (!basePower) return 0;
		basePower = this.battle.clampIntRange(basePower, 1);
		// Hacked Max Moves have 0 base power, even if you Dynamax
		if ((!source.volatiles['dynamax'] && move.isMax) || (move.isMax && this.dex.moves.get(move.baseMove).isMax)) {
			basePower = 0;
		}

		const dexMove = this.dex.moves.get(move.id);
		const battleBondStellar = source.terastallized === 'Stellar' && source.hasAbility('battlebond');
		const stellarTypeBoostAvailable = source.terastallized === 'Stellar' && !source.stellarBoostedTypes.includes(move.type);
		if (stellarTypeBoostAvailable && dexMove.multihit) {
			basePower = Math.floor(basePower * 1.5);
		}
		if (source.terastallized && (source.terastallized === 'Stellar' ?
			(battleBondStellar || !source.stellarBoostedTypes.includes(move.type)) : source.hasType(move.type)) &&
			basePower < (battleBondStellar ? 80 : 60) && dexMove.priority <= 0 && !dexMove.multihit &&
			// Hard move.basePower check for moves like Dragon Energy that have variable BP
			!((move.basePower === 0 || move.basePower === 150) && move.basePowerCallback)
		) {
			basePower = battleBondStellar ? 80 : 60;
		}

		const level = source.level;

		const attacker = move.overrideOffensivePokemon === 'target' ? target : source;
		const defender = move.overrideDefensivePokemon === 'source' ? source : target;

		const isPhysical = move.category === 'Physical';
		let attackStat: StatIDExceptHP = move.overrideOffensiveStat || (isPhysical ? 'atk' : 'spa');
		const defenseStat: StatIDExceptHP = move.overrideDefensiveStat || (isPhysical ? 'def' : 'spd');

		const statTable = { atk: 'Atk', def: 'Def', spa: 'SpA', spd: 'SpD', spe: 'Spe' };

		let atkBoosts = attacker.boosts[attackStat];
		let defBoosts = defender.boosts[defenseStat];

		let ignoreNegativeOffensive = !!move.ignoreNegativeOffensive;
		let ignorePositiveDefensive = !!move.ignorePositiveDefensive;

		if (moveHit.crit) {
			ignoreNegativeOffensive = true;
			ignorePositiveDefensive = true;
		}
		const ignoreOffensive = !!(move.ignoreOffensive || (ignoreNegativeOffensive && atkBoosts < 0));
		const ignoreDefensive = !!(move.ignoreDefensive || (ignorePositiveDefensive && defBoosts > 0));

		if (ignoreOffensive) {
			this.battle.debug('Negating (sp)atk boost/penalty.');
			atkBoosts = 0;
		}
		if (ignoreDefensive) {
			this.battle.debug('Negating (sp)def boost/penalty.');
			defBoosts = 0;
		}

		let attack = attacker.calculateStat(attackStat, atkBoosts, 1, source);
		let defense = defender.calculateStat(defenseStat, defBoosts, 1, target);

		attackStat = (category === 'Physical' ? 'atk' : 'spa');

		// Apply Stat Modifiers
		attack = this.battle.runEvent('Modify' + statTable[attackStat], source, target, move, attack);
		defense = this.battle.runEvent('Modify' + statTable[defenseStat], target, source, move, defense);
		if (this.battle.field.terrain === 'glitchterrain') {
			if (attackStat === 'spa')
				attack = Math.max(attack, source.getStat('spd'));
			if (defenseStat === 'spd')
				defense = Math.max(defense, target.getStat('spa'));
		}
		if (['explosion', 'selfdestruct'].includes(move.id) && ['def', 'spd'].includes(defenseStat)) {
			defense = this.battle.clampIntRange(Math.floor(defense / 2), 1);
		}

		const tr = this.battle.trunc;

		// int(int(int(2 * L / 5 + 2) * A * P / D) / 50);
		const baseDamage = tr(tr(tr(tr(2 * level / 5 + 2) * basePower * attack) / defense) / 50);

		// Calculate damage modifiers separately (order differs between generations)
		return this.modifyDamage(baseDamage, source, target, move, suppressMessages);
	}

	modifyDamage(
		baseDamage: number, pokemon: Pokemon, target: Pokemon, move: ActiveMove, suppressMessages = false
	) {
		const tr = this.battle.trunc;
		if (!move.type) move.type = '???';
		const type = move.type;

		baseDamage += 2;

		let ffaFollowUpAttack = false;
		if (move.spreadHit) {
			// multi-target modifier (doubles only)
			let spreadModifier = this.battle.gameType === 'freeforall' ? 0.5 : 0.75;
			if ((move as any).fullDamageSpread || (move as any).parentalBondSpread) {
				spreadModifier = 1;
			} else if ((move as any).hydraBondSingleTargetSpread) {
				spreadModifier = 1.3;
			} else if ((move as any).hydraBondSpread) {
				spreadModifier = move.hit > 1 ? 0.3 : 1;
			}
			this.battle.debug(`Spread modifier: ${spreadModifier}`);
			baseDamage = this.battle.modify(baseDamage, spreadModifier);
		} else if ((move.multihitType === 'parentalbond' || move.multihitType === 'hydrabond') && move.hit > 1) {
			// Parental Bond / Hydra Bond modifier
			const bondModifier = (move as any).spilloverDamageModifier || (move.multihitType === 'hydrabond' ? 0.3 : 0.8);
			this.battle.debug(`${move.multihitType} modifier: ${bondModifier}`);
			baseDamage = this.battle.modify(baseDamage, bondModifier);
			ffaFollowUpAttack = this.battle.gameType === 'freeforall';
		} else if ((move as any).spilloverDamageModifier) {
			this.battle.debug(`Spillover modifier: ${(move as any).spilloverDamageModifier}`);
			baseDamage = this.battle.modify(baseDamage, (move as any).spilloverDamageModifier);
			ffaFollowUpAttack = this.battle.gameType === 'freeforall';
		} else if (this.battle.gameType === 'freeforall' && move.hit > 1) {
			ffaFollowUpAttack = true;
		}
		if (ffaFollowUpAttack) {
			const targetIsMega = !!(target.species.isMega || target.species.forme === 'Mega');
			const targetIsGmax = !!(target.gigantamax || target.species.forme?.includes('Gmax'));
			if (targetIsMega || targetIsGmax || (target.terastallized === 'Stellar' && !move.isZ) || target.hasAbility('ultraego')) {
				this.battle.debug('FFA gimmick follow-up damage reduction');
				baseDamage = this.battle.modify(baseDamage, 0.9);
			}
		}
		if (move.flags['bone'] && target.hasAbility('soulfire')) {
			this.battle.debug('Bone move vs Soul Fire boost');
			baseDamage = this.battle.modify(baseDamage, 4);
		}

		// weather modifier
		baseDamage = this.battle.runEvent('WeatherModifyDamage', pokemon, target, move, baseDamage);

		// crit - not a modifier
		const isCrit = target.getMoveHitData(move).crit;
		if (isCrit) {
			baseDamage = tr(baseDamage * (move.critModifier || (this.battle.gen >= 6 ? 1.5 : 2)));
		}

		// random factor - also not a modifier
		if (!move.noDamageVariance) baseDamage = this.battle.randomizer(baseDamage);

		// STAB
		// The "???" type never gets STAB
		// Not even if you Roost in Gen 4 and somehow manage to use
		// Struggle in the same turn.
		// (On second thought, it might be easier to get a MissingNo.)
		if (type !== '???') {
			let stab: number | [number, number] = 1;

			const isSTAB = move.forceSTAB || pokemon.hasType(type) || pokemon.getTypes(false, true).includes(type) || (move.types !== undefined ? pokemon.hasType(move.types[1]) : false);
			if (isSTAB) {
				stab = 1.5;
			}

			if (pokemon.terastallized === 'Stellar') {
				stab = isSTAB ? 1.5 : (pokemon.stellarBoostedTypes.includes(type) ? 1 : [4915, 4096]);
				if (!isSTAB && !pokemon.stellarBoostedTypes.includes(type)) move.stellarBoosted = true;
			} else {
				if (pokemon.terastallized === type && pokemon.getTypes(false, true).includes(type)) {
					stab = 2;
				}
				stab = this.battle.runEvent('ModifySTAB', pokemon, target, move, stab);
			}

			baseDamage = this.battle.modify(baseDamage, stab);
		}

		// types
		let typeMod = target.runEffectiveness(move);
		typeMod = this.battle.clampIntRange(typeMod, -6, 6);
		target.getMoveHitData(move).typeMod = typeMod;
		if (typeMod > 0) {
			if (!suppressMessages) this.battle.add('-supereffective', target);

			for (let i = 0; i < typeMod; i++) {
				baseDamage *= 2;
			}
		}
		if (typeMod < 0) {
			if (!suppressMessages) this.battle.add('-resisted', target);

			for (let i = 0; i > typeMod; i--) {
				baseDamage = tr(baseDamage / 2);
			}
		}

		if (isCrit && !suppressMessages) this.battle.add('-crit', target);

		if (pokemon.status === 'brn' && move.category === 'Physical' && !pokemon.hasAbility(['guts', 'sinisterblaze'])) {
			if (this.battle.gen < 6 || move.id !== 'facade') {
				baseDamage = this.battle.modify(baseDamage, 0.5);
			}
		}

		if (pokemon.status === 'frz' && move.category === 'Special') {
			if (this.battle.gen < 6 || move.id !== 'facade') {
				baseDamage = this.battle.modify(baseDamage, 0.5);
			}
		}
		const targetIsGmax = !!(target.gigantamax || target.species.forme?.includes('Gmax'));
		const targetIsMega = !!(target.species.isMega || target.species.forme === 'Mega');
		const sourceIsGmax = !!(pokemon.gigantamax || pokemon.species.forme?.includes('Gmax'));
		const sourceIsMega = !!(pokemon.species.isMega || pokemon.species.forme === 'Mega');
		if (pokemon.terastallized === 'Stellar') {
			if (targetIsGmax) {
				baseDamage = this.battle.modify(baseDamage, 1.5);
			} else if (targetIsMega) {
				baseDamage = this.battle.modify(baseDamage, 1.3);
			}
		}
		if (target.terastallized === 'Stellar' && (sourceIsGmax || sourceIsMega) && !move.isZ) {
			baseDamage = this.battle.modify(baseDamage, 0.9);
		}
		// Generation 5, but nothing later, sets damage to 1 before the final damage modifiers
		if (this.battle.gen === 5 && !baseDamage) baseDamage = 1;

		// Final modifier. Modifiers that modify damage after min damage check, such as Life Orb.
		baseDamage = this.battle.runEvent('ModifyDamage', pokemon, target, move, baseDamage);
		if (target.species.forme === 'Gmax' || target.species.id.endsWith('gmax')) {
			baseDamage = this.battle.modify(baseDamage, 0.9);
		}

		const bypassProtect = target.getMoveHitData(move).bypassProtect;
		if (bypassProtect) {
			baseDamage = this.battle.modify(baseDamage, 0.25);
			if (bypassProtect !== true && bypassProtect.effectType === 'Ability') {
				this.battle.add('-ability', pokemon, bypassProtect.name);
			}
			this.battle.add('-zbroken', target);
		}

		// Generation 6-7 moves the check for minimum 1 damage after the final modifier...
		if (this.battle.gen !== 5 && !baseDamage) return 1;

		// ...but 16-bit truncation happens even later, and can truncate to 0
		return tr(baseDamage, 16);
	}

	/**
	 * Confusion damage is unique - most typical modifiers that get run when calculating
	 * damage (e.g. Huge Power, Life Orb, critical hits) don't apply. It also uses a 16-bit
	 * context for its damage, unlike the regular damage formula (though this only comes up
	 * for base damage).
	 */
	getConfusionDamage(pokemon: Pokemon, basePower: number) {
		const tr = this.battle.trunc;

		const attack = pokemon.calculateStat('atk', pokemon.boosts['atk']);
		const defense = pokemon.calculateStat('def', pokemon.boosts['def']);
		const level = pokemon.level;
		const baseDamage = tr(tr(tr(tr(2 * level / 5 + 2) * basePower * attack) / defense) / 50) + 2;

		// Damage is 16-bit context in self-hit confusion damage
		let damage = tr(baseDamage, 16);
		damage = this.battle.randomizer(damage);
		return Math.max(1, damage);
	}

	// #endregion

	// #region MEGA EVOLUTION
	// ==================================================================

	canMegaEvo(pokemon: Pokemon) {
		const species = pokemon.baseSpecies;
		const altForme = species.otherFormes && this.dex.species.get(species.otherFormes[0]);
		const item = pokemon.getItem();
		if (species.id === 'charizardmegaxalt') return null;
		if (species.id === 'charizardalt' && item.id === 'charizarditex') return 'Charizard-Mega-X-Alt';
		if (species.id === 'gallademegaazzy') return null;
		if (species.id === 'galladeazzy' && item.id === 'galladite') return 'Gallade-Mega-Azzy';
		if (species.id === 'scolipedemegaazzy') return null;
		if (species.id === 'scolipedeazzy' && item.id === 'scolipite') return 'Scolipede-Mega-Azzy';
		// Mega Rayquaza
		if ((this.battle.gen <= 7 || this.battle.ruleTable.has('+pokemontag:past') ||
			this.battle.ruleTable.has('+pokemontag:future')) &&
			altForme?.isMega && altForme?.requiredMove &&
			pokemon.baseMoves.includes(toID(altForme.requiredMove)) && !item.zMove) {
			return altForme.name;
		}
		if (!item.megaStone) return null;
		// TODO confirm with generation shift
		let megaEvolution = item.megaStone[species.name];
		if (megaEvolution && megaEvolution !== species.name) return megaEvolution;
		// a hacked-in Megazard X can mega evolve into Megazard Y, but not into Megazard X
		// FIXME: Change to species.name when champions comes
		megaEvolution = item.megaStone[species.baseSpecies];
		if (megaEvolution && megaEvolution !== species.name) return megaEvolution;
		const megaFormes = species.otherFormes?.filter(forme => this.dex.species.get(forme).isMega);
		if (megaFormes?.length && item.megaStone) {
			const fallbackMega = this.dex.species.get(megaFormes[0]);
			if (fallbackMega.exists && fallbackMega.name !== species.name) return fallbackMega.name;
		}
		return null;
	}

	canMegaEvoX(pokemon: Pokemon) {
		const gardevoirFormes = ['Gardevoir', 'Gardevoir-Mega', 'Gardevoir-Mega-Z', 'Gardevoir-Void-Mega'];
		if (
			gardevoirFormes.includes(pokemon.baseSpecies.name) &&
			pokemon.getItem().id === 'gardevoirite' &&
			pokemon.baseSpecies.name !== 'Gardevoir-Mega-Z'
		) {
			return 'Gardevoir-Mega-Z';
		}
		return null;
	}

	canMegaEvoY(pokemon: Pokemon) {
		const gardevoirFormes = ['Gardevoir', 'Gardevoir-Mega', 'Gardevoir-Mega-Z', 'Gardevoir-Void-Mega'];
		if (!gardevoirFormes.includes(pokemon.baseSpecies.name) || pokemon.getItem().id !== 'gardevoirite') return null;
		if (['Gardevoir', 'Gardevoir-Mega', 'Gardevoir-Mega-Z'].includes(pokemon.baseSpecies.name)) {
			return 'Gardevoir-Void-Mega';
		}
		if (pokemon.baseSpecies.name === 'Gardevoir-Void-Mega') {
			return 'Gardevoir-Mega';
		}
		return null;
	}

	canUltraBurst(pokemon: Pokemon) {
		if (['Necrozma-Dawn-Wings', 'Necrozma-Dusk-Mane'].includes(pokemon.baseSpecies.name) &&
			pokemon.getItem().id === 'ultranecroziumz') {
			return "Necrozma-Ultra";
		}
		return null;
	}

	clearDynamaxForMega(pokemon: Pokemon) {
		if (!pokemon.volatiles['dynamax']) return;
		pokemon.removeVolatile('dynamax');
		pokemon.updateMaxHp();
	}

	refreshMegaOptions(pokemon: Pokemon) {
		const canUseAnotherGimmick = pokemon.side.gimmickCount < 2 &&
			(this.battle.gameType !== 'freeforall' || pokemon.side.megaEvoCount < 2);
		pokemon.canMegaEvo = canUseAnotherGimmick ? this.canMegaEvo(pokemon) : false;
		pokemon.canMegaEvoX = canUseAnotherGimmick ? this.canMegaEvoX(pokemon) : false;
		pokemon.canMegaEvoY = canUseAnotherGimmick ? this.canMegaEvoY(pokemon) : false;
	}

	runMegaEvo(pokemon: Pokemon) {
		const speciesid = pokemon.canMegaEvo || pokemon.canUltraBurst;
		if (!this.battle.useGimmick(pokemon, 'Mega')) return false;
		if (!speciesid) return false;

		this.clearDynamaxForMega(pokemon);
		pokemon.formeChange(speciesid, pokemon.getItem(), true);
		if (toID(speciesid) === 'gardevoirvoidmega') {
			this.battle.add('-message', 'The Angel of Death has descended!');
		}
		this.battle.heal(pokemon.baseMaxhp / 8, pokemon, pokemon);
		this.battle.runEvent('AfterMega', pokemon);
		this.refreshMegaOptions(pokemon);
		return true;
	}

	// Let's Go
	runMegaEvoX(pokemon: Pokemon) {
		const speciesid = pokemon.canMegaEvoX;
		if (!this.battle.useGimmick(pokemon, 'Mega')) return false;
		if (!speciesid) return false;

		this.clearDynamaxForMega(pokemon);
		pokemon.formeChange(speciesid, pokemon.getItem(), true);
		if (toID(speciesid) === 'gardevoirvoidmega') {
			this.battle.add('-message', 'The Angel of Death has descended!');
		}
		this.battle.heal(pokemon.baseMaxhp / 8, pokemon, pokemon);
		this.battle.runEvent('AfterMega', pokemon);
		this.refreshMegaOptions(pokemon);
		return true;
	}

	runMegaEvoY(pokemon: Pokemon) {
		const speciesid = pokemon.canMegaEvoY;
		if (!this.battle.useGimmick(pokemon, 'Mega')) return false;
		if (!speciesid) return false;

		this.clearDynamaxForMega(pokemon);
		pokemon.formeChange(speciesid, pokemon.getItem(), true);
		if (toID(speciesid) === 'gardevoirvoidmega') {
			this.battle.add('-message', 'The Angel of Death has descended!');
		}
		this.battle.heal(pokemon.baseMaxhp / 8, pokemon, pokemon);
		this.battle.runEvent('AfterMega', pokemon);
		this.refreshMegaOptions(pokemon);
		return true;
	}

	canTerastallize(pokemon: Pokemon) {
		return pokemon.species.baseSpecies === 'Ogerpon' ? pokemon.teraType : 'Stellar';
	}

	terastallize(pokemon: Pokemon) {
		if (!this.battle.useGimmick(pokemon, 'Terastal')) return null;
		if (pokemon.species.baseSpecies === 'Ogerpon' && pokemon.teraType !== 'Stellar' && !['Fire', 'Grass', 'Rock', 'Water'].includes(pokemon.teraType) &&
			(!pokemon.illusion || pokemon.illusion.species.baseSpecies === 'Ogerpon')) {
			this.battle.hint("If Ogerpon Terastallizes into a type other than Fire, Grass, Rock, or Water, the game crashes.", false, pokemon.side);
			return;
		}

		if (pokemon.illusion && ['Ogerpon', 'Terapagos'].includes(pokemon.illusion.species.baseSpecies)) {
			this.battle.singleEvent('End', this.dex.abilities.get('Illusion'), pokemon.abilityState, pokemon);
		}

		const type = pokemon.species.baseSpecies === 'Ogerpon' ? pokemon.teraType : 'Stellar';
		this.battle.add('-terastallize', pokemon, type);
		pokemon.terastallized = type;
		pokemon.addedType = '';
		pokemon.knownType = true;
		pokemon.apparentType = type;
		if (type === 'Stellar') pokemon.addVolatile('stellarhealing');
		if (pokemon.species.baseSpecies === 'Ogerpon' && ['Fire', 'Grass', 'Rock', 'Water'].includes(pokemon.teraType)) {
			let ogerponSpecies = toID(pokemon.species.battleOnly || pokemon.species.id);
			ogerponSpecies += ogerponSpecies === 'ogerpon' ? 'tealtera' : 'tera';
			pokemon.formeChange(ogerponSpecies, null, true);
		}
		if (pokemon.species.name === 'Terapagos-Terastal') {
			pokemon.formeChange('Terapagos-Stellar', null, true);
		}
		if (pokemon.species.baseSpecies === 'Morpeko' && !pokemon.transformed &&
			pokemon.baseSpecies.id !== pokemon.species.id
		) {
			pokemon.formeRegression = true;
			pokemon.baseSpecies = pokemon.species;
			pokemon.details = pokemon.getUpdatedDetails();
		}
		this.battle.runEvent('AfterTerastallization', pokemon);
	}

	// #endregion
}

