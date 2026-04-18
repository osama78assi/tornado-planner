export default {
    testEnvironment: "node",
    // extensionsToTreatAsEsm: [".js"],
    transform: {},
    moduleNameMapper: {
        "electron-is-dev": "<rootDir>/__mocks__/electron-is-dev.js",
        electron: "<rootDir>/__mocks__/electron.js",
    },
};
