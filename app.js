// ဘာသာစကား စာသားများ သတ်မှတ်ချက်
const translations = {
    my: {
        backup_title: "စာအုပ် BACKUP စီမံခန့်ခွဲမှု",
        btn_backup: "လက်ရှိစာအုပ်ကို ဖိုင်သိမ်းဆည်းမည် (Backup)",
        btn_load: "စာအုပ်ဖောင်း ပြန်တင်မည် (Load Backup)",
        btn_reset: "စာအုပ်အသစ်အတွက် အစကပြန်စမည် (Reset)",
        label_title: "စာအုပ်အမည် (Book Title)",
        label_author: "စာရေးဆရာ (Author)",
        label_cover: "မျက်နှာဖုံးပုံ (Cover Image)",
        btn_choose: "Choose File",
        no_file: "No file selected",
        label_chapters: "အခန်းများ (Chapters)",
        btn_add_chapter: "အခန်းတိုးမည် (Add Chapter)"
    },
    en: {
        backup_title: "Book Backup Management",
        btn_backup: "Backup Current Book",
        btn_load: "Load Backup",
        btn_reset: "Reset for New Book",
        label_title: "Book Title",
        label_author: "Author",
        label_cover: "Cover Image",
        btn_choose: "Choose File",
        no_file: "No file selected",
        label_chapters: "Chapters",
        btn_add_chapter: "Add Chapter"
    }
};

// HTML Elements များကို ယူခြင်း
const themeToggle = document.getElementById('theme-toggle');
const langToggle = document.getElementById('lang-toggle');
const htmlEl = document.documentElement;

let currentLang = 'my';

// ၁။ Night Mode / Light Mode အလုပ်လုပ်ပုံ
themeToggle.addEventListener('click', () => {
    const currentTheme = htmlEl.getAttribute('data-theme');
    
    if (currentTheme === 'dark') {
        htmlEl.setAttribute('data-theme', 'light');
        themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>'; // နေမုဒ် Icon
    } else {
        htmlEl.setAttribute('data-theme', 'dark');
        themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>'; // ညမုဒ် Icon
    }
});

// ၂။ ဘာသာစကား (Language) ပြောင်းလဲခြင်း အလုပ်လုပ်ပုံ
langToggle.addEventListener('click', () => {
    // လက်ရှိ 'my' ဖြစ်နေရင် 'en' ပြောင်း၊ 'en' ဖြစ်နေရင် 'my' ပြောင်း
    currentLang = currentLang === 'my' ? 'en' : 'my';
    
    // ခလုတ်ပေါ်က စာသားကို ပြောင်းလဲခြင်း
    langToggle.innerText = currentLang === 'my' ? 'EN' : 'မြန်မာ';
    
    // UI ပေါ်က စာသားများကို သက်ဆိုင်ရာ ဘာသာစကားသို့ လိုက်ပြောင်းပေးခြင်း
    document.querySelectorAll('[data-lang]').forEach(element => {
        const key = element.getAttribute('data-lang');
        if (translations[currentLang][key]) {
            element.innerText = translations[currentLang][key];
        }
    });
});
