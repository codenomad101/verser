import { useState } from "react";
import { MessageSquare, Users, Compass, User, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LeftNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function LeftNavigation({ activeSection, onSectionChange }: LeftNavigationProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigationItems = [
    { id: "chat", icon: MessageSquare, label: "Chat", color: "text-blue-500", notifications: 3 },
    { id: "communities", icon: Users, label: "Communities", color: "text-green-500", notifications: 0 },
    { id: "discovery", icon: Compass, label: "Discovery", color: "text-purple-500", notifications: 0 },
    { id: "profile", icon: User, label: "Profile", color: "text-gray-600", notifications: 1 },
  ];

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white border-r border-blue-200 w-52 shadow-lg">
      {/* Verser Branding Header */}
      <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="text-lg font-bold">V</span>
          </div>
          <h1 className="text-lg font-bold tracking-wide">Verser</h1>
        </div>
        <p className="text-blue-100 text-xs mt-1">Connect • Discover • Share</p>
      </div>

      {/* Navigation Items */}
      <div className="p-3 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <div key={item.id} className="relative">
              <button
                onClick={() => onSectionChange(item.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                    : 'hover:bg-white hover:shadow-md bg-blue-25'
                }`}
              >
                <div className={`p-2 rounded-xl ${
                  isActive ? 'bg-white/20' : 'bg-gradient-to-br from-blue-100 to-purple-100'
                }`}>
                  <Icon className={`h-4 w-4 ${
                    isActive ? 'text-white' : item.color
                  }`} />
                </div>
                <span className={`text-sm font-semibold ${
                  isActive ? 'text-white' : 'text-gray-700'
                }`}>
                  {item.label}
                </span>
                
                {/* Notification Badge */}
                {item.notifications > 0 && (
                  <div className="ml-auto relative">
                    <span className="w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg animate-pulse">
                      {item.notifications}
                    </span>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-ping"></div>
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}