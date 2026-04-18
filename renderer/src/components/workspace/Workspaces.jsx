import { memo } from "react";
import Tag from "../ui/Tag";
import WorkspaceItem from "./WorkspaceItem";

const Workspaces = memo(function Workspaces({ data, setData, loading }) {
    return (
        <div className="flex flex-col gap-4 overflow-auto">
            {data.length ? (
                data.map((workspace) => (
                    <WorkspaceItem
                        updateData={setData}
                        key={`workspace-${workspace.id}-${Math.random()}`}
                        workspace={workspace}
                    />
                ))
            ) : !loading ? (
                <Tag className="mx-auto">
                    Clean. Start by creating a workspace...
                </Tag>
            ) : null}
        </div>
    );
});

Workspaces.displayName = "Workspaces";

export default Workspaces;
