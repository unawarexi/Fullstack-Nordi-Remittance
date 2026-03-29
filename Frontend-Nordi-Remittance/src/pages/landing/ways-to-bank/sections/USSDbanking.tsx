// ============================================================================
// USSD *901# BANKING SECTION
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import {
  Phone,
  Zap,
  ArrowRight,
  Check,
  Globe,
  Shield,
  Clock,
  Wifi,
  Send,
  Receipt,
  CreditCard,
} from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";
import { Button } from "@components/ui/Button";

// ========================
// USSD SERVICES
// ========================
interface USSDService {
  code: string;
  name: string;
  description: string;
}

const ussdServices: USSDService[] = [
  { code: "*901#", name: "Main Menu", description: "Access all banking services" },
  { code: "*901*1#", name: "Check Balance", description: "View account balance instantly" },
  { code: "*901*2*Amount*Account#", name: "Transfer", description: "Send money to any bank" },
  { code: "*901*3*Amount#", name: "Airtime", description: "Buy airtime for self or others" },
  { code: "*901*4#", name: "Pay Bills", description: "Pay utilities, subscriptions & more" },
  { code: "*901*5#", name: "Card Services", description: "Block card, change PIN" },
];

// ========================
// BENEFITS
// ========================
const benefits = [
  { icon: Wifi, title: "No Internet Required", description: "Works on any phone, anywhere" },
  { icon: Clock, title: "Instant Transactions", description: "Complete in seconds" },
  { icon: Shield, title: "Secure PIN", description: "4-digit security PIN" },
  { icon: Globe, title: "All Networks", description: "MTN, Airtel, Glo, 9mobile" },
];

// ========================
// MAIN COMPONENT
// ========================
const USSDbanking: React.FC = () => {
  return (
    <Section id="ussd-banking" className="py-16 lg:py-24 bg-slate-50 dark:bg-neutral-900">
      <Container>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-medium mb-4">
            <Phone className="w-4 h-4" />
            *901# USSD Banking
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
            Bank Without Internet
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-300">
            Access your account from any phone, anywhere. Simply dial *901# to 
            transfer money, check balance, pay bills, and more - no data required.
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
              className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
            >
              <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                <benefit.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-neutral-900 dark:text-white text-sm">{benefit.title}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">{benefit.description}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* USSD Codes */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-6 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
          >
            <h4 className="font-semibold text-neutral-900 dark:text-white mb-6">Quick USSD Codes</h4>
            <div className="space-y-3">
              {ussdServices.map((service) => (
                <div
                  key={service.code}
                  className={cn(
                    "flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-100",
                    "hover:bg-orange-50 hover:border-orange-200 transition-all"
                  )}
                >
                  <div className="w-20 font-mono text-sm font-semibold text-orange-600 bg-orange-100 px-2 py-1 rounded text-center">
                    {service.code}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-neutral-900 dark:text-white text-sm">{service.name}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">{service.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Phone Mockup & Steps */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {/* Phone Mockup */}
            <div className="relative mx-auto w-64 h-80 bg-neutral-900 rounded-3xl p-3 shadow-xl">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-1 bg-neutral-800 rounded-full" />
              <div className="h-full bg-neutral-100 dark:bg-neutral-700 rounded-2xl overflow-hidden">
                <div className="h-8 bg-orange-500 flex items-center justify-center text-white text-xs font-medium">
                  USSD Menu
                </div>
                <div className="p-4 space-y-2 text-xs font-mono">
                  <p className="text-neutral-900 dark:text-white font-semibold">Welcome to *901#</p>
                  <p className="text-neutral-600 dark:text-neutral-300">1. Transfer Money</p>
                  <p className="text-neutral-600 dark:text-neutral-300">2. Buy Airtime</p>
                  <p className="text-neutral-600 dark:text-neutral-300">3. Pay Bills</p>
                  <p className="text-neutral-600 dark:text-neutral-300">4. Check Balance</p>
                  <p className="text-neutral-600 dark:text-neutral-300">5. Account Services</p>
                  <p className="text-neutral-600 dark:text-neutral-300">6. Cardless Withdrawal</p>
                  <div className="mt-4 pt-2 border-t border-neutral-200 dark:border-neutral-700">
                    <p className="text-neutral-500 dark:text-neutral-400">Reply with option number</p>
                  </div>
                </div>
              </div>
            </div>

            {/* How It Works */}
            <div className="p-6 rounded-2xl bg-orange-600 text-white">
              <h4 className="font-semibold mb-4">How to Get Started</h4>
              <ol className="space-y-3">
                {[
                  "Dial *901# from your registered phone number",
                  "Create a 4-digit USSD PIN (first-time users)",
                  "Select your desired transaction from the menu",
                  "Enter details and confirm with your PIN",
                ].map((step, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </span>
                    <span className="text-sm text-orange-100">{step}</span>
                  </li>
                ))}
              </ol>
              <Button variant="primary" className="w-full mt-4 bg-white dark:bg-neutral-800 text-orange-600 hover:bg-orange-50">
                Reset USSD PIN
              </Button>
            </div>
          </motion.div>
        </div>
      </Container>
    </Section>
  );
};

export default USSDbanking;
