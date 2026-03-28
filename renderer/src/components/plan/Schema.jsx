import { useEffect, useRef, useState } from "react";
import { getConstantsSnyc } from "../../util/constants";
import Button from "../ui/Button";
import Dropdown from "../ui/Dropdown";
import Input from "../ui/Input";
import { FaEye } from "react-icons/fa";
import { IoMdAddCircleOutline } from "react-icons/io";
import { IoTrashOutline } from "react-icons/io5";
import { validate } from "uuid";
import { FiX } from "react-icons/fi";
import { formateDateBy, getSettingsSync } from "../../util/main";

function Schema({
    name,
    type,
    disabled,
    values,
    onChange,
    focus,
    blur,
    deletable,
}) {
    const checkInputRef = useRef(null);

    // Keep track of the old name
    const oldSchemaName = useRef(name);

    // To focus on it for more user experience
    const nameInputRef = useRef(null);

    useEffect(() => {
        const ele = nameInputRef.current;
        if (ele) {
            ele.value = validate(name) ? "" : name;
        }
    }, [name]);

    useEffect(() => {
        const ele = nameInputRef.current;
        if (!ele) return;

        if (focus) {
            nameInputRef.current.focus();
            blur?.();
        }
    }, []);

    const { DEFAULT_SCHEMA_TYPES, DATE_FORMATS } = getConstantsSnyc();
    const schemaTypes = DEFAULT_SCHEMA_TYPES.map((type) => ({
        value: type,
        label: type === "string" ? "text" : type,
        id: type,
    }));

    // Get the user preferred date format
    const { dateFormat: preferredFormat } = getSettingsSync();

    const dateFormats = Object.keys(DATE_FORMATS).map((key) => ({
        label: formateDateBy(
            new Date(2020, 2, 19, 14, 20, 20),
            DATE_FORMATS[key],
        ),
        value: key,
        ...(key === preferredFormat ? { active: true } : {}),
    }));

    return (
        <div
            className={`border border-(--main-divider-color) p-[1rem] rounded-lg ${deletable ? "" : "pt-[2.5rem]!"}`}
        >
            {deletable ? (
                <div className="flex-1 basis-full flex justify-end transition-colors text-(--main-text-color) hover:text-(--secondary-text-color) text-[1.5rem]">
                    <button
                        className="cursor-pointer"
                        onClick={(e) => {
                            onChange?.({
                                originalSchema: name,
                                attr: "name",
                                option: "-d", // delete
                            });

                            e.preventDefault();
                        }}
                    >
                        <FiX />
                    </button>
                </div>
            ) : null}

            <div
                className={`flex w-full! flex-1 basis-full flex-wrap items-center gap-10 justify-center`}
            >
                <div
                    className={`flex flex-col gap-2 w-full! min-[950px]:basis-[calc((1/3)*100%-2rem)]!`}
                >
                    <label htmlFor={name} className="h-[1.4rem]">
                        Schema name
                    </label>
                    <Input
                        ref={nameInputRef}
                        disabled={disabled}
                        onChange={(e) => {
                            // Send the schema, from schema, the attribute to change and the new value
                            onChange?.({
                                originalSchema: name,
                                fromSchema: oldSchemaName.current,
                                value: e.target.value,
                                attr: "name",
                                option: "-u", // Update
                            });
                            // Update the old name to be as the first name
                            oldSchemaName.current = e.target.value;
                        }}
                        className="rounded-lg! w-full! h-10! disabled:grayscale-[1]!"
                        id={name}
                        defaultValue={validate(name) ? "" : name}
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
                            onChange?.({
                                originalSchema: name,
                                fromSchema: oldSchemaName.current,
                                attr: "type",
                                value: type.value,
                            });
                            if (type.value === "date") {
                                console.log("why ?");
                                onChange?.({
                                    originalSchema: name,
                                    fromSchema: oldSchemaName.current,
                                    value: preferredFormat, // Send the format form the settings
                                    attr: "format",
                                    option: "-x", // Upsert (update or insert)
                                });
                            } else {
                                onChange?.({
                                    originalSchema: name,
                                    fromSchema: oldSchemaName.current,
                                    value: preferredFormat, // Send the format form the settings
                                    attr: "format",
                                    option: "-d", // Delete
                                });
                            }
                            forceClose();
                        }}
                        className={`basis-full! w-full! h-10! rounded-lg disabled:grayscale-[1]`}
                        optionOptions={{
                            className: "p-1 first-letter:uppercase",
                        }}
                    />
                </div>

                {/* Type isn't date render this and disable it */}
                {type !== "date" ? (
                    <CheckInput
                        name={name}
                        checkInputRef={checkInputRef}
                        oldSchemaName={oldSchemaName}
                        disabled={disabled}
                        type={type}
                        onChange={onChange}
                        values={values}
                    />
                ) : null}

                {/* Type is date then render the format settings */}
                {type === "date" ? (
                    <div className="flex flex-col gap-2 w-full! min-[950px]:basis-[calc((1/3)*100%-0.5rem)]!">
                        <label
                            htmlFor={`${name}-values`}
                            className="h-[1.4rem]"
                        >
                            Select the date format
                        </label>
                        <Dropdown
                            className="rounded-lg! px-4! py-2!"
                            options={dateFormats}
                            label="Select format"
                            optionOptions={{ className: "p-3" }}
                            onSelect={(option, _, forceClose) => {
                                onChange?.({
                                    originalSchema: name,
                                    fromSchema: oldSchemaName.current,
                                    value: option.value,
                                    attr: "format",
                                    option: "-x", // Upsert (update or insert)
                                });
                                forceClose();
                            }}
                        />
                    </div>
                ) : null}
            </div>
        </div>
    );
}

function CheckInput({
    name,
    checkInputRef,
    oldSchemaName,
    disabled,
    type,
    onChange,
    values,
}) {
    return (
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
                                onChange?.({
                                    originalSchema: name,
                                    fromSchema: oldSchemaName.current,
                                    attr: "values",
                                    value: input.value,
                                    option: "-a", // -a -> add
                                });
                                // Clear in case passed
                                input.value = null;
                            }
                            e.preventDefault();
                        }
                    },
                }}
                disabled={disabled || type !== "check"}
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
                                                    onChange?.({
                                                        originalSchema: name,
                                                        fromSchema:
                                                            oldSchemaName.current,
                                                        attr: "values",
                                                        value: option.value,
                                                        option: "-d",
                                                    }); // -d -> delete
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
                            disabled={disabled || type !== "check"}
                            tabIndex={disabled ? -1 : 0}
                            className="rounded-none!"
                            handleClick={(e) => {
                                // Take the value from the input if exists and send it then clear the input
                                const input = checkInputRef.current;
                                if (input) {
                                    if (onChange) {
                                        onChange?.({
                                            originalSchema: name,
                                            name: oldSchemaName.current,
                                            attr: "values",
                                            value: input.value,
                                            option: "-a", // -a -> add
                                        });
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
    );
}

export default Schema;
