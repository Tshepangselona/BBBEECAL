import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function SignUp() {
  const [formData, setFormData] = useState({
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submit clicked!", formData);
    setError("");
    setSuccess("");

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
    } catch (err) {
      console.error("Error:", err.message);
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
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
        <button
          type="submit"
          className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Sign Up
        </button>
        <p>
          Already have an account? <Link to="/Login" className="text-blue-600">Log In</Link>
        </p>
      </form>
      {error && <p className="mt-4 text-red-500">{error}</p>}
      {success && <p className="mt-4 text-green-500">{success}</p>}
    </div>
  );
}