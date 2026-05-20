// 1. Quill Editor စတင်ခြင်း
const quill = new Quill('#editor-container', {
    theme: 'snow',
    placeholder: 'ဤနေရာတွင် အခန်းတွင်းစာသားများ ရေးသားပါ...',
    modules: {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'blockquote'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['clean']
        ]
    }
});

// အခန်းများကို သိမ်းဆည်းမည့် Array နှင့် လက်ရှိပြင်ဆင်နေသော အခန်း Index
let chapters = [{ title: 'Chapter 1', content: '' }];
let currentChapterIndex = 0;

// Night Mode (Dark Theme) Logic
const themeToggleBtn = document.getElementById('themeToggleBtn');
const currentTheme = localStorage.getItem('theme') || 'light';

// စဖွင့်ချင်း သိမ်းထားခဲ့တဲ့ Theme အတိုင်း သတ်မှတ်ခြင်း
if (currentTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
}

themeToggleBtn.addEventListener('click', () => {
    let theme = document.documentElement.getAttribute('data-theme');
    if (theme === 'dark') {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
    }
});

// UI တွင် အခန်းစာရင်းကို ပြန်လည်ရေးဆွဲပေးသည့် Function
function renderChapterList() {
    const listContainer = document.getElementById('chapterList');
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

// လက်ရှိရေးလက်စ စာများကို သိမ်းဆည်းခြင်း
function saveCurrentChapterState() {
    if (chapters[currentChapterIndex]) {
        chapters[currentChapterIndex].title = document.getElementById('chapterTitle').value.trim() || `Chapter ${currentChapterIndex + 1}`;
        chapters[currentChapterIndex].content = quill.getSemanticHTML();
    }
}

// အခန်းအသစ်တိုးခြင်း ခလုတ်လုပ်ဆောင်ချက်
document.getElementById('addChapterBtn').addEventListener('click', function() {
    saveCurrentChapterState();
    chapters.push({ title: `Chapter ${chapters.length + 1}`, content: '' });
    currentChapterIndex = chapters.length - 1;
    
    document.getElementById('chapterTitle').value = chapters[currentChapterIndex].title;
    quill.setContents([]);
    renderChapterList();
});

// အခန်းများ အကူးအပြောင်းလုပ်ခြင်း
function switchChapter(index) {
    saveCurrentChapterState();
    currentChapterIndex = index;
    
    document.getElementById('chapterTitle').value = chapters[currentChapterIndex].title;
    quill.clipboard.dangerouslyPasteHTML(chapters[currentChapterIndex].content);
    renderChapterList();
}

// အခန်းဖျက်ခြင်း
function deleteChapter(index) {
    if (confirm("ဤအခန်းကို ဖျက်ရန် သေချာပါသလား?")) {
        chapters.splice(index, 1);
        if (currentChapterIndex >= chapters.length) {
            currentChapterIndex = chapters.length - 1;
        }
        document.getElementById('chapterTitle').value = chapters[currentChapterIndex].title;
        quill.clipboard.dangerouslyPasteHTML(chapters[currentChapterIndex].content);
        renderChapterList();
    }
}

// အခန်းခေါင်းစဉ်ရိုက်နေစဉ် ဘယ်ဘက်စာရင်းမှာ ချက်ချင်း လိုက်ပြောင်းပေးရန်
document.getElementById('chapterTitle').addEventListener('input', function() {
    chapters[currentChapterIndex].title = this.value;
    const items = document.querySelectorAll('.chapter-item span');
    if (items[currentChapterIndex]) {
        items[currentChapterIndex].textContent = this.value || `Chapter ${currentChapterIndex + 1}`;
    }
});

// မျက်နှာဖုံးပုံပေါ်တွင် စာသားဆွဲပေးမည့် စနစ်
function drawTextOnImage(file, title, author) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                try {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    
                    const fontSizeTitle = Math.max(24, Math.floor(canvas.width * 0.065)); 
                    const fontSizeAuthor = Math.max(16, Math.floor(canvas.width * 0.045));
                    ctx.shadowColor = "rgba(0, 0, 0, 0.85)";
                    ctx.shadowBlur = 12;
                    ctx.shadowOffsetX = 4; ctx.shadowOffsetY = 4;
                    ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = "#ffffff"; 
                    
                    const systemFonts = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
                    
                    ctx.font = `bold ${fontSizeTitle}px ${systemFonts}`;
                    const words = title.split(''); let line = ''; let lines = [];
                    for (let n = 0; n < words.length; n++) {
                        let testLine = line + words[n];
                        if (ctx.measureText(testLine).width > canvas.width * 0.85 && n > 0) {
                            lines.push(line); line = words[n];
                        } else { line = testLine; }
                    }
                    lines.push(line);
                    let currentY = (canvas.height * 0.45) - ((lines.length - 1) * fontSizeTitle * 1.4) / 2;
                    for (let i = 0; i < lines.length; i++) {
                        ctx.fillText(lines[i], canvas.width / 2, currentY);
                        currentY += fontSizeTitle * 1.4;
                    }
                    
                    ctx.font = `bold ${fontSizeAuthor}px ${systemFonts}`;
                    ctx.fillText(author, canvas.width / 2, canvas.height * 0.85);
                    
                    canvas.toBlob((blob) => {
                        const fileReader = new FileReader();
                        fileReader.onload = (e) => resolve(e.target.result);
                        fileReader.readAsArrayBuffer(blob);
                    }, 'image/jpeg', 0.95);
                } catch (e) { reject(e); }
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// ePub ထုတ်လုပ်မည့် အဓိက Logic
document.getElementById('generateBtn').addEventListener('click', async function() {
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
            const processedImageData = await drawTextOnImage(coverFile, title, author);
            oebps.file(`cover.jpg`, processedImageData);
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

renderChapterList();
document.getElementById('chapterTitle').value = chapters[0].title;
