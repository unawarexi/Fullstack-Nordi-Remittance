// ============================================================================
// ACCESS MONEY / CARDLESS WITHDRAWAL SECTION
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import {
  Banknote,
  QrCode,
  Smartphone,
  Shield,
  ArrowRight,
  Check,
  Clock,
  MapPin,
  Lock,
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
  icon: React.ReactNode;
}

const withdrawalSteps: Step[] = [
  {
    step: 1,
    title: "Initiate Request",
    description: "Open mobile app and select 'Access Money' or dial *901*10#",
    icon: <Smartphone className="w-5 h-5" />,
  },
  {
    step: 2,
    title: "Get Your Code",
    description: "Receive a secure 6-digit withdrawal code via SMS",
    icon: <Lock className="w-5 h-5" />,
  },
  {
    step: 3,
    title: "Visit Any ATM",
    description: "Go to any of our 3,500+ ATMs nationwide",
    icon: <MapPin className="w-5 h-5" />,
  },
  {
    step: 4,
    title: "Withdraw Cash",
    description: "Enter your code and collect your cash - no card needed!",
    icon: <Banknote className="w-5 h-5" />,
  },
];

// ========================
// BENEFITS
// ========================
const benefits = [
  { icon: Shield, title: "Secure", description: "One-time use codes" },
  { icon: Clock, title: "Valid 24hrs", description: "Use within 24 hours" },
  { icon: MapPin, title: "Any ATM", description: "3,500+ locations" },
  { icon: Fingerprint, title: "PIN Protected", description: "Extra security layer" },
];

// ========================
// MAIN COMPONENT
// ========================
const AccessMoney: React.FC = () => {
  return (
    <Section id="access-money" className="py-16 lg:py-24">
      <Container>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-4">
            <Banknote className="w-4 h-4" />
            Access Money
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-neutral-900 dark:text-white uppercase tracking-tighter mb-6 leading-tight">
            Access <span className="text-blue-600 dark:text-blue-400">Money</span>.
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-300">
            No card? No problem! Withdraw cash from any of our ATMs using just 
            your phone. Perfect for emergencies or when you've forgotten your card.
          </p>
        </motion.div>

        {/* Benefits Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-12 sm:mb-20"
        >
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="text-center p-4 sm:p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 shadow-sm hover:shadow-xl transition-all group"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner">
                <benefit.icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <p className="font-black text-[13px] sm:text-sm text-neutral-900 dark:text-white uppercase tracking-tight leading-tight mb-1">{benefit.title}</p>
              <p className="text-[10px] sm:text-[13px] text-neutral-500 dark:text-neutral-400 font-bold leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-8 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white"
        >
          <h3 className="text-xl font-semibold text-center mb-8">How Access Money Works</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10">
            {withdrawalSteps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="relative group"
              >
                {/* Connector Line */}
                {index < withdrawalSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-white/10 -translate-y-1/2">
                    <div className="absolute right-0 w-2 h-2 rounded-full bg-white/40 -translate-y-1/2" />
                  </div>
                )}
                
                <div className="text-center sm:text-left lg:text-center">
                  <div className="relative inline-flex items-center justify-center mb-6">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[2rem] bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform shadow-2xl">
                      {React.isValidElement(step.icon) 
                        ? React.cloneElement(step.icon as React.ReactElement, { className: "w-8 h-8 sm:w-10 sm:h-10 text-white" })
                        : step.icon}
                    </div>
                    <span className="absolute -top-2 -right-2 w-8 h-8 rounded-2xl bg-emerald-400 text-emerald-950 text-xs font-black flex items-center justify-center shadow-lg border-2 border-emerald-600">
                      {step.step}
                    </span>
                  </div>
                  <h4 className="text-lg sm:text-xl font-black mb-3 uppercase tracking-tight">{step.title}</h4>
                  <p className="text-[13px] sm:text-sm text-emerald-50 font-bold leading-relaxed opacity-80">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-white/20 flex flex-wrap justify-center gap-4">
            <Button variant="primary" className="bg-white dark:bg-neutral-800 text-emerald-600 hover:bg-emerald-50">
              Try Access Money
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
              <QrCode className="w-5 h-5 mr-2" />
              Scan QR Code
            </Button>
          </div>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 grid md:grid-cols-2 gap-6"
        >
          <div className="p-6 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
            <h4 className="font-semibold text-neutral-900 dark:text-white mb-4">Withdrawal Limits</h4>
            <ul className="space-y-3">
              {[
                { limit: "₦20,000", period: "Per transaction" },
                { limit: "₦100,000", period: "Daily limit" },
                { limit: "3 times", period: "Daily transactions" },
              ].map((item) => (
                <li key={item.period} className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600 dark:text-neutral-300">{item.period}</span>
                  <span className="font-semibold text-neutral-900 dark:text-white">{item.limit}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="p-6 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
            <h4 className="font-semibold text-neutral-900 dark:text-white mb-4">Security Features</h4>
            <ul className="space-y-2">
              {[
                "One-time use withdrawal codes",
                "Codes expire after 24 hours",
                "Transaction PIN required at ATM",
                "Instant SMS notification on use",
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                  <Check className="w-4 h-4 text-emerald-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
};

export default AccessMoney;
