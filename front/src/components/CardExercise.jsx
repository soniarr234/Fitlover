import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../assets/styles/CardExercise.css'; // Si tienes estilos

const CardExercise = ({ ejercicio, isInRoutinePage, isInExercisesPage, onDelete, onDeleteFromRoutine, rutinaComenzada }) => {
    const isCardio = typeof ejercicio.musculos === 'string'
    ? ejercicio.musculos.toLowerCase().includes('cardio')
    : Array.isArray(ejercicio.musculos) && ejercicio.musculos.some(musculo => musculo.toLowerCase().includes('cardio'));


    console.log(isCardio, ejercicio.musculos);

    const [observaciones, setObservaciones] = useState(ejercicio.observaciones || '');
    const [isEditing, setIsEditing] = useState(false); // Controlar si está editando las observaciones
    const [showPopup, setShowPopup] = useState(false);
    const [routines, setRoutines] = useState([]); // Estado para almacenar las rutinas

    const [showInputs, setShowInputs] = useState(false);

    const [series, setSeries] = useState([]);
    const [newReps, setNewReps] = useState('');
    const [newPeso, setNewPeso] = useState('');
    const [newVueltas, setNewVueltas] = useState('');
    const [newTiempo, setNewTiempo] = useState('');

    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' o 'error'
    const [showMessagePopup, setShowMessagePopup] = useState(false);

    const [activeIndex, setActiveIndex] = useState(null); // Estado para rastrear el botón activo

    const [showRestPopup, setShowRestPopup] = useState(false);
    const [countdown, setCountdown] = useState(60);

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"

    // Obtener las rutinas desde la base de datos al montar el componente
    useEffect(() => {
        const fetchRoutines = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await axios.get(`${API_URL}/rutinas`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setRoutines(response.data); // Guardar las rutinas en el estado
                } catch (error) {
                    console.error('Error al obtener las rutinas:', error);
                }
            }
        };
        fetchRoutines();
    }, []); // Solo se ejecuta al montar el componente

    const [userId, setUserId] = useState(null); // Estado para almacenar el ID del usuario

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

                if (response.data.id) {
                    setUserId(response.data.id); // Guardamos el ID del usuario
                } else {
                    console.warn("⚠️ El backend no está devolviendo el ID del usuario.");
                }
            } catch (error) {
                console.error("❌ Error al obtener el usuario:", error.response ? error.response.data : error);
            }
        };

        fetchUser();
    }, []);


    useEffect(() => {
        if (userId) { // Verificar que userId tenga valor antes de usarlo
            const storedSeries = JSON.parse(localStorage.getItem('seriesData')) || {};
            if (storedSeries[userId] && storedSeries[userId][ejercicio.id]) {
                setSeries(storedSeries[userId][ejercicio.id]);
            }
        }
    }, [userId, ejercicio.id]); // Agrega userId como dependencia

    useEffect(() => {
        let timer;
        if (showRestPopup && countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        } else if (countdown === 0) {
            setShowRestPopup(false);
            setCountdown(60);
        }
        return () => clearInterval(timer);
    }, [showRestPopup, countdown]);

    const saveSeriesToLocalStorage = (updatedSeries) => {
        if (!userId) return; // Si userId no está definido, no hacer nada

        const storedSeries = JSON.parse(localStorage.getItem('seriesData')) || {};
        storedSeries[userId] = storedSeries[userId] || {};
        storedSeries[userId][ejercicio.id] = updatedSeries;
        localStorage.setItem('seriesData', JSON.stringify(storedSeries));
    };


    const handleAddSerie = () => {
        if (isCardio) {
            // Verificar si las vueltas y el tiempo están completos
            if (newVueltas && newTiempo) {
                const updatedSeries = [...series, { vueltas: newVueltas, tiempo: newTiempo }];
                setSeries(updatedSeries);
                saveSeriesToLocalStorage(updatedSeries); // Guardar en localStorage
                setNewVueltas(''); // Limpiar el campo de vueltas
                setNewTiempo('');  // Limpiar el campo de tiempo
            } else {
                // Mostrar un mensaje de advertencia si falta algún campo
                setMessage('Por favor, completa tanto las vueltas como el tiempo.');
                setMessageType('error');
                setShowMessagePopup(true);
            }
        } else {
            // Si no es cardio, verificar que las repeticiones y peso estén completos
            if (newReps && newPeso) {
                const updatedSeries = [...series, { reps: newReps, peso: newPeso }];
                setSeries(updatedSeries);
                saveSeriesToLocalStorage(updatedSeries); // Guardar en localStorage
                setNewReps(''); // Limpiar el campo de repeticiones
                setNewPeso(''); // Limpiar el campo de peso
            } else {
                // Mostrar un mensaje de advertencia si falta algún campo
                setMessage('Por favor, completa tanto las repeticiones como el peso.');
                setMessageType('error');
                setShowMessagePopup(true);
            }
        }
    
        setShowInputs(false); // Cerrar los campos de entrada después de agregar la serie
    };

    const handleDeleteSerie = (index) => {
        const updatedSeries = series.filter((_, i) => i !== index);
        setSeries(updatedSeries);
        saveSeriesToLocalStorage(updatedSeries);
    };



    // Maneja el cambio de observaciones
    const handleObservacionesChange = (event) => {
        setObservaciones(event.target.value);
    };

    // Función para guardar las observaciones en la base de datos
    const saveObservaciones = async () => {
        const token = localStorage.getItem("token");
        try {
            await axios.put(
                `${API_URL}/ejercicios/${ejercicio.id}`,
                { observaciones },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setIsEditing(false); // Desactivar modo edición una vez que se guardan las observaciones
        } catch (error) {
            console.error('Error al guardar las observaciones:', error);
        }
    };

    const handleAddExercise = async (routineId) => {
        try {
            const token = localStorage.getItem("token");

            // Si no hay token, muestra un mensaje de error
            if (!token) {
                setMessage('Necesitas iniciar sesión.');
                setMessageType('error');
                setShowMessagePopup(true);
                return;
            }

            // Realiza la solicitud POST para agregar el ejercicio a la rutina
            const response = await axios.post(
                `${API_URL}/rutina_ejercicios`,
                {
                    rutina_id: routineId,
                    ejercicio_id: ejercicio.id,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Cierra el popup y muestra mensaje de éxito
            setShowPopup(false);
            setMessage('Ejercicio agregado correctamente.');
            setMessageType('success');
            setShowMessagePopup(true);
        } catch (error) {
            if (error.response && error.response.status === 400) {
                setMessage(error.response.data.message); // Si el error es por ejercicio ya agregado
                setMessageType('error');
            } else {
                console.error('Error al agregar el ejercicio:', error);
                setMessage('Hubo un problema al agregar el ejercicio.');
                setMessageType('error');
            }
            setShowMessagePopup(true);
        }
    };

    const handleSaveSerie = () => {
        if (newReps && newPeso) {
            const updatedSeries = [...series, { reps: newReps, peso: newPeso }];
            setSeries(updatedSeries);
            saveSeriesToLocalStorage(updatedSeries);
            setNewReps(''); // Limpiar los campos de reps y peso
            setNewPeso('');
            setShowInputs(false); // Ocultar los inputs después de guardar
        }
    };

    const handleShowInputs = () => {
        setShowInputs(true);
    };


    return (
        <div className="card-exercise">
            <div className='container-title'>
                <h3>{ejercicio.nombre}</h3>
                {/* Mostrar el botón de eliminar solo en ExercisesPage */}
                {isInExercisesPage ? (
                    <button className='delete-btn' onClick={() => onDelete(ejercicio.id)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="1.8em" height="1.8em" viewBox="0 0 24 24">
                            <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m18 9l-.84 8.398c-.127 1.273-.19 1.909-.48 2.39a2.5 2.5 0 0 1-1.075.973C15.098 21 14.46 21 13.18 21h-2.36c-1.279 0-1.918 0-2.425-.24a2.5 2.5 0 0 1-1.076-.973c-.288-.48-.352-1.116-.48-2.389L6 9m7.5 6.5v-5m-3 5v-5m-6-4h4.615m0 0l.386-2.672c.112-.486.516-.828.98-.828h3.038c.464 0 .867.342.98.828l.386 2.672m-5.77 0h5.77m0 0H19.5" />
                        </svg>
                    </button>
                ) : (
                    // Mostrar el botón de eliminar solo en RoutineDetailsPage
                    isInRoutinePage && (
                        <button className='delete-btn' onClick={() => onDeleteFromRoutine(ejercicio.id)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="1.8em" height="1.8em" viewBox="0 0 24 24">
                                <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m18 9l-.84 8.398c-.127 1.273-.19 1.909-.48 2.39a2.5 2.5 0 0 1-1.075.973C15.098 21 14.46 21 13.18 21h-2.36c-1.279 0-1.918 0-2.425-.24a2.5 2.5 0 0 1-1.076-.973c-.288-.48-.352-1.116-.48-2.389L6 9m7.5 6.5v-5m-3 5v-5m-6-4h4.615m0 0l.386-2.672c.112-.486.516-.828.98-.828h3.038c.464 0 .867.342.98.828l.386 2.672m-5.77 0h5.77m0 0H19.5" />
                            </svg>
                        </button>
                    )
                )}
            </div>

            <p className='text-card'>
                <strong>Músculos ejercitados:</strong> {Array.isArray(ejercicio.musculos) ? ejercicio.musculos.join(', ') : ejercicio.musculos}
            </p>

            {ejercicio.video_o_imagen_url &&
                (ejercicio.video_o_imagen_url.endsWith('.jpg') || ejercicio.video_o_imagen_url.endsWith('.png') || ejercicio.video_o_imagen_url.endsWith('.webp') ? (
                    <img src={ejercicio.video_o_imagen_url} alt={ejercicio.nombre} />
                ) : (
                    <video src={ejercicio.video_o_imagen_url} title={ejercicio.nombre} controls>
                        Tu navegador no soporta este formato de video.
                    </video>
                ))
            }

            <p className='text-card'><strong>Descripción:</strong> {ejercicio.descripcion}</p>

            {/* Sección para añadir series */}
            {isInRoutinePage && (
                <div>
                    <p><strong>Series:</strong></p>
                    {series.length > 0 ? (
                        <ul className='series-section'>
                            {series
                                .filter(serie => (isCardio ? serie.vueltas && serie.tiempo : serie.reps && serie.peso)) // Filtra elementos vacíos
                                .map((serie, index) => (
                                    <div>
                                        <li key={index}>
                                            {isCardio
                                                ? `${serie.vueltas} vueltas / ${serie.tiempo} seg`
                                                : `${serie.reps} reps / ${serie.peso} kg`
                                            }
                                            {/* Botón adicional para cada serie */}
                                            {rutinaComenzada && (
                                                <button
                                                    className={`additional-btn ${activeIndex === index ? 'active' : ''}`}
                                                    onClick={() => setActiveIndex(index)}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="1.3em" height="1.3em" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m12 11l-1 3l1 3h-1.5L9 14l.5-4.5zm1-9L9 6v8l1 3H6l-3 5m17.5 0l-5-3.5L12 17l-1-3l1-3l3.5 2v5.5M14 8.5a1 1 0 1 1 0-2a1 1 0 0 1 0 2m-3 2L10 17v-3.5z" /></svg>
                                                </button>
                                            )}

                                            <button className="delete-serie-btn" onClick={() => handleDeleteSerie(index)}><svg xmlns="http://www.w3.org/2000/svg" width="1.8em" height="1.5em" viewBox="0 0 24 24">
                                                <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m18 9l-.84 8.398c-.127 1.273-.19 1.909-.48 2.39a2.5 2.5 0 0 1-1.075.973C15.098 21 14.46 21 13.18 21h-2.36c-1.279 0-1.918 0-2.425-.24a2.5 2.5 0 0 1-1.076-.973c-.288-.48-.352-1.116-.48-2.389L6 9m7.5 6.5v-5m-3 5v-5m-6-4h4.615m0 0l.386-2.672c.112-.486.516-.828.98-.828h3.038c.464 0 .867.342.98.828l.386 2.672m-5.77 0h5.77m0 0H19.5" />
                                            </svg></button>
                                        </li>
                                        <div className='line'></div>
                                    </div>

                                ))
                            }
                        </ul>
                    ) : (
                        <p className='no-series'>No hay series añadidas</p> // Solo muestra esto si `series` está vacío
                    )}

                    {rutinaComenzada && (
                        <div className='container-button-rest'>
                            {/* Botón "Descanso" solo si la rutina ha comenzado */}
                            {rutinaComenzada && (
                                <button className='button-rest' onClick={() => setShowRestPopup(true)}>Descanso</button>
                            )}

                            {/* Popup de cuenta atrás */}
                            {showRestPopup && (
                                <div className="popup-descanso">
                                    <p className="countdown">Descanso: {countdown} segundos</p>
                                    <button onClick={() => setShowRestPopup(false)}>Cerrar</button>
                                </div>
                            )}
                        </div>
                    )}
                    <div>
                        {!showInputs ? (
                            <button className='button-add-series' onClick={() => setShowInputs(true)}>Añadir Serie</button>
                        ) : (
                            <div>
                                {isCardio ? (
                                    <form className='form-add-series'>
                                        <div>
                                            <input type="text" placeholder="Vueltas" value={newVueltas} onChange={(e) => setNewVueltas(e.target.value)} />
                                            <input type="text" placeholder="Tiempo (seg)" value={newTiempo} onChange={(e) => setNewTiempo(e.target.value)} />
                                        </div>
                                    </form>
                                ) : (
                                    <form className='form-add-series'>
                                        <div>
                                            <input type="text" placeholder="Reps" value={newReps} onChange={(e) => setNewReps(e.target.value)} />
                                            <input type="text" placeholder="Peso (kg)" value={newPeso} onChange={(e) => setNewPeso(e.target.value)} />
                                        </div>
                                    </form>
                                )}
                                <div className='container-button-save-series'>
                                    <button className='button-save-series' onClick={handleAddSerie}>Guardar</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}


            {/* Observaciones */}
            <div className="observations-section">
                <p className='text-card'><strong>Observaciones:</strong></p>
                {isEditing ? (
                    <div>
                        <textarea
                            value={observaciones}
                            onChange={handleObservacionesChange}
                            rows="4"
                            cols="50"
                            className='observation-textarea'
                        />
                        <button className='save-observation' onClick={saveObservaciones}>Guardar observaciones</button>
                    </div>
                ) : (
                    <div>
                        <p className='text-card'>{observaciones || 'No hay observaciones'}</p>
                        <button className='edit-observation' onClick={() => setIsEditing(true)}>Editar observaciones</button>
                    </div>
                )}
            </div>

            {!isInRoutinePage && (
                <button className='add-exercise' onClick={() => setShowPopup(true)}>Añadir ejercicio</button>
            )}
            {showPopup && (
                <div className="popup-overlay">
                    <div className="popup">
                        <h2>Selecciona una Rutina</h2>
                        <ul className='popup-routines'>
                            {routines.length > 0 ? (
                                routines.map((routine) => (
                                    <li className='popup-rutine' key={routine.id} onClick={() => handleAddExercise(routine.id)}>
                                        {routine.nombre}
                                    </li>
                                ))
                            ) : (
                                <p className='text-card'>No tienes rutinas disponibles</p>
                            )}
                        </ul>
                        <button onClick={() => setShowPopup(false)}>Cancelar</button>
                    </div>
                </div>
            )}

            {/* Popup de mensajes */}
            {showMessagePopup && (
                <div className={`message-popup ${messageType}`}>
                    <p className='text-card'>{message}</p>
                    <button className='close-button' onClick={() => setShowMessagePopup(false)}>Cerrar</button>
                </div>
            )}
        </div>
    );
};

export default CardExercise;