const express = require("express");
const cors = require("cors");
const { auth, db } = require("./firebase");
const { createUserWithEmailAndPassword, signInWithEmailAndPassword } = require("firebase/auth");
const { doc, setDoc } = require("firebase/firestore");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Signup Route
app.post("/signup", async (req, res) => {
  const { businessEmail, password, businessName, yearsOperating, address, contactNumber } = req.body;

  try {
    // Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, businessEmail, password);
    const user = userCredential.user;

    // Save additional data to Firestore
    await setDoc(doc(db, "users", user.uid), {
      businessName,
      yearsOperating: Number(yearsOperating), // Ensure it’s a number
      address,
      contactNumber,
      businessEmail,
      createdAt: new Date().toISOString() // Optional: timestamp
    });

    res.status(201).json({ message: "User created successfully", uid: user.uid });
  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      res.status(400).json({ error: "User already exists" });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Login Route (unchanged)
app.post("/login", async (req, res) => {
  const { businessEmail, password } = req.body;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, businessEmail, password);
    const user = userCredential.user;
    res.status(200).json({ message: "Login successful", uid: user.uid });
  } catch (error) {
    res.status(401).json({ error: "Invalid email or password" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));