import { useState } from "react";
import SettingsGroup from "./SettingsGroup";
import SettingContainer from "./SettingContainer";
import Dropdown from "../ui/Dropdown";
import { getConstantsSnyc } from "../../util/constants";

function PlansSettings() {
    const [dateFormat, setDateFormat] = useState("ddmmyyyy_12h");

    // Get the constants date formats
    const { DATE_FORMATS: dateFormats } = getConstantsSnyc();

    const optionOptions = {
        className: "rounded-sm! p-2!",
    };

    // Loop over the keys
    const dateFormatOptions = Object.keys(dateFormats).map((key) => {
        // Take the necessary object to format
        const format = dateFormats[key];
        const exampleDate = new Date(2020, 9, 15, 14, 30);

        // Format
        const formattedExample = new Intl.DateTimeFormat(format.locales, {
            year: format.year,
            month: format.month,
            day: format.day,
            hour: format.hour,
            minute: format.minute,
            hour12: format.hour12,
        }).format(exampleDate);

        return {
            label: formattedExample,
            value: key,
            active: key === dateFormat,
            render: () => (
                <div className="flex flex-col gap-1 p-3">
                    <span className="font-semibold">{formattedExample}</span>
                </div>
            ),
        };
    });

    function handleDateFormatSelect({ option }) {
        setDateFormat(option.value);
        console.log("Date format selected:", option.value);
    }

    return (
        <SettingsGroup title="Plans">
            <SettingContainer
                title="Default Date Format"
                description="Set the default date format. This will be set when you add a column of type date. (you can change it on create time or update)"
            >
                <Dropdown
                    optionOptions={optionOptions}
                    options={dateFormatOptions}
                    onSelect={handleDateFormatSelect}
                    className="w-full! rounded-full"
                    menuMaxHeight="300px"
                    menuOptions={{ className: "p-2" }}
                />
            </SettingContainer>
        </SettingsGroup>
    );
}

export default PlansSettings;
