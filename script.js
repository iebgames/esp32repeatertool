const translations = {
    en: {
        title: "WIFI CONFIGURATOR",
        subtitle: "Configure your extender and download the local source code.",
        targetTitle: "TARGET NETWORK",
        targetSsid: "SSID (WiFi Name)",
        targetPass: "Password",
        newTitle: "EXTENDED NETWORK",
        newSsid: "New SSID",
        newPass: "New Password",
        downloadBtn: "GENERATE & DOWNLOAD (.ZIP)",
        hint: "The ZIP will contain the pre-configured .ino file and a setup guide.",
        readmeTitle: "ESP32 WIFI EXTENDER - SETUP GUIDE",
        readmeStep1: "1. Install Arduino IDE on your computer.",
        readmeStep2: "2. Open the 'wifi_repeater.ino' file.",
        readmeStep3: "3. Connect your ESP32 / Deneyap Kart via USB.",
        readmeStep4: "4. Select your board and port from the Tools menu.",
        readmeStep5: "5. Click 'Upload'.",
        readmeNote: "Note: Your WiFi credentials have been automatically injected into the code.",
        successMsg: "Configured successfully! Starting download..."
    },
    tr: {
        title: "WIFI YAPILANDIRICI",
        subtitle: "Genişleticini yapılandır ve yerel kaynak kodunu indir.",
        targetTitle: "HEDEF AĞ",
        targetSsid: "Ağ Adı (SSID)",
        targetPass: "Şifre",
        newTitle: "YENİ AĞ (UZATILAN)",
        newSsid: "Yeni Ağ Adı",
        newPass: "Yeni Şifre",
        downloadBtn: "PAKETİ OLUŞTUR VE İNDİR (.ZIP)",
        hint: "ZIP dosyası yapılandırılmış .ino dosyasını ve kurulum rehberini içerir.",
        readmeTitle: "ESP32 WIFI GENİŞLETİCİ - KURULUM REHBERİ",
        readmeStep1: "1. Bilgisayarınıza Arduino IDE kurun.",
        readmeStep2: "2. 'wifi_repeater.ino' dosyasını açın.",
        readmeStep3: "3. ESP32 / Deneyap Kartınızı USB ile bağlayın.",
        readmeStep4: "4. Araçlar menüsünden kartınızı ve portunuzu seçin.",
        readmeStep5: "5. 'Yükle' (Upload) butonuna basın.",
        readmeNote: "Not: WiFi bilgileriniz koda otomatik olarak eklenmiştir.",
        successMsg: "Yapılandırma başarılı! İndirme başlıyor..."
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

// Language Toggle
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

// Binary Replacement Utility
function patchCode(code, targetSsid, targetPass, newSsid, newPass) {
    let patched = code;
    patched = patched.replaceAll("TARGET_SSID_PLACEHOLDER_64BYTES_A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6", targetSsid);
    patched = patched.replaceAll("TARGET_PASS_PLACEHOLDER_64BYTES_A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6", targetPass);
    patched = patched.replaceAll("NEW_SSID_PLACEHOLDER_64BYTES_A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6", newSsid);
    patched = patched.replaceAll("NEW_PASS_PLACEHOLDER_64BYTES_A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6", newPass);
    return patched;
}

// Download Action
document.getElementById('download-btn').addEventListener('click', async () => {
    const targetSsid = document.getElementById('target-ssid').value;
    const targetPass = document.getElementById('target-pass').value;
    const newSsid = document.getElementById('new-ssid').value || "ESP32_Extender";
    const newPass = document.getElementById('new-pass').value;

    if (!targetSsid || !targetPass || !newPass) {
        alert(currentLang === 'tr' ? "Lütfen tüm alanları doldurun!" : "Please fill in all fields!");
        return;
    }

    try {
        // Fetch original .ino content
        const response = await fetch('wifi_repeater.ino');
        const originalCode = await response.text();
        
        // Patch the code
        const finalCode = patchCode(originalCode, targetSsid, targetPass, newSsid, newPass);

        // Generate Files
        const zip = new JSZip();
        
        // Add .ino
        zip.file("wifi_repeater/wifi_repeater.ino", finalCode);
        
        // Add README
        const t = translations[currentLang];
        const readmeContent = `${t.readmeTitle}\n\n${t.readmeStep1}\n${t.readmeStep2}\n${t.readmeStep3}\n${t.readmeStep4}\n${t.readmeStep5}\n\n${t.readmeNote}`;
        zip.file("wifi_repeater/README.txt", readmeContent);

        // Generate ZIP and trigger download
        const content = await zip.generateAsync({ type: "blob" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(content);
        link.download = "wifi_extender_config.zip";
        link.click();
        
        console.log(t.successMsg);
    } catch (err) {
        console.error("Error generating ZIP:", err);
        alert("Download failed. Make sure you are running from a server (like GitHub Pages).");
    }
});

// Initial Load
updateUI();
