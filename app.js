// Setup PDF.js Worker Engine
if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
}

// Global Multi-Language Pack
const langPack = {
    my: {
        title: "📘 Web ePub Creator Pro",
        subtitle: "PDF ဖိုင်များမှ စာသားဆွဲထုတ်၍ အခန်းများစွာပါဝင်သော ePub စာအုပ် ဖန်တီးပါ",
        secMeta: "ℹ️ စာအုပ်အချက်အလက်",
        lblTitle: "စာအုပ်ခေါင်းစဉ်",
        lblAuthor: "စာရေးဆရာအမည်",
        lblCover: "စာအုပ်မျက်နှာဖုံးပုံ (Cover Image)",
        lblPdf: "📄 PDF မှ စာသားဆွဲထုတ်မည် (Optional)",
        btnExtract: "⚡ PDF မှ စာသားများကို ဆွဲထုတ်မည်",
        secChapters: "🔢 အခန်းများ စာရင်း",
        btnAdd: "+ တိုးမည်",
        lblChapTitle: "အခန်းခေါင်းစဉ်",
        lblContent: "အကြောင်းအရာနှင့် ဓာတ်ပုံများ",
        btnPhoto: "🖼️ ဓာတ်ပုံညှပ်ထည့်မည်",
        lblToc: "📋 စာအုပ်မာတိကာ အကြိုကြည့်ရှုရန်",
        btnGen: "📥 ePub ဖိုင် ထုတ်ယူမည်",
        alertNoPdf: "ကျေးဇူးပြု၍ PDF ဖိုင်အရင်ရွေးချယ်ပေးပါရန်။",
        alertSuccessPdf: "PDF မှ စာသားများကို အောင်မြင်စွာ ဆွဲထုတ်ပြီးပါပြီ။",
        alertFailPdf: "PDF ဖတ်ရာတွင် အမှားအယွင်းရှိနေပါသည်။",
        alertDeleteConf: "ဤအခန်းကို ဖျက်ပစ်ရန် သေချာပါသလား။",
        alertMinChap: "အနည်းဆုံး အခန်းတစ်ခန်းတော့ ရှိရပါမည်ဗျာ။"
    },
    en: {
        title: "📘 Web ePub Creator Pro",
        subtitle: "Extract text from PDF and compile multi-chapter ePub books easily",
        secMeta: "ℹ️ Book Information",
        lblTitle: "Book Title",
        lblAuthor: "Author Name",
        lblCover: "Book Cover Image",
        lblPdf: "📄 Extract Text from PDF (Optional)",
        btnExtract: "⚡ Extract Text From PDF",
        secChapters: "🔢 Chapters Directory",
        btnAdd: "+ Add New",
        lblChapTitle: "Chapter Title",
        lblContent: "Content & Inline Graphics",
        btnPhoto: "🖼️ Insert Image",
        lblToc: "📋 Live Table of Contents Preview",
        btnGen: "📥 Generate ePub Ebook",
        alertNoPdf: "Please select a PDF file first.",
        alertSuccessPdf: "Text extracted from PDF successfully!",
        alertFailPdf: "An error occurred while parsing the PDF document.",
        alertDeleteConf: "Are you sure you want to delete this chapter?",
        alertMinChap: "You must have at least one active chapter."
    }
};

// Application States
let chapters = [{ id: Date.now(), title: 'Chapter 1', content: '' }];
let activeChapterId = chapters[0].id;
let quill;
let currentLang = 'my';

// App Bootstrapping
document.addEventListener('DOMContentLoaded', () => {
    loadLocalSavedData();
    initTheme();
    initLanguageEngine();
    initEditor();
    renderTabs();
    renderTOC();
    setupEventListeners();
});

// Theme Management Logic
function initTheme() {
    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return;
    
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    toggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('#theme-toggle .mode-icon');
    if (icon) icon.innerText = theme === 'dark' ? '☀️' : '🌙';
}

// Language Switch Engine
function initLanguageEngine() {
    const selector = document.getElementById('lang-select');
    currentLang = localStorage.getItem('appLang') || 'my';
    selector.value = currentLang;
    applyLanguageTranslations();

    selector.addEventListener('change', (e) => {
        currentLang = e.target.value;
        localStorage.setItem('appLang', currentLang);
        applyLanguageTranslations();
        renderTabs();
    });
}

function applyLanguageTranslations() {
    const t = langPack[currentLang];
    document.getElementById('txt-app-title').innerText = t.title;
    document.getElementById('txt-app-subtitle').innerText = t.subtitle;
    document.getElementById('txt-sec-meta').innerText = t.secMeta;
    document.getElementById('txt-lbl-title').innerText = t.lblTitle;
    document.getElementById('txt-lbl-author').innerText = t.lblAuthor;
    document.getElementById('txt-lbl-cover').innerText = t.lblCover;
    document.getElementById('txt-lbl-pdf').innerText = t.lblPdf;
    document.getElementById('extract-btn').innerText = t.btnExtract;
    document.getElementById('txt-sec-chapters').innerText = t.secChapters;
    document.getElementById('add-chapter-btn').innerText = t.btnAdd;
    document.getElementById('txt-lbl-chaptitle').innerText = t.lblChapTitle;
    document.getElementById('txt-lbl-content').innerText = t.lblContent;
    document.getElementById('insert-image-btn').innerText = t.btnPhoto;
    document.getElementById('txt-lbl-toc').innerText = t.lblToc;
    document.getElementById('generate-btn').innerText = t.btnGen;
}

// Rich Text Core Engine
function initEditor() {
    quill = new Quill('#editor-container', {
        theme: 'snow',
        modules: { toolbar: false }
    });

    const currentChap = chapters.find(c => c.id === activeChapterId);
    if (currentChap) quill.root.innerHTML = currentChap.content;

    quill.on('text-change', () => {
        const target = chapters.find(c => c.id === activeChapterId);
        if (target) {
            target.content = quill.root.innerHTML;
            saveStateToLocalStorage();
        }
    });
}

// Local Storage Autosave Logics
function saveStateToLocalStorage() {
    localStorage.setItem('saved_chapters', JSON.stringify(chapters));
    localStorage.setItem('saved_active_id', activeChapterId);
    localStorage.setItem('saved_title', document.getElementById('book-title').value);
    localStorage.setItem('saved_author', document.getElementById('book-author').value);
}

function loadLocalSavedData() {
    if (localStorage.getItem('saved_chapters')) {
        chapters = JSON.parse(localStorage.getItem('saved_chapters'));
        activeChapterId = parseInt(localStorage.getItem('saved_active_id')) || chapters[0].id;
        document.getElementById('book-title').value = localStorage.getItem('saved_title') || '';
        document.getElementById('book-author').value = localStorage.getItem('saved_author') || '';
    }
}

// Render Components
function renderTabs() {
    const container = document.getElementById('chapters-list');
    if (!container) return;
    container.innerHTML = '';

    chapters.forEach((chap, idx) => {
        const tab = document.createElement('div');
        tab.className = `chapter-tab ${chap.id === activeChapterId ? 'active' : ''}`;
        tab.innerText = chap.title || `Chapter ${idx + 1}`;
        tab.addEventListener('click', () => switchChapter(chap.id));
        container.appendChild(tab);
    });
}

function renderTOC() {
    const tocList = document.getElementById('toc-preview-list');
    if (!tocList) return;
    tocList.innerHTML = '';

    chapters.forEach(chap => {
        const li = document.createElement('li');
        li.innerText = chap.title;
        li.addEventListener('click', () => switchChapter(chap.id));
        tocList.appendChild(li);
    });
}

function switchChapter(id) {
    const currentChap = chapters.find(c => c.id === activeChapterId);
    if (currentChap) {
        currentChap.title = document.getElementById('chapter-title').value || 'Untitled Chapter';
    }

    activeChapterId = id;
    const nextChap = chapters.find(c => c.id === activeChapterId);
    if (nextChap) {
        document.getElementById('chapter-title').value = nextChap.title;
        if (quill) quill.root.innerHTML = nextChap.content;
    }
    
    renderTabs();
    renderTOC();
    saveStateToLocalStorage();
}

// Listeners Registry
function setupEventListeners() {
    // Sync Metadata Fields
    ['book-title', 'book-author'].forEach(id => {
        document.getElementById(id).addEventListener('input', saveStateToLocalStorage);
    });

    // Add Chapter Action
    document.getElementById('add-chapter-btn').addEventListener('click', () => {
        const newId = Date.now();
        chapters.push({ id: newId, title: `Chapter ${chapters.length + 1}`, content: '' });
        switchChapter(newId);
    });

    // Sync Active Chapter Title Input Box
    document.getElementById('chapter-title').addEventListener('input', (e) => {
        const currentChap = chapters.find(c => c.id === activeChapterId);
        if (currentChap) {
            currentChap.title = e.target.value || 'Untitled Chapter';
            renderTabs();
            renderTOC();
            saveStateToLocalStorage();
        }
    });

    // Delete Chapter Logic
    document.getElementById('delete-chapter-btn').addEventListener('click', () => {
        const t = langPack[currentLang];
        if (chapters.length <= 1) {
            alert(t.alertMinChap);
            return;
        }
        if (confirm(t.alertDeleteConf)) {
            const index = chapters.findIndex(c => c.id === activeChapterId);
            chapters.splice(index, 1);
            activeChapterId = chapters[index === 0 ? 0 : index - 1].id;
            switchChapter(activeChapterId);
        }
    });

    // Move Ordered Sequence (Left / Right)
    document.getElementById('move-left-btn').addEventListener('click', () => {
        const idx = chapters.findIndex(c => c.id === activeChapterId);
        if (idx > 0) {
            [chapters[idx], chapters[idx - 1]] = [chapters[idx - 1], chapters[idx]];
            renderTabs(); renderTOC(); saveStateToLocalStorage();
        }
    });

    document.getElementById('move-right-btn').addEventListener('click', () => {
        const idx = chapters.findIndex(c => c.id === activeChapterId);
        if (idx < chapters.length - 1) {
            [chapters[idx], chapters[idx + 1]] = [chapters[idx + 1], chapters[idx]];
            renderTabs(); renderTOC(); saveStateToLocalStorage();
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

    imgLoader.addEventListener('change', (e) => {
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
        imgLoader.value = '';
    });

    // PDF Extraction Engine
    document.getElementById('extract-btn').addEventListener('click', async () => {
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
                if (quill) {
                    quill.root.innerHTML = fullText;
                    const cur = chapters.find(c => c.id === activeChapterId);
                    if (cur) cur.content = fullText;
                }
                alert(t.alertSuccessPdf);
                saveStateToLocalStorage();
            } catch (err) {
                alert(t.alertFailPdf);
            }
        };
        reader.readAsArrayBuffer(file);
    });

    // ePub Packaging Algorithm
    document.getElementById('generate-btn').addEventListener('click', async () => {
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
    });
}
