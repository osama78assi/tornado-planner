import { Op } from "sequelize";
import ApplicationError from "./applicationError.js";
import {
    INVALID_PAGINATION_LIMIT,
    INVALID_PAGINATION_PAGE,
} from "../errors/global.js";

export function getSafeLimit(limit) {
    if (limit < 100) return limit;
    return 100;
}

// This function will take the filters from the client as expected shape and parse it to match sequelize operators
// This allows you to do multiple queries by using the same service function
/*
Expected shapes:
filters: {
    field: {
        or$/and$: [
            {
                op: value
            },
            {
                op: value
            }
        ]
    }
}

filters: {
    field: {
        op: val,
        op: val
    }
}

filters: {
    or$/and$: [
        []
    ]
}

*/

export const opMapper = {
    eq$: Op.eq,
    ne$: Op.ne,
    like$: Op.like,
    iLike$: Op.iLike,
    gt$: Op.gt,
    gte$: Op.gte,
    lt$: Op.lt,
    lte$: Op.lte,
    between$: Op.between,
    or$: Op.or,
    and$: Op.and,
    endsWith$: Op.endsWith,
    startsWith$: Op.startsWith,
    in$: Op.in,
};


// Either concat fields so we need to return an array, or normal field to return an object
function keyContainer(key) {
    if (!["and$", "or$"].includes(field)) {
        return [];
    }

    return {};
}

// Helper function to map the key
function mapKey(key) {
    if (opMapper[key]) return opMapper[key];

    return key;
}

function innerMap(obj) {
    let results;
    const objType = Object.prototype.toString.call(obj);
    // Case1: The obj is primitve
    if ( objType !== "[object Object]" && objType !== "[object Array]" ) {
        return obj; // Return it as it is
    }

    // Case 2: obj is an array
    if (Array.isArray(obj)) {
        results = [];

        for (let value of obj) {
            const type = Object.prototype.toString.call(value);

            // 1. When the value is not a primitive then we need to call parse
            if (type === "[object Object]") {
                results.push(innerMap(value));

                // Terminate the iteration
                continue;
            }

            // 2. It's primitive then just push it
            results.push(value);
        }
    } else {
        // Case 3: obj is an object object
        results = {};

        const keys = Object.keys(obj);

        for (let key of keys) {
            // Map the key
            const mappedKey = mapKey(key);

            const type = Object.prototype.toString.call(obj[key]);
            // 1. The value is an object then assign to object
            if (type === "[object Object]") {
                results[mappedKey] = innerMap(obj[key]);

                // Terminate the iteration
                continue;
            }

            // 2. The value is an array
            if (type === "[object Array]") {
                results[mappedKey] = innerMap(obj[key]);

                // Terminate the iteration
                continue;
            }

            // 3. The value is primitive. Add
            results[mappedKey] = obj[key];
        }
    }

    return results;
}

export function mapFilters(filters) {
    // Final sequelzie where statement
    const whereStatement = {};

    // Loop over provided fields
    Object.keys(filters).forEach((key) => {
        // This will return an object so take it
        whereStatement[mapKey(key)] = innerMap(filters[key]);
    });

    return whereStatement;
}

export function checkPagination(page, limit) {
    if (typeof page !== "number") throw INVALID_PAGINATION_PAGE;

    if (typeof limit !== "number") throw INVALID_PAGINATION_LIMIT;
}
