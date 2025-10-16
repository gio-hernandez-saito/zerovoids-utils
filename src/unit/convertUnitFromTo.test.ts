import { describe, expect, it } from "vitest";
import { convertUnitFromTo } from "./convertUnitFromTo";

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

		it("should handle very small numbers", () => {
			const result = convertUnitFromTo({
				number: 1,
				unit: "mass",
				from: "g",
				to: "ton",
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
					// biome-ignore lint/suspicious/noExplicitAny: <test any>
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
});
