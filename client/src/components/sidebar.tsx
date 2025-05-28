import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { 
  MessageSquare, 
  Users, 
  Compass, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  User,
  Menu
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SidebarProps {
  activeSection: "chat" | "communities" | "discovery" | "profile";
  onSectionChange: (section: "chat" | "communities" | "discovery" | "profile") => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({ 
  activeSection, 
  onSectionChange, 
  isCollapsed, 
  onToggleCollapse 
}: SidebarProps) {
  const { user, logoutMutation } = useAuth();
  const [showSettings, setShowSettings] = useState(false);

  const menuItems = [
    { id: "chat" as const, icon: MessageSquare, label: "Chat", notifications: 3 },
    { id: "communities" as const, icon: Users, label: "Communities", notifications: 0 },
    { id: "discovery" as const, icon: Compass, label: "Discovery", notifications: 1 },
    { id: "profile" as const, icon: User, label: "Profile", notifications: 0 },
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h1 className="text-xl font-bold text-gray-900">
              <span className="text-blue-600">Verser</span>
            </h1>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="p-2"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* User Profile Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.avatar || ""} />
            <AvatarFallback>
              {user?.username?.slice(0, 2).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.username || "User"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.status === "online" ? "Online" : "Offline"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <Button
            key={item.id}
            variant={activeSection === item.id ? "default" : "ghost"}
            className={`w-full justify-start ${isCollapsed ? 'px-2' : 'px-3'}`}
            onClick={() => onSectionChange(item.id)}
          >
            <item.icon className="h-5 w-5" />
            {!isCollapsed && (
              <>
                <span className="ml-3">{item.label}</span>
                {item.notifications > 0 && (
                  <Badge variant="destructive" className="ml-auto text-xs">
                    {item.notifications}
                  </Badge>
                )}
              </>
            )}
            {isCollapsed && item.notifications > 0 && (
              <Badge variant="destructive" className="absolute top-1 right-1 text-xs w-2 h-2 p-0" />
            )}
          </Button>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-200">
        {isCollapsed ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full p-2">
                <Menu className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowSettings(true)}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="h-4 w-4" />
              <span className="ml-3">Settings</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              <span className="ml-3">Logout</span>
            </Button>
          </div>
        )}
      </div>

      {/* Settings Modal - We'll implement this later */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-lg font-semibold mb-4">Settings</h2>
            <p className="text-gray-600 mb-4">Settings panel coming soon...</p>
            <Button onClick={() => setShowSettings(false)}>Close</Button>
          </div>
        </div>
      )}
    </div>
  );
}