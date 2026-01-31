// ============================================================================
// PAGE TYPES - Types for page components and landing page sections
// ============================================================================

import { ReactNode } from 'react';

// ============================================================================
// HERO SECTION TYPES
// ============================================================================

export interface HeroSlide {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  mobileImage?: string;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  overlay?: boolean;
  overlayOpacity?: number;
}

export interface HeroCarouselProps {
  slides: HeroSlide[];
  autoPlay?: boolean;
  interval?: number;
  showDots?: boolean;
  showArrows?: boolean;
  pauseOnHover?: boolean;
  className?: string;
}

export interface HeroSectionProps {
  title: string;
  subtitle?: string;
  description?: string;
  backgroundImage?: string;
  backgroundColor?: string;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  align?: 'left' | 'center' | 'right';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children?: ReactNode;
  className?: string;
}

// ============================================================================
// FEATURE SECTION TYPES
// ============================================================================

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon?: ReactNode;
  image?: string;
  link?: string;
  linkText?: string;
}

export interface FeatureCardProps {
  feature: Feature;
  variant?: 'default' | 'elevated' | 'outlined' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  iconPosition?: 'top' | 'left';
  className?: string;
}

export interface FeatureSectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  features: Feature[];
  columns?: 2 | 3 | 4;
  variant?: 'default' | 'elevated' | 'outlined' | 'minimal';
  className?: string;
}

// ============================================================================
// TESTIMONIAL SECTION TYPES
// ============================================================================

export interface Testimonial {
  id: string;
  content: string;
  author: string;
  role?: string;
  company?: string;
  avatar?: string;
  rating?: number;
}

export interface TestimonialCardProps {
  testimonial: Testimonial;
  variant?: 'default' | 'card' | 'quote';
  showRating?: boolean;
  className?: string;
}

export interface TestimonialSectionProps {
  title?: string;
  subtitle?: string;
  testimonials: Testimonial[];
  variant?: 'carousel' | 'grid' | 'masonry';
  autoPlay?: boolean;
  className?: string;
}

// ============================================================================
// STATISTICS SECTION TYPES
// ============================================================================

export interface Statistic {
  id: string;
  value: number | string;
  label: string;
  prefix?: string;
  suffix?: string;
  description?: string;
  icon?: ReactNode;
}

export interface StatisticCardProps {
  statistic: Statistic;
  variant?: 'default' | 'card' | 'minimal';
  animate?: boolean;
  className?: string;
}

export interface StatisticsSectionProps {
  title?: string;
  subtitle?: string;
  statistics: Statistic[];
  columns?: 2 | 3 | 4;
  variant?: 'default' | 'card' | 'minimal';
  animate?: boolean;
  className?: string;
}

// ============================================================================
// TEAM SECTION TYPES
// ============================================================================

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio?: string;
  avatar: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    email?: string;
  };
}

export interface TeamMemberCardProps {
  member: TeamMember;
  variant?: 'default' | 'card' | 'minimal';
  showSocial?: boolean;
  className?: string;
}

export interface TeamSectionProps {
  title?: string;
  subtitle?: string;
  members: TeamMember[];
  columns?: 2 | 3 | 4;
  variant?: 'default' | 'card' | 'minimal';
  className?: string;
}

// ============================================================================
// PRICING SECTION TYPES
// ============================================================================

export interface PricingPlan {
  id: string;
  name: string;
  description?: string;
  price: number | string;
  currency?: string;
  period?: 'monthly' | 'yearly' | 'one-time';
  features: string[];
  highlightedFeatures?: string[];
  ctaText?: string;
  ctaLink?: string;
  isPopular?: boolean;
  isFeatured?: boolean;
}

export interface PricingCardProps {
  plan: PricingPlan;
  variant?: 'default' | 'card' | 'elevated';
  showBadge?: boolean;
  className?: string;
}

export interface PricingSectionProps {
  title?: string;
  subtitle?: string;
  plans: PricingPlan[];
  showToggle?: boolean;
  defaultPeriod?: 'monthly' | 'yearly';
  className?: string;
}

// ============================================================================
// FAQ SECTION TYPES
// ============================================================================

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export interface FAQSectionProps {
  title?: string;
  subtitle?: string;
  items: FAQItem[];
  categories?: string[];
  searchable?: boolean;
  variant?: 'accordion' | 'list';
  className?: string;
}

// ============================================================================
// CTA SECTION TYPES
// ============================================================================

export interface CTASectionProps {
  title: string;
  description?: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  backgroundImage?: string;
  backgroundColor?: string;
  variant?: 'default' | 'centered' | 'split';
  className?: string;
}

// ============================================================================
// NEWS/BLOG SECTION TYPES
// ============================================================================

export interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  content?: string;
  image?: string;
  author?: {
    name: string;
    avatar?: string;
  };
  category?: string;
  tags?: string[];
  publishedAt: string;
  readTime?: number;
  link: string;
}

export interface NewsCardProps {
  article: NewsArticle;
  variant?: 'default' | 'horizontal' | 'minimal' | 'featured';
  showAuthor?: boolean;
  showDate?: boolean;
  showCategory?: boolean;
  className?: string;
}

export interface NewsSectionProps {
  title?: string;
  subtitle?: string;
  articles: NewsArticle[];
  columns?: 2 | 3 | 4;
  variant?: 'grid' | 'list' | 'carousel';
  showMoreLink?: string;
  className?: string;
}

// ============================================================================
// PRODUCT/SERVICE CARD TYPES
// ============================================================================

export interface Product {
  id: string;
  name: string;
  description: string;
  image?: string;
  icon?: ReactNode;
  price?: number | string;
  features?: string[];
  link?: string;
  linkText?: string;
  badge?: string;
  isNew?: boolean;
  isPopular?: boolean;
}

export interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'horizontal' | 'minimal' | 'featured';
  showPrice?: boolean;
  showFeatures?: boolean;
  className?: string;
}

export interface ProductSectionProps {
  title?: string;
  subtitle?: string;
  products: Product[];
  columns?: 2 | 3 | 4;
  variant?: 'grid' | 'carousel';
  className?: string;
}

// ============================================================================
// LOCATION/BRANCH SECTION TYPES
// ============================================================================

export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  phone?: string;
  email?: string;
  hours?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  amenities?: string[];
  image?: string;
}

export interface LocationCardProps {
  location: Location;
  variant?: 'default' | 'compact' | 'detailed';
  showMap?: boolean;
  showAmenities?: boolean;
  className?: string;
}

export interface LocationSectionProps {
  title?: string;
  subtitle?: string;
  locations: Location[];
  showSearch?: boolean;
  showMap?: boolean;
  className?: string;
}

// ============================================================================
// BANKING-SPECIFIC SECTION TYPES
// ============================================================================

export interface BankingAccount {
  id: string;
  name: string;
  description: string;
  type: 'savings' | 'current' | 'fixed-deposit' | 'investment';
  interestRate?: number;
  minimumBalance?: number;
  features: string[];
  icon?: ReactNode;
  image?: string;
  ctaText?: string;
  ctaLink?: string;
}

export interface BankingAccountCardProps {
  account: BankingAccount;
  variant?: 'default' | 'featured' | 'compact';
  showRate?: boolean;
  className?: string;
}

export interface LoanProduct {
  id: string;
  name: string;
  description: string;
  type: 'personal' | 'home' | 'auto' | 'business' | 'education';
  interestRate: number | string;
  maxAmount?: number;
  tenure?: string;
  features: string[];
  icon?: ReactNode;
  image?: string;
  ctaText?: string;
  ctaLink?: string;
}

export interface LoanProductCardProps {
  loan: LoanProduct;
  variant?: 'default' | 'featured' | 'compact';
  showRate?: boolean;
  className?: string;
}

export interface CreditCardProduct {
  id: string;
  name: string;
  description: string;
  type: 'classic' | 'gold' | 'platinum' | 'black' | 'business';
  image: string;
  annualFee?: number | string;
  interestRate?: number | string;
  rewardsRate?: string;
  features: string[];
  benefits: string[];
  ctaText?: string;
  ctaLink?: string;
  isPopular?: boolean;
}

export interface CreditCardProductCardProps {
  card: CreditCardProduct;
  variant?: 'default' | 'featured' | 'comparison';
  showDetails?: boolean;
  className?: string;
}

export interface InterestRate {
  id: string;
  productName: string;
  category: string;
  rate: number | string;
  effectiveDate?: string;
  minAmount?: number;
  maxAmount?: number;
  tenure?: string;
}

export interface InterestRateTableProps {
  title?: string;
  rates: InterestRate[];
  categories?: string[];
  showEffectiveDate?: boolean;
  className?: string;
}

// ============================================================================
// SUPPORT/CONTACT SECTION TYPES
// ============================================================================

export interface SupportChannel {
  id: string;
  name: string;
  description: string;
  icon: ReactNode;
  contactInfo: string;
  availability?: string;
  link?: string;
}

export interface SupportCardProps {
  channel: SupportChannel;
  variant?: 'default' | 'compact';
  className?: string;
}

export interface SupportSectionProps {
  title?: string;
  subtitle?: string;
  channels: SupportChannel[];
  columns?: 2 | 3 | 4;
  className?: string;
}

// ============================================================================
// REWARDS/LOYALTY SECTION TYPES
// ============================================================================

export interface RewardTier {
  id: string;
  name: string;
  description?: string;
  minPoints?: number;
  maxPoints?: number;
  benefits: string[];
  icon?: ReactNode;
  color?: string;
}

export interface RewardItem {
  id: string;
  name: string;
  description?: string;
  points: number;
  image?: string;
  category?: string;
  isAvailable?: boolean;
}

export interface RewardsSectionProps {
  title?: string;
  subtitle?: string;
  tiers?: RewardTier[];
  rewards?: RewardItem[];
  variant?: 'tiers' | 'catalog' | 'combined';
  className?: string;
}

// ============================================================================
// QUICK LINKS SECTION TYPES
// ============================================================================

export interface QuickLink {
  id: string;
  label: string;
  href: string;
  icon?: ReactNode;
  description?: string;
  isExternal?: boolean;
  badge?: string;
}

export interface QuickLinksSectionProps {
  title?: string;
  links: QuickLink[];
  columns?: 2 | 3 | 4 | 6;
  variant?: 'default' | 'card' | 'icon-grid';
  className?: string;
}

// ============================================================================
// BANNER SECTION TYPES
// ============================================================================

export interface BannerProps {
  title: string;
  description?: string;
  image?: string;
  backgroundColor?: string;
  ctaText?: string;
  ctaLink?: string;
  variant?: 'default' | 'slim' | 'full-width';
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

// ============================================================================
// PAGE METADATA TYPES
// ============================================================================

export interface PageMeta {
  title: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  canonical?: string;
}

export interface PageProps {
  meta?: PageMeta;
  children: ReactNode;
}
