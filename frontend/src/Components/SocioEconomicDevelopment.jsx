import React, { useState } from 'react';

const SocioEconomicDevelopment = ({ onClose, onSubmit }) => {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [newBeneficiary, setNewBeneficiary] = useState({
    beneficiaryName: '',
    siteLocation: '',
    blackParticipationPercentage: 0,
    contributionType: '',
    contributionDescription: '',
    dateOfContribution: '',
    contributionAmount: 0,
  });

  const [summary, setSummary] = useState({
    totalBeneficiaries: 0,
    totalContributionAmount: 0,
    averageBlackParticipation: 0,
  });

  const handleBeneficiaryChange = (e) => {
    const { name, value } = e.target;
    setNewBeneficiary({
      ...newBeneficiary,
      [name]: value,
    });
  };

  const addBeneficiary = () => {
    if (!newBeneficiary.beneficiaryName || !newBeneficiary.contributionAmount || !newBeneficiary.contributionType) {
      alert('Please fill in the Beneficiary Name, Contribution Amount, and Contribution Type.');
      return;
    }

    setBeneficiaries([...beneficiaries, newBeneficiary]);
    setNewBeneficiary({
      beneficiaryName: '',
      siteLocation: '',
      blackParticipationPercentage: 0,
      contributionType: '',
      contributionDescription: '',
      dateOfContribution: '',
      contributionAmount: 0,
    });

    recalculateSummary([...beneficiaries, newBeneficiary]);
  };

  const recalculateSummary = (updatedBeneficiaries) => {
    let totalBeneficiaries = updatedBeneficiaries.length;
    let totalContributionAmount = 0;
    let totalBlackParticipation = 0;

    updatedBeneficiaries.forEach((beneficiary) => {
      totalContributionAmount += Number(beneficiary.contributionAmount);
      totalBlackParticipation += Number(beneficiary.blackParticipationPercentage);
    });

    const averageBlackParticipation = totalBeneficiaries > 0 ? (totalBlackParticipation / totalBeneficiaries).toFixed(2) : 0;

    setSummary({
      totalBeneficiaries,
      totalContributionAmount,
      averageBlackParticipation,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ beneficiaries, summary });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-5xl max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Socio-Economic Development Details</h2>

        <form onSubmit={handleSubmit}>
          {/* Beneficiary Input Form */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Add Beneficiary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Beneficiary Name</label>
                <input
                  type="text"
                  name="beneficiaryName"
                  value={newBeneficiary.beneficiaryName}
                  onChange={handleBeneficiaryChange}
                  className="w-full p-2 border rounded"
                  placeholder="Enter beneficiary name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Site/Location (if applicable)</label>
                <input
                  type="text"
                  name="siteLocation"
                  value={newBeneficiary.siteLocation}
                  onChange={handleBeneficiaryChange}
                  className="w-full p-2 border rounded"
                  placeholder="Enter site/location"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">% Black Participation</label>
                <input
                  type="number"
                  name="blackParticipationPercentage"
                  value={newBeneficiary.blackParticipationPercentage}
                  onChange={handleBeneficiaryChange}
                  className="w-full p-2 border rounded"
                  placeholder="Enter percentage"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contribution Type</label>
                <select
                  name="contributionType"
                  value={newBeneficiary.contributionType}
                  onChange={handleBeneficiaryChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select Contribution Type</option>
        <option value="Grant">Grant</option>
        <option value="Direct Cost">Direct Cost</option>
        <option value="Discounts">Discounts</option>
        <option value="Overhead Costs">Overhead Costs</option>
        <option value="Professional Services rendered at no cost">Professional Services rendered at no cost</option>
        <option value="Professional Services rendered at a discount">Professional Services rendered at a discount</option>
        <option value="Time of employee deployed in assisting beneficiaries">Time of employee deployed in assisting beneficiaries</option>
      </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description of Contribution</label>
                <input
                  type="text"
                  name="contributionDescription"
                  value={newBeneficiary.contributionDescription}
                  onChange={handleBeneficiaryChange}
                  className="w-full p-2 border rounded"
                  placeholder="Enter description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date of Contribution</label>
                <input
                  type="date"
                  name="dateOfContribution"
                  value={newBeneficiary.dateOfContribution}
                  onChange={handleBeneficiaryChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Amount of Contribution (R)</label>
                <input
                  type="number"
                  name="contributionAmount"
                  value={newBeneficiary.contributionAmount}
                  onChange={handleBeneficiaryChange}
                  className="w-full p-2 border rounded"
                  placeholder="Enter amount"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={addBeneficiary}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Add Beneficiary
            </button>
          </div>

          {/* Beneficiaries Table */}
          {beneficiaries.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Beneficiaries List</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border border-gray-300 px-4 py-2">Beneficiary</th>
                      <th className="border border-gray-300 px-4 py-2">Site/Location</th>
                      <th className="border border-gray-300 px-4 py-2">% Black Participation</th>
                      <th className="border border-gray-300 px-4 py-2">Contribution Type</th>
                      <th className="border border-gray-300 px-4 py-2">Description of Contribution</th>
                      <th className="border border-gray-300 px-4 py-2">Date of Contribution</th>
                      <th className="border border-gray-300 px-4 py-2">Amount of Contribution (R)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {beneficiaries.map((beneficiary, index) => (
                      <tr key={index}>
                        <td className="border border-gray-300 px-4 py-2">{beneficiary.beneficiaryName}</td>
                        <td className="border border-gray-300 px-4 py-2">{beneficiary.siteLocation || 'N/A'}</td>
                        <td className="border border-gray-300 px-4 py-2">{beneficiary.blackParticipationPercentage}%</td>
                        <td className="border border-gray-300 px-4 py-2">{beneficiary.contributionType}</td>
                        <td className="border border-gray-300 px-4 py-2">{beneficiary.contributionDescription}</td>
                        <td className="border border-gray-300 px-4 py-2">{beneficiary.dateOfContribution}</td>
                        <td className="border border-gray-300 px-4 py-2">{beneficiary.contributionAmount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Summary Section */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Socio-Economic Development Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Total Beneficiaries</label>
                <input
                  type="number"
                  value={summary.totalBeneficiaries}
                  className="w-full p-2 border rounded"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Total Contribution Amount (R)</label>
                <input
                  type="number"
                  value={summary.totalContributionAmount}
                  className="w-full p-2 border rounded"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Average % Black Participation</label>
                <input
                  type="number"
                  value={summary.averageBlackParticipation}
                  className="w-full p-2 border rounded"
                  disabled
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
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
              Save Socio-Economic Development Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SocioEconomicDevelopment;