import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  Plus, 
  Play,
  Pause,
  Volume2,
  VolumeX,
  Heart,
  MessageCircle,
  Share,
  Bookmark,
  MoreHorizontal,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Clock,
  TrendingUp,
  Filter,
  Grid3X3,
  List,
  Globe,
  Users,
  Settings,
  Shield,
  Bell,
  User,
  Video,
  Image,
  Music,
  Camera,
  Sparkles
} from 'lucide-react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useDarkMode } from '@/hooks/use-dark-mode';
import { ContentCreationDialog } from '@/components/content-creation-dialog';

export function DiscoveryHomePage() {
  const { user, logoutMutation } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'videos' | 'shorts' | 'posts'>('videos');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<number | null>(null);
  const [showContentDialog, setShowContentDialog] = useState(false);
  const [contentDialogType, setContentDialogType] = useState<'post' | 'short' | 'video'>('post');

  // Simple time formatting function
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };
  
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Check admin by role (admin or superuser)
  const isAdmin = !!user && ((user as any).role === 'admin' || (user as any).role === 'superuser');

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
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

  // Use auth context for logout
  const handleLogout = () => {
    setShowProfileMenu(false);
    logoutMutation.mutate();
  };

  // Handle content creation
  const handleCreateContent = (type: 'post' | 'short' | 'video') => {
    setContentDialogType(type);
    setShowContentDialog(true);
  };

  // Fetch posts
  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['/api/posts', selectedTab],
    queryFn: () => {
      const endpoint = selectedTab === 'posts' ? '/api/posts' : '/api/posts/trending';
      return fetch(endpoint).then(res => res.json());
    },
  });

  // Mock data for videos and shorts
  const videos = [
    {
      id: 1,
      title: "Building a React App from Scratch - Complete Tutorial",
      creator: "TechTutorials",
      creatorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450&fit=crop",
      duration: "15:32",
      views: "125K",
      likes: 1200,
      comments: 89,
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isLiked: false,
      isSubscribed: false
    },
    {
      id: 2,
      title: "CSS Grid vs Flexbox - Which Should You Use?",
      creator: "WebDesignPro",
      creatorAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face",
      thumbnail: "https://images.unsplash.com/photo-1559028006-448665bd7c7f?w=800&h=450&fit=crop",
      duration: "8:45",
      views: "89K",
      likes: 890,
      comments: 45,
      publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      isLiked: true,
      isSubscribed: true
    },
    {
      id: 3,
      title: "JavaScript ES2024 New Features Explained",
      creator: "CodeMaster",
      creatorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
      thumbnail: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=450&fit=crop",
      duration: "12:18",
      views: "203K",
      likes: 2100,
      comments: 156,
      publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      isLiked: false,
      isSubscribed: false
    }
  ];

  const shorts = [
    {
      id: 1,
      title: "Quick CSS Trick: Centering Elements",
      creator: "CSSWizard",
      creatorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      thumbnail: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=400&h=600&fit=crop",
      views: "45K",
      likes: 1200,
      comments: 23,
      publishedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      isLiked: false
    },
    {
      id: 2,
      title: "React Hook in 30 Seconds",
      creator: "ReactGuru",
      creatorAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face",
      thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=600&fit=crop",
      views: "78K",
      likes: 2100,
      comments: 67,
      publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      isLiked: true
    },
    {
      id: 3,
      title: "TypeScript Tip of the Day",
      creator: "TypeScriptPro",
      creatorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
      thumbnail: "https://images.unsplash.com/photo-1559028006-448665bd7c7f?w=400&h=600&fit=crop",
      views: "32K",
      likes: 890,
      comments: 34,
      publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      isLiked: false
    }
  ];

  const filteredPosts = posts.filter((post: any) =>
    post.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Not authenticated</h1>
          <p className="text-gray-600">Please log in to access discovery.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-inter ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'}`}>
      {/* Top Navigation Card */}
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Side - Logo and Navigation */}
            <div className="flex items-center space-x-8">
              {/* Logo */}
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl font-bold">V</span>
                </div>
                <div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Verser
                  </span>
                  <p className="text-xs text-gray-500 -mt-1">Connect • Discover • Share</p>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="flex items-center space-x-6">
                <button
                  onClick={() => setLocation('/communities')}
                  className={`relative px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    window.location.pathname === '/communities' || window.location.pathname === '/communities/home'
                      ? 'text-blue-600'
                      : isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>Communities</span>
                  </div>
                </button>
                <button
                  onClick={() => setLocation('/discovery')}
                  className={`relative px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    window.location.pathname === '/discovery' || window.location.pathname === '/discovery/home'
                      ? 'text-blue-600'
                      : isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Discovery</span>
                  </div>
                  {/* Underline indicator */}
                  {(window.location.pathname === '/discovery' || window.location.pathname === '/discovery/home') && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
                  )}
                </button>
                <button
                  onClick={() => setLocation('/preferences')}
                  className={`relative px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    window.location.pathname === '/preferences'
                      ? 'text-blue-600'
                      : isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                    <span>Preferences</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Right Side - Dark Mode, Notifications and Profile */}
            <div className="flex items-center space-x-4">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-full transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              {/* Notifications */}
              <div className="relative" ref={notificationsRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-2 rounded-full transition-colors relative ${
                    isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <Bell className={`w-6 h-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className={`absolute top-full right-0 mt-2 w-80 rounded-lg shadow-lg z-50 ${
                    isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  } border`}>
                    <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {[
                        { title: "New video from TechTutorials", time: "2 min ago", type: "video" },
                        { title: "Sarah liked your post", time: "1 hour ago", type: "like" },
                        { title: "Trending: React 18 Features", time: "2 hours ago", type: "trending" }
                      ].map((notification, index) => (
                        <div key={index} className={`p-4 border-b last:border-b-0 ${
                          isDarkMode 
                            ? 'hover:bg-gray-700 border-gray-700' 
                            : 'hover:bg-gray-50 border-gray-100'
                        }`}>
                          <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{notification.title}</p>
                          <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{notification.time}</p>
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
                  className={`flex items-center space-x-2 p-1 rounded-full transition-colors ${
                    isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <img
                    src={user.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"}
                    alt={user.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                </button>

                {/* Desktop Profile Dropdown Menu */}
                {showProfileMenu && (
                  <div className={`absolute top-full right-0 mt-2 w-48 rounded-lg shadow-lg z-50 ${
                    isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  } border`}>
                    <div className="py-2">
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          setLocation('/profile');
                        }}
                        className={`w-full flex items-center px-4 py-2 text-sm transition-colors ${
                          isDarkMode 
                            ? 'text-gray-300 hover:bg-gray-700' 
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <User className="w-4 h-4 mr-3 text-gray-500" />
                        Profile
                      </button>
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          setLocation('/settings');
                        }}
                        className={`w-full flex items-center px-4 py-2 text-sm transition-colors ${
                          isDarkMode 
                            ? 'text-gray-300 hover:bg-gray-700' 
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Settings className="w-4 h-4 mr-3 text-gray-500" />
                        Settings
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            setLocation('/admin');
                          }}
                          className={`w-full flex items-center px-4 py-2 text-sm transition-colors ${
                            isDarkMode 
                              ? 'text-gray-300 hover:bg-gray-700' 
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <Shield className="w-4 h-4 mr-3 text-red-500" />
                          Admin Dashboard
                        </button>
                      )}
                      <div className={`border-t my-1 ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}></div>
                      <button
                        onClick={handleLogout}
                        disabled={logoutMutation.isPending}
                        className={`w-full flex items-center px-4 py-2 text-sm transition-colors disabled:opacity-50 ${
                          isDarkMode 
                            ? 'text-red-400 hover:bg-red-900/20' 
                            : 'text-red-600 hover:bg-red-50'
                        }`}
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
      </div>

      {/* Discovery Header */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Discovery</h1>
              <p className="text-blue-100">Explore trending content and discover new creators</p>
            </div>
            <div className="relative">
              <Button
                onClick={() => setShowContentDialog(true)}
                className="bg-white text-blue-800 hover:bg-blue-50 font-semibold"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Content
              </Button>
            </div>
          </div>

          {/* Content Type Tabs */}
          <div className="flex items-center space-x-8">
            <button
              onClick={() => setSelectedTab('videos')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                selectedTab === 'videos' 
                  ? 'bg-white/20 text-white' 
                  : 'hover:bg-white/10 text-blue-100'
              }`}
            >
              <Video className="h-4 w-4" />
              <span>Videos</span>
            </button>
            <button
              onClick={() => setSelectedTab('shorts')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                selectedTab === 'shorts' 
                  ? 'bg-white/20 text-white' 
                  : 'hover:bg-white/10 text-blue-100'
              }`}
            >
              <Camera className="h-4 w-4" />
              <span>Shorts</span>
            </button>
            <button
              onClick={() => setSelectedTab('posts')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                selectedTab === 'posts' 
                  ? 'bg-white/20 text-white' 
                  : 'hover:bg-white/10 text-blue-100'
              }`}
            >
              <Image className="h-4 w-4" />
              <span>Posts</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl">
            <Input
              type="text"
              placeholder="Search videos, creators, hashtags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          </div>
        </div>

        {/* Content Based on Selected Tab */}
        {selectedTab === 'videos' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Trending Videos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                      {video.duration}
                    </div>
                    <div className="absolute top-2 right-2">
                      <Button size="sm" variant="ghost" className="text-white hover:bg-black/20">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{video.title}</h3>
                    <div className="flex items-center space-x-2 mb-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={video.creatorAvatar} />
                        <AvatarFallback>{video.creator.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{video.creator}</p>
                        <p className="text-xs text-gray-500">
                          {video.views} views • {formatTimeAgo(video.publishedAt)}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant={video.isSubscribed ? "default" : "outline"}
                        className="text-xs"
                      >
                        {video.isSubscribed ? 'Subscribed' : 'Subscribe'}
                      </Button>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <button className="flex items-center space-x-1 hover:text-red-600">
                        <ThumbsUp className="h-4 w-4" />
                        <span>{video.likes.toLocaleString()}</span>
                      </button>
                      <button className="flex items-center space-x-1 hover:text-blue-600">
                        <MessageCircle className="h-4 w-4" />
                        <span>{video.comments}</span>
                      </button>
                      <button className="hover:text-green-600">
                        <Share className="h-4 w-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'shorts' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Trending Shorts</h2>
            <ScrollArea className="w-full">
              <div className="flex space-x-4 pb-4">
                {shorts.map((short) => (
                  <Card key={short.id} className="w-80 flex-shrink-0 overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <img
                        src={short.thumbnail}
                        alt={short.title}
                        className="w-full h-96 object-cover"
                      />
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                        <Play className="h-3 w-3 inline mr-1" />
                        Short
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">{short.title}</h3>
                      <div className="flex items-center space-x-2 mb-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={short.creatorAvatar} />
                          <AvatarFallback>{short.creator.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{short.creator}</p>
                          <p className="text-xs text-gray-500">
                            {short.views} views • {formatTimeAgo(short.publishedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <button className="flex items-center space-x-1 hover:text-red-600">
                          <ThumbsUp className="h-4 w-4" />
                          <span>{short.likes.toLocaleString()}</span>
                        </button>
                        <button className="flex items-center space-x-1 hover:text-blue-600">
                          <MessageCircle className="h-4 w-4" />
                          <span>{short.comments}</span>
                        </button>
                        <button className="hover:text-green-600">
                          <Share className="h-4 w-4" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {selectedTab === 'posts' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Trending Posts</h2>
            {postsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Image className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No posts found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Be the first to share something amazing!</p>
                <Button onClick={() => setLocation('/discovery/create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Post
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map((post: any) => (
                  <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    {post.imageUrl && (
                      <div className="relative">
                        <img
                          src={post.imageUrl}
                          alt="Post content"
                          className="w-full h-48 object-cover"
                        />
                        {post.type && post.type !== "text" && (
                          <Badge className="absolute top-2 left-2" variant="secondary">
                            {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
                          </Badge>
                        )}
                      </div>
                    )}
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={post.user?.avatar || ""} />
                          <AvatarFallback>{post.user?.username?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {post.user?.username || 'User'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatTimeAgo(new Date(post.createdAt))}
                          </p>
                        </div>
                      </div>
                      {post.title && (
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{post.title}</h3>
                      )}
                      <p className="text-gray-700 dark:text-gray-300 mb-3 line-clamp-3">{post.content}</p>
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {post.tags.slice(0, 3).map((tag: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <button className="flex items-center space-x-1 hover:text-red-600">
                          <Heart className="h-4 w-4" />
                          <span>{post.likes || 0}</span>
                        </button>
                        <button className="flex items-center space-x-1 hover:text-blue-600">
                          <MessageCircle className="h-4 w-4" />
                          <span>{post.comments || 0}</span>
                        </button>
                        <button className="hover:text-green-600">
                          <Share className="h-4 w-4" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content Creation Dialog */}
      <ContentCreationDialog
        isOpen={showContentDialog}
        onClose={() => setShowContentDialog(false)}
        contentType={contentDialogType}
      />
    </div>
  );
}
