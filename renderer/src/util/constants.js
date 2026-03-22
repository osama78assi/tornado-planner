let constants = null;

await (async function getConstants() {
    // Check the cached
    if (!constants) {
        constants = await window.constants.get();
    }

    // Normal return
    return constants;
})();
export default constants;
