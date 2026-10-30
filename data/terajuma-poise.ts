import type { AbilityDataTable } from '../sim/dex-abilities';
import { composeSelectedAbility } from './selected-mega-simplifications';

export const TidalPoiseComponents = ['whiplash', 'owntempo'];
export const TidalPoiseDescription = {
	name: 'Tidal Poise',
	shortDesc: 'Whiplash + Own Tempo.',
	desc: 'Gains +1 accuracy on entry; tail moves have 1.5x power. Prevents and cures confusion, and blocks Intimidate\'s Attack drop.',
};

export function installTidalPoise(abilities: AbilityDataTable) {
	abilities.tidalpoise = {
		...TidalPoiseDescription, num: 12062, rating: 4, flags: { breakable: 1 },
	};
	composeSelectedAbility(abilities, 'tidalpoise', TidalPoiseComponents, true);
}
