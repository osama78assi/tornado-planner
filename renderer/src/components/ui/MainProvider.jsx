import {
    createContext,
    useContext,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "react";

const context = createContext(null);

function MainProvider({ children }) {
    const [isSidebarToggled, setIsSidebarToggled] = useState(false);
    const [isFloating, setIsFloating] = useState(false);

    // This is usefull to avoide stae state
    const state = useRef({ isSidebarToggled, isFloating });

    function handleResize() {
        if (window.matchMedia("(max-width: 800px)").matches) {
            setIsSidebarToggled(true);

            setIsFloating(true);
        } else {
            if (state.current.isSidebarToggled && state.current.isFloating) {
                setIsSidebarToggled(false);
            }
            setIsFloating(false);
        }
    }

    // Sync the state with ref
    useEffect(() => {
        state.current.isFloating = isFloating;
        state.current.isSidebarToggled = isSidebarToggled;
    }, [isFloating, isSidebarToggled]);

    // Initial sync
    useEffect(() => {
        handleResize();
    }, []);

    // Resize listener
    useEffect(() => {
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    function toggleSidebar() {
        setIsSidebarToggled((t) => !t);
    }

    return (
        <context.Provider
            value={{
                isFloating,
                isSidebarToggled,
                toggleSidebar,
            }}
        >
            {children}
        </context.Provider>
    );
}

export function useMainLayoutContext() {
    const data = useContext(context);
    if (!data) {
        throw new Error(
            "useMainLayoutContext must be used inside MainProvider",
        );
    }
    return data;
}

export default MainProvider;
