#ifndef WIFI_REPEATER_H
#define WIFI_REPEATER_H

#include <Arduino.h>
#include <WiFi.h>

extern "C" {
  #include <lwip/ip_addr.h>
  #include <lwip/err.h>
  
  // NAPT (NAT) functions defined in ESP32 SDK but often missing in Arduino headers
  err_t ip_napt_init(uint16_t max_nat, uint8_t max_port_nat);
  err_t ip_napt_enable_no(uint8_t if_number, uint8_t enable);
  
  // DNS server configuration for DHCP
  void dhcps_set_dns(uint8_t dns_no, const ip_addr_t *dns_ip);
}

// ==========================================
// IEB STUDIO CONFIGURATION PLACEHOLDERS
// ==========================================
const char target_ssid[64] = "TARGET_SSID_PLACEHOLDER_64BYTES_A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6";
const char target_pass[64] = "TARGET_PASS_PLACEHOLDER_64BYTES_A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6";
const char new_ssid[64]    = "NEW_SSID_PLACEHOLDER_64BYTES_A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6";
const char new_pass[64]    = "NEW_PASS_PLACEHOLDER_64BYTES_A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6";

#define NAPT 1000
#define NAPT_PORT 10

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n\n************************************");
  Serial.println("*      IEB STUDIO WIFI EXTENDER    *");
  Serial.println("************************************");

  WiFi.mode(WIFI_AP_STA);

  // Connect to Target
  Serial.printf("Connecting to: %s\n", target_ssid);
  WiFi.begin(target_ssid, target_pass);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.printf("\nConnected! Local IP: %s\n", WiFi.localIP().toString().c_str());

  // Start AP
  WiFi.softAP(new_ssid, new_pass);
  Serial.printf("Beacon Started: %s\n", new_ssid);

  // Setup NAT
  ip_addr_t dnsserver;
  dnsserver.u_addr.ip4.addr = static_cast<uint32_t>(WiFi.dnsIP());
  dnsserver.type = IPADDR_TYPE_V4;
  dhcps_set_dns(0, &dnsserver);

  err_t ret = ip_napt_init(NAPT, NAPT_PORT);
  if (ret == ERR_OK) {
    ret = ip_napt_enable_no(SOFTAP_IF, 1);
    if (ret == ERR_OK) {
      Serial.println("NAT Engine Active. [IEB SYSTEM READY]");
    }
  }
}

void loop() {
  delay(1000);
}

#endif
