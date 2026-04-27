import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Send, Phone, Mail, MapPin, FileText, CheckCircle2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import SEO from "@/components/SEO";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type QuoteForm = {
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  message: string;
};

const empty: QuoteForm = { fullName: "", email: "", phone: "", companyName: "", message: "" };

const QuotePage = () => {
  const [form, setForm] = useState<QuoteForm>(empty);
  const [done, setDone] = useState(false);
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (data: QuoteForm) =>
      api("/api/contact", {
        method: "POST",
        body: JSON.stringify({ ...data, message: `[QUOTE REQUEST]\n${data.message}` }),
      }),
    onSuccess: () => {
      setDone(true);
      setForm(empty);
      toast({ title: "Quote request sent", description: "Our team will reach out within one business day." });
    },
    onError: (e: any) =>
      toast({ title: "Failed to send", description: e?.message || "Please try again", variant: "destructive" }),
  });

  const update = (k: keyof QuoteForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <PageTransition>
      <SEO
        title="Request a Quote | M.I. Engineering Works — Industrial Fasteners"
        description="Get a custom quote for ASTM A193 B7 stud bolts, hex bolts, threaded rods and high-tensile fasteners. Fast quotes, mill-test certificates, India-wide & export shipping."
        keywords={["fastener quote", "B7 bolt quote", "stud bolt quote India", "M.I. Engineering Works quote"]}
        path="/quote"
      />

      <Header />

      <section className="relative bg-gradient-dark py-20 md:py-28 text-foreground overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/40 via-charcoal/55 to-charcoal/85" />
        <div className="container relative z-10 text-center">
          <span className="text-xs md:text-sm font-semibold tracking-[0.4em] uppercase text-primary">Get Started</span>
          <h1 className="font-heading text-4xl md:text-6xl font-bold mt-4 leading-[1.1] tracking-tight">
            Request a <span className="text-gradient-gold">Quote</span>
          </h1>
          <div className="gold-divider w-24 mx-auto mt-5" />
          <p className="mt-5 max-w-2xl mx-auto text-foreground/80 leading-relaxed">
            Share your project details and our engineering team will respond with a tailored quotation within one business day.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="container max-w-6xl">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2 bg-card border border-border rounded-2xl shadow-elegant p-6 md:p-10">
              {done ? (
                <div className="text-center py-12" data-testid="quote-success">
                  <div className="w-16 h-16 rounded-full bg-gradient-gold flex items-center justify-center mx-auto mb-5 shadow-gold">
                    <CheckCircle2 className="w-8 h-8 text-charcoal" />
                  </div>
                  <h2 className="font-heading text-2xl font-bold text-foreground mb-2">Thank you!</h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Your quote request has been received. Our team will reach out within one business day.
                  </p>
                  <button
                    onClick={() => setDone(false)}
                    className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-primary text-primary font-semibold hover:bg-primary hover:text-primary-foreground transition"
                    data-testid="button-quote-new"
                  >
                    Submit another request
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    mutation.mutate(form);
                  }}
                  className="space-y-5"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-gold flex items-center justify-center shadow-gold">
                      <FileText className="w-5 h-5 text-charcoal" />
                    </div>
                    <div>
                      <h2 className="font-heading text-xl font-bold text-foreground">Quotation Form</h2>
                      <p className="text-xs text-muted-foreground">All fields marked * are required</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <label className="block">
                      <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Full Name *</span>
                      <input required value={form.fullName} onChange={update("fullName")} data-testid="input-quote-name"
                        className="mt-1.5 w-full bg-background border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition" />
                    </label>
                    <label className="block">
                      <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Company</span>
                      <input value={form.companyName} onChange={update("companyName")} data-testid="input-quote-company"
                        className="mt-1.5 w-full bg-background border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition" />
                    </label>
                    <label className="block">
                      <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Email *</span>
                      <input required type="email" value={form.email} onChange={update("email")} data-testid="input-quote-email"
                        className="mt-1.5 w-full bg-background border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition" />
                    </label>
                    <label className="block">
                      <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Phone *</span>
                      <input required value={form.phone} onChange={update("phone")} data-testid="input-quote-phone"
                        className="mt-1.5 w-full bg-background border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition" />
                    </label>
                  </div>

                  <label className="block">
                    <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Project Details *</span>
                    <textarea
                      required
                      rows={6}
                      value={form.message}
                      onChange={update("message")}
                      placeholder="Product, sizes, grade, quantity, delivery location & timeline."
                      data-testid="input-quote-message"
                      className="mt-1.5 w-full bg-background border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition resize-y"
                    />
                  </label>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={mutation.isPending}
                      data-testid="button-quote-submit"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-gold text-charcoal font-semibold hover:opacity-90 transition shadow-gold disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      {mutation.isPending ? "Sending…" : "Send Quote Request"}
                    </button>
                    <a
                      href="https://wa.me/919819972301?text=Hello%2C%20I%20would%20like%20a%20quotation."
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid="link-quote-whatsapp"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-primary text-primary font-semibold hover:bg-primary hover:text-primary-foreground transition"
                    >
                      <Phone className="w-4 h-4" />
                      Chat on WhatsApp
                    </a>
                  </div>
                </form>
              )}
            </div>

            {/* Side info */}
            <aside className="space-y-5">
              <div className="bg-card border border-border rounded-2xl p-6 shadow-elegant">
                <h3 className="font-heading text-lg font-semibold text-foreground mb-4">Direct Contact</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <a href="tel:9819972301" className="text-foreground/90 hover:text-primary block">+91 98199 72301</a>
                      <a href="tel:9137658733" className="text-foreground/90 hover:text-primary block">+91 91376 58733</a>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <a href="mailto:miengineering17@gmail.com" className="text-foreground/90 hover:text-primary break-all">
                      miengineering17@gmail.com
                    </a>
                  </li>
                  <li className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-foreground/90">Mumbai, Maharashtra · India</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-dark border border-primary/20 rounded-2xl p-6 shadow-elegant">
                <h3 className="font-heading text-lg font-semibold text-gold-light mb-3">Why M.I. Engineering Works?</h3>
                <ul className="space-y-2 text-sm text-foreground/85">
                  <li className="flex items-start gap-2"><span className="text-primary">✓</span> 25+ years of manufacturing expertise</li>
                  <li className="flex items-start gap-2"><span className="text-primary">✓</span> Mill test certificates with every order</li>
                  <li className="flex items-start gap-2"><span className="text-primary">✓</span> ASTM, DIN, ISO, BS, IS compliant</li>
                  <li className="flex items-start gap-2"><span className="text-primary">✓</span> Pan-India dispatch & global export</li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <Footer />
    </PageTransition>
  );
};

export default QuotePage;
