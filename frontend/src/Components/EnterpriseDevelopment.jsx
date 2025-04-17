import React, { useState, useEffect } from "react";

const EnterpriseDevelopment = ({ userId, onClose, onSubmit }) => {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [newBeneficiary, setNewBeneficiary] = useState({
    beneficiaryName: "",
    siteLocation: "",
    isSupplierDevelopmentBeneficiary: false,
    blackOwnershipPercentage: 0,
    blackWomenOwnershipPercentage: 0,
    beeStatusLevel: "",
    contributionType: "",
    contributionDescription: "",
    dateOfContribution: "",
    paymentDate: "",
    contributionAmount: 0,
  });
  const [editingBeneficiaryIndex, setEditingBeneficiaryIndex] = useState(null); // New state for editing

  const [summary, setSummary] = useState({
    totalBeneficiaries: 0,
    totalContributionAmount: 0,
    supplierDevelopmentBeneficiaries: 0,
    blackOwnedBeneficiaries: 0,
    blackWomenOwnedBeneficiaries: 0,
  });

  // Fetch existing data when component mounts
  useEffect(() => {
    const fetchEnterpriseData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/enterprise-development/${userId}`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const { data } = await response.json();
        if (data.length > 0) {
          setBeneficiaries(data[0].beneficiaries);
          setSummary(data[0].summary);
        }
      } catch (error) {
        console.error("Error fetching enterprise development data:", error);
      }
    };
    if (userId) fetchEnterpriseData();
  }, [userId]);

  const handleBeneficiaryChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewBeneficiary({
      ...newBeneficiary,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? value === ""
            ? 0
            : Number(value)
          : value,
    });
  };

  const addBeneficiary = () => {
    if (
      !newBeneficiary.beneficiaryName ||
      !newBeneficiary.contributionAmount ||
      !newBeneficiary.contributionType
    ) {
      alert("Please fill in the Beneficiary Name, Contribution Amount, and Contribution Type.");
      return;
    }

    const updatedBeneficiaries = [...beneficiaries, newBeneficiary];
    setBeneficiaries(updatedBeneficiaries);
    resetNewBeneficiary();
    recalculateSummary(updatedBeneficiaries);
  };

  const editBeneficiary = (index) => {
    setEditingBeneficiaryIndex(index);
    setNewBeneficiary(beneficiaries[index]);
  };

  const saveEditedBeneficiary = () => {
    if (
      !newBeneficiary.beneficiaryName ||
      !newBeneficiary.contributionAmount ||
      !newBeneficiary.contributionType
    ) {
      alert("Please fill in the Beneficiary Name, Contribution Amount, and Contribution Type.");
      return;
    }

    const updatedBeneficiaries = beneficiaries.map((beneficiary, index) =>
      index === editingBeneficiaryIndex ? newBeneficiary : beneficiary
    );
    setBeneficiaries(updatedBeneficiaries);
    resetNewBeneficiary();
    setEditingBeneficiaryIndex(null);
    recalculateSummary(updatedBeneficiaries);
  };

  const deleteBeneficiary = (index) => {
    const updatedBeneficiaries = beneficiaries.filter((_, i) => i !== index);
    setBeneficiaries(updatedBeneficiaries);
    recalculateSummary(updatedBeneficiaries);
  };

  const resetNewBeneficiary = () => {
    setNewBeneficiary({
      beneficiaryName: "",
      siteLocation: "",
      isSupplierDevelopmentBeneficiary: false,
      blackOwnershipPercentage: 0,
      blackWomenOwnershipPercentage: 0,
      beeStatusLevel: "",
      contributionType: "",
      contributionDescription: "",
      dateOfContribution: "",
      paymentDate: "",
      contributionAmount: 0,
    });
  };

  const recalculateSummary = (updatedBeneficiaries) => {
    let totalBeneficiaries = updatedBeneficiaries.length;
    let totalContributionAmount = 0;
    let supplierDevelopmentBeneficiaries = 0;
    let blackOwnedBeneficiaries = 0;
    let blackWomenOwnedBeneficiaries = 0;

    updatedBeneficiaries.forEach((beneficiary) => {
      totalContributionAmount += Number(beneficiary.contributionAmount);
      if (beneficiary.isSupplierDevelopmentBeneficiary) supplierDevelopmentBeneficiaries += 1;
      if (Number(beneficiary.blackOwnershipPercentage) >= 30) blackOwnedBeneficiaries += 1;
      if (Number(beneficiary.blackWomenOwnershipPercentage) >= 30) blackWomenOwnedBeneficiaries += 1;
    });

    setSummary({
      totalBeneficiaries,
      totalContributionAmount,
      supplierDevelopmentBeneficiaries,
      blackOwnedBeneficiaries,
      blackWomenOwnedBeneficiaries,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { userId, beneficiaries, summary };
      const response = await fetch("http://localhost:5000/enterprise-development", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      console.log("Enterprise development data saved:", data);
      onSubmit(payload);
      onClose();
    } catch (error) {
      console.error("Error saving enterprise development data:", error);
      alert(`Failed to save enterprise development data: ${error.message}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-5xl max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Enterprise Development Details</h2>

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
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isSupplierDevelopmentBeneficiary"
                  checked={newBeneficiary.isSupplierDevelopmentBeneficiary}
                  onChange={handleBeneficiaryChange}
                  className="mr-2"
                />
                <label className="text-sm font-medium">Supplier Development Beneficiary</label>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Black Ownership (%)</label>
                <input
                  type="number"
                  name="blackOwnershipPercentage"
                  value={newBeneficiary.blackOwnershipPercentage}
                  onChange={handleBeneficiaryChange}
                  className="w-full p-2 border rounded"
                  placeholder="Enter percentage"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Black Women Ownership (%)</label>
                <input
                  type="number"
                  name="blackWomenOwnershipPercentage"
                  value={newBeneficiary.blackWomenOwnershipPercentage}
                  onChange={handleBeneficiaryChange}
                  className="w-full p-2 border rounded"
                  placeholder="Enter percentage"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">BEE Status Level</label>
                <select
                  name="beeStatusLevel"
                  value={newBeneficiary.beeStatusLevel}
                  onChange={handleBeneficiaryChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select BEE Level</option>
                  {[...Array(8).keys()].map((level) => (
                    <option key={level + 1} value={level + 1}>
                      Level {level + 1}
                    </option>
                  ))}
                  <option value="Non-compliant">Non-compliant</option>
                </select>
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
                  <option value="Interest-Free Loan">Interest-Free Loan</option>
                  <option value="Loan to Black owned EME/QSE">Loan to Black owned EME/QSE</option>
                  <option value="Standard Loan">Standard Loan</option>
                  <option value="Guarantees provided on behalf of Beneficiary">
                    Guarantees provided on behalf of Beneficiary
                  </option>
                  <option value="Lower Interest Rate">Lower Interest Rate</option>
                  <option value="Minor Investment in Black EME/QSE">
                    Minor Investment in Black EME/QSE
                  </option>
                  <option value="Major Investment in other Enterprises">
                    Major Investment in other Enterprises
                  </option>
                  <option value="Investment with lower dividend to financier">
                    Investment with lower dividend to financier
                  </option>
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
                <label className="block text-sm font-medium mb-1">Payment Date (shorter payment terms)</label>
                <input
                  type="date"
                  name="paymentDate"
                  value={newBeneficiary.paymentDate}
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
              onClick={editingBeneficiaryIndex !== null ? saveEditedBeneficiary : addBeneficiary}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              {editingBeneficiaryIndex !== null ? "Save Edited Beneficiary" : "Add Beneficiary"}
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
                      <th className="border border-gray-300 px-4 py-2">Supplier Development Beneficiary</th>
                      <th className="border border-gray-300 px-4 py-2">Black Ownership (%)</th>
                      <th className="border border-gray-300 px-4 py-2">Black Women Ownership (%)</th>
                      <th className="border border-gray-300 px-4 py-2">BEE Status Level</th>
                      <th className="border border-gray-300 px-4 py-2">Contribution Type</th>
                      <th className="border border-gray-300 px-4 py-2">Description of Contribution</th>
                      <th className="border border-gray-300 px-4 py-2">Date of Contribution</th>
                      <th className="border border-gray-300 px-4 py-2">Payment Date</th>
                      <th className="border border-gray-300 px-4 py-2">Amount of Contribution (R)</th>
                      <th className="border border-gray-300 px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {beneficiaries.map((beneficiary, index) => (
                      <tr key={index}>
                        <td className="border border-gray-300 px-4 py-2">{beneficiary.beneficiaryName}</td>
                        <td className="border border-gray-300 px-4 py-2">{beneficiary.siteLocation || "N/A"}</td>
                        <td className="border border-gray-300 px-4 py-2">
                          {beneficiary.isSupplierDevelopmentBeneficiary ? "Yes" : "No"}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {beneficiary.blackOwnershipPercentage}%
                        </td>
                        <td className="border border-gray- RGBA px-4 py-2">
                          {beneficiary.blackWomenOwnershipPercentage}%
                        </td>
                        <td className="border border-gray-300 px-4 py-2">{beneficiary.beeStatusLevel || "N/A"}</td>
                        <td className="border border-gray-300 px-4 py-2">{beneficiary.contributionType}</td>
                        <td className="border border-gray-300 px-4 py-2">
                          {beneficiary.contributionDescription || "N/A"}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">{beneficiary.dateOfContribution || "N/A"}</td>
                        <td className="border border-gray-300 px-4 py-2">{beneficiary.paymentDate || "N/A"}</td>
                        <td className="border border-gray-300 px-4 py-2">{beneficiary.contributionAmount}</td>
                        <td className="border border-gray-300 px-4 py-2">
                          <button
                            type="button"
                            onClick={() => editBeneficiary(index)}
                            className="bg-yellow-500 text-white px-2 py-1 rounded mr-2 hover:bg-yellow-600"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteBeneficiary(index)}
                            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Summary Section */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Enterprise Development Summary</h3>
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
                <label className="block text-sm font-medium mb-1">Supplier Development Beneficiaries</label>
                <input
                  type="number"
                  value={summary.supplierDevelopmentBeneficiaries}
                  className="w-full p-2 border rounded"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">30%+ Black Owned Beneficiaries</label>
                <input
                  type="number"
                  value={summary.blackOwnedBeneficiaries}
                  className="w-full p-2 border rounded"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">30%+ Black Women Owned Beneficiaries</label>
                <input
                  type="number"
                  value={summary.blackWomenOwnedBeneficiaries}
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
              Save Enterprise Development Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnterpriseDevelopment;