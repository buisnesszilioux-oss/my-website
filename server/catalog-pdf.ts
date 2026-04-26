import PDFDocument from "pdfkit";
import type { Response } from "express";

export function generateCatalogPdfBuffer(): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const writable = {
      write: (c: Buffer) => { chunks.push(c); return true; },
      end: () => resolve(Buffer.concat(chunks)),
      on: () => {},
      once: () => {},
      emit: () => {},
    } as any;
    try { generateCatalogPdf(writable); } catch (e) { reject(e); }
  });
}

const GOLD = "#C9A227";
const CHARCOAL = "#1a1a1a";
const MUTED = "#6b6b6b";

const COMPANY = {
  name: "M.I. ENGINEERING WORKS",
  tagline: "Premium Fastener Solutions",
  website: "www.miengineeringworks.in",
  email: "mienginering17@gmail.com",
  phone1: "+91 98199 72301",
  phone2: "+91 91376 58733",
  address: "301, 01, Mehar Iron Bazar, Iron Market, Khedwadi, Girgaon, Mumbai – 400004",
};

const NB = { lineBreak: false } as const;
const drawHeader = (doc: PDFKit.PDFDocument) => {
  doc.save();
  doc.rect(0, 0, doc.page.width, 60).fill(CHARCOAL);
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(18).text(COMPANY.name, 40, 20, NB);
  doc.fillColor("#fff").font("Helvetica").fontSize(8).text(COMPANY.tagline.toUpperCase(), 40, 42, NB);
  doc.fillColor(GOLD).fontSize(8).text(COMPANY.website, doc.page.width - 200, 42, { ...NB, width: 160, align: "right" });
  doc.restore();
};

const drawFooter = (doc: PDFKit.PDFDocument, pageNum: number) => {
  doc.save();
  const y = doc.page.height - 40;
  doc.rect(0, y, doc.page.width, 40).fill(CHARCOAL);
  doc.fillColor(GOLD).fontSize(8).font("Helvetica").text(COMPANY.website, 40, y + 14, NB);
  doc.fillColor("#fff").fontSize(8).text(`${COMPANY.email}  |  ${COMPANY.phone1}`, doc.page.width / 2 - 130, y + 14, { ...NB, width: 260, align: "center" });
  doc.fillColor(GOLD).fontSize(8).text(`Page ${pageNum}`, doc.page.width - 80, y + 14, { ...NB, width: 50, align: "right" });
  doc.restore();
};

const sectionTitle = (doc: PDFKit.PDFDocument, label: string) => {
  doc.moveDown(0.5);
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(16).text(label.toUpperCase(), { underline: false });
  doc.moveTo(doc.x, doc.y + 2).lineTo(doc.x + 60, doc.y + 2).strokeColor(GOLD).lineWidth(2).stroke();
  doc.moveDown(0.6);
  doc.fillColor(CHARCOAL).font("Helvetica").fontSize(10);
};

const drawTable = (
  doc: PDFKit.PDFDocument,
  headers: string[],
  rows: string[][],
  colWidths: number[],
) => {
  const startX = 40;
  let y = doc.y + 4;
  const rowH = 22;

  doc.save();
  doc.rect(startX, y, colWidths.reduce((a, b) => a + b, 0), rowH).fill(CHARCOAL);
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(9);
  let x = startX;
  headers.forEach((h, i) => {
    doc.text(h, x + 6, y + 7, { width: colWidths[i] - 12 });
    x += colWidths[i];
  });
  doc.restore();

  y += rowH;
  doc.font("Helvetica").fontSize(9).fillColor(CHARCOAL);
  rows.forEach((row, ri) => {
    if (y + rowH > doc.page.height - 60) {
      doc.addPage();
      y = 80;
    }
    if (ri % 2 === 0) {
      doc.save().rect(startX, y, colWidths.reduce((a, b) => a + b, 0), rowH).fill("#f6f3ec").restore();
    }
    let cx = startX;
    row.forEach((cell, i) => {
      doc.fillColor(CHARCOAL).text(cell, cx + 6, y + 7, { width: colWidths[i] - 12 });
      cx += colWidths[i];
    });
    y += rowH;
  });
  doc.y = y + 6;
};

export function generateCatalogPdf(stream: Response | NodeJS.WritableStream) {
  const doc = new PDFDocument({ size: "A4", margins: { top: 80, bottom: 60, left: 40, right: 40 }, autoFirstPage: false });
  let pageNum = 0;
  let drawing = false;
  const decorate = () => {
    if (drawing) return;
    drawing = true;
    try { drawHeader(doc); drawFooter(doc, pageNum); } finally { drawing = false; }
  };
  doc.on("pageAdded", () => { pageNum++; decorate(); });

  // Collect chunks and write once at end so dev-proxy and browsers receive it cleanly
  const chunks: Buffer[] = [];
  doc.on("data", (c: Buffer) => chunks.push(c));
  doc.on("end", () => {
    const buf = Buffer.concat(chunks);
    if ((stream as Response).status) {
      const res = stream as Response;
      res.setHeader("Content-Length", String(buf.length));
      res.end(buf);
    } else {
      (stream as any).write(buf);
      (stream as any).end();
    }
  });

  // First page (autoFirstPage off, so we add explicitly — header/footer drawn via pageAdded)
  doc.addPage();

  // ---------- COVER PAGE ----------
  doc.y = 110;
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(11).text("ENGINEERED FOR EXCELLENCE", { align: "center", characterSpacing: 4 });
  doc.moveDown(0.6);
  doc.fillColor(CHARCOAL).font("Helvetica-Bold").fontSize(34).text(COMPANY.name, { align: "center" });
  doc.fillColor(MUTED).font("Helvetica").fontSize(12).text("Premium Industrial Fastener Solutions", { align: "center" });
  doc.moveDown(0.4);
  doc.fillColor(GOLD).fontSize(10).text("PRODUCT CATALOG  |  2026", { align: "center", characterSpacing: 3 });

  doc.moveDown(2);
  doc.fillColor(CHARCOAL).font("Helvetica").fontSize(11).text(
    "M.I. Engineering Works is a Mumbai-based manufacturer and supplier of premium industrial fasteners — engineered, tested, and trusted across oil & gas, petrochemical, power generation, infrastructure, marine, and heavy engineering industries worldwide.",
    { align: "justify", indent: 0 }
  );
  doc.moveDown();
  doc.text(
    "From ASTM A193 Grade B7 stud bolts to high-strength socket cap screws, our complete range conforms to ASTM, DIN, ISO, EN, BS, IS and SAE standards — backed by full material traceability, mill test certificates (EN 10204 3.1/3.2), and rigorous in-house quality control.",
    { align: "justify" }
  );

  // Highlights box
  doc.moveDown(1.5);
  doc.save().rect(40, doc.y, doc.page.width - 80, 110).fill("#f6f3ec").restore();
  const boxY = doc.y + 12;
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(11).text("KEY STRENGTHS", 60, boxY);
  doc.fillColor(CHARCOAL).font("Helvetica").fontSize(10);
  const bullets = [
    "20,000+ specialised fastener references — mostly available ex-stock",
    "Compliance with ASTM, DIN, ISO, EN, BS, IS, SAE international standards",
    "In-house coatings: HDG, Zinc, Geomet®, PTFE / Xylan, Cadmium, Black Oxide",
    "Custom-engineered fasteners to drawing or project specification",
    "Mill test certificates EN 10204 3.1 / 3.2 with every batch",
  ];
  let by = boxY + 22;
  bullets.forEach((b) => { doc.fillColor(GOLD).text("●", 60, by); doc.fillColor(CHARCOAL).text(b, 75, by, { width: doc.page.width - 140 }); by += 14; });
  doc.y = by + 12;

  // Contact box
  doc.moveDown(1);
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(11).text("CONTACT");
  doc.fillColor(CHARCOAL).font("Helvetica").fontSize(10);
  doc.text(COMPANY.address);
  doc.text(`Email: ${COMPANY.email}`);
  doc.text(`Phone: ${COMPANY.phone1}  |  ${COMPANY.phone2}`);
  doc.text(`Website: ${COMPANY.website}`);

  // ---------- ABOUT PAGE ----------
  doc.addPage();
  sectionTitle(doc, "About M.I. Engineering Works");
  doc.text(
    "Founded with a singular vision — to deliver fasteners that secure the world's most demanding engineering structures — M.I. Engineering Works has grown into a trusted partner for refineries, power plants, EPC contractors, OEMs, and infrastructure projects across India and abroad.",
    { align: "justify" }
  );
  doc.moveDown();
  doc.text(
    "Our manufacturing philosophy combines metallurgical expertise with precision machining and rigorous quality assurance. Every fastener we produce undergoes 100% dimensional checks, hardness testing, and tensile sampling on every production lot to ensure performance under load, vibration, and temperature.",
    { align: "justify" }
  );

  sectionTitle(doc, "Quality & Certifications");
  doc.text("Our quality systems and product testing are aligned with internationally recognized benchmarks, ensuring every fastener delivered exceeds expectation:", { align: "justify" });
  doc.moveDown(0.4);
  ["ISO 9001 Quality Management", "EN 10204 3.1 / 3.2 Mill Test Certification", "Third-party inspection (TUV, BV, SGS, IRS) on request", "PED 2014/68/EU compliance available", "Full material traceability and batch identification"]
    .forEach((b) => doc.text(`• ${b}`));

  sectionTitle(doc, "Specialised Coatings");
  doc.text("Our in-house surface treatment facilities deliver corrosion protection tailored to your service environment:", { align: "justify" });
  doc.moveDown(0.4);
  ["Hot-Dip Galvanizing (HDG)", "Mechanical & Electrolytic Zinc Plating", "Zinc-Nickel & Cadmium Plating", "PTFE / Xylan® Coating (Blue, Black, Grey)", "Geomet® and Delta-Tone Coatings", "Phosphate, Black Oxide, Bright Plain"]
    .forEach((b) => doc.text(`• ${b}`));

  // ---------- SOCKET SCREWS ----------
  doc.addPage();
  sectionTitle(doc, "Socket Screws — Metric");
  drawTable(doc,
    ["Product", "Size", "Grade", "Standard"],
    [
      ["Socket Head Cap Screw", "M1.6 to M64", "12.9", "DIN 912 / ISO 4762 / A574M"],
      ["Socket Low Head Cap Screw", "M4 to M20", "10.9", "DIN 7984"],
      ["Socket Head Shoulder Screw", "M6 to M24", "12.9", "ISO 7379"],
      ["Countersunk Socket Head Screw", "M3 to M20", "12.9", "DIN 7991 / ISO 10642"],
      ["Button Head Socket Screw", "M3 to M12", "12.9", "ISO 7380"],
      ["Flange Button Head Socket Screw", "M3 to M10", "12.9", "ISO 7380-2"],
      ["Socket Set Screw – Cup Point", "M3 to M20", "45H", "DIN 916 / ISO 4029"],
      ["Socket Set Screw – Flat Point", "M6 to M12", "45H", "DIN 913 / ISO 4026"],
      ["Socket Set Screw – Dog Point", "M3 to M20", "45H", "DIN 915 / ISO 4028"],
      ["Socket Set Screw – Cone Point", "M3 to M12", "45H", "DIN 914 / ISO 4027"],
    ],
    [180, 110, 70, 165]
  );

  sectionTitle(doc, "Socket Screws — Inch");
  drawTable(doc,
    ["Product", "Size", "Tensile / Hardness", "Standard"],
    [
      ["Socket Head Cap Screw", "#0 to 2 (UNC/UNF)", "190,000 psi (≤1/2)", "ASME B18.3 / ASTM A574"],
      ["Socket Low Head Cap Screw", "#8 to 1/2", "170,000 psi", "ASTM F835"],
      ["Socket Head Shoulder Screw", "1/4 to 2 (UNC)", "HRC 36–43", "ASME B18.3"],
      ["Countersunk Socket Head Screw", "#4 to 1-1/2", "160,000 psi", "ASME B18.3 / ASTM F835"],
      ["Button Head Socket Screw", "#10 to 5/8", "160,000 psi", "ASME B18.3 / ASTM F835"],
      ["Socket Set Screw – Cup Point", "#0 to 5/8", "HRC 45–53", "ASME B18.3 / ASTM F912"],
    ],
    [180, 110, 100, 135]
  );

  // ---------- HEX BOLTS ----------
  doc.addPage();
  sectionTitle(doc, "Hex Bolts & Screws");
  drawTable(doc,
    ["Product", "Size", "Grade / Class", "Tensile", "Standard"],
    [
      ["Hex Head Bolt — Metric", "M4 to M80", "10.9", "1040 N/mm² min", "ISO 4014 / 4017"],
      ["Hex Head Bolt — Metric", "M6 to M64", "8.8", "830 N/mm² min", "ISO 4014 / 4017"],
      ["Hex Cap Screw — Inch", "1/4 to 2", "Grade 8", "150,000 psi min", "ASME B18.2.1"],
      ["Hex Cap Screw — Inch", "1/4 to 2", "Grade 5", "120,000 psi min", "ASME B18.2.1"],
      ["Hex Bolt — Inch", "1/4 to 1", "Grade A", "60 ksi min", "ASTM A307"],
      ["Heavy Hex Structural Bolt", "M12 to M36", "10.9 HV", "1040 N/mm² min", "EN 14399-4 (HV)"],
      ["HSFG Bolts", "M16 to M30", "8.8 / 10.9", "830 / 1040 N/mm²", "BS 4395 / IS 3757"],
    ],
    [165, 95, 90, 95, 100]
  );

  sectionTitle(doc, "Hex Nuts");
  drawTable(doc,
    ["Product", "Size", "Class / Grade", "Standard"],
    [
      ["Hex Nut — Metric", "M3 to M64", "Class 8 / 10 / 12", "DIN 934 / ISO 4032"],
      ["Heavy Hex Nut — ASTM 2H", "1/4 to 4", "Grade 2H", "ASTM A194 2H"],
      ["Hex Nut — Inch", "1/4 to 2", "Grade 5 / 8", "ASME B18.2.2"],
      ["Lock Nut (Nyloc)", "M3 to M30", "Class 8 / 10", "DIN 985 / ISO 7040"],
      ["Castle Nut", "M6 to M48", "Class 6 / 8 / 10", "DIN 935 / ISO 7035"],
    ],
    [180, 95, 130, 140]
  );

  // ---------- STUD BOLTS / ANCHOR ----------
  doc.addPage();
  sectionTitle(doc, "Stud Bolts & Threaded Rods");
  drawTable(doc,
    ["Product", "Size", "Material / Grade", "Standard"],
    [
      ["Stud Bolt with 2 Heavy Hex Nuts", "M6 to M100", "ASTM A193 B7 + A194 2H", "ASME B16.5"],
      ["Stud Bolt — High Temp", "1/4 to 4", "ASTM A193 B16", "ASME B16.5"],
      ["Stud Bolt — Low Temp", "1/4 to 4", "ASTM A320 L7 / L7M", "ASME B16.5"],
      ["Stud Bolt — Stainless", "M6 to M64", "ASTM A193 B8 / B8M", "ASME B16.5"],
      ["Threaded Rod", "M3 to M100", "Grade 4.6 / 8.8 / 10.9 / B7", "DIN 975 / 976"],
      ["Double End Stud", "M8 to M80", "ASTM A193 B7 / B16", "DIN 2510 / ASME B18.2.1"],
    ],
    [185, 100, 145, 115]
  );

  sectionTitle(doc, "Anchor Bolts & Foundation Bolts");
  drawTable(doc,
    ["Product", "Size", "Grade", "Standard"],
    [
      ["Foundation Anchor Bolt — L Type", "M12 to M64", "F1554 Gr 36 / 55 / 105", "ASTM F1554"],
      ["Foundation Anchor Bolt — J Type", "M12 to M64", "F1554 Gr 36 / 55 / 105", "ASTM F1554"],
      ["Sleeve Anchor", "M6 to M24", "Carbon / SS 304 / SS 316", "Custom"],
      ["Wedge Anchor", "M6 to M24", "Carbon / SS 304 / SS 316", "Custom"],
      ["Chemical Anchor Stud", "M8 to M30", "Grade 5.8 / 8.8 / SS", "Custom"],
    ],
    [205, 95, 145, 100]
  );

  // ---------- WASHERS / SPECIALS ----------
  doc.addPage();
  sectionTitle(doc, "Washers");
  drawTable(doc,
    ["Product", "Size", "Material", "Standard"],
    [
      ["Plain Washer", "M3 to M64", "Carbon / Stainless", "DIN 125 / ISO 7089"],
      ["Heavy Washer (Structural)", "M12 to M36", "Hardened Carbon Steel", "DIN 6916 / EN 14399-6"],
      ["Spring Lock Washer", "M3 to M48", "Spring Steel", "DIN 127B / IS 3063"],
      ["Tooth Lock Washer (Internal/External)", "M3 to M30", "Spring Steel", "DIN 6797"],
      ["Belleville Disc Spring Washer", "M3 to M60", "Spring / Inconel", "DIN 6796 / DIN 2093"],
    ],
    [220, 90, 130, 105]
  );

  sectionTitle(doc, "Specialty & Custom Fasteners");
  doc.text(
    "We manufacture bespoke and engineered-to-print fasteners across a wide spectrum of standards, materials, and finishes. Whether you require a custom-length stud bolt for a heat exchanger, a high-tensile shoulder screw for tooling, or a duplex-stainless fastener for marine service — our engineering team works directly from your drawings or specification.",
    { align: "justify" }
  );
  doc.moveDown(0.5);
  ["Eye Bolts (DIN 580 / ASME B18.15)", "U-Bolts (custom radius / DIN 3570)", "Hexagon Wrenches & Bits (ISO 2936)", "Dowel Pins, Sel-Lok Pins (ISO 8752)", "Round Bars & Forgings (ASTM A276)", "PTFE / Xylan-coated assemblies"]
    .forEach((b) => doc.text(`• ${b}`));

  // ---------- INDUSTRIES ----------
  doc.addPage();
  sectionTitle(doc, "Industries Served");
  doc.text("M.I. Engineering Works supplies precision fasteners across more than 50 global industries:", { align: "justify" });
  doc.moveDown(0.4);
  const industries = [
    "Oil & Gas", "Petrochemical", "Power Generation", "Refineries", "Cement Plants",
    "Pressure Vessels & Heat Exchangers", "Steel Fabrication", "Wind Energy", "Solar Energy",
    "Pre-Engineered Buildings", "Structural Steel", "Bridges & Infrastructure", "Marine & Shipbuilding",
    "Automotive", "Aerospace & Aviation", "Defense & Military", "Railways & Metro", "Mining Equipment",
    "Pumps, Valves & Compressors", "Pulp & Paper", "Sugar Mills", "Water Treatment & Desalination",
    "Pharmaceutical & Food Industry", "Telecommunication Towers", "HVAC & Ducting",
  ];
  const colW = (doc.page.width - 80) / 3;
  let cx = 40, cy = doc.y;
  industries.forEach((i, idx) => {
    if (idx > 0 && idx % 3 === 0) { cy += 16; cx = 40; }
    doc.fillColor(GOLD).text("●", cx, cy);
    doc.fillColor(CHARCOAL).text(i, cx + 12, cy, { width: colW - 16 });
    cx += colW;
  });
  doc.y = cy + 26;

  sectionTitle(doc, "Standards Compliance");
  doc.text("Every fastener we produce conforms to the most demanding international specifications:");
  doc.moveDown(0.4);
  [
    "ASTM International — A193, A194, A320, A325, A490, F1554",
    "ANSI / ASME — B18.2, B18.3, B16.5, B1.1",
    "DIN — 931, 933, 934, 976, 6914, 912",
    "ISO — 4014, 4017, 4032, 898-1, 3506",
    "BS / EN — BS 3692, BS 4395, EN 14399, EN 10204",
    "IS — 1364, 1367, 3757, 6639",
    "SAE — J429, J995, J1199",
  ].forEach((b) => doc.text(`• ${b}`));

  // ---------- CLOSING ----------
  doc.addPage();
  sectionTitle(doc, "Get In Touch");
  doc.fillColor(CHARCOAL).font("Helvetica").fontSize(11);
  doc.text("For technical enquiries, project quotations, or product samples, please contact us:", { align: "justify" });
  doc.moveDown();

  doc.save().rect(40, doc.y, doc.page.width - 80, 130).fill("#f6f3ec").restore();
  const cBoxY = doc.y + 14;
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(13).text(COMPANY.name, 60, cBoxY);
  doc.fillColor(CHARCOAL).font("Helvetica").fontSize(10);
  doc.text(COMPANY.tagline, 60, cBoxY + 18);
  doc.fillColor(CHARCOAL).fontSize(10);
  doc.text(`Address:  ${COMPANY.address}`, 60, cBoxY + 38, { width: doc.page.width - 120 });
  doc.text(`Email:    ${COMPANY.email}`, 60, cBoxY + 70);
  doc.text(`Phone:    ${COMPANY.phone1}   |   ${COMPANY.phone2}`, 60, cBoxY + 86);
  doc.text(`Website:  ${COMPANY.website}`, 60, cBoxY + 102);
  doc.y = cBoxY + 140;

  doc.moveDown(2);
  doc.fillColor(MUTED).fontSize(8).text(
    "NOTE: M.I. Engineering Works manufactures fasteners that meet or exceed the requirements of the standards listed above. Different standards are the responsibility of various organizations and are not always identical. M.I. Engineering Works reserves the right to update or modify its manufacturing specifications and other particulars contained in this catalog without prior notice.",
    { align: "justify" }
  );

  doc.end();
}
