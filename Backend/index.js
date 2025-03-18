const express = require("express");
const cors = require("cors");
const { auth, db } = require("./firebase");
const { createUserWithEmailAndPassword, signInWithEmailAndPassword } = require("firebase/auth");
const { doc, setDoc, getDoc } = require("firebase/firestore");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

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

// Signup Route
app.post("/signup", async (req, res) => {
  const { businessEmail, password, businessName, financialYearEnd, address, contactNumber } = req.body;

  try {
    // Validate the financialYearEnd format
    if (!validateDateFormat(financialYearEnd)) {
      return res.status(400).json({ 
        error: "Invalid financial year end format. Please use DD/MMM/YYYY (e.g., 31/Mar/2025)" 
      });
    }

    // Convert DD/MMM/YYYY to Date object
    const [, day, monthStr, year] = financialYearEnd.match(/^(\d{2})\/([A-Za-z]{3})\/(\d{4})$/);
    const month = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]
      .indexOf(monthStr.toLowerCase());
    const dateObject = new Date(year, month, day);

    const userCredential = await createUserWithEmailAndPassword(auth, businessEmail, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      businessName,
      financialYearEnd: dateObject, // Store as Date object
      address,
      contactNumber,
      businessEmail,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ message: "User created successfully", uid: user.uid, businessName });
  } catch (error) {
    console.error("Signup error:", error.message);
    res.status(400).json({ error: error.message });
  }
});

// Login Route
app.post("/login", async (req, res) => {
  const { businessEmail, password } = req.body;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, businessEmail, password);
    const user = userCredential.user;
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const businessName = userDoc.exists() ? userDoc.data().businessName : "";
    res.status(200).json({ message: "Login successful", uid: user.uid, businessName });
  } catch (error) {
    console.error("Login error:", error.message);
    if (error.code === "auth/invalid-credential") {
      res.status(401).json({ error: "Invalid email or password" });
    } else {
      res.status(500).json({ error: "Something went wrong" });
    }
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));