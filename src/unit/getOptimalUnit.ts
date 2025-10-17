import { convertUnitToFit } from "./convertUnitToFit.js";
import type { BaseUnit, UnitMap } from "./types.js";
import { BASE_UNIT_MAP } from "./types.js";

/**
 * Determines the optimal unit suffix for a given set of numbers based on the provided configuration.
 *
 * @template U - The type of the unit to be converted (string literal, defaults to BaseUnit).
 *
 * @param {object} option - Configuration options for unit optimization.
 * @param {number[]} option.numbers - Array of numbers to be evaluated for optimal unit conversion.
 * @param {UnitMap<U>} [option.unitMap] - Map defining units and their respective properties. If not provided, a default map is used.
 * @param {U} option.unit - The base unit to evaluate and optimize.
 * @param {string} [option.from] - The initial unit suffix to convert from. Defaults to the base unit's suffix if not provided.
 * @param {boolean} [option.offset=false] - Determines whether the conversion should account for an offset.
 * @param {'min'|'max'|'freq'} [option.optimizer='min'] - Optimization strategy: 'min' for the smallest number, 'max' for largest, or 'freq' for the most frequent suffix in results.
 * @return {string} - The optimal unit suffix based on the supplied numbers and optimization strategy.
 *
 * @example
 * getOptimalUnit({ numbers: [500, 1500, 2500], unit: 'mass', from: 'g' });
 * // 'g' (based on min optimizer, 500 fits best in a g scale)
 *
 * getOptimalUnit({
 *   numbers: [5000, 8000, 12000],
 *   unit: 'mass',
 *   from: 'g',
 *   optimizer: 'freq'
 * });
 * // 'kg' (most numbers fit in kg scale)
 */
export function getOptimalUnit<U extends string = BaseUnit>(option: {
	numbers: number[];
	unitMap?: UnitMap<U>;
	unit: U;
	from?: string;
	offset?: boolean;
	optimizer?: "min" | "max" | "freq";
}): string {
	const {
		numbers,
		unitMap = BASE_UNIT_MAP as UnitMap<U>,
		unit,
		from,
		offset = false,
		optimizer = "min",
	} = option;
	const targetUnitItem = unitMap[unit];

	if (!targetUnitItem) throw new Error(`Invalid unit: ${unit}`);

	const { suffices, baseIndex } = targetUnitItem;
	const fromIndex = from ? suffices.indexOf(from) : baseIndex;
	if (fromIndex === -1) throw new Error(`Invalid from suffix: ${from}`);

	const fromSuffix = from ?? suffices[baseIndex];
	if (fromSuffix === undefined) throw new Error(`Invalid from suffix: ${from}`);
	if (numbers.length === 0) return fromSuffix;

	const absNumbers = numbers.map((e) => Math.abs(e));

	const calculateOptimalSuffix = () => {
		switch (optimizer) {
			case "min":
			case "max": {
				const targetFunc = optimizer === "min" ? Math.min : Math.max;
				const targetNumber = targetFunc(...absNumbers);
				return convertUnitToFit({
					number: targetNumber,
					unitMap,
					unit,
					from: fromSuffix,
					offset,
				}).suffix;
			}
			case "freq": {
				const freqCount = absNumbers.reduce(
					(result, number) => {
						const converted = convertUnitToFit({
							number,
							unitMap,
							unit,
							from: fromSuffix,
							offset,
						});
						const { suffix } = converted;
						result[suffix] = (result[suffix] ?? 0) + 1;
						return result;
					},
					{} as Record<string, number>,
				);
				const sortedFrequencies = Object.entries(freqCount).sort(
					(a, b) => b[1] - a[1],
				);

				const [firstSuffix] = sortedFrequencies[0] as [string, number];

				return firstSuffix;
			}
			default:
				throw new Error(`Unknown optimizer: ${optimizer}`);
		}
	};
	return calculateOptimalSuffix();
}
