export const SeasonalStrikers = {
	springstriker: {
		name: 'Spring Striker', num: 33301, absorb: 'waterabsorb',
		shortDesc: 'Striker + Water Absorb.',
		desc: 'Kicks gain 40% power. Grants Water Absorb, including its field effects.',
	},
	summerstriker: {
		name: 'Summer Striker', num: 33302, absorb: 'flashfire',
		shortDesc: 'Striker + Flash Fire.',
		desc: 'Kicks gain 40% power. Grants Flash Fire, including its Fire Boost and field effects.',
	},
	autumnstriker: {
		name: 'Autumn Striker', num: 33303, absorb: 'eartheater',
		shortDesc: 'Striker + Earth Eater.',
		desc: 'Kicks gain 40% power. Grants Earth Eater, including its field effects.',
	},
	winterstriker: {
		name: 'Winter Striker', num: 33304, absorb: 'iceabsorb',
		shortDesc: 'Striker + Ice Absorb.',
		desc: 'Kicks gain 40% power. Ice moves are absorbed to restore 1/4 max HP.',
	},
} as const;
