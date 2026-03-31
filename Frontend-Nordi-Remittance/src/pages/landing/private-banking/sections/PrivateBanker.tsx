// ============================================================================
// EXCLUSIVE PRIVATE BANKER SECTION
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import {
  Users,
  Shield,
  Clock,
  Phone,
  ArrowRight,
  Check,
  Award,
  Briefcase,
  MessageSquare,
  Calendar,
} from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";
import { Button } from "@components/ui/Button";

// ========================
// SERVICES
// ========================
interface BankerService {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

const bankerServices: BankerService[] = [
  {
    id: "dedicated",
    name: "Dedicated Relationship Manager",
    description: "A single point of contact for all your banking and wealth needs",
    icon: <Users className="w-6 h-6" />,
  },
  {
    id: "24-7",
    name: "24/7 Priority Access",
    description: "Round-the-clock access to your banker and support team",
    icon: <Clock className="w-6 h-6" />,
  },
  {
    id: "planning",
    name: "Comprehensive Financial Planning",
    description: "Holistic wealth strategy covering investments, tax, and estate",
    icon: <Briefcase className="w-6 h-6" />,
  },
  {
    id: "family",
    name: "Family Office Services",
    description: "Multi-generational wealth management and succession planning",
    icon: <Shield className="w-6 h-6" />,
  },
];

// ========================
// BANKER PROFILES
// ========================
interface BankerProfile {
  name: string;
  title: string;
  specialty: string;
  experience: string;
  initials: string;
}

const bankerProfiles: BankerProfile[] = [
  { name: "Victoria Okafor", title: "Senior Private Banker", specialty: "UHNW Clients", experience: "18 years", initials: "VO" },
  { name: "James Adebayo", title: "Private Banker", specialty: "Investment Advisory", experience: "12 years", initials: "JA" },
  { name: "Fatima Hassan", title: "Private Banker", specialty: "Family Office", experience: "15 years", initials: "FH" },
];

// ========================
// MAIN COMPONENT
// ========================
const PrivateBanker: React.FC = () => {
  return (
    <Section id="private-banker" className="py-16 lg:py-24 bg-neutral-50 dark:bg-neutral-700/50">
      <Container>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 dark:text-amber-300 text-sm font-medium mb-4">
            <Users className="w-4 h-4" />
            Exclusive Private Banker
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
            Your Dedicated Wealth Partner
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-300">
            Experience the highest level of personalized banking with a dedicated 
            private banker who understands your unique financial aspirations.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-12 sm:mb-20">
          {bankerServices.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={cn(
                "p-4 sm:p-6 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 transition-all group",
                "hover:shadow-xl hover:border-amber-400 hover:-translate-y-1"
              )}
            >
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-amber-400/10 text-amber-600 flex items-center justify-center mb-3 sm:mb-5 group-hover:scale-110 transition-transform shadow-inner">
                {React.isValidElement(service.icon) 
                  ? React.cloneElement(service.icon as React.ReactElement, { className: "w-5 h-5 sm:w-7 sm:h-7" })
                  : service.icon}
              </div>
              <h3 className="font-bold text-[13px] sm:text-base text-neutral-900 dark:text-white mb-1.5 sm:mb-2 uppercase tracking-tight leading-tight">{service.name}</h3>
              <p className="text-[10px] sm:text-[13px] text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed">{service.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Private Banker Experience */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left - Features */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-6 sm:p-10 rounded-3xl bg-neutral-900 text-white shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full -mr-32 -mt-32 blur-[80px]" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8 sm:mb-12">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center shadow-lg">
                  <Award className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight">Private Difference</h3>
              </div>

              <ul className="space-y-3 sm:space-y-4 mb-8 sm:mb-12">
                {[
                  "Direct cell access to your private banker",
                  "Guaranteed same-day response",
                  "Annual strategic wealth forensic audits",
                  "VIP access to exclusive networking events",
                  "Concierge processing for all requests",
                  "Global lifestyle & concierge services",
                  "Worldwide airport lounge infinity access",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-4 group">
                    <div className="w-5 h-5 rounded-full bg-amber-400/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Check className="w-3 h-3 text-amber-400 font-bold" />
                    </div>
                    <span className="text-[13px] sm:text-sm text-neutral-200 font-bold group-hover:text-white transition-colors">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="primary" size="lg" className="w-full sm:w-auto bg-amber-400 hover:bg-amber-500 text-neutral-900 font-bold py-4 px-8 shadow-xl shadow-amber-400/20">
                  <Phone className="w-5 h-5 mr-3" />
                  Request a Call
                </Button>
                <Button variant="outline" size="lg" className="w-full sm:w-auto border-white/20 text-white hover:bg-white/5 font-bold py-4 px-8">
                  <Calendar className="w-5 h-5 mr-3" />
                  Book Meeting
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Right - Banker Profiles */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <h4 className="text-sm font-black text-neutral-400 uppercase tracking-[0.2em] mb-6">World-Class Private Bankers</h4>
              
              {bankerProfiles.map((banker) => (
                <div
                  key={banker.name}
                  className={cn(
                    "group flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 shadow-sm transition-all",
                    "hover:shadow-xl hover:border-amber-400 hover:-translate-x-1"
                  )}
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-black text-xl shadow-lg group-hover:rotate-3 transition-transform shrink-0">
                    {banker.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-black text-neutral-900 dark:text-white text-base sm:text-lg tracking-tight truncate">{banker.name}</h5>
                    <p className="text-[11px] sm:text-xs text-amber-600 font-black uppercase tracking-widest leading-none mb-2">{banker.title}</p>
                    <div className="flex items-center gap-3 text-[10px] sm:text-[11px] text-neutral-500 dark:text-neutral-400 font-bold uppercase tracking-tighter">
                      <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> {banker.specialty}</span>
                      <span className="text-neutral-300">•</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {banker.experience}</span>
                    </div>
                  </div>
                  <Button variant="ghost" className="w-10 h-10 p-0 text-amber-600 hover:bg-amber-400/10 group-hover:scale-110 transition-transform flex items-center justify-center">
                    <MessageSquare className="w-6 h-6" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Contact Card */}
            <div className="p-6 rounded-3xl bg-amber-400/5 border border-amber-400/20 shadow-inner group hover:bg-amber-400/10 transition-colors">
              <p className="text-[13px] sm:text-sm text-neutral-600 dark:text-neutral-200 font-bold leading-relaxed mb-4">
                Ready to experience legacy banking? Let us match you with the perfect wealth consultant for your global aspirations.
              </p>
              <Button variant="ghost" className="text-amber-600 font-black uppercase tracking-[0.2em] text-[11px] sm:text-xs p-0 h-auto group-hover:translate-x-1 transition-transform">
                Find My Banker
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </Container>
    </Section>
  );
};

export default PrivateBanker;
