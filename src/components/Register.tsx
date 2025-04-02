import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Trophy } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import axios from "axios";

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }
    
    setIsLoading(true);
    setMessage("");

    try {
      // Only use email and password for registration
      const registerData = {
        email: formData.email,
        password: formData.password
      };

      console.log("🔍 Sending registration request with:", registerData);
      
      const response = await axios.post("http://localhost:3060/auth/register", registerData);

      if (response.status === 200) {
        console.log("✅ Registration successful!", response.data);
        setMessage("User created successfully!");
        
        // Reset form
        setFormData({
          email: "",
          password: "",
          confirmPassword: ""
        });
        
        // Redirect to login after success
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setMessage(response.data.message || "Failed to sign up.");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "🛑 Registration failed:",
          error.response?.data || error.message
        );
        setMessage(
          error.response?.data?.message || "Error connecting to the server."
        );
      } else {
        console.error("🛑 Registration failed:", error);
        setMessage("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Simplified OAuth handlers that share functionality with Login page
  const onGoogleLoginSuccess = async (credentialResponse: CredentialResponse) => {
    console.log("✅ Google authentication successful!", credentialResponse);
    try {
      // Send the credential to your backend - same endpoint as login
      const res = await axios.post("http://localhost:3060/auth/google", credentialResponse);
      console.log("Google authentication success!", res.data);

      // Store tokens and user data
      if (res.data.accessToken) {
        localStorage.setItem("token", res.data.accessToken);
        localStorage.setItem("user", JSON.stringify(res.data.email));
        
        // Store email separately for navbar
        if (res.data.email) {
          localStorage.setItem("email", res.data.email);
        }
        
        // Redirect to home page
        navigate("/");
      } else {
        console.warn("No accessToken received from backend!");
        setMessage("Authentication failed. Please try again.");
      }
    } catch (error) {
      console.log("Google authentication error!", error);
      setMessage("Google authentication failed. Please try again.");
    }
  };

  const onGoogleLoginError = () => {
    console.error("🛑 Google authentication failed!");
    setMessage("Google authentication failed. Please try again or use email registration.");
  };

  const handleLichessAuth = () => {
    // Redirect to the lichess login endpoint - same as login
    window.location.href = "http://localhost:3060/auth/lichess/login";
  };

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
              <h1 className="text-3xl font-bold text-shine mb-2">Create Account</h1>
              <p className="text-white/70">Join AutoMatch and start competing today</p>
            </div>

            {/* Message display */}
            {message && (
              <div className={`p-3 rounded-md text-center mb-4 ${message.includes("successful") ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}`}>
                {message}
              </div>
            )}

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
                <label htmlFor="password" className="block text-sm font-medium text-white/90">
                  Password
                </label>
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
                <p className="text-xs text-white/50 mt-1">
                  Must be at least 8 characters with a number and special character
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/90">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
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
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-chess-dark px-4 text-sm text-white/50">OR CONTINUE WITH</span>
              </div>
            </div>

            {/* OAuth Buttons - Simplified but kept */}
            <div className="space-y-3 mb-6">
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: "10px",
                }}
              >
                <GoogleLogin
                  onSuccess={onGoogleLoginSuccess}
                  onError={onGoogleLoginError}
                  theme="outline"
                  size="large"
                  width="400"
                />
              </div>
              
              <Button 
                onClick={handleLichessAuth} 
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

            <div className="mt-6 text-center">
              <p className="text-white/70">
                Already have an account?{" "}
                <Link to="/login" className="text-chess-gold hover:text-chess-gold/80 font-medium">
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