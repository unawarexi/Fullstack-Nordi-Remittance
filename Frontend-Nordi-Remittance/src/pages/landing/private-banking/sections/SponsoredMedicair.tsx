// ============================================================================
// SPONSORED MEDICAIR SECTION
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import {
  Heart,
  Plane,
  Shield,
  Clock,
  ArrowRight,
  Check,
  Globe,
  Phone,
  Users,
  Hospital,
  FileText,
  Award,
} from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";
import { Button } from "@components/ui/Button";

// ========================
// PROGRAM FEATURES
// ========================
interface ProgramFeature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const programFeatures: ProgramFeature[] = [
  {
    icon: <Plane className="w-6 h-6" />,
    title: "Air Ambulance Services",
    description: "24/7 medical evacuation to world-class facilities worldwide",
  },
  {
    icon: <Hospital className="w-6 h-6" />,
    title: "Global Hospital Network",
    description: "Access to 500+ premium healthcare institutions globally",
  },
  {
    icon: <FileText className="w-6 h-6" />,
    title: "Cashless Treatment",
    description: "Direct billing arrangements with partner hospitals",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Dedicated Care Team",
    description: "Personal medical concierge available round the clock",
  },
];

// ========================
// COVERAGE BENEFITS
// ========================
const coverageBenefits = [
  "Emergency medical evacuation worldwide",
  "Second medical opinion services",
  "Repatriation of mortal remains",
  "Bedside companion coverage",
  "Emergency dental treatment",
  "Prescription medication coverage",
  "Mental health support",
  "Annual health check-up",
];

// ========================
// PARTNER HOSPITALS
// ========================
const partnerHospitals = [
  "Johns Hopkins (USA)",
  "Cleveland Clinic (USA)",
  "Mayo Clinic (USA)",
  "Royal Brompton (UK)",
  "Bumrungrad (Thailand)",
  "Apollo Hospitals (India)",
];

// ========================
// MAIN COMPONENT
// ========================
const SponsoredMedicair: React.FC = () => {
  return (
    <Section id="sponsored-medicair" className="py-16 lg:py-24 bg-gradient-to-b from-rose-50 to-white dark:from-neutral-900 dark:to-neutral-900">
      <Container>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-sm font-medium mb-4">
            <Heart className="w-4 h-4" />
            Sponsored Medicair
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
            Premium Healthcare Coverage
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-300">
            Exclusive medical coverage program providing access to the world's 
            best healthcare facilities, available to our private banking members.
          </p>
        </motion.div>

        {/* Program Features */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-12 sm:mb-20">
          {programFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={cn(
                "p-4 sm:p-6 rounded-3xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 transition-all group shadow-sm",
                "hover:shadow-2xl hover:border-rose-400 hover:-translate-y-1"
              )}
            >
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 group-hover:bg-rose-500 group-hover:text-white transition-all shadow-inner">
                {React.isValidElement(feature.icon) 
                  ? React.cloneElement(feature.icon as React.ReactElement, { className: "w-5 h-5 sm:w-7 sm:h-7" })
                  : feature.icon}
              </div>
              <h3 className="font-black text-[13px] sm:text-lg text-neutral-900 dark:text-white mb-2 uppercase tracking-tight leading-tight">{feature.title}</h3>
              <p className="text-[10px] sm:text-[13px] text-neutral-500 dark:text-neutral-400 font-bold leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Coverage Details */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-xl"
          >
            <div className="flex items-center gap-4 mb-8 sm:mb-12">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h4 className="text-lg sm:text-xl font-black text-neutral-900 dark:text-white uppercase tracking-tight italic">Global Coverage</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
              {coverageBenefits.map((benefit) => (
                <div key={benefit} className="flex items-center gap-3 group">
                  <div className="w-5 h-5 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Check className="w-3 h-3 text-rose-600 font-bold" />
                  </div>
                  <span className="text-[13px] sm:text-sm text-neutral-600 dark:text-neutral-300 font-bold group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">{benefit}</span>
                </div>
              ))}
            </div>

            {/* Coverage Limit */}
            <div className="p-6 sm:p-8 rounded-[2rem] bg-rose-500/5 border-2 border-rose-500/10 shadow-inner group hover:bg-rose-500/10 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400 font-black uppercase tracking-widest">Annual Integrity Limit</span>
                <Award className="w-6 h-6 sm:w-8 sm:h-8 text-rose-600 animate-pulse" />
              </div>
              <p className="text-3xl sm:text-5xl font-black text-rose-600 dark:text-rose-400 tabular-nums tracking-tighter italic">$5,000,000</p>
              <p className="text-[10px] sm:text-xs text-neutral-400 font-black uppercase tracking-widest mt-2">Per member, per annum • Global Access</p>
            </div>
          </motion.div>

          {/* Partner Network & CTA */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4 sm:space-y-6 flex flex-col justify-between"
          >
            {/* Partner Hospitals */}
            <div className="p-6 sm:p-10 rounded-3xl bg-neutral-900 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />
              <div className="flex items-center gap-4 mb-6 sm:mb-8 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center shrink-0">
                  <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-rose-400" />
                </div>
                <h4 className="text-lg sm:text-xl font-black uppercase tracking-tight">Elite Network</h4>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-6 relative z-10">
                {partnerHospitals.map((hospital) => (
                  <div
                    key={hospital}
                    className="px-4 py-2.5 rounded-xl bg-white/5 text-[11px] sm:text-[13px] font-bold border border-white/5 hover:bg-white/10 hover:border-rose-500/30 transition-all cursor-default"
                  >
                    {hospital}
                  </div>
                ))}
              </div>
              <p className="text-[10px] sm:text-xs text-neutral-500 font-black uppercase tracking-widest relative z-10">+ 500 Legacy partner facilities worldwide</p>
            </div>

            {/* Emergency Contact */}
            <div className="p-6 sm:p-10 rounded-3xl bg-rose-600 text-white shadow-xl shadow-rose-600/20 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500 to-rose-700 -z-10" />
              <div className="flex items-center gap-5 mb-6 sm:mb-8">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/20 flex items-center justify-center animate-pulse shadow-lg group-hover:scale-105 transition-transform">
                  <Phone className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-rose-100 font-black uppercase tracking-[0.2em] mb-1">Emergency Lifeline</p>
                  <p className="text-xl sm:text-2xl font-black tabular-nums tracking-tight group-hover:tracking-widest transition-all uppercase">+1 800-MED-CARE</p>
                </div>
              </div>
              <p className="text-[13px] sm:text-base text-rose-50 font-bold mb-8 sm:mb-10 leading-relaxed italic">
                Our global medical concierge is standing by <span className="underline decoration-2 underline-offset-4">24/7/365</span> for immediate deployment of emergency wealth-care.
              </p>
              <Button variant="primary" size="lg" className="w-full bg-white text-rose-600 font-black py-4 px-10 shadow-xl hover:bg-rose-50 transform hover:-translate-y-1 transition-all uppercase tracking-widest text-xs sm:text-sm">
                In-Case-of-Emergency Card
                <ArrowRight className="w-5 h-5 ml-3" />
              </Button>
            </div>

            {/* Eligibility Note */}
            <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 shadow-inner">
              <p className="text-[11px] sm:text-sm text-neutral-600 dark:text-neutral-400 font-bold leading-relaxed">
                <span className="font-black text-rose-600 uppercase tracking-tighter mr-2 italic">Note:</span> 
                Complimentary for Private Banking members with AUM exceeding $1M. Additional family legacy members added at custom rates.
              </p>
            </div>
          </motion.div>
        </div>
      </Container>
    </Section>
  );
};

export default SponsoredMedicair;
