import { useEffect, useState } from "react";
import Icon from "../ui/Icon";
import Loading from "../ui/Loading";
import toast from "react-hot-toast";
import { getWorkspaces } from "../../api/workspace";

function WorkspaceCardHeader({ id }) {
    const [loading, setLoading] = useState(true);
    const [workspace, setWorkspace] = useState({});

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
