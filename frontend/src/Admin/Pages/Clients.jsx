import React, { useState, useEffect } from 'react';
import AdminNavBar from '../AdminNavBar';
import { FaSearch, FaUserPlus, FaFilter, FaEdit, FaTrash, FaUserCircle } from 'react-icons/fa';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch clients
    const fetchClients = async () => {
      try {
        // Mock data - replace with actual API call
        const mockClients = [
          { id: 1, name: 'John Smith', email: 'john@example.com', status: 'Active', lastActive: '2023-05-15' },
          { id: 2, name: 'Sarah Johnson', email: 'sarah@example.com', status: 'Active', lastActive: '2023-05-14' },
          { id: 3, name: 'Michael Brown', email: 'michael@example.com', status: 'Inactive', lastActive: '2023-04-20' },
          { id: 4, name: 'Emily Davis', email: 'emily@example.com', status: 'Active', lastActive: '2023-05-12' },
          { id: 5, name: 'Robert Wilson', email: 'robert@example.com', status: 'Pending', lastActive: '2023-05-10' },
        ];
        setClients(mockClients);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching clients:', error);
        setIsLoading(false);
      }
    };

    fetchClients();
  }, []);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id) => {
    // Confirm before deleting
    if (window.confirm('Are you sure you want to delete this client?')) {
      setClients(clients.filter(client => client.id !== id));
    }
  };

  return (
    <div>
      <AdminNavBar />
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Client Management</h2>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center">
            <FaUserPlus className="mr-2" /> Add New Client
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients by name or email..."
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
            <FaFilter /> Filters
          </button>
        </div>

        {/* Clients Table */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredClients.length > 0 ? (
                    filteredClients.map((client) => (
                      <tr key={client.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FaUserCircle className="flex-shrink-0 h-10 w-10 text-gray-400" />
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{client.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${client.status === 'Active' ? 'bg-green-100 text-green-800' : 
                              client.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'}`}>
                            {client.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.lastActive}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">
                            <FaEdit />
                          </button>
                          <button className="text-red-600 hover:text-red-900" onClick={() => handleDelete(client.id)}>
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                        No clients found matching your search criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Clients;