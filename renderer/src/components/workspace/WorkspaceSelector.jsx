import { useEffect, useReducer, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getWorkspaces } from "../../api/workspace";
import { setCurrentWorkspace } from "../../state/workspaces";
import Dropdown from "../ui/Dropdown";
import Icon from "../ui/Icon";
import WorkspaceSelectorOption from "./WorkspaceSelectorOption";

function WorkspaceSelector() {
    const [options, setOptions] = useState([]);

    const { currentWorkspace } = useSelector((state) => state.workspaces);
    const dispatch = useDispatch();
    const nav = useNavigate();

    // Fetch all workspaces when component mounts or currentWorkspace changes
    // This ensures we have the latest workspace data and can mark the active one
    useEffect(() => {
        async function loadWorkspaces() {
            try {
                // Load all workspaces without pagination
                const { data } = await getWorkspaces({ loadAll: true });

                // Map workspace data to dropdown options format
                // Each option includes the workspace object and a custom render function
                const mappedOptions = data.map((workspace) => {
                    return {
                        label: workspace.name,
                        value: workspace.id,
                        workspace: workspace,
                        active: currentWorkspace?.id === workspace.id,
                        render: function renderOption(option) {
                            return <WorkspaceSelectorOption option={option} />;
                        },
                    };
                });

                setOptions(mappedOptions);
            } catch (err) {
                console.error("Failed to load workspaces:", err);
            }
        }

        loadWorkspaces();
    }, []);

    // Sync with the selected if changed
    useEffect(() => {
        setOptions((options) =>
            options.map((option) => {
                return {
                    ...option,
                    active: currentWorkspace?.id === option.workspace.id,
                };
            }),
        );
    }, [currentWorkspace]);

    // Handle workspace selection from dropdown
    // Update Redux state and navigate to the selected workspace's plans page
    function handleSelect({ option }) {
        const selectedWorkspace = option.workspace;
        delete selectedWorkspace.createdAt;
        delete selectedWorkspace.updatedAt;

        dispatch(setCurrentWorkspace(selectedWorkspace));
        nav(`/workspaces/${selectedWorkspace.id}/plans`);
    }

    // Custom label to show current workspace with icon
    function renderLabel() {
        if (!currentWorkspace) {
            return (
                <p className="overflow-hidden whitespace-nowrap text-ellipsis w-[calc(100%-30px)]">
                    Select Workspace
                </p>
            );
        }

        return (
            <div className="flex items-center gap-2 overflow-hidden w-[calc(100%-30px)]">
                <Icon
                    id={currentWorkspace.icon || "IoLayers"}
                    className="text-lg shrink-0"
                />
                <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                    {currentWorkspace.name}
                </span>
            </div>
        );
    }

    return (
        <div className="w-64">
            <Dropdown
                options={options}
                onSelect={handleSelect}
                search={true}
                labelOnActive={renderLabel}
                label="Select Workspace"
                className="rounded-full"
                menuMaxHeight="300px"
                optionOptions={{
                    className: "flex items-center",
                }}
                menuOptions={{ className: "z-999!" }}
            />
        </div>
    );
}

export default WorkspaceSelector;
