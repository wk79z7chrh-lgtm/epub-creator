// Configure PDF.js Worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

// Initialize Quill Editor with Simple Toolbar
const quill = new Quill('#editor-container', {
    theme: 'snow',
    placeholder: 'Write chapter content here...',
    modules: {
        toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline'],
            ['image', 'code-block'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['clean']
        ]
    }
});

// App State
let chapters = [{ title: 'Chapter 1', content: '' }];
let currentChapterIndex = 0;

// Night Mode Toggle
document.addEventListener('DOMContentLoaded', () => {
    const modeToggle = document.getElementById('modeToggle');
    if (modeToggle) {
        modeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            if (document.body.classList.contains('dark-mode')) {
                modeToggle.textContent = '☀️ Light Mode';
            } else {
                modeToggle.textContent = '🌙 Night Mode';
            }
        });
    }
});

// Clean and Validate HTML Content for XHTML/EPUB compatibility
function cleanHtmlForEpub(htmlContent) {
    if (!htmlContent) return '';
    let cleaned = htmlContent.replace(/<br\s*>/gi, '<br />');
    cleaned = cleaned.replace(/<img([^>]*)\s*>/gi, (match, p1) => {
        if (!p1.endsWith('/')) {
            return `<img${p1.trim()} />`;
        }
        return match;
    });
    return cleaned;
}

// Render Sidebar Chapter List
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
        deleteBtn.innerHTML = '❌';
        deleteBtn.className = 'btn-danger';
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
    if (confirm('Are you sure you want to delete this chapter?')) {
        chapters.splice(index, 1);
        if (currentChapterIndex >= chapters.length) {
            currentChapterIndex = chapters.length - 1;
        }
        document.getElementById('chapterTitle').value = chapters[currentChapterIndex].title;
        quill.root.innerHTML = chapters[currentChapterIndex].content;
        renderChapterList();
    }
}

// Chapter Event Listeners
document.getElementById('addChapterBtn').addEventListener('click', () => {
    saveCurrentChapterState();
    chapters.push({ title: `Chapter ${chapters.length + 1}`, content: '' });
    currentChapterIndex = chapters.length - 1;
    document.getElementById('chapterTitle').value = chapters[currentChapterIndex].title;
    quill.root.innerHTML = '';
    renderChapterList();
});

document.getElementById('chapterTitle').addEventListener('input', (e) => {
    if (chapters[currentChapterIndex]) {
        chapters[currentChapterIndex].title = e.target.value;
        renderChapterList();
    }
});

// PDF Text Extraction Logic
document.getElementById('extractPdfBtn').addEventListener('click', async () => {
    const pdfFile = document.getElementById('pdfFile').files[0];
    const status = document.getElementById('pdfStatus');
    if (!pdfFile) {
        alert('Please select a PDF file first.');
        return;
    }

    status.textContent = 'Extracting text from PDF... Please wait.';
    
    try {
        const fileReader = new FileReader();
        fileReader.onload = async function () {
            const typedarray = new Uint8Array(this.result);
            const pdf = await pdfjsLib.getDocument(typedarray).promise;
            let fullText = '';
            
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(' ');
                fullText += `<h3>Page ${i}</h3><p>${pageText}</p><br />`;
            }
            
            saveCurrentChapterState();
            chapters.push({ title: `PDF Extracted Content`, content: fullText });
            currentChapterIndex = chapters.length - 1;
            document.getElementById('chapterTitle').value = chapters[currentChapterIndex].title;
            quill.root.innerHTML = chapters[currentChapterIndex].content;
            renderChapterList();
            
            status.textContent = 'Text extracted successfully! Check below.';
        };
        fileReader.readAsArrayBuffer(pdfFile);
    } catch (error) {
        status.textContent = 'Error loading or parsing PDF.';
        console.error(error);
    }
});

// Helper for Cover Image base64 conversion (No Text Overlay)
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
    });
}

// Generate and Download ePub
document.getElementById('downloadEpub').addEventListener('click', async () => {
    saveCurrentChapterState();
    
    const title = document.getElementById('bookTitle').value.trim() || 'Untitled Book';
    const author = document.getElementById('bookAuthor').value.trim() || 'Unknown Author';
    const coverFile = document.getElementById('coverImage').files[0];
    
    const zip = new JSZip();
    zip.file("mimetype", "application/epub+zip", { compression: "STORE" });
    
    const containerXml = `<?xml version="1.0" encoding="UTF-8"?><container version="1.0" xmlns="urn:oasis:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>`;
    zip.folder("META-INF").file("container.xml", containerXml);
    
    let manifestItems = '';
    let spineItems = '';
    let tocNavPoints = '';
    
    chapters.forEach((ch, index) => {
        const id = `chapter${index + 1}`;
        manifestItems += `<item id="${id}" href="${id}.html" media-type="application/xhtml+xml"/>\n`;
        spineItems += `<itemref idref="${id}"/>\n`;
        tocNavPoints += `<navPoint id="navpoint-${index + 1}" playOrder="${index + 1}"><navLabel><text>${ch.title}</text></navLabel><content src="${id}.html"/></navPoint>\n`;
    });
    
    let manifestCoverItem = '';
    let metadataCoverMeta = '';
    if (coverFile) {
        manifestCoverItem = `<item id="cover-image" href="cover.jpg" media-type="image/jpeg"/>`;
        metadataCoverMeta = `<meta name="cover" content="cover-image"/>`;
    }
    
    const contentOpf = `<?xml version="1.0" encoding="UTF-8"?><package xmlns="http://www.idpf.org/2007/opf" unique-identifier="bookid" version="2.0"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>${title}</dc:title><dc:creator>${author}</dc:creator><dc:language>en</dc:language>${metadataCoverMeta}</metadata><manifest><item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>${manifestItems}${manifestCoverItem}</manifest><spine toc="ncx">${spineItems}</spine></package>`;
    const tocNcx = `<?xml version="1.0" encoding="UTF-8"?><ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1"><head><meta name="dtb:uid" content="123456789X"/></head><docTitle><text>${title}</text></docTitle><navMap>${tocNavPoints}</navMap></ncx>`;

    const oebps = zip.folder("OEBPS");
    oebps.file("content.opf", contentOpf);
    oebps.file("toc.ncx", tocNcx);
    
    chapters.forEach((ch, index) => {
        const cleanedContent = cleanHtmlForEpub(ch.content);
        const chapterHtml = `<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd"><html xmlns="http://www.w3.org/1999/xhtml"><head><title>${ch.title}</title><style>body { font-family: sans-serif; padding: 10px; } h1 { text-align: center; }</style></head><body><h1>${ch.title}</h1><div>${cleanedContent}</div></body></html>`;
        oebps.file(`chapter${index + 1}.html`, chapterHtml);
    });
    
    if (coverFile) {
        try {
            // Directly use the uploaded file without drawing any text over it
            const base64Data = await fileToBase64(coverFile);
            oebps.file("cover.jpg", base64Data, { base64: true });
        } catch (e) {
            alert("Error processing cover image: " + e.message);
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

// Run Initial Setup
renderChapterList();
