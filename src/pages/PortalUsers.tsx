import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Search, Filter, Plus, Eye, Settings, Shield, AlertTriangle } from "lucide-react";

const PortalUsers = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // Updated User interface to include cheating detection
  interface User {
    _id: string;
    lichessId: string;
    email: string;
    name: string;
    rating: number;
    joinDate: string;
    lastActive: string;
    status: "active" | "inactive";
    balance: number;
    cheatingDetected: boolean;
    cheatingCount: number;  
  }

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "";

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/lichess/dashboard/users`);
      const data = await res.json();
      setUsers(data.users);
    } catch (err) {
      console.error("⚠ Failed to fetch users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(); // initial load

    const interval = setInterval(() => {
      fetchUsers();
    }, 10000); // every 10 seconds

    return () => clearInterval(interval); // cleanup on unmount
  }, [backendUrl]);

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lichessId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Navigate to user detail page
  const navigateToUserDetail = (lichessId: string) => {
    navigate(`/portal/users/${lichessId}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Users</h1>
        <p className="text-white/60">Manage your platform users</p>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 h-4 w-4" />
          <Input
            placeholder="Search users..."
            className="pl-10 bg-white/5 border-white/10 text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
          <Button className="primary-btn">
            <Plus className="mr-2 h-4 w-4" /> Add User
          </Button>
        </div>
      </div>

      <Card className="bg-chess-dark/30 backdrop-blur-md border border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl text-white">All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-white/10 overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-chess-gold"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-white/5">
                    <TableHead className="text-white/80">User</TableHead>
                    <TableHead className="hidden md:table-cell text-white/80">
                      Lichess ID
                    </TableHead>
                    <TableHead className="text-center text-white/80">Rating</TableHead>
                    <TableHead className="text-center text-white/80 hidden lg:table-cell">
                      Balance
                    </TableHead>
                    <TableHead className="text-center text-white/80">Status</TableHead>
                    {/* New Cheating Detection Column */}
                    <TableHead className="text-center text-white/80">
                      <div className="flex items-center justify-center gap-1">
                        <Shield className="h-4 w-4" />
                        Cheating Detection
                      </div>
                    </TableHead>
                    <TableHead className="text-right text-white/80">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow
                      key={user._id}
                      className="border-white/10 hover:bg-white/5 cursor-pointer"
                      onClick={() => navigateToUserDetail(user.lichessId)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-10 w-10 border border-white/20">
                            <AvatarFallback className="bg-chess-primary text-chess-dark">
                              {(user.name && user.name !== "Unknown"
                                ? user.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                : user.email?.split("@")[0]?.[0] || "U"
                              ).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-white">
                              {user.name || user.lichessId}
                            </div>
                            <div className="text-sm text-white/60">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-white/70">
                        {user.lichessId}
                      </TableCell>
                      <TableCell className="text-center text-white">
                        {user.rating || 1500}
                      </TableCell>
                      <TableCell className="text-center text-white/70 hidden lg:table-cell">
                        ${user.balance?.toFixed(2) ?? 0}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          className={
                            user.status === "active"
                              ? "bg-green-500/20 text-green-400 hover:bg-green-500/30 hover:text-green-400"
                              : "bg-slate-500/20 text-slate-400 hover:bg-slate-500/30 hover:text-slate-400"
                          }
                        >
                          {user.status === "active" ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      {/* New Cheating Detection Column */}
                      <TableCell className="text-center">
                        {user.cheatingDetected ? (
                          <Badge className="bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-400">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Yes ({user.cheatingCount})
                          </Badge>
                        ) : (
                          <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30 hover:text-green-400">
                            <Shield className="h-3 w-3 mr-1" />
                            No
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div
                          className="flex justify-end gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigateToUserDetail(user.lichessId);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Settings className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {!isLoading && filteredUsers.length === 0 && (
            <div className="text-center py-10">
              <p className="text-white/60">
                No users found matching your search criteria.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PortalUsers;