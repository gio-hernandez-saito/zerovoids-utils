import { resolve } from "node:path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
	plugins: [
		dts({
			include: ["src/**/*"],
			exclude: ["**/*.test.ts", "**/*.spec.ts"],
			copyDtsFiles: true,
			rollupTypes: false,
		}),
	],
	build: {
		outDir: "dist",
		sourcemap: true,
		minify: false,
		rollupOptions: {
			// 각 entry point를 독립적으로 빌드
			input: {
				index: resolve(__dirname, "src/index.ts"),
				"number/index": resolve(__dirname, "src/number/index.ts"),
				"unit/index": resolve(__dirname, "src/unit/index.ts"),
			},
			// Required so that root `index.ts` keeps its flat re-exports
			// instead of being tree-shaken into an empty module when the
			// subpath entries already host the same symbols.
			preserveEntrySignatures: "strict",
			output: [
				// ESM
				{
					format: "es",
					entryFileNames: "[name].js",
					chunkFileNames: "shared/[name]-[hash].js",
					dir: "dist",
					exports: "named",
					preserveModules: false,
				},
				// CJS — shared chunks must also use the .cjs extension so
				// Node does not treat them as ESM under `"type": "module"`.
				{
					format: "cjs",
					entryFileNames: "[name].cjs",
					chunkFileNames: "shared/[name]-[hash].cjs",
					dir: "dist",
					exports: "named",
					preserveModules: false,
				},
			],
		},
	},
});
