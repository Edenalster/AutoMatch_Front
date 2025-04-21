import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import LiveTournaments from "./components/LiveTournaments";
import FeatureSection from "./components/FeatureSection";
import PrizePool from "./components/PrizePool";
import Login from "./components/Login";
import Register from "./components/Register";
import AntiCheat from "./components/AntiCheatSection";
import Profile from "./pages/profile";
import FindMatch from "./pages/FindMatch";
import CreateTournament from "./pages/CreateTournament";
import GameLobby from "./pages/GameLobby";
import ChessBoard from "./pages/ChessBoard";

// A simple auth check for demo purposes
const isLoggedIn = () => {
  // In a real app, check localStorage or context for authentication
  return false; // For demo purposes, always return false
};

const Home: React.FC = () => {
  return (
    <>
      <Navbar showItems={true} />
      <Hero />
      <LiveTournaments />
      <FeatureSection />
      <PrizePool />
    </>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/anti-cheat" element={<AntiCheat />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/find-match" element={<FindMatch />} />
        <Route path="/create-tournament" element={<CreateTournament />} />
        <Route path="/lobby/:id" element={<GameLobby />} />
        <Route path="/chess-board" element={<ChessBoard />} />
        <Route path="/chessboard" element={<ChessBoard />} />
        {/* Protected routes - redirect to login if not authenticated */}
        <Route
          path="/play"
          element={
            isLoggedIn() ? (
              <div>Play Page (Coming Soon)</div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
};

export default App;
