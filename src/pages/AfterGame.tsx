import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const AfterGame = () => {
  const [status, setStatus] = useState<string | null>(null);
  const [whitePlayer, setWhitePlayer] = useState<string | null>(null);
  const [blackPlayer, setBlackPlayer] = useState<string | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const gameId = new URLSearchParams(location.search).get("gameId");

  const [tournamentId, setTournamentId] = useState<string | null>(null);
  const [tournamentName, setTournamentName] = useState<string | null>(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Fetch game result from Lichess
  useEffect(() => {
    if (!gameId) {
      setLoading(false);
      setError("No game ID provided");
      return;
    }

    const storedTournamentName = localStorage.getItem("tournamentName1");
    setTournamentName(storedTournamentName || "Chess Tournament");

    const storedTournamentId = localStorage.getItem("tournamentId");
    setTournamentId(storedTournamentId);

    const fetchGameResult = async () => {
      try {
        console.log(`Fetching game result for ID: ${gameId}`);
        const response = await fetch(`https://lichess.org/api/game/${gameId}`, {
          headers: { Accept: "application/json" },
        });

        if (!response.ok) {
          throw new Error(`Lichess API returned ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get("content-type");
        if (contentType?.includes("application/json")) {
          const data = await response.json();
          setStatus(data.status || "unknown");

          const whiteId = data.players?.white?.userId;
          const blackId = data.players?.black?.userId;

          if (whiteId) {
            const res = await fetch(`https://lichess.org/api/user/${whiteId}`);
            const whiteData = await res.json();
            setWhitePlayer(whiteData.username || "Unknown");
          }

          if (blackId) {
            const res = await fetch(`https://lichess.org/api/user/${blackId}`);
            const blackData = await res.json();
            setBlackPlayer(blackData.username || "Unknown");
          }

          if (data.status === "mate" || data.status === "resign") {
            setWinner(data.winner);
          } else if (data.status === "draw") {
            setWinner("draw");
          }
        } else {
          try {
            const checkResponse = await fetch(`https://lichess.org/${gameId}`);
            setStatus(checkResponse.ok ? "ongoing" : "not_found");
            if (!checkResponse.ok) setError("Game not found");
          } catch {
            setError("Could not verify game status");
          }
        }
      } catch (err) {
        console.error("❌ Error fetching game result:", err);
        if (err instanceof Error && err.message.includes("404")) {
          setError("Game is still in progress...");
        } else {
          setError("Failed to fetch game result");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchGameResult();

    const interval = setInterval(() => {
      window.location.reload();
    }, 5000);

    return () => clearInterval(interval);
  }, [gameId]);

  // Update match result in DB when winner/status are ready
  useEffect(() => {
    const interval = setInterval(async () => {
      if ((winner || status === "draw") && gameId) {
        try {
          console.log("🎮 Auto-updating match in DB with:", { gameId, winner, status });
  
          const apiUrl = `${backendUrl}/api/lichess/tournaments/updateMatchResultByLichessUrl`;
          const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              lichessUrl: `https://lichess.org/${gameId}`,
              winner,
              status: status || "completed",
            }),
          });
  
          const text = await response.text();
          if (!response.ok) {
            console.error(`❌ DB update failed ${response.status}: ${text}`);
          } else {
            try {
              const data = JSON.parse(text);
              console.log("✅ DB updated successfully:", data);
            } catch {
              console.log("ℹ️ DB update response was not JSON:", text);
            }
          }
        } catch (err) {
          console.error("❌ Error auto-updating DB:", err);
        }
      }
    }, 5000); // every 5 seconds
  
    return () => clearInterval(interval);
  }, [winner, status, gameId, backendUrl]);

  const handleBackToTournament = () => {
    navigate("/tournament");
  };

  const handleGoToTournament = () => {
    navigate(`/bracket/${tournamentId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "mate":
        return "text-red-400";
      case "resign":
        return "text-orange-400";
      case "stalemate":
        return "text-yellow-400";
      case "draw":
        return "text-yellow-300";
      case "timeout":
        return "text-purple-400";
      case "cheat":
        return "text-pink-400";
      case "variantend":
        return "text-blue-300";
      case "started":
      case "created":
      case "ongoing":
        return "text-green-400";
      case "aborted":
        return "text-gray-400";
      default:
        return "text-white";
    }
  };

  const getReadableStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case "mate":
        return "Checkmate";
      case "resign":
        return "One player resigned";
      case "stalemate":
        return "Stalemate";
      case "draw":
        return "Game ended in a draw";
      case "timeout":
        return "Timeout";
      case "cheat":
        return "Terminated due to fair play violation";
      case "variantend":
        return "Game ended (variant-specific)";
      case "started":
      case "created":
      case "ongoing":
        return "Game is in progress";
      case "aborted":
        return "Game was aborted";
      default:
        return status || "Unknown status";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-dark-blue">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center">
          <h1 className="text-2xl font-bold mb-4">Loading Game Result</h1>
          <p>Please wait while we fetch the results from Lichess...</p>
          <div className="mt-4 w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error || !status) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-dark-blue">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center">
          <h1 className="text-2xl font-bold mb-4">Game Result Not Available</h1>
          <p>{error || "The game result is not available yet."}</p>
          <p className="text-sm mt-4">Game ID: {gameId || "Not provided"}</p>
          <div className="mt-6">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 py-2 px-4 rounded mr-4 hover:bg-blue-600 transition"
            >
              Refresh
            </button>
            <button
              onClick={handleBackToTournament} // This will trigger the navigation
              className="py-2 px-6 primary-btn"
            >
              Tournament Screen
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center text-white bg-dark-blue">
      <Navbar showItems={false} />
      <div className="absolute inset-0 bg-gradient-to-b from-background to-background/70 z-0">
        <div className="chess-board-bg absolute inset-0 opacity-20"></div>
      </div>

      {/* Decorative blurred circles for visual interest */}
      <div className="absolute top-1/4 left-10 w-64 h-64 bg-chess-gold/20 rounded-full filter blur-3xl animate-pulse-soft"></div>
      <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-chess-secondary/20 rounded-full filter blur-3xl animate-pulse-soft"></div>

      <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center max-w-md w-full z-10">
        <h1 className="text-4xl font-bold mb-6">{tournamentName}</h1>

        {/* Displaying Players */}
        <div className="text-2xl font-semibold mb-4">
          <span className="text-chess-gold">{whitePlayer || "White"}</span> VS{" "}
          <span className="text-chess-gold">{blackPlayer || "Black"}</span>
        </div>

        {/* Displaying Players */}
        <div className="text-2xl font-semibold mb-4">
          WINNER:{" "}
          <span className="text-chess-gold">
            {winner === "white"
              ? whitePlayer
              : winner === "black"
              ? blackPlayer
              : "Draw"}
          </span>{" "}
          {/* Display winner name */}
        </div>

        {/* Displaying the result */}
        <div className="bg-gray-700 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-bold mb-3">Result</h2>
          <p className={`text-2xl ${getStatusColor(status)}`}>
            {getReadableStatus(status)}
          </p>

          <div className="mt-4 text-sm text-gray-400">
            <a
              href={`https://lichess.org/${gameId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-blue-300"
            >
              View game on Lichess
            </a>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-8 flex justify-center gap-6">
          <button
            onClick={() => (window.location.href = "/")}
            className="py-2 px-6 secondary-btn bg-blue-900 text-white hover:bg-blue-700"
          >
            Back to Home
          </button>
          <button
            onClick={handleGoToTournament}
            className="py-2 px-6 primary-btn"
          >
            Tournament Screen
          </button>
        </div>
      </div>
    </div>
  );
};

export default AfterGame;