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
          className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-12 sm:mb-20"
        >
          {values.map((value, index) => (
            <div
              key={value.title}
              className={cn(
                "p-4 sm:p-6 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-center transition-all group",
                "hover:shadow-xl hover:border-amber-400 group-hover:scale-105"
              )}
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-2xl bg-amber-400/10 text-amber-600 flex items-center justify-center mb-3 sm:mb-5 shadow-inner group-hover:bg-amber-400 group-hover:text-white transition-all">
                <value.icon className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <h4 className="font-bold text-neutral-900 dark:text-white mb-1.5 sm:mb-2 text-sm sm:text-base uppercase tracking-tight">{value.title}</h4>
              <p className="text-[10px] sm:text-[13px] text-neutral-500 dark:text-neutral-400 leading-relaxed group-hover:text-neutral-600 transition-colors">{value.description}</p>
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
            className="p-6 sm:p-10 rounded-3xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 shadow-sm"
          >
            <div className="flex items-center gap-4 mb-8 sm:mb-12">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-400/10 flex items-center justify-center">
                <History className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
              </div>
              <h4 className="text-lg sm:text-xl font-black text-neutral-900 dark:text-white uppercase tracking-tight">Our Journey</h4>
            </div>

            <div className="relative pl-8 sm:pl-10">
              <div className="absolute left-4 sm:left-5 top-0 bottom-0 w-[2px] bg-amber-200 dark:bg-amber-900/30" />
              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.year}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="relative pb-8 sm:pb-12 last:pb-0"
                >
                  <div className="absolute -left-[2.05rem] sm:-left-[2.55rem] w-6 h-6 rounded-full bg-amber-400 border-4 border-white dark:border-neutral-800 shadow-md flex items-center justify-center shrink-0 z-10" />
                  <div className="bg-white dark:bg-neutral-800/80 p-4 sm:p-6 rounded-2xl border border-neutral-100 dark:border-neutral-700 shadow-sm">
                    <span className="text-[10px] sm:text-xs font-black text-amber-600 uppercase tracking-[0.2em] mb-1 block">{milestone.year}</span>
                    <h5 className="font-bold text-neutral-900 dark:text-white text-base sm:text-lg mb-1 leading-tight">{milestone.title}</h5>
                    <p className="text-[12px] sm:text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">{milestone.description}</p>
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
            className="p-6 sm:p-10 rounded-3xl bg-neutral-900 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400/10 rounded-full -mr-24 -mt-24 blur-3xl opacity-50" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8 sm:mb-12">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center shadow-lg">
                  <Award className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <h4 className="text-lg sm:text-xl font-black uppercase tracking-tight">Global Recognition</h4>
              </div>

              <div className="space-y-3 sm:space-y-4 mb-10 sm:mb-16">
                {awards.map((award) => (
                  <div
                    key={award.award}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group cursor-default"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-400/10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                      <Award className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[13px] sm:text-base leading-tight truncate uppercase tracking-tight">{award.award}</p>
                      <p className="text-[10px] sm:text-xs text-amber-400/70 font-bold uppercase tracking-widest mt-0.5">{award.org}</p>
                    </div>
                    <span className="text-[10px] sm:text-xs font-black bg-white/10 px-2 sm:px-3 py-1.5 rounded-lg border border-white/5 tabular-nums">{award.year}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-8 sm:pt-10 border-t border-white/10 relative z-10 w-full">
              <div className="text-center group">
                <p className="text-xl sm:text-3xl font-black group-hover:text-amber-400 transition-colors leading-none tracking-tighter tabular-nums">25+</p>
                <p className="text-[9px] sm:text-[11px] text-neutral-400 font-black uppercase tracking-[0.2em] mt-2 group-hover:text-white transition-colors">Years</p>
              </div>
              <div className="text-center group border-x border-white/5">
                <p className="text-xl sm:text-3xl font-black group-hover:text-amber-400 transition-colors leading-none tracking-tighter tabular-nums">2,500+</p>
                <p className="text-[9px] sm:text-[11px] text-neutral-400 font-black uppercase tracking-[0.2em] mt-2 group-hover:text-white transition-colors">Clients</p>
              </div>
              <div className="text-center group">
                <p className="text-xl sm:text-3xl font-black group-hover:text-amber-400 transition-colors leading-none tracking-tighter tabular-nums">$5B+</p>
                <p className="text-[9px] sm:text-[11px] text-neutral-400 font-black uppercase tracking-[0.2em] mt-2 group-hover:text-white transition-colors">AUM</p>
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
