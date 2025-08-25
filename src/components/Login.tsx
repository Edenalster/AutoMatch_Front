import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Trophy } from "lucide-react";
import { Link, useLocation } from "react-router-dom";



const backendUrl = import.meta.env.VITE_BACKEND_URL;
console.log("backendUrl =", backendUrl);

const Login: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const location = useLocation();

  

  console.log(setIsLoading);
  const handleLichessLogin = () => {
    window.location.href = `${backendUrl}/auth/lichess/login`;
  };

  interface LichessLoginData {
    accessToken: string;
    userId: string;
    lichessId?: string;
  }

  const onLichessLoginSuccess = (data: LichessLoginData) => {
    console.log("Lichess login successful!", data);
    if (data.accessToken) {
      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("lichessId", data.lichessId || "");
      window.location.replace("/");
    } else {
      console.error("No accessToken received from Lichess!");
      setMessage("Lichess login failed. Please try again.");
    }
  };

  const onLichessLoginError = (error: { message: string }) => {
    console.error("Lichess login failed!", error);
    setMessage("Lichess login failed. Please try again.");
  };

  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const userId = params.get("userId");
    const lichessId = params.get("lichessId");
    if (token && userId) {
      onLichessLoginSuccess({
        accessToken: token,
        userId,
        lichessId: lichessId || undefined,
      });
    }
    const lichessError = params.get("lichessError");
    if (lichessError) {
      onLichessLoginError({ message: lichessError });
    }
  }, [location.search]);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background gradient with a chess board pattern overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-chess-dark/90 via-chess-dark to-chess-dark/90 z-0"></div>
      <div className="absolute inset-0 chess-board-bg opacity-15 z-0"></div>

      {/* Decorative blurred elements for dynamic visuals */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-chess-warning/10 rounded-full filter blur-3xl animate-pulse-soft"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-chess-accent/10 rounded-full filter blur-3xl animate-pulse-soft"></div>

      {/* Header with logo */}
      <header className="pt-6 px-6 md:px-12 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <Link to="/" className="flex items-center space-x-2">
              <Trophy className="h-8 w-8 text-chess-gold animate-pulse-soft" />
              <span className="text-xl font-bold tracking-tight text-white">
                <span className="text-chess-gold">Auto</span>
                <span>Match</span>
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow flex items-center justify-center px-6 py-12 relative z-10">
        <div className="prize-glow max-w-md w-full">
          <div className="prize-glow-content glass-card p-8 rounded-lg">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-shine mb-2">Sign In</h1>
              <p className="text-white/70">
                Welcome back! Sign in with your Lichess account to continue.
              </p>
              {/* <p className="text-white/70">
                Click the button below to log in with your Lichess account
              </p> */}
            </div>

            {message && (
              <div
                className={`p-3 rounded-md text-center mb-4 ${
                  message.includes("successful")
                    ? "bg-green-500/20 text-green-300"
                    : "bg-red-500/20 text-red-300"
                }`}
              >
                {message}
              </div>
            )}

            <Button
              onClick={handleLichessLogin}
              type="button"
              className="w-full bg-[#4a4a4a] hover:bg-[#3a3a3a] text-white font-medium flex items-center justify-center space-x-2"
              disabled={isLoading}
            >
              <svg className="h-5 w-5" viewBox="0 0 32 32" fill="none">
                <path
                  d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2zm4.714 24.5h-9.428v-4h9.428v4zm4.572-9.714H6.714V6.714h18.572v10.072z"
                  fill="white"
                />
              </svg>
              <span>Sign in with Lichess</span>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
