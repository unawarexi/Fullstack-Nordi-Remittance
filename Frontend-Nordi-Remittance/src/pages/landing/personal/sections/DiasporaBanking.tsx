// ============================================================================
// DIASPORA BANKING SECTION - Personal Banking
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import {
  Globe,
  Send,
  Banknote,
  Building2,
  CreditCard,
  ArrowRight,
  Check,
  Shield,
  Clock,
  Percent,
  Users,
  Home,
} from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";
import { Button } from "@components/ui/Button";

// ========================
// DIASPORA SERVICES DATA
// ========================
interface DiasporaService {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  features: string[];
  cta: string;
}

const diasporaServices: DiasporaService[] = [
  {
    id: "remittance",
    name: "International Money Transfer",
    description: "Send money home quickly and securely at competitive rates",
    icon: <Send className="w-6 h-6" />,
    color: "bg-blue-500",
    features: [
      "Transfer to 100+ countries",
      "Real-time exchange rates",
      "Multiple delivery options",
      "Track transfers in real-time",
      "No hidden fees",
    ],
    cta: "Send Money",
  },
  {
    id: "forex",
    name: "Foreign Currency Accounts",
    description: "Hold and manage multiple currencies in one place",
    icon: <Banknote className="w-6 h-6" />,
    color: "bg-emerald-500",
    features: [
      "Hold 15+ currencies",
      "Competitive FX rates",
      "Free internal transfers",
      "Currency alerts",
      "Multi-currency card",
    ],
    cta: "Open Account",
  },
  {
    id: "home-purchase",
    name: "Home Country Mortgage",
    description: "Finance property purchases in your home country",
    icon: <Home className="w-6 h-6" />,
    color: "bg-amber-50 dark:bg-amber-900/200",
    features: [
      "Competitive mortgage rates",
      "Remote application process",
      "Long repayment terms",
      "Local currency or USD",
      "Property advisory services",
    ],
    cta: "Apply Now",
  },
  {
    id: "investment",
    name: "Cross-Border Investments",
    description: "Grow your wealth with global investment opportunities",
    icon: <Building2 className="w-6 h-6" />,
    color: "bg-violet-500",
    features: [
      "Access global markets",
      "Tax-efficient structures",
      "Expert advisory",
      "Portfolio diversification",
      "Regular reporting",
    ],
    cta: "Start Investing",
  },
];

// ========================
// TRANSFER RATES
// ========================
const transferRates = [
  { corridor: "USA → Nigeria", rate: "$1 = ₦1,550", fee: "$3.99" },
  { corridor: "UK → India", rate: "£1 = ₹105", fee: "£2.99" },
  { corridor: "Canada → Philippines", rate: "C$1 = ₱42", fee: "C$4.99" },
  { corridor: "EU → Ghana", rate: "€1 = ₵14.2", fee: "€2.99" },
];

// ========================
// WHY CHOOSE US
// ========================
const benefits = [
  {
    icon: Clock,
    title: "Same-Day Delivery",
    description: "Money arrives within hours",
  },
  {
    icon: Percent,
    title: "Best Rates",
    description: "Competitive exchange rates",
  },
  {
    icon: Shield,
    title: "100% Secure",
    description: "Bank-grade security",
  },
  {
    icon: Users,
    title: "24/7 Support",
    description: "Multilingual assistance",
  },
];

// ========================
// SERVICE CARD COMPONENT
// ========================
interface ServiceCardProps {
  service: DiasporaService;
  index: number;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay: index * 0.1 }}
    className={cn(
      "relative flex flex-col h-full p-6 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700",
      "hover:shadow-lg dark:hover:shadow-neutral-900/50 hover:border-neutral-300 transition-all duration-300"
    )}
  >
    {/* Icon */}
    <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center text-white mb-4", service.color)}>
      {service.icon}
    </div>

    {/* Content */}
    <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">{service.name}</h3>
    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">{service.description}</p>

    {/* Features */}
    <ul className="space-y-2 flex-1 mb-6">
      {service.features.map((feature) => (
        <li key={feature} className="flex items-start gap-2">
          <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
          <span className="text-sm text-neutral-600 dark:text-neutral-300">{feature}</span>
        </li>
      ))}
    </ul>

    {/* CTA */}
    <Button variant="primary" className="w-full bg-indigo-600 hover:bg-indigo-700">
      {service.cta}
      <ArrowRight className="w-4 h-4 ml-2" />
    </Button>
  </motion.div>
);

// ========================
// MAIN COMPONENT
// ========================
const DiasporaBanking: React.FC = () => {
  return (
    <Section id="diaspora-banking" background="light" className="py-16 lg:py-24">
      <Container>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-4">
            <Globe className="w-4 h-4" />
            Diaspora Banking
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
            Stay Connected To Home, Wherever You Are
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-300">
            Comprehensive banking solutions designed for the global citizen. 
            Send money, invest, and manage finances across borders with ease.
          </p>
        </motion.div>

        {/* Benefits Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
        >
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="text-center p-4 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
            >
              <div className="w-10 h-10 mx-auto rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
                <benefit.icon className="w-5 h-5" />
              </div>
              <p className="font-semibold text-neutral-900 dark:text-white text-sm">{benefit.title}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{benefit.description}</p>
            </div>
          ))}
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Services Grid */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {diasporaServices.map((service, index) => (
              <ServiceCard key={service.id} service={service} index={index} />
            ))}
          </div>

          {/* Live Rates Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-6 rounded-2xl bg-indigo-900 text-white h-full"
            >
              <h3 className="text-xl font-semibold mb-2">Live Transfer Rates</h3>
              <p className="text-sm text-indigo-200 mb-6">
                Updated every 60 seconds
              </p>

              <div className="space-y-4">
                {transferRates.map((rate) => (
                  <div
                    key={rate.corridor}
                    className="p-4 rounded-xl bg-white/10 border border-white/10"
                  >
                    <p className="text-sm text-indigo-200 mb-1">{rate.corridor}</p>
                    <p className="text-xl font-bold text-amber-400">{rate.rate}</p>
                    <p className="text-xs text-indigo-300">Fee: {rate.fee}</p>
                  </div>
                ))}
              </div>

              <Button variant="primary" className="w-full mt-6 bg-amber-50 dark:bg-amber-900/200 hover:bg-amber-600">
                Calculate Transfer
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Countries Supported */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center p-6 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
        >
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">Send money to 100+ countries worldwide</p>
          <div className="flex flex-wrap justify-center gap-2">
            {["🇳🇬", "🇬🇭", "🇰🇪", "🇮🇳", "🇵🇭", "🇲🇽", "🇨🇴", "🇵🇰", "🇧🇩", "🇪🇬", "🇿🇦", "🇧🇷"].map((flag, i) => (
              <span key={i} className="text-2xl">{flag}</span>
            ))}
            <span className="text-sm text-neutral-400 self-center">+88 more</span>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
};

export default DiasporaBanking;
