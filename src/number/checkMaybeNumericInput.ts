import type { MaybeNumericInput } from "./types.js";

/**
 * Validates that the input is a valid number or numeric string.
 * Throws an error if the input cannot be converted to a valid number.
 *
 * @param input - The value to validate
 * @throws {Error} If input is not a number or numeric string
 * @throws {Error} If input converts to NaN
 *
 * @internal This is an internal utility function
 */
export function checkMaybeNumericInput(input: MaybeNumericInput): void {
	if (typeof input !== "string" && typeof input !== "number") {
		throw new Error(
			`Invalid input: expected a number or numeric string, but received ${typeof input}.`,
		);
	}

	const value = Number(input);

	if (Number.isNaN(value)) {
		throw new Error(
			"Invalid input: expected a number or numeric string, but received NaN.",
		);
	}
}
