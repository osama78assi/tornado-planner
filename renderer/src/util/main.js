import { v4 } from "uuid";

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
    try {
        return new Intl.DateTimeFormat(format.locales, {
            ...format,
        }).format(new Date(date));
    } catch (err) {
        console.error("Error formatting date:", err);
        // Fallback to rendering only the date part
        try {
            const dateObj = new Date(date);
            return dateObj.toLocaleDateString();
        } catch (fallbackErr) {
            console.error("Error in fallback date formatting:", fallbackErr);
            return String(date);
        }
    }
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

/**
 * Determine the current page based on the pathname
 * @param {string} pathname - The current pathname from useLocation
 * @returns {string} The page identifier (home, workspace, plans, settings)
 */
export function getPageFromPath(pathname) {
    // Home page - root path
    if (pathname === "/") {
        return "home";
    }

    // Settings page
    if (pathname === "/settings") {
        return "settings";
    }

    // Workspace plans list page - /workspaces/:id/plans
    if (/^\/workspaces\/[^/]+\/plans$/.test(pathname)) {
        return "plans";
    }

    // Single plan page - /workspaces/:id/plans/:planId
    if (/^\/workspaces\/[^/]+\/plans\/[^/]+$/.test(pathname)) {
        return "plan";
    }

    // Notes list page - /workspaces/:id/notes
    if (/^\/workspaces\/[^/]+\/notes$/.test(pathname)) {
        return "notes";
    }

    // Single note page - /workspaces/:id/notes/:noteId
    if (/^\/workspaces\/[^/]+\/notes\/[^/]+$/.test(pathname)) {
        return "note";
    }

    // Default fallback
    return "home";
}

function throttle(fn, delay) {
    let lastTime = 0;
    return function (...args) {
        let now = Date.now();
        if (now - lastTime >= delay) {
            fn.apply(this, args);
            lastTime = now;
        }
    };
}

export function createScrollDirectionDetector() {
    let lastX = 0;
    let lastY = 0;

    return function (currentX, currentY) {
        const deltaX = currentX - lastX;
        const deltaY = currentY - lastY;

        let result = null;

        if (deltaX !== 0 && deltaY !== 0) {
            result = "both";
        } else if (deltaX !== 0) {
            result = "x";
        } else if (deltaY !== 0) {
            result = "y";
        }

        lastX = currentX;
        lastY = currentY;

        return result;
    };
}

// This is data specific so want to add more check this function
export function clearNonSerializable(data) {
    if (data?.createdAt) delete data.createdAt;
    if (data?.updatedAt) delete data.updatedAt;
}

// Validate date range consistency between start date and end date
export function synchronizeDateRange(payload, originalRow) {
    // Get start date and end date from payload or original row
    let startDate;
    let endDate;

    if (payload?.metadata?.["start date"] !== undefined) {
        startDate = payload.metadata["start date"];
    } else {
        startDate = originalRow?.columns?.["start date"];
    }

    if (payload?.metadata?.["end date"] !== undefined) {
        endDate = payload.metadata["end date"];
    } else {
        endDate = originalRow?.columns?.["end date"];
    }

    // If both dates are null or undefined, no validation needed
    if (!startDate && !endDate) {
        return;
    }

    // If only one date is provided, no validation needed
    if (!startDate || !endDate) {
        return;
    }

    // Convert to Date objects for comparison
    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);

    // Check if dates are valid
    if (isNaN(startDateTime.getTime())) {
        throw new Error(
            "Inconsistent date range: start date is not a valid date",
        );
    }

    if (isNaN(endDateTime.getTime())) {
        throw new Error(
            "Inconsistent date range: end date is not a valid date",
        );
    }

    // Validate that start date is before or equal to end date
    if (startDateTime > endDateTime) {
        throw new Error(
            "Inconsistent date range: start date is after end date",
        );
    }
}
