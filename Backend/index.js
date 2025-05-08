require('dotenv').config();
const express = require("express");
const cors = require("cors");
const { auth, db } = require("./firebase");
const { createUserWithEmailAndPassword, signInWithEmailAndPassword } = require("firebase/auth");
const { doc, setDoc, getDoc, collection, addDoc, query, where, getDocs } = require("firebase/firestore");
const SibApiV3Sdk = require('sib-api-v3-sdk');
const crypto = require("crypto");
const admin = require("firebase-admin");
const jwt = require("jsonwebtoken");

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  clientId: process.env.FIREBASE_CLIENT_ID,
  authUri: process.env.FIREBASE_AUTH_URI,
  tokenUri: process.env.FIREBASE_TOKEN_URI,
  authProviderX509CertUrl: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
  clientX509CertUrl: process.env.FIREBASE_CLIENT_CERT_URL,
  universeDomain: process.env.FIREBASE_UNIVERSE_DOMAIN,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const adminDb = admin.firestore();

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

const PORT = process.env.PORT || 5000;

const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

const JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret"; // Store in .env

// Configure CORS
const corsOptions = {
  origin: 'http://localhost:3000', // Allow only the frontend origin
  credentials: true, // Allow credentials (cookies, auth headers)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
};

app.use(cors(corsOptions));
app.use(express.json());

const generatePassword = () => {
  return crypto.randomBytes(8).toString('hex');
};

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

// Verify admin status
app.get("/verify-admin", async (req, res) => {
  const authHeader = req.headers.authorization;
  console.log("Verify admin request received, auth header:", authHeader ? "present" : "missing");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("Verify admin: Missing or invalid authorization header");
    return res.status(401).json({ error: "Authorization header missing or invalid" });
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    console.log("Verifying JWT...");
    const decoded = jwt.verify(token, JWT_SECRET);
    const uid = decoded.uid;
    console.log("JWT verified, UID:", uid);

    console.log("Checking admin collection for UID:", uid);
    const adminDoc = await getDoc(doc(db, "admin", uid));
    if (!adminDoc.exists()) {
      console.log("User is not admin, UID:", uid);
      return res.status(403).json({ isAdmin: false });
    }

    console.log("User is admin, UID:", uid);
    return res.status(200).json({ isAdmin: true });
  } catch (error) {
    console.error("Verify admin error:", error.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
});

// Admin Signup route 
console.log("Registering /admin-signup endpoint");
app.post("/admin-signup", async (req, res) => {
  const { companymail, Employeename, contactNumber } = req.body;

  console.log("Admin signup request body:", req.body);

  try {
    // Validate required fields
    if (!companymail || !Employeename || !contactNumber) {
      console.log("Missing required fields:", { companymail, Employeename, contactNumber });
      return res.status(400).json({ error: "Company email, employee name, and contact number are required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(companymail)) {
      console.log("Invalid email format:", companymail);
      return res.status(400).json({ error: "Invalid company email format" });
    }

    // Validate contact number format (e.g., +27123456789)
    const phoneRegex = /^\+\d{10,}$/;
    if (!phoneRegex.test(contactNumber)) {
      console.log("Invalid contact number format:", contactNumber);
      return res.status(400).json({ error: "Invalid contact number format. Use e.g., +27123456789" });
    }

    // Generate a random password
    const password = generatePassword();
    console.log("Generated password for admin:", password);

    // Create Firebase user
    console.log("Creating Firebase admin user with:", { companymail, password });
    const userCredential = await createUserWithEmailAndPassword(auth, companymail, password);
    const user = userCredential.user;
    console.log("Admin user created with UID:", user.uid);

    // Save to Firestore admin collection
    console.log("Saving admin to Firestore admin collection for UID:", user.uid);
    await setDoc(doc(db, "admin", user.uid), {
      Employeename,
      contactNumber,
      companymail,
      createdAt: new Date().toISOString(),
    });

    // Generate password reset link
    const resetLink = await admin.auth().generatePasswordResetLink(companymail);
    console.log("Password reset link generated for admin:", resetLink);

    // Send user email
    console.log("Preparing to send admin user email to:", companymail);
    const userEmail = new SibApiV3Sdk.SendSmtpEmail();
    userEmail.sender = { name: 'Forge', email: process.env.ADMIN_EMAIL };
    userEmail.to = [{ email: companymail }];
    userEmail.subject = 'Forge Admin Account Created';
    userEmail.htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <tr>
              <td style="background-color: #4a90e2; padding: 20px; text-align: center; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                <h3 style="color: #ffffff; margin: 0; font-size: 24px;">Welcome, ${Employeename}!</h3>
              </td>
            </tr>
            <tr>
              <td style="padding: 20px; color: #333333;">
                <p style="font-size: 16px; line-height: 1.5;">Your admin account has been created successfully!</p>
                <p style="font-size: 16px; line-height: 1.5;">Email: ${companymail}</p>
                <p style="font-size: 16px; line-height: 1.5;">As an admin, you have access to manage BBBEE compliance data for Forge users. Please set your password to log in and start managing.</p>
                <p style="font-size: 16px; line-height: 1.5;">If you have any questions, contact us at tebatsomoyaba@gmail.com.</p>
                <p><a href="${resetLink}" style="color: #4a90e2; text-decoration: underline;">Set Your Password</a></p>
                <p style="font-size: 14px; color: #777777; margin-top: 20px;">Best regards,<br><span style="color: #4a90e2; font-weight: bold;">Forge Academy</span></p>
              </td>
            </tr>
            <tr>
              <td style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 12px; color: #999999; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                © ${new Date().getFullYear()} Forge. All rights reserved.
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    // Send admin notification email
    console.log("Preparing to send admin notification email");
    const adminEmail = new SibApiV3Sdk.SendSmtpEmail();
    adminEmail.sender = { name: 'Forge', email: process.env.ADMIN_EMAIL };
    adminEmail.to = [{ email: process.env.ADMIN_EMAIL }];
    adminEmail.subject = 'New Admin Signup Notification';
    adminEmail.htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <tr>
              <td style="background-color: #e94e77; padding: 20px; text-align: center; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                <h3 style="color: #ffffff; margin: 0; font-size: 24px;">New Admin Alert</h3>
              </td>
            </tr>
            <tr>
              <td style="padding: 20px; color: #333333;">
                <p style="font-size: 16px; line-height: 1.5;">A new admin has signed up:</p>
                <ul style="list-style-type: none; padding: 0; font-size: 16px; line-height: 1.6;">
                  <li style="margin-bottom: 10px;"><strong>Employee Name:</strong> ${Employeename}</li>
                  <li style="margin-bottom: 10px;"><strong>Email:</strong> ${companymail}</li>
                  <li style="margin-bottom: 10px;"><strong>Contact Number:</strong> ${contactNumber}</li>
                  <li style="margin-bottom: 10px;"><strong>Password:</strong> ${password}</li>
                </ul>
              </td>
            </tr>
            <tr>
              <td style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 12px; color: #999999; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                © ${new Date().getFullYear()} Forge. All rights reserved.
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    // Send emails via Brevo
    console.log("Sending admin emails via Brevo");
    await apiInstance.sendTransacEmail(userEmail);
    await apiInstance.sendTransacEmail(adminEmail);

    console.log("Admin signup successful for UID:", user.uid);
    res.status(201).json({
      message: "Admin user created successfully, emails sent",
      uid: user.uid,
      Employeename,
      companymail,
      contactNumber,
    });
  } catch (error) {
    console.error("Admin signup error details:", { code: error.code, message: error.message, stack: error.stack });
    res.status(400).json({ error: error.message, code: error.code });
  }
});

// Admin login route
app.post("/admin-login", async (req, res) => {
  const { businessEmail, password } = req.body;
  console.log("Admin login request received:", { businessEmail, password: "****" });

  try {
    if (!businessEmail || !password) {
      console.log("Missing required fields:", { businessEmail, password: "****" });
      return res.status(400).json({ error: "Email and password are required" });
    }

    console.log("Attempting Firebase admin login...");
    const userCredential = await signInWithEmailAndPassword(auth, businessEmail, password);
    const user = userCredential.user;
    console.log("Firebase admin login successful, UID:", user.uid);

    console.log("Fetching admin data from Firestore admin collection...");
    const adminDoc = await getDoc(doc(db, "admin", user.uid));
    if (!adminDoc.exists()) {
      console.log("No admin data found in Firestore for UID:", user.uid);
      return res.status(403).json({ error: "Admin user data not found" });
    }

    const adminData = adminDoc.data();
    console.log("Admin data fetched:", adminData);

    // Generate JWT
    const token = jwt.sign({ uid: user.uid, isAdmin: true }, JWT_SECRET, { expiresIn: "1h" });
    console.log("JWT generated for admin:", user.uid);

    return res.status(200).json({
      message: "Admin login successful",
      token,
      uid: user.uid,
      businessName: adminData.Employeename,
      businessEmail: adminData.companymail,
      contactNumber: adminData.contactNumber,
      userType: "Admin",
    });

  } catch (error) {
    console.error("Admin login error details:", { code: error.code, message: error.message, stack: error.stack });
    if (error.code === "auth/invalid-credential") {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    return res.status(500).json({ error: "Something went wrong", code: error.code });
  }
});

// Check admin status
app.get("/check-admin", async (req, res) => {
  const authHeader = req.headers.authorization;
  console.log("Check admin request received, auth header:", authHeader ? "present" : "missing");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("Check admin: Missing or invalid authorization header");
    return res.status(401).json({ error: "Authorization header missing or invalid" });
  }

  const idToken = authHeader.split("Bearer ")[1];

  try {
    console.log("Verifying ID token...");
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    console.log("ID token verified, UID:", uid);

    console.log("Checking admin collection for UID:", uid);
    const adminDoc = await getDoc(doc(db, "admin", uid));
    if (!adminDoc.exists()) {
      console.log("User is not admin, UID:", uid);
      return res.status(403).json({ isAdmin: false });
    }

    console.log("User is admin, UID:", uid);
    return res.status(200).json({ isAdmin: true });
  } catch (error) {
    console.error("Check admin error:", { code: error.code, message: error.message });
    return res.status(401).json({ error: "Invalid or expired token" });
  }
});

// Signup route (unchanged)
app.post("/signup", async (req, res) => {
  const { businessEmail, businessName, financialYearEnd, address, contactNumber } = req.body;

  console.log("Request body:", req.body);

  try {
    if (!validateDateFormat(financialYearEnd)) {
      console.log("Invalid date format:", financialYearEnd);
      return res.status(400).json({ error: "Invalid financial year end format. Please use DD/MMM/YYYY (e.g., 31/Mar/2025)" });
    }

    const [, day, monthStr, year] = financialYearEnd.match(/^(\d{2})\/([A-Za-z]{3})\/(\d{4})$/);
    const month = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]
      .indexOf(monthStr.toLowerCase());
    const dateObject = new Date(year, month, day);

    if (isNaN(dateObject.getTime())) {
      console.log("Invalid date parsed:", financialYearEnd);
      return res.status(400).json({ error: "Invalid date value for Financial Year End" });
    }

    const password = generatePassword();
    console.log("Generated password:", password);
    console.log("Type of password:", typeof password);
    console.log("Password length:", password.length);

    if (!password || typeof password !== "string" || password.length < 6) {
      throw new Error("Generated password is invalid (must be a string, at least 6 characters)");
    }

    console.log("Creating Firebase user with:", { businessEmail, password });
    const userCredential = await createUserWithEmailAndPassword(auth, businessEmail, password);
    const user = userCredential.user;
    console.log("User created with UID:", user.uid);

    console.log("Saving to Firestore for UID:", user.uid);
    await setDoc(doc(db, "clients", user.uid), {
      businessName,
      financialYearEnd: dateObject,
      address,
      contactNumber,
      businessEmail,
      createdAt: new Date().toISOString(),
    });

    const resetLink = await admin.auth().generatePasswordResetLink(businessEmail);
    console.log("Password reset link generated:", resetLink);

    console.log("Preparing to send user email to:", businessEmail);
    const userEmail = new SibApiV3Sdk.SendSmtpEmail();
    userEmail.sender = { name: 'Forge', email: process.env.ADMIN_EMAIL };
    userEmail.to = [{ email: businessEmail }];
    userEmail.subject = 'BBBEE Calculator - Empower Your Compliance Journey!';
    userEmail.htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <tr>
              <td style="background-color: #4a90e2; padding: 20px; text-align: center; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                <h3 style="color: #ffffff; margin: 0; font-size: 24px;">Welcome, ${businessName}!</h3>
              </td>
            </tr>
            <tr>
              <td style="padding: 20px; color: #333333;">
                <p style="font-size: 16px; line-height: 1.5;">Your account has been created successfully!</p>
                <p style="font-size: 16px; line-height: 1.5;">Email: ${businessEmail}</p>
                <p style="font-size: 16px; line-height: 1.5;">We’re excited to welcome you to Forge! You’ve just taken a key step toward simplifying your BBBEE compliance. Our calculator is designed to help you assess, plan, and achieve your empowerment goals with ease and accuracy. </p>
                <p style="font-size: 16px; line-height: 1.5;">We’re currently reviewing your account creation and payment details. Once everything is confirmed, we’ll get back to you with full access details and next steps to start using the calculator. This won’t take long, and we’ll be in touch soon!</p>
                <p style="font-size: 16px; line-height: 1.5;">In the meantime, if you have any questions, feel free to reach out to us at tebatsomoyaba@gmail.com. We’re here to assist you every step of the way.</p>
                <p style="font-size: 16px; line-height: 1.5;">Looking forward to supporting your BBBEE success!</p>
                <p><a href="${resetLink}" style="color: #4a90e2; text-decoration: underline;">Set Your Password</a></p>
                <p style="font-size: 14px; color: #777777; margin-top: 20px;">Best regards,<br><span style="color: #4a90e2; font-weight: bold;">Forge Academy</span></p>
              </td>
            </tr>
            <tr>
              <td style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 12px; color: #999999; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                © ${new Date().getFullYear()} Forge. All rights reserved .
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    console.log("Preparing to send admin email");
    const adminEmail = new SibApiV3Sdk.SendSmtpEmail();
    adminEmail.sender = { name: 'Forge', email: process.env.ADMIN_EMAIL };
    adminEmail.to = [{ email: process.env.ADMIN_EMAIL }];
    adminEmail.subject = 'New User Signup Notification';
    adminEmail.htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <tr>
              <td style="background-color: #e94e77; padding: 20px; text-align: center; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                <h3 style="color: #ffffff; margin: 0; font-size: 24px;">New User Alert</h3>
              </td>
            </tr>
            <tr>
              <td style="padding: 20px; color: #333333;">
                <p style="font-size: 16px; line-height: 1.5;">A new user has just signed up:</p>
                <ul style="list-style-type: none; padding: 0; font-size: 16px; line-height: 1.6;">
                  <li style="margin-bottom: 10px;"><strong>Business Name:</strong> ${businessName}</li>
                  <li style="margin-bottom: 10px;"><strong>Email:</strong> ${businessEmail}</li>
                  <li style="margin-bottom: 10px;"><strong>Address:</strong> ${address}</li>
                  <li style="margin-bottom: 10px;"><strong>Contact Number:</strong> ${contactNumber}</li>
                  <li style="margin-bottom: 10px;"><strong>Financial Year End:</strong> ${financialYearEnd}</li>
                  <li style="margin-bottom: 10px;"><strong>Password:</strong> ${password}</li>
                </ul>
              </td>
            </tr>
            <tr>
              <td style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 12px; color: #999999; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                © ${new Date().getFullYear()} Forge. All rights reserved.
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    console.log("Sending emails via Brevo");
    await apiInstance.sendTransacEmail(userEmail);
    await apiInstance.sendTransacEmail(adminEmail);

    console.log("Signup successful for UID:", user.uid);
    res.status(201).json({ 
      message: "User created successfully, emails sent", 
      uid: user.uid, 
      businessName, 
      financialYearEnd: dateObject,
    });
  } catch (error) {
    console.error("Signup error details:", { code: error.code, message: error.message, stack: error.stack });
    res.status(400).json({ error: error.message, code: error.code });
  }
});

// Get-profile endpoint
app.get("/get-profile", async (req, res) => {
  const { uid } = req.query;
  console.log("Get profile request for UID:", uid);

  try {
    if (!uid) {
      console.log("Missing UID in request");
      return res.status(400).json({ error: "User ID is required" });
    }

    const clientDoc = await getDoc(doc(db, "clients", uid));
    if (!clientDoc.exists()) {
      console.log("Client not found for UID:", uid);
      return res.status(404).json({ error: "Client not found" });
    }

    const data = clientDoc.data();
    console.log("Profile data retrieved:", data);

    res.status(200).json({
      businessName: data.businessName || "",
      sector: data.sector || "",
      financialYearEnd: data.financialYearEnd || null,
      address: data.address || "",
      contactNumber: data.contactNumber || "",
      businessEmail: data.businessEmail || "",
    });
  } catch (error) {
    console.error("Get profile error:", error.code, error.message);
    res.status(500).json({ error: "Failed to fetch profile", code: error.code });
  }
});

// Update-profile endpoint
app.patch("/update-profile", async (req, res) => {
  const { uid, businessName, sector } = req.body;
  console.log("Update profile request:", { uid, businessName, sector });

  try {
    if (!uid) {
      console.log("Missing UID in request");
      return res.status(400).json({ error: "User ID is required" });
    }
    if (!businessName || !sector) {
      console.log("Missing required fields:", { businessName, sector });
      return res.status(400).json({ error: "Business name and sector are required" });
    }

    await setDoc(
      doc(db, "clients", uid),
      { businessName, sector },
      { merge: true }
    );
    console.log("Profile updated in Firestore for UID:", uid);
    res.status(200).json({ message: "Profile updated", businessName, sector });
  } catch (error) {
    console.error("Update error:", error.code, error.message);
    res.status(500).json({ error: "Failed to update profile", code: error.code });
  }
});
// Login route (for clients)
app.post("/login", async (req, res) => {
  const { businessEmail, password } = req.body;
  console.log("Client login request received:", { businessEmail, password: "****" });

  try {
    // Validate required fields
    if (!businessEmail || !password) {
      console.log("Missing required fields:", { businessEmail, password: "****" });
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Authenticate with Firebase
    console.log("Attempting Firebase client login...");
    const userCredential = await signInWithEmailAndPassword(auth, businessEmail, password);
    const user = userCredential.user;
    console.log("Firebase client login successful, UID:", user.uid);

    // Check for admin user to prevent admin login
    console.log("Checking if user is an admin...");
    const adminDoc = await getDoc(doc(db, "admin", user.uid));
    if (adminDoc.exists()) {
      console.log("User is an admin, rejecting client login:", user.uid);
      return res.status(403).json({ error: "Admin users must use the admin login page" });
    }

    // Check clients collection
    console.log("Fetching client data from Firestore clients collection...");
    const clientDoc = await getDoc(doc(db, "clients", user.uid));
    if (!clientDoc.exists()) {
      console.log("No client data found in Firestore for UID:", user.uid);
      return res.status(404).json({ error: "Client user data not found" });
    }

    const clientData = clientDoc.data();
    console.log("Client data fetched:", clientData);
    return res.status(200).json({
      message: "Client login successful",
      uid: user.uid,
      businessName: clientData.businessName,
      businessEmail: clientData.businessEmail,
      financialYearEnd: clientData.financialYearEnd,
      address: clientData.address,
      contactNumber: clientData.contactNumber,
      userType: "Client",
    });

  } catch (error) {
    console.error("Client login error details:", { code: error.code, message: error.message, stack: error.stack });
    if (error.code === "auth/invalid-credential") {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    return res.status(500).json({ error: "Something went wrong", code: error.code });
  }
});

// Test route (unchanged)
app.get('/test', (req, res) => {
  res.status(200).json({ message: 'Test route working' });
});

// Management Control - Create
app.post('/management-control', async (req, res) => {
  console.log('Management control POST hit with body:', req.body);
  const { userId, managers, managementData } = req.body;

  try {
    if (!userId) {
      console.log('Missing userId');
      return res.status(400).json({ error: 'User ID is required' });
    }
    if (!managers || !Array.isArray(managers)) {
      console.log('Invalid managers data');
      return res.status(400).json({ error: 'Managers must be an array' });
    }
    if (!managementData || typeof managementData !== 'object') {
      console.log('Invalid managementData');
      return res.status(400).json({ error: 'Management data must be an object' });
    }

    const userDoc = await admin.firestore().collection('clients').doc(userId).get();
    if (!userDoc.exists) {
      console.log('User not found for userId:', userId);
      return res.status(404).json({ error: 'User not found' });
    }

    const managementRef = admin.firestore().collection('managementControl');
    const q = await managementRef.where('userId', '==', userId).get();
    if (!q.empty) {
      console.log('Management control already exists for userId:', userId);
      return res.status(409).json({
        error: 'Management control already exists for this user. Use PUT to update.',
        existingId: q.docs[0].id,
      });
    }

    const managementControlData = {
      userId,
      managers: managers.map((manager) => ({
        name: manager.name || '',
        siteLocation: manager.siteLocation || '',
        idNumber: manager.idNumber || '',
        position: manager.position || '',
        jobTitle: manager.jobTitle || '',
        race: manager.race || '',
        gender: manager.gender || '',
        isDisabled: Boolean(manager.isDisabled),
        votingRights: Number(manager.votingRights) || 0,
        isExecutiveDirector: Boolean(manager.isExecutiveDirector),
        isIndependentNonExecutive: Boolean(manager.isIndependentNonExecutive),
      })),
      managementData: {
        totalVotingRights: Number(managementData.totalVotingRights) || 0,
        blackVotingRights: Number(managementData.blackVotingRights) || 0,
        blackFemaleVotingRights: Number(managementData.blackFemaleVotingRights) || 0,
        disabledVotingRights: Number(managementData.disabledVotingRights) || 0,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await admin.firestore().collection('managementControl').add(managementControlData);
    console.log('Write successful, doc ID:', docRef.id);

    res.status(201).json({
      message: 'Management control data saved successfully',
      id: docRef.id,
      ...managementControlData,
    });
  } catch (error) {
    console.error('Detailed error in POST /management-control:', error.message, error.stack);
    res.status(400).json({ error: error.message, code: error.code });
  }
});

// Management Control - Retrieve
app.get('/management-control/:userId', async (req, res) => {
  console.log('Management control GET hit with userId:', req.params.userId);
  const { userId } = req.params;

  try {
    if (!userId) {
      console.log('Missing userId in GET request');
      return res.status(400).json({ error: 'User ID is required' });
    }

    const querySnapshot = await admin.firestore().collection('managementControl').where('userId', '==', userId).get();
    const managementRecords = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    if (managementRecords.length === 0) {
      console.log('No management control data found for userId:', userId);
      return res.status(404).json({ message: 'No management control data found for this user' });
    }

    console.log('Management control data retrieved for userId:', userId);
    res.status(200).json({
      message: 'Management control data retrieved successfully',
      data: managementRecords,
    });
  } catch (error) {
    console.error('Management control retrieval error:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to retrieve management control data', code: error.code });
  }
});

// Management Control - Update
app.put('/management-control/:id', async (req, res) => {
  console.log('Management control PUT hit with body:', req.body);
  const { id } = req.params;
  const { userId, managers, managementData } = req.body;

  try {
    if (!userId) {
      console.log('Validation failed: Missing userId');
      return res.status(400).json({ error: 'User ID is required' });
    }
    if (!managers || !Array.isArray(managers)) {
      console.log('Validation failed: Managers is not an array or missing', { managers });
      return res.status(400).json({ error: 'Managers must be an array' });
    }
    if (!managementData || typeof managementData !== 'object') {
      console.log('Validation failed: ManagementData is not an object or missing', { managementData });
      return res.status(400).json({ error: 'Management data must be an object' });
    }

    const userDoc = await admin.firestore().collection('clients').doc(userId).get();
    if (!userDoc.exists) {
      console.log('User not found for userId:', userId);
      return res.status(404).json({ error: 'User not found' });
    }

    const docRef = admin.firestore().collection('managementControl').doc(id);
    const existingDoc = await docRef.get();
    if (!existingDoc.exists) {
      console.log('Management control data not found for id:', id);
      return res.status(404).json({ error: 'Management control data not found' });
    }

    const managementControlData = {
      userId,
      managers: managers.map((manager) => ({
        name: manager.name || '',
        siteLocation: manager.siteLocation || '',
        idNumber: manager.idNumber || '',
        position: manager.position || '',
        jobTitle: manager.jobTitle || '',
        race: manager.race || '',
        gender: manager.gender || '',
        isDisabled: Boolean(manager.isDisabled),
        votingRights: Number(manager.votingRights) || 0,
        isExecutiveDirector: Boolean(manager.isExecutiveDirector),
        isIndependentNonExecutive: Boolean(manager.isIndependentNonExecutive),
      })),
      managementData: {
        totalVotingRights: Number(managementData.totalVotingRights) || 0,
        blackVotingRights: Number(managementData.blackVotingRights) || 0,
        blackFemaleVotingRights: Number(managementData.blackFemaleVotingRights) || 0,
        disabledVotingRights: Number(managementData.disabledVotingRights) || 0,
      },
      updatedAt: new Date().toISOString(),
    };

    await docRef.update({
      ...managementControlData,
      createdAt: existingDoc.data().createdAt, // Preserve original createdAt
    });

    console.log('Management control data updated with ID:', id);
    res.status(200).json({
      message: 'Management control data updated successfully',
      id,
      ...managementControlData,
    });
  } catch (error) {
    console.error('Detailed error in PUT /management-control:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      requestBody: req.body,
    });
    res.status(400).json({ error: error.message, code: error.code });
  }
});

// Management Control - Delete
app.delete('/management-control/:userId', async (req, res) => {
  console.log('Management control DELETE hit with userId:', req.params.userId);
  const { userId } = req.params;

  try {
    if (!userId) {
      console.log('Missing userId in params');
      return res.status(400).json({ error: 'User ID is required' });
    }

    const userDoc = await admin.firestore().collection('clients').doc(userId).get();
    if (!userDoc.exists) {
      console.log('User not found for userId:', userId);
      return res.status(404).json({ error: 'User not found' });
    }

    const managementRef = admin.firestore().collection('managementControl');
    const query = await managementRef.where('userId', '==', userId).get();

    if (query.empty) {
      console.log('No management control data found for userId:', userId);
      return res.status(404).json({ error: 'Management control data not found for this user' });
    }

    const docToDelete = query.docs[0];
    await admin.firestore().collection('managementControl').doc(docToDelete.id).delete();

    console.log('Management control data deleted for userId:', userId);
    res.status(200).json({
      message: 'Management control data deleted successfully',
      userId,
      deletedDocId: docToDelete.id,
    });
  } catch (error) {
    console.error('Detailed error in DELETE /management-control:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to delete management control data', details: error.message });
  }
});

// Employment Equity - Create
app.post('/employment-equity', async (req, res) => {
  console.log('Employment equity POST hit with body:', req.body);
  const { userId, employees, employmentData } = req.body;

  try {
    if (!userId) {
      console.log('Missing userId');
      return res.status(400).json({ error: 'User ID is required' });
    }
    if (!employees || !Array.isArray(employees)) {
      console.log('Invalid employees data');
      return res.status(400).json({ error: 'Employees must be an array' });
    }
    if (!employmentData || typeof employmentData !== 'object') {
      console.log('Invalid employmentData');
      return res.status(400).json({ error: 'Employment data must be an object' });
    }

    const userDoc = await admin.firestore().collection('clients').doc(userId).get();
    if (!userDoc.exists) {
      console.log('User not found for userId:', userId);
      return res.status(404).json({ error: 'User not found' });
    }

    const employmentRef = admin.firestore().collection('employmentEquityDetails');
    const q = await employmentRef.where('userId', '==', userId).get();
    if (!q.empty) {
      console.log('Employment equity already exists for userId:', userId);
      return res.status(409).json({
        error: 'Employment equity already exists for this user. Use PUT to update.',
        existingId: q.docs[0].id,
      });
    }

    const employmentEquityData = {
      userId,
      employees: employees.map((employee) => ({
        name: employee.name || '',
        siteLocation: employee.siteLocation || '',
        idNumber: employee.idNumber || '',
        jobTitle: employee.jobTitle || '',
        race: employee.race || '',
        gender: employee.gender || '',
        isDisabled: Boolean(employee.isDisabled),
        descriptionOfDisability: employee.descriptionOfDisability || '',
        isForeign: Boolean(employee.isForeign),
        occupationalLevel: employee.occupationalLevel || '',
        grossMonthlySalary: Number(employee.grossMonthlySalary) || 0,
      })),
      employmentData: {
        totalEmployees: Number(employmentData.totalEmployees) || 0,
        blackEmployees: Number(employmentData.blackEmployees) || 0,
        blackFemaleEmployees: Number(employmentData.blackFemaleEmployees) || 0,
        disabledEmployees: Number(employmentData.disabledEmployees) || 0,
        foreignEmployees: Number(employmentData.foreignEmployees) || 0,
        byOccupationalLevel: employmentData.byOccupationalLevel || {},
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await admin.firestore().collection('employmentEquityDetails').add(employmentEquityData);
    console.log('Write successful, doc ID:', docRef.id);

    res.status(201).json({
      message: 'Employment equity data saved successfully',
      id: docRef.id,
      ...employmentEquityData,
    });
  } catch (error) {
    console.error('Detailed error in POST /employment-equity:', error.message, error.stack);
    res.status(400).json({ error: error.message, code: error.code });
  }
});

// Employment Equity - Retrieve
app.get('/employment-equity/:userId', async (req, res) => {
  console.log('Employment equity GET hit with userId:', req.params.userId);
  const { userId } = req.params;

  try {
    if (!userId) {
      console.log('Missing userId in GET request');
      return res.status(400).json({ error: 'User ID is required' });
    }

    const querySnapshot = await admin.firestore().collection('employmentEquityDetails').where('userId', '==', userId).get();
    const employmentRecords = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    if (employmentRecords.length === 0) {
      console.log('No employment equity data found for userId:', userId);
      return res.status(404).json({ message: 'No employment equity data found for this user' });
    }

    console.log('Employment equity data retrieved for userId:', userId);
    res.status(200).json({
      message: 'Employment equity data retrieved successfully',
      data: employmentRecords,
    });
  } catch (error) {
    console.error('Employment equity retrieval error:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to retrieve employment equity data', code: error.code });
  }
});

// Employment Equity - Update
app.put('/employment-equity/:id', async (req, res) => {
  console.log('Employment equity PUT hit with body:', req.body);
  const { id } = req.params;
  const { userId, employees, employmentData } = req.body;

  try {
    if (!userId) {
      console.log('Validation failed: Missing userId');
      return res.status(400).json({ error: 'User ID is required' });
    }
    if (!employees || !Array.isArray(employees)) {
      console.log('Validation failed: Employees is not an array or missing', { employees });
      return res.status(400).json({ error: 'Employees must be an array' });
    }
    if (!employmentData || typeof employmentData !== 'object') {
      console.log('Validation failed: EmploymentData is not an object or missing', { employmentData });
      return res.status(400).json({ error: 'Employment data must be an object' });
    }

    const userDoc = await admin.firestore().collection('clients').doc(userId).get();
    if (!userDoc.exists) {
      console.log('User not found for userId:', userId);
      return res.status(404).json({ error: 'User not found' });
    }

    const docRef = admin.firestore().collection('employmentEquityDetails').doc(id);
    const existingDoc = await docRef.get();
    if (!existingDoc.exists) {
      console.log('Employment equity data not found for id:', id);
      return res.status(404).json({ error: 'Employment equity data not found' });
    }

    const employmentEquityData = {
      userId,
      employees: employees.map((employee) => ({
        name: employee.name || '',
        siteLocation: employee.siteLocation || '',
        idNumber: employee.idNumber || '',
        jobTitle: employee.jobTitle || '',
        race: employee.race || '',
        gender: employee.gender || '',
        isDisabled: Boolean(employee.isDisabled),
        descriptionOfDisability: employee.descriptionOfDisability || '',
        isForeign: Boolean(employee.isForeign),
        occupationalLevel: employee.occupationalLevel || '',
        grossMonthlySalary: Number(employee.grossMonthlySalary) || 0,
      })),
      employmentData: {
        totalEmployees: Number(employmentData.totalEmployees) || 0,
        blackEmployees: Number(employmentData.blackEmployees) || 0,
        blackFemaleEmployees: Number(employmentData.blackFemaleEmployees) || 0,
        disabledEmployees: Number(employmentData.disabledEmployees) || 0,
        foreignEmployees: Number(employmentData.foreignEmployees) || 0,
        byOccupationalLevel: employmentData.byOccupationalLevel || {},
      },
      updatedAt: new Date().toISOString(),
    };

    await docRef.update({
      ...employmentEquityData,
      createdAt: existingDoc.data().createdAt, // Preserve original createdAt
    });

    console.log('Employment equity data updated with ID:', id);
    res.status(200).json({
      message: 'Employment equity data updated successfully',
      id,
      ...employmentEquityData,
    });
  } catch (error) {
    console.error('Detailed error in PUT /employment-equity:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      requestBody: req.body,
    });
    res.status(400).json({ error: error.message, code: error.code });
  }
});

// Employment Equity - Delete
app.delete('/employment-equity/:userId', async (req, res) => {
  console.log('Employment equity DELETE hit with userId:', req.params.userId);
  const { userId } = req.params;

  try {
    if (!userId) {
      console.log('Missing userId in params');
      return res.status(400).json({ error: 'User ID is required' });
    }

    const userDoc = await admin.firestore().collection('clients').doc(userId).get();
    if (!userDoc.exists) {
      console.log('User not found for userId:', userId);
      return res.status(404).json({ error: 'User not found' });
    }

    const employmentRef = admin.firestore().collection('employmentEquityDetails');
    const query = await employmentRef.where('userId', '==', userId).get();

    if (query.empty) {
      console.log('No employment equity data found for userId:', userId);
      return res.status(404).json({ error: 'Employment equity data not found for this user' });
    }

    const docToDelete = query.docs[0];
    await admin.firestore().collection('employmentEquityDetails').doc(docToDelete.id).delete();

    console.log('Employment equity data deleted for userId:', userId);
    res.status(200).json({
      message: 'Employment equity data deleted successfully',
      userId,
      deletedDocId: docToDelete.id,
    });
  } catch (error) {
    console.error('Detailed error in DELETE /employment-equity:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to delete employment equity data', details: error.message });
  }
});

// Yes 4 Youth Initiative - Create (unchanged)
app.post('/yes4youth-initiative', async (req, res) => {
  console.log('Yes 4 Youth Initiative POST hit with body:', req.body);
  const { userId, participants, yesData } = req.body;

  try {
    if (!userId) {
      console.log('Missing userId');
      return res.status(400).json({ error: 'User ID is required' });
    }
    if (!participants || !Array.isArray(participants)) {
      console.log('Invalid participants data');
      return res.status(400).json({ error: 'Participants must be an array' });
    }
    if (!yesData || typeof yesData !== 'object') {
      console.log('Invalid yesData');
      return res.status(400).json({ error: 'YES data must be an object' });
    }

    const userDoc = await adminDb.collection('clients').doc(userId).get();
    if (!userDoc.exists) {
      console.log('User not found for userId:', userId);
      return res.status(404).json({ error: 'User not found' });
    }

    const yesRef = adminDb.collection('yes4YouthInitiative');
    const q = await yesRef.where('userId', '==', userId).get();
    if (!q.empty) {
      console.log('YES initiative already exists for userId:', userId);
      return res.status(409).json({
        error: 'YES initiative already exists for this user. Use PUT to update.',
        existingId: q.docs[0].id,
      });
    }

    const yes4YouthInitiativeData = {
      userId,
      participants: participants.map((participant) => ({
        name: participant.name || '',
        siteLocation: participant.siteLocation || '',
        idNumber: participant.idNumber || '',
        jobTitle: participant.jobTitle || '',
        race: participant.race || '',
        gender: participant.gender || '',
        occupationalLevel: participant.occupationalLevel || '',
        hostEmployerYear: participant.hostEmployerYear || '',
        monthlyStipend: Number(participant.monthlyStipend) || 0,
        startDate: participant.startDate || '',
        endDate: participant.endDate || '',
        isCurrentYesEmployee: Boolean(participant.isCurrentYesEmployee),
        isCompletedYesAbsorbed: Boolean(participant.isCompletedYesAbsorbed),
      })),
      yesData: {
        totalParticipants: Number(yesData.totalParticipants) || 0,
        blackYouthParticipants: Number(yesData.blackYouthParticipants) || 0,
        totalStipendPaid: Number(yesData.totalStipendPaid) || 0,
        currentYesEmployees: Number(yesData.currentYesEmployees) || 0,
        completedYesAbsorbed: Number(yesData.completedYesAbsorbed) || 0,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await adminDb.collection('yes4YouthInitiative').add(yes4YouthInitiativeData);
    console.log('Write successful, doc ID:', docRef.id);

    res.status(201).json({
      message: 'YES 4 Youth Initiative data saved successfully',
      id: docRef.id,
      ...yes4YouthInitiativeData,
    });
  } catch (error) {
    console.error('Detailed error in POST /yes4youth-initiative:', error.message, error.stack);
    res.status(400).json({ error: error.message, code: error.code });
  }
});

// Yes 4 Youth Initiative - Retrieve (updated)
app.get('/yes4youth-initiative/:userId', async (req, res) => {
  console.log('Yes 4 Youth Initiative GET hit with userId:', req.params.userId);
  const { userId } = req.params;

  try {
    if (!userId) {
      console.log('Missing userId in GET request');
      return res.status(400).json({ error: 'User ID is required' });
    }

    const querySnapshot = await adminDb.collection('yes4YouthInitiative').where('userId', '==', userId).get();
    const yesRecords = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    if (yesRecords.length === 0) {
      console.log('No YES initiative data found for userId:', userId);
      return res.status(404).json({ message: 'No YES 4 Youth Initiative data found for this user' });
    }

    console.log('YES initiative data retrieved for userId:', userId);
    res.status(200).json({
      message: 'YES 4 Youth Initiative data retrieved successfully',
      data: yesRecords,
    });
  } catch (error) {
    console.error('YES initiative retrieval error:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to retrieve YES 4 Youth Initiative data', code: error.code });
  }
});

// Yes 4 Youth Initiative - Update (unchanged)
app.put('/yes4youth-initiative/:id', async (req, res) => {
  console.log('Yes 4 Youth Initiative PUT hit with body:', req.body);
  const { id } = req.params;
  const { userId, participants, yesData } = req.body;

  try {
    if (!userId) {
      console.log('Validation failed: Missing userId');
      return res.status(400).json({ error: 'User ID is required' });
    }
    if (!participants || !Array.isArray(participants)) {
      console.log('Validation failed: Participants is not muodified an array or missing', { participants });
      return res.status(400).json({ error: 'Participants must be an array' });
    }
    if (!yesData || typeof yesData !== 'object') {
      console.log('Validation failed: YesData is not an object or missing', { yesData });
      return res.status(400).json({ error: 'YES data must be an object' });
    }

    const userDoc = await adminDb.collection('clients').doc(userId).get();
    if (!userDoc.exists) {
      console.log('User not found for userId:', userId);
      return res.status(404).json({ error: 'User not found' });
    }

    const docRef = adminDb.collection('yes4YouthInitiative').doc(id);
    const existingDoc = await docRef.get();
    if (!existingDoc.exists) {
      console.log('YES initiative data not found for id:', id);
      return res.status(404).json({ error: 'YES 4 Youth Initiative data not found' });
    }

    const yes4YouthInitiativeData = {
      userId,
      participants: participants.map((participant) => ({
        name: participant.name || '',
        siteLocation: participant.siteLocation || '',
        idNumber: participant.idNumber || '',
        jobTitle: participant.jobTitle || '',
        race: participant.race || '',
        gender: participant.gender || '',
        occupationalLevel: participant.occupationalLevel || '',
        hostEmployerYear: participant.hostEmployerYear || '',
        monthlyStipend: Number(participant.monthlyStipend) || 0,
        startDate: participant.startDate || '',
        endDate: participant.endDate || '',
        isCurrentYesEmployee: Boolean(participant.isCurrentYesEmployee),
        isCompletedYesAbsorbed: Boolean(participant.isCompletedYesAbsorbed),
      })),
      yesData: {
        totalParticipants: Number(yesData.totalParticipants) || 0,
        blackYouthParticipants: Number(yesData.blackYouthParticipants) || 0,
        totalStipendPaid: Number(yesData.totalStipendPaid) || 0,
        currentYesEmployees: Number(yesData.currentYesEmployees) || 0,
        completedYesAbsorbed: Number(yesData.completedYesAbsorbed) || 0,
      },
      updatedAt: new Date().toISOString(),
    };

    await docRef.update({
      ...yes4YouthInitiativeData,
      createdAt: existingDoc.data().createdAt, // Preserve original createdAt
    });

    console.log('YES 4 Youth Initiative data updated with ID:', id);
    res.status(200).json({
      message: 'YES 4 Youth Initiative data updated successfully',
      id,
      ...yes4YouthInitiativeData,
    });
  } catch (error) {
    console.error('Detailed error in PUT /yes4youth-initiative:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      requestBody: req.body,
    });
    res.status(400).json({ error: error.message, code: error.code });
  }
});

// Yes 4 Youth Initiative - Delete (unchanged)
app.delete('/yes4youth-initiative/:userId', async (req, res) => {
  console.log('Yes 4 Youth Initiative DELETE hit with userId:', req.params.userId);
  const { userId } = req.params;

  try {
    if (!userId) {
      console.log('Missing userId in params');
      return res.status(400).json({ error: 'User ID is required' });
    }

    const userDoc = await adminDb.collection('clients').doc(userId).get();
    if (!userDoc.exists) {
      console.log('User not found for userId:', userId);
      return res.status(404).json({ error: 'User not found' });
    }

    const yesRef = adminDb.collection('yes4YouthInitiative');
    const query = await yesRef.where('userId', '==', userId).get();

    if (query.empty) {
      console.log('No YES initiative data found for userId:', userId);
      return res.status(404).json({ error: 'YES 4 Youth Initiative data not found for this user' });
    }

    const docToDelete = query.docs[0];
    await adminDb.collection('yes4YouthInitiative').doc(docToDelete.id).delete();

    console.log('YES initiative data deleted for userId:', userId);
    res.status(200).json({
      message: 'YES 4 Youth Initiative data deleted successfully',
      userId,
      deletedDocId: docToDelete.id,
    });
  } catch (error) {
    console.error('Detailed error in DELETE /yes4youth-initiative:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to delete YES 4 Youth Initiative data', details: error.message });
  }
});

// Skills Development - Create
app.post('/skills-development', async (req, res) => {
  console.log('Skills Development POST hit with body:', req.body);
  const { userId, trainings, summary } = req.body;

  try {
    if (!userId) {
      console.log('Missing userId');
      return res.status(400).json({ error: 'User ID is required' });
    }
    if (!trainings || !Array.isArray(trainings)) {
      console.log('Invalid trainings data');
      return res.status(400).json({ error: 'Trainings must be an array' });
    }
    if (!summary || typeof summary !== 'object') {
      console.log('Invalid summary data');
      return res.status(400).json({ error: 'Summary must be an object' });
    }

    const userDoc = await adminDb.collection('clients').doc(userId).get();
    if (!userDoc.exists) {
      console.log('User not found for userId:', userId);
      return res.status(404).json({ error: 'User not found' });
    }

    const skillsRef = adminDb.collection('skillsDevelopment');
    const q = await skillsRef.where('userId', '==', userId).get();
    if (!q.empty) {
      console.log('Skills development already exists for userId:', userId);
      return res.status(409).json({
        error: 'Skills development already exists for this user. Use PUT to update.',
        existingId: q.docs[0].id,
      });
    }

    const skillsDevelopmentData = {
      userId,
      trainings: trainings.map((training) => ({
        startDate: training.startDate || '',
        endDate: training.endDate || '',
        trainingCourse: training.trainingCourse || '',
        trainerProvider: training.trainerProvider || '',
        category: training.category || '',
        learnerName: training.learnerName || '',
        siteLocation: training.siteLocation || '',
        idNumber: training.idNumber || '',
        race: training.race || '',
        gender: training.gender || '',
        isDisabled: Boolean(training.isDisabled),
        coreCriticalSkills: training.coreCriticalSkills || '',
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

    const docRef = await adminDb.collection('skillsDevelopment').add(skillsDevelopmentData);
    console.log('Write successful, doc ID:', docRef.id);

    res.status(201).json({
      message: 'Skills development data saved successfully',
      id: docRef.id,
      ...skillsDevelopmentData,
    });
  } catch (error) {
    console.error('Detailed error in POST /skills-development:', error.message, error.stack);
    res.status(400).json({ error: error.message, code: error.code });
  }
});

// Skills Development - Retrieve
app.get('/skills-development/:userId', async (req, res) => {
  console.log('Skills Development GET hit with userId:', req.params.userId);
  const { userId } = req.params;

  try {
    if (!userId) {
      console.log('Missing userId in GET request');
      return res.status(400).json({ error: 'User ID is required' });
    }

    const querySnapshot = await adminDb.collection('skillsDevelopment').where('userId', '==', userId).get();
    const skillsRecords = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    if (skillsRecords.length === 0) {
      console.log('No skills development data found for userId:', userId);
      return res.status(404).json({ message: 'No skills development data found for this user' });
    }

    console.log('Skills development data retrieved for userId:', userId);
    res.status(200).json({
      message: 'Skills development data retrieved successfully',
      data: skillsRecords,
    });
  } catch (error) {
    console.error('Skills development retrieval error:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to retrieve skills development data', code: error.code });
  }
});

// Skills Development - Update
app.put('/skills-development/:id', async (req, res) => {
  console.log('Skills Development PUT hit with body:', req.body);
  const { id } = req.params;
  const { userId, trainings, summary } = req.body;

  try {
    if (!userId) {
      console.log('Validation failed: Missing userId');
      return res.status(400).json({ error: 'User ID is required' });
    }
    if (!trainings || !Array.isArray(trainings)) {
      console.log('Validation failed: Trainings is not an array or missing', { trainings });
      return res.status(400).json({ error: 'Trainings must be an array' });
    }
    if (!summary || typeof summary !== 'object') {
      console.log('Validation failed: Summary is not an object or missing', { summary });
      return res.status(400).json({ error: 'Summary must be an object' });
    }

    const userDoc = await adminDb.collection('clients').doc(userId).get();
    if (!userDoc.exists) {
      console.log('User not found for userId:', userId);
      return res.status(404).json({ error: 'User not found' });
    }

    const docRef = adminDb.collection('skillsDevelopment').doc(id);
    const existingDoc = await docRef.get();
    if (!existingDoc.exists) {
      console.log('Skills development data not found for id:', id);
      return res.status(404).json({ error: 'Skills development data not found' });
    }

    const skillsDevelopmentData = {
      userId,
      trainings: trainings.map((training) => ({
        startDate: training.startDate || '',
        endDate: training.endDate || '',
        trainingCourse: training.trainingCourse || '',
        trainerProvider: training.trainerProvider || '',
        category: training.category || '',
        learnerName: training.learnerName || '',
        siteLocation: training.siteLocation || '',
        idNumber: training.idNumber || '',
        race: training.race || '',
        gender: training.gender || '',
        isDisabled: Boolean(training.isDisabled),
        coreCriticalSkills: training.coreCriticalSkills || '',
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
      updatedAt: new Date().toISOString(),
    };

    await docRef.update({
      ...skillsDevelopmentData,
      createdAt: existingDoc.data().createdAt,
    });

    console.log('Skills development data updated with ID:', id);
    res.status(200).json({
      message: 'Skills development data updated successfully',
      id,
      ...skillsDevelopmentData,
    });
  } catch (error) {
    console.error('Detailed error in PUT /skills-development:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      requestBody: req.body,
    });
    res.status(400).json({ error: error.message, code: error.code });
  }
});

// Skills Development - Delete
app.delete('/skills-development/:userId', async (req, res) => {
  console.log('Skills Development DELETE hit with userId:', req.params.userId);
  const { userId } = req.params;

  try {
    if (!userId) {
      console.log('Missing userId in params');
      return res.status(400).json({ error: 'User ID is required' });
    }

    const userDoc = await adminDb.collection('clients').doc(userId).get();
    if (!userDoc.exists) {
      console.log('User not found for userId:', userId);
      return res.status(404).json({ error: 'User not found' });
    }

    const skillsRef = adminDb.collection('skillsDevelopment');
    const query = await skillsRef.where('userId', '==', userId).get();

    if (query.empty) {
      console.log('No skills development data found for userId:', userId);
      return res.status(404).json({ error: 'No skills development data found for this user' });
    }

    const docToDelete = query.docs[0];
    await adminDb.collection('skillsDevelopment').doc(docToDelete.id).delete();

    console.log('Skills development data deleted for userId:', userId);
    res.status(200).json({
      message: 'Skills development data deleted successfully',
      userId,
      deletedDocId: docToDelete.id,
    });
  } catch (error) {
    console.error('Detailed error in DELETE /skills-development:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to delete skills development data', details: error.message });
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

    const userDoc = await adminDb.collection("clients").doc(userId).get();
    if (!userDoc.exists) {
      console.log("User not found for userId:", userId);
      return res.status(404).json({ error: "User not found" });
    }

    const ownershipRef = adminDb.collection("ownershipDetails");
    const q = await ownershipRef.where("userId", "==", userId).get();
    if (!q.empty) {
      console.log("Ownership details already exist for userId:", userId);
      return res.status(409).json({
        error: "Ownership details already exist for this user. Use PUT to update.",
        existingId: q.docs[0].id,
      });
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

    const docRef = await adminDb.collection("ownershipDetails").add(ownershipDetailsData);

    console.log("Ownership details created with ID:", docRef.id);
    res.status(201).json({
      message: "Ownership details data saved successfully",
      id: docRef.id,
      ...ownershipDetailsData,
    });
  } catch (error) {
    console.error("Detailed error in POST /ownership-details:", error.message, error.stack);
    res.status(400).json({ error: error.message, code: error.code });
  }
});

// Ownership Details - Retrieve
app.get("/ownership-details/:userId", async (req, res) => {
  console.log("Ownership Details GET hit with userId:", req.params.userId);
  const { userId } = req.params;

  try {
    if (!userId) {
      console.log("Missing userId in GET request");
      return res.status(400).json({ error: "User ID is required" });
    }

    const querySnapshot = await adminDb.collection("ownershipDetails").where("userId", "==", userId).get();
    const ownershipRecords = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    if (ownershipRecords.length === 0) {
      console.log("No ownership details found for userId:", userId);
      return res.status(404).json({ message: "No ownership details data found for this user" });
    }

    console.log("Ownership details retrieved for userId:", userId);
    res.status(200).json({
      message: "Ownership details data retrieved successfully",
      data: ownershipRecords,
    });
  } catch (error) {
    console.error("Ownership details retrieval error:", error.message, error.stack);
    res.status(500).json({ error: "Failed to retrieve ownership details", code: error.code });
  }
});

// Ownership Details - Update
app.put("/ownership-details/:id", async (req, res) => {
  console.log("Ownership Details PUT hit with body:", req.body);
  const { id } = req.params;
  const { userId, participants, entities, ownershipData } = req.body;

  try {
    if (!userId) {
      console.log("Validation failed: Missing userId");
      return res.status(400).json({ error: "User ID is required" });
    }
    if (!participants || !Array.isArray(participants)) {
      console.log("Validation failed: Participants is not an array or missing", { participants });
      return res.status(400).json({ error: "Participants must be an array" });
    }
    if (!entities || !Array.isArray(entities)) {
      console.log("Validation failed: Entities is not an array or missing", { entities });
      return res.status(400).json({ error: "Entities must be an array" });
    }
    if (!ownershipData || typeof ownershipData !== "object") {
      console.log("Validation failed: OwnershipData is not an object or missing", { ownershipData });
      return res.status(400).json({ error: "Ownership data must be an object" });
    }

    const userDoc = await adminDb.collection("clients").doc(userId).get();
    if (!userDoc.exists) {
      console.log("User not found for userId:", userId);
      return res.status(404).json({ error: "User not found" });
    }

    const docRef = adminDb.collection("ownershipDetails").doc(id);
    const existingDoc = await docRef.get();
    if (!existingDoc.exists) {
      console.log("Ownership details not found for id:", id);
      return res.status(404).json({ error: "Ownership details not found" });
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
      updatedAt: new Date().toISOString(),
    };

    await docRef.update({
      ...ownershipDetailsData,
      createdAt: existingDoc.data().createdAt, // Preserve original createdAt
    });

    console.log("Ownership details updated with ID:", id);
    res.status(200).json({
      message: "Ownership details updated successfully",
      id,
      ...ownershipDetailsData,
    });
  } catch (error) {
    console.error("Detailed error in PUT /ownership-details:", {
      message: error.message,
      code: error.code,
      stack: error.stack,
      requestBody: req.body,
    });
    res.status(400).json({ error: error.message, code: error.code });
  }
});

// Delete Ownership Details
app.delete("/ownership-details/:userId", async (req, res) => {
  console.log("Ownership Details DELETE hit with userId:", req.params.userId);
  const { userId } = req.params;

  try {
    if (!userId) {
      console.log("Missing userId in params");
      return res.status(400).json({ error: "User ID is required" });
    }

    // Check if user exists
    const userDoc = await adminDb.collection("clients").doc(userId).get();
    if (!userDoc.exists) {
      console.log("User not found for userId:", userId);
      return res.status(404).json({ error: "User not found" });
    }

    // Find ownership details document for this user
    const ownershipRef = adminDb.collection("ownershipDetails");
    const query = await ownershipRef.where("userId", "==", userId).get();

    if (query.empty) {
      console.log("No ownership details found for userId:", userId);
      return res.status(404).json({ error: "Ownership details not found for this user" });
    }

    // Since userId should be unique, there should only be one document
    const docToDelete = query.docs[0];
    
    // Delete the document
    await adminDb.collection("ownershipDetails").doc(docToDelete.id).delete();

    console.log("Ownership details deleted for userId:", userId);
    res.status(200).json({
      message: "Ownership details deleted successfully",
      userId: userId,
      deletedDocId: docToDelete.id
    });

  } catch (error) {
    console.error("Detailed error in DELETE /ownership-details:", error.message, error.stack);
    res.status(500).json({ error: "Failed to delete ownership details", details: error.message });
  }
});

// Enterprise Development - Create (unchanged)
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

    const userDoc = await getDoc(doc(db, "clients", userId));
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

// Enterprise Development - Retrieve (unchanged)
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

// Socio-Economic Development - Create (unchanged)
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

    const userDoc = await getDoc(doc(db, "clients", userId));
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

// Socio-Economic Development - Retrieve (unchanged)
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