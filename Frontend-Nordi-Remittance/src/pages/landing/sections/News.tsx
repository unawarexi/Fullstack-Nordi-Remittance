// ============================================================================
// NEWS SECTION - Latest news and blog posts
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import { Calendar, ArrowRight, Clock, Tag } from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";

// ========================
// NEWS DATA
// ========================
interface NewsArticle {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
  featured?: boolean;
}

const newsArticles: NewsArticle[] = [
  {
    id: 1,
    title: "Introducing Our New Premium Savings Account with 4.5% APY",
    excerpt:
      "Start earning more on your savings with our highest-yield account yet. No minimum balance required.",
    category: "Product Launch",
    date: "Dec 15, 2024",
    readTime: "3 min",
    image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600",
    featured: true,
  },
  {
    id: 2,
    title: "Mobile App Update: New Features You'll Love",
    excerpt:
      "Check out the latest features including instant card lock, spending insights, and more.",
    category: "Technology",
    date: "Dec 12, 2024",
    readTime: "4 min",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600",
  },
  {
    id: 3,
    title: "Tips for Building Your Emergency Fund in 2025",
    excerpt:
      "Financial experts share their top strategies for creating a safety net that works.",
    category: "Financial Tips",
    date: "Dec 10, 2024",
    readTime: "5 min",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600",
  },
  {
    id: 4,
    title: "New Branch Opening in Downtown Chicago",
    excerpt:
      "We're expanding! Visit our newest location at 123 Michigan Ave for exclusive opening offers.",
    category: "Company News",
    date: "Dec 8, 2024",
    readTime: "2 min",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600",
  },
];

// ========================
// NEWS CARD COMPONENT
// ========================
interface NewsCardProps {
  article: NewsArticle;
  index: number;
}

const NewsCard: React.FC<NewsCardProps> = ({ article, index }) => (
  <motion.a
    href={`/news/${article.id}`}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay: index * 0.1 }}
    className={cn(
      "group block rounded-xl overflow-hidden",
      "bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700",
      "hover:shadow-lg dark:hover:shadow-neutral-900/50 transition-all duration-300",
      article.featured ? "md:col-span-2 md:row-span-2" : ""
    )}
  >
    {/* Image */}
    <div
      className={cn(
        "relative overflow-hidden",
        article.featured ? "h-48 md:h-64" : "h-40"
      )}
    >
      <img
        src={article.image}
        alt={article.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-neutral-900/10 group-hover:bg-neutral-900/20 transition-colors" />
      
      {/* Category Badge */}
      <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-medium text-white bg-indigo-600 rounded-full">
        {article.category}
      </span>
    </div>

    {/* Content */}
    <div className="p-3 sm:p-4">
      <h3
        className={cn(
          "font-semibold text-neutral-900 dark:text-white group-hover:text-indigo-600 transition-colors line-clamp-2",
          article.featured ? "text-base sm:text-lg" : "text-sm"
        )}
      >
        {article.title}
      </h3>
      
      <p
        className={cn(
          "mt-1.5 sm:mt-2 text-neutral-500 dark:text-neutral-400 line-clamp-2",
          article.featured ? "text-xs sm:text-sm" : "text-xs"
        )}
      >
        {article.excerpt}
      </p>

      {/* Meta */}
      <div className="mt-2.5 sm:mt-3 flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-neutral-400">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {article.date}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {article.readTime}
        </span>
      </div>
    </div>
  </motion.a>
);

// ========================
// MAIN COMPONENT
// ========================
const News: React.FC = () => {
  return (
    <Section background="white" className="py-8 sm:py-12 lg:py-16">
      <Container size="xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 rounded-full mb-2 sm:mb-3">
              News & Updates
            </span>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white">
              Latest From Nordea Access
            </h2>
          </motion.div>

          <motion.a
            href="/news"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={cn(
              "inline-flex items-center gap-2 text-sm font-medium text-indigo-600",
              "hover:text-indigo-700 transition-colors"
            )}
          >
            View All News
            <ArrowRight className="w-4 h-4" />
          </motion.a>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {newsArticles.map((article, index) => (
            <NewsCard key={article.id} article={article} index={index} />
          ))}
        </div>

        {/* Newsletter Signup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={cn(
            "mt-8 sm:mt-10 p-4 sm:p-5 md:p-6 rounded-xl",
            "bg-neutral-50 dark:bg-neutral-700/50 border border-neutral-100 dark:border-neutral-700"
          )}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
            <div>
              <h4 className="font-semibold text-neutral-900 dark:text-white text-sm sm:text-base">
                Stay Updated with Our Newsletter
              </h4>
              <p className="mt-1 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                Get the latest financial tips, product updates, and exclusive offers.
              </p>
            </div>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className={cn(
                  "px-4 py-2.5 rounded-lg text-sm",
                  "bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700",
                  "focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500",
                  "w-full sm:w-64"
                )}
              />
              <button
                className={cn(
                  "px-5 py-2.5 rounded-lg text-sm font-medium",
                  "bg-indigo-600 text-white",
                  "hover:bg-indigo-700 transition-colors",
                  "whitespace-nowrap"
                )}
              >
                Subscribe
              </button>
            </div>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
};

export default News;
