/** biome-ignore-all lint/suspicious/noExplicitAny: <ignore> */
import { describe, expect, it } from "vitest";
import { toBankersRound } from "./toBankersRound";

describe("toBankersRound", () => {
	describe("banker's rounding with precision: 0 (integer)", () => {
		it("should round 2.5 to 2 (even)", () => {
			expect(toBankersRound(2.5, { precision: 0 })).toBe(2);
		});

		it("should round 3.5 to 4 (even)", () => {
			expect(toBankersRound(3.5, { precision: 0 })).toBe(4);
		});

		it("should round 4.5 to 4 (even)", () => {
			expect(toBankersRound(4.5, { precision: 0 })).toBe(4);
		});

		it("should round 5.5 to 6 (even)", () => {
			expect(toBankersRound(5.5, { precision: 0 })).toBe(6);
		});
	});

	describe("banker's rounding with precision: 1 (one decimal)", () => {
		it("should round 2.55 to 2.6 (even)", () => {
			expect(toBankersRound(2.55, { precision: 1 })).toBe(2.6);
		});

		it("should round 2.45 to 2.4 (even)", () => {
			expect(toBankersRound(2.45, { precision: 1 })).toBe(2.4);
		});

		it("should round 2.65 to 2.6 (even)", () => {
			expect(toBankersRound(2.65, { precision: 1 })).toBe(2.6);
		});

		it("should round 2.75 to 2.8 (even)", () => {
			expect(toBankersRound(2.75, { precision: 1 })).toBe(2.8);
		});
	});

	describe("banker's rounding with precision: 2 (two decimals)", () => {
		it("should round 2.125 to 2.12 (even)", () => {
			expect(toBankersRound(2.125, { precision: 2 })).toBe(2.12);
		});

		it("should round 2.135 to 2.14 (even)", () => {
			expect(toBankersRound(2.135, { precision: 2 })).toBe(2.14);
		});

		it("should round 2.145 to 2.14 (even)", () => {
			expect(toBankersRound(2.145, { precision: 2 })).toBe(2.14);
		});

		it("should round 2.155 to 2.16 (even)", () => {
			expect(toBankersRound(2.155, { precision: 2 })).toBe(2.16);
		});

		it("should round 2.525 to 2.52 (even)", () => {
			expect(toBankersRound(2.525, { precision: 2 })).toBe(2.52);
		});

		it("should round 2.535 to 2.54 (even)", () => {
			expect(toBankersRound(2.535, { precision: 2 })).toBe(2.54);
		});
	});

	describe("non-halfway values", () => {
		it("should round normally when not exactly halfway", () => {
			expect(toBankersRound(2.51, { precision: 1 })).toBe(2.5);
			expect(toBankersRound(2.56, { precision: 1 })).toBe(2.6);
			expect(toBankersRound(3.64, { precision: 1 })).toBe(3.6);
			expect(toBankersRound(3.66, { precision: 1 })).toBe(3.7);
		});
	});

	describe("default precision (1)", () => {
		it("should use precision: 1 by default", () => {
			expect(toBankersRound(2.55)).toBe(2.6);
			expect(toBankersRound(2.45)).toBe(2.4);
		});
	});

	describe("small numbers (|value| < 1)", () => {
		it("should use adaptive precision for small decimals", () => {
			// 0.00125 with precision 1 → uses precision 3 (significant digit)
			expect(toBankersRound(0.00125, { precision: 1 })).toBe(0.001);

			// 0.00155 with precision 1 → rounds to 0.002
			expect(toBankersRound(0.00155, { precision: 1 })).toBe(0.002);
		});

		it("should handle very small numbers correctly", () => {
			expect(toBankersRound(0.0015, { precision: 2 })).toBe(0.002);
			expect(toBankersRound(0.0025, { precision: 2 })).toBe(0.002);
			expect(toBankersRound(0.0035, { precision: 2 })).toBe(0.004);
		});
	});

	describe("negative numbers", () => {
		it("should apply banker's rounding to negative numbers (precision: 0)", () => {
			expect(toBankersRound(-2.5, { precision: 0 })).toBe(-2);
			expect(toBankersRound(-3.5, { precision: 0 })).toBe(-4);
			expect(toBankersRound(-4.5, { precision: 0 })).toBe(-4);
		});

		it("should apply banker's rounding to negative numbers (precision: 1)", () => {
			expect(toBankersRound(-2.55, { precision: 1 })).toBe(-2.6);
			expect(toBankersRound(-2.45, { precision: 1 })).toBe(-2.4);
		});

		it("should handle negative small numbers", () => {
			expect(toBankersRound(-0.00125, { precision: 1 })).toBe(-0.001);
			expect(toBankersRound(-0.00155, { precision: 1 })).toBe(-0.002);
		});
	});

	describe("edge cases", () => {
		it("should handle zero", () => {
			expect(toBankersRound(0)).toBe(0);
			expect(toBankersRound(-0)).toBe(0);
		});

		it("should handle very large numbers", () => {
			expect(toBankersRound(123456789.5, { precision: 0 })).toBe(123456790);
		});

		it("should handle integers (no rounding needed)", () => {
			expect(toBankersRound(5, { precision: 1 })).toBe(5);
			expect(toBankersRound(100, { precision: 2 })).toBe(100);
		});
	});

	describe("string inputs", () => {
		it("should accept numeric strings", () => {
			expect(toBankersRound("2.55", { precision: 1 })).toBe(2.6);
			expect(toBankersRound("2.45", { precision: 1 })).toBe(2.4);
		});
	});

	describe("error handling", () => {
		it("should throw on invalid input", () => {
			expect(() => toBankersRound(null as any)).toThrow();
			expect(() => toBankersRound(undefined as any)).toThrow();
			expect(() => toBankersRound("abc" as any)).toThrow("NaN");
		});
	});

	describe("cumulative bias reduction", () => {
		it("should reduce cumulative error in repeated rounding (precision: 0)", () => {
			const values = [2.5, 3.5, 4.5, 5.5, 6.5];
			const bankerSum = values.reduce(
				(sum, val) => sum + toBankersRound(val, { precision: 0 }),
				0,
			);

			// Banker's rounding: 2 + 4 + 4 + 6 + 6 = 22
			expect(bankerSum).toBe(22);

			// Compare with always rounding up: 3 + 4 + 5 + 6 + 7 = 25
			// Bankers rounding reduces cumulative bias
		});

		it("should reduce cumulative error in financial calculations", () => {
			const amounts = [10.125, 20.125, 30.125, 40.125, 50.125];
			const bankerSum = amounts.reduce(
				(sum, val) => sum + toBankersRound(val, { precision: 2 }),
				0,
			);

			// Banker's: 10.12 + 20.12 + 30.12 + 40.12 + 50.12 = 150.60
			expect(bankerSum).toBe(150.6);
		});
	});

	describe("systematic halfway rounding patterns", () => {
		it("halfway values round to even (precision: 0)", () => {
			// All values >= 1 to avoid adaptive precision
			expect(toBankersRound(1.5, { precision: 0 })).toBe(2); // even
			expect(toBankersRound(2.5, { precision: 0 })).toBe(2); // even
			expect(toBankersRound(3.5, { precision: 0 })).toBe(4); // even
			expect(toBankersRound(4.5, { precision: 0 })).toBe(4); // even
			expect(toBankersRound(5.5, { precision: 0 })).toBe(6); // even
			expect(toBankersRound(6.5, { precision: 0 })).toBe(6); // even
		});

		it("halfway values round to even (precision: 1)", () => {
			// Using values >= 1 to avoid adaptive precision
			expect(toBankersRound(1.05, { precision: 1 })).toBe(1.0); // even
			expect(toBankersRound(1.15, { precision: 1 })).toBe(1.2); // even
			expect(toBankersRound(1.25, { precision: 1 })).toBe(1.2); // even
			expect(toBankersRound(1.35, { precision: 1 })).toBe(1.4); // even
			expect(toBankersRound(1.45, { precision: 1 })).toBe(1.4); // even
			expect(toBankersRound(1.55, { precision: 1 })).toBe(1.6); // even
		});
	});
});
