"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import Navbar from "../components/Navbar";

const ChessBoard = () => {
  const [searchParams] = useSearchParams();
  const gameUrl = searchParams.get("gameUrl");
  const [popupOpened, setPopupOpened] = useState(false);

  useEffect(() => {
    console.log("🎯 Received gameUrl:", gameUrl);
  }, [gameUrl]);

  const handleOpenGame = () => {
    if (!gameUrl) return;

    const win = window.open(
      gameUrl,
      "_blank",
      "width=1024,height=768,noopener,noreferrer"
    );

    if (!win) {
      alert("⚠️ Please allow popups to play your match.");
    } else {
      setPopupOpened(true);
    }
  };

  if (!gameUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white text-lg">
        ❌ No game URL provided. Make sure your match is ready.
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-background text-white overflow-hidden">
      {/* Background gradient with a chess board pattern overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-chess-dark/90 via-chess-dark to-chess-dark/90 z-0"></div>
      <div className="absolute inset-0 chess-board-bg opacity-15 z-0"></div>

      {/* Decorative blurred elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-chess-gold/10 rounded-full filter blur-3xl animate-pulse-soft"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-chess-secondary/10 rounded-full filter blur-3xl animate-pulse-soft"></div>

      <Navbar showItems={false} />

      {/* Content */}
      <div className="relative z-10 text-center px-6">
        <h1 className="text-3xl font-bold mb-4">Your Match is Ready</h1>
        <p className="text-white/70 mb-8">
          Click the button below to open your game in a new window.
        </p>

        <Button onClick={handleOpenGame} className="text-lg px-6 py-3">
          {popupOpened ? "✅ Game Opened" : "Play Now"}
        </Button>

        {popupOpened && (
          <p className="mt-6 text-chess-gold font-medium">
            Good luck! You can return here after your match.
          </p>
        )}
      </div>
    </div>
  );
};

export default ChessBoard;
