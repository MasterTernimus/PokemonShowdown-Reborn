"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var dex_terrains_exports = {};
__export(dex_terrains_exports, {
  DataTerrain: () => DataTerrain,
  DexTerrains: () => DexTerrains
});
module.exports = __toCommonJS(dex_terrains_exports);
var import_dex_data = require("./dex-data");
class DataTerrain extends import_dex_data.BasicEffect {
  constructor(data) {
    super(data);
    this.condition = {};
  }
}
class DexTerrains {
  constructor(dex) {
    this.terrainCache = /* @__PURE__ */ new Map();
    this.allCache = null;
    this.dex = dex;
  }
  get(name) {
    if (name && typeof name !== "string")
      return name;
    name = (name || "").trim();
    const id = (0, import_dex_data.toID)(name);
    return this.getByID(id);
  }
  getByID(id) {
    let terrain = this.terrainCache.get(id);
    if (terrain)
      return terrain;
    if (this.dex.data.Aliases.hasOwnProperty(id)) {
      terrain = this.get(this.dex.data.Aliases[id]);
      if (terrain.exists) {
        this.terrainCache.set(id, terrain);
      }
      return terrain;
    }
    if (id.startsWith("hiddenpower")) {
      id = /([a-z]*)([0-9]*)/.exec(id)[1];
    }
    if (id && this.dex.data.Terrains.hasOwnProperty(id)) {
      const terrainData = this.dex.data.Terrains[id];
      const terrainTextData = this.dex.getDescs("Terrains", id, terrainData);
      terrain = new DataTerrain({
        name: id,
        ...terrainData,
        ...terrainTextData
      });
      if (terrain.gen > this.dex.gen) {
        terrain.isNonstandard = "Future";
      }
    } else {
      terrain = new DataTerrain({
        name: id,
        exists: false
      });
    }
    if (terrain.exists)
      this.terrainCache.set(id, this.dex.deepFreeze(terrain));
    return terrain;
  }
  all() {
    if (this.allCache)
      return this.allCache;
    const terrains = [];
    for (const id in this.dex.data.Terrains) {
      terrains.push(this.getByID(id));
    }
    this.allCache = Object.freeze(terrains);
    return this.allCache;
  }
}
//# sourceMappingURL=dex-terrains.js.map
