import React, { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
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
  Heart, 
  MessageCircle, 
  Share, 
  MoreHorizontal,
  UserPlus,
  UserMinus,
  Shield,
  ShieldOff,
  Calendar,
  MapPin,
  Link as LinkIcon,
  Users,
  UserCheck,
  Settings,
  ArrowLeft
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';

interface UserProfilePageProps {
  userId?: number;
}

export function UserProfilePage({ userId: propUserId }: UserProfilePageProps) {
  const { user: currentUser } = useAuth();
  const [, setLocation] = useLocation();
  const params = useParams();
  const queryClient = useQueryClient();
  
  // Get userId from props, params, or current user
  const userId = propUserId || (params.id ? parseInt(params.id) : currentUser?.id);
  const isOwnProfile = userId === currentUser?.id;

  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Use current authenticated user as profile user
  const profileUser = currentUser;
  const userLoading = false; // We already have the user data from auth

  // Fetch user posts
  const { data: userPosts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['/api/users', userId, 'posts'],
    queryFn: () => fetch(`/api/users/${userId}/posts`).then(res => res.json()),
    enabled: !!userId,
  });

  // Fetch user's communities
  const { data: userCommunities = [], isLoading: communitiesLoading } = useQuery({
    queryKey: ['/api/communities/user', userId],
    queryFn: async () => {
      if (!userId) return [];
      const response = await fetch(`/api/communities/user/${userId}`);
      if (!response.ok) return [];
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: !!userId,
  });

  // Fetch user's videos and shorts (filtered from posts)
  const { data: userVideos = [], isLoading: videosLoading } = useQuery({
    queryKey: ['/api/users', userId, 'videos'],
    queryFn: async () => {
      if (!userId) return [];
      const response = await fetch(`/api/users/${userId}/posts`);
      if (!response.ok) return [];
      const posts = await response.json();
      return Array.isArray(posts) ? posts.filter((post: any) => post.type === 'video') : [];
    },
    enabled: !!userId,
  });

  const { data: userShorts = [], isLoading: shortsLoading } = useQuery({
    queryKey: ['/api/users', userId, 'shorts'],
    queryFn: async () => {
      if (!userId) return [];
      const response = await fetch(`/api/users/${userId}/posts`);
      if (!response.ok) return [];
      const posts = await response.json();
      return Array.isArray(posts) ? posts.filter((post: any) => post.type === 'short') : [];
    },
    enabled: !!userId,
  });

  // Fetch followers
  const { data: followers = [], error: followersError } = useQuery({
    queryKey: ['/api/users', userId, 'followers'],
    queryFn: async () => {
      console.log('Fetching followers for user:', userId);
      const response = await fetch(`/api/users/${userId}/followers`);
      console.log('Followers response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Followers error response:', errorText);
        throw new Error(`Failed to fetch followers: ${response.status}`);
      }
      const data = await response.json();
      console.log('Followers data:', data);
      return Array.isArray(data) ? data : [];
    },
    enabled: !!userId,
    retry: 1,
  });

  // Fetch following
  const { data: following = [], error: followingError } = useQuery({
    queryKey: ['/api/users', userId, 'following'],
    queryFn: async () => {
      console.log('Fetching following for user:', userId);
      const response = await fetch(`/api/users/${userId}/following`);
      console.log('Following response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Following error response:', errorText);
        throw new Error(`Failed to fetch following: ${response.status}`);
      }
      const data = await response.json();
      console.log('Following data:', data);
      return Array.isArray(data) ? data : [];
    },
    enabled: !!userId,
    retry: 1,
  });

  // Check follow status
  const { data: isFollowing = false } = useQuery({
    queryKey: ['/api/users', userId, 'follow-status'],
    queryFn: async () => {
      if (!currentUser || isOwnProfile) return false;
      const response = await fetch(`/api/users/${userId}/follow-status`);
      return response.json();
    },
    enabled: !!currentUser && !!userId && !isOwnProfile,
  });

  // Follow/Unfollow mutation
  const followMutation = useMutation({
    mutationFn: async (action: 'follow' | 'unfollow') => {
      const method = action === 'follow' ? 'POST' : 'DELETE';
      return apiRequest(method, `/api/users/${userId}/follow`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'follow-status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'followers'] });
    },
  });

  // Block/Unblock mutation
  const blockMutation = useMutation({
    mutationFn: async (action: 'block' | 'unblock') => {
      const method = action === 'block' ? 'POST' : 'DELETE';
      return apiRequest(method, `/api/users/${userId}/block`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId] });
    },
  });

  const handleFollow = () => {
    followMutation.mutate(isFollowing ? 'unfollow' : 'follow');
  };

  const handleBlock = () => {
    blockMutation.mutate('block');
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">User not found</h1>
          <p className="text-gray-600 mb-4">The user you're looking for doesn't exist.</p>
          <Button onClick={() => setLocation('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col">
      {/* Universal Header */}
      <UniversalHeader 
        showBackButton={true}
        backButtonText="Back to Home"
        title={profileUser.username}
        subtitle={`${profileUser.followersCount} followers • ${profileUser.followingCount} following`}
      />

      {/* Main Content */}
      <div className="flex-1 max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Profile Picture */}
              <div className="flex-shrink-0">
                <Avatar className="h-32 w-32 mx-auto md:mx-0">
                  <AvatarImage src={profileUser.avatar || ""} />
                  <AvatarFallback className="text-3xl">
                    {profileUser.username?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Profile Info */}
              <div className="flex-1 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{profileUser.username}</h1>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={profileUser.status === "online" ? "default" : "secondary"}>
                        {profileUser.status === "online" ? "Online" : "Offline"}
                      </Badge>
                      {profileUser.isVerified && (
                        <Badge variant="outline" className="text-blue-600 border-blue-600">
                          <UserCheck className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {!isOwnProfile && (
                      <>
                        <Button
                          onClick={handleFollow}
                          disabled={followMutation.isPending}
                          variant={isFollowing ? "outline" : "default"}
                          className="flex items-center gap-2"
                        >
                          {isFollowing ? <UserMinus className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                          {followMutation.isPending 
                            ? 'Loading...' 
                            : isFollowing 
                              ? 'Unfollow' 
                              : 'Follow'
                          }
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleBlock}
                          disabled={blockMutation.isPending}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Shield className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    {isOwnProfile && (
                      <Button
                        variant="outline"
                        onClick={() => setLocation('/settings')}
                        className="flex items-center gap-2"
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </Button>
                    )}
                  </div>
                </div>

                {/* Bio and Info */}
                <div className="space-y-2">
                  {profileUser.bio && (
                    <p className="text-gray-700 font-medium">{profileUser.bio}</p>
                  )}
                  {profileUser.about && (
                    <p className="text-gray-600">{profileUser.about}</p>
                  )}
                </div>

                {/* Profile Stats */}
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {formatDistanceToNow(new Date(profileUser.createdAt))} ago</span>
                  </div>
                  {profileUser.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{profileUser.location}</span>
                    </div>
                  )}
                  {profileUser.website && (
                    <div className="flex items-center gap-1">
                      <LinkIcon className="h-4 w-4" />
                      <a 
                        href={profileUser.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Website
                      </a>
                    </div>
                  )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{userPosts.length}</div>
                    <div className="text-sm text-gray-500">Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{profileUser.followersCount}</div>
                    <div className="text-sm text-gray-500">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{profileUser.followingCount}</div>
                    <div className="text-sm text-gray-500">Following</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Tabs defaultValue="posts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="shorts">Shorts</TabsTrigger>
            <TabsTrigger value="communities">Communities</TabsTrigger>
            <TabsTrigger value="followers">Followers</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
          </TabsList>

          {/* Posts Tab */}
          <TabsContent value="posts">
            <Card>
              <CardHeader>
                <CardTitle>Posts</CardTitle>
              </CardHeader>
              <CardContent>
                {postsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-pulse space-y-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ) : userPosts.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
                    <p className="text-gray-600">
                      {isOwnProfile ? "Start sharing your thoughts!" : "This user hasn't posted anything yet."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userPosts.map((post: any) => (
                      <div key={post.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={profileUser.avatar || ""} />
                            <AvatarFallback>
                              {profileUser.username?.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-medium">{profileUser.username}</span>
                              <span className="text-sm text-gray-500">
                                {formatDistanceToNow(new Date(post.createdAt))} ago
                              </span>
                              {post.isTrending && (
                                <Badge variant="secondary">Trending</Badge>
                              )}
                            </div>
                            {post.title && (
                              <h3 className="font-semibold mb-2">{post.title}</h3>
                            )}
                            <p className="text-gray-700 mb-3">{post.content}</p>
                            {post.imageUrl && (
                              <img 
                                src={post.imageUrl} 
                                alt="Post image" 
                                className="rounded-lg max-w-full h-auto mb-3"
                              />
                            )}
                            {post.tags && post.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {post.tags.map((tag: string, index: number) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    #{tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Heart className="h-4 w-4" />
                                <span>{post.likes || 0}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MessageCircle className="h-4 w-4" />
                                <span>{post.comments || 0}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Share className="h-4 w-4" />
                                <span>{post.shares || 0}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Followers Tab */}
          <TabsContent value="followers">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Followers ({Array.isArray(followers) ? followers.length : 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {followersError ? (
                      <div className="text-center py-8 text-red-500">
                        <Users className="h-12 w-12 mx-auto mb-4 text-red-300" />
                        <p>Error loading followers</p>
                        <Button size="sm" variant="outline" onClick={() => window.location.reload()} className="mt-2">
                          Try Again
                        </Button>
                      </div>
                    ) : !Array.isArray(followers) || followers.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No followers yet</p>
                      </div>
                    ) : (
                      followers.map((follower: any) => (
                        <div key={follower.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={follower.avatar || ""} />
                            <AvatarFallback>
                              {follower.username?.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{follower.username}</span>
                              {follower.isVerified && (
                                <Badge variant="outline" className="text-blue-600 border-blue-600 text-xs">
                                  <UserCheck className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">
                              {follower.bio || 'No bio available'}
                            </p>
                          </div>
                          {!isOwnProfile && follower.id !== currentUser?.id && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setLocation(`/profile/${follower.id}`)}
                            >
                              View Profile
                            </Button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Following Tab */}
          <TabsContent value="following">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Following ({Array.isArray(following) ? following.length : 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {followingError ? (
                      <div className="text-center py-8 text-red-500">
                        <UserCheck className="h-12 w-12 mx-auto mb-4 text-red-300" />
                        <p>Error loading following</p>
                        <Button size="sm" variant="outline" onClick={() => window.location.reload()} className="mt-2">
                          Try Again
                        </Button>
                      </div>
                    ) : !Array.isArray(following) || following.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <UserCheck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Not following anyone yet</p>
                      </div>
                    ) : (
                      following.map((followed: any) => (
                        <div key={followed.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={followed.avatar || ""} />
                            <AvatarFallback>
                              {followed.username?.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{followed.username}</span>
                              {followed.isVerified && (
                                <Badge variant="outline" className="text-blue-600 border-blue-600 text-xs">
                                  <UserCheck className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">
                              {followed.bio || 'No bio available'}
                            </p>
                          </div>
                          {!isOwnProfile && followed.id !== currentUser?.id && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setLocation(`/profile/${followed.id}`)}
                            >
                              View Profile
                            </Button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos">
            <Card>
              <CardHeader>
                <CardTitle>Videos ({Array.isArray(userVideos) ? userVideos.length : 0})</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {videosLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-pulse space-y-4">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ) : !Array.isArray(userVideos) || userVideos.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No videos yet</p>
                      </div>
                    ) : (
                      userVideos.map((video: any) => (
                        <div key={video.id} className="border rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <div className="flex-1">
                              <p className="text-sm text-gray-600 mb-2">{video.content}</p>
                              {video.videoUrl && (
                                <div className="bg-gray-100 rounded-lg p-4 text-center">
                                  <p className="text-sm text-gray-500">Video: {video.videoUrl}</p>
                                </div>
                              )}
                              <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                                <span>{formatDistanceToNow(new Date(video.createdAt))} ago</span>
                                <span className="flex items-center space-x-1">
                                  <Heart className="h-3 w-3" />
                                  <span>{video.likesCount || 0}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <MessageCircle className="h-3 w-3" />
                                  <span>{video.commentsCount || 0}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shorts Tab */}
          <TabsContent value="shorts">
            <Card>
              <CardHeader>
                <CardTitle>Shorts ({Array.isArray(userShorts) ? userShorts.length : 0})</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {shortsLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-pulse space-y-4">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ) : !Array.isArray(userShorts) || userShorts.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No shorts yet</p>
                      </div>
                    ) : (
                      userShorts.map((short: any) => (
                        <div key={short.id} className="border rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <div className="flex-1">
                              <p className="text-sm text-gray-600 mb-2">{short.content}</p>
                              {short.videoUrl && (
                                <div className="bg-gray-100 rounded-lg p-4 text-center">
                                  <p className="text-sm text-gray-500">Short: {short.videoUrl}</p>
                                </div>
                              )}
                              <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                                <span>{formatDistanceToNow(new Date(short.createdAt))} ago</span>
                                <span className="flex items-center space-x-1">
                                  <Heart className="h-3 w-3" />
                                  <span>{short.likesCount || 0}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <MessageCircle className="h-3 w-3" />
                                  <span>{short.commentsCount || 0}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Communities Tab */}
          <TabsContent value="communities">
            <Card>
              <CardHeader>
                <CardTitle>Communities ({Array.isArray(userCommunities) ? userCommunities.length : 0})</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {communitiesLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-pulse space-y-4">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ) : !Array.isArray(userCommunities) || userCommunities.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No communities yet</p>
                      </div>
                    ) : (
                      userCommunities.map((community: any) => (
                        <div key={community.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white bg-blue-500`}>
                            <span className="text-sm font-semibold">{community.name?.charAt(0)}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{community.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {community.memberCount} members
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500">{community.description}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Universal Footer */}
      <UniversalFooter />
    </div>
  );
}
