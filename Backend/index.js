const express = require("express");
const cors = require("cors");
const { auth, db } = require("./firebase");
const { createUserWithEmailAndPassword, signInWithEmailAndPassword } = require("firebase/auth");
const { doc, setDoc, getDoc, collection, addDoc, query, where, getDocs } = require("firebase/firestore");

const app = express();
app.use(cors());
app.use(express.json());

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

const PORT = process.env.PORT || 5000;

const validateDateFormat = (dateStr) => {
  const regex = /^(\d{2})\/([A-Za-z]{3})\/(\d{4})$/;
  if (!regex.test(dateStr)) return false;
  
  const [, day, monthStr, year] = dateStr.match(regex);
  const month = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]
    .indexOf(monthStr.toLowerCase()) + 1;
  
  if (month === 0) return false;
  const dayNum = parseInt(day);
  const yearNum = parseInt(year);
  
  if (dayNum < 1 || dayNum > 31) return false;
  if (yearNum < 1900 || yearNum > 9999) return false;
  
  return true;
};

// SignUp route
app.post("/signup", async (req, res) => {
  const { businessEmail, password, businessName, financialYearEnd, address, contactNumber } = req.body;

  try {
    if (!validateDateFormat(financialYearEnd)) {
      return res.status(400).json({ error: "Invalid financial year end format. Please use DD/MMM/YYYY (e.g., 31/Mar/2025)" });
    }

    const [, day, monthStr, year] = financialYearEnd.match(/^(\d{2})\/([A-Za-z]{3})\/(\d{4})$/);
    const month = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]
      .indexOf(monthStr.toLowerCase());
    const dateObject = new Date(year, month, day);

    if (isNaN(dateObject.getTime())) {
      return res.status(400).json({ error: "Invalid date value for Financial Year End" });
    }

    const userCredential = await createUserWithEmailAndPassword(auth, businessEmail, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      businessName,
      financialYearEnd: dateObject,
      address,
      contactNumber,
      businessEmail,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ 
      message: "User created successfully", 
      uid: user.uid, 
      businessName, 
      financialYearEnd: dateObject 
    });
  } catch (error) {
    console.error("Signup error:", error.code, error.message);
    res.status(400).json({ error: error.message, code: error.code });
  }
});

// Login route
app.post("/login", async (req, res) => {
  const { businessEmail, password } = req.body;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, businessEmail, password);
    const user = userCredential.user;
    const userDoc = await getDoc(doc(db, "users", user.uid));
    
    if (!userDoc.exists()) {
      return res.status(404).json({ error: "User data not found" });
    }

    const userData = userDoc.data();
    res.status(200).json({ 
      message: "Login successful", 
      uid: user.uid, 
      businessName: userData.businessName, 
      financialYearEnd: userData.financialYearEnd 
    });
  } catch (error) {
    console.error("Login error:", error.code, error.message);
    if (error.code === "auth/invalid-credential") {
      res.status(401).json({ error: "Invalid email or password" });
    } else {
      res.status(500).json({ error: "Something went wrong", code: error.code });
    }
  }
});

// Test route to confirm server is working
app.get('/test', (req, res) => {
  res.status(200).json({ message: 'Test route working' });
});

// Management Control Table- creating the table
app.post("/management-control", async (req, res) => {
  console.log("Management control POST hit with body:", req.body);
  const { userId, managers, managementData } = req.body;

  try {
    if (!userId) {
      console.log("Missing userId");
      return res.status(400).json({ error: "User ID is required" });
    }
    if (!managers || !Array.isArray(managers)) {
      console.log("Invalid managers data");
      return res.status(400).json({ error: "Managers must be an array" });
    }

    const userDoc = await getDoc(doc(db, "users", userId));
    if (!userDoc.exists()) {
      console.log("User not found for userId:", userId);
      return res.status(404).json({ error: "User not found" });
    }

    const managementControlData = {
      userId,
      managers: managers.map(manager => ({
        name: manager.name,
        siteLocation: manager.siteLocation || "",
        idNumber: manager.idNumber,
        position: manager.position,
        jobTitle: manager.jobTitle || "",
        race: manager.race || "",
        gender: manager.gender || "",
        isDisabled: manager.isDisabled || false,
        votingRights: Number(manager.votingRights) || 0,
        isExecutiveDirector: manager.isExecutiveDirector || false,
        isIndependentNonExecutive: manager.isIndependentNonExecutive || false
      })),
      managementData: {
        totalVotingRights: Number(managementData.totalVotingRights) || 0,
        blackVotingRights: Number(managementData.blackVotingRights) || 0,
        blackFemaleVotingRights: Number(managementData.blackFemaleVotingRights) || 0,
        disabledVotingRights: Number(managementData.disabledVotingRights) || 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, "managementControl"), managementControlData);

    res.status(201).json({
      message: "Management control data saved successfully",
      id: docRef.id,
      ...managementControlData
    });
  } catch (error) {
    console.error("Detailed error:", error);
    res.status(400).json({ error: error.message, code: error.code });
  }
});


// Management Control - Retrieve
app.get("/management-control/:userId", async (req, res) => {  const { userId } = req.params;

  try {
    const managementRef = collection(db, "managementControl");
    const q = query(managementRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    const managementRecords = [];
    querySnapshot.forEach((doc) => {
      managementRecords.push({
        id: doc.id,
        ...doc.data()
      });
    });

    if (managementRecords.length === 0) {
      return res.status(404).json({ message: "No management control data found for this user" });
    }

    res.status(200).json({
      message: "Management control data retrieved successfully",
      data: managementRecords
    });
  } catch (error) {
    console.error("Management control retrieval error:", error.code, error.message);
    res.status(500).json({ error: error.message, code: error.code });
  }
});

// Employment Equity - Create
app.post("/employment-equity", async (req, res) => {
  console.log("Employment equity POST hit with body:", req.body);
  const { userId, employees, employmentData } = req.body;

  try {
    if (!userId) {
      console.log("Missing userId");
      return res.status(400).json({ error: "User ID is required" });
    }
    if (!employees || !Array.isArray(employees)) {
      console.log("Invalid employees data");
      return res.status(400).json({ error: "Employees must be an array" });
    }
    if (!employmentData || typeof employmentData !== 'object') {
      console.log("Invalid employmentData");
      return res.status(400).json({ error: "Employment data must be an object" });
    }

    const userDoc = await getDoc(doc(db, "users", userId));
    if (!userDoc.exists()) {
      console.log("User not found for userId:", userId);
      return res.status(404).json({ error: "User not found" });
    }

    const employmentEquityData = {
      userId,
      employees: employees.map(employee => ({
        name: employee.name || "",
        siteLocation: employee.siteLocation || "",
        idNumber: employee.idNumber || "",
        jobTitle: employee.jobTitle || "",
        race: employee.race || "",
        gender: employee.gender || "",
        isDisabled: Boolean(employee.isDisabled),
        descriptionOfDisability: employee.descriptionOfDisability || "",
        isForeign: Boolean(employee.isForeign),
        occupationalLevel: employee.occupationalLevel || "",
        grossMonthlySalary: Number(employee.grossMonthlySalary) || 0
      })),
      employmentData: {
        totalEmployees: Number(employmentData.totalEmployees) || 0,
        blackEmployees: Number(employmentData.blackEmployees) || 0,
        blackFemaleEmployees: Number(employmentData.blackFemaleEmployees) || 0,
        disabledEmployees: Number(employmentData.disabledEmployees) || 0,
        foreignEmployees: Number(employmentData.foreignEmployees) || 0,
        byOccupationalLevel: employmentData.byOccupationalLevel || {}
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, "employmentEquity"), employmentEquityData);

    res.status(201).json({
      message: "Employment equity data saved successfully",
      id: docRef.id,
      ...employmentEquityData
    });
  } catch (error) {
    console.error("Detailed error:", error);
    res.status(400).json({ error: error.message, code: error.code });
  }
});

// Employment Equity - Retrieve
app.get("/employment-equity/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const employmentRef = collection(db, "employmentEquity");
    const q = query(employmentRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    const employmentRecords = [];
    querySnapshot.forEach((doc) => {
      employmentRecords.push({
        id: doc.id,
        ...doc.data()
      });
    });

    if (employmentRecords.length === 0) {
      return res.status(404).json({ message: "No employment equity data found for this user" });
    }

    res.status(200).json({
      message: "Employment equity data retrieved successfully",
      data: employmentRecords
    });
  } catch (error) {
    console.error("Employment equity retrieval error:", error.code, error.message);
    res.status(500).json({ error: error.message, code: error.code });
  }
});

// Yes 4 Youth Initiative - Create
app.post("/yes4youth-initiative", async (req, res) => {
  console.log("Yes 4 Youth Initiative POST hit with body:", req.body);
  const { userId, participants, yesData } = req.body;

  try {
    if (!userId) {
      console.log("Missing userId");
      return res.status(400).json({ error: "User ID is required" });
    }
    if (!participants || !Array.isArray(participants)) {
      console.log("Invalid participants data");
      return res.status(400).json({ error: "Participants must be an array" });
    }
    if (!yesData || typeof yesData !== 'object') {
      console.log("Invalid yesData");
      return res.status(400).json({ error: "YES data must be an object" });
    }

    const userDoc = await getDoc(doc(db, "users", userId));
    if (!userDoc.exists()) {
      console.log("User not found for userId:", userId);
      return res.status(404).json({ error: "User not found" });
    }

    const yes4YouthInitiativeData = {
      userId,
      participants: participants.map(participant => ({
        name: participant.name || "",
        siteLocation: participant.siteLocation || "",
        idNumber: participant.idNumber || "",
        jobTitle: participant.jobTitle || "",
        race: participant.race || "",
        gender: participant.gender || "",
        occupationalLevel: participant.occupationalLevel || "",
        hostEmployerYear: participant.hostEmployerYear || "",
        monthlyStipend: Number(participant.monthlyStipend) || 0,
        startDate: participant.startDate || "",
        endDate: participant.endDate || "",
        isCurrentYesEmployee: Boolean(participant.isCurrentYesEmployee),
        isCompletedYesAbsorbed: Boolean(participant.isCompletedYesAbsorbed)
      })),
      yesData: {
        totalParticipants: Number(yesData.totalParticipants) || 0,
        blackYouthParticipants: Number(yesData.blackYouthParticipants) || 0,
        totalStipendPaid: Number(yesData.totalStipendPaid) || 0,
        currentYesEmployees: Number(yesData.currentYesEmployees) || 0,
        completedYesAbsorbed: Number(yesData.completedYesAbsorbed) || 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, "yes4YouthInitiative"), yes4YouthInitiativeData);

    res.status(201).json({
      message: "YES 4 Youth Initiative data saved successfully",
      id: docRef.id,
      ...yes4YouthInitiativeData
    });
  } catch (error) {
    console.error("Detailed error:", error);
    res.status(400).json({ error: error.message, code: error.code });
  }
});

// Yes 4 Youth Initiative - Retrieve
app.get("/yes4youth-initiative/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const yesRef = collection(db, "yes4YouthInitiative");
    const q = query(yesRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    const yesRecords = [];
    querySnapshot.forEach((doc) => {
      yesRecords.push({
        id: doc.id,
        ...doc.data()
      });
    });

    if (yesRecords.length === 0) {
      return res.status(404).json({ message: "No YES 4 Youth Initiative data found for this user" });
    }

    res.status(200).json({
      message: "YES 4 Youth Initiative data retrieved successfully",
      data: yesRecords
    });
  } catch (error) {
    console.error("YES 4 Youth Initiative retrieval error:", error.code, error.message);
    res.status(500).json({ error: error.message, code: error.code });
  }
});

// Skills Development - Create
app.post("/skills-development", async (req, res) => {
  console.log("Skills Development POST hit with body:", req.body);
  const { userId, trainings, summary } = req.body;

  try {
    if (!userId) {
      console.log("Missing userId");
      return res.status(400).json({ error: "User ID is required" });
    }
    if (!trainings || !Array.isArray(trainings)) {
      console.log("Invalid trainings data");
      return res.status(400).json({ error: "Trainings must be an array" });
    }
    if (!summary || typeof summary !== "object") {
      console.log("Invalid summary data");
      return res.status(400).json({ error: "Summary must be an object" });
    }

    const userDoc = await getDoc(doc(db, "users", userId));
    if (!userDoc.exists()) {
      console.log("User not found for userId:", userId);
      return res.status(404).json({ error: "User not found" });
    }

    const skillsDevelopmentData = {
      userId,
      trainings: trainings.map((training) => ({
        startDate: training.startDate || "",
        endDate: training.endDate || "",
        trainingCourse: training.trainingCourse || "",
        trainerProvider: training.trainerProvider || "",
        category: training.category || "",
        learnerName: training.learnerName || "",
        siteLocation: training.siteLocation || "",
        idNumber: training.idNumber || "",
        race: training.race || "",
        gender: training.gender || "",
        isDisabled: Boolean(training.isDisabled),
        coreCriticalSkills: training.coreCriticalSkills || "",
        totalDirectExpenditure: Number(training.totalDirectExpenditure) || 0,
        additionalExpenditure: Number(training.additionalExpenditure) || 0,
        costToCompanySalary: Number(training.costToCompanySalary) || 0,
        trainingDurationHours: Number(training.trainingDurationHours) || 0,
        numberOfParticipants: Number(training.numberOfParticipants) || 0,
        isUnemployedLearner: Boolean(training.isUnemployedLearner),
        isAbsorbedInternalTrainer: Boolean(training.isAbsorbedInternalTrainer),
      })),
      summary: {
        totalTrainings: Number(summary.totalTrainings) || 0,
        totalDirectExpenditure: Number(summary.totalDirectExpenditure) || 0,
        totalAdditionalExpenditure: Number(summary.totalAdditionalExpenditure) || 0,
        totalCostToCompanySalary: Number(summary.totalCostToCompanySalary) || 0,
        totalTrainingHours: Number(summary.totalTrainingHours) || 0,
        totalParticipants: Number(summary.totalParticipants) || 0,
        unemployedLearners: Number(summary.unemployedLearners) || 0,
        absorbedInternalTrainers: Number(summary.absorbedInternalTrainers) || 0,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, "skillsDevelopment"), skillsDevelopmentData);

    res.status(201).json({
      message: "Skills development data saved successfully",
      id: docRef.id,
      ...skillsDevelopmentData,
    });
  } catch (error) {
    console.error("Detailed error:", error);
    res.status(400).json({ error: error.message, code: error.code });
  }
});

// Skills Development - Retrieve
app.get("/skills-development/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const skillsRef = collection(db, "skillsDevelopment");
    const q = query(skillsRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    const skillsRecords = [];
    querySnapshot.forEach((doc) => {
      skillsRecords.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    if (skillsRecords.length === 0) {
      return res.status(404).json({ message: "No skills development data found for this user" });
    }

    res.status(200).json({
      message: "Skills development data retrieved successfully",
      data: skillsRecords,
    });
  } catch (error) {
    console.error("Skills development retrieval error:", error.code, error.message);
    res.status(500).json({ error: error.message, code: error.code });
  }
});

// Ownership Details - Create
app.post("/ownership-details", async (req, res) => {
  console.log("Ownership Details POST hit with body:", req.body);
  const { userId, participants, entities, ownershipData } = req.body;

  try {
    if (!userId) {
      console.log("Missing userId");
      return res.status(400).json({ error: "User ID is required" });
    }
    if (!participants || !Array.isArray(participants)) {
      console.log("Invalid participants data");
      return res.status(400).json({ error: "Participants must be an array" });
    }
    if (!entities || !Array.isArray(entities)) {
      console.log("Invalid entities data");
      return res.status(400).json({ error: "Entities must be an array" });
    }
    if (!ownershipData || typeof ownershipData !== "object") {
      console.log("Invalid ownershipData");
      return res.status(400).json({ error: "Ownership data must be an object" });
    }

    const userDoc = await getDoc(doc(db, "users", userId));
    if (!userDoc.exists()) {
      console.log("User not found for userId:", userId);
      return res.status(404).json({ error: "User not found" });
    }

    const ownershipDetailsData = {
      userId,
      participants: participants.map((participant) => ({
        name: participant.name || "",
        idNumber: participant.idNumber || "",
        race: participant.race || "",
        gender: participant.gender || "",
        isForeign: Boolean(participant.isForeign),
        isNewEntrant: Boolean(participant.isNewEntrant),
        designatedGroups: Boolean(participant.designatedGroups),
        isYouth: Boolean(participant.isYouth),
        isDisabled: Boolean(participant.isDisabled),
        isUnemployed: Boolean(participant.isUnemployed),
        isLivingInRuralAreas: Boolean(participant.isLivingInRuralAreas),
        isMilitaryVeteran: Boolean(participant.isMilitaryVeteran),
        economicInterest: Number(participant.economicInterest) || 0,
        votingRights: Number(participant.votingRights) || 0,
        outstandingDebt: Number(participant.outstandingDebt) || 0,
      })),
      entities: entities.map((entity) => ({
        tier: entity.tier || "",
        entityName: entity.entityName || "",
        ownershipInNextTier: Number(entity.ownershipInNextTier) || 0,
        modifiedFlowThroughApplied: Boolean(entity.modifiedFlowThroughApplied),
        totalBlackVotingRights: Number(entity.totalBlackVotingRights) || 0,
        blackWomenVotingRights: Number(entity.blackWomenVotingRights) || 0,
        totalBlackEconomicInterest: Number(entity.totalBlackEconomicInterest) || 0,
        blackWomenEconomicInterest: Number(entity.blackWomenEconomicInterest) || 0,
        newEntrants: Number(entity.newEntrants) || 0,
        designatedGroups: Number(entity.designatedGroups) || 0,
        youth: Number(entity.youth) || 0,
        disabled: Number(entity.disabled) || 0,
        unemployed: Number(entity.unemployed) || 0,
        livingInRuralAreas: Number(entity.livingInRuralAreas) || 0,
        militaryVeteran: Number(entity.militaryVeteran) || 0,
        esopBbos: Number(entity.esopBbos) || 0,
        coOps: Number(entity.coOps) || 0,
        outstandingDebtByBlackParticipants: Number(entity.outstandingDebtByBlackParticipants) || 0,
      })),
      ownershipData: {
        blackOwnershipPercentage: Number(ownershipData.blackOwnershipPercentage) || 0,
        blackFemaleOwnershipPercentage: Number(ownershipData.blackFemaleOwnershipPercentage) || 0,
        blackYouthOwnershipPercentage: Number(ownershipData.blackYouthOwnershipPercentage) || 0,
        blackDisabledOwnershipPercentage: Number(ownershipData.blackDisabledOwnershipPercentage) || 0,
        blackUnemployedOwnershipPercentage: Number(ownershipData.blackUnemployedOwnershipPercentage) || 0,
        blackRuralOwnershipPercentage: Number(ownershipData.blackRuralOwnershipPercentage) || 0,
        blackMilitaryVeteranOwnershipPercentage: Number(ownershipData.blackMilitaryVeteranOwnershipPercentage) || 0,
        votingRightsBlack: Number(ownershipData.votingRightsBlack) || 0,
        votingRightsBlackFemale: Number(ownershipData.votingRightsBlackFemale) || 0,
        economicInterestBlack: Number(ownershipData.economicInterestBlack) || 0,
        economicInterestBlackFemale: Number(ownershipData.economicInterestBlackFemale) || 0,
        ownershipFulfillment: Boolean(ownershipData.ownershipFulfillment),
        netValue: Number(ownershipData.netValue) || 0,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, "ownershipDetails"), ownershipDetailsData);

    res.status(201).json({
      message: "Ownership details data saved successfully",
      id: docRef.id,
      ...ownershipDetailsData,
    });
  } catch (error) {
    console.error("Detailed error:", error);
    res.status(400).json({ error: error.message, code: error.code });
  }
});

// Ownership Details - Retrieve
app.get("/ownership-details/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const ownershipRef = collection(db, "ownershipDetails");
    const q = query(ownershipRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    const ownershipRecords = [];
    querySnapshot.forEach((doc) => {
      ownershipRecords.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    if (ownershipRecords.length === 0) {
      return res.status(404).json({ message: "No ownership details data found for this user" });
    }

    res.status(200).json({
      message: "Ownership details data retrieved successfully",
      data: ownershipRecords,
    });
  } catch (error) {
    console.error("Ownership details retrieval error:", error.code, error.message);
    res.status(500).json({ error: error.message, code: error.code });
  }
});

// Enterprise Development - Create
app.post("/enterprise-development", async (req, res) => {
  console.log("Enterprise Development POST hit with body:", req.body);
  const { userId, beneficiaries, summary } = req.body;

  try {
    if (!userId) {
      console.log("Missing userId");
      return res.status(400).json({ error: "User ID is required" });
    }
    if (!beneficiaries || !Array.isArray(beneficiaries)) {
      console.log("Invalid beneficiaries data");
      return res.status(400).json({ error: "Beneficiaries must be an array" });
    }
    if (!summary || typeof summary !== "object") {
      console.log("Invalid summary data");
      return res.status(400).json({ error: "Summary must be an object" });
    }

    const userDoc = await getDoc(doc(db, "users", userId));
    if (!userDoc.exists()) {
      console.log("User not found for userId:", userId);
      return res.status(404).json({ error: "User not found" });
    }

    const enterpriseDevelopmentData = {
      userId,
      beneficiaries: beneficiaries.map((beneficiary) => ({
        beneficiaryName: beneficiary.beneficiaryName || "",
        siteLocation: beneficiary.siteLocation || "",
        isSupplierDevelopmentBeneficiary: Boolean(beneficiary.isSupplierDevelopmentBeneficiary),
        blackOwnershipPercentage: Number(beneficiary.blackOwnershipPercentage) || 0,
        blackWomenOwnershipPercentage: Number(beneficiary.blackWomenOwnershipPercentage) || 0,
        beeStatusLevel: beneficiary.beeStatusLevel || "",
        contributionType: beneficiary.contributionType || "",
        contributionDescription: beneficiary.contributionDescription || "",
        dateOfContribution: beneficiary.dateOfContribution || "",
        paymentDate: beneficiary.paymentDate || "",
        contributionAmount: Number(beneficiary.contributionAmount) || 0,
      })),
      summary: {
        totalBeneficiaries: Number(summary.totalBeneficiaries) || 0,
        totalContributionAmount: Number(summary.totalContributionAmount) || 0,
        supplierDevelopmentBeneficiaries: Number(summary.supplierDevelopmentBeneficiaries) || 0,
        blackOwnedBeneficiaries: Number(summary.blackOwnedBeneficiaries) || 0,
        blackWomenOwnedBeneficiaries: Number(summary.blackWomenOwnedBeneficiaries) || 0,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, "enterpriseDevelopment"), enterpriseDevelopmentData);

    res.status(201).json({
      message: "Enterprise development data saved successfully",
      id: docRef.id,
      ...enterpriseDevelopmentData,
    });
  } catch (error) {
    console.error("Detailed error:", error);
    res.status(400).json({ error: error.message, code: error.code });
  }
});

// Enterprise Development - Retrieve
app.get("/enterprise-development/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const enterpriseRef = collection(db, "enterpriseDevelopment");
    const q = query(enterpriseRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    const enterpriseRecords = [];
    querySnapshot.forEach((doc) => {
      enterpriseRecords.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    if (enterpriseRecords.length === 0) {
      return res.status(404).json({ message: "No enterprise development data found for this user" });
    }

    res.status(200).json({
      message: "Enterprise development data retrieved successfully",
      data: enterpriseRecords,
    });
  } catch (error) {
    console.error("Enterprise development retrieval error:", error.code, error.message);
    res.status(500).json({ error: error.message, code: error.code });
  }
});

// Socio-Economic Development - Create
app.post("/socio-economic-development", async (req, res) => {
  console.log("Socio-Economic Development POST hit with body:", req.body);
  const { userId, beneficiaries, summary } = req.body;

  try {
    if (!userId) {
      console.log("Missing userId");
      return res.status(400).json({ error: "User ID is required" });
    }
    if (!beneficiaries || !Array.isArray(beneficiaries)) {
      console.log("Invalid beneficiaries data");
      return res.status(400).json({ error: "Beneficiaries must be an array" });
    }
    if (!summary || typeof summary !== "object") {
      console.log("Invalid summary data");
      return res.status(400).json({ error: "Summary must be an object" });
    }

    const userDoc = await getDoc(doc(db, "users", userId));
    if (!userDoc.exists()) {
      console.log("User not found for userId:", userId);
      return res.status(404).json({ error: "User not found" });
    }

    const socioEconomicDevelopmentData = {
      userId,
      beneficiaries: beneficiaries.map((beneficiary) => ({
        beneficiaryName: beneficiary.beneficiaryName || "",
        siteLocation: beneficiary.siteLocation || "",
        blackParticipationPercentage: Number(beneficiary.blackParticipationPercentage) || 0,
        contributionType: beneficiary.contributionType || "",
        contributionDescription: beneficiary.contributionDescription || "",
        dateOfContribution: beneficiary.dateOfContribution || "",
        contributionAmount: Number(beneficiary.contributionAmount) || 0,
      })),
      summary: {
        totalBeneficiaries: Number(summary.totalBeneficiaries) || 0,
        totalContributionAmount: Number(summary.totalContributionAmount) || 0,
        averageBlackParticipation: Number(summary.averageBlackParticipation) || 0,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, "socioEconomicDevelopment"), socioEconomicDevelopmentData);

    res.status(201).json({
      message: "Socio-economic development data saved successfully",
      id: docRef.id,
      ...socioEconomicDevelopmentData,
    });
  } catch (error) {
    console.error("Detailed error:", error);
    res.status(400).json({ error: error.message, code: error.code });
  }
});

// Socio-Economic Development - Retrieve
app.get("/socio-economic-development/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const socioEconomicRef = collection(db, "socioEconomicDevelopment");
    const q = query(socioEconomicRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    const socioEconomicRecords = [];
    querySnapshot.forEach((doc) => {
      socioEconomicRecords.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    if (socioEconomicRecords.length === 0) {
      return res.status(404).json({ message: "No socio-economic development data found for this user" });
    }

    res.status(200).json({
      message: "Socio-economic development data retrieved successfully",
      data: socioEconomicRecords,
    });
  } catch (error) {
    console.error("Socio-economic development retrieval error:", error.code, error.message);
    res.status(500).json({ error: error.message, code: error.code });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));