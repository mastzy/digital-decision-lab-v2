import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
// Import dataset lokal JSON (hasil konversi dari CEAS_08.csv)
import localDataset from "/home/toik-zakiyudin/Downloads/Digital Decision Lab Prototype/data/ceas_data.json";

type Phase = "scenario" | "feedback" | "complete";

export interface ScenarioChoice {
  label: string;
  safe: boolean;
  explanation: string;
}

export interface Scenario {
  id: number | string;
  trigger: "Urgency" | "Fear" | "Authority" | "Greed";
  triggerColor: string;
  sender: string;
  avatar: string;
  time: string;
  platform: "whatsapp" | "email";
  subject?: string;
  message: string;
  choices: ScenarioChoice[];
  riskyFeedback: string;
  safeFeedback: string;
}

// 1. Bank Skenario Riil Bawaan
const defaultScenarios: Scenario[] = [
  {
    id: 1,
    trigger: "Urgency",
    triggerColor: "#ef4444",
    sender: "J&T Express Kurir",
    avatar: "J",
    time: "10:15 AM",
    platform: "whatsapp",
    message:
      "Paket Anda dengan resi JT9820129 gagal dikirim karena alamat tidak lengkap. Silakan unduh aplikasi pelacakan resi resmi berikut untuk memperbarui alamat: http://jt-express-resi.com/Cek_Paket.apk",
    choices: [
      { label: "Unduh dan pasang file .APK tersebut", safe: false, explanation: "File .APK tersebut adalah malware pencuri SMS OTP perbankan Anda." },
      { label: "Cek resi secara manual di aplikasi resmi J&T di PlayStore", safe: true, explanation: "Langkah tepat! Selalu gunakan aplikasi resmi dari store terpercaya." },
      { label: "Minta kurir mengirimkan foto fisik paketnya", safe: true, explanation: "Meminta bukti fisik sebelum bertindak membantu memverifikasi klaim." },
      { label: "Abaikan dan laporkan nomor sebagai spam", safe: true, explanation: "Tindakan paling aman terhadap pesan berfile .APK mencurigakan." },
    ],
    riskyFeedback: "Anda terjebak manipulasi urgensi paket. Penipu memanfaatkan kekhawatiran paket hilang agar Anda memasang malware .APK.",
    safeFeedback: "Sempurna! Anda berhasil menghindari jebakan malware .APK yang mengatasnamakan jasa kurir.",
  },
  {
    id: 2,
    trigger: "Fear",
    triggerColor: "#f59e0b",
    sender: "PLN Official Alert",
    avatar: "P",
    time: "02:30 PM",
    platform: "whatsapp",
    message:
      "PEMBERITAHUAN PLN: Tunggakan listrik ID Pelanggan 5382910292 sebesar Rp1.450.000 belum dilunasi. Pemutusan aliran listrik akan dilakukan otomatis dalam 1 jam. Pelajari rincian tagihan: http://pln-pembayaran-denda.xyz",
    choices: [
      { label: "Klik link untuk segera melunasi denda", safe: false, explanation: "Link mengarahkan ke situs phishing pencuri data kartu kredit/debit." },
      { label: "Cek ID Pelanggan via aplikasi PLN Mobile resmi", safe: true, explanation: "Benar! PLN Mobile menampilkan status tagihan yang sesungguhnya." },
      { label: "Datang atau hubungi Call Center 123 PLN", safe: true, explanation: "Memastikan ke saluran resmi menghindarkan Anda dari penipuan." },
      { label: "Abaikan pesan denda tidak dikenal ini", safe: true, explanation: "Tindakan aman terhadap gertakan pemutusan listrik mendadak." },
    ],
    riskyFeedback: "Ancaman pemutusan listrik dalam 1 jam memicu rasa takut. Ini adalah metode manipulasi psikologis agar korban tidak sempat berpikir jernih.",
    safeFeedback: "Bagus sekali! Anda menahan diri dari kepanikan dan memverifikasi tagihan melalui aplikasi resmi PLN.",
  },
  {
    id: 3,
    trigger: "Authority",
    triggerColor: "#a78bfa",
    sender: "Direktorat Jenderal Pajak",
    avatar: "D",
    time: "09:00 AM",
    platform: "email",
    subject: "URGENT: Peringatan Kurang Bayar Pajak SPT Tahunan",
    message:
      "Berdasarkan evaluasi SPT, Anda memiliki kekurangan pembayaran pajak sebesar Rp4.200.000. Unduh dokumen salinan nota dinas pemeriksaan pajak terlampir: Surat_Teguran_Pajak.apk",
    choices: [
      { label: "Unduh file Surat_Teguran_Pajak.apk", safe: false, explanation: "DJP tidak pernah mengirimkan surat teguran pajak dalam format .APK." },
      { label: "Login ke portal resmi djponline.pajak.go.id", safe: true, explanation: "Sangat tepat! Portal resmi DJP adalah satu-satunya acuan status pajak Anda." },
      { label: "Konfirmasi ke kantor pelayanan pajak (KPP) terdekat", safe: true, explanation: "Verifikasi langsung ke instansi resmi mencegah penipuan otoritas." },
      { label: "Hapus email dan tandai sebagai Phishing", safe: true, explanation: "Langkah tepat untuk melindungi perangkat dari serangan malware." },
    ],
    riskyFeedback: "Instansi pemerintah seperti DJP sering dicatut penipu. Mengunduh file .APK dari email akan meretas HP Anda.",
    safeFeedback: "Luar biasa! Mengidentifikasi pencatutan otoritas pemerintah adalah pertahanan siber yang sangat kuat.",
  },
  {
    id: 4,
    trigger: "Greed",
    triggerColor: "#fbbf24",
    sender: "Telkomsel Poin Festival",
    avatar: "🎁",
    time: "04:15 PM",
    platform: "whatsapp",
    message:
      "Selamat! 5.000 Poin Telkomsel Anda berhasil ditukar dengan Saldo e-Wallet Rp3.500.000. Klaim pencairan saldo sekarang sebelum kedaluwarsa: http://telkomsel-poin-klaim.win/saldo",
    choices: [
      { label: "Isi data nomor HP dan kode OTP untuk klaim", safe: false, explanation: "Memberikan OTP saat klaim hadiah membuat akun e-wallet/m-banking Anda dikuasai penipu." },
      { label: "Cek sisa poin resmi via aplikasi MyTelkomsel", safe: true, explanation: "Tepat sekali! Poin resmi hanya dapat dikelola di aplikasi MyTelkomsel." },
      { label: "Laporkan nomor penipu ke saluran aduan Telkomsel", safe: true, explanation: "Membantu menghentikan penyebaran penipuan ke pengguna lain." },
      { label: "Abaikan iming-iming hadiah mendadak ini", safe: true, explanation: "Menahan diri dari tawaran tergiur adalah benteng terbaik." },
    ],
    riskyFeedback: "Iming-iming uang gratis memicu pemicu Greed (ketamakan). Penipu meminta OTP untuk menguras akun Anda.",
    safeFeedback: "Hebat! Anda tidak tergiur oleh hadiah fantastis dan memverifikasi melalui MyTelkomsel.",
  },
];

// 2. Helper: Pengacak Array (Fisher-Yates Shuffle)
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// 3. Helper: Pembuat Skenario Dinamis dari Data Dataset CEAS_08 Lokal
function buildDynamicScenarioFromLocal(rawItem: any, index: number): Scenario {
  const bodyText = rawItem.body || rawItem.text || rawItem.subject || "Pesan tidak memiliki isi";
  const lower = bodyText.toLowerCase();

  const isSpam =
    rawItem.label === 1 ||
    rawItem.label === "1" ||
    String(rawItem.label).toLowerCase() === "spam";

  let trigger: "Urgency" | "Fear" | "Authority" | "Greed" = "Urgency";
  let triggerColor = "#ef4444";

  if (/(menang|hadiah|voucher|cashback|gratis|klaim|saldo|bonus)/i.test(lower)) {
    trigger = "Greed";
    triggerColor = "#fbbf24";
  } else if (/(diblokir|diretas|sanksi|pidana|pembekuan|terkunci|bahaya)/i.test(lower)) {
    trigger = "Fear";
    triggerColor = "#f59e0b";
  } else if (/(bank|djp|pajak|polisi|resmi|admin|verifikasi|official)/i.test(lower)) {
    trigger = "Authority";
    triggerColor = "#a78bfa";
  }

  const safeChoices: ScenarioChoice[] = [
    { label: "Cek & verifikasi via saluran / aplikasi resmi", safe: true, explanation: "Tindakan aman! Jangan respons pesan tak dikenal secara langsung." },
    { label: "Abaikan dan laporkan pesan ini sebagai Spam", safe: true, explanation: "Sangat tepat! Mengabaikan pesan berisiko melindungi data pribadi Anda." },
  ];

  const riskyChoices: ScenarioChoice[] = [
    { label: "Klik tautan / unduh file di dalam pesan", safe: false, explanation: "Berisiko tinggi! Mengeklik tautan langsung dapat meretas perangkat Anda." },
    { label: "Balas pesan dan berikan kode OTP / PIN yang diminta", safe: false, explanation: "Sangat berbahaya! Data sensitif Anda dapat dikuasai penipu." },
  ];

  let choices: ScenarioChoice[] = [];
  if (isSpam) {
    choices = shuffleArray([
      riskyChoices[Math.floor(Math.random() * riskyChoices.length)],
      safeChoices[0],
      safeChoices[1],
    ]);
  } else {
    choices = shuffleArray([
      { label: "Buka dan respon informasi pesan secara wajar", safe: true, explanation: "Pesan ini teridentifikasi sebagai komunikasi valid/aman." },
      ...safeChoices,
    ]);
  }

  return {
    id: rawItem.id || `local-${index}-${Date.now()}`,
    trigger,
    triggerColor,
    sender: rawItem.subject || rawItem.sender || "Layanan Keuangan",
    avatar: (rawItem.subject || "S").charAt(0).toUpperCase(),
    time: "Baru saja",
    platform: Math.random() > 0.5 ? "whatsapp" : "email",
    subject: rawItem.subject,
    message: bodyText,
    choices,
    riskyFeedback: `Pesan ini terdeteksi sebagai sampel phishing yang memicu ${trigger}.`,
    safeFeedback: "Keputusan tepat! Anda mempraktikkan verifikasi keamanan siber yang baik.",
  };
}

export default function PhishSim() {
  const [scenariosList, setScenariosList] = useState<Scenario[]>(defaultScenarios);
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("scenario");
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [generatingAi, setGeneratingAi] = useState(false);

  // Inisialisasi & Pengacakan Soal gabungan (Lokal Dataset + Supabase)
  const initGameScenarios = async () => {
    let combinedPool: Scenario[] = [...defaultScenarios];

    // 1. Masukkan Dataset CEAS_08 Lokal (jika ada)
    if (localDataset && Array.isArray(localDataset) && localDataset.length > 0) {
      const shuffledLocal = shuffleArray(localDataset as any[]).slice(0, 5);
      const formattedLocal = shuffledLocal.map((item, idx) => buildDynamicScenarioFromLocal(item, idx));
      combinedPool = [...combinedPool, ...formattedLocal];
    }

    // 2. Ambil Skenario Tambahan dari Supabase
    try {
      const { data, error } = await supabase.from("scenarios").select("*").limit(10);
      if (data && !error && data.length > 0) {
        const mappedData: Scenario[] = data.map((item, idx) => ({
          id: item.id || idx + 100,
          trigger: item.trigger_category || "Urgency",
          triggerColor:
            item.trigger_category === "Fear"
              ? "#f59e0b"
              : item.trigger_category === "Authority"
              ? "#a78bfa"
              : item.trigger_category === "Greed"
              ? "#fbbf24"
              : "#ef4444",
          sender: item.title || item.sender || "Layanan Keuangan",
          avatar: item.title ? item.title.charAt(0) : "S",
          time: "Baru saja",
          platform: item.sender_type === "Email" ? "email" : "whatsapp",
          message: item.content || item.body || item.text,
          choices: shuffleArray([
            { label: "Cek & verifikasi via aplikasi / saluran resmi", safe: true, explanation: "Tindakan aman! Verifikasi resmi menghindarkan Anda dari manipulasi." },
            { label: "Klik link atau ikuti petunjuk di dalam pesan", safe: false, explanation: "Berisiko tinggi! Mengeklik tautan langsung dapat meretas akun Anda." },
            { label: "Abaikan dan tandai pesan sebagai Spam", safe: true, explanation: "Sangat tepat! Mengabaikan pesan berisiko melindungi data Anda." },
          ]),
          riskyFeedback: item.explanation || "Pesan ini mengindikasikan metode penipuan digital yang berbahaya.",
          safeFeedback: "Keputusan tepat! Anda mempraktikkan verifikasi keamanan siber yang baik.",
        }));
        combinedPool = [...combinedPool, ...mappedData];
      }
    } catch (err) {
      console.error("Gagal mengambil data skenario dari Supabase:", err);
    }

    // 3. Acak Seluruh Pool Soal dan Ambil 5 Soal Per Sesi
    const finalSelection = shuffleArray(combinedPool).slice(0, 5);
    setScenariosList(finalSelection);
    setScenarioIndex(0);
    setPhase("scenario");
    setSelectedChoice(null);
    setScore(0);
    setResults([]);
  };

  useEffect(() => {
    initGameScenarios();
  }, []);

  // Generator Skenario Dinamis Menggunakan OpenAI API
  async function generateNewScenarioWithAI() {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      alert("Harap masukkan VITE_OPENAI_API_KEY di file .env untuk fitur pembuatan skenario AI otomatis!");
      return;
    }

    setGeneratingAi(true);
    const triggers = ["Urgency", "Fear", "Authority", "Greed"];
    const randomTrigger = triggers[Math.floor(Math.random() * triggers.length)];

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `Buatkan 1 skenario penipuan/phishing siber nyata dalam Bahasa Indonesia ber-setting tren siber Indonesia.
Pemicu emosi utama: ${randomTrigger}.
Output HANYA format JSON valid tanpa tanda markdown/backticks:
{
  "sender": "Nama pengirim (misal: Bank BCA, Shopee, DANA, Kurir)",
  "platform": "whatsapp" atau "email",
  "avatar": "Inisial 1 huruf",
  "time": "11:20 AM",
  "subject": "Subjek jika email",
  "message": "Pesan penipuan yang meyakinkan",
  "choices": [
    {"label": "Pilihan A (Risky)", "safe": false, "explanation": "Alasan bahaya"},
    {"label": "Pilihan B (Safe)", "safe": true, "explanation": "Alasan aman"},
    {"label": "Pilihan C (Safe)", "safe": true, "explanation": "Alasan aman"}
  ],
  "riskyFeedback": "Penjelasan mengapa pilihan ini berbahaya",
  "safeFeedback": "Pujian atas keputusan aman"
}`,
            },
          ],
        }),
      });

      const data = await response.json();
      const rawContent = data.choices[0].message.content.trim();
      const cleanJson = rawContent.replace(/^```json/, "").replace(/```$/, "").trim();
      const parsedAiScenario = JSON.parse(cleanJson);

      const newScenario: Scenario = {
        id: Date.now(),
        trigger: randomTrigger as any,
        triggerColor:
          randomTrigger === "Fear"
            ? "#f59e0b"
            : randomTrigger === "Authority"
            ? "#a78bfa"
            : randomTrigger === "Greed"
            ? "#fbbf24"
            : "#ef4444",
        sender: parsedAiScenario.sender,
        avatar: parsedAiScenario.avatar || "A",
        time: parsedAiScenario.time || "Baru saja",
        platform: parsedAiScenario.platform || "whatsapp",
        subject: parsedAiScenario.subject,
        message: parsedAiScenario.message,
        choices: shuffleArray(parsedAiScenario.choices),
        riskyFeedback: parsedAiScenario.riskyFeedback,
        safeFeedback: parsedAiScenario.safeFeedback,
      };

      setScenariosList((prev) => [newScenario, ...prev]);
      setScenarioIndex(0);
      setPhase("scenario");
      setSelectedChoice(null);
    } catch (err) {
      console.error("Gagal generate skenario AI:", err);
      alert("Gagal terhubung ke AI. Menggunakan skenario bawaan.");
    } finally {
      setGeneratingAi(false);
    }
  }

  const scenario = scenariosList[scenarioIndex] || defaultScenarios[0];
  const progress = scenariosList.length > 0 ? ((scenarioIndex + 1) / scenariosList.length) * 100 : 0;

  async function recordLogToSupabase(choice: ScenarioChoice) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const scoreImpact = choice.safe ? 25 : -15;

        await supabase.from("simulation_logs").insert({
          user_id: user.id,
          scenario_id: typeof scenario.id === "number" ? scenario.id : 1,
          user_decision: `${scenario.trigger}: ${choice.label}`,
          score_impact: scoreImpact,
        });

        const { data: profile } = await supabase
          .from("profiles")
          .select("overall_score")
          .eq("id", user.id)
          .single();

        if (profile) {
          const newScore = Math.min(Math.max(profile.overall_score + scoreImpact, 0), 100);
          await supabase
            .from("profiles")
            .update({ overall_score: newScore })
            .eq("id", user.id);
        }
      }
    } catch (err) {
      console.error("Gagal mencatat log simulasi ke Supabase:", err);
    }
  }

  function handleChoice(choiceIndex: number) {
    const choice = scenario.choices[choiceIndex];
    setSelectedChoice(choiceIndex);
    setPhase("feedback");

    if (choice.safe) {
      setScore((s) => s + 25);
    }

    setResults((r) => [...r, choice.safe]);
    recordLogToSupabase(choice);
  }

  function handleNext() {
    if (scenarioIndex < scenariosList.length - 1) {
      setScenarioIndex((i) => i + 1);
      setPhase("scenario");
      setSelectedChoice(null);
    } else {
      setPhase("complete");
    }
  }

  const isSafe = selectedChoice !== null && scenario.choices[selectedChoice].safe;

  if (phase === "complete") {
    const passed = results.filter(Boolean).length;
    return (
      <div className="p-4 sm:p-8 flex items-center justify-center min-h-full">
        <div
          className="rounded-2xl p-6 sm:p-10 text-center max-w-lg w-full"
          style={{ background: "#060d1f", border: "1px solid #162035" }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl"
            style={{ background: passed >= 3 ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)" }}
          >
            {passed >= 3 ? "🛡️" : "⚠️"}
          </div>
          <h2
            className="text-2xl font-bold text-white mb-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Simulasi Selesai
          </h2>
          <p className="text-sm mb-6" style={{ color: "#7b90ad" }}>
            Anda berhasil menjawab {passed} dari {scenariosList.length} skenario dengan aman
          </p>
          <div
            className="text-4xl font-bold mb-6"
            style={{ color: passed >= 3 ? "#22c55e" : "#ef4444", fontFamily: "var(--font-display)" }}
          >
            +{score} pts
          </div>
          <div className="space-y-3">
            <button
              type="button"
              onClick={initGameScenarios}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:bg-blue-600"
              style={{ background: "#1d4ed8" }}
            >
              🔄 Mainkan Set Soal Acak Baru
            </button>
            <button
              type="button"
              onClick={generateNewScenarioWithAI}
              disabled={generatingAi}
              className="w-full py-2.5 rounded-xl text-xs font-semibold text-blue-400 border border-blue-500/30 hover:bg-blue-500/10 transition-colors"
            >
              {generatingAi ? "Membuat Skenario AI Baru..." : "✨ Buatkan Skenario AI Baru"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Progress header */}
      <div
        className="rounded-2xl p-5 sm:p-6"
        style={{ background: "#060d1f", border: "1px solid #162035" }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <span className="text-xs font-medium" style={{ color: "#526380" }}>
              Skenario {scenarioIndex + 1} dari {scenariosList.length}
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            <button
              type="button"
              onClick={initGameScenarios}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-400 border border-blue-500/30 hover:bg-blue-500/10 transition-colors"
            >
              🎲 Acak Soal
            </button>
            <button
              type="button"
              onClick={generateNewScenarioWithAI}
              disabled={generatingAi}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-400 border border-blue-500/30 hover:bg-blue-500/10 transition-colors flex items-center gap-1.5"
            >
              {generatingAi ? (
                <>
                  <div className="w-3 h-3 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
                  Generating AI...
                </>
              ) : (
                "✨ Soal AI"
              )}
            </button>
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
              style={{ background: "#0f1629" }}
            >
              <span className="text-xs" style={{ color: "#526380" }}>Skor Perolehan</span>
              <span
                className="text-sm font-bold"
                style={{ color: "#60a5fa", fontFamily: "var(--font-mono)" }}
              >
                +{score}
              </span>
            </div>
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
              style={{
                background: `${scenario.triggerColor}15`,
                border: `1px solid ${scenario.triggerColor}30`,
              }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: scenario.triggerColor }}
              />
              <span
                className="text-xs font-semibold"
                style={{ color: scenario.triggerColor }}
              >
                Pemicu: {scenario.trigger}
              </span>
            </div>
          </div>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#162035" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: "#3b82f6" }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Message card */}
        <div className="lg:col-span-7">
          <div
            className="rounded-2xl p-5 sm:p-6"
            style={{ background: "#060d1f", border: "1px solid #162035" }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: "#22c55e" }}
              />
              <span className="text-xs font-medium capitalize" style={{ color: "#526380" }}>
                {scenario.platform === "whatsapp" ? "Simulasi WhatsApp Chat" : "Simulasi Email Inbox"}
              </span>
            </div>

            {/* Platform UI Simulation */}
            <div
              className="rounded-xl overflow-hidden"
              style={{ background: scenario.platform === "whatsapp" ? "#111b21" : "#0f172a" }}
            >
              {/* Header */}
              <div
                className="flex items-center gap-3 px-4 py-3"
                style={{ background: scenario.platform === "whatsapp" ? "#202c33" : "#1e293b" }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white .flex-shrink-0 {
 flex-shrink: 0;
}"
                  style={{ background: scenario.platform === "whatsapp" ? "#1d4ed8" : "#0284c7" }}
                >
                  {scenario.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate">
                    {scenario.sender}
                  </div>
                  <div className="text-xs" style={{ color: "#8696a0" }}>
                    {scenario.platform === "whatsapp" ? "online" : "ke: saya@perusahaan.com"}
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div className="px-4 py-6 min-h-40">
                {scenario.subject && (
                  <div className="text-xs font-bold text-blue-400 mb-2 border-b border-slate-700 pb-2">
                    Subjek: {scenario.subject}
                  </div>
                )}
                <div className="flex justify-start">
                  <div
                    className="max-w-md px-4 py-3 rounded-xl rounded-tl-none text-sm text-white leading-relaxed"
                    style={{ background: scenario.platform === "whatsapp" ? "#202c33" : "#1e293b" }}
                  >
                    {scenario.message}
                    <div className="text-right mt-2">
                      <span className="text-xs" style={{ color: "#8696a0" }}>
                        {scenario.time}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Trigger explanation */}
            <div
              className="mt-4 flex items-start gap-3 px-4 py-3 rounded-xl"
              style={{
                background: `${scenario.triggerColor}08`,
                border: `1px solid ${scenario.triggerColor}25`,
              }}
            >
              <span className="text-base .flex-shrink-0 {
 flex-shrink: 0;
}" role="img" aria-label="lightbulb">💡</span>
              <div>
                <div
                  className="text-xs font-semibold mb-0.5"
                  style={{ color: scenario.triggerColor }}
                >
                  Pemicu Emosi Terdeteksi: {scenario.trigger}
                </div>
                <div className="text-xs" style={{ color: "#7b90ad" }}>
                  Perhatikan bagaimana pesan ini sengaja memicu{" "}
                  {scenario.trigger === "Urgency"
                    ? "tekanan waktu untuk memaksa tindakan terburu-buru"
                    : scenario.trigger === "Fear"
                    ? "rasa cemas akan kehilangan aset atau pembekuan akun"
                    : scenario.trigger === "Authority"
                    ? "kepatuhan buta pada pihak yang mengatasnamakan otoritas"
                    : "antusiasme atas keuntungan finansial instan"}
                  .
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action panel */}
        <div className="lg:col-span-5 space-y-4">
          <div
            className="rounded-2xl p-5 sm:p-6"
            style={{ background: "#060d1f", border: "1px solid #162035" }}
          >
            <h3
              className="text-base font-bold text-white mb-1"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Tindakan apa yang akan Anda ambil?
            </h3>
            <p className="text-xs mb-5" style={{ color: "#526380" }}>
              Pilih tindakan dengan cermat. Berpikir sejenak sebelum bertindak.
            </p>

            <div className="space-y-3">
              {scenario.choices.map((choice, i) => {
                const isSelected = selectedChoice === i;
                const showResult = phase === "feedback";

                let borderColor = "#1e2d47";
                let bg = "transparent";
                let textColor = "#94a3b8";

                if (showResult && isSelected) {
                  if (choice.safe) {
                    borderColor = "#22c55e";
                    bg = "rgba(34,197,94,0.08)";
                    textColor = "#86efac";
                  } else {
                    borderColor = "#ef4444";
                    bg = "rgba(239,68,68,0.08)";
                    textColor = "#fca5a5";
                  }
                } else if (showResult && !isSelected && choice.safe) {
                  borderColor = "#22c55e40";
                  textColor = "#4ade8080";
                }

                return (
                  <button
                    key={i}
                    type="button"
                    disabled={phase === "feedback"}
                    onClick={() => handleChoice(i)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 hover:border-blue-500/50"
                    style={{
                      border: `1px solid ${borderColor}`,
                      background: bg,
                      opacity: phase === "feedback" && !isSelected && !choice.safe ? 0.4 : 1,
                      cursor: phase === "feedback" ? "default" : "pointer",
                    }}
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold .flex-shrink-0 {
 flex-shrink: 0;
}"
                      style={{ background: "#162035", color: "#7b90ad" }}
                    >
                      {String.fromCharCode(65 + i)}
                    </div>
                    <span className="text-sm font-medium flex-1" style={{ color: textColor }}>
                      {choice.label}
                    </span>
                    {showResult && isSelected && (
                      <span className="ml-auto text-base .flex-shrink-0 {
 flex-shrink: 0;
}">
                        {choice.safe ? "✓" : "✗"}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feedback panel */}
          {phase === "feedback" && (
            <div
              className="rounded-2xl p-5 sm:p-6"
              style={{
                background: isSafe ? "rgba(34,197,94,0.06)" : "rgba(239,68,68,0.06)",
                border: `1px solid ${isSafe ? "#22c55e30" : "#ef444430"}`,
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{isSafe ? "✅" : "⚠️"}</span>
                <h4
                  className="text-sm font-bold"
                  style={{ color: isSafe ? "#86efac" : "#fca5a5", fontFamily: "var(--font-display)" }}
                >
                  {isSafe ? "Keputusan Aman!" : "Keputusan Berisiko"}
                </h4>
              </div>
              <p className="text-xs leading-relaxed mb-4" style={{ color: "#94a3b8" }}>
                {isSafe ? scenario.safeFeedback : scenario.riskyFeedback}
              </p>
              <button
                type="button"
                onClick={handleNext}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:bg-blue-600"
                style={{ background: "#1d4ed8" }}
              >
                {scenarioIndex < scenariosList.length - 1
                  ? "Lanjut ke Skenario Berikutnya →"
                  : "Lihat Hasil Akhir →"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}