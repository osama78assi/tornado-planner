function SettingsGroup({ title, children }) {
    return (
        <div className="mb-8 bg-(--thirdary-color) rounded-lg p-6">
            <h2 className="text-2xl font-bold text-(--main-text-color) mb-4 pb-3 border-b-2 border-(--main-divider-color)">
                {title}
            </h2>
            <div className="flex flex-col gap-4">{children}</div>
        </div>
    );
}

export default SettingsGroup;
