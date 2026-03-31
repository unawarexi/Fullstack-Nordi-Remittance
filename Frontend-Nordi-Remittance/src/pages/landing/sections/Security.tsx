// ============================================================================
// SECURITY SECTION - Banking security features
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Lock,
  Fingerprint,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Smartphone,
  Key,
} from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";
import { Grid } from "@components/layout/Grid";

// ========================
// SECURITY FEATURES DATA
// ========================
interface SecurityFeature {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const securityFeatures: SecurityFeature[] = [
  {
    title: "256-bit Encryption",
    description: "Bank-grade encryption protects all your data and transactions.",
    icon: <Lock className="w-5 h-5" />,
  },
  {
    title: "Two-Factor Authentication",
    description: "Extra layer of security with SMS, email, or authenticator app.",
    icon: <Smartphone className="w-5 h-5" />,
  },
  {
    title: "Biometric Login",
    description: "Use fingerprint or face recognition for quick, secure access.",
    icon: <Fingerprint className="w-5 h-5" />,
  },
  {
    title: "Real-time Monitoring",
    description: "24/7 fraud detection systems monitor every transaction.",
    icon: <Eye className="w-5 h-5" />,
  },
  {
    title: "Instant Alerts",
    description: "Get notified immediately of any suspicious activity.",
    icon: <AlertTriangle className="w-5 h-5" />,
  },
  {
    title: "Secure Card Lock",
    description: "Instantly lock/unlock your card from the mobile app.",
    icon: <Key className="w-5 h-5" />,
  },
];

const certifications = [
  { name: "PCI DSS Certified", level: "Level 1" },
  { name: "SOC 2 Type II", level: "Compliant" },
  { name: "ISO 27001", level: "Certified" },
  { name: "GDPR", level: "Compliant" },
];

// ========================
// FEATURE CARD COMPONENT
// ========================
interface FeatureCardProps {
  feature: SecurityFeature;
  index: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ feature, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay: index * 0.08 }}
    className={cn(
      "flex items-start gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl",
      "bg-slate-800 border border-slate-700",
      "hover:bg-slate-750 hover:border-slate-600 transition-all duration-300"
    )}
  >
    <div className="flex-shrink-0 p-3 rounded-xl bg-indigo-500/10 text-indigo-400 shadow-inner group-hover:scale-110 transition-transform">
      {React.isValidElement(feature.icon) 
        ? React.cloneElement(feature.icon as React.ReactElement, { className: "w-6 h-6" })
        : feature.icon}
    </div>
    <div>
      <h4 className="text-base sm:text-lg font-black text-white uppercase tracking-tight italic">{feature.title}</h4>
      <p className="mt-2 text-[11px] sm:text-sm text-slate-400 font-bold opacity-75 leading-relaxed">
        {feature.description}
      </p>
    </div>
  </motion.div>
);

// ========================
// MAIN COMPONENT
// ========================
const Security: React.FC = () => {
  return (
    <Section background="dark" className="py-8 sm:py-12 lg:py-16 bg-slate-900">
      <Container size="xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-indigo-400 bg-indigo-50 dark:bg-indigo-900/300/10 rounded-full mb-3 sm:mb-4">
              <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              Bank-Grade Security
            </span>
            
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
              Your Security Is Our Top Priority
            </h2>
            
            <p className="mt-2 sm:mt-3 text-sm md:text-base text-slate-400 leading-relaxed">
              We employ industry-leading security measures to protect your money and personal
              information. Our multi-layered security approach ensures your accounts stay safe.
            </p>

            {/* Certifications */}
            <div className="mt-6 flex flex-wrap gap-3">
              {certifications.map((cert) => (
                <div
                  key={cert.name}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="text-xs font-medium text-white">{cert.name}</span>
                    <span className="ml-1.5 text-xs text-slate-500">{cert.level}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-8">
              <a
                href="/security"
                className={cn(
                  "inline-flex items-center gap-2 px-5 py-2.5 rounded-lg",
                  "bg-indigo-600 text-white font-medium text-sm",
                  "hover:bg-indigo-700 transition-colors"
                )}
              >
                Learn About Our Security
              </a>
            </div>
          </motion.div>

          {/* Right Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {securityFeatures.map((feature, index) => (
              <FeatureCard key={feature.title} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default Security;
