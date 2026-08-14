/* eslint-disable @stylistic/max-len */
/*

Ratings and how they work:

-1: Detrimental
	  An ability that severely harms the user.
	ex. Defeatist, Slow Start

 0: Useless
	  An ability with no overall benefit in a singles battle.
	ex. Color Change, Plus

 1: Ineffective
	  An ability that has minimal effect or is only useful in niche situations.
	ex. Light Metal, Suction Cups

 2: Useful
	  An ability that can be generally useful.
	ex. Flame Body, Overcoat

 3: Effective
	  An ability with a strong effect on the user or foe.
	ex. Chlorophyll, Sturdy

 4: Very useful
	  One of the more popular abilities. It requires minimal support to be effective.
	ex. Adaptability, Magic Bounce

 5: Essential
	  The sort of ability that defines metagames.
	ex. Imposter, Shadow Tag

*/

function isFightingClauseAbility(pokemon: Pokemon) {
	return pokemon.hasAbility(['ultraego', 'ultrainstinct', 'battlefervor', 'duskdrive', 'perfectego']);
}

const SCALING_CHIP_IMMUNITIES: Partial<Record<TypeName, string[]>> = {
	Fire: ['flashfire', 'soulfire', 'wellbakedbody'],
	Grass: ['sapsipper'],
	Ground: ['eartheater'],
	Water: ['dryskin', 'stormdrain', 'waterabsorb'],
};

function isImmuneToScalingChip(target: Pokemon, type: TypeName) {
	if (target.hasType(type) || !target.runImmunity(type)) return true;
	const immunityAbilities = SCALING_CHIP_IMMUNITIES[type];
	return !!immunityAbilities?.length && target.hasAbility(immunityAbilities);
}

function getDualWieldModifier(move: ActiveMove, componentBoost = 1) {
	if (move.multihitType !== 'dualwield') return componentBoost;
	if (move.dualWieldFullPower) return componentBoost;
	if (componentBoost !== 1) return move.hit > 1 ? 0.2 : componentBoost;
	return 0.65;
}

function chooseAccumulationRelease(battle: Battle, pokemon: Pokemon) {
	const targets = pokemon.foes().filter(foe => foe && !foe.fainted);
	if (!targets.length) return null;
	const moveids = ['belch'];
	if ((pokemon.volatiles['stockpile']?.layers || 0) > 0) moveids.push('spitup');
	let best: { moveid: string, target: Pokemon, damage: number } | null = null;
	for (const target of targets) {
		for (const moveid of moveids) {
			const move = battle.dex.getActiveMove(moveid);
			const damage = battle.actions.getDamage(pokemon, target, move, true);
			if (typeof damage !== 'number') continue;
			if (moveid === 'belch' && damage >= target.hp) return { moveid, target, damage };
			if (!best || damage > best.damage) best = { moveid, target, damage };
		}
	}
	return best || { moveid: 'belch', target: battle.sample(targets), damage: 0 };
}

function consumeAccumulationStockpileLayer(battle: Battle, pokemon: Pokemon) {
	const stockpile = pokemon.volatiles['stockpile'];
	if (!stockpile?.layers) return;
	const boosts: SparseBoostsTable = {};
	if (stockpile.def < 0) {
		boosts.def = -1;
		stockpile.def++;
	}
	if (stockpile.spd < 0) {
		boosts.spd = -1;
		stockpile.spd++;
	}
	if (boosts.def || boosts.spd) battle.boost(boosts, pokemon, pokemon);
	stockpile.layers--;
	if (stockpile.layers > 0) {
		battle.add('-start', pokemon, 'stockpile' + stockpile.layers);
	} else {
		pokemon.removeVolatile('stockpile');
	}
}

function speedUpAbilityFutureSights(battle: Battle, pokemon: Pokemon, foresightFlag: 'grandmasterForesight' | 'perfectForesight') {
	let spedUp = false;
	for (const side of battle.sides) {
		for (const slotConditions of side.slotConditions) {
			const futureMove = slotConditions['futuremove'];
			if (!futureMove || futureMove.source !== pokemon || !futureMove.moveData?.[foresightFlag]) continue;
			const oldTurn = futureMove.endingTurn || battle.turn;
			const newTurn = Math.max(battle.turn, oldTurn - 1);
			if (newTurn >= oldTurn) continue;
			futureMove.endingTurn = newTurn;
			spedUp = true;
		}
	}
	if (spedUp) battle.add('-message', `${pokemon.name}'s Future Sight countdown sped up!`);
}

export const Abilities: import('../sim/dex-abilities').AbilityDataTable = {
	noability: {
		isNonstandard: "Past",
		flags: {},
		name: "No Ability",
		rating: 0.1,
		num: 0,
	},
	selfsufficient: {
		onImmunity(type, pokemon) {
			if (type === 'sandstorm' || type === 'hail') return false;
		},
		onResidual(pokemon) {
			this.heal(pokemon.baseMaxhp / 16, pokemon, pokemon);
		},
		flags: {},
		name: "Self Sufficient",
		rating: 3,
		num: 10288,
	},
	selfrepair: {
		onCheckShow(pokemon) {
			this.dex.abilities.get('naturalcure').onCheckShow?.call(this, pokemon);
		},
		onSwitchOut(pokemon) {
			this.dex.abilities.get('naturalcure').onSwitchOut?.call(this, pokemon);
		},
		onResidual(pokemon) {
			this.dex.abilities.get('selfsufficient').onResidual?.call(this, pokemon);
			this.dex.abilities.get('naturalcure').onResidual?.call(this, pokemon);
		},
		onImmunity(type, pokemon) {
			return this.dex.abilities.get('selfsufficient').onImmunity?.call(this, type, pokemon);
		},
		flags: {},
		name: "Self Repair",
		rating: 4,
		num: 10346,
	},
	scarecrow: {
		onStart(pokemon) {
			this.dex.abilities.get('windrider').onStart?.call(this, pokemon);
		},
		onTryHit(target, source, move) {
			return this.dex.abilities.get('windrider').onTryHit?.call(this, target, source, move);
		},
		onSideConditionStart(side, source, sideCondition) {
			this.dex.abilities.get('windrider').onSideConditionStart?.call(this, side, source, sideCondition);
		},
		onResidual(pokemon) {
			this.dex.abilities.get('windrider').onResidual?.call(this, pokemon);
		},
		onEffectiveness(typeMod, target, type, move) {
			return this.dex.abilities.get('steelworker').onEffectiveness?.call(this, typeMod, target, type, move);
		},
		onImmunity(type, pokemon) {
			return this.dex.abilities.get('steelworker').onImmunity?.call(this, type, pokemon);
		},
		onModifyMove(move) {
			this.dex.abilities.get('steelworker').onModifyMove?.call(this, move);
		},
		onModifyAtkPriority: 5,
		onModifyAtk(atk, attacker, defender, move) {
			let modifier = 1;
			if (move && this.movehasType(move, 'Steel')) {
				modifier *= this.field.isTerrain('factoryterrain') ? 2 : 1.5;
			}
			if (!defender.activeTurns) modifier *= 2;
			if (modifier !== 1) return this.chainModify(modifier);
		},
		onModifySpAPriority: 5,
		onModifySpA(spa, attacker, defender, move) {
			let modifier = 1;
			if (move && this.movehasType(move, 'Steel')) {
				modifier *= this.field.isTerrain('factoryterrain') ? 2 : 1.5;
			}
			if (!defender.activeTurns) modifier *= 2;
			if (modifier !== 1) return this.chainModify(modifier);
		},
		flags: { breakable: 1 },
		name: "Scarecrow",
		rating: 5,
		num: 10345,
	},
	bruteforce: {
		onBasePower(basePower, source, target, move) {
			return this.dex.abilities.get('reckless').onBasePower?.call(this, basePower, source, target, move);
		},
		onDamage(damage, target, source, effect) {
			return this.dex.abilities.get('rockhead').onDamage?.call(this, damage, target, source, effect);
		},
		flags: {},
		name: "Brute Force",
		rating: 4,
		num: 10289,
	},
	burningrage: {
		onBasePowerPriority: 23,
		onBasePower(basePower, source, target, move) {
			let result = this.dex.abilities.get('bruteforce').onBasePower?.call(this, basePower, source, target, move);
			return this.dex.abilities.get('ironfist').onBasePower?.call(this, result ?? basePower, source, target, move);
		},
		onDamage(damage, target, source, effect) {
			return this.dex.abilities.get('bruteforce').onDamage?.call(this, damage, target, source, effect);
		},
		onModifyMove(move) {
			return this.dex.abilities.get('moldbreaker').onModifyMove?.call(this, move);
		},
		flags: {},
		name: "Burning Rage",
		rating: 4,
		num: 10349,
	},
	emperorspride: {
		onAfterEachBoost(boost, target, source, effect) {
			return this.dex.abilities.get('defiant').onAfterEachBoost?.call(this, boost, target, source, effect);
		},
		onModifySpe(spe, pokemon) {
			return this.dex.abilities.get('swiftswim').onModifySpe?.call(this, spe, pokemon);
		},
		onModifyMove(move) {
			if (move.type === 'Flying') move.forceSTAB = true;
		},
		flags: {},
		name: "Emperor's Pride",
		rating: 4,
		num: 10350,
	},
	fightingfiend: {
		onModifyMove(move) {
			this.dex.abilities.get('unseenfist').onModifyMove?.call(this, move);
			this.dex.abilities.get('moldbreaker').onModifyMove?.call(this, move);
		},
		onBasePowerPriority: 23,
		onBasePower(basePower, source, target, move) {
			let result = this.dex.abilities.get('unseenfist').onBasePower?.call(this, basePower, source, target, move);
			return this.dex.abilities.get('striker').onBasePower?.call(this, result ?? basePower, source, target, move);
		},
		flags: {},
		name: "Fighting Fiend",
		rating: 4,
		num: 10351,
	},
	kickfiend: {
		onModifySpe(spe, pokemon) {
			return this.dex.abilities.get('violentrush').onModifySpe?.call(this, spe, pokemon);
		},
		onModifyAtk(atk, pokemon) {
			return this.dex.abilities.get('violentrush').onModifyAtk?.call(this, atk, pokemon);
		},
		onAfterMove(source, target, move) {
			return this.dex.abilities.get('violentrush').onAfterMove?.call(this, source, target, move);
		},
		onUpdate(pokemon) {
			return this.dex.abilities.get('limber').onUpdate?.call(this, pokemon);
		},
		onSetStatus(status, target, source, effect) {
			return this.dex.abilities.get('limber').onSetStatus?.call(this, status, target, source, effect);
		},
		onTryBoost(boost, target, source, effect) {
			return this.dex.abilities.get('limber').onTryBoost?.call(this, boost, target, source, effect);
		},
		onBasePowerPriority: 23,
		onBasePower(basePower, source, target, move) {
			return this.dex.abilities.get('striker').onBasePower?.call(this, basePower, source, target, move);
		},
		flags: {},
		name: "Kick Fiend",
		rating: 4,
		num: 10352,
	},
	neurotoxin: {
		onStart(pokemon) {
			return this.dex.abilities.get('intimidate').onStart?.call(this, pokemon);
		},
		onBasePowerPriority: 19,
		onBasePower(basePower, attacker, defender, move) {
			return this.dex.abilities.get('strongjaw').onBasePower?.call(this, basePower, attacker, defender, move);
		},
		onResidualOrder: 5,
		onResidualSubOrder: 3,
		onResidual(pokemon) {
			return this.dex.abilities.get('shedskin').onResidual?.call(this, pokemon);
		},
		onSetStatus(status, target, source, effect) {
			return this.dex.abilities.get('shedskin').onSetStatus?.call(this, status, target, source, effect);
		},
		flags: { breakable: 1 },
		name: "Neurotoxin",
		rating: 4,
		num: 10353,
	},
	punchfiend: {
		onModifyMove(move) {
			return this.dex.abilities.get('moldbreaker').onModifyMove?.call(this, move);
		},
		onTryAddVolatile(status, pokemon) {
			return this.dex.abilities.get('innerfocus').onTryAddVolatile?.call(this, status, pokemon);
		},
		onTryBoost(boost, target, source, effect) {
			return this.dex.abilities.get('innerfocus').onTryBoost?.call(this, boost, target, source, effect);
		},
		onBasePowerPriority: 23,
		onBasePower(basePower, source, target, move) {
			return this.dex.abilities.get('ironfist').onBasePower?.call(this, basePower, source, target, move);
		},
		flags: {},
		name: "Punch Fiend",
		rating: 4,
		num: 10354,
	},
	spinfiend: {
		onCriticalHit: false,
		onSourceModifyDamage(damage, source, target, move) {
			return this.dex.abilities.get('battlearmor').onSourceModifyDamage?.call(this, damage, source, target, move);
		},
		onBasePower(basePower, source, target, move) {
			return this.dex.abilities.get('technician').onBasePower?.call(this, basePower, source, target, move);
		},
		onUpdate(pokemon) {
			return this.dex.abilities.get('vitalspirit').onUpdate?.call(this, pokemon);
		},
		onSetStatus(status, target, source, effect) {
			return this.dex.abilities.get('vitalspirit').onSetStatus?.call(this, status, target, source, effect);
		},
		flags: { breakable: 1 },
		name: "Spin Fiend",
		rating: 4,
		num: 10355,
	},
	terragift: {
		onStart(pokemon) {
			return this.dex.abilities.get('hospitality').onStart?.call(this, pokemon);
		},
		onAnyModifyBoost(boosts, pokemon) {
			return this.dex.abilities.get('unaware').onAnyModifyBoost?.call(this, boosts, pokemon);
		},
		onSourceModifyDamage(damage, source, target, move) {
			return this.dex.abilities.get('solidrock').onSourceModifyDamage?.call(this, damage, source, target, move);
		},
		flags: { breakable: 1 },
		name: "Terra Gift",
		rating: 4,
		num: 10356,
	},
	precision: {
		onModifyMove(move, source, target) {
			if (target && move.category !== 'Status' && this.dex.getEffectiveness(move.type, target.getTypes()) > 0) move.accuracy = true;
		},
		onModifyCritRatio(critRatio, source, target, move) {
			if (target && move?.category !== 'Status' && this.dex.getEffectiveness(move.type, target.getTypes()) > 0) {
				return critRatio + 1;
			}
		},
		flags: {},
		name: "Precision",
		rating: 4,
		num: 10290,
	},
	secondwind: {
		onDamage(damage, target) {
			if (damage >= target.hp && target.hp > 1 && !target.abilityState.secondWindUsed) {
				target.abilityState.secondWindUsed = true;
				this.add('-ability', target, 'Second Wind');
				return target.hp - 1;
			}
		},
		flags: {},
		name: "Second Wind",
		rating: 4,
		num: 10291,
	},
	rapidresponse: {
		onModifySpe(spe, pokemon) {
			if (pokemon.activeTurns <= 1) return this.chainModify(1.5);
		},
		onModifySpA(spa, pokemon) {
			if (pokemon.activeTurns <= 1) return this.chainModify(1.2);
		},
		flags: {},
		name: "Rapid Response",
		rating: 4,
		num: 10292,
	},
	seafiend: {
		onStart(pokemon) { this.dex.abilities.get('waterbubble').onStart?.call(this, pokemon); },
		onModifyMove(move) { this.dex.abilities.get('waterbubble').onModifyMove?.call(this, move); },
		onDamagingHit(damage, target, source, move) {
			this.dex.abilities.get('toxicdebris').onDamagingHit?.call(this, damage, target, source, move);
		},
		onSourceModifyAtkPriority: 5,
		onSourceModifyAtk(atk, attacker, defender, move) {
			return this.dex.abilities.get('waterbubble').onSourceModifyAtk?.call(this, atk, attacker, defender, move);
		},
		onSourceModifySpAPriority: 5,
		onSourceModifySpA(spa, attacker, defender, move) {
			return this.dex.abilities.get('waterbubble').onSourceModifySpA?.call(this, spa, attacker, defender, move);
		},
		onModifyAtk(atk, attacker, defender, move) {
			return this.dex.abilities.get('waterbubble').onModifyAtk?.call(this, atk, attacker, defender, move);
		},
		onModifySpA(spa, attacker, defender, move) {
			return this.dex.abilities.get('waterbubble').onModifySpA?.call(this, spa, attacker, defender, move);
		},
		onUpdate(pokemon) { this.dex.abilities.get('waterbubble').onUpdate?.call(this, pokemon); },
		onSetStatus(status, target, source, effect) {
			return this.dex.abilities.get('waterbubble').onSetStatus?.call(this, status, target, source, effect);
		},
		onImmunity(type, pokemon) { return this.dex.abilities.get('waterbubble').onImmunity?.call(this, type, pokemon); },
		flags: { breakable: 1 },
		name: "Sea Fiend",
		rating: 5,
		num: 10336,
	},
	hisuianoath: {
		onStart(pokemon) { this.dex.abilities.get('swornduty').onStart?.call(this, pokemon); },
		onBasePowerPriority: 21,
		onBasePower(basePower, attacker, defender, move) {
			return this.dex.abilities.get('toughclaws').onBasePower?.call(this, basePower, attacker, defender, move);
		},
		onModifyMove(move) { this.dex.abilities.get('corrosion').onModifyMove?.call(this, move); },
		onNegateImmunity(pokemon, type) {
			return this.dex.abilities.get('corrosion').onNegateImmunity?.call(this, pokemon, type);
		},
		onDamage(damage, target, source, effect) {
			return this.dex.abilities.get('corrosion').onDamage?.call(this, damage, target, source, effect);
		},
		onFoeAfterSetStatus(status, target, source, effect) {
			this.dex.abilities.get('corrosion').onFoeAfterSetStatus?.call(this, status, target, source, effect);
		},
		flags: { breakable: 1 },
		name: "Hisuian Oath",
		rating: 5,
		num: 10337,
	},
	hisuianvanguard: {
		onStart(pokemon) {
			this.dex.abilities.get('windpower').onStart?.call(this, pokemon);
		},
		onModifySpe(spe, pokemon) { return this.dex.abilities.get('rapidresponse').onModifySpe?.call(this, spe, pokemon); },
		onModifySpA(spa, pokemon) { return this.dex.abilities.get('rapidresponse').onModifySpA?.call(this, spa, pokemon); },
		onAfterMove(source, target, move) { this.dex.abilities.get('rapidresponse').onAfterMove?.call(this, source, target, move); },
		onTryHit(target, source, move) { return this.dex.abilities.get('windpower').onTryHit?.call(this, target, source, move); },
		onSideConditionStart(side, source, sideCondition) {
			this.dex.abilities.get('windpower').onSideConditionStart?.call(this, side, source, sideCondition);
		},
		onResidual(pokemon) { this.dex.abilities.get('windpower').onResidual?.call(this, pokemon); },
		flags: { breakable: 1 },
		name: "Hisuian Vanguard",
		rating: 5,
		num: 10338,
	},
	unovavanguard: {
		onStart(pokemon) {
			this.dex.abilities.get('windrider').onStart?.call(this, pokemon);
		},
		onModifySpe(spe, pokemon) { return this.dex.abilities.get('violentrush').onModifySpe?.call(this, spe, pokemon); },
		onModifyAtk(atk, pokemon) { return this.dex.abilities.get('violentrush').onModifyAtk?.call(this, atk, pokemon); },
		onAfterMove(source, target, move) { this.dex.abilities.get('violentrush').onAfterMove?.call(this, source, target, move); },
		onTryHit(target, source, move) { return this.dex.abilities.get('windrider').onTryHit?.call(this, target, source, move); },
		onSideConditionStart(side, source, sideCondition) {
			this.dex.abilities.get('windrider').onSideConditionStart?.call(this, side, source, sideCondition);
		},
		onResidual(pokemon) { this.dex.abilities.get('windrider').onResidual?.call(this, pokemon); },
		flags: { breakable: 1 },
		name: "Unova Vanguard",
		rating: 5,
		num: 10339,
	},
	hisuianresolve: {
		onStart(pokemon) { this.dex.abilities.get('magmaarmor').onStart?.call(this, pokemon); },
		onUpdate(pokemon) { this.dex.abilities.get('magmaarmor').onUpdate?.call(this, pokemon); },
		onTryHit(target, source, move) { return this.dex.abilities.get('magmaarmor').onTryHit?.call(this, target, source, move); },
		onBasePower(basePower, source, target, move) {
			return this.dex.abilities.get('bruteforce').onBasePower?.call(this, basePower, source, target, move);
		},
		onDamage(damage, target, source, effect) {
			return this.dex.abilities.get('bruteforce').onDamage?.call(this, damage, target, source, effect);
		},
		onSourceModifyAtkPriority: 6,
		onSourceModifyAtk(atk, attacker, defender, move) {
			return this.dex.abilities.get('magmaarmor').onSourceModifyAtk?.call(this, atk, attacker, defender, move);
		},
		onSourceModifySpAPriority: 5,
		onSourceModifySpA(spa, attacker, defender, move) {
			return this.dex.abilities.get('magmaarmor').onSourceModifySpA?.call(this, spa, attacker, defender, move);
		},
		onImmunity(type, pokemon) { return this.dex.abilities.get('magmaarmor').onImmunity?.call(this, type, pokemon); },
		flags: { breakable: 1 },
		name: "Hisuian Resolve",
		rating: 5,
		num: 10340,
	},
	nobleconduit: {
		onBasePowerPriority: 22,
		onBasePower(basePower, attacker, defender, move) {
			return this.dex.abilities.get('battery').onBasePower?.call(this, basePower, attacker, defender, move);
		},
		onAllyBasePowerPriority: 22,
		onAllyBasePower(basePower, attacker, defender, move) {
			return this.dex.abilities.get('battery').onAllyBasePower?.call(this, basePower, attacker, defender, move);
		},
		onModifySpAPriority: 5,
		onModifySpA(spa, pokemon) { return this.dex.abilities.get('solarpower').onModifySpA?.call(this, spa, pokemon); },
		onResidual(pokemon) { this.dex.abilities.get('solarpower').onResidual?.call(this, pokemon); },
		onDamagingHitOrder: 1,
		onDamagingHit(damage, target, source, move) {
			this.dex.abilities.get('aftermath').onDamagingHit?.call(this, damage, target, source, move);
		},
		flags: { breakable: 1 },
		name: "Noble Conduit",
		rating: 5,
		num: 10341,
	},
	nobledance: {
		onSwitchInPriority: -2,
		onStart(pokemon) { this.dex.abilities.get('hospitality').onStart?.call(this, pokemon); },
		onAfterBoost(boost, target, source, effect) {
			this.dex.abilities.get('dancer').onAfterBoost?.call(this, boost, target, source, effect);
		},
		onAfterMove(source, target, move) { this.dex.abilities.get('dancer').onAfterMove?.call(this, source, target, move); },
		onUpdate(pokemon) { this.dex.abilities.get('owntempo').onUpdate?.call(this, pokemon); },
		onTryAddVolatile(status, pokemon) { return this.dex.abilities.get('owntempo').onTryAddVolatile?.call(this, status, pokemon); },
		onHit(target, source, move) { this.dex.abilities.get('owntempo').onHit?.call(this, target, source, move); },
		onTryBoost(boost, target, source, effect) {
			return this.dex.abilities.get('owntempo').onTryBoost?.call(this, boost, target, source, effect);
		},
		flags: { breakable: 1 },
		name: "Noble Dance",
		rating: 4.5,
		num: 10342,
	},
	noblearmor: {
		onModifyDef(def, pokemon) { return this.dex.abilities.get('prismarmor').onModifyDef?.call(this, def, pokemon); },
		onModifySpD(spd, pokemon) { return this.dex.abilities.get('prismarmor').onModifySpD?.call(this, spd, pokemon); },
		onSourceModifyDamage(damage, source, target, move) {
			return this.dex.abilities.get('prismarmor').onSourceModifyDamage?.call(this, damage, source, target, move);
		},
		onDamagingHit(damage, target, source, move) {
			this.dex.abilities.get('icebody').onDamagingHit?.call(this, damage, target, source, move);
		},
		onWeather(target, source, effect) { this.dex.abilities.get('icebody').onWeather?.call(this, target, source, effect); },
		onResidual(pokemon) {
			this.dex.abilities.get('icebody').onResidual?.call(this, pokemon);
		},
		onImmunity(type, pokemon) {
			return this.dex.abilities.get('icebody').onImmunity?.call(this, type, pokemon);
		},
		flags: { breakable: 1 },
		name: "Noble Armor",
		rating: 5,
		num: 10343,
	},
	noblerider: {
		onModifySpe(spe, pokemon) { return this.dex.abilities.get('swiftswim').onModifySpe?.call(this, spe, pokemon); },
		onModifySTAB(stab, source, target, move) {
			return this.dex.abilities.get('adaptability').onModifySTAB?.call(this, stab, source, target, move);
		},
		flags: { breakable: 1 },
		name: "Noble Rider",
		rating: 5,
		num: 10344,
	},
	celestialheart: {
		onSourceModifyDamage(damage, source, target, move) {
			return this.dex.abilities.get('multiscale').onSourceModifyDamage?.call(this, damage, source, target, move);
		},
		onModifyMove(move) {
			this.dex.abilities.get('serenegrace').onModifyMove?.call(this, move);
		},
		onAnyFaintPriority: 1,
		onAnyFaint() {
			return this.dex.abilities.get('soulheart').onAnyFaint?.call(this);
		},
		flags: {},
		name: "Celestial Heart",
		rating: 4.5,
		num: 10293,
	},
	crueltag: {
		onStart(pokemon) {
			this.dex.abilities.get('shadowtag').onStart?.call(this, pokemon);
		},
		onModifyMove(move, source) {
			this.dex.abilities.get('infiltrator').onModifyMove?.call(this, move, source);
		},
		onFaint(pokemon) {
			if (this.field.terrain === 'hauntedterrain') {
				this.field.terrainState.duration = Math.max(this.field.terrainState.duration || 0, 5);
			} else if (this.field.setTerrain('hauntedterrain', pokemon, this.dex.abilities.get('crueltag'), true)) {
				this.field.terrainState.duration = 5;
			}
		},
		flags: {},
		name: "Cruel Tag",
		rating: 5,
		num: 10294,
	},
	adaptability: {
		onModifySTAB(stab, source, target, move) {
			if (move.forceSTAB || source.hasType(move.type)) {
				if (stab === 2) {
					return 2.25;
				}
				return 2;
			}
		},
		flags: {},
		name: "Adaptability",
		rating: 4,
		num: 91,
	},
	spiralevolution: {
		onImmunity(type, pokemon) {
			if (type === 'Ground') return false;
		},
		onModifySTAB(stab, source, target, move) {
			return this.dex.abilities.get('adaptability').onModifySTAB?.call(this, stab, source, target, move);
		},
		onModifyMove(move, source) {
			this.dex.abilities.get('dualwield').onModifyMove?.call(this, move, source);
			if (move.category !== 'Status') {
				move.breaksProtect = true;
				(move as typeof move & { spiralEvolutionBreaksProtect?: boolean }).spiralEvolutionBreaksProtect = true;
			}
		},
		onBasePowerPriority: 21,
		onBasePower(basePower, source, target, move) {
			const spiralMove = move as typeof move & { spiralEvolutionProtectedTargets?: Pokemon[] };
			let modifier = getDualWieldModifier(move);
			if (move.id === 'twineedle') modifier *= 2;
			if (spiralMove.spiralEvolutionProtectedTargets?.includes(target)) modifier *= 0.5;
			if (this.field.isTerrain('dragonsdenterrain')) modifier *= 1.2;
			if (modifier !== 1) return this.chainModify(modifier);
		},
		onFractionalPriority(priority, pokemon, target, move) {
			if (priority === 0 && move.priority === 0 && this.field.getPseudoWeather('trickroom')) return 0.1;
		},
		onSourceModifyDamage(damage, source, target, move) {
			return this.chainModify(0.8);
		},
		onModifyCritRatio(critRatio) {
			return critRatio + 1;
		},
		flags: {},
		name: "Spiral Evolution",
		rating: 5,
		num: 10206,
	},
	alchemistsurge: {
		onStart(pokemon) {
			this.dex.abilities.get('psychicsurge').onStart?.call(this, pokemon);
		},
		onSwitchIn(pokemon) {
			this.dex.abilities.get('psychicsurge').onStart?.call(this, pokemon);
		},
		onAfterEachBoost(boost, target, source, effect) {
			return this.dex.abilities.get('competitive').onAfterEachBoost?.call(this, boost, target, source, effect);
		},
		onModifyMove(move, source) {
			this.dex.abilities.get('hydrabond').onModifyMove?.call(this, move, source);
		},
		onSourceModifySecondaries(secondaries, target, source, move) {
			return this.dex.abilities.get('hydrabond').onSourceModifySecondaries?.call(this, secondaries, target, source, move);
		},
		onBasePower(basePower, source, target, move) {
			const competitiveMod = this.dex.abilities.get('competitive').onBasePower?.call(this, basePower, source, target, move);
			const hydraMod = this.dex.abilities.get('hydrabond').onBasePower?.call(this, basePower, source, target, move);
			return hydraMod || competitiveMod;
		},
		flags: {},
		name: "Alchemist Surge",
		rating: 5,
		num: 10255,
	},
	guidingomen: {
		onAnyModifyDamage(damage, source, target, move) { return this.dex.abilities.get('friendguard').onAnyModifyDamage?.call(this, damage, source, target, move); },
		onModifyMove(move) { this.dex.abilities.get('serenegrace').onModifyMove?.call(this, move); },
		flags: {},
		name: "Guiding Omen",
		rating: 4.5,
		num: 10283,
	},
	greatmarsh: {
		onTryHit(target, source, move) { return this.dex.abilities.get('dryskin').onTryHit?.call(this, target, source, move); },
		onSourceBasePowerPriority: 17,
		onSourceBasePower(basePower, attacker, defender, move) {
			return this.dex.abilities.get('dryskin').onSourceBasePower?.call(this, basePower, attacker, defender, move);
		},
		onWeather(target, source, effect) { return this.dex.abilities.get('dryskin').onWeather?.call(this, target, source, effect); },
		onModifySTAB(stab, source, target, move) {
			return this.dex.abilities.get('adaptability').onModifySTAB?.call(this, stab, source, target, move);
		},
		flags: {},
		name: "Great Marsh",
		rating: 4,
		num: 10335,
	},
	phalanxform: {
		onModifyMove(move, source) { this.dex.abilities.get('hydrabond').onModifyMove?.call(this, move, source); },
		onSourceModifySecondaries(secondaries, target, source, move) { return this.dex.abilities.get('hydrabond').onSourceModifySecondaries?.call(this, secondaries, target, source, move); },
		onBasePower(basePower, source, target, move) { return this.dex.abilities.get('hydrabond').onBasePower?.call(this, basePower, source, target, move); },
		onAnyModifyDamage(damage, source, target, move) { return this.dex.abilities.get('friendguard').onAnyModifyDamage?.call(this, damage, source, target, move); },
		onCriticalHit: false,
		flags: {},
		name: "Phalanx Form",
		rating: 4.5,
		num: 10284,
	},
	windchime: {
		onModifyType(move, pokemon) { return this.dex.abilities.get('ironclad').onModifyType?.call(this, move, pokemon); },
		onBasePower(basePower, source, target, move) {
			const iron = this.dex.abilities.get('ironclad').onBasePower?.call(this, basePower, source, target, move);
			const wind = this.dex.abilities.get('windpower').onBasePower?.call(this, iron ?? basePower, source, target, move);
			return wind ?? iron;
		},
		onImmunity(type, pokemon) { if (type === 'Ground') return false; },
		flags: {},
		name: "Wind Chime",
		rating: 4,
		num: 10285,
	},
	auramaster: {
		onBasePower(basePower, attacker, defender, move) {
			const launcherBoost = move.flags['pulse'] || move.flags['bullet'] ? 1.5 : 1;
			return this.chainModify(getDualWieldModifier(move, launcherBoost));
		},
		onModifyMove(move, source) { this.dex.abilities.get('dualwield').onModifyMove?.call(this, move, source); },
		onTryAddVolatile(status, pokemon) {
			return this.dex.abilities.get('innerfocus').onTryAddVolatile?.call(this, status, pokemon);
		},
		onTryBoost(boost, target, source, effect) {
			return this.dex.abilities.get('innerfocus').onTryBoost?.call(this, boost, target, source, effect);
		},
		flags: {},
		name: "Aura Master",
		rating: 4.5,
		num: 10280,
	},
	patternshift: {
		onPrepareHit(source, target, move) {
			this.dex.abilities.get('protean').onPrepareHit?.call(this, source, target, move);
		},
		onResidual(pokemon) {
			this.dex.abilities.get('shedskin').onResidual?.call(this, pokemon);
		},
		onModifyCritRatio(critRatio, source, target) {
			return this.dex.abilities.get('merciless').onModifyCritRatio?.call(this, critRatio, source, target);
		},
		flags: {},
		name: "Pattern Shift",
		rating: 4.5,
		num: 10281,
	},
	bonewarrior: {
		onStart(pokemon) {
			this.dex.abilities.get('battlearmor').onStart?.call(this, pokemon);
		},
		onSourceModifyDamage(damage, source, target, move) {
			return this.dex.abilities.get('battlearmor').onSourceModifyDamage?.call(this, damage, source, target, move);
		},
		onAfterEachBoost(boost, target, source, effect) {
			return this.dex.abilities.get('battlearmor').onAfterEachBoost?.call(this, boost, target, source, effect);
		},
		onImmunity(type, pokemon) {
			return this.dex.abilities.get('selfsufficient').onImmunity?.call(this, type, pokemon);
		},
		onResidual(pokemon) {
			return this.dex.abilities.get('selfsufficient').onResidual?.call(this, pokemon);
		},
		onCriticalHit: false,
		flags: { breakable: 1 },
		name: "Bone Warrior",
		rating: 4.5,
		num: 10282,
	},
	technicalspecialist: {
		onModifyMove(move) {
			this.dex.abilities.get('shedskin').onModifyMove?.call(this, move);
		},
		onBasePower(basePower, source, target, move) {
			return this.dex.abilities.get('technician').onBasePower?.call(this, basePower, source, target, move);
		},
		onResidual(pokemon) {
			this.dex.abilities.get('shedskin').onResidual?.call(this, pokemon);
		},
		onCriticalHit: false,
		flags: {},
		name: "Technical Specialist",
		rating: 4.5,
		num: 10283,
	},
	dualwield: {
		onModifyMove(move, source) {
			if (move.category === 'Status' || move.multihit || move.flags['charge'] || move.flags['futuremove'] || move.isZ || move.isMax) return;
			const arrowMoves = ['spiritshackle', 'thousandarrows', 'triplearrows', 'snipeshot', 'razorleaf', 'magicalleaf', 'spikecannon', 'pinmissile', 'iciclespear', 'rockblast', 'bulletseed', 'scaleshot', 'psychocut', 'ceaselessedge'];
			if (!(move.flags['slicing'] || move.flags['pulse'] || move.flags['bullet'] || move.flags['horn'] || move.flags['drill'] || arrowMoves.includes(move.id))) return;
			move.multihit = 2;
			move.multihitType = 'dualwield';
			move.dualWieldAccuracy = move.accuracy;
			move.dualWieldFullPower = this.gameType === 'freeforall';
			move.accuracy = true;
		},
		onBasePowerPriority: 20,
		onBasePower(basePower, source, target, move) {
			if (move.multihitType === 'dualwield') return this.chainModify(getDualWieldModifier(move));
		},
		flags: {},
		name: "Dual Wield",
		shortDesc: "Two 65% independent rolls; boosting pairs: full +20%; FFA: two full-power targets.",
		rating: 4,
		num: 10284,
	},
	apexpredator: {
		onModifyMove(move, source, target) {
			if (target && move.category !== 'Status' && target.getMoveHitData(move).typeMod > 0) move.accuracy = true;
			this.dex.abilities.get('relicarmor').onModifyMove?.call(this, move, source);
		},
		onModifyDamage(damage, source, target, move) {
			return this.dex.abilities.get('relicarmor').onModifyDamage?.call(this, damage, source, target, move);
		},
		onSourceModifyDamage(damage, source, target, move) {
			return this.dex.abilities.get('relicarmor').onSourceModifyDamage?.call(this, damage, source, target, move);
		},
		onModifyAtk(atk, pokemon, target, move) {
			return this.dex.abilities.get('relicarmor').onModifyAtk?.call(this, atk, pokemon, target, move);
		},
		onModifySpA(spa, pokemon, target, move) {
			return this.dex.abilities.get('relicarmor').onModifySpA?.call(this, spa, pokemon, target, move);
		},
		flags: {},
		name: "Apex Predator",
		rating: 5,
		num: 10285,
	},
	violentrush: {
		onModifySpe(spe, pokemon) {
			if (pokemon.activeTurns <= 1) return this.chainModify(1.5);
		},
		onModifyAtk(atk, pokemon) {
			if (pokemon.activeTurns <= 1) return this.chainModify(1.2);
		},
		flags: {},
		name: "Violent Rush",
		rating: 3.5,
		num: 10286,
	},
	unleashedego: {
		onModifyMove(move) {
			this.dex.abilities.get('ragingstorm').onModifyMove?.call(this, move);
		},
		onSourceTryPrimaryHit(target, source, move) {
			this.dex.abilities.get('ragingstorm').onSourceTryPrimaryHit?.call(this, target, source, move);
		},
		onModifyCritRatio(critRatio, source, target, move) {
			return this.dex.abilities.get('ragingstorm').onModifyCritRatio?.call(this, critRatio, source, target, move);
		},
		onSourceDamagingHit(damage, target, source, move) {
			this.dex.abilities.get('ragingstorm').onSourceDamagingHit?.call(this, damage, target, source, move);
		},
		onAfterMoveSecondarySelf(source, target, move) {
			this.dex.abilities.get('ragingstorm').onAfterMoveSecondarySelf?.call(this, source, target, move);
		},
		onDamage(damage, target, source, effect) {
			return this.dex.abilities.get('ultraego').onDamage?.call(this, damage, target, source, effect);
		},
		onDamagingHit(damage, target, source, move) {
			this.dex.abilities.get('ultraego').onDamagingHit?.call(this, damage, target, source, move);
		},
		onSourceModifyDamage(damage, source, target, move) {
			return this.dex.abilities.get('ultraego').onSourceModifyDamage?.call(this, damage, source, target, move);
		},
		onResidual(pokemon) {
			this.dex.abilities.get('ultraego').onResidual?.call(this, pokemon);
		},
		onImmunity(type, pokemon) {
			if (type === 'Ground') return false;
		},
		flags: {},
		name: "Unleashed Ego",
		rating: 5,
		num: 10287,
	},
	joyride: {
		onModifyTypePriority: -1,
		onModifyType(move, pokemon) {
			this.dex.abilities.get('aerilate').onModifyType?.call(this, move, pokemon);
		},
		onBasePowerPriority: 23,
		onBasePower(basePower, pokemon, target, move) {
			return this.dex.abilities.get('aerilate').onBasePower?.call(this, basePower, pokemon, target, move);
		},
		onTryBoost(boost, target, source, effect) { return this.dex.abilities.get('hypercutter').onTryBoost?.call(this, boost, target, source, effect); },
		flags: {},
		name: "Joyride",
		rating: 4.5,
		num: 10257,
	},
	aerilate: {
		onModifyTypePriority: -1,
		onModifyType(move, pokemon) {
			const noModifyType = [
				'judgment', 'multiattack', 'naturalgift', 'revelationdance', 'technoblast', 'terrainpulse', 'weatherball',
			];
			if (move.type === 'Normal' && (!noModifyType.includes(move.id) || this.activeMove?.isMax) &&
				!(move.isZ && move.category !== 'Status') && !(move.name === 'Tera Blast' && pokemon.terastallized)) {
				move.type = 'Flying';
				move.typeChangerBoosted = this.effect;
			}
		},
		onBasePowerPriority: 23,
		onBasePower(basePower, pokemon, target, move) {
			if (move.typeChangerBoosted === this.effect) {
				if (this.field.isTerrain('mountainterrain') || this.field.isTerrain('snowymountainterrain')) {
					return this.chainModify(1.5);
				}
			} return this.chainModify(1.2);
		},
		flags: {},
		name: "Aerilate",
		rating: 4,
		num: 184,
	},
	aftermath: {
		onDamagingHitOrder: 1,
		onDamagingHit(damage, target, source, move) {
			if (!target.hp && this.checkMoveMakesContact(move, source, target, true)) {
				if (this.field.isTerrain('corrosivemistterrain')) {
					this.damage(source.baseMaxhp / 2, source, target);
				} else {
					this.damage(source.baseMaxhp / 4, source, target);
				}
			}
		},
		flags: {},
		name: "Aftermath",
		rating: 2,
		num: 106,
	},
	airlock: {
		onSwitchIn(pokemon) {
			// Air Lock does not activate when Skill Swapped or when Neutralizing Gas leaves the field
			this.add('-ability', pokemon, 'Air Lock');
			((this.effect as any).onStart as (p: Pokemon) => void).call(this, pokemon);
		},
		onStart(pokemon) {
			pokemon.abilityState.ending = false; // Clear the ending flag
			this.eachEvent('WeatherChange', this.effect);
		},
		onEnd(pokemon) {
			pokemon.abilityState.ending = true;
			this.eachEvent('WeatherChange', this.effect);
		},
		suppressWeather: true,
		flags: {},
		name: "Air Lock",
		rating: 1.5,
		num: 76,
	},
	analytic: {
		onBasePowerPriority: 21,
		onBasePower(basePower, pokemon) {
			let boosted = true;
			for (const target of this.getAllActive()) {
				if (target === pokemon) continue;
				if (this.queue.willMove(target)) {
					boosted = false;
					break;
				}
			}
			if (boosted) {
				this.debug('Analytic boost');
				return this.chainModify([5325, 4096]);
			}
		},
		flags: {},
		name: "Analytic",
		rating: 2.5,
		num: 148,
	},
	angerpoint: {
		onStart(pokemon) {
			pokemon.abilityState.angerpoint = false;
		},
		onHit(target, source, move) {
			if (!target.hp) return;
			if (!source.abilityState.angerpoint && move.category !== 'Status') {
				source.abilityState.angerpoint = true;
				this.boost({ atk: 1 }, target, target);
			}
			if (move?.effectType === 'Move' && target.getMoveHitData(move).crit) {
				this.boost({ atk: 12 }, target, target);
			}
		},
		flags: {},
		name: "Anger Point",
		rating: 1,
		num: 83,
	},
	angershell: {
		onDamage(damage, target, source, effect) {
			this.effectState.checkedAngerShell = !(
				effect.effectType === "Move" && !effect.multihit &&
				!(effect.hasSheerForce && source.hasAbility('sheerforce'))
			);
		},
		onTryEatItem(item) {
			const healingItems = [
				'aguavberry', 'enigmaberry', 'figyberry', 'iapapaberry', 'magoberry', 'sitrusberry', 'wikiberry', 'oranberry', 'berryjuice',
			];
			if (healingItems.includes(item.id)) {
				return this.effectState.checkedAngerShell;
			}
			return true;
		},
		onAfterMoveSecondary(target, source, move) {
			this.effectState.checkedAngerShell = true;
			if (!source || source === target || !target.hp || !move.totalDamage) return;
			const lastAttackedBy = target.getLastAttackedBy();
			if (!lastAttackedBy) return;
			const damage = move.multihit ? move.totalDamage : lastAttackedBy.damage;
			if (target.hp <= target.maxhp / 2 && target.hp + damage > target.maxhp / 2) {
				this.boost({ atk: 1, spa: 1, spe: 1, def: -1, spd: -1 }, target, target);
			}
		},
		flags: {},
		name: "Anger Shell",
		rating: 3,
		num: 271,
	},
	anticipation: {
		onStart(pokemon) {
			for (const target of pokemon.foes()) {
				for (const moveSlot of target.moveSlots) {
					const move = this.dex.moves.get(moveSlot.move);
					if (move.category === 'Status') continue;
					const moveType = move.id === 'hiddenpower' ? target.hpType : move.type;
					if (
						this.dex.getImmunity(moveType, pokemon) && this.dex.getEffectiveness(moveType, pokemon) > 0 ||
						move.ohko
					) {
						this.add('-ability', pokemon, 'Anticipation');
						return;
					}
				}
			}
			if (this.field.isTerrain('psychicterrain')) {
				return this.boost({ spa: 2 });
			}
		},
		flags: {},
		name: "Anticipation",
		rating: 0.5,
		num: 107,
	},
	arenatrap: {
		onFoeTrapPokemon(pokemon) {
			if (!pokemon.isAdjacent(this.effectState.target)) return;
			if (pokemon.isGrounded()) {
				pokemon.tryTrap(true);
			}
		},
		onFoeMaybeTrapPokemon(pokemon, source) {
			if (!source) source = this.effectState.target;
			if (!source || !pokemon.isAdjacent(source)) return;
			if (pokemon.isGrounded(!pokemon.knownType)) { // Negate immunity if the type is unknown
				pokemon.maybeTrapped = true;
			}
		},
		flags: {},
		name: "Arena Trap",
		rating: 5,
		num: 71,
	},
	armortail: {
		onStart(pokemon) {
			if (this.field.isTerrain('fairytaleterrain')) {
				this.boost({ def: 1, spd: 1 });
			}
		},
		onFoeTryMove(target, source, move) {
			const targetAllExceptions = ['perishsong', 'flowershield', 'rototiller'];
			if (move.target === 'foeSide' || (move.target === 'all' && !targetAllExceptions.includes(move.id))) {
				return;
			}

			const armorTailHolder = this.effectState.target;
			if ((source.isAlly(armorTailHolder) || move.target === 'all') && move.priority > 0.1) {
				this.attrLastMove('[still]');
				this.add('cant', armorTailHolder, 'ability: Armor Tail', move, `[of] ${target}`);
				return false;
			}
		},
		flags: { breakable: 1 },
		name: "Armor Tail",
		rating: 2.5,
		num: 296,
	},
	aromaveil: {
		onAllyTryAddVolatile(status, target, source, effect) {
			if (['attract', 'disable', 'encore', 'healblock', 'taunt', 'torment'].includes(status.id)) {
				if (effect.effectType === 'Move') {
					const effectHolder = this.effectState.target;
					this.add('-block', target, 'ability: Aroma Veil', `[of] ${effectHolder}`);
				}
				return null;
			}
		},
		flags: { breakable: 1 },
		name: "Aroma Veil",
		rating: 2,
		num: 165,
	},
	asoneglastrier: {
		onSwitchInPriority: 1,
		onStart(pokemon) {
			if (this.effectState.unnerved) return;
			this.add('-ability', pokemon, 'As One');
			this.add('-ability', pokemon, 'Unnerve');
			this.effectState.unnerved = true;
		},
		onEnd() {
			this.effectState.unnerved = false;
		},
		onFoeTryEatItem() {
			return !this.effectState.unnerved;
		},
		onSourceAfterFaint(length, target, source, effect) {
			if (effect && effect.effectType === 'Move') {
				this.boost({ atk: length }, source, source, this.dex.abilities.get('chillingneigh'));
			}
		},
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, cantsuppress: 1 },
		name: "As One (Glastrier)",
		rating: 3.5,
		num: 266,
	},
	asonespectrier: {
		onSwitchInPriority: 1,
		onStart(pokemon) {
			if (this.effectState.unnerved) return;
			this.add('-ability', pokemon, 'As One');
			this.add('-ability', pokemon, 'Unnerve');
			this.effectState.unnerved = true;
		},
		onEnd() {
			this.effectState.unnerved = false;
		},
		onFoeTryEatItem() {
			return !this.effectState.unnerved;
		},
		onSourceAfterFaint(length, target, source, effect) {
			if (effect && effect.effectType === 'Move') {
				this.boost({ spa: length }, source, source, this.dex.abilities.get('grimneigh'));
			}
		},
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, cantsuppress: 1 },
		name: "As One (Spectrier)",
		rating: 3.5,
		num: 267,
	},
	aquashell: {
		onSourceModifyAtkPriority: 5,
		onSourceModifyAtk(atk, attacker, defender, move) {
			if (move && this.movehasType(move, 'Fire')) {
				return this.chainModify(0.5);
			}
		},
		onSourceModifySpAPriority: 5,
		onSourceModifySpA(atk, attacker, defender, move) {
			if (move && this.movehasType(move, 'Fire')) {
				return this.chainModify(0.5);
			}
		},
		onModifyAtk(atk, attacker, defender, move) {
			if (move && this.movehasType(move, 'Water')) {
				return this.chainModify(2);
			}
		},
		onModifySpA(atk, defender, attacker, move) {
			if (move && this.movehasType(move, 'Water')) {
				return this.chainModify(2);
			}
		},
		onUpdate(pokemon) {
			if (pokemon.status === 'brn') {
				this.add('-activate', pokemon, 'ability: Aqua Shell');
				pokemon.cureStatus();
			}
		},
		onSwitchIn(pokemon) {
			pokemon.addVolatile('aquaring');
		},
		onSetStatus(status, target, source, effect) {
			if (status.id !== 'brn') return;
			if ((effect as Move)?.status) {
				this.add('-immune', target, '[from] ability: Aqua Shell');
			}
			return false;
		},
		onImmunity(type, pokemon) {
			if (type === 'sandstorm' || type === 'hail') return false;
		},
		onResidual(pokemon) {
			if (this.field.terrain === 'watersurfaceterrain' || this.field.terrain === 'underwaterterrain') {
				pokemon.cureStatus();
			}
		},
		flags: { breakable: 1 },
		name: "Aqua Shell",
		rating: 5,
		num: 10180,
	},
	aurabreak: {
		onStart(pokemon) {
			this.add('-ability', pokemon, 'Aura Break');
		},
		onAnyTryPrimaryHit(target, source, move) {
			if (target === source || move.category === 'Status') return;
			move.hasAuraBreak = true;
		},
		flags: { breakable: 1 },
		name: "Aura Break",
		rating: 1,
		num: 188,
	},
	baddreams: {
		onResidualOrder: 28,
		onResidualSubOrder: 2,
		onResidual(pokemon) {
			if (!pokemon.hp || this.field.isTerrain('rainbowterrain')) return;
			for (const target of pokemon.foes()) {
				if (target.status === 'slp' || target.hasAbility('comatose')) {
					this.damage(target.baseMaxhp / 8, target, pokemon);
				}
			}
		},
		flags: {},
		name: "Bad Dreams",
		rating: 1.5,
		num: 123,
	},
	ballfetch: {
		flags: {},
		name: "Ball Fetch",
		rating: 0,
		num: 237,
	},
	battery: {
		onBasePowerPriority: 22,
		onBasePower(basePower, attacker, defender, move) {
			if (move.category !== 'Special') return;
			let modifier = 1.3;
			if (this.field.isTerrain('electricterrain') || this.field.effectiveWeather() === 'raindance') {
				modifier *= 1.5;
			}
			this.debug('Battery boost');
			return this.chainModify(modifier);
		},
		onAllyBasePowerPriority: 22,
		onAllyBasePower(basePower, attacker, defender, move) {
			if (attacker !== this.effectState.target && move.category === 'Special') {
				this.debug('Battery boost');
				return this.chainModify(1.3);
			}
		},
		flags: {},
		name: "Battery",
		rating: 0,
		num: 217,
	},
	battlearmor: {
		onCriticalHit: false,
		flags: { breakable: 1 },
		onSourceModifyDamage(damage, source, target, move) {
			return this.chainModify(0.8);
		},
		onStart() {
			if (this.field.isTerrain('fairytaleterrain')) {
				this.boost({ def: 1 });
			}
		},
		onAfterEachBoost(boost, target, source, effect) {
			if (target.isAlly(source)) {
				return;
			}
			let statsLowered = false;
			let i: BoostID;
			for (i in boost) {
				if (boost[i]! < 0) {
					statsLowered = true;
				}
			}
			if (statsLowered) {
				this.boost({ def: 2 }, target, target, null, false, true);
			}
		},
		name: "Battle Armor",
		rating: 1,
		num: 4,
	},
	battlefervor: {
		onSwitchInPriority: 1,
		onStart(pokemon) {
			if (this.field.isTerrain('bewitchedwoodsterrain')) return;
			pokemon.abilityState.battleFervorDamageReduced = false;
			if (this.effectState.unnerved) return;
			this.add('-ability', pokemon, 'Battle Fervor');
			this.effectState.unnerved = true;
			if (this.field.isTerrain('coldeclipseterrain')) {
				let activated = false;
				for (const target of pokemon.foes()) {
					if (!activated) {
						this.add('-ability', pokemon, 'Battle Fervor', 'boost');
						activated = true;
					}
					if (target.volatiles['substitute']) {
						this.add('-immune', target);
					} else {
						this.boost({ spe: -1 }, target, pokemon, null, true);
					}
				}
			}
		},
		onEnd() {
			this.effectState.unnerved = false;
		},
		onFoeUseItem(item) {
			if (this.field.isTerrain('bewitchedwoodsterrain')) return;
			if (['elementalseed', 'telluricseed', 'magicalseed', 'syntheticseed'].includes(item.id)) {
				return !this.effectState.unnerved;
			}
		},
		onFoeTryEatItem() {
			if (this.field.isTerrain('bewitchedwoodsterrain')) return;
			return !this.effectState.unnerved;
		},
		onTryAddVolatile(status, pokemon) {
			if (this.field.isTerrain('bewitchedwoodsterrain')) return;
			if (status.id === 'flinch' && this.field.isTerrain(['ashenbeachterrain', 'newworldterrain', 'starlightarenaterrain', 'holyterrain', 'coldeclipseterrain'])) {
				return null;
			}
		},
		onTryBoost(boost, target, source, effect) {
			if (this.field.isTerrain('bewitchedwoodsterrain')) return;
			if (!this.field.isTerrain(['ashenbeachterrain', 'newworldterrain', 'starlightarenaterrain', 'holyterrain', 'coldeclipseterrain'])) return;
			if (source && target.isAlly(source)) return;
			let blocked = false;
			let i: BoostID;
			for (i in boost) {
				if (boost[i]! < 0) {
					delete boost[i];
					blocked = true;
				}
			}
			if (blocked) this.add('-fail', target, 'unboost', '[from] ability: Battle Fervor', `[of] ${target}`);
		},
		onBasePowerPriority: 21,
		onBasePower(basePower, source, target, move) {
			if (this.field.isTerrain('bewitchedwoodsterrain')) return;
			if (move.category === 'Status') return;
			if (target?.hasAbility('battlebond')) return;
			if (!this.getAllActive().some(pokemon => pokemon.hasAbility('neutralization')) && this.getAllActive().some(pokemon => pokemon.hasAbility(['royaldecree', 'royalsun']))) {
				this.debug('Battle Fervor Royal Decree boost');
				return this.chainModify(1.3);
			}
			if (target && (this.queue.willMove(target) || target.newlySwitched)) {
				this.debug('Battle Fervor boost');
				return this.chainModify(1.2);
			}
		},
		onSourceModifyDamage(damage, source, target, move) {
			if (this.field.isTerrain('bewitchedwoodsterrain')) return;
			if (!move || move.category === 'Status') return;
			if (!this.getAllActive().some(pokemon => pokemon.hasAbility('neutralization')) && this.getAllActive().some(pokemon => pokemon.hasAbility(['royaldecree', 'royalsun']))) {
				this.debug('Battle Fervor Royal Decree weaken');
				return this.chainModify(0.7);
			}
			if (target.abilityState.battleFervorDamageReduced) return;
			if (this.field.isTerrain(['ashenbeachterrain', 'newworldterrain', 'starlightarenaterrain', 'holyterrain', 'coldeclipseterrain'])) {
				this.debug('Battle Fervor field weaken');
				target.abilityState.battleFervorDamageReduced = true;
				return this.chainModify(0.8);
			}
			if (this.queue.willMove(target)) {
				this.debug('Battle Fervor weaken');
				target.abilityState.battleFervorDamageReduced = true;
				return this.chainModify(0.8);
			}
		},
		onDamagingHit(damage, target, source, move) {
			if (!source || target.isAlly(source) || !move || move.category === 'Status') return;
			if (!target.battleFervorBoosted) {
				target.battleFervorBoosted = true;
				this.boost({ atk: 1, spa: 1 }, target, target);
			}
		},
		flags: {},
		name: "Battle Fervor",
		rating: 4,
		num: 10014,
	},
	battlebond: {
		onStart(pokemon) {
			if (pokemon.species.id === 'garchompbattlebond' && this.field.isTerrain(['ashenbeachterrain', 'newworldterrain', 'starlightarenaterrain', 'holyterrain', 'coldeclipseterrain'])) {
				this.boost({ accuracy: 1 }, pokemon, pokemon);
			}
		},
		onTryAddVolatile(status, pokemon) {
			if (pokemon.species.id === 'garchompbattlebond' && status.id === 'flinch') return null;
		},
		onTryBoost(boost, target, source, effect) {
			if (target.species.id === 'garchompbattlebond' && effect.name === 'Intimidate' && boost.atk) {
				delete boost.atk;
				this.add('-fail', target, 'unboost', 'Attack', '[from] ability: Battle Bond', `[of] ${target}`);
			}
		},
		onSourceAfterFaint(length, target, source, effect) {
			if (effect?.effectType !== 'Move') {
				return;
			}
			if (['garchompbattlebond', 'greninjaash'].includes(source.species.id)) {
				this.heal(source.baseMaxhp / 8, source, source);
				return;
			}
			if (source.bondTriggered) return;
			if (source.species.id === 'garchomp' && source.hp && !source.transformed && source.side.foePokemonLeft()) {
				this.add('-activate', source, 'ability: Battle Bond');
				source.formeChange('Garchomp-Battle-Bond', this.effect, true);
				source.formeRegression = true;
				source.bondTriggered = true;
				return;
			}
			if (source.species.id === 'greninjabond' && source.hp && !source.transformed && source.side.foePokemonLeft()) {
				this.add('-activate', source, 'ability: Battle Bond');
				source.formeChange('Greninja-Ash', this.effect, true);
				source.formeRegression = true;
				source.bondTriggered = true;
			} else if (source.species.id === 'greninja') {
				this.boost({ atk: 1, spa: 1, spe: 1 }, source, source, this.effect);
				this.add('-activate', source, 'ability: Battle Bond');
				source.bondTriggered = true;
			}
		},
		onModifyMove(move, pokemon) {
			if (pokemon.species.id === 'garchompbattlebond') {
				move.ignoreAbility = true;
				move.infiltrates = true;
				delete move.flags['charge'];
			}
		},
		onBasePowerPriority: 21,
		onBasePower(basePower, source, target, move) {
			let modifier = 1;
			if (target?.hasAbility(['royaldecree', 'neutralization'])) {
				this.debug('Battle Bond authority breaker boost');
				modifier *= 1.3;
			}
			if (this.field.isTerrain('coldeclipseterrain')) {
				this.debug('Battle Bond Cold Eclipse boost');
				modifier *= 1.3;
			}
			if (source.species.id === 'garchompbattlebond' && (this.field.isTerrain(['ashenbeachterrain', 'newworldterrain', 'starlightarenaterrain', 'holyterrain', 'coldeclipseterrain']) || this.queue.willMove(target) || target.newlySwitched)) {
				this.debug('Battle Bond Ultra Instinct boost');
				modifier *= 1.5;
			}
			if (modifier !== 1) return this.chainModify(modifier);
		},
		onSourceModifyDamage(damage, source, target, move) {
			if (target.hasAbility('battlebond') && source && isFightingClauseAbility(source)) {
				this.debug('Battle Bond Fighting Clause damage reduction');
				return this.chainModify(0.7);
			}
			if (target.hasAbility('battlebond') && move.category !== 'Status') {
				this.debug('Battle Bond Shadow Current damage reduction');
				return this.chainModify(this.field.isTerrain('coldeclipseterrain') ? 0.6 : 0.75);
			}
		},
		onDamage(damage, target, source, effect) {
			if (!['doubles', 'multi', 'freeforall'].includes(this.gameType)) return;
			if (effect?.effectType !== 'Move') return;
			if (!target.hasAbility('battlebond')) return;
			if (target.abilityState.battleBondEndured) return;
			if (target.hp <= target.maxhp / 3 || damage < target.hp) return;
			target.abilityState.battleBondEndured = true;
			return target.hp - 1;
		},
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, cantsuppress: 1 },
		name: "Battle Bond",
		rating: 3.5,
		num: 210,
	},
	beadsofruin: {
		onStart(pokemon) {
			if (this.suppressingAbility(pokemon)) return;
			this.add('-ability', pokemon, 'Beads of Ruin');
		},
		onAnyModifySpD(spd, target, source, move) {
			const abilityHolder = this.effectState.target;
			if (target.hasAbility('Beads of Ruin')) return;
			if (!move.ruinedSpD?.hasAbility('Beads of Ruin')) move.ruinedSpD = abilityHolder;
			if (move.ruinedSpD !== abilityHolder) return;
			this.debug('Beads of Ruin SpD drop');
			if (this.field.isTerrain('newworldterrain'))
				return this.chainModify(0.66);
			else
				return this.chainModify(0.75);
		},
		flags: {},
		name: "Beads of Ruin",
		rating: 4.5,
		num: 284,
	},
	beastboost: {
		onSourceAfterFaint(length, target, source, effect) {
			if (effect && effect.effectType === 'Move') {
				const bestStat = source.getBestStat(true, true);
				this.boost({ [bestStat]: length }, source);
			}
		},
		flags: {},
		name: "Beast Boost",
		rating: 3.5,
		num: 224,
	},
	berserk: {
		onStart(pokemon) {
			if (this.field.isTerrain('dragonsdenterrain')) {
				this.boost({ spa: 2 }, pokemon, pokemon);
			}
		},
		onDamage(damage, target, source, effect) {
			this.effectState.checkedBerserk = !(
				effect.effectType === "Move" && !effect.multihit &&
				!(effect.hasSheerForce && source.hasAbility('sheerforce'))
			);
		},
		onTryEatItem(item) {
			const healingItems = [
				'aguavberry', 'enigmaberry', 'figyberry', 'iapapaberry', 'magoberry', 'sitrusberry', 'wikiberry', 'oranberry', 'berryjuice',
			];
			if (healingItems.includes(item.id)) {
				return this.effectState.checkedBerserk;
			}
			return true;
		},
		onAfterMoveSecondary(target, source, move) {
			this.effectState.checkedBerserk = true;
			if (!source || source === target || !target.hp || !move.totalDamage) return;
			const lastAttackedBy = target.getLastAttackedBy();
			if (!lastAttackedBy) return;
			const damage = move.multihit && !move.smartTarget ? move.totalDamage : lastAttackedBy.damage;
			if (target.hp <= target.maxhp / 2 && target.hp + damage > target.maxhp / 2) {
				this.boost({ spa: 1 }, target, target);
			}
		},
		flags: {},
		name: "Berserk",
		rating: 2,
		num: 201,
	},
	bigpecks: {
		onTryBoost(boost, target, source, effect) {
			if (source && target === source) return;
			if (boost.def && boost.def < 0 || boost.spd && boost.spd < 0) {
				delete boost.def;
				if (!(effect as ActiveMove).secondaries && effect.id !== 'octolock') {
					this.add("-fail", target, "unboost", "Defense", "[from] ability: Big Pecks", `[of] ${target}`);
				}
			}
		},
		flags: { breakable: 1 },
		name: "Big Pecks",
		rating: 0.5,
		num: 145,
	},
	blaze: {
		onModifyAtkPriority: 5,
		onModifyAtk(atk, attacker, defender, move) {
			if (move && this.movehasType(move, 'Fire') && (attacker.hp <= attacker.maxhp / 3 || this.field.isTerrain(['burningterrain', 'volcanicterrain'])) && !this.field.isTerrain('coldeclipseterrain')) {
				this.debug('Blaze boost');
				return this.chainModify(1.5);
			}
		},
		onModifySpAPriority: 5,
		onModifySpA(atk, attacker, defender, move) {
			if (move && this.movehasType(move, 'Fire') && (attacker.hp <= attacker.maxhp / 3 || this.field.isTerrain(['burningterrain', 'volcanicterrain'])) && !this.field.isTerrain('coldeclipseterrain')) {
				this.debug('Blaze boost');
				return this.chainModify(1.5);
			}
		},
		flags: {},
		name: "Blaze",
		rating: 2,
		num: 66,
	},
	bulletproof: {
		onTryHit(pokemon, target, move) {
			if (move.flags['bullet'] || move.flags['pulse']) {
				this.add('-immune', pokemon, '[from] ability: Bulletproof');
				return null;
			}
		},
		flags: { breakable: 1 },
		name: "Bulletproof",
		rating: 3,
		num: 171,
	},
	cheekpouch: {
		onEatItem(item, pokemon) {
			this.heal(pokemon.baseMaxhp / 3);
		},
		flags: {},
		name: "Cheek Pouch",
		rating: 2,
		num: 167,
	},
	chillingneigh: {
		onSourceAfterFaint(length, target, source, effect) {
			if (effect && effect.effectType === 'Move') {
				this.boost({ atk: length }, source);
			}
		},
		flags: {},
		name: "Chilling Neigh",
		rating: 3,
		num: 264,
	},
	chlorophyll: {
		onModifySpe(spe, pokemon) {
			if (['sunnyday', 'desolateland'].includes(pokemon.effectiveWeather())) {
				return this.chainModify(2);
			}
		},
		flags: {},
		name: "Chlorophyll",
		rating: 3,
		num: 34,
	},
	elevate: {
		onSourceAfterFaint(length, target, source, effect) {
			if (effect && effect.effectType === 'Move') {
				const bestStat = source.getBestStat(true, true);
				this.boost({ [bestStat]: length }, source);
			}
		},
		flags: { breakable: 1 },
		name: "Elevate",
		rating: 3.5,
		num: 10015,
	},
	clearbody: {
		onTryBoost(boost, target, source, effect) {
			if (source && target === source) return;
			let showMsg = false;
			let i: BoostID;
			for (i in boost) {
				if (boost[i]! < 0) {
					delete boost[i];
					showMsg = true;
				}
			}
			if (showMsg && !(effect as ActiveMove).secondaries && effect.id !== 'octolock') {
				this.add("-fail", target, "unboost", "[from] ability: Clear Body", `[of] ${target}`);
			}
		},
		flags: { breakable: 1 },
		name: "Clear Body",
		rating: 2,
		num: 29,
	},
	cloudnine: {
		onSwitchIn(pokemon) {
			this.effectState.switchingIn = true;
		},
		onStart(pokemon) {
			// Cloud Nine does not activate when Skill Swapped or when Neutralizing Gas leaves the field
			if (this.effectState.switchingIn) {
				this.add('-ability', pokemon, 'Cloud Nine');
				this.effectState.switchingIn = false;
			}
			this.eachEvent('WeatherChange', this.effect);
		},
		onResidual(pokemon) {
			if (this.field.isTerrain('rainbowterrain')) {
				const stats: BoostID[] = [];
				const boost: SparseBoostsTable = {};
				let statPlus: BoostID;
				for (statPlus in pokemon.boosts) {
					if (pokemon.boosts[statPlus] < 6 && statPlus !== 'evasion') {
						stats.push(statPlus);
					}
				}
				const randomStat: BoostID | undefined = stats.length ? this.sample(stats) : undefined;
				if (randomStat) boost[randomStat] = 1;
				this.boost(boost);
			}
		},
		onEnd(pokemon) {
			this.eachEvent('WeatherChange', this.effect);
		},
		suppressWeather: true,
		flags: {},
		name: "Cloud Nine",
		rating: 1.5,
		num: 13,
	},
	colorchange: {
		onStart(pokemon) {
			if (this.field.isTerrain('mirrorarenaterrain')) {
				this.boost({ evasion: 1 }, pokemon);
			}
		},
		onAfterMoveSecondary(target, source, move) {
			if (!target.hp) return;
			const type = move.type;
			if (
				target.isActive && move.effectType === 'Move' && move.category !== 'Status' &&
				type !== '???' && !target.hasType(type)
			) {
				if (!target.setType(type)) return false;
				this.add('-start', target, 'typechange', type, '[from] ability: Color Change');

				if (target.side.active.length === 2 && target.position === 1) {
					// Curse Glitch
					const action = this.queue.willMove(target);
					if (action && action.move.id === 'curse') {
						action.targetLoc = -1;
					}
				}
			}
		},
		flags: {},
		name: "Color Change",
		rating: 0,
		num: 16,
	},
	comatose: {
		onStart(pokemon) {
			this.add('-ability', pokemon, 'Comatose');
		},
		onSetStatus(status, target, source, effect) {
			if ((effect as Move)?.status) {
				this.add('-immune', target, '[from] ability: Comatose');
			}
			return false;
		},
		// Permanent sleep "status" implemented in the relevant sleep-checking effects
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, cantsuppress: 1 },
		name: "Comatose",
		rating: 4,
		num: 213,
	},
	conductivity: {
		onTryHit(target, source, move) {
			if (target !== source && move.flags['sound']) {
				this.add('-immune', target, '[from] ability: Conductivity');
				return null;
			}
		},
		onAllyTryHitSide(target, source, move) {
			if (move.flags['sound']) {
				this.add('-immune', this.effectState.target, '[from] ability: Conductivity');
			}
		},
		onEffectiveness(typeMod, target, type, move) {
			if (move.type === 'Electric' && type === 'Steel') return 1;
		},
		flags: { breakable: 1 },
		name: "Conductivity",
		rating: 3.5,
		num: 10067,
	},
	commander: {
		onAnySwitchInPriority: -2,
		onAnySwitchIn() {
			((this.effect as any).onUpdate as (p: Pokemon) => void).call(this, this.effectState.target);
		},
		onStart(pokemon) {
			((this.effect as any).onUpdate as (p: Pokemon) => void).call(this, pokemon);
		},
		onUpdate(pokemon) {
			if (this.gameType !== 'doubles') return;
			// don't run between when a Pokemon switches in and the resulting onSwitchIn event
			if (this.queue.peek()?.choice === 'runSwitch') return;

			const ally = pokemon.allies()[0];
			if (pokemon.switchFlag || ally?.switchFlag) return;
			if (!ally || pokemon.baseSpecies.baseSpecies !== 'Tatsugiri' || ally.baseSpecies.baseSpecies !== 'Dondozo') {
				// Handle any edge cases
				if (pokemon.getVolatile('commanding')) pokemon.removeVolatile('commanding');
				return;
			}

			if (!pokemon.getVolatile('commanding')) {
				// If Dondozo already was commanded this fails
				if (ally.getVolatile('commanded')) return;
				// Cancel all actions this turn for pokemon if applicable
				this.queue.cancelAction(pokemon);
				// Add volatiles to both pokemon
				this.add('-activate', pokemon, 'ability: Commander', `[of] ${ally}`);
				pokemon.addVolatile('commanding');
				ally.addVolatile('commanded', pokemon);
				// Continued in conditions.ts in the volatiles
			} else {
				if (!ally.fainted) return;
				pokemon.removeVolatile('commanding');
			}
		},
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1 },
		name: "Commander",
		rating: 0,
		num: 279,
	},
	competitive: {
		onAfterEachBoost(boost, target, source, effect) {
			if (target.isAlly(source) || this.field.isTerrain('chessboardterrain')) {
				return;
			}
			let statsLowered = false;
			let i: BoostID;
			for (i in boost) {
				if (boost[i]! < 0) {
					statsLowered = true;
				}
			}
			if (statsLowered) {
				this.boost({ spa: 2 }, target, target, null, false, true);
			}
		},
		onBasePower(basePower, source) {
			if (this.field.isTerrain('chessboardterrain')) {
				return this.chainModify(Math.max(1, Math.min((1 - source.hp / source.baseMaxhp) / 0.8 + 1, 2)));
			}
		},
		flags: {},
		name: "Competitive",
		rating: 2.5,
		num: 172,
	},
	compoundeyes: {
		onStart(pokemon) {
			if (this.field.isTerrain('mirrorarenaterrain')) {
				this.boost({ accuracy: 1 }, pokemon);
				pokemon.addVolatile('laserfocus');
			}
		},
		onSourceModifyAccuracyPriority: -1,
		onSourceModifyAccuracy(accuracy) {
			if (typeof accuracy !== 'number') return;
			this.debug('compoundeyes - enhancing accuracy');
			return this.chainModify([5325, 4096]);
		},
		flags: {},
		name: "Compound Eyes",
		rating: 3,
		num: 14,
	},
	contrary: {
		onChangeBoost(boost, target, source, effect) {
			if (effect && effect.id === 'zpower') return;
			let i: BoostID;
			for (i in boost) {
				boost[i]! *= -1;
			}
		},
		flags: { breakable: 1 },
		name: "Contrary",
		rating: 4.5,
		num: 126,
	},
	queensguard: {
		onStart(pokemon) { return this.dex.abilities.get('intimidate').onStart?.call(this, pokemon); },
		onChangeBoost(boost, target, source, effect) { return this.dex.abilities.get('contrary').onChangeBoost?.call(this, boost, target, source, effect); },
		onResidual(pokemon) { return this.dex.abilities.get('shedskin').onResidual?.call(this, pokemon); },
		flags: { breakable: 1 },
		name: "Queen's Guard",
		rating: 4.5,
		num: 10120,
	},
	corrosion: {
		// Implemented in sim/pokemon.js:Pokemon#setStatus
		flags: {},
		name: "Corrosion",
		onModifyMove(move) {
			if (this.field.isTerrain('wastelandterrain')) {
				move.secondaries = [
					{
						chance: 2.5,
						status: 'frz',
					},
					{
						chance: 2.5,
						status: 'brn',
					},
					{
						chance: 2.5,
						status: 'par',
					},
					{
						chance: 2.5,
						status: 'psn',
					},
				];
			}
		},
		onNegateImmunity(pokemon, type) {
			if (pokemon.hasType('Steel') && type === 'Poison') return false;
		},
		onDamage() {
			if (this.field.isTerrain('corrosivemistterrain') || this.field.isTerrain('corrosiveterrain'))
				this.chainModify(1.5);
		},
		onFoeAfterSetStatus(status, target) {
			if (status.id === 'tox' || status.id === 'psn') {
				this.boost({ def: -1, spd: -1 }, target);
			}
		},
		rating: 2.5,
		num: 212,
	},
	costar: {
		onSwitchInPriority: -2,
		onStart(pokemon) {
			const ally = pokemon.allies()[0];
			if (this.field.isTerrain('ashenbeachterrain')) {
				ally.addVolatile('helpinghand');
				pokemon.addVolatile('helpinghand');
			}
			if (!ally) return;

			let i: BoostID;
			for (i in ally.boosts) {
				pokemon.boosts[i] = ally.boosts[i];
			}
			const volatilesToCopy = ['dragoncheer', 'focusenergy', 'gmaxchistrike', 'laserfocus'];
			// we need to be sure to remove all the overlapping crit volatiles before trying to add any
			for (const volatile of volatilesToCopy) pokemon.removeVolatile(volatile);
			for (const volatile of volatilesToCopy) {
				if (ally.volatiles[volatile]) {
					pokemon.addVolatile(volatile);
					if (volatile === 'gmaxchistrike') pokemon.volatiles[volatile].layers = ally.volatiles[volatile].layers;
					if (volatile === 'dragoncheer') pokemon.volatiles[volatile].hasDragonType = ally.volatiles[volatile].hasDragonType;
				}
			}
			this.add('-copyboost', pokemon, ally, '[from] ability: Costar');
		},
		flags: {},
		name: "Costar",
		rating: 0,
		num: 294,
	},
	cottondown: {
		onDamagingHit(damage, target, source, move) {
			let activated = false;
			for (const pokemon of this.getAllActive()) {
				if (pokemon === target || pokemon.fainted) continue;
				if (!activated) {
					this.add('-ability', target, 'Cotton Down');
					activated = true;
				}
				if (this.field.isTerrain('bewitchedwoodsterrain') || this.field.isTerrain('grassyterrain')) {
					this.boost({ spe: -2 }, pokemon, target, null, true);
				} else {
					this.boost({ spe: -1 }, pokemon, target, null, true);
				}
			}
		},
		flags: {},
		name: "Cotton Down",
		rating: 2,
		num: 238,
	},
	crumblingshell: {
		onDamagingHit(damage, target, source, move) {
			const side = source.isAlly(target) ? source.side.foe : source.side;
			const stealthRocks = side.sideConditions['stealthrock'];
			if (move.category === 'Physical' && !stealthRocks) {
				this.add('-activate', target, 'ability: Crumbling Shell');
				side.addSideCondition('stealthrock', target);
			}
		},
		flags: {},
		name: "Crumbling Shell",
		rating: 2,
		num: 10005,
	},
	cudchew: {
		onEatItem(item, pokemon, source, effect) {
			if (item.isBerry && (!effect || !['bugbite', 'pluck'].includes(effect.id))) {
				this.effectState.berry = item;
				this.effectState.counter = 2;
				// This is needed in case the berry was eaten during residuals, preventing the timer from decreasing this turn
				if (!this.queue.peek()) this.effectState.counter--;
			}
		},
		onResidualOrder: 28,
		onResidualSubOrder: 2,
		onResidual(pokemon) {
			if (!this.effectState.berry || !pokemon.hp) return;
			if (--this.effectState.counter <= 0) {
				const item = this.effectState.berry;
				this.add('-activate', pokemon, 'ability: Cud Chew');
				this.add('-enditem', pokemon, item.name, '[eat]');
				if (this.singleEvent('Eat', item, null, pokemon, null, null)) {
					this.runEvent('EatItem', pokemon, null, null, item);
				}
				if (item.onEat) pokemon.ateBerry = true;
				delete this.effectState.berry;
				delete this.effectState.counter;
			}
		},
		flags: {},
		name: "Cud Chew",
		rating: 2,
		num: 291,
	},
	curiousmedicine: {
		onStart(pokemon) {
			for (const ally of pokemon.adjacentAllies()) {
				ally.clearBoosts();
				this.add('-clearboost', ally, '[from] ability: Curious Medicine', `[of] ${pokemon}`);
			}
		},
		flags: {},
		name: "Curious Medicine",
		rating: 0,
		num: 261,
	},
	cursedbody: {
		onDamagingHit(damage, target, source, move) {
			if (source.volatiles['disable'] || this.field.isTerrain('holyterrain')) return;
			if (!move.isMax && !move.flags['futuremove'] && move.id !== 'struggle' && !this.field.isTerrain('holyterrain')) {
				if (this.randomChance(3, 10) || this.field.isTerrain('hauntedterrain')) {
					source.addVolatile('disable', this.effectState.target);
				}
			}
		},
		onFaint(pokemon) {
			for (const foe of pokemon.foes()) {
				if (!foe.fainted) foe.addVolatile('curse', pokemon, this.dex.abilities.get('cursedbody'));
			}
		},
		flags: {},
		name: "Cursed Body",
		rating: 2,
		num: 130,
	},
	cutecharm: {
		onDamagingHit(damage, target, source, move) {
			if (this.checkMoveMakesContact(move, source, target)) {
				if (this.randomChance(3, 10)) {
					source.addVolatile('attract', this.effectState.target);
				}
			}
		},
		flags: {},
		name: "Cute Charm",
		rating: 0.5,
		num: 56,
	},
	damp: {
		onAnyTryMove(target, source, effect) {
			const igniteMoves = ['eruption', 'explosion', 'firepledge', 'flameburst', 'heatwave', 'incinerate', 'lavaplume', 'mindblown', 'searingshot', 'selfdestruct', 'infernooverdrive'];

			if (['explosion', 'mindblown', 'mistyexplosion', 'selfdestruct'].includes(effect.id)) {
				this.attrLastMove('[still]');
				this.add('cant', this.effectState.target, 'ability: Damp', effect, `[of] ${target}`);
				return false;
			}
			if (this.field.isTerrain('corrosivemistterrain')) {
				if (igniteMoves.includes(effect.id)) {
					this.add('-message', `${source.name}'s Damp stifled the move!`);
					return false;
				}
			}
		},
		onSourceModifyAtkPriority: 6,
		onSourceModifyAtk(atk, attacker, defender, move) {
			if (move && this.movehasType(move, 'Fire')) {
				this.debug('Magma Armor weaken');
				return this.chainModify(0.5);
			}
		},
		onSourceModifySpAPriority: 5,
		onSourceModifySpA(atk, attacker, defender, move) {
			if (move && this.movehasType(move, 'Fire')) {
				this.debug('Magma Armor weaken');
				return this.chainModify(0.5);
			}
		},
		onAnyDamage(damage, target, source, effect) {
			if (effect && effect.name === 'Aftermath') {
				return false;
			}
		},
		flags: { breakable: 1 },
		name: "Damp",
		rating: 0.5,
		num: 6,
	},
	dancer: {
		flags: {},
		name: "Dancer",
		// implemented in runMove in scripts.js
		onAfterBoost(boost, target, source, effect) {
			if (effect?.sourceEffect !== 'dancer' || !this.field.isTerrain('bigtopterrain')) return;
			let i: BoostID;
			for (i in boost) {
				if (boost[i]! > 0) {
					return;
				}
			}
			this.boost({ spa: 1, atk: 1 }, source, source, null, false, true);
		},
		onAfterMove(source, target, move) {
			if (move.flags.dance && source.hasAbility('dancer') && move.sourceEffect !== 'dancer') {
				this.boost({ spa: 1, spe: 1 }, source, source, null, false, true);
			}
		},
		rating: 1.5,
		num: 216,
	},
	darkaura: {
		onStart(pokemon) {
			if (this.suppressingAbility(pokemon)) return;
			this.add('-ability', pokemon, 'Dark Aura');
		},
		onAnyBasePowerPriority: 20,
		onAnyBasePower(basePower, source, target, move) {
			if (target === source || move.category === 'Status' || !this.movehasType(move, 'Dark')) return;
			if (!move.auraBooster?.hasAbility('Dark Aura')) move.auraBooster = this.effectState.target;
			if (move.auraBooster !== this.effectState.target) return;
			return this.chainModify([move.hasAuraBreak ? 3072 : 5448, 4096]);
		},
		onImmunity(type, pokemon) {
			if (type === 'hail' && this.field.isTerrain('coldeclipseterrain')) return false;
		},
		flags: {},
		name: "Dark Aura",
		rating: 3,
		num: 186,
	},
	dauntlessshield: {
		onStart(pokemon) {
			this.boost({ def: 1 }, pokemon);
			if (this.field.isTerrain('fairytaleterrain')) {
				this.boost({ spd: 1, def: 1 }, pokemon);
			}
		},
		flags: {},
		name: "Dauntless Shield",
		rating: 3.5,
		num: 235,
	},
	dazzling: {
		onFoeTryMove(target, source, move) {
			const targetAllExceptions = ['perishsong', 'flowershield', 'rototiller'];
			if (move.target === 'foeSide' || (move.target === 'all' && !targetAllExceptions.includes(move.id))) {
				return;
			}

			const dazzlingHolder = this.effectState.target;
			if ((source.isAlly(dazzlingHolder) || move.target === 'all') && move.priority > 0.1) {
				this.attrLastMove('[still]');
				this.add('cant', dazzlingHolder, 'ability: Dazzling', move, `[of] ${target}`);
				return false;
			}
		},
		flags: { breakable: 1 },
		name: "Dazzling",
		rating: 2.5,
		num: 219,
	},
	defeatist: {
		onStart(pokemon) {
			this.dex.abilities.get('relicarmor').onStart?.call(this, pokemon);
		},
		onModifyAtkPriority: 5,
		onModifyAtk(atk, pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 4) {
				return this.chainModify(0.5);
			}
		},
		onModifySpAPriority: 5,
		onModifySpA(atk, pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 4) {
				return this.chainModify(0.5);
			}
		},
		flags: {},
		name: "Defeatist",
		rating: -1,
		num: 129,
	},
	relicinstinct: {
		onModifyMove(move, pokemon) {
			if (pokemon.hp > pokemon.maxhp / 2) move.ignoreAbility = true;
		},
		onSourceModifyDamage(damage, source, target, move) {
			if (target.hp <= target.maxhp / 2 && move.category !== 'Status') return this.chainModify(0.75);
		},
		onCriticalHit(target) {
			if (target.hp <= target.maxhp / 2) return false;
		},
		onResidual(pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 2) this.heal(pokemon.baseMaxhp / 16, pokemon, pokemon);
		},
		onModifyAtkPriority: 5,
		onModifyAtk(atk, pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 2) return this.chainModify(0.5);
		},
		onModifySpAPriority: 5,
		onModifySpA(spa, pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 2) return this.chainModify(0.5);
		},
		onUpdate(pokemon) {
			if (pokemon.hp > pokemon.maxhp / 4 || pokemon.abilityState.relicInstinctPinch) return;
			pokemon.abilityState.relicInstinctPinch = true;
			this.add('-ability', pokemon, 'Relic Instinct');
			this.heal(pokemon.baseMaxhp / 4, pokemon, pokemon);
			let cleared = false;
			const boosts: SparseBoostsTable = {};
			let stat: BoostID;
			for (stat in pokemon.boosts) {
				if (pokemon.boosts[stat] < 0) {
					boosts[stat] = 0;
					cleared = true;
				}
			}
			if (cleared) {
				pokemon.setBoost(boosts);
				this.add('-clearnegativeboost', pokemon, '[from] ability: Relic Instinct');
			}
			this.boost({ def: -2, spd: -2 }, pokemon, pokemon, this.dex.abilities.get('relicinstinct'));
		},
		flags: { breakable: 1 },
		name: "Relic Instinct",
		rating: 3.5,
		num: 10064,
	},
	fossilfrenzy: {
		onSwitchInPriority: 1,
		onStart(pokemon) {
			this.singleEvent('End', pokemon.getItem(), pokemon.itemState, pokemon);
		},
		onTryMove(source, target, move) {
			const chessMoves = ["ancientpower", "barrage", "continentalcrush", "psychic", "rockthrow", "secretpower", "shatteredpsyche", "strength"];
			if (this.field.isTerrain('chessboardterrain') && chessMoves.includes(move.id)) {
				this.add('-message', 'It was too much a klutz to move the pieces!');
				return false;
			}
		},
		onDamagingHit(damage, target, source, move) {
			if (!source || source === target) return;
			this.boost({ atk: 1, spe: 1 }, target, target);
			target.addVolatile('confusion', target, this.dex.abilities.get('fossilfrenzy'));
		},
		onDamage(damage, target, source, effect) {
			if (effect?.id === 'confused') {
				this.damage(target.baseMaxhp / 8, target, target, this.dex.abilities.get('fossilfrenzy'));
			}
			if (source && source !== target && target.volatiles['confusion'] && effect?.effectType === 'Move') return this.chainModify(1.25);
		},
		flags: { breakable: 1 },
		name: "Fossil Frenzy",
		rating: 3.5,
		num: 10065,
	},
	defiant: {
		onAfterEachBoost(boost, target, source, effect) {
			if (!source || target.isAlly(source)) {
				return;
			}
			let statsLowered = false;
			let i: BoostID;
			for (i in boost) {
				if (boost[i]! < 0) {
					statsLowered = true;
				}
			}
			if (statsLowered) {
				this.boost({ atk: 2 }, target, target, null, false, true);
			}
		},
		flags: {},
		name: "Defiant",
		rating: 3,
		num: 128,
	},
	deltastream: {
		onStart(source) {
			this.field.setWeather('deltastream');
		},
		onAnySetWeather(target, source, weather) {
			const strongWeathers = ['desolateland', 'primordialsea', 'deltastream'];
			if (this.field.getWeather().id === 'deltastream' && !strongWeathers.includes(weather.id)) return false;
		},
		onEnd(pokemon) {
			if (this.field.weatherState.source !== pokemon) return;
			for (const target of this.getAllActive()) {
				if (target === pokemon) continue;
				if (target.hasAbility('deltastream')) {
					this.field.weatherState.source = target;
					return;
				}
			}
			this.field.clearWeather();
		},
		flags: {},
		name: "Delta Stream",
		rating: 4,
		num: 191,
	},
	desolateland: {
		onStart(source) {
			this.field.setWeather('desolateland');
		},
		onAnySetWeather(target, source, weather) {
			const strongWeathers = ['desolateland', 'primordialsea', 'deltastream'];
			if (this.field.getWeather().id === 'desolateland' && !strongWeathers.includes(weather.id)) return false;
		},
		onEnd(pokemon) {
			if (this.field.weatherState.source !== pokemon) return;
			for (const target of this.getAllActive()) {
				if (target === pokemon) continue;
				if (target.hasAbility('desolateland')) {
					this.field.weatherState.source = target;
					return;
				}
			}
			this.field.clearWeather();
		},
		flags: {},
		name: "Desolate Land",
		rating: 4.5,
		num: 190,
	},
	disguise: {
		onDamagePriority: 1,
		onDamage(damage, target, source, effect) {
			if (effect?.effectType === 'Move' && ['mimikyu', 'mimikyutotem'].includes(target.species.id)) {
				this.add('-activate', target, 'ability: Disguise');
				this.effectState.busted = true;
				if (source && source !== target && !source.isAlly(target)) {
					source.addVolatile('curse', target, this.dex.abilities.get('disguise'));
				}
				return 0;
			}
		},
		onCriticalHit(target, source, move) {
			const relicArmorResult = this.dex.abilities.get('relicarmor').onCriticalHit?.call(this, target, source, move);
			if (relicArmorResult !== undefined) return relicArmorResult;
			if (!target) return;
			if (!['mimikyu', 'mimikyutotem'].includes(target.species.id)) return;
			const hitSub = target.volatiles['substitute'] && !move.flags['bypasssub'] && !(move.infiltrates && this.gen >= 6);
			if (hitSub) return;
			if (!target.runImmunity(move)) return;
			return false;
		},
		onAfterBoost(boost, target, source, effect) {
			return this.dex.abilities.get('relicarmor').onAfterBoost?.call(this, boost, target, source, effect);
		},
		onSourceModifyDamage(damage, source, target, move) {
			return this.dex.abilities.get('relicarmor').onSourceModifyDamage?.call(this, damage, source, target, move);
		},
		onModifyMove(move) {
			return this.dex.abilities.get('relicarmor').onModifyMove?.call(this, move);
		},
		onDeductPP(target, source) {
			return this.dex.abilities.get('relicarmor').onDeductPP?.call(this, target, source);
		},
		onModifyPriority(priority, pokemon, target, move) {
			if (move?.category === 'Status' && ['mimikyu', 'mimikyutotem'].includes(pokemon.species.id)) {
				return priority + 1;
			}
		},
		onDamagingHit(damage, target, source, move) {
			if (!source || source === target || source.isAlly(target) || move.category === 'Status') return;
			if (['mimikyubusted', 'mimikyubustedtotem'].includes(target.species.id)) {
				source.addVolatile('curse', target, this.dex.abilities.get('disguise'));
			}
		},
		onEffectiveness(typeMod, target, type, move) {
			if (!target || move.category === 'Status') return;
			if (!['mimikyu', 'mimikyutotem'].includes(target.species.id)) {
				return;
			}

			const hitSub = target.volatiles['substitute'] && !move.flags['bypasssub'] && !(move.infiltrates && this.gen >= 6);
			if (hitSub) return;

			if (!target.runImmunity(move)) return;
			return 0;
		},
		onUpdate(pokemon) {
			if (['mimikyu', 'mimikyutotem'].includes(pokemon.species.id) && this.effectState.busted) {
				const speciesid = pokemon.species.id === 'mimikyutotem' ? 'Mimikyu-Busted-Totem' : 'Mimikyu-Busted';
				pokemon.formeChange(speciesid, this.effect, true);
				this.damage(pokemon.baseMaxhp / 8, pokemon, pokemon, this.dex.species.get(speciesid));
			}
		},
		flags: {
			failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, cantsuppress: 1,
			breakable: 1, notransform: 1,
		},
		name: "Disguise",
		rating: 3.5,
		num: 209,
	},
	download: {
		onStart(pokemon) {
			pokemon.abilityState.downloadFirstHit = true;
			let totaldef = 0;
			let totalspd = 0;
			let boost = 1;
			if (this.field.isTerrain('factoryterrain')) {
				boost = 2;
			}
			if (this.field.isTerrain('glitchterrain')) {
				const mapItemtoAbility = new Map<string, string>([
					['dousedrive', 'waterabsorb'],
					['shockdrive', 'motordrive'],
					['burndrive', 'flashfire'],
					['chilldrive', 'iceabsorb'],
				]);
				if (pokemon.hasItem(['dousedrive', 'chilldrive', 'shockdrive', 'burndrive']) && pokemon.baseSpecies.id === 'genesect') {
					this.boost({ spa: 1, atk: 1 });
					pokemon.setAbility(mapItemtoAbility.get(pokemon.item) ?? pokemon.ability);
				}
				this.boost({ spa: 1, atk: 1 });
				return;
			}
			if (this.field.isTerrain('shortcircuitterrain')) {
				this.boost({ spa: 1, atk: 1 });
				return;
			}
			for (const target of pokemon.foes()) {
				if (!target || target.fainted) continue;
				totaldef += target.getStat('def', false, true);
				totalspd += target.getStat('spd', false, true);
			}
			if (totaldef && totaldef >= totalspd) {
				this.boost({ spa: boost });
			} else if (totalspd) {
				this.boost({ atk: boost });
			}
		},
		onModifyMove(move, pokemon) {
			if (move.category === 'Status' || !pokemon.abilityState.downloadFirstHit) return;
			move.willCrit = true;
			pokemon.abilityState.downloadFirstHit = false;
		},
		flags: {},
		name: "Download",
		rating: 3.5,
		num: 88,
	},
	dragonize: {
		onModifyTypePriority: -1,
		onModifyType(move, pokemon) {
			const noModifyType = [
				'judgment', 'multiattack', 'naturalgift', 'revelationdance', 'technoblast', 'terrainpulse', 'weatherball',
			];
			if (move.type === 'Normal' && (!noModifyType.includes(move.id) || this.activeMove?.isMax) &&
				!(move.isZ && move.category !== 'Status') && !(move.name === 'Tera Blast' && pokemon.terastallized)) {
				move.type = 'Dragon';
				move.typeChangerBoosted = this.effect;
			}
		},
		onBasePowerPriority: 23,
		onBasePower(basePower, pokemon, target, move) {
			let modifier = 1.2;
			if (this.field.isTerrain(['dragonsdenterrain', 'fairytaleterrain'])) modifier = 1.5;
			if (move.typeChangerBoosted === this.effect) return this.chainModify(modifier);
		},
		onModifySTAB(stab, source, target, move) {
			if (move.type === 'Dragon' && !source.hasType('Dragon')) return 1.5;
		},
		flags: {},
		name: "Dragonize",
		rating: 4,
		num: 312,
	},
	draconicforce: {
		onModifyTypePriority: -1,
		onModifyType(move, pokemon) {
			this.dex.abilities.get('dragonize').onModifyType?.call(this, move, pokemon);
		},
		onModifySTAB(stab, source, target, move) {
			return this.dex.abilities.get('dragonize').onModifySTAB?.call(this, stab, source, target, move);
		},
		onBasePower(basePower, attacker, defender, move) {
			let modifier = 1;
			if (move.typeChangerBoosted === this.effect) {
				modifier *= this.field.isTerrain(['dragonsdenterrain', 'fairytaleterrain']) ? 1.5 : 1.2;
			}
			if (move.flags['bite']) modifier *= 1.5;
			if (modifier !== 1) return this.chainModify(modifier);
		},
		onModifyAtkPriority: 5,
		onModifyAtk(atk, pokemon) {
			return this.dex.abilities.get('guts').onModifyAtk?.call(this, atk, pokemon);
		},
		flags: {},
		name: "Draconic Force",
		rating: 4.5,
		num: 10177,
	},
	dragonsmaw: {
		onModifyAtkPriority: 5,
		onModifyAtk(atk, attacker, defender, move) {
			if (move && this.movehasType(move, 'Dragon')) {
				this.debug('Dragon\'s Maw boost');
				if (this.field.isTerrain(['dragonsdenterrain', 'fairytaleterrain'])) return this.chainModify(2);
				return this.chainModify(1.5);
			}
		},
		onModifySpAPriority: 5,
		onModifySpA(atk, attacker, defender, move) {
			if (move && this.movehasType(move, 'Dragon')) {
				this.debug('Dragon\'s Maw boost');
				if (this.field.isTerrain(['dragonsdenterrain', 'fairytaleterrain'])) return this.chainModify(2);
				return this.chainModify(1.5);
			}
		},
		onEffectiveness(typeMod, target, type, move) {
			if (!target || !move || move.category === 'Status') return;
			if (type === 'Fairy' && this.field.isTerrain(['dragonsdenterrain', 'fairytaleterrain'])) return -1;
		},
		flags: {},
		name: "Dragon's Maw",
		rating: 3.5,
		num: 263,
	},
	drizzle: {
		onStart(source) {
			if (source.species.id === 'kyogre' && source.item === 'blueorb') return;
			this.field.setWeather('raindance');
		},
		flags: {},
		name: "Drizzle",
		rating: 4,
		num: 2,
	},
	drought: {
		onStart(source) {
			if (source.species.id === 'groudon' && source.item === 'redorb') return;
			this.field.setWeather('sunnyday');
		},
		flags: {},
		name: "Drought",
		rating: 4,
		num: 70,
	},
	sunsovereign: {
		onStart(source) {
			this.dex.abilities.get('drought').onStart?.call(this, source);
			if (this.field.isWeather(['sunnyday', 'desolateland'])) this.field.weatherState.duration = 8;
			this.dex.abilities.get('wildfirecore').onStart?.call(this, source);
		},
		onImmunity(type, pokemon) { return this.dex.abilities.get('wildfirecore').onImmunity?.call(this, type, pokemon); },
		onUpdate(pokemon) { return this.dex.abilities.get('wildfirecore').onUpdate?.call(this, pokemon); },
		onModifyTypePriority: -1,
		onModifyType(move, pokemon) { return this.dex.abilities.get('wildfirecore').onModifyType?.call(this, move, pokemon); },
		onModifySTAB(stab, source, target, move) { return this.dex.abilities.get('wildfirecore').onModifySTAB?.call(this, stab, source, target, move); },
		onBasePowerPriority: 8,
		onBasePower(basePower, attacker, defender, move) { return this.dex.abilities.get('wildfirecore').onBasePower?.call(this, basePower, attacker, defender, move); },
		onAfterMove(source, target, move) { return this.dex.abilities.get('wildfirecore').onAfterMove?.call(this, source, target, move); },
		onTryHit(target, source, move) { return this.dex.abilities.get('wildfirecore').onTryHit?.call(this, target, source, move); },
		onSourceModifyAtkPriority: 6,
		onSourceModifyAtk(atk, attacker, defender, move) { return this.dex.abilities.get('wildfirecore').onSourceModifyAtk?.call(this, atk, attacker, defender, move); },
		onSourceModifySpAPriority: 5,
		onSourceModifySpA(spa, attacker, defender, move) { return this.dex.abilities.get('wildfirecore').onSourceModifySpA?.call(this, spa, attacker, defender, move); },
		onResidual(pokemon) {
			this.dex.abilities.get('wildfirecore').onResidual?.call(this, pokemon);
			return this.dex.abilities.get('selfsufficient').onResidual?.call(this, pokemon);
		},
		flags: { breakable: 1 },
		name: "Sun Sovereign",
		rating: 4.5,
		num: 10039,
	},
	burningspirit: {
		onResidual(pokemon) { this.dex.abilities.get('selfsufficient').onResidual?.call(this, pokemon); },
		onAfterEachBoost(boost, target, source, effect) { return this.dex.abilities.get('opportunist').onAfterEachBoost?.call(this, boost, target, source, effect); },
		onStart(pokemon) { return this.dex.abilities.get('magmaarmor').onStart?.call(this, pokemon); },
		onUpdate(pokemon) { return this.dex.abilities.get('magmaarmor').onUpdate?.call(this, pokemon); },
		onTryHit(target, source, move) { return this.dex.abilities.get('magmaarmor').onTryHit?.call(this, target, source, move); },
		onImmunity(type, pokemon) { return this.dex.abilities.get('magmaarmor').onImmunity?.call(this, type, pokemon); },
		onSourceModifyAtkPriority: 6,
		onSourceModifyAtk(atk, attacker, defender, move) { return this.dex.abilities.get('magmaarmor').onSourceModifyAtk?.call(this, atk, attacker, defender, move); },
		onSourceModifySpAPriority: 5,
		onSourceModifySpA(spa, attacker, defender, move) { return this.dex.abilities.get('magmaarmor').onSourceModifySpA?.call(this, spa, attacker, defender, move); },
		flags: { breakable: 1 },
		name: "Burning Spirit",
		rating: 4,
		num: 10040,
	},
	emperorsresolve: {
		onAfterEachBoost(boost, target, source, effect) { return this.dex.abilities.get('competitive').onAfterEachBoost?.call(this, boost, target, source, effect); },
		onModifyMove(move) {
			if (this.movehasType(move, 'Ice')) move.forceSTAB = true;
		},
		onModifySpe(spe, pokemon) { return this.dex.abilities.get('slushrush').onModifySpe?.call(this, spe, pokemon); },
		flags: { breakable: 1 },
		name: "Emperor's Resolve",
		rating: 4,
		num: 10041,
	},
	terraresolve: {
		onDamagingHit(damage, target, source, move) { return this.dex.abilities.get('stamina').onDamagingHit?.call(this, damage, target, source, move); },
		onModifyMove(move) { this.dex.abilities.get('rockypayload').onModifyMove?.call(this, move); },
		onModifyAtk(atk, attacker, defender, move) { return this.dex.abilities.get('rockypayload').onModifyAtk?.call(this, atk, attacker, defender, move); },
		onModifySpA(spa, attacker, defender, move) { return this.dex.abilities.get('rockypayload').onModifySpA?.call(this, spa, attacker, defender, move); },
		onResidual(pokemon) { return this.dex.abilities.get('selfsufficient').onResidual?.call(this, pokemon); },
		flags: { breakable: 1 },
		name: "Terra Resolve",
		rating: 3.5,
		num: 10042,
	},
	eclipsevision: {
		onModifySpAPriority: 5,
		onModifySpA(spa) {
			return this.chainModify(1.5);
		},
		onBeforeMove(pokemon, target, move) {
			if (!move || move.category === 'Status') return;
			let newType = '';
			if (this.movehasType(move, 'Psychic')) newType = 'Psychic';
			if (this.movehasType(move, 'Dark')) newType = 'Dark';
			if (newType && !pokemon.hasType(newType) && pokemon.setType(newType)) {
				this.add('-start', pokemon, 'typechange', newType, '[from] ability: Eclipse Vision');
			}
		},
		onSourceDamagingHit(damage, target, source, move) {
			if (source.hasType('Dark')) this.heal(damage / 4, source, source);
		},
		onResidual(pokemon) {
			if (pokemon.hasType('Psychic')) this.heal(pokemon.baseMaxhp / 16, pokemon, pokemon);
		},
		flags: { breakable: 1 },
		name: "Eclipse Vision",
		rating: 4,
		num: 10153,
	},
	venomrush: {
		onBasePowerPriority: 19,
		onBasePower(basePower, attacker, defender, move) {
			if ((attacker.status === 'psn' || attacker.status === 'tox' || this.field.isTerrain('corrosiveterrain') || this.field.isTerrain('murkwatersurfaceterrain') || this.field.isTerrain('wastelandterrain')) && move.category === 'Physical') {
				return this.chainModify(1.5);
			}
		},
		onDamage(damage, target, source, effect) {
			if (effect?.id === 'psn' || effect?.id === 'tox') {
				this.heal(target.baseMaxhp / 8, target, target);
				return false;
			}
		},
		flags: { breakable: 1 },
		name: "Venom Rush",
		rating: 4,
		num: 10154,
	},
	noseformation: {
		onSourceDamagingHit(damage, target, source, move) {
			if (!target || target === source || move.noseFormationActivated) return;
			move.noseFormationActivated = true;
			let foe: Pokemon | undefined = target;
			let bestDamage = 0;
			let bestMove: ActiveMove | null = null;
			for (const type of ['Steel', 'Electric', 'Rock'] as const) {
				const noseMove = this.dex.getActiveMove({
					name: 'Nose Bombardment',
					type,
					category: 'Special',
					basePower: 20,
					accuracy: true,
					flags: {},
				});
				const noseDamage = this.actions.getDamage(source, foe, noseMove);
				if (typeof noseDamage === 'number' && noseDamage > bestDamage) {
					bestDamage = noseDamage;
					bestMove = noseMove;
				}
			}
			if (!bestMove || !bestDamage) return;
			for (let i = 0; i < 3; i++) {
				if (!foe || foe.fainted || !foe.hp || foe.isProtected() || foe.isSemiInvulnerable()) {
					foe = source.foes().find(candidate =>
						candidate && !candidate.fainted && candidate.hp &&
						!candidate.isProtected() && !candidate.isSemiInvulnerable()
					);
					if (!foe) break;
				}
				this.add('-activate', source, 'ability: Nose Formation');
				const noseDamage = this.actions.getDamage(source, foe, bestMove);
				if (typeof noseDamage === 'number' && noseDamage > 0) {
					this.damage(noseDamage, foe, source, bestMove);
				}
			}
		},
		onSourceModifyDamage(damage, source, target, move) {
			return this.dex.abilities.get('filter').onSourceModifyDamage?.call(this, damage, source, target, move);
		},
		onSourceAfterFaint(length, target, source, effect) {
			return this.dex.abilities.get('elevate').onSourceAfterFaint?.call(this, length, target, source, effect);
		},
		flags: { breakable: 1 },
		name: "Nose Formation",
		rating: 4,
		num: 10156,
	},
	mourningvessel: {
		onDamage(damage, target, source, effect) {
			return this.dex.abilities.get('magicguard').onDamage?.call(this, damage, target, source, effect);
		},
		onStart(pokemon) {
			let fallen = pokemon.side.totalFainted;
			if (pokemon.side.allySide) fallen += pokemon.side.allySide.totalFainted;
			if (fallen) this.add('-activate', pokemon, 'ability: Mourning Vessel');
		},
		onBasePowerPriority: 21,
		onBasePower(basePower, attacker, defender, move) {
			let fallen = attacker.side.totalFainted;
			if (attacker.side.allySide) fallen += attacker.side.allySide.totalFainted;
			if (fallen) return this.chainModify(Math.min(2, 1 + 0.2 * fallen));
		},
		onModifyPriority(priority, pokemon, target, move) {
			if (move?.category === 'Status') return priority + 1;
		},
		onResidual(pokemon) {
			let fallenFoes = 0;
			for (const side of this.sides) {
				if (side === pokemon.side || side === pokemon.side.allySide) continue;
				fallenFoes += side.totalFainted;
			}
			if (fallenFoes) this.heal(pokemon.baseMaxhp * fallenFoes * 0.05, pokemon, pokemon);
		},
		flags: { breakable: 1 },
		name: "Mourning Vessel",
		rating: 4,
		num: 10157,
	},
	fallenstar: {
		onModifyMove(move, pokemon) {
			const arrowMoves = ['spiritshackle', 'thousandarrows', 'triplearrows', 'snipeshot', 'razorleaf', 'magicalleaf', 'spikecannon', 'pinmissile', 'iciclespear', 'rockblast', 'bulletseed', 'scaleshot', 'psychocut', 'ceaselessedge'];
			this.dex.abilities.get('moldbreaker').onModifyMove?.call(this, move, pokemon);
			this.dex.abilities.get('dualwield').onModifyMove?.call(this, move, pokemon);
			if (!arrowMoves.includes(move.id)) return;
			this.dex.abilities.get('skilllink').onModifyMove?.call(this, move, pokemon);
			move.tracksTarget = true;
			move.ignoreAbility = true;
			if (this.gameType === 'freeforall') move.target = 'allAdjacentFoes';
		},
		onBasePowerPriority: 8,
		onBasePower(basePower, source, target, move) {
			const arrowMoves = ['spiritshackle', 'thousandarrows', 'triplearrows', 'snipeshot', 'razorleaf', 'magicalleaf', 'spikecannon', 'pinmissile', 'iciclespear', 'rockblast', 'bulletseed', 'scaleshot', 'psychocut', 'ceaselessedge'];
			let modifier = getDualWieldModifier(move);
			if (!arrowMoves.includes(move.id)) {
				if (modifier !== 1) return this.chainModify(modifier);
				return;
			}
			if ((move as any).fallenStarFollowUp) modifier *= 0.5;
			if (move.multihit) modifier *= 1.5;
			if (target.trapped || target.maybeTrapped || target.volatiles['trapped']) modifier *= 1.5;
			return this.chainModify(modifier);
		},
		onModifyPriority(priority, pokemon, target, move) {
			const arrowMoves = ['spiritshackle', 'thousandarrows', 'triplearrows', 'snipeshot', 'razorleaf', 'magicalleaf', 'spikecannon', 'pinmissile', 'iciclespear', 'rockblast', 'bulletseed', 'scaleshot', 'psychocut', 'ceaselessedge'];
			if (arrowMoves.includes(move.id) && pokemon.hp <= pokemon.maxhp / 2) return priority + 1;
		},
		onSourceAfterMoveSecondarySelf(source, target, move) {
			const arrowMoves = ['spiritshackle', 'thousandarrows', 'triplearrows', 'snipeshot', 'razorleaf', 'magicalleaf', 'spikecannon', 'pinmissile', 'iciclespear', 'rockblast', 'bulletseed', 'scaleshot', 'psychocut', 'ceaselessedge'];
			if (arrowMoves.includes(move.id)) source.abilityState.fallenStarGuardTurn = this.turn;
		},
		onSourceModifyDamage(damage, source, target, move) {
			if (target.abilityState.fallenStarGuardTurn === this.turn) return this.chainModify(0.25);
			if (target.hp <= target.maxhp / 2) return this.chainModify(0.5);
		},
		onSourceAfterFaint(length, target, source, effect) {
			const arrowMoves = ['spiritshackle', 'thousandarrows', 'triplearrows', 'snipeshot', 'razorleaf', 'magicalleaf', 'spikecannon', 'pinmissile', 'iciclespear', 'rockblast', 'bulletseed', 'scaleshot', 'psychocut', 'ceaselessedge'];
			if (!effect || effect.effectType !== 'Move' || !arrowMoves.includes(effect.id)) return;
			if ((effect as any).fallenStarFollowUp) return;
			const followTarget = source.foes().find(foe => foe && !foe.fainted);
			if (!followTarget) return;
			const newMove = this.dex.getActiveMove(effect.id);
			(newMove as any).fallenStarFollowUp = true;
			this.add('-activate', source, 'ability: Fallen Star');
			this.actions.useMove(newMove, source, { target: followTarget, sourceEffect: this.dex.abilities.get('fallenstar') });
		},
		onImmunity(type, pokemon) {
			return this.dex.abilities.get('selfsufficient').onImmunity?.call(this, type, pokemon);
		},
		onResidual(pokemon) {
			return this.dex.abilities.get('selfsufficient').onResidual?.call(this, pokemon);
		},
		flags: { breakable: 1, cantsuppress: 1 },
		name: "Fallen Star",
		rating: 3.5,
		num: 10043,
	},
	eclipse: {
		onBasePowerPriority: 8,
		onBasePower(basePower, source, target, move) {
			if (source.effectiveWeather()) return this.chainModify(1.5);
		},
		onSourceModifyDamage(damage, source, target, move) {
			if (!target.effectiveWeather() && move.category !== 'Status') return this.chainModify(0.5);
		},
		onTryHit(target, source, move) {
			if (target !== source && this.movehasType(move, ['Psychic', 'Dark'])) {
				if (!this.heal(target.baseMaxhp / 4, target, target)) {
					this.add('-immune', target, '[from] ability: Eclipse');
				}
				return null;
			}
		},
		onModifyMove(move, source, target) {
			if (!this.movehasType(move, ['Psychic', 'Dark'])) return;
			if (!target) return;
			const original = target.runImmunity(move) ? target.runEffectiveness(move) : -99;
			const alternateType = this.movehasType(move, 'Psychic') ? 'Dark' : 'Psychic';
			const alternateMove = this.dex.getActiveMove(move.id);
			alternateMove.type = alternateType;
			alternateMove.types = move.types?.map(type => type === move.type ? alternateType : type);
			const alternate = target.runImmunity(alternateMove) ? target.runEffectiveness(alternateMove) : -99;
			if (alternate > original) {
				move.type = alternateType;
				if (move.types) move.types = move.types.map(type => type === (alternateType === 'Dark' ? 'Psychic' : 'Dark') ? alternateType : type);
			}
		},
		flags: { breakable: 1 },
		name: "Eclipse",
		rating: 4,
		num: 10120,
	},
	ragingstorm: {
		onModifyMove(move) {
			move.ignoreAbility = true;
			move.infiltrates = true;
			move.ignoreDefensive = true;
		},
		onSourceTryPrimaryHit(target, source, move) {
			if (target === source || move.category === 'Status') return;
			const boosts: SparseBoostsTable = {};
			let changed = false;
			let stat: BoostID;
			for (stat in target.boosts) {
				if (target.boosts[stat] > 0) {
					boosts[stat] = 0;
					changed = true;
				}
			}
			if (changed) {
				target.setBoost(boosts);
				this.add('-clearboost', target, '[from] ability: Raging Storm', `[of] ${source}`);
			}
		},
		onModifyCritRatio(critRatio) {
			return critRatio + 1;
		},
		onSourceDamagingHit(damage, target, source, move) {
			source.abilityState.ragingStormDamage = damage;
			source.abilityState.ragingStormTarget = target;
		},
		onSourceAfterFaint(length, target, source, effect) {
			if (effect?.effectType !== 'Move') return;
			const targets = source.foes().filter(foe => foe && !foe.fainted && foe !== target);
			if (!targets.length) {
				this.boost({ atk: 1 }, source, source);
				return;
			}
			const damage = Math.max(1, Math.floor((source.abilityState.ragingStormDamage || target.baseMaxhp) * 0.6));
			let dealtDamage = false;
			for (const foe of targets) {
				if (foe.hasAbility('magicguard')) continue;
				if (this.damage(damage, foe, source, this.dex.abilities.get('ragingstorm'))) dealtDamage = true;
			}
			if (!dealtDamage) this.boost({ atk: 1 }, source, source);
		},
		onSourceModifyDamage(damage, source, target, move) {
			if (move.priority > 0) return this.chainModify(0.5);
		},
		onImmunity(type, pokemon) {
			if (type === 'hail') return false;
		},
		flags: { cantsuppress: 1 },
		name: "Raging Storm",
		rating: 4.5,
		num: 10121,
	},
	voltagevolley: {
		onModifyMove(move) {
			if (!move.multihit) return;
			move.category = 'Special';
			move.overrideOffensiveStat = 'spa';
		},
		flags: {},
		name: "Voltage Volley",
		rating: 3.5,
		num: 10178,
	},
	vanguard: {
		onStart(pokemon) {
			pokemon.abilityState.vanguardCrit = false;
			this.dex.abilities.get('intimidate').onStart?.call(this, pokemon);
		},
		onPrepareHit(source, target, move) {
			if (move.id !== 'extremespeed') return;
			const normal = target.runEffectiveness(move);
			const fireMove = this.dex.getActiveMove(move.id);
			fireMove.type = 'Fire';
			const fire = target.runEffectiveness(fireMove);
			if (fire > normal) move.type = 'Fire';
		},
		onModifyMove(move, pokemon) {
			if (move.id !== 'extremespeed') return;
			move.critRatio = (move.critRatio || 1) + 2;
			pokemon.abilityState.vanguardGuard = this.turn;
			if (pokemon.abilityState.vanguardCrit) {
				move.willCrit = true;
				pokemon.abilityState.vanguardCrit = false;
			}
		},
		onBasePowerPriority: 8,
		onBasePower(basePower, source, target, move) {
			if (move.id === 'extremespeed') return this.chainModify(1.5);
		},
		onSourceModifyDamage(damage, source, target, move) {
			if (target.abilityState.vanguardGuard === this.turn && move.category !== 'Status') return this.chainModify(0.25);
		},
		onDamage(damage, target, source, effect) {
			if (effect.effectType !== 'Move') return false;
			if ((target as any).vanguardEndureUsed || damage < target.hp) return;
			(target as any).vanguardEndureUsed = true;
			target.abilityState.vanguardCrit = true;
			return target.hp - 1;
		},
		onTryBoost(boost, target, source, effect) {
			if (source && target === source) return;
			let showMsg = false;
			let i: BoostID;
			for (i in boost) {
				if (boost[i]! < 0) {
					delete boost[i];
					showMsg = true;
				}
			}
			if (showMsg && !(effect as ActiveMove).secondaries && effect.id !== 'octolock') {
				this.add("-fail", target, "unboost", "[from] ability: Vanguard", `[of] ${target}`);
			}
		},
		flags: { breakable: 1 },
		name: "Vanguard",
		rating: 4.5,
		num: 10122,
	},
	apexcleave: {
		onModifyMove(move, source) { this.dex.abilities.get('sharpness').onModifyMove?.call(this, move, source); this.dex.abilities.get('dualwield').onModifyMove?.call(this, move, source); },
		onBasePower(basePower, source, target, move) {
			const sharpnessBoost = move.flags['slicing'] && !this.field.isTerrain('coldeclipseterrain') ? 1.5 : 1;
			const modifier = getDualWieldModifier(move, sharpnessBoost);
			if (modifier !== 1) return this.chainModify(modifier);
		},
		onSourceAfterFaint(length, target, source, effect) { return this.dex.abilities.get('moxie').onSourceAfterFaint?.call(this, length, target, source, effect); },
		flags: {},
		name: "Apex Cleave",
		rating: 5,
		num: 10129,
	},
	aurainstinct: {
		onModifySTAB(stab, source, target, move) {
			return this.dex.abilities.get('adaptability').onModifySTAB?.call(this, stab, source, target, move);
		},
		onModifyMove(move, source) {
			this.dex.abilities.get('dualwield').onModifyMove?.call(this, move, source);
		},
		onBasePower(basePower, source, target, move) {
			const modifier = getDualWieldModifier(move);
			if (modifier !== 1) return this.chainModify(modifier);
		},
		onDamage(damage, target, source, effect) { return this.dex.abilities.get('secondwind').onDamage?.call(this, damage, target, source, effect); },
		flags: {},
		name: "Aura Instinct",
		rating: 5,
		num: 10130,
	},
	royalcurrent: {
		onModifyDefPriority: 6,
		onModifyDef(def, pokemon) {
			if (pokemon.status) return this.chainModify(1.5);
		},
		onModifyMove(move, pokemon) {
			if (['raindance', 'primordialsea'].includes(pokemon.effectiveWeather())) move.critRatio++;
		},
		onModifyDamage(damage, source, target, move) {
			if (move.crit) return this.chainModify(1.5);
		},
		flags: { breakable: 1 },
		name: "Royal Current",
		rating: 4,
		num: 10123,
	},
	grandmaster: {
		onTryAddVolatile(status, pokemon) {
			if (status.id === 'flinch') return null;
		},
		onImmunity(type, pokemon) {
			if (type === 'sandstorm' || type === 'hail' || type === 'powder') return false;
		},
		onModifyMove(move, pokemon) {
			if (move.category === 'Status') pokemon.abilityState.grandmasterGuard = this.turn;
			if (move.id === 'miracleeye') pokemon.abilityState.grandmasterMiracleEye = true;
			if (this.movehasType(move, 'Psychic')) {
				move.onEffectiveness = function (typeMod, target) {
					if (typeMod < 0 && this.queue.willMove(target)) return 0;
					return typeMod;
				};
			}
		},
		onSourceModifyDamage(damage, source, target, move) {
			if (target.abilityState.grandmasterGuard === this.turn && move.category !== 'Status') return this.chainModify(0.8);
		},
		onDamagingHit(damage, target, source, move) {
			if (!source || source === target || target.isAlly(source) || move.flags['futuremove']) return;
			const slotCondition = source.side.slotConditions[source.position]['futuremove'];
			if (slotCondition) {
				this.add('-start', target, 'move: Future Sight', '[from] ability: Grandmaster', '[silent]');
				if (slotCondition.moveData?.grandmasterForesight) {
					slotCondition.perfectForesightQueued = (slotCondition.perfectForesightQueued || 1) + 1;
					const queuedTurn = slotCondition.endingTurn + slotCondition.perfectForesightQueued - 1;
					this.add('-message', `Grandmaster queued another Future Sight for turn ${queuedTurn}.`);
				} else {
					slotCondition.endingTurn = (slotCondition.endingTurn || this.turn) + 2;
					this.add('-message', `Grandmaster delayed Future Sight to turn ${slotCondition.endingTurn}.`);
				}
				return;
			}
			if (!source.side.addSlotCondition(source, 'futuremove', target, this.dex.abilities.get('grandmaster'))) return;
			Object.assign(source.side.slotConditions[source.position]['futuremove'], {
				move: 'futuresight',
				source: target,
				moveData: {
					id: 'futuresight',
					name: "Future Sight",
					accuracy: 100,
					basePower: 120,
					category: "Special",
					priority: 0,
					flags: { allyanim: 1, metronome: 1, futuremove: 1 },
					grandmasterForesight: true,
					effectType: 'Move',
					type: 'Psychic',
				},
				perfectForesightQueued: 1,
			});
			this.add('-start', target, 'move: Future Sight', '[from] ability: Grandmaster');
			this.add('-message', `Grandmaster's Future Sight will strike on turn ${source.side.slotConditions[source.position]['futuremove'].endingTurn}.`);
		},
		onEffectiveness(typeMod, target, type, move) {
			if (type === 'Dark' && target?.abilityState.grandmasterMiracleEye) return typeMod - 1;
		},
		onFaint(pokemon) {
			const foes = pokemon.foes().filter(target => target && !target.fainted);
			for (const target of foes) {
				const slotCondition = target.side.slotConditions[target.position]['futuremove'];
				if (slotCondition) {
					this.add('-start', pokemon, 'move: Future Sight', '[from] ability: Grandmaster', '[silent]');
					if (slotCondition.moveData?.grandmasterForesight) {
						slotCondition.perfectForesightQueued = (slotCondition.perfectForesightQueued || 1) + 1;
						const queuedTurn = slotCondition.endingTurn + slotCondition.perfectForesightQueued - 1;
						this.add('-message', `Grandmaster queued another Future Sight for turn ${queuedTurn}.`);
					} else {
						slotCondition.endingTurn = (slotCondition.endingTurn || this.turn) + 2;
						this.add('-message', `Grandmaster delayed Future Sight to turn ${slotCondition.endingTurn}.`);
					}
					continue;
				}
				if (!target.side.addSlotCondition(target, 'futuremove', pokemon, this.dex.abilities.get('grandmaster'))) continue;
				Object.assign(target.side.slotConditions[target.position]['futuremove'], {
					move: 'futuresight',
					source: pokemon,
					moveData: {
						id: 'futuresight',
						name: "Future Sight",
						accuracy: 100,
						basePower: 120,
						category: "Special",
						priority: 0,
						flags: { allyanim: 1, metronome: 1, futuremove: 1 },
						grandmasterForesight: true,
						effectType: 'Move',
						type: 'Psychic',
					},
					perfectForesightQueued: 1,
				});
				this.add('-start', pokemon, 'move: Future Sight', '[from] ability: Grandmaster');
				this.add('-message', `Grandmaster's Future Sight will strike on turn ${target.side.slotConditions[target.position]['futuremove'].endingTurn}.`);
			}
		},
		onAnyFaint(fainted) {
			const pokemon = this.effectState.target;
			if (!pokemon || pokemon.fainted || fainted === pokemon) return;
			speedUpAbilityFutureSights(this, pokemon, 'grandmasterForesight');
		},
		flags: { breakable: 1 },
		name: "Grandmaster",
		rating: 4,
		num: 10124,
	},
	warpath: {
		onModifyAtkPriority: 5,
		onModifyAtk(atk, pokemon) {
			if (pokemon.status) return this.chainModify(1.5);
		},
		onModifyAccuracy(accuracy, target, source, move) {
			if (typeof accuracy !== 'number') return;
			return this.chainModify([5325, 4096]);
		},
		onBasePower(basePower, source, target, move) {
			if (move.category !== 'Status') return this.chainModify(1.3);
		},
		onTryHitPriority: 1,
		onTryHit(target, source, move) {
			if (move.flags['powder'] && target !== source && this.dex.getImmunity('powder', target)) {
				this.add('-immune', target, '[from] ability: War Path');
				return null;
			}
		},
		onModifyMove(move) {
			if (this.movehasType(move, ['Rock', 'Fighting', 'Ground'])) {
				move.infiltrates = true;
				move.ignoreDefensive = true;
			}
			if (move.flags['drill']) {
				move.infiltrates = true;
				move.ignoreDefensive = true;
			}
		},
		onTryAddVolatile(status, pokemon) {
			if (status.id === 'flinch') return null;
		},
		onSourceModifyDamage(damage, source, target, move) {
			if (move.category !== 'Status') return this.chainModify(0.75);
		},
		onAnyModifyBoost(boosts, pokemon) {
			const warPathUser = this.effectState.target;
			if (warPathUser === pokemon) return;
			if (warPathUser === this.activePokemon && pokemon === this.activeTarget) {
				boosts['def'] = 0;
				boosts['spd'] = 0;
				boosts['evasion'] = 0;
			}
			if (pokemon === this.activePokemon && warPathUser === this.activeTarget) {
				boosts['atk'] = 0;
				boosts['spa'] = 0;
				boosts['accuracy'] = 0;
			}
		},
		flags: {},
		name: "War Path",
		rating: 4,
		num: 10125,
	},
	atrocity: {
		onImmunity(type, pokemon) {
			return this.dex.abilities.get('wildfirecore').onImmunity?.call(this, type, pokemon);
		},
		onUpdate(pokemon) {
			return this.dex.abilities.get('wildfirecore').onUpdate?.call(this, pokemon);
		},
		onStart(pokemon) {
			return this.dex.abilities.get('wildfirecore').onStart?.call(this, pokemon);
		},
		onModifyTypePriority: -1,
		onModifyType(move, pokemon) {
			return this.dex.abilities.get('wildfirecore').onModifyType?.call(this, move, pokemon);
		},
		onModifySTAB(stab, source, target, move) {
			return this.dex.abilities.get('wildfirecore').onModifySTAB?.call(this, stab, source, target, move);
		},
		onTryHit(target, source, move) {
			return this.dex.abilities.get('wildfirecore').onTryHit?.call(this, target, source, move);
		},
		onSourceModifyAtkPriority: 6,
		onSourceModifyAtk(atk, attacker, defender, move) {
			return this.dex.abilities.get('wildfirecore').onSourceModifyAtk?.call(this, atk, attacker, defender, move);
		},
		onSourceModifySpAPriority: 5,
		onSourceModifySpA(spa, attacker, defender, move) {
			return this.dex.abilities.get('wildfirecore').onSourceModifySpA?.call(this, spa, attacker, defender, move);
		},
		onModifyMove(move) {
			move.ignoreAbility = true;
			move.ignoreDefensive = true;
			move.infiltrates = true;
			move.critRatio++;
			if (move.id === 'dragonrush') move.accuracy = true;
		},
		onBasePowerPriority: 8,
		onBasePower(basePower, source, target, move) {
			if (move.category === 'Status') return;
			let modifier = 1.3;
			if (move.typeChangerBoosted === this.effect) {
				modifier *= this.field.isTerrain(['dragonsdenterrain', 'fairytaleterrain']) ? 1.5 : 1.2;
			}
			if (source.hasType(move.type)) modifier *= 1.2;
			if (this.field.isTerrain('coldeclipseterrain')) modifier *= 1.3;
			if (move.id === 'dragonrush') modifier *= 1.5;
			if (!this.getAllActive().some(pokemon => pokemon.hasAbility('neutralization')) && this.getAllActive().some(pokemon => pokemon.hasAbility(['royaldecree', 'royalsun']))) {
				modifier *= 1.3;
			}
			return this.chainModify(modifier);
		},
		onSourceModifyDamage(damage, source, target, move) {
			if (move && move.category !== 'Status' && !this.getAllActive().some(pokemon => pokemon.hasAbility('neutralization')) && this.getAllActive().some(pokemon => pokemon.hasAbility(['royaldecree', 'royalsun']))) {
				return this.chainModify(0.7);
			}
		},
		onSourceDamagingHit(damage, target, source, move) {
			if (move.category === 'Status') return;
			const gmaxTarget = target.volatiles['dynamax'] && (target.gigantamax || target.species.forme?.includes('Gmax'));
			const drain = gmaxTarget ? 0.6 : 0.3;
			this.heal(Math.min(Math.floor(damage * drain), Math.floor(source.baseMaxhp / 3)), source, source);
		},
		onResidual(pokemon) {
			this.dex.abilities.get('wildfirecore').onResidual?.call(this, pokemon);
			this.dex.abilities.get('selfsufficient').onResidual?.call(this, pokemon);
		},
		onAfterMove(source, target, move) {
			return this.dex.abilities.get('wildfirecore').onAfterMove?.call(this, source, target, move);
		},
		onModifyDef(def, pokemon) {
			if (this.field.isTerrain('coldeclipseterrain')) return this.chainModify(1.5);
			return this.chainModify(1.3);
		},
		onModifySpD(spd, pokemon) {
			if (this.field.isTerrain('coldeclipseterrain')) return this.chainModify(1.5);
			return this.chainModify(1.3);
		},
		flags: { cantsuppress: 1 },
		name: "Atrocity",
		rating: 5,
		num: 10126,
	},
	wickedsnare: {
		onModifyAtk(atk, attacker, defender) { return this.dex.abilities.get('stakeout').onModifyAtk?.call(this, atk, attacker, defender); },
		onModifySpA(spa, attacker, defender) { return this.dex.abilities.get('stakeout').onModifySpA?.call(this, spa, attacker, defender); },
		onStart(pokemon) { this.dex.abilities.get('intimidate').onStart?.call(this, pokemon); },
		onDamagingHit(damage, target, source, move) { return this.dex.abilities.get('tanglinghair').onDamagingHit?.call(this, damage, target, source, move); },
		flags: { breakable: 1 },
		name: "Wicked Snare",
		rating: 4,
		num: 10044,
	},
	bewitchingmajesty: {
		onStart(pokemon) {
			if (this.field.setTerrain('bewitchedwoodsterrain', pokemon, this.dex.abilities.get('bewitchingmajesty'))) {
				this.field.terrainState.duration = 5;
			}
		},
		onTryHitPriority: 1,
		onTryHit(target, source, move) {
			if (target === source || move.hasBounced || !move.flags['reflectable']) return;
			const newMove = this.dex.getActiveMove(move.id);
			newMove.hasBounced = true;
			newMove.pranksterBoosted = false;
			this.actions.useMove(newMove, target, { target: source });
			return null;
		},
		onFoeTryMove(target, source, move) {
			const holder = this.effectState.target;
			const targetAllExceptions = ['perishsong', 'flowershield', 'rototiller'];
			if (move.target === 'foeSide' || (move.target === 'all' && !targetAllExceptions.includes(move.id))) return;
			if ((source.isAlly(holder) || move.target === 'all') && move.priority > 0.1) {
				this.attrLastMove('[still]');
				this.add('cant', holder, 'ability: Bewitching Majesty', move, `[of] ${target}`);
				return false;
			}
		},
		flags: { breakable: 1 },
		name: "Bewitching Majesty",
		rating: 5,
		num: 10045,
	},
	corrosivescale: {
		onModifyDefPriority: 6,
		onModifyDef(def, pokemon) {
			return this.dex.abilities.get('marvelscale').onModifyDef?.call(this, def, pokemon);
		},
		onAnyAfterSetStatus(status, target, source, effect) {
			if (source !== this.effectState.target || target === source) return;
			if (status.id === 'psn' || status.id === 'tox') target.addVolatile('confusion');
		},
		flags: { breakable: 1 },
		name: "Corrosive Scale",
		rating: 3.5,
		num: 10046,
	},
	corrosivedust: {
		onDamagingHit(damage, target, source, move) {
			if (source && source !== target && this.checkMoveMakesContact(move, source, target) && this.randomChance(3, 10)) {
				source.trySetStatus('psn', target);
			}
		},
		onAnyAfterSetStatus(status, target, source, effect) {
			if (status.id === 'psn' || status.id === 'tox') target.addVolatile('confusion');
		},
		onAnyTryHeal(damage, target, source, effect) {
			return this.dex.abilities.get('invigorate').onAnyTryHeal?.call(this, damage, target, source, effect);
		},
		onResidual(pokemon) {
			return this.dex.abilities.get('invigorate').onResidual?.call(this, pokemon);
		},
		onAnyModifyDamage(damage, source, target, move) {
			return this.dex.abilities.get('friendguard').onAnyModifyDamage?.call(this, damage, source, target, move);
		},
		onModifySecondaries(secondaries) { return this.dex.abilities.get('shielddust').onModifySecondaries?.call(this, secondaries); },
		onImmunity(type) {
			if (type === 'Ground') return false;
		},
		flags: { breakable: 1 },
		name: "Corrosive Dust",
		rating: 3,
		num: 10047,
	},
	souleater: {
		onAnyAccuracy(accuracy, target, source, move) {
			if (move && source === this.effectState.target) return true;
			return accuracy;
		},
		onTryHit(target, source, move) {
			if (target !== source && this.movehasType(move, 'Ghost')) {
				if (!this.heal(target.baseMaxhp / 4)) this.add('-immune', target, '[from] ability: Soul Eater');
				return null;
			}
		},
		onSourceModifyDamage(damage, source, target, move) {
			if (target.hp > target.maxhp / 4) return this.chainModify(0.7);
		},
		onFaint(pokemon) {
			if (this.field.terrain === 'hauntedterrain') {
				this.field.terrainState.duration = Math.max(this.field.terrainState.duration || 0, 5);
			} else if (this.field.setTerrain('hauntedterrain', pokemon, this.dex.abilities.get('souleater'), true)) {
				this.field.terrainState.duration = 5;
			}
		},
		flags: { cantsuppress: 1 },
		name: "Soul Eater",
		rating: 5,
		num: 10048,
	},
	auroraresonance: {
		onBasePowerPriority: 8,
		onBasePower(basePower, source, target, move) {
			return this.dex.abilities.get('liquidvoice').onBasePower?.call(this, basePower, source, target, move);
		},
		onModifyTypePriority: -1,
		onModifyType(move, pokemon) {
			return this.dex.abilities.get('liquidvoice').onModifyType?.call(this, move, pokemon);
		},
		onTryHit(target, source, move) {
			return this.dex.abilities.get('waterabsorb').onTryHit?.call(this, target, source, move);
		},
		onResidual(pokemon) {
			return this.dex.abilities.get('hydration').onResidual?.call(this, pokemon);
		},
		flags: { breakable: 1 },
		name: "Aurora Resonance",
		rating: 4,
		num: 10049,
	},
	auroracurrent: {
		onStart(source) {
			this.field.setWeather('hail', source, this.dex.abilities.get('auroracurrent'));
			if (this.field.isTerrain(['holyterrain', 'crystalcavernterrain', 'darkcrystalcavernterrain', 'newworldterrain', 'starlightarenaterrain', 'caveterrain', 'volcanicterrain', 'desertterrain'])) {
				this.boost({ def: 1, spd: 1 }, source, source, this.effect);
			}
		},
		onModifyMove(move, pokemon) {
			if (this.movehasType(move, 'Electric') && ['hail', 'snow'].includes(pokemon.effectiveWeather())) {
				move.accuracy = true;
			}
		},
		onModifySTAB(stab, source, target, move) {
			if (move.type === 'Electric' && !source.hasType('Electric')) return 1.5;
		},
		onModifyDef(def, pokemon) {
			if (['hail', 'snow'].includes(pokemon.effectiveWeather())) return this.chainModify(1.5);
		},
		onModifySpD(spd, pokemon) {
			if (['hail', 'snow'].includes(pokemon.effectiveWeather())) return this.chainModify(1.5);
		},
		onDamagingHit(damage, target, source, move) {
			return this.dex.abilities.get('snowwarning').onDamagingHit?.call(this, damage, target, source, move);
		},
		flags: {},
		name: "Aurora Current",
		rating: 4.5,
		num: 10183,
	},
	alloycore: {
		onResidual(pokemon) { this.dex.abilities.get('selfsufficient').onResidual?.call(this, pokemon); },
		onDamage(damage, target, source, effect) {
			return this.dex.abilities.get('magicguard').onDamage?.call(this, damage, target, source, effect);
		},
		onTryBoost(boost, target, source, effect) {
			if (!source || target === source) return;
			let showMsg = false;
			let i: BoostID;
			for (i in boost) {
				if (boost[i]! < 0) {
					delete boost[i];
					showMsg = true;
				}
			}
			if (showMsg) this.add('-fail', target, 'unboost', '[from] ability: Alloy Core', `[of] ${target}`);
		},
		flags: { breakable: 1 },
		name: "Alloy Core",
		rating: 4,
		num: 10066,
	},
	hellfireeclipse: {
		onTryHit(target, source, move) { return this.dex.abilities.get('flashfire').onTryHit?.call(this, target, source, move); },
		onModifyAtkPriority: 5,
		onModifyAtk(atk, pokemon) {
			if (['sunnyday', 'desolateland'].includes(pokemon.effectiveWeather())) return this.chainModify(1.5);
		},
		onModifySpAPriority: 5,
		onModifySpA(spa, pokemon) {
			if (['sunnyday', 'desolateland'].includes(pokemon.effectiveWeather())) return this.chainModify(1.5);
		},
		onAfterMove(source, target, move) {
			if (!this.movehasType(move, 'Fire')) return;
			if (this.field.setWeather('sunnyday', source, this.dex.abilities.get('hellfireeclipse'))) {
				this.field.weatherState.duration = 2;
			}
		},
		flags: { breakable: 1 },
		name: "Hellfire Eclipse",
		rating: 4.5,
		num: 10100,
	},
	sacrededge: {
		onStart(pokemon) {
			const healAmount = this.field.isTerrain('fairytaleterrain') ? 3 : 4;
			for (const ally of pokemon.adjacentAllies()) {
				if (!ally.hp || ally.fainted) continue;
				this.add('-message', `${pokemon.name} shared its mead with ${ally.name}!`);
				this.heal(ally.baseMaxhp / healAmount, ally, pokemon);
			}
		},
		onModifyMove(move, source) {
			this.dex.abilities.get('dualwield').onModifyMove?.call(this, move, source);
		},
		onBasePowerPriority: 19,
		onBasePower(basePower, attacker, defender, move) {
			const sharpnessBoost = move.flags['slicing'] && !this.field.isTerrain('coldeclipseterrain') ? 1.5 : 1;
			const modifier = getDualWieldModifier(move, sharpnessBoost);
			if (modifier !== 1) return this.chainModify(modifier);
		},
		flags: { breakable: 1 },
		name: "Sacred Edge",
		rating: 4,
		num: 10101,
	},
	omenedge: {
		onModifyMove(move, source) {
			this.dex.abilities.get('dualwield').onModifyMove?.call(this, move, source);
		},
		onBasePowerPriority: 19,
		onBasePower(basePower, attacker, defender, move) {
			const sharpnessBoost = move.flags['slicing'] && !this.field.isTerrain('coldeclipseterrain') ? 1.5 : 1;
			const modifier = getDualWieldModifier(move, sharpnessBoost);
			if (modifier !== 1) return this.chainModify(modifier);
		},
		onFaint(pokemon) {
			for (const target of pokemon.foes()) {
				if (!target || target.fainted) continue;
				const slotCondition = target.side.slotConditions[target.position]['futuremove'];
				if (slotCondition) {
					slotCondition.endingTurn = (slotCondition.endingTurn || this.turn) + 2;
					this.add('-message', `Omen Edge delayed Doom Desire to turn ${slotCondition.endingTurn}.`);
					continue;
				}
				if (!target.side.addSlotCondition(target, 'futuremove', pokemon, this.dex.abilities.get('omenedge'))) continue;
				Object.assign(target.side.slotConditions[target.position]['futuremove'], {
					move: 'doomdesire',
					source: pokemon,
					moveData: {
						id: 'doomdesire',
						name: "Doom Desire",
						accuracy: 100,
						basePower: 140,
						category: "Physical",
						priority: 0,
						flags: { metronome: 1, futuremove: 1 },
						effectType: 'Move',
						type: 'Steel',
					},
				});
				this.add('-start', pokemon, 'Doom Desire', '[from] ability: Omen Edge');
				this.add('-message', `Omen Edge's Doom Desire will strike on turn ${target.side.slotConditions[target.position]['futuremove'].endingTurn}.`);
			}
		},
		flags: { breakable: 1 },
		name: "Omen Edge",
		rating: 4,
		num: 10102,
	},
	dreadmaw: {
		onModifyAtkPriority: 5,
		onModifyAtk(atk) {
			return this.chainModify(2);
		},
		onBasePowerPriority: 19,
		onBasePower(basePower, attacker, defender, move) {
			if (move.flags['bite']) return this.chainModify(1.5);
		},
		onStart(pokemon) { this.dex.abilities.get('intimidate').onStart?.call(this, pokemon); },
		flags: { breakable: 1 },
		name: "Dread Maw",
		rating: 5,
		num: 10103,
	},
	cursedkeepsake: {
		onDamagingHit(damage, target, source, move) {
			if (!source || source === target || source.isAlly(target) || move.category === 'Status') return;
			source.addVolatile('curse', target, this.dex.abilities.get('cursedkeepsake'));
		},
		onSourceModifyDamage(damage, source, target, move) {
			if (source.volatiles['curse']) return this.chainModify(0.8);
		},
		onAnyDamage(damage, target, source, effect) {
			if (effect?.id === 'curse' && target.volatiles['curse']?.source?.hasAbility('cursedkeepsake')) {
				this.heal(damage / 2, target.volatiles['curse'].source, target);
			}
		},
		onFaint(pokemon) {
			for (const foe of pokemon.foes()) {
				if (!foe || foe.fainted) continue;
				foe.addVolatile('curse', pokemon, this.dex.abilities.get('cursedkeepsake'));
			}
			if (this.field.terrain === 'hauntedterrain') {
				this.field.terrainState.duration = Math.max(this.field.terrainState.duration || 0, 5);
			} else if (this.field.setTerrain('hauntedterrain', pokemon, this.dex.abilities.get('cursedkeepsake'), true)) {
				this.field.terrainState.duration = 5;
			}
		},
		flags: { breakable: 1 },
		name: "Cursed Keepsake",
		rating: 4.5,
		num: 10131,
	},
	cursedmarionette: {
		onModifyPriority(priority, pokemon, target, move) {
			if (move?.category === 'Status') return priority + 1;
		},
		onSourceHit(target, source, move) {
			if (!target || target === source || target.isAlly(source) || target.fainted) return;
			target.addVolatile('curse', source, this.dex.abilities.get('cursedmarionette'));
		},
		onAfterMoveSecondarySelf(source, target, move) {
			if (!target || target === source || source.isAlly(target) || target.fainted || move.category !== 'Status') return;
			target.addVolatile('curse', source, this.dex.abilities.get('cursedmarionette'));
		},
		onDamagingHit(damage, target, source, move) {
			if (source && source !== target && !source.isAlly(target) && move.category !== 'Status') {
				source.addVolatile('curse', target, this.dex.abilities.get('cursedmarionette'));
			}
			if ((target as any).cursedMarionetteHaunted || target.hp > target.maxhp / 2) return;
			(target as any).cursedMarionetteHaunted = true;
			if (this.field.terrain === 'hauntedterrain') {
				this.field.terrainState.duration = Math.max(this.field.terrainState.duration || 0, 3);
			} else if (this.field.setTerrain('hauntedterrain', target, this.dex.abilities.get('cursedmarionette'), true)) {
				this.field.terrainState.duration = 3;
			}
		},
		onFaint(pokemon) {
			for (const foe of pokemon.foes()) {
				if (!foe || foe.fainted) continue;
				foe.addVolatile('curse', pokemon, this.dex.abilities.get('cursedmarionette'));
			}
			if (this.field.terrain === 'hauntedterrain') {
				this.field.terrainState.duration = (this.field.terrainState.duration || 0) + 5;
			} else if (this.field.setTerrain('hauntedterrain', pokemon, this.dex.abilities.get('cursedmarionette'), true)) {
				this.field.terrainState.duration = 5;
			}
		},
		onAnyDamage(damage, target, source, effect) {
			if (effect?.id === 'curse' && target.volatiles['curse']?.source?.hasAbility('cursedmarionette')) {
				this.heal(damage / 2, target.volatiles['curse'].source, target);
			}
		},
		onSourceDamagingHit(damage, target, source, move) {
			if (move.category === 'Status') return;
			if (target && target !== source && !target.isAlly(source) && !target.fainted) {
				target.addVolatile('curse', source, this.dex.abilities.get('cursedmarionette'));
			}
		},
		onSourceModifyDamage(damage, source, target, move) {
			if (source.volatiles['curse']) return this.chainModify(0.8);
		},
		flags: { breakable: 1 },
		name: "Cursed Marionette",
		rating: 4.5,
		num: 10104,
	},
	sandsovereign: {
		onStart(source) {
			this.field.setWeather('sandstorm', source, this.dex.abilities.get('sandsovereign'));
			if (this.field.isWeather('sandstorm')) this.field.weatherState.duration = 8;
			this.dex.abilities.get('battlearmor').onStart?.call(this, source);
		},
		onCriticalHit: false,
		onSourceModifyDamage(damage, source, target, move) {
			let modifier = 0.8 * 0.8;
			if (target.getMoveHitData(move).typeMod > 0) modifier *= 0.75;
			return this.chainModify(modifier);
		},
		onAfterEachBoost(boost, target, source, effect) {
			return this.dex.abilities.get('battlearmor').onAfterEachBoost?.call(this, boost, target, source, effect);
		},
		onResidual(pokemon) {
			for (const target of pokemon.foes()) {
				if (!target || target.fainted || isImmuneToScalingChip(target, 'Rock')) continue;
				const typeMod = this.clampIntRange(this.dex.getEffectiveness('Rock', target.getTypes()), -6, 6);
				this.damage(target.baseMaxhp / 16 * Math.max(0.25, 2 ** typeMod), target, pokemon);
			}
		},
		flags: { breakable: 1 },
		name: "Sand Sovereign",
		rating: 5,
		num: 10105,
	},
	tyrantstream: {
		onStart(source) {
			this.dex.abilities.get('sandstream').onStart?.call(this, source);
		},
		onBasePower(basePower, source, target, move) {
			let modifier = 1;
			if (this.field.isTerrain('chessboardterrain')) modifier *= 1.2;
			if (move.recoil || move.hasCrashDamage || ['explosion', 'selfdestruct', 'mistyexplosion'].includes(move.id)) {
				modifier *= 1.2;
			}
			if (move.flags['bite']) modifier *= 1.5;
			return this.chainModify(modifier);
		},
		onDamage(damage, target, source, effect) { return this.dex.abilities.get('bruteforce').onDamage?.call(this, damage, target, source, effect); },
		flags: { breakable: 1 },
		name: "Tyrant Stream",
		rating: 4.5,
		num: 10184,
	},
	frostsovereign: {
		onStart(source) {
			this.field.setWeather('hail', source, this.dex.abilities.get('snowwarning'));
			if (this.field.isWeather(['hail', 'snow'])) this.field.weatherState.duration = 8;
		},
		onWeather(target, source, effect) { return this.dex.abilities.get('icebody').onWeather?.call(this, target, source, effect); },
		onDamagingHit(damage, target, source, move) { return this.dex.abilities.get('icebody').onDamagingHit?.call(this, damage, target, source, move); },
		onImmunity(type, pokemon) { return this.dex.abilities.get('icebody').onImmunity?.call(this, type, pokemon); },
		onSourceModifyDamage(damage, source, target, move) { return this.dex.abilities.get('filter').onSourceModifyDamage?.call(this, damage, source, target, move); },
		onResidual(pokemon) {
			this.dex.abilities.get('icebody').onResidual?.call(this, pokemon);
			for (const target of pokemon.foes()) {
				if (!target || target.fainted || isImmuneToScalingChip(target, 'Ice')) continue;
				const typeMod = this.clampIntRange(this.dex.getEffectiveness('Ice', target.getTypes()), -6, 6);
				this.damage(target.baseMaxhp / 16 * Math.max(0.25, 2 ** typeMod), target, pokemon);
			}
		},
		flags: { breakable: 1 },
		name: "Frost Sovereign",
		rating: 5,
		num: 10106,
	},
	freezerburn: {
		onModifySpe(spe, pokemon) { return this.dex.abilities.get('slushrush').onModifySpe?.call(this, spe, pokemon); },
		onWeather(target, source, effect) { return this.dex.abilities.get('icebody').onWeather?.call(this, target, source, effect); },
		onModifyTypePriority: -1,
		onModifyType(move, pokemon) {
			const noModifyType = [
				'judgment', 'multiattack', 'naturalgift', 'revelationdance', 'technoblast', 'terrainpulse', 'weatherball',
			];
			if (move.type === 'Normal' && (!noModifyType.includes(move.id) || this.activeMove?.isMax) &&
				!(move.isZ && move.category !== 'Status') && !(move.name === 'Tera Blast' && pokemon.terastallized)) {
				move.type = 'Ice';
				move.typeChangerBoosted = this.effect;
			}
		},
		onBasePowerPriority: 23,
		onBasePower(basePower, pokemon, target, move) {
			if (move.typeChangerBoosted === this.effect) {
				return this.chainModify(1.2);
			}
		},
		onChargeMove(pokemon, target, move) {
			this.debug('Freezer Burn - remove charge turn for ' + move.id);
			this.attrLastMove('[still]');
			this.addMove('-anim', pokemon, move.name, target);
			return false;
		},
		flags: {},
		name: "Freezer Burn",
		rating: 5,
		num: 10181,
	},
	stormfright: {
		onStart(pokemon) {
			for (const target of pokemon.foes()) {
				this.boost({ atk: -1 }, target, pokemon, null, true);
			}
		},
		onTryHit(target, source, move) {
			if (target !== source && this.movehasType(move, 'Electric')) {
				this.boost({ spa: 1 }, target, target);
				return null;
			}
		},
		onFoeNegateImmunity(pokemon, type) {
			return this.dex.abilities.get('teravolt').onFoeNegateImmunity?.call(this, pokemon, type);
		},
		onModifyMove(move) {
			this.dex.abilities.get('teravolt').onModifyMove?.call(this, move);
		},
		flags: { breakable: 1 },
		name: "Storm Fright",
		rating: 4.5,
		num: 10107,
	},
	enlightenment: {
		onModifyAtk(atk, pokemon, target, move) { return this.dex.abilities.get('purepower').onModifyAtk?.call(this, atk, pokemon, target, move); },
		onModifySpA(spa, pokemon, target, move) { return this.dex.abilities.get('purepower').onModifySpA?.call(this, spa, pokemon, target, move); },
		onTryAddVolatile(status, pokemon) { return this.dex.abilities.get('innerfocus').onTryAddVolatile?.call(this, status, pokemon); },
		onTryBoost(boost, target, source, effect) { return this.dex.abilities.get('innerfocus').onTryBoost?.call(this, boost, target, source, effect); },
		onModifyMove(move, source) { this.dex.abilities.get('technician').onModifyMove?.call(this, move, source); },
		onBasePowerPriority: 30,
		onBasePower(basePower, source, target, move) { return this.dex.abilities.get('technician').onBasePower?.call(this, basePower, source, target, move); },
		flags: { breakable: 1 },
		name: "Enlightenment",
		rating: 5,
		num: 10108,
	},
	relentlesslink: {
		onStart(pokemon) { return this.dex.abilities.get('moldbreaker').onStart?.call(this, pokemon); },
		onModifyMove(move) {
			this.dex.abilities.get('skilllink').onModifyMove?.call(this, move);
			this.dex.abilities.get('moldbreaker').onModifyMove?.call(this, move);
		},
		onSourceModifyDamage(damage, source, target, move) { return this.dex.abilities.get('battlearmor').onSourceModifyDamage?.call(this, damage, source, target, move); },
		onCriticalHit: false,
		flags: { breakable: 1 },
		name: "Relentless Link",
		rating: 4.5,
		num: 10109,
	},
	mirrorgreed: {
		onBasePower(basePower, attacker, defender, move) {
			return this.dex.abilities.get('analytic').onBasePower?.call(this, basePower, attacker, defender, move);
		},
		onTryHitPriority: 1,
		onTryHit(target, source, move) {
			if (target === source || move.hasBounced || !move.flags['reflectable']) return;
			const newMove = this.dex.getActiveMove(move.id);
			newMove.hasBounced = true;
			newMove.pranksterBoosted = false;
			this.actions.useMove(newMove, target, { target: source });
			return null;
		},
		onSourceModifyDamage(damage, source, target, move) {
			return this.dex.abilities.get('filter').onSourceModifyDamage?.call(this, damage, source, target, move);
		},
		flags: { breakable: 1 },
		name: "Mirror Greed",
		rating: 5,
		num: 10111,
	},
	uncheckedassault: {
		onModifyMove(move) {
			if (move.type === 'Normal' || move.type === 'Fighting') move.ignoreImmunity = true;
			this.dex.abilities.get('technician').onModifyMove?.call(this, move);
		},
		onBasePowerPriority: 30,
		onBasePower(basePower, attacker, defender, move) {
			return this.dex.abilities.get('technician').onBasePower?.call(this, basePower, attacker, defender, move);
		},
		onFoeAfterBoost(boost, target, source, effect) {
			if (effect?.name === 'Unchecked Assault' || effect?.name === 'Mirror Herb') return;
			if (!this.effectState.boosts) this.effectState.boosts = {} as SparseBoostsTable;
			const boostPlus = this.effectState.boosts;
			let i: BoostID;
			for (i in boost) {
				if (boost[i]! > 0) boostPlus[i] = (boostPlus[i] || 0) + boost[i]!;
			}
		},
		onResidual(pokemon) {
			if (!this.effectState.boosts) return;
			this.boost(this.effectState.boosts, pokemon);
			delete this.effectState.boosts;
		},
		flags: { breakable: 1 },
		name: "Unchecked Assault",
		rating: 4.5,
		num: 10112,
	},
	royalvoice: {
		onStart(pokemon) {
			const healAmount = this.field.isTerrain('fairytaleterrain') ? 3 : 4;
			for (const ally of pokemon.adjacentAllies()) {
				if (!ally.hp || ally.fainted) continue;
				this.add('-message', `${pokemon.name} shared its mead with ${ally.name}!`);
				this.heal(ally.baseMaxhp / healAmount, ally, pokemon);
			}
		},
		onModifyTypePriority: -1,
		onModifyType(move, pokemon) {
			const noModifyType = [
				'judgment', 'multiattack', 'naturalgift', 'revelationdance', 'technoblast', 'terrainpulse', 'weatherball',
			];
			if (move.type === 'Normal' && (!noModifyType.includes(move.id) || this.activeMove?.isMax) &&
				!(move.isZ && move.category !== 'Status') && !(move.name === 'Tera Blast' && pokemon.terastallized)) {
				move.type = 'Fairy';
				move.typeChangerBoosted = this.effect;
			}
		},
		onBasePowerPriority: 23,
		onBasePower(basePower, pokemon, target, move) {
			if (move.typeChangerBoosted === this.effect || this.movehasType(move, ['Psychic', 'Fairy'])) return this.chainModify(1.2);
		},
		onFoeTryMove(target, source, move) {
			const targetAllExceptions = ['perishsong', 'flowershield', 'rototiller'];
			if (move.target === 'foeSide' || (move.target === 'all' && !targetAllExceptions.includes(move.id))) {
				return;
			}
			const holder = this.effectState.target;
			if ((source.isAlly(holder) || move.target === 'all') && move.priority > 0.1) {
				this.attrLastMove('[still]');
				this.add('cant', holder, 'ability: Royal Voice', move, `[of] ${target}`);
				return false;
			}
		},
		flags: { breakable: 1 },
		name: "Royal Voice",
		rating: 5,
		num: 10113,
	},
	memoryleak: {
		onTryBoost(boost, target, source, effect) {
			if (!target.hp || effect?.id === 'memoryleak') return;
			const ally = target.adjacentAllies().find(pokemon => pokemon.hp && !pokemon.fainted);
			if (!ally) return;
			const passed: SparseBoostsTable = {};
			let stat: BoostID;
			for (stat in boost) {
				if (boost[stat]! > 0) {
					passed[stat] = boost[stat];
					delete boost[stat];
				}
			}
			if (Object.keys(passed).length) {
				this.add('-ability', target, 'Memory Leak');
				// Self-boosts and outside boosts aimed at the holder are redirected to the ally.
				this.boost(passed, ally, target, this.dex.abilities.get('memoryleak'));
			}
		},
		flags: { breakable: 1 },
		name: "Memory Leak",
		rating: 3,
		num: 10140,
	},
	defragment: {
		onStart(pokemon) {
			let foeAtk = 0;
			let foeSpA = 0;
			for (const foe of pokemon.foes()) {
				if (!foe || foe.fainted) continue;
				foeAtk += foe.getStat('atk', false, true);
				foeSpA += foe.getStat('spa', false, true);
			}
			const strongFields = ['newworldterrain', 'factoryterrain', 'shortcircuitterrain', 'glitchterrain', 'starlightarenaterrain'];
			const boostAmount = this.field.isTerrain(strongFields) ? 2 : 1;
			if (this.field.isTerrain(['coldeclipseterrain', 'fairytaleterrain'])) {
				this.boost({ def: 1, spd: 1 }, pokemon, pokemon);
			} else if (foeAtk >= foeSpA) {
				this.boost({ def: boostAmount }, pokemon, pokemon);
			} else {
				this.boost({ spd: boostAmount }, pokemon, pokemon);
			}
		},
		onAnyAccuracy(accuracy, target, source, move) {
			if (source === this.effectState.target) return true;
		},
		flags: { breakable: 1 },
		name: "Defragment",
		rating: 3.5,
		num: 10141,
	},
	temporalshift: {
		queueTemporalHex(pokemon, abilityName = 'Temporal Shift', everyTurn = false, typePool = null, basePower = 120) {
			if (!everyTurn && pokemon.abilityState.temporalShiftLastCastTurn === this.turn - 1) return;
			const primaryType = pokemon.getTypes()[0] || pokemon.species.types[0] || 'Normal';
			const targets = pokemon.foes().filter(target => target.hp && !target.fainted && target !== pokemon && !target.isAlly(pokemon));
			const target = targets.length ? this.sample(targets) : null;
			if (!target) return;
			let moveType = primaryType;
			if (typePool?.length) {
				let bestMod = -10;
				for (const candidateType of typePool) {
					const typeMod = this.clampIntRange(this.dex.getEffectiveness(candidateType, target.getTypes()), -6, 6);
					if (typeMod > bestMod) {
						bestMod = typeMod;
						moveType = candidateType;
					}
				}
			}
			pokemon.abilityState.temporalShiftLastCastTurn = this.turn;
			const slotCondition = target.side.slotConditions[target.position]['futuremove'];
			if (slotCondition) {
				this.add('-start', pokemon, 'move: Future Sight', `[from] ability: ${abilityName}`, '[silent]');
				if (slotCondition.moveData?.temporalShiftHex) {
					slotCondition.perfectForesightQueued = (slotCondition.perfectForesightQueued || 1) + 1;
					const queuedTurn = slotCondition.endingTurn + slotCondition.perfectForesightQueued - 1;
					this.add('-message', `${abilityName} queued another ${moveType}-type Future Sight for turn ${queuedTurn}.`);
				} else {
					slotCondition.endingTurn = (slotCondition.endingTurn || this.turn) + 2;
					this.add('-message', `${abilityName} delayed Future Sight to turn ${slotCondition.endingTurn}.`);
				}
				return;
			}
			if (!target.side.addSlotCondition(target, 'futuremove', pokemon, this.dex.abilities.get('temporalshift'))) return;
			Object.assign(target.side.slotConditions[target.position]['futuremove'], {
				move: 'futuresight',
				source: pokemon,
				moveData: {
					id: 'futuresight',
					name: "Future Sight",
					accuracy: 100,
					basePower,
					category: "Special",
					priority: 0,
					flags: { allyanim: 1, metronome: 1, futuremove: 1 },
					temporalShiftHex: true,
					effectType: 'Move',
					type: moveType,
				},
				perfectForesightQueued: 1,
			});
			this.add('-start', pokemon, 'move: Future Sight', `[from] ability: ${abilityName}`);
			this.add('-message', `${abilityName}'s ${moveType}-type Future Sight will strike on turn ${target.side.slotConditions[target.position]['futuremove'].endingTurn}.`);
		},
		onBoost(boost, target, source, effect) {
			if (source && target === source) return;
			let stat: BoostID;
			for (stat in boost) {
				if (boost[stat]! < 0) delete boost[stat];
			}
		},
		onStart(pokemon) {
			pokemon.abilityState.temporalShiftStartTurn = this.turn;
		},
		onResidual(pokemon) {
			if (this.gameType !== 'freeforall' && pokemon.abilityState.temporalShiftStartTurn === this.turn) return;
			this.effect.queueTemporalHex.call(this, pokemon);
		},
		flags: { breakable: 1 },
		name: "Temporal Shift",
		rating: 4,
		num: 10142,
	},
	voidveil: {
		getVoidFutureType(pokemon, target) {
			if (!pokemon.hasType('Fairy')) return pokemon.getTypes()[0] || pokemon.species.types[0] || 'Normal';
			const psychicMod = this.clampIntRange(this.dex.getEffectiveness('Psychic', target.getTypes()), -6, 6);
			const fairyMod = this.clampIntRange(this.dex.getEffectiveness('Fairy', target.getTypes()), -6, 6);
			return fairyMod > psychicMod ? 'Fairy' : (pokemon.getTypes()[0] || pokemon.species.types[0] || 'Normal');
		},
		queueVoidFutureSight(pokemon) {
			const targets = pokemon.foes().filter(target => target.hp && !target.fainted && target !== pokemon && !target.isAlly(pokemon));
			const target = targets.length ? this.sample(targets) : null;
			if (!target) return;
			const moveType = this.effect.getVoidFutureType.call(this, pokemon, target);
			const slotCondition = target.side.slotConditions[target.position]['futuremove'];
			if (slotCondition) {
				this.add('-start', pokemon, 'move: Future Sight', '[from] ability: Void Veil', '[silent]');
				if (slotCondition.moveData?.voidVeilFutureSight) {
					slotCondition.perfectForesightQueued = (slotCondition.perfectForesightQueued || 1) + 1;
					const queuedTurn = slotCondition.endingTurn + slotCondition.perfectForesightQueued - 1;
					this.add('-message', `Void Veil queued another ${moveType}-type Future Sight for turn ${queuedTurn}.`);
				} else {
					slotCondition.endingTurn = (slotCondition.endingTurn || this.turn) + 2;
					this.add('-message', `Void Veil delayed Future Sight to turn ${slotCondition.endingTurn}.`);
				}
				return;
			}
			if (!target.side.addSlotCondition(target, 'futuremove', pokemon, this.dex.abilities.get('voidveil'))) return;
			Object.assign(target.side.slotConditions[target.position]['futuremove'], {
				move: 'futuresight',
				source: pokemon,
				moveData: {
					id: 'futuresight',
					name: "Future Sight",
					accuracy: 100,
					basePower: this.field.isTerrain('coldeclipseterrain') ? 90 : 60,
					category: "Special",
					priority: 0,
					flags: { allyanim: 1, metronome: 1, futuremove: 1 },
					voidVeilFutureSight: true,
					effectType: 'Move',
					type: moveType,
				},
				perfectForesightQueued: 1,
			});
			this.add('-start', pokemon, 'move: Future Sight', '[from] ability: Void Veil');
			this.add('-message', `Void Veil's ${moveType}-type Future Sight will strike on turn ${target.side.slotConditions[target.position]['futuremove'].endingTurn}.`);
		},
		queueVoidDoomDesire(pokemon) {
			for (const target of pokemon.foes()) {
				if (!target || target.fainted) continue;
				const slotCondition = target.side.slotConditions[target.position]['futuremove'];
				if (slotCondition) {
					slotCondition.endingTurn = (slotCondition.endingTurn || this.turn) + 2;
					this.add('-message', `Void Veil delayed Doom Desire to turn ${slotCondition.endingTurn}.`);
					continue;
				}
				if (!target.side.addSlotCondition(target, 'futuremove', pokemon, this.dex.abilities.get('voidveil'))) continue;
				Object.assign(target.side.slotConditions[target.position]['futuremove'], {
					move: 'doomdesire',
					source: pokemon,
					moveData: {
						id: 'doomdesire',
						name: "Doom Desire",
						accuracy: 100,
						basePower: 280,
						category: "Special",
						priority: 0,
						flags: { metronome: 1, futuremove: 1 },
						effectType: 'Move',
						type: 'Steel',
					},
				});
				this.add('-start', pokemon, 'Doom Desire', '[from] ability: Void Veil');
				this.add('-message', `Void Veil's Doom Desire will strike on turn ${target.side.slotConditions[target.position]['futuremove'].endingTurn}.`);
			}
		},
		onStart(pokemon) {
			pokemon.abilityState.voidShelterUsed = false;
			pokemon.abilityState.voidShelterDoom = false;
			pokemon.abilityState.voidVeilStartTurn = this.turn;
		},
		onTryHit(target, source, move) {
			if (target !== source && target.isAlly(source) && move.category !== 'Status') {
				this.add('-activate', target, 'ability: Void Veil');
				return null;
			}
		},
		onAnyBoost(boost, target, source, effect) {
			const pokemon = this.effectState.target;
			if (target === pokemon || target.isAlly(pokemon)) {
				if (boost.spe && boost.spe < 0) delete boost.spe;
			}
		},
		onBoost(boost, target, source, effect) {
			if (source && target === source) return;
			let stat: BoostID;
			for (stat in boost) {
				if (boost[stat]! < 0) delete boost[stat];
			}
		},
		onAnyDamage(damage, target, source, effect) {
			const pokemon = this.effectState.target;
			if (!pokemon || pokemon.fainted || pokemon.hp <= pokemon.maxhp / 4) return;
			if (!target || target === pokemon || !target.isAlly(pokemon) || !source || source === pokemon || source.isAlly(pokemon)) return;
			if (effect?.effectType !== 'Move' || typeof damage !== 'number' || target.hp <= 0 || damage < target.hp) return;
			this.add('-activate', pokemon, 'ability: Void Veil');
			pokemon.abilityState.voidShelterDoom = true;
			this.damage(damage, pokemon, source, effect);
			return false;
		},
		onResidual(pokemon) {
			this.heal(pokemon.baseMaxhp / 16, pokemon, pokemon);
			for (const ally of pokemon.allies()) {
				const shouldShelter = !pokemon.abilityState.voidShelterUsed && ally.hp > 0 && ally.hp <= ally.maxhp / 4;
				this.heal(ally.baseMaxhp / 16, ally, pokemon);
				if (shouldShelter) {
					pokemon.abilityState.voidShelterUsed = true;
					this.heal(ally.baseMaxhp / 4, ally, pokemon);
					ally.cureStatus();
					ally.addVolatile('voidshelter', pokemon);
				}
			}
			if (pokemon.abilityState.voidVeilStartTurn === this.turn) return;
			if (pokemon.abilityState.voidVeilLastCastTurn === this.turn - 1) return;
			this.effect.queueVoidFutureSight.call(this, pokemon);
			pokemon.abilityState.voidVeilLastCastTurn = this.turn;
		},
		onFaint(pokemon) {
			if (this.gameType === 'freeforall' || this.gameType !== 'singles' && pokemon.abilityState.voidShelterDoom) {
				this.effect.queueVoidDoomDesire.call(this, pokemon);
			}
		},
		condition: {
			duration: 2,
			onStart(target, source) {
				this.add('-start', target, 'ability: Void Veil');
			},
			onSetStatus(status, target, source, effect) {
				this.add('-immune', target, '[from] ability: Void Veil');
				return false;
			},
			onAnyRedirectTargetPriority: 3,
			onAnyRedirectTarget(target, source, source2, move) {
				if (move.category === 'Status') return;
				const sheltered = this.effectState.target;
				const guardian = this.effectState.source;
				if (!guardian || guardian.fainted || target !== sheltered || sheltered.isAlly(source)) return;
				if (!this.validTarget(guardian, source, move.target)) return;
				guardian.abilityState.voidShelterDoom = true;
				this.debug("Void Shelter redirected target of move");
				return guardian;
			},
		},
		flags: { breakable: 1 },
		name: "Void Veil",
		rating: 4.5,
		num: 10167,
	},
	accumulation: {
		onImmunity(type, pokemon) {
			if (type === 'sandstorm' || type === 'hail') return false;
		},
		onSourceModifyAtkPriority: 6,
		onSourceModifyAtk(atk, attacker, defender, move) {
			if (move && (this.movehasType(move, 'Ice') || this.movehasType(move, 'Fire'))) {
				this.debug('Accumulation Thick Fat weaken');
				return this.chainModify(0.5);
			}
		},
		onSourceModifySpAPriority: 5,
		onSourceModifySpA(spa, attacker, defender, move) {
			if (move && (this.movehasType(move, 'Ice') || this.movehasType(move, 'Fire'))) {
				this.debug('Accumulation Thick Fat weaken');
				return this.chainModify(0.5);
			}
		},
		onResidual(pokemon) {
			if (!pokemon.activeTurns) return;
			if (pokemon.abilityState.accumulationReleasedTurn === this.turn) return;
			const lastMove = pokemon.lastMove?.id;
			if (lastMove === 'spitup' || lastMove === 'swallow') return;
			if ((pokemon.volatiles['stockpile']?.layers || 0) < 3) {
				delete pokemon.abilityState.accumulationReadyTurn;
				pokemon.addVolatile('stockpile', pokemon);
				if ((pokemon.volatiles['stockpile']?.layers || 0) < 3) return;
			}
			if (pokemon.abilityState.accumulationReadyTurn === undefined) {
				pokemon.abilityState.accumulationReadyTurn = this.turn;
				return;
			}
			if (pokemon.abilityState.accumulationReadyTurn >= this.turn) return;
			if (pokemon.abilityState.accumulationLastAutoReleaseTurn === this.turn - 1) return;
			const release = chooseAccumulationRelease(this, pokemon);
			if (!release) return;
			this.add('-activate', pokemon, 'ability: Accumulation');
			pokemon.abilityState.accumulationAutoBelch = release.moveid === 'belch';
			pokemon.abilityState.accumulationAutoSpitUp = release.moveid === 'spitup';
			pokemon.abilityState.accumulationReleasedTurn = this.turn;
			pokemon.abilityState.accumulationLastAutoReleaseTurn = this.turn;
			pokemon.abilityState.accumulationScriptedReleaseTurn = this.turn;
			pokemon.abilityState.accumulationSuppressMoveChain = true;
			this.actions.useMove(release.moveid, pokemon, { target: release.target });
			if (release.moveid === 'spitup') {
				pokemon.removeVolatile('stockpile');
			} else {
				consumeAccumulationStockpileLayer(this, pokemon);
			}
			pokemon.abilityState.accumulationSuppressMoveChain = false;
			pokemon.abilityState.accumulationAutoBelch = false;
			pokemon.abilityState.accumulationAutoSpitUp = false;
			pokemon.abilityState.accumulationNoBelchAfterSpitUp = false;
			pokemon.abilityState.accumulationNoSpitUpAfterBelch = false;
			pokemon.abilityState.accumulationBelchTarget = null;
		},
		flags: { breakable: 1 },
		name: "Accumulation",
		rating: 3,
		num: 10143,
	},
	adaptivecell: {
		onImmunity(type, pokemon) {
			if (type === 'sandstorm' || type === 'hail' || type === 'powder') return false;
		},
		onTryHitPriority: 1,
		onTryHit(target, source, move) {
			if (move.flags['powder'] && target !== source && this.dex.getImmunity('powder', target)) {
				this.add('-immune', target, '[from] ability: Adaptive Cell');
				return null;
			}
		},
		onBeforeMove(pokemon, target, move) {
			if (!move || move.category === 'Status') return;
			const newType = move.category === 'Physical' ? 'Fighting' : 'Psychic';
			if (!pokemon.hasType(newType) && pokemon.setType(newType)) {
				this.add('-start', pokemon, 'typechange', newType, '[from] ability: Adaptive Cell');
			}
		},
		onModifyMove(move, pokemon) {
			if (move.category === 'Physical' && pokemon.getStat('spa', false, true) > pokemon.getStat('atk', false, true)) {
				move.overrideOffensiveStat = 'spa';
			}
		},
		flags: { breakable: 1 },
		name: "Adaptive Cell",
		rating: 4,
		num: 10163,
	},
	relicbeam: {
		onModifySpA(spa, pokemon) {
			return pokemon.getStat('def', false, true);
		},
		onBasePowerPriority: 21,
		onBasePower(basePower, pokemon, target, move) {
			const beamMoves = [
				'aurorabeam', 'bubblebeam', 'chargebeam', 'dynamaxcannon', 'eternabeam',
				'flashcannon', 'fleurcannon', 'icebeam', 'lusterpurge', 'meteorbeam',
				'moongeistbeam', 'psybeam', 'signalbeam', 'solarbeam', 'steelbeam',
			];
			if (beamMoves.includes(move.id) || move.flags['pulse'] || move.flags['bullet']) {
				this.debug('Relic Beam boost');
				return this.chainModify(1.5);
			}
		},
		flags: { breakable: 1 },
		name: "Relic Beam",
		rating: 4,
		num: 10164,
	},
	perfectforesight: {
		onStart(pokemon) {
			delete pokemon.m.perfectForesightAbility;
			delete pokemon.m.perfectForesightAbilityState;
			let best = null;
			let bestStat = -1;
			for (const target of pokemon.foes()) {
				const stat = Math.max(target.getStat('atk', false, true), target.getStat('spa', false, true));
				if (stat > bestStat) {
					best = target;
					bestStat = stat;
				}
			}
			if (best) {
				const ability = best.getAbility();
				pokemon.m.perfectForesightAbility = ability.id;
				pokemon.m.perfectForesightAbilityState = this.initEffectState({ id: ability.id, target: pokemon });
				this.add('-ability', pokemon, ability.name, '[from] ability: Perfect Foresight');
				this.singleEvent('Start', ability, pokemon.m.perfectForesightAbilityState, pokemon, best, this.effect);
			}
		},
		onAnyTryBoost(boost, target, source, effect) {
			const holder = this.effectState.target;
			if (!holder?.m?.perfectForesightAbility || holder.m.perfectForesightAbility !== 'royaldecree') return;
			if (this.getAllActive().some(pokemon => pokemon.hasAbility('neutralization'))) return;
			if (!effect || effect.id === 'royaldecree') return;
			if (effect.id === 'relicinstinct' || effect.id === 'neutralization') return;
			const isOnlyDrops = Object.values(boost).some(value => value && value < 0) &&
				!Object.values(boost).some(value => value && value > 0);
			if (isOnlyDrops && source === target && target === holder) return;
			const positiveBoost = Object.values(boost).some(value => value && value > 0);
			if (positiveBoost && target === source && effect.effectType === 'Ability') {
				const fieldAbilityBoosts: { [abilityid: string]: string[] } = {
					stalwart: ['newworldterrain', 'starlightarenaterrain', 'fairytaleterrain', 'chessboardterrain'],
					mirrorarmor: ['fairytaleterrain', 'mirrorarmor'],
					irondominion: ['fairytaleterrain', 'mirrorarmor'],
					relicarmor: ['desertterrain', 'fairytaleterrain', 'caveterrain', 'crystalcavernterrain', 'newworldterrain', 'volcanicterrain'],
					magician: ['fairytaleterrain', 'bewitchedwoodsterrain', 'hauntedterrain', 'mistyterrain', 'newworldterrain'],
				};
				const allowedFields = fieldAbilityBoosts[effect.id];
				if (allowedFields && this.field.isTerrain(allowedFields)) return;
			}
			const fieldEffect = effect.effectType === 'Field' || effect.effectType === 'Terrain';
			if (fieldEffect) return;
			let blocked = false;
			let stat: BoostID;
			for (stat in boost) {
				if (!boost[stat]) continue;
				delete boost[stat];
				blocked = true;
			}
			if (blocked) this.add('-message', `${holder.name}'s Royal Decree prevented the stat changes.`);
		},
		onDamagingHit(damage, target, source, move) {
			if (!source || source === target || target.isAlly(source) || move.flags['futuremove']) return;
			const slotCondition = source.side.slotConditions[source.position]['futuremove'];
			if (slotCondition) {
				this.add('-start', target, 'move: Future Sight', '[from] ability: Perfect Foresight', '[silent]');
				if (slotCondition.moveData?.perfectForesight) {
					slotCondition.perfectForesightQueued = (slotCondition.perfectForesightQueued || 1) + 1;
					this.add('-message', `Perfect Foresight queued another Future Sight after turn ${slotCondition.endingTurn}.`);
				} else {
					slotCondition.endingTurn = (slotCondition.endingTurn || this.turn) + 2;
					this.add('-message', `Perfect Foresight delayed Future Sight to turn ${slotCondition.endingTurn}.`);
				}
				return;
			}
			if (!source.side.addSlotCondition(source, 'futuremove')) return;
			Object.assign(source.side.slotConditions[source.position]['futuremove'], {
				move: 'futuresight',
				source: target,
				moveData: {
					id: 'futuresight',
					name: "Future Sight",
					accuracy: 100,
					basePower: 60,
					category: "Special",
					priority: 0,
					flags: { allyanim: 1, metronome: 1, futuremove: 1 },
					ignoreAbility: true,
					ignoreDefensive: true,
					ignoreImmunity: true,
					infiltrates: true,
					perfectForesight: true,
					effectType: 'Move',
					type: 'Psychic',
					onEffectiveness(typeMod: number, target: Pokemon, type: string) {
						if (type === 'Dark') return 0;
						return typeMod;
					},
				},
				perfectForesightQueued: 1,
			});
			this.add('-start', target, 'move: Future Sight', '[from] ability: Perfect Foresight');
			this.add('-message', `Perfect Foresight's Future Sight will strike on turn ${source.side.slotConditions[source.position]['futuremove'].endingTurn}.`);
		},
		onAfterMove(source, target, move) {
			if (move.id === 'futuresight' || move.flags['futuremove'] || move.callsMove) return;
			let targets = move.hitTargets?.length ? [...move.hitTargets] : target ? [target] : [];
			if (['allAdjacentFoes', 'allFoes', 'foeSide'].includes(move.target)) {
				targets = source.foes().filter(foe => foe);
			}
			for (const hitTarget of targets) {
				if (!hitTarget || hitTarget === source || source.isAlly(hitTarget)) continue;
				const slotCondition = hitTarget.side.slotConditions[hitTarget.position]['futuremove'];
				if (slotCondition) {
					this.add('-start', source, 'move: Future Sight', '[from] ability: Perfect Foresight', '[silent]');
					if (slotCondition.moveData?.perfectForesight) {
						slotCondition.perfectForesightQueued = (slotCondition.perfectForesightQueued || 1) + 1;
						this.add('-message', `Perfect Foresight queued another Future Sight after turn ${slotCondition.endingTurn}.`);
					} else {
						slotCondition.endingTurn = (slotCondition.endingTurn || this.turn) + 2;
						this.add('-message', `Perfect Foresight delayed Future Sight to turn ${slotCondition.endingTurn}.`);
					}
					continue;
				}
				if (!hitTarget.side.addSlotCondition(hitTarget, 'futuremove')) continue;
				Object.assign(hitTarget.side.slotConditions[hitTarget.position]['futuremove'], {
					move: 'futuresight',
					source,
					moveData: {
						id: 'futuresight',
						name: "Future Sight",
						accuracy: 100,
						basePower: 60,
						category: "Special",
						priority: 0,
						flags: { allyanim: 1, metronome: 1, futuremove: 1 },
						ignoreAbility: true,
						ignoreDefensive: true,
						ignoreImmunity: true,
						infiltrates: true,
						perfectForesight: true,
						effectType: 'Move',
						type: 'Psychic',
						onEffectiveness(typeMod: number, target: Pokemon, type: string) {
							if (type === 'Dark') return 0;
							return typeMod;
						},
					},
				});
				hitTarget.side.slotConditions[hitTarget.position]['futuremove'].perfectForesightQueued = 1;
				this.add('-start', source, 'move: Future Sight', '[from] ability: Perfect Foresight');
				this.add('-message', `Perfect Foresight's Future Sight will strike on turn ${hitTarget.side.slotConditions[hitTarget.position]['futuremove'].endingTurn}.`);
			}
		},
		onAnyFaint(fainted) {
			const pokemon = this.effectState.target;
			if (!pokemon || pokemon.fainted || fainted === pokemon) return;
			speedUpAbilityFutureSights(this, pokemon, 'perfectForesight');
		},
		flags: { breakable: 1 },
		name: "Perfect Foresight",
		rating: 5,
		num: 10114,
	},
	doomwarning: {
		onDamage(damage, target, source, effect) {
			return this.dex.abilities.get('magicguard').onDamage?.call(this, damage, target, source, effect);
		},
		onTryHitPriority: 1,
		onTryHit(target, source, move) {
			return this.dex.abilities.get('magicbounce').onTryHit?.call(this, target, source, move);
		},
		onAllyTryHitSide(target, source, move) {
			return this.dex.abilities.get('magicbounce').onAllyTryHitSide?.call(this, target, source, move);
		},
		queueDoomFutureSight(source, target) {
			const slotCondition = target.side.slotConditions[target.position]['futuremove'];
			if (slotCondition) {
				this.add('-start', source, 'move: Future Sight', '[from] ability: Doom Warning', '[silent]');
				if (slotCondition.moveData?.perfectForesight) {
					slotCondition.perfectForesightQueued = (slotCondition.perfectForesightQueued || 1) + 1;
					const queuedTurn = slotCondition.endingTurn + slotCondition.perfectForesightQueued - 1;
					this.add('-message', `Doom Warning queued another Future Sight for turn ${queuedTurn}.`);
				} else {
					slotCondition.endingTurn = (slotCondition.endingTurn || this.turn) + 2;
					this.add('-message', `Doom Warning delayed Future Sight to turn ${slotCondition.endingTurn}.`);
				}
				return;
			}
			if (!target.side.addSlotCondition(target, 'futuremove')) return;
			Object.assign(target.side.slotConditions[target.position]['futuremove'], {
				move: 'futuresight',
				source,
				moveData: {
					id: 'futuresight',
					name: "Future Sight",
					accuracy: 100,
					basePower: 60,
					category: "Special",
					priority: 0,
					flags: { allyanim: 1, metronome: 1, futuremove: 1 },
					ignoreAbility: true,
					ignoreDefensive: true,
					ignoreImmunity: true,
					infiltrates: true,
					perfectForesight: true,
					effectType: 'Move',
					type: 'Psychic',
					onEffectiveness(typeMod: number, target: Pokemon, type: string) {
						if (type === 'Dark') return 0;
						return typeMod;
					},
				},
				perfectForesightQueued: 1,
			});
			this.add('-start', source, 'move: Future Sight', '[from] ability: Doom Warning');
			this.add('-message', `Doom Warning's Future Sight will strike on turn ${target.side.slotConditions[target.position]['futuremove'].endingTurn}.`);
		},
		onAfterMove(source, target, move) {
			if (move.category === 'Status' || move.id === 'futuresight' || move.flags['futuremove'] || move.callsMove) return;
			let targets = move.hitTargets?.length ? [...move.hitTargets] : target ? [target] : [];
			if (['allAdjacentFoes', 'allFoes', 'foeSide'].includes(move.target)) {
				targets = source.foes().filter(foe => foe);
			}
			for (const hitTarget of targets) {
				if (!hitTarget || hitTarget === source || source.isAlly(hitTarget)) continue;
				this.effect.queueDoomFutureSight.call(this, source, hitTarget);
			}
		},
		onFaint(pokemon) {
			this.add('-message', `${pokemon.name} has warned you of doom.`);
			for (const target of pokemon.foes()) {
				if (!target || target.fainted) continue;
				const slotCondition = target.side.slotConditions[target.position]['futuremove'];
				if (slotCondition) {
					slotCondition.endingTurn = (slotCondition.endingTurn || this.turn) + 2;
					this.add('-message', `Doom Warning delayed Doom Desire to turn ${slotCondition.endingTurn}.`);
					continue;
				}
				if (!target.side.addSlotCondition(target, 'futuremove', pokemon, this.dex.abilities.get('doomwarning'))) continue;
				Object.assign(target.side.slotConditions[target.position]['futuremove'], {
					move: 'doomdesire',
					source: pokemon,
					moveData: {
						id: 'doomdesire',
						name: "Doom Desire",
						accuracy: 100,
						basePower: 140,
						category: "Special",
						priority: 0,
						flags: { metronome: 1, futuremove: 1 },
						effectType: 'Move',
						type: 'Steel',
					},
				});
				this.add('-start', pokemon, 'Doom Desire', '[from] ability: Doom Warning');
				this.add('-message', `Doom Warning's Doom Desire will strike on turn ${target.side.slotConditions[target.position]['futuremove'].endingTurn}.`);
			}
		},
		flags: { breakable: 1 },
		name: "Doom Warning",
		rating: 5,
		num: 10115,
	},
	perfectego: {
		onStart(pokemon) {
			if (this.field.isTerrain('bewitchedwoodsterrain')) return;
			this.add('-ability', pokemon, 'Perfect Ego');
			pokemon.abilityState.ultraEgoDefBoosted = false;
			pokemon.abilityState.ultraEgoSpDBoosted = false;
			pokemon.abilityState.ultraEgoPinch = false;
			pokemon.abilityState.ultraEgoHitTriggered = false;
		},
		boostedField() {
			return this.field.isTerrain(['ashenbeachterrain', 'newworldterrain', 'starlightarenaterrain', 'holyterrain', 'coldeclipseterrain', 'fairytaleterrain']);
		},
		healUltraEgo(pokemon, source) {
			if (this.field.isTerrain('bewitchedwoodsterrain')) return;
			if (source === 'hit' && (this.dex.abilities.get('ultraego') as any).boostedField.call(this) && !pokemon.abilityState.ultraEgoPinch && pokemon.hp > 0 && pokemon.hp <= pokemon.maxhp / 2) {
				pokemon.abilityState.ultraEgoPinch = true;
				this.heal(pokemon.baseMaxhp / 4, pokemon, pokemon);
				return;
			}
			this.heal(pokemon.baseMaxhp / 16, pokemon, pokemon);
		},
		onAnyAccuracy(accuracy, target, source, move) {
			if (source === this.effectState.target) return true;
		},
		onModifyMove(move) {
			if (this.field.isTerrain('bewitchedwoodsterrain')) return;
			move.ignoreAbility = true;
		},
		onAfterMove(source, target, move) {
			if (this.field.isTerrain('bewitchedwoodsterrain')) return;
			if (move.category !== 'Status') source.abilityState.ultraEgoHitTriggered = false;
		},
		onBasePowerPriority: 21,
		onBasePower(basePower, source, target, move) {
			if (this.field.isTerrain('bewitchedwoodsterrain')) return;
			if (move.category === 'Status') return;
			if (target?.hasAbility('battlebond')) return;
			if (!this.getAllActive().some(pokemon => pokemon.hasAbility('neutralization')) && this.getAllActive().some(pokemon => pokemon.hasAbility(['royaldecree', 'royalsun']))) return this.chainModify(1.3);
			if (target && (this.queue.willMove(target) || target.newlySwitched)) return this.chainModify(1.2);
		},
		onSourceModifyDamage(damage, source, target, move) {
			if (this.field.isTerrain('bewitchedwoodsterrain')) return;
			if (!move || move.category === 'Status') return;
			if (!this.getAllActive().some(pokemon => pokemon.hasAbility('neutralization')) && this.getAllActive().some(pokemon => pokemon.hasAbility(['royaldecree', 'royalsun']))) return this.chainModify(0.7);
			return;
		},
		onSourceDamagingHit(damage, target, source, move) {
			if (this.field.isTerrain('bewitchedwoodsterrain')) return;
			if (!move || move.category === 'Status') return;
			if (source.abilityState.ultraEgoAttackHealTurn === this.turn) return;
			source.abilityState.ultraEgoAttackHealTurn = this.turn;
			(this.dex.abilities.get('ultraego') as any).healUltraEgo.call(this, source, 'attack');
		},
		onDamagingHit(damage, target, source, move) {
			if (this.field.isTerrain('bewitchedwoodsterrain')) return;
			if (!source || target.isAlly(source) || !move || move.category === 'Status') return;
			if (target.abilityState.ultraEgoHitTriggered) {
				this.heal(target.baseMaxhp / 20, target, target);
				return;
			}
			target.abilityState.ultraEgoHitTriggered = true;
			this.boost({ atk: 1, spa: 1 }, target, target);
			if ((this.dex.abilities.get('ultraego') as any).boostedField.call(this)) {
				if (move.category === 'Physical' && !target.abilityState.ultraEgoDefBoosted) {
					target.abilityState.ultraEgoDefBoosted = true;
					this.boost({ def: 1 }, target, target);
				}
				if (move.category === 'Special' && !target.abilityState.ultraEgoSpDBoosted) {
					target.abilityState.ultraEgoSpDBoosted = true;
					this.boost({ spd: 1 }, target, target);
				}
			}
			(this.dex.abilities.get('ultraego') as any).healUltraEgo.call(this, target, 'hit');
		},
		flags: {},
		name: "Perfect Ego",
		rating: 5,
		num: 10116,
	},
	heavenlychorus: {
		onModifyTypePriority: -1,
		onModifyType(move, pokemon) {
			const noModifyType = [
				'judgment', 'multiattack', 'naturalgift', 'revelationdance', 'technoblast', 'terrainpulse', 'weatherball',
			];
			if (move.type === 'Normal' && (!noModifyType.includes(move.id) || this.activeMove?.isMax) &&
				!(move.isZ && move.category !== 'Status') && !(move.name === 'Tera Blast' && pokemon.terastallized)) {
				move.type = 'Fairy';
				move.typeChangerBoosted = this.effect;
			}
		},
		onBasePowerPriority: 23,
		onBasePower(basePower, pokemon, target, move) {
			if (move.typeChangerBoosted === this.effect) return this.chainModify(1.2);
		},
		onSourceModifyDamage(damage, source, target, move) {
			return this.dex.abilities.get('fluffy').onSourceModifyDamage?.call(this, damage, source, target, move);
		},
		suppressWeather: true,
		flags: { breakable: 1 },
		name: "Heavenly Chorus",
		rating: 5,
		num: 10115,
	},
	mourningsnow: {
		onStart(source) {
			if (this.field.setWeather('hail', source, this.dex.abilities.get('mourningsnow'))) {
				this.field.weatherState.duration = 8;
			}
		},
		onResidual(pokemon) {
			if (!['hail', 'snow'].includes(pokemon.effectiveWeather())) return;
			this.heal(pokemon.baseMaxhp / 16, pokemon, pokemon);
			for (const target of pokemon.foes()) {
				if (!target.hasType('Ice') && this.randomChance(3, 10)) target.trySetStatus('frz', pokemon);
			}
		},
		onFaint(pokemon) {
			for (const foe of pokemon.foes()) {
				if (!foe.fainted) foe.addVolatile('curse', pokemon, this.dex.abilities.get('mourningsnow'));
			}
		},
		onAnyFaint(target, source, effect) {
			const pokemon = this.effectState.target;
			if (!pokemon || pokemon === target || pokemon.fainted) return;
			const doubled =
				effect?.id === 'hail' ||
				effect?.id === 'snow' ||
				effect?.id === 'curse' ||
				(effect?.effectType === 'Move' && this.movehasType(effect, 'Ice'));
			this.heal(pokemon.baseMaxhp / (doubled ? 4 : 8), pokemon, pokemon);
		},
		onDamagingHit(damage, target, source, move) {
			if (!move || move.category === 'Status') return;
			if (!source.volatiles['disable'] && !move.isMax && !move.flags['futuremove'] && move.id !== 'struggle') {
				this.add('-activate', target, 'ability: Mourning Snow');
				source.addVolatile('disable', target);
			}
		},
		flags: { breakable: 1 },
		name: "Mourning Snow",
		rating: 4.5,
		num: 10116,
	},
	venombastion: {
		onStart(pokemon) { return this.dex.abilities.get('dauntlessshield').onStart?.call(this, pokemon); },
		onBasePower(basePower, source, target, move) { if (this.movehasType(move, 'Bug')) return this.chainModify(1.5); },
		onResidual(pokemon) { this.dex.abilities.get('selfsufficient').onResidual?.call(this, pokemon); },
		flags: { breakable: 1 },
		name: "Venom Bastion",
		rating: 4,
		num: 10117,
	},
	rimeknuckle: {
		onBasePowerPriority: 8,
		onBasePower(basePower, source, target, move) {
			return this.dex.abilities.get('ironfist').onBasePower?.call(this, basePower, source, target, move);
		},
		onSourceModifyDamage(damage, source, target, move) {
			return this.dex.abilities.get('filter').onSourceModifyDamage?.call(this, damage, source, target, move);
		},
		onModifyMove(move) {
			if (move.category === 'Status') return;
			if (!move.secondaries) move.secondaries = [];
			move.secondaries.push({ chance: 40, status: 'frz' });
		},
		onSourceAfterFaint(length, target, source, effect) {
			if (effect?.effectType !== 'Move') return;
			const targetIsMega = !!(target.species.isMega || target.species.forme?.includes('Mega'));
			const targetIsGmax = !!(target.gigantamax || target.species.forme?.includes('Gmax'));
			const targetIsTera = !!target.terastallized || target.species.forme === 'Stellar';
			const targetHasZMove = !!target.getItem().zMove;
			const targetWasGimmick = !!(target as any).wasGimmickOnFaint || targetIsMega || targetIsGmax || targetIsTera || targetHasZMove;
			this.heal(source.baseMaxhp / (targetWasGimmick ? 4 : 8) * length, source, source);
		},
		flags: { breakable: 1 },
		name: "Rime Knuckle",
		rating: 4,
		num: 10118,
	},
	streettyrant: {
		onStart(pokemon) {
			for (const target of pokemon.foes()) {
				this.boost({ atk: -1 }, target, pokemon, null, true);
			}
		},
		onSwitchOut(pokemon) { return this.dex.abilities.get('regenerator').onSwitchOut?.call(this, pokemon); },
		onModifyMove(move) {
			if (move.category !== 'Status') move.ignoreAbility = true;
		},
		flags: { breakable: 1 },
		name: "Street Tyrant",
		rating: 4.5,
		num: 10119,
	},
	divineintervention: {
		onStart(pokemon) { this.dex.abilities.get('swornduty').onStart?.call(this, pokemon); },
		onAnyModifyDamage(damage, source, target, move) {
			if (target !== this.effectState.target && target.isAlly(this.effectState.target)) {
				this.debug('Divine Intervention Friend Guard weaken');
				return this.chainModify(0.75);
			}
		},
		onSwitchOut(pokemon) { return this.dex.abilities.get('regenerator').onSwitchOut?.call(this, pokemon); },
		flags: { breakable: 1 },
		name: "Divine Intervention",
		rating: 5,
		num: 10120,
	},
	mountainhunger: {
		onTryHitPriority: 1,
		onTryHit(target, source, move) {
			return this.dex.abilities.get('sapsipper').onTryHit?.call(this, target, source, move);
		},
		onAllyTryHitSide(target, source, move) {
			return this.dex.abilities.get('sapsipper').onAllyTryHitSide?.call(this, target, source, move);
		},
		onImmunity(type, pokemon) {
			if (type === 'hail') return false;
		},
		onSourceModifyAtkPriority: 6,
		onSourceModifyAtk(atk, attacker, defender, move) {
			if (move && this.movehasType(move, ['Fire', 'Ice'])) return this.chainModify(0.5);
		},
		onSourceModifySpAPriority: 5,
		onSourceModifySpA(atk, attacker, defender, move) {
			if (move && this.movehasType(move, ['Fire', 'Ice'])) return this.chainModify(0.5);
		},
		onDamage(damage, target, source, effect) {
			if (effect.effectType === 'Move' && target.getUndynamaxedHP(damage) >= target.hp) {
				this.effectState.gluttony = true;
			}
		},
		onTryEatItem(item, pokemon) {
			const healingItems = ['aguavberry', 'figyberry', 'iapapaberry', 'magoberry', 'sitrusberry', 'wikiberry'];
			return !healingItems.includes(item.id) || pokemon.hp <= pokemon.maxhp / 2 || this.effectState.gluttony;
		},
		onResidual(pokemon) {
			this.dex.abilities.get('sapsipper').onResidual?.call(this, pokemon);
		},
		flags: { breakable: 1 },
		name: "Mountain Hunger",
		rating: 4,
		num: 10050,
	},
	irondominion: {
		onStart(pokemon) {
			this.add('-ability', pokemon, 'Iron Dominion');
			const healAmount = this.field.isTerrain('fairytaleterrain') ? 3 : 4;
			for (const ally of pokemon.adjacentAllies()) {
				if (!ally.hp || ally.fainted) continue;
				this.add('-message', `${pokemon.name} shared its mead with ${ally.name}!`);
				this.heal(ally.baseMaxhp / healAmount, ally, pokemon);
			}
			if (this.field.isTerrain('fairytaleterrain') && !pokemon.abilityState.ironDominionFairyTaleBoosted) {
				pokemon.abilityState.ironDominionFairyTaleBoosted = true;
				this.boost({ def: 1, spd: 1 }, pokemon, pokemon, this.dex.abilities.get('irondominion'));
			}
			if (this.field.isTerrain('mirrorarmor')) {
				this.boost({ evasion: 1 }, pokemon, pokemon, this.dex.abilities.get('irondominion'));
			}
			const pressureDrop = this.field.isTerrain('coldeclipseterrain') ? -2 : -1;
			let pressureActivated = false;
			for (const target of pokemon.foes()) {
				if (!pressureActivated) {
					this.add('-ability', pokemon, 'Iron Dominion', 'boost');
					pressureActivated = true;
				}
				if (target.volatiles['substitute']) {
					this.add('-immune', target);
				} else {
					this.boost({ def: pressureDrop, spd: pressureDrop }, target, pokemon, null, true);
				}
			}
		},
		onDeductPP(target, source) {
			if (target.isAlly(source)) return;
			return 1;
		},
		onFoeTryMove(target, source, move) {
			if (this.field.isTerrain('starlightarenaterrain')) {
				const targetAllExceptions = ['perishsong', 'flowershield', 'rototiller'];
				if (move.target === 'foeSide' || (move.target === 'all' && !targetAllExceptions.includes(move.id))) {
					return;
				}
				const prideHolder = this.effectState.target;
				if ((source.isAlly(prideHolder) || move.target === 'all') && move.priority > 0.1) {
					this.attrLastMove('[still]');
					this.add('cant', prideHolder, 'ability: Iron Dominion', move, `[of] ${target}`);
					return false;
				}
			}
		},
		onTryBoost(boost, target, source, effect) {
			if (!source || target === source || !boost || effect.name === 'Iron Dominion') return;
			let b: BoostID;
			for (b in boost) {
				if (boost[b]! < 0) {
					if (target.boosts[b] === -6) continue;
					const negativeBoost: SparseBoostsTable = {};
					negativeBoost[b] = boost[b];
					delete boost[b];
					if (source.hp) {
						this.add('-ability', target, 'Iron Dominion');
						this.boost(negativeBoost, source, target, null, true);
					}
				}
			}
		},
		flags: { breakable: 1 },
		name: "Iron Dominion",
		rating: 4,
		num: 10051,
	},
	astralwatcher: {
		onModifyMove(move, source) { this.dex.abilities.get('defragment').onModifyMove?.call(this, move, source); },
		onStart(pokemon) {
			for (const target of pokemon.foes()) {
				if (target.item) {
					this.add('-item', target, target.getItem().name, '[from] ability: Astral Watcher', `[of] ${pokemon}`);
					if (this.randomChance(3, 10)) target.addVolatile('embargo');
				}
			}
		},
		onModifyPriority(priority, pokemon, target, move) {
			if (move?.category === 'Status') return priority + 1;
		},
		onTryHit(target, source, move) {
			if (target !== this.effectState.target && target.isAlly(this.effectState.target) && move.category !== 'Status') {
				return null;
			}
		},
		flags: { breakable: 1 },
		name: "Astral Watcher",
		rating: 4,
		num: 10052,
	},
	treasuretitan: {
		onSourceModifyDamage(damage, source, target, move) {
			if (target.getMoveHitData(move).typeMod > 0) return this.chainModify(0.75);
		},
		onTryHit(target, source, move) {
			if (target !== source && this.movehasType(move, 'Ground')) {
				if (!this.heal(target.baseMaxhp / 4)) this.add('-immune', target, '[from] ability: Treasure Titan');
				return null;
			}
		},
		flags: { breakable: 1 },
		name: "Treasure Titan",
		rating: 4,
		num: 10053,
	},
	ragingfists: {
		onModifyMove(move, pokemon) {
			this.dex.abilities.get('fightingfiend').onModifyMove?.call(this, move, pokemon);
			this.dex.abilities.get('hydrabond').onModifyMove?.call(this, move, pokemon);
			this.dex.abilities.get('scrappy').onModifyMove?.call(this, move, pokemon);
		},
		onSourceModifySecondaries(secondaries, target, source, move) {
			return this.dex.abilities.get('hydrabond').onSourceModifySecondaries?.call(this, secondaries, target, source, move);
		},
		onBasePower(basePower, source, target, move) {
			let modifier = 1;
			if (this.field.isTerrain('dragonsdenterrain')) modifier *= 1.2;
			if (move.multihit) modifier *= 1.5;
			if (modifier !== 1) return this.chainModify(modifier);
		},
		flags: { breakable: 1 },
		name: "Raging Fists",
		rating: 4.5,
		num: 10054,
	},
	warship: {
		onModifySpe(spe, pokemon) {
			if (['raindance', 'primordialsea'].includes(pokemon.effectiveWeather())) return this.chainModify(2);
		},
		onDamage(damage, target, source, effect) {
			if (effect?.id === 'recoil') return false;
		},
		onAnyModifyBoost(boosts, pokemon) {
			const unawareUser = this.effectState.target;
			if (unawareUser === pokemon) return;
			if (unawareUser === this.activePokemon && pokemon === this.activeTarget) {
				boosts['def'] = 0;
				boosts['spd'] = 0;
				boosts['evasion'] = 0;
			}
			if (pokemon === this.activePokemon && unawareUser === this.activeTarget) {
				boosts['atk'] = 0;
				boosts['def'] = 0;
				boosts['spa'] = 0;
				boosts['accuracy'] = 0;
			}
		},
		flags: { breakable: 1 },
		name: "War Ship",
		rating: 4,
		num: 10055,
	},
	furnaceengine: {
		onDamagingHit(damage, target, source, move) {
			this.dex.abilities.get('steamengine').onDamagingHit?.call(this, damage, target, source, move);
			this.dex.abilities.get('flamebody').onDamagingHit?.call(this, damage, target, source, move);
		},
		onStart(pokemon) { return this.dex.abilities.get('steamengine').onStart?.call(this, pokemon); },
		onResidual(pokemon) {
			this.dex.abilities.get('steamengine').onResidual?.call(this, pokemon);
			for (const target of pokemon.foes()) {
				if (!target || target.fainted || isImmuneToScalingChip(target, 'Fire')) continue;
				const typeMod = this.clampIntRange(this.dex.getEffectiveness('Fire', target.getTypes()), -6, 6);
				this.damage(target.baseMaxhp / 16 * Math.max(0.25, 2 ** typeMod), target, pokemon);
			}
		},
		flags: { breakable: 1 },
		name: "Furnace Engine",
		rating: 4,
		num: 10056,
	},
	duneterror: {
		onStart(source) {
			this.dex.abilities.get('sandstream').onStart?.call(this, source);
		},
		onResidualOrder: 5,
		onResidualSubOrder: 3,
		onResidual(pokemon) {
			this.dex.abilities.get('shedskin').onResidual?.call(this, pokemon);
			if (pokemon.effectiveWeather() !== 'sandstorm') return;
			for (const target of pokemon.foes()) {
				if (!target || target.fainted || isImmuneToScalingChip(target, 'Ground')) continue;
				const typeMod = this.clampIntRange(this.dex.getEffectiveness('Ground', target.getTypes()), -6, 6);
				this.damage(target.baseMaxhp / 16 * Math.max(0.25, 2 ** typeMod), target, pokemon);
			}
		},
		flags: { breakable: 1 },
		name: "Dune Terror",
		rating: 4,
		num: 10057,
	},
	heatcoil: {
		onResidual(pokemon) {
			this.dex.abilities.get('speedboost').onResidual?.call(this, pokemon);
		},
		onUpdate(pokemon) { return this.dex.abilities.get('magmaarmor').onUpdate?.call(this, pokemon); },
		onSourceModifyAtk(atk, attacker, defender, move) { return this.dex.abilities.get('magmaarmor').onSourceModifyAtk?.call(this, atk, attacker, defender, move); },
		onSourceModifySpA(spa, attacker, defender, move) { return this.dex.abilities.get('magmaarmor').onSourceModifySpA?.call(this, spa, attacker, defender, move); },
		flags: { breakable: 1 },
		name: "Heat Coil",
		rating: 3.5,
		num: 10058,
	},
	sweetsanctuary: {
		onAnyModifyDamage(damage, source, target, move) {
			const pokemon = this.effectState.target;
			if (move.category !== 'Status' && target !== pokemon && target.isAlly(pokemon)) return this.chainModify(0.75);
		},
		onAllySetStatus(status, target, source, effect) {
			if (status.id === 'slp') return null;
		},
		onAllyTryAddVolatile(status, target, source, effect) {
			if (['yawn', 'attract', 'disable', 'encore', 'healblock', 'taunt', 'torment'].includes(status.id)) return null;
		},
		flags: { breakable: 1 },
		name: "Sweet Sanctuary",
		rating: 3.5,
		num: 10059,
	},
	riptideclaws: {
		onModifySpe(spe, pokemon) {
			if (['raindance', 'primordialsea'].includes(pokemon.effectiveWeather())) return this.chainModify(2);
		},
		onBasePower(basePower, source, target, move) {
			return this.dex.abilities.get('toughclaws').onBasePower?.call(this, basePower, source, target, move);
		},
		onCriticalHit() {
			return false;
		},
		onSourceModifyDamage(damage, source, target, move) {
			return this.dex.abilities.get('shellarmor').onSourceModifyDamage?.call(this, damage, source, target, move);
		},
		onStart(pokemon) {
			return this.dex.abilities.get('shellarmor').onStart?.call(this, pokemon);
		},
		onAfterEachBoost(boost, target, source, effect) {
			return this.dex.abilities.get('shellarmor').onAfterEachBoost?.call(this, boost, target, source, effect);
		},
		flags: { breakable: 1 },
		name: "Riptide Claws",
		rating: 4,
		num: 10060,
	},
	dryskin: {
		onTryHit(target, source, move) {
			if (target !== source && this.movehasType(move, 'Water')) {
				if (!this.heal(target.baseMaxhp / 4)) {
					this.add('-immune', target, '[from] ability: Dry Skin');
				}
				return null;
			}
		},
		onSourceBasePowerPriority: 17,
		onSourceBasePower(basePower, attacker, defender, move) {
			if (move && this.movehasType(move, 'Fire')) {
				return this.chainModify(1.25);
			}
		},
		onWeather(target, source, effect) {
			if (target.effectiveWeather() !== effect.id) return;
			if (effect.id === 'raindance' || effect.id === 'primordialsea') {
				this.heal(target.baseMaxhp / 8);
			} else if (effect.id === 'sunnyday' || effect.id === 'desolateland') {
				this.damage(target.baseMaxhp / 8, target, target);
			}
		},
		onResidual(pokemon) {
			if (!this.field.isWeather('raindance') || !this.field.isWeather('sunnyday')) {
				if ((this.field.isTerrain('watersurfaceterrain') && pokemon.isGrounded()) || this.field.isTerrain('underwaterterrain') || this.field.isTerrain('swampterrain') || this.field.isTerrain('mistyterrain')) {
					this.heal(pokemon.baseMaxhp / 16);
				}
				if (this.field.isTerrain('corrosivemistterrain')) {
					if (pokemon.hasType("Poison")) {
						this.heal(pokemon.baseMaxhp / 8);
					} else if (!pokemon.hasType("Steel")) {
						this.damage(pokemon.baseMaxhp / 8, pokemon, pokemon);
					}
				}
				if (this.field.isTerrain('desertterrain')) {
					this.damage(pokemon.baseMaxhp / 8, pokemon, pokemon);
				}
				if (this.field.isTerrain('murkwatersurfaceterrain') && pokemon.isGrounded() && pokemon.hasType('Poison')) {
					this.heal(pokemon.baseMaxhp / 8);
				}
			}
		},
		flags: { breakable: 1 },
		name: "Dry Skin",
		rating: 3,
		num: 87,
	},
	duskilate: {
		onModifyTypePriority: -1,
		onModifyType(move, pokemon) {
			const noModifyType = [
				'judgment', 'multiattack', 'naturalgift', 'revelationdance', 'technoblast', 'terrainpulse', 'weatherball',
			];
			if (move && move.type === 'Normal' && !noModifyType.includes(move.id) &&
				!(move.isZ && move.category !== 'Status') && !(move.name === 'Tera Blast' && pokemon.terastallized)) {
				move.type = this.field.isTerrain(['holyterrain', 'rainbowterrain']) ? 'Fairy' : 'Dark';
				move.typeChangerBoosted = this.effect;
			}
		},
		onBasePowerPriority: 23,
		onBasePower(basePower, pokemon, target, move) {
			if (move.typeChangerBoosted === this.effect) {
				if (this.field.isTerrain(['darkcrystalcavernterrain', 'newworldterrain', 'starlightarenaterrain', 'coldeclipseterrain', 'shortcircuitterrain', 'hauntedterrain', 'bewitchedwoodsterrain', 'holyterrain', 'rainbowterrain'])) return this.chainModify(1.5);
				return this.chainModify(1.3);
			}
		},
		onImmunity(type, pokemon) {
			if (type === 'hail' && this.field.isTerrain('coldeclipseterrain')) return false;
		},
		flags: {},
		name: "Duskilate",
		rating: 4,
		num: 400,
	},
	execution: {
		onModifyTypePriority: -1,
		onModifyType(move, pokemon) {
			this.dex.abilities.get('duskilate').onModifyType?.call(this, move, pokemon);
		},
		onBasePowerPriority: 23,
		onBasePower(basePower, pokemon, target, move) {
			let modifier = 1;
			if (move.typeChangerBoosted === this.effect) {
				modifier *= this.field.isTerrain(['darkcrystalcavernterrain', 'newworldterrain', 'starlightarenaterrain', 'coldeclipseterrain', 'shortcircuitterrain', 'hauntedterrain', 'bewitchedwoodsterrain', 'holyterrain', 'rainbowterrain']) ? 1.5 : 1.3;
			}
			if (target && target.hp > 0 && target.hp <= target.maxhp / 2) modifier *= 2;
			if (modifier !== 1) return this.chainModify(modifier);
		},
		onTryBoost(boost, target, source, effect) {
			for (const stat of ['atk', 'spa'] as BoostID[]) {
				if (!boost[stat] || boost[stat]! >= 0) continue;
				const minDrop = -1 - target.boosts[stat];
				if (minDrop >= 0) {
					delete boost[stat];
				} else if (boost[stat]! < minDrop) {
					boost[stat] = minDrop;
				}
			}
			if (this.field.terrain && boost.spe && boost.spe < 0) delete boost.spe;
		},
		onSourceAfterFaint(length, target, source, effect) {
			if (effect?.effectType !== 'Move') return;
			this.heal(source.baseMaxhp / 8 * length, source, source);
		},
		onImmunity(type, pokemon) {
			if (type === 'hail' && this.field.isTerrain('coldeclipseterrain')) return false;
		},
		flags: { breakable: 1 },
		name: "Execution",
		rating: 4.5,
		num: 10198,
	},
	earlybird: {
		flags: {},
		name: "Early Bird",
		// Implemented in statuses.js
		rating: 1.5,
		num: 48,
	},
	eartheater: {
		onTryHit(target, source, move) {
			if (target !== source && this.movehasType(move, 'Ground')) {
				if (!this.heal(target.baseMaxhp / 4)) {
					this.add('-immune', target, '[from] ability: Earth Eater');
				}
				return null;
			}
		},
		onResidual(pokemon) {
			if (this.field.isTerrain('caveterrain') || this.field.isTerrain('desertterrain')) {
				this.add('-message', `${pokemon} swallowed the rocks!`);
				this.heal(pokemon.baseMaxhp / 16, pokemon);
			}
		},
		flags: { breakable: 1 },
		name: "Earth Eater",
		rating: 3.5,
		num: 297,
	},
	echofiend: {
		onTryHit(target, source, move) {
			if (target !== source && move.flags['sound']) {
				this.add('-immune', target, '[from] ability: Echo Fiend');
				return null;
			}
		},
		onAllyTryHitSide(target, source, move) {
			if (move.flags['sound']) {
				this.add('-immune', this.effectState.target, '[from] ability: Echo Fiend');
			}
		},
		onModifyTypePriority: -1,
		onModifyType(move, pokemon) {
			const noModifyType = [
				'judgment', 'multiattack', 'naturalgift', 'revelationdance', 'technoblast', 'terrainpulse', 'weatherball',
			];
			if (move.flags.sound && (!noModifyType.includes(move.id) || this.activeMove?.isMax) &&
				!(move.isZ && move.category !== 'Status') && !(move.name === 'Tera Blast' && pokemon.terastallized)) {
				if (this.field.isTerrain('volcanicterrain')) move.type = 'Fire';
				else if (this.field.isTerrain('crystalcavernterrain')) move.type = 'Crystal';
				else move.type = 'Flying';
				move.typeChangerBoosted = this.effect;
			}
		},
		onBasePowerPriority: 23,
		onBasePower(basePower, pokemon, target, move) {
			if (move.flags['sound']) {
				if (this.field.isTerrain(['caveterrain', 'volcanicterrain', 'crystalcavernterrain'])) return this.chainModify(2);
				if (this.field.isTerrain(['mountainterrain', 'snowymountainterrain'])) return this.chainModify(1.5);
				return this.chainModify(1.5);
			}
		},
		onAnyTryHit(target, source, move) {
			const pokemon = this.effectState.target;
			if (!target || !source || !move.flags['sound'] || move.category === 'Status') return;
			if (source.isAlly(pokemon) && target.isAlly(pokemon) && target !== source) {
				this.add('-immune', target, '[from] ability: Echo Fiend');
				return null;
			}
		},
		flags: { cantsuppress: 1 },
		name: "Echo Fiend",
		rating: 4,
		num: 10006,
	},
	effectspore: {
		onDamagingHit(damage, target, source, move) {
			if (source.runStatusImmunity('powder')) {
				const r = this.random(100);
				if (r < 10) {
					const sleepClauseActive = this.ruleTable.has('sleepclausemod') || this.ruleTable.has('stadiumsleepclause');
					const hasClauseSleep = source.side.pokemon.some(pokemon =>
						pokemon.hp && pokemon.status === 'slp' && !pokemon.statusState.source?.isAlly(pokemon)
					);
					if (!source.setStatus('slp', target) && sleepClauseActive && hasClauseSleep) {
						// Sleep Clause rejected the roll: reroll the Effect Spore outcome without Sleep.
						const reroll = this.random(9);
						if (reroll === 0) source.setStatus('par', target);
						else if (reroll === 1) source.setStatus('psn', target);
					}
				} else if (r < 20) {
					source.setStatus('par', target);
				} else if (r < 30) {
					source.setStatus('psn', target);
				}
			}
		},
		flags: {},
		name: "Effect Spore",
		rating: 2,
		num: 27,
	},
	electricsurge: {
		onStart(source) {
			if (this.field.setTerrain('electricterrain')) {
				this.field.terrainState.duration = 3;
			}
		},
		flags: {},
		name: "Electric Surge",
		rating: 4,
		num: 226,
	},
	electromorphosis: {
		onDamagingHitOrder: 1,
		onDamagingHit(damage, target, source, move) {
			target.addVolatile('charge');
			if (this.field.isTerrain(['factoryterrain', 'shortcircuitterrain'])) {
				this.boost({ spd: 1 });
			}
		},
		flags: {},
		name: "Electromorphosis",
		rating: 3,
		num: 280,
	},
	embodyaspectcornerstone: {
		onStart(pokemon) {
			if (pokemon.baseSpecies.name === 'Ogerpon-Cornerstone-Tera' && pokemon.terastallized &&
				!this.effectState.embodied) {
				this.effectState.embodied = true;
				this.boost({ def: 1 }, pokemon);
			}
		},
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, notransform: 1 },
		name: "Embody Aspect (Cornerstone)",
		rating: 3.5,
		num: 304,
	},
	embodyaspecthearthflame: {
		onStart(pokemon) {
			if (pokemon.baseSpecies.name === 'Ogerpon-Hearthflame-Tera' && pokemon.terastallized &&
				!this.effectState.embodied) {
				this.effectState.embodied = true;
				this.boost({ atk: 1 }, pokemon);
			}
		},
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, notransform: 1 },
		name: "Embody Aspect (Hearthflame)",
		rating: 3.5,
		num: 303,
	},
	embodyaspectteal: {
		onStart(pokemon) {
			if (pokemon.baseSpecies.name === 'Ogerpon-Teal-Tera' && pokemon.terastallized &&
				!this.effectState.embodied) {
				this.effectState.embodied = true;
				this.boost({ spe: 1 }, pokemon);
			}
		},
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, notransform: 1 },
		name: "Embody Aspect (Teal)",
		rating: 3.5,
		num: 301,
	},
	embodyaspectwellspring: {
		onStart(pokemon) {
			if (pokemon.baseSpecies.name === 'Ogerpon-Wellspring-Tera' && pokemon.terastallized &&
				!this.effectState.embodied) {
				this.effectState.embodied = true;
				this.boost({ spd: 1 }, pokemon);
			}
		},
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, notransform: 1 },
		name: "Embody Aspect (Wellspring)",
		rating: 3.5,
		num: 302,
	},
	emergencyexit: {
		onEmergencyExit(target) {
			if (!this.canSwitch(target.side) || target.forceSwitchFlag || target.switchFlag) return;
			for (const side of this.sides) {
				for (const active of side.active) {
					active.switchFlag = false;
				}
			}
			target.switchFlag = true;
			this.add('-activate', target, 'ability: Emergency Exit');
		},
		flags: {},
		name: "Emergency Exit",
		rating: 1,
		num: 194,
	},
	eternalflower: {
		onModifyAtkPriority: 5,
		onModifyAtk(atk, attacker, defender, move) {
			let modifier = 1;
			if (this.field.isTerrain('fairytaleterrain')) {
				this.debug('Eternal Flower double boost');
				modifier = 2;
			}
			if (move && this.movehasType(move, 'Grass')) {
				this.debug('Eternal Flower boost');
				modifier *= 1.5;
			}
			return this.chainModify(modifier);
		},
		onModifySpAPriority: 5,
		onModifySpA(atk, attacker, defender, move) {
			let modifier = 1;
			if (this.field.isTerrain('fairytaleterrain')) {
				this.debug('Eternal Flower double boost');
				modifier = 2;
			}
			if (move && this.movehasType(move, 'Grass')) {
				this.debug('Eternal Flower boost');
				modifier *= 1.5;
			}
			return this.chainModify(modifier);
		},
		onFoeModifyAtk(atk, pokemon) {
			if (!(pokemon.gigantamax || pokemon.species.forme === 'Mega' || pokemon.terastallized || pokemon.species.forme === 'Stellar' || pokemon.species.tags.includes("Ultra Beast"))) return;
			this.debug('Eternal Flower drop');
			return this.chainModify(0.7);
		},
		onFoeModifyDef(def, pokemon) {
			if (!(pokemon.gigantamax || pokemon.species.forme === 'Mega' || pokemon.terastallized || pokemon.species.forme === 'Stellar' || pokemon.species.tags.includes("Ultra Beast"))) return;
			this.debug('Eternal Flower drop');
			return this.chainModify(0.7);
		},
		onFoeModifySpe(spe, pokemon) {
			if (!(pokemon.gigantamax || pokemon.species.forme === 'Mega' || pokemon.terastallized || pokemon.species.forme === 'Stellar' || pokemon.species.tags.includes("Ultra Beast"))) return;
			this.debug('Eternal Flower drop');
			return this.chainModify(0.7);
		},
		onFoeModifySpA(spa, pokemon) {
			if (!(pokemon.gigantamax || pokemon.species.forme === 'Mega' || pokemon.terastallized || pokemon.species.forme === 'Stellar' || pokemon.species.tags.includes("Ultra Beast"))) return;
			this.debug('Eternal Flower drop');
			return this.chainModify(0.7);
		},
		onFoeModifySpD(spd, pokemon) {
			if (!(pokemon.gigantamax || pokemon.species.forme === 'Mega' || pokemon.terastallized || pokemon.species.forme === 'Stellar' || pokemon.species.tags.includes("Ultra Beast"))) return;
			this.debug('Eternal Flower drop');
			return this.chainModify(0.7);
		},
		onFaint(pokemon) {
			if (this.field.setTerrain('bewitchedwoodsterrain', pokemon, this.dex.abilities.get('eternalflower'))) {
				this.field.terrainState.duration = 5;
			}
		},
		flags: {},
		name: "Eternal Flower",
		rating: 3.5,
		num: 276,
	},
	ange: {
		onStart(pokemon) {
			if (this.suppressingAbility(pokemon)) return;
			this.add('-ability', pokemon, 'Ange');
		},
		onDamage(damage, target, source, effect) {
			return this.dex.abilities.get('magicguard').onDamage?.call(this, damage, target, source, effect);
		},
		onModifyMove(move) {
			if (this.field.isTerrain('fairytaleterrain')) move.accuracy = true;
		},
		onAnyBasePowerPriority: 20,
		onAnyBasePower(basePower, source, target, move) {
			if (target === source || move.category === 'Status' || !this.movehasType(move, 'Fairy')) return;
			if (!move.auraBooster?.hasAbility('Ange')) move.auraBooster = this.effectState.target;
			if (move.auraBooster !== this.effectState.target) return;
			return this.chainModify([move.hasAuraBreak ? 3072 : 5448, 4096]);
		},
		onModifyAtkPriority: 5,
		onModifyAtk(atk, attacker, defender, move) {
			let modifier = 1;
			if (this.field.isTerrain('fairytaleterrain')) modifier = 2;
			if (move && this.movehasType(move, 'Grass')) modifier *= 1.5;
			return this.chainModify(modifier);
		},
		onModifySpAPriority: 5,
		onModifySpA(spa, attacker, defender, move) {
			let modifier = 1;
			if (this.field.isTerrain('fairytaleterrain')) modifier = 2;
			if (move && this.movehasType(move, 'Grass')) modifier *= 1.5;
			return this.chainModify(modifier);
		},
		onFoeModifyAtk(atk, pokemon) {
			if (!(pokemon.gigantamax || pokemon.species.forme === 'Mega' || pokemon.terastallized || pokemon.species.forme === 'Stellar' || pokemon.species.tags.includes("Ultra Beast"))) return;
			return this.chainModify(0.7);
		},
		onFoeModifyDef(def, pokemon) {
			if (!(pokemon.gigantamax || pokemon.species.forme === 'Mega' || pokemon.terastallized || pokemon.species.forme === 'Stellar' || pokemon.species.tags.includes("Ultra Beast"))) return;
			return this.chainModify(0.7);
		},
		onFoeModifySpe(spe, pokemon) {
			if (!(pokemon.gigantamax || pokemon.species.forme === 'Mega' || pokemon.terastallized || pokemon.species.forme === 'Stellar' || pokemon.species.tags.includes("Ultra Beast"))) return;
			return this.chainModify(0.7);
		},
		onFoeModifySpA(spa, pokemon) {
			if (!(pokemon.gigantamax || pokemon.species.forme === 'Mega' || pokemon.terastallized || pokemon.species.forme === 'Stellar' || pokemon.species.tags.includes("Ultra Beast"))) return;
			return this.chainModify(0.7);
		},
		onFoeModifySpD(spd, pokemon) {
			if (!(pokemon.gigantamax || pokemon.species.forme === 'Mega' || pokemon.terastallized || pokemon.species.forme === 'Stellar' || pokemon.species.tags.includes("Ultra Beast"))) return;
			return this.chainModify(0.7);
		},
		onFaint(pokemon) {
			if (this.field.setTerrain('bewitchedwoodsterrain', pokemon, this.dex.abilities.get('ange'))) {
				this.field.terrainState.duration = 5;
			}
		},
		flags: {},
		name: "Ange",
		rating: 5,
		num: 10130,
	},
	fairyaura: {
		onStart(pokemon) {
			if (this.suppressingAbility(pokemon)) return;
			this.add('-ability', pokemon, 'Fairy Aura');
		},
		onModifyMove(move) {
			if (this.field.isTerrain('fairytaleterrain'))
				move.accuracy = true;
		},
		onAnyBasePowerPriority: 20,
		onAnyBasePower(basePower, source, target, move) {
			if (target === source || move.category === 'Status' || !this.movehasType(move, 'Fairy')) return;
			if (!move.auraBooster?.hasAbility('Fairy Aura')) move.auraBooster = this.effectState.target;
			if (move.auraBooster !== this.effectState.target) return;
			return this.chainModify([move.hasAuraBreak ? 3072 : 5448, 4096]);
		},
		flags: {},
		name: "Fairy Aura",
		rating: 3,
		num: 187,
	},
	filter: {
		onSourceModifyDamage(damage, source, target, move) {
			let modifier = 0.8;
			if (target.getMoveHitData(move).typeMod > 0) {
				this.debug('Filter neutralize');
				modifier *= 0.75;
			}
			return this.chainModify(modifier);
		},
		flags: { breakable: 1 },
		name: "Filter",
		rating: 3,
		num: 111,
	},
	byxbysiontouch: {
		onDamagingHit(damage, target, source, move) { return this.dex.abilities.get('poisontouch').onDamagingHit?.call(this, damage, target, source, move); },
		onModifyMove(move) {
			if (move.category === 'Status') return;
			if (this.movehasType(move, 'Poison')) {
				move.drain = [1, 2];
			}
		},
		onSourceModifyDamage(damage, source, target, move) {
			if (this.movehasType(move, 'Ground')) {
				this.debug('Byxbysion Touch weaken');
				return this.chainModify(0.5);
			}
		},
		flags: { breakable: 1 },
		name: "Byxbysion Touch",
		rating: 4,
		num: 10203,
	},
	ascendance: {
		onImmunity(type, pokemon) {
			if (type === 'sandstorm' || type === 'hail' || type === 'powder') return false;
		},
		onTryHitPriority: 1,
		onTryHit(target, source, move) {
			if (move.flags['powder'] && target !== source && this.dex.getImmunity('powder', target)) {
				this.add('-immune', target, '[from] ability: Ascendance');
				return null;
			}
		},
		onModifyMove(move, pokemon) {
			if (move.category !== 'Status') move.ignoreImmunity = true;
		},
		onBasePowerPriority: 19,
		onBasePower(basePower, pokemon, target, move) {
			if (move.category !== 'Status' && !pokemon.hasType(move.type)) {
				return this.chainModify(1.5);
			}
		},
		flags: { breakable: 1 },
		name: "Ascendance",
		rating: 5,
		num: 10131,
	},
	mindfreeze: {
		onTryHit(target, source, move) {
			if (target !== source && this.movehasType(move, 'Ice')) {
				this.heal(target.baseMaxhp / 4, target, source);
				return null;
			}
		},
		onWeather(target, source, effect) {
			if (effect.id === 'hail' || effect.id === 'snow') {
				if (effect.id === 'hail' && this.field.isTerrain('coldeclipseterrain')) {
					this.heal(target.baseMaxhp / 8);
					return;
				}
				this.heal(target.baseMaxhp / 16);
			}
		},
		onResidual(pokemon) {
			if ((this.field.isTerrain(['icyterrain', 'snowymountainterrain', 'coldeclipseterrain'])) && !(this.field.isWeather(['hail', 'snow']))) {
				this.heal(pokemon.baseMaxhp / 16);
			}
		},
		onImmunity(type, pokemon) {
			if (type === 'hail') return false;
		},
		onModifyMove(move) {
			if (move.id === 'freezingglare') {
				for (const secondary of move.secondaries || []) {
					if (secondary.status === 'frz' && secondary.chance) secondary.chance *= 2;
				}
			} else if (this.movehasType(move, 'Psychic')) {
				if (!move.secondaries) move.secondaries = [];
				move.secondaries.push({ chance: 40, status: 'frz' });
			}
			if (this.movehasType(move, 'Ice') && move.category === 'Physical') {
				move.category = 'Special';
			}
		},
		flags: {},
		name: "Mind Freeze",
		rating: 4,
		num: 10132,
	},
	riotamp: {
		onModifyTypePriority: -1,
		onModifyType(move, pokemon) {
			const noModifyType = [
				'judgment', 'multiattack', 'naturalgift', 'revelationdance', 'technoblast', 'terrainpulse', 'weatherball',
			];
			if (move.type === 'Normal' && (!noModifyType.includes(move.id) || this.activeMove?.isMax) &&
				!(move.isZ && move.category !== 'Status') && !(move.name === 'Tera Blast' && pokemon.terastallized)) {
				move.type = 'Electric';
				move.typeChangerBoosted = this.effect;
			}
		},
		onBasePowerPriority: 23,
		onBasePower(basePower, pokemon, target, move) {
			let modifier = 1;
			if (move.typeChangerBoosted === this.effect) modifier *= 1.2;
			if (move.flags['sound']) modifier *= 1.3;
			if (modifier !== 1) return this.chainModify(modifier);
		},
		flags: {},
		name: "Riot Amp",
		rating: 5,
		num: 10133,
	},
	relicarmor: {
		onStart(pokemon) {
			if (this.field.isTerrain(['desertterrain', 'fairytaleterrain', 'caveterrain', 'crystalcavernterrain', 'newworldterrain', 'volcanicterrain'])) {
				this.boost({ def: 1, spd: 1 }, pokemon, pokemon, this.dex.abilities.get('relicarmor'));
			}
			const drop = this.field.isTerrain('coldeclipseterrain') ? -2 : -1;
			let activated = false;
			for (const target of pokemon.foes()) {
				if (!activated) {
					this.add('-ability', pokemon, 'Relic Armor', 'boost');
					activated = true;
				}
				this.boost({ def: drop, spd: drop }, target, pokemon, null, true);
			}
		},
		onCriticalHit() {
			return false;
		},
		onAfterBoost(boost, target, source, effect) {
			if (!source || source === target || source.isAlly(target)) return;
			let lowered = false;
			let stat: BoostID;
			for (stat in boost) {
				if (boost[stat]! < 0) lowered = true;
			}
			if (lowered) this.boost({ def: 1, spd: 1 }, target, target);
		},
		onSourceModifyDamage(damage, source, target, move) {
			if (move.category !== 'Status') return this.chainModify(0.8);
		},
		onDeductPP(target, source) {
			if (target.isAlly(source)) return;
			return 1;
		},
		flags: {},
		name: "Relic Armor",
		rating: 5,
		num: 10134,
	},
	windysurge: {
		onStart(pokemon) {
			const started = pokemon.side.addSideCondition('tailwind', pokemon);
			if (pokemon.side.sideConditions['tailwind']) pokemon.side.sideConditions['tailwind'].duration = 2;
			if (!started) {
				for (const ally of pokemon.side.active) {
					if (!ally || ally.fainted) continue;
					if (ally.hasAbility(['windpower', 'hisuianvanguard'])) this.boost({ spa: 1 }, ally, pokemon);
					if (ally.hasAbility(['windrider', 'unovavanguard', 'scarecrow'])) this.boost({ atk: 1 }, ally, pokemon);
				}
			}
			if (this.field.isTerrain(['mountainterrain', 'snowymountainterrain', 'coldeclipseterrain']) &&
				!this.field.isWeather(['desolateland', 'primordialsea'])) {
				this.field.setWeather('deltastream', pokemon, this.dex.moves.get('tailwind'));
			}
		},
		flags: {},
		name: "Windy Surge",
		rating: 4,
		num: 10135,
	},
	flamebody: {
		onStart(pokemon) {
			if (this.field.isTerrain('coldeclipseterrain')) {
				this.boost({ def: 1, spd: 1 }, pokemon, pokemon);
			}
		},
		onDamagingHit(damage, target, source, move) {
			let probability = 3;
			if (this.field.isTerrain('volcanicterrain')) {
				probability = 6;
			}
			if (this.checkMoveMakesContact(move, source, target) && !this.field.isTerrain('coldeclipseterrain')) {
				if (this.randomChance(probability, 10)) {
					source.trySetStatus('brn', target);
				}
			}
		},
		flags: {},
		name: "Flame Body",
		rating: 2,
		num: 49,
	},
	flareboost: {
		onBasePowerPriority: 19,
		onBasePower(basePower, attacker, defender, move) {
			if (this.movehasType(move, 'Fire')) {
				return this.chainModify(1.5);
			}
			if ((attacker.status === 'brn' || this.field.isTerrain(['burningterrain', 'volcanicterrain'])) && move.category === 'Special' && !this.field.isTerrain('coldeclipseterrain')) {
				return this.chainModify(1.5);
			}
		},
		flags: {},
		name: "Flare Boost",
		rating: 2,
		num: 138,
	},
	falsedevotion: {
		onModifyPriority(priority, pokemon, target, move) {
			if (move?.category === 'Status') return priority + 1;
		},
		onCheckShow(pokemon) {
			return !!pokemon.status;
		},
		onSwitchOut(pokemon) {
			pokemon.cureStatus();
		},
		onModifyMovePriority: -2,
		onModifyMove(move) {
			if (move.secondaries) {
				this.debug('doubling secondary chance');
				for (const secondary of move.secondaries) {
					if (secondary.chance) secondary.chance *= 2;
				}
			}
			if (move.self?.chance) move.self.chance *= 2;
		},
		flags: {},
		name: "False Devotion",
		rating: 4,
		num: 10185,
	},
	ancientbloom: {
		onSwitchInPriority: -2,
		onStart(pokemon) {
			this.dex.abilities.get('verdanthospitality').onStart?.call(this, pokemon);
			if (this.field.isTerrain(['fairytaleterrain', 'newworldterrain', 'coldeclipseterrain', 'starlightarenaterrain'])) {
				this.boost({ def: 1, spd: 1 }, pokemon, pokemon);
			}
		},
		onBasePowerPriority: 8,
		onBasePower(basePower, attacker, defender, move) {
			if (this.field.isTerrain(['newworldterrain', 'coldeclipseterrain', 'starlightarenaterrain'])) {
				return this.chainModify(1.5);
			}
		},
		onAnyModifyDamage(damage, source, target, move) {
			return this.dex.abilities.get('verdanthospitality').onAnyModifyDamage?.call(this, damage, source, target, move);
		},
		onAnyTryHeal(damage, target, source, effect) {
			return this.dex.abilities.get('invigorate').onAnyTryHeal?.call(this, damage, target, source, effect);
		},
		onResidual(pokemon) {
			this.dex.abilities.get('verdanthospitality').onResidual?.call(this, pokemon);
			this.dex.abilities.get('invigorate').onResidual?.call(this, pokemon);
			this.dex.abilities.get('selfsufficient').onResidual?.call(this, pokemon);
		},
		onDamagingHit(damage, target, source, move) {
			return this.dex.abilities.get('effectspore').onDamagingHit?.call(this, damage, target, source, move);
		},
		flags: { breakable: 1 },
		name: "Ancient Bloom",
		rating: 4.5,
		num: 10024,
	},
	pollenbloom: {
		onImmunity(type, pokemon) {
			return this.dex.abilities.get('thickfat').onImmunity?.call(this, type, pokemon);
		},
		onSourceModifyAtkPriority: 6,
		onSourceModifyAtk(atk, attacker, defender, move) {
			return this.dex.abilities.get('thickfat').onSourceModifyAtk?.call(this, atk, attacker, defender, move);
		},
		onSourceModifySpAPriority: 5,
		onSourceModifySpA(atk, attacker, defender, move) {
			return this.dex.abilities.get('thickfat').onSourceModifySpA?.call(this, atk, attacker, defender, move);
		},
		onBasePowerPriority: 8,
		onBasePower(basePower, attacker, defender, move) {
			return this.dex.abilities.get('proficient').onBasePower?.call(this, basePower, attacker, defender, move);
		},
		onResidualOrder: 5,
		onResidualSubOrder: 3,
		onResidual(pokemon) {
			for (const target of this.getAllActive()) {
				if (!target || target.fainted || target === pokemon || target.isAlly(pokemon) ||
					isImmuneToScalingChip(target, 'Grass')) continue;
				const typeMod = this.clampIntRange(this.dex.getEffectiveness('Grass', target.getTypes()), -6, 6);
				const damage = this.clampIntRange(target.baseMaxhp / 16 * 2 ** typeMod, 1);
				const dealt = this.damage(damage, target, pokemon);
				if (dealt) this.heal(dealt, pokemon, pokemon);
			}
		},
		flags: { breakable: 1 },
		name: "Pollen Bloom",
		rating: 4,
		num: 10137,
	},
	firemane: {
		onBasePowerPriority: 8,
		onBasePower(basePower, attacker, defender, move) {
			if (move.type === 'Fire') return this.chainModify(1.5);
		},
		flags: {},
		name: "Fire Mane",
		rating: 3.5,
		num: 10022,
	},
	blazingmane: {
		onBasePowerPriority: 8,
		onBasePower(basePower, attacker, defender, move) {
			let modifier = 1;
			if (this.movehasType(move, 'Fire')) modifier *= 1.5;
			if (move.multihitType === 'blazingmane' && move.hit > 1) modifier *= 0.3;
			if (modifier !== 1) return this.chainModify(modifier);
		},
		onModifyPriority(priority, pokemon, target, move) {
			if (pokemon.hp <= pokemon.maxhp / 2 && this.movehasType(move, 'Fire') && move.category !== 'Status') {
				return priority + 1;
			}
		},
		onPrepareHit(source, target, move) {
			if (move.category === 'Status' || move.multihit || move.flags['charge'] || move.flags['futuremove'] || move.isZ || move.isMax) return;
			move.multihit = 2;
			move.multihitType = 'blazingmane';
		},
		flags: {},
		name: "Blazing Mane",
		rating: 4,
		num: 10158,
	},
	fortressshell: {
		onStart(pokemon) {
			const terrain = this.field.terrain;
			if (['fairytaleterrain', 'newworldterrain', 'coldeclipseterrain', 'starlightarenaterrain'].includes(terrain)) {
				pokemon.abilityState.fortressShellField = terrain;
				this.boost({ def: 1, spd: 1 }, pokemon, pokemon, this.dex.abilities.get('fortressshell'));
			}
		},
		onTerrainChange(pokemon) {
			const terrain = this.field.terrain;
			if (!['fairytaleterrain', 'newworldterrain', 'coldeclipseterrain', 'starlightarenaterrain'].includes(terrain)) {
				pokemon.abilityState.fortressShellField = '';
				return;
			}
			if (pokemon.abilityState.fortressShellField === terrain) return;
			pokemon.abilityState.fortressShellField = terrain;
			this.boost({ def: 1, spd: 1 }, pokemon, pokemon, this.dex.abilities.get('fortressshell'));
		},
		onTryHit(target, source, move) {
			if (target !== source && this.movehasType(move, 'Electric') && this.field.isTerrain(['watersurfaceterrain', 'underwaterterrain', 'factoryterrain', 'shortcircuitterrain'])) {
				if (!this.boost({ spa: 1, atk: 1 }, target, target)) {
					this.add('-immune', target, '[from] ability: Fortress Shell');
				}
				return null;
			}
		},
		onAllyBasePowerPriority: 22,
		onAllyBasePower(basePower, attacker, defender, move) {
			return this.dex.abilities.get('powerspot').onAllyBasePower?.call(this, basePower, attacker, defender, move);
		},
		onBasePowerPriority: 8,
		onBasePower(basePower, attacker, defender, move) {
			let modifier = getDualWieldModifier(move);
			if (this.field.isTerrain(['newworldterrain', 'coldeclipseterrain', 'starlightarenaterrain'])) {
				modifier *= 1.5;
			}
			if (modifier !== 1) return this.chainModify(modifier);
		},
		onModifyMove(move, source) {
			this.dex.abilities.get('dualwield').onModifyMove?.call(this, move, source);
		},
		onAnyRedirectTarget(target, source, source2, move) {
			if (!this.field.isTerrain(['watersurfaceterrain', 'underwaterterrain', 'factoryterrain', 'shortcircuitterrain'])) return;
			if (!this.movehasType(move, 'Electric')) return;
			const redirectTarget = ['randomNormal', 'adjacentFoe'].includes(move.target) ? 'normal' : move.target;
			if (this.validTarget(this.effectState.target, source, redirectTarget)) {
				if (move.smartTarget) move.smartTarget = false;
				if (this.effectState.target !== target) {
					this.add('-activate', this.effectState.target, 'ability: Fortress Shell');
				}
				return this.effectState.target;
			}
		},
		onResidual(pokemon) {
			return this.dex.abilities.get('selfsufficient').onResidual?.call(this, pokemon);
		},
		onSourceModifyDamage(damage, source, target, move) {
			return this.dex.abilities.get('shellarmor').onSourceModifyDamage?.call(this, damage, source, target, move);
		},
		onAnyModifyDamage(damage, source, target, move) {
			return this.dex.abilities.get('friendguard').onAnyModifyDamage?.call(this, damage, source, target, move);
		},
		onAnyCriticalHit(target, source, move) {
			const pokemon = this.effectState.target;
			if (target === pokemon) return false;
		},
		flags: { breakable: 1 },
		name: "Fortress Shell",
		rating: 4.5,
		num: 10025,
	},
	waterbarrage: {
		onStart(pokemon) {
			this.dex.abilities.get('waterveil').onSwitchIn?.call(this, pokemon);
		},
		onUpdate(pokemon) {
			return this.dex.abilities.get('waterveil').onUpdate?.call(this, pokemon);
		},
		onSetStatus(status, target, source, effect) {
			return this.dex.abilities.get('waterveil').onSetStatus?.call(this, status, target, source, effect);
		},
		onImmunity(type, pokemon) {
			return this.dex.abilities.get('waterveil').onImmunity?.call(this, type, pokemon);
		},
		onBasePowerPriority: 8,
		onBasePower(basePower, attacker, defender, move) {
			let modifier = getDualWieldModifier(move);
			if (move.category !== 'Status' && attacker.hasType(move.type)) modifier *= 1.2;
			if (modifier !== 1) return this.chainModify(modifier);
		},
		onModifyMove(move, source) {
			this.dex.abilities.get('dualwield').onModifyMove?.call(this, move, source);
		},
		onResidual(pokemon) {
			this.dex.abilities.get('waterveil').onResidual?.call(this, pokemon);
			const stage = ((pokemon.abilityState.waterBarrageStage || 0) % 3) + 1;
			pokemon.abilityState.waterBarrageStage = stage;
			for (const target of this.getAllActive()) {
				if (!target || target.fainted || target === pokemon || target.isAlly(pokemon) ||
					isImmuneToScalingChip(target, 'Water')) continue;
				const typeMod = this.clampIntRange(this.dex.getEffectiveness('Water', target.getTypes()), -6, 6);
				const damage = this.clampIntRange(target.baseMaxhp * stage / 16 * 2 ** typeMod, 1);
				this.damage(damage, target, pokemon);
			}
		},
		flags: { breakable: 1 },
		name: "Water Barrage",
		rating: 4,
		num: 10138,
	},
	flashfire: {
		onStart(pokemon) {
			if (this.field.isTerrain('coldeclipseterrain')) {
				this.boost({ def: 1, spd: 1 }, pokemon, pokemon);
			}
		},
		onTryHit(target, source, move) {
			if (target !== source && this.movehasType(move, 'Fire') && !this.field.isTerrain('coldeclipseterrain')) {
				move.accuracy = true;
				if (!target.addVolatile('flashfire')) {
					this.add('-immune', target, '[from] ability: Flash Fire');
				}
				return null;
			}
		},
		onResidual(pokemon) {
			if (this.field.isTerrain('burningterrain') || (this.field.isTerrain('volcanicterrain') && pokemon.isGrounded())) {
				pokemon.addVolatile('flashfire');
			}
		},
		onEnd(pokemon) {
			pokemon.removeVolatile('flashfire');
		},
		condition: {
			noCopy: true, // doesn't get copied by Baton Pass
			onStart(target) {
				this.add('-start', target, 'ability: Flash Fire');
			},
			onModifyAtkPriority: 5,
			onModifyAtk(atk, attacker, defender, move) {
				if (move && this.movehasType(move, 'Fire') && attacker.hasAbility('flashfire')) {
					this.debug('Flash Fire boost');
					return this.chainModify(1.5);
				}
			},
			onModifySpAPriority: 5,
			onModifySpA(atk, attacker, defender, move) {
				if (move && this.movehasType(move, 'Fire') && attacker.hasAbility('flashfire')) {
					this.debug('Flash Fire boost');
					return this.chainModify(1.5);
				}
			},
			onEnd(target) {
				this.add('-end', target, 'ability: Flash Fire', '[silent]');
			},
		},
		flags: { breakable: 1 },
		name: "Flash Fire",
		rating: 3.5,
		num: 18,
	},
	flowergift: {
		onSwitchInPriority: -2,
		onStart(pokemon) {
			this.singleEvent('WeatherChange', this.effect, this.effectState, pokemon);
		},
		onWeatherChange(pokemon) {
			if (!pokemon.isActive || pokemon.baseSpecies.baseSpecies !== 'Cherrim' || pokemon.transformed) return;
			if (!pokemon.hp) return;
			if (['sunnyday', 'desolateland'].includes(pokemon.effectiveWeather())) {
				if (pokemon.species.id !== 'cherrimsunshine') {
					pokemon.formeChange('Cherrim-Sunshine', this.effect, false, '[msg]');
				}
			} else {
				if (pokemon.species.id === 'cherrimsunshine' && !this.field.isTerrain('bewitchedwoodsterrain')) {
					pokemon.formeChange('Cherrim', this.effect, false, '[msg]');
				}
			}
		},
		onTerrainChange(pokemon) {
			if (!pokemon.isActive || pokemon.baseSpecies.baseSpecies !== 'Cherrim' || pokemon.transformed) return;
			if (!pokemon.hp) return;
			if (this.field.isTerrain('bewitchedwoodsterrain')) {
				if (pokemon.species.id !== 'cherrimsunshine') {
					pokemon.formeChange('Cherrim-Sunshine', this.effect, false, '[msg]');
				}
			} else {
				if (pokemon.species.id === 'cherrimsunshine') {
					pokemon.formeChange('Cherrim', this.effect, false, '[msg]');
				}
			}
		},
		onAllyModifyAtkPriority: 3,
		onAllyModifyAtk(atk, pokemon) {
			if (this.effectState.target.baseSpecies.baseSpecies !== 'Cherrim') return;
			if (['sunnyday', 'desolateland'].includes(pokemon.effectiveWeather())) {
				return this.chainModify(1.5);
			}
		},
		onAllyModifySpDPriority: 4,
		onAllyModifySpD(spd, pokemon) {
			if (this.effectState.target.baseSpecies.baseSpecies !== 'Cherrim') return;
			if (['sunnyday', 'desolateland'].includes(pokemon.effectiveWeather())) {
				return this.chainModify(1.5);
			}
		},
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, breakable: 1 },
		name: "Flower Gift",
		rating: 1,
		num: 122,
	},
	flowerveil: {
		onAllyTryBoost(boost, target, source, effect) {
			if ((source && target === source) || (!target.hasType('Grass') && !this.field.isTerrain('bewitchedwoodsterrain'))) return;
			let showMsg = false;
			let i: BoostID;
			for (i in boost) {
				if (boost[i]! < 0) {
					delete boost[i];
					showMsg = true;
				}
			}
			if (showMsg && !(effect as ActiveMove).secondaries) {
				const effectHolder = this.effectState.target;
				this.add('-block', target, 'ability: Flower Veil', '[of] ' + effectHolder);
			}
		},
		onAllySetStatus(status, target, source, effect) {
			if ((target.hasType('Grass') || this.field.isTerrain('bewitchedwoodsterrain')) && source && target !== source && effect && effect.id !== 'yawn') {
				this.debug('interrupting setStatus with Flower Veil');
				if (effect.name === 'Synchronize' || (effect.effectType === 'Move' && !effect.secondaries)) {
					const effectHolder = this.effectState.target;
					this.add('-block', target, 'ability: Flower Veil', '[of] ' + effectHolder);
				}
				return null;
			}
		},
		onAllyTryAddVolatile(status, target) {
			if ((target.hasType('Grass') || this.field.isTerrain('bewitchedwoodsterrain')) && status.id === 'yawn') {
				this.debug('Flower Veil blocking yawn');
				const effectHolder = this.effectState.target;
				this.add('-block', target, 'ability: Flower Veil', '[of] ' + effectHolder);
				return null;
			}
		},
		flags: { breakable: 1 },
		name: "Flower Veil",
		rating: 0,
		num: 166,
	},
	fluffy: {
		onSourceModifyDamage(damage, source, target, move) {
			let mod = 1;
			if (move && this.movehasType(move, 'Fire')) mod *= 2;
			if (move.flags['contact']) mod /= 2;
			return this.chainModify(mod);
		},
		flags: { breakable: 1 },
		name: "Fluffy",
		rating: 3.5,
		num: 218,
	},
	forecast: {
		onSwitchInPriority: -2,
		onStart(pokemon) {
			this.singleEvent('WeatherChange', this.effect, this.effectState, pokemon);
		},
		onWeatherChange(pokemon) {
			if (pokemon.baseSpecies.baseSpecies !== 'Castform' || pokemon.transformed) return;
			let forme = null;
			switch (pokemon.effectiveWeather()) {
			case 'sunnyday':
			case 'desolateland':
				if (pokemon.species.id !== 'castformsunny') forme = 'Castform-Sunny';
				break;
			case 'raindance':
			case 'primordialsea':
				if (pokemon.species.id !== 'castformrainy') forme = 'Castform-Rainy';
				break;
			case 'hail':
			case 'snow':
				if (pokemon.species.id !== 'castformsnowy') forme = 'Castform-Snowy';
				break;
			case 'sandstorm':
				if (pokemon.species.id !== 'castformsandy') forme = 'Castform-Sandy';
				break;
			case 'deltastream':
				if (pokemon.species.id !== 'castformwindy') forme = 'Castform-Windy';
				break;
			default:
				if (pokemon.species.id !== 'castform') forme = 'Castform';
				break;
			}
			if (pokemon.isActive && forme) {
				pokemon.formeChange(forme, this.effect, false, '[msg]');
			}
		},
		onDamagingHit(damage, target, source, move) {
			if (target.species.id === 'castformsunny' && this.checkMoveMakesContact(move, source, target)) {
				if (this.randomChance(3, 10)) source.trySetStatus('brn', target);
			}
		},
		onTryHit(target, source, move) {
			if (target !== source && target.species.id === 'castformsandy' && this.movehasType(move, 'Ground')) {
				if (!this.heal(target.baseMaxhp / 4)) this.add('-immune', target, '[from] ability: Forecast');
				return null;
			}
			if (target !== source && target.species.id === 'castformrainy' && this.movehasType(move, 'Water')) {
				if (!this.heal(target.baseMaxhp / 4)) this.add('-immune', target, '[from] ability: Forecast');
				return null;
			}
		},
		onModifySpAPriority: 5,
		onModifySpA(spa, pokemon) {
			if (pokemon.species.id === 'castformsunny' && ['sunnyday', 'desolateland'].includes(pokemon.effectiveWeather())) {
				return this.chainModify(1.5);
			}
		},
		onModifySpe(spe, pokemon) {
			if (pokemon.species.id === 'castformsnowy' && (this.field.isWeather(['hail', 'snow']) || this.field.isTerrain(['icyterrain', 'snowymountainterrain', 'coldeclipseterrain']))) {
				return this.chainModify(2);
			}
			if (pokemon.species.id === 'castformsandy' && (this.field.isWeather('sandstorm') || this.field.isTerrain(['desertterrain', 'ashenbeachterrain']))) {
				return this.chainModify(2);
			}
		},
		onWeather(target, source, effect) {
			if (target.species.id === 'castformsnowy' && ['hail', 'snow'].includes(effect.id)) this.heal(target.baseMaxhp / 16);
			if (target.species.id === 'castformrainy' && ['raindance', 'primordialsea'].includes(effect.id)) this.heal(target.baseMaxhp / 8);
		},
		onResidual(pokemon) {
			if (pokemon.species.id === 'castformrainy') {
				if (pokemon.status && ['raindance', 'primordialsea'].includes(pokemon.effectiveWeather())) pokemon.cureStatus();
				if (this.field.isWeather(['raindance', 'primordialsea'])) this.heal(pokemon.baseMaxhp / 16, pokemon, pokemon);
			}
			if (pokemon.species.id === 'castformsnowy' && this.field.isTerrain(['icyterrain', 'snowymountainterrain', 'coldeclipseterrain']) && !this.field.isWeather(['hail', 'snow'])) {
				this.heal(pokemon.baseMaxhp / 16, pokemon, pokemon);
			}
		},
		onImmunity(type, pokemon) {
			if (pokemon.species.id === 'castformsnowy' && type === 'hail') return false;
			if (pokemon.species.id === 'castformsandy' && type === 'sandstorm') return false;
		},
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1 },
		name: "Forecast",
		rating: 2,
		num: 59,
	},
	forewarn: {
		onStart(pokemon) {
			let warnMoves: (Move | Pokemon)[][] = [];
			let warnBp = 1;
			for (const target of pokemon.foes()) {
				for (const moveSlot of target.moveSlots) {
					const move = this.dex.moves.get(moveSlot.move);
					let bp = move.basePower;
					if (move.ohko) bp = 150;
					if (move.id === 'counter' || move.id === 'metalburst' || move.id === 'mirrorcoat') bp = 120;
					if (bp === 1) bp = 80;
					if (!bp && move.category !== 'Status') bp = 80;
					if (bp > warnBp) {
						warnMoves = [[move, target]];
						warnBp = bp;
					} else if (bp === warnBp) {
						warnMoves.push([move, target]);
					}
				}
			}
			if (!warnMoves.length) return;
			const [warnMoveName, warnTarget] = this.sample(warnMoves);
			this.add('-activate', pokemon, 'ability: Forewarn', warnMoveName, `[of] ${warnTarget}`);
			if (this.field.isTerrain('psychicterrain')) {
				return this.boost({ spa: 2 });
			}
		},
		onDamage(damage, source, target, effect) {
			if (effect && effect.effectType === 'Move' && effect.category !== 'Status')
				return this.chainModify(0.8);
		},
		flags: {},
		name: "Forewarn",
		rating: 0.5,
		num: 108,
	},
	friendguard: {
		onAnyModifyDamage(damage, source, target, move) {
			if (target !== this.effectState.target && target.isAlly(this.effectState.target)) {
				this.debug('Friend Guard weaken');
				return this.chainModify(0.75);
			}
		},
		flags: { breakable: 1 },
		name: "Friend Guard",
		rating: 0,
		num: 132,
	},
	verdanthospitality: {
		onStart(pokemon) {
			for (const ally of pokemon.allies()) {
				this.heal(ally.baseMaxhp / 8, ally, pokemon);
				this.add('-message', `${pokemon.name} shared its hospitality with ${ally.name}!`);
			}
		},
		onAnyModifyDamage(damage, source, target, move) {
			if (target !== this.effectState.target && target.isAlly(this.effectState.target)) {
				this.debug('Verdant Hospitality Friend Guard weaken');
				return this.chainModify(0.75);
			}
		},
		onResidual(pokemon) {
			this.heal(pokemon.baseMaxhp / 8, pokemon, pokemon);
			for (const ally of pokemon.allies()) {
				this.heal(ally.baseMaxhp / 16, ally, pokemon);
			}
		},
		flags: { breakable: 1 },
		name: "Verdant Hospitality",
		rating: 4,
		num: 10160,
	},
	frisk: {
		onStart(pokemon) {
			for (const target of pokemon.foes()) {
				if (target.item) {
					this.add('-item', target, target.getItem().name, '[from] ability: Frisk', `[of] ${pokemon}`);
					if (this.randomChance(3, 10)) {
						target.addVolatile('embargo');
					}
				}
			}
		},
		flags: {},
		name: "Frisk",
		rating: 1.5,
		num: 119,
	},
	fullmetalbody: {
		onModifyDef(def, pokemon) {
			if (this.field.isTerrain('coldeclipseterrain')) {
				return this.chainModify(1.5);
			}
		},
		onModifySpD(spd, pokemon) {
			if (this.field.isTerrain('coldeclipseterrain')) {
				return this.chainModify(1.5);
			}
		},
		onSourceModifyAtkPriority: 6,
		onSourceModifyAtk(atk, attacker, defender, move) {
			if (move && this.movehasType(move, 'Ice') && this.field.isTerrain('coldeclipseterrain')) {
				this.debug('Turbloblaze weaken');
				return this.chainModify(0.5);
			}
		},
		onSourceModifySpAPriority: 5,
		onSourceModifySpA(atk, attacker, defender, move) {
			if (move && this.movehasType(move, 'Ice') && this.field.isTerrain('coldeclipseterrain')) {
				this.debug('Turboblaze weaken');
				return this.chainModify(0.5);
			}
		},
		onTryBoost(boost, target, source, effect) {
			if (source && target === source) return;
			let showMsg = false;
			let i: BoostID;
			for (i in boost) {
				if (boost[i]! < 0) {
					delete boost[i];
					showMsg = true;
				}
			}
			if (showMsg && !(effect as ActiveMove).secondaries && effect.id !== 'octolock') {
				this.add("-fail", target, "unboost", "[from] ability: Full Metal Body", `[of] ${target}`);
			}
		},
		onImmunity(type, pokemon) {
			if (type === 'hail' && this.field.isTerrain('coldeclipseterrain')) return false;
		},
		flags: {},
		name: "Full Metal Body",
		rating: 2,
		num: 230,
	},
	furcoat: {
		onModifyDefPriority: 6,
		onModifyDef(def) {
			return this.chainModify(2);
		},
		flags: { breakable: 1 },
		name: "Fur Coat",
		rating: 4,
		num: 169,
	},
	galewings: {
		onModifyPriority(priority, pokemon, target, move) {
			if (move?.type === 'Flying' && pokemon.hp >= 0.75 * pokemon.maxhp || (this.field.isTerrain(['mountainterrain', 'snowymountainterrain', 'coldeclipseterrain']) && this.field.weather === 'deltastream')) return priority + 1;
		},
		flags: {},
		name: "Gale Wings",
		rating: 1.5,
		num: 177,
	},
	galvanize: {
		onModifyTypePriority: -1,
		onModifyType(move, pokemon) {
			const noModifyType = [
				'judgment', 'multiattack', 'naturalgift', 'revelationdance', 'technoblast', 'terrainpulse', 'weatherball',
			];
			if (move.type === 'Normal' && !noModifyType.includes(move.id) &&
				!(move.isZ && move.category !== 'Status') && !(move.name === 'Tera Blast' && pokemon.terastallized)) {
				move.type = 'Electric';
				move.typeChangerBoosted = this.effect;
			}
		},
		onBasePowerPriority: 23,
		onBasePower(basePower, pokemon, target, move) {
			let modifier = 1.2;
			if (this.field.isTerrain('shortcircuitterrain')) {
				modifier = 2;
			} else if (this.field.isTerrain(['factoryterrain', 'electricterrain'])) {
				modifier = 1.5;
			}
			if (move.typeChangerBoosted === this.effect)
				return this.chainModify(modifier);
		},
		flags: {},
		name: "Galvanize",
		rating: 4,
		num: 206,
	},
	gluttony: {
		onStart(pokemon) {
			pokemon.abilityState.gluttony = true;
		},
		onDamage(item, pokemon) {
			pokemon.abilityState.gluttony = true;
		},
		flags: {},
		name: "Gluttony",
		rating: 1.5,
		num: 82,
	},
	goodasgold: {
		onTryHit(target, source, move) {
			if (move.category === 'Status' && target !== source && !this.field.isTerrain('burningterrain')) {
				this.add('-immune', target, '[from] ability: Good as Gold');
				return null;
			}
		},
		onBasePower(basePower, source) {
			if (this.field.isTerrain('dragonsdenterrain')) {
				return this.chainModify(1.2);
			}
		},
		flags: { breakable: 1 },
		name: "Good as Gold",
		rating: 5,
		num: 283,
	},
	gooey: {
		onDamagingHit(damage, target, source, move) {
			if (!source || source === target || source.isAlly(target) || move.category === 'Status') return;
			this.add('-ability', target, 'Gooey');
			const bestStat = source.getStat('atk', false, true) >= source.getStat('spa', false, true) ? 'atk' : 'spa';
			this.boost({ spe: -2, [bestStat]: -1 }, source, target, null, true);
		},
		onTryHitPriority: 1,
		onTryHit(target, source, move) {
			return this.dex.abilities.get('sapsipper').onTryHit?.call(this, target, source, move);
		},
		onAllyTryHitSide(target, source, move) {
			return this.dex.abilities.get('sapsipper').onAllyTryHitSide?.call(this, target, source, move);
		},
		onResidualOrder: 5,
		onResidualSubOrder: 3,
		onResidual(pokemon) {
			this.dex.abilities.get('hydration').onResidual?.call(this, pokemon);
			this.dex.abilities.get('sapsipper').onResidual?.call(this, pokemon);
			this.dex.abilities.get('selfsufficient').onResidual?.call(this, pokemon);
		},
		onImmunity(type, pokemon) {
			return this.dex.abilities.get('selfsufficient').onImmunity?.call(this, type, pokemon);
		},
		flags: { breakable: 1 },
		name: "Gooey",
		rating: 2,
		num: 183,
	},
	gorillatactics: {
		onStart(pokemon) {
			pokemon.abilityState.choiceLock = "";
		},
		onBeforeMove(pokemon, target, move) {
			if (move.isZOrMaxPowered || move.id === 'struggle') return;
			if (pokemon.abilityState.choiceLock && pokemon.abilityState.choiceLock !== move.id) {
				// Fails unless ability is being ignored (these events will not run), no PP lost.
				this.addMove('move', pokemon, move.name);
				this.attrLastMove('[still]');
				this.debug("Disabled by Gorilla Tactics");
				this.add('-fail', pokemon);
				return false;
			}
		},
		onModifyMove(move, pokemon) {
			if (pokemon.abilityState.choiceLock || move.isZOrMaxPowered || move.id === 'struggle') return;
			pokemon.abilityState.choiceLock = move.id;
		},
		onModifyAtkPriority: 1,
		onModifyAtk(atk, pokemon) {
			if (pokemon.volatiles['dynamax']) return;
			// PLACEHOLDER
			this.debug('Gorilla Tactics Atk Boost');
			return this.chainModify(1.5);
		},
		onBasePower(basePower, source, target, move) {
			if (this.field.isTerrain('chessboardterrain')) {
				return this.chainModify(1.2);
			}
		},
		onDisableMove(pokemon) {
			if (!pokemon.abilityState.choiceLock) return;
			if (pokemon.volatiles['dynamax']) return;
			for (const moveSlot of pokemon.moveSlots) {
				if (moveSlot.id !== pokemon.abilityState.choiceLock) {
					pokemon.disableMove(moveSlot.id, false, this.effectState.sourceEffect);
				}
			}
		},
		onEnd(pokemon) {
			pokemon.abilityState.choiceLock = "";
		},
		flags: {},
		name: "Gorilla Tactics",
		rating: 4.5,
		num: 255,
	},
	primaltactics: {
		onStart(pokemon) {
			pokemon.abilityState.choiceLock = "";
		},
		onBeforeMove(pokemon, target, move) {
			if (move.isZOrMaxPowered || move.id === 'struggle') return;
			if (pokemon.abilityState.choiceLock && pokemon.abilityState.choiceLock !== move.id) {
				this.addMove('move', pokemon, move.name);
				this.attrLastMove('[still]');
				this.debug("Disabled by Primal Tactics");
				this.add('-fail', pokemon);
				return false;
			}
		},
		onModifyMove(move, pokemon) {
			if (pokemon.abilityState.choiceLock || move.isZOrMaxPowered || move.id === 'struggle') return;
			pokemon.abilityState.choiceLock = move.id;
		},
		onModifySpAPriority: 1,
		onModifySpA(spa, pokemon) {
			if (pokemon.volatiles['dynamax']) return;
			this.debug('Primal Tactics SpA Boost');
			return this.chainModify(1.5);
		},
		onDisableMove(pokemon) {
			if (!pokemon.abilityState.choiceLock) return;
			if (pokemon.volatiles['dynamax']) return;
			for (const moveSlot of pokemon.moveSlots) {
				if (moveSlot.id !== pokemon.abilityState.choiceLock) {
					pokemon.disableMove(moveSlot.id, false, this.effectState.sourceEffect);
				}
			}
		},
		onEnd(pokemon) {
			pokemon.abilityState.choiceLock = "";
		},
		flags: {},
		name: "Primal Tactics",
		rating: 4.5,
		num: 10206,
	},
	grasspelt: {
		onModifyDefPriority: 6,
		onModifyDef(pokemon) {
			if (this.field.isTerrain('grassyterrain') || this.field.isTerrain('forestterrain'))
				return this.chainModify(1.5);
		},
		onResidual(pokemon) {
			if (this.field.isTerrain('corrosiveterrain')) {
				if (!(pokemon.types.includes('Poison') || pokemon.types.includes('Steel'))) {
					this.damage(pokemon.baseMaxhp / 8, pokemon);
				}
			}
		},
		flags: { breakable: 1 },
		name: "Grass Pelt",
		rating: 0.5,
		num: 179,
	},
	grassysurge: {
		onStart(source) {
			this.field.setTerrain('grassyterrain');
		},
		flags: {},
		name: "Grassy Surge",
		rating: 4,
		num: 229,
	},
	grimneigh: {
		onSourceAfterFaint(length, target, source, effect) {
			if (effect && effect.effectType === 'Move') {
				this.boost({ spa: length }, source);
			}
		},
		flags: {},
		name: "Grim Neigh",
		rating: 3,
		num: 265,
	},
	guarddog: {
		onDragOutPriority: 1,
		onDragOut(pokemon) {
			this.add('-activate', pokemon, 'ability: Guard Dog');
			return null;
		},
		onTryBoostPriority: 2,
		onTryBoost(boost, target, source, effect) {
			if (effect.name === 'Intimidate' && boost.atk) {
				delete boost.atk;
				this.boost({ atk: 1 }, target, target, null, false, true);
			}
		},
		flags: { breakable: 1 },
		name: "Guard Dog",
		rating: 2,
		num: 275,
	},
	gulpmissile: {
		onStart(pokemon) {
			if (pokemon.species.id === 'cramorant') pokemon.formeChange('cramorantgulping', this.effect, true);
		},
		onDamagingHit(damage, target, source, move) {
			if (!source.hp || !source.isActive || target.isSemiInvulnerable()) return;
			if (['cramorantgulping', 'cramorantgorging'].includes(target.species.id)) {
				if (this.field.isTerrain('underwaterterrain')) {
					if (!source.runImmunity('Water')) {
						const typeMod = this.clampIntRange(this.dex.getEffectiveness('Water', source), -6, 6);
						this.damage(source.baseMaxhp / 4 * typeMod, source, target);
					}
				} else {
					this.damage(source.baseMaxhp / 4, source, target);
				}
				if (target.species.id === 'cramorantgulping') {
					this.boost({ def: -1 }, source, target, null, true);
				} else {
					source.trySetStatus('par', target, move);
				}
				target.formeChange('cramorant', move);
			}
		},
		// The Dive part of this mechanic is implemented in Dive's `onTryMove` in moves.ts
		onSourceTryPrimaryHit(target, source, effect) {
			if (effect?.id === 'surf' && source.hasAbility('gulpmissile') && source.species.name === 'Cramorant') {
				let forme = '';
				if (source.hp <= source.maxhp / 2 || this.field.isTerrain(['electricterrains', 'factoryterrain', 'shortcircuitterrain'])) {
					forme = 'cramorantgorging';
				} else if (source.hp > source.maxhp / 2 || this.field.isTerrain('underwaterterrain') || this.field.isTerrain('watersurfaceterrain') || this.field.isTerrain('swampterrain')) {
					forme = 'cramorantgulping';
				}
				source.formeChange(forme, effect);
			}
		},
		flags: { cantsuppress: 1, notransform: 1 },
		name: "Gulp Missile",
		rating: 2.5,
		num: 241,
	},
	guts: {
		onModifyAtkPriority: 5,
		onModifyAtk(atk, pokemon) {
			if (pokemon.status) {
				return this.chainModify(1.5);
			}
		},
		flags: {},
		name: "Guts",
		rating: 3.5,
		num: 62,
	},
	hadronengine: {
		onStart(pokemon) {
			if (!this.field.setTerrain('electricterrain') && this.field.isTerrain('electricterrain')) {
				this.add('-activate', pokemon, 'ability: Hadron Engine');
			}
		},
		onModifySpAPriority: 5,
		onModifySpA(atk, attacker, defender, move) {
			if (this.field.isTerrain('electricterrain')) {
				this.debug('Hadron Engine boost');
				return this.chainModify([5461, 4096]);
			}
		},
		flags: {},
		name: "Hadron Engine",
		rating: 4.5,
		num: 289,
	},
	harvest: {
		onResidualOrder: 28,
		onResidualSubOrder: 2,
		onResidual(pokemon) {
			if (this.field.isWeather(['sunnyday', 'desolateland']) || this.field.isTerrain('grassyterrain') || this.randomChance(1, 2)) {
				if (pokemon.hp && !pokemon.item && (this.dex.items.get(pokemon.lastItem).isBerry || ['telluricseed', 'syntheticseed', 'elementalseed', 'magicalseed'].includes(pokemon.lastItem))) {
					pokemon.setItem(pokemon.lastItem);
					pokemon.lastItem = '';
					this.add('-item', pokemon, pokemon.getItem(), '[from] ability: Harvest');
				}
			}
		},
		flags: {},
		name: "Harvest",
		rating: 2.5,
		num: 139,
	},
	healer: {
		onResidualOrder: 5,
		onResidualSubOrder: 3,
		onResidual(pokemon) {
			for (const allyActive of pokemon.adjacentAllies()) {
				if (allyActive.status && this.randomChance(3, 10)) {
					this.add('-activate', pokemon, 'ability: Healer');
					allyActive.cureStatus();
				}
			}
		},
		flags: {},
		name: "Healer",
		rating: 0,
		num: 131,
	},
	invigorate: {
		onAnyTryHeal(damage, target, source, effect) {
			const holder = this.effectState.target;
			if (typeof damage !== 'number' || !target || target.fainted) return;
			if (target === holder || target.isAlly(holder)) return this.modify(damage, 1.3);
		},
		onResidualOrder: 5,
		onResidualSubOrder: 3,
		onResidual(pokemon) {
			for (const allyActive of pokemon.adjacentAllies()) {
				if (allyActive.status && this.randomChance(1, 2)) {
					this.add('-activate', pokemon, 'ability: Invigorate');
					allyActive.cureStatus();
				}
			}
		},
		flags: { breakable: 1 },
		name: "Invigorate",
		rating: 3,
		num: 10144,
	},
	swornduty: {
		onStart(pokemon) {
			const healAmount = this.field.isTerrain('fairytaleterrain') ? 3 : 4;
			for (const ally of pokemon.adjacentAllies()) {
				if (!ally.hp || ally.fainted) continue;
				this.add('-message', `${pokemon.name} shared its mead with ${ally.name}!`);
				this.heal(ally.baseMaxhp / healAmount, ally, pokemon);
			}
		},
		flags: { breakable: 1 },
		name: "Sworn Duty",
		rating: 3,
		num: 10145,
	},
	heatproof: {
		onSourceModifyAtkPriority: 6,
		onSourceModifyAtk(atk, attacker, defender, move) {
			if (move && this.movehasType(move, 'Fire')) {
				this.debug('Heatproof Atk weaken');
				return this.chainModify(0.5);
			}
		},
		onSourceModifySpAPriority: 5,
		onSourceModifySpA(atk, attacker, defender, move) {
			if (move && this.movehasType(move, 'Fire')) {
				this.debug('Heatproof SpA weaken');
				return this.chainModify(0.5);
			}
		},
		onDamage(damage, target, source, effect) {
			if (effect && effect.id === 'brn') {
				return damage / 2;
			}
		},
		flags: { breakable: 1 },
		name: "Heatproof",
		rating: 2,
		num: 85,
	},
	heavymetal: {
		onModifyWeightPriority: 1,
		onStart(pokemon) {
			if (this.field.isTerrain('factoryterrain')) {
				this.boost({ def: 1, spe: -1 }, pokemon);
				this.add('-message', pokemon.name + '\'s heavy body is sturdy and unmoving!');
			}
		},
		onModifyWeight(weighthg) {
			return weighthg * 2;
		},
		onDamage(damage, target, source, effect) {
			if (effect?.effectType === 'Move' && effect.category === 'Physical') {
				return this.chainModify(0.5);
			}
		},
		flags: { breakable: 1 },
		name: "Heavy Metal",
		rating: 0,
		num: 134,
	},
	hyperdrill: {
		onModifyMove(move, source) {
			this.dex.abilities.get('dualwield').onModifyMove?.call(this, move, source);
			if (move.flags['drill'] && this.field.isTerrain(['rockyterrain', 'mountainterrain', 'snowymountainterrain', 'caveterrain', 'volcanicterrain'])) delete move.flags['protect'];
		},
		onBasePowerPriority: 19,
		onBasePower(basePower, attacker, defender, move) {
			const drillBoost = move.flags['drill'] ?
				(this.field.isTerrain(['rockyterrain', 'mountainterrain', 'snowymountainterrain', 'caveterrain', 'volcanicterrain']) ? 2 : 1.5) : 1;
			let modifier = getDualWieldModifier(move, drillBoost);
			if (move && this.movehasType(move, 'Rock')) modifier *= 1.5;
			if (modifier !== 1) return this.chainModify(modifier);
		},
		flags: {},
		name: "Hyper Drill",
		rating: 4,
		num: 10039,
	},
	honeygather: {
		flags: {},
		name: "Honey Gather",
		rating: 0,
		num: 118,
	},
	hospitality: {
		onSwitchInPriority: -2,
		onStart(pokemon) {
			for (const ally of pokemon.adjacentAllies()) {
				this.heal(ally.baseMaxhp / 4, ally, pokemon);
			}
		},
		flags: {},
		name: "Hospitality",
		rating: 0,
		num: 299,
	},
	hugepower: {
		onModifyAtkPriority: 5,
		onModifyAtk(atk) {
			return this.chainModify(2);
		},
		flags: {},
		name: "Huge Power",
		rating: 5,
		num: 37,
	},
	hungerswitch: {
		onResidualOrder: 29,
		onResidual(pokemon) {
			if (pokemon.species.baseSpecies !== 'Morpeko' || pokemon.terastallized) return;
			const targetForme = pokemon.species.name === 'Morpeko' ? 'Morpeko-Hangry' : 'Morpeko';
			pokemon.formeChange(targetForme);
		},
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, notransform: 1 },
		name: "Hunger Switch",
		rating: 1,
		num: 258,
	},
	hustle: {
		// This should be applied directly to the stat as opposed to chaining with the others
		onModifyAtkPriority: 5,
		onModifyAtk(atk) {
			return this.modify(atk, 1.5);
		},
		onSourceModifyAccuracyPriority: -1,
		onSourceModifyAccuracy(accuracy, target, source, move) {
			if (move.category === 'Physical' && typeof accuracy === 'number') {
				return this.chainModify([3277, 4096]);
			}
		},
		flags: {},
		name: "Hustle",
		rating: 3.5,
		num: 55,
	},
	hydrabond: {
		onModifyMove(move, source) {
			if (move.category === 'Status' || move.flags['noparentalbond'] || move.flags['charge'] ||
				move.flags['futuremove'] || move.isZ || move.isMax) return;
			const spreadTargets = ['allAdjacent', 'allAdjacentFoes', 'foeSide'];
			if (this.gameType !== 'freeforall' && (move.spreadHit || spreadTargets.includes(move.target))) return;
			if (this.gameType === 'freeforall') {
				const wasSpreadMove = move.spreadHit || spreadTargets.includes(move.target);
				move.target = 'allAdjacentFoes';
				(move as any).hydraBondSpread = true;
				if (!wasSpreadMove && !move.multihit) {
					(move as any).hydraBondSingleTargetSpread = true;
					return;
				}
				move.multihitType = 'hydrabond';
				if (move.multihit) {
					if (Array.isArray(move.multihit)) {
						move.multihit = [Math.max(3, move.multihit[0]), Math.max(3, move.multihit[1])];
					} else {
						move.multihit = Math.max(3, move.multihit);
					}
				} else {
					move.multihit = 3;
				}
				return;
			}
			if (move.multihit) return;
			move.multihit = 3;
			move.multihitType = 'hydrabond';
		},
		// Damage modifier implemented in BattleActions#modifyDamage()
		onBasePower(basePower, source) {
			if (this.field.isTerrain('dragonsdenterrain')) {
				return this.chainModify(1.2);
			}
		},
		flags: {},
		name: "Hydra Bond",
		rating: 4.5,
		num: 10000,
	},
	imperialmandate: {
		checkMode(pokemon) {
			const mode = pokemon.hp >= pokemon.maxhp / 2 ? 'power' : 'speed';
			if (pokemon.abilityState.imperialMandateMode === mode) return;
			pokemon.abilityState.imperialMandateMode = mode;
			this.add('-message', mode === 'power' ?
				'Imperial Mandate empowers its attacks!' :
				'Imperial Mandate quickens its command!');
		},
		boostedField() {
			return this.field.isTerrain(['fairytaleterrain', 'coldeclipseterrain', 'newworldterrain']);
		},
		onStart(pokemon) {
			this.effect.checkMode.call(this, pokemon);
			if ((this.dex.abilities.get('imperialmandate') as any).boostedField.call(this)) this.boost({ def: 1, spd: 1 }, pokemon, pokemon);
		},
		onTerrainChange(pokemon) {
			if ((this.dex.abilities.get('imperialmandate') as any).boostedField.call(this)) this.boost({ def: 1, spd: 1 }, pokemon, pokemon);
		},
		onModifySpe(spe, pokemon) {
			if (pokemon.hp < pokemon.maxhp / 2) return this.chainModify(2);
		},
		onBasePower(basePower, source, target, move) {
			if (move.category === 'Status') return;
			this.effect.checkMode.call(this, source);
			let modifier = 1.2;
			if (source.hp >= source.maxhp / 2) modifier *= 2;
			if ((this.dex.abilities.get('imperialmandate') as any).boostedField.call(this)) modifier *= 1.5;
			return this.chainModify(modifier);
		},
		onSourceModifyDamage(damage, source, target, move) {
			if (move.category !== 'Status') return this.chainModify(0.8);
		},
		onResidual(pokemon) { this.effect.checkMode.call(this, pokemon); },
		flags: {},
		name: "Imperial Mandate",
		rating: 5,
		num: 10258,
	},
	phantombarrage: {
		onModifyMove(move, pokemon) {
			move.infiltrates = true;
			if (['dragondarts', 'gmaxspiritvolley'].includes(move.id)) {
				if (pokemon.getStat('spa', false, true) > pokemon.getStat('atk', false, true)) {
					move.category = 'Special';
					move.overrideOffensiveStat = 'spa';
				} else {
					move.category = 'Physical';
					move.overrideOffensiveStat = 'atk';
				}
			}
			if (this.gameType === 'freeforall' && move.id === 'dragondarts') {
				move.multihit = 2;
				move.multihitType = 'hydrabond';
				move.target = 'allAdjacentFoes';
				delete move.flags['noparentalbond'];
			} else {
				this.dex.abilities.get('hydrabond').onModifyMove?.call(this, move, pokemon);
			}
		},
		onSourceModifySecondaries(secondaries, target, source, move) {
			return this.dex.abilities.get('hydrabond').onSourceModifySecondaries?.call(this, secondaries, target, source, move);
		},
		onBasePower(basePower, source, target, move) {
			return this.dex.abilities.get('hydrabond').onBasePower?.call(this, basePower, source, target, move);
		},
		onImmunity(type, pokemon) {
			if (type === 'Ground') return false;
		},
		flags: {},
		name: "Phantom Barrage",
		rating: 5,
		num: 10259,
	},
	astralcore: {
		onStart(pokemon) {
			this.dex.abilities.get('illuminate').onStart?.call(this, pokemon);
			this.dex.abilities.get('defragment').onStart?.call(this, pokemon);
		},
		onModifyAtkPriority: 5,
		onModifyAtk(atk, pokemon) {
			return this.dex.abilities.get('purepower').onModifyAtk?.call(this, atk, pokemon);
		},
		onModifySpA(spa, pokemon) {
			return this.dex.abilities.get('purepower').onModifySpA?.call(this, spa, pokemon);
		},
		onTryBoost(boost, target, source, effect) {
			return this.dex.abilities.get('illuminate').onTryBoost?.call(this, boost, target, source, effect);
		},
		onAnyAccuracy(accuracy, target, source, move) {
			return this.dex.abilities.get('defragment').onAnyAccuracy?.call(this, accuracy, target, source, move);
		},
		flags: {},
		name: "Astral Core",
		rating: 5,
		num: 10261,
	},
	hydrabreaker: {
		onModifyMove(move, source, target) {
			move.ignoreAbility = true;
			this.dex.abilities.get('hydrabond').onModifyMove?.call(this, move, source);
		},
		onSourceModifySecondaries(secondaries, target, source, move) {
			return this.dex.abilities.get('hydrabond').onSourceModifySecondaries?.call(this, secondaries, target, source, move);
		},
		onBasePower(basePower, source, target, move) {
			return this.dex.abilities.get('hydrabond').onBasePower?.call(this, basePower, source, target, move);
		},
		flags: {},
		name: "Hydra Breaker",
		rating: 5,
		num: 10147,
	},
	hydratyrant: {
		onModifyMove(move, source, target) {
			this.dex.abilities.get('hydrabond').onModifyMove?.call(this, move, source);
		},
		onSourceModifySecondaries(secondaries, target, source, move) {
			return this.dex.abilities.get('hydrabond').onSourceModifySecondaries?.call(this, secondaries, target, source, move);
		},
		onBasePower(basePower, source, target, move) {
			return this.dex.abilities.get('hydrabond').onBasePower?.call(this, basePower, source, target, move);
		},
		onImmunity(type, pokemon) {
			return this.dex.abilities.get('selfsufficient').onImmunity?.call(this, type, pokemon);
		},
		onResidual(pokemon) { return this.dex.abilities.get('selfsufficient').onResidual?.call(this, pokemon); },
		flags: {},
		name: "Hydra Tyrant",
		rating: 5,
		num: 10179,
	},
	orchardbond: {
		onModifyMove(move, source) {
			this.dex.abilities.get('hydrabond').onModifyMove?.call(this, move, source);
		},
		onSourceModifySecondaries(secondaries, target, source, move) {
			return this.dex.abilities.get('hydrabond').onSourceModifySecondaries?.call(this, secondaries, target, source, move);
		},
		onBasePower(basePower, source, target, move) {
			return this.dex.abilities.get('hydrabond').onBasePower?.call(this, basePower, source, target, move);
		},
		onResidualOrder: 26,
		onResidual(pokemon) {
			this.dex.abilities.get('harvest').onResidual?.call(this, pokemon);
		},
		flags: {},
		name: "Orchard Bond",
		rating: 4.5,
		num: 10152,
	},
	hydration: {
		onResidualOrder: 5,
		onResidualSubOrder: 3,
		onResidual(pokemon) {
			if (pokemon.status && ['raindance', 'primordialsea'].includes(pokemon.effectiveWeather()) || this.field.isTerrain('watersurfaceterrain') || this.field.isTerrain('underwaterterrain')) {
				this.debug('hydration');
				this.add('-activate', pokemon, 'ability: Hydration');
				pokemon.cureStatus();
			}
		},
		flags: {},
		name: "Hydration",
		rating: 1.5,
		num: 93,
	},
	hypercutter: {
		onTryBoost(boost, target, source, effect) {
			if (source && target === source) return;
			if (boost.atk && boost.atk < 0) {
				delete boost.atk;
				if (!(effect as ActiveMove).secondaries) {
					this.add("-fail", target, "unboost", "Attack", "[from] ability: Hyper Cutter", `[of] ${target}`);
				}
			}
		},
		flags: { breakable: 1 },
		name: "Hyper Cutter",
		rating: 1.5,
		num: 52,
	},
	iceabsorb: {
		onTryHit(target, source, move) {
			if (target !== source && this.movehasType(move, 'Ice')) {
				if (!this.heal(target.baseMaxhp / 4)) {
					this.add('-immune', target, '[from] ability: Ice Absorb');
				}
				return null;
			}
		},
		flags: { breakable: 1 },
		name: "Ice Absorb",
		rating: 3.5,
		num: 11,
	},
	icebody: {
		onDamagingHit(damage, target, source, move) {
			if (this.checkMoveMakesContact(move, source, target)) {
				const chance = 3;
				if (this.randomChance(chance, 10)) {
					source.trySetStatus('frz', target);
				}
			}
		},
		onWeather(target, source, effect) {
			if (effect.id === 'hail' || effect.id === 'snow') {
				if (effect.id === 'hail' && this.field.isTerrain('coldeclipseterrain')) {
					this.heal(target.baseMaxhp / 8);
					return;
				}
				this.heal(target.baseMaxhp / 16);
			}
		},
		onResidual(pokemon) {
			if ((this.field.isTerrain(['icyterrain', 'snowymountainterrain', 'coldeclipseterrain'])) && !(this.field.isWeather(['hail', 'snow']))) {
				this.heal(pokemon.baseMaxhp / 16);
			}
		},
		onImmunity(type, pokemon) {
			if (type === 'hail') return false;
		},
		flags: {},
		name: "Ice Body",
		rating: 1,
		num: 115,
	},
	iceface: {
		onSwitchInPriority: -2,
		onStart(pokemon) {
			if (this.field.isTerrain('volcanicterrain')) {
				this.effectState.busted = true;
				return;
			}
			if (this.field.isWeather(['hail', 'snowscape']) && pokemon.species.id === 'eiscuenoice') {
				this.add('-activate', pokemon, 'ability: Ice Face');
				this.effectState.busted = false;
				pokemon.formeChange('Eiscue', this.effect, true);
			}
		},
		onDamagePriority: 1,
		onDamage(damage, target, source, effect) {
			if (effect?.effectType === 'Move' && (effect.category === 'Physical' || this.field.isTerrain('coldeclipseterrain')) && target.species.id === 'eiscue') {
				this.add('-activate', target, 'ability: Ice Face');
				this.effectState.busted = true;
				return 0;
			}
		},
		onCriticalHit(target, type, move) {
			if (!target) return;
			if ((move.category !== 'Physical' || this.field.isTerrain('coldeclipseterrain')) || target.species.id !== 'eiscue') return;
			if (target.volatiles['substitute'] && !(move.flags['bypasssub'] || move.infiltrates)) return;
			if (!target.runImmunity(move)) return;
			return false;
		},
		onEffectiveness(typeMod, target, type, move) {
			if (!target) return;
			if ((move.category !== 'Physical' || this.field.isTerrain('coldeclipseterrain')) || target.species.id !== 'eiscue') return;

			const hitSub = target.volatiles['substitute'] && !move.flags['bypasssub'] && !(move.infiltrates && this.gen >= 6);
			if (hitSub) return;

			if (!target.runImmunity(move)) return;
			return 0;
		},
		onUpdate(pokemon) {
			if (pokemon.species.id === 'eiscue' && this.effectState.busted) {
				pokemon.formeChange('Eiscue-Noice', this.effect, true);
			}
		},
		onWeatherChange(pokemon, source, sourceEffect) {
			// snow/hail resuming because Cloud Nine/Air Lock ended does not trigger Ice Face
			if ((sourceEffect as Ability)?.suppressWeather) return;
			if (!pokemon.hp) return;
			if (this.field.isWeather(['hail', 'snowscape']) && pokemon.species.id === 'eiscuenoice') {
				this.add('-activate', pokemon, 'ability: Ice Face');
				this.effectState.busted = false;
				pokemon.formeChange('Eiscue', this.effect, true);
			}
		},
		flags: {
			failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, cantsuppress: 1,
			breakable: 1, notransform: 1,
		},
		name: "Ice Face",
		rating: 3,
		num: 248,
	},
	icescales: {
		onStart(pokemon) {
			if (this.field.isTerrain('mirrorarenaterrain')) {
				this.boost({ evasion: 2 }, pokemon);
			}
		},
		onEffectiveness(typeMod, target, type, move) {
			if (this.field.isTerrain(['icyterrain', 'snowymountainterrain']) && move && move.effectType === 'Move' && move.category !== 'Status' && type === 'Ice' && typeMod > 0) {
				this.debug('Ice Scales effectiveness weaken');
				return 0;
			}
		},
		onModifyDef(def, pokemon) {
			if (this.field.isTerrain('coldeclipseterrain')) {
				return this.chainModify(2);
			}
		},
		onSourceModifyDamage(damage, source, target, move) {
			if (move.category === 'Special') {
				return this.chainModify(0.5);
			}
		},
		onImmunity(type, pokemon) {
			if (type === 'hail') return false;
		},
		flags: { breakable: 1 },
		name: "Ice Scales",
		rating: 4,
		num: 246,
	},
	illuminate: {
		onStart(pokemon) {
			if (this.field.isTerrain('mirrorarenaterrain')) {
				for (const foe of pokemon.foes()) {
					this.boost({ accuracy: -1 }, foe);
				}
			}
			if (this.field.isTerrain('starlightarenaterrain')) {
				this.boost({ spa: 2 }, pokemon, pokemon);
				this.add('-message', pokemon.name + '\'s Illuminate flared up with starlight!');
				if (this.activePerHalf !== 1) {
					this.add('-message', pokemon.name + '\'s dazzling shine put a spotlight on its partner!');
					pokemon.adjacentAllies()[0].addVolatile('spotlight');
				}
			}
		},
		onTryBoost(boost, target, source, effect) {
			if (source && target === source) return;
			if (boost.accuracy && boost.accuracy < 0) {
				delete boost.accuracy;
				if (!(effect as ActiveMove).secondaries) {
					this.add("-fail", target, "unboost", "accuracy", "[from] ability: Illuminate", `[of] ${target}`);
				}
			}
		},
		onModifyMove(move) {
			move.ignoreEvasion = true;
		},
		flags: { breakable: 1 },
		name: "Illuminate",
		rating: 0.5,
		num: 35,
	},
	illusion: {
		onStart(pokemon) {
			if (this.field.isTerrain('mirrorarenaterrain')) {
				this.boost({ evasion: 1 }, pokemon);
			}
			if (pokemon.illusion) {
				const blacklist = [
					'multitype', 'comatose', 'disguise', 'schooling', 'resuscitation', 'prismpower',
					'battlebond', 'rkssystem', 'imposter', 'shieldsdown', 'powerofalchemy', 'receiver',
					'trace', 'forecast', 'flowergift', 'illusion', 'wonderguard', 'zenmode', 'stancechange',
					'powerconstruct', 'iceface', 'asone', 'asonechilling', 'asonegrim', 'neutralizinggas',
					'gulpmissile', 'hungerswitch', 'zerotohero', 'commander', 'quarkdrive', 'hadronengine',
					'protosynthesis', 'orichalcumpulse', 'poisonpuppeteer', 'terashift', 'terashell',
					'teraformzero', 'embodyaspectteal', 'embodyaspecthearthflame', 'embodyaspectwellspring',
					'embodyaspectcornerstone',
				];
				const copiedAbility = pokemon.illusion.getAbility();
				if (copiedAbility.exists && !blacklist.includes(copiedAbility.id)) {
					pokemon.addVolatile('illusioncopy');
					if (pokemon.volatiles['illusioncopy']) {
						pokemon.volatiles['illusioncopy'].originalAbility = pokemon.ability;
					}
					pokemon.ability = copiedAbility.id;
					pokemon.abilityState = this.initEffectState({ id: copiedAbility.id, target: pokemon });
					this.singleEvent('Start', copiedAbility, pokemon.abilityState, pokemon, pokemon);
				}
			}
		},
		onBeforeSwitchIn(pokemon) {
			pokemon.illusion = null;
			// yes, you can Illusion an active pokemon but only if it's to your right
			for (let i = pokemon.side.pokemon.length - 1; i > pokemon.position; i--) {
				const possibleTarget = pokemon.side.pokemon[i];
				if (!possibleTarget.fainted) {
					// If Ogerpon is in the last slot while the Illusion Pokemon is Terastallized
					// Illusion will not disguise as anything
					if (!pokemon.terastallized || !['Ogerpon', 'Terapagos'].includes(possibleTarget.species.baseSpecies)) {
						pokemon.illusion = possibleTarget;
					}
					break;
				}
			}
		},
		onBasePower(basePower, source, target, move) {
			if (source.illusion != null && this.field.isTerrain('chessboardterrain')) {
				return this.chainModify(1.2);
			}
		},
		onModifyMove(move, pokemon) {
			if (pokemon.illusion && pokemon.illusion.getTypes().some(type => this.movehasType(move, type))) {
				move.forceSTAB = true;
			}
		},
		onDamagingHit(damage, target, source, move) {
			if (target.illusion) {
				target.removeVolatile('illusioncopy');
				this.singleEvent('End', this.dex.abilities.get('Illusion'), target.abilityState, target, source, move);
			}
		},
		onEnd(pokemon) {
			if (pokemon.volatiles['illusioncopy']) {
				pokemon.removeVolatile('illusioncopy');
			}
			if (pokemon.illusion && !pokemon.beingCalledBack) {
				this.debug('illusion cleared');
				pokemon.illusion = null;
				const details = pokemon.getUpdatedDetails();
				this.add('replace', pokemon, details);
				this.add('-end', pokemon, 'Illusion');
				if (this.ruleTable.has('illusionlevelmod')) {
					this.hint("Illusion Level Mod is active, so this Pok\u00e9mon's true level was hidden.", true);
				}
			}
		},
		onFaint(pokemon) {
			pokemon.illusion = null;
		},
		onImmunity(type, pokemon) {
			if (type === 'hail' && this.field.isTerrain('coldeclipseterrain')) return false;
		},
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1 },
		name: "Illusion",
		rating: 4.5,
		num: 149,
	},
	immunity: {
		onUpdate(pokemon) {
			if (pokemon.status === 'psn' || pokemon.status === 'tox') {
				this.add('-activate', pokemon, 'ability: Immunity');
				pokemon.cureStatus();
			}
		},
		onSetStatus(status, target, source, effect) {
			if (status.id !== 'psn' && status.id !== 'tox') return;
			if ((effect as Move)?.status) {
				this.add('-immune', target, '[from] ability: Immunity');
			}
			return false;
		},
		flags: { breakable: 1 },
		name: "Immunity",
		rating: 2,
		num: 17,
	},
	imposter: {
		onSwitchIn(pokemon) {
			// Imposter does not activate when Skill Swapped or when Neutralizing Gas leaves the field
			// Imposter copies across in doubles/triples
			// (also copies across in multibattle and diagonally in free-for-all,
			// but side.foe already takes care of those)
			const target = pokemon.side.foe.active[pokemon.side.foe.active.length - 1 - pokemon.position];
			if (target) {
				pokemon.transformInto(target, this.dex.abilities.get('imposter'));
			}
		},
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1 },
		name: "Imposter",
		rating: 5,
		num: 150,
	},
	infiltrator: {
		onModifyMove(move) {
			move.infiltrates = true;
		},
		flags: {},
		name: "Infiltrator",
		rating: 2.5,
		num: 151,
	},
	burningcrown: {
		onStart(pokemon) {
			this.dex.abilities.get('whitesmoke').onStart?.call(this, pokemon);
		},
		onTryBoost(boost, target, source, effect) {
			return this.dex.abilities.get('whitesmoke').onTryBoost?.call(this, boost, target, source, effect);
		},
		onAnyFaintPriority: 1,
		onAnyFaint() {
			const holder = this.effectState.target;
			if (!holder || holder.fainted) return;
			const candidates = [holder, ...holder.allies()].filter(pokemon => pokemon && !pokemon.fainted);
			for (const candidate of candidates) {
				const atk = candidate.getStat('atk', false, true);
				const spa = candidate.getStat('spa', false, true);
				const stat = atk >= spa ? 'atk' : 'spa';
				this.boost({ [stat]: 1 }, candidate, holder);
			}
		},
		onBasePowerPriority: 8,
		onBasePower(basePower, attacker, defender, move) {
			if (this.field.isTerrain(['newworldterrain', 'coldeclipseterrain', 'starlightarenaterrain'])) {
				return this.chainModify(1.5);
			}
		},
		onSourceModifyDamage(damage, source, target, move) {
			if (move.category !== 'Status') return this.chainModify(0.8);
		},
		onImmunity(type, pokemon) { return this.dex.abilities.get('selfsufficient').onImmunity?.call(this, type, pokemon); },
		onResidual(pokemon) { return this.dex.abilities.get('selfsufficient').onResidual?.call(this, pokemon); },
		flags: { breakable: 1 },
		name: "Burning Crown",
		rating: 4.5,
		num: 10023,
	},
	wildfirecore: {
		onImmunity(type, pokemon) {
			if (type === 'hail') return false;
			return this.dex.abilities.get('magmaarmor').onImmunity?.call(this, type, pokemon);
		},
		onUpdate(pokemon) {
			return this.dex.abilities.get('magmaarmor').onUpdate?.call(this, pokemon);
		},
		onStart(pokemon) {
			return this.dex.abilities.get('magmaarmor').onStart?.call(this, pokemon);
		},
		onModifyTypePriority: -1,
		onModifyType(move, pokemon) {
			this.dex.abilities.get('dragonize').onModifyType?.call(this, move, pokemon);
		},
		onModifySTAB(stab, source, target, move) {
			return this.dex.abilities.get('dragonize').onModifySTAB?.call(this, stab, source, target, move);
		},
		onBasePowerPriority: 23,
		onBasePower(basePower, attacker, defender, move) {
			let modifier = 1;
			if (move.typeChangerBoosted === this.effect) {
				modifier *= this.field.isTerrain(['dragonsdenterrain', 'fairytaleterrain']) ? 1.5 : 1.2;
			}
			if (move.category !== 'Status' && attacker.hasType(move.type)) modifier *= 1.2;
			if (modifier !== 1) return this.chainModify(modifier);
		},
		onAfterMove(source, target, move) {
			if (this.movehasType(move, ['Fire', 'Dragon'])) source.abilityState.wildFireUsedFire = this.turn;
		},
		onTryHit(target, source, move) {
			return this.dex.abilities.get('magmaarmor').onTryHit?.call(this, target, source, move);
		},
		onSourceModifyAtkPriority: 6,
		onSourceModifyAtk(atk, attacker, defender, move) {
			return this.dex.abilities.get('magmaarmor').onSourceModifyAtk?.call(this, atk, attacker, defender, move);
		},
		onSourceModifySpAPriority: 5,
		onSourceModifySpA(spa, attacker, defender, move) {
			return this.dex.abilities.get('magmaarmor').onSourceModifySpA?.call(this, spa, attacker, defender, move);
		},
		onResidual(pokemon) {
			for (const target of this.getAllActive()) {
				if (!target || target.fainted || target === pokemon || target.isAlly(pokemon) ||
					isImmuneToScalingChip(target, 'Fire')) continue;
				const typeMod = this.clampIntRange(this.dex.getEffectiveness('Fire', target.getTypes()), -6, 6);
				const multiplier = target.status === 'brn' || pokemon.abilityState.wildFireUsedFire === this.turn ? 2 : 1;
				const damage = this.clampIntRange(target.baseMaxhp * multiplier / 16 * 2 ** typeMod, 1);
				this.damage(damage, target, pokemon);
			}
		},
		flags: { breakable: 1 },
		name: "Wildfire Core",
		rating: 4,
		num: 10139,
	},
	innardsout: {
		onDamagingHitOrder: 1,
		onDamagingHit(damage, target, source, move) {
			if (!target.hp) {
				if (!move.smartTarget) damage += Number(move.totalDamage);
				this.damage(target.getUndynamaxedHP(damage), source, target);
			}
		},
		flags: {},
		name: "Innards Out",
		rating: 4,
		num: 215,
	},
	innerfocus: {
		onTryAddVolatile(status, pokemon) {
			if (status.id === 'flinch') return null;
		},
		onTryBoost(boost, target, source, effect) {
			if (effect.name === 'Intimidate' && boost.atk) {
				delete boost.atk;
				this.add('-fail', target, 'unboost', 'Attack', '[from] ability: Inner Focus', `[of] ${target}`);
			}
		},
		flags: { breakable: 1 },
		name: "Inner Focus",
		rating: 1,
		num: 39,
	},
	insomnia: {
		onUpdate(pokemon) {
			if (pokemon.status === 'slp') {
				this.add('-activate', pokemon, 'ability: Insomnia');
				pokemon.cureStatus();
			}
		},
		onSetStatus(status, target, source, effect) {
			if (status.id !== 'slp') return;
			if ((effect as Move)?.status) {
				this.add('-immune', target, '[from] ability: Insomnia');
			}
			return false;
		},
		onTryAddVolatile(status, target) {
			if (status.id === 'yawn') {
				this.add('-immune', target, '[from] ability: Insomnia');
				return null;
			}
		},
		onBasePower(basePower, source, target, move) {
			if (target === source || move.category === 'Status' || !this.movehasType(move, 'Dark')) return;
			return this.chainModify(1.3);
		},
		flags: { breakable: 1 },
		name: "Insomnia",
		rating: 1.5,
		num: 15,
	},
	intimidate: {
		onStart(pokemon) {
			let activated = false;
			for (const target of pokemon.adjacentFoes()) {
				if (!activated) {
					this.add('-ability', pokemon, 'Intimidate', 'boost');
					activated = true;
				}
				if (target.volatiles['substitute']) {
					this.add('-immune', target);
				} else {
					this.boost({ atk: -1 }, target, pokemon, null, true);
				}
			}
		},
		flags: {},
		name: "Intimidate",
		rating: 3.5,
		num: 22,
	},
	intrepidsword: {
		onStart(pokemon) {
			this.boost({ atk: 1 }, pokemon);
			if (this.field.isTerrain('fairytaleterrain')) {
				this.boost({ atk: 1, spa: 1 }, pokemon);
			}
		},
		flags: {},
		name: "Intrepid Sword",
		rating: 4,
		num: 234,
	},
	inversion: {
		onStart(source) {
			this.field.setTerrain('inverseterrain');
		},
		onChangeBoost(boost, target, source, effect) {
			if (effect && effect.id === 'zpower') return;
			let i: BoostID;
			for (i in boost) {
				boost[i]! *= -1;
			}
		},
		flags: {},
		name: "Inversion",
		rating: 4,
		num: 10001,
	},
	ironbarbs: {
		onDamagingHitOrder: 1,
		onDamagingHit(damage, target, source, move) {
			if (this.checkMoveMakesContact(move, source, target, true)) {
				this.damage(source.baseMaxhp / 8, source, target);
			}
		},
		flags: {},
		name: "Iron Barbs",
		rating: 2.5,
		num: 160,
	},
	ironclad: {
		onModifyTypePriority: -1,
		onModifyType(move, pokemon) {
			const noModifyType = [
				'judgment', 'multiattack', 'naturalgift', 'revelationdance', 'technoblast', 'terrainpulse', 'weatherball',
			];
			if (move.type === 'Normal' && (!noModifyType.includes(move.id) || this.activeMove?.isMax) &&
				!(move.isZ && move.category !== 'Status') && !(move.name === 'Tera Blast' && pokemon.terastallized)) {
				move.type = 'Steel';
				move.typeChangerBoosted = this.effect;
			}
		},
		onBasePowerPriority: 23,
		onBasePower(basePower, pokemon, target, move) {
			if (move.typeChangerBoosted === this.effect) {
				if (this.field.isTerrain(['factoryterrain', 'shortcircuitterrain', 'fairytaleterrain', 'dragonsdenterrain', 'starlightarenaterrain', 'newworldterrain', 'holyterrain'])) return this.chainModify(1.5);
				return this.chainModify(1.2);
			}
		},
		onImmunity(type, pokemon) {
			if (type === 'hail' && this.field.isTerrain('coldeclipseterrain')) return false;
		},
		flags: {},
		name: "Ironclad",
		rating: 4,
		num: 10004,
	},
	argentdevotion: {
		onStart(pokemon) {
			this.dex.abilities.get('swornduty').onStart?.call(this, pokemon);
		},
		onModifyTypePriority: -1,
		onModifyType(move, pokemon) {
			this.dex.abilities.get('ironclad').onModifyType?.call(this, move, pokemon);
		},
		onBasePowerPriority: 23,
		onBasePower(basePower, pokemon, target, move) {
			let modifier = 1;
			if (move.typeChangerBoosted === this.effect) {
				modifier *= this.field.isTerrain(['factoryterrain', 'shortcircuitterrain', 'fairytaleterrain', 'dragonsdenterrain', 'starlightarenaterrain', 'newworldterrain', 'holyterrain']) ? 1.5 : 1.2;
			}
			if (modifier !== 1) return this.chainModify(modifier);
		},
		onImmunity(type, pokemon) {
			if (type === 'hail' && this.field.isTerrain('coldeclipseterrain')) return false;
		},
		flags: { breakable: 1 },
		name: "Argent Devotion",
		rating: 4.5,
		num: 10199,
	},
	ironfist: {
		onBasePowerPriority: 23,
		onBasePower(basePower, attacker, defender, move) {
			if (move.flags['punch']) {
				this.debug('Iron Fist boost');
				return this.chainModify(1.4);
			}
		},
		flags: {},
		name: "Iron Fist",
		rating: 3,
		num: 89,
	},
	justified: {
		onDamagingHit(damage, target, source, move) {
			if (move && this.movehasType(move, 'Dark')) {
				if (this.field.isTerrain('holyterrain')) {
					this.boost({ atk: 2 });
				} else {
					this.boost({ atk: 1 });
				}
			}
		},
		flags: {},
		name: "Justified",
		rating: 2.5,
		num: 154,
	},
	keeneye: {
		onStart(pokemon) {
			if (this.field.isTerrain('mirrorarenaterrain')) {
				this.boost({ accuracy: 1 }, pokemon);
				pokemon.addVolatile('laserfocus');
			}
		},
		onTryBoost(boost, target, source, effect) {
			if (source && target === source) return;
			if (boost.accuracy && boost.accuracy < 0) {
				delete boost.accuracy;
				if (!(effect as ActiveMove).secondaries) {
					this.add("-fail", target, "unboost", "accuracy", "[from] ability: Keen Eye", `[of] ${target}`);
				}
			}
		},
		onModifyMove(move) {
			move.ignoreEvasion = true;
		},
		flags: { breakable: 1 },
		name: "Keen Eye",
		rating: 0.5,
		num: 51,
	},
	klutz: {
		// Klutz isn't technically active immediately in-game, but it activates early enough to beat all items
		// we should keep an eye out in future gens for items that activate on switch-in before Unnerve
		onSwitchInPriority: 1,
		// Item suppression implemented in Pokemon.ignoringItem() within sim/pokemon.js
		onStart(pokemon) {
			this.singleEvent('End', pokemon.getItem(), pokemon.itemState, pokemon);
		},
		onTryMove(source, target, move) {
			const chessMoves = ["ancientpower", "barrage", "continentalcrush", "psychic", "rockthrow", "secretpower", "shatteredpsyche", "strength"];
			if (this.field.isTerrain('chessboardterrain') && chessMoves.includes(move.id)) {
				this.add('-message', 'It was too much a klutz to move the pieces!');
				return false;
			}
		},
		flags: {},
		name: "Klutz",
		rating: -1,
		num: 103,
	},
	leafguard: {
		onSetStatus(status, target, source, effect) {
			if (['sunnyday', 'desolateland'].includes(target.effectiveWeather()) || this.field.isTerrain('forestterrain') || this.field.isTerrain('grassyterrain')) {
				if ((effect as Move)?.status) {
					this.add('-immune', target, '[from] ability: Leaf Guard');
				}
				return false;
			}
		},
		onTryAddVolatile(status, target) {
			if (status.id === 'yawn' && (['sunnyday', 'desolateland'].includes(target.effectiveWeather()) || this.field.isTerrain('forestterrain') || this.field.isTerrain('grassyterrain'))) {
				this.add('-immune', target, '[from] ability: Leaf Guard');
				return null;
			}
		},
		flags: { breakable: 1 },
		name: "Leaf Guard",
		rating: 0.5,
		num: 102,
	},
	levitate: {
		// airborneness implemented in sim/pokemon.js:Pokemon#isGrounded
		flags: { breakable: 1 },
		name: "Levitate",
		rating: 3.5,
		num: 26,
	},
	libero: {
		onPrepareHit(source, target, move) {
			if (move.hasBounced || move.flags['futuremove'] || move.sourceEffect === 'snatch' || move.callsMove) return;
			const type = move.type;
			if (type && type !== '???' && source.getTypes().join() !== type) {
				if (!source.setType(type)) return;
				this.add('-start', source, 'typechange', type, '[from] ability: Libero');
			}
		},
		flags: {},
		name: "Libero",
		rating: 4,
		num: 236,
	},
	lightmetal: {
		onStart(pokemon) {
			if (this.field.isTerrain('factoryterrain')) {
				this.boost({ spe: 1 }, pokemon);
				this.add('-message', pokemon.name + '\'s light body made it nimble');
			}
		},
		onModifyWeight(weighthg) {
			return this.trunc(weighthg / 2);
		},
		onModifySpe(spe, pokemon) {
			if (!pokemon.status) {
				return this.chainModify(1.25);
			}
		},
		flags: { breakable: 1 },
		name: "Light Metal",
		rating: 1,
		num: 135,
	},
	lightningrod: {
		onStart(pokemon) {
			if (this.field.isTerrain('electricterrain')) {
				this.boost({ spa: 1 });
			}
		},
		onTryHit(target, source, move) {
			if (target !== source && this.movehasType(move, 'Electric')) {
				if (!this.boost({ spa: 1, atk: 1 })) {
					this.add('-immune', target, '[from] ability: Lightning Rod');
				}
				return null;
			}
		},
		onAnyRedirectTarget(target, source, source2, move) {
			if (!this.movehasType(move, 'Electric')) return;
			const redirectTarget = ['randomNormal', 'adjacentFoe'].includes(move.target) ? 'normal' : move.target;
			if (this.validTarget(this.effectState.target, source, redirectTarget)) {
				if (move.smartTarget) move.smartTarget = false;
				if (this.effectState.target !== target) {
					this.add('-activate', this.effectState.target, 'ability: Lightning Rod');
				}
				return this.effectState.target;
			}
		},
		flags: { breakable: 1 },
		name: "Lightning Rod",
		rating: 3,
		num: 31,
	},
	limber: {
		onUpdate(pokemon) {
			if (pokemon.status === 'par') {
				this.add('-activate', pokemon, 'ability: Limber');
				pokemon.cureStatus();
			}
		},
		onSetStatus(status, target, source, effect) {
			if (status.id !== 'par') return;
			if ((effect as Move)?.status) {
				this.add('-immune', target, '[from] ability: Limber');
			}
			return false;
		},
		onTryBoost(boost, target, source, effect) {
			if (source && target === source) return;
			if (boost.spe && boost.spe < 0) {
				delete boost.spe;
				if (!(effect as ActiveMove).secondaries) {
					this.add("-fail", target, "unboost", "speed", "[from] ability: Limber", `[of] ${target}`);
				}
			}
		},
		flags: { breakable: 1 },
		name: "Limber",
		rating: 2,
		num: 7,
	},
	lingeringaroma: {
		onDamagingHit(damage, target, source, move) {
			const sourceAbility = source.getAbility();
			if (sourceAbility.flags['cantsuppress'] || sourceAbility.id === 'lingeringaroma') {
				return;
			}
			if (this.checkMoveMakesContact(move, source, target, !source.isAlly(target))) {
				source.setAbility('lingeringaroma', target);
			}
		},
		flags: {},
		name: "Lingering Aroma",
		rating: 2,
		num: 268,
	},
	liquidooze: {
		onSourceTryHeal(damage, target, source, effect) {
			this.debug(`Heal is occurring: ${target} <- ${source} :: ${effect.id}`);
			const canOoze = ['drain', 'leechseed', 'strengthsap'];
			if (canOoze.includes(effect.id)) {
				if (this.field.isTerrain('murkwatersurfaceterrain') || this.field.isTerrain('wastelandterrain')) {
					this.damage(damage * 2);
				} else {
					this.damage(damage);
				}
				return 0;
			}
		},
		flags: {},
		name: "Liquid Ooze",
		rating: 2.5,
		num: 64,
	},
	liquidvoice: {
		onModifyTypePriority: -1,
		onModifyType(move, pokemon) {
			if (move.flags['sound']) { // hardcode
				if (this.field.isTerrain('icyterrain')) {
					move.type = 'Ice';
				} else {
					move.type = 'Water';
				}
			}
		},
		onBasePower(basePower, source, target, move) {
			if (move.flags.sound) {
				return this.chainModify(1.2);
			}
		},
		flags: {},
		name: "Liquid Voice",
		rating: 1.5,
		num: 204,
	},
	longreach: {
		onStart(pokemon) {
			this.boost({ accuracy: 1 }, pokemon, pokemon);
		},
		onModifyMove(move) {
			if (this.field.isTerrain('rockyterrain') || this.field.isTerrain('grassyterrain')) {
				if (move.accuracy !== true) {
					move.accuracy *= 0.9;
				}
			}
			delete move.flags['contact'];
			move.critModifier = 3;
		},
		onBasePower() {
			if (this.field.isTerrain('mountainterrain') || this.field.isTerrain('snowymountainterrain')) {
				return this.chainModify(1.5);
			}
		},
		flags: {},
		name: "Long Reach",
		rating: 1,
		num: 203,
	},
	magicbounce: {
		onTryHitPriority: 1,
		onStart(pokemon) {
			if (this.field.isTerrain('fairytaleterrain')) {
				this.boost({ spd: 1 }, pokemon);
			}
			if (this.field.isTerrain('mirrorarenaterrain')) {
				this.boost({ evasion: 1 }, pokemon);
			}
		},
		onTryHit(target, source, move) {
			if (target === source || move.hasBounced || !move.flags['reflectable']) {
				return;
			}
			const newMove = this.dex.getActiveMove(move.id);
			newMove.hasBounced = true;
			newMove.pranksterBoosted = false;
			this.actions.useMove(newMove, target, { target: source });
			if (this.field.isTerrain('mirrorarenaterrain')) {
				this.boost({ evasion: 1 }, source);
			}
			return null;
		},
		onAllyTryHitSide(target, source, move) {
			if (target.isAlly(source) || move.hasBounced || !move.flags['reflectable']) {
				return;
			}
			const newMove = this.dex.getActiveMove(move.id);
			newMove.hasBounced = true;
			newMove.pranksterBoosted = false;
			this.actions.useMove(newMove, this.effectState.target, { target: source });
			move.hasBounced = true; // only bounce once in free-for-all battles
			return null;
		},
		flags: { breakable: 1 },
		name: "Magic Bounce",
		rating: 4,
		num: 156,
	},
	lunarorbit: {
		onStart(pokemon) {
			this.field.addPseudoWeather('gravity', pokemon, this.effect);
		},
		onModifyMovePriority: -2,
		onModifyMove(move, pokemon) {
			this.dex.abilities.get('serenegrace').onModifyMove?.call(this, move, pokemon);
		},
		onTryHitPriority: 1,
		onTryHit(target, source, move) {
			if (target === source || move.hasBounced || !move.flags['reflectable']) {
				return;
			}
			const newMove = this.dex.getActiveMove(move.id);
			newMove.hasBounced = true;
			newMove.pranksterBoosted = false;
			this.actions.useMove(newMove, target, { target: source });
			if (this.field.isTerrain('mirrorarenaterrain')) {
				this.boost({ evasion: 1 }, source);
			}
			return null;
		},
		onAllyTryHitSide(target, source, move) {
			if (target.isAlly(source) || move.hasBounced || !move.flags['reflectable']) {
				return;
			}
			const newMove = this.dex.getActiveMove(move.id);
			newMove.hasBounced = true;
			newMove.pranksterBoosted = false;
			this.actions.useMove(newMove, this.effectState.target, { target: source });
			move.hasBounced = true;
			return null;
		},
		flags: { breakable: 1 },
		name: "Lunar Orbit",
		rating: 4.5,
		num: 10140,
	},
	magicguard: {
		onStart() {
			if (this.field.isTerrain('fairytaleterrain')) {
				this.boost({ spd: 1 });
			}
		},
		onDamage(damage, target, source, effect) {
			if (effect.effectType !== 'Move') {
				if (effect.effectType === 'Ability') this.add('-activate', source, 'ability: ' + effect.name);
				return false;
			}
		},
		flags: {},
		name: "Magic Guard",
		rating: 4,
		num: 98,
	},
	magician: {
		onStart(pokemon) {
			if (this.field.isTerrain(['fairytaleterrain', 'bewitchedwoodsterrain', 'hauntedterrain', 'mistyterrain', 'newworldterrain'])) {
				this.boost({ spa: 1 }, pokemon, pokemon, this.effect);
			}
		},
		onModifyAccuracy(accuracy, target, source, move) {
			if (move.category === 'Status' && typeof accuracy === 'number' && this.field.isTerrain('psychicterrain')) {
				this.debug('Wonder Skin - setting accuracy to 50');
				return 50;
			}
		},
		onAfterMoveSecondarySelf(source, target, move) {
			if (!move || !target || source.switchFlag === true) return;
			if (target !== source && move.category !== 'Status') {
				if (source.item || source.volatiles['gem'] || move.id === 'fling') return;
				const yourItem = target.takeItem(source);
				if (!yourItem) return;
				if (!source.setItem(yourItem)) {
					target.item = yourItem.id; // bypass setItem so we don't break choicelock or anything
					return;
				}
				this.add('-item', source, yourItem, '[from] ability: Magician', `[of] ${target}`);
			}
		},
		flags: {},
		name: "Magician",
		rating: 1,
		num: 170,
	},
	magmaarmor: {
		onUpdate(pokemon) {
			if (pokemon.status === 'frz') {
				this.add('-activate', pokemon, 'ability: Magma Armor');
				pokemon.cureStatus();
			}
		},
		onStart(pokemon) {
			if (this.field.isTerrain(['dragonsdenterrain', 'volcanicterrain', 'coldeclipseterrain'])) {
				this.boost({ def: 1, spd: 1 }, pokemon, pokemon);
			}
		},
		onTryHit(target, source, move) {
			if (target !== source && this.movehasType(move, 'Fire') && this.field.isTerrain('dragonsdenterrain')) {
				move.accuracy = true;
				if (!target.addVolatile('magmaarmor')) {
					this.add('-immune', target, '[from] ability: Magma Armor');
				}
				return null;
			}
		},
		onSourceModifyAtkPriority: 6,
		onSourceModifyAtk(atk, attacker, defender, move) {
			if (move && this.movehasType(move, ['Water', 'Ice'])) {
				this.debug('Magma Armor weaken');
				return this.chainModify(0.5);
			}
		},
		onSourceModifySpAPriority: 5,
		onSourceModifySpA(atk, attacker, defender, move) {
			if (move && this.movehasType(move, ['Water', 'Ice'])) {
				this.debug('Magma Armor weaken');
				return this.chainModify(0.5);
			}
		},
		onImmunity(type, pokemon) {
			if (type === 'frz' && !this.field.isTerrain('coldeclipseterrain')) return false;
		},
		flags: { breakable: 1 },
		name: "Magma Armor",
		rating: 0.5,
		num: 40,
	},
	magnetpull: {
		onFoeTrapPokemon(pokemon) {
			if (pokemon.hasType('Steel') && pokemon.isAdjacent(this.effectState.target)) {
				pokemon.tryTrap(true);
			}
		},
		onFoeMaybeTrapPokemon(pokemon, source) {
			if (!source) source = this.effectState.target;
			if (!source || !pokemon.isAdjacent(source)) return;
			if (!pokemon.knownType || pokemon.hasType('Steel')) {
				pokemon.maybeTrapped = true;
			}
		},
		flags: {},
		name: "Magnet Pull",
		rating: 4,
		num: 42,
	},
	marvelscale: {
		onModifyDefPriority: 6,
		onModifyDef(def, pokemon) {
			if (pokemon.status || this.field.isTerrain(['mistyterrain', 'rainbowterrain', 'fairytaleterrain', 'dragonsdenterrain', 'starlightarenaterrain'])) {
				return this.chainModify(1.5);
			}
		},
		flags: { breakable: 1 },
		name: "Marvel Scale",
		rating: 2.5,
		num: 63,
	},
	prismscale: {
		onModifyDefPriority: 6,
		onModifyDef(def, pokemon) {
			return this.dex.abilities.get('marvelscale').onModifyDef?.call(this, def, pokemon);
		},
		onImmunity(type, pokemon) {
			return this.dex.abilities.get('selfsufficient').onImmunity?.call(this, type, pokemon);
		},
		onResidual(pokemon) {
			this.dex.abilities.get('selfsufficient').onResidual?.call(this, pokemon);
		},
		onModifyTypePriority: -1,
		onModifyType(move, pokemon) {
			return this.dex.abilities.get('dragonize').onModifyType?.call(this, move, pokemon);
		},
		onModifySTAB(stab, source, target, move) {
			return this.dex.abilities.get('dragonize').onModifySTAB?.call(this, stab, source, target, move);
		},
		onBasePowerPriority: 23,
		onBasePower(basePower, pokemon, target, move) {
			return this.dex.abilities.get('dragonize').onBasePower?.call(this, basePower, pokemon, target, move);
		},
		flags: { breakable: 1 },
		name: "Prism Scale",
		rating: 4,
		num: 10257,
	},
	megalauncher: {
		onBasePowerPriority: 19,
		onBasePower(basePower, attacker, defender, move) {
			if (move.flags['pulse'] || move.flags['bullet']) {
				return this.chainModify(1.5);
			}
		},
		flags: {},
		name: "Mega Launcher",
		rating: 3,
		num: 178,
	},
	megasol: {
		onWeatherModifyDamage(damage, attacker, defender, move) {
			if (this.field.weather !== 'sunnyday') {
				(this.dex.conditions.getByID('sunnyday' as ID) as any).onWeatherModifyDamage
					.call(this, damage, attacker, defender, move);
			}
		},
		flags: {},
		name: "Mega Sol",
		rating: 3,
		num: 315,
		// Partially implemented in Pokemon.effectiveWeather() in sim/pokemon.ts
	},
	bloomingsun: {
		onStart(pokemon) {
			this.dex.abilities.get('megasol').onStart?.call(this, pokemon);
		},
		onSwitchOut(pokemon) {
			return this.dex.abilities.get('naturalcure').onSwitchOut?.call(this, pokemon);
		},
		onAnyTryHeal(damage, target, source, effect) {
			return this.dex.abilities.get('invigorate').onAnyTryHeal?.call(this, damage, target, source, effect);
		},
		onAllyModifyAtkPriority: 3,
		onAllyModifyAtk(atk, pokemon) {
			return this.chainModify(1.5);
		},
		onAllyModifySpDPriority: 4,
		onAllyModifySpD(spd, pokemon) {
			return this.chainModify(1.5);
		},
		flags: { breakable: 1 },
		name: "Blooming Sun",
		rating: 4,
		num: 10182,
	},
	/*
		onWeatherModifyDamage(damage, attacker, defender, move) {
			if (this.field.weather !== 'sunnyday') {
				(this.dex.conditions.getByID('sunnyday' as ID) as any).onWeatherModifyDamage
					.call(this, damage, attacker, defender, move);
			}
		},
		onSetStatus(status, target, source, effect) {
			if ((effect as Move)?.status) {
				this.add('-immune', target, '[from] ability: Blooming Sun');
			}
			return false;
		},
		onTryAddVolatile(status, target) {
			if (status.id === 'yawn') {
				this.add('-immune', target, '[from] ability: Blooming Sun');
				return null;
			}
		},
		onAllyModifyAtkPriority: 3,
		onAllyModifyAtk(atk, pokemon) {
			return this.chainModify(1.5);
		},
		onAllyModifySpDPriority: 4,
		onAllyModifySpD(spd, pokemon) {
			return this.chainModify(1.5);
		},
		onAllyTryBoost(boost, target, source, effect) {
			if ((source && target === source) || (!target.hasType('Grass') && !this.field.isTerrain('bewitchedwoodsterrain'))) return;
			let showMsg = false;
			let i: BoostID;
			for (i in boost) {
				if (boost[i]! < 0) {
					delete boost[i];
					showMsg = true;
				}
			}
			if (showMsg && !(effect as ActiveMove).secondaries) {
				const effectHolder = this.effectState.target;
				this.add('-block', target, 'ability: Blooming Sun', '[of] ' + effectHolder);
			}
		},
		onAllySetStatus(status, target, source, effect) {
			if ((target.hasType('Grass') || this.field.isTerrain('bewitchedwoodsterrain')) && source && target !== source && effect && effect.id !== 'yawn') {
				this.debug('interrupting setStatus with Blooming Sun');
				if (effect.name === 'Synchronize' || (effect.effectType === 'Move' && !effect.secondaries)) {
					const effectHolder = this.effectState.target;
					this.add('-block', target, 'ability: Blooming Sun', '[of] ' + effectHolder);
				}
				return null;
			}
		},
		onAllyTryAddVolatile(status, target) {
			if ((target.hasType('Grass') || this.field.isTerrain('bewitchedwoodsterrain')) && status.id === 'yawn') {
				this.debug('Blooming Sun blocking yawn');
				const effectHolder = this.effectState.target;
				this.add('-block', target, 'ability: Blooming Sun', '[of] ' + effectHolder);
				return null;
			}
		},
		flags: { breakable: 1 },
		name: "Blooming Sun",
		rating: 4,
		num: 10182,
	*/
	merciless: {
		onModifyCritRatio(critRatio, source, target) {
			let modifier = 0;
			if (this.field.isTerrain('chessboardterrain')) {
				modifier += this.clampIntRange((1 - target.hp / target.baseMaxhp) / 0.2, 0, 3);
			}
			if (target && ['psn', 'tox'].includes(target.status) || this.field.isTerrain(['corrosivemistterrain', 'corrosiveterrain', 'murkwatersurfaceterrain', 'wastelandterrain']))
				modifier += 5;
			return modifier;
		},
		flags: {},
		name: "Merciless",
		rating: 1.5,
		num: 196,
	},
	mimicry: {
		onSwitchInPriority: -1,
		onStart(pokemon) {
			this.singleEvent('TerrainChange', this.effect, this.effectState, pokemon);
		},
		onTerrainChange(pokemon) {
			let newType = 'Normal';
			const terrainTypeMap = new Map<string, string>([
				['ashenbeachterrain', 'Ground'],
				['bewitchedwoodsterrain', 'Fairy'],
				['bigtopterrain', 'Fighting'],
				['burningterrain', 'Fire'],
				['caveterrain', 'Rock'],
				['chessboardterrain', 'Psychic'],
				['corrosivemistterrain', 'Poison'],
				['corrosiveterrain', 'Poison'],
				['coldeclipseterrain', 'Ice'],
				['darkcrystalcavernterrain', 'Dark'],
				['desertterrain', 'Ground'],
				['dragonsdenterrain', 'Dragon'],
				['electricterrain', 'Electric'],
				['factoryterrain', 'Steel'],
				['fairytaleterrain', 'Fairy'],
				['forestterrain', 'Grass'],
				['glitchterrain', '???'],
				['grassyterrain', 'Grass'],
				['hauntedterrain', 'Ghost'],
				['holyterrain', 'Normal'],
				['icyterrain', 'Ice'],
				['inverseterrain', 'Normal'],
				['mirrorarenaterrain', 'Steel'],
				['mistyterrain', 'Fairy'],
				['mountainterrain', 'Rock'],
				['murkwatersurfaceterrain', 'Poison'],
				['psychicterrain', 'Psychic'],
				['rainbowterrain', 'Dragon'],
				['rockyterrain', 'Rock'],
				['shortcircuitterrain', 'Electric'],
				['snowymountainterrain', 'Ice'],
				['starlightarenaterrain', 'Dark'],
				['superheatedterrain', 'Fire'],
				['swampterrain', 'Water'],
				['underwaterterrain', 'Water'],
				['volcanicterrain', 'Fire'],
				["wastelandterrain", "Poison"],
				['watersurfaceterrain', 'Water'],
			]);
			if (this.field.isTerrain('crystalcavernterrain')) {
				const counter = ['Fire', 'Water', 'Grass', 'Psychic'];
				newType = counter[this.CrystalCavernCounter];
			} else if (this.field.isTerrain('newworldterrain')) {
				const types = ['Grass', 'Fire', 'Water', 'Electric', 'Ice', 'Dragon', 'Psychic', 'Normal', 'Fighting', 'Ghost', 'Poison', 'Bug', 'Flying', 'Ground', 'Rock', 'Dark', 'Steel', 'Fairy'];
				newType = this.sample(types);
			} else {
				const possibleType = terrainTypeMap.get(this.field.getTerrain().id);
				newType = possibleType !== undefined ? possibleType : newType;
			}
			const oldTypes = pokemon.getTypes();
			if (oldTypes.join() === newType || !pokemon.setType(newType)) return;
			if (this.field.terrain || pokemon.transformed) {
				this.add('-start', pokemon, 'typechange', newType, '[from] ability: Mimicry');
				if (this.field.isTerrain('coldeclipseterrain')) this.boost({ def: 1, spd: 1 }, pokemon, pokemon);
				if (!this.field.terrain) this.hint("Transform Mimicry changes you to your original un-transformed types.");
			} else {
				this.add('-activate', pokemon, 'ability: Mimicry');
				this.add('-end', pokemon, 'typechange', '[silent]');
			}
		},
		flags: {},
		name: "Mimicry",
		rating: 0,
		num: 250,
	},
	mindseye: {
		onModifySTAB(stab, source, target, move) {
			if ((move.type === 'Fairy' || move.type === 'Dark') && !source.hasType(move.type)) return 1.5;
		},
		onSourceModifyDamage(damage, source, target, move) {
			if (move.category !== 'Status') return this.chainModify(this.field.isTerrain('coldeclipseterrain') ? 0.7 : 0.8);
		},
		onSourceDamagingHit(damage, target, source, move) {
			if (move.category !== 'Status') this.heal(source.baseMaxhp / (this.field.isTerrain('coldeclipseterrain') ? 8 : 16), source, source);
		},
		onResidual(pokemon) {
			return this.dex.abilities.get('selfsufficient').onResidual?.call(this, pokemon);
		},
		onBasePower(basePower, source, target, move) {
			if (move.category !== 'Status' && this.field.isTerrain('coldeclipseterrain')) return this.chainModify(1.3);
		},
		onTryBoost(boost, target, source, effect) {
			if (source && target === source) return;
			if (boost.accuracy && boost.accuracy < 0) {
				delete boost.accuracy;
				if (!(effect as ActiveMove).secondaries) {
					this.add("-fail", target, "unboost", "accuracy", "[from] ability: Mind's Eye", `[of] ${target}`);
				}
			}
		},
		onModifyMovePriority: -5,
		onModifyMove(move) {
			move.ignoreEvasion = true;
			if (!move.ignoreImmunity) move.ignoreImmunity = {};
			if (move.ignoreImmunity !== true) {
				move.ignoreImmunity['Fighting'] = true;
				move.ignoreImmunity['Normal'] = true;
			}
		},
		flags: { breakable: 1 },
		name: "Mind's Eye",
		rating: 0,
		num: 300,
	},
	minus: {
		onModifySpAPriority: 5,
		onModifySpA(spa, pokemon, target, move) {
			let modifier = 1;
			if (this.field.isTerrain('electricterrain')) {
				modifier *= 1.5;
			}
			if (move && (move && this.movehasType(move, 'Electric') || this.movehasType(move, 'Steel'))) {
				modifier *= 1.3;
			}
			return this.chainModify(modifier);
		},
		onModifyAtk(atk, pokemon, target, move) {
			if (move && (move && this.movehasType(move, 'Electric') || this.movehasType(move, 'Steel'))) {
				return this.chainModify(1.3);
			}
		},
		flags: {},
		name: "Minus",
		rating: 0,
		num: 58,
	},
	mirrorarmor: {
		onStart(pokemon) {
			if (this.field.isTerrain('fairytaleterrain')) {
				this.boost({ def: 1, spd: 1 }, pokemon, pokemon, this.dex.abilities.get('mirrorarmor'));
			}
			if (this.field.isTerrain('mirrorarmor')) {
				this.boost({ evasion: 1 }, pokemon, pokemon, this.dex.abilities.get('mirrorarmor'));
			}
		},
		onFoeTryMove(target, source, move) {
			if (this.field.isTerrain('starlightarenaterrain')) {
				const targetAllExceptions = ['perishsong', 'flowershield', 'rototiller'];
				if (move.target === 'foeSide' || (move.target === 'all' && !targetAllExceptions.includes(move.id))) {
					return;
				}
				const dazzlingHolder = this.effectState.target;
				if ((source.isAlly(dazzlingHolder) || move.target === 'all') && move.priority > 0.1) {
					this.attrLastMove('[still]');
					this.add('cant', dazzlingHolder, 'ability: Mirror Armor', move, `[of] ${target}`);
					return false;
				}
			}
		},
		onTryBoost(boost, target, source, effect) {
			// Don't bounce self stat changes, or boosts that have already bounced
			if (!source || target === source || !boost || effect.name === 'Mirror Armor') return;
			if (effect.id === 'neutralization') {
				let showMsg = false;
				let b: BoostID;
				for (b in boost) {
					if (boost[b]! < 0) {
						delete boost[b];
						showMsg = true;
					}
				}
				if (showMsg) this.add("-fail", target, "unboost", "[from] ability: Mirror Armor", `[of] ${target}`);
				return;
			}
			let b: BoostID;
			for (b in boost) {
				if (boost[b]! < 0) {
					if (target.boosts[b] === -6) continue;
					const negativeBoost: SparseBoostsTable = {};
					negativeBoost[b] = boost[b];
					delete boost[b];
					if (source.hp) {
						this.add('-ability', target, 'Mirror Armor');
						this.boost(negativeBoost, source, target, null, true);
					}
				}
			}
		},
		flags: { breakable: 1 },
		name: "Mirror Armor",
		rating: 2,
		num: 240,
	},
	mistysurge: {
		onStart(source) {
			this.field.setTerrain('mistyterrain');
		},
		flags: {},
		name: "Misty Surge",
		rating: 3.5,
		num: 228,
	},
	moldbreaker: {
		onStart(pokemon) {
			this.add('-ability', pokemon, 'Mold Breaker');
		},
		onModifyMove(move) {
			move.ignoreAbility = true;
		},
		flags: {},
		name: "Mold Breaker",
		rating: 3,
		num: 104,
	},
	moody: {
		onResidualOrder: 28,
		onResidualSubOrder: 2,
		onResidual(pokemon) {
			let stats: BoostID[] = [];
			const boost: SparseBoostsTable = {};
			let statPlus: BoostID;
			for (statPlus in pokemon.boosts) {
				if (statPlus === 'accuracy' || statPlus === 'evasion') continue;
				if (pokemon.boosts[statPlus] < 6) {
					stats.push(statPlus);
				}
			}
			let randomStat: BoostID | undefined = stats.length ? this.sample(stats) : undefined;
			if (randomStat) boost[randomStat] = 2;

			stats = [];
			let statMinus: BoostID;
			for (statMinus in pokemon.boosts) {
				if (statMinus === 'accuracy' || statMinus === 'evasion') continue;
				if (pokemon.boosts[statMinus] > -6 && statMinus !== randomStat) {
					stats.push(statMinus);
				}
			}
			randomStat = stats.length ? this.sample(stats) : undefined;
			if (randomStat) boost[randomStat] = -1;

			this.boost(boost, pokemon, pokemon);
		},
		flags: {},
		name: "Moody",
		rating: 5,
		num: 141,
	},
	motordrive: {
		onTryHit(target, source, move) {
			if (target !== source && this.movehasType(move, 'Electric')) {
				let boost = 1;
				if (this.field.isTerrain('shortcircuitterrain') || this.field.isTerrain('factoryterrain')) {
					boost = 2;
				}
				if (!this.boost({ spe: boost })) {
					this.add('-immune', target, '[from] ability: Motor Drive');
				}
				return null;
			}
		},
		onResidual() {
			if (this.field.isTerrain('electricterrain')) {
				this.boost({ spe: 1 });
			}
		},
		flags: { breakable: 1 },
		name: "Motor Drive",
		rating: 3,
		num: 78,
	},
	moxie: {
		onSourceAfterFaint(length, target, source, effect) {
			if (effect && effect.effectType === 'Move') {
				this.boost({ atk: length }, source);
			}
		},
		flags: {},
		name: "Moxie",
		rating: 3,
		num: 153,
	},
	requiem: {
		advanceRequiem(target, source) {
			if (!target || target.fainted || !source || target.isAlly(source)) return;
			if (!target.volatiles['requiem']) {
				target.addVolatile('requiem', source, this.dex.abilities.get('requiem'));
			}
			const requiemState = target.volatiles['requiem'];
			if (!requiemState) return;
			const stage = requiemState.stage || 0;
			if (stage === 0) {
				if (!target.volatiles['perishsong'] && target.addVolatile('perishsong', source, this.dex.abilities.get('requiem'))) {
					this.add('-start', target, 'perish3', '[from] ability: Requiem', `[of] ${source}`);
				}
			} else if (stage === 1) {
				target.addVolatile('curse', source, this.dex.abilities.get('requiem'));
			}
			requiemState.stage = Math.min(stage + 1, 2);
		},
		onSourceDamagingHit(damage, target, source, move) {
			(this.effect as any).advanceRequiem.call(this, target, source);
		},
		onAnyFaint(fainted) {
			const pokemon = this.effectState.target;
			if (!pokemon || pokemon.fainted || fainted === pokemon) return;
			this.heal(pokemon.baseMaxhp / 4, pokemon, pokemon);
		},
		onDamagingHit(damage, target, source, move) {
			if (!source || source.fainted) return;
			(this.effect as any).advanceRequiem.call(this, source, target);
			this.dex.abilities.get('cursedbody').onDamagingHit?.call(this, damage, target, source, move);
		},
		onFaint(pokemon) {
			if (this.field.terrain === 'hauntedterrain') {
				this.field.terrainState.duration = Math.max(this.field.terrainState.duration || 0, 5);
			} else if (this.field.setTerrain('hauntedterrain', pokemon, this.dex.abilities.get('requiem'), true)) {
				this.field.terrainState.duration = 5;
			}
		},
		condition: {
			noCopy: true,
			onStart() {
				this.effectState.stage = 0;
			},
		},
		flags: { cantsuppress: 1 },
		name: "Requiem",
		rating: 4,
		num: 10208,
	},
	moonlitwings: {
		onModifyMove(move, pokemon) {
			this.dex.abilities.get('serenegrace').onModifyMove?.call(this, move, pokemon);
			if (this.movehasType(move, 'Fairy')) move.forceSTAB = true;
		},
		onSetStatus(status, target, source, effect) {
			if ((effect as Move)?.status) this.add('-immune', target, '[from] ability: Moonlit Wings');
			return false;
		},
		onTryAddVolatile(status, target) {
			if (status.id === 'yawn' || status.id === 'confusion') {
				this.add('-immune', target, '[from] ability: Moonlit Wings');
				return null;
			}
		},
		flags: {},
		name: "Moonlit Wings",
		rating: 4,
		num: 10209,
	},
	terastaladaptability: {
		onModifySTAB(stab, source, target, move) {
			if (this.movehasType(move, ['Rock', 'Poison'])) {
				return this.dex.abilities.get('adaptability').onModifySTAB?.call(this, stab, source, target, move);
			}
		},
		onBasePowerPriority: 21,
		onBasePower(basePower, source, target, move) {
			if (move.category !== 'Status' && !source.hasType(move.type)) return this.chainModify(1.5);
		},
		onAfterMove(source, target, move) {
			if (move.type && move.type !== '???') source.abilityState.terastalAdaptabilityType = move.type;
		},
		onSourceModifyDamage(damage, source, target, move) {
			const storedType = target.abilityState.terastalAdaptabilityType;
			if (!storedType || !move || move.category === 'Status') return;
			if (this.dex.getEffectiveness(move.type, storedType) < 0) return this.chainModify(0.5);
		},
		flags: {},
		name: "Terastal Adaptability",
		rating: 4.5,
		num: 10210,
	},
	frozenfortress: {
		onCriticalHit: false,
		onStart(pokemon) {
			this.dex.abilities.get('icebody').onStart?.call(this, pokemon);
		},
		onWeather(target, source, effect) {
			return this.dex.abilities.get('icebody').onWeather?.call(this, target, source, effect);
		},
		onDamagingHit(damage, target, source, move) {
			return this.dex.abilities.get('crumblingshell').onDamagingHit?.call(this, damage, target, source, move);
		},
		flags: {},
		name: "Frozen Fortress",
		rating: 4,
		num: 10236,
	},
	shelltrap: {
		onCriticalHit: false,
		onSourceModifyDamage(damage, source, target, move) { return this.dex.abilities.get('shellarmor').onSourceModifyDamage?.call(this, damage, source, target, move); },
		onSwitchOut(pokemon) {
			this.dex.abilities.get('regenerator').onSwitchOut?.call(this, pokemon);
		},
		flags: {},
		name: "Shell Trap",
		rating: 4.5,
		num: 10225,
	},
	paradoxwheel: {
		onModifyMove(move) {
			if (this.movehasType(move, ['Steel', 'Electric'])) move.forceSTAB = true;
		},
		flags: {},
		name: "Paradox Wheel",
		rating: 4,
		num: 10213,
	},
	paradoxpower: {
		onModifyMove(move, pokemon) {
			this.dex.abilities.get('sheerforce').onModifyMove?.call(this, move, pokemon);
			if (this.movehasType(move, 'Electric')) move.forceSTAB = true;
		},
		onBasePowerPriority: 21,
		onBasePower(basePower, pokemon, target, move) {
			return this.dex.abilities.get('sheerforce').onBasePower?.call(this, basePower, pokemon, target, move);
		},
		flags: {},
		name: "Paradox Power",
		rating: 4,
		num: 10214,
	},
	paradoxpull: {
		onFoeTrapPokemon(pokemon) {
			return this.dex.abilities.get('magnetpull').onFoeTrapPokemon?.call(this, pokemon);
		},
		onFoeMaybeTrapPokemon(pokemon, source) {
			return this.dex.abilities.get('magnetpull').onFoeMaybeTrapPokemon?.call(this, pokemon, source);
		},
		onEffectiveness(typeMod, target, type, move) {
			if (type === 'Steel' && typeMod > 0) return 0;
		},
		flags: {},
		name: "Paradox Pull",
		rating: 4,
		num: 10215,
	},
	wickedcommand: {
		onUpdate(pokemon) {
			this.dex.abilities.get('insomnia').onUpdate?.call(this, pokemon);
		},
		onSetStatus(status, target, source, effect) {
			return this.dex.abilities.get('insomnia').onSetStatus?.call(this, status, target, source, effect);
		},
		onTryAddVolatile(status, target) {
			return this.dex.abilities.get('insomnia').onTryAddVolatile?.call(this, status, target);
		},
		onModifyCritRatio(critRatio) {
			return this.dex.abilities.get('superluck').onModifyCritRatio?.call(this, critRatio);
		},
		onSourceModifyDamage(damage, source, target, move) {
			if (source && source !== target && move.category !== 'Status') return this.chainModify(0.8);
		},
		onSourceAfterFaint(length, target, source, effect) {
			if (!target || target.isAlly(source) || effect?.effectType !== 'Move') return;
			const atk = source.getStat('atk', false, true);
			const spa = source.getStat('spa', false, true);
			this.boost(atk >= spa ? { atk: 1 } : { spa: 1 }, source, source);
			this.heal(source.baseMaxhp / 4, source, source);
			for (const sideCondition of ['stealthrock', 'spikes', 'toxicspikes', 'stickyweb']) {
				if (source.side.removeSideCondition(sideCondition)) {
					this.add('-sideend', source.side, this.dex.conditions.get(sideCondition).name, '[from] ability: Wicked Command', `[of] ${source}`);
				}
			}
		},
		flags: {},
		name: "Wicked Command",
		rating: 4,
		num: 10207,
	},
	multiscale: {
		onSourceModifyDamage(damage, source, target, move) {
			if (target.hp >= target.maxhp) {
				this.debug('Multiscale weaken');
				return this.chainModify(0.5);
			}
		},
		flags: { breakable: 1 },
		name: "Multiscale",
		rating: 3.5,
		num: 136,
	},
	multitype: {
		// Multitype's type-changing itself is implemented in statuses.js
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, cantsuppress: 1 },
		name: "Multitype",
		rating: 4,
		num: 121,
	},
	mummy: {
		onDamagingHit(damage, target, source, move) {
			const sourceAbility = source.getAbility();
			if (sourceAbility.flags['cantsuppress'] || sourceAbility.id === 'mummy') {
				return;
			}
			if (this.checkMoveMakesContact(move, source, target, !source.isAlly(target))) {
				source.setAbility('mummy', target);
			}
		},
		flags: {},
		name: "Mummy",
		rating: 2,
		num: 152,
	},
	myceliummight: {
		onFractionalPriorityPriority: -1,
		onFractionalPriority(priority, pokemon, target, move) {
			if (move.category === 'Status') {
				return -0.1;
			}
		},
		onModifyMove(move, pokemon) {
			if (move.category === 'Status') {
				move.ignoreAbility = true;
				pokemon.abilityState.myceliumMightStatusTurn = this.turn;
			}
		},
		onSourceModifyDamage(damage, source, target, move) {
			if (target.abilityState.myceliumMightStatusTurn === this.turn && !target.moveThisTurnResult) {
				return this.chainModify(0.75);
			}
		},
		onAfterMoveSecondarySelf(source, target, move) {
			if (move.category === 'Status' && source.moveThisTurnResult) {
				this.heal(source.baseMaxhp / 8, source, source);
			}
		},
		onResidual(pokemon) {
			if (this.field.isTerrain('swampterrain')) {
				this.boost({ spd: 1, def: 1 });
			}
		},
		flags: {},
		name: "Mycelium Might",
		rating: 2,
		num: 298,
	},
	naturalcure: {
		onCheckShow(pokemon) {
			// This is complicated
			// For the most part, in-game, it's obvious whether or not Natural Cure activated,
			// since you can see how many of your opponent's pokemon are statused.
			// The only ambiguous situation happens in Doubles/Triples, where multiple pokemon
			// that could have Natural Cure switch out, but only some of them get cured.
			if (pokemon.side.active.length === 1) return;
			if (pokemon.showCure === true || pokemon.showCure === false) return;

			const cureList = [];
			let noCureCount = 0;
			for (const curPoke of pokemon.side.active) {
				// pokemon not statused
				if (!curPoke?.status) {
					// this.add('-message', "" + curPoke + " skipped: not statused or doesn't exist");
					continue;
				}
				if (curPoke.showCure) {
					// this.add('-message', "" + curPoke + " skipped: Natural Cure already known");
					continue;
				}
				const species = curPoke.species;
				// pokemon can't get Natural Cure
				if (!Object.values(species.abilities).includes('Natural Cure')) {
					// this.add('-message', "" + curPoke + " skipped: no Natural Cure");
					continue;
				}
				// pokemon's ability is known to be Natural Cure
				if (!species.abilities['1'] && !species.abilities['H']) {
					// this.add('-message', "" + curPoke + " skipped: only one ability");
					continue;
				}
				// pokemon isn't switching this turn
				if (curPoke !== pokemon && !this.queue.willSwitch(curPoke)) {
					// this.add('-message', "" + curPoke + " skipped: not switching");
					continue;
				}

				if (curPoke.hasAbility('naturalcure')) {
					// this.add('-message', "" + curPoke + " confirmed: could be Natural Cure (and is)");
					cureList.push(curPoke);
				} else {
					// this.add('-message', "" + curPoke + " confirmed: could be Natural Cure (but isn't)");
					noCureCount++;
				}
			}

			if (!cureList.length || !noCureCount) {
				// It's possible to know what pokemon were cured
				for (const pkmn of cureList) {
					pkmn.showCure = true;
				}
			} else {
				// It's not possible to know what pokemon were cured

				// Unlike a -hint, this is real information that battlers need, so we use a -message
				this.add('-message', `(${cureList.length} of ${pokemon.side.name}'s pokemon ${cureList.length === 1 ? "was" : "were"} cured by Natural Cure.)`);

				for (const pkmn of cureList) {
					pkmn.showCure = false;
				}
			}
		},
		onSwitchOut(pokemon) {
			if (!pokemon.status) return;

			// if pokemon.showCure is undefined, it was skipped because its ability
			// is known
			if (pokemon.showCure === undefined) pokemon.showCure = true;

			if (pokemon.showCure) this.add('-curestatus', pokemon, pokemon.status, '[from] ability: Natural Cure', '[silent]');
			pokemon.clearStatus();
			this.heal(pokemon.baseMaxhp / 3, pokemon, pokemon);

			// only reset .showCure if it's false
			// (once you know a Pokemon has Natural Cure, its cures are always known)
			if (!pokemon.showCure) pokemon.showCure = undefined;
		},
		onResidual(pokemon) {
			if (this.field.isTerrain('bewitchedwoodsterrain')) {
				this.add('-curestatus', pokemon, pokemon.status, '[from] ability: Natural Cure');
				pokemon.clearStatus();
			}
		},
		flags: {},
		name: "Natural Cure",
		rating: 2.5,
		num: 30,
	},
	neuroforce: {
		onModifyDamage(damage, source, target, move) {
			if (move && target.getMoveHitData(move).typeMod > 0) {
				return this.chainModify([5120, 4096]);
			}
		},
		flags: {},
		name: "Neuroforce",
		rating: 2.5,
		num: 233,
	},
	neutralization: {
		lowerOffense(target, source) {
			if (target.hasAbility(['neutralization', 'parasitism'])) return;
			const boosts = target.getStat('atk', false, true) >= target.getStat('spa', false, true) ?
				{ atk: -2, spe: -1 } : { spa: -2, spe: -1 };
			const effect = this.dex.abilities.get('neutralization');
			const changedBoosts = this.runEvent('ChangeBoost', target, source, effect, { ...boosts });
			const allowedBoosts = this.runEvent('TryBoost', target, source, effect, { ...target.getCappedBoost(changedBoosts) });
			if (!allowedBoosts) return;
			const cappedBoosts = target.getCappedBoost(allowedBoosts);
			let announced = false;
			for (const statName in cappedBoosts) {
				const stat = statName as BoostID;
				if (!cappedBoosts[stat]) continue;
				const boostBy = target.boostBy({ [stat]: cappedBoosts[stat] });
				const message = cappedBoosts[stat]! < 0 || target.boosts[stat] === -6 ? '-unboost' : '-boost';
				const amount = message === '-unboost' ? -boostBy : boostBy;
				if (!boostBy) {
					this.add('-unboost', target, stat, 0);
					continue;
				}
				if (!announced) {
					this.add('-ability', source, 'Neutralization');
					announced = true;
				}
				this.add(message, target, stat, amount);
			}
		},
		onStart(pokemon) {
			if (this.field.terrain === 'rainbowterrain') {
				this.field.clearTerrain('neutralization');
			}
		},
		onEnd(pokemon) {
			this.field.releaseNeutralizedTerrain(pokemon);
		},
		onFaint(pokemon) {
			this.field.releaseNeutralizedTerrain(pokemon);
		},
		onSourceHit(target, source, move) {
			if (!target || target === source || target.isAlly(source)) return;
			if (move.spreadHit) return;
			if (!move.spreadHit && !['normal', 'any', 'adjacentFoe'].includes(move.target)) return;
			this.effect.lowerOffense.call(this, target, source);
		},
		flags: {},
		name: "Neutralization",
		rating: 3,
		num: 10011,
	},
	neutralizinggas: {
		// Ability suppression implemented in sim/pokemon.ts:Pokemon#ignoringAbility
		onSwitchInPriority: 2,
		onSwitchIn(pokemon) {
			this.add('-ability', pokemon, 'Neutralizing Gas');
			pokemon.abilityState.ending = false;
			if (this.field.isTerrain('corrosiveterrain')) {
				this.field.terrainState.terrainChanges?.set('neutralizinggas', 1);
			}
			const strongWeathers = ['desolateland', 'primordialsea', 'deltastream'];
			for (const target of this.getAllActive()) {
				if (target.hasItem('Ability Shield')) {
					this.add('-block', target, 'item: Ability Shield');
					continue;
				}
				// Can't suppress a Tatsugiri inside of Dondozo already
				if (target.volatiles['commanding']) {
					continue;
				}
				if (target.illusion) {
					this.singleEvent('End', this.dex.abilities.get('Illusion'), target.abilityState, target, pokemon, 'neutralizinggas');
				}
				if (target.volatiles['slowstart']) {
					delete target.volatiles['slowstart'];
					this.add('-end', target, 'Slow Start', '[silent]');
				}
				if (strongWeathers.includes(target.getAbility().id)) {
					this.singleEvent('End', this.dex.abilities.get(target.getAbility().id), target.abilityState, target, pokemon, 'neutralizinggas');
				}
			}
		},
		onEnd(source) {
			if (source.transformed) return;
			if (this.field.isTerrain('corrosiveterrain')) {
				this.field.terrainState.terrainChanges?.delete('neutralizinggas');
			}
			for (const pokemon of this.getAllActive()) {
				if (pokemon !== source && pokemon.hasAbility('Neutralizing Gas')) {
					return;
				}
			}
			this.add('-end', source, 'ability: Neutralizing Gas');

			// FIXME this happens before the pokemon switches out, should be the opposite order.
			// Not an easy fix since we cant use a supported event. Would need some kind of special event that
			// gathers events to run after the switch and then runs them when the ability is no longer accessible.
			// (If you're tackling this, do note extreme weathers have the same issue)

			// Mark this pokemon's ability as ending so Pokemon#ignoringAbility skips it
			if (source.abilityState.ending) return;
			source.abilityState.ending = true;
			const sortedActive = this.getAllActive();
			this.speedSort(sortedActive);
			for (const pokemon of sortedActive) {
				if (pokemon !== source) {
					if (pokemon.getAbility().flags['cantsuppress']) continue; // does not interact with e.g Ice Face, Zen Mode
					if (pokemon.hasItem('abilityshield')) continue; // don't restart abilities that weren't suppressed

					// Will be suppressed by Pokemon#ignoringAbility if needed
					this.singleEvent('Start', pokemon.getAbility(), pokemon.abilityState, pokemon);
					if (pokemon.ability === "gluttony") {
						pokemon.abilityState.gluttony = false;
					}
				}
			}
		},
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, notransform: 1 },
		name: "Neutralizing Gas",
		rating: 3.5,
		num: 256,
	},
	noguard: {
		onAnyInvulnerabilityPriority: 1,
		onAnyInvulnerability(target, source, move) {
			if (move && (source === this.effectState.target || target === this.effectState.target)) return 0;
		},
		onAnyAccuracy(accuracy, target, source, move) {
			if (move && (source === this.effectState.target || target === this.effectState.target)) {
				return true;
			}
			return accuracy;
		},
		flags: {},
		name: "No Guard",
		rating: 4,
		num: 99,
	},
	normalize: {
		onModifyTypePriority: 1,
		onModifyType(move, pokemon) {
			const noModifyType = [
				'hiddenpower', 'judgment', 'multiattack', 'naturalgift', 'revelationdance', 'struggle', 'technoblast', 'terrainpulse', 'weatherball',
			];
			if (!(move.isZ && move.category !== 'Status') &&
				// TODO: Figure out actual interaction
				(!noModifyType.includes(move.id) || this.activeMove?.isMax) && !(move.name === 'Tera Blast' && pokemon.terastallized)) {
				move.type = 'Normal';
				move.typeChangerBoosted = this.effect;
			}
		},
		onBasePowerPriority: 23,
		onBasePower(basePower, pokemon, target, move) {
			if (move.typeChangerBoosted === this.effect) return this.chainModify([4915, 4096]);
		},
		flags: {},
		name: "Normalize",
		rating: 0,
		num: 96,
	},
	oblivious: {
		onUpdate(pokemon) {
			if (pokemon.volatiles['attract']) {
				this.add('-activate', pokemon, 'ability: Oblivious');
				pokemon.removeVolatile('attract');
				this.add('-end', pokemon, 'move: Attract', '[from] ability: Oblivious');
			}
			if (pokemon.volatiles['taunt']) {
				this.add('-activate', pokemon, 'ability: Oblivious');
				pokemon.removeVolatile('taunt');
				// Taunt's volatile already sends the -end message when removed
			}
		},
		onImmunity(type, pokemon) {
			if (type === 'attract') return false;
		},
		onTryHit(pokemon, target, move) {
			if (move.id === 'attract' || move.id === 'captivate' || move.id === 'taunt') {
				this.add('-immune', pokemon, '[from] ability: Oblivious');
				return null;
			}
		},
		onTryBoost(boost, target, source, effect) {
			if (effect.name === 'Intimidate' && boost.atk) {
				delete boost.atk;
				this.add('-fail', target, 'unboost', 'Attack', '[from] ability: Oblivious', `[of] ${target}`);
			}
		},
		flags: { breakable: 1 },
		name: "Oblivious",
		rating: 1.5,
		num: 12,
	},
	opportunist: {
		onFoeAfterBoost(boost, target, source, effect) {
			if (effect?.name === 'Opportunist' || effect?.name === 'Mirror Herb') return;
			if (!this.effectState.boosts) this.effectState.boosts = {} as SparseBoostsTable;
			const boostPlus = this.effectState.boosts;
			let i: BoostID;
			for (i in boost) {
				if (boost[i]! > 0) {
					boostPlus[i] = (boostPlus[i] || 0) + boost[i]!;
				}
			}
		},
		onAnySwitchInPriority: -3,
		onAnySwitchIn() {
			if (!this.effectState.boosts) return;
			this.boost(this.effectState.boosts, this.effectState.target);
			delete this.effectState.boosts;
		},
		onAnyAfterMega() {
			if (!this.effectState.boosts) return;
			this.boost(this.effectState.boosts, this.effectState.target);
			delete this.effectState.boosts;
		},
		onAnyAfterTerastallization() {
			if (!this.effectState.boosts) return;
			this.boost(this.effectState.boosts, this.effectState.target);
			delete this.effectState.boosts;
		},
		onAnyAfterMove() {
			if (!this.effectState.boosts) return;
			this.boost(this.effectState.boosts, this.effectState.target);
			delete this.effectState.boosts;
		},
		onResidualOrder: 29,
		onResidual(pokemon) {
			if (!this.effectState.boosts) return;
			this.boost(this.effectState.boosts, this.effectState.target);
			delete this.effectState.boosts;
		},
		onEnd() {
			delete this.effectState.boosts;
		},
		flags: {},
		name: "Opportunist",
		rating: 3,
		num: 290,
	},
	orichalcumpulse: {
		onStart(pokemon) {
			if (this.field.setWeather('sunnyday')) {
				this.add('-activate', pokemon, 'Orichalcum Pulse', '[source]');
			} else if (this.field.isWeather('sunnyday')) {
				this.add('-activate', pokemon, 'ability: Orichalcum Pulse');
			}
		},
		onModifyAtkPriority: 5,
		onModifyAtk(atk, pokemon) {
			if (['sunnyday', 'desolateland'].includes(pokemon.effectiveWeather())) {
				this.debug('Orichalcum boost');
				return this.chainModify([5461, 4096]);
			}
		},
		flags: {},
		name: "Orichalcum Pulse",
		rating: 4.5,
		num: 288,
	},
	overcoat: {
		onImmunity(type, pokemon) {
			if (type === 'sandstorm' || type === 'hail' || type === 'powder') return false;
		},
		onTryHitPriority: 1,
		onTryHit(target, source, move) {
			if (move.flags['powder'] && target !== source && this.dex.getImmunity('powder', target)) {
				this.add('-immune', target, '[from] ability: Overcoat');
				return null;
			}
		},
		flags: { breakable: 1 },
		name: "Overcoat",
		rating: 2,
		num: 142,
	},
	overgrow: {
		onModifyAtkPriority: 5,
		onModifyAtk(atk, attacker, defender, move) {
			if ((move && this.movehasType(move, 'Grass') && attacker.hp <= attacker.maxhp / 3) || this.field.isTerrain('grassyterrain')) {
				this.debug('Overgrow boost');
				return this.chainModify(1.5);
			}
		},
		onModifySpAPriority: 5,
		onModifySpA(atk, attacker, defender, move) {
			if ((move && this.movehasType(move, 'Grass') && attacker.hp <= attacker.maxhp / 3) || this.field.isTerrain('grassyterrain')) {
				this.debug('Overgrow boost');
				return this.chainModify(1.5);
			}
		},
		flags: {},
		name: "Overgrow",
		rating: 2,
		num: 65,
	},
	owntempo: {
		onUpdate(pokemon) {
			if (pokemon.volatiles['confusion']) {
				this.add('-activate', pokemon, 'ability: Own Tempo');
				pokemon.removeVolatile('confusion');
			}
		},
		onTryAddVolatile(status, pokemon) {
			if (status.id === 'confusion') return null;
		},
		onHit(target, source, move) {
			if (move?.volatileStatus === 'confusion') {
				this.add('-immune', target, 'confusion', '[from] ability: Own Tempo');
			}
		},
		onTryBoost(boost, target, source, effect) {
			if (effect.name === 'Intimidate' && boost.atk) {
				delete boost.atk;
				this.add('-fail', target, 'unboost', 'Attack', '[from] ability: Own Tempo', `[of] ${target}`);
			}
		},
		flags: { breakable: 1 },
		name: "Own Tempo",
		rating: 1.5,
		num: 20,
	},
	parentalbond: {
		onBasePower(basePower, attacker, defender, move) {
			return this.dex.abilities.get('toughclaws').onBasePower?.call(this, basePower, attacker, defender, move);
		},
		onAnyModifyDamage(damage, source, target, move) {
			if (target !== this.effectState.target && target.isAlly(this.effectState.target)) {
				this.debug('Parental Bond Friend Guard weaken');
				return this.chainModify(0.75);
			}
		},
		onPrepareHit(source, target, move) {
			if (move.category === 'Status' || move.multihit || move.flags['noparentalbond'] || move.flags['charge'] ||
				move.flags['futuremove'] || move.spreadHit || move.isZ || move.isMax) return;
			move.multihit = 2;
			move.multihitType = 'parentalbond';
		},
		onModifyMove(move) {
			if (!move.ignoreImmunity) move.ignoreImmunity = {};
			if (move.ignoreImmunity !== true) {
				move.ignoreImmunity['Fighting'] = true;
				move.ignoreImmunity['Normal'] = true;
			}
		},
		// Damage modifier implemented in BattleActions#modifyDamage()
		flags: { cantsuppress: 1 },
		name: "Parental Bond",
		rating: 4.5,
		num: 185,
	},
	pastelveil: {
		onStart(pokemon) {
			for (const ally of pokemon.alliesAndSelf()) {
				if (['psn', 'tox'].includes(ally.status)) {
					this.add('-activate', pokemon, 'ability: Pastel Veil');
					ally.cureStatus();
				}
			}
			if (this.field.isTerrain('fairytaleterrain')) {
				this.boost({ spd: 1 });
			}
		},
		onModifyDamage(damage, source, target, move) {
			if (target !== source && this.movehasType(move, 'Poison') && this.field.isTerrain(['mistyterrain', 'rainbowterrain'])) {
				this.debug('Pastel Veil weaken');
				return this.chainModify(0.5);
			}
		},
		onAllyModifyDamage(damage, source, target, move) {
			if (target !== source && this.movehasType(move, 'Poison') && this.field.isTerrain(['mistyterrain', 'rainbowterrain'])) {
				this.debug('Pastel Veil weaken');
				return this.chainModify(0.5);
			}
		},
		onAnyTryMove(source, target, move) {
			const holder = this.effectState.target;
			if (source === holder || source.isAlly(holder)) return;
			if (this.movehasType(move, 'Poison')) {
				this.add('-activate', holder, 'ability: Pastel Veil');
				this.boost({ atk: -1, spa: -1 }, source, holder, null, true);
			}
		},
		onEffectiveness(typeMod, target, type, move) {
			if (!target || move.category === 'Status' || !this.field.isTerrain('bewitchedwoodsterrain')) return;
			if (type === 'Fairy' && typeMod > 0) {
				return 0;
			}
		},
		onUpdate(pokemon) {
			if (['psn', 'tox'].includes(pokemon.status)) {
				this.add('-activate', pokemon, 'ability: Pastel Veil');
				pokemon.cureStatus();
			}
		},
		onAnySwitchIn() {
			((this.effect as any).onStart as (p: Pokemon) => void).call(this, this.effectState.target);
		},
		onSetStatus(status, target, source, effect) {
			if (!['psn', 'tox'].includes(status.id)) return;
			if ((effect as Move)?.status) {
				this.add('-immune', target, '[from] ability: Pastel Veil');
			}
			return false;
		},
		onAllySetStatus(status, target, source, effect) {
			if (!['psn', 'tox'].includes(status.id)) return;
			if ((effect as Move)?.status) {
				const effectHolder = this.effectState.target;
				this.add('-block', target, 'ability: Pastel Veil', `[of] ${effectHolder}`);
			}
			return false;
		},
		flags: { breakable: 1 },
		name: "Pastel Veil",
		rating: 2,
		num: 257,
	},
	perishbody: {
		onDamagingHit(damage, target, source, move) {
			if (!source || source.fainted || source.isAlly(target)) return;
			if (this.field.isTerrain('holyterrain')) return;

			this.add('-ability', target, 'Perish Body');
			let applied = false;
			for (const foe of target.foes()) {
				if (!foe || foe.fainted) continue;
				const perishSong = foe.volatiles['perishsong'];
				if (perishSong) {
					perishSong.duration = Math.max(1, perishSong.duration - 1);
				} else {
					foe.addVolatile('perishsong');
					this.add('-start', foe, 'perish3', '[silent]');
					applied = true;
				}
			}
			if (applied) this.add('-fieldactivate', 'move: Perish Song');
			if (this.field.isTerrain('hauntedterrain')) {
				target.addVolatile('perishbody', target);
			}
		},
		condition: {
			onFoeTrapPokemon(pokemon) {
				if (!pokemon.hasAbility('shadowtag') && pokemon.isAdjacent(this.effectState.target)) {
					pokemon.tryTrap(true);
				}
			},
			onFoeMaybeTrapPokemon(pokemon, source) {
				if (!source) source = this.effectState.target;
				if (!source || !pokemon.isAdjacent(source)) return;
				if (!pokemon.hasAbility('shadowtag')) {
					pokemon.maybeTrapped = true;
				}
			},
		},
		flags: {},
		name: "Perish Body",
		rating: 1,
		num: 253,
	},
	pickpocket: {
		onAfterMoveSecondary(target, source, move) {
			if (source && source !== target && move?.flags['contact']) {
				if (target.item || target.switchFlag || target.forceSwitchFlag || source.switchFlag === true) {
					return;
				}
				const yourItem = source.takeItem(target);
				if (!yourItem) {
					return;
				}
				if (!target.setItem(yourItem)) {
					source.item = yourItem.id;
					return;
				}
				this.add('-enditem', source, yourItem, '[silent]', '[from] ability: Pickpocket', `[of] ${source}`);
				this.add('-item', target, yourItem, '[from] ability: Pickpocket', `[of] ${source}`);
			}
		},
		flags: {},
		name: "Pickpocket",
		rating: 1,
		num: 124,
	},
	pickup: {
		onResidualOrder: 28,
		onResidualSubOrder: 2,
		onResidual(pokemon) {
			if (pokemon.item) return;
			const pickupTargets = this.getAllActive().filter(target => (
				target.lastItem && target.usedItemThisTurn && pokemon.isAdjacent(target)
			));
			if (!pickupTargets.length) return;
			const randomTarget = this.sample(pickupTargets);
			const item = randomTarget.lastItem;
			randomTarget.lastItem = '';
			this.add('-item', pokemon, this.dex.items.get(item), '[from] ability: Pickup');
			pokemon.setItem(item);
		},
		flags: {},
		name: "Pickup",
		rating: 0.5,
		num: 53,
	},
	piercingdrill: {
		isNonstandard: "Future",
		onStart(pokemon) {
			this.add('-ability', pokemon, 'Mold Breaker');
		},
		onModifyMove(move) {
			move.ignoreAbility = true;
			if (move.flags['drill'] && this.field.isTerrain(['rockyterrain', 'mountainterrain', 'snowymountainterrain', 'caveterrain', 'volcanicterrain'])) delete move.flags['protect'];
		},
		onBasePowerPriority: 19,
		onBasePower(basePower, attacker, defender, move) {
			if (move.flags['drill']) {
				if (this.field.isTerrain(['rockyterrain', 'mountainterrain', 'snowymountainterrain', 'caveterrain', 'volcanicterrain'])) return this.chainModify(2);
				return this.chainModify(1.5);
			}
		},
		onHitProtect(source, target, move) {
			if (move.flags['contact']) {
				target.getMoveHitData(move).bypassProtect = this.effect;
				return false;
			}
		},
		// breaking protect handled in Battle#checkMoveBypassesProtect()
		flags: {},
		name: "Piercing Drill",
		rating: 1,
		num: 311,
	},
	pixilate: {
		onModifyTypePriority: -1,
		onModifyType(move, pokemon) {
			const noModifyType = [
				'judgment', 'multiattack', 'naturalgift', 'revelationdance', 'technoblast', 'terrainpulse', 'weatherball',
			];
			if (move.type === 'Normal' && (!noModifyType.includes(move.id) || this.activeMove?.isMax) &&
				!(move.isZ && move.category !== 'Status') && !(move.name === 'Tera Blast' && pokemon.terastallized)) {
				move.type = 'Fairy';
				move.typeChangerBoosted = this.effect;
			}
		},
		onBasePowerPriority: 23,
		onBasePower(basePower, pokemon, target, move) {
			if (move.typeChangerBoosted === this.effect) {
				if (this.field.terrain === 'mistyterrain')
					return this.chainModify(1.5);
				else
					return this.chainModify(1.2);
			}
		},
		flags: {},
		name: "Pixilate",
		rating: 4,
		num: 182,
	},
	plus: {
		onModifySpAPriority: 5,
		onModifySpA(spa, pokemon, target, move) {
			let modifier = 1;
			if (this.field.isTerrain('electricterrain')) {
				modifier *= 1.5;
			}
			if (move && (move && this.movehasType(move, 'Electric') || this.movehasType(move, 'Steel'))) {
				modifier *= 1.3;
			}
			return this.chainModify(modifier);
		},
		onModifyAtk(atk, pokemon, target, move) {
			if (move && (move && this.movehasType(move, 'Electric') || this.movehasType(move, 'Steel'))) {
				return this.chainModify(1.3);
			}
		},
		flags: {},
		name: "Plus",
		rating: 0,
		num: 57,
	},
	poisonheal: {
		onDamagePriority: 1,
		onDamage(damage, target, source, effect) {
			if (effect.id === 'psn' || effect.id === 'tox') {
				this.heal(target.baseMaxhp / 8);
				return false;
			}
		},
		onResidual(pokemon) {
			if ((this.field.isTerrain(['corrosiveterrain', 'wastelandterrain'])) && pokemon.isGrounded() || this.field.isTerrain(['corrosivemistterrain', 'murkwatersurfaceterrain'])) {
				this.heal(pokemon.baseMaxhp / 8, pokemon);
			}
		},
		flags: {},
		name: "Poison Heal",
		rating: 4,
		num: 90,
	},
	poisonpoint: {
		onDamagingHit(damage, target, source, move) {
			if (this.checkMoveMakesContact(move, source, target)) {
				let chance = 3;
				if (this.field.isTerrain('wastelandterrain')) {
					chance = 6;
				}
				if (this.randomChance(chance, 10)) {
					source.trySetStatus('psn', target);
				}
			}
		},
		flags: {},
		name: "Poison Point",
		rating: 1.5,
		num: 38,
	},
	poisonpuppeteer: {
		onStart() {
			if (this.field.isTerrain('wastelandterrain')) {
				this.boost({ spd: 2 });
			}
			if (this.field.isTerrain('corrosivemistterrain')) {
				this.boost({ spd: 1 });
			}
		},
		onAnyAfterSetStatus(status, target, source, effect) {
			if (source.baseSpecies.name !== "Pecharunt") return;
			if (source !== this.effectState.target || target === source || effect.effectType !== 'Move') return;
			if (status.id === 'psn' || status.id === 'tox') {
				target.addVolatile('confusion');
			}
		},
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1 },
		name: "Poison Puppeteer",
		rating: 3,
		num: 310,
	},
	poisontouch: {
		onSourceDamagingHit(damage, target, source, move) {
			// Despite not being a secondary, Shield Dust / Covert Cloak block Poison Touch's effect
			if (target.hasAbility('shielddust') || target.hasItem('covertcloak')) return;
			if (this.checkMoveMakesContact(move, target, source)) {
				if (this.randomChance(3, 10)) {
					target.trySetStatus('psn', source);
				}
			}
		},
		flags: {},
		name: "Poison Touch",
		rating: 2,
		num: 143,
	},
	powerconstruct: {
		onResidualOrder: 29,
		onResidual(pokemon) {
			if (pokemon.baseSpecies.baseSpecies !== 'Zygarde' || pokemon.transformed || !pokemon.hp) return;
			if (pokemon.species.id === 'zygardecomplete' || pokemon.hp > pokemon.maxhp / 2) return;
			this.add('-activate', pokemon, 'ability: Power Construct');
			pokemon.formeChange('Zygarde-Complete', this.effect, true);
			pokemon.canMegaEvo = pokemon.canMegaEvo === false ? false : this.actions.canMegaEvo(pokemon);
			pokemon.formeRegression = true;
		},
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, cantsuppress: 1 },
		name: "Power Construct",
		rating: 5,
		num: 211,
	},
	powerdrill: {
		onModifyMove(move) {
			if (move.flags['drill'] && this.field.isTerrain(['rockyterrain', 'mountainterrain', 'snowymountainterrain', 'caveterrain', 'volcanicterrain'])) delete move.flags['protect'];
		},
		onBasePowerPriority: 19,
		onBasePower(basePower, attacker, defender, move) {
			if (move.flags['drill']) {
				if (this.field.isTerrain(['rockyterrain', 'mountainterrain', 'snowymountainterrain', 'caveterrain', 'volcanicterrain'])) return this.chainModify(2);
				return this.chainModify(1.5);
			}
		},
		flags: {},
		name: "Power Drill",
		rating: 3,
		num: 10007,
	},
	powerofalchemy: {
		onStart(pokemon) {
			if (this.field.isTerrain('fairytaleterrain')) {
				this.boost({ spd: 1, def: 1 }, pokemon, pokemon);
			}
		},
		onResidual(pokemon) {
			this.dex.abilities.get('selfsufficient').onResidual?.call(this, pokemon);
		},
		onImmunity(type, pokemon) {
			return this.dex.abilities.get('selfsufficient').onImmunity?.call(this, type, pokemon);
		},
		onSwitchOut(pokemon) {
			this.dex.abilities.get('regenerator').onSwitchOut?.call(this, pokemon);
		},
		onEnd(pokemon) {
			if (pokemon.hp && pokemon.isActive) pokemon.addVolatile('powerofalchemycore', pokemon, this.effect);
		},
		onAllyFaint(target) {
			if (!this.effectState.target.hp) return;
			const ability = target.getAbility();
			if (ability.flags['noreceiver'] || ability.id === 'noability') return;
			const pokemon = this.effectState.target;
			pokemon.addVolatile('powerofalchemycore', pokemon, this.effect);
			pokemon.setAbility(ability, target);
		},
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1 },
		name: "Power of Alchemy",
		rating: 0,
		num: 223,
	},
	powerspot: {
		onAllyBasePowerPriority: 22,
		onAllyBasePower(basePower, attacker, defender, move) {
			if (attacker !== this.effectState.target) {
				if (this.field.isTerrain('hauntedterrain') || this.field.isTerrain('bewitchedwoodsterrain') || this.field.isTerrain('holyterrain') || this.field.isTerrain('psychicterrain')) {
					this.debug('Power Spot boost under terrain');
					return this.chainModify(1.5);
				} else {
					this.debug('Power Spot boost');
					return this.chainModify(1.3);
				}
			}
		},
		flags: {},
		name: "Power Spot",
		rating: 0,
		num: 249,
	},
	prankster: {
		onNegateImmunity(pokemon, type) {
			if (type === 'Dark' && !this.field.isTerrain('bewitchedwoodsterrain')) {
				return false;
			}
		},
		onModifyPriority(priority, pokemon, target, move) {
			if (move?.category === 'Status') {
				move.pranksterBoosted = true;
				return priority + 1;
			}
		},
		flags: {},
		name: "Prankster",
		rating: 4,
		num: 158,
	},
	predator: {
		onChangeBoost(boost, target, source, effect) {
			if (effect && effect.id === 'zpower') return;
			let i: BoostID;
			for (i in boost) {
				boost[i]! *= -1;
			}
		},
		onBasePower(basePower, pokemon, target, move) {
			if (target.hasAbility('neutralization') || (target.hasAbility('royaldecree') && !this.getAllActive().some(pokemon => pokemon.hasAbility('neutralization')))) {
				this.debug('Predator anti-authority boost');
				return this.chainModify(2);
			}
			if (target.newlySwitched || this.queue.willMove(target)) {
				this.debug('Predator damage boost');
				if (this.field.isTerrain(['mountainterrain', 'snowymountainterrain', 'rockyterrain'])) return this.chainModify(2);
				if (this.field.isTerrain(['fairytaleterrain', 'dragonsdenterrain', 'bigtopterrain'])) return this.chainModify(1.5);
				return this.chainModify(1.3);
			}
		},
		flags: {},
		name: "Predator",
		rating: 4,
		num: 10002,
	},
	royalarmament: {
		onBasePowerPriority: 19,
		onBasePower(basePower, attacker, defender, move) {
			return this.dex.abilities.get('powerdrill').onBasePower?.call(this, basePower, attacker, defender, move);
		},
		onModifyMove(move) {
			this.dex.abilities.get('powerdrill').onModifyMove?.call(this, move);
		},
		onModifySTAB(stab, source, target, move) {
			if (move.type === 'Steel' && !source.hasType('Steel')) return 1.5;
		},
		flags: {},
		name: "Royal Armament",
		rating: 4,
		num: 10182,
	},
	pressure: {
		onStart(pokemon) {
			if (this.field.isTerrain('coldeclipseterrain')) {
				let activated = false;
				for (const target of pokemon.foes()) {
					if (!activated) {
						this.add('-ability', pokemon, 'Pressure', 'boost');
						activated = true;
					}
					if (target.volatiles['substitute']) {
						this.add('-immune', target);
					}
					this.boost({ spd: -2, def: -2 }, target, pokemon, null, true);
				}
			} else {
				for (const target of pokemon.foes()) {
					let activated = false;
					if (!activated) {
						this.add('-ability', pokemon, 'Pressure', 'boost');
						activated = true;
					}
					if (target.volatiles['substitute']) {
						this.add('-immune', target);
					}
					this.boost({ spd: -1, def: -1 }, target, pokemon, null, true);
				}
			}
		},
		onDeductPP(target, source) {
			if (target.isAlly(source)) return;
			return 1;
		},
		flags: {},
		name: "Pressure",
		rating: 2.5,
		num: 46,
	},
	primordialsea: {
		onStart(source) {
			this.field.setWeather('primordialsea');
		},
		onAnySetWeather(target, source, weather) {
			const strongWeathers = ['desolateland', 'primordialsea', 'deltastream'];
			if (this.field.getWeather().id === 'primordialsea' && !strongWeathers.includes(weather.id)) return false;
		},
		onEnd(pokemon) {
			if (this.field.weatherState.source !== pokemon) return;
			for (const target of this.getAllActive()) {
				if (target === pokemon) continue;
				if (target.hasAbility('primordialsea')) {
					this.field.weatherState.source = target;
					return;
				}
			}
			this.field.clearWeather();
		},
		flags: {},
		name: "Primordial Sea",
		rating: 4.5,
		num: 189,
	},
	prismarmor: {
		onModifyDef(def, pokemon) {
			if (this.field.isTerrain(['coldeclipseterrain', 'darkcrystalcavernterrain', 'rainbowterrain'])) {
				return this.chainModify(1.333333);
			}
		},
		onModifySpD(spd, pokemon) {
			if (this.field.isTerrain(['coldeclipseterrain', 'darkcrystalcavernterrain', 'rainbowterrain'])) {
				return this.chainModify(1.333333);
			}
		},
		onSourceModifyDamage(damage, source, target, move) {
			let modifier = 0.8;
			if (target.getMoveHitData(move).typeMod > 0 || this.field.isTerrain('darkcrystalcavernterrain') || this.field.isTerrain('crystalcavernterrain')) {
				this.debug('Prism Armor neutralize');
				modifier *= 0.75;
			}
			return this.chainModify(modifier);
		},
		onImmunity(type, pokemon) {
			if (type === 'hail' && this.field.isTerrain('coldeclipseterrain')) return false;
		},
		flags: {},
		name: "Prism Armor",
		rating: 3,
		num: 232,
	},
	ironwill: {
		onModifyDef(def, pokemon) {
			return this.dex.abilities.get('prismarmor').onModifyDef?.call(this, def, pokemon);
		},
		onModifySpD(spd, pokemon) {
			return this.dex.abilities.get('prismarmor').onModifySpD?.call(this, spd, pokemon);
		},
		onSourceModifyDamage(damage, source, target, move) {
			return this.dex.abilities.get('prismarmor').onSourceModifyDamage?.call(this, damage, source, target, move);
		},
		onDamage(damage, target, source, effect) { return this.dex.abilities.get('secondwind').onDamage?.call(this, damage, target, source, effect); },
		onImmunity(type, pokemon) {
			return this.dex.abilities.get('selfsufficient').onImmunity?.call(this, type, pokemon);
		},
		onResidual(pokemon) { return this.dex.abilities.get('selfsufficient').onResidual?.call(this, pokemon); },
		flags: {},
		name: "Iron Will",
		rating: 4.5,
		num: 10204,
	},
	proficient: {
		onBasePowerPriority: 22,
		onBasePower(basePower, attacker, defender, move) {
			if (move.category !== 'Status' && attacker.hasType(move.type)) return this.chainModify(1.2);
		},
		flags: {},
		name: "Proficient",
		rating: 3,
		num: 10300,
	},
	propellertail: {
		onModifyMovePriority: 1,
		onModifyMove(move) {
			// most of the implementation is in Battle#getTarget
			move.tracksTarget = move.target !== 'scripted';
		},
		onModifySpe(spe, pokemon) {
			if (this.field.isTerrain('watersurfaceterrain') || this.field.isTerrain('underwaterterrain')) {
				return this.chainModify(2);
			}
		},
		flags: {},
		name: "Propeller Tail",
		rating: 0,
		num: 239,
	},
	protean: {
		onPrepareHit(source, target, move) {
			if (move.hasBounced || move.flags['futuremove'] || move.sourceEffect === 'snatch' || move.callsMove) return;
			const type = move.type;
			if (type && type !== '???' && source.getTypes().join() !== type) {
				if (!source.setType(type)) return;
				this.add('-start', source, 'typechange', type, '[from] ability: Protean');
			}
		},
		flags: {},
		name: "Protean",
		rating: 4,
		num: 168,
	},
	protosynthesis: {
		onSwitchInPriority: -2,
		onStart(pokemon) {
			this.singleEvent('WeatherChange', this.effect, this.effectState, pokemon);
		},
		onWeatherChange(pokemon) {
			// Protosynthesis is not affected by Utility Umbrella
			if (this.field.isWeather('sunnyday')) {
				pokemon.addVolatile('protosynthesis');
			} else if (!pokemon.volatiles['protosynthesis']?.fromBooster && !this.field.isWeather('sunnyday')) {
				pokemon.removeVolatile('protosynthesis');
			}
		},
		onEnd(pokemon) {
			delete pokemon.volatiles['protosynthesis'];
			this.add('-end', pokemon, 'Protosynthesis', '[silent]');
		},
		condition: {
			noCopy: true,
			onStart(pokemon, source, effect) {
				if (effect?.name === 'Booster Energy') {
					this.effectState.fromBooster = true;
					this.add('-activate', pokemon, 'ability: Protosynthesis', '[fromitem]');
				} else {
					this.add('-activate', pokemon, 'ability: Protosynthesis');
				}
				this.effectState.bestStat = pokemon.getBestStat(false, true);
				this.add('-start', pokemon, 'protosynthesis' + this.effectState.bestStat);
			},
			onModifyAtkPriority: 5,
			onModifyAtk(atk, pokemon) {
				if (this.effectState.bestStat !== 'atk' || pokemon.ignoringAbility()) return;
				this.debug('Protosynthesis atk boost');
				return this.chainModify([5325, 4096]);
			},
			onModifyDefPriority: 6,
			onModifyDef(def, pokemon) {
				if (this.effectState.bestStat !== 'def' || pokemon.ignoringAbility()) return;
				this.debug('Protosynthesis def boost');
				return this.chainModify([5325, 4096]);
			},
			onModifySpAPriority: 5,
			onModifySpA(spa, pokemon) {
				if (this.effectState.bestStat !== 'spa' || pokemon.ignoringAbility()) return;
				this.debug('Protosynthesis spa boost');
				return this.chainModify([5325, 4096]);
			},
			onModifySpDPriority: 6,
			onModifySpD(spd, pokemon) {
				if (this.effectState.bestStat !== 'spd' || pokemon.ignoringAbility()) return;
				this.debug('Protosynthesis spd boost');
				return this.chainModify([5325, 4096]);
			},
			onModifySpe(spe, pokemon) {
				if (this.effectState.bestStat !== 'spe' || pokemon.ignoringAbility()) return;
				this.debug('Protosynthesis spe boost');
				return this.chainModify(1.5);
			},
			onEnd(pokemon) {
				this.add('-end', pokemon, 'Protosynthesis');
			},
		},
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, notransform: 1 },
		name: "Protosynthesis",
		rating: 3,
		num: 281,
	},
	psychicsurge: {
		onStart(source) {
			this.field.setTerrain('psychicterrain');
		},
		flags: {},
		name: "Psychic Surge",
		rating: 4,
		num: 227,
	},
	punkrock: {
		onBasePowerPriority: 7,
		onBasePower(basePower, attacker, defender, move) {
			if (move.flags['sound']) {
				this.debug('Punk Rock boost');
				if (this.field.isTerrain('bigtopterrain') || this.field.isTerrain('caveterrain')) {
					return this.chainModify(1.5);
				} else {
					return this.chainModify(1.3);
				}
			}
		},
		onSourceModifyDamage(damage, source, target, move) {
			if (move.flags['sound']) {
				this.debug('Punk Rock weaken');
				return this.chainModify(0.5);
			}
		},
		flags: { breakable: 1 },
		name: "Punk Rock",
		rating: 3.5,
		num: 244,
	},
	purepower: {
		onModifyAtkPriority: 5,
		onModifyAtk(atk) {
			if (this.field.terrain !== 'psychicterrain')
				return this.chainModify(2);
		},
		onModifySpA(spa) {
			if (this.field.terrain === 'psychicterrain')
				return this.chainModify(2);
		},
		flags: {},
		name: "Pure Power",
		rating: 5,
		num: 74,
	},
	purifyingsalt: {
		onSetStatus(status, target, source, effect) {
			if ((effect as Move)?.status) {
				this.add('-immune', target, '[from] ability: Purifying Salt');
			}
			return false;
		},
		onTryAddVolatile(status, target) {
			if (status.id === 'yawn') {
				this.add('-immune', target, '[from] ability: Purifying Salt');
				return null;
			}
		},
		onSourceModifyAtkPriority: 6,
		onSourceModifyAtk(atk, attacker, defender, move) {
			if (move && this.movehasType(move, 'Ghost')) {
				this.debug('Purifying Salt weaken');
				return this.chainModify(0.5);
			}
		},
		onSourceModifySpAPriority: 5,
		onSourceModifySpA(spa, attacker, defender, move) {
			if (move && this.movehasType(move, 'Ghost')) {
				this.debug('Purifying Salt weaken');
				return this.chainModify(0.5);
			}
		},
		flags: { breakable: 1 },
		name: "Purifying Salt",
		rating: 4,
		num: 272,
	},
	paradoxengine: {
		onModifySpe(spe, pokemon) {
			if (this.field.isWeather(['sunnyday', 'desolateland']) || this.field.isTerrain('electricterrain')) {
				return this.chainModify(2);
			}
		},
		onBasePowerPriority: 23,
		onBasePower(basePower, pokemon, target, move) {
			if (move.type === 'Fighting' || move.type === 'Electric') return this.chainModify(1.5);
		},
		flags: {},
		name: "Paradox Engine",
		rating: 4,
		num: 10119,
	},
	quarkdrive: {
		onSwitchInPriority: -2,
		onStart(pokemon) {
			this.singleEvent('TerrainChange', this.effect, this.effectState, pokemon);
		},
		onTerrainChange(pokemon) {
			if (this.field.isTerrain('electricterrain')) {
				pokemon.addVolatile('quarkdrive');
			} else if (!pokemon.volatiles['quarkdrive']?.fromBooster) {
				pokemon.removeVolatile('quarkdrive');
			}
		},
		onEnd(pokemon) {
			delete pokemon.volatiles['quarkdrive'];
			this.add('-end', pokemon, 'Quark Drive', '[silent]');
		},
		condition: {
			noCopy: true,
			onStart(pokemon, source, effect) {
				if (effect?.name === 'Booster Energy') {
					this.effectState.fromBooster = true;
					this.add('-activate', pokemon, 'ability: Quark Drive', '[fromitem]');
				} else {
					this.add('-activate', pokemon, 'ability: Quark Drive');
				}
				this.effectState.bestStat = pokemon.getBestStat(false, true);
				this.add('-start', pokemon, 'quarkdrive' + this.effectState.bestStat);
			},
			onModifyAtkPriority: 5,
			onModifyAtk(atk, pokemon) {
				if (this.effectState.bestStat !== 'atk' || pokemon.ignoringAbility()) return;
				this.debug('Quark Drive atk boost');
				return this.chainModify([5325, 4096]);
			},
			onModifyDefPriority: 6,
			onModifyDef(def, pokemon) {
				if (this.effectState.bestStat !== 'def' || pokemon.ignoringAbility()) return;
				this.debug('Quark Drive def boost');
				return this.chainModify([5325, 4096]);
			},
			onModifySpAPriority: 5,
			onModifySpA(spa, pokemon) {
				if (this.effectState.bestStat !== 'spa' || pokemon.ignoringAbility()) return;
				this.debug('Quark Drive spa boost');
				return this.chainModify([5325, 4096]);
			},
			onModifySpDPriority: 6,
			onModifySpD(spd, pokemon) {
				if (this.effectState.bestStat !== 'spd' || pokemon.ignoringAbility()) return;
				this.debug('Quark Drive spd boost');
				return this.chainModify([5325, 4096]);
			},
			onModifySpe(spe, pokemon) {
				if (this.effectState.bestStat !== 'spe' || pokemon.ignoringAbility()) return;
				this.debug('Quark Drive spe boost');
				return this.chainModify(1.5);
			},
			onEnd(pokemon) {
				this.add('-end', pokemon, 'Quark Drive');
			},
		},
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, notransform: 1 },
		name: "Quark Drive",
		rating: 3,
		num: 282,
	},
	queenlymajesty: {
		onModifyDamage(damage, source, target, move) {
			if (move && move.category !== 'Status' && this.field.isTerrain('fairytaleterrain')) {
				return this.chainModify(1.5);
			}
			if (move && move.category !== 'Status' && this.field.isTerrain('chessboardterrain') && source.Role !== 'Queen') {
				return this.chainModify(1.5);
			}
		},
		onFoeTryMove(target, source, move) {
			const targetAllExceptions = ['perishsong', 'flowershield', 'rototiller'];
			if (move.target === 'foeSide' || (move.target === 'all' && !targetAllExceptions.includes(move.id))) {
				return;
			}

			const dazzlingHolder = this.effectState.target;
			if ((source.isAlly(dazzlingHolder) || move.target === 'all') && move.priority > 0.1) {
				this.attrLastMove('[still]');
				this.add('cant', dazzlingHolder, 'ability: Queenly Majesty', move, `[of] ${target}`);
				return false;
			}
		},
		flags: { breakable: 1 },
		name: "Queenly Majesty",
		rating: 2.5,
		num: 214,
	},
	quickdraw: {
		onFractionalPriorityPriority: -1,
		onFractionalPriority(priority, pokemon, target, move) {
			if (move.category !== "Status" && this.randomChance(3, 10)) {
				this.add('-activate', pokemon, 'ability: Quick Draw');
				return 0.1;
			}
		},
		flags: {},
		name: "Quick Draw",
		rating: 2.5,
		num: 259,
	},
	quickfeet: {
		onModifySpe(spe, pokemon) {
			if (this.field.isTerrain('electricterrain')) {
				return this.chainModify(2);
			}
			if (pokemon.status) {
				return this.chainModify(1.5);
			}
		},
		flags: {},
		name: "Quick Feet",
		rating: 2.5,
		num: 95,
	},
	raindish: {
		onWeather(target, source, effect) {
			if (target.effectiveWeather() !== effect.id) return;
			if (effect.id === 'raindance' || effect.id === 'primordialsea') {
				this.heal(target.baseMaxhp / 16);
			}
		},
		flags: {},
		name: "Rain Dish",
		rating: 1.5,
		num: 44,
	},
	rattled: {
		onStart(pokemon) {
			if (this.field.isTerrain('hauntedterrain') || this.field.isTerrain('swampterrain')) {
				this.boost({ spe: 1 }, pokemon);
			}
		},
		onDamagingHit(damage, target, source, move) {
			if (move && this.movehasType(move, ['Bug', 'Dark', 'Ghost'])) {
				this.boost({ spe: 1 });
			}
		},
		onAfterBoost(boost, target, source, effect) {
			if (effect?.name === 'Intimidate' && boost.atk) {
				this.boost({ spe: 1 });
			}
		},
		flags: {},
		name: "Rattled",
		rating: 1,
		num: 155,
	},
	receiver: {
		onAllyFaint(target) {
			if (!this.effectState.target.hp) return;
			const ability = target.getAbility();
			if (ability.flags['noreceiver'] || ability.id === 'noability') return;
			this.effectState.target.setAbility(ability, target);
		},
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1 },
		name: "Receiver",
		rating: 0,
		num: 222,
	},
	reckless: {
		onBasePowerPriority: 23,
		onSourceModifyCritRatio(critRatio) {
			if (this.field.isTerrain('chessboardterrain')) {
				return critRatio + 1;
			}
		},
		onBasePower(basePower, source, target, move) {
			let modifier = 1;
			if (this.field.isTerrain('chessboardterrain')) {
				modifier *= 1.2;
			}
			if (move.recoil || move.hasCrashDamage || ['explosion', 'selfdestruct', 'mistyexplosion'].includes(move.id)) {
				this.debug('Reckless boost');
				modifier *= 1.2;
			}
			return this.chainModify(modifier);
		},
		flags: {},
		name: "Reckless",
		rating: 3,
		num: 120,
	},
	refrigerate: {
		onModifyTypePriority: -1,
		onModifyType(move, pokemon) {
			const noModifyType = [
				'judgment', 'multiattack', 'naturalgift', 'revelationdance', 'technoblast', 'terrainpulse', 'weatherball',
			];
			if (move.type === 'Normal' && (!noModifyType.includes(move.id) || this.activeMove?.isMax) &&
				!(move.isZ && move.category !== 'Status') && !(move.name === 'Tera Blast' && pokemon.terastallized)) {
				move.type = 'Ice';
				move.typeChangerBoosted = this.effect;
			}
		},
		onBasePowerPriority: 23,
		onBasePower(basePower, pokemon, target, move) {
			if (move.typeChangerBoosted === this.effect) {
				if (this.field.isTerrain('icyterrain') || this.field.isTerrain('snowymountainterrain'))
					return this.chainModify(1.5);
				else {
					return this.chainModify(1.2);
				}
			}
		},
		flags: {},
		name: "Refrigerate",
		rating: 4,
		num: 174,
	},
	regenerator: {
		onSwitchOut(pokemon) {
			pokemon.heal(pokemon.baseMaxhp / 3);
		},
		flags: {},
		name: "Regenerator",
		rating: 4.5,
		num: 144,
	},
	relentlesshunt: {
		onModifyPriority(priority, source, target, move) {
			if (move.basePower <= 60) {
				return priority + 1;
			}
		},
		onBasePower(basePower, pokemon, target, move) {
			if (this.field.isTerrain(['fairytaleterrain', 'bigtopterrain', 'dragonsdenterrain', 'mountainterrain', 'snowymountainterrain', 'coldeclipseterrain'])) return this.chainModify(2);
			if (this.field.isTerrain(['desertterrain', 'rockyterrain', 'forestterrain', 'burningterrain', 'superheatedterrain', 'ashenbeachterrain', 'watersurfaceterrain', 'caveterrain', 'starlightarenaterrain', 'newworldterrain'])) return this.chainModify(1.5);
		},
		flags: {},
		name: "Relentless Hunt",
		rating: 4,
		num: 10003,
	},
	ripen: {
		onTryHeal(damage, target, source, effect) {
			if (!effect) return;
			if (effect.name === 'Berry Juice' || effect.name === 'Leftovers') {
				this.add('-activate', target, 'ability: Ripen');
			}
			if ((effect as Item).isBerry) return this.chainModify(2);
		},
		onChangeBoost(boost, target, source, effect) {
			if (effect && (effect as Item).isBerry) {
				let b: BoostID;
				for (b in boost) {
					boost[b]! *= 2;
				}
			}
		},
		onSourceModifyDamagePriority: -1,
		onSourceModifyDamage(damage, source, target, move) {
			if (target.abilityState.berryWeaken) {
				target.abilityState.berryWeaken = false;
				return this.chainModify(0.5);
			}
		},
		onTryEatItemPriority: -1,
		onTryEatItem(item, pokemon) {
			this.add('-activate', pokemon, 'ability: Ripen');
		},
		onEatItem(item, pokemon) {
			const weakenBerries = [
				'Babiri Berry', 'Charti Berry', 'Chilan Berry', 'Chople Berry', 'Coba Berry', 'Colbur Berry', 'Haban Berry', 'Kasib Berry', 'Kebia Berry', 'Occa Berry', 'Passho Berry', 'Payapa Berry', 'Rindo Berry', 'Roseli Berry', 'Shuca Berry', 'Tanga Berry', 'Wacan Berry', 'Yache Berry',
			];
			// Record if the pokemon ate a berry to resist the attack
			pokemon.abilityState.berryWeaken = weakenBerries.includes(item.name);
		},
		flags: {},
		name: "Ripen",
		rating: 2,
		num: 247,
	},
	rivalry: {
		onBasePowerPriority: 24,
		onBasePower(basePower, attacker, defender, move) {
			if (attacker.gender && defender.gender) {
				if (attacker.gender === defender.gender) {
					this.debug('Rivalry boost');
					return this.chainModify(1.25);
				}
			}
		},
		onAnyModifyDamage(damage, source, target, move) {
			if (target !== this.effectState.target && target.isAlly(this.effectState.target) && source.gender && target.gender && source.gender !== target.gender) {
				this.debug('Rivalry weaken');
				return this.chainModify(0.75);
			}
		},
		flags: {},
		name: "Rivalry",
		rating: 0,
		num: 79,
	},
	rkssystem: {
		// RKS System's type-changing itself is implemented in statuses.js
		memoryAbilities(pokemon) {
			if (pokemon.baseSpecies.baseSpecies !== 'Silvally') return [];
			const memoryAbilities: { [item: string]: string[] } = {
				bugmemory: ['tintedlens', 'shielddust'],
				darkmemory: ['pressure', 'intimidate'],
				dragonmemory: ['marvelscale', 'toughclaws'],
				electricmemory: ['transistor', 'lightningrod'],
				fairymemory: ['invigorate', 'friendguard'],
				fightingmemory: ['innerfocus', 'sheerforce'],
				firememory: ['soulfire', 'flamebody'],
				flyingmemory: ['galewings', 'airlock'],
				ghostmemory: ['soulfire', 'cursedbody'],
				grassmemory: ['hospitality', 'chlorophyll'],
				groundmemory: ['sandrush', 'stamina'],
				icememory: ['icebody', 'slushrush'],
				poisonmemory: ['regenerator', 'corrosion'],
				psychicmemory: ['magicbounce', 'magicguard'],
				rockmemory: ['purifyingsalt', 'solidrock'],
				steelmemory: ['swornduty', 'mirrorarmor'],
				watermemory: ['swiftswim', 'waterveil'],
			};
			return memoryAbilities[pokemon.item] || ['scrappy'];
		},
		callMemoryAbility(pokemon, eventName, ...args) {
			for (const abilityid of this.effect.memoryAbilities.call(this, pokemon)) {
				const handler = this.dex.abilities.get(abilityid)[eventName];
				const result = handler?.call(this, ...args);
				if (result !== undefined) return result;
			}
		},
		onStart(pokemon) {
			this.effect.callMemoryAbility.call(this, pokemon, 'onStart', pokemon);
		},
		onSwitchOut(pokemon) {
			this.effect.callMemoryAbility.call(this, pokemon, 'onSwitchOut', pokemon);
		},
		onModifyMovePriority: -5,
		onModifyMove(move, pokemon) {
			this.effect.callMemoryAbility.call(this, pokemon, 'onModifyMove', move, pokemon);
		},
		onModifySpe(spe, pokemon) {
			return this.effect.callMemoryAbility.call(this, pokemon, 'onModifySpe', spe, pokemon);
		},
		onModifyPriority(priority, pokemon, target, move) {
			return this.effect.callMemoryAbility.call(this, pokemon, 'onModifyPriority', priority, pokemon, target, move);
		},
		onModifyAtkPriority: 5,
		onModifyAtk(atk, attacker, defender, move) {
			return this.effect.callMemoryAbility.call(this, attacker, 'onModifyAtk', atk, attacker, defender, move);
		},
		onModifySpAPriority: 5,
		onModifySpA(spa, attacker, defender, move) {
			return this.effect.callMemoryAbility.call(this, attacker, 'onModifySpA', spa, attacker, defender, move);
		},
		onModifyDefPriority: 6,
		onModifyDef(def, pokemon) {
			return this.effect.callMemoryAbility.call(this, pokemon, 'onModifyDef', def, pokemon);
		},
		onSourceModifyAtkPriority: 5,
		onSourceModifyAtk(atk, attacker, defender, move) {
			return this.effect.callMemoryAbility.call(this, defender, 'onSourceModifyAtk', atk, attacker, defender, move);
		},
		onSourceModifySpAPriority: 5,
		onSourceModifySpA(spa, attacker, defender, move) {
			return this.effect.callMemoryAbility.call(this, defender, 'onSourceModifySpA', spa, attacker, defender, move);
		},
		onTryBoostPriority: 2,
		onTryBoost(boost, target, source, effect) {
			return this.effect.callMemoryAbility.call(this, target, 'onTryBoost', boost, target, source, effect);
		},
		onAfterEachBoost(boost, target, source, effect) {
			this.effect.callMemoryAbility.call(this, target, 'onAfterEachBoost', boost, target, source, effect);
		},
		onSetStatus(status, target, source, effect) {
			return this.effect.callMemoryAbility.call(this, target, 'onSetStatus', status, target, source, effect);
		},
		onUpdate(pokemon) {
			this.effect.callMemoryAbility.call(this, pokemon, 'onUpdate', pokemon);
		},
		onTryHitPriority: 1,
		onTryHit(target, source, move) {
			return this.effect.callMemoryAbility.call(this, target, 'onTryHit', target, source, move);
		},
		onAllyTryHitSide(target, source, move) {
			const pokemon = this.effectState.target;
			return this.effect.callMemoryAbility.call(this, pokemon, 'onAllyTryHitSide', target, source, move);
		},
		onAnyTryHeal(damage, target, source, effect) {
			const pokemon = this.effectState.target;
			return this.effect.callMemoryAbility.call(this, pokemon, 'onAnyTryHeal', damage, target, source, effect);
		},
		onAnyModifyDamage(damage, source, target, move) {
			const pokemon = this.effectState.target;
			return this.effect.callMemoryAbility.call(this, pokemon, 'onAnyModifyDamage', damage, source, target, move);
		},
		onModifyDamage(damage, source, target, move) {
			return this.effect.callMemoryAbility.call(this, source, 'onModifyDamage', damage, source, target, move);
		},
		onSourceModifyDamage(damage, source, target, move) {
			return this.effect.callMemoryAbility.call(this, target, 'onSourceModifyDamage', damage, source, target, move);
		},
		onDeductPP(target, source) {
			const pokemon = this.effectState.target;
			return this.effect.callMemoryAbility.call(this, pokemon, 'onDeductPP', target, source);
		},
		onDamage(damage, target, source, effect) {
			return this.effect.callMemoryAbility.call(this, target, 'onDamage', damage, target, source, effect);
		},
		onDamagingHit(damage, target, source, effect) {
			this.effect.callMemoryAbility.call(this, target, 'onDamagingHit', damage, target, source, effect);
		},
		onImmunity(type, pokemon) {
			return this.effect.callMemoryAbility.call(this, pokemon, 'onImmunity', type, pokemon);
		},
		onNegateImmunity(pokemon, type) {
			return this.effect.callMemoryAbility.call(this, pokemon, 'onNegateImmunity', pokemon, type);
		},
		onFoeAfterSetStatus(status, target, source, effect) {
			const pokemon = this.effectState.target;
			return this.effect.callMemoryAbility.call(this, pokemon, 'onFoeAfterSetStatus', status, target, source, effect);
		},
		onSourceAfterFaint(length, target, source, effect) {
			this.effect.callMemoryAbility.call(this, source, 'onSourceAfterFaint', length, target, source, effect);
		},
		onResidualOrder: 5,
		onResidualSubOrder: 3,
		onResidual(pokemon) {
			this.heal(pokemon.baseMaxhp / 16, pokemon, pokemon);
			this.effect.callMemoryAbility.call(this, pokemon, 'onResidual', pokemon);
		},
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, cantsuppress: 1 },
		name: "RKS System",
		rating: 4,
		num: 225,
	},
	rockhead: {
		onDamage(damage, target, source, effect) {
			if (effect.id === 'recoil') {
				if (!this.activeMove) throw new Error("Battle.activeMove is null");
				if (this.activeMove.id !== 'struggle') return null;
			}
		},
		flags: {},
		name: "Rock Head",
		rating: 3,
		num: 69,
	},
	rockypayload: {
		onEffectiveness(typeMod, target, type, move) {
			if (['Fire', 'Flying', 'Normal', 'Poison'].includes(type)) return typeMod - 1;
		},
		onModifyAtkPriority: 5,
		onModifyMove(move) {
			if (move && this.movehasType(move, 'Rock')) move.forceSTAB = true;
		},
		onModifyAtk(atk, attacker, defender, move) {
			if (move && this.movehasType(move, 'Rock')) {
				if (this.field.isTerrain('rockyterrain')) {
					this.debug('Rocky Payload double boost');
					return this.chainModify(2);
				} else {
					this.debug('Rocky Payload boost');
					return this.chainModify(1.5);
				}
			}
		},
		onModifySpAPriority: 5,
		onModifySpA(atk, attacker, defender, move) {
			if (move && this.movehasType(move, 'Rock')) {
				if (this.field.isTerrain('rockyterrain')) {
					this.debug('Rocky Payload double boost');
					return this.chainModify(2);
				} else {
					this.debug('Rocky Payload boost');
					return this.chainModify(1.5);
				}
			}
		},
		flags: {},
		name: "Rocky Payload",
		rating: 3.5,
		num: 276,
	},
	roughskin: {
		onDamagingHitOrder: 1,
		onDamagingHit(damage, target, source, move) {
			if (this.checkMoveMakesContact(move, source, target, true)) {
				this.damage(source.baseMaxhp / 8, source, target);
			}
		},
		flags: {},
		name: "Rough Skin",
		rating: 2.5,
		num: 24,
	},
	runaway: {
		flags: {},
		name: "Run Away",
		rating: 0,
		num: 50,
	},
	sandforce: {
		onBasePowerPriority: 21,
		onBasePower(basePower, attacker, defender, move) {
			if (this.field.isWeather('sandstorm') || this.field.isTerrain('desertterrain') || this.field.isTerrain('ashenbeachterrain')) {
				if (move && (move && this.movehasType(move, 'Rock') || this.movehasType(move, 'Ground') || this.movehasType(move, 'Steel'))) {
					this.debug('Sand Force boost');
					return this.chainModify(1.3);
				}
			}
		},
		onImmunity(type, pokemon) {
			if (type === 'sandstorm') return false;
		},
		flags: {},
		name: "Sand Force",
		rating: 2,
		num: 159,
	},
	sandrush: {
		onModifySpe(spe, pokemon) {
			if (this.field.isWeather('sandstorm') || this.field.isTerrain('desertterrain') || this.field.isTerrain('ashenbeachterrain')) {
				return this.chainModify(2);
			}
		},
		onImmunity(type, pokemon) {
			if (type === 'sandstorm') return false;
		},
		flags: {},
		name: "Sand Rush",
		rating: 3,
		num: 146,
	},
	sandspit: {
		onDamagingHit(damage, target, source, move) {
			this.field.setWeather('sandstorm');
			if (this.field.isTerrain('desertterrain') || this.field.isTerrain('ashenbeachterrain')) {
				for (const foe of target.side.pokemon) {
					this.boost({ accuracy: -1 }, foe, source);
					this.add('-ability', target, 'Sand Spit');
				}
			}
		},
		flags: {},
		name: "Sand Spit",
		rating: 1,
		num: 245,
	},
	sandstream: {
		onStart(source) {
			this.field.setWeather('sandstorm');
		},
		flags: {},
		name: "Sand Stream",
		rating: 4,
		num: 45,
	},
	sandveil: {
		onStart(pokemon) {
			if (this.field.isTerrain('mirrorarenaterrain')) {
				this.boost({ evasion: 1 }, pokemon);
			}
		},
		onImmunity(type, pokemon) {
			if (type === 'sandstorm') return false;
		},
		onModifyAccuracyPriority: -1,
		onModifyAccuracy(accuracy) {
			if (typeof accuracy !== 'number') return;
			if (this.field.isWeather('sandstorm') || this.field.isTerrain('desertterrain') || this.field.isTerrain('ashenbeachterrain')) {
				this.debug('Sand Veil - decreasing accuracy');
				return this.chainModify(0.8);
			}
		},
		flags: { breakable: 1 },
		name: "Sand Veil",
		rating: 1.5,
		num: 8,
	},
	safeharbor: {
		onTryHit(target, source, move) {
			if (target !== source && (this.movehasType(move, 'Water') || this.movehasType(move, 'Ice'))) {
				if (!this.heal(target.baseMaxhp / 4)) {
					this.add('-immune', target, '[from] ability: Safe Harbor');
				}
				return null;
			}
		},
		onWeather(target, source, effect) {
			if (effect.id === 'hail' || effect.id === 'snow') {
				if (effect.id === 'hail' && this.field.isTerrain('coldeclipseterrain')) {
					this.heal(target.baseMaxhp / 8);
					return;
				}
				this.heal(target.baseMaxhp / 16);
			}
		},
		onResidualOrder: 5,
		onResidualSubOrder: 3,
		onResidual(pokemon) {
			if ((this.field.isTerrain(['icyterrain', 'snowymountainterrain', 'coldeclipseterrain'])) && !(this.field.isWeather(['hail', 'snow']))) {
				this.heal(pokemon.baseMaxhp / 16);
			}
			if (pokemon.status && (['raindance', 'primordialsea'].includes(pokemon.effectiveWeather()) || this.field.isTerrain('watersurfaceterrain') || this.field.isTerrain('underwaterterrain'))) {
				this.debug('safe harbor hydration');
				this.add('-activate', pokemon, 'ability: Safe Harbor');
				pokemon.cureStatus();
			}
			this.dex.abilities.get('selfsufficient').onResidual?.call(this, pokemon);
		},
		onAnyModifyDamage(damage, source, target, move) {
			if (target !== this.effectState.target && target.isAlly(this.effectState.target)) {
				this.debug('Safe Harbor Friend Guard weaken');
				return this.chainModify(0.75);
			}
		},
		flags: { breakable: 1 },
		name: "Safe Harbor",
		rating: 4,
		num: 10196,
	},
	seablessing: {
		onStart(pokemon) {
			this.heal(pokemon.baseMaxhp / 4, pokemon, pokemon);
			for (const ally of pokemon.adjacentAllies()) {
				this.heal(ally.baseMaxhp / 4, ally, pokemon);
			}
		},
		onSwitchIn(pokemon) {
			pokemon.addVolatile('aquaring');
		},
		onModifyDefPriority: 6,
		onModifyDef(def) {
			return this.chainModify(1.5);
		},
		onModifySpDPriority: 6,
		onModifySpD(spd) {
			return this.chainModify(1.5);
		},
		onUpdate(pokemon) {
			if (pokemon.status === 'brn') {
				this.add('-activate', pokemon, 'ability: Sea Blessing');
				pokemon.cureStatus();
			}
		},
		onSetStatus(status, target, source, effect) {
			if (status.id !== 'brn') return;
			if ((effect as Move)?.status) {
				this.add('-immune', target, '[from] ability: Sea Blessing');
			}
			return false;
		},
		onImmunity(type, pokemon) {
			if (type === 'sandstorm' || type === 'hail') return false;
		},
		onWeather(target, source, effect) {
			if (target.effectiveWeather() !== effect.id) return;
			if (effect.id === 'raindance' || effect.id === 'primordialsea') {
				this.heal(target.baseMaxhp / 16);
			}
		},
		flags: { breakable: 1 },
		name: "Sea Blessing",
		rating: 4.5,
		num: 10197,
	},
	sapsipper: {
		onTryHitPriority: 1,
		onTryHit(target, source, move) {
			if (target !== source && this.movehasType(move, 'Grass')) {
				if (!this.boost({ atk: 1 })) {
					this.add('-immune', target, '[from] ability: Sap Sipper');
				}
				return null;
			}
		},
		onAllyTryHitSide(target, source, move) {
			if (source === this.effectState.target || !target.isAlly(source)) return;
			if (move && this.movehasType(move, 'Grass')) {
				this.boost({ atk: 1 }, this.effectState.target);
			}
		},
		onResidual(pokemon) {
			if (this.field.isTerrain('forestterrain')) {
				this.heal(pokemon.baseMaxhp / 8);
			}
			if (this.field.isTerrain('grassyterrain')) {
				this.heal(pokemon.baseMaxhp / 16);
			}
		},
		flags: { breakable: 1 },
		name: "Sap Sipper",
		rating: 3,
		num: 157,
	},
	schooling: {
		onModifyMove(move, pokemon) {
			if (pokemon.species.id !== 'wishiwashischool') return;
			this.dex.abilities.get('hydrabond').onModifyMove?.call(this, move, pokemon);
		},
		onSourceModifySecondaries(secondaries, target, source, move) {
			if (source.species.id !== 'wishiwashischool') return;
			return this.dex.abilities.get('hydrabond').onSourceModifySecondaries?.call(this, secondaries, target, source, move);
		},
		onBasePower(basePower, source, target, move) {
			if (source.species.id !== 'wishiwashischool') return;
			return this.dex.abilities.get('hydrabond').onBasePower?.call(this, basePower, source, target, move);
		},
		onStart(pokemon) {
			if (pokemon.baseSpecies.baseSpecies !== 'Wishiwashi' || pokemon.level < 20 || pokemon.transformed) return;
			if (pokemon.hp > pokemon.maxhp / 4 || this.field.isTerrain('watersurfaceterrain') || this.field.isTerrain('underwaterterrain') || this.field.isTerrain('murkwatersurfaceterrain')) {
				if (pokemon.species.id === 'wishiwashi') {
					pokemon.formeChange('Wishiwashi-School');
				}
			} else {
				if (pokemon.species.id === 'wishiwashischool') {
					pokemon.formeChange('Wishiwashi');
				}
			}
		},
		onResidualOrder: 29,
		onResidual(pokemon) {
			if (
				pokemon.baseSpecies.baseSpecies !== 'Wishiwashi' || pokemon.level < 20 ||
				pokemon.transformed || !pokemon.hp
			) return;
			if (pokemon.hp > pokemon.maxhp / 4) {
				if (pokemon.species.id === 'wishiwashi') {
					pokemon.formeChange('Wishiwashi-School');
				}
			} else {
				if (pokemon.species.id === 'wishiwashischool') {
					pokemon.formeChange('Wishiwashi');
				}
			}
		},
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, cantsuppress: 1 },
		name: "Schooling",
		rating: 3,
		num: 208,
	},
	scrappy: {
		onModifyMovePriority: -5,
		onModifyMove(move) {
			if (!move.ignoreImmunity) move.ignoreImmunity = {};
			if (move.ignoreImmunity !== true) {
				move.ignoreImmunity['Fighting'] = true;
				move.ignoreImmunity['Normal'] = true;
			}
		},
		onTryBoost(boost, target, source, effect) {
			if (effect.name === 'Intimidate' && boost.atk) {
				delete boost.atk;
				this.add('-fail', target, 'unboost', 'Attack', '[from] ability: Scrappy', `[of] ${target}`);
			}
		},
		flags: {},
		name: "Scrappy",
		rating: 3,
		num: 113,
	},
	screencleaner: {
		onStart(pokemon) {
			let activated = false;
			for (const sideCondition of ['reflect', 'lightscreen', 'auroraveil']) {
				for (const side of [pokemon.side, ...pokemon.side.foeSidesWithConditions()]) {
					if (side.getSideCondition(sideCondition)) {
						if (!activated) {
							this.add('-activate', pokemon, 'ability: Screen Cleaner');
							activated = true;
						}
						side.removeSideCondition(sideCondition);
					}
				}
			}
		},
		flags: {},
		name: "Screen Cleaner",
		rating: 2,
		num: 251,
	},
	seedsower: {
		onDamagingHit(damage, target, source, move) {
			this.field.setTerrain('grassyterrain');
		},
		flags: {},
		name: "Seed Sower",
		rating: 2.5,
		num: 269,
	},
	serenegrace: {
		onModifyMovePriority: -2,
		onModifyMove(move) {
			if (move.flags['charge']) delete move.flags['charge'];
			if (move.secondaries) {
				this.debug('doubling secondary chance');
				for (const secondary of move.secondaries) {
					if (secondary.chance) secondary.chance *= 2;
				}
			}
			if (move.self?.chance) move.self.chance *= 2;
		},
		flags: {},
		name: "Serene Grace",
		rating: 3.5,
		num: 32,
	},
	seasonalstride: {
		onModifyTypePriority: -1,
		onModifyType(move, pokemon) {
			const noModifyType = [
				'judgment', 'multiattack', 'naturalgift', 'revelationdance', 'technoblast', 'terrainpulse', 'weatherball',
			];
			if (move.type === 'Normal' && (!noModifyType.includes(move.id) || this.activeMove?.isMax) &&
				!(move.isZ && move.category !== 'Status') && !(move.name === 'Tera Blast' && pokemon.terastallized)) {
				move.type = pokemon.getTypes()[0];
				move.typeChangerBoosted = this.effect;
			}
		},
		onBasePowerPriority: 23,
		onBasePower(basePower, pokemon, target, move) {
			let modifier = 1;
			if (move.typeChangerBoosted === this.effect) modifier *= 1.2;
			if (move.flags['kick']) modifier *= 1.4;
			if (modifier !== 1) return this.chainModify(modifier);
		},
		onModifySpe(spe, pokemon) {
			if (['sunnyday', 'desolateland'].includes(pokemon.effectiveWeather())) {
				return this.chainModify(2);
			}
		},
		onResidual(pokemon) {
			if (pokemon.baseSpecies.num !== 586 || pokemon.transformed) return;
			let forme: string | null = null;
			switch (pokemon.effectiveWeather()) {
			case 'raindance':
			case 'primordialsea':
				if (pokemon.species.id !== 'sawsbuckspring') forme = 'Sawsbuck-Spring';
				break;
			case 'sunnyday':
			case 'desolateland':
				if (pokemon.species.id !== 'sawsbucksummer') forme = 'Sawsbuck-Summer';
				break;
			case 'sandstorm':
				if (pokemon.species.id !== 'sawsbuckautumn') forme = 'Sawsbuck-Autumn';
				break;
			case 'hail':
			case 'snow':
			case 'snowscape':
				if (pokemon.species.id !== 'sawsbuckwinter') forme = 'Sawsbuck-Winter';
				break;
			}
			if (pokemon.isActive && forme) {
				pokemon.formeChange(forme, this.effect, false, '[msg]');
			}
		},
		flags: {},
		name: "Seasonal Stride",
		rating: 4,
		num: 10202,
	},
	shadowshield: {
		onSourceModifyDamage(damage, source, target, move) {
			let modifier = 1;
			if (target.hp >= target.maxhp) {
				this.debug('Shadow Shield weaken');
				modifier *= 0.5;
			}
			if (target.getMoveHitData(move).typeMod > 0 && (this.field.isTerrain(['darkcrystalcavernterrain', 'newworldterrain', 'starlightarenaterrain', 'coldeclipseterrain']))) {
				this.debug('Shadow Shield Armor neutralize');
				modifier *= 0.75;
			}
			return this.chainModify(modifier);
		},
		onImmunity(type, pokemon) {
			if (type === 'hail' && this.field.isTerrain('coldeclipseterrain')) return false;
		},
		flags: {},
		name: "Shadow Shield",
		rating: 3.5,
		num: 231,
	},
	shadowguard: {
		onSourceAfterFaint(length, target, source, effect) {
			if (effect && effect.effectType === 'Move') {
				const bestStat = source.getBestStat(true, true);
				this.boost({ [bestStat]: length }, source);
			}
		},
		onSourceModifyDamage(damage, source, target, move) {
			let modifier = 0.9;
			if (target.hp >= target.maxhp) {
				this.debug('Shadow Guard weaken');
				modifier *= 0.5;
			}
			if (target.getMoveHitData(move).typeMod > 0 && this.field.isTerrain(['darkcrystalcavernterrain', 'newworldterrain', 'starlightarenaterrain', 'coldeclipseterrain'])) {
				this.debug('Shadow Guard Armor neutralize');
				modifier *= 0.75;
			}
			return this.chainModify(modifier);
		},
		onImmunity(type, pokemon) {
			if (type === 'hail' && this.field.isTerrain('coldeclipseterrain')) return false;
		},
		onResidual(pokemon) {
			this.dex.abilities.get('temporalshift').queueTemporalHex.call(this, pokemon, 'Shadow Guard', true, ['Ghost', 'Dark', 'Fairy'], 120);
		},
		flags: {},
		name: "Shadow Guard",
		rating: 4,
		num: 10121,
	},
	shadowtag: {
		onStart(pokemon) {
			if (this.field.isTerrain('hauntedterrain')) {
				for (const target of pokemon.foes()) {
					if (target.item) {
						this.add('-item', target, target.getItem().name, '[from] ability: Shadow Tag', `[of] ${target}`, '[identify]');
					}
				}
			}
		},
		onFoeTrapPokemon(pokemon) {
			if (!pokemon.hasAbility('shadowtag') && pokemon.isAdjacent(this.effectState.target)) {
				pokemon.tryTrap(true);
			}
		},
		onFoeMaybeTrapPokemon(pokemon, source) {
			if (!source) source = this.effectState.target;
			if (!source || !pokemon.isAdjacent(source)) return;
			if (!pokemon.hasAbility('shadowtag')) {
				pokemon.maybeTrapped = true;
			}
		},
		onSourceModifyDamage(damage, source, target, move) {
			if (target === source || move.category === 'Status') return;
			return this.chainModify(0.75);
		},
		onFaint(pokemon) {
			if (this.field.terrain === 'hauntedterrain') {
				this.field.terrainState.duration = Math.max(this.field.terrainState.duration || 0, 5);
			} else if (this.field.setTerrain('hauntedterrain', pokemon, this.dex.abilities.get('shadowtag'), true)) {
				this.field.terrainState.duration = 5;
			}
		},
		flags: { cantsuppress: 1 },
		name: "Shadow Tag",
		rating: 5,
		num: 23,
	},
	sharpness: {
		onBasePowerPriority: 19,
		onBasePower(basePower, attacker, defender, move) {
			if (move.flags['slicing'] && !this.field.isTerrain('coldeclipseterrain')) {
				this.debug('Sharpness boost');
				return this.chainModify(1.5);
			}
		},
		flags: {},
		name: "Sharpness",
		rating: 3.5,
		num: 292,
	},
	blademastery: {
		onBasePowerPriority: 19,
		onBasePower(basePower, attacker, defender, move) {
			if (move.flags['slicing'] && !this.field.isTerrain('coldeclipseterrain')) {
				this.debug('Blade Mastery boost');
				return this.chainModify(1.5);
			}
		},
		onModifySTAB(stab, source, target, move) {
			if (move.type === 'Fighting' && !source.hasType('Fighting')) return 1.5;
		},
		onEffectiveness(typeMod, target, type, move) {
			if (type === 'Bug' || type === 'Dark' || type === 'Rock') return typeMod - 1;
		},
		flags: { breakable: 1 },
		name: "Blade Mastery",
		rating: 4,
		num: 10165,
	},
	starboxer: {
		onPrepareHit(source, target, move) {
			if (!move.flags['punch'] || move.category === 'Status' || move.flags['charge'] || move.flags['futuremove'] || move.isZ || move.isMax) return;
			move.multihit = 4;
			move.multihitType = 'starboxer';
		},
		onBasePowerPriority: 19,
		onBasePower(basePower, attacker, defender, move) {
			if (move.flags['punch']) return this.chainModify(1.5);
		},
		onSourceModifySecondaries(secondaries, target, source, move) {
			if (move.multihitType === 'starboxer' && move.hit > 2) return [];
		},
		flags: {},
		name: "Star Boxer",
		rating: 4,
		num: 10161,
	},
	shedskin: {
		onResidualOrder: 5,
		onResidualSubOrder: 3,
		onResidual(pokemon) {
			if (!pokemon.hp) return;
			const removableVolatiles = [
				'attract', 'confusion', 'curse', 'disable', 'encore', 'healblock', 'leechseed',
				'nightmare', 'perishsong', 'taunt', 'torment', 'yawn',
			];
			const hasNegativeVolatile = removableVolatiles.some(volatile => pokemon.volatiles[volatile]);
			const hasNegativeBoost = Object.values(pokemon.boosts).some(boost => boost < 0);
			const canActivate = pokemon.status || hasNegativeVolatile || hasNegativeBoost || pokemon.hp <= pokemon.maxhp / 2;
			if (!canActivate) return;
			if (!this.field.isTerrain('dragonsdenterrain') && !this.randomChance(1, 2)) return;
			this.debug('shed skin');
			this.add('-activate', pokemon, 'ability: Shed Skin');
			if (pokemon.status) pokemon.cureStatus();
			if (this.field.isTerrain('dragonsdenterrain')) {
				const atk = pokemon.getStat('atk', false, true);
				const spa = pokemon.getStat('spa', false, true);
				this.boost(atk >= spa ? { atk: 1, def: -1, spd: -1 } : { spa: 1, def: -1, spd: -1 }, pokemon, pokemon);
				this.heal(pokemon.maxhp / 4, pokemon, pokemon);
				return;
			}
			for (const volatile of removableVolatiles) {
				if (pokemon.volatiles[volatile]) pokemon.removeVolatile(volatile);
			}
			let clearedBoost = false;
			let stat: BoostID;
			for (stat in pokemon.boosts) {
				if (pokemon.boosts[stat] < 0) {
					pokemon.boosts[stat] = 0;
					clearedBoost = true;
				}
			}
			if (clearedBoost) this.add('-clearnegativeboost', pokemon, '[from] ability: Shed Skin');
			this.heal(pokemon.maxhp / 4, pokemon, pokemon);
		},
		flags: {},
		name: "Shed Skin",
		rating: 3,
		num: 61,
	},
	sheerforce: {
		onModifyMove(move, pokemon) {
			if (move.secondaries && !move.hasSheerForceBoost) {
				delete move.secondaries;
				// Technically not a secondary effect, but it is negated
				delete move.self;
				if (move.id === 'clangoroussoulblaze') delete move.selfBoost;
				// Actual negation of `AfterMoveSecondary` effects implemented in scripts.js
				move.hasSheerForce = true;
			}
		},
		onBasePowerPriority: 21,
		onBasePower(basePower, pokemon, target, move) {
			if (move.hasSheerForce || move.hasSheerForceBoost) return this.chainModify([5325, 4096]);
		},
		flags: {},
		name: "Sheer Force",
		rating: 3.5,
		num: 125,
	},
	shellarmor: {
		onCriticalHit: false,
		flags: { breakable: 1 },
		onSourceModifyDamage(damage, source, target, move) {
			return this.chainModify(0.8);
		},
		onStart() {
			if (this.field.isTerrain('fairytaleterrain') || this.field.isTerrain('dragonsdenterrain')) {
				this.boost({ def: 1 });
			}
		},
		onAfterEachBoost(boost, target, source, effect) {
			if (target.isAlly(source)) {
				return;
			}
			let statsLowered = false;
			let i: BoostID;
			for (i in boost) {
				if (boost[i]! < 0) {
					statsLowered = true;
				}
			}
			if (statsLowered) {
				this.boost({ spd: 2 }, target, target, null, false, true);
			}
		},
		name: "Shell Armor",
		rating: 1,
		num: 75,
	},
	shielddust: {
		onModifySecondaries(secondaries) {
			this.debug('Shield Dust prevent secondary');
			return secondaries.filter(effect => !!effect.self);
		},
		flags: { breakable: 1 },
		name: "Shield Dust",
		rating: 2,
		num: 19,
	},
	shieldsdown: {
		onSwitchInPriority: -1,
		onStart(pokemon) {
			if (pokemon.baseSpecies.baseSpecies !== 'Minior' || pokemon.transformed) return;
			if (pokemon.hp > pokemon.maxhp / 2) {
				if (pokemon.species.forme !== 'Meteor') {
					pokemon.formeChange('Minior-Meteor');
				}
			} else {
				if (pokemon.species.forme === 'Meteor') {
					pokemon.formeChange(pokemon.set.species);
				}
			}
		},
		onResidualOrder: 29,
		onResidual(pokemon) {
			if (pokemon.baseSpecies.baseSpecies !== 'Minior' || pokemon.transformed || !pokemon.hp) return;
			if (pokemon.hp > pokemon.maxhp / 2) {
				if (pokemon.species.forme !== 'Meteor') {
					pokemon.formeChange('Minior-Meteor');
				}
			} else {
				if (pokemon.species.forme === 'Meteor') {
					pokemon.formeChange(pokemon.set.species);
				}
			}
		},
		onSetStatus(status, target, source, effect) {
			if (target.species.id !== 'miniormeteor' || target.transformed) return;
			if ((effect as Move)?.status) {
				this.add('-immune', target, '[from] ability: Shields Down');
			}
			return false;
		},
		onTryAddVolatile(status, target) {
			if (target.species.id !== 'miniormeteor' || target.transformed) return;
			if (status.id !== 'yawn') return;
			this.add('-immune', target, '[from] ability: Shields Down');
			return null;
		},
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, cantsuppress: 1 },
		name: "Shields Down",
		rating: 3,
		num: 197,
	},
	simple: {
		onChangeBoost(boost, target, source, effect) {
			if (effect && effect.id === 'zpower') return;
			let i: BoostID;
			for (i in boost) {
				boost[i]! *= 2;
			}
		},
		flags: { breakable: 1 },
		name: "Simple",
		rating: 4,
		num: 86,
	},
	skilllink: {
		onModifyMove(move) {
			if (move.multihit && Array.isArray(move.multihit) && move.multihit.length) {
				move.multihit = move.multihit[1];
			}
			if (move.multiaccuracy) {
				delete move.multiaccuracy;
			}
		},
		onBasePower(basePower, source, target, move) {
			if (move.multihit) return this.chainModify(1.5);
		},
		flags: {},
		name: "Skill Link",
		rating: 3,
		num: 92,
	},
	slowstart: {
		onStart(pokemon) {
			pokemon.addVolatile('slowstart');
			if (this.field.isTerrain('holyterrain')) {
				this.add('-message', 'Divine energy courses through ' + pokemon.name);
			}
		},
		onModifyDef(def, pokemon) {
			if (this.field.isTerrain('holyterrain')) {
				return this.chainModify(1.5);
			}
		},
		onEnd(pokemon) {
			delete pokemon.volatiles['slowstart'];
			this.add('-end', pokemon, 'Slow Start', '[silent]');
		},
		condition: {
			duration: 3,
			onResidualOrder: 28,
			onResidualSubOrder: 2,
			onStart(target) {
				this.add('-start', target, 'ability: Slow Start');
			},
			onModifyAtkPriority: 5,
			onModifyAtk(atk, pokemon) {
				if (!this.field.isTerrain('holyterrain')) {
					return this.chainModify(0.65);
				}
			},
			onModifySpe(spe, pokemon) {
				if (!this.field.isTerrain('holyterrain')) {
					return this.chainModify(0.5);
				}
			},
			onModifyDef(def, pokemon) {
				if (!this.field.isTerrain('holyterrain')) {
					return this.chainModify(2);
				}
			},
			onResidual(pokemon) {
				if (this.field.isTerrain('electricterrain')) {
					if (pokemon.volatiles['slowstart']?.duration) {
						pokemon.volatiles['slowstart'].duration--;
					}
					if (pokemon.volatiles['slowstart'].duration === 0) {
						delete pokemon.volatiles['slowstart'];
						this.add('-end', pokemon, 'Slow Start');
					}
				}
			},
			onEnd(target) {
				this.add('-end', target, 'Slow Start');
			},
		},
		flags: {},
		name: "Slow Start",
		rating: -1,
		num: 112,
	},
	slushrush: {
		onModifySpe(spe, pokemon) {
			if (this.field.isWeather(['hail', 'snow']) || this.field.isTerrain(['icyterrain', 'snowymountainterrain', 'coldeclipseterrain'])) {
				return this.chainModify(2);
			}
		},
		flags: {},
		name: "Slush Rush",
		rating: 3,
		num: 202,
	},
	sniper: {
		onStart(pokemon) {
			this.boost({ accuracy: 1 }, pokemon, null);
		},
		onModifyDamage(damage, source, target, move) {
			if (target.getMoveHitData(move).crit) {
				this.debug('Sniper boost');
				return this.chainModify(3);
			}
		},
		flags: {},
		name: "Sniper",
		rating: 2,
		num: 97,
	},
	webassassin: {
		onModifySpe(spe, pokemon) {
			return this.chainModify(2);
		},
		onTryBoost(boost, target, source, effect) {
			if (boost.spe && boost.spe < 0) {
				delete boost.spe;
				this.add('-fail', target, 'unboost', 'Speed', '[from] ability: Web Assassin', `[of] ${target}`);
			}
		},
		onModifyDamage(damage, source, target, move) {
			if (target.getMoveHitData(move).crit) {
				this.debug('Web Assassin Sniper boost');
				return this.chainModify(3);
			}
		},
		onModifyCritRatio(critRatio, source, target) {
			if (!target) return;
			if (['psn', 'tox'].includes(target.status) || target.boosts.spe < 0) return 5;
		},
		flags: {},
		name: "Web Assassin",
		rating: 4,
		num: 10162,
	},
	snowcloak: {
		onStart(pokemon) {
			if (this.field.isTerrain('mirrorarenaterrain')) {
				this.boost({ evasion: 1 }, pokemon);
			}
		},
		onImmunity(type, pokemon) {
			if (type === 'hail') return false;
		},
		onModifyAccuracyPriority: -1,
		onModifyAccuracy(accuracy) {
			if (typeof accuracy !== 'number') return;
			if (this.field.isWeather(['hail', 'snow']) || this.field.isTerrain(['icyterrain', 'snowymountainterrain', 'coldeclipseterrain'])) {
				this.debug('Snow Cloak - decreasing accuracy');
				return this.chainModify([3277, 4096]);
			}
		},
		flags: { breakable: 1 },
		name: "Snow Cloak",
		rating: 1.5,
		num: 81,
	},
	snowwarning: {
		onStart(source) {
			this.field.setWeather('hail');
		},
		onDamagingHit(damage, target, source, move) {
			if (!this.field.isTerrain('coldeclipseterrain') || !move || move.category === 'Status') return;
			if (source.volatiles['disable'] || move.isMax || move.flags['futuremove'] || move.id === 'struggle') return;
			this.add('-activate', target, 'ability: Snow Warning');
			source.addVolatile('disable', target);
		},
		flags: {},
		name: "Snow Warning",
		rating: 4,
		num: 117,
	},
	solarpower: {
		onModifySpAPriority: 5,
		onModifySpA(spa, pokemon) {
			if (['sunnyday', 'desolateland'].includes(pokemon.effectiveWeather()) && !this.field.isTerrain('coldeclipseterrain')) {
				return this.chainModify(1.5);
			}
		},
		onResidual(pokemon) {
			if (['sunnyday', 'desolateland'].includes(pokemon.effectiveWeather()) && !this.field.isTerrain('coldeclipseterrain')) {
				this.damage(pokemon.baseMaxhp / 8, pokemon, pokemon);
			}
		},
		flags: {},
		name: "Solar Power",
		rating: 2,
		num: 94,
	},
	solidrock: {
		onSourceModifyDamage(damage, source, target, move) {
			let modifier = 0.8;
			if (target.getMoveHitData(move).typeMod > 0) {
				this.debug('Solid Rock neutralize');
				modifier *= 0.75;
			}
			return this.chainModify(modifier);
		},
		flags: { breakable: 1 },
		name: "Solid Rock",
		rating: 3,
		num: 116,
	},
	sinisterblaze: {
		onStart(pokemon) {
			if (pokemon.status !== 'brn') {
				if (pokemon.status) pokemon.clearStatus();
				pokemon.setStatus('brn', pokemon, this.effect, true);
			}
		},
		onUpdate(pokemon) {
			if (pokemon.status !== 'brn') {
				if (pokemon.status) pokemon.clearStatus();
				pokemon.setStatus('brn', pokemon, this.effect, true);
			}
		},
		onSetStatus(status, target, source, effect) {
			if (status.id === 'brn') return;
			this.add('-immune', target, '[from] ability: Sinister Blaze');
			return false;
		},
		onResidualOrder: 10,
		onResidualSubOrder: 1,
		onResidual(pokemon) {
			if (pokemon.status !== 'brn') return;
			for (const foe of pokemon.foes()) {
				if (!foe || foe.fainted) continue;
				const damage = this.damage(foe.baseMaxhp / 8, foe, pokemon, this.effect);
				if (typeof damage === 'number' && damage > 0) {
					this.heal(damage, pokemon, pokemon, this.effect);
				}
			}
		},
		flags: { cantsuppress: 1, failroleplay: 1, failskillswap: 1, noentrain: 1, notrace: 1 },
		name: "Sinister Blaze",
		rating: 4,
		num: 10068,
	},
	soulfire: {
		onStart(pokemon) {
			if (this.field.isTerrain('coldeclipseterrain')) {
				this.boost({ def: 1, spd: 1 }, pokemon, pokemon);
			}
			if (this.field.isTerrain(['hauntedterrain', 'coldeclipseterrain'])) {
				this.boost({ def: 1, spd: 1 }, pokemon, pokemon);
			}
		},
		onImmunity(type, pokemon) {
			if (type === 'sandstorm' || type === 'hail') return false;
		},
		onResidual(pokemon) {
			if (this.field.isTerrain(['hauntedterrain', 'burningterrain', 'volcanicterrain', 'bewitchedwoodsterrain', 'coldeclipseterrain'])) this.boost({ atk: 1, spa: 1 }, pokemon, pokemon);
		},
		onModifyMove(move) {
			if (this.movehasType(move, ['Fire', 'Ghost'])) {
				(move as any).soulFireBurn = true;
				// Soul Fire's attacks bypass type immunities, including Fairy Tale's
				// field-added Dragon typing on Fire moves.
				move.ignoreImmunity = true;
				move.onEffectiveness = function (typeMod, target, type) {
					if (move.type === 'Ghost' && type === 'Normal') return typeMod;
					if (type === 'Steel' || type === 'Dark') return -1;
					return 0;
				};
			}
			if (move.id === 'willowisp') (move as any).soulFireBurn = true;
		},
		onSourceModifyDamage(damage, source, target, move) {
			if (source?.hasAbility('souleater') && target.hasAbility('soulfire') && this.movehasType(move, 'Ghost')) {
				return this.chainModify(2);
			}
			if (source?.hasAbility('soulfire') && target.hasAbility('soulfire') && this.movehasType(move, ['Fire', 'Ghost'])) {
				return this.chainModify(4);
			}
		},
		onTryHit(target, source, move) {
			if (source?.hasAbility('souleater') && this.movehasType(move, 'Ghost')) return;
			if (source?.hasAbility('soulfire') && target.hasAbility('soulfire') && this.movehasType(move, ['Fire', 'Ghost'])) return;
			if (target !== source && (this.movehasType(move, 'Fire') || this.movehasType(move, 'Ghost') || move.id === 'willowisp')) {
				if (!this.boost({ atk: 1, spa: 1 })) {
					this.add('-immune', target, '[from] ability: Soul Fire');
				}
				return null;
			}
		},
		onAnyRedirectTarget(target, source, source2, move) {
			if (!this.movehasType(move, 'Fire') && !this.movehasType(move, 'Ghost')) return;
			if (target?.hasAbility('souleater')) return;
			const redirectTarget = ['randomNormal', 'adjacentFoe'].includes(move.target) ? 'normal' : move.target;
			if (this.validTarget(this.effectState.target, source, redirectTarget)) {
				if (move.smartTarget) move.smartTarget = false;
				if (this.effectState.target !== target) {
					this.add('-activate', this.effectState.target, 'ability: Soul Fire');
				}
				return this.effectState.target;
			}
		},
		flags: { breakable: 1 },
		name: "Soul Fire",
		rating: 4,
		num: 10008,
	},
	soultag: {
		onStart(pokemon) {
			if (this.field.isTerrain('coldeclipseterrain')) {
				this.boost({ def: 1, spd: 1 }, pokemon, pokemon);
			}
		},
		onImmunity(type, pokemon) {
			if (type === 'sandstorm' || type === 'hail') return false;
		},
		onFoeTrapPokemon(pokemon) {
			if (pokemon.isAdjacent(this.effectState.target)) {
				pokemon.tryTrap(true);
			}
		},
		onFoeMaybeTrapPokemon(pokemon, source) {
			if (!source) source = this.effectState.target;
			if (!source || !pokemon.isAdjacent(source)) return;
			pokemon.maybeTrapped = true;
		},
		onResidual(pokemon) {
			if (this.field.isTerrain(['hauntedterrain', 'burningterrain', 'volcanicterrain', 'bewitchedwoodsterrain'])) this.boost({ atk: 1, spa: 1 }, pokemon, pokemon);
		},
		onFoeEffectiveness(typeMod, target, type, move) {
			if (move && move.effectType === 'Move' && move.category !== 'Status' && move.type === 'Fire' && typeMod < 0) {
				return 0;
			}
		},
		onModifyMove(move) {
			if (move.type === 'Fire') {
				move.ignoreAbility = true;
				move.ignoreImmunity = true;
			}
			if (move.type === 'Ghost' || move.types?.includes('Ghost')) {
				move.onEffectiveness = function (typeMod, target, type) {
					if (type === 'Normal') return typeMod;
					return 0;
				};
			}
		},
		onTryHit(target, source, move) {
			if (target !== source && (this.movehasType(move, 'Fire') || this.movehasType(move, 'Ghost') || move.id === 'willowisp')) {
				if (!this.boost({ atk: 1, spa: 1 })) {
					this.add('-immune', target, '[from] ability: Soul Tag');
				}
				return null;
			}
		},
		onAnyRedirectTarget(target, source, source2, move) {
			if (!this.movehasType(move, 'Fire') && !this.movehasType(move, 'Ghost')) return;
			const redirectTarget = ['randomNormal', 'adjacentFoe'].includes(move.target) ? 'normal' : move.target;
			if (this.validTarget(this.effectState.target, source, redirectTarget)) {
				if (move.smartTarget) move.smartTarget = false;
				if (this.effectState.target !== target) {
					this.add('-activate', this.effectState.target, 'ability: Soul Tag');
				}
				return this.effectState.target;
			}
		},
		flags: { breakable: 1 },
		name: "Soul Tag",
		rating: 5,
		num: 10029,
	},
	soulheart: {
		onAnyFaintPriority: 1,
		onAnyFaint() {
			if (this.field.isTerrain(['mistyterrain', 'rainbowterrain'])) {
				this.boost({ spa: 1, spd: 2 }, this.effectState.target);
			} else {
				this.boost({ spa: 1, spd: 1 }, this.effectState.target);
			}
		},
		flags: {},
		name: "Soul-Heart",
		rating: 3.5,
		num: 220,
	},
	highnoon: {
		onBasePowerPriority: 8,
		onBasePower(basePower, attacker, defender, move) {
			let modifier = getDualWieldModifier(move);
			if (this.movehasType(move, 'Water')) modifier *= 1.2;
			if (modifier !== 1) return this.chainModify(modifier);
		},
		onModifyMove(move) {
			this.dex.abilities.get('dualwield').onModifyMove?.call(this, move);
			if (move.category !== 'Status') move.accuracy = true;
		},
		onModifyCritRatio(critRatio, source, target) {
			if (target?.newlySwitched || !target?.moveThisTurnResult) return critRatio + 1;
		},
		flags: { breakable: 1 },
		name: "High Noon",
		rating: 4.5,
		num: 10028,
	},
	soundproof: {
		onTryHit(target, source, move) {
			if (target !== source && move.flags['sound']) {
				this.add('-immune', target, '[from] ability: Soundproof');
				return null;
			}
		},
		onAllyTryHitSide(target, source, move) {
			if (move.flags['sound']) {
				this.add('-immune', this.effectState.target, '[from] ability: Soundproof');
			}
		},
		flags: { breakable: 1 },
		name: "Soundproof",
		rating: 2,
		num: 43,
	},
	solaridol: {
		onStart(pokemon) {
			if (this.field.isTerrain(['newworldterrain', 'starlightarenaterrain'])) {
				this.boost({ def: 1 }, pokemon, pokemon);
			}
		},
		onImmunity(type, pokemon) {
			if (type === 'Ground') return false;
		},
		onBasePowerPriority: 8,
		onBasePower(basePower, attacker, defender, move) {
			if (move.type === 'Fire') return this.chainModify(1.5);
		},
		onModifyAtk(atk, pokemon) {
			if (pokemon.effectiveWeather() === 'sunnyday') return this.chainModify(1.5);
		},
		onEffectiveness(typeMod, target, type, move) {
			if (type === 'Grass') return -1;
		},
		flags: { breakable: 1 },
		name: "Solar Idol",
		rating: 4,
		num: 10018,
	},
	forestsurge: {
		onStart(source) {
			if (this.field.setTerrain('forestterrain')) {
				this.field.terrainState.duration = 5;
			}
		},
		flags: {},
		name: "Forest Surge",
		rating: 4,
		num: 10026,
	},
	lunaridol: {
		onStart(pokemon) {
			if (this.field.isTerrain(['newworldterrain', 'starlightarenaterrain'])) {
				this.boost({ spd: 1 }, pokemon, pokemon);
			}
		},
		onImmunity(type, pokemon) {
			if (type === 'Ground' || type === 'hail') return false;
		},
		onBasePowerPriority: 8,
		onBasePower(basePower, attacker, defender, move) {
			if (move.type === 'Ice') return this.chainModify(1.5);
		},
		onModifySpA(spa, pokemon) {
			if (pokemon.effectiveWeather() === 'hail' || pokemon.effectiveWeather() === 'snow') return this.chainModify(1.5);
		},
		flags: { breakable: 1 },
		name: "Lunar Idol",
		rating: 4,
		num: 10019,
	},
	parasitism: {
		onEffectiveness(typeMod, target, type, move) {
			if (target.hp > target.maxhp / 2 && typeMod > 0) return 0;
		},
		onStart(pokemon) {
			if (pokemon.hp > pokemon.maxhp / 2) {
				this.dex.abilities.get('magicguard').onStart?.call(this, pokemon);
			}
			if (pokemon.species.id === 'parasect') {
				pokemon.formeChange('Parasect-Parasitism', this.effect, false, '0', '[silent]');
			}
		},
		onSourceBasePowerPriority: 17,
		onSourceBasePower(basePower, attacker, defender, move) {
			return this.dex.abilities.get('dryskin').onSourceBasePower?.call(this, basePower, attacker, defender, move);
		},
		onModifySecondaries(secondaries, target, source, move) {
			if (target.hp > target.maxhp / 2) {
				this.debug('Parasitism prevent secondary');
				return secondaries.filter(effect => !!effect.self);
			}
		},
		onDamage(damage, target, source, effect) {
			if (target.volatiles['resuscitationpending']) return false;
			if (target.hp > target.maxhp / 2) {
				const magicGuardResult = this.dex.abilities.get('magicguard').onDamage?.call(
					this, damage, target, source, effect
				);
				if (magicGuardResult !== undefined) return magicGuardResult;
			}
			if (damage >= target.hp && target.baseSpecies.id === 'parasect') {
				target.addVolatile('resuscitationpending', target, this.dex.abilities.get('parasitism'));
				this.add('-activate', target, 'ability: Parasitism');
				this.add('-message', `${target.name} fake-fainted! Resuscitation will begin at the end of the turn!`);
				return Math.max(0, target.hp - 1);
			}
		},
		onTryHitPriority: 1,
		onTryHit(target, source, move) {
			const drySkinResult = this.dex.abilities.get('dryskin').onTryHit?.call(this, target, source, move);
			if (drySkinResult !== undefined) return drySkinResult;
			if (target.hp > target.maxhp / 2 && target !== source && target.foes().includes(source) && move.category === 'Status') {
				this.add('-immune', target, '[from] ability: Parasitism');
				return null;
			}
		},
		onWeather(target, source, effect) {
			return this.dex.abilities.get('dryskin').onWeather?.call(this, target, source, effect);
		},
		onResidual(pokemon) {
			return this.dex.abilities.get('dryskin').onResidual?.call(this, pokemon);
		},
		flags: { cantsuppress: 1 },
		name: "Parasitism",
		rating: 4,
		num: 10021,
	},
	resuscitation: {
		onCheckShow(pokemon) {
			this.dex.abilities.get('selfrepair').onCheckShow?.call(this, pokemon);
		},
		onSwitchOut(pokemon) {
			this.dex.abilities.get('selfrepair').onSwitchOut?.call(this, pokemon);
		},
		onResidual(pokemon) {
			this.dex.abilities.get('selfrepair').onResidual?.call(this, pokemon);
		},
		onImmunity(type, pokemon) {
			return this.dex.abilities.get('selfrepair').onImmunity?.call(this, type, pokemon);
		},
		onSourceModifyDamage(damage, source, target, move) {
			return this.dex.abilities.get('shadowshield').onSourceModifyDamage?.call(this, damage, source, target, move);
		},
		flags: {},
		name: "Resuscitation",
		rating: 5,
		num: 10347,
	},
	pendulumswing: {
		onModifyAccuracy(accuracy) {
			if (typeof accuracy === 'number') return this.chainModify(1.5);
		},
		onModifySpAPriority: 5,
		onModifySpA(spa) {
			return this.chainModify(1.5);
		},
		onTryHitPriority: 1,
		onTryHit(target, source, move) {
			return this.dex.abilities.get('magicbounce').onTryHit?.call(this, target, source, move);
		},
		onSourceModifyDamage(damage, source, target, move) {
			return this.dex.abilities.get('filter').onSourceModifyDamage?.call(this, damage, source, target, move);
		},
		flags: {},
		name: "Pendulum Swing",
		rating: 4.5,
		num: 10256,
	},
	lunarspirit: {
		onModifyMove(move) {
			if (move.type === 'Psychic' || move.type === 'Normal') move.forceSTAB = true;
		},
		flags: {},
		name: "Lunar Spirit",
		rating: 3,
		num: 10348,
	},
	royaldecree: {
		onStart(pokemon) {
			if (this.getAllActive().some(active => active.hasAbility('neutralization'))) return;
			this.add('-ability', pokemon, 'Royal Decree');
			const protectedSides = new Set();
			for (const active of this.getAllActive()) {
				if (!active.hasAbility('neutralization')) continue;
				protectedSides.add(active.side);
				if (active.side.allySide) protectedSides.add(active.side.allySide);
			}
			for (const side of this.sides) {
				if (side.sideConditions['safeguard']) protectedSides.add(side);
			}
			if (!protectedSides.size) this.add('-clearallboost');
			for (const active of this.getAllActive()) {
				if (protectedSides.has(active.side)) continue;
				const preservedBoosts: SparseBoostsTable = {};
				const preservePositiveBoosts = (...stats: BoostID[]) => {
					for (const stat of stats) {
						if (active.boosts[stat] > 0) preservedBoosts[stat] = active.boosts[stat];
					}
				};
				if (this.field.isTerrain('fairytaleterrain') && active.hasAbility(['mirrorarmor', 'irondominion', 'royaldecree', 'royalsun'])) {
					preservePositiveBoosts('def', 'spd');
				}
				if (this.field.isTerrain('mirrorarmor') && active.hasAbility(['mirrorarmor', 'irondominion'])) {
					preservePositiveBoosts('evasion');
				}
				if (this.field.isTerrain(['desertterrain', 'fairytaleterrain', 'caveterrain', 'crystalcavernterrain', 'newworldterrain', 'volcanicterrain']) && active.hasAbility('relicarmor')) {
					preservePositiveBoosts('def', 'spd');
				}
				if (this.field.isTerrain(['fairytaleterrain', 'bewitchedwoodsterrain', 'hauntedterrain', 'mistyterrain', 'newworldterrain']) && active.hasAbility('magician')) {
					preservePositiveBoosts('spa');
				}
				if (this.field.isTerrain(['newworldterrain', 'starlightarenaterrain', 'fairytaleterrain', 'chessboardterrain']) && active.hasAbility('stalwart')) {
					preservePositiveBoosts('spa');
				}
				active.clearBoosts();
				for (const stat in preservedBoosts) {
					active.boosts[stat as BoostID] = preservedBoosts[stat as BoostID]!;
				}
				if (protectedSides.size) this.add('-clearboost', active, '[from] ability: Royal Decree', `[of] ${pokemon}`);
			}
			for (const side of this.sides) {
				if (protectedSides.has(side)) continue;
				for (const sideCondition of ['reflect', 'lightscreen', 'auroraveil']) {
					if (side.removeSideCondition(sideCondition)) {
						this.add('-sideend', side, this.dex.conditions.get(sideCondition).name, '[from] ability: Royal Decree', `[of] ${pokemon}`);
					}
				}
			}
			if (this.field.isTerrain(['fairytaleterrain', 'chessboardterrain', 'newworldterrain', 'starlightarenaterrain'])) {
				const boost: SparseBoostsTable = {};
				for (const foe of pokemon.foes()) {
					if (!foe || foe.fainted) continue;
					const atk = foe.getStat('atk', false, true);
					const spa = foe.getStat('spa', false, true);
					if (atk >= spa) {
						boost.def = this.gameType === 'singles' ? 2 : 1;
					} else {
						boost.spd = this.gameType === 'singles' ? 2 : 1;
					}
				}
				if (boost.def || boost.spd) this.boost(boost, pokemon, pokemon);
			}
		},
		onAnyTryBoost(boost, target, source, effect) {
			if (this.getAllActive().some(pokemon => pokemon.hasAbility('neutralization'))) return;
			if (!effect || effect.id === 'royaldecree') return;
			if (effect.id === 'relicinstinct' || effect.id === 'neutralization') return;
			const isOnlyDrops = Object.values(boost).some(value => value && value < 0) &&
				!Object.values(boost).some(value => value && value > 0);
			if (isOnlyDrops && source === target && target.hasAbility('royaldecree')) return;
			const positiveBoost = Object.values(boost).some(value => value && value > 0);
			if (positiveBoost && target === source && effect.effectType === 'Ability') {
				const fieldAbilityBoosts: { [abilityid: string]: string[] } = {
					stalwart: ['newworldterrain', 'starlightarenaterrain', 'fairytaleterrain', 'chessboardterrain'],
					mirrorarmor: ['fairytaleterrain', 'mirrorarmor'],
					irondominion: ['fairytaleterrain', 'mirrorarmor'],
					relicarmor: ['desertterrain', 'fairytaleterrain', 'caveterrain', 'crystalcavernterrain', 'newworldterrain', 'volcanicterrain'],
					magician: ['fairytaleterrain', 'bewitchedwoodsterrain', 'hauntedterrain', 'mistyterrain', 'newworldterrain'],
				};
				const allowedFields = fieldAbilityBoosts[effect.id];
				if (allowedFields && this.field.isTerrain(allowedFields)) return;
			}
			const fieldEffect = effect.effectType === 'Field' || effect.effectType === 'Terrain';
			if (fieldEffect) return;
			let blocked = false;
			let stat: BoostID;
			for (stat in boost) {
				if (!boost[stat]) continue;
				delete boost[stat];
				blocked = true;
			}
			if (blocked) {
				const decree = this.getAllActive().find(pokemon => pokemon.hasAbility('royaldecree'));
				if (decree) {
					this.add('-message', `${decree.name}'s Royal Decree prevented the stat changes.`);
				} else {
					this.add('-message', `Royal Decree prevented the stat changes.`);
				}
			}
		},
		onModifyMove(move) {
			if (this.getAllActive().some(pokemon => pokemon.hasAbility('neutralization'))) return;
			if (move.flags['charge']) delete move.flags['charge'];
		},
		onModifyDef(def, pokemon) {
			if (this.getAllActive().some(active => active.hasAbility('neutralization'))) return;
			if (this.field.isTerrain('chessboardterrain')) return this.chainModify(1.5);
		},
		onModifySpD(spd, pokemon) {
			if (this.getAllActive().some(active => active.hasAbility('neutralization'))) return;
			if (this.field.isTerrain('chessboardterrain')) return this.chainModify(1.5);
		},
		flags: {},
		name: "Royal Decree",
		rating: 4,
		num: 10020,
	},
	royalhive: {
		onStart(pokemon) {
			pokemon.m.royalHiveStance = 'attack';
			this.boost({ atk: 1, spa: 1 }, pokemon, pokemon);
		},
		onAfterMove(pokemon, target, move) {
			if (!pokemon.hp) return;
			if (move.category === 'Status') {
				if (pokemon.m.royalHiveStance === 'defense') return;
				pokemon.m.royalHiveStance = 'defense';
				this.add('-message', 'Changed to Defense Stance!');
				this.boost({ atk: -1, spa: -1, def: 1, spd: 1 }, pokemon, pokemon);
				return;
			}
			if (pokemon.m.royalHiveStance !== 'defense') return;
			pokemon.m.royalHiveStance = 'attack';
			this.add('-message', 'Changed to Attack Stance!');
			this.boost({ def: -1, spd: -1, atk: 1, spa: 1 }, pokemon, pokemon);
		},
		onResidual(pokemon) {
			if (pokemon.m.royalHiveStance === 'defense') {
				this.heal(pokemon.baseMaxhp / 16, pokemon, pokemon);
			}
		},
		flags: {},
		name: "Royal Hive",
		rating: 4,
		num: 10201,
	},
	royalsun: {
		onBasePower(basePower, attacker, defender, move) { return this.dex.abilities.get('firemane').onBasePower?.call(this, basePower, attacker, defender, move); },
		onStart(pokemon) {
			this.field.setWeather('sunnyday', pokemon);
			if (this.getAllActive().some(active => active.hasAbility('neutralization'))) return;
			this.add('-ability', pokemon, 'Royal Decree');
			const protectedSides = new Set();
			for (const active of this.getAllActive()) {
				if (!active.hasAbility('neutralization')) continue;
				protectedSides.add(active.side);
				if (active.side.allySide) protectedSides.add(active.side.allySide);
			}
			for (const side of this.sides) {
				if (side.sideConditions['safeguard']) protectedSides.add(side);
			}
			if (!protectedSides.size) this.add('-clearallboost');
			for (const active of this.getAllActive()) {
				if (protectedSides.has(active.side)) continue;
				const stockpileLayers = active.volatiles['stockpile']?.layers || 0;
				const preservedBoosts: SparseBoostsTable = {};
				const preservePositiveBoosts = (...stats: BoostID[]) => {
					for (const stat of stats) {
						if (active.boosts[stat] > 0) preservedBoosts[stat] = active.boosts[stat];
					}
				};
				if (this.field.isTerrain('fairytaleterrain') && active.hasAbility(['mirrorarmor', 'irondominion', 'royaldecree', 'royalsun'])) {
					preservePositiveBoosts('def', 'spd');
				}
				if (this.field.isTerrain('mirrorarmor') && active.hasAbility(['mirrorarmor', 'irondominion'])) {
					preservePositiveBoosts('evasion');
				}
				if (this.field.isTerrain(['desertterrain', 'fairytaleterrain', 'caveterrain', 'crystalcavernterrain', 'newworldterrain', 'volcanicterrain']) && active.hasAbility('relicarmor')) {
					preservePositiveBoosts('def', 'spd');
				}
				if (this.field.isTerrain(['fairytaleterrain', 'bewitchedwoodsterrain', 'hauntedterrain', 'mistyterrain', 'newworldterrain']) && active.hasAbility('magician')) {
					preservePositiveBoosts('spa');
				}
				if (this.field.isTerrain(['newworldterrain', 'starlightarenaterrain', 'fairytaleterrain', 'chessboardterrain']) && active.hasAbility('stalwart')) {
					preservePositiveBoosts('spa');
				}
				active.clearBoosts();
				for (const stat in preservedBoosts) {
					active.boosts[stat as BoostID] = preservedBoosts[stat as BoostID]!;
				}
				if (protectedSides.size) this.add('-clearboost', active, '[from] ability: Royal Sun', `[of] ${pokemon}`);
				if (stockpileLayers) {
					active.boosts.def = Math.max(active.boosts.def, stockpileLayers);
					active.boosts.spd = Math.max(active.boosts.spd, stockpileLayers);
				}
			}
			for (const side of this.sides) {
				if (protectedSides.has(side)) continue;
				for (const sideCondition of ['reflect', 'lightscreen', 'auroraveil']) {
					if (side.removeSideCondition(sideCondition)) {
						this.add('-sideend', side, this.dex.conditions.get(sideCondition).name, '[from] ability: Royal Sun', `[of] ${pokemon}`);
					}
				}
			}
			if (this.field.isTerrain(['fairytaleterrain', 'chessboardterrain', 'newworldterrain', 'starlightarenaterrain'])) {
				const boost: SparseBoostsTable = {};
				for (const foe of pokemon.foes()) {
					if (!foe || foe.fainted) continue;
					const atk = foe.getStat('atk', false, true);
					const spa = foe.getStat('spa', false, true);
					if (atk >= spa) {
						boost.def = this.gameType === 'singles' ? 2 : 1;
					} else {
						boost.spd = this.gameType === 'singles' ? 2 : 1;
					}
				}
				if (boost.def || boost.spd) this.boost(boost, pokemon, pokemon);
			}
		},
		onAnyTryBoost(boost, target, source, effect) {
			if (this.getAllActive().some(pokemon => pokemon.hasAbility('neutralization'))) return;
			if (!effect || effect.id === 'royalsun') return;
			if (effect.id === 'stockpile' || effect.id === 'accumulation' || effect.id === 'neutralization') return;
			const isOnlyDrops = Object.values(boost).some(value => value && value < 0) &&
				!Object.values(boost).some(value => value && value > 0);
			if (isOnlyDrops && source === target && target.hasAbility('royalsun')) return;
			const positiveBoost = Object.values(boost).some(value => value && value > 0);
			if (positiveBoost && target === source && effect.effectType === 'Ability') {
				const fieldAbilityBoosts: { [abilityid: string]: string[] } = {
					stalwart: ['newworldterrain', 'starlightarenaterrain', 'fairytaleterrain', 'chessboardterrain'],
					mirrorarmor: ['fairytaleterrain', 'mirrorarmor'],
					irondominion: ['fairytaleterrain', 'mirrorarmor'],
					relicarmor: ['desertterrain', 'fairytaleterrain', 'caveterrain', 'crystalcavernterrain', 'newworldterrain', 'volcanicterrain'],
					magician: ['fairytaleterrain', 'bewitchedwoodsterrain', 'hauntedterrain', 'mistyterrain', 'newworldterrain'],
				};
				const allowedFields = fieldAbilityBoosts[effect.id];
				if (allowedFields && this.field.isTerrain(allowedFields)) return;
			}
			const fieldEffect = effect.effectType === 'Field' || effect.effectType === 'Terrain';
			if (fieldEffect) return;
			let blocked = false;
			let stat: BoostID;
			for (stat in boost) {
				if (!boost[stat]) continue;
				delete boost[stat];
				blocked = true;
			}
			if (blocked) this.add('-fail', target, 'boost', '[from] ability: Royal Sun', `[of] ${this.effectState.target}`);
		},
		onModifyMove(move) {
			if (this.getAllActive().some(pokemon => pokemon.hasAbility('neutralization'))) return;
			if (move.flags['charge']) delete move.flags['charge'];
		},
		onModifyDef(def, pokemon) {
			if (this.getAllActive().some(active => active.hasAbility('neutralization'))) return;
			if (this.field.isTerrain('chessboardterrain')) return this.chainModify(1.5);
		},
		onModifySpD(spd, pokemon) {
			if (this.getAllActive().some(active => active.hasAbility('neutralization'))) return;
			if (this.field.isTerrain('chessboardterrain')) return this.chainModify(1.5);
		},
		flags: {},
		name: "Royal Sun",
		rating: 4.5,
		num: 10142,
	},
	tremor: {
		onStart(source) {
			this.dex.abilities.get('snowwarning').onStart?.call(this, source);
			this.dex.abilities.get('icebody').onStart?.call(this, source);
			this.field.setWeather('sandstorm');
		},
		onBasePowerPriority: 8,
		onBasePower(basePower, attacker, defender, move) {
			if (move.flags['sound']) return this.chainModify(1.5);
		},
		onAllyBasePowerPriority: 8,
		onAllyBasePower(basePower, attacker, defender, move) {
			if (move.flags['sound']) return this.chainModify(1.5);
		},
		onModifyMove(move, pokemon) {
			if (move.flags['sound'] && move.category !== 'Status') {
				move.category = 'Physical';
				move.overrideOffensiveStat = 'atk';
				move.ignoreAbility = true;
			}
		},
		onAllyModifyMove(move, pokemon) {
			if (!move.flags['sound'] || move.category === 'Status') return;
			move.overrideOffensiveStat = pokemon.getStat('atk', false, true) > pokemon.getStat('spa', false, true) ? 'atk' : 'spa';
		},
		onAnyTryHit(target, source, move) {
			const pokemon = this.effectState.target;
			if (!target || !source || !move.flags['sound'] || move.category === 'Status') return;
			if (source.isAlly(pokemon) && target.isAlly(pokemon) && target !== source) {
				this.add('-immune', target, '[from] ability: Tremor');
				return null;
			}
		},
		onImmunity(type, pokemon) {
			if (type === 'Ground') return false;
		},
		flags: {},
		name: "Tremor",
		rating: 4,
		num: 10017,
	},
	resonanceforce: {
		onBasePowerPriority: 8,
		onBasePower(basePower, attacker, defender, move) {
			if (move.flags['sound']) return this.chainModify(1.5);
		},
		onAllyBasePowerPriority: 8,
		onAllyBasePower(basePower, attacker, defender, move) {
			if (move.flags['sound']) return this.chainModify(1.5);
		},
		onModifyMove(move) {
			if (move.flags['sound'] && move.category !== 'Status') move.overrideOffensiveStat = 'atk';
		},
		onAnyTryHit(target, source, move) {
			const pokemon = this.effectState.target;
			if (!target || !source || !move.flags['sound'] || move.category === 'Status') return;
			if (source.isAlly(pokemon) && target.isAlly(pokemon) && target !== source) {
				this.add('-immune', target, '[from] ability: Resonance Force');
				return null;
			}
		},
		flags: { breakable: 1 },
		name: "Resonance Force",
		rating: 4.5,
		num: 10200,
	},
	verdantdrake: {
		onBasePowerPriority: 22,
		onBasePower(basePower, attacker, defender, move) {
			let modifier = getDualWieldModifier(move);
			if (move.category !== 'Status' && attacker.hasType(move.type)) modifier *= 1.2;
			if (modifier !== 1) return this.chainModify(modifier);
		},
		onModifyMove(move, pokemon) {
			this.dex.abilities.get('dualwield').onModifyMove?.call(this, move, pokemon);
		},
		onSwitchOut(pokemon) {
			return this.dex.abilities.get('regenerator').onSwitchOut?.call(this, pokemon);
		},
		flags: { breakable: 1 },
		name: "Verdant Drake",
		rating: 4,
		num: 10030,
	},
	solarbloom: {
		onStart(pokemon) {
			this.singleEvent('WeatherChange', this.effect, this.effectState, pokemon);
		},
		onWeatherChange(pokemon) {
			if (['sunnyday', 'desolateland'].includes(pokemon.effectiveWeather())) {
				if (pokemon.species.id === 'cherrim') {
					pokemon.formeChange('Cherrim-Sunshine', this.effect, true);
					this.heal(pokemon.baseMaxhp / 8, pokemon, pokemon);
				}
			} else if (pokemon.species.id === 'cherrimsunshine') {
				pokemon.formeChange('Cherrim', this.effect, true);
			}
		},
		onModifySpe(spe, pokemon) {
			if (['sunnyday', 'desolateland'].includes(pokemon.effectiveWeather())) return this.chainModify(2);
		},
		flags: {},
		name: "Solar Bloom",
		rating: 4,
		num: 10031,
	},
	wrathshield: {
		onStart(pokemon) {
			this.dex.abilities.get('swornduty').onStart?.call(this, pokemon);
			pokemon.abilityState.wrathShieldHitTriggered = false;
			if (this.field.isTerrain(['fairytaleterrain', 'newworldterrain', 'chessboardterrain'])) {
				this.boost({ def: 1, spd: 1 }, pokemon, pokemon);
			}
		},
		onAfterMove(source, target, move) {
			if (move.category !== 'Status') source.abilityState.wrathShieldHitTriggered = false;
		},
		onDamagingHit(damage, target, source, move) {
			if (source && !source.isAlly(target)) {
				if (target.abilityState.wrathShieldHitTriggered) return;
				target.abilityState.wrathShieldHitTriggered = true;
				this.boost({ atk: 1, def: 1 }, target, target);
				this.heal(target.baseMaxhp / 16, target, target);
			}
		},
		onSourceModifyDamage(damage, source, target, move) {
			return this.dex.abilities.get('filter').onSourceModifyDamage?.call(this, damage, source, target, move);
		},
		onResidual(pokemon) {
			return this.dex.abilities.get('selfsufficient').onResidual?.call(this, pokemon);
		},
		onTryHit(target, source, move) {
			if (target !== source && (move.flags['bullet'] || move.flags['pulse'])) {
				this.add('-immune', target, '[from] ability: Wrath Shield');
				return null;
			}
		},
		onCriticalHit: false,
		onAfterEachBoost(boost, target, source, effect) {
			if (target.isAlly(source)) return;
			if (target.abilityState.wrathShieldDropTurn === this.turn) return;
			for (const statName in boost) {
				const stat = statName as BoostID;
				if (boost[stat]! < 0) {
					target.abilityState.wrathShieldDropTurn = this.turn;
					this.boost({ spd: 1 }, target, target, null, false, true);
					this.heal(target.baseMaxhp / 16, target, target);
					return;
				}
			}
		},
		flags: { breakable: 1 },
		name: "Wrath Shield",
		rating: 4.5,
		num: 10032,
	},
	shadowcurrent: {
		onStart(pokemon) {
			this.dex.abilities.get('swornduty').onStart?.call(this, pokemon);
		},
		onPrepareHit(source, target, move) {
			if (move.category === 'Status' || move.hasBounced || move.flags['futuremove'] || move.sourceEffect === 'snatch' || move.callsMove) return;
			const type = move.type;
			if (type && type !== '???' && source.getTypes().join() !== type) {
				if (!source.setType(type)) return;
				this.add('-start', source, 'typechange', type, '[from] ability: Shadow Current');
			}
		},
		onModifyMove(move, source, target) {
			this.dex.abilities.get('technician').onModifyMove?.call(this, move, this.effectState.target);
		},
		onBasePower(basePower, source, target, move) { return this.dex.abilities.get('technician').onBasePower?.call(this, basePower, source, target, move); },
		flags: {},
		name: "Shadow Current",
		rating: 4.5,
		num: 10033,
	},
	astralwitchcraft: {
		onStart(pokemon) {
			this.dex.abilities.get('swornduty').onStart?.call(this, pokemon);
			if (this.field.isTerrain(['fairytaleterrain', 'newworldterrain'])) {
				this.boost({ spa: 1, spd: 1 }, pokemon, pokemon);
			}
		},
		onDamage(damage, target, source, effect) {
			if (effect.effectType !== 'Move') {
				if (effect.effectType === 'Ability') this.add('-activate', source, 'ability: Astral Witchcraft');
				return false;
			}
		},
		onImmunity(type, pokemon) {
			if (type === 'Ground') return false;
		},
		flags: { breakable: 1 },
		name: "Astral Witchcraft",
		rating: 5,
		num: 10034,
	},
	blazingtempo: {
		onResidual(pokemon) { return this.dex.abilities.get('speedboost').onResidual?.call(this, pokemon); },
		onBasePower(basePower, attacker, defender, move) {
			const striker = this.dex.abilities.get('striker').onBasePower?.call(this, basePower, attacker, defender, move);
			return this.dex.abilities.get('proficient').onBasePower?.call(this, striker ?? basePower, attacker, defender, move);
		},
		flags: {},
		name: "Blazing Tempo",
		rating: 4.5,
		num: 10035,
	},
	ragingcurrent: {
		onModifySpe(spe, pokemon) { return this.dex.abilities.get('swiftswim').onModifySpe?.call(this, spe, pokemon); },
		onResidual(pokemon) { return this.dex.abilities.get('stamina').onResidual?.call(this, pokemon); },
		onDamagingHit(damage, target, source, move) { return this.dex.abilities.get('stamina').onDamagingHit?.call(this, damage, target, source, move); },
		onSwitchOut(pokemon) { return this.dex.abilities.get('regenerator').onSwitchOut?.call(this, pokemon); },
		flags: { breakable: 1 },
		name: "Raging Current",
		rating: 4.5,
		num: 10036,
	},
	toxicbloom: {
		onImmunity(type, pokemon) {
			return this.dex.abilities.get('pollenbloom').onImmunity?.call(this, type, pokemon);
		},
		onSourceModifyAtk(atk, attacker, defender, move) {
			return this.dex.abilities.get('pollenbloom').onSourceModifyAtk?.call(this, atk, attacker, defender, move);
		},
		onSourceModifySpA(spa, attacker, defender, move) {
			return this.dex.abilities.get('pollenbloom').onSourceModifySpA?.call(this, spa, attacker, defender, move);
		},
		onBasePower(basePower, attacker, defender, move) {
			return this.dex.abilities.get('pollenbloom').onBasePower?.call(this, basePower, attacker, defender, move);
		},
		onAnyTryHeal(damage, target, source, effect) {
			return this.dex.abilities.get('pollenbloom').onAnyTryHeal?.call(this, damage, target, source, effect);
		},
		onResidual(pokemon) {
			this.dex.abilities.get('pollenbloom').onResidual?.call(this, pokemon);
			return this.dex.abilities.get('selfsufficient').onResidual?.call(this, pokemon);
		},
		onModifyMove(move) {
			return this.dex.abilities.get('byxbysiontouch').onModifyMove?.call(this, move);
		},
		flags: { breakable: 1 },
		name: "Toxic Bloom",
		rating: 4.5,
		num: 10037,
	},
	siegelauncher: {
		onStart(pokemon) {
			this.dex.abilities.get('waterbarrage').onStart?.call(this, pokemon);
			this.dex.abilities.get('stalwart').onStart?.call(this, pokemon);
		},
		onUpdate(pokemon) { return this.dex.abilities.get('waterbarrage').onUpdate?.call(this, pokemon); },
		onSetStatus(status, target, source, effect) {
			return this.dex.abilities.get('waterbarrage').onSetStatus?.call(this, status, target, source, effect);
		},
		onImmunity(type, pokemon) { return this.dex.abilities.get('waterbarrage').onImmunity?.call(this, type, pokemon); },
		onBasePowerPriority: 19,
		onBasePower(basePower, attacker, defender, move) {
			const launcherBoost = move.flags['pulse'] || move.flags['bullet'] ? 1.5 : 1;
			let modifier = getDualWieldModifier(move, launcherBoost);
			if (move.category !== 'Status' && attacker.hasType(move.type)) modifier *= 1.2;
			if (modifier !== 1) return this.chainModify(modifier);
		},
		onModifyMovePriority: 1,
		onModifyMove(move, source) {
			this.dex.abilities.get('waterbarrage').onModifyMove?.call(this, move, source);
			this.dex.abilities.get('stalwart').onModifyMove?.call(this, move);
		},
		onResidual(pokemon) {
			this.dex.abilities.get('waterbarrage').onResidual?.call(this, pokemon);
			return this.dex.abilities.get('selfsufficient').onResidual?.call(this, pokemon);
		},
		flags: {},
		name: "Siege Launcher",
		rating: 4.5,
		num: 10038,
	},
	calderacore: {
		onStart(pokemon) {
			this.dex.abilities.get('drought').onStart?.call(this, pokemon);
			this.dex.abilities.get('magmaarmor').onStart?.call(this, pokemon);
		},
		onUpdate(pokemon) { return this.dex.abilities.get('magmaarmor').onUpdate?.call(this, pokemon); },
		onTryHit(target, source, move) { return this.dex.abilities.get('magmaarmor').onTryHit?.call(this, target, source, move); },
		onImmunity(type, pokemon) { return this.dex.abilities.get('magmaarmor').onImmunity?.call(this, type, pokemon); },
		onSourceModifyAtkPriority: 6,
		onSourceModifyAtk(atk, attacker, defender, move) { return this.dex.abilities.get('magmaarmor').onSourceModifyAtk?.call(this, atk, attacker, defender, move); },
		onSourceModifySpAPriority: 5,
		onSourceModifySpA(spa, attacker, defender, move) { return this.dex.abilities.get('magmaarmor').onSourceModifySpA?.call(this, spa, attacker, defender, move); },
		onModifyMove(move, pokemon) { return this.dex.abilities.get('sheerforce').onModifyMove?.call(this, move, pokemon); },
		onBasePowerPriority: 21,
		onBasePower(basePower, attacker, defender, move) { return this.dex.abilities.get('sheerforce').onBasePower?.call(this, basePower, attacker, defender, move); },
		onResidual(pokemon) {
			for (const target of pokemon.foes()) {
				if (!target || target.fainted || isImmuneToScalingChip(target, 'Fire')) continue;
				const fire = this.clampIntRange(this.dex.getEffectiveness('Fire', target.getTypes()), -6, 6);
				this.damage(target.baseMaxhp / 16 * Math.max(0.25, 2 ** fire), target, pokemon);
			}
		},
		flags: { breakable: 1 },
		name: "Caldera Core",
		rating: 4.5,
		num: 10039,
	},
	speedboost: {
		onResidualOrder: 28,
		onResidualSubOrder: 2,
		onResidual(pokemon) {
			if (pokemon.activeTurns) {
				this.boost({ spe: 1 });
			}
		},
		flags: {},
		name: "Speed Boost",
		rating: 4.5,
		num: 3,
	},
	spicyspray: {
		isNonstandard: "Future",
		onDamagingHit(damage, target, source, move) {
			if (!source.trySetStatus('brn', target) && !source.status && source.hasType('Fire')) {
				this.add('-immune', source);
			}
		},
		onResidual(pokemon) { return this.dex.abilities.get('selfsufficient').onResidual?.call(this, pokemon); },
		flags: {},
		name: "Spicy Spray",
		rating: 3,
		num: 318,
	},
	stakeout: {
		onModifyAtkPriority: 5,
		onModifyAtk(atk, attacker, defender) {
			if (!defender.activeTurns) {
				this.debug('Stakeout boost');
				return this.chainModify(2);
			}
		},
		onModifySpAPriority: 5,
		onModifySpA(atk, attacker, defender) {
			if (!defender.activeTurns) {
				this.debug('Stakeout boost');
				return this.chainModify(2);
			}
		},
		flags: {},
		name: "Stakeout",
		rating: 4.5,
		num: 198,
	},
	stall: {
		onFractionalPriority: -0.1,
		flags: {},
		onStart(pokemon) {
			if (this.field.isTerrain('chessboardterrain')) {
				this.add('-message', pokemon.name + ' is stalling and playing defensively!');
				this.boost({ def: 1 });
			}
		},
		name: "Stall",
		rating: -1,
		num: 100,
	},
	stalwart: {
		onStart(pokemon) {
			if (this.field.isTerrain(['newworldterrain', 'starlightarenaterrain', 'fairytaleterrain', 'chessboardterrain'])) {
				this.boost({ spa: 1 }, pokemon, pokemon, this.dex.abilities.get('stalwart'));
			}
		},
		onModifyMovePriority: 1,
		onModifyMove(move) {
			// most of the implementation is in Battle#getTarget
			move.tracksTarget = move.target !== 'scripted';
		},
		flags: {},
		name: "Stalwart",
		rating: 0,
		num: 242,
	},
	stamina: {
		onDamagingHit(damage, target, source, effect) {
			if (!source || target.isAlly(source)) return;
			if (target.abilityState.staminaHitTurn !== this.turn) {
				target.abilityState.staminaHitTurn = this.turn;
				this.boost({ def: 1 }, target, target);
			}
			this.heal(target.baseMaxhp / 16, target, target);
		},
		flags: {},
		name: "Stamina",
		rating: 4,
		num: 192,
	},
	stancechange: {
		onModifyMovePriority: 1,
		onStart() {
			if (this.field.isTerrain('fairytaleterrain') || this.field.isTerrain('chessboardterrain')) {
				this.boost({ def: 1 });
			}
		},
		onModifyMove(move, attacker, defender) {
			if (attacker.species.baseSpecies !== 'Aegislash' || attacker.transformed) return;
			if (attacker.species.id === 'aegislashgmax') return;
			if (move.category === 'Status' && move.id !== 'kingsshield') return;
			const targetForme = (move.id === 'kingsshield' ? 'Aegislash' : 'Aegislash-Blade');
			if (attacker.species.name !== targetForme) {
				if (this.field.isTerrain('fairytaleterrain') || this.field.isTerrain('chessboardterrain')) {
					if (targetForme === 'Aegislash') {
						this.boost({ def: 1, atk: -1 });
					} else {
						this.boost({ def: -1, atk: 1 });
					}
				}
				attacker.formeChange(targetForme);
			}
			this.dex.abilities.get('dualwield').onModifyMove?.call(this, move, attacker);
		},
		onBasePower(basePower, source, target, move) {
			if (source.species.baseSpecies !== 'Aegislash' || source.transformed || move.category === 'Status') return;
			let modifier = getDualWieldModifier(move);
			if (source.species.name === 'Aegislash-Blade') modifier *= 1.2;
			if (modifier !== 1) return this.chainModify(modifier);
		},
		onSourceModifyDamage(damage, source, target, move) {
			if (target.species.baseSpecies !== 'Aegislash' || target.transformed || move.category === 'Status') return;
			if (target.species.name === 'Aegislash') {
				let modifier = 0.8;
				if (this.gameType === 'freeforall' && target.abilityState.stanceChangeShieldHitTurn === this.turn) {
					modifier *= 0.7;
				}
				return this.chainModify(modifier);
			}
		},
		onDamagingHit(damage, target, source, move) {
			if (target.species.baseSpecies !== 'Aegislash' || target.species.name !== 'Aegislash' || target.transformed) return;
			if (this.gameType === 'freeforall' && move.category !== 'Status') {
				target.abilityState.stanceChangeShieldHitTurn = this.turn;
			}
		},
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, cantsuppress: 1 },
		name: "Stance Change",
		rating: 4,
		num: 176,
	},
	static: {
		onDamagingHit(damage, target, source, move) {
			if (this.checkMoveMakesContact(move, source, target)) {
				let chance = 3;
				if (this.field.isTerrain('shortcircuitterrain') || this.field.isTerrain('electricterrain')) {
					chance = 6;
				}
				if (this.randomChance(chance, 10)) {
					source.trySetStatus('par', target);
				}
			}
		},
		flags: {},
		name: "Static",
		rating: 2,
		num: 9,
	},
	steadfast: {
		onStart(pokemon) {
			if (this.field.isTerrain('electricterrain'))
				this.boost({ spe: 1 });
		},
		onFlinch(pokemon) {
			this.boost({ spe: 1 });
		},
		flags: {},
		name: "Steadfast",
		rating: 1,
		num: 80,
	},
	steamengine: {
		onDamagingHit(damage, target, source, move) {
			if (move && this.movehasType(move, ['Water', 'Fire'])) {
				this.boost({ spe: 6 });
			}
		},
		onStart(pokemon) {
			this.dex.abilities.get('magmaarmor').onStart?.call(this, pokemon);
			if (this.field.isTerrain(['burningterrain', 'superheatedterrain', 'volcanicterrain'])) {
				this.add('-message', 'The heat activates' + pokemon.name + '\'s Steam Engine!');
				this.boost({ spe: 6 }, pokemon);
			}
		},
		onResidual(pokemon) {
			this.dex.abilities.get('selfsufficient').onResidual?.call(this, pokemon);
			if (this.field.isTerrain(['volcanicterrain', 'underwaterterrain', 'watersurfaceterrain'])) {
				this.boost({ spe: 1 });
			}
		},
		onUpdate(pokemon) {
			this.dex.abilities.get('magmaarmor').onUpdate?.call(this, pokemon);
		},
		onTryHit(target, source, move) {
			return this.dex.abilities.get('magmaarmor').onTryHit?.call(this, target, source, move);
		},
		onSourceModifyAtkPriority: 6,
		onSourceModifyAtk(atk, attacker, defender, move) {
			return this.dex.abilities.get('magmaarmor').onSourceModifyAtk?.call(this, atk, attacker, defender, move);
		},
		onSourceModifySpAPriority: 5,
		onSourceModifySpA(spa, attacker, defender, move) {
			return this.dex.abilities.get('magmaarmor').onSourceModifySpA?.call(this, spa, attacker, defender, move);
		},
		onImmunity(type, pokemon) {
			if (this.dex.abilities.get('selfsufficient').onImmunity?.call(this, type, pokemon) === false) return false;
			return this.dex.abilities.get('magmaarmor').onImmunity?.call(this, type, pokemon);
		},
		flags: {},
		name: "Steam Engine",
		rating: 2,
		num: 243,
	},
	steelworker: {
		onEffectiveness(typeMod, target, type, move) {
			if (['Normal', 'Flying', 'Rock', 'Bug', 'Steel', 'Grass', 'Psychic', 'Ice', 'Dragon', 'Fairy'].includes(type)) {
				return typeMod - 1;
			}
		},
		onImmunity(type, pokemon) {
			if (type === 'Poison') return false;
		},
		onModifyAtkPriority: 5,
		onModifyMove(move) {
			if (move && this.movehasType(move, 'Steel')) move.forceSTAB = true;
			if (move && this.movehasType(move, 'Steel') && this.field.isTerrain('shortcircuitterrain')) {
				move.types = ['Steel', 'Electric'];
			}
		},
		onModifyAtk(atk, attacker, defender, move) {
			if (move && this.movehasType(move, 'Steel')) {
				this.debug('Steelworker boost');
				if (this.field.isTerrain('factoryterrain')) {
					return this.chainModify(2);
				} else {
					return this.chainModify(1.5);
				}
			}
		},
		onModifySpAPriority: 5,
		onModifySpA(atk, attacker, defender, move) {
			if (move && this.movehasType(move, 'Steel')) {
				this.debug('Steelworker boost');
				return this.chainModify(this.field.isTerrain('factoryterrain') ? 2 : 1.5);
			}
		},
		flags: {},
		name: "Steelworker",
		rating: 3.5,
		num: 200,
	},
	steelyspirit: {
		onAllyBasePowerPriority: 22,
		onAllyBasePower(basePower, attacker, defender, move) {
			if (move && this.movehasType(move, 'Steel')) {
				this.debug('Steely Spirit boost');
				if (this.field.isTerrain('fairytaleterrain')) {
					return this.chainModify(2);
				}
				return this.chainModify(1.5);
			}
		},
		flags: {},
		name: "Steely Spirit",
		rating: 3.5,
		num: 252,
	},
	stench: {
		onModifyMovePriority: -1,
		onModifyMove(move) {
			if (move.category !== "Status") {
				this.debug('Adding Stench flinch');
				if (!move.secondaries) move.secondaries = [];
				for (const secondary of move.secondaries) {
					if (secondary.volatileStatus === 'flinch') return;
				}
				if (this.field.isTerrain('murkwatersurfaceterrain') || this.field.isTerrain('wastelandterrain')) {
					move.secondaries.push({
						chance: 20,
						volatileStatus: 'flinch',
					});
				} else {
					move.secondaries.push({
						chance: 10,
						volatileStatus: 'flinch',
					});
				}
			}
		},
		flags: {},
		name: "Stench",
		rating: 0.5,
		num: 1,
	},
	stickyhold: {
		onTakeItem(item, pokemon, source) {
			if (!this.activeMove) throw new Error("Battle.activeMove is null");
			if (!pokemon.hp || pokemon.item === 'stickybarb') return;
			if ((source && source !== pokemon) || this.activeMove.id === 'knockoff') {
				this.add('-activate', pokemon, 'ability: Sticky Hold');
				return false;
			}
		},
		flags: { breakable: 1 },
		name: "Sticky Hold",
		rating: 1.5,
		num: 60,
	},
	stormdrain: {
		onTryHit(target, source, move) {
			if (target !== source && this.movehasType(move, 'Water')) {
				if (!this.boost({ spa: 1, atk: 1 })) {
					this.add('-immune', target, '[from] ability: Storm Drain');
				}
				return null;
			}
		},
		onAnyRedirectTarget(target, source, source2, move) {
			const seeds = ['elementalseed', 'magicseed', 'telluricseed', 'syntheticseed'];
			if (!this.movehasType(move, 'Water') || move.flags['pledgecombo'] || (seeds.includes(move.sourceEffect) && target === source)) return;
			const redirectTarget = ['randomNormal', 'adjacentFoe'].includes(move.target) ? 'normal' : move.target;
			if (this.validTarget(this.effectState.target, source, redirectTarget)) {
				if (move.smartTarget) move.smartTarget = false;
				if (this.effectState.target !== target) {
					this.add('-activate', this.effectState.target, 'ability: Storm Drain');
				}
				return this.effectState.target;
			}
		},
		flags: { breakable: 1 },
		name: "Storm Drain",
		rating: 3,
		num: 114,
	},
	striker: {
		onBasePowerPriority: 23,
		onBasePower(basePower, attacker, defender, move) {
			if (move.flags['kick']) {
				this.debug('Striker boost');
				return this.chainModify(1.4);
			}
		},
		flags: {},
		name: "Striker",
		rating: 3,
		num: 10009,
	},
	strikersmomentum: {
		onStart(pokemon) {
			pokemon.abilityState.strikersMomentumBoosted = false;
		},
		onPrepareHit(source, target, move) {
			if (move.category === 'Status' || move.hasBounced || move.flags['futuremove'] || move.sourceEffect === 'snatch' || move.callsMove) return;
			const type = move.type;
			if (type && type !== '???' && source.getTypes().join() !== type) {
				if (!source.setType(type)) return;
				this.add('-start', source, 'typechange', type, "[from] ability: Striker's Momentum");
			}
		},
		onModifyMove(move) {
			move.accuracy = true;
		},
		onBasePowerPriority: 23,
		onBasePower(basePower, attacker, defender, move) {
			return this.dex.abilities.get('striker').onBasePower?.call(this, basePower, attacker, defender, move);
		},
		onSourceAfterFaint(length, target, source, effect) {
			if (source.abilityState.strikersMomentumBoosted) return;
			if (effect?.effectType !== 'Move') return;
			source.abilityState.strikersMomentumBoosted = true;
			this.boost({ spe: 1 }, source, source, this.effect);
		},
		flags: {},
		name: "Striker's Momentum",
		rating: 4,
		num: 10027,
	},
	strongjaw: {
		onBasePowerPriority: 19,
		onBasePower(basePower, attacker, defender, move) {
			if (move.flags['bite']) {
				return this.chainModify(1.5);
			}
		},
		flags: {},
		name: "Strong Jaw",
		rating: 3.5,
		num: 173,
	},
	blackfang: {
		onBasePowerPriority: 19,
		onBasePower(basePower, attacker, defender, move) {
			return this.dex.abilities.get('strongjaw').onBasePower?.call(this, basePower, attacker, defender, move);
		},
		onUpdate(pokemon) {
			return this.dex.abilities.get('insomnia').onUpdate?.call(this, pokemon);
		},
		onSetStatus(status, target, source, effect) {
			return this.dex.abilities.get('insomnia').onSetStatus?.call(this, status, target, source, effect);
		},
		flags: {},
		name: "Black Fang",
		rating: 3.5,
		num: 10309,
	},
	fluffycraft: {
		onSourceModifyDamage(damage, source, target, move) {
			return this.dex.abilities.get('fluffy').onSourceModifyDamage?.call(this, damage, source, target, move);
		},
		onBasePowerPriority: 21,
		onBasePower(basePower, attacker, defender, move) {
			return this.dex.abilities.get('technician').onBasePower?.call(this, basePower, attacker, defender, move);
		},
		flags: {},
		name: "Fluffy Craft",
		rating: 3.5,
		num: 10310,
	},
	mightyjaw: {
		onStart(pokemon) {
			pokemon.abilityState.mightyJawUsed = false;
			this.dex.abilities.get('intimidate').onStart?.call(this, pokemon);
		},
		onBasePowerPriority: 19,
		onBasePower(basePower, attacker, defender, move) {
			return this.dex.abilities.get('strongjaw').onBasePower?.call(this, basePower, attacker, defender, move);
		},
		onModifyPriority(priority, pokemon) {
			if (!pokemon.abilityState.mightyJawUsed) return priority + 2;
		},
		onAfterMove(source) {
			source.abilityState.mightyJawUsed = true;
		},
		flags: {},
		name: "Mighty Jaw",
		rating: 4,
		num: 10308,
	},
	sturdy: {
		onTryHit(pokemon, target, move) {
			if (move.ohko) {
				this.add('-immune', pokemon, '[from] ability: Sturdy');
				return null;
			}
		},
		onDamagePriority: -30,
		onDamage(damage, target, source, effect) {
			if (target.hp === target.maxhp && damage >= target.hp && effect && effect.effectType === 'Move') {
				this.add('-ability', target, 'Sturdy');
				return target.hp - 1;
			}
		},
		flags: { breakable: 1 },
		name: "Sturdy",
		rating: 3,
		num: 5,
	},
	suctioncups: {
		onDragOutPriority: 1,
		onDragOut(pokemon) {
			this.add('-activate', pokemon, 'ability: Suction Cups');
			return null;
		},
		flags: { breakable: 1 },
		name: "Suction Cups",
		rating: 1,
		num: 21,
	},
	superluck: {
		onModifyCritRatio(critRatio) {
			return critRatio + 1;
		},
		flags: {},
		name: "Super Luck",
		rating: 1.5,
		num: 105,
	},
	supersweetsyrup: {
		onStart(pokemon) {
			if (pokemon.syrupTriggered) return;
			pokemon.syrupTriggered = true;
			this.add('-ability', pokemon, 'Supersweet Syrup');
			for (const target of pokemon.adjacentFoes()) {
				if (target.volatiles['substitute']) {
					this.add('-immune', target);
				} else {
					this.boost({ evasion: -1 }, target, pokemon, null, true);
				}
			}
			if (this.field.isTerrain('mistyterrain')) {
				this.boost({ accuracy: -1 });
			}
		},
		flags: {},
		name: "Supersweet Syrup",
		rating: 1.5,
		num: 306,
	},
	supremeoverlord: {
		fallen(pokemon) {
			const totalFainted = pokemon.side.totalFainted + (pokemon.side.allySide?.totalFainted || 0);
			return this.gameType === 'freeforall' ? totalFainted * 2 : totalFainted;
		},
		onStart(pokemon) {
			const totalFainted = this.effect.fallen.call(this, pokemon);
			if (totalFainted) {
				this.add('-activate', pokemon, 'ability: Supreme Overlord');
				this.add('-start', pokemon, `fallen${totalFainted}`, '[silent]');
				this.effectState.fallen = totalFainted;
			}
			if (totalFainted >= 5 && !pokemon.abilityState.supremeOverlordAttackBoosted) {
				pokemon.abilityState.supremeOverlordAttackBoosted = true;
				this.boost({ atk: 1, spa: 1 }, pokemon, pokemon);
			}
		},
		onEnd(pokemon) {
			if (this.effectState.fallen) this.add('-end', pokemon, `fallen${this.effectState.fallen}`, '[silent]');
		},
		onAnyFaint() {
			const pokemon = this.effectState.target;
			if (!pokemon?.hp) return;
			const totalFainted = this.effect.fallen.call(this, pokemon);
			if (totalFainted !== this.effectState.fallen) {
				if (this.effectState.fallen) this.add('-end', pokemon, `fallen${this.effectState.fallen}`, '[silent]');
				this.effectState.fallen = totalFainted;
				this.add('-activate', pokemon, 'ability: Supreme Overlord');
				this.add('-start', pokemon, `fallen${totalFainted}`, '[silent]');
			}
			if (totalFainted >= 5 && !pokemon.abilityState.supremeOverlordAttackBoosted) {
				pokemon.abilityState.supremeOverlordAttackBoosted = true;
				this.boost({ atk: 1, spa: 1 }, pokemon, pokemon);
			}
		},
		onBasePowerPriority: 21,
		onBasePower(basePower, attacker, defender, move) {
			const fallen = this.effect.fallen.call(this, attacker);
			let modifier = 1;
			if (fallen) {
				modifier *= 1 + 0.1 * fallen;
				this.debug(`Supreme Overlord boost: ${modifier}x`);
			}
			if (modifier !== 1) return this.chainModify(modifier);
		},
		onModifyMove(move, pokemon) {
			const fallen = this.effect.fallen.call(this, pokemon);
			if (fallen >= 4) this.dex.abilities.get('infiltrator').onModifyMove?.call(this, move, pokemon);
		},
		onTryBoost(boost, target, source, effect) {
			if (source && target === source) return;
			if (this.effect.fallen.call(this, target) >= 1) return this.dex.abilities.get('clearbody').onTryBoost?.call(this, boost, target, source, effect);
		},
		onTryAddVolatile(status, pokemon) {
			if (this.effect.fallen.call(this, pokemon) >= 2) return this.dex.abilities.get('innerfocus').onTryAddVolatile?.call(this, status, pokemon);
		},
		onSourceModifyDamage(damage, source, target, move) {
			if (!move || move.category === 'Status') return;
			const fallen = this.effect.fallen.call(this, target);
			if (fallen >= 3) return this.dex.abilities.get('filter').onSourceModifyDamage?.call(this, damage, source, target, move);
		},
		onResidual(pokemon) {
			return this.dex.abilities.get('selfsufficient').onResidual?.call(this, pokemon);
		},
		onDamage(damage, target, source, effect) {
			if (this.effect.fallen.call(this, target) >= 5) {
				const magicGuardResult = this.dex.abilities.get('magicguard').onDamage?.call(this, damage, target, source, effect);
				if (magicGuardResult !== undefined) return magicGuardResult;
			}
			if (!['doubles', 'multi', 'freeforall'].includes(this.gameType)) return;
			if (effect?.effectType !== 'Move') return;
			if (this.effect.fallen.call(this, target) < 3) return;
			if (target.abilityState.supremeOverlordEndured) return;
			if (target.hp <= target.maxhp / 2) return;
			if (damage < target.hp) return;
			target.abilityState.supremeOverlordEndured = true;
			this.add('-activate', target, 'ability: Supreme Overlord');
			return target.hp - 1;
		},
		flags: {},
		name: "Supreme Overlord",
		rating: 4,
		num: 293,
	},
	surgesurfer: {
		onModifySpe(spe) {
			if (this.field.isTerrain(['electricterrain', 'watersurfaceterrain', 'underwaterterrain', 'murkwatersurfaceterrain', 'shortcircuitterrain'])) {
				return this.chainModify(2);
			}
		},
		flags: {},
		name: "Surge Surfer",
		rating: 3,
		num: 207,
	},
	swarm: {
		onModifyAtkPriority: 5,
		onModifyAtk(atk, attacker, defender, move) {
			if ((move && this.movehasType(move, 'Bug') && attacker.hp <= attacker.maxhp / 3) || this.field.isTerrain('grassyterrain') || this.field.isTerrain('forestterrain')) {
				this.debug('Swarm boost');
				return this.chainModify(1.5);
			}
		},
		onModifySpAPriority: 5,
		onModifySpA(atk, attacker, defender, move) {
			if ((move && this.movehasType(move, 'Bug') && attacker.hp <= attacker.maxhp / 3) || this.field.isTerrain('grassyterrain') || this.field.isTerrain('forestterrain')) {
				this.debug('Swarm boost');
				return this.chainModify(1.5);
			}
		},
		flags: {},
		name: "Swarm",
		rating: 2,
		num: 68,
	},
	sweetveil: {
		onAllySetStatus(status, target, source, effect) {
			if (status.id === 'slp') {
				this.debug('Sweet Veil interrupts sleep');
				const effectHolder = this.effectState.target;
				this.add('-block', target, 'ability: Sweet Veil', `[of] ${effectHolder}`);
				return null;
			}
		},
		onAllyTryAddVolatile(status, target) {
			if (status.id === 'yawn') {
				this.debug('Sweet Veil blocking yawn');
				const effectHolder = this.effectState.target;
				this.add('-block', target, 'ability: Sweet Veil', `[of] ${effectHolder}`);
				return null;
			}
		},
		flags: { breakable: 1 },
		name: "Sweet Veil",
		rating: 2,
		num: 175,
	},
	swiftswim: {
		onModifySpe(spe, pokemon) {
			if (['raindance', 'primordialsea'].includes(pokemon.effectiveWeather()) || this.field.isTerrain('watersurfaceterrain') || this.field.terrain === 'underwaterterrain' || this.field.terrain === 'murkwatersurfaceterrain') {
				return this.chainModify(2);
			}
		},
		flags: {},
		name: "Swift Swim",
		rating: 3,
		num: 33,
	},
	swordofruin: {
		onStart(pokemon) {
			if (this.suppressingAbility(pokemon)) return;
			this.add('-ability', pokemon, 'Sword of Ruin');
		},
		onAnyModifyDef(def, target, source, move) {
			const abilityHolder = this.effectState.target;
			if (target.hasAbility('Sword of Ruin')) return;
			if (!move.ruinedDef?.hasAbility('Sword of Ruin')) move.ruinedDef = abilityHolder;
			if (move.ruinedDef !== abilityHolder) return;
			this.debug('Sword of Ruin Def drop');
			return this.chainModify(0.75);
		},
		flags: {},
		name: "Sword of Ruin",
		rating: 4.5,
		num: 285,
	},
	symbiosis: {
		onAllyAfterUseItem(item, pokemon) {
			if (pokemon.switchFlag) return;
			const source = this.effectState.target;
			const myItem = source.takeItem();
			if (!myItem) return;
			if (
				!this.singleEvent('TakeItem', myItem, source.itemState, pokemon, source, this.effect, myItem) ||
				!pokemon.setItem(myItem)
			) {
				source.item = myItem.id;
				return;
			}
			this.add('-activate', source, 'ability: Symbiosis', myItem, `[of] ${pokemon}`);
		},
		flags: {},
		name: "Symbiosis",
		rating: 0,
		num: 180,
	},
	synchronize: {
		onAfterSetStatus(status, target, source, effect) {
			if (!source || source === target) return;
			if (effect && effect.id === 'toxicspikes') return;
			if (status.id === 'slp' || status.id === 'frz') return;
			this.add('-activate', target, 'ability: Synchronize');
			// Hack to make status-prevention abilities think Synchronize is a status move
			// and show messages when activating against it.
			source.trySetStatus(status, target, { status: status.id, id: 'synchronize' } as Effect);
		},
		flags: {},
		name: "Synchronize",
		rating: 2,
		num: 28,
	},
	tabletsofruin: {
		onStart(pokemon) {
			if (this.suppressingAbility(pokemon)) return;
			this.add('-ability', pokemon, 'Tablets of Ruin');
		},
		onAnyModifyAtk(atk, source, target, move) {
			const abilityHolder = this.effectState.target;
			if (source.hasAbility('Tablets of Ruin')) return;
			if (!move.ruinedAtk) move.ruinedAtk = abilityHolder;
			if (move.ruinedAtk !== abilityHolder) return;
			this.debug('Tablets of Ruin Atk drop');
			if (this.field.isTerrain('newworldterrain'))
				return this.chainModify(0.66);
			else
				return this.chainModify(0.75);
		},
		flags: {},
		name: "Tablets of Ruin",
		rating: 4.5,
		num: 284,
	},
	tangledfeet: {
		onStart(pokemon) {
			if (this.field.isTerrain('mirrorarenaterrain') || this.field.isTerrain('bigtopterrain')) {
				this.boost({ evasion: 1 }, pokemon);
			}
		},
		onModifyCritRatio(critRatio, source) {
			if (source.volatiles['confusion']) {
				this.debug('Tangled Feet - decreasing accuracy');
				return critRatio + 1;
			}
		},
		onModifyAccuracyPriority: -1,
		onModifyAccuracy(accuracy, target) {
			if (typeof accuracy !== 'number') return;
			if (target?.volatiles['confusion']) {
				this.debug('Tangled Feet - decreasing accuracy');
				return this.chainModify(0.5);
			}
		},
		flags: { breakable: 1 },
		name: "Tangled Feet",
		rating: 1,
		num: 77,
	},
	tanglinghair: {
		onDamagingHit(damage, target, source, move) {
			if (this.checkMoveMakesContact(move, source, target, true)) {
				this.add('-ability', target, 'Tangling Hair');
				this.boost({ spe: -1 }, source, target, null, true);
			}
		},
		flags: {},
		name: "Tangling Hair",
		rating: 2,
		num: 221,
	},
	technician: {
		onBasePowerPriority: 30,
		onBasePower(basePower, attacker, defender, move) {
			let minimum = 60;
			if (this.field.isTerrain('factoryterrain')) {
				minimum = 80;
			}
			const basePowerAfterMultiplier = this.modify(basePower, this.event.modifier);
			this.debug(`basePower: ${basePowerAfterMultiplier}`);
			if (basePowerAfterMultiplier <= minimum) {
				this.debug('Technician boost');
				return this.chainModify(1.5);
			}
		},
		flags: {},
		name: "Technician",
		rating: 3.5,
		num: 101,
	},
	telepathy: {
		onTryHit(target, source, move) {
			if (target !== source && target.isAlly(source) && move.category !== 'Status') {
				this.add('-activate', target, 'ability: Telepathy');
				return null;
			}
		},
		onModifySpe() {
			if (this.field.isTerrain('psychicterrain'))
				return this.chainModify(2);
		},
		flags: { breakable: 1 },
		name: "Telepathy",
		rating: 0,
		num: 140,
	},
	teraformzero: {
		onAfterTerastallization(pokemon) {
			if (pokemon.baseSpecies.name !== 'Terapagos-Stellar') return;
			if (this.field.weather || this.field.terrain) {
				this.add('-ability', pokemon, 'Teraform Zero');
				this.field.clearWeather();
				this.field.clearTerrain();
			}
		},
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1 },
		name: "Teraform Zero",
		rating: 3,
		num: 309,
	},
	terashell: {
		// effectiveness implemented in sim/pokemon.ts:Pokemon#runEffectiveness
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, breakable: 1 },
		name: "Tera Shell",
		rating: 3.5,
		num: 308,
	},
	terashift: {
		onSwitchInPriority: 2,
		onSwitchIn(pokemon) {
			if (pokemon.baseSpecies.baseSpecies !== 'Terapagos') return;
			if (pokemon.species.forme !== 'Terastal') {
				this.add('-activate', pokemon, 'ability: Tera Shift');
				pokemon.formeChange('Terapagos-Terastal', this.effect, true);
			}
		},
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, cantsuppress: 1, notransform: 1 },
		name: "Tera Shift",
		rating: 3,
		num: 307,
	},
	teravolt: {
		onStart(pokemon) {
			this.add('-ability', pokemon, 'Teravolt');
		},
		onFoeNegateImmunity(pokemon, type) {
			if (type === 'Electric' && pokemon.hasType('Ground') && this.field.isTerrain('electricterrain')) return false;
		},
		onModifyMove(move) {
			move.ignoreAbility = true;
			if (this.field.isTerrain('electricterrain') && this.movehasType(move, 'Electric')) {
				move.basePower *= 1.5;
			}
		},
		flags: {},
		name: "Teravolt",
		rating: 3,
		num: 164,
	},
	thermalexchange: {
		onDamagingHit(damage, target, source, move) {
			if (move && this.movehasType(move, 'Fire')) {
				this.boost({ atk: 1 });
			}
		},
		onUpdate(pokemon) {
			if (pokemon.status === 'brn') {
				this.add('-activate', pokemon, 'ability: Thermal Exchange');
				pokemon.cureStatus();
			}
		},
		onSetStatus(status, target, source, effect) {
			if (status.id !== 'brn') return;
			if ((effect as Move)?.status) {
				this.add('-immune', target, '[from] ability: Thermal Exchange');
			}
			return false;
		},
		onResidual(pokemon) {
			if (this.field.isTerrain(['superheatedterrain', 'dragonsdenterrain', 'burningterrain', 'volcanicterrain'])) {
				this.add('-activate', pokemon, 'ability: Thermal Exchange');
				this.boost({ atk: 1 });
			}
		},
		flags: { breakable: 1 },
		name: "Thermal Exchange",
		rating: 2.5,
		num: 270,
	},
	thickfat: {
		onImmunity(type, pokemon) {
			if (type === 'hail') return false;
		},
		onSourceModifyAtkPriority: 6,
		onSourceModifyAtk(atk, attacker, defender, move) {
			if (move && this.movehasType(move, 'Ice') || this.movehasType(move, 'Fire')) {
				this.debug('Thick Fat weaken');
				return this.chainModify(0.5);
			}
		},
		onSourceModifySpAPriority: 5,
		onSourceModifySpA(atk, attacker, defender, move) {
			if (move && this.movehasType(move, 'Ice') || this.movehasType(move, 'Fire')) {
				this.debug('Thick Fat weaken');
				return this.chainModify(0.5);
			}
		},
		flags: { breakable: 1 },
		name: "Thick Fat",
		rating: 3.5,
		num: 47,
	},
	tintedlens: {
		onModifyDamage(damage, source, target, move) {
			if (target.getMoveHitData(move).typeMod < 0) {
				this.debug('Tinted Lens boost');
				return this.chainModify(2);
			}
		},
		flags: {},
		name: "Tinted Lens",
		rating: 4,
		num: 110,
	},
	torrent: {
		onModifyAtkPriority: 5,
		onModifyAtk(atk, attacker, defender, move) {
			if (move && this.movehasType(move, 'Water') && attacker.hp <= attacker.maxhp / 3 || this.field.terrain === 'watersurfaceterrain' || this.field.terrain === 'underwaterterrain') {
				this.debug('Torrent boost');
				return this.chainModify(1.5);
			}
		},
		onModifySpAPriority: 5,
		onModifySpA(atk, attacker, defender, move) {
			if (move && this.movehasType(move, 'Water') && attacker.hp <= attacker.maxhp / 3 || this.field.terrain === 'watersurfaceterrain' || this.field.terrain === 'underwaterterrain') {
				this.debug('Torrent boost');
				return this.chainModify(1.5);
			}
		},
		flags: {},
		name: "Torrent",
		rating: 2,
		num: 67,
	},
	toughclaws: {
		onBasePowerPriority: 21,
		onBasePower(basePower, attacker, defender, move) {
			if (move.flags['contact']) {
				return this.chainModify([5325, 4096]);
			}
		},
		flags: {},
		name: "Tough Claws",
		rating: 3.5,
		num: 181,
	},
	toxicboost: {
		onBasePowerPriority: 19,
		onBasePower(basePower, attacker, defender, move) {
			if ((attacker.status === 'psn' || attacker.status === 'tox' || this.field.isTerrain('corrosiveterrain') || this.field.isTerrain('murkwatersurfaceterrain') || this.field.isTerrain('wastelandterrain')) && move.category === 'Physical') {
				return this.chainModify(1.5);
			}
		},
		flags: {},
		name: "Toxic Boost",
		rating: 3,
		num: 137,
	},
	toxicchain: {
		onBasePower(basePower, source, target, move) {
			if (this.field.isTerrain('wastelandterrain') && this.movehasType(move, 'Poison')) {
				return this.chainModify(1.3);
			}
		},
		onSourceDamagingHit(damage, target, source, move) {
			let chance = 3;
			// Despite not being a secondary, Shield Dust / Covert Cloak block Toxic Chain's effect
			if (target.hasAbility('shielddust') || target.hasItem('covertcloak')) return;
			if (this.field.isTerrain(['corrosivemistterrain', 'wastelandterrain'])) chance = 6;
			if (this.randomChance(chance, 10)) {
				target.trySetStatus('tox', source);
			}
		},
		flags: {},
		name: "Toxic Chain",
		rating: 4.5,
		num: 305,
	},
	toxicdebris: {
		onDamagingHit(damage, target, source, move) {
			const side = source.isAlly(target) ? source.side.foe : source.side;
			const toxicSpikes = side.sideConditions['toxicspikes'];
			if (move.category === 'Physical' && (!toxicSpikes || toxicSpikes.layers < 2)) {
				this.add('-activate', target, 'ability: Toxic Debris');
				side.addSideCondition('toxicspikes', target);
			}
			if (this.checkMoveMakesContact(move, source, target)) {
				this.damage(source.baseMaxhp / 6, source, target);
			}
		},
		flags: {},
		name: "Toxic Debris",
		rating: 3.5,
		num: 295,
	},
	trace: {
		onStart(pokemon) {
			this.effectState.seek = true;
			// n.b. only affects Hackmons
			// interaction with No Ability is complicated: https://www.smogon.com/forums/threads/pokemon-sun-moon-battle-mechanics-research.3586701/page-76#post-7790209
			if (pokemon.adjacentFoes().some(foeActive => foeActive.ability === 'noability')) {
				this.effectState.seek = false;
			}
			// interaction with Ability Shield is similar to No Ability
			if (pokemon.hasItem('Ability Shield')) {
				this.add('-block', pokemon, 'item: Ability Shield');
				this.effectState.seek = false;
			}
			if (this.effectState.seek) {
				this.singleEvent('Update', this.effect, this.effectState, pokemon);
			}
		},
		onUpdate(pokemon) {
			if (!this.effectState.seek) return;

			const possibleTargets = pokemon.adjacentFoes().filter(
				target => !target.getAbility().flags['notrace'] && target.ability !== 'noability'
			);
			if (!possibleTargets.length) return;

			const target = this.sample(possibleTargets);
			const ability = target.getAbility();
			pokemon.setAbility(ability, target);
		},
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1 },
		name: "Trace",
		rating: 2.5,
		num: 36,
	},
	transistor: {
		onSourceModifyAtkPriority: 5,
		onSourceModifyAtk(atk, attacker, defender, move) {
			if (move && this.movehasType(move, 'Ground') && this.field.isTerrain('electricterrain')) {
				this.debug('Transistor weaken');
				return this.chainModify(0.5);
			}
		},
		onSourceModifySpAPriority: 5,
		onSourceModifySpA(atk, attacker, defender, move) {
			if (move && this.movehasType(move, 'Ground') && this.field.isTerrain('electricterrain')) {
				this.debug('Transistor weaken');
				return this.chainModify(0.5);
			}
		},
		onModifyAtkPriority: 5,
		onModifyAtk(atk, attacker, defender, move) {
			let boost = 1.3;
			if (this.field.isTerrain('electricterrain') || this.field.isTerrain('factoryterrain')) {
				boost = 2;
			}
			if (move && this.movehasType(move, 'Electric')) {
				this.debug('Transistor boost');
				return this.chainModify(boost);
			}
		},
		onModifySpAPriority: 5,
		onModifySpA(atk, attacker, defender, move) {
			let boost = 1.3;
			if (this.field.isTerrain('electricterrain') || this.field.isTerrain('factoryterrain')) {
				boost = 2;
			}
			if (move && this.movehasType(move, 'Electric')) {
				this.debug('Transistor boost');
				return this.chainModify(boost);
			}
		},
		flags: {},
		name: "Transistor",
		rating: 3.5,
		num: 262,
	},
	railguncircuit: {
		onTryHit(target, source, move) { return this.dex.abilities.get('lightningrod').onTryHit?.call(this, target, source, move); },
		onAnyInvulnerabilityPriority: 1,
		onAnyInvulnerability(target, source, move) {
			if (move && source === this.effectState.target) return 0;
		},
		onAnyAccuracy(accuracy, target, source, move) {
			if (move && source === this.effectState.target) return true;
			return accuracy;
		},
		onSourceModifyAtkPriority: 5,
		onSourceModifyAtk(atk, attacker, defender, move) {
			if (move && this.movehasType(move, 'Ground') && this.field.isTerrain('electricterrain')) {
				this.debug('Railgun Circuit weaken');
				return this.chainModify(0.5);
			}
		},
		onSourceModifySpAPriority: 5,
		onSourceModifySpA(atk, attacker, defender, move) {
			if (move && this.movehasType(move, 'Ground') && this.field.isTerrain('electricterrain')) {
				this.debug('Railgun Circuit weaken');
				return this.chainModify(0.5);
			}
		},
		onModifyAtkPriority: 5,
		onModifyAtk(atk, attacker, defender, move) {
			let boost = 1.3;
			if (this.field.isTerrain('electricterrain') || this.field.isTerrain('factoryterrain')) {
				boost = 2;
			}
			if (move && this.movehasType(move, 'Electric')) {
				this.debug('Railgun Circuit boost');
				return this.chainModify(boost);
			}
		},
		onModifySpAPriority: 5,
		onModifySpA(atk, attacker, defender, move) {
			let boost = 1.3;
			if (this.field.isTerrain('electricterrain') || this.field.isTerrain('factoryterrain')) {
				boost = 2;
			}
			if (move && this.movehasType(move, 'Electric')) {
				this.debug('Railgun Circuit boost');
				return this.chainModify(boost);
			}
		},
		onModifyMove(move) {
			if (move.category !== 'Status') move.accuracy = true;
		},
		flags: {},
		name: "Railgun Circuit",
		rating: 4,
		num: 10141,
	},
	razorcurrent: {
		onStart(pokemon) {
			this.dex.abilities.get('drizzle').onStart?.call(this, pokemon);
		},
		onBasePower(basePower, source, target, move) {
			const steel = this.dex.abilities.get('steelworker').onBasePower?.call(this, basePower, source, target, move);
			return this.dex.abilities.get('strongjaw').onBasePower?.call(this, steel ?? basePower, source, target, move);
		},
		onResidual(pokemon) { return this.dex.abilities.get('speedboost').onResidual?.call(this, pokemon); },
		flags: {},
		name: "Razor Current",
		rating: 4,
		num: 10153,
	},
	rainsovereign: {
		onStart(pokemon) {
			this.field.setWeather('raindance', pokemon, this.dex.abilities.get('rainsovereign'));
			if (this.field.isWeather('raindance')) this.field.weatherState.duration = 8;
		},
		onModifyMove(move) {
			if (['Electric', 'Water', 'Flying'].includes(move.type)) move.forceSTAB = true;
		},
		onResidual(pokemon) {
			for (const target of pokemon.foes()) {
				if (!target || target.fainted || isImmuneToScalingChip(target, 'Water')) continue;
				const typeMod = this.clampIntRange(this.dex.getEffectiveness('Water', target.getTypes()), -6, 6);
				this.damage(target.baseMaxhp / 16 * Math.max(0.25, 2 ** typeMod), target, pokemon);
			}
		},
		flags: {},
		name: "Rain Sovereign",
		rating: 4.5,
		num: 10154,
	},
	toxicrenewal: {
		onModifySTAB(stab, source, target, move) {
			if (move.forceSTAB || source.hasType(move.type)) return 2;
		},
		onSwitchOut(pokemon) {
			pokemon.heal(pokemon.baseMaxhp / 3);
		},
		flags: {},
		name: "Toxic Renewal",
		rating: 4.5,
		num: 10155,
	},
	stormcircuit: {
		onStart(pokemon) {
			this.dex.abilities.get('electricsurge').onStart?.call(this, pokemon);
		},
		onModifySpe(spe, pokemon) { return this.dex.abilities.get('swiftswim').onModifySpe?.call(this, spe, pokemon); },
		onSourceAfterFaint(length, target, source, effect) { return this.dex.abilities.get('elevate').onSourceAfterFaint?.call(this, length, target, source, effect); },
		flags: {},
		name: "Storm Circuit",
		rating: 4,
		num: 10156,
	},
	ironmountain: {
		onSourceModifyDamage(damage, source, target, move) {
			if (target.getMoveHitData(move).typeMod > 0) return this.chainModify(0.75);
		},
		onDamagingHit(damage, target, source, effect) {
			if (!source || target.isAlly(source)) return;
			if (target.abilityState.ironMountainHitTurn === this.turn) return;
			target.abilityState.ironMountainHitTurn = this.turn;
			this.boost({ def: 1 }, target, target);
			this.heal(target.baseMaxhp / 16, target, target);
		},
		onModifyWeight(weighthg) {
			return weighthg * 2;
		},
		flags: { breakable: 1 },
		name: "Iron Mountain",
		rating: 4.5,
		num: 10191,
	},
	woolyconductor: {
		onModifyDefPriority: 6,
		onModifyDef(def) {
			return this.chainModify(2);
		},
		onModifyMove(move) {
			move.ignoreAbility = true;
		},
		onDamagingHit(damage, target, source, move) {
			if (this.checkMoveMakesContact(move, source, target)) {
				let chance = 3;
				if (this.field.isTerrain('shortcircuitterrain') || this.field.isTerrain('electricterrain')) chance = 6;
				if (this.randomChance(chance, 10)) source.trySetStatus('par', target);
			}
		},
		flags: { breakable: 1 },
		name: "Wooly Conductor",
		rating: 4.5,
		num: 10192,
	},
	surgeconduit: {
		onStart(pokemon) {
			this.field.setTerrain('electricterrain', pokemon);
		},
		onTryHit(target, source, move) {
			if (target !== source && move.type === 'Electric') {
				if (!this.boost({ spa: 1 }, target, target, null, false, true)) {
					this.add('-immune', target, '[from] ability: Surge Conduit');
				}
				return null;
			}
		},
		onAnyRedirectTarget(target, source, source2, move) {
			const pokemon = this.effectState.target;
			if (move.type !== 'Electric' || pokemon.isAlly(source)) return;
			if (this.validTarget(pokemon, source, move.target)) return pokemon;
		},
		onDamage(damage, target, source, effect) { return this.dex.abilities.get('bruteforce').onDamage?.call(this, damage, target, source, effect); },
		onSourceModifyDamage(damage, source, target, move) { return this.dex.abilities.get('shadowshield').onSourceModifyDamage?.call(this, damage, source, target, move); },
		flags: {},
		name: "Surge Conduit",
		rating: 4.5,
		num: 10157,
	},
	solartrap: {
		onImmunity(type, pokemon) {
			return this.dex.abilities.get('accumulation').onImmunity?.call(this, type, pokemon);
		},
		onSourceModifyAtkPriority: 6,
		onSourceModifyAtk(atk, attacker, defender, move) {
			return this.dex.abilities.get('accumulation').onSourceModifyAtk?.call(this, atk, attacker, defender, move);
		},
		onSourceModifySpAPriority: 5,
		onSourceModifySpA(spa, attacker, defender, move) {
			return this.dex.abilities.get('accumulation').onSourceModifySpA?.call(this, spa, attacker, defender, move);
		},
		onModifySpAPriority: 5,
		onModifySpA(spa, pokemon) {
			return this.dex.abilities.get('solarpower').onModifySpA?.call(this, spa, pokemon);
		},
		onResidual(pokemon) {
			this.dex.abilities.get('accumulation').onResidual?.call(this, pokemon);
			return this.dex.abilities.get('solarpower').onResidual?.call(this, pokemon);
		},
		onDamage(damage, target, source, effect) {
			if (!target.hp || effect?.effectType !== 'Move' || !source || source === target) return;
			if (damage >= target.hp) this.damage(target.hp, source, target, this.dex.abilities.get('solartrap'));
		},
		flags: {},
		name: "Solar Trap",
		rating: 4.5,
		num: 10158,
	},
	soaringspirit: {
		onStart(pokemon) { return this.dex.abilities.get('windpower').onStart?.call(this, pokemon); },
		onTryHit(target, source, move) { return this.dex.abilities.get('windpower').onTryHit?.call(this, target, source, move); },
		onSideConditionStart(side, source, sideCondition) {
			return this.dex.abilities.get('windpower').onSideConditionStart?.call(this, side, source, sideCondition);
		},
		onImmunity(type, pokemon) { return this.dex.abilities.get('selfsufficient').onImmunity?.call(this, type, pokemon); },
		onResidual(pokemon) {
			this.dex.abilities.get('windpower').onResidual?.call(this, pokemon);
			this.dex.abilities.get('selfsufficient').onResidual?.call(this, pokemon);
		},
		flags: {},
		name: "Soaring Spirit",
		rating: 4,
		num: 10159,
	},
	vendetta: {
		onStart(pokemon) { return this.dex.abilities.get('angerpoint').onStart?.call(this, pokemon); },
		onHit(target, source, move) { return this.dex.abilities.get('angerpoint').onHit?.call(this, target, source, move); },
		onDamage(damage, target, source, effect) {
			return this.dex.abilities.get('secondwind').onDamage?.call(this, damage, target, source, effect);
		},
		onImmunity(type, pokemon) { return this.dex.abilities.get('selfsufficient').onImmunity?.call(this, type, pokemon); },
		onResidual(pokemon) { return this.dex.abilities.get('selfsufficient').onResidual?.call(this, pokemon); },
		flags: {},
		name: "Vendetta",
		rating: 4,
		num: 10160,
	},
	triage: {
		onModifyPriority(priority, pokemon, target, move) {
			if (move?.flags['heal']) return priority + 3;
		},
		flags: {},
		name: "Triage",
		rating: 3.5,
		num: 205,
	},
	truant: {
		onStart(pokemon) {
			pokemon.removeVolatile('truant');
			if (pokemon.activeTurns && (pokemon.moveThisTurnResult !== undefined || !this.queue.willMove(pokemon))) {
				pokemon.addVolatile('truant');
			}
		},
		onBeforeMovePriority: 9,
		onBeforeMove(pokemon) {
			if (pokemon.removeVolatile('truant')) {
				this.add('cant', pokemon, 'ability: Truant');
				return false;
			}
			pokemon.addVolatile('truant');
		},
		condition: {},
		flags: {},
		name: "Truant",
		rating: -1,
		num: 54,
	},
	turboblaze: {
		onStart(pokemon) {
			this.add('-ability', pokemon, 'Turboblaze');
		},
		onModifyDef(def, pokemon) {
			if (this.field.isTerrain('coldeclipseterrain')) {
				return this.chainModify(1.5);
			}
		},
		onModifySpD(spd, pokemon) {
			if (this.field.isTerrain('coldeclipseterrain')) {
				return this.chainModify(1.5);
			}
		},
		onSourceModifyAtkPriority: 6,
		onSourceModifyAtk(atk, attacker, defender, move) {
			if (move && this.movehasType(move, 'Ice') && this.field.isTerrain('coldeclipseterrain')) {
				this.debug('Turbloblaze weaken');
				return this.chainModify(0.5);
			}
		},
		onSourceModifySpAPriority: 5,
		onSourceModifySpA(atk, attacker, defender, move) {
			if (move && this.movehasType(move, 'Ice') && this.field.isTerrain('coldeclipseterrain')) {
				this.debug('Turboblaze weaken');
				return this.chainModify(0.5);
			}
		},
		onModifyMove(move) {
			move.ignoreAbility = true;
		},
		flags: {},
		name: "Turboblaze",
		rating: 3,
		num: 163,
	},
	unaware: {
		onAnyModifyBoost(boosts, pokemon) {
			const unawareUser = this.effectState.target;
			if (unawareUser === pokemon) return;
			if (unawareUser === this.activePokemon && pokemon === this.activeTarget) {
				boosts['def'] = 0;
				boosts['spd'] = 0;
				boosts['evasion'] = 0;
			}
			if (pokemon === this.activePokemon && unawareUser === this.activeTarget) {
				boosts['atk'] = 0;
				boosts['def'] = 0;
				boosts['spa'] = 0;
				boosts['accuracy'] = 0;
			}
		},
		flags: { breakable: 1 },
		name: "Unaware",
		rating: 4,
		num: 109,
	},
	unburden: {
		onAfterUseItem(item, pokemon) {
			if (pokemon !== this.effectState.target) return;
			pokemon.addVolatile('unburden');
		},
		onTakeItem(item, pokemon) {
			pokemon.addVolatile('unburden');
		},
		onEnd(pokemon) {
			pokemon.removeVolatile('unburden');
		},
		condition: {
			onModifySpe(spe, pokemon) {
				if (!pokemon.item && !pokemon.ignoringAbility()) {
					return this.chainModify(2);
				}
			},
		},
		flags: {},
		name: "Unburden",
		rating: 3.5,
		num: 84,
	},
	evilsanta: {
		onModifySTAB(stab, source, target, move) {
			if (source.species.id === 'delibird' && move.type === 'Dark') return 1.5;
		},
		flags: {},
		name: "Evil Santa",
		rating: 4,
		num: 10016,
	},
	unnerve: {
		onSwitchInPriority: 1,
		onStart(pokemon) {
			if (this.effectState.unnerved) return;
			this.add('-ability', pokemon, 'Unnerve');
			this.effectState.unnerved = true;
			if (this.field.isTerrain('coldeclipseterrain')) {
				let activated = false;
				for (const target of pokemon.foes()) {
					if (!activated) {
						this.add('-ability', pokemon, 'Unnerve', 'boost');
						activated = true;
					}
					if (target.volatiles['substitute']) {
						this.add('-immune', target);
					} else {
						this.boost({ spe: -1 }, target, pokemon, null, true);
					}
				}
			}
		},
		onEnd() {
			this.effectState.unnerved = false;
		},
		onFoeUseItem(item) {
			if (['elementalseed', 'telluricseed', 'magicalseed', 'syntheticseed'].includes(item.id))
				return !this.effectState.unnerved;
		},
		onFoeTryEatItem() {
			return !this.effectState.unnerved;
		},
		flags: {},
		name: "Unnerve",
		rating: 1,
		num: 127,
	},
	unseenfist: {
		onModifyMove(move) {
			if (move.flags['contact']) delete move.flags['protect'];
		},
		onBasePower(basePower, source, target, move) {
			return this.dex.abilities.get('ironfist').onBasePower?.call(this, basePower, source, target, move);
		},
		flags: {},
		name: "Unseen Fist",
		rating: 2,
		num: 260,
	},
	phantomfist: {
		onCheckShow(pokemon) {
			this.dex.abilities.get('selfrepair').onCheckShow?.call(this, pokemon);
		},
		onSwitchOut(pokemon) {
			this.dex.abilities.get('selfrepair').onSwitchOut?.call(this, pokemon);
		},
		onModifyMove(move) {
			move.accuracy = true;
			this.dex.abilities.get('unseenfist').onModifyMove?.call(this, move);
		},
		onSourceModifyDamage(damage, source, target, move) {
			return this.dex.abilities.get('filter').onSourceModifyDamage?.call(this, damage, source, target, move);
		},
		onResidual(pokemon) {
			this.dex.abilities.get('selfrepair').onResidual?.call(this, pokemon);
		},
		onImmunity(type, pokemon) {
			return this.dex.abilities.get('selfrepair').onImmunity?.call(this, type, pokemon);
		},
		flags: {},
		name: "Phantom Fist",
		rating: 4,
		num: 10193,
	},
	ultraego: {
		onStart(pokemon) {
			if (this.field.isTerrain('bewitchedwoodsterrain')) return;
			this.add('-ability', pokemon, 'Ultra Ego');
			pokemon.abilityState.ultraEgoDefBoosted = false;
			pokemon.abilityState.ultraEgoSpDBoosted = false;
			pokemon.abilityState.ultraEgoPinch = false;
			pokemon.abilityState.ultraEgoHitTriggered = false;
		},
		boostedField() {
			return this.field.isTerrain(['ashenbeachterrain', 'newworldterrain', 'starlightarenaterrain', 'holyterrain', 'coldeclipseterrain', 'fairytaleterrain']);
		},
		healUltraEgo(pokemon, source) {
			if (this.field.isTerrain('bewitchedwoodsterrain')) return;
			if (source === 'hit' && (this.dex.abilities.get('burningego') as any).boostedField.call(this) && !pokemon.abilityState.ultraEgoPinch && pokemon.hp > 0 && pokemon.hp <= pokemon.maxhp / 2) {
				pokemon.abilityState.ultraEgoPinch = true;
				this.heal(pokemon.baseMaxhp / 4, pokemon, pokemon);
				return;
			}
			this.heal(pokemon.baseMaxhp / 16, pokemon, pokemon);
		},
		onModifyMove(move) {
			if (this.field.isTerrain('bewitchedwoodsterrain')) return;
			move.ignoreAbility = true;
		},
		onBasePowerPriority: 21,
		onBasePower(basePower, source, target, move) {
			if (this.field.isTerrain('bewitchedwoodsterrain')) return;
			if (target?.hasAbility('battlebond')) return;
			if (move.category !== 'Status' && !this.getAllActive().some(pokemon => pokemon.hasAbility('neutralization')) && this.getAllActive().some(pokemon => pokemon.hasAbility(['royaldecree', 'royalsun']))) {
				this.debug('Ultra Ego Royal Decree boost');
				return this.chainModify(1.3);
			}
		},
		onSourceModifyDamage(damage, source, target, move) {
			if (this.field.isTerrain('bewitchedwoodsterrain')) return;
			if (move && move.category !== 'Status' && !this.getAllActive().some(pokemon => pokemon.hasAbility('neutralization')) && this.getAllActive().some(pokemon => pokemon.hasAbility(['royaldecree', 'royalsun']))) {
				this.debug('Ultra Ego Royal Decree weaken');
				return this.chainModify(0.7);
			}
		},
		onAfterMove(source, target, move) {
			if (this.field.isTerrain('bewitchedwoodsterrain')) return;
			if (move.category !== 'Status') source.abilityState.ultraEgoHitTriggered = false;
		},
		onSourceDamagingHit(damage, target, source, move) {
			if (this.field.isTerrain('bewitchedwoodsterrain')) return;
			if (!move || move.category === 'Status') return;
			if (source.abilityState.ultraEgoAttackHealTurn === this.turn) return;
			source.abilityState.ultraEgoAttackHealTurn = this.turn;
			(this.dex.abilities.get('burningego') as any).healUltraEgo.call(this, source, 'attack');
		},
		onDamagingHit(damage, target, source, move) {
			if (this.field.isTerrain('bewitchedwoodsterrain')) return;
			if (!source || target.isAlly(source) || !move || move.category === 'Status') return;
			if (target.abilityState.ultraEgoHitTriggered) {
				this.heal(target.baseMaxhp / 20, target, target);
				return;
			}
			target.abilityState.ultraEgoHitTriggered = true;
			this.boost({ atk: 1, spa: 1 }, target, target);
			if ((this.dex.abilities.get('burningego') as any).boostedField.call(this)) {
				if (move.category === 'Physical' && !target.abilityState.ultraEgoDefBoosted) {
					target.abilityState.ultraEgoDefBoosted = true;
					this.boost({ def: 1 }, target, target);
				}
				if (move.category === 'Special' && !target.abilityState.ultraEgoSpDBoosted) {
					target.abilityState.ultraEgoSpDBoosted = true;
					this.boost({ spd: 1 }, target, target);
				}
			}
			(this.dex.abilities.get('burningego') as any).healUltraEgo.call(this, target, 'hit');
		},
		onResidual(pokemon) {
			if (this.field.isTerrain('bewitchedwoodsterrain')) return;
			this.heal(pokemon.baseMaxhp / 16, pokemon, pokemon);
		},
		flags: {},
		name: "Ultra Ego",
		rating: 3,
		num: 10012,
	},
	ultrainstinct: {
		onStart(pokemon) {
			if (this.field.isTerrain('bewitchedwoodsterrain')) return;
			this.add('-ability', pokemon, 'Ultra Instinct');
			if (this.field.isTerrain(['ashenbeachterrain', 'newworldterrain', 'starlightarenaterrain', 'holyterrain', 'coldeclipseterrain'])) this.boost({ accuracy: 1 }, pokemon, pokemon);
		},
		onTryAddVolatile(status, pokemon) {
			if (this.field.isTerrain('bewitchedwoodsterrain')) return;
			return this.dex.abilities.get('innerfocus').onTryAddVolatile?.call(this, status, pokemon);
		},
		onTryBoost(boost, target, source, effect) {
			if (this.field.isTerrain('bewitchedwoodsterrain')) return;
			return this.dex.abilities.get('innerfocus').onTryBoost?.call(this, boost, target, source, effect);
		},
		onBasePowerPriority: 21,
		onBasePower(basePower, source, target) {
			if (this.field.isTerrain('bewitchedwoodsterrain')) return;
			if (target?.hasAbility('battlebond')) return;
			if (target?.side.getSideCondition('reflect') || target?.side.getSideCondition('lightscreen') || target?.side.getSideCondition('auroraveil')) {
				this.debug('Ultra Instinct screen punish');
				return this.chainModify(2);
			}
			if (this.field.isTerrain(['ashenbeachterrain', 'newworldterrain', 'starlightarenaterrain', 'holyterrain', 'coldeclipseterrain']) || this.queue.willMove(target) || target.newlySwitched) {
				this.debug('Ultra Instinct boost');
				return this.chainModify(1.5);
			}
		},
		onSourceModifyDamage(damage, source, target, move) {
			if (this.field.isTerrain('bewitchedwoodsterrain')) return;
			if (this.field.isTerrain(['ashenbeachterrain', 'newworldterrain', 'starlightarenaterrain', 'holyterrain', 'coldeclipseterrain'])) {
				this.debug('Ultra Instinct field weaken');
				return this.chainModify(0.5);
			}
			if (source.moveThisTurnResult === undefined) {
				this.debug('Ultra Instinct weaken');
				return this.chainModify(0.3);
			}
		},
		flags: {},
		name: "Ultra Instinct",
		rating: 3,
		num: 10013,
	},
	duskdrive: {
		onStart(pokemon) { return this.dex.abilities.get('battlefervor').onStart?.call(this, pokemon); },
		onEnd() { return this.dex.abilities.get('battlefervor').onEnd?.call(this); },
		onTryAddVolatile(status, pokemon) { return this.dex.abilities.get('battlefervor').onTryAddVolatile?.call(this, status, pokemon); },
		onTryBoost(boost, target, source, effect) { return this.dex.abilities.get('battlefervor').onTryBoost?.call(this, boost, target, source, effect); },
		onModifyMove(move, source) { this.dex.abilities.get('precision').onModifyMove?.call(this, move, source); },
		onModifyCritRatio(critRatio, source, target, move) {
			return this.dex.abilities.get('precision').onModifyCritRatio?.call(this, critRatio, source, target, move);
		},
		onAfterEachBoost(boost, target, source, effect) { return this.dex.abilities.get('opportunist').onAfterEachBoost?.call(this, boost, target, source, effect); },
		onModifyAtk(atk, pokemon, target, move) { return this.dex.abilities.get('battlefervor').onModifyAtk?.call(this, atk, pokemon, target, move); },
		flags: {},
		name: "Dusk Drive",
		rating: 4,
		num: 10166,
	},
	burningego: {
		onStart(pokemon) {
			if (this.field.isTerrain('bewitchedwoodsterrain')) return;
			this.add('-ability', pokemon, 'Burning Ego');
			pokemon.abilityState.ultraEgoDefBoosted = false;
			pokemon.abilityState.ultraEgoSpDBoosted = false;
			pokemon.abilityState.ultraEgoPinch = false;
			pokemon.abilityState.ultraEgoHitTriggered = false;
		},
		boostedField() {
			return this.field.isTerrain(['ashenbeachterrain', 'newworldterrain', 'starlightarenaterrain', 'holyterrain', 'coldeclipseterrain', 'fairytaleterrain']);
		},
		healUltraEgo(pokemon, source) {
			if (this.field.isTerrain('bewitchedwoodsterrain')) return;
			if (source === 'hit' && (this.dex.abilities.get('perfectego') as any).boostedField.call(this) && !pokemon.abilityState.ultraEgoPinch && pokemon.hp > 0 && pokemon.hp <= pokemon.maxhp / 2) {
				pokemon.abilityState.ultraEgoPinch = true;
				this.heal(pokemon.baseMaxhp / 4, pokemon, pokemon);
				return;
			}
			this.heal(pokemon.baseMaxhp / 16, pokemon, pokemon);
		},
		onModifyMove(move) {
			if (this.field.isTerrain('bewitchedwoodsterrain')) return;
		},
		onAfterMove(source, target, move) {
			if (this.field.isTerrain('bewitchedwoodsterrain')) return;
			if (move.category !== 'Status') source.abilityState.ultraEgoHitTriggered = false;
		},
		onSourceDamagingHit(damage, target, source, move) {
			if (this.field.isTerrain('bewitchedwoodsterrain')) return;
			if (!move || move.category === 'Status') return;
			if (source.abilityState.ultraEgoAttackHealTurn === this.turn) return;
			source.abilityState.ultraEgoAttackHealTurn = this.turn;
			(this.dex.abilities.get('perfectego') as any).healUltraEgo.call(this, source, 'attack');
		},
		onDamagingHit(damage, target, source, move) {
			if (this.field.isTerrain('bewitchedwoodsterrain')) return;
			if (!source || target.isAlly(source) || !move || move.category === 'Status') return;
			if (target.abilityState.ultraEgoHitTriggered) {
				this.heal(target.baseMaxhp / 20, target, target);
				return;
			}
			target.abilityState.ultraEgoHitTriggered = true;
			this.boost({ atk: 1, spa: 1 }, target, target);
			if ((this.dex.abilities.get('perfectego') as any).boostedField.call(this)) {
				if (move.category === 'Physical' && !target.abilityState.ultraEgoDefBoosted) {
					target.abilityState.ultraEgoDefBoosted = true;
					this.boost({ def: 1 }, target, target);
				}
				if (move.category === 'Special' && !target.abilityState.ultraEgoSpDBoosted) {
					target.abilityState.ultraEgoSpDBoosted = true;
					this.boost({ spd: 1 }, target, target);
				}
			}
			(this.dex.abilities.get('perfectego') as any).healUltraEgo.call(this, target, 'hit');
		},
		onUpdate(pokemon) { return this.dex.abilities.get('magmaarmor').onUpdate?.call(this, pokemon); },
		onSourceModifyAtk(atk, attacker, defender, move) { return this.dex.abilities.get('magmaarmor').onSourceModifyAtk?.call(this, atk, attacker, defender, move); },
		onSourceModifySpA(spa, attacker, defender, move) { return this.dex.abilities.get('magmaarmor').onSourceModifySpA?.call(this, spa, attacker, defender, move); },
		flags: {},
		name: "Burning Ego",
		rating: 4,
		num: 10256,
	},
	vesselofruin: {
		onStart(pokemon) {
			if (this.suppressingAbility(pokemon)) return;
			this.add('-ability', pokemon, 'Vessel of Ruin');
		},
		onAnyModifySpA(spa, source, target, move) {
			const abilityHolder = this.effectState.target;
			if (source.hasAbility('Vessel of Ruin')) return;
			if (!move.ruinedSpA) move.ruinedSpA = abilityHolder;
			if (move.ruinedSpA !== abilityHolder) return;
			this.debug('Vessel of Ruin SpA drop');
			if (this.field.isTerrain('newworldterrain'))
				return this.chainModify(0.66);
			else
				return this.chainModify(0.75);
		},
		flags: {},
		name: "Vessel of Ruin",
		rating: 4.5,
		num: 284,
	},
	victorystar: {
		onAnyModifyAccuracyPriority: -1,
		onAnyModifyAccuracy(accuracy, target, source) {
			if (source.isAlly(this.effectState.target) && typeof accuracy === 'number') {
				return this.chainModify([4506, 4096]);
			}
		},
		onFoeDamage(damage) {
			this.add('-message', 'Happened');
			if (this.field.isTerrain('newworldterrain') || this.field.isTerrain('starlightarenaterrain')) {
				return this.chainModify(1.5);
			}
		},
		flags: {},
		name: "Victory Star",
		rating: 2,
		num: 162,
	},
	vitalspirit: {
		onUpdate(pokemon) {
			if (pokemon.status === 'slp') {
				this.add('-activate', pokemon, 'ability: Vital Spirit');
				pokemon.cureStatus();
			}
		},
		onSetStatus(status, target, source, effect) {
			if (status.id !== 'slp') return;
			if ((effect as Move)?.status) {
				this.add('-immune', target, '[from] ability: Vital Spirit');
			}
			return false;
		},
		onTryAddVolatile(status, target) {
			if (status.id === 'yawn') {
				this.add('-immune', target, '[from] ability: Vital Spirit');
				return null;
			}
		},
		onModifyAtkPriority: 5,
		onModifyAtk(atk, attacker, defender, move) {
			if ((move && this.movehasType(move, 'Fighting'))) {
				this.debug('Vital Spirit boost');
				return this.chainModify(1.3);
			}
		},
		onModifySpAPriority: 5,
		onModifySpA(atk, attacker, defender, move) {
			if ((move && this.movehasType(move, 'Fighting'))) {
				this.debug('Vital Spirit boost');
				return this.chainModify(1.3);
			}
		},
		flags: { breakable: 1 },
		name: "Vital Spirit",
		rating: 1.5,
		num: 72,
	},
	voltabsorb: {
		onTryHit(target, source, move) {
			if (target !== source && this.movehasType(move, 'Electric')) {
				if (!this.heal(target.baseMaxhp / 4)) {
					this.add('-immune', target, '[from] ability: Volt Absorb');
				}
				return null;
			}
		},
		onResidual(pokemon) {
			if (this.field.isTerrain('shortcircuitterrain') || this.field.isTerrain('electricterrain')) {
				this.heal(pokemon.baseMaxhp / 16);
			}
		},
		flags: { breakable: 1 },
		name: "Volt Absorb",
		rating: 3.5,
		num: 10,
	},
	wanderingspirit: {
		onDamagingHit(damage, target, source, move) {
			if (source.getAbility().flags['failskillswap'] || target.volatiles['dynamax']) return;

			if (this.checkMoveMakesContact(move, source, target)) {
				const targetCanBeSet = this.runEvent('SetAbility', target, source, this.effect, source.ability);
				if (!targetCanBeSet) return targetCanBeSet;
				const sourceAbility = source.setAbility('wanderingspirit', target);
				if (!sourceAbility) return;
				if (target.isAlly(source)) {
					this.add('-activate', target, 'Skill Swap', '', '', `[of] ${source}`);
				} else {
					this.add('-activate', target, 'ability: Wandering Spirit', this.dex.abilities.get(sourceAbility).name, 'Wandering Spirit', `[of] ${source}`);
				}
				target.setAbility(sourceAbility);
			}
		},
		onResidual(pokemon) {
			if (this.field.isTerrain('desertterrain') || this.field.isTerrain('hauntedterrain')) {
				this.boost({ spe: -1 }, pokemon);
			}
		},
		flags: {},
		name: "Wandering Spirit",
		rating: 2.5,
		num: 254,
	},
	wastingsurge: {
		onStart(source) {
			const neutralizationActive = this.getAllActive().some(pokemon => pokemon?.hasAbility('neutralization'));
			if (neutralizationActive && ['watersurfaceterrain', 'underwaterterrain'].includes(this.field.terrain)) return;
			if (this.field.terrain === 'underwaterterrain') {
				for (const pokemon of this.getAllActive()) {
					if (!(pokemon.types.includes('Steel') || pokemon.types.includes('Poison')) && !pokemon.isSemiInvulnerable()) {
						pokemon.faint();
					}
				}
				this.field.changeTerrain('murkwatersurfaceterrain', source, this.dex.abilities.get('wastingsurge'));
				return;
			}
			if (this.field.terrain === 'watersurfaceterrain') {
				this.field.changeTerrain('murkwatersurfaceterrain', source, this.dex.abilities.get('wastingsurge'));
				return;
			}
			this.field.setTerrain('wastelandterrain');
		},
		onModifyMove(move, pokemon) {
			this.dex.abilities.get('byxbysiontouch').onModifyMove?.call(this, move, pokemon);
		},
		onSourceModifyDamage(damage, source, target, move) {
			return this.dex.abilities.get('byxbysiontouch').onSourceModifyDamage?.call(this, damage, source, target, move);
		},
		onAnyDamage(damage, target, source, effect) {
			return this.dex.abilities.get('byxbysiontouch').onAnyDamage?.call(this, damage, target, source, effect);
		},
		flags: {},
		name: "Wasting Surge",
		rating: 4,
		num: 10010,
	},
	waterabsorb: {
		onTryHit(target, source, move) {
			if (target !== source && this.movehasType(move, 'Water')) {
				if (!this.heal(target.baseMaxhp / 4)) {
					this.add('-immune', target, '[from] ability: Water Absorb');
				}
				return null;
			}
		},
		onResidual(pokemon) {
			if ((this.field.isTerrain('watersurfaceterrain') && pokemon.isGrounded()) || (this.field.isTerrain('murkwatersurfaceterrain') && pokemon.isGrounded() && pokemon.types.includes('Poison')) || this.field.isTerrain('underwaterterrain')) {
				this.heal(pokemon.baseMaxhp / 16);
			}
		},
		flags: { breakable: 1 },
		name: "Water Absorb",
		rating: 3.5,
		num: 11,
	},
	waterbubble: {
		onStart(pokemon) {
			pokemon.addVolatile('aquaring');
		},
		onModifyMove(move) {
			if (move && this.movehasType(move, 'Water')) move.forceSTAB = true;
		},
		onSourceModifyAtkPriority: 5,
		onSourceModifyAtk(atk, attacker, defender, move) {
			if (move && this.movehasType(move, 'Fire')) {
				return this.chainModify(0.5);
			}
		},
		onSourceModifySpAPriority: 5,
		onSourceModifySpA(atk, attacker, defender, move) {
			if (move && this.movehasType(move, 'Fire')) {
				return this.chainModify(0.5);
			}
		},
		onModifyAtk(atk, attacker, defender, move) {
			if (move && this.movehasType(move, 'Water')) {
				return this.chainModify(2);
			}
		},
		onModifySpA(atk, defender, attacker, move) {
			if (move && this.movehasType(move, 'Water')) {
				return this.chainModify(2);
			}
		},
		onUpdate(pokemon) {
			if (pokemon.status === 'brn') {
				this.add('-activate', pokemon, 'ability: Water Bubble');
				pokemon.cureStatus();
			}
		},
		onSetStatus(status, target, source, effect) {
			if (status.id !== 'brn') return;
			if ((effect as Move)?.status) {
				this.add('-immune', target, '[from] ability: Water Bubble');
			}
			return false;
		},
		onImmunity(type, pokemon) {
			if (type === 'sandstorm' || type === 'hail') return false;
		},
		flags: { breakable: 1 },
		name: "Water Bubble",
		rating: 4.5,
		num: 199,
	},
	watercompaction: {
		onStart() {
			if (this.field.isTerrain('mistyterrain') || this.field.isTerrain('corrosivemistterrain') || this.field.isTerrain('murkwatersurfaceterrain')) {
				this.boost({ def: 2 });
			}
		},
		onDamagingHit(damage, target, source, move) {
			if (move && this.movehasType(move, 'Water')) {
				if (this.field.isTerrain('ashenbeachterrain')) {
					this.boost({ spd: 2 });
				}
				this.boost({ def: 2 });
			}
		},
		onResidual() {
			if (this.field.isTerrain('underwaterterrain') || this.field.isTerrain('watersurfaceterrain') || this.field.isTerrain('swampterrain')) {
				this.boost({ def: 2 });
			}
		},
		flags: {},
		name: "Water Compaction",
		rating: 1.5,
		num: 195,
	},
	waterveil: {
		onUpdate(pokemon) {
			if (pokemon.status === 'brn') {
				this.add('-activate', pokemon, 'ability: Water Veil');
				pokemon.cureStatus();
			}
		},
		onSwitchIn(pokemon) {
			pokemon.addVolatile('aquaring');
		},
		onSetStatus(status, target, source, effect) {
			if (status.id !== 'brn') return;
			if ((effect as Move)?.status) {
				this.add('-immune', target, '[from] ability: Water Veil');
			}
			return false;
		},
		onImmunity(type, pokemon) {
			if (type === 'sandstorm' || type === 'hail') return false;
		},
		onResidual(pokemon) {
			if (this.field.terrain === 'watersurfaceterrain' || this.field.terrain === 'underwaterterrain')
				pokemon.cureStatus();
		},
		flags: { breakable: 1 },
		name: "Water Veil",
		rating: 2,
		num: 41,
	},
	weakarmor: {
		onDamagingHit(damage, target, source, move) {
			if (move.category === 'Physical') {
				this.boost({ def: -1, spe: 2 }, target, target);
			}
		},
		flags: {},
		name: "Weak Armor",
		rating: 1,
		num: 133,
	},
	wellbakedbody: {
		onTryHit(target, source, move) {
			if (target !== source && this.movehasType(move, 'Fire')) {
				if (!this.boost({ def: 2 })) {
					this.add('-immune', target, '[from] ability: Well-Baked Body');
				}
				return null;
			}
		},
		onResidual(pokemon) {
			if (this.field.isTerrain(['burningterrain', 'superheatedterrain', 'dragonsdenterrain', 'volcanicterrain'])) {
				this.boost({ def: 1 }, pokemon);
			}
		},
		flags: { breakable: 1 },
		name: "Well-Baked Body",
		rating: 3.5,
		num: 273,
	},
	stormsovereign: {
		onModifyMove(move) {
			move.accuracy = true;
		},
		onSourceModifyDamage(damage, source, target, move) {
			if (move && this.movehasType(move, 'Water')) return this.chainModify(0.5);
		},
		onStart(pokemon) {
			this.field.setWeather('deltastream', pokemon, this.dex.abilities.get('stormsovereign'));
			if (this.field.isWeather('deltastream')) this.field.weatherState.duration = 8;
			this.dex.abilities.get('windysurge').onStart?.call(this, pokemon);
		},
		onResidualOrder: 28,
		onResidualSubOrder: 2,
		onResidual(pokemon) {
			this.dex.abilities.get('speedboost').onResidual?.call(this, pokemon);
			for (const target of pokemon.foes()) {
				if (!target || target.fainted || isImmuneToScalingChip(target, 'Flying')) continue;
				const typeMod = this.clampIntRange(this.dex.getEffectiveness('Flying', target.getTypes()), -6, 6);
				this.damage(target.baseMaxhp / 16 * Math.max(0.25, 2 ** typeMod), target, pokemon);
			}
		},
		flags: { breakable: 1 },
		name: "Storm Sovereign",
		rating: 4.5,
		num: 10127,
	},
	ironcognition: {
		onBasePower(basePower, attacker, defender, move) {
			return this.dex.abilities.get('toughclaws').onBasePower?.call(this, basePower, attacker, defender, move);
		},
		onModifyDef(def, pokemon) {
			return this.dex.abilities.get('prismarmor').onModifyDef?.call(this, def, pokemon);
		},
		onModifySpD(spd, pokemon) {
			return this.dex.abilities.get('prismarmor').onModifySpD?.call(this, spd, pokemon);
		},
		onSourceModifyDamage(damage, source, target, move) {
			return this.dex.abilities.get('prismarmor').onSourceModifyDamage?.call(this, damage, source, target, move);
		},
		onImmunity(type, pokemon) {
			return this.dex.abilities.get('prismarmor').onImmunity?.call(this, type, pokemon);
		},
		flags: { breakable: 1 },
		name: "Iron Cognition",
		rating: 4.5,
		num: 10128,
	},
	whitesmoke: {
		onStart() {
			if (this.field.isTerrain('volcanicterrain')) {
				this.boost({ atk: 1, spa: 1 });
			}
		},
		onTryBoost(boost, target, source, effect) {
			if (source && target === source) return;
			let showMsg = false;
			let i: BoostID;
			for (i in boost) {
				if (boost[i]! < 0) {
					delete boost[i];
					showMsg = true;
				}
			}
			if (showMsg && !(effect as ActiveMove).secondaries && effect.id !== 'octolock') {
				this.add("-fail", target, "unboost", "[from] ability: White Smoke", `[of] ${target}`);
			}
		},
		flags: { breakable: 1 },
		name: "White Smoke",
		rating: 2,
		num: 73,
	},
	wimpout: {
		onEmergencyExit(target) {
			if (!this.canSwitch(target.side) || target.forceSwitchFlag || target.switchFlag) return;
			for (const side of this.sides) {
				for (const active of side.active) {
					active.switchFlag = false;
				}
			}
			target.switchFlag = true;
			this.add('-activate', target, 'ability: Wimp Out');
		},
		flags: {},
		name: "Wimp Out",
		rating: 1,
		num: 193,
	},
	windpower: {
		onStart(pokemon) {
			if (pokemon.side.sideConditions['tailwind']) {
				this.boost({ spa: 1 }, pokemon, pokemon);
			}
		},
		onTryHit(target, source, move) {
			if (target !== source && move.flags['wind']) {
				if (!this.boost({ spa: 1 }, target, target)) {
					this.add('-immune', target, '[from] ability: Wind Power');
				}
				return null;
			}
		},
		onSideConditionStart(side, source, sideCondition) {
			const pokemon = this.effectState.target;
			if (sideCondition.id === 'tailwind') {
				this.boost({ spa: 1 }, pokemon, pokemon);
			}
		},
		onResidual(pokemon) {
			if (this.field.isWeather('deltastream')) {
				this.boost({ spa: 1 });
				if (this.field.isTerrain(['mountainterrain', 'snowymountainterrain'])) {
					this.boost({ atk: 1 });
				}
			}
		},
		flags: {},
		name: "Wind Power",
		rating: 1,
		num: 277,
	},
	windrider: {
		onStart(pokemon) {
			if (pokemon.side.sideConditions['tailwind']) {
				this.boost({ atk: 1 }, pokemon, pokemon);
			}
		},
		onTryHit(target, source, move) {
			if (target !== source && move.flags['wind']) {
				if (!this.boost({ atk: 1 }, target, target)) {
					this.add('-immune', target, '[from] ability: Wind Rider');
				}
				return null;
			}
		},
		onSideConditionStart(side, source, sideCondition) {
			const pokemon = this.effectState.target;
			if (sideCondition.id === 'tailwind') {
				this.boost({ atk: 1 }, pokemon, pokemon);
			}
		},
		onResidual(pokemon) {
			if (this.field.isWeather('deltastream')) {
				this.boost({ atk: 1 });
				if (this.field.isTerrain(['mountainterrain', 'snowymountainterrain'])) {
					this.boost({ spa: 1 });
				}
			}
		},
		flags: { breakable: 1 },
		name: "Wind Rider",
		rating: 3.5,
		// We do not want Brambleghast to get Infiltrator in Randbats
		num: 274,
	},
	wonderguard: {
		onTryHit(target, source, move) {
			if (target === source || move.category === 'Status' || move.id === 'struggle' || this.movehasType(move, '???')) return;
			if (move.id === 'skydrop' && !source.volatiles['skydrop']) return;
			this.debug('Wonder Guard immunity: ' + move.id);
			if (target.runEffectiveness(move) <= 0 || !target.runImmunity(move)) {
				if (move.smartTarget) {
					move.smartTarget = false;
				} else {
					this.add('-immune', target, '[from] ability: Wonder Guard');
				}
				return null;
			}
		},
		onModifySpe(spe, pokemon) {
			if (pokemon.species.id === 'shedinja') {
				return this.chainModify(2);
			}
		},
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, failskillswap: 1, breakable: 1 },
		name: "Wonder Guard",
		rating: 5,
		num: 25,
	},
	wonderskin: {
		onModifyAccuracyPriority: 10,
		onModifyAccuracy(accuracy, target, source, move) {
			if (this.field.isTerrain('rainbowterrain') && move.category === 'Status') {
				return 0;
			}
			if (move.category === 'Status' && typeof accuracy === 'number') {
				this.debug('Wonder Skin - setting accuracy to 50');
				return 50;
			}
		},
		flags: { breakable: 1 },
		name: "Wonder Skin",
		rating: 2,
		num: 147,
	},
	zenmode: {
		onResidualOrder: 29,
		onSwitchIn(pokemon) {
			if (pokemon.baseSpecies.baseSpecies !== 'Darmanitan' || pokemon.transformed) {
				return;
			}
			const baseZenMode = (this.field.isTerrain('ashenbeachterrain') || this.field.isTerrain('psychicterrain')) && pokemon.species.id !== 'darmanitanzen' && pokemon.baseSpecies.id === 'darmanitan';
			const galarZenMode = this.field.isTerrain(['icyterrain', 'snowymountainterrain', 'coldeclipseterrain']) && pokemon.species.id !== 'darmanitangalarzen' && pokemon.baseSpecies.id === 'darmanitangalar';
			if (baseZenMode || galarZenMode) {
				pokemon.addVolatile('zenmode');
			}
		},
		onTerrainChange(pokemon) {
			if (pokemon.baseSpecies.baseSpecies !== 'Darmanitan' || pokemon.transformed) {
				return;
			}
			const baseZenMode = this.field.isTerrain(['ashenbeachterrain', 'psychicterrain']) && pokemon.species.id !== 'darmanitanzen' && pokemon.baseSpecies.id === 'darmanitan';
			const galarZenMode = this.field.isTerrain(['icyterrain', 'snowymountainterrain', 'coldeclipseterrain']) && pokemon.species.id !== 'darmanitangalarzen' && pokemon.baseSpecies.id === 'darmanitangalar';
			if (baseZenMode || galarZenMode) {
				pokemon.addVolatile('zenmode');
			} else if (['Zen', 'Galar-Zen'].includes(pokemon.species.forme) && pokemon.hp > pokemon.maxhp / 2) {
				pokemon.addVolatile('zenmode');
				pokemon.removeVolatile('zenmode');
			}
		},
		onResidual(pokemon) {
			if (pokemon.baseSpecies.baseSpecies !== 'Darmanitan' || pokemon.transformed) {
				return;
			}
			const isBaseNotZen = pokemon.species.id !== 'darmanitanzen' && pokemon.baseSpecies.id === 'darmanitan';
			const isGalarNotZen = pokemon.species.id !== 'darmanitangalarzen' && pokemon.baseSpecies.id === 'darmanitangalar';
			const alwaysZen = this.field.isTerrain(['ashenbeachterrain', 'psychicterrain']);
			const alwaysGalarZen = this.field.isTerrain(['icyterrain', 'snowymountainterrain', 'coldeclipseterrain']);
			const baseZenMode = alwaysZen && isBaseNotZen;
			const galarZenMode = alwaysGalarZen && isGalarNotZen;
			if ((pokemon.hp <= pokemon.maxhp / 2 && !['Zen', 'Galar-Zen'].includes(pokemon.species.forme)) || baseZenMode || galarZenMode) {
				pokemon.addVolatile('zenmode');
			} else if ((['Zen', 'Galar-Zen'].includes(pokemon.species.forme) && pokemon.hp > pokemon.maxhp / 2) && !(isGalarNotZen || alwaysGalarZen) && !(alwaysZen || isBaseNotZen)) {
				pokemon.addVolatile('zenmode'); // in case of base Darmanitan-Zen
				pokemon.removeVolatile('zenmode');
			}
		},
		onEnd(pokemon) {
			if (!pokemon.volatiles['zenmode'] || !pokemon.hp) return;
			pokemon.transformed = false;
			delete pokemon.volatiles['zenmode'];
			if (pokemon.species.baseSpecies === 'Darmanitan' && pokemon.species.battleOnly) {
				pokemon.formeChange(pokemon.species.battleOnly as string, this.effect, false, '0', '[silent]');
			}
		},
		condition: {
			onStart(pokemon) {
				if (!pokemon.species.name.includes('Galar')) {
					if (pokemon.species.id !== 'darmanitanzen') pokemon.formeChange('Darmanitan-Zen');
				} else {
					if (pokemon.species.id !== 'darmanitangalarzen') pokemon.formeChange('Darmanitan-Galar-Zen');
				}
			},
			onEnd(pokemon) {
				if (['Zen', 'Galar-Zen'].includes(pokemon.species.forme)) {
					pokemon.formeChange(pokemon.species.battleOnly as string);
				}
			},
		},
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, cantsuppress: 1 },
		name: "Zen Mode",
		rating: 0,
		num: 161,
	},
	zerotohero: {
		onModifySTAB(stab, source, target, move) {
			if (this.movehasType(move, 'Fighting') && !source.hasType('Fighting')) return 1.5;
		},
		onSwitchOut(pokemon) {
			if (pokemon.baseSpecies.baseSpecies !== 'Palafin') return;
			if (pokemon.species.forme !== 'Hero') {
				pokemon.formeChange('Palafin-Hero', this.effect, true);
				pokemon.heroMessageDisplayed = false;
			}
		},
		onSwitchIn(pokemon) {
			if (pokemon.baseSpecies.baseSpecies !== 'Palafin') return;
			if (this.field.isTerrain(['murkwatersurfaceterrain', 'underwaterterrain', 'watersurfaceterrain'])) {
				if (pokemon.species.forme !== 'Hero') {
					pokemon.formeChange('Palafin-Hero', this.effect, true);
					pokemon.heroMessageDisplayed = false;
				}
			}
			if (!pokemon.heroMessageDisplayed && pokemon.species.forme === 'Hero') {
				this.add('-activate', pokemon, 'ability: Zero to Hero');
				pokemon.heroMessageDisplayed = true;
			}
			if (pokemon.species.forme === 'Hero') {
				for (const ally of pokemon.alliesAndSelf()) {
					if (ally.fainted) continue;
					this.heal(ally.baseMaxhp * (ally.hp <= ally.maxhp / 2 ? 1 / 4 : 1 / 8), ally, pokemon, this.dex.abilities.get('zerotohero'));
					if (ally.status) ally.cureStatus();
				}
			}
		},
		onAnyModifyDamage(damage, source, target, move) {
			const pokemon = this.effectState.target;
			if (pokemon.species.forme !== 'Hero') return;
			if (target !== pokemon && target.isAlly(pokemon)) {
				this.debug('Zero to Hero Friend Guard weaken');
				return this.chainModify(0.75);
			}
		},
		onDamage(damage, target, source, effect) {
			if (!['doubles', 'multi', 'freeforall'].includes(this.gameType)) return;
			if ((target as any).zeroToHeroEndureUsed || damage < target.hp || target.hp <= 1) return;
			(target as any).zeroToHeroEndureUsed = true;
			this.add('-activate', target, 'ability: Zero to Hero');
			return target.hp - 1;
		},
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, cantsuppress: 1, notransform: 1 },
		name: "Zero to Hero",
		rating: 5,
		num: 278,
	},

	// CAP
	mountaineer: {
		onDamage(damage, target, source, effect) {
			if (effect && effect.id === 'stealthrock') {
				return false;
			}
		},
		onTryHit(target, source, move) {
			if (move.type === 'Rock' && !target.activeTurns) {
				this.add('-immune', target, '[from] ability: Mountaineer');
				return null;
			}
		},
		isNonstandard: "CAP",
		flags: { breakable: 1 },
		name: "Mountaineer",
		rating: 3,
		num: -1,
	},
	rebound: {
		isNonstandard: "CAP",
		onTryHitPriority: 1,
		onTryHit(target, source, move) {
			if (this.effectState.target.activeTurns) return;

			if (target === source || move.hasBounced || !move.flags['reflectable'] || target.isSemiInvulnerable()) {
				return;
			}
			const newMove = this.dex.getActiveMove(move.id);
			newMove.hasBounced = true;
			newMove.pranksterBoosted = false;
			this.actions.useMove(newMove, target, { target: source });
			return null;
		},
		onAllyTryHitSide(target, source, move) {
			if (this.effectState.target.activeTurns) return;

			if (target.isAlly(source) || move.hasBounced || !move.flags['reflectable'] || target.isSemiInvulnerable()) {
				return;
			}
			const newMove = this.dex.getActiveMove(move.id);
			newMove.hasBounced = true;
			newMove.pranksterBoosted = false;
			this.actions.useMove(newMove, this.effectState.target, { target: source });
			move.hasBounced = true; // only bounce once in free-for-all battles
			return null;
		},
		flags: { breakable: 1 },
		name: "Rebound",
		rating: 3,
		num: -2,
	},
	persistent: {
		isNonstandard: "CAP",
		// implemented in the corresponding move
		flags: {},
		name: "Persistent",
		rating: 3,
		num: -3,
	},
};
