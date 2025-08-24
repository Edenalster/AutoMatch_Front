// AddFriendsDropdown.tsx
import React, { useState, useEffect, useRef } from "react";
import { Button } from "../components/ui/button";
import { UserPlus, Search, Users, Check, X, Clock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "../components/ui/dropdown-menu";
import { Input } from "../components/ui/input";

interface User {
  _id: string;
  lichessId?: string;
  email?: string;
  status: "none" | "friend" | "pending_sent" | "pending_received";
}

interface FriendRequest {
  _id: string;
  lichessId?: string;
  email?: string;
}

const AddFriendsDropdown: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"search" | "requests">("search");
  const previousRequestCount = useRef(0); // Add this line

  const API_BASE =
    process.env.REACT_APP_API_URL || "https://automatch.cs.colman.ac.il";

  // פונקציה לקבלת טוקן
  const getAuthToken = () => {
    return localStorage.getItem("token") || localStorage.getItem("accessToken");
  };

  // חיפוש משתמשים
  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(
        `${API_BASE}/auth/friends/search?query=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.users || []);
      } else {
        console.error("Failed to search users");
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error searching users:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // קבלת בקשות ממתינות
  const fetchPendingRequests = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(
        `${API_BASE}/auth/friends/pending-requests`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const currentCount = (data.requests || []).length;
        if (currentCount > previousRequestCount.current) {
          const audio = new Audio("/notification.mp3");
          audio.play().catch(() => {});
        }
        previousRequestCount.current = currentCount;

        setPendingRequests(data.requests || []);
      }
    } catch (error) {
      console.error("Error fetching pending requests:", error);
    }
  };

  // שליחת בקשת חברות
  const sendFriendRequest = async (targetUserId: string) => {
    try {
      const token = getAuthToken();
      console.log("🚀 Sending friend request:", {
        targetUserId,
        token: token ? "exists" : "missing",
      });

      const response = await fetch(`${API_BASE}/auth/friends/send-request`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetUserId }),
      });

      console.log("📊 Response status:", response.status);

      if (response.ok) {
        console.log("✅ Friend request sent successfully");
        // עדכון הסטטוס ברשימת התוצאות
        setSearchResults((prev) =>
          prev.map((user) =>
            user._id === targetUserId
              ? { ...user, status: "pending_sent" }
              : user
          )
        );
      } else {
        const errorText = await response.text();
        console.error(
          "❌ Failed to send friend request - Status:",
          response.status
        );
        console.error("❌ Error response:", errorText);

        try {
          const errorJson = JSON.parse(errorText);
          console.error("❌ Parsed error:", errorJson);
        } catch (e) {
          console.error("❌ Could not parse error as JSON");
        }
      }
    } catch (error) {
      console.error("❌ Network/Request error:", error);
    }
  };

  // אישור בקשת חברות
  const acceptFriendRequest = async (requesterId: string) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE}/auth/friends/accept-request`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requesterId }),
      });

      if (response.ok) {
        setPendingRequests((prev) =>
          prev.filter((req) => req._id !== requesterId)
        );
      }
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  // דחיית בקשת חברות
  const rejectFriendRequest = async (requesterId: string) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE}/auth/friends/reject-request`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requesterId }),
      });

      if (response.ok) {
        setPendingRequests((prev) =>
          prev.filter((req) => req._id !== requesterId)
        );
      }
    } catch (error) {
      console.error("Error rejecting friend request:", error);
    }
  };

  // חיפוש עם debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery && activeTab === "search") {
        searchUsers(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, activeTab]);

  // טעינת בקשות ממתינות כשנפתח הטאב
  useEffect(() => {
    if (activeTab === "requests") {
      fetchPendingRequests();
    }
  }, [activeTab]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "friend":
        return <Check className="h-4 w-4 text-green-500" />;
      case "pending_sent":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "pending_received":
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "friend":
        return "Friends";
      case "pending_sent":
        return "Pending";
      case "pending_received":
        return "Respond";
      default:
        return "";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative text-white/80 hover:text-white transition-colors hover:bg-yellow-700"
        >
          <UserPlus className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Add Friends</span>
          {pendingRequests.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {pendingRequests.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-80 p-0" align="end">
        <div className="p-4">
          {/* טאבים */}
          <div className="flex mb-4 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("search")}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === "search"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Search className="h-4 w-4 inline mr-1" />
              Search
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors relative ${
                activeTab === "requests"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Users className="h-4 w-4 inline mr-1" />
              Requests
              {pendingRequests.length > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {pendingRequests.length}
                </span>
              )}
            </button>
          </div>

          {/* תוכן הטאבים */}
          {activeTab === "search" && (
            <div>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by Lichess ID or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2">
                {isLoading ? (
                  <div className="text-center py-4 text-gray-500">
                    Searching...
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.lichessId || user.email || "Unknown User"}
                        </p>
                        {user.lichessId && user.email && (
                          <p className="text-xs text-gray-500 truncate">
                            {user.email}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(user.status)}
                        {user.status === "none" ? (
                          <Button
                            onClick={() => sendFriendRequest(user._id)}
                            size="sm"
                            className="text-xs"
                          >
                            Add
                          </Button>
                        ) : (
                          <span className="text-xs text-gray-500">
                            {getStatusText(user.status)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : searchQuery ? (
                  <div className="text-center py-4 text-gray-500">
                    No users found
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    Start typing to search for friends
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "requests" && (
            <div className="max-h-64 overflow-y-auto space-y-2">
              {pendingRequests.length > 0 ? (
                pendingRequests.map((request) => (
                  <div
                    key={request._id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {request.lichessId || request.email || "Unknown User"}
                      </p>
                      {request.lichessId && request.email && (
                        <p className="text-xs text-gray-500 truncate">
                          {request.email}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        onClick={() => acceptFriendRequest(request._id)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button
                        onClick={() => rejectFriendRequest(request._id)}
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No pending friend requests
                </div>
              )}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AddFriendsDropdown;
