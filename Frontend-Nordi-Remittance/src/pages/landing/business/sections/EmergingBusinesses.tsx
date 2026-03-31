// ============================================================================
// EMERGING BUSINESSES SECTION
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import {
  Rocket,
  Lightbulb,
  TrendingUp,
  Users,
  ArrowRight,
  Check,
  Gift,
  GraduationCap,
  Briefcase,
  Target,
} from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";
import { Button } from "@components/ui/Button";

// ========================
// STARTUP PROGRAMS
// ========================
interface StartupProgram {
  id: string;
  name: string;
  description: string;
  benefit: string;
  icon: React.ReactNode;
  color: string;
  features: string[];
}

const startupPrograms: StartupProgram[] = [
  {
    id: "seed",
    name: "Seed Stage",
    description: "For businesses 0-2 years old",
    benefit: "Free banking for 1 year",
    icon: <Lightbulb className="w-6 h-6" />,
    color: "bg-amber-50 dark:bg-amber-900/200",
    features: [
      "No monthly account fees",
      "Free business debit card",
      "Access to startup loans up to $50K",
      "Mentorship program access",
      "Networking events",
    ],
  },
  {
    id: "growth",
    name: "Growth Stage",
    description: "For scaling businesses 2-5 years",
    benefit: "Up to $500K credit facility",
    icon: <TrendingUp className="w-6 h-6" />,
    color: "bg-emerald-500",
    features: [
      "Preferential interest rates",
      "Revenue-based financing",
      "Multi-currency accounts",
      "Trade finance support",
      "Investor introductions",
    ],
  },
  {
    id: "accelerator",
    name: "Accelerator Program",
    description: "Intensive 12-week business program",
    benefit: "$100K in services & perks",
    icon: <Rocket className="w-6 h-6" />,
    color: "bg-indigo-50 dark:bg-indigo-900/300",
    features: [
      "Dedicated business advisor",
      "AWS/Google Cloud credits",
      "Legal & accounting services",
      "Pitch preparation",
      "Demo day with investors",
    ],
  },
];

// ========================
// SUCCESS STORIES
// ========================
const successStories = [
  {
    company: "TechFlow Solutions",
    founder: "Sarah M.",
    raised: "$2.5M",
    employees: "45",
    quote: "Nordea's startup program gave us the foundation to scale quickly.",
  },
  {
    company: "GreenLeaf Farms",
    founder: "David K.",
    raised: "$1.2M",
    employees: "28",
    quote: "The mentorship and funding access were game-changers for us.",
  },
  {
    company: "HealthPlus AI",
    founder: "Lisa T.",
    raised: "$5M",
    employees: "72",
    quote: "From seed funding to Series A, Nordea supported us every step.",
  },
];

// ========================
// PROGRAM CARD COMPONENT
// ========================
interface ProgramCardProps {
  program: StartupProgram;
  index: number;
}

const ProgramCard: React.FC<ProgramCardProps> = ({ program, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay: index * 0.1 }}
    className={cn(
      "relative flex flex-col h-full p-5 sm:p-6 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700",
      "hover:shadow-lg dark:hover:shadow-neutral-900/50 hover:border-neutral-300 transition-all duration-300"
    )}
  >
    {/* Icon */}
    <div className={cn("w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-white mb-3 sm:mb-4 shrink-0 shadow-md", program.color)}>
      {React.isValidElement(program.icon) 
        ? React.cloneElement(program.icon as React.ReactElement, { className: "w-5 h-5 sm:w-6 sm:h-6" })
        : program.icon}
    </div>

    {/* Header */}
    <h3 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white mb-1 leading-tight">{program.name}</h3>
    <p className="text-[13px] sm:text-sm text-neutral-500 dark:text-neutral-400 mb-4 leading-tight">{program.description}</p>

    {/* Benefit Badge */}
    <div className="py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 mb-4 sm:mb-5">
      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider mb-0.5">Key Benefit</p>
      <p className="text-base sm:text-lg font-bold text-emerald-700 dark:text-emerald-300 leading-tight">{program.benefit}</p>
    </div>

    {/* Features */}
    <ul className="space-y-1.5 sm:space-y-2 flex-1 mb-6 sm:mb-8">
      {program.features.map((feature) => (
        <li key={feature} className="flex items-start gap-2">
          <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
          <span className="text-[13px] sm:text-sm text-neutral-600 dark:text-neutral-300 leading-tight">{feature}</span>
        </li>
      ))}
    </ul>

    {/* CTA */}
    <Button variant="primary" className={cn("w-full text-sm py-2.5 sm:py-3 font-bold shadow-md", program.color, "hover:opacity-90")}>
      Apply Now
      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-1.5 sm:ml-2" />
    </Button>
  </motion.div>
);

// ========================
// MAIN COMPONENT
// ========================
const EmergingBusinesses: React.FC = () => {
  return (
    <Section id="emerging-businesses" background="light" className="py-10 sm:py-16 lg:py-24">
      <Container>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-8 sm:mb-12"
        >
          <span className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-amber-100 text-amber-700 dark:text-amber-300 text-[10px] sm:text-xs font-medium mb-3 sm:mb-4">
            <Rocket className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Emerging Businesses
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white mb-2 sm:mb-4 leading-tight">
            Fuel Your Startup's Growth
          </h2>
          <p className="text-sm sm:text-lg text-neutral-600 dark:text-neutral-300 px-4">
            Specialized banking programs designed to support startups and emerging 
            businesses at every stage of their journey.
          </p>
        </motion.div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {startupPrograms.map((program, index) => (
            <ProgramCard key={program.id} program={program} index={index} />
          ))}
        </div>

        {/* Success Stories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white text-center mb-6 sm:mb-8">
            Success Stories
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {successStories.map((story, index) => (
              <motion.div
                key={story.company}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="p-5 sm:p-6 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
              >
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-indigo-100 dark:bg-indigo-800/30 flex items-center justify-center text-indigo-600 font-bold text-sm sm:text-base">
                    {story.founder.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900 dark:text-white text-sm sm:text-base leading-tight">{story.company}</p>
                    <p className="text-[11px] sm:text-sm text-neutral-500 dark:text-neutral-400 leading-tight">Founded by {story.founder}</p>
                  </div>
                </div>
                <p className="text-[13px] sm:text-sm text-neutral-600 dark:text-neutral-300 italic mb-4 leading-relaxed">"{story.quote}"</p>
                <div className="flex gap-4 pt-3 sm:pt-4 border-t border-neutral-100 dark:border-neutral-700">
                  <div>
                    <p className="text-[10px] text-neutral-400 uppercase tracking-wider">Raised</p>
                    <p className="font-bold text-emerald-600 text-sm sm:text-base leading-tight">{story.raised}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-neutral-400 uppercase tracking-wider">Employees</p>
                    <p className="font-bold text-neutral-900 dark:text-white text-sm sm:text-base leading-tight">{story.employees}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 sm:mt-16 text-center p-6 sm:p-12 rounded-3xl bg-indigo-900 text-white border border-white/5 shadow-2xl relative overflow-hidden"
        >
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30L0 30z' fill='%23ffffff' fill-rule='evenodd'/%3E%3C/svg%3E")`,
              backgroundSize: '30px 30px'
            }} />
          </div>

          <div className="relative z-10">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-400/20 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg backdrop-blur-sm">
              <Gift className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400" />
            </div>
            <h3 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4 leading-tight">Join Our Startup Community</h3>
            <p className="text-sm sm:text-xl text-indigo-200 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
              Get access to exclusive events, mentorship opportunities, and connect 
              with other founders building the future of African tech.
            </p>
            <Button variant="primary" size="lg" className="w-full sm:w-auto bg-amber-400 hover:bg-amber-500 text-indigo-900 font-bold px-10 py-3.5 sm:py-4 shadow-xl">
              Apply for Startup Program
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
            </Button>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
};

export default EmergingBusinesses;
