import React from "react";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { Trophy, Clock, Users, Star } from "lucide-react";

/**
 * Props for the TournamentCard component.
 */
interface TournamentCardProps {
  /** Tournament title */
  title: string;
  /** Tournament type or format description */
  type: string;
  /** Average rating of the tournament */
  avgRating: number;
  /** Prize pool amount */
  prizePool: number;
  /** Current number of players in the tournament */
  players: number;
  /** Maximum number of players allowed */
  maxPlayers: number;
  /** Start time of the tournament */
  startTime: string;
  /** Flag to indicate if this tournament is featured */
  featured?: boolean;
  /** Optional additional class names */
  className?: string;
}

/**
 * Props for the Stat component.
 */
interface StatProps {
  /** Label for the statistic */
  label: string;
  /** Value of the statistic as a string */
  value: string;
  /** Optional icon to display alongside the label */
  icon?: React.ReactNode;
  /** Optional additional class names for styling the value */
  className?: string;
}

/**
 * Stat component displays a single statistic with a label, value, and optional icon.
 *
 * @param {StatProps} props - The properties for the statistic.
 * @returns {JSX.Element} A styled statistic display.
 */
const Stat: React.FC<StatProps> = ({ label, value, icon, className }) => {
  return (
    <div className="bg-foreground/5 rounded-lg p-3">
      {/* Label with optional icon */}
      <div className="text-xs text-foreground/60 uppercase flex items-center">
        {icon && <span className="mr-1">{icon}</span>}
        {label}
      </div>
      <div className={cn("text-lg font-semibold", className)}>{value}</div>
    </div>
  );
};

/**
 * TournamentCard component displays tournament details including title, type, statistics,
 * and a join button. It uses the Stat sub-component to display key tournament metrics.
 *
 * @param {TournamentCardProps} props - Properties describing the tournament.
 * @returns {JSX.Element} The rendered TournamentCard.
 */
const TournamentCard: React.FC<TournamentCardProps> = ({
  title,
  type,
  avgRating,
  prizePool,
  players,
  maxPlayers,
  startTime,
  featured = false,
  className,
}) => {
  return (
    <div
      className={cn(
        "glass-card relative overflow-hidden rounded-xl card-hover",
        featured ? "border-chess-gold/50" : "border-white/20",
        className
      )}
    >
      {/* Render a featured badge if applicable */}
      {featured && (
        <div className="absolute top-0 right-0">
          <div className="bg-chess-gold text-white text-xs font-bold px-4 py-1 rounded-bl-md flex items-center space-x-1 shadow-md">
            <Star className="h-3 w-3 mr-1" />
            <span>FEATURED</span>
          </div>
        </div>
      )}

      <div className="p-6 flex flex-col h-full">
        {/* Header section with title, type, and trophy icon */}
        <div className="mb-4 flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold">{title}</h3>
            <p className="text-sm text-foreground/70">{type}</p>
          </div>
          <div className="h-12 w-12 rounded-full flex items-center justify-center bg-chess-primary/10">
            <Trophy className="h-6 w-6 text-chess-primary" />
          </div>
        </div>

        {/* Statistics grid displaying tournament metrics */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Stat label="AVG Rating" value={avgRating.toString()} />
          <div className="prize-glow rounded-lg">
            <div className="prize-glow-content">
              <Stat
                label="Prize Pool"
                value={`$${prizePool}`}
                className="font-bold text-chess-gold"
              />
            </div>
          </div>
          <Stat
            label="Players"
            value={`${players}/${maxPlayers}`}
            icon={<Users className="h-4 w-4 text-chess-secondary" />}
          />
          <Stat
            label="Starts In"
            value={startTime}
            icon={<Clock className="h-4 w-4 text-chess-warning" />}
          />
        </div>

        {/* Call-to-action button */}
        <div className="mt-auto pt-4">
          <Button
            className={featured ? "primary-btn w-full" : "secondary-btn w-full"}
          >
            Join Tournament
          </Button>
        </div>
      </div>
    </div>
  );
};
export default TournamentCard;
