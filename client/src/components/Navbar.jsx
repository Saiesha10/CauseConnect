import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase-config";

const Navbar = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut(auth);
        navigate("/");
    };

    return (
        <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
            <h1 className="font-bold text-xl">CauseConnect</h1>
            <div className="space-x-4">
                <Link to="/ngos" className="hover:underline">
                    NGOs
                </Link>
                <button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded hover:bg-red-600">
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
