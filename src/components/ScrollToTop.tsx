import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // Wait for page to render, then scroll to the section
      setTimeout(() => {
        const el = document.getElementById(hash.replace("#", ""));
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      window.scrollTo({ top: 0, left: 0 });
    }
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
