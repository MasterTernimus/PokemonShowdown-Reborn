'use strict';
const assert = require('assert').strict;
const fs = require('fs');
const path = require('path');
const ts = require('typescript');
const {Dex} = require('../../../dist/sim/dex');
const methods = new Set(['isTerrain', 'setTerrain', 'changeTerrain', 'canSetTerrain', 'startTerrain',
	'addVolatile', 'addSideCondition', 'addPseudoWeather', 'setWeather', 'changeWeather', 'trySetStatus', 'setStatus']);
describe('Field and condition data integrity', () => {
	for (const file of ['data/terrains.ts', 'data/conditions.ts', 'data/moves.ts', 'data/abilities.ts', 'data/items.ts', 'sim/field.ts', 'sim/battle.ts', 'sim/battle-actions.ts']) {
		it(`${file} only uses registered literal field/condition references`, () => {
			const source = ts.createSourceFile(file, fs.readFileSync(path.join(__dirname, '../../..', file), 'utf8'), ts.ScriptTarget.Latest, true);
			function walk(node) {
				if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) && methods.has(node.expression.name.text)) {
					const arg = node.arguments[0];
					const values = arg && ts.isArrayLiteralExpression(arg) ? arg.elements : [arg];
					for (const value of values) {
						if (value && ts.isStringLiteral(value) && value.text) assert(Dex.conditions.get(value.text).exists, `${file}:${source.getLineAndCharacterOfPosition(value.pos).line + 1}: ${value.text}`);
					}
				}
				ts.forEachChild(node, walk);
			}
			walk(source);
		});
	}
	it('all field formats select registered fields or documented starting aliases', () => {
		for (const format of Dex.formats.all().filter(format => format.terrain)) {
			assert(Dex.conditions.get(format.terrain).exists || ['randomterrain', 'adriennterrain'].includes(format.terrain), `${format.id}: ${format.terrain}`);
		}
	});
});
