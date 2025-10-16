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
			output: [
				// ESM
				{
					format: "es",
					entryFileNames: "[name].js",
					dir: "dist",
					exports: "named",
					preserveModules: false,
				},
				// CJS
				{
					format: "cjs",
					entryFileNames: "[name].cjs",
					dir: "dist",
					exports: "named",
					preserveModules: false,
				},
			],
		},
	},
});
