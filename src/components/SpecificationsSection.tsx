import { motion } from "framer-motion";
import { useEditableTables } from "@/hooks/useEditableTables";

const sectionHeader = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const tableCard = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const SpecificationsSection = () => {
  const { chemical, mechMetric, mechImperial } = useEditableTables();
  return (
    <section id="specifications" className="py-20 md:py-28 bg-secondary/30">
      <div className="container">
        <motion.div className="text-center mb-16" variants={sectionHeader} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <span className="text-sm font-semibold tracking-[0.3em] uppercase text-primary">Specifications</span>
          <h2 className="font-heading text-3xl md:text-5xl font-bold mt-3 text-foreground">
            ASTM A193 Grade B7 <span className="text-gradient-gold">Technical Data</span>
          </h2>
          <motion.div
            className="gold-divider w-24 mx-auto mt-6"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Grade B7 is a heat-treated chromium-molybdenum (Cr-Mo) alloy steel with minimum tensile strength of 125 ksi (860 MPa).
          </p>
        </motion.div>

        <div className="space-y-12">
          {/* Chemical Composition */}
          <motion.div variants={tableCard} initial="hidden" whileInView="visible" viewport={{ once: true }} className="bg-card rounded-lg border border-border shadow-elegant overflow-hidden">
            <div className="bg-gradient-dark px-6 py-4">
              <h3 className="font-heading text-xl font-semibold text-gold-light">Chemical Composition</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-secondary/50">
                    <th className="text-left px-6 py-3 font-semibold text-foreground">Element</th>
                    <th className="text-left px-6 py-3 font-semibold text-foreground">Range</th>
                    <th className="text-left px-6 py-3 font-semibold text-foreground">Product Variation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {chemical.map((row, i) => (
                    <motion.tr
                      key={`${row.element}-${i}`}
                      className="hover:bg-secondary/30 transition-colors"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <td className="px-6 py-3 font-medium text-foreground">{row.element}</td>
                      <td className="px-6 py-3 text-muted-foreground">{row.range}</td>
                      <td className="px-6 py-3 text-muted-foreground">{row.variation}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Mechanical Properties - Metric */}
          <motion.div variants={tableCard} initial="hidden" whileInView="visible" viewport={{ once: true }} className="bg-card rounded-lg border border-border shadow-elegant overflow-hidden">
            <div className="bg-gradient-dark px-6 py-4">
              <h3 className="font-heading text-xl font-semibold text-gold-light">Mechanical Properties — Metric Sizes</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-secondary/50">
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Diameter</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Min Temp °F</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Tensile (MPa)</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Yield (MPa)</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Elong. %</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Red. Area %</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Hardness</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {mechMetric.map((row, i) => (
                    <motion.tr
                      key={`${row.diameter}-${i}`}
                      className="hover:bg-secondary/30 transition-colors"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 }}
                    >
                      <td className="px-4 py-3 font-medium text-foreground">{row.diameter}</td>
                      <td className="px-4 py-3 text-muted-foreground">{row.minTemp}</td>
                      <td className="px-4 py-3 text-muted-foreground">{row.tensile}</td>
                      <td className="px-4 py-3 text-muted-foreground">{row.yield}</td>
                      <td className="px-4 py-3 text-muted-foreground">{row.elong}</td>
                      <td className="px-4 py-3 text-muted-foreground">{row.redArea}</td>
                      <td className="px-4 py-3 text-muted-foreground">{row.hardness}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Mechanical Properties - Imperial */}
          <motion.div variants={tableCard} initial="hidden" whileInView="visible" viewport={{ once: true }} className="bg-card rounded-lg border border-border shadow-elegant overflow-hidden">
            <div className="bg-gradient-dark px-6 py-4">
              <h3 className="font-heading text-xl font-semibold text-gold-light">Mechanical Properties — Inch Sizes</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-secondary/50">
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Diameter</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Min Temp °F</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Tensile (ksi)</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Yield (ksi)</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Elong. %</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Red. Area %</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Hardness</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {mechImperial.map((row, i) => (
                    <motion.tr
                      key={`${row.diameter}-${i}`}
                      className="hover:bg-secondary/30 transition-colors"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 }}
                    >
                      <td className="px-4 py-3 font-medium text-foreground">{row.diameter}</td>
                      <td className="px-4 py-3 text-muted-foreground">{row.minTemp}</td>
                      <td className="px-4 py-3 text-muted-foreground">{row.tensile}</td>
                      <td className="px-4 py-3 text-muted-foreground">{row.yield}</td>
                      <td className="px-4 py-3 text-muted-foreground">{row.elong}</td>
                      <td className="px-4 py-3 text-muted-foreground">{row.redArea}</td>
                      <td className="px-4 py-3 text-muted-foreground">{row.hardness}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Recommended Hardware */}
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-card rounded-lg border border-border shadow-elegant p-6"
            >
              <h3 className="font-heading text-lg font-semibold text-foreground mb-4">Recommended Hardware</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2"><motion.span className="w-1.5 h-1.5 rounded-full bg-primary" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }} /> Nuts: ASTM A194 Grade 2H</li>
                <li className="flex items-center gap-2"><motion.span className="w-1.5 h-1.5 rounded-full bg-primary" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} /> Washers: ASTM F436 Type 1</li>
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-card rounded-lg border border-border shadow-elegant p-6"
            >
              <h3 className="font-heading text-lg font-semibold text-foreground mb-4">Raw Material</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2"><motion.span className="w-1.5 h-1.5 rounded-full bg-primary" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }} /> AISI 4140 Alloy Steel</li>
                <li className="flex items-center gap-2"><motion.span className="w-1.5 h-1.5 rounded-full bg-primary" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} /> AISI 4142 Alloy Steel</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SpecificationsSection;
