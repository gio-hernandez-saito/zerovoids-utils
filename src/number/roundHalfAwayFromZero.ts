import { checkMaybeNumericInput } from "./checkMaybeNumericInput.js";
import type { MaybeNumericInput, RoundOptions } from "./types.js";

/**
 * Rounds a number using the "round half away from zero" strategy (사사오입).
 * Also known as "commercial rounding" or "symmetric arithmetic rounding".
 *
 * When a number is exactly halfway between two values, it always rounds
 * away from zero (up for positive, down for negative).
 *
 * **Precision behavior: **
 * - `precision: 0` → rounds to integer
 * - `precision: 1` → rounds to 1 decimal place
 * - `precision: 2` → rounds to 2 decimal places
 *
 * **⚠️ Note: ** This is different from JavaScript's `Math.round()` for negative numbers.
 * - `Math.round(-2.5) = -2` (toward positive infinity)
 * - `roundHalfAwayFromZero(-2.5) = -3` (away from zero)
 *
 * **Floating-point precision handling: **
 * This function uses `toFixed(8)` to mitigate JavaScript's IEEE 754 floating-point
 * precision issues before rounding. For example,
 * - `2.135 * 100` results in `213.49999999999997` (not `213.5`)
 * - `toFixed(8)` corrects this to `213.5` before rounding
 * - The value `8` is a conventional choice that balances precision and safety
 * - It works reliably for typical use cases (precision 0-10)
 *
 * @param input - The number to round (can be a number, numeric string, or nullish)
 * @param options - Configuration options
 * @param options.precision - Number of decimal places to round to (default: 1)
 * @returns The rounded number
 * @throws {Error} If input is not a valid number or numeric string
 *
 * @example
 * ```TypeScript
 * // Basic rounding with precision: 0 (integer)
 * roundHalfAwayFromZero(2.5, { precision: 0 }); // 3 (away from zero)
 * roundHalfAwayFromZero(3.5, { precision: 0 }); // 4
 * roundHalfAwayFromZero(2.4, { precision: 0 }); // 2
 *
 * // Rounding with precision: 1 (one decimal)
 * roundHalfAwayFromZero(2.55, { precision: 1 }); // 2.6
 * roundHalfAwayFromZero(2.54, { precision: 1 }); // 2.5
 * roundHalfAwayFromZero(2.56, { precision: 1 }); // 2.6
 *
 * // Rounding with precision: 2 (two decimals)
 * roundHalfAwayFromZero(2.567, { precision: 2 }); // 2.57
 * roundHalfAwayFromZero(2.565, { precision: 2 }); // 2.57 (half away from zero)
 * roundHalfAwayFromZero(2.135, { precision: 2 }); // 2.14 (handles floating-point correctly)
 *
 * // Default precision is 1
 * roundHalfAwayFromZero(2.55); // 2.6
 *
 * // Negative numbers (away from zero = more negative)
 * roundHalfAwayFromZero(-2.5, { precision: 0 }); // -3 (away from zero)
 * roundHalfAwayFromZero(-2.55, { precision: 1 }); // -2.6 (away from zero)
 *
 * // String inputs
 * roundHalfAwayFromZero("3.14159", { precision: 2 }); // 3.14
 *
 * // Comparison with Math.round()
 * Math.round(-2.5); // -2 (toward +∞)
 * roundHalfAwayFromZero(-2.5, { precision: 0 }); // -3 (away from zero)
 * ```
 *
 * @see {@link toBankersRound} For banker's rounding (round half to even)
 */
export function roundHalfAwayFromZero(
	input: MaybeNumericInput,
	options: RoundOptions = {},
): number {
	const { precision = 1 } = options;

	checkMaybeNumericInput(input);

	const numericValue = Number(input);
	const absoluteValue = Math.abs(numericValue);
	const sign = numericValue < 0 ? -1 : 1;
	const multiplier = 10 ** precision;

	/**
	 * IMPORTANT: Fix floating-point precision issues using toFixed(8)
	 *
	 * JavaScript's IEEE 754 floating-point arithmetic can produce unexpected results:
	 * - 2.135 * 100 = 213.49999999999997 (not exactly 213.5)
	 * - 0.1 + 0.2 = 0.30000000000000004 (not exactly 0.3)
	 *
	 * toFixed(8) rounds to 8 decimal places, which:
	 * 1. Removes unintended floating-point errors
	 * 2. Preserves intentional precision (8 digits is enough for typical use)
	 * 3. Maintains consistency with toBankersRound implementation
	 *
	 * Value 8 is a conventional choice:
	 * - Large enough to handle typical precision values (0-10)
	 * - Small enough to eliminate floating-point artifacts
	 * - Widely used in JavaScript rounding implementations
	 */
	const scaledValue = +(absoluteValue * multiplier).toFixed(8);
	const rounded = Math.round(scaledValue);

	return (sign * rounded) / multiplier;
}
