// Number utilities — formatting
export {
	type AffixConfig,
	type FormatMode,
	type FormatNumberOptions,
	formatNumber,
	type RoundMethod,
	type SignPosition,
} from "./formatNumber.js";
// Number utilities — rounding
export { bankersRound, halfAwayFromZero } from "./round.js";
// Shared types
export type { MaybeNumericInput, RoundOptions } from "./types.js";
