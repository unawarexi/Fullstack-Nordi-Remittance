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
    <Section id="dormant-accounts" className="py-16 lg:py-24">
      <Container>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-medium mb-4">
            <AlertCircle className="w-4 h-4" />
            Dormant Accounts
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
            Reactivate Your Dormant Account
          </h2>
          <p className="text-lg text-neutral-600">
            Haven't used your account in a while? Don't worry – reactivating your 
            dormant account is simple. Follow these steps to regain full access to your funds.
          </p>
        </motion.div>

        {/* Alert Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col md:flex-row items-start md:items-center gap-4"
        >
          <div className="p-2 rounded-lg bg-amber-100">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-neutral-900">Account Inactive?</h3>
            <p className="text-sm text-neutral-600">
              If your account has had no activity for 12+ months, it may be classified as dormant. 
              Your funds are safe, but transactions are temporarily restricted.
            </p>
          </div>
          <Button variant="primary" className="bg-amber-500 hover:bg-amber-600 whitespace-nowrap">
            Check Account Status
          </Button>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Reactivation Steps */}
          <div className="lg:col-span-2">
            <h3 className="text-xl font-semibold text-neutral-900 mb-6">
              How to Reactivate Your Account
            </h3>
            <div className="space-y-4">
              {reactivationSteps.map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex gap-4 p-4 rounded-xl bg-white border border-neutral-200"
                >
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                      {step.step}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-neutral-900 flex items-center gap-2">
                      {step.title}
                      <step.icon className="w-4 h-4 text-neutral-400" />
                    </h4>
                    <p className="text-sm text-neutral-600 mt-1">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Required Documents */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-8 p-6 rounded-xl bg-neutral-50"
            >
              <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                Documents Required
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {requiredDocuments.map((doc) => (
                  <li key={doc} className="flex items-center gap-2 text-sm text-neutral-600">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
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
              className="p-6 rounded-xl bg-white border border-neutral-200"
            >
              <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-500" />
                Frequently Asked Questions
              </h3>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="pb-4 border-b border-neutral-100 last:border-0 last:pb-0">
                    <h4 className="font-medium text-neutral-900 text-sm mb-1">
                      {faq.question}
                    </h4>
                    <p className="text-xs text-neutral-500">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Contact Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-6 rounded-xl bg-indigo-900 text-white"
            >
              <h3 className="text-lg font-semibold mb-4">Need Assistance?</h3>
              <p className="text-sm text-indigo-200 mb-6">
                Our customer service team is ready to help you reactivate your account.
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-amber-400" />
                  <div>
                    <p className="text-sm font-medium">Call Us</p>
                    <p className="text-xs text-indigo-200">1-800-NORDEA (24/7)</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-amber-400" />
                  <div>
                    <p className="text-sm font-medium">Visit a Branch</p>
                    <p className="text-xs text-indigo-200">Mon-Fri: 9AM - 5PM</p>
                  </div>
                </div>
              </div>

              <Button variant="primary" className="w-full bg-amber-500 hover:bg-amber-600">
                Find Nearest Branch
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default DormantAccounts;
