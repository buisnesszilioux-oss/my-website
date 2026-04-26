import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

interface Review {
  name: string;
  role: string;
  company: string;
  avatar: string;
  rating: number;
  text: string;
  date: string;
}

const reviews: Review[] = [
  {
    name: "Rajesh Sharma",
    role: "Procurement Manager",
    company: "Tata Projects Ltd.",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 5,
    text: "Excellent quality B7 stud bolts. We've been sourcing from M.I. Engineering for 3 years now. Consistent quality, proper test certificates, and on-time delivery every single time.",
    date: "15 Mar 2026",
  },
  {
    name: "Ankit Patel",
    role: "Site Engineer",
    company: "L&T Hydrocarbon",
    avatar: "https://randomuser.me/api/portraits/men/45.jpg",
    rating: 5,
    text: "The threaded rods and anchor bolts we ordered were perfectly manufactured to spec. Great surface finish and thread quality. Highly recommended for critical applications.",
    date: "02 Feb 2026",
  },
  {
    name: "Priya Deshmukh",
    role: "Purchase Head",
    company: "Reliance Industries",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    rating: 5,
    text: "M.I. Engineering Works delivers premium fasteners at competitive prices. Their heavy hex bolts passed all our QA checks without any issues. Will order again.",
    date: "20 Jan 2026",
  },
  {
    name: "Mohammed Iqbal",
    role: "Project Manager",
    company: "ONGC",
    avatar: "https://randomuser.me/api/portraits/men/52.jpg",
    rating: 4,
    text: "Reliable supplier for ASTM A193 Grade B7 fasteners. Good communication and they accommodate custom length requirements. Packaging could be slightly better for export orders.",
    date: "10 Dec 2025",
  },
  {
    name: "Suresh Kulkarni",
    role: "Maintenance Head",
    company: "BPCL Refinery",
    avatar: "https://randomuser.me/api/portraits/men/61.jpg",
    rating: 5,
    text: "We trust M.I. Engineering for all our refinery shutdown fastener requirements. Quick turnaround, genuine material with mill test certificates. Top-notch service!",
    date: "28 Nov 2025",
  },
  {
    name: "Kavita Nair",
    role: "Vendor Manager",
    company: "Thermax Ltd.",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    rating: 5,
    text: "Outstanding quality socket head cap screws and set screws. Dimensional accuracy is spot on. M.I. Engineering is now our preferred vendor for alloy steel fasteners.",
    date: "05 Oct 2025",
  },
];

const ReviewsSection = () => {
  return (
    <section className="py-16 bg-secondary/20">
      <div className="container">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-2 block">
            Testimonials
          </span>
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
            What Our <span className="text-gradient-gold">Clients Say</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto">
            Trusted by leading engineering companies across India for premium ASTM A193 Grade B7 fasteners.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <motion.div
              key={review.name}
              className="bg-card rounded-xl border border-border p-6 shadow-elegant hover:shadow-gold hover:border-primary/30 transition-all duration-300 flex flex-col"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              whileHover={{ y: -4 }}
            >
              <Quote className="w-8 h-8 text-primary/20 mb-3" />

              {/* Stars */}
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, si) => (
                  <Star
                    key={si}
                    className={`w-4 h-4 ${si < review.rating ? "text-primary fill-primary" : "text-muted-foreground/30"}`}
                  />
                ))}
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-4">
                "{review.text}"
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <motion.img
                  src={review.avatar}
                  alt={review.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-primary/20"
                  loading="lazy"
                  whileHover={{ scale: 1.1 }}
                />
                <div>
                  <p className="text-sm font-semibold text-foreground">{review.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {review.role}, {review.company}
                  </p>
                </div>
                <span className="ml-auto text-xs text-muted-foreground/50">{review.date}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
