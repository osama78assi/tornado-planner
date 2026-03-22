import { useEffect, useRef } from "react";

export function useOutsideClick(
    handeler,
    listenCapturing = true,
    cooldown = 500,
) {
    let abelToClick = 1;
    const ref = useRef(null);
    useEffect(() => {
        function handelClick(e) {
            if (ref.current && !ref.current.contains(e.target) && abelToClick) {
                abelToClick = 0;
                handeler(e);
                setTimeout(() => {
                    abelToClick = 1;
                }, cooldown);
            }
        }
        document.addEventListener("click", handelClick, listenCapturing);
        return () =>
            document.removeEventListener("click", handelClick, listenCapturing);
    }, [handeler, listenCapturing, abelToClick]);
    return ref;
}
