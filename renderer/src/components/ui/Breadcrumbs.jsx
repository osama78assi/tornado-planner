import { MdKeyboardArrowRight } from "react-icons/md";

function Breadcrumbs({ items, wrap = false }) {
    return (
        <div className={`flex gap-3 ${wrap ? "flex-wrap" : ""}`}>
            {items.map((item, index, arr) => {
                return (
                    <div
                        className="flex gap-3 items-center py-1"
                        key={Math.random()}
                    >
                        <span className="text-lg font-semibold">{item}</span>
                        {index !== arr.length - 1 ? (
                            <span className="text-(--main-interactive-color-v1) font-bold text-2xl">
                                <MdKeyboardArrowRight />
                            </span>
                        ) : null}
                    </div>
                );
            })}
        </div>
    );
}

export default Breadcrumbs;
