import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/sidebar";
import ChatSection from "@/components/chat-section";
import CommunitiesSection from "@/components/communities-section";
import DiscoverySection from "@/components/discovery-section";
import MobileNav from "@/components/mobile-nav";
import { useWebSocket } from "@/lib/websocket";
import { MessageSquare, Bell, Search } from "lucide-react";

type Section = "chat" | "communities" | "discovery";

export default function Home() {
  const [activeSection, setActiveSection] = useState<Section>("chat");
  const [currentUser] = useState({ id: 1, username: "You" }); // Mock current user
  
  const { data: users } = useQuery({
    queryKey: ["/api/users"],
  });

  // Initialize WebSocket connection
  const { sendMessage, lastMessage, connectionStatus } = useWebSocket();

  useEffect(() => {
    if (connectionStatus === 'connected') {
      sendMessage({
        type: 'join',
        userId: currentUser.id
      });
    }
  }, [connectionStatus, sendMessage, currentUser.id]);

  return (
    <div className="h-screen bg-gray-50 font-inter">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
            <MessageSquare className="text-white h-4 w-4" />
          </div>
          <h1 className="text-lg font-semibold text-gray-900">ConnectHub</h1>
        </div>
        <div className="flex items-center space-x-3">
          <button className="relative p-2">
            <Bell className="text-gray-600 h-5 w-5" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center notification-badge">
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
        <Sidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection}
          currentUser={currentUser}
        />

        {/* Main Content */}
        <main className="flex-1 flex flex-col lg:flex-row min-h-0">
          {activeSection === "chat" && (
            <ChatSection 
              currentUser={currentUser}
              lastMessage={lastMessage}
              sendMessage={sendMessage}
            />
          )}
          {activeSection === "communities" && (
            <CommunitiesSection currentUser={currentUser} />
          )}
          {activeSection === "discovery" && (
            <DiscoverySection currentUser={currentUser} />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav 
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
    </div>
  );
}
