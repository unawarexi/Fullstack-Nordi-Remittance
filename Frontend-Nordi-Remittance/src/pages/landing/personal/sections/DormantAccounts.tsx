// ============================================================================
// DORMANT ACCOUNTS SECTION - Personal Banking
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Clock,
  RefreshCw,
  FileText,
  Phone,
  ArrowRight,
  Check,
  Shield,
  HelpCircle,
  Building2,
} from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";
import { Button } from "@components/ui/Button";

// ========================
// REACTIVATION STEPS
// ========================
const reactivationSteps = [
  {
    step: 1,
    title: "Verify Your Identity",
    description: "Visit any branch with valid ID (passport, driver's license, or national ID)",
    icon: Shield,
  },
  {
    step: 2,
    title: "Update Your Information",
    description: "Confirm or update your contact details, address, and next of kin",
    icon: FileText,
  },
  {
    step: 3,
    title: "Complete Reactivation Form",
    description: "Fill out and sign the account reactivation request form",
    icon: RefreshCw,
  },
  {
    step: 4,
    title: "Account Activated",
    description: "Your account will be reactivated within 24-48 hours",
    icon: Check,
  },
];

// ========================
// FAQ DATA
// ========================
const faqs = [
  {
    question: "What makes an account dormant?",
    answer: "An account becomes dormant after 12 months of no customer-initiated transactions. System-generated transactions like interest credits don't count.",
  },
  {
    question: "Are there any fees for dormant accounts?",
    answer: "No dormancy fees are charged. However, standard account maintenance fees may still apply depending on your account type.",
  },
  {
    question: "Can I reactivate my account online?",
    answer: "For security reasons, dormant accounts must be reactivated in person at a branch with valid identification.",
  },
  {
    question: "What happens to unclaimed funds?",
    answer: "After 10 years of dormancy, unclaimed funds may be transferred to the regulatory authority as required by law. We make every effort to contact customers before this happens.",
  },
];

// ========================
// DOCUMENTS REQUIRED
// ========================
const requiredDocuments = [
  "Valid government-issued ID",
  "Proof of current address (utility bill, bank statement)",
  "Original debit card (if available)",
  "Account number or last statement",
];

// ========================
// MAIN COMPONENT
// ========================
const DormantAccounts: React.FC = () => {
  return (
    <Section id="dormant-accounts" className="py-10 sm:py-16 lg:py-24">
      <Container>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-8 sm:mb-12"
        >
          <span className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-amber-100 text-amber-700 dark:text-amber-300 text-[10px] sm:text-xs font-medium mb-3 sm:mb-4">
            <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Dormant Accounts
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white mb-2 sm:mb-4">
            Reactivate Your Dormant Account
          </h2>
          <p className="text-sm sm:text-lg text-neutral-600 dark:text-neutral-300">
            Haven't used your account in a while? Don't worry – reactivating your 
            dormant account is simple. Follow these steps to regain full access to your funds.
          </p>
        </motion.div>

        {/* Alert Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 sm:mb-12 p-5 sm:p-6 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200"
        >
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="p-2 sm:p-3 rounded-xl bg-amber-100">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-white leading-tight">Account Inactive?</h3>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 mt-0.5 sm:mt-1 leading-tight">
                If your account has had no activity for 12+ months, it may be classified as dormant. 
                Your funds are safe, but transactions are temporarily restricted.
              </p>
            </div>
            <Button variant="primary" className="w-full md:w-auto bg-amber-50 dark:bg-amber-900/200 hover:bg-amber-600 whitespace-nowrap py-2 text-sm">
              Check Account Status
            </Button>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Reactivation Steps */}
          <div className="lg:col-span-2">
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-6">
              How to Reactivate Your Account
            </h3>
            <div className="space-y-3 sm:space-y-4">
              {reactivationSteps.map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
                >
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-indigo-100 dark:bg-indigo-800/30 text-indigo-600 flex items-center justify-center font-bold text-sm sm:text-base">
                      {step.step}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[15px] sm:text-base font-semibold text-neutral-900 dark:text-white flex items-center gap-2 leading-tight">
                      {step.title}
                      <step.icon className="w-3.5 h-3.5 text-neutral-400" />
                    </h4>
                    <p className="text-[11px] sm:text-sm text-neutral-600 dark:text-neutral-300 mt-1 leading-tight">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Required Documents */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-6 sm:mt-8 p-5 sm:p-6 rounded-xl bg-neutral-50 dark:bg-neutral-700/50"
            >
              <h3 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
                Documents Required
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                {requiredDocuments.map((doc) => (
                  <li key={doc} className="flex items-center gap-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300">
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 flex-shrink-0" />
                    {doc}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Sidebar - FAQs & Contact */}
          <div className="lg:col-span-1 space-y-6">
            {/* FAQs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-5 sm:p-6 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
            >
              <h3 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
                Frequently Asked Questions
              </h3>
              <div className="space-y-3 sm:space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="pb-3 sm:pb-4 border-b border-neutral-100 dark:border-neutral-700 last:border-0 last:pb-0">
                    <h4 className="font-medium text-neutral-900 dark:text-white text-[13px] sm:text-sm mb-1 leading-tight">
                      {faq.question}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 leading-tight">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Contact Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-5 sm:p-6 rounded-xl bg-indigo-900 text-white"
            >
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Need Assistance?</h3>
              <p className="text-xs sm:text-sm text-indigo-200 mb-4 sm:mb-6">
                Our customer service team is ready to help you reactivate your account.
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                  <div>
                    <p className="text-xs sm:text-sm font-medium">Call Us</p>
                    <p className="text-[11px] sm:text-xs text-indigo-200">1-800-NORDEA (24/7)</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                  <div>
                    <p className="text-xs sm:text-sm font-medium">Visit a Branch</p>
                    <p className="text-[11px] sm:text-xs text-indigo-200">Mon-Fri: 9AM - 5PM</p>
                  </div>
                </div>
              </div>
 
              <Button variant="primary" className="w-full bg-amber-50 dark:bg-amber-900/200 hover:bg-amber-600 py-2 text-sm">
                Find Nearest Branch
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1.5 sm:ml-2" />
              </Button>
            </motion.div>
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default DormantAccounts;
