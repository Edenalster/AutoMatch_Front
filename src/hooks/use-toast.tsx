import { useEffect } from "react";
import Navbar from "../components/Navbar";
import HeroSection from "../components/Hero";
import LiveTournaments from "../components/LiveTournaments";
import FeatureSection from "../components/FeatureSection";
import PrizePool from "../components/PrizePool";

const Index = () => {
  useEffect(() => {
    document.title = "AutoMatch - Chess Tournaments with Prize Pools";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar showItems={false} />
      <HeroSection />
      <LiveTournaments />
      <FeatureSection />
      <PrizePool />
    </div>
  );
};

export default Index;
