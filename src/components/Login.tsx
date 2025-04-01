import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Trophy } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    console.log("🔍 Sending login request with:", formData);

    try {
      const response = await axios.post("http://localhost:3060/auth/login", formData);

      if (response.status === 200) {
        const data = response.data;
        console.log("✅ Login successful!", data);

        // Store tokens and user ID in localStorage
        if (data.accessToken) {
          localStorage.setItem("token", data.accessToken);
          localStorage.setItem("user", data._id);
        } else {
          console.error("🛑 No accessToken received from backend!");
        }

        setMessage("Login successful!");
        setTimeout(() => navigate("/"), 2000); // Redirect to home page
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "🛑 Login failed:",
          error.response?.data || error.message
        );
        setMessage(
          error.response?.data?.message ||
            "Login Failed. Incorrect Email or Password."
        );
      } else {
        console.error("🛑 Login failed:", error);
        setMessage("Failed to log in.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLichessSignIn = () => {
    // Add a redirect parameter or use localStorage to track the intended redirect
    localStorage.setItem('authRedirect', '/'); // Set home page as redirect target
    
    // Redirect to the lichess login endpoint
    window.location.href = "http://localhost:3060/auth/lichess/login";
  };

  const handleGoogleSignIn = () => {
    setMessage("Google sign-in is not implemented yet");
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background gradient with a chess board pattern overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-chess-dark/90 via-chess-dark to-chess-dark/90 z-0"></div>
      <div className="absolute inset-0 chess-board-bg opacity-15 z-0"></div>
      
      {/* Decorative blurred elements for dynamic visuals */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-chess-gold/10 rounded-full filter blur-3xl animate-pulse-soft"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-chess-secondary/10 rounded-full filter blur-3xl animate-pulse-soft"></div>

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
              <h1 className="text-3xl font-bold text-shine mb-2">Welcome Back</h1>
              <p className="text-white/70">Sign in to your AutoMatch account</p>
            </div>

            {/* Message display */}
            {message && (
              <div className={`p-3 rounded-md text-center mb-4 ${message.includes("successful") ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}`}>
                {message}
              </div>
            )}

            {/* OAuth Buttons */}
            <div className="space-y-3 mb-6">
              <Button 
                onClick={handleGoogleSignIn} 
                type="button" 
                className="w-full bg-white hover:bg-white/90 text-gray-800 font-medium flex items-center justify-center space-x-2"
                disabled={isLoading}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span>Continue with Google</span>
              </Button>
              <Button 
                onClick={handleLichessSignIn} 
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
                <span>Continue with Lichess</span>
              </Button>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-chess-dark px-4 text-sm text-white/50">or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-white/90">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="your@email.com"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-white/90">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-sm text-chess-gold hover:text-chess-gold/80">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  disabled={isLoading}
                />
              </div>

              <Button 
                type="submit" 
                className="primary-btn w-full"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-white/70">
                Don't have an account?{" "}
                <Link to="/register" className="text-chess-gold hover:text-chess-gold/80 font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
};

export default Login;