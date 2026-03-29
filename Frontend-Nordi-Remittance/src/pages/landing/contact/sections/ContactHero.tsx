// ============================================================================
// CONTACT HERO SECTION
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import {
  Headphones,
  Phone,
  Mail,
  MessageSquare,
  MapPin,
  Clock,
  ArrowRight,
} from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";
import { Button } from "@components/ui/Button";

// ========================
// QUICK CONTACTS
// ========================
interface QuickContact {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext?: string;
  href?: string;
}

const quickContacts: QuickContact[] = [
  {
    icon: <Phone className="w-5 h-5" />,
    label: "Call Center",
    value: "0700-123-4567",
    subtext: "24/7 Support",
  },
  {
    icon: <Mail className="w-5 h-5" />,
    label: "Email",
    value: "support@remit.com",
    href: "mailto:support@remit.com",
  },
  {
    icon: <MessageSquare className="w-5 h-5" />,
    label: "WhatsApp",
    value: "+234 800 123 4567",
  },
  {
    icon: <MapPin className="w-5 h-5" />,
    label: "Head Office",
    value: "Lagos, Nigeria",
    subtext: "14/15 Prince Alaba Abiodun St",
  },
];

// ========================
// MAIN COMPONENT
// ========================
const ContactHero: React.FC = () => {
  return (
    <Section id="contact-hero" className="pt-24 pb-16 lg:pt-32 lg:pb-20 bg-gradient-to-br from-teal-900 via-teal-800 to-cyan-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <pattern id="contact-grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <circle cx="5" cy="5" r="1" fill="currentColor" />
          </pattern>
          <rect width="100" height="100" fill="url(#contact-grid)" />
        </svg>
      </div>

      {/* Glow Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/30 rounded-full blur-3xl" />

      <Container className="relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-sm font-medium mb-4">
              <Headphones className="w-4 h-4" />
              Customer Support
            </span>
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight">
              We're Here <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-teal-200">
                to Help
              </span>
            </h1>
            <p className="text-lg text-teal-100 mb-8 max-w-xl">
              Get in touch with our customer support team. We're available 24/7 
              to assist you with any questions, concerns, or feedback.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" className="bg-white dark:bg-neutral-800 text-teal-900 hover:bg-teal-50">
                <Phone className="w-4 h-4 mr-2" />
                Call Us Now
              </Button>
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                <MessageSquare className="w-4 h-4 mr-2" />
                Live Chat
              </Button>
            </div>
          </motion.div>

          {/* Quick Contacts Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">Quick Contact</h3>
              <div className="space-y-4">
                {quickContacts.map((contact) => (
                  <div
                    key={contact.label}
                    className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-teal-500/30 text-teal-300 flex items-center justify-center flex-shrink-0">
                      {contact.icon}
                    </div>
                    <div>
                      <p className="text-sm text-teal-200">{contact.label}</p>
                      <p className="font-semibold text-white">{contact.value}</p>
                      {contact.subtext && (
                        <p className="text-xs text-teal-300">{contact.subtext}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Hours */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 text-teal-200 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>24/7 Customer Support Available</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Navigation Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 flex flex-wrap justify-center gap-2"
        >
          {[
            "Branch Locator",
            "Agency Banking",
            "IVR Banking",
            "Customer Feedback",
            "WiFi Branches",
            "We Care",
          ].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium",
                "bg-white/10 text-white hover:bg-white/20 transition-colors"
              )}
            >
              {item}
            </a>
          ))}
        </motion.div>
      </Container>
    </Section>
  );
};

export default ContactHero;
