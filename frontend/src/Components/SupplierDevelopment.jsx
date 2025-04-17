import React, { useState } from 'react';

const SupplierDevelopment = ({ onClose, onSubmit }) => {
  const [localSuppliers, setLocalSuppliers] = useState([]);
  const [newLocalSupplier, setNewLocalSupplier] = useState({
    supplierName: '',
    siteLocation: '',
    regNo: '',
    vatNo: '',
    expenditure: 0,
    supplierClassification: '',
    beeLevel: '',
    is30PercentBlackOwned: false,
    is51PercentBlackOwned: false,
    is30PercentBlackWomanOwned: false,
    blackOwnedPercentage: 0,
    blackWomanOwnedPercentage: 0,
    isESDRecipient: false,
    beeCertificateExpiryDate: '',
  });
  const [editingSupplierIndex, setEditingSupplierIndex] = useState(null); // New state for editing local supplier

  const [localSummary, setLocalSummary] = useState({
    totalSuppliers: 0,
    totalExpenditure: 0,
    blackOwnedSuppliers: 0,
    blackWomanOwnedSuppliers: 0,
    esdRecipients: 0,
  });

  const [imports, setImports] = useState([]);
  const [newImport, setNewImport] = useState({
    foreignSupplierName: '',
    siteLocation: '',
    goodsServices: '',
    expenditure: 0,
    reasonForImport: '',
    esdPlan: '',
  });
  const [editingImportIndex, setEditingImportIndex] = useState(null); // New state for editing import

  const [importSummary, setImportSummary] = useState({
    totalImports: 0,
    totalExpenditure: 0,
  });

  const handleLocalSupplierChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewLocalSupplier({
      ...newLocalSupplier,
      [name]: type === 'checkbox' ? checked : 
              type === 'number' ? (value === '' ? 0 : Number(value)) : 
              value,
    });
  };

  const addLocalSupplier = () => {
    if (!newLocalSupplier.supplierName.trim() || 
        newLocalSupplier.expenditure <= 0 || 
        !newLocalSupplier.supplierClassification.trim()) {
      alert('Please fill in the Supplier Name, Expenditure (greater than 0), and Supplier Classification.');
      return;
    }

    const updatedSuppliers = [...localSuppliers, newLocalSupplier];
    setLocalSuppliers(updatedSuppliers);
    resetNewLocalSupplier();
    recalculateLocalSummary(updatedSuppliers);
  };

  const editLocalSupplier = (index) => {
    setEditingSupplierIndex(index);
    setNewLocalSupplier(localSuppliers[index]);
  };

  const saveEditedLocalSupplier = () => {
    if (!newLocalSupplier.supplierName.trim() || 
        newLocalSupplier.expenditure <= 0 || 
        !newLocalSupplier.supplierClassification.trim()) {
      alert('Please fill in the Supplier Name, Expenditure (greater than 0), and Supplier Classification.');
      return;
    }

    const updatedSuppliers = localSuppliers.map((supplier, index) =>
      index === editingSupplierIndex ? newLocalSupplier : supplier
    );
    setLocalSuppliers(updatedSuppliers);
    resetNewLocalSupplier();
    setEditingSupplierIndex(null);
    recalculateLocalSummary(updatedSuppliers);
  };

  const deleteLocalSupplier = (index) => {
    const updatedSuppliers = localSuppliers.filter((_, i) => i !== index);
    setLocalSuppliers(updatedSuppliers);
    recalculateLocalSummary(updatedSuppliers);
  };

  const resetNewLocalSupplier = () => {
    setNewLocalSupplier({
      supplierName: '',
      siteLocation: '',
      regNo: '',
      vatNo: '',
      expenditure: 0,
      supplierClassification: '',
      beeLevel: '',
      is30PercentBlackOwned: false,
      is51PercentBlackOwned: false,
      is30PercentBlackWomanOwned: false,
      blackOwnedPercentage: 0,
      blackWomanOwnedPercentage: 0,
      isESDRecipient: false,
      beeCertificateExpiryDate: '',
    });
  };

  const recalculateLocalSummary = (updatedSuppliers) => {
    const summary = updatedSuppliers.reduce((acc, supplier) => ({
      totalSuppliers: acc.totalSuppliers + 1,
      totalExpenditure: acc.totalExpenditure + Number(supplier.expenditure || 0),
      blackOwnedSuppliers: acc.blackOwnedSuppliers + (supplier.is30PercentBlackOwned ? 1 : 0),
      blackWomanOwnedSuppliers: acc.blackWomanOwnedSuppliers + (supplier.is30PercentBlackWomanOwned ? 1 : 0),
      esdRecipients: acc.esdRecipients + (supplier.isESDRecipient ? 1 : 0),
    }), {
      totalSuppliers: 0,
      totalExpenditure: 0,
      blackOwnedSuppliers: 0,
      blackWomanOwnedSuppliers: 0,
      esdRecipients: 0,
    });

    setLocalSummary(summary);
  };

  const handleImportChange = (e) => {
    const { name, value, type } = e.target;
    setNewImport({
      ...newImport,
      [name]: type === 'number' ? (value === '' ? 0 : Number(value)) : value,
    });
  };

  const addImport = () => {
    if (!newImport.foreignSupplierName.trim() || 
        newImport.expenditure <= 0 || 
        !newImport.goodsServices.trim()) {
      alert('Please fill in the Foreign Supplier Name, Expenditure (greater than 0), and Goods/Services.');
      return;
    }

    const updatedImports = [...imports, newImport];
    setImports(updatedImports);
    resetNewImport();
    recalculateImportSummary(updatedImports);
  };

  const editImport = (index) => {
    setEditingImportIndex(index);
    setNewImport(imports[index]);
  };

  const saveEditedImport = () => {
    if (!newImport.foreignSupplierName.trim() || 
        newImport.expenditure <= 0 || 
        !newImport.goodsServices.trim()) {
      alert('Please fill in the Foreign Supplier Name, Expenditure (greater than 0), and Goods/Services.');
      return;
    }

    const updatedImports = imports.map((imp, index) =>
      index === editingImportIndex ? newImport : imp
    );
    setImports(updatedImports);
    resetNewImport();
    setEditingImportIndex(null);
    recalculateImportSummary(updatedImports);
  };

  const deleteImport = (index) => {
    const updatedImports = imports.filter((_, i) => i !== index);
    setImports(updatedImports);
    recalculateImportSummary(updatedImports);
  };

  const resetNewImport = () => {
    setNewImport({
      foreignSupplierName: '',
      siteLocation: '',
      goodsServices: '',
      expenditure: 0,
      reasonForImport: '',
      esdPlan: '',
    });
  };

  const recalculateImportSummary = (updatedImports) => {
    const summary = updatedImports.reduce((acc, imp) => ({
      totalImports: acc.totalImports + 1,
      totalExpenditure: acc.totalExpenditure + Number(imp.expenditure || 0),
    }), {
      totalImports: 0,
      totalExpenditure: 0,
    });

    setImportSummary(summary);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ localSuppliers, localSummary, imports, importSummary });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-5xl max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Supplier Development & Imports</h2>

        <form onSubmit={handleSubmit}>
          {/* Local Suppliers Form */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-2">Add Local Supplier</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Supplier Name</label>
                <input
                  type="text"
                  name="supplierName"
                  value={newLocalSupplier.supplierName}
                  onChange={handleLocalSupplierChange}
                  className="w-full p-2 border rounded"
                  placeholder="Enter supplier name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Site/Location (if applicable)</label>
                <input
                  type="text"
                  name="siteLocation"
                  value={newLocalSupplier.siteLocation}
                  onChange={handleLocalSupplierChange}
                  className="w-full p-2 border rounded"
                  placeholder="Enter site/location"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Reg No</label>
                <input
                  type="text"
                  name="regNo"
                  value={newLocalSupplier.regNo}
                  onChange={handleLocalSupplierChange}
                  className="w-full p-2 border rounded"
                  placeholder="Enter registration number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">VAT No (if applicable)</label>
                <input
                  type="text"
                  name="vatNo"
                  value={newLocalSupplier.vatNo}
                  onChange={handleLocalSupplierChange}
                  className="w-full p-2 border rounded"
                  placeholder="Enter VAT number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Expenditure (Incl. VAT)</label>
                <input
                  type="number"
                  name="expenditure"
                  value={newLocalSupplier.expenditure}
                  onChange={handleLocalSupplierChange}
                  className="w-full p-2 border rounded"
                  placeholder="Enter expenditure"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Supplier Classification</label>
                <select
                  name="supplierClassification"
                  value={newLocalSupplier.supplierClassification}
                  onChange={handleLocalSupplierChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Select Classification</option>
                  <option value="QSE">QSE</option>
                  <option value="EME">EME</option>
                  <option value="Generic">Generic</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">BEE Level</label>
                <select
                  name="beeLevel"
                  value={newLocalSupplier.beeLevel}
                  onChange={handleLocalSupplierChange}
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
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is30PercentBlackOwned"
                  checked={newLocalSupplier.is30PercentBlackOwned}
                  onChange={handleLocalSupplierChange}
                  className="mr-2"
                />
                <label className="text-sm font-medium">30% or more Black Owned</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is51PercentBlackOwned"
                  checked={newLocalSupplier.is51PercentBlackOwned}
                  onChange={handleLocalSupplierChange}
                  className="mr-2"
                />
                <label className="text-sm font-medium">51% or more Black Owned (Flow-through)</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is30PercentBlackWomanOwned"
                  checked={newLocalSupplier.is30PercentBlackWomanOwned}
                  onChange={handleLocalSupplierChange}
                  className="mr-2"
                />
                <label className="text-sm font-medium">30% or more Black Woman Owned</label>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Black Owned (%)</label>
                <input
                  type="number"
                  name="blackOwnedPercentage"
                  value={newLocalSupplier.blackOwnedPercentage}
                  onChange={handleLocalSupplierChange}
                  className="w-full p-2 border rounded"
                  placeholder="Enter percentage"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Black Woman Owned (%)</label>
                <input
                  type="number"
                  name="blackWomanOwnedPercentage"
                  value={newLocalSupplier.blackWomanOwnedPercentage}
                  onChange={handleLocalSupplierChange}
                  className="w-full p-2 border rounded"
                  placeholder="Enter percentage"
                  min="0"
                  max="100"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isESDRecipient"
                  checked={newLocalSupplier.isESDRecipient}
                  onChange={handleLocalSupplierChange}
                  className="mr-2"
                />
                <label className="text-sm font-medium">ESD Recipient & Designated Group Supplier (QSE/EME)</label>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">BEE Certificate Expiry Date</label>
                <input
                  type="date"
                  name="beeCertificateExpiryDate"
                  value={newLocalSupplier.beeCertificateExpiryDate}
                  onChange={handleLocalSupplierChange}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={editingSupplierIndex !== null ? saveEditedLocalSupplier : addLocalSupplier}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              {editingSupplierIndex !== null ? 'Save Edited Supplier' : 'Add Local Supplier'}
            </button>
          </div>

          {/* Local Suppliers Table */}
          {localSuppliers.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-2">Local Suppliers List</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border border-gray-300 px-4 py-2">Supplier Name</th>
                      <th className="border border-gray-300 px-4 py-2">Site/Location</th>
                      <th className="border border-gray-300 px-4 py-2">Reg No</th>
                      <th className="border border-gray-300 px-4 py-2">VAT No</th>
                      <th className="border border-gray-300 px-4 py-2">Expenditure (Incl. VAT)</th>
                      <th className="border border-gray-300 px-4 py-2">Supplier Classification</th>
                      <th className="border border-gray-300 px-4 py-2">BEE Level</th>
                      <th className="border border-gray-300 px-4 py-2">30%+ Black Owned</th>
                      <th className="border border-gray-300 px-4 py-2">51%+ Black Owned</th>
                      <th className="border border-gray-300 px-4 py-2">30%+ Black Woman Owned</th>
                      <th className="border border-gray-300 px-4 py-2">Black Owned (%)</th>
                      <th className="border border-gray-300 px-4 py-2">Black Woman Owned (%)</th>
                      <th className="border border-gray-300 px-4 py-2">ESD Recipient</th>
                      <th className="border border-gray-300 px-4 py-2">BEE Certificate Expiry</th>
                      <th className="border border-gray-300 px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {localSuppliers.map((supplier, index) => (
                      <tr key={index}>
                        <td className="border border-gray-300 px-4 py-2">{supplier.supplierName}</td>
                        <td className="border border-gray-300 px-4 py-2">{supplier.siteLocation || 'N/A'}</td>
                        <td className="border border-gray-300 px-4 py-2">{supplier.regNo || 'N/A'}</td>
                        <td className="border border-gray-300 px-4 py-2">{supplier.vatNo || 'N/A'}</td>
                        <td className="border border-gray-300 px-4 py-2">{supplier.expenditure}</td>
                        <td className="border border-gray-300 px-4 py-2">{supplier.supplierClassification}</td>
                        <td className="border border-gray-300 px-4 py-2">{supplier.beeLevel || 'N/A'}</td>
                        <td className="border border-gray-300 px-4 py-2">{supplier.is30PercentBlackOwned ? 'Yes' : 'No'}</td>
                        <td className="border border-gray-300 px-4 py-2">{supplier.is51PercentBlackOwned ? 'Yes' : 'No'}</td>
                        <td className="border border-gray-300 px-4 py-2">{supplier.is30PercentBlackWomanOwned ? 'Yes' : 'No'}</td>
                        <td className="border border-gray-300 px-4 py-2">{supplier.blackOwnedPercentage}%</td>
                        <td className="border border-gray-300 px-4 py-2">{supplier.blackWomanOwnedPercentage}%</td>
                        <td className="border border-gray-300 px-4 py-2">{supplier.isESDRecipient ? 'Yes' : 'No'}</td>
                        <td className="border border-gray-3
00 px-4 py-2">{supplier.beeCertificateExpiryDate || 'N/A'}</td>
                        <td className="border border-gray-300 px-4 py-2">
                          <button
                            type="button"
                            onClick={() => editLocalSupplier(index)}
                            className="bg-yellow-500 text-white px-2 py-1 rounded mr-2 hover:bg-yellow-600"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteLocalSupplier(index)}
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

          {/* Local Suppliers Summary */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-2">Local Suppliers Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Total Suppliers</label>
                <input
                  type="number"
                  value={localSummary.totalSuppliers}
                  className="w-full p-2 border rounded bg-gray-100"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Total Expenditure (R)</label>
                <input
                  type="number"
                  value={localSummary.totalExpenditure}
                  className="w-full p-2 border rounded bg-gray-100"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">30%+ Black Owned Suppliers</label>
                <input
                  type="number"
                  value={localSummary.blackOwnedSuppliers}
                  className="w-full p-2 border rounded bg-gray-100"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">30%+ Black Woman Owned Suppliers</label>
                <input
                  type="number"
                  value={localSummary.blackWomanOwnedSuppliers}
                  className="w-full p-2 border rounded bg-gray-100"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ESD Recipients (QSE/EME)</label>
                <input
                  type="number"
                  value={localSummary.esdRecipients}
                  className="w-full p-2 border rounded bg-gray-100"
                  disabled
                />
              </div>
            </div>
          </div>

          {/* Imports Form */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-2">Add Import (Foreign Supplier)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Foreign Supplier Name</label>
                <input
                  type="text"
                  name="foreignSupplierName"
                  value={newImport.foreignSupplierName}
                  onChange={handleImportChange}
                  className="w-full p-2 border rounded"
                  placeholder="Enter foreign supplier name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Site/Location (if applicable)</label>
                <input
                  type="text"
                  name="siteLocation"
                  value={newImport.siteLocation}
                  onChange={handleImportChange}
                  className="w-full p-2 border rounded"
                  placeholder="Enter site/location"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Goods/Services Procured</label>
                <input
                  type="text"
                  name="goodsServices"
                  value={newImport.goodsServices}
                  onChange={handleImportChange}
                  className="w-full p-2 border rounded"
                  placeholder="Enter goods/services"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Expenditure in ZAR for the Year</label>
                <input
                  type="number"
                  name="expenditure"
                  value={newImport.expenditure}
                  onChange={handleImportChange}
                  className="w-full p-2 border rounded"
                  placeholder="Enter expenditure"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Reason for Import</label>
                <input
                  type="text"
                  name="reasonForImport"
                  value={newImport.reasonForImport}
                  onChange={handleImportChange}
                  className="w-full p-2 border rounded"
                  placeholder="Enter reason for import"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ESD Plan for Imported Goods/Services</label>
                <input
                  type="text"
                  name="esdPlan"
                  value={newImport.esdPlan}
                  onChange={handleImportChange}
                  className="w-full p-2 border rounded"
                  placeholder="Enter ESD plan"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={editingImportIndex !== null ? saveEditedImport : addImport}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              {editingImportIndex !== null ? 'Save Edited Import' : 'Add Import'}
            </button>
          </div>

          {/* Imports Table */}
          {imports.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-2">Imports List</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border border-gray-300 px-4 py-2">Foreign Supplier Name</th>
                      <th className="border border-gray-300 px-4 py-2">Site/Location</th>
                      <th className="border border-gray-300 px-4 py-2">Goods/Services Procured</th>
                      <th className="border border-gray-300 px-4 py-2">Expenditure in ZAR</th>
                      <th className="border border-gray-300 px-4 py-2">Reason for Import</th>
                      <th className="border border-gray-300 px-4 py-2">ESD Plan</th>
                      <th className="border border-gray-300 px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {imports.map((imp, index) => (
                      <tr key={index}>
                        <td className="border border-gray-300 px-4 py-2">{imp.foreignSupplierName}</td>
                        <td className="border border-gray-300 px-4 py-2">{imp.siteLocation || 'N/A'}</td>
                        <td className="border border-gray-300 px-4 py-2">{imp.goodsServices}</td>
                        <td className="border border-gray-300 px-4 py-2">{imp.expenditure}</td>
                        <td className="border border-gray-300 px-4 py-2">{imp.reasonForImport || 'N/A'}</td>
                        <td className="border border-gray-300 px-4 py-2">{imp.esdPlan || 'N/A'}</td>
                        <td className="border border-gray-300 px-4 py-2">
                          <button
                            type="button"
                            onClick={() => editImport(index)}
                            className="bg-yellow-500 text-white px-2 py-1 rounded mr-2 hover:bg-yellow-600"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteImport(index)}
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

          {/* Imports Summary */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-2">Imports Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Total Imports</label>
                <input
                  type="number"
                  value={importSummary.totalImports}
                  className="w-full p-2 border rounded bg-gray-100"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Total Expenditure (R)</label>
                <input
                  type="number"
                  value={importSummary.totalExpenditure}
                  className="w-full p-2 border rounded bg-gray-100"
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
              Save Supplier Development & Imports
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplierDevelopment;