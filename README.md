<div align="center">

# @zerovoids/utils

**Modern utility library for TypeScript**

[![npm version](https://img.shields.io/npm/v/@zerovoids/utils.svg)](https://www.npmjs.com/package/@zerovoids/utils)
[![npm downloads](https://img.shields.io/npm/dm/@zerovoids/utils.svg)](https://www.npmjs.com/package/@zerovoids/utils)
[![codecov](https://codecov.io/gh/gio-hernandez-saito/zerovoids-utils/branch/main/graph/badge.svg)](https://codecov.io/gh/gio-hernandez-saito/zerovoids-utils)
[![license](https://img.shields.io/npm/l/@zerovoids/utils.svg)](https://github.com/gio-hernandez-saito/zerovoids-utils/blob/main/LICENSE)

[Features](#-features) • [Installation](#-installation) • [Modules](#-modules) • [Documentation](#-documentation)

</div>

---

## ✨ Features

- **🎯 Type-Safe** - Full TypeScript support with comprehensive type definitions
- **📦 Tree-Shakable** - Import only what you need, optimized bundle size
- **🔄 Dual Package** - Works seamlessly with both ESM and CommonJS
- **⚡ Zero Dependencies** - Lightweight with no external dependencies
- **✅ Well Tested** - Comprehensive test coverage with Vitest
- **🎨 Modern Codebase** - Built with the latest JavaScript features

---

## 📦 Installation

```bash
# npm
npm install @zerovoids/utils

# pnpm
pnpm add @zerovoids/utils

# yarn
yarn add @zerovoids/utils
```

---

## 📚 Modules

### 📊 Number Utils

Advanced number formatting and precision rounding utilities.

```typescript
import { formatNumber, toBankersRound, roundHalfAwayFromZero } from '@zerovoids/utils/number';

// Adaptive formatting - perfect for charts and visualizations
formatNumber(0.0000345, { mode: 'adaptive', decimals: 2 });
// → "0.00003"

formatNumber(1234.5678, { mode: 'adaptive', decimals: 2 });
// → "1,234.57"

// Fixed decimal places with custom affixes
formatNumber(1234567.89, { 
  mode: 'fixed',
  decimals: 2,
  prefix: { text: '$', space: false },
  suffix: { text: 'USD', space: true }
});
// → "$1,234,567.89 USD"

// Banker's rounding (IEEE 754) - reduces cumulative rounding bias
toBankersRound(2.5, { precision: 0 }); // → 2 (rounds to even)
toBankersRound(3.5, { precision: 0 }); // → 4 (rounds to even)

// Commercial rounding (round half away from zero)
roundHalfAwayFromZero(2.5, { precision: 0 });  // → 3
roundHalfAwayFromZero(-2.5, { precision: 0 }); // → -3
```

**Features:**
- Multiple formatting modes: `adaptive`, `fixed`, `auto`, `raw`
- Precision rounding methods: banker's round, commercial round
- Customizable prefixes and suffixes with spacing control
- Locale-aware number formatting
- Handles edge cases and tiny/large numbers

---

### ⚡ Unit Conversion

Flexible unit conversion utilities optimized for data visualization and dashboards.

```typescript
import { 
  convertUnitFromTo, 
  convertUnitToFit, 
  getOptimalUnit 
} from '@zerovoids/utils/unit';

// Direct unit conversion
convertUnitFromTo({ 
  number: 5000, 
  unit: 'mass', 
  from: 'g', 
  to: 'kg' 
});
// → { number: 5, unit: 'mass', suffix: 'kg' }

// Auto-fit to most appropriate unit
convertUnitToFit({ 
  number: 500, 
  unit: 'mass', 
  from: 'g' 
});
// → { number: 500, unit: 'mass', suffix: 'g' }

convertUnitToFit({ 
  number: 5000, 
  unit: 'mass', 
  from: 'g' 
});
// → { number: 5, unit: 'mass', suffix: 'kg' }

// Find optimal unit for multiple values (perfect for charts)
getOptimalUnit({ 
  numbers: [500, 1500, 2500], 
  unit: 'mass', 
  from: 'g' 
});
// → 'g' (keeps all values in same scale)

getOptimalUnit({ 
  numbers: [5000, 15000, 25000], 
  unit: 'mass', 
  from: 'g' 
});
// → 'kg' (converts for better readability)
```

**Built-in Units:**
- **Mass**: g, kg, ton (gap: 3 → 1000x between units)
- **Area**: cm², m², km² (gap: 6 → 1,000,000x between units)
- **Volume**: mL, L, kL (gap: 3 → 1000x between units)
- **Data**: B, KB, MB, GB, TB, PB (gap: 3 → 1000x between units)
- **Count**: "", K, M, B, T (gap: 3 → 1000x between units, for large numbers like 5K, 2.5M)

**Custom Units:**
```typescript
// Define your own units with custom gap
const customUnitMap = {
  energy: { 
    gap: 3, 
    suffices: ['Wh', 'kWh', 'MWh', 'GWh'], 
    baseIndex: 1 
  },
  temperature: { 
    gap: 3, 
    suffices: ['mK', 'K', 'kK'], 
    baseIndex: 1 
  }
};

convertUnitToFit({ 
  number: 5000, 
  unit: 'energy', 
  from: 'Wh',
  unitMap: customUnitMap
});
// → { number: 5, unit: 'energy', suffix: 'kWh' }
```

**Features:**
- Smart auto-conversion to optimal units
- Consistent unit selection for chart datasets
- Fully customizable unit mappings
- Precision handling with banker's rounding
- Support for various optimization strategies (min, max, freq)

---

## 🎯 Why @zerovoids/utils?

Unlike general-purpose libraries (lodash, ramda), `@zerovoids/utils` provides **specialized utilities that solve specific problems**:

| Problem | Solution |
|---------|----------|
| Chart numbers with varying magnitudes | `formatNumber` with `adaptive` mode |
| Financial calculations with rounding bias | `toBankersRound` (IEEE 754) |
| Dashboard unit consistency | Smart unit conversion with `getOptimalUnit` |
| File size formatting | Built-in data units (B, KB, MB, GB, etc.) |
| Large number abbreviations | Count units (K, M, B, T) |

---

## 🎨 Usage Examples

### Chart Data Formatting

```typescript
import { formatNumber } from '@zerovoids/utils/number';

const chartData = [0.00012, 1.5, 1234.567, 999999];

const formatted = chartData.map(value => 
  formatNumber(value, { mode: 'adaptive', decimals: 2 })
);
// → ["0.00012", "1.5", "1,234.57", "999,999"]
```

### Weight Dashboard

```typescript
import { convertUnitToFit, getOptimalUnit } from '@zerovoids/utils/unit';

// Auto-convert individual values
const weight = convertUnitToFit({ 
  number: 5420, 
  unit: 'mass', 
  from: 'g' 
});
// → { number: 5.42, unit: 'mass', suffix: 'kg' }

// Find optimal unit for chart axis
const chartValues = [4500, 8200, 12000, 15800];
const optimalUnit = getOptimalUnit({ 
  numbers: chartValues, 
  unit: 'mass', 
  from: 'g' 
});
// → 'kg'

// Convert all values to optimal unit
const chartData = chartValues.map(value => 
  convertUnitFromTo({ 
    number: value, 
    unit: 'mass', 
    from: 'g', 
    to: optimalUnit 
  })
);
// → All values converted to kg for consistent display
```

### File Size Formatting

```typescript
import { convertUnitToFit } from '@zerovoids/utils/unit';

const fileSizes = [1024, 1048576, 1073741824];

const formatted = fileSizes.map(bytes => 
  convertUnitToFit({ number: bytes, unit: 'data', from: 'B' })
);
// → [
//   { number: 1.024, unit: 'data', suffix: 'KB' },
//   { number: 1.049, unit: 'data', suffix: 'MB' },
//   { number: 1.074, unit: 'data', suffix: 'GB' }
// ]
```

### Large Number Abbreviation

```typescript
import { convertUnitToFit, formatNumber } from '@zerovoids/utils/unit';

const followers = 2547893;

const converted = convertUnitToFit({ 
  number: followers, 
  unit: 'count', 
  from: '' 
});
// → { number: 2.548, unit: 'count', suffix: 'M' }

const formatted = formatNumber(converted.number, { 
  mode: 'fixed', 
  decimals: 1,
  suffix: { text: converted.suffix, space: false }
});
// → "2.5M"
```

---

## 📖 Documentation

Detailed API documentation is coming soon.

---

## 🛠️ Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Build
pnpm build

# Lint and format
pnpm check
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

MIT © [zerovoids](https://github.com/zerovoids)

---

## 🔗 Links

- [npm package](https://www.npmjs.com/package/@zerovoids/utils)
- [GitHub repository](https://github.com/gio-hernandez-saito/zerovoids-utils)
- [Issue tracker](https://github.com/gio-hernandez-saito/zerovoids-utils/issues)

---

<div align="center">

**Made with ❤️ by zerovoids**

</div>
