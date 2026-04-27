import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Calculator, Printer, RotateCcw, Copy, Check, IndianRupee } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useHeroImage } from "@/hooks/useHeroImage";
import heroImg from "@/assets/hero-engineering-works.png";

type ShapeKey =
  | "round" | "square" | "hex" | "flat" | "sheet"
  | "pipe" | "hexBolt" | "studBolt" | "hexNut";

type MaterialKey =
  | "MS" | "SS304" | "SS316" | "SS410" | "BRASS" | "COPPER"
  | "ALU" | "TI" | "INCO625" | "INCO718" | "MONEL" | "CASTIRON" | "ZINC";

const MATERIAL_DENSITY: Record<MaterialKey, { name: string; density: number }> = {
  MS:        { name: "Mild Steel (MS)",            density: 7.85 },
  SS304:     { name: "Stainless Steel 304",        density: 7.93 },
  SS316:     { name: "Stainless Steel 316",        density: 8.00 },
  SS410:     { name: "Stainless Steel 410",        density: 7.70 },
  BRASS:     { name: "Brass",                       density: 8.50 },
  COPPER:    { name: "Copper",                      density: 8.96 },
  ALU:       { name: "Aluminium",                   density: 2.70 },
  TI:        { name: "Titanium Grade 2",            density: 4.51 },
  INCO625:   { name: "Inconel 625",                 density: 8.44 },
  INCO718:   { name: "Inconel 718",                 density: 8.19 },
  MONEL:     { name: "Monel 400",                   density: 8.83 },
  CASTIRON:  { name: "Cast Iron",                   density: 7.20 },
  ZINC:      { name: "Zinc",                        density: 7.14 },
};

const SHAPES: { key: ShapeKey; label: string; sketch: string }[] = [
  { key: "round",    label: "Round Bar",        sketch: "○" },
  { key: "square",   label: "Square Bar",       sketch: "◻" },
  { key: "hex",      label: "Hex Bar",          sketch: "⬡" },
  { key: "flat",     label: "Flat / Plate",     sketch: "▭" },
  { key: "sheet",    label: "Sheet",            sketch: "▢" },
  { key: "pipe",     label: "Pipe / Tube",      sketch: "◎" },
  { key: "hexBolt",  label: "Hex Bolt",         sketch: "🔩" },
  { key: "studBolt", label: "Stud Bolt",        sketch: "│" },
  { key: "hexNut",   label: "Hex Nut",          sketch: "⬢" },
];

const num = (s: string) => {
  const n = parseFloat(s);
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

const fmt = (n: number, d = 3) =>
  Number.isFinite(n)
    ? n.toLocaleString("en-IN", { maximumFractionDigits: d, minimumFractionDigits: 0 })
    : "0";

const fmtINR = (n: number) =>
  Number.isFinite(n)
    ? n.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 })
    : "₹0.00";

/**
 * Compute weight of ONE piece (in kg) for a given shape and dimensions in mm.
 * Density is g/cm³. Volume in cm³ → kg = volume * density / 1000.
 *
 * mm → cm: divide by 10. Volume in cm³ = (mm volume) / 1000.
 * So weight (kg) = (mm³ volume) / 1000 (cm³) * density / 1000 (g→kg)
 *                = mm³ * density / 1_000_000.
 */
function weightPerPiece(shape: ShapeKey, dims: Record<string, number>, density: number): number {
  let volMm3 = 0;
  switch (shape) {
    case "round": {
      const { d, len } = dims;
      volMm3 = (Math.PI / 4) * d * d * len;
      break;
    }
    case "square": {
      const { side, len } = dims;
      volMm3 = side * side * len;
      break;
    }
    case "hex": {
      // Across-flats convention: area = (sqrt(3)/2) * W²
      const { wAcrossFlats, len } = dims;
      volMm3 = (Math.sqrt(3) / 2) * wAcrossFlats * wAcrossFlats * len;
      break;
    }
    case "flat": {
      const { thickness, width, len } = dims;
      volMm3 = thickness * width * len;
      break;
    }
    case "sheet": {
      const { thickness, width, height } = dims;
      volMm3 = thickness * width * height;
      break;
    }
    case "pipe": {
      const { od, wall, len } = dims;
      const id = Math.max(od - 2 * wall, 0);
      volMm3 = (Math.PI / 4) * (od * od - id * id) * len;
      break;
    }
    case "hexBolt": {
      // Approx: shank cylinder (d × shankLen) + hex head (across-flats × headHeight)
      const { d, shankLen, headAcrossFlats, headHeight } = dims;
      const shank = (Math.PI / 4) * d * d * shankLen;
      const head  = (Math.sqrt(3) / 2) * headAcrossFlats * headAcrossFlats * headHeight;
      volMm3 = shank + head;
      break;
    }
    case "studBolt": {
      const { d, len } = dims;
      volMm3 = (Math.PI / 4) * d * d * len;
      break;
    }
    case "hexNut": {
      // Hex prism with through-hole: area = (sqrt(3)/2)·W² − (π/4)·d²
      const { acrossFlats, height, holeDia } = dims;
      const a = (Math.sqrt(3) / 2) * acrossFlats * acrossFlats - (Math.PI / 4) * holeDia * holeDia;
      volMm3 = Math.max(a, 0) * height;
      break;
    }
  }
  return (volMm3 * density) / 1_000_000;
}

type DimSpec = { key: string; label: string; defaultVal: string; unit?: string };

const SHAPE_DIMS: Record<ShapeKey, DimSpec[]> = {
  round:    [{ key: "d", label: "Diameter D", defaultVal: "16" }, { key: "len", label: "Length L", defaultVal: "1000" }],
  square:   [{ key: "side", label: "Side", defaultVal: "20" }, { key: "len", label: "Length L", defaultVal: "1000" }],
  hex:      [{ key: "wAcrossFlats", label: "Across Flats W", defaultVal: "17" }, { key: "len", label: "Length L", defaultVal: "1000" }],
  flat:     [{ key: "thickness", label: "Thickness t", defaultVal: "10" }, { key: "width", label: "Width W", defaultVal: "50" }, { key: "len", label: "Length L", defaultVal: "1000" }],
  sheet:    [{ key: "thickness", label: "Thickness t", defaultVal: "2" }, { key: "width", label: "Width W", defaultVal: "1000" }, { key: "height", label: "Length L", defaultVal: "2000" }],
  pipe:     [{ key: "od", label: "Outer Dia OD", defaultVal: "60.3" }, { key: "wall", label: "Wall t", defaultVal: "3.91" }, { key: "len", label: "Length L", defaultVal: "1000" }],
  hexBolt:  [{ key: "d", label: "Shank Dia D", defaultVal: "16" }, { key: "shankLen", label: "Shank Length", defaultVal: "100" }, { key: "headAcrossFlats", label: "Head Across-Flats", defaultVal: "24" }, { key: "headHeight", label: "Head Height", defaultVal: "10" }],
  studBolt: [{ key: "d", label: "Diameter D", defaultVal: "20" }, { key: "len", label: "Length L", defaultVal: "150" }],
  hexNut:   [{ key: "acrossFlats", label: "Across Flats W", defaultVal: "24" }, { key: "height", label: "Height H", defaultVal: "13" }, { key: "holeDia", label: "Bore Dia (tap)", defaultVal: "16" }],
};

const SHAPE_HELP: Record<ShapeKey, string> = {
  round:    "Solid cylindrical bar — common for stud rods, shafts, fasteners.",
  square:   "Solid square cross-section bar.",
  hex:      "Hexagonal solid bar — feedstock for hex bolts & nuts.",
  flat:     "Rectangular flat bar / plate strip.",
  sheet:    "Plate or sheet material — width × length × thickness.",
  pipe:     "Hollow pipe / tube — uses OD and wall thickness.",
  hexBolt:  "Estimated weight of a finished hex-head bolt (head + shank).",
  studBolt: "Threaded stud rod (treats it as a solid round bar).",
  hexNut:   "Standard hex nut — hex prism with central tap hole.",
};

const MetalCalculatorPage = () => {
  const dynamicHero = useHeroImage("calculator", heroImg);
  const [shape, setShape] = useState<ShapeKey>("round");
  const [material, setMaterial] = useState<MaterialKey>("MS");

  // dimension state per shape (string for inputs)
  const [dimsByShape, setDimsByShape] = useState<Record<ShapeKey, Record<string, string>>>(() => {
    const init = {} as Record<ShapeKey, Record<string, string>>;
    (Object.keys(SHAPE_DIMS) as ShapeKey[]).forEach((s) => {
      init[s] = {};
      SHAPE_DIMS[s].forEach((d) => { init[s][d.key] = d.defaultVal; });
    });
    return init;
  });

  const [qty, setQty] = useState("1");
  const [ratePerKg, setRatePerKg] = useState("100");
  const [includeCost, setIncludeCost] = useState(true);
  const [copied, setCopied] = useState(false);

  const dims = dimsByShape[shape];
  const setDim = (key: string, value: string) =>
    setDimsByShape((prev) => ({ ...prev, [shape]: { ...prev[shape], [key]: value } }));

  const calc = useMemo(() => {
    const dimsNum: Record<string, number> = {};
    Object.keys(dims).forEach((k) => { dimsNum[k] = num(dims[k]); });
    const density = MATERIAL_DENSITY[material].density;
    const w = weightPerPiece(shape, dimsNum, density);
    const q = num(qty) || 1;
    const totalKg = w * q;
    const totalGrams = w * 1000;
    const cost = totalKg * num(ratePerKg);
    return { perPieceKg: w, perPieceGrams: totalGrams, totalKg, cost };
  }, [shape, material, dims, qty, ratePerKg]);

  const reset = () => {
    setShape("round");
    setMaterial("MS");
    setQty("1");
    setRatePerKg("100");
    setIncludeCost(true);
    setDimsByShape((prev) => {
      const next = { ...prev };
      (Object.keys(SHAPE_DIMS) as ShapeKey[]).forEach((s) => {
        next[s] = {};
        SHAPE_DIMS[s].forEach((d) => { next[s][d.key] = d.defaultVal; });
      });
      return next;
    });
  };

  const copyResult = async () => {
    const lines: string[] = [];
    lines.push(`M.I. Engineering Works — Metal Weight Calculator`);
    lines.push(`Shape: ${SHAPES.find((s) => s.key === shape)?.label}`);
    lines.push(`Material: ${MATERIAL_DENSITY[material].name} (density ${MATERIAL_DENSITY[material].density} g/cm³)`);
    SHAPE_DIMS[shape].forEach((d) => lines.push(`${d.label}: ${dims[d.key]} mm`));
    lines.push(`Quantity: ${qty} pcs`);
    lines.push(`Weight / piece: ${fmt(calc.perPieceKg, 4)} kg (${fmt(calc.perPieceGrams, 1)} g)`);
    lines.push(`Total weight: ${fmt(calc.totalKg, 3)} kg`);
    if (includeCost) {
      lines.push(`Rate / kg: ${fmtINR(num(ratePerKg))}`);
      lines.push(`Estimated cost: ${fmtINR(calc.cost)}`);
    }
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* ignore */ }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Metal Weight Calculator | M.I. Engineering Works</title>
        <meta name="description" content="Free online metal weight calculator — calculate weight of round bar, hex bar, plate, pipe, hex bolts, nuts and stud bolts in any material (MS, SS304, SS316, Brass, Aluminium, Titanium and more)." />
      </Helmet>
      <Header />

      {/* Hero */}
      <section className="relative min-h-[40vh] md:min-h-[45vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={dynamicHero} alt="" className="w-full h-full object-cover" style={{ objectPosition: "30% 35%" }} />
          <div className="absolute inset-0 bg-charcoal/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/85 to-charcoal/60" />
        </div>
        <div className="container relative z-10 py-16 md:py-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-3xl">
            <div className="gold-divider w-20 mb-5" />
            <p className="text-xs tracking-[0.4em] uppercase text-primary font-semibold mb-3">Engineering Tools</p>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] text-foreground mb-4">
              Metal Weight <span className="text-gradient-gold">Calculator</span>
            </h1>
            <p className="text-base md:text-lg text-foreground/80 max-w-2xl">
              Calculate the weight of bars, plates, pipes, bolts &amp; nuts in any material — free, accurate, instant. Add a rate per kg to estimate cost.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Calculator */}
      <section className="py-14 md:py-20 bg-background">
        <div className="container">
          <div className="grid lg:grid-cols-12 gap-6 md:gap-8">
            {/* Inputs */}
            <div className="lg:col-span-7 space-y-6">
              {/* Shape picker */}
              <div className="bg-card border border-border rounded-2xl p-5 md:p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-md bg-gradient-gold text-charcoal flex items-center justify-center">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-heading text-lg font-bold text-foreground">Choose Shape</h2>
                    <p className="text-xs text-muted-foreground">{SHAPE_HELP[shape]}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {SHAPES.map((s) => {
                    const active = shape === s.key;
                    return (
                      <button
                        key={s.key}
                        onClick={() => setShape(s.key)}
                        data-testid={`shape-${s.key}`}
                        className={`group flex flex-col items-center gap-1 py-3 px-2 rounded-lg border transition-all text-xs font-semibold ${
                          active
                            ? "border-primary bg-primary/10 text-primary shadow-glow"
                            : "border-border bg-background hover:border-primary/50 hover:bg-secondary/40 text-foreground/80"
                        }`}
                      >
                        <span className="text-xl leading-none">{s.sketch}</span>
                        <span className="text-[11px] leading-tight text-center">{s.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Material + dimensions */}
              <div className="bg-card border border-border rounded-2xl p-5 md:p-6 shadow-sm">
                <h2 className="font-heading text-lg font-bold text-foreground mb-4">Material &amp; Dimensions</h2>

                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <Field label="Material">
                    <select
                      value={material}
                      onChange={(e) => setMaterial(e.target.value as MaterialKey)}
                      data-testid="select-material"
                      className="w-full bg-background border border-border rounded-md px-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                    >
                      {(Object.keys(MATERIAL_DENSITY) as MaterialKey[]).map((k) => (
                        <option key={k} value={k}>
                          {MATERIAL_DENSITY[k].name} — {MATERIAL_DENSITY[k].density} g/cm³
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Quantity (pcs)">
                    <input
                      type="number" min="1" step="1" inputMode="numeric"
                      value={qty} onChange={(e) => setQty(e.target.value)}
                      data-testid="input-qty"
                      className="w-full bg-background border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                    />
                  </Field>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {SHAPE_DIMS[shape].map((d) => (
                    <Field key={d.key} label={`${d.label} (mm)`}>
                      <input
                        type="number" min="0" step="0.01"
                        value={dims[d.key] ?? ""}
                        onChange={(e) => setDim(d.key, e.target.value)}
                        data-testid={`input-${shape}-${d.key}`}
                        className="w-full bg-background border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                      />
                    </Field>
                  ))}
                </div>

                <div className="mt-5 pt-5 border-t border-border">
                  <div className="flex items-center justify-between mb-3">
                    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox" checked={includeCost}
                        onChange={(e) => setIncludeCost(e.target.checked)}
                        data-testid="checkbox-cost"
                        className="w-4 h-4 accent-primary"
                      />
                      <span className="text-sm font-semibold text-foreground">Estimate cost</span>
                    </label>
                    <span className="text-xs text-muted-foreground">Optional</span>
                  </div>
                  {includeCost && (
                    <Field label="Rate per kg (₹)">
                      <div className="relative">
                        <IndianRupee className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type="number" min="0" step="0.01"
                          value={ratePerKg} onChange={(e) => setRatePerKg(e.target.value)}
                          data-testid="input-rate-kg"
                          className="w-full bg-background border border-border rounded-md pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                        />
                      </div>
                    </Field>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-border">
                  <button
                    onClick={reset}
                    data-testid="button-reset"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-border text-sm font-semibold hover:bg-secondary/50 transition"
                  >
                    <RotateCcw className="w-4 h-4" /> Reset
                  </button>
                  <button
                    onClick={() => window.print()}
                    data-testid="button-print"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-border text-sm font-semibold hover:bg-secondary/50 transition"
                  >
                    <Printer className="w-4 h-4" /> Print
                  </button>
                  <button
                    onClick={copyResult}
                    data-testid="button-copy"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-foreground text-background text-sm font-semibold hover:opacity-90 transition"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copied" : "Copy Quote"}
                  </button>
                </div>
              </div>
            </div>

            {/* Results — sticky */}
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-24 space-y-4">
                <div className="rounded-2xl bg-gradient-dark text-foreground p-6 shadow-elegant border border-primary/20">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-primary/80 font-semibold mb-1">Total Weight</p>
                  <div className="font-heading text-5xl font-extrabold text-gradient-gold leading-none" data-testid="result-total-kg">
                    {fmt(calc.totalKg, 3)} <span className="text-2xl font-bold">kg</span>
                  </div>
                  <div className="mt-2 text-sm text-foreground/70">
                    for {qty} {num(qty) === 1 ? "piece" : "pieces"} of {SHAPES.find((s) => s.key === shape)?.label.toLowerCase()}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Stat label="Weight / piece (kg)" value={fmt(calc.perPieceKg, 4)} testid="result-piece-kg" />
                  <Stat label="Weight / piece (g)"  value={fmt(calc.perPieceGrams, 1)} testid="result-piece-g" />
                </div>

                {includeCost && (
                  <div className="rounded-2xl bg-card border border-border p-5">
                    <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground font-semibold mb-1">Estimated Cost</p>
                    <div className="font-heading text-3xl font-bold text-foreground" data-testid="result-cost">{fmtINR(calc.cost)}</div>
                    <p className="text-xs text-muted-foreground mt-1">@ {fmtINR(num(ratePerKg))}/kg × {fmt(calc.totalKg, 3)} kg</p>
                  </div>
                )}

                <div className="rounded-2xl bg-card border border-border p-5">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground font-semibold mb-2">Material Density</p>
                  <p className="text-sm text-foreground"><strong>{MATERIAL_DENSITY[material].name}</strong> — {MATERIAL_DENSITY[material].density} g/cm³</p>
                </div>

                <div className="rounded-2xl bg-secondary/40 border border-border p-5 text-xs text-muted-foreground leading-relaxed">
                  Weights are theoretical and based on standard density values. Actual mill weights may vary by ±3–5% due to tolerances, surface finish and material composition.
                </div>
              </div>
            </div>
          </div>

          {/* SEO content footer */}
          <div className="mt-16 max-w-3xl mx-auto text-sm text-muted-foreground space-y-3 text-center">
            <h2 className="font-heading text-xl font-bold text-foreground">How is metal weight calculated?</h2>
            <p>
              Weight (kg) = Volume (cm³) × Density (g/cm³) ÷ 1000. For round bar: V = (π/4) × D² × L. For pipe: V = (π/4) × (OD² − ID²) × L. For hex bar (across-flats W): area = (√3 / 2) × W². All inputs are in millimetres; densities are in grams per cubic centimetre.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">{label}</span>
    {children}
  </label>
);

const Stat = ({ label, value, testid }: { label: string; value: string; testid: string }) => (
  <div className="rounded-xl bg-card border border-border p-4">
    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</div>
    <div className="mt-1 font-heading text-xl font-bold text-foreground" data-testid={testid}>{value}</div>
  </div>
);

export default MetalCalculatorPage;
