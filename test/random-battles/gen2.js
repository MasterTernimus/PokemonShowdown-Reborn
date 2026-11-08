/**
 * Tests for Gen 2 randomized formats
 */
'use strict';
const common = require('../common');

const {testHiddenPower} = require('./tools');

common.describeGen(2, '[Gen 2] Random Battle (slow)', () => {
	const options = {format: 'gen2randombattle'};

	it('should prevent double Hidden Power', () => testHiddenPower('scyther', options));
});
