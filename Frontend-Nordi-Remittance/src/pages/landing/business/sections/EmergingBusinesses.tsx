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
      "relative flex flex-col h-full p-6 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700",
      "hover:shadow-lg dark:hover:shadow-neutral-900/50 hover:border-neutral-300 transition-all duration-300"
    )}
  >
    {/* Icon */}
    <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center text-white mb-4", program.color)}>
      {program.icon}
    </div>

    {/* Header */}
    <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-1">{program.name}</h3>
    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">{program.description}</p>

    {/* Benefit Badge */}
    <div className="py-3 px-4 rounded-lg bg-emerald-50 border border-emerald-100 mb-4">
      <p className="text-xs text-emerald-600 font-medium">Key Benefit</p>
      <p className="text-lg font-bold text-emerald-700">{program.benefit}</p>
    </div>

    {/* Features */}
    <ul className="space-y-2 flex-1 mb-6">
      {program.features.map((feature) => (
        <li key={feature} className="flex items-start gap-2">
          <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
          <span className="text-sm text-neutral-600 dark:text-neutral-300">{feature}</span>
        </li>
      ))}
    </ul>

    {/* CTA */}
    <Button variant="primary" className={cn("w-full", program.color, "hover:opacity-90")}>
      Apply Now
      <ArrowRight className="w-4 h-4 ml-2" />
    </Button>
  </motion.div>
);

// ========================
// MAIN COMPONENT
// ========================
const EmergingBusinesses: React.FC = () => {
  return (
    <Section id="emerging-businesses" background="light" className="py-16 lg:py-24">
      <Container>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 dark:text-amber-300 text-sm font-medium mb-4">
            <Rocket className="w-4 h-4" />
            Emerging Businesses
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
            Fuel Your Startup's Growth
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-300">
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
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white text-center mb-8">
            Success Stories
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {successStories.map((story, index) => (
              <motion.div
                key={story.company}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="p-6 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-800/30 flex items-center justify-center text-indigo-600 font-bold">
                    {story.founder.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900 dark:text-white">{story.company}</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Founded by {story.founder}</p>
                  </div>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-300 italic mb-4">"{story.quote}"</p>
                <div className="flex gap-4 pt-4 border-t border-neutral-100 dark:border-neutral-700">
                  <div>
                    <p className="text-xs text-neutral-400">Raised</p>
                    <p className="font-bold text-emerald-600">{story.raised}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400">Employees</p>
                    <p className="font-bold text-neutral-900 dark:text-white">{story.employees}</p>
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
          className="mt-12 text-center p-8 rounded-2xl bg-indigo-900 text-white"
        >
          <Gift className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-3">Join Our Startup Community</h3>
          <p className="text-indigo-200 mb-6 max-w-xl mx-auto">
            Get access to exclusive events, mentorship opportunities, and connect 
            with other founders building the future.
          </p>
          <Button variant="primary" size="lg" className="bg-amber-50 dark:bg-amber-900/200 hover:bg-amber-600">
            Apply for Startup Program
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </Container>
    </Section>
  );
};

export default EmergingBusinesses;
