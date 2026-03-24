import { useLocation, useNavigate } from "react-router-dom";
import { formatDate } from "../../util/main";
import Icon from "../ui/Icon";
import { useState } from "react";
import { FaEdit } from "react-icons/fa";
import Modal from "../ui/Modal";
import PlanForm from "./PlanForm";
import { updatePlan } from "../../api/plan";

function PlanItem({ updateData, plan }) {
    const location = useLocation();
    const nav = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    function handleClick() {
        console.log(location);
        nav(`${location.pathname}/${plan.id}`);
    }

    async function handleUpdatePlan(payload) {
        try {
            const updatedPlan = await updatePlan(plan.id, payload);

            updateData((data) =>
                data.map((curPlan) =>
                    curPlan.id === plan.id ? updatedPlan : curPlan,
                ),
            );

            toast.success("Plan updated successfully");

            setIsOpen(false);
        } catch (err) {
            toast.error(err.message || "Something went wrong");
            console.log(err);
        }
    }

    return (
        <>
            <div
                className={`flex flex-wrap border border-(--main-divider-color) p-3 rounded-xl cursor-pointer transition-[border-color] hover:border-(--main-interactive-color-v3)`}
                onClick={(e) => {
                    handleClick();
                }}
            >
                <div className="flex basis-full items-center gap-3">
                    <div className="flex basis-full items-center gap-3 py-3 text-(--main-interactive-color-v1)">
                        <Icon
                            id={plan?.icon || "IoLayers"}
                            className="text-xl"
                        />
                        <h2 className="text-xl">{plan.name}</h2>
                    </div>
                    <button
                        className="h-fit p-1 cursor-pointer"
                        onClick={(e) => {
                            setIsOpen(true);
                            // Don't get invoked when the user click on the edit button
                            e.stopPropagation();
                        }}
                    >
                        <FaEdit className="text-lg transition-colors hover:text-(--main-interactive-color-v1)" />
                    </button>
                </div>

                <div className="flex flex-col gap-4">
                    <p>{plan.description}</p>
                    <p className="self-start text-gray-500">
                        {formatDate(plan.updatedAt)}
                    </p>
                </div>
            </div>

            <Modal
                isOpen={isOpen}
                title={
                    <h2 className="text-xl text-(--main-interactive-color-v1)">
                        Update Workspace
                    </h2>
                }
                handleClose={() => setIsOpen(false)}
                className="max-h-[70dvh]! overflow-auto bg-(--main-color)! w-[calc(100vw-24px)]! sm:max-w-full min-[950px]:w-200! min-[950px]:max-w-200!"
            >
                <div className=" w-full">
                    <PlanForm
                        initialValues={{
                            name: plan.name,
                            description: plan.description,
                            icon: plan.icon,
                            metadata: plan.metadata,
                        }}
                        onSubmit={handleUpdatePlan}
                        update={true}
                    />
                </div>
            </Modal>
        </>
    );
}

export default PlanItem;
