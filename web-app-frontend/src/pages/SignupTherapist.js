import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { signupTherapist } from '../redux/slices/userSlice'; // Import therapist signup action
import { useNavigate } from 'react-router-dom';
import '../styles/Components.css'; // Import component-specific styles

const SignupTherapist = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [qualifications, setQualifications] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { status, error } = useSelector((state) => state.user);

  useEffect(() => {
    if (status === 'succeeded') {
      navigate('/dashboard'); // Navigate to dashboard on successful signup
    }
  }, [status, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(signupTherapist({ name, email, password, qualifications })); // Dispatch therapist signup action
  };

  return (
    <div className="signup-therapist-container">
      <form onSubmit={handleSubmit} className="signup-form">
        <h2 className="form-title">Signup as a Therapist</h2>
        
        {status === 'loading' && <p>Signing up...</p>}
        {status === 'failed' && <p className="error-message">{error}</p>}

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
