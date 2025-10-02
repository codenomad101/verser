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
  Sparkles,
  Zap
} from 'lucide-react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useDarkMode } from '@/hooks/use-dark-mode';
import { ContentCreationDialog } from '@/components/content-creation-dialog';
import { UniversalHeader } from '@/components/universal-header';
import { UniversalFooter } from '@/components/universal-footer';

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
  const [isScrolled, setIsScrolled] = useState(false);

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

  // Scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
    <div className={`min-h-screen font-inter transition-all duration-500 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20' 
        : 'bg-gradient-to-br from-blue-50 via-purple-50/50 to-pink-50/50'
    }`}>
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-blue-200/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-purple-200/10 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-200/5 rounded-full blur-3xl animate-pulse-slow delay-500"></div>
      </div>

      {/* Universal Header */}
      <UniversalHeader />

      {/* Sticky Discovery Header */}
      <div className={`sticky top-0 z-40 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg border-b border-gray-200/20' 
          : 'bg-gradient-to-r from-blue-800 to-blue-900'
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className={`transition-all duration-500 ${isScrolled ? 'scale-95 opacity-90' : 'scale-100'}`}>
              <h1 className={`text-2xl font-bold transition-colors duration-500 ${
                isScrolled ? 'text-gray-900 dark:text-white' : 'text-white'
              }`}>
                Discovery
              </h1>
              <p className={`transition-colors duration-500 ${
                isScrolled ? 'text-gray-600 dark:text-gray-300' : 'text-blue-100'
              }`}>
                Explore trending content and discover new creators
              </p>
            </div>
            <div className="relative">
              <Button
                onClick={() => setShowContentDialog(true)}
                className={`font-semibold transition-all duration-300 hover:scale-105 active:scale-95 ${
                  isScrolled
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                    : 'bg-white text-blue-800 hover:bg-blue-50 shadow-lg hover:shadow-xl'
                }`}
              >
                <Plus className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:rotate-90" />
                Create Content
              </Button>
            </div>
          </div>

          {/* Content Type Tabs */}
          <div className="flex items-center space-x-6">
            {[
              { id: 'videos', label: 'Videos', icon: Video },
              { id: 'shorts', label: 'Shorts', icon: Camera },
              { id: 'posts', label: 'Posts', icon: Image }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`group flex items-center space-x-2 px-4 py-3 rounded-2xl transition-all duration-300 hover:scale-105 ${
                  selectedTab === tab.id
                    ? isScrolled
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 shadow-md'
                      : 'bg-white/20 text-white backdrop-blur-sm shadow-lg'
                    : isScrolled
                    ? 'text-gray-600 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50'
                    : 'text-blue-100 hover:bg-white/10'
                }`}
              >
                <tab.icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                <span className="font-medium">{tab.label}</span>
                {selectedTab === tab.id && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-current rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 py-8 z-10">
        {/* Enhanced Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search videos, creators, hashtags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-lg rounded-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 transition-colors duration-300" />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-300"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Based on Selected Tab */}
        {selectedTab === 'videos' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Trending Videos
              </h2>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Live
                </Badge>
                <span className="text-sm text-gray-500">Updated just now</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {videos.map((video, index) => (
                <Card 
                  key={video.id} 
                  className="group overflow-hidden border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                      {video.duration}
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                      <Button size="sm" variant="secondary" className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className="bg-red-500/90 text-white backdrop-blur-sm">
                        <Play className="h-3 w-3 mr-1" />
                        LIVE
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-lg mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                      {video.title}
                    </h3>
                    <div className="flex items-center space-x-3 mb-3">
                      <Avatar className="h-9 w-9 ring-2 ring-white/20 transition-all duration-300 group-hover:ring-blue-500/30">
                        <AvatarImage src={video.creatorAvatar} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                          {video.creator.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {video.creator}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center space-x-1">
                          <Eye className="h-3 w-3" />
                          <span>{video.views} views • {formatTimeAgo(video.publishedAt)}</span>
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant={video.isSubscribed ? "default" : "outline"}
                        className={`transition-all duration-300 ${
                          video.isSubscribed 
                            ? 'bg-green-500 hover:bg-green-600 text-white' 
                            : 'border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white'
                        }`}
                      >
                        {video.isSubscribed ? 'Subscribed' : 'Subscribe'}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4 text-gray-500">
                        <button className="flex items-center space-x-1 hover:text-red-600 transition-colors duration-300 transform hover:scale-110">
                          <ThumbsUp className="h-4 w-4" />
                          <span>{video.likes.toLocaleString()}</span>
                        </button>
                        <button className="flex items-center space-x-1 hover:text-blue-600 transition-colors duration-300 transform hover:scale-110">
                          <MessageCircle className="h-4 w-4" />
                          <span>{video.comments}</span>
                        </button>
                      </div>
                      <button className="text-gray-500 hover:text-green-600 transition-colors duration-300 transform hover:scale-110">
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
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-red-500 to-pink-600 bg-clip-text text-transparent">
                Trending Shorts
              </h2>
              <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                <Zap className="h-3 w-3 mr-1" />
                Viral
              </Badge>
            </div>
            <ScrollArea className="w-full">
              <div className="flex space-x-6 pb-6">
                {shorts.map((short, index) => (
                  <Card 
                    key={short.id} 
                    className="w-80 flex-shrink-0 overflow-hidden border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 group"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={short.thumbnail}
                        alt={short.title}
                        className="w-full h-96 object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      <div className="absolute bottom-3 right-3 bg-black/80 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                        <Play className="h-3 w-3 inline mr-1" />
                        Short
                      </div>
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-gradient-to-r from-red-500 to-pink-600 text-white border-0">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Trending
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-5">
                      <h3 className="font-semibold text-lg mb-3 line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300">
                        {short.title}
                      </h3>
                      <div className="flex items-center space-x-3 mb-4">
                        <Avatar className="h-8 w-8 ring-2 ring-white/20">
                          <AvatarImage src={short.creatorAvatar} />
                          <AvatarFallback className="bg-gradient-to-br from-red-500 to-pink-600 text-white">
                            {short.creator.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {short.creator}
                          </p>
                          <p className="text-xs text-gray-500">
                            {short.views} views • {formatTimeAgo(short.publishedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4 text-gray-500">
                          <button className="flex items-center space-x-1 hover:text-red-600 transition-colors duration-300 transform hover:scale-110">
                            <ThumbsUp className="h-4 w-4" />
                            <span>{short.likes.toLocaleString()}</span>
                          </button>
                          <button className="flex items-center space-x-1 hover:text-blue-600 transition-colors duration-300 transform hover:scale-110">
                            <MessageCircle className="h-4 w-4" />
                            <span>{short.comments}</span>
                          </button>
                        </div>
                        <button className="text-gray-500 hover:text-green-600 transition-colors duration-300 transform hover:scale-110">
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
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-green-500 to-teal-600 bg-clip-text text-transparent">
                Trending Posts
              </h2>
              <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                <Sparkles className="h-3 w-3 mr-1" />
                Fresh
              </Badge>
            </div>
            {postsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                  <Image className="h-10 w-10 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">No posts found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  Be the first to share something amazing with the community!
                </p>
                <Button 
                  onClick={() => setLocation('/discovery/create')}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Plus className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:rotate-90" />
                  Create Post
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map((post: any, index: number) => (
                  <Card 
                    key={post.id} 
                    className="overflow-hidden border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 group"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {post.imageUrl && (
                      <div className="relative overflow-hidden">
                        <img
                          src={post.imageUrl}
                          alt="Post content"
                          className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        {post.type && post.type !== "text" && (
                          <Badge className="absolute top-3 left-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0">
                            {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
                          </Badge>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    )}
                    <CardContent className="p-5">
                      <div className="flex items-center space-x-3 mb-4">
                        <Avatar className="h-9 w-9 ring-2 ring-white/20 transition-all duration-300 group-hover:ring-green-500/30">
                          <AvatarImage src={post.user?.avatar || ""} />
                          <AvatarFallback className="bg-gradient-to-br from-green-500 to-teal-600 text-white">
                            {post.user?.username?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {post.user?.username || 'User'}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatTimeAgo(new Date(post.createdAt))}</span>
                          </p>
                        </div>
                      </div>
                      {post.title && (
                        <h3 className="font-semibold text-lg mb-3 line-clamp-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">
                          {post.title}
                        </h3>
                      )}
                      <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3 leading-relaxed">
                        {post.content}
                      </p>
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.tags.slice(0, 3).map((tag: string, index: number) => (
                            <Badge 
                              key={index} 
                              variant="outline" 
                              className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 transition-colors duration-300 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                            >
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4 text-gray-500">
                          <button className="flex items-center space-x-1 hover:text-red-600 transition-colors duration-300 transform hover:scale-110">
                            <Heart className="h-4 w-4" />
                            <span>{post.likes || 0}</span>
                          </button>
                          <button className="flex items-center space-x-1 hover:text-blue-600 transition-colors duration-300 transform hover:scale-110">
                            <MessageCircle className="h-4 w-4" />
                            <span>{post.comments || 0}</span>
                          </button>
                        </div>
                        <button className="text-gray-500 hover:text-green-600 transition-colors duration-300 transform hover:scale-110">
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

      {/* Universal Footer */}
      <UniversalFooter />
    </div>
  );
}