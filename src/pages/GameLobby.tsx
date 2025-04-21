import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { Loader } from "lucide-react";
import Navbar from "../components/Navbar";

interface Player {
  id: string;
  username: string;
  rating: number;
  avatar?: string;
}

interface Match {
  player1: string;
  player2: string;
  lichessUrl: string;
}

const GameLobby = () => {
  const { id: tournamentId } = useParams();
  const navigate = useNavigate();
  const lichessId = localStorage.getItem("lichessId");
  const userId = localStorage.getItem("user");

  const [players, setPlayers] = useState<Player[]>([]);
  const [maxPlayers, setMaxPlayers] = useState(0);
  const [tournamentName, setTournamentName] = useState("");
  const [isCreator, setIsCreator] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const fetchTournament = async () => {
    try {
      const res = await fetch(
        `http://localhost:3060/api/lichess/tournaments/${tournamentId}`
      );
      const data = await res.json();

      setMaxPlayers(data.maxPlayers);
      setTournamentName(data.tournamentName || "Tournament");

      if (userId && data.createdBy === userId) {
        setIsCreator(true);
      }

      if (data.playerIds.includes(lichessId)) {
        setHasJoined(true);
      }

      // 🔁 Enrich players with ratings
      const enrichedPlayers = await Promise.all(
        data.playerIds.map(async (id: string) => {
          try {
            const res = await fetch(`https://lichess.org/api/user/${id}`);
            const userData = await res.json();
            return {
              id,
              username: userData.username,
              rating: userData.perfs?.blitz?.rating ?? 1500,
              avatar: "/placeholder.svg",
            };
          } catch {
            return {
              id,
              username: id,
              rating: 1500,
              avatar: "/placeholder.svg",
            };
          }
        })
      );

      setPlayers(enrichedPlayers.filter((p): p is Player => p !== null));

      // 🧠 If full and not started, host starts tournament
      const tournamentStarted = data.rounds?.length > 0;
      if (
        data.playerIds.length === data.maxPlayers &&
        !tournamentStarted &&
        isCreator
      ) {
        console.log("🧠 Auto-starting tournament...");
        await fetch(
          `http://localhost:3060/api/lichess/tournaments/${tournamentId}/start`,
          { method: "POST" }
        );
      }

      // ✅ If already started, look for player's match
      const latestRound = data.rounds?.[data.rounds.length - 1];
      const match = latestRound?.matches?.find(
        (m: Match) => m.player1 === lichessId || m.player2 === lichessId
      );

      if (match?.lichessUrl && !isRedirecting) {
        console.log("🚀 Redirecting to ChessBoard:", match.lichessUrl);
        setIsRedirecting(true);
        navigate(`/chessboard?gameUrl=${encodeURIComponent(match.lichessUrl)}`);
      }
    } catch (err) {
      console.error("❌ Error fetching tournament:", err);
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchTournament, 2000);
    return () => clearInterval(interval);
  }, [isCreator, lichessId, userId]);

  const handleJoin = async () => {
    try {
      const res = await fetch(
        `http://localhost:3060/api/lichess/tournaments/${tournamentId}/join`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: lichessId }),
        }
      );
      await res.json();
      setHasJoined(true);
    } catch (err) {
      console.error("❌ Failed to join lobby:", err);
    }
  };

  const currentPlayers = players.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Background gradient with a chess board pattern overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-chess-dark/90 via-chess-dark to-chess-dark/90 z-0"></div>
      <div className="absolute inset-0 chess-board-bg opacity-15 z-0"></div>

      {/* Decorative blurred elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-chess-gold/10 rounded-full filter blur-3xl animate-pulse-soft"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-chess-secondary/10 rounded-full filter blur-3xl animate-pulse-soft"></div>
      <Navbar showItems={false} />
      <div className="container mx-auto px-6 pt-20">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-b from-background to-background/70 z-0">
              <div className="chess-board-bg absolute inset-0 opacity-20"></div>
            </div>
            <Card className="glass-card relative z-10 overflow-hidden">
              <div className="p-8 space-y-6">
                <h1 className="text-4xl font-bold text-center">
                  {tournamentName}
                </h1>
                <div className="flex justify-center items-center gap-2 text-xl text-chess-gold">
                  <span>
                    {currentPlayers}/{maxPlayers || "?"} Players
                  </span>
                  <Loader className="animate-spin h-5 w-5" />
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Share this lobby:{" "}
                  <span className="text-chess-gold font-semibold">
                    http://localhost:5173/lobby/{tournamentId}
                  </span>
                </p>

                {!hasJoined && lichessId && (
                  <div className="text-center mt-4">
                    <button
                      onClick={handleJoin}
                      className="px-6 py-2 rounded bg-chess-gold text-black hover:bg-yellow-500 font-semibold"
                    >
                      Join Lobby
                    </button>
                  </div>
                )}

                <h2 className="text-xl font-semibold mt-6">Participants</h2>
                <div className="grid gap-4">
                  {players.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center gap-4 bg-white/5 p-4 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <Avatar className="h-12 w-12 border-2 border-chess-gold">
                        {player.avatar ? (
                          <AvatarImage
                            src={player.avatar}
                            alt={player.username}
                          />
                        ) : (
                          <AvatarFallback className="bg-chess-gold/20">
                            {(player.username?.[0] ?? "?").toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-medium">{player.username}</h3>
                        <p className="text-sm text-chess-gold">
                          Rating: {player.rating}
                        </p>
                      </div>
                    </div>
                  ))}

                  {Array.from({ length: maxPlayers - currentPlayers }).map(
                    (_, i) => (
                      <div
                        key={`empty-${i}`}
                        className="flex items-center gap-4 bg-white/5 p-4 rounded-lg"
                      >
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameLobby;
