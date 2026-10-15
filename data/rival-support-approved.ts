import type {AbilityDataTable} from '../sim/dex-abilities';
import {skipPassiveComponent, SignaturePassiveComponents} from './passive-ability-cleanup';

function rivalHeal(battle: Battle, pokemon: Pokemon) {
	if (!pokemon.hp || !pokemon.isActive) return;
	const effect = battle.dex.abilities.get('rivalresolve');
	const healed = pokemon.heal(pokemon.baseMaxhp / 8, pokemon, effect);
	if (healed) { battle.add('-heal', pokemon, pokemon.getHealth, '[from] ability: Rival Resolve'); battle.runEvent('Heal', pokemon, pokemon, effect, healed); }
}
function ordinary(move: ActiveMove) { return !move.sourceEffect && !move.isZ && !move.isMax; }
function bondEligible(move: ActiveMove) {
	return ordinary(move) && move.category !== 'Status' && !move.multihit && !move.damage && !move.damageCallback && !move.ohko &&
		!move.flags.noparentalbond && !move.flags.charge && !move.flags.recharge && !move.flags.futuremove && !move.selfdestruct &&
		['normal','any','adjacentFoe','adjacentAlly'].includes(move.target) &&
		!['fling','naturalgift','endeavor','beatup','rollout','iceball','uproar'].includes(move.id);
}
export function installRivalSupport(a: AbilityDataTable) {
	SignaturePassiveComponents.rivalresolve = ['poisonheal'];
	for (const key of Object.keys(a.poisonheal)) {
		const fn=(a.poisonheal as any)[key];if(!key.startsWith('on')||typeof fn!=='function')continue;
		(a.poisonheal as any)[key]=function(this:Battle,...args:any[]){if(!skipPassiveComponent(this,this.effectState.target,'poisonheal'))return fn.apply(this,args);};
	}
	const apexModify = a.apexvenom.onModifyMove!;
	a.apexvenom = {...a.apexvenom,
		onModifyMove(move,source,target) {
			apexModify.call(this,move,source,target);
		},
		onBasePowerPriority:20,
		onBasePower(power,source,target,move) {
			if(!move.isZ&&!move.isMax&&['poisonfang','drakefang'].includes(move.id))return this.chainModify(2.25);
			return a.strongjaw.onBasePower!.call(this,power,source,target,move);
		},
	};
	const siriusStart=a.sirius.onStart;
	a.sirius={...a.sirius,onStart(p){p.syncDrakeFang();siriusStart?.call(this,p);}};
	a.rivalresolve = {name: 'Rival Resolve', num: 11479, rating: 5, flags: {},
		onSwitchIn(p) { if (!p.status) p.setStatus('psn', p, this.effect, true); },
		onDamagePriority: 1,
		onDamage(damage, target, source, effect) { if (['psn','tox'].includes(effect.id)) { rivalHeal(this, target); return false; } },
		onResidual(p) { if ((this.field.isTerrain(['corrosiveterrain','wastelandterrain']) && p.isGrounded()) || this.field.isTerrain(['corrosivemistterrain','murkwatersurfaceterrain'])) rivalHeal(this,p); },
	};
	a.rivalmalice = {name: 'Rival Malice', num: 11480, rating: 5, flags: {},
		onModifySpe(spe) { return this.chainModify(1.5); },
		onModifyDamage(damage, source, target, move) { if (move.category !== 'Status' && !move.damage && !move.damageCallback && !move.ohko) return this.chainModify(1 + 0.5 * target.hp / target.maxhp); },
	};
	const venom = a.venomarmor;
	a.venomarmor = {...a.dualwield, ...a.battlearmor, name: 'Venom Armor', num: venom.num, rating: 4,
		onBasePowerPriority: 20, onBasePower: venom.onBasePower,
	};
	const toxic = a.toxicarmor;
	a.toxicarmor = {...a.venomarmor, name: 'Toxic Armor', num: toxic.num, rating: 5,
		flags: {cantsuppress: 1, failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1},
		onModifySpe: toxic.onModifySpe, onModifyAtk: toxic.onModifyAtk,
		onSwitchIn(p) { delete p.m.toxicPreparation; },
		onModifyPriority(priority, p, target, move) {
			if (!ordinary(move) || p.m.toxicPreparation !== this.turn) return;
			const preview = this.dex.getActiveMove(move.id); a.dualwield.onModifyMove!.call(this, preview, p, target);
			if (preview.multihitType === 'dualwield') return priority + 1;
		},
		onTryMove(p, target, move) {
			if (p.m.toxicPreparation === this.turn && ordinary(move)) {
				const preview = this.dex.getActiveMove(move.id); a.dualwield.onModifyMove!.call(this, preview, p, target);
				if (preview.multihitType === 'dualwield') { delete p.m.toxicPreparation; (move as any).toxicPrepared = true; }
			}
		},
		onSourceDamagingHit(damage, target, source, move) {
			if (damage > 0 && !target.isAlly(source) && ordinary(move) && !(move as any).toxicPrepared && this.dex.moves.get(move.id).priority > 0) source.m.toxicPreparation = this.turn + 1;
		},
		onResidual(p) { if (p.m.toxicPreparation <= this.turn) delete p.m.toxicPreparation; },
		onSwitchOut(p) { delete p.m.toxicPreparation; },
	};
	// Merge every Venam callback, retaining Sirius callbacks on overlapping events.
	for (const [key, value] of Object.entries(a.venamskiss)) {
		if (!key.startsWith('on')) continue;
		const old = (a.sirius as any)[key];
		(a.sirius as any)[key] = typeof value === 'function' && typeof old === 'function' ? function (this: Battle, ...args: any[]) {
			const first = old.apply(this,args), second = value.apply(this,args); return second === undefined ? first : second;
		} : value;
	}
	a.sirius = {...a.sirius, flags: {...a.toxicarmor.flags}};

	SignaturePassiveComponents.mycelialbond = ['dryskin'];
	a.twinfang = {name:'Twin Fang',num:11486,rating:5,flags:{},
		onPrepareHit(source,target,move) { if(bondEligible(move) && move.flags.contact) {move.multihit=2;(move as any).twinFang=true;move.multiaccuracy=false;} },
	};
	a.mycelialbond = {...a.dryskin, name: 'Mycelial Bond', num: 11481, rating: 5,
		onAnyPrepareHit(source, target, move) {
			const holder = this.effectState.target as Pokemon;
			if (source.hasAbilityOrPassive('twinfang') && move.flags.contact) return;
			if (!holder.hp || !holder.isActive || (holder !== source && !source.adjacentAllies().includes(holder)) || !bondEligible(move)) return;
			move.multihit = 2; (move as any).mycelialBond = true; move.multiaccuracy = false;
		},
	};

	const scrap = a.scrapbreaker;
	a.scrapbreaker = {...scrap,
		onStart() {},
		onModifyMove(move, p, target) {
			const ignoreAbility = move.ignoreAbility;
			scrap.onModifyMove!.call(this,move,p,target);
			move.ignoreAbility = ignoreAbility;
			if (move.type !== 'Steel') return;
			const old = move.onEffectiveness;
			move.onEffectiveness = function (mod, foe, type, attack) { const result = old?.call(this,mod,foe,type,attack); return type === 'Steel' ? 1 : result; };
		},
		onSourceDamagingHit(damage,target,source,move) {
			scrap.onSourceDamagingHit!.call(this,damage,target,source,move);
			if (damage > 0 && !target.isAlly(source) && target.hasType('Steel') && source.m.scrapbreakerTurn !== this.turn) { source.m.scrapbreakerTurn = this.turn; this.boost({atk:1},source,source,this.effect); }
		},
	};
	const flame = a.apocalypticflame;
	a.apocalypticflame = {...flame,
		onAfterMove(source,target,move) {
			if (this.effectState.strikeMove !== move) return;
			const damaged: Pokemon[] = this.effectState.strikeTargets, order: Pokemon[] = this.effectState.targetOrder;
			delete this.effectState.strikeMove; delete this.effectState.strikeTargets; delete this.effectState.targetOrder;
			if (!source.hp || source.m.apocalypticFlameTurn === this.turn) return;
			source.m.apocalypticFlameTurn = this.turn;
			this.heal(source.maxhp / 8, source, source, this.effect);
			const foe = order.find(p => damaged.includes(p) && p.hp && p.isActive);
			if (foe) this.boost(foe.getStat('atk') >= foe.getStat('spa') ? {atk:-1} : {spa:-1},foe,source,this.effect);
		},
	};
	for (const id of ['rivalresolve','rivalmalice'] as const) for (const key of Object.keys(a[id])) {
		const fn = (a[id] as any)[key]; if (!key.startsWith('on') || typeof fn !== 'function') continue;
		(a[id] as any)[key] = function (this: Battle,...args:any[]) { if (!skipPassiveComponent(this,this.effectState.target,id)) return fn.apply(this,args); };
	}
}
