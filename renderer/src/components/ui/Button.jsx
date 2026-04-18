import Icon from "./Icon";

function Button({
    outline = false,
    theme = "main",
    size = "md",
    children,
    disabled,
    handleClick,
    className,
    ...props
}) {
    let sizes = {
        sm: "btn-sm",
        md: "btn-md",
        lg: "btn-lg",
    };

    // Access outline: theme
    let classes = {
        false: {
            main: `btn-main ${sizes[size]}`,
            secondary: `btn-secondary ${sizes[size]}`,
        },
        true: {
            main: `btn-main-outline ${sizes[size]}`,
            secondary: `btn-secondary-outline ${sizes[size]}`,
        },
    };

    let additionalClasses = classes[outline][theme];

    return (
        <button
            className={`btn ${additionalClasses} ${className}`}
            disabled={disabled}
            onClick={(e) => !disabled && handleClick?.(e)}
            {...props}
        >
            {children}
        </button>
    );
}

function IconButton({
    outline = false,
    theme = "main",
    size = "md",
    children,
    disabled,
    handleClick,
    icon,
    iconDir = "right",
    iconProps,
    className: cls,
    ...props
}) {
    let sizes = {
        sm: "btn-sm",
        md: "btn-md",
        lg: "btn-lg",
    };

    // Access outline: theme
    let classes = {
        false: {
            main: `btn-main ${sizes[size]}`,
            secondary: `btn-secondary ${sizes[size]}`,
        },
        true: {
            main: `btn-main-outline ${sizes[size]}`,
            secondary: `btn-secondary-outline ${sizes[size]}`,
        },
    };

    let className = classes[outline][theme];

    return (
        <button
            className={`btn ${icon ? "btn-icon" : ""} ${className} ${cls}`}
            disabled={disabled}
            onClick={(e) => !disabled && handleClick?.(e)}
            {...props}
        >
            {icon && iconDir === "left" ? (
                <Icon id={icon} {...iconProps} />
            ) : null}
            {children}
            {icon && iconDir === "right" ? (
                <Icon id={icon} {...iconProps} />
            ) : null}
        </button>
    );
}

function BadgeBtn({ icon, handleClick, className, disabled, ...props }) {
    return (
        <button
            className={`flex p-[0.5rem] bg-(--thirdary-color) rounded-lg justify-between items-center cursor-pointer gap-1 transition-all text-xl focus-within:outline-0! focus:outline-0! focus-visible:outline-0! ${disabled ? "opacity-50 cursor-not-allowed!" : ""} ${className ? className : ""}`}
            onClick={(e) => !disabled && handleClick?.(e)}
            disabled={disabled}
            {...props}
        >
            {icon}
        </button>
    );
}

Button.IconButton = IconButton;
Button.BadgeBtn = BadgeBtn;

export default Button;
