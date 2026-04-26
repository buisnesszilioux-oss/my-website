import { Helmet } from "react-helmet-async";
import { useSiteContent } from "@/hooks/useSiteContent";

/**
 * Injects favicon + brand name updates into <head>.
 * Mounted once near the top of the App.
 */
const BrandingHead = () => {
  const { content } = useSiteContent();
  const favicon = (content["brand.favicon"] || "").trim();
  const brandName = (content["brand.name"] || "M.I. Engineering Works").trim();

  return (
    <Helmet>
      {favicon ? <link rel="icon" type="image/png" href={favicon} /> : null}
      {favicon ? <link rel="shortcut icon" href={favicon} /> : null}
      {favicon ? <link rel="apple-touch-icon" href={favicon} /> : null}
      <meta property="og:site_name" content={brandName} />
    </Helmet>
  );
};

export default BrandingHead;
