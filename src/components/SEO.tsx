import { Helmet } from "react-helmet-async";

const BRAND = "M.I. Engineering Works";
const SITE = "https://miengineeringworks.com";
const DEFAULT_OG = `${SITE}/og-default.jpg`;

const DEFAULT_KEYWORDS = [
  "fasteners manufacturer Mumbai",
  "fasteners supplier India",
  "ASTM A193 Grade B7 stud bolts",
  "high tensile bolts",
  "stainless steel fasteners",
  "MS bolts manufacturer",
  "SS bolts supplier",
  "brass fasteners",
  "aluminium fasteners",
  "hex bolts Mumbai",
  "anchor bolts manufacturer",
  "foundation bolts supplier",
  "U bolts J bolts",
  "threaded rods India",
  "industrial fasteners Mumbai",
  "DIN fasteners",
  "ISO certified fasteners",
  "M.I. Engineering Works",
  "fasteners for oil and gas",
  "fasteners for aerospace",
  "fasteners for automotive",
  "fasteners for construction",
];

interface SEOProps {
  title: string;
  description: string;
  keywords?: string[];
  path?: string;
  image?: string;
  type?: "website" | "article";
}

export default function SEO({
  title,
  description,
  keywords = [],
  path = "",
  image = DEFAULT_OG,
  type = "website",
}: SEOProps) {
  const fullTitle = title.includes(BRAND) ? title : `${title} | ${BRAND}`;
  const url = `${SITE}${path}`;
  const allKeywords = [...new Set([...keywords, ...DEFAULT_KEYWORDS])].join(", ");

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={allKeywords} />
      <meta name="author" content={BRAND} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={BRAND} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Local SEO */}
      <meta name="geo.region" content="IN-MH" />
      <meta name="geo.placename" content="Mumbai" />
      <meta name="theme-color" content="#d4af37" />

      {/* JSON-LD organization */}
      <script type="application/ld+json">{JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        name: BRAND,
        url: SITE,
        logo: `${SITE}/logo.png`,
        sameAs: [],
        contactPoint: [{
          "@type": "ContactPoint",
          telephone: "+91-9819972301",
          contactType: "Sales",
          areaServed: "IN",
          availableLanguage: ["English", "Hindi"],
        }],
        address: {
          "@type": "PostalAddress",
          addressLocality: "Mumbai",
          addressRegion: "MH",
          addressCountry: "IN",
        },
      })}</script>
    </Helmet>
  );
}
