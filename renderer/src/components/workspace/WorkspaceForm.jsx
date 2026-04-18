import { useRef, useState } from "react";
import Input from "../ui/Input";
import IconPicker from "../ui/IconPicker";
import toast from "react-hot-toast";
import Button from "../ui/Button";

function WorkspaceForm({
    onSubmit,
    initialValues = { icon: null, name: null, description: null },
    update = false,
}) {
    const form = useRef({ ...initialValues });
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();

        // Sanitize
        form.current.name = form.current.name?.trim();
        form.current.description = form.current.description?.trim();

        // Normalize
        if (
            form.current.description === "" ||
            form.current.description === undefined
        ) {
            form.current.description = null;
        }

        if (form.current.icon === "" || form.current.icon === undefined) {
            form.current.icon = null;
        }

        if (form.current.name === "" || form.current.name === undefined) {
            form.current.name = null;
        }

        if (form.current.name === null) {
            toast.error("The name is required");
            return;
        }

        if (form.current.name.length > 100) {
            toast.error("The name must be 100 characters maximum");
            return;
        }

        if (
            form.current.description &&
            form.current.description?.length > 3000
        ) {
            toast.error(
                "The description is really long, maximum 3000 characters",
            );
            return;
        }

        let toSend = {};
        // Specify what to send
        Object.keys(form.current).map((key) => {
            if (form.current[key] !== initialValues[key])
                toSend[key] = form.current[key];
        });

        try {
            setLoading(true);
            await onSubmit?.(toSend);
        } catch (err) {
            throw err;
        } finally {
            setLoading(false);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col rounded-lg p-2 gap-4 border border-(--main-divider-color)"
        >
            <div className="flex flex-col items-start sm:flex-row sm:items-center gap-3 sm:gap-10 justify-center px-6 py-4 text-lg! rounded-md">
                <label
                    htmlFor="workspace-name"
                    className="w-fit basis-1/3 text-nowrap px-2 sm:px-0"
                >
                    Enter name
                </label>
                <Input
                    disabled={loading}
                    id="workspace-name"
                    className="basis-2/3 px-2! py-2!"
                    onChange={(e) => {
                        if (e.target.value) form.current.name = e.target.value;
                        else form.current.name = null;
                    }}
                    defaultValue={initialValues.name}
                />
            </div>

            <div className="flex flex-col items-start sm:flex-row sm:items-center gap-3 sm:gap-10 justify-center px-6 py-4 text-lg! rounded-md">
                <label
                    htmlFor="workspace-name"
                    className="w-fit basis-1/3 text-nowrap px-2 sm:px-0"
                >
                    Enter description
                </label>
                <Input.TextArea
                    disabled={loading}
                    id="workspace-name"
                    className="basis-2/3 px-2! py-2! resize-none"
                    onChange={(e) => {
                        if (e.target.value)
                            form.current.description = e.target.value;
                        else form.current.name = null;
                    }}
                    defaultValue={form.current.description}
                />
            </div>

            <div className="flex flex-col items-start sm:flex-row sm:items-center gap-3 sm:gap-10 justify-center px-6 py-4 text-lg! rounded-md">
                <label
                    htmlFor="workspace-name"
                    className="w-fit basis-1/3 text-nowrap px-2 sm:px-0"
                >
                    Chose an icon
                </label>
                <IconPicker
                    disabled={loading}
                    className="h-20 overflow-auto basis-2/3 px-2! py-2! rounded-2xl!"
                    handlePick={(name) => (form.current.icon = name)}
                    activeIcon={form.current.icon}
                />
            </div>

            <Button
                type="submit"
                className="w-[80%]! mx-auto"
                disabled={loading}
            >
                {update ? "Update" : "Create"} Workspace
            </Button>
        </form>
    );
}

export default WorkspaceForm;
