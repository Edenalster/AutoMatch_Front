import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { Card } from "../components/ui/card";
import Navbar from "../components/Navbar";
import { Skeleton } from "../components/ui/skeleton";
import { Loader } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

interface Player {
  id: string;
  username: string;
  rating: number;
  avatar?: string;
}

const GameLobby = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [tournamentName, setTournamentName] = useState("");
  const { id: tournamentId } = useParams();
  const navigate = useNavigate();
  const [maxPlayers, setMaxPlayers] = useState(0);
  const [hasJoined, setHasJoined] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const lichessId = localStorage.getItem("lichessId");
  const currentPlayers = players.length;

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const res = await fetch(
          `http://localhost:3060/api/lichess/tournaments/${tournamentId}`
        );
        const data = await res.json();
        console.log("Fetched tournament data:", data.maxPlayers);
        setMaxPlayers(data.maxPlayers);
        const enrichedPlayers = await Promise.all(
          data.playerIds.map(async (player: { id: string } | string) => {
            const id = typeof player === "string" ? player : player.id;
            if (!id || typeof id !== "string") return null;

            try {
              const userRes = await fetch(
                `https://lichess.org/api/user/${encodeURIComponent(id)}`
              );
              const userData = await userRes.json();
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
        const filteredPlayers = enrichedPlayers.filter(
          (p): p is Player => p !== null
        );
        setPlayers(filteredPlayers);
        if (
          lichessId &&
          filteredPlayers.find((p) => p.username === lichessId)
        ) {
          setHasJoined(true);
        }
        setTournamentName(data.tournamentName || "Tournament");
        const currentUser = localStorage.getItem("user");
        if (currentUser && data.createdBy && data.createdBy === currentUser) {
          setIsCreator(true);
        }
      } catch (error) {
        console.error("Failed to fetch tournament:", error);
      }
    };

    fetchTournament();
  }, [tournamentId]);

  useEffect(() => {
    if (players.length === maxPlayers) {
      fetch(
        `http://localhost:3060/api/lichess/tournaments/${tournamentId}/start`,
        {
          method: "POST",
        }
      )
        .then((res) => res.json())
        .then((data) => {
          // Redirect players to game URL
          const match = data.matches.find(
            (m: { player1: string; player2: string; lichessUrl: string }) =>
              m.player1 === lichessId || m.player2 === lichessId
          );
          if (match) {
            window.location.href = `/chessboard?url=${encodeURIComponent(
              match.lichessUrl
            )}`;
          }
        });
    }
  }, [players, maxPlayers]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar showItems={false} />

      <div className="container mx-auto px-6 pt-20">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Background with chess pattern */}
            <div className="absolute inset-0 bg-gradient-to-b from-background to-background/70 z-0">
              <div className="chess-board-bg absolute inset-0 opacity-20"></div>
            </div>

            <Card className="glass-card relative z-10 overflow-hidden">
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold text-center">
                    {tournamentName || "Tournament"}
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
                        onClick={async () => {
                          try {
                            const res = await fetch(
                              `http://localhost:3060/api/lichess/tournaments/${tournamentId}/join`,
                              {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                },
                                body: JSON.stringify({ username: lichessId }),
                              }
                            );
                            const data = await res.json();
                            console.log("Joined lobby:", data);
                            setHasJoined(true);
                            // Optionally re-fetch tournament data
                            window.location.reload();
                          } catch (err) {
                            console.error("Failed to join lobby", err);
                          }
                        }}
                        className="px-6 py-2 rounded bg-chess-gold text-black hover:bg-yellow-500 font-semibold"
                      >
                        Join Lobby
                      </button>
                    </div>
                  )}
                  <p className="text-center text-muted-foreground">
                    Tournament will start when lobby is full
                  </p>
                  {isCreator && currentPlayers === maxPlayers && (
                    <div className="text-center mt-4">
                      <button
                        className="bg-chess-gold text-black px-6 py-2 rounded font-semibold hover:bg-yellow-500"
                        onClick={() => {
                          navigate("/chess-board");
                        }}
                      >
                        Start Tournament
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Participants</h2>
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

                    {/* Empty slots */}
                    {Array.from({ length: maxPlayers - currentPlayers }).map(
                      (_, index) => (
                        <div
                          key={`empty-${index}`}
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
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameLobby;
