// ============================================================================
// TEAM SECTION - Team member display with cards
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import { Section, Container, Grid } from "@components/layout";
import { Card } from "@components/ui/Card";
import { Avatar } from "@components/ui/Avatar";
import { Linkedin, Twitter, Mail } from "lucide-react";
import Images from "@constants/images";

// ========================
// TYPES
// ========================
interface TeamMember {
  name: string;
  role: string;
  image: string;
  bio?: string;
  social?: {
    linkedin?: string;
    twitter?: string;
    email?: string;
  };
}

// ========================
// TEAM DATA
// ========================
const teamMembers: TeamMember[] = [
  {
    name: "Sarah Johnson",
    role: "Chief Executive Officer",
    image: Images.Team1,
    bio: "Leading Nordea Remit with 15+ years of fintech experience.",
    social: { linkedin: "#", twitter: "#" },
  },
  {
    name: "Michael Chen",
    role: "Chief Technology Officer",
    image: Images.Team2,
    bio: "Building the future of secure money transfers.",
    social: { linkedin: "#", twitter: "#" },
  },
  {
    name: "Emily Rodriguez",
    role: "Head of Operations",
    image: Images.Team3,
    bio: "Ensuring seamless transactions across 150+ countries.",
    social: { linkedin: "#" },
  },
  {
    name: "David Kim",
    role: "Head of Security",
    image: Images.Team4,
    bio: "Protecting your money with world-class security.",
    social: { linkedin: "#", email: "#" },
  },
];

// ========================
// ANIMATION VARIANTS
// ========================
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

// ========================
// TEAM MEMBER CARD
// ========================
interface TeamMemberCardProps {
  member: TeamMember;
}

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ member }) => {
  return (
    <motion.div variants={itemVariants}>
      <Card variant="default" hoverable className="h-full p-6 text-center">
        {/* Avatar */}
        <div className="mb-4 flex justify-center">
          <Avatar src={member.image} name={member.name} size="xl" className="h-24 w-24 sm:h-28 sm:w-28" />
        </div>

        {/* Info */}
        <h3 className="mb-1 text-lg font-semibold text-neutral-900 dark:text-white sm:text-xl">{member.name}</h3>
        <p className="mb-3 text-sm font-medium text-primary-600">{member.role}</p>

        {member.bio && <p className="mb-4 line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400">{member.bio}</p>}

        {/* Social Links */}
        {member.social && (
          <div className="flex items-center justify-center gap-3">
            {member.social.linkedin && (
              <motion.a
                href={member.social.linkedin}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 transition-colors hover:bg-primary-100 hover:text-primary-600 dark:bg-neutral-700 dark:text-neutral-400"
              >
                <Linkedin size={16} />
              </motion.a>
            )}
            {member.social.twitter && (
              <motion.a
                href={member.social.twitter}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 transition-colors hover:bg-primary-100 hover:text-primary-600 dark:bg-neutral-700 dark:text-neutral-400"
              >
                <Twitter size={16} />
              </motion.a>
            )}
            {member.social.email && (
              <motion.a
                href={`mailto:${member.social.email}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 transition-colors hover:bg-primary-100 hover:text-primary-600 dark:bg-neutral-700 dark:text-neutral-400"
              >
                <Mail size={16} />
              </motion.a>
            )}
          </div>
        )}
      </Card>
    </motion.div>
  );
};

// ========================
// MAIN COMPONENT
// ========================
export const TeamSection: React.FC = () => {
  return (
    <Section id="team" background="light" size="lg">
      <Container>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center sm:mb-16"
        >
          <span className="mb-2 block text-sm font-semibold uppercase tracking-wider text-primary-600">Our Team</span>
          <h2 className="mb-4 text-2xl font-bold text-neutral-900 dark:text-white sm:text-3xl lg:text-4xl">
            Meet the experts behind Nordea Remit
          </h2>
          <p className="mx-auto max-w-xl text-sm text-neutral-500 dark:text-neutral-400 sm:text-base">
            Our dedicated team of professionals works tirelessly to provide you with the best money transfer experience.
          </p>
        </motion.div>

        {/* Team Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <Grid cols={{ xs: 1, sm: 2, lg: 4 }} gap="lg">
            {teamMembers.map((member) => (
              <TeamMemberCard key={member.name} member={member} />
            ))}
          </Grid>
        </motion.div>
      </Container>
    </Section>
  );
};

export default TeamSection;
