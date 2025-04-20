import Navbar from "../components/Navbar";
import { Card } from "../components/ui/card";
import { useSearchParams } from "react-router-dom";

const ChessBoard = () => {
  const [searchParams] = useSearchParams();
  const gameUrl = searchParams.get("game");

  return (
    <div className="min-h-screen bg-background">
      <Navbar showItems={false} />
      <div className="container mx-auto px-6 pt-20">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Background with chess pattern */}
            <div className="absolute inset-0 bg-gradient-to-b from-background to-background/70 z-0">
              <div className="chess-board-bg absolute inset-0 opacity-20"></div>
            </div>

            <Card className="glass-card relative z-10 overflow-hidden">
              <div className="p-8 space-y-6">
                <div className="aspect-square w-full max-w-2xl mx-auto bg-chess-dark/50 rounded-lg shadow-lg">
                  {/* Chess game will be rendered here */}
                  <div className="flex items-center justify-center h-full text-chess-gold">
                    {gameUrl ? (
                      <iframe
                        src={gameUrl}
                        className="w-full h-full border-none"
                        title="Lichess Game"
                      ></iframe>
                    ) : (
                      <span>No game URL provided</span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChessBoard;
