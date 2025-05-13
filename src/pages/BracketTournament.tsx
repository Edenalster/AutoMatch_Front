import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Button } from "../components/ui/button";
import { Trophy, User, Clock, AlertCircle, Award, ArrowRightCircle } from "lucide-react";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

interface Match {
  player1: string;
  player2: string;
  winner?: string;
  result: "pending" | "in_progress" | "completed" | "finished" | "mate" | "resign" | "timeout" | "cheat" | "draw" | "error" | "bye" | string;
  lichessUrl?: string;
  whiteUrl?: string;
  blackUrl?: string;
}

interface BracketStage {
  name: string;
  matches: Match[];
  startTime?: string;
  endTime?: string;
}

interface Tournament {
  _id: string;
  tournamentName: string;
  playerIds: string[];
  maxPlayers: number;
  rated: boolean;
  bracket: BracketStage[];
  currentStage: number;
  advancingPlayers: string[];
  winner: string | null;
  status: "active" | "completed";
}

export default function BracketTournament() {
  const { id: tournamentId } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [playerMap, setPlayerMap] = useState<{ [id: string]: { username: string, rating: number } }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lichessId = localStorage.getItem("lichessId");
  const [isCreator, setIsCreator] = useState(false);

  useEffect(() => {
    document.title = "Tournament Bracket - AutoMatch";
  }, []);

  useEffect(() => {
    const fetchTournament = async () => {
      if (!tournamentId) {
        setError("Tournament ID is missing");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${backendUrl}/api/lichess/tournaments/${tournamentId}`);
        if (!res.ok) {
          throw new Error(`Server returned ${res.status}: ${res.statusText}`);
        }
        
        const data = await res.json();
        console.log("📦 Tournament data:", data);
        
        setTournament(data);
        
        // בדיקה אם המשתמש הוא יוצר הטורניר
        const userId = localStorage.getItem("userId");
        setIsCreator(userId === data.createdBy);

        // איסוף מידע על כל השחקנים
        const newPlayerMap: { [id: string]: { username: string, rating: number } } = {};

        if (Array.isArray(data.playerIds)) {
          await Promise.all(data.playerIds.map(async (id: string) => {
            try {
              const res = await fetch(`https://lichess.org/api/user/${id}`);
              const user = await res.json();
              newPlayerMap[id] = { 
                username: user.username || id,
                rating: user.perfs?.blitz?.rating || 1500
              };
            } catch {
              newPlayerMap[id] = { 
                username: id,
                rating: 1500
              };
            }
          }));
        }

        setPlayerMap(newPlayerMap);

        // ניסיון לקדם את הטורניר אם כל המשחקים בסיבוב הנוכחי הסתיימו
        if (data.status === "active") {
          try {
            await fetch(`${backendUrl}/api/lichess/tournaments/${tournamentId}/advance`, {
              method: "POST",
            });
          } catch (advanceError) {
            console.warn("Non-critical: Failed to advance tournament:", advanceError);
          }
        }
      } catch (err) {
        console.error("❌ Failed to fetch bracket data:", err);
        setError(err instanceof Error ? err.message : "Failed to load tournament data");
      } finally {
        setLoading(false);
      }
    };

    fetchTournament();
    
    // פולינג לעדכון כל 15 שניות
    const interval = setInterval(fetchTournament, 15000);
    return () => clearInterval(interval);
  }, [tournamentId]);

  const goToGame = (match: Match) => {
    // בדיקה למשתמש אם הוא שחקן 1 או 2 ולקחת את ה-URL המתאים
    const isPlayer1 = match.player1 === lichessId;
    const isPlayer2 = match.player2 === lichessId;
    
    let gameUrl = match.lichessUrl;
    
    if (isPlayer1 && match.whiteUrl) {
      gameUrl = match.whiteUrl;
    } else if (isPlayer2 && match.blackUrl) {
      gameUrl = match.blackUrl;
    }
    
    if (gameUrl) {
      navigate(`/chessboard?gameUrl=${encodeURIComponent(gameUrl)}`);
    }
  };

  const forceAdvanceTournament = async () => {
    if (!isCreator || !tournamentId) return;
    
    try {
      setLoading(true);
      await fetch(`${backendUrl}/api/lichess/tournaments/${tournamentId}/advance`, {
        method: "POST",
      });
      
      // רענון הדף אחרי קידום
      window.location.reload();
    } catch (err) {
      console.error("Failed to advance tournament:", err);
      setError("Failed to advance tournament to next round");
    } finally {
      setLoading(false);
    }
  };

  const getMatchStatus = (match: Match) => {
    if (match.result === "error") return "❌ Error";
    if (match.result === "pending") return "🟡 Pending";
    if (match.result === "in_progress") return "🟠 In Progress";
    if (match.result === "bye") return "✔️ Bye (auto advance)";
    if (match.winner) {
      const winnerName = playerMap[match.winner]?.username || match.winner;
      return `✅ Winner: ${winnerName}`;
    }
    if (match.result === "draw") return "🔵 Draw";
    return `❓ ${match.result}`;
  };

  const getStatusColor = (match: Match) => {
    if (match.result === "error") return "text-red-500";
    if (match.result === "pending") return "text-yellow-400";
    if (match.result === "in_progress") return "text-orange-400";
    if (match.winner) return "text-green-500";
    if (match.result === "draw") return "text-blue-400";
    return "text-gray-400";
  };

// בדיקה אם המשתמש יכול לשחק במשחק מסוים
const canUserPlay = (match: Match) => {
  if (!lichessId) return false;
  if (match.result !== "pending") return false;
  if (match.lichessUrl === "#" || match.result.toLowerCase() === "error") return false;
  return match.player1 === lichessId || match.player2 === lichessId;
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
      <div className="min-h-screen bg-chess-dark text-white p-6 flex flex-col items-center justify-center">
        <Navbar showItems={true} />
        <div className="max-w-md mx-auto text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Error Loading Tournament</h1>
          <p className="mb-6 text-gray-300">{error}</p>
          <Button
            onClick={() => navigate("/")}
            className="bg-chess-gold text-black hover:bg-yellow-500"
          >
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-chess-dark text-white p-6 flex flex-col items-center justify-center">
        <Navbar showItems={true} />
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Tournament Not Found</h1>
          <p className="mb-6 text-gray-300">The tournament you requested could not be found.</p>
          <Button
            onClick={() => navigate("/")}
            className="bg-chess-gold text-black hover:bg-yellow-500"
          >
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chess-dark text-white">
      {/* Background with chess pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-chess-dark/90 via-chess-dark to-chess-dark/90 z-0"></div>
      <div className="absolute inset-0 chess-board-bg opacity-15 z-0"></div>
      
      <Navbar showItems={true} />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white">{tournament.tournamentName}</h1>
          <p className="text-muted-foreground text-gray-300 mt-2">
            {tournament.status === "completed" 
              ? "Tournament Completed" 
              : `Round ${tournament.currentStage + 1} of ${Math.ceil(Math.log2(tournament.maxPlayers))}`
            }
          </p>
          
          {tournament.status === "completed" && tournament.winner && (
            <div className="mt-6 inline-block bg-chess-gold/20 rounded-lg p-4">
              <Trophy className="h-10 w-10 text-chess-gold mx-auto mb-2" />
              <p className="text-xl font-semibold">Tournament Winner</p>
              <p className="text-2xl font-bold text-chess-gold">
                {playerMap[tournament.winner]?.username || tournament.winner}
              </p>
            </div>
          )}
          
          {isCreator && tournament.status === "active" && (
            <div className="mt-4">
              <Button 
                onClick={forceAdvanceTournament}
                className="bg-chess-secondary hover:bg-blue-700 text-white"
              >
                <ArrowRightCircle className="mr-2 h-4 w-4" />
                Force Advance to Next Round
              </Button>
            </div>
          )}
        </div>
        
        <div className="overflow-x-auto pb-8">
          <div className="bracket-container min-w-max flex justify-start space-x-8 p-4">
            {tournament.bracket.map((round, roundIdx) => (
              <div key={roundIdx} className="bracket-round w-72">
                <div className="text-center mb-4 py-2 bg-chess-secondary/30 rounded-t-lg text-white font-semibold text-lg">
                  {round.name}
                </div>
                
                <div className="space-y-6">
                  {round.matches.map((match, matchIdx) => {
                    const player1 = playerMap[match.player1]?.username || match.player1 || "Bye";
                    const player2 = playerMap[match.player2]?.username || match.player2 || "Bye";
                    const player1Rating = playerMap[match.player1]?.rating;
                    const player2Rating = playerMap[match.player2]?.rating;
                    
                    return (
                      <div
                        key={matchIdx}
                        className={`match-card bg-chess-dark/80 border rounded-lg overflow-hidden transition-all ${
                          match.winner ? "border-chess-gold" : "border-gray-700"
                        } ${match.result === "error" ? "border-red-500" : ""}`}
                      >
                        <div className="p-3 border-b border-gray-700 flex justify-between items-center">
                          <div className="text-sm text-gray-400">Match {matchIdx + 1}</div>
                          <div className={`text-xs rounded-full px-2 py-1 ${getStatusColor(match)} bg-gray-800/50`}>
                            {match.result === "pending" ? "Waiting" : 
                             match.result === "in_progress" ? "Playing" : 
                             match.result === "error" ? "Error" : "Completed"}
                          </div>
                        </div>
                        
                        <div className="p-4">
                          {/* Player 1 */}
                          <div className={`p-2 rounded ${
                            match.winner === match.player1 ? "bg-chess-gold/10" : ""
                          }`}>
                            <div className="flex items-center">
                              {match.winner === match.player1 && (
                                <Award className="mr-2 h-4 w-4 text-chess-gold" />
                              )}
                              <span className={`font-semibold ${
                                match.winner === match.player1 ? "text-chess-gold" : "text-white"
                              }`}>{player1}</span>
                              {player1Rating && (
                                <span className="ml-2 text-xs text-gray-400">
                                  ({player1Rating})
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* VS divider */}
                          <div className="flex justify-center items-center my-2">
                            <div className="h-px bg-gray-700 w-full"></div>
                            <div className="px-3 text-gray-500">VS</div>
                            <div className="h-px bg-gray-700 w-full"></div>
                          </div>
                          
                          {/* Player 2 */}
                          <div className={`p-2 rounded ${
                            match.winner === match.player2 ? "bg-chess-gold/10" : ""
                          }`}>
                            <div className="flex items-center">
                              {match.winner === match.player2 && (
                                <Award className="mr-2 h-4 w-4 text-chess-gold" />
                              )}
                              <span className={`font-semibold ${
                                match.winner === match.player2 ? "text-chess-gold" : "text-white"
                              }`}>{player2}</span>
                              {player2Rating && (
                                <span className="ml-2 text-xs text-gray-400">
                                  ({player2Rating})
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* מצב המשחק */}
                          <div className="mt-3 text-sm text-center">
                            <span className={getStatusColor(match)}>
                              {getMatchStatus(match)}
                            </span>
                          </div>
                          
                          {/* כפתורים */}
                          <div className="mt-4 space-y-2">
                            {canUserPlay(match) && (
                              <Button
                                onClick={() => goToGame(match)}
                                className="w-full bg-chess-gold hover:bg-yellow-500 text-black"
                              >
                                Play Now
                              </Button>
                            )}
                            
                            {match.lichessUrl && match.lichessUrl !== "#" && (
                              <Button
                                onClick={() => window.open(match.lichessUrl, "_blank")}
                                className="w-full bg-gray-700 hover:bg-gray-600 text-white"
                                variant="outline"
                              >
                                View on Lichess
                              </Button>
                            )}
                            
                            {match.result === "error" && isCreator && (
                              <div className="mt-2 text-xs text-red-400 text-center">
                                Error creating game. Admin can manually update the result.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* אם אין משחקים בסיבוב */}
                  {round.matches.length === 0 && (
                    <div className="text-center p-6 border border-dashed border-gray-700 rounded-lg">
                      <p className="text-gray-400">No matches in this round</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* אם הטורניר פעיל אבל עדיין אין סיבובים */}
            {tournament.status === "active" && tournament.bracket.length === 0 && (
              <div className="w-72">
                <div className="text-center mb-4 py-2 bg-chess-secondary/30 rounded-t-lg text-white font-semibold text-lg">
                  Round 1
                </div>
                <div className="text-center p-6 border border-dashed border-gray-700 rounded-lg">
                  <p className="text-gray-400">Tournament not started yet</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Waiting for players to join ({tournament.playerIds.length}/{tournament.maxPlayers})
                  </p>
                </div>
              </div>
            )}
            
            {/* הצגת הסיבוב הבא אם הטורניר עדיין פעיל */}
            {tournament.status === "active" && tournament.bracket.length > 0 && 
             tournament.bracket.length < Math.ceil(Math.log2(tournament.maxPlayers)) && (
              <div className="w-72">
                <div className="text-center mb-4 py-2 bg-gray-800/50 rounded-t-lg text-gray-400 font-semibold text-lg">
                  {tournament.bracket.length === 1 ? "Quarterfinals" : 
                   tournament.bracket.length === 2 ? "Semifinals" : 
                   tournament.bracket.length === 3 ? "Final" : 
                   `Round ${tournament.bracket.length + 1}`}
                </div>
                <div className="text-center p-10 border border-dashed border-gray-700 rounded-lg">
                  <p className="text-gray-400">Coming soon</p>
                  <Clock className="h-8 w-8 mx-auto mt-2 text-gray-500" />
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* רשימת השחקנים */}
        <div className="max-w-4xl mx-auto mt-10 p-6 bg-chess-dark/50 rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <User className="mr-2 text-chess-gold" />
            Tournament Players ({tournament.playerIds.length})
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {tournament.playerIds.map((playerId) => (
              <div
                key={playerId}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  tournament.winner === playerId 
                    ? "bg-chess-gold/20 border border-chess-gold/50" 
                    : "bg-gray-800/50 border border-gray-700"
                }`}
              >
                <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                  {playerMap[playerId]?.username.charAt(0).toUpperCase() || "?"}
                </div>
                <div>
                  <div className="font-medium">
                    {playerMap[playerId]?.username || playerId}
                    {tournament.winner === playerId && (
                      <Trophy className="h-4 w-4 text-chess-gold inline-block ml-2" />
                    )}
                  </div>
                  {playerMap[playerId]?.rating && (
                    <div className="text-sm text-gray-400">
                      Rating: {playerMap[playerId].rating}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
