// ============================================================================
// REMIT FOOTER - Responsive footer with newsletter and social links
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import { Send, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import { cn } from "@utils/cn";
import { useBreakpoint, useIsMobile } from "@hooks/index";
import { Button } from "@components/ui/Button";
import { Container } from "@components/layout/Container";
import Images from "@constants/images";

// ========================
// FOOTER DATA
// ========================
const footerCategoriesItem = [
  {
    title: "About us",
    links: [
      "Our History",
      "Corporate Profile",
      "Corporate Governance",
      "Board and Management Team",
      "Corporate Philosophy",
      "Our Awards",
      "Our Businesses",
    ],
  },
  {
    title: "Quick Links",
    links: [
      "Dormant Accounts",
      "Nordea Online",
      "Anti-Money Laundering",
      "Download Center",
      "Form M Rates",
      "IMS Policy",
      "Online Security Tips",
      "Scam Alert",
      "Help",
    ],
  },
  {
    title: "Contact Us",
    links: [
      "Agent Banking Details",
      "Biometrics Enrollment",
      "Branch & ATM Locator",
      "Branches With Wi-Fi",
      "My Access",
      "We Care",
    ],
  },

  {
    title: "You are...",
    links: [
      "An Individual",
      "A Job Applicant",
      "A Woman",
      "A Company",
      "A Journalist",
      "A Teenager",
      "An Entrepreneur",
      "An Investor",
    ],
  },
  {
    title: "Careers",
    links: ["Working At Nordea Bank", "Your Career", "Recruitment Process"],
  },
];

// ========================
// FOOTER COLUMN COMPONENT
// ========================
interface FooterColumnProps {
  category: (typeof footerCategoriesItem)[0];
  index: number;
}

const FooterColumn: React.FC<FooterColumnProps> = ({ category, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="mb-8 lg:mb-0"
    >
      <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">{category.title}</h3>
      <nav className="space-y-2">
        {category.links.map((link, i) => (
          <a
            key={i}
            href="#"
            className={cn(
              "block text-sm text-neutral-300 dark:text-neutral-400",
              "transition-colors duration-200 hover:text-primary-500 dark:hover:text-primary-400",
              "transform hover:translate-x-1",
            )}
          >
            {link}
          </a>
        ))}
      </nav>
    </motion.div>
  );
};

// ========================
// SOCIAL LINKS
// ========================
const socialLinks = [
  { icon: <Facebook size={18} />, href: "#", label: "Facebook" },
  { icon: <Twitter size={18} />, href: "#", label: "Twitter" },
  { icon: <Instagram size={18} />, href: "#", label: "Instagram" },
  { icon: <Linkedin size={18} />, href: "#", label: "LinkedIn" },
];

// ========================
// MAIN COMPONENT
// ========================
const RemitFooter: React.FC = () => {
  const isMobile = useIsMobile();
  const { isMdUp, isLgUp } = useBreakpoint();

  return (
    <footer className="relative overflow-hidden">
      {/* Background Image - Always visible in the background layer */}
      <div className="pointer-events-none absolute bottom-0 right-0 z-0 opacity-100">
        <img
          src={Images.FooterImg}
          alt="footer decoration"
          className="h-auto w-[250px] sm:w-[350px] lg:w-[450px] xl:w-[600px]"
        />
      </div>

      {/* Main Footer */}
      <section className="relative z-10 bg-slate-800/40 backdrop-blur-md transition-colors duration-300 dark:bg-neutral-900/40">
        <Container>
          <div className="py-12 sm:py-16 md:py-20 lg:py-24">
            {/* Footer Grid */}
            <div className={cn("grid gap-8", "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5")}>
              {footerCategoriesItem.map((category, index) => (
                <FooterColumn key={index} category={category} index={index} />
              ))}
            </div>
          </div>
        </Container>

        {/* Newsletter Section */}
        <div className="border-t border-neutral-700/50 bg-slate-800/30 dark:border-neutral-800/50 dark:bg-neutral-900/30">
          <Container>
            <div className="py-8 sm:py-10">
              <div className={cn("flex flex-col gap-6", "md:flex-row md:items-center md:justify-between")}>
                {/* Newsletter Form */}
                <div className="max-w-md flex-1">
                  <label className="mb-2 block text-sm font-medium text-neutral-300 dark:text-neutral-400">
                    Subscribe to Newsletter
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className={cn(
                        "flex-1 rounded-lg px-4 py-2.5",
                        "border border-neutral-600 bg-neutral-700/30 dark:border-neutral-700 dark:bg-neutral-800/30",
                        "text-sm text-white placeholder-neutral-400 dark:placeholder-neutral-500",
                        "focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50",
                        "transition-all duration-200",
                      )}
                    />
                    <Button
                      size={isMobile ? "sm" : "md"}
                      className="bg-primary-500 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700"
                    >
                      <Send size={16} className={isMobile ? "" : "mr-2"} />
                      {!isMobile && "Subscribe"}
                    </Button>
                  </div>
                  <p className="mt-2 text-xs text-neutral-400 dark:text-neutral-500">
                    Get updates on Nordea's banking services and promotions.
                  </p>
                </div>

                {/* Social Links */}
                <div className="flex items-center gap-3">
                  {socialLinks.map((social, index) => (
                    <motion.a
                      key={index}
                      href={social.href}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "h-10 w-10 rounded-full",
                        "bg-neutral-700/50 hover:bg-primary-500 dark:bg-neutral-800/50 dark:hover:bg-primary-600",
                        "flex items-center justify-center",
                        "text-neutral-300 hover:text-white dark:text-neutral-400",
                        "transition-all duration-200",
                      )}
                      aria-label={social.label}
                    >
                      {social.icon}
                    </motion.a>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </div>

        {/* Bottom Bar */}
        <div className="bg-slate-900/60 transition-colors duration-300 dark:bg-neutral-950/60">
          <Container>
            <div className={cn("py-4 sm:py-5", "flex flex-col items-center justify-between gap-3 sm:flex-row")}>
              <p className="text-center text-xs text-neutral-400 dark:text-neutral-500 sm:text-left sm:text-sm">
                © {new Date().getFullYear()} Nordea Bank — All rights reserved.{" "}
                <a href="#" className="text-primary-500 transition-colors hover:text-primary-400">
                  @Nordea
                </a>
              </p>
              <div className="flex items-center gap-4 text-xs text-neutral-400 dark:text-neutral-500 sm:text-sm">
                <a href="#" className="transition-colors hover:text-primary-500">
                  Privacy Policy
                </a>
                <span>•</span>
                <a href="#" className="transition-colors hover:text-primary-500">
                  Terms of Service
                </a>
              </div>
            </div>
          </Container>
        </div>
      </section>
    </footer>
  );
};

export default RemitFooter;
