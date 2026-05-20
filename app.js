// ဘရောက်ဆာအတွက် သီးသန့်ထုတ်လုပ်ထားသော Firebase SDK CDN လင့်ခ်များ
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// သင်၏ ပရောဂျက်အသစ် Config (EPUB Creater Pro အတွက်)
const firebaseConfig = {
  apiKey: "AIzaSyAvfwpMNaomyi0gkMNusiTmvhkNSCiRnbg",
  authDomain: "epub-creater-pro.firebaseapp.com",
  projectId: "epub-creater-pro",
  storageBucket: "epub-creater-pro.firebasestorage.app",
  messagingSenderId: "506410443495",
  appId: "1:506410443495:web:eb28948375bc993f9db846",
  measurementId: "G-6D4KSJFV0C"
};

// Firebase စနစ်ကို စတင်သက်ဝင်စေခြင်း
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// စာမျက်နှာစဖွင့်ကတည်းက Login အခြေအနေကို စောင့်ကြည့်ခြင်း
onAuthStateChanged(auth, (user) => {
    const loginBtn = document.getElementById('loginBtn');
    if (user) {
        console.log("User logged in:", user.uid);
        if (loginBtn) {
            loginBtn.innerHTML = `👤 ${user.displayName || 'User'}`;
            loginBtn.onclick = logout;
        }
        listenToData(user.uid);
    } else {
        console.log("No user logged in");
        if (loginBtn) {
            loginBtn.innerHTML = "🔑 Login";
            loginBtn.onclick = login;
        }
        clearUI();
    }
});

// Login ဝင်သည့် Function (Pop-up စနစ်)
window.login = async function() {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        alert(user.displayName + " အဖြစ် အောင်မြင်စွာ Login ဝင်ပြီးပါပြီဗျာ။");
    } catch (error) {
        console.error("Login Error:", error);
        alert("Login ဝင်၍မရပါ- " + error.message);
    }
};

// Logout ထွက်သည့် Function
window.logout = async function() {
    try {
        await signOut(auth);
        alert("Logout ထွက်ပြီးပါပြီ။");
    } catch (error) {
        console.error("Logout Error:", error);
    }
};

// Firestore ထဲသို့ ဒေတာသိမ်းခြင်း
window.saveDataToFirebase = async function(data) {
    const user = auth.currentUser;
    if (!user) {
        alert("ဒေတာသိမ်းရန် ဦးစွာ Login ဝင်ပေးပါဗျာ။");
        return;
    }
    try {
        await setDoc(doc(db, "users", user.uid), {
            epubs: data,
            updatedAt: new Date().toISOString()
        });
        console.log("Data saved successfully!");
    } catch (error) {
        console.error("Error saving data:", error);
        alert("ဒေတာသိမ်းဆည်းမှု မအောင်မြင်ပါ- " + error.message);
    }
};

// Firestore မှ ဒေတာများကို အချိန်နှင့်တပြေးညီ နားထောင်ခြင်း
function listenToData(uid) {
    onSnapshot(doc(db, "users", uid), (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            if (data && data.epubs) {
                window.savedEpubs = data.epubs;
                if (typeof window.renderSavedEpubsList === 'function') {
                    window.renderSavedEpubsList();
                }
            }
        }
    });
}

function clearUI() {
    window.savedEpubs = [];
    if (typeof window.renderSavedEpubsList === 'function') {
        window.renderSavedEpubsList();
    }
}
