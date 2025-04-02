import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Trophy } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import axios from "axios";

interface IUser {
  email: string;
  password?: string;
  imgUrl?: string;
  _id: string;
  accessToken?: string;
  refreshToken?: string;
}

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
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

    setIsLoading(true);
    setMessage("");

    try {
      console.log("🔍 Sending login request with:", formData); // Debugging

      // Store the email in localStorage so Navbar can use it
      localStorage.setItem("formEmail", formData.email);

      const response = await axios.post(
        "http://localhost:3060/auth/login",
        formData
      );

      if (response.status === 200) {
        const data = response.data;
        console.log("✅ Login successful!", data);

        // Store tokens and user ID in localStorage
        if (data.accessToken) {
          localStorage.setItem("token", data.accessToken);
          localStorage.setItem("user", data._id);
          
          // If the response includes the email, store it 
          if (data.email) {
            localStorage.setItem("email", data.email);
          } else {
            // Keep the form email if response doesn't include email
            localStorage.setItem("email", formData.email);
          }
        } else {
          console.error("🛑 No accessToken received from backend!");
        }

        setMessage("Login successful!");
        setTimeout(() => navigate("/"), 2000);
      } else {
        setMessage(response.data.message || "Failed to log in.");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "🛑 Login failed:",
          error.response?.data || error.message
        );
        setMessage("Invalid email or password.");
      } else {
        console.error("🛑 Login failed:", error);
        setMessage("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const googleSignin = async (
    credentialResponse: CredentialResponse
  ): Promise<IUser> => {
    try {
      console.log("Google Signin!");
      const res = await axios.post(
        "http://localhost:3060/auth/google",
        credentialResponse
      );
      console.log("Google Signin success!", res.data);

      // Store tokens and user data
      if (res.data.accessToken) {
        localStorage.setItem("token", res.data.accessToken);
        localStorage.setItem("user", JSON.stringify(res.data.email));
        
        // Also store email directly for the navbar
        if (res.data.email) {
          localStorage.setItem("email", res.data.email);
        }
      } else {
        console.warn("No accessToken received from backend!");
      }

      return res.data;
    } catch (error) {
      console.error("Google Signin error!", error);
      throw error;
    }
  };

  const onGoogleLoginSuccess = async (
    credentialResponse: CredentialResponse
  ) => {
    console.log("✅ Google login successful!", credentialResponse);
    try {
      const res = await googleSignin(credentialResponse);
      console.log("userID", res._id);
      console.log("Google Signin success!", res);
      navigate("/");
    } catch (error) {
      console.log("Google Signin error!", error);
      setMessage("Google sign-in failed. Please try again.");
    }
  };

  const onGoogleLoginError = () => {
    console.error("🛑 Google login failed!");
    setMessage("Google sign-in failed. Please try again or use email login.");
  };

  const handleLichessLogin = () => {
    // Redirect to the lichess login endpoint
    window.location.href = "http://localhost:3060/auth/lichess/login";
  };

  interface LichessLoginData {
    accessToken: string;
    userId: string;
    lichessId?: string;
  }

  const onLichessLoginSuccess = (data: LichessLoginData) => {
    console.log("✅ Lichess login successful!", data);
    if (data.accessToken) {
      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("user", data.userId);
      localStorage.setItem("lichessId", data.lichessId || "");
      navigate("/");
    } else {
      console.error("🛑 No accessToken received from Lichess!");
      setMessage("Lichess login failed. Please try again.");
    }
  };

  const onLichessLoginError = (error: { message: string }) => {
    console.error("🛑 Lichess login failed!", error);
    setMessage("Lichess login failed. Please try again.");
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
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
  }, []);

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
              <p className="text-white/70">Welcome back to AutoMatch</p>
            </div>

            {/* Message display */}
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

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-white/90"
                >
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
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-white/90"
                >
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
                <div className="flex justify-end">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-chess-gold hover:text-chess-gold/80"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                className="primary-btn w-full"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-chess-dark px-4 text-sm text-white/50">
                  OR CONTINUE WITH
                </span>
              </div>
            </div>

            {/* OAuth Buttons */}
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

            <div className="mt-6 text-center">
              <p className="text-white/70">
                Don't have an account yet?{" "}
                <Link
                  to="/register"
                  className="text-chess-gold hover:text-chess-gold/80 font-medium"
                >
                  Create account
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
