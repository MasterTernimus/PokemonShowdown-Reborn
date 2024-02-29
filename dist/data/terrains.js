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
      durationCallback(source, effect) {
        if (source.hasItem("terrainextender")) {
          return 7;
        }
        return 4;
      },
      onModifyMove(move) {
        const fireMoves = ["smackdown", "thousandarrows", "clearsmog", "smog"];
        if (fireMoves.includes(move.id)) {
          move.types = [move.type, "Fire"];
        }
      },
      onBasePower(basePower, source, target, move) {
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
      },
      onFieldStart() {
        this.add("-fieldstart", "Burning Terrain");
      },
      onFieldEnd() {
        this.add("-fieldend", "Burning Terrain");
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
      onBasePower(basePower, source, target, move) {
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
      },
      onFieldStart() {
        this.add("-fieldstart", "Corrosive Terrain");
      },
      onFieldEnd() {
        this.add("-fieldend", "Corrosive Terrain");
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
      onBasePower(basePower, source, target, move) {
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
      onAfterMove(source, target, move) {
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
  },
  fairytaleterrain: {
    name: "Fairy Tale Terrain",
    condition: {
      duration: 5,
      onBasePowerPriority: 6,
      onModifyMove(move) {
        if (move.type === "Fire") {
          this.add("-message", "The fiery flames became draconified!");
          move.types = [move.type, "Dragon"];
        }
      },
      onEffectiveness(typeMod, target, type, move) {
        const types = move.types !== void 0 ? move.types : [move.type];
        if (type === "Dragon" && types.includes("Steel"))
          return 1;
      },
      onBasePower(basePower, source, target, move) {
        const strengthenedMoves = ["airslash", "ancientpower", "fleurcannon", "leafblade", "magicalleaf", "moongeistbeam", "mysticalfire", "nightslash", "psychocut", "smartstrike", "solarblade", "sparklingaria", "menacingmoonrazemaelstorm", "oceanicoperetta"];
        let modifier = 1;
        if (move.type === "Dragon") {
          this.add("-message", "The draconic energy was strengthened by the dead princesses on the field!");
          modifier *= 2;
        }
        if (move.type === "Fairy") {
          this.add("-message", "The fairy energy was strengthened by the dead dragons on the field!");
          modifier *= 1.5;
        }
        if (move.type === "Steel") {
          this.add("-message", "The steel energy was strengthened by the dead knights on the field!");
          modifier *= 1.5;
        }
        if (strengthenedMoves.includes(move.id)) {
          this.add("-message", "The move was strengthened by the terrain!");
          modifier *= 1.5;
        }
        if (move.id === "draining kiss") {
          this.add("-message", "The move was strengthened by the terrain!");
          modifier *= 2;
        }
        return this.chainModify(modifier);
      },
      onFieldStart() {
        this.add("-fieldstart", "Fairy Tale Terrain");
      },
      onFieldEnd() {
        this.add("-fieldend", "Fairy Tale Terrain");
      }
    }
  },
  glitchterrain: {
    name: "Glitch Terrain",
    condition: {
      duration: 5,
      onBasePowerPriority: 6,
      durationCallback(source, effect) {
        if (source.hasItem("terrainextender")) {
          return 8;
        }
        return 5;
      },
      onModifyCritRatio(critRatio, source, target) {
        if (source.getStat("spe", true, true) > target.getStat("spe", true, true))
          return critRatio + 1;
      },
      onModifyMove(move) {
        const Special = ["Grass", "Fire", "Water", "Electric", "Ice", "Dragon", "Ice", "Dragon", "Psychic"];
        const Physical = ["Normal", "Fighting", "Ghost", "Poison", "Bug", "Flying", "Ground", "Rock", "???"];
        const nonexistant = ["Dark", "Steel", "Fairy"];
        if (nonexistant.includes(move.type)) {
          move.type = "Normal";
        }
        if (Special.includes(move.type)) {
          move.category = "Special";
        }
        if (Physical.includes(move.type)) {
          move.category = "Physical";
        }
      },
      onTryHit(target, source, move) {
        if (target.types.includes("Psychic") && move.type === "Ghost") {
          this.add("-message", "Ghosts forgot how to beat Psychics!");
          return null;
        }
      },
      onEffectiveness(typeMod, target, type, move) {
        if (move.type === "Bug" && type === "Poison") {
          return 1;
        }
        if (move.type === "Poison" && type === "Bug") {
          return 1;
        }
        if (move.type === "Ice" && type === "Fire") {
          return 0;
        }
        if (move.type === "Dragon") {
          return 0;
        }
      },
      onBasePower(basePower, source, target, move) {
        if (move.type === "Psychic") {
          return this.chainModify(4915, 4096);
        }
      },
      onFieldStart() {
        this.add("-fieldstart", "Glitch Terrain");
      },
      onFieldEnd() {
        this.add("-fieldend", "Glitch Terrain");
      }
    }
  },
  icyterrain: {
    name: "Icy Terrain",
    condition: {
      duration: 5,
      onBasePowerPriority: 6,
      onModifyDef(def, pokemon) {
        if (pokemon.types.includes("Ice") && this.field.isWeather("hail")) {
          return this.chainModify(1.5);
        }
      },
      onModifyMove(move, pokemon) {
        const speedMoves = ["accelerock", "aquajet", "bulletpunch", "extremespeed", "fakeout", "firstimpression", "machpunch", "quickattack", "shadowsneak", "suckerpunch", "feint", "lunge", "rollout", "steamroller"];
        if (speedMoves.includes(move.id) && pokemon.isGrounded()) {
          move.boosts = {
            spe: 1
          };
        }
        if (move.type === "Rock") {
          move.types = [move.type, "Ice"];
        }
      },
      onBasePower(basePower, source, target, move) {
        let modifier = 1;
        const igniteMoves = ["eruption", "firepledge", "flameburst", "heatwave", "incinerate", "lavaplume", "mindblown", "searingshot", "infernooverdrive"];
        const watersurfaceMoves = ["bulldoze", "earthquake", "fissure", "magnitude", "tectonicrage"];
        if (move.type === "Ice") {
          modifier *= 1.5;
        }
        if (move.type === "Fire") {
          modifier *= 0.5;
        }
        if (move.id === "scald" || move.id === "steameruption") {
          modifier *= 0.5;
          if (this.field.terrainState.Tchanges?.includes("watersurfaceterrain")) {
            modifier *= 5325 / 4096;
          }
        }
        if (igniteMoves.includes(move.id) || this.field.terrainStack[1]?.id === "watersurfaceterrain" && watersurfaceMoves.includes(move.id)) {
          modifier *= 5325 / 4096;
        }
        return this.chainModify(modifier);
      },
      onAfterMove(source, target, move) {
        const igniteMoves = ["eruption", "firepledge", "flameburst", "heatwave", "incinerate", "lavaplume", "mindblown", "searingshot", "infernooverdrive"];
        const watersurfaceMoves = ["bulldoze", "earthquake", "fissure", "magnitude", "tectonicrage"];
        if (igniteMoves.includes(move.id) || this.field.terrainStack[1]?.id === "watersurfaceterrain" && watersurfaceMoves.includes(move.id)) {
          this.field.changeTerrain("watersurfaceterrain");
          return;
        }
        if (watersurfaceMoves.includes(move.id)) {
          for (const sides of this.sides) {
            sides.addSideCondition("spikes");
          }
        }
      },
      onFieldStart() {
        this.add("-fieldstart", "Icy Terrain");
      },
      onFieldEnd() {
        this.add("-fieldend", "Icy Terrain");
      }
    }
  },
  murkwatersurfaceterrain: {
    name: "Murkwater Surface Terrain",
    condition: {
      duration: 5,
      onBasePowerPriority: 6,
      onModifySpe(spe, pokemon) {
        let immune = ["surgesurfer", "swiftswim"];
        if (!pokemon.types.includes("Poison") || !immune.includes(pokemon.ability)) {
          return this.chainModify(0.75);
        }
      },
      onModifyMove(move) {
        const waterpoisonMoves = ["mudbomb", "mudshot", "mudslap", "thousandwaves"];
        if (move.type === "Water" || waterpoisonMoves.includes(move.id)) {
          move.types = ["Water", "Poison"];
          move.type = "Water";
        }
        if (move.id === "smackdown") {
          move.types = [move.type, "Poison"];
        }
        if (move.id === "sludgewave") {
          move.types = [move.type, "Water"];
        }
      },
      onTryMove(source, target, move) {
        if (move.type === "Ground" && !(move.category === "Status" && move.id !== "sandattack"))
          return false;
      },
      onBasePower(basePower, source, target, move) {
        let modifier = 1;
        const strengthenedMoves = ["mudbomb", "mudshot", "mudslap", "thousandwaves", "acid", "acidspray", "brine", "smackdown"];
        const change = ["whirlpool", "blizzard", "subzeroslammer", "glaciate"];
        if (move.type === "Water") {
          modifier *= 1.5;
        }
        if (move.type === "Poison") {
          modifier *= 1.5;
        }
        if (move.type === "Electric" && target.isGrounded()) {
          modifier *= 5325 / 4096;
        }
        if (strengthenedMoves.includes(move.id)) {
          modifier *= 1.5;
        }
        if (change.includes(move.id)) {
          modifier *= 5325 / 4096;
        }
        return this.chainModify(modifier);
      },
      onAfterMove(source, target, move) {
        const icy = ["blizzard", "subzeroslammer", "glaciate"];
        if (move.id === "whirlpool") {
          this.field.changeTerrain("watersurfaceterrain");
          return;
        }
        if (icy.includes(move.id)) {
          this.field.changeTerrain("icyterrain");
          return;
        }
      },
      onResidual(pokemon) {
        const immune = ["immunity", "magicguard", "poisonheal", "toxicboost", "wondergaurd"];
        const weak = ["dryskin", "flamebody", "magmaarmor", "waterabsorb"];
        if (!immune.includes(pokemon.ability) || !(pokemon.types.includes("Poison") || pokemon.types.includes("Steel")) && pokemon.isGrounded()) {
          let typeMod = this.clampIntRange(this.dex.getEffectiveness("Poison", pokemon.types), -6, 6);
          let damage = this.clampIntRange(pokemon.baseMaxhp / 8 * Math.pow(2, typeMod), 1);
          if (pokemon.volatiles["dive"])
            damage *= 4;
          if (weak.includes(pokemon.ability)) {
            this.damage(damage * 2, pokemon);
          } else {
            this.damage(damage, pokemon);
          }
        }
      },
      onFieldStart() {
        if (this.field.terrainState[1].id === "underwaterterrain") {
          for (const pokemon of this.getAllActive()) {
            if (!(pokemon.types.includes("Steel") || pokemon.types.includes("Poison")) || pokemon.isSemiInvulnerable()) {
              pokemon.faint();
            }
          }
        }
        this.add("-fieldstart", "Murkwater Surface Terrain");
      },
      onFieldEnd() {
        this.add("-fieldend", "Murkwater Surface Terrain");
      }
    }
  },
  rainbowterrain: {
    name: "Rainbow Terrain",
    condition: {
      duration: 5,
      onBasePowerPriority: 6,
      durationCallback(source, effect) {
        if (source.hasItem("terrainextender")) {
          return 7;
        }
        return 4;
      },
      onModifyMove(move, pokemon) {
        if (move.secondaries && move.id !== "secretpower" && !pokemon.hasAbility("serenegrace")) {
          this.debug("doubling secondary chance");
          for (const secondary of move.secondaries) {
            if (secondary.chance)
              secondary.chance *= 2;
          }
          if (move.self?.chance)
            move.self.chance *= 2;
        }
      },
      onBasePower(basePower, source, target, move) {
        let modifier = 1;
        let strengthenedMoves = ["aurorabeam", "dazzlinggleam", "dragonpulse", "firepledge", "fleurcannon", "grasspledge", "heartstamp", "hiddenpower", "judgement", "mistball", "moonblast", "mysticalfire", "prismaticlaser", "relicsong", "sacredfire", "secretpower", "silverwind", "solarbeam", "solarblade", "sparklingaria", "triattack", "waterpledge", "weatherball", "zenheadbutt", "oceanicoperetta", "twinkletackle"];
        let weakenedMoves = ["darkpulse", "nightdaze", "neverendingnightmare", "shadowball"];
        if (move.type === "normal") {
          const types = ["Normal", "Water", "Fire", "Grass", "Fighting", "Psychic", "Bug", "Flying", "Ground", "Dark", "Fairy", "Poison", "Electric", "Steel", "Ghost", "Dragon", "Ice", "Rock"];
          move.types = [move.type, this.sample(types)];
          modifier *= 1.5;
        }
        if (strengthenedMoves.includes(move.id)) {
          this.add("-message", "The terrain strengthened the attack!");
          modifier *= 1.5;
        }
        if (weakenedMoves.includes(move.id)) {
          this.add("-message", " The terrain weakened the attack!");
          modifier *= 0.5;
        }
        return this.chainModify(modifier);
      },
      onResidual(pokemon) {
        if (pokemon.status === "slp" || pokemon.hasAbility("comatose") && !pokemon.hasAbility("magicguard")) {
          this.heal(pokemon.baseMaxhp / 16, pokemon);
        }
      },
      onFieldStart() {
        this.add("-fieldstart", "Rainbow Terrain");
      },
      onFieldEnd() {
        this.add("-fieldend", "Rainbow Terrain");
      }
    }
  },
  rockyterrain: {
    name: "Rocky Terrain",
    condition: {
      duration: 5,
      onBasePowerPriority: 6,
      onTryAddVolatile(status, pokemon) {
        if (status.id === "flinch" && pokemon.boosts.def > 0) {
          return null;
        }
      },
      onTryHit(pokemon, target, move) {
        if ((target.volatiles["substitute"] || target.boosts.def > 0) && move.flags["bullet"]) {
          this.add("-message", "The bullet-like move rebounded!");
          return null;
        }
      },
      onBasePower(basePower, source, target, move) {
        let modifier = 1;
        if (move.type === "Rock") {
          modifier *= 1.5;
        }
      },
      onAfterMove(source, target, move) {
        if (!move.lastHit && move.category === "Physical" && !source.hasAbility("rockhead")) {
          this.damage(source.baseMaxhp / 8, source, source);
        }
      },
      onFieldStart() {
        this.add("-fieldstart", "Rocky Terrain");
      }
    }
  },
  swampterrain: {
    name: "Swamp Terrain",
    condition: {
      duration: 5,
      onBasePowerPriority: 6,
      durationCallback(source, effect) {
        if (source.hasItem("terrainextender")) {
          return 7;
        }
        return 4;
      },
      onTryMove(target, source, effect) {
        if (["explosion", "mindblown", "selfdestruct"].includes(effect.id)) {
          this.attrLastMove("[still]");
          this.add("-message", "The terrain stifled the move!");
          return false;
        }
      },
      onModifyMove(move) {
        if (move.id === "thousandarrows" || move.id === "smackdown") {
          move.types = [move.type, "Water"];
        }
      },
      onBasePower(basePower, source, target, move) {
        let modifier = 1;
        const strengthenedMoves = ["thousandarrows", "smackdown", "brine", "gunkshot", "mudbomb", "mudshot", "mudslap", "muddywater", "sludgewave", "surf", "hydrovortex"];
        const weakenedMoves = ["bulldoze", "earthquake", "magnitude"];
        if (move.type === "Poison" && target.isGrounded()) {
          modifier *= 1.5;
        }
        if (strengthenedMoves.includes(move.id)) {
          modifier *= 1.5;
        }
        if (weakenedMoves.includes(move.id)) {
          modifier *= 0.25;
        }
        return this.chainModify(modifier);
      },
      onResidual(pokemon) {
        let immune = ["quickfeet", "swiftswim", "clearbody", "whitesmoke"];
        if (pokemon.isGrounded() && !immune.includes(pokemon.ability)) {
          pokemon.setBoost({ spe: -1 });
        }
        if (pokemon.status === "slp" || pokemon.hasAbility("comatose") && !pokemon.hasAbility("magicguard")) {
          this.damage(pokemon.baseMaxhp / 16, pokemon);
        }
      },
      onFieldStart() {
        this.add("-fieldstart", "Swamp Terrain");
      },
      onFieldEnd() {
        this.add("-fieldend", "Swamp Terrain");
      }
    }
  },
  underwaterterrain: {
    name: "Underwater Terrain",
    condition: {
      duration: 5,
      onBasePowerPriority: 6,
      onModifySpe(spe, pokemon) {
        const immune = ["swiftswim", "steelworker"];
        if (pokemon.isGrounded() && !pokemon.getTypes().includes("Water") && !immune.includes(pokemon.ability)) {
          return this.chainModify(0.5);
        }
      },
      onTryMove(source, target, move) {
        if (move.type === "Fire") {
          return false;
        }
      },
      onModifyMove(move) {
        if (move.type === "Ground") {
          move.types = [move.type, "Water"];
        }
      },
      onEffectiveness(typeMod, target, type, move) {
        const types = move.types !== void 0 ? move.types : [move.type];
        if (type === "Water" || types.includes("Water"))
          return 0 + this.dex.getEffectiveness(move.type, type);
      },
      onBasePower(basePower, source, target, move) {
        let modifier = 1;
        const change = ["bounce", "dive", "skydrop", "fly", "aciddownpour"];
        if (move.type === "Electric" || move.id === "anchorshot") {
          modifier *= 2;
        }
        if (move.id === "waterpulse") {
          modifier *= 1.5;
        }
        if (move.type === "Water") {
          modifier *= 1.5;
        }
        if (move.category === "Physical" && !source.hasAbility("steelworker")) {
          modifier *= 0.5;
        }
        if (change.includes(move.id) || this.field.terrainState.Tchanges?.includes("sludgewave") && move.id === "sludgewave") {
          modifier *= 5325 / 4096;
        }
        return this.chainModify(modifier);
      },
      onAfterMove(source, target, move) {
        const watersurface = ["bounce", "dive", "skydrop", "fly"];
        const murkwater = ["sludgewave", "aciddownpour"];
        if (watersurface.includes(move.id)) {
          this.field.changeTerrain("watersurfaceterrain");
          return;
        }
        if (murkwater.includes(move.id) && (move.id === "aciddownpour" || this.field.terrainState.Tchanges?.includes("sludgewave"))) {
          this.field.changeTerrain("murkwatersurfaceterrain");
          return;
        }
        if (move.id === "sludgewave") {
          this.field.terrainState.Tchanges?.push("sludgewave");
        }
      },
      onResidual(pokemon) {
        let immune = ["magicguard", "swiftswim"];
        let weak = ["flamebody", "magmaarmor"];
        if (!pokemon.types.includes("Water") && !immune.includes(pokemon.ability)) {
          let typeMod = this.clampIntRange(this.dex.getEffectiveness("Water", pokemon.types), -6, 6);
          let damage = this.clampIntRange(pokemon.baseMaxhp / 8 * Math.pow(2, typeMod), 1);
          if (typeMod > 0) {
            if (weak.includes(pokemon.ability)) {
              this.damage(damage, pokemon);
            } else {
              this.damage(damage, pokemon);
            }
          }
        }
      },
      onFieldStart() {
        this.add("-fieldstart", "Underwater Terrain");
      },
      onFieldEnd() {
        this.add("-fieldend", "Underwater Terrain");
      }
    }
  },
  watersurfaceterrain: {
    name: "Water Surface Terrain",
    condition: {
      duration: 5,
      onBasePowerPriority: 6,
      onModifySpe(spe, pokemon) {
        const immune = ["swiftswim", "surgesurfer"];
        if (pokemon.isGrounded() && !pokemon.getTypes().includes("Water") && !immune.includes(pokemon.ability)) {
          return this.chainModify(0.75);
        }
      },
      onTryMove(source, target, move) {
        if (move.type === "Ground" && !(move.category === "Status" && move.id !== "sandattack"))
          return false;
      },
      onBasePower(basePower, source, target, move) {
        let modifier = 1;
        const change = ["dive", "gravity", "aciddownpour", "blizzard", "subzeroslammer", "glaciate"];
        const strengthenedMoves = ["dive", "muddywater", "surf", "whirlpool", "hydrovortex"];
        if (move.type === "Water") {
          modifier *= 1.5;
        }
        if (strengthenedMoves.includes(move.id)) {
          modifier *= 1.5;
        }
        if (target.isGrounded() && move.type === "Electric") {
          modifier *= 1.5;
        }
        if (target.isGrounded() && move.type === "Fire") {
          modifier *= 0.5;
        }
        if (change.includes(move.id) || this.field.terrainState.Tchanges?.includes("sludgewave") && move.id === "sludgewave") {
          modifier *= 5325 / 4096;
        }
        return this.chainModify(modifier);
      },
      onAfterMove(source, target, move) {
        const underwater = ["dive", "gravity"];
        const murkwater = ["sludgewave", "aciddownpour"];
        const icy = ["blizzard", "subzeroslammer", "glaciate"];
        if (underwater.includes(move.id)) {
          this.field.changeTerrain("underwaterterrain");
          return;
        }
        if (murkwater.includes(move.id) && (move.id === "aciddownpour" || this.field.terrainState.Tchanges?.includes("sludgewave"))) {
          this.field.changeTerrain("murkwatersurfaceterrain");
          return;
        }
        if (move.id === "sludgewave") {
          this.field.terrainState.Tchanges?.push("sludgewave");
        }
        if (icy.includes(move.id)) {
          this.field.changeTerrain("icyterrain");
          return;
        }
        if (this.field.terrainState.Tchanges?.includes("sludgewave")) {
          this.field.terrainState.Tchanges = ["sludgewave"];
        } else {
          this.field.terrainState.Tchanges = [];
        }
      },
      onFieldStart() {
        this.add("-fieldstart", "Water Surface Terrain");
      },
      onFieldEnd() {
        this.add("-fieldend", "Water Surface Terrain");
      }
    }
  }
};
//# sourceMappingURL=terrains.js.map
