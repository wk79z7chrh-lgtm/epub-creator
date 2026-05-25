// HTML တစ်ခုလုံး Load ဖြစ်ပြီးမှ JavaScript အလုပ်လုပ်စေရန်
document.addEventListener("DOMContentLoaded", () => {
    
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

    const themeToggle = document.getElementById('theme-toggle');
    const langToggle = document.getElementById('lang-toggle');
    const htmlEl = document.documentElement;

    // ပုံထဲမှာ English ပြနေတဲ့အတွက် Default ကို 'en' လို့ ပေးထားလိုက်ပါမယ်
    let currentLang = 'en'; 

    // ၁။ Night Mode Toggle အလုပ်လုပ်ပုံ
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

    // ၂။ ဘာသာစကားပြောင်းလဲခြင်း အလုပ်လုပ်ပုံ
    if (langToggle) {
        langToggle.addEventListener('click', () => {
            currentLang = currentLang === 'my' ? 'en' : 'my';
            
            // ခလုတ်ပေါ်က စာသားကို လိုက်ပြောင်းပေးခြင်း
            langToggle.innerText = currentLang === 'my' ? 'EN' : 'မြန်မာ';
            
            // စာသားအားလုံးကို လိုက်ပြောင်းပေးခြင်း
            document.querySelectorAll('[data-lang]').forEach(element => {
                const key = element.getAttribute('data-lang');
                if (translations[currentLang] && translations[currentLang][key]) {
                    element.innerText = translations[currentLang][key];
                }
            });
        });
    }
});
