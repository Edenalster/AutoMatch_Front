import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Button } from "../components/ui/button";
import { Slider } from "../components/ui/slider";
import { Input } from "../components/ui/input";
import { useToast } from "../hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

const FindMatch = () => {
  const [entryFee, setEntryFee] = useState([0]);
  const [rankRange, setRankRange] = useState("any");
  const [lobbyUrl, setLobbyUrl] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSearch = () => {
    navigate(`/search-results?entryFee=${entryFee[0]}&rankRange=${rankRange}`);
  };

  const handleJoinLobby = () => {
    try {
      const url = new URL(lobbyUrl);
      const pathname = url.pathname;

      if (pathname.startsWith("/lobby/")) {
        navigate(pathname);
      } else {
        toast({
          title: "Invalid lobby URL",
          description: "The URL must follow the format /lobby/:id",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid lobby URL",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-chess-dark">
      <Navbar showItems={false} />
           {/* Background wrapper - this needs to be fixed position to cover the entire screen */}
           <div className="fixed inset-0 w-full h-full z-0">
        {/* Gradient background */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-chess-dark/90 via-chess-dark to-chess-dark/90"></div>
        {/* Chess board pattern overlay */}
        <div className="absolute inset-0 w-full h-full chess-board-bg opacity-15"></div>
      </div>

      {/* Decorative blurred circles for visual interest */}
      <div className="absolute top-1/4 left-10 w-64 h-64 bg-chess-gold/20 rounded-full filter blur-3xl animate-pulse-soft"></div>
      <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-chess-secondary/20 rounded-full filter blur-3xl animate-pulse-soft"></div>

      <div className="pt-28 pb-16 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg ">
            Find Match
          </h1>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="glass-card p-8 space-y-8">
            {/* Join via URL section */}
            <div className="space-y-4 pb-8 border-b border-white/10">
              <label className="block text-lg font-medium text-white mb-2">
                Join via URL
              </label>
              <div className="flex gap-4">
                <Input
                  type="text"
                  placeholder="Enter lobby URL"
                  value={lobbyUrl}
                  onChange={(e) => setLobbyUrl(e.target.value)}
                  className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/50"
                />
                <Button
                  onClick={handleJoinLobby}
                  className="bg-chess-gold hover:bg-chess-gold/90 text-black"
                >
                  Join Lobby
                </Button>
              </div>
            </div>

            {/* Entry Fee Slider */}
            <div className="space-y-4">
              <label className="block text-lg font-medium text-white mb-2">
                Entry Fee
              </label>
              <div className="px-2">
                <Slider
                  defaultValue={[0]}
                  max={100}
                  step={1}
                  value={entryFee}
                  onValueChange={setEntryFee}
                  className="w-full"
                />
              </div>
              <div className="text-right text-chess-gold font-bold">
                ${entryFee[0]}-Max
              </div>
            </div>

            {/* Rank Select */}
            <div className="space-y-4">
              <label className="block text-lg font-medium text-white mb-2">
                Rank Range
              </label>
              <Select value={rankRange} onValueChange={setRankRange}>
                <SelectTrigger className="w-full bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select rank range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="beginner">Beginner (0–1200)</SelectItem>
                  <SelectItem value="intermediate">
                    Intermediate (1200–1400)
                  </SelectItem>
                  <SelectItem value="pro">Pro (1400–1700)</SelectItem>
                  <SelectItem value="elite">Elite (1700+)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search Button */}
            <Button onClick={handleSearch} className="w-full primary-btn mt-8">
              Search
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindMatch;
