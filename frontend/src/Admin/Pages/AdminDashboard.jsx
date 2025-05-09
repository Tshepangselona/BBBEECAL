import React, { useEffect, useState } from 'react';
import AdminNavBar from '../AdminNavBar';
import { FaUsers, FaChartLine, FaComments, FaCog } from 'react-icons/fa';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalClients: 0,
    activeChats: 0,
    growthRate: 0,
    pendingActions: 0
  });

  useEffect(() => {
    // Simulate fetching stats from an API
    const fetchStats = async () => {
      // In a real app, you would fetch these from your backend
      try {
        // Mock data - replace with actual API calls
        const mockStats = {
          totalClients: 1245,
          activeChats: 28,
          growthRate: 12.5,
          pendingActions: 5
        };
        setStats(mockStats);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <AdminNavBar />
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Admin Portal Overview</h2>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            icon={<FaUsers className="text-blue-500 text-2xl" />}
            title="Total Clients"
            value={stats.totalClients}
            change={stats.growthRate}
            isPositive={stats.growthRate >= 0}
          />
          <StatCard 
            icon={<FaComments className="text-green-500 text-2xl" />}
            title="Active Chats"
            value={stats.activeChats}
          />
          <StatCard 
            icon={<FaChartLine className="text-purple-500 text-2xl" />}
            title="Growth Rate"
            value={`${stats.growthRate}%`}
            isPositive={stats.growthRate >= 0}
          />
          <StatCard 
            icon={<FaCog className="text-yellow-500 text-2xl" />}
            title="Pending Actions"
            value={stats.pendingActions}
          />
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <ActivityItem 
              time="10 minutes ago"
              action="New client registered"
              details="John Doe signed up for services"
            />
            <ActivityItem 
              time="25 minutes ago"
              action="Chat initiated"
              details="Sarah Smith started a new conversation"
            />
            <ActivityItem 
              time="1 hour ago"
              action="Profile updated"
              details="Michael Johnson updated business information"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickAction 
              title="Manage Clients"
              link="/Clients"
              color="bg-blue-100 text-blue-600"
            />
            <QuickAction 
              title="View Analytics"
              link="/Charts"
              color="bg-green-100 text-green-600"
            />
            <QuickAction 
              title="Check Messages"
              link="/chats"
              color="bg-purple-100 text-purple-600"
            />
            <QuickAction 
              title="System Settings"
              link="/settings"
              color="bg-yellow-100 text-yellow-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon, title, value, change, isPositive }) => (
  <div className="bg-white rounded-lg shadow p-6 flex items-start">
    <div className="mr-4 p-2 rounded-full bg-gray-100">
      {icon}
    </div>
    <div>
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
      {change !== undefined && (
        <p className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? '↑' : '↓'} {change}
        </p>
      )}
    </div>
  </div>
);

// Activity Item Component
const ActivityItem = ({ time, action, details }) => (
  <div className="border-b pb-3 last:border-0 last:pb-0">
    <div className="flex justify-between items-start">
      <div>
        <p className="font-medium">{action}</p>
        <p className="text-gray-600 text-sm">{details}</p>
      </div>
      <span className="text-gray-400 text-sm whitespace-nowrap">{time}</span>
    </div>
  </div>
);

// Quick Action Component
const QuickAction = ({ title, link, color }) => (
  <a 
    href={link}
    className={`${color} rounded-lg p-4 text-center font-medium hover:shadow-md transition-shadow`}
  >
    {title}
  </a>
);

export default AdminDashboard;