import { useState } from "react";
import API_BASE_URL from "../apiBase";

// ─── Design Tokens (mirrors ModelOverviewDashboard & StudentPage) ─────────────
const IIEE = {
  navy:       "#0B1437",
  navyMid:    "#0F1C4D",
  gold:       "#F5C518",
  goldGlow:   "rgba(245,197,24,0.18)",
  goldBorder: "rgba(245,197,24,0.35)",
  white:      "#F8FAFC",
  muted:      "#94A3B8",
  dimText:    "#64748B",
  cardBg:     "rgba(15,28,77,0.72)",
  cardBorder: "rgba(245,197,24,0.18)",
  passGreen:  "#22C55E",
  failRed:    "#EF4444",
  amber:      "#F59E0B",
  blue:       "#38BDF8",
  teal:       "#2DD4BF",
  indigo:     "#818CF8",
  orange:     "#FB923C",
};

// ─── Section Definitions ──────────────────────────────────────────────────────
const SECTIONS = [
  {
    id: "knowledge",
    label: "Knowledge Self-Assessment",
    icon: "📚",
    color: { accent: "#3b82f6", bg: "rgba(59,130,246,0.07)", border: "rgba(59,130,246,0.2)", text: "#93c5fd" },
    fields: [
      { key: "KN1",  label: "Strong math foundation for EE" },
      { key: "KN2",  label: "Circuit analysis & network theorems" },
      { key: "KN3",  label: "Electrical machines & transformers" },
      { key: "KN4",  label: "Power systems & energy management" },
      { key: "KN5",  label: "Electronics & semiconductor devices" },
      { key: "KN6",  label: "Electrical laws, codes & standards" },
      { key: "KN7",  label: "Formula recall & application" },
      { key: "KN8",  label: "All major board exam subjects studied" },
      { key: "KN9",  label: "Understands theory, not just formulas" },
      { key: "KN10", label: "Familiar with EE technical terms" },
      { key: "KN11", label: "Interprets electrical diagrams & schematics" },
      { key: "KN12", label: "Aware of exam scope & coverage" },
    ],
  },
  {
    id: "problem_solving",
    label: "Problem Solving Confidence",
    icon: "🧠",
    color: { accent: "#8b5cf6", bg: "rgba(139,92,246,0.07)", border: "rgba(139,92,246,0.2)", text: "#c4b5fd" },
    fields: [
      { key: "PS1",  label: "Analyze complex EE problems" },
      { key: "PS2",  label: "Identify most efficient solution method" },
      { key: "PS3",  label: "Select appropriate formula/concept" },
      { key: "PS4",  label: "Apply theory to practical scenarios" },
      { key: "PS5",  label: "Solve within exam time constraints" },
      { key: "PS6",  label: "Break down complex problems" },
      { key: "PS7",  label: "Verify answers & check errors" },
      { key: "PS8",  label: "Handle multi-step problems" },
      { key: "PS9",  label: "Maintain accuracy under pressure" },
      { key: "PS10", label: "Confident with unseen problems" },
      { key: "PS11", label: "Confident analyzing board exam problems" },
      { key: "PS12", label: "Effective problem-solving strategies" },
    ],
  },
  {
    id: "motivation",
    label: "Motivation & Study Discipline",
    icon: "🔥",
    color: { accent: "#f59e0b", bg: "rgba(245,158,11,0.07)", border: "rgba(245,158,11,0.2)", text: "#fcd34d" },
    fields: [
      { key: "MT1", label: "Motivated to pass the EE exam" },
      { key: "MT2", label: "Clear goal for passing" },
      { key: "MT3", label: "Sets specific study goals & targets" },
      { key: "MT4", label: "Follows structured study schedule" },
      { key: "MT5", label: "Manages time effectively" },
      { key: "MT6", label: "Maintains discipline when unmotivated" },
      { key: "MT7", label: "Monitors & adjusts study plan" },
      { key: "MT8", label: "Committed to necessary effort" },
    ],
  },
  {
    id: "mental_health",
    label: "Mental Health & Wellbeing",
    icon: "🧘",
    color: { accent: "#10b981", bg: "rgba(16,185,129,0.07)", border: "rgba(16,185,129,0.2)", text: "#6ee7b7" },
    fields: [
      { key: "MH1", label: "Manages stress effectively" },
      { key: "MH2", label: "Mentally prepared for exam challenges" },
      { key: "MH3", label: "Calm during high-pressure sessions" },
      { key: "MH4", label: "Physical health through rest & nutrition" },
      { key: "MH5", label: "Gets enough sleep for mental alertness" },
      { key: "MH6", label: "Balances review with self-care" },
      { key: "MH7", label: "Stays focused, avoids distractions" },
      { key: "MH8", label: "Positive mindset towards passing" },
    ],
  },
  {
    id: "support",
    label: "Support System",
    icon: "🤝",
    color: { accent: "#ec4899", bg: "rgba(236,72,153,0.07)", border: "rgba(236,72,153,0.2)", text: "#f9a8d4" },
    fields: [
      { key: "SS1", label: "Family supports exam preparation" },
      { key: "SS2", label: "Family encourages motivation" },
      { key: "SS3", label: "Peers & classmates are supportive" },
      { key: "SS4", label: "Has effective study group" },
      { key: "SS5", label: "Financial support for review & exam" },
      { key: "SS6", label: "Access to study materials & resources" },
      { key: "SS7", label: "Conducive study environment" },
      { key: "SS8", label: "Technology tools for review" },
    ],
  },
  {
    id: "curriculum",
    label: "Curriculum & Faculty",
    icon: "🎓",
    color: { accent: "#06b6d4", bg: "rgba(6,182,212,0.07)", border: "rgba(6,182,212,0.2)", text: "#67e8f9" },
    fields: [
      { key: "CU1", label: "Curriculum prepared me for board exam" },
      { key: "CU2", label: "Core subjects covered key EE topics" },
      { key: "CU3", label: "Syllabi aligned with board exam" },
      { key: "CU4", label: "Balanced theory & problem-solving" },
      { key: "CU5", label: "Subject sequence supported learning" },
      { key: "FQ1", label: "Professors showed subject mastery" },
      { key: "FQ2", label: "Professors explained concepts clearly" },
      { key: "FQ3", label: "Professors used effective techniques" },
      { key: "FQ4", label: "Professors encouraged critical thinking" },
      { key: "FQ5", label: "Professors accessible outside class" },
    ],
  },
  {
    id: "institutional",
    label: "Dept Review & Institution",
    icon: "🏫",
    color: { accent: "#f97316", bg: "rgba(249,115,22,0.07)", border: "rgba(249,115,22,0.2)", text: "#fdba74" },
    fields: [
      { key: "DR1", label: "Dept conducted review programs" },
      { key: "DR2", label: "Review sessions reinforced key concepts" },
      { key: "DR3", label: "Dept provided mock exams" },
      { key: "DR4", label: "Dept provided mentoring & support" },
      { key: "DR5", label: "Review conducted at right time" },
      { key: "FA1", label: "Library had adequate review resources" },
      { key: "FA2", label: "Labs equipped for practical learning" },
      { key: "FA3", label: "Technology resources available" },
      { key: "FA4", label: "Study areas accessible for reviewers" },
      { key: "FA5", label: "Campus environment conducive to study" },
      { key: "IC1", label: "Institution promotes academic excellence" },
      { key: "IC2", label: "Institution encourages board exam taking" },
      { key: "IC3", label: "Institution motivates students" },
      { key: "IC4", label: "Institution provides career guidance" },
      { key: "IC5", label: "Institutional environment positively influenced prep" },
    ],
  },
];

// ─── Global Styles ────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&family=Inter:wght@300;400;500;600&family=DM+Sans:wght@300;400;500;700&display=swap');

  .rc-root *, .rc-root *::before, .rc-root *::after { box-sizing: border-box; }
  .rc-root {
    font-family: 'Inter', sans-serif;
    color: ${IIEE.white};
    font-size: clamp(13px, 1.2vw, 14px);
    line-height: 1.6;
  }
  .rc-root p { margin: 0; }

  /* Verdict banner */
  .rc-verdict {
    border-radius: 18px;
    padding: clamp(16px, 3vw, 24px);
    margin-bottom: clamp(12px, 2.5vw, 18px);
    position: relative; overflow: hidden;
  }
  .rc-verdict-top {
    display: flex; align-items: center;
    justify-content: space-between;
    gap: 12px; margin-bottom: clamp(12px, 2.5vw, 18px);
    flex-wrap: wrap;
  }
  .rc-verdict-left { display: flex; align-items: center; gap: clamp(10px, 2.5vw, 16px); }
  .rc-verdict-icon {
    width: clamp(44px, 7vw, 54px); height: clamp(44px, 7vw, 54px);
    border-radius: 13px; display: flex; align-items: center; justify-content: center;
    font-size: clamp(20px, 4vw, 26px); flex-shrink: 0;
  }
  .rc-label {
    font-size: clamp(9px, 1.2vw, 11px); color: ${IIEE.dimText};
    text-transform: uppercase; letter-spacing: 0.12em; font-weight: 600;
    font-family: 'Montserrat', sans-serif; margin-bottom: 4px;
  }
  .rc-verdict-text {
    font-family: 'Montserrat', sans-serif;
    font-size: clamp(26px, 6vw, 38px); font-weight: 800;
    letter-spacing: -0.02em; line-height: 1;
  }

  /* Confidence ring container */
  .rc-ring-wrap {
    display: flex; flex-direction: column; align-items: center;
    gap: 3px; flex-shrink: 0;
  }
  .rc-ring-sub {
    font-size: clamp(8px, 1.1vw, 10px); color: ${IIEE.dimText};
    font-family: 'DM Sans', sans-serif;
  }

  /* Summary box */
  .rc-summary {
    border-radius: 11px; padding: clamp(10px, 2vw, 13px) clamp(12px, 2.5vw, 16px);
    font-size: clamp(11px, 1.4vw, 13px); line-height: 1.65;
    margin-bottom: clamp(12px, 2.5vw, 16px);
  }

  /* Prob bar */
  .rc-prob-row {
    display: flex; justify-content: space-between; margin-bottom: 5px;
  }
  .rc-prob-label { font-size: clamp(10px, 1.3vw, 12px); font-weight: 700; }
  .rc-bar-track {
    height: 8px; background: rgba(255,255,255,0.06);
    border-radius: 99px; overflow: hidden; margin-bottom: clamp(10px, 2vw, 14px);
  }
  .rc-bar-fill {
    height: 100%; border-radius: 99px;
    transition: width 0.9s cubic-bezier(0.4,0,0.2,1);
  }

  /* Prob chips */
  .rc-prob-chips {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: clamp(6px, 1.5vw, 10px); margin-bottom: clamp(10px, 2vw, 13px);
  }
  .rc-prob-chip {
    background: rgba(0,0,0,0.22); border: 1px solid rgba(255,255,255,0.07);
    border-radius: 11px; padding: clamp(10px, 2vw, 13px) clamp(10px, 2vw, 14px);
  }
  .rc-prob-chip-row { display: flex; align-items: center; gap: 5px; margin-bottom: 4px; }
  .rc-prob-chip-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
  .rc-prob-chip-label { font-size: clamp(9px, 1.2vw, 11px); color: ${IIEE.dimText}; font-weight: 500; }
  .rc-prob-chip-val {
    font-family: 'Montserrat', sans-serif;
    font-size: clamp(18px, 3.5vw, 22px); font-weight: 800;
    font-variant-numeric: tabular-nums;
  }

  /* Reliability */
  .rc-reliability {
    font-size: clamp(10px, 1.3vw, 12px); color: ${IIEE.dimText};
    margin-top: 6px; line-height: 1.6;
  }

  /* Overall survey bar */
  .rc-overall {
    background: rgba(0,0,0,0.22); border: 1px solid rgba(255,255,255,0.07);
    border-radius: 11px; padding: clamp(10px, 2vw, 13px) clamp(10px, 2vw, 14px);
    margin-top: clamp(10px, 2vw, 13px);
  }
  .rc-overall-row {
    display: flex; justify-content: space-between; align-items: center; margin-bottom: 7px;
  }
  .rc-overall-label { font-size: clamp(10px, 1.3vw, 12px); font-weight: 600; color: ${IIEE.muted}; }
  .rc-overall-val {
    font-family: 'Montserrat', sans-serif;
    font-size: clamp(13px, 2vw, 15px); font-weight: 800;
  }

  /* Rating section */
  .rc-rating-card {
    background: ${IIEE.cardBg}; border: 1px solid ${IIEE.cardBorder};
    border-radius: 18px; padding: clamp(14px, 3vw, 20px);
    margin-bottom: clamp(12px, 2.5vw, 18px); overflow: hidden;
  }
  .rc-rating-head {
    display: flex; align-items: center; gap: 10px; margin-bottom: clamp(12px, 2.5vw, 16px);
    padding-bottom: clamp(10px, 2vw, 14px); border-bottom: 1px solid rgba(245,197,24,0.12);
  }
  .rc-rating-icon {
    width: clamp(28px, 5vw, 36px); height: clamp(28px, 5vw, 36px);
    border-radius: 8px; display: flex; align-items: center; justify-content: center;
    font-size: clamp(13px, 2.2vw, 16px);
    background: ${IIEE.goldGlow}; border: 1px solid ${IIEE.goldBorder}; flex-shrink: 0;
  }
  .rc-rating-title {
    font-family: 'Montserrat', sans-serif;
    font-size: clamp(13px, 2vw, 15px); font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.06em; color: ${IIEE.white}; margin: 0;
  }
  .rc-rating-sub { font-size: clamp(10px, 1.3vw, 12px); color: ${IIEE.dimText}; margin: 0; }
  .rc-rating-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: clamp(8px, 2vw, 12px); margin-bottom: clamp(10px, 2vw, 14px);
  }
  .rc-rating-box {
    border-radius: 13px; padding: clamp(12px, 2.5vw, 16px);
    transition: transform 0.18s;
  }
  .rc-rating-box:hover { transform: translateY(-2px); }
  .rc-rating-box-label {
    font-size: clamp(8px, 1.1vw, 10px); color: ${IIEE.dimText};
    font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;
    font-family: 'Montserrat', sans-serif; margin-bottom: 5px;
  }
  .rc-rating-val {
    font-family: 'Montserrat', sans-serif;
    font-size: clamp(28px, 6vw, 36px); font-weight: 800; line-height: 1; margin-bottom: 8px;
  }
  .rc-rating-val-unit { font-size: clamp(11px, 1.5vw, 13px); color: ${IIEE.dimText}; margin-left: 2px; }
  .rc-rating-prog {
    height: 5px; background: rgba(255,255,255,0.07);
    border-radius: 99px; overflow: hidden; margin-bottom: 8px;
  }
  .rc-rating-prog-fill { height: 100%; border-radius: 99px; transition: width 1s ease; }
  .rc-rating-footer { display: flex; align-items: center; justify-content: space-between; }
  .rc-rating-badge {
    font-size: clamp(9px, 1.2vw, 10px); font-weight: 700;
    padding: 2px 8px; border-radius: 999px;
  }
  .rc-rating-verdict { font-size: clamp(9px, 1.2vw, 10px); font-weight: 700; }

  /* Subject scores */
  .rc-subjects {
    background: rgba(0,0,0,0.25); border-radius: 11px;
    padding: clamp(10px, 2vw, 13px) clamp(12px, 2.5vw, 16px); margin-bottom: 10px;
  }
  .rc-subjects-label {
    font-size: clamp(9px, 1.2vw, 11px); font-weight: 700; color: ${IIEE.dimText};
    text-transform: uppercase; letter-spacing: 0.08em;
    font-family: 'Montserrat', sans-serif; margin-bottom: 10px;
  }
  .rc-subjects-grid { display: grid; gap: 7px; }
  .rc-subject-box {
    border-radius: 10px; padding: clamp(8px, 1.5vw, 10px) clamp(10px, 2vw, 13px); text-align: center;
    transition: transform 0.15s;
  }
  .rc-subject-box:hover { transform: translateY(-1px); }
  .rc-subject-name {
    font-size: clamp(8px, 1.1vw, 10px); font-weight: 700; color: ${IIEE.dimText};
    text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 3px;
  }
  .rc-subject-score {
    font-family: 'Montserrat', sans-serif;
    font-size: clamp(18px, 4vw, 24px); font-weight: 800; line-height: 1; margin-bottom: 5px;
  }
  .rc-subject-status {
    font-size: clamp(8px, 1.1vw, 9px); font-weight: 700;
    padding: 1px 6px; border-radius: 999px;
  }

  /* Model note */
  .rc-model-note {
    font-size: clamp(10px, 1.3vw, 11.5px); color: ${IIEE.dimText}; line-height: 1.65;
    border-left: 2px solid ${IIEE.goldBorder};
    background: linear-gradient(90deg, rgba(245,197,24,0.04) 0%, transparent 100%);
    border-radius: 0 8px 8px 0;
    padding: clamp(8px, 1.5vw, 10px) clamp(10px, 2vw, 14px);
  }
  .rc-model-note strong { color: ${IIEE.gold}; font-family: 'Montserrat', sans-serif; }

  /* Divider */
  .rc-divider {
    display: flex; align-items: center; gap: 10px;
    margin: clamp(16px, 3vw, 24px) 0 clamp(10px, 2vw, 16px);
  }
  .rc-divider-line {
    flex: 1; height: 1px;
    background: linear-gradient(90deg, ${IIEE.goldBorder} 0%, transparent 100%);
  }
  .rc-divider-line.rev {
    background: linear-gradient(90deg, transparent 0%, ${IIEE.goldBorder} 100%);
  }
  .rc-divider-label {
    font-family: 'Montserrat', sans-serif;
    font-size: clamp(9px, 1.2vw, 11px); font-weight: 700;
    letter-spacing: 0.16em; text-transform: uppercase;
    color: ${IIEE.gold}; white-space: nowrap;
  }

  /* Section card */
  .rc-section-card {
    border-radius: 14px; overflow: hidden;
    transition: border-color 0.22s, box-shadow 0.22s;
    margin-bottom: 8px;
  }
  .rc-section-btn {
    width: 100%; padding: clamp(12px, 2.5vw, 16px);
    display: flex; align-items: center; gap: clamp(10px, 2vw, 13px);
    background: transparent; border: none; cursor: pointer; text-align: left;
  }
  .rc-section-icon { font-size: clamp(17px, 3vw, 21px); flex-shrink: 0; }
  .rc-section-info { flex: 1; min-width: 0; }
  .rc-section-top {
    display: flex; align-items: center; justify-content: space-between; margin-bottom: 5px; gap: 8px;
  }
  .rc-section-name {
    color: ${IIEE.white}; font-weight: 700;
    font-size: clamp(12px, 1.8vw, 14px);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 58%;
  }
  .rc-section-badges { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
  .rc-section-score-tag {
    font-size: clamp(9px, 1.2vw, 10px); font-weight: 700;
    padding: 2px 8px; border-radius: 999px;
  }
  .rc-section-pct {
    font-family: 'Montserrat', sans-serif;
    font-size: clamp(14px, 2.5vw, 17px); font-weight: 800;
  }
  .rc-section-bar-track {
    height: 4px; background: rgba(255,255,255,0.06);
    border-radius: 99px; overflow: hidden; margin-bottom: 4px;
  }
  .rc-section-bar-fill { height: 100%; border-radius: 99px; transition: width 0.8s cubic-bezier(0.4,0,0.2,1); }
  .rc-section-hint { font-size: clamp(9px, 1.2vw, 10px); font-family: 'Inter', sans-serif; }
  .rc-section-arrow {
    font-size: clamp(11px, 1.5vw, 13px); flex-shrink: 0;
    transition: transform 0.25s ease;
  }

  /* Expanded panel */
  .rc-expanded {
    display: grid; grid-template-columns: 1fr 1fr;
    border-top-style: solid; border-top-width: 1px;
  }
  .rc-items-panel {
    padding: clamp(12px, 2.5vw, 16px);
    max-height: 340px; overflow-y: auto;
    border-right-style: solid; border-right-width: 1px;
  }
  .rc-items-heading {
    font-size: clamp(9px, 1.2vw, 10px); font-weight: 700;
    color: ${IIEE.dimText}; text-transform: uppercase; letter-spacing: 0.08em;
    font-family: 'Montserrat', sans-serif; margin: 0 0 10px;
  }
  .rc-item-row {
    display: flex; align-items: center; gap: 8px;
    padding: 7px 0; border-bottom: 1px solid rgba(255,255,255,0.04);
  }
  .rc-item-row:last-child { border-bottom: none; }
  .rc-item-key {
    font-size: clamp(8px, 1.1vw, 9px); font-weight: 700; flex-shrink: 0; width: 28px;
  }
  .rc-item-label { flex: 1; font-size: clamp(9px, 1.2vw, 11px); line-height: 1.35; }
  .rc-item-bar-track {
    width: 38px; height: 3px; background: rgba(255,255,255,0.08);
    border-radius: 99px; overflow: hidden;
  }
  .rc-item-bar-fill { height: 100%; border-radius: 99px; }
  .rc-item-val { font-size: clamp(9px, 1.2vw, 11px); font-weight: 700; width: 12px; text-align: right; }

  /* AI panel */
  .rc-ai-panel {
    padding: clamp(12px, 2.5vw, 16px); display: flex; flex-direction: column;
  }
  .rc-ai-head { display: flex; align-items: center; gap: 6px; margin-bottom: 10px; }
  .rc-ai-label {
    font-size: clamp(9px, 1.2vw, 10px); font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.08em;
    font-family: 'Montserrat', sans-serif;
  }
  .rc-ai-spinner {
    width: 13px; height: 13px; border-radius: 50%;
    border-width: 2px; border-style: solid;
    border-top-color: transparent;
    animation: rcSpin 0.8s linear infinite; flex-shrink: 0;
  }
  .rc-ai-loading { display: flex; align-items: center; gap: 9px; padding: 10px 0; }
  .rc-ai-loading-text { font-size: clamp(10px, 1.3vw, 12px); color: ${IIEE.dimText}; }
  .rc-ai-content { overflow-y: auto; max-height: 300px; }
  .rc-ai-line { font-size: clamp(10px, 1.4vw, 12px); line-height: 1.65; margin-bottom: 5px; }
  .rc-ai-placeholder { font-size: clamp(10px, 1.3vw, 12px); color: ${IIEE.dimText}; line-height: 1.6; }

  /* Footer note */
  .rc-footer-note {
    background: ${IIEE.cardBg}; border: 1px solid ${IIEE.cardBorder};
    border-radius: 12px; padding: clamp(10px, 2vw, 14px) clamp(12px, 2.5vw, 16px);
    font-size: clamp(10px, 1.3vw, 12px); color: ${IIEE.dimText}; line-height: 1.7;
  }
  .rc-footer-note strong { color: ${IIEE.gold}; font-family: 'Montserrat', sans-serif; }

  /* Animations */
  @keyframes rcFadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes rcSpin   { to{transform:rotate(360deg)} }
  .rc-fadein { animation: rcFadeUp 0.35s ease both; }

  /* Scrollbar */
  .rc-root ::-webkit-scrollbar { width: 4px; height: 4px; }
  .rc-root ::-webkit-scrollbar-thumb { background: rgba(245,197,24,0.2); border-radius: 99px; }

  /* Responsive */
  @media (max-width: 600px) {
    .rc-expanded { grid-template-columns: 1fr !important; }
    .rc-items-panel { border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.07); max-height: 200px !important; }
    .rc-rating-grid { grid-template-columns: 1fr !important; }
  }
  @media (max-width: 480px) {
    .rc-prob-chips { grid-template-columns: 1fr !important; }
  }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function computeScore(keys, answers) {
  const vals = keys.map(k => Number(answers[k])).filter(v => v >= 1 && v <= 4);
  if (!vals.length) return null;
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  return Math.round(((4 - avg) / 3) * 100);
}

function getScoreLabel(score) {
  if (score >= 80) return { label: "Excellent",   color: IIEE.passGreen };
  if (score >= 65) return { label: "Good",         color: IIEE.blue };
  if (score >= 50) return { label: "Fair",         color: IIEE.amber };
  return              { label: "Needs Work",    color: IIEE.failRed };
}

function getRatingColor(score) {
  if (score >= 85) return IIEE.passGreen;
  if (score >= 78) return IIEE.blue;
  if (score >= 70) return IIEE.amber;
  if (score >= 60) return IIEE.orange;
  return IIEE.failRed;
}

async function fetchAIRecommendation(section, answers, score, passed, attempt_id) {
  const questions = section.fields.map(f => ({ key: f.key, label: f.label, value: Number(answers[f.key]) }));
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE_URL}/ai-recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ section_label: section.label, score, passed, questions, attempt_id }),
  });
  if (!res.ok) throw new Error("Server error");
  const data = await res.json();
  return data.recommendation;
}

// ─── Divider ──────────────────────────────────────────────────────────────────
function Divider({ label }) {
  return (
    <div className="rc-divider">
      <div className="rc-divider-line" />
      <div className="rc-divider-label">{label}</div>
      <div className="rc-divider-line rev" />
    </div>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────
function SectionCard({ section, answers, passed, isActive, onToggle, attempt_id }) {
  const [rec, setRec] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const score = computeScore(section.fields.map(f => f.key), answers);
  const { label: scoreLabel, color: scoreLabelColor } = getScoreLabel(score);
  const c = section.color;

  const weakItems   = section.fields.filter(f => Number(answers[f.key]) >= 3);
  const strongItems = section.fields.filter(f => Number(answers[f.key]) <= 2);

  const handleToggle = async () => {
    onToggle();
    if (!isActive && !rec && !loading) {
      setLoading(true); setError(null);
      try {
        const text = await fetchAIRecommendation(section, answers, score, passed, attempt_id);
        setRec(text);
      } catch {
        setError("Could not load AI recommendations. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div
      className="rc-section-card"
      style={{
        border: `1px solid ${isActive ? c.accent + "65" : c.border}`,
        background: isActive ? c.bg : "rgba(11,20,55,0.55)",
        boxShadow: isActive ? `0 4px 20px ${c.accent}18` : "none",
      }}
    >
      {/* ── Header ── */}
      <button className="rc-section-btn" onClick={handleToggle}>
        <span className="rc-section-icon">{section.icon}</span>
        <div className="rc-section-info">
          <div className="rc-section-top">
            <span className="rc-section-name">{section.label}</span>
            <div className="rc-section-badges">
              <span
                className="rc-section-score-tag"
                style={{ background: `${scoreLabelColor}20`, color: scoreLabelColor, border: `1px solid ${scoreLabelColor}40` }}
              >{scoreLabel}</span>
              <span className="rc-section-pct" style={{ color: c.text }}>{score}%</span>
            </div>
          </div>
          <div className="rc-section-bar-track">
            <div className="rc-section-bar-fill" style={{ width: `${score}%`, background: c.accent }} />
          </div>
          <p className="rc-section-hint" style={{ color: weakItems.length > 0 ? IIEE.muted : IIEE.teal }}>
            {weakItems.length > 0
              ? `${weakItems.length} area${weakItems.length > 1 ? "s" : ""} to improve · ${strongItems.length} strong`
              : `All ${section.fields.length} areas positive ✓`}
          </p>
        </div>
        <span className="rc-section-arrow" style={{ color: isActive ? c.text : IIEE.dimText, transform: isActive ? "rotate(90deg)" : "none" }}>▶</span>
      </button>

      {/* ── Expanded ── */}
      {isActive && (
        <div className="rc-expanded" style={{ borderTopColor: c.border }}>

          {/* Left: item breakdown */}
          <div className="rc-items-panel" style={{ borderRightColor: c.border }}>
            <p className="rc-items-heading">Item Breakdown</p>
            {section.fields.map((f, i) => {
              const val = Number(answers[f.key]);
              const isWeak = val >= 3;
              const barW = ((4 - val) / 3) * 100;
              return (
                <div
                  key={f.key} className="rc-item-row"
                  style={{ background: isWeak ? "rgba(239,68,68,0.04)" : "transparent" }}
                >
                  <span className="rc-item-key" style={{ color: isWeak ? IIEE.failRed : IIEE.passGreen }}>{f.key}</span>
                  <span className="rc-item-label" style={{ color: isWeak ? "#fca5a5" : IIEE.muted }}>{f.label}</span>
                  <div className="rc-item-bar-track">
                    <div className="rc-item-bar-fill" style={{ width: `${barW}%`, background: isWeak ? IIEE.failRed : c.accent }} />
                  </div>
                  <span className="rc-item-val" style={{ color: isWeak ? IIEE.failRed : c.text }}>{val}</span>
                </div>
              );
            })}
          </div>

          {/* Right: AI recommendations */}
          <div className="rc-ai-panel">
            <div className="rc-ai-head">
              <span style={{ fontSize: 14 }}>✨</span>
              <span className="rc-ai-label" style={{ color: c.text }}>AI Recommendations</span>
            </div>

            {loading && (
              <div className="rc-ai-loading">
                <div className="rc-ai-spinner" style={{ borderColor: `${c.accent}40`, borderTopColor: c.accent }} />
                <span className="rc-ai-loading-text">Analyzing your responses…</span>
              </div>
            )}

            {error && (
              <p style={{ fontSize: "clamp(10px,1.3vw,12px)", color: IIEE.failRed, lineHeight: 1.6 }}>{error}</p>
            )}

            {rec && (
              <div className="rc-ai-content">
                {rec.split("\n").filter(l => l.trim()).map((line, i) => {
                  const isNum = /^\d+\./.test(line.trim());
                  return (
                    <p key={i} className="rc-ai-line" style={{ color: isNum ? "#cbd5e1" : IIEE.muted, fontWeight: isNum ? 500 : 400 }}>
                      {isNum
                        ? <><span style={{ color: c.text, fontWeight: 700 }}>{line.match(/^\d+/)[0]}.</span>{line.replace(/^\d+\./, "")}</>
                        : line}
                    </p>
                  );
                })}
              </div>
            )}

            {!loading && !rec && !error && (
              <p className="rc-ai-placeholder">Loading AI analysis for this section…</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Predicted Rating Section ─────────────────────────────────────────────────
function PredictedRatingSection({ result }) {
  const ratingA  = result.predicted_rating_a;
  const ratingB  = result.predicted_rating_b;
  const labelA   = result.rating_label_a;
  const labelB   = result.rating_label_b;
  const colorA   = getRatingColor(ratingA);
  const colorB   = getRatingColor(ratingB);
  const passing  = result.passing_score ?? 70;
  const subjects = result.subject_status ? Object.entries(result.subject_status) : [];

  return (
    <div className="rc-rating-card">
      <div className="rc-rating-head">
        <div className="rc-rating-icon">📊</div>
        <div>
          <p className="rc-rating-title">Predicted PRC Rating</p>
          <p className="rc-rating-sub">Passing threshold ≥ {passing} — two model variants</p>
        </div>
      </div>

      <div className="rc-rating-grid">
        {[
          { label: "With Subject Scores", rating: ratingA, color: colorA, badge: labelA },
          { label: "GWA + Survey Only",   rating: ratingB, color: colorB, badge: labelB },
        ].map(({ label, rating, color, badge }) => (
          <div key={label} className="rc-rating-box" style={{ background: `${color}10`, border: `1px solid ${color}30` }}>
            <p className="rc-rating-box-label">{label}</p>
            <div>
              <span className="rc-rating-val" style={{ color }}>
                {rating != null ? rating.toFixed(1) : "—"}
                <span className="rc-rating-val-unit">/100</span>
              </span>
            </div>
            <div className="rc-rating-prog">
              <div className="rc-rating-prog-fill" style={{ width: `${rating ?? 0}%`, background: color }} />
            </div>
            <div className="rc-rating-footer">
              <span className="rc-rating-badge" style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}>{badge}</span>
              <span className="rc-rating-verdict" style={{ color: rating >= passing ? IIEE.passGreen : IIEE.failRed }}>
                {rating >= passing ? "▲ PASS" : "▼ FAIL"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {subjects.length > 0 && (
        <div className="rc-subjects">
          <p className="rc-subjects-label">Subject Scores</p>
          <div className="rc-subjects-grid" style={{ gridTemplateColumns: `repeat(${Math.min(subjects.length, 4)}, 1fr)` }}>
            {subjects.map(([subj, info]) => (
              <div
                key={subj} className="rc-subject-box"
                style={{
                  background: info.passed ? "rgba(34,197,94,0.08)"  : "rgba(239,68,68,0.08)",
                  border:     `1px solid ${info.passed ? "rgba(34,197,94,0.22)" : "rgba(239,68,68,0.22)"}`,
                }}
              >
                <p className="rc-subject-name">{subj}</p>
                <p className="rc-subject-score" style={{ color: info.passed ? IIEE.passGreen : IIEE.failRed }}>{info.score}</p>
                <span
                  className="rc-subject-status"
                  style={{
                    background: info.passed ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                    color:      info.passed ? IIEE.passGreen : IIEE.failRed,
                  }}
                >{info.passed ? `✓ ≥${passing}` : `✗ <${passing}`}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="rc-model-note">
        💡 <strong>Model A</strong> uses subject scores + GWA + survey (R² = 0.97). <strong>Model B</strong> uses only GWA + survey — useful for early readiness assessment (R² = 0.90).
      </p>
    </div>
  );
}

// ─── Main ResultCard ──────────────────────────────────────────────────────────
export default function ResultCard({ result }) {
  const [activeSection, setActiveSection] = useState(null);

  const passed      = result.prediction === 1;
  const passPercent = Math.round(result.probability_pass * 100);
  const failPercent = Math.round(result.probability_fail * 100);
  const confidence  = passed ? passPercent : failPercent;
  const answers     = result.answers || {};
  const attempt_id  = result.attempt_id;

  const reliability = result.reliability_score;
  const reliabilityLabel = result.reliability_category ?? (
    reliability == null ? "—"
    : reliability >= 80 ? "Highly consistent answers"
    : reliability >= 60 ? "Moderate consistency"
    : "Potential random responses"
  );
  const reliabilityColor = reliability == null ? IIEE.dimText
    : reliability >= 80 ? IIEE.passGreen
    : reliability >= 60 ? IIEE.amber : IIEE.orange;

  const allKeys      = SECTIONS.flatMap(s => s.fields.map(f => f.key));
  const overallScore = computeScore(allKeys, answers);
  const { color: overallColor } = getScoreLabel(overallScore ?? 0);

  const passColor = passed ? IIEE.passGreen : IIEE.failRed;

  return (
    <div className="rc-root">
      <style>{STYLES}</style>

      {/* ── Verdict Banner ── */}
      <div
        className="rc-verdict"
        style={{
          background: passed
            ? "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(5,150,105,0.05))"
            : "linear-gradient(135deg, rgba(239,68,68,0.12), rgba(220,38,38,0.05))",
          border: `1px solid ${passColor}45`,
        }}
      >
        <div className="rc-verdict-top">
          <div className="rc-verdict-left">
            <div
              className="rc-verdict-icon"
              style={{ background: `${passColor}18`, border: `1px solid ${passColor}28` }}
            >
              {passed ? "🎓" : "📋"}
            </div>
            <div>
              <p className="rc-label">Prediction Result</p>
              <p className="rc-verdict-text" style={{ color: passColor }}>
                {passed ? "PASSED" : "FAILED"}
              </p>
            </div>
          </div>

          {/* Confidence ring */}
          <div className="rc-ring-wrap">
            <div style={{ position: "relative", width: "clamp(52px,9vw,62px)", height: "clamp(52px,9vw,62px)" }}>
              <svg width="62" height="62" viewBox="0 0 62 62" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="31" cy="31" r="25" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
                <circle
                  cx="31" cy="31" r="25" fill="none"
                  stroke={passColor} strokeWidth="5" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 25}`}
                  strokeDashoffset={`${2 * Math.PI * 25 * (1 - confidence / 100)}`}
                  style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)" }}
                />
              </svg>
              <span style={{
                position: "absolute", top: "50%", left: "50%",
                transform: "translate(-50%,-50%)",
                fontSize: "clamp(11px,2vw,13px)", fontWeight: 800,
                color: passColor, fontFamily: "'Montserrat',sans-serif",
              }}>{confidence}%</span>
            </div>
            <span className="rc-ring-sub">confidence</span>
          </div>
        </div>

        {/* Summary */}
        <div
          className="rc-summary"
          style={{
            background: `${passColor}09`,
            border: `1px solid ${passColor}20`,
            color: passed ? "rgba(167,243,208,0.88)" : "rgba(252,165,165,0.88)",
          }}
        >
          {passed
            ? "🎉 Based on your profile, you are likely to pass the EE Licensure Exam. Explore each section below to push your readiness to 100%."
            : "📚 Additional preparation is recommended. Review the AI analysis for each section below — every improvement brings you closer to passing."}
        </div>

        {/* Probability bar */}
        <div className="rc-prob-row">
          <span className="rc-prob-label" style={{ color: IIEE.passGreen }}>Pass {passPercent}%</span>
          <span className="rc-prob-label" style={{ color: IIEE.failRed }}>Fail {failPercent}%</span>
        </div>
        <div className="rc-bar-track">
          <div
            className="rc-bar-fill"
            style={{ width: `${passPercent}%`, background: `linear-gradient(90deg, ${IIEE.passGreen}, ${IIEE.teal})` }}
          />
        </div>

        {/* Prob chips */}
        <div className="rc-prob-chips">
          {[
            { label: "Pass Probability", val: result.probability_pass.toFixed(4), color: IIEE.passGreen },
            { label: "Fail Probability", val: result.probability_fail.toFixed(4), color: IIEE.failRed },
          ].map(({ label, val, color }) => (
            <div key={label} className="rc-prob-chip">
              <div className="rc-prob-chip-row">
                <span className="rc-prob-chip-dot" style={{ background: color }} />
                <span className="rc-prob-chip-label">{label}</span>
              </div>
              <p className="rc-prob-chip-val" style={{ color }}>{val}</p>
            </div>
          ))}
        </div>

        {/* Reliability */}
        <p className="rc-reliability">
          Response reliability:{" "}
          <strong style={{ color: reliabilityColor }}>{reliability != null ? `${reliability.toFixed(1)}%` : "—"}</strong>
          <span style={{ marginLeft: 8, fontSize: "clamp(9px,1.2vw,10px)", color: IIEE.dimText }}>({reliabilityLabel})</span>
        </p>

        {/* Overall survey bar */}
        {overallScore !== null && (
          <div className="rc-overall">
            <div className="rc-overall-row">
              <span className="rc-overall-label">Overall Survey Readiness</span>
              <span className="rc-overall-val" style={{ color: overallColor }}>{overallScore}%</span>
            </div>
            <div className="rc-bar-track" style={{ marginBottom: 0 }}>
              <div className="rc-bar-fill" style={{ width: `${overallScore}%`, background: overallColor }} />
            </div>
          </div>
        )}
      </div>

      {/* ── Predicted PRC Rating ── */}
      <PredictedRatingSection result={result} />

      {/* ── Section Analysis ── */}
      <Divider label="📋 Detailed Section Analysis — Click to Expand" />

      <div>
        {SECTIONS.map((section, i) => (
          <div key={section.id} className="rc-fadein" style={{ animationDelay: `${i * 0.04}s` }}>
            <SectionCard
              section={section}
              answers={answers}
              passed={passed}
              isActive={activeSection === section.id}
              onToggle={() => setActiveSection(prev => prev === section.id ? null : section.id)}
              attempt_id={attempt_id}
            />
          </div>
        ))}
      </div>

      {/* ── Footer ── */}
      <div className="rc-footer-note" style={{ marginTop: 16 }}>
        💬 <strong>Note:</strong> AI recommendations are personalized based on your survey answers. Each section targets your specific weak points while affirming strengths. Retake the mock exam after improving flagged areas to see your updated prediction.
      </div>
    </div>
  );
}