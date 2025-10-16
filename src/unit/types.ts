/**
 * Default Unit Type
 */
export type BaseUnit = "area" | "mass" | "volume" | "data" | "count" | "custom";

/**
 * Represents a mapping of units to their associated metadata.
 *
 * @template U - A string literal type representing the unit names. Defaults to `BaseUnit`.
 * @property {number} gap - The numerical gap or step factor between unit levels.
 * @property {string[]} suffices - An array of suffixes corresponding to the unit's scaled representations.
 * @property {number} baseIndex - The index of the base unit within the suffices array!
 */
export type UnitMap<U extends string = BaseUnit> = Record<
	U,
	{ gap: number; suffices: string[]; baseIndex: number }
>;

/**
 * A map of unit configurations categorized by their measurement types.
 * Each category specifies the properties for unit transformation and representation.
 *
 * Properties:
 * - gap: The power of 10 difference (logarithmic gap) between successive units in the category.
 * - suffices: An array of suffixes representing the different units in the category.
 * - baseIndex: The index in the suffices array that represents the base unit for calculations.
 *
 * @example
 * // Adding custom units
 * const customUnitMap: UnitMap<'temperature'> = {
 *   temperature: { gap: 3, suffices: ['mK', 'K', 'kK'], baseIndex: 1 }
 * };
 */
export const BASE_UNIT_MAP: UnitMap = {
	area: { gap: 6, suffices: ["cm²", "m²", "km²"], baseIndex: 1 },
	mass: { gap: 3, suffices: ["g", "kg", "ton"], baseIndex: 1 },
	volume: { gap: 3, suffices: ["mL", "L", "kL"], baseIndex: 1 },
	data: { gap: 3, suffices: ["B", "KB", "MB", "GB", "TB", "PB"], baseIndex: 0 },
	count: { gap: 3, suffices: ["", "K", "M", "B", "T"], baseIndex: 0 },
	custom: { gap: 3, suffices: [""], baseIndex: 0 },
};

/**
 * Return type for conversion functions
 */
export interface ConvertedReturn<U extends string = BaseUnit> {
	number: number;
	unit: U;
	suffix: string;
}
