import type { AbilityDataTable } from '../sim/dex-abilities';

const chargingMoves = new Set([
	'guardsplit', 'powersplit', 'guardswap', 'powerswap', 'heartswap',
	'speedswap', 'painsplit', 'powertrick', 'powershift',
]);

export function installWorldAxis(abilities: AbilityDataTable) {
	abilities.worldaxis = {
		name: 'World Axis', num: 11988, rating: 4, flags: {},
		shortDesc: 'Starts Wonder Room. Successful split/swap moves charge the next attack: 1.5x power.',
		desc: 'Starts Wonder Room on entry, including Mega Evolution, using its normal duration rules. An existing Wonder Room is not toggled off or refreshed. Successfully using Guard Split, Power Split, Guard Swap, Power Swap, Heart Swap, Speed Swap, Pain Split, Power Trick, or Power Shift charges the next damaging move to 1.5x power. Charges do not stack. The charge is spent when the attack is attempted, including misses and Protect; being unable to move preserves it. All hits and targets of that move receive the bonus. Fixed damage is unchanged. Two-turn attacks spend the charge on their attacking turn; delayed attacks retain the bonus in their queued attack. Switching out or losing the ability clears the charge; Baton Pass cannot transfer it.',
		onStart(pokemon) {
			if (!this.field.getPseudoWeather('wonderroom')) {
				this.add('-ability', pokemon, 'World Axis');
				this.field.addPseudoWeather('wonderroom', pokemon, this.effect);
			}
		},
		onModifyMove(move, pokemon) {
			if (!chargingMoves.has(move.id)) return;
			const onHit = move.onHit;
			const isToggle = move.id === 'powertrick' || move.id === 'powershift';
			const before = pokemon.volatiles[move.id];
			move.onHit = function (target, source, attack) {
				const result = typeof onHit === 'function' ? onHit.call(this, target, source, attack) : onHit;
				const success = isToggle ? source.volatiles[attack.id] !== before : typeof onHit === 'function' && result !== false && result !== null;
				if (success && source.hp && source.hasAbility('worldaxis')) source.addVolatile('worldaxis');
				return result;
			};
		},
		onTryMove(pokemon, target, move) {
			if (move.category === 'Status' || !pokemon.volatiles.worldaxis) return;
			pokemon.removeVolatile('worldaxis');
			(move as any).worldAxisCharged = true;
			// Future attacks construct a fresh damage packet instead of retaining the active move.
			if (move.flags.futuremove && typeof move.onTry === 'function') {
				const onTry = move.onTry;
				move.onTry = function (source, target, attack) {
					const before = target.side.slotConditions[target.position].futuremove;
					const result = onTry.call(this, source, target, attack);
					const queued = target.side.slotConditions[target.position].futuremove;
					if (queued && queued !== before && queued.source === source && queued.moveData?.basePower) {
						queued.moveData.basePower = this.modify(queued.moveData.basePower, 1.5);
					}
					return result;
				};
			}
		},
		onBasePowerPriority: 23,
		onBasePower(basePower, source, target, move) {
			if ((move as any).worldAxisCharged) return this.chainModify(1.5);
		},
		onEnd(pokemon) {
			pokemon.removeVolatile('worldaxis');
		},
		condition: {
			noCopy: true,
			onStart(pokemon) {
				this.add('-start', pokemon, 'ability: World Axis');
			},
			onEnd(pokemon) {
				this.add('-end', pokemon, 'ability: World Axis');
			},
		},
	};
}
