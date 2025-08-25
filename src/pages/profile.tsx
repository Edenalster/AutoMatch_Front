import { Button } from "../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  DollarSign,
  Trophy,
  UserRound,
  Users,
  UserMinus,
  MessageCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import type { JSX } from "react";
import ChessLoader from "../components/Loader";
import { FaRobot } from "react-icons/fa";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const ProfilePage = () => {
  interface User {
    name: string;
    username: string;
    email: string;
    profileImage: JSX.Element;
    ratings: {
      classic: { rating: number; games: number };
      blitz: { rating: number; games: number };
      rapid: { rating: number; games: number };
      bullet: { rating: number; games: number };
    };
    balance: number;
    recentMatches: { type: string; position: string; amount: number }[];
    tournamentResults: {
      date: string;
      tournament: string;
      type: string;
      result: number;
      position: string;
      entryFee: number;
      prizePool: number;
    }[];
  }

  interface Friend {
    _id: string;
    lichessId?: string;
    email?: string;
  }

  const [user, setUser] = useState<User | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const lichessId = localStorage.getItem("lichessId");
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const getAuthToken = () => {
    return localStorage.getItem("token") || localStorage.getItem("accessToken");
  };

  const fetchAnalysis = async () => {
    if (!lichessId) return;
    setAnalyzing(true);
    setAnalysis(null);
    try {
      const res = await fetch(
        `https://automatch.cs.colman.ac.il/api/lichess/analyze/${lichessId}`
      );
      const data = await res.json();
      setAnalysis(data.analysis);
    } catch (error) {
      console.error("Failed to fetch analysis:", error);
      setAnalysis("Failed to analyze your games.");
    } finally {
      setAnalyzing(false);
    }
  };

  const fetchFriends = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${backendUrl}/auth/friends/list`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFriends(data.friends || []);
      } else {
        console.error("Failed to fetch friends");
        setFriends([]);
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
      setFriends([]);
    } finally {
      setLoadingFriends(false);
    }
  };

  const removeFriend = async (friendId: string) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${backendUrl}/auth/friends/remove`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ friendId }),
      });

      if (response.ok) {
        setFriends((prev) => prev.filter((friend) => friend._id !== friendId));
      } else {
        console.error("Failed to remove friend");
      }
    } catch (error) {
      console.error("Error removing friend:", error);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!lichessId) return;
      try {
        const res = await fetch(`https://lichess.org/api/user/${lichessId}`);
        const data = await res.json();

        const gamesRes = await fetch(
          `https://lichess.org/api/games/user/${lichessId}?max=5`,
          {
            headers: { Accept: "application/x-ndjson" },
          }
        );

        const gamesText = await gamesRes.text();
        const games = gamesText
          .trim()
          .split("\n")
          .filter((line) => line.trim().length > 0)
          .map((line) => JSON.parse(line));

        let balance = 0;
        try {
          const balanceRes = await fetch(
            `${backendUrl}/auth/users/${lichessId}/balance`
          );
          const balanceData = await balanceRes.json();
          balance = balanceData.balance ?? 0;
        } catch (e) {
          console.warn("Failed to fetch user balance:", e);
        }

        interface Game {
          perf: string;
          winner: string | null;
          players: {
            white: { user?: { id: string }; rating: number };
            black: { user?: { id: string }; rating: number };
          };
          createdAt: number;
          id: string;
        }

        const recentMatches = await Promise.all(
          games.map(async (game: Game) => {
            const userIsWhite =
              game.players.white.user?.id?.toLowerCase() ===
              data.username.toLowerCase();
            const userIsBlack =
              game.players.black.user?.id?.toLowerCase() ===
              data.username.toLowerCase();
            const userDraw = !game.winner;
            const userWon =
              (userIsWhite && game.winner === "white") ||
              (userIsBlack && game.winner === "black");

            let entryFee = 10;
            let amount = userDraw ? 0 : userWon ? 2 * entryFee : -entryFee;

            try {
              const earningsRes = await fetch(
                `${backendUrl}/tournaments/earnings/${data.username}/${game.id}`
              );
              const earningsJson = await earningsRes.json();
              if (typeof earningsJson.amount === "number") {
                amount = earningsJson.amount;
              }
            } catch {
              console.warn(" Could not fetch earnings for", game.id);
            }

            return {
              type: `${game.perf.toUpperCase()} Game`,
              position: userDraw ? "Draw" : userWon ? "Won" : "Lost",
              amount,
            };
          })
        );

        const tournamentMap: Record<
          string,
          {
            position: string;
            date: string;
            type: string;
            entryFee: number;
            prizePool: number;
          }
        > = {};

        for (const game of games) {
          const userIsWhite =
            game.players.white.user?.id?.toLowerCase() ===
            data.username.toLowerCase();
          const userIsBlack =
            game.players.black.user?.id?.toLowerCase() ===
            data.username.toLowerCase();
          const userDraw = !game.winner;
          const userWon =
            (userIsWhite && game.winner === "white") ||
            (userIsBlack && game.winner === "black");

          const date = new Date(game.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });

          const position: "Draw" | "Lost" | "Won" = userDraw
            ? "Draw"
            : userWon
            ? "Won"
            : "Lost";

          let tournamentName = "Online Game";
          let entryFee = 0;
          let prizePool = 0;

          try {
            const res = await fetch(
              `${backendUrl}/api/lichess/tournaments/by-lichess-url/${game.id}`
            );
            const json = await res.json();

            if (json?.tournamentName) tournamentName = json.tournamentName;
            if (typeof json.entryFee === "number") entryFee = json.entryFee;
            const numberOfPlayers = json.playerCount ?? 2;

            if (position === "Won") {
              prizePool = entryFee * numberOfPlayers;
            } else if (position === "Draw") {
              prizePool = (entryFee * numberOfPlayers) / 2;
            } else {
              prizePool = 0;
            }
          } catch {
            console.warn("Could not fetch tournament info for", game.id);
          }

          if (tournamentName !== "Online Game") {
            if (!tournamentMap[tournamentName]) {
              tournamentMap[tournamentName] = {
                position,
                date,
                type: game.perf.charAt(0).toUpperCase() + game.perf.slice(1),
                entryFee,
                prizePool,
              };
            }
          }
        }

        const tournamentResults = Object.entries(tournamentMap).map(
          ([tournament, { position, date, type, entryFee, prizePool }]) => {
            let result;
            if (position === "Won") {
              result = prizePool;
            } else if (position === "Lost") {
              result = entryFee === 0 ? 0 : -entryFee;
            } else {
              result = prizePool / 2;
            }

            return {
              tournament,
              date,
              type,
              result,
              position,
              entryFee,
              prizePool,
            };
          }
        );

        setUser({
          name: data.username,
          username: data.username,
          email: `${data.username}@lichess.org`,
          profileImage: <UserRound />,
          ratings: {
            classic: {
              rating: data.perfs.classical?.rating ?? "Unkown",
              games: data.perfs.classical?.games ?? 0,
            },
            blitz: {
              rating: data.perfs.blitz?.rating ?? "Unkown",
              games: data.perfs.blitz?.games ?? 0,
            },
            rapid: {
              rating: data.perfs.rapid?.rating ?? "Unkown",
              games: data.perfs.rapid?.games ?? 0,
            },
            bullet: {
              rating: data.perfs.bullet?.rating ?? "Unkown",
              games: data.perfs.bullet?.games ?? 0,
            },
          },
          balance,
          recentMatches,
          tournamentResults,
        });
      } catch (error) {
        console.error("Failed to fetch Lichess data:", error);
      }
    };

    fetchUserData();
    fetchFriends();
  }, [lichessId]);
  
  if (!user)
    return (
      <div className="mt-80">
        <ChessLoader />
      </div>
    );

  return (
    <div className="min-h-screen bg-chess-dark">
      {/* Background wrapper */}
      <div className="fixed inset-0 w-full h-full z-0">
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-chess-dark/90 via-chess-dark to-chess-dark/90"></div>
        <div className="absolute inset-0 w-full h-full chess-board-bg opacity-15"></div>
      </div>

      {/* Decorative blurred elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-chess-gold/10 rounded-full filter blur-3xl animate-pulse-soft"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-chess-secondary/10 rounded-full filter blur-3xl animate-pulse-soft"></div>

      {/* Header */}
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

      <div className="pt-10 pb-16 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - User Profile */}
          <div className="lg:col-span-1 space-y-8">
            {/* Profile Card */}
            <div className="bg-chess-dark/60 backdrop-blur-lg rounded-lg border border-white/10 p-6 shadow-lg">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-4 border-chess-gold object-cover flex items-center justify-center bg-gray-800">
                    {user.profileImage}
                  </div>
                </div>
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                  <p className="text-white/60">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Username Card */}
            <div className="bg-chess-dark/60 backdrop-blur-lg rounded-lg border border-white/10 p-6 shadow-lg">
              <h2 className="text-xl font-bold text-chess-gold mb-4">
                {user.username}
              </h2>

              {/* Ratings */}
              <div className="space-y-3">
                <div className="text-white">
                  <p>
                    Classic {user.ratings.classic.rating} Games{" "}
                    {user.ratings.classic.games}
                  </p>
                </div>
                <div className="text-white">
                  <p>
                    Blitz {user.ratings.blitz.rating} Games{" "}
                    {user.ratings.blitz.games}
                  </p>
                </div>
                <div className="text-white">
                  <p>
                    Rapid {user.ratings.rapid.rating} Games{" "}
                    {user.ratings.rapid.games}
                  </p>
                </div>
                <div className="text-white">
                  <p>
                    Bullet {user.ratings.bullet.rating} Games{" "}
                    {user.ratings.bullet.games}
                  </p>
                </div>
              </div>
            </div>

            {/* Friends List Card */}
            <div className="bg-chess-dark/60 backdrop-blur-lg rounded-lg border border-white/10 p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-chess-gold" />
                  Friends ({friends.length})
                </h2>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2">
                {loadingFriends ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-chess-gold"></div>
                  </div>
                ) : friends.length > 0 ? (
                  friends.map((friend) => (
                    <div
                      key={friend._id}
                      className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-chess-dark/40 hover:bg-chess-dark/60 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full border-2 border-chess-gold/50 flex items-center justify-center bg-gray-700">
                          <UserRound className="h-4 w-4 text-chess-gold" />
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">
                            {friend.lichessId || friend.email || "Unknown User"}
                          </p>
                          {friend.lichessId && friend.email && (
                            <p className="text-white/60 text-xs">
                              {friend.email}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-chess-gold hover:text-white hover:bg-chess-gold/20 p-2"
                          title="Send Message"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => removeFriend(friend._id)}
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:text-white hover:bg-red-500/20 p-2"
                          title="Remove Friend"
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-white/60">
                    <Users className="h-12 w-12 mx-auto mb-2 text-white/30" />
                    <p className="text-sm">No friends yet</p>
                    <p className="text-xs mt-1">Add friends to see them here</p>
                  </div>
                )}
              </div>
            </div>

            {/* Analysis Card */}
            <div className="bg-chess-dark/60 backdrop-blur-lg rounded-lg border border-white/10 p-6 shadow-lg">
              <h2 className="text-xl font-bold text-white mb-4">
                Games Analysis
              </h2>

              <Button
                onClick={fetchAnalysis}
                disabled={analyzing}
                className="w-full mb-4 bg-chess-gold hover:bg-yellow-500 text-black font-medium flex items-center justify-center gap-2"
              >
                <FaRobot className="h-4 w-4" />
                {analyzing ? "Analyzing..." : "Analyze My Games"}
              </Button>

              {analyzing && (
                <div className="flex justify-center my-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-chess-gold"></div>
                </div>
              )}

              {analysis && (
                <div className="mt-4 p-4 bg-chess-dark/80 rounded-lg border border-chess-gold/30">
                  <p className="text-white text-sm leading-relaxed">
                    {analysis}
                  </p>
                </div>
              )}
            </div>

            {/* Balance Card */}
            <div className="bg-chess-dark/60 backdrop-blur-lg rounded-lg border border-white/10 p-6 shadow-lg">
              <h2 className="text-xl font-bold text-white mb-4">
                Current Balance
              </h2>
              <div className="flex justify-between items-center">
                <span className="text-3xl font-bold text-chess-gold">
                  ${user.balance}
                </span>

                <Link to="/add-funds">
                  <Button className="primary-btn flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Add
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column - Match History */}
          <div className="lg:col-span-2">
            <div className="bg-chess-dark/60 backdrop-blur-lg rounded-lg border border-white/10 p-6 shadow-lg h-full">
              {/* Tournament Results Table */}
              <h3 className="text-xl font-bold text-white mb-6">
                Tournament Results
              </h3>
              <div className="space-y-4 mb-8">
                {user.tournamentResults.map((match, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-4 rounded-lg border border-white/10 bg-chess-dark/40"
                  >
                    <div>
                      <p className="text-white text-lg font-medium">
                        {match.tournament}
                      </p>
                      <p className="text-white/70">
                        {match.date} • {match.type} •
                        <span className="ml-1 font-medium">
                          {match.position}
                          {match.position !== "Lost" && (
                            <span className="text-xs ml-1">
                              (Prize pool: ${match.prizePool})
                            </span>
                          )}
                        </span>
                      </p>
                    </div>
                    <span
                      className={`text-xl font-bold ${
                        match.position === "Won"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {match.result > 0 ? "+" : ""}${match.result}
                    </span>
                  </div>
                ))}
              </div>

              <h3 className="text-xl font-bold text-white mb-4">
                Match History
              </h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Position</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {user.recentMatches.map((match, index) => (
                    <TableRow key={index}>
                      <TableCell>{match.type}</TableCell>
                      <TableCell>{match.position}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
