'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');
const { CharacterMoveProfiles } = require('../../dist/data/reborn-character-moves');

describe('Character move field previews', () => {
	it('exports standalone power hooks only for character moves with a field power rule', function () {
		this.timeout(15000);
		const root = fs.mkdtempSync(path.join(os.tmpdir(), 'showdown-field-export-'));
		const src = path.join(root, 'play.pokemonshowdown.com/src');
		try {
			fs.mkdirSync(src, { recursive: true });
			execFileSync(process.execPath, [path.resolve(__dirname, '../../tools/export-client-field-rules.cjs'), root]);
			const text = fs.readFileSync(path.join(src, 'battle-field-rules.ts'), 'utf8');
			const ts = require('typescript');
			const script = ts.transpileModule(text, { compilerOptions: { target: ts.ScriptTarget.ES2020 } });
			const window = {};
			vm.runInNewContext(script.outputText, { window });
			const rules = window.BattleFieldMoveRules;
			assert(rules, 'Generated move preview rules');
			for (const [id, profile] of Object.entries(CharacterMoveProfiles)) {
				const hook = rules[id]?.onBasePower;
				if (!profile.powerFields?.length) {
					assert.equal(hook, undefined, id);
					continue;
				}
				for (const field of [...profile.powerFields, 'unrelatedterrain']) {
					const view = { field: { isTerrain: ids => ids.includes(field) }, chainModify: factor => factor };
					assert.equal(hook.call(view, 85, {}, {}), profile.powerFields.includes(field) ? profile.powerMultiplier : undefined, id);
				}
			}
		} finally {
			fs.rmSync(root, { recursive: true, force: true });
		}
	});
});
