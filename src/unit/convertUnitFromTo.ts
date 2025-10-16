import { toBankersRound } from "../number";
import type { BaseUnit, ConvertedReturn, UnitMap } from "./types.js";
import { BASE_UNIT_MAP } from "./types.js";

/**
 * Converts a given number from one unit suffix to another within the same unit system.
 *
 * @template U - The type of the unit to be converted (string literal, defaults to BaseUnit).
 *
 * @param {Object} option - The options for the conversion process.
 * @param {number} option.number - The numerical value to convert.
 * @param {UnitMap<U>} [option.unitMap] - The mapping of unit configurations.
 * @param {U} option.unit - The unit system to use for conversion.
 * @param {string} option.from - The original suffix of the unit. (Default: suffix from suffices[baseIndex])
 * @param {string} option.to - The target suffix of the unit.
 * @return {Object} - An object containing the converted number and the target suffix.
 * @return {number} return.number - The converted numerical value.
 * @return {unit} return.unit - The target unit key.
 * @return {string} return.suffix - The target unit suffix.
 *
 * @example
 * convertUnitFromTo({ number: 1000, unit: 'mass', from: 'g', to: 'kg' });
 * // { number: 1, unit: 'mass', suffix: 'kg' }
 */
export function convertUnitFromTo<U extends string = BaseUnit>(option: {
	number: number;
	unitMap?: UnitMap<U>;
	unit: U;
	from?: string;
	to: string;
}): ConvertedReturn<U> {
	const {
		number,
		unitMap = BASE_UNIT_MAP as UnitMap<U>,
		unit,
		from,
		to,
	} = option;

	const targetUnitItem = unitMap[unit];
	if (!targetUnitItem) throw new Error(`Invalid unit: ${unit}`);

	const { gap, suffices, baseIndex } = targetUnitItem;

	const fromIndex = from ? suffices.indexOf(from) : baseIndex;
	const toIndex = suffices.indexOf(to);

	if (fromIndex === -1) throw new Error(`Invalid from suffix: ${from}`);
	if (toIndex === -1) throw new Error(`Invalid to suffix: ${to}`);

	const diff = (toIndex - fromIndex) * gap;
	const num = number * 10 ** -diff;

	return { number: toBankersRound(num), unit, suffix: to };
}
