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

function Icon({ id, ...props }) {
    switch (id) {
        case "MdContentPasteSearch":
            return <MdContentPasteSearch {...props} />;
        case "LuPackageSearch":
            return <LuPackageSearch {...props} />;
        case "MdLocationSearching":
            return <MdLocationSearching {...props} />;
        case "RiChatSearchFill":
            return <RiChatSearchFill {...props} />;
        case "FiFolder":
            return <FiFolder {...props} />;
        case "LuFolderHeart":
            return <LuFolderHeart {...props} />;
        case "LuNotebookText":
            return <LuNotebookText {...props} />;

        // Global
        case "CgNotes": // Notes
            return <CgNotes {...props} />;
        case "FaTasks": // Tasks
            return <FaTasks {...props} />;
        case "TbRouteSquare": // Plans
            return <TbRouteSquare {...props} />;
        case "IoLayers": // Workspaces
            return <IoLayers {...props} />;
        case "MdOutlineLibraryAdd": // Create Workspaces
            return <MdOutlineLibraryAdd {...props} />;
    }
}

export default Icon;
