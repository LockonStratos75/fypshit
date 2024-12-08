// src/pages/Home.js

import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/home.css'; // Import your home-specific CSS
import logo from '../assets/Eunoia.png'; // Path to your logo image
import backgroundImage from '../assets/home_bg.gif'; // Path to your GIF file

const Home = () => {
  return (
    <section className="homeSection">
      {/* Background GIF Image */}
      <img src={backgroundImage} alt="Background GIF" className="backgroundGif" />

      {/* Logo at the top center */}
      <div className="logoImage">
        <Link to="/">
          <img alt="EUNOIA Logo" src={logo} />
        </Link>
      </div>

      {/* Main content centered vertically */}
      <div className="backgroundContainer">
        <h1 className="mainHeading">Welcome to EUNOIA</h1>
        <p className="subHeading">
          Empowering mental health professionals with advanced analytics
        </p>
        <p className="subHeadingLight">
          EUNOIA provides cutting-edge tools to help professionals elevate mental health care.
          Start now to explore the features!
        </p>
        <Link to="/login" className="getStarted">
          Get Started
          <svg
            className="svgIcon"
            width="19"
            height="20"
            viewBox="0 0 19 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* SVG Content */}
            <path
              d="M19 1.5C19 0.947716 18.5523 0.500001 18 0.5L9 0.500001C8.44771 0.500001 8 0.947716 8 1.5C8 2.05229 8.44771 2.5 9 2.5L17 2.5L17 10.5C17 11.0523 17.4477 11.5 18 11.5C18.5523 11.5 19 11.0523 19 10.5L19 1.5ZM1.70711 19.2071L18.7071 2.20711L17.2929 0.792894L0.292893 17.7929L1.70711 19.2071Z"
              fill="white"
            />
          </svg>
        </Link>
      </div>
    </section>
  );
};

export default Home;
