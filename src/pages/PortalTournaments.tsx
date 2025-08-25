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
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  CalendarPlus,
  Eye,
  Filter,
  MoreHorizontal,
  Search,
  ExternalLink,
} from "lucide-react";
import { Input } from "../components/ui/input";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Added navigation import

const PortalTournaments = () => {
  const navigate = useNavigate(); // Added navigation hook

  interface Tournament {
    _id?: string;
    id?: string;
    tournamentName: string;
    rankRange?: { label: string };
    type?: string;
    playerIds?: string[];
    maxPlayers?: number;
    entryFee?: number;
    status?: "active" | "upcoming" | "completed";
    createdAt?: string;
  }

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [stats, setStats] = useState({
    tournamentsCount: 0,
    activePlayers: 0,
    liveGames: 0,
    revenue: 0,
  });

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Added navigation function
  const navigateToTournament = (tournamentId: string) => {
    navigate(`/bracket/${tournamentId}`);
  };

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/lichess/tournaments/all`);
        const data = await res.json();
        if (data && Array.isArray(data.tournaments)) {
          setTournaments(data.tournaments);
        } else {
          console.error("Unexpected response structure:", data);
        }
      } catch (err) {
        console.error("Failed to fetch tournaments:", err);
      }
    };
    fetchTournaments();
  }, []);

  useEffect(() => {
    fetch(`${backendUrl}/api/lichess/dashboard/summary`)
      .then(res => res.json())
      .then(data => {
        setStats({
          tournamentsCount: data.tournamentsCount ?? 0,
          activePlayers: data.activePlayers ?? 0,
          liveGames: data.liveGames ?? 0,
          revenue: data.revenue ?? 0,
        });
      })
      .catch(err => console.error("Dashboard fetch error:", err));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Tournaments</h1>
        <p className="text-white/60">Manage all chess tournaments</p>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 h-4 w-4" />
          <Input
            placeholder="Search tournaments..."
            className="pl-10 bg-white/5 border-white/10 text-white"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
          <Button className="primary-btn">
            <CalendarPlus className="mr-2 h-4 w-4" /> Create Tournament
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatsCard
          title="Total Tournaments"
          value={stats.tournamentsCount.toString()}
          description="+2 this month"
        />
        <StatsCard
          title="Active Players"
          value={stats.activePlayers.toString()}
          description="+12 this week"
        />
        <StatsCard
          title="Live Games"
          value={stats.liveGames.toString()}
          description="Currently active"
        />
        <StatsCard
          title="Revenue"
          value={`$${stats.revenue.toLocaleString()}`}
          description="This season"
        />
      </div>

      <Card className="bg-chess-dark/30 backdrop-blur-md border border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl text-white">All Tournaments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-white/10 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-white/70">Name</TableHead>
                  <TableHead className="text-white/70">Type</TableHead>
                  <TableHead className="text-white/70 text-center">Players</TableHead>
                  <TableHead className="text-white/70 text-center hidden md:table-cell">Prize Pool</TableHead>
                  <TableHead className="text-white/70 text-center">Status</TableHead>
                  <TableHead className="text-white/70 text-center">Date</TableHead>
                  <TableHead className="text-white/70 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tournaments.map((tournament: Tournament) => (
                  <TableRow
                    key={tournament._id || tournament.id}
                    className="hover:bg-white/5 border-white/10 cursor-pointer transition-colors"
                    onClick={() => {
                      const tournamentId = tournament._id || tournament.id;
                      if (tournamentId) {
                        navigateToTournament(tournamentId);
                      }
                    }}
                  >
                    <TableCell className="font-medium text-white">
                      <div className="flex items-center gap-2">
                        {tournament.tournamentName}
                        <ExternalLink className="h-3 w-3 text-white/40" />
                      </div>
                    </TableCell>
                    <TableCell className="text-white">
                      {tournament.rankRange?.label || tournament.type || "—"}
                    </TableCell>
                    <TableCell className="text-center text-white">
                      {tournament.playerIds?.length ?? 0}/{tournament.maxPlayers}
                    </TableCell>
                    <TableCell className="text-center text-white hidden md:table-cell">
                      {"$" + (tournament.entryFee ?? 0) * (tournament.maxPlayers ?? 0)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        className={
                          tournament.status === "active"
                            ? "bg-green-500/20 text-green-400 hover:bg-green-500/30 hover:text-green-400"
                            : tournament.status === "upcoming"
                            ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 hover:text-blue-400"
                            : "bg-slate-500/20 text-slate-400 hover:bg-slate-500/30 hover:text-slate-400"
                        }
                      >
                        {tournament.status
                          ? tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)
                          : "—"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center text-white">
                      {tournament.createdAt
                        ? new Date(tournament.createdAt).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div 
                        className="flex justify-end gap-2"
                        onClick={(e) => e.stopPropagation()} // Prevent row click when clicking action buttons
                      >
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            const tournamentId = tournament._id || tournament.id;
                            if (tournamentId) {
                              navigateToTournament(tournamentId);
                            }
                          }}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View Bracket</span>
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">More</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface StatsCardProps {
  title: string;
  value: string;
  description: string;
}

const StatsCard = ({ title, value, description }: StatsCardProps) => {
  return (
    <Card className="bg-chess-dark/30 backdrop-blur-md border border-white/10 overflow-hidden">
      <CardContent className="p-6">
        <p className="text-sm font-medium text-white/60">{title}</p>
        <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
        <p className="text-xs text-white/50 mt-1">{description}</p>
      </CardContent>
    </Card>
  );
};

export default PortalTournaments;