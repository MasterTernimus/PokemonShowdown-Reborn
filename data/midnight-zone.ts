import { type TerrainData } from '../sim/dex-terrains';

/** The deepest stage of the water fields. */
export const MidnightZone: TerrainData = {
	name: 'Midnight Zone Terrain',
	condition: {
		effectType: 'Terrain',
		duration: 9999,
		onFieldStart() {
			if (this.field.weather) {
				this.field.clearWeather();
				this.add('-message', "You're too deep to notice the weather!");
			}
			this.add('-fieldstart', 'Midnight Zone Terrain');
			this.add('-message', 'The water pressure is crushing...');
		},
		onFieldEnd() {
			this.add('-fieldend', 'Midnight Zone Terrain');
		},
		onModifySpe(spe, pokemon) {
			if (!pokemon.hasType('Water') && !pokemon.hasAbility(['steelworker', 'schooling', 'swiftswim'])) {
				return this.chainModify(0.25);
			}
		},
		onTryMove(pokemon, target, move) {
			if (move.type === 'Fire') {
				this.add('-message', '...But the attack was doused instantly!');
				return false;
			}
			if (['sunnyday', 'raindance', 'sandstorm', 'hail', 'snowscape', 'chillyreception'].includes(move.id)) {
				this.add('-message', "You're too deep to notice the weather!");
				return false;
			}
			if (['spikes', 'stealthrock', 'stickyweb', 'toxicspikes', 'stoneaxe', 'ceaselessedge'].includes(move.id)) {
				this.add('-message', 'But they sank into the trenches...');
				return false;
			}
			if (['defog', 'tarshot'].includes(move.id)) {
				this.add('-message', 'But it failed!');
				return false;
			}
		},
		// Before Serene Grace, so its usual secondary-effect multiplier applies.
		onModifyMovePriority: 2,
		onModifyMove(move) {
			if (move.category === 'Status') return;
			if (move.type === 'Dark') {
				move.secondaries ||= [];
				move.secondaries.push({chance: 30, onHit(target, source) {
					if (this.boost({spa: -1}, target, source)) {
						this.add('-message', `${target.name} became disorientated by the thick darkness!`);
					}
				}});
				if (move.category === 'Special') {
					// Keep Dark STAB and field bonuses, but use Water's defensive matchups.
					move.onEffectiveness = function (typeMod, target, type) {
						return this.dex.getEffectiveness('Water', type);
					};
				}
			}
			if (move.type === 'Ground') {
				move.midnightGround = true;
				move.type = 'Water';
				delete move.types;
			} else if (['dragondarts', 'gravapple'].includes(move.id)) {
				move.type = 'Water';
				delete move.types;
			}
		},
		onAccuracy(accuracy, target, source) {
			if (source.hasAbility('illuminate')) return true;
		},
		onBasePowerPriority: 6,
		onBasePower(basePower, source, target, move) {
			let modifier = 1;
			const messages: {[type: string]: string} = {
				Water: 'The water strengthened the attack!', Ice: 'Warmth has been eliminated...!',
				Dark: 'Darkness gathers...!', Electric: 'The water super-conducted the attack!',
			};
			if (messages[move.type]) {
				modifier *= move.type === 'Electric' ? 1.2 : 1.5;
				this.add('-message', messages[move.type]);
			}
			if (move.midnightGround || move.type === 'Ground') {
				modifier *= 1.2;
				this.add('-message', 'The trenches strengthened the attack.');
			}
			if (move.id === 'waterpulse') {
				modifier *= 1.5;
				this.add('-message', 'Jet-streamed!');
			}
			if (['anchorshot', 'dragondarts'].includes(move.id)) {
				modifier *= 2;
				this.add('-message', 'From the depths!');
			}
			if (['darkpulse', 'nightdaze', 'nightslash', 'shadowball', 'shadowforce', 'shadowclaw', 'shadowpunch', 'shadowbone'].includes(move.id)) {
				modifier *= 1.2;
				this.add('-message', 'The lightless abyss boosted the attack.');
			}
			if (['signalbeam', 'doomdesire', 'flashcannon', 'lusterpurge', 'dazzlinggleam', 'mirrorshot', 'technoblast', 'powergem', 'moongeistbeam', 'menacingmoonrazemaelstrom'].includes(move.id)) {
				modifier *= 0.5;
				this.add('-message', 'The light disappeared in the dark...');
			}
			if (move.category === 'Physical' && !source.hasType('Water') && !source.hasAbility(['steelworker', 'schooling', 'swiftswim'])) {
				modifier *= 0.33;
			}
			return this.chainModify(modifier);
		},
		onAfterMove(pokemon, target, move) {
			if (['flash', 'dazzlinggleam', 'lightthatburnsthesky', 'bounce', 'fly'].includes(move.id)) {
				if (this.field.changeTerrain('underwaterterrain', pokemon, move)) {
					this.add('-message', 'The darkness dissipates!');
				}
			}
		},
		onResidualOrder: 28,
		onResidual(pokemon) {
			if (!pokemon.hasType('Water') && !pokemon.hasAbility(['waterveil', 'dryskin', 'stormdrain', 'steelworker', 'schooling', 'magicguard'])) {
				const divisor = pokemon.hasType(['Steel', 'Ice', 'Fire', 'Rock']) ? 4 : 10;
				if (this.damage(pokemon.baseMaxhp / divisor, pokemon)) {
					this.add('-message', `The water pressure hurt ${pokemon.name}!`);
				}
			}
			if (!pokemon.hp) return;
			if (pokemon.hasType('Water') && this.heal(pokemon.baseMaxhp / 16, pokemon)) {
				this.add('-message', `The water healed ${pokemon.name}!`);
			}
			if (pokemon.hasAbility(['waterabsorb', 'dryskin']) && this.heal(pokemon.baseMaxhp / 10, pokemon)) {
				this.add('-message', `The intense water pressure healed ${pokemon.name}!`);
			}
		},
	},
};
