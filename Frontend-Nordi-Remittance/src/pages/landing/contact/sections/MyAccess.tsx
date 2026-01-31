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
    <Section id="my-access" className="py-16 lg:py-24 bg-white">
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
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
            One Account, Multiple Channels
          </h2>
          <p className="text-lg text-neutral-600">
            Access your bank account seamlessly across all our digital platforms. 
            Whether on web, mobile, or USSD - your bank is always with you.
          </p>
        </motion.div>

        {/* Platforms */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-6 mb-12"
        >
          {platforms.map((platform) => (
            <div
              key={platform.name}
              className={cn(
                "p-6 rounded-2xl border border-neutral-200",
                "hover:shadow-lg hover:border-blue-300 transition-all"
              )}
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                {platform.icon}
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">{platform.name}</h3>
              <p className="text-neutral-600 text-sm mb-4">{platform.description}</p>
              
              <ul className="space-y-2">
                {platform.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-neutral-700">
                    <Check className="w-4 h-4 text-blue-500" />
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
          <h3 className="text-xl font-bold text-neutral-900 mb-6 text-center">Digital Services</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {digitalServices.map((service) => (
              <div
                key={service.label}
                className={cn(
                  "p-4 rounded-xl bg-white text-center",
                  "hover:shadow-md transition-all cursor-pointer"
                )}
              >
                <service.icon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-semibold text-neutral-900 text-sm mb-1">{service.label}</h4>
                <p className="text-xs text-neutral-500">{service.desc}</p>
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
