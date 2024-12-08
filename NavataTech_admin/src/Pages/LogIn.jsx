import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../Style/Login.css"

const LogIn = ({ setIsAuthenticated }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [logging, setLogging] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLogging(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_SERVERAPI}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log('API response:', data); // Log API response

      if (response.ok) { // Check if response is successful
        console.log('Logged in as admin:', data);
        localStorage.setItem('token', data.access_token);
        const expirationTime = Date.now() + (60 * 60 * 1000); // 1 hour
        localStorage.setItem('expiration', expirationTime);
        
        setIsAuthenticated(true); // Set authenticated state to true
        console.log('Authentication state set to true');
        navigate('/invoices');
      } else {
        setError(data.message || 'Login failed');
        console.error('Login failed with status:', response.status);
      }
    } catch (error) {
      setError('Error logging in. Please try again.');
      console.error('Login error:', error); // Log the error
    } finally {
      setLogging(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2 className="text-center">Admin Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className={`submit-btn ${logging ? 'loading' : ''}`} disabled={logging}>
            {logging ? 'Logging in...' : 'Log In'}
          </button>
          {error && <p className="error">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default LogIn;
