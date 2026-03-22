import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { MdKeyboardArrowDown } from "react-icons/md";

function HExpander({ head, children }) {
    const isVisible = useRef(false);
    const eleRef = useRef();

    function handleClick() {
        if (isVisible.current) {
            eleRef.current.style.height = "0px";

            isVisible.current = false;
            return;
        }

        if (eleRef.current) {
            let totalHeight = 0;
            const items = [...eleRef.current.children];
            items.forEach((item) => {
                totalHeight += item.getBoundingClientRect().height;
            });

            eleRef.current.style.height = `${totalHeight}px`;
            isVisible.current = true;
        }
    }

    return (
        <div>
            <div
                className="flex gap-2 items-center cursor-pointer"
                onClick={handleClick}
            >
                {head}

                <MdKeyboardArrowDown className="text-xl" />
            </div>

            <div
                ref={eleRef}
                className="transition-[height] box-border h-0 overflow-hidden"
            >
                {children}
            </div>
        </div>
    );
}

export default HExpander;
