/** Challenge-local restrictions. These never grant a mechanic forbidden by a format. */
import { Dex } from './dex';

export interface ChallengeOptions {
	weather?: string;
	gimmicks?: number;
}

const WEATHER_NAMES: { [id: string]: string } = {
	raindance: 'Rain', sunnyday: 'Sun', sandstorm: 'Sandstorm', hail: 'Hail',
};

export function validateChallengeOptions(value: unknown, format: Format): Readonly<ChallengeOptions> {
	if (value === undefined) return Object.freeze({});
	if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid challenge options.');
	const options = value as ChallengeOptions;
	if (Object.keys(options).some(key => !['weather', 'gimmicks'].includes(key))) {
		throw new Error('Unsupported challenge option.');
	}
	const dex = Dex.forFormat(format);
	// Older generation mods have their own mechanic and weather implementations.
	if (Object.keys(options).length && (dex.currentMod !== 'base' || dex.gen !== 9)) {
		throw new Error('Custom challenge options are supported only by the Gen 9 engine.');
	}
	if (options.gimmicks !== undefined && format.name.includes('Multi 1v2')) {
		throw new Error('Custom gimmick allowances are not supported in solo Multi 1v2.');
	}
	const result: ChallengeOptions = {};
	if (options.weather !== undefined) {
		if (typeof options.weather !== 'string' || !Object.prototype.hasOwnProperty.call(WEATHER_NAMES, options.weather)) {
			throw new Error('Unsupported starting weather.');
		}
		if (format.terrain === 'randomterrain') {
			throw new Error('Starting weather cannot be selected on a random field: some possible fields prohibit weather. Choose a fixed field or keep the weather default.');
		}
		if (['midnightzoneterrain', 'underwaterterrain', 'newworldterrain'].includes(format.terrain || '')) {
			throw new Error('This field does not support starting weather.');
		}
		if (dex.conditions.get(options.weather).effectType !== 'Weather') {
			throw new Error('This engine does not implement that weather.');
		}
		result.weather = options.weather;
	}
	if (options.gimmicks !== undefined) {
		if (!Number.isInteger(options.gimmicks) || options.gimmicks < 0 || options.gimmicks > 2) {
			throw new Error('Gimmick uses per trainer must be 0, 1, or 2 (the existing format cap).');
		}
		result.gimmicks = options.gimmicks;
	}
	return Object.freeze(result);
}

export function describeChallengeOptions(options?: ChallengeOptions): string {
	const parts = [];
	if (options?.weather) parts.push(`Starting weather: ${WEATHER_NAMES[options.weather]} (normal duration and changes)`);
	if (options?.gimmicks !== undefined) {
		parts.push(`Gimmicks per trainer: ${options.gimmicks} shared uses; existing mechanic restrictions apply`);
	}
	return parts.join('; ');
}
