import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { CalendarIcon, Users, PlayCircle, DollarSign } from "lucide-react";

import { Badge } from "../components/ui/badge";

const PortalDashboard = () => {
  const [stats, setStats] = useState({
    tournamentsCount: 0,
    activePlayers: 0,
    liveGames: 0,
    revenue: 0,
  });
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    fetch(`${backendUrl}/api/lichess/dashboard/summary`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error("Dashboard fetch error:", err));
  }, []);

  
  interface DashboardTournament {
    name: string;
    type: string;
    players: number;
    status: string;
    date: string;
  }

  const [tournaments, setTournaments] = useState<DashboardTournament[]>([]);

useEffect(() => {
  fetch(`${backendUrl}/api/lichess/dashboard/tournaments`)
    .then((res) => res.json())
    .then((data) => setTournaments(data.tournaments))
    .catch((err) =>
      console.error(" Failed to fetch tournament table data", err)
    );
}, []);

type Player = {
  id: string;
  name: string;
  rating: number;
  tournaments: number;
  winRate: number;
  status: "active" | "inactive";
  initials: string;
};

const [players, setPlayers] = useState<Player[]>([]);


useEffect(() => {
  fetch(`${backendUrl}/api/lichess/dashboard/players`)
    .then((res) => res.json())
    .then((data) => {
      const formatted = data.players.map((p: any) => {
        const lichessId = p.lichessId || p.id || "";
        const name =
          p.name ||
          p.username ||
          lichessId ||
          (p.email ? p.email.split("@")[0] : "Unknown");

        const initials = name
          .split(" ")
          .map((part: string) => part.charAt(0))
          .join("")
          .toUpperCase();

        return {
          ...p,
          name,
          initials,
        };
      });

      setPlayers(formatted);
    })
    .catch((err) =>
      console.error(" Failed to fetch players dashboard data", err)
    );
}, []);

interface Game {
  tournament: string;
  round: string;
  player1: string;
  player2: string;
  startTime: string;
}

const [games, setGames] = useState<Game[]>([]);

useEffect(() => {
  fetch(`${backendUrl}/api/lichess/dashboard/active-games`)
    .then((res) => res.json())
    .then((data) => setGames(data.games))
    .catch((err) => console.error("Failed to fetch active games", err));
}, []);


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Dashboard</h1>
        <p className="text-white/60">Welcome to your chess tournament portal</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatsCard
          title="Total Tournaments"
          value={stats.tournamentsCount.toString()}
          description="+2 this month"
          icon={<CalendarIcon className="h-8 w-8 text-chess-gold" />}
        />
        <StatsCard
          title="Active Players"
          value={stats.activePlayers.toString()}
          description="+12 this week"
          icon={<Users className="h-8 w-8 text-chess-primary" />}
        />
        <StatsCard
          title="Live Games"
          value={stats.liveGames.toString()}
          description="4 tournaments"
          icon={<PlayCircle className="h-8 w-8 text-chess-accent" />}
        />
        <StatsCard
          title="Revenue"
          value={`$${stats.revenue.toLocaleString()}`}
          description="+15% vs last month"
          icon={<DollarSign className="h-8 w-8 text-chess-success" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-chess-dark/30 backdrop-blur-md border border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl text-white">Active Games</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
             
            <div className="space-y-4">
  {games.length > 0 ? (
    games.map((g, i) => (
      <GameCard
        key={i}
        tournament={g.tournament}
        round={g.round}
        player1={g.player1}
        player1Initial={g.player1.slice(0, 2).toUpperCase()}
        player2={g.player2}
        player2Initial={g.player2.slice(0, 2).toUpperCase()}
        startTime={new Date(g.startTime).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
        highlighted={i === 0}
      />
    ))
  ) : (
    <div className="text-white/60 text-center py-8">
      No active games at the moment.
    </div>
  )}
</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-chess-dark/30 backdrop-blur-md border border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl text-white">Players</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-white/10">
                    <TableHead className="text-white/70">Player</TableHead>
                    <TableHead className="text-white/70 text-center">
                      Rating
                    </TableHead>
                    <TableHead className="text-white/70 text-center">
                      Tournaments
                    </TableHead>
                    <TableHead className="text-white/70 text-center">
                      Win Rate
                    </TableHead>
                    <TableHead className="text-white/70 text-center">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
  {players.map((p, i) => (
    <TableRow key={i} className="hover:bg-white/5 border-white/10">
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium">
            {p.initials}
          </div>
          <span className="text-white">{p.name}</span>
        </div>
      </TableCell>
      <TableCell className="text-center text-white">{p.rating}</TableCell>
      <TableCell className="text-center text-white">{p.tournaments}</TableCell>
      <TableCell className="text-center text-white">{p.winRate}%</TableCell>
      <TableCell className="text-center">
        <Badge
          className={`${
            p.status === "active"
              ? "bg-green-500/20 text-green-400"
              : "bg-slate-500/20 text-slate-400"
          } hover:bg-opacity-30 hover:text-opacity-100`}
        >
          {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
        </Badge>
      </TableCell>
    </TableRow>
  ))}
</TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-chess-dark/30 backdrop-blur-md border border-white/10">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-xl text-white">Tournaments</CardTitle>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search tournaments..."
              className="px-3 py-1 text-sm bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:border-chess-gold"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-white/10">
                <TableHead className="text-white/70">Name</TableHead>
                <TableHead className="text-white/70">Type</TableHead>
                <TableHead className="text-white/70 text-center">
                  Players
                </TableHead>
                <TableHead className="text-white/70 text-center">
                  Status
                </TableHead>
                <TableHead className="text-white/70 text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
  {tournaments.map((t, i) => (
    <TableRow key={i} className="hover:bg-white/5 border-white/10">
      <TableCell className="font-medium text-white">{t.name}</TableCell>
      <TableCell className="text-white">{t.type}</TableCell>
      <TableCell className="text-white text-center">{t.players}</TableCell>
      <TableCell className="text-center">
        <Badge
          className={`${
            t.status === "active"
              ? "bg-green-500/20 text-green-400"
              : "bg-slate-500/20 text-slate-400"
          } hover:bg-opacity-30 hover:text-opacity-100`}
        >
          {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
        </Badge>
      </TableCell>
      <TableCell className="text-white text-right">{t.date}</TableCell>
    </TableRow>
  ))}
</TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

interface StatsCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}

const StatsCard = ({ title, value, description, icon }: StatsCardProps) => {
  return (
    <Card className="bg-chess-dark/30 backdrop-blur-md border border-white/10 overflow-hidden">
      <CardContent className="p-6 flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-white/60">{title}</p>
          <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
          <p className="text-xs text-white/50 mt-1">{description}</p>
        </div>
        <div className="rounded-full p-3 bg-white/5 border border-white/10">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
};

interface GameCardProps {
  tournament: string;
  round: string;
  player1: string;
  player1Initial: string;
  player2: string;
  player2Initial: string;
  startTime: string;
  highlighted?: boolean;
}

const GameCard = ({
  tournament,
  round,
  player1,
  player1Initial,
  player2,
  player2Initial,
  startTime,
  highlighted = false,
}: GameCardProps) => {
  return (
    <div
      className={`p-4 rounded-lg border ${
        highlighted
          ? "border-chess-gold/30 bg-chess-gold/5"
          : "border-white/10 bg-transparent"
      }`}
    >
      <div className="text-sm text-white/70 mb-2">
        {tournament} - {round}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium">
            {player1Initial}
          </div>
          <span className="text-white">{player1}</span>
        </div>
        <span className="text-chess-gold font-medium">vs</span>
        <div className="flex items-center gap-3">
          <span className="text-white">{player2}</span>
          <div className="size-8 rounded-full bg-rose-600 flex items-center justify-center text-white font-medium">
            {player2Initial}
          </div>
        </div>
      </div>
      <div className="text-right text-xs text-white/50 mt-2">
        Started at {startTime}
      </div>
    </div>
  );
};

export default PortalDashboard;
