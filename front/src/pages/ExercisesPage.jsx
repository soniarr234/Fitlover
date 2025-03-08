import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CardExercise from '../components/CardExercise';
import '../assets/styles/ExercisesPage.css';
import Navbar from '../components/Navbar';
import CreateExercise from '../components/CreateExercise';

const groupExercisesByLetter = (exercises) => {
    const grouped = {};
    exercises.sort((a, b) => a.nombre.localeCompare(b.nombre)); // Ordenar A-Z

    exercises.forEach((ejercicio) => {
        const firstLetter = ejercicio.nombre.charAt(0).toUpperCase(); // Obtener la primera letra
        if (!grouped[firstLetter]) {
            grouped[firstLetter] = [];
        }
        grouped[firstLetter].push(ejercicio);
    });

    return grouped;
};


const ExercisesPage = () => {
    const [ejercicios, setEjercicios] = useState([]);
    const [filtroTemporal, setFiltroTemporal] = useState([]);
    const [filtroFinal, setFiltroFinal] = useState([]);
    const [popupVisible, setPopupVisible] = useState(false);
    const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 768);

    const navigate = useNavigate();

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

    const fetchEjercicios = () => {
        const token = localStorage.getItem("token");
        axios.get(`${API_URL}/ejercicios`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => setEjercicios(res.data))
            .catch(err => console.error(err));
    };

    useEffect(() => {
        fetchEjercicios();
        const handleResize = () => {
            setIsSmallScreen(window.innerWidth <= 768);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const obtenerMusculos = () => {
        const musculos = ejercicios.flatMap(e => {
            // Asegúrate de que e.musculos sea un array
            return Array.isArray(e.musculos) ? e.musculos.map(m => m.trim()) : [];
        });
        return [...new Set(musculos)].sort((a, b) => a.localeCompare(b));
    };
    

    const contarEjercicios = (musculosSeleccionados) => {
        if (musculosSeleccionados.length === 0) return ejercicios.length;
        return ejercicios.filter(e =>
            musculosSeleccionados.some(m => e.musculos.includes(m))
        ).length;
    };

    const toggleMusculo = (musculo) => {
        setFiltroTemporal(prev =>
            prev.includes(musculo) ? prev.filter(m => m !== musculo) : [...prev, musculo]
        );
    };

    const aplicarFiltro = () => {
        setFiltroFinal(filtroTemporal);
        setPopupVisible(false);
    };

    const cancelarFiltro = () => {
        setFiltroTemporal(filtroFinal);
        setPopupVisible(false);
    };

    const quitarMusculoDelFiltro = (musculo) => {
        // Elimina el músculo del filtro temporal
        const nuevosFiltros = filtroTemporal.filter(m => m !== musculo);
        setFiltroTemporal(nuevosFiltros);

        // Si no quedan filtros, muestra todos los ejercicios
        if (nuevosFiltros.length === 0) {
            setFiltroFinal([]);  // Se muestran todos los ejercicios
        } else {
            setFiltroFinal(nuevosFiltros);  // Muestra solo los ejercicios con los filtros restantes
        }
    };

    // Filtra los ejercicios según los filtros aplicados
    const ejerciciosFiltrados = [...(filtroFinal.length > 0
        ? ejercicios.filter(e =>
            filtroFinal.some(m => e.musculos.includes(m))
        )
        : ejercicios)]
        .sort((a, b) => a.nombre.localeCompare(b.nombre));

    const groupedExercises = groupExercisesByLetter(ejerciciosFiltrados);

    // Función para eliminar un ejercicio de la base de datos
    const handleDelete = (id) => {
        const token = localStorage.getItem("token");
        axios.delete(`${API_URL}/ejercicios/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then((response) => {
                // Si la eliminación fue exitosa, actualizar el estado
                setEjercicios(prevEjercicios => prevEjercicios.filter(e => e.id !== id));
                alert(response.data.message); // Opcional: mostrar un mensaje de éxito
            })
            .catch((err) => {
                console.error(err);
                // Aquí puedes agregar algún manejo de errores, como mostrar un mensaje
            });
    };

    return (
        <>
            <Navbar />
            <div className="exercises-page">
                <h1 className='title-exercises-page'>Listado de Ejercicios</h1>

                {/* Botón para abrir el popup */}
                <button onClick={() => setPopupVisible(true)} className="filter-button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24"><path fill="currentColor" d="M6.532 4.75h6.936c.457 0 .854 0 1.165.03c.307.028.685.095.993.348c.397.326.621.814.624 1.322c.002.39-.172.726-.34.992c-.168.27-.411.59-.695.964l-.031.04l-.01.013l-2.555 3.369c-.252.332-.315.42-.359.51a1.2 1.2 0 0 0-.099.297c-.02.1-.023.212-.023.634v4.243c0 .208 0 .412-.014.578c-.015.164-.052.427-.224.663c-.21.287-.537.473-.9.495c-.302.019-.547-.103-.69-.183c-.144-.08-.309-.195-.476-.31l-.989-.683l-.048-.033c-.191-.131-.403-.276-.562-.477a1.7 1.7 0 0 1-.303-.585c-.071-.244-.07-.5-.07-.738v-2.97c0-.422-.004-.534-.023-.634a1.2 1.2 0 0 0-.1-.297c-.043-.09-.106-.178-.358-.51L4.825 8.459l-.01-.012l-.03-.04c-.284-.375-.527-.695-.696-.965c-.167-.266-.34-.602-.339-.992a1.72 1.72 0 0 1 .624-1.322c.308-.253.686-.32.993-.349c.311-.029.707-.029 1.165-.029m.397 4l1.647 2.17l.035.047c.201.264.361.475.478.715q.154.317.222.665c.051.261.05.527.05.864v2.968c0 .158.001.247.005.314l.006.062a.2.2 0 0 0 .036.073l.041.034c.05.04.12.088.248.176l.941.65V13.21c0-.337 0-.603.051-.864q.068-.347.222-.665c.117-.24.277-.45.478-.715l.035-.046l1.646-2.17zm7.28-1.5c.195-.26.334-.45.43-.604c.08-.126.104-.188.11-.207a.22.22 0 0 0-.057-.134a1 1 0 0 0-.2-.032c-.232-.022-.556-.023-1.06-.023H6.568c-.504 0-.828 0-1.06.023a1 1 0 0 0-.2.032a.22.22 0 0 0-.057.134c.006.019.03.081.11.207c.096.155.235.344.43.604zm1.541 3.25a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 0 1.5h-3a.75.75 0 0 1-.75-.75m-1.5 2.5a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5H15a.75.75 0 0 1-.75-.75m-.5 2.5a.75.75 0 0 1 .75-.75h5a.75.75 0 0 1 0 1.5h-5a.75.75 0 0 1-.75-.75m0 2.5a.75.75 0 0 1 .75-.75H17a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75" /></svg>
                    Filtrar por Músculo
                </button>

                {/* Texto de filtros aplicados en la página principal */}
                <div className="filter-summary">
                    {filtroFinal.length > 0
                        ? (
                            <>
                                <ul>
                                    {filtroFinal.map((musculo, index) => (
                                        <li key={index}>
                                            {musculo}
                                            <svg onClick={() => quitarMusculoDelFiltro(musculo)} className='trash-icon' xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m18 9l-.84 8.398c-.127 1.273-.19 1.909-.48 2.39a2.5 2.5 0 0 1-1.075.973C15.098 21 14.46 21 13.18 21h-2.36c-1.279 0-1.918 0-2.425-.24a2.5 2.5 0 0 1-1.076-.973c-.288-.48-.352-1.116-.48-2.389L6 9m7.5 6.5v-5m-3 5v-5m-6-4h4.615m0 0l.386-2.672c.112-.486.516-.828.98-.828h3.038c.464 0 .867.342.98.828l.386 2.672m-5.77 0h5.77m0 0H19.5" /></svg>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )
                        : <p></p>
                    }
                </div>

                {/* Popup de filtro */}
                {popupVisible && (
                    <div className="popup-overlay">
                        <div className="popup-content">
                            <p className="exercise-count">
                                {filtroTemporal.length > 0
                                    ? `Filtrado: ${contarEjercicios(filtroTemporal)} Ejercicios`
                                    : `Todos los ejercicios: ${ejercicios.length} Ejercicios`}
                            </p>

                            <ul className="muscle-list">
                                {obtenerMusculos().map(musculo => (
                                    <li
                                        key={musculo}
                                        className={filtroTemporal.includes(musculo) ? "selected" : ""}
                                        onClick={() => toggleMusculo(musculo)}
                                    >
                                        {musculo}
                                    </li>
                                ))}
                            </ul>

                            <div className="popup-buttons">
                                <button onClick={aplicarFiltro} className="save-button">Guardar</button>
                                <button onClick={cancelarFiltro} className="cancel-button">Cancelar</button>
                            </div>
                        </div>
                    </div>
                )}

                <CreateExercise onExerciseCreated={fetchEjercicios} />

                <div className="card-container">
                    {Object.keys(groupedExercises).map((letter) => (
                        <div key={letter} className="letter-group">
                            <div className='container-letter'>
                                <div className='separator'></div>
                                <h2 className="letter-title">{letter}</h2>
                                <div className='separator'></div>
                            </div>
                            <div className="exercise-list">
                                {groupedExercises[letter].map((ejercicio) => (
                                    <CardExercise
                                        key={ejercicio.id}
                                        ejercicio={ejercicio}
                                        isInExercisesPage={true}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default ExercisesPage;