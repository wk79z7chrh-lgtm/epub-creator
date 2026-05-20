// Firebase Config (EPUB Creater Pro)
const firebaseConfig = {
  apiKey: "AIzaSyAvfwpMNaomyi0gkMNusiTmvhkNSCiRnbg",
  authDomain: "epub-creater-pro.firebaseapp.com",
  projectId: "epub-creater-pro",
  storageBucket: "epub-creater-pro.firebasestorage.app",
  messagingSenderId: "506410443495",
  appId: "1:506410443495:web:eb28948375bc993f9db846",
  measurementId: "G-6D4KSJFV0C"
};

// HTML ထဲသို့ Firebase Libraries များကို Dynamic စနစ်ဖြင့် ထည့်သွင်းခြင်း
const scripts = [
    "https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js",
    "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth-compat.js",
    "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore-compat.js"
];

function loadScripts(urls, callback) {
    let loaded = 0;
    urls.forEach(url => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = () => {
            loaded++;
            if (loaded === urls.length) callback();
        };
        document.head.appendChild(script);
    });
}

// စနစ်တစ်ခုလုံးကို စတင်ပတ်မောင်းခြင်း
loadScripts(scripts, () => {
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();
    const provider = new firebase.auth.GoogleAuthProvider();

    auth.onAuthStateChanged((user) => {
        const loginBtn = document.getElementById('loginBtn');
        if (user) {
            if (loginBtn) {
                loginBtn.innerHTML = `👤 ${user.displayName || 'User'}`;
                loginBtn.onclick = logout;
            }
            listenToData(user.uid, db);
        } else {
            if (loginBtn) {
                loginBtn.innerHTML = "🔑 Login";
                loginBtn.onclick = login;
            }
            clearUI();
        }
    });

    window.login = async function() {
        try {
            provider.setCustomParameters({ prompt: 'select_account' });
            await auth.signInWithRedirect(provider);
        } catch (error) {
            alert("Login ဝင်၍မရပါ- " + error.message);
        }
    };

    window.logout = async function() {
        try {
            await auth.signOut();
            alert("Logout ထွက်ပြီးပါပြီ။");
        } catch (error) {
            console.error(error);
        }
    };

    window.saveDataToFirebase = async function(data) {
        const user = auth.currentUser;
        if (!user) {
            alert("ဒေတာသိမ်းရန် ဦးစွာ Login ဝင်ပေးပါဗျာ။");
            return;
        }
        try {
            await db.collection("users").doc(user.uid).set({
                epubs: data,
                updatedAt: new Date().toISOString()
            });
            console.log("Data saved successfully!");
        } catch (error) {
            alert("ဒေတာသိမ်းဆည်းမှု မအောင်မြင်ပါ- " + error.message);
        }
    };
});

function listenToData(uid, db) {
    db.collection("users").doc(uid).onSnapshot((docSnap) => {
        if (docSnap.exists) {
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
