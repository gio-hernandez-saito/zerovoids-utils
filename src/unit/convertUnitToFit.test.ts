import { describe, expect, it } from "vitest";
import { convertUnitToFit } from "./convertUnitToFit";

describe("convertUnitToFit", () => {
	describe("basic fitting - numbers >= 1", () => {
		it("should keep unit when value is in optimal range (1-999)", () => {
			const result = convertUnitToFit({
				number: 500,
				unit: "mass",
				from: "g",
			});

			expect(result).toEqual({
				number: 500,
				unit: "mass",
				suffix: "g",
			});
		});

		it("should convert to larger unit when value is >= 1000", () => {
			const result = convertUnitToFit({
				number: 5000,
				unit: "mass",
				from: "g",
			});

			expect(result).toEqual({
				number: 5,
				unit: "mass",
				suffix: "kg",
			});
		});
	});

	describe("basic fitting - numbers < 1", () => {
		it("should keep unit when value is >= 1", () => {
			const result = convertUnitToFit({
				number: 1,
				unit: "mass",
				from: "kg",
			});

			expect(result).toEqual({
				number: 1,
				unit: "mass",
				suffix: "kg",
			});
		});

		it("should convert to smaller unit when value is < 1", () => {
			const result = convertUnitToFit({
				number: 0.5,
				unit: "mass",
				from: "kg",
			});

			expect(result).toEqual({
				number: 500,
				unit: "mass",
				suffix: "g",
			});
		});
	});

	describe("default from parameter (uses base unit)", () => {
		it("should use base unit when from is not specified", () => {
			const result = convertUnitToFit({
				number: 5000,
				unit: "mass",
			});

			// Base unit is kg, so 5000 kg → 5 ton
			expect(result).toEqual({
				number: 5,
				unit: "mass",
				suffix: "ton",
			});
		});
	});

	describe("offset option", () => {
		it("should use larger threshold range with offset=true (default gap=3)", () => {
			const result = convertUnitToFit({
				number: 5000,
				unit: "mass",
				from: "g",
				offset: true,
			});

			// 5000 is < 10,000, so it stays as g
			expect(result).toEqual({
				number: 5000,
				unit: "mass",
				suffix: "g",
			});
		});

		it("should convert when exceeding offset threshold", () => {
			const result = convertUnitToFit({
				number: 15000,
				unit: "mass",
				from: "g",
				offset: true,
			});

			// 15,000 is >= 10,000, so it converts to kg
			expect(result).toEqual({
				number: 15,
				unit: "mass",
				suffix: "kg",
			});
		});
	});

	describe("area unit (gap=6)", () => {
		it("should fit cm² to m²", () => {
			const result = convertUnitToFit({
				number: 10000000,
				unit: "area",
				from: "cm²",
			});

			// gap=6 means 10^6, so 10,000,000 cm² = 10 m²
			expect(result).toEqual({
				number: 10,
				unit: "area",
				suffix: "m²",
			});
		});

		it("should fit m² to km²", () => {
			const result = convertUnitToFit({
				number: 5000000,
				unit: "area",
				from: "m²",
			});

			// 5,000,000 m² = 5 km²
			expect(result).toEqual({
				number: 5,
				unit: "area",
				suffix: "km²",
			});
		});

		it("should respect larger threshold for gap=6", () => {
			const result = convertUnitToFit({
				number: 500000,
				unit: "area",
				from: "cm²",
			});

			// 500,000 < 1,000,000 (10^6), so stays as cm²
			expect(result).toEqual({
				number: 500000,
				unit: "area",
				suffix: "cm²",
			});
		});
	});

	describe("data unit conversion", () => {
		it("should fit B to KB", () => {
			const result = convertUnitToFit({
				number: 5000,
				unit: "data",
				from: "B",
			});

			expect(result).toEqual({
				number: 5,
				unit: "data",
				suffix: "KB",
			});
		});

		it("should fit MB to GB", () => {
			const result = convertUnitToFit({
				number: 5000,
				unit: "data",
				from: "MB",
			});

			expect(result).toEqual({
				number: 5,
				unit: "data",
				suffix: "GB",
			});
		});
	});

	describe("count unit conversion", () => {
		it("should fit base to K", () => {
			const result = convertUnitToFit({
				number: 5000,
				unit: "count",
				from: "",
			});

			expect(result).toEqual({
				number: 5,
				unit: "count",
				suffix: "K",
			});
		});

		it("should fit K to M", () => {
			const result = convertUnitToFit({
				number: 5000,
				unit: "count",
				from: "K",
			});

			expect(result).toEqual({
				number: 5,
				unit: "count",
				suffix: "M",
			});
		});
	});

	describe("edge cases at boundaries", () => {
		it("should handle exactly 1", () => {
			const result = convertUnitToFit({
				number: 1,
				unit: "mass",
				from: "kg",
			});

			expect(result).toEqual({
				number: 1,
				unit: "mass",
				suffix: "kg",
			});
		});

		it("should handle exactly 1000 (converts to next unit)", () => {
			const result = convertUnitToFit({
				number: 1000,
				unit: "mass",
				from: "kg",
			});

			// 1000 >= 1000, so converts to ton
			expect(result).toEqual({
				number: 1,
				unit: "mass",
				suffix: "ton",
			});
		});

		it("should handle 999 (stays in current unit)", () => {
			const result = convertUnitToFit({
				number: 999,
				unit: "mass",
				from: "kg",
			});

			expect(result).toEqual({
				number: 999,
				unit: "mass",
				suffix: "kg",
			});
		});
	});

	describe("maximum scale reached", () => {
		it("should use largest suffix when value exceeds all ranges", () => {
			const result = convertUnitToFit({
				number: 9999999999,
				unit: "mass",
				from: "kg",
			});

			// Should convert to ton (the largest unit)
			expect(result.suffix).toBe("ton");
			expect(result.number).toBeGreaterThan(1);
		});

		it("should use smallest suffix when value is too small", () => {
			const result = convertUnitToFit({
				number: 0.000000001,
				unit: "mass",
				from: "kg",
			});

			// Should convert to g (the smallest unit)
			expect(result.suffix).toBe("g");
		});
	});

	describe("custom unit map", () => {
		it("should work with custom unit definitions", () => {
			const customUnitMap = {
				weight: { gap: 3, suffices: ["g", "kg", "ton"], baseIndex: 1 },
			};

			const result = convertUnitToFit({
				number: 5000,
				unitMap: customUnitMap,
				unit: "weight",
				from: "kg",
			});

			expect(result).toEqual({
				number: 5,
				unit: "weight",
				suffix: "ton",
			});
		});
	});

	describe("negative numbers", () => {
		it("should handle negative values for upscaling", () => {
			const result = convertUnitToFit({
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

		it("should handle negative values for downscaling", () => {
			const result = convertUnitToFit({
				number: -0.5,
				unit: "mass",
				from: "kg",
			});

			expect(result).toEqual({
				number: -500,
				unit: "mass",
				suffix: "g",
			});
		});
	});

	describe("zero", () => {
		it("should handle zero values", () => {
			const result = convertUnitToFit({
				number: 0,
				unit: "mass",
				from: "kg",
			});

			// Zero stays in the smallest available unit
			expect(result).toEqual({
				number: 0,
				unit: "mass",
				suffix: "g",
			});
		});
	});

	describe("banker's rounding", () => {
		it("should apply banker's rounding to results", () => {
			const result = convertUnitToFit({
				number: 1002.5,
				unit: "mass",
				from: "g",
			});

			// 1002.5 / 1000 = 1.0025 → rounds to 1
			expect(result.number).toBe(1);
			expect(result.suffix).toBe("kg");
		});
	});

	describe("error handling", () => {
		it("should throw error for invalid unit", () => {
			expect(() =>
				convertUnitToFit({
					number: 1000,
					// biome-ignore lint/suspicious/noExplicitAny: <test any>
					unit: "invalid" as any,
				}),
			).toThrow("Invalid unit: invalid");
		});

		it("should throw error for invalid from suffix", () => {
			expect(() =>
				convertUnitToFit({
					number: 1000,
					unit: "mass",
					from: "invalid",
				}),
			).toThrow("Invalid from suffix: invalid");
		});
	});

	describe("real-world scenarios", () => {
		it("should format small weight (200 g)", () => {
			const result = convertUnitToFit({
				number: 200,
				unit: "mass",
				from: "g",
			});

			expect(result).toEqual({
				number: 200,
				unit: "mass",
				suffix: "g",
			});
		});

		it("should format large weight (5,000,000 g)", () => {
			const result = convertUnitToFit({
				number: 5000000,
				unit: "mass",
				from: "g",
			});

			expect(result).toEqual({
				number: 5,
				unit: "mass",
				suffix: "ton",
			});
		});

		it("should format file size (250 KB)", () => {
			const result = convertUnitToFit({
				number: 250,
				unit: "data",
				from: "KB",
			});

			expect(result).toEqual({
				number: 250,
				unit: "data",
				suffix: "KB",
			});
		});

		it("should format large file size (500,000 KB)", () => {
			const result = convertUnitToFit({
				number: 500000,
				unit: "data",
				from: "KB",
			});

			expect(result).toEqual({
				number: 500,
				unit: "data",
				suffix: "MB",
			});
		});
	});
});
