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
import BracketTournament from "./pages/BracketTournament";
import AfterGame from "./pages/AfterGame";
import SearchResults from "./pages/SearchResults"
import PortalManagement from "./pages/PortalManagement"
import PortalDashboard from './pages/PortalDashboard'
import PortalTournaments from './pages/PortalTournaments'
import PortalUsers from './pages/PortalUsers'
import AddFunds from './pages/AddFunds'
import MyTournaments from "./pages/MyTournaments";

import PortalTransactions from './pages/PortalTransactions'
import PortalUserDetail from './pages/PortalUserDetail'
import TournamentLiveStream from './pages/TournamentLiveStream'
import { io } from "socket.io-client";


// A simple auth check for demo purposes
const isLoggedIn = () => {
  // In a real app, check localStorage or context for authentication
  return false; // For demo purposes, always return false
};
const socket = io(import.meta.env.VITE_BACKEND_URL, {
  transports: ["websocket"], // force websocket first
});

(window as any).socket = socket;
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
        <Route path="/search-results" element={<SearchResults />} />
        <Route path="/create-tournament" element={<CreateTournament />} />
        <Route path="/lobby/:id" element={<GameLobby />} />
        <Route path="/chess-board" element={<ChessBoard />} />
        <Route path="/chessboard" element={<ChessBoard />} />
        <Route path="/bracket/:id" element={<BracketTournament />} />
        <Route path="/after-game" element={<AfterGame />} />
        <Route path="/add-funds" element={<AddFunds />} />
        <Route path="/live/tournaments/:tournamentId/stream" element={<TournamentLiveStream />} />
        <Route path="/my-tournaments" element={<MyTournaments />} /> {/* ✅ חדש */}
        <Route path="/portal" element={<PortalManagement />}>
          <Route path="dashboard" element={<PortalDashboard />} />
          <Route path="users" element={<PortalUsers />} />
          <Route path="tournaments" element={<PortalTournaments />} />
          <Route path="transactions" element={<PortalTransactions />} />
          <Route path="users/:lichessId" element={<PortalUserDetail />} />


        </Route>
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
