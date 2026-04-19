import type { RoundMethod } from "../number/formatNumber.js";
import { bankersRound, halfAwayFromZero } from "../number/round.js";
import type { BaseUnit, ConvertedReturn, UnitMap } from "./types.js";
import { BASE_UNIT_MAP } from "./unitMap.js";

interface FitOption<U extends string> {
	number: number;
	unitMap?: UnitMap<U>;
	unit: U;
	from?: string;
	/**
	 * Promotion-delay digits.
	 * `0` (default) = promote at `10^gap`, `1` = promote at `10^(gap+1)`, …
	 */
	offset?: number;
	/** Explicit promotion threshold — supersedes `offset` when set. */
	threshold?: number;
	/** Rounding precision for the result. Default `3`. */
	precision?: number;
	/** Rounding method applied to the result. Default `bankersRound`. */
	roundMethod?: RoundMethod;
}

const DEMOTION_THRESHOLD = 1;

function pickRounder(method: RoundMethod) {
	return method === "halfAwayFromZero" ? halfAwayFromZero : bankersRound;
}

/**
 * Converts a number to the most readable unit within its category.
 *
 * - **Promotion** (value → larger unit) when `|value| >= promotionThreshold`.
 *   The threshold defaults to `10^gap` (e.g. 1000 for `mass`);
 *   `offset` adds digits (`10^(gap+offset)`), `threshold` overrides directly.
 * - **Demotion** (value → smaller unit) when `|value| < 1`.
 *
 * The result includes an optional `saturated` flag when the scan reaches the
 * end of the category's suffix list without naturally landing in the
 * `[1, promotionThreshold)` band:
 * - `"max"` — value exceeded the largest suffix's range.
 * - `"min"` — value stayed below `1` even at the smallest suffix.
 *
 * @example
 * convertUnitToFit({ number: 5000, unit: "mass", from: "g" });
 * // { number: 5, unit: "mass", suffix: "kg" }
 *
 * convertUnitToFit({ number: 9e15, unit: "mass", from: "g" });
 * // { number: 9e6, unit: "mass", suffix: "ton", saturated: "max" }
 */
export function convertUnitToFit<U extends string = BaseUnit>(
	option: FitOption<U>,
): ConvertedReturn<U> {
	const {
		number,
		unitMap = BASE_UNIT_MAP as UnitMap<U>,
		unit,
		from,
		offset = 0,
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

	const promotionThreshold = threshold ?? 10 ** (gap + offset);
	const step = 10 ** gap;

	// Zero / single-suffix category: stay.
	if (number === 0 || suffices.length <= 1) {
		return {
			number: round(number, { precision }),
			unit,
			suffix: suffices[fromIndex] as string,
		};
	}

	const absNumber = Math.abs(number);

	// In-range: stay.
	if (absNumber >= DEMOTION_THRESHOLD && absNumber < promotionThreshold) {
		return {
			number: round(number, { precision }),
			unit,
			suffix: suffices[fromIndex] as string,
		};
	}

	const direction: 1 | -1 = absNumber < DEMOTION_THRESHOLD ? -1 : 1;
	let current = number;
	let currentIndex = fromIndex;
	let hitBoundary = false;

	while (true) {
		const nextIndex = currentIndex + direction;
		if (nextIndex < 0 || nextIndex >= suffices.length) {
			hitBoundary = true;
			break;
		}

		current = direction === 1 ? current / step : current * step;
		currentIndex = nextIndex;

		const absCurrent = Math.abs(current);
		if (direction === 1 && absCurrent < promotionThreshold) break;
		if (direction === -1 && absCurrent >= DEMOTION_THRESHOLD) break;
	}

	const result: ConvertedReturn<U> = {
		number: round(current, { precision }),
		unit,
		suffix: suffices[currentIndex] as string,
	};

	if (hitBoundary) {
		result.saturated = direction === 1 ? "max" : "min";
	}

	return result;
}
