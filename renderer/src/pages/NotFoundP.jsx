import { NavLink } from "react-router-dom";

function NotFoundP() {
    return (
        <div className="text-2xl flex h-full w-full justify-center items-center">
            <p className="p-2 bg-red-300 text-(--main-text-color) rounded-xl text-lg">
                Page not found please return{" "}
                <NavLink to="/" className="underline">
                    Home
                </NavLink>
            </p>
        </div>
    );
}

export default NotFoundP;
