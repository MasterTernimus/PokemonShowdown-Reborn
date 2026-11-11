'use strict';
const assert = require('assert').strict;
const { publicFieldGuide } = require('../../dist/server/field-guide');

describe('Field Guide transition directions', () => {
	const fields = publicFieldGuide().entries.filter(entry => entry.kind === 'field');
	const byID = new Map(fields.map(field => [field.id, field]));
	it('uses the same reviewed route for both incoming and outgoing lists', () => {
		for (const field of fields) {
			assert(Array.isArray(field.transitions.incoming), field.id);
			assert(Array.isArray(field.transitions.outgoing), field.id);
			for (const route of field.transitions.outgoing) {
				assert.equal(route.from, field.id);
				assert(route.trigger && route.uses);
				assert(byID.has(route.to) || route.to === 'previous', route.to);
				for (const destination of [route.to, ...(route.alsoTo || [])].filter(id => id !== 'previous')) {
					assert(byID.get(destination).transitions.incoming.some(incoming => JSON.stringify(incoming) === JSON.stringify(route)), destination);
				}
			}
		}
	});
	it('shows how Cave and Volcanic create Dragon’s Den, alongside the cooling exits', () => {
		const den = byID.get('dragonsdenterrain').transitions;
		for (const from of ['caveterrain', 'volcanicterrain']) {
			assert(den.incoming.some(route => route.from === from && route.trigger.includes('Dragon Pulse') && route.uses === '2 uses total'));
		}
		assert(den.outgoing.some(route => route.to === 'volcanicterrain' && route.trigger.includes('Blizzard') && route.uses === '2 uses total'));
		assert(den.outgoing.some(route => route.to === 'volcanicterrain' && route.trigger === 'Sparkling Aria' && route.uses === '1 use'));
		assert(den.outgoing.some(route => route.to === 'caveterrain' && route.trigger.includes('Glaciate') && route.uses === '1 use'));
	});
	it('keeps conditional ice restoration separate from guaranteed destination changes', () => {
		const icy = byID.get('icyterrain').transitions.outgoing;
		const anchor = icy.find(route => route.trigger.startsWith('Anchor Shot'));
		assert.equal(anchor.to, 'previous');
		assert.deepEqual(anchor.alsoTo, ['watersurfaceterrain']);
		assert.match(anchor.note, /otherwise creates Water Surface/);
	});
	it('documents Ripen’s actual two-stage destination', () => {
		const growth = byID.get('flowergarden3').transitions.outgoing;
		assert(growth.some(route => route.to === 'flowergarden5' && route.uses === '1 use with Ripen'));
		assert(growth.some(route => route.to === 'flowergarden4' && route.note === 'Without Ripen.'));
	});
});
