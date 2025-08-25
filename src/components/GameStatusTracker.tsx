import React, { useEffect, useState } from "react";

interface GameState {
  status: string;
 
}

interface GameStatusTrackerProps {
  gameId: string;
}

const GameStatusTracker: React.FC<GameStatusTrackerProps> = ({ gameId }) => {
  const [gameState, setGameState] = useState<GameState | null>(null);

  const fetchGameState = async () => {
    try {
      const response = await fetch(
        `https://lichess.org/api/game/${gameId}/state`
      );
      const data: GameState = await response.json();
      setGameState(data);

      if (data.status === "over") {
        console.log("Game is over");
      } else {
        console.log("Game is still ongoing");
      }
    } catch (error) {
      console.error("Error fetching game state:", error);
    }
  };

  useEffect(() => {
    fetchGameState();
    const intervalId = setInterval(fetchGameState, 5000); // Poll every 5 seconds

    // Clean up interval when the component unmounts
    return () => {
      clearInterval(intervalId);
    };
  }, [gameId]);

  return (
    <div>
      {gameState ? (
        <div>
          {gameState.status === "over" ? "Game Over" : "Game is ongoing"}
        </div>
      ) : (
        <div>Loading game state...</div>
      )}
    </div>
  );
};

export default GameStatusTracker;
