// ============================================================================
// FACEPAY SECTION
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import {
  Scan,
  Shield,
  Zap,
  ArrowRight,
  Check,
  Smartphone,
  Store,
  Lock,
  Eye,
  Fingerprint,
} from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";
import { Button } from "@components/ui/Button";

// ========================
// HOW IT WORKS
// ========================
interface Step {
  step: number;
  title: string;
  description: string;
}

const howItWorks: Step[] = [
  { step: 1, title: "Enroll Your Face", description: "Quick one-time registration via mobile app" },
  { step: 2, title: "Shop & Pay", description: "Look at the FacePay terminal at checkout" },
  { step: 3, title: "Confirm Payment", description: "Verify amount and approve with a smile" },
  { step: 4, title: "Done!", description: "Instant payment - no card, phone, or cash needed" },
];

// ========================
// BENEFITS
// ========================
const benefits = [
  { icon: Zap, title: "Lightning Fast", description: "Pay in under 2 seconds" },
  { icon: Shield, title: "Highly Secure", description: "Biometric encryption" },
  { icon: Lock, title: "Privacy First", description: "Data never leaves your device" },
  { icon: Store, title: "Growing Network", description: "500+ merchants" },
];

// ========================
// PARTNER MERCHANTS
// ========================
const merchants = [
  "Shoprite", "Spar", "Chicken Republic", "Domino's Pizza",
  "Mr Biggs", "Filmhouse", "Genesis Cinemas", "Game Stores",
];

// ========================
// MAIN COMPONENT
// ========================
const FacePay: React.FC = () => {
  return (
    <Section id="facepay" className="py-16 lg:py-24 bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-neutral-900 dark:to-neutral-800">
      <Container>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-sm font-medium mb-4">
            <Scan className="w-4 h-4" />
            FacePay
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
            Your Face is Your Wallet
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-300">
            Experience the future of payments. Just look at the terminal and pay - 
            no cards, no phones, no PINs. Powered by advanced facial recognition technology.
          </p>
        </motion.div>

        {/* Benefits */}
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
              <div className="w-12 h-12 mx-auto rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-3">
                <benefit.icon className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-neutral-900 dark:text-white text-sm">{benefit.title}</h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{benefit.description}</p>
            </div>
          ))}
        </motion.div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* How It Works */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-6 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
          >
            <h4 className="font-semibold text-neutral-900 dark:text-white mb-6">How FacePay Works</h4>
            <div className="space-y-6">
              {howItWorks.map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                    {step.step}
                  </div>
                  <div>
                    <h5 className="font-semibold text-neutral-900 dark:text-white">{step.title}</h5>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Face Scan Visual & CTA */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {/* Visual */}
            <div className="relative mx-auto w-64 h-64 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 p-1">
              <div className="w-full h-full rounded-full bg-violet-50 flex items-center justify-center relative overflow-hidden">
                {/* Face Outline */}
                <div className="relative">
                  <Eye className="w-20 h-20 text-violet-300" />
                  {/* Scan Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between">
                    <div className="h-0.5 bg-violet-400/50 animate-pulse" />
                    <div className="h-0.5 bg-violet-400/50 animate-pulse" style={{ animationDelay: '0.5s' }} />
                    <div className="h-0.5 bg-violet-400/50 animate-pulse" style={{ animationDelay: '1s' }} />
                  </div>
                </div>
                {/* Corner Markers */}
                <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-violet-500" />
                <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-violet-500" />
                <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-violet-500" />
                <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-violet-500" />
              </div>
            </div>

            {/* Partner Merchants */}
            <div className="p-4 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">Available at</p>
              <div className="flex flex-wrap gap-2">
                {merchants.map((merchant) => (
                  <span
                    key={merchant}
                    className="px-3 py-1.5 rounded-full bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 text-xs font-medium"
                  >
                    {merchant}
                  </span>
                ))}
              </div>
            </div>

            {/* Enroll CTA */}
            <div className="p-6 rounded-xl bg-violet-600 text-white">
              <div className="flex items-center gap-3 mb-4">
                <Fingerprint className="w-8 h-8" />
                <div>
                  <h4 className="font-semibold">Enroll in FacePay</h4>
                  <p className="text-xs text-violet-200">Free to register, free to use</p>
                </div>
              </div>
              <p className="text-sm text-violet-100 mb-4">
                Open your mobile app, go to Settings → FacePay, and follow the 
                enrollment steps. Takes less than 2 minutes!
              </p>
              <Button variant="primary" className="w-full bg-white dark:bg-neutral-800 text-violet-600 hover:bg-violet-50">
                Enroll Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Security Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 p-4 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-start gap-4"
        >
          <Shield className="w-6 h-6 text-violet-600 flex-shrink-0 mt-0.5" />
          <div>
            <h5 className="font-semibold text-neutral-900 dark:text-white mb-1">Your Privacy Matters</h5>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              Your facial data is encrypted and stored only on your device, never on our servers. 
              FacePay uses liveness detection to prevent spoofing and requires your explicit 
              consent for every transaction.
            </p>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
};

export default FacePay;
