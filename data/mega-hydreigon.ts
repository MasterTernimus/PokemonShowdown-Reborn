import type {AbilityDataTable} from '../sim/dex-abilities';
import {composeSelectedAbility} from './selected-mega-simplifications';

export const MegaHydreigonDescriptions = {
	expiration: {
		shortDesc: 'Strings of Ruin; Fairy attacks deal neutral damage.',
		desc: 'Strings of Ruin grants Berserk and Duskilate, plus a 30% double-power chance per hit (50% on Dragon’s Den; excludes Fickle Beam). Fairy attacks deal neutral damage.',
	},
	abyssalrebirth: {
		shortDesc: 'Hydra Bond + Levitate.',
		desc: 'Hydra Bond adds its follow-up hits. Levitate grants Ground immunity.',
	},
};

export function installMegaHydreigon(abilities: AbilityDataTable) {
	abilities.expiration = {name: 'Expiration', num: 11980, rating: 5, flags: {}};
	composeSelectedAbility(abilities, 'expiration', ['stringsofruin'], true);
	abilities.expiration.onEffectiveness = function (typeMod, target, type, move) {
		if (move.type === 'Fairy') return 0;
	};
	abilities.abyssalrebirth = {
		...abilities.hydraflight, name: 'Abyssal Rebirth', num: 11981,
	};
	for (const [id, text] of Object.entries(MegaHydreigonDescriptions)) Object.assign(abilities[id as Lowercase<string>], text);
}
