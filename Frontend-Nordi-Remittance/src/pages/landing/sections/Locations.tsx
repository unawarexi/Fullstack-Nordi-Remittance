// ============================================================================
// LOCATIONS SECTION - Branch locations and ATM finder
// ============================================================================

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Clock,
  Phone,
  Navigation,
  Search,
  Building2,
  Banknote,
  ArrowRight,
} from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";

// ========================
// LOCATIONS DATA
// ========================
interface Location {
  id: number;
  name: string;
  type: "branch" | "atm";
  address: string;
  city: string;
  distance: string;
  hours: string;
  phone?: string;
  services: string[];
}

const locations: Location[] = [
  {
    id: 1,
    name: "Downtown Main Branch",
    type: "branch",
    address: "123 Financial Street",
    city: "New York, NY 10001",
    distance: "0.3 mi",
    hours: "Mon-Fri: 9AM-5PM, Sat: 10AM-2PM",
    phone: "(212) 555-0123",
    services: ["Full Service", "Safe Deposit", "Notary"],
  },
  {
    id: 2,
    name: "Midtown Express",
    type: "branch",
    address: "456 Commerce Ave",
    city: "New York, NY 10016",
    distance: "0.8 mi",
    hours: "Mon-Fri: 8AM-6PM",
    phone: "(212) 555-0456",
    services: ["Full Service", "Drive-thru"],
  },
  {
    id: 3,
    name: "Times Square ATM",
    type: "atm",
    address: "789 Broadway",
    city: "New York, NY 10019",
    distance: "1.2 mi",
    hours: "24/7",
    services: ["Cash Withdrawal", "Deposits", "Transfers"],
  },
  {
    id: 4,
    name: "Financial District",
    type: "branch",
    address: "321 Wall Street",
    city: "New York, NY 10005",
    distance: "1.5 mi",
    hours: "Mon-Fri: 7AM-7PM",
    phone: "(212) 555-0789",
    services: ["Full Service", "Business Center", "Meeting Rooms"],
  },
];

// ========================
// LOCATION CARD COMPONENT
// ========================
interface LocationCardProps {
  location: Location;
  index: number;
}

const LocationCard: React.FC<LocationCardProps> = ({ location, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay: index * 0.1 }}
    className={cn(
      "p-4 rounded-xl",
      "bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700",
      "hover:shadow-md hover:border-neutral-200 dark:border-neutral-700 transition-all"
    )}
  >
    <div className="flex items-start gap-3">
      {/* Icon */}
      <div
        className={cn(
          "flex-shrink-0 p-2.5 rounded-lg",
          location.type === "branch"
            ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600"
            : "bg-emerald-50 text-emerald-600"
        )}
      >
        {location.type === "branch" ? (
          <Building2 className="w-5 h-5" />
        ) : (
          <Banknote className="w-5 h-5" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="font-semibold text-neutral-900 dark:text-white text-sm">
              {location.name}
            </h4>
            <span
              className={cn(
                "inline-block mt-0.5 px-2 py-0.5 text-xs font-medium rounded",
                location.type === "branch"
                  ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600"
                  : "bg-emerald-50 text-emerald-600"
              )}
            >
              {location.type === "branch" ? "Branch" : "ATM"}
            </span>
          </div>
          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
            {location.distance}
          </span>
        </div>

        <div className="mt-3 space-y-1.5 text-xs text-neutral-600 dark:text-neutral-300">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-neutral-400" />
            <span>
              {location.address}, {location.city}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-neutral-400" />
            <span>{location.hours}</span>
          </div>
          {location.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-neutral-400" />
              <a href={`tel:${location.phone}`} className="hover:text-indigo-600">
                {location.phone}
              </a>
            </div>
          )}
        </div>

        {/* Services */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {location.services.map((service) => (
            <span
              key={service}
              className="px-2 py-0.5 text-xs bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded"
            >
              {service}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-3 flex gap-2">
          <a
            href="#"
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg",
              "text-xs font-medium",
              "bg-indigo-600 text-white",
              "hover:bg-indigo-700 transition-colors"
            )}
          >
            <Navigation className="w-3 h-3" />
            Directions
          </a>
          {location.phone && (
            <a
              href={`tel:${location.phone}`}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg",
                "text-xs font-medium",
                "bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200",
                "hover:bg-neutral-200 transition-colors"
              )}
            >
              <Phone className="w-3 h-3" />
              Call
            </a>
          )}
        </div>
      </div>
    </div>
  </motion.div>
);

// ========================
// MAIN COMPONENT
// ========================
const Locations: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <Section background="light" className="py-12 lg:py-16">
      <Container size="xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left - Map Placeholder */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-2 lg:order-1"
          >
            <div
              className={cn(
                "relative h-80 lg:h-full min-h-[400px] rounded-xl overflow-hidden",
                "bg-neutral-200"
              )}
            >
              {/* Map placeholder */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-neutral-400 mx-auto mb-2" />
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Interactive map</p>
                  <p className="text-xs text-neutral-400">
                    150+ locations nationwide
                  </p>
                </div>
              </div>

              {/* Stats overlay */}
              <div className="absolute bottom-4 left-4 right-4 flex gap-3">
                <div className="flex-1 p-3 rounded-lg bg-white/90 backdrop-blur-sm">
                  <div className="text-lg font-bold text-neutral-900 dark:text-white">150+</div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">Branches</div>
                </div>
                <div className="flex-1 p-3 rounded-lg bg-white/90 backdrop-blur-sm">
                  <div className="text-lg font-bold text-neutral-900 dark:text-white">2,500+</div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">ATMs</div>
                </div>
                <div className="flex-1 p-3 rounded-lg bg-white/90 backdrop-blur-sm">
                  <div className="text-lg font-bold text-neutral-900 dark:text-white">50+</div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">States</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right - Locations List */}
          <div className="order-1 lg:order-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block px-3 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 rounded-full mb-3">
                Find Us
              </span>
              <h2 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white">
                Branches & ATMs Near You
              </h2>
              <p className="mt-2 text-neutral-600 dark:text-neutral-300">
                Find a branch or fee-free ATM in your neighborhood.
              </p>
            </motion.div>

            {/* Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-6"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Enter zip code or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    "w-full pl-10 pr-4 py-3 rounded-lg",
                    "bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700",
                    "text-sm placeholder:text-neutral-400",
                    "focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  )}
                />
              </div>
            </motion.div>

            {/* Locations List */}
            <div className="mt-4 space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {locations.map((location, index) => (
                <LocationCard key={location.id} location={location} index={index} />
              ))}
            </div>

            {/* View All */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-6"
            >
              <a
                href="/locations"
                className={cn(
                  "inline-flex items-center gap-2 text-sm font-medium text-indigo-600",
                  "hover:text-indigo-700 transition-colors"
                )}
              >
                View All Locations
                <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default Locations;
