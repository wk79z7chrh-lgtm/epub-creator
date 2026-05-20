// 1. Initialize Quill Editor
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

// Chapters State
let chapters = [{ title: 'Chapter 1', content: '' }];
let currentChapterIndex = 0;

// Theme Toggle Logic
const modeToggle = document.getElementById('modeToggle');
if (modeToggle) {
    const currentTheme = localStorage.getItem('theme') || 'light';
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
    modeToggle.addEventListener('click', () => {
        let theme = document.documentElement.getAttribute('data-theme');
        if (theme === 'dark') {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        }
    });
}

// Render Left Side Chapter List
function renderChapterList() {
    const listContainer = document.getElementById('chapterList');
    if (!listContainer) return;
    listContainer.innerHTML = '';

    chapters.forEach((ch, index) => {
        const item = document.createElement('div');
        item.className = `chapter-item ${index === currentChapterIndex ? 'active' : ''}`;
        
        const titleSpan = document.createElement('span');
        titleSpan.textContent = ch.title || `Untitled Chapter ${index + 1}`;
        titleSpan.style.flexGrow = '1';
        titleSpan.onclick = () => switchChapter(index);

        item.appendChild(titleSpan);

        if (chapters.length > 1) {
            const delBtn = document.createElement('button');
            delBtn.className = 'delete-ch-btn';
            delBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
            delBtn.onclick = (e) => {
                e.stopPropagation();
                deleteChapter(index);
            };
            item.appendChild(delBtn);
        }

        listContainer.appendChild(item);
    });
}

function saveCurrentChapterState() {
    const titleInput = document.getElementById('chapterTitle');
    if (titleInput && chapters[currentChapterIndex]) {
        chapters[currentChapterIndex].title = titleInput.value.trim() || `Chapter ${currentChapterIndex + 1}`;
        chapters[currentChapterIndex].content = quill.getSemanticHTML();
    }
}

const addChapterBtn = document.getElementById('addChapterBtn');
if (addChapterBtn) {
    addChapterBtn.addEventListener('click', function() {
        saveCurrentChapterState();
        chapters.push({ title: `Chapter ${chapters.length + 1}`, content: '' });
        currentChapterIndex = chapters.length - 1;
        
        document.getElementById('chapterTitle').value = chapters[currentChapterIndex].title;
        quill.setContents([]);
        renderChapterList();
    });
}

function switchChapter(index) {
    saveCurrentChapterState();
    currentChapterIndex = index;
    
    document.getElementById('chapterTitle').value = chapters[currentChapterIndex].title;
    quill.clipboard.dangerouslyPasteHTML(chapters[currentChapterIndex].content);
    renderChapterList();
}

function deleteChapter(index) {
    if (confirm("ဤအခန်းကို ဖျက်ရန် သေჩာပါသလား?")) {
        chapters.splice(index, 1);
        if (currentChapterIndex >= chapters.length) {
            currentChapterIndex = chapters.length - 1;
        }
        document.getElementById('chapterTitle').value = chapters[currentChapterIndex].title;
        quill.clipboard.dangerouslyPasteHTML(chapters[currentChapterIndex].content);
        renderChapterList();
    }
}

const chapterTitleInput = document.getElementById('chapterTitle');
if (chapterTitleInput) {
    chapterTitleInput.addEventListener('input', function() {
        chapters[currentChapterIndex].title = this.value;
        const items = document.querySelectorAll('.chapter-item span');
        if (items[currentChapterIndex]) {
            items[currentChapterIndex].textContent = this.value || `Chapter ${currentChapterIndex + 1}`;
        }
    });
}

// မျက်နှာဖုံးပုံပေါ်တွင် စာသားများသွားမဆွဲဘဲ မူရင်းပုံစစ်စစ်ကို တိုက်ရိုက် ePub ထဲထည့်ပေးမည့် လုပ်ဆောင်ချက်
function processOriginalImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(event) {
            resolve(event.target.result);
        };
        reader.onerror = function(err) {
            reject(err);
        };
        reader.readAsArrayBuffer(file);
    });
}

// Generate ePub Logic
const downloadEpubBtn = document.getElementById('downloadEpub');
if (downloadEpubBtn) {
    downloadEpubBtn.addEventListener('click', async function() {
        saveCurrentChapterState();

        const title = document.getElementById('bookTitle').value.trim() || 'Untitled Book';
        const author = document.getElementById('bookAuthor').value.trim() || 'Unknown Author';
        const coverFile = document.getElementById('coverImage').files[0];

        const zip = new JSZip();
        zip.file("mimetype", "application/epub+zip", { compression: "STORE" });

        const containerXml = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
    <rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles>
</container>`;
        zip.folder("META-INF").file("container.xml", containerXml);

        let manifestItems = '';
        let spineItems = '';
        let tocNavPoints = '';

        chapters.forEach((ch, index) => {
            const id = `chapter${index + 1}`;
            manifestItems += `<item id="${id}" href="${id}.html" media-type="application/xhtml+xml"/>\n`;
            spineItems += `<itemref idref="${id}"/>\n`;
            tocNavPoints += `<navPoint id="navpoint-${index + 1}" playOrder="${index + 1}">
                <navLabel><text>${ch.title}</text></navLabel>
                <content src="${id}.html"/>
            </navPoint>\n`;
        });

        let manifestCoverItem = ''; let metadataCoverMeta = '';
        if (coverFile) {
            manifestCoverItem = `<item id="cover-image" href="cover.jpg" media-type="image/jpeg"/>`;
            metadataCoverMeta = `<meta name="cover" content="cover-image"/>`;
        }

        const contentOpf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="bookid" version="2.0">
    <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
        <dc:title>${title}</dc:title>
        <dc:creator>${author}</dc:creator>
        <dc:language>my</dc:language>
        ${metadataCoverMeta}
    </metadata>
    <manifest>
        <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
        ${manifestItems}
        ${manifestCoverItem}
    </manifest>
    <spine toc="ncx">
        ${spineItems}
    </spine>
</package>`;

        const tocNcx = `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
    <head><meta name="dtb:uid" content="123456789X"/></head>
    <docTitle><text>${title}</text></docTitle>
    <navMap>
        ${tocNavPoints}
    </navMap>
</ncx>`;

        const oebps = zip.folder("OEBPS");
        oebps.file("content.opf", contentOpf);
        oebps.file("toc.ncx", tocNcx);

        chapters.forEach((ch, index) => {
            const chapterHtml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <title>${ch.title}</title>
    <style>body { font-family: sans-serif; padding: 10px; line-height: 1.6; } h1 { color: #333333; text-align: center; } p { margin-bottom: 1em; text-align: justify; }</style>
</head>
<body>
    <h1>${ch.title}</h1>
    <div>${ch.content}</div>
</body>
</html>`;
            oebps.file(`chapter${index + 1}.html`, chapterHtml);
        });

        if (coverFile) {
            try {
                // မူရင်းပုံစစ်စစ်ကိုသာ ePub ထဲသို့ တိုက်ရိုက်ထည့်သွင်းခြင်း (စာလုံးအဖြူများ လုံးဝမဆွဲတော့ပါ)
                const originalImageData = await processOriginalImage(coverFile);
                oebps.file(`cover.jpg`, originalImageData);
            } catch (e) {
                alert("ဓာတ်ပုံစီမံရာတွင် အမှားရှိပါသည် - " + e.message);
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

// Initial Run
renderChapterList();
const firstChTitle = document.getElementById('chapterTitle');
if (firstChTitle) {
    firstChTitle.value = chapters[0].title;
}
