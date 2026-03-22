import Icon from "./Icon";

function Tag({
    theme = "main",
    icon,
    text,
    iconClasses,
    textClasses,
    children,
    className,
    ...props
}) {
    let classes = "";
    switch (theme) {
        case "main":
            classes = "main-tag";
            break;
        case "secondary":
            classes = "secondary-tag ";
            break;
    }

    return (
        <div
            className={`p-2 rounded-lg flex items-center gap-2 w-fit ${classes ? classes : ""} ${className ? className : ""}`}
            {...props}
        >
            {children ? (
                children
            ) : (
                <Icon
                    id={icon}
                    className={`text-2xl ${iconClasses ? iconClasses : ""}`}
                />
            )}
            <span
                className={`text-inherit text-lg ${textClasses ? textClasses : ""}`}
            >
                {text}
            </span>
        </div>
    );
}

export default Tag;
