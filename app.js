// Firebase Config (EPUB Creator Pro)
const firebaseConfig = {
  apiKey: "AIzaSyAvfwpMNaomyi0gkMNusiTmvhkNSCiRnbg",
  authDomain: "epub-creater-pro.firebaseapp.com",
  projectId: "epub-creater-pro",
  storageBucket: "epub-creater-pro.firebasestorage.app",
  messagingSenderId: "506410443495",
  appId: "1:506410443495:web:eb28948375bc993f9db846",
  measurementId: "G-6D4KSJFV0C"
};

// စနစ်သစ် (v10) Libraries များကို ဘရောက်ဆာ တိုက်ရိုက်နားလည်သည့် ပုံစံဖြင့် Dynamic လှမ်းခေါ်ခြင်း
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

// ဖိုင်များအားလုံး တက်လာပြီးမှ စနစ်ကို စတင်ပတ်မောင်းခြင်း
loadScripts(scripts, () => {
    // Firebase ကို Initialize လုပ်ခြင်း
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();
    const provider = new firebase.auth.GoogleAuthProvider();

    // စာမျက်နှာစဖွင့်ချိန်တွင် Redirect ပတ်ပြီး ပြန်ကျလာသည့် ရလဒ်ကို အရင်ဖမ်းယူခြင်း
    auth.getRedirectResult()
        .then((result) => {
            if (result && result.user) {
                console.log("Redirect login success:", result.user.displayName);
            }
        })
        .catch((error) => {
            console.error("Redirect Error:", error);
            // internal-error ထပ်မဖြစ်စေရန် ခွင့်ပြုချက်မရှိသော Domain ပြဿနာကို သတိပေးခြင်း
            if(error.code === "auth/internal-error") {
                alert("Firebase ဘက်မှ ခွင့်ပြုချက် (Authorized Domains) မရသေးပါဗျာ။");
            }
        });

    // အကောင့်ဝင်/ထွက် အခြေအနေကို စောင့်ကြည့်စစ်ဆေးခြင်း
    auth.onAuthStateChanged((user) => {
        const loginBtn = document.getElementById('loginBtn');
        if (user) {
            if (loginBtn) {
                loginBtn.innerHTML = `👤 ${user.displayName || 'User'}`;
                // အကောင့်ဝင်ထားချိန်တွင် နှိပ်ပါက Logout ဖြစ်စေရန်
                loginBtn.onclick = window.logout; 
            }
            listenToData(user.uid, db);
        } else {
            if (loginBtn) {
                loginBtn.innerHTML = "🔑 Login";
                // အကောင့်မဝင်ရသေးချိန်တွင် နှိပ်ပါက Login ဖြစ်စေရန်
                loginBtn.onclick = window.login; 
            }
            clearUI();
        }
    });

    // Login Function (Redirect ပတ်ပြီးနောက် သင့် Website ရဲ့ လမ်းကြောင်းအမှန်အတိုင်း ပြန်လှည့်လာစေရန် သတ်မှတ်ခြင်း)
    window.login = async function() {
        try {
            provider.setCustomParameters({ 
                prompt: 'select_account' 
            });
            await auth.signInWithRedirect(provider);
        } catch (error) {
            console.error("Login Trigger Error:", error);
            alert("Login ဝင်ရန် ကြိုးပမ်းမှု မအောင်မြင်ပါ- " + error.message);
        }
    };

    // Logout Function
    window.logout = async function() {
        try {
            await auth.signOut();
            alert("Logout ထွက်ပြီးပါပြီဗျာ။");
        } catch (error) {
            console.error("Logout Error:", error);
        }
    };

    // ဒေတာသိမ်းဆည်းသည့် Function
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
            alert("ဒေတာများကို Cloud ပေါ်သို့ အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ!");
        } catch (error) {
            console.error("Save Data Error:", error);
            alert("ဒေတာသိမ်းဆည်းမှု မအောင်မြင်ပါ- " + error.message);
        }
    };
});

// Realtime Database မှ ဒေတာများကို နားထောင်ခြင်း
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
    }, (error) => {
        console.error("Database Snapshot Error:", error);
    });
}

// UI ကို ရှင်းလင်းခြင်း
function clearUI() {
    window.savedEpubs = [];
    if (typeof window.renderSavedEpubsList === 'function') {
        window.renderSavedEpubsList();
    }
}
