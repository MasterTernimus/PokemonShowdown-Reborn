import {adaptiveFieldMultiplier} from '../sim/adaptive-cycle';
import {isGroundBoneMove} from './ground-bone-moves';
import type {TerrainData} from '../sim/dex-terrains';

/** Eclipse fields share a lifetime, but retain separate battle effects. */
export const EclipseTerrains: {[id: string]: TerrainData} = {
	coldeclipseterrain: {
		name: 'Cold Eclipse Terrain',
		condition: {
			effectType: 'Terrain', duration: 5,
			onFieldResidualOrder: 27,
			onFieldResidualSubOrder: 7,
			onModifyDef(def, pokemon) {
				let modifier = (pokemon.hasType('Ice') ? 1.2 : 1) * (pokemon.hasType('Ghost') ? 1.2 : 1);
				if (pokemon.hasType('Fire')) modifier *= 0.8;
				return this.chainModify(modifier);
			},
			onModifySpD(spd, pokemon) {
				let modifier = (pokemon.hasType('Ice') ? 1.2 : 1) * (pokemon.hasType('Ghost') ? 1.2 : 1);
				if (pokemon.hasType('Fire')) modifier *= 0.8;
				return this.chainModify(modifier);
			},
			onEffectiveness(typeMod, target, type, move) {
				if (type === 'Dragon') return typeMod - 2 * (move.types || [move.type]).filter(t => t === 'Ice').length;
			},
			onTryMove(source, target, move) {
				if (['trickroom', 'wonderroom', 'gravity', 'magicroom'].includes(move.id)) {
					this.add('-message', 'The frozen reality cannot be changed!');
					return false;
				}
			},
			onModifyMovePriority: -1,
			onModifyMove(move, pokemon) {
				if (['Rock', 'Steel', 'Ground', 'Water'].includes(move.type) && !isGroundBoneMove(move) &&
					!(pokemon.hasAbilityOrPassive('armorize') && move.type === 'Steel') && !move.types?.includes('Ice')) {
					move.types = [...(move.types || [move.type]), 'Ice'];
				}
				if (['freezeshock', 'iceburn'].includes(move.id)) delete move.flags.charge;
				if (move.id === 'rage') {
					move.basePower = 60; move.type = 'Dark'; move.category = 'Physical';
					move.self = {boosts: {atk: 1}};
				}
				if (move.id === 'snarl') move.secondaries = [{chance: 100, boosts: {spa: -2}}];
				if (move.id === 'chillingwater') move.secondaries = [{chance: 100, boosts: {atk: -2}}];
				if (move.id === 'partingshot') move.boosts = {...move.boosts, spe: -1};
			},
			onBasePowerPriority: 6,
			onBasePower(basePower, source, target, move) {
				let modifier = 1;
				const types = move.types || [move.type];
				if (types.includes('Ice')) modifier *= adaptiveFieldMultiplier(this, source, target, 1.2);
				if (types.includes('Dragon')) modifier *= adaptiveFieldMultiplier(this, source, target, 2);
				if (types.includes('Dark')) modifier *= adaptiveFieldMultiplier(this, source, target, 1.5);
				if (['fierywrath', 'freezingglare', 'lashout', 'outrage', 'ragingfury', 'rage', 'roaroftime',
					'stompingtantrum', 'thrash', 'bittermalice'].includes(move.id)) modifier *= adaptiveFieldMultiplier(this, source, target, 1.5);
				if (['hyperspacehole', 'hyperspacefury'].includes(move.id)) modifier *= adaptiveFieldMultiplier(this, source, target, 1.2);
				return this.chainModify(modifier);
			},
			onAccuracy(accuracy, target, source, move) {
				if (['blizzard', 'icywind', 'coldsnap', 'darkvoid'].includes(move.id)) return true;
			},
			onAfterMove(source, target, move) { this.field.eclipseAfterMove(source, move); },
			onImmunity(type, pokemon) {
				if (type === 'hail' && pokemon.hasType('Dragon')) return false;
			},
			onFieldStart() { this.add('-fieldstart', 'Cold Eclipse Terrain'); },
			onFieldEnd() { this.add('-fieldend', 'Cold Eclipse Terrain'); },
		},
	},
	rifteclipseterrain: {
		name: 'Rift Eclipse Terrain',
		condition: {
			effectType: 'Terrain', duration: 5,
			onModifyDef(def, pokemon) { if (pokemon.hasType('Ghost')) return this.chainModify(1.2); },
			onModifySpD(spd, pokemon) { if (pokemon.hasType('Ghost')) return this.chainModify(1.2); },
			onBasePowerPriority: 6,
			onBasePower(basePower, source, target, move) {
				let modifier = 1;
				const types = move.types || [move.type];
				if (types.includes('Dark')) modifier *= adaptiveFieldMultiplier(this, source, target, 1.5);
				if (types.includes('Ghost')) modifier *= adaptiveFieldMultiplier(this, source, target, 1.2);
				if (types.includes('Fairy')) modifier *= adaptiveFieldMultiplier(this, source, target, 0.75);
				if (['spacialrend', 'roaroftime', 'hyperspacehole', 'hyperspacefury', 'shadowforce', 'phantomforce',
					'dynamaxcannon', 'eternabeam'].includes(move.id)) modifier *= adaptiveFieldMultiplier(this, source, target, 1.5);
				return this.chainModify(modifier);
			},
			onAccuracy(accuracy, target, source, move) {
				if (['darkpulse', 'nightdaze'].includes(move.id)) return true;
			},
			onModifyPriority(priority, pokemon, target, move) { if (move.id === 'quash') return priority + 1; },
			onModifyMove(move) {
				if (move.id === 'rage') {
					move.basePower = 60; move.type = 'Dark'; move.category = 'Physical'; move.self = {boosts: {atk: 1}};
				}
			},
			onResidual(pokemon) {
				if (pokemon.status === 'slp' || pokemon.hasAbilityOrPassive('comatose')) this.damage(pokemon.baseMaxhp / 16, pokemon);
			},
			onSwitchIn(pokemon) {
				if (pokemon.hasAbilityOrPassive('rattled')) this.boost({spe: 1}, pokemon);
				if (pokemon.hasAbilityOrPassive('berserk')) this.boost({spa: 1}, pokemon);
				if (pokemon.hasAbilityOrPassive('justified')) this.boost({atk: 1}, pokemon);
			},
			onAfterMove(source, target, move) { this.field.eclipseAfterMove(source, move); },
			onFieldStart() { this.add('-fieldstart', 'Rift Eclipse Terrain'); },
			onFieldEnd() { this.add('-fieldend', 'Rift Eclipse Terrain'); },
		},
	},
	infernaleclipseterrain: {
		name: 'Infernal Eclipse Terrain',
		condition: {
			effectType: 'Terrain', duration: 5,
			onFieldResidualOrder: 27,
			onFieldResidualSubOrder: 7,
			onModifyDef(def, pokemon) {
				let modifier = (pokemon.hasType('Fire') ? 1.2 : 1) * (pokemon.hasType('Ghost') ? 1.2 : 1);
				if (pokemon.hasType('Ice')) modifier *= 0.8;
				return this.chainModify(modifier);
			},
			onModifySpD(spd, pokemon) {
				let modifier = (pokemon.hasType('Fire') ? 1.2 : 1) * (pokemon.hasType('Ghost') ? 1.2 : 1);
				if (pokemon.hasType('Ice')) modifier *= 0.8;
				return this.chainModify(modifier);
			},
			onModifyMovePriority: -1,
			onModifyMove(move, pokemon) {
				if (['Rock', 'Steel', 'Ground', 'Ice'].includes(move.type) && !isGroundBoneMove(move) &&
					!(pokemon.hasAbilityOrPassive('armorize') && move.type === 'Steel') && !move.types?.includes('Fire')) {
					move.types = [...(move.types || [move.type]), 'Fire'];
				}
				if (['aurasphere', 'frustration', 'spiritbreak'].includes(move.id) && !move.types?.includes('Dark')) {
					move.types = [...(move.types || [move.type]), 'Dark'];
				}
				if (move.id === 'infernalparade') move.secondaries = [{chance: 100, status: 'brn'}];
			},
			onBasePowerPriority: 6,
			onBasePower(basePower, source, target, move) {
				let modifier = 1;
				const types = move.types || [move.type];
				if (types.includes('Fire')) modifier *= adaptiveFieldMultiplier(this, source, target, 1.5);
				if (types.includes('Dragon')) modifier *= adaptiveFieldMultiplier(this, source, target, 2);
				if (types.includes('Dark')) modifier *= adaptiveFieldMultiplier(this, source, target, 1.5);
				if (types.includes('Water')) modifier *= adaptiveFieldMultiplier(this, source, target, 0.5);
				if (types.includes('Ice')) modifier *= adaptiveFieldMultiplier(this, source, target, 0.5);
				if (types.includes('Fairy') && move.id !== 'spiritbreak') modifier *= adaptiveFieldMultiplier(this, source, target, 0.5);
				if (['blastburn', 'infernalparade', 'inferno', 'infernooverdrive', 'earthpower', 'precipiceblades', 'ragingfury'].includes(move.id)) {
					modifier *= adaptiveFieldMultiplier(this, source, target, 1.5);
				}
				if (['punishment', 'smog', 'dreameater'].includes(move.id)) modifier *= adaptiveFieldMultiplier(this, source, target, 2);
				return this.chainModify(modifier);
			},
			onEffectiveness(typeMod, target, type, move) {
				if (type === 'Ghost' && (move.types || [move.type]).includes('Fire')) return typeMod + 1;
			},
			onAccuracy(accuracy, target, source, move) {
				if (['inferno', 'willowisp', 'darkvoid'].includes(move.id)) return true;
			},
			onResidual(pokemon) {
				if (pokemon.hasAbilityOrPassive('steamengine')) this.boost({spe: 1}, pokemon);
				if (!pokemon.isGrounded() || pokemon.isSemiInvulnerable() || pokemon.hasType('Fire') || pokemon.volatiles.aquaring ||
					pokemon.hasAbilityOrPassive(['magicguard', 'flamebody', 'flareboost', 'flashfire', 'heatproof', 'magmaarmor', 'waterbubble', 'waterveil', 'wellbakedbody'])) return;
				const scale = 2 ** this.clampIntRange(this.dex.getEffectiveness('Fire', pokemon.types), -6, 6);
				this.damage(Math.min(pokemon.baseMaxhp / 8, pokemon.baseMaxhp / 16 * scale), pokemon);
			},
			onAfterMove(source, target, move) { this.field.eclipseAfterMove(source, move); },
			onFieldStart() {
				this.add('-fieldstart', 'Infernal Eclipse Terrain');
				if (['raindance', 'primordialsea', 'hail'].includes(this.field.weather)) this.field.clearWeather();
			},
			onFieldEnd() { this.add('-fieldend', 'Infernal Eclipse Terrain'); },
		},
	},
};
