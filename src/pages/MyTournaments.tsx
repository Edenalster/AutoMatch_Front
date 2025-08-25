import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardContent } from "../components/ui/card";
import {
  Trophy,
  Users,
  Clock,
  Award,
  Eye,
  Play,
  RefreshCw,
  AlertCircle,
  Calendar,
  DollarSign,
} from "lucide-react";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

interface Tournament {
  _id: string;
  tournamentName: string;
  maxPlayers: number;
  playerIds: string[];
  status: "active" | "completed" | "expired";
  winner?: string | null;
  entryFee: number;
  tournamentPrize: number;
  createdAt: string;
  bracket: any[];
  currentStage: number;
  lobbyExpiredAt?: string;
  tournamentExpiredAt?: string;
  rankRange?: {
    label: string;
    min: number;
    max: number;
  };
}

const MyTournaments = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const lichessId = localStorage.getItem("lichessId");

  useEffect(() => {
    document.title = "My Tournaments - AutoMatch";
  }, []);

  const fetchMyTournaments = async () => {
    if (!lichessId) {
      setError("Please log in to view your tournaments");
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const response = await fetch(`${backendUrl}/api/lichess/tournaments/all`);

      if (!response.ok) {
        throw new Error(`Failed to fetch tournaments: ${response.status}`);
      }

      const data = await response.json();

      const myTournaments = (data.tournaments || []).filter(
        (tournament: Tournament) => tournament.playerIds.includes(lichessId)
      );

      myTournaments.sort(
        (a: Tournament, b: Tournament) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setTournaments(myTournaments);
    } catch (err) {
      console.error(" Error fetching tournaments:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load tournaments"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTournaments();

    const interval = setInterval(fetchMyTournaments, 10000);
    return () => clearInterval(interval);
  }, [lichessId]);

  const getStatusColor = (tournament: Tournament) => {
    switch (tournament.status) {
      case "active":
        return "text-green-400";
      case "completed":
        return "text-blue-400";
      case "expired":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getStatusText = (tournament: Tournament) => {
    switch (tournament.status) {
      case "active":
        if (tournament.bracket.length === 0) {
          return "Waiting for players";
        }
        return "In Progress";
      case "completed":
        return tournament.winner === lichessId ? "Won!" : "Completed";
      case "expired":
        return "Expired";
      default:
        return tournament.status;
    }
  };

  const getTimeRemaining = (tournament: Tournament) => {
    if (tournament.status !== "active") return null;

    const now = new Date();
    let targetTime: Date;
    let label: string;

    if (tournament.bracket.length === 0 && tournament.lobbyExpiredAt) {
      targetTime = new Date(tournament.lobbyExpiredAt);
      label = "Lobby expires in";
    }
    else if (tournament.tournamentExpiredAt) {
      targetTime = new Date(tournament.tournamentExpiredAt);
      label = "Tournament expires in";
    } else {
      return null;
    }

    const timeLeft = targetTime.getTime() - now.getTime();

    if (timeLeft <= 0) return null;

    const minutes = Math.floor(timeLeft / (1000 * 60));
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${label}: ${hours}h ${minutes % 60}m`;
    } else {
      return `${label}: ${minutes}m`;
    }
  };

  const handleViewTournament = (tournamentId: string) => {
    navigate(`/bracket/${tournamentId}`);
  };

  const handleJoinLobby = (tournamentId: string) => {
    navigate(`/lobby/${tournamentId}`);
  };

  const canJoinLobby = (tournament: Tournament) => {
    return (
      tournament.status === "active" &&
      tournament.bracket.length === 0 &&
      tournament.playerIds.length < tournament.maxPlayers
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-chess-dark text-white flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-chess-gold"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-chess-dark text-white">
        <Navbar showItems={false} />
        <div className="container mx-auto px-4 py-20 text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Error Loading Tournaments</h1>
          <p className="text-gray-300 mb-6">{error}</p>
          <Button
            onClick={fetchMyTournaments}
            className="bg-chess-secondary hover:bg-blue-700"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chess-dark text-white">
      {/* Background */}
      <div className="fixed inset-0 w-full h-full z-0">
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-chess-dark/90 via-chess-dark to-chess-dark/90"></div>
        <div className="absolute inset-0 w-full h-full chess-board-bg opacity-15"></div>
      </div>

      <Navbar showItems={false} />

      <div className="container mx-auto px-4 py-20 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">My Tournaments</h1>
          <p className="text-gray-300">
            Track your active and completed tournaments
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-chess-dark/80 border-gray-700">
            <CardContent className="p-6 text-center">
              <Trophy className="h-8 w-8 text-chess-gold mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {tournaments.filter((t) => t.winner === lichessId).length}
              </div>
              <div className="text-gray-400">Tournaments Won</div>
            </CardContent>
          </Card>

          <Card className="bg-chess-dark/80 border-gray-700">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {tournaments.filter((t) => t.status === "active").length}
              </div>
              <div className="text-gray-400">Active Tournaments</div>
            </CardContent>
          </Card>

          <Card className="bg-chess-dark/80 border-gray-700">
            <CardContent className="p-6 text-center">
              <Calendar className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {tournaments.length}
              </div>
              <div className="text-gray-400">Total Participated</div>
            </CardContent>
          </Card>
        </div>

        {/* Tournaments List */}
        {tournaments.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-4">No Tournaments Yet</h2>
            <p className="text-gray-400 mb-6">
              You haven't participated in any tournaments yet. Start by finding
              or creating one!
            </p>
            <div className="flex justify-center gap-4">
              <Button
                onClick={() => navigate("/find-match")}
                className="bg-chess-gold hover:bg-yellow-500 text-black"
              >
                Find Tournament
              </Button>
              <Button
                onClick={() => navigate("/create-tournament")}
                className="bg-chess-secondary hover:bg-blue-700"
              >
                Create Tournament
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6">
            {tournaments.map((tournament) => {
              const timeRemaining = getTimeRemaining(tournament);

              return (
                <Card
                  key={tournament._id}
                  className="bg-chess-dark/80 border-gray-700 hover:border-chess-gold/50 transition-colors"
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">
                          {tournament.tournamentName}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {tournament.playerIds.length}/
                            {tournament.maxPlayers} players
                          </span>
                          {tournament.rankRange && (
                            <span className="flex items-center gap-1">
                              <Award className="h-4 w-4" />
                              {tournament.rankRange.label}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />$
                            {tournament.entryFee} entry
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-sm font-medium ${getStatusColor(
                            tournament
                          )}`}
                        >
                          {getStatusText(tournament)}
                        </div>
                        {timeRemaining && (
                          <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {timeRemaining}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-400">
                        Created:{" "}
                        {new Date(tournament.createdAt).toLocaleDateString()}
                        {tournament.status === "completed" &&
                          tournament.winner === lichessId && (
                            <span className="ml-4 text-chess-gold font-medium">
                              🏆 You won ${tournament.tournamentPrize}!
                            </span>
                          )}
                      </div>

                      <div className="flex gap-2">
                        {canJoinLobby(tournament) && (
                          <Button
                            onClick={() => handleJoinLobby(tournament._id)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Play className="mr-1 h-4 w-4" />
                            Join Lobby
                          </Button>
                        )}

                        <Button
                          onClick={() => handleViewTournament(tournament._id)}
                          size="sm"
                          className="bg-chess-secondary hover:bg-blue-700 text-white"
                        >
                          <Eye className="mr-1 h-4 w-4" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTournaments;
