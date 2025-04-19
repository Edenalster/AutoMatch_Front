import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Trophy, Users } from "lucide-react";
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

const formSchema = z.object({
  tournamentName: z
    .string()
    .min(3, "Tournament name must be at least 3 characters"),
  maxPlayers: z.string(),
  entryFee: z.string(),
  gameType: z.string(),
});

const CreateTournament = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tournamentName: "",
      maxPlayers: "8",
      entryFee: "10",
      gameType: "blitz",
    },
  });
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/"); // Navigate to the tournaments page
  };

  useEffect(() => {
    document.title = "Create Tournament - AutoMatch";
  }, []);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background gradient with a chess board pattern overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-chess-dark/90 via-chess-dark to-chess-dark/90 z-0"></div>
      <div className="absolute inset-0 chess-board-bg opacity-15 z-0"></div>

      {/* Decorative blurred elements for dynamic visuals */}
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
                            <Users className="absolute left-3 top-3 h-5 w-5 text-chess-gold" />
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger className="pl-10">
                                <SelectValue placeholder="Select max players" />
                              </SelectTrigger>
                              <SelectContent>
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
                    name="gameType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Game Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select game type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="blitz">
                              Normal (5 min)
                            </SelectItem>
                            <SelectItem value="rapid">
                              Rapid (10 min)
                            </SelectItem>
                            <SelectItem value="classic">
                              Classic (30 min)
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
                <div className="flex flex-row gap-10">
                  <Button
                    onClick={handleClick}
                    className="w-full secondary-btn py-6 bg-blue-900 text-white hover:bg-blue-700 "
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
