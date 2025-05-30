import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Smile, Paperclip, Phone, Video, MoreVertical, Search, Hash, Plus, ArrowLeft } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import NewChatDialog from "@/components/new-chat-dialog";

interface ChatSectionProps {
  currentUser: { id: number; username: string };
  lastMessage: any;
  sendMessage: (message: any) => void;
}

export default function EnhancedChatSection({ currentUser, lastMessage, sendMessage }: ChatSectionProps) {
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { data: conversations = [] } = useQuery({
    queryKey: ["/api/conversations"],
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["/api/conversations", selectedConversation, "messages"],
    enabled: !!selectedConversation,
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      return apiRequest("POST", "/api/messages", messageData);
    },
    onSuccess: (newMessage) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", selectedConversation, "messages"] });
      sendMessage(newMessage);
      setMessageText("");
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (lastMessage && lastMessage.conversationId === selectedConversation) {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", selectedConversation, "messages"] });
    }
  }, [lastMessage, selectedConversation, queryClient]);

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversation) return;

    sendMessageMutation.mutate({
      conversationId: selectedConversation,
      userId: currentUser.id,
      content: messageText,
      type: "text",
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getConversationName = (conversation: any) => {
    if (conversation.type === "direct") {
      // For direct messages, show the other user's name
      const otherUserId = conversation.name.split("-").find((id: string) => parseInt(id) !== currentUser.id);
      const otherUser = users.find((u: any) => u.id === parseInt(otherUserId || "0"));
      return otherUser?.username || "Unknown User";
    }
    return conversation.name;
  };

  const getLastMessage = (conversationId: number) => {
    const conversationMessages = messages.filter((m: any) => m.conversationId === conversationId);
    return conversationMessages[conversationMessages.length - 1];
  };

  const filteredConversations = conversations.filter((conv: any) =>
    getConversationName(conv).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConv = conversations.find((c: any) => c.id === selectedConversation);

  return (
    <div className="h-full flex flex-col">
      {/* Compact Profile Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 border-2 border-white/30">
            <AvatarFallback className="bg-white/20 text-white text-sm font-semibold">
              {currentUser.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-sm">{currentUser.username}</h3>
            <p className="text-xs text-blue-100">Chat Messages</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isMobile && (
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20 p-1 h-8 w-8"
              onClick={() => setShowNewChatDialog(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs">Online</span>
        </div>
      </div>

      <div className="h-full flex bg-gradient-to-br from-white via-blue-50 to-purple-50">
        {/* Conversations List - Full screen on mobile, sidebar on desktop */}
        <div className={`${selectedConversation ? 'hidden md:flex md:w-80' : 'flex w-full md:w-80'} border-r border-blue-200 flex-col bg-white/80 backdrop-blur-sm`}>
          <div className="p-4 border-b border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold gradient-text">Messages</h2>
              <Button 
                onClick={() => setShowNewChatDialog(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Chat
              </Button>
            </div>
            <NewChatDialog 
              open={showNewChatDialog}
              onOpenChange={setShowNewChatDialog}
              currentUser={currentUser}
              onConversationCreated={setSelectedConversation}
            />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {filteredConversations.map((conversation: any) => {
              const lastMsg = getLastMessage(conversation.id);
              const conversationName = getConversationName(conversation);
              const isSelected = selectedConversation === conversation.id;
              
              return (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    isSelected 
                      ? "bg-blue-50 border border-blue-200" 
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        {conversationName[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold truncate">{conversationName}</h4>
                        {lastMsg && (
                          <span className="text-xs text-gray-500">
                            {format(new Date(lastMsg.createdAt), 'HH:mm')}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 truncate">
                          {lastMsg ? lastMsg.content : "No messages yet"}
                        </p>
                        {conversation.type === "group" && (
                          <Badge variant="secondary" className="text-xs">
                            {conversation.memberCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area - Full screen on mobile when conversation selected */}
      <div className={`${selectedConversation ? 'flex w-full md:flex-1' : 'hidden md:flex md:flex-1'} flex-col`}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Back button for mobile */}
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="md:hidden p-1 h-8 w-8"
                    onClick={() => setSelectedConversation(null)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
                      {getConversationName(selectedConv)[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{getConversationName(selectedConv)}</h3>
                    <p className="text-sm text-gray-600">
                      {selectedConv?.type === "group" 
                        ? `${selectedConv.memberCount} members` 
                        : "Online"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="ghost">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages
                  .filter((m: any) => m.conversationId === selectedConversation)
                  .map((message: any) => {
                    const isOwn = message.userId === currentUser.id;
                    const sender = users.find((u: any) => u.id === message.userId);
                    
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isOwn ? "flex-row-reverse space-x-reverse" : ""}`}>
                          {!isOwn && (
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="bg-gray-500 text-white text-xs">
                                {sender?.username?.[0]?.toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          
                          <div className="space-y-1">
                            <div
                              className={`px-4 py-2 rounded-2xl ${
                                isOwn
                                  ? "bg-blue-500 text-white"
                                  : "bg-gray-100 text-gray-900"
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                            </div>
                            <p className={`text-xs text-gray-500 ${isOwn ? "text-right" : "text-left"}`}>
                              {format(new Date(message.createdAt), 'HH:mm')}
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
            <div className="p-4 border-t bg-white">
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="ghost">
                  <Paperclip className="h-4 w-4" />
                </Button>
                
                <div className="flex-1 relative">
                  <Input
                    placeholder="Type a message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pr-10"
                  />
                  <Button size="sm" variant="ghost" className="absolute right-1 top-1/2 transform -translate-y-1/2">
                    <Smile className="h-4 w-4" />
                  </Button>
                </div>
                
                <Button 
                  size="sm" 
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || sendMessageMutation.isPending}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* No Conversation Selected */
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Hash className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-600">Choose a conversation from the sidebar to start chatting</p>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* New Chat Dialog */}
      <NewChatDialog 
        open={showNewChatDialog}
        onOpenChange={setShowNewChatDialog}
        currentUser={currentUser}
        onChatCreated={(conversationId) => {
          setSelectedConversation(conversationId);
          setShowNewChatDialog(false);
        }}
      />
    </div>
  );
}