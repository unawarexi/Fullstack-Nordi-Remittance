// ============================================================================
// TESTIMONIALS SECTION - Customer reviews and ratings
// ============================================================================

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";

// ========================
// TESTIMONIAL DATA
// ========================
interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  image: string;
  rating: number;
  text: string;
  location: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Small Business Owner",
    company: "Johnson Consulting",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    rating: 5,
    text: "Nordea Access Bank has transformed how I manage my business finances. Their business loans helped me expand to three new locations.",
    location: "New York, USA",
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Software Engineer",
    company: "Tech Corp",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 5,
    text: "The mobile app is fantastic! I can do everything from transfers to investments right from my phone. Best banking experience I've had.",
    location: "San Francisco, USA",
  },
  {
    id: 3,
    name: "Emma Williams",
    role: "Retired Teacher",
    company: "",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    rating: 5,
    text: "Their retirement planning services gave me peace of mind. The advisors really care about their customers' financial future.",
    location: "London, UK",
  },
  {
    id: 4,
    name: "David Martinez",
    role: "Restaurant Owner",
    company: "La Casa",
    image: "https://randomuser.me/api/portraits/men/52.jpg",
    rating: 5,
    text: "Quick approval for my business loan, excellent customer service, and the online banking tools are incredibly user-friendly.",
    location: "Miami, USA",
  },
  {
    id: 5,
    name: "Lisa Anderson",
    role: "Freelance Designer",
    company: "Self-employed",
    image: "https://randomuser.me/api/portraits/women/22.jpg",
    rating: 5,
    text: "As a freelancer, managing irregular income was tough. Their savings tools and budgeting features have been game-changers.",
    location: "Toronto, Canada",
  },
  {
    id: 6,
    name: "Robert Thompson",
    role: "Real Estate Investor",
    company: "Thompson Properties",
    image: "https://randomuser.me/api/portraits/men/76.jpg",
    rating: 5,
    text: "Their mortgage rates are competitive and the approval process was smooth. Highly recommend for property investments.",
    location: "Chicago, USA",
  },
];

// ========================
// RATING STARS COMPONENT
// ========================
const RatingStars: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex gap-0.5">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={cn(
          "w-4 h-4",
          i < rating ? "fill-amber-400 text-amber-400" : "text-neutral-300"
        )}
      />
    ))}
  </div>
);

// ========================
// TESTIMONIAL CARD
// ========================
interface TestimonialCardProps {
  testimonial: Testimonial;
  index: number;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay: index * 0.1 }}
    className={cn(
      "relative p-6 rounded-xl h-full",
      "bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700",
      "hover:shadow-lg dark:hover:shadow-neutral-900/50 transition-shadow duration-300"
    )}
  >
    <Quote className="absolute top-4 right-4 w-8 h-8 text-indigo-100" />
    
    <div className="flex items-center gap-3 mb-4">
      <img
        src={testimonial.image}
        alt={testimonial.name}
        className="w-12 h-12 rounded-full object-cover ring-2 ring-neutral-100 dark:ring-neutral-700"
      />
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-neutral-900 dark:text-white truncate">{testimonial.name}</h4>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
          {testimonial.role}{testimonial.company && ` • ${testimonial.company}`}
        </p>
      </div>
    </div>
    
    <RatingStars rating={testimonial.rating} />
    
    <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed line-clamp-4">
      "{testimonial.text}"
    </p>
    
    <p className="mt-3 text-xs text-neutral-400">{testimonial.location}</p>
  </motion.div>
);

// ========================
// MAIN COMPONENT
// ========================
const Testimonials: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 3;
  const totalPages = Math.ceil(testimonials.length / itemsPerPage);

  const currentTestimonials = testimonials.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  return (
    <Section background="white" className="py-12 lg:py-16">
      <Container size="xl">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-3 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 rounded-full mb-3">
              Testimonials
            </span>
            <h2 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white">
              What Our Customers Say
            </h2>
            <p className="mt-2 text-neutral-600 dark:text-neutral-300 max-w-xl">
              Real stories from real customers who trust us with their financial journey.
            </p>
          </motion.div>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className={cn(
                "p-2 rounded-lg border transition-colors",
                currentPage === 0
                  ? "bg-neutral-50 dark:bg-neutral-700/50 text-neutral-300 border-neutral-100 dark:border-neutral-700 cursor-not-allowed"
                  : "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 dark:bg-neutral-700/50"
              )}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-neutral-500 dark:text-neutral-400 min-w-[60px] text-center">
              {currentPage + 1} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage === totalPages - 1}
              className={cn(
                "p-2 rounded-lg border transition-colors",
                currentPage === totalPages - 1
                  ? "bg-neutral-50 dark:bg-neutral-700/50 text-neutral-300 border-neutral-100 dark:border-neutral-700 cursor-not-allowed"
                  : "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 dark:bg-neutral-700/50"
              )}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Testimonials Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {currentTestimonials.map((testimonial, index) => (
              <TestimonialCard
                key={testimonial.id}
                testimonial={testimonial}
                index={index}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 flex flex-wrap items-center justify-center gap-6 text-center"
        >
          <div className="flex items-center gap-2">
            <RatingStars rating={5} />
            <span className="text-sm text-neutral-600 dark:text-neutral-300">4.9/5 Average Rating</span>
          </div>
          <div className="hidden sm:block w-px h-6 bg-neutral-200" />
          <span className="text-sm text-neutral-600 dark:text-neutral-300">25,000+ Reviews</span>
          <div className="hidden sm:block w-px h-6 bg-neutral-200" />
          <span className="text-sm text-neutral-600 dark:text-neutral-300">Trustpilot Verified</span>
        </motion.div>
      </Container>
    </Section>
  );
};

export default Testimonials;
