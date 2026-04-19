import type { RoundMethod } from "../number/formatNumber.js";
import { convertUnitToFit } from "./convertUnitToFit.js";
import type { BaseUnit, UnitMap } from "./types.js";
import { BASE_UNIT_MAP } from "./unitMap.js";

/**
 * Optimization strategy for {@link getOptimalUnit}.
 *
 * - `min`  — pick the unit that fits the smallest value.
 * - `max`  — pick the unit that fits the largest value.
 * - `freq` — pick the unit that appears most after fitting each value.
 *            Ties are broken toward the **smaller** unit (preserves detail).
 */
export type Optimizer = "min" | "max" | "freq";

interface OptimalUnitOption<U extends string> {
	numbers: number[];
	unitMap?: UnitMap<U>;
	unit: U;
	from?: string;
	offset?: number;
	threshold?: number;
	precision?: number;
	roundMethod?: RoundMethod;
	optimizer?: Optimizer;
}

/**
 * Determines the optimal unit suffix shared across a set of numbers.
 *
 * Useful for choosing a single axis unit in charts or a consistent table column.
 *
 * @example
 * getOptimalUnit({ numbers: [500, 1500, 2500], unit: "mass", from: "g" });
 * // "g"
 *
 * getOptimalUnit({
 *   numbers: [5000, 15000, 25000], unit: "mass", from: "g",
 * });
 * // "kg"
 */
export function getOptimalUnit<U extends string = BaseUnit>(
	option: OptimalUnitOption<U>,
): string {
	const {
		numbers,
		unitMap = BASE_UNIT_MAP as UnitMap<U>,
		unit,
		from,
		offset,
		threshold,
		precision,
		roundMethod,
		optimizer = "min",
	} = option;

	const spec = unitMap[unit];
	if (!spec) throw new Error(`Invalid unit: ${unit}`);

	const { suffices, baseIndex } = spec;
	const fromIndex = from !== undefined ? suffices.indexOf(from) : baseIndex;
	if (fromIndex === -1) throw new Error(`Invalid from suffix: ${from}`);

	const fromSuffix = suffices[fromIndex] as string;
	if (numbers.length === 0) return fromSuffix;

	const absNumbers = numbers.map(Math.abs);

	const fitOptions = {
		unitMap,
		unit,
		from: fromSuffix,
		...(offset !== undefined && { offset }),
		...(threshold !== undefined && { threshold }),
		...(precision !== undefined && { precision }),
		...(roundMethod !== undefined && { roundMethod }),
	};

	if (optimizer === "min" || optimizer === "max") {
		const picker = optimizer === "min" ? Math.min : Math.max;
		return convertUnitToFit({ number: picker(...absNumbers), ...fitOptions })
			.suffix;
	}

	if (optimizer === "freq") {
		return pickMostFrequentSuffix(absNumbers, fitOptions, suffices);
	}

	throw new Error(`Unknown optimizer: ${optimizer}`);
}

function pickMostFrequentSuffix<U extends string>(
	numbers: number[],
	fitOptions: Omit<Parameters<typeof convertUnitToFit<U>>[0], "number">,
	suffices: string[],
): string {
	const freq: Record<string, number> = {};
	for (const n of numbers) {
		const { suffix } = convertUnitToFit({ number: n, ...fitOptions });
		freq[suffix] = (freq[suffix] ?? 0) + 1;
	}
	// Ties → prefer smaller unit (earlier in `suffices`).
	const sorted = Object.entries(freq).sort((a, b) => {
		if (b[1] !== a[1]) return b[1] - a[1];
		return suffices.indexOf(a[0]) - suffices.indexOf(b[0]);
	});
	return (sorted[0] as [string, number])[0];
}
