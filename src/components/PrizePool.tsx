import React from "react";
import { Trophy, Award, Star } from "lucide-react";

/**
 * Props for the PrizeCard component.
 */
interface PrizeCardProps {
  /** The position of the prize (e.g., "1st Place") */
  position: string;
  /** The prize amount or description (e.g., "$8,000") */
  prize: string;
  /** Icon to be displayed on the card */
  icon: React.ReactNode;
}

/**
 * PrizeCard component displays an individual prize detail.
 *
 * @param {PrizeCardProps} props - Contains position, prize, and icon properties.
 * @returns {JSX.Element} A styled card showing prize information.
 */
const PrizeCard: React.FC<PrizeCardProps> = ({ position, prize, icon }) => {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
      {/* Icon container */}
      <div className="flex justify-center mb-2">{icon}</div>
      {/* Display the prize position */}
      <div className="text-sm font-medium text-white/70">{position}</div>
      {/* Display the prize amount */}
      <div className="text-xl font-bold text-white">{prize}</div>
    </div>
  );
};

/**
 * Props for the PrizeFeature component.
 */
interface PrizeFeatureProps {
  /** Title of the feature */
  title: string;
  /** Description of the feature */
  description: string;
}

/**
 * PrizeFeature component renders a feature highlight with an icon.
 *
 * @param {PrizeFeatureProps} props - Contains title and description for the feature.
 * @returns {JSX.Element} A small component displaying a prize feature.
 */
const PrizeFeature: React.FC<PrizeFeatureProps> = ({ title, description }) => {
  return (
    <div className="flex space-x-4">
      {/* Icon container with a Star icon */}
      <div className="h-10 w-10 rounded-full bg-chess-gold/10 flex items-center justify-center flex-shrink-0 mt-1">
        <Star className="h-5 w-5 text-chess-gold" />
      </div>
      {/* Textual description */}
      <div>
        <h4 className="text-lg font-bold text-white">{title}</h4>
        <p className="text-white/70">{description}</p>
      </div>
    </div>
  );
};

/**
 * PrizePool component displays the overall prize pool section.
 *
 * @remarks
 * This section includes background design elements, a main card showing
 * the monthly prize pool, and a list of prize features.
 *
 * @returns {JSX.Element} The complete PrizePool section.
 */
const PrizePool: React.FC = () => {
  return (
    <section
      id="how-it-works"
      className="section-padding bg-gradient-to-br from-chess-dark/90 via-background to-chess-dark/90 relative overflow-hidden"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 chess-board-bg opacity-5"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-chess-gold/10 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-chess-secondary/10 rounded-full filter blur-3xl"></div>

      <div className="container mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left side: Prize Pool Card */}
          <div className="lg:w-1/2">
            <div className="relative">
              {/* Animated gradient background overlay */}
              <div className="absolute -inset-4 bg-gradient-to-r from-chess-gold via-chess-secondary to-chess-accent rounded-lg opacity-30 blur-xl animate-pulse-soft"></div>
              {/* Main prize pool card */}
              <div className="relative glass-card border-white/20 overflow-hidden rounded-xl">
                {/* Decorative blurred circles */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-chess-gold/20 rounded-full -translate-x-8 translate-y-8 blur-md"></div>
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-chess-primary/20 rounded-full translate-x-5 -translate-y-5 blur-md"></div>

                {/* Prize pool content */}
                <div className="relative p-8 z-10">
                  <div className="flex items-center space-x-3 mb-6">
                    <Trophy className="h-8 w-8 text-chess-gold" />
                    <h3 className="text-2xl font-bold text-white">
                      Monthly Prize Pool
                    </h3>
                  </div>

                  {/* Display the prize amount */}
                  <div className="text-6xl font-bold mb-6">
                    <span className="text-shine">$25,000</span>
                  </div>

                  <p className="text-white/70 mb-8">
                    Our total prize money distributed across all tournaments
                    each month. Top performers take home the biggest shares.
                  </p>

                  {/* Prize cards for top positions */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <PrizeCard
                      position="1st Place"
                      prize="$8,000"
                      icon={<Award className="h-5 w-5 text-chess-gold" />}
                    />
                    <PrizeCard
                      position="2nd Place"
                      prize="$4,000"
                      icon={<Award className="h-5 w-5 text-[#C0C0C0]" />}
                    />
                    <PrizeCard
                      position="3rd Place"
                      prize="$2,000"
                      icon={<Award className="h-5 w-5 text-[#CD7F32]" />}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side: Prize Features */}
          <div className="lg:w-1/2 space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Win Big. Get Rewarded.
            </h2>
            <p className="text-white/70">
              At AutoMatch, we believe in rewarding skill and determination. Our
              prize pools are distributed fairly based on tournament
              performance, with opportunities for players of all skill levels.
            </p>

            {/* List of prize features */}
            <div className="space-y-4">
              <PrizeFeature
                title="Fair Distribution"
                description="Prize money is distributed across different tournament tiers, ensuring players of various skill levels have chances to win."
              />

              <PrizeFeature
                title="Weekly Payouts"
                description="Winnings are processed every week, with multiple secure payment methods available for withdrawals."
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default PrizePool;
