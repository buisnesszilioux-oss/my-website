import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import PageTransition from "@/components/PageTransition";
import SEO from "@/components/SEO";

export default function ContactPage() {
  return (
    <PageTransition>
      <SEO
        title="Contact M.I. Engineering Works — Request a Fasteners Quote"
        description="Get in touch with M.I. Engineering Works, Mumbai. Request a quote for industrial fasteners, stud bolts and high-tensile hardware. Call +91-9819972301 or email mienginering17@gmail.com."
        keywords={[
          "contact fasteners manufacturer",
          "fasteners quote Mumbai",
          "buy bolts India",
          "MI Engineering Works contact",
        ]}
        path="/contact"
      />
      <Header />
      <main>
        <ContactSection />
      </main>
      <Footer />
    </PageTransition>
  );
}
