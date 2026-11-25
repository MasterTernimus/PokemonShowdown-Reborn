import { Battle as SimulatorBattle } from '../sim/battle';
import { applyMegaSignatureCategory } from './form-signatures';
import type { AbilityDataTable } from '../sim/dex-abilities';
import type { MoveDataTable } from '../sim/dex-moves';

const trapIds = ['snarevine', 'partiallytrapped', 'trapped', 'octolock', 'apexflytraptrapped'];
function trappedBy(target: Pokemon, trapper: Pokemon) {
	return !target.isAlly(trapper) && trapper.isActive && trapper.hp > 0 &&
		target.runStatusImmunity('trapped') && trapIds.some(id => target.volatiles[id]?.source === trapper);
}

export function installMegaSignatureAbilities(abilities: AbilityDataTable) {
	abilities.armoredshell = {
		...abilities.heatproof, name: 'Armored Shell', num: 32651,
		onModifyMove(move) {
			if (move.type === 'Water' && move.category !== 'Status') move.forceSTAB = true;
		},
	};
	const solar = abilities.solartrap;
	const accumulationResidual = solar.onResidual!;
	solar.onSourceModifyDamage = function (damage, attacker, defender) {
		if (trappedBy(attacker, defender)) return this.chainModify(0.7);
	};
	solar.onResidual = function (pokemon) {
		accumulationResidual.call(this, pokemon, pokemon, this.effect);
		for (const foe of pokemon.foes()) {
			if (!foe.hp || !trappedBy(foe, pokemon)) continue;
			const drained = this.damage(Math.max(1, Math.floor(foe.baseMaxhp / 16)), foe, pokemon, this.effect);
			if (drained) this.heal(drained, pokemon, foe, this.dex.conditions.get('drain'));
		}
	};
	// At AfterFaint the engine has already cleared the target's trap.
	solar.onSourceFaint = function (foe, source) {
		if (source && trappedBy(foe, source)) this.heal(source.baseMaxhp / 2, source, source, this.effect);
	};
}

export function installMegaSignatureMoves(moves: MoveDataTable) {
	moves.snarevine = {
		...moves.powerwhip, name: 'Snare Vine', num: 32652, accuracy: 100, isNonstandard: 'Custom',
		onHit(target, source, move) {
			if (target.hp && !source.isAlly(target) && target.runStatusImmunity('trapped'))
				target.addVolatile('snarevine', source, move);
		},
		condition: {
			duration: 2, noCopy: true, onResidualOrder: 29,
			onStart(target) { this.add('-start', target, 'move: Snare Vine'); },
			onRestart() { this.effectState.duration = 2; },
			onTrapPokemon(target) { if (this.effectState.source?.isActive && this.effectState.source.hp) target.tryTrap(); },
			onAnySwitchOut(pokemon) {
				if (pokemon === this.effectState.source) this.effectState.target.removeVolatile('snarevine');
			},
			onAnyFaint(pokemon) {
				if (pokemon === this.effectState.source) this.effectState.target.removeVolatile('snarevine');
			},
			onEnd(target) { this.add('-end', target, 'move: Snare Vine'); },
		},
	};
	moves.powerwhip.onModifyMove = function (move, source) {
		if (source.species.id !== 'victreebelmega') return;
		(move as { name: string }).name = 'Snare Vine';
		move.accuracy = 100;
		move.onHit = moves.snarevine.onHit;
	};
	moves.fmimpression = { ...moves.firstimpression, name: 'F.M. Impression', num: 32653, isNonstandard: 'Custom' };
	moves.firstimpression.onModifyType = function (move, source, target) {
		if (!['golisopodmega', 'golisopodaevianmega'].includes(source.species.id)) return;
		(move as { name: string }).name = 'F.M. Impression';
		if (!target) return;
		const alternative = source.species.id === 'golisopodmega' ? 'Steel' : 'Ground';
		// Run both candidates from the same battle state so items, fields, STAB and
		// ability immunities count without consuming live RNG or activating items.
		const snapshot = JSON.stringify(this.toJSON());
		const damage = (type: string) => {
			const preview = SimulatorBattle.fromJSON(JSON.parse(snapshot));
			try {
				const attacker = preview.sides[source.side.n].pokemon[source.side.pokemon.indexOf(source)];
				const defender = preview.sides[target.side.n].pokemon[target.side.pokemon.indexOf(target)];
				const candidate = preview.dex.getActiveMove('firstimpression');
				Object.assign(candidate, { type, types: [type], willCrit: false, hit: 1 });
				applyMegaSignatureCategory(candidate, attacker, 'F.M. Impression');
				preview.randomizer = value => value;
				preview.setActiveMove(candidate, attacker, defender);
				if (!defender.runImmunity(candidate) || !preview.runEvent('TryHit', defender, attacker, candidate)) return 0;
				const calculated = preview.actions.getDamage(attacker, defender, candidate, true);
				return typeof calculated === 'number' ? calculated : 0;
			} finally {
				preview.destroy();
			}
		};
		const bug = damage('Bug');
		const other = damage(alternative);
		move.type = other > bug ? alternative : 'Bug';
		move.types = [move.type];
	};
	moves.fmimpression.onModifyType = moves.firstimpression.onModifyType;
}
