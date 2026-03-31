// ============================================================================
// MOBILE APP SECTION - App promotion with download links
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import {
  Smartphone,
  Bell,
  CreditCard,
  Send,
  QrCode,
  Fingerprint,
  Check,
} from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";

// ========================
// APP FEATURES DATA
// ========================
const appFeatures = [
  { icon: <Bell className="w-4 h-4" />, text: "Instant notifications" },
  { icon: <CreditCard className="w-4 h-4" />, text: "Card management" },
  { icon: <Send className="w-4 h-4" />, text: "Quick transfers" },
  { icon: <QrCode className="w-4 h-4" />, text: "QR payments" },
  { icon: <Fingerprint className="w-4 h-4" />, text: "Biometric login" },
];

const appRatings = [
  { store: "App Store", rating: "4.8", reviews: "125K" },
  { store: "Google Play", rating: "4.7", reviews: "89K" },
];

// ========================
// MAIN COMPONENT
// ========================
const MobileApp: React.FC = () => {
  return (
    <Section background="white" className="py-8 sm:py-12 lg:py-16 overflow-hidden">
      <Container size="xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 rounded-full mb-3 sm:mb-4">
              <Smartphone className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              Mobile Banking
            </span>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white">
              Banking at Your Fingertips
            </h2>

            <p className="mt-2 sm:mt-3 text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed">
              Download our award-winning mobile app and manage your finances anytime,
              anywhere. Available for iOS and Android devices.
            </p>

            {/* Features List */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              {appFeatures.map((feature) => (
                <div
                  key={feature.text}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 shadow-sm group hover:shadow-md transition-all"
                >
                  <div className="text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                    {React.isValidElement(feature.icon) 
                      ? React.cloneElement(feature.icon as React.ReactElement, { className: "w-5 h-5" })
                      : feature.icon}
                  </div>
                  <span className="text-[11px] sm:text-sm text-neutral-900 dark:text-white font-black uppercase tracking-tight italic">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* App Store Buttons */}
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="https://apps.apple.com"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex items-center gap-3 px-5 py-3 rounded-xl",
                  "bg-neutral-900 text-white",
                  "hover:bg-neutral-800 transition-colors"
                )}
              >
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <div className="text-left">
                  <div className="text-[10px] text-neutral-400">Download on the</div>
                  <div className="text-sm font-semibold">App Store</div>
                </div>
              </a>

              <a
                href="https://play.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex items-center gap-3 px-5 py-3 rounded-xl",
                  "bg-neutral-900 text-white",
                  "hover:bg-neutral-800 transition-colors"
                )}
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 20.5v-17c0-.59.34-1.11.84-1.35L13.69 12l-9.85 9.85c-.5-.24-.84-.76-.84-1.35m13.81-5.38L6.05 21.34l8.49-8.49 2.27 2.27m3.35-4.31c.34.27.59.69.59 1.19s-.22.9-.57 1.18l-2.29 1.32-2.5-2.5 2.5-2.5 2.27 1.31M6.05 2.66l10.76 6.22-2.27 2.27-8.49-8.49z" />
                </svg>
                <div className="text-left">
                  <div className="text-[10px] text-neutral-400">Get it on</div>
                  <div className="text-sm font-semibold">Google Play</div>
                </div>
              </a>
            </div>

            {/* Ratings */}
            <div className="mt-6 flex flex-wrap gap-6">
              {appRatings.map((item) => (
                <div key={item.store} className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-4 h-4 text-amber-400 fill-current"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                    {item.rating}
                  </span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    ({item.reviews} reviews)
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right - Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative flex justify-center lg:justify-end"
          >
            {/* Phone Frame */}
            <div className="relative">
              {/* Background decoration */}
              <div className="absolute inset-0 bg-indigo-100 dark:bg-indigo-800/30 rounded-[3rem] blur-3xl opacity-40 scale-110" />
              
              {/* Phone */}
              <div className="relative w-56 sm:w-64 md:w-72 bg-neutral-900 rounded-[2.5rem] p-2 sm:p-3 shadow-2xl">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 sm:w-20 h-5 sm:h-6 bg-neutral-900 rounded-b-xl" />
                
                {/* Screen */}
                <div className="bg-white dark:bg-neutral-800 rounded-[2rem] overflow-hidden">
                  {/* Status Bar */}
                  <div className="flex justify-between items-center px-6 py-2 bg-indigo-600 text-white text-xs">
                    <span>9:41</span>
                    <div className="flex items-center gap-1">
                      <span>📶</span>
                      <span>🔋</span>
                    </div>
                  </div>
                  
                  {/* App Content */}
                  <div className="p-5 space-y-4">
                    <div className="text-center">
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">Total Balance</div>
                      <div className="text-2xl font-bold text-neutral-900 dark:text-white">$24,580.50</div>
                    </div>
                    
                    <div className="flex justify-between">
                      {["Send", "Receive", "Pay", "More"].map((action) => (
                        <div key={action} className="text-center">
                          <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mx-auto">
                            <div className="w-3 h-3 rounded-full bg-indigo-50 dark:bg-indigo-900/300" />
                          </div>
                          <div className="mt-1 text-[10px] text-neutral-600 dark:text-neutral-300">{action}</div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-neutral-700 dark:text-neutral-200">Recent</div>
                      {[
                        { name: "Coffee Shop", amount: "-$4.50" },
                        { name: "Salary", amount: "+$3,500" },
                        { name: "Electric Bill", amount: "-$85.00" },
                      ].map((tx) => (
                        <div
                          key={tx.name}
                          className="flex justify-between items-center py-2 border-b border-neutral-100 dark:border-neutral-700"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-700" />
                            <span className="text-xs text-neutral-700 dark:text-neutral-200">{tx.name}</span>
                          </div>
                          <span
                            className={cn(
                              "text-xs font-medium",
                              tx.amount.startsWith("+")
                                ? "text-emerald-600"
                                : "text-neutral-900 dark:text-white"
                            )}
                          >
                            {tx.amount}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </Section>
  );
};

export default MobileApp;
