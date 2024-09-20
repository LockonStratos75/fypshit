import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { signupAdmin } from '../redux/slices/userSlice'; // Import admin signup action
import { useNavigate } from 'react-router-dom';
import '../styles/Components.css'; // Import your styles

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.user);

  useEffect(() => {
    if (status === 'succeeded') {
      navigate('/dashboard');
    }
  }, [status, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(signupAdmin({ username, email, password })); // Dispatch admin signup
  };

  return (
    <div className="signup-container">
      <form onSubmit={handleSubmit} className="signup-form">
        <h2 className="form-title">Signup as Admin</h2>

        {status === 'loading' && <p>Signing up...</p>}
        {status === 'failed' && <p className="error-message">{error}</p>}

        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
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
        <button type="submit" className="form-button">Signup</button>
      </form>
    </div>
  );
};

export default Signup;
