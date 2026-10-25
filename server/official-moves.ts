import { Dex } from '../sim/dex';

/** Official challenges validate custom learnsets without adding other obtainability rules. */
export function officialMovesValidationFormat(formatid: string, challengeType: string): string {
	if (challengeType !== 'challengeofficial') return formatid;
	const [base, custom = ''] = formatid.split('@@@');
	const rules = custom.split(',').filter(rule =>
		rule && rule.replace(/[^a-z0-9]/gi, '').toLowerCase() !== 'obtainablemoves');
	rules.push('Obtainable Moves');
	return Dex.formats.validate(base + '@@@' + rules.join(','));
}
