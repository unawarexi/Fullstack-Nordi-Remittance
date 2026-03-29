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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {bankerServices.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={cn(
                "p-5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700",
                "hover:shadow-md hover:border-amber-300 transition-all"
              )}
            >
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
                {service.icon}
              </div>
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">{service.name}</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">{service.description}</p>
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
            className="p-8 rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-800 text-white"
          >
            <div className="flex items-center gap-3 mb-6">
              <Award className="w-6 h-6 text-amber-400" />
              <h3 className="text-xl font-semibold">The Private Banking Difference</h3>
            </div>

            <ul className="space-y-4 mb-8">
              {[
                "Personal cell phone number of your private banker",
                "Same-day response guarantee",
                "Annual wealth review and strategy sessions",
                "Exclusive event invitations and networking",
                "Priority processing for all requests",
                "Complimentary notary and document services",
                "Airport lounge access worldwide",
                "Concierge services for lifestyle needs",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-amber-400 mt-0.5" />
                  <span className="text-neutral-200 text-sm">{item}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-3">
              <Button variant="primary" className="bg-amber-50 dark:bg-amber-900/200 hover:bg-amber-600 text-neutral-900 dark:text-white">
                <Phone className="w-4 h-4 mr-2" />
                Request a Call
              </Button>
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                <Calendar className="w-4 h-4 mr-2" />
                Book Meeting
              </Button>
            </div>
          </motion.div>

          {/* Right - Banker Profiles */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h4 className="font-semibold text-neutral-900 dark:text-white mb-4">Meet Our Private Bankers</h4>
            
            {bankerProfiles.map((banker) => (
              <div
                key={banker.name}
                className={cn(
                  "flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700",
                  "hover:shadow-md hover:border-amber-300 transition-all"
                )}
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-semibold text-lg">
                  {banker.initials}
                </div>
                <div className="flex-1">
                  <h5 className="font-semibold text-neutral-900 dark:text-white">{banker.name}</h5>
                  <p className="text-sm text-amber-600">{banker.title}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                    <span>{banker.specialty}</span>
                    <span>•</span>
                    <span>{banker.experience}</span>
                  </div>
                </div>
                <Button variant="ghost" className="p-2 h-auto text-amber-600">
                  <MessageSquare className="w-5 h-5" />
                </Button>
              </div>
            ))}

            {/* Contact Card */}
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30">
              <p className="text-sm text-neutral-700 dark:text-neutral-200 mb-3">
                Ready to experience private banking at its finest? Let us match you 
                with the perfect private banker for your needs.
              </p>
              <Button variant="ghost" className="text-amber-700 dark:text-amber-300 p-0 h-auto text-sm font-medium">
                Get Matched
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </motion.div>
        </div>
      </Container>
    </Section>
  );
};

export default PrivateBanker;
