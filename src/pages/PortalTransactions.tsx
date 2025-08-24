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
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Download, ExternalLink, Filter, Search } from "lucide-react";
import { Input } from "../components/ui/input";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface Transaction {
  id: string;
  user: string;
  tournament?: string;
  amount: number;
  status: "completed" | "pending" | "failed";
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
        console.error("❌ Failed to fetch transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const userRatings: Record<string, number> = {
    edenals: 1100,
    oran: 1300,
    user3: 1450,
    user4: 1750,
  };

  const ratingBuckets = {
    Beginner: 0,
    Intermediate: 0,
    Pro: 0,
    Elite: 0,
  };

  transactions.forEach((tx) => {
    if (tx.amount <= 0) return;
    const rating = userRatings[tx.user] ?? 1500;
    if (rating < 1200) ratingBuckets.Beginner += tx.amount;
    else if (rating < 1400) ratingBuckets.Intermediate += tx.amount;
    else if (rating < 1700) ratingBuckets.Pro += tx.amount;
    else ratingBuckets.Elite += tx.amount;
  });

  const ratingData = Object.entries(ratingBuckets)
    .filter(([, value]) => value > 0)
    .map(([label, value]) => ({
      name: `${label} ($${value.toFixed(2)})`,
      value,
    }));

  const COLORS = ["#3B82F6", "#8B5CF6", "#F97316", "#10B981"];

  const statusCounts = {
    completed: 0,
    pending: 0,
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

  const STATUS_COLORS = ["#10B981", "#D97706", "#DC2626"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Transactions</h1>
        <p className="text-white/60">Monitor and manage payment transactions</p>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 h-4 w-4" />
          <Input placeholder="Search transactions..." className="pl-10 bg-white/5 border-white/10 text-white" />
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
        <StatsCard title="Total Revenue" value={`$${transactions.reduce((sum, t) => sum + (t.amount || 0), 0).toFixed(2)}`} bgColor="from-chess-gold/20 to-transparent" textColor="text-chess-gold" />
        <StatsCard title="Completed Payments" value={transactions.filter(t => t.status === "completed").length} bgColor="from-green-500/20 to-transparent" textColor="text-green-400" />
        <StatsCard title="Pending Payments" value={transactions.filter(t => t.status === "pending").length} bgColor="from-blue-500/20 to-transparent" textColor="text-blue-400" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-chess-dark/30 backdrop-blur-md border border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-white">Revenue by Player Rating</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-72">
              {ratingData.length === 0 ? (
                <p className="text-white/60 text-center">No revenue data by rating yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={ratingData} dataKey="value" innerRadius={60} outerRadius={100} paddingAngle={2}>
                      {ratingData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-chess-dark/30 backdrop-blur-md border border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-white">Payment Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="value" innerRadius={60} outerRadius={100} paddingAngle={2}>
                    {statusData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-chess-dark/30 backdrop-blur-md border border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl text-white">Recent Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-white/10 overflow-hidden">
            {loading ? (
              <p className="text-white text-center py-6">Loading...</p>
            ) : transactions.length === 0 ? (
              <p className="text-white/60 text-center py-6">No transactions found.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-white/70">ID</TableHead>
                    <TableHead className="text-white/70">Tournament</TableHead>
                    <TableHead className="text-white/70 hidden md:table-cell">User</TableHead>
                    <TableHead className="text-white/70 text-center">Amount</TableHead>
                    <TableHead className="text-white/70 text-center">Status</TableHead>
                    <TableHead className="text-white/70 text-center">Date</TableHead>
                    <TableHead className="text-white/70 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id} className="hover:bg-white/5 border-white/10">
                      <TableCell className="font-medium text-white/70">{transaction.id.slice(-6)}</TableCell>
                      <TableCell className="text-white">{transaction.tournament || "N/A"}</TableCell>
                      <TableCell className="text-white/70 hidden md:table-cell">{transaction.user}</TableCell>
                      <TableCell className="text-center font-medium text-white">${transaction.amount.toFixed(2)}</TableCell>
                      <TableCell className="text-center">
                        <Badge className={
                          transaction.status === "completed"
                            ? "bg-green-500/20 text-green-400 hover:bg-green-500/30 hover:text-green-400"
                            : transaction.status === "pending"
                            ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 hover:text-amber-400"
                            : "bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-400"
                        }>
                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-white">{new Date(transaction.date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10">
                          <ExternalLink className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface StatsCardProps {
  title: string;
  value: string | number;
  bgColor: string;
  textColor: string;
}

const StatsCard = ({ title, value, bgColor, textColor }: StatsCardProps) => {
  return (
    <Card className="bg-chess-dark/30 backdrop-blur-md border border-white/10 overflow-hidden">
      <CardContent className="p-6 relative">
        <div className={`absolute inset-0 bg-gradient-to-r ${bgColor} opacity-50`}></div>
        <div className="relative z-10">
          <p className="text-sm font-medium text-white/60">{title}</p>
          <h3 className={`text-2xl font-bold ${textColor} mt-1`}>{value}</h3>
        </div>
      </CardContent>
    </Card>
  );
};

export default PortalTransactions;