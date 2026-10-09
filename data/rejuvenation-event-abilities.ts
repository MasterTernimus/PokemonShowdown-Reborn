import { expectedCategory } from '../sim/expected-category';
import type { AbilityDataTable } from '../sim/dex-abilities';
type EventMove = ActiveMove & {
	feverPitchMultiplier?: number,
	thunderRaid?: boolean,
};
export function directFeverPitchMove(move: ActiveMove): boolean {
	return move.category !== 'Status' && !!move.flags.sound && !move.sourceEffect && !move.callsMove &&
		!move.hasBounced && !(move as ActiveMove & {
		isExternal?: boolean,
	}).isExternal;
}
/** Explicitly approved event abilities; these do not grant moves or additional components. */
export function installRejuvenationEvents(abilities: AbilityDataTable) {
	abilities.multipulse = {
		onModifyTypePriority: -1,
		onModifyType(move, source) {
			if (move.category === 'Status' || move.type !== 'Normal' || move.isZ || move.isMax || source.ignoringItem() ||
				['judgment', 'multiattack', 'naturalgift', 'revelationdance', 'technoblast',
					'terrainpulse',
					'weatherball', 'terablast', 'hiddenpower'].includes(move.id))
				return;
			const item = source.getItem();
			if (item.onPlate && !item.zMove && (item.id.endsWith('plate') || item.id === 'legendplate'))
				move.type = item.onPlate;
		},
		flags: {}, name: 'Multipulse', rating: 3.5, num: 11317,
	};
	abilities.aquabatics = {
		onSourceDamagingHit(damage, target, source, move) {
			if (damage <= 0 || target.isAlly(source) || move.category === 'Status' || !this.movehasType(move, 'Water') ||
				!source.hp || source.volatiles['aquabaticsspent'])
				return;
			source.addVolatile('aquabaticsspent', source, this.effect);
			this.boost({ spa: 1, spe: 1 }, source, source, this.effect);
		},
		flags: {}, name: 'Aquabatics', rating: 4, num: 11318,
	};
	abilities.feverpitch = {
		onTryMove(source, target, move) {
			if (source.status === 'slp' && directFeverPitchMove(move))
				source.cureStatus();
		},
		onModifyMove(move) {
			if (move.category !== 'Status' && move.flags.sound) {
				(move as EventMove).feverPitchMultiplier ??= this.sample([0.75, 1, 1.25]);
			}
		},
		onBasePowerPriority: 19,
		onBasePower(power, source, target, move) {
			const multiplier = (move as EventMove).feverPitchMultiplier;
			if (multiplier !== undefined)
				return this.chainModify(multiplier);
		},
		flags: {}, name: 'Fever Pitch', rating: 3.5, num: 11319,
	};
	abilities.thunderraid = {
		onModifyMove(move) {
			if (move.category !== 'Physical' || !this.movehasType(move, 'Electric') || move.priority !== 0 || move.multihit ||
				move.damage !== undefined || move.damageCallback || move.ohko || move.flags.charge || move.recoil ||
				move.struggleRecoil || move.selfdestruct || move.isZ || move.isMax ||
				!['normal', 'adjacentFoe', 'any'].includes(move.target))
				return;
			move.multihit = 3;
			move.multiaccuracy = true;
			(move as EventMove).thunderRaid = true;
		},
		onBasePowerPriority: 21,
		onBasePower(power, source, target, move) {
			if ((move as EventMove).thunderRaid)
				return this.chainModify(0.2 * move.hit);
		},
		flags: {}, name: 'Thunder Raid', rating: 4, num: 11320,
	};
	abilities.desertsmark = {
		onSourceDamagingHit(damage, target, source, move) {
			if (damage <= 0 || target.isAlly(source) || move.category === 'Status' || !this.movehasType(move, 'Ground') ||
				source.volatiles['desertsmarkspent'])
				return;
			source.addVolatile('desertsmarkspent', source, this.effect);
			if (!target.hp)
				return;
			if (target.setType('Ground'))
				this.add('-start', target, 'typechange', 'Ground', "[from] ability: Desert's Mark");
			if (target.addVolatile('partiallytrapped', source, this.dex.getActiveMove('sandtomb'))) {
				target.volatiles['partiallytrapped'].duration = 4;
			}
		},
		flags: {}, name: "Desert's Mark", rating: 4, num: 11321,
	};
	abilities.deepchill = {
		...abilities.oblivious,
		onDamagingHit(damage, target, source, move) {
			if (damage <= 0 || move.category !== 'Physical' || source.isAlly(target) || target.volatiles['deepchillturnspent'])
				return;
			this.effectState.pendingMove = move;
			this.effectState.pendingAttacker = source;
		},
		onAnyAfterAttackResolved(source, target, move) {
			const holder = this.effectState.target;
			if (this.effectState.pendingMove !== move || this.effectState.pendingAttacker !== source)
				return;
			delete this.effectState.pendingMove;
			delete this.effectState.pendingAttacker;
			if (!holder.hp || holder.volatiles['deepchillturnspent'])
				return;
			holder.addVolatile('deepchillturnspent', holder, this.effect);
			if (source.hp)
				this.boost({ spe: -1 }, source, holder, this.effect);
		},
		name: 'Deep Chill', rating: 4, num: 11298,
	};
	abilities.superumdmove = {
		onPrepareHit(source, target, move) {
			if (!target || move.type !== 'Steel')
				return;
			const category = expectedCategory(this, source, target, move);
			if (!category)
				return;
			move.category = category;
			const stat = category === 'Physical' ? 'def' : 'spd';
			const identical = move.secondaries?.some(s => s.boosts?.[stat] === -1 && Object.keys(s.boosts).length === 1);
			if (!identical)
				(move as any).umdDefense = stat;
		},
		onSourceDamagingHit(damage, target, source, move) {
			if (damage > 0 && !target.isAlly(source) && (move as any).umdDefense) {
				this.effectState.pendingMove = move;
				this.effectState.pendingTarget = target;
			}
		},
		onAnyAfterAttackResolved(source, target, move) {
			if (this.effectState.pendingMove !== move || this.effectState.target !== source)
				return;
			const foe = this.effectState.pendingTarget;
			delete this.effectState.pendingMove;
			delete this.effectState.pendingTarget;
			if (!foe?.hp || !this.randomChance(1, 5))
				return;
			const secondary = { chance: 100, boosts: { [(move as any).umdDefense]: -1 } };
			this.actions.secondaries([foe], source, move, { ...move, secondaries: [secondary] }, false);
		},
		flags: {}, name: 'Super U.M.D. Move', rating: 4, num: 11322,
	};
	abilities.galestrike = {
		onModifyCritRatio(ratio, source, target, move) {
			if (move.category !== 'Status')
				return ratio + (source.hp <= source.maxhp / 4 ? 3 : source.hp <= source.maxhp / 2 ? 2 : 1);
		},
		onSourceDamagingHit(damage, target, source, move) {
			if (damage <= 0 || target.isAlly(source) || !target.getMoveHitData(move).crit || source.volatiles.galestriketurn)
				return;
			source.addVolatile('galestriketurn', source, this.effect);
			if (source.boosts.spe < 0) {
				source.boosts.spe = 0;
				this.add('-clearnegativeboost', source, 'spe', '[from] ability: Gale Strike');
			}
			this.boost({ spe: 1 }, source, source, this.effect);
		},
		flags: {}, name: 'Gale Strike', rating: 4, num: 11323,
	};
	abilities.spectralscream = {
		onModifyMove(move) {
			if (move.category !== 'Status' && this.movehasType(move, 'Ghost')) {
				move.flags.sound = 1;
				move.flags.bypasssub = 1;
			}
		},
		onSourceDamagingHit(damage, target, source, move) {
			if (damage <= 0 || target.isAlly(source) || !this.movehasType(move, 'Ghost'))
				return;
			if (!source.volatiles.spectralscreamheal) {
				source.addVolatile('spectralscreamheal', source, this.effect);
				this.heal(source.baseMaxhp / 8, source, source, this.effect);
			}
			if (!source.volatiles.spectralscreamboost) {
				source.addVolatile('spectralscreamboost', source, this.effect);
				if (this.randomChance(3, 5))
					this.boost({ def: 1, spd: 1 }, source, source, this.effect);
			}
		},
		flags: {}, name: 'Spectral Scream', rating: 4, num: 11324,
	};
	abilities.barbedweb = {
		onBasePower(power, source, target, move) {
			if (this.movehasType(move, 'Bug'))
				return this.chainModify(1.5);
		},
		onModifyCritRatio(ratio, source, target, move) {
			if (move.category !== 'Status' && this.movehasType(move, 'Bug'))
				return ratio + 1;
		},
		onModifyMove(move, source, target) {
			if (target?.volatiles.partiallytrapped?.source === source && target.volatiles.partiallytrapped.barbedWeb)
				move.tracksTarget = true;
		},
		onSourceDamagingHit(damage, target, source, move) {
			if (damage <= 0 || target.isAlly(source) || !this.movehasType(move, 'Bug'))
				return;
			source.addVolatile('barbedwebspent', source, this.effect);
			const state = source.volatiles.barbedwebspent;
			state.targets ||= [];
			if (state.targets.includes(target))
				return;
			state.targets.push(target);
			target.trySetStatus('psn', source, this.effect);
			if (!target.volatiles.partiallytrapped &&
				target.addVolatile('partiallytrapped', source, this.dex.getActiveMove('sandtomb'))) {
				const trap = target.volatiles['partiallytrapped'] as any;
				trap.duration = 4;
				trap.barbedWeb = true;
			}
		},
		flags: {}, name: 'Barbed Web', rating: 4, num: 11325,
	};
	abilities.coldtruth = {
		onPrepareHit(source, target, move) {
			if (move.category !== 'Status' && this.movehasType(move, 'Ice')) {
				(move as any).coldTruthTargets = source.foes().filter(p => !!p.volatiles.torment);
			}
		},
		onBasePower(power, source, target, move) {
			if ((move as any).coldTruthTargets?.includes(target))
				return this.chainModify(1.3);
		},
		onSourceDamagingHit(damage, target, source, move) {
			if (damage <= 0 || target.isAlly(source) || !this.movehasType(move, 'Ice'))
				return;
			target.addVolatile('torment', source, this.effect);
			source.addVolatile('coldtruthturn', source, this.effect);
			const state = source.volatiles.coldtruthturn;
			state.targets ||= [];
			if (state.targets.includes(target))
				return;
			state.targets.push(target);
			const stats: string[] = [];
			for (const stat of ['atk', 'spa'] as const)
				if (target.boosts[stat] > 0) {
					target.boosts[stat] = 0;
					stats.push(stat);
				}
			if (stats.length)
				this.add('-clearpositiveboost', target, source, 'ability: Cold Truth', stats.join(','));
		},
		flags: {}, name: 'Cold Truth', rating: 4, num: 11326,
	};
	abilities.bunrakubeatdown = {
		onBasePower(power, source, target, move) {
			if (this.movehasType(move, ['Psychic', 'Fighting']))
				return this.chainModify(1.25 + 0.25 * Math.min(5, source.side.pokemon.filter(p => p.fainted).length));
		},
		onModifyMove(move) {
			if (move.category !== 'Status' && this.movehasType(move, ['Psychic', 'Fighting']))
				move.flags.bypasssub = 1;
		},
		flags: {}, name: 'Bunraku Beatdown', rating: 4, num: 11327,
	};
	abilities.matrixshot = {
		onModifyMove(move) {
			if (move.category === 'Physical' && this.movehasType(move, 'Rock')) {
				move.overrideDefensiveStat = 'spd';
				move.ignoreScreens = true;
			}
		},
		onSourceDamagingHit(damage, target, source, move) {
			if (damage > 0 && !target.isAlly(source) && move.category === 'Physical' && this.movehasType(move, 'Rock')) {
				target.side.removeSideCondition('reflect');
				target.side.removeSideCondition('lightscreen');
			}
		},
		flags: {}, name: 'Matrix Shot', rating: 4, num: 11328,
	};
	abilities.pyrokinesis = {
		onModifyMove(move) {
			if (move.category === 'Status' || !this.movehasType(move, 'Psychic'))
				return;
			if (!move.secondaries?.some(s => s.status === 'brn')) {
				move.secondaries ||= [];
				move.secondaries.push({ chance: 30, status: 'brn' });
			}
		},
		onPrepareHit(source, target, move) {
			if (move.category !== 'Status' && this.movehasType(move, 'Psychic'))
				(move as any).pyrokinesisTargets = source.foes().filter(p => p.status === 'brn');
		},
		onBasePower(power, source, target, move) {
			if ((move as any).pyrokinesisTargets?.includes(target))
				return this.chainModify(1.5);
		},
		onSourceDamagingHit(damage, target, source, move) {
			if (damage <= 0 || target.isAlly(source) || !this.movehasType(move, 'Psychic') ||
				target.status !== 'brn' || source.volatiles.pyrokinesisturn)
				return;
			source.addVolatile('pyrokinesisturn', source, this.effect);
			this.heal(source.baseMaxhp / 8, source, source, this.effect);
		},
		flags: {}, name: 'Pyrokinesis', rating: 4, num: 11329,
	};
	abilities.venamskiss = {
		onModifyMove(move) {
			if (move.category !== 'Status' && this.movehasType(move, 'Poison')) {
				if (move.ignoreImmunity !== true) {
					move.ignoreImmunity ||= {};
					move.ignoreImmunity.Poison = true;
				}
			}
		},
		onEffectiveness(typeMod, target, type, move) {
			if (type === 'Steel' && this.movehasType(move, 'Poison'))
				return 1;
		},
		onPrepareHit(source, target, move) {
			if (move.category !== 'Status' && this.movehasType(move, 'Poison'))
				(move as any).venamsKissTargets = source.foes().filter(p => ['psn', 'tox'].includes(p.status));
		},
		onSourceDamagingHit(damage, target, source, move) {
			if (damage <= 0 || target.isAlly(source) || !this.movehasType(move, 'Poison'))
				return;
			if ((move as any).venamsKissTargets?.includes(target)) {
				if (target.hp) {
					const existing = target.volatiles.healblock;
					if (existing)
						existing.duration = Math.max(2, existing.duration || 0);
					else if (target.addVolatile('healblock', source, this.effect))
						target.volatiles.healblock.duration = 2;
				}
				if (!move.drain) {
					source.addVolatile('venamskissturn', source, this.effect);
					const state = source.volatiles.venamskissturn;
					const amount = Math.min(Math.round(damage / 3), Math.max(0, Math.floor(source.baseMaxhp / 4) - (state.healed || 0)));
					if (amount > 0) {
						state.healed = (state.healed || 0) + amount;
						this.heal(amount, source, target, 'drain');
					}
				}
			}
			if (target.hp)
				target.trySetStatus('psn', source, this.effect);
		},
		onFoeModifySpe(speed, pokemon) {
			if (!['psn', 'tox'].includes(pokemon.status))
				return;
			const holders = pokemon.foes().filter(p => p.hasAbilityOrPassive('venamskiss'));
			if (holders[0] === this.effectState.target)
				return this.chainModify(0.75);
		},
		flags: {}, name: "Venam's Kiss", rating: 4.5, num: 11330,
	};
	abilities.heavenlywing = {
		onModifyPriority(priority, source, target, move) {
			if (target && !target.isAlly(source) && move.category !== 'Status' && this.movehasType(move, 'Flying') &&
				['normal', 'adjacentFoe', 'any'].includes(move.target) && Object.values(target.boosts).some(v => v > 0))
				return priority + 1;
		},
		onModifyMove(move) {
			if (move.category !== 'Status' && this.movehasType(move, 'Flying'))
				move.accuracy = true;
		},
		onSourceDamagingHit(damage, target, source, move) {
			if (damage <= 0 || target.isAlly(source) || !this.movehasType(move, 'Flying'))
				return;
			source.addVolatile('heavenlywingturn', source, this.effect);
			const state = source.volatiles.heavenlywingturn;
			state.targets ||= [];
			if (state.targets.includes(target))
				return;
			state.targets.push(target);
			const removed: string[] = [];
			for (const stat of Object.keys(target.boosts) as BoostID[])
				if (target.boosts[stat] > 0) {
					target.boosts[stat] = 0;
					removed.push(stat);
				}
			if (!removed.length)
				return;
			this.add('-clearpositiveboost', target, source, 'ability: Heavenly Wing', removed.join(','));
			if (state.rewarded)
				return;
			state.rewarded = true;
			this.heal(source.baseMaxhp / 8, source, source, this.effect);
			for (const stat of Object.keys(source.boosts) as BoostID[])
				if (source.boosts[stat] < 0)
					source.boosts[stat] = 0;
			this.add('-clearnegativeboost', source, '[from] ability: Heavenly Wing');
		},
		flags: {}, name: 'Heavenly Wing', rating: 4, num: 11331,
	};
}
