import { createPortal } from "react-dom";

function Loading() {
    return createPortal(
        <div className="fixed left-1/2 top-1/2 -translate-1/2 w-fit z-2 bg-(--secondary-color) p-1 rounded-xl">
            <div className="spinnar" />
        </div>,
        document.getElementById("root"),
    );
}

export default Loading;
