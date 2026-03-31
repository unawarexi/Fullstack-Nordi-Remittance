// ============================================================================
// MY ACCESS DIGITAL BANKING SECTION
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import {
  Globe,
  Laptop,
  Smartphone,
  Monitor,
  ArrowRight,
  Check,
  Shield,
  RefreshCw,
  CreditCard,
  FileText,
  Settings,
  BarChart,
} from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";
import { Button } from "@components/ui/Button";

// ========================
// PLATFORMS
// ========================
interface Platform {
  icon: React.ReactNode;
  name: string;
  description: string;
  features: string[];
}

const platforms: Platform[] = [
  {
    icon: <Laptop className="w-8 h-8" />,
    name: "Internet Banking",
    description: "Full-featured banking from your computer",
    features: ["Account management", "Bulk transfers", "Statement downloads", "Scheduled payments"],
  },
  {
    icon: <Smartphone className="w-8 h-8" />,
    name: "Mobile App",
    description: "Banking on the go with our iOS & Android apps",
    features: ["Quick transfers", "Card controls", "Biometric login", "Bill payments"],
  },
  {
    icon: <Monitor className="w-8 h-8" />,
    name: "USSD Banking",
    description: "Bank without internet using *901#",
    features: ["Balance check", "Airtime purchase", "Fund transfer", "Works offline"],
  },
];

// ========================
// DIGITAL SERVICES
// ========================
const digitalServices = [
  { icon: RefreshCw, label: "Real-time Sync", desc: "All platforms stay updated" },
  { icon: CreditCard, label: "Card Management", desc: "Manage all your cards" },
  { icon: FileText, label: "E-Statements", desc: "Paperless statements" },
  { icon: BarChart, label: "Spend Analytics", desc: "Track your finances" },
  { icon: Settings, label: "Customization", desc: "Personalize your dashboard" },
  { icon: Shield, label: "Security Center", desc: "Control your security" },
];

// ========================
// MAIN COMPONENT
// ========================
const MyAccess: React.FC = () => {
  return (
    <Section id="my-access" className="py-16 lg:py-24 bg-white dark:bg-neutral-800">
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
            MyAccess Digital Banking
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
            One Account, Multiple Channels
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-300">
            Access your bank account seamlessly across all our digital platforms. 
            Whether on web, mobile, or USSD - your bank is always with you.
          </p>
        </motion.div>

        {/* Platforms */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-20"
        >
          {platforms.map((platform) => (
            <div
              key={platform.name}
              className={cn(
                "p-8 rounded-[2.5rem] border border-neutral-100 dark:border-neutral-700 shadow-xl bg-white dark:bg-neutral-800 group transition-all duration-500",
                "hover:shadow-2xl dark:hover:shadow-neutral-900/50 hover:border-blue-500/30"
              )}
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-transform duration-500">
                {React.isValidElement(platform.icon) 
                  ? React.cloneElement(platform.icon as React.ReactElement, { className: "w-8 h-8 sm:w-10 sm:h-10" })
                  : platform.icon}
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white mb-3 uppercase tracking-tight italic">{platform.name}</h3>
              <p className="text-[13px] sm:text-sm text-neutral-500 dark:text-neutral-400 font-bold leading-relaxed mb-8">{platform.description}</p>
              
              <ul className="space-y-4">
                {platform.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-[13px] sm:text-sm text-neutral-600 dark:text-neutral-300 font-bold group/feat">
                    <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 group-hover/feat:scale-110 transition-transform">
                      <Check className="w-3 h-3 text-blue-500 font-black" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </motion.div>

        {/* Digital Services Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200"
        >
          <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-6 text-center">Digital Services</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {digitalServices.map((service) => (
              <div
                key={service.label}
                className={cn(
                  "p-4 rounded-xl bg-white dark:bg-neutral-800 text-center",
                  "hover:shadow-md transition-all cursor-pointer"
                )}
              >
                <service.icon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-semibold text-neutral-900 dark:text-white text-sm mb-1">{service.label}</h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">{service.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <div className="inline-flex flex-col sm:flex-row gap-4">
            <Button variant="primary" className="bg-blue-600 hover:bg-blue-700">
              <Globe className="w-4 h-4 mr-2" />
              Access Internet Banking
            </Button>
            <Button variant="outline" className="border-blue-300 text-blue-600 hover:bg-blue-50">
              <Smartphone className="w-4 h-4 mr-2" />
              Download Mobile App
            </Button>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
};

export default MyAccess;
