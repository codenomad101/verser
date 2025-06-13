import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import SimpleChat from "@/components/simple-chat";
import CommunitiesSection from "@/components/communities-section";
import DiscoverySection from "@/components/discovery-section";
import EnhancedDiscovery from "@/components/enhanced-discovery";
import ProfileSection from "@/components/profile-section";
import NotificationsSection from "@/components/notifications-section";

import TopNavigation from "@/components/top-navigation";
import VerserPaySection from "@/components/verserpay-section";
import FoodSection from "@/components/food-section";
import TravelSection from "@/components/travel-section";
import SettingsSection from "@/components/settings-section";
import { useWebSocket } from "@/lib/websocket";
import { useQuery } from "@tanstack/react-query";
import type { User, Community, Post } from "@shared/schema";

type Section = "chat" | "communities" | "discovery" | "profile" | "verserpay" | "food" | "travel" | "settings";

export default function Home() {
  const { user, logoutMutation } = useAuth();
  const [activeSection, setActiveSection] = useState<Section>("discovery");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);

  const searchRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // WebSocket integration
  const webSocket = useWebSocket();
  
  const sendMessage = (message: any) => {
    if (webSocket) {
      webSocket.send(JSON.stringify(message));
    }
  };

  // Fetch data for search functionality
  const { data: users = [] } = useQuery<User[]>({ queryKey: ["/api/users"] });
  const { data: communities = [] } = useQuery<Community[]>({ queryKey: ["/api/communities"] });
  const { data: posts = [] } = useQuery<Post[]>({ queryKey: ["/api/posts"] });

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle WebSocket messages
  useEffect(() => {
    if (webSocket) {
      webSocket.onmessage = (event: MessageEvent) => {
        const message = JSON.parse(event.data);
        setLastMessage(message);
      };
    }
  }, [webSocket]);

  // Search functionality
  const getSearchResults = (query: string) => {
    if (!query.trim()) return [];
    
    const searchTerm = query.toLowerCase();
    const results: any[] = [];

    // Search users
    users.forEach(user => {
      if (user.username.toLowerCase().includes(searchTerm) || 
          user.email.toLowerCase().includes(searchTerm)) {
        results.push({
          type: 'user',
          title: user.username,
          description: user.bio || user.email,
          icon: user.avatar || "👤",
          action: () => handleSectionChange('communities')
        });
      }
    });

    // Search communities
    communities.forEach(community => {
      if (community.name.toLowerCase().includes(searchTerm) || 
          (community.description && community.description.toLowerCase().includes(searchTerm))) {
        results.push({
          type: 'community',
          title: community.name,
          description: community.description || `${community.memberCount} members`,
          icon: community.icon || "👥",
          action: () => handleSectionChange('communities')
        });
      }
    });

    // Search posts
    posts.forEach(post => {
      if (post.title?.toLowerCase().includes(searchTerm) || 
          post.content.toLowerCase().includes(searchTerm)) {
        results.push({
          type: 'post',
          title: post.title || 'Post',
          description: post.content.substring(0, 100) + '...',
          icon: "📝",
          action: () => handleSectionChange('discovery')
        });
      }
    });

    // Add context-aware suggestions
    if (searchTerm.includes('food') || searchTerm.includes('order') || searchTerm.includes('restaurant')) {
      results.push({
        type: 'feature',
        title: 'Order Food',
        description: 'Browse restaurants and order your favorite meals',
        icon: "🍽️",
        action: () => handleSectionChange('food')
      });
    }

    if (searchTerm.includes('travel') || searchTerm.includes('book') || searchTerm.includes('ticket') || searchTerm.includes('hotel')) {
      results.push({
        type: 'feature',
        title: 'Book Travel',
        description: 'Find and book buses, trains, and hotels',
        icon: "✈️",
        action: () => handleSectionChange('travel')
      });
    }

    if (searchTerm.includes('pay') || searchTerm.includes('money') || searchTerm.includes('transfer')) {
      results.push({
        type: 'feature',
        title: 'VerserPay',
        description: 'Send money, pay bills, and manage finances',
        icon: "💳",
        action: () => handleSectionChange('verserpay')
      });
    }

    return results.slice(0, 8); // Limit to 8 results
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setShowSearchResults(query.length > 0);
  };

  // Use auth context for logout
  const handleLogout = () => {
    setShowProfileMenu(false);
    logoutMutation.mutate();
  };

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
      case "settings":
        return <SettingsSection currentUser={currentUser} />;
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
    <div className="h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 font-inter flex">
      {/* Desktop Sidebar - Always visible on desktop */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:z-50 lg:ml-6">
        <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200">
          {/* Logo */}
          <div className="flex items-center h-16 flex-shrink-0 px-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-bold">V</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Verser
              </span>
            </div>
          </div>
          
          {/* Navigation */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              {[
                { key: "chat", label: "Chat", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
                { key: "communities", label: "Communities", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
                { key: "discovery", label: "Discovery", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
                { key: "verserpay", label: "VerserPay", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" },
                { key: "food", label: "Food", icon: "M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v4a2 2 0 01-2 2H9a2 2 0 01-2-2v-4m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" },
                { key: "travel", label: "Travel", icon: "M5 8a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V8z" },
                { key: "profile", label: "Profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
                { key: "settings", label: "Settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" }
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleSectionChange(item.key as Section)}
                  className={`w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    activeSection === item.key
                      ? "bg-blue-100 text-blue-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <svg className="mr-3 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 lg:pr-6">
        {/* Desktop Top Bar */}
        <div className="hidden lg:block fixed top-0 left-72 right-6 z-40 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between h-16 px-6">
            {/* Search Bar */}
            <div className="flex-1 max-w-lg" ref={searchRef}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search users, communities, posts..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Search Results Dropdown */}
              {showSearchResults && searchQuery && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                  {getSearchResults(searchQuery).length > 0 ? (
                    <div className="py-2">
                      {getSearchResults(searchQuery).map((result, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            result.action();
                            setShowSearchResults(false);
                            setSearchQuery("");
                          }}
                          className="w-full flex items-center px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                        >
                          <span className="text-2xl mr-3">{result.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{result.title}</p>
                            <p className="text-xs text-gray-500 truncate">{result.description}</p>
                          </div>
                          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full ml-2">
                            {result.type}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-gray-500">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <p className="mt-2 text-sm">No results found</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative" ref={notificationsRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {[
                        { title: "New message from Sarah", time: "2 min ago", type: "message" },
                        { title: "John liked your post", time: "1 hour ago", type: "like" },
                        { title: "Welcome to Tech Community!", time: "2 hours ago", type: "community" }
                      ].map((notification, index) => (
                        <div key={index} className="p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                          <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Avatar */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <img
                    src={user.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"}
                    alt={user.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                </button>

                {/* Desktop Profile Dropdown Menu */}
                {showProfileMenu && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="py-2">
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          handleSectionChange('profile');
                        }}
                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile
                      </button>
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          handleSectionChange('settings');
                        }}
                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Settings
                      </button>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={handleLogout}
                        disabled={logoutMutation.isPending}
                        className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Top Bar */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
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

            {/* Profile Icon on Mobile */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <img
                  src={user.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"}
                  alt={user.username}
                  className="w-8 h-8 rounded-full object-cover"
                />
              </button>

              {/* Mobile Profile Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        handleSectionChange('settings');
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Settings
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      disabled={logoutMutation.isPending}
                      className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)}>
            <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center h-16 px-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg font-bold">V</span>
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Verser
                  </span>
                </div>
              </div>
              <div className="p-4 space-y-2">
                {[
                  { key: "chat", label: "Chat", icon: "💬" },
                  { key: "communities", label: "Communities", icon: "👥" },
                  { key: "discovery", label: "Discovery", icon: "🧭" },
                  { key: "verserpay", label: "VerserPay", icon: "💳" },
                  { key: "food", label: "Food", icon: "🍽️" },
                  { key: "travel", label: "Travel", icon: "✈️" },
                  { key: "profile", label: "Profile", icon: "👤" },
                  { key: "settings", label: "Settings", icon: "⚙️" }
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => handleSectionChange(item.key as Section)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeSection === item.key
                        ? "bg-blue-100 text-blue-700 border border-blue-200"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="lg:pt-16 pt-16 min-h-screen px-4">
          <div className="max-w-6xl mx-auto">
            {renderActiveSection()}
          </div>
        </div>
      </div>
    </div>
  );
}