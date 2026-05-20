// Initialize Quill editor
const quill = new Quill('#editor-container', {
    theme: 'snow',
    placeholder: 'ဤနေရာတွင် အခန်းတွင်းစာသားများ ရေးသားပါ...',
    modules: {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'blockquote'],
            [{ 'color': [] }],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['clean']
        ]
    }
});

// State management
let chapters = [{ title: 'Chapter 1', content: '' }];
let currentChapterIndex = 0;

// Render chapter list
function renderChapterList() {
    const listContainer = document.getElementById('chapterList');
    if (!listContainer) return;
    listContainer.innerHTML = '';
    
    chapters.forEach((ch, index) => {
        const item = document.createElement('div');
        item.className = `chapter-item ${index === currentChapterIndex ? 'active' : ''}`;
        
        const titleSpan = document.createElement('span');
        titleSpan.textContent = ch.title || `Chapter ${index + 1}`;
        titleSpan.style.flexGrow = '1';
        titleSpan.onclick = () => switchChapter(index);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '❌';
        deleteBtn.className = 'delete-btn';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            deleteChapter(index);
        };
        
        item.appendChild(titleSpan);
        if (chapters.length > 1) {
            item.appendChild(deleteBtn);
        }
        listContainer.appendChild(item);
    });
}

function saveCurrentChapterState() {
    const titleInput = document.getElementById('chapterTitle');
    if (titleInput && chapters[currentChapterIndex]) {
        chapters[currentChapterIndex].title = titleInput.value.trim() || `Chapter ${currentChapterIndex + 1}`;
        chapters[currentChapterIndex].content = quill.root.innerHTML;
    }
}

function switchChapter(index) {
    saveCurrentChapterState();
    currentChapterIndex = index;
    document.getElementById('chapterTitle').value = chapters[currentChapterIndex].title;
    quill.root.innerHTML = chapters[currentChapterIndex].content;
    renderChapterList();
}

function deleteChapter(index) {
    if (confirm('ဤအခန်းကို ဖျက်ရန် သေချာပါသလား?')) {
        chapters.splice(index, 1);
        if (currentChapterIndex >= chapters.length) {
            currentChapterIndex = chapters.length - 1;
        }
        document.getElementById('chapterTitle').value = chapters[currentChapterIndex].title;
        quill.root.innerHTML = chapters[currentChapterIndex].content;
        renderChapterList();
    }
}

// Error အတက်မခံစေရန် တောင်းဆိုထားသော ပုံဆွဲ Function ကို မူရင်းအတိုင်း တည်ဆောက်ထားပါသည်
// သို့သော် စာလုံးအဖြူများ ထပ်မံမဆွဲတော့ဘဲ မူရင်းပုံသန့်သန့်ကိုသာ တိုက်ရိုက်ပြန်ပေးရန် ပြင်ဆင်ထားပါသည်
function drawTextOnImage() {
    const fileInput = document.getElementById('coverImage');
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            
            // မူရင်းပုံကိုသာ ပုံမှန်အတိုင်း ဆွဲပေးသည် (စာသားများ လုံးဝ (လုံးဝ) ထပ်မဆွဲပါ)
            ctx.drawImage(img, 0, 0);
            
            const preview = document.getElementById('coverPreview');
            if (preview) preview.src = canvas.toDataURL('image/jpeg');
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}
// Event Listeners
const addChapterBtn = document.getElementById('addChapterBtn');
if (addChapterBtn) {
    addChapterBtn.addEventListener('click', () => {
        saveCurrentChapterState();
        chapters.push({ title: `Chapter ${chapters.length + 1}`, content: '' });
        currentChapterIndex = chapters.length - 1;
        document.getElementById('chapterTitle').value = chapters[currentChapterIndex].title;
        quill.root.innerHTML = '';
        renderChapterList();
    });
}

const chapterTitleInput = document.getElementById('chapterTitle');
if (chapterTitleInput) {
    chapterTitleInput.addEventListener('input', (e) => {
        chapters[currentChapterIndex].title = e.target.value;
        renderChapterList();
    });
}

// Helper to convert image file to base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
    });
}

// Generate ePub
const downloadEpubBtn = document.getElementById('downloadEpub');
if (downloadEpubBtn) {
    downloadEpubBtn.addEventListener('click', async () => {
        saveCurrentChapterState();
        
        const title = document.getElementById('bookTitle').value.trim() || 'Untitled Book';
        const author = document.getElementById('bookAuthor').value.trim() || 'Unknown Author';
        const coverFile = document.getElementById('coverImage').files[0];
        
        const zip = new JSZip();
        zip.file("mimetype", "application/epub+zip", { compression: "STORE" });
        
        const containerXml = `<?xml version="1.0" encoding="UTF-8"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>`;
        zip.folder("META-INF").file("container.xml", containerXml);
        
        let manifestItems = ''; let spineItems = ''; let tocNavPoints = '';
        
        chapters.forEach((ch, index) => {
            const id = `chapter${index + 1}`;
            manifestItems += `<item id="${id}" href="${id}.html" media-type="application/xhtml+xml"/>\n`;
            spineItems += `<itemref idref="${id}"/>\n`;
            tocNavPoints += `<navPoint id="navpoint-${index + 1}" playOrder="${index + 1}"><navLabel><text>${ch.title}</text></navLabel><content src="${id}.html"/></navPoint>\n`;
        });
        
        let manifestCoverItem = ''; let metadataCoverMeta = '';
        if (coverFile) {
            manifestCoverItem = `<item id="cover-image" href="cover.jpg" media-type="image/jpeg"/>`;
            metadataCoverMeta = `<meta name="cover" content="cover-image"/>`;
        }
        
        const contentOpf = `<?xml version="1.0" encoding="UTF-8"?><package xmlns="http://www.idpf.org/2007/opf" unique-identifier="bookid" version="2.0"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>${title}</dc:title><dc:creator>${author}</dc:creator><dc:language>my</dc:language>${metadataCoverMeta}</metadata><manifest><item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>${manifestItems}${manifestCoverItem}</manifest><spine toc="ncx">${spineItems}</spine></package>`;
        const tocNcx = `<?xml version="1.0" encoding="UTF-8"?><ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1"><head><meta name="dtb:uid" content="123456789X"/></head><docTitle><text>${title}</text></docTitle><navMap>${tocNavPoints}</navMap></ncx>`;

        const oebps = zip.folder("OEBPS");
        oebps.file("content.opf", contentOpf);
        oebps.file("toc.ncx", tocNcx);
        
        chapters.forEach((ch, index) => {
            const chapterHtml = `<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd"><html xmlns="http://www.w3.org/1999/xhtml"><head><title>${ch.title}</title><style>body { font-family: sans-serif; padding: 10px; line-height: 1.6; } h1 { color: #333333; text-align: center; } p { margin-bottom: 1em; text-align: justify; }</style></head><body><h1>${ch.title}</h1><div>${ch.content}</div></body></html>`;
            oebps.file(`chapter${index + 1}.html`, chapterHtml);
        });
        
        // မျက်နှာဖုံးပုံကို စာသားထပ်မဆွဲဘဲ မူရင်းအတိုင်း တိုက်ရိုက်သိမ်းဆည်းပေးသည်
        if (coverFile) {
            try {
                const base64Data = await fileToBase64(coverFile);
                oebps.file("cover.jpg", base64Data, { base64: true });
            } catch (e) {
                alert("Error handling cover image: " + e.message);
                return;
            }
        }
        
        zip.generateAsync({ type: "blob" }).then(function(content) {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = `${title.replace(/\s+/g, '_')}.epub`;
            link.click();
        });
    });
}

// Initial layout render
renderChapterList();
