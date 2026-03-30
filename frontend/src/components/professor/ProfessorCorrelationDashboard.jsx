import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

/* ═══════════════════════════════════════════════════════════════
   DESIGN TOKENS — matches ModelOverviewDashboard exactly
═══════════════════════════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════════════════════════
   STATIC DEMO DATA — replace with your real props
═══════════════════════════════════════════════════════════════ */
const VARS = [
  "EE", "MATH", "ESAS", "GWA",
  "F_Education", "F_BoardPrep", "F_Cognitive", "F_NonCognitive", "F_Institutional",
];

const VAR_LABELS = {
  EE:              "EE",
  MATH:            "MATH",
  ESAS:            "ESAS",
  GWA:             "GWA",
  F_Education:     "F: Educ. Background",
  F_BoardPrep:     "F: Board Prep",
  F_Cognitive:     "F: Cognitive",
  F_NonCognitive:  "F: Non-Cognitive",
  F_Institutional: "F: Institutional",
};

const VAR_SHORT = {
  EE:              "EE",
  MATH:            "MATH",
  ESAS:            "ESAS",
  GWA:             "GWA",
  F_Education:     "F.Educ",
  F_BoardPrep:     "F.Prep",
  F_Cognitive:     "F.Cog",
  F_NonCognitive:  "F.Non-Cog",
  F_Institutional: "F.Inst",
};

// Overall matrix (passers + failers combined)
const OVERALL_MATRIX_RAW = {
  EE:              { EE:1.000, MATH:0.812, ESAS:0.891, GWA:-0.431, F_Education:0.382, F_BoardPrep:0.441, F_Cognitive:0.391, F_NonCognitive:0.312, F_Institutional:0.298 },
  MATH:            { EE:0.812, MATH:1.000, ESAS:0.798, GWA:-0.399, F_Education:0.351, F_BoardPrep:0.418, F_Cognitive:0.367, F_NonCognitive:0.289, F_Institutional:0.274 },
  ESAS:            { EE:0.891, MATH:0.798, ESAS:1.000, GWA:-0.439, F_Education:0.408, F_BoardPrep:0.473, F_Cognitive:0.421, F_NonCognitive:0.341, F_Institutional:0.318 },
  GWA:             { EE:-0.431, MATH:-0.399, ESAS:-0.439, GWA:1.000, F_Education:-0.214, F_BoardPrep:-0.278, F_Cognitive:-0.198, F_NonCognitive:-0.167, F_Institutional:-0.154 },
  F_Education:     { EE:0.382, MATH:0.351, ESAS:0.408, GWA:-0.214, F_Education:1.000, F_BoardPrep:0.512, F_Cognitive:0.489, F_NonCognitive:0.461, F_Institutional:0.443 },
  F_BoardPrep:     { EE:0.441, MATH:0.418, ESAS:0.473, GWA:-0.278, F_Education:0.512, F_BoardPrep:1.000, F_Cognitive:0.534, F_NonCognitive:0.501, F_Institutional:0.487 },
  F_Cognitive:     { EE:0.391, MATH:0.367, ESAS:0.421, GWA:-0.198, F_Education:0.489, F_BoardPrep:0.534, F_Cognitive:1.000, F_NonCognitive:0.558, F_Institutional:0.521 },
  F_NonCognitive:  { EE:0.312, MATH:0.289, ESAS:0.341, GWA:-0.167, F_Education:0.461, F_BoardPrep:0.501, F_Cognitive:0.558, F_NonCognitive:1.000, F_Institutional:0.567 },
  F_Institutional: { EE:0.298, MATH:0.274, ESAS:0.318, GWA:-0.154, F_Education:0.443, F_BoardPrep:0.487, F_Cognitive:0.521, F_NonCognitive:0.567, F_Institutional:1.000 },
};

// Passers-only matrix
const PASSERS_MATRIX_RAW = {
  EE:              { EE:1.000, MATH:0.841, ESAS:0.912, GWA:-0.469, F_Education:0.421, F_BoardPrep:0.478, F_Cognitive:0.432, F_NonCognitive:0.348, F_Institutional:0.331 },
  MATH:            { EE:0.841, MATH:1.000, ESAS:0.823, GWA:-0.431, F_Education:0.384, F_BoardPrep:0.453, F_Cognitive:0.401, F_NonCognitive:0.312, F_Institutional:0.298 },
  ESAS:            { EE:0.912, MATH:0.823, ESAS:1.000, GWA:-0.461, F_Education:0.447, F_BoardPrep:0.512, F_Cognitive:0.458, F_NonCognitive:0.369, F_Institutional:0.347 },
  GWA:             { EE:-0.469, MATH:-0.431, ESAS:-0.461, GWA:1.000, F_Education:-0.238, F_BoardPrep:-0.301, F_Cognitive:-0.221, F_NonCognitive:-0.187, F_Institutional:-0.172 },
  F_Education:     { EE:0.421, MATH:0.384, ESAS:0.447, GWA:-0.238, F_Education:1.000, F_BoardPrep:0.548, F_Cognitive:0.521, F_NonCognitive:0.494, F_Institutional:0.471 },
  F_BoardPrep:     { EE:0.478, MATH:0.453, ESAS:0.512, GWA:-0.301, F_Education:0.548, F_BoardPrep:1.000, F_Cognitive:0.567, F_NonCognitive:0.531, F_Institutional:0.514 },
  F_Cognitive:     { EE:0.432, MATH:0.401, ESAS:0.458, GWA:-0.221, F_Education:0.521, F_BoardPrep:0.567, F_Cognitive:1.000, F_NonCognitive:0.589, F_Institutional:0.551 },
  F_NonCognitive:  { EE:0.348, MATH:0.312, ESAS:0.369, GWA:-0.187, F_Education:0.494, F_BoardPrep:0.531, F_Cognitive:0.589, F_NonCognitive:1.000, F_Institutional:0.594 },
  F_Institutional: { EE:0.331, MATH:0.298, ESAS:0.347, GWA:-0.172, F_Education:0.471, F_BoardPrep:0.514, F_Cognitive:0.551, F_NonCognitive:0.594, F_Institutional:1.000 },
};

// Failers-only matrix
const FAILERS_MATRIX_RAW = {
  EE:              { EE:1.000, MATH:0.773, ESAS:0.854, GWA:-0.387, F_Education:0.334, F_BoardPrep:0.391, F_Cognitive:0.341, F_NonCognitive:0.268, F_Institutional:0.251 },
  MATH:            { EE:0.773, MATH:1.000, ESAS:0.761, GWA:-0.358, F_Education:0.312, F_BoardPrep:0.376, F_Cognitive:0.328, F_NonCognitive:0.261, F_Institutional:0.244 },
  ESAS:            { EE:0.854, MATH:0.761, ESAS:1.000, GWA:-0.412, F_Education:0.363, F_BoardPrep:0.428, F_Cognitive:0.378, F_NonCognitive:0.298, F_Institutional:0.281 },
  GWA:             { EE:-0.387, MATH:-0.358, ESAS:-0.412, GWA:1.000, F_Education:-0.188, F_BoardPrep:-0.248, F_Cognitive:-0.171, F_NonCognitive:-0.143, F_Institutional:-0.131 },
  F_Education:     { EE:0.334, MATH:0.312, ESAS:0.363, GWA:-0.188, F_Education:1.000, F_BoardPrep:0.471, F_Cognitive:0.451, F_NonCognitive:0.424, F_Institutional:0.408 },
  F_BoardPrep:     { EE:0.391, MATH:0.376, ESAS:0.428, GWA:-0.248, F_Education:0.471, F_BoardPrep:1.000, F_Cognitive:0.498, F_NonCognitive:0.464, F_Institutional:0.451 },
  F_Cognitive:     { EE:0.341, MATH:0.328, ESAS:0.378, GWA:-0.171, F_Education:0.451, F_BoardPrep:0.498, F_Cognitive:1.000, F_NonCognitive:0.521, F_Institutional:0.487 },
  F_NonCognitive:  { EE:0.268, MATH:0.261, ESAS:0.298, GWA:-0.143, F_Education:0.424, F_BoardPrep:0.464, F_Cognitive:0.521, F_NonCognitive:1.000, F_Institutional:0.538 },
  F_Institutional: { EE:0.251, MATH:0.244, ESAS:0.281, GWA:-0.131, F_Education:0.408, F_BoardPrep:0.451, F_Cognitive:0.487, F_NonCognitive:0.538, F_Institutional:1.000 },
};

// Point-Biserial correlations (variable vs Pass/Fail binary)
const POINT_BISERIAL = [
  { label: "EE",              rpb: 0.612, p: 0.001, sig: true },
  { label: "MATH",            rpb: 0.578, p: 0.001, sig: true },
  { label: "ESAS",            rpb: 0.724, p: 0.001, sig: true },
  { label: "GWA",             rpb: -0.439, p: 0.001, sig: true },
  { label: "F: Educ.",        rpb: 0.298, p: 0.012, sig: true },
  { label: "F: Board Prep",   rpb: 0.341, p: 0.004, sig: true },
  { label: "F: Cognitive",    rpb: 0.312, p: 0.009, sig: true },
  { label: "F: Non-Cognitive",rpb: 0.241, p: 0.031, sig: true },
  { label: "F: Institutional",rpb: 0.228, p: 0.041, sig: true },
];

// Chi-Squared results (categorical associations)
const CHI_SQUARED = [
  { var1: "Strand", var2: "Pass/Fail",   chi2: 18.42, df: 3, p: 0.001, sig: true,  cramer: 0.236 },
  { var1: "Review", var2: "Pass/Fail",   chi2: 41.87, df: 1, p: 0.001, sig: true,  cramer: 0.512 },
  { var1: "Year",   var2: "Pass/Fail",   chi2: 22.14, df: 3, p: 0.001, sig: true,  cramer: 0.258 },
  { var1: "Period", var2: "Pass/Fail",   chi2: 9.31,  df: 2, p: 0.009, sig: true,  cramer: 0.172 },
  { var1: "Strand", var2: "Review",      chi2: 6.18,  df: 3, p: 0.103, sig: false, cramer: 0.140 },
];

// Row-level discussion data per matrix type
const ROW_DISCUSSIONS = {
  overall: {
    EE:              "EE scores show strong positive correlations with MATH (r=0.812) and ESAS (r=0.891), confirming that board exam subjects cluster together — students who excel in one tend to excel in others. The moderate negative correlation with GWA (r=−0.431) suggests GWA inversely predicts EE performance, consistent with Philippine grading conventions.",
    MATH:            "MATH maintains a strong positive relationship with EE (r=0.812) and ESAS (r=0.798). The negative correlation with GWA (r=−0.399) is slightly weaker than EE's, suggesting GWA is a somewhat less reliable standalone predictor for MATH performance on the boards.",
    ESAS:            "ESAS is the powerhouse variable — its correlations with EE (0.891) and MATH (0.798) are the highest in the matrix, and its negative correlation with GWA (−0.439) is the strongest among academic subjects. Feature importance analyses confirm ESAS as the single best predictor of board exam outcomes.",
    GWA:             "GWA is uniquely negative: it correlates negatively with all academic scores (EE, MATH, ESAS) because lower GWA values (e.g., 1.5) mean better grades in the Philippine system. GWA's correlations with survey factors are weak (−0.154 to −0.278), confirming that institutional and cognitive survey perceptions are largely independent of undergraduate GPA.",
    F_Education:     "Educational Background factor shows moderate positive correlations with survey factors (0.443–0.512) and weak-to-moderate correlations with academic scores (0.382–0.408). This suggests that students who rate their educational preparation higher also tend to rate other institutional factors more favorably — a possible halo effect.",
    F_BoardPrep:     "Board Preparation factor has the strongest correlation with academic scores among all survey factors (EE: 0.441, ESAS: 0.473), hinting that students who perceive their board prep as effective also perform better on actual board subjects. This factor warrants targeted intervention.",
    F_Cognitive:     "Cognitive factor moderately correlates with Non-Cognitive (0.558) and Institutional (0.521) factors, forming a 'survey cluster.' Its correlation with academic scores (0.391–0.421) is moderate, suggesting perceived cognitive readiness partially reflects, but does not fully capture, actual board performance.",
    F_NonCognitive:  "Non-Cognitive factor has the weakest correlations with academic subject scores (0.289–0.341) but the strongest within-survey correlations (Institutional: 0.567, Cognitive: 0.558). This indicates non-cognitive perceptions are tightly tied to other survey dimensions but only loosely linked to raw board exam performance.",
    F_Institutional: "Institutional factor is the most weakly correlated with academic scores (0.274–0.318) yet most strongly connected to other survey factors (0.521–0.567). Students' perceptions of institutional support appear to be a survey-internal construct rather than a direct academic performance driver.",
  },
  passers: {
    EE:              "Among passers, EE–ESAS correlation strengthens to 0.912 (vs 0.891 overall), indicating that high-performing students show even tighter integration across board subjects. This cohort-specific strengthening suggests that above-threshold performance is driven by a holistic mastery rather than isolated subject strengths.",
    MATH:            "MATH–EE correlation rises to 0.841 among passers. Passers show consistently higher within-academic correlations across all three subjects, confirming that passing the board is associated with a more unified, synergistic academic profile rather than strength in any single subject.",
    ESAS:            "ESAS–EE correlation peaks at 0.912 in the passers group — the highest pairwise academic correlation in any matrix here. This reinforces ESAS's dominant role: for students who passed, ESAS preparation was closely synchronized with EE performance, suggesting integrated review coverage.",
    GWA:             "GWA's negative correlations are stronger among passers (−0.431 to −0.469 vs −0.387 to −0.439 overall). This counter-intuitive pattern confirms the Philippine grading convention: lower numerical GWA means better academic standing, and passers tend to have lower (better) GWAs.",
    F_Education:     "Educational Background correlates slightly more strongly with academic scores among passers (0.421 vs 0.382 overall), suggesting that passers who rated their educational background highly were also stronger academically — a self-reinforcing success pattern.",
    F_BoardPrep:     "Board Prep factor shows its highest academic correlation among passers (ESAS: 0.512 vs 0.473 overall). Students who passed the board were more likely to rate board preparation highly AND to perform well academically — causality may run both directions.",
    F_Cognitive:     "Cognitive factor's within-survey correlations are slightly higher for passers than the full cohort, particularly with Non-Cognitive (0.589 vs 0.558). Passers show a more internally consistent survey profile, suggesting higher self-awareness and coherent academic self-concept.",
    F_NonCognitive:  "Non-Cognitive factor strengthens across all dimensions for passers. The Institutional correlation rises to 0.594, and Non-Cognitive–Cognitive reaches 0.589. Passers clearly perceive the full suite of support factors (cognitive, emotional, and institutional) as working together.",
    F_Institutional: "Institutional factor's correlations with academic scores are slightly higher for passers (0.331 vs 0.298 overall). This modest increase suggests that passers slightly more often credit institutional support, though the effect remains weak — institutional factors alone don't determine outcomes.",
  },
  failers: {
    EE:              "Among failers, EE–ESAS correlation drops to 0.854 (vs 0.912 passers), and all academic inter-correlations are weaker. Failers show a more fragmented academic profile — subject deficiencies are less uniform, meaning some failers underperform in specific subjects while maintaining moderate scores in others.",
    MATH:            "MATH inter-correlations are weakest among failers (EE: 0.773, ESAS: 0.761). The lower MATH–ESAS link (0.761 vs 0.823 passers) suggests that failers' MATH and ESAS preparation were less integrated — targeted subject-specific intervention rather than holistic review may better serve at-risk students.",
    ESAS:            "ESAS maintains the highest academic correlations even among failers (EE: 0.854, MATH: 0.761), confirming ESAS's central role. However, the weakening versus passers (−0.058 on the EE pair) indicates that ESAS deficiency is a critical distinguishing factor between those who pass and those who don't.",
    GWA:             "GWA–academic correlations are weaker for failers (−0.387 to −0.412 vs −0.469 for passers). This indicates GWA is slightly less predictive within the failers subgroup — some high-GWA (poor grades) students still almost pass, and vice versa, suggesting GWA alone is insufficient for early identification of board risk.",
    F_Education:     "Survey factor correlations are uniformly weaker among failers across all dimensions. Educational Background factor's correlation with ESAS drops to 0.363 vs 0.447 for passers. Failers who rate educational background lower tend to perform weaker academically, but the relationship is less tight.",
    F_BoardPrep:     "Board Prep factor shows the sharpest drop between passers and failers groups: ESAS correlation is 0.428 (failers) vs 0.512 (passers). Failers who perceived poor board prep tend to have worse ESAS scores, confirming that remedial board review programs are particularly critical for at-risk students.",
    F_Cognitive:     "Cognitive factor weakens considerably for failers vs passers (Non-Cognitive correlation: 0.521 vs 0.589). Failers show a more fragmented self-perception of cognitive readiness, possibly reflecting lower confidence, anxiety, or genuine gaps in metacognitive awareness about board preparation.",
    F_NonCognitive:  "Non-Cognitive factor correlations drop across the board for failers. The Institutional correlation falls to 0.538 (vs 0.594 passers), suggesting failers perceive institutional support and non-cognitive factors as less coherently aligned — a signal for need of structured psychological and motivational support.",
    F_Institutional: "Institutional factor shows the weakest correlations with academic scores in the failers group (0.244–0.281). This is critical: failers do not perceive institutional factors as strongly connected to their academic outcomes. Bridging this disconnect — through better faculty engagement and facility improvements — may be a lever for improvement.",
  },
};

/* ═══════════════════════════════════════════════════════════════
   STYLES — 1:1 match with ModelOverviewDashboard + matrix extras
═══════════════════════════════════════════════════════════════ */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800&family=Inter:wght@400;500;600&display=swap');
  .corr-wrap * { box-sizing: border-box; }
  .corr-wrap {
    font-family: 'Inter', sans-serif;
    background: ${IIEE.navy};
    min-height: 100vh;
    color: ${IIEE.white};
    font-size: clamp(13px, 1vw, 14px);
    line-height: 1.6;
  }

  /* Hero — identical to ModelOverviewDashboard */
  .corr-hero {
    background: linear-gradient(135deg, ${IIEE.navyMid} 0%, #1a1060 55%, rgba(245,197,24,0.06) 100%);
    border-bottom: 1px solid ${IIEE.goldBorder};
    padding: clamp(14px,4vw,28px) clamp(16px,5vw,32px) clamp(14px,3vw,22px);
    position: relative; overflow: hidden;
  }
  .corr-hero::before {
    content:''; position:absolute; top:-60px; right:-60px;
    width:280px; height:280px;
    background: radial-gradient(circle, rgba(245,197,24,0.10) 0%, transparent 65%);
    pointer-events:none;
  }
  .corr-hero-badges { display:flex; gap:8px; margin-bottom:clamp(8px,2vw,12px); flex-wrap:wrap; }
  .corr-badge {
    display:inline-flex; align-items:center; gap:5px;
    border-radius:4px; padding:3px 10px;
    font-size:clamp(10px,1.5vw,11px); font-weight:700;
    letter-spacing:0.12em; text-transform:uppercase; font-family:'Montserrat',sans-serif;
  }
  .corr-badge.gold { background:${IIEE.goldGlow}; border:1px solid ${IIEE.goldBorder}; color:${IIEE.gold}; }
  .corr-badge.blue { background:rgba(56,189,248,0.12); border:1px solid rgba(56,189,248,0.3); color:${IIEE.blue}; }
  .corr-badge.teal { background:rgba(45,212,191,0.12); border:1px solid rgba(45,212,191,0.3); color:${IIEE.teal}; }
  .corr-hero-title {
    font-family:'Montserrat',sans-serif;
    font-size:clamp(22px,5vw,32px); font-weight:700; text-transform:uppercase;
    letter-spacing:0.04em; color:${IIEE.white}; margin:0 0 4px; line-height:1;
  }
  .corr-hero-title .ag { color:${IIEE.gold}; }
  .corr-hero-title .ab { color:${IIEE.blue}; }
  .corr-hero-sub { font-size:clamp(12px,2vw,14px); color:${IIEE.muted}; margin:0; font-family:'Inter',sans-serif; }

  .corr-body { padding:clamp(14px,4vw,24px) clamp(16px,5vw,28px) clamp(32px,6vw,48px); }

  /* Tabs */
  .tab-btn {
    padding:8px 14px; border-radius:8px;
    font-size:clamp(11px,1.5vw,12px); font-weight:700;
    cursor:pointer; transition:all .18s; font-family:'Inter',sans-serif;
    border:none; outline:none;
  }

  /* Dividers */
  .comb-divider {
    display:flex; align-items:center; gap:10px;
    margin:clamp(18px,4vw,28px) 0 clamp(10px,2vw,16px);
  }
  .comb-divider-line {
    flex:1; height:1px;
    background:linear-gradient(90deg,${IIEE.goldBorder} 0%,transparent 100%);
  }
  .comb-divider-line.rev { background:linear-gradient(90deg,transparent 0%,${IIEE.goldBorder} 100%); }
  .comb-divider-label {
    font-family:'Montserrat',sans-serif;
    font-size:clamp(10px,1.5vw,12px); font-weight:700; letter-spacing:0.16em;
    text-transform:uppercase; color:${IIEE.gold}; white-space:nowrap;
    display:flex; align-items:center; gap:6px;
  }

  /* KPI cards */
  .metrics-grid {
    display:grid; grid-template-columns:repeat(auto-fill,minmax(clamp(120px,20vw,155px),1fr));
    gap:clamp(10px,2vw,14px); margin-bottom:0;
  }
  .metric-card {
    background:${IIEE.cardBg}; border:1px solid ${IIEE.cardBorder};
    border-radius:14px; padding:clamp(14px,3vw,18px) clamp(12px,2vw,16px) clamp(10px,2vw,14px);
    position:relative; overflow:hidden;
    transition:transform .18s, border-color .18s, box-shadow .18s; cursor:default;
  }
  .metric-card:hover {
    transform:translateY(-2px); border-color:${IIEE.gold};
    box-shadow:0 8px 28px rgba(245,197,24,0.12);
  }
  .metric-card::after {
    content:''; position:absolute; top:0; left:0; right:0; height:2px;
    background:var(--ac,${IIEE.gold}); opacity:0.8;
  }
  .metric-icon { font-size:clamp(16px,3vw,18px); margin-bottom:clamp(8px,2vw,10px); display:block; }
  .metric-label {
    font-size:clamp(10px,1.5vw,12px); font-weight:600; letter-spacing:0.1em;
    text-transform:uppercase; color:${IIEE.muted}; margin-bottom:6px; font-family:'Montserrat',sans-serif;
  }
  .metric-value {
    font-family:'Montserrat',sans-serif;
    font-size:clamp(20px,4vw,28px); font-weight:700; line-height:1;
    color:var(--ac,${IIEE.gold});
  }
  .metric-sub { font-size:clamp(10px,1.5vw,12px); color:${IIEE.dimText}; margin-top:4px; font-family:'Inter',sans-serif; }

  /* Section card */
  .sec-card {
    background:${IIEE.cardBg}; border:1px solid ${IIEE.cardBorder};
    border-radius:18px; margin-bottom:clamp(14px,3vw,20px); overflow:hidden;
    transition:border-color .18s;
  }
  .sec-card:hover { border-color:rgba(245,197,24,0.35); }
  .sec-head {
    display:flex; align-items:flex-start; gap:clamp(10px,2vw,14px);
    padding:clamp(12px,2vw,18px) clamp(14px,3vw,20px) clamp(10px,2vw,14px);
    border-bottom:1px solid rgba(245,197,24,0.1);
    background:linear-gradient(90deg,rgba(245,197,24,0.04) 0%,transparent 100%);
  }
  .sec-icon {
    width:clamp(32px,6vw,40px); height:clamp(32px,6vw,40px); border-radius:10px;
    display:flex; align-items:center; justify-content:center;
    font-size:clamp(16px,3vw,18px); background:${IIEE.goldGlow}; border:1px solid ${IIEE.goldBorder}; flex-shrink:0;
  }
  .sec-num {
    font-family:'Montserrat',sans-serif; font-size:clamp(10px,1.5vw,11px); font-weight:700;
    color:${IIEE.gold}; letter-spacing:0.1em; text-transform:uppercase; margin-bottom:2px;
  }
  .sec-title {
    font-family:'Montserrat',sans-serif; font-size:clamp(16px,3vw,18px); font-weight:700;
    text-transform:uppercase; letter-spacing:0.05em; color:${IIEE.white}; margin:0 0 2px;
  }
  .sec-subtitle { font-size:clamp(11px,1.5vw,12px); color:${IIEE.dimText}; margin:0; font-family:'Inter',sans-serif; }
  .sec-body { padding:clamp(12px,2vw,18px) clamp(14px,3vw,20px); }

  /* DS tag */
  .ds-tag {
    display:inline-flex; align-items:center; gap:4px;
    font-size:clamp(10px,1.5vw,11px); font-weight:600; letter-spacing:0.08em;
    text-transform:uppercase; background:rgba(56,189,248,0.1);
    border:1px solid rgba(56,189,248,0.2); border-radius:4px;
    padding:2px 8px; color:${IIEE.blue}; margin-bottom:12px; font-family:'Montserrat',sans-serif;
  }

  /* ─── Matrix table ─────────────────────────────────────────── */
  .matrix-wrap { overflow-x:auto; margin-bottom:16px; }
  .matrix-table { border-collapse:collapse; width:100%; min-width:600px; }
  .matrix-table th {
    padding:clamp(6px,1.5vw,9px) clamp(6px,1.5vw,10px);
    border-bottom:1px solid rgba(245,197,24,0.15);
    font-size:clamp(9px,1.2vw,11px); font-weight:700; letter-spacing:0.08em;
    text-transform:uppercase; color:${IIEE.dimText}; font-family:'Montserrat',sans-serif;
    white-space:nowrap;
  }
  .matrix-table th.row-header { text-align:left; }
  .matrix-table th.col-header { text-align:right; min-width:64px; }
  .matrix-table td {
    padding:clamp(6px,1.5vw,9px) clamp(6px,1.5vw,10px);
    border-bottom:1px solid rgba(30,41,59,0.5);
    font-size:clamp(10px,1.3vw,12px); text-align:right; white-space:nowrap;
    font-family:'DM Sans','Inter',sans-serif;
    cursor:pointer; transition:background .12s;
  }
  .matrix-table td.row-label {
    text-align:left; font-weight:700; color:${IIEE.white};
    font-size:clamp(10px,1.2vw,12px); cursor:default;
  }
  .matrix-table tr:hover td { background:rgba(245,197,24,0.03); }
  .matrix-table td.diag { color:${IIEE.dimText}; font-weight:400; }
  .matrix-table td.strong-pos { color:#22c55e; font-weight:700; }
  .matrix-table td.mod-pos    { color:#f59e0b; font-weight:700; }
  .matrix-table td.strong-neg { color:#f87171; font-weight:700; }
  .matrix-table td.mod-neg    { color:#fb923c; font-weight:600; }
  .matrix-table td.weak       { color:${IIEE.dimText}; font-weight:400; }

  /* Color legend */
  .color-legend {
    display:flex; flex-wrap:wrap; gap:10px;
    padding:12px 14px; background:rgba(255,255,255,0.025);
    border-radius:10px; margin-bottom:14px;
  }
  .legend-item { display:flex; align-items:center; gap:6px; font-size:clamp(10px,1.5vw,12px); color:${IIEE.muted}; font-family:'Inter',sans-serif; }
  .legend-dot { width:10px; height:10px; border-radius:3px; flex-shrink:0; }

  /* Row discussion accordion */
  .row-disc-container { margin-top:14px; }
  .row-disc-item {
    border:1px solid rgba(245,197,24,0.12); border-radius:10px; margin-bottom:6px; overflow:hidden;
  }
  .row-disc-header {
    display:flex; align-items:center; justify-content:space-between;
    padding:10px 14px; cursor:pointer;
    background:rgba(15,28,77,0.5); transition:background .15s;
    font-size:clamp(11px,1.5vw,12px); font-weight:700; font-family:'Montserrat',sans-serif;
    color:${IIEE.white}; letter-spacing:0.05em; text-transform:uppercase; gap:8px;
  }
  .row-disc-header:hover { background:rgba(245,197,24,0.06); }
  .row-disc-header .chev { transition:transform .2s; font-size:10px; flex-shrink:0; color:${IIEE.gold}; }
  .row-disc-body {
    padding:12px 16px; font-size:clamp(11px,1.5vw,13px); color:${IIEE.muted};
    line-height:1.7; font-family:'Inter',sans-serif;
    border-top:1px solid rgba(245,197,24,0.08);
    background:rgba(15,28,77,0.35);
  }

  /* Summary box */
  .summary-box {
    background:linear-gradient(135deg,rgba(245,197,24,0.06) 0%,rgba(245,197,24,0.02) 100%);
    border:1px solid rgba(245,197,24,0.22); border-radius:12px;
    padding:clamp(12px,2vw,16px) clamp(14px,2vw,18px); margin-bottom:16px;
    font-size:clamp(12px,1.5vw,13px); color:${IIEE.white}; line-height:1.7; font-family:'Inter',sans-serif;
  }
  .summary-box strong { color:${IIEE.gold}; font-family:'Montserrat',sans-serif; }

  /* Point-Biserial + Chi bar chart card */
  .chart-card {
    background:${IIEE.cardBg}; border:1px solid ${IIEE.cardBorder};
    border-radius:16px; padding:clamp(12px,3vw,18px); margin-bottom:16px;
    transition:border-color .18s;
  }
  .chart-card:hover { border-color:rgba(245,197,24,0.35); }
  .chart-head { display:flex; align-items:flex-start; gap:clamp(8px,2vw,10px); margin-bottom:clamp(10px,2vw,14px); }
  .chart-icon {
    width:clamp(30px,6vw,34px); height:clamp(30px,6vw,34px); border-radius:8px;
    display:flex; align-items:center; justify-content:center;
    font-size:clamp(14px,2.5vw,15px); background:${IIEE.goldGlow}; border:1px solid ${IIEE.goldBorder}; flex-shrink:0;
  }
  .chart-title {
    font-family:'Montserrat',sans-serif;
    font-size:clamp(13px,2.5vw,15px); font-weight:700; text-transform:uppercase;
    letter-spacing:0.05em; color:${IIEE.white}; margin:0 0 1px;
  }
  .chart-sub { font-size:clamp(11px,1.5vw,12px); color:${IIEE.dimText}; margin:0; font-family:'Inter',sans-serif; }
  .chart-note {
    margin-top:10px; padding:clamp(8px,2vw,12px);
    background:rgba(245,197,24,0.04); border-left:2px solid ${IIEE.goldBorder};
    border-radius:0 7px 7px 0; font-size:clamp(10px,1.5vw,11.5px); color:${IIEE.muted}; line-height:1.6; font-family:'Inter',sans-serif;
  }
  .chart-note strong { color:${IIEE.gold}; font-family:'Montserrat',sans-serif; }

  /* Chi-squared table */
  .chi-table { width:100%; border-collapse:collapse; }
  .chi-table th {
    font-size:clamp(10px,1.5vw,11px); font-weight:700; letter-spacing:0.08em;
    text-transform:uppercase; color:${IIEE.dimText};
    padding:clamp(6px,1.5vw,8px) clamp(8px,1.5vw,10px); border-bottom:1px solid rgba(245,197,24,0.12);
    text-align:left; font-family:'Montserrat',sans-serif;
  }
  .chi-table td {
    padding:clamp(8px,1.5vw,10px); border-bottom:1px solid rgba(255,255,255,0.04);
    font-size:clamp(11px,1.5vw,13px); font-family:'Inter',sans-serif;
  }
  .chi-table tr:last-child td { border-bottom:none; }
  .chi-table tr:hover td { background:rgba(245,197,24,0.03); }

  /* Collapsible guide */
  .guide-wrap {
    border:1px solid rgba(245,197,24,0.18); border-radius:14px; overflow:hidden; margin-bottom:20px;
  }
  .guide-header {
    display:flex; align-items:center; justify-content:space-between;
    padding:12px 16px; cursor:pointer;
    background:rgba(15,28,77,0.6); transition:background .15s;
    font-family:'Montserrat',sans-serif; font-size:clamp(12px,1.5vw,13px); font-weight:700;
    letter-spacing:0.08em; text-transform:uppercase; color:${IIEE.gold};
  }
  .guide-header:hover { background:rgba(245,197,24,0.06); }
  .guide-body { padding:14px 16px; display:grid; gap:10px; background:rgba(11,20,55,0.5); }
  .guide-section { margin-bottom:6px; }
  .guide-section-title { font-family:'Montserrat',sans-serif; font-size:clamp(11px,1.5vw,12px); font-weight:700; color:${IIEE.white}; margin-bottom:4px; }
  .guide-section-body { font-size:clamp(11px,1.5vw,12px); color:${IIEE.muted}; line-height:1.65; font-family:'Inter',sans-serif; }

  .g2 { display:grid; grid-template-columns:1fr 1fr; gap:clamp(12px,2vw,16px); }

  @media (max-width:960px) {
    .g2 { grid-template-columns:1fr; }
    .corr-body { padding:12px; }
  }
  @media (max-width:640px) {
    .corr-hero { padding:14px 12px 10px; }
    .sec-body { padding:10px 12px; }
    .corr-body { padding:8px; }
    .metrics-grid { grid-template-columns:1fr 1fr; gap:8px; }
  }

  .fade-in { animation:fadeIn .45s ease both; }
  @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
`;

/* ═══════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════ */
function cellClass(val, isDiag) {
  if (isDiag) return "diag";
  const a = Math.abs(val);
  if (val > 0) {
    if (a >= 0.7) return "strong-pos";
    if (a >= 0.4) return "mod-pos";
    return "weak";
  } else {
    if (a >= 0.7) return "strong-neg";
    if (a >= 0.4) return "mod-neg";
    return "weak";
  }
}

function cellBg(val, isDiag) {
  if (isDiag) return "transparent";
  const a = Math.abs(val);
  if (val > 0) {
    if (a >= 0.7) return "rgba(34,197,94,0.10)";
    if (a >= 0.4) return "rgba(245,158,11,0.08)";
  } else {
    if (a >= 0.7) return "rgba(248,113,113,0.10)";
    if (a >= 0.4) return "rgba(251,146,60,0.08)";
  }
  return "transparent";
}

function Divider({ label, icon }) {
  return (
    <div className="comb-divider">
      <div className="comb-divider-line" />
      <div className="comb-divider-label">{icon && <span>{icon}</span>}{label}</div>
      <div className="comb-divider-line rev" />
    </div>
  );
}

function KPI({ label, value, icon, color = IIEE.gold, sub }) {
  return (
    <div className="metric-card" style={{ "--ac": color }}>
      <span className="metric-icon">{icon}</span>
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      {sub && <div className="metric-sub">{sub}</div>}
    </div>
  );
}

function DsTag({ label }) {
  return <div className="ds-tag">📂 {label}</div>;
}

function SecCard({ num: number, icon, title, subtitle, children, accentColor }) {
  return (
    <div className="sec-card" style={accentColor ? { borderColor: `${accentColor}33` } : {}}>
      <div className="sec-head" style={accentColor ? { background: `linear-gradient(90deg,${accentColor}0a 0%,transparent 100%)` } : {}}>
        <div className="sec-icon" style={accentColor ? { background: `${accentColor}22`, borderColor: `${accentColor}55` } : {}}>
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          {number && <div className="sec-num">Section {number}</div>}
          <h3 className="sec-title">{title}</h3>
          {subtitle && <p className="sec-subtitle">{subtitle}</p>}
        </div>
      </div>
      <div className="sec-body">{children}</div>
    </div>
  );
}

function ColorLegend() {
  return (
    <div className="color-legend">
      <div className="legend-item"><div className="legend-dot" style={{ background: "#22c55e" }} />Strong Positive (r ≥ 0.70)</div>
      <div className="legend-item"><div className="legend-dot" style={{ background: "#f59e0b" }} />Moderate Positive (0.40 ≤ r &lt; 0.70)</div>
      <div className="legend-item"><div className="legend-dot" style={{ background: "#94a3b8" }} />Weak / Negligible (|r| &lt; 0.40)</div>
      <div className="legend-item"><div className="legend-dot" style={{ background: "#fb923c" }} />Moderate Negative (−0.70 &lt; r ≤ −0.40)</div>
      <div className="legend-item"><div className="legend-dot" style={{ background: "#f87171" }} />Strong Negative (r ≤ −0.70)</div>
      <div className="legend-item"><div className="legend-dot" style={{ background: "#64748b", opacity: 0.5 }} />Self-correlation (diagonal)</div>
    </div>
  );
}

/* ─── Correlation Matrix ─────────────────────────────────────── */
function CorrelationMatrix({ matrixRaw, variables, discussions, label }) {
  const [openRow, setOpenRow] = useState(null);

  const matrixRows = useMemo(() =>
    variables.map((rowKey) => ({ key: rowKey, label: VAR_LABELS[rowKey], data: matrixRaw[rowKey] })),
  [matrixRaw, variables]);

  // Compute summary stats
  const stats = useMemo(() => {
    let strong = 0, mod = 0, neg = 0, total = 0;
    variables.forEach((r) => variables.forEach((c) => {
      if (r === c) return;
      const v = matrixRaw[r][c];
      const a = Math.abs(v);
      total++;
      if (a >= 0.7) strong++;
      else if (a >= 0.4) mod++;
      if (v < 0) neg++;
    }));
    return { strong, mod, neg, total, weak: total - strong - mod };
  }, [matrixRaw, variables]);

  return (
    <div>
      {/* Summary box */}
      <div className="summary-box">
        <strong>Matrix Summary — {label}:</strong>{" "}
        Out of <strong>{stats.total}</strong> unique pairs, <strong style={{ color: IIEE.passGreen }}>{stats.strong} strong positive</strong> correlations (|r| ≥ 0.70),{" "}
        <strong style={{ color: IIEE.amber }}>{stats.mod} moderate</strong> (0.40–0.69), and{" "}
        <strong style={{ color: IIEE.dimText }}>{stats.weak} weak</strong> (&lt;0.40) relationships were identified.{" "}
        {stats.neg > 0 && <><strong style={{ color: IIEE.failRed }}>{stats.neg} pairs</strong> showed negative correlations — primarily involving GWA (inverse PH grading scale).</>}
      </div>

      <ColorLegend />

      {/* Table */}
      <div className="matrix-wrap">
        <table className="matrix-table">
          <thead>
            <tr>
              <th className="row-header">Variable</th>
              {variables.map((c) => (
                <th key={c} className="col-header">{VAR_SHORT[c]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrixRows.map((row) => (
              <tr key={row.key}>
                <td className="row-label">{row.label}</td>
                {variables.map((col) => {
                  const val = row.data[col];
                  const isDiag = col === row.key;
                  return (
                    <td
                      key={col}
                      className={cellClass(val, isDiag)}
                      style={{ background: cellBg(val, isDiag), borderRadius: Math.abs(val) >= 0.4 && !isDiag ? 4 : 0 }}
                    >
                      {val.toFixed(2)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Row-level discussions */}
      {discussions && (
        <div className="row-disc-container">
          <div style={{ fontSize: "clamp(11px,1.5vw,12px)", color: IIEE.dimText, marginBottom: 8, fontFamily: "'Montserrat',sans-serif", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            📖 Row-by-Row Discussion
          </div>
          {variables.map((key) => (
            <div key={key} className="row-disc-item">
              <div
                className="row-disc-header"
                onClick={() => setOpenRow(openRow === key ? null : key)}
              >
                <span>{VAR_LABELS[key]}</span>
                <span className="chev" style={{ transform: openRow === key ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
              </div>
              {openRow === key && (
                <div className="row-disc-body">{discussions[key]}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Guide ──────────────────────────────────────────────────── */
const GUIDE_SECTIONS = [
  { title: "What is a Correlation Matrix?", content: "A correlation matrix shows Pearson correlation coefficients (r) between pairs of academic and survey variables. Each cell tells you how strongly two variables move together — whether higher values in one tend to come with higher or lower values in another." },
  { title: "How to Read the Values", content: "Values range from −1.00 to +1.00. Near +1 = strong positive (both rise together). Near −1 = strong negative (one rises as the other falls). Near 0 = little linear relationship. The diagonal always shows 1.00 — each variable perfectly correlates with itself." },
  { title: "Color Coding System", content: "🟢 Green = strong positive (|r| ≥ 0.70) | 🟡 Amber = moderate positive (0.40–0.69) | 🔴 Red/Orange = negative (moderate to strong) | ⬜ Gray = weak or negligible. Diagonal cells are always muted — self-correlations." },
  { title: "Why Three Matrices?", content: "Comparing the Overall, Passers-only, and Failers-only matrices reveals whether the correlation structure changes by outcome group. Stronger within-group correlations signal that the variables work synergistically for that cohort." },
  { title: "Point-Biserial Correlation", content: "When one variable is continuous (e.g., ESAS score) and the other is binary (Passed=1 / Failed=0), we use the Point-Biserial correlation (rpb). It is equivalent to Pearson r and measures how strongly a continuous predictor separates the two groups. |rpb| ≥ 0.3 is considered practically meaningful." },
  { title: "Chi-Squared Test", content: "For two categorical variables (e.g., Strand × Pass/Fail), we use the Chi-Squared test of independence. A significant p-value (< 0.05) means the variables are not independent. Cramér's V (0–1) quantifies effect size: ≥ 0.3 = strong, 0.1–0.3 = moderate, < 0.1 = weak." },
  { title: "Correlation ≠ Causation", content: "High correlation does not prove causation. A hidden third variable may be driving both. Use these matrices as discovery tools — starting points for deeper investigation, not definitive proof." },
];

function CollapsibleGuide() {
  const [open, setOpen] = useState(false);
  return (
    <div className="guide-wrap" style={{ marginBottom: 20 }}>
      <div className="guide-header" onClick={() => setOpen(!open)}>
        <span>📘 How to Read This Dashboard</span>
        <span style={{ transition: "transform .2s", transform: open ? "rotate(180deg)" : "rotate(0)", color: IIEE.gold }}>▼</span>
      </div>
      {open && (
        <div className="guide-body">
          {GUIDE_SECTIONS.map((s, i) => (
            <div key={i} className="guide-section">
              <div className="guide-section-title">{s.title}</div>
              <div className="guide-section-body">{s.content}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Point-Biserial Chart ───────────────────────────────────── */
function Tip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: IIEE.navyMid, border: `1px solid ${IIEE.goldBorder}`, borderRadius: 10, padding: "10px 14px", fontSize: 12, color: IIEE.white, boxShadow: "0 8px 24px rgba(0,0,0,.5)" }}>
      {label && <div style={{ color: IIEE.gold, fontWeight: 700, marginBottom: 6, fontSize: 11, textTransform: "uppercase" }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.fill || p.color || IIEE.gold, display: "inline-block" }} />
          <span style={{ color: IIEE.muted }}>{p.name}:</span>
          <span style={{ fontWeight: 700 }}>{typeof p.value === "number" ? p.value.toFixed(3) : p.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function ProfessorCorrelationDashboard({
  overallMatrix,
  passersMatrix,
  failersMatrix,
  pointBiserial,
  chiSquared,
}) {
  const [activeTab, setActiveTab] = useState("overall");

  // Allow prop injection or fall back to demo data
  const ovMat   = overallMatrix  ?? OVERALL_MATRIX_RAW;
  const pasMat  = passersMatrix  ?? PASSERS_MATRIX_RAW;
  const failMat = failersMatrix  ?? FAILERS_MATRIX_RAW;
  const pbData  = pointBiserial  ?? POINT_BISERIAL;
  const chiData = chiSquared     ?? CHI_SQUARED;

  const tabs = [
    { key: "overall",  label: "Overall",        icon: "🧮", color: IIEE.gold },
    { key: "passers",  label: "Passers Only",   icon: "✅", color: IIEE.passGreen },
    { key: "failers",  label: "Failers Only",   icon: "❌", color: IIEE.failRed },
    { key: "stats",    label: "Statistical Tests", icon: "📐", color: IIEE.blue },
  ];


  const pbBarColor = (rpb) => {
    const a = Math.abs(rpb);
    if (a >= 0.5) return rpb > 0 ? IIEE.passGreen : IIEE.failRed;
    if (a >= 0.3) return rpb > 0 ? IIEE.amber : IIEE.orange;
    return IIEE.muted;
  };

  return (
    <div className="corr-wrap fade-in">
      <style>{styles}</style>

      {/* ── Hero ── */}
      <div className="corr-hero">
        <div className="corr-hero-badges">
          <span className="corr-badge gold">🧮 Correlation Analysis</span>
          <span className="corr-badge blue">📊 SLSU REE Analytics</span>
          <span className="corr-badge teal">2022 – 2025</span>
        </div>

        {/* Tab switcher — same pattern as ModelOverviewDashboard */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              className="tab-btn"
              onClick={() => setActiveTab(t.key)}
              style={{
                border: `1px solid ${activeTab === t.key ? t.color : "rgba(255,255,255,.15)"}`,
                background: activeTab === t.key ? `${t.color}33` : "rgba(11,20,55,.7)",
                color: activeTab === t.key ? t.color : IIEE.white,
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <h2 className="corr-hero-title">
          {activeTab === "overall"  && <>Correlation <span className="ag">Matrix</span> — Overall</>}
          {activeTab === "passers"  && <>Correlation <span style={{ color: IIEE.passGreen }}>Matrix</span> — Passers</>}
          {activeTab === "failers"  && <>Correlation <span style={{ color: IIEE.failRed }}>Matrix</span> — Failers</>}
          {activeTab === "stats"    && <>Statistical <span className="ab">Tests</span> — Biserial &amp; Chi²</>}
        </h2>
        <p className="corr-hero-sub">
          Pearson correlations, Point-Biserial, and Chi-Squared analysis — SLSU PRC 2022-2025
        </p>
      </div>

      <div className="corr-body">

        <CollapsibleGuide />

        {/* ── KPI Strip ── */}
        <Divider label="Key Correlation Indicators" icon="📌" />
        <div className="metrics-grid" style={{ marginBottom: 28 }}>
          <KPI label="Strongest Predictor" value="ESAS" icon="🏆" color={IIEE.gold} sub="rpb = 0.724 with Pass/Fail" />
          <KPI label="Highest Pair"        value="0.912" icon="📈" color={IIEE.passGreen} sub="EE–ESAS (Passers group)" />
          <KPI label="GWA Correlation"     value="−0.439" icon="🎓" color={IIEE.amber}     sub="With ESAS (inverse scale)" />
          <KPI label="Review vs Pass"      value="V=0.512" icon="🔗" color={IIEE.teal}    sub="Chi-Squared Cramér's V" />
          <KPI label="Variables Analyzed"  value="9" icon="🧮" color={IIEE.indigo} sub="Academic + Survey factors" />
          <KPI label="Significant Tests"   value="4/5" icon="✅" color={IIEE.passGreen} sub="Chi-Squared p < 0.05" />
        </div>

        {/* ════ OVERALL MATRIX ════ */}
        {activeTab === "overall" && (
          <>
            <Divider label="Overall Correlation Matrix — All 159 Students (2022-2025)" icon="🧮" />
            <SecCard num="1" icon="🧮" title="Overall Pearson Correlation Matrix"
              subtitle="All examinees (passers + failers), 2022-2025, n=159"
              accentColor={IIEE.gold}>
              <DsTag label="DATA_ALL — 159 rows, 2022-2025 (passers + failers)" />
              <CorrelationMatrix
                matrixRaw={ovMat}
                variables={VARS}
                discussions={ROW_DISCUSSIONS.overall}
                label="All Examinees"
              />
              <div className="chart-note" style={{ marginTop: 14 }}>
                <strong>Overall Interpretation:</strong> The three board exam subject scores (EE, MATH, ESAS) form a highly correlated cluster — students who are strong in one tend to be strong in all three. GWA is negatively correlated with all academic scores (Philippine grading: lower = better). Survey factors show moderate inter-correlations but weaker links to academic scores, suggesting institutional and psychological factors are supporting — not primary — determinants of board outcomes.
              </div>
            </SecCard>
          </>
        )}

        {/* ════ PASSERS MATRIX ════ */}
        {activeTab === "passers" && (
          <>
            <Divider label="Passers-Only Correlation Matrix — High-Performers (n≈98)" icon="✅" />
            <SecCard num="2" icon="✅" title="Passers-Only Pearson Correlation Matrix"
              subtitle="Examinees who passed the PRC board (Total Rating ≥ 70%), n≈98"
              accentColor={IIEE.passGreen}>
              <DsTag label="DATA_ALL (PASS subset) — 2022-2025, Passers only" />
              <CorrelationMatrix
                matrixRaw={pasMat}
                variables={VARS}
                discussions={ROW_DISCUSSIONS.passers}
                label="Passers Only"
              />
              <div className="chart-note" style={{ marginTop: 14 }}>
                <strong>Passers Interpretation:</strong> Among passers, academic inter-correlations are uniformly <em>stronger</em> than the overall matrix — confirming that passing the board is associated with holistic, integrated academic mastery rather than subject-specific strengths. Survey factor correlations are slightly elevated for passers, indicating that students who succeed tend to perceive institutional support and cognitive readiness as coherently aligned.
              </div>
            </SecCard>
          </>
        )}

        {/* ════ FAILERS MATRIX ════ */}
        {activeTab === "failers" && (
          <>
            <Divider label="Failers-Only Correlation Matrix — At-Risk Students (n≈61)" icon="❌" />
            <SecCard num="3" icon="❌" title="Failers-Only Pearson Correlation Matrix"
              subtitle="Examinees who did not pass the PRC board (Total Rating < 70%), n≈61"
              accentColor={IIEE.failRed}>
              <DsTag label="DATA_ALL (FAIL subset) — 2022-2025, Failers only" />
              <CorrelationMatrix
                matrixRaw={failMat}
                variables={VARS}
                discussions={ROW_DISCUSSIONS.failers}
                label="Failers Only"
              />
              <div className="chart-note" style={{ marginTop: 14 }}>
                <strong>Failers Interpretation:</strong> Failers show consistently <em>weaker</em> correlations across all pairs compared to passers. The most notable drops are in academic inter-correlations (EE–ESAS: 0.854 vs 0.912) and Board Prep–ESAS (0.428 vs 0.512). This fragmentation suggests failers lack the integrated preparation structure seen in passers — targeted, holistic review programs should be prioritized for at-risk students.
              </div>
            </SecCard>
          </>
        )}

        {/* ════ STATISTICAL TESTS ════ */}
        {activeTab === "stats" && (
          <>
            <Divider label="Statistical Tests — Point-Biserial & Chi-Squared" icon="📐" />

            {/* Point-Biserial */}
            <SecCard num="4" icon="🔗" title="Point-Biserial Correlation — Continuous vs Pass/Fail"
              subtitle="How strongly does each continuous variable predict the binary Pass/Fail outcome?"
              accentColor={IIEE.blue}>
              <DsTag label="DATA_ALL — 159 rows | Continuous variable × Pass/Fail binary" />

              <div className="summary-box">
                <strong>What is Point-Biserial Correlation?</strong> When one variable is continuous (e.g., ESAS score) and the other is binary (Passed = 1, Failed = 0), the Point-Biserial correlation (r<sub>pb</sub>) measures how strongly that continuous variable separates the two groups. It is mathematically equivalent to Pearson r in this special case. Values closer to ±1 indicate stronger predictive power. A threshold of |r<sub>pb</sub>| ≥ 0.30 is considered practically meaningful in educational research.
              </div>

              <div className="chart-card" style={{ marginBottom: 0 }}>
                <div className="chart-head">
                  <div className="chart-icon">🔗</div>
                  <div>
                    <div className="chart-title">r<sub>pb</sub> — All Variables vs Pass/Fail</div>
                    <div className="chart-sub">Positive = higher score → more likely to pass | Negative = lower numerical GWA (better grade) → more likely to pass</div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={pbData.map((d) => ({ ...d, absRpb: Math.abs(d.rpb) }))}
                    layout="vertical"
                    margin={{ top: 4, right: 40, left: 8, bottom: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,197,24,.10)" horizontal={false} />
                    <XAxis type="number" domain={[-0.8, 0.8]} tick={{ fill: IIEE.dimText, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="label" tick={{ fill: IIEE.white, fontSize: 11 }} axisLine={false} tickLine={false} width={110} />
                    <Tooltip content={<Tip />} />
                    <ReferenceLine x={0} stroke="rgba(255,255,255,.2)" />
                    <ReferenceLine x={0.3}  stroke={IIEE.gold} strokeDasharray="4 3" label={{ value: "0.30", position: "top", fill: IIEE.gold, fontSize: 10 }} />
                    <ReferenceLine x={-0.3} stroke={IIEE.gold} strokeDasharray="4 3" label={{ value: "−0.30", position: "top", fill: IIEE.gold, fontSize: 10 }} />
                    <Bar dataKey="rpb" name="rpb" radius={[0, 4, 4, 0]}>
                      {pbData.map((d, i) => <Cell key={i} fill={pbBarColor(d.rpb)} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="chart-note" style={{ marginTop: 10 }}>
                  <strong>Key Finding:</strong> ESAS has the highest point-biserial correlation (r<sub>pb</sub> = 0.724), confirming it as the strongest individual predictor of pass/fail outcome. EE (0.612) and MATH (0.578) follow. All academic variables are statistically significant (p &lt; 0.001). Survey factors show smaller but still significant correlations (0.228–0.341), suggesting they provide incremental predictive value beyond academic scores alone.
                </div>
              </div>

              {/* pb table */}
              <div style={{ overflowX: "auto", marginTop: 14 }}>
                <table className="chi-table">
                  <thead>
                    <tr>
                      <th>Variable</th>
                      <th>r<sub>pb</sub></th>
                      <th>p-value</th>
                      <th>Significant?</th>
                      <th>Interpretation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pbData.map((d, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 700, color: IIEE.white }}>{d.label}</td>
                        <td style={{ fontWeight: 700, color: pbBarColor(d.rpb) }}>{d.rpb.toFixed(3)}</td>
                        <td style={{ color: d.p < 0.001 ? IIEE.passGreen : d.p < 0.05 ? IIEE.amber : IIEE.failRed }}>
                          {d.p < 0.001 ? "< 0.001" : d.p.toFixed(3)}
                        </td>
                        <td>
                          <span style={{
                            padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700,
                            background: d.sig ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
                            color: d.sig ? IIEE.passGreen : IIEE.failRed,
                          }}>
                            {d.sig ? "✓ Yes" : "✗ No"}
                          </span>
                        </td>
                        <td style={{ color: IIEE.muted, fontSize: 12 }}>
                          {Math.abs(d.rpb) >= 0.5 ? "Strong predictor" : Math.abs(d.rpb) >= 0.3 ? "Moderate predictor" : "Weak predictor"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SecCard>

            {/* Chi-Squared */}
            <SecCard num="5" icon="📊" title="Chi-Squared Test of Independence — Categorical Variables"
              subtitle="Are categorical variables (Strand, Review, Year, Period) associated with Pass/Fail outcomes?"
              accentColor={IIEE.teal}>
              <DsTag label="DATA_ALL — 159 rows | Categorical × Categorical associations" />

              <div className="summary-box">
                <strong>What is the Chi-Squared Test?</strong> When both variables are categorical (e.g., Academic Strand and Pass/Fail), we cannot use Pearson correlation. Instead, the Chi-Squared (χ²) test checks whether the two variables are independent — i.e., whether knowing someone's strand tells us anything about whether they passed. A p-value &lt; 0.05 means the association is statistically significant. <strong>Cramér's V</strong> (0–1) measures effect size: V ≥ 0.30 = strong, 0.10–0.29 = moderate, &lt; 0.10 = weak.
              </div>

              <div style={{ overflowX: "auto" }}>
                <table className="chi-table">
                  <thead>
                    <tr>
                      <th>Variable 1</th>
                      <th>Variable 2</th>
                      <th>χ² Statistic</th>
                      <th>df</th>
                      <th>p-value</th>
                      <th>Significant?</th>
                      <th>Cramér's V</th>
                      <th>Effect Size</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chiData.map((d, i) => {
                      const effectLabel = d.cramer >= 0.3 ? "Strong" : d.cramer >= 0.1 ? "Moderate" : "Weak";
                      const effectColor = d.cramer >= 0.3 ? IIEE.passGreen : d.cramer >= 0.1 ? IIEE.amber : IIEE.dimText;
                      return (
                        <tr key={i}>
                          <td style={{ fontWeight: 700, color: IIEE.white }}>{d.var1}</td>
                          <td style={{ color: IIEE.white }}>{d.var2}</td>
                          <td style={{ fontWeight: 700, color: IIEE.blue }}>{d.chi2.toFixed(2)}</td>
                          <td style={{ color: IIEE.muted }}>{d.df}</td>
                          <td style={{ color: d.sig ? IIEE.passGreen : IIEE.failRed }}>
                            {d.p < 0.001 ? "< 0.001" : d.p.toFixed(3)}
                          </td>
                          <td>
                            <span style={{
                              padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700,
                              background: d.sig ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
                              color: d.sig ? IIEE.passGreen : IIEE.failRed,
                            }}>
                              {d.sig ? "✓ Yes" : "✗ No"}
                            </span>
                          </td>
                          <td style={{ fontWeight: 700, color: effectColor }}>{d.cramer.toFixed(3)}</td>
                          <td>
                            <span style={{
                              padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700,
                              background: `${effectColor}18`, color: effectColor,
                            }}>
                              {effectLabel}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="chart-note" style={{ marginTop: 14 }}>
                <strong>Key Findings:</strong> The strongest chi-squared association is <strong>Review Attendance × Pass/Fail</strong> (χ²=41.87, V=0.512 — strong effect), confirming that attending a board review program is the single most impactful categorical predictor of passing. <strong>Year × Pass/Fail</strong> is also significant (V=0.258 — moderate), reflecting genuine year-over-year performance shifts, including the anomalous 2025 August sitting. <strong>Strand × Pass/Fail</strong> shows a moderate but significant association (V=0.236), suggesting TVL/GAS strand students are systematically disadvantaged versus STEM.
              </div>

              {/* Per-row discussion for chi-squared */}
              <div style={{ marginTop: 14 }}>
                {[
                  { pair: "Review × Pass/Fail", body: "Students who attended a formal board review program passed at dramatically higher rates — the chi-squared test yields χ²=41.87 with Cramér's V=0.512, indicating a strong association. This is the single most actionable categorical finding: mandating or incentivizing review attendance is expected to have the largest categorical impact on institutional pass rates." },
                  { pair: "Strand × Pass/Fail", body: "Academic strand (STEM, TVL, GAS, Others) is significantly associated with pass/fail outcomes (χ²=18.42, V=0.236 — moderate). STEM graduates consistently outperform TVL and GAS strand graduates on the board. Strand-specific bridging courses, particularly for non-STEM students entering the EE program, are recommended." },
                  { pair: "Year × Pass/Fail", body: "The year of examination is significantly associated with outcomes (χ²=22.14, V=0.258 — moderate), driven largely by the 2025 August cohort's anomalous 4.5% pass rate. This association confirms that year-to-year institutional and curricular factors — not just individual student characteristics — influence pass rates." },
                  { pair: "Period × Pass/Fail", body: "Examination period (e.g., regular sitting vs. special sitting) shows a weaker but statistically significant association (χ²=9.31, V=0.172 — moderate). Some periods systematically yield lower pass rates, which warrants calendar-aware academic preparation and scheduling strategies." },
                  { pair: "Strand × Review", body: "Interestingly, Strand and Review attendance are NOT significantly associated (χ²=6.18, p=0.103), meaning students across all strands attend review programs at roughly similar rates. The performance gap between strands is therefore attributable to pre-existing academic preparation differences, not differential review participation." },
                ].map((d, i) => (
                  <div key={i} style={{ marginBottom: 8, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(245,197,24,0.10)", borderRadius: 10, overflow: "hidden" }}>
                    <div style={{ padding: "8px 14px", background: "rgba(15,28,77,0.5)", fontFamily: "'Montserrat',sans-serif", fontWeight: 700, fontSize: "clamp(11px,1.5vw,12px)", letterSpacing: "0.06em", color: IIEE.teal, textTransform: "uppercase" }}>
                      {d.pair}
                    </div>
                    <div style={{ padding: "10px 14px", fontSize: "clamp(11px,1.5vw,13px)", color: IIEE.muted, lineHeight: 1.7, fontFamily: "'Inter',sans-serif" }}>
                      {d.body}
                    </div>
                  </div>
                ))}
              </div>
            </SecCard>

            {/* Comparator: Passers vs Failers on rpb */}
            <SecCard num="6" icon="⚖️" title="Passers vs Failers — Academic Score Comparison"
              subtitle="Mean academic scores by group to contextualize Point-Biserial findings"
              accentColor={IIEE.indigo}>
              <div className="g2">
                {[
                  { label: "ESAS", pass: 82.4, fail: 64.2 },
                  { label: "EE",   pass: 79.8, fail: 61.7 },
                  { label: "MATH", pass: 77.3, fail: 60.4 },
                  { label: "GWA",  pass: 1.74, fail: 1.97, lower: true },
                ].map((s, i) => (
                  <div key={i} style={{ background: IIEE.cardBg, border: `1px solid ${IIEE.cardBorder}`, borderRadius: 12, padding: "14px 16px" }}>
                    <div style={{ fontFamily: "'Montserrat',sans-serif", fontSize: "clamp(12px,1.5vw,13px)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: IIEE.white, marginBottom: 12 }}>{s.label}</div>
                    <div style={{ display: "flex", gap: 12 }}>
                      {[
                        { g: "Passers", v: s.pass, c: IIEE.passGreen },
                        { g: "Failers", v: s.fail, c: IIEE.failRed },
                      ].map((g, j) => (
                        <div key={j} style={{ flex: 1, textAlign: "center", background: "rgba(255,255,255,0.02)", borderRadius: 8, padding: "10px 6px" }}>
                          <div style={{ fontSize: 10, color: IIEE.dimText, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>{g.g}</div>
                          <div style={{ fontFamily: "'Montserrat',sans-serif", fontSize: "clamp(18px,3vw,24px)", fontWeight: 700, color: g.c }}>{g.v.toFixed(s.label === "GWA" ? 2 : 1)}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 8, fontSize: 11, color: IIEE.muted, textAlign: "center" }}>
                      Δ = {Math.abs(s.pass - s.fail).toFixed(s.label === "GWA" ? 2 : 1)} {s.label === "GWA" ? "(passers lower = better)" : "pts"}
                    </div>
                  </div>
                ))}
              </div>
              <div className="chart-note" style={{ marginTop: 14 }}>
                <strong>Gap Analysis:</strong> ESAS shows the largest absolute gap between groups (82.4 vs 64.2 = 18.2 pts), reinforcing its dominant role as the top predictor. EE follows (18.1 pts) and MATH (16.9 pts). GWA shows a gap of 0.23 grade points (1.74 vs 1.97), where lower is better in the Philippine system — this validates GWA's significant negative point-biserial correlation.
              </div>
            </SecCard>
          </>
        )}

      </div>
    </div>
  );
}