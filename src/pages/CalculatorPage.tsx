import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Calculator, Sun, Moon, RotateCcw, Printer } from "lucide-react";
import AdminLayout from "@/pages/admin/AdminLayout";

type Material = "MS" | "SS" | "BR" | "AL";
type LabourMode = "perKg" | "perPiece";

// Density factor used in:  weight (kg) = D * D * L * Factor / 1000
const MATERIAL_FACTOR: Record<Material, number> = {
  MS: 0.0063,   // Mild Steel
  SS: 0.0060,   // Stainless Steel
  BR: 0.0073,   // Brass
  AL: 0.0027,   // Aluminium
};

const MATERIAL_LABEL: Record<Material, string> = {
  MS: "MS — Mild Steel",
  SS: "SS — Stainless Steel",
  BR: "Brass",
  AL: "Aluminium",
};

const fmt = (n: number, d = 3) =>
  Number.isFinite(n) ? n.toLocaleString("en-IN", { maximumFractionDigits: d, minimumFractionDigits: d > 2 ? 2 : 0 }) : "0";

const fmtINR = (n: number) =>
  Number.isFinite(n)
    ? n.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 })
    : "₹0.00";

const round2 = (n: number) => Math.round((Number.isFinite(n) ? n : 0) * 100) / 100;

const CalculatorPage = () => {
  const [theme, setTheme] = useState<"dark" | "light">(() =>
    (typeof window !== "undefined" && localStorage.getItem("calc_theme") === "light") ? "light" : "dark"
  );
  useEffect(() => { localStorage.setItem("calc_theme", theme); }, [theme]);

  // Step 1: raw material
  const [material, setMaterial] = useState<Material>("MS");
  const [diameter, setDiameter] = useState<string>("16");
  const [length, setLength] = useState<string>("100");
  const [qty, setQty] = useState<string>("100");

  // Step 2: material cost
  const [ratePerKg, setRatePerKg] = useState<string>("120");

  // Step 3: labour
  const [labourMode, setLabourMode] = useState<LabourMode>("perKg");
  const [labourRate, setLabourRate] = useState<string>("20");

  // Step 5: profit
  const [profit, setProfit] = useState<string>("15");

  // Step 7: optional GST
  const [includeGst, setIncludeGst] = useState<boolean>(true);
  const [gstRate, setGstRate] = useState<string>("18");

  const D = parseFloat(diameter) || 0;
  const L = parseFloat(length) || 0;
  const Q = parseFloat(qty) || 0;
  const R = parseFloat(ratePerKg) || 0;
  const LR = parseFloat(labourRate) || 0;
  const P = parseFloat(profit) || 0;
  const G = parseFloat(gstRate) || 0;

  const calc = useMemo(() => {
    const factor = MATERIAL_FACTOR[material];
    const weightPerPiece = (D * D * L * factor) / 1000;     // kg per piece
    const totalWeight = weightPerPiece * Q;                  // kg
    const materialCost = totalWeight * R;                    // ₹
    const labourCost = labourMode === "perKg" ? totalWeight * LR : Q * LR; // ₹
    const realCost = materialCost + labourCost;              // ₹
    const profitAmt = realCost * (P / 100);                  // ₹
    const finalPrice = realCost + profitAmt;                 // ₹ (before GST)
    const gstAmt = includeGst ? finalPrice * (G / 100) : 0;
    const finalWithGst = finalPrice + gstAmt;
    const ratePerPiece = Q > 0 ? finalWithGst / Q : 0;
    return {
      weightPerPiece: round2(weightPerPiece),
      totalWeight: round2(totalWeight),
      materialCost: round2(materialCost),
      labourCost: round2(labourCost),
      realCost: round2(realCost),
      profitAmt: round2(profitAmt),
      finalPrice: round2(finalPrice),
      gstAmt: round2(gstAmt),
      finalWithGst: round2(finalWithGst),
      ratePerPiece: round2(ratePerPiece),
    };
  }, [D, L, Q, R, LR, P, G, includeGst, material, labourMode]);

  const reset = () => {
    setMaterial("MS");
    setDiameter("16"); setLength("100"); setQty("100");
    setRatePerKg("120");
    setLabourMode("perKg"); setLabourRate("20");
    setProfit("15");
    setIncludeGst(true); setGstRate("18");
  };

  const isDark = theme === "dark";
  const wrap = isDark ? "bg-[#0c0c0c] text-yellow-50" : "bg-yellow-50 text-neutral-900";
  const cardBase = isDark ? "bg-[#161616] border border-yellow-400/30" : "bg-white border border-neutral-200 shadow-md";
  const inputBase = isDark
    ? "bg-[#0c0c0c] border-yellow-400/30 text-yellow-50 placeholder:text-yellow-100/40 focus:border-yellow-400"
    : "bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus:border-yellow-500";
  const labelBase = isDark ? "text-yellow-100/80" : "text-neutral-700";
  const accent = isDark ? "text-yellow-400" : "text-yellow-700";
  const stripe = isDark ? "border-b border-yellow-400/15" : "border-b border-neutral-200";
  const subtleBox = isDark ? "bg-[#0c0c0c] border border-yellow-400/15" : "bg-neutral-100 border border-neutral-200";

  return (
    <AdminLayout>
      <Helmet>
        <title>Fasteners Business Calculator · Admin</title>
      </Helmet>

      <div className={`-m-6 md:-m-10 min-h-[calc(100vh-0px)] ${wrap} transition-colors`}>
        <section className="px-6 md:px-10 py-8">
          {/* Header strip */}
          <div className={`flex flex-wrap items-center justify-between gap-3 mb-7 pb-5 ${stripe}`}>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-md flex items-center justify-center ${isDark ? "bg-yellow-400 text-black" : "bg-yellow-500 text-black"} shadow-md`}>
                <Calculator className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-heading text-2xl md:text-3xl font-bold uppercase tracking-wide">
                  Fasteners Business Calculator
                </h1>
                <p className={`text-xs md:text-sm ${isDark ? "text-yellow-100/60" : "text-neutral-600"}`}>
                  Raw material → labour → real cost → profit → final price (GST optional)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setTheme(isDark ? "light" : "dark")} data-testid="button-toggle-theme"
                className={`inline-flex items-center gap-2 text-xs font-bold uppercase px-3 py-2 rounded border ${isDark ? "border-yellow-400/40 hover:bg-yellow-400/10" : "border-neutral-400 hover:bg-neutral-100"}`}>
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {isDark ? "Light" : "Dark"}
              </button>
              <button onClick={reset} data-testid="button-reset"
                className={`inline-flex items-center gap-2 text-xs font-bold uppercase px-3 py-2 rounded border ${isDark ? "border-yellow-400/40 hover:bg-yellow-400/10" : "border-neutral-400 hover:bg-neutral-100"}`}>
                <RotateCcw className="w-4 h-4" /> Reset
              </button>
              <button onClick={() => window.print()} data-testid="button-print"
                className={`inline-flex items-center gap-2 text-xs font-bold uppercase px-3 py-2 rounded ${isDark ? "bg-yellow-400 text-black hover:bg-yellow-300" : "bg-yellow-500 text-black hover:bg-yellow-400"}`}>
                <Printer className="w-4 h-4" /> Print
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Inputs */}
            <div className={`${cardBase} rounded-xl p-6 space-y-6`}>
              {/* Step 1 */}
              <div>
                <StepHead n={1} title="Raw Material (Rod)" accent={accent} />
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Material" labelCls={labelBase}>
                    <select
                      value={material} onChange={(e) => setMaterial(e.target.value as Material)}
                      data-testid="select-material"
                      className={`w-full rounded-md border px-3 py-2.5 text-sm font-semibold ${inputBase}`}
                    >
                      {(Object.keys(MATERIAL_LABEL) as Material[]).map((k) => (
                        <option key={k} value={k}>{MATERIAL_LABEL[k]}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Quantity (pcs)" labelCls={labelBase}>
                    <input type="number" min="0" inputMode="numeric"
                      value={qty} onChange={(e) => setQty(e.target.value)}
                      data-testid="input-qty"
                      className={`w-full rounded-md border px-3 py-2.5 text-sm ${inputBase}`} />
                  </Field>
                  <Field label="Diameter D (mm)" labelCls={labelBase}>
                    <input type="number" min="0" step="0.1"
                      value={diameter} onChange={(e) => setDiameter(e.target.value)}
                      data-testid="input-diameter"
                      className={`w-full rounded-md border px-3 py-2.5 text-sm ${inputBase}`} />
                  </Field>
                  <Field label="Length L (mm)" labelCls={labelBase}>
                    <input type="number" min="0" step="0.1"
                      value={length} onChange={(e) => setLength(e.target.value)}
                      data-testid="input-length"
                      className={`w-full rounded-md border px-3 py-2.5 text-sm ${inputBase}`} />
                  </Field>
                </div>
              </div>

              {/* Step 2 */}
              <div className={`pt-5 ${stripe}`}>
                <StepHead n={2} title="Material Cost" accent={accent} />
                <Field label="Rate per Kg (₹)" labelCls={labelBase}>
                  <input type="number" min="0" step="0.01"
                    value={ratePerKg} onChange={(e) => setRatePerKg(e.target.value)}
                    data-testid="input-rate-kg"
                    className={`w-full rounded-md border px-3 py-2.5 text-sm ${inputBase}`} />
                </Field>
              </div>

              {/* Step 3 */}
              <div className={`pt-5 ${stripe}`}>
                <StepHead n={3} title="Labour Cost" accent={accent} />
                <div className="flex items-center gap-2 mb-3">
                  <ToggleBtn active={labourMode === "perKg"} onClick={() => setLabourMode("perKg")} testid="btn-labour-per-kg" dark={isDark}>Per Kg</ToggleBtn>
                  <ToggleBtn active={labourMode === "perPiece"} onClick={() => setLabourMode("perPiece")} testid="btn-labour-per-piece" dark={isDark}>Per Piece</ToggleBtn>
                </div>
                <Field label={labourMode === "perKg" ? "Labour Rate per Kg (₹)" : "Labour Rate per Piece (₹)"} labelCls={labelBase}>
                  <input type="number" min="0" step="0.01"
                    value={labourRate} onChange={(e) => setLabourRate(e.target.value)}
                    data-testid="input-labour-rate"
                    className={`w-full rounded-md border px-3 py-2.5 text-sm ${inputBase}`} />
                </Field>
              </div>

              {/* Step 5 */}
              <div className={`pt-5 ${stripe}`}>
                <StepHead n={5} title="Profit" accent={accent} />
                <Field label="Profit %" labelCls={labelBase}>
                  <input type="number" min="0" step="0.1"
                    value={profit} onChange={(e) => setProfit(e.target.value)}
                    data-testid="input-profit"
                    className={`w-full rounded-md border px-3 py-2.5 text-sm ${inputBase}`} />
                </Field>
              </div>

              {/* Step 7 */}
              <div className={`pt-5 ${stripe}`}>
                <StepHead n={7} title="GST (Optional)" accent={accent} />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <label className="inline-flex items-center gap-2 text-sm font-semibold cursor-pointer select-none">
                    <input type="checkbox" checked={includeGst}
                      onChange={(e) => setIncludeGst(e.target.checked)}
                      data-testid="checkbox-gst"
                      className="w-4 h-4 accent-yellow-500" />
                    Add GST
                  </label>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${labelBase}`}>GST %</span>
                    <input type="number" min="0" step="0.1" disabled={!includeGst}
                      value={gstRate} onChange={(e) => setGstRate(e.target.value)}
                      data-testid="input-gst-rate"
                      className={`w-20 rounded-md border px-2 py-1.5 text-sm font-semibold ${inputBase} disabled:opacity-50`} />
                    <span className="text-xs">%</span>
                  </div>
                </div>
              </div>

              <p className={`pt-4 text-[11px] leading-relaxed border-t ${isDark ? "border-yellow-400/15 text-yellow-100/50" : "border-neutral-200 text-neutral-500"}`}>
                Formula: Weight (kg) = D × D × L × {MATERIAL_FACTOR[material].toFixed(5)} / 1000
              </p>
            </div>

            {/* Results */}
            <div className={`${cardBase} rounded-xl p-6`}>
              <h2 className={`font-heading text-lg font-bold uppercase tracking-wider mb-5 ${accent}`}>Results</h2>

              <div className="grid grid-cols-2 gap-3">
                <Stat label="Weight / piece" value={`${fmt(calc.weightPerPiece, 4)} kg`} subtle={subtleBox} dark={isDark} testid="result-weight-piece" />
                <Stat label="Total weight" value={`${fmt(calc.totalWeight, 3)} kg`} subtle={subtleBox} dark={isDark} testid="result-total-weight" />
                <Stat label="Material cost" value={fmtINR(calc.materialCost)} subtle={subtleBox} dark={isDark} testid="result-material-cost" />
                <Stat label="Labour cost" value={fmtINR(calc.labourCost)} subtle={subtleBox} dark={isDark} testid="result-labour-cost" />
                <Stat label="Real cost" value={fmtINR(calc.realCost)} subtle={subtleBox} dark={isDark} testid="result-real-cost" />
                <Stat label={`Profit (${P}%)`} value={fmtINR(calc.profitAmt)} subtle={subtleBox} dark={isDark} testid="result-profit" />
                <Stat label="Final price" value={fmtINR(calc.finalPrice)} subtle={subtleBox} dark={isDark} testid="result-final-price" />
                <Stat label={includeGst ? `GST (${G}%)` : "GST (off)"} value={fmtINR(calc.gstAmt)} subtle={subtleBox} dark={isDark} testid="result-gst" />
              </div>

              <div className={`mt-5 rounded-lg p-5 ${isDark ? "bg-yellow-400 text-black" : "bg-yellow-500 text-black"} shadow-lg`}>
                <div className="text-[11px] uppercase tracking-[0.2em] font-bold opacity-80">
                  {includeGst ? "Final Selling Price (incl. GST)" : "Final Selling Price"}
                </div>
                <div className="font-heading text-3xl md:text-4xl font-extrabold mt-1" data-testid="result-grand-total">
                  {fmtINR(calc.finalWithGst)}
                </div>
                <div className="text-xs font-semibold mt-1 opacity-90" data-testid="result-rate-piece">
                  Rate / piece: {fmtINR(calc.ratePerPiece)}
                </div>
              </div>

              <div className={`mt-4 text-[11px] ${isDark ? "text-yellow-100/50" : "text-neutral-500"}`}>
                M.I. Engineering Works · GSTIN 27CBFPM8207D1ZR · Mumbai
              </div>
            </div>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
};

const Field = ({ label, children, labelCls }: { label: string; children: React.ReactNode; labelCls: string }) => (
  <div>
    <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${labelCls}`}>{label}</label>
    {children}
  </div>
);

const StepHead = ({ n, title, accent }: { n: number; title: string; accent: string }) => (
  <div className="flex items-center gap-2 mb-3">
    <span className={`w-6 h-6 rounded-full bg-yellow-500 text-black text-xs font-bold flex items-center justify-center`}>{n}</span>
    <h3 className={`font-heading text-sm font-bold uppercase tracking-wider ${accent}`}>{title}</h3>
  </div>
);

const ToggleBtn = ({
  active, onClick, children, testid, dark,
}: {
  active: boolean; onClick: () => void; children: React.ReactNode; testid: string; dark: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    data-testid={testid}
    className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider border transition ${
      active
        ? "bg-yellow-500 text-black border-yellow-500"
        : dark
          ? "border-yellow-400/30 text-yellow-100/70 hover:bg-yellow-400/10"
          : "border-neutral-300 text-neutral-700 hover:bg-neutral-100"
    }`}
  >
    {children}
  </button>
);

const Stat = ({ label, value, subtle, dark, testid }: { label: string; value: string; subtle: string; dark: boolean; testid: string }) => (
  <div className={`rounded-md p-3 ${subtle}`}>
    <div className={`text-[10px] uppercase tracking-wider font-semibold ${dark ? "text-yellow-100/60" : "text-neutral-600"}`}>{label}</div>
    <div className={`mt-1 font-heading text-base md:text-lg font-bold ${dark ? "text-yellow-50" : "text-neutral-900"}`} data-testid={testid}>{value}</div>
  </div>
);

export default CalculatorPage;
