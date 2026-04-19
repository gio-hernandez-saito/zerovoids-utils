/** biome-ignore-all lint/suspicious/noExplicitAny: <ignore> */
import { describe, expect, it } from "vitest";
import { convertUnitFromTo, convertUnitToBase } from "./convertUnitFromTo";

describe("convertUnitFromTo", () => {
	describe("basic unit conversion", () => {
		it("should convert kg to g", () => {
			const result = convertUnitFromTo({
				number: 1,
				unit: "mass",
				from: "kg",
				to: "g",
			});

			expect(result).toEqual({
				number: 1000,
				unit: "mass",
				suffix: "g",
			});
		});

		it("should convert g to kg", () => {
			const result = convertUnitFromTo({
				number: 1000,
				unit: "mass",
				from: "g",
				to: "kg",
			});

			expect(result).toEqual({
				number: 1,
				unit: "mass",
				suffix: "kg",
			});
		});

		it("should convert kg to ton", () => {
			const result = convertUnitFromTo({
				number: 1000,
				unit: "mass",
				from: "kg",
				to: "ton",
			});

			expect(result).toEqual({
				number: 1,
				unit: "mass",
				suffix: "ton",
			});
		});

		it("should convert ton to g", () => {
			const result = convertUnitFromTo({
				number: 1,
				unit: "mass",
				from: "ton",
				to: "g",
			});

			expect(result).toEqual({
				number: 1000000,
				unit: "mass",
				suffix: "g",
			});
		});
	});

	describe("default from parameter (uses base unit)", () => {
		it("should use base unit when from is not specified", () => {
			const result = convertUnitFromTo({
				number: 1,
				unit: "mass",
				to: "g",
			});

			// Base unit for mass is kg (baseIndex: 1)
			expect(result).toEqual({
				number: 1000,
				unit: "mass",
				suffix: "g",
			});
		});
	});

	describe("area unit conversion", () => {
		it("should convert m² to cm²", () => {
			const result = convertUnitFromTo({
				number: 1,
				unit: "area",
				from: "m²",
				to: "cm²",
			});

			expect(result).toEqual({
				number: 1000000, // gap: 6
				unit: "area",
				suffix: "cm²",
			});
		});

		it("should convert km² to m²", () => {
			const result = convertUnitFromTo({
				number: 1,
				unit: "area",
				from: "km²",
				to: "m²",
			});

			expect(result).toEqual({
				number: 1000000, // gap: 6
				unit: "area",
				suffix: "m²",
			});
		});
	});

	describe("volume unit conversion", () => {
		it("should convert L to mL", () => {
			const result = convertUnitFromTo({
				number: 1,
				unit: "volume",
				from: "L",
				to: "mL",
			});

			expect(result).toEqual({
				number: 1000,
				unit: "volume",
				suffix: "mL",
			});
		});

		it("should convert kL to L", () => {
			const result = convertUnitFromTo({
				number: 1,
				unit: "volume",
				from: "kL",
				to: "L",
			});

			expect(result).toEqual({
				number: 1000,
				unit: "volume",
				suffix: "L",
			});
		});
	});

	describe("data unit conversion", () => {
		it("should convert KB to B", () => {
			const result = convertUnitFromTo({
				number: 1,
				unit: "data",
				from: "KB",
				to: "B",
			});

			expect(result).toEqual({
				number: 1000,
				unit: "data",
				suffix: "B",
			});
		});

		it("should convert GB to MB", () => {
			const result = convertUnitFromTo({
				number: 1,
				unit: "data",
				from: "GB",
				to: "MB",
			});

			expect(result).toEqual({
				number: 1000,
				unit: "data",
				suffix: "MB",
			});
		});
	});

	describe("count unit conversion", () => {
		it("should convert K to base", () => {
			const result = convertUnitFromTo({
				number: 1,
				unit: "count",
				from: "K",
				to: "",
			});

			expect(result).toEqual({
				number: 1000,
				unit: "count",
				suffix: "",
			});
		});

		it("should convert M to K", () => {
			const result = convertUnitFromTo({
				number: 5,
				unit: "count",
				from: "M",
				to: "K",
			});

			expect(result).toEqual({
				number: 5000,
				unit: "count",
				suffix: "K",
			});
		});
	});

	describe("banker's rounding", () => {
		it("should apply banker's rounding to results", () => {
			const result1 = convertUnitFromTo({
				number: 1.0025,
				unit: "mass",
				from: "kg",
				to: "g",
			});

			expect(result1.number).toBe(1002.5);

			const result2 = convertUnitFromTo({
				number: 1.0035,
				unit: "mass",
				from: "kg",
				to: "g",
			});

			// 1.0035 * 1000 = 1003.5
			expect(result2.number).toBe(1003.5);
		});
	});

	describe("decimal precision handling", () => {
		it("should handle fractional conversions accurately", () => {
			const result = convertUnitFromTo({
				number: 500,
				unit: "mass",
				from: "g",
				to: "kg",
			});

			expect(result.number).toBe(0.5);
		});

		it("collapses to 0 at default precision when cross-unit ratio exceeds it", () => {
			// 1 g → ton is 1e-6 ton; default precision=3 rounds it to 0.
			// Previous behavior auto-promoted precision for |v|<1, which
			// silently overrode the caller's choice — removed in v2.
			const result = convertUnitFromTo({
				number: 1,
				unit: "mass",
				from: "g",
				to: "ton",
			});
			expect(result.number).toBe(0);
		});

		it("preserves very small numbers when caller supplies enough precision", () => {
			const result = convertUnitFromTo({
				number: 1,
				unit: "mass",
				from: "g",
				to: "ton",
				precision: 6,
			});
			expect(result.number).toBe(1e-6);
		});
	});

	describe("custom unit map", () => {
		it("should work with custom unit definitions", () => {
			const customUnitMap = {
				temperature: { gap: 3, suffices: ["mK", "K", "kK"], baseIndex: 1 },
			};

			const result = convertUnitFromTo({
				number: 1,
				unitMap: customUnitMap,
				unit: "temperature",
				from: "K",
				to: "mK",
			});

			expect(result).toEqual({
				number: 1000,
				unit: "temperature",
				suffix: "mK",
			});
		});
	});

	describe("error handling", () => {
		it("should throw error for invalid unit", () => {
			expect(() =>
				convertUnitFromTo({
					number: 1,
					unit: "invalid" as any,
					from: "kg",
					to: "g",
				}),
			).toThrow("Invalid unit: invalid");
		});

		it("should throw error for invalid from suffix", () => {
			expect(() =>
				convertUnitFromTo({
					number: 1,
					unit: "mass",
					from: "invalid",
					to: "kg",
				}),
			).toThrow("Invalid from suffix: invalid");
		});

		it("should throw error for invalid to suffix", () => {
			expect(() =>
				convertUnitFromTo({
					number: 1,
					unit: "mass",
					from: "kg",
					to: "invalid",
				}),
			).toThrow("Invalid to suffix: invalid");
		});
	});

	describe("same unit conversion", () => {
		it("should handle conversion to same unit", () => {
			const result = convertUnitFromTo({
				number: 100,
				unit: "mass",
				from: "kg",
				to: "kg",
			});

			expect(result).toEqual({
				number: 100,
				unit: "mass",
				suffix: "kg",
			});
		});
	});

	describe("negative numbers", () => {
		it("should handle negative values correctly", () => {
			const result = convertUnitFromTo({
				number: -1000,
				unit: "mass",
				from: "g",
				to: "kg",
			});

			expect(result).toEqual({
				number: -1,
				unit: "mass",
				suffix: "kg",
			});
		});
	});

	describe("zero", () => {
		it("should handle zero values", () => {
			const result = convertUnitFromTo({
				number: 0,
				unit: "mass",
				from: "kg",
				to: "g",
			});

			expect(result).toEqual({
				number: 0,
				unit: "mass",
				suffix: "g",
			});
		});
	});

	describe("to omitted (defaults to base)", () => {
		it("converts to base unit when `to` is omitted", () => {
			expect(
				convertUnitFromTo({ number: 1000, unit: "mass", from: "g" }),
			).toEqual({ number: 1, unit: "mass", suffix: "kg" });
		});

		it("data category — base is B (index 0)", () => {
			expect(
				convertUnitFromTo({ number: 1, unit: "data", from: "KB" }),
			).toEqual({ number: 1000, unit: "data", suffix: "B" });
		});
	});

	describe("offset / threshold (promotion guard, ascending only)", () => {
		it("offset=0: blocks promotion when value < 10^gap", () => {
			expect(
				convertUnitFromTo({
					number: 500,
					unit: "mass",
					from: "g",
					to: "kg",
					offset: 0,
				}),
			).toEqual({ number: 500, unit: "mass", suffix: "g" });
		});

		it("offset=0: promotes when value crosses threshold", () => {
			expect(
				convertUnitFromTo({
					number: 5000,
					unit: "mass",
					from: "g",
					to: "kg",
					offset: 0,
				}),
			).toEqual({ number: 5, unit: "mass", suffix: "kg" });
		});

		it("offset=1: stays at intermediate unit if cap not reachable", () => {
			expect(
				convertUnitFromTo({
					number: 5000,
					unit: "mass",
					from: "g",
					to: "ton",
					offset: 1,
				}),
			).toEqual({ number: 5000, unit: "mass", suffix: "g" });
		});

		it("offset=1: walks step-by-step under the threshold cap", () => {
			expect(
				convertUnitFromTo({
					number: 12000,
					unit: "mass",
					from: "g",
					to: "ton",
					offset: 1,
				}),
			).toEqual({ number: 12, unit: "mass", suffix: "kg" });
		});

		it("threshold supersedes offset", () => {
			expect(
				convertUnitFromTo({
					number: 4000,
					unit: "mass",
					from: "g",
					to: "kg",
					offset: 999,
					threshold: 5000,
				}),
			).toEqual({ number: 4000, unit: "mass", suffix: "g" });

			expect(
				convertUnitFromTo({
					number: 6000,
					unit: "mass",
					from: "g",
					to: "kg",
					threshold: 5000,
				}),
			).toEqual({ number: 6, unit: "mass", suffix: "kg" });
		});

		it("descending ignores guard (always forced)", () => {
			expect(
				convertUnitFromTo({
					number: 0.5,
					unit: "mass",
					from: "kg",
					to: "g",
					offset: 10,
				}),
			).toEqual({ number: 500, unit: "mass", suffix: "g" });
		});
	});

	describe("precision option", () => {
		it("default precision = 3", () => {
			expect(
				convertUnitFromTo({
					number: 1234,
					unit: "mass",
					from: "g",
					to: "kg",
				}),
			).toEqual({ number: 1.234, unit: "mass", suffix: "kg" });
		});

		it("custom precision", () => {
			expect(
				convertUnitFromTo({
					number: 1234,
					unit: "mass",
					from: "g",
					to: "kg",
					precision: 1,
				}),
			).toEqual({ number: 1.2, unit: "mass", suffix: "kg" });
		});
	});

	describe("roundMethod option", () => {
		it("defaults to bankersRound", () => {
			// 1.0025 * 1000 = 1002.5 — halfway, bankers → 1002 (even)? no,
			// at precision 3 the value is 1002.500, scaled=1002500, integer,
			// not exact half → 1002.5. So demonstrate with precision 0.
			expect(
				convertUnitFromTo({
					number: 0.0025,
					unit: "mass",
					from: "kg",
					to: "g",
					precision: 0,
				}),
			).toEqual({ number: 2, unit: "mass", suffix: "g" });
		});

		it("switches to halfAwayFromZero when requested", () => {
			expect(
				convertUnitFromTo({
					number: 0.0025,
					unit: "mass",
					from: "kg",
					to: "g",
					precision: 0,
					roundMethod: "halfAwayFromZero",
				}),
			).toEqual({ number: 3, unit: "mass", suffix: "g" });
		});
	});
});

describe("convertUnitToBase", () => {
	describe("category bases", () => {
		it("g → kg (mass base)", () => {
			expect(
				convertUnitToBase({ number: 1000, unit: "mass", from: "g" }),
			).toEqual({ number: 1, unit: "mass", suffix: "kg" });
		});

		it("ton → kg", () => {
			expect(
				convertUnitToBase({ number: 2, unit: "mass", from: "ton" }),
			).toEqual({ number: 2000, unit: "mass", suffix: "kg" });
		});

		it("cm² → m² (area base)", () => {
			expect(
				convertUnitToBase({ number: 10000000, unit: "area", from: "cm²" }),
			).toEqual({ number: 10, unit: "area", suffix: "m²" });
		});

		it("mL → L (volume base)", () => {
			expect(
				convertUnitToBase({ number: 5000, unit: "volume", from: "mL" }),
			).toEqual({ number: 5, unit: "volume", suffix: "L" });
		});

		it("KB → B (data base = index 0)", () => {
			expect(
				convertUnitToBase({ number: 5, unit: "data", from: "KB" }),
			).toEqual({ number: 5000, unit: "data", suffix: "B" });
		});

		it("K → '' (count base)", () => {
			expect(
				convertUnitToBase({ number: 5, unit: "count", from: "K" }),
			).toEqual({ number: 5000, unit: "count", suffix: "" });
		});
	});

	describe("identity / negative / zero", () => {
		it("returns input unchanged at base", () => {
			expect(
				convertUnitToBase({ number: 100, unit: "mass", from: "kg" }),
			).toEqual({ number: 100, unit: "mass", suffix: "kg" });
		});

		it("handles negative values", () => {
			expect(
				convertUnitToBase({ number: -5000, unit: "mass", from: "g" }),
			).toEqual({ number: -5, unit: "mass", suffix: "kg" });
		});

		it("handles zero", () => {
			expect(
				convertUnitToBase({ number: 0, unit: "mass", from: "ton" }),
			).toEqual({ number: 0, unit: "mass", suffix: "kg" });
		});
	});

	describe("precision passthrough", () => {
		it("custom precision applies to the result", () => {
			expect(
				convertUnitToBase({
					number: 1234,
					unit: "mass",
					from: "g",
					precision: 1,
				}),
			).toEqual({ number: 1.2, unit: "mass", suffix: "kg" });
		});
	});

	describe("error handling", () => {
		it("throws on invalid unit", () => {
			expect(() =>
				convertUnitToBase({
					number: 1000,
					unit: "invalid" as any,
					from: "kg",
				}),
			).toThrow("Invalid unit: invalid");
		});

		it("throws on invalid from suffix", () => {
			expect(() =>
				convertUnitToBase({
					number: 1000,
					unit: "mass",
					from: "invalid",
				}),
			).toThrow("Invalid from suffix: invalid");
		});
	});

	describe("custom unit map", () => {
		it("works with user-provided unitMap", () => {
			const customUnitMap = {
				weight: { gap: 3, suffices: ["g", "kg", "ton"], baseIndex: 1 },
			};
			expect(
				convertUnitToBase({
					number: 5000,
					unitMap: customUnitMap,
					unit: "weight",
					from: "g",
				}),
			).toEqual({ number: 5, unit: "weight", suffix: "kg" });
		});
	});
});
