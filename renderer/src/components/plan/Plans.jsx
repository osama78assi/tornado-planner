import Tag from "../ui/Tag";
import PlanItem from "./PlanItem";
import { memo } from "react";

const Plans = memo(function Plans({ data, setData, loading }) {
    return (
        <div className="flex flex-col gap-4 overflow-auto">
            {data.length ? (
                data.map((plan) => (
                    <PlanItem
                        updateData={setData}
                        key={`plan-${plan.id}-${Math.random()}`}
                        plan={plan}
                    />
                ))
            ) : !loading ? (
                <Tag className="mx-auto">
                    Clean. Start by creating a Plan...
                </Tag>
            ) : null}
        </div>
    );
});

Plans.displayName = "Plans";

export default Plans;
