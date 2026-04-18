import { IoFilterOutline } from "react-icons/io5";
import Button from "../../ui/Button";
import Dropdown from "../../ui/Dropdown";
import TextFilterOverlay from "./TextFilterOverlay";
import NumberFilterOverlay from "./NumberFilterOverlay";
import DateFilterOverlay from "./DateFilterOverlay";
import CheckFilterOverlay from "./CheckFilterOverlay";

// Constants for icon widths
const FILTER_ICON_WIDTH = 20; // Width in pixels for filter icons

// ColumnFilter component - Renders filter button with dropdown
function ColumnFilter({ column, onApplyFilter, onClear, isActive }) {
    function handleApply(value) {
        onApplyFilter(column.header, value);
    }

    function handleClear() {
        onClear(column.header);
    }

    // Render appropriate filter overlay based on column type
    function renderFilterOverlay() {
        switch (column.type) {
            case "text":
                return (
                    <TextFilterOverlay
                        onApply={handleApply}
                        onClear={handleClear}
                    />
                );
            case "number":
                return (
                    <NumberFilterOverlay
                        onApply={handleApply}
                        onClear={handleClear}
                    />
                );
            case "date":
                return (
                    <DateFilterOverlay
                        onApply={handleApply}
                        onClear={handleClear}
                    />
                );
            case "check":
                return (
                    <CheckFilterOverlay
                        values={column.values}
                        onApply={handleApply}
                        onClear={handleClear}
                    />
                );
            default:
                return (
                    <TextFilterOverlay
                        onApply={handleApply}
                        onClear={handleClear}
                    />
                );
        }
    }

    return (
        <Dropdown
            className="p-[0.3rem]!"
            onSelect={() => {
                
            }}
            openBtn={
                <Button.BadgeBtn
                    icon={
                        <IoFilterOutline
                            className={
                                isActive
                                    ? "text-(--main-interactive-color-v1)"
                                    : ""
                            }
                            style={{
                                width: `${FILTER_ICON_WIDTH}px`,
                                height: `${FILTER_ICON_WIDTH}px`,
                            }}
                        />
                    }
                    handleClick={(e) => {
                        // e.stopPropagation();
                    }}
                    className="p-0! bg-transparent!"
                />
            }
            menuMaxWidth="200px"
            menuOptions={{
                className: "bg-(--secondary-color)! z-2!",
            }}
        >
            {renderFilterOverlay()}
        </Dropdown>
    );
}

export default ColumnFilter;
