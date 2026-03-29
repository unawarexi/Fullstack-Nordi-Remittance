// ============================================================================
// ABOUT PRIVATE BANK SECTION
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Award,
  Users,
  Globe,
  ArrowRight,
  History,
  Target,
  Heart,
  Shield,
  TrendingUp,
} from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";
import { Button } from "@components/ui/Button";

// ========================
// MILESTONES
// ========================
interface Milestone {
  year: string;
  title: string;
  description: string;
}

const milestones: Milestone[] = [
  { year: "1998", title: "Private Banking Established", description: "Launched dedicated private banking division" },
  { year: "2005", title: "Investment Advisory", description: "Introduced discretionary portfolio management" },
  { year: "2012", title: "Family Office Services", description: "Expanded to multi-generational wealth planning" },
  { year: "2018", title: "Global Partnerships", description: "Strategic alliances with global private banks" },
  { year: "2023", title: "$5B AUM Milestone", description: "Reached record assets under management" },
];

// ========================
// VALUES
// ========================
const values = [
  { icon: Shield, title: "Discretion", description: "Absolute confidentiality in all dealings" },
  { icon: Target, title: "Excellence", description: "Uncompromising service standards" },
  { icon: Heart, title: "Relationships", description: "Long-term partnerships, not transactions" },
  { icon: TrendingUp, title: "Performance", description: "Consistent, risk-adjusted returns" },
];

// ========================
// AWARDS
// ========================
const awards = [
  { award: "Best Private Bank", org: "Euromoney", year: "2024" },
  { award: "Wealth Management Excellence", org: "Global Finance", year: "2024" },
  { award: "Outstanding Client Service", org: "The Banker", year: "2023" },
  { award: "Best Family Office", org: "PWM", year: "2023" },
];

// ========================
// MAIN COMPONENT
// ========================
const AboutPrivateBank: React.FC = () => {
  return (
    <Section id="about-private-bank" className="py-16 lg:py-24">
      <Container>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-sm font-medium mb-4">
            <Building2 className="w-4 h-4" />
            About Private Bank
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
            A Legacy of Trusted Stewardship
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-300">
            For over 25 years, we've been the trusted wealth partner for 
            discerning individuals and families across generations.
          </p>
        </motion.div>

        {/* Values Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
        >
          {values.map((value, index) => (
            <div
              key={value.title}
              className={cn(
                "p-5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-center",
                "hover:shadow-md hover:border-amber-300 transition-all"
              )}
            >
              <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-3">
                <value.icon className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-neutral-900 dark:text-white mb-1">{value.title}</h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">{value.description}</p>
            </div>
          ))}
        </motion.div>

        {/* Timeline & Awards */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-700/50 border border-neutral-100 dark:border-neutral-700"
          >
            <div className="flex items-center gap-3 mb-6">
              <History className="w-5 h-5 text-amber-600" />
              <h4 className="font-semibold text-neutral-900 dark:text-white">Our Journey</h4>
            </div>

            <div className="relative pl-8">
              <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-amber-200" />
              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.year}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="relative pb-6 last:pb-0"
                >
                  <div className="absolute left-0 w-6 h-6 -translate-x-1/2 rounded-full bg-amber-50 dark:bg-amber-900/200 flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-white dark:bg-neutral-800" />
                  </div>
                  <div className="ml-4">
                    <span className="text-xs font-semibold text-amber-600">{milestone.year}</span>
                    <h5 className="font-semibold text-neutral-900 dark:text-white">{milestone.title}</h5>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">{milestone.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Awards */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-6 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white"
          >
            <div className="flex items-center gap-3 mb-6">
              <Award className="w-5 h-5" />
              <h4 className="font-semibold">Recognition & Awards</h4>
            </div>

            <div className="space-y-4 mb-6">
              {awards.map((award) => (
                <div
                  key={award.award}
                  className="flex items-center gap-4 p-3 rounded-lg bg-white/10"
                >
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Award className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{award.award}</p>
                    <p className="text-xs text-amber-100">{award.org}</p>
                  </div>
                  <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded">{award.year}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/20">
              <div className="text-center">
                <p className="text-2xl font-bold">25+</p>
                <p className="text-xs text-amber-100">Years</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">2,500+</p>
                <p className="text-xs text-amber-100">Clients</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">$5B+</p>
                <p className="text-xs text-amber-100">AUM</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-neutral-600 dark:text-neutral-300 mb-4">
            Join the exclusive circle of clients who trust us with their wealth.
          </p>
          <Button variant="primary" className="bg-neutral-900 hover:bg-neutral-800">
            Explore Membership
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </Container>
    </Section>
  );
};

export default AboutPrivateBank;
