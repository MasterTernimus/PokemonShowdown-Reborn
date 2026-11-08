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
		...{
			"shortDesc": "Restores a consumed Berry or field Seed: 50% each turn, guaranteed in hail/snow.",
			"desc": "At turn end with an empty item slot, has a 50% chance to restore its last consumed Berry or field Seed. Guaranteed in hail or snow instead of sun.",
		},
	},
};
