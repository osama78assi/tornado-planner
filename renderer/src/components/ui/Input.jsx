import { forwardRef } from "react";

const Input = forwardRef(function Input({ className, ...props }, ref) {
    return (
        <input
            ref={ref}
            className={`bg-(--thirdary-color) flex rounded-sm px-4 py-2 gap-2 border-0 transition-all focus-within:shadow-[0_0_10px_var(--main-interactive-color-v3)] focus:outline-0! focus-within:outline-0! text-l w-full ${className ? className : ""}`}
            {...props}
        />
    );
});

function TextArea({ className, ...props }) {
    return (
        <textarea
            className={`bg-(--thirdary-color) flex rounded-sm px-4 py-2 gap-2 border-0 transition-all focus-within:shadow-[0_0_10px_var(--main-interactive-color-v3)] focus:outline-0! focus-within:outline-0! text-l w-full ${className ? className : ""}`}
            {...props}
        />
    );
}

function InputIcon({ icon, inputProps, parentProps }) {
    return (
        <div
            {...parentProps}
            className={`bg-(--thirdary-color) flex rounded-sm px-4 py-2 gap-2 border-0 transition-all focus-within:shadow-[0_0_10px_var(--main-interactive-color-v3)] ${parentProps?.className ? parentProps?.className : ""}`}
        >
            {icon}
            <input
                {...inputProps}
                className={`focus:outline-0! focus-within:outline-0! text-l w-full ${inputProps?.className ? inputProps?.className : ""}`}
            />
        </div>
    );
}

function InputwithActions({ actions, inputProps, parentProps, disabled }) {
    return (
        <div
            {...parentProps}
            className={`bg-(--thirdary-color) flex  gap-2 border-0 transition-all focus-within:shadow-[0_0_10px_var(--main-interactive-color-v3)] ${parentProps?.className ? parentProps?.className : ""} ${disabled ? "grayscale-[1] cursor-not-allowed" : ""}`}
        >
            {actions}
            <input
                disabled={disabled}
                {...inputProps}
                className={`focus:outline-0! focus-within:outline-0! text-l w-full ${inputProps?.className ? inputProps?.className : ""}`}
            />
        </div>
    );
}

Input.InputIcon = InputIcon;
Input.TextArea = TextArea;
Input.InputwithActions = InputwithActions;

export default Input;
