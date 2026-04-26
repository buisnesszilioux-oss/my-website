import studBolt from "@/assets/stud-bolt.webp";
import doubleEndStud from "@/assets/double-end-stud.webp";
import hexBolt from "@/assets/hex-bolt.webp";
import heavyHexBolt from "@/assets/heavy-hex-bolt.webp";
import socketCapScrew from "@/assets/socket-cap-screw.jpg";
import countersunkScrew from "@/assets/countersunk-screw.jpg";
import setScrew from "@/assets/set-screw.webp";
import eyeBolt from "@/assets/eye-bolt.webp";
import uBolt from "@/assets/u-bolt.webp";
import anchorBolt from "@/assets/anchor-bolt.webp";
import threadedRod from "@/assets/threaded-rod.jpg";
import roundBar from "@/assets/round-bar.jpg";

export interface Product {
  slug: string;
  name: string;
  img: string;
  standard: string;
  description: string;
  sizes: string;
  threads: string;
  length: string;
  material: string;
  finish: string[];
  grades: string[];
  applications: string[];
  dimensions: { label: string; value: string }[];
}

export const products: Product[] = [
  {
    slug: "stud-bolts",
    name: "Stud Bolts",
    img: studBolt,
    standard: "ASME B16.5 / DIN 976",
    description: "Fully threaded or partially threaded stud bolts manufactured from ASTM A193 Grade B7 chromium-molybdenum steel. Designed for high-temperature, high-pressure flange connections in petrochemical, oil & gas, and power generation industries.",
    sizes: "M6 to M100 | 1/4\" to 4\"",
    threads: "Metric (Coarse & Fine) | UNC / UNF | BSW / BSF",
    length: "30mm to 3000mm | Custom lengths available",
    material: "ASTM A193 Grade B7 (42CrMo4 / AISI 4140)",
    finish: ["Plain / Black Oxide", "Hot Dip Galvanized", "Zinc Plated", "PTFE / Xylan Coated", "Cadmium Plated"],
    grades: ["B7", "B7M", "B16", "L7", "L7M", "B8", "B8M", "Grade 10.9", "Grade 12.9"],
    applications: ["Flange Connections", "Pressure Vessels", "Heat Exchangers", "Pipelines", "Refineries", "Power Plants"],
    dimensions: [
      { label: "Diameter Range", value: "M6 – M100" },
      { label: "Length Range", value: "30mm – 3000mm" },
      { label: "Thread Pitch", value: "As per standard" },
      { label: "Tensile Strength", value: "860 MPa (min)" },
      { label: "Yield Strength", value: "720 MPa (min)" },
      { label: "Hardness", value: "235–302 HB" },
    ],
  },
  {
    slug: "double-end-studs",
    name: "Double End Studs",
    img: doubleEndStud,
    standard: "ASME B18.2.1 / DIN 2510",
    description: "Double end studs with equal or unequal thread lengths on both ends. Used in applications where bolts cannot be used due to space constraints. Manufactured to ASTM A193 B7 specifications for critical high-pressure service.",
    sizes: "M8 to M80 | 5/16\" to 3\"",
    threads: "Metric (Coarse & Fine) | UNC / UNF",
    length: "40mm to 2000mm",
    material: "ASTM A193 Grade B7 (42CrMo4 / AISI 4140)",
    finish: ["Plain / Black Oxide", "Hot Dip Galvanized", "Zinc Plated", "PTFE Coated"],
    grades: ["B7", "B7M", "B16", "L7", "B8", "B8M"],
    applications: ["Turbine Casings", "Valve Bodies", "Pump Assemblies", "Compressor Joints"],
    dimensions: [
      { label: "Diameter Range", value: "M8 – M80" },
      { label: "Length Range", value: "40mm – 2000mm" },
      { label: "Thread Length", value: "Equal or unequal ends" },
      { label: "Tensile Strength", value: "860 MPa (min)" },
      { label: "Yield Strength", value: "720 MPa (min)" },
      { label: "Hardness", value: "235–302 HB" },
    ],
  },
  {
    slug: "hex-bolts",
    name: "Hex Bolts",
    img: hexBolt,
    standard: "ASME B18.2.1 / DIN 931",
    description: "Hexagonal head bolts manufactured from high-strength alloy steel per ASTM A193 Grade B7. Available in full thread and partial thread configurations for structural and industrial fastening applications.",
    sizes: "M6 to M64 | 1/4\" to 2-1/2\"",
    threads: "Metric Coarse & Fine | UNC / UNF",
    length: "16mm to 500mm",
    material: "ASTM A193 Grade B7 (42CrMo4 / AISI 4140)",
    finish: ["Plain / Black Oxide", "Hot Dip Galvanized", "Zinc Plated", "Dacromet"],
    grades: ["B7", "B16", "L7", "Grade 8.8", "Grade 10.9", "Grade 12.9"],
    applications: ["Structural Steelwork", "Heavy Equipment", "Bridge Construction", "Industrial Machinery"],
    dimensions: [
      { label: "Diameter Range", value: "M6 – M64" },
      { label: "Head Width (A/F)", value: "10mm – 95mm" },
      { label: "Head Height", value: "4mm – 41mm" },
      { label: "Tensile Strength", value: "860 MPa (min)" },
      { label: "Yield Strength", value: "720 MPa (min)" },
      { label: "Hardness", value: "235–302 HB" },
    ],
  },
  {
    slug: "heavy-hex-bolts",
    name: "Heavy Hex Bolts",
    img: heavyHexBolt,
    standard: "ASME B18.2.1 / DIN 6914",
    description: "Heavy hexagonal head bolts with larger head dimensions for greater bearing surface area. Designed for high-strength structural and pressure applications. Manufactured from ASTM A193 Grade B7 alloy steel.",
    sizes: "M12 to M100 | 1/2\" to 4\"",
    threads: "Metric Coarse | UNC",
    length: "30mm to 800mm",
    material: "ASTM A193 Grade B7 (42CrMo4 / AISI 4140)",
    finish: ["Plain / Black Oxide", "Hot Dip Galvanized", "PTFE Coated"],
    grades: ["B7", "B7M", "B16", "L7", "Grade 10.9"],
    applications: ["Petrochemical Plants", "Steel Structures", "Pressure Vessels", "Heavy Machinery"],
    dimensions: [
      { label: "Diameter Range", value: "M12 – M100" },
      { label: "Head Width (A/F)", value: "22mm – 155mm" },
      { label: "Head Height", value: "8mm – 64mm" },
      { label: "Tensile Strength", value: "860 MPa (min)" },
      { label: "Yield Strength", value: "720 MPa (min)" },
      { label: "Hardness", value: "235–302 HB" },
    ],
  },
  {
    slug: "socket-head-cap-screws",
    name: "Socket Head Cap Screws",
    img: socketCapScrew,
    standard: "ASME B18.3 / DIN 912",
    description: "High-strength socket head cap screws with cylindrical heads and internal hexagonal (Allen) drive. Ideal for applications requiring a flush or recessed head. Available in ASTM A193 Grade B7 and higher grades.",
    sizes: "M3 to M48 | #4 to 1-1/2\"",
    threads: "Metric Coarse & Fine | UNC / UNF",
    length: "6mm to 300mm",
    material: "ASTM A193 Grade B7 / Alloy Steel",
    finish: ["Plain / Black Oxide", "Zinc Plated", "Nickel Plated"],
    grades: ["B7", "Grade 10.9", "Grade 12.9"],
    applications: ["Machine Tools", "Die & Mold", "Automotive", "Precision Equipment"],
    dimensions: [
      { label: "Diameter Range", value: "M3 – M48" },
      { label: "Head Diameter", value: "5.5mm – 72mm" },
      { label: "Head Height", value: "3mm – 48mm" },
      { label: "Socket Size", value: "2.5mm – 36mm" },
      { label: "Tensile Strength", value: "1040 MPa (min) for 12.9" },
      { label: "Hardness", value: "280–365 HB" },
    ],
  },
  {
    slug: "countersunk-screws",
    name: "Countersunk Screws",
    img: countersunkScrew,
    standard: "ASME B18.3 / DIN 7991",
    description: "Flat-head countersunk socket screws with 90° head angle for flush mounting applications. Manufactured from high-grade alloy steel with precision threading for critical assemblies.",
    sizes: "M3 to M24 | #4 to 1\"",
    threads: "Metric Coarse & Fine | UNC / UNF",
    length: "8mm to 150mm",
    material: "Alloy Steel / Stainless Steel",
    finish: ["Plain / Black Oxide", "Zinc Plated", "Nickel Plated"],
    grades: ["Grade 10.9", "Grade 12.9", "B8", "B8M"],
    applications: ["Aerospace", "Electronics Enclosures", "Flush-Mount Assemblies", "Precision Machinery"],
    dimensions: [
      { label: "Diameter Range", value: "M3 – M24" },
      { label: "Head Diameter", value: "6mm – 44mm" },
      { label: "Head Angle", value: "90°" },
      { label: "Socket Size", value: "2mm – 14mm" },
      { label: "Tensile Strength", value: "1040 MPa (min) for 12.9" },
      { label: "Hardness", value: "280–365 HB" },
    ],
  },
  {
    slug: "socket-set-screws",
    name: "Socket Set Screws",
    img: setScrew,
    standard: "ASME B18.3 / DIN 913-916",
    description: "Headless set screws with internal hex drive, available in flat, cup, cone, and dog point styles. Used for securing pulleys, gears, and collars on shafts. Manufactured to high hardness specifications.",
    sizes: "M3 to M24 | #4 to 1\"",
    threads: "Metric Coarse & Fine | UNC / UNF",
    length: "3mm to 80mm",
    material: "Alloy Steel / Stainless Steel",
    finish: ["Plain / Black Oxide", "Zinc Plated"],
    grades: ["Grade 14.9 (45H)", "Grade 12.9", "B8", "B8M"],
    applications: ["Shaft Locking", "Pulley Mounting", "Gear Assemblies", "Collar Fixing"],
    dimensions: [
      { label: "Diameter Range", value: "M3 – M24" },
      { label: "Point Types", value: "Flat / Cup / Cone / Dog" },
      { label: "Socket Size", value: "1.5mm – 12mm" },
      { label: "Tensile Strength", value: "N/A (Compressive)" },
      { label: "Hardness", value: "43–53 HRC" },
    ],
  },
  {
    slug: "eye-bolts",
    name: "Eye Bolts",
    img: eyeBolt,
    standard: "ASME B18.15 / DIN 444",
    description: "Forged eye bolts with circular loop head for lifting, rigging, and anchoring applications. Available in shouldered and non-shouldered types. Manufactured from high-strength alloy steel for safe working loads.",
    sizes: "M8 to M48 | 5/16\" to 2\"",
    threads: "Metric Coarse | UNC",
    length: "Custom as per requirement",
    material: "ASTM A193 Grade B7 / C15 / C45 Steel",
    finish: ["Plain / Self-Colour", "Hot Dip Galvanized", "Zinc Plated"],
    grades: ["B7", "Grade 8.8", "C15E"],
    applications: ["Lifting & Rigging", "Anchoring", "Cable Termination", "Structural Tie-Downs"],
    dimensions: [
      { label: "Diameter Range", value: "M8 – M48" },
      { label: "Eye Inner Dia", value: "20mm – 90mm" },
      { label: "Type", value: "Shouldered / Non-shouldered" },
      { label: "WLL (Working Load)", value: "As per size" },
      { label: "Tensile Strength", value: "860 MPa (min)" },
    ],
  },
  {
    slug: "u-bolts",
    name: "U Bolts",
    img: uBolt,
    standard: "ASME B18.31.5 / DIN 3570",
    description: "U-shaped bolts used for clamping pipes, tubes, and round sections to structural supports. Available in round bend and square bend configurations. Manufactured from high-tensile alloy and stainless steel.",
    sizes: "M6 to M36 | 1/4\" to 1-1/2\" (Pipe OD: 1/2\" to 24\")",
    threads: "Metric Coarse | UNC",
    length: "As per pipe size",
    material: "ASTM A193 B7 / SS 304 / SS 316",
    finish: ["Plain / Self-Colour", "Hot Dip Galvanized", "Zinc Plated", "PTFE Coated"],
    grades: ["B7", "B8", "B8M", "L7"],
    applications: ["Pipe Clamping", "Structural Supports", "Automotive Suspension", "Marine Applications"],
    dimensions: [
      { label: "Rod Diameter", value: "M6 – M36" },
      { label: "Pipe Size Range", value: "1/2\" – 24\" NB" },
      { label: "Bend Type", value: "Round / Square" },
      { label: "Tensile Strength", value: "860 MPa (min) for B7" },
      { label: "Thread Length", value: "As per standard" },
    ],
  },
  {
    slug: "anchor-bolts",
    name: "Anchor Bolts",
    img: anchorBolt,
    standard: "DIN 529",
    description: "L-shaped, J-shaped, and straight anchor bolts for embedding in concrete foundations. Used for securing structural columns, heavy machinery, and equipment bases. Custom lengths and configurations available.",
    sizes: "M10 to M100 | 3/8\" to 4\"",
    threads: "Metric Coarse | UNC",
    length: "150mm to 6000mm | Custom lengths",
    material: "ASTM A193 B7 / ASTM F1554 Grade 105",
    finish: ["Plain / Self-Colour", "Hot Dip Galvanized", "Zinc Plated"],
    grades: ["B7", "F1554 Gr. 36/55/105", "Grade 8.8"],
    applications: ["Foundation Anchoring", "Structural Steel", "Heavy Machinery Bases", "Wind Turbine Foundations"],
    dimensions: [
      { label: "Diameter Range", value: "M10 – M100" },
      { label: "Embed Length", value: "As per design" },
      { label: "Bend Type", value: "L / J / Straight" },
      { label: "Tensile Strength", value: "860 MPa (min) for B7" },
      { label: "Projection Length", value: "As per requirement" },
    ],
  },
  {
    slug: "threaded-rods",
    name: "Threaded Rods",
    img: threadedRod,
    standard: "DIN 976 / ASME B18.31.2",
    description: "Fully threaded rods (all-thread rods) manufactured from ASTM A193 Grade B7 alloy steel. Used for through-bolting, anchor applications, and as general-purpose fasteners in construction and industrial settings.",
    sizes: "M6 to M100 | 1/4\" to 4\"",
    threads: "Metric Coarse & Fine | UNC / UNF | ACME",
    length: "1 Meter / 2 Meter / 3 Meter | Custom Cut",
    material: "ASTM A193 Grade B7 (42CrMo4 / AISI 4140)",
    finish: ["Plain / Black Oxide", "Hot Dip Galvanized", "Zinc Plated", "PTFE Coated"],
    grades: ["B7", "B7M", "B16", "L7", "B8", "B8M"],
    applications: ["Through-Bolting", "Suspension Systems", "Construction Hangers", "Chemical Plants"],
    dimensions: [
      { label: "Diameter Range", value: "M6 – M100" },
      { label: "Standard Lengths", value: "1m / 2m / 3m" },
      { label: "Thread Type", value: "Full thread" },
      { label: "Tensile Strength", value: "860 MPa (min)" },
      { label: "Yield Strength", value: "720 MPa (min)" },
      { label: "Hardness", value: "235–302 HB" },
    ],
  },
  {
    slug: "round-bars",
    name: "Round Bars",
    img: roundBar,
    standard: "AISI 4140 / 4142",
    description: "High-quality alloy steel round bars for machining fasteners, shafts, and custom components. Supplied in hot-rolled, cold-drawn, and peeled/ground conditions. Available in AISI 4140, 4142, and equivalent grades.",
    sizes: "Ø10mm to Ø500mm",
    threads: "N/A (Raw material)",
    length: "1 Meter to 6 Meter | Custom Cut",
    material: "AISI 4140 / 4142 / EN19 / 42CrMo4",
    finish: ["Hot Rolled", "Cold Drawn (Bright)", "Peeled & Ground"],
    grades: ["AISI 4140", "AISI 4142", "EN19", "42CrMo4"],
    applications: ["Fastener Manufacturing", "Shaft & Axle Production", "Die & Tool Making", "General Machining"],
    dimensions: [
      { label: "Diameter Range", value: "Ø10mm – Ø500mm" },
      { label: "Standard Lengths", value: "1m – 6m" },
      { label: "Condition", value: "HR / CD / Peeled / Ground" },
      { label: "Tensile Strength", value: "850–1000 MPa" },
      { label: "Yield Strength", value: "680 MPa (min)" },
      { label: "Hardness", value: "230–280 HB" },
    ],
  },
];

export const getProductBySlug = (slug: string): Product | undefined => {
  return products.find((p) => p.slug === slug);
};
