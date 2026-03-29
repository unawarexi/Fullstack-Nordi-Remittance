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
    <Section id="sponsored-medicair" className="py-16 lg:py-24 bg-gradient-to-b from-rose-50 to-white">
      <Container>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-sm font-medium mb-4">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {programFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={cn(
                "p-5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700",
                "hover:shadow-md hover:border-rose-300 transition-all"
              )}
            >
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">{feature.description}</p>
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
            className="p-6 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
          >
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-5 h-5 text-rose-600" />
              <h4 className="font-semibold text-neutral-900 dark:text-white">Comprehensive Coverage</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {coverageBenefits.map((benefit) => (
                <div key={benefit} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-rose-500" />
                  <span className="text-sm text-neutral-600 dark:text-neutral-300">{benefit}</span>
                </div>
              ))}
            </div>

            {/* Coverage Limit */}
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-neutral-600 dark:text-neutral-300">Annual Coverage Limit</span>
                <Award className="w-5 h-5 text-rose-600" />
              </div>
              <p className="text-3xl font-bold text-rose-600">$5,000,000</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Per member, per annum</p>
            </div>
          </motion.div>

          {/* Partner Network & CTA */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {/* Partner Hospitals */}
            <div className="p-6 rounded-2xl bg-neutral-900 text-white">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="w-5 h-5 text-rose-400" />
                <h4 className="font-semibold">Global Hospital Network</h4>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {partnerHospitals.map((hospital) => (
                  <div
                    key={hospital}
                    className="px-3 py-2 rounded-lg bg-white/10 text-sm"
                  >
                    {hospital}
                  </div>
                ))}
              </div>
              <p className="text-xs text-neutral-400">+ 500 more partner facilities worldwide</p>
            </div>

            {/* Emergency Contact */}
            <div className="p-6 rounded-2xl bg-rose-600 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-rose-100">24/7 Emergency Line</p>
                  <p className="text-xl font-bold">+1 800-MED-CARE</p>
                </div>
              </div>
              <p className="text-sm text-rose-100 mb-4">
                Our medical concierge team is available around the clock for 
                any health emergency or assistance you may need.
              </p>
              <Button variant="primary" className="w-full bg-white dark:bg-neutral-800 text-rose-600 hover:bg-rose-50">
                Download Insurance Card
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            {/* Eligibility Note */}
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-700/50 border border-neutral-200 dark:border-neutral-700">
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                <span className="font-semibold">Note:</span> Medicair coverage is 
                complimentary for Private Banking members with AUM exceeding $1M. 
                Additional family members can be added at preferential rates.
              </p>
            </div>
          </motion.div>
        </div>
      </Container>
    </Section>
  );
};

export default SponsoredMedicair;
