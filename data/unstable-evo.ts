export const UnstableEvoForms: { [species: string]: { move: string, components: IDEntry[] } } = {
	jolteon: { move: 'buzzybuzz', components: ['lightningrod', 'voltabsorb'] },
	flareon: { move: 'sizzlyslide', components: ['soulfire', 'fluffy'] },
	vaporeon: { move: 'bouncybubble', components: ['stormdrain', 'waterabsorb'] },
	umbreon: { move: 'baddybad', components: ['pressure', 'innerfocus'] },
	espeon: { move: 'glitzyglow', components: ['magicbounce', 'telepathy'] },
	glaceon: { move: 'freezyfrost', components: ['icescales', 'slushrush'] },
	leafeon: { move: 'sappyseed', components: ['chlorophyll', 'regenerator'] },
	sylveon: { move: 'sparklyswirl', components: ['friendguard', 'competitive'] },
};

export const UnstableEvoMoveForms: { [move: string]: string } = Object.fromEntries(
	Object.entries(UnstableEvoForms).map(([form, route]) => [route.move, form])
);
