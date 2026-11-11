import { UltraBeastSlots, installUltraBeasts } from './ultra-beast-lineups';
import type { AbilityDataTable } from '../sim/dex-abilities';
import { composeSelectedAbility } from './selected-mega-simplifications';

export const NovemberRosterPassives: { [id: string]: string[] } = {
	dodrio: ['triplethreat'], scizor: ['lightweightswarm'], aggronmega: ['filter'],
	bronzong: ['heatproof'], bronzongrejuv: ['heatproof'], toxicroakdeso: ['anticipation'],
	lumineon: ['stormdrain'], tangrowth: ['regenerator'], froslassaevian: ['levitate'],
	stoutland: ['sandrush'], excadrill: ['toughclaws'], volcaronaaevian: ['shielddust'],
	hatterene: ['magicbounce'], hatterenegmax: ['healingmirror'], gholdengo: ['goodasgold'],
	ludicolo: ['raindish'], shiftry: ['keeneye'], dusknoir: ['pressure'],
	froslassaevianmega: ['waterveil'], ursaluna: ['unnerve'],
};
export const NovemberRosterSlots: { [id: string]: { [slot: string]: string } } = {
	dodrio: { 0: 'Hydra Bond' }, tangrowth: { 1: 'Stamina' }, stoutland: { 0: 'Loyal Guard', 1: 'Sworn Duty' },
	ludicolo: { H: 'Rain Rhythm' }, shiftry: { H: 'Gale Fan' }, dusknoir: { 1: 'Frisk' },
	delphox: { 0: 'Guardian Flame' }, hatterene: { H: 'Healer' },
	gholdengo: { 0: 'Own Tempo', 1: 'Pickup', H: 'Sticky Hold' },
};
for (const [id, slots] of Object.entries(UltraBeastSlots)) {
	NovemberRosterPassives[id] = ['beastboost'];
	NovemberRosterSlots[id] = slots;
}
export const NovemberRosterComponents: { [id: string]: string[] } = {
	lightweightswarm: ['lightmetal', 'swarm'], healingmirror: ['magicbounce', 'healer'], rootrenewal: ['tanglinghair', 'overcoat'],
	territorial: ['stamina', 'guarddog'], guardianflame: ['swornduty'],
};
export const NovemberRosterDescriptions: Record<string, { shortDesc: string, desc: string }> = {
	guardianflame: { shortDesc: 'Heals adjacent allies by 1/4 HP on entry.',
		desc: 'On entry, heals each adjacent ally by 1/4 maximum HP, or 1/3 on Fairy Tale.' },
	rootrenewal: { shortDesc: 'Tangling Hair + Overcoat.',
		desc: 'Contact attackers lose one Speed stage. Immune to weather damage and powder moves.' },
	territorial: { shortDesc: 'Stamina + Guard Dog.',
		desc: 'Opposing hits heal 1/16 HP; the first each turn raises Defense. Cannot be forced out; Intimidate raises Attack instead.' },
	rainrhythm: { shortDesc: 'Damaging sound hits heal 1/16 HP once per turn.',
		desc: 'After a sound move damages a foe, heals 1/16 maximum HP once per turn.' },
	galefan: { shortDesc: 'First damaging wind hit each entry lowers the foe’s accuracy by 1.',
		desc: 'The first wind move that damages a foe each entry lowers that foe’s accuracy by one stage.' },
	lightweightswarm: { shortDesc: 'Light Metal + Swarm.',
		desc: 'Light Metal halves weight and boosts Speed by 25% while free of major status; Factory entry grants +1 Speed. Swarm boosts Bug attacks by 50% at one-third HP or less.' },
	healingmirror: { shortDesc: 'Magic Bounce + Healer.',
		desc: 'Reflects eligible status moves. Each adjacent ally has a 30% chance to have its major status cured at the end of each turn.' },
};
export function installNovemberRoster(abilities: AbilityDataTable) {
	for (const [index, [id, parts]] of Object.entries(NovemberRosterComponents).entries()) {
		const names: Record<string, string> = { lightweightswarm: 'Lightweight Swarm',
			healingmirror: 'Healing Mirror',
			rootrenewal: 'Root Entanglement',
			territorial: 'Territorial',
			guardianflame: 'Guardian Flame' };
		abilities[id as ID] = { ...abilities[id as ID],
			name: names[id],
			num: abilities[id as ID]?.num || 12310 + index,
			rating: 3,
			...NovemberRosterDescriptions[id] };
		if (id === 'territorial') {
			abilities.territorial = { ...abilities.stamina,
				...abilities.guarddog,
				name: 'Territorial',
				num: abilities.territorial.num,
				...NovemberRosterDescriptions.territorial };
		} else composeSelectedAbility(abilities, id, parts, true);
	}
	abilities.rainrhythm = { name: 'Rain Rhythm', num: 12320, rating: 3, ...NovemberRosterDescriptions.rainrhythm,
		onSourceDamagingHit(damage, target, source, move) {
			if (damage <= 0 || !source.hp || source.isAlly(target) || !move.flags.sound || source.m.rainRhythmTurn === this.turn) return;
			source.m.rainRhythmTurn = this.turn;
			this.heal(source.baseMaxhp / 16, source, source, this.effect);
		},
	};
	abilities.galefan = { name: 'Gale Fan', num: 12321, rating: 3, ...NovemberRosterDescriptions.galefan,
		onSourceDamagingHit(damage, target, source, move) {
			if (damage <= 0 || !target.hp || source.isAlly(target) || !move.flags.wind || source.m.galeFanSpent) return;
			source.m.galeFanSpent = true;
			this.boost({ accuracy: -1 }, target, source, this.effect);
		},
	};
	// Magic Bounce now belongs to Hatterene's passive, not its G-Max selectable ability.
	delete abilities.bewitchingmajesty.onTryHit;
	delete abilities.bewitchingmajesty.onTryHitPriority;
	delete abilities.bewitchingmajesty.onAllyTryHitSide;
	for (const [id, name] of Object.entries(NovemberAbilityNames)) Object.assign(abilities[id as ID], { id, name });
	installUltraBeasts(abilities);
	for (const [id, signature] of Object.entries({ falsebouquet: 'flowertrick',
		funeralchoir: 'torchsong',
		festivalstep: 'aquastep' })) {
		const previous = abilities[id as ID].onSourceDamagingHit;
		abilities[id as ID].onSourceDamagingHit = function (damage, target, source, move) {
			if (id !== 'funeralchoir') previous?.call(this, damage, target, source, move);
			if (damage <= 0 || !source.hp || source.isAlly(target) || source.m.masqueradeHealTurn === this.turn) return;
			let fraction = move.id === signature ? 1 / 16 : 0;
			if (id === 'funeralchoir' && move.flags.sound) {
				const fallen = source.side.pokemon.filter(p => p !== source && p.fainted).length;
				fraction = Math.max(fraction, Math.min(4, fallen) / 32);
			}
			if (!fraction) return;
			source.m.masqueradeHealTurn = this.turn;
			this.heal(source.baseMaxhp * fraction, source, source, this.effect);
		};
	}
}

export const NovemberAbilityNames: Record<string, string> = {
	rainrhythm: 'Rain Revel', galefan: 'Gale Revel', dreamsickness: 'Dream Guardian', knightsguard: 'Blade Guardian', vanguard: 'Solar Vanguard', suncharm: 'Solar Enchanter',
	primalego: 'Terra Ascendant', terraresolve: 'Terra Eternal', burningspirit: 'Inferno Ascendant', monarchofice: 'Imperial Ascendant', emperorsresolve: 'Imperial Eternal',
	burningcrown: 'Blazing Crown', terragift: 'Terra Legacy', burningrage: 'Inferno Legacy', imperialedge: 'Imperial Legacy',
	knightsreprisal: 'Guardian Shield', liquidarsenal: 'Guardian Tide', wrathshield: 'Aegis Shield',
	astralwitchcraft: 'Aegis Flame', shadowcurrent: 'Aegis Tide', canopyarcher: 'Canopy Performer',
	ringmaster: 'Ring Performer', tidalvoice: 'Tidal Performer', falsebouquet: 'Masquerade Bloom',
	funeralchoir: 'Masquerade Choir', festivalstep: 'Masquerade Step', rootrenewal: 'Root Entanglement',
};
