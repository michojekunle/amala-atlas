"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Send,
  Mic,
  MicOff,
  MapPin,
  Star,
  CheckCircle,
  Search,
  Bot,
  Lightbulb,
  Navigation,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface Message {
  id: string;
  content: string;
  sender: "user" | "agent";
  timestamp: Date;
  type?: "text" | "location_suggestion" | "search_results" | "recommendation";
  data?: any;
}

interface LocationSuggestion {
  id: string;
  name: string;
  address: string;
  description: string;
  rating: number;
  priceRange: string;
  cuisine: string[];
  distance: string;
  confidence: number;
}

export default function AIAssistantPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content:
        "Hello! I'm your AI-powered Amala assistant. I can help you discover authentic Amala spots, get personalized recommendations, verify locations, and answer questions about Nigerian cuisine. What would you like to explore today?",
      sender: "agent",
      timestamp: new Date(),
      type: "text",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const quickActions = [
    { text: "Find Amala spots near me", icon: MapPin, category: "search" },
    { text: "What makes authentic Amala?", icon: Lightbulb, category: "info" },
    {
      text: "Best rated Amala restaurants",
      icon: Star,
      category: "recommendations",
    },
    {
      text: "Submit a new location",
      icon: CheckCircle,
      category: "contribute",
    },
    { text: "Traditional vs modern Amala", icon: Bot, category: "info" },
    { text: "Amala with gbegiri and ewedu", icon: Search, category: "search" },
  ];

  const conversationStarters = [
    "I'm craving authentic Amala, where should I go?",
    "What's the difference between traditional and modern Amala preparation?",
    "Can you help me find family-friendly Amala spots?",
    "I want to try Amala for the first time, any recommendations?",
    "Are there any Amala spots with live music or cultural events?",
    "What should I order with my Amala?",
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition =
        window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();

      if (recognitionRef.current) {
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = "en-US";

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputValue(transcript);
          setIsRecording(false);
        };

        recognitionRef.current.onerror = () => {
          setIsRecording(false);
        };

        recognitionRef.current.onend = () => {
          setIsRecording(false);
        };
      }
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isSending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
      type: "text",
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue("");
    setIsSending(true);

    try {
      console.log(" Sending AI assistant message:", currentInput);

      const response = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: currentInput,
          context: "ai_assistant",
          conversationHistory: messages.slice(-5), // Last 5 messages for context
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(" AI assistant response:", data);

        const agentMessage: Message = {
          id: (Date.now() + 1).toString(),
          content:
            data.response ||
            "I'm here to help you discover amazing Amala spots!",
          sender: "agent",
          timestamp: new Date(),
          type: data.type || "text",
          data: data.data,
        };

        setMessages((prev) => [...prev, agentMessage]);
      } else {
        throw new Error("Failed to get AI response");
      }
    } catch (error) {
      console.error(" AI assistant error:", error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "I'm having trouble connecting right now. Please try again or browse the existing Amala spots on the main page.",
        sender: "agent",
        timestamp: new Date(),
        type: "text",
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const handleQuickAction = (actionText: string) => {
    setInputValue(actionText);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const renderMessageContent = (message: Message) => {
    const content = message.content.replace(
      /\*\*(.*?)\*\*/g,
      "<strong>$1</strong>"
    );

    if (message.type === "location_suggestion" && message.data?.suggestions) {
      return (
        <div className="space-y-3">
          <div
            dangerouslySetInnerHTML={{ __html: content }}
            className="whitespace-pre-wrap mb-4"
          />
          <div className="grid gap-3">
            {message.data.suggestions
              .slice(0, 3)
              .map((spot: LocationSuggestion, index: number) => (
                <Card key={index} className="border border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-sm">{spot.name}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {spot.confidence}% match
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {spot.address}
                    </p>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {spot.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-xs">
                        <span className="flex items-center">
                          <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                          {spot.rating}
                        </span>
                        <span>{spot.priceRange}</span>
                        <span className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {spot.distance}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs bg-transparent"
                      >
                        <Navigation className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      );
    }

    return (
      <div
        dangerouslySetInnerHTML={{ __html: content }}
        className="whitespace-pre-wrap"
      />
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="text-foreground hover:bg-accent"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-sm">
                  <Bot className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-heading font-bold text-foreground">
                    AI Assistant
                  </h1>
                  <p className="text-caption hidden sm:block">
                    Your intelligent Amala discovery companion
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="hidden sm:flex">
                <Sparkles className="h-3 w-3 mr-1" />
                Powered by AI
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chat">AI Chat</TabsTrigger>
            <TabsTrigger value="discover">Discover</TabsTrigger>
            <TabsTrigger value="learn">Learn</TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="space-y-6">
            <Card className="h-[600px] lg:min-h-[80vh] flex flex-col">
              <CardHeader className="pb-3 border-b border-border">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-card-foreground">
                      Amala AI Assistant
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Ask me anything about Amala spots and Nigerian cuisine
                    </p>
                  </div>
                </div>
              </CardHeader>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex",
                      message.sender === "user"
                        ? "justify-end"
                        : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-4 py-3 shadow-sm animate-fade-in",
                        message.sender === "user"
                          ? "bg-primary text-primary-foreground ml-4 rounded-br-md"
                          : "bg-card text-card-foreground border border-border mr-4 rounded-bl-md"
                      )}
                    >
                      {renderMessageContent(message)}
                      <div
                        className={cn(
                          "text-xs mt-2 opacity-70",
                          message.sender === "user"
                            ? "text-primary-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}

                {isSending && (
                  <div className="flex justify-start">
                    <div className="bg-card text-card-foreground border border-border rounded-2xl rounded-bl-md px-4 py-3 mr-4 animate-fade-in">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-primary rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-primary rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          AI is thinking...
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {messages.length === 1 && (
                <div className="px-4 pb-2 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-3 mt-3">
                    Quick actions:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {quickActions.map((action, index) => {
                      const IconComponent = action.icon;
                      return (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickAction(action.text)}
                          className="text-xs border-border hover:bg-accent hover:text-accent-foreground justify-start"
                        >
                          <IconComponent className="h-3 w-3 mr-2" />
                          {action.text}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="p-4 border-t border-border">
                <div className="flex items-end space-x-2">
                  <div className="flex-1">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask about Amala spots, cuisine, or get recommendations..."
                      className="resize-none bg-background border-border focus:ring-primary rounded-xl"
                      disabled={isSending}
                    />
                  </div>

                  <Button
                    onClick={toggleRecording}
                    variant="outline"
                    size="icon"
                    className={cn(
                      "shrink-0 rounded-xl border-border",
                      isRecording &&
                        "bg-destructive text-destructive-foreground hover:bg-destructive/90 border-destructive"
                    )}
                    disabled={isSending}
                  >
                    {isRecording ? (
                      <MicOff className="h-4 w-4" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>

                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isSending}
                    className="shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>

                {isRecording && (
                  <div className="mt-3 text-sm text-muted-foreground flex items-center justify-center bg-muted rounded-lg py-2">
                    <div className="w-2 h-2 bg-destructive rounded-full animate-pulse mr-2"></div>
                    Listening... Ask me about Amala spots
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="discover" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <h3 className="font-semibold flex items-center">
                    <Search className="h-5 w-5 mr-2 text-primary" />
                    Smart Search
                  </h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Use natural language to find exactly what you're craving
                  </p>
                  <div className="space-y-2">
                    {conversationStarters.slice(0, 3).map((starter, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setActiveTab("chat");
                          setInputValue(starter);
                        }}
                        className="w-full justify-start text-xs h-auto py-2 px-3"
                      >
                        "{starter}"
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="font-semibold flex items-center">
                    <Star className="h-5 w-5 mr-2 text-primary" />
                    Personalized Recommendations
                  </h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Get AI-powered suggestions based on your preferences
                  </p>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setActiveTab("chat");
                        setInputValue(
                          "Recommend Amala spots based on my preferences"
                        );
                      }}
                      className="w-full"
                    >
                      Get Recommendations
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setActiveTab("chat");
                        setInputValue(
                          "What's trending in Amala spots this week?"
                        );
                      }}
                      className="w-full"
                    >
                      What's Trending
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="learn" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <h3 className="font-semibold flex items-center">
                    <Lightbulb className="h-5 w-5 mr-2 text-primary" />
                    About Amala
                  </h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Learn about authentic Amala preparation, ingredients, and
                    cultural significance
                  </p>
                  <div className="space-y-2">
                    {[
                      "What makes authentic Amala?",
                      "Traditional vs modern preparation",
                      "Best accompaniments for Amala",
                      "Regional variations of Amala",
                    ].map((topic, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setActiveTab("chat");
                          setInputValue(topic);
                        }}
                        className="w-full justify-start text-xs"
                      >
                        {topic}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="font-semibold flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-primary" />
                    Quality Guidelines
                  </h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Understand what makes a great Amala spot and how we verify
                    authenticity
                  </p>
                  <div className="space-y-2">
                    {[
                      "How do we verify Amala spots?",
                      "What to look for in authentic restaurants",
                      "Community standards and guidelines",
                      "How to contribute quality reviews",
                    ].map((topic, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setActiveTab("chat");
                          setInputValue(topic);
                        }}
                        className="w-full justify-start text-xs"
                      >
                        {topic}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
