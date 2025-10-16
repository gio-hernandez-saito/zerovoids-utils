/**
 * Calculates the index of the most significant digit of a number.
 * Used internally for precision calculations in rounding operations.
 *
 * @param value - The number to analyze
 * @returns The index of the significant digit (negative for decimals)
 *
 * @example
 * getSignificantDigitIndex(0.001); // 3 (10^-3)
 * getSignificantDigitIndex(0.1); // 1 (10^-1)
 * getSignificantDigitIndex(5); // 0 (10^0)
 *
 * @internal This is an internal utility function
 */
export function getSignificantDigitIndex(value: number): number {
	const result = -Math.floor(Math.log10(value));
	// Handle -0 case: convert -0 to 0
	return Object.is(result, -0) ? 0 : result;
}
