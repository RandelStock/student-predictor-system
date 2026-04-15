import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

/* ═══════════════════════════════════════════════════════════════
   DESIGN TOKENS
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
   REAL COMPUTED DATA — from DATA_ALL.csv (n=159, 2022-2025)
   Scale: Survey items inverted so higher = stronger agreement
   Factors: F_Cognitive (cols 25-48), F_NonCognitive (49-72),
            F_Institutional (73-97), F_Education (binary cols 9,11,13,16),
            F_BoardPrep (review attended + study schedule + learning resources)
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

// ── OVERALL MATRIX (n=159, all examinees) ──
const OVERALL_MATRIX_RAW = {
  EE:              { EE:1.000, MATH:0.782, ESAS:0.761, GWA:-0.532, F_Education:0.424, F_BoardPrep:0.576, F_Cognitive:0.498, F_NonCognitive:0.345, F_Institutional:0.358 },
  MATH:            { EE:0.782, MATH:1.000, ESAS:0.814, GWA:-0.624, F_Education:0.480, F_BoardPrep:0.569, F_Cognitive:0.563, F_NonCognitive:0.418, F_Institutional:0.466 },
  ESAS:            { EE:0.761, MATH:0.814, ESAS:1.000, GWA:-0.631, F_Education:0.420, F_BoardPrep:0.535, F_Cognitive:0.565, F_NonCognitive:0.379, F_Institutional:0.517 },
  GWA:             { EE:-0.532, MATH:-0.624, ESAS:-0.631, GWA:1.000, F_Education:-0.416, F_BoardPrep:-0.412, F_Cognitive:-0.429, F_NonCognitive:-0.351, F_Institutional:-0.361 },
  F_Education:     { EE:0.424, MATH:0.480, ESAS:0.420, GWA:-0.416, F_Education:1.000, F_BoardPrep:0.503, F_Cognitive:0.394, F_NonCognitive:0.414, F_Institutional:0.172 },
  F_BoardPrep:     { EE:0.576, MATH:0.569, ESAS:0.535, GWA:-0.412, F_Education:0.503, F_BoardPrep:1.000, F_Cognitive:0.459, F_NonCognitive:0.380, F_Institutional:0.219 },
  F_Cognitive:     { EE:0.498, MATH:0.563, ESAS:0.565, GWA:-0.429, F_Education:0.394, F_BoardPrep:0.459, F_Cognitive:1.000, F_NonCognitive:0.714, F_Institutional:0.534 },
  F_NonCognitive:  { EE:0.345, MATH:0.418, ESAS:0.379, GWA:-0.351, F_Education:0.414, F_BoardPrep:0.380, F_Cognitive:0.714, F_NonCognitive:1.000, F_Institutional:0.471 },
  F_Institutional: { EE:0.358, MATH:0.466, ESAS:0.517, GWA:-0.361, F_Education:0.172, F_BoardPrep:0.219, F_Cognitive:0.534, F_NonCognitive:0.471, F_Institutional:1.000 },
};

// ── PASSERS MATRIX (n=93) ──
const PASSERS_MATRIX_RAW = {
  EE:              { EE:1.000, MATH:0.561, ESAS:0.582, GWA:-0.481, F_Education:0.196, F_BoardPrep:0.301, F_Cognitive:0.079, F_NonCognitive:0.145, F_Institutional:-0.053 },
  MATH:            { EE:0.561, MATH:1.000, ESAS:0.685, GWA:-0.384, F_Education:0.202, F_BoardPrep:-0.039, F_Cognitive:0.261, F_NonCognitive:0.179, F_Institutional:-0.022 },
  ESAS:            { EE:0.582, MATH:0.685, ESAS:1.000, GWA:-0.507, F_Education:0.037, F_BoardPrep:-0.037, F_Cognitive:0.038, F_NonCognitive:0.073, F_Institutional:0.082 },
  GWA:             { EE:-0.481, MATH:-0.384, ESAS:-0.507, GWA:1.000, F_Education:-0.323, F_BoardPrep:-0.180, F_Cognitive:-0.168, F_NonCognitive:-0.090, F_Institutional:0.071 },
  F_Education:     { EE:0.196, MATH:0.202, ESAS:0.037, GWA:-0.323, F_Education:1.000, F_BoardPrep:0.261, F_Cognitive:0.286, F_NonCognitive:0.304, F_Institutional:-0.128 },
  F_BoardPrep:     { EE:0.301, MATH:-0.039, ESAS:-0.037, GWA:-0.180, F_Education:0.261, F_BoardPrep:1.000, F_Cognitive:0.247, F_NonCognitive:0.228, F_Institutional:-0.257 },
  F_Cognitive:     { EE:0.079, MATH:0.261, ESAS:0.038, GWA:-0.168, F_Education:0.286, F_BoardPrep:0.247, F_Cognitive:1.000, F_NonCognitive:0.743, F_Institutional:0.336 },
  F_NonCognitive:  { EE:0.145, MATH:0.179, ESAS:0.073, GWA:-0.090, F_Education:0.304, F_BoardPrep:0.228, F_Cognitive:0.743, F_NonCognitive:1.000, F_Institutional:0.410 },
  F_Institutional: { EE:-0.053, MATH:-0.022, ESAS:0.082, GWA:0.071, F_Education:-0.128, F_BoardPrep:-0.257, F_Cognitive:0.336, F_NonCognitive:0.410, F_Institutional:1.000 },
};

// ── FAILERS MATRIX (n=66) ──
const FAILERS_MATRIX_RAW = {
  EE:              { EE:1.000, MATH:0.561, ESAS:0.392, GWA:-0.023, F_Education:0.235, F_BoardPrep:0.314, F_Cognitive:0.322, F_NonCognitive:0.054, F_Institutional:-0.158 },
  MATH:            { EE:0.561, MATH:1.000, ESAS:0.337, GWA:-0.361, F_Education:0.341, F_BoardPrep:0.394, F_Cognitive:0.224, F_NonCognitive:0.175, F_Institutional:0.033 },
  ESAS:            { EE:0.392, MATH:0.337, ESAS:1.000, GWA:-0.122, F_Education:0.242, F_BoardPrep:0.177, F_Cognitive:0.341, F_NonCognitive:0.006, F_Institutional:-0.205 },
  GWA:             { EE:-0.023, MATH:-0.361, ESAS:-0.122, GWA:1.000, F_Education:-0.164, F_BoardPrep:-0.090, F_Cognitive:-0.101, F_NonCognitive:-0.242, F_Institutional:-0.183 },
  F_Education:     { EE:0.235, MATH:0.341, ESAS:0.242, GWA:-0.164, F_Education:1.000, F_BoardPrep:0.420, F_Cognitive:0.114, F_NonCognitive:0.286, F_Institutional:-0.095 },
  F_BoardPrep:     { EE:0.314, MATH:0.394, ESAS:0.177, GWA:-0.090, F_Education:0.420, F_BoardPrep:1.000, F_Cognitive:0.148, F_NonCognitive:0.168, F_Institutional:-0.192 },
  F_Cognitive:     { EE:0.322, MATH:0.224, ESAS:0.341, GWA:-0.101, F_Education:0.114, F_BoardPrep:0.148, F_Cognitive:1.000, F_NonCognitive:0.472, F_Institutional:0.123 },
  F_NonCognitive:  { EE:0.054, MATH:0.175, ESAS:0.006, GWA:-0.242, F_Education:0.286, F_BoardPrep:0.168, F_Cognitive:0.472, F_NonCognitive:1.000, F_Institutional:0.128 },
  F_Institutional: { EE:-0.158, MATH:0.033, ESAS:-0.205, GWA:-0.183, F_Education:-0.095, F_BoardPrep:-0.192, F_Cognitive:0.123, F_NonCognitive:0.128, F_Institutional:1.000 },
};

// ── POINT-BISERIAL (continuous vs Pass/Fail binary) ──
const POINT_BISERIAL = [
  { label: "ESAS",             rpb:  0.865, p: 0.0000, sig: true },
  { label: "MATH",             rpb:  0.757, p: 0.0000, sig: true },
  { label: "EE",               rpb:  0.677, p: 0.0000, sig: true },
  { label: "F: Institutional", rpb:  0.613, p: 0.0000, sig: true },
  { label: "F: Cognitive",     rpb:  0.585, p: 0.0000, sig: true },
  { label: "F: Board Prep",    rpb:  0.578, p: 0.0000, sig: true },
  { label: "GWA",              rpb: -0.567, p: 0.0000, sig: true },
  { label: "F: Non-Cognitive", rpb:  0.416, p: 0.0000, sig: true },
  { label: "F: Education",     rpb:  0.410, p: 0.0000, sig: true },
];

// ── CHI-SQUARED (categorical associations) ──
const CHI_SQUARED = [
  { var1: "Review",  var2: "Pass/Fail", chi2: 66.48, df: 1, p: 0.0000, sig: true,  cramer: 0.647 },
  { var1: "Year",    var2: "Pass/Fail", chi2: 61.81, df: 7, p: 0.0000, sig: true,  cramer: 0.623 },
  { var1: "Period",  var2: "Pass/Fail", chi2: 46.68, df: 1, p: 0.0000, sig: true,  cramer: 0.542 },
  { var1: "Strand",  var2: "Pass/Fail", chi2: 16.89, df: 3, p: 0.0007, sig: true,  cramer: 0.326 },
  { var1: "Strand",  var2: "Review",    chi2: 35.05, df: 3, p: 0.0000, sig: true,  cramer: 0.470 },
];

// ── ROW DISCUSSIONS — updated with real correlation values ──
const ROW_DISCUSSIONS = {
  overall: {
    EE: "EE scores show strong positive correlations with MATH (r=0.782) and ESAS (r=0.761), confirming that board exam subjects cluster together. The moderate-strong negative correlation with GWA (r=−0.532) reflects the inverse Philippine grading convention — lower GWA numbers mean better grades. EE also shows a meaningful positive link with Board Preparation (r=0.576) and Cognitive readiness (r=0.498), suggesting students who feel ready tend to perform better.",
    MATH: "MATH has the strongest academic inter-correlation overall, peaking with ESAS (r=0.814) and EE (r=0.782). Its negative correlation with GWA is the strongest among the three academic subjects (r=−0.624), indicating GWA is a reliable inverse proxy for MATH performance. MATH also shows meaningful associations with Cognitive (r=0.563), Board Prep (r=0.569), and Institutional factors (r=0.466).",
    ESAS: "ESAS is the central predictor variable — its correlation with MATH (r=0.814) and EE (r=0.761) form the academic core cluster. ESAS has the strongest negative correlation with GWA (r=−0.631) of all three subjects, and a meaningful positive correlation with Institutional factors (r=0.517) and Cognitive readiness (r=0.565). Point-Biserial analysis confirms ESAS as the single strongest predictor of pass/fail outcome (rpb=0.865).",
    GWA: "GWA is uniquely negative across the board due to the inverse Philippine grading scale (1.0 = highest distinction). It has the strongest negative correlations with academic scores (EE: −0.532, MATH: −0.624, ESAS: −0.631) and moderate negative links with all survey factors (−0.351 to −0.429). This confirms that students with better academic standing (lower GWA) also tend to rate their cognitive and institutional readiness more positively.",
    F_Education: "Educational Background factor (comprising SHS preparedness, EE as first choice, college preparation adequacy, and graduating on time) shows moderate positive correlations with all three board subjects (0.420–0.480) and a moderate negative link with GWA (r=−0.416), consistent with the scale direction. Its correlation with Board Prep (r=0.503) suggests a moderate overlap between educational readiness and board preparation commitment.",
    F_BoardPrep: "Board Preparation factor (review attendance + structured study schedule + use of learning resources) shows the strongest correlations with academic scores among all survey factors: EE (0.576), MATH (0.569), ESAS (0.535). This means students who prepared more systematically also performed better on the board exam. Point-Biserial confirms this with rpb=0.578 (p<0.001), making board prep the second-strongest survey predictor of pass/fail.",
    F_Cognitive: "Cognitive factor (24 items on knowledge foundation and problem-solving ability) shows moderate-strong correlations with academic scores (EE: 0.498, MATH: 0.563, ESAS: 0.565) and the strongest within-survey correlation of any pair: F_NonCognitive (r=0.714). Students who rated themselves as cognitively capable tended to perform better on board exams and also rated their non-cognitive and institutional factors more favorably.",
    F_NonCognitive: "Non-Cognitive factor (motivation, self-regulation, stress management, and social/environmental support — 24 items) shows moderate correlations with academic scores (0.345–0.418). Its strongest relationships are with the Cognitive factor (r=0.714) and Institutional factor (r=0.471), forming a coherent 'readiness cluster.' Students who manage stress and stay motivated tend to also perceive cognitive and institutional support as more favorable.",
    F_Institutional: "Institutional factor (curriculum alignment, faculty quality, departmental reviews, facilities, and culture — 25 items) shows moderate positive correlations with academic scores (EE: 0.358, MATH: 0.466, ESAS: 0.517) and moderate within-survey correlations (Cognitive: 0.534, NonCognitive: 0.471). Point-Biserial rpb=0.613 makes this the 4th strongest predictor of pass/fail — notably stronger than expected for an institutional variable.",
  },
  passers: {
    EE: "Among passers, EE–MATH (r=0.561) and EE–ESAS (r=0.582) correlations are notably weaker than the overall group. This is a restriction-of-range effect: all passers cleared the 70% threshold, so score variance narrows. Survey factor correlations also drop sharply — many near zero or negative — indicating that within the passing cohort, survey attitudes no longer differentiate performance differences the way academic scores do.",
    MATH: "Within passers, MATH–ESAS correlation remains the strongest academic pair (r=0.685), suggesting MATH and ESAS mastery are most tightly linked among high-performers. MATH–EE drops to r=0.561. Survey factor correlations become negligible or negative for passers — Board Prep (r=−0.039 vs MATH) — reflecting that among those who passed, variation in board prep no longer predicts academic differences.",
    ESAS: "ESAS–MATH (r=0.685) and ESAS–EE (r=0.582) are the dominant academic links for passers. Survey factor correlations are near-zero, consistent with restriction of range. Notably, ESAS–Institutional drops to r=0.082 among passers (vs 0.517 overall), showing that institutional factors distinguish passers from failers at the population level but have minimal influence within the passing cohort.",
    GWA: "GWA's negative correlations with academic scores are maintained for passers (EE: −0.481, ESAS: −0.507), confirming the Philippine grading direction holds within this subgroup. GWA–Institutional turns slightly positive (r=0.071) for passers, suggesting that among those who passed, having a higher GWA (slightly worse grades) may marginally co-occur with better perceived institutional support — a weak but interesting reversal.",
    F_Education: "Education factor correlations weaken substantially for passers: EE drops from 0.424 (overall) to 0.196, ESAS from 0.420 to 0.037. This restriction-of-range pattern means that within the passing group, differences in educational background no longer meaningfully differentiate individual score levels — all passers had sufficient background to clear the threshold.",
    F_BoardPrep: "Board Prep shows a striking within-passers pattern: correlations with MATH (r=−0.039) and ESAS (r=−0.037) turn negative. This suggests that among passers, those who attended extensive review were not necessarily the highest scorers — perhaps because STEM-track high performers needed less remedial review. The EE correlation remains positive (r=0.301), likely because EE is more review-sensitive.",
    F_Cognitive: "Cognitive factor within passers shows near-zero correlations with EE (r=0.079) and ESAS (r=0.038) but a moderate link with MATH (r=0.261). The Non-Cognitive correlation strengthens to r=0.743, forming the dominant survey cluster for passers. Among those who passed, cognitive self-ratings no longer predict academic scores — the passing threshold acts as a floor that homogenizes academic performance.",
    F_NonCognitive: "Within passers, Non-Cognitive–Cognitive (r=0.743) and Non-Cognitive–Institutional (r=0.410) remain the strongest survey relationships. Academic score correlations drop sharply (EE: 0.145, ESAS: 0.073). This is consistent with the idea that among passers, non-cognitive attitudes are internally consistent but no longer drive score differentiation — everyone who passed had sufficient non-cognitive readiness.",
    F_Institutional: "Institutional factor turns weakly negative for passers on academic scores (EE: −0.053, MATH: −0.022) — a striking shift from the positive correlations in the overall group. This means that among passers, those who rated institutional support higher were very marginally less likely to be the top scorers. The survey cluster correlations (Non-Cognitive: 0.410, Cognitive: 0.336) remain positive, maintaining internal coherence.",
  },
  failers: {
    EE: "Among failers, EE–MATH (r=0.561) matches the passers group, but EE–ESAS drops dramatically to r=0.392 (vs 0.582 passers, 0.761 overall). GWA–EE correlation essentially collapses to r=−0.023 (near zero), meaning GWA no longer predicts EE performance within the failing cohort — failers are a more heterogeneous group where low GWA does not reliably distinguish who got higher EE scores.",
    MATH: "MATH–EE remains r=0.561 for failers (same as passers), but MATH–ESAS drops to r=0.337. GWA–MATH (r=−0.361) is stronger for failers than GWA–EE (r=−0.023), suggesting MATH performance within the failing group is still somewhat linked to academic standing. Survey correlations for MATH are higher in failers than passers (Education: 0.341, Board Prep: 0.394), meaning among failers, attitude factors still partially differentiate performance.",
    ESAS: "ESAS inter-correlations collapse most dramatically for failers: EE drops to r=0.392 and MATH to r=0.337 (vs 0.761 and 0.814 overall). GWA–ESAS (r=−0.122) is nearly zero for failers, confirming complete breakdown of the GWA–academic score relationship within this subgroup. ESAS–Institutional turns negative (r=−0.205), suggesting failers who rated institutional support higher actually scored lower on ESAS — a possible frustration effect.",
    GWA: "GWA correlations fragment significantly for failers. GWA–EE (r=−0.023) and GWA–ESAS (r=−0.122) are near-zero, while GWA–MATH (r=−0.361) retains moderate strength. The breakdown of GWA's predictive power within the failing group indicates that failers are not a homogeneous low-GWA cohort — some failers had reasonable GWAs but still could not pass, pointing to non-GWA factors (review quality, test anxiety, specific subject gaps) as differentiating.",
    F_Education: "Education factor correlations are maintained or slightly higher for failers on academic scores (EE: 0.235, MATH: 0.341, ESAS: 0.242) compared to passers. This suggests that within the failing group, those with stronger educational backgrounds still scored relatively better on board subjects — educational background remains a differentiator within the failing cohort even though it was insufficient for passing.",
    F_BoardPrep: "Board Prep remains a positive correlate within failers (EE: 0.314, MATH: 0.394) but with a much weaker ESAS link (r=0.177 vs 0.535 overall). Notably, Board Prep–Institutional turns negative (r=−0.192) for failers, suggesting failers who prepared more for the board tended to rate institutional support less favorably — possibly reflecting that students who needed more self-directed review perceived institutional support as insufficient.",
    F_Cognitive: "Cognitive factor shows moderate positive correlations with academic scores for failers (EE: 0.322, ESAS: 0.341), stronger than within passers. This means within the failing group, those who rated themselves as more cognitively capable did score relatively higher — cognitive self-efficacy is still a within-group differentiator for failers. Non-Cognitive correlation drops to r=0.472 (vs 0.743 passers), reflecting more fragmented self-assessment among failers.",
    F_NonCognitive: "Non-Cognitive correlations mostly collapse for failers vs academic scores (EE: 0.054, ESAS: 0.006). This near-zero relationship means non-cognitive attitudes — stress management, motivation, social support — do not help predict which failers scored higher. However, Non-Cognitive–Cognitive (r=0.472) remains a moderate cluster, suggesting failers with better non-cognitive profiles also tend to have better cognitive self-ratings.",
    F_Institutional: "Institutional factor shows several negative correlations with academic scores for failers (EE: −0.158, ESAS: −0.205). This is a critical finding: failers who rated institutional support more highly tended to score lower on board exams — possibly because students who relied on institutional support rather than independent preparation were systematically less prepared. This points to a need to enhance the quality and rigor of departmental review programs.",
  },
};

/* ═══════════════════════════════════════════════════════════════
   STYLES
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
  .tab-btn {
    padding:8px 14px; border-radius:8px;
    font-size:clamp(11px,1.5vw,12px); font-weight:700;
    cursor:pointer; transition:all .18s; font-family:'Inter',sans-serif;
    border:none; outline:none;
  }
  .corr-body { padding:clamp(14px,4vw,24px) clamp(16px,5vw,28px) clamp(32px,6vw,48px); }
  .comb-divider { display:flex; align-items:center; gap:10px; margin:clamp(18px,4vw,28px) 0 clamp(10px,2vw,16px); }
  .comb-divider-line { flex:1; height:1px; background:linear-gradient(90deg,${IIEE.goldBorder} 0%,transparent 100%); }
  .comb-divider-line.rev { background:linear-gradient(90deg,transparent 0%,${IIEE.goldBorder} 100%); }
  .comb-divider-label {
    font-family:'Montserrat',sans-serif;
    font-size:clamp(10px,1.5vw,12px); font-weight:700; letter-spacing:0.16em;
    text-transform:uppercase; color:${IIEE.gold}; white-space:nowrap;
    display:flex; align-items:center; gap:6px;
  }
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
  .metric-card:hover { transform:translateY(-2px); border-color:${IIEE.gold}; box-shadow:0 8px 28px rgba(245,197,24,0.12); }
  .metric-card::after {
    content:''; position:absolute; top:0; left:0; right:0; height:2px;
    background:var(--ac,${IIEE.gold}); opacity:0.8;
  }
  .metric-icon { font-size:clamp(16px,3vw,18px); margin-bottom:clamp(8px,2vw,10px); display:block; }
  .metric-label { font-size:clamp(10px,1.5vw,12px); font-weight:600; letter-spacing:0.1em; text-transform:uppercase; color:${IIEE.muted}; margin-bottom:6px; font-family:'Montserrat',sans-serif; }
  .metric-value { font-family:'Montserrat',sans-serif; font-size:clamp(20px,4vw,28px); font-weight:700; line-height:1; color:var(--ac,${IIEE.gold}); }
  .metric-sub { font-size:clamp(10px,1.5vw,12px); color:${IIEE.dimText}; margin-top:4px; font-family:'Inter',sans-serif; }
  .sec-card {
    background:${IIEE.cardBg}; border:1px solid ${IIEE.cardBorder};
    border-radius:18px; margin-bottom:clamp(14px,3vw,20px); overflow:hidden; transition:border-color .18s;
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
  .sec-num { font-family:'Montserrat',sans-serif; font-size:clamp(10px,1.5vw,11px); font-weight:700; color:${IIEE.gold}; letter-spacing:0.1em; text-transform:uppercase; margin-bottom:2px; }
  .sec-title { font-family:'Montserrat',sans-serif; font-size:clamp(16px,3vw,18px); font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:${IIEE.white}; margin:0 0 2px; }
  .sec-subtitle { font-size:clamp(11px,1.5vw,12px); color:${IIEE.dimText}; margin:0; font-family:'Inter',sans-serif; }
  .sec-body { padding:clamp(12px,2vw,18px) clamp(14px,3vw,20px); }
  .ds-tag {
    display:inline-flex; align-items:center; gap:4px;
    font-size:clamp(10px,1.5vw,11px); font-weight:600; letter-spacing:0.08em;
    text-transform:uppercase; background:rgba(56,189,248,0.1);
    border:1px solid rgba(56,189,248,0.2); border-radius:4px;
    padding:2px 8px; color:${IIEE.blue}; margin-bottom:12px; font-family:'Montserrat',sans-serif;
  }
  .matrix-wrap { overflow-x:auto; margin-bottom:16px; }
  .matrix-table { border-collapse:collapse; width:100%; min-width:600px; }
  .matrix-table th {
    padding:clamp(6px,1.5vw,9px) clamp(6px,1.5vw,10px);
    border-bottom:1px solid rgba(245,197,24,0.15);
    font-size:clamp(9px,1.2vw,11px); font-weight:700; letter-spacing:0.08em;
    text-transform:uppercase; color:${IIEE.dimText}; font-family:'Montserrat',sans-serif; white-space:nowrap;
  }
  .matrix-table th.row-header { text-align:left; }
  .matrix-table th.col-header { text-align:right; min-width:64px; }
  .matrix-table td {
    padding:clamp(6px,1.5vw,9px) clamp(6px,1.5vw,10px);
    border-bottom:1px solid rgba(30,41,59,0.5);
    font-size:clamp(10px,1.3vw,12px); text-align:right; white-space:nowrap;
    font-family:'DM Sans','Inter',sans-serif; cursor:pointer; transition:background .12s;
  }
  .matrix-table td.row-label { text-align:left; font-weight:700; color:${IIEE.white}; font-size:clamp(10px,1.2vw,12px); cursor:default; }
  .matrix-table tr:hover td { background:rgba(245,197,24,0.03); }
  .matrix-table td.diag { color:${IIEE.dimText}; font-weight:400; }
  .matrix-table td.very-strong-pos { color:#16a34a; font-weight:800; }
  .matrix-table td.strong-pos { color:#22c55e; font-weight:700; }
  .matrix-table td.mod-pos    { color:#f59e0b; font-weight:700; }
  .matrix-table td.weak-pos   { color:#64748b; font-weight:400; }
  .matrix-table td.very-strong-neg { color:#b91c1c; font-weight:800; }
  .matrix-table td.strong-neg { color:#f87171; font-weight:700; }
  .matrix-table td.mod-neg    { color:#fb923c; font-weight:600; }
  .matrix-table td.weak-neg   { color:#64748b; font-weight:400; }
  .color-legend { display:flex; flex-wrap:wrap; gap:10px; padding:12px 14px; background:rgba(255,255,255,0.025); border-radius:10px; margin-bottom:14px; }
  .legend-item { display:flex; align-items:center; gap:6px; font-size:clamp(10px,1.5vw,12px); color:${IIEE.muted}; font-family:'Inter',sans-serif; }
  .legend-dot { width:10px; height:10px; border-radius:3px; flex-shrink:0; }
  .row-disc-container { margin-top:14px; }
  .row-disc-item { border:1px solid rgba(245,197,24,0.12); border-radius:10px; margin-bottom:6px; overflow:hidden; }
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
    border-top:1px solid rgba(245,197,24,0.08); background:rgba(15,28,77,0.35);
  }
  .summary-box {
    background:linear-gradient(135deg,rgba(245,197,24,0.06) 0%,rgba(245,197,24,0.02) 100%);
    border:1px solid rgba(245,197,24,0.22); border-radius:12px;
    padding:clamp(12px,2vw,16px) clamp(14px,2vw,18px); margin-bottom:16px;
    font-size:clamp(12px,1.5vw,13px); color:${IIEE.white}; line-height:1.7; font-family:'Inter',sans-serif;
  }
  .summary-box strong { color:${IIEE.gold}; font-family:'Montserrat',sans-serif; }
  .chart-card {
    background:${IIEE.cardBg}; border:1px solid ${IIEE.cardBorder};
    border-radius:16px; padding:clamp(12px,3vw,18px); margin-bottom:16px; transition:border-color .18s;
  }
  .chart-card:hover { border-color:rgba(245,197,24,0.35); }
  .chart-head { display:flex; align-items:flex-start; gap:clamp(8px,2vw,10px); margin-bottom:clamp(10px,2vw,14px); }
  .chart-icon {
    width:clamp(30px,6vw,34px); height:clamp(30px,6vw,34px); border-radius:8px;
    display:flex; align-items:center; justify-content:center;
    font-size:clamp(14px,2.5vw,15px); background:${IIEE.goldGlow}; border:1px solid ${IIEE.goldBorder}; flex-shrink:0;
  }
  .chart-title { font-family:'Montserrat',sans-serif; font-size:clamp(13px,2.5vw,15px); font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:${IIEE.white}; margin:0 0 1px; }
  .chart-sub { font-size:clamp(11px,1.5vw,12px); color:${IIEE.dimText}; margin:0; font-family:'Inter',sans-serif; }
  .chart-note {
    margin-top:10px; padding:clamp(8px,2vw,12px);
    background:rgba(245,197,24,0.04); border-left:2px solid ${IIEE.goldBorder};
    border-radius:0 7px 7px 0; font-size:clamp(10px,1.5vw,11.5px); color:${IIEE.muted}; line-height:1.6; font-family:'Inter',sans-serif;
  }
  .chart-note strong { color:${IIEE.gold}; font-family:'Montserrat',sans-serif; }
  .chi-table { width:100%; border-collapse:collapse; }
  .chi-table th {
    font-size:clamp(10px,1.5vw,11px); font-weight:700; letter-spacing:0.08em;
    text-transform:uppercase; color:${IIEE.dimText};
    padding:clamp(6px,1.5vw,8px) clamp(8px,1.5vw,10px); border-bottom:1px solid rgba(245,197,24,0.12);
    text-align:left; font-family:'Montserrat',sans-serif;
  }
  .chi-table td { padding:clamp(8px,1.5vw,10px); border-bottom:1px solid rgba(255,255,255,0.04); font-size:clamp(11px,1.5vw,13px); font-family:'Inter',sans-serif; }
  .chi-table tr:last-child td { border-bottom:none; }
  .chi-table tr:hover td { background:rgba(245,197,24,0.03); }
  .guide-wrap { border:1px solid rgba(245,197,24,0.18); border-radius:14px; overflow:hidden; margin-bottom:20px; }
  .guide-header {
    display:flex; align-items:center; justify-content:space-between;
    padding:12px 16px; cursor:pointer;
    background:rgba(15,28,77,0.6); transition:background .15s;
    font-family:'Montserrat',sans-serif; font-size:clamp(12px,1.5vw,13px); font-weight:700;
    letter-spacing:0.08em; text-transform:uppercase; color:${IIEE.gold};
  }
  .guide-header:hover { background:rgba(245,197,24,0.06); }
  .guide-body { padding:14px 16px; display:grid; gap:10px; background:rgba(11,20,55,0.5); }
  .guide-section-title { font-family:'Montserrat',sans-serif; font-size:clamp(11px,1.5vw,12px); font-weight:700; color:${IIEE.white}; margin-bottom:4px; }
  .guide-section-body { font-size:clamp(11px,1.5vw,12px); color:${IIEE.muted}; line-height:1.65; font-family:'Inter',sans-serif; }
  .g2 { display:grid; grid-template-columns:1fr 1fr; gap:clamp(12px,2vw,16px); }
  @media (max-width:960px) { .g2 { grid-template-columns:1fr; } .corr-body { padding:12px; } }
  @media (max-width:640px) { .corr-hero { padding:14px 12px 10px; } .sec-body { padding:10px 12px; } .corr-body { padding:8px; } .metrics-grid { grid-template-columns:1fr 1fr; gap:8px; } }
  .fade-in { animation:fadeIn .45s ease both; }
  @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
`;

/* ═══════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════ */
// Table 2.0 interpretation scale
function cellClass(val, isDiag) {
  if (isDiag) return "diag";
  const a = Math.abs(val);
  if (val > 0) {
    if (a >= 0.80) return "very-strong-pos";
    if (a >= 0.60) return "strong-pos";
    if (a >= 0.40) return "mod-pos";
    return "weak-pos";
  } else {
    if (a >= 0.80) return "very-strong-neg";
    if (a >= 0.60) return "strong-neg";
    if (a >= 0.40) return "mod-neg";
    return "weak-neg";
  }
}

function cellBg(val, isDiag) {
  if (isDiag) return "transparent";
  const a = Math.abs(val);
  if (val > 0) {
    if (a >= 0.80) return "rgba(22,163,74,0.15)";
    if (a >= 0.60) return "rgba(34,197,94,0.10)";
    if (a >= 0.40) return "rgba(245,158,11,0.08)";
  } else {
    if (a >= 0.80) return "rgba(185,28,28,0.15)";
    if (a >= 0.60) return "rgba(248,113,113,0.10)";
    if (a >= 0.40) return "rgba(251,146,60,0.08)";
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

function SecCard({ num, icon, title, subtitle, children, accentColor }) {
  return (
    <div className="sec-card" style={accentColor ? { borderColor: `${accentColor}33` } : {}}>
      <div className="sec-head" style={accentColor ? { background: `linear-gradient(90deg,${accentColor}0a 0%,transparent 100%)` } : {}}>
        <div className="sec-icon" style={accentColor ? { background: `${accentColor}22`, borderColor: `${accentColor}55` } : {}}>
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          {num && <div className="sec-num">Section {num}</div>}
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
      <div className="legend-item"><div className="legend-dot" style={{ background: "#16a34a" }} />Very Strong Pos (r ≥ 0.80)</div>
      <div className="legend-item"><div className="legend-dot" style={{ background: "#22c55e" }} />Strong Pos (0.60–0.79)</div>
      <div className="legend-item"><div className="legend-dot" style={{ background: "#f59e0b" }} />Moderate Pos (0.40–0.59)</div>
      <div className="legend-item"><div className="legend-dot" style={{ background: "#64748b", opacity:0.7 }} />Weak (|r| &lt; 0.40)</div>
      <div className="legend-item"><div className="legend-dot" style={{ background: "#fb923c" }} />Moderate Neg (−0.59 to −0.40)</div>
      <div className="legend-item"><div className="legend-dot" style={{ background: "#f87171" }} />Strong Neg (−0.79 to −0.60)</div>
      <div className="legend-item"><div className="legend-dot" style={{ background: "#b91c1c" }} />Very Strong Neg (r ≤ −0.80)</div>
    </div>
  );
}

function CorrelationMatrix({ matrixRaw, variables, discussions, label }) {
  const [openRow, setOpenRow] = useState(null);

  const stats = useMemo(() => {
    let veryStrong=0, strong=0, mod=0, neg=0, total=0;
    variables.forEach((r) => variables.forEach((c) => {
      if (r === c) return;
      const v = matrixRaw[r][c];
      const a = Math.abs(v);
      total++;
      if (a >= 0.80) veryStrong++;
      else if (a >= 0.60) strong++;
      else if (a >= 0.40) mod++;
      if (v < 0) neg++;
    }));
    return { veryStrong, strong, mod, neg, total, weak: total - veryStrong - strong - mod };
  }, [matrixRaw, variables]);

  return (
    <div>
      <div className="summary-box">
        <strong>Matrix Summary — {label}:</strong>{" "}
        Out of <strong>{stats.total}</strong> unique pairs:{" "}
        <strong style={{ color: "#16a34a" }}>{stats.veryStrong} very strong</strong> (|r| ≥ 0.80),{" "}
        <strong style={{ color: IIEE.passGreen }}>{stats.strong} strong</strong> (0.60–0.79),{" "}
        <strong style={{ color: IIEE.amber }}>{stats.mod} moderate</strong> (0.40–0.59), and{" "}
        <strong style={{ color: IIEE.dimText }}>{stats.weak} weak</strong> (&lt;0.40) relationships identified.{" "}
        {stats.neg > 0 && <><strong style={{ color: IIEE.failRed }}>{stats.neg} pairs</strong> showed negative correlations — primarily involving GWA (inverse PH grading scale).</>}
      </div>
      <ColorLegend />
      <div className="matrix-wrap">
        <table className="matrix-table">
          <thead>
            <tr>
              <th className="row-header">Variable</th>
              {variables.map((c) => <th key={c} className="col-header">{VAR_SHORT[c]}</th>)}
            </tr>
          </thead>
          <tbody>
            {variables.map((rowKey) => (
              <tr key={rowKey}>
                <td className="row-label">{VAR_LABELS[rowKey]}</td>
                {variables.map((col) => {
                  const val = matrixRaw[rowKey][col];
                  const isDiag = col === rowKey;
                  return (
                    <td key={col} className={cellClass(val, isDiag)} style={{ background: cellBg(val, isDiag), borderRadius: Math.abs(val) >= 0.40 && !isDiag ? 4 : 0 }}>
                      {val.toFixed(3)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {discussions && (
        <div className="row-disc-container">
          <div style={{ fontSize: "clamp(11px,1.5vw,12px)", color: IIEE.dimText, marginBottom: 8, fontFamily: "'Montserrat',sans-serif", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            📖 Row-by-Row Discussion
          </div>
          {variables.map((key) => (
            <div key={key} className="row-disc-item">
              <div className="row-disc-header" onClick={() => setOpenRow(openRow === key ? null : key)}>
                <span>{VAR_LABELS[key]}</span>
                <span className="chev" style={{ transform: openRow === key ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
              </div>
              {openRow === key && <div className="row-disc-body">{discussions[key]}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const GUIDE_SECTIONS = [
  { title: "What is a Correlation Matrix?", content: "A correlation matrix shows Pearson correlation coefficients (r) between pairs of academic and survey variables. Each cell tells you how strongly two variables move together." },
  { title: "Table 2.0 Interpretation Scale", content: "0.80–1.00 = Very Strong | 0.60–0.799 = Strong | 0.40–0.599 = Moderate | 0.20–0.399 = Weak | 0.00–0.199 = Very Weak. Negative values follow the same magnitude scale but indicate an inverse relationship." },
  { title: "Survey Factor Coding", content: "Survey items use an inverted scale where lower raw values mean stronger agreement (1 = Strongly Agree). All factors are re-coded so that higher factor scores = greater perceived readiness/support, ensuring positive correlations with performance are intuitive." },
  { title: "Why Three Matrices?", content: "Comparing Overall, Passers-only, and Failers-only matrices reveals whether the correlation structure changes by outcome group. Restriction-of-range effects are expected within subgroups — correlations typically weaken within homogeneous groups." },
  { title: "Point-Biserial Correlation", content: "When one variable is continuous (e.g., ESAS score) and the other is binary (Passed=1 / Failed=0), the Point-Biserial correlation (rpb) measures how strongly the continuous variable separates the two groups. Equivalent to Pearson r for binary outcomes." },
  { title: "Chi-Squared Test & Cramér's V", content: "For two categorical variables (e.g., Strand × Pass/Fail), Chi-Squared tests independence. Cramér's V (0–1) is the effect size: V ≥ 0.50 = Very Strong, 0.30–0.49 = Strong, 0.10–0.29 = Moderate, < 0.10 = Weak." },
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
            <div key={i} style={{ marginBottom: 6 }}>
              <div className="guide-section-title">{s.title}</div>
              <div className="guide-section-body">{s.content}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Tip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: IIEE.navyMid, border: `1px solid ${IIEE.goldBorder}`, borderRadius: 10, padding: "10px 14px", fontSize: 12, color: IIEE.white, boxShadow: "0 8px 24px rgba(0,0,0,.5)" }}>
      {label && <div style={{ color: IIEE.gold, fontWeight: 700, marginBottom: 6, fontSize: 11, textTransform: "uppercase" }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.fill || IIEE.gold, display: "inline-block" }} />
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
export default function ProfessorCorrelationDashboard() {
  const [activeTab, setActiveTab] = useState("overall");

  const tabs = [
    { key: "overall",  label: "Overall",           icon: "🧮", color: IIEE.gold },
    { key: "passers",  label: "Passers Only",      icon: "✅", color: IIEE.passGreen },
    { key: "failers",  label: "Failers Only",      icon: "❌", color: IIEE.failRed },
    { key: "stats",    label: "Statistical Tests", icon: "📐", color: IIEE.blue },
  ];

  const pbBarColor = (rpb) => {
    const a = Math.abs(rpb);
    if (a >= 0.70) return rpb > 0 ? "#16a34a" : IIEE.failRed;
    if (a >= 0.50) return rpb > 0 ? IIEE.passGreen : "#ef4444";
    if (a >= 0.30) return rpb > 0 ? IIEE.amber : IIEE.orange;
    return IIEE.muted;
  };

  const sortedPointBiserial = useMemo(() => {
    return [...POINT_BISERIAL].sort((a, b) => Math.abs(b.rpb) - Math.abs(a.rpb));
  }, []);

  const strongestPredictor = sortedPointBiserial[0];
  const secondPredictor = sortedPointBiserial[1];
  const thirdPredictor = sortedPointBiserial[2];
  const institutionalPredictor = POINT_BISERIAL.find((d) => d.label === "F: Institutional");
  const overallHighestPair = useMemo(() => {
    let best = { pair: "", value: -Infinity };
    VARS.forEach((r, ri) => VARS.forEach((c, ci) => {
      if (ri >= ci) return;
      const value = OVERALL_MATRIX_RAW[r][c];
      if (Math.abs(value) > Math.abs(best.value)) {
        best = { pair: `${VAR_LABELS[r]}–${VAR_LABELS[c]}`, value };
      }
    }));
    return best;
  }, []);

  return (
    <div className="corr-wrap fade-in">
      <style>{styles}</style>

      {/* ── Hero ── */}
      <div className="corr-hero">
        <div className="corr-hero-badges">
          <span className="corr-badge gold">🧮 Correlation Analysis</span>
          <span className="corr-badge blue">📊 SLSU REE Analytics</span>
          <span className="corr-badge teal">2022 – 2025 • n=159</span>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          {tabs.map((t) => (
            <button key={t.key} className="tab-btn" onClick={() => setActiveTab(t.key)}
              style={{
                border: `1px solid ${activeTab === t.key ? t.color : "rgba(255,255,255,.15)"}`,
                background: activeTab === t.key ? `${t.color}33` : "rgba(11,20,55,.7)",
                color: activeTab === t.key ? t.color : IIEE.white,
              }}>
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
          Real computed values from DATA_ALL.csv — SLSU PRC Board Examinations 2022–2025
        </p>
      </div>

      <div className="corr-body">
        <CollapsibleGuide />

        {/* ── KPI Strip ── */}
        <Divider label="Key Correlation Indicators" icon="📌" />
        <div className="metrics-grid" style={{ marginBottom: 28 }}>
          <KPI label="Strongest Predictor" value={strongestPredictor.label} icon="🏆" color={IIEE.gold} sub={`rpb = ${strongestPredictor.rpb.toFixed(3)} with Pass/Fail`} />
          <KPI label="Highest Pair" value={overallHighestPair.value.toFixed(3)} icon="📈" color={IIEE.passGreen} sub={`${overallHighestPair.pair} (overall group)`} />
          <KPI label="GWA–ESAS" value="−0.631" icon="🎓" color={IIEE.amber} sub="Strongest academic-GWA link" />
          <KPI label="Review vs Pass" value="V=0.647" icon="🔗" color={IIEE.teal} sub="Strongest Chi-Sq effect" />
          <KPI label="Passers / Total" value="93/159" icon="🧮" color={IIEE.indigo} sub="58.5% pass rate, 2022-2025" />
          <KPI label="Sig. Tests" value="5/5" icon="✅" color={IIEE.passGreen} sub="All Chi-Squared p < 0.05" />
        </div>

        {/* ════ OVERALL ════ */}
        {activeTab === "overall" && (
          <>
            <Divider label="Overall Pearson Correlation Matrix — All 159 Examinees (2022-2025)" icon="🧮" />
            <SecCard num="1" icon="🧮" title="Overall Pearson Correlation Matrix"
              subtitle="All examinees (passers + failers), 2022-2025, n=159"
              accentColor={IIEE.gold}>
              <div className="ds-tag">📂 DATA_ALL.csv — 159 rows, 2022-2025 (passers + failers)</div>
              <CorrelationMatrix matrixRaw={OVERALL_MATRIX_RAW} variables={VARS} discussions={ROW_DISCUSSIONS.overall} label="All Examinees (n=159)" />
              <div className="chart-note" style={{ marginTop: 14 }}>
                <strong>Overall Interpretation:</strong> The three board exam subjects (EE, MATH, ESAS) form a very strong-to-strong cluster (0.761–0.814), confirming integrated academic mastery drives board outcomes. ESAS–MATH (r=0.814) is the strongest academic pair. GWA carries strong negative correlations with all academic scores (−0.532 to −0.631) consistent with the inverse Philippine grading system. Survey factors show moderate positive associations with academic scores, with Board Prep (0.535–0.576) and Cognitive readiness (0.498–0.565) leading. Notably, Institutional factor (rpb=0.613) is a stronger individual predictor of pass/fail than EE scores alone.
              </div>
            </SecCard>
          </>
        )}

        {/* ════ PASSERS ════ */}
        {activeTab === "passers" && (
          <>
            <Divider label="Passers-Only Correlation Matrix — n=93 (58.5% pass rate)" icon="✅" />
            <SecCard num="2" icon="✅" title="Passers-Only Pearson Correlation Matrix"
              subtitle="Examinees who passed the PRC board (Total Rating ≥ 70%), n=93"
              accentColor={IIEE.passGreen}>
              <div className="ds-tag">📂 DATA_ALL.csv (PASSED subset) — 93 passers, 2022-2025</div>
              <CorrelationMatrix matrixRaw={PASSERS_MATRIX_RAW} variables={VARS} discussions={ROW_DISCUSSIONS.passers} label="Passers Only (n=93)" />
              <div className="chart-note" style={{ marginTop: 14 }}>
                <strong>Passers Interpretation:</strong> Within the passing cohort, academic inter-correlations weaken substantially due to restriction of range — all passers cleared the 70% threshold, compressing variance. MATH–ESAS (r=0.685) remains the dominant academic pair. Survey factor correlations drop to near-zero or turn weakly negative for academic scores, confirming that once students pass, survey attitudes no longer meaningfully differentiate their academic scores. The Non-Cognitive–Cognitive cluster (r=0.743) is the strongest relationship among passers, reflecting internally consistent self-assessments within this high-performing group.
              </div>
            </SecCard>
          </>
        )}

        {/* ════ FAILERS ════ */}
        {activeTab === "failers" && (
          <>
            <Divider label="Failers-Only Correlation Matrix — n=66 (41.5% failure rate)" icon="❌" />
            <SecCard num="3" icon="❌" title="Failers-Only Pearson Correlation Matrix"
              subtitle="Examinees who did not pass the PRC board (Total Rating < 70%), n=66"
              accentColor={IIEE.failRed}>
              <div className="ds-tag">📂 DATA_ALL.csv (FAILED subset) — 66 failers, 2022-2025</div>
              <CorrelationMatrix matrixRaw={FAILERS_MATRIX_RAW} variables={VARS} discussions={ROW_DISCUSSIONS.failers} label="Failers Only (n=66)" />
              <div className="chart-note" style={{ marginTop: 14 }}>
                <strong>Failers Interpretation:</strong> Failers show dramatically fragmented academic inter-correlations — particularly ESAS–EE dropping to r=0.392 and ESAS–MATH to r=0.337 (vs 0.761 and 0.814 overall). GWA–EE nearly collapses (r=−0.023), meaning GWA alone cannot identify at-risk students within this subgroup. Most strikingly, Institutional factor turns negatively correlated with academic scores for failers (EE: −0.158, ESAS: −0.205), suggesting failers who rated institutional support highest were actually the weakest performers — a potential over-reliance on institutional preparation rather than self-directed study.
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
              <div className="ds-tag">📂 DATA_ALL.csv — 159 rows | Continuous × Pass/Fail binary (Eq. 1.1)</div>
              <div className="summary-box">
                <strong>Formula (Eq. 1.1):</strong> r<sub>pb</sub> = ((M₁ − M₀) / S) × √(pq) — where M₁ is the mean score of passers, M₀ is the mean score of failers, S is the overall standard deviation, p is the proportion who passed (0.585), and q is the proportion who failed (0.415). All 9 variables are statistically significant at p &lt; 0.001.
              </div>
              <div className="chart-card" style={{ marginBottom: 0 }}>
                <div className="chart-head">
                  <div className="chart-icon">🔗</div>
                  <div>
                    <div className="chart-title">r<sub>pb</sub> — All Variables vs Pass/Fail (sorted by |rpb|)</div>
                    <div className="chart-sub">Positive = higher score → more likely to pass | GWA negative = lower GWA number (better grade) → more likely to pass</div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={sortedPointBiserial} layout="vertical" margin={{ top: 4, right: 50, left: 12, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,197,24,.10)" horizontal={false} />
                    <XAxis type="number" domain={[-0.70, 0.95]} tick={{ fill: IIEE.dimText, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="label" tick={{ fill: IIEE.white, fontSize: 11 }} axisLine={false} tickLine={false} width={120} />
                    <Tooltip content={<Tip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} wrapperStyle={{ outline: "none" }} />
                    <ReferenceLine x={0} stroke="rgba(255,255,255,.2)" />
                    <ReferenceLine x={0.40}  stroke={IIEE.amber}     strokeDasharray="4 3" label={{ value: "0.40", position: "top", fill: IIEE.amber,     fontSize: 10 }} />
                    <ReferenceLine x={0.60}  stroke={IIEE.passGreen} strokeDasharray="4 3" label={{ value: "0.60", position: "top", fill: IIEE.passGreen, fontSize: 10 }} />
                    <ReferenceLine x={-0.40} stroke={IIEE.amber}     strokeDasharray="4 3" label={{ value: "−0.40", position: "top", fill: IIEE.amber,   fontSize: 10 }} />
                    <Bar dataKey="rpb" name="rpb" radius={[0, 4, 4, 0]}>
                      {sortedPointBiserial.map((d, i) => <Cell key={i} fill={pbBarColor(d.rpb)} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="chart-note" style={{ marginTop: 10 }}>
                  <strong>Key Finding:</strong> {strongestPredictor.label} dominates with rpb={strongestPredictor.rpb.toFixed(3)} — by far the strongest individual predictor. {secondPredictor.label} ({secondPredictor.rpb.toFixed(3)}) and {thirdPredictor.label} ({thirdPredictor.rpb.toFixed(3)}) follow. Remarkably, {institutionalPredictor.label} (rpb={institutionalPredictor.rpb.toFixed(3)}) outperforms {thirdPredictor.label} as a predictor of pass/fail outcome, indicating that institutional perceptions (curriculum, faculty, dept support, facilities) strongly differentiate passers from failers at the population level. GWA (rpb=−0.567) is the 7th strongest predictor.
                </div>
              </div>
              <div style={{ overflowX: "auto", marginTop: 14 }}>
                <table className="chi-table">
                  <thead>
                    <tr>
                      <th>Variable</th><th>r<sub>pb</sub></th><th>p-value</th><th>Significant?</th><th>Strength (Table 2.0)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedPointBiserial.map((d, i) => {
                      const a = Math.abs(d.rpb);
                      const strength = a >= 0.80 ? "Very Strong" : a >= 0.60 ? "Strong" : a >= 0.40 ? "Moderate" : a >= 0.20 ? "Weak" : "Very Weak";
                      const sc = a >= 0.80 ? "#16a34a" : a >= 0.60 ? IIEE.passGreen : a >= 0.40 ? IIEE.amber : IIEE.dimText;
                      return (
                        <tr key={i}>
                          <td style={{ fontWeight: 700, color: IIEE.white }}>{d.label}</td>
                          <td style={{ fontWeight: 700, color: pbBarColor(d.rpb) }}>{d.rpb.toFixed(3)}</td>
                          <td style={{ color: d.p < 0.001 ? IIEE.passGreen : IIEE.amber }}>{"< 0.001"}</td>
                          <td><span style={{ padding:"2px 8px", borderRadius:4, fontSize:11, fontWeight:700, background:"rgba(34,197,94,0.12)", color:IIEE.passGreen }}>✓ Yes</span></td>
                          <td><span style={{ padding:"2px 8px", borderRadius:4, fontSize:11, fontWeight:700, background:`${sc}18`, color:sc }}>{strength}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </SecCard>

            {/* Chi-Squared */}
            <SecCard num="5" icon="📊" title="Chi-Squared Test of Independence — Categorical Variables"
              subtitle="Are categorical variables (Strand, Review, Year, Period) associated with Pass/Fail outcomes?"
              accentColor={IIEE.teal}>
              <div className="ds-tag">📂 DATA_ALL.csv — 159 rows | Categorical × Categorical (Eq. 1.2)</div>
              <div className="summary-box">
                <strong>Formula (Eq. 1.2):</strong> χ²<sub>c</sub> = Σ (O<sub>i</sub> − E<sub>i</sub>)² / E<sub>i</sub> — where O<sub>i</sub> is the observed frequency and E<sub>i</sub> is the expected frequency in each category. Cramér's V (effect size): V ≥ 0.50 = Very Strong, 0.30–0.49 = Strong, 0.10–0.29 = Moderate. All 5 tests are significant at p &lt; 0.001 or p = 0.0007.
              </div>
              <div style={{ overflowX: "auto" }}>
                <table className="chi-table">
                  <thead>
                    <tr><th>Variable 1</th><th>Variable 2</th><th>χ²</th><th>df</th><th>p-value</th><th>Significant?</th><th>Cramér's V</th><th>Effect Size</th></tr>
                  </thead>
                  <tbody>
                    {CHI_SQUARED.map((d, i) => {
                      const eff = d.cramer >= 0.50 ? "Very Strong" : d.cramer >= 0.30 ? "Strong" : d.cramer >= 0.10 ? "Moderate" : "Weak";
                      const ec  = d.cramer >= 0.50 ? "#16a34a"    : d.cramer >= 0.30 ? IIEE.passGreen : d.cramer >= 0.10 ? IIEE.amber : IIEE.dimText;
                      return (
                        <tr key={i}>
                          <td style={{ fontWeight:700, color:IIEE.white }}>{d.var1}</td>
                          <td style={{ color:IIEE.white }}>{d.var2}</td>
                          <td style={{ fontWeight:700, color:IIEE.blue }}>{d.chi2.toFixed(2)}</td>
                          <td style={{ color:IIEE.muted }}>{d.df}</td>
                          <td style={{ color:IIEE.passGreen }}>{d.p < 0.001 ? "< 0.001" : d.p.toFixed(4)}</td>
                          <td><span style={{ padding:"2px 8px", borderRadius:4, fontSize:11, fontWeight:700, background:"rgba(34,197,94,0.12)", color:IIEE.passGreen }}>✓ Yes</span></td>
                          <td style={{ fontWeight:700, color:ec }}>{d.cramer.toFixed(3)}</td>
                          <td><span style={{ padding:"2px 8px", borderRadius:4, fontSize:11, fontWeight:700, background:`${ec}18`, color:ec }}>{eff}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="chart-note" style={{ marginTop: 14 }}>
                <strong>Key Findings:</strong> <strong>Review Attendance × Pass/Fail</strong> (V=0.647) and <strong>Year × Pass/Fail</strong> (V=0.623) are both Very Strong associations — the two most powerful categorical predictors. Period (V=0.542) is also Very Strong, reflecting systematic differences between April and August/September examination sittings. Strand × Pass/Fail (V=0.326) is a Strong association. Crucially, Strand × Review (V=0.470) is also significant and Strong — meaning students from different strands do NOT attend review at equal rates, contradicting earlier expectations. STEM students are more likely to attend formal review programs.
              </div>
              {/* Per-pair discussions */}
              <div style={{ marginTop: 14 }}>
                {[
                  { pair: "Review × Pass/Fail (V=0.647, Very Strong)", body: "Students who attended a formal board review program passed at dramatically higher rates (χ²=66.48, V=0.647 — the strongest categorical predictor). Among 159 examinees, virtually all 93 passers attended review (96.8%) while only 36.4% of the 66 failers did. This is the most actionable finding: making board review mandatory or providing financial support to attend is expected to have the largest categorical impact on institutional pass rates." },
                  { pair: "Year × Pass/Fail (V=0.623, Very Strong)", body: "The year/sitting of examination is a Very Strong predictor of outcomes (χ²=61.81, V=0.623), driven by dramatic year-to-year variations. The August 2025 cohort's near-zero pass rate is the key driver. This association confirms that external factors — curriculum changes, examination difficulty, cohort preparation quality — vary substantially across years and must be monitored systematically." },
                  { pair: "Period × Pass/Fail (V=0.542, Very Strong)", body: "Examination period (April vs August/September sittings) is a Very Strong predictor (χ²=46.68, V=0.542). August/September examinations have systematically lower pass rates across years. This likely reflects that students who sit in August/September are retakers or first-timers who were less prepared, and that the examination content or difficulty may vary by sitting. Calendar-aware preparation strategies are warranted." },
                  { pair: "Strand × Pass/Fail (V=0.326, Strong)", body: "Academic strand is a Strong predictor of board outcomes (χ²=16.89, V=0.326). STEM graduates consistently outperform GAS, TVL, and HUMMS strand graduates. Strand-specific bridging courses — particularly for non-STEM students entering the EE program — are recommended to address foundational gaps in mathematics and science before licensure preparation begins." },
                  { pair: "Strand × Review (V=0.470, Strong)", body: "Contrary to initial expectations, Strand and Review attendance are significantly and strongly associated (χ²=35.05, V=0.470). STEM students are more likely to attend formal board review programs than other strand groups. This means the performance gap between strands is compounded by differential review participation — non-STEM students both have weaker foundations AND are less likely to attend remedial review, creating a double disadvantage that targeted outreach programs should address." },
                ].map((d, i) => (
                  <div key={i} style={{ marginBottom: 8, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(45,212,191,0.15)", borderRadius: 10, overflow: "hidden" }}>
                    <div style={{ padding: "8px 14px", background: "rgba(15,28,77,0.5)", fontFamily: "'Montserrat',sans-serif", fontWeight: 700, fontSize: "clamp(11px,1.5vw,12px)", letterSpacing: "0.06em", color: IIEE.teal, textTransform: "uppercase" }}>{d.pair}</div>
                    <div style={{ padding: "10px 14px", fontSize: "clamp(11px,1.5vw,13px)", color: IIEE.muted, lineHeight: 1.7, fontFamily: "'Inter',sans-serif" }}>{d.body}</div>
                  </div>
                ))}
              </div>
            </SecCard>

            {/* Group means comparison */}
            <SecCard num="6" icon="⚖️" title="Passers vs Failers — Mean Score Comparison"
              subtitle="Mean academic scores by group to contextualize Point-Biserial findings"
              accentColor={IIEE.indigo}>
              <div className="g2">
                {[
                  { label: "ESAS", pass: 77.97, fail: 53.58, decimals: 2 },
                  { label: "EE",   pass: 79.61, fail: 62.91, decimals: 2 },
                  { label: "MATH", pass: 78.47, fail: 62.61, decimals: 2 },
                  { label: "GWA",  pass: 1.84,  fail: 2.22,  decimals: 2, lower: true },
                ].map((s, i) => (
                  <div key={i} style={{ background: IIEE.cardBg, border: `1px solid ${IIEE.cardBorder}`, borderRadius: 12, padding: "14px 16px" }}>
                    <div style={{ fontFamily: "'Montserrat',sans-serif", fontSize: "clamp(12px,1.5vw,13px)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: IIEE.white, marginBottom: 12 }}>{s.label}</div>
                    <div style={{ display: "flex", gap: 12 }}>
                      {[{ g: "Passers", v: s.pass, c: IIEE.passGreen }, { g: "Failers", v: s.fail, c: IIEE.failRed }].map((g, j) => (
                        <div key={j} style={{ flex: 1, textAlign: "center", background: "rgba(255,255,255,0.02)", borderRadius: 8, padding: "10px 6px" }}>
                          <div style={{ fontSize: 10, color: IIEE.dimText, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>{g.g}</div>
                          <div style={{ fontFamily: "'Montserrat',sans-serif", fontSize: "clamp(18px,3vw,24px)", fontWeight: 700, color: g.c }}>{g.v.toFixed(s.decimals)}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 8, fontSize: 11, color: IIEE.muted, textAlign: "center" }}>
                      Δ = {Math.abs(s.pass - s.fail).toFixed(s.decimals)} {s.label === "GWA" ? "(lower = better in PH grading)" : "pts gap"}
                    </div>
                  </div>
                ))}
              </div>
              <div className="chart-note" style={{ marginTop: 14 }}>
                <strong>Gap Analysis:</strong> ESAS shows the largest absolute gap (77.97 vs 53.58 = <strong>24.39 pts</strong>), making it by far the most discriminating academic subject — consistent with its dominant rpb of 0.865. EE gap (16.70 pts) and MATH gap (15.87 pts) are comparable. GWA differs by 0.38 grade points (1.84 vs 2.22), validating the negative point-biserial correlation: passers have lower (better) GWA numbers under the Philippine convention.
              </div>
            </SecCard>
          </>
        )}
      </div>
    </div>
  );
}