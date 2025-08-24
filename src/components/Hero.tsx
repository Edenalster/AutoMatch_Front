import React, { useEffect, useState } from "react";
import { Trophy, Shield, Zap } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { Users, Calendar } from "lucide-react";
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
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [stats, setStats] = useState({
    activePlayers: 0,
    tournamentsCount: 0,
    liveGames: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/lichess/dashboard/summary`);
        const data = await res.json();

        // Filter only live tournaments if not already done server-side
        const liveTournamentCount =
          data.tournaments?.filter((t: any) => t.status === "active").length ||
          0;

        setStats({
          activePlayers: data.activePlayers,
          liveGames: data.liveGames,
          tournamentsCount: liveTournamentCount, // 🟡 override if needed
        });
      } catch (err) {
        console.error("❌ Failed to fetch stats", err);
      }
    };

    fetchStats(); // initial
    const interval = setInterval(fetchStats, 2000); // 🔁 every 2s
    return () => clearInterval(interval); // cleanup
  }, []);

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
            <Link to="/find-match">
              {" "}
              <Button className="primary-btn text-base px-8 py-6">
                Play Now
              </Button>
            </Link>

            <Link to="/create-tournament">
              <Button className="secondary-btn text-base px-8 py-6">
                Create Tournament
              </Button>
            </Link>
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
            <Link to="/anti-cheat">
              <FeatureBadge
                icon={<Shield className="h-5 w-5" />}
                text="Anti-Cheat"
              />
            </Link>
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
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-radial from-chess-gold/30 to-transparent rounded-full filter blur-xl"></div>

            {/* Main stats card */}
            <div className="relative w-72 h-72 sm:w-96 sm:h-96 bg-white/5 backdrop-blur-sm rounded-lg shadow-2xl overflow-hidden border border-white/10">
              {/* Pattern overlay */}
              <div className="absolute inset-0 chess-board-bg opacity-30"></div>

              {/* Center content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                {/* Icon + Label */}
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-chess-gold/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-md border border-chess-gold/30 mx-auto mb-3">
                    <Zap className="h-8 w-8 text-chess-gold" />
                  </div>
                  <div className="text-sm text-white/70 uppercase tracking-wider">
                    Live Now
                  </div>
                </div>

                {/* Player + Tournament grid */}
                <div className="grid grid-cols-2 gap-4 w-full">
                  <div className="text-center p-3 bg-black/40 rounded-lg border border-white/10">
                    <div className="flex items-center justify-center mb-2">
                      <Users className="h-4 w-4 text-chess-secondary mr-1" />
                      <span className="text-xs text-white/70">PLAYERS</span>
                    </div>
                    <div className="text-xl font-bold text-chess-secondary">
                      {stats.activePlayers.toLocaleString()}
                    </div>
                  </div>

                  <div className="text-center p-3 bg-black/40 rounded-lg border border-white/10">
                    <div className="flex items-center justify-center mb-2">
                      <Calendar className="h-4 w-4 text-chess-gold mr-1" />
                      <span className="text-xs text-white/70">TOURNAMENTS</span>
                    </div>
                    <div className="text-xl font-bold text-chess-gold">
                      {stats.tournamentsCount}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom: Active matches */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/80 border-t border-white/10 text-white p-4 text-center font-medium">
                <div className="text-sm text-white/70">ACTIVE MATCHES</div>
                <div className="text-2xl font-bold text-chess-gold">
                  {stats.liveGames}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default HeroSection;
