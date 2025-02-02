import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  getAuth
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
import { loadGoals } from './goals.js';
import { loadMoodHistory } from './mood.js';
import { loadAdvice } from './advice.js';
import { loadStats } from './stats.js';

export let auth;
export let db;

// Initialize auth when the module loads
export function initAuth(app) {
  auth = getAuth(app);
  db = getFirestore(app);

  // Make auth and db available globally
  window.auth = auth;
  window.db = db;

  // Auth state observer
  onAuthStateChanged(auth, async user => {
    if (user) {
      try {
        await showDashboard(user);
        // Load initial data
        await Promise.allSettled([
          loadMoodHistory(),
          loadGoals(),
          loadAdvice(),
          loadStats()
        ]);
      } catch (error) {
        console.error('Error loading dashboard:', error);
        // Still show dashboard even if some data fails to load
        document.getElementById('auth-screen').classList.remove('active');
        document.getElementById('dashboard').classList.add('active');
      }
    } else {
      showAuthScreen();
    }
  });
}

function showTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
  
  document.querySelector(`button[onclick="showTab('${tab}')"]`).classList.add('active');
  document.getElementById(`${tab}-form`).classList.add('active');
}

async function login() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    alert(error.message);
  }
}

async function register() {
  const name = document.getElementById('register-name').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      name: name,
      email: email,
      createdAt: new Date()
    });
  } catch (error) {
    alert(error.message);
  }
}

function logout() {
  signOut(auth);
}

function showAuthScreen() {
  document.getElementById('auth-screen').classList.add('active');
  document.getElementById('dashboard').classList.remove('active');
}

async function showDashboard(user) {
  document.getElementById('auth-screen').classList.remove('active');
  document.getElementById('dashboard').classList.add('active');
  
  try {
    // Load user info
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      document.getElementById('user-name').textContent = userDoc.data().name;
    } else {
      document.getElementById('user-name').textContent = 'Usuario';
    }
  } catch (error) {
    console.error('Error loading user info:', error);
    document.getElementById('user-name').textContent = 'Usuario';
  }
}

// Export functions to be used globally
window.showTab = showTab;
window.login = login;
window.register = register;
window.logout = logout;
window.showAuthScreen = showAuthScreen;
window.showDashboard = showDashboard;