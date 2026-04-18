import Icon from "../ui/Icon";

function WorkspaceSelectorOption({ option }) {
    return (
        <div className="flex items-center gap-2 px-3 py-2">
            <Icon
                id={option.workspace?.icon || "IoLayers"}
                className="text-lg shrink-0"
            />
            <span className="overflow-hidden text-ellipsis whitespace-pre-wrap">
                {option.label}
            </span>
        </div>
    );
}

export default WorkspaceSelectorOption;
