/** biome-ignore-all lint/suspicious/noExplicitAny: <ignore> */
import { describe, expect, it } from "vitest";
import { convertUnitToBase } from "./convertUnitToBase";

describe("convertUnitToBase", () => {
	describe("mass to base unit (kg)", () => {
		it("should convert g to base unit kg", () => {
			const result = convertUnitToBase({
				number: 1000,
				unit: "mass",
				from: "g",
			});

			expect(result).toEqual({
				number: 1,
				unit: "mass",
				suffix: "kg",
			});
		});

		it("should convert ton to base unit kg", () => {
			const result = convertUnitToBase({
				number: 2,
				unit: "mass",
				from: "ton",
			});

			expect(result).toEqual({
				number: 2000,
				unit: "mass",
				suffix: "kg",
			});
		});
	});

	describe("area to base unit (m²)", () => {
		it("should convert cm² to base unit m²", () => {
			const result = convertUnitToBase({
				number: 10000000,
				unit: "area",
				from: "cm²",
			});

			expect(result).toEqual({
				number: 10,
				unit: "area",
				suffix: "m²",
			});
		});

		it("should convert km² to base unit m²", () => {
			const result = convertUnitToBase({
				number: 1,
				unit: "area",
				from: "km²",
			});

			expect(result).toEqual({
				number: 1000000,
				unit: "area",
				suffix: "m²",
			});
		});
	});

	describe("volume to base unit (L)", () => {
		it("should convert mL to base unit L", () => {
			const result = convertUnitToBase({
				number: 5000,
				unit: "volume",
				from: "mL",
			});

			expect(result).toEqual({
				number: 5,
				unit: "volume",
				suffix: "L",
			});
		});

		it("should convert kL to base unit L", () => {
			const result = convertUnitToBase({
				number: 2,
				unit: "volume",
				from: "kL",
			});

			expect(result).toEqual({
				number: 2000,
				unit: "volume",
				suffix: "L",
			});
		});
	});

	describe("data to base unit (B)", () => {
		it("should convert KB to base unit B", () => {
			const result = convertUnitToBase({
				number: 5,
				unit: "data",
				from: "KB",
			});

			expect(result).toEqual({
				number: 5000,
				unit: "data",
				suffix: "B",
			});
		});

		it("should convert MB to base unit B", () => {
			const result = convertUnitToBase({
				number: 1,
				unit: "data",
				from: "MB",
			});

			expect(result).toEqual({
				number: 1000000,
				unit: "data",
				suffix: "B",
			});
		});
	});

	describe("count to base unit (no suffix)", () => {
		it("should convert K to base unit", () => {
			const result = convertUnitToBase({
				number: 5,
				unit: "count",
				from: "K",
			});

			expect(result).toEqual({
				number: 5000,
				unit: "count",
				suffix: "",
			});
		});

		it("should convert M to base unit", () => {
			const result = convertUnitToBase({
				number: 2,
				unit: "count",
				from: "M",
			});

			expect(result).toEqual({
				number: 2000000,
				unit: "count",
				suffix: "",
			});
		});
	});

	describe("already at base unit", () => {
		it("should return the same value if already at base unit", () => {
			const result = convertUnitToBase({
				number: 100,
				unit: "mass",
				from: "kg",
			});

			expect(result).toEqual({
				number: 100,
				unit: "mass",
				suffix: "kg",
			});
		});
	});

	describe("custom unit map", () => {
		it("should work with custom unit definitions", () => {
			const customUnitMap = {
				weight: { gap: 3, suffices: ["g", "kg", "ton"], baseIndex: 1 },
			};

			const result = convertUnitToBase({
				number: 5000,
				unitMap: customUnitMap,
				unit: "weight",
				from: "g",
			});

			expect(result).toEqual({
				number: 5,
				unit: "weight",
				suffix: "kg",
			});
		});
	});

	describe("error handling", () => {
		it("should throw error for invalid unit", () => {
			expect(() =>
				convertUnitToBase({
					number: 1000,
					unit: "invalid" as any,
					from: "kg",
				}),
			).toThrow("Invalid unit: invalid");
		});

		it("should throw error for invalid from suffix", () => {
			expect(() =>
				convertUnitToBase({
					number: 1000,
					unit: "mass",
					from: "invalid",
				}),
			).toThrow("Invalid from suffix: invalid");
		});

		it("should throw error if base suffix is undefined", () => {
			const invalidUnitMap = {
				broken: { gap: 3, suffices: [], baseIndex: 0 },
			};

			expect(() =>
				convertUnitToBase({
					number: 1000,
					unitMap: invalidUnitMap,
					unit: "broken",
					from: "",
				}),
			).toThrow("Invalid to suffix: undefined");
		});
	});

	describe("decimal precision", () => {
		it("should handle fractional base conversions", () => {
			const result = convertUnitToBase({
				number: 500,
				unit: "mass",
				from: "g",
			});

			expect(result.number).toBe(0.5);
		});

		it("should handle very small numbers", () => {
			const result = convertUnitToBase({
				number: 1,
				unit: "mass",
				from: "g",
			});

			expect(result.number).toBe(0.001);
		});
	});

	describe("negative numbers", () => {
		it("should handle negative values correctly", () => {
			const result = convertUnitToBase({
				number: -5000,
				unit: "mass",
				from: "g",
			});

			expect(result).toEqual({
				number: -5,
				unit: "mass",
				suffix: "kg",
			});
		});
	});

	describe("zero", () => {
		it("should handle zero values", () => {
			const result = convertUnitToBase({
				number: 0,
				unit: "mass",
				from: "ton",
			});

			expect(result).toEqual({
				number: 0,
				unit: "mass",
				suffix: "kg",
			});
		});
	});

	describe("banker's rounding", () => {
		it("should apply banker's rounding to results", () => {
			const result = convertUnitToBase({
				number: 1002.5,
				unit: "mass",
				from: "g",
			});

			// 1002.5 / 1000 = 1.0025 → rounds to 1
			expect(result.number).toBe(1);
		});
	});
});
