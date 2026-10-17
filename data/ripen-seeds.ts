/** Held Seeds only. Standard terrain Seeds are supported if present in a mod. */
export const RipenSeedItems = new Set([
	'electricseed', 'grassyseed', 'mistyseed', 'psychicseed',
	'elementalseed', 'magicalseed', 'syntheticseed', 'telluricseed',
]);

export const RipenSeedDescriptions = {
	ripen: {
		name: 'Ripen',
		shortDesc: 'Doubles applicable Berry effects and positive held-Seed stat boosts.',
		desc: 'Applicable Berry effects are doubled. Positive stat boosts from held Seed items are doubled before Simple or Contrary; Seed stat drops and other effects are unchanged. Seed moves are unaffected.',
	},
	evergreen: {
		name: 'Evergreen',
		shortDesc: 'Overcoat + Ripen.',
		desc: 'Overcoat + Ripen: immune to powder moves and sandstorm/hail damage; doubles applicable Berry effects and positive held-Seed stat boosts. Seed stat drops and other effects are unchanged.',
	},
};
