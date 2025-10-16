// Number utilities - Core rounding functions

export type {
	AffixConfig,
	FormatMode,
	FormatNumberOptions,
	RoundMethod,
} from "./formatNumber.js";
// Number utilities - Formatting
export { formatNumber } from "./formatNumber.js";
// Internal utilities (exported for advanced use)
export { getSignificantDigitIndex } from "./getSignificantDigitIndex.js";
export { roundHalfAwayFromZero } from "./roundHalfAwayFromZero.js";
export { toBankersRound } from "./toBankersRound.js";
// Export shared types
export type { MaybeNumericInput, RoundOptions } from "./types.js";
