import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest } from "@/lib/queryClient";
import { Search, Heart, MessageCircle, Share, Bookmark, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";

interface DiscoverySectionProps {
  currentUser: { id: number; username: string };
}

export default function DiscoverySection({ currentUser }: DiscoverySectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"trending" | "latest" | "popular">("trending");
  const queryClient = useQueryClient();

  const { data: posts } = useQuery({
    queryKey: activeFilter === "trending" ? ["/api/posts/trending"] : ["/api/posts"],
  });

  const { data: users } = useQuery({
    queryKey: ["/api/users"],
  });

  const likePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      return apiRequest("PATCH", `/api/posts/${postId}/like`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts/trending"] });
    },
  });

  const filteredPosts = posts?.filter((post: any) =>
    post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const trendingTopics = [
    { tag: "#WebDevelopment", count: "1.2k posts", description: "Latest frameworks and tools" },
    { tag: "#AIInnovation", count: "856 posts", description: "Machine learning breakthroughs" },
    { tag: "#StartupLife", count: "623 posts", description: "Entrepreneurship stories" },
  ];

  const suggestedUsers = users?.slice(0, 2).map(user => ({
    ...user,
    role: user.bio || "Developer"
  }));

  return (
    <section className="flex-1 flex bg-white">
      <div className="w-full max-w-2xl mx-auto">
        <div className="p-4 border-b border-gray-100 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Discover</h2>
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant={activeFilter === "trending" ? "default" : "ghost"}
                onClick={() => setActiveFilter("trending")}
                className={activeFilter === "trending" ? "bg-green-500 hover:bg-green-600" : ""}
              >
                Trending
              </Button>
              <Button
                size="sm"
                variant={activeFilter === "latest" ? "default" : "ghost"}
                onClick={() => setActiveFilter("latest")}
              >
                Latest
              </Button>
              <Button
                size="sm"
                variant={activeFilter === "popular" ? "default" : "ghost"}
                onClick={() => setActiveFilter("popular")}
              >
                Popular
              </Button>
            </div>
          </div>
          <div className="relative">
            <Input
              type="text"
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-6">
            {filteredPosts?.map((post: any) => (
              <article key={post.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover-lift">
                <div className="flex items-start space-x-3 mb-4">
                  <img 
                    src={post.user?.avatar || `https://images.unsplash.com/photo-1517841905240-472988babdf9?w=60&h=60&fit=crop&crop=face`}
                    alt={post.user?.username || 'User'}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-semibold text-gray-900">{post.user?.username || 'User'}</span>
                      <span className="text-green-600 text-sm font-medium">@{post.user?.username || 'user'}</span>
                      <span className="text-gray-500 text-sm">
                        • {format(new Date(post.createdAt), 'h:mm a')}
                      </span>
                      {post.isTrending && (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                          Trending
                        </span>
                      )}
                    </div>
                    {post.title && (
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
                    )}
                    <p className="text-gray-600 mb-4">{post.content}</p>
                    
                    {post.imageUrl && (
                      <img 
                        src={post.imageUrl}
                        alt="Post content"
                        className="w-full h-64 object-cover rounded-lg mb-4"
                      />
                    )}
                    
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
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
                      <div className="flex space-x-6">
                        <button 
                          onClick={() => likePostMutation.mutate(post.id)}
                          className="flex items-center space-x-2 text-gray-500 hover:text-green-600 transition-colors"
                        >
                          <Heart className="h-4 w-4" />
                          <span className="text-sm">{post.likes}</span>
                        </button>
                        <button className="flex items-center space-x-2 text-gray-500 hover:text-green-600 transition-colors">
                          <MessageCircle className="h-4 w-4" />
                          <span className="text-sm">{post.comments}</span>
                        </button>
                        <button className="flex items-center space-x-2 text-gray-500 hover:text-green-600 transition-colors">
                          <Share className="h-4 w-4" />
                          <span className="text-sm">Share</span>
                        </button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="text-gray-400 hover:text-gray-600 transition-colors">
                          <Bookmark className="h-4 w-4" />
                        </button>
                        <button className="text-gray-400 hover:text-gray-600 transition-colors">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Right Sidebar for Discovery */}
      <div className="hidden xl:block xl:w-80 border-l border-gray-200 bg-gray-50">
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Trending Topics</h3>
          <div className="space-y-3">
            {trendingTopics.map((topic, index) => (
              <div key={index} className="bg-white p-3 rounded-lg hover:shadow-sm transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{topic.tag}</span>
                  <span className="text-sm text-gray-500">{topic.count}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{topic.description}</p>
              </div>
            ))}
          </div>

          <h3 className="font-semibold text-gray-900 mb-4 mt-6">Suggested Connections</h3>
          <div className="space-y-3">
            {suggestedUsers?.map((user) => (
              <div key={user.id} className="flex items-center space-x-3 p-3 bg-white rounded-lg hover:shadow-sm transition-shadow">
                <img 
                  src={user.avatar || `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face`}
                  alt={user.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{user.username}</p>
                  <p className="text-sm text-gray-500 truncate">{user.role}</p>
                </div>
                <Button size="sm" className="bg-green-500 hover:bg-green-600">
                  Follow
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
