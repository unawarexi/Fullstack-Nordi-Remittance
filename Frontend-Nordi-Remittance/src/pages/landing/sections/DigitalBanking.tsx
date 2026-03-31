// ============================================================================
// DIGITAL BANKING SECTION - Online and mobile banking features
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import {
  Laptop,
  Smartphone,
  Zap,
  CreditCard,
  Send,
  BarChart3,
  Bell,
  Receipt,
  Scan,
  Wallet,
  RefreshCcw,
  FileText,
} from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";

// ========================
// FEATURES DATA
// ========================
interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const onlineFeatures: Feature[] = [
  {
    icon: <CreditCard className="w-5 h-5" />,
    title: "Account Management",
    description: "View balances, statements, and account details in real-time",
  },
  {
    icon: <Send className="w-5 h-5" />,
    title: "Easy Transfers",
    description: "Move money between accounts or send to anyone instantly",
  },
  {
    icon: <Receipt className="w-5 h-5" />,
    title: "Bill Pay",
    description: "Schedule and automate all your bill payments",
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    title: "Spending Insights",
    description: "Track spending patterns with visual analytics",
  },
  {
    icon: <FileText className="w-5 h-5" />,
    title: "eStatements",
    description: "Go paperless with secure electronic statements",
  },
  {
    icon: <RefreshCcw className="w-5 h-5" />,
    title: "Auto Savings",
    description: "Set rules to automatically save money",
  },
];

const mobileFeatures: Feature[] = [
  {
    icon: <Scan className="w-5 h-5" />,
    title: "Mobile Check Deposit",
    description: "Deposit checks by snapping a photo",
  },
  {
    icon: <Wallet className="w-5 h-5" />,
    title: "Digital Wallet",
    description: "Apple Pay, Google Pay, Samsung Pay ready",
  },
  {
    icon: <Bell className="w-5 h-5" />,
    title: "Push Notifications",
    description: "Real-time alerts for transactions and security",
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: "Instant Card Lock",
    description: "Freeze your card immediately if lost or stolen",
  },
];

// ========================
// FEATURE ITEM COMPONENT
// ========================
interface FeatureItemProps {
  feature: Feature;
  index: number;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ feature, index }) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.3, delay: index * 0.05 }}
    className="flex items-start gap-3"
  >
    <div className="flex-shrink-0 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 shadow-inner group-hover:scale-110 transition-transform">
      {React.isValidElement(feature.icon) 
        ? React.cloneElement(feature.icon as React.ReactElement, { className: "w-5 h-5 sm:w-6 sm:h-6" })
        : feature.icon}
    </div>
    <div>
      <h4 className="text-sm sm:text-base font-black text-neutral-900 dark:text-neutral-100 uppercase tracking-tight">{feature.title}</h4>
      <p className="mt-1 text-[10px] sm:text-xs text-neutral-400 font-bold opacity-75 leading-relaxed">{feature.description}</p>
    </div>
  </motion.div>
);

// ========================
// MAIN COMPONENT
// ========================
const DigitalBanking: React.FC = () => {
  return (
    <Section background="white" className="py-8 sm:py-12 lg:py-16">
      <Container size="xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12"
        >
          <span className="inline-block px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded-full mb-2 sm:mb-3">
            Digital Experience
          </span>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Banking That Fits Your Life
          </h2>
          <p className="mt-2 text-xs sm:text-sm md:text-base text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Access your accounts anytime, anywhere with our award-winning online and mobile platforms.
          </p>
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Online Banking */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={cn(
              "p-4 sm:p-5 md:p-6 rounded-2xl",
              "bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700"
            )}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-indigo-600 text-white">
                <Laptop className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Online Banking</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Full-featured web experience</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {onlineFeatures.map((feature, index) => (
                <FeatureItem key={feature.title} feature={feature} index={index} />
              ))}
            </div>

            <div className="mt-6 pt-5 border-t border-neutral-200 dark:border-neutral-700">
              <a
                href="/online-banking"
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-lg",
                  "bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700",
                  "text-sm font-medium text-neutral-700 dark:text-neutral-200",
                  "hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                )}
              >
                <Laptop className="w-4 h-4" />
                Log In Online
              </a>
            </div>
          </motion.div>

          {/* Mobile Banking */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className={cn(
              "p-4 sm:p-5 md:p-6 rounded-2xl",
              "bg-indigo-600"
            )}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-white/20 text-white">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-white">The Future of <span className="text-blue-600 dark:text-blue-500">Digital Banking</span>.</h3>
                <p className="text-sm text-indigo-200">Banking in your pocket</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mobileFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <div className="flex-shrink-0 p-2 rounded-lg bg-white/10 text-white">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-white text-sm">{feature.title}</h4>
                    <p className="mt-0.5 text-xs text-indigo-200">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* App Badges */}
            <div className="mt-6 pt-5 border-t border-white/20">
              <p className="text-sm text-indigo-200 mb-3">Get the app</p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://apps.apple.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2 rounded-lg",
                    "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100",
                    "text-xs font-medium",
                    "hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                  )}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  App Store
                </a>
                <a
                  href="https://play.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2 rounded-lg",
                    "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100",
                    "text-xs font-medium",
                    "hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                  )}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 20.5v-17c0-.59.34-1.11.84-1.35L13.69 12l-9.85 9.85c-.5-.24-.84-.76-.84-1.35m13.81-5.38L6.05 21.34l8.49-8.49 2.27 2.27m3.35-4.31c.34.27.59.69.59 1.19s-.22.9-.57 1.18l-2.29 1.32-2.5-2.5 2.5-2.5 2.27 1.31M6.05 2.66l10.76 6.22-2.27 2.27-8.49-8.49z" />
                  </svg>
                  Google Play
                </a>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {[
            { value: "99.99%", label: "Uptime" },
            { value: "< 3 sec", label: "Avg load time" },
            { value: "256-bit", label: "Encryption" },
            { value: "4.8★", label: "App rating" },
          ].map((stat, index) => (
            <div
              key={stat.label}
              className={cn(
                "text-center p-6 rounded-[2rem]",
                "bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 shadow-sm hover:shadow-xl transition-all group"
              )}
            >
              <span className="mb-4 inline-block text-sm font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                <div className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400 tabular-nums tracking-tighter group-hover:scale-110 transition-transform">{stat.value}</div>
              </span>
              <div className="text-[10px] sm:text-xs text-neutral-400 font-black uppercase tracking-widest mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </Container>
    </Section>
  );
};

export default DigitalBanking;
