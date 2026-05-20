// Firebase SDK Modules များကို CDN မှ လှမ်းခေါ်ခြင်း (Web App အတွက် အကောင်းဆုံး ပုံစံ)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// သင့်ရဲ့ Firebase Config အစစ်အမှန်ကို ထည့်သွင်းထားခြင်း
const firebaseConfig = {
  apiKey: "AIzaSyBk1jogWTVgJ9FNdnV7jf5rWXFT5pnx3uo",
  authDomain: "epub-creater.firebaseapp.com",
  projectId: "epub-creater",
  storageBucket: "epub-creater.firebasestorage.app",
  messagingSenderId: "1089709692644",
  appId: "1:1089709692644:web:a0e9d2041c41eae7413ef1",
  measurementId: "G-W8GX9E0V5T"
};

// Firebase အား စတင်အသက်သွင်းခြင်း
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// Global Variables များသတ်မှတ်ခြင်း
let quill;
let chapters = [{ id: "ch-1", title: "Chapter 1", content: "" }];
let activeChapterId = "ch-1";
let currentUser = null;
let currentLang = 'my';
let unsubscribeSnapshot = null;

// PDF.js Worker Engine သတ်မှတ်ချက်
if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
}

// Multi-Language Translation Dictionary
const langPack = {
    my: {
        appTitle: "📘 Web ePub Creator Pro",
        secMeta: "ℹ️ စာအုပ်အချက်အလက်",
        lblTitle: "စာအုပ်ခေါင်းစဉ်",
        lblAuthor: "စာရေးဆရာအမည်",
        lblCover: "စာအုပ်မျက်နှာဖုံးပုံ (Cover Image)",
        lblPdf: "📄 PDF မှ စာသားဆွဲထုတ်မည် (Optional)",
        secChapters: "🔢 အခန်းများ စာရင်း",
        lblChaptitle: "အခန်းခေါင်းစဉ်",
        lblContent: "အကြောင်းအရာနှင့် ဓာတ်ပုံများ",
        lblToc: "📋 စာအုပ်မာတိကာ အကြိုကြည့်ရှုရန်",
        alertNoPdf: "ကျေးဇူးပြု၍ PDF ဖိုင်အရင်ရွေးချယ်ပေးပါရန်။",
        alertSuccessPdf: "PDF မှ စာသားများကို အောင်မြင်စွာ ဆွဲထုတ်ပြီးပါပြီ။",
        alertFailPdf: "PDF ဖတ်ရာတွင် အမှားအယွင်းရှိနေပါသည်။",
        alertDeleteConf: "ဤအခန်းကို ဖျက်ပစ်ရန် သေချာပါသလား။",
        alertMinChap: "အနည်းဆုံး အခန်းတစ်ခန်းတော့ ရှိရပါမည်ဗျာ။"
    },
    en: {
        appTitle: "📘 Web ePub Creator Pro",
        secMeta: "ℹ️ Book Information",
        lblTitle: "Book Title",
        lblAuthor: "Author Name",
        lblCover: "Book Cover Image",
        lblPdf: "📄 Extract Text from PDF (Optional)",
        secChapters: "🔢 Chapters Directory",
        lblChaptitle: "Chapter Title",
        lblContent: "Content & Inline Graphics",
        lblToc: "📋 Live Table of Contents Preview",
        alertNoPdf: "Please select a PDF file first.",
        alertSuccessPdf: "Text extracted from PDF successfully!",
        alertFailPdf: "An error occurred while parsing the PDF document.",
        alertDeleteConf: "Are you sure you want to delete this chapter?",
        alertMinChap: "You must have at least one active chapter."
    }
};

// App စတင်ပွင့်ချိန်တွင် အလုပ်လုပ်မည့် Bootstrapping စနစ်
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initLanguageEngine();
    initEditor();
    
    // ယာယီအဖြစ် Local Storage မှ ဒေတာအဟောင်းကို အရင်ပြပေးထားမည်
    loadLocalData();
    renderTabs();
    renderTOC();
    setupEventListeners();

    // Firebase Auth အခြေအနေကို စောင့်ကြည့်စစ်ဆေးခြင်း (အဓိက အသက်သွင်းသည့်အပိုင်း)
    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUser = user;
            showLoggedInUI(user);
            // အကောင့်ဝင်ထားလျှင် Cloud (Firestore) မှ ဒေတာများကို Realtime မပြတ် စောင့်ကြည့်ယူမည်
            listenToCloudData(user.uid);
        } else {
            currentUser = null;
            showLoggedOutUI();
            if (unsubscribeSnapshot) unsubscribeSnapshot();
            loadLocalData();
            renderTabs();
            renderTOC();
        }
    });
});

// UI Event Listeners များ ချိတ်ဆက်ခြင်း
function setupEventListeners() {
    document.getElementById("login-btn").addEventListener("click", handleLogin);
    document.getElementById("logout-btn").addEventListener("click", handleLogout);
    document.getElementById("add-chapter-btn").addEventListener("click", addNewChapter);
    document.getElementById("move-left-btn").addEventListener("click", () => moveChapter(-1));
    document.getElementById("move-right-btn").addEventListener("click", () => moveChapter(1));
    document.getElementById("delete-chapter-btn").addEventListener("click", deleteActiveChapter);
    document.getElementById("extract-btn").addEventListener("click", handlePdfExtraction);
    document.getElementById("generate-btn").addEventListener("click", generateEpubFile);

    // Sync Metadata Fields
    ['book-title', 'book-author'].forEach(id => {
        document.getElementById(id).addEventListener('input', saveDataRouter);
    });

    // Active ဖြစ်နေသော အခန်းခေါင်းစဉ် စာရိုက်သည့်အကွက် စောင့်ကြည့်ခြင်း
    document.getElementById('chapter-title').addEventListener('input', (e) => {
        const activeCh = chapters.find(c => c.id === activeChapterId);
        if (activeCh) {
            activeCh.title = e.target.value || 'Untitled Chapter';
            const tabElem = document.querySelector(`[data-id="${activeChapterId}"]`);
            if (tabElem) tabElem.innerText = e.target.value;
            renderTOC();
            saveDataRouter();
        }
    });

    // Typography Options Interactivity
    document.getElementById('font-family-select').addEventListener('change', (e) => {
        if (quill) quill.root.style.fontFamily = e.target.value;
    });

    document.getElementById('font-size-select').addEventListener('change', (e) => {
        if (quill) quill.root.style.fontSize = e.target.value;
    });

    // Native Photo Loader Interface Trigger
    const imgLoader = document.getElementById('image-loader');
    document.getElementById('insert-image-btn').addEventListener('click', () => imgLoader.click());
    imgLoader.addEventListener('change', handleInlineImageUpload);
}

// Rich Text Core Engine (Quill)
function initEditor() {
    quill = new Quill('#editor-container', {
        theme: 'snow',
        modules: { toolbar: false }
    });

    quill.on('text-change', () => {
        const target = chapters.find(c => c.id === activeChapterId);
        if (target) {
            target.content = quill.root.innerHTML;
            saveDataRouter();
        }
    });
}

// Firebase Auth Login / Logout
async function handleLogin() {
    try {
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error("Login Error:", error);
    }
}

async function handleLogout() {
    if (confirm(currentLang === 'my' ? "အကောင့်မှ ထွက်မှာ သေချာပါသလားဗျာ။" : "Are you sure you want to log out?")) {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Logout Error:", error);
        }
    }
}

function showLoggedInUI(user) {
    document.getElementById("auth-logged-out").style.display = "none";
    document.getElementById("auth-logged-in").style.display = "flex";
    document.getElementById("user-avatar").src = user.photoURL || "https://via.placeholder.com/150";
    document.getElementById("user-name").innerText = user.displayName || "Author";
}

function showLoggedOutUI() {
    document.getElementById("auth-logged-out").style.display = "block";
    document.getElementById("auth-logged-in").style.display = "none";
}

// Data Sync Router (အကောင့်ရှိလျှင် Cloud တင်၊ မရှိလျှင် Local Storage ထဲသိမ်း)
function saveDataRouter() {
    if (currentUser) {
        saveToCloud();
    } else {
        saveToLocalStorage();
    }
}

function saveToLocalStorage() {
    const data = {
        bookTitle: document.getElementById('book-title').value,
        bookAuthor: document.getElementById('book-author').value,
        chapters: chapters,
        activeChapterId: activeChapterId
    };
    localStorage.setItem("epub_creator_local_data", JSON.stringify(data));
}

function loadLocalData() {
    const localData = localStorage.getItem("epub_creator_local_data");
    if (localData) {
        const parsed = JSON.parse(localData);
        document.getElementById('book-title').value = parsed.bookTitle || "";
        document.getElementById('book-author').value = parsed.bookAuthor || "";
        chapters = parsed.chapters || [{ id: "ch-1", title: "Chapter 1", content: "" }];
        activeChapterId = parsed.activeChapterId || chapters[0].id;
    }
}

// Realtime Cloud Synchronization (Firestore)
async function saveToCloud() {
    if (!currentUser) return;
    try {
        const userDocRef = doc(db, "user_books", currentUser.uid);
        await setDoc(userDocRef, {
            bookTitle: document.getElementById('book-title').value,
            bookAuthor: document.getElementById('book-author').value,
            chapters: chapters,
            activeChapterId: activeChapterId,
            updatedAt: new Date().toISOString()
        }, { merge: true });
    } catch (error) {
        console.error("Cloud Sync Error:", error);
    }
}

function listenToCloudData(uid) {
    const userDocRef = doc(db, "user_books", uid);
    unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
            const cloudData = docSnap.data();
            
            // User စာရိုက်နေစဉ် မျက်နှာပြင်တစ်ခုလုံး Reset မဖြစ်သွားစေရန် Input များကို Focus စစ်ပြီးမှ ဒေတာထည့်သည်
            if (document.activeElement !== document.getElementById('book-title')) document.getElementById('book-title').value = cloudData.bookTitle || "";
            if (document.activeElement !== document.getElementById('book-author')) document.getElementById('book-author').value = cloudData.bookAuthor || "";
            
            chapters = cloudData.chapters || [{ id: "ch-1", title: "Chapter 1", content: "" }];
            
            if (cloudData.activeChapterId && chapters.some(c => c.id === cloudData.activeChapterId)) {
                activeChapterId = cloudData.activeChapterId;
            } else {
                activeChapterId = chapters[0].id;
            }
            
            renderTabs();
            renderTOC();
            
            const activeCh = chapters.find(c => c.id === activeChapterId);
            if (activeCh && document.activeElement !== document.getElementById('chapter-title') && !quill.hasFocus()) {
                document.getElementById('chapter-title').value = activeCh.title;
                quill.root.innerHTML = activeCh.content || "";
            }
        }
    });
}

// Render UI Components
function renderTabs() {
    chaptersListContainer.innerHTML = "";
    chapters.forEach(ch => {
        const tab = document.createElement("button");
        tab.type = "button";
        tab.className = `chapter-tab ${ch.id === activeChapterId ? 'active' : ''}`;
        tab.innerText = ch.title;
        tab.setAttribute("data-id", ch.id);
        tab.addEventListener("click", () => switchChapter(ch.id));
        chaptersListContainer.appendChild(tab);
    });
}

function renderTOC() {
    tocPreviewList.innerHTML = "";
    chapters.forEach(ch => {
        const li = document.createElement("li");
        li.innerText = ch.title;
        li.addEventListener("click", () => switchChapter(ch.id));
        tocPreviewList.appendChild(li);
    });
}

function switchChapter(id) {
    if (id === activeChapterId) return;
    activeChapterId = id;
    const ch = chapters.find(c => c.id === id);
    if (ch) {
        document.getElementById('chapter-title').value = ch.title;
        quill.root.innerHTML = ch.content || "";
    }
    renderTabs();
    saveDataRouter();
}

function addNewChapter() {
    const newId = "ch-" + Date.now();
    const newCh = { id: newId, title: `Chapter ${chapters.length + 1}`, content: "" };
    chapters.push(newCh);
    switchChapter(newId);
}

function moveChapter(direction) {
    const index = chapters.findIndex(c => c.id === activeChapterId);
    if (index === -1) return;
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= chapters.length) return;
    
    [chapters[index], chapters[targetIndex]] = [chapters[targetIndex], chapters[index]];
    renderTabs();
    renderTOC();
    saveDataRouter();
}

function deleteActiveChapter() {
    const t = langPack[currentLang];
    if (chapters.length <= 1) {
        alert(t.alertMinChap); return;
    }
    if (confirm(t.alertDeleteConf)) {
        const index = chapters.findIndex(c => c.id === activeChapterId);
        chapters.splice(index, 1);
        activeChapterId = chapters[Math.max(0, index - 1)].id;
        
        const ch = chapters.find(c => c.id === activeChapterId);
        document.getElementById('chapter-title').value = ch.title;
        quill.root.innerHTML = ch.content || "";
        renderTabs(); renderTOC(); saveDataRouter();
    }
}

// PDF Extractor Engine
async function handlePdfExtraction() {
    const t = langPack[currentLang];
    const fileInput = document.getElementById('pdf-file');
    if (!fileInput || !fileInput.files.length) {
        alert(t.alertNoPdf); return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = async function() {
        const typedarray = new Uint8Array(this.result);
        try {
            const pdf = await pdfjsLib.getDocument(typedarray).promise;
            let fullText = '';
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(' ');
                fullText += `<h3>Page ${i}</h3><p>${pageText}</p><br>`;
            }
            quill.root.innerHTML = fullText;
            const cur = chapters.find(c => c.id === activeChapterId);
            if (cur) cur.content = fullText;
            alert(t.alertSuccessPdf);
            saveDataRouter();
        } catch (err) {
            alert(t.alertFailPdf);
        }
    };
    reader.readAsArrayBuffer(file);
}

// Inline Images Upload Trigger
function handleInlineImageUpload(e) {
    const file = e.target.files[0];
    if (file && quill) {
        const reader = new FileReader();
        reader.onload = function(evt) {
            const range = quill.getSelection(true) || { index: quill.getLength() };
            quill.insertEmbed(range.index, 'image', evt.target.result);
            quill.setSelection(range.index + 1);
        };
        reader.readAsDataURL(file);
    }
    e.target.value = '';
}

// ePub Package Generator Packaging Engine
async function generateEpubFile() {
    const bookTitle = document.getElementById('book-title').value || 'Untitled Book';
    const bookAuthor = document.getElementById('book-author').value || 'Unknown Author';
    const coverInput = document.getElementById('book-cover');

    const zip = new JSZip();
    zip.file('mimetype', 'application/epub+zip', { compression: "STORE" });
    
    const containerXml = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
<rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles>
</container>`;
    zip.folder('META-INF').file('container.xml', containerXml);

    const oebps = zip.folder('OEBPS');
    let hasCover = false;
    if (coverInput && coverInput.files.length > 0) {
        const coverFile = coverInput.files[0];
        const coverData = await new Promise(r => {
            const f = new FileReader(); f.onload = (e) => r(e.target.result); f.readAsArrayBuffer(coverFile);
        });
        oebps.file('cover.jpg', coverData);
        hasCover = true;
    }

    let manifestItems = '';
    let spineItems = '';
    if (hasCover) manifestItems += `    <item id="cover-img" href="cover.jpg" media-type="image/jpeg"/>\n`;

    chapters.forEach((chap, idx) => {
        const filename = `chapter_${idx + 1}.xhtml`;
        const xhtmlContent = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<title>${chap.title}</title>
<style>
    body { font-family: sans-serif; padding: 5%; line-height: 1.6; }
    h1 { text-align: center; color: #333333; }
    img { max-width: 100%; height: auto; display: block; margin: 15px auto; border-radius: 6px; }
</style>
</head>
<body>
<h1>${chap.title}</h1>
${chap.content}
</body>
</html>`;
        oebps.file(filename, xhtmlContent);
        manifestItems += `    <item id="chap_${idx + 1}" href="${filename}" media-type="application/xhtml+xml"/>\n`;
        spineItems += `    <itemref idref="chap_${idx + 1}"/>\n`;
    });

    const opfContent = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="bookid" version="2.0">
<metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
    <dc:title>${bookTitle}</dc:title>
    <dc:creator opf:role="aut">${bookAuthor}</dc:creator>
    <dc:language>my</dc:language>
    <dc:identifier id="bookid">urn:uuid:${Math.random().toString(36).substring(2)}</dc:identifier>
</metadata>
<manifest>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
${manifestItems}
</manifest>
<spine toc="ncx">${spineItems}</spine>
</package>`;
    oebps.file('content.opf', opfContent);

    let ncxNav = '';
    chapters.forEach((chap, idx) => {
        ncxNav += `        <navPoint id="nav_${idx + 1}" playOrder="${idx + 1}">
        <navLabel><text>${chap.title}</text></navLabel>
        <content src="chapter_${idx + 1}.xhtml"/>
    </navPoint>\n`;
    });

    const ncxContent = `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
<head><meta name="dtb:uid" content="urn:uuid:12345"/><meta name="dtb:depth" content="1"/></head>
<docTitle><text>${bookTitle}</text></docTitle>
<navMap>${ncxNav}</navMap>
</ncx>`;
    oebps.file('toc.ncx', ncxContent);

    const content = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `${bookTitle}.epub`;
    link.click();
}

// Theme (Dark / Light) Settings
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const icon = document.querySelector('#theme-toggle .mode-icon');
    if (icon) icon.innerText = savedTheme === 'dark' ? '☀️' : '🌙';
}

// Multi-Language Change Configuration
function initLanguageEngine() {
    const selector = document.getElementById('lang-select');
    currentLang = localStorage.getItem('appLang') || 'my';
    selector.value = currentLang;
    applyTranslations();

    selector.addEventListener('change', (e) => {
        currentLang = e.target.value;
        localStorage.setItem('appLang', currentLang);
        applyTranslations();
        renderTabs();
    });
}

function applyTranslations() {
    const t = langPack[currentLang];
    document.getElementById("txt-app-title").innerText = t.appTitle;
    document.getElementById("txt-sec-meta").innerText = t.secMeta;
    document.getElementById("txt-lbl-title").innerText = t.lblTitle;
    document.getElementById("txt-lbl-author").innerText = t.lblAuthor;
    document.getElementById("txt-lbl-cover").innerText = t.lblCover;
    document.getElementById("txt-lbl-pdf").innerText = t.lblPdf;
    document.getElementById("txt-sec-chapters").innerText = t.secChapters;
    document.getElementById("txt-lbl-chaptitle").innerText = t.lblChaptitle;
    document.getElementById("txt-lbl-content").innerText = t.lblContent;
    document.getElementById("txt-lbl-toc").innerText = t.lblToc;
}
