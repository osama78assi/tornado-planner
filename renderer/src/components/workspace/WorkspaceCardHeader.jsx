import { useEffect, useState } from "react";
import Icon from "../ui/Icon";
import Loading from "../ui/Loading";
import toast from "react-hot-toast";
import { getWorkspaces } from "../../api/workspace";
import { setCurrentWorkspace } from "../../state/workspaces";
import { useDispatch } from "react-redux";
import { clearNonSerializable } from "../../util/main";

function WorkspaceCardHeader({ id }) {
    const [loading, setLoading] = useState(true);
    const [workspace, setWorkspace] = useState({});
        const dispatch = useDispatch();

    useEffect(() => {
        async function fetchWorkspace() {
            try {
                setLoading(true);
                const {
                    data: [workspace],
                } = await getWorkspaces({
                    filters: { id },
                });

                setWorkspace(workspace);
                // Set it to the global state
                const cloned = { ...workspace };
                clearNonSerializable(cloned);

                // Update the selected workspace without affecting it
                dispatch(setCurrentWorkspace(cloned));
            } catch (err) {
                toast.error(
                    err.message ||
                        "Something went wrong while fetching the selected workspace",
                );
                console.log(err);
            } finally {
                setLoading(false);
            }
        }

        fetchWorkspace();
    }, []);

    if (loading) return <Loading />;

    return (
        <div className="mt-4 mb-6  border border-(--main-interactive-color-v2) rounded-md p-6">
            <div className="flex items-center justify-center gap-2 text-xl mb-4 text-(--main-interactive-color-v2)">
                <Icon id={workspace.icon || "IoLayers"} />
                <h2>{workspace.name}</h2>
            </div>
            <div className="text-center text-lg">{workspace.description}</div>
        </div>
    );
}

export default WorkspaceCardHeader;
