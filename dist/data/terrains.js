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
var terrains_exports = {};
__export(terrains_exports, {
  Terrains: () => Terrains
});
module.exports = __toCommonJS(terrains_exports);
const Terrains = {
  burningterrain: {
    name: "Burning Terrain",
    condition: {
      duration: 5,
      onBasePowerPriority: 6,
      onModifyMove(move) {
        const fireMoves = ["smackdown", "thousandarrows", "clearsmog", "smog"];
        if (fireMoves.includes(move.id)) {
          move.types = [move.type, "Fire"];
        }
      },
      onBasePower(basePower, target, source, move) {
        const terrainEndMoves = ["defog", "gust", "hurricane", "muddywater", "sandtomb", "razorwind", "sludgewave", "sparklingaria", "surf", "waterpledge", "watersport", "waterspout", "hydrovortex", "tailwind", "twister", "whirlwind", "oceanicoperatta", "continentalcrush", "supersonicskystrike"];
        const rockfireMoves = ["smackdown", "thousandarrows"];
        const smogfireMoves = ["smog", "clearsmog"];
        let modifier = 1;
        if (rockfireMoves.includes(move.id))
          modifier *= 2;
        if (smogfireMoves.includes(move.id)) {
          modifier *= 1.5;
        }
        if (move.type === "Fire" && target.isGrounded()) {
          modifier *= 1.5;
        }
        if (move.type === "Grass" && target.isGrounded()) {
          modifier *= 0.5;
        }
        if (move.type === "Ice") {
          modifier *= 0.5;
        }
        if (terrainEndMoves.includes(move.id)) {
          modifier *= 5325 / 4096;
        }
        return this.chainModify(modifier);
      },
      onAfterMove(source, target, move) {
        const terrainEndMoves = ["defog", "gust", "hurricane", "muddywater", "sandtomb", "razorwind", "sludgewave", "sparklingaria", "surf", "waterpledge", "watersport", "waterspout", "hydrovortex", "tailwind", "twister", "whirlwind", "oceanicoperatta", "continentalcrush", "supersonicskystrike"];
        if (terrainEndMoves.includes(move.id)) {
          this.field.clearTerrain();
        }
      },
      onResidual(pokemon) {
        const immune = ["flamebody", "flareboost", "flashfire", "heatproof", "magmaarmor", "waterbubble", "waterveil"];
        const weak = ["leafguard", "fluffy", "grasspelt", "icebody"];
        if (!immune.includes(pokemon.ability) || !pokemon.volatiles["aquaring"]) {
          let typeMod = this.clampIntRange(this.dex.getEffectiveness("Fire", pokemon.types), -6, 6);
          let damage = this.clampIntRange(pokemon.baseMaxhp / 8 * Math.pow(2, typeMod), 1);
          if (weak.includes(pokemon.ability)) {
            this.damage(damage * 2, pokemon);
          } else {
            this.damage(damage, pokemon);
          }
        }
        if (this.field.weather === "rain" || this.field.weather === "sandstorm")
          this.field.clearTerrain();
      }
    }
  },
  corrosiveterrain: {
    name: "Corrosive Terrain",
    condition: {
      duration: 5,
      onBasePowerPriority: 6,
      onModifyMove(move) {
        let poisonedMoves = ["mudbomb", "mudshot", "mudslap", "muddywater", "smackdown", "whirlpool", "thousandarrows"];
        if (move.type === "Grass") {
          move.types = [move.type, "Poison"];
        }
        if (poisonedMoves.includes(move.id)) {
          move.types = [move.type, "Poison"];
        }
      },
      onSwitchIn(pokemon) {
        let immune = ["immunity, magicguard, poisonheal, toxicboost, wonderguard"];
        if (!immune.includes(pokemon.ability) && pokemon.isGrounded() && !(pokemon.types.includes("Poison") || !pokemon.types.includes("Steel"))) {
          let typeMod = this.dex.getEffectiveness("Poison", pokemon.types);
          typeMod = this.clampIntRange(typeMod, -6, 6);
          this.damage(pokemon.baseMaxhp / 4 * Math.pow(2, typeMod), pokemon);
        }
      },
      onBasePower(basePower, target, source, move) {
        let superStrong = ["acid", "acidspray", "grassknot"];
        let poisonedMoves = ["mudbomb", "mudshot", "mudslap", "muddywater", "smackdown", "whirlpool", "thousandarrows"];
        if (superStrong.includes(move.id))
          this.chainModify(2);
        if (poisonedMoves.includes(move.id)) {
          return this.chainModify(1.5);
        }
      },
      onResidual(pokemon) {
        let immune = ["immunity, magicguard, poisonheal, toxicboost, wonderguard"];
        if (!immune.includes(pokemon.ability) && !(pokemon.types.includes("Poison") || !pokemon.types.includes("Steel"))) {
          if (pokemon.status === "slp" || pokemon.hasAbility("comatose")) {
            this.damage(pokemon.baseMaxhp / 16, pokemon);
          }
        }
      }
    }
  },
  corrosivemistterrain: {
    name: "Corrosive Mist Terrain",
    condition: {
      duration: 5,
      onBasePowerPriority: 6,
      onModifyMove(move) {
        const poisonedMoves = ["bubblebeam", "bubble", "sparklingaria", "energyball"];
        if (move.type === "Flying" && move.category === "Special") {
          move.types = ["Flying", "Poison"];
        }
        if (poisonedMoves.includes(move.id)) {
          move.types = [move.type, "Poison"];
        }
      },
      onBasePower(basePower, target, source, move) {
        let modifier = 1;
        const poisonedMoves = ["bubblebeam", "bubble", "sparklingaria"];
        const smogMoves = ["smog", "clearsmog", "acidspray"];
        const terrainEndMoves = ["defog", "gust", "hurricane", "razorwind", "tailwind", "twister", "whirlwind", "supersonicskystrike", "seedflare"];
        const igniteMoves = ["eruption", "explosion", "firepledge", "flameburst", "heatwave", "incinerate", "lavaplume", "mindblown", "searingshot", "selfdestruct", "infernooverdrive"];
        if (move.type === "Fire") {
          modifier *= 1.5;
        }
        if (poisonedMoves.includes(move.id))
          modifier *= 1.5;
        if (smogMoves.includes(move.id))
          modifier *= 1.5;
        if (terrainEndMoves.includes(move.id) || igniteMoves.includes(move.id))
          modifier *= 5325 / 4096;
        return this.chainModify(modifier);
      },
      onAfterMove(target, source, move) {
        const terrainEndMoves = ["defog", "gust", "hurricane", "razorwind", "tailwind", "twister", "whirlwind", "supersonicskystrike", "seedflare"];
        const igniteMoves = ["eruption", "explosion", "firepledge", "flameburst", "heatwave", "incinerate", "lavaplume", "mindblown", "searingshot", "selfdestruct", "infernooverdrive"];
        if (igniteMoves.includes(move.id)) {
          for (const pokemon of this.getAllActive()) {
            if (pokemon.hasAbility("damp"))
              return;
          }
          this.add("-message", "The toxic mist combusted!");
          for (const pokemon of this.getAllActive()) {
            if (pokemon.hasAbility("flashfire") || pokemon.isSemiInvulnerable() || pokemon.isProtected() || pokemon.side.sideConditions["wideguard"])
              continue;
            if (pokemon.hasAbility("sturdy") || pokemon.volatiles["endure"] !== void 0) {
              this.damage(this.runEvent("Damage", pokemon, null, move, pokemon.baseMaxhp - 1), pokemon);
            } else {
              this.damage(pokemon.baseMaxhp, pokemon);
            }
          }
          this.field.clearTerrain();
        }
        if (terrainEndMoves.includes(move.id)) {
          this.field.clearTerrain();
        }
      },
      onFieldResidualOrder: 27,
      onFieldResidualSubOrder: 7,
      onFieldResidual() {
        for (const pokemon of this.getAllActive()) {
          if (pokemon.trySetStatus("psn")) {
            this.damage(this.runEvent("Damage", pokemon, null, this.dex.conditions.get("psn"), pokemon.baseMaxhp / 8), pokemon);
          }
        }
      },
      onFieldStart() {
        this.add("-fieldstart", "Corrosive Mist Terrain");
      },
      onFieldEnd() {
        this.add("-fieldend", "Corrosive Mist Terrain");
      }
    }
  }
};
//# sourceMappingURL=terrains.js.map
