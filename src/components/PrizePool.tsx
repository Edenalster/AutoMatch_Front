import React from "react";
import { Trophy, Award, Star } from "lucide-react";

interface PrizeCardProps {
  position: string;
  prize: string;
  icon: React.ReactNode;
}

const PrizeCard: React.FC<PrizeCardProps> = ({ position, prize, icon }) => {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
      <div className="flex justify-center mb-2">{icon}</div>
      <div className="text-sm font-medium text-white/70">{position}</div>
      <div className="text-xl font-bold text-white">{prize}</div>
    </div>
  );
};

interface PrizeFeatureProps {
  title: string;
  description: string;
}

const PrizeFeature: React.FC<PrizeFeatureProps> = ({ title, description }) => {
  return (
    <div className="flex space-x-4">
      <div className="h-10 w-10 rounded-full bg-chess-gold/10 flex items-center justify-center flex-shrink-0 mt-1">
        <Star className="h-5 w-5 text-chess-gold" />
      </div>
      <div>
        <h4 className="text-lg font-bold text-white">{title}</h4>
        <p className="text-white/70">{description}</p>
      </div>
    </div>
  );
};

const PrizePool: React.FC = () => {
  return (
    <section
      id="how-it-works"
      className="section-padding bg-gradient-to-br from-chess-dark/90 via-background to-chess-dark/90 relative overflow-hidden"
    >
      <div className="absolute inset-0 chess-board-bg opacity-5"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-chess-gold/10 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-chess-secondary/10 rounded-full filter blur-3xl"></div>

      <div className="container mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left: Prize Pool Card */}
          <div className="lg:w-1/2">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-chess-gold via-chess-secondary to-chess-accent rounded-lg opacity-30 blur-xl animate-pulse-soft"></div>
              <div className="relative glass-card border-white/20 overflow-hidden rounded-xl">
                <div className="absolute top-0 right-0 w-24 h-24 bg-chess-gold/20 rounded-full -translate-x-8 translate-y-8 blur-md"></div>
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-chess-primary/20 rounded-full translate-x-5 -translate-y-5 blur-md"></div>

                <div className="relative p-8 z-10">
                  <div className="flex items-center space-x-3 mb-6">
                    <Trophy className="h-8 w-8 text-chess-gold" />
                    <h3 className="text-2xl font-bold text-white">
                      Tournament Prize Pool
                    </h3>
                  </div>

                  <div className="text-5xl font-bold mb-6">
                    <span className="text-shine">Dynamic & Real</span>
                  </div>

                  <p className="text-white/70 mb-8">
                    Each tournament’s prize pool is built entirely from player
                    entry fees. The more players join, the bigger the pot — and
                    the winner takes it all.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                    <PrizeCard
                      position="1st Place"
                      prize="100% of Prize Pool"
                      icon={<Award className="h-5 w-5 text-chess-gold" />}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Prize Features */}
          <div className="lg:w-1/2 space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Win Big. Get Rewarded.
            </h2>
            <p className="text-white/70">
              At AutoMatch, we believe in high-stakes competition. Each
              tournament has a prize pool generated from player entry fees — and
              the winner takes it all. No splits. No second chances. Just pure,
              competitive glory.
            </p>

            <div className="space-y-4">
              <PrizeFeature
                title="High-Stakes Format"
                description="Only the top player walks away with the prize. Bring your best game and take it all."
              />
              <PrizeFeature
                title="Instant Payouts"
                description="Winners receive 100% of the prize pool immediately after the tournament ends — fast, fair, and final."
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PrizePool;
