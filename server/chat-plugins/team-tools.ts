import { Battle } from '../../sim/battle';
import { Dex } from '../../sim/dex';
import { Teams } from '../../sim/teams';
import { TeamValidator } from '../../sim/team-validator';

function selectedFormat(value: unknown) {
	if (typeof value !== 'string' || !value.trim()) throw new Error('No format selected.');
	const id = Dex.formats.validate(value);
	const format = Dex.formats.get(id);
	if (!format.exists || format.effectType !== 'Format') throw new Error('Selected format is unavailable on this server.');
	return format;
}

export function previewForms(formatName: unknown, packed: unknown) {
	const format = selectedFormat(formatName);
	if (typeof packed !== 'string' || packed.length > 12000) throw new Error('Invalid preview set.');
	const team = Teams.unpack(packed);
	if (!team || team.length !== 1 || !Dex.species.get(team[0].species).exists) {
		throw new Error('Select one known Pokémon.');
	}
	const battle = new Battle({ formatid: format.id, format });
	try {
		// Only constructing one side avoids entry abilities/weather changing a set preview.
		battle.setPlayer('p1', { name: 'Preview', team: JSON.parse(JSON.stringify(team)) });
		const pokemon = battle.p1.pokemon[0];
		const options: {
			id: string, name: string, kind: string, baseStats: StatsTable, types: string[], ability: string,
		}[] = [];
		const add = (name: string | false | null | undefined, kind: string) => {
			if (!name) return;
			const species = battle.dex.species.get(name);
			if (!species.exists || options.some(option => option.id === species.id) || species.id === pokemon.species.id) return;
			options.push({
				id: species.id, name: species.name, kind, baseStats: species.baseStats,
				types: species.types, ability: species.abilities['0'],
			});
		};
		if (battle.gimmickLimit > 0) {
			add(pokemon.canMegaEvo, 'Mega');
			add(pokemon.canMegaEvoX, 'Mega');
			add(pokemon.canMegaEvoY, 'Mega');
			if (pokemon.side.canDynamaxNow() && pokemon.canGigantamax && !pokemon.species.cannotDynamax) {
				add(pokemon.canDynamax, 'G-Max');
			}
		}
		return { format: format.name, options,
			note: 'Form/stat preview only. Saved set unchanged. Local G-Max uses form stats without a temporary HP multiplier. ' +
				'Team legality and spent battle gimmicks are not checked here.' };
	} finally {
		battle.destroy();
	}
}

export function validateSavedTeams(input: unknown) {
	if (!Array.isArray(input) || !input.length || input.length > 12) {
		throw new Error('Select 1–12 teams per validation batch.');
	}
	return input.map((entry, index) => {
		const base = {
			index, name: String(entry?.name || `Team ${index + 1}`).slice(0, 100), format: String(entry?.format || ''),
		};
		try {
			const format = selectedFormat(entry?.format);
			if (typeof entry?.team !== 'string' || entry.team.length > 16000) throw new Error('Team data is missing or too large.');
			const team = Teams.unpack(entry.team);
			if (!team?.length) throw new Error('Team roster is missing.');
			// Validator may normalize its input. Always give it a fresh unpacked copy.
			const problems = TeamValidator.get(format.id).validateTeam(team) || [];
			const suggestions = new Set<string>();
			for (const problem of problems) {
				if (/move|learn/i.test(problem)) suggestions.add('Choose a move allowed for this species and format.');
				if (/EV|IV|stat/i.test(problem)) suggestions.add('Review the listed EV/IV or stat limit.');
				if (/ability/i.test(problem)) suggestions.add('Select an ability allowed for this form.');
				if (/item/i.test(problem)) suggestions.add('Review the held item and its format restrictions.');
				if (/species|Pok.mon|banned/i.test(problem)) {
					suggestions.add('Review the named restriction or choose another permitted set.');
				}
			}
			return { ...base, format: format.name, status: problems.length ? 'invalid' : 'valid', problems,
				suggestions: [...suggestions], permissive: /custom game/i.test(format.name) || format.id.includes('customgame'),
				matchup: 'Not checked: opponent roster and matchup-specific rule definitions were not supplied.' };
		} catch (error) {
			return { ...base, status: 'not checked', problems: [(error as Error).message], suggestions: [], permissive: false,
				matchup: 'Not checked: no authoritative matchup validation was performed.' };
		}
	});
}

const recentRequests = new WeakMap<User, number>();
export const commands: Chat.ChatCommands = {
	teamtools(target, room, user, connection) {
		let requestId = '';
		const respond = (result: object) => {
			connection.send(`|queryresponse|teamtools|${JSON.stringify({ ...result, requestId })}`);
		};
		try {
			if (target.length > 60000) throw new Error('Request is too large.');
			const payload = JSON.parse(target);
			requestId = String(payload.requestId || '').slice(0, 64);
			const now = Date.now();
			if (now - (recentRequests.get(user) || 0) < 300) throw new Error('Please wait briefly before retrying.');
			recentRequests.set(user, now);
			if (payload.action === 'preview') return respond(previewForms(payload.format, payload.team));
			if (payload.action === 'validate') return respond({ results: validateSavedTeams(payload.teams) });
			throw new Error('Unknown team tool action.');
		} catch (error) {
			return respond({ error: (error as Error).message });
		}
	},
};
