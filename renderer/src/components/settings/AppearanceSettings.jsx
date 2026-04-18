import { useState } from "react";
import SettingsGroup from "./SettingsGroup";
import SettingContainer from "./SettingContainer";
import Dropdown from "../ui/Dropdown";

function AppearanceSettings() {
    const [theme, setTheme] = useState("dark");
    const [color, setColor] = useState("blue");

    const themeOptions = [
        { label: "dark", value: "dark", active: theme === "dark" },
    ];

    const colorOptions = [
        { label: "blue", value: "blue", active: color === "blue" },
    ];

    const className = "w-full! rounded-full";
    const optionOptions = {
        className: "rounded-sm! p-2!",
    };

    function handleThemeSelect({ option }) {
        setTheme(option.value);
        console.log("Theme selected:", option.value);
    }

    function handleColorSelect({ option }) {
        setColor(option.value);
        console.log("Color selected:", option.value);
    }

    return (
        <SettingsGroup title="Appearance">
            <SettingContainer
                title="Application Mode"
                description="Set the default mode for Tornado Planner"
            >
                <Dropdown
                    options={themeOptions}
                    onSelect={handleThemeSelect}
                    className={className}
                    optionOptions={optionOptions}
                    menuOptions={{ className: "p-2" }}
                />
            </SettingContainer>

            <SettingContainer
                title="Main Color"
                description="Set the main color for Tornado Planner"
            >
                <Dropdown
                    options={colorOptions}
                    onSelect={handleColorSelect}
                    className={className}
                    optionOptions={optionOptions}
                    menuOptions={{ className: "p-2" }}
                />
            </SettingContainer>
        </SettingsGroup>
    );
}

export default AppearanceSettings;
