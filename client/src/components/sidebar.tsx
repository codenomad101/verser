import { useQuery } from "@tanstack/react-query";
import { MessageSquare, Users, Compass, Bookmark, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeSection: "chat" | "communities" | "discovery";
  onSectionChange: (section: "chat" | "communities" | "discovery") => void;
  currentUser: { id: number; username: string };
}

export default function Sidebar({ activeSection, onSectionChange, currentUser }: SidebarProps) {
  const { data: user } = useQuery({
    queryKey: ["/api/users", currentUser.id],
  });

  const { data: conversations } = useQuery({
    queryKey: ["/api/conversations"],
  });

  const { data: communities } = useQuery({
    queryKey: ["/api/communities"],
  });

  const navItems = [
    {
      id: "chat" as const,
      icon: MessageSquare,
      label: "Conversations",
      badge: conversations?.length || 0,
      badgeColor: "bg-purple-500",
      activeColor: "bg-purple-50 text-purple-700"
    },
    {
      id: "communities" as const,
      icon: Users,
      label: "Communities",
      badge: communities?.length || 0,
      badgeColor: "bg-blue-500",
      activeColor: "bg-blue-50 text-blue-700"
    },
    {
      id: "discovery" as const,
      icon: Compass,
      label: "Discover",
      badge: "New",
      badgeColor: "bg-green-500",
      activeColor: "bg-green-50 text-green-700"
    }
  ];

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-gray-200">
      {/* Logo and Brand */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center">
            <MessageSquare className="text-white h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">ConnectHub</h1>
            <p className="text-xs text-gray-500">Social Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                "w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors",
                isActive 
                  ? item.activeColor
                  : "text-gray-600 hover:bg-gray-50"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
              <span className={cn(
                "ml-auto text-white text-xs px-2 py-1 rounded-full",
                item.badgeColor
              )}>
                {item.badge}
              </span>
            </button>
          );
        })}
        
        <div className="pt-4 border-t border-gray-100 mt-4">
          <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors">
            <Bookmark className="w-5 h-5" />
            <span className="font-medium">Saved</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors">
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </button>
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
          <div className="relative">
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.username} 
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                {currentUser.username.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="online-indicator absolute"></div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.username || currentUser.username}
            </p>
            <p className="text-xs text-gray-500 truncate">Online</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
