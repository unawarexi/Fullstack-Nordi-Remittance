// ============================================================================
// WIFI BRANCHES SECTION
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import {
  Wifi,
  Coffee,
  Laptop,
  Monitor,
  Users,
  Clock,
  MapPin,
  ArrowRight,
  Check,
  Zap,
  Headphones,
} from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";
import { Button } from "@components/ui/Button";

// ========================
// AMENITIES
// ========================
interface Amenity {
  icon: React.ReactNode;
  name: string;
  description: string;
}

const amenities: Amenity[] = [
  { icon: <Wifi className="w-5 h-5" />, name: "High-Speed WiFi", description: "Free unlimited internet access" },
  { icon: <Coffee className="w-5 h-5" />, name: "Coffee Lounge", description: "Complimentary refreshments" },
  { icon: <Laptop className="w-5 h-5" />, name: "Work Stations", description: "Dedicated work areas" },
  { icon: <Monitor className="w-5 h-5" />, name: "Self-Service Kiosks", description: "Quick banking transactions" },
  { icon: <Headphones className="w-5 h-5" />, name: "Digital Support", description: "Staff to help with digital banking" },
  { icon: <Zap className="w-5 h-5" />, name: "Power Outlets", description: "Charge your devices" },
];

// ========================
// WIFI BRANCHES
// ========================
interface WiFiBranch {
  name: string;
  address: string;
  city: string;
  hours: string;
}

const wifiBranches: WiFiBranch[] = [
  { name: "Victoria Island Digital Hub", address: "Adeola Odeku Street", city: "Lagos", hours: "8am - 8pm" },
  { name: "Lekki Digital Center", address: "Admiralty Way", city: "Lagos", hours: "9am - 9pm" },
  { name: "Wuse 2 WiFi Lounge", address: "Aminu Kano Crescent", city: "Abuja", hours: "8am - 7pm" },
  { name: "Port Harcourt Hub", address: "Aba Road", city: "Port Harcourt", hours: "8am - 6pm" },
];

// ========================
// MAIN COMPONENT
// ========================
const WiFiBranches: React.FC = () => {
  return (
    <Section id="wifi-branches" className="py-16 lg:py-24 bg-gradient-to-br from-cyan-900 to-teal-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="wifi-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="2" fill="currentColor" opacity="0.3" />
              <circle cx="10" cy="10" r="6" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#wifi-pattern)" />
        </svg>
      </div>

      <Container className="relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-sm font-medium mb-4">
            <Wifi className="w-4 h-4" />
            WiFi Branches
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Bank, Work, Connect
          </h2>
          <p className="text-lg text-cyan-100">
            Visit our WiFi-enabled branches with modern lounges, free internet, 
            and digital banking support. The perfect spot to get things done.
          </p>
        </motion.div>

        {/* Amenities Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12"
        >
          {amenities.map((amenity) => (
            <div
              key={amenity.name}
              className="p-4 rounded-xl bg-white/10 backdrop-blur-sm text-center hover:bg-white/20 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-cyan-500/30 text-cyan-300 flex items-center justify-center mx-auto mb-3">
                {amenity.icon}
              </div>
              <h4 className="font-semibold text-white text-sm mb-1">{amenity.name}</h4>
              <p className="text-xs text-cyan-200">{amenity.description}</p>
            </div>
          ))}
        </motion.div>

        {/* Branch Locations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto"
        >
          {wifiBranches.map((branch) => (
            <div
              key={branch.name}
              className={cn(
                "p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20",
                "hover:bg-white/20 transition-all cursor-pointer"
              )}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-white mb-1">{branch.name}</h4>
                  <div className="flex items-center gap-1 text-sm text-cyan-200 mb-1">
                    <MapPin className="w-4 h-4" />
                    {branch.address}, {branch.city}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-cyan-200">
                    <Clock className="w-4 h-4" />
                    {branch.hours}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-emerald-500/30 flex items-center justify-center">
                  <Wifi className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
            <Users className="w-10 h-10 text-cyan-300" />
            <div className="text-left">
              <p className="font-semibold text-white">More Locations Coming Soon</p>
              <p className="text-sm text-cyan-200">We're expanding our WiFi branch network</p>
            </div>
            <Button variant="secondary" className="ml-4 bg-white text-cyan-900 hover:bg-cyan-50">
              <MapPin className="w-4 h-4 mr-2" />
              View All
            </Button>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
};

export default WiFiBranches;
