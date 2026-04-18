import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { SlArrowDown } from "react-icons/sl";
import { createPortal } from "react-dom";
import { useOutsideClick } from "../../hooks/useOutsideClick";
import Input from "./Input";
import { createScrollDirectionDetector } from "../../util/main";

const detectScroll = createScrollDirectionDetector();

/**
 * A customizable dropdown component with search functionality and smart positioning
 *
 * @param {Object} props - Component props
 * @param {string} [props.label] - Default label text to display when no option is selected
 * @param {string} [props.menuMaxHeight="200px"] - Maximum height of the dropdown menu (CSS value)
 * @param {string} [props.menuMaxWidth=""] - Maximum width of the dropdown menu (CSS value). Leave empty to match parent width
 * @param {string} [props.className] - Additional CSS classes to apply to the dropdown container
 * @param {Array<{label: string, value: any, active?: boolean, render?: Function}>} [props.options] - Array of option objects to display in the dropdown
 * @param {Function} [props.onSelect] - Callback fired when an option is selected. Receives (option, event, forceClose) as arguments
 * @param {Function} [props.onOpen] - Callback fired when the dropdown is opened or toggled
 * @param {React.ReactNode} [props.openBtn] - Custom button element to use instead of the default label/arrow button
 * @param {Function} [props.labelOnActive] - Custom render function for the active item label. Receives (activeItem) as argument
 * @param {React.ReactNode} [props.children] - Additional content to render inside the dropdown menu
 * @param {boolean} [props.disabled=false] - Whether the dropdown is disabled
 * @param {boolean} [props.openMenu=false] - Controls whether the dropdown menu is open (controlled mode)
 * @param {Object} [props.menuOptions] - Additional props to pass to the dropdown menu container element
 * @param {Object} [props.optionOptions] - Additional props to pass to each option element
 * @param {Function} [props.onClose] - Callback fired when the dropdown menu is closed
 * @param {boolean} [props.search=false] - Enable search/filter functionality within the dropdown
 * @param {Function} [props.onSearch] - Callback fired when search query changes. Receives (searchQuery) as argument
 * @param {boolean} [props.preventDefaultSearchBehavior=false] - If true, disables default search filtering and relies on onSearch callback
 * @param {Object} [props...props] - Any additional props are spread onto the dropdown container element
 *
 * @returns {React.ReactElement} The dropdown component
 */
function Dropdown({
    label,
    menuMaxHeight = "200px",
    menuMaxWidth = "", // Leave empty when not used
    className,
    options,
    onSelect,
    onOpen,
    openBtn,
    labelOnActive,
    children,
    disabled,
    openMenu = false,
    menuOptions,
    optionOptions,
    onClose,
    search = false,
    onSearch,
    preventDefaultSearchBehavior = false,
    ...props
}) {
    const [open, setOpen] = useState(openMenu);
    const [innerOptions, setInnerOptions] = useState(() =>
        options?.map((opt) => ({ ...opt, __id: Math.random() })),
    );
    // Keep reference to original options for search filtering
    const [originalOptions, setOriginalOptions] = useState(() =>
        options?.map((opt) => ({ ...opt, __id: Math.random() })),
    );
    const [searchQuery, setSearchQuery] = useState("");
    const activeItem = innerOptions?.filter((option) => option.active)?.at(-1);
    const id = useId();
    const intialRender = useRef(true);
    const searchInputRef = useRef(null);

    // To handle render the dropdown menu even if the parent have overflow hidden or scroll to not scroll the parent
    const parentRef = useRef(null);
    const menuRef = useOutsideClick((e) => {
        // Don't react, leave the handle click do that
        if (e.target.closest('[role="select"]')?.dataset?.targetSelect === id) {
            return;
        }

        setOpen(false);
        // Reset search query when closing
        if (search) setSearchQuery("");
        onClose?.();
    });
    const lockedPosition = useRef(null);

    // Sync the changes and update both inner and original options
    useLayoutEffect(() => {
        if (options) {
            const mappedOptions = options.map((opt) => ({
                ...opt,
                __id: Math.random(),
            }));
            setInnerOptions(mappedOptions);
            setOriginalOptions(mappedOptions);
        }
    }, [options]);

    useEffect(() => {
        // Skip initial render
        if (intialRender.current) {
            intialRender.current = false;
            return;
        }

        // Sync
        setOpen(openMenu);
    }, [openMenu]);

    // Auto-focus search input when dropdown opens
    useEffect(() => {
        if (search && open && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [open, search]);

    // Handle search query changes
    useEffect(() => {
        if (!search) return;

        // If preventDefaultSearchBehavior is true, just call the callback
        if (preventDefaultSearchBehavior) {
            onSearch?.(searchQuery);
            return;
        }

        // Default search behavior: filter by label
        if (!searchQuery.trim()) {
            setInnerOptions(originalOptions);
            onSearch?.("");
            return;
        }

        const query = searchQuery.toLowerCase();
        const filtered = originalOptions.filter((option) =>
            option.label?.toLowerCase().includes(query),
        );
        setInnerOptions(filtered);
        onSearch?.(searchQuery);
    }, [searchQuery, originalOptions, search, preventDefaultSearchBehavior]);

    // When the user scroll or resize the window keep the menu in sync with the parent
    useLayoutEffect(() => {
        function syncSize() {
            const parent = parentRef.current;
            const menu = menuRef.current;

            // If one element isn't exist then terminate
            if (!parent || !menu) return;

            const menuPosition = menu.getBoundingClientRect();
            const parentPosition = parent.getBoundingClientRect();

            // If there is a space down there then render it down, otherwise render it up
            if (
                window.innerHeight - parentPosition.bottom >
                Math.min(menuPosition.height, parseFloat(menuMaxHeight)) + 10
            ) {
                menu.style.top = `${parentPosition.bottom}px`;
            } else {
                menu.style.top = `${parentPosition.top - Math.min(menuPosition.height, parseFloat(menuMaxHeight))}px`;
            }

            // Detect the scroll direction (x-axis or y-axis)
            const direction = detectScroll(window.scrollX, window.scrollY);

            // === HORIZONTAL POSITIONING (Left/Right) ===
            // Calculate the required width for the menu
            const requiredWidth = Math.min(
                parseFloat(menuMaxWidth),
                menuPosition.width,
            );
            // Calculate available space to the right of the parent
            const spaceRight = window.innerWidth - parentPosition.right;

            // Check if there's enough space on the right side (with 30px threashold)
            if (spaceRight > requiredWidth + 50) {
                // CASE 1: Enough space on the right side

                // If scrolling vertically (Y-axis), use locked position to prevent jitter
                if (direction === "y") {
                    // Apply previously locked position if it exists
                    if (lockedPosition.current.left) {
                        menu.style.left = `${lockedPosition.current.left}px`;
                    } else if (lockedPosition.current.right) {
                        menu.style.right = `${lockedPosition.current.right}px`;
                    }
                } else {
                    // If scrolling horizontally (X-axis) or initial render, update position
                    // Align menu with parent's left edge
                    menu.style.left = `${parentPosition.left}px`;

                    // Lock this position for future Y-axis scrolling
                    lockedPosition.current = {
                        left: parentPosition.left,
                    };
                }
            } else {
                // CASE 2: Not enough space on the right side
                // If there is a locked position with left then it was rendered initiall and the user scorlled

                // If scrolling vertically (Y-axis), use locked position to prevent jitter
                if (direction === "y") {
                    // Apply previously locked position if it exists
                    if (lockedPosition.current.left) {
                        menu.style.left = `${lockedPosition.current.left}px`;
                    } else if (lockedPosition.current.right) {
                        menu.style.right = `${lockedPosition.current.right}px`;
                    }
                } else {
                    // If scrolling horizontally (X-axis) or initial render, update position
                    // Align menu with parent's right edge (extends to the left)
                    menu.style.right = `${window.innerWidth - parentPosition.right}px`;
                    menu.style.removeProperty("left");
                    if (lockedPosition?.current?.left)
                        delete lockedPosition.current.left;

                    // Lock this position for future Y-axis scrolling
                    lockedPosition.current = {
                        right: 0,
                    };
                }
            }

            // Apply the menu styles
            if (menuMaxWidth === "")
                menu.style.width = `${parentPosition.width}px`;
            else menu.style.width = `${parseFloat(menuMaxWidth)}px`;

            menu.style.maxHeight = menuMaxHeight;
        }

        // Call directly when the menu has been opened
        syncSize();

        window.addEventListener("scroll", syncSize, true);
        window.addEventListener("resize", syncSize, true);

        return () => {
            window.removeEventListener("scroll", syncSize);
            window.removeEventListener("resize", syncSize);
            lockedPosition.current = null;
        };
    }, [open]);

    function handleClickP(e) {
        if (disabled) return;

        // If click came from menu, ignore
        if (
            menuRef.current &&
            e.target.closest('[role="listbox"]') === menuRef.current
        ) {
            return;
        }

        onOpen?.(e);
        setOpen((a) => !a);
    }

    function handleBlurP(e) {
        // If click came from menu, ignore. use relatedTarget to get the element that will be focused.
        // Or in case when the element that recived focus isn't a valid element, at this time outsideClick will hendle it
        if (
            (menuRef.current &&
                e.relatedTarget &&
                e.relatedTarget.closest('[role="listbox"]') ===
                    menuRef.current) ||
            e.relatedTarget === null
        ) {
            return;
        }

        // If blur is going to search input, don't close the dropdown
        if (
            search &&
            searchInputRef.current &&
            e.relatedTarget === searchInputRef.current
        ) {
            return;
        }

        onOpen?.(e);
        setOpen(false);
        // Reset search query when closing
        if (search) setSearchQuery("");
        onClose?.();
    }

    function handleKeyStrokeP(e) {
        if (disabled) return;

        if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            setOpen((t) => !t);
        }

        // Focus in the first option.
        if ((e.key === "ArrowDown" || e.key === "ArrowUp") && menuRef.current) {
            menuRef.current.children[0].focus();
        }
    }

    function handleSelect(e, option) {
        onSelect?.({ option, event: e, forceClose });

        // setActive(option);
        setInnerOptions((opts) =>
            opts.map((opt) => {
                if (opt.__id === option.__id) {
                    return { ...opt, active: true };
                }

                return { ...opt, active: false };
            }),
        );
    }

    function handleKeyDownM(e, option) {
        // Don't bubble up
        e.stopPropagation();

        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleSelect(e, option, forceClose);
            // setOpen(false);
            // const p = parentRef.current;
            // if (p) p.focus();
        }

        if (e.key === "ArrowDown") {
            e.preventDefault();
            const next = e.currentTarget.nextSibling;
            if (next) next.focus();
        }

        if (e.key === "ArrowUp") {
            e.preventDefault();
            const prev = e.currentTarget.previousSibling;
            if (prev) prev.focus();
        }

        /// Simulate the default behavior
        if (
            (e.key === "Tab" && !e.currentTarget.nextSibling) ||
            (e.key === "Tab" && e.shiftKey && !e.currentTarget.previousSibling)
        ) {
            // Prevent the default
            e.preventDefault();
            // Clsoe the menu
            setOpen(false);
            onClose?.();
            // Focus on the menu
            parentRef.current.focus();
        }

        if (e.key === "Escape") {
            e.preventDefault();
            setOpen(false);
            onClose?.();
            const parent = parentRef.current;
            if (parent) parent.current?.focus();
        }
    }

    // Pass it to parent
    function forceClose() {
        console.log("RF");

        setOpen(false);
        onClose?.();
        const parent = parentRef.current;
        if (parent) parent.focus();
    }

    let labelToRender = "PLease select something";
    if (openBtn) {
        // Skip the render
        labelToRender = null;
    } else if (activeItem && !labelOnActive) {
        labelToRender = (
            <p className="overflow-hidden whitespace-nowrap text-ellipsis w-[calc(100%-30px)] first-letter:capitalize">
                {activeItem.label}
            </p>
        );
    } else if (activeItem && labelOnActive) {
        labelToRender = labelOnActive?.(activeItem);
    } else if (label) {
        labelToRender = (
            <p className="overflow-hidden whitespace-nowrap text-ellipsis w-[calc(100%-30px)] first-letter:capitalize">
                {label}
            </p>
        );
    }

    return (
        <div
            {...props}
            role="select"
            className={`relative bg-(--thirdary-color) cursor-pointer flex rounded-sm px-4 py-2 gap-2 border-0 transition-all focus-within:shadow-[0_0_10px_var(--main-interactive-color-v3)] focus:outline-0! focus-within:outline-0! text-l w-full ${className ? className : ""} ${disabled ? "grayscale-[1] cursor-not-allowed!" : ""}`}
            // When you want to handle the foucs the same as click use onMousedown because it fires before the focus
            onClick={handleClickP}
            ref={parentRef}
            data-target-select={id}
            disabled={disabled}
            tabIndex={disabled ? -1 : 0}
            onKeyDown={handleKeyStrokeP}
            onBlur={handleBlurP}
        >
            {openBtn ? (
                openBtn
            ) : (
                <div className="flex w-full justify-between items-center gap-1 first-letter:capitalize">
                    {/* Render search input or label */}
                    {search && open ? (
                        <Input
                            ref={searchInputRef}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search..."
                            className="w-full! bg-transparent! outline-none! text-l! border-none! px-0! py-0! shadow-none! focus-within:shadow-none!"
                        />
                    ) : (
                        labelToRender
                    )}

                    <SlArrowDown
                        fontSize="12px"
                        className="transition-[rotate]"
                        style={{ ...(open ? { rotate: "180deg" } : {}) }}
                    />
                </div>
            )}

            {open
                ? createPortal(
                      <div
                          {...menuOptions}
                          className={`absolute flex flex-col cursor-pointer border border-(--main-divider-color) text-(--main-text-color) bg-(--thirdary-color) z-[999] divide-y-2 divide-(--main-divider-color) overflow-y-scroll ${menuOptions?.className ? menuOptions.className : ""}`}
                          ref={menuRef}
                          role="listbox"
                      >
                          {innerOptions?.map((option) => {
                              return (
                                  <div
                                      tabIndex={0}
                                      onKeyDown={(e) =>
                                          handleKeyDownM(e, option)
                                      }
                                      {...optionOptions}
                                      role="option"
                                      onClick={(e) => handleSelect(e, option)}
                                      className={`${activeItem?.__id === option.__id ? "bg-(--sixary-color)" : ""} hover:bg-(--sixary-color) transition-colors ${optionOptions?.className ? optionOptions.className : ""}`}
                                      key={option.__id}
                                  >
                                      {option?.render
                                          ? option.render(option)
                                          : option.label}
                                  </div>
                              );
                          })}
                          {children}
                      </div>,
                      document.getElementById("root"),
                  )
                : null}
        </div>
    );
}

export default Dropdown;
