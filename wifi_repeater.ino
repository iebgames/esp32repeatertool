#include <Arduino.h>
#include <WiFi.h>
#include <lwip/napt.h>
#include <lwip/dns.h>

extern "C" {
#include <dhcpserver/dhcpserver.h>
}

/* 
 * DİKKAT: Bu kütüphane Deneyap Kart (ESP32) için "lwIP" üzerinden NAT (NAPT) yapar.
 * Aşağıdaki string'ler "Binary Patching" için yer tutucudur. 
 * Tam olarak 64 karakter uzunluğundadırlar.
 */
const char target_ssid[64] = "TARGET_SSID_PLACEHOLDER_64BYTES_A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6";
const char target_pass[64] = "TARGET_PASS_PLACEHOLDER_64BYTES_A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6";
const char new_ssid[64]    = "NEW_SSID_PLACEHOLDER_64BYTES_A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6";
const char new_pass[64]    = "NEW_PASS_PLACEHOLDER_64BYTES_A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6";

#define NAPT 1000
#define NAPT_PORT 10

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n\n--- Deneyap WiFi Extender Baslatiliyor ---");

  // WiFi Modu: Hem Station (Modeme baglanma) hem AP (Sinyal yayma)
  WiFi.mode(WIFI_AP_STA);

  // 1. Hedef Modeme Baglanma
  Serial.printf("Baglaniliyor: %s\n", target_ssid);
  WiFi.begin(target_ssid, target_pass);
  
  int counter = 0;
  while (WiFi.status() != WL_CONNECTED && counter < 20) {
    delay(1000);
    Serial.print(".");
    counter++;
  }

  if(WiFi.status() == WL_CONNECTED) {
    Serial.printf("\nModeme Baglanildi! IP: %s\n", WiFi.localIP().toString().c_str());
  } else {
    Serial.println("\nZaman asimi: Modem bulunamadi veya sifre yanlis.");
  }

  // 2. Kendi Agini Olusturma
  WiFi.softAP(new_ssid, new_pass);
  Serial.printf("Yayin Basladi: %s (Sifre: %s)\n", new_ssid, new_pass);
  Serial.printf("AP IP: %s\n", WiFi.softAPIP().toString().c_str());

  // 3. NAT (NAPT) Yapilandirmasi
  // DNS Ayarlari
  ip_addr_t dnsserver;
  dnsserver.u_addr.ip4.addr = static_cast<uint32_t>(WiFi.dnsIP());
  dnsserver.type = IPADDR_TYPE_V4;
  dhcps_set_dns(0, &dnsserver);

  // NAT Baslatma
  err_t ret = ip_napt_init(NAPT, NAPT_PORT);
  if (ret == ERR_OK) {
    // SOFTAP_IF arayuzunde NAT'i aktif et
    ret = ip_napt_enable_no(SOFTAP_IF, 1);
    if (ret == ERR_OK) {
      Serial.println("NAT (Sinyal Genisletme) Basariyla Aktif Edildi.");
    }
  }

  if (ret != ERR_OK) {
    Serial.printf("NAT Hatasi Oluştu: %d\n", ret);
  }
}

void loop() {
  // Veri akisi lwip alt katmaninda otomatik olarak gerceklesir.
  delay(1000);
}
