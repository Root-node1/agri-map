import React, { useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaLeaf,
  FaMapMarkerAlt,
  FaSatellite,
  FaUsers,
} from "react-icons/fa";
import "./../../styles/landing.css";

// tiny seeded random so the grass looks natural but never re-shuffles on re-render
const rng = (seed) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;

const PINS = [
  { x: "16%", y: "30%", label: "Maize · Healthy", color: "#22c55e", dl: "0s" },
  {
    x: "47%",
    y: "22%",
    label: "Beans · Needs water",
    color: "#f59e0b",
    dl: "-1.1s",
    sm: true,
  },
  {
    x: "76%",
    y: "33%",
    label: "Coffee · Harvest soon",
    color: "#a855f7",
    dl: "-2.1s",
  },
];

const FEATURES = [
  {
    icon: FaMapMarkerAlt,
    title: "Map every field",
    text: "Draw plot boundaries once and keep crops, size and status in one place.",
  },
  {
    icon: FaSatellite,
    title: "See from above",
    text: "Satellite and soil insights that show which parts of your land need attention.",
  },
  {
    icon: FaUsers,
    title: "Grow together",
    text: "Bring your cooperative onto one shared view of members, land and harvests.",
  },
];

export default function Landing() {
  const hero = useRef(null);

  const blades = useMemo(() => {
    const r = rng(42);
    return Array.from({ length: 80 }, (_, i) => ({
      left: `${(i / 80) * 100 + r() * 1.2}%`,
      w: 12 + r() * 16,
      h: 38 + r() * 56,
      d: 2.4 + r() * 2.6,
      dl: -r() * 5,
      c: ["#4ade80", "#22c55e", "#86efac", "#16a34a"][Math.floor(r() * 4)],
    }));
  }, []);

  const motes = useMemo(() => {
    const r = rng(7);
    return Array.from({ length: 22 }, () => ({
      left: `${r() * 100}%`,
      s: 4 + r() * 5,
      d: 9 + r() * 10,
      dl: -r() * 18,
    }));
  }, []);

  const onMove = (e) => {
    const el = hero.current;
    if (!el) return;
    const b = el.getBoundingClientRect();
    el.style.setProperty(
      "--mx",
      ((e.clientX - b.left) / b.width - 0.5).toFixed(3),
    );
    el.style.setProperty(
      "--my",
      ((e.clientY - b.top) / b.height - 0.5).toFixed(3),
    );
  };

  return (
    <div className="lp">
      <section className="lp-hero" ref={hero} onMouseMove={onMove}>
        {/* ---------- living scene (decorative) ---------- */}
        <div className="lp-scene" aria-hidden="true">
          <div className="lp-layer" style={{ "--p": -26 }}>
            <div className="lp-sun" />
          </div>

          <div
            className="lp-cloud"
            style={{
              "--t": "12%",
              "--w": "190px",
              "--s": "70s",
              "--dl": "-20s",
            }}
          />
          <div
            className="lp-cloud"
            style={{
              "--t": "24%",
              "--w": "130px",
              "--s": "95s",
              "--dl": "-60s",
            }}
          />
          <div
            className="lp-cloud"
            style={{
              "--t": "7%",
              "--w": "240px",
              "--s": "120s",
              "--dl": "-5s",
            }}
          />

          {[
            ["16%", "22s", "-4s"],
            ["21%", "28s", "-15s"],
            ["11%", "34s", "-26s"],
          ].map(([t, s, dl], i) => (
            <svg
              key={i}
              className="lp-bird"
              style={{ "--t": t, "--s": s, "--dl": dl }}
              viewBox="0 0 40 16"
            >
              <path
                d="M1 10 Q10 0 20 10 Q30 0 39 10"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
            </svg>
          ))}

          {[
            {
              c: "h1",
              b: "30%",
              h: "46%",
              p: -10,
              d: "M0 180 C180 90 360 120 560 170 S960 230 1200 130 S1400 90 1440 110 V320 H0Z",
            },
            {
              c: "h2",
              b: "18%",
              h: "44%",
              p: -18,
              d: "M0 230 C220 150 420 210 640 200 S1040 120 1240 190 S1400 210 1440 190 V320 H0Z",
            },
            {
              c: "h3",
              b: "8%",
              h: "40%",
              p: -30,
              d: "M0 260 C260 200 480 270 720 250 S1140 190 1440 250 V320 H0Z",
            },
            {
              c: "h4",
              b: "0%",
              h: "30%",
              p: -44,
              d: "M0 300 C300 262 600 312 900 286 S1300 274 1440 296 V320 H0Z",
            },
          ].map((l) => (
            <div
              key={l.c}
              className="lp-layer lp-hill"
              style={{ "--p": l.p, "--b": l.b, "--h": l.h }}
            >
              <svg viewBox="0 0 1440 320" preserveAspectRatio="none">
                <path className={l.c} d={l.d} />
              </svg>
            </div>
          ))}

          {PINS.map((p) => (
            <div
              key={p.label}
              className={`lp-pin${p.sm ? " hide-sm" : ""}`}
              style={{ "--x": p.x, "--y": p.y, "--dl": p.dl, "--c": p.color }}
            >
              <span className="lp-pin-label">
                <i /> {p.label}
              </span>
              <span className="lp-pin-stem" />
            </div>
          ))}

          {motes.map((m, i) => (
            <span
              key={i}
              className="lp-mote"
              style={{
                left: m.left,
                "--s": `${m.s}px`,
                "--d": `${m.d}s`,
                "--dl": `${m.dl}s`,
              }}
            />
          ))}

          <div className="lp-grass">
            {blades.map((b, i) => (
              <span
                key={i}
                className="lp-blade"
                style={{
                  left: b.left,
                  "--w": `${b.w}px`,
                  "--h": `${b.h}px`,
                  "--d": `${b.d}s`,
                  "--dl": `${b.dl}s`,
                  "--c": b.c,
                }}
              />
            ))}
          </div>
        </div>

        {/* ---------- content ---------- */}
        <div className="lp-content">
          <span className="lp-badge">
            <FaLeaf aria-hidden="true" /> Smart farming for East Africa
          </span>
          <h1>
            Watch your land <span className="lp-grad">come alive</span>
          </h1>
          <p>
            Map every field, read the soil and grow together with your
            cooperative, all from one bright, simple dashboard.
          </p>
          <div className="lp-cta">
            <Link to="/onboarding" className="lp-btn lp-btn-primary">
              Get started <FaArrowRight aria-hidden="true" />
            </Link>

            <Link to="/onboarding" className="lp-btn lp-btn-ghost">
              Explore AgriMap
            </Link>
          </div>
        </div>
      </section>

      <section className="lp-features">
        <h2>Everything a growing community needs</h2>
        <div className="lp-cards">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <article key={title} className="lp-card">
              <span className="lp-card-icon">
                <Icon aria-hidden="true" />
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
