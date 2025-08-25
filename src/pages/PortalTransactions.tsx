import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Filter, Search, Trophy, Users } from "lucide-react";
import { Input } from "@/components/ui/input";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface Transaction {
  id: string;
  tournament: string;
  type: string;
  players: string;
  amount: number;
  status: "completed" | "pending" | "expired" | "failed";
  winner?: string;
  date: string;
}

const PortalTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/lichess/dashboard/transactions`
        );
        const data = await res.json();
        setTransactions(data.transactions);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Updated for tournament types instead of user ratings
  const typeBuckets = {
    "Beginner": 0,
    "Intermediate": 0, 
    "Advanced": 0,
    "Standard": 0,
  };

  transactions.forEach((tx) => {
    const type = tx.type || "Standard";
    if (typeBuckets.hasOwnProperty(type)) {
      typeBuckets[type as keyof typeof typeBuckets] += tx.amount;
    } else {
      typeBuckets.Standard += tx.amount;
    }
  });

  const typeData = Object.entries(typeBuckets)
    .filter(([, value]) => value > 0)
    .map(([label, value]) => ({
      name: `${label} ($${value.toFixed(2)})`,
      value,
    }));

  const COLORS = ["#3B82F6", "#8B5CF6", "#F97316", "#10B981"];

  const statusCounts = {
    completed: 0,
    pending: 0,
    expired: 0,
    failed: 0,
  };

  transactions.forEach((tx) => {
    statusCounts[tx.status]++;
  });

  const total = transactions.length;

  const statusData = Object.entries(statusCounts)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({
      name: `${status.charAt(0).toUpperCase() + status.slice(1)} (${Math.round((count / total) * 100)}%)`,
      value: count,
    }));

  const STATUS_COLORS = ["#10B981", "#D97706", "#EF4444", "#DC2626"];

  const StatsCard = ({ title, value }: {
    title: string;
    value: string | number;
  }) => (
    <Card className="bg-chess-dark/30 backdrop-blur-md border border-white/10">
      <CardContent className="p-6">
        <div className="text-2xl font-bold mb-1 text-white">{value}</div>
        <p className="text-white/70 text-sm">{title}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Transactions</h1>
        <p className="text-white/60">Monitor and manage tournament prize pools</p>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 h-4 w-4" />
          <Input placeholder="Search tournaments..." className="pl-10 bg-white/5 border-white/10 text-white" />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
          <Button className="secondary-btn">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard title="Total Prize Pools" value={`$${transactions.reduce((sum, t) => sum + (t.amount || 0), 0).toFixed(2)}`} />
        <StatsCard title="Completed Tournaments" value={transactions.filter(t => t.status === "completed").length} />
        <StatsCard title="Active Tournaments" value={transactions.filter(t => t.status === "pending").length} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-chess-dark/30 backdrop-blur-md border border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-white">Prize Pools by Tournament Type</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-72">
              {typeData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-white/60">
                  No data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={typeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {typeData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-chess-dark/30 backdrop-blur-md border border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-white">Tournament Payment Status</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-72">
              {statusData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-white/60">
                  No data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-chess-dark/30 backdrop-blur-md border border-white/10">
        <CardHeader>
          <CardTitle className="text-2xl text-white">Tournament Prize Pools</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-white text-center py-6">Loading...</p>
          ) : transactions.length === 0 ? (
            <p className="text-white/60 text-center py-6">No tournaments found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-white/70">Tournament</TableHead>
                  <TableHead className="text-white/70">Type</TableHead>
                  <TableHead className="text-white/70 text-center">Players</TableHead>
                  <TableHead className="text-white/70 text-center">Prize Pool</TableHead>
                  <TableHead className="text-white/70 text-center">Winner</TableHead>
                  <TableHead className="text-white/70 text-center">Status</TableHead>
                  <TableHead className="text-white/70 text-center">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id} className="hover:bg-white/5 border-white/10">
                    <TableCell className="font-medium text-white">{transaction.tournament}</TableCell>
                    <TableCell className="text-white/70">{transaction.type}</TableCell>
                    <TableCell className="text-center text-white">
                      <div className="flex items-center justify-center gap-1">
                        <Users className="h-4 w-4" />
                        {transaction.players}
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-medium text-chess-gold">
                      ${transaction.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center text-white">
                      {transaction.winner ? (
                        <div className="flex items-center justify-center gap-1">
                          <Trophy className="h-4 w-4 text-chess-gold" />
                          {transaction.winner}
                        </div>
                      ) : (
                        <span className="text-white/60">TBD</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={
                        transaction.status === "completed"
                          ? "bg-green-500/20 text-green-400 hover:bg-green-500/30 hover:text-green-400"
                          : transaction.status === "pending"
                          ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 hover:text-blue-400"
                          : transaction.status === "expired"
                          ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-400"
                          : "bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 hover:text-gray-400"
                      }>
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center text-white/70">
                      {new Date(transaction.date).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PortalTransactions;