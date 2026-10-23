import { AbilityComponents } from './ability-components';

const timing = 'Checks each active opponent separately when the holder enters, and rechecks each incoming opponent on every switch-in, including repeat entries. Allies are not checked, and initial checks do not trigger twice.';
export const WarningDescriptions = {
	anticipation: {
		desc: `${timing} For each check, removes that opponent's Illusion and reveals one super-effective damaging move or OHKO threat. If that opponent has no threat, Psychic Terrain grants +2 Sp. Atk. Until switching out, takes 25% less damage from opposing uses of the most recently revealed damaging non-OHKO move. This replaces weaker Forewarn protection rather than stacking with it.`,
		shortDesc: 'Checks each foe on entry and every foe switch-in; warns of danger and protects against its latest warned move.',
	},
	forewarn: {
		desc: `${timing} For each check, removes that opponent's Illusion and reveals one of its strongest damaging moves, choosing randomly among ties. Each successful reveal on Psychic Terrain grants +2 Sp. Atk. Takes 20% less move damage, or 25% less from opposing uses of the most recently revealed damaging non-OHKO move until switching out. These reductions do not stack; OHKO moves receive no learned-move protection.`,
		shortDesc: 'Checks each foe on entry and every foe switch-in; latest warned move deals 25% less damage, otherwise 20%.',
	},
};

export function applyWarningDescriptions(texts: Record<string, { desc?: string, shortDesc?: string }>) {
	for (const [id, text] of Object.entries(WarningDescriptions)) texts[id] = { ...texts[id], ...text };
	for (const [id, text] of Object.entries(texts)) {
		if (id in WarningDescriptions || !text.desc) continue;
		const seen = new Set<string>();
		const pending = [...(AbilityComponents[id] || [])];
		while (pending.length) {
			const component = pending.pop()!;
			if (seen.has(component)) continue;
			seen.add(component);
			pending.push(...(AbilityComponents[component] || []));
		}
		const names = ['anticipation', 'forewarn'].filter(name => seen.has(name));
		if (!names.length) continue;
		const note = ` Its ${names.map(name => name === 'anticipation' ? 'Anticipation' : 'Forewarn').join(' and ')} component: ${timing} Each check retains its usual Psychic Terrain bonus condition and latest-warned-move protection.`;
		if (!text.desc.includes(note)) texts[id] = { ...text, desc: text.desc + note };
	}
}
