export const Terrains: { [k: string]: TerrainData } = {
	ashenbeachterrain: {
		name: "Ashen Beach Terrain",
		condition: {
			duration: 9999,
			onBasePowerPriority: 6,
			onAccuracy(accuracy, target, source, move) {
				const noguard = ['owntempo', 'purepower', 'sandveil', 'steadfast'];
				if (!target.hasAbility('unnerve') && source.hasAbility(noguard)) {
					if(move && target === this.effectState.target)
						return true;
				}
				return accuracy;
			},
			onTryAddVolatile(status, target) {
				if ((target.hasAbility('innerfocus') || target.types.includes('Fighting')) && status.id === 'confusion') {
					return false;
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
			onAfterHit(source, target, move) {
				const accuracy = ['firespin', 'leaftornado', 'razorwind', 'twister', 'whirlpool'];
				if (accuracy.includes(move.id) || (move.category === 'Special' && move.type === 'Flying')){
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
			},
			onBasePower(basePower, source, target, move) {
				let modifier = 1;
				const boost = ['acrobatics', 'fierydance', 'firelash', 'firstimpression', 'fly', 'petaldance', 'powerwhip', 'revelationdance', 'vinewhip'];
				if (move.id === 'payday' || move.id === 'makeitrain') {
					modifier *= 2;
				}
				if (move.flags.sound) {
					modifier *= 1.5;
				}
				if (boost.includes(move.id)) {
					modifier *= 1.5;
				}
				if (move.id === 'skittersmack' || move.id === 'bodypress') {
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
				}
			},
			onFieldResidual() {
				if (this.field.weather === 'rain' || this.field.weather === 'sandstorm') {
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
			onEffectivenessPriority: -30,
			onEffectiveness(typeMod, target, type, move) {
				if (type === 'Ground' && target && !target.isGrounded()) {
					return 0;
				}
			},
			onBasePowerPriority: 6,
			onBasePower(basePower, source, target, move) {
				let modifier = 1;
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
				return this.chainModify(modifier);
			},
			onAfterMove(source, target, move) {
				const cavern = ['powergem', 'diamondstorm'];
				const cavecollapse = ['bulldoze', 'earthquake', 'fissure', 'magnitude', 'tectonicrage'];
				if (this.field.terrainState.Tchanges?.includes('collapse') && cavecollapse.includes(move.id)) {
					this.add('-message', 'The quake collapsed the ceiling!');
					this.field.terrainState.Tchanges = this.field.terrainState.Tchanges.filter(newchanges => newchanges !== 'collapse');
					for (const Tchanges of this.field.terrainState.Tchanges) {
						console.log(Tchanges);
					}
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
					this.field.terrainState.Tchanges?.push('collapse');
				}
				if (cavern.includes(move.id)) {
					this.add('-message', 'The cave was littered with crystals!');
					this.field.changeTerrain('crystalcavernterrain', source, move);
				}
			},
			onFieldStart() {
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
					if (min > pokemon.baseMaxhp && king == null) {
						min = pokemon.baseMaxhp;
						king = pokemon;
					}
					if (pokemon.item === 'kingsrock') {
						pokemon.Role = 'King';
						king = pokemon;
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
				if (chessMoves.includes(move.id)) {
					move.types = [move.type, 'Rock'];
				}
			},
			onBasePowerPriority: 6,
			onBasePower(basePower, source, target, move) {
				let modifier = 1;
				const chessMoves = ['ancientpower', 'psychic', 'secretpower', 'strength', 'continentalcrush', 'shatteredpsyche'];
				const boost = ['fakeout', 'feint', 'firstimpression', 'shadowsneak', 'smartstrike', 'suckerpunch'];
				const dumbAbilities = ['unaware', 'simple', 'klutz', 'oblivious'];
				const smartAbilities = ['adaptability', 'synchronize', 'anticipation', 'telepathy'];
				const breakMoves = ['stompingtantrum', 'tectonicrage'];
				if (chessMoves.includes(move.id)) {
					this.add('-message', 'En Passant!');
					if (dumbAbilities.includes(target.ability)) {
						modifier *= 2;
					}
					if (smartAbilities.includes(target.ability)) {
						modifier *= 0.5;
					}
					modifier *= 1.5;
				}
				if (boost.includes(move.id)) {
					modifier *= 1.5;
				}
				if (source.Role === 'Queen') {
					modifier *= 1.5;
				}
				if (source.Role === 'Knight') {
					if (target.Role === 'Queen') {
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
				const breakMoves = ['stompingtantrum', 'tectonicrage'];
				if (breakMoves.includes(move.id)) {
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
				let superStrong = ['acid', 'acidspray', 'grassknot'];
				let poisonedMoves = ['mudbomb', 'mudshot', 'mudslap', 'muddywater', 'smackdown', 'whirlpool', 'thousandarrows'];
				if (superStrong.includes(move.id))
					this.chainModify(2);
				if (poisonedMoves.includes(move.id)) {
					return this.chainModify(1.5);
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
						if (pokemon.hasAbility('flashfire') || pokemon.isSemiInvulnerable() || pokemon.isProtected() || pokemon.side.sideConditions['wideguard'])
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
				if (terrainbreak.includes(move.id)) {
					modifier *= 1.3;
				}
				if (dark.includes('move.id')) {
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
				const terrainbreak = ['bulldoze', 'earthquake', 'fissure', 'magnitude', 'tectonicrage'];
				const dark = ['darkpulse', 'darkvoid', 'nightdaze', 'lightthatburnsthesky'];
				if (terrainbreak.includes(move.id)) {
					this.add('-message', 'The crystals were broken up!');
					this.field.changeTerrain('caveterrain', source, move);
				}
				if (dark.includes(move.id)) {
					this.add('-message', 'The crystals\' light was warped by the darkness!');
					this.field.changeTerrain('darkcrystalcavernterrain', source, move);
				}
			},
			onFieldResidual() {
				const source = this.field.terrainState.origin;
				if (source && source.name) {
					if (source.name == 'SunnyDay' && this.field.getWeather().name != 'SunnyDay') {
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
				if (terrainbreak.includes(move.id)) {
					this.add('-message', 'The dark crystals were shattered!');
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
					this.field.changeTerrain('caveterrain', source, move);
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
			onBasePower(basePower, source, target, move) {
				let modifier = 1;
				const sandified = ['burnup', 'dig', 'heatwave', 'needlearm', 'pinmissile', 'sandtomb', 'solarbeam', 'solarblade', 'thousandwaves', 'searingsunrazesmash'];
				if (move.type === 'Water' && source.isGrounded()) {
					modifier *= 0.5;
				}
				if (move.type === 'Electric' && target.isGrounded()) {
					modifier *= 0.5;
				}
				if (sandified.includes(move.id)) {
					modifier *= 1.5;
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
	factoryterrain: {
		name: "Factory Terrain",
		condition: {
			duration: 9999,
			onBasePowerPriority: 6,
			onBasePower(basePower, source, target, move) {
				let modifier = 1;
				const quakemoves = ['bulldoze', 'earthquake', 'explosion', 'fissure', 'magnitude', 'selfdestruct', 'lightthatburnsthesky', 'tectonicrage', 'discharge', 'risingvoltage']
				const uberboost = ['flashcannon', 'geargrind', 'gyroball', 'magnetbomb'];
				const boost = ['steamroller', 'technoblast', 'doubleironbash'];
				if (move.type === 'Electric') {
					modifier *= 1.5;
				}
				if (uberboost.includes(move.id)) {
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
				if (['cut', 'sacredsword', 'secretsword', 'slash'].includes(move.id)) {
					move.type === "Steel";
				}
			},
			onEffectiveness(typeMod, target, type, move) {
				const types = move.types !== undefined ? move.types : [move.type];
				if (type === 'Dragon' && types.includes('Steel')) {
					return 1;
				}
			},
			onBasePower(basePower, source, target, move) {
				const strengthenedMoves = ['airslash', 'ancientpower', 'fleurcannon', 'leafblade', 'magicalleaf', 'moongeistbeam', 'mysticalfire', 'nightslash', 'psychocut', 'relicsong', 'smartstrike', 'solarblade', 'sparklingaria', 'menacingmoonrazemaelstorm', 'oceanicoperetta', 'kowtowcleave'];
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
			onBasePower(basePower, source, target, move) {
				let modifier = 1;
				const igniteMoves = ['eruption', 'firepledge', 'flameburst', 'heatwave', 'incinerate', 'lavaplume', 'mindblown', 'searingshot', 'infernooverdrive'];
				const boosted = ['attackorder', 'cut', 'electroweb', 'drumbeating', 'skittersmack', 'pounce'];
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
				}
				if (move.id === 'cut' && target.types.includes('Grass')) {
					modifier *= 2;
				}
				if (igniteMoves.includes(move.id)) {
					modifier *= 1.3;
				}
				return this.chainModify(modifier);
			},
			onAfterMove(source, target, move) {
				const igniteMoves = ['eruption', 'firepledge', 'flameburst', 'heatwave', 'incinerate', 'lavaplume', 'mindblown', 'searingshot', 'infernooverdrive'];
				if (igniteMoves.includes(move.id) && (this.field.weather !== 'raindance' || !this.field.getPseudoWeather('watersport'))){
					this.field.changeTerrain('burningterrain');
					return;
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
				const Special = ['Grass', 'Fire', 'Water', 'Electric', 'Ice', 'Dragon', 'Ice', 'Dragon', 'Psychic'];
				const Physical = ['Normal', 'Fighting', 'Ghost', 'Poison', 'Bug', 'Flying', 'Ground', 'Rock', '???'];
				const nonexistant = ['Dark', 'Steel', 'Fairy'];
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
					if (this.field.terrainState.Tchanges?.includes('watersurfaceterrain')) {
						modifier *= 1.3;
					}
				}
				if (move.id === 'snipeshot') {
					this.add('-message', 'The cold air crystallized the missile');
					modifier *= 1.2
				}
				if (igniteMoves.includes(move.id) || (this.field.terrainStack[1]?.id === 'watersurfaceterrain' && watersurfaceMoves.includes(move.id))) {
					modifier *= 1.3;
				}
				return this.chainModify(modifier);
			},
			onAfterMove(source, target, move) {
				const igniteMoves = ['eruption', 'firepledge', 'flameburst', 'heatwave', 'incinerate', 'lavaplume', 'mindblown', 'searingshot', 'infernooverdrive'];
				const watersurfaceMoves = ['bulldoze', 'earthquake', 'fissure', 'magnitude', 'tectonicrage'];
				if (igniteMoves.includes(move.id) || (this.field.terrainStack[1]?.id === 'watersurfaceterrain' && watersurfaceMoves.includes(move.id))) {
					this.add('-message', 'The ice went away!');
					this.field.changeTerrain('watersurfaceterrain');
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
	murkwatersurfaceterrain: {
		name: "Murkwater Surface Terrain",
		condition: {
			duration: 9999,
			onBasePowerPriority: 6,
			onModifySpe(spe, pokemon) {
				let immune = ['surgesurfer', 'swiftswim'];
				if (!pokemon.types.includes('Water') || !immune.includes(pokemon.ability)) {
					return this.chainModify(0.75);
				}
			},
			onModifyMove(move) {
				const waterpoisonMoves = ['mudbomb', 'mudshot', 'mudslap', 'thousandwaves'];
				if (move.type === 'Water' || waterpoisonMoves.includes(move.id)) {
					move.types = ['Water', 'Poison'];
					move.type = 'Water';
				}
				if (move.id === 'smackdown') {
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
				const strengthenedMoves = ['mudbomb', 'mudshot', 'mudslap', 'thousandwaves', 'acid', 'acidspray', 'brine', 'smackdown', 'wavecrash'];
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
				const immune = ['immunity', 'magicguard', 'poisonheal', 'toxicboost', 'wondergaurd'];
				const weak = ['dryskin', 'flamebody', 'magmaarmor', 'waterabsorb'];
				if (!immune.includes(pokemon.ability) && !(pokemon.types.includes('Poison') || pokemon.types.includes('Steel')) && pokemon.isGrounded()) {
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
	rainbowterrain: {
		name: "Rainbow Terrain",
		condition: {
			duration: 9999,
			onBasePowerPriority: 6,
			durationCallback(target, source, effect) {
				if (source.hasItem('amplifieldrock') && (effect?.name !== 'sunnyday' && effect?.name !== 'raindance')) {
					return 7;
				}
				else if (effect?.name !== 'sunnyday' && effect?.name !== 'raindance') {
					return effect?.duration !== undefined ? effect.duration : 5;
				}
				else
					return 4;
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
				if (move.type === 'normal') {
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
				const nerfed = ['lightthatburnsthesky']
				const fieldchange = ['chargebeam', 'discharge', 'iondeluge', 'paraboliccharge', 'wildcharge', 'gigavolthavoc', 'risingvoltage']
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
					modifier *= 5325 / 4096;
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
				if (move.id === 'thousandarrows' || move.id === 'smackdown') {
					move.types = [move.type, 'Water'];
				}
			},
			onBasePower(basePower, source, target, move) {
				let modifier = 1;
				const strengthenedMoves = ['thousandarrows', 'smackdown', 'brine', 'gunkshot', 'mudbomb', 'mudshot', 'mudslap', 'muddywater', 'sludgewave', 'surf', 'hydrovortex'];
				const weakenedMoves = ['bulldoze', 'earthquake', 'magnitude'];
				if (move.type === 'Poison' && target.isGrounded()) {
					modifier *= 1.5;
				}
				if (strengthenedMoves.includes(move.id)) {
					modifier *= 1.5;
				}
				if (weakenedMoves.includes(move.id)) {
					modifier *= 0.25;
				}
				return this.chainModify(modifier);
			},
			onResidual(pokemon) {
				let immune = ['quickfeet', 'swiftswim', 'clearbody', 'whitesmoke'];
				if (pokemon.isGrounded() && !immune.includes(pokemon.ability)) {
					pokemon.setBoost({ spe: -1 });
				}
				if (pokemon.status === 'slp' || pokemon.hasAbility('comatose') && !(pokemon.hasAbility('magicguard'))) {
					this.damage(pokemon.baseMaxhp / 16, pokemon);
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
				if (!pokemon.getTypes().includes('Water') && !immune.includes(pokemon.ability)) {
					return this.chainModify(0.5);
				}
			},
			onTryMove(source, target, move) {
				if (move.type === 'Fire') {
					return false;
				}
			},
			onModifyMove(move) {
				if (move.type === 'Ground') {
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
					if (!move.types) {
						return 0;
					}
					return 0 + this.dex.getEffectiveness(move_types.splice(move_types.indexOf('Water', 1)), type);
				}
			},
			onBasePower(basePower, source, target, move) {
				let modifier = 1;
				const change = ['bounce', 'dive', 'skydrop', 'fly', 'aciddownpour'];
				if (move.type === 'Electric') {
					modifier *= 2;
				}
				if (move.id === 'anchorshot') {
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
				if (change.includes(move.id) || (this.field.terrainState.Tchanges?.includes('sludgewave') && move.id === 'sludgewave')) {
					modifier *= 5325 / 4096;
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
				if (murkwater.includes(move.id) && (move.id === 'aciddownpour' || this.field.terrainState.Tchanges?.includes('sludgewave'))) {
					for (const pokemon of this.getAllActive()) {
						if (!(pokemon.types.includes('Steel') || pokemon.types.includes('Poison')) && !pokemon.isSemiInvulnerable()) {
							pokemon.faint();
						}
					}
					this.field.changeTerrain('murkwatersurfaceterrain');
					return;
				}
				if (move.id === 'sludgewave') {
					this.field.terrainState.Tchanges?.push('sludgewave');
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
				const immune = ['swiftswim', 'surgesurfer'];
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
				const change = ['dive', 'gravity', 'aciddownpour', 'blizzard', 'subzeroslammer', 'glaciate'];
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
				if (change.includes(move.id) || (this.field.terrainState.Tchanges?.includes('sludgewave') && move.id === 'sludgewave')) {
					modifier *= 5325 / 4096;
				}
				return this.chainModify(modifier);
			},
			onAfterMove(source, target, move) {
				const underwater = ['dive', 'gravity'];
				const murkwater = ['sludgewave', 'aciddownpour'];
				const icy = ['blizzard', 'subzeroslammer', 'glaciate'];
				if (underwater.includes(move.id)) {
					this.add('-message', move.id === 'gravity' ? 'The battle sank into the depths!' : 'The battle was pulled underwater!');
					this.field.clearWeather();
					this.field.changeTerrain('underwaterterrain');
					return;
				}
				if (murkwater.includes(move.id) && (move.id === 'aciddownpour' || this.field.terrainState.Tchanges?.includes('sludgewave'))) {
					this.add('-message', 'The water was polluted!');
					this.field.changeTerrain('murkwatersurfaceterrain');
					return;
				}
				if (move.id === 'sludgewave') {
					this.add('-message', 'Poison spread through the water!');
					this.field.terrainState.Tchanges?.push('sludgewave');
				}
				if (icy.includes(move.id)) {
					this.add('-message', 'The water froze over!');
					this.field.changeTerrain('icyterrain');
					return;
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
