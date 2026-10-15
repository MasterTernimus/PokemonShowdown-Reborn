import type {AbilityDataTable} from '../sim/dex-abilities';

export const CalculatedTrajectoryDescriptions = {
	calculatedtrajectory: {
		name: 'Calculated Trajectory',
		shortDesc: 'Entry Kinesis; successful accuracy drop advances own ordinary Future Sight once.',
		desc: 'On genuine entry, uses ordinary Kinesis against the living opposing slot, with a deterministic living active fallback. A successful Kinesis accuracy drop advances this holder\'s ordinary pending Future Sight in that slot by one turn, once per scheduled attack and no earlier than the current turn\'s residual. Grandmaster and Perfect Foresight queues are excluded. Normal protection, reflection and field effects apply; ability restarts do not trigger entry.',
	},
};

export function installCalculatedTrajectory(abilities: AbilityDataTable) {
	abilities.calculatedtrajectory = {
		name: 'Calculated Trajectory', num: 11491, rating: 3,
		onSwitchIn(pokemon) {
			if (!this.effectState.speciesPassive && pokemon.getPassives().includes('calculatedtrajectory')) return;
			const foes = pokemon.foes().filter(p => p.hp && p.isActive);
			const target = foes.find(p => p.position === pokemon.position) || foes[0];
			if (!pokemon.hp || !target) return;
			const saved = {move: this.activeMove, pokemon: this.activePokemon, target: this.activeTarget,
				event: this.event, effect: this.effect, state: this.effectState, result: pokemon.moveThisTurnResult};
			try { this.actions.useMove('kinesis', pokemon, {target, sourceEffect: this.effect}); }
			finally {
				this.activeMove = saved.move; this.activePokemon = saved.pokemon; this.activeTarget = saved.target;
				this.event = saved.event; this.effect = saved.effect; this.effectState = saved.state;
				pokemon.moveThisTurnResult = saved.result;
			}
		},
		onAnyAfterEachBoost(boost, target, source, effect) {
			const holder = this.effectState.target as Pokemon;
			if (!this.effectState.speciesPassive && holder.getPassives().includes('calculatedtrajectory')) return;
			if (source !== holder || !holder.hp || !holder.isActive || target.isAlly(holder) ||
				effect.id !== 'kinesis' || !boost.accuracy || boost.accuracy >= 0) return;
			const pending = target.side.slotConditions[target.position].futuremove;
			if (!pending || pending.source !== holder || pending.move !== 'futuresight' ||
				pending.calculatedTrajectoryAdvanced || pending.moveData?.perfectForesight ||
				pending.moveData?.grandmasterForesight) return;
			pending.endingTurn = Math.max(this.getOverflowedTurnCount(), pending.endingTurn - 1);
			pending.calculatedTrajectoryAdvanced = true;
		},
	};
}
