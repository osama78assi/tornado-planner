import { useLayoutEffect, useRef, useState } from "react";
import Input from "../ui/Input";
import IconPicker from "../ui/IconPicker";
import toast from "react-hot-toast";
import Button from "../ui/Button";
import { getConstantsSnyc } from "../../util/constants";
import PlanMetadataInputs from "./PlanMetadataInputs";

const defaultValues = {
    icon: null,
    name: null,
    description: null,
    metadata: {},
    isArchieved: null,
};

function PlanForm({
    onSubmit,
    initialValues = defaultValues,
    mapSetter,
    update = false,
}) {
    const form = useRef(null);

    const err = useRef(null);

    // To save the key mapping in case the user changed the schema name
    const keyMapper = useRef(null);

    // Assign only in initial render
    if (form.current === null) {
        form.current = {
            ...initialValues,
            metadata: {
                ...initialValues.metadata,
                ...getConstantsSnyc().DEFAULT_METADATA,
            },
        };

        const entries = Object.keys(form.current.metadata).map((k) => [k, k]);
        // Change the key mapper
        keyMapper.current = Object.fromEntries(entries);
    }

    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();

        // If there is an error from the metadata show it now
        if (err.current) {
            toast.error(err.current);
            return;
        }

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

        // Save the map and send it to parent in case it's update operation so you know what have changed
        mapSetter?.(keyMapper.current);

        // Lover over the metadata and replace with the map. This key will always be sent
        Object.keys(toSend.metadata).forEach((key) => {
            const newKey = keyMapper.current[key];
            if (newKey === "") {
                toast.error(
                    "There is a schema with emtpy name, fill it or delete it",
                );
                throw new Error("Inavlid empty schema name");
            }

            if (newKey !== key) {
                toSend.metadata[newKey] = structuredClone(toSend.metadata[key]);

                // Remove the properties that was used by the input and form engine
                if (toSend.metadata[newKey].deletable !== undefined)
                    delete toSend.metadata[newKey].deletable;
                if (toSend.metadata[newKey].focus !== undefined)
                    delete toSend.metadata[newKey].focus;

                delete toSend.metadata[key];
            }
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
            className="flex flex-col w-full flex-nowrap min-[950px]:flex-wrap rounded-lg p-2 gap-4 border border-(--main-divider-color)"
        >
            <div className="flex flex-col items-start min-[950px]:flex-row min-[950px]:items-center gap-3 min-[950px]:gap-10 justify-center px-6 py-4 text-lg! rounded-md">
                <label
                    htmlFor="workspace-name"
                    className="w-fit basis-1/3 text-nowrap px-2 min-[950px]:px-0"
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

            <div className="flex flex-col items-start min-[950px]:flex-row min-[950px]:items-center gap-3 min-[950px]:gap-10 justify-center px-6 py-4 text-lg! rounded-md">
                <label
                    htmlFor="workspace-name"
                    className="w-fit basis-1/3 text-nowrap px-2 min-[950px]:px-0"
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

            <div className="flex flex-col items-start min-[950px]:flex-row min-[950px]:items-center gap-3 min-[950px]:gap-10 justify-center px-6 py-4 text-lg! rounded-md">
                <label
                    htmlFor="workspace-name"
                    className="w-fit basis-1/3 text-nowrap px-2 min-[950px]:px-0"
                >
                    Chose an icon
                </label>
                <IconPicker
                    disabled={loading}
                    className="h-20 overflow-auto basis-2/3 px-2! py-2! rounded-2xl! w-full"
                    handlePick={(name) => (form.current.icon = name)}
                    activeIcon={form.current.icon}
                />
            </div>

            <PlanMetadataInputs
                disabled={loading}
                metadata={form.current.metadata}
                keyMapper={keyMapper.current}
                setError={(error) => (err.current = error)}
            />

            <Button
                type="submit"
                className="w-[80%]! mx-auto my-10"
                disabled={loading}
            >
                {update ? "Update" : "Create"} Plan
            </Button>
        </form>
    );
}

export default PlanForm;
