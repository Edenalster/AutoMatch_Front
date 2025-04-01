import React from "react";
import { Shield, Trophy } from "lucide-react";

import { Link } from "react-router-dom";

const AntiCheatSection: React.FC = () => {
  return (
    <section
      id="anti-cheat"
      className="min-h-screen flex flex-col relative overflow-hidden"
    >
      {/* Background gradient with a chess board pattern overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-chess-dark/90 via-chess-dark to-chess-dark/90 z-0"></div>
      <div className="absolute inset-0 chess-board-bg opacity-15 z-0"></div>

      {/* Decorative blurred elements for dynamic visuals */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-chess-gold/10 rounded-full filter blur-3xl animate-pulse-soft"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-chess-secondary/10 rounded-full filter blur-3xl animate-pulse-soft"></div>

      {/* Header with logo */}
      <header className="pt-6 px-6 md:px-12 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <Link to="/" className="flex items-center space-x-2">
              <Trophy className="h-8 w-8 text-chess-gold animate-pulse-soft" />
              <span className="text-xl font-bold tracking-tight text-white">
                <span className="text-chess-gold">Auto</span>
                <span>Match</span>
              </span>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto relative z-10 pb-12 pt-12">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-block mb-4">
            <div className="h-16 w-16 bg-chess-gold/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-chess-gold/30">
              <Shield className="h-8 w-8 text-chess-gold" />
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-4 text-white">
              AI Powered <span className="text-shine">Cheat Detection</span>
            </h2>
          </div>
          <p className="text-white/70 text-xl ">
            Our chess platform uses AI technology to ensure fair play by
            detecting potential cheating. The system analyzes gameplay patterns,
            including move accuracy and consistency, matching them to the
            players existing rating and top-level chess engines. If the AI
            identifies behavior that closely matches engine-like moves or
            abnormal play, it flags the account for review. This process helps
            maintain a fair and competitive environment for all players
          </p>
        </div>
      </div>
    </section>
  );
};

export default AntiCheatSection;
