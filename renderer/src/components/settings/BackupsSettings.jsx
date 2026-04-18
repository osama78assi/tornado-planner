import SettingsGroup from "./SettingsGroup";
import SettingContainer from "./SettingContainer";
import Button from "../ui/Button";
import toast from "react-hot-toast";
import { exportBackup, pickBackupFolder } from "../../api/setting";

function BackupsSettings() {
    async function handleExportBackup() {
        try {
            const path = await pickBackupFolder();

            if (path === null) {
                return;
            }
            
            // Export
            const successMsg = await exportBackup(path);

            if (successMsg) toast.success(successMsg);
        } catch (err) {
            
            toast.error(err?.message || "Something went wrong");
        }
    }

    function handleImportBackup() {
        console.log("Import backup clicked");
    }

    const className = "flex items-center justify-end h-full w-full";

    return (
        <SettingsGroup title="Backups">
            <SettingContainer
                title="Backup"
                description="Export a backup file for your database"
            >
                <div className={className}>
                    <Button
                        size="sm"
                        className="p-2!"
                        handleClick={handleExportBackup}
                    >
                        Export Backup
                    </Button>
                </div>
            </SettingContainer>

            <SettingContainer
                title="Restore"
                description="Import a backup file to your database"
            >
                <div className={className}>
                    <Button
                        size="sm"
                        className="p-2!"
                        handleClick={handleImportBackup}
                    >
                        Import Backup
                    </Button>
                </div>
            </SettingContainer>
        </SettingsGroup>
    );
}

export default BackupsSettings;
