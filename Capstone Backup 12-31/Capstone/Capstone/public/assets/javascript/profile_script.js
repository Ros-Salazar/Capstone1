import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { getFirestore, getDocs, collection, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, updatePassword, signOut } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCOo_r7lBGB_FiuwFIcsc-ecRsd43pDXF0",
    authDomain: "ceo-projectmanagementweb.firebaseapp.com",
    projectId: "ceo-projectmanagementweb",
    storageBucket: "ceo-projectmanagementweb.appspot.com",
    messagingSenderId: "60010633148",
    appId: "1:60010633148:web:abaa3776928df2a351fdb9",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// DOM Elements
const profileForm = document.querySelector('.profile-form');
const firstNameInput = document.getElementById('firstName');
const lastNameInput = document.getElementById('lastName');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const positionInput = document.getElementById('position');
const logoutButton = document.getElementById('logoutButton');

// Redirect to Project Template
const openProject = (projectId) => {
    window.location.href = `projectTemplate.html?projectId=${projectId}`;
};

// Populate Navigation Pane
const fetchProjectsForNav = async () => {
    const projects = [];
    const querySnapshot = await getDocs(collection(db, "projects"));
    querySnapshot.forEach((doc) => {
        projects.push({ id: doc.id, ...doc.data() });
    });
    return projects;
};

const populateNavigationPane = async () => {
    projectList.innerHTML = ''; // Clear existing items
    const projects = await fetchProjectsForNav();
    projects.forEach((project) => {
        const li = document.createElement('li');
        li.textContent = project.name;
        li.className = project.group;
        li.addEventListener('click', () => openProject(project.id));
        projectList.appendChild(li);
    });
};

// Handle navigation pane toggle
document.querySelector('.header-right a[href="#projects"]').addEventListener('click', async (e) => {
    e.preventDefault();
    if (navigationPane.style.display === 'none' || !navigationPane.style.display) {
        await populateNavigationPane();
        navigationPane.style.display = 'block';
    } else {
        navigationPane.style.display = 'none';
    }
});

// Fetch User Profile Data
const fetchUserProfile = async (uid) => {
    try {
        const userDocRef = doc(db, "users", uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            return userDoc.data();
        } else {
            console.error("User profile not found.");
            return null;
        }
    } catch (error) {
        console.error("Error fetching user profile:", error);
    }
};

// Populate Profile Form
const populateProfile = (userData) => {
    if (userData) {
        firstNameInput.value = userData.firstName || "";
        lastNameInput.value = userData.lastName || "";
        emailInput.value = userData.email || "";
        positionInput.value = userData.position || "";

        // Make position and email fields uneditable
        emailInput.setAttribute('readonly', true);
        positionInput.setAttribute('readonly', true);
    } else {
        alert("Failed to load profile information.");
    }
};

// Save Profile Data
const saveUserProfile = async (uid, userData) => {
    try {
        const userDocRef = doc(db, "users", uid);
        await setDoc(userDocRef, userData, { merge: true });
        alert("Profile updated successfully.");
    } catch (error) {
        console.error("Error saving profile:", error);
        alert("Failed to save profile. Please try again.");
    }
};

// Listen for Auth State
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userData = await fetchUserProfile(user.uid);
        populateProfile(userData);

        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Validate password fields
            const newPassword = passwordInput.value.trim();
            const confirmPassword = confirmPasswordInput.value.trim();

            if (newPassword && newPassword !== confirmPassword) {
                alert("Passwords do not match.");
                return;
            }

            const updatedUserData = {
                firstName: firstNameInput.value.trim(),
                lastName: lastNameInput.value.trim(),
                email: emailInput.value.trim(),
                position: positionInput.value.trim(),
            };

            // Save updated profile data
            await saveUserProfile(user.uid, updatedUserData);

            // Update password if changed
            if (newPassword) {
                try {
                    await updatePassword(user, newPassword);
                    alert("Password updated successfully.");
                } catch (error) {
                    console.error("Error updating password:", error);
                    alert("Failed to update password. Please try again.");
                }
            }
        });
    } else {
        window.location.href = "/public/index.html";
    }
});


// Logout Button Functionality
logoutButton.addEventListener('click', () => {
    signOut(auth)
        .then(() => {
            alert("You have been logged out.");
            window.location.href = "/public/index.html";
        })
        .catch((error) => {
            console.error("Error during logout:", error);
            alert("Failed to log out. Please try again.");
        });
});
