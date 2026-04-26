import { motion } from "framer-motion";
import { ReactNode } from "react";

const PageTransition = ({ children }: { children: ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{
      type: "spring",
      stiffness: 260,
      damping: 30,
      mass: 0.8,
    }}
    style={{ willChange: "opacity, transform" }}
  >
    {children}
  </motion.div>
);

export default PageTransition;
