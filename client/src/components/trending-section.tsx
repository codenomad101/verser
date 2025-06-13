import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Hash, MessageCircle, Heart, Share, Repeat2, Flame } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface TrendingTopic {
  id: number;
  topic: string;
  postCount: number;
  isHot: boolean;
  category: string;
}

interface TrendingPost {
  id: number;
  content: string;
  likes: number;
  reposts: number;
  comments: number;
  isVerified?: boolean;
  username: string;
  sentiment: string;
}

export default function TrendingSection() {
  const { data: trendingTopics = [] } = useQuery<TrendingTopic[]>({
    queryKey: ["/api/trending/topics"],
    queryFn: async () => {
      // Mock trending topics for now - you could connect to real APIs later
      return [
        { id: 1, topic: "#WebDevelopment", postCount: 1234, isHot: true, category: "tech" },
        { id: 2, topic: "#AI", postCount: 987, isHot: true, category: "tech" },
        { id: 3, topic: "#React", postCount: 756, isHot: false, category: "programming" },
        { id: 4, topic: "#Design", postCount: 543, isHot: false, category: "creative" },
        { id: 5, topic: "#Startup", postCount: 432, isHot: true, category: "business" },
      ];
    },
  });

  const { data: trendingPosts = [] } = useQuery<TrendingPost[]>({
    queryKey: ["/api/posts/trending"],
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "tech": return "bg-blue-100 text-blue-800";
      case "programming": return "bg-green-100 text-green-800";
      case "creative": return "bg-purple-100 text-purple-800";
      case "business": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive": return "text-green-600";
      case "negative": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* Trending Topics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            <span>What's Trending</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {trendingTopics.map((topic, index) => (
              <div key={topic.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500 font-medium">#{index + 1}</span>
                    {topic.isHot && <Flame className="h-4 w-4 text-orange-500" />}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <Hash className="h-4 w-4 text-blue-500" />
                      <span className="font-semibold">{topic.topic.slice(1)}</span>
                      <Badge className={getCategoryColor(topic.category)}>
                        {topic.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{topic.postCount.toLocaleString()} posts</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <TrendingUp className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hot Posts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Flame className="h-5 w-5 text-red-500" />
            <span>Hot Posts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trendingPosts.map((post) => (
              <div key={post.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {post.username[0].toUpperCase()}
                    </div>
                    <span className="font-semibold">{post.username}</span>
                    {post.isVerified && (
                      <Badge className="bg-blue-500 text-white">✓</Badge>
                    )}
                  </div>
                  <span className={`text-sm ${getSentimentColor(post.sentiment)}`}>
                    {post.sentiment}
                  </span>
                </div>
                
                <p className="text-gray-800 mb-3">{post.content}</p>
                
                <div className="flex items-center justify-between text-gray-600">
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-1 hover:text-red-500 transition-colors">
                      <Heart className="h-4 w-4" />
                      <span className="text-sm">{post.likes}</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-green-500 transition-colors">
                      <Repeat2 className="h-4 w-4" />
                      <span className="text-sm">{post.reposts}</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-blue-500 transition-colors">
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-sm">{post.comments}</span>
                    </button>
                  </div>
                  <button className="flex items-center space-x-1 hover:text-blue-500 transition-colors">
                    <Share className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top News */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-red-500" />
            <span>Top News</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { title: "Tech Giants Report Strong Q4 Earnings", url: "https://techcrunch.com", source: "TechCrunch", category: "tech" },
              { title: "AI Breakthrough in Medical Research", url: "https://news.google.com", source: "Google News", category: "tech" },
              { title: "New Social Media Trends for 2025", url: "https://bbc.com/news", source: "BBC News", category: "social" },
              { title: "Startup Funding Hits Record High", url: "https://reuters.com", source: "Reuters", category: "business" },
              { title: "Climate Tech Innovation Summit", url: "https://techcrunch.com", source: "TechCrunch", category: "environment" }
            ].map((news, index) => (
              <a 
                key={index}
                href={news.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 hover:text-blue-600 line-clamp-2">
                      {news.title}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <p className="text-xs text-gray-500">{news.source}</p>
                      <Badge className={getCategoryColor(news.category)} variant="secondary">
                        {news.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}