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
  Eye,
  Settings
} from 'lucide-react';
import { useLocation } from 'wouter';
import NewCommunityDialog from '@/components/new-community-dialog';
import { ContentCreationDialog } from '@/components/content-creation-dialog';
import { UniversalHeader } from '@/components/universal-header';
import { UniversalFooter } from '@/components/universal-footer';
import { useAuth } from '@/hooks/use-auth';
import { useDarkMode } from '@/hooks/use-dark-mode';
import { formatTimeAgo } from '@/lib/utils';

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
    <div className={`min-h-screen font-inter flex flex-col ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'}`}>
      {/* Universal Header */}
      <UniversalHeader 
        showSearch={true}
        searchPlaceholder="Search communities..."
        onSearchChange={setSearchQuery}
        showCreateButton={true}
        createButtonText="Create Community"
        onCreateClick={() => setShowNewCommunityDialog(true)}
        title="Communities"
        subtitle="Discover and connect with like-minded people"
      />

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto px-4 py-8 space-y-8">
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

      {/* Universal Footer */}
      <UniversalFooter />
    </div>
  );
}
