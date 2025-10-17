import { toBankersRound } from "../number/toBankersRound.js";
import type { BaseUnit, ConvertedReturn, UnitMap } from "./types.js";
import { BASE_UNIT_MAP } from "./types.js";

/**
 * Converts a given numerical value and its unit to the most fitting unit based on a defined unit mapping.
 * The output includes the converted number, the unit, and the appropriate suffix.
 *
 * @template U - The type of the unit to be converted (string literal, defaults to BaseUnit).
 *
 * @param {Object} option - The option object containing the input parameters.
 * @param {number} option.number - The numerical value to convert.
 * @param {UnitMap<U>} [option.unitMap] - A mapping of units and their related properties (optional, defaults to BASE_UNIT_MAP).
 * @param {U} option.unit - The target unit for conversion.
 * @param {string} [option.from] - The suffix of the original unit (optional; if not provided, defaults to the base index unit).
 * @param {boolean} [option.offset] - Determines whether to adjust the conversion range for selecting the most fitting unit.
 *                                    When `true`, the range increases by one additional step in the unit scale (gap + 1).
 * @return {Object} - The converted numerical value and its associated unit and suffix.
 * @return {number} return.number - The converted numerical value rounded appropriately.
 * @return {U} return.unit - The original target unit specified.
 * @return {string} return.suffix - The suffix corresponding to the most fitting converted unit.
 * @throws {Error} - Throws an error if an invalid target unit is provided.
 * @throws {Error} - Throws an error if an invalid `from` suffix is provided.
 *
 * @example
 * convertUnitToFit({ number: 5000, unit: 'mass', from: 'g' });
 * // { number: 5, unit: 'mass', suffix: 'kg' }
 *
 * convertUnitToFit({ number: 500, unit: 'mass', from: 'kg' });
 * // { number: 500, unit: 'mass', suffix: 'kg' }
 */
export function convertUnitToFit<U extends string = BaseUnit>(option: {
	number: number;
	unitMap?: UnitMap<U>;
	unit: U;
	from?: string;
	offset?: boolean;
}): ConvertedReturn<U> {
	const {
		number,
		unitMap = BASE_UNIT_MAP as UnitMap<U>,
		unit,
		from,
		offset = false,
	} = option;

	const targetUnitItem = unitMap[unit];

	if (!targetUnitItem) throw new Error(`Invalid unit: ${unit}`);

	const { gap, suffices, baseIndex } = targetUnitItem;

	const fromIndex = from ? suffices.indexOf(from) : baseIndex;

	if (fromIndex === -1) throw new Error(`Invalid from suffix: ${from}`);

	const absNumber = Math.abs(number);

	const largerSuffices = suffices.slice(fromIndex + 1);
	const smallerSuffices = suffices.slice(0, fromIndex);
	const targetSuffices = absNumber < 1 ? smallerSuffices : largerSuffices;
	const sign = absNumber < 1 ? 1 : -1;
	const gapWithOffset = offset ? gap + 1 : gap;

	if (
		(1 <= absNumber && absNumber < 10 ** gapWithOffset) ||
		!targetSuffices.length
	) {
		const suffix = suffices[fromIndex] as string;

		return {
			number: toBankersRound(number),
			unit,
			suffix,
		};
	}

	for (let i = 0; i < targetSuffices.length; i += 1) {
		const exponent = sign * (i + 1) * gap;
		const scale = number * 10 ** exponent;
		const rounded = toBankersRound(scale);
		const absRounded = Math.abs(rounded);

		if (1 <= absRounded && absRounded < 10 ** gapWithOffset) {
			const suffix = targetSuffices[i];
			if (suffix !== undefined) {
				return { number: rounded, unit, suffix };
			}
		}
	}

	const lastSuffix = targetSuffices[targetSuffices.length - 1] as string;
	const totalSteps = targetSuffices.length;
	const finalNumber = toBankersRound(number * 10 ** (sign * totalSteps * gap));

	return {
		number: finalNumber,
		unit,
		suffix: lastSuffix,
	};
}
