import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Conversation, Message } from "@shared/schema";
import { format } from "date-fns";
import { Bot, Send, User } from "lucide-react";

export default function ConversationManager() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: conversations = [], isLoading } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
  });

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ["/api/conversations", selectedConversation?.id, "messages"],
    enabled: !!selectedConversation,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { conversationId: number; content: string }) => {
      const response = await apiRequest("POST", `/api/conversations/${data.conversationId}/messages`, {
        content: data.content,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/conversations", selectedConversation?.id, "messages"] 
      });
      setNewMessage("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const toggleAIMutation = useMutation({
    mutationFn: async (data: { conversationId: number; aiEnabled: boolean }) => {
      const response = await apiRequest("PUT", `/api/conversations/${data.conversationId}`, {
        aiEnabled: data.aiEnabled,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update AI settings",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversation || !newMessage.trim()) return;

    sendMessageMutation.mutate({
      conversationId: selectedConversation.id,
      content: newMessage,
    });
  };

  const handleToggleAI = (conversationId: number, aiEnabled: boolean) => {
    toggleAIMutation.mutate({ conversationId, aiEnabled });
  };

  const filteredConversations = conversations.filter(conv =>
    conv.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.phoneNumber.includes(searchTerm)
  );

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Live Conversations
        </CardTitle>
        <p className="text-sm text-gray-500">
          Monitor and manage ongoing WhatsApp conversations
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 h-96">
          {/* Conversation List */}
          <div className="border-r border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search conversations..."
                className="text-sm"
              />
            </div>
            <div className="overflow-y-auto h-full">
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">Loading conversations...</div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No conversations found
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer ${
                      selectedConversation?.id === conversation.id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 text-blue-800 rounded-full w-10 h-10 flex items-center justify-center text-sm font-medium">
                          {getInitials(conversation.customerName || 'Unknown')}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {conversation.customerName || 'Unknown Customer'}
                          </p>
                          <p className="text-xs text-gray-500">{conversation.phoneNumber}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {format(new Date(conversation.lastMessageAt), 'MMM d, h:mm a')}
                        </p>
                        <Badge
                          variant={conversation.status === 'active' ? 'default' : 'secondary'}
                          className="mt-1"
                        >
                          {conversation.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Message Thread */}
          <div className="lg:col-span-2 flex flex-col">
            {selectedConversation ? (
              <>
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 text-blue-800 rounded-full w-10 h-10 flex items-center justify-center text-sm font-medium">
                        {getInitials(selectedConversation.customerName || 'Unknown')}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedConversation.customerName || 'Unknown Customer'}
                        </p>
                        <p className="text-xs text-gray-500">{selectedConversation.phoneNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={selectedConversation.aiEnabled ? 'default' : 'secondary'}>
                        {selectedConversation.aiEnabled ? 'AI Active' : 'AI Disabled'}
                      </Badge>
                      <Switch
                        checked={selectedConversation.aiEnabled}
                        onCheckedChange={(checked) => 
                          handleToggleAI(selectedConversation.id, checked)
                        }
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500">No messages yet</div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex items-start space-x-3 message-bubble ${
                          message.sender === 'customer' ? '' : 'justify-end'
                        }`}
                      >
                        {message.sender === 'customer' ? (
                          <>
                            <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center text-xs font-medium">
                              <User className="h-4 w-4" />
                            </div>
                            <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                              <p className="text-sm text-gray-900">{message.content}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {format(new Date(message.createdAt), 'h:mm a')}
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="bg-primary text-white rounded-lg p-3 max-w-xs">
                              {message.sender === 'ai' && (
                                <div className="flex items-center space-x-2 mb-1">
                                  <Bot className="h-3 w-3" />
                                  <span className="text-xs opacity-75">AI Response</span>
                                </div>
                              )}
                              <p className="text-sm">{message.content}</p>
                              <p className="text-xs opacity-75 mt-1">
                                {format(new Date(message.createdAt), 'h:mm a')}
                              </p>
                            </div>
                            <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-medium">
                              {message.sender === 'ai' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>
                
                <div className="p-4 border-t border-gray-200">
                  <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1"
                    />
                    <Button
                      type="submit"
                      className="bg-primary hover:bg-blue-600"
                      disabled={sendMessageMutation.isPending || !newMessage.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Select a conversation to view messages
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
