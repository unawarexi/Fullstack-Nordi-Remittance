// ============================================================================
// CTA SECTION - Call to action with stats
// ============================================================================

import React from 'react';
import { motion } from 'framer-motion';
import { Section, Container, Grid } from '@components/layout';
import { Card, StatsCard } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { ArrowRight, Users, Globe, CreditCard, TrendingUp } from 'lucide-react';

// ========================
// ANIMATION VARIANTS
// ========================
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

// ========================
// STAT DATA
// ========================
const stats = [
  {
    icon: <Users className="w-5 h-5" />,
    value: '2M+',
    label: 'Active Users',
    trend: { value: 12, isPositive: true },
  },
  {
    icon: <Globe className="w-5 h-5" />,
    value: '150+',
    label: 'Countries',
    trend: { value: 8, isPositive: true },
  },
  {
    icon: <CreditCard className="w-5 h-5" />,
    value: '$5B+',
    label: 'Transactions',
    trend: { value: 24, isPositive: true },
  },
  {
    icon: <TrendingUp className="w-5 h-5" />,
    value: '99.9%',
    label: 'Uptime',
    trend: null,
  },
];

// ========================
// COMPONENT
// ========================
export const CtaSection: React.FC = () => {
  return (
    <Section 
      id="cta" 
      background="gradient" 
      className="bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600"
      size="lg"
    >
      <Container>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {/* Main CTA Content */}
          <div className="text-center mb-12">
            <motion.h2
              variants={itemVariants}
              className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4"
            >
              Start your financial journey today
            </motion.h2>
            
            <motion.p
              variants={itemVariants}
              className="text-white/80 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto mb-8"
            >
              Join millions of people who trust Nordea Remit for their international
              money transfers. Fast, secure, and affordable.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button
                size="lg"
                className="bg-white dark:bg-neutral-800 text-primary-700 hover:bg-neutral-100 dark:bg-neutral-700 px-8"
              >
                Open Free Account
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10 px-8"
              >
                Learn More
              </Button>
            </motion.div>
          </div>

          {/* Stats Grid */}
          <motion.div variants={itemVariants}>
            <Grid cols={{ xs: 2, lg: 4 }} gap="md">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  variants={itemVariants}
                  custom={index}
                >
                  <Card
                    variant="glass"
                    className="bg-white/10 border-white/20 text-center p-4 sm:p-6"
                  >
                    <div className="flex justify-center mb-3">
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">
                        {stat.icon}
                      </div>
                    </div>
                    
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1">
                      {stat.value}
                    </div>
                    
                    <div className="text-white/70 text-xs sm:text-sm">
                      {stat.label}
                    </div>

                    {stat.trend && (
                      <div className={`text-xs mt-2 ${stat.trend.isPositive ? 'text-success-300' : 'text-error-300'}`}>
                        {stat.trend.isPositive ? '↑' : '↓'} {stat.trend.value}% this month
                      </div>
                    )}
                  </Card>
                </motion.div>
              ))}
            </Grid>
          </motion.div>
        </motion.div>
      </Container>
    </Section>
  );
};

export default CtaSection;
