import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import EnhancedChatSection from "@/components/enhanced-chat-section";
import CommunitiesSection from "@/components/communities-section";
import EnhancedDiscovery from "@/components/enhanced-discovery";
import ProfileSection from "@/components/profile-section";
import Sidebar from "@/components/sidebar";
import MobileNav from "@/components/mobile-nav";
import { useWebSocket } from "@/lib/websocket";
import { MessageSquare, Bell, Search } from "lucide-react";

type Section = "chat" | "communities" | "discovery" | "profile";

export default function Home() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<Section>("chat");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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
          <EnhancedChatSection 
            currentUser={currentUser}
            lastMessage={lastMessage}
            sendMessage={sendMessage}
          />
        );
      case "communities":
        return <CommunitiesSection currentUser={currentUser} />;
      case "discovery":
        return <EnhancedDiscovery currentUser={currentUser} />;
      case "profile":
        return <ProfileSection currentUser={currentUser} />;
      default:
        return (
          <EnhancedChatSection 
            currentUser={currentUser}
            lastMessage={lastMessage}
            sendMessage={sendMessage}
          />
        );
    }
  };

  return (
    <div className="h-screen bg-gray-50 font-inter">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <MessageSquare className="text-white h-4 w-4" />
          </div>
          <h1 className="text-lg font-semibold text-gray-900">
            <span className="text-blue-600">Verser</span>
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          <button className="relative p-2">
            <Bell className="text-gray-600 h-5 w-5" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </button>
          <button className="p-2">
            <Search className="text-gray-600 h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="flex h-screen lg:h-auto lg:min-h-screen">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex">
          <Sidebar 
            activeSection={activeSection} 
            onSectionChange={setActiveSection}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
        </div>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-h-0">
          {renderActiveSection()}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden">
        <MobileNav 
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
      </div>
    </div>
  );
}
