import { FiFolder } from "react-icons/fi";
import { LuFolderHeart, LuNotebookText, LuPackageSearch } from "react-icons/lu";
import {
    MdContentPasteSearch,
    MdLocationSearching,
    MdOutlineLibraryAdd,
} from "react-icons/md";
import { RiChatSearchFill } from "react-icons/ri";
import { CgNotes } from "react-icons/cg";
import { FaTasks } from "react-icons/fa";
import { TbRouteSquare } from "react-icons/tb";
import { IoLayers } from "react-icons/io5";
import { useEffect, useState } from "react";

const icons = [
    { id: "icon-id-unique-100", icon: <FiFolder className="text-lg" /> },
    { id: "icon-id-unique-101", icon: <LuFolderHeart className="text-lg" /> },
    { id: "icon-id-unique-102", icon: <LuNotebookText className="text-lg" /> },
    { id: "icon-id-unique-103", icon: <LuPackageSearch className="text-lg" /> },
    {
        id: "icon-id-unique-104",
        icon: <MdContentPasteSearch className="text-lg" />,
    },
    {
        id: "icon-id-unique-105",
        icon: <MdLocationSearching className="text-lg" />,
    },
    {
        id: "icon-id-unique-106",
        icon: <MdOutlineLibraryAdd className="text-lg" />,
    },
    {
        id: "icon-id-unique-107",
        icon: <RiChatSearchFill className="text-lg" />,
    },
    { id: "icon-id-unique-108", icon: <CgNotes className="text-lg" /> },
    { id: "icon-id-unique-109", icon: <FaTasks className="text-lg" /> },
    { id: "icon-id-unique-110", icon: <TbRouteSquare className="text-lg" /> },
    { id: "icon-id-unique-111", icon: <IoLayers className="text-lg" /> },
];

function IconPicker({ handlePick, activeIcon, disabled, className, ...props }) {
    const [active, setActive] = useState(activeIcon);

    useEffect(() => {
        setActive(activeIcon);
    }, [activeIcon]);

    // Set and remove on anohter click
    function handleClick(name) {
        if (disabled) return;

        if (active === name) {
            handlePick?.(null);
            setActive(null);
            return;
        }

        handlePick?.(name);
        setActive(name);
    }

    return (
        <div
            className={`flex items-center gap-1 flex-wrap p-2 border border-(--main-divider-color) rounded-xl ${className}`}
            {...props}
        >
            {icons.map((icon) => (
                <span
                    // When there is a selected element then just skip to next button
                    tabIndex={
                        active && active === icon.icon.type.name
                            ? 0
                            : active && active !== icon.icon.type.name
                              ? -1
                              : 0
                    }
                    role="button"
                    onClick={() => handleClick(icon.icon.type.name)}
                    // When user click enter or space select the icon
                    onKeyDown={(e) => {
                        if (disabled) return;

                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault(); // Prevent scrolling on Space
                            handleClick(icon.icon.type.name);
                        }
                    }}
                    // For screen reader
                    aria-pressed={active === icon.icon.type.name}
                    key={icon.id}
                    className={`border border-(--main-divider-color) transition-[background-color] hover:bg-(--sixary-color) cursor-pointer p-1 rounded-lg ${active === icon.icon.type.name ? "bg-(--sixary-color)!" : ""} ${disabled ? "cursor-not-allowed" : ""}`}
                >
                    {icon.icon}
                </span>
            ))}
        </div>
    );
}

export default IconPicker;
