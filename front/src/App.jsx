import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Auth from "./components/Auth";
import Home from "./pages/HomePage";
import ExercisesPage from "./pages/ExercisesPage";
import RoutinesPage from "./pages/RoutinesPage";
import RoutineDetailsPage from "./pages/RoutineDetailsPage";
import './App.css';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  useEffect(() => {
    const interval = setInterval(() => {
      fetch("https://fitlover-back.onrender.com/ping")
        .then(() => console.log("Manteniendo vivo el backend"))
        .catch(err => console.error("Error manteniendo vivo el backend", err));
    }, 10 * 60 * 1000); // Cada 5 minutos

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const checkToken = () => {
      setToken(localStorage.getItem("token"));
    };

    window.addEventListener("storage", checkToken);
    return () => window.removeEventListener("storage", checkToken);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/home" /> : <Auth setToken={setToken} />} />
        <Route path="/home" element={token ? <Home /> : <Navigate to="/login" />} />
        <Route path="/ejercicios" element={token ? <ExercisesPage /> : <Navigate to="/login" />} />
        <Route path="/rutinas" element={token ? <RoutinesPage /> : <Navigate to="/login" />} />
        <Route path="/rutina/:id" element={token ? <RoutineDetailsPage /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to={token ? "/home" : "/login"} />} />
      </Routes>
    </Router>
  );
}
