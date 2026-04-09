import { NavLink, useNavigate } from "react-router-dom";

function SidebarItem({
    icon,
    children,
    to,
    disabled = false,
    collapsed = false,
}) {
    const nav = useNavigate();

    function handleClick() {
        if (disabled) return;
        nav(to);
    }

    const cursorClass = disabled ? "cursor-default!" : "cursor-pointer";

    return (
        <li
            className={`nav-item ${cursorClass}`}
            role="button"
            onClick={handleClick}
        >
            <div className="flex justify-start items-center gap-1.5 py-2 px-4 text-inherit">
                {icon}
                {!collapsed && <span>{children}</span>}
            </div>
        </li>
    );
}

export default SidebarItem;
