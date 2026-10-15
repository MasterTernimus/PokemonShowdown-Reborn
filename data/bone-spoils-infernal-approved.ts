import type {AbilityDataTable} from '../sim/dex-abilities';

function rewardHit(this: Battle, damage: number, target: Pokemon, source: Pokemon, move: ActiveMove) {
	const id = this.effect.id.replace('speciespassive', '');
	if (damage <= 0 || target.isAlly(source) || !(id === 'bonewarrior' ? move.flags.bone : move.flags.contact)) return;
	((move as any).boneSpoilsHits ||= new Set()).add(source);
}
function rewardResolve(this: Battle, source: Pokemon, target: Pokemon, move: ActiveMove) {
	const id = this.effect.id.replace('speciespassive', '');
	if (source !== this.effectState.target || !source.hp || !source.isActive || !(move as any).boneSpoilsHits?.delete(source)) return;
	const turns = source.m.boneSpoilsTurns ||= {};
	if (turns[id] === this.turn) return;
	turns[id] = this.turn;
	this.heal(source.maxhp / (id === 'bonewarrior' ? 8 : 16), source, source, this.effect);
}
export function installBoneSpoilsInfernal(a: AbilityDataTable) {
	a.bonewarrior = {...a.battlearmor, name: 'Bone Warrior', num: 10282, rating: 4.5,
		onSourceDamagingHit: rewardHit, onAnyAfterAttackResolved: rewardResolve};
	a.battlespoils = {name: 'Battle Spoils', num: 11492, rating: 3,
		onSourceDamagingHit: rewardHit, onAnyAfterAttackResolved: rewardResolve};
	for (const id of ['bonewarrior', 'battlespoils'] as const) {
		for (const [key, callback] of Object.entries(a[id])) {
			if (!key.startsWith('on') || typeof callback !== 'function') continue;
			(a[id] as any)[key] = function (this: Battle, ...args: any[]) {
				if (!this.effectState.speciesPassive && this.effectState.target?.getPassives().includes(id)) return;
				return callback.apply(this, args);
			};
		}
	}
	const old = a.infernaldominion;
	a.infernaldominion = {...old,
		onDamage(damage, target, source, effect) {
			if (effect.id === 'stealthrock') {
				this.add('-message', `${target.name} melted the pointed stones before they could strike!`);
				return false;
			}
		},
		onSourceDamagingHit(damage, target, source, move) {
			old.onSourceDamagingHit?.call(this, damage, target, source, move);
			if (damage > 0 && !target.isAlly(source) && this.movehasType(move, 'Fire') &&
				!move.sourceEffect && !move.flags.futuremove) (move as any).infernalGuardSource = source;
		},
		onAnyAfterAttackResolved(source, target, move) {
			if (source !== this.effectState.target || (move as any).infernalGuardSource !== source) return;
			delete (move as any).infernalGuardSource;
			if (!source.hp || !source.isActive) return;
			if (this.field.weather === 'sandstorm') this.field.clearWeather();
			if (source.m.moltenGuardTurn === this.turn) return;
			source.m.moltenGuardTurn = this.turn;
			source.addVolatile('moltenguard', source, this.effect);
		},
		onEnd(pokemon) { old.onEnd?.call(this, pokemon); pokemon.removeVolatile('moltenguard'); },
		onSwitchOut(pokemon) { pokemon.removeVolatile('moltenguard'); },
	};
}
export const BoneSpoilsInfernalDescriptions = {
	bonewarrior: {name: 'Bone Warrior', shortDesc: 'Battle Armor; bone attacks heal 1/8 max HP once per turn after opposing HP damage.', desc: 'Full local Battle Armor, including critical-hit immunity, 0.8x incoming attack damage and field effects. Once per turn after a bone-flag attack damages opposing HP, the living active holder restores 1/8 max HP after the whole attack. Normal healing restrictions apply. No Self Sufficient recovery or weather immunity.'},
	battlespoils: {name: 'Battle Spoils', shortDesc: 'Contact attacks heal 1/16 max HP once per turn after opposing HP damage.', desc: 'Once per turn after a contact attack damages opposing HP, the living active holder restores 1/16 max HP after the whole attack. No ally or Substitute-only trigger. Normal healing restrictions apply.'},
	infernaldominion: {name: 'Infernal Dominion', shortDesc: 'Intimidate; Fire trap; Rock effectiveness capped at neutral; melts own Stealth Rock damage.', desc: 'Retains Intimidate and the two-turn Fire-hit trap. Incoming Rock attack effectiveness is capped at neutral, preserving stronger resistance or immunity. Prevents only this holder\'s Stealth Rock damage without removing the hazard. A direct Fire attack dealing opposing HP damage clears Sandstorm and, once per turn regardless of weather, grants Molten Guard until turn end. The guard blocks the next opposing Rock attack against this holder, including all hits, without shielding other spread targets. Generated attacks do not arm it. Leaving, ability loss and Mega Evolution clear the guard.'},
};
