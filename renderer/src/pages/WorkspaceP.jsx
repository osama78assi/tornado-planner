import Button from "../components/ui/Button";
import Header from "../components/ui/Header";
import { useParams } from "react-router-dom";
import WorkspaceCardHeader from "../components/workspace/WorkspaceCardHeader";
import Plans from "../components/plan/Plans";
import useData from "../hooks/useData";
import { createPlan, getPlans } from "../api/plan";
import Modal from "../components/ui/Modal";
import { useMemo, useState } from "react";
import PlanForm from "../components/plan/PlanForm";
import toast from "react-hot-toast";

function WorkspaceP() {
    const { workspaceId } = useParams();
    const filters = useMemo(() => {
        return { workspaceId };
    }, []);

    const { data, setData, loading } = useData({
        fetchFunction: getPlans,
        filters,
    });
    const [isOpen, setIsOpen] = useState(false);

    async function handleSubmit(values) {
        try {
            const res = await createPlan({ ...values, workspaceId });

            setData((data) => [res, ...data]);

            toast.success("New plan created successfully");

            setIsOpen(false);
        } catch (err) {
            toast.error(err.message);
            throw err;
        }
    }

    return (
        <div className="px-2 py-3">
            <WorkspaceCardHeader id={workspaceId} />

            <Header title="Plans">
                <Button.IconButton
                    icon="MdOutlineLibraryAdd"
                    size="sm"
                    style={{ padding: "0.4rem" }}
                    iconDir="left"
                    iconProps={{ style: { fontSize: "1.3rem" } }}
                    handleClick={() => {
                        setIsOpen(true);
                    }}
                >
                    New Plan
                </Button.IconButton>
            </Header>

            <Plans
                data={data}
                setData={setData}
                loading={loading}
                workspaceId={workspaceId}
            />

            <Modal
                isOpen={isOpen}
                handleClose={() => setIsOpen(false)}
                title={
                    <h2 className="text-lg text-(--main-interactive-color-v1)">
                        Create a plan
                    </h2>
                }
                className="max-h-[70dvh]! overflow-auto bg-(--main-color)! w-[calc(100vw-24px)]! sm:max-w-full min-[950px]:w-200! min-[950px]:max-w-200!"
            >
                <PlanForm onSubmit={handleSubmit} />
            </Modal>
        </div>
    );
}

export default WorkspaceP;
