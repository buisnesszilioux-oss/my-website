import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Link } from "react-router-dom";
import { products } from "@/data/products";
import { useRef } from "react";
import { useActiveAnimations } from "@/hooks/useActiveAnimations";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50, rotateX: 15, scale: 0.9 },
  visible: {
    opacity: 1, y: 0, rotateX: 0, scale: 1,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const },
  },
};

const Product3DCard = ({ product, animClass }: { product: typeof products[0]; animClass: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      variants={itemVariants}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 800, rotateX, rotateY, transformStyle: "preserve-3d" }}
    >
      <Link
        to={`/product/${product.slug}`}
        className={`group block bg-card rounded-lg border border-border hover:border-primary/40 transition-all duration-300 overflow-hidden shadow-elegant hover:shadow-gold ${animClass}`}
        data-testid={`card-product-${product.slug}`}
      >
        <div className="aspect-square bg-secondary/30 flex items-center justify-center p-4 overflow-hidden relative">
          {/* Shine overlay on hover */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ transform: "translateZ(20px)" }}
          />
          {/* Ripple pulse on hover */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary/20 opacity-0 group-hover:opacity-100"
            initial={{ scale: 0.5, opacity: 0 }}
            whileHover={{ scale: 1.5, opacity: [0, 0.4, 0] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
          <motion.img
            src={product.img}
            alt={`${product.name} ASTM A193 Grade B7 - M.I. Engineering Works Mumbai`}
            loading="lazy"
            width={512}
            height={512}
            className="w-full h-full object-contain"
            whileHover={{ scale: 1.15, rotate: 3 }}
            whileTap={{ scale: 0.92, rotate: -2 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          />
        </div>
        <motion.div
          className="p-4 text-center border-t border-border"
          whileHover={{ backgroundColor: "hsl(var(--primary) / 0.05)" }}
        >
          <h3 className="font-heading text-sm md:text-base font-semibold text-foreground">{product.name}</h3>
          <p className="text-xs text-muted-foreground mt-1">{product.standard}</p>
          <motion.span
            className="inline-block mt-2 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity"
            initial={{ y: 5 }}
            whileHover={{ y: 0 }}
          >
            View Details →
          </motion.span>
        </motion.div>
      </Link>
    </motion.div>
  );
};

const ProductsSection = () => {
  const { product } = useActiveAnimations();
  const animClass = product.cardClass || "";
  return (
    <section id="products" className="py-20 md:py-28 bg-background">
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
            Our Products
          </motion.span>
          <h2 className="font-heading text-3xl md:text-5xl font-bold mt-3 text-foreground">
            ASTM A193 Grade B7 <span className="text-gradient-gold">Fasteners</span>
          </h2>
          <motion.div
            className="gold-divider w-24 mx-auto mt-6"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
        </motion.div>

        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {products.map((p) => (
            <Product3DCard key={p.slug} product={p} animClass={animClass} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ProductsSection;
