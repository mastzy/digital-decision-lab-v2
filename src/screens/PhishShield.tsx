import React, { useState } from "react";
import { supabase } from "../lib/supabase";
// Import dataset lokal JSON (hasil konversi dari CEAS_08.csv)
import localDataset from "/home/toik-zakiyudin/Downloads/Digital Decision Lab Prototype/data/ceas_data.json";

interface AnalysisResult {
  riskLevel: "high" | "medium" | "low";
  riskScore: number;
  triggers: string[];
  explanation: string;
  primaryTrigger: "Urgency" | "Fear" | "Authority" | "Greed" | "Trust" | "Safe";
}

// 1. Pencocokan ke Dataset CEAS_08 Lokal (JSON)
function analyzeWithLocalDataset(userInput: string): AnalysisResult | null {
  try {
    const cleanQuery = userInput.trim().toLowerCase();
    if (!cleanQuery || cleanQuery.length < 5) return null;

    // Pencocokan substring ke kolom body, text, atau subject di ceas_data.json
    const matchedRecord = (localDataset as any[]).find((item) => {
      const bodyText = (item.body || item.text || "").toLowerCase();
      const subjectText = (item.subject || "").toLowerCase();
      return bodyText.includes(cleanQuery) || subjectText.includes(cleanQuery);
    });

    if (!matchedRecord) return null;

    const isSpam =
      matchedRecord.label === 1 ||
      matchedRecord.label === "1" ||
      String(matchedRecord.label).toLowerCase() === "spam";

    return {
      riskLevel: isSpam ? "high" : "low",
      riskScore: isSpam ? 95 : 10,
      triggers: isSpam
        ? [
            "Tercatat dalam basis data penipuan/phishing CEAS_08 lokal",
            "Pola pesan identik dengan riwayat email berbahaya",
          ]
        : ["Terverifikasi sebagai pesan aman pada dataset CEAS_08 lokal"],
      explanation: isSpam
        ? "Pesan ini memiliki kesamaan tinggi dengan sampel email phishing terverifikasi pada basis data lokal CEAS_08. Hindari mengeklik tautan atau memberikan informasi pribadi."
        : "Pesan ini terverifikasi memiliki karakteristik komunikasi aman berdasarkan sampel dataset CEAS_08 lokal.",
      primaryTrigger: isSpam ? "Urgency" : "Safe",
    };
  } catch (err) {
    console.error("Gagal melakukan pencocokan ke dataset lokal JSON:", err);
    return null;
  }
}

// 2. Pencocokan Langsung ke Dataset CEAS_08 via Supabase
async function analyzeWithDataset(userInput: string): Promise<AnalysisResult | null> {
  try {
    const cleanQuery = userInput.trim().substring(0, 40);
    if (!cleanQuery) return null;

    // Pencocokan substring ke kolom body atau subject di tabel ceas_emails
    const { data, error } = await supabase
      .from("ceas_emails")
      .select("*")
      .or(`body.ilike.%${cleanQuery}%,subject.ilike.%${cleanQuery}%`)
      .limit(1);

    if (error || !data || data.length === 0) return null;

    const matchedRecord = data[0];
    const isSpam =
      matchedRecord.label === 1 ||
      matchedRecord.label === "1" ||
      String(matchedRecord.label).toLowerCase() === "spam";

    return {
      riskLevel: isSpam ? "high" : "low",
      riskScore: isSpam ? 95 : 10,
      triggers: isSpam
        ? [
            "Tercatat dalam basis data penipuan/phishing CEAS_08",
            "Pola pesan identik dengan riwayat email berbahaya",
          ]
        : ["Terverifikasi sebagai pesan aman pada dataset CEAS_08"],
      explanation: isSpam
        ? "Pesan ini memiliki kesamaan tinggi dengan sampel email phishing terverifikasi pada basis data CEAS_08. Hindari mengeklik tautan atau memberikan informasi pribadi."
        : "Pesan ini terverifikasi memiliki karakteristik komunikasi aman berdasarkan sampel dataset CEAS_08.",
      primaryTrigger: isSpam ? "Urgency" : "Safe",
    };
  } catch (err) {
    console.error("Gagal melakukan pencocokan ke dataset Supabase:", err);
    return null;
  }
}

// 3. Analisis AI Menggunakan OpenAI API
async function analyzeWithOpenAI(userInput: string): Promise<AnalysisResult | null> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) return null;

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
            content: `Kamu adalah pakar analisis keamanan siber. Analisis pesan berikut untuk mendeteksi penipuan/phishing.
Tentukan format output HANYA dalam JSON valid tanpa markdown/backticks:
{
  "riskLevel": "high" | "medium" | "low",
  "riskScore": angka 0-100,
  "primaryTrigger": "Urgency" | "Fear" | "Authority" | "Greed" | "Trust" | "Safe",
  "triggers": ["array indikator bahaya dalam Bahasa Indonesia"],
  "explanation": "penjelasan ringkas bahasa awam dalam Bahasa Indonesia"
}`,
          },
          { role: "user", content: userInput },
        ],
      }),
    });

    const data = await response.json();
    const rawContent = data.choices[0].message.content.trim();
    const cleanJson = rawContent.replace(/^```json/, "").replace(/```$/, "").trim();
    return JSON.parse(cleanJson) as AnalysisResult;
  } catch (err) {
    console.error("Gagal melakukan analisis OpenAI API:", err);
    return null;
  }
}

// 4. Pemindaian URL Menggunakan VirusTotal API
async function analyzeWithVirusTotal(urlToScan: string): Promise<AnalysisResult | null> {
  const apiKey = import.meta.env.VITE_VIRUSTOTAL_API_KEY;
  if (!apiKey) return null;

  try {
    const formData = new FormData();
    formData.append("url", urlToScan);

    const scanRes = await fetch("https://www.virustotal.com/api/v3/urls", {
      method: "POST",
      headers: { "x-apikey": apiKey },
      body: formData,
    });
    const scanData = await scanRes.json();
    const analysisId = scanData.data.id;

    const resultRes = await fetch(`https://www.virustotal.com/api/v3/analyses/${analysisId}`, {
      headers: { "x-apikey": apiKey },
    });
    const resultData = await resultRes.json();
    const stats = resultData.data.attributes.stats;

    const isMalicious = stats.malicious > 0;
    const isSuspicious = stats.suspicious > 0;

    return {
      riskLevel: isMalicious ? "high" : isSuspicious ? "medium" : "low",
      riskScore: isMalicious ? 90 : isSuspicious ? 50 : 10,
      triggers: isMalicious
        ? [`Terdeteksi berbahaya oleh ${stats.malicious} mesin antivirus VirusTotal`]
        : ["Domain tidak terdaftar dalam basis data berbahaya global"],
      explanation: isMalicious
        ? "Tautan ini telah dilaporkan secara global sebagai situs berbahaya atau phishing."
        : "Tautan ini terverifikasi bersih oleh basis data keamanan global VirusTotal.",
      primaryTrigger: isMalicious ? "Fear" : "Safe",
    };
  } catch (err) {
    console.error("Gagal melakukan analisis VirusTotal API:", err);
    return null;
  }
}

// 5. Fallback Rule-Based Scanner Lokal
function analyzeTextLocal(text: string): AnalysisResult {
  const lower = text.toLowerCase();
  const triggers: string[] = [];
  let riskScore = 0;

  const urgencyWords = ["urgent", "immediately", "now", "asap", "hurry", "quick", "right away", "deadline", "expires", "within", "segera", "sekarang", "batas waktu"];
  const fearWords = ["suspended", "blocked", "closed", "unauthorized", "compromised", "breach", "hacked", "violation", "penalty", "diblokir", "diretas", "sanksi", "pidana", "pembekuan"];
  const greedWords = ["won", "winner", "prize", "free", "gift", "reward", "congratulations", "selected", "lucky", "hadiah", "gratis", "menang", "voucher", "cashback", "klaim"];
  const authorityWords = ["bank", "government", "police", "irs", "microsoft", "apple", "amazon", "official", "ceo", "manager", "it department", "bri", "bca", "mandiri", "bni", "pajak", "polri", "kurir"];

  const linkPatterns = /http[s]?:\/\/[^\s]+/g;
  const apkPattern = /\.apk(\?|\s|$)/i;
  const suspiciousLinks = text.match(linkPatterns);

  if (urgencyWords.some((w) => lower.includes(w))) {
    triggers.push("Creates urgency or time pressure (Tekanan Waktu)");
    riskScore += 25;
  }
  if (fearWords.some((w) => lower.includes(w))) {
    triggers.push("Uses fear of loss or consequences (Rasa Takut)");
    riskScore += 25;
  }
  if (greedWords.some((w) => lower.includes(w))) {
    triggers.push("Offers unexpected reward or prize (Iming-iming Hadiah/Greed)");
    riskScore += 25;
  }
  if (authorityWords.some((w) => lower.includes(w))) {
    triggers.push("Impersonates authority or trusted brand (Pencatutan Otoritas)");
    riskScore += 15;
  }
  if (suspiciousLinks) {
    triggers.push("Contains external link requiring action (Tautan Eksternal)");
    riskScore += 20;
  }
  if (apkPattern.test(lower)) {
    triggers.push("Contains risky Android Package executable file (.APK Malware)");
    riskScore += 40;
  }
  if (lower.includes("password") || lower.includes("transfer") || lower.includes("send") || lower.includes("otp") || lower.includes("pin")) {
    triggers.push("Requests sensitive credential action or fund transfer");
    riskScore += 20;
  }
  if (lower.includes("verify") || lower.includes("confirm") || lower.includes("click") || lower.includes("klik")) {
    triggers.push("Requests immediate action via link or button");
    riskScore += 15;
  }

  riskScore = Math.min(riskScore, 100);

  const riskLevel: "high" | "medium" | "low" =
    riskScore >= 60 ? "high" : riskScore >= 25 ? "medium" : "low";

  const primaryTrigger: "Urgency" | "Fear" | "Authority" | "Greed" | "Trust" | "Safe" =
    urgencyWords.some((w) => lower.includes(w))
      ? "Urgency"
      : fearWords.some((w) => lower.includes(w))
      ? "Fear"
      : greedWords.some((w) => lower.includes(w))
      ? "Greed"
      : authorityWords.some((w) => lower.includes(w))
      ? "Authority"
      : riskLevel === "low"
      ? "Safe"
      : "Trust";

  const explanations: Record<string, string> = {
    high: "Tingkat Bahaya Tinggi: Pesan ini menunjukkan indikasi kuat manipulasi psikologis siber. Pesan ini dirancang untuk memicu reaksi emosional agar Anda langsung bertindak tanpa berpikir panjang. Jangan klik tautan atau mengunduh file apapun.",
    medium: "Tingkat Waspada: Pesan ini memiliki beberapa karakteristik bahasa persuasif atau tautan eksternal mencurigakan. Lakukan verifikasi secara terpisah melalui saluran resmi sebelum bertindak.",
    low: "Tingkat Aman: Tidak terdeteksi pemicu manipulasi siber yang berbahaya secara langsung. Namun tetap berhati-hati dan selalu periksa alamat pengirim pesan.",
  };

  return {
    riskLevel,
    riskScore,
    triggers,
    explanation: explanations[riskLevel],
    primaryTrigger,
  };
}

const exampleMessages = [
  "URGENT: Akun BRI Anda dibekukan! Silakan verifikasi ulang melalui tautan berikut: http://bri-restore-account.xyz",
  "Selamat! Anda terpilih memenangkan saldo e-wallet Rp2.500.000! Klaim voucher gratis di http://hadiah-kupon.win/claim",
  "SURAT UNDANGAN PERNIKAHAN.apk - Mohon hadir dan cek detail lokasi pada file APK terlampir.",
];

export default function PhishShield() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  async function handleAnalyze() {
    if (!input.trim()) return;
    setAnalyzing(true);
    setResult(null);

    let res: AnalysisResult | null = null;

    // Prioritas 1: Cek Dataset CEAS_08 Lokal (JSON)
    res = analyzeWithLocalDataset(input);

    // Prioritas 2: Cek Dataset CEAS_08 di Supabase
    if (!res) {
      res = await analyzeWithDataset(input);
    }

    // Prioritas 3: VirusTotal API (jika mengandung URL)
    if (!res) {
      const containsUrl = /http[s]?:\/\/[^\s]+/.test(input);
      if (containsUrl) {
        const urlMatch = input.match(/http[s]?:\/\/[^\s]+/);
        if (urlMatch) {
          res = await analyzeWithVirusTotal(urlMatch[0]);
        }
      }
    }

    // Prioritas 4: OpenAI API
    if (!res) {
      res = await analyzeWithOpenAI(input);
    }

    // Prioritas 5: Local Rule-Based Scanner
    if (!res) {
      res = analyzeTextLocal(input);
    }

    setResult(res);
    setAnalyzing(false);

    // Catat log ke Supabase
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("phishshield_logs").insert({
          user_id: user.id,
          scanned_content: input.substring(0, 150),
          risk_level: res.riskLevel,
          analysis_result: JSON.stringify(res.triggers),
        });
      }
    } catch (err) {
      console.error("Gagal mencatat log PhishShield ke Supabase:", err);
    }
  }

  const riskConfig = {
    high: {
      label: "HIGH RISK (BAHAYA)",
      color: "#ef4444",
      bg: "rgba(239,68,68,0.08)",
      border: "rgba(239,68,68,0.3)",
      meterColor: "#ef4444",
      icon: "🚨",
      tagBg: "rgba(239,68,68,0.12)",
    },
    medium: {
      label: "MEDIUM RISK (WASPADA)",
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.08)",
      border: "rgba(245,158,11,0.3)",
      meterColor: "#f59e0b",
      icon: "⚠️",
      tagBg: "rgba(245,158,11,0.12)",
    },
    low: {
      label: "LOW RISK (AMAN)",
      color: "#22c55e",
      bg: "rgba(34,197,94,0.08)",
      border: "rgba(34,197,94,0.3)",
      meterColor: "#22c55e",
      icon: "✅",
      tagBg: "rgba(34,197,94,0.12)",
    },
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div
        className="rounded-2xl p-5 sm:p-8"
        style={{ background: "#060d1f", border: "1px solid #162035" }}
      >
        <h2
          className="text-xl sm:text-2xl font-bold text-white mb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Check Before You Trust
        </h2>
        <p className="text-xs sm:text-sm" style={{ color: "#7b90ad" }}>
          Paste a suspicious message or link and understand the emotional manipulation techniques being used.
        </p>

        {/* Input */}
        <div className="mt-6">
          <label htmlFor="phishshield-input" className="sr-only">Suspicious message input</label>
          <textarea
            id="phishshield-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste a suspicious message, email, or link here..."
            rows={4}
            className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none transition-all focus:border-blue-500"
            style={{
              background: "#0f1629",
              border: "1px solid #1e2d47",
              color: "#e2e8f0",
              fontFamily: "var(--font-body)",
            }}
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3">
          <div className="flex gap-2 flex-wrap">
            {exampleMessages.map((msg, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setInput(msg)}
                className="text-xs px-3 py-1.5 rounded-lg transition-colors hover:bg-[#1f2e4a]"
                style={{
                  background: "#162035",
                  color: "#7b90ad",
                  border: "1px solid #1e2d47",
                }}
              >
                Example {i + 1}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={!input.trim() || analyzing}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all flex items-center justify-center gap-2 hover:bg-blue-600"
            style={{
              background: input.trim() ? "#1d4ed8" : "#1e2d47",
              color: input.trim() ? "white" : "#526380",
              cursor: input.trim() ? "pointer" : "default",
            }}
          >
            {analyzing ? (
              <>
                <div
                  className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
                  style={{ borderColor: "#60a5fa", borderTopColor: "transparent" }}
                />
                Analyzing with AI & Dataset...
              </>
            ) : (
              "Analyze Message →"
            )}
          </button>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Risk summary */}
          <div className="lg:col-span-4 space-y-4">
            {/* Risk level */}
            <div
              className="rounded-2xl p-6 text-center"
              style={{
                background: riskConfig[result.riskLevel].bg,
                border: `1px solid ${riskConfig[result.riskLevel].border}`,
              }}
            >
              <div className="text-4xl mb-3">{riskConfig[result.riskLevel].icon}</div>
              <div
                className="text-xs font-bold tracking-widest mb-1"
                style={{
                  color: riskConfig[result.riskLevel].color,
                  fontFamily: "var(--font-mono)",
                }}
              >
                {riskConfig[result.riskLevel].label}
              </div>
              <div
                className="text-5xl font-black mb-1"
                style={{
                  color: riskConfig[result.riskLevel].color,
                  fontFamily: "var(--font-display)",
                }}
              >
                {result.riskScore}
              </div>
              <div className="text-xs" style={{ color: "#526380" }}>
                out of 100 Risk Score
              </div>

              {/* Meter */}
              <div
                className="mt-4 h-3 rounded-full overflow-hidden"
                style={{ background: "#162035" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${result.riskScore}%`,
                    background: `linear-gradient(90deg, #22c55e, ${result.riskScore > 50 ? "#ef4444" : "#f59e0b"})`,
                  }}
                />
              </div>
              <div className="flex justify-between mt-1 text-xs">
                <span style={{ color: "#22c55e" }}>Safe</span>
                <span style={{ color: "#ef4444" }}>Danger</span>
              </div>
            </div>

            {/* Primary trigger */}
            <div
              className="rounded-2xl p-5"
              style={{ background: "#060d1f", border: "1px solid #162035" }}
            >
              <h4
                className="text-xs font-bold text-white mb-3"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Primary Manipulation Trigger
              </h4>
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{
                  background: riskConfig[result.riskLevel].tagBg,
                  border: `1px solid ${riskConfig[result.riskLevel].border}`,
                }}
              >
                <div
                  className="w-2 h-2 rounded-full .flex-shrink-0 {
 flex-shrink: 0;
}"
                  style={{ background: riskConfig[result.riskLevel].color }}
                />
                <span
                  className="text-sm font-bold"
                  style={{ color: riskConfig[result.riskLevel].color }}
                >
                  {result.primaryTrigger}
                </span>
              </div>
              <p className="text-xs mt-3 leading-relaxed" style={{ color: "#7b90ad" }}>
                This message primarily exploits your <strong style={{ color: "#94a3b8" }}>{result.primaryTrigger.toLowerCase()}</strong> response to influence your decision.
              </p>
            </div>
          </div>

          {/* Detailed findings */}
          <div className="lg:col-span-8 space-y-4">
            {/* Explanation */}
            <div
              className="rounded-2xl p-5 sm:p-6"
              style={{ background: "#060d1f", border: "1px solid #162035" }}
            >
              <h3
                className="text-sm font-bold text-white mb-3"
                style={{ fontFamily: "var(--font-display)" }}
              >
                What's happening in this message
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
                {result.explanation}
              </p>
            </div>

            {/* Warning signs */}
            <div
              className="rounded-2xl p-5 sm:p-6"
              style={{ background: "#060d1f", border: "1px solid #162035" }}
            >
              <h3
                className="text-sm font-bold text-white mb-4"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Detected Warning Signs
              </h3>
              {result.triggers.length === 0 ? (
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}
                >
                  <span role="img" aria-label="safe">✅</span>
                  <span className="text-sm" style={{ color: "#86efac" }}>
                    No manipulation triggers detected
                  </span>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {result.triggers.map((trigger, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl"
                      style={{
                        background: "rgba(239,68,68,0.06)",
                        border: "1px solid rgba(239,68,68,0.15)",
                      }}
                    >
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center .flex-shrink-0 {
 flex-shrink: 0;
} text-xs font-bold"
                        style={{ background: "rgba(239,68,68,0.2)", color: "#ef4444" }}
                      >
                        !
                      </div>
                      <span className="text-sm" style={{ color: "#fca5a5" }}>
                        {trigger}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Advice */}
            <div
              className="rounded-2xl p-5 sm:p-6"
              style={{ background: "#060d1f", border: "1px solid #162035" }}
            >
              <h3
                className="text-sm font-bold text-white mb-4"
                style={{ fontFamily: "var(--font-display)" }}
              >
                What should you do?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { icon: "🛑", title: "Don't act immediately", desc: "Take at least 5 minutes before responding to any urgent request." },
                  { icon: "📞", title: "Verify independently", desc: "Contact the sender through a known, official channel — not the one in the message." },
                  { icon: "🗑", title: "Report and delete", desc: "Report phishing messages to your IT team or the relevant platform." },
                ].map((a) => (
                  <div
                    key={a.title}
                    className="p-4 rounded-xl"
                    style={{ background: "#0f1629", border: "1px solid #162035" }}
                  >
                    <div className="text-xl mb-2">{a.icon}</div>
                    <div
                      className="text-xs font-semibold text-white mb-1"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {a.title}
                    </div>
                    <div className="text-xs" style={{ color: "#7b90ad" }}>
                      {a.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!result && !analyzing && (
        <div
          className="rounded-2xl p-8 sm:p-12 text-center"
          style={{ background: "#060d1f", border: "1px solid #162035" }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: "#162035" }}
          >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <path
                d="M14 2L24 7V14C24 20 19.5 24.5 14 25.5C8.5 24.5 4 20 4 14V7L14 2Z"
                stroke="#3b82f6"
                strokeWidth="1.8"
                fill="rgba(59,130,246,0.08)"
              />
              <path d="M10 14l3 3 5-6" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h3
            className="text-base font-bold text-white mb-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Paste a message above to analyze it
          </h3>
          <p className="text-sm" style={{ color: "#526380" }}>
            PhishShield detects emotional manipulation techniques in real-time — no technical knowledge required.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-6">
            {["Urgency", "Fear", "Authority", "Greed", "Trust"].map((t) => (
              <div
                key={t}
                className="px-3 py-1.5 rounded-full text-xs font-medium"
                style={{ background: "#162035", color: "#7b90ad", border: "1px solid #1e2d47" }}
              >
                {t}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}