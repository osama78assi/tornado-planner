import { useNavigate } from "react-router-dom";
import { MdKeyboardBackspace } from "react-icons/md";

function BackBtn() {
    const nav = useNavigate();
    return (
        <div
            role="button"
            className="flex p-[0.2rem] rounded-lg justify-between items-center cursor-pointer gap-1 transition-all"
            onClick={() => nav(-1, { replace: true })}
            id="back-btn"
        >
            <MdKeyboardBackspace />
            <span>Back</span>
        </div>
    );
}

export default BackBtn;
