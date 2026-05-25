// ၁။ ပုံထည့်ခြင်း (Resize လုပ်ပြီးမှ ထည့်ပေးမယ်)
document.getElementById('imgInput').addEventListener('change', function(e) {
    const files = e.target.files;
    for (let file of files) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.src = event.target.result;
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 600;
                const scale = MAX_WIDTH / img.width;
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scale;
                canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
                
                const newImg = document.createElement('img');
                newImg.src = canvas.toDataURL('image/jpeg', 0.8);
                document.getElementById('editor').appendChild(newImg);
            };
        };
        reader.readAsDataURL(file);
    }
});

// ၂။ ePub ထုတ်ယူခြင်း
async function generateEPUB() {
    const zip = new JSZip();
    const content = document.getElementById('editor').innerHTML;
    
    // ပုံတွေကို ခွဲထုတ်ပြီး zip ထဲထည့်မယ်
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
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
        alert("ePub ဖိုင်ကို အောင်မြင်စွာ ထုတ်ယူနိုင်ပါပြီ!");
    });
}
