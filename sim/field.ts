/**
 * Simulator Field
 * Pokemon Showdown - http://pokemonshowdown.com/
 *
 * @license MIT
 */

import { toID } from './dex';
import { EffectState } from './pokemon';
import { State } from './state';

export class Field {
	readonly battle: Battle;
	readonly id: ID;

	weather: ID;
	weatherState: EffectState;
	terrain: ID;
	terrainState: EffectState;
	pseudoWeather: { [id: string]: EffectState };
	terrainStack: EffectState[];

	constructor(battle: Battle) {
		this.battle = battle;
		const fieldScripts = this.battle.format.field || this.battle.dex.data.Scripts.field;
		if (fieldScripts) Object.assign(this, fieldScripts);
		this.id = '';

		this.weather = '';
		this.weatherState = {id: ''};
		this.terrain = '';
		this.terrainState = {id: '', Tchanges: [], prevterrain: ''};
		this.terrainStack = [];
		this.pseudoWeather = {};
	}

	toJSON(): AnyObject {
		return State.serializeField(this);
	}

	setWeather(status: string | Condition, source: Pokemon | 'debug' | null = null, sourceEffect: Effect | null = null) {
		status = this.battle.dex.conditions.get(status);
		if (!sourceEffect && this.battle.effect) sourceEffect = this.battle.effect;
		if (!source && this.battle.event && this.battle.event.target) source = this.battle.event.target;
		if (source === 'debug') source = this.battle.sides[0].active[0];

		if (this.weather === status.id) {
			if (sourceEffect && sourceEffect.effectType === 'Ability') {
				if (this.battle.gen > 5 || this.weatherState.duration === 0) {
					return false;
				}
			} else if (this.battle.gen > 2 || status.id === 'sandstorm') {
				return false;
			}
		}
		if (this.isTerrain('underwaterterrain')) {
			this.battle.add('-message', 'The weather was annihilated by the crushing weight of the ocean!');
			return false;
		}
		if (source) {
			const result = this.battle.runEvent('SetWeather', source, source, status);
			if (!result) {
				if (result === false) {
					if ((sourceEffect as Move)?.weather) {
						this.battle.add('-fail', source, sourceEffect, '[from] ' + this.weather);
					} else if (sourceEffect && sourceEffect.effectType === 'Ability') {
						this.battle.add('-ability', source, sourceEffect, '[from] ' + this.weather, '[fail]');
					}
				}
				return null;
			}
		}
		const prevWeather = this.weather;
		const prevWeatherState = this.weatherState;
		this.weather = status.id;
		this.weatherState = {id: status.id};
		if (source) {
			this.weatherState.source = source;
			this.weatherState.sourceSlot = source.getSlot();
		}
		if (status.duration) {
			this.weatherState.duration = status.duration;
		}
		if (status.durationCallback) {
			if (!source) throw new Error(`setting weather without a source`);
			this.weatherState.duration = status.durationCallback.call(this.battle, source, source, sourceEffect);
		}
		if (!this.battle.singleEvent('FieldStart', status, this.weatherState, this, source, sourceEffect)) {
			this.weather = prevWeather;
			this.weatherState = prevWeatherState;
			return false;
		}
		this.battle.eachEvent('WeatherChange', sourceEffect);
		return true;
	}

	clearWeather() {
		if (!this.weather) return false;
		const prevWeather = this.getWeather();
		this.battle.singleEvent('FieldEnd', prevWeather, this.weatherState, this);
		this.weather = '';
		this.weatherState = {id: ''};
		this.battle.eachEvent('WeatherChange');
		return true;
	}

	effectiveWeather() {
		if (this.suppressingWeather()) return '';
		return this.weather;
	}

	suppressingWeather() {
		for (const side of this.battle.sides) {
			for (const pokemon of side.active) {
				if (pokemon && !pokemon.fainted && !pokemon.ignoringAbility() && pokemon.getAbility().suppressWeather) {
					return true;
				}
			}
		}
		return false;
	}

	isWeather(weather: string | string[]) {
		const ourWeather = this.effectiveWeather();
		if (!Array.isArray(weather)) {
			return ourWeather === toID(weather);
		}
		return weather.map(toID).includes(ourWeather);
	}

	getWeather() {
		return this.battle.dex.conditions.getByID(this.weather);
	}

	startTerrain(status: string | Effect) {
		status = this.battle.dex.conditions.get(status);
		this.terrain = status.id;
		this.terrainState = {
			isBase: true,
			id: status.id,
			Tchanges: [],
			duration: 9999,
			turn: this.battle.turn,
		};
		this.terrainStack.unshift(this.terrainState);
		this.battle.singleEvent('FieldStart', status, this.terrainState, this);
		this.battle.eachEvent('TerrainChange');
	}

	setTerrain(status: string | Effect, source: Pokemon | 'debug' | null = null, sourceEffect: Effect | null = null) {
		let TempTerrains = ['rainbowterrain', 'glitchterrain', 'inverseterrain', 'swampterrain', 'burningterrain'];
		status = this.battle.dex.conditions.get(status);
		if (!sourceEffect && this.battle.effect) sourceEffect = this.battle.effect;
		if (!source && this.battle.event && this.battle.event.target) source = this.battle.event.target;
		if (source === 'debug') source = this.battle.sides[0].active[0];
		if (!source) throw new Error(`setting terrain without a source`);
		if (this.terrain === status.id) return false;
		if (this.isTerrain('underwaterterrain')) {
			this.battle.add('-message', 'The field was annihilated by the crushing weight of the ocean!');
			return false;
		}
		if (this.terrain !== '') {
			this.terrainState.Tchanges = [];
		}
		const prevTerrain = this.terrain;
		const prevTerrainState = this.terrainState;
		this.terrain = status.id;
		this.terrainState = {
			isBase: false,
			id: status.id,
			source,
			sourceSlot: source.getSlot(),
			Tchanges: [],
			duration: status.duration,
			turn: this.battle.turn,
		};
		if (status.durationCallback) {
			this.terrainState.duration = status.durationCallback.call(this.battle, source, source, sourceEffect);
		}
		if (!this.battle.singleEvent('FieldStart', status, this.terrainState, this, source, sourceEffect)) {
			this.terrain = prevTerrain;
			this.terrainState = prevTerrainState;
			return false;
		}
		if (!TempTerrains.includes(this.terrain)){
			this.terrainStack.unshift(this.terrainState);
		}
		this.battle.eachEvent('TerrainChange', sourceEffect);
		return true;
	}

	changeTerrain(status: string | Effect, source: Pokemon | 'debug' | null = null, sourceEffect: Effect | null = null) {
		status = this.battle.dex.conditions.get(status);
		if (!sourceEffect && this.battle.effect) sourceEffect = this.battle.effect;
		if (this.terrain === status.id)
			return false;
		const prevTerrainState = this.terrainState;
		this.terrain = status.id;
		this.terrainState = {
			isBase: prevTerrainState.isBase,
			id: status.id,
			Tchanges: [],
			origin: sourceEffect,
			duration: prevTerrainState.duration,
			turn: this.battle.turn,
			prevterrain: prevTerrainState.id,
		};
		if (this.terrainState.isBase) {
			this.terrainStack[0] = this.terrainState;
		}
		this.battle.add('-fieldstart', status.name);
		this.battle.eachEvent('TerrainChange', sourceEffect);
	}

	setDuration(duration: number) {
		this.terrainState.duration = duration;
	}

	breakTerrains() {
		if (this.terrain === '' || this.terrainState.isBase) return false;
		const prevTerrain = this.getTerrain();
		this.battle.singleEvent('FieldEnd', prevTerrain, this.terrainState, this);
		let isterrain = false;
		for (const terrainState of this.terrainStack) {
			console.log(terrainState.duration);
			if (!terrainState.isBase) {
				this.terrainStack.shift()
			} else {
				isterrain = true;
				break;
			}
		}
		if (isterrain) {
			this.terrain = this.terrainStack[0].id;
			this.terrainState = this.terrainStack[0];
			const current_terrain = this.battle.dex.conditions.get(this.terrain);
			this.battle.add('-fieldstart', current_terrain.name);
		} else {
			this.terrain = '';
			this.terrainState = { id: '' };
		}
		this.battle.eachEvent('TerrainChange');
		return true;
	}

	clearTerrain() {
		if (this.isTerrain('')) return false;
		const prevTerrain = this.getTerrain();
		this.battle.singleEvent('FieldEnd', prevTerrain, this.terrainState, this);
		this.terrainStack.shift();
		let isterrain = false;
		for (const terrainState of this.terrainStack) {
			if (terrainState.duration <= (this.battle.turn - this.terrainState.turn)) {
				this.terrainStack.shift();
			} else {
				this.terrainStack[0].duration -= (this.battle.turn - this.terrainState.turn);
				isterrain = true;
				break;
			}
		}

		if (isterrain) {
			this.terrain = this.terrainStack[0].id;
			this.terrainState = this.terrainStack[0];
			const current_terrain = this.battle.dex.conditions.get(this.terrain);
			this.battle.add('-fieldstart', current_terrain.name);
		} else {
			this.terrain = '';
			this.terrainState = {id: ''};
		}
		this.battle.eachEvent('TerrainChange');
		return true;
	}

	effectiveTerrain(target?: Pokemon | Side | Battle) {
		if (this.battle.event && !target) target = this.battle.event.target;
		return this.battle.runEvent('TryTerrain', target) ? this.terrain : '';
	}

	isTerrain(terrain: string | string[], target?: Pokemon | Side | Battle) {
		const ourTerrain = this.effectiveTerrain(target);
		if (!Array.isArray(terrain)) {
			return ourTerrain === toID(terrain);
		}
		return terrain.map(toID).includes(ourTerrain);
	}

	getTerrain() {
		return this.battle.dex.conditions.getByID(this.terrain);
	}

	addPseudoWeather(
		status: string | Condition,
		source: Pokemon | 'debug' | null = null,
		sourceEffect: Effect | null = null
	): boolean {
		if (!source && this.battle.event && this.battle.event.target) source = this.battle.event.target;
		if (source === 'debug') source = this.battle.sides[0].active[0];
		status = this.battle.dex.conditions.get(status);

		let state = this.pseudoWeather[status.id];
		if (state) {
			if (!(status as any).onFieldRestart) return false;
			return this.battle.singleEvent('FieldRestart', status, state, this, source, sourceEffect);
		}
		state = this.pseudoWeather[status.id] = {
			id: status.id,
			source,
			sourceSlot: source?.getSlot(),
			duration: status.duration,
		};
		if (status.durationCallback) {
			if (!source) throw new Error(`setting fieldcond without a source`);
			state.duration = status.durationCallback.call(this.battle, source, source, sourceEffect);
		}
		if (!this.battle.singleEvent('FieldStart', status, state, this, source, sourceEffect)) {
			delete this.pseudoWeather[status.id];
			return false;
		}
		this.battle.runEvent('PseudoWeatherChange', source, source, status);
		return true;
	}

	getPseudoWeather(status: string | Effect) {
		status = this.battle.dex.conditions.get(status);
		return this.pseudoWeather[status.id] ? status : null;
	}

	removePseudoWeather(status: string | Effect) {
		status = this.battle.dex.conditions.get(status);
		const state = this.pseudoWeather[status.id];
		if (!state) return false;
		this.battle.singleEvent('FieldEnd', status, state, this);
		delete this.pseudoWeather[status.id];
		return true;
	}

	destroy() {
		// deallocate ourself

		// get rid of some possibly-circular references
		(this as any).battle = null!;
	}
}
