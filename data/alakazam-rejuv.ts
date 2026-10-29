import type {AbilityDataTable} from '../sim/dex-abilities';

export const AevianDisciplineMoves = `
Coaching, Disable, Drain Punch, Mach Punch, Shadow Punch, Bullet Punch,
Thunder Punch, Fire Punch, Ice Punch, Dynamic Punch, Needle Arm, Bind,
Plasma Fists, Wicked Blow, Assurance, Body Slam, Brick Break, Bulk Up,
Bulldoze, Close Combat, Force Palm, Cross Poison, Curse, Darkest Lariat,
Dig, Double-Edge, Dual Chop, Earthquake, Fire Blast, Fissure,
Flamethrower, Fling, Focus Blast, Focus Energy, Focus Punch, Giga Impact,
Headbutt, Heavy Slam, High Horsepower, Hyper Beam, Incinerate, Knock Off,
Light Screen, Low Kick, Low Sweep, Mega Kick, Mega Punch, Metronome,
Mimic, Mud-Slap, Payback, Poison Jab, Power-Up Punch, Rage, Rain Dance,
Retaliate, Revenge, Reversal, Rock Blast, Rock Climb, Rock Slide,
Rock Smash, Rock Tomb, Role Play, Scary Face, Seismic Toss, Skull Bash,
Smack Down, Stomping Tantrum, Stone Edge, Strength, Submission, Sunny Day,
Superpower, Take Down, Thief, Throat Chop, Vacuum Wave, Work Up,
Poison Sweep, Stacking Shot, Facade, Hidden Power,
Tackle, Return, Round, Secret Power, Sleep Talk, Teleport, Ally Switch,
Calm Mind, Charge Beam, Dazzling Gleam, Dream Eater, Embargo, Energy Ball,
Foul Play, Grass Knot, Gravity, Guard Swap, Iron Tail, Magic Coat,
Magic Room, Mystical Power, Power Swap, Psychic, Psychic Terrain,
Psyshock, Recycle, Reflect, Safeguard, Shadow Ball, Shock Wave,
Signal Beam, Skill Swap, Swift, Taunt, Telekinesis, Thunder Wave,
Torment, Tri Attack, Trick, Wonder Room, Zap Cannon, Zen Headbutt,
Helping Hand, Kinesis, Expanding Force, Future Sight, Night Shade,
Psycho Cut, Psywave
`.trim().split(',').map(name => name.toLowerCase().replace(/[^a-z0-9]/g, ''))
	.map(id => id === 'mudslap' ? 'mudbarrage' : id); // Existing server-wide Mud-Slap replacement.

export function installAlakazamRejuv(abilities: AbilityDataTable) {
	abilities.aeviandiscipline = {
		...abilities.owntempo,
		name: 'Aevian Discipline', num: 12060, rating: 3, flags: {breakable: 1},
		shortDesc: 'Alakazam becomes Rejuv. Iron Fist + Own Tempo.',
		desc: 'Alakazam becomes its pure Fighting-type Rejuv form. Includes local Iron Fist and Own Tempo: punching moves have 1.4x power, and the user cannot be confused or affected by Intimidate.',
		onStart(pokemon) {
			if (pokemon.species.id === 'alakazam') pokemon.formeChange('Alakazam-Rejuv', this.effect, true, '0');
		},
		onBasePowerPriority: abilities.ironfist.onBasePowerPriority,
		onBasePower(power, source, target, move) {
			return this.dex.abilities.get('ironfist').onBasePower?.call(this, power, source, target, move);
		},
	};
	abilities.composed = {
		...abilities.magicguard,
		...abilities.innerfocus,
		name: 'Composed', num: 12061, rating: 3.5, flags: {breakable: 1},
		shortDesc: 'Physical damage taken: 0.8x. Inner Focus + Magic Guard.',
		desc: 'Incoming physical attacks deal 20% less damage, whether or not they make contact. Includes Inner Focus and Magic Guard: prevents flinching and Intimidate, and prevents indirect damage. Status conditions can still be inflicted. Special damage is not reduced, and this ability does not boost damage dealt.',
		onSourceModifyDamage(damage, source, target, move) {
			if (move.category === 'Physical') return this.chainModify(0.8);
		},
	};
}
