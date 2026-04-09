import { useParams } from "react-router-dom";
import PlanCardHeader from "../components/plan/PlanCardHeader";
import { useEffect, useMemo, useState, useLayoutEffect } from "react";
import useInfiniteScrolling from "../hooks/useInfiniteScrolling";
import TasksTable from "../components/task/TaskTable";
import { getTasks } from "../api/task";
import { getPlans } from "../api/plan";
import Checkbox from "../components/ui/Checkbox";
import { useDispatch } from "react-redux";
import { setCurrentPage } from "../state/navigator";

function PlanP() {
    const dispatch = useDispatch();
    const { planId } = useParams();
    const [loadingPlan, setLoadingPlan] = useState(true);
    const [plan, setPlan] = useState({});

    useLayoutEffect(() => {
        dispatch(setCurrentPage("workspace"));
    }, [dispatch]);

    const {
        data: tasks,
        setData,
        elementRef,
        pagination,
        loading: loadingTasks,
    } = useInfiniteScrolling({
        fetchFunction: getTasks,
        filters: { planId: planId },
        limit: 12,
        page: 1,
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
                // 1. add the checkbox
                headers.push({
                    dataIndex: ["completed"],
                    header: () => {
                        return null;
                    },
                    render: (row) => {
                        // TODO: add a quick function to mark the task as done
                        return (
                            <div className="flex items-center justify-center">
                                <Checkbox />
                            </div>
                        );
                    },
                    columnStyle: {
                        width: "60px", // or whatever fits your checkbox
                    },
                });

                // 2. add the task title
                headers.push({
                    dataIndex: ["title"],
                    header: "Title",
                    render: (row) => {
                        return (
                            <div className="overflow-hidden whitespace-nowrap text-ellipsis flex items-center">
                                {row?.title}
                            </div>
                        );
                    },
                    columnStyle: {
                        maxWidth: "200px",
                    },
                });

                // 3. add the description
                headers.push({
                    dataIndex: ["description"],
                    header: "Description",
                    render: (row) => {
                        return (
                            <div className="break-all flex items-center">
                                {row?.description}
                            </div>
                        );
                    },
                });

                // Loop over the metadata and add
                Object.keys(plan.metadata).forEach((schema) => {
                    headers.push({
                        dataIndex: ["metadata", schema],
                        header: schema,
                        type: plan.metadata[schema].type,
                        ...(plan.metadata[schema]?.values
                            ? { values: plan.metadata[schema].values }
                            : {}),
                    });
                });

                // Set them
                setHeaders(headers);
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

            <div className="py-2 w-full items overflow-auto">
                <TasksTable columns={headers} data={tasks} />

                <div ref={elementRef} />
            </div>
        </div>
    );
}

export default PlanP;
