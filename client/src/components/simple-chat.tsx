import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Search, Plus, ArrowLeft } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import NewChatDialog from "@/components/new-chat-dialog";

interface SimpleChatProps {
  currentUser: { id: number; username: string };
  lastMessage: any;
  sendMessage: (message: any) => void;
}

export default function SimpleChat({ currentUser, lastMessage, sendMessage }: SimpleChatProps) {
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: conversations = [] } = useQuery({
    queryKey: ["/api/conversations"],
    select: (data) => Array.isArray(data) ? data : [],
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["/api/conversations", selectedConversation, "messages"],
    enabled: !!selectedConversation,
    select: (data) => Array.isArray(data) ? data : [],
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
    select: (data) => Array.isArray(data) ? data : [],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      const response = await apiRequest("POST", "/api/messages", messageData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", selectedConversation, "messages"] });
      setMessageText("");
    },
  });

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
    return conversation.name || "Unknown";
  };

  const filteredConversations = conversations.filter((conv: any) =>
    getConversationName(conv).toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
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
      </div>

      <div className="h-full flex bg-gradient-to-br from-white via-blue-50 to-purple-50">
        {/* Conversations List */}
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
              onConversationCreated={(id) => {
                setSelectedConversation(id);
                setShowNewChatDialog(false);
              }}
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
                          <h3 className="font-semibold text-sm truncate">{conversationName}</h3>
                          <span className="text-xs text-gray-500">2m</span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">Click to start chatting...</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className={`${selectedConversation ? 'flex w-full md:flex-1' : 'hidden md:flex md:flex-1'} flex-col`}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
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
                        {getConversationName(conversations.find((c: any) => c.id === selectedConversation))[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{getConversationName(conversations.find((c: any) => c.id === selectedConversation))}</h3>
                      <p className="text-sm text-gray-600">Online</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message: any) => {
                    const isOwn = message.userId === currentUser.id;
                    
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`max-w-xs lg:max-w-md`}>
                          <div
                            className={`p-3 rounded-lg ${
                              isOwn
                                ? "bg-blue-500 text-white"
                                : "bg-gray-100 text-gray-900"
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                          </div>
                          <p className={`text-xs text-gray-500 mt-1 ${isOwn ? "text-right" : "text-left"}`}>
                            {format(new Date(message.createdAt), 'HH:mm')}
                          </p>
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
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Type a message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="pr-10"
                    />
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
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a conversation</h3>
                <p className="text-gray-600">Choose a conversation from the sidebar to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}