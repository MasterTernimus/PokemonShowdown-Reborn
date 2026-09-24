'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const {BattleStream} = require('../../../dist/sim/battle-stream');
const {commands, resolveFieldName, renderField, renderFieldFull, renderFieldMove, renderAura} = require('../../../dist/server/chat-plugins/field-info');
const reference = require('../../../data/field-reference.json');
const {FieldNotes} = require('../../../dist/data/field-guide');

describe('Field and Aura information commands', () => {
	it('resolves friendly names and rejects unknown or injected text', () => {
		assert.equal(resolveFieldName('Chess'), 'chessboardterrain');
		assert.equal(resolveFieldName('Cold Eclipse Field'), 'coldeclipseterrain');
		assert.equal(resolveFieldName('(Psychic)', true), 'psychicterrain');
		assert.equal(resolveFieldName('Chess', true), undefined);
		assert.equal(resolveFieldName('<script>alert(1)</script>'), undefined);
	});
	it('covers every field with a passive overview and generated move reference', () => {
		for (const id of Object.keys(reference)) {
			assert(FieldNotes[id]?.length, id);
			assert(renderField(id).includes('Move effects'), id);
		}
		assert(renderField('rockyterrain').includes('Failed contact moves'));
		assert(renderFieldFull('rockyterrain').includes('Rock Head'));
		assert(!renderFieldFull('rockyterrain').includes('Complete effects'));
		assert(renderField('chessboardterrain').includes('King adds +1'));
		assert(renderField('chessboardterrain').includes('Main effects'));
		assert(renderField('chessboardterrain').includes('/field Chess Board Terrain, MOVE'));
		assert(renderFieldMove('chessboardterrain', 'Fake Out').includes('priority +4'));
		assert(renderField('chessboardterrain').length < 5000);
		const full = renderFieldFull('chessboardterrain');
		assert(full.includes('Role-dependent move effects'));
		assert(full.includes('Fake Out'));
		assert.equal((full.match(/<li><details>/g) || []).length, Object.keys(reference.chessboardterrain.moves).length);
		assert(renderAura('mistyterrain').includes('1.5× Special Defense'));
		assert(renderAura('psychicterrain').includes('Expanding Force'));
		assert(renderAura('psychicterrain').includes('Changed moves'));
		assert(renderAura('grassyterrain').includes('1&#x2f;16'));
	});
	it('supports named lookups in general chat and clear missing-name errors', async () => {
		const replies = [];
		const context = {sendReplyBox: text => replies.push(text), errorReply: text => replies.push(text)};
		await commands.field.call(context, 'Chess', null);
		assert(replies.pop().includes('Chess Board'));
		await commands.field.call(context, 'Chess, Fake Out', null);
		assert(replies.pop().includes('Fake Out'));
		await commands.field.call(context, 'Chess full', null);
		assert(replies.pop().includes('Detailed effects'));
		await commands.field.call(context, 'Chess, full', null);
		assert(replies.pop().includes('Detailed effects'));
		await commands.aura.call(context, '(Psychic)', null);
		assert(replies.pop().includes('Psychic Aura'));
		await commands.field.call(context, 'info', null);
		assert(replies.pop().includes('/field Chess'));
	});
	it('reads current field and Aura through the public simulator query, including transitions', async () => {
		const battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
			[{species: 'Mew', ability: 'No Ability', moves: ['splash']}],
			[{species: 'Mew', ability: 'No Ability', moves: ['splash']}],
		]);
		const stream = new BattleStream({keepAlive: true});
		stream.battle = battle;
		try {
			battle.makeChoices('team 1', 'team 1');
			battle.field.startTerrain('watersurfaceterrain');
			battle.field.setAura('psychicterrain', 4, battle.p1.active[0]);
			const getFieldInfo = async () => {
				stream._writeLine('requestfieldinfo', '');
				const result = JSON.parse((await stream.read()).split('\n')[1]);
				assert.deepEqual(Object.keys(result).sort(), ['aura', 'auraTurns', 'field', 'fieldTurns']);
				return result;
			};
			assert.equal((await getFieldInfo()).fieldTurns, null);
			battle.makeChoices('move splash', 'move splash');
			assert.equal((await getFieldInfo()).fieldTurns, null);
			battle.field.setTerrainDuration(5);
			assert.equal((await getFieldInfo()).fieldTurns, 5);
			battle.field.setTerrainDuration(9999);
			const replies = [];
			const context = {sendReplyBox: text => replies.push(text), errorReply: text => replies.push(text)};
			const room = {battle: {getFieldInfo}};
			await commands.field.call(context, 'info', room);
			assert(replies.pop().includes('Water Surface'));
			await commands.field.call(context, 'full', room);
			assert(replies.pop().includes('Detailed effects'));
			await commands.aura.call(context, '', room);
			assert(replies.pop().includes('3 turns remaining'));
			battle.field.changeTerrain('underwaterterrain', battle.p1.active[0]);
			await commands.aura.call(context, '', room);
			assert(replies.pop().includes('no active Aura'));
		} finally {
			stream.battle = null;
			stream.destroy();
			battle.destroy();
		}
	});
});
