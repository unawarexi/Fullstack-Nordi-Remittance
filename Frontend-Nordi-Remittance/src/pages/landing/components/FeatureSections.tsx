// ============================================================================
// LANDING PAGE FEATURE SECTIONS - Refactored with reusable components
// ============================================================================

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@utils/cn';
import { Section, Container, Grid, Flex } from '@components/layout';
import StoreLinks, { BtnTypes } from '@components/common/StoreLinks';
import Images from '@constants/images';

// Import assets
import AppFrame from '@assets/app_frame.png';
import ShieldCheck from '@assets/icons/check.png';
import CoinsIcon from '@assets/icons/coins.png';
import Frames from '@assets/frames.png';
import Phone from '@assets/phone.png';

// ========================
// ANIMATION VARIANTS
// ========================
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

// ========================
// FEATURE HERO SECTION
// ========================
export const FeatureHeroSection: React.FC = () => {
  return (
    <Section className="relative overflow-hidden min-h-[480px] sm:min-h-[540px] lg:min-h-[600px]">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={Images.Banner1}
          alt=""
          className="w-full h-full object-cover"
        />
        {/* Right-to-left gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-blue-900/70 to-blue-950/90" />
      </div>

      <Container className="relative z-10 py-12 sm:py-16 lg:py-20">
        <div className="flex flex-col md:flex-row items-center gap-8 lg:gap-12">
          {/* Text Content */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex-1 text-center md:text-left"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 leading-tight">
              <span className="text-amber-400">Receive payments</span>
              <span className="text-white"> the smart way</span>
            </h2>
            <p className="text-white/80 text-sm sm:text-base lg:text-lg mb-8 max-w-lg">
              Manage your finances anywhere with Nordea Remittance, designed for
              cross-border transactions.
            </p>
            <StoreLinks type={BtnTypes.Standard} />
          </motion.div>

          {/* Phone Image */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex-1 flex justify-center"
          >
            <img
              src={Phone}
              alt="Nordea Remit App"
              className="max-w-[260px] sm:max-w-[300px] md:max-w-[340px] lg:max-w-[380px] drop-shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
            />
          </motion.div>
        </div>
      </Container>
    </Section>
  );
};

// ========================
// FEATURE CARD COMPONENT
// ========================
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  highlight?: string;
  image?: string;
  imagePosition?: 'left' | 'right';
  className?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  highlight,
  image,
  imagePosition = 'right',
  className,
}) => {
  const hasImage = !!image;
  
  return (
    <motion.div
      variants={fadeInUp}
      className={cn(
        'rounded-2xl overflow-hidden',
        hasImage ? 'flex flex-col md:flex-row' : '',
        className
      )}
    >
      {image && imagePosition === 'left' && (
        <div className="md:w-1/2 flex items-center justify-center p-4">
          <img src={image} alt="" className="max-w-full h-auto" />
        </div>
      )}

      <div className={cn(
        'p-6 sm:p-8 flex flex-col justify-center',
        hasImage ? 'md:w-1/2' : 'w-full'
      )}>
        {icon && (
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-slate-200 dark:bg-neutral-700 flex items-center justify-center mb-4">
            {typeof icon === 'string' ? (
              <img src={icon} alt="" className="w-6 h-6 sm:w-8 sm:h-8" />
            ) : (
              icon
            )}
          </div>
        )}
        
        <h3 className="text-xl sm:text-2xl font-semibold text-neutral-800 dark:text-neutral-100 mb-3">
          {highlight ? (
            <>
              {title.split(highlight)[0]}
              <span className="text-primary-500">{highlight}</span>
              {title.split(highlight)[1]}
            </>
          ) : (
            title
          )}
        </h3>
        
        <p className="text-neutral-600 dark:text-neutral-300 text-sm sm:text-base leading-relaxed">
          {description}
        </p>
      </div>

      {image && imagePosition === 'right' && (
        <div className="md:w-1/2 flex items-center justify-center p-4">
          <img src={image} alt="" className="max-w-full h-auto" />
        </div>
      )}
    </motion.div>
  );
};

// ========================
// MAIN FEATURES SECTION
// ========================
export const FeaturesSection: React.FC = () => {
  return (
    <Section id="features" background="white" size="lg">
      <Container>
        {/* Section Header */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-800 dark:text-neutral-100 mb-3">
            Make every penny count
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm sm:text-base max-w-xl mx-auto">
            Spend smarter, lower your bills, get cashback on everything you buy,
            and unlock credit to grow your business.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-6"
        >
          {/* First row - Large + Small */}
          <div className="flex flex-col xl:flex-row gap-6">
            <FeatureCard
              icon={<img src={ShieldCheck} alt="Shield" className="w-8 h-8" />}
              title="Receive Pay with Nordea Remittance, quick, simple and easy"
              highlight="Nordea Remittance,"
              description="International payments have never been easier, whether it's a Partnership, Brand collab, or Asset purchase. Just submit your payment details, and we'll get you covered."
              image={AppFrame}
              className="xl:flex-[2] bg-slate-100 dark:bg-neutral-800"
            />
            
            <FeatureCard
              icon={<img src={ShieldCheck} alt="Shield" className="w-8 h-8" />}
              title="Bank-level security"
              description="Your money is 100% safe and secure with our swift remittance. No hassles, no glitches, get access to your money anytime."
              className="xl:flex-1 bg-slate-200 dark:bg-neutral-700"
            />
          </div>

          {/* Second row - Small + Large */}
          <div className="flex flex-col xl:flex-row gap-6">
            <FeatureCard
              icon={<img src={CoinsIcon} alt="Coins" className="w-8 h-8" />}
              title="Cost reduction"
              description="Nordea reduces payment maintenance and processing fees. No time wasted!"
              className="xl:flex-1 bg-slate-200 dark:bg-neutral-700"
            />
            
            <FeatureCard
              icon={null}
              title="Send, receive, and exchange money"
              highlight="receive,"
              description="Transfers and payments all work on Nordea business remittance. Verify your Payment Account and get your alert message immediately after a completed transaction."
              image={Frames}
              imagePosition="right"
              className="xl:flex-[2] bg-slate-100 dark:bg-neutral-800"
            />
          </div>
        </motion.div>
      </Container>
    </Section>
  );
};

// ========================
// COMBINED EXPORT
// ========================
const FeatureSections: React.FC = () => {
  return (
    <>
      <FeatureHeroSection />
      <FeaturesSection />
    </>
  );
};

export default FeatureSections;
