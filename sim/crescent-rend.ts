type RendHitData = { crescentOverflow?: number, crescentSubDamage?: number };

export function crescentRendApplies(source: Pokemon, move: ActiveMove) {
	return source.hasAbility('crescentrend') && move.category === 'Physical' && source.battle.movehasType(move, 'Flying');
}

export function prepareCrescentRend(source: Pokemon, target: Pokemon, move: ActiveMove, damage: number) {
	const subHP = target.volatiles.substitute?.hp;
	if (!subHP || damage <= subHP || !crescentRendApplies(source, move)) return false;
	const hit = target.getMoveHitData(move) as RendHitData;
	hit.crescentOverflow = damage - subHP;
	hit.crescentSubDamage = subHP;
	// Recoil uses substitute loss plus actual HP loss, once at the normal move boundary.
	move.totalDamage = (move.totalDamage || 0) + subHP;
	target.removeVolatile('substitute');
	return true;
}

export function takeCrescentOverflow(target: Pokemon, move: ActiveMove) {
	const hit = target.getMoveHitData(move) as RendHitData;
	const overflow = hit.crescentOverflow;
	delete hit.crescentOverflow;
	return overflow;
}

export function takeCrescentSubDamage(target: Pokemon, effect: Effect) {
	if (effect.effectType !== 'Move') return 0;
	const hit = target.getMoveHitData(effect) as RendHitData;
	const damage = hit.crescentSubDamage || 0;
	delete hit.crescentSubDamage;
	return damage;
}

export function hasCrescentSubDamage(target: Pokemon, move: ActiveMove) {
	return !!(target.getMoveHitData(move) as RendHitData).crescentSubDamage;
}
