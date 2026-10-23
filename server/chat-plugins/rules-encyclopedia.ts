import { rulesCatalog, rulesDetail, teamClinic } from '../rules-encyclopedia';
export const commands: Chat.ChatCommands = {
	interactiontest(target, room, user, connection) {
		connection.send('|queryresponse|interactiontest|{"open":true}');
	},
	interactiontesthelp: ['/interactiontest - privately opens the sampled, single-action interaction sandbox. Unsupported state is rejected.'],
	customrules(target, room, user, connection) {
		// Private navigation response only, including when invoked from a public room.
		connection.send('|queryresponse|customrules|{"open":true}');
	},
	customruleshelp: ['/customrules - privately opens Custom Rules and the read-only team clinic.'],
	rulesencyclopedia(target, room, user, connection) {
		if (target.length > 26000) return this.errorReply('Rules request is too large.');
		let action = '', requestId = '';
		try {
			const request = target ? JSON.parse(target) : { action: 'catalog' };
			action = request.action || 'catalog';
			if (typeof request.requestId === 'string' && /^[a-z0-9-]{1,80}$/i.test(request.requestId)) requestId = request.requestId;
			const data = request.action === 'clinic' ? teamClinic(request) : request.action === 'detail' ? rulesDetail(request.kind, request.query) : rulesCatalog();
			connection.send(`|queryresponse|rulesencyclopedia|${JSON.stringify({ action, requestId, data })}`);
		} catch (error) {
			connection.send(`|queryresponse|rulesencyclopedia|${JSON.stringify({ action, requestId, error: (error as Error).message })}`);
		}
	},
	rulesencyclopediahelp: ['/rulesencyclopedia - read current custom rules in supported clients. Team clinic checks never modify your team.'],
};
