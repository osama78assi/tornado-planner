import { useNavigate } from "react-router-dom";

function HomeBtn() {
    const nav = useNavigate();

    return (
        <button
            className="cursor-pointer p-[0.2rem] text-[var(--main-interactive-color-v1)] hover:text-[var(--main-interactive-color-v2)] transition-colors"
            onClick={() => {
                nav("/");
            }}
        >
            Tornado Planner
        </button>
    );
}

export default HomeBtn;
