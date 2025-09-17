// "use client"

// import TurnOnLightDarkMode from "../components/TurnOnLightDarkMode"
// import { createContext, useContext, useEffect, useState } from "react";


// const ThemeContext = createContext();

// export function ThemeProvider({ children }){
//     const [mode, setMode] = useState("light");

//     useEffect(() => {
//         const storedMode = localStorage.getItem("theme");
//         if (storedMode) setMode(storedMode);
//     }, []);

//     useEffect(() => {
//         document.documentElement.classList.toggle("dark-mode", mode === "dark");
//         localStorage.setItem("theme", mode);
//     }, [mode]);

//     const toggleMode = () => setMode((m) => (m === "light" ? "dark" : "light"));

//     return (
//         <div>
//             <ThemeContext.Provider value={{mode, toggleMode}}>
//                 {children}
//             </ThemeContext.Provider>
//         </div>
//     )
// }

// export const useTheme = () => useContext(ThemeContext);