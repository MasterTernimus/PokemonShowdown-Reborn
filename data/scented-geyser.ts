import type { MoveData } from '../sim/dex-moves';
export const ScentedGeyser: MoveData = {
	num: 20050, name: 'Scented Geyser', type: 'Normal', category: 'Special', basePower: 80, accuracy: 100, pp: 10, priority: 0, target: 'normal', flags: { protect: 1, mirror: 1 },
	onModifyMove(move, source) {
		if ((move as any).scentedPrepared) return;
		(move as any).scentedPrepared = true;
		const item = source.ignoringItem() ? '' : source.item;
		const extra: { [id: string]: string } = { rockincense: 'Rock', roseincense: 'Grass', oddincense: 'Psychic', waveincense: 'Water' };
		(move as any).scentedExtraType = extra[item];
		if (['pureincense', 'rockincense', 'roseincense', 'oddincense', 'seaincense', 'waveincense'].includes(item)) move.basePower = 100;
		if (item === 'fullincense') move.basePower = 150;
		if (item === 'luckincense') move.basePower = this.randomChance(2, 5) ? 160 : 100;
		if (item === 'pureincense') { (move as any).scentedPure = true; move.ignoreImmunity = { Normal: true }; }
		(move as any).scentedDrop = ['fullincense', 'waveincense'].includes(item);
	},
	onTryHit(target, source, move) {
		const extra = (move as any).scentedExtraType;
		if (extra && !target.runImmunity(extra)) {
			this.add('-immune', target); return null;
		}
	},
	onEffectiveness(typeMod, target, type, move) {
		if ((move as any).scentedPure && type === 'Ghost') return 1;
		const extra = (move as any).scentedExtraType;
		return typeMod + (extra ? this.dex.getEffectiveness(extra, type) : 0);
	},
	onAfterMove(source, target, move) {
		if (!(move as any).scentedDrop || (move as any).scentedDropped || !move.totalDamage || !source.hp) return;
		(move as any).scentedDropped = true;
		this.boost({ spa: -2 }, source, source, move);
	},
};
