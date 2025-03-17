import React, { useState } from 'react';
import OwnershipDetails from './OwnershipDetails';

const Home = () => {
  const [financialData, setFinancialData] = useState({
    companyName: "",
    yearEnd: "",
    turnover: "",
    npbt: "",
    npat: "",
    salaries: "",
    wages: "",
    directorsEmoluments: "",
    annualPayroll: "",
    expenses: "",
    costOfSales: "",
    depreciation: "",
    sdlPayments: "",
    totalLeviableAmount: "",
    totalMeasuredProcurementSpend: "",
  });

  const [showOwnershipModal, setShowOwnershipModal] = useState(false);
  const [ownershipDetails, setOwnershipDetails] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFinancialData({
      ...financialData,
      [name]: value
    });
  };

  const handleOwnershipSubmit = (data) => {
    setOwnershipDetails(data);
    setShowOwnershipModal(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">B-BBEE Calculator Dashboard</h1>
        <p className="mb-4">Complete your company information to calculate your B-BBEE score</p>
        
        <div className="flex gap-4">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Start New Assessment
          </button>
          <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">
            Load Saved Assessment
          </button>
        </div>
      </div>

      {/* Company Information */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Company Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Company Name</label>
            <input 
              type="text" 
              name="companyName" 
              value={financialData.companyName} 
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Financial Year End</label>
            <input 
              type="text" 
              name="yearEnd" 
              value={financialData.yearEnd} 
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      </div>

      {/* Financial Information */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Financial Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Turnover / Revenue (R)</label>
            <input 
              type="number" 
              name="turnover" 
              value={financialData.turnover} 
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Net Profit Before Tax (R)</label>
            <input 
              type="number" 
              name="npbt" 
              value={financialData.npbt} 
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Net Profit After Tax (R)</label>
            <input 
              type="number" 
              name="npat" 
              value={financialData.npat} 
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Salaries (R)</label>
            <input 
              type="number" 
              name="salaries" 
              value={financialData.salaries} 
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Wages (R)</label>
            <input 
              type="number" 
              name="wages" 
              value={financialData.wages} 
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Directors Emoluments (R)</label>
            <input 
              type="number" 
              name="directorsEmoluments" 
              value={financialData.directorsEmoluments} 
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Annual Payroll (R)</label>
            <input 
              type="number" 
              name="annualPayroll" 
              value={financialData.annualPayroll} 
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Expenses (R)</label>
            <input 
              type="number" 
              name="expenses" 
              value={financialData.expenses} 
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cost of Sales (R)</label>
            <input 
              type="number" 
              name="costOfSales" 
              value={financialData.costOfSales} 
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Depreciation (R)</label>
            <input 
              type="number" 
              name="depreciation" 
              value={financialData.depreciation} 
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      </div>

      {/* Skills Development */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Skills Development</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Total SDL Payments (R)</label>
            <input 
              type="number" 
              name="sdlPayments" 
              value={financialData.sdlPayments} 
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Total Leviable Amount (R)</label>
            <input 
              type="number" 
              name="totalLeviableAmount" 
              value={financialData.totalLeviableAmount} 
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      </div>

      {/* Procurement */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Procurement</h2>
        <div>
          <label className="block text-sm font-medium mb-1">Total Measured Procurement Spend (R)</label>
          <input 
            type="number" 
            name="totalMeasuredProcurementSpend" 
            value={financialData.totalMeasuredProcurementSpend} 
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>

      {/* Ownership Assessment */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Ownership Assessment</h2>
        <div className="flex justify-between items-center">
          <p>
            {ownershipDetails?.ownershipData
              ? `Ownership details added (Black Ownership: ${ownershipDetails.ownershipData.blackOwnershipPercentage}%)`
              : "Add ownership details to calculate your B-BBEE ownership score"}
          </p>
          <button 
            onClick={() => setShowOwnershipModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            {ownershipDetails ? "Edit Ownership Details" : "Add Ownership Details"}
          </button>
        </div>
      </div>

      {/* Management Control */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Management Control</h2>
        <div className="flex justify-between items-center">
          <p>Add management details to calculate your B-BBEE management score</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Add Management Details
          </button>
        </div>
      </div>

      {/* Skills Development Details */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Skills Development Details</h2>
        <div className="flex justify-between items-center">
          <p>Add skills development details to calculate your B-BBEE skills development score</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Add Skills Development Details
          </button>
        </div>
      </div>

      {/* Enterprise & Supplier Development */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Enterprise & Supplier Development</h2>
        <div className="flex justify-between items-center">
          <p>Add enterprise & supplier development details to calculate your B-BBEE ESD score</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Add ESD Details
          </button>
        </div>
      </div>

      {/* Socio-Economic Development */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Socio-Economic Development</h2>
        <div className="flex justify-between items-center">
          <p>Add socio-economic development details to calculate your B-BBEE SED score</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Add SED Details
          </button>
        </div>
      </div>

      {/* Ownership Modal */}
      {showOwnershipModal && (
        <OwnershipDetails
          onClose={() => setShowOwnershipModal(false)}
          onSubmit={handleOwnershipSubmit}
        />
      )}

      {/* Submit Button */}
      <div className="flex justify-center mt-6">
        <button className="bg-green-600 text-white px-8 py-3 rounded-md hover:bg-green-700 font-bold text-lg">
          Calculate B-BBEE Score
        </button>
      </div>
    </div>
  );
};

export default Home;