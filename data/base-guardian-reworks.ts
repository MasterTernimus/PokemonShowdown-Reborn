import type { AbilityDataTable } from '../sim/dex-abilities';

/** Keep non-base holders and Mega delegates on their original handlers. */
function baseOnly(a: AbilityDataTable, id: string, species: string, next: any) {
	const table = a as any;
	const old: any = table[id];
	const result: any = { ...old };
	for (const key of new Set([...Object.keys(old), ...Object.keys(next)].filter(k => k.startsWith('on')))) {
		if (typeof old[key] !== 'function' && typeof next[key] !== 'function') {
			result[key] = next[key] ?? old[key];
			continue;
		}
		result[key] = function (this: Battle, ...args: any[]) {
			const holder = this.effectState.target as Pokemon;
			const handler = holder?.species?.id === species ? next[key] : old[key];
			return typeof handler === 'function' ? handler.apply(this, args) : handler;
		};
	}
	table[id] = result;
}

export function installBaseGuardianReworks(a: AbilityDataTable) {
	baseOnly(a, 'knightsguard', 'gallade', {
		onStart(this: Battle, pokemon: Pokemon) {
			this.dex.abilities.get('swornduty').onStart?.call(this, pokemon);
		},
		onSourceDamagingHit(this: Battle, damage: number, target: Pokemon, source: Pokemon, move: ActiveMove) {
			if (!damage || !source.hp || !target || target.isAlly(source) || move.category === 'Status' ||
				source.m.knightsGuardEarnedTurn === this.turn) return;
			const ally = source.adjacentAllies().find(p => p.hp && !p.volatiles.knightsguardearned);
			if (ally?.addVolatile('knightsguardearned', source, this.effect)) source.m.knightsGuardEarnedTurn = this.turn;
		},
	});
	baseOnly(a, 'dreamsickness', 'gardevoir', {
		onStart(this: Battle, pokemon: Pokemon) {
			this.dex.abilities.get('swornduty').onStart?.call(this, pokemon);
		},
		onUpdate: a.insomnia.onUpdate, onSetStatus: a.insomnia.onSetStatus,
		onTryAddVolatile: a.insomnia.onTryAddVolatile, onBasePower: a.insomnia.onBasePower,
		onAnyDamage(this: Battle, damage: number, target: Pokemon, source: Pokemon, effect: Effect) {
			const holder = this.effectState.target as Pokemon;
			if (!holder?.hp || holder.m.dreamSicknessRescueSpent || !target?.hp || !source || source.isAlly(holder) ||
				target === holder || !target.isAlly(holder) || !holder.isAdjacent(target) ||
				effect?.effectType !== 'Move' || damage < target.hp) return;
			if (target.volatiles.dreamsicknessrescueguard?.protectedMove === this.activeMove) return;
			const cost = Math.max(1, Math.floor(holder.maxhp / 4));
			if (holder.hp <= cost) return;
			holder.m.dreamSicknessRescueSpent = true;
			this.directDamage(cost, holder, holder, this.effect);
			if (this.activeMove && this.activePokemon === source) {
				target.addVolatile('dreamsicknessrescueguard', holder, this.effect);
				target.volatiles.dreamsicknessrescueguard.protectedMove = this.activeMove;
				target.volatiles.dreamsicknessrescueguard.protectedSource = source;
			}
			this.add('-activate', holder, 'ability: Dream Sickness', `[of] ${target}`);
			return target.hp - 1;
		},
	});
	baseOnly(a, 'voidveil', 'gardevoir', {
		onTryHit: a.telepathy.onTryHit, onModifySpe: a.telepathy.onModifySpe,
	});
}

export const GuardianLegacyDescriptions: Record<string, { desc: string, shortDesc: string }> = {
	"dreamsickness": {
		"desc": "Avoids allied damaging moves; Speed doubles on Psychic Terrain or Psychic Aura. At turn end, it and its active allies heal 1/16 max HP. Once per switch-in, an ally facing a lethal opposing move survives at 1 HP through that entire move, including later hits. It pays 1/4 max HP and must have more HP than the cost. Later attacks and indirect damage can still knock out the ally.",
		"shortDesc": "Telepathy; heals allies each turn; once per entry rescues an ally through one attack.",
	},
	"voidveil": {
		"desc": "Airborne: immune to Ground attacks, Spikes, Toxic Spikes, Sticky Web and Arena Trap unless grounded. Thousand Arrows can still hit. Prevents indirect damage; HP costs, Pain Split, confusion and Struggle recoil still apply. Fairy Tale entry gives +1 Sp. Def. Prevents and cures sleep, blocks Yawn, and gives Dark and Ghost attacks 1.3x power. Immune to Ground moves, indirect damage, sleep, and Yawn; Dark- and Ghost-type moves have 1.3x power. In Fairy Tale, raises Sp. Def by 1 on entry. Its first Dark- or Ghost-type attack each switch-in bypasses Substitute and screens. It does not heal or shelter allies. Ordinary Gardevoir with this ability ignores only New World's airborne Defense and Sp. Def penalties; other users do not. Gravity still grounds it, and other field effects remain.",
		"shortDesc": "First Dark/Ghost hit bypasses barriers; Gardevoir ignores New World defense penalties.",
	},
	"knightsguard": {
		"desc": "On entry, heals each adjacent ally by 1/4 max HP, or 1/3 on Fairy Tale. Once per switch-in in doubles, redirects the first single-target damaging attack aimed at an adjacent ally to it. It takes 25% less damage from that attack and, if it survives a hit, gains one Attack stage. Spread moves and status moves are not redirected.",
		"shortDesc": "Entry heals adjacent allies 1/4 HP (1/3 on Fairy Tale); once per entry, intercepts an ally-targeting attack: 25% less damage, +1 Attack if surviving.",
	},
};
