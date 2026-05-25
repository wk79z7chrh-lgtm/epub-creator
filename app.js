// ၁။ ပုံထည့်ခြင်းနှင့် Resize လုပ်ခြင်း
document.getElementById('imgInput').addEventListener('change', function(e) {
    const files = e.target.files;
    for (let file of files) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.src = event.target.result;
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800; // ပုံအကျယ် 800px သတ်မှတ်
                const scale = MAX_WIDTH / img.width;
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scale;
                canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
                
                const newImg = document.createElement('img');
                newImg.src = canvas.toDataURL('image/jpeg', 0.7);
                newImg.style.maxWidth = "100%";
                document.getElementById('editor').appendChild(newImg);
            };
        };
        reader.readAsDataURL(file);
    }
});

// ၂။ ePub ထုတ်ယူခြင်း
async function generateEPUB() {
    const status = document.getElementById('status');
    const btn = document.getElementById('downloadBtn');
    
    status.innerText = "ဖိုင်တည်ဆောက်နေသည်... ခဏစောင့်ပါ...";
    btn.disabled = true;

    const zip = new JSZip();
    const editorContent = document.getElementById('editor').innerHTML;
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(editorContent, 'text/html');
    const images = doc.querySelectorAll('img');
    
    images.forEach((img, index) => {
        const base64Data = img.src.split(',')[1];
        const filename = `images/img_${index}.jpg`;
        zip.file(filename, base64Data, {base64: true});
        img.src = filename;
    });
    
    zip.file("index.html", `<html><body>${doc.body.innerHTML}</body></html>`);
    
    zip.generateAsync({type:"blob"}).then(function(content) {
        saveAs(content, "MyBook.epub");
        status.innerText = "အောင်မြင်စွာ ထုတ်ယူနိုင်ပါပြီ!";
        btn.disabled = false;
    });
}
