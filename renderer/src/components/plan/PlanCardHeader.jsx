import Icon from "../ui/Icon";
import Loading from "../ui/Loading";

function PlanCardHeader({ plan, loading }) {
    if (loading) {
        return <Loading />;
    }

    return (
        <div className="mt-4 mb-6  border border-(--main-interactive-color-v2) rounded-md p-6">
            <div className="flex items-center justify-center gap-2 text-xl mb-4 text-(--main-interactive-color-v2)">
                <Icon id={plan.icon || "IoLayers"} />
                <h2>{plan.name}</h2>
            </div>
            <div className="text-center text-lg">{plan.description}</div>
        </div>
    );
}

export default PlanCardHeader;
