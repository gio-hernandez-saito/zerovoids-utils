import {
	bankersRound,
	getSignificantDigitIndex,
	halfAwayFromZero,
} from "./round.js";

/**
 * Number formatting mode.
 *
 * - `adaptive`: Uses significant digits for small numbers (< 1), fixed decimals otherwise.
 * - `fixed`: Always uses the specified decimal places, even for integers.
 * - `auto`: Removes decimal places for integers, uses specified decimals otherwise.
 * - `raw`: No rounding, shows the number as-is with locale formatting.
 * - `compact`: Native locale compact notation (`1.2K`, `1M`, …) via
 *   `Intl.NumberFormat({ notation: "compact" })`. Rounding is delegated to the
 *   runtime and `roundMethod` is ignored.
 */
export type FormatMode = "adaptive" | "fixed" | "auto" | "raw" | "compact";

/**
 * Rounding method.
 *
 * - `halfAwayFromZero`: Round half away from zero (commercial rounding).
 * - `bankersRound`: Round half to even (IEEE 754).
 */
export type RoundMethod = "halfAwayFromZero" | "bankersRound";

/**
 * Placement of the minus sign for negative values.
 *
 * - `auto` (default): prefix is emitted as-is, so a negative number renders
 *   like `$-1,234.50`. Matches the raw output of `Number.toLocaleString`.
 * - `before-prefix`: sign is lifted before the prefix, producing `-$1,234.50`.
 */
export type SignPosition = "auto" | "before-prefix";

/**
 * Affix configuration with optional spacing.
 */
export interface AffixConfig {
	/** The text to add as a prefix or suffix. */
	text: string;
	/** Add a space between the number and the affix. Default `false`. */
	space?: boolean;
}

/**
 * Options for {@link formatNumber}.
 */
export interface FormatNumberOptions {
	/** @default 'auto' */
	mode?: FormatMode;
	/** @default 2 */
	decimals?: number;
	/** @default 'halfAwayFromZero' — ignored when `mode` is `compact` or `raw`. */
	roundMethod?: RoundMethod;
	prefix?: string | AffixConfig;
	suffix?: string | AffixConfig;
	/** @default 'auto' */
	signPosition?: SignPosition;
	/**
	 * Fallback for non-finite inputs (`NaN`, `±Infinity`). When provided, the
	 * value is returned verbatim — affixes are **not** appended. When omitted,
	 * the runtime's locale string for the non-finite value is emitted (e.g. `"NaN"`).
	 */
	nonFinite?: string | ((value: number) => string);
}

interface ResolvedAffix {
	text: string;
	space: boolean;
}

function resolveAffix(affix: string | AffixConfig | undefined): ResolvedAffix {
	if (affix === undefined) return { text: "", space: false };
	if (typeof affix === "string") return { text: affix, space: false };
	return { text: affix.text, space: affix.space ?? false };
}

function assemble(
	sign: string,
	body: string,
	prefix: ResolvedAffix,
	suffix: ResolvedAffix,
	signPosition: SignPosition,
): string {
	const prefixChunk = `${prefix.text}${prefix.space ? " " : ""}`;
	const suffixChunk = `${suffix.space ? " " : ""}${suffix.text}`;
	if (signPosition === "before-prefix") {
		return `${sign}${prefixChunk}${body}${suffixChunk}`;
	}
	return `${prefixChunk}${sign}${body}${suffixChunk}`;
}

function localeFixed(value: number, decimals: number): string {
	return value.toLocaleString(undefined, {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
	});
}

/**
 * Formats a number with flexible options for rounding, decimals, and affixes.
 *
 * @param value - The number to format.
 * @param options - Formatting options.
 * @returns Formatted number string with thousand separators and optional affixes.
 *
 * @example
 * formatNumber(0.0000345, { mode: "adaptive", decimals: 2 });
 * // "0.00003"
 *
 * formatNumber(1234.5, { mode: "fixed", decimals: 2, prefix: "$" });
 * // "$1,234.50"
 *
 * formatNumber(-1234.5, { mode: "fixed", decimals: 2, prefix: "$", signPosition: "before-prefix" });
 * // "-$1,234.50"
 *
 * formatNumber(1_234_000, { mode: "compact" });
 * // "1.2M"
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
		signPosition = "auto",
		nonFinite,
	} = options;

	if (!Number.isFinite(value)) {
		if (nonFinite !== undefined) {
			return typeof nonFinite === "function" ? nonFinite(value) : nonFinite;
		}
		// Default: let the locale renderer describe the non-finite value.
		return value.toLocaleString();
	}

	const resolvedPrefix = resolveAffix(prefix);
	const resolvedSuffix = resolveAffix(suffix);

	// `signPosition: "before-prefix"` needs the body without its minus sign.
	const shouldLiftSign = signPosition === "before-prefix" && value < 0;
	const sign = shouldLiftSign ? "-" : "";
	const workingValue = shouldLiftSign ? -value : value;

	if (mode === "compact") {
		const body = workingValue.toLocaleString(undefined, {
			notation: "compact",
			compactDisplay: "short",
			maximumFractionDigits: decimals,
		});
		return assemble(sign, body, resolvedPrefix, resolvedSuffix, signPosition);
	}

	if (mode === "raw") {
		const body = workingValue.toLocaleString(undefined, {
			minimumFractionDigits: 0,
			maximumFractionDigits: 20,
		});
		return assemble(sign, body, resolvedPrefix, resolvedSuffix, signPosition);
	}

	const effectiveDecimals =
		mode === "adaptive" && workingValue !== 0 && Math.abs(workingValue) < 1
			? Math.max(getSignificantDigitIndex(Math.abs(workingValue)), decimals)
			: decimals;

	const rounder =
		roundMethod === "bankersRound" ? bankersRound : halfAwayFromZero;
	const rounded = rounder(workingValue, { precision: effectiveDecimals });

	const body =
		mode === "auto" && Number.isInteger(rounded)
			? rounded.toLocaleString()
			: localeFixed(rounded, effectiveDecimals);

	return assemble(sign, body, resolvedPrefix, resolvedSuffix, signPosition);
}
