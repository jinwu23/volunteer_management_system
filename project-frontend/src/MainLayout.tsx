import { Outlet, useLocation } from "react-router";
import { useState, useEffect } from "react";

import Navbar from "./components/Navbar";

function MainLayout() {
  const location = useLocation();
  const hideNavbarPaths = ["/login", "/create-account"];

  // Dark mode state
  const [darkMode, setDarkMode] = useState<boolean>(
    localStorage.getItem("darkMode") === "true"
  );

  // Apply dark mode class on mount & watch for state changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", darkMode.toString());
  }, [darkMode]);

  return (
    <div>
      {!hideNavbarPaths.includes(location.pathname) && (
        <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      )}
      <Outlet />
    </div>
  );
}

export default MainLayout;
