import React from "react";
import {
  Shield,
  Zap,
  ChevronsUp,
  Users,
  Award,
  Dice5,
  Trophy,
} from "lucide-react";

/**
 * Props for the FeatureCard component.
 */
interface FeatureCardProps {
  /** Icon to display for the feature */
  icon: React.ReactNode;
  /** Title of the feature */
  title: string;
  /** Description of the feature */
  description: string;
  /** Tailwind classes for the background gradient of the card's hover state */
  accentColor: string;
  /** Tailwind classes for the background color of the icon container */
  iconBg: string;
  /** Tailwind classes for the border color of the card */
  borderColor: string;
  /** Tailwind classes for the hover state border color of the card */
  hoverColor: string;
  /** Flag to indicate if the card is featured */
  featured?: boolean;
}

/**
 * FeatureCard component renders an individual feature card with customizable styling.
 *
 * @param {FeatureCardProps} props - Properties to customize the feature card.
 * @returns {JSX.Element} A styled card representing a feature.
 */
const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  accentColor,
  iconBg,
  borderColor,
  hoverColor,
  featured = false,
}) => {
  return (
    <div
      className={`relative rounded-xl h-full transition-all duration-500 group ${
        featured ? "animate-float" : ""
      }`}
    >
      {/* Background gradient effect that appears on hover */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${accentColor} rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
      ></div>

      {/* Card content container */}
      <div
        className={`glass-card p-8 rounded-xl h-full flex flex-col relative z-10 transition-all duration-300 ${hoverColor} ${borderColor} group-hover:shadow-lg group-hover:-translate-y-1`}
      >
        {/* If featured, render a "POPULAR" badge */}
        {featured && (
          <div className="absolute -top-3 -right-3 bg-chess-gold text-chess-dark text-xs font-bold px-3 py-1 rounded-full shadow-md">
            POPULAR
          </div>
        )}

        {/* Icon container with a hover scale effect */}
        <div
          className={`h-16 w-16 rounded-xl ${iconBg} flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110`}
        >
          <div className="h-8 w-8">{icon}</div>
        </div>

        {/* Feature title */}
        <h3 className="text-2xl font-bold mb-3 text-white">{title}</h3>
        {/* Feature description */}
        <p className="text-white/70 flex-grow">{description}</p>

        {/* Decorative line that expands on hover */}
        <div className="h-1 w-12 bg-gradient-to-r from-white/20 to-transparent mt-6 group-hover:w-24 transition-all duration-300"></div>
      </div>
    </div>
  );
};

/**
 * FeatureSection component displays a section that highlights various features of the AutoMatch platform.
 *
 * @remarks
 * The section includes a heading with an icon, a descriptive paragraph, and a grid of FeatureCard components.
 * It also incorporates decorative background elements and gradient overlays for visual appeal.
 *
 * @returns {JSX.Element} The rendered FeatureSection component.
 */
const FeatureSection: React.FC = () => {
  return (
    <section id="features" className="section-padding relative overflow-hidden">
      {/* Background gradient with a chess board pattern overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-chess-dark/90 via-chess-dark to-chess-dark/90 z-0">
        <div className="chess-board-bg opacity-10"></div>
      </div>

      {/* Decorative blurred elements for dynamic visuals */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-chess-warning/10 rounded-full filter blur-3xl animate-pulse-soft"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-chess-accent/10 rounded-full filter blur-3xl animate-pulse-soft"></div>

      {/* Main content container */}
      <div className="container mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block mb-4">
            {/* Icon and title container */}
            <div className="h-16 w-16 bg-chess-gold/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-chess-gold/30">
              <Trophy className="h-8 w-8 text-chess-gold" />
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">
              Why Choose <span className="text-shine">AutoMatch</span>
            </h2>
          </div>
          {/* Section description */}
          <p className="text-white/70 text-lg">
            Our platform combines the precision of professional chess
            tournaments with the excitement of prize pools, all powered by
            advanced anti-cheat technology.
          </p>
        </div>

        {/* Grid of FeatureCard components */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Shield className="text-chess-gold" />}
            title="Advanced Anti-Cheat"
            description="AI-powered cheat detection ensures fair play in all tournaments, maintaining integrity and trustworthiness."
            accentColor="from-chess-gold/20 to-chess-gold/5"
            iconBg="bg-chess-gold/10"
            borderColor="border-chess-gold/20"
            hoverColor="hover:border-chess-gold/40"
          />

          <FeatureCard
            icon={<Zap className="text-chess-warning" />}
            title="Fast-Paced Tournaments"
            description="Choose from blitz, rapid, or classic formats. Our tournaments are designed for all time preferences."
            accentColor="from-chess-warning/20 to-chess-warning/5"
            iconBg="bg-chess-warning/10"
            borderColor="border-chess-warning/20"
            hoverColor="hover:border-chess-warning/40"
            featured={true}
          />

          <FeatureCard
            icon={<Award className="text-chess-gold" />}
            title="Real Prize Pools"
            description="Compete for actual cash prizes. The better you perform, the more you can win."
            accentColor="from-chess-gold/20 to-chess-gold/5"
            iconBg="bg-chess-gold/10"
            borderColor="border-chess-gold/20"
            hoverColor="hover:border-chess-gold/40"
          />

          <FeatureCard
            icon={<ChevronsUp className="text-chess-secondary" />}
            title="Skill-Based Matching"
            description="Our rating system ensures you play against opponents of similar skill levels for balanced competition."
            accentColor="from-chess-secondary/20 to-chess-secondary/5"
            iconBg="bg-chess-secondary/10"
            borderColor="border-chess-secondary/20"
            hoverColor="hover:border-chess-secondary/40"
          />

          <FeatureCard
            icon={<Users className="text-chess-accent" />}
            title="Community Tournaments"
            description="Create private tournaments for friends or join community events with players worldwide."
            accentColor="from-chess-accent/20 to-chess-accent/5"
            iconBg="bg-chess-accent/10"
            borderColor="border-chess-accent/20"
            hoverColor="hover:border-chess-accent/40"
          />

          <FeatureCard
            icon={<Dice5 className="text-chess-success" />}
            title="Performance Analytics"
            description="Track your progress, analyze your games, and identify areas for improvement with detailed stats."
            accentColor="from-chess-success/20 to-chess-success/5"
            iconBg="bg-chess-success/10"
            borderColor="border-chess-success/20"
            hoverColor="hover:border-chess-success/40"
          />
        </div>
      </div>
    </section>
  );
};
export default FeatureSection;
