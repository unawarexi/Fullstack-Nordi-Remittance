// ============================================================================
// CONTENTS - Responsive quick action cards for hero section
// ============================================================================

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@utils/cn';
import { useBreakpoint, useIsMobile } from '@hooks/index';
import Images from '@constants/images';

// ========================
// CONTENT DATA
// ========================
interface ContentItem {
  title: string;
  description: string;
  icon: string;
}

const contentData: ContentItem[] = [
  {
    title: 'Open Accounts',
    description: 'Easily create and manage multiple accounts tailored to your needs.',
    icon: Images.openAccounts
  },
  {
    title: 'Nordea Cards',
    description: 'Access your funds effortlessly with our secure bank cards.',
    icon: Images.ownerCard
  },
  {
    title: 'Quick Loans',
    description: 'Get fast, flexible loan options with minimal hassle.',
    icon: Images.quickLoans
  },
  {
    title: 'Money Transfer',
    description: 'Send money globally with confidence and competitive rates.',
    icon: Images.transferMoney
  },
];

// ========================
// CONTENT CARD COMPONENT
// ========================
interface ContentCardProps {
  item: ContentItem;
  index: number;
}

const ContentCard: React.FC<ContentCardProps> = ({ item, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className={cn(
        "flex flex-col items-center",
        "p-4 sm:p-5 md:p-6",
        "bg-gradient-to-br from-lime-500/90 to-lime-600/90",
        "backdrop-blur-sm rounded-xl sm:rounded-2xl",
        "border border-lime-400/30 shadow-lg",
        "hover:shadow-xl transition-all duration-300",
        "cursor-pointer group"
      )}
    >
      {/* Icon */}
      <div className={cn(
        "p-3 sm:p-4 rounded-full",
        "bg-white/20 backdrop-blur-sm",
        "mb-3 sm:mb-4",
        "group-hover:bg-white/30 transition-colors"
      )}>
        <img 
          src={item.icon} 
          alt={item.title} 
          className="w-8 h-8 sm:w-10 sm:h-10 object-contain" 
        />
      </div>
      
      {/* Title */}
      <h3 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2 text-center">
        {item.title}
      </h3>
      
      {/* Description - Hidden on very small screens */}
      <p className="text-xs sm:text-sm text-white/80 text-center leading-relaxed hidden sm:block">
        {item.description}
      </p>
    </motion.div>
  );
};

// ========================
// MAIN COMPONENT
// ========================
const Contents: React.FC = () => {
  const isMobile = useIsMobile();
  const { isSmUp, isMdUp, isLgUp } = useBreakpoint();

  return (
    <section className="w-full">
      <div className={cn(
        "grid gap-3 sm:gap-4 md:gap-6",
        "grid-cols-2 sm:grid-cols-2 md:grid-cols-4"
      )}>
        {contentData.map((item, idx) => (
          <ContentCard key={idx} item={item} index={idx} />
        ))}
      </div>
    </section>
  );
};

export default Contents;
