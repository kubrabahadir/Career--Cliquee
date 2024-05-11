
const firebaseConfig = {
    apiKey: "AIzaSyDbRHsscoIn_MHz3q9dS3St-MynPWbw6ls",
    authDomain: "thesis-career-cliquee.firebaseapp.com",
    projectId: "thesis-career-cliquee",
    storageBucket: "thesis-career-cliquee.appspot.com",
    messagingSenderId: "605410191328",
    appId: "1:605410191328:web:c23aa6801ff94182e76d85",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Firebase Authentication
const auth = getAuth(app);
export { app, db, auth }
