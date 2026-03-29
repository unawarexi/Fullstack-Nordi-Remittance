// ============================================================================
// REMIT FOOTER - Responsive footer with newsletter and social links
// ============================================================================

import React from 'react';
import { motion } from 'framer-motion';
import { Send, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import { cn } from '@utils/cn';
import { useBreakpoint, useIsMobile } from '@hooks/index';
import { Button } from '@components/ui/Button';
import { Container } from '@components/layout/Container';
import Images from '@constants/images';

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
    title: "Careers",
    links: [
      "Working At Nordea Bank",
      "Your Career",
      "Recruitment Process",
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
];

// ========================
// FOOTER COLUMN COMPONENT
// ========================
interface FooterColumnProps {
  category: typeof footerCategoriesItem[0];
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
      <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
        {category.title}
      </h3>
      <nav className="space-y-2">
        {category.links.map((link, i) => (
          <a
            key={i}
            href="#"
            className={cn(
              "block text-sm text-neutral-300 dark:text-neutral-400",
              "hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-200",
              "hover:translate-x-1 transform"
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
  { icon: <Facebook size={18} />, href: '#', label: 'Facebook' },
  { icon: <Twitter size={18} />, href: '#', label: 'Twitter' },
  { icon: <Instagram size={18} />, href: '#', label: 'Instagram' },
  { icon: <Linkedin size={18} />, href: '#', label: 'LinkedIn' },
];

// ========================
// MAIN COMPONENT
// ========================
const RemitFooter: React.FC = () => {
  const isMobile = useIsMobile();
  const { isMdUp, isLgUp } = useBreakpoint();

  return (
    <footer className="relative">
      {/* Background Image - Hidden on mobile */}
      {isLgUp && (
        <div className="absolute bottom-0 right-0 pointer-events-none opacity-30">
          <img 
            src={Images.FooterImg} 
            alt="footer decoration" 
            className="w-[300px] lg:w-[400px] xl:w-[500px] h-auto" 
          />
        </div>
      )}
  
      {/* Main Footer */}
      <section className="bg-slate-800/95 dark:bg-neutral-900/95 backdrop-blur-sm relative z-10 transition-colors duration-300">
        <Container>
          <div className="py-12 sm:py-16 md:py-20 lg:py-24">
            {/* Footer Grid */}
            <div className={cn(
              "grid gap-8",
              "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
            )}>
              {footerCategoriesItem.map((category, index) => (
                <FooterColumn key={index} category={category} index={index} />
              ))}
            </div>
          </div>
        </Container>

        {/* Newsletter Section */}
        <div className="border-t border-neutral-700 dark:border-neutral-800">
          <Container>
            <div className="py-8 sm:py-10">
              <div className={cn(
                "flex flex-col gap-6",
                "md:flex-row md:items-center md:justify-between"
              )}>
                {/* Newsletter Form */}
                <div className="flex-1 max-w-md">
                  <label className="block text-sm font-medium text-neutral-300 dark:text-neutral-400 mb-2">
                    Subscribe to Newsletter
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className={cn(
                        "flex-1 px-4 py-2.5 rounded-lg",
                        "bg-neutral-700/50 dark:bg-neutral-800/50 border border-neutral-600 dark:border-neutral-700",
                        "text-white placeholder-neutral-400 dark:placeholder-neutral-500 text-sm",
                        "focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500",
                        "transition-all duration-200"
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
                  <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-2">
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
                        "w-10 h-10 rounded-full",
                        "bg-neutral-700 dark:bg-neutral-800 hover:bg-primary-500 dark:hover:bg-primary-600",
                        "flex items-center justify-center",
                        "text-neutral-300 dark:text-neutral-400 hover:text-white",
                        "transition-all duration-200"
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
        <div className="bg-slate-900 dark:bg-neutral-950 transition-colors duration-300">
          <Container>
            <div className={cn(
              "py-4 sm:py-5",
              "flex flex-col sm:flex-row items-center justify-between gap-3"
            )}>
              <p className="text-xs sm:text-sm text-neutral-400 dark:text-neutral-500 text-center sm:text-left">
                © {new Date().getFullYear()} Nordea Bank — All rights reserved.{" "}
                <a
                  href="#"
                  className="text-primary-500 hover:text-primary-400 transition-colors"
                >
                  @Nordea
                </a>
              </p>
              <div className="flex items-center gap-4 text-xs sm:text-sm text-neutral-400 dark:text-neutral-500">
                <a href="#" className="hover:text-primary-500 transition-colors">Privacy Policy</a>
                <span>•</span>
                <a href="#" className="hover:text-primary-500 transition-colors">Terms of Service</a>
              </div>
            </div>
          </Container>
        </div>
      </section>
    </footer>
  );
};

export default RemitFooter;
