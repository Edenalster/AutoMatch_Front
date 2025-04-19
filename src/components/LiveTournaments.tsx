import React, { useState } from "react";
import { Button } from "./ui/button";
import TournamentCard from "./TournamentCard";
import { Trophy, ChevronRight, Filter } from "lucide-react";

/**
 * Props for the TournamentFilter component.
 */
interface TournamentFilterProps {
  /** Title to be displayed on the filter button */
  title: string;
  /** Flag indicating whether this filter is active */
  active: boolean;
  /** Flag indicating whether this filter is active */
  onClick: () => void;
}

/**
 * TournamentFilter component renders an individual filter button.
 *
 * @param props - The properties for the filter including title, active state, and onClick handler.
 * @returns A Button component styled based on whether it is active.
 */
const TournamentFilter: React.FC<TournamentFilterProps> = ({
  title,
  active,
  onClick,
}) => {
  return (
    <Button
      variant={active ? "default" : "outline"}
      size="sm"
      className={`rounded-full ${
        active
          ? "bg-chess-gold text-chess-dark hover:bg-chess-gold/90"
          : "bg-white/5 border-white/20 text-white hover:bg-white/10"
      }`}
      onClick={onClick}
    >
      {title}
    </Button>
  );
};

/**
 * LiveTournaments component renders the live tournaments section.
 *
 * @remarks
 * The component includes a header with prize pool information, filter buttons,
 * a grid of TournamentCard components for individual tournaments, and a button to view all tournaments.
 *
 * @returns {JSX.Element} The rendered live tournaments section.
 */
const LiveTournaments: React.FC = () => {
  // State for tracking the currently active filter.
  const [activeFilter, setActiveFilter] = useState("all");

  return (
    <section id="tournaments" className="section-padding relative">
      {/* Background gradient overlay */}
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-radial from-chess-gold/5 to-transparent"></div>
      {/* Background gradient with a chess board pattern overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-chess-dark/90 via-chess-dark to-chess-dark/90 z-0"></div>
      <div className="absolute inset-0 chess-board-bg opacity-15 z-0"></div>

      {/* Decorative blurred elements for dynamic visuals */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-chess-gold/10 rounded-full filter blur-3xl animate-pulse-soft"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-chess-secondary/10 rounded-full filter blur-3xl animate-pulse-soft"></div>

      <div className="container mx-auto relative z-10">
        {/* Header section with title, description, and filter buttons */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 space-y-4 md:space-y-0">
          <div>
            {/* Prize Pool Icon and Label */}
            <div className="flex items-center space-x-2 mb-2">
              <div className="h-6 w-6 rounded-full bg-chess-gold flex items-center justify-center">
                <Trophy className="h-3 w-3 text-chess-dark" />
              </div>
              <span className="text-sm font-medium text-chess-gold">
                PRIZE POOLS
              </span>
            </div>
            {/* Main heading and description */}
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Live Tournaments
            </h2>
            <p className="text-white/70 mt-2 max-w-xl">
              Join ongoing tournaments or register for upcoming ones. Compete
              against players of similar skill levels and win real prizes.
            </p>
          </div>

          {/* Filter buttons */}
          <div className="flex flex-wrap gap-2">
            <TournamentFilter
              title="All"
              active={activeFilter === "all"}
              onClick={() => setActiveFilter("all")}
            />
            <TournamentFilter
              title="Rapid"
              active={activeFilter === "rapid"}
              onClick={() => setActiveFilter("rapid")}
            />
            <TournamentFilter
              title="Blitz"
              active={activeFilter === "blitz"}
              onClick={() => setActiveFilter("blitz")}
            />
            <TournamentFilter
              title="Classic"
              active={activeFilter === "classic"}
              onClick={() => setActiveFilter("classic")}
            />
            {/* Extra filter button with icon */}
            <Button
              size="sm"
              variant="outline"
              className="rounded-full bg-white/5 border-white/20 text-white hover:bg-white/10"
            >
              <Filter className="h-4 w-4 mr-1" />
              <span>Filters</span>
            </Button>
          </div>
        </div>

        {/* Grid of tournament cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <TournamentCard
            title="Weekend Blitz Championship"
            type="Blitz • 3+2"
            avgRating={1500}
            prizePool={400}
            players={24}
            maxPlayers={32}
            startTime="2h 15m"
            featured={true}
          />

          <TournamentCard
            title="Grandmaster Challenge"
            type="Classic • 15+10"
            avgRating={2189}
            prizePool={1200}
            players={12}
            maxPlayers={16}
            startTime="4h 30m"
          />

          <TournamentCard
            title="Rapid Thursday"
            type="Rapid • 10+5"
            avgRating={1750}
            prizePool={300}
            players={18}
            maxPlayers={24}
            startTime="1h 45m"
          />
        </div>

        {/* Button to view all tournaments */}
        <div className="flex justify-center mt-10">
          <Button
            variant="outline"
            className="group bg-white/5 border-white/20 text-white hover:bg-white/10"
          >
            <span>View All Tournaments</span>
            <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </section>
  );
};
export default LiveTournaments;
