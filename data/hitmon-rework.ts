import type {AbilityDataTable} from '../sim/dex-abilities';
import {composeSelectedAbility} from './selected-mega-simplifications';
import {skipPassiveComponent} from './passive-ability-cleanup';

export const HitmonComponents: {[id: string]: string[]} = {
	punchfiend: ['ironfist', 'serenegrace', 'keeneye'],
	kickfiend: ['striker', 'limber', 'serenegrace'],
	spinfiend: ['technician', 'vitalspirit', 'steadfast'],
	checkhook: ['unseenfist', 'ironfist'],
	springheel: ['unseenfist', 'ironfist'],
	cyclonerhythm: ['unseenfist', 'ironfist'],
};
export const HitmonDescriptions = {
	punchfiend: {shortDesc: 'Iron Fist + Serene Grace + Keen Eye.', desc: 'Punching moves have 1.4x power. Doubles eligible secondary-effect chances. Prevents opposing accuracy drops, ignores evasion boosts, and reveals opposing Illusions. Mirror Arena entry grants +1 accuracy and Laser Focus.'},
	kickfiend: {shortDesc: 'Striker + Limber + Serene Grace.', desc: 'Kicking moves have 1.4x power. Prevents and cures paralysis and blocks opposing or field-induced Speed drops. Doubles eligible secondary-effect chances.'},
	spinfiend: {shortDesc: 'Technician + Vital Spirit + Steadfast.', desc: 'Moves with effective power of 60 or less gain 50% power (80 or less on Factory Field). Prevents sleep and Yawn; Fighting attacks use 1.3x Attack or Sp. Atk. Flinching raises Speed by 1; entering Electric Terrain also raises Speed by 1.'},
	checkhook: {shortDesc: 'Unseen Fist; 50% pre-hit Sucker Punch counter if known, at double PP.', desc: 'Contact moves pierce protection at 1/4 damage, except Max Guard; punches have 1.4x power. Before an opposing damaging attack hits, has a fixed 50% chance to counter with Sucker Punch if it is in the moveset. Costs double its usual PP, including Pressure, and requires the full cost. Uses no normal action. Rolls once per attack; Serene Grace does not affect the chance. Priority blockers apply; counters cannot chain. A KO stops the incoming attack.'},
	springheel: {shortDesc: 'Unseen Fist; kicks ignore positive defensive stages and cause no crash damage.', desc: 'Contact moves pierce protection at 1/4 damage, except Max Guard; punches have 1.4x power. Kicking moves ignore positive defensive stat stages and cause no crash damage. Accuracy checks and defensive screens still apply.'},
	cyclonerhythm: {shortDesc: 'Unseen Fist; listed spin attacks gain 20% power and grant +1 Defense on a hit.', desc: 'Contact moves pierce protection at 1/4 damage, except Max Guard; punches have 1.4x power. Rapid Spin, Mortal Spin, Ice Spinner, Gyro Ball, and Triple Axel gain 20% power. Damaging an opponent or its Substitute with one grants +1 Defense once per attack, regardless of hits or targets.'},
};
export const HitmonSpinMoves = ['rapidspin', 'mortalspin', 'icespinner', 'gyroball', 'tripleaxel'];
type HitmonMove = ActiveMove & {
	checkHookCounter?: boolean; checkHookTargets?: Pokemon[]; checkHookInterrupted?: boolean;
	cycloneHit?: Pokemon; cycloneResolved?: boolean;
};

export function installHitmonRework(abilities: AbilityDataTable) {
	for (const key of ['onModifyAtk', 'onModifySpA'] as const) {
		const handler = abilities.vitalspirit[key];
		abilities.vitalspirit[key] = function (stat, source, target, move) {
			if (skipPassiveComponent(this, this.effectState.target, 'vitalspirit')) return;
			return handler?.call(this, stat, source, target, move);
		};
	}
	for (const id of ['punchfiend', 'kickfiend', 'spinfiend'] as const) {
		Object.assign(abilities[id], HitmonDescriptions[id]);
		composeSelectedAbility(abilities, id, HitmonComponents[id], true);
		// An acquired selected copy must not repeat its own species passive.
		for (const [key, handler] of Object.entries(abilities[id])) {
			if (!key.startsWith('on') || typeof handler !== 'function') continue;
			(abilities[id] as any)[key] = function (this: Battle, ...args: any[]) {
				if (!this.effectState.speciesPassive && this.effectState.target?.getPassives().includes(id)) return;
				return handler.apply(this, args);
			};
		}
	}
	for (const [i, id] of (['checkhook', 'springheel', 'cyclonerhythm'] as const).entries()) {
		abilities[id] = {name: ['Check Hook', 'Springheel', 'Cyclone Rhythm'][i], num: 12000 + i, rating: 4, flags: {}, ...HitmonDescriptions[id]};
		composeSelectedAbility(abilities, id, ['unseenfist'], true);
	}
	abilities.checkhook.onMoveTargeted = function (target, source, rawMove) {
		const move = rawMove as HitmonMove;
		if (!target.hp || !target.isActive || !source?.hp || !source.isActive || source.isAlly(target) ||
			move.category === 'Status' || move.checkHookCounter || move.sourceEffect === 'checkhook' ||
			move.checkHookTargets?.includes(target)) return;
		const slot = target.getMoveData('suckerpunch');
		if (!slot || slot.pp < 2) return;
		(move.checkHookTargets ||= []).push(target);
		if (!this.randomChance(1, 2)) return;
		const counter = this.dex.getActiveMove('suckerpunch') as HitmonMove;
		counter.checkHookCounter = true;
		// The opposing move is executing already, so the normal queue-based check cannot apply.
		counter.onTry = undefined;
		const saved = {move: this.activeMove, pokemon: this.activePokemon, target: this.activeTarget, line: this.lastMoveLine,
			lastUsed: target.lastMoveUsed, result: target.moveThisTurnResult};
		try {
			// Called moves otherwise inherit the parent move's priority and Prankster marker.
			this.activeMove = null;
			this.actions.useMove(counter, target, {target: source, sourceEffect: this.dex.abilities.get('checkhook')});
		} finally {
			this.activeMove = saved.move; this.activePokemon = saved.pokemon; this.activeTarget = saved.target;
			this.lastMoveLine = saved.line; target.lastMoveUsed = saved.lastUsed; target.moveThisTurnResult = saved.result;
		}
		if (!source.hp || !source.isActive) move.checkHookInterrupted = true;
	};
	const unseenModify = abilities.springheel.onModifyMove;
	abilities.springheel.onModifyMove = function (move, source, target) {
		unseenModify?.call(this, move, source, target);
		if (!move.flags.kick) return;
		move.ignorePositiveDefensive = true;
		if (move.hasCrashDamage) {move.hasCrashDamage = false; move.onMoveFail = undefined;}
	};
	const unseenPower = abilities.cyclonerhythm.onBasePower;
	abilities.cyclonerhythm.onBasePower = function (power, source, target, move) {
		unseenPower?.call(this, power, source, target, move);
		if (HitmonSpinMoves.includes(move.id)) return this.chainModify(1.2);
	};
	abilities.cyclonerhythm.onSourceAfterDamageApplied = function (damage, target, source, rawMove) {
		const move = rawMove as HitmonMove;
		if (damage > 0 && !source.isAlly(target) && HitmonSpinMoves.includes(move.id)) move.cycloneHit = source;
	};
	abilities.cyclonerhythm.onSourceAfterSubDamage = abilities.cyclonerhythm.onSourceAfterDamageApplied;
	abilities.cyclonerhythm.onAnyAfterAttackResolved = function (source, target, rawMove) {
		const move = rawMove as HitmonMove;
		if (source !== this.effectState.target || move.cycloneHit !== source || move.cycloneResolved || !source.hp || !source.isActive) return;
		move.cycloneResolved = true;
		this.boost({def: 1}, source, source, this.effect);
	};
}
