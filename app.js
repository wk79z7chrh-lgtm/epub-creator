// Pro Version Dynamic Language Texts
const langTexts = {
    my: {
        placeholder: "ဤနေရာတွင် အခန်းတွင်းစာသားများ ရေးသားပါ...",
        confirmDel: "ဤအခန်းကို ဖျက်ရန် သေချာပါသလား?",
        alertPdf: "ကျေးဇူးပြု၍ PDF ဖိုင်တစ်ခု ရွေးချယ်ပေးပါ"
    },
    en: {
        placeholder: "Write your chapter content here...",
        confirmDel: "Are you sure you want to delete this chapter?",
        alertPdf: "Please select a PDF file first"
    }
};

let currentLang = 'my';

// 1. Initialize Quill Editor
const quill = new Quill('#editor-container', {
    theme: 'snow',
    placeholder: langTexts[currentLang].placeholder,
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

// State Management
let chapters = [{ title: 'Chapter 1', content: '' }];
let currentChapterIndex = 0;

// Theme Toggle Logic
const themeToggleBtn = document.getElementById('themeToggleBtn');
if (themeToggleBtn) {
    const currentTheme = localStorage.getItem('theme') || 'dark';
    if (currentTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
    }
    themeToggleBtn.addEventListener('click', () => {
        let theme = document.documentElement.getAttribute('data-theme');
        if (theme === 'light') {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'dark');
            themeToggleBtn.textContent = '☀️';
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
            themeToggleBtn.textContent = '🌙';
        }
    });
}

// Language Toggle Logic
const langSelect = document.getElementById('langSelect');
if (langSelect) {
    langSelect.addEventListener('change', (e) => {
        currentLang = e.target.value;
        quill.root.dataset.placeholder = langTexts[currentLang].placeholder;
    });
}

// Render Chapter List
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

        item.appendChild(titleSpan);
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
