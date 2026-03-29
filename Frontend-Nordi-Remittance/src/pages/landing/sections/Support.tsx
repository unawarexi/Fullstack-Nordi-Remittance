// ============================================================================
// SUPPORT SECTION - Customer support channels
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import {
  Phone,
  Mail,
  MessageCircle,
  HelpCircle,
  Clock,
  Video,
  Calendar,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";

// ========================
// SUPPORT CHANNELS DATA
// ========================
interface SupportChannel {
  title: string;
  description: string;
  action: string;
  href: string;
  icon: React.ReactNode;
  availability: string;
  color: string;
}

const supportChannels: SupportChannel[] = [
  {
    title: "Call Us",
    description: "Speak directly with a banking specialist",
    action: "1-800-NORDEA",
    href: "tel:1-800-667332",
    icon: <Phone className="w-6 h-6" />,
    availability: "24/7",
    color: "bg-emerald-500",
  },
  {
    title: "Live Chat",
    description: "Get instant answers from our support team",
    action: "Start Chat",
    href: "#chat",
    icon: <MessageCircle className="w-6 h-6" />,
    availability: "24/7",
    color: "bg-indigo-50 dark:bg-indigo-900/300",
  },
  {
    title: "Email Support",
    description: "Send us a detailed message",
    action: "support@nordea.com",
    href: "mailto:support@nordea.com",
    icon: <Mail className="w-6 h-6" />,
    availability: "Response in 24h",
    color: "bg-violet-500",
  },
  {
    title: "Video Banking",
    description: "Face-to-face assistance from home",
    action: "Schedule Call",
    href: "/video-banking",
    icon: <Video className="w-6 h-6" />,
    availability: "Mon-Fri 9AM-6PM",
    color: "bg-rose-500",
  },
  {
    title: "Help Center",
    description: "Browse FAQs and guides",
    action: "Visit Help Center",
    href: "/help",
    icon: <HelpCircle className="w-6 h-6" />,
    availability: "Always available",
    color: "bg-amber-50 dark:bg-amber-900/200",
  },
  {
    title: "Book Appointment",
    description: "Schedule an in-branch meeting",
    action: "Book Now",
    href: "/appointments",
    icon: <Calendar className="w-6 h-6" />,
    availability: "Branch hours",
    color: "bg-teal-500",
  },
];

const quickHelp = [
  { question: "How do I reset my password?", href: "/help/password" },
  { question: "Report a lost or stolen card", href: "/help/lost-card" },
  { question: "Check my account balance", href: "/help/balance" },
  { question: "Set up direct deposit", href: "/help/direct-deposit" },
  { question: "Update my contact information", href: "/help/contact-info" },
];

// ========================
// SUPPORT CARD COMPONENT
// ========================
interface SupportCardProps {
  channel: SupportChannel;
  index: number;
}

const SupportCard: React.FC<SupportCardProps> = ({ channel, index }) => (
  <motion.a
    href={channel.href}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay: index * 0.08 }}
    className={cn(
      "group block p-5 rounded-xl",
      "bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700",
      "hover:shadow-lg dark:hover:shadow-neutral-900/50 hover:border-neutral-200 dark:border-neutral-700 transition-all duration-300"
    )}
  >
    <div className="flex items-start gap-4">
      <div className={cn("p-3 rounded-xl text-white", channel.color)}>
        {channel.icon}
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-neutral-900 dark:text-white group-hover:text-indigo-600 transition-colors">
          {channel.title}
        </h4>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{channel.description}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs text-neutral-400">
            <Clock className="w-3.5 h-3.5" />
            {channel.availability}
          </span>
          <span className="text-sm font-medium text-indigo-600 group-hover:underline">
            {channel.action}
          </span>
        </div>
      </div>
    </div>
  </motion.a>
);

// ========================
// MAIN COMPONENT
// ========================
const Support: React.FC = () => {
  return (
    <Section background="white" className="py-12 lg:py-16">
      <Container size="xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left - Support Channels */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block px-3 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 rounded-full mb-3">
                Get Help
              </span>
              <h2 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white">
                We're Here to Help
              </h2>
              <p className="mt-2 text-neutral-600 dark:text-neutral-300">
                Choose your preferred way to connect with our support team.
              </p>
            </motion.div>

            {/* Support Channels Grid */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {supportChannels.map((channel, index) => (
                <SupportCard key={channel.title} channel={channel} index={index} />
              ))}
            </div>
          </div>

          {/* Right - Quick Help */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className={cn(
                "p-6 rounded-xl",
                "bg-neutral-50 dark:bg-neutral-700/50 border border-neutral-100 dark:border-neutral-700"
              )}
            >
              <h3 className="font-semibold text-neutral-900 dark:text-white">Quick Help</h3>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                Popular questions and resources
              </p>

              <ul className="mt-5 space-y-3">
                {quickHelp.map((item, index) => (
                  <motion.li
                    key={item.question}
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <a
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 py-2 px-3 rounded-lg",
                        "text-sm text-neutral-700 dark:text-neutral-200",
                        "hover:bg-white dark:bg-neutral-800 hover:text-indigo-600 transition-colors",
                        "group"
                      )}
                    >
                      <HelpCircle className="w-4 h-4 text-neutral-400 group-hover:text-indigo-500" />
                      <span className="flex-1">{item.question}</span>
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </motion.li>
                ))}
              </ul>

              <div className="mt-6 pt-5 border-t border-neutral-200 dark:border-neutral-700">
                <a
                  href="/help"
                  className={cn(
                    "flex items-center justify-center gap-2 w-full py-2.5 rounded-lg",
                    "text-sm font-medium",
                    "bg-indigo-600 text-white",
                    "hover:bg-indigo-700 transition-colors"
                  )}
                >
                  Visit Help Center
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </motion.div>

            {/* Emergency Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className={cn(
                "mt-4 p-5 rounded-xl",
                "bg-rose-50 border border-rose-100"
              )}
            >
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-rose-900 text-sm">
                    Lost Card? Act Fast
                  </h4>
                  <p className="mt-1 text-xs text-rose-700">
                    Report immediately to prevent unauthorized use.
                  </p>
                  <a
                    href="tel:1-800-LOCKCARD"
                    className="inline-block mt-2 text-sm font-medium text-rose-600 hover:underline"
                  >
                    1-800-LOCKCARD
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default Support;
