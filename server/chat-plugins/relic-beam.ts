import { Dex } from '../../sim/dex';
import { Utils } from '../../lib';
import { qualifiesForMalignantLight, qualifiesForRelicBeam, RelicBeamMoves } from '../../data/relic-beam';

export function renderRelicBeamReference() {
	const named = [...RelicBeamMoves].map(id => Dex.moves.get(id).name).sort();
	const other = Dex.moves.all().filter(move =>
		move.category !== 'Status' && qualifiesForRelicBeam(move) && !RelicBeamMoves.has(move.id))
		.map(move => move.name).sort();
	return '<strong>Relic Beam / Malignant Light</strong><p>Relic Beam gives these moves 50% more power. Malignant Light uses the lower defense when they are special.</p>' +
		`<p><strong>Named beam moves:</strong> ${Utils.escapeHTML(named.join(', '))}.</p>` +
		`<p><strong>Other pulse/bullet moves:</strong> ${Utils.escapeHTML(other.join(', '))}.</p>` +
		'<p>Malignant Light also covers special Photon Geyser and Lumina Crash. Relic Beam uses Defense and its stages for Sp. Atk. Check one move with /relicbeam MOVE.</p>';
}

export const commands: Chat.ChatCommands = {
	beams: 'relicbeam',
	relicbeams: 'relicbeam',
	relicbeam(target) {
		if (!this.runBroadcast()) return;
		if (!target.trim()) return this.sendReplyBox(renderRelicBeamReference());
		const move = Dex.moves.get(target);
		if (!move.exists) return this.errorReply(`Unknown move: ${target}.`);
		if (move.category === 'Status') {
			return this.sendReplyBox(`${Utils.escapeHTML(move.name)} is a status move and gains no damage bonus.`);
		}
		this.sendReplyBox(`${Utils.escapeHTML(move.name)} ${qualifiesForRelicBeam(move) ?
			'gains 50% power from Relic Beam. Malignant Light uses the lower defense when this move is special' :
			qualifiesForMalignantLight(move) ?
				'uses the lower defense with Malignant Light when special' : 'does not receive the Relic Beam power bonus'}.`);
	},
	relicbeamhelp: ['/relicbeam — lists the moves affected by Relic Beam and Malignant Light.',
		'/relicbeam MOVE — checks a particular move. Alias: /beams.'],
};
