import Header from "../components/ui/Header";
import AppearanceSettings from "../components/settings/AppearanceSettings";
import PlansSettings from "../components/settings/PlansSettings";
import BackupsSettings from "../components/settings/BackupsSettings";

function SettingsP() {
    return (
        <div className="px-2 py-3 flex flex-col items-center">
            <div className="w-full max-w-4xl">
                <Header title="Settings" />

                <AppearanceSettings />
                <PlansSettings />
                <BackupsSettings />
            </div>
        </div>
    );
}

export default SettingsP;
