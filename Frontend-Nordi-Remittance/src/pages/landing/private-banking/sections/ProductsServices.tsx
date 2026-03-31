// ============================================================================
// PRIVATE PRODUCTS & SERVICES SECTION
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  Home,
  Plane,
  Shield,
  ArrowRight,
  Check,
  CreditCard,
  Building2,
  FileText,
  Gem,
  DollarSign,
  Lock,
} from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";
import { Button } from "@components/ui/Button";

// ========================
// PRODUCT CATEGORIES
// ========================
interface ProductCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  products: string[];
}

const productCategories: ProductCategory[] = [
  {
    id: "credit",
    name: "Private Credit Solutions",
    description: "Flexible lending tailored to high-net-worth individuals",
    icon: <DollarSign className="w-6 h-6" />,
    color: "bg-blue-500",
    products: [
      "Securities-backed lending",
      "Real estate financing",
      "Aircraft & yacht financing",
      "Art & collectibles loans",
    ],
  },
  {
    id: "estate",
    name: "Estate Planning",
    description: "Comprehensive wealth transfer and estate strategies",
    icon: <FileText className="w-6 h-6" />,
    color: "bg-violet-500",
    products: [
      "Trust services",
      "Succession planning",
      "Tax optimization",
      "Charitable giving",
    ],
  },
  {
    id: "insurance",
    name: "Private Insurance",
    description: "Exclusive insurance solutions for valuable assets",
    icon: <Shield className="w-6 h-6" />,
    color: "bg-emerald-500",
    products: [
      "High-value property",
      "Art & collections",
      "Liability coverage",
      "Key person insurance",
    ],
  },
  {
    id: "lifestyle",
    name: "Lifestyle Services",
    description: "Concierge and lifestyle management services",
    icon: <Gem className="w-6 h-6" />,
    color: "bg-amber-50 dark:bg-amber-900/200",
    products: [
      "Travel concierge",
      "Event access",
      "Property acquisition",
      "Personal security",
    ],
  },
];

// ========================
// PREMIUM SERVICES
// ========================
const premiumServices = [
  { icon: Plane, name: "Private Aviation Access", description: "Charter arrangements & jet cards" },
  { icon: Home, name: "Real Estate Advisory", description: "Luxury property acquisition" },
  { icon: Building2, name: "Business Advisory", description: "M&A and corporate services" },
  { icon: Lock, name: "Safe Custody", description: "Secure asset storage" },
];

// ========================
// MAIN COMPONENT
// ========================
const ProductsServices: React.FC = () => {
  return (
    <Section id="products-services" className="py-16 lg:py-24 bg-neutral-50 dark:bg-neutral-700/50">
      <Container>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-sm font-medium mb-4">
            <Briefcase className="w-4 h-4" />
            Products & Services
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
            Comprehensive Private Banking Solutions
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-300">
            A complete suite of financial products and lifestyle services 
            designed exclusively for private banking clients.
          </p>
        </motion.div>

        {/* Product Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 mb-12 sm:mb-20">
          {productCategories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={cn(
                "group relative p-6 sm:p-10 rounded-3xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm transition-all duration-500",
                "hover:shadow-2xl hover:border-violet-400 hover:-translate-y-1"
              )}
            >
              <div className={cn("w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-white mb-6 sm:mb-8 shadow-lg group-hover:scale-110 transition-transform", category.color)}>
                {React.isValidElement(category.icon) 
                  ? React.cloneElement(category.icon as React.ReactElement, { className: "w-6 h-6 sm:w-8 sm:h-8" })
                  : category.icon}
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white mb-2 sm:mb-3 uppercase tracking-tight leading-tight">{category.name}</h3>
              <p className="text-[13px] sm:text-sm text-neutral-500 dark:text-neutral-400 font-medium mb-6 sm:mb-8 leading-relaxed">{category.description}</p>

              <ul className="space-y-3 sm:space-y-4 mb-8 sm:mb-12">
                {category.products.map((product) => (
                  <li key={product} className="flex items-center gap-3 group/item">
                    <div className="w-5 h-5 rounded-full bg-amber-400/10 flex items-center justify-center shrink-0 group-hover/item:scale-110 transition-transform">
                      <Check className="w-3 h-3 text-amber-600 font-bold" />
                    </div>
                    <span className="text-[13px] sm:text-sm text-neutral-600 dark:text-neutral-300 font-bold group-hover/item:text-neutral-900 dark:group-hover/item:text-white transition-colors">{product}</span>
                  </li>
                ))}
              </ul>

              <Button variant="outline" className="w-full py-4 rounded-2xl border-2 font-bold group-hover:bg-violet-600 group-hover:border-violet-600 group-hover:text-white transition-all">
                Explore Solutions
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Premium Services */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-6 sm:p-12 rounded-[2rem] bg-neutral-900 text-white shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full -mr-32 -mt-32 blur-[80px]" />
          
          <div className="text-center mb-10 sm:mb-16 relative z-10">
            <h3 className="text-2xl sm:text-4xl font-black mb-3 sm:mb-4 uppercase tracking-tighter italic">Premium Lifestyle Services</h3>
            <p className="text-sm sm:text-lg text-neutral-400 font-medium">Global concierge and exclusive privileges for legacy members</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16 relative z-10">
            {premiumServices.map((service, index) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="p-6 rounded-3xl bg-white/5 border border-white/10 text-center hover:bg-white/10 transition-all group scale-100 hover:scale-105"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-2xl bg-amber-400/10 text-amber-400 flex items-center justify-center mb-4 sm:mb-5 group-hover:scale-110 group-hover:bg-amber-400 group-hover:text-neutral-900 transition-all shadow-inner">
                  <service.icon className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <h4 className="font-black text-[13px] sm:text-sm mb-1.5 uppercase tracking-tight">{service.name}</h4>
                <p className="text-[10px] sm:text-[11px] text-neutral-400 font-bold leading-tight uppercase tracking-widest">{service.description}</p>
              </motion.div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
            <Button variant="primary" size="lg" className="w-full sm:w-auto bg-amber-400 hover:bg-amber-500 text-neutral-900 font-bold py-4 px-10 shadow-xl shadow-amber-400/20">
              <ArrowRight className="w-5 h-5 mr-3" />
              Request Catalog
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto border-white/20 text-white hover:bg-white/5 font-bold py-4 px-10">
              Speak to Concierge
            </Button>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
};

export default ProductsServices;
