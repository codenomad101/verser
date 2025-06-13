import { useState } from "react";
import { MessageSquare, Users, Compass, User, Search, CreditCard, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import NotificationsSection from "@/components/notifications-section";
import { useQuery } from "@tanstack/react-query";

interface TopNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function TopNavigation({ activeSection, onSectionChange }: TopNavigationProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

  const navigationItems = [
    { id: "chat", icon: MessageSquare, label: "Chat", notifications: 3 },
    { id: "communities", icon: Users, label: "Communities", notifications: 0 },
    { id: "discovery", icon: Compass, label: "Discovery", notifications: 0 },
    { id: "verserpay", icon: CreditCard, label: "VerserPay", notifications: 0 },
    { id: "food", icon: UtensilsCrossed, label: "Food", notifications: 0 },
  ];

  const { data: searchResults } = useQuery({
    queryKey: ["/api/search", searchQuery],
    enabled: searchQuery.length > 2,
  });

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-bold">V</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Verser
              </h1>
            </div>
          </div>

          {/* Main Navigation */}
          <div className="hidden md:flex items-center space-x-1 ml-8">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <div key={item.id} className="relative">
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    onClick={() => onSectionChange(item.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      isActive 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                    {item.notifications > 0 && (
                      <span className="ml-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {item.notifications}
                      </span>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search posts, communities, users..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(e.target.value.length > 2);
                }}
                onFocus={() => searchQuery.length > 2 && setShowSearchResults(true)}
                className="pl-10 pr-4 py-2 w-full bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-300 rounded-full"
              />
              
              {/* Search Results Dropdown */}
              {showSearchResults && searchResults && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                  {searchResults.users?.length > 0 && (
                    <div className="p-3 border-b">
                      <h4 className="font-medium text-gray-900 mb-2">Users</h4>
                      {searchResults.users.slice(0, 3).map((user: any) => (
                        <div key={user.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                          <img src={user.avatar} alt={user.username} className="h-8 w-8 rounded-full" />
                          <div>
                            <p className="font-medium">{user.username}</p>
                            <p className="text-sm text-gray-500">{user.bio}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {searchResults.communities?.length > 0 && (
                    <div className="p-3 border-b">
                      <h4 className="font-medium text-gray-900 mb-2">Communities</h4>
                      {searchResults.communities.slice(0, 3).map((community: any) => (
                        <div key={community.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                            <span className="text-white text-sm font-bold">{community.name[0]}</span>
                          </div>
                          <div>
                            <p className="font-medium">{community.name}</p>
                            <p className="text-sm text-gray-500">{community.memberCount} members</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {(!searchResults.users?.length && !searchResults.communities?.length && !searchResults.posts?.length) && (
                    <div className="p-4 text-center text-gray-500">
                      No results found for "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Section - Notifications and Profile */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <NotificationsSection />

            {/* Profile */}
            <Button
              variant={activeSection === "profile" ? "default" : "ghost"}
              onClick={() => onSectionChange("profile")}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                activeSection === "profile" 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                  : 'hover:bg-gray-100'
              }`}
            >
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.username}
                  className="h-6 w-6 rounded-full object-cover"
                />
              ) : (
                <User className="h-5 w-5" />
              )}
              <span className="hidden sm:block font-medium">{user?.username}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-200 bg-white">
        <div className="flex items-center justify-around py-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => onSectionChange(item.id)}
                className={`flex flex-col items-center space-y-1 px-4 py-2 ${
                  isActive ? 'text-blue-600' : 'text-gray-600'
                }`}
              >
                <div className="relative">
                  <Icon className="h-5 w-5" />
                  {item.notifications > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {item.notifications}
                    </span>
                  )}
                </div>
                <span className="text-xs">{item.label}</span>
              </Button>
            );
          })}
          <Button
            variant="ghost"
            onClick={() => onSectionChange("profile")}
            className={`flex flex-col items-center space-y-1 px-4 py-2 ${
              activeSection === "profile" ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <User className="h-5 w-5" />
            <span className="text-xs">Profile</span>
          </Button>
        </div>
      </div>
    </nav>
  );
}