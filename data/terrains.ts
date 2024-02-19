export const Terrains: { [k: string]: TerrainData } = {
	burningterrain: {
		name: "Burning Terrain",
		condition: {
			duration: 5,
			onBasePowerPriority: 6,
			durationCallback(source, effect) {
				if (source.hasItem('terrainextender')){
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
				if (move.type === 'Fire' && target.isGrounded()) {
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
					this.field.clearTerrain();
				}
			},
			onResidual(pokemon) {
				const immune = ['flamebody', 'flareboost', 'flashfire', 'heatproof', 'magmaarmor', 'waterbubble', 'waterveil'];
				const weak = ['leafguard', 'fluffy', 'grasspelt', 'icebody'];
				if (!immune.includes(pokemon.ability) || !pokemon.volatiles['aquaring']) {
					let typeMod = this.clampIntRange(this.dex.getEffectiveness('Fire', pokemon.types), -6, 6);
					let damage = this.clampIntRange(pokemon.baseMaxhp / 8 * Math.pow(2, typeMod), 1);
					if (weak.includes(pokemon.ability)) {
						this.damage(damage * 2, pokemon);
					}
					else {
						this.damage(damage, pokemon);
					}
				}
				if (this.field.weather === 'rain' || this.field.weather === 'sandstorm')
					this.field.clearTerrain();
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
			duration: 5,
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
				let immune = ['immunity, magicguard, poisonheal, toxicboost, wonderguard'];
				if (!immune.includes(pokemon.ability) && pokemon.isGrounded() && !(pokemon.types.includes('Poison') || !pokemon.types.includes('Steel'))) {
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
				let immune = ['immunity, magicguard, poisonheal, toxicboost, wonderguard'];
				if (!immune.includes(pokemon.ability) && !(pokemon.types.includes('Poison') || !pokemon.types.includes('Steel'))){
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
			duration: 5,
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
					modifier *= 5325/4096;
				return this.chainModify(modifier);
			},
			onAfterMove(source, target, move) {
				const terrainEndMoves = ['defog', 'gust', 'hurricane', 'razorwind', 'tailwind', 'twister', 'whirlwind', 'supersonicskystrike', 'seedflare'];
				const igniteMoves = ['eruption', 'explosion', 'firepledge', 'flameburst', 'heatwave', 'incinerate', 'lavaplume', 'mindblown', 'searingshot', 'selfdestruct', 'infernooverdrive'];
				if (igniteMoves.includes(move.id)) {
					for (const pokemon of this.getAllActive()) {
						if (pokemon.hasAbility('damp'))
							return;
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
	fairytaleterrain: {
		name: "Fairy Tale Terrain",
		condition: {
			duration: 5,
			onBasePowerPriority: 6,
			onModifyMove(move) {
				if (move.type === 'Fire') {
					this.add('-message', 'The fiery flames became draconified!');
					move.types = [move.type, 'Dragon'];
				}
			},
			onEffectiveness(typeMod, target, type, move) {
				const types = move.types !== undefined ? move.types : [move.type];
				if (type === 'Dragon' && types.includes('Steel'))
					return 1;
			},
			onBasePower(basePower, source, target, move) {
				const strengthenedMoves = ['airslash', 'ancientpower', 'fleurcannon', 'leafblade', 'magicalleaf', 'moongeistbeam', 'mysticalfire', 'nightslash', 'psychocut', 'smartstrike', 'solarblade', 'sparklingaria', 'menacingmoonrazemaelstorm', 'oceanicoperetta'];
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
				if (move.id === 'draining kiss') {
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
	rainbowterrain: {
		name: "Rainbow Terrain",
		condition: {
			duration: 5,
			onBasePowerPriority: 6,
			durationCallback(source, effect) {
				if (source.hasItem('terrainextender')) {
					return 7;
				}
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
	swampterrain: {
		name: "Swamp Terrain",
		condition: {
			duration: 5,
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
	}
}
