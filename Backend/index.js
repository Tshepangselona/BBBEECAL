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

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));