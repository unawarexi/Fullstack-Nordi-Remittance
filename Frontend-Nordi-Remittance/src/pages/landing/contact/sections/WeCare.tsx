// ============================================================================
// WE CARE SECTION
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import {
  Heart,
  HeartHandshake,
  Users,
  Leaf,
  GraduationCap,
  Home,
  Stethoscope,
  ArrowRight,
  Check,
  HandHeart,
  Globe,
} from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";
import { Button } from "@components/ui/Button";

// ========================
// CSR PILLARS
// ========================
interface CSRPillar {
  icon: React.ReactNode;
  name: string;
  description: string;
  impact: string;
  color: string;
}

const csrPillars: CSRPillar[] = [
  {
    icon: <GraduationCap className="w-6 h-6" />,
    name: "Education",
    description: "Scholarships and school support programs across Nigeria",
    impact: "50,000+ students supported",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: <Stethoscope className="w-6 h-6" />,
    name: "Healthcare",
    description: "Medical outreach and healthcare facility donations",
    impact: "100+ hospitals supported",
    color: "from-rose-500 to-rose-600",
  },
  {
    icon: <Leaf className="w-6 h-6" />,
    name: "Environment",
    description: "Tree planting and sustainability initiatives",
    impact: "1M+ trees planted",
    color: "from-emerald-500 to-emerald-600",
  },
  {
    icon: <Home className="w-6 h-6" />,
    name: "Community",
    description: "Infrastructure development in underserved communities",
    impact: "500+ projects completed",
    color: "from-amber-500 to-amber-600",
  },
];

// ========================
// IMPACT STATS
// ========================
const impactStats = [
  { value: "₦10B+", label: "CSR Investment" },
  { value: "5M+", label: "Lives Impacted" },
  { value: "774", label: "LGAs Reached" },
  { value: "15+", label: "Years of Impact" },
];

// ========================
// INITIATIVES
// ========================
const initiatives = [
  "Annual Back-to-School Program",
  "Community Health Outreach",
  "Financial Literacy Training",
  "Youth Empowerment Programs",
  "Disaster Relief Support",
  "Environmental Conservation",
];

// ========================
// MAIN COMPONENT
// ========================
const WeCare: React.FC = () => {
  return (
    <Section id="we-care" className="py-16 lg:py-24 bg-gradient-to-br from-rose-50 to-pink-50">
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
            We Care
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
            Making a Difference, One Community at a Time
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-300">
            At Remit Bank, we believe in giving back. Our Corporate Social Responsibility 
            initiatives touch lives across education, healthcare, environment, and community development.
          </p>
        </motion.div>

        {/* Impact Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 max-w-4xl mx-auto mb-12 sm:mb-20"
        >
          {impactStats.map((stat) => (
            <div key={stat.label} className="text-center p-4 sm:p-8 rounded-[2rem] bg-white dark:bg-neutral-800 border border-rose-100 dark:border-rose-900/30 shadow-sm hover:shadow-xl transition-all group">
              <p className="text-xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 tabular-nums tracking-tighter italic group-hover:scale-110 transition-transform">{stat.value}</p>
              <p className="text-[10px] sm:text-xs text-neutral-400 font-bold uppercase tracking-widest mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* CSR Pillars */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-12 sm:mb-20"
        >
          {csrPillars.map((pillar) => (
            <div
              key={pillar.name}
              className={cn(
                "p-8 rounded-[2.5rem] bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 shadow-xl group transition-all duration-500",
                "hover:shadow-2xl dark:hover:shadow-neutral-900/50 hover:border-rose-500/30"
              )}
            >
              <div className={cn(
                "w-14 h-14 rounded-2xl text-white flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 transition-transform duration-500",
                `bg-gradient-to-br ${pillar.color}`
              )}>
                {React.isValidElement(pillar.icon) 
                  ? React.cloneElement(pillar.icon as React.ReactElement, { className: "w-6 h-6" })
                  : pillar.icon}
              </div>
              <h3 className="text-lg sm:text-xl font-black text-neutral-900 dark:text-white mb-3 uppercase tracking-tight italic">{pillar.name}</h3>
              <p className="text-[13px] sm:text-sm text-neutral-500 dark:text-neutral-400 font-bold leading-relaxed mb-6">{pillar.description}</p>
              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-700">
                <p className="text-[11px] sm:text-xs font-black text-rose-600 uppercase tracking-widest">{pillar.impact}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Featured Initiative */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid lg:grid-cols-2 gap-8 items-center"
        >
          {/* Image Placeholder */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-rose-400 to-pink-500 h-80">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <HeartHandshake className="w-16 h-16 mx-auto mb-4 opacity-80" />
                <p className="text-xl font-bold">Together We Rise</p>
                <p className="text-rose-100">Building stronger communities</p>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>

          {/* Content */}
          <div>
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">Our Ongoing Initiatives</h3>
            <p className="text-neutral-600 dark:text-neutral-300 mb-6">
              We're committed to sustainable development and creating lasting positive impact 
              in the communities we serve. Here are some of our key programs:
            </p>

            <ul className="space-y-3 mb-6">
              {initiatives.map((initiative) => (
                <li key={initiative} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-rose-600" />
                  </div>
                  <span className="text-neutral-700 dark:text-neutral-200">{initiative}</span>
                </li>
              ))}
            </ul>

            <div className="flex gap-3">
              <Button variant="primary" className="bg-rose-600 hover:bg-rose-700">
                <HandHeart className="w-4 h-4 mr-2" />
                Get Involved
              </Button>
              <Button variant="outline" className="border-rose-300 text-rose-600 hover:bg-rose-50">
                <Globe className="w-4 h-4 mr-2" />
                View Impact Report
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Partner CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 p-6 rounded-2xl bg-white dark:bg-neutral-800 border border-rose-200 text-center"
        >
          <Users className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Partner With Us</h3>
          <p className="text-neutral-600 dark:text-neutral-300 max-w-xl mx-auto mb-4">
            Are you an NGO, community organization, or social enterprise? 
            Let's collaborate to create meaningful impact together.
          </p>
          <Button variant="secondary" className="bg-rose-100 text-rose-700 hover:bg-rose-200">
            Submit Partnership Proposal
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </Container>
    </Section>
  );
};

export default WeCare;
