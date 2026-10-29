import {adaptiveFieldMultiplier} from '../sim/adaptive-cycle';
import type {TerrainData} from '../sim/dex-terrains';

export const SnowyField: TerrainData = {
	name: 'Snowy Terrain',
	condition: {
		effectType: 'Terrain', duration: 5,
		onModifySpe(spe, pokemon) {
			if (pokemon.isGrounded() && !pokemon.hasType('Ice') &&
				!pokemon.hasAbilityOrPassive(['slushrush', 'icebody', 'snowcloak', 'refrigerate'])) return this.chainModify(0.75);
		},
		onModifySpD(spd, pokemon) {
			if (pokemon.hasType('Ice') && this.field.isWeather('hail')) return this.chainModify(1.5);
		},
		onModifyMovePriority: -1,
		onModifyMove(move) {
			if (['anchorshot', 'ironhead', 'irontail', 'steelroller', 'gyroball', 'geargrind', 'mudslap', 'sandtomb',
				'chillingwater', 'magnetbomb', 'metalclaw', 'doubleironbash', 'bulletpunch', 'mudshot', 'mudbomb', 'earthquake',
				'gigatonhammer', 'steelwing', 'smartstrike', 'sunsteelstrike', 'meteormash', 'magnitude', 'bulldoze'].includes(move.id)) {
				move.type = 'Ice'; move.types = ['Ice'];
			}
			if (move.id === 'bittermalice') {
				move.secondaries ||= [];
				const frostbite = move.secondaries.find(s => s.status === 'frz');
				if (frostbite) frostbite.chance = Math.max(10, frostbite.chance || 0);
				else move.secondaries.push({chance: 10, status: 'frz'});
			}
		},
		onBasePowerPriority: 6,
		onBasePower(basePower, source, target, move) {
			let modifier = 1;
			const types = move.types || [move.type];
			if (types.includes('Ice')) modifier *= adaptiveFieldMultiplier(this, source, target, 1.5);
			if (types.includes('Fire')) modifier *= adaptiveFieldMultiplier(this, source, target, 0.5);
			if (['powdersnow', 'chillingwater'].includes(move.id)) modifier *= adaptiveFieldMultiplier(this, source, target, 2);
			if (['bleakwindstorm', 'razorwind', 'avalanche', 'icywind'].includes(move.id)) modifier *= adaptiveFieldMultiplier(this, source, target, 1.5);
			if (['scald', 'steameruption', 'hydrosteam'].includes(move.id)) modifier *= adaptiveFieldMultiplier(this, source, target, 0.5);
			return this.chainModify(modifier);
		},
		onAccuracy(accuracy, target, source, move) {
			if (['blizzard', 'bleakwindstorm', 'icywind', 'coldsnap', 'frostbreath'].includes(move.id)) return true;
		},
		onMiss(source, target, move) {
			if (move.category === 'Status' || !target?.hp || (move as any).snowyMiss) return;
			(move as any).snowyMiss = true;
			this.boost({accuracy: -1}, target, source, this.field.getTerrain());
		},
		onAfterMove(source, target, move) {
			if (source.moveThisTurnResult !== true) return;
			if (['heatwave', 'eruption', 'searingshot', 'flameburst', 'lavaplume', 'firepledge', 'mindblown', 'incinerate', 'infernooverdrive'].includes(move.id)) {
				this.field.clearTerrain();
			}
		},
		onFieldResidualOrder: 27,
		onFieldResidualSubOrder: 7,
		onFieldResidual() {
			if (this.field.isWeather('raindance')) this.field.changeWeather('hail');
		},
		onFieldStart() { this.add('-fieldstart', 'Snowy Terrain'); },
		onFieldEnd() { this.add('-fieldend', 'Snowy Terrain'); },
	},
};
