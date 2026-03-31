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
    <Section id="mobile-banking" className="py-16 lg:py-24 bg-slate-50 dark:bg-neutral-900">
      <Container>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 text-sm font-medium mb-4">
            <Smartphone className="w-4 h-4" />
            Mobile Banking
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
            Your Bank in Your Pocket
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-300">
            The award-winning mobile app that puts complete control of your 
            finances at your fingertips. Bank smarter, not harder.
          </p>
        </motion.div>

        {/* App Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-3 gap-3 sm:gap-6 max-w-2xl mx-auto mb-12 sm:mb-20"
        >
          {appStats.map((stat) => (
            <div key={stat.label} className="text-center p-4 sm:p-6 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 shadow-sm hover:shadow-xl transition-all">
              <div className="flex items-center justify-center gap-2 mb-2">
                <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-600 dark:text-cyan-400" />
                <span className="text-xl sm:text-3xl font-black text-neutral-900 dark:text-white tabular-nums tracking-tighter">{stat.value}</span>
              </div>
              <p className="text-[10px] sm:text-xs text-neutral-400 font-bold uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative mx-auto lg:ml-0"
          >
            <div className="relative w-full max-w-[280px] sm:max-w-xs bg-neutral-900 rounded-[3rem] p-3 shadow-[0_0_100px_rgba(6,182,212,0.15)] border-4 border-neutral-800/50">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-8 bg-neutral-900 rounded-b-3xl z-20 border-x border-b border-neutral-800/50 shadow-inner flex items-center justify-center">
                <div className="w-12 h-1 bg-neutral-800 rounded-full" />
              </div>
              
              {/* Screen */}
              <div className="h-[500px] sm:h-[600px] bg-cyan-600 rounded-[2.5rem] overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-700/50 to-transparent pointer-events-none" />
                
                {/* App Content Preview */}
                <div className="p-5 pt-12 relative z-10">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="w-10 h-10 rounded-full bg-white/20 blur-[0.5px]" />
                    <Bell className="w-6 h-6 text-white/80" />
                  </div>

                  {/* Balance Card */}
                  <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 mb-6 shadow-2xl">
                    <p className="text-[10px] sm:text-xs text-cyan-100 font-bold uppercase tracking-widest mb-1">Legacy Balance</p>
                    <p className="text-2xl sm:text-3xl font-black text-white tabular-nums tracking-tighter">₦2,458,900.00</p>
                    <div className="flex gap-2 mt-6">
                      {['Send', 'Top-up'].map(btn => (
                        <div key={btn} className="flex-1 py-3 rounded-2xl bg-white/20 text-center text-[10px] sm:text-xs font-black text-white uppercase tracking-widest hover:bg-white/30 transition-colors cursor-pointer">
                          {btn}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="grid grid-cols-4 gap-2 mb-6">
                    {['Cards', 'Airtime', 'Bills', 'Invest'].map((action) => (
                      <div key={action} className="p-2 text-center group/icon cursor-pointer">
                        <div className="w-12 h-12 mx-auto rounded-2xl bg-white/10 flex items-center justify-center mb-1 group-hover/icon:bg-white/20 transition-all border border-white/5">
                          <Download className="w-5 h-5 text-white/70" />
                        </div>
                        <p className="text-[9px] text-white/80 font-bold uppercase tracking-tighter">{action}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Indicators */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/30 rounded-full" />
              </div>
            </div>

            {/* Ambient Background Glow */}
            <div className="absolute -inset-20 -z-10 bg-cyan-500/10 rounded-full blur-[100px] opacity-50" />
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6 sm:space-y-10"
          >
            {/* Feature Grid */}
            <div className="grid grid-cols-2 gap-4">
              {appFeatures.map((feature) => (
                <div
                  key={feature.name}
                  className={cn(
                    "p-5 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 shadow-sm transition-all group",
                    "hover:shadow-xl hover:border-cyan-400 hover:-translate-y-1"
                  )}
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner">
                    {feature.icon && React.isValidElement(feature.icon) 
                      ? React.cloneElement(feature.icon as React.ReactElement, { className: "w-5 h-5 sm:w-6 sm:h-6" })
                      : feature.icon}
                  </div>
                  <h4 className="font-black text-[13px] sm:text-base text-neutral-900 dark:text-white mb-1.5 uppercase tracking-tight leading-tight">{feature.name}</h4>
                  <p className="text-[10px] sm:text-[13px] text-neutral-500 dark:text-neutral-400 font-bold leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>

            {/* Security */}
            <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900 border border-white/5 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-3xl" />
              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
                </div>
                <h4 className="text-sm sm:text-lg font-black text-white uppercase tracking-tight">Military-Grade</h4>
              </div>
              <div className="grid grid-cols-2 gap-3 relative z-10">
                {securityFeatures.map((feature) => (
                  <div key={feature} className="flex items-center gap-3 text-[11px] sm:text-sm text-neutral-400 font-bold group/item">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center group-hover/item:scale-110 transition-transform">
                      <Check className="w-3 h-3 text-emerald-400 font-bold" />
                    </div>
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            {/* Download CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="primary" size="lg" className="w-full bg-neutral-900 hover:bg-black text-white font-black py-4 px-8 shadow-xl border border-white/10 uppercase tracking-widest text-xs sm:text-sm">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                App Store
              </Button>
              <Button variant="primary" size="lg" className="w-full bg-neutral-900 hover:bg-black text-white font-black py-4 px-8 shadow-xl border border-white/10 uppercase tracking-widest text-xs sm:text-sm">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-3" viewBox="0 0 24 24" fill="currentColor">
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
