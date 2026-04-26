import { useEffect } from "react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { findProductAnim, findBackgroundAnim } from "@/lib/animations";

export function useActiveAnimations() {
  const { content } = useSiteContent();
  const productId = content["animations.product"] || "lift";
  const bgId = content["animations.background"] || "none";
  const product = findProductAnim(productId);
  const background = findBackgroundAnim(bgId);
  return { product, background };
}

/**
 * Mounts the active background animation onto <body>.
 * Call once near the App root.
 */
export function useApplyBackgroundAnimation() {
  const { background } = useActiveAnimations();
  useEffect(() => {
    const cls = background.bodyClass;
    if (!cls) return;
    document.body.classList.add(cls);
    return () => { document.body.classList.remove(cls); };
  }, [background.bodyClass]);
}
