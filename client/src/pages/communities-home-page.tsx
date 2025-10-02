import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Plus, 
  MapPin, 
  Users, 
  TrendingUp, 
  Star,
  Calendar,
  Clock,
  Filter,
  Grid3X3,
  List,
  Globe,
  Building,
  Code,
  Palette,
  Rocket,
  Camera,
  Music,
  Gamepad2,
  BookOpen,
  Heart,
  MessageCircle,
  Share,
  Shield,
  Eye
} from 'lucide-react';
import { useLocation } from 'wouter';
import NewCommunityDialog from '@/components/new-community-dialog';
import { ContentCreationDialog } from '@/components/content-creation-dialog';
import { useAuth } from '@/hooks/use-auth';
import { useDarkMode } from '@/hooks/use-dark-mode';

export function CommunitiesHomePage() {
  const { user, logoutMutation } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showNewCommunityDialog, setShowNewCommunityDialog] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showContentDialog, setShowContentDialog] = useState(false);
  const [contentDialogType, setContentDialogType] = useState<'post' | 'short' | 'video'>('post');
  const [joiningCommunityId, setJoiningCommunityId] = useState<number | null>(null);
  const [leavingCommunityId, setLeavingCommunityId] = useState<number | null>(null);
  
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

  // Join/Leave community mutations
  const joinCommunityMutation = useMutation({
    mutationFn: async (communityId: number) => {
      setJoiningCommunityId(communityId);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/communities/${communityId}/join`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to join community');
      return response.json();
    },
    onSuccess: () => {
      setJoiningCommunityId(null);
      queryClient.invalidateQueries({ queryKey: ['/api/communities/user', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/communities'] });
    },
    onError: () => {
      setJoiningCommunityId(null);
    },
  });

  const leaveCommunityMutation = useMutation({
    mutationFn: async (communityId: number) => {
      setLeavingCommunityId(communityId);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/communities/${communityId}/leave`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to leave community');
      return response.json();
    },
    onSuccess: () => {
      setLeavingCommunityId(null);
      queryClient.invalidateQueries({ queryKey: ['/api/communities/user', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/communities'] });
    },
    onError: () => {
      setLeavingCommunityId(null);
    },
  });

  // Fetch communities
  const { data: communities = [], isLoading } = useQuery({
    queryKey: ['/api/communities'],
  });

  // Fetch user's communities
  const { data: userCommunities = [], isLoading: userCommunitiesLoading, error: userCommunitiesError } = useQuery({
    queryKey: ['/api/communities/user', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      
      console.log('Fetching communities for user:', user.id);
      const response = await fetch(`/api/communities/user/${user.id}`);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch user communities: ${response.status}`);
      }
      const data = await response.json();
      console.log('User communities data:', data);
      return Array.isArray(data) ? data : [];
    },
    enabled: !!user?.id,
    retry: 1,
  });

  // Fetch community posts for followed communities
  const { data: communityPosts = [], isLoading: communityPostsLoading } = useQuery({
    queryKey: ['/api/posts/community'],
    queryFn: async () => {
      if (!Array.isArray(userCommunities) || userCommunities.length === 0) {
        return [];
      }
      
      const posts = await Promise.all(
        userCommunities.map(async (community: any) => {
          const response = await fetch(`/api/communities/${community.id}/posts`);
          const posts = await response.json();
          return { community, posts };
        })
      );
      return posts.flat();
    },
    enabled: Array.isArray(userCommunities) && userCommunities.length > 0,
  });

  // Fetch user roles in communities
  const { data: userRoles = {} } = useQuery({
    queryKey: ['/api/communities/roles', user?.id],
    queryFn: async () => {
      if (!Array.isArray(communities) || communities.length === 0) {
        return {};
      }
      
      const roles: Record<number, string> = {};
      await Promise.all(
        communities.map(async (community: any) => {
          try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`/api/communities/${community.id}/role`, {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });
            if (!response.ok) {
              roles[community.id] = null;
              return;
            }
            const data = await response.json();
            roles[community.id] = data.role;
          } catch (error) {
            // User is not a member
            roles[community.id] = null;
          }
        })
      );
      return roles;
    },
    enabled: !!user?.id && Array.isArray(communities) && communities.length > 0,
  });

  // Categories for filtering
  const categories = [
    { id: 'all', name: 'All Communities', icon: Globe },
    { id: 'tech', name: 'Technology', icon: Code },
    { id: 'design', name: 'Design', icon: Palette },
    { id: 'business', name: 'Business', icon: Building },
    { id: 'creative', name: 'Creative', icon: Camera },
    { id: 'music', name: 'Music', icon: Music },
    { id: 'gaming', name: 'Gaming', icon: Gamepad2 },
    { id: 'education', name: 'Education', icon: BookOpen },
  ];

  // Filter communities based on search and category
  const filteredCommunities = communities.filter(community => {
    const matchesSearch = community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         community.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           community.category === selectedCategory ||
                           (selectedCategory === 'tech' && community.name.toLowerCase().includes('tech')) ||
                           (selectedCategory === 'design' && community.name.toLowerCase().includes('design'));
    return matchesSearch && matchesCategory;
  });

  // Get trending communities (mock data for now)
  const trendingCommunities = communities.slice(0, 5).map(community => ({
    ...community,
    growthRate: Math.floor(Math.random() * 50) + 10,
    trendingScore: Math.floor(Math.random() * 100) + 50,
  }));

  // Get area-based communities (mock data)
  const areaCommunities = [
    {
      id: 'sf-tech',
      name: 'San Francisco Tech',
      description: 'Tech professionals in the Bay Area',
      memberCount: 12500,
      onlineCount: 450,
      area: 'San Francisco, CA',
      category: 'tech',
      icon: 'fas fa-code',
      color: 'blue',
    },
    {
      id: 'ny-design',
      name: 'NYC Designers',
      description: 'Creative professionals in New York',
      memberCount: 8900,
      onlineCount: 320,
      area: 'New York, NY',
      category: 'design',
      icon: 'fas fa-palette',
      color: 'purple',
    },
    {
      id: 'la-creative',
      name: 'LA Creatives',
      description: 'Artists and creators in Los Angeles',
      memberCount: 6700,
      onlineCount: 280,
      area: 'Los Angeles, CA',
      category: 'creative',
      icon: 'fas fa-camera',
      color: 'green',
    },
  ];

  const getIconComponent = (iconClass: string) => {
    switch (iconClass) {
      case 'fas fa-code': return <Code className="text-lg" />;
      case 'fas fa-palette': return <Palette className="text-lg" />;
      case 'fas fa-rocket': return <Rocket className="text-lg" />;
      case 'fas fa-camera': return <Camera className="text-lg" />;
      case 'fas fa-bullhorn': return <Building className="text-lg" />;
      default: return <Users className="text-lg" />;
    }
  };

  const getColorClass = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-500';
      case 'purple': return 'bg-purple-500';
      case 'green': return 'bg-green-500';
      case 'yellow': return 'bg-yellow-500';
      case 'red': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  const getRoleBadge = (role: string | null) => {
    if (!role) return null;
    
    const roleConfig = {
      admin: { label: 'Admin', className: 'bg-red-100 text-red-800 border-red-200' },
      maintainer: { label: 'Moderator', className: 'bg-orange-100 text-orange-800 border-orange-200' },
      member: { label: 'Member', className: 'bg-green-100 text-green-800 border-green-200' },
    };
    
    const config = roleConfig[role as keyof typeof roleConfig];
    if (!config) return null;
    
    return (
      <Badge variant="outline" className={`text-xs ${config.className}`}>
        {config.label}
      </Badge>
    );
  };

  const canManageCommunity = (communityId: number) => {
    const role = userRoles[communityId];
    return role === 'admin' || role === 'maintainer';
  };

  const isCommunityAdmin = (communityId: number) => {
    return userRoles[communityId] === 'admin';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Not authenticated</h1>
          <p className="text-gray-600">Please log in to access communities.</p>
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
                  {/* Underline indicator */}
                  {(window.location.pathname === '/communities' || window.location.pathname === '/communities/home') && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
                  )}
                </button>
                <button
                  onClick={() => setLocation('/discovery')}
                  className={`relative px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    window.location.pathname === '/discovery'
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
                  {window.location.pathname === '/discovery' && (
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
                  {/* Underline indicator */}
                  {window.location.pathname === '/preferences' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
                  )}
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
                  <svg className={`w-6 h-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
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
                        { title: "New message from Sarah", time: "2 min ago", type: "message" },
                        { title: "John liked your post", time: "1 hour ago", type: "like" },
                        { title: "Welcome to Tech Community!", time: "2 hours ago", type: "community" }
                      ].map((notification, index) => (
                        <div className={`p-4 border-b last:border-b-0 ${
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
                        <svg className="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
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
                        <svg className="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
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

      {/* Communities Header */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Communities</h1>
              <p className="text-blue-100">Discover and connect with like-minded people</p>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={() => setShowContentDialog(true)}
                className="bg-white text-blue-800 hover:bg-blue-50 font-semibold"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Content
              </Button>
              <Button
                onClick={() => setShowNewCommunityDialog(true)}
                className="bg-white text-blue-800 hover:bg-blue-50 font-semibold"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Community
              </Button>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="flex items-center space-x-8">
            <button
              onClick={() => setLocation('/communities/home')}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
            >
              <Globe className="h-4 w-4" />
              <span>Home</span>
            </button>
            <button
              onClick={() => setLocation('/communities/list')}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-white/20 transition-colors"
            >
              <Users className="h-4 w-4" />
              <span>All Communities</span>
            </button>
            <button
              onClick={() => setLocation('/communities/trending')}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-white/20 transition-colors"
            >
              <TrendingUp className="h-4 w-4" />
              <span>Trending</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Your Communities Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Communities</h2>
            <Button
              onClick={() => setShowNewCommunityDialog(true)}
              variant="outline"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Community
            </Button>
          </div>
          
          {userCommunitiesError ? (
            <Card className="text-center py-12">
              <CardContent>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error loading communities</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">There was an issue loading your communities</p>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : userCommunitiesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !Array.isArray(userCommunities) || userCommunities.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No communities yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Join communities to see them here</p>
                <Button onClick={() => setShowNewCommunityDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Community
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.isArray(userCommunities) && userCommunities.map((community: any) => (
                <Card key={community.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${getColorClass(community.color)}`}>
                          <i className={community.icon}></i>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-lg">{community.name}</h3>
                            {getRoleBadge(userRoles[community.id])}
                          </div>
                          <p className="text-sm text-gray-600">{community.memberCount.toLocaleString()} members</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {community.onlineCount} online
                      </Badge>
                    </div>
                    
                    <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">{community.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{community.memberCount.toLocaleString()}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>{community.onlineCount}</span>
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {canManageCommunity(community.id) && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {/* TODO: Navigate to community management */}}
                          >
                            <Settings className="h-4 w-4 mr-1" />
                            Manage
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => leaveCommunityMutation.mutate(community.id)}
                          disabled={leavingCommunityId === community.id}
                        >
                          {leavingCommunityId === community.id ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                              Leaving...
                            </>
                          ) : (
                            'Leave'
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Updates from Followed Communities */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Updates from Your Communities</h2>
          
          {communityPostsLoading ? (
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
          ) : communityPosts.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No updates yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Posts from your communities will appear here</p>
                <Button onClick={() => setShowContentDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Content
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {communityPosts.slice(0, 6).map((post: any) => (
                <Card key={post.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs ${getColorClass(post.community?.color || 'blue')}`}>
                        <i className={post.community?.icon || 'fas fa-users'}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {post.community?.name || 'Community'}
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

        {/* All Communities in the Area */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All Communities in the Area</h2>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search communities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">View:</span>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Category Filters */}
          <div className="mb-6">
            <ScrollArea className="w-full">
              <div className="flex space-x-2 pb-2">
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                      className="flex items-center gap-2 whitespace-nowrap"
                    >
                      <IconComponent className="h-4 w-4" />
                      {category.name}
                    </Button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Communities Grid */}
          {isLoading ? (
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
          ) : (
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {filteredCommunities.map((community) => (
                <Card key={community.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${getColorClass(community.color)}`}>
                          <i className={community.icon}></i>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-lg">{community.name}</h3>
                            {getRoleBadge(userRoles[community.id])}
                          </div>
                          <p className="text-sm text-gray-600">{community.memberCount.toLocaleString()} members</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {community.onlineCount} online
                      </Badge>
                    </div>
                    
                    <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">{community.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{community.memberCount.toLocaleString()}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>{community.onlineCount}</span>
                        </span>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => joinCommunityMutation.mutate(community.id)}
                        disabled={joiningCommunityId === community.id}
                      >
                        {joiningCommunityId === community.id ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600 mr-2"></div>
                            Joining...
                          </>
                        ) : (
                          'Join'
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* New Community Dialog */}
      <NewCommunityDialog 
        open={showNewCommunityDialog}
        onOpenChange={setShowNewCommunityDialog}
        currentUser={{ id: user?.id || 0, username: user?.username || '' }}
        onCommunityCreated={() => {
          setShowNewCommunityDialog(false);
        }}
      />

      {/* Content Creation Dialog */}
      <ContentCreationDialog
        isOpen={showContentDialog}
        onClose={() => setShowContentDialog(false)}
        contentType={contentDialogType}
      />
    </div>
  );
}
