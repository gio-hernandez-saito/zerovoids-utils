/** biome-ignore-all lint/suspicious/noApproximativeNumericConstant: <ignore> */
/** biome-ignore-all lint/suspicious/noExplicitAny: <ignore> */
import { describe, expect, it } from "vitest";
import {
	bankersRound,
	getSignificantDigitIndex,
	halfAwayFromZero,
} from "./round";

describe("halfAwayFromZero", () => {
	describe("basic rounding with precision: 0 (integer)", () => {
		it("should round away from zero when fractional part is 0.5", () => {
			expect(halfAwayFromZero(2.5, { precision: 0 })).toBe(3);
			expect(halfAwayFromZero(3.5, { precision: 0 })).toBe(4);
			expect(halfAwayFromZero(4.5, { precision: 0 })).toBe(5);
		});

		it("should round down when fractional part is less than 0.5", () => {
			expect(halfAwayFromZero(2.4, { precision: 0 })).toBe(2);
			expect(halfAwayFromZero(2.49, { precision: 0 })).toBe(2);
		});

		it("should round up when fractional part is greater than 0.5", () => {
			expect(halfAwayFromZero(2.51, { precision: 0 })).toBe(3);
			expect(halfAwayFromZero(2.6, { precision: 0 })).toBe(3);
		});
	});

	describe("rounding with precision: 1 (one decimal)", () => {
		it("should round halfway values away from zero", () => {
			expect(halfAwayFromZero(2.55, { precision: 1 })).toBe(2.6);
			expect(halfAwayFromZero(2.45, { precision: 1 })).toBe(2.5);
			expect(halfAwayFromZero(2.65, { precision: 1 })).toBe(2.7);
		});

		it("should round non-halfway values normally", () => {
			expect(halfAwayFromZero(2.54, { precision: 1 })).toBe(2.5);
			expect(halfAwayFromZero(2.56, { precision: 1 })).toBe(2.6);
		});
	});

	describe("rounding with precision: 2 (two decimals)", () => {
		it("should respect custom precision", () => {
			expect(halfAwayFromZero(2.567, { precision: 2 })).toBe(2.57);
			expect(halfAwayFromZero(2.564, { precision: 2 })).toBe(2.56);
			expect(halfAwayFromZero(2.565, { precision: 2 })).toBe(2.57);
		});

		it("should handle halfway values at precision 2", () => {
			expect(halfAwayFromZero(2.125, { precision: 2 })).toBe(2.13);
			expect(halfAwayFromZero(2.135, { precision: 2 })).toBe(2.14);
			expect(halfAwayFromZero(2.145, { precision: 2 })).toBe(2.15);
		});
	});

	describe("high precision", () => {
		it("should handle high precision values", () => {
			expect(halfAwayFromZero(3.14159, { precision: 4 })).toBe(3.1416);
			expect(halfAwayFromZero(3.14155, { precision: 4 })).toBe(3.1416);
			expect(halfAwayFromZero(3.14154, { precision: 4 })).toBe(3.1415);
		});
	});

	describe("default precision (1)", () => {
		it("should use precision: 1 by default", () => {
			expect(halfAwayFromZero(2.55)).toBe(2.6);
			expect(halfAwayFromZero(2.45)).toBe(2.5);
			expect(halfAwayFromZero(2.5)).toBe(2.5);
		});

		it("should accept empty options object", () => {
			expect(halfAwayFromZero(2.55, {})).toBe(2.6);
		});
	});

	describe("negative numbers (away from zero = more negative)", () => {
		it("should round away from zero for negative numbers (precision: 0)", () => {
			expect(halfAwayFromZero(-2.5, { precision: 0 })).toBe(-3);
			expect(halfAwayFromZero(-2.4, { precision: 0 })).toBe(-2);
			expect(halfAwayFromZero(-2.6, { precision: 0 })).toBe(-3);
			expect(halfAwayFromZero(-3.5, { precision: 0 })).toBe(-4);
		});

		it("should round away from zero for negative numbers (precision: 1)", () => {
			expect(halfAwayFromZero(-2.55, { precision: 1 })).toBe(-2.6);
			expect(halfAwayFromZero(-2.45, { precision: 1 })).toBe(-2.5);
		});
	});

	describe("edge cases", () => {
		it("should handle zero", () => {
			expect(halfAwayFromZero(0)).toBe(0);
			expect(halfAwayFromZero(-0)).toBe(0);
		});

		it("should handle very small numbers", () => {
			expect(halfAwayFromZero(0.001, { precision: 2 })).toBe(0);
			expect(halfAwayFromZero(0.005, { precision: 2 })).toBe(0.01);
			expect(halfAwayFromZero(0.004, { precision: 2 })).toBe(0);
		});

		it("should handle very large numbers", () => {
			expect(halfAwayFromZero(123456789.5, { precision: 0 })).toBe(123456790);
		});

		it("should handle integers (no rounding needed)", () => {
			expect(halfAwayFromZero(5, { precision: 1 })).toBe(5);
			expect(halfAwayFromZero(100, { precision: 2 })).toBe(100);
		});
	});

	describe("string inputs", () => {
		it("should accept numeric strings", () => {
			expect(halfAwayFromZero("2.55", { precision: 1 })).toBe(2.6);
			expect(halfAwayFromZero("3.14159", { precision: 2 })).toBe(3.14);
		});
	});

	describe("error handling", () => {
		it("should throw on invalid input", () => {
			expect(() => halfAwayFromZero(null as any)).toThrow();
			expect(() => halfAwayFromZero(undefined as any)).toThrow();
			expect(() => halfAwayFromZero("abc" as any)).toThrow("NaN");
			expect(() => halfAwayFromZero(true as any)).toThrow();
			expect(() => halfAwayFromZero({} as any)).toThrow();
		});
	});

	describe("floating-point precision", () => {
		it("should handle floating-point precision issues", () => {
			expect(halfAwayFromZero(0.1 + 0.2, { precision: 1 })).toBe(0.3);
			expect(halfAwayFromZero(0.1 + 0.2, { precision: 2 })).toBe(0.3);
		});

		it("should handle near-half edge values", () => {
			expect(halfAwayFromZero(2.5000000000000004, { precision: 0 })).toBe(3);
		});
	});

	describe("comparison with Math.round()", () => {
		it("should differ from Math.round() for negative halfway values", () => {
			expect(Math.round(-2.5)).toBe(-2);
			expect(Math.round(-3.5)).toBe(-3);
			expect(halfAwayFromZero(-2.5, { precision: 0 })).toBe(-3);
			expect(halfAwayFromZero(-3.5, { precision: 0 })).toBe(-4);
		});

		it("should match Math.round() for positive halfway values", () => {
			expect(Math.round(2.5)).toBe(3);
			expect(halfAwayFromZero(2.5, { precision: 0 })).toBe(3);
			expect(Math.round(3.5)).toBe(4);
			expect(halfAwayFromZero(3.5, { precision: 0 })).toBe(4);
		});
	});

	describe("symmetric behavior", () => {
		it("should be symmetric for positive and negative values", () => {
			const testValues = [2.5, 3.5, 4.5, 2.55, 2.65];
			for (const val of testValues) {
				const positive = halfAwayFromZero(val, { precision: 1 });
				const negative = halfAwayFromZero(-val, { precision: 1 });
				expect(negative).toBe(-positive);
			}
		});
	});
});

describe("bankersRound", () => {
	describe("banker's rounding with precision: 0 (integer)", () => {
		it("should round 2.5 to 2 (even)", () => {
			expect(bankersRound(2.5, { precision: 0 })).toBe(2);
		});
		it("should round 3.5 to 4 (even)", () => {
			expect(bankersRound(3.5, { precision: 0 })).toBe(4);
		});
		it("should round 4.5 to 4 (even)", () => {
			expect(bankersRound(4.5, { precision: 0 })).toBe(4);
		});
		it("should round 5.5 to 6 (even)", () => {
			expect(bankersRound(5.5, { precision: 0 })).toBe(6);
		});
	});

	describe("banker's rounding with precision: 1 (one decimal)", () => {
		it("should round 2.55 to 2.6 (even)", () => {
			expect(bankersRound(2.55, { precision: 1 })).toBe(2.6);
		});
		it("should round 2.45 to 2.4 (even)", () => {
			expect(bankersRound(2.45, { precision: 1 })).toBe(2.4);
		});
		it("should round 2.65 to 2.6 (even)", () => {
			expect(bankersRound(2.65, { precision: 1 })).toBe(2.6);
		});
		it("should round 2.75 to 2.8 (even)", () => {
			expect(bankersRound(2.75, { precision: 1 })).toBe(2.8);
		});
	});

	describe("banker's rounding with precision: 2 (two decimals)", () => {
		it("should round 2.125 to 2.12 (even)", () => {
			expect(bankersRound(2.125, { precision: 2 })).toBe(2.12);
		});
		it("should round 2.135 to 2.14 (even)", () => {
			expect(bankersRound(2.135, { precision: 2 })).toBe(2.14);
		});
		it("should round 2.145 to 2.14 (even)", () => {
			expect(bankersRound(2.145, { precision: 2 })).toBe(2.14);
		});
		it("should round 2.155 to 2.16 (even)", () => {
			expect(bankersRound(2.155, { precision: 2 })).toBe(2.16);
		});
		it("should round 2.525 to 2.52 (even)", () => {
			expect(bankersRound(2.525, { precision: 2 })).toBe(2.52);
		});
		it("should round 2.535 to 2.54 (even)", () => {
			expect(bankersRound(2.535, { precision: 2 })).toBe(2.54);
		});
	});

	describe("non-halfway values", () => {
		it("should round normally when not exactly halfway", () => {
			expect(bankersRound(2.51, { precision: 1 })).toBe(2.5);
			expect(bankersRound(2.56, { precision: 1 })).toBe(2.6);
			expect(bankersRound(3.64, { precision: 1 })).toBe(3.6);
			expect(bankersRound(3.66, { precision: 1 })).toBe(3.7);
		});
	});

	describe("default precision (1)", () => {
		it("should use precision: 1 by default", () => {
			expect(bankersRound(2.55)).toBe(2.6);
			expect(bankersRound(2.45)).toBe(2.4);
		});

		it("should accept empty options object", () => {
			expect(bankersRound(2.55, {})).toBe(2.6);
		});
	});

	describe("respects caller precision for small numbers (no auto-promote)", () => {
		// v2.0: auto-precision-promotion for |v| < 1 was removed.
		// Adaptive behavior now lives in formatNumber(mode: "adaptive").
		it("does not silently widen precision when |v| < 1", () => {
			expect(bankersRound(0.00125, { precision: 1 })).toBe(0);
			expect(bankersRound(0.00155, { precision: 1 })).toBe(0);
			expect(bankersRound(0.5, { precision: 0 })).toBe(0);
			expect(bankersRound(-0.5, { precision: 0 })).toBe(0);
		});

		it("still rounds to exact precision when caller supplies enough digits", () => {
			expect(bankersRound(0.00125, { precision: 3 })).toBe(0.001);
			expect(bankersRound(0.00155, { precision: 3 })).toBe(0.002);
			expect(bankersRound(0.0015, { precision: 3 })).toBe(0.002);
			expect(bankersRound(0.0025, { precision: 3 })).toBe(0.002);
			expect(bankersRound(0.0035, { precision: 3 })).toBe(0.004);
		});

		it("keeps specified precision when higher than significant index", () => {
			expect(bankersRound(0.5, { precision: 4 })).toBe(0.5);
		});
	});

	describe("negative numbers", () => {
		it("should apply banker's rounding to negative numbers (precision: 0)", () => {
			expect(bankersRound(-2.5, { precision: 0 })).toBe(-2);
			expect(bankersRound(-3.5, { precision: 0 })).toBe(-4);
			expect(bankersRound(-4.5, { precision: 0 })).toBe(-4);
		});

		it("should apply banker's rounding to negative numbers (precision: 1)", () => {
			expect(bankersRound(-2.55, { precision: 1 })).toBe(-2.6);
			expect(bankersRound(-2.45, { precision: 1 })).toBe(-2.4);
		});
	});

	describe("edge cases", () => {
		it("should handle zero", () => {
			expect(bankersRound(0)).toBe(0);
			expect(bankersRound(-0)).toBe(0);
			expect(bankersRound(0, { precision: 5 })).toBe(0);
		});

		it("should handle very large numbers", () => {
			expect(bankersRound(123456789.5, { precision: 0 })).toBe(123456790);
		});

		it("should handle integers (no rounding needed)", () => {
			expect(bankersRound(5, { precision: 1 })).toBe(5);
			expect(bankersRound(100, { precision: 2 })).toBe(100);
		});
	});

	describe("string inputs", () => {
		it("should accept numeric strings", () => {
			expect(bankersRound("2.55", { precision: 1 })).toBe(2.6);
			expect(bankersRound("2.45", { precision: 1 })).toBe(2.4);
			expect(bankersRound("2.5", { precision: 0 })).toBe(2);
		});
	});

	describe("error handling", () => {
		it("should throw on invalid input", () => {
			expect(() => bankersRound(null as any)).toThrow();
			expect(() => bankersRound(undefined as any)).toThrow();
			expect(() => bankersRound("abc" as any)).toThrow("NaN");
			expect(() => bankersRound({} as any)).toThrow();
		});
	});

	describe("cumulative bias reduction", () => {
		it("should reduce cumulative error in repeated rounding (precision: 0)", () => {
			const values = [2.5, 3.5, 4.5, 5.5, 6.5];
			const sum = values.reduce(
				(s, v) => s + bankersRound(v, { precision: 0 }),
				0,
			);
			expect(sum).toBe(22);
		});

		it("should reduce cumulative error in financial calculations", () => {
			const amounts = [10.125, 20.125, 30.125, 40.125, 50.125];
			const sum = amounts.reduce(
				(s, v) => s + bankersRound(v, { precision: 2 }),
				0,
			);
			expect(sum).toBe(150.6);
		});
	});

	describe("systematic halfway rounding patterns", () => {
		it("halfway values round to even (precision: 0)", () => {
			expect(bankersRound(1.5, { precision: 0 })).toBe(2);
			expect(bankersRound(2.5, { precision: 0 })).toBe(2);
			expect(bankersRound(3.5, { precision: 0 })).toBe(4);
			expect(bankersRound(4.5, { precision: 0 })).toBe(4);
			expect(bankersRound(5.5, { precision: 0 })).toBe(6);
			expect(bankersRound(6.5, { precision: 0 })).toBe(6);
		});

		it("halfway values round to even (precision: 1)", () => {
			expect(bankersRound(1.05, { precision: 1 })).toBe(1.0);
			expect(bankersRound(1.15, { precision: 1 })).toBe(1.2);
			expect(bankersRound(1.25, { precision: 1 })).toBe(1.2);
			expect(bankersRound(1.35, { precision: 1 })).toBe(1.4);
			expect(bankersRound(1.45, { precision: 1 })).toBe(1.4);
			expect(bankersRound(1.55, { precision: 1 })).toBe(1.6);
		});
	});
});

describe("getSignificantDigitIndex (internal helper)", () => {
	it("returns positive index for values < 1", () => {
		expect(getSignificantDigitIndex(0.001)).toBe(3);
		expect(getSignificantDigitIndex(0.1)).toBe(1);
		expect(getSignificantDigitIndex(0.01)).toBe(2);
		expect(getSignificantDigitIndex(0.0001)).toBe(4);
	});

	it("returns 0 for values in [1, 10)", () => {
		expect(getSignificantDigitIndex(1)).toBe(0);
		expect(getSignificantDigitIndex(5)).toBe(0);
		expect(getSignificantDigitIndex(9.99)).toBe(0);
	});

	it("returns negative index for values ≥ 10", () => {
		expect(getSignificantDigitIndex(10)).toBe(-1);
		expect(getSignificantDigitIndex(100)).toBe(-2);
		expect(getSignificantDigitIndex(1000)).toBe(-3);
	});

	it("normalizes -0 to 0", () => {
		expect(Object.is(getSignificantDigitIndex(1), 0)).toBe(true);
	});

	it("handles non-1 leading digits", () => {
		expect(getSignificantDigitIndex(0.002)).toBe(3);
		expect(getSignificantDigitIndex(0.9)).toBe(1);
		expect(getSignificantDigitIndex(0.00125)).toBe(3);
	});
});
