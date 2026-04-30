/**
 * Product images map.
 *
 * Intentionally empty — all product images are now managed by the admin
 * (via Cloudinary uploads + Firestore overrides). Each product's image comes
 * from `p.image` populated at runtime; if the admin has not uploaded one,
 * the UI falls back to a Package icon placeholder.
 */
export const PRODUCT_IMAGES: Record<string, string> = {};

export type CatProduct = {
  slug: string;
  name: string;
  material: string;
  sizes: string;
  description: string;
  image?: string;
};

export type Category = {
  slug: string;
  name: string;
  icon: string;
  tagline: string;
  description: string;
  products: CatProduct[];
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

export const categories: Category[] = [
  {
    slug: "bolts",
    name: "Bolts",
    icon: "🔩",
    tagline: "All Types of Industrial Bolts",
    description: "Premium grade hex, heavy hex, anchor, U-bolts, J-bolts, eye bolts, T-bolts, carriage and stud bolts manufactured to ASME, DIN and IS standards.",
    products: [
      { slug: "hex-bolt", name: "Hex Bolt", material: MAT_BOLTS, sizes: "M3 to M64 | 1/8\" to 2.5\"", description: "Hexagonal head bolt for general industrial fastening. Widely used in steel structures, machinery, and equipment assembly." },
      { slug: "heavy-hex-bolt", name: "Heavy Hex Bolt", material: MAT_BOLTS, sizes: "M12 to M100 | 1/2\" to 4\"", description: "Larger head and heavier shank than standard hex bolts. Used in heavy structural and high-load applications such as bridges, towers, and pressure vessels." },
      { slug: "anchor-bolt", name: "Anchor Bolt (Foundation Bolt)", material: MAT_BOLTS, sizes: "M10 to M64 | Length up to 3000 mm", description: "L-type, J-type and double-end foundation bolts cast or grouted into concrete to secure structural columns, machines and equipment to a foundation." },
      { slug: "u-bolt", name: "U-Bolt (Pipe Clamp)", material: MAT_BOLTS, sizes: "Pipe sizes 1/2\" to 24\"", description: "U-shaped pipe clamp bolt with two threaded ends. Used to secure pipes, tubes and conduit to structural supports." },
      { slug: "j-bolt", name: "J-Bolt", material: MAT_BOLTS, sizes: "M8 to M48 | Custom length", description: "J-shaped foundation/anchor bolt commonly used to bolt down equipment, light poles, and structural members to concrete." },
      { slug: "eye-bolt", name: "Eye Bolt", material: MAT_BOLTS, sizes: "M6 to M48 | DIN 580 / IS 4190", description: "Forged or machined eye bolt with a circular ring head. Used as lifting points, rigging, and tie-downs for heavy loads." },
      { slug: "t-bolt", name: "T-Bolt", material: MAT_BOLTS, sizes: "M5 to M30", description: "T-headed bolt used in machine tool slots, aluminium profile assemblies and specialised clamping fixtures." },
      { slug: "carriage-bolt", name: "Carriage Bolt", material: MAT_BOLTS, sizes: "M5 to M24 | 3/16\" to 1\"", description: "Round head bolt with square neck that locks the bolt into wood or sheet metal so only the nut needs to be tightened." },
      { slug: "stud-bolt", name: "Stud Bolt", material: "ASTM A193 B7 / B7M / B16 / L7 / B8 / B8M", sizes: "M6 to M100 | 1/4\" to 4\"", description: "Fully threaded or partially threaded stud bolts for high-temperature, high-pressure flange connections in petrochemical, oil & gas and power generation industries." },
    ],
  },
  {
    slug: "nuts",
    name: "Nuts",
    icon: "🧲",
    tagline: "Hex, Lock, Flange, Cap & Specialty Nuts",
    description: "Complete range of industrial nuts including hex, heavy hex, lock (nylock), flange, cap, square and wing nuts in MS, SS and high tensile grades.",
    products: [
      { slug: "hex-nut", name: "Hex Nut", material: MAT_NUTS, sizes: "M3 to M64", description: "Standard six-sided nut used with hex bolts and threaded rods. Most commonly used nut in industrial assemblies." },
      { slug: "heavy-hex-nut", name: "Heavy Hex Nut", material: MAT_NUTS, sizes: "M12 to M100", description: "Larger and thicker than a standard hex nut. Designed for heavy structural and high-stress fastening applications." },
      { slug: "lock-nut", name: "Lock Nut (Nylock)", material: MAT_NUTS, sizes: "M3 to M48", description: "Nylon insert self-locking nut that resists loosening due to vibration, shock and rotational movement." },
      { slug: "flange-nut", name: "Flange Nut", material: MAT_NUTS, sizes: "M5 to M30", description: "Hex nut with an integrated washer flange that distributes pressure over a wider area. Often serrated for anti-loosening." },
      { slug: "cap-nut", name: "Cap Nut", material: MAT_NUTS, sizes: "M3 to M24", description: "Domed acorn-style nut that covers and protects the bolt thread end and provides a clean finished appearance." },
      { slug: "square-nut", name: "Square Nut", material: MAT_NUTS, sizes: "M5 to M24", description: "Four-sided nut with a larger surface area that resists rotation in slots and channels. Common in older equipment and structural work." },
      { slug: "wing-nut", name: "Wing Nut", material: MAT_NUTS, sizes: "M3 to M16", description: "Two-winged hand-tightened nut used where frequent assembly and disassembly is required without tools." },
    ],
  },
  {
    slug: "washers",
    name: "Washers",
    icon: "🧷",
    tagline: "Plain, Spring, Lock & Specialty Washers",
    description: "Plain, spring, lock, star, fender and taper washers in carbon steel, stainless steel and spring steel — engineered to distribute load and prevent loosening.",
    products: [
      { slug: "plain-washer", name: "Plain Washer", material: MAT_WASHERS, sizes: "M3 to M64 | DIN 125 / IS 2016", description: "Flat round washer that distributes the bolt or nut load over a wider surface and protects the substrate." },
      { slug: "spring-washer", name: "Spring Washer", material: "Spring Steel / SS304 / SS316", sizes: "M3 to M48 | DIN 127", description: "Split ring helical washer that maintains tension to resist loosening from vibration. Most common anti-loosening washer." },
      { slug: "lock-washer", name: "Lock Washer", material: MAT_WASHERS, sizes: "M3 to M30", description: "Internal or external tooth washer designed to bite into the mating surface and prevent rotation." },
      { slug: "star-washer", name: "Star Washer", material: "Spring Steel / SS304", sizes: "M3 to M20", description: "Toothed star-shaped washer providing strong electrical bonding and excellent vibration resistance." },
      { slug: "fender-washer", name: "Fender Washer", material: MAT_WASHERS, sizes: "M5 to M20 | OD up to 60mm", description: "Flat washer with extra-large outer diameter relative to bore. Used to spread load on thin or soft materials like sheet metal." },
      { slug: "taper-washer", name: "Taper Washer", material: MAT_WASHERS, sizes: "M12 to M30", description: "Tapered/sloped washer used with channels and I-beams to provide a flat seating surface for the bolt head or nut." },
    ],
  },
  {
    slug: "screws",
    name: "Screws",
    icon: "🔩",
    tagline: "Machine, Self-Tapping & Specialty Screws",
    description: "Machine, self-tapping, self-drilling, wood, socket head cap and drywall screws in MS, SS and galvanized finishes for every fastening need.",
    products: [
      { slug: "machine-screw", name: "Machine Screw", material: MAT_SCREWS, sizes: "M2 to M16", description: "Uniform-diameter threaded screw used with a tapped hole or nut. Available in pan, cheese, countersunk and round head styles." },
      { slug: "self-tapping-screw", name: "Self-Tapping Screw", material: MAT_SCREWS, sizes: "No. 4 to No. 14", description: "Hardened screw that taps its own thread when driven into pre-drilled holes in metal, plastic or wood." },
      { slug: "self-drilling-screw", name: "Self-Drilling Screw", material: MAT_SCREWS, sizes: "No. 6 to No. 14", description: "Drill-point screw that drills its own pilot hole and taps its own thread in a single operation. Ideal for sheet metal." },
      { slug: "wood-screw", name: "Wood Screw", material: MAT_SCREWS, sizes: "No. 4 to No. 14 | 1/2\" to 4\"", description: "Coarse threaded screw with sharp point designed for fastening into wood. Available in flat, round and oval head." },
      { slug: "socket-head-cap-screw", name: "Socket Head Cap Screw (Allen)", material: "Alloy Steel 12.9 / SS304 / SS316", sizes: "M3 to M30 | DIN 912", description: "High-strength cylindrical head screw with internal hex (Allen) drive. Standard for machinery and tooling." },
      { slug: "drywall-screw", name: "Drywall Screw", material: MAT_SCREWS, sizes: "1\" to 4\"", description: "Bugle-head sharp-point screw with deep coarse thread used to fasten drywall to wood or metal studs." },
    ],
  },
  {
    slug: "flanges",
    name: "Flanges",
    icon: "🏗️",
    tagline: "Pipeline, Oil & Gas, Chemical Plant Flanges",
    description: "Slip-on, weld neck, blind, threaded, socket weld and lap joint flanges manufactured to ANSI/ASME, DIN and EN standards. Used in pipelines, oil & gas and chemical plants.",
    products: [
      { slug: "slip-on-flange", name: "Slip On Flange", material: MAT_FLANGE, sizes: "1/2\" to 24\" | Class 150 to 2500", description: "Flange that slips over the pipe and is fillet welded both inside and outside. Easy to install and economical for low-pressure piping." },
      { slug: "weld-neck-flange", name: "Weld Neck Flange", material: MAT_FLANGE, sizes: "1/2\" to 48\" | Class 150 to 2500", description: "Long tapered hub welded butt to pipe. Best choice for high-pressure, high-temperature and cyclic loading applications." },
      { slug: "blind-flange", name: "Blind Flange", material: MAT_FLANGE, sizes: "1/2\" to 48\"", description: "Solid disk flange used to seal the end of a piping system, valve or pressure vessel opening. Allows easy access for inspection." },
      { slug: "threaded-flange", name: "Threaded Flange", material: MAT_FLANGE, sizes: "1/2\" to 4\"", description: "Flange with internal NPT threads. Used where welding is not possible — typically in low-pressure, low-temperature service." },
      { slug: "socket-weld-flange", name: "Socket Weld Flange", material: MAT_FLANGE, sizes: "1/2\" to 3\"", description: "Counter-bored flange where the pipe is inserted into the socket and fillet welded. Used for small-bore high-pressure piping." },
      { slug: "lap-joint-flange", name: "Lap Joint Flange", material: MAT_FLANGE, sizes: "1/2\" to 24\"", description: "Two-piece flange (loose flange + stub end) that allows free rotation for easy bolt-hole alignment. Common in stainless steel piping." },
    ],
  },
  {
    slug: "pipe-fittings",
    name: "Pipe Fittings",
    icon: "🚰",
    tagline: "Elbows, Tees, Reducers & Couplings",
    description: "Buttweld and threaded pipe fittings — elbows, tees, reducers, couplings, unions, caps and nipples in MS, SS304 and SS316.",
    products: [
      { slug: "elbow", name: "Elbow (45° / 90°)", material: MAT_FITTINGS, sizes: "1/2\" to 48\" | Sch 10 to XXS", description: "Buttweld elbow that changes pipe flow direction. Available in long radius (1.5D) and short radius (1D), in 45° and 90° angles." },
      { slug: "tee", name: "Tee (Equal / Reducing)", material: MAT_FITTINGS, sizes: "1/2\" to 48\"", description: "T-shaped buttweld fitting that joins three pipes — used to combine or split flow. Equal tee or reducing tee configurations." },
      { slug: "reducer", name: "Reducer (Concentric / Eccentric)", material: MAT_FITTINGS, sizes: "1/2\" to 48\"", description: "Pipe size reduction fitting. Concentric maintains common centreline; eccentric maintains common bottom for drainage." },
      { slug: "coupling", name: "Coupling", material: MAT_FITTINGS, sizes: "1/8\" to 6\"", description: "Short threaded or socket weld fitting used to connect two pipes of the same diameter. Full and half coupling options." },
      { slug: "union", name: "Union", material: MAT_FITTINGS, sizes: "1/4\" to 4\"", description: "Three-piece fitting (nut, female end, male end) that allows quick disconnection of pipework without cutting." },
      { slug: "cap", name: "Cap", material: MAT_FITTINGS, sizes: "1/2\" to 48\"", description: "Buttweld or threaded cap that seals the end of a pipe. Used during pressure testing and to close off pipe runs." },
      { slug: "nipple", name: "Nipple", material: MAT_FITTINGS, sizes: "1/8\" to 6\" | Length 1\" to 12\"", description: "Short length of pipe with male threads on both ends, used to extend or join two female fittings. Hex, barrel and close nipples available." },
    ],
  },
  {
    slug: "sheet-metal",
    name: "Sheet Metal",
    icon: "🧱",
    tagline: "Fasteners, Brackets & Custom Fabrication",
    description: "Sheet metal screws, fasteners, clamps, brackets, angle supports and custom-fabricated perforated sheets for industrial and architectural use.",
    products: [
      { slug: "sheet-metal-screws", name: "Sheet Metal Screws", material: MAT_SHEET, sizes: "No. 4 to No. 14", description: "Hardened sharp-point screw with full-length thread designed to fasten thin metal sheets together. Pan, hex and countersunk heads available." },
      { slug: "sheet-fasteners", name: "Sheet Fasteners", material: MAT_SHEET, sizes: "M3 to M12", description: "Captive panel fasteners, self-clinching nuts and studs that provide strong load-bearing threads in thin sheet metal." },
      { slug: "clamps", name: "Clamps", material: MAT_SHEET, sizes: "Custom / Standard", description: "Pipe clamps, hose clamps, U-clamps and saddle clamps used to securely hold pipes, cables and conduits to structural supports." },
      { slug: "brackets", name: "Brackets", material: MAT_SHEET, sizes: "Custom Fabrication", description: "L-brackets, T-brackets, mounting and support brackets fabricated from MS, SS and GI sheet to customer drawings." },
      { slug: "angle-supports", name: "Angle Supports", material: MAT_SHEET, sizes: "20×20mm to 200×200mm", description: "Equal and unequal angles used as structural support members, frames and bracing in light fabrication and racking." },
      { slug: "perforated-sheets", name: "Perforated Sheets (Custom)", material: MAT_SHEET, sizes: "Custom hole pattern, sheet up to 2500×1250mm", description: "Custom perforated MS, SS and GI sheets in round, square, slotted and decorative hole patterns. Used in screens, guards and architectural panels." },
    ],
  },
  {
    slug: "springs",
    name: "Springs",
    icon: "🌀",
    tagline: "Compression, Tension, Torsion & Disc Springs",
    description: "Compression, tension, torsion, disc (Belleville), coil and custom wire springs manufactured from spring steel, stainless steel and music wire.",
    products: [
      { slug: "compression-springs", name: "Compression Springs", material: MAT_SPRINGS, sizes: "Wire Ø 0.5–25mm | OD 5–250mm", description: "Helical springs that resist compressive force and absorb shock. Used in valves, machinery, automotive suspensions and industrial equipment." },
      { slug: "tension-springs", name: "Tension Springs", material: MAT_SPRINGS, sizes: "Wire Ø 0.5–20mm", description: "Extension springs that resist pulling force and store energy when stretched. Often have hooks or loops at each end." },
      { slug: "torsion-springs", name: "Torsion Springs", material: MAT_SPRINGS, sizes: "Wire Ø 0.5–15mm", description: "Helical springs that resist twisting force and store rotational energy. Used in clothes-pegs, garage doors, and hinges." },
      { slug: "disc-springs", name: "Disc Springs (Belleville)", material: "Spring Steel / SS304 / Inconel", sizes: "OD 6–250mm | DIN 2093", description: "Conical disc washers stacked to provide high spring force in a small space. Used in bolted joints, clutches and brakes." },
      { slug: "coil-springs", name: "Coil Springs", material: MAT_SPRINGS, sizes: "Custom design", description: "Heavy-duty coil springs for industrial machinery, mining equipment, and commercial vehicle suspensions." },
      { slug: "wire-springs", name: "Wire Springs (Custom)", material: MAT_SPRINGS, sizes: "As per drawing", description: "Custom-formed wire springs and forms made to customer specifications and drawings. Prototyping and bulk production available." },
    ],
  },
  {
    slug: "raw-material",
    name: "Raw Material",
    icon: "🏭",
    tagline: "MS / SS Rods, Bars, Plates & Pipes",
    description: "Mild steel and stainless steel rods, alloy and hex bars, flat bars, plates, sheets, coils and pipes & tubes — sourced from primary mills with full mill test certificates.",
    products: [
      { slug: "ms-rods", name: "MS (Mild Steel) Rods", material: "MS IS 2062 / IS 2004 / EN8", sizes: "Ø 6 mm to Ø 250 mm | Length up to 6 m", description: "Hot-rolled and bright (cold-drawn) mild steel round rods. Used for general fabrication, machining, fasteners and engineering components." },
      { slug: "ss-rods", name: "SS (304/316) Rods", material: "SS304 / SS304L / SS316 / SS316L / SS310", sizes: "Ø 4 mm to Ø 200 mm", description: "Hot-rolled, cold-drawn and peeled & ground stainless steel rods for corrosion resistant fasteners, shafts and chemical equipment." },
      { slug: "alloy-steel-bars", name: "Alloy Steel Bars", material: "EN19 / EN24 / EN36 / 4140 / 42CrMo4", sizes: "Ø 10 mm to Ø 500 mm", description: "Heat-treatable alloy steel round bars for high-strength fasteners, gears, shafts and tooling. Supplied annealed or Q&T." },
      { slug: "hex-bars", name: "Hex Bars", material: "MS / SS304 / SS316 / Brass", sizes: "AF 6 mm to AF 100 mm", description: "Hexagonal cross-section bars used to manufacture hex-head fasteners, valves, fittings and machined components." },
      { slug: "flat-bars", name: "Flat Bars", material: "MS / SS / Alloy Steel", sizes: "12×3 mm to 300×40 mm", description: "Hot-rolled and cold-rolled rectangular flat bars used for structural framing, brackets, clamps and machined parts." },
      { slug: "plates-sheets", name: "Plates / Sheets", material: "MS / SS304 / SS316 / GI / Boiler Plate", sizes: "Thickness 0.5 mm to 100 mm | Up to 2500×6000 mm", description: "Mild steel and stainless steel plates and sheets for structural fabrication, tank fabrication, pressure vessels and architectural cladding." },
      { slug: "coils", name: "Coils", material: "MS HR/CR / SS / GI / GP", sizes: "Width 600–1500 mm | Thickness 0.3–6 mm", description: "Hot-rolled, cold-rolled, galvanized and stainless steel coils for slitting, sheet manufacturing and tube production." },
      { slug: "pipes-tubes", name: "Pipes & Tubes", material: "MS ERW/Seamless / SS304 / SS316", sizes: "1/8\" to 24\" NB | Sch 10 to XXS", description: "Seamless and welded MS and SS pipes & tubes for fluid handling, structural use and instrumentation. ASTM, IS and EN standards." },
    ],
  },
  {
    slug: "special-fasteners",
    name: "Special Fasteners",
    icon: "⚙️",
    tagline: "Rivets, Pins, Circlips & Threaded Rods",
    description: "Solid and blind rivets, dowel/taper/split pins, circlips, threaded rods, inserts and anchor fasteners for engineering and assembly.",
    products: [
      { slug: "rivets", name: "Rivets (Solid / Blind)", material: "MS / SS / Aluminium / Copper", sizes: "Ø 2 mm to Ø 12 mm", description: "Permanent mechanical fasteners — solid rivets for structural work; blind (pop) rivets for one-side access fastening of sheet metal." },
      { slug: "pins", name: "Pins (Dowel / Taper / Split)", material: "MS / SS304 / SS316 / Hardened Steel", sizes: "Ø 1 mm to Ø 50 mm", description: "Precision dowel pins for accurate location, taper pins for shaft hubs, and split (cotter) pins to secure castle nuts and clevis pins." },
      { slug: "circlips", name: "Circlips", material: "Spring Steel / SS304", sizes: "Ø 3 mm to Ø 300 mm", description: "Internal and external retaining rings (DIN 471 / DIN 472) used to retain bearings, gears and other components on shafts or in housings." },
      { slug: "threaded-rods", name: "Threaded Rods", material: MAT_SPECIAL, sizes: "M3 to M64 | Length 1 m to 3 m", description: "Fully threaded rods (studding) used for hangers, supports, anchor systems and custom-cut fastener applications." },
      { slug: "inserts", name: "Inserts", material: "Brass / SS / Steel", sizes: "M2 to M20", description: "Threaded inserts (heli-coil, key-locking, press-in, ultrasonic) that provide strong, reusable threads in plastic, wood and soft metals." },
      { slug: "anchor-fasteners", name: "Anchor Fasteners", material: "MS / SS304 / Galvanized", sizes: "M6 to M30", description: "Wedge anchors, sleeve anchors, drop-in anchors and chemical anchors for fixing equipment and structural members to concrete and masonry." },
    ],
  },
];

export const MATERIAL_GRADES = [
  { code: "MS", name: "Mild Steel", description: "General-purpose carbon steel for structural and engineering use." },
  { code: "SS304", name: "Stainless Steel 304", description: "Most common austenitic stainless steel, excellent corrosion resistance." },
  { code: "SS316", name: "Stainless Steel 316", description: "Molybdenum-bearing SS for higher resistance to chlorides and pitting." },
  { code: "SS310", name: "Stainless Steel 310", description: "High-temperature SS for service up to 1100°C." },
  { code: "8.8", name: "High Tensile 8.8", description: "Class 8.8 high-strength bolt — Tensile 800 N/mm², Yield 640 N/mm²." },
  { code: "10.9", name: "High Tensile 10.9", description: "Class 10.9 high-strength bolt — Tensile 1040 N/mm², Yield 940 N/mm²." },
  { code: "12.9", name: "High Tensile 12.9", description: "Class 12.9 ultra-high-strength bolt — Tensile 1220 N/mm², Yield 1100 N/mm²." },
  { code: "Carbon Steel", name: "Carbon Steel", description: "Plain carbon steel (A105 / IS 2062) for piping and general fabrication." },
  { code: "Alloy Steel", name: "Alloy Steel", description: "Cr-Mo and Ni-Cr-Mo alloy steels (4140 / EN24) for heat-treated parts." },
  { code: "GI", name: "Galvanized (GI)", description: "Hot-dip galvanized steel for corrosion protection in outdoor applications." },
];

export const getCategoryBySlug = (slug: string) => categories.find((c) => c.slug === slug);
export const getCategoryProduct = (catSlug: string, prodSlug: string) =>
  getCategoryBySlug(catSlug)?.products.find((p) => p.slug === prodSlug);
