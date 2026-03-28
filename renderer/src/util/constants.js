let constants = null;

export async function getConstants() {
    // Check the cached
    if (constants) return constants;

    constants = await window.constants.get();

    // Normal return
    return constants;
}

export function getConstantsSnyc() {
    if(!constants) {
        throw new Error("The constants hasn't been fetched yet")
    }

    return constants
}
