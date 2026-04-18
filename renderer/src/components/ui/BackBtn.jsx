import { useNavigate } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import Button from "./Button";

function BackBtn({ className }) {
    const nav = useNavigate();
    return (
        <Button.BadgeBtn
            icon={
                <IoIosArrowBack className="text-(--main-interactive-color-v1)" />
            }
            handleClick={() => nav(-1, { replace: true })}
            className={className}
        />
    );
}

export default BackBtn;
