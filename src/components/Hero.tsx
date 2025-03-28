import React from "react";
import { Trophy, Shield, Zap } from "lucide-react";
import { Button } from "./ui/button";

/**
 * Props for the FeatureBadge component.
 */
interface FeatureBadgeProps {
  /** The icon to display on the badge */
  icon: React.ReactNode;
  /** The text label for the badge */
  text: string;
}

/**
 * FeatureBadge component renders a badge with an icon and text.
 *
 * @param {FeatureBadgeProps} props - Contains icon and text to be displayed.
 * @returns {JSX.Element} The rendered feature badge.
 */
const FeatureBadge: React.FC<FeatureBadgeProps> = ({ icon, text }) => {
  return (
    <div className="flex items-center space-x-2 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors rounded-full px-4 py-2">
      {/* Icon container with custom color */}
      <div className="text-chess-gold">{icon}</div>
      {/* Text label */}
      <span className="font-medium">{text}</span>
    </div>
  );
};

/**
 * HeroSection component serves as the primary hero area for the landing page.
 *
 * @remarks
 * - It includes a background with a chess board pattern and decorative blurred circles.
 * - The left section contains the headline, description, call-to-action buttons, and feature badges.
 * - The right section displays a prize pool card with animated effects.
 *
 * @returns {JSX.Element} The rendered HeroSection component.
 */
const HeroSection: React.FC = () => {
  return (
    <div
      id="home"
      className="relative min-h-screen overflow-hidden pt-20 flex items-center"
    >
      {/* Background with chess pattern and gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background to-background/70 z-0">
        <div className="chess-board-bg absolute inset-0 opacity-20"></div>
      </div>

      {/* Decorative blurred circles for visual interest */}
      <div className="absolute top-1/4 left-10 w-64 h-64 bg-chess-gold/20 rounded-full filter blur-3xl animate-pulse-soft"></div>
      <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-chess-secondary/20 rounded-full filter blur-3xl animate-pulse-soft"></div>

      {/* Main content container */}
      <div className="container mx-auto px-6 z-10 flex flex-col md:flex-row items-center justify-between">
        {/* Left side: Headline, description, buttons, and feature badges */}
        <div className="md:w-1/2 space-y-6 md:pr-8">
          <div className="space-y-2 animate-slide-up">
            {/* Main headline with highlighted text */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight text-balance">
              Master Chess. <br />
              <span className="text-shine">Win Big.</span>
            </h1>
            {/* Subheading / description */}
            <p className="text-lg md:text-xl text-foreground/80 max-w-2xl">
              Compete in tournaments with real prize pools. Connect with friends
              and chess enthusiasts around the world.
            </p>
          </div>

          {/* Call-to-action buttons */}
          <div
            className="flex flex-wrap gap-4 pt-4 animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            <Button className="primary-btn text-base px-8 py-6">
              Play Now
            </Button>
            <Button className="secondary-btn text-base px-8 py-6">
              Create Tournament
            </Button>
          </div>

          {/* Feature badges displaying key features */}
          <div
            className="flex flex-col sm:flex-row gap-6 pt-6 animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            <FeatureBadge
              icon={<Trophy className="h-5 w-5" />}
              text="Prize Pools"
            />
            <FeatureBadge
              icon={<Shield className="h-5 w-5" />}
              text="Anti-Cheat"
            />
            <FeatureBadge
              icon={<Zap className="h-5 w-5" />}
              text="Live Matches"
            />
          </div>
        </div>

        {/* Right side: Prize pool card */}
        <div
          className="md:w-1/2 mt-12 md:mt-0 flex justify-center md:justify-end animate-slide-up"
          style={{ animationDelay: "0.3s" }}
        >
          <div className="relative">
            {/* Gradient overlay on the card */}
            <div className="absolute inset-0 bg-gradient-radial from-chess-gold/30 to-transparent rounded-full filter blur-xl"></div>
            {/* Main prize pool card */}
            <div className="relative w-72 h-72 sm:w-96 sm:h-96 bg-white/5 backdrop-blur-sm rounded-lg shadow-2xl overflow-hidden border border-white/10">
              {/* Background chess pattern overlay */}
              <div className="absolute inset-0 chess-board-bg opacity-30"></div>
              {/* Centered icon inside the card */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-chess-gold/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-md border border-chess-gold/30">
                  <Trophy className="h-10 w-10 text-chess-gold" />
                </div>
              </div>
              {/* Prize pool information at the bottom */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/80 border-t border-white/10 text-white p-4 text-center font-medium">
                <div className="text-sm text-white/70">CURRENT PRIZE POOL</div>
                <div className="text-2xl font-bold text-chess-gold">$2,500</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default HeroSection;
