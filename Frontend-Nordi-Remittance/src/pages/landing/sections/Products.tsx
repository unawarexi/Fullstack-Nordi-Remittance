// ============================================================================
// PRODUCTS SECTION - Banking products grid
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  Wallet,
  PiggyBank,
  Home,
  Briefcase,
  TrendingUp,
  Shield,
  Globe,
  ArrowRight,
} from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";
import { Grid } from "@components/layout/Grid";

// ========================
// PRODUCTS DATA
// ========================
interface Product {
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  color: string;
  href: string;
}

const products: Product[] = [
  {
    title: "Checking Accounts",
    description: "Everyday banking with zero monthly fees",
    icon: <Wallet className="w-6 h-6" />,
    features: ["No minimum balance", "Free debit card", "Mobile check deposit"],
    color: "bg-blue-500",
    href: "/accounts/checking",
  },
  {
    title: "Savings Accounts",
    description: "Grow your money with competitive rates",
    icon: <PiggyBank className="w-6 h-6" />,
    features: ["4.5% APY", "No lock-in period", "Auto-save features"],
    color: "bg-emerald-500",
    href: "/accounts/savings",
  },
  {
    title: "Credit Cards",
    description: "Rewards and benefits on every purchase",
    icon: <CreditCard className="w-6 h-6" />,
    features: ["Up to 5% cashback", "Travel rewards", "No annual fee options"],
    color: "bg-violet-500",
    href: "/cards",
  },
  {
    title: "Home Loans",
    description: "Make your dream home a reality",
    icon: <Home className="w-6 h-6" />,
    features: ["Competitive rates", "Quick approval", "Flexible terms"],
    color: "bg-amber-50 dark:bg-amber-900/200",
    href: "/loans/home",
  },
  {
    title: "Business Banking",
    description: "Solutions for businesses of all sizes",
    icon: <Briefcase className="w-6 h-6" />,
    features: ["Business accounts", "Merchant services", "Payroll solutions"],
    color: "bg-rose-500",
    href: "/business",
  },
  {
    title: "Investments",
    description: "Build wealth for your future",
    icon: <TrendingUp className="w-6 h-6" />,
    features: ["Managed portfolios", "Retirement accounts", "Expert advice"],
    color: "bg-indigo-50 dark:bg-indigo-900/300",
    href: "/investments",
  },
  {
    title: "Insurance",
    description: "Protect what matters most",
    icon: <Shield className="w-6 h-6" />,
    features: ["Life insurance", "Home insurance", "Auto coverage"],
    color: "bg-teal-500",
    href: "/insurance",
  },
  {
    title: "International",
    description: "Banking beyond borders",
    icon: <Globe className="w-6 h-6" />,
    features: ["Multi-currency", "Low FX rates", "Global transfers"],
    color: "bg-orange-500",
    href: "/international",
  },
];

// ========================
// PRODUCT CARD COMPONENT
// ========================
interface ProductCardProps {
  product: Product;
  index: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, index }) => (
  <motion.a
    href={product.href}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay: index * 0.06 }}
    className={cn(
      "group relative p-4 sm:p-5 rounded-xl",
      "bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700",
      "hover:shadow-lg dark:hover:shadow-neutral-900/50 hover:border-neutral-200 dark:border-neutral-700 transition-all duration-300"
    )}
  >
    {/* Icon */}
    <div
      className={cn(
        "inline-flex p-2.5 sm:p-3 rounded-lg text-white mb-3 sm:mb-4",
        product.color
      )}
    >
      {React.cloneElement(product.icon as React.ReactElement, { className: "w-5 h-5 sm:w-6 sm:h-6" })}
    </div>

    {/* Content */}
    <h3 className="font-semibold text-sm sm:text-base text-neutral-900 dark:text-white group-hover:text-indigo-600 transition-colors">
      {product.title}
    </h3>
    <p className="mt-1 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">{product.description}</p>

    {/* Features */}
    <ul className="mt-4 space-y-1.5">
      {product.features.map((feature) => (
        <li
          key={feature}
          className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-300"
        >
          <div className="w-1 h-1 rounded-full bg-neutral-300" />
          {feature}
        </li>
      ))}
    </ul>

    {/* Arrow */}
    <ArrowRight
      className={cn(
        "absolute bottom-5 right-5 w-5 h-5",
        "text-neutral-300 group-hover:text-indigo-500",
        "transform group-hover:translate-x-1 transition-all"
      )}
    />
  </motion.a>
);

// ========================
// MAIN COMPONENT
// ========================
const Products: React.FC = () => {
  return (
    <Section background="light" className="py-8 sm:py-12 lg:py-16">
      <Container size="xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="inline-block px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 rounded-full mb-2 sm:mb-3">
            Products & Services
          </span>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white">
            Everything You Need in One Place
          </h2>
          <p className="mt-2 text-xs sm:text-sm md:text-base text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
            From everyday banking to long-term investments, we have the right solutions for every stage of life.
          </p>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {products.map((product, index) => (
            <ProductCard key={product.title} product={product} index={index} />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 text-center"
        >
          <a
            href="/products"
            className={cn(
              "inline-flex items-center gap-2 text-sm font-medium text-indigo-600",
              "hover:text-indigo-700 transition-colors"
            )}
          >
            View All Products
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </Container>
    </Section>
  );
};

export default Products;
