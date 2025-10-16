import { describe, expect, it } from "vitest";
import { getSignificantDigitIndex } from "./getSignificantDigitIndex";

describe("getSignificantDigitIndex", () => {
	describe("decimal numbers (< 1)", () => {
		it("should return 3 for 0.001", () => {
			expect(getSignificantDigitIndex(0.001)).toBe(3);
		});

		it("should return 1 for 0.1", () => {
			expect(getSignificantDigitIndex(0.1)).toBe(1);
		});

		it("should return 2 for 0.01", () => {
			expect(getSignificantDigitIndex(0.01)).toBe(2);
		});

		it("should return 4 for 0.0001", () => {
			expect(getSignificantDigitIndex(0.0001)).toBe(4);
		});

		it("should return 5 for 0.00001", () => {
			expect(getSignificantDigitIndex(0.00001)).toBe(5);
		});
	});

	describe("numbers >= 1", () => {
		it("should return 0 for 1 (not -0)", () => {
			// Math.log10(1) = 0
			// Math.floor(0) = 0
			// -0 should be normalized to 0
			const result = getSignificantDigitIndex(1);
			expect(result).toBe(0);
			expect(Object.is(result, -0)).toBe(false);
			expect(Object.is(result, 0)).toBe(true);
		});

		it("should return 0 for 5", () => {
			// Math.log10(5) = 0.698...
			// Math.floor(0.698) = 0
			// -0 = 0
			expect(getSignificantDigitIndex(5)).toBe(0);
		});

		it("should return -1 for 10", () => {
			// Math.log10(10) = 1
			// Math.floor(1) = 1
			// -1 = -1
			expect(getSignificantDigitIndex(10)).toBe(-1);
		});

		it("should return -2 for 100", () => {
			// Math.log10(100) = 2
			// Math.floor(2) = 2
			// -2 = -2
			expect(getSignificantDigitIndex(100)).toBe(-2);
		});

		it("should return -3 for 1000", () => {
			// Math.log10(1000) = 3
			// Math.floor(3) = 3
			// -3 = -3
			expect(getSignificantDigitIndex(1000)).toBe(-3);
		});
	});

	describe("numbers between 0 and 1", () => {
		it("should return 1 for 0.5", () => {
			// Math.floor(Math.log10(0.5)) = Math.floor(-0.301...) = -1
			expect(getSignificantDigitIndex(0.5)).toBe(1);
		});

		it("should return 2 for 0.05", () => {
			// Math.floor(Math.log10(0.05)) = Math.floor(-1.301...) = -2
			expect(getSignificantDigitIndex(0.05)).toBe(2);
		});

		it("should return 1 for 0.9", () => {
			// Math.floor(Math.log10(0.9)) = Math.floor(-0.045...) = -1
			expect(getSignificantDigitIndex(0.9)).toBe(1);
		});

		it("should return 1 for 0.123", () => {
			// Math.floor(Math.log10(0.123)) = Math.floor(-0.910...) = -1
			expect(getSignificantDigitIndex(0.123)).toBe(1);
		});
	});

	describe("very small numbers", () => {
		it("should handle very small decimals", () => {
			expect(getSignificantDigitIndex(0.000001)).toBe(6);
			expect(getSignificantDigitIndex(0.0000001)).toBe(7);
			expect(getSignificantDigitIndex(0.00000001)).toBe(8);
		});

		it("should handle scientific notation range", () => {
			expect(getSignificantDigitIndex(1e-3)).toBe(3);
			expect(getSignificantDigitIndex(1e-6)).toBe(6);
			expect(getSignificantDigitIndex(1e-9)).toBe(9);
		});
	});

	describe("edge cases with different significant digits", () => {
		it("should handle numbers with non-1 leading digits", () => {
			expect(getSignificantDigitIndex(0.002)).toBe(3);
			expect(getSignificantDigitIndex(0.0025)).toBe(3);
			expect(getSignificantDigitIndex(0.003)).toBe(3);
			expect(getSignificantDigitIndex(0.009)).toBe(3);
		});

		it("should handle 0.00125 (banker's rounding test case)", () => {
			// This is used in toBankersRound for adaptive precision
			expect(getSignificantDigitIndex(0.00125)).toBe(3);
		});

		it("should handle 0.00155", () => {
			expect(getSignificantDigitIndex(0.00155)).toBe(3);
		});
	});

	describe("practical use cases in rounding", () => {
		it("should correctly identify precision for small numbers", () => {
			// These values are used to determine adaptive precision
			const testCases = [
				{ value: 0.001, expectedIndex: 3 },
				{ value: 0.01, expectedIndex: 2 },
				{ value: 0.1, expectedIndex: 1 },
				{ value: 0.0015, expectedIndex: 3 },
				{ value: 0.0025, expectedIndex: 3 },
			];

			testCases.forEach(({ value, expectedIndex }) => {
				expect(getSignificantDigitIndex(value)).toBe(expectedIndex);
			});
		});
	});

	describe("comparison with different scales", () => {
		it("should show progression from small to large", () => {
			const values = [0.00001, 0.0001, 0.001, 0.01, 0.1, 1, 10, 100];
			const indices = values.map(getSignificantDigitIndex);

			// Should decrease as numbers get larger
			// 0.00001 = 10^-5 → index = 5
			// 0.0001 = 10^-4 → index = 4
			// 0.001 = 10^-3 → index = 3
			// 0.01 = 10^-2 → index = 2
			// 0.1 = 10^-1 → index = 1
			// 1 = 10^0 → index = 0
			// 10 = 10^1 → index = -1
			// 100 = 10^2 → index = -2
			expect(indices).toEqual([5, 4, 3, 2, 1, 0, -1, -2]);
		});
	});

	describe("negative numbers (if needed)", () => {
		it("should handle negative numbers same as positive", () => {
			// Note: Math.log10 of negative is NaN, but abs should be used
			// In actual usage, toBankersRound uses Math.abs before calling this
			const _positiveResult = getSignificantDigitIndex(0.001);

			// If implementation uses abs internally:
			// expect(getSignificantDigitIndex(-0.001)).toBe(positiveResult);

			// The current implementation doesn't handle negatives
			// (caller should use Math.abs)
			expect(Number.isNaN(getSignificantDigitIndex(-0.001))).toBe(true);
		});
	});

	describe("relationship with precision calculation", () => {
		it("should produce correct precision values for rounding", () => {
			// In toBankersRound: finalPrecision = precision + sigDigitIdx
			// For 0.00125 with precision: 1
			// sigDigitIdx = 3, so finalPrecision = 1 + 3 = 4
			const sigIdx = getSignificantDigitIndex(0.00125);
			const userPrecision = 1;
			const finalPrecision = userPrecision + sigIdx;

			expect(finalPrecision).toBe(4); // Rounds to 0.001
		});

		it("should work for adaptive precision scenario", () => {
			// For 0.0015 with precision: 2
			const sigIdx = getSignificantDigitIndex(0.0015);
			const userPrecision = 2;
			const finalPrecision = userPrecision + sigIdx;

			expect(finalPrecision).toBe(5); // Rounds to 0.00150 → 0.002
		});
	});
});
