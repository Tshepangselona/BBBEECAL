import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const [isAdmin, setIsAdmin] = useState(null); // State to track Admin/Client toggle (null = no choice)
  const navigate = useNavigate(); // Hook for programmatic navigation

  // Effect to navigate after a choice is made
  useEffect(() => {
    if (isAdmin !== null) {
      navigate(isAdmin ? '/AdminSignUp' : '/SignUp');
    }
  }, [isAdmin, navigate]);

  // Handle toggle change
  const handleToggle = (admin) => {
    setIsAdmin(admin); // Set isAdmin to true (Admin) or false (Client)
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {/* Toggle Switch */}
      <div className="flex items-center gap-2 rounded-full overflow-hidden">
        <button
          onClick={() => handleToggle(false)}
          className={`px-4 py-2 font-medium transition-colors ${
            isAdmin === false
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 hover:bg-blue-400 text-gray-700 hover:text-white'
          }`}
        >
          Client
        </button>
        <button
          onClick={() => handleToggle(true)}
          className={`px-4 py-2 font-medium transition-colors ${
            isAdmin === true
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-blue-400 hover:text-white'
          }`}
        >
          Admin
        </button>
      </div>
    </div>
  );
};

export default LandingPage;