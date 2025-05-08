import React from 'react';
import AdminNavBar from '../AdminNavBar';

const AdminDashboard = () => {
  return (
    <div>
      <AdminNavBar />
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
        <p className="text-lg">Welcome to the Admin Dashboard!</p>
        {/* Add more dashboard content here as needed */}
      </div>
    </div>
  );
};

export default AdminDashboard;