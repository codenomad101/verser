import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import EnhancedChatSection from "@/components/enhanced-chat-section";
import CommunitiesSection from "@/components/communities-section";
import EnhancedDiscovery from "@/components/enhanced-discovery";
import ProfileSection from "@/components/profile-section";
import NewsSidebar from "@/components/news-sidebar";
import LeftNavigation from "@/components/left-navigation";
import MobileNav from "@/components/mobile-nav";
import { useWebSocket } from "@/lib/websocket";

type Section = "chat" | "communities" | "discovery" | "profile";

export default function Home() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<Section>("discovery");


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

  const handleSectionChange = (section: string) => {
    setActiveSection(section as Section);
  };

  return (
    <div className="h-screen bg-gray-50 font-inter">
      <div className="flex h-full">
        {/* Left Sidebar - Navigation above News */}
        <div className="hidden lg:flex flex-col">
          <LeftNavigation 
            activeSection={activeSection} 
            onSectionChange={handleSectionChange}
          />
          <NewsSidebar 
            activeSection={activeSection} 
            onSectionChange={handleSectionChange}
          />
        </div>

        {/* Main Content - Single Active Section */}
        <main className="flex-1 flex flex-col">
          {renderActiveSection()}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden">
        <MobileNav 
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
        />
      </div>
    </div>
  );
}
