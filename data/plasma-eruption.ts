import type { AbilityDataTable } from '../sim/dex-abilities';
import type { ConditionDataTable } from '../sim/dex-conditions';
import {applySereneGrace} from './ally-serene-grace';

type PlasmaAttack = {
	source: Pokemon; primary?: Pokemon; type: string; hit: boolean; primaryDamage: number;
	eruption: boolean; airborne: boolean; landing: boolean; resolved?: boolean;
};
const qualifies = (move: ActiveMove) => move.category !== 'Status' && ['Fire', 'Electric'].includes(move.type);

export function plasmaFieldMultiplier(battle: Battle, source: Pokemon, type: string) {
	const field = battle.field;
	if (type === 'Fire' && field.isTerrain(['volcanicterrain', 'burningterrain', 'superheatedterrain', 'dragonsdenterrain'])) return 1.15;
	if (type === 'Electric' && (field.isTerrain(['electricterrain', 'factoryterrain', 'shortcircuitterrain']) || field.isAura('electricterrain'))) return 1.15;
	if (field.isTerrain(['mountainterrain', 'caveterrain', 'crystalcavernterrain', 'desertterrain', 'ashenbeachterrain'])) return 1.1;
	if (['sunnyday', 'desolateland'].includes(source.effectiveWeather())) return 1.1;
	if (field.isTerrain(['hauntedterrain', 'newworldterrain', 'inverseterrain', 'bigtopterrain', 'fairytaleterrain'])) return 1.05;
	return 1;
}

function blocked(battle: Battle, target: Pokemon | undefined, type: string) {
	if (!target) return false;
	if (!target.runImmunity(type, false)) return true;
	return target.hasAbilityOrPassive(type === 'Fire' ? ['flashfire', 'wellbakedbody'] : ['voltabsorb', 'motordrive', 'lightningrod']);
}

function announcePressure(battle: Battle, pokemon: Pokemon, old: number, next: number) {
	if (old) battle.add('-end', pokemon, `Plasma Pressure ${old}`, '[silent]');
	if (next) battle.add('-start', pokemon, `Plasma Pressure ${next}`);
}

function removePressure(battle: Battle, pokemon: Pokemon) {
	const core = pokemon.volatiles.plasmacore;
	if (!core) return;
	announcePressure(battle, pokemon, core.pressure || 0, 0);
	core.pressure = 0;
	for (const stat of ['spe', 'spa'] as const) {
		const credit = core[`${stat}Credit`] || 0;
		core[`${stat}Credit`] = 0;
		if (!credit) continue;
		pokemon.setBoost({ [stat]: Math.max(-6, Math.min(6, pokemon.boosts[stat] - credit)) });
		battle.add('-setboost', pokemon, stat, pokemon.boosts[stat], '[from] ability: Plasma Eruption');
	}
}

function crossStatus(battle: Battle, target: Pokemon, source: Pokemon, type: string) {
	if (target.hp && !target.volatiles.substitute) target.trySetStatus(type === 'Electric' ? 'brn' : 'par', source, battle.dex.abilities.get('plasmaeruption'));
}

export function installPlasmaEruption(abilities: AbilityDataTable) {
	abilities.plasmaeruption = {
		name: 'Plasma Eruption', num: 10149, rating: 5, flags: {},
		shortDesc: "Fire/Electric may swap and add status. Three hits ready a +60% core discharge.",
		desc: "Fire/Electric attacks have a 50% chance to swap types, avoiding immunity on the first opponent when possible. The final type stays fixed: Electric adds 30% burn; Fire adds 30% paralysis. The holder is immune to both statuses. Each attack that damages an opponent or its Substitute gains one Pressure: first +1 Sp. Atk, second +1 Speed, third readies the core. The next Fire/Electric attack releases a core discharge: +60% power, then resets Pressure and its remaining stat boosts. If the primary foe takes damage, other foes take extra damage equal to 75% of the damage actually dealt to it; all affected foes receive the opposite status if possible. After discharge, flies for two end-of-turn ticks: Ground immunity, +20% Electric power, and no Pressure gain. Iron Ball, Gravity, Smack Down and Ingrain prevent flight. Landing powers up the next Fire attack by 30%. Discharge and landing bonuses are spent even on a miss or block. Switching or losing the ability clears its phases. Strongest field bonus only: Fire +15% on Volcanic, Burning, Superheated or Dragon's Den; Electric +15% on Electric Terrain/Aura, Factory or Short Circuit; both +10% on Mountain, Cave, Crystal Cavern, Desert, Ashen Beach or effective sun; both +5% on Haunted, New World, Inverse, Big Top or Fairy Tale.",
		onStart(pokemon) {
			pokemon.addVolatile('plasmacore');
			if (['brn', 'par'].includes(pokemon.status)) pokemon.cureStatus();
		},
		onUpdate(pokemon) { if (['brn', 'par'].includes(pokemon.status)) pokemon.cureStatus(); },
		onSetStatus(status) { if (status.id === 'brn' || status.id === 'par') return false; },
		onModifyMovePriority: -100,
		onModifyMove(move, source) {
			if (!qualifies(move) || (move as any).plasmaTypeChosen) return;
			(move as any).plasmaTypeChosen = true;
			const original = move.type, alternate = original === 'Fire' ? 'Electric' : 'Fire';
			const first = source.foes().find(p => p.hp);
			const originalBlocked = blocked(this, first, original), alternateBlocked = blocked(this, first, alternate);
			if (!alternateBlocked && (originalBlocked || this.randomChance(1, 2))) move.type = alternate;
			if (move.type !== original) this.add('-message', `Plasma Eruption changed ${move.name} to ${move.type}!`);
			const core = source.volatiles.plasmacore;
			if (!core || core.pressure < 3) {
				move.secondaries ||= [];
				move.secondaries.push({ chance: 30, status: move.type === 'Electric' ? 'brn' : 'par' });
				// Type selection runs after Grace. Bring only the new effect up to its
				// already-applied multiplier; the helper leaves earlier effects alone.
				const providers = (move as ActiveMove & {sereneGraceProviders?: string[]}).sereneGraceProviders;
				if (providers?.length) applySereneGrace(move, providers[0]);
			}
		},
		onTryMove(source, target, move) {
			if (!qualifies(move)) return;
			if (source.volatiles.plasmaairborne && source.isGrounded()) source.removeVolatile('plasmaairborne');
			source.addVolatile('plasmacore');
			const spread = ['allAdjacent', 'allAdjacentFoes', 'all'].includes(move.target);
			const primary = spread ? source.foes().find(p => p.hp) : target && !source.isAlly(target) ? target : undefined;
			const data: PlasmaAttack = { source, primary, type: move.type, hit: false, primaryDamage: 0,
				eruption: source.volatiles.plasmacore.pressure >= 3,
				airborne: !!source.volatiles.plasmaairborne,
				landing: move.type === 'Fire' && !!source.volatiles.plasmalanding };
			(move as any).plasmaAttack = data;
			if (data.landing) source.removeVolatile('plasmalanding');
			if (data.eruption) this.add('-activate', source, 'ability: Plasma Eruption');
		},
		onBasePowerPriority: 23,
		onBasePower(basePower, source, target, move) {
			if (!qualifies(move)) return;
			const data = (move as any).plasmaAttack as PlasmaAttack | undefined;
			if (data?.eruption) this.chainModify(1.6);
			if ((data?.airborne ?? !!source.volatiles.plasmaairborne) && move.type === 'Electric') this.chainModify(1.2);
			if (data?.landing) this.chainModify(1.3);
			const field = plasmaFieldMultiplier(this, source, move.type);
			if (field !== 1) this.chainModify(field);
		},
		onAnyAfterDamageApplied(damage, target, source, effect) {
			const data = (effect as any)?.plasmaAttack as PlasmaAttack | undefined;
			if (!data || data.source !== this.effectState.target || source !== data.source || damage <= 0 || source.isAlly(target)) return;
			data.hit = true;
			if (target === data.primary) data.primaryDamage += damage;
		},
		onSourceAfterSubDamage(damage, target, source, move) {
			const data = (move as any).plasmaAttack as PlasmaAttack | undefined;
			if (data && damage > 0 && !source.isAlly(target)) data.hit = true;
		},
		onAnyAfterAttackResolved(source, target, move) {
			const data = (move as any)?.plasmaAttack as PlasmaAttack | undefined;
			if (!data || data.source !== this.effectState.target || source !== data.source || data.resolved) return;
			data.resolved = true;
			const core = source.volatiles.plasmacore;
			if (!core) return;
			if (data.eruption) {
				removePressure(this, source);
				if (data.primary && data.primaryDamage > 0) {
					crossStatus(this, data.primary, source, data.type);
					for (const foe of source.foes()) {
						if (!foe.hp || foe === data.primary) continue;
						this.damage(Math.max(1, Math.floor(data.primaryDamage * 0.75)), foe, source, this.dex.abilities.get('plasmaeruption'));
						crossStatus(this, foe, source, data.type);
					}
				}
				if (source.hp && source.isActive) source.addVolatile('plasmaairborne');
				return;
			}
			if (!data.hit || data.airborne || source.volatiles.plasmaairborne || !source.hp) return;
			const old = core.pressure || 0;
			core.pressure = Math.min(3, old + 1);
			announcePressure(this, source, old, core.pressure);
			const stat = core.pressure === 1 ? 'spa' : core.pressure === 2 ? 'spe' : null;
			if (stat) {
				const before = source.boosts[stat];
				this.boost({ [stat]: 1 }, source, source, this.effect);
				core[`${stat}Credit`] = (core[`${stat}Credit`] || 0) + source.boosts[stat] - before;
			}
		},
		onEnd(pokemon) {
			pokemon.m.plasmaClearing = true;
			removePressure(this, pokemon);
			for (const id of ['plasmacore', 'plasmaairborne', 'plasmalanding']) pokemon.removeVolatile(id);
			delete pokemon.m.plasmaClearing;
		},
	};
}

export const PlasmaConditions: ConditionDataTable = {
	plasmacore: { name: 'Plasma Core', noCopy: true, onStart() { this.effectState.pressure = 0; } },
	plasmaairborne: {
		name: 'Plasma Airborne', noCopy: true, duration: 2,
		onStart(pokemon) {
			if (pokemon.hasItem('ironball') || this.field.getPseudoWeather('gravity') || pokemon.volatiles.smackdown || pokemon.volatiles.ingrain) return false;
			this.add('-start', pokemon, 'Plasma Airborne');
		},
		onUpdate(pokemon) {
			if (pokemon.hasItem('ironball') || this.field.getPseudoWeather('gravity') || pokemon.volatiles.smackdown || pokemon.volatiles.ingrain) pokemon.removeVolatile('plasmaairborne');
		},
		onResidualOrder: 18,
		onEnd(pokemon) {
			this.add('-end', pokemon, 'Plasma Airborne');
			if (pokemon.hp && !pokemon.m.plasmaClearing && pokemon.hasAbility('plasmaeruption')) pokemon.addVolatile('plasmalanding');
		},
	},
	plasmalanding: {
		name: 'Plasma Landing', noCopy: true,
		onStart(pokemon) { this.add('-start', pokemon, 'Plasma Landing'); },
		onEnd(pokemon) { this.add('-end', pokemon, 'Plasma Landing', '[silent]'); },
	},
};
