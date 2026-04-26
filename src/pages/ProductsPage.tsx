import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductsSection from "@/components/ProductsSection";
import PageTransition from "@/components/PageTransition";
import SEO from "@/components/SEO";

export default function ProductsPage() {
  return (
    <PageTransition>
      <SEO
        title="Industrial Fasteners — Stud Bolts, Hex Bolts, Anchor Bolts & More"
        description="Browse our complete range of industrial fasteners — stud bolts, hex bolts, anchor bolts, foundation bolts, U-bolts, J-bolts and threaded rods. Manufactured in MS, SS, Brass and Aluminium by M.I. Engineering Works, Mumbai."
        keywords={[
          "industrial fasteners catalog",
          "stud bolts Mumbai",
          "hex bolts manufacturer",
          "fasteners product range",
          "buy fasteners online India",
        ]}
        path="/products"
      />
      <Header />
      <main>
        <ProductsSection />
      </main>
      <Footer />
    </PageTransition>
  );
}
