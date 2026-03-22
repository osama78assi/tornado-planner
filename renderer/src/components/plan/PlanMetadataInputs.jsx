import { useRef, useState } from "react";
import constants from "../../util/constants";
import Button from "../ui/Button";
import Dropdown from "../ui/Dropdown";
import Input from "../ui/Input";
import { FaEye } from "react-icons/fa";
import { IoMdAddCircleOutline } from "react-icons/io";
import { IoTrashOutline } from "react-icons/io5";
import toast from "react-hot-toast";

const { DEFAULT_SCHEMA_TYPES, DEFAULT_METADATA } = constants;
const schemaTypes = DEFAULT_SCHEMA_TYPES.map((type) => ({
    value: type,
    label: type === "string" ? "text" : type,
    id: type,
}));

const defaultSchemaTitles = Object.keys(DEFAULT_METADATA);

function Schema({ name, type, disabled, values, onChange }) {
    const checkInputRef = useRef(null);

    // Keep track of the old name
    const oldSchemaName = useRef(name);

    return (
        <div
            className={`flex w-full! flex-1 basis-full flex-wrap items-center gap-10 justify-center border border-(--main-divider-color) p-4 rounded-lg`}
        >
            <div
                className={`flex flex-col gap-2 w-full! min-[950px]:basis-[calc((1/3)*100%-2rem)]!`}
            >
                <label htmlFor={name} className="h-[1.4rem]">
                    Schema name
                </label>
                <Input
                    disabled={disabled}
                    onChange={(e) => {
                        // Send the schema, from schema, the attribute to change and the new value
                        onChange?.(
                            name,
                            oldSchemaName.current,
                            "name",
                            e.target.value,
                        );
                        // Update the old name to be as the first name
                        oldSchemaName.current = e.target.value;
                    }}
                    className="rounded-lg! w-full! h-10! disabled:grayscale-[1]!"
                    id={name}
                    defaultValue={name}
                />
            </div>

            <div className="flex flex-col gap-2 w-full! min-[950px]:basis-[calc((1/3)*100%-2.5rem)]!">
                <label
                    htmlFor={`${name}-type`}
                    id={`${name}-type-label`}
                    className="h-[1.4rem]"
                >
                    Select schema type
                </label>
                <Dropdown
                    aria-labelledby={`${name}-type-label`}
                    id={`${name}-type`}
                    disabled={disabled}
                    options={schemaTypes.map((schema) => ({
                        ...schema,
                        active: schema.value === type,
                    }))}
                    label="Select schema type"
                    onSelect={(type, _, forceClose) => {
                        onChange?.(
                            name,
                            oldSchemaName.current,
                            "type",
                            type.value,
                        );
                        forceClose();
                    }}
                    className={`basis-full! w-full! h-10! rounded-lg disabled:grayscale-[1]`}
                    optionOptions={{ className: "p-1 first-letter:uppercase" }}
                />
            </div>

            <div className="flex flex-col gap-2 w-full! min-[950px]:basis-[calc((1/3)*100%-0.5rem)]!">
                <label htmlFor={`${name}-values`} className="h-[1.4rem]">
                    Enter values for your field
                </label>
                <Input.InputwithActions
                    parentProps={{
                        className:
                            "rounded-lg! w-full! h-10! disabled:graysacle-[1]",
                    }}
                    inputProps={{
                        ref: checkInputRef,
                        id: `${name}-values`,
                        onKeyDown: (e) => {
                            const input = checkInputRef.current;

                            if (e.key === "Enter" && input) {
                                if (onChange) {
                                    onChange?.(
                                        name,
                                        oldSchemaName.current,
                                        "values",
                                        input.value,
                                        "-a", // -a -> add
                                    );
                                    // Clear in case passed
                                    input.value = null;
                                }
                                e.preventDefault();
                            }
                        },
                    }}
                    disabled={type !== "check"}
                    actions={
                        <div className="flex">
                            <Dropdown
                                openBtn={
                                    <Button
                                        disabled={disabled || type !== "check"}
                                        handleClick={(e) => {
                                            // Don't submit the form
                                            e.preventDefault();
                                        }}
                                        className="rounded-none! rounded-s-lg!"
                                    >
                                        <FaEye />
                                    </Button>
                                }
                                disabled={disabled || type !== "check"}
                                menuOptions={{
                                    className: "max-w-[30rem]! w-[20rem]!",
                                }}
                                optionOptions={{
                                    className:
                                        "flex justify-between p-1 cursor-auto transition-colors hover:bg-(--forthary-color)",
                                }}
                                options={values?.map((val) => ({
                                    label: val,
                                    value: val,
                                    render: (option) => {
                                        return (
                                            <>
                                                <p>{option.label}</p>
                                                <button
                                                    className="transition-colors hover:text-red-500 cursor-pointer p-1"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onChange?.(
                                                            name,
                                                            oldSchemaName.current,
                                                            "values",
                                                            option.value,
                                                            "-d",
                                                        ); // -d -> delete
                                                    }}
                                                >
                                                    <IoTrashOutline />
                                                </button>
                                            </>
                                        );
                                    },
                                }))}
                                className="rounded-none! p-0!"
                            />

                            <Button
                                className="rounded-none!"
                                handleClick={(e) => {
                                    // Take the value from the input if exists and send it then clear the input
                                    const input = checkInputRef.current;
                                    if (input) {
                                        if (onChange) {
                                            onChange?.(
                                                name,
                                                oldSchemaName.current,
                                                "values",
                                                input.value,
                                                "-a", // -a -> add
                                            );
                                            // Clear in case passed
                                            input.value = null;
                                        }
                                    }

                                    e.preventDefault();
                                }}
                            >
                                <IoMdAddCircleOutline />
                            </Button>
                        </div>
                    }
                />
            </div>
        </div>
    );
}

function PlanMetadataInputs({ metadata, keyMapper, setError }) {
    // Expose the data to render it
    const schemas = Object.keys(metadata);

    // Internally save the keys in a set for fast lookup
    const keys = new Set(Object.keys(keyMapper));

    // When update by reference happen we need to re-render
    const [_, rerender] = useState(false);

    console.log(keyMapper);

    // console.log("\n#############\n", metadata, "\n#############\n");

    // Each attribute in the schema will have a way of handeling
    function handleChange(originalSchema, fromSchema, attr, value, option) {
        // The attribute you want to change
        switch (attr) {
            // Lazy update due to complexity
            case "name":
                // Sanitize the name
                if (value.length === 0) {
                    toast.error("The schema name can't be empty");
                    return;
                }

                if (value.length > 60) {
                    toast.error("The schema name can be 60 characters maximum");
                    return;
                }

                // Check if the value is existed before or not
                if (keys.has(value) && value !== fromSchema) {
                    toast.error("The schema name must be unique");
                    return;
                }

                // Remove the old schema name
                keys.delete(fromSchema);
                // Add the new key
                keys.add(value);

                // Save the mapper with the original schema
                // Later use structuredClone to copy the schemas
                keyMapper[originalSchema] = value;
                break;
            case "type":
                // If the type was normal and become a check then add values
                if (metadata[originalSchema].type !== "check") {
                    metadata[originalSchema].values = [];
                } else {
                    // Otherwise delete the values
                    delete metadata[originalSchema].values;
                }

                metadata[originalSchema].type = value;
                rerender((t) => !t);
                break;
            case "values":
                // The values are guarnteed that they are unique
                if (option === "-d") {
                    metadata[originalSchema].values = metadata[
                        originalSchema
                    ].values.filter((val) => val !== value);
                } else if (option === "-a") {
                    const trimmedVal = value.trim();
                    // Validate the value itself
                    if (trimmedVal.length === 0) {
                        toast.error("The value can't be empty");

                        return
                    }

                    // Check if the value is existed before or not
                    if (metadata[originalSchema].values.includes(trimmedVal)) {
                        toast.error(
                            "This value is already in the check values",
                        );
                        return;
                    }

                    // Maximum 20 elements
                    if (metadata[originalSchema].values.length === 20) {
                        toast.error("Check values can be 20 maximum...");

                        return;
                    }

                    metadata[originalSchema].values.push(trimmedVal);
                }

                rerender((e) => !e);
                break;
        }
    }

    return (
        <div className="flex flex-col gap-3 px-6 py-4 w-full">
            {schemas?.map((schemaName) => (
                <Schema
                    name={schemaName}
                    type={metadata[schemaName].type}
                    values={
                        metadata[schemaName].type === "check"
                            ? metadata[schemaName].values
                            : null
                    }
                    onChange={handleChange}
                    // disabled={defaultSchemaTitles.includes(schemaName)}
                />
            ))}
        </div>
    );
}

export default PlanMetadataInputs;
