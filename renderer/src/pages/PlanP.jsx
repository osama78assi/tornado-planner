import { useParams } from "react-router-dom";
import PlanCardHeader from "../components/plan/PlanCardHeader";
import { useEffect, useMemo, useState } from "react";
import useData from "../hooks/useData";
import TasksTable from "../components/task/TaskTable";
import TasksController from "../components/task/TasksController";
import { getTasks } from "../api/task";
import { getPlans } from "../api/plan";
import { getConstantsSnyc } from "../util/constants";
import { useDispatch } from "react-redux";
import { setCurrentWorkspace } from "../state/workspaces";
import { clearNonSerializable } from "../util/main";
import toast from "react-hot-toast";
import { getWorkspaces } from "../api/workspace";

function PlanP() {
    const { planId } = useParams();
    const [loadingPlan, setLoadingPlan] = useState(true);
    const [plan, setPlan] = useState({});
    const dispatch = useDispatch();

    const filters = useMemo(() => {
        return { planId: planId };
    }, []);

    const { data: tasks, setData } = useData({
        fetchFunction: getTasks,
        filters: filters,
    });
    const [headers, setHeaders] = useState([]);
    // Fetch the plan
    useEffect(() => {
        async function fetchPlan() {
            try {
                setLoadingPlan(true);
                const {
                    data: [plan],
                } = await getPlans({ filters: { id: planId } });

                setPlan(plan);
                // Set the headers
                let headers = [];
                // 1. add the checkbox/actions column
                headers.push({
                    dataIndex: ["completed"],
                    width: "100px",
                });

                // 2. add the task title
                headers.push({
                    dataIndex: ["title"],
                    header: "title",
                    type: "text",
                    sortable: true,
                    filterable: true,
                });

                // 3. add the description
                headers.push({
                    dataIndex: ["description"],
                    header: "description",
                    type: "text",
                    sortable: true,
                    filterable: true,
                });

                // Loop over the metadata and add
                Object.keys(plan.metadata).forEach((schema) => {
                    // Determine column-specific width based on schema name
                    const lowerSchema = schema.toLowerCase();
                    let columnWidth;

                    if (
                        lowerSchema === "start date" ||
                        lowerSchema === "end date"
                    ) {
                        // columnWidth = "200px";
                    } else if (
                        lowerSchema === "status" ||
                        lowerSchema === "priority"
                    ) {
                        // columnWidth = "200px";
                    }

                    headers.push({
                        dataIndex: ["columns", schema],
                        header: schema,
                        type: plan.metadata[schema].type,
                        minWidth: "300px",
                        sortable: true,
                        filterable: true,
                        ...(plan.metadata[schema]?.values
                            ? { values: plan.metadata[schema].values }
                            : {}),
                        ...(plan.metadata[schema]?.format
                            ? { dateFormat: plan.metadata[schema].format }
                            : {}),
                        ...(columnWidth ? { width: columnWidth } : {}),
                    });
                });

                // Set them
                setHeaders(headers);

                // Get the workpsace
                const {
                    data: [workpsace],
                } = await getWorkspaces({
                    limit: 1,
                    filters: { id: plan.workspaceId },
                });

                clearNonSerializable(workpsace);

                // Update the selected workspace without affecting it
                dispatch(setCurrentWorkspace(workpsace));
            } catch (err) {
                toast.error(
                    err.message ||
                        "Something went wrong while fetching the selected plan",
                );
                console.log(err);
            } finally {
                setLoadingPlan(false);
            }
        }

        fetchPlan();
    }, []);

    return (
        <div className="px-2 py-3">
            <PlanCardHeader plan={plan} loading={loadingPlan} />

            <TasksController tasks={tasks} setData={setData} plan={plan} />

            <div className="pb-2 mx-auto w-[95%] max-h-[50dvh] overflow-auto">
                <TasksTable
                    columns={headers}
                    data={tasks}
                    planId={planId}
                    setData={setData}
                />
            </div>
        </div>
    );
}

export default PlanP;
