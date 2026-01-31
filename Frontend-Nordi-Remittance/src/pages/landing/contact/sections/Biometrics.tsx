// ============================================================================
// BIOMETRICS SECTION
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import {
  Fingerprint,
  ScanFace,
  Eye,
  Shield,
  ArrowRight,
  Check,
  Smartphone,
  Lock,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";
import { Button } from "@components/ui/Button";

// ========================
// BIOMETRIC TYPES
// ========================
interface BiometricType {
  icon: React.ReactNode;
  name: string;
  description: string;
  useCases: string[];
  color: string;
}

const biometricTypes: BiometricType[] = [
  {
    icon: <Fingerprint className="w-8 h-8" />,
    name: "Fingerprint",
    description: "Secure authentication using your unique fingerprint pattern",
    useCases: ["Mobile app login", "Transaction approval", "ATM access"],
    color: "bg-blue-500",
  },
  {
    icon: <ScanFace className="w-8 h-8" />,
    name: "Face Recognition",
    description: "Quick and secure verification using facial biometrics",
    useCases: ["App access", "Payment verification", "Identity confirmation"],
    color: "bg-violet-500",
  },
  {
    icon: <Eye className="w-8 h-8" />,
    name: "Iris Scanning",
    description: "Premium security with advanced iris recognition technology",
    useCases: ["High-value transactions", "Corporate banking", "Vault access"],
    color: "bg-emerald-500",
  },
];

// ========================
// ENROLLMENT STEPS
// ========================
const enrollmentSteps = [
  {
    step: 1,
    title: "Visit a Branch",
    description: "Go to any branch with valid ID",
  },
  {
    step: 2,
    title: "Complete Verification",
    description: "Provide biometric samples",
  },
  {
    step: 3,
    title: "Get Activated",
    description: "Start using biometric features",
  },
];

// ========================
// SECURITY FEATURES
// ========================
const securityFeatures = [
  "Military-grade encryption",
  "Data stored locally on device",
  "No biometric data on servers",
  "Compliant with CBN guidelines",
];

// ========================
// MAIN COMPONENT
// ========================
const Biometrics: React.FC = () => {
  return (
    <Section id="biometrics" className="py-16 lg:py-24 bg-white">
      <Container>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-sm font-medium mb-4">
            <Fingerprint className="w-4 h-4" />
            Biometric Authentication
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
            Secure Banking with Your Biometrics
          </h2>
          <p className="text-lg text-neutral-600">
            Your fingerprint, face, and iris are your most secure passwords. 
            Enjoy seamless, passwordless authentication across all our channels.
          </p>
        </motion.div>

        {/* Biometric Types */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-6 mb-12"
        >
          {biometricTypes.map((type) => (
            <div
              key={type.name}
              className={cn(
                "p-6 rounded-2xl border border-neutral-200",
                "hover:shadow-lg hover:border-violet-300 transition-all"
              )}
            >
              <div className={cn("w-16 h-16 rounded-2xl text-white flex items-center justify-center mb-4", type.color)}>
                {type.icon}
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">{type.name}</h3>
              <p className="text-neutral-600 text-sm mb-4">{type.description}</p>
              
              <div className="space-y-2">
                <p className="text-xs font-medium text-neutral-500 uppercase">Use Cases:</p>
                {type.useCases.map((use) => (
                  <div key={use} className="flex items-center gap-2 text-sm text-neutral-700">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    {use}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Enrollment & Security */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Enrollment Steps */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-6 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200"
          >
            <h3 className="text-xl font-bold text-neutral-900 mb-6">How to Enroll</h3>
            <div className="space-y-4">
              {enrollmentSteps.map((item, index) => (
                <div key={item.step} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                    {item.step}
                  </div>
                  <div className="flex-1 pb-4 border-b border-violet-200 last:border-0">
                    <h4 className="font-semibold text-neutral-900">{item.title}</h4>
                    <p className="text-sm text-neutral-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="primary" className="w-full mt-6 bg-violet-600 hover:bg-violet-700">
              <Smartphone className="w-4 h-4 mr-2" />
              Enroll via Mobile App
            </Button>
          </motion.div>

          {/* Security & Privacy */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-6 rounded-2xl bg-neutral-900 text-white"
          >
            <div className="flex items-center gap-2 mb-6">
              <Shield className="w-6 h-6 text-emerald-400" />
              <h3 className="text-xl font-bold">Security & Privacy</h3>
            </div>

            <p className="text-neutral-300 mb-6">
              Your biometric data is your most personal information. 
              We use industry-leading security measures to protect it.
            </p>

            <ul className="space-y-3 mb-6">
              {securityFeatures.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span className="text-neutral-300">{feature}</span>
                </li>
              ))}
            </ul>

            {/* Privacy Notice */}
            <div className="p-4 rounded-xl bg-amber-500/20 border border-amber-500/30">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-200 text-sm">Privacy First</p>
                  <p className="text-sm text-amber-200/80">
                    We never store raw biometric images. Only encrypted mathematical 
                    templates are used for verification.
                  </p>
                </div>
              </div>
            </div>

            <Button variant="outline" className="w-full mt-6 border-white/30 text-white hover:bg-white/10">
              <Lock className="w-4 h-4 mr-2" />
              Read Our Privacy Policy
            </Button>
          </motion.div>
        </div>
      </Container>
    </Section>
  );
};

export default Biometrics;
