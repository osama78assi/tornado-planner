// Application settings
let settings = null;

export function getDayStatus() {
    const now = new Date();

    const [hours] = now
        .toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
            hour12: false,
        })
        .split(":");

    if (hours < 12) return "Good morning";

    if (hours >= 12 && hours < 16) return "Good afternoon";

    return "Good evening";
}

// This will be used in search. To prevent race condition
export function throttleSearch(fn) {
    // Save the last query
    let innerQ = "";

    return async function (query, page, limit) {
        // Update the current query
        innerQ = query;

        // Execute the search function
        const res = await fn(query, page, limit);

        // Skip result if query is outdated
        if (innerQ !== query) return null;

        return res;
    };
}

// This is usefull when you want to format a date by a default format from the backend, check main/config/constants.js
export function formateDateBy(date, format) {
    return new Intl.DateTimeFormat(format.locales, {
        ...format,
    }).format(new Date(date));
}

export function formatDate(date) {
    const now = new Date();
    const diff = {
        native: now.getTime() - date.getTime(),
        hours: (now.getTime() - date.getTime()) / 1000 / 60 / 60,
        minutes: (now.getTime() - date.getTime()) / 1000 / 60,
        seconds: (now.getTime() - date.getTime()) / 1000,
    };

    if (diff.hours > 24)
        return new Intl.DateTimeFormat("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
        }).format(date);

    // There is hour
    if (diff.hours >= 1) {
        return `${Math.floor(diff.hours)} Hour${Math.floor(diff.hours) === 1 ? "" : "s"} ago`;
    }

    // There is minutes
    if (diff.minutes >= 1) {
        return `${Math.floor(diff.minutes)} Minute${Math.floor(diff.minutes) === 1 ? "" : "s"} ago`;
    }

    // There is seconds
    return `A few seconds ago`;
}

/**
 * Pass the object and the key path to the property you want
 * @param {Object[]} data Your data
 * @param {string[]} fields The field you want to access [first level, second level ...]
 * @returns {any} The data you expect
 */
export function takeFieldByKey(data, fields) {
    // Be carefull when manipulate
    let target = data;

    fields.forEach((key) => {
        target = target?.[key];
    });

    return target;
}

export async function getSettings() {
    try {
        if (settings) return settings;

        settings = await window.settings.get();

        return settings;
    } catch (err) {
        throw err;
    }
}

export function getSettingsSync() {
    if (settings === null) {
        throw new Error("The settings isn't fetched yet");
    }

    return settings;
}
