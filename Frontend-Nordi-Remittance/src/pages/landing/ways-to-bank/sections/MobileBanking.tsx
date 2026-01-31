// ============================================================================
// MOBILE BANKING SECTION
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import {
  Smartphone,
  Send,
  Receipt,
  Shield,
  ArrowRight,
  Check,
  QrCode,
  Bell,
  Lock,
  Fingerprint,
  Download,
  Star,
} from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";
import { Button } from "@components/ui/Button";

// ========================
// APP FEATURES
// ========================
interface AppFeature {
  icon: React.ReactNode;
  name: string;
  description: string;
}

const appFeatures: AppFeature[] = [
  { icon: <Send className="w-5 h-5" />, name: "Instant Transfers", description: "Send money to any bank in seconds" },
  { icon: <Receipt className="w-5 h-5" />, name: "Bill Payments", description: "Pay all utilities from one place" },
  { icon: <QrCode className="w-5 h-5" />, name: "QR Payments", description: "Scan and pay at merchants" },
  { icon: <Bell className="w-5 h-5" />, name: "Real-time Alerts", description: "Instant transaction notifications" },
  { icon: <Lock className="w-5 h-5" />, name: "Card Controls", description: "Block, unblock, set limits" },
  { icon: <Fingerprint className="w-5 h-5" />, name: "Biometric Login", description: "Face ID & fingerprint" },
];

// ========================
// SECURITY FEATURES
// ========================
const securityFeatures = [
  "256-bit encryption",
  "Biometric authentication",
  "Device binding",
  "Fraud monitoring",
  "Session timeout",
  "Secure OTP",
];

// ========================
// APP STATS
// ========================
const appStats = [
  { value: "4.8", label: "App Store Rating", icon: Star },
  { value: "8M+", label: "Downloads", icon: Download },
  { value: "99.9%", label: "Uptime", icon: Shield },
];

// ========================
// MAIN COMPONENT
// ========================
const MobileBanking: React.FC = () => {
  return (
    <Section id="mobile-banking" className="py-16 lg:py-24 bg-slate-50">
      <Container>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 text-cyan-700 text-sm font-medium mb-4">
            <Smartphone className="w-4 h-4" />
            Mobile Banking
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
            Your Bank in Your Pocket
          </h2>
          <p className="text-lg text-neutral-600">
            The award-winning mobile app that puts complete control of your 
            finances at your fingertips. Bank smarter, not harder.
          </p>
        </motion.div>

        {/* App Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-12"
        >
          {appStats.map((stat) => (
            <div key={stat.label} className="text-center p-4 rounded-xl bg-white border border-neutral-200">
              <div className="flex items-center justify-center gap-1 mb-1">
                <stat.icon className="w-4 h-4 text-cyan-600" />
                <span className="text-xl font-bold text-neutral-900">{stat.value}</span>
              </div>
              <p className="text-xs text-neutral-500">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative mx-auto"
          >
            <div className="relative w-64 lg:w-72 bg-neutral-900 rounded-[3rem] p-2 shadow-2xl">
              {/* Notch */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-10" />
              
              {/* Screen */}
              <div className="h-[500px] lg:h-[550px] bg-cyan-600 rounded-[2.5rem] overflow-hidden">
                {/* Status Bar */}
                <div className="h-12 bg-cyan-700 flex items-end justify-center pb-2">
                  <span className="text-white text-xs font-medium">Mobile Banking</span>
                </div>
                
                {/* App Content Preview */}
                <div className="p-4">
                  {/* Balance Card */}
                  <div className="p-4 rounded-xl bg-white/20 mb-4">
                    <p className="text-xs text-cyan-100">Total Balance</p>
                    <p className="text-2xl font-bold text-white">₦2,458,900.00</p>
                    <div className="flex gap-2 mt-3">
                      <div className="flex-1 py-2 rounded-lg bg-white/20 text-center text-xs text-white">Send</div>
                      <div className="flex-1 py-2 rounded-lg bg-white/20 text-center text-xs text-white">Request</div>
                      <div className="flex-1 py-2 rounded-lg bg-white/20 text-center text-xs text-white">More</div>
                    </div>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {['Transfer', 'Airtime', 'Bills', 'Cards'].map((action) => (
                      <div key={action} className="p-2 rounded-lg bg-white/10 text-center">
                        <div className="w-8 h-8 mx-auto rounded-full bg-white/20 mb-1" />
                        <p className="text-xs text-white">{action}</p>
                      </div>
                    ))}
                  </div>
                  
                  {/* Transactions */}
                  <div className="p-3 rounded-xl bg-white/10">
                    <p className="text-xs text-cyan-100 mb-2">Recent</p>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3 py-2 border-b border-white/10 last:border-0">
                        <div className="w-8 h-8 rounded-full bg-white/20" />
                        <div className="flex-1">
                          <p className="text-xs text-white">Transfer</p>
                          <p className="text-xs text-cyan-200">Today</p>
                        </div>
                        <p className="text-xs text-white font-medium">-₦50,000</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Glow */}
            <div className="absolute -inset-4 -z-10 bg-cyan-500/30 rounded-[4rem] blur-2xl" />
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {/* Feature Grid */}
            <div className="grid grid-cols-2 gap-3">
              {appFeatures.map((feature) => (
                <div
                  key={feature.name}
                  className={cn(
                    "p-4 rounded-xl bg-white border border-neutral-200",
                    "hover:shadow-md hover:border-cyan-300 transition-all"
                  )}
                >
                  <div className="w-10 h-10 rounded-lg bg-cyan-100 text-cyan-600 flex items-center justify-center mb-3">
                    {feature.icon}
                  </div>
                  <h4 className="font-semibold text-neutral-900 text-sm mb-1">{feature.name}</h4>
                  <p className="text-xs text-neutral-500">{feature.description}</p>
                </div>
              ))}
            </div>

            {/* Security */}
            <div className="p-4 rounded-xl bg-neutral-900 text-white">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-emerald-400" />
                <h4 className="font-semibold">Bank-Grade Security</h4>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {securityFeatures.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm text-neutral-300">
                    <Check className="w-4 h-4 text-emerald-400" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            {/* Download CTAs */}
            <div className="flex gap-3">
              <Button variant="primary" className="flex-1 bg-neutral-900 hover:bg-neutral-800">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                App Store
              </Button>
              <Button variant="primary" className="flex-1 bg-neutral-900 hover:bg-neutral-800">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/>
                </svg>
                Play Store
              </Button>
            </div>
          </motion.div>
        </div>
      </Container>
    </Section>
  );
};

export default MobileBanking;
