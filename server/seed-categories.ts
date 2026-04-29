// Seeds the `products` table from the canonical category data in
// src/data/categories.ts so the admin panel and `/api/products` show
// every sub-product (Bolts, Nuts, Washers, ...).
//
// We re-declare the data here (instead of importing from the client)
// because the server is a separate bundle and must not pull in Vite
// imports like `@/assets/...`.

type SeedRow = {
  slug: string;
  name: string;
  image: string;
  standard: string;
  category: string;
  description: string;
  sizes: string;
  threads: string;
  length: string;
  material: string;
  finish: string[];
  grades: string[];
  applications: string[];
  dimensions: { label: string; value: string }[];
};

const IMG_BY_SLUG: Record<string, string> = {
  "hex-bolt": "/src-assets/hex-bolt.webp",
  "heavy-hex-bolt": "/src-assets/heavy-hex-bolt.webp",
  "anchor-bolt": "/src-assets/anchor-bolt.webp",
  "u-bolt": "/src-assets/u-bolt.webp",
  "eye-bolt": "/src-assets/eye-bolt.webp",
  "stud-bolt": "/src-assets/stud-bolt.webp",
  "double-end-stud-bolt": "/src-assets/double-end-stud.webp",
  "socket-head-cap-screw": "/src-assets/socket-cap-screw.jpg",
  "countersunk-screw": "/src-assets/countersunk-screw.jpg",
  "set-screw": "/src-assets/set-screw.webp",
  "threaded-rod": "/src-assets/threaded-rod.jpg",
  "round-bar": "/src-assets/round-bar.jpg",
};

const DEFAULT_GRADES = ["MS", "SS304", "SS316", "Carbon Steel", "Alloy Steel"];
const DEFAULT_FINISH = ["Plain", "Zinc Plated", "Hot Dip Galvanized", "Black Oxide"];

type CatDef = {
  slug: string;
  name: string;
  standard: string;
  description: string;
  products: { slug: string; name: string; material: string; sizes: string; description: string }[];
};

const MAT_BOLTS = "MS / SS304 / SS316 / High Tensile (8.8, 10.9, 12.9) / Carbon Steel / Alloy Steel";
const MAT_NUTS = "MS / SS304 / SS316 / High Tensile / Galvanized";
const MAT_WASHERS = "MS / SS304 / SS316 / Spring Steel / Galvanized";
const MAT_SCREWS = "MS / SS304 / SS316 / Carbon Steel / Galvanized";
const MAT_FLANGE = "MS / SS304 / SS316 / Carbon Steel (A105) / Alloy Steel";
const MAT_FITTINGS = "MS / SS304 / SS316 / Carbon Steel / Galvanized";
const MAT_SHEET = "MS / SS / GI / Galvanized";
const MAT_SPRINGS = "Spring Steel / SS304 / SS316 / Music Wire / Phosphor Bronze";
const MAT_RAW = "MS (IS 2062) / SS304 / SS316 / Alloy Steel / Carbon Steel";
const MAT_SPECIAL = "MS / SS304 / SS316 / Brass / Aluminium / Alloy Steel";

const CATEGORIES: CatDef[] = [
  {
    slug: "bolts",
    name: "Bolts",
    standard: "ASME / DIN / IS",
    description: "All types of industrial bolts.",
    products: [
      { slug: "hex-bolt", name: "Hex Bolt", material: MAT_BOLTS, sizes: "M3 to M64 | 1/8\" to 2.5\"", description: "Hexagonal head bolt for general industrial fastening." },
      { slug: "heavy-hex-bolt", name: "Heavy Hex Bolt", material: MAT_BOLTS, sizes: "M12 to M100 | 1/2\" to 4\"", description: "Larger head and heavier shank than standard hex bolts." },
      { slug: "anchor-bolt", name: "Anchor Bolt (Foundation Bolt)", material: MAT_BOLTS, sizes: "M10 to M64 | Length up to 3000 mm", description: "L-type, J-type and double-end foundation bolts." },
      { slug: "u-bolt", name: "U-Bolt (Pipe Clamp)", material: MAT_BOLTS, sizes: "Pipe sizes 1/2\" to 24\"", description: "U-shaped pipe clamp bolt with two threaded ends." },
      { slug: "j-bolt", name: "J-Bolt", material: MAT_BOLTS, sizes: "M8 to M48 | Custom length", description: "J-shaped foundation/anchor bolt." },
      { slug: "eye-bolt", name: "Eye Bolt", material: MAT_BOLTS, sizes: "M6 to M48 | DIN 580 / IS 4190", description: "Forged or machined eye bolt with a circular ring head." },
      { slug: "t-bolt", name: "T-Bolt", material: MAT_BOLTS, sizes: "M5 to M30", description: "T-headed bolt used in machine tool slots." },
      { slug: "carriage-bolt", name: "Carriage Bolt", material: MAT_BOLTS, sizes: "M5 to M24 | 3/16\" to 1\"", description: "Round head bolt with square neck." },
      { slug: "stud-bolt", name: "Stud Bolt", material: "ASTM A193 B7 / B7M / B16 / L7 / B8 / B8M", sizes: "M6 to M100 | 1/4\" to 4\"", description: "Fully threaded or partially threaded stud bolts." },
    ],
  },
  {
    slug: "nuts",
    name: "Nuts",
    standard: "ASME / DIN / IS",
    description: "Hex, heavy hex, lock, dome, weld, square and coupling nuts.",
    products: [
      { slug: "hex-nut", name: "Hex Nut", material: MAT_NUTS, sizes: "M3 to M64", description: "Standard six-sided nut." },
      { slug: "heavy-hex-nut", name: "Heavy Hex Nut", material: MAT_NUTS, sizes: "M12 to M100", description: "Thicker, larger across-flats hex nut." },
      { slug: "lock-nut", name: "Lock Nut (Nylock / Self-Locking)", material: MAT_NUTS, sizes: "M3 to M48", description: "Nylon-insert / all-metal prevailing torque lock nut." },
      { slug: "dome-nut", name: "Dome / Cap Nut", material: MAT_NUTS, sizes: "M3 to M24", description: "Decorative cap nut covering exposed bolt threads." },
      { slug: "weld-nut", name: "Weld Nut", material: MAT_NUTS, sizes: "M3 to M16", description: "Spot/projection-weld nut for sheet metal assembly." },
      { slug: "square-nut", name: "Square Nut", material: MAT_NUTS, sizes: "M3 to M30", description: "Four-sided nut used in T-slot and channel assembly." },
      { slug: "coupling-nut", name: "Coupling Nut", material: MAT_NUTS, sizes: "M6 to M48", description: "Long internally threaded nut used to join two threaded rods or studs." },
    ],
  },
  {
    slug: "washers",
    name: "Washers",
    standard: "DIN / IS / ASME",
    description: "Plain, spring, star, lock and dock washers.",
    products: [
      { slug: "plain-washer", name: "Plain (Flat) Washer", material: MAT_WASHERS, sizes: "M3 to M64", description: "Load-distribution flat washer." },
      { slug: "spring-washer", name: "Spring Washer", material: MAT_WASHERS, sizes: "M3 to M48", description: "Split lock washer that prevents loosening from vibration." },
      { slug: "star-washer", name: "Star (Tooth) Washer", material: MAT_WASHERS, sizes: "M3 to M24", description: "Internal/external tooth lock washer." },
      { slug: "lock-washer", name: "Lock Washer", material: MAT_WASHERS, sizes: "M3 to M48", description: "Prevents nut/bolt rotation in dynamic load applications." },
      { slug: "dock-washer", name: "Dock Washer", material: MAT_WASHERS, sizes: "Custom OD/ID", description: "Heavy-duty large outside-diameter washer." },
    ],
  },
  {
    slug: "screws",
    name: "Screws",
    standard: "ASME / DIN",
    description: "Machine, self-tapping, wood, allen, countersunk and grub screws.",
    products: [
      { slug: "machine-screw", name: "Machine Screw", material: MAT_SCREWS, sizes: "M2 to M12", description: "Pan / cheese / round head machine screw." },
      { slug: "self-tapping-screw", name: "Self-Tapping Screw", material: MAT_SCREWS, sizes: "Nos. 4 to 14", description: "Forms its own thread when driven into sheet metal/plastic." },
      { slug: "wood-screw", name: "Wood Screw", material: MAT_SCREWS, sizes: "Nos. 4 to 14", description: "Coarse-thread screw for timber assembly." },
      { slug: "allen-screw", name: "Allen / Socket Head Screw", material: MAT_SCREWS, sizes: "M3 to M30", description: "Internal hex socket head cap screw." },
      { slug: "socket-head-cap-screw", name: "Socket Head Cap Screw", material: MAT_SCREWS, sizes: "M3 to M30", description: "Precision-grade cap screw for tooling and machinery." },
      { slug: "countersunk-screw", name: "Countersunk (Flat Head) Screw", material: MAT_SCREWS, sizes: "M3 to M20", description: "Flush-mount flat head socket screw." },
      { slug: "grub-screw", name: "Grub / Set Screw", material: MAT_SCREWS, sizes: "M3 to M16", description: "Headless screw used to fix shafts/collars." },
      { slug: "set-screw", name: "Set Screw", material: MAT_SCREWS, sizes: "M3 to M24", description: "Various point styles: cup, flat, cone, dog." },
    ],
  },
  {
    slug: "flanges",
    name: "Flanges",
    standard: "ANSI / ASME / DIN / EN",
    description: "Slip-on, weld neck, blind, threaded, socket weld and lap joint flanges.",
    products: [
      { slug: "slip-on-flange", name: "Slip On Flange", material: MAT_FLANGE, sizes: "1/2\" to 48\" | Class 150 to 2500", description: "Slipped over the pipe and fillet-welded for low-pressure service." },
      { slug: "weld-neck-flange", name: "Weld Neck Flange", material: MAT_FLANGE, sizes: "1/2\" to 48\" | Class 150 to 2500", description: "Long tapered hub welded butt to pipe." },
      { slug: "blind-flange", name: "Blind Flange", material: MAT_FLANGE, sizes: "1/2\" to 48\" | Class 150 to 2500", description: "Solid disc flange used to close pipe ends or vessel openings." },
      { slug: "threaded-flange", name: "Threaded Flange", material: MAT_FLANGE, sizes: "1/2\" to 6\" | Class 150 to 600", description: "NPT/BSP threaded flange for low-pressure non-cyclic service." },
      { slug: "socket-weld-flange", name: "Socket Weld Flange", material: MAT_FLANGE, sizes: "1/2\" to 4\" | Class 150 to 1500", description: "Pipe inserted into the socket and fillet welded." },
      { slug: "lap-joint-flange", name: "Lap Joint Flange", material: MAT_FLANGE, sizes: "1/2\" to 24\" | Class 150 to 600", description: "Used with stub end where frequent disassembly is required." },
    ],
  },
  {
    slug: "pipe-fittings",
    name: "Pipe Fittings",
    standard: "ASME B16.9 / B16.11 / DIN",
    description: "Elbows, tees, reducers, couplings, unions, plugs & nipples.",
    products: [
      { slug: "elbow", name: "Elbow (45°/90°/180°)", material: MAT_FITTINGS, sizes: "1/8\" to 48\"", description: "Short / long radius butt-weld and threaded elbows." },
      { slug: "tee", name: "Tee (Equal / Reducing)", material: MAT_FITTINGS, sizes: "1/8\" to 48\"", description: "Three-way fitting for branch connections." },
      { slug: "reducer", name: "Reducer (Concentric / Eccentric)", material: MAT_FITTINGS, sizes: "1/2\" to 48\"", description: "Connects two pipes of different diameters." },
      { slug: "coupling", name: "Coupling", material: MAT_FITTINGS, sizes: "1/8\" to 4\"", description: "Half / full coupling, threaded or socket weld." },
      { slug: "union", name: "Union", material: MAT_FITTINGS, sizes: "1/8\" to 4\"", description: "Three-piece fitting for easy disassembly." },
      { slug: "plug", name: "Plug", material: MAT_FITTINGS, sizes: "1/8\" to 4\"", description: "Hex / square / round head plug to seal a fitting opening." },
      { slug: "nipple", name: "Nipple (Hex / Barrel)", material: MAT_FITTINGS, sizes: "1/8\" to 4\"", description: "Short threaded pipe length used to extend a fitting." },
    ],
  },
  {
    slug: "sheet-metal",
    name: "Sheet Metal",
    standard: "IS / ASTM",
    description: "MS, SS, GI sheets, plates, coils and strips.",
    products: [
      { slug: "ms-sheet", name: "MS Sheet / Plate", material: MAT_SHEET, sizes: "0.5 mm to 100 mm thick", description: "Mild steel sheet & plate, hot or cold rolled." },
      { slug: "ss-sheet", name: "SS Sheet / Plate", material: MAT_SHEET, sizes: "0.4 mm to 50 mm thick", description: "Stainless steel sheet & plate (304/316/316L)." },
      { slug: "gi-sheet", name: "GI (Galvanized) Sheet", material: MAT_SHEET, sizes: "0.3 mm to 6 mm thick", description: "Hot-dip galvanized iron sheet for roofing/ducting." },
      { slug: "coil", name: "Coil", material: MAT_SHEET, sizes: "Custom", description: "MS / SS / GI coils slit to required width." },
      { slug: "strip", name: "Strip", material: MAT_SHEET, sizes: "Custom width", description: "Cold rolled narrow steel strip for stamping." },
    ],
  },
  {
    slug: "springs",
    name: "Springs",
    standard: "DIN / IS / Custom",
    description: "Compression, extension, torsion, leaf and disc springs.",
    products: [
      { slug: "compression-spring", name: "Compression Spring", material: MAT_SPRINGS, sizes: "Custom OD x ID x Length", description: "Helical spring designed to resist compressive force." },
      { slug: "extension-spring", name: "Extension Spring", material: MAT_SPRINGS, sizes: "Custom", description: "Helical spring with hooks/loops for tension load." },
      { slug: "torsion-spring", name: "Torsion Spring", material: MAT_SPRINGS, sizes: "Custom", description: "Stores rotational mechanical energy." },
      { slug: "leaf-spring", name: "Leaf Spring", material: MAT_SPRINGS, sizes: "Custom", description: "Stacked steel leaves for vehicle suspension." },
      { slug: "disc-spring", name: "Disc / Belleville Spring", material: MAT_SPRINGS, sizes: "DIN 2093", description: "Conical washer-type spring used for high-load assemblies." },
    ],
  },
  {
    slug: "raw-material",
    name: "Raw Material",
    standard: "IS / EN / ASTM",
    description: "Round, square, hex bars, flat bars, billets and ingots.",
    products: [
      { slug: "round-bar", name: "Round Bar", material: MAT_RAW, sizes: "6 mm to 250 mm dia", description: "Hot rolled / bright drawn round bar." },
      { slug: "square-bar", name: "Square Bar", material: MAT_RAW, sizes: "6 mm to 200 mm", description: "Hot rolled square bar for forging and structural use." },
      { slug: "hex-bar", name: "Hex Bar", material: MAT_RAW, sizes: "6 mm to 80 mm AF", description: "Bright hex bar used for nut and bolt manufacturing." },
      { slug: "flat-bar", name: "Flat Bar", material: MAT_RAW, sizes: "Custom width x thickness", description: "Hot rolled / cold finished flat bar." },
      { slug: "billet", name: "Billet", material: MAT_RAW, sizes: "Standard mill sizes", description: "Semi-finished cast product for further rolling." },
      { slug: "ingot", name: "Ingot", material: MAT_RAW, sizes: "Standard mill sizes", description: "Cast metal block for forging or remelting." },
    ],
  },
  {
    slug: "material-grades",
    name: "Material Grades",
    standard: "Reference",
    description: "Reference catalogue of fastener material grades.",
    products: [
      { slug: "grade-4-6", name: "Grade 4.6", material: "Low Carbon Steel", sizes: "All", description: "Low strength bolting (≈400 MPa tensile)." },
      { slug: "grade-8-8", name: "Grade 8.8", material: "Medium Carbon Steel, Quenched & Tempered", sizes: "All", description: "Most common high-strength structural grade (≈800 MPa)." },
      { slug: "grade-10-9", name: "Grade 10.9", material: "Alloy Steel, Quenched & Tempered", sizes: "All", description: "High-tensile bolting (≈1040 MPa)." },
      { slug: "grade-12-9", name: "Grade 12.9", material: "Alloy Steel, Quenched & Tempered", sizes: "All", description: "Very high tensile (≈1220 MPa)." },
      { slug: "ss-304", name: "SS 304 (A2)", material: "18Cr-8Ni Austenitic Stainless", sizes: "All", description: "General purpose stainless steel." },
      { slug: "ss-316", name: "SS 316 (A4)", material: "18Cr-10Ni-2Mo Austenitic Stainless", sizes: "All", description: "Marine grade stainless with Mo for chloride resistance." },
      { slug: "astm-a193-b7", name: "ASTM A193 B7", material: "AISI 4140 Cr-Mo Alloy Steel", sizes: "All", description: "High-temperature high-pressure stud bolt grade." },
      { slug: "astm-a194-2h", name: "ASTM A194 2H", material: "Carbon Steel, Quenched & Tempered", sizes: "All", description: "Standard heavy hex nut grade matched with A193 B7." },
    ],
  },
  {
    slug: "special-fasteners",
    name: "Special Fasteners",
    standard: "Custom",
    description: "Custom and special-purpose fasteners.",
    products: [
      { slug: "shoulder-bolt", name: "Shoulder Bolt", material: MAT_SPECIAL, sizes: "M3 to M24", description: "Precision shoulder for pivot/locating applications." },
      { slug: "shear-bolt", name: "Shear Bolt", material: MAT_SPECIAL, sizes: "M6 to M30", description: "Designed to shear at a controlled load." },
      { slug: "tamper-proof-bolt", name: "Tamper-Proof / Security Bolt", material: MAT_SPECIAL, sizes: "M4 to M16", description: "Pin / one-way / Torx-resistant security fasteners." },
      { slug: "hanger-bolt", name: "Hanger Bolt", material: MAT_SPECIAL, sizes: "M6 to M16", description: "Wood thread one end, machine thread the other." },
      { slug: "rivet", name: "Rivet (Solid / Pop / Blind)", material: MAT_SPECIAL, sizes: "3 mm to 12 mm", description: "Permanent mechanical fastener for sheet/plate joining." },
      { slug: "insert", name: "Threaded Insert", material: MAT_SPECIAL, sizes: "M3 to M16", description: "Helicoil / brass / plastic threaded insert." },
      { slug: "custom-fastener", name: "Custom Fastener (Drawing Based)", material: MAT_SPECIAL, sizes: "As per drawing", description: "Manufactured to customer drawing & specification." },
    ],
  },
];

export const categoryProductsSeed: SeedRow[] = CATEGORIES.flatMap((cat) =>
  cat.products.map((p) => ({
    slug: p.slug,
    name: p.name,
    image: IMG_BY_SLUG[p.slug] || "",
    standard: cat.standard,
    category: cat.name,
    description: p.description,
    sizes: p.sizes,
    threads: "",
    length: "",
    material: p.material,
    finish: DEFAULT_FINISH,
    grades: DEFAULT_GRADES,
    applications: ["Industrial", cat.name],
    dimensions: [{ label: "Sizes", value: p.sizes }],
  })),
);
