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
				offset: 1,
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
				offset: 1,
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
		it("should preserve from unit for zero values", () => {
			const result = convertUnitToFit({
				number: 0,
				unit: "mass",
				from: "kg",
			});

			// Zero is unitless — keep the caller's chosen unit.
			expect(result).toEqual({
				number: 0,
				unit: "mass",
				suffix: "kg",
			});
		});
	});

	describe("banker's rounding", () => {
		it("should apply banker's rounding to results (default precision=3)", () => {
			const result = convertUnitToFit({
				number: 1002.5,
				unit: "mass",
				from: "g",
			});

			// 1002.5 / 1000 = 1.0025 → bankersRound at precision 3 → 1.002 (even)
			expect(result.number).toBe(1.002);
			expect(result.suffix).toBe("kg");
		});

		it("rounds to integer when precision: 0", () => {
			const result = convertUnitToFit({
				number: 1002.5,
				unit: "mass",
				from: "g",
				precision: 0,
			});

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

	describe("offset (multi-step)", () => {
		it("offset=2 delays promotion by two digits", () => {
			expect(
				convertUnitToFit({
					number: 99999,
					unit: "mass",
					from: "g",
					offset: 2,
				}),
			).toEqual({ number: 99999, unit: "mass", suffix: "g" });
		});

		it("offset=2 promotes once threshold crossed", () => {
			expect(
				convertUnitToFit({
					number: 100000,
					unit: "mass",
					from: "g",
					offset: 2,
				}),
			).toEqual({ number: 100, unit: "mass", suffix: "kg" });
		});
	});

	describe("threshold (explicit)", () => {
		it("threshold supersedes offset", () => {
			expect(
				convertUnitToFit({
					number: 4000,
					unit: "mass",
					from: "g",
					offset: 999,
					threshold: 5000,
				}),
			).toEqual({ number: 4000, unit: "mass", suffix: "g" });
		});

		it("custom threshold triggers promotion", () => {
			expect(
				convertUnitToFit({
					number: 6000,
					unit: "mass",
					from: "g",
					threshold: 5000,
				}),
			).toEqual({ number: 6, unit: "mass", suffix: "kg" });
		});
	});

	describe("precision option", () => {
		it("default precision=3 preserves fractional detail", () => {
			expect(
				convertUnitToFit({ number: 1048576, unit: "data", from: "B" }),
			).toEqual({ number: 1.049, unit: "data", suffix: "MB" });
		});

		it("precision=1 collapses fractional detail", () => {
			expect(
				convertUnitToFit({
					number: 1048576,
					unit: "data",
					from: "B",
					precision: 1,
				}),
			).toEqual({ number: 1, unit: "data", suffix: "MB" });
		});

		it("precision=6 preserves full detail", () => {
			expect(
				convertUnitToFit({
					number: 1048576,
					unit: "data",
					from: "B",
					precision: 6,
				}),
			).toEqual({ number: 1.048576, unit: "data", suffix: "MB" });
		});
	});

	describe("saturated hint", () => {
		it("sets saturated: 'max' when value exceeds the largest suffix", () => {
			const result = convertUnitToFit({
				number: 9e15,
				unit: "mass",
				from: "g",
			});
			expect(result.suffix).toBe("ton");
			expect(result.saturated).toBe("max");
		});

		it("sets saturated: 'min' when value stays below 1 even at smallest suffix", () => {
			const result = convertUnitToFit({
				number: 1e-9,
				unit: "mass",
				from: "kg",
			});
			expect(result.suffix).toBe("g");
			expect(result.saturated).toBe("min");
		});

		it("does not set saturated when the value lands in range naturally", () => {
			const result = convertUnitToFit({
				number: 500,
				unit: "mass",
				from: "g",
			});
			expect(result.saturated).toBeUndefined();
		});

		it("does not set saturated when the value lands exactly at last-step", () => {
			// 5 ton lands naturally at ton (no further suffix to try).
			const result = convertUnitToFit({
				number: 5_000_000,
				unit: "mass",
				from: "g",
			});
			expect(result).toEqual({
				number: 5,
				unit: "mass",
				suffix: "ton",
			});
		});
	});

	describe("roundMethod option", () => {
		it("defaults to bankersRound", () => {
			// 2.5 kg → precision 0 → 2 (even)
			expect(
				convertUnitToFit({
					number: 2.5,
					unit: "mass",
					from: "kg",
					precision: 0,
				}),
			).toEqual({ number: 2, unit: "mass", suffix: "kg" });
		});

		it("switches to halfAwayFromZero when requested", () => {
			expect(
				convertUnitToFit({
					number: 2.5,
					unit: "mass",
					from: "kg",
					precision: 0,
					roundMethod: "halfAwayFromZero",
				}),
			).toEqual({ number: 3, unit: "mass", suffix: "kg" });
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
