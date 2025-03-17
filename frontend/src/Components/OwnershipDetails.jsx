import React, { useState } from 'react';

const OwnershipDetails = ({ onClose, onSubmit }) => {
  const [participants, setParticipants] = useState([]);
  const [newParticipant, setNewParticipant] = useState({
    name: '',
    idNumber: '',
    race: '',
    gender: '',
    isForeign: false,
    isNewEntrant: false,
    designatedGroups: false,
    isYouth: false,
    isDisabled: false,
    isUnemployed: false,
    isLivingInRuralAreas: false,
    isMilitaryVeteran: false,
    economicInterest: 0,
    votingRights: 0,
    outstandingDebt: 0
  });

  const [entities, setEntities] = useState([]);
  const [newEntity, setNewEntity] = useState({
    tier: '',
    entityName: '',
    ownershipInNextTier: 0,
    modifiedFlowThroughApplied: false,
    totalBlackVotingRights: 0,
    blackWomenVotingRights: 0,
    totalBlackEconomicInterest: 0,
    blackWomenEconomicInterest: 0,
    newEntrants: 0,
    designatedGroups: 0,
    youth: 0,
    disabled: 0,
    unemployed: 0,
    livingInRuralAreas: 0,
    militaryVeteran: 0,
    esopBbos: 0,
    coOps: 0,
    outstandingDebtByBlackParticipants: 0
  });

  const [ownershipData, setOwnershipData] = useState({
    blackOwnershipPercentage: 0,
    blackFemaleOwnershipPercentage: 0,
    blackYouthOwnershipPercentage: 0,
    blackDisabledOwnershipPercentage: 0,
    blackUnemployedOwnershipPercentage: 0,
    blackRuralOwnershipPercentage: 0,
    blackMilitaryVeteranOwnershipPercentage: 0,
    votingRightsBlack: 0,
    votingRightsBlackFemale: 0,
    economicInterestBlack: 0,
    economicInterestBlackFemale: 0,
    ownershipFulfillment: false,
    netValue: 0
  });

  const handleParticipantChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewParticipant({
      ...newParticipant,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const addParticipant = () => {
    if (!newParticipant.name || !newParticipant.idNumber) {
      alert('Please fill in the Name and ID Number.');
      return;
    }

    setParticipants([...participants, newParticipant]);
    setNewParticipant({
      name: '',
      idNumber: '',
      race: '',
      gender: '',
      isForeign: false,
      isNewEntrant: false,
      designatedGroups: false,
      isYouth: false,
      isDisabled: false,
      isUnemployed: false,
      isLivingInRuralAreas: false,
      isMilitaryVeteran: false,
      economicInterest: 0,
      votingRights: 0,
      outstandingDebt: 0
    });

    recalculateOwnershipData([...participants, newParticipant]);
  };

  const handleEntityChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewEntity({
      ...newEntity,
      [name]: type === 'checkbox' ? checked : Number(value)
    });
  };

  const addEntity = () => {
    if (!newEntity.entityName || !newEntity.tier) {
      alert('Please fill in the Entity Name and Tier.');
      return;
    }

    setEntities([...entities, newEntity]);
    setNewEntity({
      tier: '',
      entityName: '',
      ownershipInNextTier: 0,
      modifiedFlowThroughApplied: false,
      totalBlackVotingRights: 0,
      blackWomenVotingRights: 0,
      totalBlackEconomicInterest: 0,
      blackWomenEconomicInterest: 0,
      newEntrants: 0,
      designatedGroups: 0,
      youth: 0,
      disabled: 0,
      unemployed: 0,
      livingInRuralAreas: 0,
      militaryVeteran: 0,
      esopBbos: 0,
      coOps: 0,
      outstandingDebtByBlackParticipants: 0
    });

    recalculateOwnershipDataFromEntities([...entities, newEntity]);
  };

  const recalculateOwnershipData = (updatedParticipants) => {
    let blackOwnershipPercentage = 0;
    let blackFemaleOwnershipPercentage = 0;
    let blackYouthOwnershipPercentage = 0;
    let blackDisabledOwnershipPercentage = 0;
    let blackUnemployedOwnershipPercentage = 0;
    let blackRuralOwnershipPercentage = 0;
    let blackMilitaryVeteranOwnershipPercentage = 0;
    let votingRightsBlack = 0;
    let votingRightsBlackFemale = 0;
    let economicInterestBlack = 0;
    let economicInterestBlackFemale = 0;

    updatedParticipants.forEach((participant) => {
      const economicInterest = Number(participant.economicInterest);
      const votingRights = Number(participant.votingRights);

      if (participant.race.toLowerCase() === 'black') {
        economicInterestBlack += economicInterest;
        votingRightsBlack += votingRights;

        if (participant.gender.toLowerCase() === 'female') {
          economicInterestBlackFemale += economicInterest;
          votingRightsBlackFemale += votingRights;
          blackFemaleOwnershipPercentage += economicInterest;
        }

        if (participant.isYouth) blackYouthOwnershipPercentage += economicInterest;
        if (participant.isDisabled) blackDisabledOwnershipPercentage += economicInterest;
        if (participant.isUnemployed) blackUnemployedOwnershipPercentage += economicInterest;
        if (participant.isLivingInRuralAreas) blackRuralOwnershipPercentage += economicInterest;
        if (participant.isMilitaryVeteran) blackMilitaryVeteranOwnershipPercentage += economicInterest;

        blackOwnershipPercentage += economicInterest;
      }
    });

    setOwnershipData({
      ...ownershipData,
      blackOwnershipPercentage,
      blackFemaleOwnershipPercentage,
      blackYouthOwnershipPercentage,
      blackDisabledOwnershipPercentage,
      blackUnemployedOwnershipPercentage,
      blackRuralOwnershipPercentage,
      blackMilitaryVeteranOwnershipPercentage,
      votingRightsBlack,
      votingRightsBlackFemale,
      economicInterestBlack,
      economicInterestBlackFemale
    });
  };

  const recalculateOwnershipDataFromEntities = (updatedEntities) => {
    let blackOwnershipPercentage = 0;
    let blackFemaleOwnershipPercentage = 0;
    let blackYouthOwnershipPercentage = 0;
    let blackDisabledOwnershipPercentage = 0;
    let blackUnemployedOwnershipPercentage = 0;
    let blackRuralOwnershipPercentage = 0;
    let blackMilitaryVeteranOwnershipPercentage = 0;
    let votingRightsBlack = 0;
    let votingRightsBlackFemale = 0;
    let economicInterestBlack = 0;
    let economicInterestBlackFemale = 0;

    updatedEntities.forEach((entity) => {
      const ownershipFactor = entity.modifiedFlowThroughApplied ? 1 : entity.ownershipInNextTier / 100;
      votingRightsBlack += entity.totalBlackVotingRights * ownershipFactor;
      votingRightsBlackFemale += entity.blackWomenVotingRights * ownershipFactor;
      economicInterestBlack += entity.totalBlackEconomicInterest * ownershipFactor;
      economicInterestBlackFemale += entity.blackWomenEconomicInterest * ownershipFactor;
      blackOwnershipPercentage += entity.totalBlackEconomicInterest * ownershipFactor;
      blackFemaleOwnershipPercentage += entity.blackWomenEconomicInterest * ownershipFactor;
      blackYouthOwnershipPercentage += entity.youth * ownershipFactor;
      blackDisabledOwnershipPercentage += entity.disabled * ownershipFactor;
      blackUnemployedOwnershipPercentage += entity.unemployed * ownershipFactor;
      blackRuralOwnershipPercentage += entity.livingInRuralAreas * ownershipFactor;
      blackMilitaryVeteranOwnershipPercentage += entity.militaryVeteran * ownershipFactor;
    });

    setOwnershipData({
      ...ownershipData,
      blackOwnershipPercentage,
      blackFemaleOwnershipPercentage,
      blackYouthOwnershipPercentage,
      blackDisabledOwnershipPercentage,
      blackUnemployedOwnershipPercentage,
      blackRuralOwnershipPercentage,
      blackMilitaryVeteranOwnershipPercentage,
      votingRightsBlack,
      votingRightsBlackFemale,
      economicInterestBlack,
      economicInterestBlackFemale
    });
  };

  const handleOwnershipChange = (e) => {
    const { name, value, type, checked } = e.target;
    setOwnershipData({
      ...ownershipData,
      [name]: type === 'checkbox' ? checked : Number(value)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ participants, entities, ownershipData });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Ownership Details</h2>

        <form onSubmit={handleSubmit}>
          {/* Participant Input Form (First Table) */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Add Participant</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name & Surname</label>
                <input
                  type="text"
                  name="name"
                  value={newParticipant.name}
                  onChange={handleParticipantChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ID Number</label>
                <input
                  type="text"
                  name="idNumber"
                  value={newParticipant.idNumber}
                  onChange={handleParticipantChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Race</label>
                <select
                  name="race"
                  value={newParticipant.race}
                  onChange={handleParticipantChange}
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
                  value={newParticipant.gender}
                  onChange={handleParticipantChange}
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
                  name="isForeign"
                  checked={newParticipant.isForeign}
                  onChange={handleParticipantChange}
                  className="mr-2"
                />
                <label className="text-sm font-medium">Foreign</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isNewEntrant"
                  checked={newParticipant.isNewEntrant}
                  onChange={handleParticipantChange}
                  className="mr-2"
                />
                <label className="text-sm font-medium">New Entrant</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="designatedGroups"
                  checked={newParticipant.designatedGroups}
                  onChange={handleParticipantChange}
                  className="mr-2"
                />
                <label className="text-sm font-medium">Designated Groups</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isYouth"
                  checked={newParticipant.isYouth}
                  onChange={handleParticipantChange}
                  className="mr-2"
                />
                <label className="text-sm font-medium">Youth</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isDisabled"
                  checked={newParticipant.isDisabled}
                  onChange={handleParticipantChange}
                  className="mr-2"
                />
                <label className="text-sm font-medium">Disabled</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isUnemployed"
                  checked={newParticipant.isUnemployed}
                  onChange={handleParticipantChange}
                  className="mr-2"
                />
                <label className="text-sm font-medium">Unemployed</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isLivingInRuralAreas"
                  checked={newParticipant.isLivingInRuralAreas}
                  onChange={handleParticipantChange}
                  className="mr-2"
                />
                <label className="text-sm font-medium">Living in Rural Areas</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isMilitaryVeteran"
                  checked={newParticipant.isMilitaryVeteran}
                  onChange={handleParticipantChange}
                  className="mr-2"
                />
                <label className="text-sm font-medium">Military Veteran</label>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Economic Interest (%)</label>
                <input
                  type="number"
                  name="economicInterest"
                  value={newParticipant.economicInterest}
                  onChange={handleParticipantChange}
                  min="0"
                  max="100"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Voting Rights (%)</label>
                <input
                  type="number"
                  name="votingRights"
                  value={newParticipant.votingRights}
                  onChange={handleParticipantChange}
                  min="0"
                  max="100"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Outstanding Debt by Black Participant (R)</label>
                <input
                  type="number"
                  name="outstandingDebt"
                  value={newParticipant.outstandingDebt}
                  onChange={handleParticipantChange}
                  min="0"
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={addParticipant}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Add Participant
            </button>
          </div>

          {/* Participants Table (First Table) */}
          {participants.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Participants List</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border border-gray-300 px-4 py-2">Name & Surname</th>
                      <th className="border border-gray-300 px-4 py-2">ID Number</th>
                      <th className="border border-gray-300 px-4 py-2">Race</th>
                      <th className="border border-gray-300 px-4 py-2">Gender</th>
                      <th className="border border-gray-300 px-4 py-2">Foreign</th>
                      <th className="border border-gray-300 px-4 py-2">New Entrant</th>
                      <th className="border border-gray-300 px-4 py-2">Designated Groups</th>
                      <th className="border border-gray-300 px-4 py-2">Youth</th>
                      <th className="border border-gray-300 px-4 py-2">Disabled</th>
                      <th className="border border-gray-300 px-4 py-2">Unemployed</th>
                      <th className="border border-gray-300 px-4 py-2">Living in Rural Areas</th>
                      <th className="border border-gray-300 px-4 py-2">Military Veteran</th>
                      <th className="border border-gray-300 px-4 py-2">Economic Interest (%)</th>
                      <th className="border border-gray-300 px-4 py-2">Voting Rights (%)</th>
                      <th className="border border-gray-300 px-4 py-2">Outstanding Debt (R)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.map((participant, index) => (
                      <tr key={index}>
                        <td className="border border-gray-300 px-4 py-2">{participant.name}</td>
                        <td className="border border-gray-300 px-4 py-2">{participant.idNumber}</td>
                        <td className="border border-gray-300 px-4 py-2">{participant.race}</td>
                        <td className="border border-gray-300 px-4 py-2">{participant.gender}</td>
                        <td className="border border-gray-300 px-4 py-2">{participant.isForeign ? 'Yes' : 'No'}</td>
                        <td className="border border-gray-300 px-4 py-2">{participant.isNewEntrant ? 'Yes' : 'No'}</td>
                        <td className="border border-gray-300 px-4 py-2">{participant.designatedGroups ? 'Yes' : 'No'}</td>
                        <td className="border border-gray-300 px-4 py-2">{participant.isYouth ? 'Yes' : 'No'}</td>
                        <td className="border border-gray-300 px-4 py-2">{participant.isDisabled ? 'Yes' : 'No'}</td>
                        <td className="border border-gray-300 px-4 py-2">{participant.isUnemployed ? 'Yes' : 'No'}</td>
                        <td className="border border-gray-300 px-4 py-2">{participant.isLivingInRuralAreas ? 'Yes' : 'No'}</td>
                        <td className="border border-gray-300 px-4 py-2">{participant.isMilitaryVeteran ? 'Yes' : 'No'}</td>
                        <td className="border border-gray-300 px-4 py-2">{participant.economicInterest}</td>
                        <td className="border border-gray-300 px-4 py-2">{participant.votingRights}</td>
                        <td className="border border-gray-300 px-4 py-2">{participant.outstandingDebt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Entity Input Form (Second Table) */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Add Entity</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tier</label>
                <input
                  type="text"
                  name="tier"
                  value={newEntity.tier}
                  onChange={handleEntityChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Entity Name</label>
                <input
                  type="text"
                  name="entityName"
                  value={newEntity.entityName}
                  onChange={handleEntityChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ownership in Next Tier (%)</label>
                <input
                  type="number"
                  name="ownershipInNextTier"
                  value={newEntity.ownershipInNextTier}
                  onChange={handleEntityChange}
                  min="0"
                  max="100"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="modifiedFlowThroughApplied"
                  checked={newEntity.modifiedFlowThroughApplied}
                  onChange={handleEntityChange}
                  className="mr-2"
                />
                <label className="text-sm font-medium">Modified Flow Through Applied</label>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Total Black Voting Rights (%)</label>
                <input
                  type="number"
                  name="totalBlackVotingRights"
                  value={newEntity.totalBlackVotingRights}
                  onChange={handleEntityChange}
                  min="0"
                  max="100"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Black Women Voting Rights (%)</label>
                <input
                  type="number"
                  name="blackWomenVotingRights"
                  value={newEntity.blackWomenVotingRights}
                  onChange={handleEntityChange}
                  min="0"
                  max="100"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Total Black Economic Interest (%)</label>
                <input
                  type="number"
                  name="totalBlackEconomicInterest"
                  value={newEntity.totalBlackEconomicInterest}
                  onChange={handleEntityChange}
                  min="0"
                  max="100"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Black Women Economic Interest (%)</label>
                <input
                  type="number"
                  name="blackWomenEconomicInterest"
                  value={newEntity.blackWomenEconomicInterest}
                  onChange={handleEntityChange}
                  min="0"
                  max="100"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">New Entrants (%)</label>
                <input
                  type="number"
                  name="newEntrants"
                  value={newEntity.newEntrants}
                  onChange={handleEntityChange}
                  min="0"
                  max="100"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Designated Groups (%)</label>
                <input
                  type="number"
                  name="designatedGroups"
                  value={newEntity.designatedGroups}
                  onChange={handleEntityChange}
                  min="0"
                  max="100"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Youth (%)</label>
                <input
                  type="number"
                  name="youth"
                  value={newEntity.youth}
                  onChange={handleEntityChange}
                  min="0"
                  max="100"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Disabled (%)</label>
                <input
                  type="number"
                  name="disabled"
                  value={newEntity.disabled}
                  onChange={handleEntityChange}
                  min="0"
                  max="100"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Unemployed (%)</label>
                <input
                  type="number"
                  name="unemployed"
                  value={newEntity.unemployed}
                  onChange={handleEntityChange}
                  min="0"
                  max="100"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Living in Rural Areas (%)</label>
                <input
                  type="number"
                  name="livingInRuralAreas"
                  value={newEntity.livingInRuralAreas}
                  onChange={handleEntityChange}
                  min="0"
                  max="100"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Military Veteran (%)</label>
                <input
                  type="number"
                  name="militaryVeteran"
                  value={newEntity.militaryVeteran}
                  onChange={handleEntityChange}
                  min="0"
                  max="100"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ESOP/BBOS (%)</label>
                <input
                  type="number"
                  name="esopBbos"
                  value={newEntity.esopBbos}
                  onChange={handleEntityChange}
                  min="0"
                  max="100"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Co-ops (%)</label>
                <input
                  type="number"
                  name="coOps"
                  value={newEntity.coOps}
                  onChange={handleEntityChange}
                  min="0"
                  max="100"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Outstanding Debt by Black Participants (R)</label>
                <input
                  type="number"
                  name="outstandingDebtByBlackParticipants"
                  value={newEntity.outstandingDebtByBlackParticipants}
                  onChange={handleEntityChange}
                  min="0"
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={addEntity}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Add Entity
            </button>
          </div>

          {/* Entities Table (Second Table) */}
          {entities.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Entities List</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border border-gray-300 px-4 py-2">Tier</th>
                      <th className="border border-gray-300 px-4 py-2">Entity Name</th>
                      <th className="border border-gray-300 px-4 py-2">Ownership in Next Tier (%)</th>
                      <th className="border border-gray-300 px-4 py-2">Modified Flow Through Applied</th>
                      <th className="border border-gray-300 px-4 py-2">Total Black Voting Rights (%)</th>
                      <th className="border border-gray-300 px-4 py-2">Black Women Voting Rights (%)</th>
                      <th className="border border-gray-300 px-4 py-2">Total Black Economic Interest (%)</th>
                      <th className="border border-gray-300 px-4 py-2">Black Women Economic Interest (%)</th>
                      <th className="border border-gray-300 px-4 py-2">New Entrants (%)</th>
                      <th className="border border-gray-300 px-4 py-2">Designated Groups (%)</th>
                      <th className="border border-gray-300 px-4 py-2">Youth (%)</th>
                      <th className="border border-gray-300 px-4 py-2">Disabled (%)</th>
                      <th className="border border-gray-300 px-4 py-2">Unemployed (%)</th>
                      <th className="border border-gray-300 px-4 py-2">Living in Rural Areas (%)</th>
                      <th className="border border-gray-300 px-4 py-2">Military Veteran (%)</th>
                      <th className="border border-gray-300 px-4 py-2">ESOP/BBOS (%)</th>
                      <th className="border border-gray-300 px-4 py-2">Co-ops (%)</th>
                      <th className="border border-gray-300 px-4 py-2">Outstanding Debt by Black Participants (R)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entities.map((entity, index) => (
                      <tr key={index}>
                        <td className="border border-gray-300 px-4 py-2">{entity.tier}</td>
                        <td className="border border-gray-300 px-4 py-2">{entity.entityName}</td>
                        <td className="border border-gray-300 px-4 py-2">{entity.ownershipInNextTier}</td>
                        <td className="border border-gray-300 px-4 py-2">{entity.modifiedFlowThroughApplied ? 'Yes' : 'No'}</td>
                        <td className="border border-gray-300 px-4 py-2">{entity.totalBlackVotingRights}</td>
                        <td className="border border-gray-300 px-4 py-2">{entity.blackWomenVotingRights}</td>
                        <td className="border border-gray-300 px-4 py-2">{entity.totalBlackEconomicInterest}</td>
                        <td className="border border-gray-300 px-4 py-2">{entity.blackWomenEconomicInterest}</td>
                        <td className="border border-gray-300 px-4 py-2">{entity.newEntrants}</td>
                        <td className="border border-gray-300 px-4 py-2">{entity.designatedGroups}</td>
                        <td className="border border-gray-300 px-4 py-2">{entity.youth}</td>
                        <td className="border border-gray-300 px-4 py-2">{entity.disabled}</td>
                        <td className="border border-gray-300 px-4 py-2">{entity.unemployed}</td>
                        <td className="border border-gray-300 px-4 py-2">{entity.livingInRuralAreas}</td>
                        <td className="border border-gray-300 px-4 py-2">{entity.militaryVeteran}</td>
                        <td className="border border-gray-300 px-4 py-2">{entity.esopBbos}</td>
                        <td className="border border-gray-300 px-4 py-2">{entity.coOps}</td>
                        <td className="border border-gray-300 px-4 py-2">{entity.outstandingDebtByBlackParticipants}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Aggregated Ownership Data */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Aggregated Ownership Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Black Ownership (%)</label>
                <input
                  type="number"
                  name="blackOwnershipPercentage"
                  value={ownershipData.blackOwnershipPercentage}
                  onChange={handleOwnershipChange}
                  min="0"
                  max="100"
                  className="w-full p-2 border rounded"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Black Female Ownership (%)</label>
                <input
                  type="number"
                  name="blackFemaleOwnershipPercentage"
                  value={ownershipData.blackFemaleOwnershipPercentage}
                  onChange={handleOwnershipChange}
                  min="0"
                  max="100"
                  className="w-full p-2 border rounded"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Black Youth Ownership (%)</label>
                <input
                  type="number"
                  name="blackYouthOwnershipPercentage"
                  value={ownershipData.blackYouthOwnershipPercentage}
                  onChange={handleOwnershipChange}
                  min="0"
                  max="100"
                  className="w-full p-2 border rounded"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Black Disabled Ownership (%)</label>
                <input
                  type="number"
                  name="blackDisabledOwnershipPercentage"
                  value={ownershipData.blackDisabledOwnershipPercentage}
                  onChange={handleOwnershipChange}
                  min="0"
                  max="100"
                  className="w-full p-2 border rounded"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Black Unemployed Ownership (%)</label>
                <input
                  type="number"
                  name="blackUnemployedOwnershipPercentage"
                  value={ownershipData.blackUnemployedOwnershipPercentage}
                  onChange={handleOwnershipChange}
                  min="0"
                  max="100"
                  className="w-full p-2 border rounded"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Black Rural Ownership (%)</label>
                <input
                  type="number"
                  name="blackRuralOwnershipPercentage"
                  value={ownershipData.blackRuralOwnershipPercentage}
                  onChange={handleOwnershipChange}
                  min="0"
                  max="100"
                  className="w-full p-2 border rounded"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Black Military Veteran Ownership (%)</label>
                <input
                  type="number"
                  name="blackMilitaryVeteranOwnershipPercentage"
                  value={ownershipData.blackMilitaryVeteranOwnershipPercentage}
                  onChange={handleOwnershipChange}
                  min="0"
                  max="100"
                  className="w-full p-2 border rounded"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Voting Rights - Black (%)</label>
                <input
                  type="number"
                  name="votingRightsBlack"
                  value={ownershipData.votingRightsBlack}
                  onChange={handleOwnershipChange}
                  min="0"
                  max="100"
                  className="w-full p-2 border rounded"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Voting Rights - Black Female (%)</label>
                <input
                  type="number"
                  name="votingRightsBlackFemale"
                  value={ownershipData.votingRightsBlackFemale}
                  onChange={handleOwnershipChange}
                  min="0"
                  max="100"
                  className="w-full p-2 border rounded"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Economic Interest - Black (%)</label>
                <input
                  type="number"
                  name="economicInterestBlack"
                  value={ownershipData.economicInterestBlack}
                  onChange={handleOwnershipChange}
                  min="0"
                  max="100"
                  className="w-full p-2 border rounded"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Economic Interest - Black Female (%)</label>
                <input
                  type="number"
                  name="economicInterestBlackFemale"
                  value={ownershipData.economicInterestBlackFemale}
                  onChange={handleOwnershipChange}
                  min="0"
                  max="100"
                  className="w-full p-2 border rounded"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Net Value (R)</label>
                <input
                  type="number"
                  name="netValue"
                  value={ownershipData.netValue}
                  onChange={handleOwnershipChange}
                  min="0"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="ownershipFulfillment"
                  checked={ownershipData.ownershipFulfillment}
                  onChange={handleOwnershipChange}
                  className="mr-2"
                />
                <label className="text-sm font-medium">Ownership Fulfillment</label>
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
              Save Ownership Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OwnershipDetails;