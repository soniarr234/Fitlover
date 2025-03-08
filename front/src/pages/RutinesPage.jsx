import React, { useState, useEffect } from 'react';
import '../assets/styles/RoutinesPage.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import CardRoutine from '../components/CardRoutine';  // Importa el nuevo componente de rutina

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const RoutinesPage = () => {
    const [showPopup, setShowPopup] = useState(false);
    const [routineName, setRoutineName] = useState("");
    const [routines, setRoutines] = useState([]);
    const [exercises, setExercises] = useState({});
    const navigate = useNavigate();

    const [errorMessage, setErrorMessage] = useState("");
    const [showErrorPopup, setShowErrorPopup] = useState(false);

    // Obtiene las rutinas del usuario autenticado
    const fetchRoutines = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            return navigate('/login');
        }

        try {
            const response = await axios.get(`${API_URL}/rutinas`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRoutines(response.data);

            const exercisesData = {};
            for (const routine of response.data) {
                const exercisesResponse = await axios.get(`${API_URL}/rutina_ejercicios/${routine.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                exercisesData[routine.id] = exercisesResponse.data;
            }
            setExercises(exercisesData);
        } catch (error) {
            console.error('Error al obtener las rutinas:', error);
        }
    };

    useEffect(() => {
        fetchRoutines();
    }, []);

    const handleAddRoutine = async () => {
        if (routineName.trim()) {
            // Verificar si ya existe una rutina con el mismo nombre
            const existingRoutine = routines.find(routine => routine.nombre.toLowerCase() === routineName.toLowerCase());
            
            if (existingRoutine) {
                setErrorMessage("Ya existe una rutina con ese nombre.");
                setShowErrorPopup(true);
                return;
            }
    
            const token = localStorage.getItem("token");
            try {
                await axios.post(
                    `${API_URL}/rutinas`,
                    { nombre: routineName },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setRoutineName("");
                setShowPopup(false);
                fetchRoutines();
            } catch (error) {
                console.error('Error al crear la rutina:', error);
            }
        }
    };

    const handleDeleteRoutine = async (routineId) => {
        const token = localStorage.getItem("token");
        if (!token) {
            return navigate('/login');
        }

        try {
            await axios.delete(`${API_URL}/rutinas/${routineId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRoutines(routines.filter(routine => routine.id !== routineId));
        } catch (error) {
            console.error('Error al eliminar la rutina:', error);
        }
    };
    

    return (
        <>
            <Navbar />
            <div className="routines-page">
                <h1 className='title-rutines-page'>Mis Rutinas</h1>
                <button className='create-new-routine' onClick={() => setShowPopup(true)}>Crear Rutina</button>

                <ul className='routines-items'>
                    {routines.length > 0 ? (
                        routines.map((routine) => (
                            <li key={routine.id}>
                                <CardRoutine routineName={routine.nombre} routineId={routine.id} onDelete={handleDeleteRoutine} />
                            </li>
                        ))
                    ) : (
                        <p className='no-routines'>No tienes rutinas aún.</p>
                    )}
                </ul>

                {showPopup && (
                    <div className="contianer-popup-create-routine">
                        <div className="popup-create-routine">
                            <h2>Crear Nueva Rutina</h2>
                            <input
                                type="text"
                                placeholder="Nombre de la rutina"
                                value={routineName}
                                onChange={(e) => setRoutineName(e.target.value)}
                            />
                            <div className="buttons-popup-create-routine">
                                <button className='accept' onClick={handleAddRoutine}>Guardar</button>
                                <button onClick={() => navigate('/ejercicios')}>Añadir Ejercicios</button>
                                <button className='cancel' onClick={() => setShowPopup(false)}>Cancelar</button>
                            </div>
                        </div>
                    </div>
                )}

                {showErrorPopup && (
                    <div className="container-popup-error">
                        <div className="popup-error">
                            <h2>{errorMessage}</h2>
                            <button onClick={() => setShowErrorPopup(false)}>Cerrar</button>
                        </div>
                    </div>
                )}

            </div>
        </>
    );
};

export default RoutinesPage;
