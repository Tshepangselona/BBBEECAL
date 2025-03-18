import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    businessName: "",
    financialYearEnd: "",
    address: "",
    businessEmail: "",
    contactNumber: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Function to validate DD/MMM/YYYY format
  const validateDateFormat = (dateStr) => {
    const regex = /^(\d{2})\/([A-Za-z]{3})\/(\d{4})$/;
    if (!regex.test(dateStr)) return false;
    
    const [, day, monthStr, year] = dateStr.match(regex);
    const month = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]
      .indexOf(monthStr.toLowerCase()) + 1;
    
    if (month === 0) return false; // Invalid month
    const dayNum = parseInt(day);
    const yearNum = parseInt(year);
    
    if (dayNum < 1 || dayNum > 31) return false;
    if (yearNum < 1900 || yearNum > 9999) return false;
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
  
    if (!validateDateFormat(formData.financialYearEnd)) {
      setError("Please enter Financial Year End in DD/MMM/YYYY format (e.g., 31/Mar/2025)");
      return;
    }
  
    try {
      const res = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
  
      if (!res.ok) {
        throw new Error(data.error || "Signup failed");
      }
  
      setSuccess(data.message);
      const [, day, monthStr, year] = formData.financialYearEnd.match(/^(\d{2})\/([A-Za-z]{3})\/(\d{4})$/);
      const month = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]
        .indexOf(monthStr.toLowerCase()); // 0-based month
      const dateObject = new Date(year, month, day);
  
      navigate("/Home", { 
        state: { 
          userData: { 
            businessName: formData.businessName, 
            financialYearEnd: dateObject 
          } 
        } 
      });
    } catch (err) {
      setError(err.message);
    }
  };
  
  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            name="businessName"
            placeholder="Business Name"
            value={formData.businessName}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <input
            type="text"
            name="financialYearEnd"
            placeholder="Financial Year End (e.g., 31/Mar/2025)"
            value={formData.financialYearEnd}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
            pattern="\d{2}/[A-Za-z]{3}/\d{4}"
            title="Please enter date in DD/MMM/YYYY format (e.g., 31/Mar/2025)"
          />
          <p className="text-sm text-gray-500 mt-1">Format: DD/MMM/YYYY (e.g., 31/Mar/2025)</p>
        </div>
        <div>
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <input
            type="email"
            name="businessEmail"
            placeholder="Business Email"
            value={formData.businessEmail}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <input
            type="tel"
            name="contactNumber"
            placeholder="Contact Number"
            value={formData.contactNumber}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Sign Up
        </button>
        <p>
          Already Signed in? <Link to="/Login" className="text-blue-600">Log In</Link>
        </p>
      </form>
      {error && <p className="mt-4 text-red-500">{error}</p>}
      {success && <p className="mt-4 text-green-500">{success}</p>}
    </div>
  );
}