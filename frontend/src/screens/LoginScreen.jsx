import React, { useState } from 'react';
import { useSession, PHASES } from '../SessionContext';
import { loginUser, getCurrentUser } from '../api';

const LoginScreen = () => {
  const { setPhase, login } = useSession();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const tokenData = await loginUser(formData);
      
      // Fetch user details using the token
      const user = await getCurrentUser(tokenData.access_token);
      
      login(tokenData.access_token, user);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Welcome Back</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <div className="flex items-center justify-between mt-6">
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Logging In...' : 'Log In'}
            </button>
          </div>
        </form>
        
        <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button 
                    onClick={() => setPhase(PHASES.REGISTER)}
                    className="text-blue-500 hover:text-blue-700 font-bold"
                >
                    Sign Up
                </button>
            </p>
            <p className="text-sm text-gray-600 mt-2">
                <button 
                    onClick={() => setPhase(PHASES.SETUP)}
                    className="text-gray-500 hover:text-gray-700 underline"
                >
                    Continue as Guest
                </button>
            </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;

