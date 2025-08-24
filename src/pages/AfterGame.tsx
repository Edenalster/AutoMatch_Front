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

  // ✅ פונקציה משופרת לקבלת שמות השחקנים מהטורניר
  const getPlayersFromTournament = async () => {
    if (!tournamentId || !gameId) {
      console.log(
        `❌ Missing data: tournamentId=${tournamentId}, gameId=${gameId}`
      );
      return null;
    }

    try {
      console.log(`🔍 Fetching tournament data for ID: ${tournamentId}`);
      console.log(`🎮 Looking for game ID: ${gameId}`);

      let response;

      // ניסיון ראשון: /api/lichess/tournaments/{id}
      console.log(
        `📡 First attempt: ${backendUrl}/api/lichess/tournaments/${tournamentId}`
      );
      response = await fetch(
        `${backendUrl}/api/lichess/tournaments/${tournamentId}`
      );

      // אם זה לא עובד, נסה ללא /api/lichess
      if (!response.ok) {
        console.log(
          `❌ First attempt failed (${response.status}), trying alternative path...`
        );
        console.log(
          `📡 Second attempt: ${backendUrl}/tournaments/${tournamentId}`
        );
        response = await fetch(`${backendUrl}/tournaments/${tournamentId}`);
      }

      console.log(`📊 Tournament API response status: ${response.status}`);
      if (!response.ok) {
        console.error(
          `❌ Tournament API failed: ${response.status} ${response.statusText}`
        );
        const errorText = await response.text();
        console.error(`❌ Error response: ${errorText}`);
        return null;
      }

      const tournamentData = await response.json();
      console.log(`📦 Tournament data received:`, tournamentData);
      console.log(
        `🎯 Tournament has ${tournamentData.bracket?.length || 0} brackets`
      );

      // מצא את המשחק בטורניר לפי ה-gameId
      for (
        let bracketIndex = 0;
        bracketIndex < (tournamentData.bracket || []).length;
        bracketIndex++
      ) {
        const bracket = tournamentData.bracket[bracketIndex];
        console.log(
          `🔎 Checking bracket ${bracketIndex} with ${
            bracket.matches?.length || 0
          } matches`
        );

        for (
          let matchIndex = 0;
          matchIndex < (bracket.matches || []).length;
          matchIndex++
        ) {
          const match = bracket.matches[matchIndex];
          console.log(
            `🔎 Match ${matchIndex}: ${match.player1} vs ${match.player2}, URL: ${match.lichessUrl}`
          );

          if (match.lichessUrl && match.lichessUrl.includes(gameId)) {
            console.log(`✅ Found match in tournament!`, match);
            return {
              player1: match.player1,
              player2: match.player2,
            };
          }
        }
      }

      console.log(`❌ No match found with gameId: ${gameId}`);
      return null;
    } catch (error) {
      console.error("❌ Error fetching tournament data:", error);
      return null;
    }
  };

  // ✅ פונקציה משופרת לבדיקת מצב המשחק
  const fetchGameResult = async () => {
    if (!gameId) {
      setLoading(false);
      setError("No game ID provided");
      return;
    }

    try {
      console.log(`Fetching game result for ID: ${gameId}`);

      // ✅ קודם כל, ננסה לקבל את שמות השחקנים מהטורניר
      const playersFromTournament = await getPlayersFromTournament();
      if (playersFromTournament) {
        console.log(
          `✅ Got player names from tournament: ${playersFromTournament.player1} vs ${playersFromTournament.player2}`
        );
        setWhitePlayer(playersFromTournament.player1);
        setBlackPlayer(playersFromTournament.player2);
      }

      // ✅ עכשיו ננסה לקבל את המשחק מ-Lichess
      let response = await fetch(`https://lichess.org/api/game/${gameId}`, {
        headers: { Accept: "application/json" },
      });

      // ✅ אם קיבלנו 404, זה אומר שהמשחק עדיין לא התחיל
      if (response.status === 404) {
        console.log(
          "Game hasn't started yet - showing game info with tournament player names"
        );
        setStatus("not_started");

        // ✅ אם לא הצלחנו לקבל שמות מהטורניר, נשים ערכי ברירת מחדל
        if (!playersFromTournament) {
          setWhitePlayer("Player 1");
          setBlackPlayer("Player 2");
        }

        setWinner("not_started");
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(
          `Lichess API returned ${response.status}: ${response.statusText}`
        );
      }

      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        const data = await response.json();
        setStatus(data.status || "unknown");

        // ✅ אם יש נתונים מ-Lichess, נשתמש בהם לעדכון שמות השחקנים
        const whiteId = data.players?.white?.userId;
        const blackId = data.players?.black?.userId;

        // רק אם אין לנו שמות מהטורניר, ננסה לקבל מ-Lichess
        if (!playersFromTournament) {
          if (whiteId) {
            try {
              const res = await fetch(
                `https://lichess.org/api/user/${whiteId}`
              );
              const whiteData = await res.json();
              setWhitePlayer(whiteData.username || "Unknown");
            } catch (err) {
              console.warn("Failed to fetch white player data:", err);
              setWhitePlayer("Player 1");
            }
          }

          if (blackId) {
            try {
              const res = await fetch(
                `https://lichess.org/api/user/${blackId}`
              );
              const blackData = await res.json();
              setBlackPlayer(blackData.username || "Unknown");
            } catch (err) {
              console.warn("Failed to fetch black player data:", err);
              setBlackPlayer("Player 2");
            }
          }
        }

        if (data.status === "mate" || data.status === "resign") {
          setWinner(data.winner);
        } else if (data.status === "draw") {
          setWinner("draw");
        }

        setError(null);
      }
    } catch (err) {
      console.error("❌ Error fetching game result:", err);

      // ✅ גם במקרה של שגיאה, ננסה להציג את שמות השחקנים מהטורניר
      const playersFromTournament = await getPlayersFromTournament();
      if (playersFromTournament) {
        setWhitePlayer(playersFromTournament.player1);
        setBlackPlayer(playersFromTournament.player2);
        setStatus("not_started");
        setWinner("not_started");
      } else {
        setWhitePlayer("Player 1");
        setBlackPlayer("Player 2");
        setError("Failed to fetch game result");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch game result from Lichess
  useEffect(() => {
    const storedTournamentName = localStorage.getItem("tournamentName1");
    setTournamentName(storedTournamentName || "Chess Tournament");

    const storedTournamentId = localStorage.getItem("tournamentId");
    setTournamentId(storedTournamentId);

    // ✅ Run initial fetch
    fetchGameResult();

    // ✅ Setup 2-second polling
    const interval = setInterval(() => {
      console.log("🔄 Auto-refreshing game result...");
      fetchGameResult();
    }, 2000); // every 2 seconds

    return () => clearInterval(interval); // cleanup
  }, [gameId]);

  // Update match result in DB when winner/status are ready
  useEffect(() => {
    if (
      (winner || status === "draw") &&
      gameId &&
      status !== "in_progress" &&
      status !== "not_started"
    ) {
      const updateMatchInDB = async () => {
        try {
          console.log("🎮 Auto-updating match in DB with:", {
            gameId,
            winner,
            status,
          });

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
      };

      updateMatchInDB();
    }
  }, [winner, status, gameId, backendUrl]);

  const handleBackToTournament = () => {
    if (tournamentId) {
      navigate(`/bracket/${tournamentId}`);
    } else {
      navigate("/");
    }
  };

  const handleGoToTournament = () => {
    if (tournamentId) {
      navigate(`/bracket/${tournamentId}`);
    } else {
      navigate("/");
    }
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
      case "in_progress":
        return "Game is being played";
      case "in_progress":
      case "not_started":
        return "Game not started yet";
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
      case "in_progress":
      case "started":
      case "ongoing":
        return "Game is being played";
      case "not_started":
      case "created":
        return "Game not started yet";
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
          <p className="text-sm text-gray-400 mt-2">
            This might take a moment if the game just started
          </p>
          <div className="mt-4 w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-dark-blue">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Game</h1>
          <p className="mb-4">{error}</p>
          <p className="text-sm mt-4">Game ID: {gameId || "Not provided"}</p>

          <div className="mt-6">
            <button
              onClick={() => {
                setLoading(true);
                setError(null);
                fetchGameResult();
              }}
              className="bg-blue-500 py-2 px-4 rounded mr-4 hover:bg-blue-600 transition"
            >
              Refresh
            </button>
            <button
              onClick={handleBackToTournament}
              className="py-2 px-6 primary-btn"
            >
              Tournament Screen
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!status) {
    handleBackToTournament();
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center text-white bg-dark-blue">
      <Navbar showItems={false} />
      <div className="absolute inset-0 bg-gradient-to-b from-background to-background/70 z-0">
        <div className="chess-board-bg absolute inset-0 opacity-20"></div>
      </div>

      <div className="absolute top-1/4 left-10 w-64 h-64 bg-chess-gold/20 rounded-full filter blur-3xl animate-pulse-soft"></div>
      <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-chess-secondary/20 rounded-full filter blur-3xl animate-pulse-soft"></div>

      <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center max-w-md w-full z-10">
        <h1 className="text-4xl font-bold mb-6">{tournamentName}</h1>

        <div className="text-2xl font-semibold mb-4">
          <span className="text-chess-gold">{whitePlayer || "White"}</span> VS{" "}
          <span className="text-chess-gold">{blackPlayer || "Black"}</span>
        </div>

        <div className="text-2xl font-semibold mb-4">
          WINNER:{" "}
          <span className="text-chess-gold">
            {status === "in_progress" || status === "started"
              ? "Game is being played"
              : winner === "not_started"
              ? "Game not started yet"
              : winner === "white"
              ? whitePlayer
              : winner === "black"
              ? blackPlayer
              : winner === "draw"
              ? "Draw"
              : "Game not started yet"}
          </span>
        </div>

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

        <div className="mt-6 flex justify-center">
          <button
            onClick={() => {
              setLoading(true);
              fetchGameResult();
            }}
            className="py-2 px-4 text-sm bg-gray-600 hover:bg-gray-500 rounded"
          >
            Refresh
          </button>
        </div>

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
