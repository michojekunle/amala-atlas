"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Mic, MicOff, MapPin, Star, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SpeechRecognition } from "web-speech-api"

interface Message {
  id: string
  content: string
  sender: "user" | "agent"
  timestamp: Date
  type?: "text" | "location_submission" | "verification" | "suggestion"
}

interface ChatInterfaceProps {
  onLocationSubmit?: (locationData: any) => void
  onLocationVerify?: (locationId: string, verified: boolean) => void
  className?: string
}

export function ChatInterface({ onLocationSubmit, onLocationVerify, className = "" }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Welcome to Amala Finder! 🍽️ I'm here to help you discover and share authentic Amala spots. You can ask me about nearby locations, submit new restaurants, or get recommendations!",
      sender: "agent",
      timestamp: new Date(),
      type: "text",
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  const quickActions = [
    { text: "Find nearby Amala spots", icon: MapPin },
    { text: "Submit a new location", icon: Star },
    { text: "Verify a restaurant", icon: CheckCircle },
  ]

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
      recognitionRef.current = new SpeechRecognition()

      if (recognitionRef.current) {
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = false
        recognitionRef.current.lang = "en-US"

        recognitionRef.current.onresult = (event) => {
          const transcript = event.results[0][0].transcript
          setInputValue(transcript)
          setIsRecording(false)
        }

        recognitionRef.current.onerror = () => {
          setIsRecording(false)
        }

        recognitionRef.current.onend = () => {
          setIsRecording(false)
        }
      }
    }
  }, [])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isSending) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
      type: "text",
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsSending(true)

    try {
      // Simulate API call to chat endpoint
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: inputValue,
          context: "amala_locations",
        }),
      })

      if (response.ok) {
        const data = await response.json()

        const agentMessage: Message = {
          id: (Date.now() + 1).toString(),
          content:
            data.response ||
            "I understand you want to help with Amala locations. Could you provide more details about the location you'd like to submit or verify?",
          sender: "agent",
          timestamp: new Date(),
          type: data.type || "text",
        }

        setMessages((prev) => [...prev, agentMessage])

        // Handle special message types
        if (data.type === "location_submission" && data.locationData && onLocationSubmit) {
          onLocationSubmit(data.locationData)
        }
      } else {
        throw new Error("Failed to send message")
      }
    } catch (error) {
      console.error("Error sending message:", error)

      // Fallback response
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm having trouble connecting right now. Please try again or provide the location details directly.",
        sender: "agent",
        timestamp: new Date(),
        type: "text",
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsSending(false)
    }
  }

  const handleQuickAction = (actionText: string) => {
    setInputValue(actionText)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in your browser.")
      return
    }

    if (isRecording) {
      recognitionRef.current.stop()
      setIsRecording(false)
    } else {
      recognitionRef.current.start()
      setIsRecording(true)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const renderMessageContent = (message: Message) => {
    // Simple markdown-like rendering for bold text
    const content = message.content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")

    return <div dangerouslySetInnerHTML={{ __html: content }} className="whitespace-pre-wrap" />
  }

  return (
    <div className={`flex flex-col h-full bg-background ${className}`}>
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <MapPin className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-card-foreground">Amala Assistant</h2>
            <p className="text-xs text-muted-foreground">Your guide to authentic Amala spots</p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={cn("flex", message.sender === "user" ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-3 shadow-sm animate-fade-in",
                message.sender === "user"
                  ? "bg-primary text-primary-foreground ml-4 rounded-br-md"
                  : "bg-card text-card-foreground border border-border mr-4 rounded-bl-md",
              )}
            >
              {renderMessageContent(message)}
              <div
                className={cn(
                  "text-xs mt-2 opacity-70",
                  message.sender === "user" ? "text-primary-foreground" : "text-muted-foreground",
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
                <span className="text-sm text-muted-foreground">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {messages.length === 1 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-muted-foreground mb-2">Quick actions:</p>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon
              return (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction(action.text)}
                  className="text-xs border-border hover:bg-accent hover:text-accent-foreground"
                >
                  <IconComponent className="h-3 w-3 mr-1" />
                  {action.text}
                </Button>
              )
            })}
          </div>
        </div>
      )}

      <div className="p-4 border-t border-border bg-card">
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about Amala locations or describe a restaurant..."
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
              isRecording && "bg-destructive text-destructive-foreground hover:bg-destructive/90 border-destructive",
            )}
            disabled={isSending}
          >
            {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
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
            Listening... Speak clearly about the Amala location
          </div>
        )}
      </div>
    </div>
  )
}
