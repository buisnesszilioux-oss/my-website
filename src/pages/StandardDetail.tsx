import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { api, type Standard } from "@/lib/api";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { Helmet } from "react-helmet-async";

const StandardDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: s, isLoading } = useQuery<Standard>({ queryKey: ["/api/standards", slug], queryFn: () => api(`/api/standards/${slug}`) });

  if (isLoading) return (
    <PageTransition><Header /><div className="min-h-[60vh] flex items-center justify-center">Loading…</div><Footer /></PageTransition>
  );

  if (!s) return (
    <PageTransition>
      <Header />
      <div className="min-h-[60vh] flex items-center justify-center text-center">
        <div>
          <h1 className="text-2xl font-bold">Standard Not Found</h1>
          <Link to="/standards" className="text-primary mt-4 inline-block">← Back to Standards</Link>
        </div>
      </div>
      <Footer />
    </PageTransition>
  );

  return (
    <PageTransition>
      <Helmet>
        <title>{`${s.code} — ${s.name} | M.I. Engineering Works`}</title>
        <meta name="description" content={s.description.slice(0, 160)} />
      </Helmet>
      <Header />

      <section className="relative h-[40vh] md:h-[50vh] overflow-hidden bg-gradient-dark">
        {s.image && <img src={s.image} alt={s.code} className="absolute inset-0 w-full h-full object-cover opacity-40" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="container relative z-10 h-full flex flex-col justify-end pb-12 text-primary-foreground">
          <Link to="/standards" data-testid="link-back-standards" className="inline-flex items-center gap-1 text-primary mb-4 hover:underline w-fit">
            <ArrowLeft className="w-4 h-4" /> Back to Standards
          </Link>
          <div className="text-sm tracking-[0.3em] uppercase text-primary mb-2">{s.region}</div>
          <h1 className="font-heading text-4xl md:text-6xl font-bold">{s.code}</h1>
          <p className="text-lg md:text-xl text-primary-foreground/90 mt-2">{s.name}</p>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-background">
        <div className="container max-w-5xl">
          <p className="text-base md:text-lg text-foreground/90 leading-relaxed">{s.description}</p>

          {s.scope && (
            <div className="mt-10">
              <h2 className="font-heading text-2xl font-bold text-foreground mb-3">Scope</h2>
              <p className="text-muted-foreground leading-relaxed">{s.scope}</p>
            </div>
          )}

          {s.examples?.length > 0 && (
            <div className="mt-10">
              <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Key Specifications</h2>
              <ul className="grid md:grid-cols-2 gap-3">
                {s.examples.map((e, i) => (
                  <li key={i} className="flex items-start gap-2 bg-card rounded-md border border-border p-4">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{e}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8 mt-10">
            {s.applications?.length > 0 && (
              <div>
                <h2 className="font-heading text-xl font-bold text-foreground mb-3">Typical Applications</h2>
                <ul className="space-y-2">
                  {s.applications.map((a, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />{a}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {s.materials?.length > 0 && (
              <div>
                <h2 className="font-heading text-xl font-bold text-foreground mb-3">Material Grades</h2>
                <ul className="space-y-2">
                  {s.materials.map((m, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />{m}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </PageTransition>
  );
};

export default StandardDetail;
