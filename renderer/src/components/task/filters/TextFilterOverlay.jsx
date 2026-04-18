import { useState } from "react";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import FilterController from "./FilterController";

// TextFilterOverlay component for text filtering
function TextFilterOverlay({ onApply, onClear }) {
    const [value, setValue] = useState("");

    function handleApply() {
        onApply(value);
    }

    function handleClear() {
        setValue("");
        onClear();
    }

    return (
        <div className="p-2 flex flex-col gap-2" tabIndex={0}>
            <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter text..."
                className="rounded-full"
            />
            <FilterController onApply={handleApply} onClear={handleClear} />
        </div>
    );
}

export default TextFilterOverlay;
