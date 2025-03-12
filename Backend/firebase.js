const { initializeApp } = require("firebase/app");
const { getAuth } = require("firebase/auth");
const { getFirestore } = require("firebase/firestore");

const firebaseConfig = {
    apiKey: "AIzaSyCcLIxqXP6K9B2UhwGWnqYg4fTUiX4oErc",
    authDomain: "bbbee-25a87.firebaseapp.com",
    projectId: "bbbee-25a87",
    storageBucket: "bbbee-25a87.firebasestorage.app",
    messagingSenderId: "533811192631",
    appId: "1:533811192631:web:29f38f3502bfc14f8ab0b2",
    measurementId: "G-JS73TGLEEY"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

module.exports = { auth, db };