import { ESPLoader, Transport } from "https://unpkg.com/esptool-js@0.6.0/bundle.js";

const connectBtn = document.getElementById('connect-btn');
const flashBtn = document.getElementById('flash-btn');
const consoleElement = document.getElementById('console');
const statusDot = document.getElementById('status-dot');
const statusText = document.getElementById('status-text');

let device = null;
let transport = null;
let esploader = null;

// Binary Patching Placeholders (Must match Arduino code exactly)
const PLACEHOLDERS = {
    target_ssid: "TARGET_SSID_PLACEHOLDER_64BYTES_A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6",
    target_pass: "TARGET_PASS_PLACEHOLDER_64BYTES_A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6",
    new_ssid:    "NEW_SSID_PLACEHOLDER_64BYTES_A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6",
    new_pass:    "NEW_PASS_PLACEHOLDER_64BYTES_A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6"
};

// Log function
function log(msg) {
    consoleElement.innerText += "\n> " + msg;
    consoleElement.scrollTop = consoleElement.scrollHeight;
}

// Byte replacement function
function patchBinary(buffer, placeholder, newValue) {
    const view = new Uint8Array(buffer);
    const placeholderBytes = new TextEncoder().encode(placeholder);
    const newValueBytes = new TextEncoder().encode(newValue);

    let count = 0;
    for (let i = 0; i < view.length - placeholderBytes.length; i++) {
        let match = true;
        for (let j = 0; j < placeholderBytes.length; j++) {
            if (view[i + j] !== placeholderBytes[j]) {
                match = false;
                break;
            }
        }

        if (match) {
            log(`Bilgi yamaniyor: ${placeholder.substring(0, 10)}...`);
            // Fill with 0s first
            view.fill(0, i, i + 64);
            // Insert new value
            view.set(newValueBytes.slice(0, 63), i);
            count++;
        }
    }
    return count > 0;
}

connectBtn.addEventListener('click', async () => {
    try {
        if (device) {
            await device.close();
            device = null;
            transport = null;
            esploader = null;
            statusDot.className = "status-dot status-disconnected";
            statusText.innerText = "Bağlantı Kesildi";
            connectBtn.innerText = "🔌 Bağlan";
            flashBtn.disabled = true;
            return;
        }

        device = await navigator.serial.requestPort();
        transport = new esptooljs.Transport(device);
        
        log("Karta bağlanılıyor...");
        await transport.connect();
        
        statusDot.className = "status-dot status-connected";
        statusText.innerText = "Kart Bağlı";
        connectBtn.innerText = "❌ Bağlantıyı Kes";
        flashBtn.disabled = false;
        log("Bağlantı başarılı!");

    } catch (e) {
        log("Hata: " + e.message);
    }
});

flashBtn.addEventListener('click', async () => {
    const targetSsid = document.getElementById('target-ssid').value;
    const targetPass = document.getElementById('target-pass').value;
    const newSsid = document.getElementById('new-ssid').value || "Deneyap_Extender";
    const newPass = document.getElementById('new-pass').value;

    if (!targetSsid || !targetPass || !newPass) {
        alert("Lütfen tüm alanları doldurun!");
        return;
    }

    flashBtn.disabled = true;
    log("Binary dosyası indiriliyor...");

    try {
        // Fetch the binary created by GitHub Actions
        const response = await fetch('./bin/wifi_repeater.bin');
        if (!response.ok) throw new Error("Binary dosyası bulunamadı! Lütfen önce GitHub Actions'ın bitmesini bekleyin.");
        
        let buffer = await response.arrayBuffer();
        
        // Patch strings
        patchBinary(buffer, "TARGET_SSID_PLACEHOLDER_64BYTES_A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6", targetSsid);
        patchBinary(buffer, "TARGET_PASS_PLACEHOLDER_64BYTES_A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6", targetPass);
        patchBinary(buffer, "NEW_SSID_PLACEHOLDER_64BYTES_A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6", newSsid);
        patchBinary(buffer, "NEW_PASS_PLACEHOLDER_64BYTES_A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6", newPass);

        log("Yükleme başlıyor... Lütfen bekleyin.");
        
        esploader = new esptooljs.ESPLoader(transport, 115200, null);
        await esploader.main_fn();
        
        const fileArray = [{ data: buffer, address: 0x10000 }];
        
        await esploader.write_flash({
            fileArray: fileArray,
            flashSize: 'keep',
            flashMode: 'keep',
            flashFreq: 'keep',
            eraseAll: false,
            compress: true,
            reportProgress: (curr, total) => {
                const progress = Math.round((curr / total) * 100);
                statusText.innerText = `Yükleniyor: %${progress}`;
            }
        });

        log("TEBRİKLER! Yükleme başarıyla tamamlandı.");
        statusText.innerText = "Yükleme Tamamlandı!";
        
    } catch (e) {
        log("GÜNCELLEME HATASI: " + e.message);
        flashBtn.disabled = false;
    }
});
