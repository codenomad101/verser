import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useDarkMode } from '@/hooks/use-dark-mode';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Compass, 
  Settings, 
  Bell, 
  Moon, 
  Sun, 
  LogOut, 
  User,
  Shield,
  ArrowLeft,
  Menu,
  X,
  ChevronDown,
  Home,
  Plus
} from 'lucide-react';

interface UniversalHeaderProps {
  showBackButton?: boolean;
  backButtonText?: string;
  onBackClick?: () => void;
  title?: string;
  subtitle?: string;
  showNotifications?: boolean;
  showProfileMenu?: boolean;
  className?: string;
}

export function UniversalHeader({
  showBackButton = false,
  backButtonText = "Back",
  onBackClick,
  title,
  subtitle,
  showNotifications = true,
  showProfileMenu = true,
  className = ""
}: UniversalHeaderProps) {
  const { user, logoutMutation } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [, setLocation] = useLocation();
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showCommunitiesDropdown, setShowCommunitiesDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const communitiesRef = useRef<HTMLDivElement>(null);

  // Check admin by role (admin or superuser)
  const isAdmin = !!user && ((user as any).role === 'admin' || (user as any).role === 'superuser');

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotificationsDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
      if (communitiesRef.current && !communitiesRef.current.contains(event.target as Node)) {
        setShowCommunitiesDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle back button
  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      setLocation('/');
    }
  };

  // Handle logout
  const handleLogout = () => {
    setShowProfileDropdown(false);
    logoutMutation.mutate();
  };

  // Navigation items
  const navigationItems = [
    { id: 'home', label: 'Home', path: '/', icon: Home },
    { id: 'discovery', label: 'Discovery', path: '/discovery/home', icon: Compass },
    { id: 'preferences', label: 'Preferences', path: '/preferences', icon: Settings },
  ];

  // Mock notifications data
  const notifications = [
    { id: 1, type: "message", text: "New message from Sarah", time: "2m ago" },
    { id: 2, type: "like", text: "John liked your post", time: "5m ago" },
    { id: 3, type: "follow", text: "Emma started following you", time: "10m ago" },
  ];

  if (!user) {
    return null;
  }

  return (
    <header className={`bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Side */}
          <div className="flex items-center space-x-4">
            {/* Back Button */}
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackClick}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {backButtonText}
              </Button>
            )}

            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Verser
              </span>
            </div>

            {/* Navigation Items - Desktop */}
            <nav className="hidden md:flex items-center space-x-6">
              {/* Home Button */}
              <button
                onClick={() => setLocation('/')}
                className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  window.location.pathname === '/'
                    ? 'text-blue-600 bg-blue-50 rounded-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg'
                }`}
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </button>

              {/* Communities Dropdown */}
              <div className="relative" ref={communitiesRef}>
                <button
                  onClick={() => setShowCommunitiesDropdown(!showCommunitiesDropdown)}
                  className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium transition-all duration-200 ${
                    window.location.pathname.startsWith('/communities') || window.location.pathname.startsWith('/community')
                      ? 'text-blue-600 bg-blue-50 rounded-lg'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg'
                  }`}
                >
                  <Users className="h-4 w-4" />
                  <span>Communities</span>
                  <ChevronDown className="h-3 w-3" />
                </button>

                {showCommunitiesDropdown && (
                  <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <button
                      onClick={() => {
                        setLocation('/communities/home');
                        setShowCommunitiesDropdown(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Home className="h-4 w-4" />
                      <span>Your Communities</span>
                    </button>
                    <button
                      onClick={() => {
                        setLocation('/communities/home');
                        setShowCommunitiesDropdown(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Users className="h-4 w-4" />
                      <span>All Communities</span>
                    </button>
                    <div className="border-t border-gray-200 my-1"></div>
                    <button
                      onClick={() => {
                        // TODO: Open create community dialog
                        setShowCommunitiesDropdown(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Create Community</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Other Navigation Items */}
              {navigationItems.filter(item => item.id !== 'home').map((item) => {
                const Icon = item.icon;
                const isActive = window.location.pathname === item.path;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setLocation(item.path)}
                    className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'text-blue-600 bg-blue-50 rounded-lg'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>


          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDarkMode}
              className="text-gray-600 hover:text-gray-900"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {/* Notifications */}
            {showNotifications && (
              <div className="relative" ref={notificationsRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
                  className="text-gray-600 hover:text-gray-900 relative"
                >
                  <Bell className="h-4 w-4" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </Button>

                {showNotificationsDropdown && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div key={notification.id} className="px-4 py-3 hover:bg-gray-50">
                          <p className="text-sm text-gray-900">{notification.text}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profile Menu */}
            {showProfileMenu && (
              <div className="relative" ref={profileRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar || ""} />
                    <AvatarFallback>
                      {user.username?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>

                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{user.username}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <div className="py-2">
                      <button
                        onClick={() => {
                          setShowProfileDropdown(false);
                          setLocation('/profile');
                        }}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowProfileDropdown(false);
                          setLocation('/settings');
                        }}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => {
                            setShowProfileDropdown(false);
                            setLocation('/admin');
                          }}
                          className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Shield className="h-4 w-4" />
                          <span>Admin</span>
                        </button>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-gray-600 hover:text-gray-900"
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="space-y-2">
              {/* Home Button */}
              <div className="space-y-1">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Main
                </div>
                <button
                  onClick={() => {
                    setLocation('/');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center space-x-2 w-full px-3 py-2 text-sm font-medium transition-all duration-200 ${
                    window.location.pathname === '/'
                      ? 'text-blue-600 bg-blue-50 rounded-lg'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg'
                  }`}
                >
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </button>
              </div>

              {/* Communities Section */}
              <div className="space-y-1">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Communities
                </div>
                <button
                  onClick={() => {
                    setLocation('/communities/home');
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <Home className="h-4 w-4" />
                  <span>Your Communities</span>
                </button>
                <button
                  onClick={() => {
                    setLocation('/communities/home');
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <Users className="h-4 w-4" />
                  <span>All Communities</span>
                </button>
                <button
                  onClick={() => {
                    // TODO: Open create community dialog
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Community</span>
                </button>
              </div>

              {/* Other Navigation Items */}
              <div className="space-y-1">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Navigation
                </div>
                {navigationItems.filter(item => item.id !== 'home').map((item) => {
                  const Icon = item.icon;
                  const isActive = window.location.pathname === item.path;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setLocation(item.path);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center space-x-2 w-full px-3 py-2 text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'text-blue-600 bg-blue-50 rounded-lg'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* Page Title Section */}
      {(title || subtitle) && (
        <div className="bg-gradient-to-r from-blue-800 to-blue-900 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                {title && <h1 className="text-3xl font-bold mb-2">{title}</h1>}
                {subtitle && <p className="text-blue-100">{subtitle}</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
