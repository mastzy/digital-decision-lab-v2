import React from "react";
import { Screen } from "../App";

interface BehavioralProfileProps {
  onNavigate: (screen: Screen) => void;
}

export interface MetricItem {
  label: string;
  value: number;
  color: string;
  bg: string;
  border: string;
  level: "Critical" | "Moderate" | "Strong";
  desc: string;
  tip: string;
}

// Diselaraskan dengan 4 pemicu utama PRD (Urgency, Fear, Authority, Greed) + Trust
const metrics: MetricItem[] = [
  {
    label: "Urgency Resistance",
    value: 42,
    color: "#ef4444",
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.2)",
    level: "Critical",
    desc: "You act faster under time pressure and artificial deadlines.",
    tip: "Pause for 30 seconds before responding to any urgent request.",
  },
  {
    label: "Greed Resistance",
    value: 35,
    color: "#ef4444",
    bg: "rgba(239,68,68,0.06)",
    border: "rgba(239,68,68,0.15)",
    level: "Critical",
    desc: "Offers of free rewards, lotteries, or unexpected money cloud your judgment.",
    tip: "If it sounds too good to be true, it almost always is.",
  },
  {
    label: "Trust Resistance",
    value: 55,
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.2)",
    level: "Moderate",
    desc: "You tend to trust messages from familiar-looking senders or logos.",
    tip: "Verify sender identity through a separate, known official channel.",
  },
  {
    label: "Fear Resistance",
    value: 65,
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.06)",
    border: "rgba(245,158,11,0.15)",
    level: "Moderate",
    desc: "Threats of account suspension or legal action affect your decisions.",
    tip: "Fear-based messages are designed to bypass rational thinking.",
  },
  {
    label: "Authority Resistance",
    value: 78,
    color: "#22c55e",
    bg: "rgba(34,197,94,0.08)",
    border: "rgba(34,197,94,0.2)",
    level: "Strong",
    desc: "You generally question authority claims before complying.",
    tip: "Keep it up — always verify credentials through official organizational directories.",
  },
];

const recommendations = [
  {
    icon: "⏸",
    title: "Pause Before Acting",
    desc: "Create a personal rule: never act on urgent digital requests within the first 2 minutes.",
  },
  {
    icon: "📞",
    title: "Use a Second Channel",
    desc: "Verify all sensitive requests through a different communication channel from the original.",
  },
  {
    icon: "🔍",
    title: "Check the Source",
    desc: "Examine URLs, email addresses, and phone numbers before trusting them. One wrong letter changes everything.",
  },
];

function RadarChart() {
  const cx = 140;
  const cy = 140;
  const r = 100;
  const n = metrics.length || 1;

  const data = metrics.map((m, i) => ({
    ...m,
    angle: (Math.PI * 2 * i) / n - Math.PI / 2,
    safeValue: Math.min(Math.max(m.value, 0), 100),
  }));

  const levels = [0.25, 0.5, 0.75, 1];

  const getPoint = (angle: number, ratio: number) => ({
    x: cx + r * ratio * Math.cos(angle),
    y: cy + r * ratio * Math.sin(angle),
  });

  const valuePoints = data.map((d) => getPoint(d.angle, d.safeValue / 100));
  const polygonPoints = valuePoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg
      viewBox="0 0 280 280"
      className="w-full max-w-[280px] mx-auto"
      role="img"
      aria-label="Behavioral Profile Radar Chart"
    >
      {/* Grid polygon levels */}
      {levels.map((l) => (
        <polygon
          key={l}
          points={data
            .map((d) => {
              const p = getPoint(d.angle, l);
              return `${p.x},${p.y}`;
            })
            .join(" ")}
          fill="none"
          stroke="#162035"
          strokeWidth="1"
        />
      ))}
      {/* Spokes */}
      {data.map((d, i) => {
        const end = getPoint(d.angle, 1);
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
      {/* Data Polygon */}
      {data.length > 0 && (
        <polygon
          points={polygonPoints}
          fill="#3b82f6"
          fillOpacity="0.15"
          stroke="#3b82f6"
          strokeWidth="2"
        />
      )}
      {/* Data Dots */}
      {valuePoints.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="5"
          fill={data[i].color}
          stroke="#060d1f"
          strokeWidth="2"
        />
      ))}
      {/* Metric Labels */}
      {data.map((d, i) => {
        const pt = getPoint(d.angle, 1.22);
        return (
          <text
            key={i}
            x={pt.x}
            y={pt.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="9"
            fill="#7b90ad"
          >
            {d.label.replace(" Resistance", "")}
          </text>
        );
      })}
      {/* Scale indicators */}
      {[25, 50, 75, 100].map((l) => (
        <text
          key={l}
          x={cx + 3}
          y={cy - (r * l) / 100 + 3}
          fontSize="7"
          fill="#526380"
          fontFamily="DM Mono, monospace"
        >
          {l}
        </text>
      ))}
    </svg>
  );
}

export default function BehavioralProfile({ onNavigate }: BehavioralProfileProps) {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div
        className="rounded-2xl p-5 sm:p-6"
        style={{ background: "#060d1f", border: "1px solid #162035" }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2
              className="text-xl sm:text-2xl font-bold text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Your Cyber Behavior Profile
            </h2>
            <p className="text-xs sm:text-sm mt-1" style={{ color: "#7b90ad" }}>
              Based on completed simulations · Last updated today
            </p>
          </div>
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-xl"
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.25)",
            }}
          >
            <span className="text-sm" role="img" aria-label="warning">
              ⚠
            </span>
            <div>
              <div
                className="text-xs font-semibold"
                style={{ color: "#fca5a5" }}
              >
                Biggest Vulnerability
              </div>
              <div className="text-xs font-bold" style={{ color: "#ef4444" }}>
                Urgency · 42%
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar + summary */}
        <div className="lg:col-span-5 space-y-4">
          <div
            className="rounded-2xl p-5 sm:p-6"
            style={{ background: "#060d1f", border: "1px solid #162035" }}
          >
            <h3
              className="text-sm font-bold text-white mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Resistance Overview
            </h3>
            <RadarChart />

            <div
              className="mt-4 p-4 rounded-xl"
              style={{ background: "#0f1629", border: "1px solid #162035" }}
            >
              <p className="text-xs leading-relaxed" style={{ color: "#7b90ad" }}>
                You tend to make faster and riskier decisions when messages create{" "}
                <span className="text-white font-semibold">time pressure</span> or offer{" "}
                <span className="text-white font-semibold">unexpected rewards (greed)</span>.
                Authority-based manipulation is your strongest defense.
              </p>
            </div>
          </div>
        </div>

        {/* Metrics breakdown */}
        <div className="lg:col-span-7 space-y-3">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="rounded-2xl p-5"
              style={{ background: "#060d1f", border: "1px solid #162035" }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="px-2.5 py-1 rounded-lg text-xs font-bold"
                    style={{
                      background: m.bg,
                      color: m.color,
                      border: `1px solid ${m.border}`,
                    }}
                  >
                    {m.level}
                  </div>
                  <h4 className="text-sm font-semibold text-white">{m.label}</h4>
                </div>
                <span
                  className="text-xl font-bold"
                  style={{ color: m.color, fontFamily: "var(--font-display)" }}
                >
                  {m.value}%
                </span>
              </div>

              <div
                className="h-2 rounded-full overflow-hidden mb-3"
                style={{ background: "#162035" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(Math.max(m.value, 0), 100)}%`,
                    background: m.color,
                  }}
                />
              </div>

              <p className="text-xs mb-2" style={{ color: "#7b90ad" }}>
                {m.desc}
              </p>
              <div
                className="flex items-start gap-2 px-3 py-2 rounded-lg"
                style={{ background: "#0f1629" }}
              >
                <span className="text-xs flex-shrink-0" role="img" aria-label="tip">
                  💡
                </span>
                <p className="text-xs" style={{ color: "#94a3b8" }}>
                  {m.tip}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div
        className="rounded-2xl p-5 sm:p-6"
        style={{ background: "#060d1f", border: "1px solid #162035" }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h3
              className="text-base font-bold text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Personalized Recommendations
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "#526380" }}>
              Tailored to your behavioral weaknesses
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate("phishsim")}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:bg-blue-600"
            style={{ background: "#1d4ed8" }}
          >
            Train This Weakness →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {recommendations.map((rec) => (
            <div
              key={rec.title}
              className="rounded-xl p-4"
              style={{ background: "#0f1629", border: "1px solid #162035" }}
            >
              <div className="text-2xl mb-3">{rec.icon}</div>
              <h4
                className="text-sm font-semibold text-white mb-1"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {rec.title}
              </h4>
              <p className="text-xs leading-relaxed" style={{ color: "#7b90ad" }}>
                {rec.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}