import { Button } from "../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { DollarSign, Trophy, UserRound } from "lucide-react";
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
    }[];
  }

  const [user, setUser] = useState<User | null>(null);
  const lichessId = localStorage.getItem("lichessId");
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

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
          .filter((line) => line.trim().length > 0) // ✅ ignore blank lines
          .map((line) => JSON.parse(line));

          
          let balance = 0;
          try {
            const balanceRes = await fetch(`${backendUrl}/auth/users/${lichessId}/balance`);
            const balanceData = await balanceRes.json();
            balance = balanceData.balance ?? 0;
          } catch (e) {
            console.warn("⚠️ Failed to fetch user balance:", e);
          }
          
        interface Game {
          perf: string;
          winner: string | null;
          players: {
            white: { user?: { id: string }; rating: number };
            black: { user?: { id: string }; rating: number };
          };
          createdAt: number;
          id: string; // ← This is the Lichess game ID
        }

      const recentMatches = await Promise.all(
  games.map(async (game: Game) => {
    const userIsWhite =
      game.players.white.user?.id?.toLowerCase() === data.username.toLowerCase();
    const userIsBlack =
      game.players.black.user?.id?.toLowerCase() === data.username.toLowerCase();
    const userDraw = !game.winner;
    const userWon =
      (userIsWhite && game.winner === "white") ||
      (userIsBlack && game.winner === "black");

    let entryFee = 10; // default fallback
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
      console.warn("❌ Could not fetch earnings for", game.id);
    }

    return {
      type: `${game.perf.toUpperCase()} Game`,
      position: userDraw ? "Draw" : userWon ? "1st" : "Lost",
      amount,
    };
  })
);

        const tournamentResults = await Promise.all(
          games.map(async (game: Game) => {
            const userIsWhite =
              game.players.white.user?.id?.toLowerCase() === data.username.toLowerCase();
            const userIsBlack =
              game.players.black.user?.id?.toLowerCase() === data.username.toLowerCase();
            const userDraw = !game.winner;
            const userWon =
              (userIsWhite && game.winner === "white") ||
              (userIsBlack && game.winner === "black");
        
            const date = new Date(game.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
        
            let tournamentName = "Online Game";
            let entryFee = 10; // fallback default
        
            try {
              const res = await fetch(`${backendUrl}/api/lichess/tournaments/by-lichess-url/${game.id}`);
              const json = await res.json();
              if (json?.tournamentName) tournamentName = json.tournamentName;
              if (typeof json.entryFee === "number") entryFee = json.entryFee;
            } catch {
              console.warn("❌ Could not fetch tournament info for", game.id);
            }
        
            let result = 0;
        
            try {
              const earningsRes = await fetch(
                `${backendUrl}/tournaments/earnings/${data.username}/${game.id}`
              );
              const earningsJson = await earningsRes.json();
        
              if (typeof earningsJson.amount === "number") {
                result = earningsJson.amount;
              } else {
                result = userDraw ? 0 : userWon ? 2 * entryFee : -entryFee;
              }
            } catch (e) {
              console.warn("❌ Could not fetch earnings for", game.id);
              result = userDraw ? 0 : userWon ? 2 * entryFee : -entryFee;
            }
        
            return {
              date,
              tournament: tournamentName,
              type: game.perf.charAt(0).toUpperCase() + game.perf.slice(1),
              result,
            };
          })
        );
        setUser({
          name: data.username,
          username: data.username,
          email: `${data.username}@lichess.org`,
          profileImage: <UserRound />,
          ratings: {
            classic: {
              rating: data.perfs.classical?.rating ?? 1500,
              games: data.perfs.classical?.games ?? 0,
            },
            blitz: {
              rating: data.perfs.blitz?.rating ?? 1500,
              games: data.perfs.blitz?.games ?? 0,
            },
            rapid: {
              rating: data.perfs.rapid?.rating ?? 1500,
              games: data.perfs.rapid?.games ?? 0,
            },
            bullet: {
              rating: data.perfs.bullet?.rating ?? 1500,
              games: data.perfs.bullet?.games ?? 0,
            },
          },
          balance, // ✅ שימוש בערך האמיתי מה-DB
          recentMatches,
          tournamentResults,
        });
        
      } catch (error) {
        console.error("Failed to fetch Lichess data:", error);
      }
    };

    fetchUserData();
  }, [lichessId]);

  if (!user)
    return (
      <div className="mt-80">
        <ChessLoader />
      </div>
    );

  return (
    <div className="min-h-screen bg-chess-dark">
         {/* Background wrapper - this needs to be fixed position to cover the entire screen */}
         <div className="fixed inset-0 w-full h-full z-0">
        {/* Gradient background */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-chess-dark/90 via-chess-dark to-chess-dark/90"></div>
        {/* Chess board pattern overlay */}
        <div className="absolute inset-0 w-full h-full chess-board-bg opacity-15"></div>
      </div>

      {/* Decorative blurred elements for dynamic visuals */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-chess-gold/10 rounded-full filter blur-3xl animate-pulse-soft"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-chess-secondary/10 rounded-full filter blur-3xl animate-pulse-soft"></div>
      {/* Header with logo */}
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

            {/* Analysis Card - New Feature */}
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
                  <p className="text-white text-sm leading-relaxed">{analysis}</p>
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
                <Button className="primary-btn flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Add
                </Button>
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
        <p className="text-white/70">{match.date} • {match.type}</p>
      </div>
      <span
        className={`text-xl font-bold ${
          match.result > 0 ? "text-green-500" : "text-red-500"
        }`}
      >
        {match.result > 0 ? "+" : ""}
        {match.result}$
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
      <TableHead className="text-right">Amount</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {user.recentMatches.map((match, index) => (
      <TableRow key={index}>
        <TableCell>{match.type}</TableCell>
        <TableCell>{match.position}</TableCell>
        <TableCell
          className={`text-right ${
            match.amount > 0 ? "text-green-500" : "text-red-500"
          }`}
        >
          {match.amount > 0 ? "+" : ""}
          {match.amount}$
        </TableCell>
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