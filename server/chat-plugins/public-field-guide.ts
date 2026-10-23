import { publicFieldGuide } from '../field-guide';
export const commands: Chat.ChatCommands = {
	fieldguide(target, room, user, connection) {
		// Public read-only documentation; no rank, login or room permission required.
		connection.send(`|queryresponse|fieldguide|${JSON.stringify(publicFieldGuide())}`);
	},
	fieldguidehelp: ['/fieldguide — opens the public field reference in supported clients.'],
};
