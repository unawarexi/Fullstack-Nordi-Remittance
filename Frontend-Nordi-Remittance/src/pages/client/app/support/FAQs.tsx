// ============================================================================
// SUPPORT SUB-PAGES — Contact Us, Live Chat, FAQs, Appointment
// Dark mode + DashboardPrimitives + grey borders + responsive typography
// ============================================================================

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone, Mail, MapPin, MessageCircle, HelpCircle,
  Calendar, ChevronDown, ChevronUp, Send, Clock,
  Headphones, Globe, ExternalLink,
} from "@constants/icons";
import PageHeader from "@components/shared/PageHeader";
import {
  PageContainer, DashCard,
} from "@components/shared/DashboardPrimitives";
import { dashboardItemVariants } from "@core/animation/Animation";
import { useToastStore } from "@store/toast.store";

const inputCls =
  "w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors";
const labelCls = "block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";


const FAQs: React.FC = () => {
  const [openId, setOpenId] = useState<number | null>(null);

  const faqs = [
    { q: "How do I reset my password?", a: "Go to Settings > Security > Change Password, or click 'Forgot Password' on the login page. You'll receive a verification email to reset your password." },
    { q: "How long do transfers take?", a: "Domestic transfers are usually instant or within 1–2 business hours. International transfers may take 1–3 business days depending on the destination." },
    { q: "What are the transfer fees?", a: "Domestic transfers are free for amounts under $5,000/month. International transfers have a competitive fee starting at 0.5% of the transfer amount." },
    { q: "How do I enable two-factor authentication?", a: "Navigate to Settings > Security > Two-Factor Authentication and follow the setup guide. You can use SMS, email, or an authenticator app." },
    { q: "Can I have multiple accounts?", a: "Yes! You can open multiple savings and current accounts in different currencies. Visit Accounts > Open New Account to get started." },
    { q: "How do I dispute a transaction?", a: "Contact our support team via Live Chat or call us. You can also go to Transactions, find the transaction, and click 'Report Issue'." },
  ];

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="FAQs"
          subtitle="Find answers to common questions"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Support", href: "/customer/support" },
            { label: "FAQs" },
          ]}
        />
      </motion.div>

      <div className="max-w-2xl space-y-2">
        {faqs.map((faq, i) => (
          <motion.div key={i} variants={dashboardItemVariants}>
            <DashCard className="cursor-pointer" onClick={() => setOpenId(openId === i ? null : i)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                    <HelpCircle size={14} />
                  </div>
                  <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{faq.q}</h4>
                </div>
                {openId === i ? (
                  <ChevronUp size={16} className="text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
                )}
              </div>
              <AnimatePresence>
                {openId === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </DashCard>
          </motion.div>
        ))}
      </div>
    </PageContainer>
  );
};

export default FAQs;
