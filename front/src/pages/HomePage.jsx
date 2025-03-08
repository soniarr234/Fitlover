import React from 'react';
import '../assets/styles/HomePage.css';
import Navbar from '../components/Navbar';

function HomePage() {
  return (
    <div className='Home'>
      <Navbar />
      <div className="motivational-text">
        <h1>“Anything is possible, I don't think limits”</h1>
      </div>
    </div>
  );
}

export default HomePage;
