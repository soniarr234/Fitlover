import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Para acceder a los parámetros de la URL
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CardExercise from '../components/CardExercise';
import Navbar from '../components/Navbar';
import '../assets/styles/RoutineDetailsPage.css';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"; // Utilizamos la variable de entorno


const RoutineDetailsPage = () => {
    const { id } = useParams(); // Obtener el id de la rutina desde los parámetros de la URL
    const [rutina, setRutina] = useState(null);
    const [ejercicios, setEjercicios] = useState([]);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' o 'error'
    const [showMessagePopup, setShowMessagePopup] = useState(false);
    const navigate = useNavigate();

    const [usuario, setUsuario] = useState(null); // Nuevo estado para el usuario

    const [rutinaComenzada, setRutinaComenzada] = useState(false);

    const handleStartRoutine = () => {
        setRutinaComenzada(true); // Cambia el estado a verdadero
    };

    // Función para detener la rutina
    const handleStopRoutine = () => {
        setRutinaComenzada(false); // Cambiar el estado de la rutina a detenida
    };

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("No hay token en el localStorage");
                return;
            }

            try {
                const response = await axios.get(`${API_URL}/usuario`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setUsuario(response.data); // Guarda los datos del usuario en el estado
            } catch (error) {
                console.error("Error al obtener el usuario:", error.response ? error.response.data : error);
            }
        };

        fetchUser();
    }, []);


    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Obtener los detalles de la rutina
            axios.get(`${API_URL}/rutinas/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(response => {
                    setRutina(response.data); // Guardamos los datos de la rutina
                })
                .catch(error => {
                    console.error('Error al obtener la rutina:', error);
                    setError('Error al cargar los detalles de la rutina.');
                });

            // Obtener los ejercicios de la rutina
            axios.get(`${API_URL}/rutina_ejercicios/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(response => {
                    setEjercicios(response.data); // Guardamos los ejercicios
                })
                .catch(error => {
                    console.error('Error al obtener los ejercicios:', error);
                    setError('Error al cargar los ejercicios.');
                });
        } else {
            setError('Necesitas iniciar sesión para ver esta información.');
        }
    }, [id]);

    // Eliminar ejercicio de la rutina
    const handleDeleteExercise = async (ejercicioId) => {
        try {
            const token = localStorage.getItem("token");

            // Si no hay token, muestra un mensaje de error
            if (!token) {
                setMessage('Necesitas iniciar sesión.');
                setMessageType('error');
                setShowMessagePopup(true);
                return;
            }

            // Realiza la solicitud DELETE para eliminar el ejercicio de la rutina
            const response = await axios.delete(
                `${API_URL}/rutina_ejercicios`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    data: { rutina_id: rutina.id, ejercicio_id: ejercicioId }
                }
            );

            // Muestra mensaje de éxito y actualiza la lista de ejercicios
            setMessage('Ejercicio eliminado correctamente de la rutina.');
            setMessageType('success');
            setShowMessagePopup(true);

            // Elimina el ejercicio de la lista en el estado
            setEjercicios(ejercicios.filter(ejercicio => ejercicio.id !== ejercicioId));
        } catch (error) {
            console.error('Error al eliminar el ejercicio:', error);
            setMessage('Hubo un problema al eliminar el ejercicio.');
            setMessageType('error');
            setShowMessagePopup(true);
        }
    };

    const handleAddExercises = (event) => {
        event.stopPropagation();
        navigate(`/ejercicios/`);
    };

    const actualizarOrdenEjercicios = async (nuevaListaOrdenada) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("No hay token en el localStorage");
                return;
            }

            const response = await axios.put(`${API_URL}/rutina_ejercicios/orden`, {
                rutina_id: id,
                ejercicios: nuevaListaOrdenada
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // 🔄 Volver a obtener la lista actualizada del backend
            const updatedResponse = await axios.get(`${API_URL}/rutina_ejercicios/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setEjercicios(updatedResponse.data);

        } catch (error) {
            console.error("❌ [FRONT] Error al actualizar el orden:", error);
        }
    };

    const onDragEnd = (result) => {
        if (!result.destination) return;

        const nuevaListaOrdenada = Array.from(ejercicios);
        const [reordenado] = nuevaListaOrdenada.splice(result.source.index, 1);
        nuevaListaOrdenada.splice(result.destination.index, 0, reordenado);

        // Asigna el nuevo orden basado en la posición en el array
        const ejerciciosConOrden = nuevaListaOrdenada.map((ejercicio, index) => ({
            id: ejercicio.id,
            orden: index + 1
        }));
        actualizarOrdenEjercicios(ejerciciosConOrden);
        setEjercicios(nuevaListaOrdenada);
    };

    return (
        <>
            <Navbar />
            <div className='routine-details-page'>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {rutina && (
                    <div className='container-routine-details'>
                        <h1 className='title-routine-details-page'>{rutina.nombre}</h1>
                        {/* Si la rutina no ha comenzado, mostramos el botón de "Comenzar rutina" */}
                        {!rutinaComenzada && (
                            <button className='start-routine-button' onClick={handleStartRoutine}>Comenzar rutina</button>
                        )}

                        {/* Si la rutina ya ha comenzado, mostramos el botón de "Parar rutina" */}
                        {rutinaComenzada && (
                            <button className='stop-routine-button' onClick={handleStopRoutine}>Parar rutina</button>
                        )}
                        {ejercicios.length > 0 ? (
                            <DragDropContext onDragEnd={onDragEnd}>
                                <Droppable droppableId="ejercicios">
                                    {(provided) => (
                                        <ul className="container-exercises-routine" ref={provided.innerRef} {...provided.droppableProps}>
                                            {ejercicios.map((ejercicio, index) => (
                                                <Draggable key={ejercicio.id} draggableId={ejercicio.id.toString()} index={index}>
                                                    {(provided) => (
                                                        <li ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                                            <CardExercise
                                                                ejercicio={ejercicio}
                                                                userId={usuario ? usuario.id : null}
                                                                isInRoutinePage={true}
                                                                repeticiones={ejercicio.repeticiones}
                                                                peso={ejercicio.peso}
                                                                isInExercisesPage={false}
                                                                onDeleteFromRoutine={handleDeleteExercise}
                                                                rutinaComenzada={rutinaComenzada}
                                                            />
                                                        </li>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </ul>
                                    )}
                                </Droppable>
                            </DragDropContext>
                        ) : (
                            <p>No hay ejercicios en esta rutina.</p>
                        )}
                    </div>
                )}
                {/* Popup de mensajes */}
                {showMessagePopup && (
                    <div className={`message-popup ${messageType}`}>
                        <p>{message}</p>
                        <button className='close-button' onClick={() => setShowMessagePopup(false)}>Cerrar</button>
                    </div>
                )}

                <button className="routine-add-exercises-button" onClick={handleAddExercises}>
                    Añadir ejercicios
                </button>
            </div>
        </>
    );
};

export default RoutineDetailsPage;