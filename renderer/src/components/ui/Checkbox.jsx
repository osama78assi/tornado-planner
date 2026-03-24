import { useEffect, useState } from "react";
import { IoCheckmarkOutline } from "react-icons/io5";

function Checkbox({ value, onChange }) {
    const [checked, setChecked] = useState(value);

    useEffect(() => {
        setChecked(value);
    }, [value]);

    return (
        <div
            onClick={() => {
                onChange?.(!value);
                setChecked((v) => !v);
            }}
            role="checkbox"
            className={`w-6 h-6 border cursor-pointer flex items-center justify-center font-bold text-lg ${checked ? "border-(--main-interactive-color-v2) text-(--main-text-color) bg-(--main-interactive-color-v2)" : "border-(--scondary-divider-color)"} `}
        >
            {checked ? <IoCheckmarkOutline /> : null}
        </div>
    );
}

export default Checkbox;
