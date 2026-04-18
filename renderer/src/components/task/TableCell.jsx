import { takeFieldByKey, formateDateBy } from "../../util/main";
import { getConstantsSnyc } from "../../util/constants";

/**
 * TableCell component - Renders table data cell
 * @param {Object} props
 * @param {Column} props.column - Column configuration
 * @param {Object} props.row - Row data
 */
function TableCell({ column, row }) {
    // If custom render function exists, use it
    if (column.render) {
        return <td className="tornado-table-td">{column.render(row)}</td>;
    }

    // Get the raw value from the row data
    let displayValue = takeFieldByKey(row, column.dataIndex);

    // If column type is date and dateFormat is provided, format the date
    if (column.type === "date" && column.dateFormat && displayValue) {
        // Get the constants to access DATE_FORMATS
        const constants = getConstantsSnyc();
        const dateFormatConfig = constants.DATE_FORMATS[column.dateFormat];

        // Format the date using the utility function
        displayValue = formateDateBy(displayValue, dateFormatConfig);
    }

    return (
        <td className="tornado-table-td">
            <div className="wrap-anywhere flex items-center justify-center">
                {displayValue}
            </div>
        </td>
    );
}

export default TableCell;
