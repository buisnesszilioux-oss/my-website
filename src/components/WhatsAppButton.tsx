import { MessageCircle } from "lucide-react";

const PHONE = "919819972301";
const MESSAGE = encodeURIComponent("Hello M.I. Engineering Works, I would like an enquiry about your fasteners.");

const WhatsAppButton = () => {
  const href = `https://wa.me/${PHONE}?text=${MESSAGE}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      data-testid="button-whatsapp"
      className="fixed z-[60] bottom-5 right-5 md:bottom-7 md:right-7 group"
    >
      <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-50 animate-ping" />
      <span className="relative w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#25D366] flex items-center justify-center shadow-2xl ring-4 ring-white/20 transition-transform group-hover:scale-110">
        <MessageCircle className="w-7 h-7 md:w-8 md:h-8 text-white" fill="white" />
      </span>
      <span className="hidden md:block absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap bg-charcoal text-white text-xs font-semibold px-3 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition pointer-events-none">
        Chat on WhatsApp
      </span>
    </a>
  );
};

export default WhatsAppButton;
