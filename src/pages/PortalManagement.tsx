import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { TooltipProvider } from "../components/ui/tooltip";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "../components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Bell, LayoutDashboard, Users, Calendar, CreditCard } from "lucide-react";
import Navbar from "../components/Navbar";

const PortalManagement = () => {
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    name: "",
    role: "User",      // ברירת מחדל תצוגתית
    avatarUrl: "",
    email: "",
  });
  const [loading, setLoading] = useState(true);   // לטובת gating עד שנדע role

  useEffect(() => {
    const storedEmail  = localStorage.getItem("email") || "";
    const lichessId    = localStorage.getItem("lichessId") || "";
    const userJson     = localStorage.getItem("user");
    const userId       = localStorage.getItem("userId") || localStorage.getItem("_id") || "";
    const accessToken  = localStorage.getItem("accessToken") || localStorage.getItem("token") || "";

    let displayName = "Player";
    let email = "";
    let avatarUrl = "";

    try {
      if (lichessId) {
        displayName = lichessId;
      } else if (storedEmail) {
        displayName = storedEmail.split("@")[0];
        email = storedEmail;
      } else if (userJson) {
        const parsed = JSON.parse(userJson);
        if (typeof parsed === "string" && parsed.includes("@")) {
          displayName = parsed.split("@")[0];
          email = parsed;
        } else if (parsed?.email) {
          displayName = parsed.email.split("@")[0];
          email = parsed.email;
          // בבקאנד השדה נקרא imgUrl, ננסה גם avatarUrl ליתר בטחון
          avatarUrl = parsed.imgUrl ?? parsed.avatarUrl ?? "";
        }
      }
    } catch {}

    // סט ראשוני
    setUserData((prev) => ({ ...prev, name: displayName, email, avatarUrl }));

    // שליפת תפקיד מהשרת
    (async () => {
      try {
        if (!userId) {
          // אין משתמש — נחזיר לדף הבית/לוגין
          navigate("/");
          return;
        }

        const base = import.meta.env.VITE_API_BASE_URL || "";
        const res = await fetch(`${base}/auth/user/${userId}/role`, {
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        });

        if (!res.ok) {
          // לא מורשה או שגיאה — נחזיר הביתה
          navigate("/");
          return;
        }

        const data = await res.json(); // { role: "admin" | "user" }
        const pretty = data.role === "admin" ? "Admin" : "User";

        setUserData((prev) => ({ ...prev, role: pretty }));

        // ✅ Gating: רק אדמין נכנס לפורטל
        if (data.role !== "admin") {
          navigate("/"); // או עמוד אחר (למשל /dashboard רגיל)
          return;
        }
      } catch (e) {
        navigate("/");
        return;
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  if (loading) {
    // ספינר קטן בזמן בדיקת הרשאות
    return (
      <div className="min-h-screen bg-chess-dark flex items-center justify-center text-white/80">
        Checking permissions…
      </div>
    );
  }

  // אם הגענו לכאן — המשתמש אדמין
  return (
    <div className="min-h-screen bg-chess-dark">
      <Navbar showItems={false} />

      <TooltipProvider>
        <SidebarProvider defaultOpen={true}>
          <div className="flex w-full min-h-[calc(100vh-80px)] pt-20">
            <Sidebar variant="floating" className="border-r border-white/10">
              <SidebarHeader className="px-2 py-10">
                <div className="flex items-center gap-2 px-2">
                  <Avatar className="h-8 w-8 border border-white/20">
                    <AvatarImage src={userData.avatarUrl} />
                    <AvatarFallback className="bg-chess-primary text-chess-dark">
                      {(userData.name && userData.name !== "Unknown"
                        ? userData.name.split(" ").map((n) => n[0]).join("")
                        : userData.email?.split("@")[0]?.[0] || "U"
                      ).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white">
                      {!userData.name || userData.name === "Unknown"
                        ? userData.email.split("@")[0]
                        : userData.name}
                    </span>
                    <span className="text-xs text-white/60">{userData.role}</span>
                  </div>
                </div>
              </SidebarHeader>

              <SidebarContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Dashboard">
                      <a href="/portal/dashboard" className="flex items-center gap-3 py-2">
                        <LayoutDashboard size={18} />
                        <span>Dashboard</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Users">
                      <a href="/portal/users" className="flex items-center gap-3">
                        <Users size={18} />
                        <span>Users</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Tournaments">
                      <a href="/portal/tournaments" className="flex items-center gap-3">
                        <Calendar size={18} />
                        <span>Tournaments</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Transactions">
                      <a href="/portal/transactions" className="flex items-center gap-3">
                        <CreditCard size={18} />
                        <span>Transactions</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarContent>

              <SidebarFooter className="p-4">
                <div className="glass-card-dark p-3 flex items-center gap-2">
                  <div className="size-8 rounded-full bg-chess-gold flex items-center justify-center">
                    <Bell className="size-4 text-chess-dark" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-white/70">Premium access</span>
                    <span className="text-sm font-medium text-white">Active</span>
                  </div>
                </div>
              </SidebarFooter>
            </Sidebar>

            <main className="flex-1 px-6 py-8 overflow-auto">
              <div className="flex items-center justify-between mb-6">
                <SidebarTrigger />
                <div className="flex items-center gap-2">
                  <Bell className="size-5 text-white/70 hover:text-white cursor-pointer transition-colors" />
                </div>
              </div>
              <h1 className="text-white text-xl font-semibold mb-4">
                Welcome, {(!userData.name || userData.name === "Unknown") ? userData.email.split("@")[0] : userData.name}
              </h1>
              <Outlet />
            </main>
          </div>
        </SidebarProvider>
      </TooltipProvider>
    </div>
  );
};

export default PortalManagement;
