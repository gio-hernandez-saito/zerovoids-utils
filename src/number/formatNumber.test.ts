import { describe, expect, it } from "vitest";
import { formatNumber } from "./formatNumber";

describe("formatNumber", () => {
	describe("mode: adaptive", () => {
		it("should use significant digits for very small numbers", () => {
			expect(formatNumber(0.0000345, { mode: "adaptive", decimals: 2 })).toBe(
				"0.00003",
			);
			expect(formatNumber(0.0000567, { mode: "adaptive", decimals: 2 })).toBe(
				"0.00006",
			);
			expect(formatNumber(0.00123, { mode: "adaptive", decimals: 2 })).toBe(
				"0.001",
			);
		});

		it("should use specified decimals for numbers >= 1", () => {
			expect(formatNumber(1234.567, { mode: "adaptive", decimals: 2 })).toBe(
				"1,234.57",
			);
			expect(formatNumber(1000, { mode: "adaptive", decimals: 2 })).toBe(
				"1,000.00",
			);
		});

		it("should handle negative small numbers", () => {
			expect(formatNumber(-0.0000345, { mode: "adaptive", decimals: 2 })).toBe(
				"-0.00003",
			);
		});
	});

	describe("mode: fixed", () => {
		it("should always show specified decimal places", () => {
			expect(formatNumber(1234, { mode: "fixed", decimals: 2 })).toBe(
				"1,234.00",
			);
			expect(formatNumber(1234.5, { mode: "fixed", decimals: 2 })).toBe(
				"1,234.50",
			);
			expect(formatNumber(1234.567, { mode: "fixed", decimals: 2 })).toBe(
				"1,234.57",
			);
		});

		it("should work with 0 decimals", () => {
			expect(formatNumber(1234.5, { mode: "fixed", decimals: 0 })).toBe(
				"1,235",
			);
		});

		it("should handle very small numbers with fixed decimals", () => {
			expect(formatNumber(0.0000345, { mode: "fixed", decimals: 2 })).toBe(
				"0.00",
			);
		});
	});

	describe("mode: auto (default)", () => {
		it("should remove decimals for integers", () => {
			expect(formatNumber(1000, { mode: "auto", decimals: 2 })).toBe("1,000");
			expect(formatNumber(1234, { mode: "auto", decimals: 2 })).toBe("1,234");
		});

		it("should show decimals for non-integers", () => {
			expect(formatNumber(1234.5, { mode: "auto", decimals: 2 })).toBe(
				"1,234.50",
			);
			expect(formatNumber(1234.567, { mode: "auto", decimals: 2 })).toBe(
				"1,234.57",
			);
		});

		it("should be the default mode", () => {
			expect(formatNumber(1234.5, { decimals: 2 })).toBe("1,234.50");
			expect(formatNumber(1000, { decimals: 2 })).toBe("1,000");
		});
	});

	describe("mode: raw", () => {
		it("should not round and show number as-is", () => {
			expect(formatNumber(1234.56789, { mode: "raw" })).toBe("1,234.56789");
			expect(formatNumber(0.123456789, { mode: "raw" })).toBe("0.123456789");
		});

		it("should still apply thousand separators", () => {
			expect(formatNumber(1234567.89, { mode: "raw" })).toBe("1,234,567.89");
		});
	});

	describe("roundMethod option", () => {
		it("should use halfAwayFromZero by default", () => {
			expect(formatNumber(2.5, { mode: "fixed", decimals: 0 })).toBe("3");
			expect(formatNumber(-2.5, { mode: "fixed", decimals: 0 })).toBe("-3");
		});

		it("should use bankersRound when specified", () => {
			expect(
				formatNumber(2.5, {
					mode: "fixed",
					decimals: 0,
					roundMethod: "bankersRound",
				}),
			).toBe("2");
			expect(
				formatNumber(3.5, {
					mode: "fixed",
					decimals: 0,
					roundMethod: "bankersRound",
				}),
			).toBe("4");
		});

		it("should work with decimals", () => {
			expect(
				formatNumber(2.125, {
					mode: "fixed",
					decimals: 2,
					roundMethod: "bankersRound",
				}),
			).toBe("2.12");
			expect(
				formatNumber(2.135, {
					mode: "fixed",
					decimals: 2,
					roundMethod: "bankersRound",
				}),
			).toBe("2.14");
		});
	});

	describe("prefix option", () => {
		it("should add string prefix without space", () => {
			expect(formatNumber(1234.5, { decimals: 2, prefix: "$" })).toBe(
				"$1,234.50",
			);
		});

		it("should add prefix with space when configured", () => {
			expect(
				formatNumber(1234.5, {
					decimals: 2,
					prefix: { text: "$", space: true },
				}),
			).toBe("$ 1,234.50");
		});

		it("should work with raw mode", () => {
			expect(formatNumber(1234.56789, { mode: "raw", prefix: "$" })).toBe(
				"$1,234.56789",
			);
		});
	});

	describe("suffix option", () => {
		it("should add string suffix without space", () => {
			expect(formatNumber(1234.5, { decimals: 2, suffix: "kg" })).toBe(
				"1,234.50kg",
			);
		});

		it("should add suffix with space when configured", () => {
			expect(
				formatNumber(1234.5, {
					decimals: 2,
					suffix: { text: "kg", space: true },
				}),
			).toBe("1,234.50 kg");
		});

		it("should work with raw mode", () => {
			expect(formatNumber(1234.56789, { mode: "raw", suffix: "kg" })).toBe(
				"1,234.56789kg",
			);
		});
	});

	describe("combined prefix and suffix", () => {
		it("should work with both string affixes", () => {
			expect(
				formatNumber(1234.5, { decimals: 2, prefix: "$", suffix: " USD" }),
			).toBe("$1,234.50 USD");
		});

		it("should work with both configured affixes", () => {
			expect(
				formatNumber(1234.5, {
					decimals: 2,
					prefix: { text: "$", space: true },
					suffix: { text: "USD", space: true },
				}),
			).toBe("$ 1,234.50 USD");
		});
	});

	describe("edge cases", () => {
		it("should handle zero", () => {
			expect(formatNumber(0, { mode: "fixed", decimals: 2 })).toBe("0.00");
			expect(formatNumber(0, { mode: "auto", decimals: 2 })).toBe("0");
			expect(formatNumber(0, { mode: "adaptive", decimals: 2 })).toBe("0.00");
		});

		it("should handle negative numbers", () => {
			expect(formatNumber(-1234.5, { decimals: 2 })).toBe("-1,234.50");
			expect(formatNumber(-1000, { decimals: 2 })).toBe("-1,000");
		});

		it("should handle very large numbers", () => {
			expect(formatNumber(1234567890.12, { decimals: 2 })).toBe(
				"1,234,567,890.12",
			);
		});
	});

	describe("mode: compact", () => {
		it("abbreviates thousands with an M/K suffix", () => {
			expect(formatNumber(1_234_000, { mode: "compact" })).toBe("1.23M");
			expect(formatNumber(1_500, { mode: "compact", decimals: 1 })).toBe(
				"1.5K",
			);
		});

		it("respects decimals as the maxFractionDigits", () => {
			expect(formatNumber(1_234_000, { mode: "compact", decimals: 0 })).toBe(
				"1M",
			);
		});

		it("handles negatives inline (auto sign)", () => {
			expect(formatNumber(-1_234_000, { mode: "compact" })).toBe("-1.23M");
		});

		it("respects signPosition + prefix", () => {
			expect(
				formatNumber(-1_234_000, {
					mode: "compact",
					prefix: "$",
					signPosition: "before-prefix",
				}),
			).toBe("-$1.23M");
		});
	});

	describe("signPosition", () => {
		it("defaults to 'auto' (prefix before sign)", () => {
			expect(formatNumber(-1234.5, { decimals: 2, prefix: "$" })).toBe(
				"$-1,234.50",
			);
		});

		it("'before-prefix' lifts the minus before the prefix", () => {
			expect(
				formatNumber(-1234.5, {
					decimals: 2,
					prefix: "$",
					signPosition: "before-prefix",
				}),
			).toBe("-$1,234.50");
		});

		it("'before-prefix' is a no-op on positive values", () => {
			expect(
				formatNumber(1234.5, {
					decimals: 2,
					prefix: "$",
					signPosition: "before-prefix",
				}),
			).toBe("$1,234.50");
		});

		it("combines with prefix space", () => {
			expect(
				formatNumber(-1234.5, {
					decimals: 2,
					prefix: { text: "$", space: true },
					signPosition: "before-prefix",
				}),
			).toBe("-$ 1,234.50");
		});
	});

	describe("nonFinite fallback", () => {
		it("returns the literal string for NaN when supplied", () => {
			expect(formatNumber(Number.NaN, { nonFinite: "-" })).toBe("-");
		});

		it("returns the literal string for ±Infinity", () => {
			expect(formatNumber(Number.POSITIVE_INFINITY, { nonFinite: "∞" })).toBe(
				"∞",
			);
			expect(formatNumber(Number.NEGATIVE_INFINITY, { nonFinite: "∞" })).toBe(
				"∞",
			);
		});

		it("accepts a function fallback receiving the raw value", () => {
			expect(
				formatNumber(Number.NEGATIVE_INFINITY, {
					nonFinite: (v) => (v < 0 ? "-∞" : "+∞"),
				}),
			).toBe("-∞");
		});

		it("does not apply prefix/suffix to the fallback", () => {
			expect(
				formatNumber(Number.NaN, { nonFinite: "-", prefix: "$", suffix: "kg" }),
			).toBe("-");
		});

		it("falls back to locale rendering when no nonFinite is given", () => {
			const out = formatNumber(Number.NaN);
			expect(typeof out).toBe("string");
			expect(out.toLowerCase()).toContain("nan");
		});
	});

	describe("adaptive × bankersRound (no longer double-promoted)", () => {
		it("respects formatNumber-level effective decimals without doubled promotion", () => {
			expect(
				formatNumber(0.0000345, {
					mode: "adaptive",
					decimals: 2,
					roundMethod: "bankersRound",
				}),
			).toBe("0.00003");
		});

		it("fixed + bankersRound small number uses caller precision as-is", () => {
			expect(
				formatNumber(0.00125, {
					mode: "fixed",
					decimals: 1,
					roundMethod: "bankersRound",
				}),
			).toBe("0.0");
		});
	});

	describe("real-world use cases", () => {
		it("should format chart axis labels (adaptive mode)", () => {
			const values = [0.0000345, 0.5, 1000, 123456.789];
			const formatted = values.map((v) =>
				formatNumber(v, { mode: "adaptive", decimals: 1 }),
			);

			expect(formatted).toEqual(["0.00003", "0.5", "1,000.0", "123,456.8"]);
		});

		it("should format financial data (fixed mode)", () => {
			const prices = [1234, 1234.5, 1234.567];
			const formatted = prices.map((p) =>
				formatNumber(p, {
					mode: "fixed",
					decimals: 2,
					prefix: { text: "$", space: false },
				}),
			);

			expect(formatted).toEqual(["$1,234.00", "$1,234.50", "$1,234.57"]);
		});

		it("should format statistical summaries (auto mode)", () => {
			const stats = [1000, 1234.5, 567.89];
			const formatted = stats.map((s) =>
				formatNumber(s, { mode: "auto", decimals: 2 }),
			);

			expect(formatted).toEqual(["1,000", "1,234.50", "567.89"]);
		});
	});
});
