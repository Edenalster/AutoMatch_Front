import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Play } from "lucide-react";

const ChessBoard = () => {
  const [gameUrl, setGameUrl] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve game URL from query parameters
    const queryParams = new URLSearchParams(location.search);
    const gameUrlFromParams = queryParams.get("gameUrl");
    if (gameUrlFromParams) {
      setGameUrl(gameUrlFromParams);
    }
  }, [location.search]);

  // Function to open the game URL in a pop-up window
  const openGameInPopup = () => {
    if (gameUrl) {
      window.open(gameUrl, "Game", "width=800,height=600");
    }
  };

  // Function to navigate to the after game page
  const handleGoToAfterGame = () => {
    if (gameUrl) {
      // Extract just the game ID from the full URL
      const gameId = gameUrl.split("/").pop();
      const tournamentId = localStorage.getItem("tournamentId");
      navigate(`/after-game?gameId=${gameId}&tournamentId=${tournamentId}`);
    } else {
      navigate("/after-game");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 relative">
      <Navbar showItems={false} />

      {/* Background gradient with a chess board pattern overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-chess-dark/90 via-chess-dark to-chess-dark/90 z-0"></div>
      <div className="absolute inset-0 chess-board-bg opacity-15 z-0"></div>

      {/* Decorative blurred elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-chess-gold/10 rounded-full filter blur-3xl animate-pulse-soft"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-chess-secondary/10 rounded-full filter blur-3xl animate-pulse-soft"></div>
      <div className="text-center relative mb-6 w-full"></div>

      {/* Container with a single border */}
      <div className="relative w-full max-w-sm">
        {/* Card with the border */}

        <div>
          {/* Decorative elements */}
          <div className="absolute top-1/4 left-10 w-32 h-32 bg-chess-gold/20 rounded-full filter blur-2xl animate-pulse-soft"></div>
          <div className="absolute bottom-1/4 right-10 w-40 h-40 bg-chess-secondary/20 rounded-full filter blur-2xl animate-pulse-soft"></div>
        </div>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
          <div className="glass-card p-14 rounded-xl space-y-10 max-w-sm w-full backdrop-blur-md border border-white/10 ">
            {/* X Button to go to After Game page */}
            <button
              onClick={handleGoToAfterGame}
              className="absolute top-4 right-6 text-white font-bold text-xl"
            >
              X
            </button>
            <h2 className="text-3xl font-bold text-white font-playfair">
              Start your game here!
            </h2>

            {gameUrl ? (
              <Button
                className="primary-btn w-full py-6 text-lg gap-2"
                onClick={openGameInPopup}
              >
                <Play className="h-5 w-5" />
                Play Game
              </Button>
            ) : (
              <div className="text-white">Game is not ready yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChessBoard;
