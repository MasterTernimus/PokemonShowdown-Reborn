'use strict';
const assert = require('assert').strict;
const {Dex} = require('../../dist/sim');
const {SharedPassiveAbilityDescriptions, SignaturePassiveDescriptions} = require('../../dist/data/passive-ability-cleanup');
const {getAbilityMechanicsHTML} = require('../../dist/server/ability-lookup');

describe('Current-effect ability wording', () => {
	const obsolete = /no longer (?:includes|cures|blocked)|Mind's Eye gives no healing|This passive does not include|Replaces Shield Dust|No (?:Merciless critical-hit bonus|Berserk boosts|Wind Rider boosts)|(?:is supplied (?:separately )?by|is a separate species passive)/i;
	it('keeps change notes out of every ability and contextual passive description', () => {
		const texts = [
			...Dex.abilities.all().map(a => [a.id, a]),
			...Object.entries(SharedPassiveAbilityDescriptions),
			...Object.entries(SignaturePassiveDescriptions),
		];
		for (const [id, text] of texts) {
			assert(text.desc?.trim(), id + ' full description');
			assert(text.shortDesc?.trim(), id + ' summary');
			assert.doesNotMatch(text.desc + ' ' + text.shortDesc, obsolete, id);
		}
	});
	it('keeps Aevian Ascendance’s current effects in full lookup without removed-healing commentary', () => {
		const ability = Dex.abilities.get('aevianascendance');
		for (const phrase of ['Normal/Fighting', 'Fairy/Dark', '30%', '1.3x', '1/4', '1/16', 'Underwater']) {
			assert(ability.desc.includes(phrase), phrase);
		}
		assert.doesNotMatch(getAbilityMechanicsHTML(ability, Dex), /gives no healing|slots are unchanged/);
	});
	it('preserves meaningful duration, immunity, target and healing restrictions', () => {
		assert.match(Dex.abilities.get('deltastream').desc, /no longer active/);
		assert.match(Dex.abilities.get('anticipation').desc, /Allies are not checked/);
		assert.match(Dex.abilities.get('exaltedaether').desc, /Substitute damage and allied damage do not heal/);
		assert.match(Dex.abilities.get('royalremedy').desc, /only if a status was cured/);
		assert.match(Dex.abilities.get('rockhead').desc, /Struggle/);
	});
});
