# digital-decision-lab
# Digital Decision Lab — PhishShield & PhishSim Platform

Platform edukasi dan simulasi keamanan siber berbasis **React, TypeScript, Tailwind CSS, Vite, dan Supabase**. Aplikasi ini mengintegrasikan pengujian kesadaran phising secara interaktif serta analisis *dataset* phising secara offline untuk meningkatkan kemampuan deteksi ancaman pengguna.

---

## 🚀 Fitur Utama

- **PhishSim**: Simulasi serangan phishing interaktif dengan pengacakan skenario menggunakan algoritma *Fisher-Yates Shuffle*.
- **PhishShield**: Alat deteksi dan analisis indikator phising lokal yang mengategorikan pemicu emosional (*Urgency, Fear, Authority, Greed*).
- **Behavioral Profile**: Pemetaan skor keamanan dan indikator perilaku risiko pengguna secara *real-time*.
- **Supabase Integration**: Manajemen autentikasi pengguna dan penyimpanan riwayat skor simulasi (`profiles` & `simulation_logs`).
- **Offline Dataset Processing**: Konversi otomatis *dataset* `CEAS_08.csv` menjadi `ceas_data.json` berbasis Python untuk performa baca *client-side* yang cepat tanpa beban kuota server.

---

## 🛠️ Teknologi & Dependensi

- **Frontend Framework**: React 18 / Vite 8
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Backend / Auth**: Supabase
- **Data Processing**: Python 3 (`json`, `csv`)

---

## 📋 Langkah-Langkah Eksekusi & Instalasi lokal

### 1. Kloning Repositori
```bash
git clone [https://github.com/USERNAME_ANDA/NAMA_REPO_ANDA.git](https://github.com/USERNAME_ANDA/NAMA_REPO_ANDA.git)
cd NAMA_REPO_ANDA
