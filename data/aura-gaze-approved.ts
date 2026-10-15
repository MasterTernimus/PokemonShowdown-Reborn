import type {AbilityDataTable} from '../sim/dex-abilities';
import {skipPassiveComponent} from './passive-ability-cleanup';

export const AuraGazeDescriptions = {
	aurasight: {
		name: 'Aura Sight',
		shortDesc: 'Aura Sphere uses higher staged offense (Special ties) and bypasses Substitute.',
		desc: 'Aura Sphere uses the higher staged Attack or Sp. Atk and the corresponding defensive stat, choosing Special on ties. It bypasses Substitute. Its normal power, never-miss accuracy, Protect, type immunity and Bulletproof interactions remain unchanged.',
	},
	revealinggaze: {
		name: 'Revealing Gaze',
		shortDesc: 'Entry Miracle Eye; own Psychic attacks ignore marked targets\' positive Sp. Def stages.',
		desc: 'On genuine entry, uses ordinary Miracle Eye on the living legal opposing target directly across from it, falling back to the first living legal opposing target. Normal protection and reflection apply; costs no PP and does not repeat on selected-ability restart. Its own Psychic attacks ignore positive Sp. Def stages only while the target has Miracle Eye; negative stages and Defense remain unchanged. Ordinary Miracle Eye lets all allies ignore the marked target\'s positive evasion and Dark immunity to Psychic attacks, and its mark clears when the target leaves. It also gives the user half incoming Ghost damage until switching and +2 Sp. Atk on Psychic Terrain, Fairy Tale or Holy Field. No Kinesis or Future Sight advancement.',
	},
};

export function installAuraGaze(abilities: AbilityDataTable) {
	abilities.aurasight = {
		name: 'Aura Sight', num: 11495, rating: 3, flags: {},
		onModifyMove(move, source) {
			if (skipPassiveComponent(this, source, 'aurasight') || move.id !== 'aurasphere' || move.isZ || move.isMax) return;
			move.category = source.getStat('atk', false, true) > source.getStat('spa', false, true) ? 'Physical' : 'Special';
			move.flags = {...move.flags, bypasssub: 1};
		},
	};
	abilities.revealinggaze = {
		name: 'Revealing Gaze', num: 11496, rating: 3, flags: {},
		onSwitchIn(source) {
			if (skipPassiveComponent(this, source, 'revealinggaze') || !source.hp || !source.isActive) return;
			const foes = source.foes().filter(target => target.hp && target.isActive && source.isAdjacent(target));
			const target = foes.find(foe => foe.position === source.position) || foes[0];
			if (!target) return;
			const saved = {move: this.activeMove, pokemon: this.activePokemon, target: this.activeTarget,
				event: this.event, effect: this.effect, state: this.effectState, result: source.moveThisTurnResult};
			try {
				this.actions.useMove('miracleeye', source, {target, sourceEffect: this.effect});
			} finally {
				this.activeMove = saved.move; this.activePokemon = saved.pokemon; this.activeTarget = saved.target;
				this.event = saved.event; this.effect = saved.effect; this.effectState = saved.state;
				source.moveThisTurnResult = saved.result;
			}
		},
	};
}
