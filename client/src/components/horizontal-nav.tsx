import { useState, useEffect } from "react";
import { MessageSquare, Users, Compass, User, Bell, Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HorizontalNavProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function HorizontalNav({ activeSection, onSectionChange }: HorizontalNavProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  // Auto-hide after 3 seconds of no interaction
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExpanded(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [isExpanded]);

  const navigationItems = [
    { id: "chat", icon: MessageSquare, label: "Chat", color: "text-blue-500", notifications: 3 },
    { id: "communities", icon: Users, label: "Communities", color: "text-green-500", notifications: 0 },
    { id: "discovery", icon: Compass, label: "Discovery", color: "text-purple-500", notifications: 0 },
    { id: "profile", icon: User, label: "Profile", color: "text-gray-600", notifications: 1 },
  ];

  const notifications = [
    { id: 1, type: "message", text: "New message from Sarah", time: "2m ago" },
    { id: 2, type: "like", text: "John liked your post", time: "5m ago" },
    { id: 3, type: "follow", text: "Emma started following you", time: "10m ago" },
  ];

  return (
    <div className="fixed top-4 left-4 z-50">
      {/* Main Horizontal Navigation */}
      <div 
        className={`bg-white/95 backdrop-blur-sm border border-gray-200 rounded-full shadow-lg transition-all duration-300 ${
          isExpanded ? 'px-6 py-3' : 'px-3 py-2'
        }`}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => {
          // Only auto-collapse if not actively using notifications
          if (!showNotifications) {
            setTimeout(() => setIsExpanded(false), 2000);
          }
        }}
      >
        <div className="flex items-center gap-2">
          {/* Menu Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0 rounded-full"
          >
            {isExpanded ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>

          {/* Navigation Items */}
          {isExpanded && navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <div key={item.id} className="relative">
                <button
                  onClick={() => onSectionChange(item.id)}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-200 ${
                    isActive 
                      ? 'bg-blue-50 border border-blue-200' 
                      : 'hover:bg-gray-50'
                  }`}
                  title={item.label}
                >
                  <Icon className={`h-4 w-4 ${
                    isActive ? item.color : 'text-gray-500'
                  }`} />
                  <span className={`text-sm font-medium ${
                    isActive ? 'text-blue-700' : 'text-gray-600'
                  }`}>
                    {item.label}
                  </span>
                  
                  {/* Notification Badge */}
                  {item.notifications > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {item.notifications}
                    </span>
                  )}
                </button>
              </div>
            );
          })}

          {/* Notification Bell */}
          {isExpanded && (
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative h-8 w-8 p-0 rounded-full"
              >
                <Bell className="h-4 w-4 text-gray-600" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications.length}
                </span>
              </Button>
            </div>
          )}

          {/* Search Button */}
          {isExpanded && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-full"
            >
              <Search className="h-4 w-4 text-gray-600" />
            </Button>
          )}
        </div>
      </div>

      {/* Notifications Dropdown */}
      {showNotifications && isExpanded && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {notifications.map((notification) => (
              <div key={notification.id} className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-b-0">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{notification.text}</p>
                    <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-4 py-2 border-t border-gray-100">
            <button className="text-sm text-blue-600 hover:text-blue-700">
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}