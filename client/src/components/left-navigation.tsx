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
    <div className="bg-white border-r border-gray-200 w-52">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-700">Navigation</h2>
      </div>

      {/* Navigation Items */}
      <div className="p-3">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <div key={item.id} className="relative">
              <button
                onClick={() => onSectionChange(item.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 mb-2 ${
                  isActive 
                    ? 'bg-blue-50 border border-blue-200' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className={`p-2 rounded-full ${
                  isActive ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <Icon className={`h-4 w-4 ${
                    isActive ? item.color : 'text-gray-500'
                  }`} />
                </div>
                <span className={`text-sm font-medium ${
                  isActive ? 'text-blue-700' : 'text-gray-600'
                }`}>
                  {item.label}
                </span>
                
                {/* Notification Badge */}
                {item.notifications > 0 && (
                  <span className="ml-auto w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {item.notifications}
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}