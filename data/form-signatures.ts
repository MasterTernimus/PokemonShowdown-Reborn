/** Form-bound signatures keep the original move slot and its PP. */
import { StoneSignatures } from './stone-signatures';
import { SamurottSignatures } from './samurott-shogun';
export const FormSignatures = {
	...SamurottSignatures,
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

// These four conversions are applied in their original move or ability hooks.
export const MegaSignatureNames = new Set([
	...Object.entries(FormSignatures).filter(([form]) => form.includes('mega')).map(([, move]) => move.name),
	...Object.values(StoneSignatures).map(move => move.name),
	...Object.values(SamurottSignatures).map(move => move.name),
	'Snare Vine', 'F.M. Impression', 'Gilded Wing', 'Crown Crash',
]);

export function applyMegaSignatureCategory(move: ActiveMove, source: Pokemon, name = move.name) {
	if (!MegaSignatureNames.has(name) || move.category === 'Status' || move.isZ || move.isMax) return;
	const signature = source.battle.dex.moves.get(name);
	// Armor Slam's physical damage has always been powered by the user's Defense.
	const physicalStat = signature.overrideOffensiveStat === 'def' ? 'def' : 'atk';
	const physical = source.getStat(physicalStat, false, true);
	const special = source.getStat('spa', false, true);
	const usePhysical = physical > special || (physical === special && signature.category === 'Physical');
	move.flags = { ...move.flags, adaptivecategory: 1, megasignature: 1 };
	move.category = usePhysical ? 'Physical' : 'Special';
	move.overrideOffensiveStat = usePhysical ? physicalStat : 'spa';
	// Some base moves choose a defensive stat in their own category hook. Recompute it for the signature.
	if (move.overrideDefensiveStat && !signature.overrideDefensiveStat) delete move.overrideDefensiveStat;
}

/** A stone signature may change which positions can be selected before the move runs. */
export function signatureTarget(form: string, move: string) {
	const stone = StoneSignatures[form];
	if (stone?.base === move) return stone.changes.target;
	if (form === 'gardevoirvoidmega' && move === 'swift') return 'normal';
	if (form === 'ampharosmega' && move === 'discharge') return 'normal';
	if (form === 'cameruptmega' && move === 'lavaplume') return 'allAdjacentFoes';
}

export function formSignature(pokemon: Pokemon, move: string) {
	const stone = StoneSignatures[pokemon.species.id];
	if (stone?.base === move) return stone;
	const entry = FormSignatures[pokemon.species.id as keyof typeof FormSignatures];
	if (entry?.base !== move || (entry.ability && (!pokemon.hasAbility(entry.ability) ||
		(entry.ability === 'shadowbond' && pokemon.transformed)))) return;
	return entry;
}
