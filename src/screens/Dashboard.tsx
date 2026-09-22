import React from "react";
import { Screen } from "../App";

interface DashboardProps {
  onNavigate: (screen: Screen) => void;
  overallScore?: number;
  simCount?: number;
  recentActivity?: ActivityItem[];
}

export interface BehaviorDataItem {
  label: string;
  value: number;
  color: string;
  bg: string;
}

export interface ActivityItem {
  label: string;
  time: string;
  status: "safe" | "danger" | "caution";
  score: string;
}

// Data diselaraskan persis dengan 4 pemicu utama PRD (Urgency, Fear, Authority, Greed) + Trust
const behaviorData: BehaviorDataItem[] = [
  { label: "Urgency Resistance", value: 42, color: "#ef4444", bg: "#450a0a" },
  { label: "Fear Resistance", value: 65, color: "#f59e0b", bg: "#431407" },
  { label: "Authority Resistance", value: 78, color: "#22c55e", bg: "#052e16" },
  { label: "Greed Resistance", value: 35, color: "#ef4444", bg: "#450a0a" },
  { label: "Trust Resistance", value: 55, color: "#f59e0b", bg: "#431407" },
];

const defaultRecentActivity: ActivityItem[] = [
  { label: "Completed WhatsApp Fraud Sim", time: "2h ago", status: "safe", score: "+12 pts" },
  { label: "PhishShield analysis: Bank alert", time: "5h ago", status: "danger", score: "High Risk" },
  { label: "Authority impersonation training", time: "1d ago", status: "caution", score: "+8 pts" },
  { label: "Urgency resistance drill", time: "2d ago", status: "safe", score: "+15 pts" },
];

function RadarChart({ data }: { data: BehaviorDataItem[] }) {
  const cx = 110;
  const cy = 110;
  const r = 75;
  const n = data.length || 1;
  const angles = data.map((_, i) => (Math.PI * 2 * i) / n - Math.PI / 2);
  const levels = [0.25, 0.5, 0.75, 1];

  const getPoint = (angle: number, ratio: number) => ({
    x: cx + r * ratio * Math.cos(angle),
    y: cy + r * ratio * Math.sin(angle),
  });

  const valuePoints = data.map((d) =>
    getPoint(angles[data.indexOf(d)], Math.min(Math.max(d.value, 0), 100) / 100)
  );
  const polygonPoints = valuePoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg
      viewBox="0 0 220 220"
      className="w-full max-w-[220px] mx-auto"
      role="img"
      aria-label="Behavioral Vulnerability Radar Chart"
    >
      {/* Grid circles */}
      {levels.map((l) => (
        <polygon
          key={l}
          points={angles
            .map((a) => {
              const p = getPoint(a, l);
              return `${p.x},${p.y}`;
            })
            .join(" ")}
          fill="none"
          stroke="#162035"
          strokeWidth="1"
        />
      ))}

      {/* Spokes */}
      {angles.map((a, i) => {
        const end = getPoint(a, 1);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={end.x}
            y2={end.y}
            stroke="#162035"
            strokeWidth="1"
          />
        );
      })}

      {/* Value polygon */}
      {data.length > 0 && (
        <polygon
          points={polygonPoints}
          fill="#3b82f6"
          fillOpacity="0.15"
          stroke="#3b82f6"
          strokeWidth="1.5"
        />
      )}

      {/* Dots */}
      {valuePoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#3b82f6" />
      ))}

      {/* Labels */}
      {data.map((d, i) => {
        const labelPt = getPoint(angles[i], 1.28);
        return (
          <text
            key={i}
            x={labelPt.x}
            y={labelPt.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="7.5"
            fill="#7b90ad"
          >
            {d.label.split(" ")[0]}
          </text>
        );
      })}
    </svg>
  );
}

export default function Dashboard({
  onNavigate,
  overallScore = 78,
  simCount = 12,
  recentActivity = defaultRecentActivity,
}: DashboardProps) {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Hero */}
      <div
        className="rounded-2xl p-5 sm:p-7 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #0f2347 0%, #162035 60%, #0f1629 100%)",
        }}
      >
        <div
          className="absolute top-0 right-0 w-80 h-full opacity-5 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at top right, #3b82f6 0%, transparent 70%)",
          }}
        />
        <div className="relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2
                className="text-2xl sm:text-3xl font-bold text-white mb-1"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Digital Decision Lab
              </h2>
              <p className="text-xs sm:text-sm" style={{ color: "#7b90ad" }}>
                Understand your cyber behavior. Make safer decisions.
              </p>
            </div>
            <div
              className="w-full sm:w-auto text-left sm:text-right px-4 py-3 rounded-xl flex sm:block justify-between items-center"
              style={{
                background: "rgba(59,130,246,0.12)",
                border: "1px solid rgba(59,130,246,0.2)",
              }}
            >
              <div>
                <div
                  className="text-2xl sm:text-3xl font-bold"
                  style={{
                    color: "#60a5fa",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  {overallScore}
                </div>
                <div className="text-xs" style={{ color: "#526380" }}>
                  Overall Readiness Score
                </div>
              </div>
              <div className="text-xs sm:mt-0.5" style={{ color: "#3b82f6" }}>
                / 100
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-6">
            {[
              {
                label: "Simulations Done",
                value: `${simCount}`,
                sub: "completed session",
                color: "#60a5fa",
              },
              {
                label: "Current Streak",
                value: "5 days",
                sub: "keep going!",
                color: "#fcd34d",
              },
              {
                label: "Rank",
                value: "#23",
                sub: "top 8% globally",
                color: "#86efac",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl px-4 py-3"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div
                  className="text-xl font-bold"
                  style={{
                    color: stat.color,
                    fontFamily: "var(--font-display)",
                  }}
                >
                  {stat.value}
                </div>
                <div className="text-xs font-medium text-white mt-0.5">
                  {stat.label}
                </div>
                <div className="text-xs" style={{ color: "#526380" }}>
                  {stat.sub}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Behavioral Profile */}
        <div
          className="lg:col-span-5 rounded-2xl p-5 sm:p-6 flex flex-col justify-between"
          style={{ background: "#060d1f", border: "1px solid #162035" }}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3
                  className="text-sm font-bold text-white"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Behavioral Vulnerability Profile
                </h3>
                <p className="text-xs mt-0.5" style={{ color: "#526380" }}>
                  Emotional resistance scores
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate("profile")}
                className="text-xs px-3 py-1.5 rounded-lg transition-colors hover:bg-blue-500/20"
                style={{
                  color: "#60a5fa",
                  background: "rgba(59,130,246,0.1)",
                  border: "1px solid rgba(59,130,246,0.2)",
                }}
              >
                Full report →
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <RadarChart data={behaviorData} />
              <div className="w-full sm:flex-1 space-y-2.5">
                {behaviorData.map((d) => (
                  <div key={d.label}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs" style={{ color: "#7b90ad" }}>
                        {d.label.replace(" Resistance", "")}
                      </span>
                      <span
                        className="text-xs font-semibold"
                        style={{
                          color: d.color,
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {d.value}%
                      </span>
                    </div>
                    <div
                      className="h-1.5 rounded-full overflow-hidden"
                      style={{ background: "#162035" }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(Math.max(d.value, 0), 100)}%`,
                          background: d.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Vulnerability callout */}
          <div
            className="mt-4 flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm"
              style={{ background: "rgba(239,68,68,0.15)" }}
            >
              ⚠
            </div>
            <div>
              <div
                className="text-xs font-semibold"
                style={{ color: "#fca5a5" }}
              >
                Biggest Vulnerability: Urgency
              </div>
              <div className="text-xs" style={{ color: "#7b90ad" }}>
                You act faster under time pressure — 42% resistance
              </div>
            </div>
          </div>
        </div>

        {/* Action cards */}
        <div className="lg:col-span-4 space-y-4">
          {/* PhishSim */}
          <div
            className="rounded-2xl p-5 sm:p-6 cursor-pointer group transition-all duration-200 hover:border-blue-500/50"
            style={{
              background: "linear-gradient(135deg, #0f2347, #162035)",
              border: "1px solid #1e3a5f",
            }}
            onClick={() => onNavigate("phishsim")}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: "#1d4ed8" }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M3 4h14v10a2 2 0 01-2 2H5a2 2 0 01-2-2V4z"
                    stroke="white"
                    strokeWidth="1.4"
                  />
                  <path
                    d="M3 4l7 6 7-6"
                    stroke="white"
                    strokeWidth="1.4"
                    strokeLinejoin="round"
                  />
                  <circle cx="15" cy="5" r="3" fill="#ef4444" />
                </svg>
              </div>
              <span
                className="text-xs px-2 py-1 rounded-full font-semibold"
                style={{
                  background: "rgba(59,130,246,0.15)",
                  color: "#60a5fa",
                }}
              >
                3 new
              </span>
            </div>
            <h3
              className="text-base font-bold text-white mb-1"
              style={{ fontFamily: "var(--font-display)" }}
            >
              PhishSim
            </h3>
            <p className="text-xs mb-4" style={{ color: "#7b90ad" }}>
              Test your responses to real-world phishing and social engineering
              scenarios.
            </p>
            <button
              type="button"
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:bg-blue-600"
              style={{ background: "#1d4ed8" }}
            >
              Start Simulation →
            </button>
          </div>

          {/* PhishShield */}
          <div
            className="rounded-2xl p-5 sm:p-6 cursor-pointer group transition-all duration-200 hover:border-green-500/50"
            style={{
              background: "linear-gradient(135deg, #0a1f1a, #0f1a14)",
              border: "1px solid #1a3a2a",
            }}
            onClick={() => onNavigate("phishshield")}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: "#15803d" }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M10 2L17 5.5V10C17 14.5 13.5 17.5 10 18C6.5 17.5 3 14.5 3 10V5.5L10 2Z"
                    stroke="white"
                    strokeWidth="1.4"
                  />
                  <path
                    d="M7 10l2 2 4-4"
                    stroke="white"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span
                className="text-xs px-2 py-1 rounded-full font-semibold"
                style={{
                  background: "rgba(34,197,94,0.12)",
                  color: "#86efac",
                }}
              >
                Rule-Based
              </span>
            </div>
            <h3
              className="text-base font-bold text-white mb-1"
              style={{ fontFamily: "var(--font-display)" }}
            >
              PhishShield
            </h3>
            <p className="text-xs mb-4" style={{ color: "#7b90ad" }}>
              Check any suspicious message or link before you act on it.
            </p>
            <button
              type="button"
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:bg-green-700"
              style={{ background: "#15803d" }}
            >
              Check a Message →
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div
          className="lg:col-span-3 rounded-2xl p-5 sm:p-6 flex flex-col justify-between"
          style={{ background: "#060d1f", border: "1px solid #162035" }}
        >
          <div>
            <h3
              className="text-sm font-bold text-white mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Recent Activity
            </h3>
            <div className="space-y-3">
              {recentActivity.map((item, i) => {
                const statusColors: Record<string, string> = {
                  safe: "#22c55e",
                  danger: "#ef4444",
                  caution: "#f59e0b",
                };
                return (
                  <div
                    key={i}
                    className="flex items-start gap-3 pb-3 border-b last:border-0"
                    style={{ borderColor: "#162035" }}
                  >
                    <div
                      className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                      style={{
                        background:
                          statusColors[item.status] || statusColors.safe,
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white font-medium leading-snug">
                        {item.label}
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "#526380" }}
                      >
                        {item.time}
                      </p>
                    </div>
                    <span
                      className="text-xs font-semibold flex-shrink-0"
                      style={{
                        color:
                          statusColors[item.status] || statusColors.safe,
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {item.score}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            className="mt-4 p-3 rounded-xl text-center"
            style={{ background: "#0f1629", border: "1px solid #162035" }}
          >
            <p className="text-xs font-semibold" style={{ color: "#7b90ad" }}>
              Daily Challenge
            </p>
            <p className="text-xs text-white mt-1">
              Spot 3 urgency triggers today
            </p>
            <div
              className="mt-2 h-1.5 rounded-full overflow-hidden"
              style={{ background: "#162035" }}
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: "67%", background: "#3b82f6" }}
              />
            </div>
            <p className="text-xs mt-1" style={{ color: "#526380" }}>
              2/3 completed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}