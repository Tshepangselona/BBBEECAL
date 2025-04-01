import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

<<<<<<< HEAD
export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    businessName: "",
    financialYearEnd: "",
    address: "",
=======
export default function SignUp() {
  const [formData, setFormData] = useState({
>>>>>>> 4de07a1c5a1cfd0fb674a80b72a57e6384a0e03d
    businessEmail: "",
    Sector: "",
    businessName: "",
    financialYearEnd: "",
    address: "",
    contactNumber: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

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
    console.log("Submit clicked!", formData);
    setError("");
    setSuccess("");

    if (!validateDateFormat(formData.financialYearEnd)) {
      setError("Please enter Financial Year End in DD/MMM/YYYY format (e.g., 31/Mar/2025)");
      return;
    }

    try {
      console.log("Sending request to backend...");
      const res = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      console.log("Response received:", res.status);
      const data = await res.json();

      if (!res.ok) {
<<<<<<< HEAD
        throw new Error(data.error || "Signup failed");
      }

      // Reflect the backend's success message, including email notification
      setSuccess(`${data.message}. Please check your email (${formData.businessEmail}) for confirmation.`);

      // Clear the form
      setFormData({
        businessName: "",
        financialYearEnd: "",
        address: "",
        businessEmail: "",
        contactNumber: "",
        password: "",
      });

      // Navigate to Home with user data
      const [, day, monthStr, year] = formData.financialYearEnd.match(/^(\d{2})\/([A-Za-z]{3})\/(\d{4})$/);
      const month = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]
        .indexOf(monthStr.toLowerCase());
      const dateObject = new Date(year, month, day);

      navigate("/Home", { 
        state: { 
          userData: { 
            businessName: formData.businessName, 
            financialYearEnd: dateObject 
          } 
        } 
      });
=======
        console.error("Server error response:", data);
        throw new Error(data.error || "Something went wrong");
      }

      console.log("Raw data from backend:", data);
      setSuccess(data.message);

      const userData = {
        uid: data.uid,
        businessName: data.businessName,
        financialYearEnd: data.financialYearEnd,
        sector: data.sector,
      };
      console.log("userData being passed to Home:", userData);

      localStorage.setItem("userId", data.uid);
      navigate("/Login", { state: { userData } });
>>>>>>> 4de07a1c5a1cfd0fb674a80b72a57e6384a0e03d
    } catch (err) {
      console.error("Error:", err.message);
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
<<<<<<< HEAD
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
=======
        <input
          type="email"
          name="businessEmail"
          placeholder="Business Email"
          value={formData.businessEmail}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          name="businessName"
          placeholder="Business Name"
          value={formData.businessName}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          name="financialYearEnd"
          placeholder="Financial Year End (DD/MMM/YYYY)"
          value={formData.financialYearEnd}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="tel"
          name="contactNumber"
          placeholder="Contact Number"
          value={formData.contactNumber}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <select
          name="Sector"
          value={formData.Sector}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Select Sector</option>
          <option value="Generic">Generic</option>
          <option value="Tourism">Tourism</option>
          <option value="Construction">Construction</option>
          <option value="ICT">ICT</option>
        </select>
>>>>>>> 4de07a1c5a1cfd0fb674a80b72a57e6384a0e03d
        <button
          type="submit"
          className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Sign Up
        </button>
        <p>
<<<<<<< HEAD
          Already Signed in? <Link to="/Login" className="text-blue-600">Log In</Link>
=======
          Already have an account? <Link to="/Login" className="text-blue-600">Log In</Link>
>>>>>>> 4de07a1c5a1cfd0fb674a80b72a57e6384a0e03d
        </p>
      </form>
      {error && <p className="mt-4 text-red-500">{error}</p>}
      {success && <p className="mt-4 text-green-500">{success}</p>}
    </div>
  );
}