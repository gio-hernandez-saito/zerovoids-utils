/** biome-ignore-all lint/suspicious/noApproximativeNumericConstant: <ignore> */
/** biome-ignore-all lint/suspicious/noExplicitAny: <ignore> */
import { describe, expect, it } from "vitest";
import { roundHalfAwayFromZero } from "./roundHalfAwayFromZero";

describe("roundHalfAwayFromZero", () => {
	describe("basic rounding with precision: 0 (integer)", () => {
		it("should round away from zero when fractional part is 0.5", () => {
			expect(roundHalfAwayFromZero(2.5, { precision: 0 })).toBe(3);
			expect(roundHalfAwayFromZero(3.5, { precision: 0 })).toBe(4);
			expect(roundHalfAwayFromZero(4.5, { precision: 0 })).toBe(5);
		});

		it("should round down when fractional part is less than 0.5", () => {
			expect(roundHalfAwayFromZero(2.4, { precision: 0 })).toBe(2);
			expect(roundHalfAwayFromZero(2.49, { precision: 0 })).toBe(2);
		});

		it("should round up when fractional part is greater than 0.5", () => {
			expect(roundHalfAwayFromZero(2.51, { precision: 0 })).toBe(3);
			expect(roundHalfAwayFromZero(2.6, { precision: 0 })).toBe(3);
		});
	});

	describe("rounding with precision: 1 (one decimal)", () => {
		it("should round halfway values away from zero", () => {
			expect(roundHalfAwayFromZero(2.55, { precision: 1 })).toBe(2.6);
			expect(roundHalfAwayFromZero(2.45, { precision: 1 })).toBe(2.5);
			expect(roundHalfAwayFromZero(2.65, { precision: 1 })).toBe(2.7);
		});

		it("should round non-halfway values normally", () => {
			expect(roundHalfAwayFromZero(2.54, { precision: 1 })).toBe(2.5);
			expect(roundHalfAwayFromZero(2.56, { precision: 1 })).toBe(2.6);
		});
	});

	describe("rounding with precision: 2 (two decimals)", () => {
		it("should respect custom precision", () => {
			expect(roundHalfAwayFromZero(2.567, { precision: 2 })).toBe(2.57);
			expect(roundHalfAwayFromZero(2.564, { precision: 2 })).toBe(2.56);
			expect(roundHalfAwayFromZero(2.565, { precision: 2 })).toBe(2.57);
		});

		it("should handle halfway values at precision 2", () => {
			expect(roundHalfAwayFromZero(2.125, { precision: 2 })).toBe(2.13);
			expect(roundHalfAwayFromZero(2.135, { precision: 2 })).toBe(2.14);
			expect(roundHalfAwayFromZero(2.145, { precision: 2 })).toBe(2.15);
		});
	});

	describe("high precision", () => {
		it("should handle high precision values", () => {
			expect(roundHalfAwayFromZero(3.14159, { precision: 4 })).toBe(3.1416);
			expect(roundHalfAwayFromZero(3.14155, { precision: 4 })).toBe(3.1416);
			expect(roundHalfAwayFromZero(3.14154, { precision: 4 })).toBe(3.1415);
		});
	});

	describe("default precision (1)", () => {
		it("should use precision: 1 by default", () => {
			expect(roundHalfAwayFromZero(2.55)).toBe(2.6);
			expect(roundHalfAwayFromZero(2.45)).toBe(2.5);
			expect(roundHalfAwayFromZero(2.5)).toBe(2.5);
		});
	});

	describe("negative numbers (away from zero = more negative)", () => {
		it("should round away from zero for negative numbers (precision: 0)", () => {
			expect(roundHalfAwayFromZero(-2.5, { precision: 0 })).toBe(-3);
			expect(roundHalfAwayFromZero(-2.4, { precision: 0 })).toBe(-2);
			expect(roundHalfAwayFromZero(-2.6, { precision: 0 })).toBe(-3);
			expect(roundHalfAwayFromZero(-3.5, { precision: 0 })).toBe(-4);
		});

		it("should round away from zero for negative numbers (precision: 1)", () => {
			expect(roundHalfAwayFromZero(-2.55, { precision: 1 })).toBe(-2.6);
			expect(roundHalfAwayFromZero(-2.45, { precision: 1 })).toBe(-2.5);
		});
	});

	describe("edge cases", () => {
		it("should handle zero", () => {
			expect(roundHalfAwayFromZero(0)).toBe(0);
			expect(roundHalfAwayFromZero(-0)).toBe(0);
		});

		it("should handle very small numbers", () => {
			expect(roundHalfAwayFromZero(0.001, { precision: 2 })).toBe(0);
			expect(roundHalfAwayFromZero(0.005, { precision: 2 })).toBe(0.01);
			expect(roundHalfAwayFromZero(0.004, { precision: 2 })).toBe(0);
		});

		it("should handle very large numbers", () => {
			expect(roundHalfAwayFromZero(123456789.5, { precision: 0 })).toBe(
				123456790,
			);
		});

		it("should handle integers (no rounding needed)", () => {
			expect(roundHalfAwayFromZero(5, { precision: 1 })).toBe(5);
			expect(roundHalfAwayFromZero(100, { precision: 2 })).toBe(100);
		});
	});

	describe("string inputs", () => {
		it("should accept numeric strings", () => {
			expect(roundHalfAwayFromZero("2.55", { precision: 1 })).toBe(2.6);
			expect(roundHalfAwayFromZero("3.14159", { precision: 2 })).toBe(3.14);
		});
	});

	describe("error handling", () => {
		it("should throw on invalid input", () => {
			expect(() => roundHalfAwayFromZero(null as any)).toThrow();
			expect(() => roundHalfAwayFromZero(undefined as any)).toThrow();
			expect(() => roundHalfAwayFromZero("abc" as any)).toThrow("NaN");
		});
	});

	describe("floating-point precision", () => {
		it("should handle floating-point precision issues", () => {
			// Common floating-point issue: 0.1 + 0.2 = 0.30000000000000004
			expect(roundHalfAwayFromZero(0.1 + 0.2, { precision: 1 })).toBe(0.3);
			expect(roundHalfAwayFromZero(0.1 + 0.2, { precision: 2 })).toBe(0.3);
		});

		it("should use Number.EPSILON to handle edge cases", () => {
			// This tests that Number.EPSILON is working correctly
			expect(roundHalfAwayFromZero(2.5000000000000004, { precision: 0 })).toBe(
				3,
			);
		});
	});

	describe("comparison with Math.round()", () => {
		it("should differ from Math.round() for negative halfway values", () => {
			// Math.round: toward positive infinity
			expect(Math.round(-2.5)).toBe(-2);
			expect(Math.round(-3.5)).toBe(-3);

			// roundHalfAwayFromZero: away from zero
			expect(roundHalfAwayFromZero(-2.5, { precision: 0 })).toBe(-3);
			expect(roundHalfAwayFromZero(-3.5, { precision: 0 })).toBe(-4);
		});

		it("should match Math.round() for positive halfway values", () => {
			expect(Math.round(2.5)).toBe(3);
			expect(roundHalfAwayFromZero(2.5, { precision: 0 })).toBe(3);

			expect(Math.round(3.5)).toBe(4);
			expect(roundHalfAwayFromZero(3.5, { precision: 0 })).toBe(4);
		});
	});

	describe("comparison with toBankersRound", () => {
		it("should always round away from zero (unlike banker's rounding)", () => {
			// roundHalfAwayFromZero: always away from zero
			expect(roundHalfAwayFromZero(2.5, { precision: 0 })).toBe(3);
			expect(roundHalfAwayFromZero(3.5, { precision: 0 })).toBe(4);
			expect(roundHalfAwayFromZero(4.5, { precision: 0 })).toBe(5);

			// toBankersRound would give: 2, 4, 4 (round to even)
		});
	});

	describe("symmetric behavior", () => {
		it("should be symmetric for positive and negative values", () => {
			const testValues = [2.5, 3.5, 4.5, 2.55, 2.65];

			for (const val of testValues) {
				const positiveResult = roundHalfAwayFromZero(val, { precision: 1 });
				const negativeResult = roundHalfAwayFromZero(-val, { precision: 1 });

				// Should be symmetric
				expect(negativeResult).toBe(-positiveResult);
			}
		});
	});
});
