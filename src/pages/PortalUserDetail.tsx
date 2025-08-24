import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import {
  ArrowLeft,
  User,
  Mail,
  Shield,
  AlertTriangle,
  Calendar,
  DollarSign,
  Trophy,
  Globe,
  Users,
  Target,
  Clock,
  ChevronDown,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

interface UserDetail {
  _id: string;
  lichessId: string;
  email?: string;
  balance: number;
  status: "active" | "inactive";
  cheatingDetected: boolean;
  cheatingCount: number;
  cheatingDetections?: Array<{
    gameId: string;
    timestamp: string;
    confidence: number;
    analysis: string;
  }>;
  // Lichess API data
  username?: string;
  rating?: number;
  title?: string;
  createdAt?: string;
  profile?: {
    bio?: string;
    location?: string;
    firstName?: string;
    lastName?: string;
  };
}

interface TournamentHistory {
  _id: string;
  tournamentName: string;
  maxPlayers: number;
  actualPlayers: number;
  entryFee: number;
  prizePool: number;
  status: "active" | "completed" | "expired";
  createdAt: string;
  userResult: "won" | "eliminated";
  matchesWon: number;
  matchesLost: number;
  totalMatches: number;
  winRate: number;
}

const PortalUserDetail = () => {
  const { lichessId } = useParams<{ lichessId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [tournaments, setTournaments] = useState<TournamentHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tournamentsLoading, setTournamentsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedDetections, setExpandedDetections] = useState<Set<number>>(
    new Set()
  );

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "";

  // Navigate to tournament bracket
  const navigateToTournament = (tournamentId: string) => {
    navigate(`/bracket/${tournamentId}`);
  };

  // Toggle expanded state for cheating detection
  const toggleDetection = (index: number) => {
    const newExpanded = new Set(expandedDetections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedDetections(newExpanded);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!lichessId) return;

      setIsLoading(true);
      setError(null);

      try {
        console.log(`Fetching user data for: ${lichessId}`);
        const response = await fetch(
          `${backendUrl}/api/lichess/dashboard/users/${lichessId}`
        );

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("User not found");
          }
          throw new Error(`Failed to fetch user data: ${response.status}`);
        }

        const userData = await response.json();
        console.log("User data received:", userData);
        setUser(userData);
      } catch (err) {
        console.error("Error fetching user details:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load user data"
        );
      } finally {
        setIsLoading(false);
      }
    };

    const fetchTournamentData = async () => {
      if (!lichessId) return;

      setTournamentsLoading(true);

      try {
        console.log(`Fetching tournament history for: ${lichessId}`);
        const response = await fetch(
          `${backendUrl}/api/lichess/dashboard/users/${lichessId}/tournaments`
        );

        if (response.ok) {
          const tournamentData = await response.json();
          console.log("Tournament data received:", tournamentData);
          setTournaments(tournamentData.tournaments || []);
        }
      } catch (err) {
        console.error("Error fetching tournament history:", err);
        // Don't set error for tournaments - just log it
      } finally {
        setTournamentsLoading(false);
      }
    };

    fetchUserData();
    fetchTournamentData();
  }, [lichessId, backendUrl]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-chess-gold"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-8">
        <div className="flex items-center mb-6">
          <Button
            variant="outline"
            className="mr-4"
            onClick={() => navigate("/portal/users")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Users
          </Button>
          <h1 className="text-2xl font-bold text-white">User Not Found</h1>
        </div>
        <Card className="bg-chess-dark/30 backdrop-blur-md border border-white/10">
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col items-center justify-center text-center p-8">
              <h2 className="text-xl font-semibold text-white mb-2">
                Error Loading User Data
              </h2>
              <p className="text-white/70 mb-4">
                {error || "The requested user could not be found."}
              </p>
              <Button onClick={() => navigate("/portal/users")}>
                Return to User List
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate display name
  const displayName =
    user.profile?.firstName && user.profile?.lastName
      ? `${user.profile.firstName} ${user.profile.lastName}`
      : user.username || user.lichessId;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Button
          variant="outline"
          className="mr-4"
          onClick={() => navigate("/portal/users")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Users
        </Button>
        <h1 className="text-2xl font-bold text-white">User Details</h1>
      </div>

      {/* User Profile Card */}
      <Card className="bg-chess-dark/30 backdrop-blur-md border border-white/10 mb-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl text-white flex items-center gap-2">
            <User className="h-5 w-5" />
            User Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-4 border-2 border-chess-gold/50">
                <AvatarFallback className="bg-chess-dark text-chess-gold text-xl">
                  {displayName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Badge
                className={
                  user.status === "active"
                    ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                    : "bg-slate-500/20 text-slate-400 hover:bg-slate-500/30"
                }
              >
                {user.status === "active" ? "Online" : "Offline"}
              </Badge>
            </div>

            {/* User Details */}
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {displayName}
                  {user.title && (
                    <span className="ml-2 text-chess-gold text-lg">
                      {user.title}
                    </span>
                  )}
                </h2>
                <div className="flex items-center gap-2 text-white/70 mb-2">
                  <Globe className="h-4 w-4" />
                  <span>Lichess ID: {user.lichessId}</span>
                </div>
                {user.email && (
                  <div className="flex items-center gap-2 text-white/70 mb-2">
                    <Mail className="h-4 w-4" />
                    <span>{user.email}</span>
                  </div>
                )}
                {user.profile?.location && (
                  <div className="flex items-center gap-2 text-white/70 mb-2">
                    <Globe className="h-4 w-4" />
                    <span>{user.profile.location}</span>
                  </div>
                )}
                {user.createdAt && (
                  <div className="flex items-center gap-2 text-white/70">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Joined: {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {user.profile?.bio && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Bio</h3>
                  <p className="text-white/70">{user.profile.bio}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-chess-dark/30 backdrop-blur-md border border-white/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Rating</p>
                <p className="text-2xl font-bold text-white">
                  {user.rating || 1500}
                </p>
              </div>
              <Trophy className="h-8 w-8 text-chess-gold" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-chess-dark/30 backdrop-blur-md border border-white/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Balance</p>
                <p className="text-2xl font-bold text-white">
                  ${user.balance.toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-chess-dark/30 backdrop-blur-md border border-white/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Status</p>
                <p className="text-lg font-bold text-white">
                  {user.status === "active" ? "Active" : "Inactive"}
                </p>
              </div>
              <User
                className={`h-8 w-8 ${
                  user.status === "active" ? "text-green-400" : "text-slate-400"
                }`}
              />
            </div>
          </CardContent>
        </Card>

        <Card
          className={`backdrop-blur-md border ${
            user.cheatingDetected
              ? "bg-red-500/10 border-red-500/20"
              : "bg-green-500/10 border-green-500/20"
          }`}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Cheating</p>
                <p
                  className={`text-lg font-bold ${
                    user.cheatingDetected ? "text-red-400" : "text-green-400"
                  }`}
                >
                  {user.cheatingDetected
                    ? `${user.cheatingCount} Detection${
                        user.cheatingCount !== 1 ? "s" : ""
                      }`
                    : "Clean"}
                </p>
              </div>
              {user.cheatingDetected ? (
                <AlertTriangle className="h-8 w-8 text-red-400" />
              ) : (
                <Shield className="h-8 w-8 text-green-400" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cheating Detection Details */}
      {user.cheatingDetected &&
        user.cheatingDetections &&
        user.cheatingDetections.length > 0 && (
          <Card className="bg-chess-dark/30 backdrop-blur-md border border-red-500/20 mb-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                Cheating Detection History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {user.cheatingDetections.map((detection, index) => (
                  <div
                    key={index}
                    className="border border-red-500/20 rounded-lg bg-red-500/5 overflow-hidden"
                  >
                    {/* Collapsed view - always visible */}
                    <div
                      className="p-4 cursor-pointer hover:bg-red-500/10 transition-colors"
                      onClick={() => toggleDetection(index)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {expandedDetections.has(index) ? (
                            <ChevronDown className="h-4 w-4 text-red-400" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-red-400" />
                          )}
                          <div>
                            <p className="text-white font-semibold">
                              Game ID: {detection.gameId}
                            </p>
                            <p className="text-white/60 text-sm">
                              {new Date(
                                detection.timestamp
                              ).toLocaleDateString()}{" "}
                              at{" "}
                              {new Date(
                                detection.timestamp
                              ).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-red-500/20 text-red-400 shrink-0">
                          {detection.confidence}% confidence
                        </Badge>
                      </div>
                    </div>

                    {/* Expanded view - only visible when clicked */}
                    {expandedDetections.has(index) && (
                      <div className="px-4 pb-4 border-t border-red-500/20 bg-red-500/5">
                        <div className="pt-3">
                          <h4 className="text-white/80 font-medium mb-2">
                            Analysis Details:
                          </h4>
                          <p className="text-white/70 text-sm leading-relaxed">
                            {detection.analysis}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      {/* Tournament History */}
      <Card className="bg-chess-dark/30 backdrop-blur-md border border-white/10">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl text-white flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Tournament History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tournamentsLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-chess-gold"></div>
            </div>
          ) : tournaments.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 text-white/40 mx-auto mb-4" />
              <p className="text-white/60">No tournament history found</p>
            </div>
          ) : (
            <div className="rounded-md border border-white/10 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-white/5">
                    <TableHead className="text-white/80">Tournament</TableHead>
                    <TableHead className="text-center text-white/80">
                      Players
                    </TableHead>
                    <TableHead className="text-center text-white/80">
                      Prize Pool
                    </TableHead>
                    <TableHead className="text-center text-white/80">
                      Result
                    </TableHead>
                    <TableHead className="text-center text-white/80">
                      W/L
                    </TableHead>
                    <TableHead className="text-center text-white/80">
                      Status
                    </TableHead>
                    <TableHead className="text-center text-white/80">
                      Date
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tournaments.map((tournament) => (
                    <TableRow
                      key={tournament._id}
                      className="border-white/10 hover:bg-white/5 cursor-pointer transition-colors"
                      onClick={() => navigateToTournament(tournament._id)}
                    >
                      <TableCell className="font-medium">
                        <div>
                          <div className="text-white font-semibold flex items-center gap-2">
                            {tournament.tournamentName}
                            <ExternalLink className="h-3 w-3 text-white/40" />
                          </div>
                          <div className="text-white/60 text-sm">
                            Entry: ${tournament.entryFee}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1 text-white">
                          <Users className="h-4 w-4" />
                          {tournament.actualPlayers}/{tournament.maxPlayers}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1 text-green-400">
                          <DollarSign className="h-4 w-4" />
                          {tournament.prizePool}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          className={
                            tournament.userResult === "won"
                              ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                              : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                          }
                        >
                          {tournament.userResult === "won" ? (
                            <>
                              <Trophy className="h-3 w-3 mr-1" />
                              Won
                            </>
                          ) : (
                            <>
                              <Target className="h-3 w-3 mr-1" />
                              Lost
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="text-white text-sm">
                          <span className="text-green-400">
                            {tournament.matchesWon}
                          </span>
                          /
                          <span className="text-red-400">
                            {tournament.matchesLost}
                          </span>
                          <div className="text-xs text-white/60">
                            {tournament.winRate}% win rate
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          className={
                            tournament.status === "completed"
                              ? "bg-slate-500/20 text-slate-400"
                              : tournament.status === "active"
                              ? "bg-blue-500/20 text-blue-400"
                              : "bg-orange-500/20 text-orange-400"
                          }
                        >
                          {tournament.status === "active" && (
                            <Clock className="h-3 w-3 mr-1" />
                          )}
                          {tournament.status.charAt(0).toUpperCase() +
                            tournament.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-white/70 text-sm">
                        {new Date(tournament.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PortalUserDetail;
