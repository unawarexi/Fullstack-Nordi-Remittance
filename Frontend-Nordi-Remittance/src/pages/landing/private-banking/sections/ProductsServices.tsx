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
    color: "bg-amber-500",
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
    <Section id="products-services" className="py-16 lg:py-24 bg-neutral-50">
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
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
            Comprehensive Private Banking Solutions
          </h2>
          <p className="text-lg text-neutral-600">
            A complete suite of financial products and lifestyle services 
            designed exclusively for private banking clients.
          </p>
        </motion.div>

        {/* Product Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {productCategories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={cn(
                "group relative p-6 rounded-2xl bg-white border border-neutral-200",
                "hover:shadow-lg transition-all duration-300"
              )}
            >
              <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center text-white mb-4", category.color)}>
                {category.icon}
              </div>

              <h3 className="text-xl font-semibold text-neutral-900 mb-2">{category.name}</h3>
              <p className="text-sm text-neutral-500 mb-4">{category.description}</p>

              <ul className="space-y-2 mb-6">
                {category.products.map((product) => (
                  <li key={product} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-500" />
                    <span className="text-sm text-neutral-600">{product}</span>
                  </li>
                ))}
              </ul>

              <Button variant="outline" className="w-full">
                Learn More
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Premium Services */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-8 rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-800 text-white"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2">Premium Lifestyle Services</h3>
            <p className="text-neutral-400">Exclusive services available to private banking members</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {premiumServices.map((service, index) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="p-4 rounded-xl bg-white/5 border border-white/10 text-center hover:bg-white/10 transition-colors"
              >
                <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                  <service.icon className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-sm mb-1">{service.name}</h4>
                <p className="text-xs text-neutral-400">{service.description}</p>
              </motion.div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="primary" className="bg-amber-500 hover:bg-amber-600 text-neutral-900">
              Request Service Catalog
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
              Speak to Concierge
            </Button>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
};

export default ProductsServices;
