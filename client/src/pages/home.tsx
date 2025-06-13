import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import SimpleChat from "@/components/simple-chat";
import CommunitiesSection from "@/components/communities-section";
import DiscoverySection from "@/components/discovery-section";
import EnhancedDiscovery from "@/components/enhanced-discovery";
import ProfileSection from "@/components/profile-section";

import TopNavigation from "@/components/top-navigation";
import VerserPaySection from "@/components/verserpay-section";
import FoodSection from "@/components/food-section";
import TravelSection from "@/components/travel-section";
import { useWebSocket } from "@/lib/websocket";

type Section = "chat" | "communities" | "discovery" | "profile" | "verserpay" | "food" | "travel";

export default function Home() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<Section>("discovery");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Initialize WebSocket connection
  const { sendMessage, lastMessage, connectionStatus } = useWebSocket();

  useEffect(() => {
    if (connectionStatus === 'connected' && user) {
      sendMessage({
        type: 'join',
        userId: user.id
      });
    }
  }, [connectionStatus, sendMessage, user]);

  if (!user) {
    return null; // This should not happen due to ProtectedRoute
  }

  const currentUser = { id: user.id, username: user.username };

  const renderActiveSection = () => {
    switch (activeSection) {
      case "chat":
        return (
          <SimpleChat 
            currentUser={currentUser}
            lastMessage={lastMessage}
            sendMessage={sendMessage}
          />
        );
      case "communities":
        return <CommunitiesSection currentUser={currentUser} />;
      case "discovery":
        return <DiscoverySection currentUser={currentUser} />;
      case "verserpay":
        return <VerserPaySection currentUser={currentUser} />;
      case "food":
        return <FoodSection currentUser={currentUser} />;
      case "travel":
        return <TravelSection currentUser={currentUser} />;
      case "profile":
        return <ProfileSection currentUser={currentUser} />;
      default:
        return (
          <SimpleChat 
            currentUser={currentUser}
            lastMessage={lastMessage}
            sendMessage={sendMessage}
          />
        );
    }
  };

  const handleSectionChange = (section: string) => {
    setActiveSection(section as Section);
    setSidebarOpen(false); // Auto-hide sidebar on section change
  };

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 font-inter">
      {/* Fixed Top Bar - Verser Logo + Search */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Menu Button & Logo */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                <div className="w-full h-0.5 bg-gray-600"></div>
                <div className="w-full h-0.5 bg-gray-600"></div>
                <div className="w-full h-0.5 bg-gray-600"></div>
              </div>
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-bold">V</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Verser
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search Verser..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block">
              {user?.username || 'User'}
            </span>
          </div>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Left Sidebar - Auto-hide */}
      <div className={`fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out z-40 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-4 space-y-2">
          {[
            { id: "chat", icon: "💬", label: "Chat", notifications: 3 },
            { id: "communities", icon: "👥", label: "Communities", notifications: 0 },
            { id: "discovery", icon: "🧭", label: "Discovery", notifications: 0 },
            { id: "verserpay", icon: "💳", label: "VerserPay", notifications: 0 },
            { id: "food", icon: "🍽️", label: "Food", notifications: 0 },
            { id: "travel", icon: "✈️", label: "Travel", notifications: 0 },
            { id: "profile", icon: "👤", label: "Profile", notifications: 0 },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => handleSectionChange(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                activeSection === item.id
                  ? "bg-blue-100 text-blue-700 border border-blue-200"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
              {item.notifications > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {item.notifications}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="pt-16 transition-all duration-300 relative">
        {/* Floating background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-32 h-32 bg-blue-200 rounded-full opacity-20 floating-animation"></div>
          <div className="absolute bottom-32 right-32 w-24 h-24 bg-purple-200 rounded-full opacity-30 floating-animation" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-pink-200 rounded-full opacity-25 floating-animation" style={{animationDelay: '4s'}}></div>
        </div>
        
        <div className="relative z-10 h-full">
          {renderActiveSection()}
        </div>
      </main>
    </div>
  );
}
