const express = require("express");
const cors = require("cors");
const { auth, db } = require("./firebase");
const { createUserWithEmailAndPassword, signInWithEmailAndPassword } = require("firebase/auth");
const { doc, setDoc, getDoc } = require("firebase/firestore"); // Add getDoc

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Signup Route
app.post("/signup", async (req, res) => {
  const { businessEmail, password, businessName, yearsOperating, address, contactNumber } = req.body;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, businessEmail, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      businessName,
      yearsOperating: Number(yearsOperating),
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