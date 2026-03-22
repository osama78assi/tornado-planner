const { getDatabasePath } = require("./main");


module.exports = {
    development: {
        dialect: "sqlite",
        storage: getDatabasePath(),
    },
    test: {
        dialect: "sqlite",
        storage: getDatabasePath(),
    },
    production: {
        dialect: "sqlite",
        storage: getDatabasePath(),
    },
};
