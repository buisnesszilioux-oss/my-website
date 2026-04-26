import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Autoplay from "embla-carousel-autoplay";
import { products } from "@/data/products";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

const ProductSlider = () => {
  return (
    <section className="py-16 md:py-20 bg-secondary/20 overflow-hidden" aria-label="ASTM A193 Grade B7 Fasteners Collection">
      <div className="container">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-sm font-semibold tracking-[0.3em] uppercase text-primary">
            ASTM A193 Grade B7 Collection
          </span>
          <h2 className="font-heading text-2xl md:text-4xl font-bold mt-2 text-foreground">
            Premium <span className="text-gradient-gold">B7 Fasteners</span> — Stud Bolts, Hex Bolts &amp; More
          </h2>
          <p className="text-sm text-muted-foreground mt-3 max-w-2xl mx-auto">
            Manufacturer &amp; supplier of ASTM A193 Grade B7 stud bolts, hex bolts, threaded rods, anchor bolts, U-bolts, eye bolts &amp; socket head cap screws in Mumbai, India.
          </p>
          <motion.div
            className="gold-divider w-20 mx-auto mt-4"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          />
        </motion.div>

        <div className="relative px-12">
          <Carousel
            opts={{ align: "center", loop: true, slidesToScroll: 1 }}
            plugins={[
              Autoplay({
                delay: 2000,
                stopOnInteraction: false,
                stopOnMouseEnter: true,
                playOnInit: true,
              }),
            ]}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {products.map((product) => (
                <CarouselItem
                  key={product.slug}
                  className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4"
                >
                  <Link
                    to={`/product/${product.slug}`}
                    className="group block bg-card rounded-lg border border-border hover:border-primary/40 transition-all duration-300 overflow-hidden shadow-elegant hover:shadow-gold"
                    title={`${product.name} ASTM A193 Grade B7 - M.I. Engineering Works Mumbai`}
                  >
                    <div className="aspect-square bg-secondary/30 flex items-center justify-center p-4 overflow-hidden relative">
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      />
                      <motion.img
                        src={product.img}
                        alt={`${product.name} ASTM A193 Grade B7 manufacturer supplier Mumbai India - M.I. Engineering Works`}
                        loading="lazy"
                        width={300}
                        height={300}
                        className="w-full h-full object-contain"
                        whileHover={{ scale: 1.1, rotate: 2 }}
                        transition={{ type: "spring", stiffness: 250, damping: 18 }}
                      />
                    </div>
                    <div className="p-3 text-center border-t border-border">
                      <h3 className="font-heading text-sm font-semibold text-foreground">
                        {product.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{product.standard}</p>
                    </div>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="border-primary/30 text-primary hover:bg-primary/10" />
            <CarouselNext className="border-primary/30 text-primary hover:bg-primary/10" />
          </Carousel>
        </div>

        {/* SEO-rich hidden content for crawlers */}
        <div className="sr-only">
          <h3>ASTM A193 Grade B7 Products by M.I. Engineering Works, Mumbai</h3>
          <ul>
            {products.map((p) => (
              <li key={p.slug}>
                <a href={`/product/${p.slug}`}>
                  {p.name} - ASTM A193 Grade B7 - {p.standard} - Sizes: {p.sizes} - Material: {p.material}
                </a>
              </li>
            ))}
          </ul>
          <p>M.I. Engineering Works is a leading ASTM A193 Grade B7 fastener manufacturer and supplier located at 301, Mehar Iron Bazar, Iron Market, Khedwadi, Girgaon, Mumbai 400004, Maharashtra, India. Contact: +91-9819972301, Email: mienginering17@gmail.com</p>
        </div>
      </div>
    </section>
  );
};

export default ProductSlider;
