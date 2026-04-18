import { useState } from "react";
import Button from "../../ui/Button";
import FilterController from "./FilterController";

// DateFilterOverlay component for date filtering
function DateFilterOverlay({ onApply, onClear }) {
    const [value, setValue] = useState("");

    function handleApply() {
        onApply(value);
    }

    function handleClear() {
        setValue("");
        onClear();
    }

    return (
        <div className="p-2 flex flex-col gap-2">
            <input
                type="date"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="bg-(--thirdary-color) border border-(--main-divider-color) rounded px-2 py-1 text-(--main-text-color) focus:outline-none focus:shadow-[0_0_10px_var(--main-interactive-color-v3)]"
            />
            <FilterController
                onApply={handleApply}
                onClear={handleClear}
            />
        </div>
    );
}

export default DateFilterOverlay;
