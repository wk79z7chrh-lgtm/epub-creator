// Setup PDF.js
if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
}

// Global App State
let chapters = [{ id: 1, title: 'Chapter 1', content: '' }];
let activeChapterId = 1;
let quill;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initEditor();
    renderTabs();
    setupEventListeners();
});

// Theme Logic (Dark/Light)
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
    const icon = document.querySelector('#theme-toggle i');
    if (!icon) return;
    if (theme === 'dark') {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
}

// Editor Logic
function initEditor() {
    const container = document.getElementById('editor-container');
    if (!container) return;

    quill = new Quill('#editor-container', {
        theme: 'snow',
        modules: {
            toolbar: false // Hide default toolbar to use our custom native buttons smoothly
        }
    });

    // Save content to array dynamically
    quill.on('text-change', () => {
        const currentChap = chapters.find(c => c.id === activeChapterId);
        if (currentChap) {
            currentChap.content = quill.root.innerHTML;
        }
    });
}

// Render Tabs Layout
function renderTabs() {
    const container = document.getElementById('chapters-list');
    if (!container) return;
    container.innerHTML = '';

    chapters.forEach(chap => {
        const tab = document.createElement('div');
        tab.className = `chapter-tab ${chap.id === activeChapterId ? 'active' : ''}`;
        tab.innerText = chap.title;
        tab.addEventListener('click', () => switchChapter(chap.id));
        container.appendChild(tab);
    });
}

function switchChapter(id) {
    const currentChap = chapters.find(c => c.id === activeChapterId);
    if (currentChap) {
        currentChap.title = document.getElementById('chapter-title').value || `Chapter ${currentChap.id}`;
    }

    activeChapterId = id;
    const nextChap = chapters.find(c => c.id === activeChapterId);
    
    const titleInput = document.getElementById('chapter-title');
    if (titleInput) titleInput.value = nextChap.title;
    if (quill) quill.root.innerHTML = nextChap.content;
    
    renderTabs();
}

// Events Setup
function setupEventListeners() {
    // Add Chapter
    const addBtn = document.getElementById('add-chapter-btn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            const newId = chapters.length > 0 ? Math.max(...chapters.map(c => c.id)) + 1 : 1;
            chapters.push({
                id: newId,
                title: `Chapter ${newId}`,
                content: ''
            });
            switchChapter(newId);
        });
    }

    // Dynamic Title Input Sync
    const titleInput = document.getElementById('chapter-title');
    if (titleInput) {
        titleInput.addEventListener('input', (e) => {
            const currentChap = chapters.find(c => c.id === activeChapterId);
            if (currentChap) {
                currentChap.title = e.target.value || `Chapter ${currentChap.id}`;
                const activeTab = document.querySelector('.chapter-tab.active');
                if (activeTab) activeTab.innerText = currentChap.title;
            }
        });
    }

    // Image Inserter Tool Logic
    const imgLoader = document.getElementById('image-loader');
    const insertImgBtn = document.getElementById('insert-image-btn');
    
    if (insertImgBtn && imgLoader) {
        insertImgBtn.addEventListener('click', (e) => {
            e.preventDefault();
            imgLoader.click();
        });

        imgLoader.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && quill) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const range = quill.getSelection(true) || { index: quill.getLength() };
                    quill.insertEmbed(range.index, 'image', event.target.result);
                    quill.setSelection(range.index + 1);
                };
                reader.readAsDataURL(file);
            }
            imgLoader.value = ''; 
        });
    }

    // PDF Extraction Logic
    const extractBtn = document.getElementById('extract-btn');
    if (extractBtn) {
        extractBtn.addEventListener('click', async () => {
            const fileInput = document.getElementById('pdf-file');
            if (!fileInput || !fileInput.files.length) {
                alert('ကျေးဇူးပြု၍ PDF ဖိုင်အရင်ရွေးချယ်ပေးပါရန်။');
                return;
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
                        const currentChap = chapters.find(c => c.id === activeChapterId);
                        if (currentChap) currentChap.content = fullText;
                    }
                    alert('PDF မှ စာသားများကို အောင်မြင်စွာ ဆွဲထုတ်ပြီးပါပြီ။');
                } catch (err) {
                    alert('PDF ဖတ်ရာတွင် အမှားအယွင်းရှိနေပါသည်။');
                }
            };
            reader.readAsArrayBuffer(file);
        });
    }

    // ePub File Generation
    const genBtn = document.getElementById('generate-btn');
    if (genBtn) {
        genBtn.addEventListener('click', async () => {
            const currentChap = chapters.find(c => c.id === activeChapterId);
            const titleInput = document.getElementById('chapter-title');
            if (currentChap && titleInput) {
                currentChap.title = titleInput.value || `Chapter ${currentChap.id}`;
            }

            const bookTitle = document.getElementById('book-title').value || 'Untitled Book';
            const bookAuthor = document.getElementById('book-author').value || 'Unknown Author';
            const coverInput = document.getElementById('book-cover');

            const zip = new JSZip();
            zip.file('mimetype', 'application/epub+zip', { compression: "STORE" });
            
            const containerXml = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
    <rootfiles>
        <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
    </rootfiles>
</container>`;
            zip.folder('META-INF').file('container.xml', containerXml);

            const oebps = zip.folder('OEBPS');
            let hasCover = false;
            if (coverInput && coverInput.files.length > 0) {
                const coverFile = coverInput.files[0];
                const coverData = await fileToBuffer(coverFile);
                oebps.file('cover.jpg', coverData);
                hasCover = true;
            }

            let manifestItems = '';
            let spineItems = '';
            
            if (hasCover) {
                manifestItems += `    <item id="cover-img" href="cover.jpg" media-type="image/jpeg"/>\n`;
            }

            chapters.forEach((chap) => {
                const filename = `chapter_${chap.id}.xhtml`;
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
                manifestItems += `    <item id="chap_${chap.id}" href="${filename}" media-type="application/xhtml+xml"/>\n`;
                spineItems += `    <itemref idref="chap_${chap.id}"/>\n`;
            });

            const opfContent = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="bookid" version="2.0">
    <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
        <dc:title>${bookTitle}</dc:title>
        <dc:creator opf:role="aut">${bookAuthor}</dc:creator>
        <dc:language>my</dc:language>
        <dc:identifier id="bookid">urn:uuid:${generateUUID()}</dc:identifier>
    </metadata>
    <manifest>
        <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
${manifestItems}
    </manifest>
    <spine toc="ncx">
${spineItems}
    </spine>
</package>`;
            oebps.file('content.opf', opfContent);

            let ncxNav = '';
            chapters.forEach((chap, idx) => {
                ncxNav += `        <navPoint id="nav_${chap.id}" playOrder="${idx + 1}">
            <navLabel><text>${chap.title}</text></navLabel>
            <content src="chapter_${chap.id}.xhtml"/>
        </navPoint>\n`;
            });

            const ncxContent = `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
    <head>
        <meta name="dtb:uid" content="urn:uuid:12345"/>
        <meta name="dtb:depth" content="1"/>
    </head>
    <docTitle><text>${bookTitle}</text></docTitle>
    <navMap>
${ncxNav}
    </navMap>
</ncx>`;
            oebps.file('toc.ncx', ncxContent);

            const content = await zip.generateAsync({ type: 'blob' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = `${bookTitle}.epub`;
            link.click();
        });
    }
}

function fileToBuffer(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsArrayBuffer(file);
    });
}

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
