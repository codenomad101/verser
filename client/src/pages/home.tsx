import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import EnhancedChatSection from "@/components/enhanced-chat-section";
import CommunitiesSection from "@/components/communities-section";
import EnhancedDiscovery from "@/components/enhanced-discovery";
import ProfileSection from "@/components/profile-section";
import NewsSidebar from "@/components/news-sidebar";
import TopNavigation from "@/components/top-navigation";
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
    <div className="h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 font-inter">
      {/* Top Navigation */}
      <TopNavigation 
        activeSection={activeSection} 
        onSectionChange={handleSectionChange}
      />
      
      <div className="flex h-full">
        {/* Left Sidebar - News Only */}
        <div className="hidden lg:flex flex-col">
          <NewsSidebar 
            activeSection={activeSection} 
            onSectionChange={handleSectionChange}
          />
        </div>

        {/* Main Content - Single Active Section */}
        <main className="flex-1 flex flex-col relative">
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


    </div>
  );
}
