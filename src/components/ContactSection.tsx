import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useSiteContent } from "@/hooks/useSiteContent";

const ContactSection = () => {
  const { get } = useSiteContent();
  const { toast } = useToast();
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", companyName: "", message: "" });

  const mutation = useMutation({
    mutationFn: (data: typeof form) => api("/api/contact", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      toast({ title: "Message sent!", description: "Thank you for contacting us. We will reach out shortly." });
      setForm({ fullName: "", email: "", phone: "", companyName: "", message: "" });
    },
    onError: (e: any) => toast({ title: "Send failed", description: e?.message || "Please try again.", variant: "destructive" }),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.email.trim() || !form.phone.trim() || !form.message.trim()) {
      toast({ title: "Missing fields", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }
    mutation.mutate(form);
  };

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <section id="contact" className="py-20 md:py-28 bg-secondary/30">
      <div className="container">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold tracking-[0.3em] uppercase text-primary" data-testid="text-contact-eyebrow">{get("contact.eyebrow")}</span>
          <h2 className="font-heading text-3xl md:text-5xl font-bold mt-3 text-foreground">
            <span data-testid="text-contact-title">{get("contact.title")}</span>{get("contact.titleAccent") && " "}{get("contact.titleAccent") && <span className="text-gradient-gold" data-testid="text-contact-title-accent">{get("contact.titleAccent")}</span>}
          </h2>
          <div className="gold-divider w-24 mx-auto mt-6" />
        </div>

        <div className="grid lg:grid-cols-5 gap-10 max-w-6xl mx-auto">
          {/* Info cards */}
          <div className="lg:col-span-2 space-y-5">
            <a href={`mailto:${get("contact.email")}`} data-testid="link-email" className="block bg-card rounded-lg border border-border p-6 shadow-elegant hover:border-primary/40 hover:shadow-gold transition">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-gold flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-charcoal" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-semibold text-foreground">Email</h3>
                  <p className="text-muted-foreground text-sm mt-1 break-all" data-testid="text-email">{get("contact.email")}</p>
                </div>
              </div>
            </a>
            <div className="bg-card rounded-lg border border-border p-6 shadow-elegant">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-gold flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-charcoal" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-semibold text-foreground">Phone</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    {get("contact.phone1") && <a href={`tel:${get("contact.phone1").replace(/\s|\+/g, "")}`} className="hover:text-primary block" data-testid="link-phone-1">{get("contact.phone1")}</a>}
                    {get("contact.phone2") && <a href={`tel:${get("contact.phone2").replace(/\s|\+/g, "")}`} className="hover:text-primary block" data-testid="link-phone-2">{get("contact.phone2")}</a>}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-lg border border-border p-6 shadow-elegant">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-gold flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-charcoal" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-semibold text-foreground">Address</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mt-1 whitespace-pre-line" data-testid="text-address">
                    {get("contact.address")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="lg:col-span-3 bg-card rounded-lg border border-border p-6 md:p-8 shadow-elegant" data-testid="form-contact">
            <h3 className="font-heading text-2xl font-bold text-foreground mb-2">Send Us a Message</h3>
            <p className="text-sm text-muted-foreground mb-6" data-testid="text-form-intro">{get("contact.formIntro")}</p>

            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Full Name *">
                <input value={form.fullName} onChange={update("fullName")} required data-testid="input-fullName" placeholder="John Smith" className="input-style" />
              </Field>
              <Field label="Email *">
                <input type="email" value={form.email} onChange={update("email")} required data-testid="input-email" placeholder="you@company.com" className="input-style" />
              </Field>
              <Field label="Phone Number *">
                <input value={form.phone} onChange={update("phone")} required data-testid="input-phone" placeholder="+91 98199 72301" className="input-style" />
              </Field>
              <Field label="Company Name">
                <input value={form.companyName} onChange={update("companyName")} data-testid="input-company" placeholder="Acme Pvt Ltd" className="input-style" />
              </Field>
            </div>

            <Field label="Message *" className="mt-4">
              <textarea
                value={form.message}
                onChange={update("message")}
                required
                rows={5}
                data-testid="input-message"
                placeholder="Describe your requirement: grade, size, quantity, delivery location…"
                className="input-style resize-none"
              />
            </Field>

            <button
              type="submit"
              disabled={mutation.isPending}
              data-testid="button-submit-contact"
              className="mt-6 inline-flex items-center justify-center gap-2 w-full md:w-auto px-8 py-3 rounded-md bg-gradient-gold text-charcoal font-semibold hover:opacity-90 transition disabled:opacity-60"
            >
              {mutation.isPending ? "Sending…" : (<><Send className="w-4 h-4" /> Send Message</>)}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .input-style { width:100%; background: hsl(var(--background)); border: 1px solid hsl(var(--border)); border-radius: 0.5rem; padding: 0.65rem 0.85rem; font-size: 0.9rem; color: hsl(var(--foreground)); transition: border-color .2s, box-shadow .2s; }
        .input-style:focus { outline: none; border-color: hsl(var(--primary)); box-shadow: 0 0 0 3px hsl(var(--primary) / 0.15); }
      `}</style>
    </section>
  );
};

const Field = ({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) => (
  <label className={`block ${className}`}>
    <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{label}</span>
    {children}
  </label>
);

export default ContactSection;
