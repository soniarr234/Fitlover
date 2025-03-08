import React, { useState, useEffect, useRef } from 'react';
import '../assets/styles/Navbar.css';
import logo from '../assets/images/logo.png';
import { FaBars, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [popupOpen, setPopupOpen] = useState(false);
    const [usuario, setUsuario] = useState(null);
    const menuRef = useRef(null);
    const userMenuRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000" // Usar la variable de entorno

        fetch(`${API_URL}/usuario`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.nombre && data.email) {
                    setUsuario(data);
                }
            })
            .catch(error => console.error("Error obteniendo usuario:", error));
    }, []);

    const toggleMenu = () => setMenuOpen(!menuOpen);
    const toggleUserMenu = () => setUserMenuOpen(!userMenuOpen);
    const handleLogout = () => {
        localStorage.removeItem("token");
        window.dispatchEvent(new Event("storage"));
        navigate("/login");
    };

    useEffect(() => {
        if (popupOpen) {
            document.body.classList.add("body-blur");
        } else {
            document.body.classList.remove("body-blur");
        }
    }, [popupOpen]);
    const openPopup = () => setPopupOpen(true);
    const closePopup = () => setPopupOpen(false);

    useEffect(() => {
        const handleClickOutside = (event) => {
            // Cerrar menú de usuario si el clic es fuera de su área
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setUserMenuOpen(false);
            }
            // Cerrar el menú lateral si el clic es fuera de su área
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };

        // Agregar event listener al hacer clic en cualquier parte
        document.addEventListener('mousedown', handleClickOutside);

        // Limpiar el event listener al desmontar el componente
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <nav className="navbar">
            <a href="/"><img src={logo} alt="Logo del gimnasio" className="navbar-logo" /></a>
            <div className="navbar-menu-icon" onClick={toggleMenu}>
                {menuOpen ? <FaTimes /> : <FaBars />}
            </div>
            <ul ref={menuRef} className={`navbar-links ${menuOpen ? 'navbar-links--active' : ''}`}>
                <li className="navbar-link"><a href="/">Home</a></li>
                <li className="navbar-link"><a href="/ejercicios">Ejercicios</a></li>
                <li className="navbar-link"><a href="/rutinas">Rutinas</a></li>
                <li className="navbar-link" ref={userMenuRef} onClick={toggleUserMenu}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M19.9 12.66a1 1 0 0 1 0-1.32l1.28-1.44a1 1 0 0 0 .12-1.17l-2-3.46a1 1 0 0 0-1.07-.48l-1.88.38a1 1 0 0 1-1.15-.66l-.61-1.83a1 1 0 0 0-.95-.68h-4a1 1 0 0 0-1 .68l-.56 1.83a1 1 0 0 1-1.15.66L5 4.79a1 1 0 0 0-1 .48L2 8.73a1 1 0 0 0 .1 1.17l1.27 1.44a1 1 0 0 1 0 1.32L2.1 14.1a1 1 0 0 0-.1 1.17l2 3.46a1 1 0 0 0 1.07.48l1.88-.38a1 1 0 0 1 1.15.66l.61 1.83a1 1 0 0 0 1 .68h4a1 1 0 0 0 .95-.68l.61-1.83a1 1 0 0 1 1.15-.66l1.88.38a1 1 0 0 0 1.07-.48l2-3.46a1 1 0 0 0-.12-1.17ZM18.41 14l.8.9l-1.28 2.22l-1.18-.24a3 3 0 0 0-3.45 2L12.92 20h-2.56L10 18.86a3 3 0 0 0-3.45-2l-1.18.24l-1.3-2.21l.8-.9a3 3 0 0 0 0-4l-.8-.9l1.28-2.2l1.18.24a3 3 0 0 0 3.45-2L10.36 4h2.56l.38 1.14a3 3 0 0 0 3.45 2l1.18-.24l1.28 2.22l-.8.9a3 3 0 0 0 0 3.98m-6.77-6a4 4 0 1 0 4 4a4 4 0 0 0-4-4m0 6a2 2 0 1 1 2-2a2 2 0 0 1-2 2" />
                    </svg>
                </li>
                {userMenuOpen && (
                    <div className="user-menu" ref={userMenuRef}>
                        <div className='container-name'>
                            {usuario && <h1>{usuario.nombre}</h1>}
                            {usuario && <h1> {usuario.apellidos}</h1>}
                        </div>
                        {usuario && <h4>{usuario.email}</h4>}
                        <div className='separator'></div>
                        <div className='user-menu-item' onClick={openPopup}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="9" r="3" /><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M17.97 20c-.16-2.892-1.045-5-5.97-5s-5.81 2.108-5.97 5" /></g></svg>
                            <p>Cuenta</p>
                        </div>
                        <div className='user-menu-item' onClick={openPopup}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 48 48"><g fill="none"><path stroke="currentColor" strokeLinejoin="round" strokeWidth="4" d="M24 44a19.94 19.94 0 0 0 14.142-5.858A19.94 19.94 0 0 0 44 24a19.94 19.94 0 0 0-5.858-14.142A19.94 19.94 0 0 0 24 4A19.94 19.94 0 0 0 9.858 9.858A19.94 19.94 0 0 0 4 24a19.94 19.94 0 0 0 5.858 14.142A19.94 19.94 0 0 0 24 44Z" /><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M24 28.625v-4a6 6 0 1 0-6-6" /><path fill="currentColor" fillRule="evenodd" d="M24 37.625a2.5 2.5 0 1 0 0-5a2.5 2.5 0 0 0 0 5" clipRule="evenodd" /></g></svg>
                            <p>Ayuda y soporte</p>
                        </div>
                        <div className='user-menu-item' onClick={openPopup}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 24 24"><path fill="currentColor" d="M4 8a8 8 0 1 1 16 0v4.697l2 3V20h-5.611a4.502 4.502 0 0 1-8.777 0H2v-4.303l2-3zm5.708 12a2.5 2.5 0 0 0 4.584 0zM12 2a6 6 0 0 0-6 6v5.303l-2 3V18h16v-1.697l-2-3V8a6 6 0 0 0-6-6" /></svg>
                            <p>Notificaciones</p>
                        </div>
                        <button onClick={handleLogout}>Cerrar Sesión</button>
                    </div>
                )}
            </ul>
            {popupOpen && (
                <div className="container-popup-under-repair" onClick={closePopup}>
                    <div className="popup-under-repair" onClick={(e) => e.stopPropagation()}>
                        <h2>Página en reparación</h2>
                        <svg xmlns="http://www.w3.org/2000/svg" width="4em" height="4em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" color="currentColor"><path d="M11 11L6 6M5 7.5L7.5 5l-3-1.5l-1 1zm14.975 1.475a3.5 3.5 0 0 0 .79-3.74l-1.422 1.422h-2v-2l1.422-1.422a3.5 3.5 0 0 0-4.529 4.53l-6.47 6.471a3.5 3.5 0 0 0-4.53 4.529l1.421-1.422h2v2l-1.422 1.422a3.5 3.5 0 0 0 4.53-4.528l6.472-6.472a3.5 3.5 0 0 0 3.738-.79" /><path d="m11.797 14.5l5.604 5.604a1.35 1.35 0 0 0 1.911 0l.792-.792a1.35 1.35 0 0 0 0-1.911L14.5 11.797" /></g></svg>
                        <button onClick={closePopup}>Cerrar</button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
