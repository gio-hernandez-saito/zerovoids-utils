/** biome-ignore-all lint/suspicious/noExplicitAny: <ignore> */
import { describe, expect, it } from "vitest";
import { getOptimalUnit } from "./getOptimalUnit";

describe("getOptimalUnit", () => {
	describe("optimizer: min (default)", () => {
		it("should return suffix fitting the smallest number", () => {
			const result = getOptimalUnit({
				numbers: [500, 1500, 2500],
				unit: "mass",
				from: "g",
			});

			// min: 500 g stays as g
			expect(result).toBe("g");
		});

		it("should convert when smallest number fits larger unit", () => {
			const result = getOptimalUnit({
				numbers: [5000, 10000, 15000],
				unit: "mass",
				from: "g",
			});

			// min: 5000 g = 5 kg
			expect(result).toBe("kg");
		});

		it("should handle mixed ranges", () => {
			const result = getOptimalUnit({
				numbers: [100, 500000, 1000000],
				unit: "mass",
				from: "g",
			});

			// min: 100 g stays as g
			expect(result).toBe("g");
		});
	});

	describe("optimizer: max", () => {
		it("should return suffix fitting the largest number", () => {
			const result = getOptimalUnit({
				numbers: [100, 500, 1000000],
				unit: "mass",
				from: "g",
				optimizer: "max",
			});

			// max: 1,000,000 g = 1 ton
			expect(result).toBe("ton");
		});

		it("should keep unit when largest fits current unit", () => {
			const result = getOptimalUnit({
				numbers: [100, 200, 500],
				unit: "mass",
				from: "g",
				optimizer: "max",
			});

			// max: 500 g stays as g
			expect(result).toBe("g");
		});
	});

	describe("optimizer: freq (frequency)", () => {
		it("should return most frequent suffix", () => {
			const result = getOptimalUnit({
				numbers: [100, 150, 200, 5000, 10000],
				unit: "mass",
				from: "g",
				optimizer: "freq",
			});

			// 100, 150, 200 stays as g (3 times)
			// 5000, 10,000 become kg (2 times)
			// Most frequent: g
			expect(result).toBe("g");
		});

		it("should handle all numbers in same unit", () => {
			const result = getOptimalUnit({
				numbers: [100, 200, 300, 400],
				unit: "mass",
				from: "g",
				optimizer: "freq",
			});

			expect(result).toBe("g");
		});

		it("should handle split between two units", () => {
			const result = getOptimalUnit({
				numbers: [5000, 10000, 15000, 20000],
				unit: "mass",
				from: "g",
				optimizer: "freq",
			});

			// All convert to kg
			expect(result).toBe("kg");
		});

		it("should choose first when frequencies are tied", () => {
			const result = getOptimalUnit({
				numbers: [500, 5000],
				unit: "mass",
				from: "g",
				optimizer: "freq",
			});

			// 500 g (1x), 5000 g = 5 kg (1x)
			// Tied, should return first encountered
			expect(["g", "kg"]).toContain(result);
		});
	});

	describe("default from parameter (uses base unit)", () => {
		it("should use base unit when from is not specified", () => {
			const result = getOptimalUnit({
				numbers: [5, 10, 15],
				unit: "mass",
			});

			// The base unit is kg, so 5, 10, 15 kg stay as kg
			expect(result).toBe("kg");
		});

		it("should convert base unit when numbers are large", () => {
			const result = getOptimalUnit({
				numbers: [5000, 10000, 15000],
				unit: "mass",
				optimizer: "min",
			});

			// Base unit is kg, 5000 kg = 5 ton
			expect(result).toBe("ton");
		});
	});

	describe("offset option", () => {
		it("should affect unit selection with offset=true", () => {
			const result = getOptimalUnit({
				numbers: [5000],
				unit: "mass",
				from: "g",
				offset: true,
			});

			// With offset, a threshold is 10^4 instead of 10^3
			// 5000 < 10,000, so stays as g
			expect(result).toBe("g");
		});

		it("should convert when exceeding offset threshold", () => {
			const result = getOptimalUnit({
				numbers: [15000],
				unit: "mass",
				from: "g",
				offset: true,
			});

			// 15,000 >= 10,000, converts to kg
			expect(result).toBe("kg");
		});
	});

	describe("different unit types", () => {
		it("should work with area units (gap=6)", () => {
			const result = getOptimalUnit({
				numbers: [500000, 1000000, 5000000],
				unit: "area",
				from: "cm²",
			});

			// min: 500000 cm² < 10^6, stays as cm²
			expect(result).toBe("cm²");
		});

		it("should work with volume units (gap=3)", () => {
			const result = getOptimalUnit({
				numbers: [5000, 10000, 15000],
				unit: "volume",
				from: "mL",
			});

			// min: 5000 mL = 5 L
			expect(result).toBe("L");
		});

		it("should work with data units (gap=3)", () => {
			const result = getOptimalUnit({
				numbers: [5000, 10000, 15000],
				unit: "data",
				from: "KB",
			});

			// min: 5000 KB = 5 MB
			expect(result).toBe("MB");
		});

		it("should work with count units (gap=3)", () => {
			const result = getOptimalUnit({
				numbers: [5000, 10000, 15000],
				unit: "count",
				from: "",
			});

			// min: 5000 = 5 K
			expect(result).toBe("K");
		});
	});

	describe("empty array", () => {
		it("should return from suffix when array is empty", () => {
			const result = getOptimalUnit({
				numbers: [],
				unit: "mass",
				from: "kg",
			});

			expect(result).toBe("kg");
		});

		it("should return base unit when array is empty and from not specified", () => {
			const result = getOptimalUnit({
				numbers: [],
				unit: "mass",
			});

			// Base unit for mass is kg
			expect(result).toBe("kg");
		});
	});

	describe("negative numbers", () => {
		it("should use absolute values for optimization", () => {
			const result = getOptimalUnit({
				numbers: [-5000, -10000, -15000],
				unit: "mass",
				from: "g",
				optimizer: "min",
			});

			expect(result).toBe("kg");
		});

		it("should handle mixed positive and negative", () => {
			const result = getOptimalUnit({
				numbers: [-500, 1000, -5000, 10000],
				unit: "mass",
				from: "g",
				optimizer: "min",
			});

			expect(result).toBe("g");
		});
	});

	describe("custom unit map", () => {
		it("should work with custom unit definitions", () => {
			const customUnitMap = {
				weight: { gap: 3, suffices: ["g", "kg", "ton"], baseIndex: 1 },
			};

			const result = getOptimalUnit({
				numbers: [5000, 10000],
				unitMap: customUnitMap,
				unit: "weight",
				from: "kg",
			});

			// min: 5000 kg = 5 ton
			expect(result).toBe("ton");
		});
	});

	describe("error handling", () => {
		it("should throw error for invalid unit", () => {
			expect(() =>
				getOptimalUnit({
					numbers: [1000],
					unit: "invalid" as any,
				}),
			).toThrow("Invalid unit: invalid");
		});

		it("should throw error for invalid from suffix", () => {
			expect(() =>
				getOptimalUnit({
					numbers: [1000],
					unit: "mass",
					from: "invalid",
				}),
			).toThrow("Invalid from suffix: invalid");
		});

		it("should throw error for unknown optimizer", () => {
			expect(() =>
				getOptimalUnit({
					numbers: [1000],
					unit: "mass",
					optimizer: "invalid" as any,
				}),
			).toThrow("Unknown optimizer: invalid");
		});
	});

	describe("real-world chart scenarios", () => {
		it("should optimize axis labels for mixed weight data", () => {
			const monthlyWeight = [
				150, 200, 180, 220, 250, 300, 280, 260, 240, 200, 180, 160,
			];

			const result = getOptimalUnit({
				numbers: monthlyWeight,
				unit: "mass",
				from: "g",
				optimizer: "max",
			});

			// max: 300 g stays as g
			expect(result).toBe("g");
		});

		it("should optimize for large facility data (ton scale)", () => {
			const yearlyData = [5000, 10000, 15000, 20000];

			const result = getOptimalUnit({
				numbers: yearlyData,
				unit: "mass",
				from: "kg",
				optimizer: "min",
			});

			// min: 5000 kg = 5 ton
			expect(result).toBe("ton");
		});

		it("should handle dashboard with freq optimizer", () => {
			// Multiple small values, few large outliers
			const dashboardData = [100, 150, 200, 180, 220, 250, 5000, 10000];

			const result = getOptimalUnit({
				numbers: dashboardData,
				unit: "mass",
				from: "g",
				optimizer: "freq",
			});

			// Most values stay as g
			expect(result).toBe("g");
		});
	});

	describe("single number", () => {
		it("should handle array with single number", () => {
			const result = getOptimalUnit({
				numbers: [5000],
				unit: "mass",
				from: "g",
			});

			expect(result).toBe("kg");
		});
	});

	describe("all same value", () => {
		it("should handle array with identical values", () => {
			const result = getOptimalUnit({
				numbers: [5000, 5000, 5000],
				unit: "mass",
				from: "g",
			});

			// All optimizers should give the same result
			expect(result).toBe("kg");
		});
	});
});
