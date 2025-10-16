/**
 * Represents a value that can be converted to a number.
 * Accepts number, numeric string, or nullish values.
 */
export type MaybeNumericInput = number | string | undefined | null;

/**
 * Options for rounding operations
 */
export interface RoundOptions {
	/**
	 * Number of decimal places to round to
	 * @default 1
	 */
	precision?: number;
}
