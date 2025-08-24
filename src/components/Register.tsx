import React from "react";
import { Button } from "../components/ui/button";
import { Trophy } from "lucide-react";
import { Link } from "react-router-dom";

const Register: React.FC = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleLichessAuth = () => {
    window.location.href = `${backendUrl}/auth/lichess/login`;
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-chess-dark/90 via-chess-dark to-chess-dark/90 z-0"></div>
      <div className="absolute inset-0 chess-board-bg opacity-15 z-0"></div>

      {/* Visuals */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-chess-warning/10 rounded-full filter blur-3xl animate-pulse-soft"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-chess-accent/10 rounded-full filter blur-3xl animate-pulse-soft"></div>

      {/* Header */}
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
              <h1 className="text-3xl font-bold text-shine mb-2">
                Create Account
              </h1>
              <p className="text-white/70">
                To compete or create tournaments, sign in with your Lichess
                account
              </p>
            </div>

            {/* Lichess Auth Button */}
            <Button
              onClick={handleLichessAuth}
              type="button"
              className="w-full bg-[#4a4a4a] hover:bg-[#3a3a3a] text-white font-medium flex items-center justify-center space-x-2"
            >
              <svg className="h-5 w-5" viewBox="0 0 32 32" fill="none">
                <path
                  d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2zm4.714 24.5h-9.428v-4h9.428v4zm4.572-9.714H6.714V6.714h18.572v10.072z"
                  fill="white"
                />
              </svg>
              <span>Continue with Lichess</span>
            </Button>

            {/* CTA to create Lichess account */}
            <div className="mt-4 text-center">
              <p className="text-white/70 text-sm">
                Don’t have a Lichess account?{" "}
                <a
                  href="https://lichess.org/signup"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-chess-gold hover:text-chess-gold/80 font-medium underline"
                >
                  Create one here
                </a>
              </p>
            </div>

            <div className="mt-6 text-center">
              <p className="text-white/70">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-chess-gold hover:text-chess-gold/80 font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Register;
