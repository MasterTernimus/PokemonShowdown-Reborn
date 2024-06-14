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
	burningterrain: {
		name: "Burning Terrain",
		condition: {
			duration: 9999,
			onBasePowerPriority: 6,
			durationCallback(source, effect) {
				if (source.hasItem('terrainextender')) {
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
				const immune = ['flamebody', 'flareboost', 'flashfire', 'heatproof', 'magmaarmor', 'waterbubble', 'waterveil'];
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
				const strengthenedMoves = ['airslash', 'ancientpower', 'fleurcannon', 'leafblade', 'magicalleaf', 'moongeistbeam', 'mysticalfire', 'nightslash', 'psychocut', 'relicsong', 'smartstrike', 'solarblade', 'sparklingaria', 'menacingmoonrazemaelstorm', 'oceanicoperetta'];
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
				if (source.hasItem('terrainextender')) {
					return 8;
				}
				return 5;
			},
			onModifyCritRatio(critRatio, source, target) {
				if (source.getStat('spe', true, true) > target.getStat('spe', true, true))
					return critRatio + 1;
			},
			onModifyMove(move) {
				const Special = ['Grass', 'Fire', 'Water', 'Electric', 'Ice', 'Dragon', 'Ice', 'Dragon', 'Psychic'];
				const Physical = ['Normal', 'Fighting', 'Ghost', 'Poison', 'Bug', 'Flying', 'Ground', 'Rock', '???'];
				const nonexistant = ['Dark', 'Steel', 'Fairy'];
				if (nonexistant.includes(move.type)) {
					move.type = 'Normal';
				}
				if (Special.includes(move.type)) {
					move.category = 'Special';
				}
				if (Physical.includes(move.type)) {
					move.category = 'Physical';
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
					return this.chainModify(4915, 4096);
				}
			},
			onFieldStart() {
				this.add('-fieldstart', 'Glitch Terrain');
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
					move.boosts = {
						spe: 1
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
					modifier *= 1.5;
				}
				if (move.type === 'Fire') {
					modifier *= 0.5;
				}
				if (move.id === 'scald' || move.id === 'steameruption') {
					modifier *= 0.5;
					if (this.field.terrainState.Tchanges?.includes('watersurfaceterrain')) {
						modifier *= 5325 / 4096;
					}
				}
				if (igniteMoves.includes(move.id) || (this.field.terrainStack[1]?.id === 'watersurfaceterrain' && watersurfaceMoves.includes(move.id))) {
					modifier *= 5325 / 4096;
				}
				return this.chainModify(modifier);
			},
			onAfterMove(source, target, move) {
				const igniteMoves = ['eruption', 'firepledge', 'flameburst', 'heatwave', 'incinerate', 'lavaplume', 'mindblown', 'searingshot', 'infernooverdrive'];
				const watersurfaceMoves = ['bulldoze', 'earthquake', 'fissure', 'magnitude', 'tectonicrage'];
				if (igniteMoves.includes(move.id) || (this.field.terrainStack[1]?.id === 'watersurfaceterrain' && watersurfaceMoves.includes(move.id))) {
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
				if ((move.category === 'Special' && move.target === 'normal' && !move.flags.contact && reflected) || reflectedmoves.includes(move.id)) {
					move.accuracy = true;
				}
			},
			onBasePower(basePower, target, source, move) {
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
				const strengthenedMoves = ['mudbomb', 'mudshot', 'mudslap', 'thousandwaves', 'acid', 'acidspray', 'brine', 'smackdown'];
				const change = ['whirlpool', 'blizzard', 'subzeroslammer', 'glaciate'];
				if (move.type === 'Water') {
					modifier *= 1.5;
				}
				if (move.type === 'Poison') {
					modifier *= 1.5;
				}
				if (move.type === 'Electric' && target.isGrounded()) {
					modifier *= 5325 / 4096
				}
				if (strengthenedMoves.includes(move.id)) {
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
					this.field.changeTerrain('watersurfaceterrain');
					return;
				}
				if (icy.includes(move.id)) {
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
				if (this.field.terrainState[1].id === 'underwaterterrain' && this.field.terrainState[1].Tchanges?.includes('sludgewave')) {
					for (const pokemon of this.getAllActive()) {
						if (!(pokemon.types.includes('Steel') || pokemon.types.includes('Poison')) && !pokemon.isSemiInvulnerable()) {
							pokemon.faint();
						}
					}
				}
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
				if (source.hasItem('terrainextender') && (effect?.name !== 'sunnyday' && effect?.name !== 'raindance')) {
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
					modifier *= 1.5;
				}
				if (move.id === 'rocksmash') {
					modifier *= 2;
				}
				if (rockymoves.includes(move.id)) {
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
	swampterrain: {
		name: "Swamp Terrain",
		condition: {
			duration: 9999,
			onBasePowerPriority: 6,
			durationCallback(source, effect) {
				if (source.hasItem('terrainextender')) {
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
					this.field.changeTerrain('murkwatersurfaceterrain');
					return;
				}
				if (move.id === 'sludgewave') {
					this.field.terrainState.Tchanges?.push('sludgewave');
				}
			},
			onResidual(pokemon) {
				let immune = ['magicguard', 'swiftswim'];
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
				this.field.clearWeather();
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
					return false;
				}
			},
			onBasePower(basePower, source, target, move) {
				let modifier = 1;
				const change = ['dive', 'gravity', 'aciddownpour', 'blizzard', 'subzeroslammer', 'glaciate'];
				const strengthenedMoves = ['dive', 'muddywater', 'surf', 'whirlpool', 'hydrovortex'];
				if (move.type === 'Water') {
					modifier *= 1.5;
				}
				if (strengthenedMoves.includes(move.id)) {
					modifier *= 1.5;
				}
				if (target.isGrounded() && move.type === 'Electric') {
					modifier *= 1.5;
				}
				if (target.isGrounded() && move.type === 'Fire') {
					modifier *= 0.5;
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
					this.field.changeTerrain('underwaterterrain');
					return;
				}
				if (murkwater.includes(move.id) && (move.id === 'aciddownpour' || this.field.terrainState.Tchanges?.includes('sludgewave'))) {
					this.field.changeTerrain('murkwatersurfaceterrain');
					return;
				}
				if (move.id === 'sludgewave') {
					this.field.terrainState.Tchanges?.push('sludgewave');
				}
				if (icy.includes(move.id)) {
					this.field.changeTerrain('icyterrain');
					return;
				}
				if (this.field.terrainState.Tchanges?.includes('sludgewave')) {
					this.field.terrainState.Tchanges = ['sludgewave'];
				}
				else {
					this.field.terrainState.Tchanges = [];
				}
			},
			onFieldStart() {
				this.add('-fieldstart', 'Water Surface Terrain');
			},
			onFieldEnd() {
				this.add('-fieldend', 'Water Surface Terrain');
			},
		}
	}
}
