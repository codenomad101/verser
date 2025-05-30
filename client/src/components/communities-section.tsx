import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Search, UserPlus, Heart, MessageCircle, Share, Bookmark, Image, Code, Link, ArrowLeft } from "lucide-react";
import { format } from "date-fns";

interface CommunitiesSectionProps {
  currentUser: { id: number; username: string };
}

export default function CommunitiesSection({ currentUser }: CommunitiesSectionProps) {
  const [activeCommunity, setActiveCommunity] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [postContent, setPostContent] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [showNewCommunityDialog, setShowNewCommunityDialog] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { data: communities } = useQuery({
    queryKey: ["/api/communities"],
  });

  const { data: posts } = useQuery({
    queryKey: ["/api/communities", activeCommunity, "posts"],
    queryFn: () => fetch(`/api/communities/${activeCommunity}/posts`).then(res => res.json()),
    enabled: !!activeCommunity,
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: { userId: number; communityId: number; content: string }) => {
      return apiRequest("POST", "/api/posts", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/communities", activeCommunity, "posts"] });
      setPostContent("");
    },
  });

  const likePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      return apiRequest("PATCH", `/api/posts/${postId}/like`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/communities", activeCommunity, "posts"] });
    },
  });

  const handleCreatePost = () => {
    if (!postContent.trim() || !activeCommunity) return;

    createPostMutation.mutate({
      userId: currentUser.id,
      communityId: activeCommunity,
      content: postContent.trim(),
    });
  };

  const activeCommunityData = communities?.find(c => c.id === activeCommunity);
  const filteredCommunities = communities?.filter(comm =>
    comm.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getIconComponent = (iconClass: string) => {
    switch (iconClass) {
      case 'fas fa-code': return <Code className="text-lg" />;
      case 'fas fa-palette': return <div className="text-lg">🎨</div>;
      case 'fas fa-rocket': return <div className="text-lg">🚀</div>;
      case 'fas fa-camera': return <div className="text-lg">📷</div>;
      case 'fas fa-bullhorn': return <div className="text-lg">📢</div>;
      default: return <div className="text-lg">👥</div>;
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

  return (
    <div className="h-full flex flex-col">
      {/* Compact Profile Header */}
      <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold">AJ</span>
          </div>
          <div>
            <h3 className="font-semibold text-sm">alex_johnson</h3>
            <p className="text-xs text-green-100">Communities</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs">Active</span>
        </div>
      </div>

      <div className="flex-1 bg-gradient-to-br from-white via-green-50 to-blue-50">
        <section className="flex-1 flex h-full">
          {/* Communities List */}
          <div className="w-full lg:w-80 border-r border-green-200 flex flex-col bg-white/80 backdrop-blur-sm">
            <div className="p-4 border-b border-green-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold gradient-text">Communities</h2>
                <Button size="sm" className="modern-button text-white border-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="relative">
            <Input
              type="text"
              placeholder="Search communities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-2">
            {filteredCommunities?.map((community) => (
              <div
                key={community.id}
                onClick={() => setActiveCommunity(community.id)}
                className={`p-3 rounded-xl hover:bg-blue-50 cursor-pointer transition-colors ${
                  activeCommunity === community.id ? 'border-l-4 border-blue-500 bg-blue-25' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 ${getColorClass(community.color)} rounded-xl flex items-center justify-center text-white`}>
                    {getIconComponent(community.icon)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{community.name}</h3>
                    <p className="text-sm text-gray-500">
                      {community.memberCount?.toLocaleString()} members • {community.onlineCount} online
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

        {/* Community Feed */}
        <div className="hidden lg:flex lg:flex-1 lg:flex-col">
        {activeCommunityData && (
          <>
            <div className="p-4 border-b border-gray-100 bg-white">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 ${getColorClass(activeCommunityData.color)} rounded-xl flex items-center justify-center text-white`}>
                  {getIconComponent(activeCommunityData.icon)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{activeCommunityData.name}</h3>
                  <p className="text-sm text-gray-500">
                    {activeCommunityData.memberCount?.toLocaleString()} members • {activeCommunityData.onlineCount} online
                  </p>
                </div>
                <Button className="bg-blue-500 hover:bg-blue-600 text-sm font-medium">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Join
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4 bg-gray-50">
              <div className="space-y-4">
                {posts?.map((post: any) => (
                  <div key={post.id} className="bg-white rounded-xl p-4 shadow-sm hover-lift">
                    <div className="flex items-start space-x-3 mb-3">
                      <img 
                        src={post.user?.avatar || `https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=60&h=60&fit=crop&crop=face`}
                        alt={post.user?.username || 'User'}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">{post.user?.username || 'User'}</span>
                          <span className="text-blue-600 text-sm font-medium">@{post.user?.username || 'user'}</span>
                          <span className="text-gray-500 text-sm">
                            • {format(new Date(post.createdAt), 'h:mm a')}
                          </span>
                        </div>
                        {post.title && (
                          <h4 className="font-semibold text-gray-900 mt-1 mb-2">{post.title}</h4>
                        )}
                        <p className="text-gray-600 mb-3">{post.content}</p>
                        
                        {post.imageUrl && (
                          <img 
                            src={post.imageUrl}
                            alt="Post content"
                            className="w-full h-48 object-cover rounded-lg mb-3"
                          />
                        )}

                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {post.tags.map((tag: string, index: number) => (
                              <span 
                                key={index}
                                className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex space-x-4">
                            <button 
                              onClick={() => likePostMutation.mutate(post.id)}
                              className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors"
                            >
                              <Heart className="h-4 w-4" />
                              <span className="text-sm">{post.likes}</span>
                            </button>
                            <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors">
                              <MessageCircle className="h-4 w-4" />
                              <span className="text-sm">{post.comments}</span>
                            </button>
                            <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors">
                              <Share className="h-4 w-4" />
                              <span className="text-sm">Share</span>
                            </button>
                          </div>
                          <button className="text-gray-400 hover:text-gray-600 transition-colors">
                            <Bookmark className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Post Input */}
            <div className="p-4 border-t border-gray-100 bg-white">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  You
                </div>
                <div className="flex-1">
                  <Textarea
                    placeholder="Share something with the community..."
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    className="resize-none"
                    rows={3}
                  />
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex space-x-2">
                      <Button size="sm" variant="ghost" className="p-2 text-gray-400 hover:text-blue-600">
                        <Image className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="p-2 text-gray-400 hover:text-blue-600">
                        <Code className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="p-2 text-gray-400 hover:text-blue-600">
                        <Link className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button 
                      onClick={handleCreatePost}
                      disabled={!postContent.trim() || createPostMutation.isPending}
                      className="bg-blue-500 hover:bg-blue-600 font-medium"
                    >
                      Post
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
        </section>
      </div>
    </div>
  );
}
