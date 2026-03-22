import { useLocation, useNavigate } from "react-router-dom";
import { formatDate } from "../../util/main";
import Icon from "../ui/Icon";

function PlanItem({ updateData, plan }) {
    const location = useLocation();
    const nav = useNavigate();

    function handleClick() {
        console.log(location);
        nav(`${location.pathname}/${plan.id}`);
    }

    return (
        <>
            <div
                className={`flex flex-wrap border border-(--main-divider-color) p-3 rounded-xl cursor-pointer transition-[border-color] hover:border-(--main-interactive-color-v3)`}
                onClick={(e) => {
                    handleClick();
                }}
            >
                <div className="flex basis-full items-center gap-3 py-3 text-(--main-interactive-color-v1)">
                    <Icon id={plan?.icon || "IoLayers"} className="text-xl" />
                    <h2 className="text-xl">{plan.name}</h2>
                </div>

                <div className="flex flex-col gap-4">
                    <p>{plan.description}</p>
                    <p className="self-start text-gray-500">
                        {formatDate(plan.updatedAt)}
                    </p>
                </div>
            </div>
        </>
    );
}

export default PlanItem;
