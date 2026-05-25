document.addEventListener("DOMContentLoaded", () => {
    
    // ဘာသာစကား စာသားများစွယ်စုံ
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

    const themeToggle = document.getElementById('theme-toggle');
    const langToggle = document.getElementById('lang-toggle');
    const htmlEl = document.documentElement;

    // အစပိုင်းမှာ မြန်မာလို ပြထားချင်ရင် 'my' လို့ ထားပါ
    let currentLang = 'my'; 

    // ၁။ Night Mode (Dark/Light) ခလုတ် နှိပ်ရင် အလုပ်လုပ်မည့်အပိုင်း
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = htmlEl.getAttribute('data-theme');
            if (currentTheme === 'dark') {
                htmlEl.setAttribute('data-theme', 'light');
                themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>'; 
            } else {
                htmlEl.setAttribute('data-theme', 'dark');
                themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>'; 
            }
        });
    }

    // ၂။ ဘာသာစကား (မြန်မာ / English) ပြောင်းလဲမည့်အပိုင်း
    if (langToggle) {
        langToggle.addEventListener('click', () => {
            // လက်ရှိ ဘာသာစကားကို ပြောင်းလဲခြင်း
            currentLang = currentLang === 'my' ? 'en' : 'my';
            
            // ညာဘက်အပေါ်က ခလုတ်ရဲ့ စာသားကို ပြောင်းလဲခြင်း
            langToggle.innerText = currentLang === 'my' ? 'EN' : 'မြန်မာ';
            
            // စာသားတစ်ခုချင်းစီကို ID အလိုက် လိုက်လံလဲလှယ်ပေးခြင်း
            document.getElementById('backup-title').innerText = translations[currentLang].backup_title;
            document.getElementById('btn-backup').innerText = translations[currentLang].btn_backup;
            document.getElementById('btn-load').innerText = translations[currentLang].btn_load;
            document.getElementById('btn-reset').innerText = translations[currentLang].btn_reset;
            document.getElementById('label-title').innerText = translations[currentLang].label_title;
            document.getElementById('label-author').innerText = translations[currentLang].label_author;
            document.getElementById('label-cover').innerText = translations[currentLang].label_cover;
            document.getElementById('btn-choose').innerText = translations[currentLang].btn_choose;
            document.getElementById('no-file').innerText = translations[currentLang].no_file;
            document.getElementById('label-chapters').innerText = translations[currentLang].label_chapters;
            document.getElementById('btn-add-chapter').innerText = translations[currentLang].btn_add_chapter;
        });
    }
});
