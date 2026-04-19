/**
 * Default unit categories.
 */
export type BaseUnit = "area" | "mass" | "volume" | "data" | "count";

/**
 * Configuration for a single unit category.
 *
 * - `gap`: The power of 10 between successive units (e.g. gap=3 → 1000×).
 * - `suffices`: Ordered list of unit suffixes, small → large.
 * - `baseIndex`: Index within `suffices` of the unit treated as the base.
 */
export interface UnitSpec {
	gap: number;
	suffices: string[];
	baseIndex: number;
}

/**
 * Mapping of unit category names to their specifications.
 *
 * @template U - Unit category string literal. Defaults to {@link BaseUnit}.
 */
export type UnitMap<U extends string = BaseUnit> = Record<U, UnitSpec>;

/**
 * Return type of conversion functions.
 *
 * `saturated` is set by {@link convertUnitToFit} when the value hits the
 * smallest or largest available suffix before reaching the natural range
 * `[1, promotionThreshold)`. Useful for UIs that want to render "10G+"
 * or "<1 B" style affordances.
 */
export interface ConvertedReturn<U extends string = BaseUnit> {
	number: number;
	unit: U;
	suffix: string;
	saturated?: "min" | "max";
}
