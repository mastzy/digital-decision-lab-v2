import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

type Phase = "scenario" | "feedback" | "complete";

export interface ScenarioChoice {
  label: string;
  safe: boolean;
  explanation: string;
}

export interface Scenario {
  id: number;
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

const scenarios: Scenario[] = [
  {
    id: 1,
    trigger: "Urgency",
    triggerColor: "#ef4444",
    sender: "Rian",
    avatar: "R",
    time: "11:42 AM",
    platform: "whatsapp",
    message:
      "Hi, ini Rian. HP gue rusak parah. Urgent banget butuh Rp500.000 buat biaya dokter darurat. Tolong transfer ke rekening ini sekarang ya. Besok langsung gue ganti.",
    choices: [
      { label: "Transfer uangnya secara langsung", safe: false, explanation: "Anda bertindak spontan di bawah tekanan urgensi tanpa verifikasi." },
      { label: "Telepon langsung nomor pribadinya via panggilan seluler", safe: true, explanation: "Sangat baik! Telepon langsung memastikan identitas sebelum transfer." },
      { label: "Minta verifikasi identitas melalui pesan suara (voice note)", safe: true, explanation: "Langkah cerdas — selalu verifikasi suara/identitas sebelum kirim uang." },
      { label: "Abaikan atau blokir kontak tidak terverifikasi", safe: true, explanation: "Pilihan aman. Mengabaikan permintaan urgent tak dikenal melindungi Anda." },
    ],
    riskyFeedback: "Anda bertindak terburu-buru akibat pemicu urgensi. Penipu memanfaatkan cerita darurat agar korban tidak sempat berpikir jernih.",
    safeFeedback: "Insting yang luar biasa! Melakukan verifikasi melalui jalur terpisah adalah cara paling efektif menangani manipulasi urgensi.",
  },
  {
    id: 2,
    trigger: "Fear",
    triggerColor: "#f59e0b",
    sender: "BRI Alert System",
    avatar: "B",
    time: "2:15 PM",
    platform: "email",
    subject: "⚠️ PERINGATAN: Akun Anda Dibekukan Sementara",
    message:
      "Kami mendeteksi aktivitas mencurigakan pada rekening Anda. Klik tautan berikut segera untuk memulihkan akses, atau rekening Anda akan ditutup permanen dalam 2 jam: http://bri-secure-login.xyz/restore",
    choices: [
      { label: "Klik tautan segera untuk memulihkan akun", safe: false, explanation: "Tautan mengarah ke situs phishing. Bank resmi tidak pernah mengirim tautan login seperti ini." },
      { label: "Hubungi call center resmi bank secara langsung", safe: true, explanation: "Sempurna — selalu gunakan nomor kontak resmi dari situs/kartu ATM." },
      { label: "Cek status rekening via aplikasi resmi BRImo", safe: true, explanation: "Benar! Aplikasi mobile resmi menampilkan status asli akun Anda." },
      { label: "Teruskan pesan ke teman/keluarga untuk minta saran", safe: false, explanation: "Meneruskan tautan phishing berisiko menyebarkan ancaman ke orang lain." },
    ],
    riskyFeedback: "Pesan ini memanfaatkan rasa takut kehilangan akun dan ancaman waktu buatan. Domain 'bri-secure-login.xyz' adalah situs palsu.",
    safeFeedback: "Bagus sekali! Anda mengenali bahwa ancaman pemblokiran dipadu domain tidak resmi adalah pola klasik penipuan siber.",
  },
  {
    id: 3,
    trigger: "Authority",
    triggerColor: "#a78bfa",
    sender: "IT Security Dept",
    avatar: "IT",
    time: "9:03 AM",
    platform: "email",
    subject: "MANDATORY: Account Credentials Security Check",
    message:
      "Halo, ini Michael dari Tim IT Security. Kami mendeteksi celah keamanan pada akun Anda. Kirimkan kata sandi Anda sekarang agar kami bisa memperbaruinya. Wajib dibalas dalam 10 menit.",
    choices: [
      { label: "Berikan kata sandi Anda segera", safe: false, explanation: "Tim IT tidak pernah meminta kata sandi Anda — ini indikator bahaya utama." },
      { label: "Minta ID karyawan dan nomor tiket resmi terlebih dahulu", safe: true, explanation: "Cerdas — selalu verifikasi klaim otoritas melalui prosedur resmi." },
      { label: "Hubungi Tim IT melalui direktori internal perusahaan", safe: true, explanation: "Benar! Gunakan saluran komunikasi internal resmi." },
      { label: "Langsung patuh karena mengatasnamakan Tim IT", safe: false, explanation: "Tim IT resmi tidak akan meminta kata sandi mentah melalui email/chat." },
    ],
    riskyFeedback: "Penipuan berkedok otoritas sangat berbahaya. Tim IT resmi menggunakan portal terintegrasi dan tidak memintai kata sandi pengguna.",
    safeFeedback: "Luar biasa! Mengidentifikasi penyamaran otoritas palsu adalah keterampilan krusial dalam keamanan siber.",
  },
  {
    id: 4,
    trigger: "Greed",
    triggerColor: "#fbbf24",
    sender: "Promo Festival 2026",
    avatar: "🎁",
    time: "4:30 PM",
    platform: "whatsapp",
    message:
      "Selamat! Nomor WhatsApp Anda terpilih mendapatkan Grand Prize Voucher Belanja Rp10.000.000! Klaim sekarang dengan mengisi data KTP & nomor rekening di: http://promo-klaim-hadiah.win",
    choices: [
      { label: "Isi data pribadi & rekening untuk klaim", safe: false, explanation: "Membagikan data sensitif demi hadiah fiktif memicu pencurian identitas." },
      { label: "Periksa tautan dan laporkan sebagai spam", safe: true, explanation: "Kerja bagus! Hadiah tanpa alasan yang meminta data bank adalah penipuan." },
      { label: "Bayar sedikit 'biaya admin' untuk pencairan", safe: false, explanation: "Hadiah resmi tidak pernah meminta uang muka atau biaya pencairan." },
      { label: "Hapus pesan secara langsung", safe: true, explanation: "Langkah aman. Iming-iming hadiah gratis adalah jebakan pemancingan data." },
    ],
    riskyFeedback: "Anda tergiur oleh iming-iming hadiah. Penipu menggunakan tawaran fantastis untuk menjebak korban menyerahkan kredensial.",
    safeFeedback: "Hebat! Anda berhasil menahan diri dari godaan hadiah mendadak dan mengenali jebakan pencurian data.",
  },
];

export default function PhishSim() {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("scenario");
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);

  const scenario = scenarios[scenarioIndex];
  const progress = ((scenarioIndex + 1) / scenarios.length) * 100;

  // Catat hasil keputusan ke Supabase secara asynchronous
  async function recordLogToSupabase(choice: ScenarioChoice) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const scoreImpact = choice.safe ? 25 : -15;

        // 1. Simpan Log ke Tabel simulation_logs
        await supabase.from("simulation_logs").insert({
          user_id: user.id,
          scenario_id: scenario.id,
          user_decision: `${scenario.trigger}: ${choice.label}`,
          score_impact: scoreImpact,
        });

        // 2. Update overall_score di tabel profiles
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
    if (scenarioIndex < scenarios.length - 1) {
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
            Anda berhasil menjawab {passed} dari {scenarios.length} skenario dengan aman
          </p>
          <div
            className="text-4xl font-bold mb-6"
            style={{ color: passed >= 3 ? "#22c55e" : "#ef4444", fontFamily: "var(--font-display)" }}
          >
            +{score} pts
          </div>
          <button
            type="button"
            onClick={() => {
              setScenarioIndex(0);
              setPhase("scenario");
              setSelectedChoice(null);
              setScore(0);
              setResults([]);
            }}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:bg-blue-600"
            style={{ background: "#1d4ed8" }}
          >
            Coba Latihan Lagi
          </button>
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
              Skenario {scenarioIndex + 1} dari {scenarios.length}
            </span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
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
                {scenarioIndex < scenarios.length - 1
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