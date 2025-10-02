import React, { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UniversalHeader } from '@/components/universal-header';
import { UniversalFooter } from '@/components/universal-footer';
import { 
  Users, 
  Calendar, 
  MapPin, 
  Globe,
  Settings,
  Shield,
  UserPlus,
  UserMinus,
  Trash2,
  Edit,
  MessageCircle,
  Heart,
  Share,
  MoreHorizontal,
  Clock,
  TrendingUp,
  Star,
  Eye,
  Plus
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { formatDistanceToNow } from 'date-fns';

export function CommunityPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('posts');
  const [showAdminMenu, setShowAdminMenu] = useState(false);

  // Fetch community data
  const { data: community, isLoading: communityLoading, error: communityError } = useQuery({
    queryKey: [`/api/communities/${id}`],
    enabled: !!id,
  });

  // Fetch community posts
  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: [`/api/communities/${id}/posts`],
    enabled: !!id,
  });

  // Fetch community members
  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: [`/api/communities/${id}/members`],
    enabled: !!id,
  });

  // Check if user is member
  const { data: membershipData } = useQuery({
    queryKey: [`/api/communities/${id}/membership`],
    enabled: !!id && !!user,
  });

  // Check user's role in community
  const { data: roleData } = useQuery({
    queryKey: [`/api/communities/${id}/role`],
    enabled: !!id && !!user,
  });

  const isMember = membershipData?.isMember || false;
  const userRole = roleData?.role || null;

  // Join community mutation
  const joinCommunityMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/communities/${id}/join`, {
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
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${id}/membership`] });
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${id}/members`] });
    },
  });

  // Leave community mutation
  const leaveCommunityMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/communities/${id}/leave`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to leave community');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${id}/membership`] });
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${id}/members`] });
    },
  });

  const isAdmin = userRole === 'admin';
  const isMaintainer = userRole === 'maintainer';
  const canManage = isAdmin || isMaintainer;

  if (communityLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col">
        <UniversalHeader showBackButton={true} backButtonText="Back to Communities" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading community...</p>
          </div>
        </div>
        <UniversalFooter />
      </div>
    );
  }

  if (communityError || !community) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col">
        <UniversalHeader showBackButton={true} backButtonText="Back to Communities" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Community not found</h1>
            <p className="text-gray-600 mb-4">The community you're looking for doesn't exist.</p>
            <Button onClick={() => setLocation('/communities/home')}>Go to Communities</Button>
          </div>
        </div>
        <UniversalFooter />
      </div>
    );
  }

  const handleJoinCommunity = () => {
    joinCommunityMutation.mutate();
  };

  const handleLeaveCommunity = () => {
    leaveCommunityMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col">
      {/* Universal Header */}
      <UniversalHeader 
        showBackButton={true}
        backButtonText="Back to Communities"
        title={community.name}
        subtitle={community.description}
      />

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Community Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Community Header Card */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl font-bold">
                      {community.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{community.name}</h1>
                  <p className="text-gray-600 mb-4">{community.description}</p>
                  
                  {/* Community Stats */}
                  <div className="flex justify-center space-x-6 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{community.memberCount || 0}</div>
                      <div className="text-sm text-gray-500">Members</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{community.onlineCount || 0}</div>
                      <div className="text-sm text-gray-500">Online</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{posts?.length || 0}</div>
                      <div className="text-sm text-gray-500">Posts</div>
                    </div>
                  </div>

                  {/* Join/Leave Button */}
                  {user && (
                    <div className="space-y-2">
                      {isMember ? (
                        <div className="space-y-2">
                          <Button 
                            onClick={handleLeaveCommunity}
                            disabled={leaveCommunityMutation.isPending}
                            variant="outline"
                            className="w-full"
                          >
                            {leaveCommunityMutation.isPending ? 'Leaving...' : 'Leave Community'}
                          </Button>
                          {canManage && (
                            <Button 
                              onClick={() => setShowAdminMenu(!showAdminMenu)}
                              className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                            >
                              <Settings className="h-4 w-4 mr-2" />
                              Manage Community
                            </Button>
                          )}
                        </div>
                      ) : (
                        <Button 
                          onClick={handleJoinCommunity}
                          disabled={joinCommunityMutation.isPending}
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                        >
                          {joinCommunityMutation.isPending ? 'Joining...' : 'Join Community'}
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Community Details */}
                  <div className="mt-6 space-y-3 text-sm text-gray-600">
                    {community.location && (
                      <div className="flex items-center justify-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{community.location}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Created {formatDistanceToNow(new Date(community.createdAt))} ago</span>
                    </div>
                    {community.website && (
                      <div className="flex items-center justify-center">
                        <Globe className="h-4 w-4 mr-2" />
                        <a href={community.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          Visit Website
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Members */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Active Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  {membersLoading ? (
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-3 animate-pulse">
                          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2 mt-1"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : members && members.length > 0 ? (
                    <div className="space-y-3">
                      {members.slice(0, 10).map((member: any) => (
                        <div key={member.id} className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.avatar || ""} />
                            <AvatarFallback>
                              {member.username?.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {member.username}
                            </p>
                            <p className="text-xs text-gray-500">
                              {member.status === 'online' ? 'Online' : 'Offline'}
                            </p>
                          </div>
                          {member.status === 'online' && (
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No members yet</p>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Right Content - Posts */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="posts">Posts</TabsTrigger>
                <TabsTrigger value="members">All Members</TabsTrigger>
                <TabsTrigger value="about">About</TabsTrigger>
              </TabsList>

              <TabsContent value="posts" className="space-y-6">
                {/* Create Post Button */}
                {isMember && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user?.avatar || ""} />
                          <AvatarFallback>
                            {user?.username?.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <Button 
                          variant="outline" 
                          className="flex-1 justify-start text-gray-500"
                          onClick={() => {/* TODO: Open create post dialog */}}
                        >
                          Share something with the community...
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Posts List */}
                {postsLoading ? (
                  <div className="space-y-6">
                    {[...Array(3)].map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                            <div className="flex-1">
                              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                              <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : posts && posts.length > 0 ? (
                  <div className="space-y-6">
                    {posts.map((post: any) => (
                      <Card key={post.id}>
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-3 mb-4">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={post.user?.avatar || ""} />
                              <AvatarFallback>
                                {post.user?.username?.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{post.user?.username}</p>
                              <p className="text-sm text-gray-500">
                                {formatDistanceToNow(new Date(post.createdAt))} ago
                              </p>
                            </div>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="mb-4">
                            <p className="text-gray-900">{post.content}</p>
                            {post.imageUrl && (
                              <img 
                                src={post.imageUrl} 
                                alt="Post image" 
                                className="mt-3 rounded-lg w-full max-w-md"
                              />
                            )}
                          </div>

                          <div className="flex items-center space-x-6 text-sm text-gray-500">
                            <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                              <Heart className="h-4 w-4" />
                              <span>{post.likesCount || 0}</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                              <MessageCircle className="h-4 w-4" />
                              <span>{post.commentsCount || 0}</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                              <Share className="h-4 w-4" />
                              <span>Share</span>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                      <p className="text-gray-500 mb-4">
                        {isMember ? 'Be the first to share something with the community!' : 'Join the community to see posts.'}
                      </p>
                      {!isMember && (
                        <Button onClick={handleJoinCommunity} className="bg-gradient-to-r from-blue-600 to-purple-600">
                          Join Community
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="members" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>All Members ({members?.length || 0})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      {membersLoading ? (
                        <div className="space-y-3">
                          {[...Array(10)].map((_, i) => (
                            <div key={i} className="flex items-center space-x-3 animate-pulse">
                              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                              <div className="flex-1">
                                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : members && members.length > 0 ? (
                        <div className="space-y-3">
                          {members.map((member: any) => (
                            <div key={member.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={member.avatar || ""} />
                                <AvatarFallback>
                                  {member.username?.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">
                                  {member.username}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {member.status === 'online' ? 'Online' : 'Offline'}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                {member.status === 'online' && (
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                )}
                                {canManage && (
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8">No members yet</p>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="about" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About {community.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                      <p className="text-gray-600">{community.description}</p>
                    </div>
                    
                    {community.rules && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Community Rules</h4>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-gray-600 whitespace-pre-line">{community.rules}</p>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Created</h4>
                        <p className="text-sm text-gray-600">
                          {formatDistanceToNow(new Date(community.createdAt))} ago
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Members</h4>
                        <p className="text-sm text-gray-600">{community.memberCount || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Universal Footer */}
      <UniversalFooter />
    </div>
  );
}
