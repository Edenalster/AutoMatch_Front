import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Trophy, Users, Globe, Lock, Award } from "lucide-react";
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

  const [prizePool, setPrizePool] = useState<number>(80); // Default based on default values

  // Watch form values to update prize pool
  const maxPlayers = form.watch("maxPlayers");
  const entryFee = form.watch("entryFee");

  // Update prize pool whenever maxPlayers or entryFee changes
  useEffect(() => {
    const players = parseInt(maxPlayers);
    const fee = parseInt(entryFee);
    setPrizePool(players * fee);
  }, [maxPlayers, entryFee]);

  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleClick = () => {
    navigate("/"); // Navigate to the tournaments page
  };

  useEffect(() => {
    const fetchUserRank = async () => {
      const lichessId = localStorage.getItem("lichessId");
      if (!lichessId) return;

      try {
        const res = await fetch(`https://lichess.org/api/user/${lichessId}`);
        const data = await res.json();
        const blitzRating = data?.perfs?.blitz?.rating ?? 1500;

        // Determine rank range
        let rank: { label: string; min: number; max: number } = {
          label: "Beginner",
          min: 0,
          max: 1200,
        };

        if (blitzRating >= 1200 && blitzRating < 1400) {
          rank = { label: "Intermediate", min: 1200, max: 1400 };
        } else if (blitzRating >= 1400 && blitzRating < 1700) {
          rank = { label: "Pro", min: 1400, max: 1700 };
        } else if (blitzRating >= 1700) {
          rank = { label: "Elite", min: 1700, max: 2200 };
        }

        setRankRange(rank);
      } catch (err) {
        console.error("Failed to fetch Lichess rating", err);
      }
    };

    document.title = "Create Tournament - AutoMatch";
    fetchUserRank(); // ✅ call it here
  }, []);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const userId = localStorage.getItem("userId");      // ← changed
      console.log("userId", userId);
      const lichessId = localStorage.getItem("lichessId");
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${backendUrl}/api/lichess/tournaments`,
        {
          createdBy: userId,
          playerIds: [lichessId || "placeholderUser"],
          maxPlayers: parseInt(values.maxPlayers),
          tournamentName: values.tournamentName,
          entryFee: parseInt(values.entryFee),
          visibility: values.visibility
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ Token from login
          },
          withCredentials: true, // ✅ Important if your backend sets cookies/session
        }
      );

      const tournamentId = response.data.tournament._id; // Get the tournamentId
      const lichessGameUrl = response.data.games?.[0];
      setRankRange(response.data.rankRange);
      console.log("🎯 Rank range received:", response.data.rankRange);

      // Give UI time to render rankRange before navigating away
      // ✅ Correct
      setTimeout(() => {
        const lichessGameUrl = response.data.games?.[0];
        if (lichessGameUrl) {
          navigate(`/chessboard?gameUrl=${encodeURIComponent(lichessGameUrl)}`);
        } else {
          navigate(`/lobby/${tournamentId}`);
        }
      }, 1500);

      // Store the tournamentId in localStorage
      localStorage.setItem("tournamentId", tournamentId);

      if (lichessGameUrl) {
        navigate(`/chessboard?gameUrl=${encodeURIComponent(lichessGameUrl)}`);
      } else {
        navigate(`/lobby/${tournamentId}`);
      }
    } catch (err) {
      console.error("Failed to create tournament", err);
    }
  };

  return (
    <div className="min-h-screen bg-background">
          {/* Background wrapper - this needs to be fixed position to cover the entire screen */}
          <div className="fixed inset-0 w-full h-full z-0">
        {/* Gradient background */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-chess-dark/90 via-chess-dark to-chess-dark/90"></div>
        {/* Chess board pattern overlay */}
        <div className="absolute inset-0 w-full h-full chess-board-bg opacity-15"></div>
      </div>

      {/* Decorative blurred elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-chess-gold/10 rounded-full filter blur-3xl animate-pulse-soft"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-chess-secondary/10 rounded-full filter blur-3xl animate-pulse-soft"></div>

      <Navbar showItems={false} />

      <div className="container mx-auto px-6 pt-20">
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
                              {!field.value && (
                                <span className="text-muted-foreground">
                                  Select visibility
                                </span>
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
                      <FormLabel>Entry Fee (USD)</FormLabel>
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

                {/* New Prize Pool Display */}
                <div className="bg-chess-dark/60 backdrop-blur-lg rounded-lg border border-chess-gold/30 p-4 shadow-lg">
                  <div className="flex items-center justify-center gap-3">
                    <Award className="h-6 w-6 text-chess-gold" />
                    <span className="text-xl font-bold text-white">Prize Pool:</span>
                    <span className="text-2xl font-bold text-chess-gold">${prizePool}</span>
                  </div>
                  <p className="text-white/70 text-center text-sm mt-2">
                    {parseInt(maxPlayers)} players × ${parseInt(entryFee)} entry fee
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

                <div className="flex flex-row gap-10">
                  <Button
                    onClick={handleClick}
                    className="w-full secondary-btn py-6 bg-blue-900 text-white hover:bg-blue-700"
                  >
                    Cancel
                  </Button>

                  <Button type="submit" className="primary-btn w-full py-6">
                    Create Tournament
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