import Breadcrumbs from "../ui/Breadcrumbs";
import HighlightSearch from "../ui/HighlightSearch";
import { IoLayers } from "react-icons/io5";

function TaskResult({ task, query }) {
    return (
        <div className="p-2 bg-(--thirdary-color) rounded-lg">
            <div className="border-b border-b-(--main-divider-color)">
                {task?.plan ? (
                    <Breadcrumbs
                    wrap={true}
                        items={[
                            <div className="flex items-center gap-2">
                                <IoLayers
                                    size="1.4rem"
                                    color="var(--main-interactive-color-v1)"
                                />
                                <span>{task?.plan?.workspace?.name}</span>
                            </div>,
                            task?.plan?.name,

                            <HighlightSearch
                                str={task?.title}
                                query={query}
                                truncate={false}
                                renderOnNotMatch={true}
                            />,
                        ]}
                    />
                ) : null}
            </div>

            <p className="p-3">
                <HighlightSearch
                    str={task?.description}
                    query={query}
                    renderOnNotMatch={true}
                />
            </p>
        </div>
    );
}

export default TaskResult;
