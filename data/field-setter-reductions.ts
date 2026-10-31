import type {AbilityDataTable} from '../sim/dex-abilities';
import {composeSelectedAbility} from './selected-mega-simplifications';

type FarewellGift = {kind: 'lastbloom' | 'tyrantlegacy' | 'harborpassage', source: Pokemon};
type DollMove = ActiveMove & {cursedDollSurvivors?: Set<Pokemon>};

function leaveGift(this: Battle, pokemon: Pokemon, kind: FarewellGift['kind']) {
	const key = `${kind}Used`;
	if (pokemon.m[key]) return;
	pokemon.m[key] = true;
	if (!pokemon.side.pokemon.some(ally => ally.hp && !ally.isActive)) return;
	pokemon.side.addSlotCondition(pokemon, kind, pokemon, this.effect);
}

/** Bind the gift to the immediate replacement, so a hazard KO cannot pass it onward. */
export function takeFarewellGift(pokemon: Pokemon, oldActive: Pokemon | null, pos: number) {
	delete pokemon.m.farewellGift;
	for (const kind of ['lastbloom', 'tyrantlegacy', 'harborpassage'] as const) {
		const state = pokemon.side.slotConditions[pos][kind];
		if (!state) continue;
		pokemon.side.removeSlotCondition(pos, kind);
		if (state.source === oldActive && oldActive && (kind === 'harborpassage' ? !!oldActive.hp : !oldActive.hp)) {
			pokemon.m.farewellGift = {kind, source: oldActive} satisfies FarewellGift;
		}
	}
}

export function resolveFarewellGift(pokemon: Pokemon) {
	const gift = pokemon.m.farewellGift as FarewellGift | undefined;
	delete pokemon.m.farewellGift;
	if (!gift || !pokemon.hp || !pokemon.isActive) return;
	const battle = pokemon.battle;
	if (gift.kind === 'lastbloom') {
		battle.heal(pokemon.maxhp / 4, pokemon, gift.source, battle.dex.abilities.get('eternalflower'));
	} else if (gift.kind === 'harborpassage') {
		battle.heal(pokemon.maxhp / 8, pokemon, gift.source, battle.dex.abilities.get('safeharbor'));
	} else {
		battle.boost({atk: 1}, pokemon, gift.source, battle.dex.abilities.get('tyrantdomain'));
	}
}

export function installFieldSetterReductions(abilities: AbilityDataTable) {
	abilities.tatteredmemory = {
		name: 'Tattered Memory', num: 12066, rating: 3, flags: {},
		shortDesc: 'Cursed Body + Frisk.',
		desc: 'Cursed Body + Frisk. Reveals opposing items and Illusions on entry; each item holder has a 30% chance of Embargo. Damaging attacks have a 30% chance to be Disabled, guaranteed on Haunted and blocked on Holy. On fainting, curses active foes.',
	};
	composeSelectedAbility(abilities, 'tatteredmemory', ['cursedbody', 'frisk']);
	delete abilities.curseddoll.onFaint;
	abilities.curseddoll.onDamagingHit = function (damage, target, source, move: DollMove) {
		if (damage <= 0 || !target.hp || source.isAlly(target) || target.hp > target.maxhp / 2 || target.m.cursedDollSurvivalUsed) return;
		(move.cursedDollSurvivors ||= new Set()).add(target);
	};
	abilities.curseddoll.onAnyAfterMove = function (source, target, move: DollMove) {
		const holder: Pokemon = this.effectState.target;
		if (!move.cursedDollSurvivors?.delete(holder) || !holder.hp || !holder.isActive || holder.m.cursedDollSurvivalUsed) return;
		holder.m.cursedDollSurvivalUsed = true;
		this.boost({atk: 1}, holder, holder, this.effect);
	};
	Object.assign(abilities.curseddoll, {
		shortDesc: 'Tough Claws + Shadow Shield; surviving an attack at half HP grants +1 Attack once per battle.',
		desc: 'Contact moves have 1.3x power. Takes 20% less attack damage, or 40% less from super-effective attacks. This protection cannot be bypassed by ability-ignoring moves, but suppression disables it. Once per battle, surviving an opposing attack at half HP or less grants +1 Attack. Immune to hail on Cold Eclipse.',
	});
	delete abilities.requiem.onFaint;
	Object.assign(abilities.requiem, {
		shortDesc: 'Cursed Body disabling + Shadow Shield damage reduction.',
		desc: 'Damaging attacks have a 30% chance to be Disabled, guaranteed on Haunted and blocked on Holy; normal Cursed Body exclusions apply. Takes 20% less attack damage, or 40% less from super-effective attacks. Cannot be suppressed.',
	});
	abilities.eternalflower.onFaint = function (pokemon) {
		if (!this.effectState.speciesPassive && pokemon.getPassives().includes('eternalflower')) return;
		leaveGift.call(this, pokemon, 'lastbloom');
	};
	abilities.eternalflower.desc = 'Mold Breaker. Deals 2x damage to Pulse forms; Grass moves use 1.5x Attack and Sp. Atk. Opposing Mega, G-Max, Terastallized, Stellar and Ultra Beast Pokemon have their five non-HP stats reduced to 0.7x while it is active. Once per battle, fainting heals its immediate replacement by 25% of that Pokemon\'s max HP after entry hazards. A fainted, full-HP or heal-blocked replacement consumes the gift.';
	abilities.eternalflower.shortDesc = 'Mold Breaker; boosts Grass/Pulse damage, weakens gimmicks; on faint, heals its replacement.';
	delete abilities.duneterror.onFaint;
	abilities.duneterror.desc = 'Sand Stream + Sand Spit + full local Shed Skin. During effective sand, active foes take Ground-type damage equal to 1/16 max HP each turn; Ground immunities prevent this damage.';
	abilities.duneterror.shortDesc = 'Summons sand on entry and when hit; Shed Skin; sand chips foes with Ground damage.';
	abilities.auroradomain.onFaint = function (pokemon) {
		const ability = this.dex.abilities.get('auroradomain');
		if (pokemon.side.addSideCondition('auroraveil', pokemon, ability) || pokemon.side.getSideCondition('auroraveil')) {
			pokemon.side.sideConditions.auroraveil.duration = 5;
		}
	};
	abilities.auroradomain.desc = 'Full local Snow Warning + Refrigerate. On fainting, sets or refreshes its side\'s Aurora Veil for 5 turns, without requiring hail or snow.';
	abilities.auroradomain.shortDesc = 'Hail and Refrigerate; fainting sets Aurora Veil for 5 turns.';
	abilities.tyrantdomain.onFaint = function (pokemon) { leaveGift.call(this, pokemon, 'tyrantlegacy'); };
	abilities.tyrantdomain.desc = 'Full local Sand Stream + Supreme Overlord. Once per battle, fainting grants its immediate replacement +1 Attack after entry hazards. A replacement that faints on entry consumes the gift.';
	abilities.tyrantdomain.shortDesc = 'Sand Stream + Supreme Overlord; fainting grants its replacement +1 Attack once per battle.';
	abilities.inversion.onStart = function (pokemon) {
		if (pokemon.m.inversionFieldUsed) return;
		pokemon.m.inversionFieldUsed = true;
		this.field.setTerrain('inverseterrain', pokemon, this.effect);
	};
	abilities.inversion.desc = 'Once per battle, its first activation attempts to create Inverse Field for 5 turns. Switching, revival and ability changes do not reset the attempt, even if blocked. Infiltrator bypasses Substitute and opposing screens. Hypnosis bypasses accuracy checks; protection and sleep immunities still apply.';
	abilities.inversion.shortDesc = 'Once per battle: attempts Inverse Field. Infiltrator; Hypnosis bypasses accuracy.';
}
