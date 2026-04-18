function SettingContainer({ title, description, children }) {
    return (
        <div className="sm:flex-row flex flex-col gap-3 p-4 bg-(--secondary-color) rounded-2xl">
            <div className="flex flex-col gap-1 flex-1">
                <h3 className="text-lg font-semibold text-(--main-text-color)">
                    {title}
                </h3>
                <p className="text-sm text-(--thirdary-text-color)">
                    {description}
                </p>
            </div>
            <div className="min-w-75">{children}</div>
        </div>
    );
}

export default SettingContainer;
