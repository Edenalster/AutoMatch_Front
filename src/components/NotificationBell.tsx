import React, { useEffect, useState } from "react";
import { BellDot } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";

const NotificationBell: React.FC = () => {
  const [notification, setNotification] = useState<{
    message: string;
    link: string;
  } | null>(null);
  const hasNotification = !!notification;
  const navigate = useNavigate();

  useEffect(() => {
    // Initial load from localStorage
    const stored = localStorage.getItem("pendingNotification");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.message && parsed.link) {
          setNotification(parsed);
        }
      } catch {
        setNotification(null);
      }
    }

    // ✅ Listen for live updates from Navbar
    const handleNotificationUpdate = (e: any) => {
      console.log("📥 NotificationBell received update:", e.detail);
      if (e.detail?.message && e.detail?.link) {
        setNotification(e.detail);
      }
    };

    window.addEventListener("notification-update", handleNotificationUpdate);

    return () => {
      window.removeEventListener(
        "notification-update",
        handleNotificationUpdate
      );
    };
  }, []);
  // ✅ Listen to localStorage changes from other parts of app
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "pendingNotification") {
        if (e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            if (parsed.message && parsed.link) {
              setNotification(parsed);
            }
          } catch {
            setNotification(null);
          }
        } else {
          setNotification(null);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "pendingNotification" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed.message && parsed.link) {
            setNotification(parsed);
          }
        } catch {
          setNotification(null);
        }
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const clearNotifications = () => {
    localStorage.removeItem("pendingNotification");
    setNotification(null);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-white/80 hover:text-chess-gold transition-colors hover:bg-yellow-700"
        >
          <BellDot className="h-5 w-5" />
          {hasNotification && (
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-chess-gold" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[300px]">
        <div className="flex items-center justify-between px-3 pt-2">
          <DropdownMenuLabel className="font-semibold">
            Notifications
          </DropdownMenuLabel>
          {hasNotification && (
            <button
              onClick={clearNotifications}
              className="text-xs text-red-500 hover:underline"
            >
              Clear All
            </button>
          )}
        </div>
        <DropdownMenuSeparator />

        {notification ? (
          <DropdownMenuItem className="cursor-pointer py-3 flex flex-col gap-1">
            <span className="font-medium">{notification.message}</span>
            <button
              className="text-xs text-blue-600 underline text-left"
              onClick={() => {
                const id = notification.link.split("/").pop();
                localStorage.removeItem("pendingNotification");
                setNotification(null); // Update state too
                navigate(`/lobby/${id}`);
              }}
            >
              Join your game lobby
            </button>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem className="text-center py-3" disabled>
            No new notifications
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;
