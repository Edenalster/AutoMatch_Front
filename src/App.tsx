import React from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import LiveTournaments from "./components/LiveTournaments";
import FeatureSection from "./components/FeatureSection";
import PrizePool from "./components/PrizePool";

const App: React.FC = () => {
  return (
    <div>
      <Navbar />
      <Hero />
      <LiveTournaments />
      <FeatureSection />
      <PrizePool />
    </div>
  );
};

export default App;
