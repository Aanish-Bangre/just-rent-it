"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Users, MessageSquare, LogOut } from "lucide-react";
import axios from "axios";
import { useAuth } from "@/hooks/useAuth";

const socket = io("http://localhost:8080");

// Add connection debugging
socket.on("connect", () => {
  console.log("Connected to Socket.IO server");
});

socket.on("disconnect", () => {
  console.log("Disconnected from Socket.IO server");
});

socket.on("connect_error", (error) => {
  console.error("Socket.IO connection error:", error);
});

interface Message {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: string;
}

interface User {
  id: string;
  username: string;
}

export default function ChatPage() {
  const params = useParams();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const roomId = params.chatId as string; // Get room ID from params
  
  const [username, setUsername] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchUserAndJoinChat = async () => {
      try {
        // Get current user info
        const userResponse = await axios.get("/api/profileSetup");
        if (userResponse.data.success && userResponse.data.data.documents?.length > 0) {
          const user = userResponse.data.data.documents[0];
          setUsername(user.userName || `User_${Math.random().toString(36).substr(2, 6)}`);
        } else {
          setUsername(`User_${Math.random().toString(36).substr(2, 6)}`);
        }
        
        // Auto-join the chat room
        setTimeout(() => {
          joinRoom();
        }, 1000);
        
      } catch (error) {
        console.error("Error fetching user:", error);
        setUsername(`User_${Math.random().toString(36).substr(2, 6)}`);
        setTimeout(() => {
          joinRoom();
        }, 1000);
      } finally {
        setLoading(false);
      }
    };

    if (roomId) {
      fetchUserAndJoinChat();
    }

    console.log("Setting up socket listeners...");

    // Socket event listeners
    socket.on("room-joined", ({ roomId, users, message }) => {
      setIsJoined(true);
      setUsers(users);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        userId: "system",
        username: "System",
        message,
        timestamp: new Date().toISOString()
      }]);
      setError(null);
    });

    socket.on("user-joined", ({ userId, username, message }) => {
      setUsers(prev => [...prev, { id: userId, username }]);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        userId: "system",
        username: "System",
        message,
        timestamp: new Date().toISOString()
      }]);
    });

    socket.on("user-left", ({ userId, username, message }) => {
      setUsers(prev => prev.filter(user => user.id !== userId));
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        userId: "system",
        username: "System",
        message,
        timestamp: new Date().toISOString()
      }]);
    });

    socket.on("new-message", (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on("room-left", ({ message }) => {
      setIsJoined(false);
      setMessages([]);
      setUsers([]);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        userId: "system",
        username: "System",
        message,
        timestamp: new Date().toISOString()
      }]);
    });

    socket.on("error", ({ message }) => {
      setError(message);
    });

    return () => {
      socket.off("room-joined");
      socket.off("user-joined");
      socket.off("user-left");
      socket.off("new-message");
      socket.off("room-left");
      socket.off("error");
    };
  }, [username, roomId]);

  const joinRoom = () => {
    if (!roomId.trim() || !username.trim()) {
      setError("Please enter both room ID and username");
      return;
    }

    console.log("Joining room:", { roomId: roomId.trim(), username: username.trim() });
    socket.emit("join-room", { roomId: roomId.trim(), username: username.trim() });
  };

  const leaveRoom = () => {
    socket.emit("leave-room");
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !isJoined) return;

    socket.emit("send-message", { roomId, message: newMessage.trim() });
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="text-lg font-medium">Checking authentication...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="text-red-600 font-medium text-xl mb-4">Please log in to access the chat</div>
            <Button onClick={() => window.location.href = '/login'} className="bg-blue-600 hover:bg-blue-700">
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="text-lg font-medium">Loading chat...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        {!isJoined ? (
          <div className="text-center py-12">
            <div className="text-lg font-medium">Joining chat room...</div>
            <div className="text-sm text-gray-600 mt-2">Please wait while we connect you to the chat.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Chat Area */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Room: {roomId}
                    </CardTitle>
                    <Button onClick={leaveRoom} variant="outline" size="sm">
                      <LogOut className="h-4 w-4 mr-2" />
                      Leave
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Messages */}
                  <div className="h-96 overflow-y-auto border rounded-lg p-4 mb-4 bg-gray-50 dark:bg-gray-800">
                    {messages.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        No messages yet. Start chatting!
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.userId === "system" ? "justify-center" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-xs px-3 py-2 rounded-lg ${
                                msg.userId === "system"
                                  ? "bg-gray-200 text-gray-600 text-center text-sm"
                                  : msg.userId === socket.id
                                  ? "bg-blue-500 text-white ml-auto"
                                  : "bg-gray-200 text-gray-800"
                              }`}
                            >
                              {msg.userId !== "system" && (
                                <div className="text-xs opacity-75 mb-1">
                                  {msg.username} • {formatTime(msg.timestamp)}
                                </div>
                              )}
                              <div>{msg.message}</div>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>
                  
                  {/* Message Input */}
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      disabled={!isJoined}
                    />
                    <Button onClick={sendMessage} disabled={!newMessage.trim() || !isJoined}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Users Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Users ({users.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {users.map((user) => (
                      <div key={user.id} className="flex items-center gap-2 p-2 rounded bg-gray-50 dark:bg-gray-800">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {user.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{user.username}</div>
                          {user.id === socket.id && (
                            <Badge variant="secondary" className="text-xs">You</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}