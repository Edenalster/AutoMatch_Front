// SearchResults.tsx עם כפתור לכניסה ל-bracket
import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { ChevronLeft,  Filter, TrophyIcon } from "lucide-react";
import Navbar from "../components/Navbar";
import TournamentCard from "../components/TournamentCard";

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
  status?: string;
}

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const entryFee = searchParams.get("entryFee") || "0";
  const rankRange = searchParams.get("rankRange") || "any";
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const res = await fetch(
          `${backendUrl}/api/lichess/tournaments/search?entryFee=${entryFee}&rankRange=${rankRange}`
        );
        const data = await res.json();
  
        const filtered = (data.tournaments ?? [])
        .filter((t: Tournament) => t.status !== "completed" && t.status !== "expired")// ✅ hide completed
          .sort((a: Tournament, b: Tournament) => b._id.localeCompare(a._id)); // newest first
  
        setTournaments(filtered);
      } catch (err) {
        console.error("❌ Failed to fetch tournaments:", err);
        setTournaments([]);
      }
    };
  
    fetchTournaments();
  
    const interval = setInterval(fetchTournaments, 5000); // 🕒 refresh every 5 sec
    return () => clearInterval(interval);
  }, [entryFee, rankRange]);

  const handleJoin = async (tournamentId: string) => {
    const lichessId = localStorage.getItem("lichessId");
  
    try {
      // Fetch user rating
      const userRes = await fetch(`https://lichess.org/api/user/${lichessId}`);
      const userData = await userRes.json();
      const userRating = userData?.perfs?.blitz?.rating || 1500;
  
      // Find the tournament
      const tournament = tournaments.find((t) => t._id === tournamentId);
      if (!tournament) throw new Error("Tournament not found");
  
      // Compare rating
      if (
        tournament.rankRange &&
        userRating > tournament.rankRange.max
      ) {
        alert(
          `Your rating (${userRating}) is too high for this tournament (max: ${tournament.rankRange.max})`
        );
        return;
      }
  
      // Proceed to join
      const res = await fetch(
        `${backendUrl}/api/lichess/tournaments/${tournamentId}/join`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username: lichessId }),
        }
      );
  
      if (!res.ok) throw new Error("Join failed");
      navigate(`/lobby/${tournamentId}`);
    } catch (err) {
      console.error("❌ Failed to join tournament:", err);
      alert("Failed to join tournament.");
    }
  };

  // פונקציה חדשה לניתוב לדף ה-bracket של טורניר
  const viewBracket = (tournamentId: string) => {
    navigate(`/bracket/${tournamentId}`);
  };

  return (
    <div className="min-h-screen bg-chess-dark">
      <Navbar showItems={false} />

      {/* Background wrapper - this needs to be fixed position to cover the entire screen */}
      <div className="fixed inset-0 w-full h-full z-0">
        {/* Gradient background */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-chess-dark/90 via-chess-dark to-chess-dark/90"></div>
        {/* Chess board pattern overlay */}
        <div className="absolute inset-0 w-full h-full chess-board-bg opacity-15"></div>
      </div>

      <div className="absolute top-20 left-10 w-64 h-64 bg-chess-gold/10 rounded-full filter blur-3xl animate-pulse-soft"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-chess-secondary/10 rounded-full filter blur-3xl animate-pulse-soft"></div>
      <div className="text-center relative mb-6 w-full"></div>

      <div className="pt-28 pb-16 px-4 md:px-8 max-w-7xl mx-auto relative z-30">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 space-y-4 md:space-y-0">
          <div>
            <div className="mb-4">
              <Link to="/find-match">
                <Button
                  variant="outline"
                  className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Back to Search
                </Button>
              </Link>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Search Results
            </h1>
            <div className="flex flex-wrap gap-2 text-sm text-white/70">
              <span>Entry Fee: ${entryFee}-Max</span>
              <span className="px-2">•</span>
              <span>
                Rank Range: {rankRange === "any"
                  ? "Any"
                  : rankRange.charAt(0).toUpperCase() + rankRange.slice(1)}
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="bg-white/5 border-white/20 text-white hover:bg-white/10"
          >
            <Filter className="mr-2 h-4 w-4" />
            Refine Results
          </Button>
        </div>

        {tournaments && tournaments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map((tournament) => (
              <div key={tournament._id} className="flex flex-col">
                <TournamentCard
                  title={tournament.tournamentName}
                  type={tournament.rankRange?.label || "Ranked"}
                  avgRating={
                    tournament.rankRange
                      ? (tournament.rankRange.min + tournament.rankRange.max) / 2
                      : 1500
                  }
                  prizePool={tournament.entryFee * tournament.maxPlayers}
                  players={tournament.playerIds.length}
                  maxPlayers={tournament.maxPlayers}
                  startTime={tournament.status === "active" ? "Ongoing" : "Soon"}
                  featured={false}
                  onJoin={() => handleJoin(tournament._id)}
                />
                
                {/* הוספת כפתור לצפייה בטורניר */}
                <div className="flex space-x-2 mt-2">
  <Button 
    onClick={() => viewBracket(tournament._id)}
    className="flex-1 bg-chess-secondary hover:bg-blue-700 text-white flex items-center justify-center"
  >
    <TrophyIcon className="mr-2 h-4 w-4" />
    View Bracket
  </Button>
</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-12 text-center">
            <h2 className="text-2xl font-semibold text-white mb-4">
              No Tournaments Found
            </h2>
            <p className="text-white/70 mb-8">
              Try adjusting your search criteria to find more tournaments.
            </p>
            <Link to="/find-match">
              <Button className="primary-btn">Modify Search</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;