import { useEffect, useMemo, useState } from "react";
import API_BASE_URL from "../apiBase";
import ResultCard from "./ResultCard";

// ── Survey data ───────────────────────────────────────────────────────────────

const STRAND_OPTIONS = ["STEM", "GAS", "TVL", "HUMSS", "ABM"];

const LIKERT_LABELS = ["Strongly Agree", "Agree", "Disagree", "Strongly Disagree"];
const QUESTION_TIME_RULES = {
  knowledge: [5, 10],
  problem_solving: [10, 20],
  motivation: [5, 12],
  mental_health: [5, 12],
  support: [5, 12],
  institutional: [8, 18],
};

const STEPS = [
  {
    id: "scores",
    title: "Exam Scores",
    subtitle: "Enter your mock or actual exam scores.",
    icon: "📊",
    type: "scores",
  },
  {
    id: "background",
    title: "Academic Background",
    subtitle: "Tell us about your academic profile.",
    icon: "🎓",
    type: "background",
  },
  {
    id: "knowledge",
    title: "Knowledge Self-Assessment",
    subtitle: "Rate your knowledge in each area. (1 = Strongly Agree, 4 = Strongly Disagree)",
    icon: "📚",
    type: "likert",
    fields: [
      { key: "KN1",  label: "I have a strong foundation in mathematics required for Electrical Engineering." },
      { key: "KN2",  label: "I understand circuit analysis and electrical network theorems." },
      { key: "KN3",  label: "I am knowledgeable about electrical machines and transformers." },
      { key: "KN4",  label: "I have a good grasp of power systems and energy management." },
      { key: "KN5",  label: "I understand electronics and semiconductor devices." },
      { key: "KN6",  label: "I am familiar with electrical laws, codes, and standards." },
      { key: "KN7",  label: "I can recall and apply formulas relevant to EE topics." },
      { key: "KN8",  label: "I have studied all major subjects covered in the board exam." },
      { key: "KN9",  label: "I understand the theory behind EE concepts, not just the formulas." },
      { key: "KN10", label: "I am familiar with technical terms used in Electrical Engineering." },
      { key: "KN11", label: "I can interpret electrical diagrams and schematics." },
      { key: "KN12", label: "I am aware of the scope and coverage of the EE licensure exam." },
    ],
  },
  {
    id: "problem_solving",
    title: "Problem Solving Confidence",
    subtitle: "Rate your problem-solving ability. (1 = Strongly Agree, 4 = Strongly Disagree)",
    icon: "🧠",
    type: "likert",
    fields: [
      { key: "PS1",  label: "I can analyze complex EE problems and identify the best solution approach." },
      { key: "PS2",  label: "I can identify the most efficient method to solve a given problem." },
      { key: "PS3",  label: "I can select the appropriate formula or concept for a given problem." },
      { key: "PS4",  label: "I can apply theoretical knowledge to practical problem scenarios." },
      { key: "PS5",  label: "I can solve problems within the time constraints of the board exam." },
      { key: "PS6",  label: "I can break down complex problems into simpler, solvable parts." },
      { key: "PS7",  label: "I can verify my answers and check for errors efficiently." },
      { key: "PS8",  label: "I can handle multi-step problems without losing track of the solution." },
      { key: "PS9",  label: "I can maintain accuracy under pressure during examinations." },
      { key: "PS10", label: "I feel confident solving EE problems I have not encountered before." },
      { key: "PS11", label: "I am confident in my ability to analyze and solve board exam problems." },
      { key: "PS12", label: "I use effective problem-solving strategies during my review." },
    ],
  },
  {
    id: "motivation",
    title: "Motivation & Study Discipline",
    subtitle: "Rate your motivation level. (1 = Strongly Agree, 4 = Strongly Disagree)",
    icon: "🔥",
    type: "likert",
    fields: [
      { key: "MT1", label: "I am motivated to pass the EE licensure exam." },
      { key: "MT2", label: "I have a clear goal for passing the board exam." },
      { key: "MT3", label: "I set specific study goals and targets during my review." },
      { key: "MT4", label: "I follow a structured study schedule consistently." },
      { key: "MT5", label: "I manage my time effectively during my review period." },
      { key: "MT6", label: "I maintain self-discipline even when I feel unmotivated." },
      { key: "MT7", label: "I monitor my progress and adjust my study plan accordingly." },
      { key: "MT8", label: "I am committed to putting in the necessary effort to pass the exam." },
    ],
  },
  {
    id: "mental_health",
    title: "Mental Health & Wellbeing",
    subtitle: "Rate your mental wellbeing during review. (1 = Strongly Agree, 4 = Strongly Disagree)",
    icon: "🧘",
    type: "likert",
    fields: [
      { key: "MH1", label: "I manage stress effectively during my review period." },
      { key: "MH2", label: "I feel mentally prepared for the challenges of the board exam." },
      { key: "MH3", label: "I stay calm and composed during high-pressure study sessions." },
      { key: "MH4", label: "I maintain physical health through proper rest and nutrition." },
      { key: "MH5", label: "I get enough sleep to ensure mental alertness during review." },
      { key: "MH6", label: "I balance review time with personal relaxation and self-care." },
      { key: "MH7", label: "I stay focused and avoid distractions during study sessions." },
      { key: "MH8", label: "I have a positive mindset towards passing the board exam." },
    ],
  },
  {
    id: "support",
    title: "Support System",
    subtitle: "Rate the support you receive. (1 = Strongly Agree, 4 = Strongly Disagree)",
    icon: "🤝",
    type: "likert",
    fields: [
      { key: "SS1", label: "My family supports my preparation for the board exam." },
      { key: "SS2", label: "My family encourages me to stay motivated during review." },
      { key: "SS3", label: "My peers and classmates support my exam preparation." },
      { key: "SS4", label: "I have a study group that helps me review effectively." },
      { key: "SS5", label: "I have financial support to cover review and exam costs." },
      { key: "SS6", label: "I have access to study materials and review resources." },
      { key: "SS7", label: "I have a conducive study environment at home or elsewhere." },
      { key: "SS8", label: "I have access to technology tools that support my review." },
    ],
  },
  {
    id: "institutional",
    title: "Curriculum, Faculty & Institution",
    subtitle: "Rate your school experience. (1 = Strongly Agree, 4 = Strongly Disagree)",
    icon: "🏫",
    type: "likert",
    fields: [
      { key: "CU1", label: "The curriculum adequately prepared me for the board exam." },
      { key: "CU2", label: "The core subjects covered the important EE topics." },
      { key: "CU3", label: "The syllabi aligned well with board exam coverage." },
      { key: "CU4", label: "The balance between theory and problem-solving was appropriate." },
      { key: "CU5", label: "The sequence of subjects supported my overall learning." },
      { key: "FQ1", label: "My professors demonstrated mastery of their subjects." },
      { key: "FQ2", label: "My professors explained concepts clearly and effectively." },
      { key: "FQ3", label: "My professors used effective teaching techniques." },
      { key: "FQ4", label: "My professors encouraged critical thinking and problem solving." },
      { key: "FQ5", label: "My professors were accessible and supportive outside class." },
      { key: "DR1", label: "The department conducted review programs for board takers." },
      { key: "DR2", label: "The review sessions reinforced key concepts effectively." },
      { key: "DR3", label: "The department provided mock exams for practice." },
      { key: "DR4", label: "The department provided mentoring and academic support." },
      { key: "DR5", label: "The review program was conducted at the right time before the exam." },
      { key: "FA1", label: "The library had adequate resources for board exam review." },
      { key: "FA2", label: "The laboratories were equipped to support practical learning." },
      { key: "FA3", label: "Technology resources were available to support learning." },
      { key: "FA4", label: "Study areas were available and accessible for reviewers." },
      { key: "FA5", label: "The campus environment was conducive for studying." },
      { key: "IC1", label: "The institutional culture promotes academic excellence." },
      { key: "IC2", label: "The institution encourages students to take the board exam." },
      { key: "IC3", label: "The institution motivates students to aim for board exam success." },
      { key: "IC4", label: "The institution provides guidance and career support." },
      { key: "IC5", label: "The institutional environment positively influenced my preparation." },
    ],
  },
];

// Build default form values
const buildDefault = () => {
  const d = {
    name:           "",
    age:            "",
    sex:            "Male",
    year_taking_exam: "",
    EE: "", MATH: "", ESAS: "", GWA: "",
    Senior_High_School_Strand: "STEM",
    SHS_Prepared:     "Yes",
    EE_First_Choice:  "Yes",
    College_Prepared: "Yes",
    Review_Program:   "Yes",
    Study_Schedule:   "Yes",
    Used_Resources:   "Yes",
    GWA_Reflection:   "",
    Review_Duration:  "0",
  };
  STEPS.forEach((step) => {
    if (step.type === "likert") {
      step.fields.forEach(({ key }) => { d[key] = ""; });
    }
  });
  return d;
};

const defaultForm = buildDefault();

// ── Validation helpers ────────────────────────────────────────────────────────

const SCORE_FIELDS = {
  EE:   { label: "EE Score",   min: 0, max: 100 },
  MATH: { label: "MATH Score", min: 0, max: 100 },
  ESAS: { label: "ESAS Score", min: 0, max: 100 },
};

function validateScore(key, raw) {
  const { label, min, max } = SCORE_FIELDS[key];
  if (raw === "" || raw === null || raw === undefined)
    return `${label} is required.`;
  if (!/^\d+$/.test(String(raw).trim()))
    return `${label} must be a whole number with no special characters.`;
  const v = Number(raw);
  if (isNaN(v))  return `${label} must be a number.`;
  if (v < min)   return `${label} must be at least ${min}.`;
  if (v > max)   return `${label} cannot exceed ${max}.`;
  return null;
}

function validateGWA(raw) {
  if (raw === "" || raw === null || raw === undefined)
    return "GWA is required.";
  if (!/^\d+(\.\d+)?$/.test(String(raw).trim()))
    return "GWA must be a number (e.g. 1.75). No letters or special characters.";
  const v = Number(raw);
  if (isNaN(v))  return "GWA must be a valid number.";
  if (v < 1.0)   return "GWA cannot be lower than 1.0 (highest grade).";
  if (v > 5.0)   return "GWA cannot be higher than 5.0 (lowest grade).";
  return null;
}

// ── Toast ─────────────────────────────────────────────────────────────────────

function Toast({ message, type, onClose }) {
  return (
    <div className={`fixed top-4 right-4 left-4 sm:left-auto z-50 flex items-start gap-3 px-4 py-3 rounded-xl shadow-2xl border max-w-sm sm:max-w-sm mx-auto sm:mx-0
      ${type === "error"
        ? "bg-slate-900 border-red-500/40 text-red-400"
        : "bg-slate-900 border-emerald-500/40 text-emerald-400"}`}>
      <span className="text-lg mt-0.5">{type === "error" ? "⚠️" : "✅"}</span>
      <div className="flex-1">
        <p className="text-sm font-semibold">{type === "error" ? "Invalid Input" : "Success"}</p>
        <p className="text-xs text-slate-400 mt-0.5">{message}</p>
      </div>
      <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-lg leading-none ml-2">×</button>
    </div>
  );
}

// ── Score input ───────────────────────────────────────────────────────────────

function ScoreInput({ fieldKey, value, error, onChange }) {
  const { label, min, max } = SCORE_FIELDS[fieldKey];
  const numVal = Number(value);
  const hasValue = value !== "";

  const borderColor = error
    ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
    : hasValue && !error
    ? "border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20"
    : "border-slate-700 hover:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

  const hintColor = !hasValue ? "text-slate-600"
    : error ? "text-red-400"
    : numVal < 70 ? "text-amber-400"
    : "text-emerald-400";

  const hintText = !hasValue
    ? `${min}–${max} · whole numbers only`
    : error ? error
    : numVal < 70 ? `${numVal} — Below threshold (70)`
    : `${numVal} — Above threshold ✓`;

  const handleKeyDown = (e) => {
    if (["e","E","+","-",".",","," "].includes(e.key)) e.preventDefault();
  };
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
    onChange({ target: { name: fieldKey, value: pasted } });
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</label>
      <input
        className={`bg-slate-800/80 border rounded-xl px-3 py-3 text-white text-2xl font-extrabold text-center outline-none transition placeholder-slate-700 tabular-nums ${borderColor}`}
        type="number" name={fieldKey} value={value} onChange={onChange}
        onKeyDown={handleKeyDown} onPaste={handlePaste}
        placeholder="—" min={min} max={max} step="1"
      />
      <p className={`text-[11px] leading-snug min-h-[16px] ${hintColor}`}>{hintText}</p>
    </div>
  );
}

// ── GWA input ─────────────────────────────────────────────────────────────────

function GWAInput({ value, error, onChange }) {
  const hasValue = value !== "";
  const numVal   = Number(value);

  const borderColor = error
    ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
    : hasValue && !error
    ? "border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20"
    : "border-slate-700 hover:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

  const hintColor = !hasValue ? "text-slate-600"
    : error ? "text-red-400"
    : numVal <= 1.75 ? "text-emerald-400"
    : numVal <= 2.5  ? "text-amber-400"
    : "text-red-400";

  const hintText = !hasValue
    ? "1.0 = Highest · 5.0 = Lowest · decimals allowed"
    : error ? error
    : numVal <= 1.75 ? `${numVal} — Excellent standing ✓`
    : numVal <= 2.5  ? `${numVal} — Average standing`
    : `${numVal} — Below average standing`;

  const handleKeyDown = (e) => {
    if (["e","E","+","-",","," "].includes(e.key)) e.preventDefault();
    if (e.key === "." && String(value).includes(".")) e.preventDefault();
  };
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/[^0-9.]/g, "");
    onChange({ target: { name: "GWA", value: pasted } });
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">GWA</label>
      <input
        className={`bg-slate-800/80 border rounded-xl px-4 py-3 text-slate-100 text-sm outline-none transition placeholder-slate-600 ${borderColor}`}
        type="number" name="GWA" value={value} onChange={onChange}
        onKeyDown={handleKeyDown} onPaste={handlePaste}
        placeholder="e.g. 1.75" step="0.01" min="1" max="5"
      />
      <p className={`text-[11px] leading-snug min-h-[16px] ${hintColor}`}>{hintText}</p>
    </div>
  );
}

// ── Yes/No toggle pair ────────────────────────────────────────────────────────

function YesNoField({ name, label, value, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-slate-400 uppercase tracking-wide leading-tight">{label}</label>
      <div className="flex gap-2">
        {["Yes", "No"].map((opt) => (
          <label key={opt} className={`flex-1 text-center text-sm font-semibold py-2.5 rounded-xl border cursor-pointer transition select-none
            ${value === opt
              ? "bg-blue-500/15 border-blue-500 text-blue-300"
              : "bg-slate-800/80 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200"}`}>
            <input type="radio" name={name} value={opt} checked={value === opt} onChange={onChange} className="sr-only" />
            {opt}
          </label>
        ))}
      </div>
    </div>
  );
}

// ── Likert row ────────────────────────────────────────────────────────────────

function LikertRow({ label, fieldKey, value, onChange, hasError, displayIndex }) {
  return (
    <div className={`flex flex-col gap-2 py-3 border-b last:border-0 transition
      ${hasError ? "border-red-900/40 bg-red-950/10 rounded-xl px-2" : "border-slate-800/60"}`}>
      <p className="text-sm text-slate-300 leading-snug">
        {displayIndex != null ? `${displayIndex}. ` : ""}
        {label}
      </p>
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
        {[1, 2, 3, 4].map((val) => (
          <label key={val} className={`flex flex-col items-center gap-0.5 py-2 rounded-xl border cursor-pointer transition select-none text-center
            ${String(value) === String(val)
              ? "bg-blue-500/15 border-blue-500 text-blue-300"
              : hasError
              ? "bg-red-900/10 border-red-800/40 text-slate-400 hover:border-red-600 hover:text-slate-200"
              : "bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200"}`}>
            <input type="radio" name={fieldKey} value={val}
              checked={String(value) === String(val)}
              onChange={onChange} className="sr-only" />
            <span className={`text-base font-extrabold ${String(value) === String(val) ? "text-blue-400" : "text-slate-300"}`}>{val}</span>
            <span className="text-[9px] sm:text-[10px] leading-tight px-0.5 sm:px-1">{LIKERT_LABELS[val - 1]}</span>
          </label>
        ))}
      </div>
      {hasError && (
        <p className="text-[11px] text-red-400 flex items-center gap-1">
          <span>⚠</span> Please select a rating for this item.
        </p>
      )}
    </div>
  );
}

function resolveExpectedTime(stepId, displayIndex) {
  const [baseMin, baseMax] = QUESTION_TIME_RULES[stepId] || [5, 12];
  const add = Math.floor((displayIndex - 1) / 4);
  return { min: baseMin + add, max: baseMax + add };
}

// ── Step indicator ────────────────────────────────────────────────────────────

function StepIndicator({ steps, current }) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {steps.map((step, i) => (
        <div key={step.id} className="flex items-center gap-1">
          <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold transition
            ${i < current   ? "bg-blue-600 text-white"
            : i === current ? "bg-blue-500 text-white ring-2 ring-blue-400/40"
            :                 "bg-slate-800 text-slate-500 border border-slate-700"}`}>
            {i < current ? "✓" : i + 1}
          </div>
          {i < steps.length - 1 && (
            <div className={`h-0.5 w-3 sm:w-4 rounded ${i < current ? "bg-blue-600" : "bg-slate-700"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function PredictorForm({ onResult }) {
  const loggedInName = localStorage.getItem("name") || "";
  const [form, setForm]       = useState(defaultForm);
  const [step, setStep]       = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast]     = useState(null);
  const [errors, setErrors]   = useState({});
  const [questionTimings, setQuestionTimings] = useState({});
  const [activeQuestionStart, setActiveQuestionStart] = useState(Date.now());

  useEffect(() => {
    if (loggedInName && !form.name) {
      setForm((prev) => ({ ...prev, name: loggedInName }));
    }
  }, [loggedInName, form.name]);

  const currentStep = STEPS[step];
  const activeQuestion = useMemo(() => {
    if (!currentStep || currentStep.type !== "likert") return null;
    return currentStep.fields[questionIndex] || null;
  }, [currentStep, questionIndex]);

  useEffect(() => {
    if (currentStep?.type === "likert") {
      setActiveQuestionStart(Date.now());
    }
  }, [step, questionIndex, currentStep?.type]);

  const showToast = (message, type = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      if (name === "Review_Program" && value === "No") {
        return { ...prev, Review_Program: value, Review_Duration: "0" };
      }
      return { ...prev, [name]: value };
    });
    if (SCORE_FIELDS[name]) {
      const err = validateScore(name, value);
      setErrors((prev) => ({ ...prev, [name]: err || "" }));
    } else if (name === "GWA") {
      const err = validateGWA(value);
      setErrors((prev) => ({ ...prev, [name]: err || "" }));
    } else {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateStep = () => {
    const current = STEPS[step];
    const newErr  = {};

    if (current.type === "scores") {
      ["EE","MATH","ESAS"].forEach((k) => {
        const err = validateScore(k, form[k]);
        if (err) newErr[k] = err;
      });
    }
    if (current.type === "background") {
      const err = validateGWA(form.GWA);
      if (err) newErr.GWA = err;
      if (!form.GWA_Reflection) newErr.GWA_Reflection = true;
      if (!form.name?.trim()) newErr.name = true;
      if (!form.age) newErr.age = true;
      if (!form.year_taking_exam) newErr.year_taking_exam = true;
    }
    if (current.type === "likert") {
      if (!activeQuestion || !form[activeQuestion.key]) {
        if (activeQuestion?.key) newErr[activeQuestion.key] = true;
      }
    }

    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  const finalizeQuestionTiming = (stepObj, qIndex) => {
    if (!stepObj || stepObj.type !== "likert") return;
    const q = stepObj.fields[qIndex];
    if (!q || !form[q.key]) return;
    if (questionTimings[q.key]) return;

    const now = Date.now();
    const elapsedSec = Math.max(1, Math.round((now - activeQuestionStart) / 1000));
    const expected = resolveExpectedTime(stepObj.id, qIndex + 1);
    setQuestionTimings((prev) => ({
      ...prev,
      [q.key]: {
        step_id: stepObj.id,
        question_index: qIndex + 1,
        duration_sec: elapsedSec,
        expected_min_sec: expected.min,
        expected_max_sec: expected.max,
        is_human_like: elapsedSec >= expected.min && elapsedSec <= expected.max,
      },
    }));
  };

  const handleNext = () => {
    const current = STEPS[step];
    if (!validateStep()) {
      if (current.type === "scores") {
        showToast("Please fix the score errors before continuing.", "error");
      } else if (current.type === "background") {
        showToast("Please complete all background fields before continuing.", "error");
      } else {
        showToast("Please answer all questions before continuing.", "error");
      }
      return;
    }
    if (current.type === "likert") {
      finalizeQuestionTiming(current, questionIndex);
      const isLastQuestion = questionIndex >= current.fields.length - 1;
      if (!isLastQuestion) {
        setQuestionIndex((q) => q + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      setQuestionIndex(0);
    }
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    if (currentStep?.type === "likert" && questionIndex > 0) {
      setQuestionIndex((q) => q - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const prevStep = step - 1;
    if (prevStep >= 0 && STEPS[prevStep].type === "likert") {
      setQuestionIndex(STEPS[prevStep].fields.length - 1);
    } else {
      setQuestionIndex(0);
    }
    setStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (!validateStep()) {
      showToast("Please answer all questions before submitting.", "error");
      return;
    }
    setLoading(true); setResult(null);

    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), 10000);

    try {
      const body = {
        name:           form.name,
        age:            Number(form.age),
        sex:            form.sex,
        year_taking_exam: Number(form.year_taking_exam),
        EE:   Number(form.EE),
        MATH: Number(form.MATH),
        ESAS: Number(form.ESAS),
        GWA:  Number(form.GWA),
        Senior_High_School_Strand: form.Senior_High_School_Strand,
        SHS_Prepared:     form.SHS_Prepared,
        EE_First_Choice:  form.EE_First_Choice,
        College_Prepared: form.College_Prepared,
        Review_Program:   form.Review_Program,
        Study_Schedule:   form.Study_Schedule,
        Used_Resources:   form.Used_Resources,
        GWA_Reflection:   Number(form.GWA_Reflection),
        Review_Duration:  Number(form.Review_Duration),
        question_timings: questionTimings,
      };
      STEPS.forEach((s) => {
        if (s.type === "likert") {
          s.fields.forEach(({ key }) => { body[key] = Number(form[key]); });
        }
      });

      const res = await fetch(`${API_BASE_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        let msg = "Server returned an error.";
        try { const e = await res.json(); msg = e.detail || JSON.stringify(e); } catch {}
        throw new Error(msg);
      }

      const data = await res.json();
        data.answers = { ...form };
        if (onResult) {
          onResult(data);  // pass up to StudentPage
        } else {
          setResult(data);
          setStep(STEPS.length);
      }
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") {
        showToast("Request timed out. Make sure uvicorn is running.", "error");
      } else if (err.message.includes("fetch") || err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
        showToast("Cannot connect to server. Run: uvicorn main:app --reload", "error");
      } else {
        showToast(err.message, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm(defaultForm);
    setErrors({});
    setResult(null);
    setStep(0);
    setQuestionIndex(0);
    setQuestionTimings({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isLastStep     = step === STEPS.length - 1;
  const isDone         = step >= STEPS.length;
  const unansweredCount = currentStep?.type === "likert" && activeQuestion
    ? (form[activeQuestion.key] ? 0 : 1)
    : 0;

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="w-full max-w-3xl flex flex-col gap-6 px-4 sm:px-0">

        {/* ── Hero / Header ── */}
        <div className="pt-2">
          {/* Institution badge */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-5">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-blue-400 bg-blue-400/10 border border-blue-400/25 rounded-full px-3 py-1 self-start">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              AI-Powered Predictor
            </span>
            <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
              <span className="text-slate-600">|</span>
              <span className="font-medium text-slate-400">College of Engineering</span>
              <span className="text-slate-600">·</span>
              <span className="font-medium text-blue-400/70">IIEE</span>
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold leading-[1.1] tracking-tight text-white">
            EE Licensure<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Exam Predictor
            </span>
          </h1>
          <p className="mt-3 text-slate-400 text-sm sm:text-[15px] leading-relaxed max-w-lg">
            Complete the survey below to get an AI-based prediction of your board exam outcome.
          </p>
        </div>

        {/* ── Step indicator ── */}
        {!isDone && (
          <div className="flex flex-col gap-2">
            <StepIndicator steps={STEPS} current={step} />
            <p className="text-xs text-slate-500">
              Step {step + 1} of {STEPS.length} — {currentStep.title}
            </p>
          </div>
        )}

        {/* ── Step card ── */}
        {!isDone && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl shadow-black/40">
            <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600" />

            <div className="p-5 sm:p-8 flex flex-col gap-5 sm:gap-6">
              {/* Step header */}
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">
                  {currentStep.icon}
                </div>
                <div className="flex-1">
                  <h2 className="text-base sm:text-lg font-bold text-white">{currentStep.title}</h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-0.5">{currentStep.subtitle}</p>
                </div>
                {currentStep.type === "likert" && unansweredCount > 0 && (
                  <div className="flex-shrink-0 flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/25 rounded-full px-2.5 py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span className="text-xs font-semibold text-amber-400">{unansweredCount} left</span>
                  </div>
                )}
                {currentStep.type === "likert" && unansweredCount === 0 && (
                  <div className="flex-shrink-0 flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/25 rounded-full px-2.5 py-1">
                    <span className="text-xs font-semibold text-emerald-400">✓ Done</span>
                  </div>
                )}
              </div>

              {/* ── Scores step ── */}
              {currentStep.type === "scores" && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-3 bg-blue-500/5 border border-blue-500/15 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3">
                    <span className="text-blue-400 text-sm mt-0.5">ℹ️</span>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Enter your mock exam scores. Range <span className="text-white font-semibold">0–100</span>, whole numbers only. Passing threshold per subject: <span className="text-amber-400 font-semibold">70</span>.
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {["EE","MATH","ESAS"].map((k) => (
                      <ScoreInput key={k} fieldKey={k} value={form[k]} error={errors[k]} onChange={handleChange} />
                    ))}
                  </div>
                </div>
              )}

              {/* ── Background step ── */}
                {currentStep.type === "background" && (
                <div className="flex flex-col gap-4">
 
                  {/* Personal Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Full Name</label>
                      <input
                        className={`bg-slate-800/80 border rounded-xl px-3 py-3 text-slate-100 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${errors.name ? "border-red-500" : "border-slate-700"}`}
                        type="text" name="name" value={form.name} onChange={handleChange}
                        placeholder="e.g. Juan Dela Cruz"
                        readOnly={!!loggedInName}
                      />
                      {loggedInName && <p className="text-[11px] text-slate-500">Auto-filled from logged-in account.</p>}
                      {errors.name && <p className="text-[11px] text-red-400">⚠ Full name is required.</p>}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Age</label>
                      <input
                        className={`bg-slate-800/80 border rounded-xl px-3 py-3 text-slate-100 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${errors.age ? "border-red-500" : "border-slate-700"}`}
                        type="number" name="age" value={form.age} onChange={handleChange}
                        min="15" max="80" placeholder="e.g. 22"
                      />
                      {errors.age && <p className="text-[11px] text-red-400">⚠ Age is required.</p>}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Sex</label>
                      <select
                        className="bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-3 text-slate-100 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition cursor-pointer"
                        name="sex" value={form.sex} onChange={handleChange}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Year Taking Exam</label>
                      <input
                        className={`bg-slate-800/80 border rounded-xl px-3 py-3 text-slate-100 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${errors.year_taking_exam ? "border-red-500" : "border-slate-700"}`}
                        type="number" name="year_taking_exam" value={form.year_taking_exam} onChange={handleChange}
                        min="2020" max="2040" placeholder={`e.g. ${new Date().getFullYear()}`}
                      />
                      {errors.year_taking_exam && <p className="text-[11px] text-red-400">⚠ Year is required.</p>}
                    </div>
                  </div>
 
                  <div className="flex items-start gap-3 bg-blue-500/5 border border-blue-500/15 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3">
                    <span className="text-blue-400 text-sm mt-0.5">ℹ️</span>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      GWA uses the Philippine grading system: <span className="text-white font-semibold">1.0</span> is highest, <span className="text-white font-semibold">5.0</span> is lowest. Decimals allowed (e.g. 1.75).
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <GWAInput value={form.GWA} error={errors.GWA} onChange={handleChange} />
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">SHS Strand</label>
                      <select
                        className="bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-3 text-slate-100 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition cursor-pointer"
                        name="Senior_High_School_Strand" value={form.Senior_High_School_Strand} onChange={handleChange}>
                        {STRAND_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <p className="text-[11px] text-slate-600">Senior High School track</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <YesNoField name="SHS_Prepared"    label="SHS Prepared for EE?"       value={form.SHS_Prepared}    onChange={handleChange} />
                    <YesNoField name="EE_First_Choice" label="EE Was First Choice?"        value={form.EE_First_Choice} onChange={handleChange} />
                    <YesNoField name="College_Prepared" label="College Prepared for Exam?" value={form.College_Prepared} onChange={handleChange} />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <YesNoField name="Review_Program"  label="Attended Formal Review?"    value={form.Review_Program}  onChange={handleChange} />
                    <YesNoField name="Study_Schedule"  label="Followed Study Schedule?"   value={form.Study_Schedule}  onChange={handleChange} />
                    <YesNoField name="Used_Resources"  label="Used Learning Resources?"   value={form.Used_Resources}  onChange={handleChange} />
                  </div>

                  {/* GWA Reflection */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                      My GWA reflects my mastery of EE concepts
                    </label>
                    <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                      {[
                        { val: 1, text: "Strongly Agree" },
                        { val: 2, text: "Agree" },
                        { val: 3, text: "Neutral" },
                        { val: 4, text: "Disagree" },
                        { val: 5, text: "Strongly Disagree" },
                      ].map(({ val, text }) => (
                        <label key={val} className={`flex flex-col items-center gap-0.5 py-2 rounded-xl border cursor-pointer transition select-none text-center
                          ${String(form.GWA_Reflection) === String(val)
                            ? "bg-blue-500/15 border-blue-500 text-blue-300"
                            : errors.GWA_Reflection
                            ? "bg-red-900/10 border-red-800/40 text-slate-400 hover:border-red-600"
                            : "bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200"}`}>
                          <input type="radio" name="GWA_Reflection" value={val}
                            checked={String(form.GWA_Reflection) === String(val)}
                            onChange={handleChange} className="sr-only" />
                          <span className={`text-base font-extrabold ${String(form.GWA_Reflection) === String(val) ? "text-blue-400" : "text-slate-300"}`}>{val}</span>
                          <span className="text-[9px] sm:text-[10px] leading-tight px-0.5">{text}</span>
                        </label>
                      ))}
                    </div>
                    {errors.GWA_Reflection && (
                      <p className="text-[11px] text-red-400">⚠ Please select a rating.</p>
                    )}
                  </div>

                  {/* Review Duration */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                      Board Review Duration
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { val: "0", text: "None" },
                        { val: "1", text: "~3 Months" },
                        { val: "2", text: "~6 Months" },
                      ].map(({ val, text }) => (
                        <label key={val} className={`flex items-center justify-center py-3 rounded-xl border transition select-none text-sm font-semibold
                          ${form.Review_Program === "No" && val !== "0" ? "opacity-45 cursor-not-allowed" : "cursor-pointer"}
                          ${form.Review_Duration === val
                            ? "bg-blue-500/15 border-blue-500 text-blue-300"
                            : "bg-slate-800/80 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200"}`}>
                          <input type="radio" name="Review_Duration" value={val}
                            checked={form.Review_Duration === val}
                            disabled={form.Review_Program === "No" && val !== "0"}
                            onChange={handleChange} className="sr-only" />
                          {text}
                        </label>
                      ))}
                    </div>
                    {form.Review_Program === "No" && (
                      <p className="text-[11px] text-slate-500">Review duration is disabled when formal review is not attended.</p>
                    )}
                  </div>
                </div>
              )}

              {/* ── Likert step ── */}
              {currentStep.type === "likert" && (
                <div className="flex flex-col">
                  <div className="hidden sm:grid grid-cols-4 gap-2 mb-2">
                    {LIKERT_LABELS.map((l, i) => (
                      <p key={i} className="text-center text-[10px] text-slate-600 font-medium">{i + 1} — {l}</p>
                    ))}
                  </div>
                  {activeQuestion && (
                    <LikertRow
                      key={activeQuestion.key}
                      label={activeQuestion.label}
                      fieldKey={activeQuestion.key}
                      value={form[activeQuestion.key]}
                      onChange={handleChange}
                      hasError={!!errors[activeQuestion.key]}
                      displayIndex={questionIndex + 1}
                    />
                  )}
                  <p className="text-xs text-slate-500 mt-2">
                    Question {questionIndex + 1} of {currentStep.fields.length}
                  </p>
                </div>
              )}

              {/* Navigation */}
              <div className="flex gap-3 pt-2 border-t border-slate-800">
                {step > 0 && (
                  <button onClick={handleBack}
                    className="px-4 sm:px-5 py-3 rounded-xl border border-slate-700 text-slate-400 text-sm font-medium hover:bg-slate-800 hover:text-slate-200 transition">
                    ← Back
                  </button>
                )}
                {!isLastStep && (
                  <button onClick={handleNext}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-sm tracking-wide hover:from-blue-500 hover:to-cyan-500 transition shadow-lg shadow-blue-700/30">
                    Continue →
                  </button>
                )}
                {isLastStep && (
                  <button onClick={handleSubmit} disabled={loading}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-sm tracking-wide hover:from-blue-500 hover:to-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-lg shadow-blue-700/30">
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Analyzing your profile…
                      </span>
                    ) : "Submit & Predict →"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Result ── */}
        {isDone && result && (
          <div className="flex flex-col gap-6">
            <ResultCard result={result} />
            <button onClick={handleReset}
              className="w-full py-3 rounded-xl border border-slate-700 text-slate-400 text-sm font-medium hover:bg-slate-800 hover:text-slate-200 transition">
              ← Start Over
            </button>
          </div>
        )}

        {/* ── Footer ── */}
        <p className="text-center text-xs text-slate-700 pb-4">
          Southern Luzon State University · College of Engineering · IIEE · EE Licensure Predictor · For research use only
        </p>
      </div>

      <style>{`
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in { animation: slide-in 0.3s ease; }
      `}</style>
    </>
  );
}