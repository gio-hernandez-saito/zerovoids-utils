import { checkMaybeNumericInput } from "./checkMaybeNumericInput.js";
import { getSignificantDigitIndex } from "./getSignificantDigitIndex.js";
import type { MaybeNumericInput, RoundOptions } from "./types.js";

/**
 * Rounds a number using banker's rounding (round half to even).
 * Also known as "round half to even", "convergent rounding", "statistician's rounding",
 * "Dutch rounding", "Gaussian rounding", or "unbiased rounding".
 *
 * When a number is exactly halfway between two values, it rounds to the
 * nearest EVEN number. This method reduces cumulative rounding errors in
 * repeated calculations, making it preferred in financial and statistical
 * applications.
 *
 * **IEEE 754 Standard: ** This is the default rounding mode specified in the
 * IEEE 754 floating-point standard, known as "round to nearest, ties to even".
 *
 * **Precision behavior: **
 * - `precision: 0` → rounds to integer (10^0)
 * - `precision: 1` → rounds to 1 decimal place (10^1)
 * - `precision: 2` → rounds to 2 decimal places (10^2)
 *
 * **Special behavior for small numbers (|value| < 1): **
 * - Automatically adjusts precision based on the magnitude of the number
 * - Uses the maximum of the specified precision and the significant digit index
 * - This ensures the appropriate rounding for very small decimals (e.g., 0.00123)
 *
 * **Floating-point precision handling: **
 * This function uses `toFixed(8)` to mitigate JavaScript's IEEE 754 floating-point
 * precision issues before rounding. The value `8` is a conventional choice that
 * balances precision and safety for typical use cases. See roundHalfAwayFromZero
 * for a detailed explanation of this approach.
 *
 * @param input - The number to round (can be a number, numeric string, or nullish)
 * @param options - Configuration options
 * @param options.precision - Decimal places to round to (default: 1)
 * @returns The rounded number
 * @throws {Error} If input is not a valid number or numeric string
 *
 * @example
 * ```TypeScript
 * // Banker's rounding with precision: 0 (integer)
 * toBankersRound(2.5, { precision: 0 }); // 2 (rounds to even)
 * toBankersRound(3.5, { precision: 0 }); // 4 (rounds to even)
 * toBankersRound(4.5, { precision: 0 }); // 4 (rounds to even)
 *
 * // Banker's rounding with precision: 1 (one decimal)
 * toBankersRound(2.55, { precision: 1 }); // 2.6 (rounds to even)
 * toBankersRound(2.45, { precision: 1 }); // 2.4 (rounds to even)
 *
 * // Banker's rounding with precision: 2 (two decimals)
 * toBankersRound(2.125, { precision: 2 }); // 2.12 (rounds to even)
 * toBankersRound(2.135, { precision: 2 }); // 2.14 (rounds to even)
 *
 * // Non-halfway values round normally
 * toBankersRound(2.56, { precision: 1 }); // 2.6
 * toBankersRound(2.54, { precision: 1 }); // 2.5
 *
 * // Small numbers (automatic precision adjustment)
 * toBankersRound(0.00125, { precision: 1 }); // 0.001 (uses higher precision)
 * toBankersRound(0.00155, { precision: 1 }); // 0.002 (uses higher precision)
 *
 * // Negative numbers
 * toBankersRound(-2.5, { precision: 0 }); // -2 (rounds toward even)
 * toBankersRound(-3.5, { precision: 0 }); // -4 (rounds toward even)
 * ```
 *
 * @see {@link roundHalfAwayFromZero} For standard "round half away from zero" behavior
 */
export function toBankersRound(
	input: MaybeNumericInput,
	options: RoundOptions = {},
): number {
	const { precision = 1 } = options;

	checkMaybeNumericInput(input);

	const value = Number(input);

	// Handle zero early
	if (value === 0) return 0;

	const absoluteValue = Math.abs(value);

	// For small numbers (< 1), use adaptive precision based on magnitude
	// For large numbers (≥ 1), use the specified precision
	const effectivePrecision =
		absoluteValue < 1
			? Math.max(getSignificantDigitIndex(absoluteValue), precision)
			: precision;

	// Calculate a scaling factor for the desired precision
	const scaleFactor = 10 ** effectivePrecision;

	/**
	 * IMPORTANT: Fix floating-point precision issues using toFixed(8)
	 *
	 * See roundHalfAwayFromZero for a detailed explanation.
	 * In summary: toFixed(8) removes unintended floating-point artifacts
	 * while preserving intentional precision for typical use cases.
	 */
	const scaledValue = +(
		effectivePrecision ? value * scaleFactor : value
	).toFixed(8);

	// Split into integer and fractional parts
	const integerPart = Math.floor(scaledValue);
	const fractionalPart = scaledValue - integerPart;

	// Floating-point error tolerance
	const epsilon = 1e-8;

	// Determine rounding based on banker's rounding rules:
	// - If the fractional part is exactly 0.5, round to the nearest even integer
	// - Otherwise, use standard rounding
	const isExactlyHalf =
		fractionalPart > 0.5 - epsilon && fractionalPart < 0.5 + epsilon;

	const roundedValue = isExactlyHalf
		? integerPart % 2 === 0
			? integerPart // Already even, keep it
			: integerPart + 1 // Make it even by rounding up
		: Math.round(scaledValue); // Standard rounding for non-halfway cases

	// Scale back to original magnitude
	return effectivePrecision ? roundedValue / scaleFactor : roundedValue;
}
