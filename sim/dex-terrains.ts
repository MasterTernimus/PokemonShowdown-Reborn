import {EventMethods} from "./dex-conditions";
import {BasicEffect, toID} from './dex-data';

export class DataTerrain extends BasicEffect implements Readonly<BasicEffect> {
	readonly condition: ConditionData;
	constructor(data: AnyObject) {
		super(data);
		this.condition = {};
	}
}
export interface TerrainData extends Partial<DataTerrain>, EventMethods {
	condition: ConditionData;
}

export interface Terrain extends Readonly<BasicEffect & TerrainData> {
}

export class DexTerrains {
	readonly dex: ModdedDex;
	readonly terrainCache = new Map<ID, Terrain>();
	allCache: readonly Terrain[] | null = null;

	constructor(dex: ModdedDex) {
		this.dex = dex;
	}

	get(name: string | Terrain): Terrain {
		if (name && typeof name !== 'string') return name;

		name = (name || '').trim();
		const id = toID(name);
		return this.getByID(id);
	}

	getByID(id: ID): Terrain {
		let terrain = this.terrainCache.get(id);
		if (terrain) return terrain;
		if (this.dex.data.Aliases.hasOwnProperty(id)) {
			terrain = this.get(this.dex.data.Aliases[id]);
			if (terrain.exists) {
				this.terrainCache.set(id, terrain);
			}
			return terrain;
		}
		if (id && this.dex.data.Terrains.hasOwnProperty(id)) {
			const terrainData = this.dex.data.Terrains[id] as any;
			//const terrainTextData = this.dex.getDescs('Terrains', id, terrainData);
			terrain = new DataTerrain({
				name: id,
				...terrainData,
				//...terrainTextData,
			});
		} else {
			terrain = new DataTerrain({
				name: id, exists: false,
			});
		}
		if (terrain.exists) this.terrainCache.set(id, this.dex.deepFreeze(terrain));
		return terrain;
	}

	all(): readonly Terrain[] {
		if (this.allCache) return this.allCache;
		const terrains = [];
		for (const id in this.dex.data.Terrains) {
			terrains.push(this.getByID(id as ID));
		}
		this.allCache = Object.freeze(terrains);
		return this.allCache;
	}
}
