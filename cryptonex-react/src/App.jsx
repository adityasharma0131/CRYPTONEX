import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";

import Landing from "./Pages/Landing/Landing";
import Login from "./Pages/Auth/Login";
import Auth from "./Pages/Auth/Auth";
import Dashboard from "./Pages/Dashboard/Dashboard";
import Coin from "./Pages/Coin/Coin";

// Toast stack container (global)
import ToastStack from "./Components/ToastStack";

/* 🔥 Inline ScrollToTop Component */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth", // change to "auto" if needed
    });
  }, [pathname]);

  return null;
}

/* 🔥 Separate App Content (required because useLocation needs Router context) */
function AppContent() {
  return (
    <>
      <ScrollToTop />

      <Routes>
        <Route path="/" element={<Navigate to="/landing" replace />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/coin" element={<Coin />} />
      </Routes>

      <ToastStack />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
