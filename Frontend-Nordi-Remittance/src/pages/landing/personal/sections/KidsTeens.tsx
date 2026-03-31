// ============================================================================
// KIDS & TEENS SECTION - Personal Banking
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import {
  Users,
  GraduationCap,
  PiggyBank,
  Target,
  Shield,
  Smartphone,
  ArrowRight,
  Check,
  Star,
  Gift,
  Gamepad2,
} from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";
import { Button } from "@components/ui/Button";

// ========================
// YOUTH ACCOUNTS DATA
// ========================
interface YouthAccount {
  id: string;
  name: string;
  ageRange: string;
  description: string;
  features: string[];
  benefits: string[];
  icon: React.ReactNode;
  color: string;
  highlight: string;
}

const youthAccounts: YouthAccount[] = [
  {
    id: "kids-saver",
    name: "Kids Saver",
    ageRange: "Ages 0-12",
    description: "Start building good financial habits early with a safe savings account",
    icon: <PiggyBank className="w-6 h-6" />,
    color: "bg-pink-500",
    highlight: "Learn to Save",
    features: [
      "No minimum balance",
      "Competitive interest rate (3.5% APY)",
      "Fun savings challenges",
      "Parent-managed account",
      "Birthday bonus rewards",
    ],
    benefits: [
      "Visual savings goals",
      "Reward stickers for milestones",
      "Educational money games",
    ],
  },
  {
    id: "teen-checking",
    name: "Teen Checking",
    ageRange: "Ages 13-17",
    description: "Real banking experience with parental oversight and spending controls",
    icon: <Users className="w-6 h-6" />,
    color: "bg-violet-500",
    highlight: "Most Popular",
    features: [
      "Debit card with spending limits",
      "Mobile banking app access",
      "Real-time transaction alerts",
      "Parental controls & monitoring",
      "Direct deposit for allowance",
      "No monthly fees",
    ],
    benefits: [
      "Learn budgeting skills",
      "Safe online shopping",
      "Earn rewards for saving",
    ],
  },
  {
    id: "student-banking",
    name: "Student Banking",
    ageRange: "Ages 18-24",
    description: "Designed for college students with exclusive perks and no fees",
    icon: <GraduationCap className="w-6 h-6" />,
    color: "bg-blue-500",
    highlight: "College Ready",
    features: [
      "No monthly maintenance fee",
      "Free unlimited transactions",
      "Student discounts program",
      "Overdraft grace period",
      "Credit builder program",
      "International student friendly",
    ],
    benefits: [
      "Build credit history",
      "Financial literacy resources",
      "Career prep tools",
    ],
  },
];

// ========================
// LEARNING FEATURES
// ========================
const learningFeatures = [
  {
    icon: Target,
    title: "Goal Setting",
    description: "Set and track savings goals visually",
  },
  {
    icon: Shield,
    title: "Safe & Secure",
    description: "FDIC insured with parental controls",
  },
  {
    icon: Smartphone,
    title: "Mobile App",
    description: "Age-appropriate banking app",
  },
  {
    icon: Gamepad2,
    title: "Learn & Play",
    description: "Educational games about money",
  },
];

// ========================
// ACCOUNT CARD COMPONENT
// ========================
interface AccountCardProps {
  account: YouthAccount;
  index: number;
}

const AccountCard: React.FC<AccountCardProps> = ({ account, index }) => (
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
    {/* Highlight Badge */}
    <div className="absolute -top-3 left-4 sm:left-6">
      <span className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 text-white text-[10px] font-medium rounded-full",
        account.color
      )}>
        <Star className="w-2.5 h-2.5" />
        {account.highlight}
      </span>
    </div>

    {/* Header */}
    <div className="flex items-start gap-3 sm:gap-4 mt-1.5 sm:mt-2 mb-3 sm:mb-4">
      <div className={cn("p-2.5 sm:p-3 rounded-xl text-white", account.color)}>
        {React.cloneElement(account.icon as React.ReactElement, { className: "w-5 h-5 sm:w-6 sm:h-6" })}
      </div>
      <div>
        <h3 className="text-lg sm:text-xl font-semibold text-neutral-900 dark:text-white leading-tight">{account.name}</h3>
        <p className="text-xs sm:text-sm text-indigo-600 font-medium leading-tight">{account.ageRange}</p>
      </div>
    </div>

    {/* Description */}
    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">{account.description}</p>

    {/* Features */}
    <div className="flex-1">
      <p className="text-xs font-semibold text-neutral-400 uppercase mb-2">Features</p>
      <ul className="space-y-2 mb-4">
        {account.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-neutral-600 dark:text-neutral-300">{feature}</span>
          </li>
        ))}
      </ul>

      <p className="text-xs font-semibold text-neutral-400 uppercase mb-2">Benefits</p>
      <div className="flex flex-wrap gap-2 mb-6">
        {account.benefits.map((benefit) => (
          <span
            key={benefit}
            className="px-2 py-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 text-xs rounded"
          >
            {benefit}
          </span>
        ))}
      </div>
    </div>

    {/* CTA */}
    <Button variant="primary" className={cn("w-full py-1.5 sm:py-2 text-sm", account.color, "hover:opacity-90")}>
      Open Account
      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1.5 sm:ml-2" />
    </Button>
  </motion.div>
);

// ========================
// MAIN COMPONENT
// ========================
const KidsTeens: React.FC = () => {
  return (
    <Section id="kids-teens" className="py-10 sm:py-16 lg:py-24">
      <Container>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-8 sm:mb-12"
        >
          <span className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-violet-100 text-violet-700 text-[10px] sm:text-xs font-medium mb-3 sm:mb-4">
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Kids & Teens Banking
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white mb-2 sm:mb-4">
            Building Financial Skills For The Future
          </h2>
          <p className="text-sm sm:text-lg text-neutral-600 dark:text-neutral-300">
            Help your children develop smart money habits with age-appropriate 
            banking accounts designed to teach financial responsibility.
          </p>
        </motion.div>

        {/* Learning Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-12"
        >
          {learningFeatures.map((feature) => (
            <div
              key={feature.title}
              className="text-center p-3 sm:p-4 rounded-xl bg-violet-50 border border-violet-100"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto rounded-full bg-violet-100 text-violet-600 flex items-center justify-center mb-2 sm:mb-3">
                <feature.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <p className="font-semibold text-neutral-900 dark:text-white text-[13px] sm:text-sm leading-tight">{feature.title}</p>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5 sm:mt-1 leading-tight">{feature.description}</p>
            </div>
          ))}
        </motion.div>

        {/* Accounts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {youthAccounts.map((account, index) => (
            <AccountCard key={account.id} account={account} index={index} />
          ))}
        </div>

        {/* Parent Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 sm:mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 sm:p-8 rounded-2xl bg-neutral-50 dark:bg-neutral-700/50"
        >
          <div>
            <Gift className="w-6 h-6 sm:w-8 sm:h-8 text-violet-500 mb-2 sm:mb-3" />
            <h3 className="text-lg sm:text-xl font-semibold text-neutral-900 dark:text-white mb-1.5 sm:mb-2">
              For Parents & Guardians
            </h3>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 mb-3 sm:mb-4">
              Stay connected to your child's financial journey with real-time alerts, 
              spending controls, and the ability to transfer funds instantly. 
              Teach them the value of money while keeping their savings secure.
            </p>
            <ul className="space-y-1.5 sm:space-y-2">
              {[
                "Set daily/weekly spending limits",
                "Block specific merchant categories",
                "Receive instant transaction notifications",
                "Easily transfer allowance money",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300">
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex items-center justify-center lg:border-l lg:border-neutral-200 dark:lg:border-neutral-700">
            <div className="text-center">
              <p className="text-4xl sm:text-5xl font-bold text-violet-600 mb-1 sm:mb-2 text-center">89%</p>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 max-w-xs mx-auto">
                of parents say our youth banking has improved their child's money management skills
              </p>
            </div>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
};

export default KidsTeens;
