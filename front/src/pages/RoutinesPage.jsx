import React, { useState, useEffect } from 'react';
import '../assets/styles/RoutinesPage.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import CardRoutine from '../components/CardRoutine';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const RoutinesPage = () => {
    const [showPopup, setShowPopup] = useState(false);
    const [routineName, setRoutineName] = useState("");
    const [routines, setRoutines] = useState([]);
    const [exercises, setExercises] = useState({});
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState("");
    const [showErrorPopup, setShowErrorPopup] = useState(false);

    useEffect(() => {
        fetchRoutines();
    }, []);

    useEffect(() => {
        if (routines.length > 0) {
            fetchExercisesForRoutines();
        }
    }, [routines]);

    const fetchRoutines = async () => {
        const token = localStorage.getItem("token");
        if (!token) return navigate('/login');

        try {
            const response = await axios.get(`${API_URL}/rutinas`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Asegúrate de que las rutinas estén ordenadas por el campo `orden` (o el campo que estés usando)
            setRoutines(response.data.sort((a, b) => a.orden - b.orden));
        } catch (error) {
            console.error('Error al obtener las rutinas:', error);
        }
    };


    const fetchExercisesForRoutines = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const exercisesData = {};
            await Promise.all(routines.map(async (routine) => {
                const exercisesResponse = await axios.get(`${API_URL}/rutina_ejercicios/${routine.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                exercisesData[routine.id] = exercisesResponse.data;
            }));
            setExercises(exercisesData);
        } catch (error) {
            console.error('Error al obtener ejercicios:', error);
        }
    };

    const handleAddRoutine = async () => {
        if (routineName.trim()) {
            if (routines.some(r => r.nombre.toLowerCase() === routineName.toLowerCase())) {
                setErrorMessage("Ya existe una rutina con ese nombre");
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
        if (!routineId) {
            console.error("❌ Error: routineId inválido:", routineId);
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            console.error("❌ Error: No hay token.");
            return navigate('/login');
        }

        try {
            const response = await axios.delete(`${API_URL}/rutinas/${routineId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // 🔥 Redirige antes de hacer más requests
            navigate('/rutinas');

            // Filtra la rutina eliminada de la lista
            setRoutines(prevRoutines => prevRoutines.filter(r => r.id !== routineId));
        } catch (error) {
            console.error('❌ Error al eliminar la rutina:', error);
        }
    };

    const handleDragEnd = async (result) => {
        const { destination, source } = result;
        if (!destination) return;

        // Reordenar las rutinas en base al destino
        const reorderedRoutines = Array.from(routines);
        const [movedRoutine] = reorderedRoutines.splice(source.index, 1);
        reorderedRoutines.splice(destination.index, 0, movedRoutine);

        // Actualizar el estado de las rutinas
        setRoutines(reorderedRoutines);

        // Enviar el nuevo orden al backend
        const token = localStorage.getItem("token");
        if (token) {
            try {
                await axios.put(`${API_URL}/rutinas/updateOrder`, {
                    order: reorderedRoutines.map((routine) => routine.id),
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } catch (error) {
                console.error('Error al actualizar el orden en el backend:', error);
            }
        }
    };

    return (
        <>
            <Navbar />
            <div className="routines-page">
                <h1 className='title-rutines-page'>Mis Rutinas</h1>
                <button className='create-new-routine' onClick={() => setShowPopup(true)}>Crear Rutina</button>

                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="routines" direction="vertical">
                        {(provided) => (
                            <ul
                                className='routines-items'
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                            >
                                {routines.length > 0 ? (
                                    routines.map((routine, index) => (
                                        <Draggable key={routine.id} draggableId={String(routine.id)} index={index}>
                                            {(provided) => (
                                                <li
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                >
                                                    <CardRoutine
                                                        routineName={routine.nombre}
                                                        routineId={routine.id}
                                                        onDelete={handleDeleteRoutine}
                                                        exercises={exercises[routine.id] || []}
                                                    />
                                                </li>
                                            )}
                                        </Draggable>
                                    ))
                                ) : (
                                    <p className='no-routines'></p>
                                )}
                                {provided.placeholder}
                            </ul>
                        )}
                    </Droppable>
                </DragDropContext>

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
