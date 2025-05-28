import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Search, Phone, Video, MoreVertical, Paperclip, Smile, Send } from "lucide-react";
import { format } from "date-fns";

interface ChatSectionProps {
  currentUser: { id: number; username: string };
  lastMessage: any;
  sendMessage: (message: any) => void;
}

export default function ChatSection({ currentUser, lastMessage, sendMessage }: ChatSectionProps) {
  const [activeConversation, setActiveConversation] = useState<number>(1);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: conversations } = useQuery({
    queryKey: ["/api/conversations"],
  });

  const { data: messages } = useQuery({
    queryKey: ["/api/conversations", activeConversation, "messages"],
    enabled: !!activeConversation,
  });

  const { data: users } = useQuery({
    queryKey: ["/api/users"],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { conversationId: number; userId: number; content: string }) => {
      return apiRequest("POST", "/api/messages", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", activeConversation, "messages"] });
      setMessageInput("");
    },
  });

  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage?.type === 'new_message') {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/conversations", lastMessage.message.conversationId, "messages"] 
      });
    }
  }, [lastMessage, queryClient]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !activeConversation) return;

    const messageData = {
      conversationId: activeConversation,
      userId: currentUser.id,
      content: messageInput.trim(),
    };

    // Send via WebSocket for real-time delivery
    sendMessage({
      type: 'send_message',
      ...messageData
    });

    // Also send via API for persistence
    sendMessageMutation.mutate(messageData);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const activeConversationData = conversations?.find(c => c.id === activeConversation);
  const filteredConversations = conversations?.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section className="flex-1 flex bg-white">
      {/* Chat List */}
      <div className="w-full lg:w-80 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
            <Button size="sm" variant="ghost" className="p-2 text-purple-600 hover:bg-purple-50">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {filteredConversations?.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => setActiveConversation(conversation.id)}
                className={`flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors ${
                  activeConversation === conversation.id ? 'border-l-4 border-purple-500 bg-purple-25' : ''
                }`}
              >
                <div className="relative">
                  <img 
                    src={conversation.avatar || `https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=100&h=100&fit=crop`} 
                    alt={conversation.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {conversation.memberCount > 1 && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-500 text-white text-xs rounded-full flex items-center justify-center">
                      {conversation.memberCount}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">{conversation.name}</p>
                    <span className="text-xs text-gray-500">2m</span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {conversation.description || "No messages yet"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Messages Area */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col">
        {activeConversationData && (
          <>
            <div className="p-4 border-b border-gray-100 bg-white">
              <div className="flex items-center space-x-3">
                <img 
                  src={activeConversationData.avatar || `https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=60&h=60&fit=crop`}
                  alt={activeConversationData.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{activeConversationData.name}</h3>
                  <p className="text-sm text-gray-500">
                    {activeConversationData.memberCount} members • 2 online
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="ghost" className="p-2 text-gray-400 hover:text-gray-600">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="p-2 text-gray-400 hover:text-gray-600">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="p-2 text-gray-400 hover:text-gray-600">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4 bg-gray-50">
              <div className="space-y-4">
                {messages?.map((message: any) => {
                  const isOwnMessage = message.userId === currentUser.id;
                  const user = message.user || users?.find(u => u.id === message.userId);
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex items-start space-x-3 ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}
                    >
                      {isOwnMessage ? (
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          You
                        </div>
                      ) : (
                        <img 
                          src={user?.avatar || `https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face`}
                          alt={user?.username || 'User'}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      )}
                      <div className={`flex-1 flex flex-col ${isOwnMessage ? 'items-end' : ''}`}>
                        <div className={`flex items-center space-x-2 mb-1 ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                          <span className="text-sm font-medium text-gray-900">
                            {isOwnMessage ? 'You' : user?.username || 'User'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {format(new Date(message.createdAt), 'h:mm a')}
                          </span>
                        </div>
                        <div className={`p-3 rounded-xl chat-bubble ${
                          isOwnMessage 
                            ? 'bg-purple-500 text-white' 
                            : 'bg-white shadow-sm'
                        }`}>
                          <p className={isOwnMessage ? 'text-white' : 'text-gray-800'}>
                            {message.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-100 bg-white">
              <div className="flex items-center space-x-3">
                <Button size="sm" variant="ghost" className="p-2 text-gray-400 hover:text-purple-600">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <div className="flex-1 relative">
                  <Input
                    type="text"
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pr-12"
                  />
                  <Button size="sm" variant="ghost" className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-purple-600">
                    <Smile className="h-4 w-4" />
                  </Button>
                </div>
                <Button 
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || sendMessageMutation.isPending}
                  className="bg-purple-500 hover:bg-purple-600"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
