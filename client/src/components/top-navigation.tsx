import { MessageSquare, Users, Compass, User, Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";

interface TopNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function TopNavigation({ activeSection, onSectionChange }: TopNavigationProps) {
  const { user } = useAuth();

  const navigationItems = [
    { id: "chat", icon: MessageSquare, label: "Chat", notifications: 3 },
    { id: "communities", icon: Users, label: "Communities", notifications: 0 },
    { id: "discovery", icon: Compass, label: "Discovery", notifications: 0 },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-bold">V</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Verser
              </h1>
            </div>
          </div>

          {/* Main Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <div key={item.id} className="relative">
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    onClick={() => onSectionChange(item.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      isActive 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                    {item.notifications > 0 && (
                      <span className="ml-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {item.notifications}
                      </span>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search posts, communities, users..."
                className="pl-10 pr-4 py-2 w-full bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-300 rounded-full"
              />
            </div>
          </div>

          {/* Right Section - Notifications and Profile */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative p-2">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                2
              </span>
            </Button>

            {/* Profile */}
            <Button
              variant={activeSection === "profile" ? "default" : "ghost"}
              onClick={() => onSectionChange("profile")}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                activeSection === "profile" 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                  : 'hover:bg-gray-100'
              }`}
            >
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.username}
                  className="h-6 w-6 rounded-full object-cover"
                />
              ) : (
                <User className="h-5 w-5" />
              )}
              <span className="hidden sm:block font-medium">{user?.username}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-200 bg-white">
        <div className="flex items-center justify-around py-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => onSectionChange(item.id)}
                className={`flex flex-col items-center space-y-1 px-4 py-2 ${
                  isActive ? 'text-blue-600' : 'text-gray-600'
                }`}
              >
                <div className="relative">
                  <Icon className="h-5 w-5" />
                  {item.notifications > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {item.notifications}
                    </span>
                  )}
                </div>
                <span className="text-xs">{item.label}</span>
              </Button>
            );
          })}
          <Button
            variant="ghost"
            onClick={() => onSectionChange("profile")}
            className={`flex flex-col items-center space-y-1 px-4 py-2 ${
              activeSection === "profile" ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <User className="h-5 w-5" />
            <span className="text-xs">Profile</span>
          </Button>
        </div>
      </div>
    </nav>
  );
}