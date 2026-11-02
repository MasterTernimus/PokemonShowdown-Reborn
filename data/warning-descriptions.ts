import { AbilityComponents } from './ability-components';

const timing = 'On entry and opposing switch-ins, reveals foes\' Illusions';
export const WarningDescriptions = {
	anticipation: {
		desc: `${timing} and a super-effective or OHKO move. Takes 25% less damage from the latest warned move until switching out, excluding OHKO moves. On Psychic Terrain, gains +2 Sp. Atk for each foe with no threat.`,
		shortDesc: 'Reveals dangerous moves; takes 25% less damage from the latest warning.',
	},
	forewarn: {
		desc: `${timing} and a strongest damaging move. Takes 20% less move damage, or 25% less from the latest warned move until switching out, excluding OHKO moves. Each reveal on Psychic Terrain grants +2 Sp. Atk.`,
		shortDesc: 'Reveals strongest moves; takes 20% less move damage, or 25% less from the latest warning.',
	},
	omensight: {
		desc: `${timing}, a super-effective or OHKO move, and a strongest damaging move. Remembers each foe's warned moves until switching out. Forewarn reduces attack damage by 20%, or 25% for its warning. Anticipation reduces its warned attack by another 25%. Neither warning shields against OHKO moves. On Psychic Terrain, gains +2 Sp. Atk for each strongest-move reveal and each foe with no super-effective or OHKO threat.`,
		shortDesc: 'Anticipation and Forewarn stack: 43.75% less damage when both warn of the same move.',
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
		const note = ' Rechecks incoming foes on every switch-in.';
		if (!text.desc.includes(note)) texts[id] = { ...text, desc: text.desc + note };
	}
}
