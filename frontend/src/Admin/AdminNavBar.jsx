import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const AdminNavBar = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check for authToken to ensure user is logged in
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/AdminLogIn');
      return;
    }

    // Try to get email from location.state
    const userData = location.state?.userData;
    if (userData?.businessEmail) {
      setEmail(userData.businessEmail);
    } else {
      // Fallback: Fetch profile data if state is missing
      const fetchProfile = async () => {
        try {
          const uid = userData?.uid; // Ensure uid is available
          if (!uid) throw new Error('User ID not found');

          const res = await fetch(`http://localhost:5000/get-profile?uid=${uid}`, {
            headers: { Authorization: `Bearer ${token}` }, // Include token if required by backend
          });
          const data = await res.json();

          if (!res.ok) throw new Error(data.error || 'Failed to fetch profile');

          setEmail(data.businessEmail || '');
        } catch (err) {
          console.error('Error fetching profile:', err.message);
          setError('Unable to load user information');
        }
      };

      if (userData?.uid) {
        fetchProfile();
      } else {
        setError('User information not available');
      }
    }
  }, [location.state, navigate]);

  const handleLogout = () => {
    // Clear authToken from localStorage
    localStorage.removeItem('authToken');
    // Redirect to login page
    navigate('/AdminLogIn');
  };

  return (
    <nav className="bg-gray-800 p-4 flex justify-between items-center">
      <div className="text-white text-lg font-semibold">Admin Portal</div>
      <div className="flex items-center space-x-4">
        {error ? (
          <p className="text-red-400">{error}</p>
        ) : (
          <p className="text-white">Logged in as: <span className="font-semibold">{email || 'Loading...'}</span></p>
        )}
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Log Out
        </button>
      </div>
    </nav>
  );
};

export default AdminNavBar;