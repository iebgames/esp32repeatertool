const translations = {
    en: {
        title: "WIFI CONFIGURATOR",
        subtitle: "Premium extender setup for professional network expansion.",
        targetTitle: "SOURCE NETWORK",
        targetSsid: "SSID",
        targetPass: "PASSWORD",
        newTitle: "EXTENDED NETWORK",
        newSsid: "NEW SSID",
        newPass: "NEW PASSWORD",
        downloadBtn: "DEPLOY & DOWNLOAD (.ZIP)",
        hint: "Auto-configured source code & setup manual included.",
        readmeTitle: "IEB STUDIO | WIFI INFRASTRUCTURE SETUP GUIDE",
        readmeStep1: "1. Download and install Arduino IDE (v2.x recommended).",
        readmeStep2: "2. Open 'wifi_repeater.ino' from the folder.",
        readmeStep3: "3. Connect your board via USB.",
        readmeStep4: "4. Select 'Deneyap Kart' (v2.0.0+) or 'ESP32 Dev Module'.",
        readmeStep5: "5. Click the 'Upload' arrow button.",
        readmeNote: "SYSTEM CORE: WiFi credentials have been injected via IEB Binary Patcher.",
        successMsg: "IEB System Ready: Generating artifacts..."
    },
    tr: {
        title: "WIFI YAPILANDIRICI",
        subtitle: "Profesyonel ağ genişletme için premium kurulum paneli.",
        targetTitle: "KAYNAK AĞ",
        targetSsid: "AĞ ADI (SSID)",
        targetPass: "ŞİFRE",
        newTitle: "GENİŞLETİLMİŞ AĞ",
        newSsid: "YENİ AĞ ADI",
        newPass: "YENİ ŞİFRE",
        downloadBtn: "DAĞIT VE İNDİR (.ZIP)",
        hint: "Yapılandırılmış kaynak kodu ve kurulum kılavuzu dahildir.",
        readmeTitle: "IEB STUDIO | WIFI ALTYAPI KURULUM REHBERİ",
        readmeStep1: "1. Arduino IDE (v2.x önerilir) indirin ve kurun.",
        readmeStep2: "2. Klasördeki 'wifi_repeater.ino' dosyasını açın.",
        readmeStep3: "3. Kartınızı USB ile bilgisayara bağlayın.",
        readmeStep4: "4. Araçlar menüsünden 'Deneyap Kart' veya 'ESP32 Dev Module' seçin.",
        readmeStep5: "5. 'Yükle' (Upload) butonuna basın.",
        readmeNote: "SİSTEM ÇEKİRDEĞİ: WiFi bilgileri IEB Binary Patcher ile koda işlenmiştir.",
        successMsg: "IEB Sistemi Hazır: Dosyalar oluşturuluyor..."
    }
};

let currentLang = 'en';

function updateUI() {
    const t = translations[currentLang];
    document.getElementById('ui-title').innerText = t.title;
    document.getElementById('ui-subtitle').innerText = t.subtitle;
    document.getElementById('ui-target-title').innerText = t.targetTitle;
    document.getElementById('ui-target-ssid-label').innerText = t.targetSsid;
    document.getElementById('ui-target-pass-label').innerText = t.targetPass;
    document.getElementById('ui-new-title').innerText = t.newTitle;
    document.getElementById('ui-new-ssid-label').innerText = t.newSsid;
    document.getElementById('ui-new-pass-label').innerText = t.newPass;
    document.getElementById('ui-download-text').innerText = t.downloadBtn;
    document.getElementById('ui-hint').innerText = t.hint;
}

// Language Controls
document.getElementById('lang-en').addEventListener('click', () => {
    currentLang = 'en';
    document.getElementById('lang-en').classList.add('active');
    document.getElementById('lang-tr').classList.remove('active');
    updateUI();
});

document.getElementById('lang-tr').addEventListener('click', () => {
    currentLang = 'tr';
    document.getElementById('lang-tr').classList.add('active');
    document.getElementById('lang-en').classList.remove('active');
    updateUI();
});

// Patching Engine
function patchCode(code, targetSsid, targetPass, newSsid, newPass) {
    let patched = code;
    patched = patched.replaceAll("TARGET_SSID_PLACEHOLDER_64BYTES_A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6", targetSsid);
    patched = patched.replaceAll("TARGET_PASS_PLACEHOLDER_64BYTES_A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6", targetPass);
    patched = patched.replaceAll("NEW_SSID_PLACEHOLDER_64BYTES_A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6", newSsid);
    patched = patched.replaceAll("NEW_PASS_PLACEHOLDER_64BYTES_A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6", newPass);
    return patched;
}

// ZIP Generator
document.getElementById('download-btn').addEventListener('click', async () => {
    const targetSsid = document.getElementById('target-ssid').value;
    const targetPass = document.getElementById('target-pass').value;
    const newSsid = document.getElementById('new-ssid').value || "IEB_EXTENDER";
    const newPass = document.getElementById('new-pass').value;

    if (!targetSsid || !targetPass || !newPass) {
        alert(currentLang === 'tr' ? "Lütfen tüm verileri eksiksiz girin!" : "Please provide all required credentials!");
        return;
    }

    try {
        const response = await fetch('wifi_repeater.ino');
        const code = await response.text();
        const finalCode = patchCode(code, targetSsid, targetPass, newSsid, newPass);

        const zip = new JSZip();
        // Create matching folder structure for Arduino IDE
        zip.file("wifi_repeater/wifi_repeater.ino", finalCode);
        
        const t = translations[currentLang];
        const readme = `-----------------------------------\n${t.readmeTitle}\n-----------------------------------\n\n${t.readmeStep1}\n${t.readmeStep2}\n${t.readmeStep3}\n${t.readmeStep4}\n${t.readmeStep5}\n\n[INFO] ${t.readmeNote}`;
        
        zip.file("wifi_repeater/IEB_INSTRUCTIONS.txt", readme);

        const blob = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "IEB_WiFi_Extender_Package.zip";
        a.click();
        
        console.log("%c " + t.successMsg, "color: #00f2ff; font-weight: bold;");
    } catch (e) {
        alert("System error. Ensure you are using a web server (GitHub Pages).");
    }
});

// Init
updateUI();
