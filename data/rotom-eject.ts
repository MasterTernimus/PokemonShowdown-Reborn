const applianceTypes: {[id: string]: string} = {rotomheat: 'Fire', rotomwash: 'Water', rotomfrost: 'Ice', rotomfan: 'Flying', rotommow: 'Grass'};
export const EjectDescription = {
	name: 'Eject', shortDesc: 'Once per battle, a lethal hit ejects it; returns as full-HP Rotom at turn end.',
	desc: 'Once per battle, its first would-be knockout breaks its appliance. It cannot act or lose HP for the rest of that turn, then returns as base Rotom at full HP with Infiltrator after residual effects. Appliance-type physical attacks become Astonish and special attacks become Hex. Other moves and status moves remain; each slot keeps its remaining PP, capped by the replacement\'s PP, without a refill.',
};

export function tryRotomEject(pokemon: Pokemon) {
	if (pokemon.m.ejectWaiting) { pokemon.hp = Math.max(1, pokemon.hp); return true; }
	if (pokemon.transformed || pokemon.m.ejectUsed || !applianceTypes[pokemon.species.id] || !pokemon.hasAbility('eject')) return false;
	pokemon.m.ejectUsed = true;
	pokemon.m.ejectWaiting = true;
	pokemon.m.ejectApplianceType = applianceTypes[pokemon.species.id];
	pokemon.hp = 1;
	pokemon.battle.queue.cancelMove(pokemon);
	pokemon.addVolatile('ejecting', pokemon);
	pokemon.battle.add('-message', `${pokemon.name}'s appliance broke! It is protected while ejecting until the end of the turn.`);
	return true;
}

export function finishRotomEjections(battle: Battle) {
	for (const pokemon of battle.getAllPokemon()) {
		if (!pokemon.m.ejectWaiting) continue;
		const type = pokemon.m.ejectApplianceType;
		const slots = pokemon.moveSlots.map(slot => {
			const oldMove = battle.dex.moves.get(slot.id);
			if (oldMove.type !== type || oldMove.category === 'Status') return {...slot};
			const replacement = battle.dex.moves.get(oldMove.category === 'Physical' ? 'astonish' : 'hex');
			const maxpp = battle.gen <= 2 ? Math.min(61, replacement.pp * 8 / 5) : replacement.pp * 8 / 5;
			return {...slot, id: replacement.id, move: replacement.name, target: replacement.target, maxpp,
				pp: Math.max(0, Math.min(slot.pp, maxpp)), disabled: false, disabledSource: '', used: false};
		});
		pokemon.formeChange('Rotom', null, true, '0');
		pokemon.moveSlots = slots;
		pokemon.baseMoveSlots.splice(0, pokemon.baseMoveSlots.length, ...slots);
		pokemon.m.ejectWaiting = false;
		pokemon.removeVolatile('ejecting');
		pokemon.hp = pokemon.maxhp;
		battle.add('-message', `${pokemon.name} returned from its broken appliance!`);
		battle.add('-heal', pokemon, pokemon.getHealth, '[from] ability: Eject');
	}
}
