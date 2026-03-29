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


const ContactUs: React.FC = () => {
  const contacts = [
    { icon: Phone, label: "Phone", value: "+1 (800) 123-4567", desc: "Mon–Fri, 8am–8pm EST", gradient: "from-indigo-500 to-purple-500" },
    { icon: Mail, label: "Email", value: "support@nordi.com", desc: "We reply within 24 hours", gradient: "from-emerald-500 to-teal-500" },
    { icon: MapPin, label: "Office", value: "123 Finance Street, NY", desc: "Visit us in person", gradient: "from-amber-500 to-orange-500" },
    { icon: Globe, label: "Website", value: "www.nordi.com", desc: "Help center & resources", gradient: "from-pink-500 to-rose-500" },
  ];

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Contact Us"
          subtitle="We're here to help — reach out anytime"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Support", href: "/customer/support" },
            { label: "Contact" },
          ]}
        />
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {contacts.map((c) => (
          <motion.div key={c.label} variants={dashboardItemVariants}>
            <DashCard className="cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${c.gradient} rounded-2xl flex items-center justify-center text-white flex-shrink-0`}>
                  <c.icon size={20} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">{c.label}</h3>
                  <p className="text-xs sm:text-sm font-medium text-indigo-600 dark:text-indigo-400">{c.value}</p>
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5">{c.desc}</p>
                </div>
              </div>
            </DashCard>
          </motion.div>
        ))}
      </div>

      <DashCard className="mt-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">Send a Message</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Name</label>
              <input type="text" placeholder="Your name" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input type="email" placeholder="your@email.com" className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Subject</label>
            <input type="text" placeholder="How can we help?" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Message</label>
            <textarea rows={4} placeholder="Describe your issue…" className={`${inputCls} resize-none`} />
          </div>
          <motion.button
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-xs sm:text-sm font-medium"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <Send size={16} /> Send Message
          </motion.button>
        </div>
      </DashCard>
    </PageContainer>
  );
};

export default ContactUs;
