import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { SlArrowDown } from "react-icons/sl";
import { createPortal } from "react-dom";
import { useOutsideClick } from "../../hooks/useOutsideClick";

function Dropdown({
    label,
    menuMaxHeight = "200px",
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
    ...props
}) {
    const [open, setOpen] = useState(openMenu);
    const [innerOptions, setInnerOptions] = useState(() =>
        options?.map((opt) => ({ ...opt, __id: Math.random() })),
    );
    const activeItem = innerOptions?.filter((option) => option.active)?.at(-1);
    const id = useId();
    const intialRender = useRef(true);

    // To handle render the dropdown menu even if the parent have overflow hidden or scroll to not scroll the parent
    const parentRef = useRef(null);
    const menuRef = useOutsideClick((e) => {
        // Don't react, leave the handle click do that
        if (e.target.closest('[role="select"]')?.dataset?.targetSelect === id) {
            return;
        }

        setOpen(false);
    });

    // Sync the changes
    useLayoutEffect(() => {
        if (options)
            setInnerOptions(
                options.map((opt) => ({ ...opt, __id: Math.random() })),
            );
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
                menuPosition.height + 10
            ) {
                menu.style.top = `${parentPosition.bottom}px`;
            } else {
                menu.style.top = `${parentPosition.top - menuPosition.height}px`;
            }
            menu.style.left = `${parentPosition.left}px`;
            menu.style.width = `${parentPosition.width}px`;
            menu.style.maxHeight = menuMaxHeight;
        }

        // Call directly when the menu has been opened
        syncSize();

        window.addEventListener("scroll", syncSize, true);
        window.addEventListener("resize", syncSize, true);

        return () => {
            window.removeEventListener("scroll", syncSize);
            window.removeEventListener("resize", syncSize);
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
        // If click came from menu, ignore. use relatedTarget to get the element that will be focused
        if (
            menuRef.current &&
            e.relatedTarget &&
            e.relatedTarget.closest('[role="listbox"]') === menuRef.current
        ) {
            return;
        }

        onOpen?.(e);
        setOpen(false);
    }

    function handleKeyStrokeP(e) {
        if (disabled) return;

        if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            setOpen(true);
        }

        // Focus in the first option.
        if ((e.key === "ArrowDown" || e.key === "ArrowUp") && menuRef.current) {
            menuRef.current.children[0].focus();
        }
    }

    function handleSelect(e, option) {
        onSelect?.(option, e, forceClose);

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
            // Focus on the menu
            parentRef.current.focus();
        }

        if (e.key === "Escape") {
            e.preventDefault();
            setOpen(false);
            const parent = parentRef.current;
            if (parent) parent.current?.focus();
        }
    }

    // Pass it to parent
    function forceClose() {
        setOpen(false);
        const parent = parentRef.current;
        if (parent) parent.focus();
    }

    let labelToRender = "PLease select something";
    if (openBtn) {
        // Skip the render
        labelToRender = null;
    } else if (activeItem && !labelOnActive) {
        labelToRender = (
            <p className="overflow-hidden whitespace-nowrap text-ellipsis w-[calc(100%-30px)]">
                {activeItem.label}
            </p>
        );
    } else if (activeItem && labelOnActive) {
        labelToRender = labelOnActive?.(activeItem);
    } else if (label) {
        labelToRender = (
            <p className="overflow-hidden whitespace-nowrap text-ellipsis w-[calc(100%-30px)]">
                {label}
            </p>
        );
    }

    return (
        <div
            {...props}
            role="select"
            className={`relative bg-(--thirdary-color) cursor-pointer flex rounded-full px-4 py-2 gap-2 border-0 transition-all focus-within:shadow-[0_0_10px_var(--main-interactive-color-v3)] focus:outline-0! focus-within:outline-0! text-l w-full ${className ? className : ""} ${disabled ? "grayscale-[1] cursor-not-allowed!" : ""}`}
            // When you want to handle the foucs the same as click use onMousedown because it fires before the focus
            onClick={handleClickP}
            ref={parentRef}
            data-target-select={id}
            disabled={disabled}
            tabIndex={0}
            onKeyDown={handleKeyStrokeP}
            onBlur={handleBlurP}
        >
            {openBtn ? (
                openBtn
            ) : (
                <div className="flex w-full justify-between items-center gap-1">
                    {/* Render what is available */}
                    {labelToRender}

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
                          className={`absolute flex flex-col cursor-pointer border border-(--main-divider-color) text-(--main-text-color) bg-(--thirdary-color) z-2 divide-y-2 divide-(--main-divider-color) overflow-auto ${menuOptions?.className ? menuOptions.className : ""}`}
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
                                      className={`${activeItem?.__id === option.__id ? "bg-(--sixary-color)" : ""} hover:bg-(--sixary-color) transition-colors ${optionOptions.className ? optionOptions.className : ""}`}
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
