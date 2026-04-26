import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEditableTables } from "@/hooks/useEditableTables";

const _LEGACY_BOLTS_UNUSED = [
  { grade: "ASTM A193 B7", material: "AISI 4140/4142 Alloy Steel", spec: "ASTM A193", tensile: "125 ksi (860 MPa)", yield: "105 ksi (720 MPa)", hardness: "35 HRC max", use: "Most common high-temp bolting" },
  { grade: "ASTM A193 B16", material: "AISI 4140/4142 Alloy Steel", spec: "ASTM A193", tensile: "125 ksi (860 MPa)", yield: "105 ksi (720 MPa)", hardness: "35 HRC max", use: "Higher-temp than B7 (to 1000°F)" },
  { grade: "ASTM A320 L7", material: "AISI 4140/4142 Alloy Steel", spec: "ASTM A320", tensile: "125 ksi (860 MPa)", yield: "105 ksi (720 MPa)", hardness: "35 HRC max", use: "Low-temperature service (−150°F)" },
  { grade: "ASTM A193 B8", material: "304 Stainless Steel", spec: "ASTM A193", tensile: "75 ksi (515 MPa)", yield: "30 ksi (205 MPa)", hardness: "223 HBW max", use: "Carbide solution treated, corrosion-resistant" },
  { grade: "ASTM A193 B8M", material: "316 Stainless Steel", spec: "ASTM A193", tensile: "75 ksi (515 MPa)", yield: "30 ksi (205 MPa)", hardness: "223 HBW max", use: "Moly-bearing, solution treated" },
  { grade: "SS 310", material: "310 Stainless Steel (UNS S31000)", spec: "ASTM A193 B8S", tensile: "75 ksi (515 MPa)", yield: "30 ksi (205 MPa)", hardness: "223 HBW max", use: "High-temperature oxidation resistance" },
  { grade: "SS 410", material: "410 Stainless Steel (UNS S41000)", spec: "ASTM A193 B6", tensile: "110 ksi (760 MPa)", yield: "85 ksi (585 MPa)", hardness: "321 HBW max", use: "Martensitic SS, high-temp corrosion-resistant" },
  { grade: "Grade 347", material: "347 Stainless Steel (UNS S34700)", spec: "ASTM A193 B8C", tensile: "75 ksi (515 MPa)", yield: "30 ksi (205 MPa)", hardness: "223 HBW max", use: "Cb-stabilized for high-temp intergranular corrosion" },
  { grade: "Grade 317L", material: "317L Stainless Steel (UNS S31703)", spec: "ASTM A193 B8N", tensile: "75 ksi (515 MPa)", yield: "30 ksi (205 MPa)", hardness: "223 HBW max", use: "Superior pitting & crevice corrosion resistance" },
  { grade: "Duplex 2205", material: "Duplex SS (UNS S31803/S32205)", spec: "ASTM A182 F51", tensile: "95 ksi (655 MPa)", yield: "65 ksi (450 MPa)", hardness: "293 HBW max", use: "Duplex SS — chloride & stress corrosion resistance" },
  { grade: "Super Duplex 32750/32760", material: "Super Duplex SS (UNS S32750/S32760)", spec: "ASTM A182 F53/F55", tensile: "116 ksi (800 MPa)", yield: "80 ksi (550 MPa)", hardness: "310 HBW max", use: "Extreme chloride & seawater environments" },
  { grade: "Inconel 625", material: "Alloy 625 (UNS N06625)", spec: "ASTM B446", tensile: "120 ksi (827 MPa)", yield: "60 ksi (414 MPa)", hardness: "—", use: "High-temp, acid & seawater corrosion resistance" },
  { grade: "Inconel 718", material: "Alloy 718 (UNS N07718)", spec: "ASTM B637", tensile: "180 ksi (1241 MPa)", yield: "150 ksi (1034 MPa)", hardness: "40 HRC max", use: "Aerospace, cryogenic, high-strength at elevated temp" },
  { grade: "Inconel 825", material: "Alloy 825 (UNS N08825)", spec: "ASTM B425", tensile: "85 ksi (586 MPa)", yield: "35 ksi (241 MPa)", hardness: "—", use: "Sulfuric & phosphoric acid, pollution control" },
  { grade: "ASTM A453 Grade 660", material: "Alloy A-286 (UNS S66286)", spec: "ASTM A453", tensile: "130 ksi (896 MPa)", yield: "85 ksi (586 MPa)", hardness: "302 HBW max", use: "High-temp service to 1200°F, jet engines, gas turbines" },
  { grade: "Monel 400", material: "Alloy 400 (UNS N04400)", spec: "ASTM F468", tensile: "80 ksi (550 MPa)", yield: "40 ksi (276 MPa)", hardness: "—", use: "Marine, chemical processing, hydrofluoric acid" },
  { grade: "Hastelloy C-276", material: "Alloy C-276 (UNS N10276)", spec: "ASTM B574", tensile: "100 ksi (690 MPa)", yield: "41 ksi (283 MPa)", hardness: "—", use: "Severe corrosion — chemical processing, flue gas" },
  { grade: "Titanium Grade 2", material: "CP Titanium (UNS R50400)", spec: "ASTM F467/F468", tensile: "50 ksi (345 MPa)", yield: "40 ksi (275 MPa)", hardness: "—", use: "Lightweight, excellent corrosion resistance, marine" },
  { grade: "Grade 10.9", material: "Medium Carbon Alloy Steel", spec: "ISO 898-1", tensile: "150 ksi (1040 MPa)", yield: "124 ksi (940 MPa)", hardness: "32–39 HRC", use: "High-strength metric bolting, automotive, structural" },
  { grade: "Grade 12.9", material: "Alloy Steel, Quenched & Tempered", spec: "ISO 898-1", tensile: "174 ksi (1220 MPa)", yield: "155 ksi (1100 MPa)", hardness: "39–44 HRC", use: "Highest metric strength class, critical assemblies" },
];

const nutGrades = [
  { grade: "ASTM A194 2H", material: "Carbon / Alloy Steel", spec: "ASTM A194", hardness: "248–352 HBW", proofLoad: "150 ksi", use: "Pairs with A193 B7 bolts" },
  { grade: "ASTM A194 2HM", material: "Carbon / Alloy Steel", spec: "ASTM A194", hardness: "159–237 HBW", proofLoad: "100 ksi", use: "SSC-resistant, pairs with B7M (NACE)" },
  { grade: "ASTM A194 Gr 4", material: "AISI 4140/4142 Alloy Steel", spec: "ASTM A194", hardness: "248–352 HBW", proofLoad: "150 ksi", use: "High-temp service, pairs with B16" },
  { grade: "ASTM A194 Gr 7", material: "AISI 4140/4142 Alloy Steel", spec: "ASTM A194", hardness: "248–352 HBW", proofLoad: "150 ksi", use: "Low-temperature, pairs with L7" },
  { grade: "ASTM A194 Gr 8", material: "304 Stainless Steel", spec: "ASTM A194", hardness: "126–300 HBW", proofLoad: "75 ksi", use: "Pairs with B8 bolts" },
  { grade: "ASTM A194 Gr 8M", material: "316 Stainless Steel", spec: "ASTM A194", hardness: "126–300 HBW", proofLoad: "75 ksi", use: "Pairs with B8M bolts" },
  { grade: "SS 310 Nut", material: "310 Stainless Steel", spec: "ASTM A194", hardness: "—", proofLoad: "—", use: "High-temp oxidation resistance" },
  { grade: "SS 410 Nut", material: "410 Stainless Steel", spec: "ASTM A194 Gr 6", hardness: "159–352 HBW", proofLoad: "110 ksi", use: "Martensitic, corrosion-resistant" },
  { grade: "347 Nut", material: "347 Stainless Steel", spec: "ASTM A194 Gr 8C", hardness: "126–300 HBW", proofLoad: "75 ksi", use: "Cb-stabilized, high-temp" },
  { grade: "317L Nut", material: "317L Stainless Steel", spec: "ASTM A194", hardness: "—", proofLoad: "—", use: "Superior pitting resistance" },
  { grade: "Duplex 2205 Nut", material: "Duplex SS (UNS S31803)", spec: "ASTM A182", hardness: "293 HBW max", proofLoad: "—", use: "Chloride & stress corrosion" },
  { grade: "Super Duplex Nut", material: "Super Duplex (UNS S32750/60)", spec: "ASTM A182", hardness: "310 HBW max", proofLoad: "—", use: "Extreme seawater environments" },
  { grade: "Inconel 625 Nut", material: "Alloy 625 (UNS N06625)", spec: "ASTM B446", hardness: "—", proofLoad: "—", use: "High-temp, acid & seawater" },
  { grade: "Inconel 718 Nut", material: "Alloy 718 (UNS N07718)", spec: "ASTM B637", hardness: "40 HRC max", proofLoad: "—", use: "Aerospace, high-strength" },
  { grade: "Inconel 825 Nut", material: "Alloy 825 (UNS N08825)", spec: "ASTM B425", hardness: "—", proofLoad: "—", use: "Sulfuric acid, pollution control" },
  { grade: "A453 Gr 660 Nut", material: "A-286 (UNS S66286)", spec: "ASTM A453", hardness: "302 HBW max", proofLoad: "—", use: "High-temp to 1200°F" },
  { grade: "Monel 400 Nut", material: "Alloy 400 (UNS N04400)", spec: "ASTM F467", hardness: "—", proofLoad: "—", use: "Marine, HF acid" },
  { grade: "Hastelloy C-276 Nut", material: "Alloy C-276 (UNS N10276)", spec: "ASTM B574", hardness: "—", proofLoad: "—", use: "Severe chemical corrosion" },
  { grade: "Titanium Gr 2 Nut", material: "CP Titanium (UNS R50400)", spec: "ASTM F467", hardness: "—", proofLoad: "—", use: "Lightweight, marine" },
  { grade: "ISO 10.9 Nut (Cl 10)", material: "Medium Carbon Steel", spec: "ISO 898-2", hardness: "26–36 HRC", proofLoad: "150 ksi", use: "Pairs with 10.9 bolts" },
  { grade: "ISO 12.9 Nut (Cl 12)", material: "Alloy Steel", spec: "ISO 898-2", hardness: "36–44 HRC", proofLoad: "174 ksi", use: "Pairs with 12.9 bolts" },
];

const dimensionalStandards = [
  { product: "Stud Bolts", din: "DIN 976", asme: "ASME B18.31.2", iso: "—", uni: "UNI 6610", bs: "BS 4882" },
  { product: "Double End Studs", din: "DIN 938/939", asme: "ASME B18.31.2", iso: "—", uni: "UNI 5911", bs: "BS 4882" },
  { product: "Hex Bolts", din: "DIN 931", asme: "ASME B18.2.1", iso: "ISO 4014", uni: "UNI 5737", bs: "BS 3692" },
  { product: "Heavy Hex Bolts", din: "DIN 6914", asme: "ASME B18.2.1", iso: "ISO 7411", uni: "UNI 5712", bs: "—" },
  { product: "Socket Head Cap Screws", din: "DIN 912", asme: "ASME B18.3", iso: "ISO 4762", uni: "UNI 5931", bs: "BS 4168-1" },
  { product: "Countersunk Screws", din: "DIN 7991", asme: "ASME B18.3", iso: "ISO 10642", uni: "UNI 5933", bs: "BS 4168-8" },
  { product: "Socket Set Screws", din: "DIN 913-916", asme: "ASME B18.3", iso: "ISO 4026-4029", uni: "UNI 5923-5929", bs: "BS 4168" },
  { product: "Eye Bolts", din: "DIN 444", asme: "ASME B18.15", iso: "—", uni: "UNI 6058", bs: "—" },
  { product: "U Bolts", din: "DIN 3570", asme: "ASME B18.31.5", iso: "—", uni: "—", bs: "—" },
  { product: "Anchor Bolts", din: "DIN 529", asme: "—", iso: "—", uni: "—", bs: "—" },
  { product: "Threaded Rods", din: "DIN 976", asme: "ASME B18.31.2", iso: "—", uni: "—", bs: "—" },
];

const GradeChartSection = () => {
  const { bolts: boltStudGrades, nuts: nutGrades, dims: dimensionalStandards } = useEditableTables();
  return (
    <section id="grade-chart" className="py-20 md:py-28 bg-background">
      <div className="container">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <motion.span
            className="text-sm font-semibold tracking-[0.3em] uppercase text-primary inline-block"
            initial={{ opacity: 0, letterSpacing: "0.1em" }}
            whileInView={{ opacity: 1, letterSpacing: "0.3em" }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Reference
          </motion.span>
          <h2 className="font-heading text-3xl md:text-5xl font-bold mt-3 text-foreground">
            Fastener <span className="text-gradient-gold">Grade Chart</span>
          </h2>
          <motion.div
            className="gold-divider w-24 mx-auto mt-6"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
        </motion.div>

        {/* Tabbed Grade Charts */}
        <Tabs defaultValue="bolts" className="mb-12">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-secondary/50">
            <TabsTrigger value="bolts" className="font-heading font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Bolt & Stud Grades</TabsTrigger>
            <TabsTrigger value="nuts" className="font-heading font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Nut Grades</TabsTrigger>
            <TabsTrigger value="standards" className="font-heading font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Dimensional Standards</TabsTrigger>
          </TabsList>

          {/* Bolt & Stud Grades */}
          <TabsContent value="bolts">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-card rounded-lg border border-border shadow-elegant overflow-hidden">
              <div className="bg-gradient-dark px-6 py-4">
                <h3 className="font-heading text-xl font-semibold text-gold-light">Bolt & Stud Grade Chart — All Grades</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-secondary/50">
                      <th className="text-left px-4 py-3 font-semibold text-foreground">Grade</th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground">Material</th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground">Specification</th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground">Tensile Strength</th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground">Yield Strength</th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground">Hardness</th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground">Application</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {boltStudGrades.map((g) => (
                      <tr key={g.grade} className={`hover:bg-secondary/30 transition-colors ${g.grade === "ASTM A193 B7" ? "bg-primary/5 font-medium" : ""}`}>
                        <td className="px-4 py-3 font-semibold text-primary whitespace-nowrap">{g.grade}</td>
                        <td className="px-4 py-3 text-foreground">{g.material}</td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{g.spec}</td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{g.tensile}</td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{g.yield}</td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{g.hardness}</td>
                        <td className="px-4 py-3 text-muted-foreground">{g.use}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </TabsContent>

          {/* Nut Grades */}
          <TabsContent value="nuts">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-card rounded-lg border border-border shadow-elegant overflow-hidden">
              <div className="bg-gradient-dark px-6 py-4">
                <h3 className="font-heading text-xl font-semibold text-gold-light">Nut Grade Chart — All Grades</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-secondary/50">
                      <th className="text-left px-4 py-3 font-semibold text-foreground">Grade</th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground">Material</th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground">Specification</th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground">Hardness</th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground">Proof Load</th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground">Application</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {nutGrades.map((n) => (
                      <tr key={n.grade} className="hover:bg-secondary/30 transition-colors">
                        <td className="px-4 py-3 font-semibold text-primary whitespace-nowrap">{n.grade}</td>
                        <td className="px-4 py-3 text-foreground">{n.material}</td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{n.spec}</td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{n.hardness}</td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{n.proofLoad}</td>
                        <td className="px-4 py-3 text-muted-foreground">{n.use}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </TabsContent>

          {/* Dimensional Standards */}
          <TabsContent value="standards">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-card rounded-lg border border-border shadow-elegant overflow-hidden">
              <div className="bg-gradient-dark px-6 py-4">
                <h3 className="font-heading text-xl font-semibold text-gold-light">Fastener Dimensional Standards</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-secondary/50">
                      <th className="text-left px-4 py-3 font-semibold text-foreground">Product</th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground">DIN</th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground">ASME</th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground">ISO</th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground">UNI</th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground">BS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {dimensionalStandards.map((d) => (
                      <tr key={d.product} className="hover:bg-secondary/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-foreground">{d.product}</td>
                        <td className="px-4 py-3 text-muted-foreground">{d.din}</td>
                        <td className="px-4 py-3 text-muted-foreground">{d.asme}</td>
                        <td className="px-4 py-3 text-muted-foreground">{d.iso}</td>
                        <td className="px-4 py-3 text-muted-foreground">{d.uni}</td>
                        <td className="px-4 py-3 text-muted-foreground">{d.bs}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default GradeChartSection;
