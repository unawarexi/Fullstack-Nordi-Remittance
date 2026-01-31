// ============================================================================
// STATISTICS SECTION - Key banking metrics and numbers
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import { Users, Building2, Globe, TrendingUp, Award, Clock } from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";
import { Grid } from "@components/layout/Grid";

// ========================
// STATS DATA
// ========================
interface Stat {
  value: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const stats: Stat[] = [
  {
    value: "2.5M+",
    label: "Active Customers",
    description: "Trust us with their finances",
    icon: <Users className="w-6 h-6" />,
  },
  {
    value: "150+",
    label: "Branch Locations",
    description: "Across the country",
    icon: <Building2 className="w-6 h-6" />,
  },
  {
    value: "35+",
    label: "Years of Service",
    description: "Building trust since 1989",
    icon: <Clock className="w-6 h-6" />,
  },
  {
    value: "50+",
    label: "Countries",
    description: "International presence",
    icon: <Globe className="w-6 h-6" />,
  },
  {
    value: "$85B",
    label: "Assets Managed",
    description: "In customer investments",
    icon: <TrendingUp className="w-6 h-6" />,
  },
  {
    value: "98%",
    label: "Satisfaction Rate",
    description: "Customer happiness score",
    icon: <Award className="w-6 h-6" />,
  },
];

// ========================
// STAT CARD COMPONENT
// ========================
interface StatCardProps {
  stat: Stat;
  index: number;
}

const StatCard: React.FC<StatCardProps> = ({ stat, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className={cn(
        "relative p-6 rounded-xl",
        "bg-white border border-neutral-100",
        "hover:shadow-lg hover:border-indigo-100 transition-all duration-300",
        "group cursor-default"
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "flex-shrink-0 p-3 rounded-lg",
            "bg-indigo-50 text-indigo-600",
            "group-hover:bg-indigo-100 transition-colors"
          )}
        >
          {stat.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-3xl font-bold text-neutral-900 tracking-tight">
            {stat.value}
          </div>
          <div className="text-sm font-semibold text-neutral-700 mt-1">
            {stat.label}
          </div>
          <div className="text-xs text-neutral-500 mt-0.5">
            {stat.description}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ========================
// MAIN COMPONENT
// ========================
const Statistics: React.FC = () => {
  return (
    <Section background="light" className="py-12 lg:py-16">
      <Container size="xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="inline-block px-3 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-full mb-3">
            Our Impact
          </span>
          <h2 className="text-2xl lg:text-3xl font-bold text-neutral-900">
            Trusted by Millions Worldwide
          </h2>
          <p className="mt-2 text-neutral-600 max-w-2xl mx-auto">
            For over three decades, we've been helping individuals and businesses achieve their financial goals.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <Grid cols={{ xs: 1, sm: 2, lg: 3 }} gap="md">
          {stats.map((stat, index) => (
            <StatCard key={stat.label} stat={stat} index={index} />
          ))}
        </Grid>
      </Container>
    </Section>
  );
};

export default Statistics;
