import { NavLink, useNavigate } from "react-router-dom";

function SidebarItem({ icon, children, to }) {
    const nav = useNavigate();
    return (
        <li className="nav-item" role="button" onClick={() => nav(to)}>
            <div className="flex justify-start items-center gap-1.5 py-2 px-4 text-inherit">
                {icon}
                <span>{children}</span>
            </div>
        </li>
    );
}

export default SidebarItem;
