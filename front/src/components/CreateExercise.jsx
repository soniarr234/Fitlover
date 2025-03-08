import React, { useState } from 'react';
import axios from 'axios';
import '../assets/styles/CardExercise.css';

const MUSCLES = [
    "Abdomen",
    "Bíceps",
    "Cardio",
    "Espalda",
    "Hombros",
    "Pecho",
    "Piernas",
    "Tríceps", 
    "Cuerpo completo"
];

const CreateExercise = ({ onClose, onExerciseCreated }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        musculos: [],
        descripcion: '',
        observaciones: '',
        video_o_imagen_url: ''
    });

    const [showPopup, setShowPopup] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Maneja la selección de músculos, permitiendo múltiples valores
    const handleMuscleSelect = (muscle) => {
        setFormData((prevState) => {
            const alreadySelected = prevState.musculos.includes(muscle);
            return {
                ...prevState,
                musculos: alreadySelected
                    ? prevState.musculos.filter(m => m !== muscle) // Si ya está, lo quita
                    : [...prevState.musculos, muscle] // Si no está, lo agrega
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");

            const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"

            await axios.post(`${API_URL}/ejercicios`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setShowPopup(true); // Muestra el popup
            setTimeout(() => window.location.reload(), 2000); // Refresca después de 2s
        } catch (error) {
            console.error('Error al crear el ejercicio:', error);
        }
    };

    return (
        <>
            <div className="overlay" onClick={onClose}></div> {/* Fondo borroso */}
            <div className="create-exercise">
                <h2>Crear Nuevo Ejercicio</h2>
                <form onSubmit={handleSubmit}>
                    <input type="text" name="nombre" placeholder="Nombre" value={formData.nombre} onChange={handleChange} required />
                    {/* Selector de múltiples músculos */}
                    <div className="custom-select">
                        <div className="select-box" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                            {formData.musculos.length > 0 ? formData.musculos.join(", ") : "Selecciona músculos"}
                        </div>
                        {isDropdownOpen && (
                            <ul className="select-dropdown">
                                {MUSCLES.map((muscle, index) => (
                                    <li
                                        key={index}
                                        onClick={() => handleMuscleSelect(muscle)}
                                        className={formData.musculos.includes(muscle) ? "selected" : ""}
                                    >
                                        {muscle} {formData.musculos.includes(muscle) && "✔"}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <textarea name="descripcion" placeholder="Descripción" value={formData.descripcion} onChange={handleChange} required />
                    <textarea name="observaciones" placeholder="Observaciones" value={formData.observaciones} onChange={handleChange} />
                    <input type="text" name="video_o_imagen_url" placeholder="URL de imagen/video" value={formData.video_o_imagen_url} onChange={handleChange} />
                    <div className='container-buttons'>
                        <button type="submit">Guardar Ejercicio</button>
                        <button type="button" onClick={onClose}>Cancelar</button>
                    </div>
                </form>
                {showPopup && (
                    <div className="text-create-exercise-success">
                        <p>¡Ejercicio creado con éxito!</p>
                    </div>
                )}
            </div>
        </>
    );
};

const ExerciseList = () => {
    const [showForm, setShowForm] = useState(false);

    return (
        <div>
            <button className="create-exercise-button" onClick={() => setShowForm(true)}>+</button>
            {showForm && <CreateExercise onClose={() => setShowForm(false)} onExerciseCreated={() => { }} />}
        </div>
    );
};

export default ExerciseList;
