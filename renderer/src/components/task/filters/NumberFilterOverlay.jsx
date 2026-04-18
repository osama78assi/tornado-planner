import { useState } from "react";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import FilterController from "./FilterController";

// NumberFilterOverlay component for number filtering
function NumberFilterOverlay({ onApply, onClear }) {
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
            <Input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter number..."
                className="rounded-full"
            />
            <FilterController onApply={handleApply} onClear={handleClear} />
        </div>
    );
}

export default NumberFilterOverlay;
