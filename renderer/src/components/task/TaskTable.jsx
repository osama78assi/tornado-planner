import { useEffect, useState } from "react";
import { takeFieldByKey } from "../../util/main";
import { v4 as generateId } from "uuid";

/**
 * @typedef Column
 * @property {string[]}                         dataIndex       - The path to your data [level1, level2, the key you want]
 * @property {string}                           header          - The display header
 * @property {import("react").CSSProperties}    columnStyle     - CSS style to apply for the entire column
 * @property {import("react").CSSProperties}    headerStyle     - CSS style to apply for the header alone
 * @property {string}                           type            - Specify the type of the column
 * @property {string}                           values          - Specify the values in case the schema was check
 */

/**
 *
 * @param {Object} props
 * @param {Column[]} props.columns
 * @param {any[]} props.data
 * @returns
 */
function TasksTable({ columns, data }) {
    // Attach a unqiue stable key (this will be needed later)
    const [renderColumns, setRenderColumns] = useState(() =>
        columns?.map((obj) => ({ ...obj, __id: generateId() })),
    );

    useEffect(() => {
        setRenderColumns(
            columns?.map((obj) => ({ ...obj, __id: generateId() })),
        );
    }, [columns]);

    // Building a mapper to exctract the syles
    const styleMapper = {};
    renderColumns?.forEach((col) => {
        styleMapper[col.__id] = col.columnStyle;
    });

    console.log("\n#############\n", data, "\n#############\n");

    return (
        <div className="tasktable-container">
            <table className="tasktable">
                <thead className="tasktable-thead sticky">
                    <tr>
                        {renderColumns?.map((col) => (
                            <th
                                key={col.__id}
                                className="tasktable-th"
                                style={{
                                    ...col.columnStyle,
                                    ...col.headerStyle,
                                }}
                            >
                                {typeof col.header === "function"
                                    ? col.header(col)
                                    : col.header}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody className="tasktable-tbody">
                    {data?.map?.((row) => (
                        <tr key={`task-row-${row.id}`} className="tasktable-tr">
                            {renderColumns?.map((col) => (
                                <td
                                    key={`task-row-${col.__id}`}
                                    className="tasktable-td"
                                    style={{ ...styleMapper[col.__id] }}
                                >
                                    {col.render
                                        ? col.render(row)
                                        : takeFieldByKey(row, col.dataIndex)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default TasksTable;
