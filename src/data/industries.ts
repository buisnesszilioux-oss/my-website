export interface Industry {
  slug: string;
  name: string;
  description: string;
  heroDescription: string;
  image: string;
  grades: { grade: string; specification: string; usage: string }[];
  applications: { name: string; description: string; image: string }[];
  keyRequirements: string[];
}

export const industries: Industry[] = [
  {
    slug: "oil-and-gas",
    name: "Oil & Gas",
    description: "High-pressure fasteners for upstream, midstream, and downstream operations.",
    heroDescription: "The oil & gas industry demands fasteners that withstand extreme pressures up to 20,000 PSI, temperatures from -60°C to 540°C, and corrosive environments including H₂S, CO₂, and brine. ASTM A193 Grade B7 stud bolts and hex bolts are the backbone of flange connections, wellhead assemblies, and pipeline systems worldwide.",
    image: "https://images.unsplash.com/photo-1513828583688-c52646db42da?w=800&q=80",
    grades: [
      { grade: "ASTM A193 B7", specification: "Cr-Mo alloy steel, quenched & tempered", usage: "Flange bolting up to 450°C, pressure vessels, wellhead connections" },
      { grade: "ASTM A193 B7M", specification: "Max hardness 235 HB for sour service", usage: "NACE MR0175 compliant sour gas environments, H₂S service" },
      { grade: "ASTM A193 B16", specification: "Higher temperature service to 540°C", usage: "High-temperature refinery reactors, catalytic crackers" },
      { grade: "ASTM A193 L7", specification: "Low-temperature impact tested", usage: "Cryogenic LNG terminals, cold climate offshore platforms" },
      { grade: "ASTM A193 B8/B8M", specification: "SS 304/316 for corrosion resistance", usage: "Subsea equipment, offshore platforms, chemical injection systems" },
    ],
    applications: [
      { name: "Wellhead & Christmas Tree Assemblies", description: "B7 stud bolts secure wellhead flanges at pressures exceeding 15,000 PSI", image: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=600&q=80" },
      { name: "Pipeline Flange Connections", description: "ASME B16.5 flanges bolted with B7 studs from 1/2\" to 24\" NB", image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=80" },
      { name: "Refinery Process Units", description: "High-temperature B16 bolts in FCC units, hydrocrackers, and distillation columns", image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&q=80" },
      { name: "Offshore Platforms", description: "Hot-dip galvanized B7 fasteners with PTFE coating for marine environments", image: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=600&q=80" },
    ],
    keyRequirements: ["NACE MR0175/ISO 15156 compliance", "API 6A / API 20E certification", "Full material traceability with MTCs", "Hydrostatic and pneumatic test compatibility"],
  },
  {
    slug: "petrochemical",
    name: "Petrochemical",
    description: "Chemical-resistant fasteners for processing plants and refineries.",
    heroDescription: "Petrochemical plants process volatile chemicals at elevated temperatures and pressures. ASTM A193 B7 fasteners are specified for reactor vessels, heat exchangers, distillation columns, and piping systems handling hydrocarbons, acids, and caustic solutions.",
    image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&q=80",
    grades: [
      { grade: "ASTM A193 B7", specification: "Standard Cr-Mo for general service", usage: "Heat exchanger shell flanges, reactor bonnets, valve bodies" },
      { grade: "ASTM A193 B16", specification: "Enhanced high-temp to 540°C", usage: "Catalytic reformers, hydrodesulfurization units" },
      { grade: "ASTM A193 B8 Class 2", specification: "Strain-hardened SS 304", usage: "Nitric acid service, urea plants" },
      { grade: "ASTM A193 B8M Class 2", specification: "Strain-hardened SS 316", usage: "Chloride-containing environments, phosphoric acid" },
      { grade: "Grade 10.9 / 12.9", specification: "High-strength structural bolts", usage: "Equipment mounting, structural steel in plant construction" },
    ],
    applications: [
      { name: "Heat Exchangers", description: "B7 stud bolts for shell-and-tube exchanger flanges up to 30\" diameter", image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&q=80" },
      { name: "Pressure Vessels", description: "B7/B16 bolting for ASME Section VIII vessels operating at 300+ PSI", image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=80" },
      { name: "Distillation Columns", description: "High-temperature B16 fasteners for tray and packing column flanges", image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&q=80" },
      { name: "Piping Systems", description: "Full range of B7 studs for ASME B16.5 and B16.47 flanged joints", image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=80" },
    ],
    keyRequirements: ["ASME PCC-1 bolt tightening compliance", "PTFE/Xylan coating for corrosion protection", "Third-party inspection (TPI) certificates", "EN 10204 3.1/3.2 material certificates"],
  },
  {
    slug: "power-generation",
    name: "Power Generation",
    description: "Critical fasteners for thermal, nuclear, and renewable energy plants.",
    heroDescription: "Power generation facilities require fasteners with exceptional high-temperature strength, creep resistance, and fatigue life. From coal-fired boilers to gas turbines and nuclear reactors, ASTM A193 B7 and B16 grades ensure leak-free joints under continuous thermal cycling.",
    image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=80",
    grades: [
      { grade: "ASTM A193 B7", specification: "Standard service to 450°C", usage: "Steam line flanges, boiler feed pump connections" },
      { grade: "ASTM A193 B16", specification: "Extended service to 540°C", usage: "Main steam valves, turbine casing bolts, superheater headers" },
      { grade: "ASTM A193 L7", specification: "Impact tested for low temp", usage: "Gas turbine inlet cooling systems, cryogenic fuel systems" },
      { grade: "ASTM A193 B8M", specification: "SS 316 for corrosion resistance", usage: "Cooling water systems, condensate lines, FGD scrubbers" },
      { grade: "Grade 12.9 SHCS", specification: "Socket head cap screws", usage: "Turbine blade retention, generator coupling bolts" },
    ],
    applications: [
      { name: "Steam Turbines", description: "B16 stud bolts for turbine casing joints operating at 540°C/3500 PSI", image: "https://images.unsplash.com/photo-1548346941-89752a3f3b88?w=600&q=80" },
      { name: "Boiler Systems", description: "B7 hex bolts for boiler drum manways, header connections", image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&q=80" },
      { name: "Gas Turbine Enclosures", description: "High-temperature B16 fasteners for combustion chamber flanges", image: "https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=600&q=80" },
      { name: "Wind Turbine Foundations", description: "F1554 Grade 105 anchor bolts for turbine base foundations", image: "https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=600&q=80" },
    ],
    keyRequirements: ["ASME Section III for nuclear applications", "Creep and stress-rupture testing", "100% ultrasonic testing for critical bolts", "Controlled tightening with hydraulic tensioners"],
  },
  {
    slug: "construction",
    name: "Construction & Infrastructure",
    description: "Structural fasteners for buildings, bridges, and civil infrastructure.",
    heroDescription: "Modern construction demands fasteners that provide reliable structural integrity for decades. From high-rise steel frames to bridge connections and foundation anchoring, ASTM A193 B7 and high-strength structural bolts ensure safety and longevity in critical load-bearing applications.",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80",
    grades: [
      { grade: "ASTM A193 B7", specification: "Cr-Mo alloy for general structural", usage: "Steel frame connections, beam-to-column joints" },
      { grade: "ASTM F1554 Gr.36", specification: "36 ksi yield anchor bolt", usage: "Light structural anchoring, sign poles, guard rails" },
      { grade: "ASTM F1554 Gr.55", specification: "55 ksi yield anchor bolt", usage: "Medium-duty base plates, equipment foundations" },
      { grade: "ASTM F1554 Gr.105", specification: "105 ksi yield anchor bolt", usage: "Heavy structural foundations, wind turbine bases, bridge piers" },
      { grade: "Grade 8.8 / 10.9", specification: "High-strength hex bolts", usage: "Structural steel connections per IS 4000, bridge girder splices" },
    ],
    applications: [
      { name: "Steel Structure Erection", description: "High-strength hex bolts for moment connections and bracing", image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80" },
      { name: "Bridge Construction", description: "Grade 10.9 bolts for girder splices, bearing assemblies", image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&q=80" },
      { name: "Foundation Anchoring", description: "F1554 anchor bolts embedded in concrete for column bases", image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&q=80" },
      { name: "Pre-Engineered Buildings", description: "B7 threaded rods and U-bolts for purlins and cladding systems", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80" },
    ],
    keyRequirements: ["IS 4000 / AISC 360 structural bolt standards", "Hot-dip galvanized per IS 1367 / ASTM A153", "Proof load and wedge tensile testing", "Slip-critical connection capability"],
  },
  {
    slug: "marine-shipbuilding",
    name: "Marine & Shipbuilding",
    description: "Corrosion-resistant fasteners for ships, ports, and offshore structures.",
    heroDescription: "Marine environments demand exceptional corrosion resistance from saltwater, humid air, and cathodic reactions. ASTM A193 B8/B8M stainless steel fasteners and PTFE-coated B7 bolts are essential for hull structures, engine rooms, deck equipment, and offshore marine installations.",
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80",
    grades: [
      { grade: "ASTM A193 B8", specification: "SS 304 austenitic", usage: "Deck fittings, railing systems, non-critical marine hardware" },
      { grade: "ASTM A193 B8M", specification: "SS 316 molybdenum-enhanced", usage: "Seawater-exposed flanges, hull penetrations, ballast systems" },
      { grade: "ASTM A193 B7 + PTFE", specification: "PTFE/Xylan coated Cr-Mo", usage: "Engine room flanges, exhaust systems, bilge piping" },
      { grade: "Super Duplex 2507", specification: "25Cr duplex stainless", usage: "Subsea manifolds, seawater lift pumps, desalination" },
      { grade: "Monel 400 / K-500", specification: "Nickel-copper alloy", usage: "Propeller shafts, seawater valves, keel bolts" },
    ],
    applications: [
      { name: "Ship Engine Rooms", description: "B7 PTFE-coated stud bolts for main engine flanges and auxiliaries", image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&q=80" },
      { name: "Offshore Platforms", description: "Duplex and super duplex fasteners for subsea structures", image: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=600&q=80" },
      { name: "Port Infrastructure", description: "HDG anchor bolts for quay walls, cranes, and dock equipment", image: "https://images.unsplash.com/photo-1494412574643-ff11b0a5eb19?w=600&q=80" },
      { name: "Naval Vessels", description: "MIL-SPEC fasteners for defense and naval vessel construction", image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&q=80" },
    ],
    keyRequirements: ["DNV / Lloyd's / ABS classification approval", "Salt spray testing (ASTM B117) 1000+ hours", "PTFE or ceramic coating for anti-galling", "Full material traceability to heat number"],
  },
  {
    slug: "water-treatment",
    name: "Water Treatment",
    description: "Durable fasteners for water and wastewater processing facilities.",
    heroDescription: "Water treatment plants handle corrosive chemicals like chlorine, ozone, and caustic soda. ASTM A193 B8M (SS 316) fasteners resist pitting and crevice corrosion, while PTFE-coated B7 bolts provide cost-effective solutions for less aggressive service conditions.",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80",
    grades: [
      { grade: "ASTM A193 B8M", specification: "SS 316 for chloride resistance", usage: "Chlorination systems, filter press flanges, chemical dosing" },
      { grade: "ASTM A193 B8", specification: "SS 304 for mild service", usage: "Clean water piping, settling tank connections" },
      { grade: "ASTM A193 B7 + HDG", specification: "Hot-dip galvanized Cr-Mo", usage: "Structural supports, pipe hangers, outdoor installations" },
      { grade: "Super Duplex 2205", specification: "Duplex stainless steel", usage: "Desalination RO membrane housings, brine handling" },
    ],
    applications: [
      { name: "Filtration Systems", description: "B8M stud bolts for filter vessel flanges handling chlorinated water", image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&q=80" },
      { name: "Chemical Dosing Units", description: "SS 316 fasteners resistant to sodium hypochlorite and caustic soda", image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=80" },
      { name: "Pumping Stations", description: "B7 hex bolts and anchor bolts for pump bases and pipe supports", image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=80" },
      { name: "Desalination Plants", description: "Super duplex fasteners for high-salinity RO systems", image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&q=80" },
    ],
    keyRequirements: ["NSF/ANSI 61 potable water compliance", "Resistance to chloride pitting (PREN > 25)", "PTFE coating for anti-seize properties", "Compliant with IS 2062 / IS 1367 for structural"],
  },
  {
    slug: "mining",
    name: "Mining & Heavy Equipment",
    description: "Heavy-duty fasteners for mining, crushers, and material handling equipment.",
    heroDescription: "Mining operations subject fasteners to extreme vibration, shock loads, abrasion, and harsh outdoor conditions. ASTM A193 B7 Grade 10.9 and 12.9 high-strength fasteners are essential for crushers, conveyors, excavators, and processing mills.",
    image: "https://images.unsplash.com/photo-1578319439584-104c94d37305?w=800&q=80",
    grades: [
      { grade: "ASTM A193 B7", specification: "Cr-Mo alloy for high tensile", usage: "Crusher jaw bolts, mill liner bolts, conveyor structure" },
      { grade: "Grade 10.9", specification: "High-strength structural bolt", usage: "Excavator track bolts, dozer blade mounting, bucket teeth" },
      { grade: "Grade 12.9", specification: "Ultra-high strength SHCS", usage: "Rock breaker mounting, vibrating screen clamps" },
      { grade: "ASTM A193 B7 + HDG", specification: "Galvanized for outdoor use", usage: "Conveyor frames, stockpile structures, rail fasteners" },
      { grade: "ASTM F1554 Gr.105", specification: "High-strength anchor bolts", usage: "Crusher foundations, mill base plates, hopper supports" },
    ],
    applications: [
      { name: "Crushers & Screens", description: "Grade 12.9 socket head cap screws for jaw and cone crusher assemblies", image: "https://images.unsplash.com/photo-1578319439584-104c94d37305?w=600&q=80" },
      { name: "Conveyor Systems", description: "B7 hex bolts and U-bolts for belt conveyor frames and idler brackets", image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=80" },
      { name: "Processing Mills", description: "Heavy hex bolts for SAG and ball mill flanges, trunnion bearing bolts", image: "https://images.unsplash.com/photo-1578319439584-104c94d37305?w=600&q=80" },
      { name: "Material Handling", description: "Anchor bolts and threaded rods for hopper, chute, and bin mounting", image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80" },
    ],
    keyRequirements: ["Vibration-resistant locking mechanisms", "High-strength with controlled hardness", "Hot-dip galvanized for outdoor exposure", "Nord-Lock or tension-indicating washers"],
  },
  {
    slug: "automotive",
    name: "Automotive & Manufacturing",
    description: "Precision fasteners for automotive assembly and manufacturing plants.",
    heroDescription: "Automotive and manufacturing industries require precision-engineered fasteners with tight dimensional tolerances, consistent mechanical properties, and high fatigue resistance. Socket head cap screws, set screws, and high-tensile hex bolts are critical for engine assemblies, press tools, and production machinery.",
    image: "https://images.unsplash.com/photo-1565043666747-69f6646db940?w=800&q=80",
    grades: [
      { grade: "Grade 8.8", specification: "Medium-carbon steel, Q&T", usage: "Chassis bolts, suspension components, body panels" },
      { grade: "Grade 10.9", specification: "Alloy steel high-strength", usage: "Engine head bolts, connecting rod bolts, flywheel bolts" },
      { grade: "Grade 12.9", specification: "Alloy steel ultra-high strength", usage: "Crankshaft bolts, turbocharger mounting, race applications" },
      { grade: "ASTM A193 B7", specification: "Cr-Mo alloy for tooling", usage: "Press die bolts, injection mold clamping, fixture bolts" },
      { grade: "Grade 14.9 Set Screws", specification: "45H hardness set screws", usage: "Pulley locking, coupling set screws, shaft collars" },
    ],
    applications: [
      { name: "Engine Assembly", description: "Grade 10.9/12.9 bolts for cylinder head, manifold, and timing cover", image: "https://images.unsplash.com/photo-1565043666747-69f6646db940?w=600&q=80" },
      { name: "Die & Mold Making", description: "B7 socket head cap screws for die clamping and mold retention", image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&q=80" },
      { name: "Production Machinery", description: "B7 hex bolts for CNC machines, hydraulic presses, and lathes", image: "https://images.unsplash.com/photo-1565043666747-69f6646db940?w=600&q=80" },
      { name: "Assembly Lines", description: "Precision socket screws and set screws for automated assembly jigs", image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=80" },
    ],
    keyRequirements: ["PPAP documentation for OEM supply", "Cpk > 1.67 for critical dimensions", "Surface finish Ra 0.8 or better", "Batch traceability with bar coding"],
  },
  {
    slug: "chemical-processing",
    name: "Chemical Processing",
    description: "Corrosion-proof fasteners for aggressive chemical environments.",
    heroDescription: "Chemical processing plants handle acids, alkalis, solvents, and reactive compounds that aggressively attack standard steel. Exotic alloy fasteners in Inconel, Hastelloy, Monel, and duplex stainless steel grades are essential alongside standard B8/B8M bolting for less aggressive services.",
    image: "https://images.unsplash.com/photo-1532187863486-abf4dbce1b86?w=800&q=80",
    grades: [
      { grade: "ASTM A193 B8", specification: "SS 304 austenitic", usage: "Mild organic acid service, caustic soda handling" },
      { grade: "ASTM A193 B8M", specification: "SS 316 with Mo addition", usage: "Sulfuric acid, phosphoric acid, chloride environments" },
      { grade: "Inconel 625", specification: "Ni-Cr-Mo superalloy", usage: "Hydrofluoric acid, mixed acid service, flue gas scrubbers" },
      { grade: "Hastelloy C-276", specification: "Ni-Mo-Cr alloy", usage: "Wet chlorine gas, ferric chloride, hot contaminated acids" },
      { grade: "Duplex 2205", specification: "22Cr duplex SS", usage: "Chloride stress cracking environments, brine circuits" },
    ],
    applications: [
      { name: "Reactor Vessels", description: "Exotic alloy bolting for reactor flanges handling corrosive chemicals", image: "https://images.unsplash.com/photo-1532187863486-abf4dbce1b86?w=600&q=80" },
      { name: "Acid Storage Tanks", description: "B8M and Hastelloy fasteners for concentrated acid tank nozzles", image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=80" },
      { name: "Piping & Valves", description: "Duplex stud bolts for chloride-resistant piping systems", image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=80" },
      { name: "Scrubber Systems", description: "Inconel 625 bolts for wet FGD scrubbers and gas cleaning systems", image: "https://images.unsplash.com/photo-1532187863486-abf4dbce1b86?w=600&q=80" },
    ],
    keyRequirements: ["Intergranular corrosion testing (ASTM A262)", "Positive Material Identification (PMI)", "Solution annealing certification", "NACE MR0175 for sour environments"],
  },
  {
    slug: "food-pharmaceutical",
    name: "Food & Pharmaceutical",
    description: "Hygienic-grade fasteners for food processing and pharma facilities.",
    heroDescription: "Food and pharmaceutical industries require fasteners that meet strict hygiene standards with smooth, crevice-free surfaces, FDA-compliant materials, and resistance to frequent CIP (clean-in-place) chemical wash cycles using caustic and acidic detergents.",
    image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&q=80",
    grades: [
      { grade: "ASTM A193 B8", specification: "SS 304 food grade", usage: "General food processing equipment, dairy tanks" },
      { grade: "ASTM A193 B8M", specification: "SS 316 pharma grade", usage: "Pharmaceutical reactors, WFI systems, clean rooms" },
      { grade: "SS 316L", specification: "Low-carbon SS 316", usage: "Welded assemblies, reduced sensitization risk" },
      { grade: "A4-80 (SS 316)", specification: "ISO 3506 stainless", usage: "European food machinery standard, brewing equipment" },
    ],
    applications: [
      { name: "Dairy Processing", description: "SS 316 tri-clamp bolts and hex bolts for milk processing lines", image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&q=80" },
      { name: "Pharmaceutical Vessels", description: "Electropolished B8M stud bolts for reactor and mixer flanges", image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&q=80" },
      { name: "Brewing & Beverage", description: "A4-80 hex bolts for fermentation tanks and bottling equipment", image: "https://images.unsplash.com/photo-1532187863486-abf4dbce1b86?w=600&q=80" },
      { name: "Packaging Lines", description: "SS 304 socket screws for hygienic conveyor and filling machines", image: "https://images.unsplash.com/photo-1565043666747-69f6646db940?w=600&q=80" },
    ],
    keyRequirements: ["Surface finish Ra ≤ 0.8 µm (electropolished)", "FDA 21 CFR / EU 1935/2004 material compliance", "3-A Sanitary Standards certification", "No cadmium, lead, or toxic coatings"],
  },
  {
    slug: "aerospace-defense",
    name: "Aerospace & Defense",
    description: "Mission-critical fasteners meeting military and aerospace specifications.",
    heroDescription: "Aerospace and defense applications demand the highest quality fasteners with zero-defect requirements. ASTM A193 B7 and exotic alloy fasteners undergo rigorous inspection including 100% magnetic particle testing, tensile verification, and full dimensional checks to MIL-SPEC and NAS standards.",
    image: "https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=800&q=80",
    grades: [
      { grade: "ASTM A193 B7", specification: "Cr-Mo alloy, MPI tested", usage: "Ground support equipment, launch pad structures" },
      { grade: "Grade 12.9 SHCS", specification: "Ultra-high strength Allen bolts", usage: "Airframe jigs, tooling fixtures, test rig assemblies" },
      { grade: "Inconel 718", specification: "Ni-Cr-Fe precipitation hardened", usage: "Jet engine components, turbine disc bolts, exhaust systems" },
      { grade: "Titanium Grade 5", specification: "Ti-6Al-4V light alloy", usage: "Airframe structural bolts, landing gear, satellite hardware" },
      { grade: "A286 (ASTM A453 Gr.660)", specification: "Iron-nickel superalloy", usage: "Gas turbine casings, afterburner assemblies" },
    ],
    applications: [
      { name: "Aircraft Assembly", description: "Titanium and Inconel fasteners for airframe and engine mounting", image: "https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=600&q=80" },
      { name: "Defense Equipment", description: "MIL-SPEC B7 bolts for armored vehicles, artillery, and naval systems", image: "https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=600&q=80" },
      { name: "Space Launch Systems", description: "A286 superalloy bolts for rocket engine flanges and structural joints", image: "https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=600&q=80" },
      { name: "Ground Support Equipment", description: "B7 anchor bolts and threaded rods for launch pad infrastructure", image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80" },
    ],
    keyRequirements: ["AS9100D / NADCAP quality system", "100% MPI and UT inspection", "DFARS compliant material sourcing", "Lot traceability with serialization"],
  },
  {
    slug: "railway",
    name: "Railway & Transportation",
    description: "Vibration-resistant fasteners for rail infrastructure and rolling stock.",
    heroDescription: "Railway systems demand fasteners that resist constant vibration, dynamic loads, and thermal expansion. ASTM A193 B7 bolts with locking features, high-strength track bolts, and anchor fasteners ensure safe and reliable rail operations across tracks, bridges, and rolling stock.",
    image: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800&q=80",
    grades: [
      { grade: "ASTM A193 B7", specification: "Cr-Mo alloy for high fatigue", usage: "Rail joint bolts, fishplate bolts, bridge bearing bolts" },
      { grade: "Grade 8.8", specification: "Medium-high strength", usage: "Coach bolts, bogie frame bolts, coupling assemblies" },
      { grade: "Grade 10.9", specification: "High-strength hex bolts", usage: "Rail clip bolts, turnout switch fasteners" },
      { grade: "ASTM F1554 Gr.55", specification: "Anchor bolts for rail", usage: "Signal pole foundations, overhead catenary mast bases" },
      { grade: "ASTM A193 B7 + HDG", specification: "Galvanized for outdoor", usage: "Track-side structures, level crossing equipment" },
    ],
    applications: [
      { name: "Track Infrastructure", description: "High-tensile fishplate bolts and rail clips for permanent way", image: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=600&q=80" },
      { name: "Bridges & Viaducts", description: "B7 stud bolts for rail bridge bearings and expansion joints", image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&q=80" },
      { name: "Rolling Stock", description: "Grade 10.9 bolts for bogie assemblies, brake systems, couplings", image: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=600&q=80" },
      { name: "Station Infrastructure", description: "Anchor bolts and threaded rods for platform canopies and structures", image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80" },
    ],
    keyRequirements: ["RDSO (Indian Railways) specification compliance", "Vibration resistance testing (Junker test)", "Hot-dip galvanized per IS 1367 Part 13", "Proof load testing per IS 1367 Part 6"],
  },
];

export const getIndustryBySlug = (slug: string): Industry | undefined => {
  return industries.find((i) => i.slug === slug);
};
