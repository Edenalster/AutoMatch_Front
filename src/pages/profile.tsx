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
          .map((line) => JSON.parse(line));

        interface Game {
          perf: string;
          winner: string | null;
          players: {
            white: { user?: { id: string }; rating: number };
            black: { user?: { id: string }; rating: number };
          };
          createdAt: number;
        }

        const recentMatches = games.map((game: Game) => {
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

          return {
            type: `${game.perf.toUpperCase()} Game`,
            position: userDraw ? "Draw" : userWon ? "1st" : "Lost",
            amount: userDraw ? 0 : userWon ? 50 : -20,
          };
        });

        const tournamentResults = games.map((game: Game) => {
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

          return {
            date,
            tournament: "Online Game",
            type: game.perf.charAt(0).toUpperCase() + game.perf.slice(1),
            result: userDraw ? 0 : userWon ? 50 : -20,
          };
        });

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
          balance: 120,
          recentMatches,
          tournamentResults,
        });
      } catch (error) {
        console.error("Failed to fetch Lichess data:", error);
      }
    };

    fetchUserData();
  }, [lichessId]);

  if (!user) return <ChessLoader />;

  return (
    <div className="min-h-screen bg-chess-dark">
      {/* Background gradient with a chess board pattern overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-chess-dark/90 via-chess-dark to-chess-dark/90 z-0"></div>
      <div className="absolute inset-0 chess-board-bg opacity-15 z-0"></div>

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
              <h2 className="text-2xl font-bold text-white mb-6">
                Match History
              </h2>

              {/* Recent Results */}
              <div className="space-y-4 mb-8">
                {user.recentMatches.map((match, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-4 rounded-lg border border-white/10 bg-chess-dark/40"
                  >
                    <div>
                      <p className="text-white text-lg font-medium">
                        {match.type}
                      </p>
                      <p className="text-white/70">
                        Position: {match.position}
                      </p>
                    </div>
                    <span
                      className={`text-xl font-bold ${
                        match.amount > 0 ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {match.amount > 0 ? "+" : ""}
                      {match.amount}$
                    </span>
                  </div>
                ))}
              </div>

              {/* Tournament Results Table */}
              <h3 className="text-xl font-bold text-white mb-4">
                Tournament Results
              </h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Tournament</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Result</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {user.tournamentResults.map((match, index) => (
                    <TableRow key={index}>
                      <TableCell>{match.date}</TableCell>
                      <TableCell>{match.tournament}</TableCell>
                      <TableCell>{match.type}</TableCell>
                      <TableCell
                        className={`text-right ${
                          match.result > 0 ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {match.result > 0 ? "+" : ""}
                        {match.result}$
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
