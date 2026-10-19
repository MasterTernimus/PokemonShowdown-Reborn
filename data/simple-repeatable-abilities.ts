import type {AbilityDataTable} from '../sim/dex-abilities';

type RepeatableMove = ActiveMove & {
	anchorTargets?: Map<Pokemon, Set<Pokemon>>;
	nightWatchTargets?: Set<Pokemon>;
};

export function installRepeatableAbilities(abilities: AbilityDataTable) {
	abilities.dissonantchime.onSourceDamagingHit = function (damage, target, source, move) {
		if (damage <= 0 || !move.flags.sound || target.isAlly(source)) return;
		let removed = false;
		for (const stat of Object.keys(target.boosts) as BoostID[]) {
			if (target.boosts[stat] > 0) {target.boosts[stat] = 0; removed = true;}
		}
		if (removed) this.add('-clearpositiveboost', target, source, 'ability: Dissonant Chime');
	};
	abilities.disorientingmind.onSourceDamagingHit = function (damage, target, source, move) {
		if (damage > 0 && target.hp && !target.isAlly(source) && move.category !== 'Status' && this.movehasType(move, 'Psychic')) {
			target.addVolatile('torment', source, this.effect);
		}
	};
	abilities.scaleshelter = {
		...abilities.overcoat, id: 'scaleshelter' as ID, name: 'Scale Shelter', num: 11292, rating: 4, flags: {breakable: 1},
		onSourceModifyDamage(damage, source, target, move) {
			if (target.hp === target.maxhp && move.category !== 'Status') return this.chainModify(0.8);
		},
	};
	abilities.anchoredbattery.onSourceDamagingHit = function (damage, target, source, move: RepeatableMove) {
		if (damage <= 0 || target.isAlly(source) || move.category === 'Status' || !(move.flags.pulse || move.flags.bullet)) return;
		const targets = move.anchorTargets ||= new Map();
		if (!targets.has(source)) targets.set(source, new Set());
		targets.get(source)!.add(target);
	};
	abilities.anchoredbattery.onAfterMove = function (source, target, move: RepeatableMove) {
		const targets = move.anchorTargets?.get(source);
		if (!targets) return;
		move.anchorTargets!.delete(source);
		for (const foe of targets) if (foe.hp && foe.isActive) this.boost({spe: -1}, foe, source, this.effect);
	};
	abilities.nightwatch = {
		...abilities.insomnia, id: 'nightwatch' as ID, name: 'Night Watch', num: 11237, rating: 3.5, flags: {breakable: 1},
		onAfterMoveSecondary(target, source, move: RepeatableMove) {
			if (!target.hp || !source?.hp || source.isAlly(target) || move.category !== 'Status' || move.sourceEffect === 'nightwatch') return;
			(move.nightWatchTargets ||= new Set()).add(target);
		},
		onAnyAfterMove(source, target, move: RepeatableMove) {
			const holder = this.effectState.target as Pokemon;
			if (!move.nightWatchTargets?.delete(holder) || !holder.hp || !holder.isActive || !source.hp || !source.isActive ||
				source.isAlly(holder) || source.lastMove?.id !== move.id || holder.m.nightWatchResponding) return;
			const activeMove = this.activeMove, activePokemon = this.activePokemon, activeTarget = this.activeTarget;
			holder.m.nightWatchResponding = true;
			try {
				this.clearActiveMove();
				this.actions.useMove('disable', holder, {target: source, sourceEffect: this.effect});
			} finally {
				delete holder.m.nightWatchResponding;
				this.setActiveMove(activeMove!, activePokemon!, activeTarget!);
			}
		},
	};
	abilities.apexflytrap.onDamagingHit = function (damage, target, source, move) {
		if (damage <= 0 || !target.hp || !source?.hp || !source.isActive || source.isAlly(target) ||
			!this.checkMoveMakesContact(move, source, target) || !source.runStatusImmunity('trapped')) return;
		const trapped = source.volatiles.apexflytraptrapped;
		if (trapped?.source === target) trapped.duration = 2;
		else source.addVolatile('apexflytraptrapped', target, this.effect);
	};
}

export const RepeatableComponents: {[id: string]: string[]} = {
	dissonantchime: [], disorientingmind: ['infiltrator'], scaleshelter: ['overcoat'],
	anchoredbattery: ['megalauncher'], nightwatch: ['insomnia'], apexflytrap: ['levitate'],
};
export const RepeatableRemovals: {[id: string]: string[]} = {
	dissonantchime: ['soundproof'], scaleshelter: ['shielddust'], nightwatch: ['keeneye'],
};
export const RepeatableDescriptions: {[id: string]: {shortDesc: string, desc: string}} = {
	dissonantchime: {shortDesc: 'Immune to opposing sound; damaging sound hits clear positive stages.', desc: 'Immune to opposing sound moves. Each sound attack that damages a foe\'s HP clears that foe\'s positive stat stages. Allied targets, blocked hits and Substitute-only damage do not trigger the reset.'},
	disorientingmind: {shortDesc: 'Infiltrator; damaging Psychic hits inflict Torment.', desc: 'Full local Infiltrator. Each Psychic attack that damages a surviving foe\'s HP attempts to inflict Torment, following normal Torment restrictions. Can activate again after Torment ends.'},
	scaleshelter: {shortDesc: 'Overcoat; takes 20% less attack damage at full HP.', desc: 'Full local Overcoat protects against powder moves and sandstorm/hail damage. Takes 20% less attack damage while at full HP. Each hit checks current HP; no setup move or stored ward is required.'},
	anchoredbattery: {shortDesc: 'Bullet/pulse power 1.5x; damaged foes lose 1 Speed stage per move.', desc: 'Full local Mega Launcher boosts bullet and pulse moves by 1.5x. After each such attack, each surviving active foe whose HP it damaged loses 1 Speed stage, once for the whole move. Normal stat-drop protections apply. Allied targets, blocked hits and Substitute-only damage do not qualify.'},
	nightwatch: {shortDesc: 'Insomnia; disables opposing status moves that successfully affect it.', desc: 'Full local Insomnia prevents and cures sleep, blocks Yawn and boosts Dark/Ghost attacks by 1.3x. After an opposing status move successfully affects it, uses normal Disable against that move\'s user. Failed or blocked moves, self-setup and allied moves do not trigger it. Normal Disable restrictions apply; Night Watch responses cannot trigger one another.'},
	apexflytrap: {shortDesc: 'Levitate; damaging contact traps foes through the following turn.', desc: 'Levitate grants Ground immunity. A foe that damages it with contact is trapped through the end of the following turn while the holder remains active. Further qualifying hits refresh the short duration. Switching out or fainting releases the trap. Normal trapping immunities and escape effects apply; allied hits and Substitute-only damage do not qualify.'},
};
