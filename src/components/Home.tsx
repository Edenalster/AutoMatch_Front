import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Hero from "./Hero";
import FeatureSection from "./FeatureSection";
import PrizePool from "./PrizePool";

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const userId = params.get("userId");
    const lichessId = params.get("lichessId");

    if (token && userId) {
      localStorage.setItem("token", token);
      localStorage.setItem("user", userId);
      localStorage.setItem("lichessId", lichessId || "");

      // Optionally, remove query params and redirect to dashboard
      navigate("/dashboard", { replace: true });
    }
  }, [location, navigate]);

  return (
    <>
      <Navbar showItems={true} />
      <Hero />
      <FeatureSection />
      <PrizePool />
      {}
    </>
  );
};

export default Home;
