import React, { useState } from 'react';

const SkillsDevelopment = ({ onClose, onSubmit }) => {
  // Define categories based on the provided image
  const categories = [
    { value: 'A', label: 'Bursaries: Institution-based, theoretical only, formally assessed (incl. Basic Education)' },
    { value: 'A2', label: 'Institution-based, theoretical instruction alone – formally assessed by educational institutions established by or registered with the Department of Higher Education & Training' },
    { value: 'B', label: 'Internships: Institution-based, theoretical & practical learning, formally assessed' },
    { value: 'C', label: 'Learnerships: Recognised or registered structured experiential learning in the workplace that is required after achievement of qualification, formally assessed' },
    { value: 'D', label: 'Learnerships or Apprenticeships: Occupationally directed instructional & workplace learning programme (formal contract), formally assessed' },
    { value: 'E', label: 'Work-integrated Learning: Occupationally directed instructional & workplace learning programme (no formal contract required), formally assessed' },
    { value: 'F', label: 'Informal Training: Occupationally-directed informal instructional programmes. (Institutions, conferences, meetings)' },
    { value: 'G', label: 'Informal Training | Work-based informal programmes (workplace)' },
  ];

  const [trainings, setTrainings] = useState([]);
  const [newTraining, setNewTraining] = useState({
    startDate: '',
    endDate: '',
    trainingCourse: '',
    trainerProvider: '',
    category: '',
    learnerName: '',
    siteLocation: '',
    idNumber: '',
    race: '',
    gender: '',
    isDisabled: false,
    coreCriticalSkills: '',
    totalDirectExpenditure: 0,
    additionalExpenditure: 0,
    costToCompanySalary: 0,
    trainingDurationHours: 0,
    numberOfParticipants: 0,
    isUnemployedLearner: false,
    isAbsorbedInternalTrainer: false,
  });

  const [summary, setSummary] = useState({
    totalTrainings: 0,
    totalDirectExpenditure: 0,
    totalAdditionalExpenditure: 0,
    totalCostToCompanySalary: 0,
    totalTrainingHours: 0,
    totalParticipants: 0,
    unemployedLearners: 0,
    absorbedInternalTrainers: 0,
  });

  const handleTrainingChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewTraining({
      ...newTraining,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const addTraining = () => {
    if (!newTraining.startDate || !newTraining.trainingCourse || !newTraining.learnerName || !newTraining.idNumber || !newTraining.category) {
      alert('Please fill in the Start Date, Training Course, Learner Name, ID Number, and Category.');
      return;
    }

    setTrainings([...trainings, newTraining]);
    setNewTraining({
      startDate: '',
      endDate: '',
      trainingCourse: '',
      trainerProvider: '',
      category: '',
      learnerName: '',
      siteLocation: '',
      idNumber: '',
      race: '',
      gender: '',
      isDisabled: false,
      coreCriticalSkills: '',
      totalDirectExpenditure: 0,
      additionalExpenditure: 0,
      costToCompanySalary: 0,
      trainingDurationHours: 0,
      numberOfParticipants: 0,
      isUnemployedLearner: false,
      isAbsorbedInternalTrainer: false,
    });

    recalculateSummary([...trainings, newTraining]);
  };

  const recalculateSummary = (updatedTrainings) => {
    let totalTrainings = updatedTrainings.length;
    let totalDirectExpenditure = 0;
    let totalAdditionalExpenditure = 0;
    let totalCostToCompanySalary = 0;
    let totalTrainingHours = 0;
    let totalParticipants = 0;
    let unemployedLearners = 0;
    let absorbedInternalTrainers = 0;

    updatedTrainings.forEach((training) => {
      totalDirectExpenditure += Number(training.totalDirectExpenditure);
      totalAdditionalExpenditure += Number(training.additionalExpenditure);
      totalCostToCompanySalary += Number(training.costToCompanySalary);
      totalTrainingHours += Number(training.trainingDurationHours);
      totalParticipants += Number(training.numberOfParticipants);
      if (training.isUnemployedLearner) unemployedLearners += 1;
      if (training.isAbsorbedInternalTrainer) absorbedInternalTrainers += 1;
    });

    setSummary({
      totalTrainings,
      totalDirectExpenditure,
      totalAdditionalExpenditure,
      totalCostToCompanySalary,
      totalTrainingHours,
      totalParticipants,
      unemployedLearners,
      absorbedInternalTrainers,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ trainings, summary });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-5xl max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Skills Development Details</h2>

        <form onSubmit={handleSubmit}>
          {/* Training Input Form */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Add Training Program</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={newTraining.startDate}
                  onChange={handleTrainingChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Date (B/C/D Learnerships Only)</label>
                <input
                  type="date"
                  name="endDate"
                  value={newTraining.endDate}
                  onChange={handleTrainingChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Training Course</label>
                <input
                  type="text"
                  name="trainingCourse"
                  value={newTraining.trainingCourse}
                  onChange={handleTrainingChange}
                  className="w-full p-2 border rounded"
                  placeholder="Enter training course"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Trainer/Service Provider</label>
                <input
                  type="text"
                  name="trainerProvider"
                  value={newTraining.trainerProvider}
                  onChange={handleTrainingChange}
                  className="w-full p-2 border rounded"
                  placeholder="Enter trainer/provider"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  name="category"
                  value={newTraining.category}
                  onChange={handleTrainingChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Learner Name & Surname</label>
                <input
                  type="text"
                  name="learnerName"
                  value={newTraining.learnerName}
                  onChange={handleTrainingChange}
                  className="w-full p-2 border rounded"
                  placeholder="Enter learner name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Site/Location (if applicable)</label>
                <input
                  type="text"
                  name="siteLocation"
                  value={newTraining.siteLocation}
                  onChange={handleTrainingChange}
                  className="w-full p-2 border rounded"
                  placeholder="Enter site/location"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ID Number</label>
                <input
                  type="text"
                  name="idNumber"
                  value={newTraining.idNumber}
                  onChange={handleTrainingChange}
                  className="w-full p-2 border rounded"
                  placeholder="Enter ID number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Race</label>
                <select
                  name="race"
                  value={newTraining.race}
                  onChange={handleTrainingChange}
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
                  value={newTraining.gender}
                  onChange={handleTrainingChange}
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
                  checked={newTraining.isDisabled}
                  onChange={handleTrainingChange}
                  className="mr-2"
                />
                <label className="text-sm font-medium">Disabled</label>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Core and/or Critical Skills</label>
                <input
                  type="text"
                  name="coreCriticalSkills"
                  value={newTraining.coreCriticalSkills}
                  onChange={handleTrainingChange}
                  className="w-full p-2 border rounded"
                  placeholder="Enter skills"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Total Direct Expenditure (Excl. VAT)</label>
                <input
                  type="number"
                  name="totalDirectExpenditure"
                  value={newTraining.totalDirectExpenditure}
                  onChange={handleTrainingChange}
                  className="w-full p-2 border rounded"
                  placeholder="Enter expenditure"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Additional Expenditure (Hotels & Travel)</label>
                <input
                  type="number"
                  name="additionalExpenditure"
                  value={newTraining.additionalExpenditure}
                  onChange={handleTrainingChange}
                  className="w-full p-2 border rounded"
                  placeholder="Enter additional expenditure"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cost to Company Annual Salary</label>
                <input
                  type="number"
                  name="costToCompanySalary"
                  value={newTraining.costToCompanySalary}
                  onChange={handleTrainingChange}
                  className="w-full p-2 border rounded"
                  placeholder="Enter salary"
                  disabled // Read-only as per "Don't change formula"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Duration of Training (Hours)</label>
                <input
                  type="number"
                  name="trainingDurationHours"
                  value={newTraining.trainingDurationHours}
                  onChange={handleTrainingChange}
                  className="w-full p-2 border rounded"
                  placeholder="Enter hours"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Number of Participants</label>
                <input
                  type="number"
                  name="numberOfParticipants"
                  value={newTraining.numberOfParticipants}
                  onChange={handleTrainingChange}
                  className="w-full p-2 border rounded"
                  placeholder="Enter number of participants"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isUnemployedLearner"
                  checked={newTraining.isUnemployedLearner}
                  onChange={handleTrainingChange}
                  className="mr-2"
                />
                <label className="text-sm font-medium">Unemployed Learner</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isAbsorbedInternalTrainer"
                  checked={newTraining.isAbsorbedInternalTrainer}
                  onChange={handleTrainingChange}
                  className="mr-2"
                />
                <label className="text-sm font-medium">Absorbed Internal Trainer</label>
              </div>
            </div>
            <button
              type="button"
              onClick={addTraining}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Add Training
            </button>
          </div>

          {/* Trainings Table */}
          {trainings.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Training Programs List</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border border-gray-300 px-4 py-2">Start Date</th>
                      <th className="border border-gray-300 px-4 py-2">End Date</th>
                      <th className="border border-gray-300 px-4 py-2">Training Course</th>
                      <th className="border border-gray-300 px-4 py-2">Trainer/Provider</th>
                      <th className="border border-gray-300 px-4 py-2">Category</th>
                      <th className="border border-gray-300 px-4 py-2">Learner Name</th>
                      <th className="border border-gray-300 px-4 py-2">Site/Location</th>
                      <th className="border border-gray-300 px-4 py-2">ID Number</th>
                      <th className="border border-gray-300 px-4 py-2">Race</th>
                      <th className="border border-gray-300 px-4 py-2">Gender</th>
                      <th className="border border-gray-300 px-4 py-2">Disabled</th>
                      <th className="border border-gray-300 px-4 py-2">Core/Critical Skills</th>
                      <th className="border border-gray-300 px-4 py-2">Total Direct Expenditure</th>
                      <th className="border border-gray-300 px-4 py-2">Additional Expenditure</th>
                      <th className="border border-gray-300 px-4 py-2">Cost to Company Salary</th>
                      <th className="border border-gray-300 px-4 py-2">Training Duration (Hours)</th>
                      <th className="border border-gray-300 px-4 py-2">Number of Participants</th>
                      <th className="border border-gray-300 px-4 py-2">Unemployed Learner</th>
                      <th className="border border-gray-300 px-4 py-2">Absorbed Internal Trainer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trainings.map((training, index) => (
                      <tr key={index}>
                        <td className="border border-gray-300 px-4 py-2">{training.startDate}</td>
                        <td className="border border-gray-300 px-4 py-2">{training.endDate || 'N/A'}</td>
                        <td className="border border-gray-300 px-4 py-2">{training.trainingCourse}</td>
                        <td className="border border-gray-300 px-4 py-2">{training.trainerProvider}</td>
                        <td className="border border-gray-300 px-4 py-2">{training.category}</td>
                        <td className="border border-gray-300 px-4 py-2">{training.learnerName}</td>
                        <td className="border border-gray-300 px-4 py-2">{training.siteLocation}</td>
                        <td className="border border-gray-300 px-4 py-2">{training.idNumber}</td>
                        <td className="border border-gray-300 px-4 py-2">{training.race}</td>
                        <td className="border border-gray-300 px-4 py-2">{training.gender}</td>
                        <td className="border border-gray-300 px-4 py-2">{training.isDisabled ? 'Yes' : 'No'}</td>
                        <td className="border border-gray-300 px-4 py-2">{training.coreCriticalSkills}</td>
                        <td className="border border-gray-300 px-4 py-2">{training.totalDirectExpenditure}</td>
                        <td className="border border-gray-300 px-4 py-2">{training.additionalExpenditure}</td>
                        <td className="border border-gray-300 px-4 py-2">{training.costToCompanySalary}</td>
                        <td className="border border-gray-300 px-4 py-2">{training.trainingDurationHours}</td>
                        <td className="border border-gray-300 px-4 py-2">{training.numberOfParticipants}</td>
                        <td className="border border-gray-300 px-4 py-2">{training.isUnemployedLearner ? 'Yes' : 'No'}</td>
                        <td className="border border-gray-300 px-4 py-2">{training.isAbsorbedInternalTrainer ? 'Yes' : 'No'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Summary Section */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Skills Development Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Total Trainings</label>
                <input
                  type="number"
                  value={summary.totalTrainings}
                  className="w-full p-2 border rounded"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Total Direct Expenditure (R)</label>
                <input
                  type="number"
                  value={summary.totalDirectExpenditure}
                  className="w-full p-2 border rounded"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Total Additional Expenditure (R)</label>
                <input
                  type="number"
                  value={summary.totalAdditionalExpenditure}
                  className="w-full p-2 border rounded"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Total Cost to Company Salary (R)</label>
                <input
                  type="number"
                  value={summary.totalCostToCompanySalary}
                  className="w-full p-2 border rounded"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Total Training Hours</label>
                <input
                  type="number"
                  value={summary.totalTrainingHours}
                  className="w-full p-2 border rounded"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Total Participants</label>
                <input
                  type="number"
                  value={summary.totalParticipants}
                  className="w-full p-2 border rounded"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Unemployed Learners</label>
                <input
                  type="number"
                  value={summary.unemployedLearners}
                  className="w-full p-2 border rounded"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Absorbed Internal Trainers</label>
                <input
                  type="number"
                  value={summary.absorbedInternalTrainers}
                  className="w-full p-2 border rounded"
                  disabled
                />
              </div>
            </div>
          </div>

          <div className="fixed bottom-4 sm:bottom-12 right-2 sm:right-4 md:right-78 flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 bg-white p-3 sm:p-4 rounded-md shadow-lg w-[90%] sm:w-auto max-w-md">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 text-gray-800 px-3 py-2 sm:px-4 sm:py-2 rounded-md hover:bg-gray-300 w-full sm:w-auto transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-md hover:bg-blue-700 w-full sm:w-auto transition-all duration-200"
            >
              Save Ownership Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SkillsDevelopment;