import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";

type PageSection = {
  id: number;
  page: string;
  position: string;
  title: string;
  subtitle: string;
  body: string;
  image: string;
  linkText: string;
  linkUrl: string;
  enabled: boolean;
};

const fetchSections = async (): Promise<PageSection[]> => {
  const r = await fetch("/api/page-sections?page=home");
  if (!r.ok) return [];
  return r.json();
};

const SectionBlock = ({ s }: { s: PageSection }) => {
  const hasImage = !!s.image;
  return (
    <section className="py-16 md:py-24 bg-background relative overflow-hidden" data-testid={`custom-section-${s.id}`}>
      <div className="container">
        <div className={`grid gap-8 md:gap-12 items-center ${hasImage ? "md:grid-cols-2" : ""}`}>
          {hasImage && (
            <motion.img
              src={s.image}
              alt={s.title}
              className="w-full rounded-xl shadow-elegant border border-border max-h-[420px] object-cover"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            />
          )}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={hasImage ? "" : "max-w-3xl mx-auto text-center"}
          >
            {s.subtitle && (
              <span className="text-xs font-semibold tracking-[0.3em] uppercase text-primary">{s.subtitle}</span>
            )}
            {s.title && (
              <h2 className="font-heading text-3xl md:text-4xl font-bold mt-2 text-foreground">{s.title}</h2>
            )}
            <div className={`gold-divider w-20 mt-5 mb-5 ${hasImage ? "" : "mx-auto"}`} />
            {s.body && (
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{s.body}</p>
            )}
            {s.linkText && s.linkUrl && (
              <a
                href={s.linkUrl}
                target={s.linkUrl.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="inline-flex items-center mt-7 px-6 py-3 bg-gradient-gold text-charcoal font-semibold rounded-md hover:opacity-90 transition shadow-gold"
                data-testid={`link-section-${s.id}`}
              >
                {s.linkText}
              </a>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const CustomSections = ({ position }: { position: string }) => {
  const { data } = useQuery<PageSection[]>({
    queryKey: ["/api/page-sections"],
    queryFn: fetchSections,
    staleTime: 30_000,
  });

  const visible = (data || []).filter((s) => s.enabled && s.position === position);
  if (visible.length === 0) return null;

  return (
    <>
      {visible.map((s) => <SectionBlock key={s.id} s={s} />)}
    </>
  );
};

export default CustomSections;
