import Button from "../components/ui/Button";
import Header from "../components/ui/Header";
import { useParams } from "react-router-dom";
import WorkspaceCardHeader from "../components/workspace/WorkspaceCardHeader";
import Plans from "../components/plan/Plans";
import useInfiniteScrolling from "../hooks/useInfiniteScrolling";
import { getPlans } from "../api/plan";
import Modal from "../components/ui/Modal";
import { useState } from "react";
import PlanForm from "../components/plan/PlanForm";

function WorkspaceP() {
    // We need to fetch plans for the selected workspace
    const { workspaceId } = useParams();
    const { elementRef, data, setData, loading } = useInfiniteScrolling({
        fetchFunction: getPlans,
        limit: 10,
        filters: { workspaceId },
    });
    const [isOpen, setIsOpen] = useState(false);

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
                elementRef={elementRef}
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
                <PlanForm />
            </Modal>
        </div>
    );
}

export default WorkspaceP;
