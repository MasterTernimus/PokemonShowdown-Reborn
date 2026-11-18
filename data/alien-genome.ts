import type { AbilityData } from '../sim/dex-abilities';

// A selected specialist keeps its own Genome. Only a Deoxys that entered as Normal
// can change form; the engine restores temporary formes on withdrawal.
export const alienGenome: AbilityData = {
	name: 'Alien Genome', num: 32622, rating: 4,
	flags: { notrace: 1, noentrain: 1, noreceiver: 1, failskillswap: 1, failroleplay: 1 },
	shortDesc: 'Normal Deoxys shifts with its moves. A starting specialist enhances its Psychic attacks.',
	desc: 'Starting in Normal Forme: just before it uses a move, a priority attack or a move that raises its own Speed selects Speed Forme; other status moves select Defense Forme; attacks with at least 100 listed base power select Attack Forme; other attacks select Normal Forme. Switching out restores Normal Forme. Starting in a specialist forme: Psychic attacks ignore positive defensive stages in Attack Forme, heal 1/8 max HP once per turn after damaging a foe in Defense Forme, or bypass accuracy checks in Speed Forme.',
	onModifyMovePriority: 1,
	onModifyMove(move, user) {
		if (user.transformed || user.species.baseSpecies !== 'Deoxys') return;
		if (user.baseSpecies.id === 'deoxys') {
			const baseMove = this.dex.moves.get(move.id);
			const speedBoost = (baseMove.target === 'self' && (baseMove.boosts?.spe || 0) > 0) ||
				(baseMove.self?.boosts?.spe || 0) > 0;
			let forme = 'Deoxys';
			if ((baseMove.category !== 'Status' && baseMove.priority > 0) || speedBoost) forme = 'Deoxys-Speed';
			else if (baseMove.category === 'Status') forme = 'Deoxys-Defense';
			else if (baseMove.basePower >= 100) forme = 'Deoxys-Attack';
			if (user.species.name !== forme) user.formeChange(forme, this.effect);
			return;
		}
		if (move.category === 'Status' || !this.movehasType(move, 'Psychic')) return;
		if (user.species.id === 'deoxysattack') move.ignorePositiveDefensive = true;
		if (user.species.id === 'deoxysspeed') move.accuracy = true;
	},
	onSourceDamagingHit(damage, target, source, move) {
		if (!damage || !source.hp || source.isAlly(target) || source.transformed ||
			source.baseSpecies.id !== 'deoxysdefense' || source.species.id !== 'deoxysdefense' ||
			!this.movehasType(move, 'Psychic') || source.m.genomeHealTurn === this.turn) return;
		source.m.genomeHealTurn = this.turn;
		this.heal(source.baseMaxhp / 8, source, source, this.effect);
	},
	onEnd(user) {
		if (user.hp && !user.transformed && user.baseSpecies.id === 'deoxys' &&
			user.species.baseSpecies === 'Deoxys' && user.species.id !== 'deoxys') {
			user.formeChange('Deoxys', this.effect);
		}
	},
};
