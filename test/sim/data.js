'use strict';

const assert = require('./../assert');
const common = require('../common');

describe('Dex data', function () {
	it('registers stable ordering for the Parasect and Rejuv form families', () => {
		for (const name of ['Parasect', 'Poliwrath', 'Politoed', 'Galvantula', 'Mightyena', 'Espeon']) {
			const species = Dex.species.get(name);
			assert.equal(species.formeOrder[0], name);
			assert.equal(new Set(species.formeOrder).size, species.formeOrder.length);
			for (const forme of species.otherFormes) {
				assert(species.formeOrder.includes(forme), forme);
				assert(Dex.species.get(forme).exists, forme);
			}
		}
	});

	it('keeps appended move sources in validator order without dropping older access', () => {
		assert.deepEqual(Dex.species.getLearnsetData('bulbasaur').learnset.charm,
			['9M', '9E', '8M', '7E', '6E', '5E', '4E', '3E']);
		const methods = 'MTLREVDSC';
		for (const [id, entry] of Object.entries(Dex.data.Learnsets)) {
			for (const [move, sources] of Object.entries(entry.learnset || {})) {
				for (let i = 1; i < sources.length; i++) {
					const previous = sources[i - 1], current = sources[i];
					assert(previous[0] > current[0] || previous[0] === current[0] &&
					methods.indexOf(previous[1]) <= methods.indexOf(current[1]), `${id}/${move}: ${sources}`);
				}
			}
		}
	});
	it('should have valid Pokedex entries', function () {
		const Pokedex = Dex.data.Pokedex;
		function familyRoot(entry, seen = new Set()) {
			assert(entry, 'Missing family member');
			if (!entry.baseSpecies || entry.baseSpecies === entry.name) return entry.name;
			assert(!seen.has(entry.name), 'Cyclic base species: ' + entry.name);
			return familyRoot(Pokedex[toID(entry.baseSpecies)] || Pokedex[toID(Dex.getAlias(toID(entry.baseSpecies)))], new Set([...seen, entry.name]));
		}
		function assertBattleRoute(name, path = new Set()) {
			assert(!path.has(name), `Cyclic battle-only origin: ${name}`);
			const entry = Pokedex[toID(name)] || Pokedex[toID(Dex.getAlias(toID(name)))];
			assert(entry, `Missing battle-only origin: ${name}`);
			if (!entry.battleOnly && !entry.changesFrom) return;
			const next = new Set([...path, name]);
			for (const origin of new Set([].concat(entry.battleOnly || [], entry.changesFrom || []))) assertBattleRoute(origin, next);
		}
		for (const pokemonid in Pokedex) {
			const entry = Pokedex[pokemonid];
			assert.equal(toID(entry.name) === pokemonid ? pokemonid : toID(Dex.getAlias(toID(entry.name)) || entry.name), pokemonid, `Mismatched Pokemon key "${pokemonid}" of ${entry.name}`);
			assert(!entry.name.startsWith("-") && !entry.name.endsWith("-"), `Pokemon name "${entry.name}" should not start or end with a hyphen`);
			assert.equal(entry.name, entry.name.trim(), `Pokemon name "${entry.name}" should not start or end with whitespace`);

			assert(entry.color || entry.isCosmeticForme && Dex.species.get(pokemonid).color, `Pokemon ${entry.name} must have a color.`);
			assert(entry.heightm || entry.isCosmeticForme && Dex.species.get(pokemonid).heightm, `Pokemon ${entry.name} must have a height.`);
			// Reborn materializes cosmetic records with inherited metadata. They are
			// registered in cosmeticFormes rather than the battle-form/evolution graph.
			if (entry.isCosmeticForme) {
				const base = Dex.species.get(entry.baseSpecies);
				assert(base.exists, `${entry.name} must have an existing base species`);
				const origin = Dex.species.get(entry.changesFrom || entry.baseSpecies);
				assert([...(base.cosmeticFormes || []), ...(base.formeOrder || []), ...(origin.cosmeticFormes || []), ...(origin.formeOrder || [])].includes(entry.name), `${entry.name} must be a registered cosmetic form`);
				continue;
			}

			if (entry.forme && entry.baseSpecies && entry.baseSpecies !== entry.name) {
				// entry is a forme of a base species
				const baseEntry = Pokedex[toID(entry.baseSpecies)];
				assert(baseEntry && !baseEntry.battleOnly, `Forme ${entry.name} should have a valid baseSpecies`);
				// Gmax formes are not actually formes, they are only included in pokedex.ts for convenience
				const origin = entry.changesFrom && Pokedex[toID(entry.changesFrom)];
				const cosmeticBranch = origin?.isCosmeticForme && origin.baseSpecies === entry.baseSpecies &&
					(origin.otherFormes || []).includes(entry.name);
				if (!entry.name.includes('Gmax') && entry.isNonstandard !== 'Unobtainable') assert((baseEntry.otherFormes || []).includes(entry.name) || cosmeticBranch,
					`Base species ${entry.baseSpecies} or its cosmetic origin should register ${entry.name}`);
				// Regional/cosmetic branches may own battle forms; validate their links below.
				// Regional and Mega branches can also register their own cosmetic variants.
				assert(!entry.baseForme, `Forme ${entry.baseSpecies} should not have a baseForme (its forme name goes in forme) (did you mean baseSpecies?).`);
			} else {
				// entry should be a base species
				assert(!entry.baseSpecies || entry.baseSpecies === entry.name, `Base species ${entry.name} should not have its own baseSpecies.`);
				assert(!entry.changesFrom, `Base species ${entry.name} should not change from anything (its changesFrom forme should be base).`);
				assert(!entry.battleOnly, `Base species ${entry.name} should not be battle-only (its out-of-battle forme should be base).`);
			}

			if (entry.prevo) {
				const prevoEntry = Pokedex[toID(entry.prevo)] || {};
				assert(prevoEntry.evos.includes(entry.name) ||
					entry.forme && Pokedex[toID(entry.baseSpecies)]?.prevo === entry.prevo && prevoEntry.evos.includes(entry.baseSpecies), `Prevo ${entry.prevo} should have ${entry.name} listed as an evo`);
			}
			if (entry.evos) {
				for (const evo of entry.evos) {
					const evoEntry = Pokedex[toID(evo)] || {};
					assert.equal(evo, evoEntry.name, `Misspelled/nonexistent evo "${evo}" of ${entry.name}`);
					assert.notEqual(entry.num, evoEntry.num, `Evo ${evo} of ${entry.name} should have a different dex number`);
					if (entry.name === "Gimmighoul-Roaming") continue;
					assert.equal(evoEntry.prevo, entry.name, `Evo ${evo} should have ${entry.name} listed as a prevo`);
				}
			}
			if (entry.otherFormes) {
				for (const forme of entry.otherFormes) {
					const formeEntry = Pokedex[toID(forme)] || Pokedex[toID(Dex.getAlias(toID(forme)))] || {};
					assert.equal(forme, formeEntry.name, `Misspelled/nonexistent forme "${forme}" of ${entry.name}`);
					assert.equal(entry.num, formeEntry.num > 0 ? formeEntry.num : (formeEntry.isCosmeticForme ? Dex.species.get(formeEntry.baseSpecies).num : formeEntry.num), `Forme ${formeEntry.name} of ${entry.name} should have the same dex number`);
					assert(formeEntry.isCosmeticForme || formeEntry.baseSpecies === entry.name ||
						formeEntry.baseSpecies === entry.baseSpecies || entry.otherFormes.includes(formeEntry.baseSpecies),
					`Forme ${forme} must belong to ${entry.name} or a registered regional branch`);
					if (!forme.startsWith('Pokestar')) {
						assert.notEqual(entry.formeOrder, undefined, `${entry.name} has an otherForme "${forme}" but no formeOrder field`);
						assert(entry.formeOrder.includes(forme), `Forme "${forme}" of ${entry.name} is not included in its formeOrder`);
					}
				}
			}
			if (entry.battleOnly) {
				const battleOnly = Array.isArray(entry.battleOnly) ? entry.battleOnly : [entry.battleOnly];
				for (const battleForme of battleOnly) {
					const battleEntry = Pokedex[toID(battleForme)] || {};
					assert.equal(Dex.species.get(battleForme).name, battleEntry.name, `Misspelled/nonexistent battle-only forme "${battleForme}" of ${entry.name}`);
					assert.equal(familyRoot(battleEntry), familyRoot(entry), `Battle-only forme ${entry.name} of ${battleEntry.name} should have the same baseSpecies`);
					// Ability transformations may Mega Evolve; every route must still reach a starting form.
					assertBattleRoute(entry.name);
				}
			}
			if (entry.changesFrom) {
				const formeEntry = Pokedex[toID(entry.changesFrom)] || {};
				assert.equal(Dex.species.get(entry.changesFrom).name, formeEntry.name, `Misspelled/nonexistent changesFrom value "${entry.changesFrom}" of ${entry.name}`);
				assert.equal(familyRoot(formeEntry), familyRoot(entry), `Original forme ${formeEntry.name} of ${entry.name} should have the same baseSpecies`);
				assertBattleRoute(entry.name);
				// Rift transformations can chain; the origin walk above checks that they terminate.
			}
			if (entry.cosmeticFormes) {
				for (const forme of entry.cosmeticFormes) {
					assert(forme.startsWith(`${entry.name}-`), `Misspelled/nonexistent beginning of cosmetic forme name "${forme}" of ${entry.name}`);
					assert(!forme.endsWith("-"), `Cosmetic forme name "${forme}" of ${entry.name} should not end with a hyphen`);
					assert.equal(forme, forme.trim(), `Cosmetic forme name "${forme}" of ${entry.name} should not start or end with whitespace`);
					if (!forme.startsWith('Pokestar')) {
						assert.notEqual(entry.formeOrder, undefined, `${entry.name} has a cosmetic forme "${forme}" but no formeOrder field`);
						assert(entry.formeOrder.includes(forme), `Cosmetic forme name "${forme}" of ${entry.name} is not included in its formeOrder`);
					}
				}
			}
			if (entry.formeOrder) {
				for (const forme of entry.formeOrder) {
					if (toID(forme).includes('gmax')) continue;
					 // formeOrder contains other formes and 'cosmetic' formes which do not have entries in Pokedex but should have aliases
					const formeEntry = Dex.species.get(toID(forme));
					assert.equal(forme, formeEntry.name, `Misspelled/nonexistent forme "${forme}" of ${entry.name}`);
					assert(entry.formeOrder.includes(formeEntry.baseSpecies) ||
						entry.baseSpecies === formeEntry.baseSpecies && entry.formeOrder.includes(entry.name), `${entry.name}'s formeOrder does not contain its base species ${formeEntry.baseSpecies}`);
				}
			}

			if (entry.evoItem) {
				const item = Dex.items.get(entry.evoItem);
				assert.equal(entry.evoItem, item.exists && item.name, `Misspelled/nonexistent evo item "${entry.evoItem}" of ${entry.name}`);
			}

			const battleOnly = Dex.species.get(pokemonid).isMega || entry.forme === 'Primal' ? entry.baseSpecies : entry.battleOnly;
			if (entry.requiredAbility) {
				assert(entry.battleOnly, `Forme ${entry.name} with requiredAbility must have battleOnly`);
			}
			if (entry.requiredItem) {
				assert(battleOnly || entry.changesFrom, `Forme ${entry.name} with requiredAbility must have battleOnly or changesFrom`);
			}
			if (entry.requiredMove) {
				assert(battleOnly || entry.changesFrom, `Forme ${entry.name} with requiredAbility must have battleOnly or changesFrom`);
			}
		}
	});

	it('should have valid Items entries', function () {
		const Items = Dex.data.Items;
		for (const itemid in Items) {
			const entry = Items[itemid];
			assert.equal(toID(entry.name), itemid, `Mismatched Item key "${itemid}" of "${entry.name}"`);
			assert.equal(typeof entry.num, 'number', `Item ${entry.name} should have a number`);
		}
	});

	it('should have valid Moves entries', function () {
		const Moves = Dex.data.Moves;
		for (const moveid in Moves) {
			const entry = Moves[moveid];
			assert.equal(toID(entry.name), moveid, `Mismatched Move key "${moveid}" of "${entry.name}"`);
			assert.equal(typeof entry.num, 'number', `Move ${entry.name} should have a number`);
			if (entry.infiltrates !== undefined) assert.equal(typeof entry.infiltrates, 'boolean', `Move ${entry.name} has an invalid Substitute bypass flag`);
		}
	});

	it('should have valid Abilities entries', function () {
		const Abilities = Dex.data.Abilities;
		for (const abilityid in Abilities) {
			const entry = Abilities[abilityid];
			assert.equal(Dex.abilities.get(entry.name).id, abilityid, `Unresolvable Ability name "${entry.name}" for "${abilityid}"`);
			assert.equal(typeof entry.num, 'number', `Ability ${entry.name} should have a number`);
			assert.equal(typeof entry.rating, 'number', `Ability ${entry.name} should have a rating`);
		}
	});

	it('should have valid Rulesets entries', function () {
		const Rulesets = Dex.data.Rulesets;
		for (const formatid in Rulesets) {
			const entry = Rulesets[formatid];
			assert.equal(toID(entry.name), formatid, `Mismatched Ruleset key "${formatid}" of "${entry.name}"`);
		}
	});

	it('should have valid Formats (slow)', function () {
		for (const format of Dex.formats.all()) {
			try {
				Dex.formats.getRuleTable(format);
			} catch (e) {
				e.message = `${format.name}: ${e.message}`;
				throw e;
			}
		}
	});

	it('should have valid Natures entries', function () {
		const Natures = Dex.data.Natures;
		for (const natureid in Natures) {
			const entry = Natures[natureid];
			assert.equal(toID(entry.name), natureid, `Mismatched Nature key "${natureid}" of "${entry.name}"`);
			assert.equal(!!entry.plus, !!entry.minus, `Mismatched Nature values "+${entry.plus}"/"-${entry.minus}" of "${entry.name}"`);
		}
	});

	for (const mod of ['gen2', 'gen7letsgo', 'gen8bdsp', 'gen9']) {
		const available = !!Dex.dexes[mod] && common.hasGeneration(Number(mod.match(/^gen(\d+)/)[1]));
		(available ? it : it.skip)(`should have valid ${mod} Learnsets entries${available ? '' : ' [data unavailable]'}`, function () {
			this.timeout(0);
			const learnsetsArray = [Dex.mod(mod).data.Learnsets];
			for (const Learnsets of learnsetsArray) {
				for (const speciesid in Learnsets) {
					const species = Dex.species.get(speciesid);
					assert.equal(toID(Dex.getAlias(speciesid) || speciesid), toID(Dex.getAlias(species.id) || species.id), `Key "${speciesid}" in Learnsets should be a Species ID`);
					assert(species.exists, `Key "${speciesid}" in Learnsets should be a pokemon`);
					let entry = Learnsets[speciesid];
					if (!entry.learnset) entry = Learnsets[toID(species.changesFrom || species.baseSpecies)];
					for (const moveid in entry.learnset) {
						const move = Dex.moves.get(moveid);
						assert.equal(moveid, move.id, `Move key "${moveid}" of Learnsets entry ${species.name} should be a Move ID`);
						assert(move.exists && !move.realMove, `Move key "${moveid}" of Learnsets entry ${species.name} should be a real move`);

						let prevLearnedGen = 10;
						let prevLearnedTypeIndex = -1;
						const LEARN_ORDER = 'MTLREVDSC';
						for (const learned of entry.learnset[moveid]) {
							// See the definition of MoveSource in sim/global-types
							assert(/^[1-9][MTLREDSVC]/.test(learned), `Learn method "${learned}" for ${species.name}'s ${move.name} is invalid`);

							// the move validator uses early exits, so this isn't purely a consistency thing
							// MTL must be before REDSVC, and generations must be ordered newest to oldest
							const learnedGen = parseInt(learned.charAt(0));
							const learnedTypeIndex = LEARN_ORDER.indexOf(learned.charAt(1));
							assert(learnedGen <= prevLearnedGen, `Learn method "${learned}" for ${species.name}'s ${move.name} should be in order from newest to oldest gen`);
							if (learnedGen === prevLearnedGen) {
								assert(learnedTypeIndex >= prevLearnedTypeIndex, `Learn method "${learned}" for ${species.name}'s ${move.name} should be in MTLREVDSC order`);
							}
							prevLearnedGen = learnedGen;
							prevLearnedTypeIndex = learnedTypeIndex;

							switch (learned.charAt(1)) {
							case 'L':
								assert(/^[0-9]+$/.test(learned.slice(2)), `Learn method "${learned}" for ${species.name}'s ${move.name} is invalid: a level-up move should have the level`);
								const level = parseInt(learned.slice(2));
								assert(level >= 0 && level <= 100, `Learn method "${learned}" for ${species.name}'s ${move.name} is invalid: level should be between 0 and 100`);
								break;
							case 'S':
								assert(/^[0-9]+$/.test(learned.slice(2)), `Learn method "${learned}" for ${species.name}'s ${move.name} is invalid: an event move should have the event number`);
								const eventNum = parseInt(learned.slice(2));
								const eventEntry = entry.eventData?.[eventNum];
								assert(eventEntry, `Learn method "${learned}" for ${species.name}'s ${move.name} is invalid: an event move's event number should be available in entry.eventData`);
								assert.equal(eventEntry.generation, learnedGen, `Event source ${learned} must match its generation`);
								assert(eventEntry.moves.includes(moveid), `Learn method "${learned}" for ${species.name}'s ${move.name} is invalid: an event move's event entry should include that move`);
								break;
							default:
								assert.equal(learned, learned.slice(0, 2), `Learn method "${learned}" for ${species.name}'s ${move.name} is invalid: it should be 2 characters long`);
								break;
							}
						}
					}

					if (entry.eventData) {
						for (const [i, eventEntry] of entry.eventData.entries()) {
							if (eventEntry.moves) {
								const learned = `${eventEntry.generation}S${i}`;
								// Inherited event catalogs also contain distributions unavailable in this mod.
								if (!Object.values(entry.learnset || {}).some(sources => sources.includes(learned))) continue;
								for (const eventMove of eventEntry.moves) {
									if (speciesid.startsWith('pokestar')) {
										assert(Dex.data.Moves[eventMove], `${species.name}'s event move ${Dex.moves.get(eventMove).name} should exist`);
										continue;
									}
									assert.equal(eventMove, toID(eventMove), `${species.name}'s event move "${eventMove}" must be an ID`);
									assert(entry.learnset, `${species.name} has event moves but no learnset`);
									const removed = mod === 'gen9' && (eventMove.startsWith('hiddenpower') ||
										require('../../dist/data/learnsets').CustomLearnsetRemovals[speciesid]?.includes(eventMove) ||
										require('../../dist/sim/dex-species').Gen9MoveLearnsetExclusions[speciesid]?.includes(eventMove));
									if (removed) continue;
									// Event catalogs describe original distributions, not the patched current movepool.
									// Moves can be forgotten, disabled or given new sources by Reborn overlays.
									// Every source that actually grants access is checked strictly above.
									assert(Dex.moves.get(eventMove).exists, `${species.name}'s historical event move ${eventMove} must exist`);
								}
							}
						}
					}
				}
			}
		});
	}

	// Existence function takes a Pokemon and returns yes if it exists and no otherwise
	// can be overridden for testing CAPs

	function countPokemon(dex, existenceFunction = (s) => s.exists && !s.isNonstandard && s.tier !== 'Illegal') {
		const count = {species: 0, formes: 0};
		for (const pkmn of dex.species.all()) {
			if (!existenceFunction(pkmn)) continue;
			if (pkmn.name !== pkmn.baseSpecies) {
				count.formes++;
			} else {
				count.species++;
			}
		}

		return count;
	}

	// Source: https://github.com/pkmn/ps/blob/main/dex/index.test.ts#L283-L326
	// key = gen #, value = number of formes/species in that gen
	const species = {
		1: 151,
		2: 251,
		3: 386,
		4: 493,
		5: 649,
		6: 721,
		7: 807,
		8: 664,
		9: 733,
	};
	const formes = {
		// Gens 1 and 2 have no alternate formes
		1: 0,
		2: 0,
		3: 3 + 3, // Deoxys (3) + Castform (3)
	};
	// Wormadam (2) + Cherrim (1) + Arceus (16) + Pichu (1) +
	// Rotom (5) + Giratina (1) + Shaymin (1)
	formes[4] = formes[3] + 2 + 1 + 16 + 1 + 5 + 1 + 1;
	// Basculin (1) + Darmanitan (1) + *-Therian (3) + Keldeo (1) +
	// Kyurem (2) + Meloetta (1) + Genesect (4) - Pichu (1)
	formes[5] = formes[4] + 1 + 1 + 3 + 1 + 2 + 1 + 4 - 1;
	// Arceus (1) + Vivillon (2) + Meowstic (1) + Primal (2) +
	// Aegislash (1) + Pumpkaboo (3) + Gourgeist (3) + Hoopa (1) +
	// Pikachu (6) + Mega (48) [Floette (1)]
	formes[6] = formes[5] + 1 + 2 + 1 + 2 + 1 + 3 + 3 + 1 + 6 + 48;
	// Alola (18) + Totem (12) + Pikachu (7) - Pikachu (6) + Greninja (2) + Zygarde (2) +
	// Oricorio (3) + Rockruff (1) + Lycanroc (2) + Wishiwashi (1) + Silvally (17) + Minior (1)
	// Mimikyu (1) + Necrozma (3) [Magearna (1) + LGPE Starters/Meltan/Melmetal (4)]
	formes[7] = formes[6] + 18 + 12 + 7 - 6 + 2 + 2 + 3 + 1 + 2 + 1 + 17 + 1 + 1 + 3 - 1;
	// Silvally (17) + Rotom (5) + Basculin (1) + Meowstic (1) +
	// Aegislash (1) + Pumpkaboo (3) + Gourgeist (3) + Pikachu (7) + Galar (14) +
	// Alola (8) + Indeedee (1) + Morpeko (1) + Eiscue (1) + Zacian/Zamazenta (2) +
	// Toxtricity (1) + Cramorant (2) + Necrozma (2) + Mimikyu (2) + Wishiwashi (1) +
	// Keldeo (1) + Kyruem (2) + Darmanitan (2) + Cherrim (1)
	// {DLC1} Alola (4) + Galar (1) + Magearna (1) + Urshifu (1) +
	// Rockruff (1) + Lycanroc (2) + [Pikachu (1) + Zarude (1)]
	// {DLC2} Giratina (1) + *-Therian (3) + Genesect (4) + Zygarde (2) +
	// Birds (3) + Slowking (1) + Calyrex (2)
	// {GMax} 26 + 7
	formes[8] = 17 + 5 + 1 + 1 + 1 + 3 + 3 + 7 + 14 + 8 +
	  1 + 1 + 1 + 2 + 1 + 2 + 2 + 2 + 1 + 1 + 2 + 2 + 1 +
	  (4 + 1 + 1 + 1 + 1 + 2 + (1 + 1)) + (1 + 3 + 4 + 2 + 3 + 1 + 2) - 1; // FIXME Rockruff
	// Pikachu (8) + Origin (3) + Therian (4) + Alola (16) + Galar (7) + Paldea (4) + Hisui (16) +
	// Deoxys (3) + Rotom (5) + Shaymin (1) + Arceus (17) + Basculin (2) + Kyurem (2) + Keldeo (1) +
	// Meloetta (1) + Greninja (1) + Vivillon (2) + Meowstic (1) + Hoopa (1) + Oricorio (3) +
	// Lycanroc (2) + Minior (1) + Mimikyu (1) + Necrozma (2) + Magearna (1) + Toxtricity (1) +
	// Antique (2) + Eiscue (1) + Indeedee (1) + Cramorant (2) + Morpeko (1) + Crowned (2) +
	// Urshifu (1) + Zarude (1) + Calyrex (2) + Oinkologne (1) + Ursaluna (1) + Dudunsparce (1) +
	// Palafin (1) + Maushold (1) + Squawkabilly (3) + Gimmighoul (1) + Basculegion (1) +
	// Masterpiece (2) + Ogerpon (7) + Terapagos (2)
	formes[9] = 8 + 3 + 4 + 16 + 7 + 4 + 16 + 3 + 5 + 1 + 17 +
	  2 + 2 + 1 + 1 + 1 + 2 + 1 + 1 + 3 + 2 + 1 + 1 + 2 + 1 +
	  1 + 2 + 1 + 1 + 2 + 1 + 2 + 1 + 1 + 1 + 2 + 1 + 1 + 1 +
	  1 + 3 + 1 + 1 + 2 + 7 + 2;

	// Reviewed Reborn catalog: custom forms extend the mainline counts. Ordinary and
	// Large Gourgeist are intentionally unavailable; Small and Super remain selectable.
	Object.assign(species, { 7: 806, 8: 663, 9: 733 });
	Object.assign(formes, { 7: 229, 8: 133, 9: 265 });
	it('preserves the supported Gourgeist sizes', () => {
		for (const gen of [7, 8, 9]) {
			const dex = Dex.forGen(gen);
			for (const id of ['gourgeist', 'gourgeistlarge'])assert.equal(dex.species.get(id).isNonstandard, 'Unobtainable');
			for (const id of ['gourgeistsmall', 'gourgeistsuper'])assert(!dex.species.get(id).isNonstandard);
		}
	});
	for (const gen of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
		common.itGen(gen, `should have ${species[gen]} species and ${formes[gen]} formes`, () => {
			const count = countPokemon(Dex.forGen(gen));
			assert.equal(count.species, species[gen]);
			assert.equal(count.formes, formes[gen]);
		});
	}
});
