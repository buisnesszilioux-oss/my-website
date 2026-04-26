// Seed data extracted/structured from Real-Bolt source HTMLs and existing site data.

export const standardsSeed = [
  {
    slug: "astm",
    code: "ASTM",
    name: "ASTM International (American Society for Testing and Materials)",
    region: "United States / International",
    description:
      "ASTM standards (such as A193, A194, A320, A325, A490, F1554) are the global benchmark for high-strength bolting in petrochemical, oil & gas, power generation, and structural steel applications. They define chemistry, mechanical properties, heat treatment, testing, and marking requirements.",
    image: "https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?w=1200&q=80",
    scope:
      "Mechanical and chemical specifications for fasteners, alloy steel bolting materials, stainless steel bolting, structural bolts, and anchor bolts.",
    applications: ["Oil & Gas", "Petrochemical", "Power Generation", "Refineries", "Pressure Vessels", "Structural Steel"],
    materials: ["A193 B7 / B7M / B16", "A194 2H / 4 / 7 / 8", "A320 L7 / L7M", "A325 / A490", "F1554"],
    examples: [
      "ASTM A193 B7 — Cr-Mo alloy stud bolts",
      "ASTM A194 2H — Heavy hex nuts for high-temperature service",
      "ASTM A320 L7 — Low-temperature alloy bolting",
      "ASTM F1554 — Anchor bolts (Grade 36/55/105)",
    ],
  },
  {
    slug: "ansi-asme",
    code: "ANSI / ASME",
    name: "American National Standards Institute / American Society of Mechanical Engineers",
    region: "United States",
    description:
      "ANSI/ASME standards govern the dimensional, threading, and head-form requirements of fasteners. ASME B18 covers bolts, screws, and nuts, while ASME B1 governs unified inch (UNC/UNF) and metric (M) thread profiles. Compliance ensures interchangeability of fasteners worldwide.",
    image: "https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=1200&q=80",
    scope:
      "Dimensional and thread standards for inch and metric series fasteners — hex bolts, heavy hex, socket products, studs, washers, and nuts.",
    applications: ["Flanged Joints (ASME B16.5)", "Pressure Piping", "Mechanical Assemblies", "Industrial Equipment"],
    materials: ["Carbon Steel", "Alloy Steel", "Stainless Steel"],
    examples: [
      "ASME B18.2.1 — Square and Hex Bolts and Screws (Inch)",
      "ASME B18.2.2 — Nuts for General Applications",
      "ASME B1.1 — Unified Inch Screw Threads (UN/UNR)",
      "ASME B18.3 — Socket Cap Screws",
    ],
  },
  {
    slug: "din",
    code: "DIN",
    name: "Deutsches Institut für Normung (German Institute for Standardization)",
    region: "Germany / Europe",
    description:
      "DIN standards are the cornerstone of European fastener manufacturing. DIN 931, 933, 934, 976, and 6914 define metric hex bolts, full thread bolts, hex nuts, threaded rods, and high-strength structural bolts. Most DIN standards are gradually being superseded by ISO equivalents while remaining widely specified in industry.",
    image: "https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=1200&q=80",
    scope:
      "Metric fastener dimensions, threads (DIN 13), property classes (DIN EN ISO 898), surface treatments, and tolerances.",
    applications: ["Automotive", "Heavy Engineering", "Industrial Machinery", "Construction"],
    materials: ["Property Class 8.8 / 10.9 / 12.9", "Stainless A2 / A4", "Quenched & Tempered Alloy"],
    examples: [
      "DIN 931 — Hex bolts with shank (partial thread)",
      "DIN 933 — Hex bolts fully threaded",
      "DIN 934 — Hexagon nuts",
      "DIN 976 — Threaded rods (studs)",
      "DIN 6914 — High-strength structural hex bolts (HV)",
    ],
  },
  {
    slug: "iso",
    code: "ISO",
    name: "International Organization for Standardization",
    region: "International",
    description:
      "ISO standards harmonize fastener specifications globally, succeeding many DIN standards. ISO 4014, 4017, 4032, 4033, 898-1, and 3506 are the most commonly cited for metric bolts, nuts, mechanical properties, and stainless steel fasteners.",
    image: "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=1200&q=80",
    scope:
      "Globally accepted dimensions, mechanical properties, and quality assurance requirements for metric fasteners.",
    applications: ["Global OEM Supply", "Aerospace", "Marine", "Renewable Energy", "Heavy Equipment"],
    materials: ["8.8 / 10.9 / 12.9 Property Classes", "A2-70 / A4-80 Stainless", "Hot-Dip Galvanized"],
    examples: [
      "ISO 4014 — Hex bolts, partial thread (formerly DIN 931)",
      "ISO 4017 — Hex bolts, full thread (formerly DIN 933)",
      "ISO 4032 — Hex nuts (formerly DIN 934)",
      "ISO 898-1 — Mechanical properties of fasteners",
      "ISO 3506 — Stainless steel fasteners",
    ],
  },
  {
    slug: "bs",
    code: "BS",
    name: "British Standards (BSI)",
    region: "United Kingdom",
    description:
      "British Standards (BS) for fasteners include BS 3692, BS 4190, BS 4395, and BS EN 14399 governing high-strength friction grip (HSFG) bolts widely used in UK structural steel, infrastructure, and bridge construction. BS Whitworth (BSW) and BS Fine (BSF) thread forms remain in use for legacy and heritage equipment.",
    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&q=80",
    scope: "Imperial and Whitworth thread series, HSFG structural bolts, and general-purpose UK fasteners.",
    applications: ["UK Structural Steel", "Bridges", "Heritage Restoration", "Railway"],
    materials: ["Grade 8.8 / 10.9 HSFG", "Carbon Steel BSW/BSF"],
    examples: [
      "BS 3692 — ISO Metric Precision Bolts, Screws, and Nuts",
      "BS 4190 — ISO Metric Black Hex Bolts and Nuts",
      "BS 4395 — High-Strength Friction Grip Bolts (HSFG)",
      "BS EN 14399 — High-strength structural bolting assemblies",
    ],
  },
  {
    slug: "is",
    code: "IS",
    name: "Indian Standards (BIS)",
    region: "India",
    description:
      "Indian Standards (IS) issued by the Bureau of Indian Standards govern fasteners used across Indian infrastructure, railways, power, and manufacturing sectors. IS 1364, 1367, 3757, and 6639 align closely with ISO standards while addressing local material specifications.",
    image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=80",
    scope: "Hex bolts/nuts, technical supply conditions, HSFG bolts, and threaded rods for Indian industry.",
    applications: ["Indian Railways", "Power Plants", "Construction", "Defence"],
    materials: ["Property Class 4.6 / 8.8 / 10.9 / 12.9", "Stainless A2 / A4"],
    examples: [
      "IS 1364 — Hexagon Head Bolts, Screws, and Nuts (Product Grade A & B)",
      "IS 1367 — Technical Supply Conditions for Threaded Steel Fasteners",
      "IS 3757 — High Strength Structural Bolts (HSFG)",
      "IS 6639 — Hexagon Bolts for Steel Structures",
    ],
  },
  {
    slug: "sae",
    code: "SAE",
    name: "Society of Automotive Engineers",
    region: "United States",
    description:
      "SAE standards (J429, J995, J1199) define grade-rated bolts and nuts for automotive, aerospace, and heavy-duty mobile equipment. SAE Grade 5 and Grade 8 fasteners are heat-treated medium-carbon and alloy steel bolts used in critical mechanical assemblies.",
    image: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=1200&q=80",
    scope: "Mechanical and material requirements for inch-series bolts, screws, and studs in automotive applications.",
    applications: ["Automotive", "Aerospace", "Heavy Equipment", "Off-Highway Vehicles"],
    materials: ["Grade 2 / 5 / 8 Carbon & Alloy Steel"],
    examples: [
      "SAE J429 — Mechanical and Material Requirements for Externally Threaded Fasteners",
      "SAE J995 — Mechanical and Material Requirements for Steel Nuts",
      "SAE J1199 — Mechanical and Material Requirements for Metric Externally Threaded Steel Fasteners",
    ],
  },
  {
    slug: "eu",
    code: "EN",
    name: "European Norms (EN / EN ISO)",
    region: "Europe",
    description:
      "EN and EN ISO standards harmonize fastener requirements across the European Union. EN 14399 covers high-strength structural bolting assemblies for preloading, and EN ISO 4014/4017/898-1 govern dimensions and mechanical properties for metric fasteners CE-marked under the Construction Products Regulation.",
    image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1200&q=80",
    scope: "CE-compliant high-strength bolting and harmonized European fastener standards.",
    applications: ["EU Structural Steel", "Bridges", "Wind Turbines", "Industrial Plants"],
    materials: ["8.8 / 10.9 HV / HR Systems", "Hot-Dip Galvanized"],
    examples: [
      "EN 14399-1..10 — High-strength structural bolting assemblies for preloading",
      "EN ISO 4014 — Hex bolts (partial thread)",
      "EN ISO 898-1 — Mechanical properties of carbon steel fasteners",
    ],
  },
  {
    slug: "uni",
    code: "UNI",
    name: "Ente Nazionale Italiano di Unificazione (Italian Standards)",
    region: "Italy",
    description:
      "UNI standards are the Italian national specifications for fasteners, often referenced in Italian and Mediterranean industrial projects. Many UNI standards have been harmonized with ISO/EN equivalents but remain specified in legacy and Italian-engineered equipment.",
    image: "https://images.unsplash.com/photo-1492130410875-aa61d2a6b6e8?w=1200&q=80",
    scope: "Italian dimensional and material standards for hex bolts, nuts, washers, and threaded fasteners.",
    applications: ["Italian Industrial Equipment", "Marine", "Construction"],
    materials: ["Class 8.8 / 10.9", "Stainless"],
    examples: [
      "UNI 5737 — Hex bolts (equivalent to DIN 931 / ISO 4014)",
      "UNI 5739 — Hex bolts fully threaded (equivalent to DIN 933)",
      "UNI 5588 — Hex nuts",
    ],
  },
];

// Industries — 60 categories from Real-Bolt Applications page.
// Each industry has a concise but information-dense description and a representative image.
const img = (q: string) => `https://source.unsplash.com/1200x800/?${encodeURIComponent(q)}`;

const baseGrades = [
  { grade: "ASTM A193 B7", specification: "Cr-Mo alloy steel, quenched & tempered", usage: "General high-strength bolting" },
  { grade: "ASTM A194 2H", specification: "Heavy hex nuts for B7 studs", usage: "Mating nuts for flange joints" },
  { grade: "Class 8.8 / 10.9 / 12.9", specification: "Metric high-strength bolts", usage: "Structural and mechanical assemblies" },
  { grade: "SS 304 / 316", specification: "Austenitic stainless steel", usage: "Corrosion-resistant fastening" },
];

const baseRequirements = [
  "Material certificates EN 10204 3.1/3.2",
  "Full traceability and batch identification",
  "Third-party inspection on request",
  "Custom coatings and platings available",
];

const industryNames: { slug: string; name: string; tag: string; img: string }[] = [
  { slug: "aerospace", name: "Aerospace", tag: "high-strength flight-critical fasteners", img: "aerospace,aircraft" },
  { slug: "aviation", name: "Aviation", tag: "ground-support and airframe fasteners", img: "aviation,jet" },
  { slug: "agriculture", name: "Agriculture", tag: "tractor, plough and irrigation fasteners", img: "agriculture,tractor" },
  { slug: "appliances", name: "Appliances", tag: "household and white-goods assembly", img: "appliances,factory" },
  { slug: "automotive", name: "Automotive", tag: "engine, chassis and body fasteners", img: "automotive,car-engine" },
  { slug: "boilers-and-heat-exchangers", name: "Boilers & Heat Exchangers", tag: "high-temperature pressure-rated bolting", img: "boiler,heat-exchanger" },
  { slug: "cement-plants", name: "Cement Plants", tag: "kilns, mills and conveyor fasteners", img: "cement,plant" },
  { slug: "construction", name: "Construction", tag: "structural steel and concrete anchors", img: "construction,site" },
  { slug: "infrastructure", name: "Infrastructure", tag: "bridges, highways and public works", img: "infrastructure,bridge" },
  { slug: "conveyors-and-belt-systems", name: "Conveyors & Belt Systems", tag: "conveyor frame and roller fasteners", img: "conveyor,industry" },
  { slug: "cranes", name: "Cranes", tag: "lifting and load-bearing connections", img: "crane,industrial" },
  { slug: "dairy-plants", name: "Dairy Plants", tag: "hygienic stainless fasteners for dairy lines", img: "dairy,factory" },
  { slug: "data-centers", name: "Data Centers", tag: "rack, raised-floor and HVAC mounting", img: "data-center,server" },
  { slug: "defense-and-military", name: "Defense & Military", tag: "MIL-spec and armor-grade fasteners", img: "military,defense" },
  { slug: "electrical-and-electronics", name: "Electrical & Electronics", tag: "switchgear, busbar and panel hardware", img: "electrical,switchgear" },
  { slug: "elevators", name: "Elevators", tag: "cabin, guide-rail and machine-room bolting", img: "elevator,lift" },
  { slug: "escalators", name: "Escalators", tag: "truss, step and balustrade fasteners", img: "escalator,metro" },
  { slug: "fire-fighting-systems", name: "Fire Fighting Systems", tag: "sprinkler, hydrant and pump fasteners", img: "firefighting,pump" },
  { slug: "food-industry", name: "Food Industry", tag: "food-grade stainless fasteners", img: "food,factory" },
  { slug: "furniture", name: "Furniture", tag: "decorative and assembly fasteners", img: "furniture,workshop" },
  { slug: "hardware-fittings", name: "Hardware Fittings", tag: "general-purpose hardware and brackets", img: "hardware,tools" },
  { slug: "hvac", name: "HVAC", tag: "ductwork, chiller and AHU fasteners", img: "hvac,ducting" },
  { slug: "ducting-systems", name: "Ducting Systems", tag: "flange, hanger and clamp hardware", img: "ducting,industrial" },
  { slug: "heavy-engineering", name: "Heavy Engineering", tag: "large-diameter and oversized bolting", img: "heavy-engineering,steel" },
  { slug: "machinery", name: "Machinery", tag: "machine assembly and maintenance fasteners", img: "machinery,industry" },
  { slug: "laboratories", name: "Laboratories", tag: "lab equipment and bench fasteners", img: "laboratory,science" },
  { slug: "instrumentation", name: "Instrumentation", tag: "tubing, manifold and panel fasteners", img: "instrumentation,gauge" },
  { slug: "manufacturing", name: "Manufacturing", tag: "production line and tooling fasteners", img: "manufacturing,factory" },
  { slug: "marine", name: "Marine", tag: "316 SS and HDG fasteners for sea service", img: "marine,ship" },
  { slug: "shipbuilding", name: "Shipbuilding", tag: "hull, deck and engine-room bolting", img: "shipbuilding,shipyard" },
  { slug: "material-handling-equipment", name: "Material Handling Equipment", tag: "forklift, hoist and conveyor fasteners", img: "forklift,warehouse" },
  { slug: "medical-equipment-and-hospital-installations", name: "Medical Equipment & Hospital Installations", tag: "medical-grade stainless fasteners", img: "hospital,medical-equipment" },
  { slug: "mining-and-earthmoving-equipment", name: "Mining & Earthmoving Equipment", tag: "high-tensile bolting for heavy machinery", img: "mining,excavator" },
  { slug: "oil-and-gas-industry", name: "Oil & Gas Industry", tag: "B7/B16 flange bolting for upstream & downstream", img: "oil-gas,refinery" },
  { slug: "packaging-machinery", name: "Packaging Machinery", tag: "filling, sealing and palletising fasteners", img: "packaging,machinery" },
  { slug: "paper-and-pulp-industry", name: "Paper & Pulp Industry", tag: "corrosion-resistant bolting for digesters", img: "paper-mill,factory" },
  { slug: "petrochemical-and-chemical-plants", name: "Petrochemical & Chemical Plants", tag: "B7/B8M bolting for reactors and columns", img: "petrochemical,plant" },
  { slug: "pharmaceutical-industry", name: "Pharmaceutical Industry", tag: "GMP-compliant 316L fasteners", img: "pharmaceutical,laboratory" },
  { slug: "power-plants-and-energy", name: "Power Plants & Energy", tag: "boiler, turbine and condenser bolting", img: "power-plant,turbine" },
  { slug: "pre-engineered-buildings", name: "Pre-Engineered Buildings (PEB)", tag: "HSFG and HDG structural bolting", img: "warehouse,pre-engineered-building" },
  { slug: "pressure-vessels", name: "Pressure Vessels", tag: "ASME Section VIII compliant bolting", img: "pressure-vessel,industrial" },
  { slug: "printing-machinery", name: "Printing Machinery", tag: "press, roller and frame fasteners", img: "printing-press,machinery" },
  { slug: "pumps-valves-and-compressors", name: "Pumps, Valves & Compressors", tag: "casing, cover and gland bolting", img: "pumps,valves" },
  { slug: "railways-and-metro", name: "Railways & Metro", tag: "track, rolling-stock and signalling fasteners", img: "railway,metro" },
  { slug: "refrigeration-and-cold-storage", name: "Refrigeration & Cold Storage", tag: "low-temperature L7 bolting", img: "cold-storage,refrigeration" },
  { slug: "signage-and-advertising-structures", name: "Signage & Advertising Structures", tag: "weather-resistant outdoor fasteners", img: "signage,billboard" },
  { slug: "solar-energy-and-renewable-projects", name: "Solar Energy & Renewable Projects", tag: "HDG and SS fasteners for module mounting", img: "solar-panel,renewable-energy" },
  { slug: "sports-infrastructure-and-stadiums", name: "Sports Infrastructure & Stadiums", tag: "stadium, seating and roof fasteners", img: "stadium,sports" },
  { slug: "steel-fabrication-and-structural-works", name: "Steel Fabrication & Structural Works", tag: "HSFG, HV/HR structural bolting", img: "steel-fabrication,structure" },
  { slug: "storage-systems-and-warehousing", name: "Storage Systems & Warehousing", tag: "rack, mezzanine and pallet fasteners", img: "warehouse,racking" },
  { slug: "sugar-mills", name: "Sugar Mills", tag: "mill, evaporator and pan fasteners", img: "sugar-mill,industry" },
  { slug: "telecommunication-towers", name: "Telecommunication Towers", tag: "tower, antenna and HDG bolting", img: "telecom-tower,antenna" },
  { slug: "textile-machinery", name: "Textile Machinery", tag: "loom, spindle and frame fasteners", img: "textile,machinery" },
  { slug: "water-treatment-and-desalination-plants", name: "Water Treatment & Desalination Plants", tag: "duplex SS bolting for water service", img: "water-treatment,plant" },
  { slug: "wind-energy-installations", name: "Wind Energy Installations", tag: "tower-flange and blade-root bolting", img: "wind-turbine,renewable" },
];

export const industriesSeed = industryNames.map((i) => ({
  slug: i.slug,
  name: i.name,
  description: `Engineered fastening solutions for the ${i.name} sector — ${i.tag}.`,
  heroDescription: `Realbolt-grade precision fasteners are engineered for the demanding ${i.name.toLowerCase()} sector. We supply ${i.tag} manufactured to international standards (ASTM, DIN, ISO, EN) with full traceability, mill test certificates, and corrosion protection options including HDG, PTFE/Xylan and stainless steel grades for service in the harshest environments.`,
  image: img(i.img),
  grades: baseGrades,
  applications: [
    { name: `${i.name} - Primary Assembly`, description: `Critical fasteners for ${i.name.toLowerCase()} primary structural and mechanical joints.`, image: img(i.img + ",assembly") },
    { name: `${i.name} - Maintenance & MRO`, description: `Replacement fasteners and consumables for ${i.name.toLowerCase()} maintenance.`, image: img(i.img + ",maintenance") },
    { name: `${i.name} - Custom Engineering`, description: `Bespoke fastener engineering for specialised ${i.name.toLowerCase()} applications.`, image: img(i.img + ",engineering") },
  ],
  keyRequirements: baseRequirements,
}));

export const productsSeed = [
  { slug: "stud-bolts", name: "Stud Bolts", image: "/src-assets/stud-bolt.webp", standard: "ASME B16.5 / DIN 976", description: "Fully threaded or partially threaded stud bolts manufactured from ASTM A193 Grade B7 chromium-molybdenum steel. Designed for high-temperature, high-pressure flange connections in petrochemical, oil & gas, and power generation industries.", sizes: "M6 to M100 | 1/4\" to 4\"", threads: "Metric (Coarse & Fine) | UNC / UNF | BSW / BSF", length: "30mm to 3000mm | Custom lengths available", material: "ASTM A193 Grade B7 (42CrMo4 / AISI 4140)", finish: ["Plain / Black Oxide", "Hot Dip Galvanized", "Zinc Plated", "PTFE / Xylan Coated", "Cadmium Plated"], grades: ["B7", "B7M", "B16", "L7", "L7M", "B8", "B8M", "Grade 10.9", "Grade 12.9"], applications: ["Flange Connections", "Pressure Vessels", "Heat Exchangers", "Pipelines", "Refineries", "Power Plants"], dimensions: [{ label: "Diameter Range", value: "M6 – M100" }, { label: "Length Range", value: "30mm – 3000mm" }, { label: "Thread Pitch", value: "As per standard" }, { label: "Tensile Strength", value: "860 MPa (min)" }, { label: "Yield Strength", value: "720 MPa (min)" }, { label: "Hardness", value: "235–302 HB" }] },
  { slug: "double-end-studs", name: "Double End Studs", image: "/src-assets/double-end-stud.webp", standard: "ASME B18.2.1 / DIN 2510", description: "Double end studs with equal or unequal thread lengths on both ends, used where bolts cannot fit due to space constraints.", sizes: "M8 to M80", threads: "Metric / UNC / UNF", length: "40mm to 2000mm", material: "ASTM A193 B7", finish: ["Plain", "HDG", "PTFE Coated"], grades: ["B7", "B7M", "B16", "L7", "B8", "B8M"], applications: ["Turbine Casings", "Valve Bodies", "Pump Assemblies"], dimensions: [{ label: "Diameter", value: "M8 – M80" }, { label: "Length", value: "40 – 2000mm" }] },
  { slug: "hex-bolts", name: "Hex Bolts", image: "/src-assets/hex-bolt.webp", standard: "ASME B18.2.1 / DIN 931", description: "Hexagonal head bolts manufactured from high-strength alloy steel per ASTM A193 Grade B7.", sizes: "M6 to M64", threads: "Metric / UNC / UNF / BSW", length: "20mm to 500mm", material: "Alloy Steel / Carbon Steel", finish: ["Plain", "HDG", "Zinc Plated"], grades: ["8.8", "10.9", "12.9", "B7"], applications: ["Structural", "Machinery", "Equipment"], dimensions: [{ label: "Diameter", value: "M6 – M64" }] },
  { slug: "heavy-hex-bolts", name: "Heavy Hex Bolts", image: "/src-assets/heavy-hex-bolt.webp", standard: "ASME B18.2.1", description: "Heavy hex bolts with larger head dimensions for heavy-duty applications.", sizes: "1/2\" to 4\"", threads: "UNC / UNF", length: "1\" to 24\"", material: "ASTM A193 B7", finish: ["Plain", "HDG", "PTFE"], grades: ["B7", "B16", "L7"], applications: ["Flange Joints", "Pressure Vessels"], dimensions: [{ label: "Diameter", value: "1/2\" – 4\"" }] },
  { slug: "socket-cap-screws", name: "Socket Cap Screws", image: "/src-assets/socket-cap-screw.jpg", standard: "ASME B18.3 / DIN 912", description: "Internal hex socket head cap screws for precision assembly.", sizes: "M3 to M30", threads: "Metric / UNC", length: "5mm to 200mm", material: "Alloy Steel / SS 304 / SS 316", finish: ["Black Oxide", "Plain", "Zinc"], grades: ["12.9", "10.9", "A2-70"], applications: ["Tooling", "Dies & Molds", "Machinery"], dimensions: [{ label: "Diameter", value: "M3 – M30" }] },
  { slug: "countersunk-screws", name: "Countersunk Screws", image: "/src-assets/countersunk-screw.jpg", standard: "DIN 7991 / ISO 10642", description: "Flat head socket countersunk screws for flush mounting.", sizes: "M3 to M20", threads: "Metric", length: "6mm to 100mm", material: "Alloy Steel / SS", finish: ["Black", "Plain", "Zinc"], grades: ["10.9", "A2-70"], applications: ["Furniture", "Machinery"], dimensions: [{ label: "Diameter", value: "M3 – M20" }] },
  { slug: "set-screws", name: "Set Screws", image: "/src-assets/set-screw.webp", standard: "DIN 913 / 914 / 915 / 916", description: "Headless screws with various point styles for fastening shafts and collars.", sizes: "M3 to M24", threads: "Metric / UNC", length: "3mm to 60mm", material: "Alloy Steel", finish: ["Black Oxide"], grades: ["45H", "12.9"], applications: ["Pulleys", "Couplings", "Collars"], dimensions: [{ label: "Diameter", value: "M3 – M24" }] },
  { slug: "eye-bolts", name: "Eye Bolts", image: "/src-assets/eye-bolt.webp", standard: "DIN 580 / ASME B18.15", description: "Forged eye bolts for lifting applications.", sizes: "M6 to M48", threads: "Metric", length: "Standard", material: "Forged Steel", finish: ["HDG", "Plain"], grades: ["C15E", "Grade 8"], applications: ["Lifting", "Rigging"], dimensions: [{ label: "Diameter", value: "M6 – M48" }] },
  { slug: "u-bolts", name: "U-Bolts", image: "/src-assets/u-bolt.webp", standard: "Custom / DIN 3570", description: "U-shaped bolts for pipe and structural mounting.", sizes: "M6 to M48", threads: "Metric / UNC", length: "Custom", material: "Carbon / Alloy / SS", finish: ["HDG", "Plain", "Zinc"], grades: ["4.6", "8.8", "SS 304"], applications: ["Pipe Supports", "Automotive Springs"], dimensions: [{ label: "Diameter", value: "M6 – M48" }] },
  { slug: "anchor-bolts", name: "Anchor Bolts", image: "/src-assets/anchor-bolt.webp", standard: "ASTM F1554 / IS 5624", description: "Foundation anchor bolts for structural and equipment mounting.", sizes: "M12 to M64 | 1/2\" to 2-1/2\"", threads: "Metric / UNC", length: "150mm to 2000mm", material: "Carbon Steel / Alloy Steel", finish: ["HDG", "Plain"], grades: ["F1554 Grade 36/55/105"], applications: ["Foundation", "Equipment Mounting", "Structural"], dimensions: [{ label: "Diameter", value: "M12 – M64" }] },
  { slug: "threaded-rods", name: "Threaded Rods", image: "/src-assets/threaded-rod.jpg", standard: "DIN 975 / DIN 976 / ASTM A193", description: "Continuous threaded rods for stud bolt fabrication and general use.", sizes: "M3 to M100", threads: "Metric / UNC / UNF", length: "1m / 3m standard", material: "Carbon / Alloy / SS", finish: ["Plain", "HDG", "Zinc", "PTFE"], grades: ["4.6", "8.8", "10.9", "B7", "B8M"], applications: ["Cut to length", "MRO"], dimensions: [{ label: "Diameter", value: "M3 – M100" }] },
  { slug: "round-bars", name: "Round Bars", image: "/src-assets/round-bar.jpg", standard: "ASTM A276 / EN 10088", description: "Bright/black bars for fastener fabrication.", sizes: "6mm to 200mm dia", threads: "N/A", length: "Custom", material: "Alloy / SS / Carbon Steel", finish: ["Black", "Bright", "Polished"], grades: ["EN8", "EN24", "SS 304", "SS 316"], applications: ["Fastener Manufacturing", "Machined Parts"], dimensions: [{ label: "Diameter", value: "6 – 200mm" }] },
];
