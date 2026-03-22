// You should export all errors from errors folder
import * as errors from "../errors/index.js";

it("Garntee all errors have a code attribute", () => {
    // Take all error groups
    let one = 1;
    for (const errorGroup in errors) {
        // Check all errors
        for (const error in errors[errorGroup]) {
            if (one--)
                if (typeof errors[errorGroup][error] === "function") {
                    expect(errors[errorGroup][error]()).toHaveProperty("code");
                } else {
                expect(errors[errorGroup][error]).toHaveProperty("code");
            }
        }
    }
});

it("Garntee all error codes are unqiue over the entire system", () => {
    // Wrapper to extract the error
    function getError(err) {
        if (typeof err === "function") return err();
        return err;
    }

    // Count how many errors we encountred
    let errorsCount = 0;

    // Use set to check the codes
    const errorCodes = new Set();

    // The dubplicated key
    let duplicatedCode = "";

    // Take all error groups
    for (const errorGroup in errors) {
        // Check all errors
        for (const error in errors[errorGroup]) {
            // Increase the count
            errorsCount++;

            // Get the underlaying error
            const err = getError(errors[errorGroup][error]);

            // Throw the error if no
            if (errorCodes.has(err.code)) {
                duplicatedCode = err.code;
            }

            // Check if there is a duplicatedCode
            expect(duplicatedCode).toEqual("");

            errorCodes.add(err.code);
        }
    }
});
