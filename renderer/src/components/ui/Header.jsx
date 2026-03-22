function Header({ children, title, ...props }) {
    return (
        <div className="flex mb-6 mt-4 justify-between" {...props}>
            <h1 className="text-3xl text-(--main-interactive-color-v1)">
                {title}
            </h1>
            {children}
        </div>
    );
}

export default Header;
