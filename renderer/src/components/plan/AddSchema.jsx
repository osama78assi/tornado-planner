import { FiPlusCircle } from "react-icons/fi";
import { v4 as generateId } from "uuid";

function AddSchema({ onChange }) {
    return (
        <div
            tabIndex={0}
            onClick={() => {
                const id = generateId();
                onChange?.({ originalSchema: id, attr: "name", option: "-a" }); // Add key
            }}
            onKeyDown={(e) => {
                if (e.key === " ") {
                    e.preventDefault();
                    const id = generateId();
                    onChange?.({
                        originalSchema: id,
                        attr: "name",
                        option: "-a",
                    });
                }
            }}
            role="button"
            className={`flex items-center gap-10 justify-center transition-[border-color,color] cursor-pointer text-4xl border border-(--main-interactive-color-v1) hover:border-(--main-interactive-color-v2) text-(--main-interactive-color-v1) hover:text-(--main-interactive-color-v2) p-3 rounded-lg`}
        >
            <FiPlusCircle />
        </div>
    );
}

export default AddSchema;
