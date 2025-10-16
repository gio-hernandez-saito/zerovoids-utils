import { getSignificantDigitIndex } from "./getSignificantDigitIndex.js";
import { roundHalfAwayFromZero } from "./roundHalfAwayFromZero.js";
import { toBankersRound } from "./toBankersRound.js";

/**
 * Number formatting mode
 *
 * - `adaptive`: Uses significant digits for small numbers (< 1), fixed decimals otherwise
 * - `fixed`: Always uses the specified decimal places, even for integers
 * - `auto`: Removes decimal places for integers, uses specified decimals otherwise
 * - `raw`: No rounding, shows the number as-is with locale formatting
 */
export type FormatMode = "adaptive" | "fixed" | "auto" | "raw";

/**
 * Rounding method
 *
 * - `halfAwayFromZero`: Round half away from zero (standard commercial rounding)
 * - `bankersRound`: Round half to even (IEEE 754 standard, reduces cumulative bias)
 */
export type RoundMethod = "halfAwayFromZero" | "bankersRound";

/**
 * Affix configuration with optional spacing
 */
export interface AffixConfig {
	/** The text to add as a prefix or suffix */
	text: string;
	/** Whether to add a space between the number and the affix (default: false) */
	space?: boolean;
}

/**
 * Options for number formatting
 */
export interface FormatNumberOptions {
	/**
	 * Formatting mode
	 * @default 'auto'
	 */
	mode?: FormatMode;

	/**
	 * Number of decimal places
	 * @default 2
	 */
	decimals?: number;

	/**
	 * Rounding method to use
	 * @default 'halfAwayFromZero'
	 */
	roundMethod?: RoundMethod;

	/**
	 * Prefix configuration
	 */
	prefix?: string | AffixConfig;

	/**
	 * Suffix configuration
	 */
	suffix?: string | AffixConfig;
}

/**
 * Formats a number with flexible options for rounding, decimal places, and affixes.
 *
 * This function provides comprehensive number formatting with multiple modes:
 * - **adaptive**: Automatically adjusts precision for very small numbers
 * - **fixed**: Always shows specified decimal places
 * - **auto**: Shows decimals only when needed (removes for integers)
 * - **raw**: No rounding, shows number as-is
 *
 * @param value - The number to format
 * @param options - Formatting options
 * @returns Formatted number string with a thousand separators and optional affixes
 *
 * @example
 * ```TypeScript
 * // Mode: adaptive (good for charts with varying magnitudes)
 * formatNumber(0.0000345, { mode: 'adaptive', decimals: 2 });
 * // → "0.00003" (uses significant digits)
 *
 * formatNumber(1234.567, { mode: 'adaptive', decimals: 2 });
 * // → "1,234.57" (uses specified decimals)
 *
 * // Mode: fixed (good for financial data)
 * formatNumber(1234, { mode: 'fixed', decimals: 2 });
 * // → "1,234.00" (always 2 decimals)
 *
 * formatNumber(1234.5, { mode: 'fixed', decimals: 2 });
 * // → "1,234.50"
 *
 * // Mode: auto (default, most intuitive)
 * formatNumber(1000, { mode: 'auto', decimals: 2 });
 * // → "1,000" (integer, no decimals)
 *
 * formatNumber(1234.5, { mode: 'auto', decimals: 2 });
 * // → "1,234.50" (has decimals)
 *
 * // Mode: raw (no rounding)
 * formatNumber(1234.56789, { mode: 'raw' });
 * // → "1,234.56789" (as-is)
 *
 * // Rounding methods
 * formatNumber(2.5, { mode: 'fixed', decimals: 0, roundMethod: 'halfAwayFromZero' });
 * // → "3"
 *
 * formatNumber(2.5, { mode: 'fixed', decimals: 0, roundMethod: 'bankersRound' });
 * // → "2" (rounds to even)
 *
 * // Prefix and suffix (string shorthand)
 * formatNumber(1234.5, { mode: 'auto', decimals: 2, prefix: '$' });
 * // → "$1,234.50"
 *
 * formatNumber(1234.5, { mode: 'auto', decimals: 2, suffix: 'kg' });
 * // → "1,234.50kg"
 *
 * // Prefix and suffix with spacing
 * formatNumber(1234.5, {
 *   mode: 'auto',
 *   decimals: 2,
 *   prefix: { text: '$', space: true }
 * });
 * // → "$ 1,234.50"
 *
 * formatNumber(1234.5, {
 *   mode: 'auto',
 *   decimals: 2,
 *   suffix: { text: 'kg', space: true }
 * });
 * // → "1,234.50 kg"
 *
 * // Combined example
 * formatNumber(0.0000567, {
 *   mode: 'adaptive',
 *   decimals: 2,
 *   roundMethod: 'bankersRound',
 *   prefix: { text: '~', space: false },
 *   suffix: { text: 'g', space: true }
 * });
 * // → "~0.00006 g"
 * ```
 */
export function formatNumber(
	value: number,
	options: FormatNumberOptions = {},
): string {
	const {
		mode = "auto",
		decimals = 2,
		roundMethod = "halfAwayFromZero",
		prefix,
		suffix,
	} = options;

	// Parse prefix/suffix
	const prefixText = typeof prefix === "string" ? prefix : (prefix?.text ?? "");
	const prefixSpace =
		typeof prefix === "string" ? false : (prefix?.space ?? false);

	const suffixText = typeof suffix === "string" ? suffix : (suffix?.text ?? "");
	const suffixSpace =
		typeof suffix === "string" ? false : (suffix?.space ?? false);

	// Handle raw mode
	if (mode === "raw") {
		// Use maximumFractionDigits: 20 to show all decimal places without rounding
		const formatted = value.toLocaleString(undefined, {
			minimumFractionDigits: 0,
			maximumFractionDigits: 20,
		});
		return `${prefixText}${prefixSpace ? " " : ""}${formatted}${suffixSpace ? " " : ""}${suffixText}`;
	}

	// Determine effective precision based on mode
	let effectiveDecimals = decimals;

	if (mode === "adaptive" && Math.abs(value) < 1 && value !== 0) {
		const significantIndex = getSignificantDigitIndex(Math.abs(value));
		effectiveDecimals = Math.max(significantIndex, decimals);
	}

	// Round the value
	const rounder =
		roundMethod === "bankersRound" ? toBankersRound : roundHalfAwayFromZero;
	const rounded = rounder(value, { precision: effectiveDecimals });

	// Format based on mode
	let formatted: string;

	if (mode === "fixed") {
		// Always show decimals
		formatted = rounded.toLocaleString(undefined, {
			minimumFractionDigits: effectiveDecimals,
			maximumFractionDigits: effectiveDecimals,
		});
	} else if (mode === "auto") {
		// Show decimals only if not an integer
		const isInteger = Number.isInteger(rounded);
		formatted = isInteger
			? rounded.toLocaleString()
			: rounded.toLocaleString(undefined, {
					minimumFractionDigits: effectiveDecimals,
					maximumFractionDigits: effectiveDecimals,
				});
	} else {
		// adaptive mode: show with effective decimals
		formatted = rounded.toLocaleString(undefined, {
			minimumFractionDigits: effectiveDecimals,
			maximumFractionDigits: effectiveDecimals,
		});
	}

	// Combine with affixes
	return `${prefixText}${prefixSpace ? " " : ""}${formatted}${suffixSpace ? " " : ""}${suffixText}`;
}
