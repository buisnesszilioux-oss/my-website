// Predefined animation presets that the admin can install / unequip from the admin panel.
// Each preset returns CSS class names that get applied at runtime.

export type AnimationPreset = {
  id: string;
  label: string;
  description: string;
  type: "product" | "background";
  cardClass?: string;
  bodyClass?: string;
};

export const PRODUCT_ANIMATIONS: AnimationPreset[] = [
  { id: "none",     label: "None",          description: "No card animation.",                                  type: "product", cardClass: "" },
  { id: "lift",     label: "Lift",          description: "Smooth lift on hover with a soft shadow.",            type: "product", cardClass: "anim-card-lift" },
  { id: "tilt",     label: "Tilt",          description: "3D tilt effect when hovered.",                        type: "product", cardClass: "anim-card-tilt" },
  { id: "glow",     label: "Gold Glow",     description: "Animated golden glow border on hover.",               type: "product", cardClass: "anim-card-glow" },
  { id: "shine",    label: "Shine Sweep",   description: "Diagonal shine sweeps across the card on hover.",     type: "product", cardClass: "anim-card-shine" },
  { id: "zoom",     label: "Image Zoom",    description: "Image zooms slowly while card lifts.",                type: "product", cardClass: "anim-card-zoom" },
  { id: "pulse",    label: "Pulse Border",  description: "Border pulses in primary color.",                     type: "product", cardClass: "anim-card-pulse" },
];

export const BACKGROUND_ANIMATIONS: AnimationPreset[] = [
  { id: "none",     label: "None",                 description: "Plain background, no animation.",          type: "background", bodyClass: "" },
  { id: "gold-grid",label: "Gold Grid",            description: "Subtle moving gold grid behind content.",  type: "background", bodyClass: "anim-bg-grid" },
  { id: "particles",label: "Floating Particles",   description: "Soft floating particles in the backdrop.", type: "background", bodyClass: "anim-bg-particles" },
  { id: "aurora",   label: "Aurora Glow",          description: "Slow-shifting aurora gradient.",           type: "background", bodyClass: "anim-bg-aurora" },
  { id: "stripes",  label: "Industrial Stripes",   description: "Diagonal stripes drift across.",           type: "background", bodyClass: "anim-bg-stripes" },
];

export const findProductAnim = (id: string) =>
  PRODUCT_ANIMATIONS.find((p) => p.id === id) || PRODUCT_ANIMATIONS[0];

export const findBackgroundAnim = (id: string) =>
  BACKGROUND_ANIMATIONS.find((p) => p.id === id) || BACKGROUND_ANIMATIONS[0];
