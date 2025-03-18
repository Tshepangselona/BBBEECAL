import React, { useState } from 'react';

const ManagementControl = ({ onClose, onSubmit }) => {
  const [managers, setManagers] = useState([]);
  const [newManager, setNewManager] = useState({
    name: '',
    siteLocation: '',
    idNumber: '',
    position: '',
    jobTitle: '',
    race: '',
    gender: '',
    isDisabled: false,
    votingRights: 0,
    isExecutiveDirector: false,
    isIndependentNonExecutive: false
  });

  const [managementData, setManagementData] = useState({
    totalVotingRights: 0,
    blackVotingRights: 0,
    blackFemaleVotingRights: 0,
    disabledVotingRights: 0
  });

  const handleManagerChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewManager({
      ...newManager,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const addManager = () => {
    if (!newManager.name || !newManager.idNumber || !newManager.position) {
      alert('Please fill in the Name, ID Number, and Position.');
      return;
    }

    setManagers([...managers, newManager]);
    setNewManager({
      name: '',
      siteLocation: '',
      idNumber: '',
      position: '',
      jobTitle: '',
      race: '',
      gender: '',
      isDisabled: false,
      votingRights: 0,
      isExecutiveDirector: false,
      isIndependentNonExecutive: false
    });

    recalculateManagementData([...managers, newManager]);
  };

  const recalculateManagementData = (updatedManagers) => {
    let totalVotingRights = 0;
    let blackVotingRights = 0;
    let blackFemaleVotingRights = 0;
    let disabledVotingRights = 0;

    updatedManagers.forEach((manager) => {
      const votingRights = Number(manager.votingRights);

      totalVotingRights += votingRights;

      if (manager.race.toLowerCase() === 'black') {
        blackVotingRights += votingRights;
        if (manager.gender.toLowerCase() === 'female') {
          blackFemaleVotingRights += votingRights;
        }
      }
      if (manager.isDisabled) {
        disabledVotingRights += votingRights;
      }
    });

    setManagementData({
      totalVotingRights,
      blackVotingRights,
      blackFemaleVotingRights,
      disabledVotingRights
    });
  };

  const handleManagementChange = (e) => {
    const { name, value } = e.target;
    setManagementData({
      ...managementData,
      [name]: Number(value)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ managers, managementData });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Management Control Details</h2>

        <form onSubmit={handleSubmit}>
          {/* Manager Input Form */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Add Manager</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name & Surname</label>
                <input
                  type="text"
                  name="name"
                  value={newManager.name}
                  onChange={handleManagerChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Site/Location (if applicable)</label>
                <input
                  type="text"
                  name="siteLocation"
                  value={newManager.siteLocation}
                  onChange={handleManagerChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ID Number</label>
                <input
                  type="text"
                  name="idNumber"
                  value={newManager.idNumber}
                  onChange={handleManagerChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Position (Occupational Level)</label>
                <input
                  type="text"
                  name="position"
                  value={newManager.position}
                  onChange={handleManagerChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Job Title</label>
                <input
                  type="text"
                  name="jobTitle"
                  value={newManager.jobTitle}
                  onChange={handleManagerChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Race</label>
                <select
                  name="race"
                  value={newManager.race}
                  onChange={handleManagerChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select Race</option>
                  <option value="Black">Black</option>
                  <option value="White">White</option>
                  <option value="Coloured">Coloured</option>
                  <option value="Indian">Indian</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Gender</label>
                <select
                  name="gender"
                  value={newManager.gender}
                  onChange={handleManagerChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isDisabled"
                  checked={newManager.isDisabled}
                  onChange={handleManagerChange}
                  className="mr-2"
                />
                <label className="text-sm font-medium">Disabled</label>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Voting Rights (%)</label>
                <input
                  type="number"
                  name="votingRights"
                  value={newManager.votingRights}
                  onChange={handleManagerChange}
                  min="0"
                  max="100"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isExecutiveDirector"
                  checked={newManager.isExecutiveDirector}
                  onChange={handleManagerChange}
                  className="mr-2"
                />
                <label className="text-sm font-medium">Executive Director</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isIndependentNonExecutive"
                  checked={newManager.isIndependentNonExecutive}
                  onChange={handleManagerChange}
                  className="mr-2"
                />
                <label className="text-sm font-medium">Independent Non-Executive</label>
              </div>
            </div>
            <button
              type="button"
              onClick={addManager}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Add Manager
            </button>
          </div>

          {/* Managers Table */}
          {managers.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Managers List</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border border-gray-300 px-4 py-2">Name & Surname</th>
                      <th className="border border-gray-300 px-4 py-2">Site/Location</th>
                      <th className="border border-gray-300 px-4 py-2">ID Number</th>
                      <th className="border border-gray-300 px-4 py-2">Position (Occupational Level)</th>
                      <th className="border border-gray-300 px-4 py-2">Job Title</th>
                      <th className="border border-gray-300 px-4 py-2">Race</th>
                      <th className="border border-gray-300 px-4 py-2">Gender</th>
                      <th className="border border-gray-300 px-4 py-2">Disabled</th>
                      <th className="border border-gray-300 px-4 py-2">Voting Rights (%)</th>
                      <th className="border border-gray-300 px-4 py-2">Executive Director</th>
                      <th className="border border-gray-300 px-4 py-2">Independent Non-Executive</th>
                    </tr>
                  </thead>
                  <tbody>
                    {managers.map((manager, index) => (
                      <tr key={index}>
                        <td className="border border-gray-300 px-4 py-2">{manager.name}</td>
                        <td className="border border-gray-300 px-4 py-2">{manager.siteLocation}</td>
                        <td className="border border-gray-300 px-4 py-2">{manager.idNumber}</td>
                        <td className="border border-gray-300 px-4 py-2">{manager.position}</td>
                        <td className="border border-gray-300 px-4 py-2">{manager.jobTitle}</td>
                        <td className="border border-gray-300 px-4 py-2">{manager.race}</td>
                        <td className="border border-gray-300 px-4 py-2">{manager.gender}</td>
                        <td className="border border-gray-300 px-4 py-2">{manager.isDisabled ? 'Yes' : 'No'}</td>
                        <td className="border border-gray-300 px-4 py-2">{manager.votingRights}</td>
                        <td className="border border-gray-300 px-4 py-2">{manager.isExecutiveDirector ? 'Yes' : 'No'}</td>
                        <td className="border border-gray-300 px-4 py-2">{manager.isIndependentNonExecutive ? 'Yes' : 'No'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Aggregated Management Data */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Aggregated Management Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Total Voting Rights (%)</label>
                <input
                  type="number"
                  name="totalVotingRights"
                  value={managementData.totalVotingRights}
                  onChange={handleManagementChange}
                  min="0"
                  max="100"
                  className="w-full p-2 border rounded"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Black Voting Rights (%)</label>
                <input
                  type="number"
                  name="blackVotingRights"
                  value={managementData.blackVotingRights}
                  onChange={handleManagementChange}
                  min="0"
                  max="100"
                  className="w-full p-2 border rounded"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Black Female Voting Rights (%)</label>
                <input
                  type="number"
                  name="blackFemaleVotingRights"
                  value={managementData.blackFemaleVotingRights}
                  onChange={handleManagementChange}
                  min="0"
                  max="100"
                  className="w-full p-2 border rounded"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Disabled Voting Rights (%)</label>
                <input
                  type="number"
                  name="disabledVotingRights"
                  value={managementData.disabledVotingRights}
                  onChange={handleManagementChange}
                  min="0"
                  max="100"
                  className="w-full p-2 border rounded"
                  disabled
                />
              </div>
            </div>
          </div>

          <div className="fixed bottom-20 right-4 flex justify-end gap-4 bg-white p-4 rounded-md shadow-lg">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Save Ownership Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManagementControl;