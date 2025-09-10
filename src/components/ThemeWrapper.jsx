"use client";

import { useEffect, useState } from "react";

export default function ThemeWrapper({ children }){
    const [mode, setMode] = useState("light");

    const handleClick = () => setMode(mode === "light" ? "dark" : "light");

    useEffect(() => {
        const root = document.documentElement;
        if(mode === "dark"){
            root.classList.add("dark-mode");
        } else {
            root.classList.remove("dark-mode");
        }
    }, [mode]);


    return (
        <div>
            <button
                onClick={handleClick}
                style={{ position: "fixed", bottom: 20, left: 20, zIndex: 999 }}
            >
                {mode ? "Light Mode" : "Dark Mode"}
            </button>
            {children}
        </div>
    );
}