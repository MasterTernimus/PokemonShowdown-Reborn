/** Form-bound signatures keep the original move slot and its PP. */
import { StoneSignatures } from './stone-signatures';
export const FormSignatures = {
	gallademega: { base: 'psychocut', name: 'Saber Parry', ability: '' },
	gallademegaazzy: { base: 'psychocut', name: 'Saber Parry', ability: '' },
	gardevoirmega: { base: 'hypervoice', name: 'Guard Song', ability: '' },
	gardevoirmegaalt: { base: 'hypervoice', name: 'Guard Song', ability: '' },
	gardevoirmegaz: { base: 'slash', name: 'Veil Slash', ability: '' },
	gardevoirvoidmega: { base: 'swift', name: 'Void Volley', ability: '' },
	manectricmega: { base: 'voltswitch', name: 'Bolt Dash', ability: '' },
	pidgeotmega: { base: 'airslash', name: 'Gale Slice', ability: '' },
	steelixmega: { base: 'irontail', name: 'Anchor Slam', ability: '' },
	beedrillmega: { base: 'twineedle', name: 'Triple Sting', ability: '' },
	aerodactylmega: { base: 'stoneedge', name: 'Talon Dive', ability: '' },
	houndoommega: { base: 'darkpulse', name: 'Dread Howl', ability: '' },
	ampharosmega: { base: 'discharge', name: 'Beacon Beam', ability: '' },
	banettemega: { base: 'shadowclaw', name: 'Hex Stitch', ability: '' },
	altariamega: { base: 'dragonpulse', name: 'Cloud Song', ability: '' },
	lopunnymega: { base: 'jumpkick', name: 'Pivot Kick', ability: '' },
	sableyemega: { base: 'powergem', name: 'Greed Gospel', ability: '' },
	cameruptmega: { base: 'lavaplume', name: 'Crater Burst', ability: '' },
	aggronmega: { base: 'heavyslam', name: 'Armor Slam', ability: '' },
	audinomega: { base: 'healbell', name: 'Pulse Chime', ability: '' },
	feraligatrmega: { base: 'riptidefang', name: 'Crush Bite', ability: '' },
	sharpedomega: { base: 'riptidefang', name: 'Razor Bite', ability: '' },
	ledianmega: { base: 'carapacejab', name: 'Comet Jab', ability: '' },
	arcaninebattlebond: { base: 'extremespeed', name: 'Sacred Rush', ability: 'sacredbond' },
	garchompbattlebond: { base: 'dualchop', name: 'Apex Cleave', ability: 'apexbond' },
	greninjaash: { base: 'watershuriken', name: 'Shadow Shuriken', ability: 'shadowbond' },
	mawilemega: { base: 'playrough', name: 'False Smile', ability: '' },
	scizormega: { base: 'bulletpunch', name: 'Pincer Jab', ability: '' },
} as const;

export function formSignature(pokemon: Pokemon, move: string) {
	const stone = StoneSignatures[pokemon.species.id];
	if (stone?.base === move) return stone;
	const entry = FormSignatures[pokemon.species.id as keyof typeof FormSignatures];
	if (entry?.base !== move || (entry.ability && (!pokemon.hasAbility(entry.ability) ||
		(entry.ability === 'shadowbond' && pokemon.transformed)))) return;
	return entry;
}
