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
import { useWebSocket } from "@/lib/websocket";
import { useQuery } from "@tanstack/react-query";

type Section = "chat" | "communities" | "discovery" | "profile" | "verserpay" | "food" | "travel";

export default function Home() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<Section>("discovery");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Initialize WebSocket connection
  const { sendMessage, lastMessage, connectionStatus } = useWebSocket();

  // Fetch data for search
  const { data: users = [] } = useQuery({ queryKey: ['/api/users'] });
  const { data: communities = [] } = useQuery({ queryKey: ['/api/communities'] });
  const { data: posts = [] } = useQuery({ queryKey: ['/api/posts'] });

  useEffect(() => {
    if (connectionStatus === 'connected' && user) {
      sendMessage({
        type: 'join',
        userId: user.id
      });
    }
  }, [connectionStatus, sendMessage, user]);

  // Close notifications and search when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    }

    if (showNotifications || showSearchResults) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications, showSearchResults]);

  // Generate comprehensive search results from website data
  const getSearchResults = (query: string) => {
    if (!query.trim()) return [];
    
    const lowerQuery = query.toLowerCase();
    const results = [];

    // Search users
    const matchingUsers = users.filter((user: any) => 
      user.username?.toLowerCase().includes(lowerQuery) ||
      user.email?.toLowerCase().includes(lowerQuery) ||
      user.bio?.toLowerCase().includes(lowerQuery)
    );

    matchingUsers.slice(0, 3).forEach((user: any) => {
      results.push({
        type: 'user',
        icon: user.avatar || '👤',
        title: `@${user.username}`,
        description: user.bio || user.email,
        action: () => {
          handleSectionChange('chat');
          // Could add user profile navigation here
        }
      });
    });

    // Search communities
    const matchingCommunities = communities.filter((community: any) =>
      community.name?.toLowerCase().includes(lowerQuery) ||
      community.description?.toLowerCase().includes(lowerQuery)
    );

    matchingCommunities.slice(0, 3).forEach((community: any) => {
      results.push({
        type: 'community',
        icon: community.icon || '👥',
        title: community.name,
        description: `${community.memberCount} members • ${community.description}`,
        action: () => handleSectionChange('communities')
      });
    });

    // Search posts
    const matchingPosts = posts.filter((post: any) =>
      post.title?.toLowerCase().includes(lowerQuery) ||
      post.content?.toLowerCase().includes(lowerQuery) ||
      post.tags?.some((tag: string) => tag.toLowerCase().includes(lowerQuery))
    );

    matchingPosts.slice(0, 2).forEach((post: any) => {
      results.push({
        type: 'post',
        icon: '📝',
        title: post.title || 'Post',
        description: post.content?.substring(0, 100) + (post.content?.length > 100 ? '...' : ''),
        action: () => handleSectionChange('discovery')
      });
    });

    // Food items (mock data for demonstration)
    const foodItems = [
      { name: 'Pizza Margherita', restaurant: 'Mario\'s Kitchen', price: '$12.99' },
      { name: 'Chicken Burger', restaurant: 'Fast Bites', price: '$8.99' },
      { name: 'Pasta Carbonara', restaurant: 'Italian Corner', price: '$14.99' },
      { name: 'Sushi Roll', restaurant: 'Tokyo Express', price: '$16.99' },
      { name: 'Caesar Salad', restaurant: 'Green Garden', price: '$9.99' }
    ];

    const matchingFood = foodItems.filter(item =>
      item.name.toLowerCase().includes(lowerQuery) ||
      item.restaurant.toLowerCase().includes(lowerQuery)
    );

    matchingFood.slice(0, 2).forEach(food => {
      results.push({
        type: 'food',
        icon: '🍽️',
        title: food.name,
        description: `${food.restaurant} • ${food.price}`,
        action: () => handleSectionChange('food')
      });
    });

    // VerserPay features
    const paymentFeatures = [
      { name: 'Send Money', description: 'Transfer money to friends and family' },
      { name: 'Pay Bills', description: 'Pay utility bills and subscriptions' },
      { name: 'Wallet Balance', description: 'Check your current wallet balance' },
      { name: 'Transaction History', description: 'View your payment history' },
      { name: 'QR Payment', description: 'Scan QR codes to make payments' }
    ];

    const matchingPayment = paymentFeatures.filter(feature =>
      feature.name.toLowerCase().includes(lowerQuery) ||
      feature.description.toLowerCase().includes(lowerQuery)
    );

    matchingPayment.slice(0, 2).forEach(payment => {
      results.push({
        type: 'payment',
        icon: '💳',
        title: payment.name,
        description: payment.description,
        action: () => handleSectionChange('verserpay')
      });
    });

    // Travel booking options
    const travelOptions = [
      { name: 'Bus Tickets', description: 'Book bus tickets for intercity travel' },
      { name: 'Train Reservations', description: 'Reserve train seats and berths' },
      { name: 'Hotel Booking', description: 'Find and book hotels worldwide' },
      { name: 'Flight Search', description: 'Search and compare flight prices' }
    ];

    const matchingTravel = travelOptions.filter(option =>
      option.name.toLowerCase().includes(lowerQuery) ||
      option.description.toLowerCase().includes(lowerQuery) ||
      lowerQuery.includes('book') || lowerQuery.includes('ticket') || lowerQuery.includes('travel')
    );

    matchingTravel.slice(0, 2).forEach(travel => {
      results.push({
        type: 'travel',
        icon: '✈️',
        title: travel.name,
        description: travel.description,
        action: () => handleSectionChange('travel')
      });
    });

    // General navigation if no specific matches
    if (results.length === 0) {
      const generalOptions = [
        { type: 'general', icon: '🧭', title: 'Explore Discovery', description: 'Browse trending posts and content', action: () => handleSectionChange('discovery') },
        { type: 'general', icon: '👥', title: 'Communities', description: 'Join and explore communities', action: () => handleSectionChange('communities') },
        { type: 'general', icon: '💬', title: 'Chat', description: 'Start conversations and messaging', action: () => handleSectionChange('chat') }
      ];
      results.push(...generalOptions);
    }

    return results.slice(0, 8); // Limit total results
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setShowSearchResults(query.length > 0);
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
          <div className="flex-1 max-w-md mx-4" ref={searchRef}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search Verser..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchQuery.length > 0 && setShowSearchResults(true)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              {/* Search Results Dropdown */}
              {showSearchResults && searchQuery.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                  <div className="p-2">
                    {getSearchResults(searchQuery).map((result, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          result.action();
                          setShowSearchResults(false);
                          setSearchQuery("");
                        }}
                        className="w-full flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg text-left transition-colors"
                      >
                        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                          {typeof result.icon === 'string' && result.icon.startsWith('http') ? (
                            <img src={result.icon} alt="" className="w-6 h-6 rounded-full object-cover" />
                          ) : (
                            <span className="text-lg">{result.icon}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">{result.title}</h4>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{result.description}</p>
                          {result.type !== 'general' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 mt-1">
                              {result.type}
                            </span>
                          )}
                        </div>
                        <svg className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ))}
                    {getSearchResults(searchQuery).length === 0 && (
                      <div className="p-4 text-center text-gray-500">
                        <p>No results found for "{searchQuery}"</p>
                        <p className="text-sm mt-1">Try searching for users, communities, food, or "book tickets"</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notifications and Profile */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zm-3.054-8.764A7.012 7.012 0 0012 6c-1.194 0-2.315.298-3.298.826m-.548 6.938a7.003 7.003 0 01-2.32-4.612A2.995 2.995 0 006 12v.01M15 17v3a2 2 0 01-2 2H9a2 2 0 01-2-2v-3m8 0V9a6 6 0 10-12 0v8" />
                </svg>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">3</span>
              </button>
              
              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Notifications</h3>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm text-gray-800">Alex Johnson liked your post</p>
                          <p className="text-xs text-gray-500">2 minutes ago</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm text-gray-800">New message in Tech Innovators</p>
                          <p className="text-xs text-gray-500">5 minutes ago</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm text-gray-800">Sarah Chen commented on your photo</p>
                          <p className="text-xs text-gray-500">1 hour ago</p>
                        </div>
                      </div>
                    </div>
                    <button className="w-full mt-3 text-sm text-blue-600 hover:text-blue-800 transition-colors">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <button
              onClick={() => handleSectionChange("profile")}
              className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                {user?.username || 'User'}
              </span>
            </button>
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
