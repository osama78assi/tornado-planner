import { useState } from "react";
import constants from "../../util/constants";
import toast from "react-hot-toast";
import Schema from "./Schema";
import AddSchema from "./AddSchema";
const { DEFAULT_METADATA } = constants;

const defaultSchemaTitles = Object.keys(DEFAULT_METADATA);

function PlanMetadataInputs({ metadata, keyMapper, disabled, setError }) {
    // Expose the data to render it
    const schemas = Object.keys(metadata);

    // When update by reference happen we need to re-render
    const [_, rerender] = useState(false);

    // Each attribute in the schema will have a way of handeling
    function handleChange({ originalSchema, fromSchema, attr, value, option }) {
        // The attribute you want to change
        switch (attr) {
            // Lazy update due to complexity
            case "name":
                if (option === "-u") {
                    // Sanitize the name
                    if (value.length === 0) {
                        const err = "The schema name can't be empty";
                        toast.error(err);
                        setError?.(err);
                        return;
                    }

                    if (value.length > 60) {
                        const err =
                            "The schema name can be 60 characters maximum";
                        toast.error(err);
                        setError?.(err);
                        return;
                    }

                    // Check if the value is existed before or not
                    if (
                        Object.values(keyMapper).includes(value) &&
                        value !== fromSchema
                    ) {
                        const err = "The schema name must be unique";
                        toast.error(err);
                        setError?.(err);
                        return;
                    }

                    // Save the mapper with the original schema
                    // Later use structuredClone to copy the schemas
                    keyMapper[originalSchema] = value;
                } else if (option === "-a") {
                    // Add this to the mapper (empty string to not show the internal id)
                    keyMapper[originalSchema] = "";

                    // Update the metadata
                    metadata[originalSchema] = {
                        type: "string",
                        deletable: true,
                        focus: true,
                    };

                    rerender((t) => !t);
                } else if (option === "-d") {
                    // Remove it from the key mapper and the metadata
                    delete metadata[originalSchema];
                    delete keyMapper[originalSchema];

                    rerender((t) => !t);
                }
                break;
            case "type":
                // If the type was normal and become a check then add values
                if (
                    metadata[originalSchema].type !== "check" &&
                    value === "check"
                ) {
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
                        const err = "The value can't be empty";
                        toast.error(err);
                        setError?.(err);
                        return;
                    }

                    // Check if the value is existed before or not
                    if (metadata[originalSchema].values.includes(trimmedVal)) {
                        const err = "This value is already in the check values";
                        toast.error(err);
                        setError?.(err);
                        return;
                    }

                    // Maximum 20 elements
                    if (metadata[originalSchema].values.length === 20) {
                        const err = "Check values can be 20 maximum...";
                        toast.error(err);
                        setError?.(err);
                        return;
                    }

                    metadata[originalSchema].values.push(trimmedVal);
                }

                rerender((t) => !t);
                break;
        }

        // Reached here if there is an error it will be cleared
        setError?.(null);
    }

    return (
        <div className="flex flex-col gap-3 px-6 py-4 w-full">
            {schemas?.map((schemaName, i) => (
                <Schema
                    key={schemaName}
                    name={schemaName}
                    type={metadata[schemaName].type}
                    values={
                        metadata[schemaName].type === "check"
                            ? metadata[schemaName].values
                            : null
                    }
                    onChange={handleChange}
                    focus={metadata[schemaName]?.focus}
                    blur={() => {
                        if (metadata[schemaName]?.focus)
                            metadata[schemaName].focus = false;
                    }}
                    deletable={metadata[schemaName].deletable}
                    disabled={
                        disabled || defaultSchemaTitles.includes(schemaName)
                    }
                />
            ))}
            <AddSchema onChange={handleChange} />
        </div>
    );
}

export default PlanMetadataInputs;
