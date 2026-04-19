---
"@zerovoids/utils": major
---

v2.0.0 — API refresh

### Breaking changes

- **`bankersRound` no longer auto-promotes precision** for `|value| < 1`. The
  caller's `precision` is honored as-is — matching `halfAwayFromZero`. For the
  previous adaptive behavior, use
  `formatNumber(v, { mode: "adaptive", roundMethod: "bankersRound" })`.
- **`BaseUnit`** no longer includes the `"custom"` identity slot. Provide your
  own `UnitMap<U>` when you need it.
- **Root entrypoint is now a flat re-export**. `import { formatNumber } from "@zerovoids/utils"`
  works directly; the `number` / `unit` namespace wrappers at the package root
  are gone (subpath exports `@zerovoids/utils/number` and `@zerovoids/utils/unit`
  are unchanged).
- **`getSignificantDigitIndex`** is no longer a public export — it has become
  an internal helper of `round.ts`.

### Additive changes

- `formatNumber` gains:
  - `mode: "compact"` — delegates to `Intl.NumberFormat({ notation: "compact" })`.
  - `signPosition: "auto" | "before-prefix"` — control minus-sign placement.
  - `nonFinite: string | (value) => string` — graceful fallback for `NaN` / `±Infinity`.
- `convertUnitFromTo`, `convertUnitToBase`, `convertUnitToFit`, `getOptimalUnit`
  now accept `roundMethod?: RoundMethod` (default `"bankersRound"`).
- `convertUnitToFit` returns an optional `saturated: "min" | "max"` when the
  scan reaches the end of the category's suffix list without landing in the
  natural `[1, promotionThreshold)` band.

### File structure

- `getSignificantDigitIndex.ts` merged into `round.ts`.
- README refreshed with current API names and new examples.
