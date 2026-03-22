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
