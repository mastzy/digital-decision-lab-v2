import React, { useState } from "react";
import logoImg from "../assets/logo.png";
import { supabase } from "../lib/supabase";

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focused, setFocused] = useState<string | null>(null);

  // Fungsi Login Asli ke Supabase
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    
    setError("");
    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        // Jika akun belum terdaftar, coba daftarkan secara otomatis
        if (authError.message.includes("Invalid login credentials")) {
          const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
          });
          
          if (signUpError) {
            setError(signUpError.message);
          } else {
            onLogin();
          }
        } else {
          setError(authError.message);
        }
      } else {
        onLogin();
      }
    } catch (err) {
      setError("Terjadi kesalahan koneksi ke server.");
    } finally {
      setLoading(false);
    }
  }

  // Fungsi Login OAuth Google Supabase
  async function handleGoogleLogin() {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
      });
      if (error) setError(error.message);
    } catch (err) {
      setError("Gagal menghubungkan ke Google Auth.");
    }
  }

  const stats = [
    { value: "12K+", label: "Simulations Run" },
    { value: "94%", label: "Threat Detection Rate" },
    { value: "5 min", label: "Avg. Session Time" },
  ];

  // Diselaraskan dengan 4 pemicu utama PRD (Urgency, Fear, Authority, Greed) + Trust
  const pillars = [
    { icon: "⚡", label: "Urgency", color: "#ef4444" },
    { icon: "😨", label: "Fear", color: "#f97316" },
    { icon: "🏅", label: "Authority", color: "#a78bfa" },
    { icon: "🎁", label: "Greed", color: "#fbbf24" },
    { icon: "🤝", label: "Trust", color: "#60a5fa" },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ fontFamily: "var(--font-body)" }}>
      {/* Left panel — branding */}
      <div
        className="hidden lg:flex flex-col w-[52%] relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #060d1f 0%, #0f1629 40%, #0c1e3d 100%)" }}
      >
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Glow orbs */}
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(circle, #3b82f6, transparent 70%)" }}
        />
        <div
          className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-8 pointer-events-none"
          style={{ background: "radial-gradient(circle, #1d4ed8, transparent 70%)" }}
        />

        <div className="relative flex flex-col h-full px-12 py-10">
          {/* Logo Resmi Desktop */}
          <div className="flex items-center gap-3">
            <img
              src={logoImg}
              alt="Digital Decision Lab Logo"
              className="h-10 w-auto object-contain"
            />
          </div>

          {/* Main copy */}
          <div className="flex-1 flex flex-col justify-center">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 w-fit"
              style={{
                background: "rgba(59,130,246,0.1)",
                border: "1px solid rgba(59,130,246,0.2)",
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span className="text-xs font-medium" style={{ color: "#93c5fd" }}>
                Behavioral Cybersecurity Platform
              </span>
            </div>

            <h1
              className="text-5xl font-extrabold text-white leading-tight mb-5"
              style={{ fontFamily: "var(--font-display)" }}
            >
              From Cyber
              <br />
              Awareness to
              <br />
              <span style={{ color: "#60a5fa" }}>Safer Decisions.</span>
            </h1>

            <p className="text-base leading-relaxed mb-10" style={{ color: "#7b90ad", maxWidth: "380px" }}>
              Understand how emotions like urgency, fear, authority, and greed influence your decisions when facing real-world phishing attacks.
            </p>

            {/* Emotional trigger pills */}
            <div className="flex flex-wrap gap-2 mb-10">
              {pillars.map((p) => (
                <div
                  key={p.label}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{
                    background: `${p.color}10`,
                    border: `1px solid ${p.color}30`,
                    color: p.color,
                  }}
                >
                  <span role="img" aria-label={p.label}>{p.icon}</span>
                  {p.label}
                </div>
              ))}
            </div>

            {/* Stats */}
            <div
              className="flex items-center gap-0 rounded-2xl overflow-hidden"
              style={{ border: "1px solid #162035" }}
            >
              {stats.map((s, i) => (
                <div
                  key={s.label}
                  className="flex-1 px-5 py-4 text-center"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    borderRight: i < stats.length - 1 ? "1px solid #162035" : "none",
                  }}
                >
                  <div
                    className="text-xl font-bold text-white"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {s.value}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "#526380" }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quote */}
          <div
            className="rounded-xl px-5 py-4"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid #162035" }}
          >
            <p className="text-xs leading-relaxed italic" style={{ color: "#7b90ad" }}>
              "Cybersecurity is not only about recognizing threats. It is about making safer decisions when emotions and manipulation are involved."
            </p>
          </div>
        </div>
      </div>

      {/* Right panel — login form */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-6 sm:px-8 py-10 relative overflow-y-auto"
        style={{ background: "#0a1322" }}
      >
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center justify-center mb-8">
          <img
            src={logoImg}
            alt="Digital Decision Lab Logo"
            className="h-10 w-auto object-contain"
          />
        </div>

        <div className="w-full max-w-sm">
          {/* Heading */}
          <div className="mb-8">
            <h2
              className="text-2xl font-bold text-white mb-1.5"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Welcome back
            </h2>
            <p className="text-sm" style={{ color: "#526380" }}>
              Sign in to continue your training
            </p>
          </div>

          {/* Social login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-medium transition-all hover:bg-[#1a2842] mb-5"
            style={{
              background: "#162035",
              border: "1px solid #1e2d47",
              color: "#94a3b8",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4" />
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853" />
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05" />
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: "#162035" }} />
            <span className="text-xs" style={{ color: "#3a4d63" }}>or sign in with email</span>
            <div className="flex-1 h-px" style={{ background: "#162035" }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold mb-1.5" style={{ color: "#7b90ad" }}>
                Email address
              </label>
              <div className="relative">
                <div
                  className="absolute left-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: focused === "email" ? "#3b82f6" : "#3a4d63" }}
                >
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                    <path d="M1 3h13v9H1V3zm0 0l6.5 5L14 3" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                  </svg>
                </div>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused(null)}
                  placeholder="you@company.com"
                  className="w-full pl-9 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: "#060d1f",
                    border: `1px solid ${focused === "email" ? "#3b82f6" : error && !email ? "#ef4444" : "#1e2d47"}`,
                    color: "#e2e8f0",
                    fontFamily: "var(--font-body)",
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="text-xs font-semibold" style={{ color: "#7b90ad" }}>
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs transition-colors hover:underline"
                  style={{ color: "#3b82f6" }}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div
                  className="absolute left-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: focused === "password" ? "#3b82f6" : "#3a4d63" }}
                >
                  <svg width="14" height="15" viewBox="0 0 14 15" fill="none" aria-hidden="true">
                    <rect x="1" y="6" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M4 6V4.5a3 3 0 0 1 6 0V6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    <circle cx="7" cy="10" r="1.2" fill="currentColor" />
                  </svg>
                </div>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: "#060d1f",
                    border: `1px solid ${focused === "password" ? "#3b82f6" : error && !password ? "#ef4444" : "#1e2d47"}`,
                    color: "#e2e8f0",
                    fontFamily: "var(--font-body)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "#3a4d63" }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                      <path d="M1 1l13 13M6.3 6.4A2 2 0 0 0 9.6 9.7M3.5 3.6C2 4.6 1 6 1 7.5c0 2.5 2.9 5 6.5 5a9.3 9.3 0 0 0 3.5-.7M5.5 2.7A9.3 9.3 0 0 1 7.5 2.5C11.1 2.5 14 5 14 7.5c0 1-.5 2-1.3 2.8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                      <path d="M1 7.5C1 5 3.9 2.5 7.5 2.5S14 5 14 7.5 11.1 12.5 7.5 12.5 1 10 1 7.5Z" stroke="currentColor" strokeWidth="1.2" />
                      <circle cx="7.5" cy="7.5" r="2" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs"
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5" }}
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                  <circle cx="6.5" cy="6.5" r="5.5" stroke="#ef4444" strokeWidth="1.2" />
                  <path d="M6.5 4v3M6.5 9h.01" stroke="#ef4444" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all mt-2 hover:bg-blue-600"
              style={{
                background: loading ? "#1e3a6e" : "#1d4ed8",
                cursor: loading ? "default" : "pointer",
              }}
            >
              {loading ? (
                <>
                  <div
                    className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: "#93c5fd", borderTopColor: "transparent" }}
                  />
                  Signing in...
                </>
              ) : (
                "Sign in to Digital Decision Lab"
              )}
            </button>
          </form>

          {/* Guest Access Option */}
          <div className="mt-4">
            <button
              type="button"
              onClick={onLogin}
              className="w-full py-2.5 rounded-xl text-xs font-semibold text-blue-400 border border-blue-500/20 hover:bg-blue-500/10 transition-colors"
            >
              Continue as Guest Demo
            </button>
          </div>

          {/* Security note */}
          <div
            className="mt-6 flex items-center justify-center gap-2"
            style={{ color: "#3a4d63" }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M6 1L10.5 3.25V6C10.5 8.75 8.5 11 6 11.5C3.5 11 1.5 8.75 1.5 6V3.25L6 1Z" stroke="currentColor" strokeWidth="1" />
              <path d="M4 6l1.5 1.5L8 4.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-xs">Protected by Supabase Auth & End-to-End Encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
}