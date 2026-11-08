'use strict';
const assert = require('assert').strict;
const { Dex, TeamValidator } = require('../../dist/sim');
describe('Reborn form catalog integrity', () => {
	it('keeps Espeon transformations in the Espeon family without changing their battle origins', () => {
		for (const name of ['Auroreon', 'Soluneon']) {
			const s = Dex.species.get(name);
			assert.equal(s.baseSpecies, 'Espeon'); assert.equal(s.num, 196);
			assert.equal(s.battleOnly, 'Espeon'); assert.equal(s.changesFrom, 'Espeon');
			assert(Dex.species.get('Espeon').otherFormes.includes(name));
		}
	});
	it('registers supported forms and cosmetics in their family order', () => {
		for (const [base, forms] of [['Ledian', ['Ledian-Mega']], ['Eevee-Starter', ['Abysseon']], ['Gardevoir', ['Gardevoir-Void']], ['Spiritomb', ['Spiritomb-Alt']], ['Dusknoir', ['Dusknoir-Alt']], ['Gourgeist', ['Gourgeist-Small', 'Gourgeist-Super']]]) {
			const s = Dex.species.get(base); for (const form of forms)assert(s.formeOrder.includes(form), form);
		}
		assert(!Dex.species.get('Gourgeist').otherFormes.includes('Gourgeist-Large'));
	});
	it('does not create learnsets for absent upstream species', () => {
		for (const id of ['flox', 'obliteryx']) {
			assert.equal(Dex.species.get(id).exists, false); assert.equal(Dex.data.Learnsets[id], undefined); assert.equal(Dex.species.getLearnsetData(id).learnset, undefined);
		}
	});
	it('keeps disabled Mega data internal despite complete form ordering', () => {
		const validator = TeamValidator.get('gen9nofieldsinglesgame');
		for (const species of ['Mightyena-Mega', 'Mightyena-Mega-Grim', 'Empoleon-Mega-X']) {
			const s = Dex.species.get(species); assert(s.exists);
			const errors = validator.validateSet({ species, ability: s.abilities[0], moves: ['tackle'] }, {});
			assert(errors.some(e => e.includes('disabled')), species);
		}
	});
});
