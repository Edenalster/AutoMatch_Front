import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Trophy, Users, Globe, Lock, Award, AlertCircle } from "lucide-react"; 
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Slider } from "../components/ui/slider";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const formSchema = z.object({
  tournamentName: z
    .string()
    .min(3, "Tournament name must be at least 3 characters"),
  maxPlayers: z.string(),
  entryFee: z.string(),
  visibility: z.enum(["public", "private"]),
});

const CreateTournament = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tournamentName: "",
      maxPlayers: "8",
      entryFee: "10",
      visibility: "private",
    },
  });

  const [rankRange, setRankRange] = useState<{
    label: string;
    min: number;
    max: number;
  } | null>(null);

  const [prizePool, setPrizePool] = useState<number>(80);

  const [balance, setBalance] = useState<number | null>(null);
  const [balanceError, setBalanceError] = useState<string>("");

  const maxPlayers = form.watch("maxPlayers");
  const entryFee = form.watch("entryFee");

  useEffect(() => {
    const players = parseInt(maxPlayers) || 0;
    const fee = parseInt(entryFee) || 0;
    setPrizePool(players * fee);
  }, [maxPlayers, entryFee]);

  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleClick = () => {
    navigate("/");
  };

  useEffect(() => {
    const lichessId = localStorage.getItem("lichessId");
    if (!lichessId) return;

    const fetchUserRank = async () => {
      try {
        const res = await fetch(`https://lichess.org/api/user/${lichessId}`);
        const data = await res.json();
        const blitzRating = data?.perfs?.blitz?.rating ?? 1500;

        let rank: { label: string; min: number; max: number };

        if (blitzRating < 1200) {
          rank = { label: "Beginner", min: 0, max: 1199 };
        } else if (blitzRating < 1600) {
          rank = { label: "Intermediate", min: 1200, max: 1599 };
        } else if (blitzRating < 1800) {
          rank = { label: "Advanced", min: 1600, max: 1799 };
        } else if (blitzRating < 2000) {
          rank = { label: "Pro", min: 1800, max: 1999 };
        } else {
          rank = { label: "Elite", min: 2000, max: 3000 };
        }
        setRankRange(rank);
      } catch (err) {
        console.error("Failed to fetch Lichess rating", err);
      }
    };
    
    const fetchUserBalance = async () => {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");
        if (!userId || !token) {
            setBalance(0); 
            return;
        }
        try {
            const res = await axios.get(`${backendUrl}/auth/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBalance(res.data.balance || 0);
        } catch (err) {
            console.error("Failed to fetch user balance", err);
            setBalance(0); 
        }
    };

    document.title = "Create Tournament - AutoMatch";
    fetchUserRank();
    fetchUserBalance(); 
  }, []);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const fee = parseInt(values.entryFee);

  
    if (fee > 0) {
        if (balance === null) {
            setBalanceError("Checking balance, please wait...");
            return; 
        }
        if (balance < fee) {
            setBalanceError(`Insufficient funds. You need $${fee} but only have $${balance}. Please add funds to your account.`);
            return; 
        }
    }
    
    setBalanceError("");

    try {
      const userId = localStorage.getItem("userId");
      const lichessId = localStorage.getItem("lichessId");
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${backendUrl}/api/lichess/tournaments`,
        {
          createdBy: userId,
          playerIds: [lichessId || "placeholderUser"],
          maxPlayers: parseInt(values.maxPlayers),
          tournamentName: values.tournamentName,
          entryFee: fee,
          visibility: values.visibility,
          rankRange: rankRange 
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      const tournamentId = response.data.tournament._id;
      localStorage.setItem("tournamentId", tournamentId);

      navigate(`/lobby/${tournamentId}`);

    } catch (err) {
      console.error("Failed to create tournament", err);
      setBalanceError("Failed to create tournament. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 w-full h-full z-0">
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-chess-dark/90 via-chess-dark to-chess-dark/90"></div>
        <div className="absolute inset-0 w-full h-full chess-board-bg opacity-15"></div>
      </div>

      <div className="absolute top-20 left-10 w-64 h-64 bg-chess-gold/10 rounded-full filter blur-3xl animate-pulse-soft"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-chess-secondary/10 rounded-full filter blur-3xl animate-pulse-soft"></div>

      <Navbar showItems={false} />

      <div className="container mx-auto px-6 pt-20 pb-12"> {}
        <div className="max-w-2xl mx-auto">
          <div className="space-y-2 text-center mb-8">
            <h1 className="text-4xl font-bold text-white drop-shadow-lg">
              Create Tournament
            </h1>
            <p className="text-muted-foreground text-white drop-shadow-sm">
              Set up a custom tournament and invite your friends
            </p>
          </div>

          <div className="glass-card p-6 space-y-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {}
                <FormField
                  control={form.control}
                  name="tournamentName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tournament Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Trophy className="absolute left-3 top-3 h-5 w-5 text-chess-gold" />
                          <Input
                            className="pl-10"
                            placeholder="Enter tournament name"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="maxPlayers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Players</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Users className="absolute left-3 top-3 h-5 w-5 text-chess-gold " />
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger className="pl-10">
                                <SelectValue placeholder="Select max players" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="2">2 Players</SelectItem>
                                <SelectItem value="4">4 Players</SelectItem>
                                <SelectItem value="8">8 Players</SelectItem>
                                <SelectItem value="16">16 Players</SelectItem>
                                <SelectItem value="32">32 Players</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="visibility"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Visibility</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <div className="flex items-center gap-2">
                              {field.value === "public" && (
                                <>
                                  <Globe className="h-4 w-4 text-chess-gold" />
                                  <span>Public - anyone can join</span>
                                </>
                              )}
                              {field.value === "private" && (
                                <>
                                  <Lock className="h-4 w-4 text-chess-gold" />
                                  <span>Private - invite only</span>
                                </>
                              )}
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="public">
                              <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4 text-chess-gold" />
                                <span>Public - anyone can join</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="private">
                              <div className="flex items-center gap-2">
                                <Lock className="h-4 w-4 text-chess-gold" />
                                <span>Private - invite only</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="entryFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entry Fee (USD) - Current Balance: ${balance !== null ? balance : 'Loading...'}</FormLabel>
                      <FormControl>
                        <div className="space-y-3">
                          <Slider
                            min={0}
                            max={100}
                            step={5}
                            value={[parseInt(field.value)]}
                            onValueChange={(value) =>
                              field.onChange(value[0].toString())
                            }
                            className="py-4"
                          />
                          <div className="text-center text-2xl font-bold text-chess-gold">
                            ${field.value}
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="bg-chess-dark/60 backdrop-blur-lg rounded-lg border border-chess-gold/30 p-4 shadow-lg">
                  <div className="flex items-center justify-center gap-3">
                    <Award className="h-6 w-6 text-chess-gold" />
                    <span className="text-xl font-bold text-white">
                      Prize Pool:
                    </span>
                    <span className="text-2xl font-bold text-chess-gold">
                      ${prizePool}
                    </span>
                  </div>
                  <p className="text-white/70 text-center text-sm mt-2">
                    {parseInt(maxPlayers) || 0} players × ${parseInt(entryFee) || 0} entry
                    fee
                  </p>
                </div>

                {rankRange && (
                  <div className="text-center text-lg text-white font-medium">
                    Rank Range:
                    <span className="text-chess-gold ml-2">
                      {rankRange.label} ({rankRange.min}–{rankRange.max})
                    </span>
                  </div>
                )}

                {}
                {balanceError && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-300 text-sm rounded-md p-3 flex items-center gap-3">
                        <AlertCircle className="h-5 w-5" />
                        <span>{balanceError}</span>
                    </div>
                )}

                <div className="flex flex-row gap-10">
                  <Button
                    onClick={handleClick}
                    type="button"
                    className="w-full secondary-btn py-6 bg-blue-900 text-white hover:bg-blue-700"
                  >
                    Cancel
                  </Button>

                  <Button 
                    type="submit" 
                    className="primary-btn w-full py-6"
                    disabled={balance === null} 
                  >
                    {balance === null ? "Loading..." : "Create Tournament"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTournament;