import type { RoundMethod } from "../number/formatNumber.js";
import { bankersRound, halfAwayFromZero } from "../number/round.js";
import type { BaseUnit, ConvertedReturn, UnitMap } from "./types.js";
import { BASE_UNIT_MAP } from "./unitMap.js";

interface FromToOption<U extends string> {
	number: number;
	unitMap?: UnitMap<U>;
	unit: U;
	/** Omit → uses baseIndex unit. */
	from?: string;
	/** Omit → uses baseIndex unit (equivalent to {@link convertUnitToBase}). */
	to?: string;
	/**
	 * Promotion-delay digits — only applies when ascending (from < to).
	 * Omit for forced conversion.
	 * `0` = promote at `10^gap`, `1` = promote at `10^(gap+1)`, …
	 */
	offset?: number;
	/**
	 * Explicit promotion threshold — supersedes `offset` when set.
	 * Only applies when ascending.
	 */
	threshold?: number;
	/** Rounding precision for the result. Default `3`. */
	precision?: number;
	/** Rounding method applied to the result. Default `bankersRound`. */
	roundMethod?: RoundMethod;
}

function pickRounder(method: RoundMethod) {
	return method === "halfAwayFromZero" ? halfAwayFromZero : bankersRound;
}

/**
 * Converts a number between unit suffixes within the same category.
 *
 * **Default behavior:** forced conversion to the specified `to` suffix
 * (e.g. `500 W → 0.5 kW`).
 *
 * **Guarded mode** (`offset` or `threshold` specified): `to` is treated as an
 * **upper bound**; the function will only promote step-by-step while the
 * current value meets the threshold, stopping earlier if it doesn't.
 *
 * Descending conversions always forced (guard is ignored).
 *
 * Omitting `to` is equivalent to {@link convertUnitToBase}.
 *
 * @example
 * convertUnitFromTo({ number: 1000, unit: "mass", from: "g", to: "kg" });
 * // { number: 1, unit: "mass", suffix: "kg" }
 *
 * convertUnitFromTo({
 *   number: 500, unit: "mass", from: "g", to: "kg", offset: 0,
 * });
 * // { number: 500, unit: "mass", suffix: "g" } — promotion suppressed
 *
 * convertUnitFromTo({
 *   number: 5000, unit: "mass", from: "g", to: "ton", offset: 1,
 * });
 * // { number: 5000, unit: "mass", suffix: "g" }
 * // threshold = 10^(3+1) = 10000; stays at g
 */
export function convertUnitFromTo<U extends string = BaseUnit>(
	option: FromToOption<U>,
): ConvertedReturn<U> {
	const {
		number,
		unitMap = BASE_UNIT_MAP as UnitMap<U>,
		unit,
		from,
		to,
		offset,
		threshold,
		precision = 3,
		roundMethod = "bankersRound",
	} = option;

	const spec = unitMap[unit];
	if (!spec) throw new Error(`Invalid unit: ${unit}`);

	const { gap, suffices, baseIndex } = spec;
	const round = pickRounder(roundMethod);

	const fromIndex = from !== undefined ? suffices.indexOf(from) : baseIndex;
	if (fromIndex === -1) throw new Error(`Invalid from suffix: ${from}`);

	const toIndex = to !== undefined ? suffices.indexOf(to) : baseIndex;
	if (toIndex === -1) throw new Error(`Invalid to suffix: ${to}`);

	if (fromIndex === toIndex) {
		return {
			number: round(number, { precision }),
			unit,
			suffix: suffices[fromIndex] as string,
		};
	}

	const direction: 1 | -1 = toIndex > fromIndex ? 1 : -1;
	const step = 10 ** gap;

	const hasGuard =
		direction === 1 && (offset !== undefined || threshold !== undefined);
	const promotionThreshold = hasGuard
		? (threshold ?? 10 ** (gap + (offset ?? 0)))
		: undefined;

	let current = number;
	let currentIndex = fromIndex;

	while (currentIndex !== toIndex) {
		if (
			promotionThreshold !== undefined &&
			Math.abs(current) < promotionThreshold
		) {
			break;
		}
		current = direction === 1 ? current / step : current * step;
		currentIndex += direction;
	}

	return {
		number: round(current, { precision }),
		unit,
		suffix: suffices[currentIndex] as string,
	};
}

/**
 * Converts a number to the base unit (the unit at `baseIndex`) of its category.
 *
 * Equivalent to {@link convertUnitFromTo} with `to` omitted — kept as a named
 * export for readability at call sites where the intent is specifically
 * "convert to base".
 *
 * @example
 * convertUnitToBase({ number: 1000, unit: "mass", from: "g" });
 * // { number: 1, unit: "mass", suffix: "kg" }
 */
export function convertUnitToBase<U extends string = BaseUnit>(option: {
	number: number;
	unitMap?: UnitMap<U>;
	unit: U;
	from: string;
	precision?: number;
	roundMethod?: RoundMethod;
}): ConvertedReturn<U> {
	const { number, unitMap, unit, from, precision, roundMethod } = option;
	return convertUnitFromTo({
		number,
		...(unitMap !== undefined && { unitMap }),
		unit,
		from,
		...(precision !== undefined && { precision }),
		...(roundMethod !== undefined && { roundMethod }),
	});
}
