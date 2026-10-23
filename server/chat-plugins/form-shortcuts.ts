import { Utils } from '../../lib';

/** Public form discovery; canonical species data remains authoritative. */
export const commands: Chat.ChatCommands = {
	pokemonshortcuts: 'formshortcuts',
	formshortcuts() {
		if (!this.runBroadcast()) return;
		this.sendReplyBox('<strong>Pokémon form shortcuts</strong><br />Ursaluna-BM → Ursaluna-Bloodmoon<br />Tauros-Blaze → Tauros-Paldea-Blaze<br />Tauros-Aqua → Tauros-Paldea-Aqua<br />Use <code>/formlist</code> to list Mega and Gigantamax forms, or <code>/formlist Pokémon</code> for all forms of one species.');
	},
	formshortcutshelp: ['/formshortcuts - Lists supported short names for Bloodmoon Ursaluna and Paldean Tauros.'],
	formlist(target) {
		if (!this.runBroadcast()) return;
		const species = target.trim() ? Dex.species.get(target) : null;
		if (species && !species.exists) return this.errorReply('Pokémon not found. Use /formshortcuts for accepted shortcuts.');
		const rows = Dex.species.all().filter(row => row.exists && (species ? row.baseSpecies === species.baseSpecies : row.isMega || row.forme === 'Gmax'));
		const groups: { [label: string]: string[] } = {};
		for (const row of rows) {
			const kind = row.isMega ? 'Mega Evolutions' : row.forme === 'Gmax' ? 'Gigantamax forms' : 'Base and other forms';
			(groups[kind] ||= []).push(row.name);
		}
		const html = Object.entries(groups).map(([label, names]) => '<strong>' + label + '</strong><br />' + names.sort().map(name => Utils.escapeHTML(name)).join(', ')).join('<br /><br />');
		this.sendReplyBox(html || 'No matching forms.');
	},
	formlisthelp: ['/formlist - Lists Mega and Gigantamax forms in separate groups.', '/formlist Pokémon - Lists the base species and all its forms. Accepts /formshortcuts aliases.'],
};
