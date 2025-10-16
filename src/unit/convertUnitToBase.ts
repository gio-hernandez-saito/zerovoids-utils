import { convertUnitFromTo } from "./convertUnitFromTo.js";
import type { BaseUnit, ConvertedReturn, UnitMap } from "./types.js";
import { BASE_UNIT_MAP } from "./types.js";

/**
 * Converts a given measurement number from a specified unit to its base unit.
 *
 * @template U - The type of the unit to be converted (string literal, defaults to BaseUnit).
 *
 * @param {Object} option - The configuration object for conversion.
 * @param {number} option.number - The numeric value of the measurement to be converted.
 * @param {UnitMap<U>} [option.unitMap] - Optional mapping of units defining their relationships and base unit.
 * @param {U} option.unit - The target unit type.
 * @param {string} option.from - The initial unit of the provided measurement.
 * @return {number} Returns the equivalent measurement value in the base unit.
 * @throws {Error} Throws an error if the target unit is invalid or if the base suffix does not exist.
 *
 * @example
 * convertUnitToBase({ number: 1000, unit: 'mass', from: 'g' });
 * // { number: 1, unit: 'mass', suffix: 'kg' } (kg is the base)
 */
export function convertUnitToBase<U extends string = BaseUnit>(option: {
	number: number;
	unitMap?: UnitMap<U>;
	unit: U;
	from: string;
}): ConvertedReturn<U> {
	const { number, unitMap = BASE_UNIT_MAP as UnitMap<U>, unit, from } = option;

	const targetUnitItem = unitMap[unit];

	if (!targetUnitItem) throw new Error(`Invalid unit: ${unit}`);

	const { suffices } = targetUnitItem;
	const to = suffices[targetUnitItem.baseIndex];

	if (to === undefined) throw new Error(`Invalid to suffix: ${to}`);

	return convertUnitFromTo({ number, unitMap, unit, from, to });
}
