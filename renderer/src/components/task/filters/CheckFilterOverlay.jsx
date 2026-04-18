import { useState } from "react";
import Checkbox from "../../ui/Checkbox";
import Button from "../../ui/Button";
import FilterController from "./FilterController";

// CheckFilterOverlay component for checkbox filtering
function CheckFilterOverlay({ values, onApply, onClear }) {
    const [selectedValues, setSelectedValues] = useState([]);

    function handleToggle(val) {
        setSelectedValues((prev) => {
            if (prev.includes(val)) {
                return prev.filter((v) => v !== val);
            } else {
                return [...prev, val];
            }
        });
    }

    function handleApply() {
        onApply(selectedValues);
    }

    function handleClear() {
        setSelectedValues([]);
        onClear();
    }

    return (
        <div className="p-2 flex flex-col gap-2">
            <div className="flex flex-col gap-1 max-h-[150px] overflow-y-auto">
                {values?.map((val) => (
                    <div key={val} className="flex items-center gap-2">
                        <Checkbox
                            value={selectedValues.includes(val)}
                            onChange={() => handleToggle(val)}
                        />
                        <span className="text-sm">{val}</span>
                    </div>
                ))}
            </div>
            <FilterController onApply={handleApply} onClear={handleClear} />
        </div>
    );
}

export default CheckFilterOverlay;
