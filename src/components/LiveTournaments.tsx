import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import TournamentCard from "./TournamentCard";
import { Trophy, ChevronRight, Filter } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

interface Tournament {
  _id: string;
  tournamentName: string;
  rankRange: {
    label: string;
    min: number;
    max: number;
  };
  entryFee: number;
  playerIds: string[];
  maxPlayers: number;
  status: string; 
}

const TournamentFilter: React.FC<{
  title: string;
  active: boolean;
  onClick: () => void;
}> = ({ title, active, onClick }) => (
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

const LiveTournaments: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [liveTournaments, setLiveTournaments] = useState<Tournament[]>([]);
  const navigate = useNavigate();
  const [fullTournaments, setFullTournaments] = useState<string[]>([]);

  useEffect(() => {
    const fetchLiveTournaments = async () => {
      try {
        const res = await fetch(
          `${backendUrl}/api/lichess/tournaments/search?entryFee=0&rankRange=any`
        );
        const data = await res.json();
        setLiveTournaments(data.tournaments || []);
      } catch (err) {
        console.error("Failed to fetch live tournaments", err);
      }
    };

    fetchLiveTournaments();
  }, []);

  const filteredTournaments = liveTournaments
  .filter((t: Tournament) => t.status !== "completed" && t.status !== "expired")
  .filter((t) => {
      if (activeFilter === "all") return true;
      return t.rankRange?.label?.toLowerCase() === activeFilter;
    });

  const handleJoin = async (tournamentId: string) => {
    const lichessId = localStorage.getItem("lichessId");

    try {
      const userRes = await fetch(`https://lichess.org/api/user/${lichessId}`);
      const userData = await userRes.json();
      const userRating = userData?.perfs?.blitz?.rating || 1500;

      const tournament = liveTournaments.find((t) => t._id === tournamentId);
      if (!tournament) throw new Error("Tournament not found");

      // Check if full
      if (tournament.playerIds.length >= tournament.maxPlayers) {
        setFullTournaments((prev) => [...prev, tournament._id]);
        return;
      }

      // Check rating range
      if (tournament.rankRange && userRating > tournament.rankRange.max) {
        alert(
          `Your rating (${userRating}) is too high for this tournament (max: ${tournament.rankRange.max})`
        );
        return;
      }

      // Join tournament
      const res = await fetch(
        `${backendUrl}/api/lichess/tournaments/${tournamentId}/join`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: lichessId }),
        }
      );

      if (!res.ok) throw new Error("Join failed");
      navigate(`/lobby/${tournamentId}`);
    } catch (err) {
      console.error("Failed to join tournament:", err);
      alert("Failed to join tournament.");
    }
  };

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

          <div className="flex flex-wrap gap-2">
            {["all", "Beginner", "Intermediate", "pro", "Elite"].map((type) => (
              <TournamentFilter
                key={type}
                title={type.charAt(0).toUpperCase() + type.slice(1)}
                active={activeFilter === type}
                onClick={() => setActiveFilter(type)}
              />
            ))}
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

        {/* Tournaments */}
        {filteredTournaments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTournaments.slice(0, 3).map((tournament) => (
              <div key={tournament._id}>
                <TournamentCard
                  title={tournament.tournamentName}
                  type={tournament.rankRange?.label || "Ranked"}
                  avgRating={
                    tournament.rankRange
                      ? (tournament.rankRange.min + tournament.rankRange.max) /
                        2
                      : 1500
                  }
                  prizePool={tournament.entryFee * tournament.maxPlayers}
                  players={tournament.playerIds.length}
                  maxPlayers={tournament.maxPlayers}
                  startTime="Ongoing"
                  featured={false}
                  onJoin={() => handleJoin(tournament._id)}
                />
                {fullTournaments.includes(tournament._id) && (
                  <p className="text-sm text-red-500 mt-2 text-center">
                    Tournament is already full
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-white/70 text-center mt-8">
            No live tournaments available at the moment.
          </p>
        )}

        <div className="flex justify-center mt-10">
          <Link to="/search-results?entryFee=0&rankRange=any">
            <Button
              variant="outline"
              className="group bg-white/5 border-white/20 text-white hover:bg-white/10"
            >
              <span>View All Tournaments</span>
              <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LiveTournaments;
