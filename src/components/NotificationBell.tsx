import React from "react";
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

interface Props {
  tournamentLink: string | null;
}

const NotificationBell: React.FC<Props> = ({ tournamentLink }) => {
  const hasNotification = Boolean(tournamentLink);

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
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {hasNotification ? (
          <DropdownMenuItem className="cursor-pointer py-3">
            <div className="flex flex-col gap-1">
              <span className="font-medium">🎯 Room Ready</span>
              <a
                href={tournamentLink!}
                className="text-xs text-blue-600 underline"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  localStorage.removeItem("pendingTournamentLink");
                }}
              >
                Join your game lobby
              </a>
            </div>
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
