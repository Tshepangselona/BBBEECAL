import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import OwnershipDetails from './OwnershipDetails';
import ManagementControl from './ManagementControl';
import EmploymentEquity from './EmploymentEquity';
import Yes4YouthInitiative from './Yes4YouthInitiative';
import SkillsDevelopment  from "./SkillsDevelopment";
import SupplierDevelopment from "./SupplierDevelopment";
import EnterpriseDevelopment from './EnterpriseDevelopment';
import SocioEconomicDevelopment from "./SocioEconomicDevelopment";

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [financialData, setFinancialData] = useState({
    companyName: '',
    yearEnd: '',
    turnover: 0,
    npbt: 0,
    npat: 0,
    salaries: 0,
    wages: 0,
    directorsEmoluments: 0,
    annualPayroll: 0,
    expenses: 0,
    costOfSales: 0,
    depreciation: 0,
    sdlPayments: 0,
    totalLeviableAmount: 0,
    totalMeasuredProcurementSpend: 0,
  });

  const [userId, setUserId] = useState(null);
  const [showOwnershipModal, setShowOwnershipModal] = useState(false);
  const [showManagementModal, setShowManagementModal] = useState(false);
  const [showEmploymentModal, setShowEmploymentModal] = useState(false);
  const [showYesModal, setShowYesModal] = useState(false);
  const [showSkillsDevelopmentModal, setShowSkillsDevelopmentModal] = useState(false);
  const [showSupplierDevelopmentModal, setShowSupplierDevelopmentModal] = useState(false);
  const [showEnterpriseDevelopmentModal, setShowEnterpriseDevelopmentModal] = useState(false);
  const [showSocioEconomicDevelopmentModal, setShowSocioEconomicDevelopmentModal] = useState(false);
  const [ownershipDetails, setOwnershipDetails] = useState(null);
  const [managementDetails, setManagementDetails] = useState(null);
  const [employmentDetails, setEmploymentDetails] = useState(null);
  const [yesDetails, setYesDetails] = useState(null);
  const [skillsDevelopmentDetails, setSkillsDevelopmentDetails] = useState(null);
  const [supplierDevelopmentDetails, setSupplierDevelopmentDetails] = useState(null);
  const [enterpriseDevelopmentDetails, setEnterpriseDevelopmentDetails] = useState(null);
  const [socioEconomicDevelopmentDetails, setSocioEconomicDevelopmentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to format Firestore Timestamp (serialized or native) to DD/MMM/YYYY
  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    try {
      let date;
      if (timestamp.seconds !== undefined && timestamp.nanoseconds !== undefined) {
        console.log("Processing serialized timestamp:", timestamp);
        date = new Date(timestamp.seconds * 1000);
        console.log("Created Date object:", date, "Timestamp in ms:", timestamp.seconds * 1000);
      } else if (timestamp.toDate) {
        console.log("Processing native Firestore Timestamp:", timestamp);
        date = timestamp.toDate();
      } else {
        console.log("Processing fallback timestamp:", timestamp);
        date = new Date(timestamp);
      }

      console.log("Date after creation:", date);
      if (isNaN(date.getTime())) {
        console.error("Date is invalid, getTime():", date.getTime());
        throw new Error("Invalid date");
      }

      const day = String(date.getDate()).padStart(2, "0");
      const month = date.toLocaleString("default", { month: "short" });
      const year = date.getFullYear();
      console.log("Formatted components:", { day, month, year });
      return `${day}/${month}/${year}`;
    } catch (err) {
      console.error("Error formatting date:", err, "Timestamp:", timestamp);
      return "Invalid Date";
    }
  };

  // Load data from navigation state
  useEffect(() => {
    const userData = location.state?.userData;
    console.log("Raw userData:", userData);

    if (!userData || !userData.uid) {
      console.log("No user data or UID found, redirecting to Login");
      navigate("/Login", { replace: true });
      return;
    }

    try {
      setUserId(userData.uid);
      const formattedYearEnd = userData.financialYearEnd
        ? formatDate(userData.financialYearEnd)
        : "";
      console.log("Formatted yearEnd:", formattedYearEnd);
      setFinancialData((prevData) => {
        const updatedData = {
          ...prevData,
          companyName: userData.businessName || prevData.companyName,
          yearEnd: formattedYearEnd || prevData.yearEnd,
        };
        console.log("Updated financialData:", updatedData);
        return updatedData;
      });
    } catch (err) {
      setError("Failed to load company data");
      console.error("Error in useEffect:", err);
    } finally {
      setLoading(false);
    }
  }, [location, navigate]);

  // ... Rest of your component (handleInputChange, handleSubmit functions, JSX) remains unchanged ...
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFinancialData((prevData) => ({
      ...prevData,
      [name]: name === "yearEnd" ? value : Number(value) || 0,
    }));
  };

  const handleOwnershipSubmit = (data) => {
    setOwnershipDetails(data);
    setShowOwnershipModal(false);
  };

  const handleManagementSubmit = (data) => {
    setManagementDetails(data);
    setShowManagementModal(false);
  };

  const handleEmploymentSubmit = (data) => {
    setEmploymentDetails(data);
    setShowEmploymentModal(false);
  };

  const handleYesSubmit = (data) => {
    setYesDetails(data);
    setShowYesModal(false);
  };
  const handleSkillsDevelopmentSubmit = (data) => {
    setSkillsDevelopmentDetails(data);
    setShowSkillsDevelopmentModal(false);
  };
  const handleSupplierDevelopmentSubmit = (data) => {
    setSupplierDevelopmentDetails(data);
    setShowSupplierDevelopmentModal(false);
  };
  const handleEnterpriseDevelopmentSubmit = (data) => {
    setEnterpriseDevelopmentDetails(data);
    setShowEnterpriseDevelopmentModal(false);
  };
  const handleSocioEconomicDevelopmentSubmit = (data) => {
    setSocioEconomicDevelopmentDetails(data);
    setShowSocioEconomicDevelopmentModal(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => navigate("/Login")}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Return to Login
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">B-BBEE Calculator Dashboard</h1>
        <p className="mb-4">
          Complete your company information to calculate your B-BBEE score
        </p>
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
              className="w-full p-2 border rounded bg-gray-100"
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Financial Year End</label>
            <input
              type="text"
              name="yearEnd"
              value={financialData.yearEnd}
              onChange={handleInputChange}
              placeholder="e.g., 31/Mar/2025"
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      </div>

      {/* Financial Information */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Financial Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: "turnover", label: "Turnover / Revenue (R)", placeholder: "Enter turnover" },
            { name: "npbt", label: "Net Profit Before Tax (R)", placeholder: "Enter NPBT" },
            { name: "npat", label: "Net Profit After Tax (R)", placeholder: "Enter NPAT" },
            { name: "salaries", label: "Salaries (R)", placeholder: "Enter salaries" },
            { name: "wages", label: "Wages (R)", placeholder: "Enter wages" },
            { name: "directorsEmoluments", label: "Directors Emoluments (R)", placeholder: "Enter directors emoluments" },
            { name: "annualPayroll", label: "Annual Payroll (R)", placeholder: "Enter annual payroll" },
            { name: "expenses", label: "Expenses (R)", placeholder: "Enter expenses" },
            { name: "costOfSales", label: "Cost of Sales (R)", placeholder: "Enter cost of sales" },
            { name: "depreciation", label: "Depreciation (R)", placeholder: "Enter depreciation" },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium mb-1">{field.label}</label>
              <input
                type="number"
                name={field.name}
                value={financialData[field.name]}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                placeholder={field.placeholder}
              />
            </div>
          ))}
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
            placeholder="Enter SDL payments"
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
            placeholder="Enter total leviable amount"
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
            placeholder="Enter total procurement spend"
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
          <p>
            {managementDetails?.managementData
              ? `Management details added (Black Voting Rights: ${managementDetails.managementData.blackVotingRights}%)`
              : "Add management details to calculate your B-BBEE management score"}
          </p>
          <button
            onClick={() => setShowManagementModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            {managementDetails ? "Edit Management Details" : "Add Management Details"}
          </button>
        </div>
      </div>

      {/* Employment Equity */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Employment Equity</h2>
        <div className="flex justify-between items-center">
          <p>
            {employmentDetails?.employmentData
              ? `Employment details added (Total Employees: ${employmentDetails.employmentData.totalEmployees})`
              : "Add employment details to calculate your B-BBEE employment equity score"}
          </p>
          <button
            onClick={() => setShowEmploymentModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            {employmentDetails ? "Edit Employment Details" : "Add Employment Details"}
          </button>
        </div>
      </div>

      {/* Yes 4 Youth Initiative */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Yes 4 Youth Initiative</h2>
        <div className="flex justify-between items-center">
          <p>
            {yesDetails?.yesData
              ? `YES details added (Total Participants: ${yesDetails.yesData.totalParticipants})`
              : "Add YES initiative details to calculate your B-BBEE YES contribution"}
          </p>
          <button
            onClick={() => setShowYesModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            {yesDetails ? "Edit YES Details" : "Add YES Details"}
          </button>
        </div>
      </div>

      {/* Skills Development Details */}
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Skills Development Details</h2>
      <div className="flex justify-between items-center">
        <p>
          {skillsDevelopmentDetails?.summary
            ? `Skills development details added (Total Trainings: ${skillsDevelopmentDetails.summary.totalTrainings})`
            : "Add skills development details to calculate your B-BBEE skills development score"}
        </p>
        <button
          onClick={() => setShowSkillsDevelopmentModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          {skillsDevelopmentDetails ? "Edit Skills Development Details" : "Add Skills Development Details"}
        </button>
      </div>
    </div>

    {/* Supplier Development & Imports */}
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Supplier Development & Imports</h2>
        <div className="flex justify-between items-center">
          <p>
            {supplierDevelopmentDetails?.localSummary
              ? `Supplier development details added (Total Suppliers: ${supplierDevelopmentDetails.localSummary.totalSuppliers}, Total Imports: ${supplierDevelopmentDetails.importSummary.totalImports})`
              : "Add supplier development and imports details to calculate your B-BBEE supplier development score"}
          </p>
          <button
            onClick={() => setShowSupplierDevelopmentModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            {supplierDevelopmentDetails ? "Edit Supplier Development & Imports" : "Add Supplier Development & Imports"}
          </button>
        </div>
      </div>

      {/* Enterprise Development */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Enterprise Development</h2>
        <div className="flex justify-between items-center">
          <p>
            {enterpriseDevelopmentDetails?.summary
              ? `Enterprise development details added (Total Beneficiaries: ${enterpriseDevelopmentDetails.summary.totalBeneficiaries})`
              : "Add enterprise development details to calculate your B-BBEE enterprise development score"}
          </p>
          <button
            onClick={() => setShowEnterpriseDevelopmentModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            {enterpriseDevelopmentDetails ? "Edit Enterprise Development Details" : "Add Enterprise Development Details"}
          </button>
        </div>
      </div>

      {/* Socio-Economic Development */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Socio-Economic Development</h2>
        <div className="flex justify-between items-center">
          <p>
            {socioEconomicDevelopmentDetails?.summary
              ? `Socio-economic development details added (Total Beneficiaries: ${socioEconomicDevelopmentDetails.summary.totalBeneficiaries})`
              : "Add socio-economic development details to calculate your B-BBEE SED score"}
          </p>
          <button
            onClick={() => setShowSocioEconomicDevelopmentModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            {socioEconomicDevelopmentDetails ? "Edit SED Details" : "Add SED Details"}
          </button>
        </div>
      </div>

      {/* Modals */}
      {showOwnershipModal && (
        <OwnershipDetails
          userId={userId}
          onClose={() => setShowOwnershipModal(false)}
          onSubmit={handleOwnershipSubmit}
        />
      )}
      {showManagementModal && (
        <ManagementControl
          userId={userId} // Pass userId here
          onClose={() => setShowManagementModal(false)}
          onSubmit={handleManagementSubmit}
        />
      )}
      {showEmploymentModal && ( 
        <EmploymentEquity
          userId={userId}
          onClose={() => setShowEmploymentModal(false)}
          onSubmit={handleEmploymentSubmit}
        />
      )}
      {showYesModal && (
        <Yes4YouthInitiative
          userId={userId} // Pass userId here
          onClose={() => setShowYesModal(false)}
          onSubmit={handleYesSubmit}
        />
      )}
      {showSkillsDevelopmentModal && (
        <SkillsDevelopment
          onClose={() => setShowSkillsDevelopmentModal(false)}
          onSubmit={handleSkillsDevelopmentSubmit}
        />
      )}
      {showSupplierDevelopmentModal && (
        <SupplierDevelopment
          onClose={() => setShowSupplierDevelopmentModal(false)}
          onSubmit={handleSupplierDevelopmentSubmit}
        />
      )}

{showEnterpriseDevelopmentModal && (
        <EnterpriseDevelopment
          userId={userId} // Pass userId here
          onClose={() => setShowEnterpriseDevelopmentModal(false)}
          onSubmit={handleEnterpriseDevelopmentSubmit}
        />
      )}
      
      {showSocioEconomicDevelopmentModal && (
        <SocioEconomicDevelopment
          userId={userId} // Pass userId here
          onClose={() => setShowSocioEconomicDevelopmentModal(false)}
          onSubmit={handleSocioEconomicDevelopmentSubmit}
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