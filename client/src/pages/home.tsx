import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import EnhancedChatSection from "@/components/enhanced-chat-section";
import CommunitiesSection from "@/components/communities-section";
import EnhancedDiscovery from "@/components/enhanced-discovery";
import ProfileSection from "@/components/profile-section";
import NewsSidebar from "@/components/news-sidebar";
import HorizontalNav from "@/components/horizontal-nav";
import MobileNav from "@/components/mobile-nav";
import { useWebSocket } from "@/lib/websocket";

type Section = "chat" | "communities" | "discovery" | "profile";

export default function Home() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<Section>("discovery");
  const [showSidebar, setShowSidebar] = useState(true);

  // Auto-hide sidebar after 4 seconds of no interaction
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSidebar(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, [showSidebar]);

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
      {/* Horizontal Navigation */}
      <HorizontalNav 
        activeSection={activeSection} 
        onSectionChange={handleSectionChange}
      />

      <div className="flex h-full">
        {/* Auto-hide Left Sidebar */}
        <div 
          className={`hidden lg:flex transition-all duration-300 ${
            showSidebar ? 'translate-x-0' : '-translate-x-full'
          }`}
          onMouseEnter={() => setShowSidebar(true)}
        >
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
