import React, { useState, useEffect } from "react";
import { cn } from "../lib/utils";
import { Button } from "../components/ui/button";
import { Trophy, Menu, X, UserRound, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "../components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import NotificationBell from "./NotificationBell";
import AddFriendsDropdown from "./AddFriendsDropdown"; 
import axios from "axios";

/**
 * Props for navigation link components.
 */
interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}

/**
 * Desktop navigation link component.
 */
const NavLink: React.FC<NavLinkProps> = ({ href, children }) => {
  return (
    <a
      href={href}
      className="text-white/80 hover:text-chess-gold transition-colors duration-200 font-medium relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:w-0 after:bg-chess-gold after:transition-all after:duration-300 hover:after:w-full "
    >
      {children}
    </a>
  );
};

/**
 * Mobile navigation link component.
 */
const MobileNavLink: React.FC<NavLinkProps> = ({ href, children, onClick }) => {
  return (
    <a
      href={href}
      onClick={onClick}
      className="text-white px-3 py-2 rounded-md hover:bg-white/5 transition-colors duration-200 font-medium"
    >
      {children}
    </a>
  );
};

/**
 * ProfileDropdown component renders a dropdown menu for authenticated users,
 * including a logout option.
 *
 * @param {object} props
 * @param {() => void} props.onLogout - Function to call when the user clicks the logout button.
 * @returns {JSX.Element} The Profile dropdown menu.
 */
interface ProfileDropdownProps {
  onLogout: () => void;
  user?: { admin?: boolean };
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  onLogout,
  user,
}) => {
  const [userDisplay, setUserDisplay] = useState("Player");
  const [userTag, setUserTag] = useState("");

  useEffect(() => {
    const lichessId = localStorage.getItem("lichessId");
    const email = localStorage.getItem("email");
    const userRaw = localStorage.getItem("user");

    console.log("Raw userJson from localStorage:", userRaw);

    if (lichessId) {
      setUserDisplay(lichessId);
      setUserTag(`@${lichessId}`);
      return;
    }

    if (email) {
      const emailPrefix = email.split("@")[0];
      setUserDisplay(emailPrefix);
      setUserTag(email);
      return;
    }

    if (!userRaw) return;

    try {
      const parsed = JSON.parse(userRaw);
      if (parsed && typeof parsed === "object" && parsed.email) {
        const emailPrefix = parsed.email.split("@")[0];
        setUserDisplay(emailPrefix);
        setUserTag(parsed.email);
        return;
      }
    } catch (err) {
      console.warn(
        "User is not a valid JSON object. Treating as fallback string."
      );
    }

    if (userRaw.includes("@")) {
      const emailPrefix = userRaw.split("@")[0];
      setUserDisplay(emailPrefix);
      setUserTag(userRaw);
      return;
    }

    const formEmail = localStorage.getItem("formEmail");
    if (formEmail?.includes("@")) {
      const emailPrefix = formEmail.split("@")[0];
      setUserDisplay(emailPrefix);
      setUserTag(formEmail);
      return;
    }

    if (/^[0-9a-f]{24}$/i.test(userRaw)) {
      setUserDisplay(userRaw.substring(0, 8) + "...");
    } else {
      setUserDisplay(userRaw);
    }
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full hover:bg-yellow-700"
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src="/placeholder.svg" alt="User" />
            <AvatarFallback className="bg-chess-gold/20 text-chess-gold">
              <UserRound className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal focus:bg-yellow-700">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userDisplay}</p>
            {userTag && (
              <p className="text-xs leading-none text-muted-foreground">
                {userTag}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer">
          <Link to="/profile" className="flex items-center w-full">
            <UserRound className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <Link to="/my-tournaments" className="flex items-center w-full">
            <Trophy className="mr-2 h-4 w-4" />
            <span>My Tournaments</span>
          </Link>
        </DropdownMenuItem>
        {user?.admin && (
          <DropdownMenuItem className="cursor-pointer">
            <Link to="/portal/dashboard" className="flex items-center w-full">
              <Trophy className="mr-2 h-4 w-4" />
              <span>Portal</span>
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={onLogout}
          className="cursor-pointer text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

/**
 * Navbar component that renders the navigation bar.
 */
interface NavbarProps {
  showItems: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ showItems }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Local state to manage login status
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [tournamentLink, setTournamentLink] = useState<string | null>(null);
  const [user, setUser] = useState<{ admin?: boolean }>({});
  console.log(tournamentLink);

useEffect(() => {
  const checkAdminStatus = async () => {
    try {
      // 1) ננסה להוציא userId מכל מקום אפשרי
      const userJson = localStorage.getItem("user");
      let userId: string | null = null;

      if (userJson) {
        try {
          const parsed = JSON.parse(userJson);
          if (parsed && typeof parsed === "object" && parsed._id) {
            userId = parsed._id;
          }
        } catch {}
      }

      // גיבויים נפוצים
      userId = userId
        || localStorage.getItem("userId")
        || localStorage.getItem("_id");

      // 2) אם אין לנו userId – אין מה לבדוק
      if (!userId) {
        setUser({ admin: false });
        return;
      }

      // 3) אם יש role שמור בלוקאל־סטורג’ – נשתמש בו מיד
      const storedRole = localStorage.getItem("role");
      if (storedRole) {
        setUser({ admin: storedRole.toLowerCase() === "admin" });
      }

      // 4) פניה לשרת – **ללא** תלות בטוקן (ה־endpoint גלוי)
      const response = await axios.get(
        `https://automatch.cs.colman.ac.il/auth/user/${userId}/role`
      );

      const roleFromServer = response?.data?.role;
      setUser({ admin: String(roleFromServer).toLowerCase() === "admin" });
    } catch (error) {
      console.error("❌ Error checking admin status:", error);
      setUser({ admin: false });
    }
  };

  checkAdminStatus();
}, []);


  interface LobbyFullPayload {
    tournamentName: string;
    lobbyUrl: string;
  }

  useEffect(() => {
    const socket = (window as any).socket;
    const lichessId = localStorage.getItem("lichessId");

    if (socket && lichessId && socket.connected) {
      console.log(`[Navbar] Emitting joinRoom globally: ${lichessId}`);
      socket.emit("joinRoom", lichessId);
    }

    socket?.on("connect", () => {
      if (lichessId) {
        console.log(`🔁 Reconnect — emitting joinRoom again: ${lichessId}`);
        socket.emit("joinRoom", lichessId);
      }
    });

    socket?.on(
      "lobbyFull",
      ({ tournamentName, lobbyUrl }: LobbyFullPayload) => {
        console.log(`🔔 [Navbar] Received lobbyFull: ${tournamentName}`);
        localStorage.setItem(
          "pendingNotification",
          JSON.stringify({
            message: `Tournament is about to start!`,
            link: lobbyUrl,
          })
        );
        window.dispatchEvent(
          new CustomEvent("notification-update", {
            detail: {
              message: `Tournament is about to start!`,
              link: lobbyUrl,
            },
          })
        );
      }
    );

    socket?.on(
      "tournamentInvite",
      ({
        from,
        tournamentName,
        lobbyUrl,
      }: {
        from: string;
        tournamentName: string;
        lobbyUrl: string;
      }) => {
        console.log(`📩 Invite from ${from} to "${tournamentName}"`);

        const notif = {
          message: `${from} invited you to a tournament`,
          link: lobbyUrl,
        };

        localStorage.setItem("pendingNotification", JSON.stringify(notif));

        // ✅ Notify NotificationBell
        setTimeout(() => {
          window.dispatchEvent(
            new CustomEvent("notification-update", { detail: notif })
          );
        }, 100); // Let NotificationBell mount first

        localStorage.setItem("pendingNotification", JSON.stringify(notif));
        window.dispatchEvent(
          new CustomEvent("notification-update", { detail: notif })
        );

        const audio = new Audio("/notification.mp3");
        audio.play().catch(() => {});
      }
    );

    return () => {
      socket?.off("lobbyFull");
      socket?.off("tournamentInvite");
    };
  }, []);

  // 👂 Listen for changes to the pending tournament invite
  useEffect(() => {
    const checkNotification = () => {
      const link = localStorage.getItem("pendingTournamentLink");
      setTournamentLink(link);
    };

    checkNotification();
    const interval = setInterval(checkNotification, 1000);
    return () => clearInterval(interval);
  }, []);

  // 🟢 Emit 'user_online' once on mount
  useEffect(() => {
    const socket = (window as any).socket;
    const lichessId = localStorage.getItem("lichessId");

    if (socket && lichessId) {
      socket.emit("user_online", { lichessId });
      console.log("📡 Emitted user_online for", lichessId);
    }
  }, []);

  // On component mount, check for an auth token in localStorage.
  useEffect(() => {
    // Check for token - look for either "token" or "accessToken" based on your auth implementation
    const token =
      localStorage.getItem("token") || localStorage.getItem("accessToken");
    setIsLoggedIn(!!token);

    // Add an event listener to track auth state changes
    const handleStorageChange = () => {
      const currentToken =
        localStorage.getItem("token") || localStorage.getItem("accessToken");
      setIsLoggedIn(!!currentToken);
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Listen for scroll events to update the navbar background.
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  /**
   * handleLogout clears the auth token and updates the login state.
   */
  const handleLogout = () => {
    // Remove all auth-related items from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("lichessId");
    localStorage.removeItem("email");

    // Update state to reflect logged out status
    setIsLoggedIn(false);
    setUser({ admin: false });
    window.location.href = 'https://automatch.cs.colman.ac.il/'; 

  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4 px-6 md:px-12",
        isScrolled
          ? "bg-chess-dark/80 backdrop-blur-md shadow-md border-b border-white/10"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <a
          className="flex items-center space-x-2"
          href="/"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <Trophy className="h-8 w-8 text-chess-gold animate-pulse-soft" />
          <span className="text-xl font-bold tracking-tight text-white">
            <span className="text-chess-gold">Auto</span>
            <span>Match</span>
          </span>
        </a>

        {/* Desktop Menu (hidden on mobile devices) */}
        <div className="hidden md:flex items-center space-x-6">
          {showItems ? (
            <>
              <NavLink href="#tournaments">Tournaments</NavLink>
              <NavLink href="#features">Features</NavLink>
              <NavLink href="#how-it-works">How It Works</NavLink>
            </>
          ) : (
            <>
              {/* הוספת לינק My Tournaments כשלא בדף הראשי */}
              {isLoggedIn && (
                <Link to="/my-tournaments">
                  <span className="text-white/80 hover:text-chess-gold transition-colors duration-200 font-medium relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:w-0 after:bg-chess-gold after:transition-all after:duration-300 hover:after:w-full">
                    My Tournaments
                  </span>
                </Link>
              )}
            </>
          )}

          {/* Action buttons for desktop */}
          <div className="flex items-center space-x-3 ml-4">
            <NotificationBell />

            {/* 🆕 הוספת AddFriendsDropdown - רק כשמחובר */}
            {isLoggedIn && <AddFriendsDropdown />}

            <Link to="/find-match">
              <Button className="primary-btn" size="sm">
                Play Now
              </Button>
            </Link>
            {isLoggedIn ? (
              // Show the profile dropdown ONLY when logged in
              <ProfileDropdown onLogout={handleLogout} user={user} />
            ) : (
              // Show login/register buttons when NOT logged in
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button
                    className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
                    size="sm"
                  >
                    Log In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
                    size="sm"
                  >
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Button (visible only on mobile devices) */}
        <div className="flex md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
            className="text-white"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-chess-dark/95 backdrop-blur-md shadow-lg animate-slide-down border-b border-white/10 p-4">
          <div className="flex flex-col space-y-4 py-2">
            {showItems ? (
              <>
                <MobileNavLink
                  href="#tournaments"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Tournaments
                </MobileNavLink>
                <MobileNavLink
                  href="#features"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Features
                </MobileNavLink>
                <MobileNavLink
                  href="#how-it-works"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  How It Works
                </MobileNavLink>
              </>
            ) : (
              <>
                {/* הוספת My Tournaments במובייל - רק כשמחובר */}
                {isLoggedIn && (
                  <Link
                    to="/my-tournaments"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="text-white px-3 py-2 rounded-md hover:bg-white/5 transition-colors duration-200 font-medium">
                      My Tournaments
                    </div>
                  </Link>
                )}
              </>
            )}

            <MobileNavLink
              href="#contact"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact
            </MobileNavLink>

            {/* 🆕 הוסף Add Friends גם במובייל - רק כשמחובר */}
            {isLoggedIn && (
              <div className="px-3 py-2 border-t border-white/10 pt-4">
                <AddFriendsDropdown />
              </div>
            )}

            {/* Action buttons for mobile */}
            <div className="grid grid-cols-2 gap-3 pt-3">
              <Link to="/find-match">
                <Button className="primary-btn w-full" size="sm">
                  Play Now
                </Button>
              </Link>
              {isLoggedIn ? (
                <Button
                  onClick={handleLogout}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 w-full"
                  size="sm"
                >
                  Log Out
                </Button>
              ) : (
                <div className="grid grid-cols-2 gap-3 col-span-1">
                  <Link to="/login" className="col-span-1">
                    <Button
                      className="bg-white/10 hover:bg-white/20 text-white border border-white/20 w-full"
                      size="sm"
                    >
                      Log In
                    </Button>
                  </Link>
                  <Link to="/register" className="col-span-1">
                    <Button
                      className="bg-white/10 hover:bg-white/20 text-white border border-white/20 w-full"
                      size="sm"
                    >
                      Register
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
