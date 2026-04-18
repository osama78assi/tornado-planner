import WorkspaceSelector from "../workspace/WorkspaceSelector";

function PlansHeader() {
    return (
        <div className="flex items-center gap-2 w-full px-4 justify-end">
            <WorkspaceSelector />
        </div>
    );
}

export default PlansHeader;
