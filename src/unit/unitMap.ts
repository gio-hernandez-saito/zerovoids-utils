import type { BaseUnit, UnitMap } from "./types.js";

/**
 * Default unit configurations.
 *
 * @example
 * // Define additional categories alongside defaults:
 * const customMap: UnitMap<"temperature"> = {
 *   temperature: { gap: 3, suffices: ["mK", "K", "kK"], baseIndex: 1 },
 * };
 */
export const BASE_UNIT_MAP: UnitMap<BaseUnit> = {
	area: { gap: 6, suffices: ["cm²", "m²", "km²"], baseIndex: 1 },
	mass: { gap: 3, suffices: ["g", "kg", "ton"], baseIndex: 1 },
	volume: { gap: 3, suffices: ["mL", "L", "kL"], baseIndex: 1 },
	data: {
		gap: 3,
		suffices: ["B", "KB", "MB", "GB", "TB", "PB"],
		baseIndex: 0,
	},
	count: { gap: 3, suffices: ["", "K", "M", "B", "T"], baseIndex: 0 },
};
