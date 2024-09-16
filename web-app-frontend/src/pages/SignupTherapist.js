// frontend/src/pages/SignupTherapist.js
import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import '../styles/Components.css'; // Import component-specific styles

const SignupTherapist = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [qualifications, setQualifications] = useState('');
  const { signup } = useContext(AuthContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    signup({ name, email, password, qualifications });
  };

  return (
    <div className="signup-therapist-container">
      <form onSubmit={handleSubmit} className="signup-form">
        <h2 className="form-title">Signup as a Therapist</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full Name"
          required
          className="form-input"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="form-input"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="form-input"
        />
        <textarea
          value={qualifications}
          onChange={(e) => setQualifications(e.target.value)}
          placeholder="Qualifications"
          required
          className="form-textarea"
        />
        <button type="submit" className="form-button">Signup</button>
      </form>
    </div>
  );
};

export default SignupTherapist;
