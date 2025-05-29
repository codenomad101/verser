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
    { id: "chat", icon: MessageSquare, label: "Chat", color: "text-blue-500" },
    { id: "communities", icon: Users, label: "Communities", color: "text-green-500" },
    { id: "discovery", icon: Compass, label: "Discovery", color: "text-purple-500" },
    { id: "profile", icon: User, label: "Profile", color: "text-gray-600" },
  ];

  return (
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-48'
    }`}>
      {/* Header with collapse toggle */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        {!isCollapsed && (
          <h2 className="text-sm font-semibold text-gray-700">Navigation</h2>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-6 w-6 p-0"
        >
          {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </Button>
      </div>

      {/* Navigation Items */}
      <div className="p-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-50 border border-blue-200' 
                  : 'hover:bg-gray-50'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <div className={`p-1.5 rounded-full ${
                isActive ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                <Icon className={`h-3 w-3 ${
                  isActive ? item.color : 'text-gray-500'
                }`} />
              </div>
              {!isCollapsed && (
                <span className={`text-sm font-medium ${
                  isActive ? 'text-blue-700' : 'text-gray-600'
                }`}>
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}