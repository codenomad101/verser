import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal,
  Plus,
  TrendingUp,
  Clock,
  Eye,
  ThumbsUp,
  Reply,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useDarkMode } from '@/hooks/use-dark-mode';
import { useLocation } from 'wouter';
import { UniversalHeader } from '@/components/universal-header';
import { UniversalFooter } from '@/components/universal-footer';
import { ContentCreationDialog } from '@/components/content-creation-dialog';

export function NewHomePage() {
  const { user } = useAuth();
  const { isDarkMode } = useDarkMode();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const [showContentDialog, setShowContentDialog] = useState(false);
  const [contentDialogType, setContentDialogType] = useState<'post' | 'short' | 'video'>('post');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Fetch user's communities
  const { data: userCommunities = [], isLoading: userCommunitiesLoading } = useQuery({
    queryKey: ['/api/communities/user', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/communities/user/${user.id}`);
      if (!response.ok) return [];
      return response.json();
    },
  });

  // Fetch trending posts
  const { data: trendingPosts = [], isLoading: trendingLoading } = useQuery({
    queryKey: ['/api/posts/trending'],
    queryFn: async () => {
      const response = await fetch('/api/posts/trending');
      if (!response.ok) return [];
      return response.json();
    },
  });

  // Fetch recent posts from user's communities
  const { data: communityPosts = [], isLoading: communityPostsLoading } = useQuery({
    queryKey: ['/api/posts/community-feed', user?.id],
    queryFn: async () => {
      if (!user?.id || !userCommunities.length) return [];
      
      const posts = await Promise.all(
        userCommunities.map(async (community: any) => {
          const response = await fetch(`/api/communities/${community.id}/posts`);
          const posts = await response.json();
          return { community, posts };
        })
      );
      return posts.flat();
    },
    enabled: !!user?.id && userCommunities.length > 0,
  });

  // Fetch recent comments
  const { data: recentComments = [], isLoading: commentsLoading } = useQuery({
    queryKey: ['/api/comments/recent'],
    queryFn: async () => {
      const response = await fetch('/api/comments/recent');
      if (!response.ok) return [];
      return response.json();
    },
  });

  const handleCreateContent = (type: 'post' | 'short' | 'video') => {
    setContentDialogType(type);
    setShowContentDialog(true);
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getColorClass = (color: string) => {
    const colorMap: { [key: string]: string } = {
      blue: 'from-blue-400 to-blue-600',
      purple: 'from-purple-400 to-purple-600',
      green: 'from-green-400 to-green-600',
      yellow: 'from-yellow-400 to-yellow-600',
      red: 'from-red-400 to-red-600',
      pink: 'from-pink-400 to-pink-600',
      indigo: 'from-indigo-400 to-indigo-600',
      gray: 'from-gray-400 to-gray-600',
    };
    return colorMap[color] || 'from-blue-400 to-blue-600';
  };

  return (
    <div className={`min-h-screen font-inter flex flex-col relative overflow-hidden ${isDarkMode ? 'bg-gray-950' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'}`}>
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-0 -left-40 w-96 h-96 ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-400/30'} rounded-full blur-3xl animate-blob`}></div>
        <div className={`absolute top-0 right-0 w-96 h-96 ${isDarkMode ? 'bg-purple-900/20' : 'bg-purple-400/30'} rounded-full blur-3xl animate-blob animation-delay-2000`}></div>
        <div className={`absolute -bottom-40 left-1/2 w-96 h-96 ${isDarkMode ? 'bg-pink-900/20' : 'bg-pink-400/30'} rounded-full blur-3xl animate-blob animation-delay-4000`}></div>
      </div>

      {/* Universal Header */}
      <div className="relative z-10">
        <UniversalHeader 
          title="Home"
          subtitle="Your personalized feed"
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto px-4 py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Communities */}
          <div className="lg:col-span-1">
            <div className={`sticky top-8 backdrop-blur-xl rounded-3xl border transition-all duration-500 ${
              isDarkMode 
                ? 'bg-gray-900/40 border-gray-800/50 shadow-2xl shadow-blue-500/10' 
                : 'bg-white/40 border-white/60 shadow-2xl shadow-blue-200/50'
            }`}>
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-blue-500/20' : 'bg-blue-500/10'}`}>
                    <Users className="h-5 w-5 text-blue-500" />
                  </div>
                  <h3 className="font-semibold text-lg">Your Communities</h3>
                </div>
                
                <ScrollArea className="h-96 pr-4">
                  {userCommunitiesLoading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-3 p-3 rounded-2xl bg-gray-200/50 animate-pulse">
                          <div className="w-12 h-12 bg-gray-300 rounded-2xl" />
                          <div className="flex-1">
                            <div className="h-4 bg-gray-300 rounded-lg mb-2 w-3/4" />
                            <div className="h-3 bg-gray-300 rounded-lg w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : userCommunities.length > 0 ? (
                    <div className="space-y-2">
                      {userCommunities.map((community: any, idx: number) => (
                        <div 
                          key={community.id}
                          className={`group flex items-center space-x-3 p-3 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 ${
                            isDarkMode 
                              ? 'hover:bg-gray-800/60 active:bg-gray-800/80' 
                              : 'hover:bg-white/60 active:bg-white/80'
                          }`}
                          style={{ animationDelay: `${idx * 50}ms` }}
                          onClick={() => setLocation(`/community/${community.id}`)}
                        >
                          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getColorClass(community.color)} flex items-center justify-center text-white shadow-lg transform transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110`}>
                            <i className={community.icon}></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm truncate">{community.name}</h4>
                            <p className="text-xs text-gray-500">{community.memberCount} members</p>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className={`w-20 h-20 rounded-3xl ${isDarkMode ? 'bg-gray-800/60' : 'bg-gray-100/60'} flex items-center justify-center mx-auto mb-4`}>
                        <Users className="h-10 w-10 text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-sm mb-4">No communities yet</p>
                      <Button 
                        size="sm" 
                        className="rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        onClick={() => setLocation('/communities/home')}
                      >
                        Explore Communities
                      </Button>
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="feed" className="space-y-6">
              <div className="flex items-center justify-between">
                <div className={`backdrop-blur-xl rounded-2xl p-1 border ${
                  isDarkMode 
                    ? 'bg-gray-900/40 border-gray-800/50' 
                    : 'bg-white/40 border-white/60'
                }`}>
                  <TabsList className="bg-transparent">
                    <TabsTrigger 
                      value="feed" 
                      className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all duration-300"
                    >
                      Feed
                    </TabsTrigger>
                    <TabsTrigger 
                      value="trending"
                      className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-pink-500 data-[state=active]:text-white transition-all duration-300"
                    >
                      Trending
                    </TabsTrigger>
                    <TabsTrigger 
                      value="recent"
                      className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-500 data-[state=active]:text-white transition-all duration-300"
                    >
                      Recent
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <Button
                  size="sm"
                  onClick={() => handleCreateContent('post')}
                  className="rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group"
                >
                  <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                  Create Post
                </Button>
              </div>

              <TabsContent value="feed" className="space-y-4">
                {communityPostsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className={`backdrop-blur-xl rounded-3xl border p-6 animate-pulse ${
                        isDarkMode 
                          ? 'bg-gray-900/40 border-gray-800/50' 
                          : 'bg-white/40 border-white/60'
                      }`}>
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-12 h-12 bg-gray-300 rounded-2xl" />
                          <div className="flex-1">
                            <div className="h-4 bg-gray-300 rounded-lg mb-2 w-1/3" />
                            <div className="h-3 bg-gray-300 rounded-lg w-1/4" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-300 rounded-lg" />
                          <div className="h-4 bg-gray-300 rounded-lg w-3/4" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : communityPosts.length > 0 ? (
                  communityPosts.slice(0, 10).map((item: any, idx: number) => (
                    <div 
                      key={`${item.community.id}-${item.id}`}
                      className={`backdrop-blur-xl rounded-3xl border transition-all duration-500 transform hover:scale-[1.02] hover:-translate-y-1 ${
                        isDarkMode 
                          ? 'bg-gray-900/40 border-gray-800/50 hover:bg-gray-900/60 hover:shadow-2xl hover:shadow-blue-500/20' 
                          : 'bg-white/40 border-white/60 hover:bg-white/60 hover:shadow-2xl hover:shadow-blue-200/50'
                      }`}
                      style={{ animationDelay: `${idx * 100}ms` }}
                      onMouseEnter={() => setHoveredCard(`feed-${item.id}`)}
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      <div className="p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getColorClass(item.community.color)} flex items-center justify-center text-white shadow-lg transform transition-all duration-300 ${
                            hoveredCard === `feed-${item.id}` ? 'rotate-12 scale-110' : ''
                          }`}>
                            <i className={item.community.icon}></i>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold">{item.community.name}</h4>
                              <Badge variant="secondary" className="text-xs rounded-full px-2 py-0.5">
                                Community
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500">{formatTimeAgo(item.createdAt)}</p>
                          </div>
                          <Button variant="ghost" size="sm" className="rounded-xl hover:bg-gray-200/50 transition-all duration-300">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {item.title && (
                          <h3 className="font-bold text-lg mb-2 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                            {item.title}
                          </h3>
                        )}
                        
                        {item.content && (
                          <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">{item.content}</p>
                        )}
                        
                        {item.imageUrl && (
                          <div className="mb-4 overflow-hidden rounded-2xl">
                            <img 
                              src={item.imageUrl} 
                              alt="Post content" 
                              className="w-full h-64 object-cover transform transition-transform duration-500 hover:scale-110"
                            />
                          </div>
                        )}
                        
                        <div className={`flex items-center justify-between pt-4 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" className="rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-all duration-300 group">
                              <Heart className="h-4 w-4 mr-2 group-hover:fill-red-500 transition-all duration-300" />
                              {item.likes || 0}
                            </Button>
                            <Button variant="ghost" size="sm" className="rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-500 transition-all duration-300">
                              <MessageCircle className="h-4 w-4 mr-2" />
                              {item.comments || 0}
                            </Button>
                            <Button variant="ghost" size="sm" className="rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-500 transition-all duration-300">
                              <Share2 className="h-4 w-4 mr-2" />
                              Share
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={`backdrop-blur-xl rounded-3xl border p-12 text-center ${
                    isDarkMode 
                      ? 'bg-gray-900/40 border-gray-800/50' 
                      : 'bg-white/40 border-white/60'
                  }`}>
                    <div className={`w-24 h-24 rounded-3xl ${isDarkMode ? 'bg-gray-800/60' : 'bg-gray-100/60'} flex items-center justify-center mx-auto mb-6`}>
                      <Users className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">No posts yet</h3>
                    <p className="text-gray-500 mb-6">Join communities to see posts in your feed</p>
                    <Button 
                      onClick={() => setLocation('/communities/home')}
                      className="rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      Explore Communities
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="trending" className="space-y-4">
                {trendingLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className={`backdrop-blur-xl rounded-3xl border p-6 animate-pulse ${
                        isDarkMode 
                          ? 'bg-gray-900/40 border-gray-800/50' 
                          : 'bg-white/40 border-white/60'
                      }`}>
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-12 h-12 bg-gray-300 rounded-2xl" />
                          <div className="flex-1">
                            <div className="h-4 bg-gray-300 rounded-lg mb-2 w-1/3" />
                            <div className="h-3 bg-gray-300 rounded-lg w-1/4" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : trendingPosts.length > 0 ? (
                  trendingPosts.slice(0, 10).map((post: any, idx: number) => (
                    <div 
                      key={post.id}
                      className={`backdrop-blur-xl rounded-3xl border transition-all duration-500 transform hover:scale-[1.02] hover:-translate-y-1 ${
                        isDarkMode 
                          ? 'bg-gray-900/40 border-gray-800/50 hover:bg-gray-900/60 hover:shadow-2xl hover:shadow-orange-500/20' 
                          : 'bg-white/40 border-white/60 hover:bg-white/60 hover:shadow-2xl hover:shadow-orange-200/50'
                      }`}
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      <div className="p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <Avatar className="w-12 h-12 ring-2 ring-orange-500/50 ring-offset-2 ring-offset-transparent">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.userId}`} />
                            <AvatarFallback className="bg-gradient-to-br from-orange-400 to-pink-600 text-white">
                              {post.userId}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold">User {post.userId}</h4>
                              <Badge className="text-xs rounded-full px-2 py-0.5 bg-gradient-to-r from-orange-500 to-pink-500 border-0 text-white">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                Trending
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500">{formatTimeAgo(post.createdAt)}</p>
                          </div>
                        </div>
                        
                        {post.title && (
                          <h3 className="font-bold text-lg mb-2 bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                            {post.title}
                          </h3>
                        )}
                        
                        {post.content && (
                          <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">{post.content}</p>
                        )}
                        
                        <div className={`flex items-center justify-between pt-4 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" className="rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-all duration-300 group">
                              <Heart className="h-4 w-4 mr-2 group-hover:fill-red-500" />
                              {post.likes || 0}
                            </Button>
                            <Button variant="ghost" size="sm" className="rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-500 transition-all duration-300">
                              <MessageCircle className="h-4 w-4 mr-2" />
                              {post.comments || 0}
                            </Button>
                            <Button variant="ghost" size="sm" className="rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-500 transition-all duration-300">
                              <Share2 className="h-4 w-4 mr-2" />
                              Share
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={`backdrop-blur-xl rounded-3xl border p-12 text-center ${
                    isDarkMode 
                      ? 'bg-gray-900/40 border-gray-800/50' 
                      : 'bg-white/40 border-white/60'
                  }`}>
                    <div className={`w-24 h-24 rounded-3xl ${isDarkMode ? 'bg-gray-800/60' : 'bg-gray-100/60'} flex items-center justify-center mx-auto mb-6`}>
                      <TrendingUp className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">No trending posts</h3>
                    <p className="text-gray-500">Check back later for trending content</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="recent" className="space-y-4">
                {commentsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className={`backdrop-blur-xl rounded-3xl border p-6 animate-pulse ${
                        isDarkMode 
                          ? 'bg-gray-900/40 border-gray-800/50' 
                          : 'bg-white/40 border-white/60'
                      }`}>
                        <div className="h-4 bg-gray-300 rounded-lg mb-2" />
                        <div className="h-4 bg-gray-300 rounded-lg w-3/4" />
                      </div>
                    ))}
                  </div>
                ) : recentComments.length > 0 ? (
                  recentComments.slice(0, 10).map((comment: any, idx: number) => (
                    <div 
                      key={comment.id}
                      className={`backdrop-blur-xl rounded-3xl border transition-all duration-500 transform hover:scale-[1.02] hover:-translate-y-1 ${
                        isDarkMode 
                          ? 'bg-gray-900/40 border-gray-800/50 hover:bg-gray-900/60 hover:shadow-2xl hover:shadow-green-500/20' 
                          : 'bg-white/40 border-white/60 hover:bg-white/60 hover:shadow-2xl hover:shadow-green-200/50'
                      }`}
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      <div className="p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <Avatar className="w-12 h-12 ring-2 ring-green-500/50 ring-offset-2 ring-offset-transparent">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.userId}`} />
                            <AvatarFallback className="bg-gradient-to-br from-green-400 to-teal-600 text-white">
                              {comment.userId}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold">User {comment.userId}</h4>
                              <Badge className="text-xs rounded-full px-2 py-0.5 bg-gradient-to-r from-green-500 to-teal-500 border-0 text-white">
                                <Clock className="h-3 w-3 mr-1" />
                                Recent
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500">{formatTimeAgo(comment.createdAt)}</p>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">{comment.content}</p>
                        
                        <div className={`flex items-center justify-between pt-4 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" className="rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-500 transition-all duration-300">
                              <ThumbsUp className="h-4 w-4 mr-2" />
                              {comment.likes || 0}
                            </Button>
                            <Button variant="ghost" size="sm" className="rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-500 transition-all duration-300">
                              <Reply className="h-4 w-4 mr-2" />
                              Reply
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={`backdrop-blur-xl rounded-3xl border p-12 text-center ${
                    isDarkMode 
                      ? 'bg-gray-900/40 border-gray-800/50' 
                      : 'bg-white/40 border-white/60'
                  }`}>
                    <div className={`w-24 h-24 rounded-3xl ${isDarkMode ? 'bg-gray-800/60' : 'bg-gray-100/60'} flex items-center justify-center mx-auto mb-6`}>
                      <MessageCircle className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">No recent comments</h3>
                    <p className="text-gray-500">Be the first to comment on posts</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar - Quick Actions */}
          <div className="lg:col-span-1">
            <div className="space-y-6 sticky top-8">
              {/* Quick Actions */}
              <div className={`backdrop-blur-xl rounded-3xl border transition-all duration-500 ${
                isDarkMode 
                  ? 'bg-gray-900/40 border-gray-800/50 shadow-2xl shadow-purple-500/10' 
                  : 'bg-white/40 border-white/60 shadow-2xl shadow-purple-200/50'
              }`}>
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-purple-500/20' : 'bg-purple-500/10'}`}>
                      <Sparkles className="h-5 w-5 text-purple-500" />
                    </div>
                    <h3 className="font-semibold text-lg">Quick Actions</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <Button 
                      className="w-full justify-start rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 border-0 text-left transition-all duration-300 transform hover:scale-105 group"
                      variant="outline"
                      onClick={() => handleCreateContent('post')}
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mr-3 group-hover:rotate-12 transition-transform duration-300">
                        <Plus className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-medium">Create Post</span>
                    </Button>
                    
                    <Button 
                      className="w-full justify-start rounded-2xl bg-gradient-to-r from-pink-500/10 to-rose-500/10 hover:from-pink-500/20 hover:to-rose-500/20 border-0 text-left transition-all duration-300 transform hover:scale-105 group"
                      variant="outline"
                      onClick={() => handleCreateContent('short')}
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center mr-3 group-hover:rotate-12 transition-transform duration-300">
                        <Plus className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-medium">Create Short</span>
                    </Button>
                    
                    <Button 
                      className="w-full justify-start rounded-2xl bg-gradient-to-r from-orange-500/10 to-red-500/10 hover:from-orange-500/20 hover:to-red-500/20 border-0 text-left transition-all duration-300 transform hover:scale-105 group"
                      variant="outline"
                      onClick={() => handleCreateContent('video')}
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mr-3 group-hover:rotate-12 transition-transform duration-300">
                        <Plus className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-medium">Create Video</span>
                    </Button>
                    
                    <Button 
                      className="w-full justify-start rounded-2xl bg-gradient-to-r from-green-500/10 to-teal-500/10 hover:from-green-500/20 hover:to-teal-500/20 border-0 text-left transition-all duration-300 transform hover:scale-105 group"
                      variant="outline"
                      onClick={() => setLocation('/communities/home')}
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center mr-3 group-hover:rotate-12 transition-transform duration-300">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-medium">Explore Communities</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Trending Communities */}
              <div className={`backdrop-blur-xl rounded-3xl border transition-all duration-500 ${
                isDarkMode 
                  ? 'bg-gray-900/40 border-gray-800/50 shadow-2xl shadow-orange-500/10' 
                  : 'bg-white/40 border-white/60 shadow-2xl shadow-orange-200/50'
              }`}>
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-orange-500/20' : 'bg-orange-500/10'}`}>
                      <TrendingUp className="h-5 w-5 text-orange-500" />
                    </div>
                    <h3 className="font-semibold text-lg">Trending</h3>
                  </div>
                  
                  <div className="space-y-2">
                    {userCommunities.slice(0, 5).map((community: any, idx: number) => (
                      <div 
                        key={community.id}
                        className={`group flex items-center space-x-3 p-3 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                          isDarkMode 
                            ? 'hover:bg-gray-800/60' 
                            : 'hover:bg-white/60'
                        }`}
                        style={{ animationDelay: `${idx * 50}ms` }}
                        onClick={() => setLocation(`/community/${community.id}`)}
                      >
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getColorClass(community.color)} flex items-center justify-center text-white text-sm shadow-lg transform transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110`}>
                          <i className={community.icon}></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm truncate">{community.name}</h4>
                          <p className="text-xs text-gray-500">{community.memberCount} members</p>
                        </div>
                        <Badge className="text-xs rounded-full px-2 py-0.5 bg-gradient-to-r from-orange-500 to-pink-500 border-0 text-white">
                          <TrendingUp className="h-3 w-3" />
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Creation Dialog */}
      <ContentCreationDialog
        open={showContentDialog}
        onOpenChange={setShowContentDialog}
        type={contentDialogType}
        onContentCreated={() => {
          setShowContentDialog(false);
          queryClient.invalidateQueries({ queryKey: ['/api/posts/trending'] });
          queryClient.invalidateQueries({ queryKey: ['/api/posts/community-feed'] });
        }}
      />

      {/* Universal Footer */}
      <div className="relative z-10">
        <UniversalFooter />
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(20px, -50px) scale(1.1);
          }
          50% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          75% {
            transform: translate(50px, 50px) scale(1.05);
          }
        }

        .animate-blob {
          animation: blob 20s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}