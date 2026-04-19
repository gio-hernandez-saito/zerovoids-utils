import type { MaybeNumericInput, RoundOptions } from "./types.js";

/**
 * Validates that the input is a number or numeric string.
 *
 * @internal
 */
function assertNumericInput(input: MaybeNumericInput): void {
	if (typeof input !== "string" && typeof input !== "number") {
		throw new Error(
			`Invalid input: expected a number or numeric string, but received ${typeof input}.`,
		);
	}
	if (Number.isNaN(Number(input))) {
		throw new Error(
			"Invalid input: expected a number or numeric string, but received NaN.",
		);
	}
}

/**
 * Scales a value by 10^precision and removes IEEE 754 floating-point artifacts.
 *
 * `2.135 * 100` naturally evaluates to `213.49999999999997`; this helper
 * corrects it to `213.5` via `toFixed(8)`. Reliable for precision 0–10;
 * beyond that the scaling loses significant digits silently.
 *
 * @internal
 */
function scaleForRounding(value: number, precision: number): number {
	return +(value * 10 ** precision).toFixed(8);
}

/**
 * Index of the most significant digit of a positive value.
 *
 * Used by {@link formatNumber} in `adaptive` mode to pick an effective
 * decimal count for small numbers. Not part of the public API.
 *
 * @internal
 */
export function getSignificantDigitIndex(value: number): number {
	const result = -Math.floor(Math.log10(value));
	return Object.is(result, -0) ? 0 : result;
}

/**
 * Rounds a number using the "round half away from zero" strategy
 * (commercial rounding / 사사오입).
 *
 * When a value is exactly halfway, it rounds in the direction away from zero.
 *
 * **Note:** This differs from `Math.round()` for negatives:
 * - `Math.round(-2.5) === -2` (toward +∞)
 * - `halfAwayFromZero(-2.5) === -3` (away from zero)
 *
 * @param input - The number to round (number | numeric string | nullish).
 * @param options - Configuration.
 * @param options.precision - Decimal places to round to. Default `1`.
 * @returns The rounded number.
 * @throws If `input` is not a valid number or numeric string.
 *
 * @example
 * halfAwayFromZero(2.5, { precision: 0 });   // 3
 * halfAwayFromZero(-2.5, { precision: 0 });  // -3
 * halfAwayFromZero(2.135, { precision: 2 }); // 2.14
 *
 * @see {@link bankersRound}
 */
export function halfAwayFromZero(
	input: MaybeNumericInput,
	options: RoundOptions = {},
): number {
	const { precision = 1 } = options;
	assertNumericInput(input);

	const value = Number(input);
	if (value === 0) return 0;

	const sign = value < 0 ? -1 : 1;
	const scaled = scaleForRounding(Math.abs(value), precision);
	return (sign * Math.round(scaled)) / 10 ** precision;
}

/**
 * Rounds a number using banker's rounding (round half to even — IEEE 754).
 *
 * When a value is exactly halfway between two representable results, rounds
 * to the nearest **even** digit — reducing cumulative bias compared to
 * "half away from zero". Otherwise behaves like ordinary rounding.
 *
 * The caller's `precision` is always respected as-is. If you need the old
 * "auto-promote precision for `|value| < 1`" behavior, use
 * `formatNumber(v, { mode: "adaptive", roundMethod: "bankersRound" })`
 * which handles that at the formatting layer.
 *
 * @param input - The number to round (number | numeric string | nullish).
 * @param options - Configuration.
 * @param options.precision - Decimal places to round to. Default `1`.
 * @returns The rounded number.
 * @throws If `input` is not a valid number or numeric string.
 *
 * @example
 * bankersRound(2.5, { precision: 0 });   // 2
 * bankersRound(3.5, { precision: 0 });   // 4
 * bankersRound(2.135, { precision: 2 }); // 2.14
 *
 * @see {@link halfAwayFromZero}
 */
export function bankersRound(
	input: MaybeNumericInput,
	options: RoundOptions = {},
): number {
	const { precision = 1 } = options;
	assertNumericInput(input);

	const value = Number(input);
	if (value === 0) return 0;

	const scaled = scaleForRounding(value, precision);
	const integerPart = Math.floor(scaled);
	const fractional = scaled - integerPart;

	const EPSILON = 1e-8;
	const isExactHalf = fractional > 0.5 - EPSILON && fractional < 0.5 + EPSILON;

	const rounded = isExactHalf
		? integerPart % 2 === 0
			? integerPart
			: integerPart + 1
		: Math.round(scaled);

	return rounded / 10 ** precision;
}
