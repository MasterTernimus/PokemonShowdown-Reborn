export const Terrains: { [k: string]: TerrainData } = {
	ashenbeachterrain: {
		name: "Ashen Beach Terrain",
		condition: {
			duration: 9999,
			onBasePowerPriority: 6,
			onAccuracy(accuracy, target, source, move) {
				const noguard = ['owntempo', 'purepower', 'sandveil', 'steadfast'];
				if (!target.hasAbility('unnerve') && source.hasAbility(noguard)) {
					if (move && target === this.effectState.target)
						return true;
				}
				return accuracy;
			},
			onTryAddVolatile(status, target) {
				if ((target.hasAbility('innerfocus') || target.types.includes('Fighting')) && status.id === 'confusion') {
					return null;
				}
			},
			onBasePower(basePower, source, target, move) {
				const uberboost = ['sandtomb', 'mudbomb', 'mudshot', 'mudslap'];
				const megaboost = ['hiddenpower', 'landswrath', 'muddywater', 'strength', 'surf', 'thousandwaves', 'clangoroussoulblaze'];
				const miniboost = ['aurasphere', 'focusblast', 'storedpower', 'zenheadbutt'];
				const boost = ['psychic'];
				let modifier = 1;
				if (uberboost.includes(move.id)) {
					modifier *= 2;
				}
				if (megaboost.includes(move.id)) {
					modifier *= 1.5;
				}
				if (miniboost.includes(move.id)) {
					modifier *= 1.3;
				}
				if (boost.includes(move.id)) {
					modifier *= 1.2;
				}
				return this.chainModify(modifier);
			},
			onAfterMove(source, target, move) {
				const accuracy = ['firespin', 'leaftornado', 'razorwind', 'twister', 'whirlpool'];
				if (accuracy.includes(move.id) || (move.category === 'Special' && move.type === 'Flying')) {
					for (const pokemon of this.getAllActive()) {
						this.boost({ accuracy: -1 }, pokemon, null, move, false, false);
					}
				}
			},
			onResidual(pokemon) {
				if (pokemon.volatiles['sandtomb']) {
					this.boost({ accuracy: -1 }, pokemon, null, this.dex.conditions.get('sandtomb') as Effect, false, false);
				}
			},
			onFieldStart() {
				this.add('-fieldstart', 'Ashen Beach Terrain');
			},
			onFieldEnd() {
				this.add('-fieldend', 'Ashen Beach Terrain');
			},
		}
	},
	bewitchedwoodsterrain: {
		name: "Bewitched Woods Terrain",
		condition: {
			onEffectiveness(typeMod, target, type, move) {
				const types = move.types !== undefined ? move.types : [move.type];
				if (type === 'Steel' && types.includes('Fairy')) {
					return 1;
				}
				if (type === 'Dark' && types.includes('Fairy')) {
					return 0;
				}
				if (type === 'Green' && types.includes('Poison')) {
					return 0;
				}
			},
			onBasePower(basePower, source, target, move) {
				let modifier = 1;
				const boostMoves = ['hex', 'mysticalfire', 'spiritbreak'];
				const weakerboostMoves = ["aurorabeam", "bubblebeam", "chargebeam", "flashcannon", "hyperbeam", "icebeam", "magicalleaf", "mirrorbeam", "psybeam", "signalbeam"];
				const weakBoost: string[] = ["darkpulse", "moonblast", "nightdaze"];
				const blessedMoves = ['judgement', 'originpulse', 'purify', 'sacredfire', 'dazzlinggleam', 'flash'];

				if (move.type === 'Fairy') {
					modifier *= 1.5;
					this.add('-message', 'The fairy aura amplified the attack\'s power!');
				}
				if (move.type === 'Grassy') {
					modifier *= 1.5;
					this.add('-message', 'Flourish!');
				}
				if (move.type === 'Dark') {
					modifier *= 1.3;
					this.add('-message', 'The dark aura amplified the attack\'s power!');
				}
				if (boostMoves.includes(move.id)) {
					modifier *= 1.5;
					this.add('-message', 'Mystical aura amplified the attack!');
				}
				if (weakerboostMoves.includes(move.id)) {
					modifier *= 1.4;
					this.add('-message', 'Magic aura amplified the attack!');
				}
				if (weakBoost.includes(move.id)) {
					modifier *= 1.2;
					this.add('-message', 'The forest is cursed with nightfall!');
				}
				if (blessedMoves.includes(move.id)) {
					modifier *= 1.3;
					this.add('-message', 'The evil spirits have been exorcised!');
				}
				return this.chainModify(modifier);
			},
			onAfterMove(source, target, move) {
				const blessedMoves = ['judgement', 'originpulse', 'purify', 'sacredfire', 'dazzlinggleam', 'flash'];
				if (blessedMoves.includes(move.id)) {
					this.field.changeTerrain('forestterrain');
				}
			},
			onResidual(pokemon) {
				if (pokemon.getStatus().id == 'slp') {
					this.damage(pokemon.baseMaxhp / 16, pokemon);
					this.add('-message', pokemon.name + "'s dream is corrupted by the evil spirits!")
				}
				if (pokemon.isGrounded() && !pokemon.isSemiInvulnerable() && pokemon.hasType('Grass')) {
					this.heal(pokemon.baseMaxhp / 16, pokemon, pokemon);
					this.add('-message', 'The woods healed the grass Pokémon on the field.');
				} else {
					this.debug(`Pokemon semi-invuln or not grounded; Bewitched Terrain skipped`);
				}
			},
			onFieldStart() {
				this.add('-fieldstart', 'Bewitched Woods Terrain');
				this.add('-message', 'Evil spirits gathered!');
			},
			onFieldEnd() {
				this.add('-fieldend', 'Bewitched Woods Terrain');
			},
		}
	},
	bigtopterrain: {
		name: "Big Top Terrain",
		condition: {
			duration: 9999,
			onBasePowerPriority: 6,
			onTryMove(source, target, move) {
				const beast = ['firelash', 'vinewhip', 'powerwhip'];
				const dance = ['fierydance', 'petaldance', 'revelationdance'];
				const air = ['acrobatics', 'fly'];
				const multi = ['tripleaxel', 'triplekick'];
				const flat = ['skittersmack', 'bodypress'];
				const pay = ['payday', 'makeitrain'];
				if (beast.includes(move.id)) {
					this.add('-message', 'Back, foul beast!');
				}
				if (dance.includes(move.id)) {
					this.add('-message', 'What grace!');
				}
				if (air.includes(move.id)) {
					this.add('-message', 'An extravagant aerial finish!');
				}
				if (move.id === 'firstimpression') {
					this.add('-message', 'And what an entrance it is!');
				}
				if (multi.includes(move.id)) {
					this.add('-message', 'And A-One, and A-Two!');
				}
				if (flat.includes(move.id)) {
					this.add('-message', 'A flattening performance!');
				}
				if (pay.includes(move.id)) {
					this.add('-message', 'And a little extra for you, darling!');
				}
				if (move.flags.sound || move.id === 'drumbeating') {
					this.add('-message', 'Loud and Clear!');
				}
			},
			onBasePower(basePower, source, target, move) {
				let modifier = 1;
				const boost = ['acrobatics', 'fierydance', 'firelash', 'firstimpression', 'fly', 'petaldance', 'powerwhip', 'revelationdance', 'vinewhip'];
				if (move.id === 'payday' || move.id === 'makeitrain') {
					modifier *= 2;
				}
				if (move.flags.sound || move.id === 'drumbeating') {
					modifier *= 1.5;
				}
				if (boost.includes(move.id)) {
					modifier *= 1.5;
				}
				if (move.id === 'skittersmack' || move.id === 'bodypress' || move.id === 'tripleaxel') {
					modifier *= 1.2
				}
				return this.chainModify(modifier);
			},
			onDamagePriority: 100,
			onDamage(damage, target, source, effect) {
				const strikermoves = ['blazekick', 'bodyslam', 'bounce', 'brutalswing', 'bulldoze', 'crabhammer', 'dragonhammer', 'dragonrush', 'dualchop', 'earthquake', 'gigaimpact', 'heatcrash', 'heavyslam', 'highhorsepower', 'icehammer', 'iciclecrash', 'irontail', 'magnitude', 'meteormash', 'pound', 'skydrop', 'slam', 'smackdown', 'stomp', 'stompingtantrum', 'strength', 'woodhammer'];
				if (effect?.effectType && effect.effectType === 'Move') {
					if (strikermoves.includes(effect.id) || (effect.category === 'Physical' && effect.type === 'Fighting' && (effect.id !== 'seismictoss' && effect.id !== 'counter'))) {
						const text = ['Weak!', 'Ok!', 'Nice!', 'Powerful!', 'OVER 9000!'];
						const multiplier = [0.5, 1, 1.5, 2, 3];
						const position = this.StrikerBonus(source);
						this.add('-message', text[position]);
						return damage * multiplier[position];
					}
				}
			},
			onFieldStart() {
				this.add('-fieldstart', 'Big Top Terrain');
				this.add('-message', 'Now presenting!');
			},
			onFieldEnd() {
				this.add('-fieldend', 'Big Top Terrain');
			},
		}
	},
	burningterrain: {
		name: "Burning Terrain",
		condition: {
			duration: 9999,
			onBasePowerPriority: 6,
			durationCallback(source, effect) {
				if (source.hasItem('amplifieldrock')) {
					return 7;
				}
				return 4;
			},
			onModifyMove(move) {
				const fireMoves = ['smackdown', 'thousandarrows', 'clearsmog', 'smog'];
				if (fireMoves.includes(move.id)) {
					move.types = [move.type, 'Fire'];
				}
			},
			onBasePower(basePower, source, target, move) {
				const terrainEndMoves = ['defog', 'gust', 'hurricane', 'muddywater', 'sandtomb', 'razorwind', 'sludgewave', 'sparklingaria', 'surf', 'waterpledge', 'watersport', 'waterspout', 'hydrovortex', 'tailwind', 'twister', 'whirlwind', 'oceanicoperatta', 'continentalcrush', 'supersonicskystrike'];
				const rockfireMoves = ['smackdown', 'thousandarrows'];
				const smogfireMoves = ['smog', 'clearsmog'];
				let modifier = 1;
				if (rockfireMoves.includes(move.id))
					modifier *= 2;
				if (smogfireMoves.includes(move.id)) {
					modifier *= 1.5
				}
				if (move.type === 'Fire' && source.isGrounded()) {
					modifier *= 1.5;
				}
				if (move.type === 'Grass' && target.isGrounded()) {
					modifier *= 0.5;
				}
				if (move.type === 'Ice') {
					modifier *= 0.5;
				}
				if (terrainEndMoves.includes(move.id)) {
					modifier *= 5325 / 4096;
				}
				return this.chainModify(modifier);
			},
			onAfterMove(source, target, move) {
				const terrainEndMoves = ['defog', 'gust', 'hurricane', 'muddywater', 'sandtomb', 'razorwind', 'sludgewave', 'sparklingaria', 'surf', 'waterpledge', 'watersport', 'waterspout', 'hydrovortex', 'tailwind', 'twister', 'whirlwind', 'oceanicoperatta', 'continentalcrush', 'supersonicskystrike'];
				if (terrainEndMoves.includes(move.id)) {
					if (this.field.terrainState.prevterrain !== '') {
						this.field.changeTerrain(this.field.terrainState.prevterrain);
					}
					else {
						this.field.clearTerrain();
					}
				}
			},
			onResidual(pokemon) {
				const immune = ['flamebody', 'flareboost', 'flashfire', 'heatproof', 'magmaarmor', 'waterbubble', 'waterveil', 'wellbakedbody'];
				const weak = ['leafguard', 'fluffy', 'grasspelt', 'icebody'];
				if (!(immune.includes(pokemon.ability) || pokemon.volatiles['aquaring'] || pokemon.hasType('Fire')) && pokemon.isGrounded()) {
					let typeMod = this.clampIntRange(this.dex.getEffectiveness('Fire', pokemon.types), -6, 6);
					let damage = this.clampIntRange(pokemon.baseMaxhp / 8 * Math.pow(2, typeMod), 1);
					if (weak.includes(pokemon.ability)) {
						this.damage(damage * 2, pokemon);
					}
					else {
						this.damage(damage, pokemon);
					}
				}
				if (pokemon.moveThisTurn === 'burnup') {
					pokemon.setType(pokemon.getTypes(true).map(type => type === "???" ? "Fire" : type));
					this.add('-start', pokemon, 'typechange', pokemon.getTypes().join('/'), 'from Burning Terrain');
				}
			},
			onFieldResidual() {
				if (this.field.weather === 'raindance' || this.field.weather === 'sandstorm') {
					if (this.field.terrainState.prevterrain !== '') {
						this.field.changeTerrain(this.field.terrainState.prevterrain);
					}
					else {
						this.field.clearTerrain();
					}
				}
			},
			onFieldStart() {
				this.add('-fieldstart', 'Burning Terrain');
			},
			onFieldEnd() {
				this.add('-fieldend', 'Burning Terrain');
			},
		}
	},
	caveterrain: {
		name: "Cave Terrain",
		condition: {
			duration: 9999,
			onNegateImmunity(pokemon, type) {
				if (!pokemon.isGrounded() && type === 'Ground') return false;
			},
			onBasePower(basePower, source, target, move) {
				let modifier = 1;
				const icy = ['blizzard', 'subzeroslammer'];
				const cavern = ['powergem', 'diamondstorm'];
				if (move.id === 'rocktomb') {
					this.add('message', '...Piled on!');
					modifier *= 1.5;
				}
				if (move.type === 'Rock') {
					this.add('-message', 'The cavern strengthened the attack!');
					modifier *= 1.5;
				}
				if (move.flags.sound) {
					this.add('-message', 'Echo-Echo-Echo');
					modifier *= 1.5;
				}
				if (move.type === 'Flying' && !move.flags.contact) {
					this.add('-message', 'The cave choked out the air!');
					modifier *= 0.5;
				}
				if (cavern.includes(move.id)) {
					modifier *= 1.3;
				}
				if (move.id === 'devastingdrake' || move.id === 'dracometeor' || (move.id === 'dragonpulse' && this.field.terrainState.Tchanges?.get('dragonsdenterrain') === 1)) {
					modifier *= 1.3;
				}
				if (icy.includes(move.id)) {
					modifier *= 1.3;
				}
				return this.chainModify(modifier);
			},
			onAfterMove(source, target, move) {
				const cavern = ['powergem', 'diamondstorm'];
				const icy = ['blizzard', 'subzeroslammer'];
				const cavecollapse = ['bulldoze', 'earthquake', 'fissure', 'magnitude', 'tectonicrage'];
				if (this.field.terrainState.Tchanges?.get('collapse') == 1 && cavecollapse.includes(move.id)) {
					this.add('-message', 'The quake collapsed the ceiling!');
					this.field.terrainState.Tchanges?.set('collapse', 0);
					for (const pokemon of this.getAllActive()) {
						if (pokemon.isSemiInvulnerable() || pokemon.isProtected() || pokemon.hasAbility('rockhead') || pokemon.hasAbility('bulletproof')) {
							continue;
						}
						if (pokemon.hasAbility('prismarmor') || pokemon.hasAbility('solidrock')) {
							this.damage(pokemon.baseMaxhp / 3, pokemon)
						}
						if (pokemon.hasAbility('battlearmor') || pokemon.hasAbility('shellarmor')) {
							this.damage(pokemon.baseMaxhp / 2, pokemon);
						}
						if (pokemon.hasAbility('sturdy') && pokemon.baseMaxhp === pokemon.hp) {
							this.damage(pokemon.baseMaxhp - 1, pokemon);
						}
						else {
							this.damage(pokemon.baseMaxhp, pokemon);
						}
					}
				}
				else if (cavecollapse.includes(move.id)) {
					this.add('-message', 'Bits of rock fell from the crumbling ceiling!');
					this.field.terrainState.Tchanges?.set('collapse', 1);
				}
				if (cavern.includes(move.id)) {
					this.add('-message', 'The cave was littered with crystals!');
					this.field.changeTerrain('crystalcavernterrain', source, move);
				}
				if (move.id === 'devastingdrake' || move.id === 'dracometeor' || (move.id === 'dragonpulse' && this.field.terrainState.Tchanges?.get('dragonsdenterrain') === 1)) {
					this.field.changeTerrain('dragonsdenterrain');
					this.add('-message', 'The draconic energy mutated the field');
				} else if (move.id === 'dragonpulse') {
					this.field.terrainState.Tchanges?.set('dragonsdenterrain', 1);
					this.add('-message', 'Draconic energy seeps in...');
				}
				if (icy.includes(move.id)) {
					this.field.changeTerrain('icyterrain');
					this.add('-message', 'The cave froze over!');
				}
			},
			onFieldStart() {
				if (this.field.weather !== 'hail') {
					this.field.clearWeather();
					this.add('-message', 'The hail is melting in the heat...');
				}
				this.add('-fieldstart', 'Cave Terrain');
				this.add('-message', 'The cave echoes dully...');
			},
			onFieldEnd() {
				this.add('-fieldend', 'Cave Terrain');
			},
		}
	},
	chessboardterrain: {
		name: "Chess Board Terrain",
		condition: {
			duration: 9999,
			onBattleStart(side) {
				if (this.gameType == 'singles') {
					side.pokemon[0].Role = 'Pawn';
				}
				else if (this.gameType == 'doubles') {
					side.pokemon[0].Role = 'Pawn';
					side.pokemon[1].Role = 'Pawn';
				}
				side.pokemon[side.pokemon.length - 1].Role = 'Queen';
				let new_pokemon = side.pokemon.filter(newpokemon => !newpokemon.Role);
				let king = null;
				let min = 9999;
				for (const pokemon of new_pokemon) {
					if (min > pokemon.baseMaxhp) {
						min = pokemon.baseMaxhp;
						king = pokemon;
					}
					if (pokemon.item === 'kingsrock') {
						pokemon.Role = 'King';
						king = null;
						min = 0;
						continue;
					}
					if (!pokemon.Role) {
						switch (pokemon.getBestStat()) {
							case "atk":
							case "spa":
								pokemon.Role = 'Bishop';
								break;
							case "def":
							case "spd":
								pokemon.Role = 'Rook';
								break;
							case "spe":
								pokemon.Role = 'Knight';
								break;
						}
					}
				}
				if (king != null) {
					king.Role = 'King';
				}
			},
			onSwitchIn(pokemon) {
				if (pokemon.Role === 'Pawn') {
					this.add('-message', pokemon.name + ' became a Pawn and stormed up the board!');
				}
				if (pokemon.Role === 'King') {
					this.add('-message', pokemon.name + ' became a King and exposed itself!');
				}
				if (pokemon.Role === 'Knight') {
					this.add('-message', pokemon.name + ' became a Knight and readied its position!');
				}
				if (pokemon.Role === 'Rook') {
					this.add('-message', pokemon.name + ' became a Rook and took the open file!');
					this.boost({ def: 1, spd: 1 }, pokemon);
				}
				if (pokemon.Role === 'Queen') {
					this.add('-message', pokemon.name + ' became a Queen and was placed on the center of the board!');
					this.boost({ def: 1, spd: 1 }, pokemon);
				}
				if (pokemon.Role === 'Bishop') {
					this.add('-message', pokemon.name + ' became a Bishop and took the diagonal!');
					this.boost({ atk: 1, spa: 1 }, pokemon);
				}
			},
			onModifyPriority(priority, source, target, move) {
				if (source.Role === 'King') {
					return priority + 1;
				}
			},
			onModifyMove(move) {
				const chessMoves = ['ancientpower', 'psychic', 'secretpower', 'strength', 'continentalcrush', 'shatteredpsyche'];
				const crazyMoves = ['stompingtantrum', 'outrage', 'thrash'];
				if (chessMoves.includes(move.id)) {
					move.types = [move.type, 'Rock'];
				}
				if (crazyMoves.includes(move.id)) {
					move.critRatio = move.critRatio !== undefined ? move.critRatio + 1 : 1;
				}
			},
			onModifyCritRatio(critRatio, move) {
			},
			onBasePowerPriority: 6,
			onBasePower(basePower, source, target, move) {
				let modifier = 1;
				const chessMoves = ['ancientpower', 'psychic', 'secretpower', 'strength', 'continentalcrush', 'shatteredpsyche', 'barrage'];
				const boost = ['fakeout', 'feint', 'firstimpression', 'shadowsneak', 'smartstrike', 'suckerpunch'];
				const dumbAbilities = ['unaware', 'simple', 'klutz', 'oblivious'];
				const smartAbilities = ['adaptability', 'synchronize', 'anticipation', 'telepathy'];
				const breakMoves = ['stompingtantrum', 'tectonicrage'];
				if (move.id === 'barrage') {
					modifier *= 2;
				}
				if (chessMoves.includes(move.id)) {
					if (dumbAbilities.includes(target.ability)) {
						modifier *= 2;
					}
					if (smartAbilities.includes(target.ability)) {
						modifier *= 0.5;
					}
					this.add('-message', 'The chess piece slammed forward!');
					modifier *= 1.5;
				}
				if (boost.includes(move.id)) {
					this.add('-message', 'En Passant!');
					modifier *= 1.5;
				}
				if (source.Role === 'Queen') {
					this.add('-message', 'The Queen is dominating the board!');
					modifier *= 1.5;
				}
				if (source.Role === 'Knight') {
					if (target.Role === 'Queen') {
						this.add('-message', 'An unblockable attack on the Queen!');
						modifier *= 3;
					}
					if (move.target === 'allAdjacentFoes') {
						this.add('-message', 'The knight forked the opponents!');
						modifier *= 1.25;
					}
				}
				if (breakMoves.includes(move.id)) {
					modifier *= 1.3;
				}
				return this.chainModify(modifier);
			},
			onDamagePriority: -45,
			onDamage(damage, target, source, effect) {
				if (target.Role === 'Pawn' && target.hp === target.maxhp && damage >= target.hp && effect && effect.effectType === 'Move') {
					this.add('-message', target.name + " hung onto the edge of the board");
					target.Role = 'UsedPawn';
					return target.hp - 1;
				}
			},
			onAfterMove(source, target, move) {
				if (move.id === 'tectonicrage') {
					this.add('-message', 'The board was destroyed!');
					this.field.clearTerrain();
				}
			},
			onFieldStart() {
				this.add('-fieldstart', 'Chess Board Terrain');
				this.add('-message', 'Opening variation set');
			},
			onFieldEnd() {
				this.add('-message', 'The board was destroyed!');
				this.add('-fieldend', 'Chess Board Terrain');
			},
		}
	},
	coldeclipseterrain: {
		name: "Cold Eclipse Terrain",
		condition: {
			duration: 9999,
			durationCallback(target, source, effect) {
				if (effect && effect?.id === 'snowscape') {
					if (source.hasItem('amplifieldrock')) {
						return 8
					}
				}
				return 5;
			},
			onModifyDef(def, pokemon) {
				let modifier = 1;
				if (pokemon.hasType('Ice') && !this.field.isWeather('hail')) {
					modifier *= 1.2;
				}
				if (pokemon.hasType('Ghost')) {
					modifier *= 1.2;
				}
				if (pokemon.hasType('Fire')) {
					modifier *= 0.8;
				}
				return this.chainModify(modifier);
			},
			onModifySpD(spd, pokemon) {
				let modifier = 1;
				if (pokemon.hasType('Ghost')) {
					modifier *= 1.2;
				}
				if (pokemon.hasType('Fire')) {
					modifier *= 0.8;
				}
				if (pokemon.hasType('Ice')) {
					if (this.field.isWeather('hail')) {
						modifier *= 1.5;
					} else {
						modifier *= 1.2;
					}
				}
				return this.chainModify(modifier);
			},
			onModifySpe(spe, pokemon) {
				const immune = ['slushrush', 'icebody', 'snowcloak', 'illusion'];
				if (pokemon.hasAbility(immune) || !pokemon.isGrounded() || pokemon.hasType('Ice')) {
					return this.chainModify(0.75);
				}
			},
			onTryMove(source, target, move) {
				const failMoves = ['trickroom', 'wonderroom', 'gravity', 'magicroom'];
				if (failMoves.includes(move.id)) {
					this.add('-message', 'The cold reality did not change');
					return null;
				}
				if (['solarbeam', 'solarblade'].includes(move.id) && !this.field.isWeather(['sunnyday', 'desolateland'])) {
					this.add('-message', 'The cold eclipse swallowed the sunlight!');
					return null;
				}
			},
			onModifyMovePriority: -1,
			onModifyMove(move) {
				const slush = ['mudslap', 'mudshot', 'mudbomb', 'darkpulse', 'nightslash'];
				const notSlush = ['brine', 'steameruption', 'scald', 'hydrosteam', 'chillingwater'];
				const sun = ['sunsteelstrike', 'searingsunrazesmash'];
				const groundTypes = ['Rock', 'Steel', 'Ground'];
				if (slush.includes(move.id) || (move.type === 'Water' && move.category === 'Special' && !notSlush.includes(move.id)) || (groundTypes.includes(move.type) && !sun.includes(move.id))) {
					if (groundTypes.includes(move.type)) {
						this.add('-message', 'Frost covered the attack!');
					}
					move.types = [move.type, 'Ice'];
				}
			},
			onBasePowerPriority: 6,
			onBasePower(basePower, source, target, move) {
				let modifier = 1;
				const notSlush = ['brine', 'steameruption', 'scald', 'hydrosteam', 'chillingwater']
				const steamNerf = ['hydrosteam', 'scald', 'steameruption'];
				const mudBoost = ['mudslap', 'mudshot', 'mudbomb'];
				const gustBoost = ['aeroblast', 'bleakwindstorm', 'brine', 'gust', 'razorwind', 'silverwind', 'omniouswind', 'blizzard', 'freezeshock', 'iceburn'];
				const icyUberboost = ['icywind', 'fairywind', 'twister', 'powdersnow', 'chillingwater', 'glaciate', 'subzeroslammer'];
				const iceburnBoost = ['bittermalice', 'fierywrath', 'freezingglare', 'nightdaze', 'moongeistbeam', 'rage', 'roaroftime', 'menacingmoonrazemaelstrom'];
				const infernoMoves = ['heatwave', 'eruption', 'searingshot', 'searingsunrazesmash', 'flameburst', 'lavaplume', 'firepledge', 'mindblown', 'incinerate', 'infernooverdrive'];
				if (move.type === 'Dark') {
					modifier *= 1.5;
				}
				if (move.type === 'Flying' && move.category === 'Special') {
					this.add('-message', 'The attack was carried by the glacial currents');
					modifier *= 1.5;
				}
				if (move.type === 'Water' && move.category === 'Special' && !notSlush.includes(move.id)) {
					this.add('-message', 'Glacial energy seeped into the water!');
					modifier *= 1.2;
				}
				if (move.type === 'Ice') {
					if (this.field.isWeather('hail')) {
						modifier *= 1.5;
					} else {
						modifier *= 1.2;
					}
				}
				if (move.type === 'Fire') {
					if (source.hasAbility(['fullmetalbody', 'turboblaze'])) {
						modifier *= 2;
						this.add('-message', source.name + '\'s ' + source.ability + ' defies the frozen night!');
					}
					this.add('-message', 'The heat swallowed by the frozen night!');
					modifier *= 0.5;
				}
				if (steamNerf.includes(move.id)) {
					this.add('-message', 'The heat swallowed by the frozen night!');
					modifier *= 0.5;
				}
				if (mudBoost.includes(move.id)) {
					this.add('-message', 'The attack was carried by the glacial currents');
					modifier *= 1.5;
				}
				if (gustBoost.includes(move.id)) {
					modifier *= 1.5;
					if (['freezeshock', 'iceburn'].includes(move.id)) {
						this.add('-message', 'The cold deepened to absolute zero!');
					} else if (['aeroblast', 'bleakwindstorm', 'blizzard', 'razorwind'].includes(move.id)) {
						this.add('-message', 'The blizzard howled under the eclipsed sky');
					} else {
						this.add('-message', 'The Cold Eclipse magnified the attack!');
					}
				}
				if (icyUberboost.includes(move.id)) {
					modifier *= 2;
					if (['subzeroslammer', 'glaciate'].includes(move.id)) {
						this.add('-message', 'The Moonlit frost tore through the field');
					} else {
						this.add('-message', 'The Cold Eclipse turned the attack lethal!');
					}
				}
				if (iceburnBoost.includes(move.id)) {
					modifier *= 1.5;
					if (move.id === 'roaroftime') {
						this.add('-message', 'Echo of time was magnified under the eclipsed sky!');
					} else {
						this.add('-message', 'The cold atmosphere fed the darkness!');
					}
				}
				if (['darkpulse, nightslash'].includes(move.id)) {
					modifier *= 1.2;
					this.add('-message', 'The attack took power from the cold malice!');
				}
				if (move.id === 'lightthatburnsthesky') {
					modifier *= 0.5;
					this.add('-message', 'The eclipsed sky dulled the blinding light!');
				}
				if (infernoMoves.includes(move.id) && !this.field.pseudoWeather['watersport']) {
					modifier *= 1.3;
					this.add('-message', 'The burning heat chased off the cold night!');
				}
			},
			onAfterMove(source, target, move) {
				const infernoMoves = ['heatwave', 'eruption', 'searingshot', 'searingsunrazesmash', 'flameburst', 'lavaplume', 'firepledge', 'mindblown', 'incinerate', 'infernooverdrive'];
				if (infernoMoves.includes(move.id) && !this.field.pseudoWeather['watersport']) {
					this.field.clearTerrain();
				}
				if (move.id === 'geomancy') {
					this.field.clearTerrain();
					this.add('-message', 'Starlight began to shine!');
					this.field.setTerrain('starlightarenaterrain');
				}
			},
			onImmunity(type, pokemon) {
				const immuneHail = ['fullmetalbody', 'illusion', 'prismarmor', 'shadowshield'];
				if (type === 'hail' && pokemon.hasAbility(immuneHail)) {
					return false;
				}
			},
			onResidual(pokemon) {
				if (this.field.isWeather('raindance')) {
					this.field.changeWeather('hail');
				}
				if (this.field.isWeather('primordealsea')) {
					this.add('-message', 'The heavy rain refused to freeze!');
				}
				if (this.field.isWeather('desolateland') || (this.field.isWeather('sunnyday') && this.field.terrainState.Tchanges?.get('sunnyday') === 1)) {
					this.add('-message', 'The morning has arrived!');
					this.field.clearTerrain();
				}
				else if (this.field.isWeather('sunnyday')) {
					this.field.terrainState.Tchanges?.set('sunnyday', 1);
				}
			},
			onFieldStart() {
				this.add('-fieldstart', "Cold Eclipse Terrain");
			},
			onFieldEnd() {
				this.add('-fieldend', 'Cold Eclipse Terrain')
			}
		}
	},
	corrosivemistterrain: {
		name: "Corrosive Mist Terrain",
		condition: {
			duration: 9999,
			onBasePowerPriority: 6,
			onModifyMove(move) {
				const poisonedMoves = ['bubblebeam', 'bubble', 'sparklingaria', 'energyball'];
				if (move.type === 'Flying' && move.category === 'Special') {
					move.types = ['Flying', 'Poison'];
				}
				if (poisonedMoves.includes(move.id)) {
					move.types = [move.type, 'Poison'];
				}
			},
			onBasePower(basePower, source, target, move) {
				let modifier = 1;
				const poisonedMoves = ['bubblebeam', 'bubble', 'sparklingaria'];
				const smogMoves = ['smog', 'clearsmog', 'acidspray'];
				const terrainEndMoves = ['defog', 'gust', 'hurricane', 'razorwind', 'tailwind', 'twister', 'whirlwind', 'supersonicskystrike', 'seedflare'];
				const igniteMoves = ['eruption', 'explosion', 'firepledge', 'flameburst', 'heatwave', 'incinerate', 'lavaplume', 'mindblown', 'searingshot', 'selfdestruct', 'infernooverdrive'];
				if (move.type === 'Fire') {
					modifier *= 1.5;
				}
				if (poisonedMoves.includes(move.id))
					modifier *= 1.5;
				if (smogMoves.includes(move.id))
					modifier *= 1.5;
				if (terrainEndMoves.includes(move.id) || igniteMoves.includes(move.id))
					modifier *= 5325 / 4096;
				return this.chainModify(modifier);
			},
			onAfterMove(source, target, move) {
				const terrainEndMoves = ['defog', 'gust', 'hurricane', 'razorwind', 'tailwind', 'twister', 'whirlwind', 'supersonicskystrike', 'seedflare'];
				const igniteMoves = ['eruption', 'explosion', 'firepledge', 'flameburst', 'heatwave', 'incinerate', 'lavaplume', 'mindblown', 'searingshot', 'selfdestruct', 'infernooverdrive'];
				if (igniteMoves.includes(move.id)) {
					for (const pokemon of this.getAllActive()) {
						if (pokemon.hasAbility('damp')) {
							return;
						}
					}
					this.add('-message', 'The toxic mist combusted!');
					for (const pokemon of this.getAllActive()) {
						if (pokemon.hasAbility('flashfire') || pokemon.hasAbility('wellbakedbody') || pokemon.isSemiInvulnerable() || pokemon.isProtected() || pokemon.side.sideConditions['wideguard'])
							continue;
						if (pokemon.hasAbility('sturdy') || pokemon.volatiles['endure'] !== undefined) {
							this.damage(this.runEvent('Damage', pokemon, null, move, pokemon.baseMaxhp - 1), pokemon);
						}
						else {
							this.damage(pokemon.baseMaxhp, pokemon);
						}
					}

					this.field.clearTerrain();
				}
				if (move.id === 'gravity')
					this.field.changeTerrain('corrosiveterrain');
				if (terrainEndMoves.includes(move.id)) {
					this.field.clearTerrain();
				}
			},
			onFieldResidualOrder: 27,
			onFieldResidualSubOrder: 7,
			onFieldResidual() {
				for (const pokemon of this.getAllActive()) {
					if (pokemon.trySetStatus('psn')) {
						this.damage(this.runEvent('Damage', pokemon, null, this.dex.conditions.get('psn'), pokemon.baseMaxhp / 8), pokemon);
					}
				}
			},
			onFieldStart() {
				this.add('-fieldstart', "Corrosive Mist Terrain");
			},
			onFieldEnd() {
				this.add('-fieldend', 'Corrosive Mist Terrain')
			}

		}
	},
	corrosiveterrain: {
		name: "Corrosive Terrain",
		condition: {
			duration: 9999,
			onBasePowerPriority: 6,
			onModifyMove(move) {
				let poisonedMoves = ['mudbomb', 'mudshot', 'mudslap', 'muddywater', 'smackdown', 'whirlpool', 'thousandarrows'];
				if (move.type === 'Grass') {
					move.types = [move.type, 'Poison'];
				}
				if (poisonedMoves.includes(move.id)) {
					move.types = [move.type, 'Poison'];
				}
			},
			onSwitchIn(pokemon) {
				let immune = ['immunity', 'magicguard', 'poisonheal', 'toxicboost', 'wonderguard'];
				if (!immune.includes(pokemon.ability) && pokemon.isGrounded() && !(pokemon.types.includes('Poison') || pokemon.types.includes('Steel'))) {
					let typeMod = this.dex.getEffectiveness('Poison', pokemon.types);
					typeMod = this.clampIntRange(typeMod, -6, 6);
					this.damage(pokemon.baseMaxhp / 4 * Math.pow(2, typeMod), pokemon);
				}
			},
			onBasePower(basePower, source, target, move) {
				let modifier = 1;
				let superStrong = ['acid', 'acidspray', 'grassknot'];
				let poisonedMoves = ['mudbomb', 'mudshot', 'mudslap', 'muddywater', 'smackdown', 'whirlpool', 'thousandarrows'];
				if (superStrong.includes(move.id)) {
					modifier *= 2;
				}
				if (poisonedMoves.includes(move.id)) {
					modifier *= 1.5;
				}
				if (move.id === 'seedflare') {
					modifier *= 1.3;
				}
				return this.chainModify(modifier);
			},
			onAfterMove(source, target, move) {
				let disinfectMoves = ['purify', 'seedflare'];
				if (disinfectMoves.includes(move.id)) {
					this.add('-message', 'The polluted field was purified!');
					this.field.changeTerrain('grassyterrain');
				}
			},
			onResidual(pokemon) {
				let immune = ['immunity', 'magicguard', 'poisonheal', 'toxicboost', 'wonderguard'];
				if (!immune.includes(pokemon.ability) && !(pokemon.types.includes('Poison') || pokemon.types.includes('Steel'))) {
					if (pokemon.status === 'slp' || pokemon.hasAbility('comatose')) {
						this.damage(pokemon.baseMaxhp / 16, pokemon);
					}
				}
			},
			onFieldStart() {
				this.add('-fieldstart', 'Corrosive Terrain');
			},
			onFieldEnd() {
				this.add('-fieldend', 'Corrosive Terrain');
			},
		}
	},
	crystalcavernterrain: {
		name: "Crystal Cavern Terrain",
		condition: {
			duration: 9999,
			onModifyMove(move) {
				const crystalBoost = ['judgement', 'multiattack', 'rockclimb', 'strength', 'prismaticlaser'];
				const counter = ['Fire', 'Water', 'Grass', 'Psychic'];
				if (move.category != 'Status' && (move.type == 'Rock' || crystalBoost.includes(move.id))) {
					move.types = [move.type, counter[this.CrystalCavernCounter]];
				}
			},
			onTypeImmunity(source, target, move) {
				const crystalBoost = ['judgement', 'multiattack', 'rockclimb', 'strength', 'prismaticlaser'];
				if (move.category != 'Status' && (move.type == 'Rock' || crystalBoost.includes(move.id))) {
					this.CrystalCavernCounter++;
					this.CrystalCavernCounter = this.CrystalCavernCounter % 4;
				}
			},
			onBasePowerPriority: 6,
			onBasePower(basePower, source, target, move) {
				//I hate this
				let modifier = 1;
				const crystalBoost = ['judgement', 'multiattack', 'rockclimb', 'strength'];
				const boost = ['ancientpower', 'diamondstorm', 'powergem', 'rocksmash', 'rocktomb'];
				const weakboost = ['aurorabeam', 'doomdesire', 'dazzlinggleam', 'flashcannon', 'lusterpurge', 'mirrorshot', 'moongeistbeam', 'photongeyser', 'signalbeam', 'technoblast', 'menacingmoonrazemaelstorm'];
				const terrainbreak = ['bulldoze', 'earthquake', 'fissure', 'magnitude', 'tectonicrage'];
				const dark = ['darkpulse', 'darkvoid', 'nightdaze', 'lightthatburnsthesky'];
				if (move.type == 'Rock') {
					this.add('-message', 'The crystals charged the attack!');
					modifier *= 1.5;
				}
				if (move.type == 'Dragon') {
					this.add('-message', 'The crystal energy strengthened the attack!');
					modifier *= 1.5;
				}
				if (crystalBoost.includes(move.id)) {
					this.add('-message', 'The crystals strengthened the attack!');
					modifier *= 1.5;
				}
				if (boost.includes(move.id)) {
					this.add('-message', 'The crystals\' light strengthened the attack!');
					modifier *= 1.5;
				}
				if (weakboost.includes(move.id)) {
					modifier *= 1.3;
				}
				if (terrainbreak.includes(move.id) && (this.field.terrainState.Tchanges?.get('caveterrain') === 1 || move.id === 'tectonicrage')) {
					modifier *= 1.3;
				}
				if (dark.includes('move.id') && this.field.weather !== 'sunnyday') {
					modifier *= 1.3;
				}
				return this.chainModify(modifier);
			},
			onHit(target, source, move) {
				const crystalBoost = ['judgement', 'multiattack', 'rockclimb', 'strength', 'prismaticlaser'];
				const counter = ['Fire', 'Water', 'Grass', 'Psychic'];
				if (move.category != 'Status' && (move.type == 'Rock' || crystalBoost.includes(move.id))) {
					this.CrystalCavernCounter++;
					this.CrystalCavernCounter = this.CrystalCavernCounter % 4;
					move.types = [move.type, counter[this.CrystalCavernCounter]];
				}
			},
			onAfterMove(source, target, move) {
				const dark = ['darkpulse', 'darkvoid', 'nightdaze', 'lightthatburnsthesky'];
				const terrainbreak = ['bulldoze', 'earthquake', 'fissure', 'magnitude', 'tectonicrage'];
				if (terrainbreak.includes(move.id)) {
					if (this.field.terrainState.Tchanges?.get('caveterrain') === 1 || move.id === 'tectonicrage') {
						this.add('-message', 'The crystals were shattered!')
						this.field.changeTerrain('caveterrain', source, move);
					}
					else {
						this.add('-message', 'The crystals were broken up...');
						this.field.terrainState.Tchanges?.set('caveterrain', 1);
					}
				}
				if (dark.includes(move.id) && this.field.weather !== 'sunnyday') {
					this.add('-message', 'The crystals\' light was warped by the darkness!');
					this.field.changeTerrain('darkcrystalcavernterrain', source, move);
				}
			},
			onFieldResidual() {
				const source = this.field.terrainState.origin;
				if (source && source.id) {
					if (source.id == 'sunnyday' && this.field.weather !== 'sunnyday') {
						this.field.changeTerrain('darkcrystalcavernterrain');
					}
				}			
			},
			onFieldStart() {
				this.add('-fieldstart', 'Crystal Cavern Terrain');
				this.add('-message', 'The cave is littered with crystals.');
			},
			onFieldEnd() {
				this.add('-fieldend', 'Crystal Cavern Terrain');
			},
		}
	},
	darkcrystalcavernterrain: {
		name: "Dark Crystal Cavern Terrain",
		condition: {
			duration: 9999,
			onModifyDefPriority: 10,
			onModifyDef(def, pokemon) {
				if (pokemon.hasType('Dark') || pokemon.hasType('Ghost')) {
					return this.modify(def, 1.5);
				}
			},
			onModifySpDPriority: 10,
			onModifySpD(spd, pokemon) {
				if (pokemon.hasType('Dark') || pokemon.hasType('Ghost')) {
					return this.modify(spd, 1.5);
				}
			},
			onBasePowerPriority: 6,
			onBasePower(basePower, source, target, move) {
				let modifier = 1;
				const superboost = ['prismaticlaser', 'blackholeeclipse'];
				const boost = ['aurorabeam', 'darkpulse', 'dazzlinggleam', 'diamondstorm', 'doomdesire', 'flashcannon', 'lusterpurge', 'mirrorshot', 'moongeistbeam', 'nightdaze', 'nightslash', 'photongeyser', 'powergem', 'shadowball', 'shadowbone', 'shadowclaw', 'shadowforce', 'shadowsneak', 'signalbeam', 'technoblast', 'menacingmoonrazemaelstorm', 'ceaselessedge'];
				const terrainbreak = ['bulldoze', 'earthquake', 'fissure', 'magnitude', 'tectonicrage'];
				if (superboost.includes(move.id)) {
					this.add('-message', 'The field super charged the attack');
					modifier *= 2;
				}
				if (boost.includes(move.id)) {
					this.add('-message', 'The field strengthened the attack!');
					modifier *= 1.5;
				}
				if (move.id == 'lightthatburnsthesky') {
					modifier *= 0.5;
				}
				if (terrainbreak.includes(move.id) && this.field.terrainState.Tchanges?.get('caveterrain') === 1) {
					modifier *= 1.3;
				}
				return this.chainModify(modifier);
			},
			onAfterMove(source, target, move) {
				if (move.id === 'sunnyday') {
					this.add('-message', 'The sun lit up the crystal cavern!');
				}
				const terrainbreak = ['bulldoze', 'earthquake', 'fissure', 'magnitude', 'tectonicrage'];
				if (terrainbreak.includes(move.id)) {
					if (this.field.terrainState.Tchanges?.get('caveterrain') === 1) {
						this.add('-message', 'The dark crystals were shattered!');
						this.field.changeTerrain('caveterrain', source, move);
					}
					else {
						this.add('-message', 'The dark crystals are starting to crack...');
						this.field.terrainState.Tchanges?.set('caveterrain', 1);
					}
				}
			},
			onFieldResidual() {
				if (this.field.weather === 'sunnyday') {
					this.field.changeTerrain('crystalcavernterrain', null, this.field.getWeather());
				}
			},
			onFieldStart() {
				this.add('-fieldstart', 'Dark Crystal Cavern Terrain');
				this.add('-message', 'The darkness is gathering...');
			},
			onFieldEnd() {
				this.add('-fieldend', 'Dark Crystal Cavern Terrain');
			},
		}
	},
	desertterrain: {
		name: "Desert Terrain",
		condition: {
			duration: 9999,
			onBasePowerPriority: 6,
			onTryHit(target, source, move) {
				if (target !== source && (move.types !== undefined ? move.types : [move.type]).includes('Water') && (target.hasType(['Water', 'Grass']))) {
					if (!this.heal(target.baseMaxhp / 4)) {
						this.add('-immune', move.id, 'instead restored' + target.name + '\'s HP!');
					}
					return null;
				}
			},
			onBasePower(basePower, source, target, move) {
				let modifier = 1;
				const sandified = ['burnup', 'dig', 'heatwave', 'needlearm', 'pinmissile', 'sandtomb', 'solarbeam', 'solarblade', 'thousandwaves', 'searingsunrazesmash'];
				const boneBoost = ['bonemerang', 'boneclub', 'bonerush', 'shadowbone'];
				if (move.type === 'Water' && source.isGrounded()) {
					this.add('-message', 'The intense desert heat blunted the attack!')
					modifier *= 0.5;
				}
				if (move.type === 'Electric' && target.isGrounded()) {
					this.add('-message', 'The floating sand particles partially grounded the attack!')
					modifier *= 0.5;
				}
				if (sandified.includes(move.id)) {
					this.add('-message', 'The harsh desert heat augmented the attack!')
					modifier *= 1.5;
				}
				if (boneBoost.includes(move.id)) {
					modifier *= 1.5;
					this.add('-message', 'The lifeless desert strengthened the attack!');
				}
				return this.chainModify(modifier);
			},
			onResidual(pokemon) {
				if (pokemon.hasType(['Water', 'Grass']) && !(pokemon.hasAbility('chlorophyll') || pokemon.hasAbility('solarpower')) && this.field.isWeather(['sunnyday', 'desolateland'])) {
					this.damage(pokemon.baseMaxhp / 8);
					this.add('-message', pokemon.name + " was hurt by the sunlight!");
				}
			},
			onFieldStart() {
				this.add('-fieldstart', 'Desert Terrain');
			},
			onFieldEnd() {
				this.add('-fieldend', 'Desert Terrain');
			},
		}
	},
	dragonsdenterrain: {
		name: "Dragon's Den Terrain",
		condition: {
			duration: 9999,
			onModifyDef(def, pokemon) {
				if (pokemon.hasType('Dragon')) {
					return this.chainModify(1.3);
				}
			},
			onModifySpD(spd, pokemon) {
				if (pokemon.hasType('dragon')) {
					return this.chainModify(1.3);
				}
			},
			onBasePowerPriority: 6,
			onModifyMove(move) {
				const fire_moves = ['smackdown', 'thousandarrows', 'continentalcrush', 'tectonicrage', 'rockclimb', 'earthquake'];
				if (fire_moves.includes(move.id)) {
					move.types = [move.type, 'Fire'];
				}
				if (move.id === 'strength') {
					this.add('-message', 'Unrivaled Power!');
					move.types = ['Rock', 'Fire'];
				}
			},
			onBasePower(basePower, source, target, move) {
				let modifier = 1;
				const uberboost = ['smackdown', 'thousandarrows', 'continentalcrush', 'tectonicrage', 'dragonascent', 'payday', 'lusterpurge', 'mistball'];
				const boost = ['lavaplume', 'magmastorm', 'megakick', 'makeitrain', 'rockclimb', 'strength', 'diamondstorm', 'makeitrain', 'powergem', 'shelltrap', 'earthpower', 'stompingtantrum'];
				const terrain_change = ['glaciate', 'hydrovortex', 'oceanicoperetta', 'subzeroslammer', 'mistball'];
				const terrain_change2 = ['muddywater', 'sparklingaria', 'surf'];
				if (move.type === 'Dragon' || move.type === 'Fire') {
					this.add('-message', 'The ambient dragon fire boosted the attack!')
					modifier *= 1.5;
				}
				if (move.type === 'Ice' || move.type === 'Water') {
					this.add('-message', 'The lava\'s heat softened the attack...');
					modifier *= 0.5;
				}
				if (boost.includes(move.id)) {
					modifier *= 1.5;
				}
				if (uberboost.includes(move.id)) {
					this.add('-message', 'The draconic energy boosted the attack!')
					modifier *= 2;
				}
				if (terrain_change.includes(move.id) || (this.field.terrainState.Tchanges?.get(move.id) == 1 && terrain_change2.includes(move.id))) {
					modifier *= 1.3;
				}
				const moveMessages = new Map<string, string>([
					['megakick', 'Trial of the Dragon!!!'],
					['magmastorm', 'The lava strengthened the attack!'],
					['lavaplume', 'The lava strengthened the attack!'],
					['shelltrap', 'The lava strengthened the attack!'],
					['earthpower', 'The lava strengthened the attack!'],
					['payday', 'money money money money money mothafucka'],
					['makeitrain', 'money money money money money mothafucka'],
					['stompingtantrum', 'Wrath of the Dragon!!!'],
					['diamondstorm', 'Sparkling treasure!'],
					['makeitrain', 'Sparkling treasure!'],
					['powergem', 'Sparkling treasure!'],
				]);
				if (moveMessages.has(move.id)) {
					this.add('-message', moveMessages.get(move.id)!);
				}
				if (move.id === 'smackdown' || move.id === 'thousandarrows') {
					this.add('-message', target.name + ' was knocked into the lava!')
				}
				return this.chainModify(modifier);
			},
			onAfterMove(source, target, move) {
				const terrain_change = ['glaciate', 'hydrovortex', 'oceanicoperetta', 'subzeroslammer'];
				const terrain_change2 = ['muddywater', 'sparklingaria', 'surf'];
				if (terrain_change.includes(move.id) || (this.field.terrainState.Tchanges?.get(move.id) == 1 && terrain_change2.includes(move.id))) {
					this.add('-message', 'The lava solidified!');
					this.field.changeTerrain('caveterrain');
				}
				else if (terrain_change2.includes(move.id)) {
					this.add('-message', 'The lava began to harden!');
					this.field.terrainState.Tchanges?.set(move.id, 1);
				}
				else if (move.id === 'mistball') {
					this.add('-message', 'The mist-ical energy altered the surroundings!');
					this.field.changeTerrain('fairytaleterrain');
				}
			},
			onFieldStart() {
				this.add('-message', 'If you wish to slay a dragon...');
				this.add('-fieldstart', 'Dragons Den Terrain');
			},
			onFieldEnd() {
				this.add('-fieldend', 'Dragons Den Terrain');
			}
		}
	},
	factoryterrain: {
		name: "Factory Terrain",
		condition: {
			duration: 9999,
			onBasePowerPriority: 6,
			onBasePower(basePower, source, target, move) {
				let modifier = 1;
				const quakemoves = ['bulldoze', 'earthquake', 'explosion', 'fissure', 'magnitude', 'selfdestruct', 'lightthatburnsthesky', 'tectonicrage', 'discharge', 'risingvoltage']
				const uberboost = ['flashcannon', 'geargrind', 'gyroball', 'magnetbomb', 'doubleironbash'];
				const boost = ['steamroller', 'technoblast', 'doubleironbash'];
				if (move.type === 'Electric') {
					modifier *= 1.5;
				}
				if (uberboost.includes(move.id)) {
					this.add('-message', 'ATTACK SEQUENCE INITIATE.')
					modifier *= 2;
				}
				if (boost.includes(move.id)) {
					modifier *= 1.5;
				}
				if (quakemoves.includes(move.id)) {
					modifier *= 5325/4096;
				}
				return this.chainModify(modifier);
			},
			onAfterMove(source, target, move) {
				const quakemoves = ['bulldoze', 'earthquake', 'explosion', 'fissure', 'magnitude', 'selfdestruct', 'lightthatburnsthesky', 'tectonicrage', 'discharge', 'risingvoltage']
				if (quakemoves.includes(move.id)) {
					this.field.changeTerrain('shortcircuitterrain');
				}
			},
			onFieldStart() {
				this.add('-fieldstart', 'Factory Terrain');
			},
			onFieldEnd() {
				this.add('-fieldend', 'Factory Terrain');
			}
		}
	},
	fairytaleterrain: {
		name: "Fairy Tale Terrain",
		condition: {
			duration: 9999,
			onBasePowerPriority: 6,
			onModifyMove(move) {
				if (move.type === 'Fire') {
					this.add('-message', 'The fiery flames became draconified!');
					move.types = [move.type, 'Dragon'];
				}
			},
			onModifyType(move, pokemon) {
				let steelify = ['cut', 'sacredsword', 'secretsword', 'slash'];
				if(steelify.includes(move.id)) {
					move.type = "Steel";
				}
			},
			onEffectiveness(typeMod, target, type, move) {
				const types = move.types !== undefined ? move.types : [move.type];
				if (type === 'Dragon' && types.includes('Steel')) {
					return 1;
				}
			},
			onBasePower(basePower, source, target, move) {
				const strengthenedMoves = ['airslash', 'ancientpower', 'fleurcannon', 'leafblade', 'magicalleaf', 'moongeistbeam', 'mysticalfire', 'nightslash', 'psychocut', 'relicsong', 'smartstrike', 'solarblade', 'sparklingaria', 'menacingmoonrazemaelstorm', 'oceanicoperetta', 'kowtowcleave', 'aquacutter', 'ceaselessedge', 'stoneaxe'];
				let modifier = 1;
				if (move.type === 'Dragon') {
					this.add('-message', 'The draconic energy was strengthened by the dead princesses on the field!');
					modifier *= 2;
				}
				if (move.type === 'Fairy') {
					this.add('-message', 'The fairy energy was strengthened by the dead dragons on the field!');
					modifier *= 1.5;
				}
				if (move.type === 'Steel') {
					this.add('-message', 'The steel energy was strengthened by the dead knights on the field!');
					modifier *= 1.5;
				}
				if (strengthenedMoves.includes(move.id)) {
					this.add('-message', 'The move was strengthened by the terrain!');
					modifier *= 1.5
				}
				if (move.id === 'drainingkiss') {
					this.add('-message', 'The move was strengthened by the terrain!');

					modifier *= 2;
				}
				return this.chainModify(modifier);
			},
			onFieldStart() {
				this.add('-fieldstart', 'Fairy Tale Terrain');
			},
			onFieldEnd() {
				this.add('-fieldend', 'Fairy Tale Terrain');
			}
		}
	},
	forestterrain: {
		name: "Forest Terrain",
		condition: {
			duration: 9999,
			onBasePowerPriority: 6,
			onModifyMove(move) {
				const grassymoves = ['aircutter', 'airslash', 'breakingswipe', 'furycutter', 'psychocut', 'slash', 'cut'];
				if (grassymoves.includes(move.id)) {
					move.types = [move.type, 'Grass'];
				}
			},
			onBasePower(basePower, source, target, move) {
				let modifier = 1;
				const igniteMoves = ['eruption', 'firepledge', 'flameburst', 'heatwave', 'incinerate', 'lavaplume', 'mindblown', 'searingshot', 'infernooverdrive'];
				const boosted = ['attackorder', 'electroweb', 'drumbeating', 'skittersmack', 'pounce'];
				const cutMoves: string[] = ["aircutter", "airslash", "breakingswipe", "furycutter", "psychocut", "slash"];
				const hauntedMoves = ['ominouswind', 'phantomforce', 'shadowforce', 'trickortreat'];
				const nerfed = ['muddywater', 'surf'];
				if (move.type === 'Grass') {
					modifier *= 1.5;
				}
				if (move.type === 'Bug' && move.category === 'Special') {
					modifier *= 1.5;
				}
				if (boosted.includes(move.id)) {
					modifier *= 1.5;
				}
				if (nerfed.includes(move.id)) {
					modifier *= 0.5;
					const marshCounter = move.id === 'surf' ? 1 : 2;
					const currentCounter = this.field.terrainState.Tchanges?.get('swampterrain') ?? 0;
					if (currentCounter + marshCounter >= 3) {
						modifier *= 1.3;
					}
				}
				if (move.id === 'cut') {
					this.add('-message', 'A tree slammed down!');
					modifier *= 2;
				}
				if (cutMoves.includes(move.id)) {
					modifier *= 1.5;
				}
				if (igniteMoves.includes(move.id)) {
					modifier *= 1.3;
				}
				if (hauntedMoves.includes(move.id)) {
					modifier *= 1.3;
				}
				if (move.id === 'gravapple') {
					this.add('-message', 'The apple did not fall far from the tree.');
					modifier *= 1.5
				}
				return this.chainModify(modifier);
			},
			onAfterMove(source, target, move) {
				const igniteMoves = ['eruption', 'firepledge', 'flameburst', 'heatwave', 'incinerate', 'lavaplume', 'mindblown', 'searingshot', 'infernooverdrive'];
				const hauntedMoves = ['ominouswind', 'phantomforce', 'shadowforce', 'trickortreat'];
				const swampMoves = ['surf', 'muddywater']
				const currentCounter = this.field.terrainState.Tchanges?.get('swampterrain') ?? 0;
				if (igniteMoves.includes(move.id) && (this.field.weather !== 'raindance' || !this.field.getPseudoWeather('watersport'))){
					this.field.changeTerrain('burningterrain');
					return;
				}
				if (hauntedMoves.includes(move.id)) {
					this.field.changeTerrain('bewitchedwoodsterrain');
				}
				if (swampMoves.includes(move.id)) {
					const marshCounter = move.id === 'muddywater' ? 2 : 1;
					this.field.terrainState.Tchanges?.set('swampterrain', currentCounter + marshCounter);
					if (currentCounter + marshCounter >= 3) {
						this.add('-message', 'The forest floor became marshy!');
						this.field.changeTerrain('swampterrain');
					} else {
						this.add('-message', 'The ground became waterlogged...');
					}
				}
			},
			onFieldStart() {
				this.add('-fieldstart', 'Forest Terrain');
			},
			onFieldEnd() {
				this.add('-fieldend', 'Forest Terrain');
			}
		},
	},
	glitchterrain: {
		name: "Glitch Terrain",
		condition: {
			duration: 9999,
			onBasePowerPriority: 6,
			durationCallback(source, effect) {
				if (source.hasItem('amplifieldrock')) {
					return 8;
				}
				return 5;
			},
			onModifyCritRatio(critRatio, source, target) {
				if (source.getStat('spe', true, true) > target.getStat('spe', true, true))
					return critRatio + 1;
			},
			onNegateImmunity(pokemon, type) {
				if (type === 'Dragon' && pokemon.hasType('Fairy')) {
					return false;
				}
			},
			onModifyMove(move) {
				const Special = ['Grass', 'Fire', 'Water', 'Electric', 'Ice', 'Dragon', 'Ice', 'Dragon', 'Psychic', 'Dark'];
				const Physical = ['Normal', 'Fighting', 'Ghost', 'Poison', 'Bug', 'Flying', 'Ground', 'Rock', '???', 'Steel'];
				const nonexistant = ['Fairy'];
				if (move.category != 'Status') {
					if (nonexistant.includes(move.type)) {
						move.type = 'Normal';
					}
					if (Special.includes(move.type)) {
						move.category = 'Special';
					}
					if (Physical.includes(move.type)) {
						move.category = 'Physical';
					}
				}
			},
			onTryMove(target, source, move) {
				if (move.id === 'roar' || move.id === 'whirlwind') {
					this.add('-message', 'ERROR! MOVE NOT FOUND!');
					return null;
				}
			},
			onTryHit(target, source, move) {
				if (target.types.includes('Psychic') && move.type === 'Ghost') {
					this.add('-message', 'Ghosts forgot how to beat Psychics!');
					return null;
				}
			},
			onEffectiveness(typeMod, target, type, move) {
				if (move.type === 'Bug' && type === 'Poison') {
					return 1;
				}
				if (move.type === 'Poison' && type === 'Bug') {
					return 1;
				}
				if (move.type === 'Ice' && type === 'Fire') {
					return 0;
				}
				if (move.type === 'Dragon') {
					return 0;
				}
				if ((move.type === 'Ghost' || move.type === 'Dark') && type === 'Steel') {
					return -1;
				}
			},
			onBasePower(basePower, source, target, move) {
				if (move.type === 'Psychic') {
					this.add('-message', '.0P pl$ nerf!-//');
					return this.chainModify(1.2);
				}
			},
			onAfterMove(source, target, move) {
				if (!target.hp && move.flags['recharge']) {
					this.add('-message', 'The glitched terrain allowed the move to recharge from the fallen pokemon');
					source.removeVolatile('mustrecharge')
				}
			},
			onFieldStart() {
				this.add('-fieldstart', 'Glitch Terrain');
				this.add('-message', '1n!taliz3 .b//////attl3');
			},
			onFieldEnd() {
				this.add('-fieldend', 'Glitch Terrain');
			},
		}
	},
	hauntedterrain:{
		name: "Haunted Terrain",
		condition: {
			onNegateImmunity(pokemon, type) {
				if (pokemon.hasType('Normal') && type === 'Ghost') return false;
			},
			onEffectiveness(typeMod, target ,type, move) {
				const move_types = move.types !== undefined ? move.types : [move.type];
				if (type === 'Normal' && move_types.includes('Ghost')) {
					if (move.types === undefined) {
						return 0;
					}
					return 0 + this.dex.getEffectiveness(move_types.filter(type => type !== 'Normal'), type);
				}
			},
			onBasePower(basePower, source, target, move){
				let modifier = 1;
				const wispMoves = ['firespin', 'flameburst', 'flamecharge', 'inferno'];
				const booMoves = ['astonish', 'boneclub', 'bonerush', 'bonemerang'];
				const blessedMoves = ['judgement', 'originpulse', 'purify', 'sacredfire', 'dazzlinggleam', 'flash'];
				if(move.type === 'Ghost'){
					modifier *= 1.5;
					this.add('-message', 'The evil aura powered up the attack!');
				}				
				if(wispMoves.includes(move.id)){
					modifier *= 1.5;
					this.add('-message', 'Will-o\'-wisps joined the attack...');
				}
				if(booMoves.includes(move.id)){
					modifier *= 1.5;
					this.add('-message', 'Boo!');
				}
				if(blessedMoves.includes(move.id)){
					modifier *= 1.3;
				}
				if(move.id === 'shadowbone'){
					modifier *= 1.2;
					this.add('-message', 'Spooky scary skeletons!');
				}
				return this.chainModify(modifier);
			},
			onAfterMove(source, target, move){
				const blessedMoves = ['judgement', 'originpulse', 'purify', 'sacredfire', 'dazzlinggleam', 'flash'];
				if(blessedMoves.includes(move.id)){
					this.field.changeTerrain('holyterrain');
					this.add('-message', 'The evil spirits have been exorcised!');
				}
			},
			onResidual(pokemon) {
				if (pokemon.getStatus().id == 'slp') {
					this.damage(pokemon.baseMaxhp / 16, pokemon);
					this.add('-message', pokemon.name + "'s dream is corrupted by the evil spirits!")
				}
			},
			onFieldStart() {
				this.add('-fieldstart', 'Haunted Terrain');
				this.add('-message', 'Evil spirits gathered!');
			},
			onFieldEnd() {
				this.add('-fieldend', 'Haunted Terrain');
			}
		}
	},
	holyterrain: {
		name: "Holy Terrain",
		condition: {
			duration: 9999,
			onModifyMove(move) {
				if (!move.ignoreImmunity) move.ignoreImmunity = {};
				if (move.ignoreImmunity !== true && move.type === 'Normal') {
					move.ignoreImmunity['Normal'] = true;
				}
			},
			onEffectiveness(typeMod, target ,type, move) {
				const move_types = move.types !== undefined ? move.types : [move.type];
				if ((type === 'Ghost' || type === 'Dark') && move_types.includes('Normal')) {
					if (move.types === undefined) {
						return 1;
					}
					return 1 + this.dex.getEffectiveness(move_types.filter(type => type !== 'Normal'), type);
				}
			},
			onTryHit(target, source, move) {
				if (target !== source && target.isAlly(source) && move.category !== 'Status') {
					return null;
				}
			},
			onBasePowerPriority: 6,
			onBasePower(basePower, source, target, move) {
				let modifier = 1;
				const strong_boost = ["mysticalfire", "magicalleaf", "ancientpower", "judgment", "sacredfire", "extremespeed", "sacredsword", "return"];
				const boost = ["psystrike", "aeroblast", "originpulse", "doomdummy", "mistball", "crushgrip", "lusterpurge", "secretsword", "psychoboost", "relicsong", "spacialrend", "hyperspacehole", "roaroftime", "landswrath", "precipiceblades", "dragonascent", "moongeistbeam", "sunsteelstrike", "prismaticlaser", "fleurcannon", "diamondstorm", "genesissupernova", "searingsunrazesmash", "menacingmoonrazemaelstrom"];
				const hauntedMoves = ['ominouswind', 'phantomforce', 'shadowforce', 'spectralscream', 'trickortreat'];
				if ((move.type === 'Fairy' || move.type === 'Normal') && move.category === 'Special') {
					this.add('-message', 'The holy energy resonated with the attack!');
					modifier *= 1.5;
				}
				if (move.type === 'Dragon' || move.type === 'Psychic') {
					this.add('-message', 'The legendary energy resonated with the attack!');
					modifier *= 1.2;
				}
				if (move.type === 'Ghost' || (move.category === 'Special' && move.type === 'Dark')) {
					this.add('-message', 'The attack was cleansed...');
					modifier *= 0.5;
				}
				if (strong_boost.includes(move.id)) {
					if (move.id === 'extremespeed') {
						this.add('-message', 'Godspeed!');
					}
					else {
						this.add('-message', 'The holy energy resonated with the attack!');
					}
					modifier *= 1.5;
				}
				if(hauntedMoves.includes(move.id) || (move.id === 'curse' && source.types.includes('Ghost'))){
					modifier *= 1.3;
				}
				if (boost.includes(move.id)) {
					this.add('-message', 'Legendary power accelerated the attack!');
					modifier *= 1.3;
				}
				return this.chainModify(modifier);
			},
			onAfterMove(source, target, move){
				const hauntedMoves = ['ominouswind', 'phantomforce', 'shadowforce', 'spectralscream', 'trickortreat'];
				if(hauntedMoves.includes(move.id) || (move.id === 'curse' && source.types.includes('Ghost'))){
					this.field.changeTerrain('hauntedterrain');
				}
			},
			onFieldStart() {
				this.add('-fieldstart', 'Holy Terrain');
				this.add('-message', 'Benedictus Sanctus Spiritus...');
			},
			onFieldEnd() {
				this.add('-fieldend', 'Holy Terrain');
			}
		},
	},
	icyterrain: {
		name: "Icy Terrain",
		condition: {
			duration: 9999,
			onBasePowerPriority: 6,
			onModifyDef(def, pokemon) {
				if (pokemon.types.includes('Ice') && this.field.isWeather('hail')) {
					return this.chainModify(1.5);
				}
			},
			onModifyMove(move, pokemon) {
				const speedMoves = ['accelerock', 'aquajet', 'bulletpunch', 'extremespeed', 'fakeout', 'firstimpression', 'machpunch', 'quickattack', 'shadowsneak', 'suckerpunch', 'defemsecurl', 'feint', 'lunge', 'rollout', 'steamroller'];
				if (speedMoves.includes(move.id) && pokemon.isGrounded()) {
					move.selfBoost = {
						boosts: {
							spe: 1
						}
					};
				}
				if (move.type === 'Rock') {
					move.types = [move.type, 'Ice'];
				}
			},
			onBasePower(basePower, source, target, move) {
				let modifier = 1;
				const igniteMoves = ['eruption', 'firepledge', 'flameburst', 'heatwave', 'incinerate', 'lavaplume', 'mindblown', 'searingshot', 'infernooverdrive'];
				const watersurfaceMoves = ['bulldoze', 'earthquake', 'fissure', 'magnitude', 'tectonicrage'];
				if (move.type === 'Ice') {
					this.add('-message', 'The cold strengthened the attack!');
					modifier *= 1.5;
				}
				if (move.type === 'Fire') {
					this.add('-message', 'The cold softened the attack...');
					modifier *= 0.5;
				}
				if (move.id === 'scald' || move.id === 'steameruption' || move.id === 'hydrosteam') {
					this.add('-message', 'The cold softened the attack...');
					modifier *= 0.5;
					if (this.field.terrainState.Tchanges?.get('watersurfaceterrain') == 1) {
						modifier *= 1.3;
					}
				}
				if (move.id === 'snipeshot') {
					this.add('-message', 'The cold air crystallized the missile');
					modifier *= 1.2
				}
				if (move.id === 'bittermalice') {
					modifier *= 1.5;
				}
				if (igniteMoves.includes(move.id) || (this.field.terrainStack[1]?.id === 'watersurfaceterrain' && watersurfaceMoves.includes(move.id))) {
					modifier *= 1.3;
				}
				return this.chainModify(modifier);
			},
			onAfterMove(source, target, move) {
				const igniteMoves = ['eruption', 'firepledge', 'flameburst', 'heatwave', 'incinerate', 'lavaplume', 'mindblown', 'searingshot', 'infernooverdrive'];
				const watersurfaceMoves = ['bulldoze', 'earthquake', 'fissure', 'magnitude', 'tectonicrage'];
				if ((this.field.terrainStack[1]?.id === 'watersurfaceterrain' && watersurfaceMoves.includes(move.id))) {
					this.add('-message', 'The ice went away!');
					this.field.changeTerrain('watersurfaceterrain');
					return;
				} else if (igniteMoves.includes(move.id)) {
					this.add('-message', 'The ice melted!');
					this.field.changeTerrain(this.field.terrainState?.prevTerrain ?? 'watersurfaceterrain');
					return;
				}
				if (watersurfaceMoves.includes(move.id) && this.field.terrainStack[1]?.id !== 'watersurfaceterrain') {
					for (const sides of this.sides) {
						sides.addSideCondition('spikes');
					}
				}
			},
			onFieldStart() {
				this.add('-fieldstart', 'Icy Terrain');
			},
			onFieldEnd() {
				this.add('-fieldend', 'Icy Terrain');
			}
		}
	},
	inverseterrain: {
		name: "Inverse Terrain",
		condition: {
			duration: 9999,
			durationCallback(target, source, effect) {
				if (effect?.id.includes("topsy")) {
					if (source.hasItem('amplifieldrock'))
						return 6;
					else
						return 3;
				}
				else{
					this.add("Not sure how this happened, please let Ternimus know");
					return 5;
				}
			},
			onNegateImmunity(pokemon, type) {
				if(pokemon.hasType('Ground') && this.activeMove?.id === 'thunderwave'){
					return true;
				}
				return false;	
			},
			onEffectivenessPriority: 1,
			onEffectiveness(typeMod, target, type, move) {
				// The effectiveness of Freeze Dry on Water isn't reverted
				if (move && move.id === 'freezedry' && type === 'Water') return;
				if (move && !this.dex.getImmunity(move, type)) return 1;
				return -typeMod;
			},
			onFieldStart() {
				this.add('-fieldstart', 'Inverse Terrain');
			},
			onFieldEnd() {
				this.add('-fieldend', 'Inverse Terrain');
			},
		}
	},
	mirrorarenaterrain: {
		name: "Mirror Arena Terrain",
		condition: {
			duration: 9999,
			onBasePowerPriority: 6,
			onSwitchIn(pokemon) {
				if (pokemon.hasItem('brightpowder') || pokemon.hasItem('laxincense')) {
					this.boost({ evasion: 1 }, pokemon);
				}
				if (pokemon.hasItem('zoomlens') || pokemon.hasItem('widelens')) {
					this.boost({ accuracy: 1 }, pokemon);
					pokemon.addVolatile('laserfocus');
				}
			},
			onModifyCritRatio(critRatio, source, target) {
				let boost = 0;
				const targetacc = target.boosts.accuracy;
				const targeteva = target.boosts.evasion;
				const sourceacc = source.boosts.accuracy;
				const sourceeva = source.boosts.evasion;
				if (targetacc < 0) {
					boost += targetacc;
				}
				if (targeteva < 0) {
					boost += targeteva;
				}
				if (sourceacc > 0) {
					boost += sourceacc;
				}
				if (sourceeva > 0) {
					boost += sourceeva;
				}
				return critRatio + boost;
			},
			onModifyMovePriority: -6,
			onModifyMove(move, pokemon, target) {
				let reflected = false;
				const reflectedmoves = ['mirrorshot', 'aurorabeam', 'dazzlinggleam', 'flashcannon', 'doomdesire', 'lusterpurge', 'photongeyser', 'prismaticlaser', 'signalbeam', 'technoblast', 'lightthatburnsthesky']; 
				if (target && target.boosts.evasion > 0) {
					reflected = true;
				}
				if ((move.category === 'Special' && (move.target === 'normal' || pokemon.foes().length === 1) && !move.flags.contact && reflected) || reflectedmoves.includes(move.id)) {
					move.accuracy = true;
				}
			},
			onBasePower(basePower, source, target, move) {
				let modifier = 1;
				let isevasion = false;
				const evasionshredder = ['bubblebeam', 'chargebeam', 'fleurcannon', 'hyperbeam', 'icebeam', 'originpulse', 'moongeistbeam', 'psybeam', 'solarbeam', 'triattack'];
				const minievasionshredder = ['aurorabeam', 'dazzlinggleam', 'flashcannon', 'doomdesire', 'lusterpurge', 'photongeyser', 'prismaticlaser', 'signalbeam', 'technoblast', 'lightthatburnsthesky']; 
				const mirrorbreak = ['boomburst', 'bulldoze', 'earthquake', 'explosion', 'fissure', 'hypervoice', 'magnitude', 'selfdestruct', 'tectonicrage'];
				if (target.boosts.evasion > 0) {
					isevasion = true;
				}
				if (isevasion && evasionshredder.includes(move.id)) {
					modifier *= 2;
				}
				if (move.id === 'mirrorshot') {
					this.add('-message', 'The mirrors strengthened the attack!');
					modifier *= 2;
				}
				if (minievasionshredder.includes(move.id)) {
					this.add('-message', 'The reflected light was blinding!');
					modifier *= 1.5;
				}
				if (mirrorbreak.includes(move.id)) {
					modifier *= 1.3;
				}
				return this.chainModify(modifier);
			},
			onMiss(source, target, move) {
				if (move.category === 'Physical' && move.flags.contact) {
					this.damage(source.baseMaxhp / 4, source);
					if (source.boosts.evasion > 0) {
						this.boost({ evasion: -1 }, source);
					}
				}
			},
			onAfterMove(source, target, move) {
				const mirrorbreak = ['boomburst', 'bulldoze', 'earthquake', 'explosion', 'fissure', 'hypervoice', 'magnitude', 'selfdestruct', 'tectonicrage'];
				if (mirrorbreak.includes(move.id)) {
					for (const side of this.sides) {
						for (const pokemon of side.active) {
							if (!pokemon.isSemiInvulnerable() && !(pokemon.hasAbility('shellarmor') || pokemon.hasAbility('battlearmor')) && !(pokemon.isProtected() || pokemon.volatiles['wideguard'] || pokemon.volatiles['endure'])) {
								this.damage(pokemon.baseMaxhp / 2, pokemon);
							}
						}
					}
					this.field.clearTerrain();
				}
			},
			onFieldStart() {
				this.add('-fieldstart', 'Mirror Arena Terrain');
			},
			onFieldEnd() {
				this.add('-fieldend', 'Mirror Arena Terrain');
			},
		}
	},
	mountainterrain: {
		name: "Mountain Terrain",
		condition: {
			duration: 9999,
			onBasePowerPriority: 6,
			onBasePower(basePower, source, target, move) {
				const moveToMessageMap: Map<string, string> = new Map([
					["vitalthrow", target.name + " was thrown partway down the mountain!"],
					["circlethrow", target.name + " was thrown partway down the mountain!"],
					["stormthrow", target.name + " was thrown partway down the mountain!"],
					["mountaingale", "The whole mountain is moving!"],
					["thunder", "The mountain strengthened the attack!"],
					["eruption", "The mountain strengthened the attack!"],
					["avalanche", "The mountain strengthened the attack!"],
					["hypervoice", "Yodelayheehoo~"],
				]);
				if (moveToMessageMap.has(move.id)) {
					this.add('-message', moveToMessageMap.get(move.id));
				}
				let modifier = 1;
				const boost = ["vitalthrow", "circlethrow", "stormthrow", "ominouswind", "icywind", "silverwind", "twister", "razorwind", "fairywind", "thunder", "eruption", "avalanche", "hypervoice", "mountaingale"];
				const wind_boost = ["ominouswind", "icywind", "silverwind", "twister", "razorwind", "fairywind", "gust", "bleakwindstorm", "sandsearstorm", "wildboltstorm"];
				const snow = ['blizzard', 'glaciate', 'subzeroslammer'];
				if (move.type === 'Rock' || move.type === 'Flying') {
					this.add('-message', 'The field strengthened the move\'s ' + move.type + ' typing');
					modifier *= 1.5;
				}
				if (boost.includes(move.id)) {
					modifier *= 1.5;
				}
				if (this.field.weather === 'deltastream') {
					if (wind_boost.includes(move.id)) {
						this.add('-message', 'The wind strengthened the attack!');
						modifier *= 1.5;
					}
					if (move.category === 'Special' && move.type === 'Flying') {
						modifier *= 1.5;
					}
				}
				if (snow.includes(move.id)) {
						modifier *= 1.3;
				}
				return this.chainModify(modifier);
			},
			onAfterMove(source, target, move) {
				const snow = ['blizzard', 'glaciate', 'subzeroslammer'];
				if (snow.includes(move.id)) {
					this.add('-message', 'The mountain was covered in snow!');
					this.field.changeTerrain('snowymountainterrain');
				}
			},
			onFieldResidual() {
				if (this.field.weather === 'hail') {
					this.field.terrainState.hail === undefined ? this.field.terrainState.hail = 0 : this.field.terrainState.hail += 1;
				}
				else {
					this.field.terrainState.hail = 0;
				}
				if (this.field.terrainState?.hail === 2) {
					this.add('-message', 'The mountain was covered in snow!');
					this.field.changeTerrain('snowymountainterrain');
				}
			},
			onFieldStart() {
				this.add('-fieldstart', 'Mountain Terrain');
				this.add('-message', 'Adieu to disappointment and spleen; What are men to rocks and mountains?')
			},
			onFieldEnd() {
				this.add('-fieldend', 'Mountain Terrain');
			},
		}
	},
	murkwatersurfaceterrain: {
		name: "Murkwater Surface Terrain",
		condition: {
			duration: 9999,
			onBasePowerPriority: 6,
			onModifySpe(spe, pokemon) {
				let immune = ['surgesurfer', 'swiftswim', 'limber'];
				if ((!pokemon.hasType('Water') || !immune.includes(pokemon.ability)) && pokemon.isGrounded()) {
					return this.chainModify(0.75);
				}
			},
			onModifyMove(move) {
				const waterpoisonMoves = ['mudbomb', 'mudshot', 'mudslap', 'thousandwaves'];
				if (move.type === 'Water' || waterpoisonMoves.includes(move.id)) {
					move.types = ['Water', 'Poison'];
					move.type = 'Water';
				}
				if (move.id === 'smackdown' || move.id === 'appleacid') {
					move.types = [move.type, 'Poison'];
				}
				if (move.id === 'sludgewave') {
					move.types = [move.type, 'Water']
				}
			},
			onTryMove(source, target, move) {
				if ((move.type === 'Ground' && move.category !== 'Status') || move.id === 'sandattack') {
					return false;
				}
			},
			onBasePower(basePower, source, target, move) {
				let modifier = 1;
				const strengthenedMoves = ['mudbomb', 'mudshot', 'mudslap', 'thousandwaves', 'acid', 'acidspray', 'brine', 'smackdown', 'wavecrash', 'appleacid'];
				const change = ['whirlpool', 'blizzard', 'subzeroslammer', 'glaciate'];
				if (move.type === 'Water') {
					this.add('-message', 'The water move was aided by the poison!')
					modifier *= 1.5;
				}
				if (move.type === 'Poison') {
					this.add('-message', 'The poison in the move was supercharged!')
					modifier *= 1.5;
				}
				if (move.type === 'Electric' && target.isGrounded()) {
					modifier *= 5325 / 4096
				}
				if (strengthenedMoves.includes(move.id)) {
					if (move.id === 'wavecrash') {
						this.add('-mesage', 'A toxic wave crashes down!');
					}
					else if (move.id === 'brine') {
						this.add('-message', 'Stinging!');
					}
					else {
						this.add('-message', 'The toxic water strengthened the attack!');

					}
					modifier *= 1.5;
				}
				if (change.includes(move.id)) {
					modifier *= 5325 / 4096;
				}
				return this.chainModify(modifier);
			},
			onAfterMove(source, target, move) {
				const icy = ['blizzard', 'subzeroslammer', 'glaciate'];
				if (move.id === 'whirlpool') {
					this.add('-message', 'The maelstrom flushed out the poison!');
					this.field.changeTerrain('watersurfaceterrain');
					return;
				}
				if (icy.includes(move.id)) {
					this.add('-message', 'The toxic water froze over!');
					this.field.changeTerrain('icyterrain');
					return;
				}
			},
			onResidual(pokemon) {
				const immune = ['immunity', 'magicguard', 'poisonheal', 'toxicboost', 'wondergaurd', 'pastelveil', 'surgesurfer'];
				const weak = ['dryskin', 'flamebody', 'magmaarmor', 'waterabsorb'];
				if (!immune.includes(pokemon.ability) && !pokemon.hasType(['Poison', 'Steel']) && pokemon.isGrounded()) {
					let typeMod = this.clampIntRange(this.dex.getEffectiveness('Poison', pokemon.types), -6, 6);
					let damage = this.clampIntRange(pokemon.baseMaxhp / 8 * Math.pow(2, typeMod), 1);
					if (pokemon.volatiles['dive']) {
						damage *= 4;
					}
					if (weak.includes(pokemon.ability)) {
						this.damage(damage * 2, pokemon);
					}
					else {
						this.damage(damage, pokemon);
					}
				}
			},
			onFieldStart() {
				this.add('-fieldstart', 'Murkwater Surface Terrain');
			},
			onFieldEnd() {
				this.add('-fieldend', 'Murkwater Surface Terrain');
			},
		}
	},
	newworldterrain: {
		name: "New World Terrain",
		condition: {
			onModifySpe(spe, pokemon) {
				if (pokemon.isGrounded() && !pokemon.hasAbility('limber')) {
					return this.chainModify(0.75);
				}
			},
			onModifyDef(def, pokemon) {
				if (!pokemon.isGrounded()) {
					return this.chainModify(0.9);
				}
			},
			onModifySpD(spd, pokemon) {
				if (!pokemon.isGrounded()) {
					return this.chainModify(0.9);
				}
			},
			onBasePowerPriority: 6,
			onBasePower(basePower, source, target, move) {
				let modifier = 1;
				const boost: string[] = ["aurorabeam", "signalbeam", "flashcannon", "dazzlinggleam", "mirrorshot", "photongeyser", "psystrike", "aeroblast", "sacredfire", "mistball", "lusterpurge", "originpulse", "precipiceblades", "dragonascent", "psychoboost", "roaroftime", "magmastorm", "crushgrip", "judgment", "seedflare", "shadowforce", "searingshot", "vcreate", "secretsword", "sacredsword", "relicsong", "fusionbolt", "fusionflare", "iceburn", "freezeshock", "boltstrike", "blueflare", "technoblast", "oblivionwing", "landswrath", "thousandarrows", "thousandwaves", "diamondstorm", "steameruption", "coreenforcer", "fleurcannon", "prismaticlaser", "sunsteelstrike", "spectralthief", "moongeistbeam", "multiattack", "mindblown", "plasmafists", "earthpower", "powergem", "eruption", "continentalcrush", "genesissupernova", "soulstealing7starstrike", "searingsunrazesmash", "menacingmoonrazemaelstrom", "astralbarrage", "behemothbash", "behemothblade", "collisioncourse", "doubleironbash", "dragonenergy", "dynamaxcannon", "electrodrift", "eternabeam", "fierywrath", "glaciallance", "ruination", "freezingglare", "terastarstorm", "surgingstrikes", "malignantchain", "tachyoncutter", "mightycleave", "hydrosteam", "thunderclap", "ivycudgel", "psyblade", "sandsearstorm", "wildboltstorm", "springtidestorm", "thundercage", "thunderouskick", "wickedblow"];
				const strong_boost: string[] = ["vacuumwave", "dracometeor", "meteormash", "moonblast", "cometpunch", "swift", "meteorbeam", "hyperspacehole", "spacialrend", "hyperspacefury", "ancientpower", "futuredummy", "blackholeeclipse"];
				const weak_nerf = ['bulldoze', 'earthquake', 'magnitude'];
				if (boost.includes(move.id)) {
					this.add('-message', 'The ethereal energy strengthened the attack!');
					modifier *= 1.5;
				}
				if (strong_boost.includes(move.id)) {
					this.add('-message', 'The light shone through the infinite darkness!');
					modifier *= 2;
				}
				if (move.id === 'doomdesire') {
					this.add('-message', 'A star came crashing down on ' + target.name);
					modifier *= 4;
				}
				if (weak_nerf.includes(move.id)) {
					this.add('-message', 'The unformed land diffused the attack...');
					modifier *= 0.25;
				}
				if (move.type === 'Dark') {
					modifier *= 1.5;
					this.add('-message', 'Infinity boosted the attack!');
				}
				return this.chainModify(modifier);
			},
			onAfterMove(source, target, move) {
				if (move.id === 'gravity' || move.id === 'geomancy') {
					this.add('-message', 'The world\'s matter reformed!');
					this.field.changeTerrain('starlightarenaterrain', source, move);
				}
			},

			onFieldStart(field, source, effect) {
				if (this.field.weather !== '') {
					this.field.clearWeather();
				}
				if (effect?.effectType === 'Ability') {
					this.add('-fieldstart', 'New World Terrain', '[from] ability: ' + effect, '[of] ' + source);
				} else {
					this.add('-fieldstart', 'New World Terrain');
				}
				this.add('-message', 'From darkness, from stardust. From memories of eons past and visions yet to come...')
			},
			onFieldEnd() {
				this.add('-fieldend', 'New World Terrain');
			},
		}
	},
	rainbowterrain: {
		name: "Rainbow Terrain",
		condition: {
			duration: 9999,
			onBasePowerPriority: 6,
			durationCallback(target, source, effect) {
				console.log(effect);
				if (effect?.id.includes("pledge")) {
					if (source.hasItem('amplifieldrock'))
						return 7;
					else
						return 4;
				}
				else if(effect?.id == 'raindance' || effect?.id == 'sunnyday'){
					return this.field.weatherState.duration ?? 5;
				}
				else{
					return 5;
				}
			},
			onModifyMove(move, pokemon) {
				if (move.secondaries && move.id !== 'secretpower' && !pokemon.hasAbility('serenegrace')) {
					this.debug('doubling secondary chance');
					for (const secondary of move.secondaries) {
						if (secondary.chance) secondary.chance *= 2;
					}
					if (move.self?.chance) move.self.chance *= 2;
				}
			},
			onBasePower(basePower, source, target, move) {
				let modifier = 1;
				let strengthenedMoves = ['aurorabeam', 'dazzlinggleam', 'dragonpulse', 'firepledge', 'fleurcannon', 'grasspledge', 'heartstamp', 'hiddenpower', 'judgement', 'mistball', 'moonblast', 'mysticalfire', 'prismaticlaser', 'relicsong', 'sacredfire', 'secretpower', 'silverwind', 'solarbeam', 'solarblade', 'sparklingaria', 'triattack', 'waterpledge', 'weatherball', 'zenheadbutt', 'oceanicoperetta', 'twinkletackle'];
				let weakenedMoves = ['darkpulse', 'nightdaze', 'neverendingnightmare', 'shadowball'];
				if (move.type === 'Normal' && move.category === 'Special') {
					this.add('-message', 'The rainbow augmented the boring, plain move and made it more interesting!');
					const types = ['Normal', 'Water', 'Fire', 'Grass', 'Fighting', 'Psychic', 'Bug', 'Flying', 'Ground', 'Dark', 'Fairy', 'Poison', 'Electric', 'Steel', 'Ghost', 'Dragon', 'Ice', 'Rock'];
					move.types = [move.type, this.sample(types)];
					modifier *= 1.5;
				}
				if (strengthenedMoves.includes(move.id)) {
					this.add('-message', 'The terrain strengthened the attack!');
					modifier *= 1.5;
				}
				if (weakenedMoves.includes(move.id)) {
					this.add('-message', ' The terrain weakened the attack!');
					modifier *= 0.5;
				}
				return this.chainModify(modifier);
			},
			onResidual(pokemon) {
				if (pokemon.status === 'slp' || pokemon.hasAbility('comatose') && !(pokemon.hasAbility('magicguard'))) {
					this.heal(pokemon.baseMaxhp / 16, pokemon);
				}
			},
			onFieldStart() {
				this.add('-fieldstart', 'Rainbow Terrain');
			},
			onFieldEnd() {
				this.add('-fieldend', 'Rainbow Terrain');
			},
		}
	},
	rockyterrain: {
		name: "Rocky Terrain",
		condition: {
			duration: 9999,
			durationCallback(target, source, effect) {
				if (effect?.id === 'splinteredstormshards') {
					return 2;
				}
				return 9999;
			},
			onBasePowerPriority: 6,
			onModifyMove(move) {
				const rockymoves = ['bulldoze', 'earthquake', 'magnitude', 'rockclimb', 'strength'];
				if (rockymoves.includes(move.id)) {
					move.types = [move.type, 'Rock'];
				}
			},
			onTryAddVolatile(status, pokemon) {
				if (status.id === 'flinch' && pokemon.boosts.def > 0) {
					this.add('-message', pokemon.name + ' won\'t flinch because of its bolstered Defenses!')
					return null;
				}
			},
			onTryHit(target, source, move) {
				if ((target.volatiles['substitute'] || target.boosts.def > 0) && move.flags['bullet']) {
					this.add('-message', 'The bullet-like move rebounded!');
					return null;
				}
			},
			onFlinch(pokemon) {
				if (!pokemon.hasAbility('steadfast') && !pokemon.hasAbility('sturdy')) {
					this.add('-message', 'The flinch caused the pokemon to smash into the rocks!');
					this.damage(pokemon.baseMaxhp / 4, pokemon);
				}
			},
			onBasePower(basePower, source, target, move) {
				let modifier = 1;
				const rockymoves = ['bulldoze', 'earthquake', 'magnitude', 'rockclimb', 'strength', 'accelerock'];
				if (move.type === 'Rock') {
					this.add('-message', 'The field strengthened the attack!');
					modifier *= 1.5;
				}
				if (move.id === 'rocksmash') {
					this.add('-message', 'SMASH\'D!');
					modifier *= 2;
				}
				if (rockymoves.includes(move.id)) {
					this.add('-message', 'The rocks strengthened the attack!');
					modifier *= 1.5;
				}
				return this.chainModify(modifier);
			},
			onAfterMove(source, target, move) {
				if (move.success === false && move.flags['contact'] && !source.hasAbility('rockhead')) {
					this.add('-message', 'The pokemon kept going and crashed into the rocks!')
					this.damage(source.baseMaxhp / 8, source, source);
				}
			},
			onFieldStart() {
				this.add('-fieldstart', 'Rocky Terrain');
			},
			onFieldEnd() {
				this.add('-fieldend', 'Rocky Terrain');
			}
		}
	},
	shortcircuitterrain: {
		name: "Short-Circuit Terrain",
		condition: {
			duration: 9999,
			onBasePowerPriority: 6,
			onModifyMove(move) {
				const electrified = ['flashcannon', 'geargrind', 'gyroball', 'magnetbomb', 'muddywater', 'surf', 'steelbeam', 'doubleironbash'];
				if (electrified.includes(move.id)) {
					move.types = [move.type, 'Electric'];
				}
			},
			onBasePower(basePower, source, target, move) {
				let modifier = 1;
				const multiplier = [0.8, 1.5, 0.5, 4915 / 4096, 2.0];
				const text = ['Bzzt', 'Bzzapp!', 'Bzt...', 'Bzap!', 'BZZZAPP!'];
				const electrified = ['flashcannon', 'geargrind', 'gyroball', 'magnetbomb', 'muddywater', 'surf'];
				const boosted = ['dazzlinggleam', 'hydrovortex', 'infernalparade'];
				const shadow = ['darkpulse', 'nightdaze', 'nightslash', 'shadowball', 'shadowbone', 'shadowclaw', 'shadowforce', 'shadowpunch', 'shadowsneak'];
				const nerfed = ['lightthatburnsthesky'];
				const fieldchange = ['chargebeam', 'discharge', 'iondeluge', 'paraboliccharge', 'wildcharge', 'gigavolthavoc', 'risingvoltage'];
				if (move.id === 'steelbeam') {
					modifier *= 1.666666;
				}
				if (electrified.includes(move.id)) {
					modifier *= 1.5;
				}
				if (boosted.includes(move.id)) {
					modifier *= 1.5;
				}
				if (shadow.includes(move.id)) {
					modifier *= 5325/4096;
				}
				if (nerfed.includes(move.id)) {
					modifier *= 0.5;
				}
				if (fieldchange.includes(move.id)) {
					modifier *= 1.3;
				}
				if (move.type === 'Electric') {
					modifier *= multiplier[this.ShortCircuitCounter];
					this.add('-message', text[this.ShortCircuitCounter]);
					this.ShortCircuitCounter += 1;
					this.ShortCircuitCounter = this.ShortCircuitCounter % 5;
				}
				return this.chainModify(modifier);
			},
			onAfterMove(source, target, move) {
				const fieldchange = ['discharge', 'chargebeam', 'iondeluge', 'paraboliccharge', 'wildcharge', 'gigavolthavoc', 'risingvoltage']
				if (fieldchange.includes(move.id) && !(this.lastMoveMissed && target.isSemiInvulnerable())) {
					this.field.changeTerrain('factoryterrain');
				}
			},
			onFieldStart() {
				this.add('-fieldstart', 'Short-Circuit Terrain');
			},
			onFieldEnd() {
				this.add('-fieldend', 'Short-Circuit Terrain');
			},
		},
	},
	snowymountainterrain: {
		name: "Snowy Mountain Terrain",
		condition: {
			duration: 9999,
			onModifyMove(move) {
				if (move.type === 'Rock') {
					move.types = ['Rock', 'Ice'];
				}
			},
			onBasePowerPriority: 6,
			onBasePower(basePower, source, target, move) {
				const moveToMessageMap: Map<string, string> = new Map([
					["vitalthrow", "{1} was thrown partway down the mountain!"],
					["circlethrow", "{1} was thrown partway down the mountain!"],
					["stormthrow", "{1} was thrown partway down the mountain!"],
					["avalanche", "The snow strengthened the attack!"],
					["powdersnow", "The snow strengthened the attack!"],
					["icywind", "The frigid wind strengthened the attack!"],
					["hypervoice", "Yodelayheehoo~"],
				]);
				if (moveToMessageMap.has(move.id)) {
					this.add('-message', moveToMessageMap.get(move.id));
				}
				let modifier = 1;
				const boost_types = ['Rock', 'Ice', 'Flying'];
				const boost = ["vitalthrow", "circlethrow", "stormthrow", "ominouswind", "silverwind", "twister", "razorwind", "fairywind", "avalanche", "powdersnow", "hypervoice", "glaciate"];
				const wind_boost = ["ominouswind", "icywind", "silverwind", "twister", "razorwind", "fairywind", "gust", "bleakwindstorm", "sandsearstorm", "wildboltstorm"];
				const igniteMoves = ['eruption', 'explosion', 'firepledge', 'flameburst', 'heatwave', 'incinerate', 'lavaplume', 'mindblown', 'searingshot', 'selfdestruct', 'infernooverdrive'];
				if (boost_types.includes(move.type)) {
					this.add('-message', 'The field strengthened the move\'s ' + move.type + ' typing');
					modifier *= 1.5;
				}
				if (boost.includes(move.id)) {
					modifier *= 1.5;
				}
				if (move.type === 'Fire') {
					this.add('-message', 'The cold softened the attack');
					modifier *= 0.5;
				}
				if (move.id === 'scald' || move.id === 'steameruption' || move.id === 'hydrosteam') {
					this.add('-message', 'The cold softened the attack...');
					modifier *= 0.5;
				}
				if (igniteMoves.includes(move.id)) {
					modifier *= 1.3;
				}
				if (this.field.weather === 'deltastream') {
					if (wind_boost.includes(move.id)) {
						this.add('-message', 'The wind strengthened the attack!');
						modifier *= 1.5;
					}
					if (move.category === 'Special' && move.type === 'Flying') {
						this.add('-message', 'The wind strengthened the attack!');
						modifier *= 1.5;
					}
				}
				if (move.id === 'icywind') {
					modifier *= 2;
				}
				return this.chainModify(modifier);
			},
			onAfterMove(source, target, move) {
				const igniteMoves = ['eruption', 'explosion', 'firepledge', 'flameburst', 'heatwave', 'incinerate', 'lavaplume', 'mindblown', 'searingshot', 'selfdestruct', 'infernooverdrive'];
				if (igniteMoves.includes(move.id)) {
					this.add('-message', 'The snow melted away!');
					this.field.changeTerrain('mountainterrain');
				}
			},
			onFieldStart() {
				this.add('-fieldstart', 'Snowy Mountain Terrain');
				this.add('-message', 'The snow glows white on the mountain...');
			},
			onFieldEnd() {
				this.add('-fieldend', 'Snowy Mountain Terrain');
			},
		}
	},
	snowyterrain: {
		name: "Snowy Terrain",
		condition: {
			onModifySpe(spe, pokemon){
				const immuneAbiltiy = ['slushrush', 'icebody', 'snowcloak', 'limber']; 
				if(!(pokemon.hasType('Ice') || immuneAbiltiy.includes(pokemon.ability)) && pokemon.isGrounded()){
					return this.chainModify(0.75);
				}
			},
			onModifySpD(def, pokemon) {
				if (pokemon.hasType('Ice') && this.field.isWeather('hail')) {
					return this.chainModify(1.5);
				}
			},
			onModifyMove(move) {
				const slushMoves = ['bulldoze', 'earthquake', 'magnitude', 'mudbomb', 'mudshot', 'mudslap', 'sandtomb']
				if ((move.type === 'Steel' && move.category === 'Physical') || slushMoves.includes(move.id)) {
					move.types = [move.type, 'Ice'];
				}
			},
			onBasePowerPriority: 6,
			onBasePower(basePower, source, target, move) {
				let modifier = 1;
				const weak:string[] = ['scald', 'eruption', 'hydrosteam'];
				const boost: string[] = ["blizzard", "fairywind", "gust", "icywind", "ominouswind", "razorwind", "powdersnow", "silverwind", "twister", "mudslap", "mudshot", "mudbomb", 'chillingwater'];
				const secondBoost: string[] = ["aeroblast", "aircutter", "airslash", "bleakwindstorm", "chillingwater", "fairywind", "glaciate", "gust", "hurricane", "ominouswind", "razorwind", "silverwind", "twister"];
				const igniteMoves = ['eruption', 'explosion', 'firepledge', 'flameburst', 'heatwave', 'incinerate', 'lavaplume', 'mindblown', 'searingshot', 'selfdestruct', 'infernooverdrive'];
				if(weak.includes(move.id) || move.type === 'Fire'){
					this.add('-message', "The fire was doused by the snow!");
					modifier *= 0.5;
				}
				if(igniteMoves.includes(move.id)){
					modifier*= 1.3;
				}
				if (boost.includes(move.id) || (move.category === 'Special' && move.type == 'Flying')) {
					this.add('-message', 'The snowy terrain charged up the attack!');
					modifier *= 1.5;
				}
				if(secondBoost.includes(move.id)){
					this.add('-message', 'The snowy terrain charged up the attack!');						
					modifier *= 1.5;
				}
				return this.chainModify(modifier);
			},
			onAfterMove(source, target, move){
				const igniteMoves = ['eruption', 'explosion', 'firepledge', 'flameburst', 'heatwave', 'incinerate', 'lavaplume', 'mindblown', 'searingshot', 'selfdestruct', 'infernooverdrive'];
				if(igniteMoves.includes(move.id) && !this.field.getPseudoWeather('watersport')){
					this.field.clearTerrain();
				}
				if (move.id == 'powdersnow' ||(move.category === 'Special' && move.type === 'Flying')){
					for (const pokemon of this.getAllActive()) {
						this.boost({ accuracy: -1 }, pokemon, null, move, false, false);
					}
				}
				
			},
			onResidual(){
				if(this.field.weather === 'raindance'){
					this.field.changeWeather('hail');
				}
				if((this.field.weather === 'sunnyday' || this.field.weather === 'desolateland') && !this.field.getPseudoWeather('watersport')){
					if(this.field.terrainState?.Tchanges?.get('sun') == 1){
						this.field.clearTerrain();
					}
					else{
						this.field.terrainState?.Tchanges?.set('sun', 1);
					}
				}
			},
			onFieldStart(field, source, effect) {
				if (effect?.effectType === 'Ability') {
					this.add('-fieldstart', 'Snowy Terrain', '[from] ability: ' + effect, '[of] ' + source);
				} else {
					this.add('-fieldstart', 'Snowy Terrain');
				}
				this.add('-message', 'Snow swirls around the pokemon');
			},
			onFieldEnd() {
				this.add('-fieldend', 'Snowy Terrain');
			},
		}
	},
	starlightarenaterrain: {
		name: "Starlight Arena Terrain",
		condition: {
			onModifyMove(move) {
				if (move.type === 'Dark') {
					move.types = ['Dark', 'Fairy'];
				}
			},
			onBasePowerPriority: 6,
			onBasePower(basePower, source, target, move) {
				let modifier = 1;
				const boost: string[] = ["aurorabeam", "signalbeam", "flashcannon", "lusterpurge", "dazzlinggleam", "mirrorshot", "technoblast", "solarbeam", "photongeyser", "moonblast", "meteorbeam"];
				const strong_boost: string[] = ["dracometeor", "meteormash", "cometpunch", "spacialrend", "swift", "hyperspacehole", "hyperspacefury", "moongeistbeam", "sunsteelstrike", "blackholeeclipse", "searingsunrazesmash", "menacingmoonrazemaelstrom"];
				if (this.field.weather === '') {
					if (move.type === 'Dark' || move.type === 'Psychic') {
						this.add('-message', 'The field strengthened the attack!');
						modifier *= 1.5;
					}
					if (move.type === 'Fairy') {
						this.add('-message', 'Starlight supercharged the attack!');
						modifier *= 1.3;
					}
					if (move.id === 'doomdesire') {
						this.add('-message', 'A star came crashing down!');
						modifier *= 4;
					}
					if (boost.includes(move.id)) {
						this.add('-message', 'Starlight surged through the attack!');
						modifier *= 1.5;
					}
					if (strong_boost.includes(move.id)) {
						this.add('-message', 'The astral energy boosted the attack!');
						modifier *= 2;
					}
					return this.chainModify(modifier);
				}
			},
			onAfterMove(source, target, move) {
				if (source.volatiles['mustrecharge'] && source.volatiles['mustrecharge']?.sourceEffect.id === 'meteorassault') {
					source.removeVolatile('mustrecharge');
				}
			},
			onFieldStart(field, source, effect) {
				if (effect?.effectType === 'Ability') {
					this.add('-fieldstart', 'Starlight Arena Terrain', '[from] ability: ' + effect, '[of] ' + source);
				} else {
					this.add('-fieldstart', 'Starlight Arena Terrain');
				}
				this.add('-message', 'Starlight fills the battlefield.');
			},
			onFieldEnd() {
				this.add('-fieldend', 'Starlight Arena Terrain');
			},
		}
	},
	superheatedterrain: {
		name: "Super-Heated Terrain",
		condition: {
			duration: 9999,
			onBasePowerPriority: 6,
			onBasePower(basePower, source, target, move) {
				let modifier: number = 1;
				const scald = ['scald', 'steameruption'];
				const steam = ['muddywater', 'sparklingaria', 'surf', 'waterpledge', 'waterspout', 'hydrovortex', 'oceanicoperetta'];
				const igniteMoves = ['eruption', 'explosion', 'firepledge', 'flameburst', 'heatwave', 'incinerate', 'lavaplume', 'mindblown', 'searingshot', 'selfdestruct', 'infernooverdrive'];
				const freeze = ['blizzard', 'glaciate', 'subzeroslammer'];
				if (move.type === 'Fire') {
					this.add('-message', 'The attack was super-heated!');
					modifier *= 1.1;
				}
				if (move.type === 'Ice') {
					this.add('-message', 'The extreme heat softened the attack...');
					modifier *= 0.5;
				}
				if (move.type === 'Water' && !(scald.includes(move.id) || steam.includes(move.id))) {
					this.add('-message', 'The extreme heat softened the attack...');
					modifier *= 0.9;
				}
				if (scald.includes(move.id)) {
					this.add('-message', 'The field super-heated the attack!');
					modifier *= 1.5;
				}
				if (steam.includes(move.id)) {
					this.add('-message', 'Steam shot up from the field!');
					modifier *= 0.5625;
				}
				if (igniteMoves.includes(move.id) || freeze.includes(move.id)) {
					igniteMoves.includes(move.id) ? this.add('-message', 'The field combusted!') : this.add('-message', 'The field cooled off!');
					modifier *= 1.3;
				}
				return this.chainModify(modifier);
			},
			onAfterMove(source, pokemon, move) {
				const steam = ['muddywater', 'sparklingaria', 'surf', 'waterpledge', 'waterspout', 'watersport', 'hydrovortex', 'oceanicoperetta'];
				const igniteMoves = ['eruption', 'explosion', 'firepledge', 'flameburst', 'heatwave', 'incinerate', 'lavaplume', 'mindblown', 'searingshot', 'selfdestruct', 'infernooverdrive'];
				const freeze = ['blizzard', 'glaciate', 'subzeroslammer'];
				if (steam.includes(move.id)) {
					for (const pokemon of this.getAllActive()) {
						if (!pokemon.isSemiInvulnerable()) {
							this.boost({ accuracy: -1 }, pokemon, null, move, false, false);
						}
					}
				}
				if (igniteMoves.includes(move.id) && !(this.field.isWeather('rain') || this.field.getPseudoWeather('watersport'))) {
					this.field.changeTerrain('burningterrain');
					return;
				}
				if (freeze.includes(move.id)) {
					this.field.clearTerrain();
					return;
				}
			},
			onFieldResidual() {
				if (this.field.isWeather('hail') || this.field.isWeather('snow')) {
					this.field.clearWeather();
				}
			},
			onFieldStart() {
				this.add('-fieldstart', 'Super-Heated Terrain');
			},
			onFieldEnd() {
				this.add('-fieldend', 'Super-Heated Terrain');
			},
		}
	},
	swampterrain: {
		name: "Swamp Terrain",
		condition: {
			duration: 9999,
			onBasePowerPriority: 6,
			durationCallback(source, effect) {
				if (source.hasItem('amplifieldrock')) {
					return 7;
				}
				return 4;
			},
			onTryMove(target, source, effect) {
				if (['explosion', 'mindblown', 'selfdestruct'].includes(effect.id)) {
					this.attrLastMove('[still]');
					this.add('-message', 'The terrain stifled the move!');
					return false;
				}
			},
			onModifyMove(move) {
				const powderMoves = ['poisonpowder', 'stunspore', 'sleeppowder'];
				if (powderMoves.includes(move.id)) {
					move.accuracy = 100;
				}
				if (move.id === 'thousandarrows' || move.id === 'smackdown') {
					move.types = [move.type, 'Water'];
				}
				const boostSap = ['attackorder', 'strengthsap', 'stringshot'];
				const chosenBoost: SparseBoostsTable = {};
				let stats: Array<BoostID> = ['accuracy', 'evasion', 'spa', 'spe', 'spd', 'atk', 'def'];
				const randomStat = this.sample(stats);
				if (randomStat) chosenBoost[randomStat] = -1;
				if (boostSap.includes(move.id) || move.drain !== undefined) {
					move.secondaries = [];
					move.secondaries.push({
						chance: 100,
						boosts: chosenBoost,
					});
				}
			},
			onBasePower(basePower, source, target, move) {
				let modifier = 1;
				const strengthenedMoves = ['thousandarrows', 'smackdown', 'brine', 'gunkshot', 'mudbomb', 'mudshot', 'mudslap', 'muddywater', 'sludgewave', 'surf', 'hydrovortex'];
				const weakenedMoves = ['bulldoze', 'earthquake', 'magnitude'];
				const igniteMoves = ['eruption', 'firepledge', 'flameburst', 'heatwave', 'incinerate', 'lavaplume', 'mindblown', 'searingshot', 'infernooverdrive'];
				if (move.type === 'Poison' && target.isGrounded()) {
					modifier *= 1.5;
				}
				if (move.type === 'Bug') {
					this.add('-message', 'Bugs are swarming everywhere!');
					modifier *= 1.3;
				}
				if (move.type === 'Grass') {
					this.add('-message', 'Thick mangroves line the area!');
					modifier *= 1.3;
				}
				if (move.type === 'Water') {
					this.add('-message', 'The dampness strengthened the attack!');
					modifier *= 1.3;
				}
				if (move.type === 'Fire') {
					this.add('-message', 'The dampness weakened the flame...');
					modifier *= 0.8;
				}
				if (strengthenedMoves.includes(move.id)) {
					this.add('-message', 'The murk strengthened the attack!');
					modifier *= 1.5;
				}
				if (weakenedMoves.includes(move.id)) {
					this.add('-message', 'The attack dissipated in the soggy ground...');
					modifier *= 0.25;
				}
				if (igniteMoves.includes(move.id)) {
					const revertCounter = move.id === 'infernooverdrive' ? 2 : 1;
					const currentCounter = this.field.terrainState.Tchanges?.get('revertTerrain') ?? 0;
					if (currentCounter + revertCounter >= 3) {
						modifier *= 1.3;
					}
				}
				return this.chainModify(modifier);
			},
			onAfterMove(source, target, move) {
				const igniteMoves = ['eruption', 'firepledge', 'flameburst', 'heatwave', 'incinerate', 'lavaplume', 'mindblown', 'searingshot', 'infernooverdrive'];
				const currentCounter = this.field.terrainState.Tchanges?.get('revertTerrain') ?? 0;
				if (igniteMoves.includes(move.id)) {
					const revertCounter = move.id === 'infernooverdrive' ? 2 : 1;
					this.field.terrainState.Tchanges?.set('revertTerrain', currentCounter + revertCounter);
					if (currentCounter + revertCounter >= 3) {
						this.add('-message', 'The swamp tried up!');
						if (this.field.terrainState?.prevTerrain !== undefined) {
							this.field.changeTerrain(this.field.terrainState.prevTerrain);
						}
						else {
							this.field.clearTerrain();
						}
					} else {
						this.add('-message', 'The swamp is drying up...');
					}
				}
			},
			onResidual(pokemon) {
				let immune = ['quickfeet', 'swiftswim', 'clearbody', 'whitesmoke', 'fullmetalbody', 'myceliummight', 'propellertail', 'steamengine'];
				let trapMoves = ['infestation', 'spiderweb', 'leechseed', 'snaptrap'];
				if (pokemon.isGrounded() && (!immune.includes(pokemon.ability) || pokemon.hasItem('heavydutyboots'))) {
					if (pokemon.trapped) {
						this.boost({ spe: -2 }, pokemon);
					} else {
						this.boost({ spe: -1 }, pokemon);
					}
				}
				if ((pokemon.status === 'slp' || pokemon.hasAbility('comatose')) && !(pokemon.hasAbility('magicguard'))) {
					if (pokemon.trapped) {
						this.damage(pokemon.baseMaxhp / 8, pokemon);
					} else {
						this.damage(pokemon.baseMaxhp / 16, pokemon);
					}
				}
				if (trapMoves.includes(pokemon.volatiles['trapped']?.sourceEffect ?? '')) {
					const chosenBoost: SparseBoostsTable = {};
					let stats: Array<BoostID> = ['accuracy', 'evasion', 'spa', 'spe', 'spd', 'atk', 'def'];
					const randomStat = this.sample(stats);
					if (randomStat) chosenBoost[randomStat] = -1;
					this.boost(chosenBoost, pokemon, pokemon);
				}
				if (this.field.weather === 'sunnyday' || this.field.weather === 'desolateland') {
					const currentCounter = this.field.terrainState.Tchanges?.get('revertTerrain') ?? 0;
					const revertCounter = this.field.weather === 'sunnyday' ? 1 : 3;
					this.field.terrainState.Tchanges?.set('revertTerrain', currentCounter + revertCounter);
					if (currentCounter + revertCounter >= 3) {
						if (this.field.terrainState?.prevTerrain !== undefined) {
							this.field.changeTerrain(this.field.terrainState.prevTerrain);
						}
						else {
							this.field.clearTerrain();
						}
					}
				}
			},
			onFieldStart() {
				this.add('-fieldstart', 'Swamp Terrain');
			},
			onFieldEnd() {
				this.add('-fieldend', 'Swamp Terrain');
			},
		}
	},
	underwaterterrain: {
		name: "Underwater Terrain",
		condition: {
			duration: 9999,
			onBasePowerPriority: 6,
			onModifySpe(spe, pokemon) {
				const immune = ['swiftswim', 'steelworker'];
				if (!pokemon.getTypes().includes('Water') && !immune.includes(pokemon.ability) || !(pokemon.hasAbility('limber') && pokemon.isGrounded())) {
					return this.chainModify(0.5);
				}
			},
			onTryMove(source, target, move) {
				if (move.type === 'Fire') {
					return false;
				}
			},
			onModifyMove(move) {
				if (move.type === 'Ground' || move.id === 'dragondarts' || move.id === 'gravapple') {
					move.types = [move.type, 'Water'];
					
				}
			},
			onAccuracy(accuracy, target, source, move) {
				if (move.type === 'Electric' && typeof move.accuracy === 'number') {
					return true;
				}
			},
			onEffectiveness(typeMod, target, type, move) {
				const move_types = move.types !== undefined ? move.types : [move.type];
				if (type === 'Water' && move_types.includes('Water')) {
					if (move.types === undefined) {
						return 0;
					}
					return 0 + this.dex.getEffectiveness(move_types.filter(type => type !== 'Water'), type);
				}
			},
			onBasePower(basePower, source, target, move) {
				let modifier = 1;
				const change = ['bounce', 'dive', 'skydrop', 'fly', 'aciddownpour'];
				if (move.type === 'Electric') {
					modifier *= 2;
				}
				if (move.id === 'anchorshot' || move.id === 'dragondarts') {
					modifier *= 2;
				}
				if (move.id === 'waterpulse') {
					modifier *= 1.5;
				}
				if (move.type === 'Water') {
					modifier *= 1.5;
				}
				if (move.category === 'Physical' && move.type !== 'Water' && !source.hasAbility('steelworker')) {
					modifier *= 0.5;
				}
				if (change.includes(move.id) || (this.field.terrainState.Tchanges?.get('sludgewave') == 1 && move.id === 'sludgewave')) {
					modifier *= 1.3;
				}
				return this.chainModify(modifier);
			},
			onAfterMove(source, target, move) {
				const watersurface = ['bounce', 'dive', 'skydrop', 'fly',]
				const murkwater = ['sludgewave', 'aciddownpour'];
				if (watersurface.includes(move.id)) {
					this.field.changeTerrain('watersurfaceterrain');
					return;
				}
				if (murkwater.includes(move.id) && (move.id === 'aciddownpour' || this.field.terrainState.Tchanges?.get('sludgewave') == 1)) {
					for (const pokemon of this.getAllActive()) {
						if (!(pokemon.types.includes('Steel') || pokemon.types.includes('Poison')) && !pokemon.isSemiInvulnerable()) {
							pokemon.faint();
						}
					}
					this.field.changeTerrain('murkwatersurfaceterrain');
					return;
				}
				if (move.id === 'sludgewave') {
					this.field.terrainState.Tchanges?.set('sludgewave', 1);
				}
			},
			onResidual(pokemon) {
				let immune = ['magicguard', 'swiftswim', 'waterabsorb'];
				let weak = ['flamebody', 'magmaarmor'];
				if (!immune.includes(pokemon.ability)) {
					let typeMod = this.clampIntRange(this.dex.getEffectiveness('Water', pokemon.types), -6, 6);
					let damage = this.clampIntRange(pokemon.baseMaxhp / 8 * Math.pow(2, typeMod), 1);
					if (typeMod > 0) {
						if (weak.includes(pokemon.ability)) {
							this.damage(damage * 2, pokemon);
						}
						else {
							this.damage(damage, pokemon);
						}
					}
				}
			},
			onFieldStart(field, source, effect) {
				if (this.field.weather !== '') {
					this.field.clearWeather();
				}
				if (effect?.effectType === 'Ability') {
					this.add('-fieldstart', 'Underwater Terrain', '[from] ability: ' + effect, '[of] ' + source);
				} else {
					this.add('-fieldstart', 'Underwater Terrain');
				}
			},
			onFieldEnd() {
				this.add('-fieldend', 'Underwater Terrain');
			},
		}
	},
	wastelandterrain: {
		name: "Wasteland Terrain",
		condition: {
			duration: 9999,
			onBasePowerPriority: 6,
			onModifyMove(move) {
				const poisoned = ['mudbomb', 'mudshot', 'mudslap'];
				if (poisoned.includes(move.id)) {
					move.types = [move.type, 'Poison'];
				}
			},
			onBasePower(basePower, source, pokemon, move) {
				let modifier = 1;
				const boost = ['mudbomb', 'mudshot', 'mudslap', 'powerwhip', 'vinewhip'];
				const miniboost = ['gunkshot', 'octazooka', 'sludge', 'sludgebomb', 'sludgewave'];
				const weak = ['bulldoze', 'earthquake', 'magnitude'];
				if (boost.includes(move.id)) {
					this.add('-message', 'The waste joined the attack!');
					modifier *= 1.5;
				}
				if (miniboost.includes(move.id)) {
					this.add('-message', 'The waste did it for the vine!');
					modifier *= 1.2;
				}
				if (weak.includes(move.id)) {
					this.add('-message', 'Wibble-wibble wobble-wobb...');
					modifier *= 0.25;
				}
				if (move.id === 'spitup') {
					this.add('-message', 'BLEAAARGGGGH!');
					modifier *= 2;
				}
				return this.chainModify(modifier);
			},
			onResidual(pokemon) {
				if (this.field.terrainState.toxicspikes.includes(pokemon.side.id)) {
					this.add('-message', '...Poison needles shot up from the ground!');
					if (!(pokemon.hasType('Steel') || pokemon.hasType('Poison')) && pokemon.isGrounded() && !pokemon.isSemiInvulnerable()) {
						pokemon.trySetStatus('psn');
						this.damage(pokemon.baseMaxhp / 8, pokemon);
					}
				}
				if (this.field.terrainState.spikes.includes(pokemon.side.id)) {
					this.add('-message', '...Stalagmites burst up from the ground!');
					if (pokemon.isGrounded() && !pokemon.isSemiInvulnerable()) {
						this.damage(pokemon.baseMaxhp / 3, pokemon);
					}
				}
				if (this.field.terrainState.stickyweb.includes(pokemon.side.id)) {
					this.add('-message', '...Sticky string shot out of the ground!');
					if (!pokemon.isSemiInvulnerable()) {
						this.boost({ spe: -4 }, pokemon);
					}
				}
				if (this.field.terrainState.stealthrock.includes(pokemon.side.id)) {
					this.add('-message', '...Rocks spewed out from the ground below!');
					if (!pokemon.isSemiInvulnerable()) {
						const typeMod = this.clampIntRange(pokemon.runEffectiveness(this.dex.getActiveMove('stealthrock')), -6, 6);
						this.damage(pokemon.maxhp * Math.pow(2, typeMod) / 4, pokemon);
					}
				}
			},
			onFieldResidual(source) {
				this.field.terrainState.toxicspikes = []; 
				this.field.terrainState.spikes = [];
				this.field.terrainState.stickyweb = [];
				this.field.terrainState.stealthrock = [];
			},
			onFieldStart() {
				this.add('-fieldstart', 'Wasteland Terrain');
				this.field.terrainState.toxicspikes = [];
				this.field.terrainState.spikes = [];
				this.field.terrainState.stickyweb = [];
				this.field.terrainState.stealthrock = [];
			},
			onFieldEnd() {
				this.add('-fieldend', 'Wasteland Terrain');
			},
		}
	},
	watersurfaceterrain: {
		name: "Water Surface Terrain",
		condition: {
			duration: 9999,
			onBasePowerPriority: 6,
			onModifySpe(spe, pokemon) {
				const immune = ['swiftswim', 'surgesurfer', 'limber'];
				if (pokemon.isGrounded() && !pokemon.getTypes().includes('Water') && !immune.includes(pokemon.ability)) {
					return this.chainModify(0.75);
				}
			},
			onTryMove(source, target, move) {
				if ((move.type === 'Ground' && move.category !== 'Status') || move.id === 'sandattack') {
					this.add('-message', '...But there was no solid ground to attack from!');
					return false;
				}
			},
			onBasePower(basePower, source, target, move) {
				let modifier = 1;
				const change = ['dive', 'gravity', 'aciddownpour', 'blizzard', 'subzeroslammer', 'glaciate', 'gravapple', 'anchorshot'];
				const strengthenedMoves = ['dive', 'muddywater', 'surf', 'whirlpool', 'hydrovortex'];
				if (move.type === 'Water') {
					this.add('-message', 'The water strengthened the attack!');
					modifier *= 1.5;
				}
				if (strengthenedMoves.includes(move.id)) {
					this.add('-message', 'The attack rode the current!');
					modifier *= 1.5;
				}
				if (target.isGrounded() && move.type === 'Electric') {
					this.add('-message', 'The water conducted the attack!');
					modifier *= 1.5;
				}
				if (target.isGrounded() && move.type === 'Fire') {
					this.add('-message', 'The water deluged the attack...');
					modifier *= 0.5;
				}
				if (move.id === 'wavecrash') {
					this.add('-message', 'The attack rode the current!');
					modifier *= 2;
				}
				if (change.includes(move.id) || (this.field.terrainState.Tchanges?.get('sludgewave') == 1 && move.id === 'sludgewave')) {
					modifier *= 5325 / 4096;
				}
				return this.chainModify(modifier);
			},
			onAfterMove(source, target, move) {
				const underwater = ['dive', 'gravity', 'anchorshot', 'gravapple'];
				const murkwater = ['sludgewave', 'aciddownpour'];
				const icy = ['blizzard', 'subzeroslammer', 'glaciate'];
				if (underwater.includes(move.id)) {
					this.add('-message', move.id === 'gravity' ? 'The battle sank into the depths!' : 'The battle was pulled underwater!');
					this.field.clearWeather();
					this.field.changeTerrain('underwaterterrain');
					return;
				}
				if (murkwater.includes(move.id) && (move.id === 'aciddownpour' || this.field.terrainState.Tchanges?.get('sludgewave') == 1)) {
					this.add('-message', 'The water was polluted!');
					this.field.changeTerrain('murkwatersurfaceterrain');
					return;
				}
				if (move.id === 'sludgewave') {
					this.add('-message', 'Poison spread through the water!');
					this.field.terrainState.Tchanges?.set('sludgewave', 1);
				}
				if (icy.includes(move.id)) {
					this.add('-message', 'The water froze over!');
					this.field.changeTerrain('icyterrain');
					return;
				}
			},
			onResidual(pokemon) {
				if (pokemon.volatiles['tarshot']) {
					pokemon.removeVolatile('tarshot');
				}
			},
			onFieldStart() {
				this.add('-fieldstart', 'Water Surface Terrain');
				this.add('-message', 'The water\'s surface is calm.');
			},
			onFieldEnd() {
				this.add('-fieldend', 'Water Surface Terrain');
			},
		}
	}
}
