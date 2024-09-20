import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../redux/slices/userSlice';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const { user, status, error } = useSelector((state) => state.user);

  useEffect(() => {
    if (status === 'succeeded' && user) {
      navigate('/dashboard');
    }
  }, [status, user, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser(credentials));
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2 className="form-title">Login</h2>

        {status === 'failed' && <p className="login-error">Error: {error}</p>}
        {status === 'loading' && <p>Loading...</p>}

        <input
          type="email"
          value={credentials.email}
          onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
          placeholder="Email"
          className="form-input"
          required
        />
        <input
          type="password"
          value={credentials.password}
          onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
          placeholder="Password"
          className="form-input"
          required
        />
        <button type="submit" className="form-button">Login</button>
      </form>
    </div>
  );
};

export default Login;
