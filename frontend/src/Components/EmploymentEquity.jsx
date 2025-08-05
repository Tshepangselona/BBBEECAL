import React, { useState, useEffect } from 'react';

const EmploymentEquity = ({ userId, onClose, onSubmit }) => {
  const occupationalLevels = [
    'Executive Management',
    'Other Executive Management',
    'Senior Management',
    'Middle Management',
    'Junior Management',
    'Other, Semi-Skilled & Unskilled',
  ];

  const [employees, setEmployees] = useState([]);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    siteLocation: '',
    idNumber: '',
    jobTitle: '',
    race: '',
    gender: '',
    isDisabled: false,
    descriptionOfDisability: '',
    isForeign: false,
    occupationalLevel: '',
    grossMonthlySalary: 0,
  });
  const [editingEmployeeIndex, setEditingEmployeeIndex] = useState(null);
  const [employmentData, setEmploymentData] = useState({
    totalEmployees: 0,
    blackEmployees: 0,
    blackFemaleEmployees: 0,
    disabledEmployees: 0,
    foreignEmployees: 0,
    byOccupationalLevel: occupationalLevels.reduce((acc, level) => {
      acc[level] = {
        total: 0,
        black: 0,
        blackFemale: 0,
        disabled: 0,
      };
      return acc;
    }, {}),
  });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch existing data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/employment-equity/${userId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
          const { data } = await response.json();
          if (data.length > 0) {
            setEmployees(data[0].employees);
            setEmploymentData(data[0].employmentData);
          }
        }
      } catch (error) {
        console.error('Error fetching employment equity data:', error);
      }
    };

    if (userId) fetchData();
  }, [userId]);

  const handleEmployeeChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewEmployee({
      ...newEmployee,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    });
  };

  const handleEmployeeCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      try {
        const parsedData = parseEmployeeCSV(text);
        const validatedData = validateEmployeeCSVData(parsedData);
        const updatedEmployees = [...employees, ...validatedData];
        setEmployees(updatedEmployees);
        recalculateEmploymentData(updatedEmployees);
      } catch (error) {
        alert(`Error processing employee CSV file: ${error.message}`);
      }
    };
    reader.onerror = () => {
      alert('Error reading the employee CSV file');
    };
    reader.readAsText(file);
  };

  const parseEmployeeCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) throw new Error('Empty CSV file');

    const headers = lines[0].split(',').map(header => header.trim().toLowerCase());
    const requiredHeaders = [
      'name',
      'sitelocation',
      'idnumber',
      'jobtitle',
      'race',
      'gender',
      'isdisabled',
      'descriptionofdisability',
      'isforeign',
      'occupationallevel',
      'grossmonthlysalary'
    ];

    if (!requiredHeaders.every(header => headers.includes(header))) {
      throw new Error('Employee CSV file must contain all required headers: ' + requiredHeaders.join(', '));
    }

    return lines.slice(1).map(line => {
      const values = line.split(',').map(val => val.trim());
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = values[index] || '';
      });
      return {
        name: obj.name,
        siteLocation: obj.sitelocation,
        idNumber: obj.idnumber,
        jobTitle: obj.jobtitle,
        race: obj.race,
        gender: obj.gender,
        isDisabled: obj.isdisabled.toLowerCase() === 'true',
        descriptionOfDisability: obj.descriptionofdisability,
        isForeign: obj.isforeign.toLowerCase() === 'true',
        occupationalLevel: obj.occupationallevel,
        grossMonthlySalary: Number(obj.grossmonthlysalary) || 0,
      };
    });
  };

  const validateEmployeeCSVData = (data) => {
    return data.filter(item => {
      if (!item.name || !item.idNumber || !item.jobTitle || !item.occupationalLevel) {
        console.warn('Skipping invalid employee CSV row:', item);
        return false;
      }
      if (employees.some(employee => employee.idNumber === item.idNumber)) {
        console.warn('Skipping duplicate ID number in CSV:', item.idNumber);
        return false;
      }
      if (item.grossMonthlySalary < 0) {
        console.warn('Invalid salary value in employee CSV row:', item);
        return false;
      }
      return true;
    });
  };

  const addEmployee = () => {
    if (!newEmployee.name || !newEmployee.idNumber || !newEmployee.jobTitle || !newEmployee.occupationalLevel) {
      alert('Please fill in the Name, ID Number, Job Title, and Occupational Level.');
      return;
    }
    if (employees.some(employee => employee.idNumber === newEmployee.idNumber)) {
      alert('An employee with this ID Number already exists.');
      return;
    }
    const updatedEmployees = [...employees, newEmployee];
    setEmployees(updatedEmployees);
    resetNewEmployee();
    recalculateEmploymentData(updatedEmployees);
  };

  const editEmployee = (index) => {
    setEditingEmployeeIndex(index);
    setNewEmployee(employees[index]);
  };

  const saveEditedEmployee = () => {
    if (!newEmployee.name || !newEmployee.idNumber || !newEmployee.jobTitle || !newEmployee.occupationalLevel) {
      alert('Please fill in the Name, ID Number, Job Title, and Occupational Level.');
      return;
    }
    if (
      employees.some(
        (employee, index) =>
          employee.idNumber === newEmployee.idNumber && index !== editingEmployeeIndex
      )
    ) {
      alert('An employee with this ID Number already exists.');
      return;
    }
    const updatedEmployees = employees.map((employee, index) =>
      index === editingEmployeeIndex ? newEmployee : employee
    );
    setEmployees(updatedEmployees);
    resetNewEmployee();
    setEditingEmployeeIndex(null);
    recalculateEmploymentData(updatedEmployees);
  };

  const deleteEmployee = async (index) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      setIsLoading(true);
      try {
        const updatedEmployees = employees.filter((_, i) => i !== index);
        recalculateEmploymentData(updatedEmployees);

        const checkResponse = await fetch(`http://localhost:5000/employment-equity/${userId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (checkResponse.ok) {
          const { data } = await checkResponse.json();
          if (data.length > 0) {
            const existingId = data[0].id;
            const response = await fetch(`http://localhost:5000/employment-equity/${existingId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId, employees: updatedEmployees, employmentData }),
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(`Failed to update employee data: ${errorData.error || 'Unknown error'}`);
            }
          }
        }

        setEmployees(updatedEmployees);
      } catch (error) {
        console.error('Error deleting employee:', error);
        alert(`Failed to delete employee: ${error.message}`);
        try {
          const response = await fetch(`http://localhost:5000/employment-equity/${userId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          });
          if (response.ok) {
            const { data } = await response.json();
            if (data.length > 0) {
              setEmployees(data[0].employees);
              setEmploymentData(data[0].employmentData);
            }
          }
        } catch (fetchError) {
          console.error('Error re-fetching data:', fetchError);
          alert('Failed to restore data. Please refresh the page.');
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const resetNewEmployee = () => {
    setNewEmployee({
      name: '',
      siteLocation: '',
      idNumber: '',
      jobTitle: '',
      race: '',
      gender: '',
      isDisabled: false,
      descriptionOfDisability: '',
      isForeign: false,
      occupationalLevel: '',
      grossMonthlySalary: 0,
    });
  };

  const recalculateEmploymentData = (updatedEmployees) => {
    let totalEmployees = updatedEmployees.length;
    let blackEmployees = 0;
    let blackFemaleEmployees = 0;
    let disabledEmployees = 0;
    let foreignEmployees = 0;

    const byOccupationalLevel = occupationalLevels.reduce((acc, level) => {
      acc[level] = {
        total: 0,
        black: 0,
        blackFemale: 0,
        disabled: 0,
      };
      return acc;
    }, {});

    updatedEmployees.forEach((employee) => {
      const level = employee.occupationalLevel;
      byOccupationalLevel[level].total += 1;

      if (employee.race.toLowerCase() === 'black') {
        blackEmployees += 1;
        byOccupationalLevel[level].black += 1;
        if (employee.gender.toLowerCase() === 'female') {
          blackFemaleEmployees += 1;
          byOccupationalLevel[level].blackFemale += 1;
        }
      }

      if (employee.isDisabled) {
        disabledEmployees += 1;
        byOccupationalLevel[level].disabled += 1;
      }

      if (employee.isForeign) {
        foreignEmployees += 1;
      }
    });

    setEmploymentData({
      totalEmployees,
      blackEmployees,
      blackFemaleEmployees,
      disabledEmployees,
      foreignEmployees,
      byOccupationalLevel,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting data:', { userId, employees, employmentData });

    if (!userId) {
      alert('User ID is missing. Please ensure you are logged in.');
      return;
    }

    setIsLoading(true);
    try {
      const checkResponse = await fetch(`http://localhost:5000/employment-equity/${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      let method = 'POST';
      let url = 'http://localhost:5000/employment-equity';
      let existingId = null;

      if (checkResponse.ok) {
        const { data } = await checkResponse.json();
        if (data.length > 0) {
          method = 'PUT';
          existingId = data[0].id;
          url = `http://localhost:5000/employment-equity/${existingId}`;
        }
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, employees, employmentData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to save employment equity data: ${errorData.error || 'Unknown error'}`);
      }

      const result = await response.json();
      console.log('Employment equity data saved:', result);
      onSubmit({ employees, employmentData });
      onClose();
    } catch (error) {
      console.error('Error saving employment equity data:', error);
      alert(`Failed to save employment equity data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEmploymentEquity = async () => {
    if (window.confirm('Are you sure you want to delete all employment equity data for this user?')) {
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/employment-equity/${userId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Failed to delete employment equity data: ${errorData.error || 'Unknown error'}`);
        }

        console.log('Employment equity data deleted');
        setEmployees([]);
        setEmploymentData({
          totalEmployees: 0,
          blackEmployees: 0,
          blackFemaleEmployees: 0,
          disabledEmployees: 0,
          foreignEmployees: 0,
          byOccupationalLevel: occupationalLevels.reduce((acc, level) => {
            acc[level] = {
              total: 0,
              black: 0,
              blackFemale: 0,
              disabled: 0,
            };
            return acc;
          }, {}),
        });
      } catch (error) {
        console.error('Error deleting employment equity data:', error);
        alert(`Failed to delete: ${error.message}`);
        try {
          const response = await fetch(`http://localhost:5000/employment-equity/${userId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          });
          if (response.ok) {
            const { data } = await response.json();
            if (data.length > 0) {
              setEmployees(data[0].employees);
              setEmploymentData(data[0].employmentData);
            }
          }
        } catch (fetchError) {
          console.error('Error re-fetching data:', fetchError);
          alert('Failed to restore data. Please refresh the page.');
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Employment Equity Details</h2>

        <form onSubmit={handleSubmit}>
          {/* Employee CSV Upload */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Upload Employees CSV</h3>
            <input
              type="file"
              accept=".csv"
              onChange={handleEmployeeCSVUpload}
              className="w-full p-2 border rounded"
              disabled={isLoading}
            />
            <p className="text-sm text-gray-600 mt-2">
              CSV file must contain headers: name, siteLocation, idNumber, jobTitle, race, gender,
              isDisabled, descriptionOfDisability, isForeign, occupationalLevel, grossMonthlySalary
            </p>
          </div>

          {/* Employee Input Form */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Add Employee</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name & Surname</label>
                <input
                  type="text"
                  name="name"
                  value={newEmployee.name}
                  onChange={handleEmployeeChange}
                  className="w-full p-2 border rounded"
                  placeholder="Enter name & surname"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Site/Location (if applicable)</label>
                <input
                  type="text"
                  name="siteLocation"
                  value={newEmployee.siteLocation}
                  onChange={handleEmployeeChange}
                  className="w-full p-2 border rounded"
                  placeholder="Enter site/location"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ID Number</label>
                <input
                  type="text"
                  name="idNumber"
                  value={newEmployee.idNumber}
                  onChange={handleEmployeeChange}
                  className="w-full p-2 border rounded"
                  placeholder="Enter ID number"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Job Title</label>
                <input
                  type="text"
                  name="jobTitle"
                  value={newEmployee.jobTitle}
                  onChange={handleEmployeeChange}
                  className="w-full p-2 border rounded"
                  placeholder="Enter job title"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Race</label>
                <select
                  name="race"
                  value={newEmployee.race}
                  onChange={handleEmployeeChange}
                  className="w-full p-2 border rounded"
                  disabled={isLoading}
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
                  value={newEmployee.gender}
                  onChange={handleEmployeeChange}
                  className="w-full p-2 border rounded"
                  disabled={isLoading}
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
                  checked={newEmployee.isDisabled}
                  onChange={handleEmployeeChange}
                  className="mr-2"
                  disabled={isLoading}
                />
                <label className="text-sm font-medium">Disabled</label>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description of Disability</label>
                <input
                  type="text"
                  name="descriptionOfDisability"
                  value={newEmployee.descriptionOfDisability}
                  onChange={handleEmployeeChange}
                  className="w-full p-2 border rounded"
                  placeholder="Enter description of disability"
                  disabled={!newEmployee.isDisabled || isLoading}
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isForeign"
                  checked={newEmployee.isForeign}
                  onChange={handleEmployeeChange}
                  className="mr-2"
                  disabled={isLoading}
                />
                <label className="text-sm font-medium">Foreign</label>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Occupational Level</label>
                <select
                  name="occupationalLevel"
                  value={newEmployee.occupationalLevel}
                  onChange={handleEmployeeChange}
                  className="w-full p-2 border rounded"
                  disabled={isLoading}
                >
                  <option value="">Select Occupational Level</option>
                  {occupationalLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Gross Monthly Salary (R)</label>
                <input
                  type="number"
                  name="grossMonthlySalary"
                  value={newEmployee.grossMonthlySalary}
                  onChange={handleEmployeeChange}
                  min="0"
                  className="w-full p-2 border rounded"
                  placeholder="Enter gross monthly salary"
                  disabled={isLoading}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={editingEmployeeIndex !== null ? saveEditedEmployee : addEmployee}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
              disabled={isLoading}
            >
              {editingEmployeeIndex !== null ? 'Save Edited Employee' : 'Add Employee'}
            </button>
          </div>

          {/* Employees Table */}
          {employees.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Employees List</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border border-gray-300 px-4 py-2">Name & Surname</th>
                      <th className="border border-gray-300 px-4 py-2">Site/Location</th>
                      <th className="border border-gray-300 px-4 py-2">ID Number</th>
                      <th className="border border-gray-300 px-4 py-2">Job Title</th>
                      <th className="border border-gray-300 px-4 py-2">Race</th>
                      <th className="border border-gray-300 px-4 py-2">Gender</th>
                      <th className="border border-gray-300 px-4 py-2">Disabled</th>
                      <th className="border border-gray-300 px-4 py-2">Description of Disability</th>
                      <th className="border border-gray-300 px-4 py-2">Foreign</th>
                      <th className="border border-gray-300 px-4 py-2">Occupational Level</th>
                      <th className="border border-gray-300 px-4 py-2">Gross Monthly Salary (R)</th>
                      <th className="border border-gray-300 px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((employee, index) => (
                      <tr key={employee.idNumber}>
                        <td className="border border-gray-300 px-4 py-2">{employee.name}</td>
                        <td className="border border-gray-300 px-4 py-2">{employee.siteLocation || 'N/A'}</td>
                        <td className="border border-gray-300 px-4 py-2">{employee.idNumber}</td>
                        <td className="border border-gray-300 px-4 py-2">{employee.jobTitle}</td>
                        <td className="border border-gray-300 px-4 py-2">{employee.race}</td>
                        <td className="border border-gray-300 px-4 py-2">{employee.gender}</td>
                        <td className="border border-gray-300 px-4 py-2">{employee.isDisabled ? 'Yes' : 'No'}</td>
                        <td className="border border-gray-300 px-4 py-2">{employee.descriptionOfDisability || 'N/A'}</td>
                        <td className="border border-gray-300 px-4 py-2">{employee.isForeign ? 'Yes' : 'No'}</td>
                        <td className="border border-gray-300 px-4 py-2">{employee.occupationalLevel}</td>
                        <td className="border border-gray-300 px-4 py-2">{employee.grossMonthlySalary}</td>
                        <td className="border border-gray-300 px-4 py-2">
                          <button
                            type="button"
                            onClick={() => editEmployee(index)}
                            className="bg-yellow-500 text-white px-2 py-1 rounded mr-2 hover:bg-yellow-600 disabled:bg-yellow-300"
                            disabled={isLoading}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteEmployee(index)}
                            className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 disabled:bg-red-300"
                            disabled={isLoading}
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

          {/* Aggregated Employment Data */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Employment Equity Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Total Employees</label>
                <input
                  type="number"
                  value={employmentData.totalEmployees}
                  className="w-full p-2 border rounded"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Black Employees</label>
                <input
                  type="number"
                  value={employmentData.blackEmployees}
                  className="w-full p-2 border rounded"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Black Female Employees</label>
                <input
                  type="number"
                  value={employmentData.blackFemaleEmployees}
                  className="w-full p-2 border rounded"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Disabled Employees</label>
                <input
                  type="number"
                  value={employmentData.disabledEmployees}
                  className="w-full p-2 border rounded"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Foreign Employees</label>
                <input
                  type="number"
                  value={employmentData.foreignEmployees}
                  className="w-full p-2 border rounded"
                  disabled
                />
              </div>
            </div>

            {/* Breakdown by Occupational Level */}
            <h4 className="text-md font-medium mb-2">Breakdown by Occupational Level</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border border-gray-300 px-4 py-2">Occupational Level</th>
                    <th className="border border-gray-300 px-4 py-2">Total Employees</th>
                    <th className="border border-gray-300 px-4 py-2">Black Employees</th>
                    <th className="border border-gray-300 px-4 py-2">Black Female Employees</th>
                    <th className="border border-gray-300 px-4 py-2">Employees with Disabilities</th>
                  </tr>
                </thead>
                <tbody>
                  {occupationalLevels.map((level) => (
                    <tr key={level}>
                      <td className="border border-gray-300 px-4 py-2">{level}</td>
                      <td className="border border-gray-300 px-4 py-2">{employmentData.byOccupationalLevel[level].total}</td>
                      <td className="border border-gray-300 px-4 py-2">{employmentData.byOccupationalLevel[level].black}</td>
                      <td className="border border-gray-300 px-4 py-2">{employmentData.byOccupationalLevel[level].blackFemale}</td>
                      <td className="border border-gray-300 px-4 py-2">{employmentData.byOccupationalLevel[level].disabled}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="fixed bottom-4 sm:bottom-12 right-2 sm:right-4 md:right-78 flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 bg-white p-3 sm:p-4 rounded-md shadow-lg w-[90%] sm:w-auto max-w-md">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 text-gray-800 px-3 py-2 sm:px-4 sm:py-2 rounded-md hover:bg-gray-300 w-full sm:w-auto transition-all duration-200 disabled:bg-gray-100"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={deleteEmploymentEquity}
              className="bg-red-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-md hover:bg-red-700 w-full sm:w-auto transition-all duration-200 disabled:bg-red-300"
              disabled={isLoading}
            >
              Delete All Data
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-md hover:bg-blue-700 w-full sm:w-auto transition-all duration-200 disabled:bg-blue-300"
              disabled={isLoading}
            >
              Save Employment Equity Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmploymentEquity;