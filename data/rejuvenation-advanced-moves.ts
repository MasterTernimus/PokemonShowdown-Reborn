import type {MoveDataTable} from '../sim/dex-moves';

function signatureMoveText(id: string, credit: string, details: string) {
	const summaries: {[id: string]: string} = {
		vorpalblade: 'Hits foes; field-based secondary effects and Glitch form.',
		gildedarrow: 'User-dependent type; high critical-hit ratio.',
		gildedhelix: 'Two hits; user-dependent type; high crit rate each hit.',
		beasthunter: 'Hits foes; best category per target; 25% through Protect.',
	};
	return {shortDesc: `${credit}'s move. ${summaries[id]}`, desc: `${credit}'s move. ${details}`};
}

/** Rejuvenation's supported user-type rule; Fairy/Dark second types defer to the first type. */
function gildedType(this: Battle, move: ActiveMove, source: Pokemon) {
	const types = source.getTypes();
	move.type = types[1] && !['Fairy', 'Dark'].includes(types[1]) ? types[1] : types[0];
}

export const RejuvenationAdvancedMoves: MoveDataTable = {
	vorpalblade: {
		num: 10462, name: 'Vorpal Blade', type: 'Fairy', category: 'Physical',
		basePower: 75, accuracy: 100, pp: 20, priority: 0, target: 'allAdjacentFoes',
		flags: {protect: 1, mirror: 1}, secondary: {chance: 30, status: 'par'},
		onModifyMove(move, source) {
			// Copy only Secret Power's selected secondary effects, never its identity,
			// type, power, targeting, or Flower Garden/Icy move transformations.
			const probe = this.dex.getActiveMove('secretpower');
			this.dex.moves.get('secretpower').onModifyMove?.call(this, probe, source, source);
			move.secondaries = probe.secondaries ? this.dex.deepClone(probe.secondaries) : null;
			if (this.field.isTerrain('glitchterrain')) {
				Object.assign(move, {name: 'Unown Buster'});
				move.basePower = 175;
				move.type = '???';
				(move as ActiveMove & {fullDamageSpread?: boolean}).fullDamageSpread = true;
			}
		},
		onEffectiveness(typeMod, target, type) {
			if (type === '???' && this.field.isTerrain('glitchterrain')) return 1;
		},
	},
	gildedarrow: {
		num: 10463, name: 'Gilded Arrow', type: 'Normal', category: 'Special',
		basePower: 80, accuracy: 100, pp: 15, priority: 0, target: 'normal',
		flags: {protect: 1, mirror: 1}, critRatio: 2, onModifyType: gildedType,
	},
	gildedhelix: {
		num: 10464, name: 'Gilded Helix', type: 'Normal', category: 'Special',
		basePower: 50, accuracy: 100, pp: 15, priority: 0, target: 'normal',
		flags: {protect: 1, mirror: 1}, critRatio: 2, multihit: 2, onModifyType: gildedType,
	},
	poisonsweep: {
		num: 10466, name: 'Poison Sweep', type: 'Poison', category: 'Physical',
		basePower: 50, accuracy: 100, pp: 10, priority: 0, target: 'normal',
		flags: {contact: 1, protect: 1, mirror: 1}, secondary: {chance: 30, boosts: {spe: -1}},
	},
	stackingshot: {
		num: 10467, name: 'Stacking Shot', type: 'Fighting', category: 'Physical',
		basePower: 40, accuracy: 100, pp: 10, priority: 0, target: 'normal',
		flags: {contact: 1, protect: 1, mirror: 1, punch: 1, bullet: 1},
		basePowerCallback(source, target, move) {
			return this.dex.moves.get('furycutter').basePowerCallback!.call(this, source, target, move);
		},
		onMoveFail(target, source) { source.removeVolatile('furycutter'); },
	},
	irritation: {
		num: 10468, name: 'Irritation', type: 'Bug', category: 'Special',
		basePower: 60, accuracy: 100, pp: 10, priority: 0, target: 'normal',
		flags: {protect: 1, mirror: 1},
		basePowerCallback(source, target, move) { return target.status ? move.basePower * 2 : move.basePower; },
	},
	slashandburn: {
		num: 10469, name: 'Slash and Burn', type: 'Grass', category: 'Physical',
		basePower: 90, accuracy: 90, pp: 10, priority: 0, target: 'normal',
		flags: {contact: 1, protect: 1, mirror: 1, slicing: 1}, secondary: {chance: 10, status: 'brn'},
	},
	magmadrift: {
		num: 10470, name: 'Magma Drift', type: 'Fire', category: 'Special',
		basePower: 90, accuracy: 100, pp: 15, priority: 0, target: 'allAdjacent',
		flags: {protect: 1, mirror: 1, defrost: 1},
	},
	beasthunter: {
		num: 10465, name: 'Beast Hunter', type: 'Dragon', category: 'Special',
		basePower: 95, accuracy: 100, pp: 20, priority: 0, target: 'allAdjacentFoes',
		flags: {protect: 1, mirror: 1, contact: 1},
		// Per-target calculated-category views and quarter-damage protection are
		// handled by the engine, so spread targets cannot overwrite one another.
	},
};

export const RejuvenationAdvancedLearnsets: {[id: string]: string[]} = {
	poisonsweep: ['ariados', 'drapion', 'scolipede', 'toxicroak', 'seviper', 'garbodor'],
	stackingshot: ['miltank', 'heracross', 'gallade', 'leavanny', 'zangoose'],
	irritation: ['vivillon', 'venomoth', 'galvantula', 'masquerain', 'beautifly', 'mothim'],
	slashandburn: ['kabutops', 'scyther', 'scizor', 'kleavor', 'infernape', 'ceruledge', 'leavanny', 'lurantis'],
	magmadrift: ['coalossal', 'dragonite', 'camerupt', 'magcargo', 'torkoal', 'turtonator'],
	vorpalblade: ['rapidashgalar', 'ironvaliant', 'miloticaevian', 'mawile'],
	gildedarrow: ['zoroark', 'togekiss', 'hydreigon', 'noivern'],
	gildedhelix: ['togekiss', 'aegislash', 'hydreigon', 'clefable', 'articunogalar', 'kingdra'],
	beasthunter: ['latios', 'tyranitar', 'dragapult', 'hydreigon', 'kommooaevian', 'gyaradosaevian', 'tyrantrum'],
};
export const RejuvenationAdvancedCredits: {[id: string]: string} = {
	poisonsweep: 'Rejuvenation', stackingshot: 'Rejuvenation', irritation: 'Rejuvenation',
	slashandburn: 'Rejuvenation', magmadrift: 'Rejuvenation',
	vorpalblade: 'Allen', gildedarrow: 'Melia', gildedhelix: 'Melia', beasthunter: 'Damien',
};
export const RejuvenationAdvancedDescriptions = {
	poisonsweep: {shortDesc: '30% chance to lower Speed by 1.', desc: 'Makes contact. Has a 30% chance to lower the target\'s Speed by 1 stage.'},
	stackingshot: {shortDesc: 'Shares Fury Cutter\'s 40/80/160 consecutive-hit chain.', desc: 'A contact, punching and bullet move. Shares the successful-use chain with Fury Cutter: 40, 80, then 160 power. Alternating these moves preserves the chain. A miss, failed hit, unrelated move or switch resets it.'},
	irritation: {shortDesc: 'Double power against a statused target.', desc: 'Power doubles from 60 to 120 if the target has a major status condition.'},
	slashandburn: {shortDesc: '10% chance to burn. Contact; slicing.', desc: 'Makes contact and is a slicing move. Has a 10% chance to burn the target.'},
	magmadrift: {shortDesc: 'Hits all adjacent. Thaws user; 2x against Dive.', desc: 'Hits all adjacent Pokémon, including allies. Thaws the user. Hits targets using Dive for double damage. Does not burn.'},
	vorpalblade: signatureMoveText('vorpalblade', 'Allen', 'Hits both foes. Uses field-selected Secret Power secondary effects, normally a 30% chance. Not a slicing move. Bewitched Woods boosts this move by 1.2x, combining with its Fairy boost for 1.8x. On Glitch, becomes Unown Buster: 175 power, ??? type, super effective against ??? targets, and no spread damage penalty. These changes last only for that use.'),
	gildedarrow: signatureMoveText('gildedarrow', 'Melia', 'High critical-hit ratio. Uses the user\'s current secondary type unless it is Fairy or Dark; otherwise uses the primary type. Ordinary type, field and aura effects apply.'),
	gildedhelix: signatureMoveText('gildedhelix', 'Melia', 'Hits twice at 50 power each. Each hit has a high critical-hit ratio. Uses the user\'s current secondary type unless it is Fairy or Dark; otherwise uses the primary type. Ordinary type, field and aura effects apply.'),
	beasthunter: signatureMoveText('beasthunter', 'Damien', 'Hits both foes. Independently chooses the Physical or Special category dealing greater calculated damage against each target; ties use Special. Makes contact in either category. Deals 25% damage through protection without removing it. Normal priority.'),
};
