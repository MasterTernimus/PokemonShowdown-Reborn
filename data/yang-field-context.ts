import type {MoveDataTable} from '../sim/dex-moves';

/** Flavor-only context: this table never grants a modifier or extends an effect. */
export const YangFieldContexts: Record<string, {leader: string, mainField: string, fields: string[], message: string}> = {
  "kaboom": {
    "leader": "Julia",
    "mainField": "Electric Terrain",
    "fields": [
      "electricterrain"
    ],
    "message": "The current answered Julia’s explosive finale!"
  },
  "cactibash": {
    "leader": "Florinia",
    "mainField": "Desert",
    "fields": [
      "desertterrain"
    ],
    "message": "Florinia’s cactus barrage swept across the desert!"
  },
  "corrosivestrike": {
    "leader": "Corey",
    "mainField": "Corrosive Field / Corrosive Mist",
    "fields": [
      "corrosiveterrain",
      "corrosivemistterrain"
    ],
    "message": "Corey’s corrosive strike cut through the fumes!"
  },
  "toxicvial": {
    "leader": "Corey",
    "mainField": "Corrosive Mist",
    "fields": [
      "corrosivemistterrain",
      "corrosiveterrain"
    ],
    "message": "Corey’s toxic vial vanished into the fumes!"
  },
  "flutterscales": {
    "leader": "Shelly",
    "mainField": "Forest",
    "fields": [
      "forestterrain",
      "rainbowterrain"
    ],
    "message": "Shelly’s scales fluttered through the canopy and light!"
  },
  "spiritmend": {
    "leader": "Shade",
    "mainField": "Short Circuit",
    "fields": [
      "shortcircuitterrain",
      "darkcrystalcavernterrain",
      "newworldterrain"
    ],
    "message": "Shade’s spectral energy stirred through the battlefield!"
  },
  "chistrike": {
    "leader": "Kiki",
    "mainField": "Ashen Beach",
    "fields": [
      "ashenbeachterrain"
    ],
    "message": "Kiki’s focused strike echoed across the shore!"
  },
  "gunkrock": {
    "leader": "Aya",
    "mainField": "Wasteland",
    "fields": [
      "wastelandterrain"
    ],
    "message": "Aya’s toxic riff rang across the wasteland!"
  },
  "frozenrefractals": {
    "leader": "Serra",
    "mainField": "Mirror Arena",
    "fields": [
      "mirrorarenaterrain",
      "icyterrain",
      "snowyterrain"
    ],
    "message": "Serra’s frozen patterns shimmered across the battlefield!"
  },
  "nomoswish": {
    "leader": "Noel",
    "mainField": "Grassy Terrain",
    "fields": [
      "grassyterrain",
      "mistyterrain",
      "rainbowterrain",
      "fairytaleterrain",
      "holyterrain",
      "starlightarenaterrain"
    ],
    "message": "Noel’s wish settled over the peaceful battlefield!"
  },
  "queensgambit": {
    "leader": "Radomus",
    "mainField": "Chessboard",
    "fields": [
      "chessboardterrain"
    ],
    "message": "Radomus’s queen made her gambit!"
  },
  "darkclasp": {
    "leader": "Luna",
    "mainField": "Dark Crystal Cavern",
    "fields": [
      "darkcrystalcavernterrain",
      "caveterrain",
      "crystalcavernterrain"
    ],
    "message": "Luna’s grasp reached through the cavern’s shadows!"
  },
  "beatdown": {
    "leader": "Samson",
    "mainField": "Big Top",
    "fields": [
      "bigtopterrain"
    ],
    "message": "Samson’s blows thundered through the big top!"
  },
  "infernalrage": {
    "leader": "Charlotte",
    "mainField": "Superheated",
    "fields": [
      "superheatedterrain",
      "volcanicterrain",
      "burningterrain"
    ],
    "message": "Charlotte’s inferno swept through the heat!"
  },
  "m3g4qu4k3": {
    "leader": "Terra",
    "mainField": "Glitch",
    "fields": [
      "glitchterrain",
      "bigtopterrain"
    ],
    "message": "Terra’s quake rattled the battlefield!"
  },
  "winddance": {
    "leader": "Ciel",
    "mainField": "Big Top",
    "fields": [
      "bigtopterrain",
      "mountainterrain",
      "snowymountainterrain"
    ],
    "message": "Ciel’s dance traced the rising air!"
  },
  "timeblade": {
    "leader": "Adrienn",
    "mainField": "Misty over Fairy Tale",
    "fields": [
      "mistyterrain",
      "fairytaleterrain"
    ],
    "message": "Adrienn’s blade traced a moment through the mist and magic!"
  },
  "crestcleave": {
    "leader": "Titania",
    "mainField": "Fairy Tale",
    "fields": [
      "fairytaleterrain"
    ],
    "message": "Titania’s knight struck from the fairy tale!"
  },
  "sirensveil": {
    "leader": "Amaria",
    "mainField": "Water Surface / Underwater",
    "fields": [
      "watersurfaceterrain",
      "underwaterterrain"
    ],
    "message": "Amaria’s song drifted through the water!"
  },
  "sirenswrath": {
    "leader": "Amaria",
    "mainField": "Water Surface / Underwater",
    "fields": [
      "watersurfaceterrain",
      "underwaterterrain"
    ],
    "message": "Amaria’s wrath surged through the depths!"
  },
  "rocknroll": {
    "leader": "Hardy",
    "mainField": "Rocky",
    "fields": [
      "rockyterrain",
      "caveterrain"
    ],
    "message": "Hardy’s rhythm rolled across the stone!"
  },
  "dragonrend": {
    "leader": "Saphira",
    "mainField": "Dragon’s Den",
    "fields": [
      "dragonsdenterrain",
      "volcanicterrain",
      "caveterrain"
    ],
    "message": "Saphira’s strike shook the dragon’s domain!"
  },
  "airstreamassault": {
    "leader": "Heather",
    "mainField": "Mountain",
    "fields": [
      "mountainterrain",
      "snowymountainterrain"
    ],
    "message": "Heather’s assault swept along the mountain air!"
  },
  "wisteriamaelstrom": {
    "leader": "Laura",
    "mainField": "Flower Garden",
    "fields": [
      "flowergarden1",
      "flowergarden2",
      "flowergarden3",
      "flowergarden4",
      "flowergarden5"
    ],
    "message": "Laura’s wisteria swirled through the garden!"
  },
  "deiludicium": {
    "leader": "Elias",
    "mainField": "Holy",
    "fields": [
      "holyterrain",
      "rainbowterrain",
      "newworldterrain"
    ],
    "message": "Elias’s judgment rang across the radiant battlefield!"
  },
  "nostraswish": {
    "leader": "Anna",
    "mainField": "Starlight Arena",
    "fields": [
      "starlightarenaterrain",
      "newworldterrain"
    ],
    "message": "Anna’s wish descended through the stars!"
  },
  "swarmsnare": {
    "leader": "Bennett",
    "mainField": "Flower Garden",
    "fields": [
      "flowergarden1",
      "flowergarden2",
      "flowergarden3",
      "flowergarden4",
      "flowergarden5"
    ],
    "message": "Bennett’s swarm wove through the garden!"
  }
};

type ContextMove = ActiveMove & {yangContext?: string, yangContextSent?: boolean};
function announce(battle: Battle, move: ContextMove) {
 if (!move.yangContext || move.yangContextSent) return;
 move.yangContextSent = true;
 battle.add('-message', move.yangContext);
}
export function addYangFieldContext(moves: MoveDataTable) {
 for (const [id, context] of Object.entries(YangFieldContexts)) {
  // Nostras Wish already announces from its delayed impact on the field at that time.
  if (id === 'nostraswish') continue;
  const data = moves[id as keyof MoveDataTable];
  const modify = data.onModifyMove;
  data.onModifyMove = function (move, source, target) {
   const result = modify?.call(this, move, source, target);
   // Snapshot before a successful attack changes or clears the field.
   const state = move as ContextMove;
   state.yangContextSent = false;
   state.yangContext = context.fields.some(field => this.field.isTerrain(field) ||
    (['kaboom', 'flutterscales', 'nomoswish', 'deiludicium'].includes(id) &&
     ['electricterrain', 'rainbowterrain', 'mistyterrain'].includes(field) && this.field.isTerrainOrAura(field))) ? context.message : undefined;
   return result;
  };
  if (data.category === 'Status') {
   const after = data.onAfterMoveSecondarySelf;
   data.onAfterMoveSecondarySelf = function (source, target, move) {
    const result = after?.call(this, source, target, move);
    announce(this, move);
    return result;
   };
  } else {
   const hit = data.onAfterHit, sub = data.onAfterSubDamage;
   data.onAfterHit = function (target, source, move) {
    const damaged = (target.getMoveHitData(move).damage || 0) > 0;
    const result = hit?.call(this, target, source, move);
    if (damaged) announce(this, move);
    return result;
   };
   data.onAfterSubDamage = function (damage, target, source, move) {
    const result = sub?.call(this, damage, target, source, move);
    if (damage > 0) announce(this, move);
    return result;
   };
  }
 }
}

/** Delayed moves resolve their field context at impact, not at setup. */
export function announceYangImpact(battle: Battle, id: string, move: ActiveMove) {
 const context = YangFieldContexts[id];
 const state = move as ContextMove;
 if (context.fields.some(field => battle.field.isTerrain(field))) {
  state.yangContext = context.message;
  announce(battle, state);
 }
}
